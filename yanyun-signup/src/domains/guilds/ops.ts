/* guilds domain service: the premium ops engine (T2) — P8 targeted
 * nudges, P11 churn warnings, P12 season rollover, P14 contribution
 * points. All four engines read platform facts through repositories
 * only (groupings / identity barrels and this file's own ops
 * repositories); no engine invents its own copy of attendance.
 *
 * P8 vs P7: P7 (smart reminders, shipped) nags members who HAVE
 * signed up but not readied up. P8 targets members who have NOT
 * signed up for a specific upcoming car at all, segmented by the
 * school/role the car still lacks or by how long they have been
 * away. Preview first (count + names), then an explicit admin send.
 *
 * Frequency control (P8): the platform's broadcast discipline is
 * "daily caps judged from stored rows" (announcements do exactly
 * this with usage counters). Nudge sends ARE rows (ops_nudge_sends),
 * and both caps below are judged from those rows:
 *   - at most NUDGE_DAILY_LIMIT sends per guild per UTC day;
 *   - at most one send per car per NUDGE_EVENT_COOLDOWN_SEC.
 *
 * P11 thresholds live in ONE place (the CHURN_* constants below):
 *   - Baseline: a member active enough to have a habit worth losing
 *     — at least CHURN_BASELINE_MIN participations across the four
 *     baseline weeks (the month before the recent window). Members
 *     below this were never regulars; flagging them would cry wolf
 *     on every casual.
 *   - Drop: recent-window participation at or below
 *     CHURN_DROP_RATIO of baseline — a halving sustained over a
 *     full product month, not one missed week.
 *   - Silence: CHURN_MISS_STREAK consecutive most-recent completed
 *     cars missed — three straight no-shows reads as disengagement
 *     even when the window math is borderline.
 * The engine only PRODUCES the officer watchlist with evidence; it
 * never messages or removes anyone (officers reach out themselves).
 *
 * P14: points only. Actions are real platform events (attendance at
 * a completed car, leading a completed car, becoming a mentor on a
 * pairing). The ledger is append-only with a unique dedupe key, so
 * sync is idempotent; points freeze at accrual time. NO historical
 * backfill: a guild's accrual watermark is stamped on first use and
 * only events starting at/after it can ever credit. There is no
 * goods / donation / withdrawal concept anywhere (F20 stays cut). */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { weekWindowUtc } from '../platform/index.ts';
import {
  listEventsInWindow, listSignupsByEvent, listGroupingTemplates,
  insertGroupingTemplate, getEventRowByTenant, postWebhook,
} from '../groupings/index.ts';
import type { EventRow } from '../groupings/index.ts';
import { listGuildMembers, getUsernameRow } from '../identity/index.ts';
import { pushTokensForUsers, sendExpoPush } from '../platform/push.ts';
import {
  opsNudgeSends, seasonRollovers, contributionRules, contributionEntries,
} from './schema.ts';
import { getTenantRow } from './tenants.ts';
import { getSettingValue, setSettingValue } from './settings.ts';
import { listPairingsByTenant } from './recruit.ts';

