/* ===================================================
 * Data-layer access (Repository) for the cross-guild network line
 * (P19 fill-in market + P20 guild alliances).
 *
 * Placement: this line's entities are guild-to-guild relations and
 * person-to-market offers, so the repositories live in the guilds
 * domain; grouping facts (events, seats) are read and written only
 * through the groupings repositories, never from SQL here.
 *
 * P19 pricing is per-edge (DESIGN.md §9): the supply edge is free,
 * the demand edge is T3 — that verdict lives on the GraphQL surface
 * (tierLocked), never in this file. The market MATCHES only: no
 * function here creates a seat. Seating a matched supplier is the
 * demand side's manual action on the grouping (groupings repo).
 *
 * P20 symmetry rule: an alliance pair is stored ONCE, with the two
 * slugs in lexicographic order (guild_low < guild_high) — the
 * canonical pair key every function below derives via pairKey().
 * Sharing reads consult the CURRENT alliance status on every call,
 * so ending an alliance revokes sharing at read time; nothing here
 * caches a verdict.
 *
 * Rows keep snake_case keys; writes return D1 meta, same shape as
 * the other repositories. Status transitions carry their
 * still-in-state guard in the WHERE clause, so a raced second
 * transition reports changes = 0 instead of rewriting history.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { fillOffers, fillRequests, fillInvites, guildAlliances } from './schema.ts';

const col = (name: string) => sql.identifier(name);

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

const nowSec = () => Math.floor(Date.now() / 1000);

/** Self-description cap on offers / requests, enforced by the mutations. */
export const FILL_NOTE_MAX = 200;
/** Market list caps (browse surfaces). */
export const FILL_OFFER_LIST_LIMIT = 100;
export const FILL_REQUEST_LIST_LIMIT = 100;

/* ================= P19: supply offers ================= */

export interface FillOfferRow {
  id: number;
  discord_id: string;
  display_name: string;
  home_tenant: string;
  school: string;
  windows_json: string;
  note: string;
  status: string;
  created_at: number;
  updated_at: number;
}

const OFFER_COLS = sql`${fillOffers.id}, ${fillOffers.discordId}, ${fillOffers.displayName}, ${fillOffers.homeTenant}, ${fillOffers.school}, ${fillOffers.windowsJson}, ${fillOffers.note}, ${fillOffers.status}, ${fillOffers.createdAt}, ${fillOffers.updatedAt}`;

/** Publish one offer (status 'open'); returns the new row id. The
 * partial unique index (one open offer per person) backstops the
 * mutation's already-published check. */
export async function insertFillOffer(
  d1: D1Database,
  row: { discordId: string; displayName: string; homeTenant: string; school: string; windowsJson: string; note: string; at: number },
): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${fillOffers} (${col('discord_id')}, ${col('display_name')}, ${col('home_tenant')}, ${col('school')}, ${col('windows_json')}, ${col('note')}, ${col('created_at')}, ${col('updated_at')})
        VALUES (${row.discordId}, ${row.displayName}, ${row.homeTenant}, ${row.school}, ${row.windowsJson}, ${row.note}, ${row.at}, ${row.at})`,
  );
  return metaOf(r).last_row_id;
}

/** The person's open offer, if one exists (their supply-section read). */
export async function getOpenOfferForUser(
  d1: D1Database, discordId: string,
): Promise<FillOfferRow | null> {
  const db = createDb(d1);
  const row = await db.get<FillOfferRow>(
    sql`SELECT ${OFFER_COLS} FROM ${fillOffers}
        WHERE ${fillOffers.discordId} = ${discordId} AND ${fillOffers.status} = 'open'`,
  );
  return row ?? null;
}

export async function getFillOfferById(
  d1: D1Database, id: number,
): Promise<FillOfferRow | null> {
  const db = createDb(d1);
  const row = await db.get<FillOfferRow>(
    sql`SELECT ${OFFER_COLS} FROM ${fillOffers} WHERE ${fillOffers.id} = ${id}`,
  );
  return row ?? null;
}

/** All open offers, newest first — the demand side's browse list.
 * The surface composes only market-necessary fields off these rows. */
export async function listOpenFillOffers(
  d1: D1Database, limit: number = FILL_OFFER_LIST_LIMIT,
): Promise<FillOfferRow[]> {
  const db = createDb(d1);
  const rows = await db.all<FillOfferRow>(
    sql`SELECT ${OFFER_COLS} FROM ${fillOffers}
        WHERE ${fillOffers.status} = 'open'
        ORDER BY ${fillOffers.id} DESC LIMIT ${limit}`,
  );
  return rows || [];
}

/** Withdraw the person's open offer (still-open guard: a raced
 * second withdraw changes nothing). */
export async function withdrawFillOffer(
  d1: D1Database, discordId: string, at: number,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${fillOffers}
        SET ${col('status')} = 'withdrawn', ${col('updated_at')} = ${at}
        WHERE ${col('discord_id')} = ${discordId} AND ${col('status')} = 'open'`,
  );
  return metaOf(r);
}

