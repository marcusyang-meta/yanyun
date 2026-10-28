/* ===================================================
 * Data-layer access (Repository) for the guild game-name roster
 * (guild_roster_entries) and the roster screenshot import ledger
 * (roster_import_batches / roster_import_rows), plus the pure
 * name-matching rules the import preview is classified with.
 *
 * Roster doctrine: guild_members (Discord-id keyed, written when a
 * bound-server member shows up) is the membership record and is
 * NEVER written by this module. A screenshot name has no Discord
 * identity; confirmed names land in guild_roster_entries, an
 * orthogonal game-name roster, with matched_discord_id as a link
 * snapshot only. Rows keep snake_case keys.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { guildRosterEntries, rosterImportBatches, rosterImportRows } = schema;
const col = (name: string) => sql.identifier(name);

interface RunMeta { changes: number; last_row_id: number }
function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

/* ---------- name normalization + classification (pure) ---------- */

/** Matching normalization: trim, drop ALL whitespace (OCR emits
 *  CJK names character-by-character with spaces), fold case. The
 *  display name itself is stored un-normalized. */
export function normalizeRosterName(raw: string): string {
  return String(raw || '').trim().replace(/\s+/g, '').toLowerCase();
}

/** A plausible in-game name: 2–16 visible characters after cleaning,
 *  containing at least one CJK character or letter, and not made of
 *  digits/punctuation alone (levels, counts and UI chrome OCR'd off
 *  a member list fail this and land in "unrecognized"). */
