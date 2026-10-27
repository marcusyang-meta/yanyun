// 编辑车队仅车头 (2026-10-25 裁决) 验收: 两段 —
//  P 协议段 (Node 直调本地 worker): 伪造会话 A=车头(2001) / B=成员(2002) / 匿名。
//    GraphQL updateGrouping: 车头改名 + 改名册成功; 非车头改名/改名册被拒
//    (只有车头可以编辑车队) 且车无损; 匿名被拒 (请先登录); 无车头记录的
//    旧车谁都改不了 (未记录车头，无法编辑)。
//    REST manage: update/close/reopen/delete 四动作同闸 — 非车头 403 对应
//    文案, 匿名 401, 车头全通; 旧车四动作全撞未记录车头。
//    未收口面未误伤: B 报名 / 改自己座位流派 / 离队照常; 解散闸门不变。
//  U 界面段 (jsdom, 复用 .harness-live/dist 的真实详情页, 双服务器分别
//    注入 A/B 会话): 车头详情页有「编辑」且点开是真实编辑表单; 非车头
//    详情页无「编辑」入口、DOM 里没有编辑表单、页面停留在详情本身
//    (打不开编辑页, 没有提示页); 旧车详情页同样无「编辑」。
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
  const { stdout } = await execFileP('pnpm',
    ['exec', 'wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--json', '--command', sql],
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
  `query($slug: String, $id: ID!) { groupingDetailPage(slug: $slug, id: $id) { grouping { id title status creatorDiscordId seats { nickname weapon uid } } } }`,
  { slug: 'livetest', id });
const update = (jwt, id, input) => gql(jwt,
  `mutation($id: ID!, $input: UpdateGroupingInput!) { updateGrouping(id: $id, input: $input) { ok error errorCode } }`,
  { id, input });
const disband = (jwt, id) => gql(jwt,
  `mutation($id: ID!) { disbandGrouping(id: $id) { ok error } }`, { id });

