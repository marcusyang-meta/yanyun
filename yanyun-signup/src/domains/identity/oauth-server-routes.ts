/* The OAuth 2.1 authorization server for the MCP endpoint
 * (agent-native v1, ruling of 2026-11-10): the platform authorizes
 * agents itself — no binding codes, no bot. Discovery metadata,
 * dynamic client registration (RFC 7591), the authorization
 * endpoint, and the token endpoint live here; the data layer is
 * identity/agent-oauth.ts and the MCP resource server is
 * platform/mcp-routes.ts.
 *
 * Identity model (marcus): /oauth/authorize sits BEHIND the
 * existing Discord OAuth login — whoever completes the Discord
 * authorization is the identity the grant belongs to. The consent
 * page is the platform's own, states the requested scope tier and
 * what the agent can then do, and only an explicit approval mints
 * an authorization code.
 *
 * Clients are public: the code flow with a mandatory PKCE S256
 * challenge is the only authorization grant, so no client secret
 * exists. Access tokens live 1 hour; refresh tokens rotate on
 * every use and die with the grant's revocation (settings page).
 */
import { Hono } from 'hono';
import { getSessionUser, getUserLocalePref, hasCompleteDiscordGrant, signJwt, verifyJwt, LOGIN_STATE_TTL_SEC } from './auth.ts';
import {
  AGENT_REGISTRATION_DEFAULT_SCOPES,
  canonicalAgentScopes,
  clientRedirectUriAllowed,
  consumeAuthCode,
  getOAuthClient,
  issueAgentTokens,
  mintAuthCode,
  parseScopes,
  registerOAuthClient,
  rotateAgentTokens,
  verifyPkceS256,
} from './agent-oauth.ts';
import { translate } from '../platform/i18n.ts';
import { negotiateLocale, rateLimitGql } from '../platform/graphql-base.ts';

type Env = { Bindings: any };
const oauthRoutes = new Hono<Env>();

const esc = (s: unknown) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function htmlPage(title: string, bodyHtml: string, status = 200) {
  return new Response(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · 燕云百业</title></head>
<body style="margin:0;background:#0c0b09;color:#ece2cb;font-family:serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
<div style="text-align:center;padding:24px;max-width:440px;width:100%">
<h1 style="color:#ecd28f;letter-spacing:.1em">${esc(title)}</h1>
${bodyHtml}
</div></body></html>`, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

function oauthError(error: string, description: string, status = 400) {
  return Response.json(
    { error, error_description: description },
    { status, headers: { 'cache-control': 'no-store' } },
  );
}

async function consentLocale(c: any, userId: number): Promise<string> {
  const pref = await getUserLocalePref(c.env, userId).catch(() => null);
  return negotiateLocale(pref || (c.req.header('accept-language') || '').split(',')[0]);
}

/* Session resolution for the authorize ceremony ONLY. The checked
 * session read (getSessionUserChecked) voids a session whose
 * stored Discord grant reads incomplete — but that grant verdict
 * is a D1 read of the user_oauth row, and right after the Discord
 * login round trip it can still observe the PRE-login row
 * (needs_relogin, or a scope stored before guilds.members.read
 * was granted) before the callback's upsert becomes visible to
 * the read. Production acceptance (2026-11-10) hit exactly that:
 * the consent page rendered, the FIRST approval click answered
 * "login session expired", and a full retry minutes later — reads
 * converged by then — sailed through.
 *
 * The login callback mints the session JWT in the same request
 * that upserts the grant row, so a JWT issued inside the ceremony
 * window is itself proof the round trip just completed: trust it
 * and skip the grant read. Older sessions keep the checked
 * behavior byte-for-byte. Nothing downstream weakens: every MCP
 * call re-checks the grant before resolving the viewer
 * (platform/mcp-routes), so a grant that is genuinely dead still
 * yields only tokens the resource server refuses. */
const CEREMONY_FRESH_SEC = 600;

async function getAuthorizeSessionUser(
  request: Parameters<typeof getSessionUser>[0],
  env: Parameters<typeof getSessionUser>[1],
) {
  const user = await getSessionUser(request, env);
  if (!user) return null;
  const nowSec = Math.floor(Date.now() / 1000);
  if (user.iat && nowSec - user.iat <= CEREMONY_FRESH_SEC) return user;
  const ok = await hasCompleteDiscordGrant(env, user.userId);
  return ok ? user : null;
}

/* ---------------- discovery metadata ---------------- */

function authorizationServerMetadata(origin: string) {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/oauth/token`,
    registration_endpoint: `${origin}/oauth/register`,
    scopes_supported: ['read', 'signup', 'create'],
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['none'],
    code_challenge_methods_supported: ['S256'],
  };
}

