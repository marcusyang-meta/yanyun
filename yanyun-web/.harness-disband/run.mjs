// 解散车队 (仅车头) 验收: 两段 —
//  P 协议段 (Node 直调本地 worker): 伪造会话 A=车头(2001) / B=成员(2002) / 匿名。
//    发车落 creator_discord_id; 非车头/匿名 disband 被拒且车无损; 旧
//    deleteGrouping 已不存在 (无平行删除口); REST 草稿车 (无车头记录)
//    谁都解散不了; B 的 WS 订阅收到 deleted 事件; 解散后车与座位全灭;
//    非车头编辑他车被拒 (2026-10-25 起编辑也仅车头, 细则见 .harness-editperm)。
//  U 界面段 (jsdom, 复用 .harness-live/dist 的真实详情页, 双服务器分别
//    注入 A/B 会话): 车头详情页有「解散车队」且点完确认能真解散; 非车头
//    详情页无「编辑」也无「解散车队」; 无车头记录的旧车详情页也不显示。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { JSDOM, VirtualConsole } from 'jsdom';

const require = createRequire(new URL('../package.json', import.meta.url));
const WsClient = require('ws');

const LIVE_DIST = fileURLToPath(new URL('../.harness-live/dist', import.meta.url));
const WORKER = 'http://127.0.0.1:8799';
const JWT_A = fs.readFileSync('/tmp/jwt-a.txt', 'utf8').trim();
const JWT_B = fs.readFileSync('/tmp/jwt-b.txt', 'utf8').trim();

/* Legacy-car fixture (creator_discord_id NULL, status draft — the
 * row shape the retired session-less REST draft endpoint wrote).
 * Seeded straight into the local D1 the dev worker serves (same
 * wrangler d1 channel the signup CI fixtures use); no product REST
 * involved. */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileP = promisify(execFile);
