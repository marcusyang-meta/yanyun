// Settings repository: the single access path for the settings entity
// (tenant-scoped key/value; tenant '' is the global scope).
//
// This replaces the hand-written settings SQL that used to be scattered
// across worker.js / graphql.js / prim.js / reminder.js / auth.js.
// Semantics intentionally mirror the legacy helpers they replace:
//   - getSettingValue swallows all errors and returns '' (the legacy
//     getTenantSetting / getReminderSetting contract);
//   - setSettingValue upserts and lets errors propagate (the legacy
//     setTenantSetting contract);
//   - scan helpers return rows in storage order, like the legacy .all()
//     calls they replace.
//
// Queries are built as drizzle sql templates over the schema objects, so
// table/column names come from the single source of truth in
// src/db/schema.ts while execution stays on the prepare/bind/all/run
// surface that D1 (and the harness FakeDBs) implement.
import { sql } from 'drizzle-orm';
import { createDb } from '../client.ts';
import { settings } from '../schema.ts';

interface ValueRow { value: string }
interface TenantValueRow { tenant: string; value: string }
interface KeyValueRow { key: string; value: string }

export async function getSettingValue(
  d1: D1Database,
  tenant: string,
  key: string,
): Promise<string> {
  try {
    const db = createDb(d1);
    const row = await db.get<ValueRow>(
      sql`SELECT ${settings.value} FROM ${settings}
          WHERE ${settings.tenant} = ${tenant} AND ${settings.key} = ${key}`,
    );
    return row ? String(row.value || '') : '';
  } catch {
    return '';
  }
}

export async function setSettingValue(
  d1: D1Database,
  tenant: string,
  key: string,
  value: string,
): Promise<void> {
  const db = createDb(d1);
  // INSERT 列名单 / ON CONFLICT 目标 / SET 左值在 SQLite 里必须是裸列名
  // (表限定名会语法错误), 故这三处用 sql.identifier 而非列对象内插。
  await db.run(
    sql`INSERT INTO ${settings} (${sql.identifier('tenant')}, ${sql.identifier('key')}, ${sql.identifier('value')})
        VALUES (${tenant}, ${key}, ${String(value ?? '')})
        ON CONFLICT (${sql.identifier('tenant')}, ${sql.identifier('key')})
        DO UPDATE SET ${sql.identifier('value')} = excluded.value`,
  );
}

/** All (tenant, value) rows for one key, in storage order. */
export async function listSettingsByKey(
  d1: D1Database,
  key: string,
): Promise<TenantValueRow[]> {
  const db = createDb(d1);
  const rows = await db.all<TenantValueRow>(
    sql`SELECT ${settings.tenant}, ${settings.value} FROM ${settings}
        WHERE ${settings.key} = ${key}`,
  );
  return rows || [];
}

/** Same scan, restricted to rows with a non-empty value. */
export async function listNonEmptySettingsByKey(
  d1: D1Database,
  key: string,
): Promise<TenantValueRow[]> {
  const db = createDb(d1);
  const rows = await db.all<TenantValueRow>(
    sql`SELECT ${settings.tenant}, ${settings.value} FROM ${settings}
        WHERE ${settings.key} = ${key} AND ${settings.value} != ''`,
  );
  return rows || [];
}

/** Distinct values stored under one key across all tenants. */
export async function listDistinctSettingValues(
  d1: D1Database,
  key: string,
): Promise<string[]> {
  try {
    const db = createDb(d1);
    const rows = await db.all<ValueRow>(
      sql`SELECT DISTINCT ${settings.value} FROM ${settings}
          WHERE ${settings.key} = ${key}`,
    );
    return (rows || []).map((r) => String(r.value || '')).filter(Boolean);
  } catch {
    return [];
  }
}

/** Global-scope (tenant '') rows for the given keys. */
export async function listGlobalSettings(
  d1: D1Database,
  keys: string[],
): Promise<KeyValueRow[]> {
  const db = createDb(d1);
  const keyList = sql.join(keys.map((k) => sql`${k}`), sql`, `);
  const rows = await db.all<KeyValueRow>(
    sql`SELECT ${settings.key}, ${settings.value} FROM ${settings}
        WHERE ${settings.tenant} = '' AND ${settings.key} IN (${keyList})`,
  );
  return rows || [];
}
