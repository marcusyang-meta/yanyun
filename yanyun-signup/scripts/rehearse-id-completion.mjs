#!/usr/bin/env node
/* Rehearsal for migration 0037 (typed-ID completion of 0036).
 *
 * Flows, all starting from the ORIGINAL #92 seed on the pre-0036
 * chain (chain = every migration before 0036):
 *   A  fresh: corrected 0036, then 0037 — 0037 must be an exact
 *      identity transform (full-table dump comparison).
 *   B  incident: corrected 0036 truncated right after the
 *      short_links CREATE (the production half state, minus the
 *      empty staged table), then 0037 — final state must dump
 *      identically to A.
 *   C  hostile tail on the half state: dangling references of every
 *      disposition class (dead events, dead guilds, orphan Discord
 *      IDs, a dedupe key naming a dead event) — survivors, drops
 *      and zeroes are asserted explicitly.
 *   D  0037 again on B's end state: still an exact identity.
 *   E  0037 truncated mid-way (after the settings block) on the
 *      half state, then the full 0037: converges to B's end state.
 * Plus a post-run-1 fixture on the half state (rows the old code
 * created after 0036's prefix landed: a tenant/user/event and tail
 * rows referencing them in mixed old/new forms) — must resolve to
 * the typed IDs, with never-registered Discord IDs minted as
 * orphan users.
 *
 * Uses the sqlite3 CLI, like rehearse-id-migration.mjs.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const signupDir = join(here, '..');
const keep = process.argv.includes('--keep');
const work = mkdtempSync(join(tmpdir(), 'idfix-rehearsal-'));

const sq = (query, target) =>
  execFileSync('sqlite3', ['-json', target, query], { encoding: 'utf8' }).trim();
const run = (query, target) => {
  const out = sq(query, target);
  return out ? JSON.parse(out) : [];
};
const sqFile = (file, target) =>
  execFileSync('sqlite3', [target, `.read ${file.replaceAll('\\', '/')}`], { encoding: 'utf8' });
const sqText = (text, target) => {
  const f = join(work, 'snippet.sql');
  writeFileSync(f, text);
  sqFile(f, target);
};
const scalar = (query, target) => {
  const rows = run(query, target);
  return rows.length ? Object.values(rows[0])[0] : null;
};

let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : ` — ${detail}`}`);
};

const mig = (name) => join(signupDir, 'migrations', name);
const MIG0036 = mig('0036_typed_public_ids.sql');
const MIG0037 = mig('0037_typed_id_completion.sql');
import { readdirSync } from 'node:fs';
const chain = JSON.stringify(
  readdirSync(join(signupDir, 'migrations')).filter((f) => f.endsWith('.sql') && f < '0036').sort(),
);

/* ---- shared fixtures ---- */
const SEED = readFileSync(join(here, 'id-migration-seed.sql'), 'utf8');
const HOSTILE = `
INSERT INTO short_links (code, tenant, event_id, created_at) VALUES ('deadlnk', 'jiliguala', 999, 1767225600);
INSERT INTO signup_answers (event_id, signup_uid, field_id, value) VALUES (999, 'seat-x', 0, 'dead-event answer');
INSERT INTO signup_answers (event_id, signup_uid, field_id, value) VALUES (1, 'seat-y', 999, 'dead-field answer');
INSERT INTO event_reminders (event_id, offset_min, sent_at, error) VALUES (999, 30, NULL, NULL);
INSERT INTO lottery_entries (lottery_id, discord_id, display_name, weight) VALUES (999, '111111111111111111', 'Ghost', 1);
INSERT INTO time_poll_votes (poll_id, option_id, discord_id, display_name) VALUES (999, 999, '111111111111111111', 'Ghost');
INSERT INTO guild_announcement_reads (announcement_id, tenant, discord_id, read_at) VALUES (999, 'jiliguala', '111111111111111111', 1767225600);
INSERT INTO guild_announcement_translations (announcement_id, tenant, locale, title, body, status, source_hash) VALUES (999, 'jiliguala', 'en', 'x', 'y', 'done', 'h');
INSERT INTO build_share_links (code, build_id, discord_id, created_at) VALUES ('deadbuild', 999, '111111111111111111', 1767225600);
INSERT INTO creator_backfill_log (event_id, tenant, seat_nickname, resolved_discord_id, outcome, created_at) VALUES (999, 'jiliguala', 'GhostSeat', '111111111111111111', 'resolved', 1767225600);
INSERT INTO contribution_entries (tenant, discord_id, action_key, points, event_id, dedupe_key, created_at) VALUES ('jiliguala', '111111111111111111', 'leading', 3, 999, 'leading:999:111111111111111111', 1767225600);
INSERT INTO contribution_entries (tenant, discord_id, action_key, points, event_id, dedupe_key, created_at) VALUES ('jiliguala', '999999999999999999', 'attendance', 3, 1, 'attendance:1:999999999999999999', 1767225600);
INSERT INTO settings (tenant, key, value) VALUES ('dead-guild', 'dead-key', '"v"');
INSERT INTO guild_entitlements (tenant, plan, source) VALUES ('dead-guild', 't3', 'manual');
INSERT INTO member_availability (tenant, discord_id, display_name, slots_json, updated_at) VALUES ('dead-guild', '999999999999999999', 'Ghost', '[]', 1767225600);
`;

