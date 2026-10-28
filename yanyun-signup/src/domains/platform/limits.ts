/* ===================================================
 * Plan limits: the single source every quota check reads.
 *
 * One key space, one value table per tier. Enforcement points never
 * hardcode a number and never read storage directly for a limit —
 * they ask this service, passing the caller context, and get the
 * EFFECTIVE limit back. The free-tier constants below are sized from
 * measured production usage (see the PR that introduced them: each
 * sits far above the largest real workload).
 *
 * Resolution is by EFFECTIVE TIER (P25): when the caller's context
 * names a guild, the guild's tier — read from the billing service's
 * EffectiveEntitlement.tier, with read-time expiry already applied
 * there, and the legacy 'premium' plan reading as tier 3 — selects
 * the table (DESIGN §8 values). Tier 0 (no entitlement, a lapsed
 * entitlement, an unrecognized tier) is the free table. Guild-less
 * contexts always read the free table: the personal gear library is
 * the standing example — its call sites pass no guild slug, so gear
 * capacity carries no guild attribution and stays on the free table
 * exactly as before.
 *
 * CONTRACT CHANGE (P25, superseding the binary plan resolution):
 * quota resolution is a pure entitlement read. It does NOT consult
 * the paygate master switch — isPremiumActive keeps that verdict
 * for its other consumers and this service no longer calls it. The
 * fidelity the old note promised ("the paygate's launch day moves
 * nobody's quota") is preserved where it was aimed: FREE guilds,
 * whose table below is value-for-value identical to before. A guild
 * holding a tier entitlement — today only hub-granted test guilds —
 * resolves at its tier straight away; that is precisely how the
 * build-but-do-not-enable phase verifies tier behaviour while the
 * paygate stays OFF and gates no surface.
 * =================================================== */
import { getUsageCount, incrementUsage } from './usageCounters.ts';
import { getEffectiveEntitlement } from './billing-service.ts';

export type LimitKey =
  | 'gearItemCapacity'    // stored gear items per user (gear library)
  | 'ocrBatchImages'      // screenshots in one batch-OCR import
  | 'ocrBatchesPerDay'    // batch-OCR imports per user per day
  | 'announcementsPerDay' // guild announcements per guild per day (F9)
  | 'urgentCallsPerDay';  // urgent rally calls per guild per day (F18)

export interface LimitContext {
  discordId: string;
  guildSlug?: string | null;
}

export const FREE_LIMITS: Record<LimitKey, number> = {
  gearItemCapacity: 200,
  ocrBatchImages: 20,
  ocrBatchesPerDay: 10,
  /* Announcement metering is per GUILD, not per user (the abuse unit
   * is a guild's broadcast channel, whoever on its admin team posts).
   * 5/day sits far above a real guild's announcement cadence (a
   * busy guild posts a few per week) while capping a compromised or
   * careless admin account at five whole-guild pushes a day. Urgent
   * rally calls get their own stricter counter at 2/day: an emergency
   * channel that fires daily is no longer an emergency channel, and
   * urgent pushes must stay rare enough that members keep their
   * notifications on. These are abuse ceilings, not plan tiers: the
   * premium table deliberately carries the same values, so a paygate
   * launch never moves a communication quota. */
  announcementsPerDay: 5,
  urgentCallsPerDay: 2,
};

/* Per-tier tables (P25, DESIGN §8 定版). The metered axes scale with
 * tier; the communication quotas stay at the free values on every
 * tier — they are abuse ceilings, not plan tiers (see the free
 * table's note), and no tier buys more broadcasts. */
export const TIER1_LIMITS: Record<LimitKey, number> = {
  gearItemCapacity: 1000,
  ocrBatchImages: 50,
  ocrBatchesPerDay: 30,
  announcementsPerDay: 5,
  urgentCallsPerDay: 2,
};

export const TIER2_LIMITS: Record<LimitKey, number> = {
  gearItemCapacity: 2000,
  ocrBatchImages: 100,
  ocrBatchesPerDay: 50,
  announcementsPerDay: 5,
  urgentCallsPerDay: 2,
};

export const TIER3_LIMITS: Record<LimitKey, number> = {
  gearItemCapacity: 5000,
  ocrBatchImages: 100,
  ocrBatchesPerDay: 100,
  announcementsPerDay: 5,
  urgentCallsPerDay: 2,
};

/** The pre-P25 single premium table, kept as a name alias: its
 *  values are exactly the tier-2 table. Legacy 'premium' itself no
 *  longer resolves here — it reads as tier 3 (see the header). */
export const PREMIUM_LIMITS: Record<LimitKey, number> = TIER2_LIMITS;

/** Quota tiers: 0 = free, 1..3 = the paid tiers of DESIGN §8. */
export type QuotaTier = 0 | 1 | 2 | 3;

export const LIMITS_BY_TIER: Record<QuotaTier, Record<LimitKey, number>> = {
  0: FREE_LIMITS,
  1: TIER1_LIMITS,
  2: TIER2_LIMITS,
  3: TIER3_LIMITS,
};

/** The limit table for one tier (a fresh copy, like every read). */
export function limitsForTier(tier: QuotaTier): Record<LimitKey, number> {
  return { ...LIMITS_BY_TIER[tier] };
}

