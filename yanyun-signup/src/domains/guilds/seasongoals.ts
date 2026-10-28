/* Member season goals repository (free officer tools line, F19):
 * the member_season_goals entity's row operations. Every read and
 * write is scoped by tenant — a goal id alone never crosses a guild
 * boundary, and owner-scoped reads/writes additionally pin the row to
 * its owner, so one member's goal is unreachable from another member's
 * session. Validation, the member/admin verdicts and all copy live in
 * the callers (officer-graphql.ts) — this file owns the statements
 * only. */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { memberSeasonGoals } from './schema.ts';

const col = (name: string) => sql.identifier(name);

/** Stored status values (GraphQL exposes them as the SeasonGoalStatus enum). */
export const SEASON_GOAL_STATUSES = ['active', 'done', 'dropped'] as const;
/** Goal title cap in characters, enforced by the write mutations. */
export const SEASON_GOAL_MAX_TITLE = 80;
/** Progress note cap in characters, enforced by the write mutations. */
export const SEASON_GOAL_MAX_NOTE = 500;

export interface SeasonGoalRow {
  id: number;
  tenant: string;
  discord_id: string;
  member_name: string;
  title: string;
  note: string;
  status: string;
  dungeon_id: number | null;
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

const GOAL_COLS = sql`${memberSeasonGoals.id}, ${memberSeasonGoals.tenant}, ${memberSeasonGoals.discordId}, ${memberSeasonGoals.memberName}, ${memberSeasonGoals.title}, ${memberSeasonGoals.note}, ${memberSeasonGoals.status}, ${memberSeasonGoals.dungeonId}, ${memberSeasonGoals.createdAt}, ${memberSeasonGoals.updatedAt}`;

/** Insert one goal; returns the new row id. */
export async function insertSeasonGoal(
  d1: D1Database,
  row: {
    tenant: string; discordId: string; memberName: string;
    title: string; note: string; status: string;
    dungeonId: number | null; createdAt: number;
  },
): Promise<number> {
  const db = createDb(d1);
  // INSERT column lists must use bare column names (SQLite syntax); see settings.ts note.
  const r = await db.run(
    sql`INSERT INTO ${memberSeasonGoals} (${col('tenant')}, ${col('discord_id')}, ${col('member_name')}, ${col('title')}, ${col('note')}, ${col('status')}, ${col('dungeon_id')}, ${col('created_at')}, ${col('updated_at')})
        VALUES (${row.tenant}, ${row.discordId}, ${row.memberName}, ${row.title}, ${row.note}, ${row.status}, ${row.dungeonId}, ${row.createdAt}, ${row.createdAt})`,
  );
  return metaOf(r).last_row_id;
}

/** One goal by id (unscoped by tenant/owner — callers MUST pin the
 * row to its guild and owner before acting on it). */
export async function getSeasonGoal(
  d1: D1Database,
  id: number,
): Promise<SeasonGoalRow | null> {
  const db = createDb(d1);
  const row = await db.get<SeasonGoalRow>(
    sql`SELECT ${GOAL_COLS} FROM ${memberSeasonGoals}
        WHERE ${memberSeasonGoals.id} = ${id}`,
  );
  return row ?? null;
}

/** One member's goals in one guild, newest first. */
export async function listSeasonGoalsByMember(
  d1: D1Database,
  tenant: string,
  discordId: string,
): Promise<SeasonGoalRow[]> {
  const db = createDb(d1);
  const rows = await db.all<SeasonGoalRow>(
    sql`SELECT ${GOAL_COLS} FROM ${memberSeasonGoals}
        WHERE ${memberSeasonGoals.tenant} = ${tenant} AND ${memberSeasonGoals.discordId} = ${discordId}
        ORDER BY ${memberSeasonGoals.id} DESC`,
  );
  return rows || [];
}

/** One member's goals across every guild (settings-page composition). */
export async function listSeasonGoalsByUser(
  d1: D1Database,
  discordId: string,
): Promise<SeasonGoalRow[]> {
  const db = createDb(d1);
  const rows = await db.all<SeasonGoalRow>(
    sql`SELECT ${GOAL_COLS} FROM ${memberSeasonGoals}
        WHERE ${memberSeasonGoals.discordId} = ${discordId}
        ORDER BY ${memberSeasonGoals.id} DESC`,
  );
  return rows || [];
}

/** Every goal of one guild, newest first (officer overview + export). */
export async function listSeasonGoalsByTenant(
  d1: D1Database,
  tenant: string,
): Promise<SeasonGoalRow[]> {
  const db = createDb(d1);
  const rows = await db.all<SeasonGoalRow>(
    sql`SELECT ${GOAL_COLS} FROM ${memberSeasonGoals}
        WHERE ${memberSeasonGoals.tenant} = ${tenant}
        ORDER BY ${memberSeasonGoals.id} DESC`,
  );
  return rows || [];
}

/** Rewrite the member-maintained fields of one goal. The statement
 * pins tenant AND owner, so a foreign id simply matches nothing. */
export async function updateSeasonGoal(
  d1: D1Database,
  row: {
    tenant: string; discordId: string; id: number;
    title: string; note: string; status: string;
    dungeonId: number | null; memberName: string; updatedAt: number;
  },
): Promise<boolean> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${memberSeasonGoals} SET ${col('title')} = ${row.title}, ${col('note')} = ${row.note}, ${col('status')} = ${row.status}, ${col('dungeon_id')} = ${row.dungeonId}, ${col('member_name')} = ${row.memberName}, ${col('updated_at')} = ${row.updatedAt}
        WHERE ${memberSeasonGoals.tenant} = ${row.tenant} AND ${memberSeasonGoals.discordId} = ${row.discordId} AND ${memberSeasonGoals.id} = ${row.id}`,
  );
  return metaOf(r).changes >= 1;
}

/** Delete one goal; the statement pins tenant AND owner. */
export async function deleteSeasonGoal(
  d1: D1Database,
  tenant: string,
  discordId: string,
  id: number,
): Promise<boolean> {
  const db = createDb(d1);
  const r = await db.run(
    sql`DELETE FROM ${memberSeasonGoals}
        WHERE ${memberSeasonGoals.tenant} = ${tenant} AND ${memberSeasonGoals.discordId} = ${discordId} AND ${memberSeasonGoals.id} = ${id}`,
  );
  return metaOf(r).changes >= 1;
}
