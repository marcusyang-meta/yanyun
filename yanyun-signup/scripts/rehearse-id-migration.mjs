// Rehearsal for migration 0036 (typed public IDs, docs/ID_SYSTEM.md).
//
// Builds a production-shaped snapshot (full migration chain + the
// deterministic seed in id-migration-seed.sql), captures a baseline,
// applies 0033, and asserts the protocol in ID_SYSTEM.md: foreign key
// integrity, row counts, bijective typed IDs, relationship
// equivalence, Discord class A byte-identity, and the reminder
// mention list (the webhook payload core) unchanged.
//
// Usage: node scripts/rehearse-id-migration.mjs [--keep]
// Exit code 0 = every assertion passed in a single clean run.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const signupDir = join(here, '..');
const keep = process.argv.includes('--keep');
const work = mkdtempSync(join(tmpdir(), 'idmig-rehearsal-'));
const db = join(work, 'snap.sqlite');

const sq = (query, target = db) =>
  JSON.parse(
    execFileSync('sqlite3', ['-json', target, query], { encoding: 'utf8' }) || '[]',
  );
const sqExec = (file, target = db) =>
  execFileSync('sqlite3', ['-bail', target, `.read ${file}`], { encoding: 'utf8' });
const scalar = (query) => {
  const rows = sq(query);
  return rows.length ? Object.values(rows[0])[0] : null;
};

