/* ===================================================
 * user_gear_items / user_gear_builds 实体的数据层访问 (Repository)。
 *
 * 配装台装备库与保存方案的存储面: 一律按 discord_id 归属限定
 * (查不到即不存在, 不区分「他人的」与「没有」)。本文件只管行级
 * 读写; payload 的 JSON 序列化与行->领域对象映射留在 gearstore.ts。
 * 返回行沿用旧形态的 snake_case 键; 写操作返回 D1 的 meta。
 * 写法沿用一期 sql 模板惯用法 + sql.identifier 裸列名内插。
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

/* ---------- 装备单件 ---------- */

export async function listGearItemRows(d1: D1Database, discordId: string): Promise<GearItemRow[]> {
  const db = createDb(d1);
  const rows = await db.all<GearItemRow>(sql`SELECT ${col('id')}, ${col('slot')}, ${col('name')}, ${col('payload')} FROM ${userGearItems} WHERE ${col('discord_id')} = ${discordId} ORDER BY ${col('id')} ASC`);
  return rows || [];
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

/* ---------- 保存方案 ---------- */

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
