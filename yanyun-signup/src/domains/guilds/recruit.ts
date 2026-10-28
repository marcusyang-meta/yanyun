/* ===================================================
 * Data-layer access (Repository) for the recruitment line (F16 guild
 * applications, F17 mentor pool + pairings) plus the newcomer
 * checklist derivation (F24).
 *
 * Every read and write is scoped by tenant — an application or
 * pairing id alone never crosses a guild boundary. Rows keep
 * snake_case keys; writes return the D1 meta, same shape as the
 * other repositories. Business code must not hand-roll SQL against
 * these tables.
 *
 * F16 boundary (stated in full, never silently narrowed): the
 * platform has NO Discord write channel — there is no bot token in
 * the Worker's environment, the Discord OAuth grant it holds is the
 * user's own read-only grant (identify / guilds /
 * guilds.members.read), and the only outbound Discord channel is a
 * per-guild webhook, which can post messages but cannot add a
 * member to a server or grant a role. Approving an application
 * therefore does everything the platform itself controls — the
 * application settles as approved with its review trail, and the
 * applicant is enrolled into the platform's own guild roster
 * (guild_members, written by the review path in recruit-graphql /
 * admin-graphql) — and the Discord-server join itself remains the
 * applicant's step on Discord's side, which the approved state
 * names explicitly in its next-step copy.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { guildApplications, mentorPairings, guildMentors } from './schema.ts';
import { listUserSeatFactsInGuild } from '../groupings/signups.ts';

const col = (name: string) => sql.identifier(name);

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

export const APPLICATION_STATUSES = ['pending', 'approved', 'rejected'] as const;
/** Application message cap in characters, enforced by the apply mutation. */
export const APPLICATION_MAX_MESSAGE = 200;
/** Admin-surface list caps: the review queue, the pairing list, the newcomer overview. */
export const APPLICATION_LIST_LIMIT = 200;
export const PAIRING_LIST_LIMIT = 200;

/* ================= F16: guild applications ================= */

export interface GuildApplicationRow {
  id: number;
  tenant: string;
  discord_id: string;
  applicant_name: string;
  message: string;
  status: string;
  reviewed_by: string;
  reviewed_by_name: string;
  created_at: number;
  reviewed_at: number | null;
}

const APPLICATION_COLS = sql`${guildApplications.id}, ${guildApplications.tenant}, ${guildApplications.discordId}, ${guildApplications.applicantName}, ${guildApplications.message}, ${guildApplications.status}, ${guildApplications.reviewedBy}, ${guildApplications.reviewedByName}, ${guildApplications.createdAt}, ${guildApplications.reviewedAt}`;

/** Insert one application (status starts 'pending'); returns the new row id.
 * The partial unique index (one pending per guild + applicant) is the
 * schema-level backstop for the mutation's dedupe check. */
export async function insertApplication(
  d1: D1Database,
  row: { tenant: string; discordId: string; applicantName: string; message: string; createdAt: number },
): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${guildApplications} (${col('tenant')}, ${col('discord_id')}, ${col('applicant_name')}, ${col('message')}, ${col('created_at')})
        VALUES (${row.tenant}, ${row.discordId}, ${row.applicantName}, ${row.message}, ${row.createdAt})`,
  );
  return metaOf(r).last_row_id;
}

/** The applicant's pending application in this guild, if any (the dedupe read). */
export async function getPendingApplication(
  d1: D1Database, tenant: string, discordId: string,
): Promise<GuildApplicationRow | null> {
  const db = createDb(d1);
  const row = await db.get<GuildApplicationRow>(
    sql`SELECT ${APPLICATION_COLS} FROM ${guildApplications}
        WHERE ${guildApplications.tenant} = ${tenant} AND ${guildApplications.discordId} = ${discordId}
          AND ${guildApplications.status} = 'pending'`,
  );
  return row ?? null;
}

/** The applicant's most recent application in this guild (their status view). */
export async function getLatestApplication(
  d1: D1Database, tenant: string, discordId: string,
): Promise<GuildApplicationRow | null> {
  const db = createDb(d1);
  const row = await db.get<GuildApplicationRow>(
    sql`SELECT ${APPLICATION_COLS} FROM ${guildApplications}
        WHERE ${guildApplications.tenant} = ${tenant} AND ${guildApplications.discordId} = ${discordId}
        ORDER BY ${guildApplications.id} DESC LIMIT 1`,
  );
  return row ?? null;
}

/** All of one guild's applications, newest first (the admin review surface). */
export async function listApplicationsByTenant(
  d1: D1Database, tenant: string, limit: number = APPLICATION_LIST_LIMIT,
): Promise<GuildApplicationRow[]> {
  const db = createDb(d1);
  const rows = await db.all<GuildApplicationRow>(
    sql`SELECT ${APPLICATION_COLS} FROM ${guildApplications}
        WHERE ${guildApplications.tenant} = ${tenant}
        ORDER BY ${guildApplications.id} DESC LIMIT ${limit}`,
  );
  return rows || [];
}

/** One application of one guild; null when it does not exist THERE. */
export async function getApplicationByTenant(
  d1: D1Database, id: number, tenant: string,
): Promise<GuildApplicationRow | null> {
  const db = createDb(d1);
  const row = await db.get<GuildApplicationRow>(
    sql`SELECT ${APPLICATION_COLS} FROM ${guildApplications}
        WHERE ${guildApplications.id} = ${id} AND ${guildApplications.tenant} = ${tenant}`,
  );
  return row ?? null;
}

/** Settle a pending application. The WHERE clause carries the
 * still-pending guard, so a raced second review changes nothing and
 * reports changes = 0 — the settled verdict can never be rewritten. */
export async function reviewApplication(
  d1: D1Database, id: number, tenant: string,
  review: { status: 'approved' | 'rejected'; reviewedBy: string; reviewedByName: string; reviewedAt: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${guildApplications}
        SET ${col('status')} = ${review.status}, ${col('reviewed_by')} = ${review.reviewedBy},
            ${col('reviewed_by_name')} = ${review.reviewedByName}, ${col('reviewed_at')} = ${review.reviewedAt}
        WHERE ${col('id')} = ${id} AND ${col('tenant')} = ${tenant} AND ${col('status')} = 'pending'`,
  );
  return metaOf(r);
}

