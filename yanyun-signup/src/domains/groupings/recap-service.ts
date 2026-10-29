/* ===================================================
 * P18 AI activity recap service (premium T3): data-package
 * assembly + the generation pipeline.
 *
 * Assembly: one completed grouping's recap data package, built
 * ONLY from data the platform actually holds (the events /
 * signups / results entities through their repositories):
 *   - the grouping itself (title, type, dungeon, capacity, start)
 *   - the timeline the rows support: created_at (recorded),
 *     starts_at_utc (scheduled departure), reminder_sent_at.
 *     There is NO completion timestamp on the events entity —
 *     'completedAt' is assembled as null and named in `missing`.
 *   - attendance: the final seat roster (signups are the seats),
 *     ready marks (ready_at), empty seats = capacity - seated.
 *     There is NO absence record anywhere on the platform (a
 *     member who leaves frees the seat row), so an absentee list
 *     cannot be derived — 'absentees' is named in `missing` and
 *     the provider is instructed to omit it, never invent it.
 *   - results: the race-results rows when recorded;
 *     for a race grouping with none, 'raceResults' is missing.
 *
 * Pipeline (manual trigger only — nothing auto-generates, so
 * nothing burns provider quota unobserved):
 *   assemble -> meter (per-guild daily ceiling, platform limits)
 *   -> provider.generate -> store (recaps repository).
 * A failed attempt is metered (the provider call is the cost),
 * recorded as the row's failed state, and retryable; it never
 * destroys a previous successful recap.
 *
 * Tier gating is NOT this file's job: callers compose the surface
 * from tierLocked(db, slug, 3) + recapProviderFromEnv(env) — the
 * Workers AI adapter over the env.AI binding — and only reach
 * generateRecap for a guild that passed both.
 * =================================================== */
import type { Env } from '../platform/context.ts';
import { recapProviderFromEnv } from '../platform/recap-provider.ts';
import type { RecapProvider, RecapDataPackage } from '../platform/recap-provider.ts';
import {
  getEffectiveLimits, getAiRecapsUsedToday, recordAiRecapUse,
} from '../platform/limits.ts';
import { listSignupsByEvent } from './signups.ts';
import { listResultsByEvent } from './results.ts';
import { getRecapByEvent, upsertRecapReady, upsertRecapFailed } from './recaps.ts';
import type { EventRow } from './events.ts';
import type { RecapRow } from './recaps.ts';

/** Compact summary of one data package, stored on the recap row
 *  (snapshot_json) and composed into display lines by the shells.
 *  Counts and facts only — never the full package. */
export interface RecapSnapshotSummary {
  type: string;
  dungeon: string;
  startsAtUtc: number | null;
  seated: number;
  capacity: number;
  ready: number;
  resultCount: number;
  bestTimeMs: number | null;
  missing: string[];
}

export function summarizePackage(pkg: RecapDataPackage): RecapSnapshotSummary {
  const results = pkg.results || [];
  return {
    type: pkg.grouping.type,
    dungeon: pkg.grouping.dungeon,
    startsAtUtc: pkg.grouping.startsAtUtc,
    seated: pkg.attendance.seatedCount,
    capacity: pkg.attendance.capacity,
    ready: pkg.attendance.readyCount,
    resultCount: results.length,
    bestTimeMs: results.length ? Math.min(...results.map((r) => r.timeMs)) : null,
    missing: [...pkg.missing],
  };
}

