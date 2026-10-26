/* ===================================================
 * Data-layer access (Repository) for the signups entity.
 *
 * Business code must not hand-roll SQL against signups;
 * everything goes through this file. Rows keep the legacy
 * snake_case keys; writes return the D1 meta (changes /
 * last_row_id), same shape as the old .run() results.
 *
 * Red-line unit: the capacity guard's atomic INSERT ... SELECT
 * ... WHERE COUNT < max_slots, together with its full-car healer
 * rollback check, is one atomicity unit, encapsulated in
 * insertSignupWithCapacityGuard (shared by GraphQL joinGrouping
 * and the REST signup path).
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
  ready_at: number | null;
}

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}


let signupDiscordColReady: Promise<void> | null = null;
/** Adds signups.discord_id (seat identity stamp). */
export function ensureSignupDiscordColumn(d1: D1Database): Promise<void> {
  if (!signupDiscordColReady) {
    signupDiscordColReady = (async () => {
      try {
        const db = createDb(d1);
        const results = await db.all<{ name: string }>(sql`PRAGMA table_info(${signups})`);
        const cols = new Set((results || []).map((r) => r.name));
        if (!cols.has('discord_id')) {
          await db.run(sql`ALTER TABLE ${signups} ADD COLUMN ${col('discord_id')} TEXT`);
        }
      } catch { /* already-exists and similar: ignore */ }
    })();
  }
  return signupDiscordColReady;
}


let signupReadyColReady: Promise<void> | null = null;
/** Adds signups.ready_at (seat readiness stamp for departure reminders:
 * epoch seconds when the seated member marked themselves ready;
 * NULL = not ready). */
export function ensureSignupReadyColumn(d1: D1Database): Promise<void> {
  if (!signupReadyColReady) {
    signupReadyColReady = (async () => {
      try {
        const db = createDb(d1);
        const results = await db.all<{ name: string }>(sql`PRAGMA table_info(${signups})`);
        const cols = new Set((results || []).map((r) => r.name));
        if (!cols.has('ready_at')) {
          await db.run(sql`ALTER TABLE ${signups} ADD COLUMN ${col('ready_at')} INTEGER`);
        }
      } catch { /* already-exists and similar: ignore */ }
    })();
  }
  return signupReadyColReady;
}


