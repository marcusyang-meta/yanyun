/* Guild governance repositories (premium governance line, P16):
 * officer capability grants + the officer private board. Every read
 * and write is scoped by tenant — a post id alone never crosses a
 * guild boundary, and a grant row exists only for the guild that
 * issued it. The capability vocabulary and the verdict that combines
 * grants with the Discord-admin verdict live in
 * platform/graphql-base.ts (getOfficerVerdict); this file owns the
 * statements only. Validation, verdicts and all copy live in the
 * callers (governance-graphql.ts / admin-graphql.ts). */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { guildOfficerGrants, guildOfficerPosts } from './schema.ts';

const col = (name: string) => sql.identifier(name);

/** Private-board post body cap in characters, enforced by the write mutation. */
export const OFFICER_POST_MAX_BODY = 1000;
/** Board page size: the board ships its newest posts first, capped
 * at the platform's announcement-list caliber. */
export const OFFICER_POST_LIST_LIMIT = 50;

/* ---------------- capability grants ---------------- */

export interface OfficerGrantRow {
  tenant: string;
  discord_id: string;
  capabilities: string;
  granted_by: string;
  granted_by_name: string;
  created_at: number;
  updated_at: number;
}

const GRANT_COLS = sql`${guildOfficerGrants.tenant}, ${guildOfficerGrants.discordId}, ${guildOfficerGrants.capabilities}, ${guildOfficerGrants.grantedBy}, ${guildOfficerGrants.grantedByName}, ${guildOfficerGrants.createdAt}, ${guildOfficerGrants.updatedAt}`;

/** Parse a stored capability list: unknown keys are dropped at the
 * repository boundary, so a stale row can never mint a capability
 * the current code does not know. */
export function parseCapabilities(stored: string, vocabulary: readonly string[]): string[] {
  const known = new Set(vocabulary);
  return String(stored || '')
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k && known.has(k));
}

/** One member's grant in one guild; null when ungranted THERE. */
export async function getOfficerGrant(
  d1: D1Database,
  tenant: string,
  discordId: string,
): Promise<OfficerGrantRow | null> {
  const db = createDb(d1);
  const row = await db.get<OfficerGrantRow>(
    sql`SELECT ${GRANT_COLS} FROM ${guildOfficerGrants}
        WHERE ${guildOfficerGrants.tenant} = ${tenant} AND ${guildOfficerGrants.discordId} = ${discordId}`,
  );
  return row ?? null;
}

/** Every grant of one guild, oldest grant first. */
export async function listOfficerGrants(
  d1: D1Database,
  tenant: string,
): Promise<OfficerGrantRow[]> {
  const db = createDb(d1);
  const rows = await db.all<OfficerGrantRow>(
    sql`SELECT ${GRANT_COLS} FROM ${guildOfficerGrants}
        WHERE ${guildOfficerGrants.tenant} = ${tenant}
        ORDER BY ${guildOfficerGrants.createdAt} ASC, ${guildOfficerGrants.discordId} ASC`,
  );
  return rows || [];
}

/** Create or replace one member's capability set in one guild. An
 * empty set deletes the row (absence IS the ungranted state), so a
 * revoke and a grant-to-nothing are the same statement. */
export async function upsertOfficerGrant(
  d1: D1Database,
  row: {
    tenant: string; discordId: string; capabilities: string[];
    grantedBy: string; grantedByName: string; at: number;
  },
): Promise<void> {
  const db = createDb(d1);
  const caps = [...new Set(row.capabilities)].join(',');
  if (!caps) {
    await deleteOfficerGrant(d1, row.tenant, row.discordId);
    return;
  }
  await db.run(
    sql`INSERT INTO ${guildOfficerGrants} (${col('tenant')}, ${col('discord_id')}, ${col('capabilities')}, ${col('granted_by')}, ${col('granted_by_name')}, ${col('created_at')}, ${col('updated_at')})
        VALUES (${row.tenant}, ${row.discordId}, ${caps}, ${row.grantedBy}, ${row.grantedByName}, ${row.at}, ${row.at})
        ON CONFLICT (${col('tenant')}, ${col('discord_id')}) DO UPDATE SET
          ${col('capabilities')} = excluded.capabilities,
          ${col('granted_by')} = excluded.granted_by,
          ${col('granted_by_name')} = excluded.granted_by_name,
          ${col('updated_at')} = excluded.updated_at`,
  );
}

