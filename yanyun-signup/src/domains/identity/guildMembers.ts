/* guild_members repository: per-guild roster — distinct from the
 * per-Discord-server users/user_guild_nicks (two guilds may bind the same
 * server with different rosters). Rows keep snake_case keys. */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { guildMembers } = schema;
const col = (name: string) => sql.identifier(name);

export interface GuildMemberRow {
  discord_id: string;
  nick: string;
  global_name: string;
}

/* ---------- Reads / writes ---------- */

export async function upsertGuildMember(
  d1: D1Database, tenant: string, discordId: string, nick: string, globalName: string,
): Promise<void> {
  const db = createDb(d1);
  const now = Math.floor(Date.now() / 1000);
  await db.run(
    sql`INSERT INTO ${guildMembers} (${col('tenant')}, ${col('discord_id')}, ${col('nick')}, ${col('global_name')}, ${col('updated_at')})
        VALUES (${tenant}, ${discordId}, ${nick}, ${globalName}, ${now})
        ON CONFLICT (${col('tenant')}, ${col('discord_id')}) DO UPDATE SET
          ${col('nick')} = excluded.nick, ${col('global_name')} = excluded.global_name,
          ${col('updated_at')} = excluded.updated_at`,
  );
}

export async function listGuildMembers(d1: D1Database, tenant: string): Promise<GuildMemberRow[]> {
  const db = createDb(d1);
  const rows = await db.all<GuildMemberRow>(
    sql`SELECT ${col('discord_id')}, ${col('nick')}, ${col('global_name')} FROM ${guildMembers} WHERE ${col('tenant')} = ${tenant}`,
  );
  return rows || [];
}

export async function getGuildMember(
  d1: D1Database, tenant: string, discordId: string,
): Promise<{ nick: string; global_name: string } | null> {
  const db = createDb(d1);
  const row = await db.get<{ nick: string; global_name: string }>(
    sql`SELECT ${col('nick')}, ${col('global_name')} FROM ${guildMembers} WHERE ${col('tenant')} = ${tenant} AND ${col('discord_id')} = ${discordId}`,
  );
  return row ?? null;
}

export async function hasGuildMember(
  d1: D1Database, tenant: string, discordId: string,
): Promise<boolean> {
  const db = createDb(d1);
  const row = await db.get<{ discord_id: string }>(
    sql`SELECT ${col('discord_id')} FROM ${guildMembers} WHERE ${col('tenant')} = ${tenant} AND ${col('discord_id')} = ${discordId}`,
  );
  return !!row;
}
