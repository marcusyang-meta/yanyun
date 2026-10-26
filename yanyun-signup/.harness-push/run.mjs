// Expo push channel acceptance (local wrangler dev + stub webhook
// receiver):
//  A) GraphQL registerPushToken: valid token lands in the table /
//     invalid token rejected / anonymous rejected; unregisterPushToken:
//     the row disappears; register again for B.
//  B) Departure-reminder dual channel: fixture car at T-9min (stamped
//     seat + fake token); a WS connection triggers GuildHub to
//     reschedule the alarm -> sends when due: the Discord stub receives
//     the original text (channel intact), events.reminder_sent_at is
//     settled, and Expo's DeviceNotRegistered ticket for the fake
//     token self-cleans push_tokens.
import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);
const ROOT = new URL('../', import.meta.url).pathname;
const WORKER = 'http://localhost:8797';
const STUB_PORT = 18755;
const SLUG = 'pushtest';
const DGID = '555000111222333444';
const FAKE_TOKEN = 'ExponentPushToken[push-harness-fake-0001]';
const devVars = fs.readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8');
const SECRET = (devVars.match(/^SESSION_SECRET=(.*)$/m) || [])[1]?.trim();
if (!SECRET) { console.log('NO SESSION_SECRET'); process.exit(1); }

let pass = 0, fail = 0;
function check(name, ok, extra = '') {
  if (ok) pass++; else fail++;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (extra ? ' — ' + extra : ''));
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- JWT (same HS256 format as auth) ---------- */
const b64u = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
function mintJwt(sub = '2001', name = '车头甲') {
  const now = Math.floor(Date.now() / 1000);
  const head = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64u(JSON.stringify({ sub, name, avatar: '', guilds: [DGID], iat: now, exp: now + 3600 }));
  const sig = crypto.createHmac('sha256', SECRET).update(`${head}.${body}`).digest();
  return `${head}.${body}.${b64u(sig)}`;
}
const JWT = mintJwt();

/* ---------- Direct D1 writes (local) ---------- */
async function d1(sql) {
  const { stdout } = await execFileP('npx', ['wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--json', '--command', sql], { cwd: ROOT });
  const i = stdout.indexOf('[');
  const arr = i >= 0 ? JSON.parse(stdout.slice(i)) : [];
  return arr[0]?.results || [];
}
async function d1Try(sql) { try { return await d1(sql); } catch { return []; } }

/* ---------- Stub receiver (Discord webhook + Expo Push API replay) ----------
 * A local workerd outbound fetch to exp.host has its TLS broken by this
 * machine's egress proxy (observed: corrupt message), so Expo goes
 * through a local EXPO_PUSH_BASE replay; the replayed ticket is the
 * verbatim response previously obtained by curling the real exp.host
 * directly (same fake token):
 * {"data":[{"status":"error","message":"\"ExponentPushToken[...]\" is not a
 * registered push notification recipient or it is associated with a project
 * that does not exist.","details":{"error":"DeviceNotRegistered",...}}]} */
const received = [];
const expoCalls = [];
const stub = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const text = Buffer.concat(chunks).toString('utf8');
    if (req.url.startsWith('/--/api/v2/push/send')) {
      try { expoCalls.push(JSON.parse(text)); } catch { /* */ }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        data: [{
          status: 'error',
          message: `"${FAKE_TOKEN}" is not a registered push notification recipient or it is associated with a project that does not exist.`,
          details: { error: 'DeviceNotRegistered', expoPushToken: FAKE_TOKEN },
        }],
      }));
      return;
    }
    if (req.url.startsWith('/--/api/v2/push/getReceipts')) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ data: {} }));
      return;
    }
    try { received.push(JSON.parse(text)); } catch { /* */ }
    res.writeHead(204); res.end();
  });
});
await new Promise((r) => stub.listen(STUB_PORT, r));