/** Remove one member's grant in one guild; returns true when a row went away. */
export async function deleteOfficerGrant(
  d1: D1Database,
  tenant: string,
  discordId: string,
): Promise<boolean> {
  const db = createDb(d1);
  const r = await db.run(
    sql`DELETE FROM ${guildOfficerGrants}
        WHERE ${guildOfficerGrants.tenant} = ${tenant} AND ${guildOfficerGrants.discordId} = ${discordId}`,
  );
  const m = (r as { meta?: { changes?: number } } | null)?.meta;
  return (m?.changes ?? 0) >= 1;
}

/* ---------------- officer private board ---------------- */

export interface OfficerPostRow {
  id: number;
  tenant: string;
  body: string;
  author_discord_id: string;
  author_name: string;
  created_at: number;
  updated_at: number;
}

const POST_COLS = sql`${guildOfficerPosts.id}, ${guildOfficerPosts.tenant}, ${guildOfficerPosts.body}, ${guildOfficerPosts.authorDiscordId}, ${guildOfficerPosts.authorName}, ${guildOfficerPosts.createdAt}, ${guildOfficerPosts.updatedAt}`;

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

/** Insert one board post; returns the new row id. */
export async function insertOfficerPost(
  d1: D1Database,
  row: {
    tenant: string; body: string;
    authorDiscordId: string; authorName: string; createdAt: number;
  },
): Promise<number> {
  const db = createDb(d1);
  // INSERT column lists must use bare column names (SQLite syntax); see settings.ts note.
  const r = await db.run(
    sql`INSERT INTO ${guildOfficerPosts} (${col('tenant')}, ${col('body')}, ${col('author_discord_id')}, ${col('author_name')}, ${col('created_at')}, ${col('updated_at')})
        VALUES (${row.tenant}, ${row.body}, ${row.authorDiscordId}, ${row.authorName}, ${row.createdAt}, ${row.createdAt})`,
  );
  return metaOf(r).last_row_id;
}

/** One board post of one guild; null when it does not exist THERE. */
export async function getOfficerPost(
  d1: D1Database,
  tenant: string,
  id: number,
): Promise<OfficerPostRow | null> {
  const db = createDb(d1);
  const row = await db.get<OfficerPostRow>(
    sql`SELECT ${POST_COLS} FROM ${guildOfficerPosts}
        WHERE ${guildOfficerPosts.tenant} = ${tenant} AND ${guildOfficerPosts.id} = ${id}`,
  );
  return row ?? null;
}

/** The board of one guild, newest first, capped at the list limit. */
export async function listOfficerPosts(
  d1: D1Database,
  tenant: string,
  limit: number = OFFICER_POST_LIST_LIMIT,
): Promise<OfficerPostRow[]> {
  const db = createDb(d1);
  const rows = await db.all<OfficerPostRow>(
    sql`SELECT ${POST_COLS} FROM ${guildOfficerPosts}
        WHERE ${guildOfficerPosts.tenant} = ${tenant}
        ORDER BY ${guildOfficerPosts.id} DESC LIMIT ${limit}`,
  );
  return rows || [];
}

/** Delete one board post of one guild; returns true when a row went away. */
export async function deleteOfficerPost(
  d1: D1Database,
  tenant: string,
  id: number,
): Promise<boolean> {
  const db = createDb(d1);
  const r = await db.run(
    sql`DELETE FROM ${guildOfficerPosts}
        WHERE ${guildOfficerPosts.tenant} = ${tenant} AND ${guildOfficerPosts.id} = ${id}`,
  );
  return metaOf(r).changes >= 1;
}
