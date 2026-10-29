// Generator for migration 0036 (typed public IDs, docs/ID_SYSTEM.md).
//
// The migration renumbers every registered entity to an 11-digit
// typed primary key and remaps every reference column. Hand-writing
// ~60 table rebuilds would be unauditable, so the SQL is generated
// from (a) the real chain-built schema (sqlite_master of a database
// with migrations 0001-0032 applied) and (b) the declarative table
// configuration below, which IS the migration inventory: every
// column's action is stated exactly once, here.
//
// Usage:
//   sqlite3 /tmp/chain.sqlite < migrations/*.sql   (build the chain DB)
//   node scripts/generate-id-migration.mjs /tmp/chain.sqlite \
//     > migrations/0036_typed_public_ids.sql
//
// Column actions:
//   T            tenant slug -> guild ID via the guild map ('' -> 0,
//                the no-guild sentinel; strict: an unmapped slug
//                aborts the migration via a NOT NULL violation)
//   Tl           lenient tenant (log tables): unmapped slug -> 0
//   U:<newName>  Discord ID (class B, internal association) -> user
//                ID, column renamed to <newName>
//   DEDUPE       contribution_entries.dedupe_key: the three known
//                key shapes embed an entity ID and a Discord ID
//                (leading:<event>:<discord>, attendance:<event>:
//                <discord>, mentoring:pairing:<pairing>:<discord>);
//                both segments are rewritten through the maps, or a
//                post-migration sync would re-credit stock events
//                under new-format keys and double-count points
//   S:<newName>  scope key (usage_counters): 'guild:<slug>' values
//                resolve through the guild map, everything else
//                through the user map; the typed IDs never collide
//                (01xx guilds vs 02xx users), so one INTEGER column
//                carries both scopes
//   E:<table>    entity foreign key -> the target table's new ID
//   OWNERKIND    grouping_custom_fields.owner_id, resolved through
//                the events or templates map by owner_kind
//   GUILDPAIR    guild_alliances guild_low/guild_high (recomputed
//                numeric low/high from the guild map)
//   AUDITTARGET  guild_audit_events.target_id: a polymorphic TEXT
//                reference keyed by target_type; rows naming a
//                renumbered entity are rewritten through that
//                entity's map, every other row (member Discord IDs,
//                guide school names, guild/season state strings)
//                carries over byte-identical
//   (absent)     carried over verbatim (class A Discord-boundary
//                columns land here: they keep real Discord IDs)
import { execFileSync } from 'node:child_process';

const chainDb = process.argv[2];
if (!chainDb) {
  console.error('usage: generate-id-migration.mjs <chain.sqlite>');
  process.exit(1);
}

const sql = (q) =>
  execFileSync('sqlite3', ['-noheader', '-list', chainDb, q], {
    encoding: 'utf8',
  }).trim();

const EPOCH_DAY_UNIX = 20454; // 2026-01-01 in days since 1970-01-01
const EPOCH_UNIX = 1767225600; // 2026-01-01T00:00:00Z

/* ------------------------- table configuration ------------------------- */

// Renumbered entity tables: type code + creation-day source.
// day: { kind: 'unix'|'datetime'|'textunix', col } |
//      { kind: 'parent', table, fk } (inherit the parent's day)
const RENUMBER = {
  events: { code: 10, day: { kind: 'datetime', col: 'created_at' } },
  grouping_templates: { code: 11, day: { kind: 'unix', col: 'created_at' } },
  signups: { code: 12, day: { kind: 'datetime', col: 'created_at' } },
  results: { code: 13, day: { kind: 'datetime', col: 'created_at' } },
  grouping_custom_fields: {
    code: 14,
    day: { kind: 'parent', table: 'events', fk: 'owner_id', byKind: true },
  },
  guild_announcements: { code: 20, day: { kind: 'unix', col: 'created_at' } },
  user_gear_items: { code: 30, day: { kind: 'unix', col: 'created_at' } },
  user_gear_builds: { code: 31, day: { kind: 'unix', col: 'created_at' } },
  guild_applications: { code: 40, day: { kind: 'unix', col: 'created_at' } },
  mentor_pairings: { code: 41, day: { kind: 'unix', col: 'created_at' } },
  guild_roster_entries: { code: 42, day: { kind: 'unix', col: 'created_at' } },
  roster_import_batches: { code: 43, day: { kind: 'unix', col: 'created_at' } },
  roster_import_rows: {
    code: 44,
    day: { kind: 'parent', table: 'roster_import_batches', fk: 'batch_id' },
  },
  guild_member_notes: { code: 45, day: { kind: 'unix', col: 'created_at' } },
  member_season_goals: { code: 46, day: { kind: 'unix', col: 'created_at' } },
  guild_alliances: { code: 50, day: { kind: 'unix', col: 'created_at' } },
  fill_offers: { code: 51, day: { kind: 'unix', col: 'created_at' } },
  fill_requests: { code: 52, day: { kind: 'unix', col: 'created_at' } },
  fill_invites: { code: 53, day: { kind: 'unix', col: 'created_at' } },
  lotteries: { code: 60, day: { kind: 'unix', col: 'created_at' } },
  time_polls: { code: 61, day: { kind: 'unix', col: 'created_at' } },
  time_poll_options: {
    code: 62,
    day: { kind: 'parent', table: 'time_polls', fk: 'poll_id' },
  },
  feedback: { code: 70, day: { kind: 'unix', col: 'created_at' } },
  ops_nudge_sends: { code: 80, day: { kind: 'unix', col: 'sent_at' } },
  // Premium-wave entities (migrations 0027/0029/0034/0035), coded
  // when this migration was rebased over them (docs/ID_SYSTEM.md).
  rotation_advice_records: { code: 15, day: { kind: 'unix', col: 'created_at' } },
  // (grouping_recaps has no created_at: generated_at is its creation
  // stamp — a row is born by a generation; 0 = never succeeded, which
  // falls back to day 0 like every never-stamped row.)
  grouping_recaps: { code: 16, day: { kind: 'unix', col: 'generated_at' } },
  guild_gear_standards: { code: 32, day: { kind: 'unix', col: 'created_at' } },
  guild_officer_posts: { code: 47, day: { kind: 'unix', col: 'created_at' } },
  guild_audit_events: { code: 48, day: { kind: 'unix', col: 'created_at' } },
};

