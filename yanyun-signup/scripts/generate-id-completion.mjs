// Generator for migration 0037 (typed public IDs — completion).
//
// Why this file exists: migration 0036 (the typed-ID renumber) was
// applied to production on 2026-10-28 and died halfway, at the
// short_links rebuild: a share alias whose car had been disbanded
// remapped its event_id to NULL and hit the NOT NULL constraint
// (deleteEventCascade removes signups/results/the event but not the
// alias). Production is therefore in a half-migrated state: the
// first 31 rebuilds of 0036 (tenants, users, events, …,
// guild_audit_events), the _idmig_* maps, the seeded mint counters
// and the orphan-user inserts are all live; short_links and every
// table after it are still in the old shape; 0036 is NOT recorded
// in the migration ledger. The corrected 0036 (see
// generate-id-migration.mjs) cannot simply be re-run there: its
// rebuild SELECTs read pre-rename column names (creator_discord_id
// and friends) that the already-applied prefix replaced, so it
// aborts on a half-migrated database. This completion migration is
// the forward path for production, and it is written to be
// STATE-TOLERANT so the same file is also a no-op on a database
// that ran the corrected 0036 end to end (fresh chains, CI):
//
//   * Every tail table is first copied positionally
//     (INSERT INTO t__new SELECT * FROM t). Old and new shapes have
//     identical column counts and order (0036 renames in place), so
//     the copy never names a column whose name depends on the
//     table's current state.
//   * All transforms then run as UPDATE/DELETE on the staged copy,
//     written against the NEW column names and against VALUES that
//     may be in old form (slug / Discord ID / old integer ID) or
//     new form (typed ID). Lookups go through working maps that
//     carry the natural keys (slug, Discord ID — surviving 0036
//     entries, re-augmented from the live tenants/users rows);
//     a value that is already final resolves to itself through an
//     existence fallback against the target table (the maps
//     cannot also carry identity keys: new_id is UNIQUE there,
//     so one id admits exactly one key).
//   * Class-B orphan collection is re-run over the staged copies
//     (new column names, old-form values are the TEXT ones), and
//     missing users are minted with typed IDs off id_mint_counters,
//     mirroring 0036's orphan protocol. On a fully migrated
//     database the collection finds only integer values and mints
//     nobody.
//   * Per-column dispositions for references that cannot resolve
//     are declared once, in TAIL below, each with its reason. The
//     general rule mirrors 0036: preserve the row; drop only rows
//     whose entire meaning was a reference whose target is gone
//     (dead share aliases, cascade-declared children), and land
//     attribution-style references on the 0 sentinel (the schema's
//     own "no target" value) rather than aborting the recovery.
//
// Preconditions (production): 0036's maps and counters are present
// and its prefix rebuilds are in final shape. On a fresh chain the
// corrected 0036 runs first and establishes the same end state, so
// every statement below degrades to an identity transform.
//
// Usage:
//   sqlite3 /tmp/chain.sqlite < migrations/*.sql   (chain pre-0036)
//   node scripts/generate-id-completion.mjs /tmp/chain.sqlite \
//     > migrations/0037_typed_id_completion.sql
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const chainDb = process.argv[2];
if (!chainDb) {
  console.error('usage: generate-id-completion.mjs <chain.sqlite>');
  process.exit(1);
}
const here = dirname(fileURLToPath(import.meta.url));
const sql = (q) =>
  execFileSync('sqlite3', ['-noheader', '-list', chainDb, q], {
    encoding: 'utf8',
  }).trim();

const mig36 = readFileSync(
  join(here, '..', 'migrations', '0036_typed_public_ids.sql'),
  'utf8',
);

