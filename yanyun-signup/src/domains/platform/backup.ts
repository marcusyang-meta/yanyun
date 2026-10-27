// Full-database backup export / restore, through the data layer only.
//
// Format "yanyun-backup" v1: one JSON object; per entity, the row list
// keyed by SQL column names (the storage contract, stable across TS
// renames). Values are JSON scalars, except BLOB columns, which are
// encoded as { "$blob": "<base64>" } (today only guild_avatars.bytes).
//
// Coverage: every registered entity EXCEPT error_log — that table is
// ephemeral monitoring noise with its own 30-day retention, and
// restoring stale error rows has no recovery value. The entity list
// below is in restore order (parents before dependents); D1 sessions
// ignore the foreign_keys pragma, but the order keeps the file honest
// for stricter engines too.
//
// SECURITY: a backup file contains live secrets (user_oauth refresh
// tokens, tenant password hashes, webhook URLs). Treat the file and
// the storage bucket as secret material: private bucket, hub-auth-only
// download, never a public link.
import { getTableColumns, sql } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { createDb } from '../../db/client.ts';
import {
  tenants, settings, users, userOauth, userGuildNicks, guildMembers,
  events, signups, results, shortLinks, groupingTemplates, guildAvatars,
  bosses, dungeons, schools, schoolBis, schoolRotations, slotAffix, affixMax,
  userGearItems, userGearBuilds, heirloomItemPushes, heirloomSetState,
  pushTokens, creatorBackfillLog, hubAuditLog,
} from '../../db/schema.ts';

export const BACKUP_FORMAT = 'yanyun-backup';
export const BACKUP_VERSION = 1;
export const BACKUP_EXCLUDED: readonly string[] = ['error_log'];

/** [storage key, entity] in restore order (parents first). */
export const BACKUP_ENTITIES: ReadonlyArray<readonly [string, SQLiteTable]> = [
  ['tenants', tenants],
  ['settings', settings],
  ['users', users],
  ['user_oauth', userOauth],
  ['user_guild_nicks', userGuildNicks],
  ['guild_members', guildMembers],
  ['events', events],
  ['signups', signups],
  ['results', results],
  ['short_links', shortLinks],
  ['grouping_templates', groupingTemplates],
  ['guild_avatars', guildAvatars],
  ['bosses', bosses],
  ['dungeons', dungeons],
  ['schools', schools],
  ['school_bis', schoolBis],
  ['school_rotations', schoolRotations],
  ['slot_affix', slotAffix],
  ['affix_max', affixMax],
  ['user_gear_items', userGearItems],
  ['user_gear_builds', userGearBuilds],
  ['heirloom_item_pushes', heirloomItemPushes],
  ['heirloom_set_state', heirloomSetState],
  ['push_tokens', pushTokens],
  ['creator_backfill_log', creatorBackfillLog],
  ['hub_audit_log', hubAuditLog],
];

export type EncodedValue = string | number | null | { $blob: string };
export type BackupRow = Record<string, EncodedValue>;

export interface BackupEntity {
  count: number;
  rows: BackupRow[];
}

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: number;
  entities: Record<string, BackupEntity>;
}

/* ---------- value codec ---------- */

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function encodeValue(v: unknown): EncodedValue {
  if (v == null) return null;
  if (v instanceof Uint8Array) return { $blob: bytesToBase64(v) };
  if (v instanceof ArrayBuffer) return { $blob: bytesToBase64(new Uint8Array(v)) };
  if (typeof v === 'string' || typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  return String(v);
}

function decodeValue(v: EncodedValue): unknown {
  if (v != null && typeof v === 'object') return base64ToBytes(v.$blob);
  return v;
}

/* ---------- export ---------- */

/** Rows of one entity, keyed by SQL column name, values encoded. */
export async function exportEntityRows(d1: D1Database, table: SQLiteTable): Promise<BackupRow[]> {
  const db = createDb(d1);
  const cols = Object.entries(getTableColumns(table)); // [propKey, column]
  const rows = (await db.select().from(table)) as Array<Record<string, unknown>>;
  return rows.map((row) => {
    const out: BackupRow = {};
    for (const [prop, col] of cols) out[col.name] = encodeValue(row[prop]);
    return out;
  });
}

export async function exportBackup(d1: D1Database): Promise<BackupFile> {
  const entities: Record<string, BackupEntity> = {};
  for (const [key, table] of BACKUP_ENTITIES) {
    const rows = await exportEntityRows(d1, table);
    entities[key] = { count: rows.length, rows };
  }
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: Math.floor(Date.now() / 1000),
    entities,
  };
}

