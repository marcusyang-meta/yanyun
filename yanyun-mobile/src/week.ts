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

export function getWeekRange(weekOffset: number): { start: Date; end: Date } {
  const now = new Date();
  const beijing = new Date(now.getTime() + (8 * 60 + now.getTimezoneOffset()) * 60000);
  const day = beijing.getDay();
  const daysSinceMonday = (day + 6) % 7;
  const monday = new Date(beijing);
  monday.setDate(beijing.getDate() - daysSinceMonday + weekOffset * 7);
  monday.setHours(5, 0, 0, 0);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  const toLocal = (bj: Date) => new Date(bj.getTime() - (8 * 60 + new Date().getTimezoneOffset()) * 60000);
  return { start: toLocal(monday), end: toLocal(nextMonday) };
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
