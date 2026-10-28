// Hub audit-log repository: the hub_audit_log entity's lazy DDL and row
// operations. The module-level contract (never throw, clip fields,
// prune throttling, secret-free summaries) stays in platform's
// hub-audit service module; this file owns the statements.
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { hubAuditLog } from './schema.ts';

export interface HubAuditRow {
  id: number;
  at: number;
  actor: string;
  action: string;
  tenant: number;
  summary: string;
  ip: string;
}

interface CountRow { c: number }

export async function insertHubAudit(
  d1: D1Database,
  row: {
    at: number; actor: string; action: string; tenant: number;
    summary: string; ip: string;
  },
): Promise<void> {
  const db = createDb(d1);
  // INSERT column lists must use bare column names (SQLite syntax); see settings.ts note.
  await db.run(
    sql`INSERT INTO ${hubAuditLog} (${sql.identifier('at')}, ${sql.identifier('actor')}, ${sql.identifier('action')}, ${sql.identifier('tenant')}, ${sql.identifier('summary')}, ${sql.identifier('ip')})
        VALUES (${row.at}, ${row.actor}, ${row.action}, ${row.tenant}, ${row.summary}, ${row.ip})`,
  );
}

/** Retention pruning: drop rows older than the cutoff, then cap the
 *  table at maxRows newest rows (same two-statement shape as error_log). */
export async function pruneHubAudit(
  d1: D1Database,
  cutoff: number,
  maxRows: number,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`DELETE FROM ${hubAuditLog} WHERE ${hubAuditLog.at} < ${cutoff}`,
  );
  await db.run(
    sql`DELETE FROM ${hubAuditLog} WHERE ${hubAuditLog.id} IN
        (SELECT ${hubAuditLog.id} FROM ${hubAuditLog} ORDER BY ${hubAuditLog.id} DESC LIMIT -1 OFFSET ${maxRows})`,
  );
}

export async function listHubAudit(
  d1: D1Database,
  opts: { tenant: number; limit: number; offset: number },
): Promise<HubAuditRow[]> {
  const db = createDb(d1);
  const rows = opts.tenant
    ? await db.all<HubAuditRow>(
      sql`SELECT ${hubAuditLog.id}, ${hubAuditLog.at}, ${hubAuditLog.actor}, ${hubAuditLog.action}, ${hubAuditLog.tenant}, ${hubAuditLog.summary}, ${hubAuditLog.ip}
          FROM ${hubAuditLog} WHERE ${hubAuditLog.tenant} = ${opts.tenant}
          ORDER BY ${hubAuditLog.id} DESC LIMIT ${opts.limit} OFFSET ${opts.offset}`,
    )
    : await db.all<HubAuditRow>(
      sql`SELECT ${hubAuditLog.id}, ${hubAuditLog.at}, ${hubAuditLog.actor}, ${hubAuditLog.action}, ${hubAuditLog.tenant}, ${hubAuditLog.summary}, ${hubAuditLog.ip}
          FROM ${hubAuditLog}
          ORDER BY ${hubAuditLog.id} DESC LIMIT ${opts.limit} OFFSET ${opts.offset}`,
    );
  return rows || [];
}

export async function countHubAudit(
  d1: D1Database,
  tenant: number,
): Promise<number> {
  const db = createDb(d1);
  const rows = tenant
    ? await db.all<CountRow>(
      sql`SELECT COUNT(*) AS c FROM ${hubAuditLog} WHERE ${hubAuditLog.tenant} = ${tenant}`,
    )
    : await db.all<CountRow>(
      sql`SELECT COUNT(*) AS c FROM ${hubAuditLog}`,
    );
  const row = rows && rows[0];
  return row ? Number(row.c) || 0 : 0;
}

/** Count one actor's rows for one action since a timestamp — this is
 * the account-export rate limit's counter (audit rows double as the
 * ledger; no separate limiter machinery). */
export async function countHubAuditByActorActionSince(
  d1: D1Database,
  actor: string,
  action: string,
  sinceSec: number,
): Promise<number> {
  const db = createDb(d1);
  const rows = await db.all<CountRow>(
    sql`SELECT COUNT(*) AS c FROM ${hubAuditLog}
        WHERE ${hubAuditLog.actor} = ${actor} AND ${hubAuditLog.action} = ${action} AND ${hubAuditLog.at} >= ${sinceSec}`,
  );
  const row = rows && rows[0];
  return row ? Number(row.c) || 0 : 0;
}
