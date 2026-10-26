// 原语面 (C 路线) CDP 真渲染套件 (Expo Web 运行时, headless Chromium):
// 开关 ON (mobiletest 列表+详情) 下 —
//  1 列表经 primTree 渲染: 本周 294 卡 + 按日组头; 翻上周见 292
//  2 网络证据: 页面确实发了 PrimQuery 且响应 primTree 非 null
//     (排除「静默回落积木树」的假绿)
//  3 点卡 (prim nav 动作) 进详情 292: 名册/座位/车头三钮 (编辑/完成/
//     解散) 全在, 渲染与积木通道同构
//  4 详情 294: 点空位 (prim join 动作) → 报名岛 Modal → 选流派 →
//     确认 → 人数 1→2 (与积木通道同一岛、同一 mutation)
//  5 WS 实时: API 侧报名/离队, prim 详情页不刷新自动变化
//  6 错误清扫: 无 Relay/解释器相关异常, 无 Render error
// 开关由本脚本经本地 D1 拨动, 结束恢复 OFF (finally)。
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
const require = createRequire('/home/hatch/workspace/yanyun/yanyun-mobile/package.json');
const WebSocket = require('ws');
const APP = 'http://127.0.0.1:8902';
const BACKEND = 'http://127.0.0.1:8787';
const SIGNUP = '/home/hatch/workspace/yanyun/yanyun-signup';
const CHROME = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
const token = fs.readFileSync('/tmp/mobile-e2e/token.txt', 'utf8').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + String(extra).slice(0, 180) : ''}`); cond ? pass++ : fail++; };

function setPrim(list, detail) {
  execFileSync('npx', ['wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--command',
    `INSERT INTO settings(tenant,key,value) VALUES('mobiletest','primitives_list','${list}'),('mobiletest','primitives_detail','${detail}') ON CONFLICT(tenant,key) DO UPDATE SET value=excluded.value`],
    { cwd: SIGNUP, stdio: 'pipe' });
}
async function gql(query, variables) {
  const r = await fetch(`${BACKEND}/graphql`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ query, variables }) });
  return r.json();
}

/* ---------- CDP 客户端 (与 cdp-suite 同构) ---------- */
const chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=9345', '--window-size=420,920', '--user-data-dir=/tmp/mobile-e2e/profile-prims'], { stdio: 'ignore' });
let version = null;
for (let i = 0; i < 40 && !version; i++) { try { version = await (await fetch('http://127.0.0.1:9345/json/version')).json(); } catch { await sleep(600); } }
if (!version) { console.log('FAIL  chromium 未启动'); process.exit(1); }
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((r) => ws.on('open', r));
let msgId = 0; const pending = new Map();
const exceptions = []; const consoleErrors = [];
const primNet = { listQuery: 0, detailQuery: 0, listTree: false, detailTree: false };
const reqKind = new Map();
ws.on('message', (d) => {
  const m = JSON.parse(String(d));
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') exceptions.push(JSON.stringify(m.params?.exceptionDetails?.exception?.description || m.params?.exceptionDetails?.text || '').slice(0, 200));
  if (m.method === 'Runtime.consoleAPICalled' && m.params?.type === 'error') consoleErrors.push((m.params.args || []).map((a) => a.value || a.description || '').join(' ').slice(0, 200));
  if (m.method === 'Network.requestWillBeSent' && String(m.params?.request?.url || '').includes('8787')) {
    const pd = m.params.request.postData || '';
    if (pd.includes('documentsGroupingListPrimQuery')) { primNet.listQuery++; reqKind.set(m.params.requestId, 'list'); }
    if (pd.includes('documentsGroupingDetailPrimQuery')) { primNet.detailQuery++; reqKind.set(m.params.requestId, 'detail'); }
  }
  if (m.method === 'Network.responseReceived' && reqKind.has(m.params.requestId)) {
    const kind = reqKind.get(m.params.requestId);
    void send('Network.getResponseBody', { requestId: m.params.requestId }, sessionId).then((r) => {
      const body = r?.body || '';
      if (body.includes('"primTree":[{')) { if (kind === 'list') primNet.listTree = true; else primNet.detailTree = true; }
    }).catch(() => {});
  }
});
const send = (method, params = {}, sessionId) => new Promise((resolve) => { const id = ++msgId; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); });

let targets = await send('Target.getTargets');
let page = targets.targetInfos.find((t) => t.type === 'page');
if (!page) {
  const created = await send('Target.createTarget', { url: 'about:blank' });
  targets = await send('Target.getTargets');
  page = targets.targetInfos.find((t) => t.targetId === created.targetId) || targets.targetInfos.find((t) => t.type === 'page');
}
const { sessionId } = await send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
await send('Network.enable', {}, sessionId);
await send('Emulation.setLocaleOverride', { locale: 'zh-CN' }, sessionId).catch(() => {});
await send('Network.setCookie', { name: 'yy_session', value: token, url: 'http://127.0.0.1:8787/', httpOnly: true }, sessionId).catch(() => {});

const evaluate = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
  if (r?.exceptionDetails) throw new Error('evaluate failed: ' + JSON.stringify(r.exceptionDetails).slice(0, 200));
  return r?.result?.value;
};
const bodyText = () => evaluate('document.body ? document.body.innerText : ""');
async function waitText(substr, timeout = 15000, present = true) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const t = await bodyText().catch(() => '');
    if ((t.includes(substr)) === present) return true;
    await sleep(500);
  }
  return false;
}
async function clickText(text, { includes = false } = {}) {
  const pt = await evaluate(`(() => {
    const want = ${JSON.stringify(text)}; const inc = ${includes};
    const leaves = [...document.querySelectorAll('*')].filter((e) => {
      const t = (e.textContent || '').trim();
      return e.children.length === 0 && (inc ? t.includes(want) : t === want) &&
        e.getBoundingClientRect().width > 0;
    });
    if (!leaves.length) return null;
    leaves[0].scrollIntoView({ block: 'center' });
    const r = leaves[0].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`);
  if (!pt) return false;
  await sleep(150);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 }, sessionId);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 }, sessionId);
  await sleep(400);
  return true;
}

try {
  setPrim('1', '1');

  /* ---------- 1 列表 (prim 通道) ---------- */
  await send('Page.navigate', { url: `${APP}/` }, sessionId);
  await sleep(2500);
  await evaluate(`localStorage.setItem('yy_session_token', ${JSON.stringify(token)})`);
  await send('Page.reload', {}, sessionId);
  check('登录后出现百业入口', await waitText('移动验收百业', 25000));
  await clickText('移动验收百业', { includes: true });
  check('prim 列表渲染车队卡 294', await waitText('验收车 · 实时刷新', 20000));
  const lt = await bodyText();
  check('prim 列表有按日组头', /日 周[一二三四五六日]/.test(lt), lt.match(/\d+月\d+日 周./)?.[0] ?? '');
  check('prim 列表卡有状态片 (报名中)', lt.includes('报名中'));
  check('无 Render error 文案', !lt.includes('Render error'));
  await sleep(1200);
  check('网络证据: 发过 ListPrimQuery 且 primTree 非 null', primNet.listQuery > 0 && primNet.listTree, JSON.stringify(primNet));
  await clickText('‹');
  check('prim 列表翻上周渲染 292', await waitText('周日晚双十 · 染青苍开荒', 15000));

  /* ---------- 2 详情 292 (prim 通道, 车头) ---------- */
  await clickText('周日晚双十 · 染青苍开荒');
  check('点 prim 卡 (nav 动作) 进详情 292 名册', await waitText('队伍名册', 20000));
  const t292 = await bodyText();
  check('prim 详情 292 座位含本人昵称', t292.includes('夹具侠客'));
  check('prim 详情 292 座位副行 (流派·定位)', t292.includes('鸣金·虹 · 输出'));
  check('prim 详情 292 车头有编辑钮', t292.includes('编辑车队') || t292.includes('编辑'));
  check('prim 详情 292 车头有完成钮', t292.includes('完成车队'));
  check('prim 详情 292 车头有解散钮', t292.includes('解散车队'));
  await sleep(1200);
  check('网络证据: 发过 DetailPrimQuery 且 primTree 非 null', primNet.detailQuery > 0 && primNet.detailTree, JSON.stringify(primNet));

  /* ---------- 3 详情 294: prim join → 报名岛 ---------- */
  await send('Page.navigate', { url: `${APP}/guild/mobiletest` }, sessionId);
  check('回列表见 294', await waitText('验收车 · 实时刷新', 20000));
  // 列表此刻在上周视图 (阶段 1 翻过), 294 在本周 — 点周导航 › 回本周
  if (!(await bodyText()).includes('验收车 · 实时刷新')) { await clickText('›'); await waitText('验收车 · 实时刷新', 15000); }
  await clickText('验收车 · 实时刷新');
  check('详情 294 打开 (名册)', await waitText('队伍名册', 20000));
  check('294 初始人数 1/10', (await bodyText()).includes('1/10'));
  check('294 prim 空位可落座文案', await waitText('点击落座', 8000));
  await clickText('点击落座', { includes: true });
  check('prim join 动作打开报名岛 Modal', await waitText('确认落座', 8000));
  await clickText('鸣金·虹');
  await clickText('确认落座');
  check('报名后 Modal 关闭', await waitText('确认落座', 10000, false));
  check('报名后人数 2/10', await waitText('2/10', 15000));
  // 清理: API 离队还原 294
  const detMe = await gql('query($s:String,$id:ID!){ groupingDetailPage(slug:$s, id:$id){ grouping { seats { index nickname uid occupied } } } }', { s: 'mobiletest', id: '294' });
  const mySeat = detMe?.data?.groupingDetailPage?.grouping?.seats?.find((x) => x.occupied && x.nickname === '夹具侠客');
  if (mySeat?.uid) await gql('mutation($i: LeaveGroupingInput!){ leaveGrouping(input:$i){ ok } }', { i: { groupingId: '294', uid: mySeat.uid } });
  check('清理后页面还原 1/10 (WS 刷新 prim 查询)', await waitText('1/10', 20000));

  /* ---------- 4 WS 实时 (prim 详情) ---------- */
  const det = await gql('query($s:String,$id:ID!){ groupingDetailPage(slug:$s, id:$id){ grouping { seats { index occupied } } } }', { s: 'mobiletest', id: '294' });
  const freeSeat = det?.data?.groupingDetailPage?.grouping?.seats?.find((s) => !s.occupied);
  const join = await gql('mutation($i: JoinGroupingInput!){ joinGrouping(input:$i){ ok error seats { index nickname uid occupied } } }',
    { i: { groupingId: '294', nickname: 'WS探针', weapon: '鸣金·虹', seatIndex: freeSeat.index } });
  check('API 侧探针报名成功', join?.data?.joinGrouping?.ok === true);
  check('prim 详情不刷新自动出现 WS探针', await waitText('WS探针', 20000));
  const myUid = join?.data?.joinGrouping?.seats?.find((s) => s.nickname === 'WS探针')?.uid;
  if (myUid) {
    await gql('mutation($i: LeaveGroupingInput!){ leaveGrouping(input:$i){ ok error } }', { i: { groupingId: '294', uid: myUid } });
    check('探针离队后 prim 详情自动还原', await waitText('WS探针', 20000, false));
  }

  /* ---------- 5 错误清扫 ---------- */
  const bad = [...exceptions, ...consoleErrors].filter((e) => /MatchContainer|Relay|Cannot read|__module|Render error|Missing field|prim/i.test(e));
  check('全程无 Relay/解释器相关异常', bad.length === 0, bad.slice(0, 2).join(' | '));
} finally {
  setPrim('0', '0');
}

console.log(`\nCDP-PRIMS pass=${pass} fail=${fail}`);
try { chrome.kill('SIGKILL'); } catch { /* ignore */ }
process.exit(fail ? 1 : 0);
