/* ===================================================
 * Data-layer access (Repository) for dex reference data: schools
 * (read-only reference), school_bis / school_rotations (sect
 * guides), slot_affix / affix_max (affix reference). All statements
 * live here (previously scattered across graphql.js and worker.js).
 * Several read call sites keep their "table may not exist -> empty"
 * tolerance (.catch); that tolerance stays with the call sites.
 * Rows keep snake_case keys.
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

/* ---------- schools (read-only reference data) ---------- */

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

/* ---------- Lazy DDL: school_bis per-build shape ---------- */

// The original v8 DDL keyed school_bis by school alone; the per-build
// dimension (build column + composite key) reached production
// out-of-band, so a database bootstrapped from the file chain alone
// carries the old shape and every school_bis query fails on it — the
// admin schoolGuides field is non-null, so the failure takes the whole
// GuildAdmin payload down. Converge lazily, PRAGMA-gated like the other
// post-v8 shapes: the correct shape (production) costs one PRAGMA read
// and no writes; a stale shape is rebuilt in place, rows preserved
// (build defaults to '' for pre-dimension rows).
const SCHOOL_BIS_SHAPE = sql`(
  school TEXT NOT NULL,
  build TEXT NOT NULL DEFAULT '',
  attr TEXT,
  rate TEXT,
  bis_json TEXT NOT NULL,
  updated_at INTEGER DEFAULT (strftime('%s','now')),
  PRIMARY KEY (school, build)
)`;

let schoolBisShapeReady: Promise<void> | null = null;
export function ensureSchoolBisShape(d1: D1Database): Promise<void> {
  if (!schoolBisShapeReady) {
    schoolBisShapeReady = (async () => {
      try {
        const db = createDb(d1);
        const info = (await db.all<{ name: string; pk: number }>(
          sql`PRAGMA table_info(${schoolBis})`,
        )) || [];
        const pkOf = (n: string) => info.find((r) => r.name === n)?.pk ?? 0;
        if (info.length && pkOf('school') === 1 && pkOf('build') === 2) return;
        if (!info.length) {
          await db.run(sql`CREATE TABLE IF NOT EXISTS ${schoolBis} ${SCHOOL_BIS_SHAPE}`);
          return;
        }
        const staging = sql.identifier('school_bis__shapefix');
        const buildSel = info.some((r) => r.name === 'build') ? col('build') : sql`''`;
        await db.run(sql`DROP TABLE IF EXISTS ${staging}`);
        await db.run(sql`CREATE TABLE ${staging} ${SCHOOL_BIS_SHAPE}`);
        await db.run(sql`INSERT INTO ${staging} (${col('school')}, ${col('build')}, ${col('attr')}, ${col('rate')}, ${col('bis_json')}, ${col('updated_at')}) SELECT ${col('school')}, ${buildSel}, ${col('attr')}, ${col('rate')}, ${col('bis_json')}, ${col('updated_at')} FROM ${schoolBis}`);
        await db.run(sql`DROP TABLE ${schoolBis}`);
        await db.run(sql`ALTER TABLE ${staging} RENAME TO ${schoolBis}`);
      } catch { /* silent: call sites keep their existing fallbacks */ }
    })();
  }
  return schoolBisShapeReady;
}

/* ---------- school_bis / school_rotations ---------- */

export async function listSchoolBis(d1: D1Database): Promise<SchoolBisRow[]> {
  await ensureSchoolBisShape(d1);
  const db = createDb(d1);
  const rows = await db.all<SchoolBisRow>(
    sql`SELECT ${col('school')}, ${col('build')}, ${col('attr')}, ${col('rate')}, ${col('bis_json')} FROM ${schoolBis}`,
  );
  return rows || [];
}

export async function listSchoolBisBySchool(
  d1: D1Database, school: string,
): Promise<Array<{ build: string; attr: string | null; rate: string | null; bis_json: string }>> {
  await ensureSchoolBisShape(d1);
  const db = createDb(d1);
  const rows = await db.all<{ build: string; attr: string | null; rate: string | null; bis_json: string }>(
    sql`SELECT ${col('build')}, ${col('attr')}, ${col('rate')}, ${col('bis_json')} FROM ${schoolBis} WHERE ${col('school')} = ${school}`,
  );
  return rows || [];
}

export async function getSchoolBisJsonBySchool(
  d1: D1Database, school: string,
): Promise<{ bis_json: string } | null> {
  await ensureSchoolBisShape(d1);
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
  await ensureSchoolBisShape(d1);
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

/* ---------- slot_affix / affix_max (read-only reference) ---------- */

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
