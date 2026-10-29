// Guild custom-avatar acceptance: GraphQL admin upload
// (setGuildAvatar, section 1 of the REST shutdown) -> D1 blob
// (guild_avatars) -> main Worker public serving at the standalone
// /guilds/:slug/avatar -> GraphQL avatarUrl (Guild /
// GuildCard surfaces) / webhook send identity / OG card rendering.
// The retired REST admin avatar flow (password login + binary PUT)
// is gone from this suite: the gate is the Discord-session admin
// verdict, exercised through real yoga with crafted ctx users.
// FakeDB routes by SQL shape, guild_avatars lands in a real
// in-memory table; serving goes through the real worker.fetch.
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { CATALOG } from '../src/domains/platform/i18n.ts';
import {
  AVATAR_MAX_BYTES, sniffAvatarType, webhookIdentity, avatarPublicUrl,
  putGuildAvatar, deleteGuildAvatar,
} from '../src/domains/guilds/guildavatar.ts';
import { postWebhook, REMINDER_USERNAME, REMINDER_AVATAR_URL } from '../src/domains/groupings/reminder.ts';
import { sendHeirloomTest } from '../src/domains/gear/index.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: unknown, want: unknown) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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
function makeDb({ tenants = [], settings = {}, users = {} } = {}) {
  const state = {
    tenants: tenants.map((t) => ({ ...t })),
    settings: new Map(Object.entries(settings)), // `${tenant}::${key}` -> value
    users: new Map(Object.entries(users)), // discord_id -> guilds_json string
    avatars: new Map(), // tenant (guild ID) -> { content_type, bytes, hash, updated_at }
    mint: new Map(),
  };
  function route(kind, sql, b) {
    // Data-layer (Drizzle) SQL carries quoted identifiers and
    // table-qualified prefixes; normalize back to the old shape before
    // matching (routing match only; assertions and state semantics unchanged).
    sql = sql.replace(/"/g, '').replace(/settings\./g, '');
    if (/INSERT INTO id_mint_counters/.test(sql)) {
      const key = `${b[0]}|${b[1]}`;
      const seq = (state.mint.get(key) || 0) + 1;
      state.mint.set(key, seq);
      if (kind === 'first') return { seq };
      if (kind === 'all') return { results: [{ seq }] };
      return { meta: {} };
    }
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
    if (/FROM users/.test(sql)) {
      if (/WHERE id = \?/.test(sql)) {
        const row = [...state.users.entries()].map(([discord_id, u]) => ({ discord_id, ...u })).find((u) => u.id === Number(b[0])) || null;
        if (/guilds_json/.test(sql)) {
          return kind === 'first' ? (row ? { guilds_json: row.guilds_json } : null) : { results: row ? [{ guilds_json: row.guilds_json }] : [] };
        }
        return kind === 'first' ? row : { results: row ? [row] : [] };
      }
      const uj = state.users.get(String(b[0]));
      if (/guilds_json/.test(sql)) {
        return kind === 'first' ? (uj === undefined ? null : { guilds_json: uj.guilds_json }) : { results: uj === undefined ? [] : [{ guilds_json: uj.guilds_json }] };
      }
      return kind === 'first' ? null : { results: [] };
    }
    if (/FROM tenants/.test(sql)) {
      if (/WHERE id = \?/.test(sql)) {
        const t = state.tenants.find((x) => x.id === Number(b[0])) || null;
        return kind === 'first' ? t : { results: t ? [t] : [] };
      }
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
          if (String(tenant) === String(b[0])) rows.push({ key, value: v });
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

/* Synthetic test image: only the magic bytes are real (the server sniffs magic bytes only, same rule as production). */
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

/* ================= GraphQL admin: gate / upload / serve / limit / delete ================= */
/* Typed-ID fixtures (0036): guilds/users carry their numeric primary
   keys; avatars and settings key by the guild ID, the slug stays a
   public handle resolved at the edge. */
const GID1 = 1030100001;
const GID2 = 1030100002;
const UID = { A1: 2030100001, A2: 2030100002, M1: 2030100003 };
const worker = (await import('../src/worker.ts')).default;
const pwHash = await sha256hex('guildpass123');
const DG1 = '111111111111111111';
const DG2 = '222222222222222222';
const serversJson = (rows) => JSON.stringify(rows);
const { db, state } = makeDb({
  tenants: [
    { id: GID1, slug: 'test1', guild_name: '测试一业', slogan: 's1', password_hash: pwHash },
    { id: GID2, slug: 'test2', guild_name: '测试二业', slogan: '', password_hash: pwHash },
  ],
  settings: { [`${GID1}::discord_guild_id`]: DG1, [`${GID2}::discord_guild_id`]: DG2 },
  users: {
    A1: { id: UID.A1, guilds_json: serversJson([{ id: DG1, name: '一业服', icon: '', permissions: '0', owner: true }]) },
    A2: { id: UID.A2, guilds_json: serversJson([{ id: DG2, name: '二业服', icon: '', permissions: '0', owner: true }]) },
    M1: { id: UID.M1, guilds_json: serversJson([{ id: DG1, name: '一业服', icon: '', permissions: '0', owner: false }]) },
  },
});
const ADMIN1 = { userId: UID.A1, discordId: 'A1', name: '一业服主', guilds: [DG1] };
const ADMIN2 = { userId: UID.A2, discordId: 'A2', name: '二业服主', guilds: [DG2] };
const MEMBER1 = { userId: UID.M1, discordId: 'M1', name: '一业成员', guilds: [DG1] };
const env = { DB: db, ADMIN_PASSWORD: 'test-admin-pw', ASSETS };
const { ctx, pending } = makeCtx();
const call = (path, opts = {}) => worker.fetch(new Request('http://local' + path, opts), env, ctx);

async function gqlAdmin(query, variables, { user = null, locale = 'zh-CN' } = {}) {
  const gctx = { env: { DB: db }, request: new Request('http://local/graphql'), user, locale, browserLocale: locale, tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), gctx);
  return res.json();
}
const SET_AVATAR = `mutation($slug: String!, $data: String!) { setGuildAvatar(slug: $slug, dataBase64: $data) { ok error errorCode avatarUrl } }`;
const b64 = (bytes) => Buffer.from(bytes).toString('base64');

/* ================= GraphQL: avatarUrl in both states ================= */
async function gql(query, variables, user = null) {
  const gctx = { env: { DB: db }, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), gctx);
  return res.json();
}
const guildQ = `query($slug: String!) { viewer { guild(slug: $slug) { __typename
  ... on Guild { avatarUrl } } } }`;

/* Shared flow state carried across sections (module-scope lets in the original suite). */
let r: any; let g1: any; let ident: any; let pngHash = ''; let jpgHash = '';

describe('avatar', () => {
  /* ================= i18n: avatar error copy complete in all 5 locales ================= */
  it('i18n: avatar error copy complete in all 5 locales', () => {
    for (const key of ['avatarTooLarge', 'avatarBadType', 'avatarEmpty']) {
      const entry = CATALOG.errors[key];
      check(`i18n errors.${key} 五语齐备`, !!entry && ['zh-CN', 'en', 'es', 'fr', 'zh-TW'].every((l) => entry[l]));
    }
  });

  /* ================= Sniffing units ================= */
  it('Sniffing units', () => {
    eq('sniff png', sniffAvatarType(pngBytes()), 'image/png');
    eq('sniff jpeg', sniffAvatarType(jpegBytes()), 'image/jpeg');
    eq('sniff webp', sniffAvatarType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])), 'image/webp');
    eq('sniff 文本伪图 -> null', sniffAvatarType(new TextEncoder().encode('not an image at all')), null);
  });

  /* ================= GraphQL admin: gate / upload / serve / limit / delete ================= */
  it('GraphQL admin: gate / upload / serve / limit / delete', async () => {
    // Gate: anonymous / plain member / another guild's admin are all refused.
    let g0 = await gqlAdmin(SET_AVATAR, { slug: 'test1', data: b64(pngBytes()) }, { user: null });
    check('匿名 setGuildAvatar 被拒 (adminOnly)', g0.data?.setGuildAvatar?.ok === false && g0.data?.setGuildAvatar?.errorCode === 'adminOnly', JSON.stringify(g0.data?.setGuildAvatar));
    g0 = await gqlAdmin(SET_AVATAR, { slug: 'test1', data: b64(pngBytes()) }, { user: MEMBER1 });
    check('普通成员 setGuildAvatar 被拒 (adminOnly)', g0.data?.setGuildAvatar?.ok === false && g0.data?.setGuildAvatar?.errorCode === 'adminOnly', JSON.stringify(g0.data?.setGuildAvatar));
    g0 = await gqlAdmin(SET_AVATAR, { slug: 'test1', data: b64(pngBytes()) }, { user: ADMIN2 });
    check('他业管理员 setGuildAvatar 本业被拒 (adminOnly)', g0.data?.setGuildAvatar?.ok === false && g0.data?.setGuildAvatar?.errorCode === 'adminOnly', JSON.stringify(g0.data?.setGuildAvatar));

    // No avatar: public serving 404s.
    r = await call('/guilds/test1/avatar');
    eq('无头像出图 -> 404', r.status, 404);
    await r.text();

    // Own admin uploads PNG -> ok + versioned URL + stored hash matches content.
    const png = pngBytes();
    g1 = await gqlAdmin(SET_AVATAR, { slug: 'test1', data: b64(png) }, { user: ADMIN1 });
    check('本业管理员 setGuildAvatar PNG -> ok', g1.data?.setGuildAvatar?.ok === true, JSON.stringify(g1.data?.setGuildAvatar || g1.errors));
    pngHash = await sha256hex(png);
    eq('落库 hash = 内容 sha256', state.avatars.get(GID1)?.hash, pngHash);
    eq('上传返回 avatarUrl 带 hash8', g1.data?.setGuildAvatar?.avatarUrl, `http://local/guilds/test1/avatar?v=${pngHash.slice(0, 8)}`);

    // Serving round-trip: identical bytes + content-type + long cache + ETag.
    r = await call('/guilds/test1/avatar?v=' + pngHash.slice(0, 8));
    eq('出图 -> 200', r.status, 200);
    eq('出图 content-type', r.headers.get('content-type'), 'image/png');
    check('出图长缓存 immutable', (r.headers.get('cache-control') || '').includes('immutable'), r.headers.get('cache-control'));
    eq('出图 ETag = hash', r.headers.get('etag'), `"${pngHash}"`);
    const served = new Uint8Array(await r.arrayBuffer());
    check('出图字节与上传一致', served.length === png.length && served.every((v, i) => v === png[i]));
    // Conditional request -> 304.
    r = await call('/guilds/test1/avatar?v=' + pngHash.slice(0, 8), { headers: { 'if-none-match': `"${pngHash}"` } });
    eq('If-None-Match -> 304', r.status, 304);
    await r.text();

    // Oversize rejected (payload errorCode + localized copy; en ctx yields English).
    const big = pngBytes(AVATAR_MAX_BYTES + 1);
    g1 = await gqlAdmin(SET_AVATAR, { slug: 'test1', data: b64(big) }, { user: ADMIN1, locale: 'en' });
    check('超 400KB -> ok=false', g1.data?.setGuildAvatar?.ok === false, JSON.stringify(g1.data?.setGuildAvatar));
    eq('超限 errorCode', g1.data?.setGuildAvatar?.errorCode, 'avatarTooLarge');
    eq('超限文案按 locale 协商 (en)', g1.data?.setGuildAvatar?.error, CATALOG.errors.avatarTooLarge.en);

    // Fake type rejected (text posing as png).
    g1 = await gqlAdmin(SET_AVATAR, { slug: 'test1', data: b64(new TextEncoder().encode('{"not":"an image"}')) }, { user: ADMIN1 });
    check('伪类型 -> ok=false', g1.data?.setGuildAvatar?.ok === false, JSON.stringify(g1.data?.setGuildAvatar));
    eq('伪类型 errorCode', g1.data?.setGuildAvatar?.errorCode, 'avatarBadType');
    eq('伪类型文案默认 zh-CN', g1.data?.setGuildAvatar?.error, CATALOG.errors.avatarBadType['zh-CN']);

    // Empty payload rejected.
    g1 = await gqlAdmin(SET_AVATAR, { slug: 'test1', data: '' }, { user: ADMIN1 });
    check('空体 -> ok=false', g1.data?.setGuildAvatar?.ok === false, JSON.stringify(g1.data?.setGuildAvatar));
    eq('空体 errorCode', g1.data?.setGuildAvatar?.errorCode, 'avatarEmpty');

    // Non-base64 payload rejected with its own code.
    g1 = await gqlAdmin(SET_AVATAR, { slug: 'test1', data: '!!!not-base64!!!' }, { user: ADMIN1 });
    check('非法 base64 -> ok=false', g1.data?.setGuildAvatar?.ok === false, JSON.stringify(g1.data?.setGuildAvatar));
    eq('非法 base64 errorCode', g1.data?.setGuildAvatar?.errorCode, 'avatarDataInvalid');
    // After a rejection the old avatar is unaffected.
    eq('拒绝后头像仍是 PNG 版', state.avatars.get(GID1)?.hash, pngHash);

    // Switching to JPEG: hash/URL/served type follow.
    const jpg = jpegBytes();
    g1 = await gqlAdmin(SET_AVATAR, { slug: 'test1', data: b64(jpg) }, { user: ADMIN1 });
    check('换 JPEG -> ok', g1.data?.setGuildAvatar?.ok === true, JSON.stringify(g1.data?.setGuildAvatar));
    jpgHash = await sha256hex(jpg);
    eq('换图后 avatarUrl 更新', g1.data?.setGuildAvatar?.avatarUrl, `http://local/guilds/test1/avatar?v=${jpgHash.slice(0, 8)}`);
    r = await call('/guilds/test1/avatar?v=' + jpgHash.slice(0, 8));
    eq('换图后出图 content-type', r.headers.get('content-type'), 'image/jpeg');
    await r.arrayBuffer();

    // Admin surface state: the admin query itself carries the live avatarUrl.
    g1 = await gqlAdmin(`query($slug: String!) { viewer { guildAdmin(slug: $slug) { __typename ... on GuildAdmin { avatarUrl } } } }`, { slug: 'test1' }, { user: ADMIN1 });
    eq('管理面 avatarUrl = 当前版本化路径', g1.data?.viewer?.guildAdmin?.avatarUrl, `http://local/guilds/test1/avatar?v=${jpgHash.slice(0, 8)}`);
    // The pre-move path under /api is retired (the standalone path above serves).
    r = await call('/api/guilds/test1/avatar');
    eq('旧 /api 头像路径已退役 -> 404', r.status, 404);
    await r.text();
  });

  /* ================= GraphQL: avatarUrl in both states ================= */
  it('GraphQL: avatarUrl in both states', async () => {
    // test1 is a bound guild in this fixture (the admin gate needs the
    // binding): its surface checks run as a guild member (member face),
    // not anonymously (anonymous on a bound guild resolves no face).
    let g = await gql(guildQ, { slug: 'test1' }, MEMBER1);
    check('GraphQL 无 errors', !g.errors, JSON.stringify(g.errors || '').slice(0, 200));
    eq('绑定百业成员面 = Guild', g.data?.viewer?.guild?.__typename, 'Guild');
    eq('有头像 avatarUrl = origin + 版本化路径', g.data?.viewer?.guild?.avatarUrl, `http://local/guilds/test1/avatar?v=${jpgHash.slice(0, 8)}`);

    const hubQ = `query { hubPage { guilds { slug avatarUrl } } }`;
    g = await gql(hubQ, {}, MEMBER1);
    const card = (g.data?.hubPage?.guilds || []).find((x) => x.slug === 'test1');
    check('hubPage GuildCard 在列', !!card, JSON.stringify(g.data || g.errors || '').slice(0, 200));
    eq('GuildCard.avatarUrl 同值', card?.avatarUrl, `http://local/guilds/test1/avatar?v=${jpgHash.slice(0, 8)}`);
  });

  /* ================= Webhook identity (module level; send-body switching is in the [3/3] section) ================= */
  it('Webhook identity (module level; send-body switching is in the [3/3] section)', async () => {
    ident = await webhookIdentity(db, 'test1');
    eq('有头像 webhookIdentity.username = 百业名', ident?.username, '测试一业');
    eq('有头像 webhookIdentity.avatarUrl = 规范域名公开 URL', ident?.avatarUrl, avatarPublicUrl('test1', jpgHash));
    ident = await webhookIdentity(db, 'test2');
    eq('无头像 webhookIdentity = null (回退平台默认)', ident, null);
  });

  /* ================= Delete: serving 404s + avatarUrl back to null ================= */
  it('Delete: serving 404s + avatarUrl back to null', async () => {
    g1 = await gqlAdmin(`mutation($slug: String!) { deleteGuildAvatar(slug: $slug) { ok errorCode } }`, { slug: 'test1' }, { user: ADMIN1 });
    check('管理员 deleteGuildAvatar -> ok', g1.data?.deleteGuildAvatar?.ok === true, JSON.stringify(g1.data?.deleteGuildAvatar));
    r = await call('/guilds/test1/avatar?v=' + jpgHash.slice(0, 8));
    eq('删除后出图 -> 404', r.status, 404);
    await r.text();
    let g = await gql(guildQ, { slug: 'test1' }, MEMBER1);
    eq('删除后 avatarUrl 回 null', g.data?.viewer?.guild?.avatarUrl, null);
    ident = await webhookIdentity(db, 'test1');
    eq('删除后 webhookIdentity 回 null', ident, null);
  });

  /* ================= [3/3] Webhook send body: identity switching between both states ================= */
  it('[3/3] Webhook send body: identity switching between both states', async () => {
    {
      const { db: db2 } = makeDb({
        tenants: [{ id: GID1, slug: 'test1', guild_name: '测试一业', slogan: '', password_hash: pwHash }],
        settings: { [`${GID1}::heirloom_webhook`]: 'https://discord.test/webhook' },
      });
      const sent = [];
      const realFetch = globalThis.fetch;
      globalThis.fetch = async (url, opts) => {
        sent.push({ url: String(url), body: JSON.parse(opts.body) });
        return new Response(null, { status: 204 });
      };
      try {
        // No avatar: direct postWebhook (identity=null) -> platform default identity.
        await postWebhook('https://discord.test/webhook', 'hi', [], undefined, null);
        eq('无头像发送体 username = 平台默认', sent[0].body.username, REMINDER_USERNAME);
        eq('无头像发送体 avatar_url = OG hub 图', sent[0].body.avatar_url, REMINDER_AVATAR_URL);

        // With avatar: identity switches to guild name + avatar public URL; other fields unchanged.
        const { hash } = await putGuildAvatar(db2, 'test1', 'image/png', pngBytes());
        const ident2 = await webhookIdentity(db2, 'test1');
        await postWebhook('https://discord.test/webhook', 'hi', ['42'], undefined, ident2);
        eq('有头像发送体 username = 百业名', sent[1].body.username, '测试一业');
        eq('有头像发送体 avatar_url = 头像公开 URL', sent[1].body.avatar_url, `https://yanyun.app/guilds/test1/avatar?v=${hash.slice(0, 8)}`);
        eq('身份切换不影响 allowed_mentions', JSON.stringify(sent[1].body.allowed_mentions), JSON.stringify({ parse: [], users: ['42'] }));

        // Heirloom test send, full chain (sendHeirloomTest -> postWebhook): with-avatar state.
        sent.length = 0;
        const hr = await sendHeirloomTest(db2, 'test1');
        check('传家宝测试发送 ok', hr.ok === true, JSON.stringify(hr));
        eq('传家宝发送体 username = 百业名', sent[0]?.body.username, '测试一业');
        eq('传家宝发送体 avatar_url = 头像公开 URL', sent[0]?.body.avatar_url, `https://yanyun.app/guilds/test1/avatar?v=${hash.slice(0, 8)}`);

        // After avatar deletion, heirloom sends fall back to the default identity.
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
  });
});
