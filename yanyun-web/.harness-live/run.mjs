// jsdom 双客户端实时验收: 真实 GroupingListRoute / GroupingDetailRoute /
// GroupingForm 组件 + 本地 wrangler dev 后端 (真实 resolver + GuildHub DO)。
//
// 客户端 A = jsdom 里的真实组件 (GraphQL 经本服务器代理到 worker, 带 A 会话;
// WebSocket 由 shim 用 ws 包接管, 握手带 A 的 yy_session cookie, 可断网模拟)。
// 客户端 B = Node 侧直接调 worker GraphQL (B 会话)。
//
// 阶段:
//  L 列表实时: B 发车/落座/改名/删车 -> A 的已打开列表原地变化, 不刷新不跳页
//  D 详情实时: B 落座/取消 -> A 的已打开详情原地变化; B 解散 -> A 显示车队不存在
//  O 断网自发: WS 全程断开时 A 用真实表单发车 -> 新车靠 mutation updater
//     即时出现在列表 (断言其后列表查询请求数为 0, 证明不是靠重查/回声)
//  O2 断网落座: WS 断开 + 详情查询人为延迟 1.5s 时 A 落座 -> 座位在延迟
//     窗口内出现 (证明 updater 写回, 而非等 onChanged 的重查)
//  R 断线重连: A 断线期间 B 发车 -> A 不出现 (无轮询); 恢复后靠重连
//     resync 重查补上
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { JSDOM, VirtualConsole } from 'jsdom';

const require = createRequire(new URL('../package.json', import.meta.url));
const WsClient = require('ws');

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DIST = path.join(DIR, 'dist');
const WORKER = 'http://127.0.0.1:8799';
const PORT = 18745;
const JWT_A = fs.readFileSync('/tmp/jwt-a.txt', 'utf8').trim();
const JWT_B = fs.readFileSync('/tmp/jwt-b.txt', 'utf8').trim();
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, extra = '') => {
  results.push(!!ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
};

/* ---------- GraphQL 请求计数 (按 operation 名) + 可控延迟 ---------- */
const opCounts = new Map();
const opDelay = new Map(); // opName -> ms (代理转发前人为延迟响应)
const bumpOp = (body) => {
  for (const op of ['ViewerGuildGroupingsQuery', 'GroupingDetailQuery', 'GroupingFormCreateMutation', 'SeatGridJoinMutation', 'GroupingFormDungeonsQuery']) {
    if (body.includes(op)) { opCounts.set(op, (opCounts.get(op) || 0) + 1); return op; }
  }
  return null;
};
const opCount = (op) => opCounts.get(op) || 0;

/* ---------- WebSocket shim (浏览器 API 子集, ws 包实现, 带 cookie) ---------- */
const wsState = { down: false, live: new Set(), dropAll() { for (const w of [...this.live]) { try { w.terminate(); } catch { /* */ } } } };
class ShimWebSocket {
  static CONNECTING = 0; static OPEN = 1; static CLOSING = 2; static CLOSED = 3;
  constructor(url) {
    this._listeners = new Map();
    this.readyState = 0;
    this._ws = null;
    const u = new URL(String(url));
    const target = `ws://127.0.0.1:8799${u.pathname}`;
    if (wsState.down) {
      // 断网模拟: 异步 error + close, 管理器走退避重连
      setTimeout(() => {
        this.readyState = 3;
        this._emit('error', { type: 'error' });
        this._emit('close', { type: 'close', code: 1006 });
      }, 30);
      return;
    }
    const ws = new WsClient(target, { headers: { cookie: `yy_session=${JWT_A}` } });
    this._ws = ws;
    wsState.live.add(ws);
    ws.on('open', () => { this.readyState = 1; this._emit('open', { type: 'open' }); });
    ws.on('message', (d) => this._emit('message', { type: 'message', data: String(d) }));
    ws.on('close', () => { this.readyState = 3; wsState.live.delete(ws); this._emit('close', { type: 'close', code: 1006 }); });
    ws.on('error', () => this._emit('error', { type: 'error' }));
  }
  addEventListener(t, fn) { if (!this._listeners.has(t)) this._listeners.set(t, []); this._listeners.get(t).push(fn); }
  removeEventListener(t, fn) { const a = this._listeners.get(t) || []; this._listeners.set(t, a.filter((f) => f !== fn)); }
  _emit(t, ev) { for (const fn of [...(this._listeners.get(t) || [])]) { try { fn(ev); } catch { /* */ } } }
  send(data) { try { this._ws && this._ws.send(String(data)); } catch { /* */ } }
  close() { this.readyState = 3; try { this._ws && this._ws.close(); } catch { /* */ } this._emit('close', { type: 'close', code: 1000 }); }
}

/* ---------- 静态文件 + /graphql 代理 (带 A 会话) ---------- */
const server = http.createServer(async (req, res) => {
  if (req.url === '/graphql' && req.method === 'POST') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const body = Buffer.concat(chunks).toString('utf8');
      const op = bumpOp(body);
      try {
        const r = await fetch(WORKER + '/graphql', {
          method: 'POST',
          headers: { 'content-type': 'application/json', cookie: `yy_session=${JWT_A}` },
          body,
        });
        const buf = Buffer.from(await r.arrayBuffer());
        const delay = op ? (opDelay.get(op) || 0) : 0;
        if (delay) await sleep(delay);
        res.writeHead(r.status, { 'content-type': 'application/json' });
        res.end(buf);
      } catch (e) {
        res.writeHead(502, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ errors: [{ message: 'proxy: ' + String(e) }] }));
      }
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/harness-live.html';
  const file = path.join(DIST, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));

