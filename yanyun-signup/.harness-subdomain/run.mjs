// Platform subdomains acceptance (white-label tier A, 2026-10-27):
//  - host parsing: only single slug-charset labels under yanyun.app
//    qualify; 'og' is reserved for the OG worker; apex / previews /
//    foreign hosts never parse;
//  - resolution: tenant exists + subdomain_enabled='1' + not
//    dev_only; unopened and unknown labels resolve identically
//    (null), and the worker answers both with the same plain 404 on
//    every path — no enumeration, no main-site content on stray
//    hosts;
//  - live-subdomain dispatch: / = the guild front page (og:url = the
//    subdomain root), /car/:id = its car page, /admin = its admin
//    page; other guilds' slug paths 404 under this host; global SPA
//    routes fall through untouched;
//  - canonical URLs follow the host at the composition points:
//    /c/:code landing, groupingDetailPage.shareUrl, the reminder
//    embed title link — while main-host outputs stay byte-exact;
//  - admin surface: the switch + server-composed addresses + note
//    copy live only on GuildAdmin; the mutation re-runs the admin
//    verdict and flips resolution immediately.
// Real worker fetch + real yoga + FakeDB routing by SQL shape into
// in-memory tables (same pattern as .harness-guildadmin).
import { yoga } from '../src/graphql.ts';
import {
  parseGuildSubdomainSlug, resolveGuildSubdomain, isGuildSubdomainEnabled,
  guildSubdomainOrigin, guildSubdomainUrl, guildSubdomainCallbackUrl,
} from '../src/domains/guilds/subdomain.ts';
import { mintShortLink } from '../src/domains/groupings/shortlinks.ts';
import { buildReminderMessage } from '../src/domains/groupings/reminder.ts';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}
function eq(name, got, want) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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
  };
  const unknownSql = new Set();
  function norm(sql) {
    return sql.replace(/"/g, '').replace(/\b(tenants|settings|users|events|signups|short_links|guild_members|guild_avatars|user_guild_nicks|dungeons)\./g, '').replace(/\s+/g, ' ');
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
      if (table === 'events') tables.events.push(row);
      else if (table === 'signups') tables.signups.push(row);
      return { meta: { changes: 1, last_row_id: row.id ?? 0 } };
    }
    if (/\b(CREATE TABLE|ALTER TABLE|PRAGMA)\b/i.test(sql)) return kind === 'run' ? { meta: { changes: 0 } } : (kind === 'first' ? null : { results: [] });

    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });
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

/* ---------------- B. resolution + origins ---------------- */
eq('已开子域解析', await resolveGuildSubdomain(A.db, 'subtest.yanyun.app'), 'subtest');
eq('未开子域不解析', await resolveGuildSubdomain(A.db, 'offtest.yanyun.app'), null);
eq('不存在子域不解析', await resolveGuildSubdomain(A.db, 'ghost.yanyun.app'), null);
eq('origin 组合', guildSubdomainOrigin('jijiguagua'), 'https://jijiguagua.yanyun.app');
eq('子域地址', guildSubdomainUrl('jijiguagua'), 'https://jijiguagua.yanyun.app');
eq('回调地址', guildSubdomainCallbackUrl('jijiguagua'), 'https://jijiguagua.yanyun.app/auth/discord/callback');
eq('enabled 读 (开)', await isGuildSubdomainEnabled(A.db, 'subtest'), true);
eq('enabled 读 (默认关)', await isGuildSubdomainEnabled(A.db, 'offtest'), false);
A.tables.settings.set('subtest|dev_only', '1');
eq('dev_only 百业永不经子域解析', await resolveGuildSubdomain(A.db, 'subtest.yanyun.app'), null);
A.tables.settings.delete('subtest|dev_only');
eq('dev_only 复位后恢复解析', await resolveGuildSubdomain(A.db, 'subtest.yanyun.app'), 'subtest');

/* ---------------- C. worker host gate + dispatch ---------------- */
const env = { DB: A.db, ASSETS: { fetch: async (req) => {
  const p = new URL(req.url).pathname;
  if (p === '/index.html') return new Response('<html><head></head><body>SPA-INDEX</body></html>', { status: 200, headers: { 'content-type': 'text/html' } });
  return new Response('not found', { status: 404 });
} } };
const wctx = { waitUntil() {} };
const worker = (await import('../src/worker.ts')).default;
const call = (url) => worker.fetch(new Request(url), env, wctx);

let r = await call('https://offtest.yanyun.app/');
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
const link = await mintShortLink(A.db, 'subtest', 7);
r = await call(`https://subtest.yanyun.app/c/${link.code}`);
eq('子域上短链 -> 302', r.status, 302);
eq('子域短链落点 = 子域车址', r.headers.get('location'), 'https://subtest.yanyun.app/car/7');
await r.text();
r = await call(`https://yanyun.app/c/${link.code}`);
eq('主域短链 -> 302', r.status, 302);
eq('主域短链落点不变', r.headers.get('location'), 'https://yanyun.app/subtest/car/7');
await r.text();

