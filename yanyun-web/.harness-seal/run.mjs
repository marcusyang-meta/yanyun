// 传家宝盖章验收 (jsdom, 真实 GearBench/GearLibrary 组件 + 真实 relay + 本地后端):
//  种子: 示例套 8 件 (对目标 0 号流派经后端引擎核验全为传家宝) + dud 夹具
//        (0 命中配方) + plain 夹具 (有命中但不可嵌入)。
//  阶段 1 (只装主武器): 装备库卡 + 搭配槽都出现金漆牌/玉佩/heirloom 金边态;
//        dud 卡只有灰印; plain 卡无印; 无集齐庆祝; 点传家宝卡撒 24 粒金粉,
//        点卡内按钮不撒粉。
//  阶段 2 (8 件全装): 集齐跃迁触发一次庆祝 (110+50 粒), 静置不重复;
//        破齐不触发, 重新装齐再触发一次。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DIST = path.join(DIR, 'dist');
const JWT = fs.readFileSync('/tmp/jwt-a.txt', 'utf8').trim();
const WORKER = 'http://localhost:8799';
const PORT = 18753;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

const gql = async (query, variables) => {
  const r = await fetch(WORKER + '/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `yy_session=${JWT}` },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
};

const results = [];
const check = (name, ok, extra = '') => {
  results.push([ok, name, extra]);
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (extra ? ' — ' + extra : ''));
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- 种子 ---------------- */
const ref = (await gql('{ gradPage { gearDemoKit { slot name keys dingyinName dingyinVal } gearAffixes { key cy } gearBaseFields { key preset } gearSlots } }')).data.gradPage;
const cyOf = new Map(ref.gearAffixes.map((a) => [a.key, a.cy]));
const kitItems = ref.gearDemoKit.map((g) => ({
  slot: g.slot,
  name: 'SEAL·' + g.name,
  lines: g.keys.map((k) => ({ key: k, val: cyOf.get(k) ?? 0 })),
  dingyin: g.dingyinName ? { name: g.dingyinName, val: g.dingyinVal } : null,
  schools: [],
}));
const dudItem = {
  slot: '冠胄', name: 'SEAL·DudFixture',
  lines: ['xiaowai', 'shu_mj_da', 'shu_mj_xiao'].map((k) => ({ key: k, val: cyOf.get(k) ?? 0 })),
  dingyin: null, schools: [],
};
const plainItem = {
  slot: '胸甲', name: 'SEAL·PlainFixture',
  lines: [0, 1, 2].map(() => ({ key: 'dawai', val: cyOf.get('dawai') ?? 0 })),
  dingyin: null, schools: [],
};
const seedResp = await gql(
  'mutation($items: [GearItemCreateInput!]!) { importGearItems(items: $items, loadout: []) { ok error items { id slot name lines { key val } dingyin { name val } schools warnings } } }',
  { items: [...kitItems, dudItem, plainItem] },
);
const seeded = seedResp.data?.importGearItems?.items || [];
if (!seedResp.data?.importGearItems?.ok || seeded.length !== 10) {
  console.log('SEED FAILED', JSON.stringify(seedResp).slice(0, 500));
  process.exit(1);
}
const byName = new Map(seeded.map((g) => [g.name, g]));
console.log('seeded ids:', seeded.map((g) => g.id + ':' + g.name).join(' '));

/* 后端判定核验 (与页面同一 gearPlan 口径) */
const planResp = await gql(
  'mutation($input: GearPlanInput!) { gearPlan(input: $input) { gearEvals { id verdict } } }',
  {
    input: {
      targetIdx: 0,
      lib: seeded.map((g) => ({ id: g.id, slot: g.slot, name: g.name, lines: g.lines, dingyin: g.dingyin, schools: g.schools })),
      loadout: [],
      baseValues: ref.gearBaseFields.map((f) => ({ key: f.key, val: f.preset })),
      xinfa: [], res: 1.85, extraAcc: 0, extraCrit: 0, extraInt: 0,
      bowKind: '', gradDingyinOn: true, sim: [],
    },
  },
);
const verdictOf = new Map((planResp.data?.gearPlan?.gearEvals || []).map((e) => [e.id, e.verdict]));
const kitSeeded = kitItems.map((k) => byName.get(k.name));
check('种子核验: 示例套 8 件全为传家宝', kitSeeded.every((g) => verdictOf.get(g.id) === 'heirloom'),
  kitSeeded.map((g) => verdictOf.get(g.id)).join(','));
check('种子核验: dud 夹具 verdict=dud', verdictOf.get(byName.get(dudItem.name).id) === 'dud', String(verdictOf.get(byName.get(dudItem.name).id)));
check('种子核验: plain 夹具无 verdict', verdictOf.get(byName.get(plainItem.name).id) === '', String(verdictOf.get(byName.get(plainItem.name).id)));

/* 部位 -> 种子件 (武器两件依次主/副) */
const positions = ref.gearSlots;
const posOfKit = {};
{
  const weapons = kitSeeded.filter((g) => g.slot === '武器');
  posOfKit['主武器'] = weapons[0].id;
  posOfKit['副武器'] = weapons[1].id;
  kitSeeded.filter((g) => g.slot !== '武器').forEach((g) => { posOfKit[g.slot] = g.id; });
}
const workState = (loadout) => JSON.stringify({
  targetIdx: 0, baseValues: {}, xinfa: [], res: 1.85,
  extraAcc: 0, extraCrit: 0, extraInt: 0, bowBySchool: {}, sim: {}, gradDy: true, loadout,
});

/* ---------------- 页面服务 ---------------- */
const pageHtml = (seedJson) => `<!doctype html>
<html><head><meta charset="utf-8"><title>seal harness</title></head>
<body>
<div id="root"></div>
<script>window.process = { env: { NODE_ENV: 'production' } };</script>
<script>
  try {
    Object.defineProperty(window.navigator, 'language', { value: 'zh-CN', configurable: true });
    Object.defineProperty(window.navigator, 'languages', { value: ['zh-CN'], configurable: true });
  } catch (e) {}
  localStorage.setItem('yy-gear-planner-v1', ${JSON.stringify(seedJson)});
  window.__gdAdded = 0;
  const __origAppend = Node.prototype.appendChild;
  Node.prototype.appendChild = function (child) {
    if (child && child.nodeType === 1 && child.classList && child.classList.contains('gd-p')) window.__gdAdded++;
    return __origAppend.call(this, child);
  };
</script>
<script src="./harness.js"></script>
</body></html>`;

let currentSeed = workState({ ['主武器']: posOfKit['主武器'] });
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
  const p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/' || p === '/page.html') {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(pageHtml(currentSeed));
    return;
  }
  const file = path.join(DIST, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));