/* ---------- B 侧 GraphQL ---------- */
async function gqlB(query, variables) {
  const r = await fetch(WORKER + '/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `yy_session=${JWT_B}` },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
}
// 目标时刻必须落在页面眼里的"本周"内且为未来: 与 src/lib/format.ts
// getWeekRange 同一算法 (周一 05:00 北京为界)。now+86400 在周末会跨界
// 进下周, 列表按周过滤自然看不到 —— 那是正确行为, 不是 bug (首轮踩过)。
function weekRangeNode(weekOffset) {
  const now = new Date();
  const beijing = new Date(now.getTime() + (8 * 60 + now.getTimezoneOffset()) * 60000);
  const day = beijing.getDay();
  const daysSinceMonday = (day + 6) % 7;
  const monday = new Date(beijing);
  monday.setDate(beijing.getDate() - daysSinceMonday + weekOffset * 7);
  monday.setHours(5, 0, 0, 0);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  const toLocal = (bj) => new Date(bj.getTime() - (8 * 60 + new Date().getTimezoneOffset()) * 60000);
  return { start: toLocal(monday), end: toLocal(nextMonday) };
}
function inWeekFutureDate() {
  const { end } = weekRangeNode(0);
  let t = Date.now() + 2 * 3600 * 1000;
  if (t > end.getTime() - 1800 * 1000) t = end.getTime() - 1800 * 1000;
  return new Date(t);
}
const future = () => String(Math.floor(inWeekFutureDate().getTime() / 1000));
async function bCreate(title, type = 'ACTIVITY') {
  const j = await gqlB(`mutation($input: CreateGroupingInput!) { createGrouping(input: $input) { ok error grouping { id } } }`,
    { input: { slug: 'livetest', title, type, startsAt: future(), seats: [{ nickname: '成员B', weapon: '鸣金·虹' }] } });
  if (!j?.data?.createGrouping?.ok) throw new Error('B create failed: ' + JSON.stringify(j));
  return j.data.createGrouping.grouping.id;
}

/* ---------- jsdom 页面 ---------- */
const allConsole = [];
async function openPage(query) {
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => allConsole.push('JSDOM: ' + String((e && e.message) || e)));
  vc.on('error', (...a) => allConsole.push('error: ' + a.join(' ')));
  vc.on('warn', (...a) => allConsole.push('warn: ' + a.join(' ')));
  const html = fs.readFileSync(path.join(DIST, 'harness-live.html'), 'utf8');
  const dom = new JSDOM(html, {
    url: `http://localhost:${PORT}/harness-live.html?${query}`,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      window.WebSocket = ShimWebSocket;
      window.fetch = (input, init) => {
        const url = typeof input === 'string' && input.startsWith('/') ? window.location.origin + input : input;
        return fetch(url, init);
      };
      const origError = window.console.error.bind(window.console);
      window.console.error = (...a) => { allConsole.push('console.error: ' + a.map(String).join(' ')); origError(...a); };
      const origWarn = window.console.warn.bind(window.console);
      window.console.warn = (...a) => { allConsole.push('console.warn: ' + a.map(String).join(' ')); origWarn(...a); };
    },
  });
  const { window } = dom;
  const doc = window.document;
  async function waitFor(fn, label, timeout = 20000) {
    const t0 = Date.now();
    for (;;) {
      let ok = false;
      try { ok = fn(); } catch { /* retry */ }
      if (ok) return Date.now() - t0;
      if (Date.now() - t0 > timeout) throw new Error('TIMEOUT: ' + label + ' | body: ' + (doc.body.textContent || '').slice(0, 400));
      await sleep(150);
    }
  }
  const text = () => doc.body.textContent || '';
  return { window, doc, waitFor, text };
}
const setNative = (window, el, value, proto) => {
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
};
function setInput(window, el, value) {
  setNative(window, el, value, window.HTMLInputElement.prototype);
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
}
function setSelect(window, el, value) {
  setNative(window, el, String(value), window.HTMLSelectElement.prototype);
  el.dispatchEvent(new window.Event('change', { bubbles: true }));
}
const click = (window, el) => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

