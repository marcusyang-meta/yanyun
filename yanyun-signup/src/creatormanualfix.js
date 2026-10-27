/* ---------- One-off manual ownership fix (user's verbal instruction, 2026-10-25) ----------
 * Background: creatorbackfill's seat-1 rule could not resolve the
 * creators of cars 39 / 40 (tenant jijiguagua) — seat 1 of car 39
 * (Pianlan) and of car 40 (柧) matched no unique account in the stamps
 * or this guild's roster. The user designated the ownership directly;
 * this job is a one-off fix for these two cars only, not a rule change:
 *
 *   Car 39: owner is temporarily set to the account of '橘橘如笙'
 *   (she is not in car 39; she is seat 2 of car 38). Resolution, in
 *   priority order, unique match only:
 *     a) signups in this guild whose nickname is exactly '橘橘如笙'
 *        already carry a discord_id stamp, deduplicated to exactly
 *        one -> use it (seat-stamp);
 *     b) else a unique guild_members roster match on display name
 *        (nick, falling back to global_name) exactly equal to
 *        '橘橘如笙' -> use it (roster-unique);
 *     c) otherwise skip and audit.
 *
 *   Car 40: find 'be8bo / 木瓜PAPAYA' (believed to be two names for
 *   the same person: Discord name be8bo, nickname 木瓜PAPAYA; neither
 *   appears among the signup nicknames, so search the account side
 *   only). Case-insensitive exact match for both names across four
 *   sources — users.username, guild_members.nick,
 *   guild_members.global_name, and user_guild_nicks.nick for this
 *   guild's bound server — collecting deduplicated discord_ids:
 *   exactly one -> set as owner (account-match); zero -> not-found;
 *   more than one -> ambiguous, skip; the audit detail records the
 *   hit accounts/sources per name.
 *
 * Same safety model as creatorbackfill: guarded by the global settings
 * flag creator_manual_fix_v1 and idempotent (writes only while the
 * creator is still NULL/''; concurrent/repeat triggers never overwrite
 * an existing value). Auditing reuses creator_backfill_log (reason
 * carries a manual-fix: prefix naming the job and source; the detail
 * column records the resolution trail; it is part of the baseline schema).
 * The host safety gate is identical to backfill's: only production
 * hosts (yanyun.app / yanyun.tbdlab.workers.dev) trigger it; preview
 * (release-yanyun) shares the same D1 as production, so it must never
 * run on preview/localhost and must never write the flag there.
 * Roster/account data is looked up only on the Worker side. */

const PROD_HOSTS = new Set(['yanyun.app', 'yanyun.tbdlab.workers.dev']);
const FLAG_KEY = 'creator_manual_fix_v1';
const TENANT = 'jijiguagua';
const CAR39 = { eventId: 39, name: '橘橘如笙' };
const CAR40 = { eventId: 40, names: ['be8bo', '木瓜PAPAYA'] };
// One attempt per DB per isolate (same approach as backfill).
const attemptedDbs = new WeakSet();


async function getGlobalFlag(db) {
  const row = await db.prepare("SELECT value FROM settings WHERE tenant = '' AND key = ?")
    .bind(FLAG_KEY).first().catch(() => null);
  return row ? String(row.value || '') : '';
}

async function setGlobalFlag(db) {
  await db.prepare(
    "INSERT INTO settings(tenant, key, value) VALUES('', ?, '1') ON CONFLICT(tenant, key) DO UPDATE SET value = excluded.value"
  ).bind(FLAG_KEY).run();
}