const col = (name: string) => sql.identifier(name);
const nowSec = () => Math.floor(Date.now() / 1000);
function metaOf(r: unknown): { changes: number; last_row_id: number } {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

/* ================= shared member-name resolution ==================
 * The stats.ts rule, shared by every ops list: roster nick, then
 * roster global name, then the member's own signup nickname, then
 * the account username, then the raw id. */
export async function resolveMemberNames(
  db: D1Database, slug: string, signupNick: Map<string, string>,
): Promise<(discordId: string) => Promise<string>> {
  const roster = await listGuildMembers(db, slug).catch(() => []);
  const rosterName = new Map<string, string>();
  for (const m of roster || []) {
    const name = (m.nick || '').trim() || (m.global_name || '').trim();
    if (name) rosterName.set(String(m.discord_id), name);
  }
  return async (did: string) => {
    const fromRoster = rosterName.get(did);
    if (fromRoster) return fromRoster;
    const fromSeat = signupNick.get(did);
    if (fromSeat) return fromSeat;
    const user = await getUsernameRow(db, did).catch(() => null);
    return (user && user.username) || did;
  };
}

/* ============================ P8 nudges ========================== */

export const NUDGE_DAILY_LIMIT = 3;
export const NUDGE_EVENT_COOLDOWN_SEC = 24 * 3600;
/** Away-days threshold for the LAPSED segment: two product weeks
 *  without a single participation (or never) counts as lapsed. */
export const NUDGE_LAPSED_DAYS = 14;

export type NudgeSegmentKind = 'all' | 'school' | 'role' | 'lapsed';
export const NUDGE_SEGMENT_KINDS: NudgeSegmentKind[] = ['all', 'school', 'role', 'lapsed'];

export interface NudgeCandidate {
  discordId: string;
  displayName: string;
  lastParticipationAt: number | null;
  knownWeapon: string;
  knownRole: string;
}

export interface NudgePreview {
  event: EventRow;
  candidates: NudgeCandidate[];
  sendsToday: number;
  dailyRemaining: number;
  cooldownUntil: number | null;
}

/* Per-member participation facts over the guild's whole recorded
 * history (events are few per guild; stats.ts reads the same way):
 * last participation instant, latest known weapon/role stamps. */
interface MemberFacts {
  lastAt: number | null;
  weapon: string;
  role: string;
}

async function memberFacts(db: D1Database, slug: string): Promise<Map<string, MemberFacts>> {
  const [spanStart] = weekWindowUtc(-52);
  const [, spanEnd] = weekWindowUtc(4);
  const events = (await listEventsInWindow(db, slug, spanStart, spanEnd))
    .filter((e) => e.status !== 'draft');
  const facts = new Map<string, MemberFacts>();
  // Oldest first so later seats overwrite weapon/role with fresher stamps.
  const ordered = [...events].sort((a, b) => (a.starts_at_utc ?? 0) - (b.starts_at_utc ?? 0));
  for (const ev of ordered) {
    const seats = await listSignupsByEvent(db, ev.id);
    for (const seat of seats) {
      const did = seat.discord_id ? String(seat.discord_id) : '';
      if (!did) continue;
      const f = facts.get(did) || { lastAt: null, weapon: '', role: '' };
      if (ev.starts_at_utc != null && (f.lastAt == null || ev.starts_at_utc > f.lastAt)) {
        f.lastAt = ev.starts_at_utc;
      }
      if (seat.weapon) f.weapon = String(seat.weapon);
      if (seat.role) f.role = String(seat.role);
      facts.set(did, f);
    }
  }
  return facts;
}

export function filterNudgeCandidates(
  members: { discordId: string; displayName: string }[],
  signedIds: Set<string>,
  facts: Map<string, MemberFacts>,
  kind: NudgeSegmentKind,
  value: string,
  atSec: number,
): NudgeCandidate[] {
  const out: NudgeCandidate[] = [];
  for (const m of members) {
    if (signedIds.has(m.discordId)) continue; // already signed up: P7's job, not P8's
    const f = facts.get(m.discordId) || { lastAt: null, weapon: '', role: '' };
    if (kind === 'school' && value && !f.weapon.startsWith(value)) continue;
    if (kind === 'role' && value && f.role !== value) continue;
    if (kind === 'lapsed') {
      const away = f.lastAt == null ? Infinity : atSec - f.lastAt;
      if (away < NUDGE_LAPSED_DAYS * 86400) continue;
    }
    out.push({
      discordId: m.discordId, displayName: m.displayName,
      lastParticipationAt: f.lastAt, knownWeapon: f.weapon, knownRole: f.role,
    });
  }
  out.sort((a, b) => a.displayName.localeCompare(b.displayName, 'zh-Hans-CN')
    || (a.discordId < b.discordId ? -1 : 1));
  return out;
}

async function guildMemberList(db: D1Database, slug: string) {
  const rows = await listGuildMembers(db, slug).catch(() => []);
  const out: { discordId: string; displayName: string }[] = [];
  for (const r of rows || []) {
    const displayName = String(r.nick || '').trim() || String(r.global_name || '').trim();
    out.push({ discordId: String(r.discord_id), displayName: displayName || String(r.discord_id) });
  }
  return out;
}

async function listNudgeSends(db: D1Database, slug: string, sinceSec: number) {
  const dbi = createDb(db);
  const rows = await dbi.all<any>(
    sql`SELECT * FROM ${opsNudgeSends} WHERE ${col('tenant')} = ${slug} AND ${col('sent_at')} >= ${sinceSec} ORDER BY ${col('id')} DESC`,
  );
  return rows || [];
}

function utcDayStart(atSec: number): number {
  const d = new Date(atSec * 1000);
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000);
}

