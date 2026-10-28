/* ===================================================
 * Data-layer minting for typed public IDs (ids.ts).
 *
 * mintPublicId hands out the next primary key for a registered
 * entity type. The sequence comes from one atomic statement against
 * id_mint_counters — an INSERT … ON CONFLICT DO UPDATE … RETURNING —
 * so the increment-and-read is indivisible: D1 serializes writes per
 * database and no two minters can observe the same sequence. The
 * caller then inserts its row with the returned ID as the explicit
 * primary key. If that insert fails, the sequence number is simply
 * burned (IDs must be unique, never dense).
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';
import {
  PUBLIC_ID_TYPE_CODES,
  PublicIdError,
  composePublicId,
  dayIndexFromMs,
  type PublicIdType,
} from './ids.ts';

const { idMintCounters } = schema;
const col = (name: string) => sql.identifier(name);

/**
 * Mint the next public ID for `type` on the UTC day containing
 * `nowMs` (defaults to now). Throws PublicIdError when the day falls
 * outside the representable range or the day's sequence is exhausted
 * (the extension-layout signal — never wrap, never reuse).
 */
export async function mintPublicId(
  d1: D1Database,
  type: PublicIdType,
  nowMs: number = Date.now(),
): Promise<number> {
  const typeCode = PUBLIC_ID_TYPE_CODES[type];
  const dayIndex = dayIndexFromMs(nowMs);
  if (dayIndex < 0 || dayIndex > 9_999) {
    throw new PublicIdError(
      'day-out-of-range',
      `mint day index ${dayIndex} outside 0..9999`,
    );
  }
  const db = createDb(d1);
  const row = await db.get<{ seq: number }>(
    sql`INSERT INTO ${idMintCounters} (${col('type_code')}, ${col('day_index')}, ${col('seq')})
        VALUES (${typeCode}, ${dayIndex}, 1)
        ON CONFLICT (${col('type_code')}, ${col('day_index')})
        DO UPDATE SET ${col('seq')} = ${idMintCounters.seq} + 1
        RETURNING ${col('seq')}`,
  );
  const seq = row ? Number(row.seq) : NaN;
  // composePublicId re-validates the sequence range (1..99999); an
  // exhausted day throws PublicIdError('sequence-out-of-range').
  return composePublicId(typeCode, dayIndex, seq);
}