async function writeAudit(db, { eventId, tenant, label, resolved, outcome, reason, detail, now }) {
  await db.prepare(
    `INSERT INTO creator_backfill_log
       (event_id, tenant, seat_nickname, resolved_discord_id, outcome, reason, detail, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(eventId, tenant, label, resolved, outcome, reason, detail || '', now)
    .run().catch(() => {});
}

async function loadEvent(db, eventId) {
  return db.prepare('SELECT id, tenant, creator_discord_id FROM events WHERE id = ?')
    .bind(eventId).first().catch(() => null);
}

/* Guarded stamp: write only while the creator is still empty;
 * returns whether it actually wrote. */
async function stampCreator(db, eventId, discordId) {
  const r = await db.prepare(
    `UPDATE events SET creator_discord_id = ?
     WHERE id = ? AND (creator_discord_id IS NULL OR creator_discord_id = '')`
  ).bind(discordId, eventId).run();
  return !!(r.meta && r.meta.changes);
}

/* Car 39 resolution: seat stamp (exact name in this guild) ->
 * unique roster display-name match; unique only. */
async function resolveCar39(db) {
  const { results: stampRows } = await db.prepare(
    `SELECT s.discord_id AS did FROM signups s JOIN events e ON e.id = s.event_id
     WHERE e.tenant = ? AND s.nickname = ?
       AND s.discord_id IS NOT NULL AND s.discord_id != ''`
  ).bind(TENANT, CAR39.name).all().catch(() => ({ results: [] }));
  const stampIds = [...new Set((stampRows || [])
    .map((r) => String(r.did || '').trim()).filter(Boolean))];
  const { results: roster } = await db.prepare(
    'SELECT discord_id, nick, global_name FROM guild_members WHERE tenant = ?'
  ).bind(TENANT).all().catch(() => ({ results: [] }));
  const rosterIds = [...new Set((roster || [])
    .filter((r) => (String(r.nick || '').trim() || String(r.global_name || '').trim()) === CAR39.name)
    .map((r) => String(r.discord_id)))];
  const detail = (source) => JSON.stringify({
    target: CAR39.name, seatStampIds: stampIds, rosterIds, source,
  });
  if (stampIds.length === 1) {
    return { resolved: stampIds[0], reason: 'manual-fix:seat-stamp', detail: detail('seat-stamp') };
  }
  if (rosterIds.length === 1) {
    return { resolved: rosterIds[0], reason: 'manual-fix:roster-unique', detail: detail('roster-unique') };
  }
  const ambiguous = stampIds.length > 1 || rosterIds.length > 1;
  return { resolved: null, reason: ambiguous ? 'manual-fix:ambiguous' : 'manual-fix:no-match', detail: detail(null) };
}

/* Car 40 resolution: case-insensitive exact match for both names
 * across the four account-side sources, deduplicated. */
async function resolveCar40(db) {
  const wanted = CAR40.names.map((n) => n.toLowerCase());
  // perName: name -> Map(discord_id -> Set(source))
  const perName = new Map(CAR40.names.map((n) => [n, new Map()]));
  const hit = (nameIdx, discordId, source) => {
    const m = perName.get(CAR40.names[nameIdx]);
    const id = String(discordId || '').trim();
    if (!id) return;
    if (!m.has(id)) m.set(id, new Set());
    m.get(id).add(source);
  };
  const matchIdx = (value) => wanted.indexOf(String(value || '').trim().toLowerCase());
  // Source 1: users.username (site-wide accounts).
  const { results: users } = await db.prepare('SELECT discord_id, username FROM users')
    .all().catch(() => ({ results: [] }));
  for (const u of users || []) {
    const i = matchIdx(u.username);
    if (i >= 0) hit(i, u.discord_id, 'users.username');
  }
  // Sources 2/3: this guild's roster nick / global_name (either column exactly equal to either name).
  const { results: roster } = await db.prepare(
    'SELECT discord_id, nick, global_name FROM guild_members WHERE tenant = ?'
  ).bind(TENANT).all().catch(() => ({ results: [] }));
  for (const r of roster || []) {
    const iNick = matchIdx(r.nick);
    if (iNick >= 0) hit(iNick, r.discord_id, 'guild_members.nick');
    const iGlobal = matchIdx(r.global_name);
    if (iGlobal >= 0) hit(iGlobal, r.discord_id, 'guild_members.global_name');
  }
  // Source 4: nickname snapshot for this guild's bound server, user_guild_nicks.nick.
  const dgidRow = await db.prepare('SELECT value FROM settings WHERE tenant = ? AND key = ?')
    .bind(TENANT, 'discord_guild_id').first().catch(() => null);
  const dgid = dgidRow ? String(dgidRow.value || '').trim() : '';
  if (dgid) {
    const { results: nicks } = await db.prepare(
      'SELECT discord_id, nick FROM user_guild_nicks WHERE guild_id = ?'
    ).bind(dgid).all().catch(() => ({ results: [] }));
    for (const n of nicks || []) {
      const i = matchIdx(n.nick);
      if (i >= 0) hit(i, n.discord_id, 'user_guild_nicks.nick');
    }
  }
  const allIds = new Set();
  perName.forEach((m) => m.forEach((_, id) => allIds.add(id)));
  const detailObj = {};
  perName.forEach((m, name) => {
    detailObj[name] = {};
    m.forEach((sources, id) => { detailObj[name][id] = [...sources]; });
  });
  const detail = JSON.stringify(detailObj);
  if (allIds.size === 1) {
    return { resolved: [...allIds][0], reason: 'manual-fix:account-match', detail };
  }
  if (allIds.size === 0) return { resolved: null, reason: 'manual-fix:not-found', detail };
  return { resolved: null, reason: 'manual-fix:ambiguous', detail };
}

/* Per-car handling: exactly one audit row whatever the outcome;
 * stamps only while the creator is still empty. */
async function processCar(db, spec, resolver, now) {
  const ev = await loadEvent(db, spec.eventId);
  const label = spec.label;
  if (!ev) {
    await writeAudit(db, {
      eventId: spec.eventId, tenant: TENANT, label, resolved: null,
      outcome: 'skipped', reason: 'manual-fix:event-missing', detail: '', now,
    });
    return 'skipped';
  }
  const tenant = String(ev.tenant || '');
  if (tenant !== TENANT) {
    await writeAudit(db, {
      eventId: spec.eventId, tenant, label, resolved: null,
      outcome: 'skipped', reason: 'manual-fix:tenant-mismatch',
      detail: JSON.stringify({ tenant }), now,
    });
    return 'skipped';
  }
  const existing = String(ev.creator_discord_id || '').trim();
  if (existing) {
    await writeAudit(db, {
      eventId: spec.eventId, tenant, label, resolved: null,
      outcome: 'skipped', reason: 'manual-fix:already-set',
      detail: JSON.stringify({ existing }), now,
    });
    return 'skipped';
  }
  const r = await resolver(db);
  if (r.resolved) {
    const wrote = await stampCreator(db, spec.eventId, r.resolved);
    if (wrote) {
      await writeAudit(db, {
        eventId: spec.eventId, tenant, label, resolved: r.resolved,
        outcome: 'stamped', reason: r.reason, detail: r.detail, now,
      });
      return 'stamped';
    }
    await writeAudit(db, {
      eventId: spec.eventId, tenant, label, resolved: null,
      outcome: 'skipped', reason: 'manual-fix:raced', detail: r.detail, now,
    });
    return 'skipped';
  }
  await writeAudit(db, {
    eventId: spec.eventId, tenant, label, resolved: null,
    outcome: 'skipped', reason: r.reason, detail: r.detail, now,
  });
  return 'skipped';
}

/* Core job, without the host/isolate gates, so the acceptance harness
 * can call it directly. Returns { done:true, stamped, skipped } or
 * { done:false, reason }. */
export async function runCreatorManualFixOnce(db) {
  if ((await getGlobalFlag(db)) === '1') return { done: false, reason: 'flag-set' };
  const now = Math.floor(Date.now() / 1000);
  let stamped = 0, skipped = 0;
  const r39 = await processCar(db,
    { eventId: CAR39.eventId, label: CAR39.name }, resolveCar39, now);
  if (r39 === 'stamped') stamped++; else skipped++;
  const r40 = await processCar(db,
    { eventId: CAR40.eventId, label: CAR40.names.join('/') }, resolveCar40, now);
  if (r40 === 'stamped') stamped++; else skipped++;
  await setGlobalFlag(db);
  return { done: true, stamped, skipped };
}

/* Trigger entry: the worker calls this on /graphql via waitUntil, as
 * with backfill. Fully fault-tolerant, failures silent (with the flag
 * unset, the next production request retries). */
export async function maybeRunCreatorManualFix(env, request) {
  try {
    if (!env || !env.DB || !request) return { done: false, reason: 'no-env' };
    let host = '';
    try { host = new URL(request.url).hostname; } catch { return { done: false, reason: 'bad-url' }; }
    if (!PROD_HOSTS.has(host)) return { done: false, reason: 'host-not-prod' };
    if (attemptedDbs.has(env.DB)) return { done: false, reason: 'isolate-latch' };
    attemptedDbs.add(env.DB);
    return await runCreatorManualFixOnce(env.DB);
  } catch {
    return { done: false, reason: 'error' };
  }
}
