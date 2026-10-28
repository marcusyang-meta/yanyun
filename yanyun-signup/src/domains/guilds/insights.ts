/* guilds domain service: premium insights (data layer line, T1) —
 * P2 reliability profiles, P9 gear readiness board, P10 participation
 * heatmap, P15 race season board. All four are cross-period
 * aggregations over records the platform already keeps; the records
 * themselves stay free (complexity-gate ruling: records free, insight
 * charged). Every number below is computed through the owning
 * domains' repositories only (no SQL in this file), and the counting
 * definitions are pinned to real fields — where the data cannot
 * support a metric, the metric is not shipped (see the P2 note).
 *
 * P2 counting rules (pinned to real fields):
 * - A "signup" is a seat (signup row) stamped with the member's
 *   discord_id on a non-draft car of this guild that has a start
 *   time. Proxy signups credit the proxied member, exactly like P1
 *   (the stamp IS the proxied member).
 * - The platform has no separate attendance register: the seat's
 *   ready mark (signups.ready_at, the check-in the reminder engine
 *   itself nudges on) is the only presence signal the data carries.
 *   So on a COMPLETED car, a stamped seat with ready_at set counts
 *   as ATTENDED, and a stamped seat without it counts as NO-SHOW
 *   （鸽）. Seats on cars that never completed settle neither way —
 *   they count in signups only, because a cancelled / abandoned car
 *   says nothing about the member.
 * - attendanceRate = attended / (attended + noShow); a member with
 *   no settled seat ships rate 0 with settledCount 0 so clients can
 *   render "no settled runs yet" instead of a fake percentage.
 * Display names resolve the roster's way (the stats.ts rule): roster
 * nick, then roster global name, then the member's own signup
 * nickname, then the account username, then the raw id.
 *
 * P10 counting rules: the heatmap counts ATTENDED participations
 * (the P2 attended definition) bucketed by the car's start time.
 * The platform stores no per-member timezone (F4 ruling: times are
 * stored in UTC and rendered in the VIEWER's timezone), so the
 * buckets are computed in the requesting viewer's timezone — the
 * same caliber as the P1 week labels, which also render in ctx.tz.
 * weekday is 0 = Monday .. 6 = Sunday; hour is 0..23 local.
 *
 * P9 counting rules: a member's score is the best build graduation
 * score across their saved gear builds — the gear domain's own
 * server-computed snapshot (gearplanner gpGraduation total, 0..1),
 * shipped here as percent (0..100, one decimal). A member with no
 * saved build (or no snapshot) has NO score: they are counted as
 * unmet with the full threshold as their gap and hasBuild = false,
 * never as score 0 with a build.
 *
 * P15 counting rules: single-run records stay free and untouched;
 * this board only aggregates them. A race car belongs to the season
 * of its dungeon (dex dungeons.season, S1..S5) resolved by dungeon
 * name; a car whose dungeon is unknown or unclassified lands in the
 * unclassified bucket (season = ''). A board entry is one TEAM
 * (results.team_name — results are team records, the data has no
 * per-member race identity beyond the free-text members list, which
 * is echoed back verbatim): runs = its result rows in the season,
 * bestTimeMs = its fastest, wins = cars where its row was the
 * fastest of that car. Entries rank by wins desc, then best time
 * asc, then runs desc. */
import {
  listEventsInWindow, listSignupsByEvent, listEventsAdmin, listResultsByEvent,
} from '../groupings/index.ts';
import type { SignupRow } from '../groupings/index.ts';
import { listGuildMembers, getUsernameRow } from '../identity/index.ts';
import { listGearBuilds } from '../gear/index.ts';
import { getDungeonByName, SEASON_NAMES } from '../dex/index.ts';
import { listGearStandards } from './gearstandards.ts';
import type { GearStandardRow } from './gearstandards.ts';

/* ---------------- shared name resolution (stats.ts rule) ---------------- */

interface NameResolver {
  resolve(discordId: string): Promise<string>;
  noteSeat(discordId: string, nickname: string): void;
}

