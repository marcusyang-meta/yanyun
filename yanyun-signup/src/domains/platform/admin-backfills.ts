/* Platform-admin one-off backfills, as services behind admin
 * mutations (they used to be POST endpoints on the retired hub
 * portal). The matching policies are unchanged from the portal
 * handlers — conservative, unique-match-only, never guess — and all
 * data access goes through domain repositories (the creator-stamps
 * handler previously hand-rolled SQL against the raw binding; it now
 * reads/writes through the groupings events repository).
 *
 * Each function returns the same report shape the portal returned;
 * auditing is the caller's job (the resolver records the real actor).
 */
import {
  listNonEmptySettingsByKey, listSettingsByKey, getTenantRowById,
} from '../guilds/index.ts';
import {
  upsertGuildMember, listUnstampedSeatsByTenant, stampSignupDiscordId,
  listEventsForCreatorBackfill, stampEventCreators,
} from '../groupings/index.ts';
import { listUsersDirectory, listAllNicks, listNicksByGuild } from '../identity/index.ts';
import { listBossesWithGuide, updateBossFields } from '../dex/index.ts';
import { parseGuideStructured } from '../dex/graphql.ts';

/* ---------- Reminder identity backfill ----------
 * Same discipline as the leader backfill: idempotent, dryRun only
 * reports, only a unique unambiguous match counts — never guess.
 *  1) Roster seed: for each bound guild, write users whose
 *     guilds_json includes its bound server into guild_members (nick
 *     from that server's snapshot, may be empty).
 *  2) Seat stamp: stamp signups.discord_id only when an unstamped
 *     seat's nick matches exactly one member candidate (global name
 *     / server nick snapshot; both sources hitting one user is still
 *     one candidate). Two or more = ambiguous, skip; zero = no match.
 * Touches only discord_id and guild_members, never nicks or other
 * fields. */
export interface ReminderIdentityGuildReport {
  slug: string; discordGuildId: string; rosterSeeded: number;
  seatsTotal: number; stamped: number; ambiguous: number; unmatched: number;
}
export interface ReminderIdentityReport {
  dryRun: boolean;
  guilds: ReminderIdentityGuildReport[];
  totals: { rosterSeeded: number; seatsTotal: number; stamped: number; ambiguous: number; unmatched: number };
}

export async function runReminderIdentityBackfill(
  db: D1Database, dryRun: boolean,
): Promise<ReminderIdentityReport> {
  const bindRows = await listNonEmptySettingsByKey(db, 'discord_guild_id');
  const allUsers = await listUsersDirectory(db);
  const userInGuild = (u: any, dgid: any) => {
    try {
      const gs = JSON.parse(u.guilds_json || '[]');
      return Array.isArray(gs) && gs.some((g: any) => String(typeof g === 'object' && g ? g.id : g) === String(dgid));
    } catch { return false; }
  };
  const guilds: ReminderIdentityGuildReport[] = [];
  const totals = { rosterSeeded: 0, seatsTotal: 0, stamped: 0, ambiguous: 0, unmatched: 0 };
  for (const b of bindRows) {
    const guildId = Number(b.tenant), dgid = String(b.value);
    const slugRow = await getTenantRowById(db, guildId).catch(() => null);
    const slug = slugRow ? slugRow.slug : String(guildId);
    const members = (allUsers || []).filter((u) => userInGuild(u, dgid));
    const nickRows = await listNicksByGuild(db, dgid);
    const nickOf = new Map((nickRows || []).map((r) => [String(r.discord_id), String(r.nick || '')]));
    // 1) Seed the roster
    let rosterSeeded = 0;
    for (const u of members) {
      rosterSeeded++;
      if (!dryRun) {
        await upsertGuildMember(db, slug, u.discord_id, nickOf.get(String(u.discord_id)) || '', u.username || '');
      }
    }
    // 2) Stamp seats
    const seats = await listUnstampedSeatsByTenant(db, guildId);
    let stamped = 0, ambiguous = 0, unmatched = 0;
    for (const seat of seats || []) {
      const nick = String(seat.nickname || '').trim();
      const hits = new Set<string>();
      if (nick) {
        for (const u of members) {
          if (String(u.username || '').trim() === nick || (nickOf.get(String(u.discord_id)) || '').trim() === nick) {
            hits.add(String(u.discord_id));
          }
        }
      }
      if (hits.size === 1) {
        stamped++;
        if (!dryRun) {
          await stampSignupDiscordId(db, seat.id, [...hits][0]);
        }
      } else if (hits.size > 1) ambiguous++;
      else unmatched++;
    }
    guilds.push({
      slug, discordGuildId: dgid, rosterSeeded,
      seatsTotal: (seats || []).length, stamped, ambiguous, unmatched,
    });
    totals.rosterSeeded += rosterSeeded;
    totals.seatsTotal += (seats || []).length;
    totals.stamped += stamped; totals.ambiguous += ambiguous; totals.unmatched += unmatched;
  }
  return { dryRun, guilds, totals };
}

