// 配装台验收: (1) 存储隔离 — 伪造会话 A/B, A 的装备/方案 B 不可见不可改;
// (2) 匿名无库; (3) 导入自动选入; (4) 方案快照服务端计算; (5) gear 文案矩阵
// (目录级 189×5 + GraphQL 级全字段双语解析); (6) GraphQL 计算冒烟与引擎直算一致。
import { yoga } from '../src/graphql.js';
import { CATALOG, translate } from '../src/i18n.js';
import * as GP from '../src/gearplanner.js';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') { if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); } }
function eq(name, got, want) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* ---------------- FakeDB (按 SQL 形态路由的内存表) ---------------- */
const tables = { user_gear_items: [], user_gear_builds: [] };
let rowId = 0;
function stmt(sql) {
  const q = {
    _b: [], bind(...a) { this._b = a; return this; },
    async first() { return null; },
    async all() {
      if (sql.includes('FROM user_gear_items')) {
        return { results: tables.user_gear_items.filter((r) => r.discord_id === String(q._b[0])) };
      }
      if (sql.includes('FROM user_gear_builds')) {
        return { results: tables.user_gear_builds.filter((r) => r.discord_id === String(q._b[0])) };
      }
      return { results: [] };
    },
    async run() {
      if (sql.startsWith('CREATE')) return { meta: { changes: 0 } };
      if (sql.startsWith('INSERT INTO user_gear_items')) {
        const row = { id: ++rowId, discord_id: String(q._b[0]), slot: q._b[1], name: q._b[2], payload: q._b[3], created_at: q._b[4] };
        tables.user_gear_items.push(row);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      if (sql.startsWith('INSERT INTO user_gear_builds')) {
        const row = { id: ++rowId, discord_id: String(q._b[0]), name: q._b[1], target_idx: q._b[2], payload: q._b[3], created_at: q._b[4] };
        tables.user_gear_builds.push(row);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      if (sql.startsWith('UPDATE user_gear_items')) {
        const [slot, name, payload, id, did] = q._b;
        const row = tables.user_gear_items.find((r) => r.id === id && r.discord_id === String(did));
        if (!row) return { meta: { changes: 0 } };
        row.slot = slot; row.name = name; row.payload = payload;
        return { meta: { changes: 1 } };
      }
      if (sql.startsWith('DELETE FROM user_gear_items')) {
        const [id, did] = q._b;
        const i = tables.user_gear_items.findIndex((r) => r.id === id && r.discord_id === String(did));
        if (i < 0) return { meta: { changes: 0 } };
        tables.user_gear_items.splice(i, 1);
        return { meta: { changes: 1 } };
      }
      if (sql.startsWith('DELETE FROM user_gear_builds')) {
        const [id, did] = q._b;
        const i = tables.user_gear_builds.findIndex((r) => r.id === id && r.discord_id === String(did));
        if (i < 0) return { meta: { changes: 0 } };
        tables.user_gear_builds.splice(i, 1);
        return { meta: { changes: 1 } };
      }
      return { meta: { changes: 0 } };
    },
  };
  return q;
}
const db = { prepare: (sql) => stmt(sql) };
const env = { DB: db };

async function gql(query, { user = null, locale = 'zh-CN', variables } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale, browserLocale: locale, executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}
const A = { discordId: 'user-a', name: 'A' };
const B = { discordId: 'user-b', name: 'B' };

/* ---------------- (1) 匿名无库 ---------------- */
let r = await gql('{ myGearItems { id } myGearBuilds { id } }');
eq('anon items empty', r.data.myGearItems, []);
eq('anon builds empty', r.data.myGearBuilds, []);
r = await gql('mutation { addGearItem(input: {slot: "武器", lines: [{key: "dawai", val: 80}]}) { ok errorCode } }');
eq('anon addGearItem rejected', [r.data.addGearItem.ok, r.data.addGearItem.errorCode], [false, 'loginRequired']);

/* ---------------- (2) A 建库 ---------------- */
const addItem = (user, input) => gql('mutation($i: GearItemCreateInput!) { addGearItem(input: $i) { ok item { id slot name schools warnings lines { key val } dingyin { name val } } errorCode } }', { user, variables: { i: input } });
r = await addItem(A, { slot: '武器', name: 'A剑', lines: [{ key: 'dawai', val: 85.2 }, { key: 'jin', val: 54 }], dingyin: { name: '外功穿透', val: 12 }, schools: ['鸣金-虹'] });
check('A add weapon ok', r.data.addGearItem.ok === true, JSON.stringify(r));
const aWeaponId = r.data.addGearItem.item.id;
r = await addItem(A, { slot: '冠胄', name: 'A冠', lines: [{ key: 'huiyi', val: 9.8 }, { key: 'shu_wx_da', val: 40 }] });
check('A add 冠胄 ok (无相非武器被剔+警告)', r.data.addGearItem.ok && r.data.addGearItem.item.lines.length === 1 && r.data.addGearItem.item.warnings.length === 1, JSON.stringify(r.data.addGearItem.item));
const aHatId = r.data.addGearItem.item.id;
r = await gql('{ myGearItems { id name } }', { user: A });
eq('A sees own 2 items', r.data.myGearItems.map((i) => i.id), [aWeaponId, aHatId]);

/* ---------------- (3) B 隔离 ---------------- */
r = await gql('{ myGearItems { id } myGearBuilds { id } }', { user: B });
eq('B items empty', r.data.myGearItems, []);
eq('B builds empty', r.data.myGearBuilds, []);
r = await gql('mutation($id: Int!, $i: GearItemCreateInput!) { updateGearItem(id: $id, input: $i) { ok errorCode } }', { user: B, variables: { id: aWeaponId, i: { slot: '武器', name: 'hacked', lines: [{ key: 'jin', val: 1 }] } } });
eq('B update A item rejected', [r.data.updateGearItem.ok, r.data.updateGearItem.errorCode], [false, 'gearNotFound']);
r = await gql('mutation($id: Int!) { deleteGearItem(id: $id) { ok errorCode } }', { user: B, variables: { id: aWeaponId } });
eq('B delete A item rejected', [r.data.deleteGearItem.ok, r.data.deleteGearItem.errorCode], [false, 'gearNotFound']);
r = await gql('{ myGearItems { id name } }', { user: A });
eq('A items untouched after B attacks', r.data.myGearItems.map((i) => i.name), ['A剑', 'A冠']);

/* ---------------- (4) 换设备 (同会话新请求) ---------------- */
r = await gql('{ myGearItems { id name } }', { user: { discordId: 'user-a', name: 'A' } });
eq('device switch: same items', r.data.myGearItems.map((i) => i.id), [aWeaponId, aHatId]);

/* ---------------- (5) A 更新自己的 (schools 省略保留) ---------------- */
r = await gql('mutation($id: Int!, $i: GearItemCreateInput!) { updateGearItem(id: $id, input: $i) { ok item { schools lines { key val } } } }', { user: A, variables: { id: aWeaponId, i: { slot: '武器', name: 'A剑', lines: [{ key: 'dawai', val: 90.6 }] } } });
eq('A update keeps schools', r.data.updateGearItem.item.schools, ['鸣金-虹']);

/* ---------------- (6) 批量导入 + 自动选入 ---------------- */
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

/* ---------------- (7) 方案: 服务端快照 + 隔离 ---------------- */
const loEntries = [{ slot: '主武器', gearId: aWeaponId }, { slot: '冠胄', gearId: aHatId }];
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
r = await gql('mutation($id: Int!) { deleteGearBuild(id: $id) { ok errorCode } }', { user: B, variables: { id: aBuild.id } });
eq('B delete A build rejected', [r.data.deleteGearBuild.ok, r.data.deleteGearBuild.errorCode], [false, 'gearNotFound']);
r = await gql('{ myGearBuilds { id name snapTotal } }', { user: A });
eq('A build survives', r.data.myGearBuilds.map((b) => b.id), [aBuild.id]);

/* ---------------- (8) gearPlan GraphQL 冒烟 == 引擎直算 ---------------- */
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

/* ---------------- (9) 参考数据 + 文案矩阵 ---------------- */
r = await gql('{ gradPage { gearBuilds { idx } gearAffixes { key } gearSlotsBig { slot } } }');
eq('gearBuilds = 25', r.data.gradPage.gearBuilds.length, 25);
eq('gearAffixes = 25', r.data.gradPage.gearAffixes.length, 25);
eq('gearSlotsBig = 7', r.data.gradPage.gearSlotsBig.length, 7);
const gearKeys = Object.keys(CATALOG.gear);
let matrixBad = 0;
for (const k of gearKeys) {
  for (const loc of ['zh-CN', 'en', 'es', 'fr', 'zh-TW']) {
    const t = translate('gear', k, loc);
    if (!t || t === 'gear.' + k) matrixBad++;
  }
}
eq('catalog matrix 189×5 complete', matrixBad, 0);
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

/* ---------------- (10) 粘贴解析冒烟 ---------------- */
r = await gql('mutation($t: String!) { gearParsePaste(text: $t) { mode unknown gears { slot lines { key val } } } }', {
  variables: { t: JSON.stringify({ equipments: [{ slot: '环', affixes: [{ name: '大外功', value: 90.6 }, { name: '气血', value: 100 }] }] }) },
});
eq('paste smoke', [r.data.gearParsePaste.gears.length, r.data.gearParsePaste.unknown], [1, 1]);

console.log(`GEAR HARNESS pass=${pass} fail=${fail}`);
fails.forEach((f) => console.log('FAIL', f));
process.exit(fail ? 1 : 0);
