// Guild admin surface acceptance (REST shutdown batch §1, 2026-10-26):
// the GraphQL replacement for gadmin. Verdict = Discord session +
// viewer manages the bound Discord server (same check as createGuild),
// expressed ONLY by the GuildAdmin / GuildAdminLocked response types.
// Covers: verdict matrix (anonymous / member / ManageGuild bit / owner /
// unbound / missing / dev_only), the omniscient doctrine (system-path
// VC passes the admin verdict in full, writes included), webhook secrecy (full URL never read
// back, only set-state + numeric id), profile/discord/visibility
// mutations, base64 avatar flow with the same server-side
// validation as the retired binary upload, admin event CRUD + signup removal + race
// results, byte-exact CSV export, school-guide upserts, and the OG
// card data channel (ogGuildCard / ogCarCard) that replaces the OG
// worker's REST reads. Real yoga + real resolvers + FakeDB that routes
// by SQL shape into real in-memory tables.
import { yoga } from '../src/graphql.ts';
import { avatarPath } from '../src/domains/guilds/guildavatar.ts';
import { weekWindowUtc } from '../src/domains/platform/blocks.ts';
import { OMNISCIENT_VIEWER } from '../src/domains/platform/context.ts';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}
function eq(name, got, want) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* Convert FakeDB object rows into the values-mode arrays the Drizzle
   D1 driver returns (same helper shape as the identity suite). */
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
function makeDb(fx = {}) {
  const tables = {
    tenants: (fx.tenants || []).map((t) => ({ ...t })),
    settings: new Map(fx.settings || []), // `${tenant}|${key}` -> value
    users: new Map(fx.users || []),       // discord_id -> guilds_json string
    events: (fx.events || []).map((e) => ({ ...e })),
    signups: (fx.signups || []).map((r) => ({ ...r })),
    results: (fx.results || []).map((r) => ({ ...r })),
    avatars: new Map(), // tenant -> { content_type, bytes, hash, updated_at }
    schoolBis: (fx.schoolBis || []).map((r) => ({ ...r })),
    schoolRotations: (fx.schoolRotations || []).map((r) => ({ ...r })),
    guildMembers: (fx.guildMembers || []).map((m) => ({ ...m })),
  };
  let nextId = 5000;
  const unknownSql = new Set();

  function norm(sql) {
    return sql.replace(/"/g, '').replace(/\b(tenants|settings|users|events|signups|results|guild_avatars|school_bis|school_rotations|guild_entitlements)\./g, '').replace(/\s+/g, ' ');
  }
  function parseCols(list) {
    return list.split(',').map((c) => c.trim().split('.').pop());
  }

  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } }; // error sink: swallowed
    /* ---- generic INSERT (column list parsed) ---- */
    let m = /^INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)/i.exec(sql);
    if (m) {
      const [, table, colList] = m;
      const cols = parseCols(colList);
      const row = {};
      cols.forEach((c, i) => { row[c] = b[i]; });
      if (/ON CONFLICT/i.test(sql)) {
        if (table === 'settings') { tables.settings.set(`${row.tenant}|${row.key}`, row.value); return { meta: { changes: 1 } }; }
        if (table === 'school_bis') {
          const ex = tables.schoolBis.find((r) => r.school === row.school && r.build === row.build);
          if (ex) Object.assign(ex, row); else tables.schoolBis.push(row);
          return { meta: { changes: 1 } };
        }
        if (table === 'school_rotations') {
          const ex = tables.schoolRotations.find((r) => r.school === row.school);
          if (ex) Object.assign(ex, row); else tables.schoolRotations.push(row);
          return { meta: { changes: 1 } };
        }
        if (table === 'guild_avatars') { tables.avatars.set(row.tenant, row); return { meta: { changes: 1 } }; }
      }
      row.id = nextId++;
      if (table === 'events') tables.events.push(row);
      else if (table === 'signups') tables.signups.push(row);
      else if (table === 'results') tables.results.push(row);
      else if (table === 'settings') tables.settings.set(`${row.tenant}|${row.key}`, row.value);
      else if (table === 'guild_avatars') tables.avatars.set(row.tenant, row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    /* ---- generic UPDATE ... SET col = ? ... WHERE id/tenant conditions ---- */
    m = /^UPDATE (\w+) SET (.+?) WHERE (.+)$/i.exec(sql);
    if (m) {
      const [, table, setList, where] = m;
      const setCols = setList.split(',').map((p) => p.trim().split('=')[0].trim().split('.').pop());
      const sets = {};
      setCols.forEach((c, i) => { sets[c] = b[i]; });
      const wb = b.slice(setCols.length);
      let rows = [];
      if (table === 'tenants') rows = tables.tenants.filter((t) => t.slug === wb[0]);
      else if (table === 'events') rows = tables.events.filter((e) => e.id === Number(wb[0]) && (wb.length < 2 || e.tenant === wb[1]));
      else if (table === 'signups') rows = tables.signups.filter((x) => x.id === Number(wb[0]));
      for (const r of rows) Object.assign(r, sets);
      return { meta: { changes: rows.length } };
    }
    /* ---- DELETE ---- */
    if (/^DELETE FROM guild_avatars/i.test(sql)) { tables.avatars.delete(b[0]); return { meta: { changes: 1 } }; }
    if (/^DELETE FROM signups WHERE event_id/i.test(sql)) {
      tables.signups = tables.signups.filter((x) => x.event_id !== Number(b[0]));
      return { meta: { changes: 1 } };
    }
    if (/^DELETE FROM signups WHERE id/i.test(sql)) {
      tables.signups = tables.signups.filter((x) => x.id !== Number(b[0]));
      return { meta: { changes: 1 } };
    }
    if (/^DELETE FROM results WHERE event_id/i.test(sql)) {
      tables.results = tables.results.filter((x) => x.event_id !== Number(b[0]));
      return { meta: { changes: 1 } };
    }
    if (/^DELETE FROM results WHERE id/i.test(sql)) {
      tables.results = tables.results.filter((x) => x.id !== Number(b[0]));
      return { meta: { changes: 1 } };
    }
    if (/^DELETE FROM events WHERE id/i.test(sql)) {
      tables.events = tables.events.filter((x) => x.id !== Number(b[0]) || (b.length > 1 && x.tenant !== b[1]));
      return { meta: { changes: 1 } };
    }
    if (/\b(CREATE TABLE|ALTER TABLE|PRAGMA)\b/i.test(sql)) return kind === 'run' ? { meta: { changes: 0 } } : (kind === 'first' ? null : { results: [] });

    /* ---- SELECTs ---- */
    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });
    // Entitlement reads (the gate wrapper reads its facts on admin
    // paths since the Statsig migration): the fixture tenants carry
    // no entitlement rows, so both shapes answer empty.
    if (/FROM guild_entitlements WHERE tenant = \?/i.test(sql)) return first(null);
    if (/FROM guild_entitlements/i.test(sql)) return all([]);
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
    if (/FROM guild_avatars/i.test(sql)) {
      const row = tables.avatars.get(b[0]);
      return first(row ? { content_type: row.content_type, bytes: row.bytes, hash: row.hash, updated_at: row.updated_at } : null);
    }
    if (/FROM events e WHERE e\.tenant/i.test(sql) && /signup_count/i.test(sql)) {
      // week view or admin list (both compute signup_count over e.*)
      let rows = tables.events.filter((e) => e.tenant === b[0]);
      let bi = 1;
      if (/e\.status NOT IN/i.test(sql)) rows = rows.filter((e) => !['draft', 'completed'].includes(e.status));
      if (/e\.type = \?/i.test(sql)) { rows = rows.filter((e) => e.type === b[bi]); bi++; }
      if (/e\.starts_at_utc >= \?/i.test(sql)) { rows = rows.filter((e) => e.starts_at_utc != null && e.starts_at_utc >= b[bi]); bi++; }
      if (/e\.starts_at_utc <= \?/i.test(sql)) { rows = rows.filter((e) => e.starts_at_utc != null && e.starts_at_utc <= b[bi]); bi++; }
      if (/ORDER BY e\.id DESC/i.test(sql)) rows.sort((a, c) => c.id - a.id);
      return all(rows.map((e) => ({ ...e, signup_count: tables.signups.filter((r) => r.event_id === e.id).length })));
    }
    if (/SELECT id, tenant, creator_discord_id FROM events WHERE id = \?/i.test(sql)) {
      return first(tables.events.find((e) => e.id === Number(b[0])));
    }
    if (/SELECT \* FROM events WHERE id = \? AND tenant = \?/i.test(sql)) {
      return first(tables.events.find((e) => e.id === Number(b[0]) && e.tenant === b[1]));
    }
    if (/SELECT id FROM events WHERE id = \? AND tenant = \?/i.test(sql)) {
      const e = tables.events.find((x) => x.id === Number(b[0]) && x.tenant === b[1]);
      return first(e ? { id: e.id } : null);
    }
    if (/SELECT \* FROM events WHERE id = \?/i.test(sql)) {
      return first(tables.events.find((e) => e.id === Number(b[0])));
    }
    if (/FROM signups WHERE event_id/i.test(sql) && /COUNT/i.test(sql)) {
      return first({ c: tables.signups.filter((r) => r.event_id === Number(b[0])).length });
    }
    if (/SELECT \* FROM signups WHERE event_id/i.test(sql)) {
      return all(tables.signups.filter((r) => r.event_id === Number(b[0])).sort((a, c) => a.id - c.id));
    }
    if (/FROM signups WHERE event_id/i.test(sql)) {
      // Column-subset seat reads (listSignupSeats): rows are full
      // objects in this FakeDB; consumers pick their columns.
      return all(tables.signups.filter((r) => r.event_id === Number(b[0])).sort((a, c) => a.id - c.id));
    }
    if (/FROM signups s JOIN events/i.test(sql)) {
      const sRow = tables.signups.find((x) => x.id === Number(b[0]));
      const ev = sRow && tables.events.find((e) => e.id === sRow.event_id && e.tenant === b[1]);
      return first(ev && sRow ? { id: sRow.id } : null);
    }
    if (/FROM results WHERE event_id/i.test(sql)) {
      return all(tables.results.filter((r) => r.event_id === Number(b[0])).sort((a, c) => a.time_ms - c.time_ms));
    }
    if (/FROM results JOIN events/i.test(sql)) {
      const r = tables.results.find((x) => x.id === Number(b[0]));
      const ev = r && tables.events.find((e) => e.id === r.event_id && e.tenant === b[1]);
      return first(ev && r ? { id: r.id } : null);
    }
    if (/FROM school_bis/i.test(sql)) return all(tables.schoolBis);
    if (/FROM school_rotations/i.test(sql)) return all(tables.schoolRotations);
    if (/FROM events WHERE tenant = \? AND starts_at_utc >= \? AND starts_at_utc < \?/i.test(sql)) {
      // admin stats window read (listEventsInWindow)
      return all(tables.events.filter((e) => e.tenant === b[0] && e.starts_at_utc != null && e.starts_at_utc >= b[1] && e.starts_at_utc < b[2])
        .sort((a, c) => a.id - c.id));
    }
    if (/FROM guild_members/i.test(sql)) {
      let rows = tables.guildMembers.filter((m) => m.tenant === b[0]);
      if (/discord_id = \?/i.test(sql) && b.length > 1) rows = rows.filter((m) => m.discord_id === String(b[1]));
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    if (/FROM user_guild_nicks/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/COUNT\(DISTINCT/i.test(sql)) return first({ c: 0 });
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
const DGID = '424242424242424242';
const serversJson = (rows) => JSON.stringify(rows);
const ADMIN = { discordId: 'UA', name: '服主', guilds: [DGID] };
const MANAGER = { discordId: 'UM', name: '管理员', guilds: [DGID] };
const MEMBER = { discordId: 'UB', name: '成员', guilds: [DGID] };
const OUTSIDER = { discordId: 'UZ', name: '路人', guilds: [] };

const WEEK_FROM = 1_700_000_000, WEEK_TO = WEEK_FROM + 7 * 86400;
function tenantRow(over = {}) {
  return {
    slug: 'admintest', guild_name: '管理测试百业', password_hash: 'x', announcement: '本周六晚八点集合',
    slogan: '同舟共济', master_name: '老船长', logo_url: '', bg_image_url: '',
    discord_webhook: '', created_at: '2026-01-01 00:00:00', ...over,
  };
}
function evRow(id, over = {}) {
  return {
    id, tenant: 'admintest', title: '车' + id, type: 'activity', description: '',
    starts_at: null, meet_info: '', max_slots: 10, status: 'open',
    starts_at_utc: null, origin: 'member', created_by: '', manage_code: '',
    dungeon: '', creator_discord_id: 'UB', reminder_sent_at: null, reminder_error: null, ...over,
  };
}
const A = makeDb({
  tenants: [
    tenantRow(),
    tenantRow({ slug: 'unbound', guild_name: '未绑定百业' }),
    tenantRow({ slug: 'devtest', guild_name: '开发百业' }),
  ],
  settings: [
    ['admintest|discord_guild_id', DGID],
    ['devtest|discord_guild_id', DGID],
    ['devtest|dev_only', '1'],
    ['|game_version', 'intl-v2.3'],
  ],
  users: [
    ['UA', serversJson([{ id: DGID, name: '测试服', icon: '', permissions: '0', owner: true }])],
    ['UM', serversJson([{ id: DGID, name: '测试服', icon: '', permissions: '32', owner: false }])], // ManageGuild bit
    ['UB', serversJson([{ id: DGID, name: '测试服', icon: '', permissions: '0', owner: false }])],
  ],
  events: [
    evRow(101, { title: '周六双十', starts_at_utc: WEEK_FROM + 3600 }),
    evRow(102, { title: '天赋车', type: 'talent', starts_at_utc: WEEK_FROM + 7200 }),
    evRow(103, { title: '已完成车', status: 'completed', starts_at_utc: WEEK_FROM + 3600 }),
    evRow(104, { title: '下周车', starts_at_utc: WEEK_TO + 86400 }),
    evRow(105, { title: '竞速车', type: 'race', status: 'closed', starts_at_utc: WEEK_FROM + 100 }),
  ],
  signups: [
    { id: 31, event_id: 101, nickname: '阿青', uid: '1001', role: '输出', weapon: '鸣金·虹', contact: '', note: '', team_name: '', members: '', created_at: '2026-01-02 03:04:05', discord_id: 'UB' },
    { id: 32, event_id: 101, nickname: '含"引号', uid: '1002', role: '奶', weapon: '牵丝·霖', contact: 'wx,123', note: '第一行\n第二行', team_name: '一队', members: '阿青,含"引号', created_at: '2026-01-02 03:05:05', discord_id: null },
  ],
  results: [
    { id: 41, event_id: 105, team_name: '一队', members: '阿青,输出乙', time_ms: 83456, proof_url: '', note: '', created_at: '2026-01-02 04:00:00' },
  ],
  schoolBis: [{ school: '鸣金·虹', build: '会意流', attr: '会意 300', rate: '60%', bis_json: '{"a":1}' }],
  schoolRotations: [{ school: '鸣金·虹', rotation_json: '{"steps":[]}' }],
});
const env = { DB: A.db };

async function gql(query, { user = null, variables, vc } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  if (vc) ctx.vc = vc;
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

/* ---------------- verdict matrix ---------------- */
const adminQ = `{ viewer { guildAdmin(slug: "admintest") { __typename ... on GuildAdmin { slug name announcement slogan masterName logoUrl bgImageUrl discordGuildId reminderWebhookSet reminderWebhookId devOnly adminTitle } ... on GuildAdminLocked { slug adminLockedTitle } } } }`;
let r = await gql(adminQ, { user: null });
eq('匿名 -> GuildAdminLocked', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
r = await gql(adminQ, { user: MEMBER });
eq('普通成员 -> GuildAdminLocked', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
r = await gql(adminQ, { user: OUTSIDER });
eq('非成员 -> GuildAdminLocked', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
r = await gql(adminQ, { user: ADMIN });
eq('服主 -> GuildAdmin', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdmin');
eq('GuildAdmin.name', r.data?.viewer?.guildAdmin?.name, '管理测试百业');
eq('GuildAdmin.discordGuildId', r.data?.viewer?.guildAdmin?.discordGuildId, DGID);
eq('GuildAdmin.webhook 未设置', r.data?.viewer?.guildAdmin?.reminderWebhookSet, false);
eq('GuildAdmin.adminTitle 文案', r.data?.viewer?.guildAdmin?.adminTitle, '管理百业');
eq('GuildAdmin.masterName 读回', r.data?.viewer?.guildAdmin?.masterName, '老船长');
eq('GuildAdmin.logoUrl 读回', r.data?.viewer?.guildAdmin?.logoUrl, '');
eq('GuildAdmin.bgImageUrl 读回', r.data?.viewer?.guildAdmin?.bgImageUrl, '');
r = await gql(adminQ.replaceAll('admintest', 'unbound'), { user: ADMIN });
eq('未绑定百业 -> Locked', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
r = await gql(adminQ.replaceAll('admintest', 'nosuch'), { user: ADMIN });
eq('不存在百业 -> Locked', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
r = await gql(adminQ.replaceAll('admintest', 'devtest'), { user: ADMIN });
eq('dev_only 百业 (非 dev 来源) -> Locked', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
// Content fields are not on the Locked type at all.
r = await gql(`{ viewer { guildAdmin(slug: "admintest") { ... on GuildAdminLocked { name } } } }`, { user: MEMBER });
check('Locked 类型查内容字段 -> schema 校验错误', Array.isArray(r.errors) && r.errors.length > 0);

/* ---------------- mutation gate ---------------- */
const profMut = `mutation($input: UpdateGuildProfileInput!) { updateGuildProfile(slug: "admintest", input: $input) { ok errorCode } }`;
r = await gql(profMut, { user: MEMBER, variables: { input: { name: '改名尝试' } } });
eq('成员改资料 -> adminOnly', r.data?.updateGuildProfile?.errorCode, 'adminOnly');
r = await gql(profMut, { user: null, variables: { input: { name: '改名尝试' } } });
eq('匿名改资料 -> adminOnly', r.data?.updateGuildProfile?.errorCode, 'adminOnly');
r = await gql(profMut, { user: ADMIN, variables: { input: { name: '新名字', announcement: '新公告' } } });
eq('服主改资料 ok', r.data?.updateGuildProfile?.ok, true);
eq('资料已落库 (name)', A.tables.tenants[0].guild_name, '新名字');
eq('资料已落库 (announcement)', A.tables.tenants[0].announcement, '新公告');
eq('未提交字段保持 (slogan)', A.tables.tenants[0].slogan, '同舟共济');
r = await gql(profMut, { user: ADMIN, variables: { input: { masterName: '新掌门', logoUrl: 'https://img/logo.png', bgImageUrl: 'https://img/bg.png' } } });
eq('服主改掌门名/logo/背景图 ok', r.data?.updateGuildProfile?.ok, true);
eq('master_name 已落库', A.tables.tenants[0].master_name, '新掌门');
eq('logo_url 已落库', A.tables.tenants[0].logo_url, 'https://img/logo.png');
eq('bg_image_url 已落库', A.tables.tenants[0].bg_image_url, 'https://img/bg.png');
eq('未提交字段保持 (name)', A.tables.tenants[0].guild_name, '新名字');
r = await gql(adminQ, { user: ADMIN });
eq('masterName 回读一致', r.data?.viewer?.guildAdmin?.masterName, '新掌门');
eq('logoUrl 回读一致', r.data?.viewer?.guildAdmin?.logoUrl, 'https://img/logo.png');
eq('bgImageUrl 回读一致', r.data?.viewer?.guildAdmin?.bgImageUrl, 'https://img/bg.png');
r = await gql(profMut, { user: ADMIN, variables: { input: { name: 'x' } } });
eq('名字过短 -> guildNameShort', r.data?.updateGuildProfile?.errorCode, 'guildNameShort');

/* ---------------- discord settings + webhook secrecy ---------------- */
const discordMut = `mutation($input: UpdateGuildDiscordInput!) { updateGuildDiscord(slug: "admintest", input: $input) { ok errorCode } }`;
const HOOK = 'https://discord.com/api/webhooks/123456789012345678/abcdef-XYZ_123';
r = await gql(discordMut, { user: ADMIN, variables: { input: { webhook: 'https://example.com/hook' } } });
eq('非法 webhook -> webhookInvalid', r.data?.updateGuildDiscord?.errorCode, 'webhookInvalid');
r = await gql(discordMut, { user: ADMIN, variables: { input: { webhook: HOOK } } });
eq('合法 webhook ok', r.data?.updateGuildDiscord?.ok, true);
r = await gql(adminQ, { user: ADMIN });
eq('webhook 已设置', r.data?.viewer?.guildAdmin?.reminderWebhookSet, true);
eq('webhook 只回编号', r.data?.viewer?.guildAdmin?.reminderWebhookId, '123456789012345678');
check('响应全文不含 webhook 密钥段', !JSON.stringify(r).includes('abcdef-XYZ_123'));
r = await gql(discordMut, { user: ADMIN, variables: { input: { discordGuildId: 'abc' } } });
eq('非法服务器 ID -> discordIdInvalid', r.data?.updateGuildDiscord?.errorCode, 'discordIdInvalid');
r = await gql(discordMut, { user: ADMIN, variables: { input: { webhook: '' } } });
eq('清除 webhook ok', r.data?.updateGuildDiscord?.ok, true);
r = await gql(adminQ, { user: ADMIN });
eq('清除后 webhookSet=false', r.data?.viewer?.guildAdmin?.reminderWebhookSet, false);

/* ---------------- visibility ---------------- */
const visMut = `mutation($v: Boolean!) { updateGuildVisibility(slug: "admintest", devOnly: $v) { ok errorCode } }`;
r = await gql(visMut, { user: ADMIN, variables: { v: true } });
eq('设置 dev_only ok', r.data?.updateGuildVisibility?.ok, true);
r = await gql(adminQ, { user: ADMIN });
eq('dev_only 后非 dev 来源 -> Locked', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
r = await gql(visMut, { user: ADMIN, variables: { v: false } });
eq('已 dev_only 时连管理员也进不去 (同 REST 门控, 预期)', r.data?.updateGuildVisibility?.errorCode, 'guildNotFound');
A.tables.settings.set('admintest|dev_only', ''); // 复位 (生产中由 dev 来源操作)

/* ---------------- advanced reminder settings ---------------- */
const remindQ = `{ viewer { guildAdmin(slug: "admintest") { ... on GuildAdmin { reminderOffsets reminderCustomText adminReminderTitle adminReminderOffsetsLabel adminReminderOffsetTemplate adminReminderCustomTextLabel adminReminderCustomTextHint } } } }`;
r = await gql(remindQ, { user: ADMIN });
eq('提醒提前量默认 [10]', JSON.stringify(r.data?.viewer?.guildAdmin?.reminderOffsets), '[10]');
eq('提醒自定义文案默认空', r.data?.viewer?.guildAdmin?.reminderCustomText, '');
eq('提醒设置文案: 标题', r.data?.viewer?.guildAdmin?.adminReminderTitle, '发车提醒设置');
eq('提醒设置文案: 提前量标签', r.data?.viewer?.guildAdmin?.adminReminderOffsetsLabel, '提醒提前量（可多选）');
eq('提醒设置文案: 提前量模板', r.data?.viewer?.guildAdmin?.adminReminderOffsetTemplate, '提前 {minutes} 分钟');
eq('提醒设置文案: 自定义文案标签', r.data?.viewer?.guildAdmin?.adminReminderCustomTextLabel, '自定义提醒文案');
check('提醒设置文案: 自定义文案提示非空', !!r.data?.viewer?.guildAdmin?.adminReminderCustomTextHint);
const remindMut = `mutation($o: [Int!]!, $c: String) { updateGuildReminderSettings(slug: "admintest", offsets: $o, customText: $c) { ok errorCode } }`;
r = await gql(remindMut, { user: MEMBER, variables: { o: [30], c: '' } });
eq('成员改提醒设置 -> adminOnly', r.data?.updateGuildReminderSettings?.errorCode, 'adminOnly');
r = await gql(remindMut, { user: ADMIN, variables: { o: [45], c: '' } });
eq('非法提前量 -> reminderOffsetsInvalid', r.data?.updateGuildReminderSettings?.errorCode, 'reminderOffsetsInvalid');
r = await gql(remindMut, { user: ADMIN, variables: { o: [30, 60], c: '今晚提前集合\n带好药' } });
eq('保存提醒设置 ok', r.data?.updateGuildReminderSettings?.ok, true);
eq('提前量已落库 (降序逗号)', A.tables.settings.get('admintest|reminder_offsets'), '60,30');
eq('自定义文案已落库 (单行化)', A.tables.settings.get('admintest|reminder_custom_text'), '今晚提前集合 带好药');
r = await gql(remindQ, { user: ADMIN });
eq('读回提前量 [60,30]', JSON.stringify(r.data?.viewer?.guildAdmin?.reminderOffsets), '[60,30]');
eq('读回自定义文案', r.data?.viewer?.guildAdmin?.reminderCustomText, '今晚提前集合 带好药');
r = await gql(remindMut, { user: ADMIN, variables: { o: [], c: '' } });
eq('清空提前量 ok', r.data?.updateGuildReminderSettings?.ok, true);
eq('清空后落库为 none', A.tables.settings.get('admintest|reminder_offsets'), 'none');
r = await gql(remindQ, { user: ADMIN });
eq('读回提前量 [] (全关)', JSON.stringify(r.data?.viewer?.guildAdmin?.reminderOffsets), '[]');
A.tables.settings.set('admintest|reminder_offsets', '60,30'); // 复位给后续段落

/* ---------------- white-label+ (branding + OG card) ---------------- */
const wlQ = `{ viewer { guildAdmin(slug: "admintest") { __typename ... on GuildAdmin { whiteLabelHideBranding ogAccent ogTitleSuffix pageFooterDisclaimerText ogAccentOptions { key hex label } adminWhiteLabelTitle adminHideBrandingLabel adminOgAccentLabel adminOgTitleSuffixLabel } } } }`;
r = await gql(wlQ, { user: ADMIN });
eq('白标默认: 不隐藏品牌', r.data?.viewer?.guildAdmin?.whiteLabelHideBranding, false);
eq('白标默认: 强调色未定制', r.data?.viewer?.guildAdmin?.ogAccent, '');
eq('白标默认: 标题后缀空', r.data?.viewer?.guildAdmin?.ogTitleSuffix, '');
eq('色板选项数', r.data?.viewer?.guildAdmin?.ogAccentOptions?.length, 5);
eq('色板首项 = 鎏金 gold', JSON.stringify(r.data?.viewer?.guildAdmin?.ogAccentOptions?.[0]),
  JSON.stringify({ key: 'gold', hex: '#c9a35c', label: '鎏金' }));
eq('白标设置文案: 标题', r.data?.viewer?.guildAdmin?.adminWhiteLabelTitle, '品牌与分享卡');
check('管理面页脚声明默认非空 (平台声明)', (r.data?.viewer?.guildAdmin?.pageFooterDisclaimerText || '').includes('非官方工具'));
r = await gql(wlQ, { user: MEMBER });
eq('成员读白标设置 -> Locked (零设置字段)', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
eq('Locked 无 whiteLabelHideBranding', r.data?.viewer?.guildAdmin?.whiteLabelHideBranding, undefined);

const chromeQ = `{ viewer { guild(slug: "admintest") { ... on Guild { pageBackLabel pageFooterDisclaimerText } } } }`;
r = await gql(chromeQ, { user: MEMBER });
eq('成员面默认返回标签带平台名', r.data?.viewer?.guild?.pageBackLabel, '← 百业集结');
check('成员面默认页脚 = 平台声明', (r.data?.viewer?.guild?.pageFooterDisclaimerText || '').includes('非官方工具'));
const ogWlQ = `{ ogGuildCard(slug: "admintest") { ogAccentColor ogTitleSuffix } }`;
r = await gql(ogWlQ, { user: null });
eq('OG 默认强调色 = 空 (默认模板)', r.data?.ogGuildCard?.ogAccentColor, '');
eq('OG 默认标题后缀 = 空', r.data?.ogGuildCard?.ogTitleSuffix, '');

const wlMut = `mutation($h: Boolean!, $a: String!, $sfx: String) { updateGuildWhiteLabel(slug: "admintest", hideBranding: $h, ogAccent: $a, ogTitleSuffix: $sfx) { ok errorCode } }`;
r = await gql(wlMut, { user: MEMBER, variables: { h: true, a: 'jade', sfx: '' } });
eq('成员改白标 -> adminOnly', r.data?.updateGuildWhiteLabel?.errorCode, 'adminOnly');
r = await gql(wlMut, { user: ADMIN, variables: { h: true, a: '#ff0000', sfx: '' } });
eq('自由色值 -> ogAccentInvalid', r.data?.updateGuildWhiteLabel?.errorCode, 'ogAccentInvalid');
r = await gql(wlMut, { user: ADMIN, variables: { h: true, a: 'pink', sfx: '' } });
eq('色板外 key -> ogAccentInvalid', r.data?.updateGuildWhiteLabel?.errorCode, 'ogAccentInvalid');
r = await gql(wlMut, { user: ADMIN, variables: { h: true, a: 'jade', sfx: '· 招募中\n第二行' } });
eq('保存白标 ok', r.data?.updateGuildWhiteLabel?.ok, true);
eq('隐藏品牌已落库', A.tables.settings.get('admintest|whitelabel_hide_branding'), '1');
eq('强调色已落库', A.tables.settings.get('admintest|og_accent'), 'jade');
eq('标题后缀已落库 (单行化)', A.tables.settings.get('admintest|og_title_suffix'), '· 招募中 第二行');
r = await gql(wlQ, { user: ADMIN });
eq('读回: 隐藏品牌', r.data?.viewer?.guildAdmin?.whiteLabelHideBranding, true);
eq('读回: 强调色 jade', r.data?.viewer?.guildAdmin?.ogAccent, 'jade');
eq('读回: 标题后缀', r.data?.viewer?.guildAdmin?.ogTitleSuffix, '· 招募中 第二行');
eq('读回: 管理面页脚声明变 null', r.data?.viewer?.guildAdmin?.pageFooterDisclaimerText, null);
r = await gql(chromeQ, { user: MEMBER });
eq('隐藏后返回标签 = 素文案', r.data?.viewer?.guild?.pageBackLabel, '← 返回');
eq('隐藏后页脚声明 = null', r.data?.viewer?.guild?.pageFooterDisclaimerText, null);
r = await gql(ogWlQ, { user: null });
eq('OG 强调色 = 翡翠 hex (服务端解析)', r.data?.ogGuildCard?.ogAccentColor, '#3fa37c');
eq('OG 标题后缀读回', r.data?.ogGuildCard?.ogTitleSuffix, '· 招募中 第二行');
r = await gql(wlMut, { user: ADMIN, variables: { h: false, a: '', sfx: '' } });
eq('恢复默认 ok', r.data?.updateGuildWhiteLabel?.ok, true);
r = await gql(ogWlQ, { user: null });
eq('恢复后 OG 强调色回空', r.data?.ogGuildCard?.ogAccentColor, '');

/* ---------------- avatar (base64) ---------------- */
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);
const pngB64 = Buffer.from(PNG).toString('base64');
const setAv = `mutation($d: String!) { setGuildAvatar(slug: "admintest", dataBase64: $d) { ok errorCode avatarUrl } }`;
r = await gql(setAv, { user: ADMIN, variables: { d: pngB64 } });
eq('上传 PNG 头像 ok', r.data?.setGuildAvatar?.ok, true);
eq('头像 URL = avatarPath 口径', r.data?.setGuildAvatar?.avatarUrl,
  'http://local' + avatarPath('admintest', A.tables.avatars.get('admintest')?.hash || ''));
r = await gql(setAv, { user: ADMIN, variables: { d: Buffer.from('not an image at all').toString('base64') } });
eq('非图片 -> avatarBadType', r.data?.setGuildAvatar?.errorCode, 'avatarBadType');
r = await gql(setAv, { user: ADMIN, variables: { d: '!!!not-base64!!!' } });
eq('坏 base64 -> avatarDataInvalid', r.data?.setGuildAvatar?.errorCode, 'avatarDataInvalid');
r = await gql(setAv, { user: ADMIN, variables: { d: Buffer.alloc(400 * 1024 + 16, 7).toString('base64') } });
eq('超限 -> avatarTooLarge', r.data?.setGuildAvatar?.errorCode, 'avatarTooLarge');
r = await gql(`mutation { deleteGuildAvatar(slug: "admintest") { ok } }`, { user: ADMIN });
eq('删除头像 ok', r.data?.deleteGuildAvatar?.ok, true);
eq('头像已清', A.tables.avatars.has('admintest'), false);

/* ---------------- events admin ---------------- */
const eventsQ = `{ viewer { guildAdmin(slug: "admintest") { ... on GuildAdmin { events { id title type status origin signupCount signups { id nickname } signupsCsv } } } } }`;
r = await gql(eventsQ, { user: ADMIN });
eq('活动列表含全部状态 (5)', r.data?.viewer?.guildAdmin?.events?.length, 5);
const ev101 = r.data?.viewer?.guildAdmin?.events?.find((e) => e.id === '101');
eq('signupCount=2', ev101?.signupCount, 2);
const expectedCsv = '\ufeff"昵称","UID","职责","流派/武器","联系方式","队伍名","队员","备注","报名时间"\r\n' +
  '"阿青","1001","输出","鸣金·虹","","","","","2026-01-02 03:04:05"\r\n' +
  '"含""引号","1002","奶","牵丝·霖","wx,123","一队","阿青,含""引号","第一行\n第二行","2026-01-02 03:05:05"';
eq('CSV 与原 REST export.csv 字节一致', ev101?.signupsCsv, expectedCsv);
const createEv = `mutation($input: CreateAdminEventInput!) { createAdminEvent(slug: "admintest", input: $input) { ok errorCode id } }`;
r = await gql(createEv, { user: ADMIN, variables: { input: { title: '管理员建车', type: 'TALENT', dungeon: '定极分更', startsAtUtc: WEEK_FROM + 5000 } } });
eq('管理员建车 ok', r.data?.createAdminEvent?.ok, true);
const newEvId = r.data?.createAdminEvent?.id;
const newEvRow = A.tables.events.find((e) => String(e.id) === String(newEvId));
eq('建车 origin=admin', newEvRow?.origin, 'admin');
eq('建车 dungeon 落库 (talent)', newEvRow?.dungeon, '定极分更');
eq('建车默认 20 席 (REST admin 口径)', newEvRow?.max_slots, 20);
const updEv = `mutation($id: ID!, $input: UpdateAdminEventInput!) { updateAdminEvent(slug: "admintest", eventId: $id, input: $input) { ok errorCode } }`;
r = await gql(updEv, { user: ADMIN, variables: { id: newEvId, input: { title: '改名车', status: 'closed' } } });
eq('改车 ok', r.data?.updateAdminEvent?.ok, true);
eq('改车落库', A.tables.events.find((e) => String(e.id) === String(newEvId))?.status, 'closed');
r = await gql(updEv, { user: ADMIN, variables: { id: '99999', input: { title: 'x' } } });
eq('改不存在车 -> groupingNotFound', r.data?.updateAdminEvent?.errorCode, 'groupingNotFound');
r = await gql(`mutation($sid: ID!) { removeEventSignup(slug: "admintest", signupId: $sid) { ok errorCode } }`,
  { user: ADMIN, variables: { sid: '31' } });
eq('移除报名 ok', r.data?.removeEventSignup?.ok, true);
eq('报名已删', A.tables.signups.some((x) => x.id === 31), false);
r = await gql(`mutation($sid: ID!) { removeEventSignup(slug: "admintest", signupId: $sid) { ok errorCode } }`,
  { user: ADMIN, variables: { sid: '31' } });
eq('重复移除 -> signupNotFound', r.data?.removeEventSignup?.errorCode, 'signupNotFound');

/* ---------------- race results ---------------- */
const addRes = `mutation($id: ID!, $input: AddEventResultInput!) { addEventResult(slug: "admintest", eventId: $id, input: $input) { ok errorCode id } }`;
r = await gql(addRes, { user: ADMIN, variables: { id: '105', input: { teamName: '二队', members: '甲,乙', timeText: '2:03.5' } } });
eq('加成绩 ok', r.data?.addEventResult?.ok, true);
eq('用时解析 2:03.5 -> 123500ms', A.tables.results.find((x) => String(x.id) === String(r.data?.addEventResult?.id))?.time_ms, 123500);
r = await gql(addRes, { user: ADMIN, variables: { id: '105', input: { teamName: '二队', timeText: 'abc' } } });
eq('坏用时 -> resultTimeInvalid', r.data?.addEventResult?.errorCode, 'resultTimeInvalid');
r = await gql(addRes, { user: ADMIN, variables: { id: '105', input: { teamName: ' ', timeText: '1:00' } } });
eq('空队名 -> resultTeamRequired', r.data?.addEventResult?.errorCode, 'resultTeamRequired');
r = await gql(`{ viewer { guildAdmin(slug: "admintest") { ... on GuildAdmin { events { id results { teamName timeMs timeText } } } } } }`, { user: ADMIN });
const ev105 = r.data?.viewer?.guildAdmin?.events?.find((e) => e.id === '105');
eq('成绩列表按用时升序', JSON.stringify(ev105?.results?.map((x) => x.timeMs)), '[83456,123500]');
eq('timeText 格式化', ev105?.results?.[0]?.timeText, '01:23.456');
const newResId = r.data ? A.tables.results.find((x) => x.team_name === '二队')?.id : null;
r = await gql(`mutation($rid: ID!) { deleteEventResult(slug: "admintest", resultId: $rid) { ok errorCode } }`,
  { user: ADMIN, variables: { rid: String(newResId) } });
eq('删成绩 ok', r.data?.deleteEventResult?.ok, true);
r = await gql(`mutation($id: ID!) { deleteAdminEvent(slug: "admintest", eventId: $id) { ok } }`,
  { user: ADMIN, variables: { id: newEvId } });
eq('删车 ok', r.data?.deleteAdminEvent?.ok, true);
eq('车已删', A.tables.events.some((e) => String(e.id) === String(newEvId)), false);

/* ---------------- school guides ---------------- */
const guideMut = `mutation($input: UpdateSchoolGuideInput!) { updateSchoolGuide(slug: "admintest", input: $input) { ok errorCode } }`;
r = await gql(guideMut, { user: ADMIN, variables: { input: { school: '裂石·钧', build: '爆发流', attr: '力量 200', rate: '50%', bisJson: '{"b":2}', rotationJson: '{"r":1}' } } });
eq('攻略 upsert ok', r.data?.updateSchoolGuide?.ok, true);
r = await gql(`{ viewer { guildAdmin(slug: "admintest") { ... on GuildAdmin { schoolGuides { schools { school builds { build bisJson } rotationJson } } } } } }`, { user: ADMIN });
const lg = r.data?.viewer?.guildAdmin?.schoolGuides?.schools?.find((x) => x.school === '裂石·钧');
eq('攻略读回 build', lg?.builds?.[0]?.build, '爆发流');
eq('攻略读回 rotation', lg?.rotationJson, '{"r":1}');
r = await gql(guideMut, { user: ADMIN, variables: { input: { school: '', build: 'x' } } });
eq('缺流派 -> schoolRequired', r.data?.updateSchoolGuide?.errorCode, 'schoolRequired');

/* ---------------- OG card channel ---------------- */
const ogQ = `query($f: Int!, $t: Int!) { ogGuildCard(slug: "admintest") { exists name slogan weekActivityCount(fromUtc: $f, toUtc: $t) } }`;
r = await gql(ogQ, { user: null, variables: { f: WEEK_FROM, t: WEEK_TO } });
eq('OG 百业卡 exists (匿名, 已绑定)', r.data?.ogGuildCard?.exists, true);
eq('OG 百业卡 name (资料已改名后)', r.data?.ogGuildCard?.name, '新名字');
eq('OG 本周双十车数 (仅 activity 且未完成/草稿, 窗口内)', r.data?.ogGuildCard?.weekActivityCount, 1);
r = await gql(ogQ.replaceAll('admintest', 'devtest'), { user: null, variables: { f: WEEK_FROM, t: WEEK_TO } });
eq('OG dev_only 百业 -> exists=false', r.data?.ogGuildCard?.exists, false);
r = await gql(`{ ogCarCard(slug: "admintest", id: "101") { title type startsAtUtc dungeonName occupiedCount maxSlots status } }`, { user: null });
eq('OG 车卡 title', r.data?.ogCarCard?.title, '周六双十');
eq('OG 车卡 occupiedCount', r.data?.ogCarCard?.occupiedCount, 1); // signup 31 removed above
eq('OG 车卡 maxSlots', r.data?.ogCarCard?.maxSlots, 10);
r = await gql(`{ ogCarCard(slug: "admintest", id: "99999") { title } }`, { user: null });
eq('OG 车卡不存在 -> null', r.data?.ogCarCard, null);

/* ---------------- omniscient all-accessible (ruling 2026-10-26) ----------------
 * The system-path OmniscientViewer (flag on the VC, no signed-in
 * user) passes the admin verdict in full: read payload field-for-
 * field what a server admin sees, mutations included, dev_only gate
 * included. The security boundary is construction-side: the flag
 * lives on the VC, never on the user snapshot — a user object
 * carrying a forged flag grants nothing, because the assembly edge
 * derives the VC from the snapshot (viewerContextOf) and drops it. */
const OMNI = { user: null, vc: OMNISCIENT_VIEWER };
r = await gql(adminQ, { user: ADMIN });
const adminView = r.data?.viewer?.guildAdmin;
r = await gql(adminQ, OMNI);
eq('omni -> GuildAdmin', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdmin');
check('omni 载荷与管理员逐字段一致', JSON.stringify(r.data?.viewer?.guildAdmin) === JSON.stringify(adminView),
  JSON.stringify(r.data?.viewer?.guildAdmin));
const omniContentQ = `{ viewer { guildAdmin(slug: "admintest") { ... on GuildAdmin { events { id title signupCount signups { id nickname } signupsCsv } schoolGuides { schools { school builds { build bisJson } rotationJson } } } } } }`;
r = await gql(omniContentQ, { user: ADMIN });
const adminContent = r.data?.viewer?.guildAdmin;
r = await gql(omniContentQ, OMNI);
check('omni 五面板内容与管理员一致', JSON.stringify(r.data?.viewer?.guildAdmin) === JSON.stringify(adminContent));
r = await gql(adminQ.replaceAll('admintest', 'unbound'), OMNI);
eq('omni 未绑定百业 -> GuildAdmin', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdmin');
r = await gql(adminQ.replaceAll('admintest', 'devtest'), OMNI);
eq('omni dev_only 百业 -> GuildAdmin (全通口径)', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdmin');
const FORGED = { ...MEMBER, omniscient: true };
r = await gql(adminQ, { user: FORGED });
eq('user 快照伪造 omniscient 标记 -> Locked (边界在构造侧)', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
r = await gql(profMut, { user: FORGED, variables: { input: { name: '伪造改名' } } });
eq('user 快照伪造标记改资料 -> adminOnly', r.data?.updateGuildProfile?.errorCode, 'adminOnly');
r = await gql(profMut, { ...OMNI, variables: { input: { slogan: 'omni标语' } } });
eq('omni 改标语 ok', r.data?.updateGuildProfile?.ok, true);
eq('omni 标语已落库', A.tables.tenants[0].slogan, 'omni标语');
r = await gql(adminQ, OMNI);
eq('omni 回读标语一致', r.data?.viewer?.guildAdmin?.slogan, 'omni标语');
r = await gql(discordMut, { ...OMNI, variables: { input: { webhook: HOOK } } });
eq('omni 改 webhook ok', r.data?.updateGuildDiscord?.ok, true);
r = await gql(adminQ, OMNI);
eq('omni webhook 回读 set', r.data?.viewer?.guildAdmin?.reminderWebhookSet, true);
eq('omni webhook 回读只露编号', r.data?.viewer?.guildAdmin?.reminderWebhookId, '123456789012345678');
check('omni webhook 响应不含密钥段', !JSON.stringify(r).includes('abcdef-XYZ_123'));
r = await gql(setAv, { ...OMNI, variables: { d: pngB64 } });
eq('omni 设头像 ok', r.data?.setGuildAvatar?.ok, true);
eq('omni 头像已落库', A.tables.avatars.has('admintest'), true);

/* ---------------- grouping manage verdict (ruling 2026-10-26) ----------------
 * Guild admins manage EVERY grouping in their own guild with the
 * leader's rights; the verdict is per-guild, resolved against the
 * grouping's own guild — an admin of another guild gains nothing
 * here, even as a plain member of this guild. Separate FakeDB so the
 * admin-surface fixtures above stay untouched. */
const DGID2 = '555555555555555555';
const B = makeDb({
  tenants: [
    tenantRow(),
    tenantRow({ slug: 'othertest', guild_name: '他业测试' }),
  ],
  settings: [
    ['admintest|discord_guild_id', DGID],
    ['othertest|discord_guild_id', DGID2],
    ['|game_version', 'intl-v2.3'],
  ],
  users: [
    ['UA', serversJson([{ id: DGID, name: '测试服', icon: '', permissions: '0', owner: true }])],
    ['UM', serversJson([{ id: DGID, name: '测试服', icon: '', permissions: '32', owner: false }])],
    ['UB', serversJson([{ id: DGID, name: '测试服', icon: '', permissions: '0', owner: false }])],
    ['UL', serversJson([{ id: DGID, name: '测试服', icon: '', permissions: '0', owner: false }])],
    ['UC', serversJson([
      { id: DGID, name: '测试服', icon: '', permissions: '0', owner: false },
      { id: DGID2, name: '他服', icon: '', permissions: '0', owner: true },
    ])],
    ['UO', serversJson([{ id: DGID2, name: '他服', icon: '', permissions: '0', owner: true }])],
  ],
  events: [
    evRow(201, { title: '管理员全链车', creator_discord_id: 'UL', starts_at_utc: WEEK_FROM + 3600 }),
    evRow(202, { title: '拒绝矩阵车', creator_discord_id: 'UL', starts_at_utc: WEEK_FROM + 3600 }),
    evRow(203, { title: '无车头老车', creator_discord_id: null, starts_at_utc: WEEK_FROM + 3600 }),
    evRow(204, { title: '车头自己的车', creator_discord_id: 'UL', starts_at_utc: WEEK_FROM + 3600 }),
    evRow(205, { title: '车头解散车', creator_discord_id: 'UL', starts_at_utc: WEEK_FROM + 3600 }),
    evRow(206, { tenant: 'othertest', title: '他业的车', creator_discord_id: 'UL', starts_at_utc: WEEK_FROM + 3600 }),
  ],
  signups: [
    { id: 51, event_id: 201, nickname: '阿青', uid: '2001', role: '输出', weapon: '鸣金·虹', discord_id: 'UB' },
    { id: 52, event_id: 201, nickname: '阿红', uid: '2002', role: '输出', weapon: '破竹·樽', discord_id: null },
  ],
});
const envB = { DB: B.db };
async function gqlB(query, { user = null, variables, vc } = {}) {
  const ctx = { env: envB, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  if (vc) ctx.vc = vc;
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}
const B_ADMIN = { discordId: 'UA', name: '服主', guilds: [DGID] };
const B_MANAGER = { discordId: 'UM', name: '管理员', guilds: [DGID] };
const B_MEMBER = { discordId: 'UB', name: '成员', guilds: [DGID] };
const B_LEADER = { discordId: 'UL', name: '车头', guilds: [DGID] };
const B_CROSS = { discordId: 'UC', name: '双业成员', guilds: [DGID, DGID2] };
const B_OTHER = { discordId: 'UO', name: '他业服主', guilds: [DGID2] };
const evB = (id) => B.tables.events.find((e) => e.id === id);

/* composition: manage actions exist only for leader / guild admin */
const detailQ2 = `query($slug: String, $id: ID!) {
  groupingDetailPage(slug: $slug, id: $id) {
    detailEditLabel
    manageActions { editLabel disbandLabel }
    blocks(blocksVersion: 4) { __typename ... on ActionButtonBlock { action { __typename } } }
  }
}`;
const actionTypes = (blocks) => (blocks || [])
  .filter((b) => b.__typename === 'ActionButtonBlock').map((b) => b.action?.__typename);
let r2 = await gqlB(detailQ2, { user: B_MANAGER, variables: { slug: 'admintest', id: '201' } });
check('管理员详情: manageActions 在场', !!r2.data?.groupingDetailPage?.manageActions, JSON.stringify(r2.errors || r2.data).slice(0, 200));
eq('管理员详情: manageActions.editLabel 与页内文案同源', r2.data?.groupingDetailPage?.manageActions?.editLabel, r2.data?.groupingDetailPage?.detailEditLabel);
check('管理员详情: 积木含 Edit/Complete/Disband 动作',
  ['EditAction', 'CompleteAction', 'DisbandAction'].every((t) => actionTypes(r2.data?.groupingDetailPage?.blocks).includes(t)),
  JSON.stringify(actionTypes(r2.data?.groupingDetailPage?.blocks)));
r2 = await gqlB(detailQ2, { user: B_MEMBER, variables: { slug: 'admintest', id: '201' } });
eq('成员详情: manageActions 为 null', r2.data?.groupingDetailPage?.manageActions, null);
check('成员详情: 积木无管理动作', actionTypes(r2.data?.groupingDetailPage?.blocks).length === 0,
  JSON.stringify(actionTypes(r2.data?.groupingDetailPage?.blocks)));
r2 = await gqlB(detailQ2, { user: B_LEADER, variables: { slug: 'admintest', id: '204' } });
check('车头详情: manageActions 在场', !!r2.data?.groupingDetailPage?.manageActions);

const updMut2 = `mutation($id: ID!, $input: UpdateGroupingInput!) { updateGrouping(id: $id, input: $input) { ok errorCode grouping { id title status } } }`;
const disbMut2 = `mutation($id: ID!) { disbandGrouping(id: $id) { ok errorCode } }`;
const compMut2 = `mutation($id: ID!) { completeGrouping(id: $id) { ok errorCode grouping { id status } } }`;
const reopenMut2 = `mutation($id: ID!) { reopenGrouping(id: $id) { ok errorCode grouping { id status } } }`;

/* admin chain: edit -> complete -> reopen -> disband on another's car */
r2 = await gqlB(updMut2, { user: B_MANAGER, variables: { id: '201', input: { title: '管理员改名车' } } });
eq('管理员编辑他人车 ok', r2.data?.updateGrouping?.ok, true, JSON.stringify(r2.data || r2.errors).slice(0, 200));
eq('管理员编辑已落库', evB(201)?.title, '管理员改名车');
r2 = await gqlB(compMut2, { user: B_MANAGER, variables: { id: '201' } });
eq('管理员完成他人车 ok', r2.data?.completeGrouping?.ok, true);
eq('管理员完成已落库', evB(201)?.status, 'completed');
r2 = await gqlB(reopenMut2, { user: B_MANAGER, variables: { id: '201' } });
eq('管理员恢复他人车 ok', r2.data?.reopenGrouping?.ok, true);
eq('管理员恢复已落库', evB(201)?.status, 'open');
r2 = await gqlB(disbMut2, { user: B_MANAGER, variables: { id: '201' } });
eq('管理员解散他人车 ok', r2.data?.disbandGrouping?.ok, true);
eq('管理员解散已落库 (车消失)', evB(201), undefined);
eq('解散级联清座位', B.tables.signups.filter((x) => x.event_id === 201).length, 0);

/* plain member: everything denied, state untouched */
r2 = await gqlB(updMut2, { user: B_MEMBER, variables: { id: '202', input: { title: '成员改名' } } });
eq('成员编辑他人车被拒', r2.data?.updateGrouping?.ok, false);
eq('成员编辑错误码', r2.data?.updateGrouping?.errorCode, 'leaderOnlyEdit');
r2 = await gqlB(compMut2, { user: B_MEMBER, variables: { id: '202' } });
eq('成员完成他人车被拒', r2.data?.completeGrouping?.ok, false);
eq('成员完成错误码', r2.data?.completeGrouping?.errorCode, 'leaderOnlyComplete');
r2 = await gqlB(disbMut2, { user: B_MEMBER, variables: { id: '202' } });
eq('成员解散他人车被拒', r2.data?.disbandGrouping?.ok, false);
eq('成员解散错误码', r2.data?.disbandGrouping?.errorCode, 'leaderOnlyDisband');
eq('拒绝后车名未改', evB(202)?.title, '拒绝矩阵车');
eq('拒绝后状态仍 open', evB(202)?.status, 'open');

/* cross-guild admin: member here + admin elsewhere still denied */
r2 = await gqlB(updMut2, { user: B_CROSS, variables: { id: '202', input: { title: '串权改名' } } });
eq('他业管理员编辑本业车被拒', r2.data?.updateGrouping?.ok, false);
eq('他业管理员编辑错误码 (按本业判定)', r2.data?.updateGrouping?.errorCode, 'leaderOnlyEdit');
r2 = await gqlB(compMut2, { user: B_CROSS, variables: { id: '202' } });
eq('他业管理员完成本业车被拒', r2.data?.completeGrouping?.errorCode, 'leaderOnlyComplete');
r2 = await gqlB(disbMut2, { user: B_CROSS, variables: { id: '202' } });
eq('他业管理员解散本业车被拒', r2.data?.disbandGrouping?.errorCode, 'leaderOnlyDisband');
r2 = await gqlB(updMut2, { user: B_OTHER, variables: { id: '202', input: { title: '外人改名' } } });
eq('非本业成员编辑被拒', r2.data?.updateGrouping?.ok, false);
eq('非本业成员错误码 (写闸)', r2.data?.updateGrouping?.errorCode, 'memberOnly');

/* leaderless legacy car: admin channel = the guild admin now */
r2 = await gqlB(compMut2, { user: B_MEMBER, variables: { id: '203' } });
eq('成员完成无车头车被拒', r2.data?.completeGrouping?.errorCode, 'noCreatorRecordedComplete');
r2 = await gqlB(updMut2, { user: B_MANAGER, variables: { id: '203', input: { title: '管理员接管老车' } } });
eq('管理员编辑无车头车 ok', r2.data?.updateGrouping?.ok, true);
r2 = await gqlB(disbMut2, { user: B_ADMIN, variables: { id: '203' } });
eq('服主解散无车头车 ok', r2.data?.disbandGrouping?.ok, true);
eq('无车头车解散已落库', evB(203), undefined);

/* leader path: unchanged */
r2 = await gqlB(updMut2, { user: B_LEADER, variables: { id: '204', input: { title: '车头改名车' } } });
eq('车头编辑自己的车 ok', r2.data?.updateGrouping?.ok, true);
r2 = await gqlB(compMut2, { user: B_LEADER, variables: { id: '204' } });
eq('车头完成自己的车 ok', r2.data?.completeGrouping?.ok, true);
r2 = await gqlB(reopenMut2, { user: B_LEADER, variables: { id: '204' } });
eq('车头恢复自己的车 ok', r2.data?.reopenGrouping?.ok, true);
r2 = await gqlB(disbMut2, { user: B_LEADER, variables: { id: '205' } });
eq('车头解散自己的车 ok', r2.data?.disbandGrouping?.ok, true);
eq('车头解散已落库', evB(205), undefined);

/* the cross admin DOES manage cars in the guild they administer */
r2 = await gqlB(updMut2, { user: B_CROSS, variables: { id: '206', input: { title: '本业管理员改名' } } });
eq('他业管理员管自己百业的车 ok', r2.data?.updateGrouping?.ok, true, JSON.stringify(r2.data || r2.errors).slice(0, 200));
eq('他业车辆已落库', evB(206)?.title, '本业管理员改名');

/* omni: passes the manage gate in full (all-accessible doctrine) */
const OMNI2 = { user: null, vc: OMNISCIENT_VIEWER };
r2 = await gqlB(compMut2, { ...OMNI2, variables: { id: '202' } });
eq('omni 完成他人车 ok', r2.data?.completeGrouping?.ok, true, JSON.stringify(r2.data || r2.errors).slice(0, 200));
r2 = await gqlB(reopenMut2, { ...OMNI2, variables: { id: '202' } });
eq('omni 恢复他人车 ok', r2.data?.reopenGrouping?.ok, true);
eq('omni 操作后状态 open', evB(202)?.status, 'open');

check('B 库无未路由 SQL', B.unknownSql.size === 0, [...B.unknownSql].join(' | '));

/* ---------------- admin stats (Premium tier 1: attendance/activity) ----------------
 * Hand-computed fixture: cars are placed by weekWindowUtc offsets, so
 * the expected values below are fixed by construction, not derived
 * from the implementation.
 * Window layout (W0 = current week ... W3 = three weeks ago):
 *   W0: 201 activity open 10 slots (seats U1,U2,U3-proxy), 202 talent
 *       completed 5 slots (seats U1,U4), 203 race DRAFT (seat U1 —
 *       excluded everywhere), 204 tower open 10 slots creator=null
 *       (no seats), 205 activity timeless (excluded, no week)
 *   W1: 206 activity closed 10 slots (seats U1,U2 + one unstamped),
 *       207 race open 20 slots creator U3 (no seats)
 *   W2: (nothing)
 *   W3: 208 talent completed 5 slots creator U2 (seat U3)
 * Boards total the 4-week span; ties break by display name. */
const [SW0] = weekWindowUtc(0);
const [SW1] = weekWindowUtc(-1);
const [SW2] = weekWindowUtc(-2);
const [SW3] = weekWindowUtc(-3);
function seatRow(id, eventId, nickname, discordId) {
  return {
    id, event_id: eventId, nickname, uid: 'u' + id, role: '输出', weapon: '鸣金·虹',
    contact: '', note: '', team_name: '', members: '', created_at: '2026-01-02 03:04:05', discord_id: discordId,
  };
}
const S = makeDb({
  tenants: [
    tenantRow({ slug: 'statsguild', guild_name: '统计测试百业' }),
    tenantRow({ slug: 'emptyguild', guild_name: '空百业' }),
  ],
  settings: [
    ['statsguild|discord_guild_id', DGID],
    ['emptyguild|discord_guild_id', DGID],
    ['|game_version', 'intl-v2.3'],
  ],
  users: [
    ['UA', serversJson([{ id: DGID, name: '测试服', icon: '', permissions: '0', owner: true }])],
    ['UB', serversJson([{ id: DGID, name: '测试服', icon: '', permissions: '0', owner: false }])],
  ],
  events: [
    evRow(201, { tenant: 'statsguild', type: 'activity', status: 'open', max_slots: 10, starts_at_utc: SW0 + 3600, creator_discord_id: 'U1' }),
    evRow(202, { tenant: 'statsguild', type: 'talent', status: 'completed', max_slots: 5, starts_at_utc: SW0 + 7200, creator_discord_id: 'U2' }),
    evRow(203, { tenant: 'statsguild', type: 'race', status: 'draft', max_slots: 10, starts_at_utc: SW0 + 8000, creator_discord_id: 'U1' }),
    evRow(204, { tenant: 'statsguild', type: 'tower', status: 'open', max_slots: 10, starts_at_utc: SW0 + 9000, creator_discord_id: null }),
    evRow(205, { tenant: 'statsguild', type: 'activity', status: 'open', max_slots: 10, starts_at_utc: null, creator_discord_id: 'U1' }),
    evRow(206, { tenant: 'statsguild', type: 'activity', status: 'closed', max_slots: 10, starts_at_utc: SW1 + 3600, creator_discord_id: 'U1' }),
    evRow(207, { tenant: 'statsguild', type: 'race', status: 'open', max_slots: 20, starts_at_utc: SW1 + 4000, creator_discord_id: 'U3' }),
    evRow(208, { tenant: 'statsguild', type: 'talent', status: 'completed', max_slots: 5, starts_at_utc: SW3 + 100, creator_discord_id: 'U2' }),
  ],
  signups: [
    seatRow(301, 201, '阿青', 'U1'),
    seatRow(302, 201, 'Bob', 'U2'),
    seatRow(303, 201, '小三', 'U3'), // proxy seat: the stamp is the proxied member
    seatRow(304, 202, '阿青', 'U1'),
    seatRow(305, 202, '野人', 'U4'),
    seatRow(306, 203, '阿青', 'U1'), // draft car seat — must never count
    seatRow(307, 206, '阿青', 'U1'),
    seatRow(308, 206, 'Bob', 'U2'),
    seatRow(309, 206, '路人甲', null), // unstamped: fills a seat, earns no participation
    seatRow(310, 208, '小三', 'U3'),
  ],
  guildMembers: [
    { tenant: 'statsguild', discord_id: 'U1', nick: '阿青', global_name: 'Alice' },
    { tenant: 'statsguild', discord_id: 'U2', nick: '', global_name: 'Bob' },
    { tenant: 'statsguild', discord_id: 'U3', nick: '小三', global_name: '' },
  ],
});
const envS = { DB: S.db };
async function gqlS(query, { user = null, variables, vc } = {}) {
  const ctx = { env: envS, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  if (vc) ctx.vc = vc;
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}
const statsQ = `{ viewer { guildAdmin(slug: "statsguild") { __typename ... on GuildAdmin {
  adminTabStatsLabel adminStatsTitle adminStatsMembersTitle adminStatsLeadersTitle adminStatsEmptyText adminStatsBoardEmptyText
  stats { ... on GuildAdminStats { weeks { weekStartUtc weekLabel isCurrent carsActivity carsTalent carsRace carsTower carsTotal completedCount totalSeats filledSeats fillRate participantCount participationCount perCapita }
          memberLeaders { discordId displayName seatCount }
          leaderLeaders { discordId displayName carCount } } }
} } } }`;
const weekNums = (w) => ({
  carsActivity: w.carsActivity, carsTalent: w.carsTalent, carsRace: w.carsRace, carsTower: w.carsTower,
  carsTotal: w.carsTotal, completedCount: w.completedCount, totalSeats: w.totalSeats, filledSeats: w.filledSeats,
  fillRate: w.fillRate, participantCount: w.participantCount, participationCount: w.participationCount, perCapita: w.perCapita,
});
r = await gqlS(statsQ, { user: ADMIN });
const ga = r.data?.viewer?.guildAdmin;
eq('统计: 管理员 -> GuildAdmin', ga?.__typename, 'GuildAdmin');
eq('统计 W0 (本周)', JSON.stringify(weekNums(ga?.stats?.weeks?.[0] || {})),
  JSON.stringify({ carsActivity: 1, carsTalent: 1, carsRace: 0, carsTower: 1, carsTotal: 3, completedCount: 1, totalSeats: 25, filledSeats: 5, fillRate: 0.2, participantCount: 4, participationCount: 5, perCapita: 1.25 }));
eq('统计 W1', JSON.stringify(weekNums(ga?.stats?.weeks?.[1] || {})),
  JSON.stringify({ carsActivity: 1, carsTalent: 0, carsRace: 1, carsTower: 0, carsTotal: 2, completedCount: 0, totalSeats: 30, filledSeats: 3, fillRate: 0.1, participantCount: 2, participationCount: 2, perCapita: 1 }));
eq('统计 W2 (全零)', JSON.stringify(weekNums(ga?.stats?.weeks?.[2] || {})),
  JSON.stringify({ carsActivity: 0, carsTalent: 0, carsRace: 0, carsTower: 0, carsTotal: 0, completedCount: 0, totalSeats: 0, filledSeats: 0, fillRate: 0, participantCount: 0, participationCount: 0, perCapita: 0 }));
eq('统计 W3', JSON.stringify(weekNums(ga?.stats?.weeks?.[3] || {})),
  JSON.stringify({ carsActivity: 0, carsTalent: 1, carsRace: 0, carsTower: 0, carsTotal: 1, completedCount: 1, totalSeats: 5, filledSeats: 1, fillRate: 0.2, participantCount: 1, participationCount: 1, perCapita: 1 }));
eq('统计 周起始序列', JSON.stringify(ga?.stats?.weeks?.map((w) => w.weekStartUtc)), JSON.stringify([SW0, SW1, SW2, SW3]));
eq('统计 isCurrent 序列', JSON.stringify(ga?.stats?.weeks?.map((w) => w.isCurrent)), '[true,false,false,false]');
check('统计 weekLabel 为区间文案', typeof ga?.stats?.weeks?.[0]?.weekLabel === 'string' && ga.stats.weeks[0].weekLabel.includes('–'));
eq('统计 成员参与榜', JSON.stringify(ga?.stats?.memberLeaders),
  JSON.stringify([
    { discordId: 'U1', displayName: '阿青', seatCount: 3 },
    { discordId: 'U2', displayName: 'Bob', seatCount: 2 },
    { discordId: 'U3', displayName: '小三', seatCount: 2 },
    { discordId: 'U4', displayName: '野人', seatCount: 1 },
  ]));
eq('统计 车头榜', JSON.stringify(ga?.stats?.leaderLeaders),
  JSON.stringify([
    { discordId: 'U2', displayName: 'Bob', carCount: 2 },
    { discordId: 'U1', displayName: '阿青', carCount: 2 },
    { discordId: 'U3', displayName: '小三', carCount: 1 },
  ]));
eq('统计 文案 tabStats', ga?.adminTabStatsLabel, '统计');
eq('统计 文案 statsTitle', ga?.adminStatsTitle, '出勤与活跃');
eq('统计 文案 membersTitle', ga?.adminStatsMembersTitle, '成员参与榜 · 近 4 周');
eq('统计 文案 leadersTitle', ga?.adminStatsLeadersTitle, '车头榜 · 近 4 周');
r = await gqlS(statsQ.replaceAll('statsguild', 'emptyguild'), { user: ADMIN });
eq('空百业 周序列全零', JSON.stringify(r.data?.viewer?.guildAdmin?.stats?.weeks?.map((w) => w.carsTotal)), '[0,0,0,0]');
eq('空百业 成员榜为空', JSON.stringify(r.data?.viewer?.guildAdmin?.stats?.memberLeaders), '[]');
eq('空百业 车头榜为空', JSON.stringify(r.data?.viewer?.guildAdmin?.stats?.leaderLeaders), '[]');
eq('空百业 空态文案', r.data?.viewer?.guildAdmin?.adminStatsEmptyText, '近 4 周暂无组队数据。');
eq('空百业 榜单空态文案', r.data?.viewer?.guildAdmin?.adminStatsBoardEmptyText, '暂无记录。');
r = await gqlS(`{ viewer { guildAdmin(slug: "statsguild") { ... on GuildAdminLocked { stats { weeks { carsTotal } } } } } }`, { user: MEMBER });
check('统计: Locked 类型查 stats -> schema 校验错误', Array.isArray(r.errors) && r.errors.length > 0);
r = await gqlS(statsQ, { user: null });
eq('统计: 匿名 -> GuildAdminLocked', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
r = await gqlS(statsQ, { user: null, vc: OMNISCIENT_VIEWER });
check('统计: omni 与管理员一致', JSON.stringify(r.data?.viewer?.guildAdmin?.stats) === JSON.stringify(ga?.stats));
check('统计: 无未路由 SQL', S.unknownSql.size === 0, [...S.unknownSql].join(' | '));

check('无未路由 SQL', A.unknownSql.size === 0, [...A.unknownSql].join(' | '));

console.log(`\nGUILDADMIN pass=${pass} fail=${fail}`);
if (fails.length) { console.log('FAILS:\n' + fails.join('\n')); process.exit(1); }