async function openPage() {
  const vc = new VirtualConsole();
  vc.on('jsdomError', () => undefined);
  const html = await (await fetch(`http://localhost:${PORT}/page.html`)).text();
  const dom = new JSDOM(html, {
    url: `http://localhost:${PORT}/page.html`,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      window.fetch = (input, init) => {
        const url = typeof input === 'string' && input.startsWith('/') ? window.location.origin + input : input;
        return fetch(url, init);
      };
    },
  });
  const { window } = dom;
  await new Promise((r) => { window.addEventListener('load', r); setTimeout(r, 1500); });
  const doc = window.document;
  async function waitFor(fn, label, timeout = 30000) {
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
  return { window, doc, waitFor, click };
}

const libCard = (doc, name) => [...doc.querySelectorAll('.yy-gear-card')].find((c) => (c.textContent || '').includes(name));
const slotBox = (doc, pos) => [...doc.querySelectorAll('.yy-slotbox')].find((c) => [...c.children].some((ch) => (ch.textContent || '').trim() === pos));

/* ---------------- 阶段 1: 单件盖章 ---------------- */
try {
  currentSeed = workState({ ['主武器']: posOfKit['主武器'] });
  const page = await openPage();
  const { doc, window } = page;
  await page.waitFor(() => !!libCard(doc, kitItems[0].name), 'library cards render');
  await page.waitFor(() => !!slotBox(doc, '主武器')?.querySelector('.heirloom-seal'), 'plan evals arrive (slot seal)');
  const swordName = kitItems[0].name;
  const libH = libCard(doc, swordName);
  check('阶段1 库卡: 传家宝金漆牌出现', !!libH?.querySelector('.heirloom-seal') && libH.querySelector('.heirloom-seal').textContent.includes('传家宝'));
  check('阶段1 库卡: heirloom 金边态 + 玉佩', libH.classList.contains('heirloom') && !!libH.querySelector('.jade-pendant'));
  const slotH = slotBox(doc, '主武器');
  check('阶段1 搭配槽: 金漆牌出现', !!slotH?.querySelector('.heirloom-seal') && slotH.querySelector('.heirloom-seal').textContent.includes('传家宝'));
  check('阶段1 搭配槽: heirloom 金边态 + 玉佩', slotH.classList.contains('heirloom') && !!slotH.querySelector('.jade-pendant'));
  const libDud = libCard(doc, dudItem.name);
  check('阶段1 库卡: dud 灰印 (拉完了)', !!libDud?.querySelector('.dud-seal') && libDud.querySelector('.dud-seal').textContent.includes('拉完了'));
  check('阶段1 库卡: dud 无金漆牌/无玉佩/无金边', !libDud.querySelector('.heirloom-seal') && !libDud.querySelector('.jade-pendant') && !libDud.classList.contains('heirloom'));
  const libPlain = libCard(doc, plainItem.name);
  check('阶段1 库卡: plain 无任何印', !!libPlain && !libPlain.querySelector('.heirloom-seal') && !libPlain.querySelector('.dud-seal') && !libPlain.querySelector('.jade-pendant'));
  await sleep(600);
  check('阶段1 未集齐: 无庆祝金粉', window.__gdAdded === 0, 'gd=' + window.__gdAdded);
  page.click(libH.querySelector('b'));
  await sleep(200);
  check('阶段1 点传家宝库卡撒粉 24 粒', window.__gdAdded === 24, 'gd=' + window.__gdAdded);
  const editBtn = [...libH.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === '编辑');
  page.click(editBtn);
  await sleep(200);
  check('阶段1 点卡内按钮不撒粉', window.__gdAdded === 24, 'gd=' + window.__gdAdded);
  page.click(slotH.firstElementChild);
  await sleep(200);
  check('阶段1 点传家宝搭配槽撒粉 +24', window.__gdAdded === 48, 'gd=' + window.__gdAdded);
  window.close();
} catch (e) {
  check('阶段1 异常', false, String(e && e.message || e));
}