/* ---------- Fixture seeding ---------- */
const nowSec = Math.floor(Date.now() / 1000);
// Seed at T-11 minutes first (reminder time still in the future): this
// stops a leftover local DO alarm from settling the car early during a
// dev cold start; phase B then moves departure to T-9 and triggers it.
const startsAt = nowSec + 660;
await d1Try(`DELETE FROM event_reminders WHERE event_id IN (SELECT id FROM events WHERE tenant='${SLUG}')`);
await d1Try(`DELETE FROM signups WHERE event_id IN (SELECT id FROM events WHERE tenant='${SLUG}')`);
await d1Try(`DELETE FROM events WHERE tenant='${SLUG}'`);
await d1Try(`DELETE FROM settings WHERE tenant='${SLUG}'`);
await d1Try(`DELETE FROM guild_members WHERE tenant='${SLUG}'`);
await d1Try(`DELETE FROM push_tokens WHERE discord_id='2001'`);
await d1Try(`DELETE FROM tenants WHERE slug='${SLUG}'`);
await d1(`INSERT INTO tenants (slug, guild_name, password_hash, discord_webhook)
  VALUES ('${SLUG}', '推送验收百业', 'x', 'http://localhost:${STUB_PORT}/hook')`);
await d1(`INSERT INTO settings (tenant, key, value) VALUES ('${SLUG}', 'reminder_enabled', '1')
  ON CONFLICT(tenant, key) DO UPDATE SET value = excluded.value`);
await d1(`INSERT INTO settings (tenant, key, value) VALUES ('${SLUG}', 'discord_guild_id', '${DGID}')
  ON CONFLICT(tenant, key) DO UPDATE SET value = excluded.value`);
await d1(`INSERT INTO users (discord_id, username, avatar, guilds_json)
  VALUES ('2001', '车头甲', '', '["${DGID}"]')
  ON CONFLICT(discord_id) DO UPDATE SET username = excluded.username, guilds_json = excluded.guilds_json`);
await d1(`INSERT INTO user_oauth (discord_id, refresh_token, scope, refresh_state)
  VALUES ('2001', 'fake-refresh', 'identify guilds guilds.members.read', 'ok')
  ON CONFLICT(discord_id) DO UPDATE SET refresh_token = excluded.refresh_token, scope = excluded.scope, refresh_state = 'ok'`);
await d1(`INSERT INTO guild_members (tenant, discord_id, nick, global_name, updated_at)
  VALUES ('${SLUG}', '2001', '车头甲', 'GlobalA', ${nowSec})
  ON CONFLICT(tenant, discord_id) DO UPDATE SET nick = excluded.nick, global_name = excluded.global_name`);
await d1(`INSERT INTO events (tenant, title, type, description, starts_at_utc, max_slots, status, origin, created_by, creator_discord_id, dungeon)
  VALUES ('${SLUG}', '推送验收车 · 今晚双十', 'activity', '', ${startsAt}, 10, 'open', 'member', '车头甲', '2001', '玉魄染青苍')`);
const evRows = await d1(`SELECT id FROM events WHERE tenant='${SLUG}' ORDER BY id DESC LIMIT 1`);
const eventId = evRows[0]?.id;
check('夹具车已播种', !!eventId, `event=${eventId}`);
await d1(`INSERT INTO signups (event_id, nickname, uid, weapon, discord_id)
  VALUES (${eventId}, '车头甲', 'u2001', '破竹·樽', '2001')`);

/* ---------- Start wrangler dev ---------- */
// The port must be free: a leftover dev process from a previous round
// would impersonate this one (kill only kills the npx wrapper; the
// workerd child is orphaned), so pre-check before starting and kill by
// process group at teardown.
const portFree = await new Promise((resolve) => {
  const s = http.createServer();
  s.once('error', () => resolve(false));
  s.listen(8797, () => s.close(() => resolve(true)));
});
if (!portFree) { console.log('FAIL  端口 8797 被占用 (残留 wrangler dev?), 先清理'); process.exit(1); }
const devLog = [];
const dev = spawn('npx', ['wrangler', 'dev', '--port', '8797', '--local',
  '--var', `EXPO_PUSH_BASE:http://localhost:${STUB_PORT}`], { cwd: ROOT, detached: true });
