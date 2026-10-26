/* ===================================================
 * dex 参考数据的数据层访问 (Repository): schools (只读参考)、
 * school_bis / school_rotations (流派攻略)、slot_affix / affix_max
 * (词条参考)。三期迁入: 此前散在 graphql.js (流派页/调律页/图鉴
 * 查询/配装计算) 与 worker.js (公开流派接口、百业攻略读写)。
 * 读取侧多处调用点保留「表可能不存在 -> 空」的容错 (.catch),
 * 容错仍归调用点。返回行沿用 snake_case 键。
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { schools, schoolBis, schoolRotations, slotAffix, affixMax } = schema;
const col = (name: string) => sql.identifier(name);

export interface SchoolRow {
  name: string;
  slug: string;
  short: string | null;
  family: string | null;
  color: string | null;
  attr: string | null;
  talent_desc: string | null;
}

export interface SchoolBisRow {
  school: string;
  build: string;
  attr: string | null;
  rate: string | null;
  bis_json: string;
}

/* ---------- schools (只读参考数据) ---------- */

export async function listSchoolsFull(d1: D1Database): Promise<SchoolRow[]> {
  const db = createDb(d1);
  const rows = await db.all<SchoolRow>(
    sql`SELECT ${col('name')}, ${col('slug')}, ${col('short')}, ${col('family')}, ${col('color')}, ${col('attr')}, ${col('talent_desc')} FROM ${schools} ORDER BY ${col('name')} ASC`,
  );
  return rows || [];
}

export async function listSchoolsNameSlug(
  d1: D1Database,
): Promise<Array<{ name: string; slug: string }>> {
  const db = createDb(d1);
  const rows = await db.all<{ name: string; slug: string }>(
    sql`SELECT ${col('name')}, ${col('slug')} FROM ${schools} ORDER BY ${col('name')} ASC`,
  );
  return rows || [];
}

export async function getSchoolNameBySlug(
  d1: D1Database, slug: string,
): Promise<{ name: string } | null> {
  const db = createDb(d1);
  const row = await db.get<{ name: string }>(
    sql`SELECT ${col('name')} FROM ${schools} WHERE ${col('slug')} = ${slug} LIMIT 1`,
  );
  return row ?? null;
}

/* ---------- school_bis / school_rotations ---------- */

export async function listSchoolBis(d1: D1Database): Promise<SchoolBisRow[]> {
  const db = createDb(d1);
  const rows = await db.all<SchoolBisRow>(
    sql`SELECT ${col('school')}, ${col('build')}, ${col('attr')}, ${col('rate')}, ${col('bis_json')} FROM ${schoolBis}`,
  );
  return rows || [];
}

export async function listSchoolBisBySchool(
  d1: D1Database, school: string,
): Promise<Array<{ build: string; attr: string | null; rate: string | null; bis_json: string }>> {
  const db = createDb(d1);
  const rows = await db.all<{ build: string; attr: string | null; rate: string | null; bis_json: string }>(
    sql`SELECT ${col('build')}, ${col('attr')}, ${col('rate')}, ${col('bis_json')} FROM ${schoolBis} WHERE ${col('school')} = ${school}`,
  );
  return rows || [];
}

export async function getSchoolBisJsonBySchool(
  d1: D1Database, school: string,
): Promise<{ bis_json: string } | null> {
  const db = createDb(d1);
  const row = await db.get<{ bis_json: string }>(
    sql`SELECT ${col('bis_json')} FROM ${schoolBis} WHERE ${col('school')} = ${school} LIMIT 1`,
  );
  return row ?? null;
}

export async function listSchoolRotations(
  d1: D1Database,
): Promise<Array<{ school: string; rotation_json: string }>> {
  const db = createDb(d1);
  const rows = await db.all<{ school: string; rotation_json: string }>(
    sql`SELECT ${col('school')}, ${col('rotation_json')} FROM ${schoolRotations}`,
  );
  return rows || [];
}

export async function getSchoolRotationBySchool(
  d1: D1Database, school: string,
): Promise<{ rotation_json: string } | null> {
  const db = createDb(d1);
  const row = await db.get<{ rotation_json: string }>(
    sql`SELECT ${col('rotation_json')} FROM ${schoolRotations} WHERE ${col('school')} = ${school}`,
  );
  return row ?? null;
}

export async function upsertSchoolBis(
  d1: D1Database,
  row: { school: string; build: string; attr: string; rate: string; bisJson: string },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${schoolBis} (${col('school')}, ${col('build')}, ${col('attr')}, ${col('rate')}, ${col('bis_json')}, ${col('updated_at')}) VALUES (${row.school}, ${row.build}, ${row.attr}, ${row.rate}, ${row.bisJson}, strftime('%s','now')) ON CONFLICT (${col('school')}, ${col('build')}) DO UPDATE SET ${col('attr')} = excluded.attr, ${col('rate')} = excluded.rate, ${col('bis_json')} = excluded.bis_json, ${col('updated_at')} = excluded.updated_at`,
  );
}

export async function upsertSchoolRotation(
  d1: D1Database,
  row: { school: string; rotationJson: string },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${schoolRotations} (${col('school')}, ${col('rotation_json')}, ${col('updated_at')}) VALUES (${row.school}, ${row.rotationJson}, strftime('%s','now')) ON CONFLICT (${col('school')}) DO UPDATE SET ${col('rotation_json')} = excluded.rotation_json, ${col('updated_at')} = excluded.updated_at`,
  );
}

/* ---------- slot_affix / affix_max (只读参考) ---------- */

export async function listSlotAffixByBuild(
  d1: D1Database, build: string,
): Promise<Array<{ slot: string; affix_key: string }>> {
  const db = createDb(d1);
  const rows = await db.all<{ slot: string; affix_key: string }>(
    sql`SELECT ${col('slot')}, ${col('affix_key')} FROM ${slotAffix} WHERE ${col('build')} = ${build} ORDER BY ${col('slot')}`,
  );
  return rows || [];
}

export async function listAffixMax(
  d1: D1Database,
): Promise<Array<{ affix_key: string; name_cn: string; max_value: number; unit: string | null }>> {
  const db = createDb(d1);
  const rows = await db.all<{ affix_key: string; name_cn: string; max_value: number; unit: string | null }>(
    sql`SELECT ${col('affix_key')}, ${col('name_cn')}, ${col('max_value')}, ${col('unit')} FROM ${affixMax} ORDER BY ${col('affix_key')}`,
  );
  return rows || [];
}

export async function listAffixMaxValues(
  d1: D1Database,
): Promise<Array<{ affix_key: string; max_value: number }>> {
  const db = createDb(d1);
  const rows = await db.all<{ affix_key: string; max_value: number }>(
    sql`SELECT ${col('affix_key')}, ${col('max_value')} FROM ${affixMax}`,
  );
  return rows || [];
}
