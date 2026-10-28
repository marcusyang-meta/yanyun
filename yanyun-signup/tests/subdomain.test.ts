// Platform subdomains acceptance (white-label tier A, 2026-10-27):
//  - host parsing: only single slug-charset labels under yanyun.app
//    qualify; 'og' is reserved for the OG worker; apex / previews /
//    foreign hosts never parse;
//  - resolution: tenant exists + subdomain_enabled='1' + not
//    dev_only + the Premium gate verdict (paygate OFF = the switch
//    alone decides; paygate ON = an effective premium entitlement
//    is required — manual grant and Stripe-sourced rows both count,
//    a lapsed row stops resolution); unopened and unknown labels
//    resolve identically (null), and the worker answers both with
//    the same plain 404 on every path — no enumeration, no
//    main-site content on stray hosts;
//  - live-subdomain dispatch: / = the guild front page (og:url = the
//    subdomain root), /car/:id = its car page, /admin = its admin
//    page; other guilds' slug paths 404 under this host; global SPA
//    routes fall through untouched;
//  - canonical URLs follow the host at the composition points:
//    /c/:code landing, groupingDetailPage.shareUrl, the reminder
//    embed title link — while main-host outputs stay byte-exact;
//  - platform ownership: the switch is written only from the
//    platform-admin operations surface (GraphQL
//    platformAdminSetSubdomain, gating-layer admin gate, audited,
//    next to the paygate switch and manual grants);
//    the guild admin surface carries NO subdomain fields at all —
//    querying any of them (or the retired updateGuildSubdomain
//    mutation) is a schema validation error, so the capability is
//    invisible to tenants until the Premium launch;
//  - login sharing: the session cookie carries Domain=yanyun.app on
//    the host family (mint pairs it with a legacy host-only clear,
//    clears emit both scopes, the read tolerates duplicate values);
//    a subdomain login bounces to the root login with a signed
//    return_to, the root runs OAuth against the registered root
//    callback only, and the callback lands back on the subdomain —
//    forged / off-family / non-https return_to values fall back to
//    the plain root sign-in.
// Real worker fetch + real yoga + FakeDB routing by SQL shape into
// in-memory tables (same pattern as .harness-guildadmin).
import { yoga } from '../src/graphql.ts';
import { describe, it, expect } from 'vitest';
import {
  parseGuildSubdomainSlug, resolveGuildSubdomain, isGuildSubdomainEnabled,
  guildSubdomainOrigin, setGuildSubdomainEnabled,
} from '../src/domains/guilds/subdomain.ts';
import {
  setPaygateEnabled, grantPremiumManual, revokePremium,
} from '../src/domains/platform/billing-service.ts';
import {
  signJwt, verifyJwt, getSessionUser, sessionCookieHeader, sessionCookieHeaders,
  validateReturnToTarget,
} from '../src/domains/identity/auth.ts';
import { mintShortLink } from '../src/domains/groupings/shortlinks.ts';
import { buildReminderMessage } from '../src/domains/groupings/reminder.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: unknown, want: unknown) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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
const DGID = '424242424242424242';
function makeDb(fx = {}) {
  const tables = {
    tenants: (fx.tenants || []).map((t) => ({ ...t })),
    settings: new Map(fx.settings || []),
    users: new Map(fx.users || []),
    events: (fx.events || []).map((e) => ({ ...e })),
    signups: (fx.signups || []).map((r) => ({ ...r })),
    links: (fx.links || []).map((l) => ({ ...l })),
    guildMembers: (fx.guildMembers || []).map((m) => ({ ...m })),
    entitlements: new Map(fx.entitlements || []),
  };
  const unknownSql = new Set();
  function norm(sql) {
    return sql.replace(/"/g, '').replace(/\b(tenants|settings|users|events|signups|short_links|guild_members|guild_avatars|user_guild_nicks|dungeons|guild_entitlements)\./g, '').replace(/\s+/g, ' ');
  }
  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    /* short_links: real UNIQUE semantics (mirrors .harness-shortlink) */
    if (/short_links/i.test(sql)) {
      if (/^INSERT INTO short_links/i.test(sql)) {
        const [code, tenant, eventId, createdAt] = b;
        if (tables.links.some((l) => l.code === code)) throw new Error('UNIQUE constraint failed: short_links.code');
        if (tables.links.some((l) => l.tenant === tenant && l.event_id === eventId)) throw new Error('UNIQUE constraint failed: short_links_target_unique');
        tables.links.push({ code, tenant, event_id: eventId, created_at: createdAt });
        return { meta: { changes: 1 } };
      }
      let row = null;
      if (/WHERE tenant = \? AND event_id = \?/i.test(sql)) row = tables.links.find((l) => l.tenant === b[0] && l.event_id === Number(b[1])) || null;
      else if (/WHERE code = \?/i.test(sql)) row = tables.links.find((l) => l.code === b[0]) || null;
      return kind === 'first' ? row : { results: row ? [row] : [] };
    }
    /* generic INSERT (settings upsert is the only write this suite drives) */
    let m = /^INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)/i.exec(sql);
    if (m) {
      const [, table, colList] = m;
      const cols = colList.split(',').map((c) => c.trim().split('.').pop());
      const row = {};
      cols.forEach((c, i) => { row[c] = b[i]; });
      if (table === 'settings') { tables.settings.set(`${row.tenant}|${row.key}`, row.value); return { meta: { changes: 1 } }; }
      if (table === 'guild_entitlements') { tables.entitlements.set(row.tenant, { ...row }); return { meta: { changes: 1 } }; }
      if (table === 'events') tables.events.push(row);
      else if (table === 'signups') tables.signups.push(row);
      return { meta: { changes: 1, last_row_id: row.id ?? 0 } };
    }
    if (/\b(CREATE TABLE|ALTER TABLE|PRAGMA)\b/i.test(sql)) return kind === 'run' ? { meta: { changes: 0 } } : (kind === 'first' ? null : { results: [] });
    if (/^DELETE FROM/i.test(sql)) return { meta: { changes: 0 } };

    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });
    if (/FROM guild_entitlements WHERE tenant = \?/i.test(sql)) return first(tables.entitlements.get(b[0]) ?? null);
    // Governance line (P16): fixture guilds hold no officer grants.
    if (/FROM guild_officer_grants/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/FROM tenants WHERE slug/i.test(sql)) return first(tables.tenants.find((t) => t.slug === b[0]));
    if (/FROM tenants/i.test(sql)) return kind === 'first' ? (tables.tenants[0] ?? null) : all(tables.tenants);
    if (/FROM settings WHERE tenant = \? AND key = \?/i.test(sql)) {
      const v = tables.settings.get(`${b[0]}|${b[1]}`);
      return first(v === undefined ? null : { value: v });
    }
    if (/FROM settings WHERE key = \?/i.test(sql)) {
      const rows = [];
      for (const [k, v] of tables.settings) { const [t, key] = k.split('|'); if (key === b[0]) rows.push({ tenant: t, value: v }); }
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    if (/SELECT guilds_json FROM users/i.test(sql)) {
      const v = tables.users.get(String(b[0]));
      return first(v === undefined ? null : { guilds_json: v });
    }
    if (/FROM users/i.test(sql)) return first(null);
    if (/FROM guild_avatars/i.test(sql)) return first(null);
    /* custom domains (P23): this suite's world has no bindings —
     * the composition points (reminder / shareUrl) read an empty
     * table and fall back to the subdomain/main composition. */
    if (/FROM guild_custom_domains/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/FROM dungeons/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/FROM user_guild_nicks/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/FROM events/i.test(sql) && /COUNT/i.test(sql)) {
      const nums = b.filter((x) => typeof x === 'number' && x > 1e9);
      const lo = nums.length ? Math.min(...nums) : 0;
      const hi = nums.length > 1 ? Math.max(...nums) : Number.MAX_SAFE_INTEGER;
      const rows = tables.events.filter((e) => e.tenant === b[0] && e.type === 'activity'
        && e.starts_at_utc != null && e.starts_at_utc >= lo && e.starts_at_utc < hi
        && !['draft', 'completed'].includes(e.status));
      return first({ c: rows.length });
    }
    if (/SELECT \* FROM events WHERE id = \? AND tenant = \?/i.test(sql) || /FROM events WHERE id = \? AND tenant = \?/i.test(sql)) {
      return first(tables.events.find((e) => e.id === Number(b[0]) && e.tenant === b[1]));
    }
    if (/FROM events WHERE id = \?/i.test(sql)) return first(tables.events.find((e) => e.id === Number(b[0])));
    if (/FROM events/i.test(sql)) return kind === 'first' ? (tables.events[0] ?? null) : all(tables.events);
    if (/FROM signups/i.test(sql) && /COUNT/i.test(sql)) {
      return first({ c: tables.signups.filter((r) => r.event_id === Number(b[0])).length });
    }
    if (/FROM signups/i.test(sql)) return all(tables.signups.filter((r) => r.event_id === Number(b[0])).sort((a, c) => a.id - c.id));
    if (/FROM guild_members/i.test(sql)) {
      let rows = tables.guildMembers.filter((x) => x.tenant === b[0]);
      if (/discord_id = \?/i.test(sql) && b.length > 1) rows = rows.filter((x) => x.discord_id === String(b[1]));
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    unknownSql.add(kind + ': ' + sql.slice(0, 110));
    return kind === 'first' ? null : (kind === 'all' ? { results: [] } : { meta: { changes: 0 } });
  }
  function stmt(rawSql) {
    const q = {
      _binds: [],
      bind(...a) { this._binds = a; return this; },
      async raw() { const res = await this.all(); return toRawRows(rawSql, (res && res.results) || []); },
      async first() { return route('first', rawSql, this._binds); },
      async all() { return route('all', rawSql, this._binds); },
      async run() { return route('run', rawSql, this._binds); },
    };
    return q;
  }
  const db = {
    prepare: (sql) => stmt(sql),
    async batch(stmts) { const out = []; for (const s of stmts) out.push(await s.run()); return out; },
  };
  return { db, tables, unknownSql };
}