/* ================= P19: demand requests ================= */

export interface FillRequestRow {
  id: number;
  tenant: string;
  event_id: number;
  needed_role: string;
  needed_school: string;
  note: string;
  status: string;
  created_by: string;
  created_by_name: string;
  created_at: number;
  matched_at: number | null;
  closed_at: number | null;
}

const REQUEST_COLS = sql`${fillRequests.id}, ${fillRequests.tenant}, ${fillRequests.eventId}, ${fillRequests.neededRole}, ${fillRequests.neededSchool}, ${fillRequests.note}, ${fillRequests.status}, ${fillRequests.createdBy}, ${fillRequests.createdByName}, ${fillRequests.createdAt}, ${fillRequests.matchedAt}, ${fillRequests.closedAt}`;

export async function insertFillRequest(
  d1: D1Database,
  row: {
    tenant: string; eventId: number; neededRole: string; neededSchool: string;
    note: string; createdBy: string; createdByName: string; at: number;
  },
): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${fillRequests} (${col('tenant')}, ${col('event_id')}, ${col('needed_role')}, ${col('needed_school')}, ${col('note')}, ${col('created_by')}, ${col('created_by_name')}, ${col('created_at')})
        VALUES (${row.tenant}, ${row.eventId}, ${row.neededRole}, ${row.neededSchool}, ${row.note}, ${row.createdBy}, ${row.createdByName}, ${row.at})`,
  );
  return metaOf(r).last_row_id;
}

/** One request of one guild; null when it does not exist THERE. */
export async function getFillRequestByTenant(
  d1: D1Database, id: number, tenant: string,
): Promise<FillRequestRow | null> {
  const db = createDb(d1);
  const row = await db.get<FillRequestRow>(
    sql`SELECT ${REQUEST_COLS} FROM ${fillRequests}
        WHERE ${fillRequests.id} = ${id} AND ${fillRequests.tenant} = ${tenant}`,
  );
  return row ?? null;
}

export async function getFillRequestById(
  d1: D1Database, id: number,
): Promise<FillRequestRow | null> {
  const db = createDb(d1);
  const row = await db.get<FillRequestRow>(
    sql`SELECT ${REQUEST_COLS} FROM ${fillRequests} WHERE ${fillRequests.id} = ${id}`,
  );
  return row ?? null;
}

/** All of one guild's requests, newest first (the demand section). */
export async function listFillRequestsByTenant(
  d1: D1Database, tenant: string, limit: number = FILL_REQUEST_LIST_LIMIT,
): Promise<FillRequestRow[]> {
  const db = createDb(d1);
  const rows = await db.all<FillRequestRow>(
    sql`SELECT ${REQUEST_COLS} FROM ${fillRequests}
        WHERE ${fillRequests.tenant} = ${tenant}
        ORDER BY ${fillRequests.id} DESC LIMIT ${limit}`,
  );
  return rows || [];
}

/** open -> matched (a supplier accepted). Still-open guard. */
export async function markFillRequestMatched(
  d1: D1Database, id: number, at: number,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${fillRequests}
        SET ${col('status')} = 'matched', ${col('matched_at')} = ${at}
        WHERE ${col('id')} = ${id} AND ${col('status')} = 'open'`,
  );
  return metaOf(r);
}

/** open|matched -> closed (poster closes). Guard excludes already-closed. */
export async function closeFillRequest(
  d1: D1Database, id: number, at: number,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${fillRequests}
        SET ${col('status')} = 'closed', ${col('closed_at')} = ${at}
        WHERE ${col('id')} = ${id} AND ${col('status')} IN ('open', 'matched')`,
  );
  return metaOf(r);
}

/* ================= P19: invites ================= */

export interface FillInviteRow {
  id: number;
  request_id: number;
  offer_id: number;
  tenant: string;
  event_id: number;
  from_discord_id: string;
  from_name: string;
  to_discord_id: string;
  to_name: string;
  status: string;
  created_at: number;
  responded_at: number | null;
}

const INVITE_COLS = sql`${fillInvites.id}, ${fillInvites.requestId}, ${fillInvites.offerId}, ${fillInvites.tenant}, ${fillInvites.eventId}, ${fillInvites.fromDiscordId}, ${fillInvites.fromName}, ${fillInvites.toDiscordId}, ${fillInvites.toName}, ${fillInvites.status}, ${fillInvites.createdAt}, ${fillInvites.respondedAt}`;

export async function insertFillInvite(
  d1: D1Database,
  row: {
    requestId: number; offerId: number; tenant: string; eventId: number;
    fromDiscordId: string; fromName: string; toDiscordId: string; toName: string; at: number;
  },
): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${fillInvites} (${col('request_id')}, ${col('offer_id')}, ${col('tenant')}, ${col('event_id')}, ${col('from_discord_id')}, ${col('from_name')}, ${col('to_discord_id')}, ${col('to_name')}, ${col('created_at')})
        VALUES (${row.requestId}, ${row.offerId}, ${row.tenant}, ${row.eventId}, ${row.fromDiscordId}, ${row.fromName}, ${row.toDiscordId}, ${row.toName}, ${row.at})`,
  );
  return metaOf(r).last_row_id;
}