export async function listSignupsByEvent(d1: D1Database, eventId: number): Promise<SignupRow[]> {
  const db = createDb(d1);
  const rows = await db.all<SignupRow>(
    sql`SELECT * FROM ${signups} WHERE ${col('event_id')} = ${eventId} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

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

export async function listSignupSeats(d1: D1Database, eventId: number): Promise<{
  id: number; nickname: string; uid: string; role: string; weapon: string; discord_id: string | null; ready_at: number | null;
}[]> {
  const db = createDb(d1);
  const rows = await db.all<{
    id: number; nickname: string; uid: string; role: string; weapon: string; discord_id: string | null; ready_at: number | null;
  }>(
    sql`SELECT ${col('id')}, ${col('nickname')}, ${col('uid')}, ${col('role')}, ${col('weapon')}, ${col('discord_id')}, ${col('ready_at')} FROM ${signups} WHERE ${col('event_id')} = ${eventId} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

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

/* Edit-page roster read (nickname + identity stamp, unordered — matches the legacy query). */
export async function listSignupNamesStamps(d1: D1Database, eventId: number): Promise<{
  nickname: string; discord_id: string | null;
}[]> {
  const db = createDb(d1);
  const rows = await db.all<{ nickname: string; discord_id: string | null }>(
    sql`SELECT ${col('nickname')}, ${col('discord_id')} FROM ${signups} WHERE ${col('event_id')} = ${eventId}`,
  );
  return rows || [];
}

export async function listSignupSeatsForReminder(d1: D1Database, eventId: number): Promise<{
  nickname: string; discord_id: string | null; weapon: string; ready_at: number | null;
}[]> {
  const db = createDb(d1);
  const rows = await db.all<{ nickname: string; discord_id: string | null; weapon: string; ready_at: number | null }>(
    sql`SELECT ${col('nickname')}, ${col('discord_id')}, ${col('weapon')}, ${col('ready_at')} FROM ${signups} WHERE ${col('event_id')} = ${eventId} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

/* Readiness toggle: every seat stamped with the viewer's own discord_id
 * in this grouping flips together (one person, possibly two seats — same
 * readiness fact). readyAt null clears the mark. Changes = seats touched;
 * zero changes means the viewer holds no stamped seat here. */
export async function updateSignupReadyByEventDiscord(
  d1: D1Database, eventId: number, discordId: string, readyAt: number | null,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${signups} SET ${col('ready_at')} = ${readyAt} WHERE ${col('event_id')} = ${eventId} AND ${col('discord_id')} = ${discordId}`,
  );
  return metaOf(r);
}

export async function countSignupsByEvent(d1: D1Database, eventId: number): Promise<number> {
  const db = createDb(d1);
  const row = await db.get<{ c: number }>(
    sql`SELECT COUNT(*) AS c FROM ${signups} WHERE ${col('event_id')} = ${eventId}`,
  );
  return row ? Number(row.c) || 0 : 0;
}

/* Triple count for the full-car healer check (total seats /
 * healers / capacity cap), paired with the guard insert's
 * rollback decision (the same legacy query in graphql.js /
 * worker.js). */
export async function getSignupCapacityStats(
  d1: D1Database, eventId: number,
): Promise<{ c: number; h: number; m: number | null } | null> {
  const db = createDb(d1);
  const row = await db.get<{ c: number; h: number; m: number | null }>(
    sql`SELECT (SELECT COUNT(*) FROM ${signups} WHERE ${col('event_id')} = ${eventId}) AS c, (SELECT COUNT(*) FROM ${signups} WHERE ${col('event_id')} = ${eventId} AND ${col('role')} IN ('奶', '治疗')) AS h, (SELECT ${col('max_slots')} FROM ${events} WHERE ${col('id')} = ${eventId}) AS m`,
  );
  return row ?? null;
}

/* ---------- Red-line unit: capacity-guard atomic insert + full-car healer rollback ----------
 * Capacity check and insert complete in a single statement
 * (SQLite runs one statement atomically, so concurrent signups
 * cannot oversell); if the car is then full with no healer in the
 * whole team, this seat is rolled back (the legacy rule that the
 * last seat must be a healer). UNIQUE conflicts (same uid signing
 * up twice) still propagate to the caller for copy mapping. */
export type GuardedSignupOutcome =
  | { outcome: 'inserted'; signupId: number }
  | { outcome: 'full' }
  | { outcome: 'needsHealer' };

export async function insertSignupWithCapacityGuard(
  d1: D1Database, row: Record<string, unknown>,
): Promise<GuardedSignupOutcome> {
  const db = createDb(d1);
  const cols = checkedColumns(row);
  const eventId = row.event_id;
  const r = await db.run(sql`INSERT INTO ${signups} (${sql.join(cols.map((c) => col(c)), sql`, `)})
    SELECT ${sql.join(cols.map((c) => sql`${row[c]}`), sql`, `)}
    WHERE (SELECT COUNT(*) FROM ${signups} WHERE ${col('event_id')} = ${eventId})
        < (SELECT ${col('max_slots')} FROM ${events} WHERE ${col('id')} = ${eventId} AND ${col('status')} = 'open')`);
  const meta = metaOf(r);
  if (!meta.changes) return { outcome: 'full' };
  const full = await getSignupCapacityStats(d1, Number(eventId));
  if (full && full.c >= (full.m as number) && full.h === 0) {
    await deleteSignupById(d1, meta.last_row_id);
    return { outcome: 'needsHealer' };
  }
  return { outcome: 'inserted', signupId: meta.last_row_id };
}

/* ---------- Red-line unit: member-count aggregate ----------
 * Guild member count = the number of distinct nicknames that have
 * appeared across all of the guild's groupings (the same legacy
 * query behind GuildShell memberCount and the HubPageShell guild
 * cards). */
export async function countDistinctNicknamesByTenant(
  d1: D1Database, tenant: string,
): Promise<number> {
  const db = createDb(d1);
  const row = await db.get<{ c: number }>(
    sql`SELECT COUNT(DISTINCT s.nickname) AS c FROM ${signups} s JOIN ${events} e ON s.event_id = e.id WHERE e.tenant = ${tenant}`,
  );
  return row ? Number(row.c) || 0 : 0;
}

/* ---------- Red-line unit: mention-resolution seat stamping ----------
 * Legacy seats (taken before the identity gating) have no
 * discord_id stamp: when the portal's backfill registration hits
 * a unique nickname match it stamps seat by seat, so reminder @
 * resolution can reach the person. The to-stamp seat list (a JOIN
 * across events) and the stamping UPDATE form one unit. */
export async function listUnstampedSeatsByTenant(
  d1: D1Database, tenant: string,
): Promise<{ id: number; nickname: string }[]> {
  const db = createDb(d1);
  return db.all<{ id: number; nickname: string }>(
    sql`SELECT s.id, s.nickname FROM ${signups} s JOIN ${events} e ON e.id = s.event_id WHERE e.tenant = ${tenant} AND (s.discord_id IS NULL OR s.discord_id = '')`,
  );
}

export async function stampSignupDiscordId(
  d1: D1Database, signupId: number, discordId: string,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`UPDATE ${signups} SET ${col('discord_id')} = ${discordId} WHERE ${col('id')} = ${signupId}`);
  return metaOf(r);
}

export async function getSignupTenant(d1: D1Database, signupId: number, tenant: string): Promise<{ id: number } | null> {
  const db = createDb(d1);
  const row = await db.get<{ id: number }>(
    sql`SELECT s.id FROM ${signups} s JOIN ${events} e ON s.event_id = e.id WHERE s.id = ${signupId} AND e.tenant = ${tenant}`,
  );
  return row ?? null;
}


const SIGNUP_COLUMNS = new Set([
  'event_id', 'nickname', 'uid', 'role', 'weapon', 'contact', 'note',
  'team_name', 'members', 'discord_id', 'ready_at',
]);

function checkedColumns(row: Record<string, unknown>): string[] {
  const cols = Object.keys(row);
  for (const c of cols) {
    if (!SIGNUP_COLUMNS.has(c)) throw new Error(`signups repository: unknown column ${c}`);
  }
  if (!cols.length) throw new Error('signups repository: empty row');
  return cols;
}

/* Plain insert (non-guard paths: initial seating, proxy signups). Returns meta. */
export async function insertSignup(d1: D1Database, row: Record<string, unknown>): Promise<RunMeta> {
  const db = createDb(d1);
  const cols = checkedColumns(row);
  const r = await db.run(sql`INSERT INTO ${signups} (${sql.join(cols.map((c) => col(c)), sql`, `)})
    VALUES (${sql.join(cols.map((c) => sql`${row[c]}`), sql`,`)})`);
  return metaOf(r);
}

/* Batch seating: one D1 batch inside the repository (restores
 * the group atomicity lost when run statement-by-statement: any
 * failure rolls back the whole batch — no half-seated rows). */
export async function insertSignups(d1: D1Database, rows: Record<string, unknown>[]): Promise<void> {
  if (!rows.length) return;
  const stmts = rows.map((row) => {
    const cols = checkedColumns(row);
    return d1
      .prepare(`INSERT INTO signups (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`)
      .bind(...cols.map((c) => row[c]));
  });
  await d1.batch(stmts);
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

/* Change school (the school->role conversion happens in the caller; this writes only the two columns). */
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
