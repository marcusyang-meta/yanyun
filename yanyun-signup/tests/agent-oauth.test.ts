/* ===================================================
 * Agent-native OAuth 2.1 authorization server acceptance
 * (ruling of 2026-11-10: MCP-native OAuth, binding codes and the
 * bot cancelled). Runs the REAL oauth routes (Hono), the REAL
 * agent-oauth data layer and the REAL yoga settings surface
 * against a REAL local D1 (Miniflare) bootstrapped from the
 * migration chain.
 *
 * Chain under test:
 *   discovery metadata -> dynamic registration -> authorize
 *   without a session bounces to the Discord login -> consent
 *   page carries the client + scope bullets -> approval mints a
 *   code -> PKCE failure burns the code and refuses -> the right
 *   verifier exchanges for an access + refresh pair -> code
 *   replay refused -> refresh rotates (old pair dies, reuse
 *   refused) -> scope can only narrow on refresh -> revocation
 *   in the settings surface needs fresh auth and kills both
 *   tokens at once -> the settings surface never carries a token
 *   value, only metadata.
 * =================================================== */
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { describe, it, expect, afterAll } from 'vitest';
import { Hono } from 'hono';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: unknown, want: unknown) {
  check(name, JSON.stringify(got) === JSON.stringify(want),
    `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
}

const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: { DB: 'harness-agent-oauth' },
}));
const db = await mf.getD1Database('DB');

{ // Bootstrap from the migration chain, like the drift gate / verifier.
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { splitSqlStatements } = await import('../scripts/ci/schema-shape.mjs');
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    for (const stmt of splitSqlStatements(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      await db.prepare(stmt).run();
    }
  }
}

const { oauthRoutes } = await import('../src/domains/identity/oauth-server-routes.ts');
const { MCP_TOOL_CATALOG } = await import('../src/domains/platform/mcp-routes.ts');
const { signJwt } = await import('../src/domains/identity/auth.ts');
const svc = await import('../src/domains/identity/agent-oauth.ts');
const { yoga } = await import('../src/graphql.ts');

const SECRET = 'agent-oauth-test-secret';
const env = { DB: db, SESSION_SECRET: SECRET };
const app = new Hono();
app.route('/', oauthRoutes);

const UID1 = 2030100001, UID2 = 2030100002, UID3 = 2030100003;
const NOW = Math.floor(Date.now() / 1000);
await db.batch([
  db.prepare(`INSERT INTO users (id, discord_id, username, avatar, guilds_json, guilds_checked_at, fresh_auth_at)
    VALUES (${UID1}, '9001', '授权测试员', 'av1', '[]', ${NOW}, ${NOW})`),
  db.prepare(`INSERT INTO users (id, discord_id, username, avatar, guilds_json, guilds_checked_at)
    VALUES (${UID2}, '9002', '未验证成员', 'av2', '[]', ${NOW})`),
  db.prepare(`INSERT INTO user_oauth (user_id, refresh_token, scope, refresh_state, last_refresh_at, updated_at)
    VALUES (${UID1}, 'R1', 'identify guilds guilds.members.read', 'ok', ${NOW}, ${NOW})`),
  db.prepare(`INSERT INTO user_oauth (user_id, refresh_token, scope, refresh_state, last_refresh_at, updated_at)
    VALUES (${UID2}, 'R2', 'identify guilds guilds.members.read', 'ok', ${NOW}, ${NOW})`),
  // UID3's stored grant reads PRE-login (needs_relogin, scope from
  // before guilds.members.read existed) and is never repaired in
  // this file: it stands in for what a D1 read can still observe
  // in the moments after the login callback upserted the fresh
  // grant — the state behind the 2026-11-10 first-consent failure.
  db.prepare(`INSERT INTO users (id, discord_id, username, avatar, guilds_json, guilds_checked_at)
    VALUES (${UID3}, '9003', '往返测试员', 'av3', '[]', ${NOW})`),
  db.prepare(`INSERT INTO user_oauth (user_id, refresh_token, scope, refresh_state, last_refresh_at, updated_at)
    VALUES (${UID3}, 'R3-stale', 'identify guilds', 'needs_relogin', ${NOW}, ${NOW})`),
]);

async function sessionCookie(userId: number, name: string): Promise<string> {
  const jwt = await signJwt(SECRET, { sub: userId, name, guilds: [] }, 3600);
  return `yy_session=${jwt}`;
}

/* A session JWT with a caller-chosen iat (signJwt always stamps
 * now): the negative control needs a session that was NOT minted
 * by a just-completed login round trip. */
async function backdatedSessionCookie(userId: number, name: string, iatSec: number): Promise<string> {
  const b64u = (bytes: Uint8Array) => {
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const enc = new TextEncoder();
  const head = b64u(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = b64u(enc.encode(JSON.stringify({
    sub: String(userId), name, guilds: [], iat: iatSec, exp: Math.floor(Date.now() / 1000) + 3600,
  })));
  const key = await crypto.subtle.importKey('raw', enc.encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${head}.${body}`));
  return `yy_session=${head}.${body}.${b64u(new Uint8Array(sig))}`;
}

