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
//   - premiumGate(db, slug) is THE verdict the legacy (pre-tier)
//     gated surfaces consult (admin settings writes, the stats
//     read, white-label presentation composition). The tiered
//     surfaces resolve through tierLocked / tierSurfaceState
//     below. Core grouping features are never behind either.
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
// Lifecycle (2026-10-28 rulings) also lives here: the plan catalog
// (tier names + monthly prices), the 14-day past-due grace for
// Stripe-sourced entitlements (past_due marker on the row, grace
// judged at read time in getEffectiveEntitlement), the one-per-
// guild 14-day T2 trial grant, and the persistence-card verdict.
// Nothing here enables anything by itself: the paygate master
// switch stays OFF and premiumGate / isPremiumActive semantics are
// untouched by the lifecycle additions.
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
  stripeConfig, fetchSubscription, subscriptionInfoFromObject, stripeTierForPriceId,
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

/* ---------------- plan catalog (names + prices) ------------------
 * The settled commercial facts (marcus's rulings, 2026-10-28):
 * theme-B names — T1 Kindred, T2 Steward, T3 Guildmaster — with
 * the DESIGN §10 subtitles (Data / Smart / Flagship; the zh names
 * and subtitles themselves are the catalog data below and the
 * guildAdmin i18n strings), and monthly-only prices $3.99 /
 * $5.99 / $7.99. This catalog is
 * the single backend source every pricing surface composes from:
 * the guild-admin upgrade panel localizes name/subtitle through
 * the i18n catalog (whose zh source and en translations carry the
 * same names) and formats priceMonthlyCents through the price
 * pattern; the hub billing state ships these rows verbatim. No
 * client and no feature line hardcodes a tier name or a price,
 * and the tier-locked shells of individual features never receive
 * prices at all — prices exist only on the pricing/upgrade
 * surface, which the paygate master switch gates (OFF composes
 * nothing, so production sees no price while the switch is off). */
export interface PremiumPlanInfo {
  tier: 1 | 2 | 3;
  plan: 't1' | 't2' | 't3';
  name: string;
  subtitle: string;
  nameEn: string;
  subtitleEn: string;
  priceMonthlyCents: number;
}

export const PREMIUM_PLANS: readonly PremiumPlanInfo[] = [
  { tier: 1, plan: 't1', name: '同道', subtitle: '数据', nameEn: 'Kindred', subtitleEn: 'Data', priceMonthlyCents: 399 },
  { tier: 2, plan: 't2', name: '执事', subtitle: '智能', nameEn: 'Steward', subtitleEn: 'Smart', priceMonthlyCents: 599 },
  { tier: 3, plan: 't3', name: '盟主', subtitle: '旗舰', nameEn: 'Guildmaster', subtitleEn: 'Flagship', priceMonthlyCents: 799 },
];

export function premiumPlanForTier(tier: number): PremiumPlanInfo | null {
  return PREMIUM_PLANS.find((p) => p.tier === tier) ?? null;
}

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
  /** Stored source: 'stripe' | 'manual' | 'trial' | ''. */
  source: string;
  /** Stored period end (unix seconds); null when no expiry on file. */
  currentPeriodEnd: number | null;
  /** Whether a stored premium assignment exists but has lapsed. */
  lapsed: boolean;
  /** Whether a Stripe delinquency is marked on the stored row
   *  (past_due_since set, stripe source only). Inside the grace
   *  window (see PAST_DUE_GRACE_DAYS) the entitlement still reads
   *  at its stored plan with this fact exposed; past the window it
   *  reads lapsed like an expired row. */
  pastDue: boolean;
}

const FREE_ENTITLEMENT: EffectiveEntitlement = {
  plan: 'free', tier: 0, source: '', currentPeriodEnd: null, lapsed: false, pastDue: false,
};

/** Past-due grace (marcus's ruling, 2026-10-28): a Stripe-sourced
 *  entitlement marked past due keeps its stored plan until 14 days
 *  after its current period end; from that instant it lapses (the
 *  row is kept — frozen, not deleted — and reads as free). Manual
 *  and trial sources never enter grace: the marker is only ever
 *  set on stripe rows, and the judgement below double-checks the
 *  source, so their period end is final exactly as before. */
