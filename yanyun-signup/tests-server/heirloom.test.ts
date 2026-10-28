// Heirloom push acceptance (local wrangler dev + stub webhook receiver):
//  A) hub endpoints: login -> GET list (unconfigured) -> PUT save
//     (masked, never echoes the full value; invalid URL -> 400) ->
//     enable -> SQL swaps the stored address for the stub -> POST test
//     (test-ok).
//  B) Triggering (gearPlan server-side evaluation, user 2001, livetest
//     roster nickname 车头甲): 1 new heirloom -> repeat evaluation does
//     not resend -> new row id with identical content does not resend
//     -> a dud does not send -> a batch of 3 merges into 1 message ->
//     set completion (1 new-item batch + 1 completion announcement) ->
//     repeat does not send -> breaking the set does not send ->
//     completing again sends only the completion announcement ->
//     disabled does not send -> re-enabling backfills the send.
//  C) Departure-reminder config (settings reminder_* +
//     tenants.discord_webhook) stays unchanged throughout.
import http from 'node:http';
import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { startHeirloomDev, type HeirloomFixture } from './helpers/heirloom-fixture.ts';

const execFileP = promisify(execFile);
const WORKER = 'http://localhost:8799';
const STUB_PORT = 18754;
const SLUG = 'livetest';
let JWT = '';
let ADMIN_PASSWORD = '';
function loadLocalSecrets() {
  JWT = fs.readFileSync('/tmp/jwt-a.txt', 'utf8').trim();
  const devVars = fs.readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8');
  ADMIN_PASSWORD = (devVars.match(/^ADMIN_PASSWORD=(.*)$/m) || [])[1]?.trim();
  if (!ADMIN_PASSWORD) throw new Error('NO LOCAL ADMIN_PASSWORD');
}

let pass = 0, fail = 0;
function check(name, ok, extra = '') {
  if (ok) pass++; else fail++;
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Direct D1 writes (local) ---------- */
async function d1(sql) {
  const { stdout } = await execFileP('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--command', sql], { cwd: new URL('../', import.meta.url).pathname });
  const m = stdout.match(/\[\s*\{[\s\S]*\}\s*\]/);
  const arr = m ? JSON.parse(m[0]) : [];
  return arr[0]?.results || [];
}
async function d1Try(sql) { try { return await d1(sql); } catch { return []; } }

