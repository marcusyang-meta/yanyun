// Profile ↔ 配装台装备库双落点验收 (jsdom, 真实组件 + 真实 relay + 本地后端):
//  A) 打开 Profile: 标题为 Profile (非 Settings) + 身份区 (车头甲) +
//     「My gear library」/「My builds」两区出现
//  B) 在 Profile 里粘贴导入示例套 -> 对话框内卡片出现
//  C) 关闭对话框 -> 配装台 (同页已挂载) 立即可见同一件 (关时重取)
//  D) 在配装台粘贴导入另一件 -> 重新打开 Profile 立即可见 (开时重取)
//  E) grep 面: 对话框全文不得出现 Settings/设置 字样于该表面
//  F) Profile 内「存为方案」: 存已存工作态的当前搭配 -> 落库 loadout 与
//     工作态逐位一致 -> 配装台方案表同步出现 -> 卸空后载入逐位复原
//  G) 空态 (全新窗口无已存搭配): 存按钮禁用 + 指引文案 + 不产生方案
//  H) 方案按流派分组: 乱序跨 ≥3 流派播种 -> 双表面组头按后端目录流派序、
//     计数正确、每行归组正确、组内载入复原
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DIST = path.join(DIR, 'dist');
const JWT = fs.readFileSync('/tmp/jwt-a.txt', 'utf8').trim();
const WORKER = 'http://localhost:8799';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

const gql = async (query, variables) => {
  const r = await fetch(WORKER + '/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `yy_session=${JWT}` },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
};

// 夹具: 与界面「填入示例」同构的粘贴 JSON (数据从后端参考表拼, 不猜名)
const ref = (await gql('{ gradPage { gearDemoKit { slot name keys dingyinName dingyinVal } gearAffixes { key label cy } } }')).data.gradPage;
const cyOf = new Map(ref.gearAffixes.map((a) => [a.key, a]));
const kitJson = (renameFirst) => JSON.stringify({
  equipments: ref.gearDemoKit.map((g, i) => ({
    slot: g.slot,
    name: i === 0 && renameFirst ? renameFirst : g.name,
    affixes: g.keys.map((k) => ({ name: cyOf.get(k)?.label || k, value: cyOf.get(k)?.cy ?? 0 })),
    ...(g.dingyinName ? { dingyin: { name: g.dingyinName, val: g.dingyinVal } } : {}),
  })),
});
const markerA = ref.gearDemoKit[0].name;
const markerB = 'BenchLinkSword';

const server = http.createServer(async (req, res) => {
  if (req.url === '/graphql' && req.method === 'POST') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const body = Buffer.concat(chunks).toString('utf8');
      const r = await fetch(WORKER + '/graphql', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: `yy_session=${JWT}`, 'x-locale': req.headers['x-locale'] || '' },
        body,
      });
      res.writeHead(r.status, { 'content-type': 'application/json' });
      res.end(Buffer.from(await r.arrayBuffer()));
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/page.html';
  const file = path.join(DIST, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(18752, r));

const results = [];
const check = (name, ok, extra = '') => {
  results.push([ok, name, extra]);
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (extra ? ' — ' + extra : ''));
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function openPage() {
  const vc = new VirtualConsole();
  vc.on('jsdomError', () => undefined);
  const dom = new JSDOM(fs.readFileSync(path.join(DIST, 'page.html'), 'utf8'), {
    url: 'http://localhost:18752/page.html',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      try {
        Object.defineProperty(window.navigator, 'language', { value: 'en-US', configurable: true });
        Object.defineProperty(window.navigator, 'languages', { value: ['en-US', 'en'], configurable: true });
      } catch { /* 忽略 */ }
      window.fetch = (input, init) => {
        const url = typeof input === 'string' && input.startsWith('/') ? window.location.origin + input : input;
        return fetch(url, init);
      };
    },
  });
  const { window } = dom;
  await new Promise((r) => { window.addEventListener('load', r); setTimeout(r, 1500); });
  const doc = window.document;
  async function waitFor(fn, label, timeout = 25000) {
    const t0 = Date.now();
    for (;;) {
      try { if (fn()) return Date.now() - t0; } catch { /* retry */ }
      if (Date.now() - t0 > timeout) {
        throw new Error('TIMEOUT: ' + label + ' | body: ' + (doc.body.textContent || '').slice(0, 400));
      }
      await sleep(100);
    }
  }
  const click = (el) => el && el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  const btnByText = (scope, text) => [...scope.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === text);
  const setValue = (el, v) => {
    const proto = el instanceof window.HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new window.Event('input', { bubbles: true }));
  };
  return { window, doc, waitFor, click, btnByText, setValue };
}