const SIGNUP_DIR = fileURLToPath(new URL('../../yanyun-signup', import.meta.url));
async function seedLegacyDraft() {
  const now = Math.floor(Date.now() / 1000);
  const sql = `INSERT INTO events (tenant, title, type, description, starts_at, meet_info, max_slots, status, starts_at_utc, origin, created_by, manage_code, dungeon, creator_discord_id, reminder_sent_at, reminder_error) VALUES ('livetest', '未命名车队', 'activity', '', '', '', 10, 'draft', ${now}, 'member', '热心车友', '', '', NULL, NULL, NULL) RETURNING id;`;
  const { stdout } = await execFileP('npx',
    ['wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--json', '--command', sql],
    { cwd: SIGNUP_DIR });
  const parsed = JSON.parse(stdout.slice(stdout.indexOf('[')));
  const id = parsed?.[0]?.results?.[0]?.id;
  if (id == null) throw new Error('seedLegacyDraft: no id returned: ' + stdout.slice(0, 200));
  return String(id);
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, extra = '') => {
  results.push(!!ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
};

async function gql(jwt, query, variables) {
  const r = await fetch(WORKER + '/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(jwt ? { cookie: `yy_session=${jwt}` } : {}) },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
}
const future = () => String(Math.floor(Date.now() / 1000) + 3600);
async function aCreate(title) {
  const j = await gql(JWT_A,
    `mutation($input: CreateGroupingInput!) { createGrouping(input: $input) { ok error grouping { id creatorDiscordId } } }`,
    { input: { slug: 'livetest', title, type: 'ACTIVITY', startsAt: future(), seats: [{ nickname: '车头本人', weapon: '鸣金·虹' }] } });
  if (!j?.data?.createGrouping?.ok) throw new Error('A create failed: ' + JSON.stringify(j));
  return j.data.createGrouping.grouping;
}
const detail = (jwt, id) => gql(jwt,
  `query($slug: String, $id: ID!) { groupingDetailPage(slug: $slug, id: $id) { grouping { id title creatorDiscordId } } }`,
  { slug: 'livetest', id });
const disband = (jwt, id) => gql(jwt,
  `mutation($id: ID!) { disbandGrouping(id: $id) { ok error } }`, { id });

/* ================= P: 协议段 ================= */
let wsMsg = null;
try {
  const g = await aCreate('解散验收车');
  check('[P] 发车落库车头身份 creatorDiscordId=2001', g.creatorDiscordId === '2001', `actual=${g.creatorDiscordId}`);
  const gid = g.id;

  const dj = await detail(JWT_B, gid);
  check('[P] 成员 B 详情可见且带车头身份', dj?.data?.groupingDetailPage?.grouping?.creatorDiscordId === '2001');

  const rb = await disband(JWT_B, gid);
  check('[P] 非车头成员 disband 被拒', rb?.data?.disbandGrouping?.ok === false
    && String(rb?.data?.disbandGrouping?.error || '').includes('只有车头'), JSON.stringify(rb?.data?.disbandGrouping));
  const still = await detail(JWT_A, gid);
  check('[P] 被拒后车无损', still?.data?.groupingDetailPage?.grouping?.id === gid);

  const ra = await disband(null, gid);
  check('[P] 匿名 disband 被拒', ra?.data?.disbandGrouping?.ok === false, JSON.stringify(ra?.data?.disbandGrouping));

  const legacy = await gql(JWT_B, `mutation($id: ID!) { deleteGrouping(id: $id) { ok } }`, { id: gid });
  check('[P] 旧 deleteGrouping 已下线 (无平行删除口)', Array.isArray(legacy?.errors) && legacy.errors.length > 0,
    JSON.stringify(legacy?.errors?.[0]?.message || legacy).slice(0, 120));

  // 编辑已收口 (2026-10-25 续裁: 编辑车队也只有车头可以): B 改 A 的车应被拒
  const g2 = await aCreate('解散验收副车');
  const upd = await gql(JWT_B,
    `mutation($id: ID!, $input: UpdateGroupingInput!) { updateGrouping(id: $id, input: $input) { ok error } }`,
    { id: g2.id, input: { title: '副车被B改名' } });
  check('[P] 非车头编辑他车被拒 (编辑仅车头, 细则见 .harness-editperm)', upd?.data?.updateGrouping?.ok === false
    && String(upd?.data?.updateGrouping?.error || '').includes('只有车头可以编辑车队'), JSON.stringify(upd?.data?.updateGrouping));

  // 旧车 (无车头记录, creator_discord_id 为空): 谁都不能解散
  const draftId = await seedLegacyDraft();
  check('[P] 旧车夹具已种入本地 D1', !!draftId, draftId);
  const draft = { id: draftId };
  const rl = await disband(JWT_A, String(draft.id));
  check('[P] 无车头记录的旧车 disband 被拒', rl?.data?.disbandGrouping?.ok === false
    && String(rl?.data?.disbandGrouping?.error || '').includes('未记录车头'), JSON.stringify(rl?.data?.disbandGrouping));
  const legacyStill = await detail(JWT_A, String(draft.id));
  check('[P] 旧车被拒后仍在', legacyStill?.data?.groupingDetailPage?.grouping?.id === String(draft.id));
  globalThis.__legacyDraftId = String(draft.id);

  // WS: B 订阅 -> A 解散 -> B 收到 deleted 事件
  const ws = new WsClient('ws://127.0.0.1:8799/ws/guild/livetest', { headers: { cookie: `yy_session=${JWT_B}` } });
  ws.on('message', (d) => { wsMsg = String(d); });
  await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); setTimeout(() => rej(new Error('ws open timeout')), 8000); });
  await sleep(400);
  const rok = await disband(JWT_A, gid);
  check('[P] 车头 disband 自己车成功', rok?.data?.disbandGrouping?.ok === true, JSON.stringify(rok?.data?.disbandGrouping));
  const t0 = Date.now();
  while (!wsMsg && Date.now() - t0 < 6000) await sleep(150);
  check('[P] B 的订阅收到 deleted 事件', !!wsMsg && wsMsg.includes('"deleted"') && wsMsg.includes(`"groupingId":"${gid}"`),
    wsMsg ? wsMsg.slice(0, 160) : '(none)');
  ws.close();

  const gone = await detail(JWT_A, gid);
  // resolver 抛的 '组队不存在' 被 yoga 的 maskedErrors 遮蔽成 Unexpected
  // error (既有行为, 前端靠 DetailErrBound 兜底显示不存在页); 断言落在
  // errors 存在 + data 为空, 原文已由 dev 日志确认是 组队不存在。
  check('[P] 解散后详情查无此车', Array.isArray(gone?.errors) && gone.errors.length > 0 && !gone?.data?.groupingDetailPage,
    JSON.stringify(gone).slice(0, 140));
  const join = await gql(JWT_B,
    `mutation($input: JoinGroupingInput!) { joinGrouping(input: $input) { ok error } }`,
    { input: { groupingId: gid, nickname: '路人', weapon: '破竹·樽', seatIndex: 1 } });
  check('[P] 解散后报名也找不到车 (硬删除)', join?.data?.joinGrouping?.ok === false
    && String(join?.data?.joinGrouping?.error || '').includes('组队不存在'), JSON.stringify(join?.data?.joinGrouping));

  const rok2 = await disband(JWT_A, g2.id);
  check('[P] 副车由车头解散清理', rok2?.data?.disbandGrouping?.ok === true, JSON.stringify(rok2?.data?.disbandGrouping));
} catch (e) {
  check('[P] 协议段执行', false, String(e && e.message || e));
}

