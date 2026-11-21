/* ===================================================
 * Weekly duplicate signup check (join path).
 *
 * Rule: a member who already holds a seat in one grouping must
 * confirm before taking a seat in ANOTHER grouping whose start
 * falls in the same week. The week is the platform's data-semantics
 * week (weekWindowUtcAt: Monday 05:00 Beijing, half-open) — the
 * same frame the grouping lists and the week image bucket cars by,
 * anchored here at the TARGET grouping's start instant.
 *
 * A seat counts when it still exists (leaving deletes the row, so a
 * left seat is simply absent) and its car still exists (disbanding
 * deletes the car and its seats). Draft cars never count: drafts
 * are invisible across the whole surface. The target car itself
 * never counts — re-joining it keeps the legacy behavior.
 * =================================================== */
import { startsAtEpoch, weekWindowUtcAt } from '../platform/index.ts';
import { listBookedCarsByDiscordId, type BookedCarRow } from './signups.ts';

export interface WeekDuplicateCar {
  eventId: number;
  title: string;
  startsEpoch: number;
}

/* Pure decision: given the target car's start instant and the
 * member's booked cars (already resolved to start epochs), return
 * the car the confirmation should name — the earliest-starting
 * other car inside the target's week — or null when the signup may
 * proceed without confirmation. Cars with no resolvable start time
 * belong to no week and never match. */
export function pickWeekDuplicateCar(
  targetStartsEpoch: number,
  targetEventId: number,
  cars: { eventId: number; title: string; startsEpoch: number | null }[],
): WeekDuplicateCar | null {
  const [ws, we] = weekWindowUtcAt(targetStartsEpoch);
  let best: WeekDuplicateCar | null = null;
  for (const c of cars) {
    if (c.eventId === targetEventId) continue;
    if (c.startsEpoch == null) continue;
    if (c.startsEpoch < ws || c.startsEpoch >= we) continue;
    if (!best || c.startsEpoch < best.startsEpoch
      || (c.startsEpoch === best.startsEpoch && c.eventId < best.eventId)) {
      best = { eventId: c.eventId, title: c.title, startsEpoch: c.startsEpoch };
    }
  }
  return best;
}

/* Service form: read the member's booked cars through the signups
 * repository and apply the pure decision. Draft cars are excluded
 * here (their seats are not real bookings); every other status
 * counts, because the seat exists and was never left. */
export async function findWeekDuplicateCar(
  d1: D1Database,
  discordId: string,
  targetEventId: number,
  targetStartsEpoch: number,
): Promise<WeekDuplicateCar | null> {
  const rows: BookedCarRow[] = await listBookedCarsByDiscordId(d1, discordId);
  const cars = rows
    .filter((r) => r.event_status !== 'draft')
    .map((r) => ({
      eventId: Number(r.event_id),
      title: String(r.event_title || ''),
      startsEpoch: startsAtEpoch({ starts_at: r.starts_at, starts_at_utc: r.starts_at_utc }),
    }));
  return pickWeekDuplicateCar(targetStartsEpoch, targetEventId, cars);
}