/* ---------- 清场: 删掉 livetest 既有车, 保证断言不受历史数据污染 ---------- */
{
  for (const tab of ['ACTIVITY', 'TALENT', 'RACE']) {
    const j = await gqlB(`query($slug: String!, $tab: GroupingTab!) { viewer { guild(slug: $slug) { ... on Guild { groupings(tab: $tab) { groupings { id } } } } } }`,
      { slug: 'livetest', tab });
    const cars = j?.data?.viewer?.guild?.groupings?.groupings || [];
    for (const c of cars) {
      await gqlB(`mutation($id: ID!) { disbandGrouping(id: $id) { ok } }`, { id: c.id });
    }
    if (cars.length) console.log(`cleanup: removed ${cars.length} ${tab} cars`);
  }
}

/* ================= 阶段 L: 列表实时 ================= */
{
  const page = await openPage('view=list');
  try {
    await page.waitFor(() => page.text().includes('暂无车队') || page.text().includes('队'), 'list initial render');
    await sleep(800);
    const gid = await bCreate('L实时车');
    const dt = await page.waitFor(() => page.text().includes('L实时车'), 'B 发车 -> A 列表出现', 8000);
    check('[L] B 发车后 A 列表原地出现新车', true, `event->visible ≈${dt}ms`);
    check('[L] 卡片人数 1/10', page.text().includes('1/10 人'));
    await gqlB(`mutation($input: JoinGroupingInput!) { joinGrouping(input: $input) { ok } }`,
      { input: { groupingId: gid, nickname: '队友甲', weapon: '破竹·樽', seatIndex: 1 } });
    await page.waitFor(() => page.text().includes('2/10 人'), 'B 落座 -> A 卡片人数变化', 8000);
    check('[L] B 落座后 A 卡片人数 2/10', true);
    await gqlB(`mutation($id: ID!, $input: UpdateGroupingInput!) { updateGrouping(id: $id, input: $input) { ok } }`,
      { id: gid, input: { title: 'L实时车·改名' } });
    await page.waitFor(() => page.text().includes('L实时车·改名'), 'B 改名 -> A 列表更新', 8000);
    check('[L] B 改名后 A 列表标题更新', true);
    await gqlB(`mutation($id: ID!) { disbandGrouping(id: $id) { ok } }`, { id: gid });
    await page.waitFor(() => !page.text().includes('L实时车·改名'), 'B 删车 -> A 列表移除', 8000);
    check('[L] B 删车后 A 列表移除该车', true);
    // 请求有界: 初始 + 4 个事件 × 3 tab 上界内, 且静默期不再增长 (无轮询/无循环)
    const c1 = opCount('ViewerGuildGroupingsQuery');
    check('[L] 列表查询总数有界', c1 >= 4 && c1 <= 20, `count=${c1}`);
    await sleep(2000);
    check('[L] 静默期零新增列表查询 (无轮询)', opCount('ViewerGuildGroupingsQuery') === c1, `count=${opCount('ViewerGuildGroupingsQuery')}`);
  } catch (e) { check('[L] 阶段执行', false, String(e && e.message || e)); }
  page.window.close();
  await sleep(300);
}

