/* ===================================================
 * bosses 实体的数据层访问 (Repository)。
 *
 * 三期迁入: 此前散在 graphql.js (shell 点查、bossPage、结构化列懒
 * DDL) 与 worker.js (pub 列表/详情、hub CRUD、结构化物化、赛季图
 * 一次性迁移) 的全部 bosses 语句。结构化列 (mechanics_json 等) 的
 * 懒 DDL 归本仓库, graphql.js 的 ensureBossStructuredColumns 保留
 * 旧名导出作委托。
 * 返回行沿用 snake_case 键, 调用点零感知。
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

/* ---------- 懒 DDL: 结构化攻略列 ---------- */

let bossColsReady: Promise<void> | null = null;
export function ensureBossStructuredColumns(d1: D1Database): Promise<void> {
  if (!bossColsReady) {
    bossColsReady = (async () => {
      try {
        const db = createDb(d1);
        const results = await db.all<{ name: string }>(sql`PRAGMA table_info(${bosses})`);
        const cols = new Set((results || []).map((r) => r.name));
        for (const c of ['mechanics_json', 'talents_json', 'shouts_json']) {
          if (!cols.has(c)) await db.run(sql`ALTER TABLE ${bosses} ADD COLUMN ${col(c)} TEXT`);
        }
      } catch { /* 列已存在等情况静默: 读取侧有 guide 解析兜底 */ }
    })();
  }
  return bossColsReady;
}

/* ---------- 读取 ---------- */

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

/** 公开列表 (轻量, 不含攻略正文; has_guide 为表达式列)。 */
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

/* ---------- 写入 ---------- */

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

/** 副本改名时 boss 归属按副本名关联, 整表迁移。 */
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