/* ---------------- fixtures ---------------- */
const NOW = Math.floor(Date.now() / 1000);
function tenantRow(slug, guildName) {
  return {
    slug, guild_name: guildName, password_hash: 'x', announcement: '', slogan: '同舟共济',
    master_name: '', logo_url: '', bg_image_url: '', discord_webhook: '',
    created_at: '2026-01-01 00:00:00',
  };
}
function evRow(id, tenant, over = {}) {
  return {
    id, tenant, title: '车' + id, type: 'activity', description: '', dungeon: '',
    starts_at: null, starts_at_utc: NOW + 7200, max_slots: 10, status: 'open',
    origin: 'member', created_by: '', creator_discord_id: 'U1',
    reminder_sent_at: null, reminder_error: null, ...over,
  };
}
const A = makeDb({
  tenants: [tenantRow('subtest', '子域测试百业'), tenantRow('offtest', '未开子域百业')],
  settings: [
    ['subtest|discord_guild_id', DGID],
    ['offtest|discord_guild_id', DGID],
    ['subtest|subdomain_enabled', '1'],
    ['|game_version', 'intl-v2.3'],
  ],
  users: [
    ['UA', JSON.stringify([{ id: DGID, name: '测试服', icon: '', permissions: '0', owner: true }])],
    ['UB', JSON.stringify([{ id: DGID, name: '测试服', icon: '', permissions: '0', owner: false }])],
  ],
  events: [evRow(7, 'subtest', { title: '子域周六车' }), evRow(8, 'offtest', { title: '未开子域车' })],
});
const ADMIN = { discordId: 'UA', name: '服主', guilds: [DGID] };
const MEMBER = { discordId: 'UB', name: '成员', guilds: [DGID] };