const page = await openPage();
const { doc } = page;
const benchZone = () => doc.querySelector('[data-testid="bench-zone"]');
const dialog = () => doc.querySelector('.yy-modal-panel');
try {
  await page.waitFor(() => (benchZone()?.textContent || '').includes('Gear library'), 'bench library renders');
  check('配装台装备库区已渲染', true);

  /* ---- A) 打开 Profile ---- */
  page.click(page.btnByText(doc, 'Profile'));
  await page.waitFor(() => !!dialog(), 'profile dialog opens');
  await page.waitFor(() => (dialog()?.textContent || '').includes('My gear library'), 'profile gear section');
  const dtext = dialog()?.textContent || '';
  check('对话框含身份名 车头甲', dtext.includes('车头甲'));
  check('对话框含「My gear library」', dtext.includes('My gear library'));
  check('对话框含「My builds」', dtext.includes('My builds'));
  check('对话框无 Settings 字样 (该表面已改名)', !dtext.includes('Settings'));
  check('用户条入口为 Profile (无 Settings 按钮)', !page.btnByText(doc, 'Settings'));

  /* ---- B) Profile 内导入 ---- */
  const cardHas = (scope, name) => !!scope && [...scope.querySelectorAll('b')].some((b) => (b.textContent || '').includes(name));
  page.setValue(dialog().querySelector('textarea'), kitJson(null));
  page.click(page.btnByText(dialog(), 'Parse & import'));
  await page.waitFor(() => cardHas(dialog(), markerA), 'profile import visible', 30000);
  check('Profile 内导入后卡片可见', true, markerA);

  /* ---- C) 关闭 -> 配装台可见 ---- */
  page.click(doc.querySelector('.yy-modal-overlay'));
  await page.waitFor(() => !dialog(), 'dialog closed');
  await page.waitFor(() => cardHas(benchZone(), markerA), 'bench sees profile import');
  check('关闭 Profile 后配装台立即可见同一件', true);

  /* ---- D) 配装台导入 -> 重开 Profile 可见 ---- */
  page.setValue(benchZone().querySelector('textarea'), kitJson(markerB));
  page.click(page.btnByText(benchZone(), 'Parse & import'));
  await page.waitFor(() => cardHas(benchZone(), markerB), 'bench import visible', 30000);
  check('配装台内导入后卡片可见', true, markerB);
  page.click(page.btnByText(doc, 'Profile'));
  await page.waitFor(() => !!dialog(), 'profile reopens');
  await page.waitFor(() => cardHas(dialog(), markerB), 'profile sees bench import');
  check('重开 Profile 立即可见配装台导入的件', true);

  /* ---- F) Profile 内「存为方案」: 存已存工作态的当前搭配 (配装台导入
   * 自动选入的那套, 8 个部位), 与配装台存的方案同形状 ---- */
  const sortObj = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)));
  const wsOf = (w) => JSON.parse(w.localStorage.getItem('yy-gear-planner-v1') || '{}');
  const expectedLo = wsOf(page.window).loadout || {};
  check('已存工作态搭配为完整 8 件 (两轮导入自动选入)', Object.keys(expectedLo).length === 8, `slots=${Object.keys(expectedLo).length}`);
  const dlgSaveBtn = () => page.btnByText(dialog(), 'Save as build');
  check('Profile 存按钮在有搭配时可用', !!dlgSaveBtn() && !dlgSaveBtn().disabled);
  check('有搭配时不显示「先拼一套」指引', !(dialog()?.textContent || '').includes('gear bench first'));
  const nameInput = [...dialog().querySelectorAll('input')].find((i) => (i.placeholder || '').startsWith('Build'));
  page.setValue(nameInput, 'ProfileBuilt');
  page.click(dlgSaveBtn());
  await page.waitFor(() => (dialog()?.textContent || '').includes('ProfileBuilt'), 'profile build saved', 30000);
  check('Profile 内保存后方案出现在对话框方案表', true);
  const buildsNow = (await gql('{ myGearBuilds { id name targetIdx loadout { slot gearId } } }')).data.myGearBuilds;
  const saved = buildsNow.find((b) => b.name === 'ProfileBuilt');
  check('服务端落库了 ProfileBuilt', !!saved);
  const savedLo = saved ? Object.fromEntries(saved.loadout.map((e) => [e.slot, e.gearId])) : {};
  check('落库 loadout 与已存工作态搭配逐位一致', JSON.stringify(sortObj(savedLo)) === JSON.stringify(sortObj(expectedLo)),
    `saved=${JSON.stringify(savedLo)} work=${JSON.stringify(expectedLo)}`);
  check('落库 targetIdx 与工作态一致', !!saved && saved.targetIdx === (wsOf(page.window).targetIdx ?? 0));

  /* ---- 关对话框 -> 配装台方案表同步出现 -> 卸空后载入逐位复原 ---- */
  page.click(doc.querySelector('.yy-modal-overlay'));
  await page.waitFor(() => !dialog(), 'dialog closed after save');
  await page.waitFor(() => (benchZone()?.textContent || '').includes('ProfileBuilt'), 'bench lists profile build');
  check('配装台方案表出现 Profile 存的方案', true);
  page.click(page.btnByText(benchZone(), 'Unequip all'));
  await page.waitFor(() => Object.keys(wsOf(page.window).loadout || {}).length === 0, 'bench loadout cleared');
  check('配装台卸空搭配 (载入复原前置)', true);
  const row = [...benchZone().querySelectorAll('tr')].find((tr) => (tr.textContent || '').includes('ProfileBuilt'));
  page.click(page.btnByText(row, 'Load'));
  await page.waitFor(() => JSON.stringify(sortObj(wsOf(page.window).loadout || {})) === JSON.stringify(sortObj(savedLo)), 'bench load restores composition');
  check('配装台载入 Profile 方案后搭配逐位复原', true);

  /* ---- H) 方案按流派分组: 乱序跨 ≥3 流派播种 -> 组头按后端目录流派序 +
   * 计数正确 + 每行归组正确 + 组内载入复原 + Profile/配装台双表面一致 ---- */
  const catalog = (await gql('{ gradPage { gearBuilds { idx school } } }')).data.gradPage.gearBuilds;
  const canonOrder = [];
  for (const gb of catalog) if (!canonOrder.includes(gb.school)) canonOrder.push(gb.school);
  const idxOfSchool = (s) => catalog.find((gb) => gb.school === s).idx;
  const savedSchool = catalog.find((gb) => gb.idx === saved.targetIdx).school;
  const otherSchools = canonOrder.filter((s) => s !== savedSchool);
  const lateSchool = otherSchools[otherSchools.length - 1];
  const midSchool = otherSchools[Math.floor(otherSchools.length / 2)];
  const seedLo = Object.entries(savedLo).map(([slot, gearId]) => ({ slot, gearId }));
  const seedBuild = async (name, targetIdx) => {
    const r = await gql('mutation($input: GearBuildSaveInput!) { saveGearBuild(input: $input) { ok error build { id name school targetIdx } } }',
      { input: { name, targetIdx, loadout: seedLo } });
    if (!r.data?.saveGearBuild?.ok) throw new Error('seed failed ' + name + ': ' + JSON.stringify(r).slice(0, 200));
    return r.data.saveGearBuild.build;
  };
  const seedLate = await seedBuild('GrpLate', idxOfSchool(lateSchool));
  const seedSame = await seedBuild('GrpSameSchool', saved.targetIdx);
  const seedMid = await seedBuild('GrpMid', idxOfSchool(midSchool));
  check('播种方案 school 由后端按 targetIdx 解析', seedLate.school === lateSchool && seedMid.school === midSchool && seedSame.school === savedSchool,
    `${seedLate.school} / ${seedMid.school} / ${seedSame.school}`);
  const allBuilds = (await gql('{ myGearBuilds { id name school targetIdx } }')).data.myGearBuilds;
  const presentSchools = canonOrder.filter((s) => allBuilds.some((b) => b.school === s));
  const countOf = (s) => allBuilds.filter((b) => b.school === s).length;
  check('夹具覆盖 ≥3 流派且 ProfileBuilt 流派 ≥2 套', presentSchools.length >= 3 && countOf(savedSchool) >= 2,
    `schools=${presentSchools.length} sameSchool=${countOf(savedSchool)}`);
  const assertGroups = (scope, label) => {
    const headers = [...scope.querySelectorAll('[data-school-group]')];
    const got = headers.map((h) => h.getAttribute('data-school-group'));
    check(`${label} 组头按目录流派序出现`, JSON.stringify(got) === JSON.stringify(presentSchools),
      `got=${JSON.stringify(got)} want=${JSON.stringify(presentSchools)}`);
    for (const h of headers) {
      const s = h.getAttribute('data-school-group');
      check(`${label} 组头计数 ${s} = ${countOf(s)}`, (h.textContent || '').includes(`${countOf(s)} builds`), (h.textContent || '').trim());
    }
    let cur = null; let rowsOk = true; const seen = new Set();
    for (const tr of scope.querySelectorAll('tr')) {
      const gh = tr.getAttribute('data-school-group');
      if (gh) { cur = gh; continue; }
      const rs = tr.getAttribute('data-build-school');
      if (rs) { seen.add(rs); if (rs !== cur) rowsOk = false; }
    }
    check(`${label} 每个方案行都归在自己流派组下`, rowsOk && seen.size === presentSchools.length, `seen=${[...seen].join(',')}`);
    // 组内最新在前: GrpSameSchool 播种晚于 ProfileBuilt (同流派), 必须排在其上方
    const rows = [...scope.querySelectorAll('tr')];
    const iSame = rows.findIndex((tr) => (tr.textContent || '').includes('GrpSameSchool'));
    const iBuilt = rows.findIndex((tr) => (tr.textContent || '').includes('ProfileBuilt'));
    check(`${label} 组内最新在前 (GrpSameSchool 在 ProfileBuilt 上方)`, iSame >= 0 && iBuilt >= 0 && iSame < iBuilt,
      `same@${iSame} built@${iBuilt}`);
  };
  page.click(page.btnByText(doc, 'Profile'));
  await page.waitFor(() => !!dialog(), 'H profile opens');
  await page.waitFor(() => (dialog()?.querySelectorAll('[data-school-group]').length || 0) >= presentSchools.length, 'H profile groups render');
  assertGroups(dialog(), 'Profile');
  page.click(doc.querySelector('.yy-modal-overlay'));
  await page.waitFor(() => !dialog(), 'H dialog closed');
  await page.waitFor(() => (benchZone()?.querySelectorAll('[data-school-group]').length || 0) >= presentSchools.length, 'H bench groups render');
  assertGroups(benchZone(), '配装台');
  const lateRow = [...benchZone().querySelectorAll('tr')].find((tr) => (tr.textContent || '').includes('GrpLate'));
  page.click(page.btnByText(lateRow, 'Load'));
  await page.waitFor(() => (wsOf(page.window).targetIdx ?? 0) === seedLate.targetIdx
    && JSON.stringify(sortObj(wsOf(page.window).loadout || {})) === JSON.stringify(sortObj(savedLo)), 'H load from group restores');
  check('组内载入 GrpLate 后搭配与 targetIdx 复原', true);
} catch (e) {
  check('跨表面场景执行', false, String(e && e.message || e));
}
page.window.close();