// Reference-column actions for every table that changes shape.
// (Renumbered tables appear here too when they carry references.)
const ACTIONS = {
  events: { tenant: 'T', creator_discord_id: 'U:creator_user_id' },
  signups: { event_id: 'E:events' },
  results: { event_id: 'E:events' },
  grouping_templates: { tenant: 'T', creator_discord_id: 'U:creator_user_id' },
  grouping_custom_fields: { owner_id: 'OWNERKIND' },
  short_links: { tenant: 'T', event_id: 'E:events' },
  lotteries: {
    tenant: 'T',
    source_event_id: 'E:events',
    created_by: 'U:created_by_user_id',
  },
  lottery_entries: { lottery_id: 'E:lotteries' },
  lottery_winners: { lottery_id: 'E:lotteries' },
  member_availability: { tenant: 'T', discord_id: 'U:user_id' },
  time_polls: { tenant: 'T', created_by: 'U:created_by_user_id' },
  time_poll_options: { poll_id: 'E:time_polls' },
  time_poll_votes: {
    poll_id: 'E:time_polls',
    option_id: 'E:time_poll_options',
    discord_id: 'U:user_id',
  },
  signup_answers: { event_id: 'E:events', field_id: 'E:grouping_custom_fields' },
  event_reminders: { event_id: 'E:events' },
  settings: { tenant: 'T' },
  guild_announcements: { tenant: 'T', author_discord_id: 'U:author_user_id' },
  guild_announcement_reads: {
    announcement_id: 'E:guild_announcements',
    tenant: 'T',
    discord_id: 'U:user_id',
  },
  guild_announcement_translations: {
    announcement_id: 'E:guild_announcements',
    tenant: 'T',
  },
  season_checklist_checks: { tenant: 'T', checked_by: 'U:checked_by_user_id' },
  guild_roster_entries: { tenant: 'T', created_by: 'U:created_by_user_id' },
  roster_import_batches: { tenant: 'T', created_by: 'U:created_by_user_id' },
  roster_import_rows: {
    batch_id: 'E:roster_import_batches',
    tenant: 'T',
    created_entry_id: 'E:guild_roster_entries',
  },
  guild_applications: {
    tenant: 'T',
    discord_id: 'U:user_id',
    reviewed_by: 'U:reviewed_by_user_id',
  },
  mentor_pairings: {
    tenant: 'T',
    mentor_discord_id: 'U:mentor_user_id',
    mentee_discord_id: 'U:mentee_user_id',
    created_by: 'U:created_by_user_id',
  },
  guild_mentors: { tenant: 'T', discord_id: 'U:user_id' },
  guild_member_notes: {
    tenant: 'T',
    member_discord_id: 'U:member_user_id',
    author_discord_id: 'U:author_user_id',
  },
  member_season_goals: { tenant: 'T', discord_id: 'U:user_id' },
  fill_offers: { discord_id: 'U:user_id', home_tenant: 'T' },
  fill_requests: {
    tenant: 'T',
    event_id: 'E:events',
    created_by: 'U:created_by_user_id',
  },
  fill_invites: {
    request_id: 'E:fill_requests',
    offer_id: 'E:fill_offers',
    tenant: 'T',
    event_id: 'E:events',
    from_discord_id: 'U:from_user_id',
    to_discord_id: 'U:to_user_id',
  },
  guild_alliances: {
    guild_low: 'GUILDPAIR',
    guild_high: 'GUILDPAIR',
    requested_by_tenant: 'T',
    ended_by_tenant: 'T',
    requested_by: 'U:requested_by_user_id',
  },
  guild_avatars: { tenant: 'T' },
  ops_nudge_sends: { tenant: 'T', event_id: 'E:events', sent_by: 'U:sent_by_user_id' },
  season_rollovers: { tenant: 'T', created_by: 'U:created_by_user_id' },
  contribution_rules: { tenant: 'T', updated_by: 'U:updated_by_user_id' },
  contribution_entries: { tenant: 'T', discord_id: 'U:user_id', event_id: 'E:events', dedupe_key: 'DEDUPE' },
  user_gear_items: { discord_id: 'U:user_id' },
  user_gear_builds: { discord_id: 'U:user_id' },
  build_share_links: { build_id: 'E:user_gear_builds', discord_id: 'U:user_id' },
  heirloom_item_pushes: { tenant: 'T', discord_id: 'U:user_id' },
  heirloom_set_state: { tenant: 'T', discord_id: 'U:user_id' },
  push_tokens: { discord_id: 'U:user_id' },
  usage_counters: { discord_id: 'S:user_id' },
  feedback: { discord_id: 'U:user_id' },
  guild_entitlements: { tenant: 'T' },
  guild_members: { tenant: 'T' },
  error_log: { tenant: 'Tl' },
  hub_audit_log: { tenant: 'Tl' },
  creator_backfill_log: { tenant: 'Tl', event_id: 'E:events' },
  user_oauth: { discord_id: 'U:user_id' },
  // Premium-wave tables: tenant + reference remaps. The governance
  // actor/granter snapshot columns (guild_audit_events.actor_discord_id,
  // guild_officer_grants.granted_by) are deliberately ABSENT here:
  // absent means carried over verbatim (class A, docs/ID_SYSTEM.md).
  rotation_advice_records: {
    tenant: 'T',
    event_id: 'E:events',
    created_by: 'U:created_by_user_id',
  },
  grouping_recaps: {
    tenant: 'T',
    event_id: 'E:events',
    generated_by: 'U:generated_by_user_id',
  },
  guild_gear_standards: { tenant: 'T', created_by: 'U:created_by_user_id' },
  guild_custom_domains: { tenant: 'T', created_by: 'U:created_by_user_id' },
  guild_officer_grants: { tenant: 'T', discord_id: 'U:user_id' },
  guild_officer_posts: { tenant: 'T', author_discord_id: 'U:author_user_id' },
  guild_audit_events: { tenant: 'T', target_id: 'AUDITTARGET' },
};

