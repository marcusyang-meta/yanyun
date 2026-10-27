-- Baseline migration: the complete production shape as of 2026-10-27.
--
-- This chain replaces the historical schema.sql + migrate-v2..v8 files
-- and the Worker-side lazy-DDL ensure* helpers. It encodes the shape
-- production actually carries (verified column-by-column against the
-- live database during the Route-A takeover: 28 tables, 193 columns,
-- every index and foreign key), which in a few places differs from
-- what the old files claimed -- e.g. events.created_at exists only in
-- production, school_bis.build defaults to 'default' (not ''), the
-- schools primary key is name (slug is a later plain column), and
-- tenants has no master_name/logo_url/bg_image_url columns.
--
-- Rules from here on (see README, "Release process"):
--   * merged migration files are immutable -- a shape change is a
--     NEW migration file, never an edit to this one;
--   * schema changes must stay compatible with the previous release's
--     code (expand/contract): code can auto-roll back, schema cannot.

CREATE TABLE tenants (
  slug TEXT PRIMARY KEY,
  guild_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  announcement TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%s','now')),
  discord_webhook TEXT NOT NULL DEFAULT '',
  slogan TEXT NOT NULL DEFAULT ''
);

CREATE TABLE settings (
  tenant TEXT NOT NULL DEFAULT '',
  key TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (tenant, key)
);

CREATE TABLE users (
  discord_id TEXT PRIMARY KEY,
  username TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  guilds_json TEXT NOT NULL DEFAULT '[]',
  guilds_checked_at INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%s','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%s','now')),
  locale_pref TEXT
);

CREATE TABLE user_oauth (
  discord_id TEXT PRIMARY KEY,
  refresh_token TEXT NOT NULL DEFAULT '',
  scope TEXT NOT NULL DEFAULT '',
  refresh_state TEXT NOT NULL DEFAULT 'ok',
  last_refresh_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE user_guild_nicks (
  discord_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  nick TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (discord_id, guild_id)
);

CREATE TABLE guild_members (
  tenant TEXT NOT NULL,
  discord_id TEXT NOT NULL,
  nick TEXT NOT NULL DEFAULT '',
  global_name TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant, discord_id)
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'activity',
  description TEXT NOT NULL DEFAULT '',
  starts_at TEXT,
  meet_info TEXT NOT NULL DEFAULT '',
  max_slots INTEGER NOT NULL DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  tenant TEXT NOT NULL DEFAULT '',
  starts_at_utc INTEGER,
  origin TEXT NOT NULL DEFAULT 'admin',
  created_by TEXT NOT NULL DEFAULT '',
  manage_code TEXT NOT NULL DEFAULT '',
  dungeon TEXT NOT NULL DEFAULT '',
  creator_discord_id TEXT,
  reminder_sent_at INTEGER,
  reminder_error TEXT
);

CREATE TABLE signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  uid TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '随意',
  weapon TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  team_name TEXT NOT NULL DEFAULT '',
  members TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  discord_id TEXT,
  ready_at INTEGER,
  UNIQUE (event_id, uid)
);

CREATE TABLE results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  members TEXT NOT NULL DEFAULT '',
  time_ms INTEGER NOT NULL,
  proof_url TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE event_reminders (
  event_id INTEGER NOT NULL,
  offset_min INTEGER NOT NULL,
  sent_at INTEGER,
  error TEXT,
  PRIMARY KEY (event_id, offset_min)
);

