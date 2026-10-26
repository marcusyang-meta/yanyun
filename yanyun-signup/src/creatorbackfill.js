/* ---------- 无车头存量车按 1 号位补登记车头 (2026-10-25 用户裁决) ----------
 * 背景: creator_discord_id 落库之前建的成员车没有车头记录, 编辑/完成/
 * 解散的车头闸对谁都不放行。用户裁决归属按「第一个座位是谁」定:
 * 对 origin='member' 且未记录车头的车, 取详情页渲染顺序 (signups
 * ORDER BY id ASC) 的第 1 个座位落座者, 按
 *   座位已有 discord_id 戳 → 本百业名册 (guild_members) 唯一昵称匹配
 * 解析 (名册展示名口径: nick 回退 global_name)。全服/全局匹配不够格
 * 定归属, 不用。唯一解析出账号才补 creator_discord_id; 空座 / 无匹配 /
 * 重名歧义一律跳过并记审计 (creator_backfill_log), 已有车头的车不碰。
 *
 * 一次性懒迁移: settings 全局标志 creator_backfill_v1 守卫 + 幂等
 * (UPDATE 带 creator 为空的守卫条件; 标志位置位后不再跑)。
 *
 * 安全闸 (关键): 只能在生产 host 触发。preview (release-yanyun
 * .tbdlab.workers.dev) 与生产共用同一个 D1 (database_id 相同), 从
 * preview 误跑 = 未经 promote 直接写生产数据 — 故 host 不在白名单
 * (yanyun.app / yanyun.tbdlab.workers.dev) 时绝对不跑, 连标志都不写。 */
import { ensureEventCreatorColumn } from './graphql.js';
import { ensureGuildMembersTable } from './reminder.js';

const PROD_HOSTS = new Set(['yanyun.app', 'yanyun.tbdlab.workers.dev']);
const FLAG_KEY = 'creator_backfill_v1';
// 同 isolate 内同一 DB 只尝试一次 (WeakSet 按 DB 对象记, 测试里换
// FakeDB 天然隔离; 生产同一 env.DB 对象恒定, 闸门语义不变)。
const attemptedDbs = new WeakSet();

let logTableReady = null;
export function ensureCreatorBackfillLog(db) {
  if (!logTableReady) {
    logTableReady = (async () => {
      try {
        await db.prepare(`CREATE TABLE IF NOT EXISTS creator_backfill_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL,
          tenant TEXT,
          seat_nickname TEXT,
          resolved_discord_id TEXT,
          outcome TEXT NOT NULL,
          reason TEXT,
          created_at INTEGER NOT NULL DEFAULT 0
        )`).run();
      } catch { /* 表已存在等情况静默 */ }
    })();
  }
  return logTableReady;
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

/* 核心迁移 (不含 host/isolate 闸, 供验收 harness 直接调用)。
 * 返回 { done:true, stamped, skipped } 或 { done:false, reason }。 */
export async function runCreatorBackfillOnce(db) {
  if ((await getGlobalFlag(db)) === '1') return { done: false, reason: 'flag-set' };
  await ensureEventCreatorColumn(db);
  await ensureGuildMembersTable(db);
  await ensureCreatorBackfillLog(db);
  const now = Math.floor(Date.now() / 1000);
  const { results: events } = await db.prepare(
    `SELECT id, tenant FROM events
     WHERE origin = 'member' AND (creator_discord_id IS NULL OR creator_discord_id = '')
     ORDER BY id ASC`
  ).all();
  // 名册按租户整表取一次 (展示名口径建索引: tenant|name -> discord_id 集合)
  const rosterByTenant = new Map();
  const rosterOf = async (tenant) => {
    if (!rosterByTenant.has(tenant)) {
      const { results } = await db.prepare(
        'SELECT discord_id, nick, global_name FROM guild_members WHERE tenant = ?'
      ).bind(tenant).all().catch(() => ({ results: [] }));
      const byName = new Map();
      for (const r of results || []) {
        const name = String(r.nick || '').trim() || String(r.global_name || '').trim();
        if (!name) continue;
        if (!byName.has(name)) byName.set(name, new Set());
        byName.get(name).add(String(r.discord_id));
      }
      rosterByTenant.set(tenant, byName);
    }
    return rosterByTenant.get(tenant);
  };
  let stamped = 0, skipped = 0;
  for (const ev of events || []) {
    const seat = await db.prepare(
      'SELECT nickname, discord_id FROM signups WHERE event_id = ? ORDER BY id ASC LIMIT 1'
    ).bind(ev.id).first().catch(() => null);
    let outcome = 'skipped', reason = '', resolved = null;
    if (!seat) {
      reason = 'no-seat1';
    } else if (seat.discord_id && String(seat.discord_id).trim()) {
      resolved = String(seat.discord_id).trim();
      outcome = 'stamped'; reason = 'seat-stamp';
    } else {
      const nick = String(seat.nickname || '').trim();
      const hits = nick ? (await rosterOf(String(ev.tenant))).get(nick) : undefined;
      if (hits && hits.size === 1) {
        resolved = [...hits][0];
        outcome = 'stamped'; reason = 'roster-unique';
      } else if (hits && hits.size > 1) {
        reason = 'ambiguous';
      } else {
        reason = 'no-match';
      }
    }
    if (outcome === 'stamped' && resolved) {
      // 守卫式更新: 并发下若已被别处补上, 不覆盖
      const r = await db.prepare(
        `UPDATE events SET creator_discord_id = ?
         WHERE id = ? AND (creator_discord_id IS NULL OR creator_discord_id = '')`
      ).bind(resolved, ev.id).run();
      if (!r.meta || !r.meta.changes) { outcome = 'skipped'; reason = 'raced'; resolved = null; }
    }
    if (outcome === 'stamped') stamped++; else skipped++;
    await db.prepare(
      `INSERT INTO creator_backfill_log
         (event_id, tenant, seat_nickname, resolved_discord_id, outcome, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(ev.id, String(ev.tenant || ''), seat ? String(seat.nickname || '') : '',
      resolved, outcome, reason, now).run().catch(() => {});
  }
  await setGlobalFlag(db);
  return { done: true, stamped, skipped };
}

/* 触发入口: worker 在 /graphql 上以 waitUntil 调用。全程容错, 任何
 * 失败都静默 (迁移失败不影响正常请求; 标志未置位则下个请求再试)。 */
export async function maybeRunCreatorBackfill(env, request) {
  try {
    if (!env || !env.DB || !request) return { done: false, reason: 'no-env' };
    let host = '';
    try { host = new URL(request.url).hostname; } catch { return { done: false, reason: 'bad-url' }; }
    if (!PROD_HOSTS.has(host)) return { done: false, reason: 'host-not-prod' };
    if (attemptedDbs.has(env.DB)) return { done: false, reason: 'isolate-latch' };
    attemptedDbs.add(env.DB);
    return await runCreatorBackfillOnce(env.DB);
  } catch {
    return { done: false, reason: 'error' };
  }
}