/* Post-0036-prefix rows, as the still-running old code writes them:
 * fresh rows in already-rebuilt tables get rowid-style ids past the
 * typed range; tail rows reference them in old and new forms. The
 * prefix tables' non-id columns are identical in both shapes, so
 * the inserts below use the shared column names; the event row
 * carries old-form VALUES (slug tenant, raw Discord creator). */
const postRun1 = (dbFile) => {
  sqText(`
INSERT INTO tenants (slug, guild_name, password_hash, announcement, created_at, discord_webhook, slogan, master_name, logo_url, bg_image_url, recruit_open) VALUES ('guild-post', 'Post Guild', '', '', '2026-12-01 10:00:00', '', '', '', '', '', 0);
INSERT INTO users (discord_id, username, avatar, guilds_json, guilds_checked_at, created_at, updated_at) VALUES ('121212121212121212', 'PostUser', '', '[]', 1798761600, 1798761600, 1798761600);
INSERT INTO events (title, type, description, starts_at, meet_info, max_slots, status, created_at, tenant, origin, created_by, manage_code, dungeon, creator_user_id, ally_visible, visitor_slots) VALUES ('Post Car', 'activity', '', '2026-12-05 20:00', '', 10, 'open', '2026-12-01 10:00:00', 'guild-post', 'member', '热心侠客', '', '试锋', 111111111111111111, 0, 0);
`, dbFile);
  const newEventId = scalar(`SELECT id FROM events WHERE title = 'Post Car'`, dbFile);
  const newTenantId = scalar(`SELECT id FROM tenants WHERE slug = 'guild-post'`, dbFile);
  const newUserId = scalar(`SELECT id FROM users WHERE discord_id = '121212121212121212'`, dbFile);
  sqText(`
INSERT INTO short_links (code, tenant, event_id, created_at) VALUES ('postlnk', 'guild-post', ${newEventId}, 1798761600);
INSERT INTO signup_answers (event_id, signup_uid, field_id, value) VALUES (${newEventId}, 'seat-post', 0, 'post-run answer');
INSERT INTO contribution_entries (tenant, discord_id, action_key, points, event_id, dedupe_key, created_at) VALUES ('guild-post', '121212121212121212', 'leading', 5, ${newEventId}, 'leading:${newEventId}:343434343434343434', 1798761600);
INSERT INTO guild_officer_grants (tenant, discord_id, capabilities, granted_by, granted_by_name, created_at, updated_at) VALUES ('guild-post', '343434343434343434', '', '111111111111111111', '', 1798761600, 1798761600);
`, dbFile);
  return { newEventId, newTenantId, newUserId };
};

/* Truncate a migration right after the statement containing a
 * marker (statement split mirrors the generators': ';\n'). */
const truncateAfter = (file, marker) => {
  const text = readFileSync(file, 'utf8');
  const idx = text.indexOf(marker);
  if (idx < 0) throw new Error(`marker not found in ${file}: ${marker}`);
  const end = text.indexOf(';\n', idx);
  const out = join(work, `trunc-${Math.abs([...marker].reduce((a, c) => a + c.charCodeAt(0), 0))}.sql`);
  writeFileSync(out, text.slice(0, end + 2));
  return out;
};

const buildBase = (name, extra = '') => {
  const f = join(work, name);
  for (const m of JSON.parse(chain)) sqFile(join(signupDir, 'migrations', m), f);
  sqText(SEED, f);
  if (extra) sqText(extra, f);
  return f;
};

