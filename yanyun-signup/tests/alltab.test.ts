// ALL tab (全部) acceptance: real yoga + graphql.ts resolvers +
// FakeDB (in-memory tables).
// Rule (marcus, 2026-11-12): the squad list gains an ALL tab in
// first position and it becomes the default view. ALL is a list
// VIEW over every grouping type in the guild — it is not a type:
// GroupingTab gains ALL, GroupingType does not, and create paths
// (which type through GroupingType / TAB_TO_TYPE) can never mint
// an "all" grouping. The ALL list keeps the per-type list's rules
// (draft/completed never listed; the week window stays a client
// concern) and every card keeps its own type. Tab labels are
// backend-issued like the other five (groupingType_tabAll).
// Coverage: schema surface -> seeded cars of every type -> ALL
// union + per-type tab isolation + status exclusion -> zh/en tab
// copy -> mobile block tree under ALL -> member gate unchanged.
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { typeDefs } from '../src/graphql-schema.ts';
import { buildReminderMessage } from '../src/domains/groupings/reminder.ts';
import { TAB_TO_TYPE } from '../src/domains/platform/graphql-base.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name, got, want) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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

/* ---------------- FakeDB: in-memory tables routed by SQL shape ---------------- */
const SLUG = 'alltabtest';
/* Typed-ID fixtures (0036): the guild's numeric primary key and the
   viewers' numeric user IDs; Discord IDs stay as Discord-space values. */
const GID = 1030100001;
const UID = { U1: 2030100001, U2: 2030100002 };
const tables = {
  events: [], signups: [], guild_members: [],
  users: [
    { id: UID.U1, discord_id: 'U1', username: '塔主', guilds_json: '[]' },
    { id: UID.U2, discord_id: 'U2', username: '队员', guilds_json: '[]' },
  ],
  mint: new Map(),
};
const tenants = [{ id: GID, slug: SLUG, guild_name: '全部页签测试百业', slogan: '', announcement: '' }];
const settings = new Map([[`${GID}|discord_guild_id`, 'G123']]);
const dungeons = [
  { id: 7, name: '定极分更', size: 5 },
  { id: 4, name: '玉魄染青苍', size: 10 },
];
let nextId = 100;
const unknownSql = new Set();

function insertRow(table, cols, vals) {
  const row = { id: nextId++ };
  cols.forEach((c, i) => { row[c] = vals[i]; });
  (tables[table] ||= []).push(row);
  return row;
}
function parseInsert(sql) {
  const m = sql.match(/INSERT INTO (\w+) \(([^)]+)\)/);
  if (!m) return null;
  return { table: m[1], cols: m[2].split(',').map((x) => x.trim()) };
}
// VALUES (...): parse token by token — '?' consumes one bind;
// 'literals'/NULL/numbers are taken at face value. Backend INSERTs mix
// literals ('open', '热心侠客', '') with placeholders, so tokens must
// align positionally or every column shifts (the root cause of the 25
// failures on this harness's first run — a harness bug, not a product bug).
function parseValues(sql, binds) {
  const vm = sql.match(/VALUES\s*\(([\s\S]*?)\)\s*(?:ON CONFLICT|RETURNING|$|;)/);
  if (!vm) {
    const alt = sql.match(/VALUES\s*\(([\s\S]*)\)/);
    if (!alt) return null;
    return splitTokens(alt[1], binds);
  }
  return splitTokens(vm[1], binds);
}
function splitTokens(body, binds) {
  const toks = [];
  let cur = '', inQ = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inQ) {
      cur += ch;
      if (ch === "'") { if (body[i + 1] === "'") { cur += "'"; i++; } else inQ = false; }
    } else if (ch === "'") { inQ = true; cur += ch; }
    else if (ch === ',') { toks.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) toks.push(cur.trim());
  let bi = 0;
  return toks.map((t) => {
    if (t === '?') return binds[bi++];
    if (/^'.*'$/s.test(t)) return t.slice(1, -1).replace(/''/g, "'");
    if (/^NULL$/i.test(t)) return null;
    if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
    return t;
  });
}

