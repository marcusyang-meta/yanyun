/* ===================================================
 * events 实体的数据层访问 (Repository)。
 *
 * 业务代码禁止直接拼 SQL 访问 events: 全部走本文件的函数。返回行
 * 沿用旧形态的 snake_case 键, 调用点零感知。单行读取未命中返回
 * null。写操作返回 D1 的 meta (changes / last_row_id), 与旧
 * .run() 结果同形, 调用方的满员/回滚判断口径不变。
 *
 * 写法沿用一期 sql 模板惯用法 + sql.identifier 裸列名内插, 生成
 * SQL 与被替代的旧语句同形 (harness FakeDB 按形路由无需感知)。
 *
 * 红线项 (三期收尾笔收口): 提及解析的 JOIN 单元、容量守卫的原子
 * INSERT ... SELECT、COUNT(DISTINCT nickname) 名册聚合。
 * deleteEventCascade 在数据层内部组合 signups / results 的删除。
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { events, signups, results } = schema;
const col = (name: string) => sql.identifier(name);

export interface EventRow {
  id: number;
  tenant: string;
  title: string;
  type: string;
  description: string;
  starts_at: string | null;
  meet_info: string;
  max_slots: number;
  status: string;
  starts_at_utc: number | null;
  origin: string;
  created_by: string;
  manage_code: string;
  dungeon: string;
  creator_discord_id: string | null;
  reminder_sent_at: number | null;
  reminder_error: string | null;
}

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

/* ---------- 懒 DDL: 增列 (creator 身份列 / 提醒状态列) ---------- */

async function pragmaColumns(d1: D1Database): Promise<Set<string>> {
  const db = createDb(d1);
  const results = await db.all<{ name: string }>(sql`PRAGMA table_info(${events})`);
  return new Set((results || []).map((r) => r.name));
}

let eventCreatorColReady: Promise<void> | null = null;
/** events.creator_discord_id 增列 (车头身份, 解散/编辑/完成只认此列)。 */
export function ensureEventCreatorColumn(d1: D1Database): Promise<void> {
  if (!eventCreatorColReady) {
    eventCreatorColReady = (async () => {
      try {
        const db = createDb(d1);
        const cols = await pragmaColumns(d1);
        if (!cols.has('creator_discord_id')) {
          await db.run(sql`ALTER TABLE ${events} ADD COLUMN ${col('creator_discord_id')} TEXT`);
        }
      } catch { /* 列已存在等情况静默 */ }
    })();
  }
  return eventCreatorColReady;
}

let reminderColsReady: Promise<void> | null = null;
/** events.reminder_sent_at / reminder_error 增列 (提醒结算状态)。 */
export function ensureReminderColumns(d1: D1Database): Promise<void> {
  if (!reminderColsReady) {
    reminderColsReady = (async () => {
      try {
        const db = createDb(d1);
        const cols = await pragmaColumns(d1);
        if (!cols.has('reminder_sent_at')) {
          await db.run(sql`ALTER TABLE ${events} ADD COLUMN ${col('reminder_sent_at')} INTEGER`);
        }
        if (!cols.has('reminder_error')) {
          await db.run(sql`ALTER TABLE ${events} ADD COLUMN ${col('reminder_error')} TEXT`);
        }
      } catch { /* 列已存在等情况静默 */ }
    })();
  }
  return reminderColsReady;
}

/* ---------- 读取 ---------- */

export async function getEventRow(d1: D1Database, id: number): Promise<EventRow | null> {
  const db = createDb(d1);
  const row = await db.get<EventRow>(sql`SELECT * FROM ${events} WHERE ${col('id')} = ${id}`);
  return row ?? null;
}

export async function getEventRowByTenant(d1: D1Database, id: number, tenant: string): Promise<EventRow | null> {
  const db = createDb(d1);
  const row = await db.get<EventRow>(
    sql`SELECT * FROM ${events} WHERE ${col('id')} = ${id} AND ${col('tenant')} = ${tenant}`,
  );
  return row ?? null;
}

export async function getEventIdByTenant(d1: D1Database, id: number, tenant: string): Promise<{ id: number } | null> {
  const db = createDb(d1);
  const row = await db.get<{ id: number }>(
    sql`SELECT ${col('id')} FROM ${events} WHERE ${col('id')} = ${id} AND ${col('tenant')} = ${tenant}`,
  );
  return row ?? null;
}

export async function getEventIdStatusByTenant(
  d1: D1Database, id: number, tenant: string,
): Promise<{ id: number; status: string } | null> {
  const db = createDb(d1);
  const row = await db.get<{ id: number; status: string }>(
    sql`SELECT ${col('id')}, ${col('status')} FROM ${events} WHERE ${col('id')} = ${id} AND ${col('tenant')} = ${tenant}`,
  );
  return row ?? null;
}

