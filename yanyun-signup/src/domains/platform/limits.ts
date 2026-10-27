/* ===================================================
 * Plan limits: the single source every quota check reads.
 *
 * One key space, one value table. Enforcement points never hardcode a
 * number and never read storage directly for a limit — they ask this
 * service, passing the caller context, and get the EFFECTIVE limit
 * back. Today the effective values are the free-tier constants below
 * (sized from measured production usage, see the PR that introduced
 * them: each sits far above the largest real workload). When the
 * paygate lands, plan overrides resolve inside getEffectiveLimits —
 * its (db, context) signature is the seam, and no call site changes.
 * =================================================== */
import { getUsageCount, incrementUsage } from './usageCounters.ts';

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
  void db; void ctx; // paygate seam: overrides resolve here later
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
