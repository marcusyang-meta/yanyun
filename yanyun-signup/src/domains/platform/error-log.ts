// Site-wide error sink (minimal self-built monitoring): structured errors
// land in the error_log table; the hub admin portal reads them via
// GET /api/hub/errors. Capture points wire in explicitly (worker/Hono
// uncaught errors, GraphQL execution errors except business-text errors,
// GuildHub alarm send failures, reminder webhook failures, Expo push failures).
//
// Hard rule: logging must never affect the main request — every export
// here swallows all exceptions; callers need no try/catch.
// Retention: 30 days + row cap, pruned lazily on a write counter, no cron.
import { insertErrorLog, pruneErrorLog, listRecentErrors, countErrorsSince } from './errorLog.ts';

const KEEP_DAYS = 30;
const MAX_ROWS = 5000;
const PRUNE_EVERY = 50; // prune every 50 writes (per-isolate counter)

let writeCount = 0;

async function prune(db: D1Database) {
  try {
    const cutoff = Math.floor(Date.now() / 1000) - KEEP_DAYS * 86400;
    await pruneErrorLog(db, cutoff, MAX_ROWS);
  } catch { /* prune failure is silent; retried on a later write */ }
}

const clip = (v: any, n: number) => String(v ?? '').slice(0, n);

/* logError(db, { source, error?, name?, message?, tenant?, context? })
 * An Error in `error` supplies name/message/stack; context may be an
 * object (JSON-serialized, clipped) or a string. Never throws. */
export async function logError(db: D1Database, entry: any = {}) {
  try {
    if (!db || typeof db.prepare !== 'function') return false;
    // Drizzle wraps errors in DrizzleQueryError ("Failed query: <SQL>");
    // store the deepest cause's name/message/stack — the portal needs the
    // original failure, not the SQL wrapper.
    let e = entry.error;
    while (e && e.cause && (e.cause.message || e.cause.name)) e = e.cause;
    const name = clip(entry.name || (e && e.name) || '', 80);
    const message = clip(entry.message || (e && e.message) || (e ? String(e) : ''), 500);
    const stack = clip(e && e.stack ? e.stack : '', 1500);
    let context = '';
    if (entry.context != null) {
      context = typeof entry.context === 'string'
        ? clip(entry.context, 500)
        : clip(JSON.stringify(entry.context), 500);
    }
    await insertErrorLog(db, {
      at: Math.floor(Date.now() / 1000),
      source: clip(entry.source, 40), name, message,
      tenant: clip(entry.tenant, 40), context, stack,
    });
    writeCount++;
    if (writeCount % PRUNE_EVERY === 0) await prune(db);
    return true;
  } catch { return false; }
}

/* Portal read: latest N + last-24h count. Missing table / query failure -> empty. */
export async function recentErrors(db: D1Database, limit = 50) {
  try {
    const errors = await listRecentErrors(db, limit);
    const dayAgo = Math.floor(Date.now() / 1000) - 86400;
    const last24h = await countErrorsSince(db, dayAgo);
    return { errors, last24h };
  } catch {
    return { errors: [], last24h: 0 };
  }
}
