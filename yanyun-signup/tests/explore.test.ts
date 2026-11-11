// Explore (EXPLORE, 联机探索) category acceptance: real yoga +
// graphql.ts resolvers + FakeDB (in-memory tables).
// Rule (marcus, 2026-11-11): co-op exploration is a grouping type of
// its own — not ACTIVITY, not TALENT. It never carries a dungeon, and
// its seat count is the single caller-chosen shape input in the
// system: createGrouping accepts maxSlots 5 or 10 (default 10) for
// EXPLORE only; any other value is rejected (badMaxSlots) and every
// other type ignores the input entirely.
// Coverage: schema enums/fields/inputs -> createGrouping capacity
// matrix + gates -> list filtering (tab isolation) -> joinGrouping
// signup -> list/detail Block badges -> copy fields (zh + en) ->
// departure-reminder copy (buildReminderMessage, real function).
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { typeDefs } from '../src/graphql-schema.ts';
import { buildReminderMessage } from '../src/domains/groupings/reminder.ts';

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
const SLUG = 'exploretest';
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
const tenants = [{ id: GID, slug: SLUG, guild_name: '探索测试百业', slogan: '', announcement: '' }];
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
        return { results: tables.events.filter((e) => e.tenant === b[0] && e.type === b[1]) };
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

let startsAt: any;
let createMut: any;
let listQ: any;
let fiveId: any;

