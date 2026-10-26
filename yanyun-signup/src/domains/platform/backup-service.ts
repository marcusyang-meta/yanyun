// Backup orchestration: export through the data layer (backup.ts),
// store in the private R2 bucket bound as BACKUPS, prune the daily
// series, and leave an audit row for every run. The bucket was created
// for this purpose (yanyun-backups); objects are never public — reads
// go through the hub-authenticated endpoints only.
import {
  exportBackup, serializeBackup, backupCounts, backupTotalRows,
} from './backup.ts';
import { auditHub } from './hub-audit.ts';
import { logError } from './error-log.ts';

export interface BackupEnv {
  DB: D1Database;
  BACKUPS?: R2Bucket;
}

export const DAILY_KEEP = 14;

export interface BackupRunResult {
  key: string;
  bytes: number;
  totalRows: number;
  counts: Record<string, number>;
}

function stampSlug(epochSec: number): string {
  return new Date(epochSec * 1000).toISOString().replace(/[:.]/g, '-');
}

/* Export the whole database and store it under daily/<date>.json or
 * manual/<timestamp>.json. Daily snapshots prune to the newest
 * DAILY_KEEP entries (manual snapshots are never pruned here). */
export async function runBackupToR2(env: BackupEnv, kind: 'daily' | 'manual'): Promise<BackupRunResult> {
  if (!env.BACKUPS) throw new Error('BACKUPS R2 binding is not configured');
  const file = await exportBackup(env.DB);
  const body = serializeBackup(file);
  const key = kind === 'daily'
    ? `daily/${new Date(file.exportedAt * 1000).toISOString().slice(0, 10)}.json`
    : `manual/${stampSlug(file.exportedAt)}.json`;
  await env.BACKUPS.put(key, body, {
    httpMetadata: { contentType: 'application/json' },
  });
  if (kind === 'daily') await pruneDailyBackups(env.BACKUPS, DAILY_KEEP);
  return {
    key,
    bytes: body.length,
    totalRows: backupTotalRows(file),
    counts: backupCounts(file),
  };
}

export async function pruneDailyBackups(bucket: R2Bucket, keep: number): Promise<void> {
  const listed = await bucket.list({ prefix: 'daily/', limit: 1000 });
  const keys = listed.objects.map((o) => o.key).sort().reverse();
  for (const key of keys.slice(keep)) await bucket.delete(key);
}

export interface BackupListEntry {
  key: string;
  size: number;
  uploaded: number;
}

export async function listBackups(bucket: R2Bucket): Promise<BackupListEntry[]> {
  const out: BackupListEntry[] = [];
  for (const prefix of ['daily/', 'manual/']) {
    const listed = await bucket.list({ prefix, limit: 1000 });
    for (const o of listed.objects) {
      out.push({ key: o.key, size: o.size, uploaded: Math.floor(o.uploaded.getTime() / 1000) });
    }
  }
  return out.sort((a, b) => b.uploaded - a.uploaded);
}

const BACKUP_KEY_RE = /^(daily|manual)\/[A-Za-z0-9][A-Za-z0-9._-]*\.json$/;

export function isBackupKey(key: string): boolean {
  return BACKUP_KEY_RE.test(key) && !key.includes('..');
}

export async function getBackupObject(bucket: R2Bucket, key: string): Promise<R2ObjectBody | null> {
  if (!isBackupKey(key)) return null;
  return bucket.get(key);
}

/* Cron entry: one daily snapshot + an audit row; failures land in
 * error_log (source 'backup') and rethrow so the cron run is visibly
 * failed in the Workers dashboard. */
export async function runScheduledBackup(env: BackupEnv): Promise<BackupRunResult> {
  try {
    const res = await runBackupToR2(env, 'daily');
    await auditHub(env.DB, {
      actor: 'system',
      action: 'backup.scheduled',
      summary: { key: res.key, rows: res.totalRows, bytes: res.bytes },
    });
    return res;
  } catch (e) {
    await logError(env.DB, { source: 'backup', error: e, message: 'scheduled backup failed' });
    throw e;
  }
}
