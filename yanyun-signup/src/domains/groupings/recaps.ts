/* ===================================================
 * Data-layer access (Repository) for the grouping_recaps entity
 * (P18 AI activity recaps, premium T3).
 *
 * One row per grouping at most (unique event_id): a regeneration
 * overwrites the row in place and bumps version, so there is never
 * a version list to arbitrate. A failed attempt flips status to
 * 'failed' and records last_error WITHOUT touching paragraphs —
 * the previous successful recap keeps being served.
 * Rows keep the legacy snake_case keys, like the sibling
 * repositories in this domain.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { groupingRecaps } = schema;
const col = (name: string) => sql.identifier(name);

export interface RecapRow {
  id: number;
  tenant: string;
  event_id: number;
  status: string;
  paragraphs_json: string;
  snapshot_json: string;
  provider: string;
  generated_by: string;
  version: number;
  last_error: string;
  generated_at: number;
  updated_at: number;
}

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

const COLS = sql`${col('id')}, ${col('tenant')}, ${col('event_id')}, ${col('status')}, ${col('paragraphs_json')}, ${col('snapshot_json')}, ${col('provider')}, ${col('generated_by')}, ${col('version')}, ${col('last_error')}, ${col('generated_at')}, ${col('updated_at')}`;

/** The recap stored for one grouping, or null when none was ever generated. */
export async function getRecapByEvent(d1: D1Database, eventId: number): Promise<RecapRow | null> {
  const db = createDb(d1);
  const row = await db.get<RecapRow>(
    sql`SELECT ${COLS} FROM ${groupingRecaps} WHERE ${col('event_id')} = ${eventId}`,
  );
  return row ?? null;
}

/** Store a successful generation: insert on first generation,
 *  overwrite + version bump on regeneration. generated_at moves to
 *  this generation; the failure record is cleared. */
export async function upsertRecapReady(
  d1: D1Database,
  row: {
    tenant: string; eventId: number; paragraphsJson: string; snapshotJson: string;
    provider: string; generatedBy: string; atSec: number;
  },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${groupingRecaps} (${col('tenant')}, ${col('event_id')}, ${col('status')}, ${col('paragraphs_json')}, ${col('snapshot_json')}, ${col('provider')}, ${col('generated_by')}, ${col('version')}, ${col('last_error')}, ${col('generated_at')}, ${col('updated_at')})
        VALUES (${row.tenant}, ${row.eventId}, 'ready', ${row.paragraphsJson}, ${row.snapshotJson}, ${row.provider}, ${row.generatedBy}, 1, '', ${row.atSec}, ${row.atSec})
        ON CONFLICT (${col('event_id')}) DO UPDATE SET
          ${col('tenant')} = excluded.tenant,
          ${col('status')} = 'ready',
          ${col('paragraphs_json')} = excluded.paragraphs_json,
          ${col('snapshot_json')} = excluded.snapshot_json,
          ${col('provider')} = excluded.provider,
          ${col('generated_by')} = excluded.generated_by,
          ${col('version')} = ${groupingRecaps.version} + 1,
          ${col('last_error')} = '',
          ${col('generated_at')} = excluded.generated_at,
          ${col('updated_at')} = excluded.updated_at`,
  );
  return metaOf(r);
}

/** Record a failed generation attempt: status + error + stamp only.
 *  Paragraphs / snapshot / provider / generated_at of the previous
 *  success are deliberately untouched — a failed retry never
 *  destroys a good recap. First-ever failure creates the row with
 *  empty paragraphs so the admin index can show the failed state. */
export async function upsertRecapFailed(
  d1: D1Database,
  row: { tenant: string; eventId: number; generatedBy: string; error: string; atSec: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${groupingRecaps} (${col('tenant')}, ${col('event_id')}, ${col('status')}, ${col('paragraphs_json')}, ${col('snapshot_json')}, ${col('provider')}, ${col('generated_by')}, ${col('version')}, ${col('last_error')}, ${col('generated_at')}, ${col('updated_at')})
        VALUES (${row.tenant}, ${row.eventId}, 'failed', '[]', '{}', '', ${row.generatedBy}, 0, ${row.error}, 0, ${row.atSec})
        ON CONFLICT (${col('event_id')}) DO UPDATE SET
          ${col('status')} = 'failed',
          ${col('last_error')} = excluded.last_error,
          ${col('generated_by')} = excluded.generated_by,
          ${col('updated_at')} = excluded.updated_at`,
  );
  return metaOf(r);
}

/** Guild recap index: this guild's recaps, newest generation first
 *  (failed-only rows, which have no generation, sort by their last
 *  attempt). Capped — the index is a management list, not an archive
 *  export. */
export async function listRecapsByTenant(d1: D1Database, tenant: string, limit = 50): Promise<RecapRow[]> {
  const db = createDb(d1);
  const rows = await db.all<RecapRow>(
    sql`SELECT ${COLS} FROM ${groupingRecaps} WHERE ${col('tenant')} = ${tenant} ORDER BY MAX(${col('generated_at')}, ${col('updated_at')}) DESC, ${col('id')} DESC LIMIT ${limit}`,
  );
  return rows || [];
}
