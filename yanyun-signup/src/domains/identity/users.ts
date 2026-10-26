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

/* ---------- Lazy DDL: users ---------- */

let usersSchemaReady: Promise<void> | null = null;
export function ensureUsersTable(d1: D1Database): Promise<void> {
  if (!usersSchemaReady) {
    usersSchemaReady = (async () => {
      const db = createDb(d1);
      await db.run(sql`CREATE TABLE IF NOT EXISTS ${users} (
        ${col('discord_id')} TEXT PRIMARY KEY,
        ${col('username')} TEXT NOT NULL DEFAULT '',
        ${col('avatar')} TEXT NOT NULL DEFAULT '',
        ${col('guilds_json')} TEXT NOT NULL DEFAULT '[]',
        ${col('guilds_checked_at')} INTEGER NOT NULL DEFAULT 0,
        ${col('created_at')} TEXT NOT NULL DEFAULT (strftime('%s','now')),
        ${col('updated_at')} TEXT NOT NULL DEFAULT (strftime('%s','now'))
      )`);
    })().catch((e) => { usersSchemaReady = null; throw e; });
  }
  return usersSchemaReady;
}

let usersLocaleColReady: Promise<void> | null = null;
export function ensureUsersLocaleColumn(d1: D1Database): Promise<void> {
  if (!usersLocaleColReady) {
    usersLocaleColReady = (async () => {
      await ensureUsersTable(d1);
      try {
        const db = createDb(d1);
        await db.run(sql`ALTER TABLE ${users} ADD COLUMN ${col('locale_pref')} TEXT`);
      } catch (e) {
        // Drizzle wraps D1 errors in DrizzleQueryError; the original
        // message is deep in the cause chain — unwrap layer by layer to match.
        let msg = '';
        let cur: unknown = e;
        while (cur && typeof cur === 'object') {
          const m = (cur as { message?: unknown }).message;
          if (typeof m === 'string') msg += ' ' + m;
          cur = (cur as { cause?: unknown }).cause;
        }
        if (!/duplicate column/i.test(msg)) throw e;
      }
    })().catch((e) => { usersLocaleColReady = null; throw e; });
  }
  return usersLocaleColReady;
}

/* ---------- Lazy DDL: user_oauth + user_guild_nicks ---------- */

let nickStoreReady: Promise<void> | null = null;
export function ensureNickStoreTables(d1: D1Database): Promise<void> {
  if (!nickStoreReady) {
    nickStoreReady = (async () => {
      const db = createDb(d1);
      await db.run(sql`CREATE TABLE IF NOT EXISTS ${userOauth} (
        ${col('discord_id')} TEXT PRIMARY KEY,
        ${col('refresh_token')} TEXT NOT NULL DEFAULT '',
        ${col('scope')} TEXT NOT NULL DEFAULT '',
        ${col('refresh_state')} TEXT NOT NULL DEFAULT 'ok',
        ${col('last_refresh_at')} INTEGER NOT NULL DEFAULT 0,
        ${col('updated_at')} INTEGER NOT NULL DEFAULT 0
      )`);
      await db.run(sql`CREATE TABLE IF NOT EXISTS ${userGuildNicks} (
        ${col('discord_id')} TEXT NOT NULL,
        ${col('guild_id')} TEXT NOT NULL,
        ${col('nick')} TEXT NOT NULL DEFAULT '',
        ${col('updated_at')} INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (${col('discord_id')}, ${col('guild_id')})
      )`);
    })().catch((e) => { nickStoreReady = null; throw e; });
  }
  return nickStoreReady;
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

export interface UserSessionRow {
  discord_id: string;
  username: string;
  avatar: string;
  guilds_json: string;
}

/** Session-mint read for the hub LoginAs tool: the stored identity row a
 * session snapshot is built from (same fields the OAuth callback writes).
 * Null when the discord id never logged in here. */
export async function getUserSessionRow(d1: D1Database, discordId: string): Promise<UserSessionRow | null> {
  await ensureUsersTable(d1);
  const db = createDb(d1);
  const row = await db.get<UserSessionRow>(
    sql`SELECT ${col('discord_id')}, ${col('username')}, ${col('avatar')}, ${col('guilds_json')} FROM ${users} WHERE ${col('discord_id')} = ${discordId}`,
  );
  return row ?? null;
}

export interface UserSearchHit {
  discord_id: string;
  username: string;
  avatar: string;
  /** Matched per-server nickname (search evidence); '' when the hit came
   * from the global name / discord id instead of a nick snapshot. */
  nick: string;
}

interface UserSearchBaseRow {
  discord_id: string;
  username: string;
  avatar: string;
}

/* Hub LoginAs user search: substring match over the global name and the
 * discord id, plus per-server nick snapshots (joined back to the user
 * row). An exact discord-id hit is promoted to the front. LIKE wildcards
 * in the query are escaped so a search stays a plain substring search. */
export async function searchUsersDirectory(
  d1: D1Database, query: string, limit: number,
): Promise<UserSearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  await ensureUsersTable(d1);
  await ensureNickStoreTables(d1);
  const lim = Math.min(Math.max(Math.floor(limit) || 20, 1), 50);
  const pat = '%' + q.replace(/[\\%_]/g, (ch) => '\\' + ch) + '%';
  const db = createDb(d1);
  const userRows = await db.all<UserSearchBaseRow>(
    sql`SELECT ${col('discord_id')}, ${col('username')}, ${col('avatar')} FROM ${users}
        WHERE ${col('username')} LIKE ${pat} ESCAPE '\\' OR ${col('discord_id')} LIKE ${pat} ESCAPE '\\'
        ORDER BY ${col('username')} ASC LIMIT ${lim}`,
  );
  const nickRows = await db.all<UserSearchHit>(
    sql`SELECT ${users.discordId}, ${users.username}, ${users.avatar}, ${userGuildNicks.nick} AS ${col('nick')}
        FROM ${userGuildNicks} INNER JOIN ${users} ON ${users.discordId} = ${userGuildNicks.discordId}
        WHERE ${userGuildNicks.nick} LIKE ${pat} ESCAPE '\\'
        ORDER BY ${userGuildNicks.nick} ASC LIMIT ${lim}`,
  );
  const seen = new Set<string>();
  const out: UserSearchHit[] = [];
  for (const r of userRows || []) {
    seen.add(String(r.discord_id));
    out.push({ discord_id: r.discord_id, username: r.username, avatar: r.avatar, nick: '' });
  }
  for (const r of nickRows || []) {
    if (seen.has(String(r.discord_id))) continue;
    seen.add(String(r.discord_id));
    out.push(r);
  }
  out.sort((a, b) => (String(a.discord_id) === q ? 0 : 1) - (String(b.discord_id) === q ? 0 : 1));
  return out.slice(0, lim);
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
