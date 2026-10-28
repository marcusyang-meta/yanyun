/* ===================================================
 * Data-layer access (Repository) for the member_availability
 * entity (F5): one row per (guild, member) holding the member's
 * recurring weekly availability windows.
 *
 * A slot is { weekday (0 = Sunday .. 6), startMinute, endMinute }
 * in UTC minutes of day. UTC is the only stored frame — rendering
 * in the viewer's timezone is a client concern (the repo-wide time
 * rule). The whole set is stored as one JSON array: availability
 * is always read and written as a complete set, never per-slot.
 * Business code must not hand-roll SQL against this table.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { memberAvailability } from './schema.ts';

const col = (name: string) => sql.identifier(name);

export interface AvailabilitySlot {
  weekday: number;
  startMinute: number;
  endMinute: number;
}

export interface MemberAvailabilityRow {
  tenant: string;
  discord_id: string;
  display_name: string;
  slots_json: string;
  updated_at: number;
}

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

export const MAX_AVAILABILITY_SLOTS = 21;

/** Parse a stored slots_json cell; corrupt data reads as no slots. */
export function parseAvailabilitySlots(json: string | null | undefined): AvailabilitySlot[] {
  try {
    const arr = JSON.parse(json || '[]');
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && Number.isInteger(x.weekday) && Number.isInteger(x.startMinute) && Number.isInteger(x.endMinute))
      .map((x) => ({ weekday: x.weekday, startMinute: x.startMinute, endMinute: x.endMinute }));
  } catch {
    return [];
  }
}

/**
 * Validate + normalize a submitted slot set (pure): every slot must
 * be a whole UTC window inside one weekday (start < end, both in
 * [0, 1440]); the set is capped and returned sorted by weekday then
 * start. Returns an error code instead of slots on any violation —
 * one bad slot rejects the whole save, never a silent partial edit.
 */
export function validateAvailabilitySlots(
  input: unknown,
): { slots: AvailabilitySlot[] } | { error: string } {
  if (!Array.isArray(input)) return { error: 'availabilitySlotInvalid' };
  if (input.length > MAX_AVAILABILITY_SLOTS) return { error: 'availabilityTooManySlots' };
  const slots: AvailabilitySlot[] = [];
  for (const raw of input) {
    const r = (raw || {}) as Record<string, unknown>;
    const weekday = Number(r.weekday);
    const startMinute = Number(r.startMinute);
    const endMinute = Number(r.endMinute);
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return { error: 'availabilitySlotInvalid' };
    if (!Number.isInteger(startMinute) || !Number.isInteger(endMinute)) return { error: 'availabilitySlotInvalid' };
    if (startMinute < 0 || endMinute > 1440 || startMinute >= endMinute) return { error: 'availabilitySlotInvalid' };
    slots.push({ weekday, startMinute, endMinute });
  }
  slots.sort((a, b) => a.weekday - b.weekday || a.startMinute - b.startMinute);
  return { slots };
}

/* ---------- Reads ---------- */

export async function getMemberAvailability(
  d1: D1Database, tenant: string, discordId: string,
): Promise<MemberAvailabilityRow | null> {
  const db = createDb(d1);
  const row = await db.get<MemberAvailabilityRow>(
    sql`SELECT * FROM ${memberAvailability} WHERE ${col('tenant')} = ${tenant} AND ${col('discord_id')} = ${discordId}`,
  );
  return row ?? null;
}

/** Every saved availability set in one guild (the summary read). */
export async function listGuildAvailability(
  d1: D1Database, tenant: string,
): Promise<MemberAvailabilityRow[]> {
  const db = createDb(d1);
  const rows = await db.all<MemberAvailabilityRow>(
    sql`SELECT * FROM ${memberAvailability} WHERE ${col('tenant')} = ${tenant} ORDER BY ${col('display_name')} ASC`,
  );
  return rows || [];
}

/* ---------- Writes ---------- */

/** Replace one member's whole availability set (upsert on the PK). */
export async function upsertMemberAvailability(
  d1: D1Database,
  row: { tenant: string; discordId: string; displayName: string; slots: AvailabilitySlot[]; updatedAt: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const slotsJson = JSON.stringify(row.slots);
  const r = await db.run(
    sql`INSERT INTO ${memberAvailability} (${col('tenant')}, ${col('discord_id')}, ${col('display_name')}, ${col('slots_json')}, ${col('updated_at')})
        VALUES (${row.tenant}, ${row.discordId}, ${row.displayName}, ${slotsJson}, ${row.updatedAt})
        ON CONFLICT (${col('tenant')}, ${col('discord_id')}) DO UPDATE SET
          ${col('display_name')} = ${row.displayName}, ${col('slots_json')} = ${slotsJson}, ${col('updated_at')} = ${row.updatedAt}`,
  );
  return metaOf(r);
}