// Class-B columns whose stored values can be a non-Discord sentinel
// rather than an identity: the sentinel is excluded from orphan
// collection and lands on the 0 (invalid ID) value instead of
// minting a fake user row. (The omniscient VC's rotation saves are
// stamped 'omni'; there is no user behind them.)
const SENTINEL_VALUES = {
  'rotation_advice_records.created_by': ['omni'],
};

// Entity-FK columns whose 0 value means "no target" (keep 0, do not
// resolve through the map).
const ZERO_MEANS_NONE = new Set([
  'fill_requests.event_id',
  'fill_invites.event_id',
  'signup_answers.field_id',
]);

/* --------------------------- schema reading ---------------------------- */

// DDL text itself contains newlines, so every statement is fetched
// with its own query rather than by splitting a combined dump.
const tableSql = new Map();
for (const name of sql(
  `SELECT name FROM sqlite_master WHERE type='table' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY name`,
).split('\n')) {
  if (!name) continue;
  tableSql.set(name, sql(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${name}'`));
}
const indexSql = new Map(); // table -> [sql]
for (const name of sql(
  `SELECT name FROM sqlite_master WHERE type='index' AND sql IS NOT NULL ORDER BY name`,
).split('\n')) {
  if (!name) continue;
  const isql = sql(`SELECT sql FROM sqlite_master WHERE type='index' AND name='${name}'`);
  const tbl = sql(`SELECT tbl_name FROM sqlite_master WHERE type='index' AND name='${name}'`);
  if (!indexSql.has(tbl)) indexSql.set(tbl, []);
  indexSql.get(tbl).push(isql);
}

/** Split a CREATE TABLE body on top-level commas. */
function splitBody(ddl) {
  const open = ddl.indexOf('(');
  const close = ddl.lastIndexOf(')');
  const body = ddl.slice(open + 1, close);
  const parts = [];
  let depth = 0;
  let inStr = false;
  let cur = '';
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inStr) {
      cur += ch;
      if (ch === "'") {
        if (body[i + 1] === "'") cur += body[++i];
        else inStr = false;
      }
      continue;
    }
    if (ch === "'") inStr = true;
    else if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

const CONSTRAINT_START = /^(PRIMARY|UNIQUE|CHECK|FOREIGN|CONSTRAINT)\b/i;

function firstToken(part) {
  const m = part.match(/^"([^"]+)"|^\[([^\]]+)\]|^`([^`]+)`|^(\S+)/);
  return m ? m[1] || m[2] || m[3] || m[4] : '';
}

/** Parse a table's columns: [{ name, def }] in DDL order + constraints. */
function parseTable(name) {
  const parts = splitBody(tableSql.get(name));
  const columns = [];
  const constraints = [];
  for (const part of parts) {
    if (CONSTRAINT_START.test(part)) constraints.push(part);
    else columns.push({ name: firstToken(part), def: part });
  }
  return { columns, constraints };
}

const renameOf = (table) => {
  const out = {};
  for (const [col, action] of Object.entries(ACTIONS[table] || {})) {
    if (action.startsWith('U:') || action.startsWith('S:')) out[col] = action.slice(2);
  }
  return out;
};

function applyRenames(text, table) {
  let out = text;
  for (const [oldName, newName] of Object.entries(renameOf(table))) {
    out = out.replace(
      new RegExp(`(?<![A-Za-z0-9_])${oldName}(?![A-Za-z0-9_])`, 'g'),
      newName,
    );
  }
  return out;
}

/* --------------------------- day expressions --------------------------- */

function dayExpr({ kind, col }, alias = '') {
  const c = alias ? `${alias}.${col}` : col;
  if (kind === 'unix') {
    return `CASE WHEN ${c} IS NULL OR ${c} = 0 THEN 0 ELSE ${c} / 86400 - ${EPOCH_DAY_UNIX} END`;
  }
  if (kind === 'datetime') {
    return `CASE WHEN ${c} IS NULL OR ${c} = '' THEN 0 ELSE CAST(julianday(${c}) - julianday('2026-01-01') AS INTEGER) END`;
  }
  if (kind === 'textunix') {
    return `CASE WHEN CAST(${c} AS INTEGER) = 0 THEN 0 ELSE CAST(${c} AS INTEGER) / 86400 - ${EPOCH_DAY_UNIX} END`;
  }
  throw new Error(`day kind ${kind}`);
}

function preEpochPredicate({ kind, col }) {
  if (kind === 'unix') return `${col} BETWEEN 1 AND ${EPOCH_UNIX - 1}`;
  if (kind === 'datetime')
    return `${col} >= '1970-01-01' AND ${col} < '2026-01-01'`;
  if (kind === 'textunix') return `CAST(${col} AS INTEGER) BETWEEN 1 AND ${EPOCH_UNIX - 1}`;
  throw new Error(`day kind ${kind}`);
}

/** Day segment of a parent row's already-minted ID. */
const dayOfNewId = (expr) => `((${expr}) / 100000) % 10000`;

/* ------------------------------- emission ------------------------------ */

const out = [];
const emit = (s) => out.push(s);

emit(`-- Migration 0036: typed public IDs (docs/ID_SYSTEM.md).
-- GENERATED by scripts/generate-id-migration.mjs from the chain-built
-- schema plus the declarative inventory in that script. Do not edit by
-- hand; regenerate. Rehearsed end-to-end by
-- scripts/rehearse-id-migration.mjs before this file was accepted.
--
-- Shape of the change: every registered entity's primary key becomes
-- an 11-digit typed ID ([type code 2][day 4][daily sequence 5],
-- epoch 2026-01-01 UTC); tenants gain a numeric guild ID (code 01)
-- with slug demoted to a UNIQUE handle; users gain a numeric user ID
-- (code 02) with discord_id demoted to a UNIQUE identity column.
-- Reference columns remap through the _idmig_* maps built below;
-- class A Discord-boundary columns (signups.discord_id,
-- lottery_entries/winners.discord_id, ops recipient lists, the
-- Discord-synced roster keys) are carried over byte-identical.
-- The _idmig_* tables are dropped at the end; the leading DROPs make
-- the file re-runnable after a failed attempt.`);

const mapTables = [
  '_idmig_guild',
  '_idmig_user',
  ...Object.keys(RENUMBER).map((t) => `_idmig_map_${t}`),
];
for (const m of [...mapTables, '_idmig_guard', '_idmig_orphans']) {
  emit(`DROP TABLE IF EXISTS ${m};`);
}

emit(`
CREATE TABLE id_mint_counters (
  type_code INTEGER NOT NULL,
  day_index INTEGER NOT NULL,
  seq INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (type_code, day_index)
);`);

/* ---- guards: real pre-epoch rows must not exist ---- */
emit(`
-- Guard: fail loudly rather than mint a negative day index. A
-- created_at of 0 means "never stamped" and is handled by the day-0
-- fallback; a real stamp before 2026-01-01 aborts the migration.
CREATE TABLE _idmig_guard (x INTEGER CHECK (x = 1));`);
const guardInsert = (predicate, label) =>
  emit(
    `INSERT INTO _idmig_guard SELECT CASE WHEN EXISTS (${predicate}) THEN 0 ELSE 1 END; -- ${label}`,
  );
guardInsert(
  `SELECT 1 FROM tenants WHERE ${preEpochPredicate({ kind: 'textunix', col: 'created_at' })}`,
  'tenants pre-epoch',
);
guardInsert(
  `SELECT 1 FROM users WHERE ${preEpochPredicate({ kind: 'textunix', col: 'created_at' })}`,
  'users pre-epoch',
);
for (const [table, spec] of Object.entries(RENUMBER)) {
  if (spec.day.kind === 'parent') continue;
  guardInsert(
    `SELECT 1 FROM ${table} WHERE ${preEpochPredicate(spec.day)}`,
    `${table} pre-epoch`,
  );
}

/* ---- orphan users: class B columns may reference Discord users who
 * never registered. They enter the ID system through this migration:
 * a users row is minted for each (registration day = migration day),
 * so every class B reference resolves and nothing is nulled out. ---- */
const orphanSources = [];
for (const [table, actions] of Object.entries(ACTIONS)) {
  for (const [col, action] of Object.entries(actions)) {
    const sentinels = (SENTINEL_VALUES[`${table}.${col}`] || [])
      .map((v) => `AND ${col} <> '${v}'`)
      .join(' ');
    if (action.startsWith('U:')) orphanSources.push([table, col, sentinels]);
    // Scope keys: guild-scoped values are not users; only the plain
    // Discord-ID values can be orphans.
    if (action.startsWith('S:')) orphanSources.push([table, col, `AND ${col} NOT LIKE 'guild:%'`]);
  }
}
emit(`
CREATE TABLE _idmig_orphans (discord_id TEXT PRIMARY KEY);`);
for (const [table, col, extra] of orphanSources) {
  emit(
    `INSERT OR IGNORE INTO _idmig_orphans SELECT ${col} FROM ${table} WHERE ${col} IS NOT NULL AND ${col} <> '' ${extra};`,
  );
}
emit(`
-- Discord IDs that exist ONLY inside contribution dedupe keys are
-- class-B references too: collect them as orphans so their user IDs
-- exist before the keys are rewritten.
INSERT OR IGNORE INTO _idmig_orphans SELECT substr(dedupe_key, 9 + instr(substr(dedupe_key, 9), ':')) FROM contribution_entries WHERE dedupe_key LIKE 'leading:%';
INSERT OR IGNORE INTO _idmig_orphans SELECT substr(dedupe_key, 12 + instr(substr(dedupe_key, 12), ':')) FROM contribution_entries WHERE dedupe_key LIKE 'attendance:%';
INSERT OR IGNORE INTO _idmig_orphans SELECT substr(dedupe_key, 18 + instr(substr(dedupe_key, 18), ':')) FROM contribution_entries WHERE dedupe_key LIKE 'mentoring:pairing:%';`);
emit(`
-- The platform-admin roster is the one settings payload that stores
-- identity keys (a JSON array of Discord IDs in the global scope):
-- its values are class-B references for orphan purposes, so every
-- rostered admin resolves to a user ID when the row is rewritten
-- after the rebuilds (see the settings rewrite below).
INSERT OR IGNORE INTO _idmig_orphans SELECT je.value FROM settings s, json_each(s.value) je WHERE s.tenant = '' AND s.key = 'platform_admin_discord_ids' AND json_valid(s.value);`);
emit(`DELETE FROM _idmig_orphans WHERE discord_id IN (SELECT discord_id FROM users);
INSERT INTO users (discord_id, username, avatar, guilds_json, guilds_checked_at, created_at, updated_at, locale_pref, deletion_requested_at, fresh_auth_at)
SELECT discord_id, '', '', '[]', 0, strftime('%s','now'), strftime('%s','now'), NULL, NULL, NULL FROM _idmig_orphans;`);

/* ---- maps ---- */
function emitGuildMap() {
  const day = dayExpr({ kind: 'textunix', col: 'created_at' });
  emit(`
CREATE TABLE _idmig_guild (old_key TEXT PRIMARY KEY, new_id INTEGER NOT NULL UNIQUE);
INSERT INTO _idmig_guild
SELECT slug, 1 * 1000000000 + day * 100000 + ROW_NUMBER() OVER (PARTITION BY day ORDER BY slug)
FROM (SELECT slug, ${day} AS day FROM tenants);`);
  emit(`
CREATE TABLE _idmig_user (old_key TEXT PRIMARY KEY, new_id INTEGER NOT NULL UNIQUE);
INSERT INTO _idmig_user
SELECT discord_id, 2 * 1000000000 + day * 100000 + ROW_NUMBER() OVER (PARTITION BY day ORDER BY created_at, discord_id)
FROM (SELECT discord_id, created_at, ${dayExpr({ kind: 'textunix', col: 'created_at' })} AS day FROM users);`);
}
emitGuildMap();

// Entity maps, parents before children (custom fields inherit through
// owner_kind, so both possible parents are handled at map time by
// resolving the owner map that exists; options/rows inherit directly).
const mapOrder = [
  'events',
  'grouping_templates',
  'guild_announcements',
  'user_gear_items',
  'user_gear_builds',
  'guild_applications',
  'mentor_pairings',
  'guild_roster_entries',
  'roster_import_batches',
  'guild_member_notes',
  'member_season_goals',
  'guild_alliances',
  'fill_offers',
  'fill_requests',
  'lotteries',
  'time_polls',
  'feedback',
  'ops_nudge_sends',
  'signups',
  'results',
  'fill_invites',
  'roster_import_rows',
  'time_poll_options',
  'rotation_advice_records',
  'grouping_recaps',
  'guild_gear_standards',
  'guild_officer_posts',
  'guild_audit_events',
  'grouping_custom_fields',
];
for (const table of mapOrder) {
  const spec = RENUMBER[table];
  let day;
  if (spec.day.kind === 'parent' && spec.day.byKind) {
    const evDay = dayOfNewId(
      `(SELECT new_id FROM _idmig_map_events WHERE old_key = CAST(owner_id AS TEXT))`,
    );
    const tpDay = dayOfNewId(
      `(SELECT new_id FROM _idmig_map_grouping_templates WHERE old_key = CAST(owner_id AS TEXT))`,
    );
    day = `CASE owner_kind WHEN 'event' THEN COALESCE(${evDay}, 0) WHEN 'template' THEN COALESCE(${tpDay}, 0) ELSE 0 END`;
  } else if (spec.day.kind === 'parent') {
    day = `COALESCE(${dayOfNewId(
      `(SELECT new_id FROM _idmig_map_${spec.day.table} WHERE old_key = CAST(${spec.day.fk} AS TEXT))`,
    )}, 0)`;
  } else {
    day = dayExpr(spec.day);
  }
  emit(`
CREATE TABLE _idmig_map_${table} (old_key TEXT PRIMARY KEY, new_id INTEGER NOT NULL UNIQUE);
INSERT INTO _idmig_map_${table}
SELECT CAST(id AS TEXT), ${spec.code} * 1000000000 + day * 100000 + ROW_NUMBER() OVER (PARTITION BY day ORDER BY id)
FROM (SELECT id, ${day} AS day FROM ${table});`);
}

/* ---- overflow guards: no (type, day) group may exceed 99999 ---- */
for (const m of mapTables) {
  guardInsert(
    `SELECT 1 FROM (SELECT new_id / 100000 AS grp, COUNT(*) AS c FROM ${m} GROUP BY grp) WHERE c > 99999`,
    `${m} daily sequence overflow`,
  );
}

/* ---- seed the mint counters past the backfilled sequences ---- */
emit(`
-- Mint counters continue where the backfill left off, per type/day.`);
for (const [table, spec] of Object.entries(RENUMBER)) {
  emit(
    `INSERT INTO id_mint_counters SELECT ${spec.code}, (new_id / 100000) % 10000, MAX(new_id % 100000) FROM _idmig_map_${table} GROUP BY (new_id / 100000) % 10000;`,
  );
}
emit(`INSERT INTO id_mint_counters SELECT 1, (new_id / 100000) % 10000, MAX(new_id % 100000) FROM _idmig_guild GROUP BY (new_id / 100000) % 10000;
INSERT INTO id_mint_counters SELECT 2, (new_id / 100000) % 10000, MAX(new_id % 100000) FROM _idmig_user GROUP BY (new_id / 100000) % 10000;`);

/* ------------------------------ rebuilds ------------------------------ */

const tenantExpr = (col, lenient = false) => {
  const lookup = `(SELECT new_id FROM _idmig_guild WHERE old_key = o.${col})`;
  if (lenient)
    return `CASE WHEN o.${col} IS NULL OR o.${col} = '' THEN 0 ELSE COALESCE(${lookup}, 0) END`;
  return `CASE WHEN o.${col} IS NULL THEN NULL WHEN o.${col} = '' THEN 0 ELSE ${lookup} END`;
};
const userExpr = (col) => `(SELECT new_id FROM _idmig_user WHERE old_key = o.${col})`;
function exprFor(table, col) {
  const action = (ACTIONS[table] || {})[col];
  if (!action) {
    if (RENUMBER[table] && col === 'id')
      return `(SELECT new_id FROM _idmig_map_${table} WHERE old_key = CAST(o.id AS TEXT))`;
    return `o.${col}`;
  }
  if (action === 'T') return tenantExpr(col);
  if (action === 'Tl') return tenantExpr(col, true);
  if (action.startsWith('U:')) {
    // '' is the text-era "unset" marker on several of these columns
    // (an unreviewed application's reviewed_by, an unset invite
    // sender); in the typed shape unset is 0, the invalid-ID sentinel.
    // Declared non-Discord sentinels (SENTINEL_VALUES) land on 0 too.
    const sentinels = SENTINEL_VALUES[`${table}.${col}`] || [];
    const sentinelCase = sentinels.length
      ? sentinels.map((v) => `WHEN o.${col} = '${v}' THEN 0 `).join('')
      : '';
    return `CASE WHEN o.${col} IS NULL THEN NULL WHEN o.${col} = '' THEN 0 ${sentinelCase}ELSE ${userExpr(col)} END`;
  }
  if (action === 'AUDITTARGET') {
    const m = (t) =>
      `(SELECT new_id FROM _idmig_map_${t} WHERE old_key = o.target_id)`;
    return `CASE o.target_type WHEN 'announcement' THEN COALESCE(${m('guild_announcements')}, o.target_id) WHEN 'application' THEN COALESCE(${m('guild_applications')}, o.target_id) WHEN 'board' THEN COALESCE(${m('guild_officer_posts')}, o.target_id) WHEN 'event' THEN COALESCE(${m('events')}, o.target_id) WHEN 'lottery' THEN COALESCE(${m('lotteries')}, o.target_id) WHEN 'pairing' THEN COALESCE(${m('mentor_pairings')}, o.target_id) WHEN 'result' THEN COALESCE(${m('results')}, o.target_id) WHEN 'signup' THEN COALESCE(${m('signups')}, o.target_id) WHEN 'roster' THEN COALESCE(CASE WHEN o.action = 'roster.import' THEN ${m('roster_import_batches')} ELSE ${m('guild_roster_entries')} END, o.target_id) ELSE o.target_id END`;
  }
  if (action.startsWith('S:')) {
    return `CASE WHEN o.${col} IS NULL THEN NULL WHEN o.${col} = '' THEN 0 WHEN o.${col} LIKE 'guild:%' THEN (SELECT new_id FROM _idmig_guild WHERE old_key = substr(o.${col}, 7)) ELSE ${userExpr(col)} END`;
  }
  if (action === 'DEDUPE') {
    const seg = (restStart, map) =>
      `(SELECT new_id FROM ${map} WHERE old_key = substr(o.dedupe_key, ${restStart}, instr(substr(o.dedupe_key, ${restStart}), ':') - 1))`;
    const who = (restStart) =>
      `(SELECT new_id FROM _idmig_user WHERE old_key = substr(o.dedupe_key, ${restStart} + instr(substr(o.dedupe_key, ${restStart}), ':')))`;
    return `CASE WHEN o.dedupe_key LIKE 'leading:%' THEN 'leading:' || ${seg(9, '_idmig_map_events')} || ':' || ${who(9)} WHEN o.dedupe_key LIKE 'attendance:%' THEN 'attendance:' || ${seg(12, '_idmig_map_events')} || ':' || ${who(12)} WHEN o.dedupe_key LIKE 'mentoring:pairing:%' THEN 'mentoring:pairing:' || ${seg(18, '_idmig_map_mentor_pairings')} || ':' || ${who(18)} ELSE o.dedupe_key END`;
  }
  if (action.startsWith('E:')) {
    const target = action.slice(2);
    const lookup = `(SELECT new_id FROM _idmig_map_${target} WHERE old_key = CAST(o.${col} AS TEXT))`;
    return ZERO_MEANS_NONE.has(`${table}.${col}`)
      ? `CASE WHEN o.${col} = 0 THEN 0 ELSE ${lookup} END`
      : lookup;
  }
  if (action === 'OWNERKIND') {
    return `CASE o.owner_kind WHEN 'event' THEN (SELECT new_id FROM _idmig_map_events WHERE old_key = CAST(o.owner_id AS TEXT)) WHEN 'template' THEN (SELECT new_id FROM _idmig_map_grouping_templates WHERE old_key = CAST(o.owner_id AS TEXT)) ELSE o.owner_id END`;
  }
  if (action === 'GUILDPAIR') {
    const low = `MIN((SELECT new_id FROM _idmig_guild WHERE old_key = o.guild_low), (SELECT new_id FROM _idmig_guild WHERE old_key = o.guild_high))`;
    const high = `MAX((SELECT new_id FROM _idmig_guild WHERE old_key = o.guild_low), (SELECT new_id FROM _idmig_guild WHERE old_key = o.guild_high))`;
    return col === 'guild_low' ? low : high;
  }
  throw new Error(`unknown action ${action}`);
}

/** Build the new CREATE TABLE statement for a rebuilt table. */
function newDdl(table) {
  const { columns, constraints } = parseTable(table);
  const renames = renameOf(table);
  const parts = [];
  for (const { name, def } of columns) {
    let d = def;
    const action = (ACTIONS[table] || {})[name];
    if (RENUMBER[table] && name === 'id') {
      d = d.replace(/AUTOINCREMENT/i, '').trim();
    }
    if (action === 'T' || action === 'Tl' || action === 'GUILDPAIR') {
      d = d.replace(new RegExp(`^(${name})\\s+TEXT`, 'i'), '$1 INTEGER');
    }
    if (action && (action.startsWith('U:') || action.startsWith('S:'))) {
      d = d.replace(
        new RegExp(`^${name}\\s+TEXT`, 'i'),
        `${renames[name]} INTEGER`,
      );
    }
    if (
      action === 'T' ||
      action === 'Tl' ||
      action === 'GUILDPAIR' ||
      (action && (action.startsWith('U:') || action.startsWith('S:')))
    ) {
      // The column's type just became INTEGER; a '' text default
      // would be a lie in the new shape.
      d = d.replace(/DEFAULT ''/, 'DEFAULT 0');
    }
    if (
      action &&
      action.startsWith('E:') &&
      /_id\b/.test(name)
    ) {
      // FK columns are already INTEGER; nothing to change.
    }
    parts.push(d);
  }
  for (const c of constraints) parts.push(applyRenames(c, table));
  return `CREATE TABLE ${table} (\n  ${parts.join(',\n  ')}\n)`;
}

function rebuild(table) {
  const { columns } = parseTable(table);
  const renames = renameOf(table);
  const newCols = columns.map((c) => renames[c.name] || c.name);
  const exprs = columns.map((c) => exprFor(table, c.name));
  emit(`
CREATE TABLE ${table}__new ${newDdl(table).slice(`CREATE TABLE ${table} `.length)};
INSERT INTO ${table}__new (${newCols.join(', ')})
SELECT ${exprs.join(', ')} FROM ${table} o;
DROP TABLE ${table};
ALTER TABLE ${table}__new RENAME TO ${table};`);
  for (const isql of indexSql.get(table) || []) {
    emit(applyRenames(isql, table) + ';');
  }
}

/* Tenants and users get bespoke treatment (primary-key kind change). */
function rebuildTenants() {
  emit(`
CREATE TABLE tenants__new (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  guild_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  announcement TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%s','now')),
  discord_webhook TEXT NOT NULL DEFAULT '',
  slogan TEXT NOT NULL DEFAULT '',
  master_name TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  bg_image_url TEXT NOT NULL DEFAULT '',
  recruit_open INTEGER NOT NULL DEFAULT 0
);
INSERT INTO tenants__new (id, slug, guild_name, password_hash, announcement, created_at, discord_webhook, slogan, master_name, logo_url, bg_image_url, recruit_open)
SELECT (SELECT new_id FROM _idmig_guild WHERE old_key = o.slug), slug, guild_name, password_hash, announcement, created_at, discord_webhook, slogan, master_name, logo_url, bg_image_url, recruit_open FROM tenants o;
DROP TABLE tenants;
ALTER TABLE tenants__new RENAME TO tenants;`);
}
function rebuildUsers() {
  emit(`
CREATE TABLE users__new (
  id INTEGER PRIMARY KEY,
  discord_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  guilds_json TEXT NOT NULL DEFAULT '[]',
  guilds_checked_at INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%s','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%s','now')),
  locale_pref TEXT,
  deletion_requested_at INTEGER,
  fresh_auth_at INTEGER
);
INSERT INTO users__new (id, discord_id, username, avatar, guilds_json, guilds_checked_at, created_at, updated_at, locale_pref, deletion_requested_at, fresh_auth_at)
SELECT (SELECT new_id FROM _idmig_user WHERE old_key = o.discord_id), discord_id, username, avatar, guilds_json, guilds_checked_at, created_at, updated_at, locale_pref, deletion_requested_at, fresh_auth_at FROM users o;
DROP TABLE users;
ALTER TABLE users__new RENAME TO users;`);
}

rebuildTenants();
rebuildUsers();
// Parents before children so FK targets exist in final shape early
// (D1 does not enforce FKs mid-migration, but keep the order honest).
const rebuildOrder = [
  ...Object.keys(RENUMBER),
  ...Object.keys(ACTIONS).filter((t) => !(t in RENUMBER)),
];
const seen = new Set();
for (const table of rebuildOrder) {
  if (seen.has(table)) continue;
  seen.add(table);
  if (!tableSql.has(table)) throw new Error(`unknown table ${table}`);
  rebuild(table);
}

/* The platform-admin roster rewrite: the settings rebuild above
 * carried the value verbatim (settings payloads are opaque), but this
 * one row stores identity keys and the admin gate's subject is the
 * user ID from this migration on — rewrite its JSON array through
 * the user map while the maps still exist. Values stay strings (the
 * gate compares string subjects); an unmapped value would land as
 * JSON null, which the gate's parser drops (fail closed). */
emit(`
UPDATE settings SET value = (
  SELECT json_group_array(CAST((SELECT new_id FROM _idmig_user WHERE old_key = je.value) AS TEXT))
  FROM json_each(settings.value) je
) WHERE tenant = 0 AND key = 'platform_admin_discord_ids' AND json_valid(value);`);

emit(`
DROP TABLE _idmig_guard;
DROP TABLE _idmig_orphans;`);
for (const m of mapTables) emit(`DROP TABLE ${m};`);

process.stdout.write(out.join('\n') + '\n');

