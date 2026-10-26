// Drizzle entity definitions for the platform domain.
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


/* ---------------- push tokens [ddl push.js lazy] ---------------------- */
export const pushTokens = sqliteTable('push_tokens', {
  discordId: text('discord_id').notNull(),
  token: text('token').notNull(),
  platform: text('platform').notNull().default(''),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.discordId, t.token] }),
]);

/* ---------------- error log [ddl errorlog.js lazy] -------------------- */
export const errorLog = sqliteTable('error_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  at: integer('at').notNull(),
  source: text('source').notNull().default(''),
  name: text('name').notNull().default(''),
  message: text('message').notNull().default(''),
  tenant: text('tenant').notNull().default(''),
  context: text('context').notNull().default(''),
  stack: text('stack').notNull().default(''),
}, (t) => [
  index('idx_error_log_at').on(t.at),
]);