function tierFromToken(token: string): QuotaTier | null {
  const t = token.trim().toLowerCase();
  if (t === 'premium') return 3; // legacy plan reads as tier 3
  if (t === 'free') return 0;
  const m = /^(?:t(?:ier)?\s*)?([0-3])$/.exec(t);
  return m ? (Number(m[1]) as QuotaTier) : null;
}

/** Normalize an effective entitlement to a quota tier. The tier
 *  field is authoritative when the billing service carries one
 *  (numeric or token form); without it the plan decides, with the
 *  legacy 'premium' plan reading as tier 3 and 'free' as tier 0.
 *  Unrecognized values resolve to tier 0 — a quota must never be
 *  raised by a value this service does not understand. Expiry is
 *  not re-judged here: the entitlement handed in is already the
 *  effective (read-time) one, so a lapsed guild arrives as free. */
export function quotaTierOfEntitlement(
  eff: { plan?: unknown; tier?: unknown } | null | undefined,
): QuotaTier {
  if (!eff) return 0;
  if (typeof eff.tier === 'number' && Number.isFinite(eff.tier)) {
    return Math.max(0, Math.min(3, Math.trunc(eff.tier))) as QuotaTier;
  }
  if (typeof eff.tier === 'string') {
    const tier = tierFromToken(eff.tier);
    if (tier !== null) return tier;
  }
  if (typeof eff.plan === 'string') {
    const tier = tierFromToken(eff.plan);
    if (tier !== null) return tier;
  }
  return 0;
}

/** The base (free-tier) value of one limit key. */
export function getLimit(key: LimitKey): number {
  return FREE_LIMITS[key];
}

/** Effective limits for one caller: the table of the guild's
 *  effective tier (see the header for the contract), or the free
 *  table for a guild-less context. Async on purpose: the tier reads
 *  entitlement state through the data layer, and callers written
 *  against this shape never change. */
export async function getEffectiveLimits(
  db: D1Database,
  ctx: LimitContext,
): Promise<Record<LimitKey, number>> {
  if (!ctx.guildSlug) return { ...FREE_LIMITS };
  const eff = await getEffectiveEntitlement(db, ctx.guildSlug);
  return limitsForTier(quotaTierOfEntitlement(eff));
}

/* ---------- daily metering (metric keys + the day rule) ---------- */

/** Metric key for batch-OCR imports in usage_counters. */
export const METRIC_GEAR_OCR_BATCHES = 'gear_ocr_batches';

/** Day key for daily quotas: the Asia/Shanghai calendar date of the
 *  instant, 'YYYY-MM-DD'. Beijing keeps no DST, so a fixed +08:00
 *  shift is exact; the product's week boundary already runs on
 *  Beijing time, quotas follow the same clock. */
export function usageDayKey(nowMs: number): string {
  return new Date(nowMs + 8 * 3600_000).toISOString().slice(0, 10);
}

/** Batch-OCR imports one user has already consumed today. */
export async function getOcrBatchesUsedToday(
  db: D1Database,
  discordId: string,
  nowMs: number,
): Promise<number> {
  return getUsageCount(db, discordId, METRIC_GEAR_OCR_BATCHES, usageDayKey(nowMs));
}

/** Record one consumed batch-OCR import for one user (today). */
export async function recordOcrBatch(
  db: D1Database,
  discordId: string,
  nowMs: number,
): Promise<number> {
  return incrementUsage(db, discordId, METRIC_GEAR_OCR_BATCHES, usageDayKey(nowMs), 1, nowMs);
}

/* ---------- guild announcement metering (per guild per day) ------- */

/** Metric keys for guild broadcasts in usage_counters. Standard and
 *  urgent posts are metered separately so urgent calls keep their own
 *  stricter budget even on a day the standard budget is untouched. */
export const METRIC_GUILD_ANNOUNCEMENTS = 'guild_announcements';
export const METRIC_GUILD_URGENT_CALLS = 'guild_urgent_calls';

/** Counter scope for guild-scoped metering: the usage_counters entity
 *  keys rows by an opaque scope string (its discord_id column); a
 *  guild's broadcasts meter under 'guild:<slug>', a namespace no real
 *  Discord id (all digits) can collide with. */
export function guildUsageScope(guildSlug: string): string {
  return 'guild:' + guildSlug;
}

function announcementMetric(kind: string): string {
  return kind === 'urgent' ? METRIC_GUILD_URGENT_CALLS : METRIC_GUILD_ANNOUNCEMENTS;
}

/** Broadcasts of one kind one guild has already consumed today. */
export async function getAnnouncementsUsedToday(
  db: D1Database,
  guildSlug: string,
  kind: string,
  nowMs: number,
): Promise<number> {
  return getUsageCount(db, guildUsageScope(guildSlug), announcementMetric(kind), usageDayKey(nowMs));
}

/** Record one consumed broadcast of one kind for one guild (today). */
export async function recordAnnouncementUse(
  db: D1Database,
  guildSlug: string,
  kind: string,
  nowMs: number,
): Promise<number> {
  return incrementUsage(db, guildUsageScope(guildSlug), announcementMetric(kind), usageDayKey(nowMs), 1, nowMs);
}
