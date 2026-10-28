/* ===================================================
 * Data-layer access (Repository) for the season_checklist_checks
 * entity: per-guild check-off state for the pre-season checklist.
 * The checklist items themselves are composed by the GraphQL layer
 * from live season data; this repository only persists which items
 * an admin has checked off for one (guild, season). Rows keep
 * snake_case keys, like the neighbouring repositories.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { seasonChecklistChecks } = schema;
const col = (name: string) => sql.identifier(name);

export interface SeasonChecklistCheckRow {
  item_key: string;
  checked: number;
  checked_by_user_id: number;
  checked_by_name: string;
  updated_at: number;
}

/** All check rows of one guild for one season, keyed reads in the service. */
export async function listSeasonChecklistChecks(
  d1: D1Database, tenant: number, seasonKey: string,
): Promise<SeasonChecklistCheckRow[]> {
  const db = createDb(d1);
  const rows = await db.all<SeasonChecklistCheckRow>(
    sql`SELECT ${col('item_key')}, ${col('checked')}, ${col('checked_by_user_id')}, ${col('checked_by_name')}, ${col('updated_at')} FROM ${seasonChecklistChecks} WHERE ${col('tenant')} = ${tenant} AND ${col('season_key')} = ${seasonKey}`,
  );
  return rows || [];
}

/** Upsert one item's check state (checked 0/1) for one guild + season. */
export async function setSeasonChecklistCheck(
  d1: D1Database,
  row: {
    tenant: number; seasonKey: string; itemKey: string; checked: boolean;
    checkedByUserId: number; checkedByName: string; now: number;
  },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${seasonChecklistChecks} (${col('tenant')}, ${col('season_key')}, ${col('item_key')}, ${col('checked')}, ${col('checked_by_user_id')}, ${col('checked_by_name')}, ${col('updated_at')})
        VALUES (${row.tenant}, ${row.seasonKey}, ${row.itemKey}, ${row.checked ? 1 : 0}, ${row.checkedByUserId}, ${row.checkedByName}, ${row.now})
        ON CONFLICT (${col('tenant')}, ${col('season_key')}, ${col('item_key')}) DO UPDATE SET
          ${col('checked')} = excluded.checked, ${col('checked_by_user_id')} = excluded.checked_by_user_id,
          ${col('checked_by_name')} = excluded.checked_by_name, ${col('updated_at')} = excluded.updated_at`,
  );
}