export const PAST_DUE_GRACE_DAYS = 14;

export async function getEffectiveEntitlement(
  d1: D1Database,
  slug: string,
  atSec: number = nowSec(),
): Promise<EffectiveEntitlement> {
  const row = await getEntitlementRow(d1, slug).catch(() => null);
  if (!row) return FREE_ENTITLEMENT;
  const storedTier = TIER_BY_PLAN[row.plan];
  if (storedTier === undefined || storedTier === 0) return FREE_ENTITLEMENT;
  const pastDue = row.source === 'stripe' && row.pastDueSince != null;
  if (row.currentPeriodEnd != null && row.currentPeriodEnd <= atSec) {
    if (pastDue && atSec < row.currentPeriodEnd + PAST_DUE_GRACE_DAYS * 86400) {
      return {
        plan: row.plan as GuildPlan,
        tier: storedTier,
        source: row.source,
        currentPeriodEnd: row.currentPeriodEnd,
        lapsed: false,
        pastDue: true,
      };
    }
    return { plan: 'free', tier: 0, source: row.source, currentPeriodEnd: row.currentPeriodEnd, lapsed: true, pastDue };
  }
  return {
    plan: row.plan as GuildPlan,
    tier: storedTier,
    source: row.source,
    currentPeriodEnd: row.currentPeriodEnd,
    lapsed: false,
    pastDue,
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

/* ---------------- tier verdicts (new paid surfaces) --------------
 * Two verdicts, two consumers:
 *   - tierLocked is the PURE entitlement verdict, and the only
 *     verdict mutations consult: an unentitled guild's writes
 *     refuse with premiumRequired in EVERY paygate state — the
 *     master switch never licenses a write.
 *   - tierSurfaceState is the composition verdict (marcus's
 *     ruling, 2026-10-28: an unlaunched feature "should not even
 *     be visible" to unentitled guilds). An entitled guild
 *     composes the full surface in every paygate state — the
 *     platform grant list is the acceptance path, so a granted
 *     guild verifies against production with the switch still
 *     OFF. An unentitled guild composes the Locked variant only
 *     while the paygate is ON (that variant is the launched
 *     product's sales surface); while the paygate is OFF the
 *     surface composes nothing at all — the field resolves null,
 *     the tab/page does not exist — so an unlaunched feature
 *     leaves zero footprint on unentitled guilds.
 * premiumGate / isPremiumActive above keep their paygate-gated
 * semantics verbatim for the surfaces that predate tiers; the two
 * families never feed each other. */
export async function tierLocked(
  d1: D1Database,
  slug: string,
  minTier: 1 | 2 | 3,
): Promise<boolean> {
  if (!slug) return true;
  const eff = await getEffectiveEntitlement(d1, slug);
  return eff.tier < minTier;
}

/** Composition state of one tiered paid surface for one guild:
 *  'open' (entitled — compose the full surface), 'locked'
 *  (unentitled with the paygate ON — compose the Locked variant),
 *  or 'absent' (unentitled with the paygate OFF — compose nothing;
 *  the field resolves null and no entry point is served). Every
 *  tiered composition point resolves through this one predicate;
 *  no surface reads the master switch on its own. */
export type TierSurfaceState = 'open' | 'locked' | 'absent';

export async function tierSurfaceState(
  d1: D1Database,
  slug: string,
  minTier: 1 | 2 | 3,
): Promise<TierSurfaceState> {
  if (!(await tierLocked(d1, slug, minTier))) return 'open';
  return (await isPaygateEnabled(d1)) ? 'locked' : 'absent';
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
    pastDueSince: prev ? (prev.pastDueSince ?? null) : null,
    hasCard: prev ? !!prev.hasCard : false,
    trialUsed: prev ? !!prev.trialUsed : false,
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
    pastDueSince: prev ? (prev.pastDueSince ?? null) : null,
    hasCard: prev ? !!prev.hasCard : false,
    trialUsed: prev ? !!prev.trialUsed : false,
  };
  await upsertEntitlementRow(d1, row);
  return row;
}

/* ---------------- trial grant (one per guild) --------------------
 * The trial compromise (marcus's ruling, 2026-10-28): every new
 * guild is granted a trial at creation/binding time — T2 (Steward)
 * for TRIAL_DAYS days, source 'trial', NO card required at the
 * door (the grant asks for no payment information at all). The
 * persistence-card verdict below is where the card comes in:
 * enabling a persistence-class feature during the trial needs a
 * card on file.
 *
 * Once per guild, ever: the grant stamps trial_used on the row,
 * and that stamp is carried through every later write (grants,
 * revoke, Stripe applies), so an expired, revoked or superseded
 * trial can never be re-armed. A guild holding a live paid/manual
 * entitlement is never overwritten by a trial. Trial rows carry a
 * period end like manual grants, and expiry is the same read-time
 * judgement — trials get NO past-due grace (stripe source only). */
export const TRIAL_TIER = 2 as const;
export const TRIAL_DAYS = 14;

export async function grantTrialEntitlement(
  d1: D1Database,
  slug: string,
): Promise<GuildEntitlementRow | null> {
  if (!slug) return null;
  const prev = await getEntitlementRow(d1, slug).catch(() => null);
  if (prev && prev.trialUsed) return null;
  if (prev) {
    const eff = await getEffectiveEntitlement(d1, slug);
    if (eff.tier > 0 && !eff.lapsed) return null; // a live entitlement stands
  }
  const at = nowSec();
  const row: GuildEntitlementRow = {
    tenant: slug,
    plan: 't2',
    source: 'trial',
    currentPeriodEnd: at + TRIAL_DAYS * 86400,
    stripeCustomerId: prev ? prev.stripeCustomerId : '',
    stripeSubscriptionId: prev ? prev.stripeSubscriptionId : '',
    updatedAt: at,
    pastDueSince: null,
    hasCard: prev ? !!prev.hasCard : false,
    trialUsed: true,
  };
  await upsertEntitlementRow(d1, row);
  return row;
}

/* ---------------- persistence-card verdict -----------------------
 * Whether enabling a persistence-class feature for this guild
 * requires a card on file first. True exactly when the guild is
 * on a trial (or holds no paid entitlement at all) AND no card is
 * on file. Paid Stripe entitlements and manual grants are never
 * gated by it; a card on file satisfies it for everyone. The card
 * fact is the entitlement row's has_card column — written by the
 * future Stripe line, defaulting to false; this verdict only
 * reads. Like tierLocked this is a pure entitlement verdict: it
 * does not consult the paygate master switch. */
export async function persistenceCardRequired(
  d1: D1Database,
  slug: string,
): Promise<boolean> {
  if (!slug) return true;
  const row = await getEntitlementRow(d1, slug).catch(() => null);
  if (row && row.hasCard) return false;
  const eff = await getEffectiveEntitlement(d1, slug);
  // A live paid (stripe) or platform-granted (manual) entitlement
  // is never gated; everything else — a live trial, a free guild,
  // a lapsed row of every source — needs the card first.
  if (eff.tier > 0 && (eff.source === 'stripe' || eff.source === 'manual')) return false;
  return true;
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
    // The delinquency marker dies with the entitlement it marked;
    // the card fact and the consumed-trial stamp are guild facts,
    // not entitlement facts, and survive a revoke.
    pastDueSince: null,
    hasCard: prev ? !!prev.hasCard : false,
    trialUsed: prev ? !!prev.trialUsed : false,
  };
  await upsertEntitlementRow(d1, row);
  return row;
}