export async function previewTargetedNudge(
  db: D1Database, slug: string, eventId: number,
  kind: NudgeSegmentKind, value: string, atSec: number = nowSec(),
): Promise<NudgePreview | null> {
  const event = await getEventRowByTenant(db, eventId, slug).catch(() => null);
  if (!event) return null;
  const seats = await listSignupsByEvent(db, eventId);
  const signedIds = new Set(seats.map((s) => String(s.discord_id || '')).filter(Boolean));
  const facts = await memberFacts(db, slug);
  const candidates = filterNudgeCandidates(
    await guildMemberList(db, slug), signedIds, facts, kind, value, atSec,
  );
  const sendsToday = (await listNudgeSends(db, slug, utcDayStart(atSec))).length;
  const eventSends = await listNudgeSends(db, slug, atSec - NUDGE_EVENT_COOLDOWN_SEC);
  const lastForEvent = eventSends.find((r) => Number(r.event_id) === eventId);
  return {
    event, candidates, sendsToday,
    dailyRemaining: Math.max(0, NUDGE_DAILY_LIMIT - sendsToday),
    cooldownUntil: lastForEvent ? Number(lastForEvent.sent_at) + NUDGE_EVENT_COOLDOWN_SEC : null,
  };
}

export type NudgeSendOutcome =
  | { ok: true; recipientCount: number; webhookSent: boolean; pushAttempted: number }
  | { ok: false; code: 'eventNotFound' | 'noCandidates' | 'nudgeDailyLimit' | 'nudgeCooldown' };

/** Send one targeted nudge. The send row is written FIRST (it is
 *  the frequency record); delivery is best-effort over the existing
 *  channels — the guild Discord webhook (mentions) and Expo push —
 *  exactly like departure reminders. Message copy is composed by
 *  the caller (GraphQL layer) so all text stays in the i18n catalog. */
export async function sendTargetedNudge(
  db: D1Database, slug: string, eventId: number,
  kind: NudgeSegmentKind, value: string,
  sentBy: string, message: string, expoBase: unknown,
  atSec: number = nowSec(),
): Promise<NudgeSendOutcome> {
  const preview = await previewTargetedNudge(db, slug, eventId, kind, value, atSec);
  if (!preview) return { ok: false, code: 'eventNotFound' };
  if (!preview.candidates.length) return { ok: false, code: 'noCandidates' };
  if (preview.dailyRemaining <= 0) return { ok: false, code: 'nudgeDailyLimit' };
  if (preview.cooldownUntil != null && preview.cooldownUntil > atSec) {
    return { ok: false, code: 'nudgeCooldown' };
  }
  const ids = preview.candidates.map((c) => c.discordId);
  const dbi = createDb(db);
  await dbi.run(
    sql`INSERT INTO ${opsNudgeSends} (${col('tenant')}, ${col('event_id')}, ${col('segment_kind')}, ${col('segment_value')}, ${col('recipient_count')}, ${col('recipient_ids')}, ${col('sent_by')}, ${col('sent_at')})
        VALUES (${slug}, ${eventId}, ${kind}, ${value}, ${ids.length}, ${JSON.stringify(ids)}, ${sentBy}, ${atSec})`,
  );
  let webhookSent = false;
  const tenant = await getTenantRow(db, slug).catch(() => null);
  const webhook = String(tenant?.discord_webhook || '').trim();
  if (webhook) {
    const res = await postWebhook(webhook, message, ids).catch(() => null);
    webhookSent = !!(res && (res as any).ok !== false);
  }
  let pushAttempted = 0;
  try {
    const tokens = await pushTokensForUsers(db, ids);
    const messages: any[] = [];
    for (const [did, toks] of tokens) {
      for (const to of toks) {
        messages.push({ to, title: String(tenant?.guild_name || slug), body: message, data: { kind: 'targeted_nudge', eventId } });
        void did;
      }
    }
    pushAttempted = messages.length;
    if (messages.length) await sendExpoPush(db, messages, expoBase);
  } catch { /* push is best-effort, like every reminder beat */ }
  return { ok: true, recipientCount: ids.length, webhookSent, pushAttempted };
}