/* ------------------------- tail configuration ------------------------ */
// The tables 0036 rebuilds AFTER short_links (its own rebuild
// order), plus short_links itself. Action vocabulary:
//   T:drop   tenant in (or keying) guild-scoped state: drop the row
//            when the guild is gone (deleteTenantCascade leaves
//            these behind; a dead guild's settings/avatar/grants
//            are unreachable). '' / 0 keep their sentinel meaning.
//   T:attr   tenant is a plain attribute on a history/content row:
//            unresolvable lands on 0 (0036's lenient-log stance),
//            the row is preserved.
//   U:plain  Discord ID -> user ID; orphans are minted in phase C,
//            so a miss can only be an unresolvable value: land on
//            the 0 invalid-ID sentinel, keep the row.
//   U:drop   the user reference is part of the row's key: drop on a
//            miss (a token/grant/availability row for nobody).
//   E:drop:<t>   entity FK: drop the row when the target is gone
//            (dead aliases; children whose FK declares CASCADE).
//   E:zero:<t>   entity FK with a schema-sanctioned 0 ("no target"
//            per ZERO_MEANS_NONE in the 0036 inventory, or a log
//            row whose target vanished): land on 0, keep the row.
//   E:null:<t>   nullable entity FK: a miss stays NULL.
//   S        usage_counters scope key (user or 'guild:<slug>').
//   DEDUPE   contribution dedupe_key (per-segment resolution; a
//            segment that cannot resolve keeps its original text,
//            so an already-final key rewrites to itself and a dead
//            target's key stays inert rather than corrupting).
const TAIL = {
  short_links: { tenant: 'T:drop', event_id: 'E:drop:events' },
  lottery_entries: { lottery_id: 'E:drop:lotteries' },
  lottery_winners: { lottery_id: 'E:drop:lotteries' },
  member_availability: { tenant: 'T:drop', discord_id: 'U:drop' },
  time_poll_votes: {
    poll_id: 'E:drop:time_polls',
    option_id: 'E:drop:time_poll_options',
    discord_id: 'U:plain',
  },
  signup_answers: {
    event_id: 'E:drop:events',
    field_id: 'E:zero:grouping_custom_fields',
  },
  event_reminders: { event_id: 'E:drop:events' },
  settings: { tenant: 'T:drop' },
  guild_announcement_reads: {
    announcement_id: 'E:drop:guild_announcements',
    tenant: 'T:attr',
    discord_id: 'U:plain',
  },
  guild_announcement_translations: {
    announcement_id: 'E:drop:guild_announcements',
    tenant: 'T:attr',
  },
  season_checklist_checks: { tenant: 'T:drop', checked_by: 'U:plain' },
  guild_mentors: { tenant: 'T:drop', discord_id: 'U:drop' },
  guild_avatars: { tenant: 'T:drop' },
  season_rollovers: { tenant: 'T:attr', created_by: 'U:plain' },
  contribution_rules: { tenant: 'T:attr', updated_by: 'U:plain' },
  contribution_entries: {
    tenant: 'T:attr',
    discord_id: 'U:plain',
    event_id: 'E:null:events',
    dedupe_key: 'DEDUPE',
  },
  build_share_links: {
    build_id: 'E:drop:user_gear_builds',
    discord_id: 'U:plain',
  },
  heirloom_item_pushes: { tenant: 'T:drop', discord_id: 'U:drop' },
  heirloom_set_state: { tenant: 'T:drop', discord_id: 'U:drop' },
  push_tokens: { discord_id: 'U:drop' },
  usage_counters: { discord_id: 'S' },
  guild_entitlements: { tenant: 'T:drop' },
  guild_members: { tenant: 'T:drop' },
  error_log: { tenant: 'T:attr' },
  hub_audit_log: { tenant: 'T:attr' },
  creator_backfill_log: { event_id: 'E:zero:events', tenant: 'T:attr' },
  user_oauth: { discord_id: 'U:drop' },
  guild_custom_domains: { tenant: 'T:drop', created_by: 'U:plain' },
  guild_officer_grants: { tenant: 'T:drop', discord_id: 'U:drop' },
};
const TAIL_ORDER = Object.keys(TAIL);

