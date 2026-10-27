/* ===================================================
 * Data-layer access (Repository) for the dungeons entity.
 *
 * All dungeons statements live here (previously scattered across
 * graphql.js and worker.js).
 * Rows keep snake_case keys, so call sites are unaffected.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { dungeons } = schema;
const col = (name: string) => sql.identifier(name);

export interface DungeonRow {
  id: number;
  name: string;
  size: number;
  is_current: number;
  sort_order: number;
  video_url: string;
  video_title: string;
  season: string | null;
  category: string | null;
  level: number | null;
  version: string | null;
}

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

/* ---------- Reads ---------- */

export async function getDungeonByName(d1: D1Database, name: string): Promise<DungeonRow | null> {
  const db = createDb(d1);
  const row = await db.get<DungeonRow>(sql`SELECT * FROM ${dungeons} WHERE ${col('name')} = ${name}`);
  return row ?? null;
}

export async function getDungeonById(d1: D1Database, id: number): Promise<DungeonRow | null> {
  const db = createDb(d1);
  const row = await db.get<DungeonRow>(sql`SELECT * FROM ${dungeons} WHERE ${col('id')} = ${id}`);
  return row ?? null;
}

export async function getDungeonNameSizeById(
  d1: D1Database, id: number,
): Promise<{ name: string; size: number } | null> {
  const db = createDb(d1);
  const row = await db.get<{ name: string; size: number }>(
    sql`SELECT ${col('name')}, ${col('size')} FROM ${dungeons} WHERE ${col('id')} = ${id}`,
  );
  return row ?? null;
}

const PUBLIC_COLUMNS = sql`${col('id')}, ${col('name')}, ${col('size')}, ${col('is_current')}, ${col('version')}, ${col('video_url')}, ${col('video_title')}`;
const PUBLIC_ORDER = sql`${col('size')} DESC, ${col('sort_order')} DESC, ${col('id')} ASC`;

/** Public/hub list (lightweight column set). */
export async function listDungeonsPublic(d1: D1Database): Promise<Array<Record<string, unknown>>> {
  const db = createDb(d1);
  const rows = await db.all<Record<string, unknown>>(
    sql`SELECT ${PUBLIC_COLUMNS} FROM ${dungeons} ORDER BY ${PUBLIC_ORDER}`,
  );
  return rows || [];
}

/** Dex page list (full rows). */
export async function listDungeonsDex(d1: D1Database): Promise<DungeonRow[]> {
  const db = createDb(d1);
  const rows = await db.all<DungeonRow>(sql`SELECT * FROM ${dungeons} ORDER BY ${PUBLIC_ORDER}`);
  return rows || [];
}

/** Current game version: the newest dungeon row carrying a real version. */
export async function getLatestDungeonVersion(d1: D1Database): Promise<string | null> {
  const db = createDb(d1);
  const row = await db.get<{ version: string }>(
    sql`SELECT ${col('version')} FROM ${dungeons} WHERE ${col('version')} IS NOT NULL AND ${col('version')} != '' AND ${col('version')} != 'legacy' GROUP BY ${col('version')} ORDER BY MAX(${col('id')}) DESC LIMIT 1`,
  );
  return row?.version ?? null;
}

export async function countDungeons(d1: D1Database): Promise<number> {
  const db = createDb(d1);
  const row = await db.get<{ n: number }>(sql`SELECT COUNT(*) AS ${col('n')} FROM ${dungeons}`);
  return row?.n ?? 0;
}

/* ---------- Writes ---------- */

const DUNGEON_COLUMNS = new Set([
  'name', 'size', 'is_current', 'sort_order', 'video_url', 'video_title',
  'season', 'category', 'level', 'version',
]);

export async function insertDungeonDex(
  d1: D1Database,
  row: { name: string; size: number; season: string; category: string; level: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${dungeons} (${col('name')}, ${col('size')}, ${col('is_current')}, ${col('version')}, ${col('video_url')}, ${col('video_title')}, ${col('sort_order')}, ${col('season')}, ${col('category')}, ${col('level')}) VALUES (${row.name}, ${row.size}, 0, 'legacy', '', '', 0, ${row.season}, ${row.category}, ${row.level})`,
  );
  return metaOf(r);
}

export async function updateDungeonFields(
  d1: D1Database, id: number, patch: Record<string, unknown>,
): Promise<RunMeta> {
  const db = createDb(d1);
  const cols = Object.keys(patch);
  for (const c of cols) {
    if (!DUNGEON_COLUMNS.has(c)) throw new Error(`dungeons repository: unknown column ${c}`);
  }
  if (!cols.length) throw new Error('dungeons repository: empty patch');
  const sets = sql.join(cols.map((c) => sql`${col(c)} = ${patch[c]}`), sql`,`);
  const r = await db.run(sql`UPDATE ${dungeons} SET ${sets} WHERE ${col('id')} = ${id}`);
  return metaOf(r);
}

export async function deleteDungeonById(d1: D1Database, id: number): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${dungeons} WHERE ${col('id')} = ${id}`);
  return metaOf(r);
}