/* ============================ P11 churn ========================== */

export const CHURN_BASELINE_MIN = 2;
export const CHURN_DROP_RATIO = 0.5;
export const CHURN_MISS_STREAK = 3;
export const CHURN_RECENT_WEEKS = 4;
export const CHURN_BASELINE_WEEKS = 4;
export const CHURN_STREAK_SPAN = 6;

export interface ChurnFacts {
  discordId: string;
  baselineCount: number;
  recentCount: number;
  missStreak: number;
  lastParticipationAt: number | null;
}

/** Pure rule (exported for deterministic harness checks): a member
 *  is at risk when they HAD a habit (baseline >= CHURN_BASELINE_MIN)
 *  and either their recent participation halved-or-worse, or they
 *  missed the last CHURN_MISS_STREAK completed cars in a row. */
export function evaluateChurnRisk(f: ChurnFacts): boolean {
  if (f.baselineCount < CHURN_BASELINE_MIN) return false;
  if (f.recentCount <= f.baselineCount * CHURN_DROP_RATIO) return true;
  if (f.missStreak >= CHURN_MISS_STREAK) return true;
  return false;
}

export interface ChurnRisk extends ChurnFacts { displayName: string }

export async function computeChurnRisks(
  db: D1Database, slug: string, atSec: number = nowSec(),
): Promise<ChurnRisk[]> {
  void atSec;
  const totalWeeks = CHURN_RECENT_WEEKS + CHURN_BASELINE_WEEKS;
  const [spanStart] = weekWindowUtc(-(totalWeeks - 1));
  const [, spanEnd] = weekWindowUtc(0);
  const [recentStart] = weekWindowUtc(-(CHURN_RECENT_WEEKS - 1));
  const events = (await listEventsInWindow(db, slug, spanStart, spanEnd))
    .filter((e) => e.status !== 'draft' && e.starts_at_utc != null);
  const baseline = new Map<string, number>();
  const recent = new Map<string, number>();
  const lastAt = new Map<string, number>();
  const signupNick = new Map<string, string>();
  const completedDesc = events
    .filter((e) => e.status === 'completed')
    .sort((a, b) => (b.starts_at_utc ?? 0) - (a.starts_at_utc ?? 0))
    .slice(0, CHURN_STREAK_SPAN);
  const streakSets: Set<string>[] = [];
  for (const ev of events) {
    const seats = await listSignupsByEvent(db, ev.id);
    const at = ev.starts_at_utc ?? 0;
    for (const seat of seats) {
      const did = seat.discord_id ? String(seat.discord_id) : '';
      if (!did) continue;
      if (seat.nickname && !signupNick.has(did)) signupNick.set(did, String(seat.nickname));
      if (at >= recentStart) recent.set(did, (recent.get(did) || 0) + 1);
      else baseline.set(did, (baseline.get(did) || 0) + 1);
      if (!lastAt.has(did) || at > (lastAt.get(did) ?? 0)) lastAt.set(did, at);
    }
  }
  for (const ev of completedDesc) {
    const seats = await listSignupsByEvent(db, ev.id);
    streakSets.push(new Set(seats.map((s) => String(s.discord_id || '')).filter(Boolean)));
  }
  const resolve = await resolveMemberNames(db, slug, signupNick);
  const risks: ChurnRisk[] = [];
  const ids = new Set([...baseline.keys(), ...recent.keys()]);
  for (const did of ids) {
    let missStreak = 0;
    for (const set of streakSets) {
      if (set.has(did)) break;
      missStreak += 1;
    }
    const facts: ChurnFacts = {
      discordId: did,
      baselineCount: baseline.get(did) || 0,
      recentCount: recent.get(did) || 0,
      missStreak,
      lastParticipationAt: lastAt.get(did) ?? null,
    };
    if (evaluateChurnRisk(facts)) {
      risks.push({ ...facts, displayName: await resolve(did) });
    }
  }
  // Worst first: vanished (recent 0) before faded, then longest silence.
  risks.sort((a, b) => (a.recentCount - b.recentCount)
    || (b.missStreak - a.missStreak)
    || ((a.lastParticipationAt ?? 0) - (b.lastParticipationAt ?? 0))
    || a.displayName.localeCompare(b.displayName, 'zh-Hans-CN'));
  return risks;
}