/* ================= F17: the mentor pool ================= */

/** Designated mentor discord ids of one guild (the candidate pool). */
export async function listMentorIds(d1: D1Database, tenant: string): Promise<string[]> {
  const db = createDb(d1);
  const rows = await db.all<{ discord_id: string }>(
    sql`SELECT ${guildMentors.discordId} FROM ${guildMentors} WHERE ${guildMentors.tenant} = ${tenant}`,
  );
  return (rows || []).map((r) => String(r.discord_id));
}

/** Designate a guild member as a mentor candidate (idempotent). */
export async function insertMentor(
  d1: D1Database, tenant: string, discordId: string, createdAt: number,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${guildMentors} (${col('tenant')}, ${col('discord_id')}, ${col('created_at')})
        VALUES (${tenant}, ${discordId}, ${createdAt})
        ON CONFLICT (${col('tenant')}, ${col('discord_id')}) DO NOTHING`,
  );
}

/** Remove a mentor designation. Existing pairings are untouched. */
export async function deleteMentor(
  d1: D1Database, tenant: string, discordId: string,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`DELETE FROM ${guildMentors} WHERE ${col('tenant')} = ${tenant} AND ${col('discord_id')} = ${discordId}`,
  );
  return metaOf(r);
}

/* ================= F17: mentor pairings ================= */

export interface MentorPairingRow {
  id: number;
  tenant: string;
  mentor_discord_id: string;
  mentor_name: string;
  mentee_discord_id: string;
  mentee_name: string;
  status: string;
  created_by: string;
  created_at: number;
  ended_at: number | null;
}

const PAIRING_COLS = sql`${mentorPairings.id}, ${mentorPairings.tenant}, ${mentorPairings.mentorDiscordId}, ${mentorPairings.mentorName}, ${mentorPairings.menteeDiscordId}, ${mentorPairings.menteeName}, ${mentorPairings.status}, ${mentorPairings.createdBy}, ${mentorPairings.createdAt}, ${mentorPairings.endedAt}`;

/** Create an active pairing; returns the new row id. The partial
 * unique index (one active pairing per mentee) backstops the
 * mutation's already-paired check. */
export async function insertPairing(
  d1: D1Database,
  row: {
    tenant: string; mentorDiscordId: string; mentorName: string;
    menteeDiscordId: string; menteeName: string; createdBy: string; createdAt: number;
  },
): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${mentorPairings} (${col('tenant')}, ${col('mentor_discord_id')}, ${col('mentor_name')}, ${col('mentee_discord_id')}, ${col('mentee_name')}, ${col('created_by')}, ${col('created_at')})
        VALUES (${row.tenant}, ${row.mentorDiscordId}, ${row.mentorName}, ${row.menteeDiscordId}, ${row.menteeName}, ${row.createdBy}, ${row.createdAt})`,
  );
  return metaOf(r).last_row_id;
}

