/* Guild announcements repository: the guild_announcements and
 * guild_announcement_reads entities' row operations (communication
 * line F9/F10/F18). Every read and write is scoped by tenant — an
 * announcement id alone never crosses a guild boundary. Validation,
 * the admin verdict, the daily rate limits and all copy live in the
 * callers (announcements-graphql.ts + the limits service) — this file
 * owns the statements only. */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { guildAnnouncements, guildAnnouncementReads } from './schema.ts';

const col = (name: string) => sql.identifier(name);

/** Stored kind values (GraphQL exposes them as the AnnouncementKind enum). */
export const ANNOUNCEMENT_KINDS = ['standard', 'urgent'] as const;
/** Title cap in characters, enforced by the post mutation. */
export const ANNOUNCEMENT_MAX_TITLE = 80;
/** Body cap in characters, enforced by the post mutation. */
export const ANNOUNCEMENT_MAX_BODY = 2000;
/** Page size of the member-facing announcement list. */
export const ANNOUNCEMENT_LIST_LIMIT = 50;

export interface AnnouncementRow {
  id: number;
  tenant: string;
  kind: string;
  title: string;
  body: string;
  author_discord_id: string;
  author_name: string;
  created_at: number;
}

export interface AnnouncementReadRow {
  discord_id: string;
  read_at: number;
}

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

const ANNOUNCEMENT_COLS = sql`${guildAnnouncements.id}, ${guildAnnouncements.tenant}, ${guildAnnouncements.kind}, ${guildAnnouncements.title}, ${guildAnnouncements.body}, ${guildAnnouncements.authorDiscordId}, ${guildAnnouncements.authorName}, ${guildAnnouncements.createdAt}`;

/** Insert one announcement; returns the new row id. */
export async function insertAnnouncement(
  d1: D1Database,
  row: {
    tenant: string; kind: string; title: string; body: string;
    authorDiscordId: string; authorName: string; createdAt: number;
  },
): Promise<number> {
  const db = createDb(d1);
  // INSERT column lists must use bare column names (SQLite syntax); see settings.ts note.
  const r = await db.run(
    sql`INSERT INTO ${guildAnnouncements} (${col('tenant')}, ${col('kind')}, ${col('title')}, ${col('body')}, ${col('author_discord_id')}, ${col('author_name')}, ${col('created_at')})
        VALUES (${row.tenant}, ${row.kind}, ${row.title}, ${row.body}, ${row.authorDiscordId}, ${row.authorName}, ${row.createdAt})`,
  );
  return metaOf(r).last_row_id;
}

/** Newest-first announcements of one guild (member list page). */
export async function listAnnouncements(
  d1: D1Database,
  tenant: string,
  limit: number,
): Promise<AnnouncementRow[]> {
  const db = createDb(d1);
  const rows = await db.all<AnnouncementRow>(
    sql`SELECT ${ANNOUNCEMENT_COLS} FROM ${guildAnnouncements}
        WHERE ${guildAnnouncements.tenant} = ${tenant}
        ORDER BY ${guildAnnouncements.id} DESC LIMIT ${limit}`,
  );
  return rows || [];
}

/** One announcement of one guild; null when it does not exist THERE
 * (an id from another guild is indistinguishable from a missing id). */
export async function getAnnouncement(
  d1: D1Database,
  tenant: string,
  id: number,
): Promise<AnnouncementRow | null> {
  const db = createDb(d1);
  const row = await db.get<AnnouncementRow>(
    sql`SELECT ${ANNOUNCEMENT_COLS} FROM ${guildAnnouncements}
        WHERE ${guildAnnouncements.tenant} = ${tenant} AND ${guildAnnouncements.id} = ${id}`,
  );
  return row ?? null;
}

/** Delete one announcement of one guild together with its read
 * receipts; returns true when an announcement row actually went away. */
export async function deleteAnnouncement(
  d1: D1Database,
  tenant: string,
  id: number,
): Promise<boolean> {
  const db = createDb(d1);
  const r = await db.run(
    sql`DELETE FROM ${guildAnnouncements}
        WHERE ${guildAnnouncements.tenant} = ${tenant} AND ${guildAnnouncements.id} = ${id}`,
  );
  if (metaOf(r).changes < 1) return false;
  await db.run(
    sql`DELETE FROM ${guildAnnouncementReads}
        WHERE ${guildAnnouncementReads.tenant} = ${tenant} AND ${guildAnnouncementReads.announcementId} = ${id}`,
  );
  return true;
}

/** Record (or keep) one member's read of one announcement. The first
 * read wins: re-opening never moves read_at. */
export async function markAnnouncementRead(
  d1: D1Database,
  row: { tenant: string; announcementId: number; discordId: string; readAt: number },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${guildAnnouncementReads} (${col('announcement_id')}, ${col('tenant')}, ${col('discord_id')}, ${col('read_at')})
        VALUES (${row.announcementId}, ${row.tenant}, ${row.discordId}, ${row.readAt})
        ON CONFLICT (${col('announcement_id')}, ${col('discord_id')}) DO NOTHING`,
  );
}

/** Ids of this guild's announcements the member has already read. */
export async function listReadAnnouncementIds(
  d1: D1Database,
  tenant: string,
  discordId: string,
): Promise<number[]> {
  const db = createDb(d1);
  const rows = await db.all<{ announcement_id: number }>(
    sql`SELECT ${guildAnnouncementReads.announcementId} FROM ${guildAnnouncementReads}
        WHERE ${guildAnnouncementReads.tenant} = ${tenant} AND ${guildAnnouncementReads.discordId} = ${discordId}`,
  );
  return (rows || []).map((r) => Number(r.announcement_id));
}

/** Read receipts of one announcement (admin receipt surface), oldest
 * read first. */
export async function listAnnouncementReads(
  d1: D1Database,
  tenant: string,
  announcementId: number,
): Promise<AnnouncementReadRow[]> {
  const db = createDb(d1);
  const rows = await db.all<AnnouncementReadRow>(
    sql`SELECT ${guildAnnouncementReads.discordId}, ${guildAnnouncementReads.readAt} FROM ${guildAnnouncementReads}
        WHERE ${guildAnnouncementReads.tenant} = ${tenant} AND ${guildAnnouncementReads.announcementId} = ${announcementId}
        ORDER BY ${guildAnnouncementReads.readAt} ASC`,
  );
  return rows || [];
}
