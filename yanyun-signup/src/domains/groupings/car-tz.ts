/* ===================================================
 * Car home timezone: which zone a car's start time is PRINTED in
 * on share surfaces (OG card image + og:description).
 *
 * Ruling (marcus, 2026-11-01): the card time follows the timezone
 * of the guild's people — never a bare UTC wall clock. Two captures
 * feed the resolution: the car's own framing zone, stamped onto the
 * row at creation (events.created_tz, migration 0039), and each
 * member's latest zone, persisted on the users row from the x-tz
 * header of their signed-in requests (users.last_tz, migration
 * 0040). Resolution, first hit wins:
 *
 *   1. the car's own created_tz — the zone of the person who set
 *      this car's time, captured at that moment;
 *   2. the creator's zone — their persisted member zone first (the
 *      freshest capture of that person), then their latest captured
 *      created_tz on another car in the SAME guild (the pre-0040
 *      capture of the same signal; kept so fleets framed before
 *      member capture existed still resolve to their leader's zone
 *      until the leader's next signed-in request lands ring 2's
 *      first half — same-guild only, never borrowed across guilds);
 *   3. the guild's mode zone — the zone held by the most members of
 *      this guild's roster who have a captured zone (deterministic
 *      tie-breaks in pickGuildModeTz below);
 *   4. Asia/Shanghai — the platform-wide default zone (the same
 *      fallback fmtStartsAt / localDayParts / the week window use).
 *
 * The Chinese zone labels live here, in the data layer, as the
 * single source: both card surfaces consume the finished string
 * (og.ts directly, the OG worker via ogCarCard.cardTimeText), so
 * the two can never drift apart.
 *
 * Interim display ruling (marcus, 2026-11-01, later the same day):
 * the two share surfaces temporarily do NOT consume this chain —
 * they print the start in US East + US West side by side
 * (fmtCarTimeDualZones below). The chain and both captures stay in
 * place untouched so the surfaces can switch back to single-zone
 * home rendering without new plumbing.
 * =================================================== */
import { getCreatorLatestCarTz, type EventRow } from './events.ts';
import { getUserLastTz, listGuildMemberTzStats, type GuildMemberTzStat } from '../identity/index.ts';

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

/* ---------- guild mode zone ---------- */

/** The guild's mode zone from its roster's zone distribution
 * (listGuildMemberTzStats rows). Deterministic, in this order:
 *   1. the highest member count wins;
 *   2. among zones tied at that count, the car creator's own zone
 *      wins when it is one of the tied zones (creatorTz, when the
 *      caller knows it — inside resolveCarHomeTz the creator ring
 *      has normally already claimed a known creator zone, so this
 *      step is the mode computation's own contract, exercised
 *      directly in tests);
 *   3. among the still-tied zones, the one whose members were
 *      active most recently (latest_active_at) wins;
 *   4. still tied: the lexicographically first zone name wins.
 * Rows carrying a zone the tz database does not know, or a
 * non-positive count, never vote. Null when nobody voted. */
export function pickGuildModeTz(
  stats: GuildMemberTzStat[], creatorTz?: string | null,
): string | null {
  const valid = (stats || []).filter((s) => s && isValidIanaTz(s.tz) && s.member_count > 0);
  if (!valid.length) return null;
  const top = Math.max(...valid.map((s) => s.member_count));
  let tied = valid.filter((s) => s.member_count === top);
  if (tied.length === 1) return tied[0].tz;
  if (isValidIanaTz(creatorTz)) {
    const hit = tied.find((s) => s.tz === creatorTz);
    if (hit) return hit.tz;
  }
  const latest = Math.max(...tied.map((s) => s.latest_active_at || 0));
  tied = tied.filter((s) => (s.latest_active_at || 0) === latest);
  if (tied.length === 1) return tied[0].tz;
  return tied.map((s) => s.tz).sort()[0];
}

