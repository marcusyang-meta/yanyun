/* guilds domain service: admin attendance / activity statistics.
 *
 * Aggregates the groupings entities through their repositories only
 * (no SQL in this file). The frame is the product week (Monday 05:00
 * Beijing, weekWindowUtc): the series is the current week plus the
 * three before it, and both leaderboards total that same 4-week span.
 *
 * Counting rules (v1):
 * - A car belongs to the week its starts_at_utc falls in; draft cars
 *   and timeless cars belong to no week and count nowhere.
 * - Seats: totalSeats sums max_slots; filledSeats counts signup rows.
 * - Participation counts only signup rows carrying a discord_id
 *   stamp; a proxy signup is stamped with the proxied member, so the
 *   participation is credited to the proxied member.
 * - The leader board ranks creator_discord_id (the leader stamp);
 *   cars without a stamp are skipped.
 * - Display names resolve the roster's way (the memberRoster rule):
 *   roster nick, then roster global name, then the member's own
 *   signup nickname, then the account username, then the raw id. */
import { weekWindowUtc } from '../platform/index.ts';
import { listEventsInWindow, listSignupsByEvent } from '../groupings/index.ts';
import type { SignupRow } from '../groupings/index.ts';
import { listGuildMembers, getUsernameRow, listDiscordIdsByUserIds } from '../identity/index.ts';
import { getGuildIdBySlug } from './tenants.ts';

export interface GuildStatsWeek {
  weekStartUtc: number;
  weekEndUtc: number;
  isCurrent: boolean;
  carsActivity: number;
  carsTalent: number;
  carsRace: number;
  carsTower: number;
  carsExplore: number;
  carsTotal: number;
  completedCount: number;
  totalSeats: number;
  filledSeats: number;
  fillRate: number;
  participantCount: number;
  participationCount: number;
  perCapita: number;
}

export interface GuildStatsBoardEntry {
  discordId: string;
  displayName: string;
  count: number;
}

export interface GuildStats {
  weeks: GuildStatsWeek[];
  memberLeaders: GuildStatsBoardEntry[];
  leaderLeaders: GuildStatsBoardEntry[];
}

const BOARD_LIMIT = 10;
const WEEK_COUNT = 4;

function round2(n: number): number { return Math.round(n * 100) / 100; }

function emptyWeek(weekStartUtc: number, weekEndUtc: number, isCurrent: boolean): GuildStatsWeek {
  return {
    weekStartUtc, weekEndUtc, isCurrent,
    carsActivity: 0, carsTalent: 0, carsRace: 0, carsTower: 0, carsExplore: 0, carsTotal: 0,
    completedCount: 0, totalSeats: 0, filledSeats: 0, fillRate: 0,
    participantCount: 0, participationCount: 0, perCapita: 0,
  };
}

export async function computeGuildStats(db: D1Database, slug: string): Promise<GuildStats> {
  const guildId = await getGuildIdBySlug(db, slug).catch(() => null);
  if (guildId == null) {
    return { weeks: [], memberLeaders: [], leaderLeaders: [] };
  }
  const weeks: GuildStatsWeek[] = [];
  const weekMembers: Set<string>[] = [];
  for (let i = 0; i < WEEK_COUNT; i++) {
    const [start, end] = weekWindowUtc(-i);
    weeks.push(emptyWeek(start, end, i === 0));
    weekMembers.push(new Set<string>());
  }
  const spanStart = weeks[WEEK_COUNT - 1].weekStartUtc;
  const spanEnd = weeks[0].weekEndUtc;
  const rows = await listEventsInWindow(db, guildId, spanStart, spanEnd);
  const counted = rows.filter((e) => e.status !== 'draft');

  const memberSeats = new Map<string, number>();
  const leaderCars = new Map<number, number>();
  const signupNick = new Map<string, string>();

  for (const ev of counted) {
    const at = ev.starts_at_utc ?? 0;
    const wi = weeks.findIndex((w) => at >= w.weekStartUtc && at < w.weekEndUtc);
    if (wi < 0) continue;
    const week = weeks[wi];
    week.carsTotal += 1;
    if (ev.type === 'activity') week.carsActivity += 1;
    else if (ev.type === 'talent') week.carsTalent += 1;
    else if (ev.type === 'race') week.carsRace += 1;
    else if (ev.type === 'tower') week.carsTower += 1;
    else if (ev.type === 'explore') week.carsExplore += 1;
    if (ev.status === 'completed') week.completedCount += 1;
    week.totalSeats += ev.max_slots || 0;
    if (ev.creator_user_id) {
      leaderCars.set(ev.creator_user_id, (leaderCars.get(ev.creator_user_id) || 0) + 1);
    }
    const seats: SignupRow[] = await listSignupsByEvent(db, ev.id);
    week.filledSeats += seats.length;
    for (const seat of seats) {
      const did = seat.discord_id;
      if (!did) continue;
      week.participationCount += 1;
      weekMembers[wi].add(did);
      memberSeats.set(did, (memberSeats.get(did) || 0) + 1);
      if (seat.nickname && !signupNick.has(did)) signupNick.set(did, seat.nickname);
    }
  }
  for (let i = 0; i < WEEK_COUNT; i++) {
    const week = weeks[i];
    week.participantCount = weekMembers[i].size;
    week.fillRate = week.totalSeats > 0 ? round2(week.filledSeats / week.totalSeats) : 0;
    week.perCapita = week.participantCount > 0 ? round2(week.participationCount / week.participantCount) : 0;
  }

  const roster = await listGuildMembers(db, guildId).catch((): { discord_id: string; nick: string; global_name: string }[] => []);
  const rosterName = new Map<string, string>();
  for (const m of roster) {
    const name = (m.nick || '').trim() || (m.global_name || '').trim();
    if (name) rosterName.set(m.discord_id, name);
  }
  const resolveName = async (did: string): Promise<string> => {
    const fromRoster = rosterName.get(did);
    if (fromRoster) return fromRoster;
    const fromSeat = signupNick.get(did);
    if (fromSeat) return fromSeat;
    const user = await getUsernameRow(db, did).catch(() => null);
    return (user && user.username) || did;
  };
  // Leader counts are keyed by internal user ID; the board surface
  // is Discord-keyed, so resolve through the users rows first.
  const leaderDiscordIds = await listDiscordIdsByUserIds(db, [...leaderCars.keys()]).catch(() => new Map());
  const leaderCarsByDiscord = new Map<string, number>();
  for (const [userId, count] of leaderCars) {
    const did = leaderDiscordIds.get(userId);
    if (did) leaderCarsByDiscord.set(did, (leaderCarsByDiscord.get(did) || 0) + count);
  }
  const board = async (counts: Map<string, number>): Promise<GuildStatsBoardEntry[]> => {
    const entries: GuildStatsBoardEntry[] = [];
    for (const [discordId, count] of counts) {
      entries.push({ discordId, displayName: await resolveName(discordId), count });
    }
    entries.sort((a, b) => (b.count - a.count)
      || (a.displayName < b.displayName ? -1 : a.displayName > b.displayName ? 1 : 0)
      || (a.discordId < b.discordId ? -1 : 1));
    return entries.slice(0, BOARD_LIMIT);
  };
  return {
    weeks,
    memberLeaders: await board(memberSeats),
    leaderLeaders: await board(leaderCarsByDiscord),
  };
}