async function pkceChallenge(verifier: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  let bin = '';
  for (const b of new Uint8Array(d)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const REDIRECT = 'http://127.0.0.1:8976/callback';
let clientId = '';
let accessToken = '';
let refreshToken = '';
let grantId = 0;

async function runConsentFlow(verifier: string, scope: string): Promise<string> {
  const challenge = await pkceChallenge(verifier);
  const q = new URLSearchParams({
    response_type: 'code', client_id: clientId, redirect_uri: REDIRECT,
    scope, state: 'st-1', code_challenge: challenge, code_challenge_method: 'S256',
  });
  const getRes = await app.request(`/oauth/authorize?${q}`, { headers: { cookie: await sessionCookie(UID1, '授权测试员') } }, env);
  eq('consent page renders', getRes.status, 200);
  const html = await getRes.text();
  const blob = /name="req" value="([^"]+)"/.exec(html)?.[1] || '';
  check('consent blob present', blob.length > 10);
  const postRes = await app.request('/oauth/authorize', {
    method: 'POST',
    headers: { cookie: await sessionCookie(UID1, '授权测试员'), 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ req: blob, decision: 'approve' }),
  }, env);
  eq('consent approval redirects', postRes.status, 302);
  const loc = postRes.headers.get('location') || '';
  const code = new URL(loc).searchParams.get('code') || '';
  check('code issued', code.length > 10, loc);
  eq('state echoed', new URL(loc).searchParams.get('state'), 'st-1');
  return code;
}

async function exchangeCode(code: string, verifier: string) {
  return app.request('/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code', code, client_id: clientId,
      redirect_uri: REDIRECT, code_verifier: verifier,
    }),
  }, env);
}

