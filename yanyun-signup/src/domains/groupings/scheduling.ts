/* ===================================================
 * Scheduling advice engine (Premium T2 — P3/P4/P5/P6/P13).
 *
 * Design law (DESIGN §8 + 解法四原则): ADVICE, NEVER VERDICTS.
 * Every function here only ranks and explains; a human leader
 * always makes the final pick. Nothing in this file seats,
 * invites, moves or removes anyone. Automatic fill-in of a
 * vacated seat is a cut feature and must never appear here.
 *
 * All ranking functions are PURE and DETERMINISTIC: same input,
 * same output (ties break on participation count, then discord
 * id ascending). Every ranked entry carries structured reasons
 * ({key, params}) composed server-side; clients render the keys
 * through backend-issued copy templates — the explanation is
 * part of the product (可解释优先), not decoration.
 *
 * Factor definitions (v1, kept deliberately simple & auditable):
 * - reliability: readyRate = ready seats / past seats in this
 *   guild's non-draft cars (ready_at is the attendance-confirm
 *   stamp). No history reads as NEUTRAL (50), never as bad.
 * - gear readiness: the member owns at least one gear-library
 *   item (the gear domain's existing readiness proxy; the P9
 *   dashboard owns finer thresholds when it lands).
 * - availability: the event start instant falls inside one of
 *   the member's F5 weekly windows (UTC frame, as stored).
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { rotationAdviceRecords } from './schema.ts';
import { listEventsAdmin } from './events.ts';
import { listSignupsByEvent } from './signups.ts';
import { listGuildAvailability, parseAvailabilitySlots } from './availability.ts';
import { listGuildMembers } from '../identity/index.ts';
import { countGearItemRows } from '../gear/index.ts';
import { roleOf } from '../platform/graphql-base.ts';

const col = (name: string) => sql.identifier(name);

export interface AdviceReason { key: string; params: Record<string, string>; }

export interface MemberFacts {
  discordId: string;
  displayName: string;
  role: string;
  weapon: string;
  gearItemCount: number;
  participations: number;
  readyCount: number;
  lastParticipatedAt: number | null;
  availableAtEvent: boolean | null;
}

export const NEUTRAL_RELIABILITY = 50;

export function reliabilityPct(f: MemberFacts): number {
  if (f.participations <= 0) return NEUTRAL_RELIABILITY;
  return Math.round((100 * f.readyCount) / f.participations);
}

function gearReasons(f: MemberFacts, out: AdviceReason[]) {
  if (f.gearItemCount > 0) out.push({ key: 'gearReady', params: { count: String(f.gearItemCount) } });
  else out.push({ key: 'gearUnknown', params: {} });
}
function reliabilityReasons(f: MemberFacts, out: AdviceReason[]) {
  if (f.participations <= 0) out.push({ key: 'noHistory', params: {} });
  else out.push({ key: 'reliable', params: { rate: String(reliabilityPct(f)), count: String(f.participations) } });
}
function availabilityReasons(f: MemberFacts, out: AdviceReason[]) {
  if (f.availableAtEvent === true) out.push({ key: 'available', params: {} });
  else if (f.availableAtEvent === false) out.push({ key: 'unavailable', params: {} });
  else out.push({ key: 'availabilityUnknown', params: {} });
}

const byRank = (a: { score: number; facts: MemberFacts }, b: { score: number; facts: MemberFacts }) =>
  b.score - a.score || b.facts.participations - a.facts.participations
  || (a.facts.discordId < b.facts.discordId ? -1 : a.facts.discordId > b.facts.discordId ? 1 : 0);

/* ---------------- P3: team draft ----------------
 * Greedy seat filling: at each seat, re-score the remaining pool
 * against the roles still uncovered (a healer is worth most while
 * no healer is seated). Needed roles for a car: at least one 奶
 * (healer) when the car has 5+ seats; every other seat prefers 输出. */
export function neededRoles(maxSlots: number): string[] {
  const roles: string[] = [];
  if (maxSlots >= 5) roles.push('奶');
  while (roles.length < maxSlots) roles.push('输出');
  return roles;
}

