/* users / user_oauth / user_guild_nicks repository. Business code must
 * not query these entities directly. Lazy-DDL promise caches are
 * singletons that clear themselves on failure for retry; error tolerance
 * (catch-and-swallow) stays with callers. Rows keep snake_case keys. */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';
import { mintPublicId } from '../platform/id-mint.ts';

const { users, userOauth, userGuildNicks } = schema;
const col = (name: string) => sql.identifier(name);

/* ---------- the single ID conversion point ----------
 * Internal code carries the numeric user ID (users.id, type code
 * 02); a Discord ID exists only at the identity boundary. These two
 * resolvers over the users row are the ONLY sanctioned conversion
 * between the two — no business code keeps its own mapping. */
export async function getUserIdByDiscordId(d1: D1Database, discordId: string): Promise<number | null> {
  const db = createDb(d1);
  const row = await db.get<{ id: number }>(
    sql`SELECT ${col('id')} FROM ${users} WHERE ${col('discord_id')} = ${discordId}`,
  );
  return row ? Number(row.id) : null;
}

export async function listUserIdsByDiscordIds(
  d1: D1Database, discordIds: string[],
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (!discordIds.length) return out;
  const db = createDb(d1);
  const idList = sql.join(discordIds.map((d) => sql`${d}`), sql`, `);
  const rows = await db.all<{ id: number; discord_id: string }>(
    sql`SELECT ${col('id')}, ${col('discord_id')} FROM ${users} WHERE ${col('discord_id')} IN (${idList})`,
  );
  for (const r of rows || []) out.set(String(r.discord_id), Number(r.id));
  return out;
}

export async function listDiscordIdsByUserIds(
  d1: D1Database, userIds: number[],
): Promise<Map<number, string>> {
  const out = new Map<number, string>();
  if (!userIds.length) return out;
  const db = createDb(d1);
  const idList = sql.join(userIds.map((u) => sql`${u}`), sql`, `);
  const rows = await db.all<{ id: number; discord_id: string }>(
    sql`SELECT ${col('id')}, ${col('discord_id')} FROM ${users} WHERE ${col('id')} IN (${idList})`,
  );
  for (const r of rows || []) out.set(Number(r.id), String(r.discord_id));
  return out;
}

/** Resolve a Discord ID to the internal user ID, first-registering
 * a blank account row when the person has none yet. Class-B write
 * paths that take a Discord-keyed target (a note subject, a mentor)
 * go through here so every internal reference resolves; the row is
 * completed by the person's first real login. Mirrors the 0033
 * migration's orphan-minting semantics. */
export async function ensureUserIdByDiscordId(d1: D1Database, discordId: string): Promise<number> {
  const existing = await getUserIdByDiscordId(d1, discordId);
  if (existing != null) return existing;
  const db = createDb(d1);
  const id = await mintPublicId(d1, 'user');
  await db.run(sql`
    INSERT INTO ${users} (id, discord_id, username, avatar, guilds_json, created_at)
    VALUES (${id}, ${discordId}, '', '', '[]', ${Math.floor(Date.now() / 1000)})
    ON CONFLICT(discord_id) DO NOTHING
  `);
  const after = await getUserIdByDiscordId(d1, discordId);
  if (after == null) throw new Error('ensureUserIdByDiscordId: registration failed');
  return after;
}

export async function getDiscordIdByUserId(d1: D1Database, userId: number): Promise<string | null> {
  const db = createDb(d1);
  const row = await db.get<{ discord_id: string }>(
    sql`SELECT ${col('discord_id')} FROM ${users} WHERE ${col('id')} = ${userId}`,
  );
  return row ? String(row.discord_id) : null;
}

