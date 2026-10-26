// Drizzle entity definitions for the gear domain.
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


/* ---------------- gear library [ddl gearstore.js lazy] ---------------- */
export const userGearItems = sqliteTable('user_gear_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  discordId: text('discord_id').notNull(),
  slot: text('slot').notNull().default(''),
  name: text('name').notNull().default(''),
  payload: text('payload').notNull().default('{}'),
  createdAt: integer('created_at').notNull().default(0),
});

export const userGearBuilds = sqliteTable('user_gear_builds', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  discordId: text('discord_id').notNull(),
  name: text('name').notNull().default(''),
  targetIdx: integer('target_idx').notNull().default(0),
  payload: text('payload').notNull().default('{}'),
  createdAt: integer('created_at').notNull().default(0),
});

/* ---------------- heirloom push state [ddl heirloompush.js lazy] ------ */
export const heirloomItemPushes = sqliteTable('heirloom_item_pushes', {
  tenant: text('tenant').notNull(),
  discordId: text('discord_id').notNull(),
  buildSig: text('build_sig').notNull(),
  itemHash: text('item_hash').notNull(),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.tenant, t.discordId, t.buildSig, t.itemHash] }),
]);

export const heirloomSetState = sqliteTable('heirloom_set_state', {
  tenant: text('tenant').notNull(),
  discordId: text('discord_id').notNull(),
  buildSig: text('build_sig').notNull(),
  complete: integer('complete').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.tenant, t.discordId, t.buildSig] }),
]);
