/* ===================================================
 * Plan limits: the single source every quota check reads.
 *
 * One key space, one value table. Enforcement points never hardcode a
 * number and never read storage directly for a limit — they ask this
 * service, passing the caller context, and get the EFFECTIVE limit
 * back. The free-tier constants below are sized from measured
 * production usage (see the PR that introduced them: each sits far
 * above the largest real workload). Plan overrides resolve inside
 * getEffectiveLimits: when the caller's context names a guild whose
 * premium tier is in force (paygate on + entitlement premium, the
 * billing service's verdict), the PREMIUM_LIMITS table applies;
 * every other context — including every guild-less one, such as the
 * personal gear library — reads the free table, so the paygate's
 * launch day moves nobody's quota.
 * =================================================== */
import { getUsageCount, incrementUsage } from './usageCounters.ts';
import { isPremiumActive } from './billing-service.ts';

export type LimitKey =
  | 'gearItemCapacity'    // stored gear items per user (gear library)
  | 'ocrBatchImages'      // screenshots in one batch-OCR import
  | 'ocrBatchesPerDay';   // batch-OCR imports per user per day

export interface LimitContext {
  discordId: string;
  guildSlug?: string | null;
}

export const FREE_LIMITS: Record<LimitKey, number> = {
  gearItemCapacity: 200,
  ocrBatchImages: 20,
  ocrBatchesPerDay: 10,
};

/** Premium-tier values, one order above the audited free tier on
 *  every axis. Read only through getEffectiveLimits. */
export const PREMIUM_LIMITS: Record<LimitKey, number> = {
  gearItemCapacity: 2000,
  ocrBatchImages: 100,
  ocrBatchesPerDay: 50,
};

/** The base (free-tier) value of one limit key. */
export function getLimit(key: LimitKey): number {
  return FREE_LIMITS[key];
}

/** Effective limits for one caller. Async on purpose: plan overrides
 *  will read entitlement state through the data layer, and callers
 *  written against this shape never change. */
export async function getEffectiveLimits(
  db: D1Database,
  ctx: LimitContext,
): Promise<Record<LimitKey, number>> {
  if (ctx.guildSlug && (await isPremiumActive(db, ctx.guildSlug))) {
    return { ...PREMIUM_LIMITS };
  }
  return { ...FREE_LIMITS };
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
