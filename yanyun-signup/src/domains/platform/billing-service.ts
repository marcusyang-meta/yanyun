// Entitlement service: the single entry point for plan questions.
//
//   - Effective plan is judged at READ time: a premium row whose
//     current period has ended reads as free. Nothing rewrites rows
//     on a schedule; the stored row is a record, this function is
//     the clock. Manual grants carry a period end too, so pilot
//     access lapses the same way.
//   - The paygate is a platform-level master switch (settings,
//     global scope, key 'paygate_enabled', default OFF). OFF means
//     every guild keeps today's full behavior and no gated variant
//     is ever composed; ON means the gates below apply per guild.
//   - premiumGate(db, slug) is THE verdict every gated surface
//     consults (admin settings writes, the stats read, white-label
//     presentation composition). Core grouping features are never
//     behind it.
//
// Stripe event application also lives here: the webhook route only
// verifies the signature and hands over the parsed event.
import { getSettingValue, setSettingValue } from '../guilds/settings.ts';
import {
  getEntitlementRow, upsertEntitlementRow, getEntitlementBySubscription,
  getEntitlementByCustomer, markStripeEventProcessed, hasStripeEvent,
} from './billing.ts';
import type { GuildEntitlementRow } from './billing.ts';
import {
  stripeConfig, fetchSubscription, subscriptionInfoFromObject,
} from './stripe.ts';
import type { StripeSubscriptionInfo } from './stripe.ts';
import type { Env } from './context.ts';
import { logError } from './error-log.ts';

export type GuildPlan = 'free' | 'premium';

export const PAYGATE_ENABLED_KEY = 'paygate_enabled';

const nowSec = () => Math.floor(Date.now() / 1000);

/* ---------------- master switch ---------------- */

export async function isPaygateEnabled(d1: D1Database): Promise<boolean> {
  return (await getSettingValue(d1, '', PAYGATE_ENABLED_KEY)) === '1';
}

export async function setPaygateEnabled(d1: D1Database, on: boolean): Promise<void> {
  await setSettingValue(d1, '', PAYGATE_ENABLED_KEY, on ? '1' : '');
}

/* ---------------- effective entitlement ---------------- */

export interface EffectiveEntitlement {
  /** Effective plan right now (read-time expiry already applied). */
  plan: GuildPlan;
  /** Stored source: 'stripe' | 'manual' | ''. */
  source: string;
  /** Stored period end (unix seconds); null when no expiry on file. */
  currentPeriodEnd: number | null;
  /** Whether a stored premium assignment exists but has lapsed. */
  lapsed: boolean;
}

const FREE_ENTITLEMENT: EffectiveEntitlement = {
  plan: 'free', source: '', currentPeriodEnd: null, lapsed: false,
};

export async function getEffectiveEntitlement(
  d1: D1Database,
  slug: string,
  atSec: number = nowSec(),
): Promise<EffectiveEntitlement> {
  const row = await getEntitlementRow(d1, slug).catch(() => null);
  if (!row || row.plan !== 'premium') return FREE_ENTITLEMENT;
  if (row.currentPeriodEnd != null && row.currentPeriodEnd <= atSec) {
    return { plan: 'free', source: row.source, currentPeriodEnd: row.currentPeriodEnd, lapsed: true };
  }
  return { plan: 'premium', source: row.source, currentPeriodEnd: row.currentPeriodEnd, lapsed: false };
}

/** THE gate verdict: true when this guild's Premium surfaces must be
 *  composed in their locked variant / writes rejected. Paygate OFF
 *  (platform default) short-circuits to false for every guild. */
export async function premiumGate(d1: D1Database, slug: string): Promise<boolean> {
  if (!(await isPaygateEnabled(d1))) return false;
  const eff = await getEffectiveEntitlement(d1, slug);
  return eff.plan !== 'premium';
}

/* ---------------- manual grant / revoke (hub) ---------------- */