/* ================= 阶段 D: 详情实时 ================= */
{
  const gid = await bCreate('D详情车');
  const page = await openPage(`view=detail&car=${gid}`);
  try {
    await page.waitFor(() => page.text().includes('D详情车') && page.text().includes('成员B'), 'detail initial render');
    await sleep(500);
    await gqlB(`mutation($input: JoinGroupingInput!) { joinGrouping(input: $input) { ok } }`,
      { input: { groupingId: gid, nickname: '队友乙', weapon: '牵丝·玉', seatIndex: 1 } });
    const dt = await page.waitFor(() => page.text().includes('队友乙'), 'B 落座 -> A 详情出现', 8000);
    check('[D] B 落座后 A 详情原地出现新座位', true, `event->visible ≈${dt}ms`);
    const dj = await gqlB(`query($slug: String, $id: ID!) { groupingDetailPage(slug: $slug, id: $id) { grouping { seats { uid nickname occupied } } } }`,
      { slug: 'livetest', id: gid });
    const seat = dj.data.groupingDetailPage.grouping.seats.find((s) => s.nickname === '队友乙');
    await gqlB(`mutation($input: LeaveGroupingInput!) { leaveGrouping(input: $input) { ok } }`,
      { input: { groupingId: gid, uid: seat.uid } });
    await page.waitFor(() => !page.text().includes('队友乙'), 'B 取消 -> A 详情座位消失', 8000);
    check('[D] B 取消报名后 A 详情座位消失', true);
    await gqlB(`mutation($id: ID!) { disbandGrouping(id: $id) { ok } }`, { id: gid });
    await page.waitFor(() => page.text().includes('车队不存在或已解散'), 'B 解散 -> A 详情显示不存在', 10000);
    check('[D] B 解散后 A 详情显示车队不存在', true);
  } catch (e) { check('[D] 阶段执行', false, String(e && e.message || e)); }
  page.window.close();
  await sleep(300);
}

/* ================= 阶段 O: 断网自发 (updater 证明) ================= */
{
  wsState.down = true;
  const page = await openPage('view=list');
  try {
    await page.waitFor(() => page.text().includes('张贴告示'), 'list render (offline)');
    await sleep(800);
    const baseListQ = opCount('ViewerGuildGroupingsQuery');
    const baseCreate = opCount('GroupingFormCreateMutation');
    const openBtn = [...page.doc.querySelectorAll('button')].find((b) => (b.textContent || '').includes('发新车'));
    click(page.window, openBtn);
    await page.waitFor(() => page.text().includes('发布') && page.doc.querySelectorAll('input').length >= 2, 'form open');
    await sleep(1000); // 等副本 query 与 Suspense 落定
    const selects = [...page.doc.querySelectorAll('select')];
    const target = inWeekFutureDate();
    setSelect(page.window, selects[1], target.getMonth() + 1);
    setSelect(page.window, selects[2], target.getDate());
    setSelect(page.window, selects[3], target.getHours());
    const inputs = [...page.doc.querySelectorAll('input')];
    setInput(page.window, inputs[0], 'O断网自发车');
    setInput(page.window, inputs[1], '成员A');
    const sectBtn = [...page.doc.querySelectorAll('button')].find((b) => b.textContent === '鸣金·虹');
    click(page.window, sectBtn);
    const pub = [...page.doc.querySelectorAll('button')].find((b) => b.textContent === '发布');
    click(page.window, pub);
    // 兜底: 3s 内 mutation 没发出去 (Suspense 过渡帧竞态, .harness-form 同款
    // 已知 flake), 重新取按钮再点一次
    await sleep(3000);
    if (opCount('GroupingFormCreateMutation') === baseCreate) {
      const pub2 = [...page.doc.querySelectorAll('button')].find((b) => b.textContent === '发布');
      if (pub2) click(page.window, pub2);
    }
    await page.waitFor(() => opCount('GroupingFormCreateMutation') > baseCreate, 'create mutation sent', 10000);
    const dt = await page.waitFor(() => page.text().includes('O断网自发车'), 'own car visible (offline)', 8000);
    check('[O] WS 断开时本人发车即时出现在列表', true, `mutation->visible ≈${dt}ms`);
    check('[O] 表单已关闭 (onDone 完成)', !page.doc.querySelector('.yy-modal-panel'));
    await sleep(1200);
    check('[O] 出现后未发生列表查询 (updater 而非重查)', opCount('ViewerGuildGroupingsQuery') === baseListQ,
      `delta=${opCount('ViewerGuildGroupingsQuery') - baseListQ}`);
    check('[O] 新车只出现一次 (无重复插入)', (page.text().match(/O断网自发车/g) || []).length === 1);
  } catch (e) { check('[O] 阶段执行', false, String(e && e.message || e)); }
  page.window.close();
  wsState.down = false;
  await sleep(300);
}

