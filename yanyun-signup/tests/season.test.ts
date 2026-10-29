// Season surface acceptance (F23 checklist + F25 roster OCR import):
// (1) the checklist is composed by the backend from live season data
// (current-version dungeons + season table, per-guild templates,
// school guides, roster counts) and hangs off GuildAdmin only
// (Locked resolves neither field); (2) check state flows
// check -> read back -> uncheck, is isolated per guild AND per
// season (a version roll resets it), and rejects unknown item keys
// and non-admin writers; (3) the roster import preview classifies
// client-OCR'd lines as matched / new / unrecognized against the
// Discord roster and the existing game-name roster, dedupes inside
// the batch, and lands NOTHING before confirmation; (4) confirm
// writes only the selected NEW rows into guild_roster_entries,
// closes the batch (double-confirm refused), is tenant-scoped, and
// NEVER touches guild_members / users; (5) preview metering reuses
// the gear batch-OCR limits + the gear_ocr_batches daily counter
// (single-batch size first, then the daily cap), and empty previews
// are not metered. Real yoga + real resolvers + a FakeDB that
// routes by SQL shape into real in-memory tables.
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { usageDayKey } from '../src/domains/platform/limits.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* Convert FakeDB object rows into the values-mode arrays the Drizzle
   D1 driver returns (same helper shape as the guildadmin suite). */
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

/* Typed-ID fixture keys: guilds/users carry their 0036 primary keys;
   Discord-space values (server ids, roster ids) stay Discord IDs. */
const GID = { alpha: 1030100001, beta: 1030100002 };
const UID = { ADMIN_A: 2030100001, ADMIN_B: 2030100002, MEMBER_A: 2030100003 };
const UID_BY_DID = { 'admin-a': UID.ADMIN_A, 'admin-b': UID.ADMIN_B, 'member-a': UID.MEMBER_A };

