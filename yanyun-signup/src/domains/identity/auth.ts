import { SUPPORTED_LOCALES } from '../platform/index.ts';
import { listDistinctSettingValues } from '../guilds/index.ts';
import {
  ensureUsersTable, ensureUsersLocaleColumn as ensureUsersLocaleColumnRepo,
  ensureNickStoreTables, upsertUserOnLogin, getUserLocalePref as getUserLocalePrefRepo,
  setUserLocalePref as setUserLocalePrefRepo, getUserGuildsJson, getOAuthGrant,
  getOAuthRefresh, upsertOAuthOnLogin, updateOAuthAfterRefresh, markOAuthNeedsRelogin,
  upsertNick as upsertNickRepo, touchNick as touchNickRepo, getNickRow, listNickRowsByUser,
} from './index.ts';

// Discord OAuth + 无状态 JWT 会话 (yy_session cookie)
// 会话载荷: { sub: discord_id, name, avatar, guilds: [服务器 id...], gm?: [{i, p}], iat, exp }
// gm (guilds meta) 仅供运维/测试签发使用, 正式登录流程不写入 (保持 cookie 体积小);
// createGuild 的管理员权限校验优先读 users.guilds_json, 缺行时回退到 gm。

export const SESSION_COOKIE = 'yy_session';
const SESSION_TTL_SEC = 14 * 24 * 3600;

/* ================= 编码小工具 ================= */
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

// 成功返回 payload, 失败返回 null
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

// 从请求解析当前登录用户; 未登录/密钥未配置 -> null
// 令牌来源: yy_session cookie (网页) 或 Authorization: Bearer (移动端,
// 与 cookie 同一枚会话 JWT、同一下游校验路径; cookie 优先, 无 cookie
// 才看 Bearer — 浏览器请求不带这个头, 网页行为逐字节不变)。
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
    guildsMeta: Array.isArray(p.gm) ? p.gm : null, // 仅测试签发时存在
  };
}

/* ============ 会话有效性: Discord 授权必须完整 (用户裁决) ============
 * 不挂"请重新登录"横幅 — 授权不完整的老会话直接作废: 无 user_oauth 行 /
 * 没存 refresh token / scope 缺 guilds.members.read / refresh_state =
 * needs_relogin (仅 invalid_grant 永久失败才会置此状态), 任一成立即视为
 * 未登录, 并让调用方清掉 yy_session cookie; 用户落到登录页重新登录
 * (带 returnTo) 后即恢复完整授权。查询本身异常时 fail-open, 不因
 * D1 抖动误踢完整授权的用户。 */
export async function hasCompleteDiscordGrant(env: any, discordId: string) {
  try {
    if (!env || !env.DB || !discordId) return false;
    await ensureNickStore(env.DB);
    const row = await getOAuthGrant(env.DB, discordId);
    if (!row || !row.refresh_token) return false;
    if (row.refresh_state === 'needs_relogin') return false;
    const scopes = String(row.scope || '').split(/\s+/).filter(Boolean);
    return scopes.includes('guilds.members.read');
  } catch { return true; }
}

// getSessionUser + 授权完整性校验: 返回 { user, clearCookie }。
// JWT 本身无效/缺失 -> 与旧行为一致 (user=null, 不清 cookie);
// JWT 有效但授权不完整 -> user=null 且 clearCookie=true。
export async function getSessionUserChecked(request: any, env: any) {
  const user = await getSessionUser(request, env);
  if (!user) return { user: null, clearCookie: false };
  const ok = await hasCompleteDiscordGrant(env, user.discordId);
  return ok ? { user, clearCookie: false } : { user: null, clearCookie: true };
}

/* ================= D1: users 表 (懒迁移已归数据层 users repository) =================
 * ensureSchema / ensureUsersLocaleColumn 保留旧名导出, 本体在仓库内
 * (src/domains/identity/users.ts), 缓存/重试语义与旧实现一致。 */

/* ---------- 界面语言偏好 (账号级, 存 users.locale_pref) ----------
 * null = 自动 (跟随浏览器语言); 有值时压过浏览器语言。懒 DDL 加列,
 * 读写都校验值在受支持集合内, 脏值按未设置处理。 */
export function ensureSchema(db: D1Database) {
  return ensureUsersTable(db);
}

export function ensureUsersLocaleColumn(db: D1Database) {
  return ensureUsersLocaleColumnRepo(db);
}

export async function getUserLocalePref(env: any, discordId: string) {
  try {
    if (!env || !env.DB || !discordId) return null;
    await ensureUsersLocaleColumn(env.DB);
    const v = await getUserLocalePrefRepo(env.DB, String(discordId));
    return v != null && SUPPORTED_LOCALES.includes(v) ? v : null;
  } catch { return null; }
}

export async function setUserLocalePref(env: any, discordId: string, pref: any) {
  await ensureUsersLocaleColumn(env.DB);
  await setUserLocalePrefRepo(env.DB, String(discordId), pref);
}

