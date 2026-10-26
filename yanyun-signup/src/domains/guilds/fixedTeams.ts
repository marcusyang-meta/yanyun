/* ===================================================
 * Data-layer access (Repository, guilds domain) for fixed
 * teams: fixed_teams / fixed_team_members. Previously all
 * statements lived in worker.js's guild routes. Team deletion
 * (members first, then the team) runs as one D1 batch inside
 * the repository, matching the old call sites' batch semantics.
 * Rows keep the legacy snake_case keys.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { fixedTeams, fixedTeamMembers } = schema;
const col = (name: string) => sql.identifier(name);

export interface FixedTeamRow {
  id: number;
  name: string;
  description: string;
}

export interface FixedTeamMemberRow {
  id: number;
  nickname: string;
  weapon: string;
  role: string;
  note: string;
}

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

export async function listFixedTeams(d1: D1Database, tenant: string): Promise<FixedTeamRow[]> {
  const db = createDb(d1);
  const rows = await db.all<FixedTeamRow>(
    sql`SELECT ${col('id')}, ${col('name')}, ${col('description')} FROM ${fixedTeams} WHERE ${col('tenant')} = ${tenant} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

export async function listFixedTeamMembers(d1: D1Database, teamId: number): Promise<FixedTeamMemberRow[]> {
  const db = createDb(d1);
  const rows = await db.all<FixedTeamMemberRow>(
    sql`SELECT ${col('id')}, ${col('nickname')}, ${col('weapon')}, ${col('role')}, ${col('note')} FROM ${fixedTeamMembers} WHERE ${col('team_id')} = ${teamId} ORDER BY ${col('sort_order')} ASC, ${col('id')} ASC`,
  );
  return rows || [];
}

export async function insertFixedTeam(
  d1: D1Database, row: { tenant: string; name: string; description: string },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${fixedTeams} (${col('tenant')}, ${col('name')}, ${col('description')}) VALUES (${row.tenant}, ${row.name}, ${row.description})`,
  );
  return metaOf(r);
}

/** Ownership check: returns the id only if the team belongs to this guild. */
export async function getFixedTeamIdForTenant(
  d1: D1Database, id: number, tenant: string,
): Promise<{ id: number } | null> {
  const db = createDb(d1);
  const row = await db.get<{ id: number }>(
    sql`SELECT ${col('id')} FROM ${fixedTeams} WHERE ${col('id')} = ${id} AND ${col('tenant')} = ${tenant}`,
  );
  return row ?? null;
}

const TEAM_COLUMNS = new Set(['name', 'description']);

export async function updateFixedTeamFields(
  d1: D1Database, id: number, patch: Record<string, unknown>,
): Promise<RunMeta> {
  const db = createDb(d1);
  const cols = Object.keys(patch);
  for (const c of cols) {
    if (!TEAM_COLUMNS.has(c)) throw new Error(`fixed_teams repository: unknown column ${c}`);
  }
  if (!cols.length) throw new Error('fixed_teams repository: empty patch');
  const sets = sql.join(cols.map((c) => sql`${col(c)} = ${patch[c]}`), sql`,`);
  const r = await db.run(sql`UPDATE ${fixedTeams} SET ${sets} WHERE ${col('id')} = ${id}`);
  return metaOf(r);
}

/** Delete a team: members first, then the team, as one D1 batch (atomic). */
export async function deleteFixedTeamWithMembers(d1: D1Database, id: number): Promise<void> {
  await d1.batch([
    d1.prepare('DELETE FROM fixed_team_members WHERE team_id = ?').bind(id),
    d1.prepare('DELETE FROM fixed_teams WHERE id = ?').bind(id),
  ]);
}

export async function insertFixedTeamMember(
  d1: D1Database,
  row: { teamId: number; nickname: string; weapon: string; role: string; note: string; sortOrder: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${fixedTeamMembers} (${col('team_id')}, ${col('nickname')}, ${col('weapon')}, ${col('role')}, ${col('note')}, ${col('sort_order')}) VALUES (${row.teamId}, ${row.nickname}, ${row.weapon}, ${row.role}, ${row.note}, ${row.sortOrder})`,
  );
  return metaOf(r);
}

/** Ownership check: returns the id only if the member's team belongs to this guild (JOIN probe). */
export async function getFixedTeamMemberIdOwned(
  d1: D1Database, memberId: number, tenant: string,
): Promise<{ id: number } | null> {
  const db = createDb(d1);
  const row = await db.get<{ id: number }>(
    sql`SELECT ${fixedTeamMembers.id} FROM ${fixedTeamMembers} JOIN ${fixedTeams} ON ${fixedTeamMembers.teamId} = ${fixedTeams.id} WHERE ${fixedTeamMembers.id} = ${memberId} AND ${fixedTeams.tenant} = ${tenant}`,
  );
  return row ?? null;
}

const MEMBER_COLUMNS = new Set(['nickname', 'weapon', 'role', 'note', 'sort_order']);

export async function updateFixedTeamMemberFields(
  d1: D1Database, id: number, patch: Record<string, unknown>,
): Promise<RunMeta> {
  const db = createDb(d1);
  const cols = Object.keys(patch);
  for (const c of cols) {
    if (!MEMBER_COLUMNS.has(c)) throw new Error(`fixed_team_members repository: unknown column ${c}`);
  }
  if (!cols.length) throw new Error('fixed_team_members repository: empty patch');
  const sets = sql.join(cols.map((c) => sql`${col(c)} = ${patch[c]}`), sql`,`);
  const r = await db.run(sql`UPDATE ${fixedTeamMembers} SET ${sets} WHERE ${col('id')} = ${id}`);
  return metaOf(r);
}

export async function deleteFixedTeamMemberById(d1: D1Database, id: number): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(sql`DELETE FROM ${fixedTeamMembers} WHERE ${col('id')} = ${id}`);
  return metaOf(r);
}