async function makeNameResolver(db: D1Database, slug: string): Promise<NameResolver> {
  const roster = await listGuildMembers(db, slug).catch((): { discord_id: string; nick: string; global_name: string }[] => []);
  const rosterName = new Map<string, string>();
  for (const m of roster) {
    const name = (m.nick || '').trim() || (m.global_name || '').trim();
    if (name) rosterName.set(m.discord_id, name);
  }
  const signupNick = new Map<string, string>();
  return {
    noteSeat(discordId: string, nickname: string) {
      if (nickname && !signupNick.has(discordId)) signupNick.set(discordId, nickname);
    },
    async resolve(discordId: string): Promise<string> {
      const fromRoster = rosterName.get(discordId);
      if (fromRoster) return fromRoster;
      const fromSeat = signupNick.get(discordId);
      if (fromSeat) return fromSeat;
      const user = await getUsernameRow(db, discordId).catch(() => null);
      return (user && user.username) || discordId;
    },
  };
}

/** Every non-draft car of the guild that has a start time, oldest
 * first — the shared frame for P2 / P10 (P1 uses a 4-week window;
 * archives are cross-period by definition, so no window is applied). */
async function listTimedCars(db: D1Database, slug: string) {
  const rows = await listEventsInWindow(db, slug, 0, Math.floor(Date.now() / 1000) + 366 * 86400);
  return rows.filter((e) => e.status !== 'draft' && e.starts_at_utc != null);
}

/* ---------------- P2 reliability profiles ---------------- */

export interface ReliabilityEntry {
  discordId: string;
  displayName: string;
  signupCount: number;
  attendedCount: number;
  noShowCount: number;
  settledCount: number;
  attendanceRate: number;
}

function round2(n: number): number { return Math.round(n * 100) / 100; }

export async function computeReliability(db: D1Database, slug: string): Promise<ReliabilityEntry[]> {
  const cars = await listTimedCars(db, slug);
  const names = await makeNameResolver(db, slug);
  const byMember = new Map<string, ReliabilityEntry>();
  const entryOf = (did: string): ReliabilityEntry => {
    let e = byMember.get(did);
    if (!e) {
      e = {
        discordId: did, displayName: did,
        signupCount: 0, attendedCount: 0, noShowCount: 0, settledCount: 0, attendanceRate: 0,
      };
      byMember.set(did, e);
    }
    return e;
  };
  for (const ev of cars) {
    const seats: SignupRow[] = await listSignupsByEvent(db, ev.id);
    for (const seat of seats) {
      const did = seat.discord_id;
      if (!did) continue;
      names.noteSeat(did, seat.nickname || '');
      const e = entryOf(did);
      e.signupCount += 1;
      if (ev.status === 'completed') {
        e.settledCount += 1;
        if (seat.ready_at) e.attendedCount += 1;
        else e.noShowCount += 1;
      }
    }
  }
  const out = [...byMember.values()];
  for (const e of out) {
    e.displayName = await names.resolve(e.discordId);
    e.attendanceRate = e.settledCount > 0 ? round2(e.attendedCount / e.settledCount) : 0;
  }
  out.sort((a, b) => (b.noShowCount - a.noShowCount)
    || (b.signupCount - a.signupCount)
    || (a.displayName < b.displayName ? -1 : a.displayName > b.displayName ? 1 : 0)
    || (a.discordId < b.discordId ? -1 : 1));
  return out.slice(0, 200);
}

/* ---------------- P10 participation heatmap ---------------- */

export interface HeatmapCell {
  weekday: number;
  hour: number;
  count: number;
}

export interface ParticipationHeatmap {
  timezone: string;
  totalAttended: number;
  peakCount: number;
  cells: HeatmapCell[];
}

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
};