/* ---------- Creator stamps backfill ----------
 * Backfill leader identity for legacy teams. Teams created before
 * a recorded creator have only the created_by display string
 * (hand-typed on REST creation; a hardcoded placeholder on GraphQL
 * creation) and no authoritative identity, so the leader-only
 * disband/delete rule could never apply to them. Backfill accepts
 * only unambiguous evidence: created_by matches a user's Discord
 * global name (users.username, stored at login) or their nick
 * snapshot in the guild's bound server (user_guild_nicks), with
 * exactly one candidate (bound guilds add a membership check:
 * guilds_json includes the server, or the nick snapshot itself is
 * membership evidence). Placeholders, no match and multiple
 * candidates are left untouched (leaderless; only the admin path can
 * delete). Never guess, never fuzzy-match. dryRun reports only.
 * Idempotent: only rows with an empty creator_user_id are
 * processed. Matching runs in Discord-ID space (names and nick
 * snapshots are Discord-side evidence); the stamp writes the
 * matched user's typed user ID. */
export interface CreatorBackfillGroup {
  tenant: string; createdBy: string; cars: number; outcome: string;
  matchedDiscordId: string | null; candidates: number;
}
export interface CreatorBackfillReport {
  dryRun: boolean;
  totals: {
    events: number; alreadyStamped: number; considered: number; backfilled: number;
    placeholder: number; noMatch: number; ambiguous: number;
  };
  groups: CreatorBackfillGroup[];
}

const CREATOR_PLACEHOLDERS = new Set(['', '热心侠客', '热心车友']);

