// Drizzle schema barrel: the data layer's single registration point.
// Entity definitions live with their domains (src/domains/<domain>/
// schema.ts); this file only assembles them so the drizzle client and
// the repositories see one flat namespace, exactly as before the split.
//
// The definitions MODEL the production schema as it exists today; they
// do not change it. Migration execution discipline is unchanged:
// structural changes are applied Worker-side through the versioned
// lazy-DDL ledger (the deploy token has no D1 API permission), never
// via drizzle-kit.
//
// Attestation per entity (where the shape was verified from):
//   [ddl]  CREATE TABLE in src lazy DDL, schema.sql, or migrate-v*.sql
//   [alt]  plus ALTER TABLE ... ADD COLUMN in src / migrate files
//   [qry]  columns attested only by queries in src (no DDL survives in
//          the repo; the columns exist in production and are read /
//          written by live code paths) — modeled nullable unless a
//          query proves more
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export * from '../domains/identity/schema.ts';
export * from '../domains/guilds/schema.ts';
export * from '../domains/groupings/schema.ts';
export * from '../domains/gear/schema.ts';
export * from '../domains/dex/schema.ts';
export * from '../domains/platform/schema.ts';

/* ------------- one-off ops audit (creator backfill; no domain) -------- */
/* ---------------- creator backfill audit [ddl creatorbackfill.js lazy;
   alt lazy detail] ---------------- */
export const creatorBackfillLog = sqliteTable('creator_backfill_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull(),
  tenant: text('tenant'),
  seatNickname: text('seat_nickname'),
  resolvedDiscordId: text('resolved_discord_id'),
  outcome: text('outcome').notNull(),
  reason: text('reason'),
  createdAt: integer('created_at').notNull().default(0),
  detail: text('detail'),
});