/* ====================== P12 season rollover ====================== */

export interface RolloverPlan {
  targetSeasonKey: string;
  pendingTemplateIds: number[];
  pendingNames: string[];
  totalTemplates: number;
  alreadyCopied: number;
}

/** The dry-run: which templates would be copied forward into the
 *  target season. A template counts as copied when a row with the
 *  same name already carries the target season key. */
export function planRollover(
  templates: { id: number; name: string; season_key?: string | null }[],
  targetSeasonKey: string,
): RolloverPlan {
  const copiedNames = new Set(
    templates.filter((t) => (t.season_key || '') === targetSeasonKey).map((t) => t.name),
  );
  const pending = templates.filter((t) => (t.season_key || '') !== targetSeasonKey && !copiedNames.has(t.name));
  return {
    targetSeasonKey,
    pendingTemplateIds: pending.map((t) => t.id),
    pendingNames: pending.map((t) => t.name),
    totalTemplates: templates.length,
    alreadyCopied: copiedNames.size,
  };
}

export interface RolloverReport extends RolloverPlan {
  rolloverId: number;
  gearTagging: 'skipped';
  thresholdRecalc: 'skipped';
}

export async function executeSeasonRollover(
  db: D1Database, slug: string, targetSeasonKey: string,
  fromSeasonKey: string, createdBy: string, atSec: number = nowSec(),
): Promise<RolloverReport> {
  const templates = await listGroupingTemplates(db, slug);
  const plan = planRollover(templates as any, targetSeasonKey);
  const byId = new Map(templates.map((t) => [t.id, t]));
  let copied = 0;
  for (const id of plan.pendingTemplateIds) {
    const t = byId.get(id);
    if (!t) continue;
    await insertGroupingTemplate(db, {
      tenant: slug, name: t.name, type: t.type, title: t.title,
      dungeon: t.dungeon, max_slots: t.max_slots,
      start_days_ahead: t.start_days_ahead, start_minutes: t.start_minutes,
      creator_discord_id: t.creator_discord_id,
      created_at: atSec, updated_at: atSec, season_key: targetSeasonKey,
    });
    copied += 1;
  }
  // Gear carries no season concept in the gear domain today, and the
  // P9 threshold board is not merged yet: both steps are reported
  // as skipped in the stored report rather than silently pretended.
  const report: RolloverReport = {
    ...plan, rolloverId: 0, gearTagging: 'skipped', thresholdRecalc: 'skipped',
  };
  const dbi = createDb(db);
  const r = await dbi.run(
    sql`INSERT INTO ${seasonRollovers} (${col('tenant')}, ${col('from_season_key')}, ${col('to_season_key')}, ${col('templates_copied')}, ${col('report_json')}, ${col('created_by')}, ${col('created_at')})
        VALUES (${slug}, ${fromSeasonKey}, ${targetSeasonKey}, ${copied}, ${JSON.stringify({ ...report, templatesCopied: copied })}, ${createdBy}, ${atSec})`,
  );
  report.rolloverId = metaOf(r).last_row_id;
  return { ...report, pendingTemplateIds: plan.pendingTemplateIds.slice(0, copied) };
}