/* ---------------- 阶段 2: 集齐庆祝 ---------------- */
try {
  currentSeed = workState(posOfKit);
  const page = await openPage();
  const { doc, window } = page;
  await page.waitFor(() => doc.querySelectorAll('.yy-slotbox.heirloom').length === 8, 'all 8 slots heirloom');
  await page.waitFor(() => window.__gdAdded >= 160, 'celebration fires', 20000);
  check('阶段2 集齐庆祝恰一次 (160 粒)', window.__gdAdded === 160, 'gd=' + window.__gdAdded);
  await sleep(2000);
  check('阶段2 集齐静置不重复触发', window.__gdAdded === 160, 'gd=' + window.__gdAdded);
  const gz = slotBox(doc, '冠胄');
  const xBtn = [...gz.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === '×');
  page.click(xBtn);
  await page.waitFor(() => !slotBox(doc, '冠胄').classList.contains('heirloom'), 'set broken');
  await sleep(900);
  check('阶段2 破齐不触发庆祝', window.__gdAdded === 160, 'gd=' + window.__gdAdded);
  const gz2 = slotBox(doc, '冠胄');
  const equipBtn = [...gz2.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === '选入');
  page.click(equipBtn);
  await sleep(300);
  const pickBtn = [...gz2.querySelectorAll('button')].find((b) => (b.textContent || '').includes('SEAL·示例 · 玉斗冠胄'));
  page.click(pickBtn);
  await page.waitFor(() => window.__gdAdded >= 320, 'celebration re-fires', 20000);
  check('阶段2 重新集齐再触发一次 (+160)', window.__gdAdded === 320, 'gd=' + window.__gdAdded);
  await sleep(1500);
  check('阶段2 第二次庆祝后静置不重复', window.__gdAdded === 320, 'gd=' + window.__gdAdded);
  window.close();
} catch (e) {
  check('阶段2 异常', false, String(e && e.message || e));
}

server.close();
const failed = results.filter(([ok]) => !ok);
console.log(`\nSEAL HARNESS pass=${results.length - failed.length} fail=${failed.length}`);
process.exit(failed.length ? 1 : 0);
