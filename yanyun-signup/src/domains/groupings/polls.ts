/* ===================================================
 * Data-layer access (Repository) for the time poll entities (F13):
 * time_polls + time_poll_options + time_poll_votes.
 *
 * A poll is a guild-scoped scheduling question: several candidate
 * start times (epoch seconds, UTC), and members vote availability-
 * style — one vote row per candidate they CAN attend (multi-select,
 * never a single popularity pick). Re-voting replaces the member's
 * whole set atomically at the mutation layer (delete + inserts via
 * this repository). Closing stamps closed_at and flips status; the
 * tallies stay as the scheduling record. Business code must not
 * hand-roll SQL against these tables.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { timePolls, timePollOptions, timePollVotes } from './schema.ts';

const col = (name: string) => sql.identifier(name);

export interface TimePollRow {
  id: number;
  tenant: string;
  title: string;
  status: string;
  created_by: string;
  created_at: number;
  closed_at: number | null;
}

export interface TimePollOptionRow {
  id: number;
  poll_id: number;
  starts_at_utc: number;
}

export interface TimePollVoteRow {
  id: number;
  poll_id: number;
  option_id: number;
  discord_id: string;
  display_name: string;
}

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

export const MAX_POLL_OPTIONS = 8;
export const MIN_POLL_OPTIONS = 2;

/**
 * Validate candidate start times (pure): 2..8 distinct epoch-second
 * instants, none more than an hour in the past and none beyond the
 * same 60-day horizon grouping creation enforces. Returns the
 * sorted candidate list or a stable error code.
 */
export function validatePollCandidates(
  input: unknown, nowSec: number,
): { candidates: number[] } | { error: string } {
  if (!Array.isArray(input)) return { error: 'pollOptionsInvalid' };
  const seen = new Set<number>();
  for (const raw of input) {
    let utc = parseInt(String(raw ?? ''), 10) || 0;
    if (!utc && raw) {
      const ms = Date.parse(String(raw));
      if (!Number.isNaN(ms)) utc = Math.floor(ms / 1000);
    }
    if (!utc || utc < nowSec - 3600 || utc > nowSec + 60 * 86400) return { error: 'pollOptionsInvalid' };
    seen.add(utc);
  }
  if (seen.size < MIN_POLL_OPTIONS || seen.size > MAX_POLL_OPTIONS) return { error: 'pollOptionsInvalid' };
  return { candidates: [...seen].sort((a, b) => a - b) };
}

/* ---------- Reads ---------- */

/** One guild's polls, newest first (the schedule page order). */
export async function listTimePolls(
  d1: D1Database, tenant: string,
): Promise<TimePollRow[]> {
  const db = createDb(d1);
  const rows = await db.all<TimePollRow>(
    sql`SELECT * FROM ${timePolls} WHERE ${col('tenant')} = ${tenant} ORDER BY ${col('id')} DESC`,
  );
  return rows || [];
}

export async function getTimePoll(
  d1: D1Database, id: number,
): Promise<TimePollRow | null> {
  const db = createDb(d1);
  const row = await db.get<TimePollRow>(
    sql`SELECT * FROM ${timePolls} WHERE ${col('id')} = ${id}`,
  );
  return row ?? null;
}

export async function listTimePollOptions(
  d1: D1Database, pollId: number,
): Promise<TimePollOptionRow[]> {
  const db = createDb(d1);
  const rows = await db.all<TimePollOptionRow>(
    sql`SELECT * FROM ${timePollOptions} WHERE ${col('poll_id')} = ${pollId} ORDER BY ${col('starts_at_utc')} ASC`,
  );
  return rows || [];
}

export async function listTimePollVotes(
  d1: D1Database, pollId: number,
): Promise<TimePollVoteRow[]> {
  const db = createDb(d1);
  const rows = await db.all<TimePollVoteRow>(
    sql`SELECT * FROM ${timePollVotes} WHERE ${col('poll_id')} = ${pollId} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

/* ---------- Writes ---------- */

const POLL_COLUMNS = new Set(['tenant', 'title', 'status', 'created_by', 'created_at', 'closed_at']);

function checkedPollColumns(row: Record<string, unknown>): string[] {
  const cols = Object.keys(row);
  for (const c of cols) {
    if (!POLL_COLUMNS.has(c)) throw new Error(`time_polls repository: unknown column ${c}`);
  }
  if (!cols.length) throw new Error('time_polls repository: empty row');
  return cols;
}

export async function insertTimePoll(
  d1: D1Database, row: Record<string, unknown>,
): Promise<RunMeta> {
  const db = createDb(d1);
  const cols = checkedPollColumns(row);
  const r = await db.run(sql`INSERT INTO ${timePolls} (${sql.join(cols.map((c) => col(c)), sql`, `)})
    VALUES (${sql.join(cols.map((c) => sql`${row[c]}`), sql`,`)})`);
  return metaOf(r);
}

export async function insertTimePollOption(
  d1: D1Database,
  row: { pollId: number; startsAtUtc: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${timePollOptions} (${col('poll_id')}, ${col('starts_at_utc')})
        VALUES (${row.pollId}, ${row.startsAtUtc})`,
  );
  return metaOf(r);
}

/** Replace one member's whole vote set in a poll (delete + inserts). */
export async function replaceTimePollVotes(
  d1: D1Database,
  row: { pollId: number; discordId: string; displayName: string; optionIds: number[] },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`DELETE FROM ${timePollVotes} WHERE ${col('poll_id')} = ${row.pollId} AND ${col('discord_id')} = ${row.discordId}`,
  );
  for (const optionId of row.optionIds) {
    await db.run(
      sql`INSERT INTO ${timePollVotes} (${col('poll_id')}, ${col('option_id')}, ${col('discord_id')}, ${col('display_name')})
          VALUES (${row.pollId}, ${optionId}, ${row.discordId}, ${row.displayName})`,
    );
  }
}

/** Close settlement: status flips to 'closed' with the close time. */
export async function closeTimePoll(
  d1: D1Database, id: number, closedAt: number,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${timePolls} SET ${col('status')} = 'closed', ${col('closed_at')} = ${closedAt} WHERE ${col('id')} = ${id}`,
  );
  return metaOf(r);
}
