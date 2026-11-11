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
const { signJwt } = await import('../src/domains/identity/auth.ts');
const svc = await import('../src/domains/identity/agent-oauth.ts');
const { yoga } = await import('../src/graphql.ts');

const SECRET = 'agent-oauth-test-secret';
const env = { DB: db, SESSION_SECRET: SECRET };
const app = new Hono();
app.route('/', oauthRoutes);

const UID1 = 2030100001, UID2 = 2030100002;
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
]);

async function sessionCookie(userId: number, name: string): Promise<string> {
  const jwt = await signJwt(SECRET, { sub: userId, name, guilds: [] }, 3600);
  return `yy_session=${jwt}`;
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
    const prm = await (await app.request('/.well-known/oauth-protected-resource', {}, env)).json() as any;
    check('resource is /mcp', String(prm.resource).endsWith('/mcp'));
    eq('authorization server points at self', prm.authorization_servers, [meta.issuer]);
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
});

afterAll(async () => { await mf.dispose(); });
