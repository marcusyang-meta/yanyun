/* ===================================================
 * Data-layer access (Repository) for the events entity.
 *
 * Business code must not hand-roll SQL against events; everything
 * goes through this file. Rows keep the legacy snake_case keys,
 * single-row reads return null on a miss, and writes return the
 * D1 meta (changes / last_row_id), same shape as the old .run()
 * results, so callers' capacity/rollback checks are unchanged.
 *
 * Generated SQL keeps the shape of the statements it replaced
 * (the harness FakeDB routes by shape).
 *
 * Red-line units: the mention-resolution JOIN, the capacity
 * guard's atomic INSERT ... SELECT, and the COUNT(DISTINCT
 * nickname) roster aggregate. deleteEventCascade composes the
 * signups / results deletes inside the data layer.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { events, signups, results, eventReminders } = schema;
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
  ally_visible: number;
  visitor_slots: number;
}

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

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

/* Creator-backfill scan (platform admin one-off): every event's
 * identity columns, oldest first. The matching policy lives in the
 * caller (platform/admin-backfills.ts); this is the data access the
 * retired /api/hub/events/backfill-creators handler used to hand-roll
 * against the raw binding. */
export interface EventCreatorScanRow {
  id: number; tenant: string; created_by: string; creator_discord_id: string | null;
}

