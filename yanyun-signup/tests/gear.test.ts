// Gear-bench acceptance: (1) storage isolation — forged sessions A/B,
// B can neither see nor modify A's gear/builds; (2) anonymous = no
// library; (3) import auto-selects; (4) build snapshots computed
// server-side; (5) gear copy matrix (catalog-level, every gear key x5
// locales + GraphQL-level full-field bilingual resolution); (6) GraphQL
// compute smoke matches direct engine computation; (13) game-vocabulary
// delivery equals the historical constants + calcTiaolv id/name input
// equivalence.
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { CATALOG, translate } from '../src/domains/platform/i18n.ts';
import * as GP from '../src/domains/gear/gearplanner.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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

/* ---------------- FakeDB (in-memory tables routed by SQL shape) ---------------- */
const SECT_NAMES = ['鸣金·虹', '鸣金·影', '牵丝·玉', '牵丝·霖', '牵丝·翊', '裂石·威', '裂石·钧', '破竹·樽', '破竹·鸢', '破竹·尘', '破竹·风'];
const schoolRows = SECT_NAMES.map((name, i) => ({ name, slug: 'sect-' + i, short: '', family: name.split('·')[0], color: null, attr: '', talent_desc: null }));
const graduationRecipe = new Map([['鸣金·虹', '劲、劲'], ['鸣金·影', '劲、大属攻'], ['牵丝·玉', '劲、劲']]);
const graduationAffixMax = [
  { affix_key: 'power', max_value: 57.4 },
  { affix_key: 'class_atk_max', max_value: 51.4 },
  { affix_key: 'class_atk_min', max_value: 51.4 },
];
const tables = { user_gear_items: [], user_gear_builds: [], usage_counters: [], mint: new Map() };
function stmt(sql) {
  // Data-layer (Drizzle) SQL normalization: strip quotes (routing match only; assertions unchanged).
  sql = sql.replace(/"/g, '');
  const q = {
    _b: [], bind(...a) { this._b = a; return this; },
    async raw() { const res = await this.all(); return toRawRows(sql, (res && res.results) || []); },
    async first() {
      if (sql.includes('INSERT INTO id_mint_counters')) {
        const key = `${q._b[0]}|${q._b[1]}`;
        const seq = (tables.mint.get(key) || 0) + q._b[2];
        tables.mint.set(key, seq);
        return { seq };
      }
      return null;
    },
    async all() {
      if (sql.includes('INSERT INTO id_mint_counters')) {
        const key = `${q._b[0]}|${q._b[1]}`;
        const seq = (tables.mint.get(key) || 0) + q._b[2];
        tables.mint.set(key, seq);
        return { results: [{ seq }] };
      }
      if (sql.includes('COUNT(*)') && sql.includes('FROM user_gear_items')) {
        return { results: [{ n: tables.user_gear_items.filter((r) => r.user_id === Number(q._b[0])).length }] };
      }
      if (sql.includes('FROM user_gear_items')) {
        return { results: tables.user_gear_items.filter((r) => r.user_id === Number(q._b[0])) };
      }
      if (sql.includes('FROM usage_counters')) {
        const rows = tables.usage_counters.filter((r) => r.user_id === Number(q._b[0]) && r.metric === q._b[1] && r.day === q._b[2]);
        return { results: rows.map((r) => ({ count: r.count })) };
      }
      if (sql.includes('FROM user_gear_builds')) {
        return { results: tables.user_gear_builds.filter((r) => r.user_id === Number(q._b[0])) };
      }
      if (sql.includes('FROM school_bis')) {
        const recipe = graduationRecipe.get(q._b[0]);
        return { results: recipe ? [{ bis_json: JSON.stringify([['冠胄', recipe]]) }] : [] };
      }
      if (sql.includes('FROM affix_max')) {
        return { results: graduationAffixMax };
      }
      if (sql.includes('FROM schools')) {
        return { results: sql.includes('WHERE slug =') ? schoolRows.filter((row) => row.slug === q._b[0]) : schoolRows };
      }
      return { results: [] };
    },
    async run() {
      if (sql.startsWith('CREATE')) return { meta: { changes: 0 } };
      if (/^insert into user_gear_items.*from json_each/is.test(sql)) {
        const [userId, createdAt, encoded, , batchSize, capacity, , metric, day, dailyLimit] = q._b;
        const count = tables.user_gear_items.filter((row) => row.user_id === userId).length;
        const used = tables.usage_counters.find((row) => row.user_id === userId && row.metric === metric && row.day === day)?.count ?? 0;
        if (count + batchSize > capacity || used >= dailyLimit) return { meta: { changes: 0 } };
        const rows = JSON.parse(encoded);
        for (const [id, slot, name, payload] of rows) {
          tables.user_gear_items.push({ id, user_id: userId, slot, name, payload, created_at: createdAt });
        }
        return { meta: { changes: rows.length } };
      }
      if (sql.startsWith('INSERT INTO user_gear_items')) {
        const [, , , , , , userId, capacity] = q._b;
        if (tables.user_gear_items.filter((row) => row.user_id === userId).length >= capacity) return { meta: { changes: 0 } };
        const cols = /INSERT INTO user_gear_items \(([^)]+)\)/.exec(sql)[1].split(',').map((c) => c.trim());
        const row = {};
        cols.forEach((c, i) => { row[c] = q._b[i]; });
        tables.user_gear_items.push(row);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      if (/^insert into usage_counters/i.test(sql)) {
        const guarded = sql.includes('WHERE EXISTS');
        const [userId, metric, day, byOrNow, nowOrFirstId] = q._b;
        if (guarded && !tables.user_gear_items.some((row) => row.id === nowOrFirstId)) return { meta: { changes: 0 } };
        const by = guarded ? 1 : byOrNow;
        const now = guarded ? byOrNow : nowOrFirstId;
        const row = tables.usage_counters.find((r) => r.user_id === Number(userId) && r.metric === metric && r.day === day);
        if (row) { row.count += by; row.updated_at = now; } else { tables.usage_counters.push({ user_id: Number(userId), metric, day, count: by, updated_at: now }); }
        return { meta: { changes: 1 } };
      }
      if (sql.startsWith('INSERT INTO user_gear_builds')) {
        const cols = /INSERT INTO user_gear_builds \(([^)]+)\)/.exec(sql)[1].split(',').map((c) => c.trim());
        const row = {};
        cols.forEach((c, i) => { row[c] = q._b[i]; });
        tables.user_gear_builds.push(row);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      if (sql.startsWith('UPDATE user_gear_items')) {
        const [slot, name, payload, id, userId] = q._b;
        const row = tables.user_gear_items.find((r) => r.id === id && r.user_id === Number(userId));
        if (!row) return { meta: { changes: 0 } };
        row.slot = slot; row.name = name; row.payload = payload;
        return { meta: { changes: 1 } };
      }
      if (sql.startsWith('DELETE FROM user_gear_items')) {
        const [id, userId] = q._b;
        const i = tables.user_gear_items.findIndex((r) => r.id === id && r.user_id === Number(userId));
        if (i < 0) return { meta: { changes: 0 } };
        tables.user_gear_items.splice(i, 1);
        return { meta: { changes: 1 } };
      }
      if (sql.startsWith('DELETE FROM user_gear_builds')) {
        const [id, userId] = q._b;
        const i = tables.user_gear_builds.findIndex((r) => r.id === id && r.user_id === Number(userId));
        if (i < 0) return { meta: { changes: 0 } };
        tables.user_gear_builds.splice(i, 1);
        return { meta: { changes: 1 } };
      }
      return { meta: { changes: 0 } };
    },
  };
  return q;
}
const db = {
  prepare: (sql) => stmt(sql),
  async batch(statements) {
    const results = [];
    for (const statement of statements) results.push(await statement.run());
    return results;
  },
};
const env = { DB: db };

async function gql(query, { user = null, locale = 'zh-CN', variables } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale, browserLocale: locale, executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}
/* Typed-ID fixtures (0036): gear rows scope by the numeric user ID;
   the Discord ID stays on the viewer only as its Discord-space face. */
const UID = { A: 2030100001, B: 2030100002, C: 2030100003, D: 2030100004, E: 2030100005 };
const A = { userId: UID.A, discordId: 'user-a', name: 'A' };
const B = { userId: UID.B, discordId: 'user-b', name: 'B' };

let r: any;
let aWeaponId: any, aHatId: any;
let loEntries: any;
let C: any, D: any, E: any, bulkItems: any, importAs: any;
let addItem: any;

describe('gear', () => {
  it('(1) Anonymous = no library', async () => {
/* ---------------- (1) Anonymous = no library ---------------- */
r = await gql('{ myGearItems { id } myGearBuilds { id } }');
eq('anon items empty', r.data.myGearItems, []);
eq('anon builds empty', r.data.myGearBuilds, []);
r = await gql('mutation { addGearItem(input: {slot: "武器", lines: [{key: "dawai", val: 80}]}) { ok errorCode } }');
eq('anon addGearItem rejected', [r.data.addGearItem.ok, r.data.addGearItem.errorCode], [false, 'loginRequired']);
  });

  it('(2) A builds a library', async () => {
/* ---------------- (2) A builds a library ---------------- */
addItem = (user, input) => gql('mutation($i: GearItemCreateInput!) { addGearItem(input: $i) { ok item { id slot name schools warnings lines { key val } dingyin { name val } } errorCode } }', { user, variables: { i: input } });
r = await addItem(A, { slot: '武器', name: 'A剑', lines: [{ key: 'dawai', val: 85.2 }, { key: 'jin', val: 54 }], dingyin: { name: '外功穿透', val: 12 }, schools: ['鸣金-虹'] });
check('A add weapon ok', r.data.addGearItem.ok === true, JSON.stringify(r));
aWeaponId = r.data.addGearItem.item.id;
r = await addItem(A, { slot: '冠胄', name: 'A冠', lines: [{ key: 'huiyi', val: 9.8 }, { key: 'shu_wx_da', val: 40 }] });
check('A add 冠胄 ok (无相非武器被剔+警告)', r.data.addGearItem.ok && r.data.addGearItem.item.lines.length === 1 && r.data.addGearItem.item.warnings.length === 1, JSON.stringify(r.data.addGearItem.item));
aHatId = r.data.addGearItem.item.id;
r = await gql('{ myGearItems { id name } }', { user: A });
eq('A sees own 2 items', r.data.myGearItems.map((i) => i.id), [aWeaponId, aHatId]);
  });

  it('(3) B isolation', async () => {
/* ---------------- (3) B isolation ---------------- */
r = await gql('{ myGearItems { id } myGearBuilds { id } }', { user: B });
eq('B items empty', r.data.myGearItems, []);
eq('B builds empty', r.data.myGearBuilds, []);
r = await gql('mutation($id: ID!, $i: GearItemCreateInput!) { updateGearItem(id: $id, input: $i) { ok errorCode } }', { user: B, variables: { id: aWeaponId, i: { slot: '武器', name: 'hacked', lines: [{ key: 'jin', val: 1 }] } } });
eq('B update A item rejected', [r.data.updateGearItem.ok, r.data.updateGearItem.errorCode], [false, 'gearNotFound']);
r = await gql('mutation($id: ID!) { deleteGearItem(id: $id) { ok errorCode } }', { user: B, variables: { id: aWeaponId } });
eq('B delete A item rejected', [r.data.deleteGearItem.ok, r.data.deleteGearItem.errorCode], [false, 'gearNotFound']);
r = await gql('{ myGearItems { id name } }', { user: A });
eq('A items untouched after B attacks', r.data.myGearItems.map((i) => i.name), ['A剑', 'A冠']);
  });

  it('(4) Device switch (new request, same session)', async () => {
/* ---------------- (4) Device switch (new request, same session) ---------------- */
r = await gql('{ myGearItems { id name } }', { user: { userId: UID.A, discordId: 'user-a', name: 'A' } });
eq('device switch: same items', r.data.myGearItems.map((i) => i.id), [aWeaponId, aHatId]);
  });

  it('(5) A updates its own (omitted schools are kept)', async () => {
/* ---------------- (5) A updates its own (omitted schools are kept) ---------------- */
r = await gql('mutation($id: ID!, $i: GearItemCreateInput!) { updateGearItem(id: $id, input: $i) { ok item { schools lines { key val } } } }', { user: A, variables: { id: aWeaponId, i: { slot: '武器', name: 'A剑', lines: [{ key: 'dawai', val: 90.6 }] } } });
eq('A update keeps schools', r.data.updateGearItem.item.schools, ['鸣金-虹']);
  });

  it('(6) Bulk import + auto-select', async () => {
/* ---------------- (6) Bulk import + auto-select ---------------- */
r = await gql('mutation($items: [GearItemCreateInput!]!, $lo: [GearLoadoutEntryInput!]) { importGearItems(items: $items, loadout: $lo) { ok items { id slot } autoSelect { slot gearId } } }', {
  user: A,
  variables: {
    items: [
      { slot: '武器', name: ' imp1', lines: [{ key: 'dawai', val: 80 }] },
      { slot: '武器', name: 'imp2', lines: [{ key: 'dawai', val: 81 }] },
      { slot: '环', name: 'imp3', lines: [{ key: 'jin', val: 50 }] },
      { slot: '环', name: 'imp4', lines: [{ key: 'jin', val: 51 }] },
    ],
    lo: [],
  },
});
const imp = r.data.importGearItems;
check('import ok 4 items', imp.ok && imp.items.length === 4, JSON.stringify(imp));
eq('autoSelect first-per-slot', imp.autoSelect.map((e) => e.slot), ['主武器', '副武器', '环']);
eq('autoSelect ids match order', imp.autoSelect.map((e) => e.gearId), [imp.items[0].id, imp.items[1].id, imp.items[2].id]);
  });

  it('(7) Builds: server-side snapshot + isolation', async () => {
/* ---------------- (7) Builds: server-side snapshot + isolation ---------------- */
loEntries = [{ slot: '主武器', gearId: aWeaponId }, { slot: '冠胄', gearId: aHatId }];
r = await gql('mutation($i: GearBuildSaveInput!) { saveGearBuild(input: $i) { ok build { id name targetIdx buildLabel snapTotal loadout { slot gearId } } errorCode } }', {
  user: A,
  variables: { i: { name: 'A的方案', targetIdx: 0, loadout: loEntries, baseValues: Object.entries(GP.GP_BASE_PRESET).map(([key, val]) => ({ key, val })), xinfa: [], res: 1.85, bowKind: 'int', gradDingyinOn: true } },
});
check('A save build ok', r.data.saveGearBuild.ok === true, JSON.stringify(r));
const aBuild = r.data.saveGearBuild.build;
check('snapshot computed server-side', typeof aBuild.snapTotal === 'number' && aBuild.snapTotal > 0, 'snap=' + aBuild.snapTotal);
eq('build loadout persisted', aBuild.loadout, loEntries);
r = await gql('mutation($i: GearBuildSaveInput!) { saveGearBuild(input: $i) { ok errorCode } }', {
  user: B, variables: { i: { name: 'B偷A的', targetIdx: 0, loadout: loEntries } },
});
eq('B cannot build on A items (empty after filter)', [r.data.saveGearBuild.ok, r.data.saveGearBuild.errorCode], [false, 'gearEmptyBuild']);
r = await gql('{ myGearBuilds { id name } }', { user: B });
eq('B builds still empty', r.data.myGearBuilds, []);
r = await gql('mutation($id: ID!) { deleteGearBuild(id: $id) { ok errorCode } }', { user: B, variables: { id: aBuild.id } });
eq('B delete A build rejected', [r.data.deleteGearBuild.ok, r.data.deleteGearBuild.errorCode], [false, 'gearNotFound']);
r = await gql('{ myGearBuilds { id name snapTotal } }', { user: A });
eq('A build survives', r.data.myGearBuilds.map((b) => b.id), [aBuild.id]);
  });

  it('(8) gearPlan GraphQL smoke == direct engine computation', async () => {
/* ---------------- (8) gearPlan GraphQL smoke == direct engine computation ---------------- */
r = await gql('{ myGearItems { id slot name lines { key val } dingyin { name val } schools } }', { user: A });
const lib = r.data.myGearItems;
const planVars = {
  input: {
    targetIdx: 0, lib, loadout: loEntries,
    baseValues: Object.entries(GP.GP_BASE_PRESET).map(([key, val]) => ({ key, val })),
    xinfa: [], res: 1.85, extraAcc: 0, extraCrit: 0, extraInt: 0, bowKind: 'int', gradDingyinOn: true, sim: [],
  },
};
r = await gql('mutation($input: GearPlanInput!) { gearPlan(input: $input) { grad { total a b d } panel { yAcc dawai } gearEvals { id score } } }', { variables: planVars });
const direct = GP.gpPlan(lib, { '主武器': aWeaponId, '冠胄': aHatId }, {
  targetIdx: 0, baseValues: GP.GP_BASE_PRESET, xinfa: [],
  extras: { res: 1.85, acc: 0, crit: 0, int: 0, bowKind: 'int' }, sim: {}, gradDingyinOn: true,
});
check('GraphQL gearPlan no errors', !r.errors, JSON.stringify(r.errors || ''));
eq('GraphQL grad.total == engine', Math.round(r.data.gearPlan.grad.total * 1e12), Math.round(direct.grad.total * 1e12));
eq('GraphQL panel.dawai == engine', Math.round(r.data.gearPlan.panel.dawai * 1e9), Math.round(direct.panel.dawai * 1e9));
eq('GraphQL gearEvals == engine', r.data.gearPlan.gearEvals.map((e) => e.score), direct.gearEvals.map((e) => e.score));
  });

  it('(9) Reference data + copy matrix', async () => {
/* ---------------- (9) Reference data + copy matrix ---------------- */
r = await gql('{ gradPage { gearBuilds { idx } gearAffixes { key } gearSlotsBig { slot } } }');
eq('gearBuilds = 25', r.data.gradPage.gearBuilds.length, 25);
eq('gearAffixes = 25', r.data.gradPage.gearAffixes.length, 25);
eq('gearSlotsBig = 7', r.data.gradPage.gearSlotsBig.length, 7);
const gearKeys = Object.keys(CATALOG.gear);
let matrixBad = 0;
for (const k of gearKeys) {
  for (const loc of ['zh-CN', 'en', 'es', 'fr', 'zh-TW']) {
    const t = translate('gear_' + k, loc);
    if (!t || t === 'gear_' + k) matrixBad++;
  }
}
eq(`catalog matrix ${gearKeys.length}x5 complete`, matrixBad, 0);
const fieldNames = gearKeys.map((k) => 'gear' + k[0].toUpperCase() + k.slice(1));
for (const loc of ['zh-CN', 'en']) {
  const q = '{ gradPage { ' + fieldNames.join(' ') + ' } }';
  const rr = await gql(q, { locale: loc });
  const page = (rr.data || {}).gradPage || {};
  const badFields = fieldNames.filter((f) => typeof page[f] !== 'string' || !page[f]);
  check(`GraphQL gear texts resolve (${loc})`, !rr.errors && badFields.length === 0, (rr.errors ? JSON.stringify(rr.errors).slice(0, 200) : 'bad: ' + badFields.join(',')));
}
r = await gql('{ gradPage { gearBenchTitle } }', { locale: 'en' });
eq('en benchTitle translated', r.data.gradPage.gearBenchTitle, 'Gear Bench');
  });

  it('(10) Paste-parsing smoke', async () => {
/* ---------------- (10) Paste-parsing smoke ---------------- */
r = await gql('mutation($t: String!) { gearParsePaste(text: $t) { mode unknown gears { slot lines { key val } } } }', {
  variables: { t: JSON.stringify({ equipments: [{ slot: '环', affixes: [{ name: '大外功', value: 90.6 }, { name: '气血', value: 100 }] }] }) },
});
eq('paste smoke', [r.data.gearParsePaste.gears.length, r.data.gearParsePaste.unknown], [1, 1]);
  });

  it('(11) Sect graduation-affix builds (sectPage.gradBuilds)', async () => {
/* ---------------- (11) Sect graduation-affix builds (sectPage.gradBuilds) ---------------- */
// Pure-data integrity of the recipe table the page derives from.
eq('GP builds = 25', GP.GP_BUILDS.length, 25);
const sectCounts = {};
GP.GP_BUILD_SECT.forEach((s) => { sectCounts[s] = (sectCounts[s] || 0) + 1; });
const WANT_SECT_COUNTS = { '鸣金·虹': 1, '鸣金·影': 1, '牵丝·玉': 2, '牵丝·霖': 5, '牵丝·翊': 2, '裂石·威': 2, '裂石·钧': 4, '破竹·樽': 2, '破竹·鸢': 2, '破竹·尘': 2, '破竹·风': 2 };
check('GP_BUILD_SECT covers exactly the 11 sects', Object.keys(sectCounts).length === 11 && Object.entries(WANT_SECT_COUNTS).every(([k, v]) => sectCounts[k] === v), JSON.stringify(sectCounts));
check('every build target counts sum to totalBars = 40', GP.GP_BUILDS.every((b) => b.total === 40 && b.targets.reduce((a, t) => a + t.n, 0) === b.total));
const affixKeys = new Set(GP.GP_AFFIX.map((a) => a.key));
check('every non-flex target class resolves to GP_AFFIX or shugong', GP.GP_BUILDS.every((b) => b.targets.every((t) => t.flex || affixKeys.has(t.cls) || t.cls === 'shugong')));
eq('exactly one flex target across all builds', GP.GP_BUILDS.reduce((a, b) => a + b.targets.filter((t) => t.flex).length, 0), 1);
// GraphQL surface: sectPage with gradBuilds over fixture schools.
const GRAD_Q = '{ sectPage { sectTabAffixLabel sectAffixSourceText sects { name gradBuilds { name cat setName bowLabel dingyinName totalBars targets { label count maxValue cyValue flexLabels } } } } }';
r = await gql(GRAD_Q);
check('sectPage grad query has no errors', !r.errors, r.errors ? JSON.stringify(r.errors).slice(0, 200) : '');
const gsects = (r.data || {}).sectPage?.sects || [];
eq('sectPage returns 11 sects', gsects.length, 11);
check('every sect has at least one grad build', gsects.every((s) => s.gradBuilds.length >= 1));
eq('total grad builds across sects = 25', gsects.reduce((a, s) => a + s.gradBuilds.length, 0), 25);
eq('牵丝·霖 has 5 grad builds', gsects.find((s) => s.name === '牵丝·霖')?.gradBuilds.length, 5);
const hongBuild = gsects.find((s) => s.name === '鸣金·虹')?.gradBuilds[0] || { targets: [] };
const hongDawai = hongBuild.targets.find((t) => t.label === '大外功') || {};
eq('鸣金·虹 大外功 target = 12 lines, cap 90.6, resonance 85.2', [hongDawai.count, hongDawai.maxValue, hongDawai.cyValue], [12, 90.6, 85.2]);
const junFlex = (gsects.find((s) => s.name === '裂石·钧')?.gradBuilds || []).flatMap((b) => b.targets).find((t) => t.flexLabels.length) || {};
eq('裂石·钧 flex target labels + null caps', [junFlex.flexLabels, junFlex.maxValue, junFlex.cyValue], [['小外功', '属攻'], null, null]);
eq('zh affix tab label + source text', [r.data.sectPage.sectTabAffixLabel, r.data.sectPage.sectAffixSourceText.includes('100 阶')], ['毕业词缀', true]);
r = await gql(GRAD_Q, { locale: 'en' });
eq('en affix tab label', r.data.sectPage.sectTabAffixLabel, 'Graduation Affixes');
eq('en sect + build names localized', (() => { const s = (r.data.sectPage.sects || []).find((x) => x.name === 'Bellstrike - Splendor'); return s ? s.gradBuilds[0].name : null; })(), 'Bellstrike - Splendor');
  });

  it('(12) Library capacity (limits service: 200)', async () => {
/* ---------------- (12) Library capacity (limits service: 200) ---------------- */
C = { userId: UID.C, discordId: 'user-c', name: 'C' };
D = { userId: UID.D, discordId: 'user-d', name: 'D' };
E = { userId: UID.E, discordId: 'user-e', name: 'E' };
bulkItems = (n, tag) => Array.from({ length: n }, (_, i) => ({ slot: '环', name: tag + i, lines: [{ key: 'jin', val: 50 }] }));
importAs = (user, items, extra = {}) => gql('mutation($items: [GearItemCreateInput!]!, $lo: [GearLoadoutEntryInput!], $src: String, $ic: Int) { importGearItems(items: $items, loadout: $lo, source: $src, imageCount: $ic) { ok items { id } error errorCode } }', {
  user, variables: { items, lo: [], src: extra.source ?? null, ic: extra.imageCount ?? null },
});
r = await importAs(C, bulkItems(199, 'c'));
check('C import 199 ok', r.data.importGearItems.ok === true, JSON.stringify(r.data.importGearItems).slice(0, 200));
r = await addItem(C, { slot: '环', name: 'c200', lines: [{ key: 'jin', val: 50 }] });
check('C add 200th ok', r.data.addGearItem.ok === true, JSON.stringify(r.data.addGearItem).slice(0, 200));
r = await gql('mutation($i: GearItemCreateInput!) { addGearItem(input: $i) { ok error errorCode } }', { user: C, variables: { i: { slot: '环', name: 'c201', lines: [{ key: 'jin', val: 50 }] } } });
eq('C add 201st rejected at capacity', [r.data.addGearItem.ok, r.data.addGearItem.errorCode], [false, 'gearCapacityReached']);
check('capacity error copy carries the limit', (r.data.addGearItem.error || '').includes('200'), r.data.addGearItem.error);
r = await gql('{ gradPage { gearUsageCount gearUsageLimit gearUsageTemplate gearUsageNearLimitText } }', { user: C });
eq('usage fields at capacity', [r.data.gradPage.gearUsageCount, r.data.gradPage.gearUsageLimit], [200, 200]);
eq('usage template copy', r.data.gradPage.gearUsageTemplate, '已存 {n} / {limit} 件');
eq('near-limit hint copy', r.data.gradPage.gearUsageNearLimitText, '装备库快满了，导入新装备前先清理不用的装备');
r = await gql('{ gradPage { gearUsageCount gearUsageLimit } }');
eq('anon usage reads 0 with the free limit', [r.data.gradPage.gearUsageCount, r.data.gradPage.gearUsageLimit], [0, 200]);
  });

  it('(13) Import overflow: whole batch rejected', async () => {
/* ---------------- (13) Import overflow: whole batch rejected ---------------- */
r = await importAs(D, bulkItems(150, 'd'));
check('D import 150 ok', r.data.importGearItems.ok === true);
r = await importAs(D, bulkItems(60, 'x'));
eq('D import 60 more rejected as overflow', [r.data.importGearItems.ok, r.data.importGearItems.errorCode], [false, 'gearImportOverflow']);
check('overflow copy states batch, total and limit', ['60', '210', '200'].every((s) => (r.data.importGearItems.error || '').includes(s)), r.data.importGearItems.error);
r = await gql('{ myGearItems { id } }', { user: D });
eq('D still holds exactly 150 (no silent truncation)', r.data.myGearItems.length, 150);
eq('non-OCR imports never touch the OCR counter', tables.usage_counters.filter((x) => x.user_id === UID.D).length, 0);
  });

  it('(14) Batch-OCR metering: per-batch images + daily batches', async () => {
/* ---------------- (14) Batch-OCR metering: per-batch images + daily batches ---------------- */
r = await importAs(E, bulkItems(3, 'e'), { source: 'ocr', imageCount: 21 });
eq('OCR batch of 21 images rejected', [r.data.importGearItems.ok, r.data.importGearItems.errorCode], [false, 'gearOcrBatchTooLarge']);
check('too-large copy states limit and batch size', ['20', '21'].every((s) => (r.data.importGearItems.error || '').includes(s)), r.data.importGearItems.error);
r = await importAs(E, bulkItems(20, 'e'), { source: 'ocr', imageCount: 20 });
check('OCR batch of 20 images ok', r.data.importGearItems.ok === true, JSON.stringify(r.data.importGearItems).slice(0, 200));
eq('all 20 screenshots yield distinct stored gear IDs', new Set(r.data.importGearItems.items.map((item) => item.id)).size, 20);
for (let i = 0; i < 9; i++) {
  r = await importAs(E, bulkItems(1, 'e' + i), { source: 'ocr', imageCount: 1 });
  if (!r.data.importGearItems.ok) break;
}
check('OCR batches 2..10 of the day ok', r.data.importGearItems.ok === true, JSON.stringify(r.data.importGearItems).slice(0, 200));
eq('counter accumulated to 10 across batches', tables.usage_counters.filter((x) => x.user_id === UID.E).reduce((a, x) => a + x.count, 0), 10);
r = await importAs(E, bulkItems(1, 'eX'), { source: 'ocr', imageCount: 1 });
eq('11th OCR batch of the day rejected', [r.data.importGearItems.ok, r.data.importGearItems.errorCode], [false, 'gearOcrDailyLimit']);
check('daily-limit copy states the limit', (r.data.importGearItems.error || '').includes('10'), r.data.importGearItems.error);
// Day rollover: move today's counter rows to a past day — the quota is
// keyed by day, so today starts fresh without touching the old rows.
for (const row of tables.usage_counters) if (row.user_id === UID.E) row.day = '2000-01-01';
r = await importAs(E, bulkItems(1, 'eY'), { source: 'ocr', imageCount: 1 });
check('after day rollover OCR import ok again', r.data.importGearItems.ok === true, JSON.stringify(r.data.importGearItems).slice(0, 200));
  });

  it('(13) Game vocabulary delivery + calc equivalence', async () => {
/* ---------------- (13) Game vocabulary delivery + calc equivalence ----------------
 * The backend is the single vocabulary source (2026-10-27 ruling):
 * the delivered tables must equal the historical frontend constants
 * item-for-item (same order), and calcTiaolv must produce bit-identical
 * rows whether the closed vocabularies arrive as stable ids (current
 * clients) or as canonical names (legacy clients). */
const VOCAB_Q = '{ tiaolvPage { tlSuitOptions { id label isDefault } tlBowOptions { id label isDefault } tlWukuOptions { id label isDefault } tlTuneRows { row label } tlSectWuxue { sectSlug wuxue } } gradPage { gradSlots { id label icon } gradRates { key label cap } gearVocabRules { weaponSlot weaponPositions ocrStripPrefixes ocrDingyinMarker ocrDingyinFallbacks { needle name } } } }';
r = await gql(VOCAB_Q);
check('vocab query has no errors', !r.errors, r.errors ? JSON.stringify(r.errors).slice(0, 200) : '');
const tp = (r.data || {}).tiaolvPage || {};
eq('tlSuitOptions = historical SUITS (order, labels, default)', (tp.tlSuitOptions || []).map((o) => [o.id, o.label, o.isDefault]), [
  ['none', '无', false], ['yuangui', '燕归', false], ['hantian', '撼天', true], ['lianxing', '连星', false],
  ['caiyun', '裁云', false], ['duanyue', '断岳', false], ['yudou', '玉斗', false], ['shiyu', '时雨', false],
  ['yanliu', '烟柳', false], ['huanhua', '浣花', false], ['feixun', '飞隼', false],
]);
eq('tlBowOptions = historical BOWS (order, labels, default)', (tp.tlBowOptions || []).map((o) => [o.id, o.label, o.isDefault]), [
  ['none', '无', true], ['jingzhun', '精准', false], ['huixin', '会心', false], ['huiyi', '会意', false],
]);
eq('tlWukuOptions = historical wuku states', (tp.tlWukuOptions || []).map((o) => [o.id, o.label, o.isDefault]), [
  ['self', '本系', true], ['common', '通用', false],
]);
eq('tlTuneRows = historical TUNE_ROWS (22 rows, in order)', (tp.tlTuneRows || []).map((t) => [t.row, t.label]), [
  [3, '劲'], [4, '敏'], [5, '势'], [6, '最小外攻'], [7, '最大外攻'], [8, '精准'], [9, '会心'], [10, '会意'],
  [11, '最小鸣金'], [12, '最大鸣金'], [13, '最小裂石'], [14, '最大裂石'], [15, '最小牵丝'], [16, '最大牵丝'],
  [17, '最小破竹'], [18, '最大破竹'], [19, '最小无相'], [20, '最大无相'],
  [21, '武学增伤'], [22, '奇术增伤'], [23, '首领增伤'], [24, '全武增伤'],
]);
eq('tlSectWuxue = historical SCHOOL2WUXUE (10 sects, no qiansi-lin)', (tp.tlSectWuxue || []).map((t) => [t.sectSlug, t.wuxue]), [
  ['mingjin-hong', '鸣金虹'], ['mingjin-ying', '鸣金影'], ['lieshi-wei', '裂石威'], ['lieshi-jun', '裂石钧'],
  ['qiansi-yu', '牵丝玉'], ['qiansi-yi', '牵丝翊'], ['pozhu-zun', '破竹樽'], ['pozhu-yuan', '破竹鸢'],
  ['pozhu-chen', '破竹尘'], ['pozhu-feng', '破竹风'],
]);
const gp2 = (r.data || {}).gradPage || {};
eq('gradSlots = historical GradCalc SLOTS (order, labels, icons)', (gp2.gradSlots || []).map((s) => [s.id, s.label, s.icon]), [
  ['mainWeapon', '主武器', '⚔'], ['offWeapon', '副武器', '🗡'], ['head', '冠胄', '👑'], ['body', '胸甲', '🥋'],
  ['legs', '胫甲', '🦵'], ['wrist', '腕甲', '🧤'], ['ring', '环', '💍'], ['pendant', '佩', '📿'],
]);
eq('gradRates = historical RATE_CAPS', (gp2.gradRates || []).map((x) => [x.key, x.label, x.cap]), [
  ['precision', '精准', 100], ['crit', '会心', 80], ['affinity', '会意', 40],
]);
eq('gearVocabRules = weapon pool + OCR rules', gp2.gearVocabRules, {
  weaponSlot: '武器', weaponPositions: ['主武器', '副武器'],
  ocrStripPrefixes: ['最大', '最小'], ocrDingyinMarker: '定音',
  ocrDingyinFallbacks: [{ needle: '穿透', name: '外功穿透' }, { needle: '抗性', name: '外功抗性' }],
});
const TL_MUT = 'mutation($i: TiaolvInput!) { calcTiaolv(input: $i) { rows { key label base panel final } } }';
const TL_BASE = {
  innerSkills: ['金刚经', 'N/A', 'N/A', 'N/A'], wuxue: '破竹鸢', attrRequire: 492,
  tunes: [{ cell: 'K3', value: 10 }, { cell: 'L11', value: 5.5 }, { cell: 'M21', value: 2 }],
};
const byIds = await gql(TL_MUT, { variables: { i: { ...TL_BASE, suit: 'hantian', bowSkill: 'huixin', wuku: 'common' } } });
const byNames = await gql(TL_MUT, { variables: { i: { ...TL_BASE, suit: '撼天', bowSkill: '会心', wuku: '通用' } } });
check('calcTiaolv (ids) has no errors', !byIds.errors, byIds.errors ? JSON.stringify(byIds.errors).slice(0, 200) : '');
eq('calcTiaolv id-input rows == canonical-name-input rows (bit-identical)', byIds.data?.calcTiaolv?.rows, byNames.data?.calcTiaolv?.rows);
const byIdsNone = await gql(TL_MUT, { variables: { i: { ...TL_BASE, suit: 'none', bowSkill: null, wuku: 'self' } } });
const byNamesNone = await gql(TL_MUT, { variables: { i: { ...TL_BASE, suit: '无', bowSkill: null, wuku: '本系' } } });
eq('calcTiaolv none/self rows == 无/本系 rows', byIdsNone.data?.calcTiaolv?.rows, byNamesNone.data?.calcTiaolv?.rows);
  });

  it('counts max elemental attack with power for both Mingjin builds in the legacy calculator', async () => {
    const query = 'mutation($input: GraduationInput!) { calcGraduation(input: $input) { countScore valueScore } }';
    const maxElemental = { key: 'class_atk_max', value: 25.7, resonance: false };
    const power = { key: 'power', value: 28.7, resonance: false };
    const calc = async (sectSlug: string, affixes: typeof maxElemental[]) => {
      const response = await gql(query, { variables: { input: { sectSlug, items: [{ slot: 'head', affixes }] } } });
      expect(response.errors).toBeUndefined();
      return response.data.calcGraduation;
    };

    expect(await calc('sect-0', [maxElemental])).toEqual({ countScore: 50, valueScore: 53 });
    expect(await calc('sect-1', [maxElemental])).toEqual({ countScore: 50, valueScore: 53 });
    expect(await calc('sect-1', [power, maxElemental])).toEqual({ countScore: 100, valueScore: 53 });
    expect(await calc('sect-0', [{ ...maxElemental, key: 'class_atk_min' }])).toEqual({ countScore: 0, valueScore: 53 });
    expect(await calc('sect-2', [maxElemental])).toEqual({ countScore: 0, valueScore: 53 });
  });

  it('offers valid, localized attunements for equipment slots and saves their canonical names', async () => {
    const locale = 'en';
    const response = await gql('{ gradPage { gearDingyinRightMax gearDingyinGroups { slots options { name label max } } } }', { locale });
    expect(response.errors).toBeUndefined();
    const [offense, armor] = response.data.gradPage.gearDingyinGroups;
    expect(offense.slots).toEqual(['武器', '主武器', '副武器', '环', '佩']);
    expect(offense.options).toEqual([
      { name: '外功穿透', label: 'Physical Penetration', max: 12.8 },
      { name: '外功抗性', label: 'Physical Resistance', max: 12.8 },
      { name: '无相穿透', label: 'Formless Penetration', max: 15.2 },
    ]);
    expect(armor.slots).toEqual(['冠胄', '胸甲', '胫甲', '腕甲']);
    expect(response.data.gradPage.gearDingyinRightMax).toBe(7);
    expect(armor.options).toContainEqual({ name: '明川药典·治疗技增疗', label: 'Panacea Fan - Healing Skill Boost', max: 7 });
    const armorNames = armor.options.map((option) => option.name);
    expect(new Set(armorNames).size).toBe(armorNames.length);
    for (const { name, max } of armor.options) {
      expect(max).toBe(7);
      expect(GP.gpDingyinMax(name, '冠胄')).toBe(max);
      expect(GP.gpDingyinMax(name, '武器')).toBeNull();
    }

    const add = 'mutation($input: GearItemCreateInput!) { addGearItem(input: $input) { item { id } } }';
    const update = 'mutation($id: ID!, $input: GearItemCreateInput!) { updateGearItem(id: $id, input: $input) { ok item { dingyin { name val } } } }';
    const expected = [];
    for (const slot of ['武器', '环', '佩', ...armor.slots]) {
      const option = (offense.slots.includes(slot) ? offense : armor).options[0];
      const input = { slot, lines: [] };
      const created = await gql(add, { user: B, locale, variables: { input } });
      const id = created.data.addGearItem.item.id;
      const dingyin = { name: option.name, val: option.max };
      const updated = await gql(update, { user: B, locale, variables: { id, input: { ...input, dingyin } } });
      expect(updated.data.updateGearItem).toEqual({ ok: true, item: { dingyin } });
      expected.push({ id, slot, dingyin });
    }
    const stored = await gql('{ myGearItems { id slot dingyin { name val } } }', { user: B, locale });
    expect(stored.data.myGearItems).toEqual(expect.arrayContaining(expected));
  });

  it('treats 7 as a full martial attunement roll when scoring graduation', () => {
    const name = '无名剑法·蓄力技增伤';
    const panel = { dingyin: [{ slot: '冠胄', name, val: 7 }, { slot: '胸甲', name, val: 6 }] };
    const result = GP.gpDingyinScore(panel, GP.gpBuild(0));

    expect(result.rows).toEqual(expect.arrayContaining([
      expect.objectContaining({ slot: '冠胄', max: 7, score: 1 }),
      expect.objectContaining({ slot: '胸甲', max: 7, score: 6 / 7 }),
    ]));
  });

  it('calculates and saves the graduation snapshot for the complete Mingjin Hong loadout', async () => {
    const user = { userId: 2030100006, discordId: 'user-f', name: 'F' };
    const equipment: [string, [string, number][]][] = [
      ['主武器', [['dawai', 85.2], ['dawai', 85.2], ['shi', 54], ['jin', 54], ['wuqizeng', 7]]],
      ['副武器', [['dawai', 85.2], ['dawai', 85.2], ['shi', 54], ['jin', 54], ['huiyi', 4.9]]],
      ['环', [['dawai', 85.2], ['dawai', 85.2], ['huiyi', 4.9], ['quanwu', 3.4], ['shi', 54]]],
      ['佩', [['dawai', 85.2], ['dawai', 85.2], ['quanwu', 3.4], ['jin', 48.3], ['shi', 54]]],
      ['冠胄', [['huiyi', 4.9], ['huiyi', 4.9], ['dawai', 85.2], ['jin', 54], ['shi', 54]]],
      ['胸甲', [['huiyi', 4.9], ['huiyi', 4.6], ['shu_mj_da', 48.3], ['shi', 54], ['dawai', 85.2]]],
      ['胫甲', [['jin', 54], ['jin', 54], ['dawai', 85.2], ['shi', 54], ['shouling', 3.6]]],
      ['腕甲', [['jin', 54], ['jin', 54], ['shu_mj_da', 48.3], ['shouling', 3.6], ['dawai', 85.2]]],
    ];
    const items = equipment.map(([position, affixes], index) => ({
      slot: GP.gpGearSlotOf(position),
      lines: affixes.map(([key, val]) => ({ key, val })),
      dingyin: index < 4 ? { name: '外功穿透', val: 12.8 } : { name: '无名剑法·蓄力技增伤', val: 7 },
    }));
    const imported = await gql('mutation($items: [GearItemCreateInput!]!) { importGearItems(items: $items) { ok items { id slot lines { key val } dingyin { name val } } } }', { user, variables: { items } });
    expect(imported.data.importGearItems.ok).toBe(true);
    const lib = imported.data.importGearItems.items;
    const loadout = equipment.map(([slot], index) => ({ slot, gearId: lib[index].id }));
    const input = { targetIdx: 0, loadout, res: 1.85, gradDingyinOn: true };
    const planned = await gql('mutation($input: GearPlanInput!) { gearPlan(input: $input) { realGrad { total a b d got totalBars } loanGrad { total } } }', { variables: { input: { ...input, lib } } });
    const { realGrad, loanGrad } = planned.data.gearPlan;
    const valueScore = (38 + 48.3 / 54 + 4.6 / 4.9) / 40;
    const total = (40 + 24 * valueScore + 20) / 84;
    expect(realGrad).toMatchObject({ a: 1, d: 1, got: 40, totalBars: 40 });
    expect(realGrad.b).toBeCloseTo(valueScore, 12);
    expect(realGrad.total).toBeCloseTo(total, 12);
    expect(loanGrad.total).toBeCloseTo(1, 12);

    const fields = 'id snapTotal snapA snapB snapD snapLoan';
    const saved = await gql(`mutation($input: GearBuildSaveInput!) { saveGearBuild(input: $input) { ok build { ${fields} } } }`, { user, variables: { input: { ...input, name: '鸣金·虹' } } });
    expect(saved.data.saveGearBuild.ok).toBe(true);
    const build = saved.data.saveGearBuild.build;
    expect(build).toMatchObject({ snapTotal: realGrad.total, snapA: realGrad.a, snapB: realGrad.b, snapD: realGrad.d, snapLoan: loanGrad.total });
    const read = await gql(`{ myGearBuilds { ${fields} } }`, { user });
    expect(read.data.myGearBuilds).toEqual([build]);
  });

});
