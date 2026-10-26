// Note: grouping type short labels are UI copy and now come from the backend
// page shells' typeShort* fields (see GroupingList/GroupingDetail); do not
// hardcode them here.
import { readPrefMirror } from './locale';

export const SECTS = [
  '鸣金·虹', '鸣金·影', '牵丝·玉', '牵丝·霖', '牵丝·翊',
  '裂石·威', '裂石·钧', '破竹·樽', '破竹·鸢', '破竹·尘', '破竹·风',
];

// startsAt arrives in three wire formats, all with UTC semantics:
//  1) epoch-seconds string ("1792963800") — returned when the backend's
//     starts_at_utc is set (startsAt = starts_at_utc ? String(starts_at_utc) : starts_at)
//  2) space-separated UTC text ("2026-10-24 12:00:00") — the starts_at text
//     column returned for legacy rows where starts_at_utc is NULL
//  3) ISO string (with Z or a ±hh:mm offset)
// This is the single parse entry point: all startsAt parsing must go through
// here, never ad-hoc string munging at call sites. Never blindly append 'Z'
// to a string that already carries a zone marker (produces invalid "…ZZ");
// zone-less time text is always interpreted as UTC (matching the backend).
// Returns null when unparseable (including empty); callers pick a fallback.
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

// Canonical locale for any language tag, using the same mapping the backend
// applies to the x-locale header (negotiateLocale), for Intl formatting.
// Language/format only — times stay in the viewer's local timezone.
export function canonicalLocaleOf(raw: string): string {
  const v = (raw || '').trim();
  if (/^zh-(TW|HK|Hant)/i.test(v)) return 'zh-TW';
  if (/^en/i.test(v)) return 'en';
  if (/^es/i.test(v)) return 'es';
  if (/^fr/i.test(v)) return 'fr';
  return 'zh-CN';
}

export function appLocale(): string {
  const raw = readPrefMirror() ?? ((typeof navigator !== 'undefined' && navigator.language) || 'zh-CN');
  return canonicalLocaleOf(raw);
}

export function fill(template: string, params: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(params)) {
    out = out.split('{' + k + '}').join(String(v));
  }
  return out;
}

export function fmtDate(startsAt?: string | null): string {
  if (!startsAt) return '';
  const d = parseStartsAt(startsAt);
  if (!d) return startsAt;
  return new Intl.DateTimeFormat(appLocale(), {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(d);
}

// Week boundary: Monday 05:00 Beijing time (matches the server).
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

// The week boundary is Monday 05:00 Beijing time, not local midnight, so the
// time must be shown — a date-only label would mislead about which week an
// endpoint belongs to.
const rangePointFmt = () => new Intl.DateTimeFormat(appLocale(), {
  month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
export function fmtRangePoint(d: Date): string {
  return rangePointFmt().format(d);
}

// Week labels state the start/end times directly, never relative wording
// like "this week / next week" (ruling, 2026-10-24). The range is half-open
// [start, end); the displayed end subtracts one minute so it reads as a
// closed interval and doesn't appear to overlap the next week's start.
// Display only — filtering still uses `end` itself, and a car exactly at
// `end` belongs to the next week.
export function weekRangeLabel(weekOffset: number): string {
  const { start, end } = getWeekRange(weekOffset);
  const shownEnd = new Date(end.getTime() - 60000);
  return `${fmtRangePoint(start)} – ${fmtRangePoint(shownEnd)}`;
}

export const theme = {
  bg: '#0c0b09',
  paper: '#ece2cb',
  gold: '#c9a35c',
  goldHi: '#ecd28f',
  muted: '#ab9c7d',
  seal: '#a02c1a',
  card: 'linear-gradient(160deg,rgba(201,163,92,.06),rgba(0,0,0,.2))',
  border: '1px solid rgba(201,163,92,.25)',
};