let failures = 0;
const check = (label, ok, detail = '') => {
  if (ok) console.log(`  PASS ${label}`);
  else {
    failures++;
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
};

/* Mirror of parsePublicId's structural rules (the real parser is
 * covered by tests/ids.test.ts; the rehearsal checks shape + codes). */
const REGISTRY = {
  tenants: 1, users: 2, events: 10, grouping_templates: 11, signups: 12,
  results: 13, grouping_custom_fields: 14, guild_announcements: 20,
  user_gear_items: 30, user_gear_builds: 31, guild_applications: 40,
  mentor_pairings: 41, guild_roster_entries: 42, roster_import_batches: 43,
  roster_import_rows: 44, guild_member_notes: 45, member_season_goals: 46,
  guild_alliances: 50, fill_offers: 51, fill_requests: 52, fill_invites: 53,
  lotteries: 60, time_polls: 61, time_poll_options: 62, feedback: 70,
  ops_nudge_sends: 80,
};
const idShapeOk = (id, code) => {
  if (!Number.isSafeInteger(id)) return false;
  if (Math.floor(id / 1_000_000_000) !== code) return false;
  const seq = id % 100_000;
  return seq >= 1 && seq <= 99_999;
};
const dayOf = (id) => Math.floor(id / 100_000) % 10_000;

/* ------------------------------ build ------------------------------ */
console.log(`rehearsal db: ${db}`);
const chain = readdirSync(join(signupDir, 'migrations'))
  .filter((f) => f.endsWith('.sql') && f < '0036')
  .sort();
for (const f of chain) sqExec(join(signupDir, 'migrations', f));
sqExec(join(here, 'id-migration-seed.sql'));

const TABLES = sq(
  `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
).map((r) => r.name);

/* ----------------------------- baseline ---------------------------- */
const baseCounts = {};
for (const t of TABLES) baseCounts[t] = scalar(`SELECT COUNT(*) FROM ${t}`);
const baseMentions = sq(
  `SELECT discord_id FROM signups WHERE event_id = 1 AND discord_id IS NOT NULL ORDER BY id`,
).map((r) => `<@${r.discord_id}>`);
const baseMembers = sq(
  `SELECT discord_id, nick FROM guild_members WHERE tenant = 'jiliguala' ORDER BY discord_id`,
);
const baseSeats = sq(
  `SELECT nickname, discord_id, is_visitor FROM signups WHERE event_id = 1 ORDER BY id`,
);
const baseDedupe = sq(`SELECT dedupe_key FROM contribution_entries ORDER BY dedupe_key`).map(
  (r) => r.dedupe_key,
);
const baseA = {
  lotteryEntries: sq(`SELECT discord_id FROM lottery_entries ORDER BY id`).map((r) => r.discord_id),
  lotteryWinners: sq(`SELECT discord_id FROM lottery_winners ORDER BY id`).map((r) => r.discord_id),
  recipients: scalar(`SELECT recipient_ids FROM ops_nudge_sends WHERE id = 1`),
  nicks: sq(`SELECT * FROM user_guild_nicks`),
  rosterMatched: sq(
    `SELECT matched_discord_id FROM guild_roster_entries ORDER BY id`,
  ).map((r) => r.matched_discord_id),
  backfillResolved: scalar(`SELECT resolved_discord_id FROM creator_backfill_log WHERE id = 1`),
};
const baseOrphans = ['777777777777777777', '888888888888888888'];
const baseNonOrphanA = '999999999999999999';
check('baseline mentions captured', baseMentions.length === 4, JSON.stringify(baseMentions));

/* ------------------------------ migrate ---------------------------- */
sqExec(join(signupDir, 'migrations', '0036_typed_public_ids.sql'));
console.log('migration 0036 applied');

/* ----------------------------- assertions -------------------------- */
console.log('assertions:');
const fk = sq(`PRAGMA foreign_key_check`);
check('foreign_key_check returns zero rows', fk.length === 0, JSON.stringify(fk).slice(0, 200));

for (const t of TABLES) {
  const now = scalar(`SELECT COUNT(*) FROM ${t}`);
  const want = t === 'users' ? baseCounts[t] + baseOrphans.length : baseCounts[t];
  check(`row count ${t}`, now === want, `before=${baseCounts[t]} after=${now} want=${want}`);
}
check(
  'id_mint_counters exists',
  scalar(`SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='id_mint_counters'`) === 1,
);
check(
  'no _idmig_* tables remain',
  scalar(`SELECT COUNT(*) FROM sqlite_master WHERE name LIKE '_idmig%'`) === 0,
);

// Typed PK shape for every renumbered table.
for (const [table, code] of Object.entries(REGISTRY)) {
  const pkCol = table === 'tenants' || table === 'users' ? 'id' : 'id';
  const rows = sq(`SELECT ${pkCol} AS id FROM ${table}`);
  const bad = rows.filter((r) => !idShapeOk(r.id, code));
  check(`typed ids ${table} (code ${code})`, bad.length === 0, `bad=${JSON.stringify(bad).slice(0, 120)}`);
  const uniq = new Set(rows.map((r) => r.id));
  check(`unique ids ${table}`, uniq.size === rows.length);
}

// Guild / user resolution helpers for relationship equivalence.
const guildId = (slug) => scalar(`SELECT id FROM tenants WHERE slug = '${slug}'`);
const userDiscord = (userId) => scalar(`SELECT discord_id FROM users WHERE id = ${userId}`);
const eventIdByTitle = (title) => scalar(`SELECT id FROM events WHERE title = '${title}'`);
const jili = guildId('jiliguala');
const feng = guildId('fengyue');
check('guild ids parse as code 01 in creation-day order',
  idShapeOk(jili, 1) && idShapeOk(feng, 1) && jili < feng && dayOf(jili) === 296 && dayOf(feng) === 298);
check('tenant slug set unchanged',
  JSON.stringify(sq(`SELECT slug FROM tenants ORDER BY slug`).map((r) => r.slug)) ===
    JSON.stringify(['fengyue', 'jiliguala', 'xianyu']));
check('entitlement keyed by guild id',
  scalar(`SELECT tenant FROM guild_entitlements`) === jili);
check('settings tenant remapped, value untouched',
  scalar(`SELECT value FROM settings WHERE tenant = ${jili} AND key = 'discord_guild_id'`) ===
    '123456789012345678');

// Orphan minting: exactly the two class B orphans gained user rows;
// the class A-only Discord ID did not.
check('orphan 777... minted as user', userDiscord(scalar(
  `SELECT id FROM users WHERE discord_id = '777777777777777777'`)) === '777777777777777777');
check('orphan 888... minted as user', scalar(
  `SELECT COUNT(*) FROM users WHERE discord_id = '888888888888888888'`) === 1);
check('class A-only 999... NOT minted', scalar(
  `SELECT COUNT(*) FROM users WHERE discord_id = '999999999999999999'`) === 0);

// Relationship equivalence.
const postMembers = sq(
  `SELECT u.discord_id AS discord_id, m.nick AS nick FROM guild_members m JOIN users u ON u.discord_id = m.discord_id WHERE m.tenant = ${jili} ORDER BY m.discord_id`,
);
check('member<->guild equivalence', JSON.stringify(postMembers) === JSON.stringify(baseMembers),
  JSON.stringify(postMembers));
const e1 = eventIdByTitle('周六双十人本');
const e2 = eventIdByTitle('竞速周榜');
const postSeats = sq(
  `SELECT nickname, discord_id, is_visitor FROM signups WHERE event_id = ${e1} ORDER BY id`,
);
check('signup<->grouping equivalence', JSON.stringify(postSeats) === JSON.stringify(baseSeats));
check('reminder mention list byte-identical',
  JSON.stringify(sq(
    `SELECT discord_id FROM signups WHERE event_id = ${e1} AND discord_id IS NOT NULL ORDER BY id`,
  ).map((r) => `<@${r.discord_id}>`)) === JSON.stringify(baseMentions));
check('every mention is a real Discord ID',
  baseMentions.every((m) => /^<@\d{18}>$/.test(m)));
const gearOwner = scalar(
  `SELECT u.discord_id FROM user_gear_items g JOIN users u ON u.id = g.user_id WHERE g.name = '长剑'`,
);
check('gear<->owner equivalence', gearOwner === '111111111111111111', String(gearOwner));
check('short link still targets the same grouping',
  scalar(`SELECT event_id FROM short_links WHERE code = 'abc1234'`) === e1);
check('alliance pair flipped to numeric low/high',
  scalar(`SELECT guild_low FROM guild_alliances WHERE status = 'active'`) === Math.min(jili, feng) &&
  scalar(`SELECT guild_high FROM guild_alliances WHERE status = 'active'`) === Math.max(jili, feng) &&
  jili < feng);
check('alliance requester tenant resolved',
  scalar(`SELECT requested_by_tenant FROM guild_alliances WHERE status = 'active'`) === jili);
check('contribution recipient (orphan) resolves to a user',
  userDiscord(scalar(`SELECT user_id FROM contribution_entries WHERE action_key = 'leading'`)) ===
    '888888888888888888');
check('contribution dedupe keys rewritten to new ids',
  JSON.stringify(sq(`SELECT dedupe_key FROM contribution_entries ORDER BY dedupe_key`).map((r) => r.dedupe_key)) ===
    JSON.stringify([
      'attendance:' + e1 + ':' + scalar(`SELECT user_id FROM contribution_entries WHERE action_key = 'attendance'`),
      'leading:' + e2 + ':' + scalar(`SELECT user_id FROM contribution_entries WHERE action_key = 'leading'`),
    ].sort()));
check('user-scoped usage counter follows the user map',
  scalar(`SELECT user_id FROM usage_counters WHERE metric = 'ocr_batch'`) ===
    scalar(`SELECT id FROM users WHERE discord_id = '111111111111111111'`));
check('guild-scoped usage counter resolves to the guild id (no fake user minted)',
  scalar(`SELECT user_id FROM usage_counters WHERE metric = 'guild_announcements'`) === jili &&
  sq(`SELECT id FROM users`).length === 8);

// Class A byte-identity.
check('lottery entries discord ids identical',
  JSON.stringify(sq(`SELECT discord_id FROM lottery_entries ORDER BY id`).map((r) => r.discord_id)) ===
    JSON.stringify(baseA.lotteryEntries));
check('lottery winners discord ids identical',
  JSON.stringify(sq(`SELECT discord_id FROM lottery_winners ORDER BY id`).map((r) => r.discord_id)) ===
    JSON.stringify(baseA.lotteryWinners));
check('ops recipient JSON identical',
  scalar(`SELECT recipient_ids FROM ops_nudge_sends`) === baseA.recipients);
check('roster matched discord ids identical',
  JSON.stringify(sq(`SELECT matched_discord_id FROM guild_roster_entries ORDER BY id`).map((r) => r.matched_discord_id)) ===
    JSON.stringify(baseA.rosterMatched));
check('backfill resolved discord id identical',
  scalar(`SELECT resolved_discord_id FROM creator_backfill_log`) === baseA.backfillResolved);
check('user_guild_nicks untouched',
  JSON.stringify(sq(`SELECT * FROM user_guild_nicks`)) === JSON.stringify(baseA.nicks));

// Lenient log tables: known slug mapped, '' and unknown slug -> 0.
check('error_log tenant mapping (mapped / sentinel / lenient-miss)',
  JSON.stringify(sq(`SELECT tenant FROM error_log ORDER BY id`).map((r) => r.tenant)) ===
    JSON.stringify([jili, 0, 0]),
  JSON.stringify(sq(`SELECT tenant FROM error_log ORDER BY id`)));

// Day inheritance for parent-derived tables.
const pollDay = dayOf(scalar(`SELECT id FROM time_polls`));
const optionDays = sq(`SELECT id FROM time_poll_options`).map((r) => dayOf(r.id));
check('poll options inherit the poll day', optionDays.every((d) => d === pollDay) && pollDay === 299);
const batchDay = dayOf(scalar(`SELECT id FROM roster_import_batches`));
const rowDays = sq(`SELECT id FROM roster_import_rows`).map((r) => dayOf(r.id));
check('roster rows inherit the batch day', rowDays.every((d) => d === batchDay) && batchDay === 299);
const fieldDays = sq(`SELECT id FROM grouping_custom_fields ORDER BY id`).map((r) => dayOf(r.id));
check('custom fields inherit owner days (event 297 / template 298 / event 299)',
  JSON.stringify(fieldDays) === JSON.stringify([297, 298, 299]), JSON.stringify(fieldDays));

// Mint counters continue from the backfill maxima.
for (const [table, code] of Object.entries(REGISTRY)) {
  if (table === 'tenants' || table === 'users') continue;
  const groups = sq(
    `SELECT (id / 100000) % 10000 AS day, MAX(id % 100000) AS maxseq FROM ${table} GROUP BY day`,
  );
  for (const g of groups) {
    const counter = scalar(
      `SELECT seq FROM id_mint_counters WHERE type_code = ${code} AND day_index = ${g.day}`,
    );
    check(`mint counter ${table} day ${g.day}`, counter === g.maxseq, `counter=${counter} max=${g.maxseq}`);
  }
}

// A non-renumbered AUTOINCREMENT table still sequences sanely.
sq(`INSERT INTO lottery_entries (lottery_id, discord_id, display_name, weight) VALUES (${scalar('SELECT id FROM lotteries')}, '424242424242424242', 'probe', 1)`);
const probeId = scalar(`SELECT MAX(id) FROM lottery_entries`);
check('lottery_entries autoincrement continues', probeId === baseCounts.lottery_entries + 1,
  `probe=${probeId}`);

console.log(failures === 0 ? '\nREHEARSAL PASS' : `\nREHEARSAL FAIL (${failures})`);
if (!keep) rmSync(work, { recursive: true, force: true });
else console.log(`kept: ${work}`);
process.exit(failures === 0 ? 0 : 1);
