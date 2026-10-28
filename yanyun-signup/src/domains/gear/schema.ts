// Drizzle entity definitions for the gear domain.
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


/* ---------------- gear library [ddl chain baseline] ----------------- */
export const userGearItems = sqliteTable('user_gear_items', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull(),
  slot: text('slot').notNull().default(''),
  name: text('name').notNull().default(''),
  payload: text('payload').notNull().default('{}'),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  index('idx_user_gear_items_owner').on(t.userId),
]);

export const userGearBuilds = sqliteTable('user_gear_builds', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull(),
  name: text('name').notNull().default(''),
  targetIdx: integer('target_idx').notNull().default(0),
  payload: text('payload').notNull().default('{}'),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  index('idx_user_gear_builds_owner').on(t.userId),
]);

/* ---------------- build share links [migration 0003] ----------------
 * Public share aliases of the form /b/<code> for saved builds. One
 * active link per build (unique index on build_id); the code is the
 * primary key (random base62, never derived from the sequential build
 * id, so links cannot be enumerated). discord_id records the owner so
 * every read/write stays ownership-scoped, exactly like the gear rows
 * themselves. Revoking deletes the row — the old code dies at once. */
export const buildShareLinks = sqliteTable('build_share_links', {
  code: text('code').primaryKey(),
  buildId: integer('build_id').notNull(),
  userId: integer('user_id').notNull(),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  uniqueIndex('build_share_links_build_unique').on(t.buildId),
  index('idx_build_share_links_owner').on(t.userId),
]);

/* ---------------- heirloom push state [ddl chain baseline] ---------- */
export const heirloomItemPushes = sqliteTable('heirloom_item_pushes', {
  tenant: integer('tenant').notNull(),
  userId: integer('user_id').notNull(),
  buildSig: text('build_sig').notNull(),
  itemHash: text('item_hash').notNull(),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.tenant, t.userId, t.buildSig, t.itemHash] }),
]);

export const heirloomSetState = sqliteTable('heirloom_set_state', {
  tenant: integer('tenant').notNull(),
  userId: integer('user_id').notNull(),
  buildSig: text('build_sig').notNull(),
  complete: integer('complete').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.tenant, t.userId, t.buildSig] }),
]);
