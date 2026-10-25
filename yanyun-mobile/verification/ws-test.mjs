// (c) WS 验收: Bearer 连接 GuildHub → API 报名触发 grouping-changed 帧 → 离队还原
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/hatch/workspace/yanyun/yanyun-mobile/package.json');
const WebSocket = require('ws');
const BACKEND = 'http://127.0.0.1:8787';
const token = fs.readFileSync('/tmp/mobile-e2e/token.txt', 'utf8').trim();
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + String(extra).slice(0, 160) : ''}`); cond ? pass++ : fail++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gql(query, variables) {
  const r = await fetch(`${BACKEND}/graphql`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ query, variables }) });
  return r.json();
}

// 1) 匿名 WS 应被拒
const anonResult = await new Promise((resolve) => {
  const ws = new WebSocket('ws://127.0.0.1:8787/ws/guild/mobiletest');
  const to = setTimeout(() => resolve('timeout'), 5000);
  ws.on('open', () => { clearTimeout(to); ws.close(); resolve('opened'); });
  ws.on('error', (e) => { clearTimeout(to); resolve('error:' + (e.message || '').slice(0, 60)); });
  ws.on('unexpected-response', (_req, res) => { clearTimeout(to); resolve('http:' + res.statusCode); });
});
check('匿名 WS 被拒 (403)', anonResult === 'http:403', anonResult);

// 2) Bearer WS 连接
const frames = [];
const ws = new WebSocket('ws://127.0.0.1:8787/ws/guild/mobiletest', { headers: { Authorization: `Bearer ${token}` } });
const opened = await new Promise((resolve) => {
  const to = setTimeout(() => resolve(false), 6000);
  ws.on('open', () => { clearTimeout(to); resolve(true); });
  ws.on('error', () => { clearTimeout(to); resolve(false); });
});
check('Bearer WS 连接 GuildHub 成功', opened);
ws.on('message', (d) => { try { frames.push(JSON.parse(String(d))); } catch { /* ignore */ } });

// 3) 找 294 的一个空位, 以探针昵称报名 (不匹配身份名集合 → 不盖 discord 戳)
const det = await gql('query($s:String,$id:ID!){ groupingDetailPage(slug:$s, id:$id){ grouping { seats { index occupied } } } }', { s: 'mobiletest', id: '294' });
const freeSeat = det?.data?.groupingDetailPage?.grouping?.seats?.find((s) => !s.occupied);
check('294 有空位可供探针报名', !!freeSeat, freeSeat ? `seat ${freeSeat.index}` : JSON.stringify(det).slice(0, 120));
const join = await gql('mutation($i: JoinGroupingInput!){ joinGrouping(input:$i){ ok error seats { index nickname uid occupied } } }',
  { i: { groupingId: '294', nickname: 'WS探针', weapon: '鸣金·虹', seatIndex: freeSeat.index } });
check('探针报名成功', join?.data?.joinGrouping?.ok === true, JSON.stringify(join?.data?.joinGrouping?.error || ''));
const myUid = join?.data?.joinGrouping?.seats?.find((s) => s.nickname === 'WS探针')?.uid;

await sleep(1500);
const changed = frames.filter((f) => f.type === 'grouping-changed');
check('(c) 收到 grouping-changed 推送帧', changed.length >= 1, JSON.stringify(changed[0] || {}));

// 4) 离队还原 + 再收一帧
if (myUid) {
  const leave = await gql('mutation($i: LeaveGroupingInput!){ leaveGrouping(input:$i){ ok error } }', { i: { groupingId: '294', uid: myUid } });
  check('探针离队还原成功', leave?.data?.leaveGrouping?.ok === true);
  await sleep(1200);
  check('(c) 离队同样推送 grouping-changed', frames.filter((f) => f.type === 'grouping-changed').length >= 2, `frames=${frames.length}`);
}
ws.close();
console.log(`\nWS pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);
