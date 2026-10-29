/* Guild gear standards repository (premium insights line, P9): the
 * guild_gear_standards entity's row operations. Every read and write
 * is scoped by tenant — a standard id alone never crosses a guild
 * boundary. The entity stores only the admin-set threshold lines;
 * the readiness board is computed at read time in insights.ts from
 * roster + gear data. Validation, the admin verdict, the tier
 * verdict and all copy live in the callers (insights-graphql.ts) —
 * this file owns the statements only. */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { guildGearStandards } from './schema.ts';
import { mintPublicId } from '../platform/id-mint.ts';

const col = (name: string) => sql.identifier(name);

/** Scene label cap in characters, enforced by the write mutations. */
export const GEAR_STANDARD_MAX_LABEL = 40;

export interface GearStandardRow {
  id: number;
  tenant: number;
  label: string;
  min_score: number;
  created_by_user_id: number;
  created_at: number;
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

const STANDARD_COLS = sql`${guildGearStandards.id}, ${guildGearStandards.tenant}, ${guildGearStandards.label}, ${guildGearStandards.minScore}, ${guildGearStandards.createdByUserId}, ${guildGearStandards.createdAt}, ${guildGearStandards.updatedAt}`;

/** All threshold lines of one guild, oldest first. */
export async function listGearStandards(
  d1: D1Database, tenant: number,
): Promise<GearStandardRow[]> {
  const db = createDb(d1);
  const rows = await db.all<GearStandardRow>(
    sql`SELECT ${STANDARD_COLS} FROM ${guildGearStandards} WHERE ${col('tenant')} = ${tenant} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

/** One threshold line of one guild; null when it does not exist THERE. */
export async function getGearStandard(
  d1: D1Database, tenant: number, id: number,
): Promise<GearStandardRow | null> {
  const db = createDb(d1);
  const row = await db.get<GearStandardRow>(
    sql`SELECT ${STANDARD_COLS} FROM ${guildGearStandards} WHERE ${col('tenant')} = ${tenant} AND ${col('id')} = ${id}`,
  );
  return row ?? null;
}

/** Insert one threshold line; returns the new row id. */
export async function insertGearStandard(
  d1: D1Database,
  row: { tenant: number; label: string; minScore: number; createdByUserId: number; createdAt: number },
): Promise<number> {
  const db = createDb(d1);
  // The standard ID (type code 32) is minted in the data layer.
  const id = await mintPublicId(d1, 'gearStandard');
  // INSERT column lists must use bare column names (SQLite syntax); see settings.ts note.
  await db.run(
    sql`INSERT INTO ${guildGearStandards} (${col('id')}, ${col('tenant')}, ${col('label')}, ${col('min_score')}, ${col('created_by_user_id')}, ${col('created_at')}, ${col('updated_at')})
        VALUES (${id}, ${row.tenant}, ${row.label}, ${row.minScore}, ${row.createdByUserId}, ${row.createdAt}, ${row.createdAt})`,
  );
  return id;
}

/** Update one threshold line of one guild; false when not there. */
export async function updateGearStandard(
  d1: D1Database,
  row: { tenant: number; id: number; label: string; minScore: number; updatedAt: number },
): Promise<boolean> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${guildGearStandards} SET ${col('label')} = ${row.label}, ${col('min_score')} = ${row.minScore}, ${col('updated_at')} = ${row.updatedAt}
        WHERE ${col('tenant')} = ${row.tenant} AND ${col('id')} = ${row.id}`,
  );
  return metaOf(r).changes > 0;
}

/** Delete one threshold line of one guild; false when not there. */
export async function deleteGearStandard(
  d1: D1Database, tenant: number, id: number,
): Promise<boolean> {
  const db = createDb(d1);
  const r = await db.run(
    sql`DELETE FROM ${guildGearStandards} WHERE ${col('tenant')} = ${tenant} AND ${col('id')} = ${id}`,
  );
  return metaOf(r).changes > 0;
}