export function isPlausibleRosterName(raw: string): boolean {
  const name = String(raw || '').trim();
  if (name.length < 2 || name.length > 16) return false;
  if (!/[\u4e00-\u9fffA-Za-z]/.test(name)) return false;
  if (/[<>\\/|@#$%^&*+=~`]/.test(name)) return false;
  return true;
}

export type RosterMatchStatus = 'matched' | 'new' | 'unrecognized';

export interface RosterClassification {
  rawName: string;
  nameNorm: string;
  status: RosterMatchStatus;
  matchedDiscordId: string | null;
  matchedName: string;
}

/** Classify one recognized line against the guild's Discord roster
 *  (norm -> {discordId, displayName}) and its existing game-name
 *  roster entries (norm set). Exact normalized equality is the only
 *  match rule — no fuzzy guessing with people's names. A name that
 *  is already a roster entry counts as matched (to that entry's
 *  linked member, when one exists) so a re-import never duplicates it. */
export function classifyRosterLine(
  raw: string,
  memberByNorm: Map<string, { discordId: string; displayName: string }>,
  entryByNorm: Map<string, { matchedDiscordId: string | null; displayName: string }>,
): RosterClassification {
  const rawName = String(raw || '').trim().slice(0, 40);
  const nameNorm = normalizeRosterName(rawName);
  if (!isPlausibleRosterName(rawName) || !nameNorm) {
    return { rawName, nameNorm, status: 'unrecognized', matchedDiscordId: null, matchedName: '' };
  }
  const member = memberByNorm.get(nameNorm);
  if (member) {
    return { rawName, nameNorm, status: 'matched', matchedDiscordId: member.discordId, matchedName: member.displayName };
  }
  const entry = entryByNorm.get(nameNorm);
  if (entry) {
    return { rawName, nameNorm, status: 'matched', matchedDiscordId: entry.matchedDiscordId, matchedName: entry.displayName };
  }
  return { rawName, nameNorm, status: 'new', matchedDiscordId: null, matchedName: '' };
}

/* ---------- roster entries ---------- */

export interface GuildRosterEntryRow {
  id: number;
  display_name: string;
  name_norm: string;
  source: string;
  matched_discord_id: string | null;
  created_by: string;
  created_at: number;
}

export async function listGuildRosterEntries(
  d1: D1Database, tenant: string,
): Promise<GuildRosterEntryRow[]> {
  const db = createDb(d1);
  const rows = await db.all<GuildRosterEntryRow>(
    sql`SELECT ${col('id')}, ${col('display_name')}, ${col('name_norm')}, ${col('source')}, ${col('matched_discord_id')}, ${col('created_by')}, ${col('created_at')} FROM ${guildRosterEntries} WHERE ${col('tenant')} = ${tenant} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

export async function countGuildRosterEntries(d1: D1Database, tenant: string): Promise<number> {
  const db = createDb(d1);
  const row = await db.get<{ n: number }>(
    sql`SELECT COUNT(*) AS ${col('n')} FROM ${guildRosterEntries} WHERE ${col('tenant')} = ${tenant}`,
  );
  return row?.n ?? 0;
}

/** Insert one confirmed entry; the (tenant, name_norm) unique index
 *  is the dedupe backstop — a conflict resolves to the existing row
 *  instead of an error or a duplicate. */
export async function insertGuildRosterEntry(
  d1: D1Database,
  row: { tenant: string; displayName: string; source: string; matchedDiscordId: string | null; createdBy: string; now: number },
): Promise<{ id: number; created: boolean }> {
  const db = createDb(d1);
  const nameNorm = normalizeRosterName(row.displayName);
  const existing = await db.get<{ id: number }>(
    sql`SELECT ${col('id')} FROM ${guildRosterEntries} WHERE ${col('tenant')} = ${row.tenant} AND ${col('name_norm')} = ${nameNorm}`,
  );
  if (existing) return { id: existing.id, created: false };
  const r = await db.run(
    sql`INSERT INTO ${guildRosterEntries} (${col('tenant')}, ${col('display_name')}, ${col('name_norm')}, ${col('source')}, ${col('matched_discord_id')}, ${col('created_by')}, ${col('created_at')})
        VALUES (${row.tenant}, ${row.displayName}, ${nameNorm}, ${row.source}, ${row.matchedDiscordId}, ${row.createdBy}, ${row.now})`,
  );
  return { id: metaOf(r).last_row_id, created: true };
}

export async function deleteGuildRosterEntry(
  d1: D1Database, tenant: string, id: number,
): Promise<boolean> {
  const db = createDb(d1);
  const r = await db.run(
    sql`DELETE FROM ${guildRosterEntries} WHERE ${col('id')} = ${id} AND ${col('tenant')} = ${tenant}`,
  );
  return metaOf(r).changes > 0;
}

/* ---------- import batches + preview rows ---------- */

export interface RosterImportBatchRow {
  id: number;
  tenant: string;
  created_by: string;
  status: string;
  image_count: number;
  created_at: number;
  confirmed_at: number | null;
}

export interface RosterImportRowRow {
  id: number;
  batch_id: number;
  raw_name: string;
  name_norm: string;
  status: string;
  matched_discord_id: string | null;
  matched_name: string;
  created_entry_id: number | null;
}

export async function createRosterImportBatch(
  d1: D1Database,
  row: { tenant: string; createdBy: string; imageCount: number; now: number },
): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${rosterImportBatches} (${col('tenant')}, ${col('created_by')}, ${col('status')}, ${col('image_count')}, ${col('created_at')}, ${col('confirmed_at')})
        VALUES (${row.tenant}, ${row.createdBy}, 'pending', ${row.imageCount}, ${row.now}, NULL)`,
  );
  return metaOf(r).last_row_id;
}

export async function insertRosterImportRow(
  d1: D1Database, batchId: number, tenant: string, c: RosterClassification,
): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${rosterImportRows} (${col('batch_id')}, ${col('tenant')}, ${col('raw_name')}, ${col('name_norm')}, ${col('status')}, ${col('matched_discord_id')}, ${col('matched_name')}, ${col('created_entry_id')})
        VALUES (${batchId}, ${tenant}, ${c.rawName}, ${c.nameNorm}, ${c.status}, ${c.matchedDiscordId}, ${c.matchedName}, NULL)`,
  );
  return metaOf(r).last_row_id;
}

export async function getRosterImportBatch(
  d1: D1Database, tenant: string, batchId: number,
): Promise<RosterImportBatchRow | null> {
  const db = createDb(d1);
  const row = await db.get<RosterImportBatchRow>(
    sql`SELECT ${col('id')}, ${col('tenant')}, ${col('created_by')}, ${col('status')}, ${col('image_count')}, ${col('created_at')}, ${col('confirmed_at')} FROM ${rosterImportBatches} WHERE ${col('id')} = ${batchId} AND ${col('tenant')} = ${tenant}`,
  );
  return row ?? null;
}

export async function listRosterImportRows(
  d1: D1Database, batchId: number,
): Promise<RosterImportRowRow[]> {
  const db = createDb(d1);
  const rows = await db.all<RosterImportRowRow>(
    sql`SELECT ${col('id')}, ${col('batch_id')}, ${col('raw_name')}, ${col('name_norm')}, ${col('status')}, ${col('matched_discord_id')}, ${col('matched_name')}, ${col('created_entry_id')} FROM ${rosterImportRows} WHERE ${col('batch_id')} = ${batchId} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

export async function markRosterImportRowImported(
  d1: D1Database, rowId: number, entryId: number,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${rosterImportRows} SET ${col('created_entry_id')} = ${entryId} WHERE ${col('id')} = ${rowId}`,
  );
}

export async function confirmRosterImportBatch(
  d1: D1Database, batchId: number, now: number,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${rosterImportBatches} SET ${col('status')} = 'confirmed', ${col('confirmed_at')} = ${now} WHERE ${col('id')} = ${batchId}`,
  );
}