export async function listEventsForCreatorBackfill(d1: D1Database): Promise<EventCreatorScanRow[]> {
  const db = createDb(d1);
  const rows = await db.all<EventCreatorScanRow>(
    sql`SELECT ${col('id')}, ${col('tenant')}, ${col('created_by')}, ${col('creator_discord_id')}
        FROM ${events} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

/* Stamp creators resolved by the backfill. Each update stays
 * conditional on the creator still being empty, so a concurrent
 * stamp (or a re-run) can never overwrite a recorded creator. */
export async function stampEventCreators(
  d1: D1Database,
  updates: Array<{ discordId: string; eventId: number }>,
): Promise<void> {
  if (!updates.length) return;
  await d1.batch(updates.map(({ discordId, eventId }) => d1.prepare(
    "UPDATE events SET creator_discord_id = ? WHERE id = ? AND (creator_discord_id IS NULL OR creator_discord_id = '')",
  ).bind(discordId, eventId)));
}

/* REST weekly list: signup_count computed column; type/from/to are
 * optional filters assembled here. Ordering preserved: open first,
 * timeless last, newest first within a group. */
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

/* Admin list: all statuses, with signup_count, newest first. */
export async function listEventsAdmin(
  d1: D1Database, tenant: string,
): Promise<(EventRow & { signup_count: number })[]> {
  const db = createDb(d1);
  const rows = await db.all<EventRow & { signup_count: number }>(
    sql`SELECT e.*, (SELECT COUNT(*) FROM ${signups} s WHERE s.event_id = e.id) AS signup_count FROM ${events} e WHERE e.tenant = ${tenant} ORDER BY e.id DESC`,
  );
  return rows || [];
}

/* Admin stats: one tenant's events starting inside [fromUtc, toUtc).
 * starts_at_utc is the window key (the week view's rule), so timeless
 * rows belong to no window and never come back. Every status comes
 * back; the stats service decides which statuses count. */
export async function listEventsInWindow(
  d1: D1Database, tenant: string, fromUtc: number, toUtc: number,
): Promise<EventRow[]> {
  const db = createDb(d1);
  const rows = await db.all<EventRow>(
    sql`SELECT * FROM ${events} WHERE ${col('tenant')} = ${tenant} AND ${col('starts_at_utc')} >= ${fromUtc} AND ${col('starts_at_utc')} < ${toUtc} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

/* GraphQL list page: recruiting groupings of one type in one guild
 * (completed/draft never listed; open first, timeless last, newest
 * first within a group). */
export async function listEventsByTenantType(d1: D1Database, tenant: string, type: string): Promise<EventRow[]> {
  const db = createDb(d1);
  const rows = await db.all<EventRow>(sql`SELECT * FROM ${events} WHERE ${col('tenant')} = ${tenant} AND ${col('type')} = ${type} AND ${col('status')} NOT IN ('draft', 'completed') ORDER BY CASE ${col('status')} WHEN 'open' THEN 0 ELSE 1 END, COALESCE(${col('starts_at_utc')}, 9999999999) ASC, ${col('id')} DESC`);
  return rows || [];
}

/* OG guild card: this week's recruiting activity count (completed/draft excluded). */
export async function countActivityEventsInWindow(
  d1: D1Database, tenant: string, fromUtc: number, toUtc: number,
): Promise<number> {
  const db = createDb(d1);
  const row = await db.get<{ c: number }>(
    sql`SELECT COUNT(*) AS c FROM ${events} WHERE ${col('tenant')} = ${tenant} AND ${col('type')} = 'activity' AND ${col('status')} NOT IN ('draft', 'completed') AND ${col('starts_at_utc')} >= ${fromUtc} AND ${col('starts_at_utc')} < ${toUtc}`,
  );
  return row ? Number(row.c) || 0 : 0;
}

/* ---------- Reminder scheduling (pending = PENDING_WHERE) ----------
 * Pending = published (open/closed), has a start time, unsettled
 * (never sent, never failed). */

export async function nextPendingReminderStart(
  d1: D1Database, slug: string, nowSec: number,
): Promise<number | null> {
  const db = createDb(d1);
  const row = await db.get<{ m: number | null }>(
    sql`SELECT MIN(${col('starts_at_utc')}) AS m FROM ${events} WHERE ${col('tenant')} = ${slug} AND ${col('status')} IN ('open', 'closed') AND ${col('starts_at_utc')} IS NOT NULL AND ${col('starts_at_utc')} > ${nowSec} AND ${col('reminder_sent_at')} IS NULL AND ${col('reminder_error')} IS NULL`,
  );
  return row && row.m != null ? Number(row.m) : null;
}

/* Due groupings (reminder time reached): full rows, ascending by start time. */
export async function listDueReminderEvents(
  d1: D1Database, slug: string, nowSec: number, leadSec: number,
): Promise<EventRow[]> {
  const db = createDb(d1);
  const rows = await db.all<EventRow>(
    sql`SELECT * FROM ${events} WHERE ${col('tenant')} = ${slug} AND ${col('status')} IN ('open', 'closed') AND ${col('starts_at_utc')} IS NOT NULL AND ${col('starts_at_utc')} > ${nowSec} AND ${col('reminder_sent_at')} IS NULL AND ${col('reminder_error')} IS NULL AND ${col('starts_at_utc')} - ${leadSec} <= ${nowSec} ORDER BY ${col('starts_at_utc')} ASC, ${col('id')} ASC`,
  );
  return rows || [];
}

/* ---------- Reminder beats (event_reminders) ----------
 * Multi-offset reminders settle per (grouping, offset): the table
 * holds one row per settled beat. Pending groupings for reminder
 * purposes are the legacy-unsettled ones (open/closed, has a start
 * time in the future, whole-grouping marks still empty); which of
 * their beats are due / next is computed by the reminder service
 * from these rows plus the guild's configured offsets. */

export interface ReminderBeatRow {
  event_id: number;
  offset_min: number;
  sent_at: number | null;
  error: string | null;
}

/* Pending groupings (legacy-unsettled) with a future start, ascending. */
export async function listPendingReminderEvents(
  d1: D1Database, slug: string, nowSec: number,
): Promise<{ id: number; starts_at_utc: number }[]> {
  const db = createDb(d1);
  const rows = await db.all<{ id: number; starts_at_utc: number }>(
    sql`SELECT ${col('id')}, ${col('starts_at_utc')} FROM ${events} WHERE ${col('tenant')} = ${slug} AND ${col('status')} IN ('open', 'closed') AND ${col('starts_at_utc')} IS NOT NULL AND ${col('starts_at_utc')} > ${nowSec} AND ${col('reminder_sent_at')} IS NULL AND ${col('reminder_error')} IS NULL ORDER BY ${col('starts_at_utc')} ASC, ${col('id')} ASC`,
  );
  return rows || [];
}

/* Full rows for specific pending groupings (the alarm's send path
 * re-verifies each one at fire time). */
export async function listPendingReminderEventRows(
  d1: D1Database, slug: string, ids: number[],
): Promise<EventRow[]> {
  if (!ids.length) return [];
  const db = createDb(d1);
  const idList = sql.join(ids.map((i) => sql`${i}`), sql`, `);
  const rows = await db.all<EventRow>(
    sql`SELECT * FROM ${events} WHERE ${col('tenant')} = ${slug} AND ${col('id')} IN (${idList}) ORDER BY ${col('starts_at_utc')} ASC, ${col('id')} ASC`,
  );
  return rows || [];
}

export async function listSettledBeats(
  d1: D1Database, eventIds: number[],
): Promise<ReminderBeatRow[]> {
  if (!eventIds.length) return [];
  const db = createDb(d1);
  const idList = sql.join(eventIds.map((i) => sql`${i}`), sql`, `);
  const rows = await db.all<ReminderBeatRow>(
    sql`SELECT ${col('event_id')}, ${col('offset_min')}, ${col('sent_at')}, ${col('error')} FROM ${eventReminders} WHERE ${col('event_id')} IN (${idList})`,
  );
  return rows || [];
}

/* Beat settlement: success writes sent_at (and clears the error),
 * failure writes the error. Settled beats are never resent. */
export async function markBeatSent(d1: D1Database, eventId: number, offsetMin: number, atSec: number): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`INSERT INTO ${eventReminders} (${sql.identifier('event_id')}, ${sql.identifier('offset_min')}, ${sql.identifier('sent_at')}) VALUES (${eventId}, ${offsetMin}, ${atSec}) ON CONFLICT (${sql.identifier('event_id')}, ${sql.identifier('offset_min')}) DO UPDATE SET ${sql.identifier('sent_at')} = excluded.sent_at, ${sql.identifier('error')} = NULL`);
  return metaOf(r);
}