/* ---------------- FakeDB ---------------- */
function makeDb(fx = {}) {
  const tables = {
    tenants: (fx.tenants || []).map((t) => ({ ...t })),
    settings: new Map(fx.settings || []),
    users: (fx.users || []).map(([did, gj]) => ({ id: UID_BY_DID[did] || 0, discord_id: did, username: '', guilds_json: gj })),
    mint: new Map(),
    dungeons: (fx.dungeons || []).map((d) => ({ ...d })),
    templates: (fx.templates || []).map((t) => ({ ...t })),
    schoolBis: (fx.schoolBis || []).map((r) => ({ ...r })),
    schoolRotations: (fx.schoolRotations || []).map((r) => ({ ...r })),
    guildMembers: (fx.guildMembers || []).map((m) => ({ ...m })),
    checks: [],            // season_checklist_checks rows
    rosterEntries: [],     // guild_roster_entries rows
    importBatches: [],     // roster_import_batches rows
    importRows: [],        // roster_import_rows rows
    usage: new Map(),      // `${did}|${metric}|${day}` -> count
  };
  let nextId = 9000;
  const unknownSql = new Set();
  const norm = (sql) => sql.replace(/"/g, '')
    .replace(/\b(tenants|settings|users|dungeons|grouping_templates|school_bis|school_rotations|guild_members|season_checklist_checks|guild_roster_entries|roster_import_batches|roster_import_rows|usage_counters|guild_entitlements|guild_avatars)\./g, '')
    .replace(/\s+/g, ' ');
  function parseCols(list) { return list.split(',').map((c) => c.trim().split('.').pop()); }

  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    if (/^INSERT INTO id_mint_counters/i.test(sql)) {
      const key = `${b[0]}|${b[1]}`;
      const seq = (tables.mint.get(key) || 0) + 1;
      tables.mint.set(key, seq);
      return kind === 'first' ? { seq } : (kind === 'all' ? { results: [{ seq }] } : { meta: { changes: 1 } });
    }
    if (/\b(CREATE TABLE|ALTER TABLE|PRAGMA)\b/i.test(sql)) return kind === 'run' ? { meta: { changes: 0 } } : (kind === 'first' ? null : { results: [] });
    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });

    /* ---- writes ---- */
    // VALUES / SET expressions mix binds (?) with inline literals
    // ('pending', NULL, ...): only ? tokens consume binds, in order.
    const exprValue = (expr, state) => {
      const e = expr.trim();
      if (e === '?') return b[state.i++];
      if (/^'.*'$/.test(e)) return e.slice(1, -1);
      if (/^NULL$/i.test(e)) return null;
      if (/^-?\d+$/.test(e)) return Number(e);
      return e;
    };
    let m = /^INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)/i.exec(sql);
    if (m) {
      const [, table, colList, valList] = m;
      const cols = parseCols(colList);
      const exprs = valList.split(',').map((x) => x.trim());
      const row = {};
      const state = { i: 0 };
      cols.forEach((c, i) => { row[c] = exprValue(exprs[i] ?? '?', state); });
      if (table === 'season_checklist_checks') {
        const ex = tables.checks.find((r) => r.tenant === row.tenant && r.season_key === row.season_key && r.item_key === row.item_key);
        if (ex) Object.assign(ex, row); else tables.checks.push(row);
        return { meta: { changes: 1 } };
      }
      if (table === 'usage_counters') {
        // binds: [did, metric, day, by, now, by, now]
        const key = `${b[0]}|${b[1]}|${b[2]}`;
        tables.usage.set(key, (tables.usage.get(key) || 0) + Number(b[5] ?? b[3] ?? 1));
        return { meta: { changes: 1 } };
      }
      if (row.id === undefined) row.id = nextId++;
      if (table === 'users') { if (!tables.users.some((u) => u.discord_id === row.discord_id)) tables.users.push(row); }
      else if (table === 'guild_roster_entries') tables.rosterEntries.push(row);
      else if (table === 'roster_import_batches') tables.importBatches.push(row);
      else if (table === 'roster_import_rows') tables.importRows.push(row);
      else if (table === 'settings') tables.settings.set(`${row.tenant}|${row.key}`, row.value);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    m = /^UPDATE (\w+) SET (.+?) WHERE (.+)$/i.exec(sql);
    if (m) {
      const [, table, setList] = m;
      const setParts = setList.split(',').map((p) => p.trim());
      const sets = {};
      const state = { i: 0 };
      for (const part of setParts) {
        const eqIdx = part.indexOf('=');
        const c = part.slice(0, eqIdx).trim().split('.').pop();
        sets[c] = exprValue(part.slice(eqIdx + 1), state);
      }
      const wb = b.slice(state.i);
      let rows = [];
      if (table === 'roster_import_rows') rows = tables.importRows.filter((r) => r.id === Number(wb[0]));
      else if (table === 'roster_import_batches') rows = tables.importBatches.filter((r) => r.id === Number(wb[0]));
      for (const r of rows) Object.assign(r, sets);
      return { meta: { changes: rows.length } };
    }
    if (/^DELETE FROM guild_roster_entries/i.test(sql)) {
      const before = tables.rosterEntries.length;
      tables.rosterEntries = tables.rosterEntries.filter((r) => !(r.id === Number(b[0]) && r.tenant === b[1]));
      return { meta: { changes: before - tables.rosterEntries.length } };
    }

    /* ---- reads ---- */
    if (/FROM guild_entitlements/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/FROM tenants WHERE slug/i.test(sql)) return first(tables.tenants.find((t) => t.slug === b[0]));
    if (/FROM tenants/i.test(sql) && /id = \?/i.test(sql)) return first(tables.tenants.find((t) => t.id === Number(b[0])));
    if (/FROM tenants/i.test(sql)) return kind === 'first' ? (tables.tenants[0] ?? null) : all(tables.tenants);
    if (/FROM settings/i.test(sql) && /tenant = 0/i.test(sql)) {
      const v = tables.settings.get(`0|${b[0]}`);
      return first(v === undefined ? null : { value: v });
    }
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
      const u = tables.users.find((x) => x.id === Number(b[0])) || tables.users.find((x) => x.discord_id === String(b[0]));
      return first(u === undefined ? null : { guilds_json: u.guilds_json });
    }
    if (/FROM users/i.test(sql)) {
      if (/discord_id IN/i.test(sql)) {
        const rows = tables.users.filter((x) => b.map(String).includes(x.discord_id));
        return kind === 'first' ? (rows[0] ?? null) : all(rows);
      }
      if (/id IN/i.test(sql)) {
        const rows = tables.users.filter((x) => b.map(Number).includes(x.id));
        return kind === 'first' ? (rows[0] ?? null) : all(rows);
      }
      if (/discord_id = \?/i.test(sql)) return first(tables.users.find((x) => x.discord_id === String(b[0])));
      if (/id = \?/i.test(sql)) return first(tables.users.find((x) => x.id === Number(b[0])));
      return kind === 'first' ? (tables.users[0] ?? null) : all(tables.users);
    }
    if (/FROM guild_avatars/i.test(sql)) return first(null);
    if (/FROM dungeons/i.test(sql)) {
      const rows = [...tables.dungeons].sort((x, y) => (y.size - x.size) || (y.sort_order - x.sort_order) || (x.id - y.id));
      return all(rows);
    }
    if (/FROM grouping_templates/i.test(sql)) return all(tables.templates.filter((t) => t.tenant === b[0]));
    if (/FROM school_bis/i.test(sql)) return all(tables.schoolBis);
    if (/FROM school_rotations/i.test(sql)) return all(tables.schoolRotations);
    if (/FROM guild_members/i.test(sql)) {
      const rows = tables.guildMembers.filter((x) => x.tenant === b[0]);
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    if (/FROM season_checklist_checks/i.test(sql)) {
      return all(tables.checks.filter((r) => r.tenant === b[0] && r.season_key === b[1]));
    }
    if (/COUNT\(\*\) AS n FROM guild_roster_entries/i.test(sql)) {
      return first({ n: tables.rosterEntries.filter((r) => r.tenant === b[0]).length });
    }
    if (/FROM guild_roster_entries WHERE tenant = \? AND name_norm = \?/i.test(sql)) {
      return first(tables.rosterEntries.find((r) => r.tenant === b[0] && r.name_norm === b[1]) || null);
    }
    if (/FROM guild_roster_entries/i.test(sql)) {
      return all(tables.rosterEntries.filter((r) => r.tenant === b[0]).sort((x, y) => x.id - y.id));
    }
    if (/FROM roster_import_batches/i.test(sql)) {
      return first(tables.importBatches.find((r) => r.id === Number(b[0]) && r.tenant === b[1]) || null);
    }
    if (/FROM roster_import_rows/i.test(sql)) {
      return all(tables.importRows.filter((r) => r.batch_id === Number(b[0])).sort((x, y) => x.id - y.id));
    }
    if (/FROM usage_counters/i.test(sql)) {
      const v = tables.usage.get(`${b[0]}|${b[1]}|${b[2]}`);
      return all(v === undefined ? [] : [{ count: v }]);
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
const DGID_A = '555555555555555555';
const DGID_B = '777777777777777777';
const serversJson = (rows) => JSON.stringify(rows);
const ADMIN_A = { userId: UID.ADMIN_A, discordId: 'admin-a', name: '甲军官', guilds: [DGID_A] };
const ADMIN_B = { userId: UID.ADMIN_B, discordId: 'admin-b', name: '乙军官', guilds: [DGID_B] };
const MEMBER_A = { userId: UID.MEMBER_A, discordId: 'member-a', name: '甲成员', guilds: [DGID_A] };

function tenantRow(slug, name) {
  return {
    id: GID[slug], slug, guild_name: name, password_hash: 'x', announcement: '', slogan: '',
    master_name: '', logo_url: '', bg_image_url: '', discord_webhook: '', created_at: '2026-01-01 00:00:00',
  };
}
function dungeonRow(id, over = {}) {
  return {
    id, name: '副本' + id, size: 10, is_current: 0, sort_order: 0, video_url: '', video_title: '',
    season: 'S5', category: '传薪', level: 100, version: 'intl-v2.3', ...over,
  };
}

const A = makeDb({
  tenants: [tenantRow('alpha', '甲百业'), tenantRow('beta', '乙百业')],
  settings: [
    [`${GID.alpha}|discord_guild_id`, DGID_A],
    [`${GID.beta}|discord_guild_id`, DGID_B],
    ['0|game_version', '国际服 V2.3「青州」'],
    ['0|game_version_code', 'intl-v2.3'],
  ],
  users: [
    ['admin-a', serversJson([{ id: DGID_A, name: '甲服', icon: '', permissions: '8', owner: false }])],
    ['admin-b', serversJson([{ id: DGID_B, name: '乙服', icon: '', permissions: '8', owner: false }])],
    ['member-a', serversJson([{ id: DGID_A, name: '甲服', icon: '', permissions: '0', owner: false }])],
  ],
  dungeons: [
    dungeonRow(1), dungeonRow(2), dungeonRow(3, { season: 'S4', category: '铸矩', level: 96 }),
    dungeonRow(4, { version: 'intl-v2.2', season: 'S4' }), dungeonRow(5, { version: 'intl-v2.2', season: 'S4' }),
  ],
  templates: [
    { id: 11, tenant: GID.alpha }, { id: 12, tenant: GID.alpha }, { id: 13, tenant: GID.beta },
  ],
  schoolBis: [{ school: '鸣金·虹', build: 'a' }, { school: '牵丝·玉', build: 'a' }, { school: '裂石·威', build: 'a' }],
  schoolRotations: [{ school: '鸣金·虹' }, { school: '牵丝·玉' }],
  guildMembers: [
    { tenant: GID.alpha, discord_id: 'd-aqing', nick: '阿青', global_name: 'Aq' },
    { tenant: GID.alpha, discord_id: 'd-laomo', nick: '', global_name: '老墨' },
    { tenant: GID.beta, discord_id: 'd-beiwang', nick: '北望', global_name: 'Bw' },
  ],
});
const env = { DB: A.db };
const T = A.tables;

async function gql(query, { user = null, variables } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

const seasonQ = (slug) => `{ viewer { guildAdmin(slug: "${slug}") { __typename ... on GuildAdmin {
  adminTabSeasonLabel
  seasonChecklist { seasonKey versionLabel seasonLabel title hint progressTemplate doneCount totalCount
    items { key title detail checked checkedByName } }
  roster { rosterTitle rosterEmptyText entries { id displayName source matchedName createdAt } }
} ... on GuildAdminLocked { slug } } } }`;
const ga = (r, slug) => r.data?.viewer?.guildAdmin;

describe('season', () => {
let membersBefore: any, batch1: any, newRowId: any, beiwangRowId: any, matchedRowId: any;

it('verdict: season fields exist only on GuildAdmin', async () => {
/* ---------- (1) verdict: season fields exist only on GuildAdmin ---------- */
let r = await gql(seasonQ('alpha'), { user: MEMBER_A });
eq('普通成员 -> GuildAdminLocked (赛季面不下发)', ga(r)?.__typename, 'GuildAdminLocked');
r = await gql(seasonQ('alpha'), { user: null });
eq('匿名 -> GuildAdminLocked', ga(r)?.__typename, 'GuildAdminLocked');
});

it('checklist composition from live season data', async () => {
/* ---------- (2) checklist composition from live season data ---------- */
let r = await gql(seasonQ('alpha'), { user: ADMIN_A });
const admin = ga(r);
eq('军官 -> GuildAdmin', admin?.__typename, 'GuildAdmin');
eq('赛季页签文案', admin?.adminTabSeasonLabel, '赛季');
const cl = admin?.seasonChecklist;
eq('seasonKey = 版本码:赛季码', cl?.seasonKey, 'intl-v2.3:S5');
eq('versionLabel 来自 game_version 展示串', cl?.versionLabel, '国际服 V2.3「青州」');
eq('seasonLabel 来自后端赛季表', cl?.seasonLabel, 'S5 · Ever Aflame');
eq('清单标题文案', cl?.title, '赛季前检查清单');
check('hint 已插值版本与赛季', typeof cl?.hint === 'string' && cl.hint.includes('国际服 V2.3') && cl.hint.includes('S5 · Ever Aflame'), cl?.hint);
eq('条目数', cl?.items?.length, 4);
eq('条目键序', cl?.items?.map((i) => i.key), ['current-dungeons', 'grouping-templates', 'school-guides', 'member-roster']);
check('副本条目 detail 含当期副本数 3', cl?.items?.[0]?.detail?.includes('3'), cl?.items?.[0]?.detail);
check('模板条目 detail 含本百业模板数 2', cl?.items?.[1]?.detail?.includes('2'), cl?.items?.[1]?.detail);
check('攻略条目 detail 含 BiS 3 / 循环 2', cl?.items?.[2]?.detail?.includes('3') && cl.items[2].detail.includes('2'), cl?.items?.[2]?.detail);
check('名册条目 detail 含成员 2 / 名册 0', cl?.items?.[3]?.detail?.includes('2') && cl.items[3].detail.includes('0'), cl?.items?.[3]?.detail);
eq('初始 done/total', [cl?.doneCount, cl?.totalCount], [0, 4]);
check('初始全部未勾', (cl?.items || []).every((i) => i.checked === false && i.checkedByName === null));
eq('名册初始为空', admin?.roster?.entries, []);

r = await gql(seasonQ('beta'), { user: ADMIN_B });
check('乙百业模板条目 detail 含模板数 1 (按百业隔离)', ga(r)?.seasonChecklist?.items?.[1]?.detail?.includes('1'), ga(r)?.seasonChecklist?.items?.[1]?.detail);
});

const setItem = (slug, itemKey, checked) =>
  `mutation { setSeasonChecklistItem(slug: "${slug}", itemKey: "${itemKey}", checked: ${checked}) { ok errorCode } }`;

it('check flow + isolation + validation', async () => {
/* ---------- (3) check flow + isolation + validation ---------- */
let r = await gql(setItem('alpha', 'current-dungeons', true), { user: MEMBER_A });
eq('成员勾选被拒', [r.data?.setSeasonChecklistItem?.ok, r.data?.setSeasonChecklistItem?.errorCode], [false, 'adminOnly']);
r = await gql(setItem('beta', 'current-dungeons', true), { user: ADMIN_A });
eq('甲军官勾乙百业被拒 (跨百业不串权)', [r.data?.setSeasonChecklistItem?.ok, r.data?.setSeasonChecklistItem?.errorCode], [false, 'adminOnly']);
r = await gql(setItem('alpha', 'no-such-item', true), { user: ADMIN_A });
eq('未知条目键被拒', [r.data?.setSeasonChecklistItem?.ok, r.data?.setSeasonChecklistItem?.errorCode], [false, 'checklistItemUnknown']);
r = await gql(setItem('alpha', 'current-dungeons', true), { user: ADMIN_A });
eq('军官勾选成功', r.data?.setSeasonChecklistItem?.ok, true);
r = await gql(seasonQ('alpha'), { user: ADMIN_A });
eq('勾后 doneCount=1', ga(r)?.seasonChecklist?.doneCount, 1);
eq('勾后条目状态 + 操作者快照', ga(r)?.seasonChecklist?.items?.[0] && [ga(r).seasonChecklist.items[0].checked, ga(r).seasonChecklist.items[0].checkedByName], [true, '甲军官']);
r = await gql(seasonQ('beta'), { user: ADMIN_B });
eq('乙百业清单不受甲勾选影响', ga(r)?.seasonChecklist?.doneCount, 0);
r = await gql(setItem('alpha', 'current-dungeons', false), { user: ADMIN_A });
eq('取消勾选成功', r.data?.setSeasonChecklistItem?.ok, true);
r = await gql(seasonQ('alpha'), { user: ADMIN_A });
eq('取消后 doneCount=0', ga(r)?.seasonChecklist?.doneCount, 0);
eq('取消后不再显示操作者快照', ga(r)?.seasonChecklist?.items?.[0] && [ga(r).seasonChecklist.items[0].checked, ga(r).seasonChecklist.items[0].checkedByName], [false, null]);
});

it('season roll resets the checklist', async () => {
/* ---------- (4) season roll resets the checklist ---------- */
T.settings.set('0|game_version_code', 'intl-v9.9');
let r = await gql(setItem('alpha', 'member-roster', true), { user: ADMIN_A });
eq('新赛季下勾选成功', r.data?.setSeasonChecklistItem?.ok, true);
T.settings.set('0|game_version_code', 'intl-v2.3');
r = await gql(seasonQ('alpha'), { user: ADMIN_A });
eq('回到 intl-v2.3 赛季: 旧勾选仍在原赛季 (member-roster 未勾)', ga(r)?.seasonChecklist?.items?.[3]?.checked, false);
T.settings.set('0|game_version_code', 'intl-v9.9');
r = await gql(seasonQ('alpha'), { user: ADMIN_A });
eq('intl-v9.9 赛季 key 无赛季码时为版本码', ga(r)?.seasonChecklist?.seasonKey, 'intl-v9.9');
eq('intl-v9.9 赛季保留自己的勾选', ga(r)?.seasonChecklist?.items?.[3]?.checked, true);
T.settings.set('0|game_version_code', 'intl-v2.3');
});

const previewQ = `mutation($slug: String!, $lines: [String!]!, $imgs: Int!) {
  previewRosterImport(slug: $slug, lines: $lines, imageCount: $imgs) {
    ok error errorCode importedCount message
    preview { batchId matchedCount newCount unrecognizedCount
      rows { id rawName status statusLabel matchedName importable } }
  } }`;
const todayKey = usageDayKey(Date.now());
const usageOf = (uid) => T.usage.get(`${uid}|gear_ocr_batches|${todayKey}`) || 0;

it('roster OCR preview: classification + no silent landing', async () => {
/* ---------- (5) roster OCR preview: classification + no silent landing ---------- */
membersBefore = JSON.stringify(T.guildMembers);

let r = await gql(previewQ, { user: ADMIN_A, variables: { slug: 'alpha', lines: [], imgs: 1 } });
eq('空识别被拒', [r.data?.previewRosterImport?.ok, r.data?.previewRosterImport?.errorCode], [false, 'rosterImportEmpty']);
eq('空识别不计量', usageOf(UID.ADMIN_A), 0);
r = await gql(previewQ, { user: MEMBER_A, variables: { slug: 'alpha', lines: ['新侠客'], imgs: 1 } });
eq('成员预览被拒', [r.data?.previewRosterImport?.ok, r.data?.previewRosterImport?.errorCode], [false, 'adminOnly']);
r = await gql(previewQ, { user: ADMIN_A, variables: { slug: 'alpha', lines: ['新侠客'], imgs: 21 } });
eq('单批超张数被拒 (与装备 OCR 同限额)', [r.data?.previewRosterImport?.ok, r.data?.previewRosterImport?.errorCode], [false, 'gearOcrBatchTooLarge']);
eq('超张数不计量', usageOf(UID.ADMIN_A), 0);

r = await gql(previewQ, {
  user: ADMIN_A,
  variables: { slug: 'alpha', lines: ['阿青', '老 墨', '新侠客', '12345', '阿青', '北望'], imgs: 2 },
});
const pv = r.data?.previewRosterImport;
eq('预览成功', pv?.ok, true);
eq('预览计数 matched/new/unrecognized', pv?.preview && [pv.preview.matchedCount, pv.preview.newCount, pv.preview.unrecognizedCount], [2, 2, 1]);
eq('批内去重后行数', pv?.preview?.rows?.length, 5);
const byName = Object.fromEntries((pv?.preview?.rows || []).map((x) => [x.rawName, x]));
eq('阿青 -> 已匹配 Discord 名册', [byName['阿青']?.status, byName['阿青']?.matchedName], ['MATCHED', '阿青']);
eq('老墨 (OCR 空格) 经规范化匹配 global_name', [byName['老 墨']?.status, byName['老 墨']?.matchedName], ['MATCHED', '老墨']);
eq('新侠客 -> 疑似新名可导入', [byName['新侠客']?.status, byName['新侠客']?.importable], ['NEW', true]);
eq('北望 是乙百业成员, 在甲百业算新名 (按百业隔离)', byName['北望']?.status, 'NEW');
eq('纯数字行 -> 无法识别', [byName['12345']?.status, byName['12345']?.importable], ['UNRECOGNIZED', false]);
check('状态文案后端下发', byName['阿青']?.statusLabel === '已匹配' && byName['新侠客']?.statusLabel === '疑似新名' && byName['12345']?.statusLabel === '无法识别',
  JSON.stringify([byName['阿青']?.statusLabel, byName['新侠客']?.statusLabel, byName['12345']?.statusLabel]));
eq('预览后名册仍为空 (确认前不落库)', T.rosterEntries.length, 0);
eq('预览计量 +1 批 (同一 gear_ocr_batches 计数)', usageOf(UID.ADMIN_A), 1);
eq('预览不触碰 guild_members', JSON.stringify(T.guildMembers), membersBefore);
batch1 = pv.preview.batchId;
newRowId = byName['新侠客'].id;
beiwangRowId = byName['北望'].id;
matchedRowId = byName['阿青'].id;
});

it('confirm: selected NEW rows only, batch closes', async () => {
/* ---------- (6) confirm: selected NEW rows only, batch closes ---------- */
const confirmQ = `mutation($slug: String!, $batch: ID!, $rows: [ID!]!) {
  confirmRosterImport(slug: $slug, batchId: $batch, rowIds: $rows) {
    ok errorCode importedCount message preview { rows { id status importable } } } }`;
let r = await gql(confirmQ, { user: MEMBER_A, variables: { slug: 'alpha', batch: batch1, rows: [newRowId] } });
eq('成员确认被拒', [r.data?.confirmRosterImport?.ok, r.data?.confirmRosterImport?.errorCode], [false, 'adminOnly']);
r = await gql(confirmQ, { user: ADMIN_B, variables: { slug: 'beta', batch: batch1, rows: [newRowId] } });
eq('乙军官确认甲批次 -> 批次不存在 (租户隔离)', [r.data?.confirmRosterImport?.ok, r.data?.confirmRosterImport?.errorCode], [false, 'rosterBatchNotFound']);
r = await gql(confirmQ, { user: ADMIN_A, variables: { slug: 'alpha', batch: batch1, rows: [matchedRowId] } });
eq('只勾已匹配行 -> 无可导入', [r.data?.confirmRosterImport?.ok, r.data?.confirmRosterImport?.errorCode], [false, 'rosterNoImportableRows']);
eq('失败确认不关批次不落库', [T.importBatches.find((b) => String(b.id) === String(batch1))?.status, T.rosterEntries.length], ['pending', 0]);
r = await gql(confirmQ, { user: ADMIN_A, variables: { slug: 'alpha', batch: batch1, rows: [newRowId] } });
eq('确认选中的新名成功', [r.data?.confirmRosterImport?.ok, r.data?.confirmRosterImport?.importedCount], [true, 1]);
check('成功文案含计数', (r.data?.confirmRosterImport?.message || '').includes('1'), r.data?.confirmRosterImport?.message);
eq('名册落库一条 (仅选中的新名, 北望未选不落)', T.rosterEntries.map((e) => e.display_name), ['新侠客']);
eq('落库不触碰 guild_members', JSON.stringify(T.guildMembers), membersBefore);
eq('批次已关闭', T.importBatches.find((b) => String(b.id) === String(batch1))?.status, 'confirmed');
r = await gql(confirmQ, { user: ADMIN_A, variables: { slug: 'alpha', batch: batch1, rows: [beiwangRowId] } });
eq('重复确认被拒', [r.data?.confirmRosterImport?.ok, r.data?.confirmRosterImport?.errorCode], [false, 'rosterBatchConfirmed']);
});

it('re-import: roster entries now match, no duplicates', async () => {
/* ---------- (7) re-import: roster entries now match, no duplicates ---------- */
let r = await gql(previewQ, { user: ADMIN_A, variables: { slug: 'alpha', lines: ['新侠客', '阿青'], imgs: 1 } });
eq('二次预览: 已落册名转为已匹配', r.data?.previewRosterImport?.preview && [r.data.previewRosterImport.preview.matchedCount, r.data.previewRosterImport.preview.newCount], [2, 0]);
eq('二次预览计量 +1', usageOf(UID.ADMIN_A), 2);
r = await gql(seasonQ('alpha'), { user: ADMIN_A });
const readEntries = ga(r)?.roster?.entries || [];
eq('名册读回条数', readEntries.length, 1);
check('名册读回内容 (ocr 来源, 无匹配名)', readEntries[0]?.displayName === '新侠客' && readEntries[0]?.source === 'ocr' && readEntries[0]?.matchedName === null, JSON.stringify(readEntries[0]));
});

it('delete entry', async () => {
/* ---------- (8) delete entry ---------- */
const entryId = String(T.rosterEntries[0].id);
const delQ = `mutation($slug: String!, $id: ID!) { deleteGuildRosterEntry(slug: $slug, entryId: $id) { ok errorCode } }`;
let r = await gql(delQ, { user: MEMBER_A, variables: { slug: 'alpha', id: entryId } });
eq('成员删名册被拒', [r.data?.deleteGuildRosterEntry?.ok, r.data?.deleteGuildRosterEntry?.errorCode], [false, 'adminOnly']);
r = await gql(delQ, { user: ADMIN_B, variables: { slug: 'beta', id: entryId } });
eq('乙军官删甲名册 -> 不存在 (租户隔离)', [r.data?.deleteGuildRosterEntry?.ok, r.data?.deleteGuildRosterEntry?.errorCode], [false, 'rosterEntryNotFound']);
r = await gql(delQ, { user: ADMIN_A, variables: { slug: 'alpha', id: entryId } });
eq('军官删名册成功', r.data?.deleteGuildRosterEntry?.ok, true);
eq('名册已清空', T.rosterEntries.length, 0);
});

it('daily metering cap (same counter as gear OCR)', async () => {
/* ---------- (9) daily metering cap (same counter as gear OCR) ---------- */
T.usage.set(`${UID.ADMIN_A}|gear_ocr_batches|${todayKey}`, 10);
let r = await gql(previewQ, { user: ADMIN_A, variables: { slug: 'alpha', lines: ['某某'], imgs: 1 } });
eq('日批次达上限被拒 (与装备 OCR 同一计数)', [r.data?.previewRosterImport?.ok, r.data?.previewRosterImport?.errorCode], [false, 'gearOcrDailyLimit']);
T.usage.delete(`${UID.ADMIN_A}|gear_ocr_batches|${todayKey}`);
r = await gql(previewQ, { user: ADMIN_A, variables: { slug: 'alpha', lines: ['某某'], imgs: 1 } });
eq('清零后预览恢复', r.data?.previewRosterImport?.ok, true);

if (A.unknownSql.size) console.log('UNKNOWN SQL (routed to empty):', [...A.unknownSql].slice(0, 10));
});

});