/* ================= U: 界面段 ================= */
function makeShim(jwt) {
  return class ShimWebSocket {
    static CONNECTING = 0; static OPEN = 1; static CLOSING = 2; static CLOSED = 3;
    constructor(url) {
      this._listeners = new Map();
      this.readyState = 0;
      const u = new URL(String(url));
      const ws = new WsClient(`ws://127.0.0.1:8799${u.pathname}`, { headers: { cookie: `yy_session=${jwt}` } });
      this._ws = ws;
      ws.on('open', () => { this.readyState = 1; this._emit('open', { type: 'open' }); });
      ws.on('message', (d) => this._emit('message', { type: 'message', data: String(d) }));
      ws.on('close', () => { this.readyState = 3; this._emit('close', { type: 'close', code: 1006 }); });
      ws.on('error', () => this._emit('error', { type: 'error' }));
    }
    addEventListener(t, fn) { if (!this._listeners.has(t)) this._listeners.set(t, []); this._listeners.get(t).push(fn); }
    removeEventListener(t, fn) { const a = this._listeners.get(t) || []; this._listeners.set(t, a.filter((f) => f !== fn)); }
    _emit(t, ev) { for (const fn of [...(this._listeners.get(t) || [])]) { try { fn(ev); } catch { /* */ } } }
    send(data) { try { this._ws && this._ws.send(String(data)); } catch { /* */ } }
    close() { this.readyState = 3; try { this._ws && this._ws.close(); } catch { /* */ } this._emit('close', { type: 'close', code: 1000 }); }
  };
}
function makeServer(port, jwt) {
  const server = http.createServer(async (req, res) => {
    if (req.url === '/graphql' && req.method === 'POST') {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', async () => {
        const body = Buffer.concat(chunks).toString('utf8');
        try {
          const r = await fetch(WORKER + '/graphql', {
            method: 'POST',
            headers: { 'content-type': 'application/json', cookie: `yy_session=${jwt}` },
            body,
          });
          res.writeHead(r.status, { 'content-type': 'application/json' });
          res.end(Buffer.from(await r.arrayBuffer()));
        } catch (e) {
          res.writeHead(502, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ errors: [{ message: 'proxy: ' + String(e) }] }));
        }
      });
      return;
    }
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/harness-live.html';
    const file = path.join(LIVE_DIST, p);
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}
async function openDetail(port, jwt, carId) {
  const html = fs.readFileSync(path.join(LIVE_DIST, 'harness-live.html'), 'utf8');
  const dom = new JSDOM(html, {
    url: `http://localhost:${port}/harness-live.html?view=detail&car=${carId}`,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: new VirtualConsole(),
    beforeParse(window) {
      window.WebSocket = makeShim(jwt);
      window.fetch = (input, init) => {
        const url = typeof input === 'string' && input.startsWith('/') ? window.location.origin + input : input;
        return fetch(url, init);
      };
    },
  });
  const { window } = dom;
  const doc = window.document;
  const text = () => doc.body.textContent || '';
  async function waitFor(fn, label, timeout = 20000) {
    const t0 = Date.now();
    for (;;) {
      let ok = false;
      try { ok = fn(); } catch { /* retry */ }
      if (ok) return;
      if (Date.now() - t0 > timeout) throw new Error('TIMEOUT: ' + label + ' | body: ' + text().slice(0, 400));
      await sleep(150);
    }
  }
  const btn = (label) => [...doc.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === label);
  return { window, doc, text, waitFor, btn };
}