CREATE TABLE grouping_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'activity',
  title TEXT NOT NULL DEFAULT '',
  dungeon TEXT NOT NULL DEFAULT '',
  max_slots INTEGER NOT NULL DEFAULT 10,
  start_days_ahead INTEGER NOT NULL DEFAULT 0,
  start_minutes INTEGER NOT NULL DEFAULT 1200,
  creator_discord_id TEXT,
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE short_links (
  code TEXT PRIMARY KEY,
  tenant TEXT NOT NULL DEFAULT '',
  event_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE guild_avatars (
  tenant TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  bytes BLOB NOT NULL,
  hash TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE user_gear_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_id TEXT NOT NULL,
  slot TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  payload TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE user_gear_builds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  target_idx INTEGER NOT NULL DEFAULT 0,
  payload TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE heirloom_item_pushes (
  tenant TEXT NOT NULL,
  discord_id TEXT NOT NULL,
  build_sig TEXT NOT NULL,
  item_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant, discord_id, build_sig, item_hash)
);

CREATE TABLE heirloom_set_state (
  tenant TEXT NOT NULL,
  discord_id TEXT NOT NULL,
  build_sig TEXT NOT NULL,
  complete INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant, discord_id, build_sig)
);

CREATE TABLE bosses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  talent TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  dungeon TEXT NOT NULL DEFAULT '',
  guide TEXT NOT NULL DEFAULT '',
  mechanics_json TEXT,
  talents_json TEXT,
  shouts_json TEXT
);

CREATE TABLE dungeons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  size INTEGER NOT NULL DEFAULT 10,
  is_current INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  video_url TEXT NOT NULL DEFAULT '',
  video_title TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '',
  season TEXT,
  category TEXT,
  level INTEGER
);

CREATE TABLE affix_max (
  affix_key TEXT PRIMARY KEY,
  name_cn TEXT NOT NULL,
  max_value REAL NOT NULL,
  unit TEXT DEFAULT ''
);

CREATE TABLE school_bis (
  school TEXT NOT NULL,
  build TEXT NOT NULL DEFAULT 'default',
  attr TEXT,
  rate TEXT,
  bis_json TEXT NOT NULL,
  updated_at INTEGER DEFAULT (strftime('%s','now')),
  PRIMARY KEY (school, build)
);

CREATE TABLE school_rotations (
  school TEXT PRIMARY KEY,
  rotation_json TEXT NOT NULL,
  updated_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE schools (
  name TEXT PRIMARY KEY,
  short TEXT,
  family TEXT,
  color TEXT,
  attr TEXT,
  talent_desc TEXT,
  updated_at INTEGER DEFAULT (strftime('%s','now')),
  slug TEXT
);

CREATE TABLE slot_affix (
  slot TEXT NOT NULL,
  affix_key TEXT NOT NULL,
  build TEXT NOT NULL DEFAULT 'big',
  PRIMARY KEY (slot, affix_key, build)
);

CREATE TABLE push_tokens (
  discord_id TEXT NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (discord_id, token)
);

CREATE TABLE error_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  tenant TEXT NOT NULL DEFAULT '',
  context TEXT NOT NULL DEFAULT '',
  stack TEXT NOT NULL DEFAULT ''
);

CREATE TABLE hub_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER NOT NULL,
  actor TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL DEFAULT '',
  tenant TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  ip TEXT NOT NULL DEFAULT ''
);

CREATE TABLE creator_backfill_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  tenant TEXT,
  seat_nickname TEXT,
  resolved_discord_id TEXT,
  outcome TEXT NOT NULL,
  reason TEXT,
  created_at INTEGER NOT NULL DEFAULT 0,
  detail TEXT
);

CREATE INDEX idx_events_tenant ON events (tenant, type, status);
CREATE INDEX idx_events_utc ON events (tenant, starts_at_utc);
CREATE INDEX idx_signups_event ON signups (event_id);
CREATE INDEX idx_results_event ON results (event_id, time_ms);
CREATE INDEX idx_grouping_templates_tenant ON grouping_templates (tenant);
CREATE UNIQUE INDEX short_links_target_unique ON short_links (tenant, event_id);
CREATE INDEX idx_user_gear_items_owner ON user_gear_items (discord_id);
CREATE INDEX idx_user_gear_builds_owner ON user_gear_builds (discord_id);
CREATE INDEX idx_error_log_at ON error_log (at);
CREATE INDEX idx_hub_audit_at ON hub_audit_log (at);
CREATE INDEX idx_hub_audit_tenant ON hub_audit_log (tenant);
