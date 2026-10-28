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
//   - The verdict's POLICY moved to Statsig (phase one of the gate
//     migration): premiumGate and isPremiumActive ask the platform
//     gate wrapper (gates.ts), passing the facts computed here —
//     effective plan, paygate state — as targeting attributes. The
//     local computation below is kept verbatim as the wrapper
//     fallback, so while the provider is unconfigured (and whenever
//     it abstains) the verdict is the pre-migration verdict by
//     construction. Facts — entitlement rows, read-time expiry, the
//     hub switch — never left this file; only policy did.
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
import { gateOpen } from './gates.ts';

export type GuildPlan = 'free' | 'premium' | 't1' | 't2' | 't3';

/** Paid tier level derived from the effective plan at read time:
 *  free (and anything lapsed) is 0, t1/t2/t3 map to 1/2/3, and the
 *  legacy 'premium' plan maps to 3 — stored premium grants keep the
 *  highest tier, they are never clawed back by the tier rollout. */
export type GuildTier = 0 | 1 | 2 | 3;

const TIER_BY_PLAN: Record<string, GuildTier> = {
  free: 0, t1: 1, t2: 2, t3: 3, premium: 3,
};

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
  /** Effective tier right now, derived from the effective plan at
   *  read time (see TIER_BY_PLAN): an expired assignment is tier 0,
   *  exactly like a free one, and lapsed keeps its meaning. */
  tier: GuildTier;
  /** Stored source: 'stripe' | 'manual' | ''. */
  source: string;
  /** Stored period end (unix seconds); null when no expiry on file. */
  currentPeriodEnd: number | null;
  /** Whether a stored premium assignment exists but has lapsed. */
  lapsed: boolean;
}

const FREE_ENTITLEMENT: EffectiveEntitlement = {
  plan: 'free', tier: 0, source: '', currentPeriodEnd: null, lapsed: false,
};

export async function getEffectiveEntitlement(
  d1: D1Database,
  slug: string,
  atSec: number = nowSec(),
): Promise<EffectiveEntitlement> {
  const row = await getEntitlementRow(d1, slug).catch(() => null);
  if (!row) return FREE_ENTITLEMENT;
  const storedTier = TIER_BY_PLAN[row.plan];
  if (storedTier === undefined || storedTier === 0) return FREE_ENTITLEMENT;
  if (row.currentPeriodEnd != null && row.currentPeriodEnd <= atSec) {
    return { plan: 'free', tier: 0, source: row.source, currentPeriodEnd: row.currentPeriodEnd, lapsed: true };
  }
  return {
    plan: row.plan as GuildPlan,
    tier: storedTier,
    source: row.source,
    currentPeriodEnd: row.currentPeriodEnd,
    lapsed: false,
  };
}

/* ---------------- gate keys (Statsig console mapping) ------------
 * The console objects these keys name are specified in
 * docs/STATSIG.md; the rules there encode exactly the truth table
 * the local fallbacks compute here:
 *   premium_access — open when the paygate is off (launch parity)
 *     or the effective plan is premium. premiumGate is its negation.
 *   premium_active — open when the paygate is on AND the effective
 *     plan is premium. isPremiumActive is the verdict itself.
 * The facts ride as private attributes (plan, paygate) with the
 * guild slug as the bucketing unit, so console ID overrides force
 * one guild on or off without a release. Evaluation only happens
 * while the master switch is on (the OFF branch short-circuits in
 * code, as it did before the migration), so the paygate attribute
 * is 'on' in every evaluated check; the console's paygate-off rule
 * mirrors the short-circuit for completeness. */
export const PREMIUM_ACCESS_GATE_KEY = 'premium_access';
export const PREMIUM_ACTIVE_GATE_KEY = 'premium_active';

/** THE gate verdict: true when this guild's Premium surfaces must be
 *  composed in their locked variant / writes rejected. Paygate OFF
 *  (platform default) locks nobody. The verdict is asked of the
 *  platform gate wrapper with the local computation as fallback —
 *  the two agree by construction (see the mapping note above). */
export async function premiumGate(d1: D1Database, slug: string): Promise<boolean> {
  // The platform master switch stays a code-level short-circuit,
  // exactly as before the migration: paygate OFF locks nobody, and
  // no entitlement read (and no gate evaluation) happens at all.
  // The console rule mirroring this branch (paygate-off parity in
  // docs/STATSIG.md) is belt-and-braces for direct evaluators; the
  // switch itself is the platform's, not the console's.
  if (!(await isPaygateEnabled(d1))) return false;
  const eff = await getEffectiveEntitlement(d1, slug);
  const legacyLocked = eff.plan !== 'premium';
  const unlocked = await gateOpen(
    PREMIUM_ACCESS_GATE_KEY,
    {
      unitId: slug,
      privateAttributes: { plan: eff.plan, paygate: 'on' },
    },
    !legacyLocked,
  );
  return !unlocked;
}