export function serializeBackup(file: BackupFile): string {
  return JSON.stringify(file);
}

/** Stream the same JSON shape entity by entity (bounded memory: one
 *  entity's rows at a time) for the hub download endpoint. onComplete
 *  receives the per-entity counts once the stream is fully written. */
export function streamBackupJson(
  d1: D1Database,
  onComplete?: (counts: Record<string, number>) => Promise<void> | void,
): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const counts: Record<string, number> = {};
      const exportedAt = Math.floor(Date.now() / 1000);
      controller.enqueue(enc.encode(
        `{"format":"${BACKUP_FORMAT}","version":${BACKUP_VERSION},"exportedAt":${exportedAt},"entities":{`,
      ));
      let first = true;
      for (const [key, table] of BACKUP_ENTITIES) {
        const rows = await exportEntityRows(d1, table);
        counts[key] = rows.length;
        controller.enqueue(enc.encode(
          `${first ? '' : ','}"${key}":{"count":${rows.length},"rows":${JSON.stringify(rows)}}`,
        ));
        first = false;
      }
      controller.enqueue(enc.encode('}}'));
      controller.close();
      if (onComplete) await onComplete(counts);
    },
  });
}

export function parseBackup(text: string): BackupFile {
  const data = JSON.parse(text) as BackupFile;
  if (!data || data.format !== BACKUP_FORMAT) {
    throw new Error(`not a ${BACKUP_FORMAT} file`);
  }
  if (data.version !== BACKUP_VERSION) {
    throw new Error(`unsupported backup version ${data.version} (expected ${BACKUP_VERSION})`);
  }
  if (!data.entities || typeof data.entities !== 'object') {
    throw new Error('backup file has no entities object');
  }
  return data;
}

/** Per-entity row counts declared by the file itself (the manifest). */
export function backupCounts(file: BackupFile): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key] of BACKUP_ENTITIES) {
    const e = file.entities[key];
    out[key] = e ? e.rows.length : 0;
  }
  return out;
}

export function backupTotalRows(file: BackupFile): number {
  return Object.values(backupCounts(file)).reduce((a, b) => a + b, 0);
}

/* ---------- restore ----------
 * Inserts every row of the file into the target database, entity by
 * entity in BACKUP_ENTITIES order, through the data layer. The target
 * must be EMPTY for the covered entities (a restore replaces a lost
 * database; it is not a merge). Returns per-entity inserted counts. */
export async function importBackup(d1: D1Database, file: BackupFile): Promise<Record<string, number>> {
  const db = createDb(d1);
  const inserted: Record<string, number> = {};
  for (const [key, table] of BACKUP_ENTITIES) {
    const entity = file.entities[key];
    inserted[key] = 0;
    if (!entity || !entity.rows.length) continue;
    const colNames = Object.values(getTableColumns(table)).map((c) => c.name);
    for (const row of entity.rows) {
      const present = colNames.filter((n) => n in row);
      if (!present.length) continue;
      const colsSql = sql.join(present.map((n) => sql.identifier(n)), sql`, `);
      const valsSql = sql.join(present.map((n) => sql`${decodeValue(row[n])}`), sql`, `);
      await db.run(sql`INSERT INTO ${table} (${colsSql}) VALUES (${valsSql})`);
      inserted[key]++;
    }
  }
  return inserted;
}

/** Live per-entity counts of a database, for restore reconciliation. */
export async function countEntities(d1: D1Database): Promise<Record<string, number>> {
  const db = createDb(d1);
  const out: Record<string, number> = {};
  for (const [key, table] of BACKUP_ENTITIES) {
    const rows = await db.all<{ c: number }>(
      sql`SELECT COUNT(*) AS c FROM ${table}`,
    );
    out[key] = rows && rows[0] ? Number(rows[0].c) || 0 : 0;
  }
  return out;
}