export function scoreTeamCandidate(f: MemberFacts, uncovered: string[]): { score: number; reasons: AdviceReason[] } {
  const reasons: AdviceReason[] = [];
  let roleScore = 10;
  if (f.role && uncovered.includes(f.role)) { roleScore = f.role === '奶' ? 50 : 40; reasons.push({ key: 'roleNeeded', params: { role: f.role } }); }
  else if (f.role === '随意') { roleScore = 25; reasons.push({ key: 'roleFlex', params: {} }); }
  else if (f.role) { roleScore = 15; reasons.push({ key: 'roleCovered', params: { role: f.role } }); }
  else reasons.push({ key: 'roleUnknown', params: {} });
  const gearScore = f.gearItemCount > 0 ? 20 : 5;
  gearReasons(f, reasons);
  const relScore = Math.round(reliabilityPct(f) / 4); // 0..25
  reliabilityReasons(f, reasons);
  const availScore = f.availableAtEvent === true ? 15 : f.availableAtEvent === false ? 0 : 7;
  availabilityReasons(f, reasons);
  return { score: roleScore + gearScore + relScore + availScore, reasons };
}

export interface DraftSeat { seatIndex: number; role: string; facts: MemberFacts; score: number; reasons: AdviceReason[]; }

export function buildTeamDraft(pool: MemberFacts[], maxSlots: number): DraftSeat[] {
  const remaining = [...pool];
  const uncovered = neededRoles(maxSlots);
  const draft: DraftSeat[] = [];
  for (let seat = 0; seat < maxSlots && remaining.length; seat++) {
    let bestIdx = -1; let best: { score: number; reasons: AdviceReason[] } | null = null; let bestFacts: MemberFacts | null = null;
    for (let i = 0; i < remaining.length; i++) {
      const scored = scoreTeamCandidate(remaining[i], uncovered);
      const cand = { score: scored.score, facts: remaining[i] };
      if (!best || byRank(cand, { score: best.score, facts: bestFacts! }) < 0) { best = scored; bestIdx = i; bestFacts = remaining[i]; }
    }
    const picked = remaining.splice(bestIdx, 1)[0];
    const role = uncovered[0] && picked.role && uncovered.includes(picked.role) ? picked.role : (uncovered[0] || picked.role || '输出');
    const ui = uncovered.indexOf(role); if (ui >= 0) uncovered.splice(ui, 1);
    draft.push({ seatIndex: seat, role, facts: picked, score: best!.score, reasons: best!.reasons });
  }
  return draft;
}

/* ---------------- P4: substitute ranking ----------------
 * For a vacated role: exact role match dominates, then event-time
 * availability, reliability, gear. Recommendation only — the
 * leader taps to invite through the existing seat actions. */
export function rankSubstitutes(pool: MemberFacts[], vacatedRole: string): { facts: MemberFacts; score: number; reasons: AdviceReason[] }[] {
  return pool.map((f) => {
    const reasons: AdviceReason[] = [];
    let roleScore = 5;
    if (vacatedRole && f.role === vacatedRole) { roleScore = 40; reasons.push({ key: 'roleMatch', params: { role: f.role } }); }
    else if (f.role === '随意') { roleScore = 20; reasons.push({ key: 'roleFlex', params: {} }); }
    else if (f.role) reasons.push({ key: 'roleOther', params: { role: f.role } });
    else reasons.push({ key: 'roleUnknown', params: {} });
    const availScore = f.availableAtEvent === true ? 20 : f.availableAtEvent === false ? 0 : 8;
    availabilityReasons(f, reasons);
    const relScore = Math.round(reliabilityPct(f) / 4);
    reliabilityReasons(f, reasons);
    const gearScore = f.gearItemCount > 0 ? 15 : 4;
    gearReasons(f, reasons);
    return { facts: f, score: roleScore + availScore + relScore + gearScore, reasons };
  }).sort(byRank);
}

/* ---------------- P5: rotation ranking ----------------
 * Fairness order for an over-subscribed car: longest wait since
 * last participation (0..40, capped at 30 days), fewest recent
 * (<=4 weeks) participations (0..20), reliability (0..25,
 * neutral 12 without history). Signup order is NOT a factor —
 * first-come is exactly the unfairness this advice replaces. */
export function rankRotation(applicants: MemberFacts[], nowSec: number): { facts: MemberFacts; score: number; reasons: AdviceReason[] }[] {
  return applicants.map((f) => {
    const reasons: AdviceReason[] = [];
    const days = f.lastParticipatedAt == null ? 30 : Math.min(30, Math.max(0, Math.floor((nowSec - f.lastParticipatedAt) / 86400)));
    const waitScore = Math.round((days / 30) * 40);
    reasons.push({ key: 'longestWaiting', params: { days: String(days) } });
    const recentScore = Math.max(0, 20 - 5 * f.participations);
    reasons.push({ key: 'fewRecent', params: { count: String(f.participations) } });
    const relScore = f.participations <= 0 ? 12 : Math.round(reliabilityPct(f) / 4);
    reliabilityReasons(f, reasons);
    return { facts: f, score: waitScore + recentScore + relScore, reasons };
  }).sort((a, b) => b.score - a.score
    || (a.facts.lastParticipatedAt ?? 0) - (b.facts.lastParticipatedAt ?? 0)
    || (a.facts.discordId < b.facts.discordId ? -1 : 1));
}