export async function computeParticipationHeatmap(
  db: D1Database, slug: string, tz: string,
): Promise<ParticipationHeatmap> {
  const zone = tz || 'Asia/Shanghai';
  let fmt: Intl.DateTimeFormat;
  try {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: zone, weekday: 'short', hour: '2-digit', hourCycle: 'h23',
    });
  } catch {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai', weekday: 'short', hour: '2-digit', hourCycle: 'h23',
    });
  }
  const cars = await listTimedCars(db, slug);
  const counts = new Map<string, HeatmapCell>();
  let total = 0;
  let peak = 0;
  for (const ev of cars) {
    if (ev.status !== 'completed' || ev.starts_at_utc == null) continue;
    const seats: SignupRow[] = await listSignupsByEvent(db, ev.id);
    const attended = seats.filter((seat) => seat.discord_id && seat.ready_at).length;
    if (!attended) continue;
    const parts = fmt.formatToParts(new Date(ev.starts_at_utc * 1000));
    let weekday = -1;
    let hour = -1;
    for (const p of parts) {
      if (p.type === 'weekday') weekday = WEEKDAY_INDEX[p.value] ?? -1;
      if (p.type === 'hour') hour = Number(p.value) % 24;
    }
    if (weekday < 0 || hour < 0) continue;
    const key = `${weekday}:${hour}`;
    const cell = counts.get(key) || { weekday, hour, count: 0 };
    cell.count += attended;
    counts.set(key, cell);
    total += attended;
    if (cell.count > peak) peak = cell.count;
  }
  const cells = [...counts.values()].sort((a, b) => (a.weekday - b.weekday) || (a.hour - b.hour));
  return { timezone: zone, totalAttended: total, peakCount: peak, cells };
}

/* ---------------- P9 gear readiness board ---------------- */

export interface GearBoardMember {
  discordId: string;
  displayName: string;
  hasBuild: boolean;
  bestScore: number | null;
  met: boolean;
  gap: number;
}

export interface GearBoardStandard {
  id: number;
  label: string;
  minScore: number;
  metCount: number;
  unmetCount: number;
  noBuildCount: number;
  members: GearBoardMember[];
}

export interface GearBoard {
  standards: GearBoardStandard[];
}

/** A member's best saved-build graduation score in percent (one
 * decimal), or null when they have no build snapshot at all. */
export async function bestBuildScorePct(db: D1Database, discordId: string): Promise<number | null> {
  const builds = await listGearBuilds(db, discordId).catch(() => []);
  let best: number | null = null;
  for (const b of builds || []) {
    const total = b && b.snapshot && typeof b.snapshot.total === 'number' ? b.snapshot.total : null;
    if (total == null) continue;
    const pct = Math.round(total * 1000) / 10;
    if (best == null || pct > best) best = pct;
  }
  return best;
}

export async function computeGearBoard(db: D1Database, slug: string): Promise<GearBoard> {
  const standards = await listGearStandards(db, slug);
  const roster = await listGuildMembers(db, slug).catch((): { discord_id: string; nick: string; global_name: string }[] => []);
  const scores = new Map<string, number | null>();
  for (const m of roster) {
    scores.set(m.discord_id, await bestBuildScorePct(db, m.discord_id));
  }
  const board: GearBoardStandard[] = standards.map((std: GearStandardRow) => {
    const members: GearBoardMember[] = roster.map((m) => {
      const best = scores.get(m.discord_id) ?? null;
      const met = best != null && best >= std.min_score;
      return {
        discordId: m.discord_id,
        displayName: (m.nick || '').trim() || (m.global_name || '').trim() || m.discord_id,
        hasBuild: best != null,
        bestScore: best,
        met,
        gap: met ? 0 : Math.round((std.min_score - (best ?? 0)) * 10) / 10,
      };
    });
    members.sort((a, b) => (Number(a.met) - Number(b.met))
      || (b.gap - a.gap)
      || ((b.bestScore ?? -1) - (a.bestScore ?? -1))
      || (a.displayName < b.displayName ? -1 : a.displayName > b.displayName ? 1 : 0));
    return {
      id: std.id,
      label: std.label,
      minScore: std.min_score,
      metCount: members.filter((m) => m.met).length,
      unmetCount: members.filter((m) => !m.met && m.hasBuild).length,
      noBuildCount: members.filter((m) => !m.hasBuild).length,
      members,
    };
  });
  return { standards: board };
}

