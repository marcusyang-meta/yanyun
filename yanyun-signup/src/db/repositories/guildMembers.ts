/* ===================================================
 * guild_members 实体的数据层访问 (Repository)。
 *
 * 三期迁入: 百业成员名册 (区别于按 Discord 服务器维度的
 * users/user_guild_nicks — 两个百业可绑同一服务器, 名册各不相同)。
 * 此前实现散在 reminder.ts (建表 + upsert + 名册池/车头名读取) 与
 * heirloompush.js / graphql.js / worker.js 的直查。
 *
 * 懒 DDL 与 upsert 的容错口径与旧 reminder.ts 一致 (建表失败静默、
 * 单例 promise 缓存); reminder.ts 的 ensureGuildMembersTable /
 * upsertGuildMember 保留旧名导出作委托 (creatorbackfill /
 * creatormanualfix 仍从 reminder.ts 引)。
 * 返回行沿用 snake_case 键, 调用点零感知。
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../client.ts';

const { guildMembers } = schema;
const col = (name: string) => sql.identifier(name);

export interface GuildMemberRow {
  discord_id: string;
  nick: string;
  global_name: string;
}

/* ---------- 懒 DDL ---------- */

let guildMembersReady: Promise<void> | null = null;
export function ensureGuildMembersTable(d1: D1Database): Promise<void> {
  if (!guildMembersReady) {
    guildMembersReady = (async () => {
      try {
        const db = createDb(d1);
        await db.run(sql`CREATE TABLE IF NOT EXISTS ${guildMembers} (
          ${col('tenant')} TEXT NOT NULL,
          ${col('discord_id')} TEXT NOT NULL,
          ${col('nick')} TEXT NOT NULL DEFAULT '',
          ${col('global_name')} TEXT NOT NULL DEFAULT '',
          ${col('updated_at')} INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (${col('tenant')}, ${col('discord_id')})
        )`);
      } catch { /* 表已存在等情况静默 */ }
    })();
  }
  return guildMembersReady;
}

/* ---------- 读写 ---------- */

export async function upsertGuildMember(
  d1: D1Database, tenant: string, discordId: string, nick: string, globalName: string,
): Promise<void> {
  await ensureGuildMembersTable(d1);
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
