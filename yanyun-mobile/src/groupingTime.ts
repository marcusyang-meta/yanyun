// Pure date/time helpers for the grouping form's start picker
// (date strip + hour/minute wheels + dual-zone echo line):
// - the strip shows a window of whole local calendar days that always
//   starts no later than today and always contains the selected day;
// - the minute wheel offers the four quarter steps, plus the current
//   value when it sits off-step (an edit's preserved 20:37 must stay
//   representable and can only leave by an explicit scroll choice);
// - the echo restates one instant in US East / US West, each zone's
//   weekday taken from that zone's own calendar (the PR #121 card
//   rule), formatted with Intl in the app locale — no hardcoded
//   weekday or zone names anywhere in the client.

export const ECHO_TZ_EAST = 'America/New_York';
export const ECHO_TZ_WEST = 'America/Los_Angeles';

export const MINUTE_STEPS: readonly number[] = [0, 15, 30, 45];

/** Local midnight at the start of d's calendar day. */
export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Whole calendar days from a to b (b - a), DST-proof via UTC day math. */
export function calendarDayDiff(a: Date, b: Date): number {
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ub - ua) / 86400000);
}

/**
 * The date strip's days: a run of consecutive local calendar days,
 * at least minSpan long, beginning at today (or earlier when the
 * selected day is in the past) and always containing the selected
 * day — an edit whose date sits beyond the default fortnight extends
 * the run instead of losing the date.
 */
export function dateStripDays(today: Date, selected: Date, minSpan = 14): Date[] {
  const base = startOfLocalDay(today);
  const diff = calendarDayDiff(base, selected);
  const first = Math.min(0, diff);
  const last = Math.max(minSpan - 1, diff);
  const days: Date[] = [];
  for (let i = first; i <= last; i++) {
    days.push(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i));
  }
  return days;
}

/** Index of the selected day inside a strip built by dateStripDays. */
export function dateStripIndex(days: Date[], selected: Date): number {
  const target = startOfLocalDay(selected).getTime();
  return days.findIndex((d) => d.getTime() === target);
}

/**
 * The minute wheel's values: the quarter steps, with an off-step
 * current minute inserted in sorted position so the wheel can rest
 * on it. Picking any step drops the off-step entry on the next
 * render (the list is derived from the current value).
 */
export function minuteWheelValues(minute: number): number[] {
  if (MINUTE_STEPS.includes(minute)) return [...MINUTE_STEPS];
  return [...MINUTE_STEPS, minute].sort((a, b) => a - b);
}

/** Weekday + HH:MM wall clock of one instant in one IANA zone. */
export function zonedEchoParts(instant: Date, timeZone: string, locale: string): { weekday: string; time: string } {
  const fmt = new Intl.DateTimeFormat(locale, {
    timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(instant)) parts[p.type] = p.value;
  // Some ICU builds report midnight as hour 24 under h23; normalize
  // (same guard as the backend's zoned parts).
  const hour = parts.hour === '24' ? '00' : parts.hour;
  return { weekday: parts.weekday ?? '', time: `${hour}:${parts.minute}` };
}
