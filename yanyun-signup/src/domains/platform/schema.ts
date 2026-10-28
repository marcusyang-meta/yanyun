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
  userId: integer('user_id').notNull(),
  token: text('token').notNull(),
  platform: text('platform').notNull().default(''),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.userId, t.token] }),
]);

/* ---------------- error log [ddl chain baseline] ------------------- */
export const errorLog = sqliteTable('error_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  at: integer('at').notNull(),
  source: text('source').notNull().default(''),
  name: text('name').notNull().default(''),
  message: text('message').notNull().default(''),
  tenant: integer('tenant').notNull().default(0),
  context: text('context').notNull().default(''),
  stack: text('stack').notNull().default(''),
}, (t) => [
  index('idx_error_log_at').on(t.at),
]);

/* ---------------- usage counters [ddl chain 0003] ----------------- */
export const usageCounters = sqliteTable('usage_counters', {
  userId: integer('user_id').notNull(),
  metric: text('metric').notNull(),
  day: text('day').notNull(),
  count: integer('count').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.userId, t.metric, t.day] }),
]);
/* ---------------- guild entitlements [alt: 0005, 0026] ------------
 * One row per guild with a plan assignment (billing.ts repository).
 * plan 'free' | 'premium' | 't1' | 't2' | 't3' (plain TEXT, no CHECK
 * constraint — tiers widened the value set without a migration);
 * source 'stripe' | 'manual' | 'trial' | ''.
 * current_period_end is unix seconds, NULL = no expiry on file;
 * expiry is judged at read time by the entitlement service.
 * Lifecycle columns (0026): past_due_since (unix seconds the Stripe
 * delinquency was marked; NULL = not past due — grace is a read-time
 * judgement, stripe source only), has_card (a payment method is on
 * file; written by the Stripe line, read by the persistence-card
 * verdict), trial_used (the guild's one trial has been consumed;
 * stamped by the trial grant and never cleared). */
export const guildEntitlements = sqliteTable('guild_entitlements', {
  tenant: integer('tenant').primaryKey(),
  plan: text('plan').notNull().default('free'),
  source: text('source').notNull().default(''),
  currentPeriodEnd: integer('current_period_end'),
  stripeCustomerId: text('stripe_customer_id').notNull().default(''),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().default(''),
  updatedAt: integer('updated_at').notNull().default(0),
  pastDueSince: integer('past_due_since'),
  hasCard: integer('has_card').notNull().default(0),
  trialUsed: integer('trial_used').notNull().default(0),
});

/* ---------------- stripe events [alt: 0005] ------------------------
 * Webhook idempotency ledger (billing.ts repository): one row per
 * processed Stripe event id. Dedupe state, not business data —
 * excluded from backups (see backup.ts BACKUP_EXCLUDED). */
export const stripeEvents = sqliteTable('stripe_events', {
  eventId: text('event_id').primaryKey(),
  type: text('type').notNull().default(''),
  processedAt: integer('processed_at').notNull().default(0),
});

/* ---------------- public ID mint counters [migration 0033] --------
 * Per-(type code, day) serial source for typed public IDs (ids.ts).
 * One row per type per UTC day; the sequence is handed out by a single
 * atomic upsert (id-mint.ts), so concurrent minters never collide.
 * Rows are never deleted: the counter table is the audit trail of how
 * many IDs each type minted on each day. */
export const idMintCounters = sqliteTable('id_mint_counters', {
  typeCode: integer('type_code').notNull(),
  dayIndex: integer('day_index').notNull(),
  seq: integer('seq').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.typeCode, t.dayIndex] }),
]);

/* ---------------- hub audit log [ddl chain baseline] --------------- */
export const hubAuditLog = sqliteTable('hub_audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  at: integer('at').notNull(),
  actor: text('actor').notNull().default(''),
  action: text('action').notNull().default(''),
  tenant: integer('tenant').notNull().default(0),
  summary: text('summary').notNull().default(''),
  ip: text('ip').notNull().default(''),
}, (t) => [
  index('idx_hub_audit_at').on(t.at),
  index('idx_hub_audit_tenant').on(t.tenant),
]);

/* ---------------- user feedback [alt: migration 0003] -------------- */
export const feedback = sqliteTable('feedback', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull(),
  userName: text('user_name').notNull().default(''),
  category: text('category').notNull().default('other'),
  content: text('content').notNull().default(''),
  status: text('status').notNull().default('open'),
  createdAt: integer('created_at').notNull().default(0),
  resolvedAt: integer('resolved_at'),
}, (t) => [
  index('idx_feedback_created').on(t.createdAt),
  index('idx_feedback_user_created').on(t.userId, t.createdAt),
  index('idx_feedback_status').on(t.status),
]);
