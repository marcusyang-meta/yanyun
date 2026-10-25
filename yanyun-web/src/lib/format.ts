// 共享工具：日期格式化、周范围、常量
// 注: 车队类型短标签 (双十/天赋/竞速…) 是 UI 文案, 已改为后端页面 shell
// 的 typeShort* 字段下发 (见 GroupingList/GroupingDetail), 此处不再写死。
import { readPrefMirror } from './locale';

export const SECTS = [
  '鸣金·虹', '鸣金·影', '牵丝·玉', '牵丝·霖', '牵丝·翊',
  '裂石·威', '裂石·钧', '破竹·樽', '破竹·鸢', '破竹·尘', '破竹·风',
];

// startsAt 线上有三种格式, 全部按 UTC 语义:
//  1) epoch 秒字符串 ("1792963800") —— 后端 starts_at_utc 有值时优先返回
//     (graphql.js: startsAt = starts_at_utc ? String(starts_at_utc) : starts_at)
//  2) 空格分隔的 UTC 文本 ("2026-10-24 12:00:00") —— 旧行 starts_at_utc 为
//     NULL 时返回的 starts_at 文本列
//  3) ISO 字符串 (带 Z 或 ±hh:mm 偏移)
// 统一解析入口: 所有 startsAt 的解析都必须走这里, 不许各处自己拼字符串。
// 已带时区标记的字符串绝不盲加 'Z' (会拼出 "…ZZ" 这类非法值);
// 无时区标记的时间文本一律按 UTC 解释 (与后端口径一致)。
// 返回 null = 无法解析 (含空值); 调用方自行决定兜底。
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

// 应用 locale: 与后端协商口径一致 (后端按 x-locale 头映射, 这里用同一
// 映射算出 Intl 用的 locale)。仅语言/格式本地化, 时区仍是查看者本地时区。
// 任意语言标记 -> canonical locale (与后端 negotiateLocale 同规则)
export function canonicalLocaleOf(raw: string): string {
  const v = (raw || '').trim();
  if (/^zh-(TW|HK|Hant)/i.test(v)) return 'zh-TW';
  if (/^en/i.test(v)) return 'en';
  if (/^es/i.test(v)) return 'es';
  if (/^fr/i.test(v)) return 'fr';
  return 'zh-CN';
}

// 应用当前生效 locale: 账号偏好镜像优先, 否则浏览器语言。
// 日期格式 (Intl) 与后端文案共用这一口径。
export function appLocale(): string {
  const raw = readPrefMirror() ?? ((typeof navigator !== 'undefined' && navigator.language) || 'zh-CN');
  return canonicalLocaleOf(raw);
}

// 文案模板填充: 后端下发的模板含 {name} 占位, 客户端只做替换, 不持有文案。
export function fill(template: string, params: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(params)) {
    out = out.split('{' + k + '}').join(String(v));
  }
  return out;
}

// 日期格式化（输入为 UTC 时间戳，转本地时区显示; 语言/样式按应用 locale）
export function fmtDate(startsAt?: string | null): string {
  if (!startsAt) return '';
  const d = parseStartsAt(startsAt);
  if (!d) return startsAt;
  return new Intl.DateTimeFormat(appLocale(), {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(d);
}

// 周界：北京时间周一 05:00（与服务端一致）
export function getWeekRange(weekOffset: number): { start: Date; end: Date } {
  const now = new Date();
  // 北京时间
  const beijing = new Date(now.getTime() + (8 * 60 + now.getTimezoneOffset()) * 60000);
  const day = beijing.getDay(); // 0=周日
  const daysSinceMonday = (day + 6) % 7;
  const monday = new Date(beijing);
  monday.setDate(beijing.getDate() - daysSinceMonday + weekOffset * 7);
  monday.setHours(5, 0, 0, 0);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  // 转回本地时间的 Date（用于比较，startsAt 解析为本地 Date）
  const toLocal = (bj: Date) => new Date(bj.getTime() - (8 * 60 + new Date().getTimezoneOffset()) * 60000);
  return { start: toLocal(monday), end: toLocal(nextMonday) };
}

// 周范围端点格式化：月/日 + 时:分（本地时区, 语言/样式按应用 locale）。
// 周界是北京时间周一 05:00，不是本地零点，只写日期会误导归属，必须带时间。
const rangePointFmt = () => new Intl.DateTimeFormat(appLocale(), {
  month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
export function fmtRangePoint(d: Date): string {
  return rangePointFmt().format(d);
}

// 周标签直接标起止时间，不用 本周/下周 这类相对说法（用户裁决 2026-10-24）。
// 与筛选共用同一次 getWeekRange 计算；但区间是左闭右开 [start, end)，
// 显示的结尾减 1 分钟读作闭区间，免得与下一周的起点同刻看着像重叠
// （仅显示口径，筛选边界仍是 end 本身，恰在 end 的车属下一周）。
export function weekRangeLabel(weekOffset: number): string {
  const { start, end } = getWeekRange(weekOffset);
  const shownEnd = new Date(end.getTime() - 60000);
  return `${fmtRangePoint(start)} – ${fmtRangePoint(shownEnd)}`;
}

// 武侠风共享样式
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
