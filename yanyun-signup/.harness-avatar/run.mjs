// 百业自定义头像验收 (2026-10-26): 管理员直传 (gadmin 通道) -> D1
// blob (guild_avatars) -> 主 Worker 公开出图 /api/guilds/:slug/avatar
// -> GraphQL avatarUrl (Guild / GuildReadOnly / GuildCard 三面) /
// webhook 发送身份 / OG 卡面绘入。FakeDB 按 SQL 形状路由, guild_avatars
// 真落内存表; REST 走真 worker.fetch, GraphQL 走真 yoga。
import { yoga } from '../src/graphql.js';
import { CATALOG } from '../src/i18n.js';
import {
  AVATAR_MAX_BYTES, sniffAvatarType, webhookIdentity, avatarPublicUrl,
  putGuildAvatar, deleteGuildAvatar,
} from '../src/guildavatar.js';
import { postWebhook, REMINDER_USERNAME, REMINDER_AVATAR_URL } from '../src/reminder.js';
import { sendHeirloomTest } from '../src/heirloompush.js';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}
function eq(name, got, want) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

async function sha256hex(data) {
  const buf = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const d = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Drizzle query-builder channel: selects/gets with field mapping run in
   values mode on the D1 driver, i.e. stmt.bind(...).raw(), which returns
   value arrays in SELECT column order. Convert this FakeDB's routed
   object rows into that shape; unparseable column lists (functions /
   subqueries) fall back to the row objects' own value order. */
function toRawRows(sqlText, rows) {
  if (!rows || !rows.length) return [];
  let cols = null;
  const m = /select\s+([\s\S]+?)\s+from\s/i.exec(sqlText);
  if (m) {
    const parts = m[1].split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length && parts.every((p) => !p.includes('(') && !p.includes(')'))) {
      cols = parts.map((p) => {
        const as = /\bas\s+"?([A-Za-z0-9_]+)"?\s*$/i.exec(p);
        if (as) return as[1];
        const clean = p.replace(/"/g, '');
        const dot = clean.lastIndexOf('.');
        return (dot >= 0 ? clean.slice(dot + 1) : clean).trim();
      });
      if (cols.some((c) => !c || c === '*')) cols = null;
    }
  }
  return rows.map((r) => (cols
    ? cols.map((c) => (r[c] === undefined ? null : r[c]))
    : Object.values(r)));
}

/* ---------------- FakeDB ---------------- */
function makeDb({ tenants = [], settings = {} } = {}) {
  const state = {
    tenants: tenants.map((t) => ({ ...t })),
    settings: new Map(Object.entries(settings)), // `${tenant}::${key}` -> value
    avatars: new Map(), // tenant -> { content_type, bytes, hash, updated_at }
  };
  function route(kind, sql, b) {
    // 数据层 (Drizzle) 生成的 SQL 带引号标识符与表限定前缀, 规范化回旧
    // 形状再匹配 (仅路由匹配泛化, 断言与状态语义不变)。
    sql = sql.replace(/"/g, '').replace(/settings\./g, '');
    if (/guild_avatars/.test(sql)) {
      if (/INSERT INTO guild_avatars/.test(sql)) {
        state.avatars.set(b[0], { content_type: b[1], bytes: b[2], hash: b[3], updated_at: b[4] });
        return { meta: {} };
      }
      if (/DELETE FROM guild_avatars/.test(sql)) { state.avatars.delete(b[0]); return { meta: {} }; }
      if (/FROM guild_avatars/.test(sql)) {
        const row = state.avatars.get(b[0]) || null;
        if (kind === 'first') return row;
        return { results: row ? [row] : [] };
      }
      return { meta: {} }; // CREATE TABLE
    }
    if (/FROM tenants/.test(sql)) {
      if (/WHERE slug/.test(sql)) {
        const t = state.tenants.find((x) => x.slug === b[0]) || null;
        return kind === 'first' ? t : { results: t ? [t] : [] };
      }
      return kind === 'first' ? (state.tenants[0] || null) : { results: state.tenants };
    }
    if (/FROM settings/.test(sql)) {
      if (/WHERE tenant\s*=\s*\? AND key\s*=\s*\?/.test(sql)) {
        const v = state.settings.get(`${b[0]}::${b[1]}`);
        return kind === 'first' ? (v == null ? null : { value: v }) : { results: v == null ? [] : [{ value: v }] };
      }
      if (/WHERE key\s*=\s*\?/.test(sql)) {
        const rows = [];
        for (const [k, v] of state.settings) {
          const [tenant, key] = k.split('::');
          if (key === b[0] && v != null && v !== '') rows.push({ tenant, value: v });
        }
        return kind === 'first' ? (rows[0] || null) : { results: rows };
      }
      if (/WHERE tenant\s*=\s*\?/.test(sql)) {
        const rows = [];
        for (const [k, v] of state.settings) {
          const [tenant, key] = k.split('::');
          if (tenant === b[0]) rows.push({ key, value: v });
        }
        return kind === 'first' ? (rows[0] || null) : { results: rows };
      }
      return kind === 'first' ? null : { results: [] };
    }
    if (/INSERT INTO settings|UPDATE settings/.test(sql)) return { meta: {} };
    if (/COUNT\(DISTINCT/.test(sql)) return kind === 'first' ? { c: 0 } : { results: [{ c: 0 }] };
    if (/PRAGMA/.test(sql)) return { results: [] };
    if (kind === 'first') return null;
    if (kind === 'all') return { results: [] };
    return { meta: {} };
  }
  const stmt = (sql) => ({
    _b: [], bind(...a) { this._b = a; return this; },
    async raw() { const res = await route('all', sql, this._b); return toRawRows(sql, (res && res.results) || []); },
    async first() { return route('first', sql, this._b); },
    async all() { return route('all', sql, this._b); },
    async run() { return route('run', sql, this._b); },
  });
  return { db: { prepare: (sql) => stmt(sql) }, state };
}

function makeCtx() {
  const pending = [];
  return { ctx: { waitUntil(p) { pending.push(Promise.resolve(p).catch(() => {})); } }, pending };
}
const ASSETS = { fetch: async () => new Response('not found', { status: 404 }) };

/* 合成测试图: 只有魔数是真的 (服务端嗅探只认魔数, 与生产同口径) */
function pngBytes(n = 128) {
  const b = new Uint8Array(n);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  for (let i = 8; i < n; i++) b[i] = (i * 7) % 251;
  return b;
}
function jpegBytes(n = 96) {
  const b = new Uint8Array(n);
  b.set([0xff, 0xd8, 0xff, 0xe0]);
  for (let i = 4; i < n; i++) b[i] = (i * 5) % 241;
  return b;
}

/* ================= i18n: 头像错误文案 ×5 语齐备 ================= */
for (const key of ['avatarTooLarge', 'avatarBadType', 'avatarEmpty']) {
  const entry = CATALOG.errors[key];
  check(`i18n errors.${key} 五语齐备`, !!entry && ['zh-CN', 'en', 'es', 'fr', 'zh-TW'].every((l) => entry[l]));
}

/* ================= 嗅探单元 ================= */
eq('sniff png', sniffAvatarType(pngBytes()), 'image/png');
eq('sniff jpeg', sniffAvatarType(jpegBytes()), 'image/jpeg');
eq('sniff webp', sniffAvatarType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])), 'image/webp');
eq('sniff 文本伪图 -> null', sniffAvatarType(new TextEncoder().encode('not an image at all')), null);

