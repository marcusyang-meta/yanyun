/* users / user_oauth / user_guild_nicks repository. Business code must
 * not query these entities directly. Lazy-DDL promise caches are
 * singletons that clear themselves on failure for retry; error tolerance
 * (catch-and-swallow) stays with callers. Rows keep snake_case keys. */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { users, userOauth, userGuildNicks } = schema;
const col = (name: string) => sql.identifier(name);

export interface UserDirectoryRow {
  discord_id: string;
  username: string;
  guilds_json: string;
}

export interface OAuthGrantRow {
  refresh_token: string;
  scope: string;
  refresh_state: string;
}

export interface OAuthRefreshRow {
  refresh_token: string;
  refresh_state: string;
}

export interface NickRow {
  discord_id: string;
  guild_id: string;
  nick: string;
}

/* ---------- users reads / writes ---------- */

/** Persisted at login callback: server details incl. permission bits, used by viewer / createGuild checks. */
export async function upsertUserOnLogin(
  d1: D1Database,
  row: { discordId: string; username: string; avatar: string; guildsJson: string; checkedAtSec: number },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${users} (${col('discord_id')}, ${col('username')}, ${col('avatar')}, ${col('guilds_json')}, ${col('guilds_checked_at')}, ${col('updated_at')})
        VALUES (${row.discordId}, ${row.username}, ${row.avatar}, ${row.guildsJson}, ${row.checkedAtSec}, strftime('%s','now'))
        ON CONFLICT (${col('discord_id')}) DO UPDATE SET
          ${col('username')} = excluded.username, ${col('avatar')} = excluded.avatar,
          ${col('guilds_json')} = excluded.guilds_json, ${col('guilds_checked_at')} = excluded.guilds_checked_at,
          ${col('updated_at')} = excluded.updated_at`,
  );
}

export async function getUserLocalePref(d1: D1Database, discordId: string): Promise<string | null> {
  const db = createDb(d1);
  const row = await db.get<{ locale_pref: string | null }>(
    sql`SELECT ${col('locale_pref')} FROM ${users} WHERE ${col('discord_id')} = ${discordId}`,
  );
  return row?.locale_pref ?? null;
}

export async function setUserLocalePref(d1: D1Database, discordId: string, pref: string | null): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${users} SET ${col('locale_pref')} = ${pref} WHERE ${col('discord_id')} = ${discordId}`,
  );
}

export async function getUserGuildsJson(d1: D1Database, discordId: string): Promise<string | null> {
  const db = createDb(d1);
  const row = await db.get<{ guilds_json: string }>(
    sql`SELECT ${col('guilds_json')} FROM ${users} WHERE ${col('discord_id')} = ${discordId}`,
  );
  return row ? String(row.guilds_json ?? '') : null;
}

/** Global-name read, shared by identity-name sets, seat-name fallback and display-name tiers. */
export async function getUsernameRow(d1: D1Database, discordId: string): Promise<{ username: string } | null> {
  const db = createDb(d1);
  const row = await db.get<{ username: string }>(
    sql`SELECT ${col('username')} FROM ${users} WHERE ${col('discord_id')} = ${discordId}`,
  );
  return row ?? null;
}

/** Full user directory: candidate source for hub backfills and the reminder member pool. */
export async function listUsersDirectory(d1: D1Database): Promise<UserDirectoryRow[]> {
  const db = createDb(d1);
  const rows = await db.all<UserDirectoryRow>(
    sql`SELECT ${col('discord_id')}, ${col('username')}, ${col('guilds_json')} FROM ${users}`,
  );
  return rows || [];
}

/* ---------- user_oauth reads / writes ---------- */

export async function getOAuthGrant(d1: D1Database, discordId: string): Promise<OAuthGrantRow | null> {
  const db = createDb(d1);
  const row = await db.get<OAuthGrantRow>(
    sql`SELECT ${col('refresh_token')}, ${col('scope')}, ${col('refresh_state')} FROM ${userOauth} WHERE ${col('discord_id')} = ${discordId}`,
  );
  return row ?? null;
}

export async function getOAuthRefresh(d1: D1Database, discordId: string): Promise<OAuthRefreshRow | null> {
  const db = createDb(d1);
  const row = await db.get<OAuthRefreshRow>(
    sql`SELECT ${col('refresh_token')}, ${col('refresh_state')} FROM ${userOauth} WHERE ${col('discord_id')} = ${discordId}`,
  );
  return row ?? null;
}