export async function markBeatError(d1: D1Database, eventId: number, offsetMin: number, errorText: string): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`INSERT INTO ${eventReminders} (${sql.identifier('event_id')}, ${sql.identifier('offset_min')}, ${sql.identifier('error')}) VALUES (${eventId}, ${offsetMin}, ${errorText}) ON CONFLICT (${sql.identifier('event_id')}, ${sql.identifier('offset_min')}) DO UPDATE SET ${sql.identifier('error')} = excluded.error`);
  return metaOf(r);
}


/* Writable-column whitelist (snake name -> input key). insert/update
 * accept only in-table keys; unknown keys throw, so callers cannot
 * splice arbitrary column names into SQL. */
const EVENT_COLUMNS = new Set([
  'tenant', 'title', 'type', 'description', 'starts_at', 'starts_at_utc',
  'meet_info', 'max_slots', 'status', 'origin', 'created_by', 'manage_code',
  'dungeon', 'creator_discord_id', 'reminder_sent_at', 'reminder_error',
  'ally_visible', 'visitor_slots',
]);

function checkedColumns(row: Record<string, unknown>): string[] {
  const cols = Object.keys(row);
  for (const c of cols) {
    if (!EVENT_COLUMNS.has(c)) throw new Error(`events repository: unknown column ${c}`);
  }
  if (!cols.length) throw new Error('events repository: empty row');
  return cols;
}

/* Generic insert: the column set comes from the input (each creation
 * path has a different set; literal defaults are passed in as plain
 * values). Returns last_row_id. */
export async function insertEvent(d1: D1Database, row: Record<string, unknown>): Promise<RunMeta> {
  const db = createDb(d1);
  const cols = checkedColumns(row);
  const r = await db.run(sql`INSERT INTO ${events} (${sql.join(cols.map((c) => col(c)), sql`, `)})
    VALUES (${sql.join(cols.map((c) => sql`${row[c]}`), sql`,`)})`);
  return metaOf(r);
}

