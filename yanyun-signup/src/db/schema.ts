// Drizzle schema barrel: the data layer's single registration point.
// Entity definitions live with their domains (src/domains/<domain>/
// schema.ts); this file only assembles them so the drizzle client and
// the repositories see one flat namespace, exactly as before the split.
//
// The definitions MODEL the production schema as it exists today; they
// do not change it. Structural change is governed by the wrangler
// migration chain in yanyun-signup/migrations/: the baseline file
// encodes the production shape verified column-by-column during the
// 2026-10-27 Route-A takeover, merged migration files are immutable
// (a shape change is a new migration), and backend-deploy applies
// pending migrations to production before promoting new code.
// Runtime code contains no DDL — the lazy-DDL ensure* helpers are
// retired — and the CI drift gate (scripts/ci/check-schema-drift.mjs)
// fails any change that lets this model and the chain drift apart.
//
// Attestation per entity (where the shape was verified from):
//   [ddl]  table created by the migration chain
//   [alt]  plus a later migration file in the chain
//   [qry]  columns attested only by queries in src — modeled nullable
//          unless a query proves more (legacy notes; every [qry]
//          claim was re-verified against production in the takeover)
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export * from '../domains/identity/schema.ts';
export * from '../domains/guilds/schema.ts';
export * from '../domains/groupings/schema.ts';
export * from '../domains/gear/schema.ts';
export * from '../domains/dex/schema.ts';
export * from '../domains/platform/schema.ts';

/* ------------- one-off ops audit (creator backfill; no domain) -------- */
/* ---------------- creator backfill audit [ddl chain baseline] ------- */
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
