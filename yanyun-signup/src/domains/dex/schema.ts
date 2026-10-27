// Drizzle entity definitions for the dex domain.
// Modeled on the production schema as it exists today (see the barrel
// at src/db/schema.ts for the attestation legend). Structural change
// goes through the wrangler migration chain in migrations/ — never
// through runtime DDL; the CI drift gate keeps this model and the
// chain in lockstep.
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


/* ---------------- bosses [ddl chain baseline] ---------------------- */
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

/* ---------------- dungeons [ddl chain baseline] -------------------- */
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
  // dungeon-watch data pipeline; read by getCurrentVersionCode /
  // dex surfaces. Production carries it NOT NULL DEFAULT '' (the
  // 2026-10-27 shape audit corrected the model, which had it
  // nullable from its lazy-DDL days).
  version: text('version').notNull().default(''),
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
  // One row per (school, build), composite key. Production's build
  // default is 'default' (the value the data pipeline writes for the
  // unnamed build) — the v8 file's '' default never matched the live
  // table; the baseline migration carries the production shape.
  build: text('build').notNull().default('default'),
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

/* ---------------- schools / slot_affix [production shape attested
   2026-10-27: read-only reference data seeded by the gear data
   pipelines. The schools primary key is name — slug arrived later as
   a plain column, and an updated_at column trails the modelled set;
   both corrections come from the shape audit.] ---------------------- */
export const schools = sqliteTable('schools', {
  name: text('name').primaryKey(),
  short: text('short'),
  family: text('family'),
  color: text('color'),
  attr: text('attr'),
  talentDesc: text('talent_desc'),
  updatedAt: integer('updated_at').default(sql`(strftime('%s','now'))`),
  slug: text('slug'),
});

export const slotAffix = sqliteTable('slot_affix', {
  build: text('build').notNull().default('big'),
  slot: text('slot').notNull(),
  affixKey: text('affix_key').notNull(),
}, (t) => [
  primaryKey({ columns: [t.slot, t.affixKey, t.build] }),
]);
