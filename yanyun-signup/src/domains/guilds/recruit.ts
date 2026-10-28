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
import { mintPublicId } from '../platform/id-mint.ts';
import { listUserSeatFactsInGuild } from '../groupings/signups.ts';
import { getMemberAvailability, parseAvailabilitySlots } from '../groupings/availability.ts';

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
  tenant: number;
  user_id: number;
  applicant_name: string;
  message: string;
  status: string;
  reviewed_by_user_id: number;
  reviewed_by_name: string;
  created_at: number;
  reviewed_at: number | null;
}

const APPLICATION_COLS = sql`${guildApplications.id}, ${guildApplications.tenant}, ${guildApplications.userId}, ${guildApplications.applicantName}, ${guildApplications.message}, ${guildApplications.status}, ${guildApplications.reviewedByUserId}, ${guildApplications.reviewedByName}, ${guildApplications.createdAt}, ${guildApplications.reviewedAt}`;

/** Insert one application (status starts 'pending'); returns the new row id.
 * The partial unique index (one pending per guild + applicant) is the
 * schema-level backstop for the mutation's dedupe check. */
export async function insertApplication(
  d1: D1Database,
  row: { tenant: number; userId: number; applicantName: string; message: string; createdAt: number },
): Promise<number> {
  const db = createDb(d1);
  const id = await mintPublicId(d1, 'recruitApplication');
  await db.run(
    sql`INSERT INTO ${guildApplications} (${col('id')}, ${col('tenant')}, ${col('user_id')}, ${col('applicant_name')}, ${col('message')}, ${col('created_at')})
        VALUES (${id}, ${row.tenant}, ${row.userId}, ${row.applicantName}, ${row.message}, ${row.createdAt})`,
  );
  return id;
}

/** The applicant's pending application in this guild, if any (the dedupe read). */
export async function getPendingApplication(
  d1: D1Database, tenant: number, userId: number,
): Promise<GuildApplicationRow | null> {
  const db = createDb(d1);
  const row = await db.get<GuildApplicationRow>(
    sql`SELECT ${APPLICATION_COLS} FROM ${guildApplications}
        WHERE ${guildApplications.tenant} = ${tenant} AND ${guildApplications.userId} = ${userId}
          AND ${guildApplications.status} = 'pending'`,
  );
  return row ?? null;
}

/** The applicant's most recent application in this guild (their status view). */
export async function getLatestApplication(
  d1: D1Database, tenant: number, userId: number,
): Promise<GuildApplicationRow | null> {
  const db = createDb(d1);
  const row = await db.get<GuildApplicationRow>(
    sql`SELECT ${APPLICATION_COLS} FROM ${guildApplications}
        WHERE ${guildApplications.tenant} = ${tenant} AND ${guildApplications.userId} = ${userId}
        ORDER BY ${guildApplications.id} DESC LIMIT 1`,
  );
  return row ?? null;
}

/** All of one guild's applications, newest first (the admin review surface). */
export async function listApplicationsByTenant(
  d1: D1Database, tenant: number, limit: number = APPLICATION_LIST_LIMIT,
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
  d1: D1Database, id: number, tenant: number,
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
  d1: D1Database, id: number, tenant: number,
  review: { status: 'approved' | 'rejected'; reviewedByUserId: number; reviewedByName: string; reviewedAt: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${guildApplications}
        SET ${col('status')} = ${review.status}, ${col('reviewed_by_user_id')} = ${review.reviewedByUserId},
            ${col('reviewed_by_name')} = ${review.reviewedByName}, ${col('reviewed_at')} = ${review.reviewedAt}
        WHERE ${col('id')} = ${id} AND ${col('tenant')} = ${tenant} AND ${col('status')} = 'pending'`,
  );
  return metaOf(r);
}

/* ================= F17: the mentor pool ================= */

/** Designated mentor user ids of one guild (the candidate pool). */
export async function listMentorIds(d1: D1Database, tenant: number): Promise<number[]> {
  const db = createDb(d1);
  const rows = await db.all<{ user_id: number }>(
    sql`SELECT ${guildMentors.userId} FROM ${guildMentors} WHERE ${guildMentors.tenant} = ${tenant}`,
  );
  return (rows || []).map((r) => Number(r.user_id));
}

/** Designate a guild member as a mentor candidate (idempotent). */
export async function insertMentor(
  d1: D1Database, tenant: number, userId: number, createdAt: number,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${guildMentors} (${col('tenant')}, ${col('user_id')}, ${col('created_at')})
        VALUES (${tenant}, ${userId}, ${createdAt})
        ON CONFLICT (${col('tenant')}, ${col('user_id')}) DO NOTHING`,
  );
}

/** Remove a mentor designation. Existing pairings are untouched. */
export async function deleteMentor(
  d1: D1Database, tenant: number, userId: number,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`DELETE FROM ${guildMentors} WHERE ${col('tenant')} = ${tenant} AND ${col('user_id')} = ${userId}`,
  );
  return metaOf(r);
}

/* ================= F17: mentor pairings ================= */