export interface GearSelfEntry {
  standardId: number;
  label: string;
  minScore: number;
  myScore: number | null;
  met: boolean;
}

/** The member-side P9 view: only the viewer's own standing against
 * each of the guild's standards — never another member's score. */
export async function computeGearSelfStatus(
  db: D1Database, slug: string, discordId: string,
): Promise<GearSelfEntry[]> {
  const standards = await listGearStandards(db, slug);
  if (!standards.length) return [];
  const mine = await bestBuildScorePct(db, discordId);
  return standards.map((std: GearStandardRow) => ({
    standardId: std.id,
    label: std.label,
    minScore: std.min_score,
    myScore: mine,
    met: mine != null && mine >= std.min_score,
  }));
}

/* ---------------- P15 race season board ---------------- */

export interface RaceSeasonEntry {
  teamName: string;
  members: string;
  runCount: number;
  winCount: number;
  bestTimeMs: number;
}

export interface RaceSeason {
  season: string;
  seasonName: string;
  entries: RaceSeasonEntry[];
}

export interface RaceSeasonBoard {
  seasons: RaceSeason[];
}

export async function computeRaceSeasonBoard(db: D1Database, slug: string): Promise<RaceSeasonBoard> {
  // The admin list is the only all-statuses read (the tenant-type
  // list is a recruiting view and excludes completed cars by design).
  const cars = (await listEventsAdmin(db, slug)).filter((e) => e.type === 'race' && e.status !== 'draft');
  const seasonOfDungeon = new Map<string, string>();
  const buckets = new Map<string, Map<string, RaceSeasonEntry & { bestEventIds: Set<number> }>>();
  for (const ev of cars) {
    const dungeonName = ev.dungeon || '';
    if (!seasonOfDungeon.has(dungeonName)) {
      let season = '';
      if (dungeonName) {
        const d = await getDungeonByName(db, dungeonName).catch(() => null);
        season = (d && d.season) || '';
      }
      seasonOfDungeon.set(dungeonName, season);
    }
    const season = seasonOfDungeon.get(dungeonName) || '';
    const results = await listResultsByEvent(db, ev.id);
    if (!results.length) continue;
    let bucket = buckets.get(season);
    if (!bucket) { bucket = new Map(); buckets.set(season, bucket); }
    const fastest = Math.min(...results.map((r) => r.time_ms || Infinity));
    for (const r of results) {
      const team = (r.team_name || '').trim();
      if (!team) continue;
      let entry = bucket.get(team);
      if (!entry) {
        entry = {
          teamName: team, members: r.members || '',
          runCount: 0, winCount: 0, bestTimeMs: r.time_ms || 0, bestEventIds: new Set<number>(),
        };
        bucket.set(team, entry);
      }
      entry.runCount += 1;
      if (!entry.members && r.members) entry.members = r.members;
      if (r.time_ms && (entry.bestTimeMs === 0 || r.time_ms < entry.bestTimeMs)) entry.bestTimeMs = r.time_ms;
      if (r.time_ms === fastest && !entry.bestEventIds.has(ev.id)) {
        entry.bestEventIds.add(ev.id);
        entry.winCount += 1;
      }
    }
  }
  const seasons: RaceSeason[] = [...buckets.entries()].map(([season, bucket]) => {
    const entries = [...bucket.values()].map(({ bestEventIds, ...rest }) => {
      void bestEventIds;
      return rest;
    });
    entries.sort((a, b) => (b.winCount - a.winCount)
      || ((a.bestTimeMs || Infinity) - (b.bestTimeMs || Infinity))
      || (b.runCount - a.runCount)
      || (a.teamName < b.teamName ? -1 : a.teamName > b.teamName ? 1 : 0));
    return {
      season,
      seasonName: season ? (SEASON_NAMES[season] || season) : '',
      entries: entries.slice(0, 50),
    };
  });
  seasons.sort((a, b) => (a.season < b.season ? -1 : a.season > b.season ? 1 : 0));
  return { seasons };
}