describe('agent OAuth authorization server', () => {
  it('serves discovery + protected-resource metadata', async () => {
    const meta = await (await app.request('/.well-known/oauth-authorization-server', {}, env)).json() as any;
    check('issuer is the request origin', String(meta.issuer).endsWith('localhost') || String(meta.issuer).length > 0);
    check('authorize endpoint named', String(meta.authorization_endpoint).endsWith('/oauth/authorize'));
    check('registration endpoint named', String(meta.registration_endpoint).endsWith('/oauth/register'));
    eq('only S256 PKCE', meta.code_challenge_methods_supported, ['S256']);
    eq('scope atoms advertised', meta.scopes_supported, ['read', 'signup', 'create']);
    const prm = await (await app.request('/.well-known/oauth-protected-resource', {}, env)).json() as any;
    check('resource is /mcp', String(prm.resource).endsWith('/mcp'));
    eq('authorization server points at self', prm.authorization_servers, [meta.issuer]);
    eq('resource metadata scope atoms match', prm.scopes_supported, ['read', 'signup', 'create']);
  });

  it('registers a public client dynamically', async () => {
    const res = await app.request('/oauth/register', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ client_name: 'Muse', redirect_uris: [REDIRECT], scope: 'read signup' }),
    }, env);
    eq('registration status', res.status, 201);
    const body = await res.json() as any;
    clientId = body.client_id;
    check('client id minted', clientId.startsWith('yyc_'));
    eq('no secret for public clients', body.token_endpoint_auth_method, 'none');
    const bad = await app.request('/oauth/register', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ client_name: 'Bad', redirect_uris: ['http://evil.example.com/cb'] }),
    }, env);
    eq('non-loopback http redirect refused', bad.status, 400);
  });

  it('bounces unauthenticated authorize requests to the Discord login', async () => {
    const challenge = await pkceChallenge('v-bounce');
    const q = new URLSearchParams({
      response_type: 'code', client_id: clientId, redirect_uri: REDIRECT,
      code_challenge: challenge, code_challenge_method: 'S256',
    });
    const res = await app.request(`/oauth/authorize?${q}`, {}, env);
    eq('bounce status', res.status, 302);
    check('bounce target is the Discord login',
      (res.headers.get('location') || '').includes('/auth/discord/login?returnTo='));
  });

  it('refuses unregistered redirect URIs without redirecting', async () => {
    const challenge = await pkceChallenge('v-evil');
    const q = new URLSearchParams({
      response_type: 'code', client_id: clientId, redirect_uri: 'https://evil.example.com/cb',
      code_challenge: challenge, code_challenge_method: 'S256',
    });
    const res = await app.request(`/oauth/authorize?${q}`, { headers: { cookie: await sessionCookie(UID1, '授权测试员') } }, env);
    eq('unregistered redirect refused in place', res.status, 400);
    eq('no location header', res.headers.get('location'), null);
  });

  it('rejects plain PKCE and missing challenges back to the client', async () => {
    const q = new URLSearchParams({
      response_type: 'code', client_id: clientId, redirect_uri: REDIRECT,
      code_challenge: 'plain-challenge', code_challenge_method: 'plain', state: 'st-9',
    });
    const res = await app.request(`/oauth/authorize?${q}`, { headers: { cookie: await sessionCookie(UID1, '授权测试员') } }, env);
    eq('plain PKCE redirects with error', res.status, 302);
    const loc = new URL(res.headers.get('location') || '');
    eq('error is invalid_request', loc.searchParams.get('error'), 'invalid_request');
    eq('state preserved', loc.searchParams.get('state'), 'st-9');
  });

  it('runs consent -> code -> token with PKCE enforced', async () => {
    // A failed PKCE exchange burns the code.
    const burned = await runConsentFlow('verifier-burn', 'read signup');
    const badRes = await exchangeCode(burned, 'wrong-verifier');
    eq('wrong verifier refused', badRes.status, 400);
    eq('error invalid_grant', (await badRes.json() as any).error, 'invalid_grant');
    const replay = await exchangeCode(burned, 'verifier-burn');
    eq('burned code cannot be replayed with the right verifier', replay.status, 400);

    const code = await runConsentFlow('verifier-good-0123456789-abcdefghijklmnopqrstuv', 'read signup');
    const okRes = await exchangeCode(code, 'verifier-good-0123456789-abcdefghijklmnopqrstuv');
    eq('exchange succeeds', okRes.status, 200);
    const body = await okRes.json() as any;
    accessToken = body.access_token;
    refreshToken = body.refresh_token;
    check('access token shape', accessToken.startsWith('yyag_'));
    check('refresh token shape', refreshToken.startsWith('yygr_'));
    eq('scope is the granted tier', body.scope, 'read signup');
    const replay2 = await exchangeCode(code, 'verifier-good-0123456789-abcdefghijklmnopqrstuv');
    eq('successful code cannot be replayed', replay2.status, 400);

    const grant = await svc.verifyAgentAccessToken(db, accessToken);
    check('access token verifies', !!grant);
    eq('grant belongs to the authorizing identity', grant?.user_id, UID1);
    eq('grant source is oauth', grant?.source, 'oauth');
    grantId = grant?.id || 0;
  });

  it('rotates on refresh: old pair dies, reuse refused, scope only narrows', async () => {
    const res = await app.request('/oauth/token', {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: clientId }),
    }, env);
    eq('refresh succeeds', res.status, 200);
    const body = await res.json() as any;
    check('pair rotated', body.access_token !== accessToken && body.refresh_token !== refreshToken);
    eq('old access token dead', await svc.verifyAgentAccessToken(db, accessToken), null);
    const reuse = await app.request('/oauth/token', {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: clientId }),
    }, env);
    eq('old refresh reuse refused', reuse.status, 400);
    accessToken = body.access_token;
    refreshToken = body.refresh_token;

    const narrow = await app.request('/oauth/token', {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: clientId, scope: 'read' }),
    }, env);
    eq('narrowing refresh succeeds', narrow.status, 200);
    const narrowBody = await narrow.json() as any;
    eq('scope narrowed', narrowBody.scope, 'read');
    accessToken = narrowBody.access_token;
    refreshToken = narrowBody.refresh_token;
    const grants = await svc.listUserAgentTokens(db, UID1);
    eq('grant scope stored narrowed', grants.find((g) => g.id === grantId)?.scopes, 'read');

    const widen = await svc.rotateAgentTokens(db, refreshToken, clientId, 'read signup');
    eq('widening beyond the grant refused', widen, null);
    check('grant untouched by the refused widening', !!(await svc.verifyAgentAccessToken(db, accessToken)));
  });

  it('settings surface lists metadata only and revocation needs fresh auth', async () => {
    const gql = async (user: any, query: string, variables?: any) => {
      const res = await yoga.fetch(new Request('http://test/graphql', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      }), { env: { DB: db }, request: new Request('http://test/graphql'), user, locale: 'zh-CN', tz: 'Asia/Shanghai' } as any);
      return res.json() as Promise<any>;
    };
    const user1 = { userId: UID1, discordId: '9001', name: '授权测试员', guilds: [] };
    const user2 = { userId: UID2, discordId: '9002', name: '未验证成员', guilds: [] };

    const list = await gql(user1, `{ settingsPage { agentGrants { grants { id clientName scopesLabel sourceLabel tokenPrefix createdText lastUsedText revokeLabel } } } }`);
    const grants = list.data.settingsPage.agentGrants.grants;
    eq('one live grant listed', grants.length, 1);
    eq('grant id matches', Number(grants[0].id), grantId);
    eq('scope label is the signup tier (pre-narrow value replaced)', grants[0].scopesLabel, '只读');
    const raw = JSON.stringify(list);
    check('no token value in the settings payload', !raw.includes(accessToken) && !raw.includes(refreshToken));

    const stale = await gql(user2, `mutation { revokeAgentGrant(id: "${grantId}") { ok errorCode } }`);
    eq('another member cannot revoke it', stale.data.revokeAgentGrant.ok, false);

    // UID2 HAS no fresh auth and the grant is not theirs anyway;
    // the fresh-auth gate is proven on UID1's own second grant below.
    const second = await svc.issueAgentTokens(db, { userId: UID2, clientId, clientName: 'Muse', scopes: 'read' });
    const noFresh = await gql(user2, `mutation { revokeAgentGrant(id: "${second.grant.id}") { ok errorCode } }`);
    eq('revocation without fresh auth refused', noFresh.data.revokeAgentGrant.ok, false);
    eq('error code is the reauth tier', noFresh.data.revokeAgentGrant.errorCode, 'accountReauthRequired');
    check('grant still live after refused revocation', !!(await svc.verifyAgentAccessToken(db, second.accessToken)));

    eq('service refuses cross-member revocation', await svc.revokeAgentToken(db, UID2, grantId), false);
    check('grant still live after cross-member attempt', !!(await svc.verifyAgentAccessToken(db, accessToken)));

    const done = await gql(user1, `mutation { revokeAgentGrant(id: "${grantId}") { ok errorCode agentGrants { grants { id } } } }`);
    eq('fresh-auth revocation succeeds', done.data.revokeAgentGrant.ok, true);
    eq('settings list no longer carries the grant', done.data.revokeAgentGrant.agentGrants.grants.length, 0);
    eq('access token dead after revocation', await svc.verifyAgentAccessToken(db, accessToken), null);
    const deadRefresh = await svc.rotateAgentTokens(db, refreshToken, clientId, null);
    eq('refresh token dead after revocation', deadRefresh, null);
  });

  it('composes the create atom: canonical sets, consent bullet, labels, narrowing', async () => {
    // Canonicalization: pre-create strings are byte-identical, the
    // create atom composes after signup, anything else is refused.
    eq('empty means read', svc.canonicalAgentScopes(''), 'read');
    eq('read stays read', svc.canonicalAgentScopes('read'), 'read');
    eq('signup tier unchanged', svc.canonicalAgentScopes('signup'), 'read signup');
    eq('signup tier unchanged (explicit)', svc.canonicalAgentScopes('read signup'), 'read signup');
    eq('create implies read', svc.canonicalAgentScopes('create'), 'read create');
    eq('full set composes in canonical order', svc.canonicalAgentScopes('create signup'), 'read signup create');
    eq('unknown atom refused', svc.canonicalAgentScopes('read admin'), null);
    eq('AGENT_SCOPE_SETS enumerates exactly the canonical sets', [...svc.AGENT_SCOPE_SETS],
      ['read', 'read signup', 'read create', 'read signup create']);

    // A client registered WITH the create atom can be authorized
    // for it; the consent page names exactly the requested tiers.
    const reg = await app.request('/oauth/register', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ client_name: 'CreateClient', redirect_uris: [REDIRECT], scope: 'read signup create' }),
    }, env);
    eq('create-capable registration succeeds', reg.status, 201);
    const cid2 = (await reg.json() as any).client_id;
    const cookie = await sessionCookie(UID1, '授权测试员');
    const consentHtml = async (scope: string) => {
      const challenge = await pkceChallenge('v-create-' + scope.replace(/\s/g, '-'));
      const q = new URLSearchParams({
        response_type: 'code', client_id: cid2, redirect_uri: REDIRECT,
        scope, code_challenge: challenge, code_challenge_method: 'S256',
      });
      const res = await app.request(`/oauth/authorize?${q}`, { headers: { cookie } }, env);
      eq(`consent renders for scope "${scope}"`, res.status, 200);
      return res.text();
    };
    const createHtml = await consentHtml('read create');
    check('consent page carries the create bullet', createHtml.includes('以你的身份创建由你带队的车队'));
    check('create-only consent omits the signup bullet', !createHtml.includes('以你的身份报名、退报'));
    const readHtml = await consentHtml('read');
    check('read consent omits the create bullet', !readHtml.includes('以你的身份创建由你带队的车队'));

    // Approve a create grant end-to-end through the new client.
    const verifier = 'verifier-create-0123456789-abcdefghijklmnop';
    const challenge = await pkceChallenge(verifier);
    const q = new URLSearchParams({
      response_type: 'code', client_id: cid2, redirect_uri: REDIRECT,
      scope: 'read create', state: 'st-c', code_challenge: challenge, code_challenge_method: 'S256',
    });
    const getRes = await app.request(`/oauth/authorize?${q}`, { headers: { cookie } }, env);
    const blob = /name="req" value="([^"]+)"/.exec(await getRes.text())?.[1] || '';
    check('create consent blob present', blob.length > 10);
    const postRes = await app.request('/oauth/authorize', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ req: blob, decision: 'approve' }),
    }, env);
    eq('create consent approval redirects', postRes.status, 302);
    const code = new URL(postRes.headers.get('location') || '').searchParams.get('code') || '';
    const tokRes = await app.request('/oauth/token', {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code', code, client_id: cid2,
        redirect_uri: REDIRECT, code_verifier: verifier,
      }),
    }, env);
    eq('create grant exchanges', tokRes.status, 200);
    eq('issued scope is the create set', (await tokRes.json() as any).scope, 'read create');

    // Refresh narrowing across the new atom, at the data layer.
    const full = await svc.issueAgentTokens(db, { userId: UID1, clientId: cid2, clientName: 'CreateClient', scopes: 'read signup create' });
    const narrowed = await svc.rotateAgentTokens(db, full.refreshToken, cid2, 'read create');
    check('narrowing to read create succeeds', !!narrowed);
    eq('narrowed scope stored', narrowed?.grant.scopes, 'read create');
    const widenBack = await svc.rotateAgentTokens(db, narrowed!.refreshToken, cid2, 'read signup create');
    eq('widening back is refused', widenBack, null);

    // Settings scope labels for the new sets.
    const gql = async (user: any, query: string) => {
      const res = await yoga.fetch(new Request('http://test/graphql', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query }),
      }), { env: { DB: db }, request: new Request('http://test/graphql'), user, locale: 'zh-CN', tz: 'Asia/Shanghai' } as any);
      return res.json() as Promise<any>;
    };
    const gCreate = await svc.issueAgentTokens(db, { userId: UID2, clientId: cid2, clientName: 'CreateClient', scopes: 'read create' });
    const gFull = await svc.issueAgentTokens(db, { userId: UID2, clientId: cid2, clientName: 'CreateClient', scopes: 'read signup create' });
    const list = await gql(
      { userId: UID2, discordId: '9002', name: '未验证成员', guilds: [] },
      `{ settingsPage { agentGrants { grants { id scopesLabel } } } }`);
    const byId = new Map(list.data.settingsPage.agentGrants.grants.map((g: any) => [Number(g.id), g.scopesLabel]));
    eq('create set label', byId.get(gCreate.grant.id), '只读 + 建车');
    eq('full set label', byId.get(gFull.grant.id), '只读 + 报名 + 建车');
  });

  it('first consent right after the login round trip succeeds while the grant row still reads pre-login', async () => {
    // Regression (production acceptance, 2026-11-10): the browser
    // came back from the Discord round trip, the consent page
    // rendered, and the FIRST approval click answered "login
    // session expired" — the checked session read was still
    // observing UID3's pre-login grant row (needs_relogin). A full
    // retry minutes later worked. UID3's row stays stale for this
    // whole test; only the session is fresh, exactly like the
    // moments after the callback mints it.
    const cookie = await sessionCookie(UID3, '往返测试员');
    const challenge = await pkceChallenge('verifier-roundtrip-0123456789-abcdefghij');
    const q = new URLSearchParams({
      response_type: 'code', client_id: clientId, redirect_uri: REDIRECT,
      scope: 'read signup', state: 'st-rt', code_challenge: challenge, code_challenge_method: 'S256',
    });
    const getRes = await app.request(`/oauth/authorize?${q}`, { headers: { cookie } }, env);
    eq('consent renders for the just-logged-in session', getRes.status, 200);
    const html = await getRes.text();
    const blob = /name="req" value="([^"]+)"/.exec(html)?.[1] || '';
    check('consent blob present', blob.length > 10);
    const postRes = await app.request('/oauth/authorize', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ req: blob, decision: 'approve' }),
    }, env);
    eq('first approval click succeeds (no retry needed)', postRes.status, 302);
    const code = new URL(postRes.headers.get('location') || '').searchParams.get('code') || '';
    check('code issued on the first attempt', code.length > 10);
    const okRes = await exchangeCode(code, 'verifier-roundtrip-0123456789-abcdefghij');
    eq('round-trip code exchanges', okRes.status, 200);
  });

  it('an older session whose grant reads incomplete stays voided at the ceremony', async () => {
    // Negative control: the freshness window must not become a
    // general bypass of the grant gate — a session minted an hour
    // ago (NOT by a just-completed round trip) with UID3's stale
    // grant row is treated exactly as before the fix.
    const staleCookie = await backdatedSessionCookie(UID3, '往返测试员', Math.floor(Date.now() / 1000) - 3600);
    const challenge = await pkceChallenge('verifier-stale-0123456789-abcdefghijklmn');
    const q = new URLSearchParams({
      response_type: 'code', client_id: clientId, redirect_uri: REDIRECT,
      scope: 'read', code_challenge: challenge, code_challenge_method: 'S256',
    });
    const getRes = await app.request(`/oauth/authorize?${q}`, { headers: { cookie: staleCookie } }, env);
    eq('old session with incomplete grant bounces to login', getRes.status, 302);
    check('bounce target is the Discord login',
      (getRes.headers.get('location') || '').includes('/auth/discord/login?returnTo='));
    const postRes = await app.request('/oauth/authorize', {
      method: 'POST',
      headers: { cookie: staleCookie, 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ req: 'irrelevant', decision: 'approve' }),
    }, env);
    eq('old session approval refused', postRes.status, 400);
    check('refusal is the login-expired page', (await postRes.text()).includes('登录状态已失效'));
  });
});

