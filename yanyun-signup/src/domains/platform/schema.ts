// Drizzle entity definitions for the platform domain.
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


/* ---------------- push tokens [ddl chain baseline] ----------------- */
export const pushTokens = sqliteTable('push_tokens', {
  discordId: text('discord_id').notNull(),
  token: text('token').notNull(),
  platform: text('platform').notNull().default(''),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.discordId, t.token] }),
]);

/* ---------------- error log [ddl chain baseline] ------------------- */
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

/* ---------------- usage counters [ddl chain 0003] ----------------- */
export const usageCounters = sqliteTable('usage_counters', {
  discordId: text('discord_id').notNull(),
  metric: text('metric').notNull(),
  day: text('day').notNull(),
  count: integer('count').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.discordId, t.metric, t.day] }),
]);
/* ---------------- guild entitlements [alt: 0004] ------------------
 * One row per guild with a plan assignment (billing.ts repository).
 * plan 'free' | 'premium'; source 'stripe' | 'manual' | ''.
 * current_period_end is unix seconds, NULL = no expiry on file;
 * expiry is judged at read time by the entitlement service. */
export const guildEntitlements = sqliteTable('guild_entitlements', {
  tenant: text('tenant').primaryKey(),
  plan: text('plan').notNull().default('free'),
  source: text('source').notNull().default(''),
  currentPeriodEnd: integer('current_period_end'),
  stripeCustomerId: text('stripe_customer_id').notNull().default(''),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().default(''),
  updatedAt: integer('updated_at').notNull().default(0),
});

/* ---------------- stripe events [alt: 0004] ------------------------
 * Webhook idempotency ledger (billing.ts repository): one row per
 * processed Stripe event id. Dedupe state, not business data —
 * excluded from backups (see backup.ts BACKUP_EXCLUDED). */
export const stripeEvents = sqliteTable('stripe_events', {
  eventId: text('event_id').primaryKey(),
  type: text('type').notNull().default(''),
  processedAt: integer('processed_at').notNull().default(0),
});

/* ---------------- hub audit log [ddl chain baseline] --------------- */
export const hubAuditLog = sqliteTable('hub_audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  at: integer('at').notNull(),
  actor: text('actor').notNull().default(''),
  action: text('action').notNull().default(''),
  tenant: text('tenant').notNull().default(''),
  summary: text('summary').notNull().default(''),
  ip: text('ip').notNull().default(''),
}, (t) => [
  index('idx_hub_audit_at').on(t.at),
  index('idx_hub_audit_tenant').on(t.tenant),
]);