const dumpAll = (dbFile) => {
  const tables = run(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`, dbFile,
  ).map((r) => r.name);
  const out = {};
  for (const t of tables) {
    const cols = run(`PRAGMA table_info(${t})`, dbFile).map((r) => r.name);
    out[t] = run(`SELECT * FROM ${t} ORDER BY ${cols.map((c) => `"${c}"`).join(', ')}`, dbFile);
  }
  /* The seed's two intentional orphan users (777…, 888…) are minted
   * by the migration with strftime('%s','now') timestamps, so their
   * created_at/updated_at differ by wall clock between flows. Mask
   * exactly those two rows' timestamps; everything else must match
   * byte for byte. */
  for (const row of out.users || []) {
    if (row.discord_id === '777777777777777777' || row.discord_id === '888888888888888888') {
      row.created_at = 0;
      row.updated_at = 0;
    }
  }
  return out;
};
const diffDumps = (a, b) => {
  const tables = new Set([...Object.keys(a), ...Object.keys(b)]);
  const bad = [];
  for (const t of tables) {
    if (JSON.stringify(a[t]) !== JSON.stringify(b[t])) bad.push(t);
  }
  return bad;
};

/* ---- Flow A: fresh chain, corrected 0036, then 0037 ---- */
const dbA = buildBase('a.sqlite');
sqFile(MIG0036, dbA);
const dumpA36 = dumpAll(dbA);
sqFile(MIG0037, dbA);
const dumpA = dumpAll(dbA);
check('A: 0037 is an identity transform on a fully migrated database',
  diffDumps(dumpA36, dumpA).length === 0, diffDumps(dumpA36, dumpA).join(','));
check('A: fk_check clean', run('PRAGMA foreign_key_check', dbA).length === 0);

/* ---- Flow B: production half state, then 0037 ---- */
const dbB = buildBase('b.sqlite');
sqFile(truncateAfter(MIG0036, 'CREATE TABLE short_links__new'), dbB);
sqFile(MIG0037, dbB);
check('B: half state + 0037 converges to the fresh-chain end state',
  diffDumps(dumpA, dumpAll(dbB)).length === 0, diffDumps(dumpA, dumpAll(dbB)).join(','));
check('B: fk_check clean', run('PRAGMA foreign_key_check', dbB).length === 0);
check('B: no working tables left',
  scalar(`SELECT COUNT(*) FROM sqlite_master WHERE name LIKE '_idmig%' OR name LIKE '_c37%' OR name LIKE '%__new'`, dbB) === 0);

/* ---- Flow D: 0037 again on the converged state ---- */
sqFile(MIG0037, dbB);
check('D: second 0037 run is an exact identity',
  diffDumps(dumpA, dumpAll(dbB)).length === 0, diffDumps(dumpA, dumpAll(dbB)).join(','));

/* ---- Flow E: 0037 aborted mid-way, then full 0037 ---- */
const dbE = buildBase('e.sqlite');
sqFile(truncateAfter(MIG0036, 'CREATE TABLE short_links__new'), dbE);
sqFile(truncateAfter(MIG0037, 'UPDATE settings__new SET'), dbE);
sqFile(MIG0037, dbE);
check('E: aborted 0037 + full 0037 converges to the same end state',
  diffDumps(dumpA, dumpAll(dbE)).length === 0, diffDumps(dumpA, dumpAll(dbE)).join(','));

/* ---- Flow C: hostile tail + post-run-1 rows on the half state ---- */
const dbC = buildBase('c.sqlite', HOSTILE);
const baseMentions = run(`SELECT discord_id FROM signups WHERE event_id = 1 ORDER BY id`, dbC)
  .map((r) => `<@${r.discord_id}>`);
sqFile(truncateAfter(MIG0036, 'CREATE TABLE short_links__new'), dbC);
const post = postRun1(dbC);
sqFile(MIG0037, dbC);

const typedUser = (discordId) => scalar(`SELECT id FROM users WHERE discord_id = '${discordId}'`, dbC);
const guildId = scalar(`SELECT id FROM tenants WHERE slug = 'jiliguala'`, dbC);
const event1 = scalar(`SELECT id FROM events WHERE title = '周六双十人本'`, dbC);
const alice = typedUser('111111111111111111');

check('C: dead-event share alias dropped',
  scalar(`SELECT COUNT(*) FROM short_links WHERE code = 'deadlnk'`, dbC) === 0);
check('C: resolvable share aliases survive and remap',
  scalar(`SELECT event_id FROM short_links WHERE code = 'abc1234'`, dbC) === event1 &&
  scalar(`SELECT tenant FROM short_links WHERE code = 'abc1234'`, dbC) === guildId);
check('C: dead-event signup answer dropped',
  scalar(`SELECT COUNT(*) FROM signup_answers WHERE value = 'dead-event answer'`, dbC) === 0);
check('C: dead-field signup answer kept, field lands on 0',
  scalar(`SELECT field_id FROM signup_answers WHERE value = 'dead-field answer'`, dbC) === 0);
check('C: dead-event reminder dropped',
  scalar(`SELECT COUNT(*) FROM event_reminders WHERE event_id = 999`, dbC) === 0);
check('C: dead-lottery entry dropped',
  scalar(`SELECT COUNT(*) FROM lottery_entries WHERE display_name = 'Ghost'`, dbC) === 0);
check('C: dead poll vote dropped',
  scalar(`SELECT COUNT(*) FROM time_poll_votes WHERE poll_id = 999`, dbC) === 0);
check('C: dead announcement read/translation dropped',
  scalar(`SELECT COUNT(*) FROM guild_announcement_reads WHERE announcement_id = 999`, dbC) === 0 &&
  scalar(`SELECT COUNT(*) FROM guild_announcement_translations WHERE announcement_id = 999`, dbC) === 0);
check('C: dead build share link dropped',
  scalar(`SELECT COUNT(*) FROM build_share_links WHERE code = 'deadbuild'`, dbC) === 0);
const backfill = run(`SELECT * FROM creator_backfill_log WHERE seat_nickname = 'GhostSeat'`, dbC)[0];
check('C: backfill log kept, dead event zeroes, resolved Discord ID untouched',
  !!backfill && backfill.event_id === 0 && backfill.resolved_discord_id === '111111111111111111',
  JSON.stringify(backfill));
const deadContrib = run(`SELECT * FROM contribution_entries WHERE dedupe_key LIKE 'leading:999:%'`, dbC)[0];
check('C: dead-event contribution kept, event nulls, dedupe keeps the dead segment',
  !!deadContrib && deadContrib.event_id === null &&
  deadContrib.dedupe_key === `leading:999:${alice}` &&
  deadContrib.tenant === guildId && deadContrib.user_id === alice, JSON.stringify(deadContrib));
const orphanContrib = run(`SELECT * FROM contribution_entries WHERE action_key = 'attendance' AND created_at = 1767225600`, dbC)[0];
check('C: orphan contribution author minted and remapped, key rewritten per segment',
  !!orphanContrib && orphanContrib.user_id === typedUser('999999999999999999') &&
  orphanContrib.dedupe_key === `attendance:${event1}:${typedUser('999999999999999999')}`,
  JSON.stringify(orphanContrib));
check('C: dead-tenant settings row dropped',
  scalar(`SELECT COUNT(*) FROM settings WHERE key = 'dead-key'`, dbC) === 0);
check('C: dead-tenant entitlement dropped',
  scalar(`SELECT COUNT(*) FROM guild_entitlements WHERE tenant = 0`, dbC) === 0);
check('C: dead-tenant availability dropped',
  scalar(`SELECT COUNT(*) FROM member_availability WHERE display_name = 'Ghost'`, dbC) === 0);

check('C: post-run-1 share link resolves to the new event/guild ids',
  scalar(`SELECT event_id FROM short_links WHERE code = 'postlnk'`, dbC) === post.newEventId &&
  scalar(`SELECT tenant FROM short_links WHERE code = 'postlnk'`, dbC) === post.newTenantId);
check('C: post-run-1 answer keeps the new event id',
  scalar(`SELECT event_id FROM signup_answers WHERE value = 'post-run answer'`, dbC) === post.newEventId);
const mixed = run(`SELECT * FROM contribution_entries WHERE created_at = 1798761600`, dbC)[0];
check('C: mixed-form contribution row resolves per segment',
  !!mixed && mixed.tenant === post.newTenantId && mixed.event_id === post.newEventId &&
  mixed.user_id === post.newUserId &&
  mixed.dedupe_key === `leading:${post.newEventId}:${typedUser('343434343434343434')}`,
  JSON.stringify(mixed));
check('C: officer grant for a never-registered ID mints the orphan user',
  scalar(`SELECT user_id FROM guild_officer_grants WHERE tenant = ${post.newTenantId}`, dbC) === typedUser('343434343434343434'));
check('C: minted orphan ids are typed (02…) and unique',
  [typedUser('999999999999999999'), typedUser('343434343434343434')]
    .every((id) => id > 2_000_000_000 && id < 3_000_000_000) &&
  typedUser('999999999999999999') !== typedUser('343434343434343434'));
check('C: fk_check clean', run('PRAGMA foreign_key_check', dbC).length === 0);
check('C: class-A Discord columns byte-identical to the seed',
  JSON.stringify(run(`SELECT discord_id FROM lottery_entries ORDER BY id`, dbC).map((r) => r.discord_id)) ===
  JSON.stringify(['111111111111111111', '222222222222222222', '777777777777777777']));
const mentionsC = run(
  `SELECT s.discord_id FROM signups s JOIN events e ON e.id = s.event_id WHERE e.title = '周六双十人本' ORDER BY s.id`, dbC,
).map((r) => `<@${r.discord_id}>`);
check('C: reminder mentions still render real Discord IDs',
  JSON.stringify(mentionsC) === JSON.stringify(baseMentions), JSON.stringify(mentionsC));

console.log(failures === 0 ? '\nCOMPLETION REHEARSAL PASS' : `\nCOMPLETION REHEARSAL FAIL (${failures})`);
if (!keep) rmSync(work, { recursive: true, force: true });
else console.log(`kept: ${work}`);
process.exit(failures === 0 ? 0 : 1);