/** Assemble one grouping's recap data package from platform data. */
export async function assembleRecapPackage(
  db: D1Database,
  ev: EventRow,
): Promise<RecapDataPackage> {
  const [seats, results] = await Promise.all([
    listSignupsByEvent(db, ev.id),
    listResultsByEvent(db, ev.id),
  ]);
  const missing: string[] = ['absentees', 'completedAt'];
  const raceResults = ev.type === 'race' && results.length ? results : null;
  if (ev.type === 'race' && !results.length) missing.push('raceResults');
  return {
    language: 'zh-CN',
    grouping: {
      title: ev.title,
      type: ev.type,
      dungeon: ev.dungeon || '',
      startsAtUtc: ev.starts_at_utc ?? null,
      maxSlots: ev.max_slots,
    },
    timeline: {
      // events.created_at is a datetime('now') text stamp; the raw
      // value rides along as the package's creation fact.
      createdAt: (ev as unknown as { created_at?: string }).created_at ?? null,
      startsAtUtc: ev.starts_at_utc ?? null,
      reminderSentAt: ev.reminder_sent_at ?? null,
      completedAt: null,
    },
    attendance: {
      seatedCount: seats.length,
      capacity: ev.max_slots,
      emptySeats: Math.max(0, ev.max_slots - seats.length),
      readyCount: seats.filter((r) => r.ready_at).length,
      seats: seats.map((r) => ({
        nickname: r.nickname,
        role: r.role,
        weapon: r.weapon,
        ready: !!r.ready_at,
      })),
    },
    results: raceResults
      ? raceResults.map((r) => ({
        teamName: r.team_name, members: r.members, timeMs: r.time_ms, note: r.note,
      }))
      : null,
    missing,
  };
}

export type GenerateRecapResult =
  | { ok: true; row: RecapRow }
  | { ok: false; errorCode: 'recapDailyLimit' | 'recapProviderFailed' };

/** Run the generation pipeline for one completed grouping.
 *  `provider` is injectable for tests (the harness's fake); in
 *  production it resolves from env, and callers have already
 *  established it is non-null (the not-enabled state never reaches
 *  here). Regeneration overwrites the stored recap in place and
 *  bumps its version (recaps repository). */
export async function generateRecap(
  db: D1Database,
  env: Env,
  ev: EventRow,
  actorUserId: number,
  provider?: RecapProvider | null,
): Promise<GenerateRecapResult> {
  const prov = provider === undefined ? recapProviderFromEnv(env) : provider;
  if (!prov) return { ok: false, errorCode: 'recapProviderFailed' };
  const nowMs = Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  const limits = await getEffectiveLimits(db, { userId: actorUserId, guildId: ev.tenant });
  const used = await getAiRecapsUsedToday(db, ev.tenant, nowMs);
  if (used >= limits.aiRecapsPerDay) return { ok: false, errorCode: 'recapDailyLimit' };
  const pkg = await assembleRecapPackage(db, ev);
  // Meter BEFORE the call: every attempt that reaches the provider
  // is a provider call, success or failure — that call is the cost.
  await recordAiRecapUse(db, ev.tenant, nowMs);
  try {
    const paragraphs = await prov.generate(pkg);
    const clean = paragraphs.map((p) => String(p || '').trim()).filter(Boolean).slice(0, 8);
    if (!clean.length) throw new Error('recap provider returned no paragraphs');
    await upsertRecapReady(db, {
      tenant: ev.tenant,
      eventId: ev.id,
      paragraphsJson: JSON.stringify(clean),
      snapshotJson: JSON.stringify(summarizePackage(pkg)),
      provider: prov.id,
      generatedByUserId: actorUserId,
      atSec: nowSec,
    });
  } catch (e) {
    const message = (e instanceof Error ? e.message : String(e)).slice(0, 200);
    await upsertRecapFailed(db, {
      tenant: ev.tenant, eventId: ev.id, generatedByUserId: actorUserId,
      error: message, atSec: nowSec,
    }).catch(() => {});
    return { ok: false, errorCode: 'recapProviderFailed' };
  }
  const row = await getRecapByEvent(db, ev.id);
  if (!row) return { ok: false, errorCode: 'recapProviderFailed' };
  return { ok: true, row };
}

/** Paragraphs of a stored recap row ([] when the row holds none). */
export function recapParagraphs(row: RecapRow): string[] {
  try {
    const v = JSON.parse(row.paragraphs_json) as unknown;
    return Array.isArray(v) ? v.map((p) => String(p || '')).filter(Boolean) : [];
  } catch { return []; }
}

/** Snapshot summary of a stored recap row (null when unparseable). */
export function recapSnapshot(row: RecapRow): RecapSnapshotSummary | null {
  try {
    const v = JSON.parse(row.snapshot_json) as RecapSnapshotSummary;
    return v && typeof v === 'object' ? v : null;
  } catch { return null; }
}
