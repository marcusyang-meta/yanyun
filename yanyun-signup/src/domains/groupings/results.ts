/* ===================================================
 * Data-layer access (Repository) for the results entity.
 *
 * Previously queried directly from three places in worker.js
 * (grouping-detail results read, admin result entry, and the
 * ownership check + delete for admin result deletion). The
 * results delete inside events' deleteEventCascade remains part
 * of that cascade and does not go through here. Rows keep the
 * legacy snake_case keys.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';
import { mintPublicId } from '../platform/id-mint.ts';

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

/** Grouping-detail results: ascending by clear time (same shape as the legacy REST detail). */
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
    sql`INSERT INTO ${results} (${col('id')}, ${col('event_id')}, ${col('team_name')}, ${col('members')}, ${col('time_ms')}, ${col('proof_url')}, ${col('note')}) VALUES (${await mintPublicId(d1, 'raceResult')}, ${row.eventId}, ${row.teamName}, ${row.members}, ${row.timeMs}, ${row.proofUrl}, ${row.note})`,
  );
  return metaOf(r);
}

/** Pre-delete tenant ownership check: returns the id only if the result belongs to a grouping of this guild. */
export async function getResultIdOwnedByTenant(
  d1: D1Database, resultId: number, tenant: number,
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