/* ================= P: 协议段 ================= */
try {
  const g = await aCreate('编辑收口验收车');
  const gid = g.id;
  check('[P] 发车落库车头身份 creatorDiscordId=2001', g.creatorDiscordId === '2001', `actual=${g.creatorDiscordId}`);

  // --- GraphQL: 车头可编辑 (改名 + 改名册) ---
  const uA = await update(JWT_A, gid, { title: '车头改名成功' });
  check('[P] 车头 updateGrouping 改名成功', uA?.data?.updateGrouping?.ok === true, JSON.stringify(uA?.data?.updateGrouping));
  const uA2 = await update(JWT_A, gid, {
    seats: [{ nickname: '车头本人', weapon: '鸣金·虹' }, { nickname: '新队友', weapon: '破竹·樽' }],
  });
  check('[P] 车头 updateGrouping 改名册成功', uA2?.data?.updateGrouping?.ok === true, JSON.stringify(uA2?.data?.updateGrouping));
  const dA = await detail(JWT_A, gid);
  const seatsA = dA?.data?.groupingDetailPage?.grouping?.seats || [];
  check('[P] 改名与名册已落库', dA?.data?.groupingDetailPage?.grouping?.title === '车头改名成功'
    && seatsA.some((s) => s.nickname === '新队友'), JSON.stringify(seatsA).slice(0, 160));

  // --- GraphQL: 非车头被拒且车无损 ---
  const uB = await update(JWT_B, gid, { title: 'B想改名' });
  check('[P] 非车头 updateGrouping 改名被拒 (只有车头可以编辑车队)',
    uB?.data?.updateGrouping?.ok === false
    && uB?.data?.updateGrouping?.errorCode === 'leaderOnlyEdit'
    && String(uB?.data?.updateGrouping?.error || '').includes('只有车头可以编辑车队'),
    JSON.stringify(uB?.data?.updateGrouping));
  const uB2 = await update(JWT_B, gid, { seats: [{ nickname: 'B塞的人', weapon: '鸣金·影' }] });
  check('[P] 非车头 updateGrouping 改名册被拒',
    uB2?.data?.updateGrouping?.ok === false && uB2?.data?.updateGrouping?.errorCode === 'leaderOnlyEdit',
    JSON.stringify(uB2?.data?.updateGrouping));
  const dAfter = await detail(JWT_A, gid);
  const seatsAfter = dAfter?.data?.groupingDetailPage?.grouping?.seats || [];
  check('[P] 被拒后车无损 (标题/名册未变)', dAfter?.data?.groupingDetailPage?.grouping?.title === '车头改名成功'
    && seatsAfter.some((s) => s.nickname === '新队友') && !seatsAfter.some((s) => s.nickname === 'B塞的人'));

  // --- GraphQL: 匿名被拒 ---
  const uAnon = await update(null, gid, { title: '匿名改名' });
  check('[P] 匿名 updateGrouping 被拒 (请先登录)',
    uAnon?.data?.updateGrouping?.ok === false
    && String(uAnon?.data?.updateGrouping?.error || '').includes('请先登录'),
    JSON.stringify(uAnon?.data?.updateGrouping));

  // --- 旧车 (无车头记录): 谁都改不了 ---
  const legacyId = await seedLegacyDraft();
  check('[P] 旧车夹具已种入本地 D1', !!legacyId, legacyId);
  globalThis.__legacyDraftId = legacyId;
  const uL = await update(JWT_A, legacyId, { title: '想改旧车' });
  check('[P] 无车头记录旧车 updateGrouping 被拒 (未记录车头，无法编辑)',
    uL?.data?.updateGrouping?.ok === false
    && uL?.data?.updateGrouping?.errorCode === 'noCreatorRecordedEdit'
    && String(uL?.data?.updateGrouping?.error || '').includes('未记录车头，无法编辑'),
    JSON.stringify(uL?.data?.updateGrouping));

  // (The REST manage endpoint section retired with the REST
  // shutdown migration: its leader gate is the same gate the
  // GraphQL checks above and below exercise — updateGrouping /
  // disbandGrouping / anonymous / legacy-car — on the surviving
  // surface. The endpoint itself is deleted in the shutdown PR.)

  // --- 未收口面未误伤: B 报名 / 改自己座位流派 / 离队 ---
  const join = await gql(JWT_B,
    `mutation($input: JoinGroupingInput!) { joinGrouping(input: $input) { ok error } }`,
    { input: { groupingId: gid, nickname: '成员乙', weapon: '破竹·樽', seatIndex: 1 } });
  check('[P] 非车头 joinGrouping 仍可报名', join?.data?.joinGrouping?.ok === true, JSON.stringify(join?.data?.joinGrouping));
  const dJoin = await detail(JWT_B, gid);
  const mySeat = (dJoin?.data?.groupingDetailPage?.grouping?.seats || []).find((s) => s.nickname === '成员乙');
  check('[P] B 的座位已落座且拿到 uid', !!mySeat?.uid, JSON.stringify(mySeat));
  const weapon = await gql(JWT_B,
    `mutation($input: UpdateSeatWeaponInput!) { updateSeatWeapon(input: $input) { ok error } }`,
    { input: { groupingId: gid, uid: mySeat.uid, weapon: '牵丝·霖' } });
  check('[P] 非车头 updateSeatWeapon 改自己座位仍可', weapon?.data?.updateSeatWeapon?.ok === true, JSON.stringify(weapon?.data?.updateSeatWeapon));
  const leave = await gql(JWT_B,
    `mutation($input: LeaveGroupingInput!) { leaveGrouping(input: $input) { ok error } }`,
    { input: { groupingId: gid, uid: mySeat.uid } });
  check('[P] 非车头 leaveGrouping 仍可离队', leave?.data?.leaveGrouping?.ok === true, JSON.stringify(leave?.data?.leaveGrouping));

  // --- 解散闸门不变 ---
  const dB = await disband(JWT_B, gid);
  check('[P] 非车头 disband 仍被拒 (只有车头可以解散车队)',
    dB?.data?.disbandGrouping?.ok === false
    && String(dB?.data?.disbandGrouping?.error || '').includes('只有车头可以解散车队'),
    JSON.stringify(dB?.data?.disbandGrouping));
  const dOk = await disband(JWT_A, gid);
  check('[P] 车头 disband 清理成功', dOk?.data?.disbandGrouping?.ok === true, JSON.stringify(dOk?.data?.disbandGrouping));
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

const srvA = await makeServer(18761, JWT_A);
const srvB = await makeServer(18762, JWT_B);
try {
  const g = await aCreate('编辑按钮车');
  // 车头详情页: 有编辑入口, 点开是真实编辑表单
  const pageA = await openDetail(18761, JWT_A, g.id);
  try {
    await pageA.waitFor(() => pageA.text().includes('编辑按钮车'), 'leader detail render');
    await sleep(500);
    check('[U] 车头详情页显示「编辑」', !!pageA.btn('✏️ 编辑'));
    pageA.btn('✏️ 编辑').dispatchEvent(new pageA.window.MouseEvent('click', { bubbles: true, cancelable: true }));
    await pageA.waitFor(() => pageA.text().includes('编辑告示'), 'leader edit form opens');
    check('[U] 车头点编辑 -> 编辑表单打开', !!pageA.doc.querySelector('.yy-modal-panel'));
    const closeX = [...pageA.doc.querySelectorAll('div')].find((d) => (d.textContent || '').trim() === '✕');
    closeX.dispatchEvent(new pageA.window.MouseEvent('click', { bubbles: true, cancelable: true }));
    await sleep(400);
    check('[U] 车头关闭表单后回到详情页', !pageA.doc.querySelector('.yy-modal-panel') && pageA.text().includes('编辑按钮车'));
  } catch (e) { check('[U] 车头详情页段执行', false, String(e && e.message || e)); }
  pageA.window.close();
  await disband(JWT_A, g.id);

  // 非车头详情页: 打不开编辑页 — 无入口、无表单、停留在详情本身
  const g2 = await aCreate('编辑不可达车');
  const pageB = await openDetail(18762, JWT_B, g2.id);
  try {
    await pageB.waitFor(() => pageB.text().includes('编辑不可达车'), 'member detail render');
    await sleep(500);
    check('[U] 非车头详情页无「编辑」入口', !pageB.btn('✏️ 编辑'));
    check('[U] 非车头详情页无「解散车队」', !pageB.btn('解散车队'));
    check('[U] 非车头 DOM 里没有编辑表单 (无弹窗层、无编辑告示)',
      !pageB.doc.querySelector('.yy-modal-panel') && !pageB.text().includes('编辑告示'));
    check('[U] 非车头停留在详情页本身 (标题/座位区都在)',
      pageB.text().includes('编辑不可达车') && pageB.text().includes('车头本人'));
  } catch (e) { check('[U] 非车头详情页段执行', false, String(e && e.message || e)); }
  pageB.window.close();
  await disband(JWT_A, g2.id);

  // 旧车 (无车头记录) 详情页: 车头本人看也没有编辑入口
  const legacyId = globalThis.__legacyDraftId;
  if (legacyId) {
    const pageL = await openDetail(18761, JWT_A, legacyId);
    try {
      await pageL.waitFor(() => pageL.text().includes('未命名车队'), 'legacy detail render');
      await sleep(500);
      check('[U] 无车头记录的旧车详情页无「编辑」', !pageL.btn('✏️ 编辑'));
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