/* ---- G) 空态: 全新窗口 (无已存搭配) 打开 Profile — 存按钮禁用 +
 * 指引文案出现 + 不产生任何方案 ---- */
const page2 = await openPage();
const doc2 = page2.doc;
const dialog2 = () => doc2.querySelector('.yy-modal-panel');
const buildsBefore = (await gql('{ myGearBuilds { id } }')).data.myGearBuilds.length;
try {
  await page2.waitFor(() => (doc2.querySelector('[data-testid="bench-zone"]')?.textContent || '').includes('Gear library'), 'p2 bench renders');
  page2.click(page2.btnByText(doc2, 'Profile'));
  await page2.waitFor(() => !!dialog2(), 'p2 profile opens');
  await page2.waitFor(() => (dialog2()?.textContent || '').includes('My builds'), 'p2 builds section');
  const btn2 = page2.btnByText(dialog2(), 'Save as build');
  check('空态下 Profile 存按钮禁用', !!btn2 && btn2.disabled === true);
  check('空态显示「先在配装台拼一套」指引 (en)', (dialog2()?.textContent || '').includes('Put a loadout together on the gear bench first'));
  page2.click(doc2.querySelector('.yy-modal-overlay'));
} catch (e) {
  check('空态场景执行', false, String(e && e.message || e));
}
page2.window.close();
const buildsAfter = (await gql('{ myGearBuilds { id } }')).data.myGearBuilds.length;
check('空态未产生任何方案', buildsAfter === buildsBefore, `before=${buildsBefore} after=${buildsAfter}`);

/* ---- 清理: 删光本轮导入与方案 (本地库初始为空) ---- */
const myBuilds = (await gql('{ myGearBuilds { id } }')).data.myGearBuilds;
for (const b of myBuilds) await gql('mutation($id: Int!) { deleteGearBuild(id: $id) { ok } }', { id: b.id });
const mine = (await gql('{ myGearItems { id } }')).data.myGearItems;
for (const it of mine) await gql('mutation($id: Int!) { deleteGearItem(id: $id) { ok } }', { id: it.id });
const after = (await gql('{ myGearItems { id } }')).data.myGearItems;
const afterB = (await gql('{ myGearBuilds { id } }')).data.myGearBuilds;
check('清理后本地库回到空', after.length === 0 && afterB.length === 0, `deleted=${mine.length} builds=${myBuilds.length}`);

const failed = results.filter(([ok]) => !ok);
console.log(`\n==== ${results.length - failed.length}/${results.length} PASS ====`);
server.close();
process.exit(failed.length ? 1 : 0);