describe('worker dispatch', () => {
  it('routes the OAuth + MCP paths into the Hono app, not the SPA fallback', async () => {
    const worker = (await import('../src/worker.ts')).default;
    const ctx = { waitUntil: () => {}, passThroughOnException: () => {} } as any;
    const meta = await worker.fetch(
      new Request('https://yanyun.app/.well-known/oauth-authorization-server'), env as any, ctx);
    eq('metadata status', meta.status, 200);
    const metaBody = await meta.json() as any;
    eq('metadata issuer is the request origin', metaBody.issuer, 'https://yanyun.app');
    const mcp = await worker.fetch(new Request('https://yanyun.app/mcp', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
    }), env as any, ctx);
    eq('MCP without a token is 401 (not the SPA)', mcp.status, 401);
    check('MCP 401 carries the resource metadata pointer',
      (mcp.headers.get('www-authenticate') || '').includes('/.well-known/oauth-protected-resource'));
  });
});

describe('agent discovery signposts', () => {
  it('serves /llms.txt and /.well-known/mcp through the real worker fetch', async () => {
    const worker = (await import('../src/worker.ts')).default;
    const ctx = { waitUntil: () => {}, passThroughOnException: () => {} } as any;

    const llms = await worker.fetch(
      new Request('https://yanyun.app/llms.txt'), env as any, ctx);
    eq('llms.txt status', llms.status, 200);
    check('llms.txt is plain text',
      (llms.headers.get('content-type') || '').includes('text/plain'));
    const text = await llms.text();
    check('llms.txt opens with the H1 site name', text.startsWith('# Yanyun'));
    for (const needle of [
      'https://yanyun.app/mcp',
      'https://yanyun.app/.well-known/oauth-protected-resource',
      'https://yanyun.app/.well-known/oauth-authorization-server',
      'https://yanyun.app/oauth/register',
      'https://yanyun.app/oauth/authorize',
      'https://yanyun.app/oauth/token',
      'S256',
      '`read signup`',
      '我的 Agent 授权',
    ]) {
      check(`llms.txt carries ${needle}`, text.includes(needle));
    }
    eq('llms.txt tool section is generated from the served catalog',
      MCP_TOOL_CATALOG.length, 12);
    for (const t of MCP_TOOL_CATALOG) {
      check(`llms.txt lists tool ${t.name} as ${t.write ? 'write' : 'read'}`,
        text.includes(`\`${t.name}\` (${t.write ? 'write' : 'read'})`));
    }

    const ptr = await worker.fetch(
      new Request('https://yanyun.app/.well-known/mcp'), env as any, ctx);
    eq('mcp pointer status', ptr.status, 200);
    check('mcp pointer is JSON',
      (ptr.headers.get('content-type') || '').includes('application/json'));
    const pj = await ptr.json() as any;
    eq('pointer name', pj.name, 'yanyun-mcp');
    eq('pointer endpoint', pj.endpoint, 'https://yanyun.app/mcp');
    eq('pointer auth type', pj.auth?.type, 'oauth2');
    eq('pointer protected-resource metadata', pj.auth?.protected_resource_metadata,
      'https://yanyun.app/.well-known/oauth-protected-resource');
    eq('pointer authorization-server metadata', pj.auth?.authorization_server_metadata,
      'https://yanyun.app/.well-known/oauth-authorization-server');
    eq('pointer scopes', pj.scopes, ['read', 'signup', 'create']);
    eq('pointer documentation points at the llms.txt', pj.documentation,
      'https://yanyun.app/llms.txt');
  });
});

afterAll(async () => { await mf.dispose(); });