/* ---------- Stub webhook receiver ---------- */
const received = [];
const stub = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    try { received.push(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { /* */ }
    res.writeHead(204); res.end();
  });
});
describe('heirloom', () => {
let fixture: HeirloomFixture;
let reminderBefore: string;
let ref: any, cyOf: Map<any, any>, kit: any[], dud: any, plan: any, fullLoadout: any;
let W1: any, W2: any, GZ: any, XJ: any, HUAN: any, PEI: any, JING: any, WAN: any;
const reminderSnap = async () => JSON.stringify({
  settings: await d1(`SELECT key, value FROM settings WHERE tenant='${SLUG}' AND key LIKE 'reminder%' ORDER BY key`),
  webhook: await d1(`SELECT discord_webhook FROM tenants WHERE slug='${SLUG}'`),
});
beforeAll(async () => {
fixture = await startHeirloomDev();
loadLocalSecrets();
await new Promise((r) => stub.listen(STUB_PORT, r));
});
const STUB_URL = `http://localhost:${STUB_PORT}/hook`;
async function waitCount(n, label, timeout = 8000) {
  const t0 = Date.now();
  while (received.length < n) {
    if (Date.now() - t0 > timeout) throw new Error(`TIMEOUT waiting stub count ${n} (${label}), got ${received.length}`);
    await sleep(120);
  }
}

/* ---------- HTTP helpers ---------- */
async function gql(query, variables, cookie = JWT) {
  const r = await fetch(WORKER + '/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `yy_session=${cookie}` },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
}
let hubToken = '';
async function hub(path, init = {}) {
  const r = await fetch(WORKER + '/api/hub' + path, {
    ...init,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${hubToken}`, ...(init.headers || {}) },
  });
  return { status: r.status, body: await r.json().catch(() => null) };
}

beforeAll(async () => {
/* ---------- Fixture setup ---------- */
await d1Try(`DELETE FROM heirloom_item_pushes WHERE tenant='${SLUG}'`);
await d1Try(`DELETE FROM heirloom_set_state WHERE tenant='${SLUG}'`);
await d1(`DELETE FROM settings WHERE tenant='${SLUG}' AND key LIKE 'heirloom_%'`);
await d1(`INSERT INTO settings (tenant, key, value) VALUES ('${SLUG}', 'discord_guild_id', '424242424242424242')
  ON CONFLICT(tenant, key) DO UPDATE SET value = excluded.value`);
await d1(`INSERT INTO guild_members (tenant, discord_id, nick, global_name, updated_at)
  VALUES ('${SLUG}', '2001', '车头甲', 'GlobalA', ${Math.floor(Date.now() / 1000)})
  ON CONFLICT(tenant, discord_id) DO UPDATE SET nick = excluded.nick, global_name = excluded.global_name`);
reminderBefore = await reminderSnap();

ref = (await gql('{ gradPage { gearDemoKit { slot name keys dingyinName dingyinVal } gearAffixes { key cy } gearBaseFields { key preset } } }')).data;
cyOf = new Map(ref.gradPage.gearAffixes.map((a) => [a.key, a.cy]));
kit = ref.gradPage.gearDemoKit.map((g, i) => ({
  id: 5001 + i, slot: g.slot, name: g.name,
  lines: g.keys.map((k) => ({ key: k, val: cyOf.get(k) ?? 0 })),
  dingyin: g.dingyinName ? { name: g.dingyinName, val: g.dingyinVal } : null,
  schools: [],
}));
[W1, W2, GZ, XJ, HUAN, PEI, JING, WAN] = kit;
dud = {
  id: 5009, slot: '冠胄', name: 'DudFixture',
  lines: ['xiaowai', 'shu_mj_da', 'shu_mj_xiao'].map((k) => ({ key: k, val: cyOf.get(k) ?? 0 })),
  dingyin: null, schools: [],
};
plan = async (lib, loadoutMap) => {
  const resp = await gql('mutation($input: GearPlanInput!) { gearPlan(input: $input) { gearEvals { id verdict } grad { total } } }', {
    input: {
      targetIdx: 0, lib,
      loadout: Object.entries(loadoutMap).map(([slot, gearId]) => ({ slot, gearId })),
      baseValues: ref.gradPage.gearBaseFields.map((f) => ({ key: f.key, val: f.preset })),
      xinfa: [], res: 1.85, extraAcc: 0, extraCrit: 0, extraInt: 0,
      bowKind: '', gradDingyinOn: true, sim: [],
    },
  });
  if (resp.errors) throw new Error('gearPlan error: ' + JSON.stringify(resp.errors).slice(0, 200));
  return resp.data.gearPlan;
};
fullLoadout = { '主武器': W1.id, '副武器': W2.id, '冠胄': GZ.id, '胸甲': XJ.id, '环': HUAN.id, '佩': PEI.id, '胫甲': JING.id, '腕甲': WAN.id };

});

/* ---------- A) hub endpoints ---------- */
it('A) hub endpoints', async () => {
  const login = await fetch(WORKER + '/api/hub/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  }).then((r) => r.json());
  hubToken = login.token || '';
  check('A0 hub 登录 (本地密码)', !!hubToken);

  const list0 = await hub('/heirlooms');
  const row0 = (list0.body?.heirlooms || []).find((x) => x.slug === SLUG);
  check('A1 GET /heirlooms: livetest 初始未配置', !!row0 && row0.webhookSet === false && row0.enabled === false, JSON.stringify(row0));

  const bad = await hub(`/tenants/${SLUG}/heirloom`, { method: 'PUT', body: JSON.stringify({ webhook: 'https://example.com/hook' }) });
  check('A2 PUT 非法 URL -> 400', bad.status === 400, 'status=' + bad.status);

  const fakeUrl = 'https://discord.com/api/webhooks/1111111111111111111/harnessToken_AbC-1234';
  const put = await hub(`/tenants/${SLUG}/heirloom`, { method: 'PUT', body: JSON.stringify({ webhook: fakeUrl }) });
  check('A3 PUT 合法 URL 保存成功', put.status === 200 && put.body?.heirloom?.webhookSet === true);
  check('A4 掩码只露 id + 末 4 位, 不回显 token 全文',
    (put.body?.heirloom?.webhookMasked || '').includes('1111111111111111111')
    && (put.body?.heirloom?.webhookMasked || '').endsWith('1234')
    && !(put.body?.heirloom?.webhookMasked || '').includes('harnessToken'), put.body?.heirloom?.webhookMasked);

  const en = await hub(`/tenants/${SLUG}/heirloom`, { method: 'PUT', body: JSON.stringify({ enabled: true }) });
  check('A5 PUT 启用开关', en.body?.heirloom?.enabled === true);

  // Swap the server-stored address for the stub (direct D1 write, bypassing format validation — the endpoint itself does not re-validate stored values).
  await d1(`UPDATE settings SET value='${STUB_URL}' WHERE tenant='${SLUG}' AND key='heirloom_webhook'`);
  const test = await hub(`/tenants/${SLUG}/heirloom/test`, { method: 'POST' });
  await waitCount(1, 'test message');
  check('A6 POST test -> stub 收到测试消息', received[0].content.includes('传家宝推送已接通') && received[0].username === '燕云百业');
  check('A7 test 状态落 test-ok', test.body?.heirloom?.lastStatus === 'test-ok', JSON.stringify(test.body?.heirloom));
  received.length = 0;
});

/* ---------- B) Triggering ---------- */
it('B) triggering', async () => {
  await plan([W1], {});
  await waitCount(1, 'T1');
  const m1 = received[0];
  check('B1 新传家宝推 1 条', true);
  check('B1 文案: 播报人=名册昵称 车头甲', m1.content.includes('车头甲 录得一件传家宝'), m1.content.split('\n')[2] || '');
  check('B1 文案: 装备名 + 流派套装 + 词条概要 + 恭喜语',
    m1.content.includes('玉斗长剑') && m1.content.includes('鸣金-虹 · 玉斗')
    && m1.content.includes('大外功') && m1.content.includes('恭喜'), m1.content);
  check('B1 身份: 燕云百业 + 品牌头像, @everyone + @本人', m1.username === '燕云百业'
    && (m1.avatar_url || '').includes('og.yanyun.app')
    && m1.content.startsWith('@everyone') && m1.content.includes('<@2001>')
    && JSON.stringify(m1.allowed_mentions) === JSON.stringify({ parse: ['everyone'], users: ['2001'] }), JSON.stringify(m1.allowed_mentions));

  await plan([W1], {});
  await sleep(900);
  check('B2 重复评估不重发', received.length === 1, 'n=' + received.length);

  await plan([{ ...W1, id: 7777 }], {});
  await sleep(900);
  check('B3 换行 id 同内容不重发 (内容哈希去重)', received.length === 1, 'n=' + received.length);

  await plan([dud], {});
  await sleep(900);
  check('B4 dud 不触发', received.length === 1, 'n=' + received.length);

  await plan([GZ, XJ, HUAN], {});
  await waitCount(2, 'T5');
  const m5 = received[1];
  check('B5 批量 3 件合并 1 条', m5.content.includes('一口气录得 3 件传家宝')
    && m5.content.includes('玉斗冠胄') && m5.content.includes('玉斗胸甲') && m5.content.includes('玉斗环'), m5.content.split('\n')[2] || '');

  await plan(kit, fullLoadout);
  await waitCount(4, 'T6');
  const mItem = received[2], mSet = received[3];
  check('B6 集齐评估: 新件批次 1 条 (余 4 件)', mItem.content.includes('一口气录得 4 件传家宝')
    && mItem.content.includes('玉斗副剑') && mItem.content.includes('玉斗佩')
    && mItem.content.includes('玉斗胫甲') && mItem.content.includes('玉斗腕甲'), mItem.content.split('\n')[2] || '');
  check('B6 集齐播报 1 条: 集齐 + 毕业度', mSet.content.includes('集齐全套传家宝') && mSet.content.includes('<@2001>')
    && mSet.content.includes('车头甲') && /毕业度 \d+(\.\d)?%/.test(mSet.content)
    && mSet.content.includes('可以传家的家底'), mSet.content);

  await plan(kit, fullLoadout);
  await sleep(900);
  check('B7 集齐状态重复评估不重发', received.length === 4, 'n=' + received.length);

  const broken = { ...fullLoadout };
  delete broken['腕甲'];
  await plan(kit, broken);
  await sleep(900);
  check('B8 破齐不发 (只重新待命)', received.length === 4, 'n=' + received.length);

  await plan(kit, fullLoadout);
  await waitCount(5, 'T9');
  check('B9 再集齐只补集齐播报 1 条', received[4].content.includes('集齐全套传家宝'), received[4].content.split('\n')[0] || '');
  await sleep(600);
  check('B9 无多余消息', received.length === 5, 'n=' + received.length);

  const variant = { ...W1, id: 6001, lines: W1.lines.map((l, i) => (i === 0 ? { ...l, val: l.val + 0.1 } : l)) };
  await d1(`UPDATE settings SET value='0' WHERE tenant='${SLUG}' AND key='heirloom_enabled'`);
  await plan([variant], {});
  await sleep(900);
  check('B10 停用时新传家宝不发', received.length === 5, 'n=' + received.length);
  await d1(`UPDATE settings SET value='1' WHERE tenant='${SLUG}' AND key='heirloom_enabled'`);
  await plan([variant], {});
  await waitCount(6, 'T10 re-enabled');
  check('B10 复启后补发 (停用期间未预记)', received[5].content.includes('传家宝出世'), received[5].content.split('\n')[0] || '');

  const listEnd = await hub('/heirlooms');
  const rowEnd = (listEnd.body?.heirlooms || []).find((x) => x.slug === SLUG);
  check('B11 portal 状态: lastStatus=ok 且有事件摘要', rowEnd?.lastStatus === 'ok' && !!rowEnd?.lastEvent, JSON.stringify(rowEnd));
});

/* ---------- C) Reminder config untouched ---------- */
it('C) reminder config untouched', async () => {
  const after = await reminderSnap();
  check('C1 开车提醒配置全程未变', after === reminderBefore, after === reminderBefore ? '' : `before=${reminderBefore} after=${after}`);
});

afterAll(() => {
  stub.close();
  fixture.stop();
});
});