// Column renames (old -> new) inside the tail, from the 0036
// inventory's U:/S: actions. Everything else keeps its name.
const RENAMES = {
  member_availability: { discord_id: 'user_id' },
  time_poll_votes: { discord_id: 'user_id' },
  guild_announcement_reads: { discord_id: 'user_id' },
  season_checklist_checks: { checked_by: 'checked_by_user_id' },
  guild_mentors: { discord_id: 'user_id' },
  season_rollovers: { created_by: 'created_by_user_id' },
  contribution_rules: { updated_by: 'updated_by_user_id' },
  contribution_entries: { discord_id: 'user_id' },
  build_share_links: { discord_id: 'user_id' },
  heirloom_item_pushes: { discord_id: 'user_id' },
  heirloom_set_state: { discord_id: 'user_id' },
  push_tokens: { discord_id: 'user_id' },
  usage_counters: { discord_id: 'user_id' },
  guild_members: {},
  user_oauth: { discord_id: 'user_id' },
  guild_custom_domains: { created_by: 'created_by_user_id' },
  guild_officer_grants: { discord_id: 'user_id' },
};

// Every map 0036 builds (its drops at the end never ran on
// production; on a fresh chain they did — recreated identically).
const ENTITY_MAPS = [
  'events', 'grouping_templates', 'signups', 'results',
  'grouping_custom_fields', 'guild_announcements', 'user_gear_items',
  'user_gear_builds', 'guild_applications', 'mentor_pairings',
  'guild_roster_entries', 'roster_import_batches', 'roster_import_rows',
  'guild_member_notes', 'member_season_goals', 'guild_alliances',
  'fill_offers', 'fill_requests', 'fill_invites', 'lotteries',
  'time_polls', 'time_poll_options', 'feedback', 'ops_nudge_sends',
  'rotation_advice_records', 'grouping_recaps', 'guild_gear_standards',
  'guild_officer_posts', 'guild_audit_events',
];

/* -------------------- extraction from migration 0036 ------------------ */
// Split 0036 into statements (its SQL contains no semicolons inside
// string literals) and index its per-table blocks.
const stmts36 = mig36
  .split(/;\s*\n/)
  .map((s) => s.trim())
  .filter(Boolean);
