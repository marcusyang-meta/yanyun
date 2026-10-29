import { SUPPORTED_LOCALES } from '../platform/index.ts';
import { isPublicIdOfType } from '../platform/ids.ts';
import { listDistinctSettingValues, parseGuildSubdomainSlug, guildSubdomainOrigin } from '../guilds/index.ts';
import { upsertUserOnLogin, getDiscordIdByUserId, getUserLocalePref as getUserLocalePrefRepo, setUserLocalePref as setUserLocalePrefRepo, getUserGuildsJson, getOAuthGrant, getOAuthRefresh, upsertOAuthOnLogin, updateOAuthAfterRefresh, markOAuthNeedsRelogin, upsertNick as upsertNickRepo, touchNick as touchNickRepo, getNickRow, listNickRowsByUser } from './index.ts';
import { noteFreshAuthAndSettlePending } from './account.ts';

// Discord OAuth + stateless JWT session (yy_session cookie).
// Payload: { sub: numeric user id (users.id, type code 02), name, avatar, guilds: [Discord server ids...], gm?: [{i, p}], iat, exp }
// The Discord ID itself never rides the token: getSessionUser resolves
// it from the users row at the session boundary (the one sanctioned
// conversion), and internal code carries userId. Sessions minted
// before migration 0036 (sub = Discord ID) no longer parse as user
// IDs and read as signed out.
// gm is only for ops/test-issued sessions; the real login flow never writes
// it (keeps the cookie small). createGuild's admin check reads
// users.guilds_json first and falls back to gm only when that row is missing.

export const SESSION_COOKIE = 'yy_session';
const SESSION_TTL_SEC = 14 * 24 * 3600;