dev.stdout.on('data', (d) => devLog.push(String(d)));
dev.stderr.on('data', (d) => devLog.push(String(d)));
let up = false;
for (let i = 0; i < 60 && !up; i++) {
  try { const r = await fetch(WORKER + '/'); if (r.status) up = true; } catch { await sleep(1000); }
}
check('wrangler dev 已启动', up);
await sleep(6000); // Drain cold-start firings of leftover local DO alarms (the fixture car is not due yet, so no side effects).

/* ---------- A) Register / unregister ---------- */
async function gql(query, variables, auth = true) {
  const r = await fetch(WORKER + '/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(auth ? { authorization: `Bearer ${JWT}` } : {}) },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
}
const REG = 'mutation($t: String!, $p: String) { registerPushToken(token: $t, platform: $p) { ok error errorCode } }';
const UNREG = 'mutation($t: String!) { unregisterPushToken(token: $t) { ok error errorCode } }';

const r1 = await gql(REG, { t: FAKE_TOKEN, p: 'ios' });
check('registerPushToken 合法令牌 ok', r1?.data?.registerPushToken?.ok === true, JSON.stringify(r1).slice(0, 160));
let rows = await d1(`SELECT discord_id, token, platform FROM push_tokens WHERE discord_id='2001'`);
check('push_tokens 落表 1 行', rows.length === 1 && rows[0].token === FAKE_TOKEN && rows[0].platform === 'ios', JSON.stringify(rows));

const r2 = await gql(REG, { t: 'not-a-token', p: 'ios' });
check('非法令牌被拒 (pushTokenInvalid)', r2?.data?.registerPushToken?.ok === false
  && r2?.data?.registerPushToken?.errorCode === 'pushTokenInvalid', JSON.stringify(r2?.data?.registerPushToken || {}));

const r3 = await gql(REG, { t: FAKE_TOKEN, p: 'ios' }, false);
check('匿名注册被拒 (loginRequired)', r3?.data?.registerPushToken?.ok === false
  && r3?.data?.registerPushToken?.errorCode === 'loginRequired', JSON.stringify(r3?.data?.registerPushToken || {}));

const r4 = await gql(UNREG, { t: FAKE_TOKEN });
check('unregisterPushToken ok', r4?.data?.unregisterPushToken?.ok === true);
rows = await d1(`SELECT token FROM push_tokens WHERE discord_id='2001'`);
check('注销后行消失', rows.length === 0);

const r5 = await gql(REG, { t: FAKE_TOKEN, p: 'ios' });
check('重新注册供 alarm 验收', r5?.data?.registerPushToken?.ok === true);

/* ---------- B) WS-triggered reschedule -> alarm dual-channel send ---------- */
// Token in place (direct write simulating registered state) + departure moved to T-9 minutes (reminder time already past).
await d1(`INSERT INTO push_tokens (discord_id, token, platform, updated_at)
  VALUES ('2001', '${FAKE_TOKEN}', 'ios', ${Math.floor(Date.now() / 1000)})
  ON CONFLICT(discord_id, token) DO UPDATE SET platform = excluded.platform`);
await d1(`UPDATE events SET starts_at_utc = ${Math.floor(Date.now() / 1000) + 540} WHERE id = ${eventId}`);
const wsResult = await new Promise((resolve) => {
  const key = crypto.randomBytes(16).toString('base64');
  const req = http.request({
    host: 'localhost', port: 8797, path: `/ws/guild/${SLUG}`,
    headers: {
      Connection: 'Upgrade', Upgrade: 'websocket',
      'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': '13',
      Cookie: `yy_session=${JWT}`,
    },
  });
  req.on('upgrade', (res, socket) => { socket.destroy(); resolve('upgraded'); });
  req.on('response', (res) => resolve('http-' + res.statusCode));
  req.on('error', (e) => resolve('error-' + e.message));
  req.end();
  setTimeout(() => resolve('timeout'), 8000);
});
check('WS 连接触发 DO (101)', wsResult === 'upgraded', wsResult);

let stubHit = null;
for (let i = 0; i < 40 && !stubHit; i++) {
  if (received.length) stubHit = received[0];
  else await sleep(1000);
}
check('Discord stub 收到提醒 (通道未破坏)', !!stubHit);
if (stubHit) {
  check('Discord 文案含车名与就位确认首行',
    String(stubHit.content || '').includes('推送验收车') && String(stubHit.content || '').includes('发起了就位确认'),
    String(stubHit.content || '').split('\n')[0]);
}
const evAfter = await d1(`SELECT reminder_sent_at, reminder_error FROM events WHERE id=${eventId}`);
check('events.reminder_sent_at 已落定', !!(evAfter[0] && evAfter[0].reminder_sent_at), JSON.stringify(evAfter[0] || {}));

let cleaned = false;
for (let i = 0; i < 60 && !cleaned; i++) {
  rows = await d1(`SELECT token FROM push_tokens WHERE discord_id='2001'`);
  if (rows.length === 0) cleaned = true;
  else await sleep(1500);
}
check('Expo DeviceNotRegistered -> 假令牌自清', cleaned);
check('Expo 发送端点被调用', expoCalls.length >= 1, `calls=${expoCalls.length}`);
if (expoCalls.length) {
  const msg = (expoCalls[0] || [])[0] || {};
  check('Expo payload: to/文案/data 跳转齐全',
    msg.to === FAKE_TOKEN
    && String(msg.title || '').includes('推送验收百业')
    && String(msg.body || '').includes('推送验收车')
    && msg.data && msg.data.slug === SLUG && String(msg.data.groupingId) === String(eventId),
    JSON.stringify(msg).slice(0, 220));
}
const pushLogLines = devLog.join('').split('\n').filter((l) => l.includes('[push]'));
console.log('--- worker [push] 日志 ---');
for (const l of pushLogLines) console.log(l.trim());
check('worker 日志含 [push] 发送记录', pushLogLines.length > 0);
if (fail > 0) {
  console.log('--- worker 日志尾部 (诊断) ---');
  for (const l of devLog.join('').split('\n').slice(-15)) console.log(l);
}

/* ---------- C) Advanced reminders: multi-beat + nag-only-not-ready ----------
 * Offsets [30,10]: the 30-minute beat @s everyone and sends NO push;
 * after the leader marks ready, the 10-minute beat @s only the
 * not-ready member and the push goes only to that member's token. */
await sleep(2000);
const TOKEN2 = 'ExponentPushToken[push-harness-fake-0002]';
const nowC = Math.floor(Date.now() / 1000);
await d1(`INSERT INTO users (discord_id, username, avatar, guilds_json)
  VALUES ('2002', '队员乙', '', '["${DGID}"]')
  ON CONFLICT(discord_id) DO UPDATE SET username = excluded.username, guilds_json = excluded.guilds_json`);
await d1(`INSERT INTO user_oauth (discord_id, refresh_token, scope, refresh_state)
  VALUES ('2002', 'fake-refresh', 'identify guilds guilds.members.read', 'ok')
  ON CONFLICT(discord_id) DO UPDATE SET refresh_token = excluded.refresh_token, scope = excluded.scope, refresh_state = 'ok'`);
await d1(`INSERT INTO guild_members (tenant, discord_id, nick, global_name, updated_at)
  VALUES ('${SLUG}', '2002', '队员乙', 'GlobalB', ${nowC})
  ON CONFLICT(tenant, discord_id) DO UPDATE SET nick = excluded.nick, global_name = excluded.global_name`);
await d1(`INSERT INTO settings (tenant, key, value) VALUES ('${SLUG}', 'reminder_offsets', '30,10')
  ON CONFLICT(tenant, key) DO UPDATE SET value = excluded.value`);
await d1(`INSERT INTO settings (tenant, key, value) VALUES ('${SLUG}', 'reminder_custom_text', '今晚稳住')
  ON CONFLICT(tenant, key) DO UPDATE SET value = excluded.value`);
await d1(`INSERT INTO events (tenant, title, type, description, starts_at_utc, max_slots, status, origin, created_by, creator_discord_id, dungeon)
  VALUES ('${SLUG}', '多拍验收车', 'activity', '', ${nowC + 1500}, 10, 'open', 'member', '车头甲', '2001', '')`);
const evCRows = await d1(`SELECT id FROM events WHERE tenant='${SLUG}' AND title='多拍验收车' ORDER BY id DESC LIMIT 1`);
const eventCId = evCRows[0]?.id;
check('多拍夹具车已播种', !!eventCId, `event=${eventCId}`);
await d1(`INSERT INTO signups (event_id, nickname, uid, weapon, discord_id)
  VALUES (${eventCId}, '车头甲', 'u2001c', '破竹·樽', '2001'), (${eventCId}, '队员乙', 'u2002c', '鸣金·虹', '2002')`);
await d1(`INSERT INTO push_tokens (discord_id, token, platform, updated_at)
  VALUES ('2001', '${FAKE_TOKEN}', 'ios', ${nowC}), ('2002', '${TOKEN2}', 'android', ${nowC})
  ON CONFLICT(discord_id, token) DO UPDATE SET platform = excluded.platform`);

async function wsTrigger() {
  return new Promise((resolve) => {
    const key = crypto.randomBytes(16).toString('base64');
    const req = http.request({
      host: 'localhost', port: 8797, path: `/ws/guild/${SLUG}`,
      headers: {
        Connection: 'Upgrade', Upgrade: 'websocket',
        'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': '13',
        Cookie: `yy_session=${JWT}`,
      },
    });
    req.on('upgrade', (res, socket) => { socket.destroy(); resolve('upgraded'); });
    req.on('response', (res) => resolve('http-' + res.statusCode));
    req.on('error', (e) => resolve('error-' + e.message));
    req.end();
    setTimeout(() => resolve('timeout'), 8000);
  });
}
async function waitDiscord(count, timeoutMs = 45000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    if (received.length >= count) return true;
    await sleep(1000);
  }
  return received.length >= count;
}

