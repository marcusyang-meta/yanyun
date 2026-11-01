/* ===================================================
 * Data-layer access (Repository) for the combat_encounters
 * entity (combat reports v1, premium T2).
 *
 * One row per imported encounter; a grouping holds many (the
 * attempt list is this relation read by start time). A failed
 * processing attempt is recorded as its own row with status
 * 'failed' so the surface can show the failure hint — it never
 * touches the grouping's parsed encounters. Deletion removes
 * the encounter row itself and nothing else (lazy deletion: the
 * platform does not chase cascades).
 * Rows keep the legacy snake_case keys, like the sibling
 * repositories in this domain.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';
import { mintPublicId } from '../platform/id-mint.ts';

const { combatEncounters } = schema;
const col = (name: string) => sql.identifier(name);

export interface CombatEncounterRow {
  id: number;
  tenant: number;
  event_id: number;
  uploader_user_id: number;
  boss_name: string;
  started_at_ms: number;
  duration_ms: number;
  result: string;
  source: string;
  format_version: number;
  model_version: number;
  status: string;
  last_error: string;
  snapshot_json: string;
  actor_map_json: string;
  events_json: string;
  created_at: number;
}

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

const COLS = sql`${col('id')}, ${col('tenant')}, ${col('event_id')}, ${col('uploader_user_id')}, ${col('boss_name')}, ${col('started_at_ms')}, ${col('duration_ms')}, ${col('result')}, ${col('source')}, ${col('format_version')}, ${col('model_version')}, ${col('status')}, ${col('last_error')}, ${col('snapshot_json')}, ${col('actor_map_json')}, ${col('events_json')}, ${col('created_at')}`;

/** One encounter by its typed ID, or null. */
export async function getEncounterById(d1: D1Database, id: number): Promise<CombatEncounterRow | null> {
  const db = createDb(d1);
  const row = await db.get<CombatEncounterRow>(
    sql`SELECT ${COLS} FROM ${combatEncounters} WHERE ${col('id')} = ${id}`,
  );
  return row ?? null;
}

/** The attempt list of one grouping: parsed encounters by start
 *  time (the report's session list), oldest first. */
export async function listEncountersByGrouping(
  d1: D1Database, eventId: number, limit = 100,
): Promise<CombatEncounterRow[]> {
  const db = createDb(d1);
  const rows = await db.all<CombatEncounterRow>(
    sql`SELECT ${COLS} FROM ${combatEncounters} WHERE ${col('event_id')} = ${eventId} AND ${col('status')} = 'parsed' ORDER BY ${col('started_at_ms')} ASC, ${col('id')} ASC LIMIT ${limit}`,
  );
  return rows || [];
}

/** The most recent failed processing attempt of one grouping
 *  (drives the surface's failure hint), or null. */
export async function getLatestFailedEncounter(
  d1: D1Database, eventId: number,
): Promise<CombatEncounterRow | null> {
  const db = createDb(d1);
  const row = await db.get<CombatEncounterRow>(
    sql`SELECT ${COLS} FROM ${combatEncounters} WHERE ${col('event_id')} = ${eventId} AND ${col('status')} = 'failed' ORDER BY ${col('id')} DESC LIMIT 1`,
  );
  return row ?? null;
}

/** Guild combat index: this guild's encounters, newest import
 *  first (failed attempts included — the admin index shows the
 *  failure state like the recap index does). Capped. */
export async function listEncountersByTenant(
  d1: D1Database, tenant: number, limit = 50,
): Promise<CombatEncounterRow[]> {
  const db = createDb(d1);
  const rows = await db.all<CombatEncounterRow>(
    sql`SELECT ${COLS} FROM ${combatEncounters} WHERE ${col('tenant')} = ${tenant} ORDER BY ${col('created_at')} DESC, ${col('id')} DESC LIMIT ${limit}`,
  );
  return rows || [];
}

/** Insert one processed encounter. The typed ID (type code 17)
 *  is minted in the data layer. */
export async function insertEncounter(
  d1: D1Database,
  row: {
    tenant: number; eventId: number; uploaderUserId: number;
    bossName: string; startedAtMs: number; durationMs: number;
    result: string; source: string; formatVersion: number; modelVersion: number;
    status: 'parsed' | 'failed'; lastError: string;
    snapshotJson: string; actorMapJson: string; eventsJson: string;
    atSec: number;
  },
): Promise<CombatEncounterRow> {
  const db = createDb(d1);
  const id = await mintPublicId(d1, 'combatEncounter');
  await db.run(
    sql`INSERT INTO ${combatEncounters} (${col('id')}, ${col('tenant')}, ${col('event_id')}, ${col('uploader_user_id')}, ${col('boss_name')}, ${col('started_at_ms')}, ${col('duration_ms')}, ${col('result')}, ${col('source')}, ${col('format_version')}, ${col('model_version')}, ${col('status')}, ${col('last_error')}, ${col('snapshot_json')}, ${col('actor_map_json')}, ${col('events_json')}, ${col('created_at')})
        VALUES (${id}, ${row.tenant}, ${row.eventId}, ${row.uploaderUserId}, ${row.bossName}, ${row.startedAtMs}, ${row.durationMs}, ${row.result}, ${row.source}, ${row.formatVersion}, ${row.modelVersion}, ${row.status}, ${row.lastError}, ${row.snapshotJson}, ${row.actorMapJson}, ${row.eventsJson}, ${row.atSec})`,
  );
  const stored = await getEncounterById(d1, id);
  if (!stored) throw new Error('combat encounter insert did not land');
  return stored;
}

/** Delete one encounter row (lazy deletion: the row is the body;
 *  no cascade is chased by hand). Returns whether a row went. */
export async function deleteEncounter(d1: D1Database, id: number): Promise<boolean> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${combatEncounters} WHERE ${col('id')} = ${id}`);
  return metaOf(r).changes > 0;
}
