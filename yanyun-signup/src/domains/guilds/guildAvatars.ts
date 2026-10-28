// Guild-avatar repository: the guild_avatars entity's row
// operations. Public shapes (camelCase, nullable-on-missing) are
// produced here; the error-to-null tolerance of the read paths stays
// in the guilds avatar service, mirroring the legacy
// .catch(() => null) call sites.
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { guildAvatars } from './schema.ts';

export interface GuildAvatarMeta {
  contentType: string;
  hash: string;
  updatedAt: number;
}

export interface GuildAvatar extends GuildAvatarMeta {
  bytes: unknown;
}

interface MetaRow { content_type: string; hash: string; updated_at: number }
interface FullRow extends MetaRow { bytes: unknown }

export async function getGuildAvatarMetaRow(
  d1: D1Database,
  tenant: number,
): Promise<GuildAvatarMeta | null> {
  const db = createDb(d1);
  const rows = await db.all<MetaRow>(
    sql`SELECT ${guildAvatars.contentType}, ${guildAvatars.hash}, ${guildAvatars.updatedAt}
        FROM ${guildAvatars} WHERE ${guildAvatars.tenant} = ${tenant}`,
  );
  const row = rows && rows[0];
  if (!row) return null;
  return { contentType: row.content_type, hash: row.hash, updatedAt: row.updated_at };
}

export async function getGuildAvatarRow(
  d1: D1Database,
  tenant: number,
): Promise<GuildAvatar | null> {
  const db = createDb(d1);
  const rows = await db.all<FullRow>(
    sql`SELECT ${guildAvatars.contentType}, ${guildAvatars.bytes}, ${guildAvatars.hash}, ${guildAvatars.updatedAt}
        FROM ${guildAvatars} WHERE ${guildAvatars.tenant} = ${tenant}`,
  );
  const row = rows && rows[0];
  if (!row) return null;
  return {
    contentType: row.content_type, bytes: row.bytes,
    hash: row.hash, updatedAt: row.updated_at,
  };
}

export async function putGuildAvatarRow(
  d1: D1Database,
  tenant: number,
  contentType: string,
  bytes: Uint8Array,
  hash: string,
  updatedAt: number,
): Promise<void> {
  const db = createDb(d1);
  // Column lists / ON CONFLICT targets / SET left-hand sides must be bare column names (SQLite syntax) — see the note in settings.ts.
  await db.run(
    sql`INSERT INTO ${guildAvatars} (${sql.identifier('tenant')}, ${sql.identifier('content_type')}, ${sql.identifier('bytes')}, ${sql.identifier('hash')}, ${sql.identifier('updated_at')})
        VALUES (${tenant}, ${contentType}, ${bytes}, ${hash}, ${updatedAt})
        ON CONFLICT (${sql.identifier('tenant')})
        DO UPDATE SET ${sql.identifier('content_type')} = excluded.content_type,
          ${sql.identifier('bytes')} = excluded.bytes, ${sql.identifier('hash')} = excluded.hash,
          ${sql.identifier('updated_at')} = excluded.updated_at`,
  );
}

export async function deleteGuildAvatarRow(
  d1: D1Database,
  tenant: number,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`DELETE FROM ${guildAvatars} WHERE ${guildAvatars.tenant} = ${tenant}`,
  );
}
