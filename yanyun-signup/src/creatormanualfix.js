/* ---------- 一次性人工归属修正 (2026-10-25 用户口头指令) ----------
 * 背景: creatorbackfill 的 1 号位规则没能解析出 39 / 40 号车 (租户
 * jijiguagua) 的车头 — 39 号 1 号位 Pianlan、40 号 1 号位柧 在座位戳与
 * 本百业名册里都对不上唯一账号。用户直接指定归属, 本 job 只做这两辆
 * 车的一次性修正, 不是规则变更:
 *
 *   39 号: owner 暂时设为「橘橘如笙」的账号 (她不在 39 号车里, 是
 *   38 号车 2 号位)。解析口径 (优先级, 唯一才落):
 *     a) 本百业内 nickname 恰为「橘橘如笙」的 signups 已有 discord_id
 *        戳, 去重后恰一个 -> 用它 (seat-stamp);
 *     b) 否则 guild_members 名册按展示名 (nick 回退 global_name) 恰等
 *        「橘橘如笙」唯一匹配 -> 用它 (roster-unique);
 *     c) 都不行 -> 跳过记审计。
 *
 *   40 号: 找人「be8bo / 木瓜PAPAYA」 (疑似同一人的两个名字: DC 名
 *   be8bo、昵称木瓜PAPAYA; 四个车的报名昵称里都没有, 只能在账号侧
 *   找)。在 users.username、guild_members.nick、guild_members
 *   .global_name、该百业绑定服务器的 user_guild_nicks.nick 四个来源
 *   里对两个名字做不分大小写恰等匹配, 汇总去重 discord_id:
 *   恰一个 -> 设为 owner (account-match); 零个 -> not-found;
 *   多个 -> ambiguous 跳过, 审计 detail 按名字分开记录各命中账号/来源。
 *
 * 与 creatorbackfill 同套安全模型: settings 全局标志
 * creator_manual_fix_v1 守卫 + 幂等 (只在 creator 仍为 NULL/'' 时写,
 * 并发/重复触发不覆盖已有值); 审计复用 creator_backfill_log (reason
 * 以 manual-fix: 前缀标明 job 与来源, detail 列记解析明细, 本文件懒
 * DDL 补列)。host 安全闸与 backfill 完全一致: 仅生产 host
 * (yanyun.app / yanyun.tbdlab.workers.dev) 触发, preview
 * (release-yanyun) 与生产共用 D1, 绝不在 preview/localhost 跑、
 * 绝不写标志。名单/账号数据只在 Worker 侧查。 */
import { ensureEventCreatorColumn } from './graphql.js';
import { ensureGuildMembersTable } from './reminder.ts';
import { ensureCreatorBackfillLog } from './creatorbackfill.js';
import { ensureSchema as ensureUsersTable, ensureNickStore } from './auth.js';

const PROD_HOSTS = new Set(['yanyun.app', 'yanyun.tbdlab.workers.dev']);
const FLAG_KEY = 'creator_manual_fix_v1';
const TENANT = 'jijiguagua';
const CAR39 = { eventId: 39, name: '橘橘如笙' };
const CAR40 = { eventId: 40, names: ['be8bo', '木瓜PAPAYA'] };
// 同 isolate 内同一 DB 只尝试一次 (与 backfill 同法)。
const attemptedDbs = new WeakSet();

/* creator_backfill_log.detail 列 (懒 DDL, 与 ensureEventCreatorColumn
 * 同模式): 存解析明细 JSON (每辆车一行审计, detail 说清命中过程)。 */
let logDetailColReady = null;
function ensureBackfillLogDetailColumn(db) {
  if (!logDetailColReady) {
    logDetailColReady = (async () => {
      try {
        await ensureCreatorBackfillLog(db);
        const { results } = await db.prepare('PRAGMA table_info(creator_backfill_log)').all();
        const cols = new Set((results || []).map((r) => r.name));
        if (!cols.has('detail')) {
          await db.prepare('ALTER TABLE creator_backfill_log ADD COLUMN detail TEXT').run();
        }
      } catch { /* 列已存在等情况静默 */ }
    })();
  }
  return logDetailColReady;
}

async function getGlobalFlag(db) {
  const row = await db.prepare("SELECT value FROM settings WHERE tenant = '' AND key = ?")
    .bind(FLAG_KEY).first().catch(() => null);
  return row ? String(row.value || '') : '';
}

async function setGlobalFlag(db) {
  await db.prepare(
    "INSERT INTO settings(tenant, key, value) VALUES('', ?, '1') ON CONFLICT(tenant, key) DO UPDATE SET value = excluded.value"
  ).bind(FLAG_KEY).run();
}

