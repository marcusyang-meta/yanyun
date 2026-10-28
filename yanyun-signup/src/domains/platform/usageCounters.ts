/* ===================================================
 * Data-layer access (Repository) for the usage_counters entity:
 * per-user, per-metric, per-day counters backing the plan limits
 * (see limits.ts for the limit values and the day-key rule). Rows are
 * scoped by user_id; the day is an opaque 'YYYY-MM-DD' string the
 * caller derives from its own clock rule, so historical days stay
 * addressable (rollover tests, audits) without schema help.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { usageCounters } = schema;
const col = (name: string) => sql.identifier(name);

/** Count recorded for one user/metric/day; 0 when no row exists yet. */
export async function getUsageCount(
  d1: D1Database,
  userId: number,
  metric: string,
  day: string,
): Promise<number> {
  const db = createDb(d1);
  const rows = await db.all<{ count: number }>(
    sql`SELECT ${col('count')} FROM ${usageCounters} WHERE ${col('user_id')} = ${userId} AND ${col('metric')} = ${metric} AND ${col('day')} = ${day}`,
  );
  return rows && rows[0] ? Number(rows[0].count) || 0 : 0;
}

/** Add `by` to one user/metric/day counter, creating the row on first
 *  use; returns the counter value after the increment. */
export async function incrementUsage(
  d1: D1Database,
  userId: number,
  metric: string,
  day: string,
  by: number,
  now: number,
): Promise<number> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${usageCounters} (${col('user_id')}, ${col('metric')}, ${col('day')}, ${col('count')}, ${col('updated_at')}) VALUES (${userId}, ${metric}, ${day}, ${by}, ${now}) ON CONFLICT (${col('user_id')}, ${col('metric')}, ${col('day')}) DO UPDATE SET ${col('count')} = ${usageCounters.count} + ${by}, ${col('updated_at')} = excluded.updated_at`,
  );
  return getUsageCount(d1, userId, metric, day);
}