oauthRoutes.get('/.well-known/oauth-authorization-server', (c) => {
  return c.json(authorizationServerMetadata(new URL(c.req.url).origin));
});
oauthRoutes.get('/.well-known/openid-configuration', (c) => {
  return c.json(authorizationServerMetadata(new URL(c.req.url).origin));
});

function protectedResourceMetadata(origin: string) {
  return {
    resource: `${origin}/mcp`,
    authorization_servers: [origin],
    scopes_supported: ['read', 'signup', 'create'],
    bearer_methods_supported: ['header'],
  };
}

oauthRoutes.get('/.well-known/oauth-protected-resource', (c) => {
  return c.json(protectedResourceMetadata(new URL(c.req.url).origin));
});
oauthRoutes.get('/.well-known/oauth-protected-resource/mcp', (c) => {
  return c.json(protectedResourceMetadata(new URL(c.req.url).origin));
});

/* ---------------- dynamic client registration ---------------- */

oauthRoutes.post('/oauth/register', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  if (!rateLimitGql(ip + ':oauth-register', 20, 3600_000)) {
    return oauthError('invalid_client_metadata', 'Registration is rate limited; try again later.', 429);
  }
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return oauthError('invalid_client_metadata', 'Request body must be JSON.');
  }
  const redirectUris = Array.isArray(body?.redirect_uris) ? body.redirect_uris : [];
  if (redirectUris.length < 1 || redirectUris.length > 10) {
    return oauthError('invalid_redirect_uri', 'redirect_uris must carry between 1 and 10 URIs.');
  }
  for (const uri of redirectUris) {
    let parsed: URL;
    try {
      parsed = new URL(String(uri));
    } catch {
      return oauthError('invalid_redirect_uri', `Not an absolute URI: ${String(uri)}`);
    }
    const loopback = ['127.0.0.1', 'localhost', '[::1]', '::1'].includes(parsed.hostname);
    if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && loopback)) {
      return oauthError('invalid_redirect_uri', 'Redirect URIs must be https, or http on a loopback host.');
    }
  }
  // `scope` is optional in RFC 7591 and real clients omit it:
  // those register for the full supported set (see
  // AGENT_REGISTRATION_DEFAULT_SCOPES in the data layer). A
  // blank scope reads as omitted; an explicit one keeps its
  // exact canonicalization.
  const rawScope = typeof body?.scope === 'string' && body.scope.trim() ? body.scope : null;
  const scopes = canonicalAgentScopes(rawScope ?? AGENT_REGISTRATION_DEFAULT_SCOPES);
  if (scopes === null) {
    return oauthError('invalid_client_metadata', 'scope must stay within the read / signup / create atoms.');
  }
  const clientName = String(body?.client_name || '').slice(0, 100);
  const client = await registerOAuthClient(c.env.DB, {
    clientName,
    redirectUris: redirectUris.map(String),
    scopes,
  });
  return c.json({
    client_id: client.client_id,
    client_id_issued_at: client.created_at,
    client_name: client.client_name,
    redirect_uris: JSON.parse(client.redirect_uris),
    scope: client.scopes,
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  }, 201);
});

/* ---------------- authorization endpoint ---------------- */

interface AuthorizeFacts {
  clientId: string;
  redirectUri: string;
  scopes: string;
  challenge: string;
  state: string | null;
  resource: string | null;
}

/** Validate an authorization request against the registered
 * client. Returns the facts, or an error: { page: true } errors
 * render the platform error page (the redirect target is not yet
 * trusted); redirect errors go back to the validated redirect URI
 * per RFC 6749 §4.1.2.1. */
