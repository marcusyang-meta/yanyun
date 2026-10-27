/* ===================================================
 * Data-layer access (Repository) for the user_gear_items /
 * user_gear_builds entities.
 *
 * Storage side of the gear library and saved builds: everything is
 * scoped by discord_id ownership (a miss means "does not exist" —
 * another user's row is indistinguishable from no row). This file
 * does row-level reads/writes only; payload JSON serialization and
 * row->domain mapping stay in gearstore.ts. Rows keep the legacy
 * snake_case keys; writes return the D1 meta.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { userGearItems, userGearBuilds } = schema;
const col = (name: string) => sql.identifier(name);

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

export interface GearItemRow {
  id: number;
  slot: string;
  name: string;
  payload: string;
}

export interface GearBuildRow {
  id: number;
  name: string;
  target_idx: number;
  payload: string;
  created_at: number;
}

/* ---------- Gear items ---------- */

export async function listGearItemRows(d1: D1Database, discordId: string): Promise<GearItemRow[]> {
  const db = createDb(d1);
  const rows = await db.all<GearItemRow>(sql`SELECT ${col('id')}, ${col('slot')}, ${col('name')}, ${col('payload')} FROM ${userGearItems} WHERE ${col('discord_id')} = ${discordId} ORDER BY ${col('id')} ASC`);
  return rows || [];
}

export async function countGearItemRows(d1: D1Database, discordId: string): Promise<number> {
  const db = createDb(d1);
  const row = await db.get<{ n: number }>(sql`SELECT COUNT(*) AS ${col('n')} FROM ${userGearItems} WHERE ${col('discord_id')} = ${discordId}`);
  return row ? Number(row.n) || 0 : 0;
}

export async function insertGearItemRow(
  d1: D1Database,
  row: { discordId: string; slot: string; name: string; payload: string; createdAt: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`INSERT INTO ${userGearItems} (${col('discord_id')}, ${col('slot')}, ${col('name')}, ${col('payload')}, ${col('created_at')}) VALUES (${row.discordId}, ${row.slot}, ${row.name}, ${row.payload}, ${row.createdAt})`);
  return metaOf(r);
}

export async function updateGearItemRow(
  d1: D1Database,
  discordId: string,
  id: number,
  row: { slot: string; name: string; payload: string },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`UPDATE ${userGearItems} SET ${col('slot')} = ${row.slot}, ${col('name')} = ${row.name}, ${col('payload')} = ${row.payload} WHERE ${col('id')} = ${id} AND ${col('discord_id')} = ${discordId}`);
  return metaOf(r);
}

export async function deleteGearItemRow(d1: D1Database, discordId: string, id: number): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${userGearItems} WHERE ${col('id')} = ${id} AND ${col('discord_id')} = ${discordId}`);
  return metaOf(r);
}

/* ---------- Saved builds ---------- */

export async function listGearBuildRows(d1: D1Database, discordId: string): Promise<GearBuildRow[]> {
  const db = createDb(d1);
  const rows = await db.all<GearBuildRow>(sql`SELECT ${col('id')}, ${col('name')}, ${col('target_idx')}, ${col('payload')}, ${col('created_at')} FROM ${userGearBuilds} WHERE ${col('discord_id')} = ${discordId} ORDER BY ${col('id')} ASC`);
  return rows || [];
}

export async function insertGearBuildRow(
  d1: D1Database,
  row: { discordId: string; name: string; targetIdx: number; payload: string; createdAt: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`INSERT INTO ${userGearBuilds} (${col('discord_id')}, ${col('name')}, ${col('target_idx')}, ${col('payload')}, ${col('created_at')}) VALUES (${row.discordId}, ${row.name}, ${row.targetIdx}, ${row.payload}, ${row.createdAt})`);
  return metaOf(r);
}

export async function deleteGearBuildRow(d1: D1Database, discordId: string, id: number): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${userGearBuilds} WHERE ${col('id')} = ${id} AND ${col('discord_id')} = ${discordId}`);
  return metaOf(r);
}