const baseDiscord = received.length;
const baseExpo = expoCalls.length;
await wsTrigger();
check('多拍: 第一拍 Discord 已达 (30 分钟提前量)', await waitDiscord(baseDiscord + 1));
const beat1 = received[baseDiscord] || {};
const beat1Users = beat1?.allowed_mentions?.users || [];
check('多拍: 第一拍 @ 全部落座者', beat1Users.includes('2001') && beat1Users.includes('2002'), JSON.stringify(beat1Users));
check('多拍: 自定义文案进入真实卡片', String(beat1?.embeds?.[0]?.description || '').includes('今晚稳住'),
  String(beat1?.embeds?.[0]?.description || ''));
check('多拍: 第一拍不发 Expo 推送', expoCalls.length === baseExpo, `calls=${expoCalls.length} base=${baseExpo}`);
let beatRows = await d1(`SELECT offset_min, sent_at FROM event_reminders WHERE event_id=${eventCId} ORDER BY offset_min`);
check('多拍: (车,30) 拍已结算', beatRows.length === 1 && Number(beatRows[0].offset_min) === 30 && !!beatRows[0].sent_at, JSON.stringify(beatRows));
const evCMid = await d1(`SELECT reminder_sent_at FROM events WHERE id=${eventCId}`);
check('多拍: 第一拍后整车未结算', !!(evCMid[0] && !evCMid[0].reminder_sent_at), JSON.stringify(evCMid[0] || {}));

