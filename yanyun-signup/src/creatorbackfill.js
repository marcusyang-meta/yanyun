/* ---------- Backfill creator for legacy cars with none (user ruling, 2026-10-25) ----------
 * Background: member cars created before the creator was stored
 * have no creator record, so the creator gate for edit/complete/disband
 * lets nobody through. The user's ruling: ownership follows seat 1.
 * For origin='member' cars with no recorded creator, take the occupant
 * of seat 1 in detail-page render order (signups ORDER BY id ASC) and
 * resolve, in order:
 *   seat's existing discord_id stamp -> unique nickname match in this
 *   guild's own roster (guild_members; display name = nick, falling
 *   back to global_name).
 * Cross-guild/global matches do not qualify and are not used. Only a
 * unique resolution stamps the creator; empty seat / no match /
 * ambiguous duplicates are skipped and audited (creator_backfill_log).
 * Cars that already have a creator are never touched.
 *
 * ID-reform note (0036): resolution still happens in Discord space
 * (seat stamps and roster rows carry Discord IDs), but the stamp
 * lands on events.creator_user_id — the resolved Discord ID is
 * converted through the users row (ensureUserIdByDiscordId, the
 * runtime mirror of the migration's orphan minting). "No creator"
 * is creator_user_id NULL/0; the settings flag lives at the global
 * scope, tenant 0.
 *
 * One-off lazy migration: guarded by the global settings flag
 * creator_backfill_v1 and idempotent (the UPDATE is conditional on
 * the creator still being empty; once the flag is set it never runs again).
 *
 * SAFETY GATE (critical): may only trigger on a production host.
 * Preview (release-yanyun.tbdlab.workers.dev) and production share the
 * same D1 (same database_id), so running it from preview would write
 * production data without going through promote. If the host is not on
 * the allowlist (yanyun.app / yanyun.tbdlab.workers.dev) it must not
 * run at all — not even to write the flag. */

import { ensureUserIdByDiscordId } from './domains/identity/users.ts';

const PROD_HOSTS = new Set(['yanyun.app', 'yanyun.tbdlab.workers.dev']);
const FLAG_KEY = 'creator_backfill_v1';
// One attempt per DB per isolate (WeakSet keyed by DB object; tests
// swapping in a FakeDB stay isolated; production env.DB is constant).
const attemptedDbs = new WeakSet();

async function getGlobalFlag(db) {
  const row = await db.prepare('SELECT value FROM settings WHERE tenant = 0 AND key = ?')
    .bind(FLAG_KEY).first().catch(() => null);
  return row ? String(row.value || '') : '';
}

async function setGlobalFlag(db) {
  await db.prepare(
    "INSERT INTO settings(tenant, key, value) VALUES(0, ?, '1') ON CONFLICT(tenant, key) DO UPDATE SET value = excluded.value"
  ).bind(FLAG_KEY).run();
}

/* Core migration, without the host/isolate gates, so the acceptance
 * harness can call it directly. Returns { done:true, stamped, skipped }
 * or { done:false, reason }. */
export async function runCreatorBackfillOnce(db) {
  if ((await getGlobalFlag(db)) === '1') return { done: false, reason: 'flag-set' };
  const now = Math.floor(Date.now() / 1000);
  const { results: events } = await db.prepare(
    `SELECT id, tenant FROM events
     WHERE origin = 'member' AND (creator_user_id IS NULL OR creator_user_id = 0)
     ORDER BY id ASC`
  ).all();
  // Fetch each tenant's roster once; index by display name:
  // tenant|name -> set of discord_ids.
  const rosterByTenant = new Map();
  const rosterOf = async (tenant) => {
    if (!rosterByTenant.has(tenant)) {
      const { results } = await db.prepare(
        'SELECT discord_id, nick, global_name FROM guild_members WHERE tenant = ?'
      ).bind(tenant).all().catch(() => ({ results: [] }));
      const byName = new Map();
      for (const r of results || []) {
        const name = String(r.nick || '').trim() || String(r.global_name || '').trim();
        if (!name) continue;
        if (!byName.has(name)) byName.set(name, new Set());
        byName.get(name).add(String(r.discord_id));
      }
      rosterByTenant.set(tenant, byName);
    }
    return rosterByTenant.get(tenant);
  };
  let stamped = 0, skipped = 0;
  for (const ev of events || []) {
    const seat = await db.prepare(
      'SELECT nickname, discord_id FROM signups WHERE event_id = ? ORDER BY id ASC LIMIT 1'
    ).bind(ev.id).first().catch(() => null);
    let outcome = 'skipped', reason = '', resolved = null;
    if (!seat) {
      reason = 'no-seat1';
    } else if (seat.discord_id && String(seat.discord_id).trim()) {
      resolved = String(seat.discord_id).trim();
      outcome = 'stamped'; reason = 'seat-stamp';
    } else {
      const nick = String(seat.nickname || '').trim();
      const hits = nick ? (await rosterOf(ev.tenant)).get(nick) : undefined;
      if (hits && hits.size === 1) {
        resolved = [...hits][0];
        outcome = 'stamped'; reason = 'roster-unique';
      } else if (hits && hits.size > 1) {
        reason = 'ambiguous';
      } else {
        reason = 'no-match';
      }
    }
    if (outcome === 'stamped' && resolved) {
      // Guarded update: if another writer stamped it concurrently, do not overwrite.
      const creatorUserId = await ensureUserIdByDiscordId(db, resolved);
      const r = await db.prepare(
        `UPDATE events SET creator_user_id = ?
         WHERE id = ? AND (creator_user_id IS NULL OR creator_user_id = 0)`
      ).bind(creatorUserId, ev.id).run();
      if (!r.meta || !r.meta.changes) { outcome = 'skipped'; reason = 'raced'; resolved = null; }
    }
    if (outcome === 'stamped') stamped++; else skipped++;
    await db.prepare(
      `INSERT INTO creator_backfill_log
         (event_id, tenant, seat_nickname, resolved_discord_id, outcome, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(ev.id, ev.tenant ?? 0, seat ? String(seat.nickname || '') : '',
      resolved, outcome, reason, now).run().catch(() => {});
  }
  await setGlobalFlag(db);
  return { done: true, stamped, skipped };
}

/* Trigger entry: the worker calls this on /graphql via waitUntil.
 * Fully fault-tolerant — any failure is silent (a failed migration
 * must not affect the request; with the flag unset, the next request
 * retries). */
export async function maybeRunCreatorBackfill(env, request) {
  try {
    if (!env || !env.DB || !request) return { done: false, reason: 'no-env' };
    let host = '';
    try { host = new URL(request.url).hostname; } catch { return { done: false, reason: 'bad-url' }; }
    if (!PROD_HOSTS.has(host)) return { done: false, reason: 'host-not-prod' };
    if (attemptedDbs.has(env.DB)) return { done: false, reason: 'isolate-latch' };
    attemptedDbs.add(env.DB);
    return await runCreatorBackfillOnce(env.DB);
  } catch {
    return { done: false, reason: 'error' };
  }
}
