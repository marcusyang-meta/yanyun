import { SUPPORTED_LOCALES } from '../platform/index.ts';
import { listDistinctSettingValues } from '../guilds/index.ts';
import { upsertUserOnLogin, getUserLocalePref as getUserLocalePrefRepo, setUserLocalePref as setUserLocalePrefRepo, getUserGuildsJson, getOAuthGrant, getOAuthRefresh, upsertOAuthOnLogin, updateOAuthAfterRefresh, markOAuthNeedsRelogin, upsertNick as upsertNickRepo, touchNick as touchNickRepo, getNickRow, listNickRowsByUser } from './index.ts';

// Discord OAuth + stateless JWT session (yy_session cookie).
// Payload: { sub: discord_id, name, avatar, guilds: [server ids...], gm?: [{i, p}], iat, exp }
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
function parseCookies(request: any): Record<string, string> {
  const out: Record<string, string> = {};
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function sessionCookieHeader(jwt: string, maxAgeSec: number) {
  return `${SESSION_COOKIE}=${jwt}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`;
}

// Token source: yy_session cookie (web) or Authorization: Bearer (mobile) —
// the same session JWT and downstream validation either way. Cookie wins;
// Bearer is consulted only without a cookie, so web behavior is unchanged.
export async function getSessionUser(request: any, env: any) {
  if (!env || !env.SESSION_SECRET) return null;
  let token = parseCookies(request)[SESSION_COOKIE];
  if (!token) {
    const authz = request.headers.get('authorization') || '';
    if (authz.startsWith('Bearer ')) token = authz.slice(7).trim();
  }
  if (!token) return null;
  const p = await verifyJwt(env.SESSION_SECRET, token);
  if (!p || !p.sub) return null;
  return {
    discordId: String(p.sub),
    name: p.name || '',
    avatar: p.avatar || '',
    guilds: Array.isArray(p.guilds) ? p.guilds.map(String) : [],
    guildsMeta: Array.isArray(p.gm) ? p.gm : null, // present only on test-issued sessions
  };
}

/* ============ Session validity: the Discord grant must be complete (ruling) ============
 * No "please log in again" banner — an incomplete old session is voided
 * outright: no user_oauth row / no stored refresh token / scope missing
 * guilds.members.read / refresh_state = needs_relogin (set only on
 * permanent invalid_grant failure). Any of these means logged out, and
 * the caller clears the yy_session cookie; re-login (with returnTo)
 * restores a complete grant. Query errors fail open, so a D1 hiccup
 * never kicks out a fully-authorized user. */
export async function hasCompleteDiscordGrant(env: any, discordId: string) {
  try {
    if (!env || !env.DB || !discordId) return false;
    const row = await getOAuthGrant(env.DB, discordId);
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
  const ok = await hasCompleteDiscordGrant(env, user.discordId);
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
export async function getUserLocalePref(env: any, discordId: string) {
  try {
    if (!env || !env.DB || !discordId) return null;
    const v = await getUserLocalePrefRepo(env.DB, String(discordId));
    return v != null && SUPPORTED_LOCALES.includes(v) ? v : null;
  } catch { return null; }
}

export async function setUserLocalePref(env: any, discordId: string, pref: any) {
  await setUserLocalePrefRepo(env.DB, String(discordId), pref);
}

// Read the users row's server details [{id, name, icon, permissions, owner}]; no row -> null
export async function getUserServers(db: D1Database, discordId: string) {
  try {
    const guildsJson = await getUserGuildsJson(db, discordId);
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
    const row = await getOAuthRefresh(db, user.discordId).catch(() => null);
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
        await markOAuthNeedsRelogin(db, user.discordId, now).catch(() => {});
      }
      return;
    }
    await updateOAuthAfterRefresh(db, user.discordId, {
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

export async function handleDiscordLogin(request: any, env: any) {
  const url = new URL(request.url);
  if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET) {
    return htmlPage('Discord 应用尚未配置',
      '<p>管理员尚未完成 Discord 应用配置，暂时无法登录。</p><p><a href="/" style="color:#c9a35c">返回首页</a></p>', 501);
  }
  if (!env.SESSION_SECRET) {
    return htmlPage('服务端未配置', '<p>会话密钥未配置，请联系管理员。</p>', 500);
  }
  const returnTo = safeReturnTo(url.searchParams.get('returnTo') || '/');
  const appAuth = url.searchParams.get('app') === APP_AUTH_REDIRECT;
  const state = await signJwt(env.SESSION_SECRET, {
    rt: returnTo, kind: 'oauth-state', ...(appAuth ? { app: 1 } : {}),
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

  // Persist (server details incl. permission bits, for viewer.discordServers / createGuild checks)
  try {
    await upsertUserOnLogin(env.DB, {
      discordId: String(me.id), username: displayName, avatar,
      guildsJson: JSON.stringify(servers), checkedAtSec: Math.floor(Date.now() / 1000),
    });
  } catch { /* persistence failure must not block login; the session already carries the server ids */ }

  // Store the refresh token (D1 only, never JWT/frontend) + fetch bound-server
  // nicks once. Fully tolerant: no step's failure or timeout may fail the login.
  try {
    const nowSec = Math.floor(Date.now() / 1000);
    if (token.refresh_token) {
      await upsertOAuthOnLogin(env.DB, {
        discordId: String(me.id), refreshToken: String(token.refresh_token),
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
    sub: String(me.id),
    name: displayName,
    avatar,
    guilds: servers.map((g) => g.id),
  });
  // Mobile handoff: with the app flag in state, redirect to the app scheme
  // carrying the token (cookie is still set, as on web); the app then calls
  // GraphQL/WS with the JWT in a Cookie header.
  if (state.app === 1) {
    return new Response(null, {
      status: 302,
      headers: {
        location: `${APP_AUTH_REDIRECT}?token=${encodeURIComponent(jwt)}`,
        'set-cookie': sessionCookieHeader(jwt, SESSION_TTL_SEC),
      },
    });
  }
  return new Response(null, {
    status: 302,
    headers: {
      location: new URL(returnTo, url.origin).toString(),
      'set-cookie': sessionCookieHeader(jwt, SESSION_TTL_SEC),
    },
  });
}

export async function handleLogout(request: any) {
  if (request.method === 'GET') {
    return new Response(null, {
      status: 302,
      headers: { location: '/', 'set-cookie': sessionCookieHeader('', 0) },
    });
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'set-cookie': sessionCookieHeader('', 0) },
  });
}