/** One pairing of one guild; null when it does not exist THERE. */
export async function getPairingByTenant(
  d1: D1Database, id: number, tenant: string,
): Promise<MentorPairingRow | null> {
  const db = createDb(d1);
  const row = await db.get<MentorPairingRow>(
    sql`SELECT ${PAIRING_COLS} FROM ${mentorPairings}
        WHERE ${mentorPairings.id} = ${id} AND ${mentorPairings.tenant} = ${tenant}`,
  );
  return row ?? null;
}

/** All of one guild's pairings, newest first (the admin pairing list). */
export async function listPairingsByTenant(
  d1: D1Database, tenant: string, limit: number = PAIRING_LIST_LIMIT,
): Promise<MentorPairingRow[]> {
  const db = createDb(d1);
  const rows = await db.all<MentorPairingRow>(
    sql`SELECT ${PAIRING_COLS} FROM ${mentorPairings}
        WHERE ${mentorPairings.tenant} = ${tenant}
        ORDER BY ${mentorPairings.id} DESC LIMIT ${limit}`,
  );
  return rows || [];
}

/** Pairings of one guild where this user is mentor or mentee (their own view). */
export async function listPairingsForUser(
  d1: D1Database, tenant: string, discordId: string,
): Promise<MentorPairingRow[]> {
  const db = createDb(d1);
  const rows = await db.all<MentorPairingRow>(
    sql`SELECT ${PAIRING_COLS} FROM ${mentorPairings}
        WHERE ${mentorPairings.tenant} = ${tenant}
          AND (${mentorPairings.mentorDiscordId} = ${discordId} OR ${mentorPairings.menteeDiscordId} = ${discordId})
        ORDER BY ${mentorPairings.id} DESC`,
  );
  return rows || [];
}

/** The mentee's active pairing in this guild, if any (checklist + already-paired reads). */
export async function getActivePairingForMentee(
  d1: D1Database, tenant: string, menteeDiscordId: string,
): Promise<MentorPairingRow | null> {
  const db = createDb(d1);
  const row = await db.get<MentorPairingRow>(
    sql`SELECT ${PAIRING_COLS} FROM ${mentorPairings}
        WHERE ${mentorPairings.tenant} = ${tenant} AND ${mentorPairings.menteeDiscordId} = ${menteeDiscordId}
          AND ${mentorPairings.status} = 'active'`,
  );
  return row ?? null;
}

/** End an active pairing (status + ended_at). The still-active guard
 * makes a raced second end a no-op reporting changes = 0. */
export async function endPairing(
  d1: D1Database, id: number, tenant: string, endedAt: number,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${mentorPairings}
        SET ${col('status')} = 'ended', ${col('ended_at')} = ${endedAt}
        WHERE ${col('id')} = ${id} AND ${col('tenant')} = ${tenant} AND ${col('status')} = 'active'`,
  );
  return metaOf(r);
}

/* ================= F24: newcomer checklist derivation =================
 * The checklist stores nothing: each item is derived from data the
 * platform already holds, so a check can never drift out of sync
 * with the fact it reports.
 *  - profile: the member has a seat in this guild whose 流派
 *    (signups.weapon — the platform's only stored school field,
 *    filled on the existing signup surface) is non-empty. The
 *    timezone half of the item needs no derivation: the platform
 *    holds no stored timezone profile anywhere — a viewer's
 *    timezone is presented by their client on every request
 *    (x-tz) and used for presentation only, so there is nothing
 *    for a newcomer to fill in; the item's hint copy says so.
 *  - mentor: the member is the mentee of an ACTIVE pairing in
 *    this guild (F17).
 *  - firstRun: the member holds a seat in a grouping of this
 *    guild whose status is 'completed'. */
export interface NewcomerChecklistFacts {
  profileDone: boolean;
  mentorDone: boolean;
  firstRunDone: boolean;
  doneCount: number;
  allDone: boolean;
}

export async function computeNewcomerChecklist(
  d1: D1Database, tenant: string, discordId: string,
): Promise<NewcomerChecklistFacts> {
  const seats = await listUserSeatFactsInGuild(d1, tenant, discordId).catch(() => []);
  const profileDone = seats.some((x) => String(x.weapon || '').trim() !== '');
  const firstRunDone = seats.some((x) => x.event_status === 'completed');
  const pairing = await getActivePairingForMentee(d1, tenant, discordId).catch(() => null);
  const mentorDone = !!pairing;
  const doneCount = [profileDone, mentorDone, firstRunDone].filter(Boolean).length;
  return { profileDone, mentorDone, firstRunDone, doneCount, allDone: doneCount === 3 };
}