const srvA = await makeServer(18751, JWT_A);
const srvB = await makeServer(18752, JWT_B);
try {
  const g = await aCreate('解散按钮车');
  // 车头本人详情页: 有解散按钮, 走完确认真的解散
  const pageA = await openDetail(18751, JWT_A, g.id);
  try {
    await pageA.waitFor(() => pageA.text().includes('解散按钮车'), 'leader detail render');
    await sleep(500);
    check('[U] 车头详情页显示「解散车队」', !!pageA.btn('解散车队'));
    check('[U] 车头详情页也有「编辑」', !!pageA.btn('✏️ 编辑'));
    pageA.btn('解散车队').dispatchEvent(new pageA.window.MouseEvent('click', { bubbles: true, cancelable: true }));
    await pageA.waitFor(() => pageA.text().includes('确定解散'), 'confirm dialog');
    const okBtn = [...pageA.doc.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === '确定');
    okBtn.dispatchEvent(new pageA.window.MouseEvent('click', { bubbles: true, cancelable: true }));
    let toastSeen = '';
    try {
      await pageA.waitFor(() => {
        if (pageA.text().includes('解散失败')) { toastSeen = (pageA.text().match(/解散失败[^ ]*/) || [''])[0]; return true; }
        return pageA.text().includes('车队不存在或已解散');
      }, 'own page switches to gone', 12000);
    } catch { /* 下面统一断言并带诊断 */ }
    check('[U] 车头在详情页点解散 -> 确认 -> 页面切到车队不存在',
      pageA.text().includes('车队不存在或已解散'), toastSeen || pageA.text().slice(0, 120));
  } catch (e) { check('[U] 车头详情页段执行', false, String(e && e.message || e)); }
  pageA.window.close();

  // 非车头成员详情页: 有编辑, 无解散
  const g2 = await aCreate('解散按钮副车');
  const pageB = await openDetail(18752, JWT_B, g2.id);
  try {
    await pageB.waitFor(() => pageB.text().includes('解散按钮副车'), 'member detail render');
    await sleep(500);
    check('[U] 非车头详情页无「编辑」(2026-10-25 编辑收口)', !pageB.btn('✏️ 编辑'));
    check('[U] 非车头详情页无「解散车队」', !pageB.btn('解散车队'));
  } catch (e) { check('[U] 非车头详情页段执行', false, String(e && e.message || e)); }
  pageB.window.close();
  await disband(JWT_A, g2.id);

  // 旧车 (无车头记录) 详情页: 车头本人看也不显示解散
  const legacyId = globalThis.__legacyDraftId;
  if (legacyId) {
    const pageL = await openDetail(18751, JWT_A, legacyId);
    try {
      await pageL.waitFor(() => pageL.text().includes('未命名车队'), 'legacy detail render');
      await sleep(500);
      check('[U] 无车头记录的旧车详情页无「解散车队」', !pageL.btn('解散车队'));
    } catch (e) { check('[U] 旧车详情页段执行', false, String(e && e.message || e)); }
    pageL.window.close();
  } else {
    check('[U] 旧车夹具可用', false, 'protocol stage did not produce a draft car');
  }
} catch (e) {
  check('[U] 界面段执行', false, String(e && e.message || e));
} finally {
  srvA.close();
  srvB.close();
}

const failed = results.filter((x) => !x).length;
console.log(`\n==== ${results.length - failed}/${results.length} PASS ====`);
process.exit(failed ? 1 : 0);