/* Generic field update: patch key order = SET order; tenant null =
 * no tenant condition (admin / GraphQL paths). */
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

export async function setEventStatus(d1: D1Database, id: number, status: string): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`UPDATE ${events} SET ${col('status')} = ${status} WHERE ${col('id')} = ${id}`);
  return metaOf(r);
}

/* Reminder settlement: success writes sent_at, failure writes error; settled rows are never retried. */
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

/* Disband cascade: signups + results + the grouping itself, executed
 * as one D1 batch (any failure rolls back the whole group).
 * tenant null = no tenant condition. */
export async function deleteEventCascade(d1: D1Database, id: number, tenant: string | null): Promise<void> {
  await d1.batch([
    d1.prepare('DELETE FROM signups WHERE event_id = ?').bind(id),
    d1.prepare('DELETE FROM results WHERE event_id = ?').bind(id),
    tenant == null
      ? d1.prepare('DELETE FROM events WHERE id = ?').bind(id)
      : d1.prepare('DELETE FROM events WHERE id = ? AND tenant = ?').bind(id, tenant),
  ]);
}

/* ---------- account deletion / export (creator-keyed) ---------- */

export interface CreatorEventRow {
  id: number;
  tenant: string;
  title: string;
  type: string;
  starts_at: string | null;
  status: string;
  created_by: string;
  created_at: string;
}

/** All cars this user leads (the export package's carsLed section). */
export async function listEventsByCreator(d1: D1Database, discordId: string): Promise<CreatorEventRow[]> {
  const db = createDb(d1);
  const rows = await db.all<CreatorEventRow>(
    sql`SELECT ${col('id')}, ${col('tenant')}, ${col('title')}, ${col('type')}, ${col('starts_at')}, ${col('status')}, ${col('created_by')}, ${col('created_at')}
        FROM ${events} WHERE ${col('creator_discord_id')} = ${discordId} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

/** Whether this user leads at least one car in this guild — the
 * schedule page's availability-summary verdict for car leaders (the
 * summary itself is composed only for guild admins and leaders). */
export async function hasEventsByTenantCreator(d1: D1Database, tenant: string, discordId: string): Promise<boolean> {
  const db = createDb(d1);
  const row = await db.get<{ id: number }>(
    sql`SELECT ${col('id')} FROM ${events} WHERE ${col('tenant')} = ${tenant} AND ${col('creator_discord_id')} = ${discordId} LIMIT 1`,
  );
  return !!row;
}

/** Deletion Q1: led cars are orphaned (creator unlinked, display name
 * anonymized), never deleted — fellow riders keep their history. */
export async function orphanEventsByCreator(
  d1: D1Database, discordId: string, tombstoneName: string,
): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${events} SET ${col('creator_discord_id')} = NULL, ${col('created_by')} = ${tombstoneName}
        WHERE ${col('creator_discord_id')} = ${discordId}`,
  );
  return metaOf(r).changes;
}

/* ---------- ally sharing (P20) ----------
 * Open groupings of the given tenants flagged ally-visible. The
 * CALLER (network surface) passes only tenants with a currently
 * ACTIVE alliance — the alliance verdict is read-time, so this
 * query deliberately knows nothing about alliances; an empty
 * tenant list short-circuits to no rows. */
export async function listAllySharedEvents(
  d1: D1Database, tenants: string[], limit: number = 100,
): Promise<EventRow[]> {
  if (!tenants.length) return [];
  const db = createDb(d1);
  const rows = await db.all<EventRow>(
    sql`SELECT * FROM ${events}
        WHERE ${col('tenant')} IN (${sql.join(tenants.map((t) => sql`${t}`), sql`, `)})
          AND ${col('ally_visible')} = 1 AND ${col('visitor_slots')} > 0
          AND ${col('status')} = 'open'
        ORDER BY ${col('id')} DESC LIMIT ${limit}`,
  );
  return rows || [];
}
