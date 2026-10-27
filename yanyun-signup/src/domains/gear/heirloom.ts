/* ===================================================
 * Data-layer access (Repository, gear domain) for heirloom push state.
 *
 * All reads/writes for the dedup table heirloom_item_pushes and
 * the set-completion table heirloom_set_state live here
 * (previously in heirloompush.js). Write-path tolerance (a single
 * failure stays silent) remains with the call sites.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { heirloomItemPushes, heirloomSetState } = schema;
const col = (name: string) => sql.identifier(name);

/* ---------- Dedup / set-completion state ---------- */

/** All already-announced item hashes under one loadout signature. */
export async function listPushedItemHashes(
  d1: D1Database, tenant: string, discordId: string, buildSig: string,
): Promise<string[]> {
  const db = createDb(d1);
  const rows = await db.all<{ item_hash: string }>(
    sql`SELECT ${col('item_hash')} FROM ${heirloomItemPushes} WHERE ${col('tenant')} = ${tenant} AND ${col('discord_id')} = ${discordId} AND ${col('build_sig')} = ${buildSig}`,
  );
  return (rows || []).map((r) => String(r.item_hash));
}

export async function insertHeirloomItemPush(
  d1: D1Database,
  row: { tenant: string; discordId: string; buildSig: string; itemHash: string; createdAt: number },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT OR IGNORE INTO ${heirloomItemPushes} (${col('tenant')}, ${col('discord_id')}, ${col('build_sig')}, ${col('item_hash')}, ${col('created_at')}) VALUES (${row.tenant}, ${row.discordId}, ${row.buildSig}, ${row.itemHash}, ${row.createdAt})`,
  );
}

export async function getHeirloomSetState(
  d1: D1Database, tenant: string, discordId: string, buildSig: string,
): Promise<{ complete: number } | null> {
  const db = createDb(d1);
  const row = await db.get<{ complete: number }>(
    sql`SELECT ${col('complete')} FROM ${heirloomSetState} WHERE ${col('tenant')} = ${tenant} AND ${col('discord_id')} = ${discordId} AND ${col('build_sig')} = ${buildSig}`,
  );
  return row ?? null;
}

export async function upsertHeirloomSetState(
  d1: D1Database,
  row: { tenant: string; discordId: string; buildSig: string; complete: number; updatedAt: number },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${heirloomSetState} (${col('tenant')}, ${col('discord_id')}, ${col('build_sig')}, ${col('complete')}, ${col('updated_at')}) VALUES (${row.tenant}, ${row.discordId}, ${row.buildSig}, ${row.complete}, ${row.updatedAt}) ON CONFLICT (${col('tenant')}, ${col('discord_id')}, ${col('build_sig')}) DO UPDATE SET ${col('complete')} = excluded.complete, ${col('updated_at')} = excluded.updated_at`,
  );
}
