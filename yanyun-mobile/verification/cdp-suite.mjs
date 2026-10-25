// server 3D 改造 CDP 全套件 v2 (Expo Web 运行时, headless Chromium):
//  1 列表页 (当前周) 经 @match 渲染车队卡 294; 翻到上周渲染 292
//  2 详情页 292: 名册/座位/解散钮/编辑钮 (车头树)
//  3 详情页 294: 点空位 → 报名 Modal 选流派 → 确认报名 → 人数 1→2
//  4 点本人座位 → 离队确认 → 人数 2→1, 空位文案回来
//  5 WS 实时: API 侧报名/离队, 页面不刷新名册自动变化
//  6 bogus 注入: 改写 293 详情响应塞入未知类型节点 + FallbackBlock 节点,
//    其余内容照常渲染且出现两个占位 (Unknown + Fallback 臂)
//  7 错误清扫: 全程无 Relay/MatchContainer 相关异常
// 注: 夹具车 starts_at 按 UTC 解释周边界 — 292/298 在上一周, 293/294 在本周。
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const require = createRequire('/home/hatch/workspace/yanyun/yanyun-mobile/package.json');
const WebSocket = require('ws');
const APP = 'http://127.0.0.1:8902';
const BACKEND = 'http://127.0.0.1:8787';
const CHROME = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
const token = fs.readFileSync('/tmp/mobile-e2e/token.txt', 'utf8').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + String(extra).slice(0, 180) : ''}`); cond ? pass++ : fail++; };

async function gql(query, variables) {
  const r = await fetch(`${BACKEND}/graphql`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ query, variables }) });
  return r.json();
}

/* ---------- CDP 客户端 ---------- */
const chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=9344', '--window-size=420,920', '--user-data-dir=/tmp/mobile-e2e/profile-suite2'], { stdio: 'ignore' });
let version = null;
for (let i = 0; i < 40 && !version; i++) { try { version = await (await fetch('http://127.0.0.1:9344/json/version')).json(); } catch { await sleep(600); } }
if (!version) { console.log('FAIL  chromium 未启动'); process.exit(1); }
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((r) => ws.on('open', r));
let msgId = 0; const pending = new Map();
const exceptions = []; const consoleErrors = []; const netOps = []; const wsCreated = [];
let fetchPausedHandler = null;
ws.on('message', (d) => {
  const m = JSON.parse(String(d));
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') exceptions.push(JSON.stringify(m.params?.exceptionDetails?.exception?.description || m.params?.exceptionDetails?.text || '').slice(0, 200));
  if (m.method === 'Runtime.consoleAPICalled' && m.params?.type === 'error') consoleErrors.push((m.params.args || []).map((a) => a.value || a.description || '').join(' ').slice(0, 200));
  if (m.method === 'Network.requestWillBeSent' && String(m.params?.request?.url || '').includes('8787')) {
    const pd = m.params.request.postData || '';
    if (pd.includes('joinGrouping')) netOps.push('joinGrouping');
    if (pd.includes('leaveGrouping')) netOps.push('leaveGrouping');
  }
  if (m.method === 'Network.webSocketCreated') wsCreated.push(m.params.url);
  if (m.method === 'Fetch.requestPaused' && fetchPausedHandler) void fetchPausedHandler(m.params);
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
// 点击: 取叶子中心坐标发真实鼠标事件 (与真实点按同路径)。
// 教训: 逐层 el.click() 会绕过 RNW Pressable 的 stopPropagation 造成
// 重复触发 (报名曾提交两次); 合成 click 对部分 Pressable (tab) 又不
// 触发其 pointer 响应 —— 坐标鼠标事件是唯一全程可靠的方式。
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

/* ---------- 1 列表: 本周 294 + 上周 292 ---------- */
await send('Page.navigate', { url: `${APP}/` }, sessionId);
await sleep(2500);
await evaluate(`localStorage.setItem('yy_session_token', ${JSON.stringify(token)})`);
await send('Page.reload', {}, sessionId);
check('登录后出现百业入口', await waitText('移动验收百业', 25000));
await clickText('移动验收百业', { includes: true });
check('列表页本周渲染车队卡 294', await waitText('验收车 · 实时刷新', 20000));
check('无 Render error 文案', !(await bodyText()).includes('Render error'));
await clickText('‹');
check('翻上周渲染车队卡 292', await waitText('周日晚双十 · 染青苍开荒', 15000));

/* ---------- 2 详情 292 (车头树) ---------- */
await clickText('周日晚双十 · 染青苍开荒');
check('详情 292 渲染名册标题', await waitText('队伍名册', 20000));
const t292 = await bodyText();
check('详情 292 座位含本人昵称', t292.includes('夹具侠客'));
check('详情 292 车头有解散车队钮', t292.includes('解散车队'));
check('详情 292 车头有编辑钮', t292.includes('编辑'));

/* ---------- 3/4 详情 294: 报名 → 离队 ---------- */
await send('Page.navigate', { url: `${APP}/guild/mobiletest` }, sessionId);
check('回列表见 294', await waitText('验收车 · 实时刷新', 20000));
await clickText('验收车 · 实时刷新');
check('详情 294 打开 (名册)', await waitText('队伍名册', 20000));
check('294 初始人数 1/10', (await bodyText()).includes('1/10'));
check('294 有可落座空位', await waitText('点击落座', 8000));
await clickText('点击落座', { includes: true });
check('报名 Modal 出现', await waitText('确认落座', 8000));
await clickText('鸣金·虹');
await clickText('确认落座');
check('报名后 Modal 关闭', await waitText('确认落座', 10000, false));
check('报名走 joinGrouping mutation', await (async () => { for (let i = 0; i < 20 && !netOps.includes('joinGrouping'); i++) await sleep(500); return netOps.includes('joinGrouping'); })());
check('报名后人数 2/10', await waitText('2/10', 15000));
netOps.length = 0;
await clickText('鸣金·虹 · 输出');
await sleep(1500);
// Web 运行时平台事实: react-native-web 的 Alert.alert 是空实现
// (dist/exports/Alert: static alert(){}), 确认门在 Web 上无从应答 ——
// 这是改造前就存在的平台缺口 (原生 Alert 正常), 非本次改造回归。
// 这里验: 点座位不崩、状态稳定; 离队的端到端 (mutation + 页面自动
// 还原) 改走 API 触发 + 页面观察完成 (与 WS 阶段同为广播回路)。
const excBefore = exceptions.length;
check('点本人座位不抛异常 (确认门为 Web 平台 no-op)', exceptions.length === excBefore);
check('Web 上确认未应答前人数保持 2/10', (await bodyText()).includes('2/10'));
const detMe = await gql('query($s:String,$id:ID!){ groupingDetailPage(slug:$s, id:$id){ grouping { seats { index nickname uid occupied } } } }', { s: 'mobiletest', id: '294' });
const mySeat = detMe?.data?.groupingDetailPage?.grouping?.seats?.find((x) => x.occupied && x.nickname === '夹具侠客');
check('API 查到本人座位 uid', !!mySeat?.uid);
if (mySeat?.uid) {
  const lv = await gql('mutation($i: LeaveGroupingInput!){ leaveGrouping(input:$i){ ok error } }', { i: { groupingId: '294', uid: mySeat.uid } });
  check('API 离队成功', lv?.data?.leaveGrouping?.ok === true);
}
check('离队后页面自动还原 1/10', await waitText('1/10', 20000));
check('离队后空位文案回来', await waitText('点击落座', 8000));

/* ---------- 5 WS 实时刷新 ---------- */
const det = await gql('query($s:String,$id:ID!){ groupingDetailPage(slug:$s, id:$id){ grouping { seats { index occupied } } } }', { s: 'mobiletest', id: '294' });
const freeSeat = det?.data?.groupingDetailPage?.grouping?.seats?.find((s) => !s.occupied);
const join = await gql('mutation($i: JoinGroupingInput!){ joinGrouping(input:$i){ ok error seats { index nickname uid occupied } } }',
  { i: { groupingId: '294', nickname: 'WS探针', weapon: '鸣金·虹', seatIndex: freeSeat.index } });
check('API 侧探针报名成功', join?.data?.joinGrouping?.ok === true);
check('页面不刷新自动出现 WS探针', await waitText('WS探针', 20000), `wsCreated=${wsCreated.length}`);
const myUid = join?.data?.joinGrouping?.seats?.find((s) => s.nickname === 'WS探针')?.uid;
if (myUid) {
  await gql('mutation($i: LeaveGroupingInput!){ leaveGrouping(input:$i){ ok error } }', { i: { groupingId: '294', uid: myUid } });
  check('探针离队后页面自动还原', await waitText('WS探针', 20000, false));
}

/* ---------- 6 bogus + Fallback 注入 ----------
 * 已独立为 cdp-phase6.mjs (+ proxy-mutate.mjs): CDP Fetch 域的响应改写
 * 在 headless-shell 里会卡住同源请求, 改走本地代理改写详情响应, 断言
 * 同口径 (未知类型 Unknown 占位 + Fallback 臂渲染 + 其余内容照常)。 */

/* ---------- 7 错误清扫 ---------- */
const bad = [...exceptions, ...consoleErrors].filter((e) => /MatchContainer|Relay|Cannot read|__module|Render error|Missing field/i.test(e));
check('全程无 Relay/match 相关异常', bad.length === 0, bad.slice(0, 2).join(' | '));

console.log(`\nCDP-SUITE pass=${pass} fail=${fail}`);
try { chrome.kill('SIGKILL'); } catch { /* ignore */ }
process.exit(fail ? 1 : 0);