describe('explore', () => {

  it('(a) schema', async () => {
/* ---------------- (a) schema ---------------- */
check('schema: GroupingTab 含 EXPLORE', /enum GroupingTab \{[^}]*EXPLORE/.test(typeDefs));
check('schema: GroupingType 含 EXPLORE', /enum GroupingType \{[^}]*EXPLORE/.test(typeDefs));
for (const f of ['tabExploreLabel', 'typeShortCoopExplore', 'formTypeExploreLabel', 'formHintExplore', 'formSizeLabel', 'formSizeOptionTemplate']) {
  check('schema: 字段 ' + f, typeDefs.includes(f + ': String!'));
}
check('schema: CreateGroupingInput.maxSlots', /input CreateGroupingInput \{[^}]*maxSlots: Int/.test(typeDefs));
check('schema: GroupingTemplateInput.maxSlots', /input GroupingTemplateInput \{[^}]*maxSlots: Int/.test(typeDefs));
check('schema: CreateGroupingTemplateInput.maxSlots', /input CreateGroupingTemplateInput \{[^}]*maxSlots: Int/.test(typeDefs));

  });

  it('(b) creation: capacity is caller-chosen for EXPLORE only', async () => {
/* ---------------- (b) Creation: the capacity matrix ---------------- */
startsAt = String(Math.floor(Date.now() / 1000) + 3600);
createMut = `mutation($input: CreateGroupingInput!) {
  createGrouping(input: $input) { ok error errorCode grouping { id title type maxSlots dungeon { name } } }
}`;
// Default: no maxSlots -> 10 seats; a dungeonId is ignored (EXPLORE
// never carries a dungeon), exactly like ACTIVITY / TOWER.
const c1 = await gql(createMut, {
  variables: {
    input: {
      slug: SLUG, title: '周五滹沱探索', type: 'EXPLORE', startsAt, dungeonId: '7',
      seats: [{ nickname: '塔主', weapon: '破竹·樽' }],
    },
  },
});
check('create EXPLORE ok', c1.data?.createGrouping?.ok === true, JSON.stringify(c1.errors || c1.data));
eq('create EXPLORE grouping.type', c1.data?.createGrouping?.grouping?.type, 'EXPLORE');
eq('create EXPLORE 默认 maxSlots=10', c1.data?.createGrouping?.grouping?.maxSlots, 10);
eq('create EXPLORE dungeon 被忽略', c1.data?.createGrouping?.grouping?.dungeon, null);
const rowDefault = tables.events.find((e) => e.type === 'explore');
check('DB 行 type=explore', !!rowDefault);
eq('DB 行 dungeon 为空', rowDefault?.dungeon, '');
eq('DB 行 max_slots=10', rowDefault?.max_slots, 10);

// Chosen size: 5 -> a five-seat car.
const c5 = await gql(createMut, {
  variables: {
    input: {
      slug: SLUG, title: '五人探索小队', type: 'EXPLORE', startsAt, maxSlots: 5,
      seats: [{ nickname: '塔主', weapon: '破竹·樽' }],
    },
  },
});
check('create EXPLORE maxSlots=5 ok', c5.data?.createGrouping?.ok === true, JSON.stringify(c5.errors || c5.data));
eq('EXPLORE maxSlots=5 落库', c5.data?.createGrouping?.grouping?.maxSlots, 5);
fiveId = c5.data?.createGrouping?.grouping?.id;

// Chosen size: 10 explicitly -> 10.
const c10 = await gql(createMut, {
  variables: { input: { slug: SLUG, title: '十人探索团', type: 'EXPLORE', startsAt, maxSlots: 10, seats: [] } },
});
check('create EXPLORE maxSlots=10 ok', c10.data?.createGrouping?.ok === true);
eq('EXPLORE maxSlots=10 落库', c10.data?.createGrouping?.grouping?.maxSlots, 10);

// Any other value rejects the whole create and leaves no row behind.
const before = tables.events.length;
const cBad = await gql(createMut, {
  variables: { input: { slug: SLUG, title: '七人探索', type: 'EXPLORE', startsAt, maxSlots: 7, seats: [] } },
});
eq('EXPLORE maxSlots=7 被拒', cBad.data?.createGrouping?.ok, false);
eq('EXPLORE maxSlots=7 错误码', cBad.data?.createGrouping?.errorCode, 'badMaxSlots');
eq('拒绝后不落库', tables.events.length, before);

// Controls: the other types ignore maxSlots entirely (their capacity
// derivation is byte-identical to before this type existed).
const cAct = await gql(createMut, {
  variables: { input: { slug: SLUG, title: '对照双十车', type: 'ACTIVITY', startsAt, maxSlots: 5, seats: [] } },
});
check('create ACTIVITY 对照 ok', cAct.data?.createGrouping?.ok === true);
eq('ACTIVITY 带 maxSlots=5 仍 10', cAct.data?.createGrouping?.grouping?.maxSlots, 10);
const cTal = await gql(createMut, {
  variables: { input: { slug: SLUG, title: '对照天赋车', type: 'TALENT', startsAt, maxSlots: 10, seats: [] } },
});
check('create TALENT 对照 ok', cTal.data?.createGrouping?.ok === true);
eq('TALENT 带 maxSlots=10 仍默认 5', cTal.data?.createGrouping?.grouping?.maxSlots, 5);

// The form's own gates apply unchanged: the 60-day horizon…
const tooFar = String(Math.floor(Date.now() / 1000) + 61 * 86400);
const cFar = await gql(createMut, {
  variables: { input: { slug: SLUG, title: '太远的探索', type: 'EXPLORE', startsAt: tooFar, seats: [] } },
});
eq('EXPLORE 超 60 天被拒', cFar.data?.createGrouping?.ok, false);
eq('EXPLORE 超 60 天错误码', cFar.data?.createGrouping?.errorCode, 'startTimeTooFar');
// …and the write gate for signed-out callers.
const cAnon = await gql(createMut, {
  user: null,
  variables: { input: { slug: SLUG, title: '匿名探索', type: 'EXPLORE', startsAt, seats: [] } },
});
eq('匿名建 EXPLORE 车被拒', cAnon.data?.createGrouping?.ok, false);
eq('匿名错误码', cAnon.data?.createGrouping?.errorCode, 'loginRequired');

  });

  it('(c) list filtering and copy', async () => {
/* ---------------- (c) List filtering and copy ---------------- */
listQ = `query($slug: String!, $tab: GroupingTab!) {
  groupingListPage(slug: $slug, tab: $tab) {
    tabExploreLabel typeShortCoopExplore formTypeExploreLabel formHintExplore formSizeLabel formSizeOptionTemplate formTitleTemplate
    groupings { id title type maxSlots occupiedCount }
  }
}`;
const le = await gql(listQ, { variables: { slug: SLUG, tab: 'EXPLORE' } });
eq('列表页 tabExploreLabel (zh)', le.data?.groupingListPage?.tabExploreLabel, '联机探索');
eq('列表页 typeShortCoopExplore (zh)', le.data?.groupingListPage?.typeShortCoopExplore, '联机探索');
eq('列表页 formTypeExploreLabel (zh)', le.data?.groupingListPage?.formTypeExploreLabel, '联机探索');
eq('列表页 formHintExplore (zh)', le.data?.groupingListPage?.formHintExplore, '联机探索不选副本，人数可选 5 或 10 人');
eq('列表页 formSizeLabel (zh)', le.data?.groupingListPage?.formSizeLabel, '人数');
eq('列表页 formSizeOptionTemplate (zh)', le.data?.groupingListPage?.formSizeOptionTemplate, '{n} 人');
const fiveInList = (le.data?.groupingListPage?.groupings || []).find((g) => g.id === fiveId);
check('EXPLORE tab 列表含五人探索车', !!fiveInList);
eq('列表中探索车 type', fiveInList?.type, 'EXPLORE');
eq('列表中探索车 maxSlots', fiveInList?.maxSlots, 5);
check('EXPLORE tab 只含探索车', (le.data?.groupingListPage?.groupings || []).every((g) => g.type === 'EXPLORE'));

const la = await gql(listQ, { variables: { slug: SLUG, tab: 'ACTIVITY' } });
check('ACTIVITY tab 不含探索车', !(la.data?.groupingListPage?.groupings || []).some((g) => g.id === fiveId));

// Default title template over the explore short: X's co-op squad.
const tpl = le.data?.groupingListPage?.formTitleTemplate || '';
eq('默认标题拼装', tpl.replace('{nickname}', '塔主').replace('{type}', le.data?.groupingListPage?.typeShortCoopExplore || ''), '塔主的联机探索车队');

// English copy.
const leEn = await gql(listQ, { variables: { slug: SLUG, tab: 'EXPLORE' }, locale: 'en' });
eq('tabExploreLabel (en)', leEn.data?.groupingListPage?.tabExploreLabel, 'Co-op Exploration');
eq('typeShortCoopExplore (en)', leEn.data?.groupingListPage?.typeShortCoopExplore, 'Co-op');

  });

  it('(d) signup', async () => {
/* ---------------- (d) Signup ---------------- */
const joinMut = `mutation($input: JoinGroupingInput!) {
  joinGrouping(input: $input) { ok error seats { nickname occupied } }
}`;
const j1 = await gql(joinMut, {
  user: member,
  variables: { input: { groupingId: fiveId, nickname: '队员', weapon: '牵丝·霖', seatIndex: 1 } },
});
check('joinGrouping 探索车 ok', j1.data?.joinGrouping?.ok === true, JSON.stringify(j1.errors || j1.data));
const le2 = await gql(listQ, { variables: { slug: SLUG, tab: 'EXPLORE' } });
eq('报名后 occupiedCount=2', (le2.data?.groupingListPage?.groupings || []).find((g) => g.id === fiveId)?.occupiedCount, 2);

  });

  it('(e) block tree badges (mobile)', async () => {
/* ---------------- (e) Block tree badges (mobile) ---------------- */
const blocksQ = `query($slug: String!, $tab: GroupingTab!) {
  groupingListPage(slug: $slug, tab: $tab) {
    blocks(blocksVersion: 3, weekOffset: 0) {
      __typename
      ... on GroupingCardBlock { badgeText peopleText title }
    }
  }
}`;
const bk = await gql(blocksQ, { variables: { slug: SLUG, tab: 'EXPLORE' } });
const card = (bk.data?.groupingListPage?.blocks || []).find((b) => b.__typename === 'GroupingCardBlock' && b.title === '五人探索小队');
check('列表 Block 含五人探索卡片', !!card, JSON.stringify(bk.errors || bk.data).slice(0, 200));
eq('卡片 badgeText (zh)', card?.badgeText, '联机探索');
eq('卡片 peopleText', card?.peopleText, '2/5 人');

const detailQ = `query($slug: String, $id: ID!) {
  groupingDetailPage(slug: $slug, id: $id) {
    grouping { id type }
    typeShortCoopExplore
    blocks(blocksVersion: 3) {
      __typename
      ... on ChipRowBlock { chips }
      ... on SectionBlock { children { __typename ... on ChipRowBlock { chips } } }
    }
  }
}`;
const dt = await gql(detailQ, { variables: { slug: SLUG, id: fiveId } });
eq('详情 grouping.type', dt.data?.groupingDetailPage?.grouping?.type, 'EXPLORE');
eq('详情 typeShortCoopExplore (zh)', dt.data?.groupingDetailPage?.typeShortCoopExplore, '联机探索');
const chipTexts: string[] = [];
(function walk(bs: any) { for (const b of bs || []) { if (b.chips) chipTexts.push(...b.chips); if (b.children) walk(b.children); } })(dt.data?.groupingDetailPage?.blocks);
check('详情 chips 首项为联机探索短名', chipTexts[0] === '联机探索', JSON.stringify(chipTexts));

  });

  it('(f) departure-reminder copy', async () => {
/* ---------------- (f) Departure-reminder copy ---------------- */
const fiveRow = tables.events.find((e) => e.type === 'explore' && e.max_slots === 5);
try {
  const nowSec = Math.floor(Date.now() / 1000);
  const msg = await buildReminderMessage(db, { ...fiveRow }, SLUG, nowSec);
  check('提醒文案生成不报错', typeof msg.content === 'string' && msg.content.length > 0);
  const allText = [msg.content, ...((msg.embeds || []).flatMap((e: any) => [
    e.description || '', e.footer?.text || '',
    ...((e.fields || []).flatMap((f: any) => [f.name, f.value])),
  ]))].join('\n');
  check('提醒含名册 2/5', allText.includes('同行名册（2/5）'), allText.split('\n').slice(0, 6).join(' | '));
  check('提醒无副本行 (探索无副本)', !allText.includes('此行险地') && !allText.includes('副本：'));
} catch (e: any) {
  check('提醒文案生成不报错', false, String(e && e.message));
}

  });
});