export async function grantPremiumManual(
  d1: D1Database,
  slug: string,
  days: number,
): Promise<GuildEntitlementRow> {
  const at = nowSec();
  const prev = await getEntitlementRow(d1, slug);
  const clampedDays = Math.max(1, Math.min(3650, Math.floor(days) || 0));
  const row: GuildEntitlementRow = {
    tenant: slug,
    plan: 'premium',
    source: 'manual',
    currentPeriodEnd: at + clampedDays * 86400,
    stripeCustomerId: prev ? prev.stripeCustomerId : '',
    stripeSubscriptionId: prev ? prev.stripeSubscriptionId : '',
    updatedAt: at,
  };
  await upsertEntitlementRow(d1, row);
  return row;
}

export async function revokePremium(
  d1: D1Database,
  slug: string,
): Promise<GuildEntitlementRow> {
  const at = nowSec();
  const prev = await getEntitlementRow(d1, slug);
  const row: GuildEntitlementRow = {
    tenant: slug,
    plan: 'free',
    source: '',
    currentPeriodEnd: null,
    // Stripe ids stay on file: they are lookup keys for future
    // webhook events and support, not access grants by themselves.
    stripeCustomerId: prev ? prev.stripeCustomerId : '',
    stripeSubscriptionId: prev ? prev.stripeSubscriptionId : '',
    updatedAt: at,
  };
  await upsertEntitlementRow(d1, row);
  return row;
}

/* ---------------- plan-based gear limits (seam) ----------------
 * Single source for plan-tier gear limits. The gear-capacity work
 * consumes effectiveGearLimits(plan) for its item/build/batch-OCR
 * caps; until it wires in, nothing reads these numbers, so the free
 * tier values are deliberately generous — wiring them in must not
 * retroactively squeeze a guild's existing library. */

export interface GearLimits {
  maxItems: number;
  maxBuilds: number;
  batchOcrDailyQuota: number;
}

export const GEAR_LIMITS_BY_PLAN: Record<GuildPlan, GearLimits> = {
  free: { maxItems: 500, maxBuilds: 20, batchOcrDailyQuota: 20 },
  premium: { maxItems: 5000, maxBuilds: 200, batchOcrDailyQuota: 200 },
};

export function effectiveGearLimits(plan: GuildPlan): GearLimits {
  return GEAR_LIMITS_BY_PLAN[plan] || GEAR_LIMITS_BY_PLAN.free;
}

export async function effectiveGearLimitsForGuild(
  d1: D1Database,
  slug: string,
): Promise<GearLimits> {
  const eff = await getEffectiveEntitlement(d1, slug);
  return effectiveGearLimits(eff.plan);
}

/* ---------------- Stripe event application ---------------- */

const LIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due']);

async function applySubscription(
  env: Env,
  sub: StripeSubscriptionInfo,
  slugHint: string,
): Promise<void> {
  const d1 = env.DB;
  let slug = slugHint || sub.guildSlug;
  if (!slug && sub.id) {
    const bySub = await getEntitlementBySubscription(d1, sub.id);
    if (bySub) slug = bySub.tenant;
  }
  if (!slug && sub.customerId) {
    const byCustomer = await getEntitlementByCustomer(d1, sub.customerId);
    if (byCustomer) slug = byCustomer.tenant;
  }
  if (!slug) return; // not one of ours (or pre-checkout): nothing to apply

  const prev = await getEntitlementRow(d1, slug);
  const at = nowSec();
  if (LIVE_SUBSCRIPTION_STATUSES.has(sub.status)) {
    await upsertEntitlementRow(d1, {
      tenant: slug,
      plan: 'premium',
      source: 'stripe',
      currentPeriodEnd: sub.currentPeriodEnd,
      stripeCustomerId: sub.customerId || (prev ? prev.stripeCustomerId : ''),
      stripeSubscriptionId: sub.id || (prev ? prev.stripeSubscriptionId : ''),
      updatedAt: at,
    });
    return;
  }
  if (sub.status === 'canceled' || sub.status === 'incomplete_expired') {
    // Access runs to the recorded end; read-time expiry does the
    // rest. When Stripe says it already ended, that instant is the
    // end — the guild reads as free from it.
    await upsertEntitlementRow(d1, {
      tenant: slug,
      plan: 'premium',
      source: 'stripe',
      currentPeriodEnd: sub.endedAt ?? sub.currentPeriodEnd ?? at,
      stripeCustomerId: sub.customerId || (prev ? prev.stripeCustomerId : ''),
      stripeSubscriptionId: sub.id || (prev ? prev.stripeSubscriptionId : ''),
      updatedAt: at,
    });
    return;
  }
  // Other statuses (incomplete, unpaid, paused): sync the ids and
  // period end without changing the plan assignment itself.
  if (prev) {
    await upsertEntitlementRow(d1, {
      ...prev,
      currentPeriodEnd: sub.currentPeriodEnd ?? prev.currentPeriodEnd,
      stripeCustomerId: sub.customerId || prev.stripeCustomerId,
      stripeSubscriptionId: sub.id || prev.stripeSubscriptionId,
      updatedAt: at,
    });
  }
}

