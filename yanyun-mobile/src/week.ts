// 与网站 format.ts 同口径的时间/周界逻辑（MVP 固定 zh-CN 格式）：
// - startsAt 三种格式（epoch 秒串 / UTC 文本 / ISO）统一按 UTC 语义解析；
// - 周界 = 北京时间周一 05:00，筛选为左闭右开 [start, end)；
// - 周标签直接标起止时间，显示结尾减 1 分钟（仅显示口径）。

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
  if (!d) return false; // 与网站一致：解析不出的非空时间不进任何周视图
  const { start, end } = getWeekRange(weekOffset);
  return d >= start && d < end;
}