/* ---------------- premium-in-force verdict ----------------
 * Whether a guild's premium tier is in force right now: the master
 * switch is on AND the effective entitlement is premium. Note the
 * limits service no longer resolves through this verdict: since
 * P25 it reads the effective entitlement's tier directly (a pure
 * entitlement read, paygate-independent — see limits.ts); this
 * verdict keeps its semantics for its remaining consumers. */
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

  // Plan resolution (tiered pricing): the subscription's price id
  // reverse-maps to its tier and the row is written with that
  // tier's plan ('t1'/'t2'/'t3'). A price id that is not one of the
  // three configured tier prices — or no price on the object at
  // all — keeps the legacy 'premium' write verbatim, so
  // single-price-era subscriptions behave exactly as before.
  const tier = stripeTierForPriceId(env, sub.priceId);
  const appliedPlan: GuildPlan = tier ? (`t${tier}` as GuildPlan) : 'premium';

  const prev = await getEntitlementRow(d1, slug);
  const at = nowSec();
  // Lifecycle carry: the card fact and the consumed-trial stamp are
  // guild facts that survive every subscription apply; the past-due
  // marker follows the subscription status — set when Stripe
  // reports past_due (the first stamp sticks, so the grace clock
  // is anchored at the delinquency, not at the latest event),
  // cleared the moment the subscription is live again (paid up).
  const lifecycleCarry = {
    hasCard: prev ? !!prev.hasCard : false,
    trialUsed: prev ? !!prev.trialUsed : false,
  };
  const pastDueSince = sub.status === 'past_due'
    ? (prev && prev.pastDueSince != null ? prev.pastDueSince : at)
    : sub.status === 'active' || sub.status === 'trialing'
      ? null
      : (prev ? (prev.pastDueSince ?? null) : null);
  if (LIVE_SUBSCRIPTION_STATUSES.has(sub.status)) {
    await upsertEntitlementRow(d1, {
      tenant: slug,
      plan: appliedPlan,
      source: 'stripe',
      currentPeriodEnd: sub.currentPeriodEnd,
      stripeCustomerId: sub.customerId || (prev ? prev.stripeCustomerId : ''),
      stripeSubscriptionId: sub.id || (prev ? prev.stripeSubscriptionId : ''),
      updatedAt: at,
      pastDueSince,
      ...lifecycleCarry,
    });
    return;
  }
  if (sub.status === 'canceled' || sub.status === 'incomplete_expired') {
    // Access runs to the recorded end; read-time expiry does the
    // rest. When Stripe says it already ended, that instant is the
    // end — the guild reads as free from it. The past-due marker is
    // cleared here on purpose: grace belongs to a live subscription
    // in dunning, never to an ended one — a canceled subscription
    // must not be resurrected by the grace judgement.
    await upsertEntitlementRow(d1, {
      tenant: slug,
      plan: appliedPlan,
      source: 'stripe',
      currentPeriodEnd: sub.endedAt ?? sub.currentPeriodEnd ?? at,
      stripeCustomerId: sub.customerId || (prev ? prev.stripeCustomerId : ''),
      stripeSubscriptionId: sub.id || (prev ? prev.stripeSubscriptionId : ''),
      updatedAt: at,
      pastDueSince: null,
      ...lifecycleCarry,
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
      pastDueSince,
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
          currentPeriodEnd: null, endedAt: null, guildSlug: slug, priceId: '',
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
        pastDueSince: prev ? (prev.pastDueSince ?? null) : null,
        hasCard: prev ? !!prev.hasCard : false,
        trialUsed: prev ? !!prev.trialUsed : false,
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
    const subscriptionId = String(obj.subscription || '');
    let row = customerId ? await getEntitlementByCustomer(d1, customerId).catch(() => null) : null;
    if (!row && subscriptionId) {
      row = await getEntitlementBySubscription(d1, subscriptionId).catch(() => null);
    }
    // Lifecycle: a failed invoice marks the guild's Stripe
    // entitlement past due (first stamp sticks — the 14-day grace
    // is judged at read time from the period end, and the stamp is
    // the delinquency fact surfaces display). Stripe source only:
    // a row that is not Stripe-sourced is never marked, so manual
    // and trial entitlements can never enter grace through here.
    if (row && row.source === 'stripe' && row.pastDueSince == null) {
      await upsertEntitlementRow(d1, { ...row, pastDueSince: nowSec(), updatedAt: nowSec() });
    }
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

