// Billing repository: the single access path for the billing
// entities (guild_entitlements + stripe_events). Business rules —
// effective-plan judgement, the paygate, Stripe event application —
// live in billing-service.ts; this file owns only the statements,
// in the repository shape the rest of the data layer uses (drizzle
// sql templates over the schema objects, bare identifiers inside
// INSERT column lists / ON CONFLICT targets).
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { guildEntitlements, stripeEvents } from './schema.ts';

export interface GuildEntitlementRow {
  tenant: string;
  plan: string;
  source: string;
  currentPeriodEnd: number | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  updatedAt: number;
  /** Lifecycle (migration 0026): unix seconds the Stripe
   *  delinquency was marked; null = not past due. Optional on
   *  construction (older call sites predate the column); reads
   *  always carry it. */
  pastDueSince?: number | null;
  /** Lifecycle (0026): a payment method is on file for the guild.
   *  Written by the Stripe line; the lifecycle engine only reads. */
  hasCard?: boolean;
  /** Lifecycle (0026): the guild's one trial has been consumed.
   *  Stamped by the trial grant; never cleared by a later write path. */
  trialUsed?: boolean;
}

interface RawEntitlementRow {
  tenant: string;
  plan: string;
  source: string;
  current_period_end: number | null;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  updated_at: number;
  past_due_since: number | null;
  has_card: number;
  trial_used: number;
}

function toRow(r: RawEntitlementRow): GuildEntitlementRow {
  return {
    tenant: String(r.tenant || ''),
    plan: String(r.plan || 'free'),
    source: String(r.source || ''),
    currentPeriodEnd: r.current_period_end == null ? null : Number(r.current_period_end),
    stripeCustomerId: String(r.stripe_customer_id || ''),
    stripeSubscriptionId: String(r.stripe_subscription_id || ''),
    updatedAt: Number(r.updated_at) || 0,
    pastDueSince: r.past_due_since == null ? null : Number(r.past_due_since),
    hasCard: Number(r.has_card) === 1,
    trialUsed: Number(r.trial_used) === 1,
  };
}

const COLS = sql`${guildEntitlements.tenant}, ${guildEntitlements.plan}, ${guildEntitlements.source}, ${guildEntitlements.currentPeriodEnd}, ${guildEntitlements.stripeCustomerId}, ${guildEntitlements.stripeSubscriptionId}, ${guildEntitlements.updatedAt}, ${guildEntitlements.pastDueSince}, ${guildEntitlements.hasCard}, ${guildEntitlements.trialUsed}`;

export async function getEntitlementRow(
  d1: D1Database,
  tenant: string,
): Promise<GuildEntitlementRow | null> {
  const db = createDb(d1);
  const row = await db.get<RawEntitlementRow>(
    sql`SELECT ${COLS} FROM ${guildEntitlements}
        WHERE ${guildEntitlements.tenant} = ${tenant}`,
  );
  return row ? toRow(row) : null;
}

export async function listEntitlementRows(
  d1: D1Database,
): Promise<GuildEntitlementRow[]> {
  const db = createDb(d1);
  const rows = await db.all<RawEntitlementRow>(
    sql`SELECT ${COLS} FROM ${guildEntitlements} ORDER BY ${guildEntitlements.tenant}`,
  );
  return (rows || []).map(toRow);
}

export async function getEntitlementBySubscription(
  d1: D1Database,
  subscriptionId: string,
): Promise<GuildEntitlementRow | null> {
  if (!subscriptionId) return null;
  const db = createDb(d1);
  const row = await db.get<RawEntitlementRow>(
    sql`SELECT ${COLS} FROM ${guildEntitlements}
        WHERE ${guildEntitlements.stripeSubscriptionId} = ${subscriptionId}`,
  );
  return row ? toRow(row) : null;
}

export async function getEntitlementByCustomer(
  d1: D1Database,
  customerId: string,
): Promise<GuildEntitlementRow | null> {
  if (!customerId) return null;
  const db = createDb(d1);
  const row = await db.get<RawEntitlementRow>(
    sql`SELECT ${COLS} FROM ${guildEntitlements}
        WHERE ${guildEntitlements.stripeCustomerId} = ${customerId}`,
  );
  return row ? toRow(row) : null;
}

export async function upsertEntitlementRow(
  d1: D1Database,
  row: GuildEntitlementRow,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${guildEntitlements} (${sql.identifier('tenant')}, ${sql.identifier('plan')}, ${sql.identifier('source')}, ${sql.identifier('current_period_end')}, ${sql.identifier('stripe_customer_id')}, ${sql.identifier('stripe_subscription_id')}, ${sql.identifier('updated_at')}, ${sql.identifier('past_due_since')}, ${sql.identifier('has_card')}, ${sql.identifier('trial_used')})
        VALUES (${row.tenant}, ${row.plan}, ${row.source}, ${row.currentPeriodEnd}, ${row.stripeCustomerId}, ${row.stripeSubscriptionId}, ${row.updatedAt}, ${row.pastDueSince ?? null}, ${row.hasCard ? 1 : 0}, ${row.trialUsed ? 1 : 0})
        ON CONFLICT (${sql.identifier('tenant')})
        DO UPDATE SET ${sql.identifier('plan')} = excluded.plan,
          ${sql.identifier('source')} = excluded.source,
          ${sql.identifier('current_period_end')} = excluded.current_period_end,
          ${sql.identifier('stripe_customer_id')} = excluded.stripe_customer_id,
          ${sql.identifier('stripe_subscription_id')} = excluded.stripe_subscription_id,
          ${sql.identifier('updated_at')} = excluded.updated_at,
          ${sql.identifier('past_due_since')} = excluded.past_due_since,
          ${sql.identifier('has_card')} = excluded.has_card,
          ${sql.identifier('trial_used')} = excluded.trial_used`,
  );
}

/** Whether a Stripe event id is already on file (a replay to drop). */
export async function hasStripeEvent(
  d1: D1Database,
  eventId: string,
): Promise<boolean> {
  const db = createDb(d1);
  const row = await db.get<{ event_id: string }>(
    sql`SELECT ${stripeEvents.eventId} FROM ${stripeEvents}
        WHERE ${stripeEvents.eventId} = ${eventId}`,
  );
  return !!row;
}

/** Webhook idempotency: record one processed Stripe event id.
 *  Returns true when the row was newly inserted (first delivery) and
 *  false when the event was already on file (a replay to drop). */
export async function markStripeEventProcessed(
  d1: D1Database,
  eventId: string,
  type: string,
  at: number,
): Promise<boolean> {
  const db = createDb(d1);
  const res = await db.run(
    sql`INSERT OR IGNORE INTO ${stripeEvents} (${sql.identifier('event_id')}, ${sql.identifier('type')}, ${sql.identifier('processed_at')})
        VALUES (${eventId}, ${type}, ${at})`,
  );
  const changes = Number((res as { meta?: { changes?: number } })?.meta?.changes ?? 0);
  return changes > 0;
}