/* ---------------- tier verdict (new paid surfaces) ----------------
 * tierLocked is a PURE entitlement verdict: it deliberately does NOT
 * consult the paygate master switch. Rationale: the new tiered paid
 * surfaces have no historical behavior that needs preserving, so
 * there is nothing for the master switch to keep at parity — the
 * enablement lever for them is the entitlement itself. With the
 * paygate OFF a hub-granted test guild can be verified against the
 * real production tier gates while every ungranted guild composes
 * the locked variant and gets nothing. premiumGate /
 * isPremiumActive above keep their paygate-gated semantics verbatim
 * for the surfaces that predate tiers; this verdict never feeds
 * them and they never feed it. */
export async function tierLocked(
  d1: D1Database,
  slug: string,
  minTier: 1 | 2 | 3,
): Promise<boolean> {
  if (!slug) return true;
  const eff = await getEffectiveEntitlement(d1, slug);
  return eff.tier < minTier;
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

/** Manual tier grant, the tiered sibling of grantPremiumManual:
 *  same shape (source 'manual', same 1..3650 day period clamp, the
 *  stored Stripe ids preserved). `tier` accepts the numeric level
 *  (1|2|3) or its stored plan spelling ('t1'|'t2'|'t3'). */
export async function grantTierManual(
  d1: D1Database,
  slug: string,
  tier: 1 | 2 | 3 | 't1' | 't2' | 't3',
  days: number,
): Promise<GuildEntitlementRow> {
  const at = nowSec();
  const prev = await getEntitlementRow(d1, slug);
  const clampedDays = Math.max(1, Math.min(3650, Math.floor(days) || 0));
  const plan: GuildPlan = typeof tier === 'number' ? (`t${tier}` as GuildPlan) : tier;
  const row: GuildEntitlementRow = {
    tenant: slug,
    plan,
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

/* ---------------- plan verdict for limit resolution ----------------
 * Whether a guild's premium tier is in force right now: the master
 * switch is on AND the effective entitlement is premium. The limits
 * service (limits.ts) resolves its premium table through this one
 * verdict — while the switch is OFF nobody's limits move, so the
 * launch-day behavior of every quota stays the free constants. */
export async function isPremiumActive(
  d1: D1Database,
  slug: string,
): Promise<boolean> {
  if (!slug) return false;
  if (!(await isPaygateEnabled(d1))) return false;
  const eff = await getEffectiveEntitlement(d1, slug);
  const legacyActive = eff.plan === 'premium';
  return gateOpen(
    PREMIUM_ACTIVE_GATE_KEY,
    {
      unitId: slug,
      privateAttributes: { plan: eff.plan, paygate: 'on' },
    },
    legacyActive,
  );
}

/* ---------------- tier verdicts (premium tiers T1/T2/T3) --------
 * The tier ladder (DESIGN §8 定版): T1 data, T2 intelligence
 * (includes T1), T3 network & governance (includes T2). A feature
 * surface asks tierLocked(db, slug, n) and serves its entry only
 * when the answer is false.
 *
 * ALIGNMENT POINT (foundation line F0): the stored entitlement is
 * still the single plan value free|premium, so the effective tier
 * maps premium -> 3 (the legacy single plan included everything)
 * and free -> 0. When F0 lands the stored tier column, only
 * getEffectiveTier changes; every caller's signature stays.
 *
 * Paygate semantics mirror premiumGate exactly: the master switch
 * OFF locks nobody (launch parity) — callers that must stay
 * invisible until launch additionally consult isPaygateEnabled,
 * the same composition the subdomain surface uses. */
export async function getEffectiveTier(d1: D1Database, slug: string): Promise<number> {
  if (!slug) return 0;
  const eff = await getEffectiveEntitlement(d1, slug);
  return eff.plan === 'premium' ? 3 : 0;
}

/** True when this guild's tier-n surfaces must stay locked. */
export async function tierLocked(d1: D1Database, slug: string, tier: number): Promise<boolean> {
  if (!(await isPaygateEnabled(d1))) return false;
  return (await getEffectiveTier(d1, slug)) < tier;
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