// 读 users 行的服务器明细 [{id, name, icon, permissions, owner}]; 无行 -> null
export async function getUserServers(db: D1Database, discordId: string) {
  try {
    await ensureSchema(db);
    const guildsJson = await getUserGuildsJson(db, discordId);
    if (guildsJson === null) return null;
    const arr = JSON.parse(guildsJson || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch { return null; }
}

/* ================= Discord OAuth ================= */
// 移动端登录交接: App 用系统浏览器打开 /auth/discord/login?app=<回调> 发起
// 登录, 回调地址必须精确等于下面这个 App 自定义 scheme (白名单精确匹配,
// 防开放重定向把会话令牌送去别处)。命中时登录 state 里带 app 标记, 回调
// 成功后 302 跳回 App 并在查询串里带上会话 JWT; 不带 app 参数的网页登录
// 流程与之前逐字节一致 (仍是 returnTo + set-cookie)。
export const APP_AUTH_REDIRECT = 'yanyun://auth-callback';
const DISCORD_API = 'https://discord.com/api/v10';
// 服务端调用 (token / API) 的根地址; 默认真实 Discord。
// DISCORD_API_BASE 仅供本地打桩验收覆盖, 生产不设此变量。
function discordRoot(env: any) {
  return (env && env.DISCORD_API_BASE) || 'https://discord.com';
}

/* ============ 服务器昵称快照 + refresh token (懒刷新模型) ============
 * 不做后台批量抓取 / cron / bot: 登录回调拉一次已绑定服务器的昵称;
 * 之后用户打开应用走 viewer 校验时, 快照缺失或超过 24h 才用存下的
 * refresh token 现拉 (本次请求内同步完成)。refresh token 是凭证:
 * 只存 D1 (user_oauth), 绝不进 JWT、绝不下发前端; Discord 每次刷新
 * 轮换 refresh token, 新的必须覆盖存回。刷新只有永久失败 (Discord 明确回
 * invalid_grant = refresh token 被撤销/已失效) 才标 needs_relogin — 该状态
 * 会使会话失效 (见 getSessionUserChecked), 逼用户重新登录换新授权;
 * 暂时故障 (网络/超时/5xx 等) 不动 refresh_state, 本次跳过, 下次打开再试,
 * 绝不因 Discord 抖动把用户踢下线。 */
const NICK_TTL_SEC = 24 * 3600;

export function ensureNickStore(db: D1Database) {
  return ensureNickStoreTables(db);
}

async function fetchWithTimeout(url: string, init: any, ms = 3500) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(url, { ...(init || {}), signal: ctl.signal }); }
  finally { clearTimeout(t); }
}

// 成功返回昵称 (无昵称为 ''), 失败返回 null
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

// 拉取失败时只刷新时间戳 (无行则落一条空快照), 不覆盖已有昵称
async function touchNick(db: D1Database, discordId: string, guildId: string) {
  const now = Math.floor(Date.now() / 1000);
  await touchNickRepo(db, discordId, guildId, now);
}

// 读快照昵称: 有行返回 nick (可能 ''), 无行返回 null
export async function getGuildNick(db: D1Database, discordId: string, guildId: string) {
  try {
    await ensureNickStore(db);
    const row = await getNickRow(db, discordId, guildId);
    return row ? String(row.nick || '') : null;
  } catch { return null; }
}

// 懒刷新入口: viewer 校验时调用。全程容错, 任何失败都静默用旧快照。
export async function maybeRefreshGuildNicks(env: any, user: any) {
  try {
    if (!env || !env.DB || !user || !user.discordId) return;
    if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET) return;
    const db = env.DB;
    await ensureNickStore(db);
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
    // refresh token 换 access token (轮换: 响应里的新 refresh token 覆盖存回)
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
      // 失败分类: 只有 invalid_grant 是永久失败 (授权已死) -> 标 needs_relogin;
      // tokenRes 为 null (网络/超时) 或其他错误 (5xx 等) 都是暂时故障, 状态不动。
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
  } catch { /* 懒刷新绝不影响主请求 */ }
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

// returnTo 只允许站内绝对路径, 防开放重定向
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

  // 落库 (服务器明细含权限位, 供 viewer.discordServers / createGuild 校验)
  try {
    await ensureSchema(env.DB);
    await upsertUserOnLogin(env.DB, {
      discordId: String(me.id), username: displayName, avatar,
      guildsJson: JSON.stringify(servers), checkedAtSec: Math.floor(Date.now() / 1000),
    });
  } catch { /* 落库失败不阻塞登录, 会话里有服务器 id 列表 */ }

  // refresh token 入库 (凭证, 只存 D1, 绝不进 JWT/前端) + 已绑定服务器昵称拉一次。
  // 全程容错: 任一步失败/超时都不能让登录失败; 失败落空快照继续。
  try {
    await ensureNickStore(env.DB);
    const nowSec = Math.floor(Date.now() / 1000);
    if (token.refresh_token) {
      await upsertOAuthOnLogin(env.DB, {
        discordId: String(me.id), refreshToken: String(token.refresh_token),
        scope: String(token.scope || ''), nowSec,
      });
    }
    // token 响应没给这个 scope (老授权/被拒) 就跳过拉取
    if (String(token.scope || '').includes('guilds.members.read')) {
      const bound = new Set(await boundGuildIds(env.DB));
      const targets = servers.filter((g) => bound.has(g.id));
      await Promise.all(targets.map(async (g) => {
        try {
          const nick = await fetchMemberNick(env, token.access_token, g.id);
          if (nick !== null) await upsertNick(env.DB, String(me.id), g.id, nick);
          else await touchNick(env.DB, String(me.id), g.id); // 失败落空快照, 不阻塞
        } catch { /* 单个服务器失败不影响其他服务器与登录 */ }
      }));
    }
  } catch { /* 昵称链路故障不阻塞登录 */ }

  const jwt = await signJwt(env.SESSION_SECRET, {
    sub: String(me.id),
    name: displayName,
    avatar,
    guilds: servers.map((g) => g.id),
  });
  // 移动端交接: state 带 app 标记时跳回 App scheme 并带上令牌 (cookie 照常
  // 种下, 与网页流程无差异); App 侧拿到 JWT 后以 Cookie 头调 GraphQL/WS。
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
