// Tower (TOWER) category acceptance: real yoga + graphql.ts resolvers
// + FakeDB (in-memory tables).
// Rule: Tower is a new grouping type whose rules mirror ACTIVITY
// (no dungeon, always 10 seats).
// Coverage: schema enums/fields -> createGrouping server rules (a
// dungeonId is ignored even when passed) -> list filtering (tab
// isolation) -> joinGrouping signup -> list/detail Block badges ->
// copy fields in 5 locales -> departure-reminder copy
// (buildReminderMessage, real function) -> REST draft rules.
import { yoga } from '../src/graphql.ts';
import { typeDefs } from '../src/graphql-schema.ts';
import { buildReminderMessage } from '../src/domains/groupings/reminder.ts';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
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
const SLUG = 'towertest';
const tables = {
  events: [], signups: [], guild_members: [],
};
const tenants = [{ slug: SLUG, guild_name: '爬塔测试百业', slogan: '', announcement: '' }];
const settings = new Map([[`${SLUG}|discord_guild_id`, 'G123']]);
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
          const gid = Number(b[0]);
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

const leader = { discordId: 'U1', name: '塔主', guilds: ['G123'] };
const member = { discordId: 'U2', name: '队员', guilds: ['G123'] };

async function gql(query, { user = leader, locale = 'zh-CN', variables } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale, browserLocale: locale, executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

/* ---------------- (a) schema ---------------- */
check('schema: GroupingTab 含 TOWER', /enum GroupingTab \{[^}]*TOWER/.test(typeDefs));
check('schema: GroupingType 含 TOWER', /enum GroupingType \{[^}]*TOWER/.test(typeDefs));
for (const f of ['tabTowerLabel', 'typeShortTower', 'formTypeTowerLabel', 'formHintTower']) {
  check('schema: 字段 ' + f, typeDefs.includes(f + ': String!'));
}

/* ---------------- (b) Creation: Tower mirrors the ten-seat shape ---------------- */
const startsAt = String(Math.floor(Date.now() / 1000) + 3600);
const createMut = `mutation($input: CreateGroupingInput!) {
  createGrouping(input: $input) { ok error grouping { id title type maxSlots dungeon { name } } }
}`;
const c1 = await gql(createMut, {
  variables: {
    input: {
      slug: SLUG, title: '周末爬塔冲层', type: 'TOWER', startsAt, dungeonId: '7',
      seats: [{ nickname: '塔主', weapon: '破竹·樽' }],
    },
  },
});
check('create TOWER ok', c1.data?.createGrouping?.ok === true, JSON.stringify(c1.errors || c1.data));
eq('create TOWER grouping.type', c1.data?.createGrouping?.grouping?.type, 'TOWER');
eq('create TOWER maxSlots 恒 10 (带 5 人副本 id 也不变)', c1.data?.createGrouping?.grouping?.maxSlots, 10);
eq('create TOWER dungeon 被忽略', c1.data?.createGrouping?.grouping?.dungeon, null);
const towerRow = tables.events.find((e) => e.type === 'tower');
check('DB 行 type=tower', !!towerRow);
eq('DB 行 dungeon 为空', towerRow?.dungeon, '');
eq('DB 行 max_slots=10', towerRow?.max_slots, 10);
const towerId = c1.data?.createGrouping?.grouping?.id;

// Control: ACTIVITY with a dungeonId is likewise ignored (existing behavior, no regression).
const c2 = await gql(createMut, {
  variables: { input: { slug: SLUG, title: '对照双十车', type: 'ACTIVITY', startsAt, dungeonId: '7', seats: [] } },
});
check('create ACTIVITY 对照 ok', c2.data?.createGrouping?.ok === true);
eq('ACTIVITY maxSlots 仍 10', c2.data?.createGrouping?.grouping?.maxSlots, 10);

/* ---------------- (c) List filtering and copy ---------------- */
const listQ = `query($slug: String!, $tab: GroupingTab!) {
  groupingListPage(slug: $slug, tab: $tab) {
    tabTowerLabel typeShortTower formTypeTowerLabel formHintTower formTitleTemplate
    groupings { id title type maxSlots occupiedCount }
  }
}`;
const lt = await gql(listQ, { variables: { slug: SLUG, tab: 'TOWER' } });
eq('列表页 tabTowerLabel (zh)', lt.data?.groupingListPage?.tabTowerLabel, '爬塔');
eq('列表页 typeShortTower (zh)', lt.data?.groupingListPage?.typeShortTower, '爬塔');
eq('列表页 formTypeTowerLabel (zh)', lt.data?.groupingListPage?.formTypeTowerLabel, '爬塔');
check('列表页 formHintTower (zh) 含固定 10 人口径', (lt.data?.groupingListPage?.formHintTower || '').includes('固定 10 人'), lt.data?.groupingListPage?.formHintTower);
const towerInList = (lt.data?.groupingListPage?.groupings || []).find((g) => g.id === towerId);
check('TOWER tab 列表含爬塔车', !!towerInList);
eq('列表中爬塔车 type', towerInList?.type, 'TOWER');

const la = await gql(listQ, { variables: { slug: SLUG, tab: 'ACTIVITY' } });
check('ACTIVITY tab 不含爬塔车', !(la.data?.groupingListPage?.groupings || []).some((g) => g.id === towerId));

// Default title template: {nickname}'s {type} squad + typeShortTower -> X's Tower squad.
const tpl = lt.data?.groupingListPage?.formTitleTemplate || '';
eq('默认标题拼装', tpl.replace('{nickname}', '塔主').replace('{type}', lt.data?.groupingListPage?.typeShortTower || ''), '塔主的爬塔车队');

// English copy (official-style renderings, not game data names).
const ltEn = await gql(listQ, { variables: { slug: SLUG, tab: 'TOWER' }, locale: 'en' });
eq('tabTowerLabel (en)', ltEn.data?.groupingListPage?.tabTowerLabel, 'Tower Climb');
eq('typeShortTower (en)', ltEn.data?.groupingListPage?.typeShortTower, 'Tower');

/* ---------------- (d) Signup ---------------- */
const joinMut = `mutation($input: JoinGroupingInput!) {
  joinGrouping(input: $input) { ok error seats { nickname occupied } }
}`;
const j1 = await gql(joinMut, {
  user: member,
  variables: { input: { groupingId: towerId, nickname: '队员', weapon: '牵丝·霖', seatIndex: 1 } },
});
check('joinGrouping 爬塔车 ok', j1.data?.joinGrouping?.ok === true, JSON.stringify(j1.errors || j1.data));
const lt2 = await gql(listQ, { variables: { slug: SLUG, tab: 'TOWER' } });
eq('报名后 occupiedCount=2', (lt2.data?.groupingListPage?.groupings || []).find((g) => g.id === towerId)?.occupiedCount, 2);

/* ---------------- (e) Block tree badges (mobile) ---------------- */
const blocksQ = `query($slug: String!, $tab: GroupingTab!) {
  groupingListPage(slug: $slug, tab: $tab) {
    blocks(blocksVersion: 3, weekOffset: 0) {
      __typename
      ... on GroupingCardBlock { badgeText peopleText title }
    }
  }
}`;
const bk = await gql(blocksQ, { variables: { slug: SLUG, tab: 'TOWER' } });
const card = (bk.data?.groupingListPage?.blocks || []).find((b) => b.__typename === 'GroupingCardBlock');
check('列表 Block 含爬塔卡片', !!card, JSON.stringify(bk.errors || bk.data).slice(0, 200));
eq('卡片 badgeText (zh)', card?.badgeText, '爬塔');
eq('卡片 peopleText', card?.peopleText, '2/10 人');

const detailQ = `query($slug: String, $id: ID!) {
  groupingDetailPage(slug: $slug, id: $id) {
    grouping { id type }
    typeShortTower
    blocks(blocksVersion: 3) {
      __typename
      ... on ChipRowBlock { chips }
      ... on SectionBlock { children { __typename ... on ChipRowBlock { chips } } }
    }
  }
}`;
const dt = await gql(detailQ, { variables: { slug: SLUG, id: towerId } });
eq('详情 grouping.type', dt.data?.groupingDetailPage?.grouping?.type, 'TOWER');
const chipTexts = [];
(function walk(bs) { for (const b of bs || []) { if (b.chips) chipTexts.push(...b.chips); if (b.children) walk(b.children); } })(dt.data?.groupingDetailPage?.blocks);
check('详情 chips 首项为爬塔短名', chipTexts[0] === '爬塔', JSON.stringify(chipTexts));

/* ---------------- (f) Departure-reminder copy ---------------- */
try {
  const nowSec = Math.floor(Date.now() / 1000);
  const msg = await buildReminderMessage(db, { ...towerRow }, SLUG, nowSec);
  check('提醒文案生成不报错', typeof msg.content === 'string' && msg.content.length > 0);
  // 2026-10-26 embed redesign: the roster is a card field (traveling roster); check against the full-payload text.
  const allText = [msg.content, ...((msg.embeds || []).flatMap((e) => [
    e.description || '', e.footer?.text || '',
    ...((e.fields || []).flatMap((f) => [f.name, f.value])),
  ]))].join('\n');
  check('提醒含名册 2/10', allText.includes('同行名册（2/10）'), allText.split('\n').slice(0, 6).join(' | '));
  check('提醒无副本行 (爬塔无副本)', !allText.includes('此行险地') && !allText.includes('副本：'));
} catch (e) {
  check('提醒文案生成不报错', false, String(e && e.message));
}

/* ---------------- (g) REST draft rules (real worker fetch) ---------------- */
try {
  const worker = (await import('../src/worker.ts')).default;
  const before = tables.events.length;
  const res = await worker.fetch(new Request(`http://local/api/${SLUG}/cars/draft`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'tower' }),
  }), env, { waitUntil() {} });
  const j = await res.json();
  const draft = tables.events.slice(before).find((e) => e.status === 'draft');
  check('REST 草稿创建 ok', j.ok === true, JSON.stringify(j).slice(0, 120));
  eq('REST 草稿 type=tower', draft?.type, 'tower');
  eq('REST 草稿 max_slots=10', draft?.max_slots, 10);
} catch (e) {
  check('REST 草稿创建 ok', false, String(e && e.message));
}

if (unknownSql.size) console.log('\n[FakeDB 未路由 SQL — 已走默认空结果]\n' + [...unknownSql].join('\n'));
console.log(`\n== tower harness: ${pass} pass, ${fail} fail ==`);
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
