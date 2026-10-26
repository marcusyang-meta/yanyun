/* ===================================================
 * users / user_oauth / user_guild_nicks 实体的数据层访问 (Repository)。
 *
 * 三期迁入: 此前散在 auth.js 的全部语句与懒 DDL (users 建表、
 * locale_pref 加列、user_oauth / user_guild_nicks 建表), 以及
 * graphql.js / reminder.ts / heirloompush.js / worker.js 里对这三张
 * 表的直查。业务代码禁止再直查这三张表。
 *
 * 懒 DDL 的模块级 promise 缓存语义与旧 auth.js 完全一致 (单例、
 * 失败自清重试); DDL 本体归仓库所有, auth.js 的 ensureSchema /
 * ensureNickStore / ensureUsersLocaleColumn 只剩委托。
 * 返回行沿用 snake_case 键, 调用点零感知; 容错 (catch 吞异常) 留在
 * 调用方, 与旧口径一致。
 * =================================================== */
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

/* ---------- 懒 DDL: users ---------- */

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
        // drizzle 把 D1 错误包进 DrizzleQueryError, 原始消息在 cause 链
        // 深处 — 逐层解包再匹配 (二期 errorlog 同一教训)。
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

/* ---------- 懒 DDL: user_oauth + user_guild_nicks ---------- */

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

/* ---------- users 读写 ---------- */

/** 登录回调落库: 服务器明细含权限位, 供 viewer / createGuild 校验。 */
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

/** 全局名读取 (身份名集合 / 落座名回退 / 显示名梯队共用)。 */
export async function getUsernameRow(d1: D1Database, discordId: string): Promise<{ username: string } | null> {
  const db = createDb(d1);
  const row = await db.get<{ username: string }>(
    sql`SELECT ${col('username')} FROM ${users} WHERE ${col('discord_id')} = ${discordId}`,
  );
  return row ?? null;
}

/** 全量用户目录 (hub 回填端点与提醒成员池的候选来源)。 */
export async function listUsersDirectory(d1: D1Database): Promise<UserDirectoryRow[]> {
  const db = createDb(d1);
  const rows = await db.all<UserDirectoryRow>(
    sql`SELECT ${col('discord_id')}, ${col('username')}, ${col('guilds_json')} FROM ${users}`,
  );
  return rows || [];
}

/* ---------- user_oauth 读写 ---------- */

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

/** 登录回调落 refresh token (凭证只存 D1); 同时置 refresh_state='ok'。 */
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

/** 刷新成功: 轮换 refresh token 覆盖存回 + 状态复位 ok。 */
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

/** 只有永久失败 (invalid_grant) 才置此状态 — 会话随之失效。 */
export async function markOAuthNeedsRelogin(d1: D1Database, discordId: string, nowSec: number): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${userOauth} SET ${col('refresh_state')} = 'needs_relogin', ${col('updated_at')} = ${nowSec}
        WHERE ${col('discord_id')} = ${discordId}`,
  );
}

/* ---------- user_guild_nicks 读写 ---------- */

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

/** 拉取失败时只刷新时间戳 (无行则落一条空快照), 不覆盖已有昵称。 */
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

/** 有行返回 { nick } (可能 ''), 无行返回 null。 */
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