export async function lastRollover(db: D1Database, slug: string) {
  const dbi = createDb(db);
  const row = await dbi.get<any>(
    sql`SELECT * FROM ${seasonRollovers} WHERE ${col('tenant')} = ${slug} ORDER BY ${col('id')} DESC LIMIT 1`,
  ).catch(() => null);
  return row ?? null;
}

/* ====================== P14 contribution points ================== */

export const CONTRIBUTION_ACTIONS = [
  { key: 'attendance', defaultPoints: 10 },
  { key: 'leading', defaultPoints: 20 },
  { key: 'mentoring', defaultPoints: 15 },
] as const;
export type ContributionActionKey = typeof CONTRIBUTION_ACTIONS[number]['key'];

const WATERMARK_KEY = 'contribution_sync_from';

/** The accrual watermark: stamped once per guild on first use.
 *  Only events starting at/after it can credit — no backfill. */
export async function contributionWatermark(
  db: D1Database, slug: string, atSec: number = nowSec(),
): Promise<number> {
  const raw = await getSettingValue(db, slug, WATERMARK_KEY).catch(() => '');
  const n = Number.parseInt(String(raw || ''), 10);
  if (Number.isFinite(n) && n > 0) return n;
  await setSettingValue(db, slug, WATERMARK_KEY, String(atSec));
  return atSec;
}

export interface ContributionRule {
  actionKey: string;
  points: number;
  enabled: boolean;
}

export async function listContributionRules(
  db: D1Database, slug: string,
): Promise<ContributionRule[]> {
  const dbi = createDb(db);
  const rows = await dbi.all<any>(
    sql`SELECT * FROM ${contributionRules} WHERE ${col('tenant')} = ${slug}`,
  ).catch(() => []);
  const stored = new Map((rows || []).map((r: any) => [String(r.action_key), r]));
  return CONTRIBUTION_ACTIONS.map((a) => {
    const r = stored.get(a.key);
    return {
      actionKey: a.key,
      points: r ? Number(r.points) : a.defaultPoints,
      enabled: r ? Number(r.enabled) !== 0 : true,
    };
  });
}

export async function upsertContributionRule(
  db: D1Database, slug: string, actionKey: string, points: number,
  enabled: boolean, updatedBy: string, atSec: number = nowSec(),
): Promise<boolean> {
  if (!CONTRIBUTION_ACTIONS.some((a) => a.key === actionKey)) return false;
  const clamped = Math.max(0, Math.min(1000, Math.floor(points) || 0));
  const dbi = createDb(db);
  await dbi.run(
    sql`INSERT INTO ${contributionRules} (${col('tenant')}, ${col('action_key')}, ${col('points')}, ${col('enabled')}, ${col('updated_by')}, ${col('updated_at')})
        VALUES (${slug}, ${actionKey}, ${clamped}, ${enabled ? 1 : 0}, ${updatedBy}, ${atSec})
        ON CONFLICT(tenant, action_key) DO UPDATE SET points = ${clamped}, enabled = ${enabled ? 1 : 0}, updated_by = ${updatedBy}, updated_at = ${atSec}`,
  );
  return true;
}

/** Idempotent accrual: scan creditable platform events at/after the
 *  watermark and insert whatever ledger rows are missing. Returns
 *  how many rows were newly credited. Safe to call on every read. */