export async function resolveCarHomeTz(db: D1Database, ev: EventRow): Promise<string> {
  if (isValidIanaTz(ev.created_tz)) return ev.created_tz;
  let creatorTz: string | null = null;
  if (ev.creator_user_id) {
    creatorTz = await getUserLastTz(db, ev.creator_user_id).catch(() => null);
    if (isValidIanaTz(creatorTz)) return creatorTz;
    const inherited = await getCreatorLatestCarTz(db, ev.tenant, ev.creator_user_id, ev.id)
      .catch(() => null);
    if (isValidIanaTz(inherited)) return inherited;
    creatorTz = inherited;
  }
  const stats = await listGuildMemberTzStats(db, ev.tenant).catch(() => [] as GuildMemberTzStat[]);
  const mode = pickGuildModeTz(stats, creatorTz);
  if (mode) return mode;
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

const WEEK_ZH: Record<string, string> = {
  Sun: '周日', Mon: '周一', Tue: '周二', Wed: '周三', Thu: '周四', Fri: '周五', Sat: '周六',
};

/* Normalise the accepted epoch inputs; 0 = "no usable instant". */
function parseEpochSec(epochSec: number | string | null | undefined): number {
  const n = typeof epochSec === 'string' ? parseInt(epochSec, 10) : Math.floor(Number(epochSec ?? 0));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return isNaN(new Date(n * 1000).getTime()) ? 0 : n;
}

/* Weekday + wall clock of one instant in one zone, from the tz
 * database — the weekday follows the ZONE's calendar day, never
 * UTC's. */
function zonedWeekdayTime(epochSec: number, tz: string): { weekZh: string; hhmm: string } {
  const parts: Record<string, string> = {};
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  for (const p of fmt.formatToParts(new Date(epochSec * 1000))) parts[p.type] = p.value;
  const p2 = (x: string) => String(x).padStart(2, '0');
  // Some ICU builds report midnight as hour 24 under h23; normalize.
  const hour = parts.hour === '24' ? '00' : parts.hour;
  return { weekZh: WEEK_ZH[parts.weekday] || '', hhmm: `${p2(hour)}:${p2(parts.minute)}` };
}

/* "周日 13:30 美西" — weekday + wall clock in the car's home zone,
 * with the zone named in Chinese. Kept for the eventual switch back
 * to single-zone home rendering; the share surfaces currently print
 * fmtCarTimeDualZones instead (interim ruling, see header). */
export function fmtCarTimeZoned(epochSec: number | string | null | undefined, tz: string): string {
  const n = parseEpochSec(epochSec);
  if (!n) return '';
  const zone = isValidIanaTz(tz) ? tz : CAR_HOME_TZ_FALLBACK;
  const { weekZh, hhmm } = zonedWeekdayTime(n, zone);
  return `${weekZh} ${hhmm} ${carTzLabelZh(zone, n)}`;
}

/* The interim dual-zone pair, East before West (marcus's wording:
 * "先放美东和美西时间"). */
export const CAR_TIME_DUAL_ZONES = ['America/New_York', 'America/Los_Angeles'] as const;

/* "美东 周日 16:30 · 美西 周日 13:30" — one instant printed in US
 * East and US West side by side, each segment labelled in Chinese
 * and carrying ITS OWN zone's weekday (the two can differ across
 * midnight). Single formatter for both share surfaces
 * (og:description and, via ogCarCard.cardTimeText, the OG card
 * image), so they always agree. */
export function fmtCarTimeDualZones(epochSec: number | string | null | undefined): string {
  const n = parseEpochSec(epochSec);
  if (!n) return '';
  return CAR_TIME_DUAL_ZONES.map((tz) => {
    const { weekZh, hhmm } = zonedWeekdayTime(n, tz);
    return `${carTzLabelZh(tz, n)} ${weekZh} ${hhmm}`;
  }).join(' · ');
}

/* og:description-only compact variant (marcus, 2026-11-07): when
 * both zones fall on the same weekday the weekday prints once, on
 * the East segment ("美东 周六 22:00 · 美西 19:00"); across midnight
 * the weekdays differ and both segments keep theirs, so nothing is
 * dropped. The OG card image and every other surface keep
 * fmtCarTimeDualZones verbatim — this variant serves the meta
 * description alone, where the repeated weekday only ate width. */
export function fmtCarTimeDualZonesCompact(epochSec: number | string | null | undefined): string {
  const n = parseEpochSec(epochSec);
  if (!n) return '';
  const segs = CAR_TIME_DUAL_ZONES.map((tz) => {
    const { weekZh, hhmm } = zonedWeekdayTime(n, tz);
    return { label: carTzLabelZh(tz, n), weekZh, hhmm };
  });
  const sameWeekday = segs[0].weekZh !== '' && segs[0].weekZh === segs[1].weekZh;
  return segs
    .map((s, i) => (i === 1 && sameWeekday ? `${s.label} ${s.hhmm}` : `${s.label} ${s.weekZh} ${s.hhmm}`))
    .join(' · ');
}