export async function getEventTenantCreator(
  d1: D1Database, id: number,
): Promise<{ id: number; tenant: string; creator_discord_id: string | null } | null> {
  const db = createDb(d1);
  const row = await db.get<{ id: number; tenant: string; creator_discord_id: string | null }>(
    sql`SELECT ${col('id')}, ${col('tenant')}, ${col('creator_discord_id')} FROM ${events} WHERE ${col('id')} = ${id}`,
  );
  return row ?? null;
}

export async function getEventTenant(d1: D1Database, id: number): Promise<{ id: number; tenant: string } | null> {
  const db = createDb(d1);
  const row = await db.get<{ id: number; tenant: string }>(
    sql`SELECT ${col('id')}, ${col('tenant')} FROM ${events} WHERE ${col('id')} = ${id}`,
  );
  return row ?? null;
}

/* REST 周视图列表: 带 signup_count 计算列; type/from/to 为可选过滤,
 * 在仓库内组装 (旧 handler 的动态拼接整体搬入)。排序口径逐字保留:
 * open 优先, 无时间垫底, 同组新车在前。 */
export async function listEventsWeekView(
  d1: D1Database,
  q: { tenant: string; type?: string; from?: number; to?: number },
): Promise<(EventRow & { signup_count: number })[]> {
  const db = createDb(d1);
  const query = sql`SELECT e.*, (SELECT COUNT(*) FROM ${signups} s WHERE s.event_id = e.id) AS signup_count FROM ${events} e WHERE e.tenant = ${q.tenant} AND e.status NOT IN ('draft', 'completed')`;
  if (q.type) query.append(sql`AND e.type = ${q.type}`);
  if (q.from) query.append(sql`AND e.starts_at_utc >= ${q.from}`);
  if (q.to) query.append(sql`AND e.starts_at_utc <= ${q.to}`);
  query.append(sql`ORDER BY e.status = 'open' DESC, COALESCE(e.starts_at_utc, 9999999999) ASC, e.id DESC`);
  const rows = await db.all<EventRow & { signup_count: number }>(query);
  return rows || [];
}

/* 管理员列表: 全部状态, 带 signup_count, 新车在前。 */
export async function listEventsAdmin(
  d1: D1Database, tenant: string,
): Promise<(EventRow & { signup_count: number })[]> {
  const db = createDb(d1);
  const rows = await db.all<EventRow & { signup_count: number }>(
    sql`SELECT e.*, (SELECT COUNT(*) FROM ${signups} s WHERE s.event_id = e.id) AS signup_count FROM ${events} e WHERE e.tenant = ${tenant} ORDER BY e.id DESC`,
  );
  return rows || [];
}

/* GraphQL 列表页: 某百业某类型的在招车 (完成/草稿不进列表; open 优先,
 * 无时间垫底, 同组新车在前 — 旧 genGroupings 排序逐字保留)。 */
export async function listEventsByTenantType(d1: D1Database, tenant: string, type: string): Promise<EventRow[]> {
  const db = createDb(d1);
  const rows = await db.all<EventRow>(sql`SELECT * FROM ${events} WHERE ${col('tenant')} = ${tenant} AND ${col('type')} = ${type} AND ${col('status')} NOT IN ('draft', 'completed') ORDER BY CASE ${col('status')} WHEN 'open' THEN 0 ELSE 1 END, COALESCE(${col('starts_at_utc')}, 9999999999) ASC, ${col('id')} DESC`);
  return rows || [];
}

/* OG 百业卡用: 本周 activity 在招车数 (完成/草稿不计; 旧 guildOgTags 口径)。 */
export async function countActivityEventsInWindow(
  d1: D1Database, tenant: string, fromUtc: number, toUtc: number,
): Promise<number> {
  const db = createDb(d1);
  const row = await db.get<{ c: number }>(
    sql`SELECT COUNT(*) AS c FROM ${events} WHERE ${col('tenant')} = ${tenant} AND ${col('type')} = 'activity' AND ${col('status')} NOT IN ('draft', 'completed') AND ${col('starts_at_utc')} >= ${fromUtc} AND ${col('starts_at_utc')} < ${toUtc}`,
  );
  return row ? Number(row.c) || 0 : 0;
}

/* ---------- 提醒调度 (待提醒口径与 reminder.js 旧 PENDING_WHERE 逐字一致) ----------
 * 待提醒 = 已发布 (open/closed)、有出发时间、未结算 (没发过也没失败过)。 */

/* 下一台待提醒车的最早出发时刻 (未做 -LEAD 的原始 MIN 值)。 */
export async function nextPendingReminderStart(
  d1: D1Database, slug: string, nowSec: number,
): Promise<number | null> {
  const db = createDb(d1);
  const row = await db.get<{ m: number | null }>(
    sql`SELECT MIN(${col('starts_at_utc')}) AS m FROM ${events} WHERE ${col('tenant')} = ${slug} AND ${col('status')} IN ('open', 'closed') AND ${col('starts_at_utc')} IS NOT NULL AND ${col('starts_at_utc')} > ${nowSec} AND ${col('reminder_sent_at')} IS NULL AND ${col('reminder_error')} IS NULL`,
  );
  return row && row.m != null ? Number(row.m) : null;
}