export interface MentorPairingRow {
  id: number;
  tenant: number;
  mentor_user_id: number;
  mentor_name: string;
  mentee_user_id: number;
  mentee_name: string;
  status: string;
  created_by_user_id: number;
  created_at: number;
  ended_at: number | null;
}

const PAIRING_COLS = sql`${mentorPairings.id}, ${mentorPairings.tenant}, ${mentorPairings.mentorUserId}, ${mentorPairings.mentorName}, ${mentorPairings.menteeUserId}, ${mentorPairings.menteeName}, ${mentorPairings.status}, ${mentorPairings.createdByUserId}, ${mentorPairings.createdAt}, ${mentorPairings.endedAt}`;

/** Create an active pairing; returns the new row id. The partial
 * unique index (one active pairing per mentee) backstops the
 * mutation's already-paired check. */
export async function insertPairing(
  d1: D1Database,
  row: {
    tenant: number; mentorUserId: number; mentorName: string;
    menteeUserId: number; menteeName: string; createdByUserId: number; createdAt: number;
  },
): Promise<number> {
  const db = createDb(d1);
  const id = await mintPublicId(d1, 'mentorPairing');
  await db.run(
    sql`INSERT INTO ${mentorPairings} (${col('id')}, ${col('tenant')}, ${col('mentor_user_id')}, ${col('mentor_name')}, ${col('mentee_user_id')}, ${col('mentee_name')}, ${col('created_by_user_id')}, ${col('created_at')})
        VALUES (${id}, ${row.tenant}, ${row.mentorUserId}, ${row.mentorName}, ${row.menteeUserId}, ${row.menteeName}, ${row.createdByUserId}, ${row.createdAt})`,
  );
  return id;
}

/** One pairing of one guild; null when it does not exist THERE. */
export async function getPairingByTenant(
  d1: D1Database, id: number, tenant: number,
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
  d1: D1Database, tenant: number, limit: number = PAIRING_LIST_LIMIT,
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
  d1: D1Database, tenant: number, userId: number,
): Promise<MentorPairingRow[]> {
  const db = createDb(d1);
  const rows = await db.all<MentorPairingRow>(
    sql`SELECT ${PAIRING_COLS} FROM ${mentorPairings}
        WHERE ${mentorPairings.tenant} = ${tenant}
          AND (${mentorPairings.mentorUserId} = ${userId} OR ${mentorPairings.menteeUserId} = ${userId})
        ORDER BY ${mentorPairings.id} DESC`,
  );
  return rows || [];
}

/** The mentee's active pairing in this guild, if any (checklist + already-paired reads). */
export async function getActivePairingForMentee(
  d1: D1Database, tenant: number, menteeUserId: number,
): Promise<MentorPairingRow | null> {
  const db = createDb(d1);
  const row = await db.get<MentorPairingRow>(
    sql`SELECT ${PAIRING_COLS} FROM ${mentorPairings}
        WHERE ${mentorPairings.tenant} = ${tenant} AND ${mentorPairings.menteeUserId} = ${menteeUserId}
          AND ${mentorPairings.status} = 'active'`,
  );
  return row ?? null;
}

/** End an active pairing (status + ended_at). The still-active guard
 * makes a raced second end a no-op reporting changes = 0. */
export async function endPairing(
  d1: D1Database, id: number, tenant: number, endedAt: number,
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
 *  - availability: the member has at least one stored weekly
 *    availability slot in this guild (F5) — the editor lives in
 *    personal settings; the item is guidance only, skippable and
 *    never blocking.
 *  - mentor: the member is the mentee of an ACTIVE pairing in
 *    this guild (F17).
 *  - firstRun: the member holds a seat in a grouping of this
 *    guild whose status is 'completed'. */
export interface NewcomerChecklistFacts {
  profileDone: boolean;
  availabilityDone: boolean;
  mentorDone: boolean;
  firstRunDone: boolean;
  doneCount: number;
  allDone: boolean;
}

export async function computeNewcomerChecklist(
  d1: D1Database, tenant: number, discordId: string, userId: number,
): Promise<NewcomerChecklistFacts> {
  // Seat facts key on the seat stamp (signups.discord_id, a Discord
  // boundary column); pairing and availability key on the user ID.
  const seats = await listUserSeatFactsInGuild(d1, tenant, discordId).catch(() => []);
  const profileDone = seats.some((x) => String(x.weapon || '').trim() !== '');
  const firstRunDone = seats.some((x) => x.event_status === 'completed');
  const pairing = await getActivePairingForMentee(d1, tenant, userId).catch(() => null);
  const mentorDone = !!pairing;
  const availRow = await getMemberAvailability(d1, tenant, userId).catch(() => null);
  const availabilityDone = !!availRow && parseAvailabilitySlots(availRow.slots_json).length > 0;
  const doneCount = [profileDone, availabilityDone, mentorDone, firstRunDone].filter(Boolean).length;
  return { profileDone, availabilityDone, mentorDone, firstRunDone, doneCount, allDone: doneCount === 4 };
}