export async function runCreatorBackfillStamps(
  db: D1Database, dryRun: boolean,
): Promise<CreatorBackfillReport> {
  // User directory: global name -> discord_id set; membership: discord_id -> server set
  const userRows = await listUsersDirectory(db);
  const userIdByDiscord = new Map<string, number>();
  for (const u of userRows) userIdByDiscord.set(String(u.discord_id), Number(u.id));
  const byGlobalName = new Map<string, Set<string>>();
  const memberOf = new Map<string, Set<string>>();
  for (const u of userRows) {
    const did = String(u.discord_id);
    const name = String(u.username || '').trim();
    if (name) {
      if (!byGlobalName.has(name)) byGlobalName.set(name, new Set());
      byGlobalName.get(name)!.add(did);
    }
    let guildIds = new Set<string>();
    try {
      const gs = JSON.parse(u.guilds_json || '[]');
      if (Array.isArray(gs)) guildIds = new Set(gs.map((g: any) => String(g && g.id)));
    } catch { /* corrupt guilds_json counts as no membership evidence */ }
    memberOf.set(did, guildIds);
  }
  // Server nick snapshot index: `${guild_id}|${nick}` -> discord_id set
  const nickIndex = new Map<string, Set<string>>();
  try {
    const nickRows = await listAllNicks(db);
    for (const n of nickRows) {
      const nick = String(n.nick || '').trim();
      if (!nick) continue;
      const key = String(n.guild_id) + '|' + nick;
      if (!nickIndex.has(key)) nickIndex.set(key, new Set());
      nickIndex.get(key)!.add(String(n.discord_id));
    }
  } catch { /* if the snapshot table is missing, match on global names only */ }
  const bindRows = await listSettingsByKey(db, 'discord_guild_id');
  const bindMap = new Map(bindRows.map((r) => [String(r.tenant), String(r.value || '')]));

  const cars = await listEventsForCreatorBackfill(db);
  const rep: CreatorBackfillReport = {
    dryRun,
    totals: {
      events: cars.length, alreadyStamped: 0, considered: 0, backfilled: 0,
      placeholder: 0, noMatch: 0, ambiguous: 0,
    },
    groups: [],
  };
  const groupMap = new Map<string, CreatorBackfillGroup>();
  const groupOf = (tenant: string, createdBy: string) => {
    const key = tenant + '|' + createdBy;
    if (!groupMap.has(key)) {
      const g: CreatorBackfillGroup = {
        tenant, createdBy, cars: 0, outcome: 'considered', matchedDiscordId: null, candidates: 0,
      };
      groupMap.set(key, g);
      rep.groups.push(g);
    }
    return groupMap.get(key)!;
  };
  const updates: Array<{ userId: number; eventId: number }> = [];
  for (const car of cars) {
    if (car.creator_user_id) {
      rep.totals.alreadyStamped++;
      continue;
    }
    rep.totals.considered++;
    const cb = String(car.created_by ?? '').trim();
    const g = groupOf(String(car.tenant), cb);
    g.cars++;
    if (CREATOR_PLACEHOLDERS.has(cb)) { rep.totals.placeholder++; g.outcome = 'placeholder'; continue; }
    const gid = bindMap.get(String(car.tenant)) || '';
    const cand = new Set<string>();
    for (const did of byGlobalName.get(cb) || []) cand.add(did);
    const nickHits: Set<string> = gid ? (nickIndex.get(gid + '|' + cb) || new Set()) : new Set();
    for (const did of nickHits) cand.add(did);
    // Guild scoping: bound guilds accept only that server's members (a
    // global-name hit needs a membership record; a nick-snapshot hit is
    // itself membership evidence, snapshots being fetched for members only).
    const scoped = gid
      ? [...cand].filter((did) => (memberOf.get(did) || new Set()).has(gid) || nickHits.has(did))
      : [...cand];
    g.candidates = scoped.length;
    if (scoped.length === 1) {
      g.outcome = 'matched';
      g.matchedDiscordId = scoped[0];
      rep.totals.backfilled++;
      updates.push({ userId: userIdByDiscord.get(scoped[0]) || 0, eventId: car.id });
    } else if (scoped.length === 0) {
      rep.totals.noMatch++;
      g.outcome = 'noMatch';
    } else {
      rep.totals.ambiguous++;
      g.outcome = 'ambiguous';
    }
  }
  if (!dryRun && updates.length) {
    await stampEventCreators(db, updates);
  }
  return rep;
}

/* ---------- Boss guide structured migration ----------
 * One-off materialization: parse bosses.guide text into the
 * structured columns using the legacy frontend's split rules, for
 * the GraphQL boss page. Idempotent: the result depends only on the
 * guide text. Kept as an operator action (not deleted with the
 * portal) because guide text can still be edited through the boss
 * update mutation, after which re-materialization is the refresh
 * path for the structured columns. */
export interface GuideMigrationEntry {
  id: number; name: string; mechanics: number; talents: number; shouts: number;
}

export async function runBossGuideStructuredMigration(
  db: D1Database,
): Promise<{ migrated: GuideMigrationEntry[] }> {
  const results = await listBossesWithGuide(db);
  const migrated: GuideMigrationEntry[] = [];
  for (const b of results) {
    const st = parseGuideStructured(b.guide);
    await updateBossFields(db, b.id, {
      mechanics_json: JSON.stringify(st.mechanics),
      talents_json: JSON.stringify(st.talents),
      shouts_json: JSON.stringify(st.shouts),
    });
    migrated.push({
      id: b.id, name: b.name,
      mechanics: st.mechanics.length, talents: st.talents.length, shouts: st.shouts.length,
    });
  }
  return { migrated };
}
