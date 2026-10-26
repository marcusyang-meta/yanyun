/* ===================================================
 * 传家宝推送状态的数据层访问 (Repository, gear 域)。
 *
 * 三期迁入: 去重表 heirloom_item_pushes 与集齐状态表
 * heirloom_set_state 的懒 DDL 与全部读写此前在 heirloompush.js。
 * heirloompush.js 的 ensureHeirloomTables 保留旧名导出作委托。
 * 写路径的容错 (单条失败静默) 仍归调用点。
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { heirloomItemPushes, heirloomSetState } = schema;
const col = (name: string) => sql.identifier(name);

/* ---------- 懒 DDL ---------- */

let heirloomTablesReady: Promise<void> | null = null;
export function ensureHeirloomTables(d1: D1Database): Promise<void> {
  if (!heirloomTablesReady) {
    heirloomTablesReady = (async () => {
      try {
        const db = createDb(d1);
        await db.run(sql`CREATE TABLE IF NOT EXISTS ${heirloomItemPushes} (
          tenant TEXT NOT NULL,
          discord_id TEXT NOT NULL,
          build_sig TEXT NOT NULL,
          item_hash TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (tenant, discord_id, build_sig, item_hash)
        )`);
        await db.run(sql`CREATE TABLE IF NOT EXISTS ${heirloomSetState} (
          tenant TEXT NOT NULL,
          discord_id TEXT NOT NULL,
          build_sig TEXT NOT NULL,
          complete INTEGER NOT NULL DEFAULT 0,
          updated_at INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (tenant, discord_id, build_sig)
        )`);
      } catch { /* 表已存在等情况静默 */ }
    })();
  }
  return heirloomTablesReady;
}

/* ---------- 去重 / 集齐状态 ---------- */

/** 某搭配下已播报过的装备哈希全集。 */
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