export async function getFillInviteById(
  d1: D1Database, id: number,
): Promise<FillInviteRow | null> {
  const db = createDb(d1);
  const row = await db.get<FillInviteRow>(
    sql`SELECT ${INVITE_COLS} FROM ${fillInvites} WHERE ${fillInvites.id} = ${id}`,
  );
  return row ?? null;
}

/** The live (pending/accepted) invite for one (request, supplier) pair, if one exists. */
export async function getLiveInviteForPair(
  d1: D1Database, requestId: number, toDiscordId: string,
): Promise<FillInviteRow | null> {
  const db = createDb(d1);
  const row = await db.get<FillInviteRow>(
    sql`SELECT ${INVITE_COLS} FROM ${fillInvites}
        WHERE ${fillInvites.requestId} = ${requestId} AND ${fillInvites.toDiscordId} = ${toDiscordId}
          AND ${fillInvites.status} IN ('pending', 'accepted')`,
  );
  return row ?? null;
}

/** Invites addressed to one supplier, newest first (their inbox). */
export async function listInvitesForSupplier(
  d1: D1Database, discordId: string, limit: number = FILL_REQUEST_LIST_LIMIT,
): Promise<FillInviteRow[]> {
  const db = createDb(d1);
  const rows = await db.all<FillInviteRow>(
    sql`SELECT ${INVITE_COLS} FROM ${fillInvites}
        WHERE ${fillInvites.toDiscordId} = ${discordId}
        ORDER BY ${fillInvites.id} DESC LIMIT ${limit}`,
  );
  return rows || [];
}

/** Invites issued under one request, newest first (the poster's view). */
export async function listInvitesByRequest(
  d1: D1Database, requestId: number,
): Promise<FillInviteRow[]> {
  const db = createDb(d1);
  const rows = await db.all<FillInviteRow>(
    sql`SELECT ${INVITE_COLS} FROM ${fillInvites}
        WHERE ${fillInvites.requestId} = ${requestId}
        ORDER BY ${fillInvites.id} DESC`,
  );
  return rows || [];
}

/** Supplier settles a pending invite. Still-pending guard. */
export async function respondFillInvite(
  d1: D1Database, id: number, toDiscordId: string, accept: boolean, at: number,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${fillInvites}
        SET ${col('status')} = ${accept ? 'accepted' : 'declined'}, ${col('responded_at')} = ${at}
        WHERE ${col('id')} = ${id} AND ${col('to_discord_id')} = ${toDiscordId} AND ${col('status')} = 'pending'`,
  );
  return metaOf(r);
}

/** Settle every still-pending invite of a request as expired (run
 * when the request matches another supplier or closes). */
export async function expirePendingInvitesForRequest(
  d1: D1Database, requestId: number, at: number,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${fillInvites}
        SET ${col('status')} = 'expired', ${col('responded_at')} = ${at}
        WHERE ${col('request_id')} = ${requestId} AND ${col('status')} = 'pending'`,
  );
  return metaOf(r);
}

/* ================= P20: alliances ================= */

export interface GuildAllianceRow {
  id: number;
  guild_low: string;
  guild_high: string;
  status: string;
  requested_by_tenant: string;
  requested_by: string;
  requested_by_name: string;
  created_at: number;
  responded_at: number | null;
  ended_at: number | null;
  ended_by_tenant: string;
}

const ALLIANCE_COLS = sql`${guildAlliances.id}, ${guildAlliances.guildLow}, ${guildAlliances.guildHigh}, ${guildAlliances.status}, ${guildAlliances.requestedByTenant}, ${guildAlliances.requestedBy}, ${guildAlliances.requestedByName}, ${guildAlliances.createdAt}, ${guildAlliances.respondedAt}, ${guildAlliances.endedAt}, ${guildAlliances.endedByTenant}`;

/** The canonical pair key: the two slugs in lexicographic order. */
export function alliancePairKey(a: string, b: string): { low: string; high: string } {
  return a < b ? { low: a, high: b } : { low: b, high: a };
}

/** The other side of a pair, from one guild's point of view. */
export function allianceOtherSlug(row: GuildAllianceRow, slug: string): string {
  return row.guild_low === slug ? row.guild_high : row.guild_low;
}

