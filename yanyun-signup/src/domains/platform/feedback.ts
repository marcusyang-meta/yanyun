// User feedback repository: the feedback entity's row operations.
// Submissions come from the profile feedback form (GraphQL
// submitFeedback); triage reads and the status flip come from the hub
// portal. Validation, the per-user daily cap and all copy live in the
// callers — this file owns the statements only.
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { mintPublicId } from './id-mint.ts';
import { feedback } from './schema.ts';

/** Stored category values (GraphQL exposes them as the FeedbackCategory enum). */
export const FEEDBACK_CATEGORIES = ['problem', 'suggestion', 'other'] as const;
/** Free-text cap, in characters, enforced by the submit mutation. */
export const FEEDBACK_MAX_CONTENT = 2000;
/** Anti-spam: at most this many submissions per user per rolling 24h. */
export const FEEDBACK_DAILY_LIMIT = 5;

export interface FeedbackRow {
  id: number;
  user_id: number;
  user_name: string;
  category: string;
  content: string;
  status: string;
  created_at: number;
  resolved_at: number | null;
}

interface CountRow { c: number }

export async function insertFeedback(
  d1: D1Database,
  row: {
    userId: number; userName: string; category: string;
    content: string; createdAt: number;
  },
): Promise<void> {
  const db = createDb(d1);
  // INSERT column lists must use bare column names (SQLite syntax); see settings.ts note.
  await db.run(
    sql`INSERT INTO ${feedback} (${sql.identifier('id')}, ${sql.identifier('user_id')}, ${sql.identifier('user_name')}, ${sql.identifier('category')}, ${sql.identifier('content')}, ${sql.identifier('status')}, ${sql.identifier('created_at')})
        VALUES (${await mintPublicId(d1, 'feedback')}, ${row.userId}, ${row.userName}, ${row.category}, ${row.content}, 'open', ${row.createdAt})`,
  );
}

/** Submissions by one user at or after `sinceMs` (epoch ms) — the daily-cap count. */
export async function countFeedbackSince(
  d1: D1Database,
  userId: number,
  sinceMs: number,
): Promise<number> {
  const db = createDb(d1);
  const rows = await db.all<CountRow>(
    sql`SELECT COUNT(*) AS c FROM ${feedback} WHERE ${feedback.userId} = ${userId} AND ${feedback.createdAt} >= ${sinceMs}`,
  );
  const row = rows && rows[0];
  return row ? Number(row.c) || 0 : 0;
}

/** Newest-first page of feedback; `status` '' (or 'all') means no filter. */
export async function listFeedback(
  d1: D1Database,
  opts: { status: string; limit: number; offset: number },
): Promise<FeedbackRow[]> {
  const db = createDb(d1);
  const filtered = opts.status && opts.status !== 'all';
  const rows = filtered
    ? await db.all<FeedbackRow>(
      sql`SELECT ${feedback.id}, ${feedback.userId}, ${feedback.userName}, ${feedback.category}, ${feedback.content}, ${feedback.status}, ${feedback.createdAt}, ${feedback.resolvedAt}
          FROM ${feedback} WHERE ${feedback.status} = ${opts.status}
          ORDER BY ${feedback.id} DESC LIMIT ${opts.limit} OFFSET ${opts.offset}`,
    )
    : await db.all<FeedbackRow>(
      sql`SELECT ${feedback.id}, ${feedback.userId}, ${feedback.userName}, ${feedback.category}, ${feedback.content}, ${feedback.status}, ${feedback.createdAt}, ${feedback.resolvedAt}
          FROM ${feedback}
          ORDER BY ${feedback.id} DESC LIMIT ${opts.limit} OFFSET ${opts.offset}`,
    );
  return rows || [];
}

export async function countFeedback(
  d1: D1Database,
  status: string,
): Promise<number> {
  const db = createDb(d1);
  const filtered = status && status !== 'all';
  const rows = filtered
    ? await db.all<CountRow>(
      sql`SELECT COUNT(*) AS c FROM ${feedback} WHERE ${feedback.status} = ${status}`,
    )
    : await db.all<CountRow>(
      sql`SELECT COUNT(*) AS c FROM ${feedback}`,
    );
  const row = rows && rows[0];
  return row ? Number(row.c) || 0 : 0;
}

/** Flip the triage status; resolving stamps resolved_at, reopening
 *  clears it. Returns true when a row actually changed. */
export async function setFeedbackStatus(
  d1: D1Database,
  id: number,
  status: string,
  atMs: number,
): Promise<boolean> {
  const db = createDb(d1);
  // SET targets must be bare column names (SQLite rejects table-qualified
  // SET targets — the phase-1 bug class the D1 verifier exists to catch);
  // the WHERE clause may stay qualified.
  const res: unknown = await db.run(
    sql`UPDATE ${feedback} SET ${sql.identifier('status')} = ${status}, ${sql.identifier('resolved_at')} = ${status === 'resolved' ? atMs : null} WHERE ${feedback.id} = ${id}`,
  );
  const meta = (res as { meta?: { changes?: number } } | null)?.meta;
  return (meta?.changes ?? 0) > 0;
}
