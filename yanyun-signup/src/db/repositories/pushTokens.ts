// Push-token repository: row operations for the push_tokens entity.
// Error tolerance stays with the caller (push.js), mirroring the legacy
// behavior of each function it backs. Table DDL remains the lazy
// ensurePushTokensTable in push.js this phase.
import { sql } from 'drizzle-orm';
import { createDb } from '../client.ts';
import { pushTokens } from '../schema.ts';

interface TokenRow { discord_id: string; token: string }

export async function upsertPushToken(
  d1: D1Database,
  discordId: string,
  token: string,
  platform: string,
  updatedAt: number,
): Promise<void> {
  const db = createDb(d1);
  // 列名单 / ON CONFLICT 目标 / SET 左值须用裸列名 (SQLite 语法), 见 settings.ts 注。
  await db.run(
    sql`INSERT INTO ${pushTokens} (${sql.identifier('discord_id')}, ${sql.identifier('token')}, ${sql.identifier('platform')}, ${sql.identifier('updated_at')})
        VALUES (${discordId}, ${token}, ${platform}, ${updatedAt})
        ON CONFLICT (${sql.identifier('discord_id')}, ${sql.identifier('token')})
        DO UPDATE SET ${sql.identifier('platform')} = excluded.platform,
          ${sql.identifier('updated_at')} = excluded.updated_at`,
  );
}

export async function deletePushTokenForUser(
  d1: D1Database,
  discordId: string,
  token: string,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`DELETE FROM ${pushTokens}
        WHERE ${pushTokens.discordId} = ${discordId} AND ${pushTokens.token} = ${token}`,
  );
}

/** Receipts name tokens, not users: delete the token wherever it appears. */
export async function deletePushTokenEverywhere(
  d1: D1Database,
  token: string,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`DELETE FROM ${pushTokens} WHERE ${pushTokens.token} = ${token}`,
  );
}

export async function listPushTokensForUsers(
  d1: D1Database,
  discordIds: string[],
): Promise<TokenRow[]> {
  const db = createDb(d1);
  const idList = sql.join(discordIds.map((id) => sql`${id}`), sql`, `);
  const rows = await db.all<TokenRow>(
    sql`SELECT ${pushTokens.discordId}, ${pushTokens.token} FROM ${pushTokens}
        WHERE ${pushTokens.discordId} IN (${idList})`,
  );
  return rows || [];
}