/* ================= REST: 上传/出图/鉴权/限额/删除 ================= */
const worker = (await import('../src/worker.js')).default;
const pwHash = await sha256hex('guildpass123');
const { db, state } = makeDb({
  tenants: [
    { slug: 'test1', guild_name: '测试一业', slogan: 's1', password_hash: pwHash },
    { slug: 'test2', guild_name: '测试二业', slogan: '', password_hash: pwHash },
  ],
});
const env = { DB: db, ADMIN_PASSWORD: 'test-admin-pw', ASSETS };
const { ctx, pending } = makeCtx();
const call = (path, opts = {}) => worker.fetch(new Request('http://local' + path, opts), env, ctx);

async function login(slug) {
  const r = await call(`/api/${slug}/admin/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'guildpass123' }),
  });
  const j = await r.json();
  return j.token;
}
const token1 = await login('test1');
const token2 = await login('test2');
check('管理员登录签发 token', typeof token1 === 'string' && token1.includes('.'));

// 无头像: 公开出图 404
let r = await call('/api/guilds/test1/avatar');
eq('无头像出图 -> 404', r.status, 404);
await r.text();

// 未登录上传拒绝
const png = pngBytes();
r = await call('/api/test1/admin/avatar', { method: 'PUT', headers: { 'content-type': 'image/png' }, body: png });
eq('未登录 PUT 头像 -> 401', r.status, 401);
await r.text();

// 他业管理员 token 传本业头像拒绝 (token 绑 slug)
r = await call('/api/test1/admin/avatar', {
  method: 'PUT', headers: { 'content-type': 'image/png', authorization: 'Bearer ' + token2 }, body: png,
});
eq('他业管理员 PUT 本业头像 -> 401', r.status, 401);
await r.text();

// 本业管理员上传 PNG -> 200 + 版本化 URL + hash 对
r = await call('/api/test1/admin/avatar', {
  method: 'PUT', headers: { 'content-type': 'image/png', authorization: 'Bearer ' + token1 }, body: png,
});
eq('本业管理员 PUT PNG -> 200', r.status, 200);
let j = await r.json();
const pngHash = await sha256hex(png);
eq('上传返回 hash = 内容 sha256', j.hash, pngHash);
eq('上传返回 avatarUrl 带 hash8', j.avatarUrl, `/api/guilds/test1/avatar?v=${pngHash.slice(0, 8)}`);

// 出图 round-trip: 字节一致 + content-type + 长缓存 + ETag
r = await call('/api/guilds/test1/avatar?v=' + pngHash.slice(0, 8));
eq('出图 -> 200', r.status, 200);
eq('出图 content-type', r.headers.get('content-type'), 'image/png');
check('出图长缓存 immutable', (r.headers.get('cache-control') || '').includes('immutable'), r.headers.get('cache-control'));
eq('出图 ETag = hash', r.headers.get('etag'), `"${pngHash}"`);
const served = new Uint8Array(await r.arrayBuffer());
check('出图字节与上传一致', served.length === png.length && served.every((v, i) => v === png[i]));
// 条件请求 304
r = await call('/api/guilds/test1/avatar?v=' + pngHash.slice(0, 8), { headers: { 'if-none-match': `"${pngHash}"` } });
eq('If-None-Match -> 304', r.status, 304);
await r.text();

// 超限拒绝 (413 + i18n 错误码/文案; en 头给英文)
const big = pngBytes(AVATAR_MAX_BYTES + 1);
r = await call('/api/test1/admin/avatar', {
  method: 'PUT', headers: { 'content-type': 'image/png', authorization: 'Bearer ' + token1, 'accept-language': 'en' }, body: big,
});
eq('超 400KB -> 413', r.status, 413);
j = await r.json();
eq('超限 errorCode', j.errorCode, 'avatarTooLarge');
eq('超限文案按头协商 (en)', j.message, CATALOG.errors.avatarTooLarge.en);

// 伪类型拒绝 (文本冒充 png)
r = await call('/api/test1/admin/avatar', {
  method: 'PUT', headers: { 'content-type': 'image/png', authorization: 'Bearer ' + token1 },
  body: new TextEncoder().encode('{"not":"an image"}'),
});
eq('伪类型 -> 415', r.status, 415);
j = await r.json();
eq('伪类型 errorCode', j.errorCode, 'avatarBadType');
eq('伪类型文案默认 zh-CN', j.message, CATALOG.errors.avatarBadType['zh-CN']);

// 空体拒绝
r = await call('/api/test1/admin/avatar', {
  method: 'PUT', headers: { 'content-type': 'image/png', authorization: 'Bearer ' + token1 }, body: new Uint8Array(0),
});
eq('空体 -> 400', r.status, 400);
j = await r.json();
eq('空体 errorCode', j.errorCode, 'avatarEmpty');
// 拒绝后旧头像不受影响
eq('拒绝后头像仍是 PNG 版', state.avatars.get('test1')?.hash, pngHash);

// 换 JPEG: hash/URL/出图类型随之切换
const jpg = jpegBytes();
r = await call('/api/test1/admin/avatar', {
  method: 'PUT', headers: { 'content-type': 'image/jpeg', authorization: 'Bearer ' + token1 }, body: jpg,
});
eq('换 JPEG -> 200', r.status, 200);
j = await r.json();
const jpgHash = await sha256hex(jpg);
eq('换图后 avatarUrl 更新', j.avatarUrl, `/api/guilds/test1/avatar?v=${jpgHash.slice(0, 8)}`);
r = await call('/api/guilds/test1/avatar?v=' + jpgHash.slice(0, 8));
eq('换图后出图 content-type', r.headers.get('content-type'), 'image/jpeg');
await r.arrayBuffer();

// 管理面状态 + 旧 REST 面未被新路由干扰
r = await call('/api/test1/admin/avatar', { headers: { authorization: 'Bearer ' + token1 } });
j = await r.json();
check('管理面状态 hasAvatar', j.ok && j.hasAvatar === true && j.hash === jpgHash, JSON.stringify(j).slice(0, 120));
r = await call('/api/test1/settings');
eq('/api/:slug/settings 不受 guilds 路由影响 -> 200', r.status, 200);
await r.json();

/* ================= GraphQL: avatarUrl 两态 ================= */
async function gql(query, variables) {
  const gctx = { env: { DB: db }, request: new Request('http://local/graphql'), user: null, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), gctx);
  return res.json();
}
const guildQ = `query($slug: String!) { viewer { guild(slug: $slug) { __typename
  ... on GuildReadOnly { avatarUrl name } ... on Guild { avatarUrl } } } }`;
let g = await gql(guildQ, { slug: 'test1' });
check('GraphQL 无 errors', !g.errors, JSON.stringify(g.errors || '').slice(0, 200));
eq('未绑定百业匿名面 = GuildReadOnly', g.data?.viewer?.guild?.__typename, 'GuildReadOnly');
eq('有头像 avatarUrl = origin + 版本化路径', g.data?.viewer?.guild?.avatarUrl, `http://local/api/guilds/test1/avatar?v=${jpgHash.slice(0, 8)}`);

const hubQ = `query { hubPage { guilds { slug avatarUrl } } }`;
g = await gql(hubQ, {});
const card = (g.data?.hubPage?.guilds || []).find((x) => x.slug === 'test1');
check('hubPage GuildCard 在列', !!card, JSON.stringify(g.data || g.errors || '').slice(0, 200));
eq('GuildCard.avatarUrl 同值', card?.avatarUrl, `http://local/api/guilds/test1/avatar?v=${jpgHash.slice(0, 8)}`);

/* ================= webhook 身份 (模块级; 发送体切换在 [3/3] 段) ================= */
let ident = await webhookIdentity(db, 'test1');
eq('有头像 webhookIdentity.username = 百业名', ident?.username, '测试一业');
eq('有头像 webhookIdentity.avatarUrl = 规范域名公开 URL', ident?.avatarUrl, avatarPublicUrl('test1', jpgHash));
ident = await webhookIdentity(db, 'test2');
eq('无头像 webhookIdentity = null (回退平台默认)', ident, null);

/* ================= 删除: 出图 404 + avatarUrl 回 null ================= */
r = await call('/api/test1/admin/avatar', { method: 'DELETE', headers: { authorization: 'Bearer ' + token1 } });
eq('管理员 DELETE 头像 -> 200', r.status, 200);
await r.json();
r = await call('/api/guilds/test1/avatar?v=' + jpgHash.slice(0, 8));
eq('删除后出图 -> 404', r.status, 404);
await r.text();
g = await gql(guildQ, { slug: 'test1' });
eq('删除后 avatarUrl 回 null', g.data?.viewer?.guild?.avatarUrl, null);
ident = await webhookIdentity(db, 'test1');
eq('删除后 webhookIdentity 回 null', ident, null);

/* ================= [3/3] webhook 发送体: 身份两态切换 ================= */
{
  const { db: db2 } = makeDb({
    tenants: [{ slug: 'test1', guild_name: '测试一业', slogan: '', password_hash: pwHash }],
    settings: { 'test1::heirloom_webhook': 'https://discord.test/webhook' },
  });
  const sent = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    sent.push({ url: String(url), body: JSON.parse(opts.body) });
    return new Response(null, { status: 204 });
  };
  try {
    // 无头像: postWebhook 直调 (identity=null) -> 平台默认身份
    await postWebhook('https://discord.test/webhook', 'hi', [], undefined, null);
    eq('无头像发送体 username = 平台默认', sent[0].body.username, REMINDER_USERNAME);
    eq('无头像发送体 avatar_url = OG hub 图', sent[0].body.avatar_url, REMINDER_AVATAR_URL);

    // 有头像: 身份切换为百业名 + 头像公开 URL, 其余字段不动
    const { hash } = await putGuildAvatar(db2, 'test1', 'image/png', pngBytes());
    const ident2 = await webhookIdentity(db2, 'test1');
    await postWebhook('https://discord.test/webhook', 'hi', ['42'], undefined, ident2);
    eq('有头像发送体 username = 百业名', sent[1].body.username, '测试一业');
    eq('有头像发送体 avatar_url = 头像公开 URL', sent[1].body.avatar_url, `https://yanyun.app/api/guilds/test1/avatar?v=${hash.slice(0, 8)}`);
    eq('身份切换不影响 allowed_mentions', JSON.stringify(sent[1].body.allowed_mentions), JSON.stringify({ parse: [], users: ['42'] }));

    // 传家宝测试发送全链路 (sendHeirloomTest -> postWebhook): 有头像态
    sent.length = 0;
    const hr = await sendHeirloomTest(db2, 'test1');
    check('传家宝测试发送 ok', hr.ok === true, JSON.stringify(hr));
    eq('传家宝发送体 username = 百业名', sent[0]?.body.username, '测试一业');
    eq('传家宝发送体 avatar_url = 头像公开 URL', sent[0]?.body.avatar_url, `https://yanyun.app/api/guilds/test1/avatar?v=${hash.slice(0, 8)}`);

    // 删除头像后传家宝发送回退默认身份
    await deleteGuildAvatar(db2, 'test1');
    sent.length = 0;
    await sendHeirloomTest(db2, 'test1');
    eq('删头像后传家宝 username 回默认', sent[0]?.body.username, REMINDER_USERNAME);
    eq('删头像后传家宝 avatar_url 回默认', sent[0]?.body.avatar_url, REMINDER_AVATAR_URL);
  } finally {
    globalThis.fetch = realFetch;
  }
}

await Promise.all(pending);
console.log(`\n== avatar harness: ${pass} passed, ${fail} failed ==`);
if (fails.length) { console.log('FAILS:\n' + fails.map((f) => ' - ' + f).join('\n')); process.exit(1); }