/* ---------------- P6: best time slots ----------------
 * Aggregate F5 weekly windows into 60-minute buckets; rank by
 * distinct-member coverage. Empty availability => empty list
 * (the surface renders the backend empty-state copy; nothing is
 * invented). */
export interface BestSlot { weekday: number; startMinute: number; endMinute: number; coverCount: number; memberNames: string[]; }

export function rankBestSlots(rows: { displayName: string; slots: { weekday: number; startMinute: number; endMinute: number }[] }[], limit = 3): BestSlot[] {
  const buckets = new Map<string, { weekday: number; startMinute: number; names: Set<string> }>();
  for (const row of rows) {
    for (const s of row.slots) {
      for (let m = Math.floor(s.startMinute / 60) * 60; m + 60 <= s.endMinute; m += 60) {
        const key = s.weekday + ':' + m;
        if (!buckets.has(key)) buckets.set(key, { weekday: s.weekday, startMinute: m, names: new Set() });
        buckets.get(key)!.names.add(row.displayName);
      }
    }
  }
  return [...buckets.values()]
    .map((b) => ({ weekday: b.weekday, startMinute: b.startMinute, endMinute: b.startMinute + 60, coverCount: b.names.size, memberNames: [...b.names].sort() }))
    .sort((a, b) => b.coverCount - a.coverCount || a.weekday - b.weekday || a.startMinute - b.startMinute)
    .slice(0, limit);
}

/* ---------------- P13: cross-car advice ----------------
 * Conflicts: one member seated in two cars whose [start, start+2h)
 * intervals overlap. Moves: for each under-filled car, members
 * seated in NO overlapping car (and not already in this one),
 * ranked by reliability then participation. Advice only. */
export interface CarSnapshot { id: number; title: string; startsAtUtc: number | null; maxSlots: number; seats: { discordId: string; displayName: string }[]; }
const CAR_DURATION_SEC = 2 * 3600;
export function carsOverlap(a: CarSnapshot, b: CarSnapshot): boolean {
  if (a.startsAtUtc == null || b.startsAtUtc == null) return false;
  return a.startsAtUtc < b.startsAtUtc + CAR_DURATION_SEC && b.startsAtUtc < a.startsAtUtc + CAR_DURATION_SEC;
}
export function crossCarConflicts(cars: CarSnapshot[]): { discordId: string; displayName: string; carIds: number[] }[] {
  const byMember = new Map<string, { displayName: string; cars: CarSnapshot[] }>();
  for (const car of cars) for (const seat of car.seats) {
    if (!seat.discordId) continue;
    if (!byMember.has(seat.discordId)) byMember.set(seat.discordId, { displayName: seat.displayName, cars: [] });
    byMember.get(seat.discordId)!.cars.push(car);
  }
  const out: { discordId: string; displayName: string; carIds: number[] }[] = [];
  for (const [discordId, v] of byMember) {
    const ids = new Set<number>();
    for (let i = 0; i < v.cars.length; i++) for (let j = i + 1; j < v.cars.length; j++) {
      if (carsOverlap(v.cars[i], v.cars[j])) { ids.add(v.cars[i].id); ids.add(v.cars[j].id); }
    }
    if (ids.size) out.push({ discordId, displayName: v.displayName, carIds: [...ids].sort((a, b) => a - b) });
  }
  return out.sort((a, b) => (a.discordId < b.discordId ? -1 : 1));
}
export function crossCarMoves(cars: CarSnapshot[], facts: Map<string, MemberFacts>): { carId: number; candidates: { facts: MemberFacts; score: number; reasons: AdviceReason[] }[] }[] {
  const out: { carId: number; candidates: { facts: MemberFacts; score: number; reasons: AdviceReason[] }[] }[] = [];
  for (const car of cars) {
    if (car.seats.length >= car.maxSlots) continue;
    const busy = new Set<string>();
    for (const other of cars) {
      if (other.id === car.id || !carsOverlap(car, other)) continue;
      for (const s of other.seats) busy.add(s.discordId);
    }
    for (const s of car.seats) busy.add(s.discordId);
    const free = [...facts.values()].filter((f) => !busy.has(f.discordId));
    const ranked = free.map((f) => {
      const reasons: AdviceReason[] = [{ key: 'noConflict', params: {} }];
      reliabilityReasons(f, reasons);
      return { facts: f, score: reliabilityPct(f), reasons };
    }).sort(byRank).slice(0, 3);
    if (ranked.length) out.push({ carId: car.id, candidates: ranked });
  }
  return out;
}