export async function syncContributionEntries(
  db: D1Database, slug: string, atSec: number = nowSec(),
): Promise<number> {
  const from = await contributionWatermark(db, slug, atSec);
  const rules = new Map((await listContributionRules(db, slug)).map((r) => [r.actionKey, r]));
  const ruleFor = (k: string) => rules.get(k);
  const [, spanEnd] = weekWindowUtc(4);
  const events = (await listEventsInWindow(db, slug, from, spanEnd))
    .filter((e) => e.status === 'completed');
  const dbi = createDb(db);
  let inserted = 0;
  const credit = async (
    discordId: string, actionKey: string, eventId: number | null, dedupeKey: string,
  ) => {
    const rule = ruleFor(actionKey);
    if (!rule || !rule.enabled || rule.points <= 0) return;
    const r = await dbi.run(
      sql`INSERT OR IGNORE INTO ${contributionEntries} (${col('tenant')}, ${col('discord_id')}, ${col('action_key')}, ${col('points')}, ${col('event_id')}, ${col('dedupe_key')}, ${col('created_at')})
          VALUES (${slug}, ${discordId}, ${actionKey}, ${rule.points}, ${eventId}, ${dedupeKey}, ${atSec})`,
    ).catch(() => null);
    if (r) inserted += metaOf(r).changes;
  };
  for (const ev of events) {
    if (ev.creator_discord_id) {
      await credit(String(ev.creator_discord_id), 'leading', ev.id, `leading:${ev.id}:${ev.creator_discord_id}`);
    }
    const seats = await listSignupsByEvent(db, ev.id);
    for (const seat of seats) {
      const did = seat.discord_id ? String(seat.discord_id) : '';
      if (!did) continue;
      await credit(did, 'attendance', ev.id, `attendance:${ev.id}:${did}`);
    }
  }
  // Mentoring credits once per pairing, when the pairing is created
  // at/after the watermark (the pairing IS the platform event).
  const pairings = await listPairingsByTenant(db, slug).catch(() => []);
  for (const p of pairings || []) {
    if (Number(p.created_at) < from) continue;
    await credit(String(p.mentor_discord_id), 'mentoring', null, `mentoring:pairing:${p.id}:${p.mentor_discord_id}`);
  }
  return inserted;
}

export interface ContributionBoardEntry {
  discordId: string;
  displayName: string;
  totalPoints: number;
  entryCount: number;
}

export async function contributionBoard(
  db: D1Database, slug: string,
): Promise<ContributionBoardEntry[]> {
  await syncContributionEntries(db, slug);
  const dbi = createDb(db);
  const rows = await dbi.all<any>(
    sql`SELECT * FROM ${contributionEntries} WHERE ${col('tenant')} = ${slug} ORDER BY ${col('id')} ASC`,
  ).catch(() => []);
  const totals = new Map<string, ContributionBoardEntry>();
  const signupNick = new Map<string, string>();
  for (const r of rows || []) {
    const did = String(r.discord_id);
    const e = totals.get(did) || { discordId: did, displayName: did, totalPoints: 0, entryCount: 0 };
    e.totalPoints += Number(r.points) || 0;
    e.entryCount += 1;
    totals.set(did, e);
  }
  const resolve = await resolveMemberNames(db, slug, signupNick);
  const out = [...totals.values()];
  for (const e of out) e.displayName = await resolve(e.discordId);
  out.sort((a, b) => (b.totalPoints - a.totalPoints)
    || a.displayName.localeCompare(b.displayName, 'zh-Hans-CN')
    || (a.discordId < b.discordId ? -1 : 1));
  return out;
}

export async function myContributionEntries(
  db: D1Database, slug: string, discordId: string,
): Promise<{ totalPoints: number; entries: any[] }> {
  await syncContributionEntries(db, slug);
  const dbi = createDb(db);
  const rows = await dbi.all<any>(
    sql`SELECT * FROM ${contributionEntries} WHERE ${col('tenant')} = ${slug} AND ${col('discord_id')} = ${discordId} ORDER BY ${col('id')} DESC LIMIT 100`,
  ).catch(() => []);
  const entries = rows || [];
  return { totalPoints: entries.reduce((n: number, r: any) => n + (Number(r.points) || 0), 0), entries };
}