/* The leader marks ready through the real GraphQL mutation. */
async function gqlAs(query, variables, jwt) {
  const r = await fetch(WORKER + '/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
}
const READY = 'mutation($i: SetSeatReadyInput!) { setSeatReady(input: $i) { ok error errorCode seats { nickname ready mine } } }';
const rr = await gqlAs(READY, { i: { groupingId: String(eventCId), ready: true } }, JWT);
check('setSeatReady ok (车头本人)', rr?.data?.setSeatReady?.ok === true, JSON.stringify(rr?.data?.setSeatReady || rr?.errors || {}).slice(0, 200));
const readySeat = (rr?.data?.setSeatReady?.seats || []).find((s) => s.nickname === '车头甲');
check('setSeatReady 回带座位 ready/mine', !!readySeat && readySeat.ready === true && readySeat.mine === true, JSON.stringify(readySeat || {}));
const suRow = await d1(`SELECT ready_at FROM signups WHERE event_id=${eventCId} AND discord_id='2001'`);
check('就位已落库 (signups.ready_at)', !!(suRow[0] && suRow[0].ready_at), JSON.stringify(suRow[0] || {}));

/* Move departure inside the 10-minute window and trigger the last beat. */
await d1(`UPDATE events SET starts_at_utc = ${Math.floor(Date.now() / 1000) + 540} WHERE id = ${eventCId}`);
await wsTrigger();
check('多拍: 第二拍 Discord 已达 (10 分钟提前量)', await waitDiscord(baseDiscord + 2));
const beat2 = received[baseDiscord + 1] || {};
const beat2Users = beat2?.allowed_mentions?.users || [];
check('多拍: 第二拍只 @ 未就位者', !beat2Users.includes('2001') && beat2Users.includes('2002'), JSON.stringify(beat2Users));
check('多拍: 末拍 Expo 推送已发', expoCalls.length > baseExpo, `calls=${expoCalls.length} base=${baseExpo}`);
const phaseCMsgs = expoCalls.slice(baseExpo).flat();
check('多拍: 末拍推送只达未就位者令牌', phaseCMsgs.length >= 1 && phaseCMsgs.every((m) => m.to === TOKEN2),
  JSON.stringify(phaseCMsgs.map((m) => m.to)));
beatRows = await d1(`SELECT offset_min FROM event_reminders WHERE event_id=${eventCId} ORDER BY offset_min`);
check('多拍: 两拍结算行齐备', beatRows.length === 2, JSON.stringify(beatRows));
const evCEnd = await d1(`SELECT reminder_sent_at FROM events WHERE id=${eventCId}`);
check('多拍: 末拍后整车结算 reminder_sent_at', !!(evCEnd[0] && evCEnd[0].reminder_sent_at), JSON.stringify(evCEnd[0] || {}));

/* ---------- Teardown ---------- */
try { process.kill(-dev.pid, 'SIGTERM'); } catch { dev.kill('SIGTERM'); }
stub.close();
await d1Try(`DELETE FROM event_reminders WHERE event_id IN (SELECT id FROM events WHERE tenant='${SLUG}')`);
await d1Try(`DELETE FROM push_tokens WHERE discord_id='2002'`);
await d1Try(`DELETE FROM signups WHERE event_id=${eventId}`);
await d1Try(`DELETE FROM events WHERE tenant='${SLUG}'`);
await d1Try(`DELETE FROM settings WHERE tenant='${SLUG}'`);
await d1Try(`DELETE FROM guild_members WHERE tenant='${SLUG}'`);
await d1Try(`DELETE FROM tenants WHERE slug='${SLUG}'`);
console.log(`\n== ${pass} passed, ${fail} failed ==`);
process.exit(fail ? 1 : 0);
