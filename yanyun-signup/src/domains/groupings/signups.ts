/* ===================================================
 * signups 实体的数据层访问 (Repository)。
 *
 * 业务代码禁止直接拼 SQL 访问 signups: 全部走本文件的函数。返回
 * 行沿用旧形态的 snake_case 键; 写操作返回 D1 的 meta (changes /
 * last_row_id), 与旧 .run() 结果同形。写法沿用一期 sql 模板惯用
 * 法 + sql.identifier 裸列名内插。
 *
 * 本期红线 (有意不迁, 仍在调用方): 容量守卫的原子
 * INSERT ... SELECT ... WHERE COUNT < max_slots (graphql.js /
 * worker.js 各一份, 与其满员回滚判断是一条原子性单元) 与提及解析
 * 的身份戳 UPDATE (worker.js 提及单元)。
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { signups, events } = schema;
const col = (name: string) => sql.identifier(name);

export interface SignupRow {
  id: number;
  event_id: number;
  nickname: string;
  uid: string;
  role: string;
  weapon: string;
  contact: string;
  note: string;
  team_name: string | null;
  members: string | null;
  created_at: string;
  discord_id: string | null;
}

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

/* ---------- 读取 ---------- */

/* 全行列表 (管理员名册/导出用), 按座位顺序。 */
export async function listSignupsByEvent(d1: D1Database, eventId: number): Promise<SignupRow[]> {
  const db = createDb(d1);
  const rows = await db.all<SignupRow>(
    sql`SELECT * FROM ${signups} WHERE ${col('event_id')} = ${eventId} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

/* REST 详情页座位子集。 */
export async function listSignupDetailRows(d1: D1Database, eventId: number): Promise<{
  id: number; nickname: string; role: string; weapon: string;
  team_name: string | null; members: string | null; note: string; created_at: string;
}[]> {
  const db = createDb(d1);
  const rows = await db.all<{
    id: number; nickname: string; role: string; weapon: string;
    team_name: string | null; members: string | null; note: string; created_at: string;
  }>(
    sql`SELECT ${col('id')}, ${col('nickname')}, ${col('role')}, ${col('weapon')}, ${col('team_name')}, ${col('members')}, ${col('note')}, ${col('created_at')} FROM ${signups} WHERE ${col('event_id')} = ${eventId} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

/* GraphQL 详情座位子集 (带身份戳)。 */
export async function listSignupSeats(d1: D1Database, eventId: number): Promise<{
  id: number; nickname: string; uid: string; role: string; weapon: string; discord_id: string | null;
}[]> {
  const db = createDb(d1);
  const rows = await db.all<{
    id: number; nickname: string; uid: string; role: string; weapon: string; discord_id: string | null;
  }>(
    sql`SELECT ${col('id')}, ${col('nickname')}, ${col('uid')}, ${col('role')}, ${col('weapon')}, ${col('discord_id')} FROM ${signups} WHERE ${col('event_id')} = ${eventId} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

/* GraphQL 座位子集 (无身份戳的旧面)。 */
export async function listSignupSeatsBasic(d1: D1Database, eventId: number): Promise<{
  id: number; nickname: string; uid: string; role: string; weapon: string;
}[]> {
  const db = createDb(d1);
  const rows = await db.all<{
    id: number; nickname: string; uid: string; role: string; weapon: string;
  }>(
    sql`SELECT ${col('id')}, ${col('nickname')}, ${col('uid')}, ${col('role')}, ${col('weapon')} FROM ${signups} WHERE ${col('event_id')} = ${eventId} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

/* 编辑页名册整表读 (昵称 + 身份戳, 无序 — 与旧查询一致)。 */
export async function listSignupNamesStamps(d1: D1Database, eventId: number): Promise<{
  nickname: string; discord_id: string | null;
}[]> {
  const db = createDb(d1);
  const rows = await db.all<{ nickname: string; discord_id: string | null }>(
    sql`SELECT ${col('nickname')}, ${col('discord_id')} FROM ${signups} WHERE ${col('event_id')} = ${eventId}`,
  );
  return rows || [];
}

/* 提醒拼装用座位 (昵称/身份戳/流派, 按座位顺序)。 */
export async function listSignupSeatsForReminder(d1: D1Database, eventId: number): Promise<{
  nickname: string; discord_id: string | null; weapon: string;
}[]> {
  const db = createDb(d1);
  const rows = await db.all<{ nickname: string; discord_id: string | null; weapon: string }>(
    sql`SELECT ${col('nickname')}, ${col('discord_id')}, ${col('weapon')} FROM ${signups} WHERE ${col('event_id')} = ${eventId} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

/* 已占座数。 */
export async function countSignupsByEvent(d1: D1Database, eventId: number): Promise<number> {
  const db = createDb(d1);
  const row = await db.get<{ c: number }>(
    sql`SELECT COUNT(*) AS c FROM ${signups} WHERE ${col('event_id')} = ${eventId}`,
  );
  return row ? Number(row.c) || 0 : 0;
}

/* 满员治疗校验的三联计数 (总座/治疗数/容量上限), 与守卫插入的回滚
 * 判断配套 (graphql.js / worker.js 两处同一旧查询)。 */
export async function getSignupCapacityStats(
  d1: D1Database, eventId: number,
): Promise<{ c: number; h: number; m: number | null } | null> {
  const db = createDb(d1);
  const row = await db.get<{ c: number; h: number; m: number | null }>(
    sql`SELECT (SELECT COUNT(*) FROM ${signups} WHERE ${col('event_id')} = ${eventId}) AS c, (SELECT COUNT(*) FROM ${signups} WHERE ${col('event_id')} = ${eventId} AND ${col('role')} IN ('奶', '治疗')) AS h, (SELECT ${col('max_slots')} FROM ${events} WHERE ${col('id')} = ${eventId}) AS m`,
  );
  return row ?? null;
}

/* 管理员删座前的归属校验 (该座位所属车确属本百业)。 */
export async function getSignupTenant(d1: D1Database, signupId: number, tenant: string): Promise<{ id: number } | null> {
  const db = createDb(d1);
  const row = await db.get<{ id: number }>(
    sql`SELECT s.id FROM ${signups} s JOIN ${events} e ON s.event_id = e.id WHERE s.id = ${signupId} AND e.tenant = ${tenant}`,
  );
  return row ?? null;
}

/* ---------- 写入 ---------- */

const SIGNUP_COLUMNS = new Set([
  'event_id', 'nickname', 'uid', 'role', 'weapon', 'contact', 'note',
  'team_name', 'members', 'discord_id',
]);

function checkedColumns(row: Record<string, unknown>): string[] {
  const cols = Object.keys(row);
  for (const c of cols) {
    if (!SIGNUP_COLUMNS.has(c)) throw new Error(`signups repository: unknown column ${c}`);
  }
  if (!cols.length) throw new Error('signups repository: empty row');
  return cols;
}

/* 通用插入 (非守卫路径: 初始排座/代报名落座等)。返回 meta。 */
export async function insertSignup(d1: D1Database, row: Record<string, unknown>): Promise<RunMeta> {
  const db = createDb(d1);
  const cols = checkedColumns(row);
  const r = await db.run(sql`INSERT INTO ${signups} (${sql.join(cols.map((c) => col(c)), sql`, `)})
    VALUES (${sql.join(cols.map((c) => sql`${row[c]}`), sql`,`)})`);
  return metaOf(r);
}

/* 批量排座 (旧 db.batch 多语句的等价: 逐条执行, 顺序不变)。 */
export async function insertSignups(d1: D1Database, rows: Record<string, unknown>[]): Promise<void> {
  for (const row of rows) await insertSignup(d1, row);
}

export async function deleteSignupById(d1: D1Database, id: number): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${signups} WHERE ${col('id')} = ${id}`);
  return metaOf(r);
}

export async function deleteSignupByIdAndEvent(d1: D1Database, id: number, eventId: number): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${signups} WHERE ${col('id')} = ${id} AND ${col('event_id')} = ${eventId}`);
  return metaOf(r);
}

export async function deleteSignupByEventNickUid(
  d1: D1Database, eventId: number, nickname: string, uid: string,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`DELETE FROM ${signups} WHERE ${col('event_id')} = ${eventId} AND ${col('nickname')} = ${nickname} AND ${col('uid')} = ${uid}`,
  );
  return metaOf(r);
}

export async function deleteSignupByEventUid(d1: D1Database, eventId: number, uid: string): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`DELETE FROM ${signups} WHERE ${col('event_id')} = ${eventId} AND ${col('uid')} = ${uid}`,
  );
  return metaOf(r);
}

export async function deleteSignupsByEvent(d1: D1Database, eventId: number): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${signups} WHERE ${col('event_id')} = ${eventId}`);
  return metaOf(r);
}

/* 改流派 (流派->职责的换算在调用方, 这里只落两列)。 */
export async function updateSignupWeaponRoleById(
  d1: D1Database, id: number, eventId: number, weapon: string, role: string,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${signups} SET ${col('weapon')} = ${weapon}, ${col('role')} = ${role} WHERE ${col('id')} = ${id} AND ${col('event_id')} = ${eventId}`,
  );
  return metaOf(r);
}

export async function updateSignupWeaponRoleByUid(
  d1: D1Database, eventId: number, uid: string, weapon: string, role: string,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${signups} SET ${col('weapon')} = ${weapon}, ${col('role')} = ${role} WHERE ${col('event_id')} = ${eventId} AND ${col('uid')} = ${uid}`,
  );
  return metaOf(r);
}
