/* Platform-admin backup downloads: the two backup operations that
 * stay plain HTTP after the hub portal's retirement, because they
 * stream files (a full-database JSON export and stored snapshot
 * downloads) and GraphQL is the wrong transport for that.
 *
 * Auth model (changed from the retired portal): NO separate
 * password or bearer token. Requests authenticate with the normal
 * site session (restCheckedUser — the same checked session the
 * GraphQL endpoint uses) and then re-evaluate the platform-admin
 * gate in the gating layer (admin-gate.ts) with the session user's
 * identity as subject:
 *   - no valid session            -> 401
 *   - session, but not an admin    -> 403
 *   - admin                        -> the download
 * A backup file contains live secrets (OAuth refresh tokens,
 * password hashes, webhook URLs): every successful export/download
 * leaves a hub_audit_log row carrying the acting admin's real user
 * ID as actor (via admin-service's auditAdmin). Listing and running
 * backups live on the GraphQL admin surface (PlatformAdmin.backups /
 * platformAdminRunBackup); only the file transfers live here. */
import { Hono } from 'hono';
import { err, s, restCheckedUser } from './http.ts';
import { streamBackupJson, getBackupObject } from './index.ts';
import { isPlatformAdmin } from './admin-gate.ts';
import { auditAdmin } from './admin-service.ts';
import { translateError } from './i18n.ts';

export const platformAdminBackupRoutes = new Hono();

/* Resolve the checked session user and evaluate the gate. Returns
 * the user when the request may proceed; otherwise writes the error
 * response and returns null. */
async function requireBackupAdmin(c: any) {
  const { user } = await restCheckedUser(c);
  if (!user) return { denied: err('未登录或登录已过期', 401) };
  const admin = await isPlatformAdmin(c.env, String(user.userId)).catch(() => false);
  if (!admin) return { denied: err(translateError('platformAdminRequired', 'zh-CN'), 403) };
  return { user };
}

// GET /api/platform-admin/backup/export — streaming full-database
// JSON snapshot (same stream the retired portal served).
platformAdminBackupRoutes.get('/backup/export', async (c: any) => {
  const gate = await requireBackupAdmin(c);
  if (!gate.user) return gate.denied;
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  const stream = streamBackupJson(c.env.DB, async (counts) => {
    const rows = Object.values(counts).reduce((a: number, b: number) => a + b, 0);
    await auditAdmin(c.env, String(gate.user.userId), c.get('ip') || '', 'backup.export', '', {
      rows, entities: Object.keys(counts).length,
    });
  });
  return new Response(stream, {
    headers: {
      'content-type': 'application/json',
      'content-disposition': `attachment; filename="yanyun-backup-${stamp}.json"`,
    },
  });
});

// GET /api/platform-admin/backup/download?key=<bucket key> — one
// stored snapshot. getBackupObject validates the key shape (fixed
// daily/ manual/ prefixes, no traversal) before touching the bucket.
platformAdminBackupRoutes.get('/backup/download', async (c: any) => {
  const gate = await requireBackupAdmin(c);
  if (!gate.user) return gate.denied;
  if (!c.env.BACKUPS) return err(translateError('backupStorageMissing', 'zh-CN'), 500);
  const key = s(c.req.query('key'), 120);
  const obj = await getBackupObject(c.env.BACKUPS, key);
  if (!obj) return err(translateError('backupNotFound', 'zh-CN'), 404);
  await auditAdmin(c.env, String(gate.user.userId), c.get('ip') || '', 'backup.download', '', {
    key, bytes: obj.size,
  });
  return new Response(obj.body, {
    headers: {
      'content-type': 'application/json',
      'content-disposition': `attachment; filename="${key.split('/').pop()}"`,
    },
  });
});
