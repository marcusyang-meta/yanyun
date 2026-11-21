// Bloks-lite stateless helpers only: vocab-version registry, version
// substitution, week windows and time formatting. Composition lives in
// the GraphQL shells (blocks are typed objects: Block interface + concretes).

/* ---------- Vocab version registry ----------
 * Each block/action type records the version that introduced it. Blocks
 * above the client's declared blocksVersion are replaced with
 * FallbackBlock; actions above it are nulled (block kept, not tappable).
 * This registry owns only safe downgrade for old clients. */
export const BLOCK_VOCAB_MAX = 4;
export const BLOCK_TYPE_SINCE: Record<string, number> = {
  FallbackBlock: 0,
  SectionBlock: 1, SectionHeaderBlock: 1, TextBlock: 1, GroupingCardBlock: 1,
  SeatGridBlock: 1, ActionButtonBlock: 1, EmptyStateBlock: 1, SpacerBlock: 1,
  BannerBlock: 2, ChipRowBlock: 2,
};
export const ACTION_TYPE_SINCE: Record<string, number> = {
  NavigateAction: 1, JoinAction: 1, LeaveAction: 1, DisbandAction: 1,
  EditAction: 3,
  CompleteAction: 4, UncompleteAction: 4,
};

export function clampBlocksVersion(v: any) {
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, BLOCK_VOCAB_MAX);
}

// Version-substitute composed block shells, recursing into children.
// Shell shape: { __typename, _children: [], _action: shell|null }.
// SeatEntry.action is always a v1 action by construction; out of scope here.
export function substituteForVersion(blocks: any, version: number, makeFallback: () => any) {
  const out: any[] = [];
  for (const b of blocks || []) {
    const since = BLOCK_TYPE_SINCE[b.__typename];
    if (since != null && since > version) { out.push(makeFallback()); continue; }
    if (b._action) {
      const aSince = ACTION_TYPE_SINCE[b._action.__typename];
      if (aSince != null && aSince > version) b._action = null;
    }
    if (Array.isArray(b._children) && b._children.length) {
      b._children = substituteForVersion(b._children, version, makeFallback);
    }
    out.push(b);
  }
  return out;
}

/* ---------- Time / week window ---------- */
// Week window: Monday 05:00 Beijing time, half-open [start, start+7d);
// same algorithm as ogWeekWindowUtc; weekOffset shifts whole weeks.
// weekWindowUtcAt is the same frame anchored at an arbitrary instant
// (the week a given moment belongs to); weekWindowUtc is its
// current-week form, so every consumer shares one week definition.
export function weekWindowUtcAt(epochSec: number): [number, number] {
  const cst = epochSec + 8 * 3600;
  const d = new Date(cst * 1000);
  const dayStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000;
  let monday = dayStart - ((d.getUTCDay() + 6) % 7) * 86400 + 5 * 3600;
  if (cst < monday) monday -= 7 * 86400;
  const startUtc = monday - 8 * 3600;
  return [startUtc, startUtc + 7 * 86400];
}

export function weekWindowUtc(weekOffset = 0): [number, number] {
  const [start, end] = weekWindowUtcAt(Math.floor(Date.now() / 1000));
  const shift = (weekOffset | 0) * 7 * 86400;
  return [start + shift, end + shift];
}

// events row -> epoch seconds (starts_at_utc first; text follows parseStartsAt semantics)
export function startsAtEpoch(ev: any) {
  if (ev.starts_at_utc != null && ev.starts_at_utc !== '') {
    const n = Number(ev.starts_at_utc);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const s = String(ev.starts_at || '').trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  let c = s;
  if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(s) && /[\sT]\d/.test(s)) c = s.replace(' ', 'T') + 'Z';
  const ms = Date.parse(c);
  return Number.isNaN(ms) ? null : Math.floor(ms / 1000);
}

const _fmtCache = new Map<string, Intl.DateTimeFormat>();
export function fmtStartsAt(epochSec: number, locale: string, tz?: string | null) {
  const zone = tz || 'Asia/Shanghai';
  const key = `${locale}|${zone}`;
  let fmt = _fmtCache.get(key);
  if (!fmt) {
    const opts: Intl.DateTimeFormatOptions = {
      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
      hourCycle: 'h23', weekday: 'short', timeZone: zone,
    };
    try { fmt = new Intl.DateTimeFormat(locale || 'zh-CN', opts); }
    catch { fmt = new Intl.DateTimeFormat('zh-CN', { ...opts, timeZone: 'Asia/Shanghai' }); }
    _fmtCache.set(key, fmt);
  }
  return fmt.format(new Date(epochSec * 1000));
}

/* ---------- Grouping by local day (presentation only) ----------
 * The browsing frame stays the week (weekWindowUtc is data semantics);
 * within a screen, group by the viewer's local day (tz, default
 * Asia/Shanghai): days ascending, start times ascending within a day.
 * localDayParts weekday is 0=Sunday, matching JS getDay / catalog weekday0..6. */
const _dayFmtCache = new Map<string, Intl.DateTimeFormat>();
export function localDayParts(epochSec: number, tz?: string | null) {
  const zone = tz || 'Asia/Shanghai';
  let fmt = _dayFmtCache.get(zone);
  if (!fmt) {
    const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: zone };
    try { fmt = new Intl.DateTimeFormat('en-US', opts); }
    catch { fmt = new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'Asia/Shanghai' }); }
    _dayFmtCache.set(zone, fmt);
  }
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(new Date(epochSec * 1000))) parts[p.type] = p.value;
  const year = Number(parts.year), month = Number(parts.month), day = Number(parts.day);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return { key: `${year}-${month}-${day}`, year, month, day, weekday };
}

// Sort by ts, then bucket by local day; do not rely on caller ordering.
export function groupByLocalDay(items: Array<{ ts: number } & Record<string, any>>, tz?: string | null) {
  const sorted = [...items].sort((a, b) => a.ts - b.ts);
  const groups: Array<{ parts: any; items: any[] }> = [];
  let cur: { parts: any; items: any[] } | null = null;
  for (const it of sorted) {
    const parts = localDayParts(it.ts, tz);
    if (!cur || cur.parts.key !== parts.key) { cur = { parts, items: [] }; groups.push(cur); }
    cur.items.push(it);
  }
  return groups;
}

// events.type -> groupingType catalog short-name key. 'explore' is
// the co-op exploration grouping type: its badge/default-title short
// is shortCoopExplore （联机探索）, not the officer-attendance
// shortExplore （探索） the value used before the type existed.
export const TYPE_SHORT_KEY: Record<string, string> = {
  activity: 'shortActivity', talent: 'shortTalent', race: 'shortRace', tower: 'shortTower',
  gather: 'shortGather', explore: 'shortCoopExplore',
};
export const HEALER_SECT = '牵丝·霖';