/* ================= Encoding helpers ================= */
const enc = new TextEncoder();
const dec = new TextDecoder();
export function b64uEncode(bytes: any) {
  let bin = '';
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function b64uDecode(str: any) {
  const pad = '='.repeat((4 - (str.length % 4)) % 4);
  const bin = atob(String(str).replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
const b64uJson = (obj: any) => b64uEncode(enc.encode(JSON.stringify(obj)));
const jsonB64u = (str: any): any => JSON.parse(dec.decode(b64uDecode(str)));

/* ================= JWT (HS256, WebCrypto) ================= */
async function hmacKey(secret: string) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signJwt(secret: string, payload: any, ttlSec = SESSION_TTL_SEC) {
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + ttlSec };
  const head = b64uJson({ alg: 'HS256', typ: 'JWT' });
  const data = head + '.' + b64uJson(body);
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return data + '.' + b64uEncode(sig);
}

export async function verifyJwt(secret: string, token: any): Promise<any> {
  try {
    if (!secret || !token) return null;
    const parts = String(token).split('.');
    if (parts.length !== 3) return null;
    const [head, body, sig] = parts;
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify('HMAC', key, b64uDecode(sig), enc.encode(head + '.' + body));
    if (!ok) return null;
    const payload = jsonB64u(body);
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

/* ================= Cookie ================= */
// All values sent under one cookie name, in header order. During the
// Domain transition a browser can hold two yy_session cookies at
// once (the legacy host-only one and the Domain one below) and sends
// both; the session read must see every value, not just one.
function parseCookieValues(request: Request, name: string): string[] {
  const out: string[] = [];
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) {
      const v = decodeURIComponent(part.slice(i + 1).trim());
      if (v) out.push(v);
    }
  }
  return out;
}

/* Cookie scope: one login for the apex and every guild subdomain.
 * On the yanyun.app host family (the apex itself plus its
 * subdomains) the session cookie carries Domain=yanyun.app, so a
 * session minted at the root is sent to {slug}.yanyun.app and back.
 * Off-family hosts (workers.dev previews, localhost) keep the
 * historical host-only cookie byte-for-byte: browsers drop a Domain
 * cookie that does not cover the request host, which would silently
 * break sign-in there. */
export const SESSION_COOKIE_DOMAIN = 'yanyun.app';
function sessionCookieDomainAttr(hostname: string): string {
  const host = String(hostname || '').toLowerCase();
  return host === SESSION_COOKIE_DOMAIN || host.endsWith('.' + SESSION_COOKIE_DOMAIN)
    ? `; Domain=${SESSION_COOKIE_DOMAIN}` : '';
}

export function sessionCookieHeader(jwt: string, maxAgeSec: number, hostname = '') {
  return `${SESSION_COOKIE}=${jwt}; Path=/; HttpOnly; Secure; SameSite=Lax${sessionCookieDomainAttr(hostname)}; Max-Age=${maxAgeSec}`;
}

// Expired host-only twin of the session cookie. While the Domain
// cookie is the live one, a pre-transition browser may still hold
// the legacy host-only cookie beside it; mints pair the fresh cookie
// with this clear so the old copy dies, and clears emit both scopes
// so sign-out and session invalidation remove whichever copy the
// browser actually holds. Off-family there is just the one host-only
// cookie, so the list holds the primary alone.
const legacySessionClearHeader =
  `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
export function sessionCookieHeaders(jwt: string, maxAgeSec: number, hostname = ''): string[] {
  const primary = sessionCookieHeader(jwt, maxAgeSec, hostname);
  return sessionCookieDomainAttr(hostname) ? [primary, legacySessionClearHeader] : [primary];
}

// Token source: yy_session cookie (web) or Authorization: Bearer (mobile) —
// the same session JWT and downstream validation either way. Cookie wins;
// Bearer is consulted only without a cookie, so web behavior is unchanged.
// The cookie read is duplicate-tolerant: with the legacy host-only cookie
// and the Domain cookie coexisting, the browser sends both values and
// the first one that verifies is the session. A present-but-invalid
// cookie still means signed out, exactly as before.
export async function getSessionUser(request: any, env: any) {
  if (!env || !env.SESSION_SECRET) return null;
  const candidates = parseCookieValues(request, SESSION_COOKIE);
  if (!candidates.length) {
    const authz = request.headers.get('authorization') || '';
    if (authz.startsWith('Bearer ')) {
      const bearer = authz.slice(7).trim();
      if (bearer) candidates.push(bearer);
    }
  }
  for (const token of candidates) {
    const p = await verifyJwt(env.SESSION_SECRET, token);
    if (p && p.sub) {
      const userId = Number(p.sub);
      // sub must be a minted user ID; a pre-0036 token (sub = Discord
      // ID) or any other shape is not a session.
      if (!isPublicIdOfType(userId, 'user')) continue;
      // The one sanctioned conversion: numeric ID -> Discord ID via
      // the users row, materialized here at the session boundary for
      // the Discord-facing consumers (mentions, membership checks).
      let discordId = '';
      try {
        discordId = (env.DB ? await getDiscordIdByUserId(env.DB, userId) : null) || '';
      } catch { /* resolution failure degrades to an empty Discord ID; the grant check still gates */ }
      return {
        userId,
        discordId,
        name: p.name || '',
        avatar: p.avatar || '',
        guilds: Array.isArray(p.guilds) ? p.guilds.map(String) : [],
        guildsMeta: Array.isArray(p.gm) ? p.gm : null, // present only on test-issued sessions
      };
    }
  }
  return null;
}

/* ============ Session validity: the Discord grant must be complete (ruling) ============
 * No "please log in again" banner — an incomplete old session is voided
 * outright: no user_oauth row / no stored refresh token / scope missing
 * guilds.members.read / refresh_state = needs_relogin (set only on
 * permanent invalid_grant failure). Any of these means logged out, and
 * the caller clears the yy_session cookie; re-login (with returnTo)
 * restores a complete grant. Query errors fail open, so a D1 hiccup
 * never kicks out a fully-authorized user. */
export async function hasCompleteDiscordGrant(env: any, userId: number) {
  try {
    if (!env || !env.DB || !userId) return false;
    const row = await getOAuthGrant(env.DB, userId);
    if (!row || !row.refresh_token) return false;
    if (row.refresh_state === 'needs_relogin') return false;
    const scopes = String(row.scope || '').split(/\s+/).filter(Boolean);
    return scopes.includes('guilds.members.read');
  } catch { return true; }
}

// getSessionUser + grant-completeness check -> { user, clearCookie }.
// Invalid/missing JWT: user=null, cookie kept. Valid JWT but incomplete
// grant: user=null and clearCookie=true.
export async function getSessionUserChecked(request: any, env: any) {
  const user = await getSessionUser(request, env);
  if (!user) return { user: null, clearCookie: false };
  const ok = await hasCompleteDiscordGrant(env, user.userId);
  return ok ? { user, clearCookie: false } : { user: null, clearCookie: true };
}

/* ================= users table =================
 * All users-table access goes through the users repository
 * (identity/users.ts); this section keeps the session-facing
 * compositions. */

/* ---------- UI language preference (account-level, users.locale_pref) ----------
 * null = automatic (follow browser language); a set value beats the
 * browser. Reads and writes validate against the supported set; dirty
 * values count as unset. */
export async function getUserLocalePref(env: any, userId: number) {
  try {
    if (!env || !env.DB || !userId) return null;
    const v = await getUserLocalePrefRepo(env.DB, userId);
    return v != null && SUPPORTED_LOCALES.includes(v) ? v : null;
  } catch { return null; }
}

export async function setUserLocalePref(env: any, userId: number, pref: any) {
  await setUserLocalePrefRepo(env.DB, userId, pref);
}

// Read the users row's server details [{id, name, icon, permissions, owner}]; no row -> null
export async function getUserServers(db: D1Database, userId: number) {
  try {
    const guildsJson = await getUserGuildsJson(db, userId);
    if (guildsJson === null) return null;
    const arr = JSON.parse(guildsJson || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch { return null; }
}

/* ================= Discord OAuth ================= */
// Mobile login handoff: the app opens /auth/discord/login?app=<callback> in
// the system browser. The callback must exactly equal the app scheme below
// (exact-match whitelist, so an open redirect cannot leak the session token).
// On a hit, login state carries an app flag and success 302s back to the app
// with the session JWT in the query string; web login without `app` is
// unchanged (returnTo + set-cookie).
export const APP_AUTH_REDIRECT = 'yanyun://auth-callback';
const DISCORD_API = 'https://discord.com/api/v10';
// Root for server-side token/API calls; defaults to real Discord.
// DISCORD_API_BASE exists only for local stub testing; unset in production.
function discordRoot(env: any) {
  return (env && env.DISCORD_API_BASE) || 'https://discord.com';
}

/* ============ Server nick snapshots + refresh token (lazy refresh) ============
 * No background scraping / cron / bot: nicks for bound servers are fetched
 * once at login callback; afterwards, viewer checks refetch in-request only
 * when a snapshot is missing or older than 24h, using the stored refresh
 * token. The refresh token is a credential: stored only in D1
 * (user_oauth), never in the JWT, never sent to the frontend; Discord
 * rotates it on every refresh, so the new one must overwrite the stored
 * copy. Only a permanent failure (invalid_grant = revoked/expired) marks
 * needs_relogin, which invalidates the session (see
 * getSessionUserChecked). Transient failures (network/timeout/5xx) leave
 * refresh_state untouched and retry on the next visit — never log a user
 * out over Discord flakiness. */
const NICK_TTL_SEC = 24 * 3600;

async function fetchWithTimeout(url: string, init: any, ms = 3500) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(url, { ...(init || {}), signal: ctl.signal }); }
  finally { clearTimeout(t); }
}

async function fetchMemberNick(env: any, accessToken: string, guildId: string) {
  try {
    const r = await fetchWithTimeout(`${discordRoot(env)}/api/v10/users/@me/guilds/${guildId}/member`, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!r.ok) return null;
    const m: any = await r.json().catch(() => null);
    return m && typeof m.nick === 'string' ? m.nick : '';
  } catch { return null; }
}

async function boundGuildIds(db: D1Database) {
  return listDistinctSettingValues(db, 'discord_guild_id');
}

async function upsertNick(db: D1Database, discordId: string, guildId: string, nick: string) {
  const now = Math.floor(Date.now() / 1000);
  await upsertNickRepo(db, discordId, guildId, nick, now);
}

async function touchNick(db: D1Database, discordId: string, guildId: string) {
  const now = Math.floor(Date.now() / 1000);
  await touchNickRepo(db, discordId, guildId, now);
}

export async function getGuildNick(db: D1Database, discordId: string, guildId: string) {
  try {
    const row = await getNickRow(db, discordId, guildId);
    return row ? String(row.nick || '') : null;
  } catch { return null; }
}

// Lazy-refresh entry, called from viewer checks. Fully tolerant: any failure silently keeps the old snapshot.
export async function maybeRefreshGuildNicks(env: any, user: any) {
  try {
    if (!env || !env.DB || !user || !user.discordId) return;
    if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET) return;
    const db = env.DB;
    const row = await getOAuthRefresh(db, user.userId).catch(() => null);
    if (!row || !row.refresh_token || row.refresh_state === 'needs_relogin') return;
    const bound = new Set(await boundGuildIds(db));
    const targets = (user.guilds || []).map(String).filter((g: string) => bound.has(g));
    if (!targets.length) return;
    const now = Math.floor(Date.now() / 1000);
    const results = await listNickRowsByUser(db, user.discordId).catch(() => []);
    const freshAt = new Map(results.map((r) => [String(r.guild_id), Number(r.updated_at) || 0]));
    const stale = targets.filter((g: string) => !freshAt.has(g) || now - (freshAt.get(g) ?? 0) > NICK_TTL_SEC);
    if (!stale.length) return;
    // Exchange the refresh token (rotation: the response's new refresh token overwrites the stored one)
    const tokenRes = await fetchWithTimeout(`${discordRoot(env)}/api/oauth2/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: String(row.refresh_token),
      }),
    }, 5000).catch(() => null);
    const token: any = tokenRes && tokenRes.ok ? await tokenRes.json().catch(() => null) : null;
    if (!token || !token.access_token) {
      // Failure split: only invalid_grant is permanent (grant dead) -> needs_relogin;
      // null tokenRes (network/timeout) or other errors (5xx) are transient; state untouched.
      let permanent = false;
      if (tokenRes && !tokenRes.ok) {
        const errBody: any = await tokenRes.json().catch(() => null);
        permanent = !!errBody && errBody.error === 'invalid_grant';
      }
      if (permanent) {
        await markOAuthNeedsRelogin(db, user.userId, now).catch(() => {});
      }
      return;
    }
    await updateOAuthAfterRefresh(db, user.userId, {
      refreshToken: String(token.refresh_token || row.refresh_token),
      scope: String(token.scope || ''), nowSec: now,
    }).catch(() => {});
    await Promise.all(stale.map(async (gid: string) => {
      const nick = await fetchMemberNick(env, token.access_token, gid);
      if (nick !== null) await upsertNick(db, user.discordId, gid, nick).catch(() => {});
      else await touchNick(db, user.discordId, gid).catch(() => {});
    }));
  } catch { /* lazy refresh must never affect the main request */ }
}