/* ---------------- D. GraphQL shareUrl follows the request host ---------------- */
async function gql(query, { user = null, variables, url = 'https://yanyun.app/graphql' } = {}) {
  const ctx = { env: { DB: A.db }, request: new Request(url), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request(url, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}
const shareQ = `query($slug: String, $id: ID!) { groupingDetailPage(slug: $slug, id: $id) { shareUrl } }`;
let g = await gql(shareQ, { user: MEMBER, variables: { slug: 'subtest', id: '7' }, url: 'https://subtest.yanyun.app/graphql' });
check('子域请求详情无 errors', !g.errors, JSON.stringify(g.errors || '').slice(0, 200));
eq('子域请求 shareUrl 在子域上', g.data?.groupingDetailPage?.shareUrl, `https://subtest.yanyun.app/c/${link.code}`);
g = await gql(shareQ, { user: MEMBER, variables: { slug: 'subtest', id: '7' }, url: 'https://yanyun.app/graphql' });
eq('主域请求 shareUrl 在主域上 (同码)', g.data?.groupingDetailPage?.shareUrl, `https://yanyun.app/c/${link.code}`);
g = await gql(shareQ, { user: MEMBER, variables: { slug: 'offtest', id: '8' }, url: 'https://yanyun.app/graphql' });
check('未开子域百业 shareUrl 仍是主域短链', /^https:\/\/yanyun\.app\/c\/[0-9A-Za-z]{7}$/.test(g.data?.groupingDetailPage?.shareUrl || ''), g.data?.groupingDetailPage?.shareUrl);

/* ---------------- E. reminder embed link follows the guild's switch ---------------- */
const msgOn = await buildReminderMessage(A.db, A.tables.events.find((e) => e.id === 7), 'subtest', NOW);
eq('已开子域百业提醒链接 = 子域车址', msgOn.embeds[0].url, 'https://subtest.yanyun.app/car/7');
check('提醒冻结文案一字未动', msgOn.content.includes('发起了就位确认：你准备好了吗？'), msgOn.content);
const msgOff = await buildReminderMessage(A.db, A.tables.events.find((e) => e.id === 8), 'offtest', NOW);
eq('未开子域百业提醒链接不变', msgOff.embeds[0].url, 'https://yanyun.app/offtest/car/8');

/* ---------------- F. admin surface ---------------- */
const adminQ = `{ viewer { guildAdmin(slug: "offtest") { __typename ... on GuildAdmin { subdomainEnabled subdomainUrl subdomainCallbackUrl adminSubdomainTitle adminSubdomainNote } } } }`;
g = await gql(adminQ, { user: ADMIN });
eq('服主见 GuildAdmin', g.data?.viewer?.guildAdmin?.__typename, 'GuildAdmin');
eq('开关默认关', g.data?.viewer?.guildAdmin?.subdomainEnabled, false);
eq('子域地址服务端组合', g.data?.viewer?.guildAdmin?.subdomainUrl, 'https://offtest.yanyun.app');
eq('回调地址服务端组合', g.data?.viewer?.guildAdmin?.subdomainCallbackUrl, 'https://offtest.yanyun.app/auth/discord/callback');
eq('段标题文案', g.data?.viewer?.guildAdmin?.adminSubdomainTitle, '平台子域');
check('说明文案讲清回调登记', (g.data?.viewer?.guildAdmin?.adminSubdomainNote || '').includes('Discord')
  && (g.data?.viewer?.guildAdmin?.adminSubdomainNote || '').includes('登记'), g.data?.viewer?.guildAdmin?.adminSubdomainNote);
g = await gql(adminQ, { user: MEMBER });
eq('普通成员只见 Locked', g.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
g = await gql(`{ viewer { guildAdmin(slug: "offtest") { ... on GuildAdminLocked { subdomainEnabled } } } }`, { user: MEMBER });
check('Locked 类型无子域字段 -> 校验错误', Array.isArray(g.errors) && g.errors.length > 0);

const subMut = `mutation($enabled: Boolean!) { updateGuildSubdomain(slug: "offtest", enabled: $enabled) { ok errorCode } }`;
g = await gql(subMut, { user: MEMBER, variables: { enabled: true } });
eq('成员翻开关 -> adminOnly', g.data?.updateGuildSubdomain?.errorCode, 'adminOnly');
eq('成员尝试未落库', A.tables.settings.get('offtest|subdomain_enabled'), undefined);
g = await gql(subMut, { user: ADMIN, variables: { enabled: true } });
eq('服主开开关 ok', g.data?.updateGuildSubdomain?.ok, true);
eq('开关已落库', A.tables.settings.get('offtest|subdomain_enabled'), '1');
g = await gql(adminQ, { user: ADMIN });
eq('再读开关为开', g.data?.viewer?.guildAdmin?.subdomainEnabled, true);
eq('开后子域立即解析', await resolveGuildSubdomain(A.db, 'offtest.yanyun.app'), 'offtest');
r = await call('https://offtest.yanyun.app/');
eq('开后子域根立即出页', r.status, 200);
await r.text();
g = await gql(subMut, { user: ADMIN, variables: { enabled: false } });
eq('关开关 ok', g.data?.updateGuildSubdomain?.ok, true);
eq('关后子域立即停解析', await resolveGuildSubdomain(A.db, 'offtest.yanyun.app'), null);

check('无未路由 SQL', A.unknownSql.size === 0, [...A.unknownSql].join(' | '));

console.log(`\n== subdomain harness: ${pass} passed, ${fail} failed ==`);
if (fails.length) { console.log('FAILS:\n' + fails.map((f) => ' - ' + f).join('\n')); process.exit(1); }