async function validateAuthorizeRequest(
  env: any,
  q: URLSearchParams,
): Promise<{ facts: AuthorizeFacts } | { pageError: true } | { redirectError: string; redirectUri: string; state: string | null }> {
  const clientId = q.get('client_id') || '';
  const redirectUri = q.get('redirect_uri') || '';
  const state = q.get('state');
  if (!clientId || !redirectUri) return { pageError: true };
  const client = await getOAuthClient(env.DB, clientId);
  if (!client) return { pageError: true };
  if (!clientRedirectUriAllowed(client, redirectUri)) return { pageError: true };
  const fail = (error: string) => ({ redirectError: error, redirectUri, state });
  if (q.get('response_type') !== 'code') return fail('unsupported_response_type');
  const challenge = q.get('code_challenge') || '';
  if (!challenge || q.get('code_challenge_method') !== 'S256') return fail('invalid_request');
  const scopes = canonicalAgentScopes(q.get('scope'));
  if (scopes === null) return fail('invalid_scope');
  const clientScopes = parseScopes(client.scopes);
  for (const a of parseScopes(scopes)) {
    if (!clientScopes.has(a)) return fail('invalid_scope');
  }
  return {
    facts: {
      clientId, redirectUri, scopes, challenge, state,
      resource: q.get('resource'),
    },
  };
}

function redirectWithParams(redirectUri: string, params: Record<string, string | null>) {
  const url = new URL(redirectUri);
  for (const [k, v] of Object.entries(params)) {
    if (v != null) url.searchParams.set(k, v);
  }
  return Response.redirect(url.toString(), 302);
}

oauthRoutes.get('/oauth/authorize', async (c) => {
  const url = new URL(c.req.url);
  const checked = await validateAuthorizeRequest(c.env, url.searchParams);
  if ('pageError' in checked) {
    return htmlPage('授权请求无效', '<p>这个授权请求缺少必要参数或已失效，请回到你的 Agent 重新发起。</p>', 400);
  }
  if ('redirectError' in checked) {
    return redirectWithParams(checked.redirectUri, { error: checked.redirectError, state: checked.state });
  }
  const { facts } = checked;
  const user = await getAuthorizeSessionUser(c.req.raw, c.env);
  if (!user) {
    // Behind the existing Discord login: whoever completes it IS
    // the identity this grant will belong to. returnTo is a
    // same-origin path, so the login lands back on this request.
    // (Absolute URL: Response.redirect does not resolve relative
    // targets outside the Workers runtime.)
    const here = url.pathname + url.search;
    return Response.redirect(`${url.origin}/auth/discord/login?returnTo=${encodeURIComponent(here)}`, 302);
  }
  const client = await getOAuthClient(c.env.DB, facts.clientId);
  const locale = await consentLocale(c, user.userId);
  const t = (name: string, params?: Record<string, unknown>) => translate(name, locale, params as any);
  // The consent blob rides the same human-paced window as the
  // Discord login state (LOGIN_STATE_TTL_SEC): it is minted when
  // the consent page renders and verified on the approval POST,
  // and a member reading the scope list slowly — or detouring
  // through the login first on a second tab — must not find it
  // expired at 600s.
  const blob = await signJwt(c.env.SESSION_SECRET, {
    kind: 'oauth-consent',
    uid: user.userId,
    cid: facts.clientId,
    ruri: facts.redirectUri,
    scopes: facts.scopes,
    chal: facts.challenge,
    res: facts.resource,
    st: facts.state,
  }, LOGIN_STATE_TTL_SEC);
  const wantsSignup = parseScopes(facts.scopes).has('signup');
  const wantsCreate = parseScopes(facts.scopes).has('create');
  const body = `
<p>${esc(t('agent_consentIntro', { clientName: client?.client_name || facts.clientId }))}</p>
<p style="opacity:.85">${esc(t('agent_consentIdentity', { name: user.name }))}</p>
<p style="text-align:left;margin:20px 0 6px">${esc(t('agent_consentScopeTitle'))}</p>
<ul style="text-align:left;line-height:1.7;margin:0 0 8px;padding-left:20px">
<li>${esc(t('agent_consentScopeRead'))}</li>
${wantsSignup ? `<li>${esc(t('agent_consentScopeSignup'))}</li>` : ''}
${wantsCreate ? `<li>${esc(t('agent_consentScopeCreate'))}</li>` : ''}
</ul>
<form method="post" action="/oauth/authorize" style="margin-top:20px;display:flex;gap:12px;justify-content:center">
<input type="hidden" name="req" value="${esc(blob)}">
<button type="submit" name="decision" value="approve" style="background:#c9a35c;color:#171410;border:0;padding:10px 22px;border-radius:6px;font-size:15px;cursor:pointer">${esc(t('agent_consentApprove'))}</button>
<button type="submit" name="decision" value="deny" style="background:transparent;color:#ece2cb;border:1px solid #6b5f45;padding:10px 22px;border-radius:6px;font-size:15px;cursor:pointer">${esc(t('agent_consentDeny'))}</button>
</form>`;
  return htmlPage(t('agent_consentTitle'), body);
});