/* ---------------- facts builder (DB) ---------------- */

export function availabilityCovers(slots: { weekday: number; startMinute: number; endMinute: number }[], startsAtUtc: number | null): boolean | null {
  if (!slots.length) return null;
  if (startsAtUtc == null) return null;
  const d = new Date(startsAtUtc * 1000);
  const minute = d.getUTCHours() * 60 + d.getUTCMinutes();
  return slots.some((s) => s.weekday === d.getUTCDay() && minute >= s.startMinute && minute < s.endMinute);
}

/** Compose per-member facts for one guild from the underlying
 * records only (roster, past seats, gear library, F5 windows) —
 * deliberately NOT via any premium profile surface. */
export async function buildMemberFacts(d1: D1Database, tenant: string, startsAtUtc: number | null): Promise<MemberFacts[]> {
  const roster = await listGuildMembers(d1, tenant).catch(() => []);
  const events = (await listEventsAdmin(d1, tenant).catch(() => [])).filter((e: any) => e.status !== 'draft');
  const availRows = await listGuildAvailability(d1, tenant).catch(() => []);
  const availById = new Map(availRows.map((r: any) => [String(r.discord_id), parseAvailabilitySlots(r.slots_json)]));
  const agg = new Map<string, { participations: number; readyCount: number; last: number | null; weapon: string; role: string }>();
  for (const ev of events as any[]) {
    const seats = await listSignupsByEvent(d1, ev.id).catch(() => []);
    for (const seat of seats as any[]) {
      const did = seat.discord_id ? String(seat.discord_id) : '';
      if (!did) continue;
      const a = agg.get(did) || { participations: 0, readyCount: 0, last: null, weapon: '', role: '' };
      a.participations += 1;
      if (seat.ready_at) a.readyCount += 1;
      if (ev.starts_at_utc != null && (a.last == null || ev.starts_at_utc > a.last)) a.last = ev.starts_at_utc;
      if (seat.weapon) { a.weapon = seat.weapon; a.role = roleOf(seat.weapon); }
      agg.set(did, a);
    }
  }
  const out: MemberFacts[] = [];
  for (const m of roster as any[]) {
    const did = String(m.discord_id);
    const a = agg.get(did);
    const gearItemCount = await countGearItemRows(d1, did).catch(() => 0);
    out.push({
      discordId: did,
      displayName: String(m.nick || '').trim() || String(m.global_name || '').trim() || did,
      role: a?.role || '', weapon: a?.weapon || '',
      gearItemCount,
      participations: a?.participations || 0,
      readyCount: a?.readyCount || 0,
      lastParticipatedAt: a?.last ?? null,
      availableAtEvent: availabilityCovers(availById.get(did) || [], startsAtUtc),
    });
  }
  return out;
}

/* ---------------- P5 留痕: rotation advice records ----------------
 * A leader explicitly saving a rotation ranking writes ONE record
 * (the ranked snapshot as JSON). Records are never mutated; the
 * audit trail is the list itself. */

export interface RotationAdviceRecordRow { id: number; tenant: string; event_id: number; advice_json: string; created_by: string; created_at: number; }

export async function insertRotationAdviceRecord(d1: D1Database, row: { tenant: string; eventId: number; adviceJson: string; createdBy: string; createdAt: number }): Promise<{ changes: number; last_row_id: number }> {
  const db = createDb(d1);
  const r: any = await db.run(
    sql`INSERT INTO ${rotationAdviceRecords} (${col('tenant')}, ${col('event_id')}, ${col('advice_json')}, ${col('created_by')}, ${col('created_at')}) VALUES (${row.tenant}, ${row.eventId}, ${row.adviceJson}, ${row.createdBy}, ${row.createdAt})`,
  );
  const m = (r as any)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

export async function listRotationAdviceRecords(d1: D1Database, tenant: string, eventId: number): Promise<RotationAdviceRecordRow[]> {
  const db = createDb(d1);
  const rows = await db.all<RotationAdviceRecordRow>(
    sql`SELECT * FROM ${rotationAdviceRecords} WHERE ${col('tenant')} = ${tenant} AND ${col('event_id')} = ${eventId} ORDER BY ${col('id')} DESC`,
  );
  return rows || [];
}
