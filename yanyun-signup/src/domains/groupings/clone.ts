/* Clone-a-grouping ("run it again"): the seat plan and the default
 * start for copying an existing car into a new one. The resolver in
 * graphql.ts owns gating and writes; this module owns the two pure
 * decisions so they can be unit-tested without a database.
 *
 * Seat rules (the #124 roster-only closure, applied to copies):
 * copied seats are re-resolved through the same chains a fresh
 * create would use — never copied blind, never let in through a
 * side door.
 *  - A seat carrying an identity stamp (signups.discord_id) belongs
 *    to a known platform person: the copied name is that person's
 *    CURRENT identity-chain name (the name lock follows Discord
 *    renames), and the stamp carries over. When the identity chain
 *    resolves nothing for the stamp anymore (the person left every
 *    surface the chain reads), the stored name is frozen as-is and
 *    the stamp still carries — the same freeze the seat-table edit
 *    rewrite applies to unresolvable stamps.
 *  - A seat without a stamp is planned exactly like a create-time
 *    pre-seat: resolveSeatName (identity chain, then the game-name
 *    roster) rewrites it to the resolved roster/identity name, and
 *    resolution alone never stamps it. A name resolving to NOBODY
 *    cannot be copied (there is no whole-create rejection here —
 *    the clone itself is legitimate), so the seat is skipped and
 *    its name is reported back to the operator.
 * Visitor seats keep their is_visitor marker; their stamps follow
 * the stamped rule above (an ally visitor's identity usually does
 * not resolve in this guild, so the freeze path is the norm).
 * Ready marks are NOT copied: a new car starts with nobody ready.
 * Custom-field ANSWERS are not copied either — they belong to the
 * old car's signup act; only the field DEFINITIONS carry over. */
import { identityNameForDiscordId, resolveSeatName } from '../identity/index.ts';
import { isValidIanaTz, tzOffsetMinutes, CAR_HOME_TZ_FALLBACK } from './car-tz.ts';

export interface CloneSeatRow {
  nickname: string;
  uid?: string;
  role?: string;
  weapon?: string;
  team_name?: string | null;
  members?: string | null;
  note?: string | null;
  discord_id?: string | null;
  is_visitor?: number | null;
}

export interface CloneSeatPlanItem {
  nickname: string;
  weapon: string;
  role: string;
  team_name: string;
  members: string;
  note: string;
  discord_id: string | null;
  is_visitor: number;
}

export async function planCloneSeats(
  db: D1Database, slug: string, rows: CloneSeatRow[],
): Promise<{ seats: CloneSeatPlanItem[]; skippedNames: string[] }> {
  const seats: CloneSeatPlanItem[] = [];
  const skippedNames: string[] = [];
  const resolvedCache = new Map<string, { discordId: string | null; name: string } | null>();
  const identityCache = new Map<string, string>();
  for (const row of rows || []) {
    const stored = String(row.nickname || '').slice(0, 30);
    if (!stored) continue;
    const base = {
      weapon: String(row.weapon || ''), role: String(row.role || ''),
      team_name: String(row.team_name || ''), members: String(row.members || ''),
      note: String(row.note || ''), is_visitor: row.is_visitor ? 1 : 0,
    };
    const stamp = row.discord_id ? String(row.discord_id) : null;
    if (stamp) {
      if (!identityCache.has(stamp)) {
        identityCache.set(stamp, (await identityNameForDiscordId(db, stamp, slug).catch(() => '')).slice(0, 30));
      }
      const current = identityCache.get(stamp) || '';
      seats.push({ ...base, nickname: current || stored, discord_id: stamp });
      continue;
    }
    if (!resolvedCache.has(stored)) {
      resolvedCache.set(stored, await resolveSeatName(db, slug, stored).catch(() => null));
    }
    const resolved = resolvedCache.get(stored);
    if (!resolved) {
      if (!skippedNames.includes(stored)) skippedNames.push(stored);
      continue;
    }
    seats.push({ ...base, nickname: resolved.name, discord_id: null });
  }
  return { seats, skippedNames };
}

/* ---- Default start for the clone dialog ----
 * The clone keeps the source car's time-of-day and weekday in the
 * OPERATOR's timezone (ctx.tz — the frame the operator sees the car
 * in) and moves the date to the nearest future day with that same
 * weekday: the same weekday this week when its time is still ahead,
 * otherwise next week's. A timeless source car defaults to 20:00
 * (the create form's default hour) today, or tomorrow when today's
 * 20:00 has already passed. */

interface ZonedParts { year: number; month: number; day: number; weekday: number; hour: number; minute: number; second: number }

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function zonedParts(epochSec: number, tz: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric',
    weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(new Date(epochSec * 1000))) parts[p.type] = p.value;
  return {
    year: Number(parts.year), month: Number(parts.month), day: Number(parts.day),
    weekday: WEEKDAY_INDEX[parts.weekday] ?? 0,
    hour: parts.hour === '24' ? 0 : Number(parts.hour),
    minute: Number(parts.minute), second: Number(parts.second),
  };
}

/* The UTC instant of one wall-clock reading in one zone: guess the
 * reading as UTC, take the zone offset at the guess, subtract, then
 * re-check the offset at the result (a DST seam between the two
 * readings is the only way the first pass is off). */
function zonedToUtc(year: number, month: number, day: number, hour: number, minute: number, second: number, tz: string): number {
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second) / 1000;
  let utc = asUtc - tzOffsetMinutes(asUtc, tz) * 60;
  const again = asUtc - tzOffsetMinutes(utc, tz) * 60;
  if (again !== utc) utc = again;
  return utc;
}

export function nextCloneDefaultStart(srcUtc: number | null | undefined, nowSec: number, tzRaw: string): number {
  const tz = isValidIanaTz(tzRaw) ? tzRaw : CAR_HOME_TZ_FALLBACK;
  const nowParts = zonedParts(nowSec, tz);
  const addDays = (p: ZonedParts, days: number) => {
    const d = new Date(Date.UTC(p.year, p.month - 1, p.day + days));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
  };
  if (srcUtc) {
    const src = zonedParts(srcUtc, tz);
    let delta = (src.weekday - nowParts.weekday + 7) % 7;
    let date = addDays(nowParts, delta);
    let utc = zonedToUtc(date.year, date.month, date.day, src.hour, src.minute, src.second, tz);
    if (utc <= nowSec) {
      delta += 7;
      date = addDays(nowParts, delta);
      utc = zonedToUtc(date.year, date.month, date.day, src.hour, src.minute, src.second, tz);
    }
    return utc;
  }
  let utc = zonedToUtc(nowParts.year, nowParts.month, nowParts.day, 20, 0, 0, tz);
  if (utc <= nowSec) {
    const date = addDays(nowParts, 1);
    utc = zonedToUtc(date.year, date.month, date.day, 20, 0, 0, tz);
  }
  return utc;
}
