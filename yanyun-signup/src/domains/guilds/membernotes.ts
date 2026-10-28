/* Guild member officer notes repository (free officer tools line,
 * F12): the guild_member_notes entity's row operations. Every read
 * and write is scoped by tenant — a note id alone never crosses a
 * guild boundary. Notes are an admin-side record only: this repository
 * is consumed by the officer surface and its mutations, never by a
 * member-facing surface. Validation, the admin verdict and all copy
 * live in the callers (officer-graphql.ts) — this file owns the
 * statements only. */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { guildMemberNotes } from './schema.ts';
import { mintPublicId } from '../platform/id-mint.ts';

const col = (name: string) => sql.identifier(name);

/** Note body cap in characters, enforced by the write mutations. */
export const MEMBER_NOTE_MAX_BODY = 500;

export interface MemberNoteRow {
  id: number;
  tenant: number;
  member_user_id: number;
  body: string;
  author_user_id: number;
  author_name: string;
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

const NOTE_COLS = sql`${guildMemberNotes.id}, ${guildMemberNotes.tenant}, ${guildMemberNotes.memberUserId}, ${guildMemberNotes.body}, ${guildMemberNotes.authorUserId}, ${guildMemberNotes.authorName}, ${guildMemberNotes.createdAt}, ${guildMemberNotes.updatedAt}`;

/** Insert one note; returns the new row id. */
export async function insertMemberNote(
  d1: D1Database,
  row: {
    tenant: number; memberUserId: number; body: string;
    authorUserId: number; authorName: string; createdAt: number;
  },
): Promise<number> {
  const db = createDb(d1);
  // INSERT column lists must use bare column names (SQLite syntax); see settings.ts note.
  const r = await db.run(
    sql`INSERT INTO ${guildMemberNotes} (${col('id')}, ${col('tenant')}, ${col('member_user_id')}, ${col('body')}, ${col('author_user_id')}, ${col('author_name')}, ${col('created_at')}, ${col('updated_at')})
        VALUES (${await mintPublicId(d1, 'memberNote')}, ${row.tenant}, ${row.memberUserId}, ${row.body}, ${row.authorUserId}, ${row.authorName}, ${row.createdAt}, ${row.createdAt})`,
  );
  return metaOf(r).last_row_id;
}

/** One note of one guild; null when it does not exist THERE (an id
 * from another guild is indistinguishable from a missing id). */
export async function getMemberNote(
  d1: D1Database,
  tenant: number,
  id: number,
): Promise<MemberNoteRow | null> {
  const db = createDb(d1);
  const row = await db.get<MemberNoteRow>(
    sql`SELECT ${NOTE_COLS} FROM ${guildMemberNotes}
        WHERE ${guildMemberNotes.tenant} = ${tenant} AND ${guildMemberNotes.id} = ${id}`,
  );
  return row ?? null;
}

/** Notes about one member of one guild, oldest first. */
export async function listMemberNotes(
  d1: D1Database,
  tenant: number,
  memberUserId: number,
): Promise<MemberNoteRow[]> {
  const db = createDb(d1);
  const rows = await db.all<MemberNoteRow>(
    sql`SELECT ${NOTE_COLS} FROM ${guildMemberNotes}
        WHERE ${guildMemberNotes.tenant} = ${tenant} AND ${guildMemberNotes.memberUserId} = ${memberUserId}
        ORDER BY ${guildMemberNotes.id} ASC`,
  );
  return rows || [];
}

/** Every note of one guild, oldest first (officer page composition). */
export async function listMemberNotesByTenant(
  d1: D1Database,
  tenant: number,
): Promise<MemberNoteRow[]> {
  const db = createDb(d1);
  const rows = await db.all<MemberNoteRow>(
    sql`SELECT ${NOTE_COLS} FROM ${guildMemberNotes}
        WHERE ${guildMemberNotes.tenant} = ${tenant}
        ORDER BY ${guildMemberNotes.id} ASC`,
  );
  return rows || [];
}

/** Rewrite one note's body; returns true when a row actually moved. */
export async function updateMemberNote(
  d1: D1Database,
  tenant: number,
  id: number,
  body: string,
  updatedAt: number,
): Promise<boolean> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${guildMemberNotes} SET ${col('body')} = ${body}, ${col('updated_at')} = ${updatedAt}
        WHERE ${guildMemberNotes.tenant} = ${tenant} AND ${guildMemberNotes.id} = ${id}`,
  );
  return metaOf(r).changes >= 1;
}

/** Delete one note of one guild; returns true when a row went away. */
export async function deleteMemberNote(
  d1: D1Database,
  tenant: number,
  id: number,
): Promise<boolean> {
  const db = createDb(d1);
  const r = await db.run(
    sql`DELETE FROM ${guildMemberNotes}
        WHERE ${guildMemberNotes.tenant} = ${tenant} AND ${guildMemberNotes.id} = ${id}`,
  );
  return metaOf(r).changes >= 1;
}
