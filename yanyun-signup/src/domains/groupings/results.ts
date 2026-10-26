/* ===================================================
 * results 实体的数据层访问 (Repository)。
 *
 * 三期迁入: 此前只有 worker.js 三处直查 (车队详情成绩读、管理员
 * 录成绩、管理员删成绩的归属校验 + 删除)。events repository 的
 * deleteEventCascade 内部组合 results 删除仍是级联一环, 不经这里。
 * 返回行沿用 snake_case 键, 调用点零感知。
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { results, events } = schema;
const col = (name: string) => sql.identifier(name);

export interface ResultRow {
  id: number;
  team_name: string;
  members: string;
  time_ms: number;
  proof_url: string;
  note: string;
  created_at: string;
}

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

/** 车队详情成绩列表: 按用时升序 (与旧 REST 详情同形)。 */
export async function listResultsByEvent(d1: D1Database, eventId: number): Promise<ResultRow[]> {
  const db = createDb(d1);
  const rows = await db.all<ResultRow>(
    sql`SELECT ${col('id')}, ${col('team_name')}, ${col('members')}, ${col('time_ms')}, ${col('proof_url')}, ${col('note')}, ${col('created_at')} FROM ${results} WHERE ${col('event_id')} = ${eventId} ORDER BY ${col('time_ms')} ASC`,
  );
  return rows || [];
}

export async function insertResult(
  d1: D1Database,
  row: { eventId: number; teamName: string; members: string; timeMs: number; proofUrl: string; note: string },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${results} (${col('event_id')}, ${col('team_name')}, ${col('members')}, ${col('time_ms')}, ${col('proof_url')}, ${col('note')}) VALUES (${row.eventId}, ${row.teamName}, ${row.members}, ${row.timeMs}, ${row.proofUrl}, ${row.note})`,
  );
  return metaOf(r);
}

/** 删除前的租户归属校验: 成绩属于该百业的车队才返回其 id。 */
export async function getResultIdOwnedByTenant(
  d1: D1Database, resultId: number, tenant: string,
): Promise<{ id: number } | null> {
  const db = createDb(d1);
  const row = await db.get<{ id: number }>(
    sql`SELECT ${results.id} FROM ${results} JOIN ${events} ON ${results.eventId} = ${events.id} WHERE ${results.id} = ${resultId} AND ${events.tenant} = ${tenant}`,
  );
  return row ?? null;
}

export async function deleteResultById(d1: D1Database, resultId: number): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${results} WHERE ${col('id')} = ${resultId}`);
  return metaOf(r);
}