function stmt(sql) {
  // Data-layer (Drizzle) SQL normalization: strip quotes + settings. qualifiers (routing match only).
  sql = sql.replace(/"/g, '').replace(/settings\./g, '');
  const q = {
    _binds: [],
    bind(...a) { this._binds = a; return this; },
    async raw() { const res = await this.all(); return toRawRows(sql, (res && res.results) || []); },
    async first() {
      const b = this._binds;
      if (/INSERT INTO id_mint_counters/.test(sql)) {
        const key = `${b[0]}|${b[1]}`;
        const seq = (tables.mint.get(key) || 0) + 1;
        tables.mint.set(key, seq);
        return { seq };
      }
      if (/FROM users/.test(sql) && /WHERE id = \?/.test(sql)) return tables.users.find((u) => u.id === Number(b[0])) || null;
      if (/FROM users/.test(sql) && /discord_id = \?/.test(sql)) return tables.users.find((u) => u.discord_id === String(b[0])) || null;
      if (/FROM tenants WHERE slug/.test(sql)) return tenants.find((t) => t.slug === b[0]) || null;
      if (/FROM settings/.test(sql)) {
        const v = settings.get(`${b[0]}|${b[1]}`);
        return v === undefined ? null : { value: v };
      }
      if (/SELECT \* FROM events WHERE id = \?/.test(sql)) return tables.events.find((e) => e.id === Number(b[0])) || null;
      if (/FROM dungeons WHERE id = \?/.test(sql)) return dungeons.find((d) => d.id === Number(b[0])) || null;
      if (/FROM dungeons WHERE name = \?/.test(sql)) return dungeons.find((d) => d.name === b[0]) || null;
      if (/AS c,/.test(sql) && /FROM signups/.test(sql)) {
        const gid = Number(b[0]);
        const rows = tables.signups.filter((r) => r.event_id === gid);
        const ev = tables.events.find((e) => e.id === gid);
        return { c: rows.length, h: rows.filter((r) => r.role === '奶' || r.role === '治疗').length, m: ev ? ev.max_slots : 0 };
      }
      if (/COUNT\(\*\) AS c FROM signups WHERE event_id/.test(sql)) {
        return { c: tables.signups.filter((r) => r.event_id === Number(b[0])).length };
      }
      if (/CREATE|ALTER/.test(sql)) return null;
      unknownSql.add('first: ' + sql.slice(0, 90));
      return null;
    },
    async all() {
      const b = this._binds;
      if (/INSERT INTO id_mint_counters/.test(sql)) {
        const key = `${b[0]}|${b[1]}`;
        const seq = (tables.mint.get(key) || 0) + 1;
        tables.mint.set(key, seq);
        return { results: [{ seq }] };
      }
      if (/FROM users/.test(sql) && /WHERE id = \?/.test(sql)) {
        const u = tables.users.find((x) => x.id === Number(b[0])) || null;
        return { results: u ? [u] : [] };
      }
      if (/FROM users/.test(sql) && /discord_id = \?/.test(sql)) {
        const u = tables.users.find((x) => x.discord_id === String(b[0])) || null;
        return { results: u ? [u] : [] };
      }
      if (/FROM users/.test(sql)) return { results: tables.users };
      if (/FROM settings/.test(sql)) {
        // Data-layer point lookups use the .all() channel (drizzle db.get): same shape as first()'s settings branch.
        if (/tenant = \?/.test(sql)) {
          const v = settings.get(`${b[0]}|${b[1]}`);
          return { results: v === undefined ? [] : [{ value: v }] };
        }
        const rows = [];
        for (const [k, v] of settings) {
          const [t, key] = k.split('|');
          if (key === b[0]) rows.push({ tenant: t, value: v });
        }
        return { results: rows };
      }
      if (/FROM events WHERE id = \?/.test(sql)) {
        // Data-layer point lookups use the .all() channel (drizzle db.get): same shape as first()'s by-id branch.
        const row = tables.events.find((e) => e.id === Number(b[0])) || null;
        return { results: row ? [row] : [] };
      }
      if (/AS c,/.test(sql) && /FROM signups/.test(sql)) {
        // Data-layer point lookups use the .all() channel: same shape as first()'s capacity-triple branch.
        const gid = Number(b[0]);
        const rows = tables.signups.filter((r) => r.event_id === gid);
        const ev = tables.events.find((e) => e.id === gid);
        return { results: [{ c: rows.length, h: rows.filter((r) => r.role === '奶' || r.role === '治疗').length, m: ev ? ev.max_slots : 0 }] };
      }
      if (/FROM events WHERE tenant = \? AND type = \?/.test(sql)) {
        return { results: tables.events.filter((e) => e.tenant === b[0] && e.type === b[1] && e.status !== 'draft' && e.status !== 'completed') };
      }
      if (/FROM events WHERE tenant = \? AND status NOT IN/.test(sql)) {
        return { results: tables.events.filter((e) => e.tenant === b[0] && e.status !== 'draft' && e.status !== 'completed') };
      }
      if (/FROM signups WHERE event_id\s*=\s*\?/.test(sql)) {
        return { results: tables.signups.filter((r) => r.event_id === Number(b[0])) };
      }
      if (/FROM tenants/.test(sql) && /slug = \?/.test(sql)) {
        const row = tenants.find((x) => x.slug === b[0]) || null;
        return { results: row ? [row] : [] };
      }
      if (/FROM tenants/.test(sql) && /WHERE id = \?/.test(sql)) {
        const row = tenants.find((x) => x.id === Number(b[0])) || null;
        return { results: row ? [row] : [] };
      }
      if (/FROM tenants/.test(sql)) return { results: tenants };
      if (/CREATE|ALTER|PRAGMA/.test(sql)) return { results: [] };
      unknownSql.add('all: ' + sql.slice(0, 90));
      return { results: [] };
    },
    async run() {
      const b = this._binds;
      if (/CREATE|ALTER/.test(sql)) return { meta: { changes: 0 } };
      if (/^INSERT INTO/.test(sql)) {
        const ins = parseInsert(sql);
        if (!ins) { unknownSql.add('run-insert: ' + sql.slice(0, 90)); return { meta: { changes: 0 } }; }
        // joinGrouping's conditional insert: INSERT ... SELECT ?,?,... WHERE (COUNT) < (max_slots)
        // (no VALUES clause; the leading binds are the column values).
        if (/INSERT INTO signups/.test(sql) && /COUNT\(\*\) FROM signups/.test(sql) && !/VALUES/.test(sql)) {
          const v = {};
          ins.cols.forEach((c, i) => { v[c] = b[i]; });
          const gid = Number(v.event_id);
          const ev = tables.events.find((e) => e.id === gid);
          const cnt = tables.signups.filter((r) => r.event_id === gid).length;
          if (!ev || ev.status !== 'open' || cnt >= ev.max_slots) return { meta: { changes: 0 } };
          const row = insertRow(ins.table, ins.cols, b.slice(0, ins.cols.length));
          return { meta: { changes: 1, last_row_id: row.id } };
        }
        const vals = parseValues(sql, b);
        if (!vals) { unknownSql.add('run-values: ' + sql.slice(0, 90)); return { meta: { changes: 0 } }; }
        const row = insertRow(ins.table, ins.cols, vals);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      if (/^DELETE FROM signups WHERE id = \?/.test(sql)) {
        const i = tables.signups.findIndex((r) => r.id === Number(b[0]));
        if (i >= 0) tables.signups.splice(i, 1);
        return { meta: { changes: i >= 0 ? 1 : 0 } };
      }
      if (/^UPDATE/.test(sql)) return { meta: { changes: 1 } };
      unknownSql.add('run: ' + sql.slice(0, 90));
      return { meta: { changes: 0 } };
    },
  };
  return q;
}
const db = {
  prepare: (sql) => stmt(sql),
  async batch(stmts) { const out = []; for (const s of stmts) out.push(await s.run()); return out; },
};
const env = { DB: db };

const leader = { userId: UID.U1, discordId: 'U1', name: '塔主', guilds: ['G123'] };
const member = { userId: UID.U2, discordId: 'U2', name: '队员', guilds: ['G123'] };

async function gql(query, { user = leader, locale = 'zh-CN', variables } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale, browserLocale: locale, executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}


describe('alltab', () => {

  it('(a) schema: ALL is a tab, never a type', async () => {
check('schema: GroupingTab 含 ALL', /enum GroupingTab \{[^}]*ALL/.test(typeDefs));
check('schema: GroupingType 不含 ALL', !/enum GroupingType \{[^}]*ALL/.test(typeDefs));
check('schema: GroupingListPage.tabAllLabel', typeDefs.includes('tabAllLabel: String!'));
check('schema: TAB_TO_TYPE 无 ALL (建车路径解析不到)', !('ALL' in TAB_TO_TYPE));
  });

  it('(b) seed: one open car per type, then two leave the list states', async () => {
const startsAt = String(Math.floor(Date.now() / 1000) + 3600);
const createMut = `mutation($input: CreateGroupingInput!) {
  createGrouping(input: $input) { ok error grouping { id title type } }
}`;
const seed: Record<string, string> = {};
for (const [type, title] of [
  ['ACTIVITY', '双十甲车'], ['TALENT', '天赋乙车'], ['RACE', '竞速丙车'],
  ['TOWER', '爬塔丁车'], ['EXPLORE', '探索戊车'],
] as const) {
  const c = await gql(createMut, {
    variables: {
      input: {
        slug: SLUG, title, type, startsAt,
        seats: [{ nickname: '塔主', weapon: '破竹·樽' }],
      },
    },
  });
  check('seed ' + type + ' ok', c.data?.createGrouping?.ok === true, JSON.stringify(c.errors || c.data));
  seed[type] = c.data?.createGrouping?.grouping?.id;
}
// A completed car and a draft car exist in the guild but, exactly as
// on the per-type tabs, they belong to no list — ALL included.
const towerRow = tables.events.find((e) => e.id === Number(seed.TOWER));
if (towerRow) towerRow.status = 'completed';
const raceRow = tables.events.find((e) => e.id === Number(seed.RACE));
if (raceRow) raceRow.status = 'draft';
(allIds as any).seed = seed;
  });

  it('(c) ALL union, per-type isolation, copy', async () => {
const seed = (allIds as any).seed as Record<string, string>;
const listQ = `query($slug: String!, $tab: GroupingTab!) {
  groupingListPage(slug: $slug, tab: $tab) {
    tabAllLabel tabActivityLabel
    groupings { id title type maxSlots occupiedCount }
  }
}`;
const visible = [seed.ACTIVITY, seed.TALENT, seed.EXPLORE].sort();
const la = await gql(listQ, { variables: { slug: SLUG, tab: 'ALL' } });
const allGot = (la.data?.groupingListPage?.groupings || []).map((g: any) => g.id).sort();
eq('ALL 页签 = 三类可见车并集', JSON.stringify(allGot), JSON.stringify(visible));
check('ALL 每车保留自身 type', (la.data?.groupingListPage?.groupings || []).every((g: any) => ['ACTIVITY', 'TALENT', 'EXPLORE'].includes(g.type)));
eq('ALL tabAllLabel (zh)', la.data?.groupingListPage?.tabAllLabel, '全部');

for (const [tab, want] of [['ACTIVITY', seed.ACTIVITY], ['TALENT', seed.TALENT], ['EXPLORE', seed.EXPLORE], ['TOWER', null], ['RACE', null]] as const) {
  const lt = await gql(listQ, { variables: { slug: SLUG, tab } });
  const got = (lt.data?.groupingListPage?.groupings || []).map((g: any) => g.id);
  eq(tab + ' 页签隔离', JSON.stringify(got), JSON.stringify(want ? [want] : []));
}

const laEn = await gql(listQ, { variables: { slug: SLUG, tab: 'ALL' }, locale: 'en' });
eq('tabAllLabel (en)', laEn.data?.groupingListPage?.tabAllLabel, 'All');

// The path the web list actually takes: viewer -> guild -> groupings.
const viewerQ = `query($slug: String!, $tab: GroupingTab!) {
  viewer { guild(slug: $slug) { ... on Guild { groupings(tab: $tab) { groupings { id type } } } } }
}`;
const vw = await gql(viewerQ, { variables: { slug: SLUG, tab: 'ALL' } });
const vwGot = (vw.data?.viewer?.guild?.groupings?.groupings || []).map((g: any) => g.id).sort();
eq('viewer 路径 ALL 并集一致', JSON.stringify(vwGot), JSON.stringify(visible));
  });

  it('(d) blocks under ALL keep each car its own badge (mobile)', async () => {
const blocksQ = `query($slug: String!, $tab: GroupingTab!) {
  groupingListPage(slug: $slug, tab: $tab) {
    blocks(blocksVersion: 3, weekOffset: 0) {
      __typename
      ... on GroupingCardBlock { badgeText title }
    }
  }
}`;
const bk = await gql(blocksQ, { variables: { slug: SLUG, tab: 'ALL' } });
const cards = (bk.data?.groupingListPage?.blocks || []).filter((b: any) => b.__typename === 'GroupingCardBlock');
const byTitle = Object.fromEntries(cards.map((c: any) => [c.title, c.badgeText]));
eq('ALL blocks 卡片数', cards.length, 3);
eq('双十车 badge', byTitle['双十甲车'], '双十');
eq('天赋车 badge', byTitle['天赋乙车'], '天赋');
eq('探索车 badge', byTitle['探索戊车'], '联机探索');
  });

  it('(e) gates: ALL changes no access verdict; ALL cannot be created', async () => {
const listQ = `query($slug: String!, $tab: GroupingTab!) {
  groupingListPage(slug: $slug, tab: $tab) { tabAllLabel groupings { id } }
}`;
// Bound guild: anonymous and non-member viewers get the same refusal
// on ALL as on any other tab — the tab is a view, not a gate change.
const anon = await gql(listQ, { user: null, variables: { slug: SLUG, tab: 'ALL' } });
check('匿名 ALL 被拒', !!(anon.errors && anon.errors.length) && !anon.data?.groupingListPage, JSON.stringify(anon).slice(0, 200));
const outsider = { userId: 999, discordId: 'U9', name: '路人', guilds: [] };
const out = await gql(listQ, { user: outsider, variables: { slug: SLUG, tab: 'ALL' } });
check('非成员 ALL 被拒', !!(out.errors && out.errors.length) && !out.data?.groupingListPage, JSON.stringify(out).slice(0, 200));

// GroupingType has no ALL, so a create typed ALL fails validation and
// writes no row.
const before = tables.events.length;
const bad = await gql(`mutation($input: CreateGroupingInput!) {
  createGrouping(input: $input) { ok grouping { id } }
}`, {
  variables: {
    input: {
      slug: SLUG, title: '全部车', type: 'ALL',
      startsAt: String(Math.floor(Date.now() / 1000) + 3600),
      seats: [{ nickname: '塔主', weapon: '破竹·樽' }],
    },
  },
});
check('type=ALL 建车被拒', !!(bad.errors && bad.errors.length) || bad.data?.createGrouping?.ok !== true, JSON.stringify(bad).slice(0, 200));
eq('拒后无新行', tables.events.length, before);
check('无 type=all 落库', !tables.events.some((e) => e.type === 'all'));
  });
});

const allIds: Record<string, unknown> = {};
