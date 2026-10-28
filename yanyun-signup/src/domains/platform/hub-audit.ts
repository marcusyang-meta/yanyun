// Hub super-admin audit trail: every sensitive hub-portal operation —
// logins, tenant/config writes, identity backfills, bulk data rewrites,
// and the sensitive reads (error log, the audit trail itself, backup
// exports) — leaves one row in hub_audit_log: when, who (actor), what
// (action), which tenant, and a NON-SENSITIVE digest of the parameters.
// Passwords, webhook URLs and secrets are never written here; callers
// pass digests only (e.g. webhook: 'replaced', never the URL itself).
//
// Hard rule (same as error-log): auditing must never affect the audited
// operation — every export swallows all exceptions.
//
// Retention: 180 days + a 20,000-row cap, pruned lazily on a write
// counter, no cron. error_log keeps 30 days / 5,000 rows because it is
// high-volume machine noise; audit rows are written at human admin
// pace, so a longer window costs almost nothing and keeps forensic
// history useful, while the row cap still bounds worst-case growth.
import { insertHubAudit, pruneHubAudit, listHubAudit, countHubAudit } from './hubAudit.ts';
import { getGuildIdBySlug } from '../guilds/tenants.ts';
import type { HubAuditRow } from './hubAudit.ts';

const KEEP_DAYS = 180;
const MAX_ROWS = 20000;
const PRUNE_EVERY = 50; // prune every 50 writes (per-isolate counter)

let writeCount = 0;

async function prune(db: D1Database) {
  try {
    const cutoff = Math.floor(Date.now() / 1000) - KEEP_DAYS * 86400;
    await pruneHubAudit(db, cutoff, MAX_ROWS);
  } catch { /* prune failure is silent; retried on a later write */ }
}

const clip = (v: unknown, n: number) => String(v ?? '').slice(0, n);

export interface HubAuditInput {
  /** 'hub' for portal operations, 'system' for scheduled/internal ones. */
  actor?: string;
  action: string;
  /** The guild's slug handle (portal callers) or its numeric ID; the
   *  stored column is the numeric guild ID (migration 0033). */
  tenant?: string | number;
  /** Digest object (JSON-serialized) or pre-built string. Digests only:
   *  never a password, a webhook URL, or a secret value. */
  summary?: Record<string, unknown> | string;
  ip?: string;
}

/* auditHub(db, input) — append one audit row. Never throws. */
export async function auditHub(db: D1Database, input: HubAuditInput): Promise<boolean> {
  try {
    if (!db || typeof db.prepare !== 'function') return false;
    const summary = input.summary == null
      ? ''
      : typeof input.summary === 'string'
        ? clip(input.summary, 500)
        : clip(JSON.stringify(input.summary), 500);
    const tenantId = typeof input.tenant === 'number'
      ? input.tenant
      : input.tenant
        ? (await getGuildIdBySlug(db, String(input.tenant)).catch(() => null)) ?? 0
        : 0;
    await insertHubAudit(db, {
      at: Math.floor(Date.now() / 1000),
      actor: clip(input.actor || 'hub', 20),
      action: clip(input.action, 60),
      tenant: tenantId,
      summary,
      ip: clip(input.ip, 60),
    });
    writeCount++;
    if (writeCount % PRUNE_EVERY === 0) await prune(db);
    return true;
  } catch { return false; }
}

export interface HubAuditPage {
  entries: HubAuditRow[];
  total: number;
}

/* Portal read: newest first, optional exact-tenant filter, paged.
 * Missing table / query failure -> empty page (never throws). */
export async function listHubAuditPage(
  db: D1Database,
  opts: { tenant?: string; limit?: number; offset?: number } = {},
): Promise<HubAuditPage> {
  try {
    const tenant = opts.tenant
      ? (await getGuildIdBySlug(db, clip(opts.tenant, 40)).catch(() => null)) ?? 0
      : 0;
    const limit = Math.min(Math.max(Math.floor(opts.limit || 50), 1), 200);
    const offset = Math.max(Math.floor(opts.offset || 0), 0);
    const entries = await listHubAudit(db, { tenant, limit, offset });
    const total = await countHubAudit(db, tenant);
    return { entries, total };
  } catch {
    return { entries: [], total: 0 };
  }
}
