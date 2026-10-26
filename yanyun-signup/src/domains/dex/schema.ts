// Drizzle entity definitions for the dex domain.
// Modeled on the production schema as it exists today (see the barrel
// at src/db/schema.ts for the attestation legend); structural change
// still goes through Worker-side lazy DDL, never drizzle-kit.
import { sql } from 'drizzle-orm';
import {
  blob,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core';


/* ---------------- bosses [ddl schema.sql; alt v4 dungeon, v5 guide,
   lazy structured json columns] ---------------- */
export const bosses = sqliteTable('bosses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  talent: text('talent').notNull().default(''),
  source: text('source').notNull().default(''),
  note: text('note').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  dungeon: text('dungeon').notNull().default(''),
  guide: text('guide').notNull().default(''),
  mechanicsJson: text('mechanics_json'),
  talentsJson: text('talents_json'),
  shoutsJson: text('shouts_json'),
});

/* ---------------- dungeons [ddl v4; alt v6 video, lazy dex columns] --- */
export const dungeons = sqliteTable('dungeons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  size: integer('size').notNull().default(10),
  isCurrent: integer('is_current').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  videoUrl: text('video_url').notNull().default(''),
  videoTitle: text('video_title').notNull().default(''),
  season: text('season'),
  category: text('category'),
  level: integer('level'),
  // Version code (e.g. intl-v2.3); values are written by the
  // dungeon-watch data pipeline, the column itself is converged lazily
  // by ensureDungeonDexColumns (dungeons.ts); read by
  // getCurrentVersionCode / dex surfaces.
  version: text('version'),
});

/* ---------------- affix_max [ddl schema.sql] -------------------------- */
export const affixMax = sqliteTable('affix_max', {
  affixKey: text('affix_key').primaryKey(),
  nameCn: text('name_cn').notNull(),
  maxValue: real('max_value').notNull(),
  unit: text('unit').default(''),
});

/* ---------------- school reference data [ddl v8] ---------------------- */
export const schoolBis = sqliteTable('school_bis', {
  school: text('school').notNull(),
  // One row per (school, build). The v8 DDL originally keyed the table
  // by school alone and was later aligned to this shape;
  // ensureSchoolBisShape (reference.ts) lazily rebuilds databases
  // still carrying the original school-only key.
  build: text('build').notNull().default(''),
  attr: text('attr'),
  rate: text('rate'),
  bisJson: text('bis_json').notNull(),
  updatedAt: integer('updated_at').default(sql`(strftime('%s','now'))`),
}, (t) => [
  primaryKey({ columns: [t.school, t.build] }),
]);

export const schoolRotations = sqliteTable('school_rotations', {
  school: text('school').primaryKey(),
  rotationJson: text('rotation_json').notNull(),
  updatedAt: integer('updated_at').default(sql`(strftime('%s','now'))`),
});

/* ---------------- schools / slot_affix [qry only: read-only reference
   data seeded by the gear data pipelines; no DDL survives in the repo] -- */
export const schools = sqliteTable('schools', {
  name: text('name'),
  slug: text('slug').primaryKey(),
  short: text('short'),
  family: text('family'),
  color: text('color'),
  attr: text('attr'),
  talentDesc: text('talent_desc'),
});

export const slotAffix = sqliteTable('slot_affix', {
  build: text('build').notNull(),
  slot: text('slot').notNull(),
  affixKey: text('affix_key').notNull(),
}, (t) => [
  primaryKey({ columns: [t.build, t.slot, t.affixKey] }),
]);
