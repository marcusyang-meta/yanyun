/* ===================================================
 * Car home timezone: which zone a car's start time is PRINTED in
 * on share surfaces (OG card image + og:description).
 *
 * Ruling (marcus, 2026-11-01): the card time follows the timezone
 * of the guild's people — never a bare UTC wall clock. The platform
 * stores no timezone profile anywhere (a viewer's zone arrives per
 * request as the x-tz header and is otherwise presentation-only),
 * so the car's framing zone is captured onto the row itself:
 * events.created_tz, stamped from the creating (or time-editing)
 * client's x-tz. Resolution for a car whose row predates capture:
 *
 *   1. the car's own created_tz — the zone of the person who set
 *      this car's time, captured at that moment;
 *   2. the creator's latest captured created_tz on another car in
 *      the SAME guild (once a leader frames one car from their own
 *      client, their fleet in that guild resolves to their zone;
 *      same-guild only — a zone is never borrowed across guilds);
 *   3. Asia/Shanghai — the platform-wide default zone (the same
 *      fallback fmtStartsAt / localDayParts / the week window use).
 *
 * The Chinese zone labels live here, in the data layer, as the
 * single source: both card surfaces consume the finished string
 * (og.ts directly, the OG worker via ogCarCard.cardTimeText), so
 * the two can never drift apart.
 * =================================================== */
import { getCreatorLatestCarTz, type EventRow } from './events.ts';

export const CAR_HOME_TZ_FALLBACK = 'Asia/Shanghai';

/* Accept only strings the runtime's tz database actually knows —
 * the value rides in on a client header, so it is untrusted input:
 * anything unparseable is treated as "not captured". */
export function isValidIanaTz(tz: unknown): tz is string {
  if (typeof tz !== 'string' || !tz || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/* The capture rule for write paths: the request's zone, or null
 * (leave the row unstamped) when the client presented none. */
export function capturedTzOrNull(tz: unknown): string | null {
  return isValidIanaTz(tz) ? tz : null;
}

export async function resolveCarHomeTz(db: D1Database, ev: EventRow): Promise<string> {
  if (isValidIanaTz(ev.created_tz)) return ev.created_tz;
  if (ev.creator_user_id) {
    const inherited = await getCreatorLatestCarTz(db, ev.tenant, ev.creator_user_id, ev.id)
      .catch(() => null);
    if (isValidIanaTz(inherited)) return inherited;
  }
  return CAR_HOME_TZ_FALLBACK;
}

/* ---------- Chinese zone labels ---------- */

/* Zones the guild population actually lives in get a name people
 * recognise (the vocabulary car titles already use — 美西/美东 for
 * the US coasts). Anything unmapped falls back to the zone's real
 * UTC offset at the printed instant (e.g. UTC+5:30), computed from
 * the tz database — never a guessed city name. */
export const TZ_LABEL_ZH: Record<string, string> = {
  'Asia/Shanghai': '北京时间',
  'Asia/Chongqing': '北京时间',
  'Asia/Taipei': '台北时间',
  'Asia/Hong_Kong': '香港时间',
  'Asia/Macau': '澳门时间',
  'Asia/Singapore': '新加坡时间',
  'Asia/Kuala_Lumpur': '吉隆坡时间',
  'Asia/Tokyo': '东京时间',
  'Asia/Seoul': '首尔时间',
  'Asia/Bangkok': '曼谷时间',
  'Asia/Jakarta': '雅加达时间',
  'Asia/Manila': '马尼拉时间',
  'Asia/Ho_Chi_Minh': '胡志明时间',
  'Asia/Kolkata': '印度时间',
  'America/Los_Angeles': '美西',
  'America/Vancouver': '美西',
  'America/Tijuana': '美西',
  'America/New_York': '美东',
  'America/Toronto': '美东',
  'America/Chicago': '美中',
  'America/Winnipeg': '美中',
  'America/Denver': '美国山地',
  'America/Edmonton': '美国山地',
  'America/Phoenix': '亚利桑那',
  'America/Anchorage': '阿拉斯加',
  'Pacific/Honolulu': '夏威夷',
  'America/Mexico_City': '墨西哥城时间',
  'America/Sao_Paulo': '圣保罗时间',
  'America/Santiago': '圣地亚哥时间',
  'Europe/London': '伦敦时间',
  'Europe/Dublin': '伦敦时间',
  'Europe/Paris': '巴黎时间',
  'Europe/Berlin': '柏林时间',
  'Australia/Sydney': '悉尼时间',
  'Australia/Melbourne': '墨尔本时间',
  'Australia/Brisbane': '布里斯班时间',
  'Australia/Perth': '珀斯时间',
  'Pacific/Auckland': '奥克兰时间',
};

/* The zone's UTC offset in minutes at one instant, from the tz
 * database: format the instant in the zone, reinterpret the wall
 * clock as UTC, and diff. */
export function tzOffsetMinutes(epochSec: number, tz: string): number {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  const parts: Record<string, number> = {};
  for (const p of fmt.formatToParts(new Date(epochSec * 1000))) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  }
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) / 1000;
  return Math.round((asUtc - epochSec) / 60);
}

export function carTzLabelZh(tz: string, epochSec: number): string {
  if (tz === 'UTC' || tz === 'Etc/UTC' || tz === 'Etc/Universal') return 'UTC';
  const named = TZ_LABEL_ZH[tz];
  if (named) return named;
  const off = tzOffsetMinutes(epochSec, tz);
  const sign = off < 0 ? '-' : '+';
  const abs = Math.abs(off);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m ? `UTC${sign}${h}:${String(m).padStart(2, '0')}` : `UTC${sign}${h}`;
}

/* "周日 13:30 美西" — weekday + wall clock in the car's home zone,
 * with the zone named in Chinese. Single formatter for both share
 * surfaces (og:description and, via ogCarCard.cardTimeText, the OG
 * card image), so they always agree. */
export function fmtCarTimeZoned(epochSec: number | string | null | undefined, tz: string): string {
  const n = typeof epochSec === 'string' ? parseInt(epochSec, 10) : Math.floor(Number(epochSec ?? 0));
  if (!Number.isFinite(n) || n <= 0) return '';
  const d = new Date(n * 1000);
  if (isNaN(d.getTime())) return '';
  const zone = isValidIanaTz(tz) ? tz : CAR_HOME_TZ_FALLBACK;
  const parts: Record<string, string> = {};
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: zone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  for (const p of fmt.formatToParts(d)) parts[p.type] = p.value;
  const weekZh: Record<string, string> = {
    Sun: '周日', Mon: '周一', Tue: '周二', Wed: '周三', Thu: '周四', Fri: '周五', Sat: '周六',
  };
  const p2 = (x: string) => String(x).padStart(2, '0');
  // Some ICU builds report midnight as hour 24 under h23; normalize.
  const hour = parts.hour === '24' ? '00' : parts.hour;
  return `${weekZh[parts.weekday] || ''} ${p2(hour)}:${p2(parts.minute)} ${carTzLabelZh(zone, n)}`;
}
