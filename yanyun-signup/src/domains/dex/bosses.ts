/* ===================================================
 * Data-layer access (Repository) for the bosses entity.
 *
 * All bosses statements live here (previously scattered across
 * graphql.js and worker.js). Rows keep snake_case keys, so call
 * sites are unaffected.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { bosses } = schema;
const col = (name: string) => sql.identifier(name);

export interface BossRow {
  id: number;
  name: string;
  talent: string;
  source: string;
  note: string;
  sort_order: number;
  dungeon: string;
  guide: string;
  mechanics_json: string | null;
  talents_json: string | null;
  shouts_json: string | null;
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

export async function getBossById(d1: D1Database, id: number): Promise<BossRow | null> {
  const db = createDb(d1);
  const row = await db.get<BossRow>(sql`SELECT * FROM ${bosses} WHERE ${col('id')} = ${id}`);
  return row ?? null;
}

export async function listAllBosses(d1: D1Database): Promise<BossRow[]> {
  const db = createDb(d1);
  const rows = await db.all<BossRow>(
    sql`SELECT * FROM ${bosses} ORDER BY ${col('sort_order')} ASC, ${col('id')} ASC`,
  );
  return rows || [];
}

/** Public list (lightweight, no guide body; has_guide is an expression column). */
export async function listBossesLight(d1: D1Database): Promise<Array<Record<string, unknown>>> {
  const db = createDb(d1);
  const rows = await db.all<Record<string, unknown>>(
    sql`SELECT ${col('id')}, ${col('name')}, ${col('talent')}, ${col('source')}, ${col('note')}, ${col('sort_order')}, ${col('dungeon')}, (${col('guide')} IS NOT NULL AND ${col('guide')} != '') AS ${col('has_guide')} FROM ${bosses} ORDER BY ${col('sort_order')} ASC, ${col('id')} ASC`,
  );
  return rows || [];
}

export async function listBossesByDungeon(
  d1: D1Database, dungeon: string,
): Promise<Array<{ id: number; name: string }>> {
  const db = createDb(d1);
  const rows = await db.all<{ id: number; name: string }>(
    sql`SELECT ${col('id')}, ${col('name')} FROM ${bosses} WHERE ${col('dungeon')} = ${dungeon} ORDER BY ${col('sort_order')} ASC, ${col('id')} ASC`,
  );
  return rows || [];
}

export async function listBossesFullByDungeon(d1: D1Database, dungeon: string): Promise<BossRow[]> {
  const db = createDb(d1);
  const rows = await db.all<BossRow>(sql`SELECT * FROM ${bosses} WHERE ${col('dungeon')} = ${dungeon}`);
  return rows || [];
}

export async function listBossesWithGuide(
  d1: D1Database,
): Promise<Array<{ id: number; name: string; guide: string }>> {
  const db = createDb(d1);
  const rows = await db.all<{ id: number; name: string; guide: string }>(
    sql`SELECT ${col('id')}, ${col('name')}, ${col('guide')} FROM ${bosses} WHERE ${col('guide')} IS NOT NULL AND ${col('guide')} != '' ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

export async function getBossIdByNameAndDungeon(
  d1: D1Database, name: string, dungeon: string,
): Promise<{ id: number } | null> {
  const db = createDb(d1);
  const row = await db.get<{ id: number }>(
    sql`SELECT ${col('id')} FROM ${bosses} WHERE ${col('name')} = ${name} AND ${col('dungeon')} = ${dungeon}`,
  );
  return row ?? null;
}

export async function getOrphanBossIdByName(
  d1: D1Database, name: string,
): Promise<{ id: number } | null> {
  const db = createDb(d1);
  const row = await db.get<{ id: number }>(
    sql`SELECT ${col('id')} FROM ${bosses} WHERE ${col('name')} = ${name} AND (${col('dungeon')} IS NULL OR ${col('dungeon')} = '') ORDER BY ${col('id')} ASC`,
  );
  return row ?? null;
}

export async function listOrphanBossesByName(d1: D1Database, name: string): Promise<BossRow[]> {
  const db = createDb(d1);
  const rows = await db.all<BossRow>(
    sql`SELECT * FROM ${bosses} WHERE ${col('name')} = ${name} AND (${col('dungeon')} IS NULL OR ${col('dungeon')} = '')`,
  );
  return rows || [];
}

export async function countBosses(d1: D1Database): Promise<number> {
  const db = createDb(d1);
  const row = await db.get<{ n: number }>(sql`SELECT COUNT(*) AS ${col('n')} FROM ${bosses}`);
  return row?.n ?? 0;
}

/* ---------- Writes ---------- */

const BOSS_COLUMNS = new Set([
  'name', 'talent', 'source', 'note', 'sort_order', 'dungeon', 'guide',
  'mechanics_json', 'talents_json', 'shouts_json',
]);

function checkedColumns(row: Record<string, unknown>): string[] {
  const cols = Object.keys(row);
  for (const c of cols) {
    if (!BOSS_COLUMNS.has(c)) throw new Error(`bosses repository: unknown column ${c}`);
  }
  if (!cols.length) throw new Error('bosses repository: empty row');
  return cols;
}

export async function insertBoss(
  d1: D1Database,
  row: { name: string; talent: string; source: string; note: string; sortOrder: number; dungeon?: string },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = row.dungeon === undefined
    ? await db.run(
      sql`INSERT INTO ${bosses} (${col('name')}, ${col('talent')}, ${col('source')}, ${col('note')}, ${col('sort_order')}) VALUES (${row.name}, ${row.talent}, ${row.source}, ${row.note}, ${row.sortOrder})`,
    )
    : await db.run(
      sql`INSERT INTO ${bosses} (${col('name')}, ${col('dungeon')}, ${col('talent')}, ${col('source')}, ${col('note')}, ${col('sort_order')}) VALUES (${row.name}, ${row.dungeon}, ${row.talent}, ${row.source}, ${row.note}, ${row.sortOrder})`,
    );
  return metaOf(r);
}

export async function updateBossFields(
  d1: D1Database, id: number, patch: Record<string, unknown>,
): Promise<RunMeta> {
  const db = createDb(d1);
  const cols = checkedColumns(patch);
  const sets = sql.join(cols.map((c) => sql`${col(c)} = ${patch[c]}`), sql`,`);
  const r = await db.run(sql`UPDATE ${bosses} SET ${sets} WHERE ${col('id')} = ${id}`);
  return metaOf(r);
}

/** Bosses link to dungeons by name, so a dungeon rename rewrites the whole table. */
export async function renameBossesDungeon(
  d1: D1Database, oldName: string, newName: string,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${bosses} SET ${col('dungeon')} = ${newName} WHERE ${col('dungeon')} = ${oldName}`,
  );
  return metaOf(r);
}

export async function deleteBossById(d1: D1Database, id: number): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${bosses} WHERE ${col('id')} = ${id}`);
  return metaOf(r);
}
