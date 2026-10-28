/* ===================================================
 * Data-layer access (Repository) for the user_gear_items /
 * user_gear_builds / build_share_links entities.
 *
 * Storage side of the gear library and saved builds: everything is
 * scoped by user_id ownership (a miss means "does not exist" —
 * another user's row is indistinguishable from no row). This file
 * does row-level reads/writes only; payload JSON serialization and
 * row->domain mapping stay in gearstore.ts. Rows keep the legacy
 * snake_case keys; writes return the D1 meta.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';
import { mintPublicId } from '../platform/id-mint.ts';

const { userGearItems, userGearBuilds, buildShareLinks } = schema;
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

export async function listGearItemRows(d1: D1Database, userId: number): Promise<GearItemRow[]> {
  const db = createDb(d1);
  const rows = await db.all<GearItemRow>(sql`SELECT ${col('id')}, ${col('slot')}, ${col('name')}, ${col('payload')} FROM ${userGearItems} WHERE ${col('user_id')} = ${userId} ORDER BY ${col('id')} ASC`);
  return rows || [];
}

export async function countGearItemRows(d1: D1Database, userId: number): Promise<number> {
  const db = createDb(d1);
  const row = await db.get<{ n: number }>(sql`SELECT COUNT(*) AS ${col('n')} FROM ${userGearItems} WHERE ${col('user_id')} = ${userId}`);
  return row ? Number(row.n) || 0 : 0;
}

export async function insertGearItemRow(
  d1: D1Database,
  row: { userId: number; slot: string; name: string; payload: string; createdAt: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`INSERT INTO ${userGearItems} (${col('id')}, ${col('user_id')}, ${col('slot')}, ${col('name')}, ${col('payload')}, ${col('created_at')}) VALUES (${await mintPublicId(d1, 'gearItem')}, ${row.userId}, ${row.slot}, ${row.name}, ${row.payload}, ${row.createdAt})`);
  return metaOf(r);
}

export async function updateGearItemRow(
  d1: D1Database,
  userId: number,
  id: number,
  row: { slot: string; name: string; payload: string },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`UPDATE ${userGearItems} SET ${col('slot')} = ${row.slot}, ${col('name')} = ${row.name}, ${col('payload')} = ${row.payload} WHERE ${col('id')} = ${id} AND ${col('user_id')} = ${userId}`);
  return metaOf(r);
}

export async function deleteGearItemRow(d1: D1Database, userId: number, id: number): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${userGearItems} WHERE ${col('id')} = ${id} AND ${col('user_id')} = ${userId}`);
  return metaOf(r);
}

/* ---------- Saved builds ---------- */

export async function listGearBuildRows(d1: D1Database, userId: number): Promise<GearBuildRow[]> {
  const db = createDb(d1);
  const rows = await db.all<GearBuildRow>(sql`SELECT ${col('id')}, ${col('name')}, ${col('target_idx')}, ${col('payload')}, ${col('created_at')} FROM ${userGearBuilds} WHERE ${col('user_id')} = ${userId} ORDER BY ${col('id')} ASC`);
  return rows || [];
}

export async function insertGearBuildRow(
  d1: D1Database,
  row: { userId: number; name: string; targetIdx: number; payload: string; createdAt: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`INSERT INTO ${userGearBuilds} (${col('id')}, ${col('user_id')}, ${col('name')}, ${col('target_idx')}, ${col('payload')}, ${col('created_at')}) VALUES (${await mintPublicId(d1, 'gearBuild')}, ${row.userId}, ${row.name}, ${row.targetIdx}, ${row.payload}, ${row.createdAt})`);
  return metaOf(r);
}

export async function deleteGearBuildRow(d1: D1Database, userId: number, id: number): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${userGearBuilds} WHERE ${col('id')} = ${id} AND ${col('user_id')} = ${userId}`);
  return metaOf(r);
}

/* ---------- account deletion cascade (owner-scoped bulk delete) ---------- */

export async function deleteAllGearItemsByUser(d1: D1Database, userId: number): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${userGearItems} WHERE ${col('user_id')} = ${userId}`);
  return metaOf(r).changes;
}

export async function deleteAllBuildShareLinksByUser(d1: D1Database, userId: number): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${buildShareLinks} WHERE ${col('user_id')} = ${userId}`);
  return metaOf(r).changes;
}

export async function deleteAllGearBuildsByUser(d1: D1Database, userId: number): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${userGearBuilds} WHERE ${col('user_id')} = ${userId}`);
  return metaOf(r).changes;
}

export async function getGearBuildRow(d1: D1Database, userId: number, id: number): Promise<GearBuildRow | null> {
  const db = createDb(d1);
  const row = await db.get<GearBuildRow>(sql`SELECT ${col('id')}, ${col('name')}, ${col('target_idx')}, ${col('payload')}, ${col('created_at')} FROM ${userGearBuilds} WHERE ${col('id')} = ${id} AND ${col('user_id')} = ${userId}`);
  return row ?? null;
}

/* ---------- Build share links ----------
 * One active public alias per build; the code is the capability.
 * Every row operation is scoped by the owning discord_id except the
 * resolve-by-code read, which is the public entry point (the code
 * itself is the credential, mirroring short_links). */

export interface BuildShareLinkRow {
  code: string;
  build_id: number;
  user_id: number;
  created_at: number;
}

export async function getBuildShareLinkRowByCode(d1: D1Database, code: string): Promise<BuildShareLinkRow | null> {
  const db = createDb(d1);
  const row = await db.get<BuildShareLinkRow>(sql`SELECT ${col('code')}, ${col('build_id')}, ${col('user_id')}, ${col('created_at')} FROM ${buildShareLinks} WHERE ${col('code')} = ${code}`);
  return row ?? null;
}

export async function getBuildShareLinkRowByBuild(d1: D1Database, userId: number, buildId: number): Promise<BuildShareLinkRow | null> {
  const db = createDb(d1);
  const row = await db.get<BuildShareLinkRow>(sql`SELECT ${col('code')}, ${col('build_id')}, ${col('user_id')}, ${col('created_at')} FROM ${buildShareLinks} WHERE ${col('build_id')} = ${buildId} AND ${col('user_id')} = ${userId}`);
  return row ?? null;
}

export async function insertBuildShareLinkRow(
  d1: D1Database,
  row: { code: string; buildId: number; userId: number; createdAt: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`INSERT INTO ${buildShareLinks} (${col('code')}, ${col('build_id')}, ${col('user_id')}, ${col('created_at')}) VALUES (${row.code}, ${row.buildId}, ${row.userId}, ${row.createdAt})`);
  return metaOf(r);
}

export async function deleteBuildShareLinkRow(d1: D1Database, userId: number, buildId: number): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${buildShareLinks} WHERE ${col('build_id')} = ${buildId} AND ${col('user_id')} = ${userId}`);
  return metaOf(r);
}