/* 到点待发的车 (提醒时刻已到): 全行, 按出发时间升序。 */
export async function listDueReminderEvents(
  d1: D1Database, slug: string, nowSec: number, leadSec: number,
): Promise<EventRow[]> {
  const db = createDb(d1);
  const rows = await db.all<EventRow>(
    sql`SELECT * FROM ${events} WHERE ${col('tenant')} = ${slug} AND ${col('status')} IN ('open', 'closed') AND ${col('starts_at_utc')} IS NOT NULL AND ${col('starts_at_utc')} > ${nowSec} AND ${col('reminder_sent_at')} IS NULL AND ${col('reminder_error')} IS NULL AND ${col('starts_at_utc')} - ${leadSec} <= ${nowSec} ORDER BY ${col('starts_at_utc')} ASC, ${col('id')} ASC`,
  );
  return rows || [];
}

/* ---------- 写入 ---------- */

/* events 可写列白名单 (snake 名 -> 入参键)。insert/update 只接受表内键,
 * 未知键直接抛错, 防止调用方把任意列名拼进 SQL。 */
const EVENT_COLUMNS = new Set([
  'tenant', 'title', 'type', 'description', 'starts_at', 'starts_at_utc',
  'meet_info', 'max_slots', 'status', 'origin', 'created_by', 'manage_code',
  'dungeon', 'creator_discord_id', 'reminder_sent_at', 'reminder_error',
]);

function checkedColumns(row: Record<string, unknown>): string[] {
  const cols = Object.keys(row);
  for (const c of cols) {
    if (!EVENT_COLUMNS.has(c)) throw new Error(`events repository: unknown column ${c}`);
  }
  if (!cols.length) throw new Error('events repository: empty row');
  return cols;
}

/* 通用插入: 列集由入参决定 (各创建路径的列集不同, 字面默认值由调用方
 * 作为普通值传入)。返回 last_row_id。 */
export async function insertEvent(d1: D1Database, row: Record<string, unknown>): Promise<RunMeta> {
  const db = createDb(d1);
  const cols = checkedColumns(row);
  const r = await db.run(sql`INSERT INTO ${events} (${sql.join(cols.map((c) => col(c)), sql`, `)})
    VALUES (${sql.join(cols.map((c) => sql`${row[c]}`), sql`,`)})`);
  return metaOf(r);
}

/* 通用字段更新: patch 的键序即 SET 顺序 (与旧 handler 的 fields 拼接
 * 顺序一致); tenant 传 null = 不带租户条件 (管理员/GraphQL 路径)。 */
export async function updateEventFields(
  d1: D1Database, id: number, tenant: string | null, patch: Record<string, unknown>,
): Promise<RunMeta> {
  const db = createDb(d1);
  const cols = checkedColumns(patch);
  const sets = sql.join(cols.map((c) => sql`${col(c)} = ${patch[c]}`), sql`,`);
  const r = tenant == null
    ? await db.run(sql`UPDATE ${events} SET ${sets} WHERE ${col('id')} = ${id}`)
    : await db.run(sql`UPDATE ${events} SET ${sets} WHERE ${col('id')} = ${id} AND ${col('tenant')} = ${tenant}`);
  return metaOf(r);
}

/* 状态流转 (close/reopen/complete/uncomplete 与 GraphQL 同名 mutation 共用)。 */
export async function setEventStatus(d1: D1Database, id: number, status: string): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`UPDATE ${events} SET ${col('status')} = ${status} WHERE ${col('id')} = ${id}`);
  return metaOf(r);
}

/* 提醒结算: 成功写 sent_at, 失败写 error (结算后永不重试)。 */
export async function markReminderSent(d1: D1Database, id: number, atSec: number): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`UPDATE ${events} SET ${col('reminder_sent_at')} = ${atSec} WHERE ${col('id')} = ${id}`);
  return metaOf(r);
}

export async function markReminderError(d1: D1Database, id: number, errorText: string): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`UPDATE ${events} SET ${col('reminder_error')} = ${errorText} WHERE ${col('id')} = ${id}`);
  return metaOf(r);
}

/* 解散级联: 报名 + 成绩 + 车本身, 仓库内 D1 batch 成组执行
 * (恢复二期逐条执行时丢失的组原子性: 任一语句失败整组回滚)。
 * tenant 传 null = 不带租户条件。 */
export async function deleteEventCascade(d1: D1Database, id: number, tenant: string | null): Promise<void> {
  await d1.batch([
    d1.prepare('DELETE FROM signups WHERE event_id = ?').bind(id),
    d1.prepare('DELETE FROM results WHERE event_id = ?').bind(id),
    tenant == null
      ? d1.prepare('DELETE FROM events WHERE id = ?').bind(id)
      : d1.prepare('DELETE FROM events WHERE id = ? AND tenant = ?').bind(id, tenant),
  ]);
}