export async function insertAlliance(
  d1: D1Database,
  row: { fromTenant: string; toTenant: string; requestedBy: string; requestedByName: string; at: number },
): Promise<number> {
  const { low, high } = alliancePairKey(row.fromTenant, row.toTenant);
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${guildAlliances} (${col('guild_low')}, ${col('guild_high')}, ${col('requested_by_tenant')}, ${col('requested_by')}, ${col('requested_by_name')}, ${col('created_at')})
        VALUES (${low}, ${high}, ${row.fromTenant}, ${row.requestedBy}, ${row.requestedByName}, ${row.at})`,
  );
  return metaOf(r).last_row_id;
}

export async function getAllianceById(
  d1: D1Database, id: number,
): Promise<GuildAllianceRow | null> {
  const db = createDb(d1);
  const row = await db.get<GuildAllianceRow>(
    sql`SELECT ${ALLIANCE_COLS} FROM ${guildAlliances} WHERE ${guildAlliances.id} = ${id}`,
  );
  return row ?? null;
}

/** The pair's live (pending/active) relation, if one exists. */
export async function getLiveAllianceBetween(
  d1: D1Database, a: string, b: string,
): Promise<GuildAllianceRow | null> {
  const { low, high } = alliancePairKey(a, b);
  const db = createDb(d1);
  const row = await db.get<GuildAllianceRow>(
    sql`SELECT ${ALLIANCE_COLS} FROM ${guildAlliances}
        WHERE ${guildAlliances.guildLow} = ${low} AND ${guildAlliances.guildHigh} = ${high}
          AND ${guildAlliances.status} IN ('pending', 'active')`,
  );
  return row ?? null;
}

/** The ACTIVE relation between two guilds, if one exists — THE sharing
 * verdict, consulted at read time on every shared read/signup. */
export async function getActiveAllianceBetween(
  d1: D1Database, a: string, b: string,
): Promise<GuildAllianceRow | null> {
  const { low, high } = alliancePairKey(a, b);
  const db = createDb(d1);
  const row = await db.get<GuildAllianceRow>(
    sql`SELECT ${ALLIANCE_COLS} FROM ${guildAlliances}
        WHERE ${guildAlliances.guildLow} = ${low} AND ${guildAlliances.guildHigh} = ${high}
          AND ${guildAlliances.status} = 'active'`,
  );
  return row ?? null;
}

/** Every live relation touching one guild (its alliance page). */
export async function listAlliancesForGuild(
  d1: D1Database, slug: string, limit: number = FILL_REQUEST_LIST_LIMIT,
): Promise<GuildAllianceRow[]> {
  const db = createDb(d1);
  const rows = await db.all<GuildAllianceRow>(
    sql`SELECT ${ALLIANCE_COLS} FROM ${guildAlliances}
        WHERE (${guildAlliances.guildLow} = ${slug} OR ${guildAlliances.guildHigh} = ${slug})
          AND ${guildAlliances.status} IN ('pending', 'active')
        ORDER BY ${guildAlliances.id} DESC LIMIT ${limit}`,
  );
  return rows || [];
}

/** Slugs of the guilds ACTIVELY allied with this one (the sharing
 * scope for ally-visible groupings; read fresh on every call). */
export async function listActiveAllySlugs(
  d1: D1Database, slug: string,
): Promise<string[]> {
  const rows = await listAlliancesForGuild(d1, slug);
  return rows.filter((r) => r.status === 'active').map((r) => allianceOtherSlug(r, slug));
}

/** Target side settles a pending invitation. Guards: still pending
 * AND the responder is not the requesting side. */
export async function respondAlliance(
  d1: D1Database, id: number, responderTenant: string, accept: boolean, at: number,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${guildAlliances}
        SET ${col('status')} = ${accept ? 'active' : 'rejected'}, ${col('responded_at')} = ${at}
        WHERE ${col('id')} = ${id} AND ${col('status')} = 'pending'
          AND ${col('requested_by_tenant')} != ${responderTenant}
          AND (${col('guild_low')} = ${responderTenant} OR ${col('guild_high')} = ${responderTenant})`,
  );
  return metaOf(r);
}

/** Either side dissolves an active alliance (read-time revocation
 * does the rest — no sharing rows exist to clean up). */
export async function endAlliance(
  d1: D1Database, id: number, byTenant: string, at: number,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${guildAlliances}
        SET ${col('status')} = 'ended', ${col('ended_at')} = ${at}, ${col('ended_by_tenant')} = ${byTenant}
        WHERE ${col('id')} = ${id} AND ${col('status')} = 'active'
          AND (${col('guild_low')} = ${byTenant} OR ${col('guild_high')} = ${byTenant})`,
  );
  return metaOf(r);
}

export { nowSec as networkNowSec };