async function writeAudit(db, { eventId, tenant, label, resolved, outcome, reason, detail, now }) {
  await db.prepare(
    `INSERT INTO creator_backfill_log
       (event_id, tenant, seat_nickname, resolved_discord_id, outcome, reason, detail, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(eventId, tenant, label, resolved, outcome, reason, detail || '', now)
    .run().catch(() => {});
}

async function loadEvent(db, eventId) {
  return db.prepare('SELECT id, tenant, creator_discord_id FROM events WHERE id = ?')
    .bind(eventId).first().catch(() => null);
}

/* 守卫式落戳: creator 仍为空才写, 返回是否真的写入。 */
async function stampCreator(db, eventId, discordId) {
  const r = await db.prepare(
    `UPDATE events SET creator_discord_id = ?
     WHERE id = ? AND (creator_discord_id IS NULL OR creator_discord_id = '')`
  ).bind(discordId, eventId).run();
  return !!(r.meta && r.meta.changes);
}

/* 39 号解析: 座位戳 (本百业内恰名) -> 名册展示名唯一, 唯一才落。 */
async function resolveCar39(db) {
  const { results: stampRows } = await db.prepare(
    `SELECT s.discord_id AS did FROM signups s JOIN events e ON e.id = s.event_id
     WHERE e.tenant = ? AND s.nickname = ?
       AND s.discord_id IS NOT NULL AND s.discord_id != ''`
  ).bind(TENANT, CAR39.name).all().catch(() => ({ results: [] }));
  const stampIds = [...new Set((stampRows || [])
    .map((r) => String(r.did || '').trim()).filter(Boolean))];
  const { results: roster } = await db.prepare(
    'SELECT discord_id, nick, global_name FROM guild_members WHERE tenant = ?'
  ).bind(TENANT).all().catch(() => ({ results: [] }));
  const rosterIds = [...new Set((roster || [])
    .filter((r) => (String(r.nick || '').trim() || String(r.global_name || '').trim()) === CAR39.name)
    .map((r) => String(r.discord_id)))];
  const detail = (source) => JSON.stringify({
    target: CAR39.name, seatStampIds: stampIds, rosterIds, source,
  });
  if (stampIds.length === 1) {
    return { resolved: stampIds[0], reason: 'manual-fix:seat-stamp', detail: detail('seat-stamp') };
  }
  if (rosterIds.length === 1) {
    return { resolved: rosterIds[0], reason: 'manual-fix:roster-unique', detail: detail('roster-unique') };
  }
  const ambiguous = stampIds.length > 1 || rosterIds.length > 1;
  return { resolved: null, reason: ambiguous ? 'manual-fix:ambiguous' : 'manual-fix:no-match', detail: detail(null) };
}

/* 40 号解析: 两个名字在账号侧四来源不分大小写恰等匹配, 汇总去重。 */
async function resolveCar40(db) {
  const wanted = CAR40.names.map((n) => n.toLowerCase());
  // perName: 名字 -> Map(discord_id -> Set(来源))
  const perName = new Map(CAR40.names.map((n) => [n, new Map()]));
  const hit = (nameIdx, discordId, source) => {
    const m = perName.get(CAR40.names[nameIdx]);
    const id = String(discordId || '').trim();
    if (!id) return;
    if (!m.has(id)) m.set(id, new Set());
    m.get(id).add(source);
  };
  const matchIdx = (value) => wanted.indexOf(String(value || '').trim().toLowerCase());
  // 来源 1: users.username (全站账号)
  const { results: users } = await db.prepare('SELECT discord_id, username FROM users')
    .all().catch(() => ({ results: [] }));
  for (const u of users || []) {
    const i = matchIdx(u.username);
    if (i >= 0) hit(i, u.discord_id, 'users.username');
  }
  // 来源 2/3: 本百业名册 nick / global_name (任一列恰等任一名字)
  const { results: roster } = await db.prepare(
    'SELECT discord_id, nick, global_name FROM guild_members WHERE tenant = ?'
  ).bind(TENANT).all().catch(() => ({ results: [] }));
  for (const r of roster || []) {
    const iNick = matchIdx(r.nick);
    if (iNick >= 0) hit(iNick, r.discord_id, 'guild_members.nick');
    const iGlobal = matchIdx(r.global_name);
    if (iGlobal >= 0) hit(iGlobal, r.discord_id, 'guild_members.global_name');
  }
  // 来源 4: 该百业绑定服务器的昵称快照 user_guild_nicks.nick
  const dgidRow = await db.prepare('SELECT value FROM settings WHERE tenant = ? AND key = ?')
    .bind(TENANT, 'discord_guild_id').first().catch(() => null);
  const dgid = dgidRow ? String(dgidRow.value || '').trim() : '';
  if (dgid) {
    const { results: nicks } = await db.prepare(
      'SELECT discord_id, nick FROM user_guild_nicks WHERE guild_id = ?'
    ).bind(dgid).all().catch(() => ({ results: [] }));
    for (const n of nicks || []) {
      const i = matchIdx(n.nick);
      if (i >= 0) hit(i, n.discord_id, 'user_guild_nicks.nick');
    }
  }
  const allIds = new Set();
  perName.forEach((m) => m.forEach((_, id) => allIds.add(id)));
  const detailObj = {};
  perName.forEach((m, name) => {
    detailObj[name] = {};
    m.forEach((sources, id) => { detailObj[name][id] = [...sources]; });
  });
  const detail = JSON.stringify(detailObj);
  if (allIds.size === 1) {
    return { resolved: [...allIds][0], reason: 'manual-fix:account-match', detail };
  }
  if (allIds.size === 0) return { resolved: null, reason: 'manual-fix:not-found', detail };
  return { resolved: null, reason: 'manual-fix:ambiguous', detail };
}

/* 单车处理: 无论结果如何恰写一行审计; 只在 creator 仍为空时落戳。 */
async function processCar(db, spec, resolver, now) {
  const ev = await loadEvent(db, spec.eventId);
  const label = spec.label;
  if (!ev) {
    await writeAudit(db, {
      eventId: spec.eventId, tenant: TENANT, label, resolved: null,
      outcome: 'skipped', reason: 'manual-fix:event-missing', detail: '', now,
    });
    return 'skipped';
  }
  const tenant = String(ev.tenant || '');
  if (tenant !== TENANT) {
    await writeAudit(db, {
      eventId: spec.eventId, tenant, label, resolved: null,
      outcome: 'skipped', reason: 'manual-fix:tenant-mismatch',
      detail: JSON.stringify({ tenant }), now,
    });
    return 'skipped';
  }
  const existing = String(ev.creator_discord_id || '').trim();
  if (existing) {
    await writeAudit(db, {
      eventId: spec.eventId, tenant, label, resolved: null,
      outcome: 'skipped', reason: 'manual-fix:already-set',
      detail: JSON.stringify({ existing }), now,
    });
    return 'skipped';
  }
  const r = await resolver(db);
  if (r.resolved) {
    const wrote = await stampCreator(db, spec.eventId, r.resolved);
    if (wrote) {
      await writeAudit(db, {
        eventId: spec.eventId, tenant, label, resolved: r.resolved,
        outcome: 'stamped', reason: r.reason, detail: r.detail, now,
      });
      return 'stamped';
    }
    await writeAudit(db, {
      eventId: spec.eventId, tenant, label, resolved: null,
      outcome: 'skipped', reason: 'manual-fix:raced', detail: r.detail, now,
    });
    return 'skipped';
  }
  await writeAudit(db, {
    eventId: spec.eventId, tenant, label, resolved: null,
    outcome: 'skipped', reason: r.reason, detail: r.detail, now,
  });
  return 'skipped';
}

/* 核心 job (不含 host/isolate 闸, 供验收 harness 直接调用)。
 * 返回 { done:true, stamped, skipped } 或 { done:false, reason }。 */
export async function runCreatorManualFixOnce(db) {
  if ((await getGlobalFlag(db)) === '1') return { done: false, reason: 'flag-set' };
  await ensureEventCreatorColumn(db);
  await ensureGuildMembersTable(db);
  await ensureCreatorBackfillLog(db);
  await ensureBackfillLogDetailColumn(db);
  await ensureUsersTable(db).catch(() => {});
  await ensureNickStore(db).catch(() => {});
  const now = Math.floor(Date.now() / 1000);
  let stamped = 0, skipped = 0;
  const r39 = await processCar(db,
    { eventId: CAR39.eventId, label: CAR39.name }, resolveCar39, now);
  if (r39 === 'stamped') stamped++; else skipped++;
  const r40 = await processCar(db,
    { eventId: CAR40.eventId, label: CAR40.names.join('/') }, resolveCar40, now);
  if (r40 === 'stamped') stamped++; else skipped++;
  await setGlobalFlag(db);
  return { done: true, stamped, skipped };
}

/* 触发入口: worker 在 /graphql 上以 waitUntil 调用, 与 backfill 同法。
 * 全程容错, 失败静默 (标志未置位则下个生产请求再试)。 */
export async function maybeRunCreatorManualFix(env, request) {
  try {
    if (!env || !env.DB || !request) return { done: false, reason: 'no-env' };
    let host = '';
    try { host = new URL(request.url).hostname; } catch { return { done: false, reason: 'bad-url' }; }
    if (!PROD_HOSTS.has(host)) return { done: false, reason: 'host-not-prod' };
    if (attemptedDbs.has(env.DB)) return { done: false, reason: 'isolate-latch' };
    attemptedDbs.add(env.DB);
    return await runCreatorManualFixOnce(env.DB);
  } catch {
    return { done: false, reason: 'error' };
  }
}