/** Store the refresh token at login (credential lives only in D1); also sets refresh_state='ok'. */
export async function upsertOAuthOnLogin(
  d1: D1Database,
  row: { discordId: string; refreshToken: string; scope: string; nowSec: number },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${userOauth} (${col('discord_id')}, ${col('refresh_token')}, ${col('scope')}, ${col('refresh_state')}, ${col('last_refresh_at')}, ${col('updated_at')})
        VALUES (${row.discordId}, ${row.refreshToken}, ${row.scope}, 'ok', ${row.nowSec}, ${row.nowSec})
        ON CONFLICT (${col('discord_id')}) DO UPDATE SET
          ${col('refresh_token')} = excluded.refresh_token, ${col('scope')} = excluded.scope,
          ${col('refresh_state')} = 'ok', ${col('last_refresh_at')} = excluded.last_refresh_at,
          ${col('updated_at')} = excluded.updated_at`,
  );
}

/** On refresh success: overwrite with the rotated refresh token and reset state to ok. */
export async function updateOAuthAfterRefresh(
  d1: D1Database,
  discordId: string,
  row: { refreshToken: string; scope: string; nowSec: number },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${userOauth} SET ${col('refresh_token')} = ${row.refreshToken}, ${col('scope')} = ${row.scope},
          ${col('refresh_state')} = 'ok', ${col('last_refresh_at')} = ${row.nowSec}, ${col('updated_at')} = ${row.nowSec}
        WHERE ${col('discord_id')} = ${discordId}`,
  );
}

/** Set only on permanent failure (invalid_grant) — it invalidates the session. */
export async function markOAuthNeedsRelogin(d1: D1Database, discordId: string, nowSec: number): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${userOauth} SET ${col('refresh_state')} = 'needs_relogin', ${col('updated_at')} = ${nowSec}
        WHERE ${col('discord_id')} = ${discordId}`,
  );
}

/* ---------- user_guild_nicks reads / writes ---------- */

export async function upsertNick(
  d1: D1Database, discordId: string, guildId: string, nick: string, nowSec: number,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${userGuildNicks} (${col('discord_id')}, ${col('guild_id')}, ${col('nick')}, ${col('updated_at')})
        VALUES (${discordId}, ${guildId}, ${nick}, ${nowSec})
        ON CONFLICT (${col('discord_id')}, ${col('guild_id')}) DO UPDATE SET
          ${col('nick')} = excluded.nick, ${col('updated_at')} = excluded.updated_at`,
  );
}

/** On fetch failure, only bump the timestamp (inserting an empty snapshot if no row); never overwrite an existing nick. */
export async function touchNick(
  d1: D1Database, discordId: string, guildId: string, nowSec: number,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${userGuildNicks} (${col('discord_id')}, ${col('guild_id')}, ${col('nick')}, ${col('updated_at')})
        VALUES (${discordId}, ${guildId}, '', ${nowSec})
        ON CONFLICT (${col('discord_id')}, ${col('guild_id')}) DO UPDATE SET
          ${col('updated_at')} = excluded.updated_at`,
  );
}

/** Returns { nick } when a row exists (nick may be ''), otherwise null. */
export async function getNickRow(
  d1: D1Database, discordId: string, guildId: string,
): Promise<{ nick: string } | null> {
  const db = createDb(d1);
  const row = await db.get<{ nick: string }>(
    sql`SELECT ${col('nick')} FROM ${userGuildNicks}
        WHERE ${col('discord_id')} = ${discordId} AND ${col('guild_id')} = ${guildId}`,
  );
  return row ?? null;
}

export async function listNickRowsByUser(
  d1: D1Database, discordId: string,
): Promise<Array<{ guild_id: string; updated_at: number }>> {
  const db = createDb(d1);
  const rows = await db.all<{ guild_id: string; updated_at: number }>(
    sql`SELECT ${col('guild_id')}, ${col('updated_at')} FROM ${userGuildNicks} WHERE ${col('discord_id')} = ${discordId}`,
  );
  return rows || [];
}

export async function listNicksByGuild(
  d1: D1Database, guildId: string,
): Promise<Array<{ discord_id: string; nick: string }>> {
  const db = createDb(d1);
  const rows = await db.all<{ discord_id: string; nick: string }>(
    sql`SELECT ${col('discord_id')}, ${col('nick')} FROM ${userGuildNicks} WHERE ${col('guild_id')} = ${guildId}`,
  );
  return rows || [];
}

export async function listAllNicks(d1: D1Database): Promise<NickRow[]> {
  const db = createDb(d1);
  const rows = await db.all<NickRow>(
    sql`SELECT ${col('discord_id')}, ${col('guild_id')}, ${col('nick')} FROM ${userGuildNicks}`,
  );
  return rows || [];
}
