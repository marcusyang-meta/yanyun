// Push-token repository: the push_tokens entity's lazy DDL and row
// operations. Error tolerance stays with the caller (the platform
// push service), mirroring the legacy behavior of each function it
// backs.
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { pushTokens } from './schema.ts';

interface TokenRow { discord_id: string; token: string }

export async function upsertPushToken(
  d1: D1Database,
  discordId: string,
  token: string,
  platform: string,
  updatedAt: number,
): Promise<void> {
  const db = createDb(d1);
  // Column lists / ON CONFLICT targets / SET LHS must use bare column names (SQLite syntax); see settings.ts note.
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

/** Export metadata only: platforms the user registered tokens on —
 * the token values themselves are device credentials, never exported. */
export async function listPushTokenPlatformsByUser(
  d1: D1Database,
  discordId: string,
): Promise<string[]> {
  const db = createDb(d1);
  const rows = await db.all<{ platform: string }>(
    sql`SELECT ${pushTokens.platform} FROM ${pushTokens} WHERE ${pushTokens.discordId} = ${discordId}`,
  );
  return (rows || []).map((r) => String(r.platform || ''));
}


interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

export async function deleteAllPushTokensByUser(
  d1: D1Database,
  discordId: string,
): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(
    sql`DELETE FROM ${pushTokens} WHERE ${pushTokens.discordId} = ${discordId}`,
  );
  return metaOf(r).changes;
}