/** Apply one verified Stripe event. Idempotent: an event id already
 *  on file is dropped untouched; otherwise the event is applied
 *  first and recorded after — the applies are upserts, so a Stripe
 *  retry racing the record still converges, while a hard failure
 *  mid-apply leaves the replay path open (the route answers 500 and
 *  Stripe redelivers). Returns what happened for the route's
 *  response / the rig's assertions. */
export async function handleStripeEvent(
  env: Env,
  event: { id?: string; type?: string; data?: { object?: Record<string, unknown> } },
): Promise<{ applied: boolean; duplicate: boolean }> {
  const d1 = env.DB;
  const eventId = String(event.id || '');
  const type = String(event.type || '');
  if (!eventId || !type) return { applied: false, duplicate: false };
  if (await hasStripeEvent(d1, eventId)) return { applied: false, duplicate: true };

  const obj = (event.data && event.data.object) || {};
  const done = async (applied: boolean) => {
    await markStripeEventProcessed(d1, eventId, type, nowSec());
    return { applied, duplicate: false };
  };
  if (type === 'checkout.session.completed') {
    const meta = (obj.metadata || {}) as Record<string, unknown>;
    const slug = String(meta.guild_slug || obj.client_reference_id || '');
    const customerId = String(obj.customer || '');
    const subRaw = obj.subscription;
    let sub: StripeSubscriptionInfo | null = null;
    if (subRaw && typeof subRaw === 'object') {
      sub = subscriptionInfoFromObject(subRaw as Record<string, unknown>);
    } else if (typeof subRaw === 'string' && subRaw) {
      const cfg = stripeConfig(env);
      if (cfg) sub = await fetchSubscription(cfg, subRaw).catch(() => null);
      if (!sub) {
        sub = {
          id: subRaw, status: 'active', customerId,
          currentPeriodEnd: null, endedAt: null, guildSlug: slug,
        };
      }
    }
    if (sub && !sub.customerId && customerId) sub.customerId = customerId;
    if (sub) await applySubscription(env, sub, slug);
    else if (slug) {
      // Session without a subscription object (should not happen in
      // subscription mode): record the customer link at least.
      const prev = await getEntitlementRow(d1, slug);
      await upsertEntitlementRow(d1, {
        tenant: slug,
        plan: 'premium',
        source: 'stripe',
        currentPeriodEnd: prev ? prev.currentPeriodEnd : null,
        stripeCustomerId: customerId || (prev ? prev.stripeCustomerId : ''),
        stripeSubscriptionId: prev ? prev.stripeSubscriptionId : '',
        updatedAt: nowSec(),
      });
    }
    return done(true);
  }
  if (type === 'customer.subscription.updated' || type === 'customer.subscription.deleted') {
    const sub = subscriptionInfoFromObject(obj);
    if (type === 'customer.subscription.deleted' && !sub.endedAt) {
      sub.endedAt = sub.currentPeriodEnd ?? nowSec();
    }
    await applySubscription(env, sub, '');
    return done(true);
  }
  if (type === 'invoice.payment_failed') {
    const customerId = String(obj.customer || '');
    const row = customerId ? await getEntitlementByCustomer(d1, customerId).catch(() => null) : null;
    void logError(d1, {
      source: 'stripe',
      name: 'InvoicePaymentFailed',
      message: `invoice.payment_failed for customer ${customerId || '(unknown)'}`,
      context: { tenant: row ? row.tenant : '', path: 'stripe/webhook' },
    }).catch(() => {});
    return done(true);
  }
  // Unhandled types are still recorded above (idempotent no-op).
  return done(false);
}