oauthRoutes.post('/oauth/authorize', async (c) => {
  const form = await c.req.parseBody().catch(() => null);
  const blob = String((form as any)?.req || '');
  const decision = String((form as any)?.decision || '');
  const user = await getAuthorizeSessionUser(c.req.raw, c.env);
  if (!user) return htmlPage('授权请求无效', '<p>登录状态已失效，请回到你的 Agent 重新发起。</p>', 400);
  const payload = blob ? await verifyJwt(c.env.SESSION_SECRET, blob).catch(() => null) : null;
  if (!payload || payload.kind !== 'oauth-consent' || Number(payload.uid) !== user.userId) {
    return htmlPage('授权请求无效', '<p>这个授权请求缺少必要参数或已失效，请回到你的 Agent 重新发起。</p>', 400);
  }
  const client = await getOAuthClient(c.env.DB, String(payload.cid));
  if (!client || !clientRedirectUriAllowed(client, String(payload.ruri))) {
    return htmlPage('授权请求无效', '<p>这个授权请求缺少必要参数或已失效，请回到你的 Agent 重新发起。</p>', 400);
  }
  if (decision !== 'approve') {
    return redirectWithParams(String(payload.ruri), { error: 'access_denied', state: payload.st ?? null });
  }
  const code = await mintAuthCode(c.env.DB, {
    clientId: String(payload.cid),
    userId: user.userId,
    scopes: String(payload.scopes),
    codeChallenge: String(payload.chal),
    redirectUri: String(payload.ruri),
    resource: payload.res ?? null,
  });
  return redirectWithParams(String(payload.ruri), { code, state: payload.st ?? null });
});

/* ---------------- token endpoint ---------------- */

oauthRoutes.post('/oauth/token', async (c) => {
  const form = await c.req.parseBody().catch(() => null);
  const get = (k: string) => String((form as any)?.[k] || '');
  const grantType = get('grant_type');

  if (grantType === 'authorization_code') {
    const code = get('code');
    const clientId = get('client_id');
    const redirectUri = get('redirect_uri');
    const verifier = get('code_verifier');
    if (!code || !clientId || !redirectUri || !verifier) {
      return oauthError('invalid_request', 'code, client_id, redirect_uri and code_verifier are required.');
    }
    // Consuming burns the code even when a later check fails: a
    // code is exchanged at most once, successfully or not.
    const row = await consumeAuthCode(c.env.DB, code);
    if (!row) return oauthError('invalid_grant', 'The authorization code is invalid, expired, or already used.');
    if (row.client_id !== clientId || row.redirect_uri !== redirectUri) {
      return oauthError('invalid_grant', 'The code was not issued for this client and redirect URI.');
    }
    if (!(await verifyPkceS256(verifier, row.code_challenge))) {
      return oauthError('invalid_grant', 'PKCE verification failed.');
    }
    const client = await getOAuthClient(c.env.DB, clientId);
    const issued = await issueAgentTokens(c.env.DB, {
      userId: row.user_id,
      clientId,
      clientName: client?.client_name || '',
      scopes: row.scopes,
      source: 'oauth',
    });
    return c.json({
      access_token: issued.accessToken,
      token_type: 'Bearer',
      expires_in: issued.expiresIn,
      refresh_token: issued.refreshToken,
      scope: issued.grant.scopes,
    }, 200, { 'cache-control': 'no-store' });
  }

  if (grantType === 'refresh_token') {
    const refreshToken = get('refresh_token');
    const clientId = get('client_id');
    if (!refreshToken || !clientId) {
      return oauthError('invalid_request', 'refresh_token and client_id are required.');
    }
    const scopeParam = (form as any)?.scope;
    const issued = await rotateAgentTokens(
      c.env.DB, refreshToken, clientId,
      typeof scopeParam === 'string' ? scopeParam : null,
    );
    if (!issued) return oauthError('invalid_grant', 'The refresh token is invalid, revoked, or not this client\'s.');
    return c.json({
      access_token: issued.accessToken,
      token_type: 'Bearer',
      expires_in: issued.expiresIn,
      refresh_token: issued.refreshToken,
      scope: issued.grant.scopes,
    }, 200, { 'cache-control': 'no-store' });
  }

  return oauthError('unsupported_grant_type', 'Only authorization_code and refresh_token grants exist.');
});

export { oauthRoutes };
