// (c) App 侧实时验收: 浏览器以 yy_session cookie 连 GuildHub (Web 端 WS 无法带
// Bearer 头, cookie 与 Bearer 是后端同一条会话校验路径; 原生端走 Bearer 头)。
// 流程: App 打开 294 详情 → Node 侧 API 报名 → 不刷新页面, 名册应自动出现探针。
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const require = createRequire('/home/hatch/workspace/yanyun/yanyun-mobile/package.json');
const WebSocket = require('ws');
const APP = 'http://127.0.0.1:8902';
const BACKEND = 'http://127.0.0.1:8787';
const OUT = '/home/hatch/workspace/yanyun/yanyun-mobile/screenshots';
const CHROME = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + String(extra).slice(0, 140) : ''}`); cond ? pass++ : fail++; };
const token = fs.readFileSync('/tmp/mobile-e2e/token.txt', 'utf8').trim();

async function gql(query, variables) {
  const r = await fetch(`${BACKEND}/graphql`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ query, variables }) });
  return r.json();
}

const chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=9343', '--window-size=420,920', '--user-data-dir=/tmp/mobile-e2e/profile-ws'], { stdio: 'ignore' });
let version = null;
for (let i = 0; i < 30 && !version; i++) { try { version = await (await fetch('http://127.0.0.1:9343/json/version')).json(); } catch { await sleep(700); } }
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((r) => ws.on('open', r));
let msgId = 0; const pending = new Map();
ws.on('message', (d) => { const m = JSON.parse(String(d)); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id); } });
const send = (method, params = {}, sessionId) => new Promise((resolve) => { const id = ++msgId; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); });
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
await send('Network.enable', {}, sessionId);
await send('Network.setCookie', { name: 'yy_session', value: token, url: 'http://127.0.0.1:8787/', path: '/' }, sessionId);
const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, sessionId); if (r?.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 200)); return r?.result?.value; };
const bodyText = () => ev(`document.body ? document.body.innerText : ''`);
async function waitText(substr, timeout = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) { const t = await bodyText().catch(() => ''); if (t && t.includes(substr)) return true; await sleep(600); }
  return false;
}

await send('Page.navigate', { url: APP }, sessionId);
await sleep(3000);
await ev(`localStorage.setItem('yy_session_token', ${JSON.stringify(token)})`);
await send('Page.navigate', { url: `${APP}/guild/mobiletest/grouping/294` }, sessionId);
check('294 详情打开 (名册出现)', await waitText('队伍名册', 15000));
check('初始名册无 WS探针', !(await bodyText()).includes('WS探针'));
await sleep(2500); // 给 WS 建连留时间

const det = await gql('query($s:String,$id:ID!){ groupingDetailPage(slug:$s, id:$id){ grouping { seats { index occupied } } } }', { s: 'mobiletest', id: '294' });
const freeSeat = det?.data?.groupingDetailPage?.grouping?.seats?.find((s) => !s.occupied);
const join = await gql('mutation($i: JoinGroupingInput!){ joinGrouping(input:$i){ ok seats { nickname uid } } }',
  { i: { groupingId: '294', nickname: 'WS探针', weapon: '鸣金·虹', seatIndex: freeSeat.index } });
check('API 侧探针报名成功', join?.data?.joinGrouping?.ok === true);
const uid = join?.data?.joinGrouping?.seats?.find((s) => s.nickname === 'WS探针')?.uid;

const liveOk = await waitText('WS探针', 15000);
check('(c) App 未刷新页面, 名册自动出现 WS探针 (WS ping → 积木树重查)', liveOk);
const shotRes = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
fs.writeFileSync(`${OUT}/08-detail-ws-live.png`, Buffer.from(shotRes.data, 'base64'));
console.log('  screenshot:', `${OUT}/08-detail-ws-live.png`);

if (uid) {
  await gql('mutation($i: LeaveGroupingInput!){ leaveGrouping(input:$i){ ok } }', { i: { groupingId: '294', uid } });
  const goneOk = await (async () => { const t0 = Date.now(); while (Date.now() - t0 < 12000) { const t = await bodyText().catch(() => ''); if (t && !t.includes('WS探针')) return true; await sleep(600); } return false; })();
  check('(c) 离队后 App 同样自动移除该座位', goneOk);
}
console.log(`\nCDP-WS pass=${pass} fail=${fail}`);
try { await send('Target.closeTarget', { targetId }); } catch { /* ignore */ }
chrome.kill();
process.exit(fail ? 1 : 0);