/* ================= 阶段 O2: 断网落座 (updater 证明, 详情查询延迟) ================= */
{
  const gid = await bCreate('O2详情车');
  wsState.down = true;
  opDelay.set('GroupingDetailQuery', 3000);
  const page = await openPage(`view=detail&car=${gid}`);
  try {
    await page.waitFor(() => page.text().includes('O2详情车'), 'detail render (offline)');
    await sleep(600);
    const emptySeat = [...page.doc.querySelectorAll('button')].find((b) => (b.textContent || '').includes('空位 · 点击落座'));
    click(page.window, emptySeat);
    await page.waitFor(() => page.text().includes('确认落座'), 'seat modal open');
    const input = page.doc.querySelector('input');
    setInput(page.window, input, '成员A');
    const sectBtn = [...page.doc.querySelectorAll('button')].find((b) => b.textContent === '破竹·樽');
    click(page.window, sectBtn);
    const baseJoin = opCount('SeatGridJoinMutation');
    const okBtn = [...page.doc.querySelectorAll('button')].find((b) => b.textContent === '确认落座');
    click(page.window, okBtn);
    // 兜底: 1.2s 内 mutation 没发出去 (过渡帧竞态) 再点一次
    await sleep(1200);
    if (opCount('SeatGridJoinMutation') === baseJoin) {
      const okBtn2 = [...page.doc.querySelectorAll('button')].find((b) => b.textContent === '确认落座');
      if (okBtn2) click(page.window, okBtn2);
    }
    await page.waitFor(() => opCount('SeatGridJoinMutation') > baseJoin, 'join mutation sent', 8000);
    // 严格时序证明: onChanged 触发的详情重查被延迟 3000ms (从 mutation
    // 完成起算), 在此之前座位只能来自 mutation updater 的 store 写回。
    // 从 mutation 发出起 2000ms 内见到座位 => updater 路径成立。
    const tMut = Date.now();
    let firstSeen = -1;
    for (let i = 0; i < 40; i++) {
      if (page.text().includes('成员A')) { firstSeen = Date.now() - tMut; break; }
      await sleep(100);
    }
    check('[O2] WS 断开+详情重查延迟 3s 时本人落座在重查落地前可见 (updater)', firstSeen >= 0 && firstSeen < 2000,
      `firstSeen=${firstSeen}ms after mutation sent (delayed refetch lands ≥3000ms after completion)`);
  } catch (e) { check('[O2] 阶段执行', false, String(e && e.message || e)); }
  page.window.close();
  wsState.down = false;
  opDelay.delete('GroupingDetailQuery');
  await gqlB(`mutation($id: ID!) { disbandGrouping(id: $id) { ok } }`, { id: gid });
  await sleep(300);
}

/* ================= 阶段 R: 断线重连 resync ================= */
{
  const page = await openPage('view=list');
  try {
    await page.waitFor(() => page.text().includes('张贴告示'), 'list render (R)');
    await sleep(1000); // 等 socket 建好
    wsState.down = true;
    wsState.dropAll();
    await sleep(300);
    const gid = await bCreate('R断线期间车');
    await sleep(2000);
    check('[R] 断线期间 B 发车不出现在 A (无轮询兜底)', !page.text().includes('R断线期间车'));
    const baseListQ = opCount('ViewerGuildGroupingsQuery');
    wsState.down = false; // 恢复网络: 管理器退避到点后重连 -> resync 重查
    const dt = await page.waitFor(() => page.text().includes('R断线期间车'), 'reconnect resync shows car', 40000);
    check('[R] 重连 resync 后断线期间的车补上', true, `recover->visible ≈${dt}ms`);
    check('[R] resync 确实发起了列表重查', opCount('ViewerGuildGroupingsQuery') > baseListQ,
      `delta=${opCount('ViewerGuildGroupingsQuery') - baseListQ}`);
    await gqlB(`mutation($id: ID!) { disbandGrouping(id: $id) { ok } }`, { id: gid });
  } catch (e) { check('[R] 阶段执行', false, String(e && e.message || e)); }
  page.window.close();
  await sleep(300);
}

/* ---------- 全局: Relay 警告/异常清零 ---------- */
const relayWarnings = allConsole.filter((l) => /conflicting|RelayResponseNormalizer|Minified exception|invariant/i.test(l));
check('全程零 Relay conflicting/invariant 警告', relayWarnings.length === 0, relayWarnings.slice(0, 3).join(' | '));

const failed = results.filter((x) => !x).length;
console.log(`\n==== ${results.length - failed}/${results.length} PASS ====`);
server.close();
process.exit(failed ? 1 : 0);
