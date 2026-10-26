// Error-log repository: the error_log entity's lazy DDL and row
// operations. The module-level contract (never throw, clip fields,
// prune throttling) stays in platform's errorlog service module;
// this file owns the statements.
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { errorLog } from './schema.ts';

/* ---------- 懒 DDL ---------- */

let errorLogTableReady: Promise<void> | null = null;
export function ensureErrorLogTable(d1: D1Database): Promise<void> {
  if (!errorLogTableReady) {
    errorLogTableReady = (async () => {
      try {
        const db = createDb(d1);
        await db.run(sql`CREATE TABLE IF NOT EXISTS ${errorLog} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          at INTEGER NOT NULL,
          source TEXT NOT NULL DEFAULT '',
          name TEXT NOT NULL DEFAULT '',
          message TEXT NOT NULL DEFAULT '',
          tenant TEXT NOT NULL DEFAULT '',
          context TEXT NOT NULL DEFAULT '',
          stack TEXT NOT NULL DEFAULT ''
        )`);
        await db.run(sql`CREATE INDEX IF NOT EXISTS idx_error_log_at ON ${errorLog} (${sql.identifier('at')})`);
      } catch { /* 建表失败静默: 监控不可用不能拖垮业务 */ }
    })();
  }
  return errorLogTableReady;
}

export interface ErrorLogRow {
  id: number;
  at: number;
  source: string;
  name: string;
  message: string;
  tenant: string;
  context: string;
}

interface CountRow { c: number }

export async function insertErrorLog(
  d1: D1Database,
  row: {
    at: number; source: string; name: string; message: string;
    tenant: string; context: string; stack: string;
  },
): Promise<void> {
  const db = createDb(d1);
  // INSERT 列名单须用裸列名 (SQLite 语法), 见 settings.ts 注。
  await db.run(
    sql`INSERT INTO ${errorLog} (${sql.identifier('at')}, ${sql.identifier('source')}, ${sql.identifier('name')}, ${sql.identifier('message')}, ${sql.identifier('tenant')}, ${sql.identifier('context')}, ${sql.identifier('stack')})
        VALUES (${row.at}, ${row.source}, ${row.name}, ${row.message}, ${row.tenant}, ${row.context}, ${row.stack})`,
  );
}

/** Retention pruning: drop rows older than the cutoff, then cap the
 *  table at maxRows newest rows (the legacy two-statement shape). */
export async function pruneErrorLog(
  d1: D1Database,
  cutoff: number,
  maxRows: number,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`DELETE FROM ${errorLog} WHERE ${errorLog.at} < ${cutoff}`,
  );
  await db.run(
    sql`DELETE FROM ${errorLog} WHERE ${errorLog.id} IN
        (SELECT ${errorLog.id} FROM ${errorLog} ORDER BY ${errorLog.id} DESC LIMIT -1 OFFSET ${maxRows})`,
  );
}

export async function listRecentErrors(
  d1: D1Database,
  limit: number,
): Promise<ErrorLogRow[]> {
  const db = createDb(d1);
  const rows = await db.all<ErrorLogRow>(
    sql`SELECT ${errorLog.id}, ${errorLog.at}, ${errorLog.source}, ${errorLog.name}, ${errorLog.message}, ${errorLog.tenant}, ${errorLog.context}
        FROM ${errorLog} ORDER BY ${errorLog.id} DESC LIMIT ${limit}`,
  );
  return rows || [];
}

export async function countErrorsSince(
  d1: D1Database,
  since: number,
): Promise<number> {
  const db = createDb(d1);
  const rows = await db.all<CountRow>(
    sql`SELECT COUNT(*) AS c FROM ${errorLog} WHERE ${errorLog.at} >= ${since}`,
  );
  const row = rows && rows[0];
  return row ? Number(row.c) || 0 : 0;
}