function htmlPage(title: string, bodyHtml: string, status = 200) {
  return new Response(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · 燕云百业</title></head>
<body style="margin:0;background:#0c0b09;color:#ece2cb;font-family:serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
<div style="text-align:center;padding:24px;max-width:420px">
<h1 style="color:#ecd28f;letter-spacing:.1em">${title}</h1>
${bodyHtml}
</div></body></html>`, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

// returnTo allows only in-site absolute paths (open-redirect guard)
function safeReturnTo(raw: any) {
  const v = String(raw || '/').slice(0, 300);
  if (!v.startsWith('/') || v.startsWith('//') || v.includes('\\')) return '/';
  return v;
}

/* ============ Cross-subdomain sign-in: start at the root ============
 * A guild subdomain never starts OAuth itself: its login route 302s
 * to the root login carrying a signed return_to, the root runs the
 * whole Discord round trip against the one registered callback
 * (https://yanyun.app/auth/discord/callback), and the callback 302s
 * back to the return_to target — where the Domain session cookie
 * (see the cookie section) already reads as signed in. The target is
 * signed with the session secret, so the parameter cannot be forged
 * or swapped in transit, and it is validated at both ends
 * regardless: https only, host exactly yanyun.app or below it,
 * never with userinfo. A missing, forged or off-family return_to is
 * ignored and the flow falls back to the plain root sign-in —
 * never an error page, never an open redirect. */
const APEX_LOGIN_URL = 'https://yanyun.app/auth/discord/login';
const RETURN_TO_TTL_SEC = 600;

export function validateReturnToTarget(raw: string): string | null {
  try {
    const u = new URL(String(raw || ''));
    if (u.protocol !== 'https:') return null;
    if (u.username || u.password) return null;
    const host = u.hostname.toLowerCase();
    if (host !== SESSION_COOKIE_DOMAIN && !host.endsWith('.' + SESSION_COOKIE_DOMAIN)) return null;
    return u.toString();
  } catch { return null; }
}

async function readSignedReturnTo(secret: string, param: string): Promise<string | null> {
  if (!param) return null;
  const payload = await verifyJwt(secret, param);
  if (!payload || payload.kind !== 'return-to') return null;
  return validateReturnToTarget(payload.rto);
}

export async function handleDiscordLogin(request: any, env: any) {
  const url = new URL(request.url);
  if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET) {
    return htmlPage('Discord 应用尚未配置',
      '<p>管理员尚未完成 Discord 应用配置，暂时无法登录。</p><p><a href="/" style="color:#c9a35c">返回首页</a></p>', 501);
  }
  if (!env.SESSION_SECRET) {
    return htmlPage('服务端未配置', '<p>会话密钥未配置，请联系管理员。</p>', 500);
  }
  const appAuth = url.searchParams.get('app') === APP_AUTH_REDIRECT;
  // Subdomain start: bounce to the root login with a signed
  // return_to naming the page the member asked for on this host.
  // The mobile handoff keeps starting in place (the app opens the
  // root origin itself), so the bounce is web-only.
  const subdomainSlug = parseGuildSubdomainSlug(url.hostname);
  if (subdomainSlug && !appAuth) {
    const target = validateReturnToTarget(
      guildSubdomainOrigin(subdomainSlug) + safeReturnTo(url.searchParams.get('returnTo') || '/'));
    if (target) {
      const signed = await signJwt(env.SESSION_SECRET, { rto: target, kind: 'return-to' }, RETURN_TO_TTL_SEC);
      return Response.redirect(`${APEX_LOGIN_URL}?return_to=${encodeURIComponent(signed)}`, 302);
    }
  }
  // Root start: a signed return_to (minted by the bounce above) is
  // carried into the OAuth state and honored by the callback after
  // the session is minted. Only the apex consumes the parameter;
  // invalid ones are dropped silently.
  const crossReturnTo = !appAuth && url.hostname.toLowerCase() === SESSION_COOKIE_DOMAIN
    ? await readSignedReturnTo(env.SESSION_SECRET, url.searchParams.get('return_to') || '')
    : null;
  const returnTo = safeReturnTo(url.searchParams.get('returnTo') || '/');
  const state = await signJwt(env.SESSION_SECRET, {
    rt: returnTo, kind: 'oauth-state',
    ...(crossReturnTo ? { rto: crossReturnTo } : {}),
    ...(appAuth ? { app: 1 } : {}),
  }, 600);
  const redirectUri = `${url.origin}/auth/discord/callback`;
  const auth = new URL('https://discord.com/api/oauth2/authorize');
  auth.searchParams.set('client_id', env.DISCORD_CLIENT_ID);
  auth.searchParams.set('redirect_uri', redirectUri);
  auth.searchParams.set('response_type', 'code');
  auth.searchParams.set('scope', 'identify guilds guilds.members.read');
  auth.searchParams.set('state', state);
  return Response.redirect(auth.toString(), 302);
}

export async function handleDiscordCallback(request: any, env: any) {
  const url = new URL(request.url);
  const fail = (msg: string) => htmlPage('登录失败', `<p>${msg}</p><p><a href="/" style="color:#c9a35c">返回首页</a></p>`, 400);
  if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET || !env.SESSION_SECRET) {
    return htmlPage('Discord 应用尚未配置', '<p>管理员尚未完成 Discord 应用配置，暂时无法登录。</p>', 501);
  }
  const code = url.searchParams.get('code');
  const stateRaw = url.searchParams.get('state');
  if (!code) return fail('Discord 未返回授权码，请重试。');
  const state = stateRaw ? await verifyJwt(env.SESSION_SECRET, stateRaw) : null;
  if (!state || state.kind !== 'oauth-state') return fail('登录状态已失效，请重新登录。');
  const returnTo = safeReturnTo(state.rt || '/');
  // Cross-subdomain return target: validated when the root login
  // accepted it, and re-validated here before it is trusted as a
  // redirect target.
  const crossReturnTo = state.rto ? validateReturnToTarget(state.rto) : null;
  const redirectUri = `${url.origin}/auth/discord/callback`;

  // code -> access token
  const tokenRes = await fetch(`${discordRoot(env)}/api/oauth2/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenRes.ok) return fail('与 Discord 换取令牌失败，请重试。');
  const token: any = await tokenRes.json().catch(() => null);
  if (!token || !token.access_token) return fail('与 Discord 换取令牌失败，请重试。');
  const authz = { headers: { authorization: `Bearer ${token.access_token}` } };

  const meRes = await fetch(`${discordRoot(env)}/api/v10/users/@me`, authz);
  if (!meRes.ok) return fail('读取 Discord 账号信息失败，请重试。');
  const me: any = await meRes.json();
  const guildsRes = await fetch(`${discordRoot(env)}/api/v10/users/@me/guilds`, authz);
  const guildsRaw: any = guildsRes.ok ? await guildsRes.json().catch(() => []) : [];
  const servers = (Array.isArray(guildsRaw) ? guildsRaw : []).map((g: any) => ({
    id: String(g.id),
    name: String(g.name || ''),
    icon: g.icon ? String(g.icon) : '',
    permissions: String(g.permissions || '0'),
    owner: !!g.owner,
  }));

  const avatar = me.avatar
    ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png?size=128`
    : '';
  const displayName = me.global_name || me.username || '';

  // Persist (server details incl. permission bits, for viewer.discordServers / createGuild checks).
  // The upsert returns the numeric user ID (minted on first login);
  // the session below carries it as sub. If persistence fails the
  // login cannot proceed — there is no internal ID to carry.
  let userId: number;
  try {
    userId = await upsertUserOnLogin(env.DB, {
      discordId: String(me.id), username: displayName, avatar,
      guildsJson: JSON.stringify(servers), checkedAtSec: Math.floor(Date.now() / 1000),
    });
  } catch {
    return fail('账号登记失败，请重试。');
  }

  // Store the refresh token (D1 only, never JWT/frontend) + fetch bound-server
  // nicks once. Fully tolerant: no step's failure or timeout may fail the login.
  try {
    const nowSec = Math.floor(Date.now() / 1000);
    // A completed OAuth round trip is a fresh authentication: stamp it
    // (the export / deletion gates measure from here) and settle a
    // pending account deletion — a login before the cooling-off
    // deadline cancels the request; after it, the sweep still runs.
    await noteFreshAuthAndSettlePending(env.DB, userId, nowSec).catch(() => {});
    if (token.refresh_token) {
      await upsertOAuthOnLogin(env.DB, {
        userId, refreshToken: String(token.refresh_token),
        scope: String(token.scope || ''), nowSec,
      });
    }
    // Skip the fetch when the token response lacks this scope (old/denied grant)
    if (String(token.scope || '').includes('guilds.members.read')) {
      const bound = new Set(await boundGuildIds(env.DB));
      const targets = servers.filter((g) => bound.has(g.id));
      await Promise.all(targets.map(async (g) => {
        try {
          const nick = await fetchMemberNick(env, token.access_token, g.id);
          if (nick !== null) await upsertNick(env.DB, String(me.id), g.id, nick);
          else await touchNick(env.DB, String(me.id), g.id); // failure leaves an empty snapshot; non-blocking
        } catch { /* one server's failure affects neither other servers nor the login */ }
      }));
    }
  } catch { /* nick-chain failure must not block login */ }

  const jwt = await signJwt(env.SESSION_SECRET, {
    sub: String(userId),
    name: displayName,
    avatar,
    guilds: servers.map((g) => g.id),
  });
  // The mint carries the Domain cookie plus the legacy host-only
  // clear (see sessionCookieHeaders), so both are appended.
  const mintHeaders = new Headers();
  for (const c of sessionCookieHeaders(jwt, SESSION_TTL_SEC, url.hostname)) {
    mintHeaders.append('set-cookie', c);
  }
  // Mobile handoff: with the app flag in state, redirect to the app scheme
  // carrying the token (cookie is still set, as on web); the app then calls
  // GraphQL/WS with the JWT in a Cookie header.
  if (state.app === 1) {
    mintHeaders.set('location', `${APP_AUTH_REDIRECT}?token=${encodeURIComponent(jwt)}`);
    return new Response(null, { status: 302, headers: mintHeaders });
  }
  mintHeaders.set('location', crossReturnTo || new URL(returnTo, url.origin).toString());
  return new Response(null, { status: 302, headers: mintHeaders });
}

export async function handleLogout(request: any) {
  // Clears cover both cookie scopes on the host family (the Domain
  // copy and the legacy host-only copy); off-family the single
  // historical clear is emitted unchanged.
  const headers = new Headers();
  for (const c of sessionCookieHeaders('', 0, new URL(request.url).hostname)) {
    headers.append('set-cookie', c);
  }
  if (request.method === 'GET') {
    headers.set('location', '/');
    return new Response(null, { status: 302, headers });
  }
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