export interface UserDirectoryRow {
  id: number;
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

/** Persisted at login callback: server details incl. permission bits, used by viewer / createGuild checks.
 * First login mints the numeric user ID (type code 02); returns it either way. */
export async function upsertUserOnLogin(
  d1: D1Database,
  row: { discordId: string; username: string; avatar: string; guildsJson: string; checkedAtSec: number },
): Promise<number> {
  const db = createDb(d1);
  const existing = await getUserIdByDiscordId(d1, row.discordId);
  if (existing != null) {
    await db.run(
      sql`UPDATE ${users} SET ${col('username')} = ${row.username}, ${col('avatar')} = ${row.avatar},
            ${col('guilds_json')} = ${row.guildsJson}, ${col('guilds_checked_at')} = ${row.checkedAtSec},
            ${col('updated_at')} = strftime('%s','now')
          WHERE ${col('discord_id')} = ${row.discordId}`,
    );
    return existing;
  }
  const id = await mintPublicId(d1, 'user');
  try {
    await db.run(
      sql`INSERT INTO ${users} (${col('id')}, ${col('discord_id')}, ${col('username')}, ${col('avatar')}, ${col('guilds_json')}, ${col('guilds_checked_at')}, ${col('updated_at')})
          VALUES (${id}, ${row.discordId}, ${row.username}, ${row.avatar}, ${row.guildsJson}, ${row.checkedAtSec}, strftime('%s','now'))`,
    );
    return id;
  } catch {
    // A concurrent first login for the same Discord account won the
    // insert; fall back to its row (the minted sequence stays burned).
    const winner = await getUserIdByDiscordId(d1, row.discordId);
    if (winner == null) throw new Error('upsertUserOnLogin: insert failed and no row exists');
    return winner;
  }
}

export async function getUserLocalePref(d1: D1Database, userId: number): Promise<string | null> {
  const db = createDb(d1);
  const row = await db.get<{ locale_pref: string | null }>(
    sql`SELECT ${col('locale_pref')} FROM ${users} WHERE ${col('id')} = ${userId}`,
  );
  return row?.locale_pref ?? null;
}

export async function setUserLocalePref(d1: D1Database, userId: number, pref: string | null): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${users} SET ${col('locale_pref')} = ${pref} WHERE ${col('id')} = ${userId}`,
  );
}

export async function getUserGuildsJson(d1: D1Database, userId: number): Promise<string | null> {
  const db = createDb(d1);
  const row = await db.get<{ guilds_json: string }>(
    sql`SELECT ${col('guilds_json')} FROM ${users} WHERE ${col('id')} = ${userId}`,
  );
  return row ? String(row.guilds_json ?? '') : null;
}

/** Global-name read by Discord ID (identity-boundary callers holding a class-A Discord ID). */
export async function getUsernameRow(d1: D1Database, discordId: string): Promise<{ username: string } | null> {
  const db = createDb(d1);
  const row = await db.get<{ username: string }>(
    sql`SELECT ${col('username')} FROM ${users} WHERE ${col('discord_id')} = ${discordId}`,
  );
  return row ?? null;
}

/** Global-name read by numeric user ID (internal callers). */
export async function getUsernameRowById(d1: D1Database, userId: number): Promise<{ username: string } | null> {
  const db = createDb(d1);
  const row = await db.get<{ username: string }>(
    sql`SELECT ${col('username')} FROM ${users} WHERE ${col('id')} = ${userId}`,
  );
  return row ?? null;
}

/** Full user directory: candidate source for hub backfills and the reminder member pool. */
export async function listUsersDirectory(d1: D1Database): Promise<UserDirectoryRow[]> {
  const db = createDb(d1);
  const rows = await db.all<UserDirectoryRow>(
    sql`SELECT ${col('id')}, ${col('discord_id')}, ${col('username')}, ${col('guilds_json')} FROM ${users}`,
  );
  return rows || [];
}

/* ---------- user_oauth reads / writes ---------- */

export async function getOAuthGrant(d1: D1Database, userId: number): Promise<OAuthGrantRow | null> {
  const db = createDb(d1);
  const row = await db.get<OAuthGrantRow>(
    sql`SELECT ${col('refresh_token')}, ${col('scope')}, ${col('refresh_state')} FROM ${userOauth} WHERE ${col('user_id')} = ${userId}`,
  );
  return row ?? null;
}

export async function getOAuthRefresh(d1: D1Database, userId: number): Promise<OAuthRefreshRow | null> {
  const db = createDb(d1);
  const row = await db.get<OAuthRefreshRow>(
    sql`SELECT ${col('refresh_token')}, ${col('refresh_state')} FROM ${userOauth} WHERE ${col('user_id')} = ${userId}`,
  );
  return row ?? null;
}

/** Store the refresh token at login (credential lives only in D1); also sets refresh_state='ok'. */
export async function upsertOAuthOnLogin(
  d1: D1Database,
  row: { userId: number; refreshToken: string; scope: string; nowSec: number },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${userOauth} (${col('user_id')}, ${col('refresh_token')}, ${col('scope')}, ${col('refresh_state')}, ${col('last_refresh_at')}, ${col('updated_at')})
        VALUES (${row.userId}, ${row.refreshToken}, ${row.scope}, 'ok', ${row.nowSec}, ${row.nowSec})
        ON CONFLICT (${col('user_id')}) DO UPDATE SET
          ${col('refresh_token')} = excluded.refresh_token, ${col('scope')} = excluded.scope,
          ${col('refresh_state')} = 'ok', ${col('last_refresh_at')} = excluded.last_refresh_at,
          ${col('updated_at')} = excluded.updated_at`,
  );
}

