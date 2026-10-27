/* ===================================================
 * Data-layer access (Repository) for the grouping_templates entity.
 *
 * A template is a guild-shared snapshot of a grouping configuration
 * (type / dungeon / seats / title / departure offset) that members
 * apply to prefill the create form. Rows keep snake_case keys;
 * single-row reads return null on a miss; writes return the D1 meta
 * (changes / last_row_id), same shape as the other repositories.
 * Business code must not hand-roll SQL against this table.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { groupingTemplates } from './schema.ts';

const col = (name: string) => sql.identifier(name);

export interface GroupingTemplateRow {
  id: number;
  tenant: string;
  name: string;
  type: string;
  title: string;
  dungeon: string;
  max_slots: number;
  start_days_ahead: number;
  start_minutes: number;
  creator_discord_id: string | null;
  created_at: number;
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

/* ---------- Departure offset (save-from-grouping snapshot) ----------
 * A template stores no absolute date: the car's local departure (in
 * the saver's timezone) becomes a day offset from today plus a
 * time-of-day in minutes. Past cars clamp to today, same time — a
 * template is a recurring shape, never a stale one-off. */
const _dayFmtCache = new Map<string, Intl.DateTimeFormat>();
function dayPartsInTz(epochSec: number, tz?: string | null): { y: number; m: number; d: number; minutes: number } {
  const zone = tz || 'Asia/Shanghai';
  let fmt = _dayFmtCache.get(zone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: zone,
    });
    _dayFmtCache.set(zone, fmt);
  }
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(new Date(epochSec * 1000))) parts[p.type] = p.value;
  return {
    y: Number(parts.year), m: Number(parts.month), d: Number(parts.day),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export function templateOffsetFromStartsAt(
  startsAtUtc: number, nowSec: number, tz?: string | null,
): { daysAhead: number; startMinutes: number } {
  const a = dayPartsInTz(startsAtUtc, tz);
  const b = dayPartsInTz(nowSec, tz);
  const days = Math.round(
    (Date.UTC(a.y, a.m - 1, a.d) - Date.UTC(b.y, b.m - 1, b.d)) / 86400000,
  );
  return { daysAhead: Math.max(0, days), startMinutes: a.minutes };
}

/* ---------- Reads ---------- */

/** One guild's templates, newest first (the create form's picker order). */
export async function listGroupingTemplates(
  d1: D1Database, tenant: string,
): Promise<GroupingTemplateRow[]> {
  const db = createDb(d1);
  const rows = await db.all<GroupingTemplateRow>(
    sql`SELECT * FROM ${groupingTemplates} WHERE ${col('tenant')} = ${tenant} ORDER BY ${col('id')} DESC`,
  );
  return rows || [];
}

export async function getGroupingTemplate(
  d1: D1Database, id: number,
): Promise<GroupingTemplateRow | null> {
  const db = createDb(d1);
  const row = await db.get<GroupingTemplateRow>(
    sql`SELECT * FROM ${groupingTemplates} WHERE ${col('id')} = ${id}`,
  );
  return row ?? null;
}

/* ---------- Writes ---------- */

/* Writable-column whitelist (snake name). Insert/update accept only
 * in-table keys; unknown keys throw, so callers cannot splice
 * arbitrary column names into SQL. */
const TEMPLATE_COLUMNS = new Set([
  'tenant', 'name', 'type', 'title', 'dungeon', 'max_slots',
  'start_days_ahead', 'start_minutes', 'creator_discord_id',
  'created_at', 'updated_at',
]);

function checkedColumns(row: Record<string, unknown>): string[] {
  const cols = Object.keys(row);
  for (const c of cols) {
    if (!TEMPLATE_COLUMNS.has(c)) throw new Error(`grouping_templates repository: unknown column ${c}`);
  }
  if (!cols.length) throw new Error('grouping_templates repository: empty row');
  return cols;
}

export async function insertGroupingTemplate(
  d1: D1Database, row: Record<string, unknown>,
): Promise<RunMeta> {
  const db = createDb(d1);
  const cols = checkedColumns(row);
  const r = await db.run(sql`INSERT INTO ${groupingTemplates} (${sql.join(cols.map((c) => col(c)), sql`, `)})
    VALUES (${sql.join(cols.map((c) => sql`${row[c]}`), sql`,`)})`);
  return metaOf(r);
}

export async function updateGroupingTemplateFields(
  d1: D1Database, id: number, patch: Record<string, unknown>,
): Promise<RunMeta> {
  const db = createDb(d1);
  const cols = checkedColumns(patch);
  const sets = sql.join(cols.map((c) => sql`${col(c)} = ${patch[c]}`), sql`,`);
  const r = await db.run(sql`UPDATE ${groupingTemplates} SET ${sets} WHERE ${col('id')} = ${id}`);
  return metaOf(r);
}

export async function deleteGroupingTemplate(
  d1: D1Database, id: number,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${groupingTemplates} WHERE ${col('id')} = ${id}`);
  return metaOf(r);
}

/** Deletion: templates are guild-shared resources (like led cars) —
 * they persist for the guild; only the creator attribution is cut,
 * after which edit/delete falls to guild admins alone. */
export async function orphanGroupingTemplatesByCreator(
  d1: D1Database, discordId: string,
): Promise<number> {
  const db = createDb(d1);
  // SET LHS / WHERE use bare column names (SQLite syntax); see the
  // settings.ts note — table-qualified columns are invalid in UPDATE.
  const r = await db.run(
    sql`UPDATE ${groupingTemplates} SET ${sql.identifier('creator_discord_id')} = NULL
        WHERE ${sql.identifier('creator_discord_id')} = ${discordId}`,
  );
  return metaOf(r).changes;
}