const env = { DB: A.db, ASSETS: { fetch: async (req) => {
  const p = new URL(req.url).pathname;
  if (p === '/index.html') return new Response('<html><head></head><body>SPA-INDEX</body></html>', { status: 200, headers: { 'content-type': 'text/html' } });
  return new Response('not found', { status: 404 });
} } };
const wctx = { waitUntil() {} };
const worker = (await import('../src/worker.ts')).default;
const call = (url) => worker.fetch(new Request(url), env, wctx);

async function gql(query, { user = null, variables, url = 'https://yanyun.app/graphql' } = {}) {
  const ctx = { env: { DB: A.db }, request: new Request(url), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request(url, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

let r: any;
let g: any;
let link: any;

describe('subdomain', () => {
  it('A. host parsing', async () => {
/* ---------------- A. host parsing ---------------- */
eq('apex 不解析', parseGuildSubdomainSlug('yanyun.app'), null);
eq('og 保留 (OG worker 的域)', parseGuildSubdomainSlug('og.yanyun.app'), null);
eq('正常子域', parseGuildSubdomainSlug('subtest.yanyun.app'), 'subtest');
eq('大写主机名归一', parseGuildSubdomainSlug('SubTest.YANYUN.APP'), 'subtest');
eq('一位标签不合 slug 规', parseGuildSubdomainSlug('a.yanyun.app'), null);
eq('多级标签不解析', parseGuildSubdomainSlug('foo.bar.yanyun.app'), null);
eq('后缀伪装不解析', parseGuildSubdomainSlug('subtest.yanyun.app.evil.com'), null);
eq('workers.dev 预览不解析', parseGuildSubdomainSlug('release-yanyun.tbdlab.workers.dev'), null);
eq('localhost 不解析', parseGuildSubdomainSlug('localhost'), null);
eq('连字符 slug 可解析', parseGuildSubdomainSlug('my-guild.yanyun.app'), 'my-guild');
  });

  it('B. resolution + origins', async () => {
/* ---------------- B. resolution + origins ---------------- */
eq('已开子域解析', await resolveGuildSubdomain(A.db, 'subtest.yanyun.app'), 'subtest');
eq('未开子域不解析', await resolveGuildSubdomain(A.db, 'offtest.yanyun.app'), null);
eq('不存在子域不解析', await resolveGuildSubdomain(A.db, 'ghost.yanyun.app'), null);
eq('origin 组合', guildSubdomainOrigin('jijiguagua'), 'https://jijiguagua.yanyun.app');
eq('enabled 读 (开)', await isGuildSubdomainEnabled(A.db, 'subtest'), true);
eq('enabled 读 (默认关)', await isGuildSubdomainEnabled(A.db, 'offtest'), false);
A.tables.settings.set('subtest|dev_only', '1');
eq('dev_only 百业永不经子域解析', await resolveGuildSubdomain(A.db, 'subtest.yanyun.app'), null);
A.tables.settings.delete('subtest|dev_only');
eq('dev_only 复位后恢复解析', await resolveGuildSubdomain(A.db, 'subtest.yanyun.app'), 'subtest');
  });

  it('C. worker host gate + dispatch', async () => {
/* ---------------- C. worker host gate + dispatch ---------------- */
r = await call('https://offtest.yanyun.app/');
eq('未开子域 / -> 404', r.status, 404);
const offBody = await r.text();
r = await call('https://ghost.yanyun.app/');
eq('不存在子域 / -> 404', r.status, 404);
eq('未开与不存在 404 响应体一致 (防枚举)', await r.text(), offBody);
r = await call('https://offtest.yanyun.app/graphql');
eq('未开子域 /graphql 也被门挡', r.status, 404);
await r.text();
r = await call('https://offtest.yanyun.app/subtest');
eq('未开子域上主站路径同样 404', r.status, 404);
await r.text();

r = await call('https://subtest.yanyun.app/');
eq('已开子域 / -> 200', r.status, 200);
let html = await r.text();
check('子域根 og:url = 子域根', html.includes('<meta property="og:url" content="https://subtest.yanyun.app/" />'), html.slice(0, 400));
check('子域根 og:title 是本百业', html.includes('子域测试百业'), html.slice(0, 400));
check('子域根不漏集结页 og', !html.includes('百业集结'), html.slice(0, 400));
r = await call('https://subtest.yanyun.app/car/7');
eq('子域 /car/7 -> 200', r.status, 200);
html = await r.text();
check('子域车页 og:url = 子域车址', html.includes('<meta property="og:url" content="https://subtest.yanyun.app/car/7" />'), html.slice(0, 400));
check('子域车页 og:image 仍走 OG worker', html.includes('https://og.yanyun.app/og/subtest/car/7.png'), html.slice(0, 400));
r = await call('https://subtest.yanyun.app/offtest');
eq('子域上他人百业主页 -> 404', r.status, 404);
await r.text();
r = await call('https://subtest.yanyun.app/offtest/car/8');
eq('子域上他人百业车页 -> 404', r.status, 404);
await r.text();
r = await call('https://subtest.yanyun.app/subtest');
eq('子域上自家 slug 路径 -> 200', r.status, 200);
html = await r.text();
check('自家 slug 路径 og:url 规范化到子域根', html.includes('<meta property="og:url" content="https://subtest.yanyun.app/" />'), html.slice(0, 400));
r = await call('https://subtest.yanyun.app/admin');
eq('子域 /admin -> 200 (SPA)', r.status, 200);
check('子域 /admin 出 SPA', (await r.text()).includes('SPA-INDEX'));
r = await call('https://subtest.yanyun.app/gear');
eq('子域 /gear 全局页照常', r.status, 200);
await r.text();

/* main-host regressions: byte-exact canonicals */
r = await call('https://yanyun.app/');
eq('主域 / -> 200', r.status, 200);
html = await r.text();
check('主域根 og:url 不变', html.includes('<meta property="og:url" content="https://yanyun.app/" />'), html.slice(0, 400));
r = await call('https://yanyun.app/subtest');
eq('主域百业主页 -> 200', r.status, 200);
html = await r.text();
check('主域百业 og:url 不变', html.includes('<meta property="og:url" content="https://yanyun.app/subtest" />'), html.slice(0, 400));
r = await call('https://yanyun.app/subtest/car/7');
eq('主域车页 -> 200', r.status, 200);
html = await r.text();
check('主域车页 og:url 不变', html.includes('<meta property="og:url" content="https://yanyun.app/subtest/car/7" />'), html.slice(0, 400));
r = await call('https://yanyun.app/offtest');
eq('主域未开子域百业主页不受影响', r.status, 200);
await r.text();
r = await call('https://og.yanyun.app/');
eq('og 主机名不被子域门挡 (回落既有处理)', r.status, 200);
await r.text();

/* short-link landings follow the host */
link = await mintShortLink(A.db, 'subtest', 7);
r = await call(`https://subtest.yanyun.app/c/${link.code}`);
eq('子域上短链 -> 302', r.status, 302);
// 2026-10-28 share-access ruling: subtest is a BOUND guild, so an
// anonymous short-link visitor lands on the anonymous share page
// (same origin), not the member-gated canonical car page. Members
// keep the canonical landing (covered in shareaccess.test.ts).
eq('子域短链落点 = 子域分享页 (匿名)', r.headers.get('location'), `https://subtest.yanyun.app/s/${link.code}`);
await r.text();
r = await call(`https://yanyun.app/c/${link.code}`);
eq('主域短链 -> 302', r.status, 302);
eq('主域短链落点 = 主域分享页 (匿名)', r.headers.get('location'), `https://yanyun.app/s/${link.code}`);
await r.text();
r = await call(`https://subtest.yanyun.app/s/${link.code}`);
eq('子域分享页 -> 200', r.status, 200);
html = await r.text();
check('子域分享页注入车 OG 图', html.includes('https://og.yanyun.app/og/subtest/car/7.png'), html.slice(0, 400));
  });

  it('D. GraphQL shareUrl follows the request host', async () => {
/* ---------------- D. GraphQL shareUrl follows the request host ---------------- */
const shareQ = `query($slug: String, $id: ID!) { groupingDetailPage(slug: $slug, id: $id) { shareUrl } }`;
g = await gql(shareQ, { user: MEMBER, variables: { slug: 'subtest', id: '7' }, url: 'https://subtest.yanyun.app/graphql' });
check('子域请求详情无 errors', !g.errors, JSON.stringify(g.errors || '').slice(0, 200));
eq('子域请求 shareUrl 在子域上', g.data?.groupingDetailPage?.shareUrl, `https://subtest.yanyun.app/c/${link.code}`);
g = await gql(shareQ, { user: MEMBER, variables: { slug: 'subtest', id: '7' }, url: 'https://yanyun.app/graphql' });
eq('主域请求 shareUrl 在主域上 (同码)', g.data?.groupingDetailPage?.shareUrl, `https://yanyun.app/c/${link.code}`);
g = await gql(shareQ, { user: MEMBER, variables: { slug: 'offtest', id: '8' }, url: 'https://yanyun.app/graphql' });
check('未开子域百业 shareUrl 仍是主域短链', /^https:\/\/yanyun\.app\/c\/[0-9A-Za-z]{7}$/.test(g.data?.groupingDetailPage?.shareUrl || ''), g.data?.groupingDetailPage?.shareUrl);
  });

  it('E. reminder embed link', async () => {
/* ---------------- E. reminder embed link follows the guild's switch ---------------- */
const msgOn = await buildReminderMessage(A.db, A.tables.events.find((e) => e.id === 7), 'subtest', NOW);
eq('已开子域百业提醒链接 = 子域车址', msgOn.embeds[0].url, 'https://subtest.yanyun.app/car/7');
check('提醒冻结文案一字未动', msgOn.content.includes('发起了就位确认：你准备好了吗？'), msgOn.content);
const msgOff = await buildReminderMessage(A.db, A.tables.events.find((e) => e.id === 8), 'offtest', NOW);
eq('未开子域百业提醒链接不变', msgOff.embeds[0].url, 'https://yanyun.app/offtest/car/8');
  });

  it('F. guild surface: the section does not exist', async () => {
/* ---------------- F. guild surface: the section does not exist ----------------
 * The subdomain capability is platform-operated and pre-launch
 * hidden: GuildAdmin carries no subdomain fields at all. Querying
 * any of them — as the owner, with full admin rights — is a schema
 * validation error (the fields are absent from the type, exactly
 * like fields on the Locked variant), and the retired mutation
 * does not exist on Mutation either. */
g = await gql(`{ viewer { guildAdmin(slug: "offtest") { __typename } } }`, { user: ADMIN });
eq('服主见 GuildAdmin (壳层照常)', g.data?.viewer?.guildAdmin?.__typename, 'GuildAdmin');
for (const field of ['subdomainEnabled', 'subdomainUrl', 'subdomainCallbackUrl',
  'adminSubdomainTitle', 'adminSubdomainLabel', 'adminSubdomainAddressLabel',
  'adminSubdomainCallbackLabel', 'adminSubdomainNote']) {
  g = await gql(`{ viewer { guildAdmin(slug: "offtest") { ... on GuildAdmin { ${field} } } } }`, { user: ADMIN });
  check(`GuildAdmin 无 ${field} 字段 -> 校验错误`, Array.isArray(g.errors) && g.errors.length > 0
    && JSON.stringify(g.errors).includes(field), JSON.stringify(g.errors || '').slice(0, 160));
}
g = await gql(`{ viewer { guildAdmin(slug: "offtest") { __typename } } }`, { user: MEMBER });
eq('普通成员只见 Locked (不变)', g.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');

g = await gql(`mutation { updateGuildSubdomain(slug: "offtest", enabled: true) { ok errorCode } }`, { user: ADMIN });
check('updateGuildSubdomain 已不存在 -> 校验错误', Array.isArray(g.errors) && g.errors.length > 0
  && JSON.stringify(g.errors).includes('updateGuildSubdomain'), JSON.stringify(g.errors || '').slice(0, 160));
eq('旧写路径未落库', A.tables.settings.get('offtest|subdomain_enabled'), undefined);
g = await gql(`mutation { updateGuildSubdomain(slug: "offtest", enabled: true) { ok errorCode } }`, { user: MEMBER });
check('成员调用旧写路径同样只是校验错误', Array.isArray(g.errors) && g.errors.length > 0);

/* the stored switch itself (written by the platform, section H)
 * still flips resolution immediately — the data-layer write the
 * hub route performs, driven directly here */
await setGuildSubdomainEnabled(A.db, 'offtest', true);
eq('开关落库', A.tables.settings.get('offtest|subdomain_enabled'), '1');
eq('开后子域立即解析', await resolveGuildSubdomain(A.db, 'offtest.yanyun.app'), 'offtest');
r = await call('https://offtest.yanyun.app/');
eq('开后子域根立即出页', r.status, 200);
await r.text();
await setGuildSubdomainEnabled(A.db, 'offtest', false);
eq('关后子域立即停解析', await resolveGuildSubdomain(A.db, 'offtest.yanyun.app'), null);
  });

  it('G. login sharing', async () => {
/* ---------------- G. login sharing (Domain cookie + root-start OAuth) ---------------- */
const SECRET = 'harness-session-secret';
const G = makeDb({
  tenants: [tenantRow('subtest', '子域测试百业')],
  settings: [
    ['subtest|discord_guild_id', DGID],
    ['subtest|subdomain_enabled', '1'],
    ['|game_version', 'intl-v2.3'],
  ],
});
const envG = {
  DB: G.db, ASSETS: env.ASSETS,
  SESSION_SECRET: SECRET, DISCORD_CLIENT_ID: 'cid', DISCORD_CLIENT_SECRET: 'csecret',
  DISCORD_API_BASE: 'https://discord.stub',
};
const wctxG = { waitUntil(p) { Promise.resolve(p).catch(() => {}); } };
const callG = (url, init) => worker.fetch(new Request(url, init), envG, wctxG);
const setCookies = (res) => (typeof res.headers.getSetCookie === 'function'
  ? res.headers.getSetCookie()
  : [res.headers.get('set-cookie')].filter(Boolean));
// Discord is stubbed at the fetch layer (DISCORD_API_BASE seam): the
// token / profile / guilds / nick endpoints answer canned payloads.
const realFetch = globalThis.fetch;
globalThis.fetch = async (input) => {
  const u = String(typeof input === 'string' ? input : input.url);
  if (u === 'https://discord.stub/api/oauth2/token') {
    return Response.json({ access_token: 'at', refresh_token: 'rt2', scope: 'identify guilds guilds.members.read' });
  }
  if (u === 'https://discord.stub/api/v10/users/@me') {
    return Response.json({ id: 'U1', username: 'u1', global_name: '测试员', avatar: null });
  }
  if (u === 'https://discord.stub/api/v10/users/@me/guilds') {
    return Response.json([{ id: DGID, name: '测试服', icon: null, permissions: '0', owner: true }]);
  }
  if (u === `https://discord.stub/api/v10/users/@me/guilds/${DGID}/member`) {
    return Response.json({ nick: '服昵' });
  }
  return new Response('unstubbed', { status: 404 });
};

/* G1. cookie header shapes */
eq('主域签发带 Domain', sessionCookieHeader('tok', 60, 'yanyun.app'),
  'yy_session=tok; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=yanyun.app; Max-Age=60');
eq('子域签发带 Domain', sessionCookieHeader('tok', 60, 'subtest.yanyun.app'),
  'yy_session=tok; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=yanyun.app; Max-Age=60');
eq('预览 host 签发保持 host-only 原样', sessionCookieHeader('tok', 60, 'release-yanyun.tbdlab.workers.dev'),
  'yy_session=tok; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=60');
eq('localhost 签发保持 host-only 原样', sessionCookieHeader('tok', 60, 'localhost'),
  'yy_session=tok; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=60');
const mintPair = sessionCookieHeaders('tok', 60, 'yanyun.app');
eq('主域签发 = Domain 新 cookie + host-only 过期清理 (两条)', mintPair.length, 2);
eq('签发附带的旧 cookie 清理条', mintPair[1],
  'yy_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
const clearPair = sessionCookieHeaders('', 0, 'subtest.yanyun.app');
eq('子域清除 = 双清 (两条)', clearPair.length, 2);
eq('双清第一条 = Domain 过期', clearPair[0],
  'yy_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=yanyun.app; Max-Age=0');
eq('族外清除 = 单条 host-only (与旧版逐字一致)', sessionCookieHeaders('', 0, 'localhost').length, 1);

/* G2. return_to target validation */
eq('合法子域目标放行', validateReturnToTarget('https://subtest.yanyun.app/admin?x=1'),
  'https://subtest.yanyun.app/admin?x=1');
eq('主域目标放行', validateReturnToTarget('https://yanyun.app/'), 'https://yanyun.app/');
eq('外部 host 拒绝', validateReturnToTarget('https://evil.com/x'), null);
eq('后缀伪装 host 拒绝', validateReturnToTarget('https://subtest.yanyun.app.evil.com/x'), null);
eq('http 拒绝', validateReturnToTarget('http://subtest.yanyun.app/x'), null);
eq('带 userinfo 拒绝', validateReturnToTarget('https://user:pass@subtest.yanyun.app/x'), null);
eq('userinfo 伪装 host 拒绝', validateReturnToTarget('https://yanyun.app@evil.com/x'), null);
eq('非 URL 拒绝', validateReturnToTarget('not a url'), null);

/* G3. subdomain login bounces to the root login, signed */
r = await callG('https://subtest.yanyun.app/auth/discord/login?returnTo=%2Fadmin');
eq('子域登录 -> 302', r.status, 302);
const bounceLoc = r.headers.get('location') || '';
check('子域登录落点 = root 登录 + return_to', bounceLoc.startsWith('https://yanyun.app/auth/discord/login?return_to='), bounceLoc);
const signedRt = new URL(bounceLoc).searchParams.get('return_to') || '';
const rtPayload = await verifyJwt(SECRET, signedRt);
eq('return_to 签名 kind', rtPayload?.kind, 'return-to');
eq('return_to 目标 = 子域原页面', rtPayload?.rto, 'https://subtest.yanyun.app/admin');

/* G4. the root login consumes it; Discord sees only the root callback */
r = await callG(bounceLoc);
eq('root 登录 -> 302', r.status, 302);
const authUrl = new URL(r.headers.get('location') || '');
eq('OAuth 主机 = discord.com', authUrl.hostname, 'discord.com');
eq('redirect_uri = root 回调 (唯一登记)', authUrl.searchParams.get('redirect_uri'),
  'https://yanyun.app/auth/discord/callback');
const state = authUrl.searchParams.get('state') || '';
const statePayload = await verifyJwt(SECRET, state);
eq('state kind', statePayload?.kind, 'oauth-state');
eq('state 携带 rto', statePayload?.rto, 'https://subtest.yanyun.app/admin');

/* G5. the callback mints the shared cookie and lands on the subdomain */
r = await callG(`https://yanyun.app/auth/discord/callback?code=fake&state=${encodeURIComponent(state)}`);
eq('回调 -> 302', r.status, 302);
eq('回调落点 = 子域原页面', r.headers.get('location'), 'https://subtest.yanyun.app/admin');
let sc = setCookies(r);
eq('回调签发两条 set-cookie', sc.length, 2);
check('签发[0] = Domain 会话 cookie', sc[0].startsWith('yy_session=')
  && sc[0].includes('Domain=yanyun.app') && sc[0].includes('HttpOnly')
  && sc[0].includes('Max-Age=1209600'), sc[0]);
eq('签发[1] = host-only 旧 cookie 清理', sc[1],
  'yy_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
const mintedJwt = sc[0].split(';')[0].slice('yy_session='.length);
const mintedUser = await getSessionUser(
  new Request('https://subtest.yanyun.app/', { headers: { cookie: `yy_session=${mintedJwt}` } }), envG);
eq('子域上读回会话 = 刚登录的用户', mintedUser?.discordId, 'U1');

/* G6. forged / invalid return_to falls back to the plain root sign-in */
async function stateOfLogin(url) {
  const rr = await callG(url);
  const loc = rr.headers.get('location') || '';
  const st = new URL(loc).searchParams.get('state') || '';
  return { rr, st, payload: await verifyJwt(SECRET, st) };
}
const tampered = signedRt.slice(0, -2) + (signedRt.endsWith('aa') ? 'bb' : 'aa');
let li = await stateOfLogin(`https://yanyun.app/auth/discord/login?return_to=${encodeURIComponent(tampered)}`);
eq('篡改签名: 登录照常 302 到 Discord', li.rr.status, 302);
eq('篡改签名: state 无 rto (回退)', li.payload?.rto, undefined);
r = await callG(`https://yanyun.app/auth/discord/callback?code=fake&state=${encodeURIComponent(li.st)}`);
eq('篡改签名: 回调落 root 首页', r.headers.get('location'), 'https://yanyun.app/');
await r.text();
const wrongKind = await signJwt(SECRET, { rto: 'https://subtest.yanyun.app/admin', kind: 'oauth-state' }, 600);
li = await stateOfLogin(`https://yanyun.app/auth/discord/login?return_to=${encodeURIComponent(wrongKind)}`);
eq('kind 不符: state 无 rto', li.payload?.rto, undefined);
for (const evil of ['https://evil.com/x', 'http://subtest.yanyun.app/x', 'https://user:pass@subtest.yanyun.app/x']) {
  const s = await signJwt(SECRET, { rto: evil, kind: 'return-to' }, 600);
  li = await stateOfLogin(`https://yanyun.app/auth/discord/login?return_to=${encodeURIComponent(s)}`);
  eq(`合法签名但目标非法 (${new URL(evil).protocol}//${new URL(evil).hostname}): state 无 rto`, li.payload?.rto, undefined);
}
li = await stateOfLogin('https://yanyun.app/auth/discord/login?return_to=garbage');
eq('return_to 为垃圾值: 登录照常、state 无 rto', li.payload?.rto, undefined);

/* G7. plain apex login is unchanged apart from the cookie pair */
li = await stateOfLogin('https://yanyun.app/auth/discord/login?returnTo=%2Fgear');
eq('主域登录 state.rt 不变', li.payload?.rt, '/gear');
eq('主域登录 state 无 rto', li.payload?.rto, undefined);
r = await callG(`https://yanyun.app/auth/discord/callback?code=fake&state=${encodeURIComponent(li.st)}`);
eq('主域回调落点不变', r.headers.get('location'), 'https://yanyun.app/gear');
sc = setCookies(r);
eq('主域回调同样签发 cookie 对', sc.length, 2);
check('主域签发[0] 带 Domain', sc[0].includes('Domain=yanyun.app'), sc[0]);

/* G8. the mobile handoff on a subdomain keeps starting in place */
r = await callG(`https://subtest.yanyun.app/auth/discord/login?app=${encodeURIComponent('yanyun://auth-callback')}`);
eq('子域 app 登录 -> 302 (不弹 root)', r.status, 302);
const appAuthUrl = new URL(r.headers.get('location') || '');
eq('app 登录 redirect_uri 仍为本域回调 (旧行为)', appAuthUrl.searchParams.get('redirect_uri'),
  'https://subtest.yanyun.app/auth/discord/callback');

/* G9. logout clears both scopes on the family; one off-family */
r = await callG('https://yanyun.app/auth/logout', { method: 'POST' });
sc = setCookies(r);
eq('主域登出双清 (两条)', sc.length, 2);
eq('登出[0] = Domain 过期', sc[0],
  'yy_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=yanyun.app; Max-Age=0');
eq('登出[1] = host-only 过期', sc[1],
  'yy_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
r = await callG('https://subtest.yanyun.app/auth/logout');
eq('子域 GET 登出 -> 302 /', `${r.status} ${r.headers.get('location')}`, '302 /');
eq('子域登出双清 (两条)', setCookies(r).length, 2);
r = await callG('https://release-yanyun.tbdlab.workers.dev/auth/logout', { method: 'POST' });
sc = setCookies(r);
eq('预览 host 登出 = 单条 (旧版逐字)', sc.length, 1);
eq('预览 host 登出条内容', sc[0],
  'yy_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

/* G10. duplicate cookie values: the first valid one wins */
const goodJwt = await signJwt(SECRET, { sub: 'U9', name: '九', avatar: '', guilds: [] });
const expiredJwt = await signJwt(SECRET, { sub: 'U9', name: '九', avatar: '', guilds: [] }, -60);
const reqCookie = (cookie) => new Request('https://yanyun.app/graphql', { headers: { cookie } });
eq('垃圾在前、有效在后 -> 认有效', (await getSessionUser(reqCookie(`yy_session=garbage; yy_session=${goodJwt}`), envG))?.discordId, 'U9');
eq('有效在前、垃圾在后 -> 认有效', (await getSessionUser(reqCookie(`yy_session=${goodJwt}; yy_session=garbage`), envG))?.discordId, 'U9');
eq('过期在前、有效在后 -> 认有效', (await getSessionUser(reqCookie(`yy_session=${expiredJwt}; yy_session=${goodJwt}`), envG))?.discordId, 'U9');
eq('只有垃圾 -> 未登录', await getSessionUser(reqCookie('yy_session=garbage'), envG), null);
eq('无 cookie 时 Bearer 回退不变', (await getSessionUser(
  new Request('https://yanyun.app/graphql', { headers: { authorization: `Bearer ${goodJwt}` } }), envG))?.discordId, 'U9');

/* G11. incomplete grant on a subdomain GraphQL call clears both scopes */
r = await callG('https://subtest.yanyun.app/graphql', {
  method: 'POST',
  headers: { 'content-type': 'application/json', cookie: `yy_session=${goodJwt}` },
  body: JSON.stringify({ query: '{ ogGuildSlugs }' }),
});
sc = setCookies(r);
eq('子域 GraphQL 失效清除 = 双清 (两条)', sc.length, 2);
check('失效清除[0] 带 Domain', sc[0].includes('Domain=yanyun.app') && sc[0].includes('Max-Age=0'), sc[0]);
await r.text();

globalThis.fetch = realFetch;
  });

  it('H. platform control (hub) + entitlement matrix', async () => {
/* ---------------- H. platform control (hub) + entitlement matrix ---------------- */
const P = makeDb({
  tenants: [tenantRow('paytest', '权益测试百业'), tenantRow('stripetest', '订阅测试百业')],
  settings: [
    ['paytest|discord_guild_id', DGID],
    ['stripetest|discord_guild_id', DGID],
    ['paytest|subdomain_enabled', '1'],
    ['stripetest|subdomain_enabled', '1'],
    ['|game_version', 'intl-v2.3'],
  ],
  events: [evRow(9, 'paytest', { title: '权益测试车' })],
  entitlements: [
    ['stripetest', {
      tenant: 'stripetest', plan: 'premium', source: 'stripe',
      current_period_end: NOW + 86400 * 30, stripe_customer_id: 'cus_x',
      stripe_subscription_id: 'sub_x', updated_at: NOW,
    }],
  ],
});
const envP = { DB: P.db, ASSETS: env.ASSETS };
const callP = (url) => worker.fetch(new Request(url), envP, wctx);

/* Platform-admin plumbing (hub overhaul): this section used to
 * drive the switch through the retired hub REST portal; it now goes
 * through the GraphQL admin surface with an env-floor platform
 * admin. The adapter keeps the {status, json:{ok, billing}} shape
 * the assertions were written against, and maps payload errorCodes
 * back to the old HTTP statuses (gate refusal -> 401, unknown guild
 * -> 404). */
const ADMIN_BILLING_FIELDS_SD = `paygateEnabled stripeConfigured customDomainSaasConfigured
  plans { tier plan name nameEn subtitle subtitleEn priceMonthlyCents }
  tenants { slug guildName plan source tier effectiveTier tierName tierNameEn tierSubtitle
    currentPeriodEnd lapsed pastDue hasCard trialUsed stripeCustomerId stripeSubscriptionId
    subdomainEnabled customDomainHostname customDomainStatus }`;
const adminEnvSd = { DB: P.db, SITE_URL: 'http://local', PLATFORM_ADMIN_DISCORD_IDS: 'SD-ADMIN' };
const adminUserSd = { discordId: 'SD-ADMIN', name: 'subdomain-test admin', guilds: [] as string[] };
function shapeBillingSd(b: any) {
  if (!b) return null;
  return { ...b, tenants: (b.tenants || []).map((t: any) => ({ ...t,
    guild_name: t.guildName,
    customDomain: t.customDomainHostname ? { hostname: t.customDomainHostname, status: t.customDomainStatus } : null })) };
}
async function adminGqlSd(query: string, { user = adminUserSd }: any = {}) {
  const ctx = { env: adminEnvSd, request: new Request('http://local/graphql'), user,
    locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: { waitUntil() {} } };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  }), ctx);
  return res.json();
}
async function hubP(path: string, method = 'GET', body?: any, withToken = true) {
  const user = withToken ? adminUserSd : null;
  if (path === '/api/hub/billing' && method === 'GET') {
    const r = await adminGqlSd(`{ viewer { platformAdmin { __typename ... on PlatformAdmin { billing { ${ADMIN_BILLING_FIELDS_SD} } } } } }`, { user });
    const pa = r.data?.viewer?.platformAdmin;
    if (!pa || pa.__typename !== 'PlatformAdmin') return { status: 401, json: null as any };
    return { status: 200, json: { ok: true, billing: shapeBillingSd(pa.billing) } };
  }
  if (path === '/api/hub/billing/subdomain' && method === 'PUT') {
    const r = await adminGqlSd(`mutation { platformAdminSetSubdomain(slug: ${JSON.stringify(body?.slug)}, enabled: ${!!body?.enabled}) { ok error errorCode billing { ${ADMIN_BILLING_FIELDS_SD} } } }`, { user });
    const payload = r.data?.platformAdminSetSubdomain;
    if (!payload) return { status: 401, json: null as any };
    const status = payload.ok ? 200
      : payload.errorCode === 'platformAdminRequired' ? 401
      : payload.errorCode === 'guildNotFound' || payload.errorCode === 'customDomainNotBound' ? 404
      : 400;
    return { status, json: { ok: payload.ok, error: payload.error ?? null,
      message: payload.error ?? null, billing: shapeBillingSd(payload.billing) } };
  }
  throw new Error('unmapped admin op: ' + method + ' ' + path);
}
{
  const res = await hubP('/api/hub/billing', 'GET', undefined, false);
  eq('admin: 计费状态需超管会话', res.status, 401);
}
const tenantState = (hb, slug) => hb.json?.billing?.tenants?.find((t) => t.slug === slug);
let hb = await hubP('/api/hub/billing');
eq('admin: 计费状态可读', hb.status, 200);
eq('admin: paytest 子域开关显示为开', tenantState(hb, 'paytest')?.subdomainEnabled, true);
eq('admin: stripetest 子域开关显示为开', tenantState(hb, 'stripetest')?.subdomainEnabled, true);

/* paygate OFF: the admin flip alone starts/stops resolution */
hb = await hubP('/api/hub/billing/subdomain', 'PUT', { slug: 'paytest', enabled: false });
eq('admin: 关子域 ok', hb.status, 200);
eq('admin: 关后状态回读为关', tenantState(hb, 'paytest')?.subdomainEnabled, false);
eq('admin 关后停解析 (总闸关时开关即全部)', await resolveGuildSubdomain(P.db, 'paytest.yanyun.app'), null);
r = await callP('https://paytest.yanyun.app/');
eq('admin 关后子域 404', r.status, 404);
await r.text();
hb = await hubP('/api/hub/billing/subdomain', 'PUT', { slug: 'paytest', enabled: true });
eq('admin: 开子域 ok', hb.status, 200);
eq('admin 开后立即解析', await resolveGuildSubdomain(P.db, 'paytest.yanyun.app'), 'paytest');
r = await callP('https://paytest.yanyun.app/');
eq('admin 开后子域出页', r.status, 200);
await r.text();
hb = await hubP('/api/hub/billing/subdomain', 'PUT', { slug: 'ghost', enabled: true });
eq('admin: 不存在的百业 -> 404', hb.status, 404);

/* paygate ON: the entitlement matrix */
await setPaygateEnabled(P.db, true);
eq('总闸开 + 无权益 -> 不解析', await resolveGuildSubdomain(P.db, 'paytest.yanyun.app'), null);
eq('总闸开 + 无权益 -> verdict 关', await isGuildSubdomainEnabled(P.db, 'paytest'), false);
r = await callP('https://paytest.yanyun.app/');
eq('总闸开 + 无权益 -> 子域 404', r.status, 404);
const gatedBody = await r.text();
r = await callP('https://ghost2.yanyun.app/');
eq('未达标与不存在 404 一致 (防枚举)', await r.text(), gatedBody);
const msgGated = await buildReminderMessage(P.db, P.tables.events.find((e) => e.id === 9), 'paytest', NOW);
eq('总闸开 + 无权益 -> 提醒链接回主域形态', msgGated.embeds[0].url, 'https://yanyun.app/paytest/car/9');
eq('总闸开 + Stripe 权益有效 -> 解析', await resolveGuildSubdomain(P.db, 'stripetest.yanyun.app'), 'stripetest');
await grantPremiumManual(P.db, 'paytest', 30);
eq('总闸开 + 手工授予 -> 解析', await resolveGuildSubdomain(P.db, 'paytest.yanyun.app'), 'paytest');
r = await callP('https://paytest.yanyun.app/');
eq('授予后子域出页', r.status, 200);
await r.text();
const msgPremium = await buildReminderMessage(P.db, P.tables.events.find((e) => e.id === 9), 'paytest', NOW);
eq('授予后提醒链接回子域', msgPremium.embeds[0].url, 'https://paytest.yanyun.app/car/9');
await revokePremium(P.db, 'paytest');
eq('撤销后立即停解析', await resolveGuildSubdomain(P.db, 'paytest.yanyun.app'), null);
P.tables.entitlements.set('paytest', {
  tenant: 'paytest', plan: 'premium', source: 'manual',
  current_period_end: NOW - 60, stripe_customer_id: '',
  stripe_subscription_id: '', updated_at: NOW,
});
eq('权益过期 -> 停解析', await resolveGuildSubdomain(P.db, 'paytest.yanyun.app'), null);
await grantPremiumManual(P.db, 'paytest', 30);
await setGuildSubdomainEnabled(P.db, 'paytest', false);
eq('开关关 + 有权益 -> 不解析', await resolveGuildSubdomain(P.db, 'paytest.yanyun.app'), null);
await setGuildSubdomainEnabled(P.db, 'paytest', true);
eq('开关重开 + 权益在 -> 恢复解析', await resolveGuildSubdomain(P.db, 'paytest.yanyun.app'), 'paytest');
await revokePremium(P.db, 'paytest');
await setPaygateEnabled(P.db, false);
eq('总闸关 + 无权益 + 开关开 -> 解析 (回到现状口径)', await resolveGuildSubdomain(P.db, 'paytest.yanyun.app'), 'paytest');

check('H 无未路由 SQL', P.unknownSql.size === 0, [...P.unknownSql].join(' | '));
check('无未路由 SQL', A.unknownSql.size === 0, [...A.unknownSql].join(' | '));
  });

});