/** On refresh success: overwrite with the rotated refresh token and reset state to ok. */
export async function updateOAuthAfterRefresh(
  d1: D1Database,
  userId: number,
  row: { refreshToken: string; scope: string; nowSec: number },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${userOauth} SET ${col('refresh_token')} = ${row.refreshToken}, ${col('scope')} = ${row.scope},
          ${col('refresh_state')} = 'ok', ${col('last_refresh_at')} = ${row.nowSec}, ${col('updated_at')} = ${row.nowSec}
        WHERE ${col('user_id')} = ${userId}`,
  );
}

/** Set only on permanent failure (invalid_grant) — it invalidates the session. */
export async function markOAuthNeedsRelogin(d1: D1Database, userId: number, nowSec: number): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${userOauth} SET ${col('refresh_state')} = 'needs_relogin', ${col('updated_at')} = ${nowSec}
        WHERE ${col('user_id')} = ${userId}`,
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

/* ---------- account self-service state (export / deletion) ---------- */

export interface AccountRow {
  id: number;
  discord_id: string;
  username: string;
  avatar: string;
  guilds_json: string;
  locale_pref: string | null;
  created_at: string;
  fresh_auth_at: number | null;
  deletion_requested_at: number | null;
}

/** Full account row for the export builder and the deletion state machine. */
export async function getAccountRow(d1: D1Database, userId: number): Promise<AccountRow | null> {
  const db = createDb(d1);
  const row = await db.get<AccountRow>(
    sql`SELECT ${col('id')}, ${col('discord_id')}, ${col('username')}, ${col('avatar')}, ${col('guilds_json')}, ${col('locale_pref')}, ${col('created_at')}, ${col('fresh_auth_at')}, ${col('deletion_requested_at')}
        FROM ${users} WHERE ${col('id')} = ${userId}`,
  );
  return row ?? null;
}

/** OAuth metadata for the export package — never the credential itself. */
export async function getOAuthExportMeta(
  d1: D1Database, userId: number,
): Promise<{ scope: string; refresh_state: string; last_refresh_at: number } | null> {
  const db = createDb(d1);
  const row = await db.get<{ scope: string; refresh_state: string; last_refresh_at: number }>(
    sql`SELECT ${col('scope')}, ${col('refresh_state')}, ${col('last_refresh_at')} FROM ${userOauth} WHERE ${col('user_id')} = ${userId}`,
  );
  return row ?? null;
}

/** A completed Discord OAuth round trip just happened for this account. */
export async function setFreshAuthAt(d1: D1Database, userId: number, nowSec: number): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${users} SET ${col('fresh_auth_at')} = ${nowSec} WHERE ${col('id')} = ${userId}`,
  );
}

export async function setDeletionRequestedAt(d1: D1Database, userId: number, nowSec: number): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${users} SET ${col('deletion_requested_at')} = ${nowSec} WHERE ${col('id')} = ${userId}`,
  );
}

export async function clearDeletionRequestedAt(d1: D1Database, userId: number): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${users} SET ${col('deletion_requested_at')} = NULL WHERE ${col('id')} = ${userId}`,
  );
}

/** Accounts whose cooling-off period has expired by cutoffSec (numeric user IDs). */
export async function listDueDeletionUserIds(d1: D1Database, cutoffSec: number): Promise<number[]> {
  const db = createDb(d1);
  const rows = await db.all<{ id: number }>(
    sql`SELECT ${col('id')} FROM ${users}
        WHERE ${col('deletion_requested_at')} IS NOT NULL AND ${col('deletion_requested_at')} <= ${cutoffSec}`,
  );
  return (rows || []).map((r) => Number(r.id));
}


interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

/* ---------- account deletion cascade (identity-owned rows) ---------- */

export async function deleteUserRow(d1: D1Database, userId: number): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${users} WHERE ${col('id')} = ${userId}`);
  return metaOf(r).changes;
}

export async function deleteOAuthRow(d1: D1Database, userId: number): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${userOauth} WHERE ${col('user_id')} = ${userId}`);
  return metaOf(r).changes;
}

export async function deleteNicksByUser(d1: D1Database, discordId: string): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${userGuildNicks} WHERE ${col('discord_id')} = ${discordId}`);
  return metaOf(r).changes;
}

/** All of a user's nick snapshots with values (export package). */
export async function listNickEntriesByUser(
  d1: D1Database, discordId: string,
): Promise<Array<{ guild_id: string; nick: string; updated_at: number }>> {
  const db = createDb(d1);
  const rows = await db.all<{ guild_id: string; nick: string; updated_at: number }>(
    sql`SELECT ${col('guild_id')}, ${col('nick')}, ${col('updated_at')} FROM ${userGuildNicks} WHERE ${col('discord_id')} = ${discordId}`,
  );
  return rows || [];
}