const ddl36 = new Map(); // table -> CREATE TABLE t__new statement
const cols36 = new Map(); // table -> [new column names in order]
const idx36 = new Map(); // table -> [index statements]
for (const st of stmts36) {
  let m = st.match(/^CREATE TABLE (\w+)__new \(/);
  if (m) {
    ddl36.set(m[1], st);
    continue;
  }
  m = st.match(/^INSERT INTO (\w+)__new \(([^)]+)\)/);
  if (m) {
    cols36.set(m[1], m[2].split(',').map((s) => s.trim()));
    continue;
  }
  m = st.match(/^CREATE (?:UNIQUE )?INDEX \w+ ON (\w+)\s*\(/);
  if (m) {
    if (!idx36.has(m[1])) idx36.set(m[1], []);
    idx36.get(m[1]).push(st);
  }
}

const fail = (msg) => {
  console.error(`generate-id-completion: ${msg}`);
  process.exit(1);
};

// Type code per typed table, parsed from 0036's counter-seeding
// statements (guild -> tenants, user -> users, map_<t> -> <t>).
const TYPE_CODES = new Map();
for (const st of stmts36) {
  const m = st.match(/^INSERT INTO id_mint_counters SELECT (\d+), .* FROM _idmig_(?:map_)?(\w+) GROUP BY/);
  if (!m) continue;
  const table = m[2] === 'guild' ? 'tenants' : m[2] === 'user' ? 'users' : m[2];
  TYPE_CODES.set(table, Number(m[1]));
}

// Old-shape columns per tail table, from the chain schema.
const oldCols = new Map();
const oldTypes = new Map();
for (const t of TAIL_ORDER) {
  const rows = sql(`SELECT name FROM pragma_table_info('${t}')`);
  if (!rows) fail(`table ${t} missing from chain schema`);
  oldCols.set(t, rows.split('\n').filter(Boolean));
  const types = sql(`SELECT name || ':' || type FROM pragma_table_info('${t}')`);
  oldTypes.set(t, new Map(types.split('\n').filter(Boolean).map((r) => {
    const i = r.indexOf(':');
    return [r.slice(0, i), r.slice(i + 1)];
  })));
  if (!ddl36.has(t)) fail(`no __new DDL for ${t} in 0036`);
  if (!cols36.has(t)) fail(`no INSERT column list for ${t} in 0036`);
  const olds = oldCols.get(t);
  const news = cols36.get(t);
  if (olds.length !== news.length) {
    fail(`${t}: column count differs old=${olds.length} new=${news.length}`);
  }
  olds.forEach((oc, i) => {
    const want = (RENAMES[t] && RENAMES[t][oc]) || oc;
    if (news[i] !== want) {
      fail(`${t}: positional pairing mismatch at ${i}: old ${oc} -> ${news[i]}, want ${want}`);
    }
  });
}

/* --------------------------- value dialect ---------------------------- */
/* Guild and user resolution is dual-form like entity resolution:
 * the map carries the natural keys (slug / Discord ID, including
 * entries for rows created after 0036's prefix ran), and an already
 * typed value resolves to itself via the existence fallback. The
 * maps cannot carry identity keys alongside the natural ones:
 * new_id is UNIQUE in 0036's map DDL, so one id admits one key. */
const guildLookup = (c) =>
  `COALESCE((SELECT new_id FROM _idmig_guild WHERE old_key = CAST(${c} AS TEXT)), CASE WHEN EXISTS (SELECT 1 FROM tenants WHERE id = ${c}) THEN ${c} END)`;
const userLookup = (c) =>
  `COALESCE((SELECT new_id FROM _idmig_user WHERE old_key = CAST(${c} AS TEXT)), CASE WHEN EXISTS (SELECT 1 FROM users WHERE id = ${c}) THEN ${c} END)`;
const eResolve = (target, c) => {
  const map = `_idmig_map_${target}`;
  return `COALESCE((SELECT new_id FROM ${map} WHERE old_key = CAST(${c} AS TEXT)), CASE WHEN EXISTS (SELECT 1 FROM ${target} WHERE id = ${c}) THEN ${c} END)`;
};
const isSentinel = (c) => `(${c} = '' OR ${c} = 0)`;

/** SET expression for one transformed column (new column name c). */
function setExpr(action, c) {
  if (action === 'T:drop' || action === 'T:attr') {
    if (action === 'T:drop') {
      return `CASE WHEN ${c} IS NULL THEN NULL WHEN ${isSentinel(c)} THEN 0 ELSE ${guildLookup(c)} END`;
    }
    return `CASE WHEN ${c} IS NULL THEN 0 WHEN ${isSentinel(c)} THEN 0 ELSE COALESCE(${guildLookup(c)}, 0) END`;
  }
  if (action === 'U:plain') {
    return `CASE WHEN ${c} IS NULL THEN NULL WHEN ${isSentinel(c)} THEN 0 ELSE COALESCE(${userLookup(c)}, 0) END`;
  }
  if (action === 'U:drop') {
    return `CASE WHEN ${c} IS NULL THEN NULL WHEN ${isSentinel(c)} THEN 0 ELSE ${userLookup(c)} END`;
  }
  if (action.startsWith('E:drop:')) return eResolve(action.slice(7), c);
  if (action.startsWith('E:zero:')) {
    return `CASE WHEN ${c} = 0 THEN 0 ELSE COALESCE(${eResolve(action.slice(7), c)}, 0) END`;
  }
  if (action.startsWith('E:null:')) return eResolve(action.slice(7), c);
  if (action === 'S') {
    return `CASE WHEN ${c} IS NULL THEN NULL WHEN ${c} = '' THEN 0 WHEN typeof(${c}) = 'integer' THEN COALESCE(${userLookup(c)}, ${guildLookup(c)}, ${c}) WHEN ${c} LIKE 'guild:%' THEN (SELECT new_id FROM _idmig_guild WHERE old_key = substr(${c}, 7)) ELSE COALESCE(${userLookup(c)}, 0) END`;
  }
  if (action === 'DEDUPE') {
    const shape = (prefix, restStart, map, target) => {
      const seg = `substr(dedupe_key, ${restStart}, instr(substr(dedupe_key, ${restStart}), ':') - 1)`;
      const who = `substr(dedupe_key, ${restStart} + instr(substr(dedupe_key, ${restStart}), ':'))`;
      const ev = `COALESCE((SELECT new_id FROM ${map} WHERE old_key = ${seg}), CASE WHEN EXISTS (SELECT 1 FROM ${target} WHERE id = CAST(${seg} AS INTEGER)) THEN CAST(${seg} AS INTEGER) END, ${seg})`;
      const usr = `COALESCE((SELECT new_id FROM _idmig_user WHERE old_key = ${who}), ${who})`;
      return `'${prefix}' || ${ev} || ':' || ${usr}`;
    };
    return `CASE WHEN dedupe_key LIKE 'leading:%' THEN ${shape('leading:', 9, '_idmig_map_events', 'events')} WHEN dedupe_key LIKE 'attendance:%' THEN ${shape('attendance:', 12, '_idmig_map_events', 'events')} WHEN dedupe_key LIKE 'mentoring:pairing:%' THEN ${shape('mentoring:pairing:', 18, '_idmig_map_mentor_pairings', 'mentor_pairings')} ELSE dedupe_key END`;
  }
  fail(`unknown action ${action}`);
}

/** DELETE predicate (row is removed) for one drop-class column. */
function dropPredicate(action, c) {
  if (action === 'T:drop') {
    return `(${c} IS NULL OR (NOT ${isSentinel(c)} AND ${guildLookup(c)} IS NULL))`;
  }
  if (action === 'U:drop') {
    return `(${c} IS NOT NULL AND NOT ${isSentinel(c)} AND ${userLookup(c)} IS NULL)`;
  }
  if (action.startsWith('E:drop:')) {
    return `(${eResolve(action.slice(7), c)} IS NULL)`;
  }
  return null;
}

/* -------------------------------- emission ---------------------------- */
const out = [];
const emit = (s) => out.push(s);

emit(`-- Migration 0037: typed public IDs — completion of 0036.
-- GENERATED by scripts/generate-id-completion.mjs. Do not edit by
-- hand; regenerate. Rehearsed by scripts/rehearse-id-completion.mjs.
--
-- Context: on production, migration 0036 applied its first 31
-- rebuilds and then aborted at short_links (a disbanded car's share
-- alias remapped to NULL against the NOT NULL constraint). The
-- tables this file rebuilds are exactly the ones 0036 did not
-- reach, in 0036's own order, to 0036's own target shapes (the
-- __new DDL and index statements below are 0036's verbatim).
--
-- The file is state-tolerant by construction (see the generator):
-- positional staging copies, dual-form value resolution through
-- working maps that carry natural keys plus existence fallbacks, a re-run of
-- the class-B orphan protocol over the staged copies, and declared
-- per-column dispositions for unresolvable references. It completes
-- a half-migrated production database, converges after its own
-- partial application, and is an identity transform on a database
-- that already ran the corrected 0036 end to end.
--
-- Preconditions: 0036's prefix (tenants/users/entity rebuilds,
-- _idmig_* maps, seeded id_mint_counters) is in place — on
-- production from the partial application, on fresh chains from
-- the corrected 0036, which therefore MUST stay strict: this file
-- assumes every pre-short_links reference already resolved once.`);

/* Phase A: working maps — recreate if absent, augment the guild
 * and user maps with the natural-key entries of the CURRENT root
 * tables (rows created after 0036's prefix are not in the
 * surviving maps). Already-typed values never enter the maps
 * (new_id is UNIQUE — one key per id); they resolve through the
 * existence fallback in the lookup expressions instead. On
 * production the surviving 0036 maps make the CREATEs no-ops and
 * the original old->new entries persist untouched. */
emit(`
-- Phase A: working maps (0036 survivors + natural-key augmentation).`);
emit(`CREATE TABLE IF NOT EXISTS _idmig_guild (old_key TEXT PRIMARY KEY, new_id INTEGER NOT NULL UNIQUE);`);
emit(`INSERT OR IGNORE INTO _idmig_guild SELECT slug, id FROM tenants;`);
emit(`CREATE TABLE IF NOT EXISTS _idmig_user (old_key TEXT PRIMARY KEY, new_id INTEGER NOT NULL UNIQUE);`);
emit(`INSERT OR IGNORE INTO _idmig_user SELECT discord_id, id FROM users;`);
for (const t of ENTITY_MAPS) {
  emit(`CREATE TABLE IF NOT EXISTS _idmig_map_${t} (old_key TEXT PRIMARY KEY, new_id INTEGER NOT NULL UNIQUE);`);
}

/* Phase B: positional staging copies of every tail table.
 * Exception: a column that is a single-column INTEGER PRIMARY KEY
 * in the new shape (a rowid alias) cannot receive a raw TEXT value
 * — guild_avatars / guild_entitlements / guild_custom_domains key
 * on tenant TEXT in the old shape, user_oauth on discord_id. Those
 * tables stage into a loose __stage table (new column names, key
 * column widened to TEXT, no constraints) instead of directly
 * into __new; Phase E materializes __new from the stage after the
 * transforms have made the key values integers. */
const rowidTextCols = (t) => {
  const ddl = ddl36.get(t);
  const out = [];
  for (const line of ddl.split('\n')) {
    const m = line.match(/^\s*(\w+) INTEGER PRIMARY KEY/);
    if (!m) continue;
    const idx = cols36.get(t).indexOf(m[1]);
    if (idx < 0) fail(`${t}: rowid column ${m[1]} not in new column list`);
    const oldName = oldCols.get(t)[idx];
    const oldType = oldTypes.get(t).get(oldName) || '';
    if (!/TEXT/i.test(oldType)) continue;
    /* The copy is positional, so a renamed key column is fine
     * (user_oauth: discord_id TEXT PRIMARY KEY -> user_id INTEGER
     * PRIMARY KEY); the column's declared action supplies the
     * transform and the drop predicate. */
    const action = Object.entries(TAIL[t]).find(([oc]) => oc === oldName)?.[1];
    if (!action) fail(`${t}: rowid TEXT column ${oldName} carries no action`);
    out.push({ name: oldName, newName: m[1], action });
  }
  return out;
};
const specialsByTable = new Map(TAIL_ORDER.map((t) => [t, rowidTextCols(t)]));
const stageName = (t) => (specialsByTable.get(t).length ? `${t}__stage` : `${t}__new`);
/* Loose staging DDL for a special table: 0036's column names and
 * types, the rowid key column widened to TEXT, no constraints.
 * Transforms run here; Phase E copies the result positionally
 * into 0036's exact __new DDL, where constraint violations fail
 * loudly as they should. */
const stageDdl = (t) => {
  const specials = specialsByTable.get(t);
  const ddlLines = ddl36.get(t).split('\n');
  const cols = cols36.get(t).map((nc) => {
    const line = ddlLines.find((l) => new RegExp(`^\\s*${nc}\\s+\\w+`).test(l));
    if (!line) fail(`${t}: cannot parse column type for ${nc} from 0036 DDL`);
    const type = line.trim().split(/\s+/)[1].replace(/,$/, '');
    return `${nc} ${specials.some((s) => s.newName === nc) ? 'TEXT' : type}`;
  });
  return `CREATE TABLE ${t}__stage (${cols.join(', ')})`;
};
emit(`
-- Phase B: positional staging copies (old values, new column names).`);
for (const t of TAIL_ORDER) {
  const specials = specialsByTable.get(t);
  if (!specials.length) {
    emit(`DROP TABLE IF EXISTS ${t}__new;`);
    emit(`${ddl36.get(t)};`);
    emit(`INSERT INTO ${t}__new (${cols36.get(t).join(', ')}) SELECT * FROM ${t};`);
    continue;
  }
  emit(`DROP TABLE IF EXISTS ${t}__stage;`);
  emit(`${stageDdl(t)};`);
  emit(`INSERT INTO ${t}__stage (${cols36.get(t).join(', ')}) SELECT * FROM ${t};`);
}

/* Phase C: class-B orphan protocol over the staged copies. Old-form
 * values are the TEXT ones; integer values are already final and
 * are not identities. Dedupe-key user segments and the platform-
 * admin roster (in the staged settings copy, whose global row
 * still carries its '' tenant at this point) are sources too. */
emit(`
-- Phase C: orphan users re-collected from the staged copies and
-- minted with typed IDs off the mint counters (0036's protocol).`);
emit(`DROP TABLE IF EXISTS _c37_orphans;`);
emit(`CREATE TABLE _c37_orphans (discord_id TEXT PRIMARY KEY);`);
for (const t of TAIL_ORDER) {
  for (const [oldCol, action] of Object.entries(TAIL[t])) {
    if (!action.startsWith('U:') && action !== 'S') continue;
    const nc = (RENAMES[t] && RENAMES[t][oldCol]) || oldCol;
    emit(`INSERT OR IGNORE INTO _c37_orphans SELECT CAST(${nc} AS TEXT) FROM ${stageName(t)} WHERE typeof(${nc}) = 'text' AND ${nc} <> '' AND ${nc} NOT GLOB '*[^0-9]*';`);
  }
}
emit(`INSERT OR IGNORE INTO _c37_orphans SELECT substr(dedupe_key, 9 + instr(substr(dedupe_key, 9), ':')) FROM ${stageName('contribution_entries')} WHERE dedupe_key LIKE 'leading:%' AND substr(dedupe_key, 9 + instr(substr(dedupe_key, 9), ':')) NOT GLOB '*[^0-9]*';
INSERT OR IGNORE INTO _c37_orphans SELECT substr(dedupe_key, 12 + instr(substr(dedupe_key, 12), ':')) FROM ${stageName('contribution_entries')} WHERE dedupe_key LIKE 'attendance:%' AND substr(dedupe_key, 12 + instr(substr(dedupe_key, 12), ':')) NOT GLOB '*[^0-9]*';
INSERT OR IGNORE INTO _c37_orphans SELECT substr(dedupe_key, 18 + instr(substr(dedupe_key, 18), ':')) FROM ${stageName('contribution_entries')} WHERE dedupe_key LIKE 'mentoring:pairing:%' AND substr(dedupe_key, 18 + instr(substr(dedupe_key, 18), ':')) NOT GLOB '*[^0-9]*';
INSERT OR IGNORE INTO _c37_orphans SELECT je.value FROM ${stageName('settings')} s, json_each(s.value) je WHERE (s.tenant = '' OR s.tenant = 0) AND s.key = 'platform_admin_discord_ids' AND json_valid(s.value);
DELETE FROM _c37_orphans WHERE discord_id IN (SELECT discord_id FROM users);
DELETE FROM _c37_orphans WHERE EXISTS (SELECT 1 FROM users WHERE CAST(users.id AS TEXT) = _c37_orphans.discord_id);
INSERT OR IGNORE INTO id_mint_counters VALUES (2, CAST(strftime('%s', 'now') AS INTEGER) / 86400 - 20454, 0);`);
/* Counter reseed: rows the old code inserted into already-rebuilt
 * tables during the incident window carry rowid-assigned IDs inside
 * the typed ranges that the counters never saw. Advance every
 * counter to the maximum sequence actually present for its
 * (type, day) before minting, so neither this migration nor the
 * runtime minter can reissue an occupied ID. On a cleanly migrated
 * database every counter already equals its maximum: a no-op. */
emit(`-- Phase C2: advance mint counters past any IDs already present.`);
for (const [table, code] of TYPE_CODES) {
  emit(`UPDATE id_mint_counters SET seq = MAX(seq, COALESCE((SELECT MAX(id % 100000) FROM ${table} WHERE id / 1000000000 = ${code} AND (id / 100000) % 10000 = id_mint_counters.day_index), 0)) WHERE type_code = ${code};`);
}
emit(`INSERT INTO users (id, discord_id, username, avatar, guilds_json, guilds_checked_at, created_at, updated_at, locale_pref, deletion_requested_at, fresh_auth_at)
SELECT 2000000000 + (CAST(strftime('%s', 'now') AS INTEGER) / 86400 - 20454) * 100000 + (SELECT seq FROM id_mint_counters WHERE type_code = 2 AND day_index = CAST(strftime('%s', 'now') AS INTEGER) / 86400 - 20454) + ROW_NUMBER() OVER (ORDER BY discord_id), discord_id, '', '', '[]', 0, strftime('%s','now'), strftime('%s','now'), NULL, NULL, NULL FROM _c37_orphans;
UPDATE id_mint_counters SET seq = seq + (SELECT COUNT(*) FROM _c37_orphans) WHERE type_code = 2 AND day_index = CAST(strftime('%s', 'now') AS INTEGER) / 86400 - 20454;
INSERT OR IGNORE INTO _idmig_user SELECT discord_id, id FROM users;`);

/* Phase D: per-table DELETE (drop dispositions, evaluated on the
 * staged raw values) + UPDATE (value transforms). SQLite evaluates
 * every SET expression against the pre-update row, so multi-column
 * transforms do not observe each other's results. */
emit(`
-- Phase D: drop unresolvable rows, then transform values in place.`);
for (const t of TAIL_ORDER) {
  const news = cols36.get(t);
  const drops = [];
  const sets = [];
  for (const [oldCol, action] of Object.entries(TAIL[t])) {
    const nc = (RENAMES[t] && RENAMES[t][oldCol]) || oldCol;
    if (!news.includes(nc)) fail(`${t}: action column ${nc} not in new shape`);
    const pred = dropPredicate(action, nc);
    if (pred) drops.push(pred);
    sets.push(`${nc} = ${setExpr(action, nc)}`);
  }
  if (drops.length) {
    emit(`DELETE FROM ${stageName(t)} WHERE ${drops.join(' OR ')};`);
  }
  if (sets.length) {
    emit(`UPDATE ${stageName(t)} SET ${sets.join(', ')};`);
  }
}

/* Phase E: swaps + indexes (0036's statements verbatim). Special
 * tables first materialize their exact __new table from the loose
 * stage. */
emit(`
-- Phase E: swap the staged tables into place.`);
for (const t of TAIL_ORDER) {
  if (specialsByTable.get(t).length) {
    emit(`DROP TABLE IF EXISTS ${t}__new;`);
    emit(`${ddl36.get(t)};`);
    emit(`INSERT INTO ${t}__new (${cols36.get(t).join(', ')}) SELECT * FROM ${t}__stage;`);
    emit(`DROP TABLE ${t}__stage;`);
  }
  emit(`DROP TABLE ${t};`);
  emit(`ALTER TABLE ${t}__new RENAME TO ${t};`);
  for (const ix of idx36.get(t) || []) emit(`${ix};`);
}

/* Phase F: the platform-admin roster rewrite — 0036's statement
 * with the raw map select widened to the dual-form user lookup, so
 * roster entries already carrying typed IDs (a fully migrated
 * database, or a re-run) rewrite to themselves instead of NULL. */
emit(`
-- Phase F: platform-admin roster rewrite (dual-form, as in 0036).
UPDATE settings SET value = (
  SELECT json_group_array(CAST(${userLookup('je.value')} AS TEXT))
  FROM json_each(settings.value) je
) WHERE tenant = 0 AND key = 'platform_admin_discord_ids' AND json_valid(value);`);

/* Phase G: drop the working tables. */
emit(`
-- Phase G: drop working tables.`);
emit(`DROP TABLE IF EXISTS _c37_orphans;`);
emit(`DROP TABLE IF EXISTS _idmig_guard;`);
emit(`DROP TABLE IF EXISTS _idmig_orphans;`);
emit(`DROP TABLE IF EXISTS _idmig_guild;`);
emit(`DROP TABLE IF EXISTS _idmig_user;`);
for (const t of ENTITY_MAPS) {
  emit(`DROP TABLE IF EXISTS _idmig_map_${t};`);
}

process.stdout.write(out.join('\n') + '\n');
