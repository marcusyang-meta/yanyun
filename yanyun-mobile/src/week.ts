// Time/week-boundary logic with the same rules as Web format.ts (MVP fixes zh-CN formatting):
// - startsAt's three formats (epoch-seconds string / UTC text / ISO) are all parsed with UTC semantics;
// - week boundary = Monday 05:00 Beijing time; filtering is half-open [start, end);
// - week labels show start/end directly, with the displayed end minus 1 minute (display only).

export function parseStartsAt(startsAt?: string | null): Date | null {
  if (startsAt == null) return null;
  const s = String(startsAt).trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) {
    const d = new Date(parseInt(s, 10) * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  let candidate = s;
  if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(s) && /[\sT]\d/.test(s)) {
    candidate = s.replace(' ', 'T') + 'Z';
  }
  const d = new Date(candidate);
  return isNaN(d.getTime()) ? null : d;
}

// Week boundary: Monday 05:00 Beijing time (matches the server).
// Absolute-instant arithmetic, the same shape as the server's
// weekWindowUtc (yanyun-signup/src/domains/platform/blocks.ts): Beijing
// keeps no DST, so read the current instant as Beijing wall clock via a
// fixed +8h shift, take that Monday 05:00, and convert back by the same
// fixed shift — no viewer-local offset anywhere. The old round-trip
// converted both endpoints back with *now*'s getTimezoneOffset(), which
// is wrong in a DST transition week: the far endpoint falls under the
// other offset (fall-back week showed the next boundary at 13:59 PST
// instead of 12:59). Keep in lockstep with yanyun-web/src/lib/format.ts.
export function getWeekRange(weekOffset: number): { start: Date; end: Date } {
  const nowSec = Math.floor(Date.now() / 1000);
  const cst = nowSec + 8 * 3600; // the instant, read as Beijing wall clock
  const d = new Date(cst * 1000);
  const dayStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000;
  let monday = dayStart - ((d.getUTCDay() + 6) % 7) * 86400 + 5 * 3600;
  if (cst < monday) monday -= 7 * 86400;
  const startSec = monday - 8 * 3600 + (weekOffset | 0) * 7 * 86400;
  return { start: new Date(startSec * 1000), end: new Date((startSec + 7 * 86400) * 1000) };
}

const rangePointFmt = new Intl.DateTimeFormat('zh-CN', {
  month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
const fullFmt = new Intl.DateTimeFormat('zh-CN', {
  month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  weekday: 'short',
});

export function fmtRangePoint(d: Date): string {
  return rangePointFmt.format(d);
}

export function weekRangeLabel(weekOffset: number): string {
  const { start, end } = getWeekRange(weekOffset);
  const shownEnd = new Date(end.getTime() - 60000);
  return `${fmtRangePoint(start)} – ${fmtRangePoint(shownEnd)}`;
}

export function fmtDate(startsAt?: string | null): string {
  if (!startsAt) return '';
  const d = parseStartsAt(startsAt);
  if (!d) return startsAt;
  return fullFmt.format(d);
}

export function inWeek(startsAt: string | null | undefined, weekOffset: number): boolean {
  const d = parseStartsAt(startsAt);
  if (!d) return false; // Same as Web: a non-empty time that fails to parse belongs to no week view
  const { start, end } = getWeekRange(weekOffset);
  return d >= start && d < end;
}
