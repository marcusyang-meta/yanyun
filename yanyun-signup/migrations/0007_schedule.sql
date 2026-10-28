-- 0007: guild scheduling — member weekly availability (F5) and
-- activity time polls (F13).
--
-- member_availability: one row per (guild, member). The member's
-- recurring weekly windows live in slots_json as a JSON array of
-- { weekday (0 = Sunday), startMinute, endMinute } in UTC minutes of
-- day — times are stored in UTC only; every client renders them in
-- the viewer's own timezone (the repo-wide time rule). display_name
-- is the roster-name snapshot at save time so the availability
-- summary never needs a second lookup to label a row.
--
-- time_polls: a guild-scoped scheduling poll. Options are absolute
-- candidate start times (epoch seconds, UTC). Votes are
-- multi-select availability votes: one row per (poll, option,
-- member) the member can attend — the unique index states that rule
-- in the schema, and re-voting replaces the member's whole set.
-- status flips open -> closed by the creator or a guild admin; a
-- closed poll keeps its tallies as the scheduling record.
--
-- Pure expand: four new tables, nothing else changes.

CREATE TABLE member_availability (
  tenant TEXT NOT NULL DEFAULT '',
  discord_id TEXT NOT NULL DEFAULT '',
  display_name TEXT NOT NULL DEFAULT '',
  slots_json TEXT NOT NULL DEFAULT '[]',
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant, discord_id)
);

CREATE TABLE time_polls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  created_by TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  closed_at INTEGER
);

CREATE INDEX idx_time_polls_tenant ON time_polls (tenant, id);

CREATE TABLE time_poll_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id INTEGER NOT NULL REFERENCES time_polls(id) ON DELETE CASCADE,
  starts_at_utc INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_time_poll_options_poll ON time_poll_options (poll_id);

CREATE TABLE time_poll_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id INTEGER NOT NULL REFERENCES time_polls(id) ON DELETE CASCADE,
  option_id INTEGER NOT NULL REFERENCES time_poll_options(id) ON DELETE CASCADE,
  discord_id TEXT NOT NULL DEFAULT '',
  display_name TEXT NOT NULL DEFAULT ''
);

CREATE UNIQUE INDEX time_poll_votes_member_unique ON time_poll_votes (poll_id, option_id, discord_id);
CREATE INDEX idx_time_poll_votes_poll ON time_poll_votes (poll_id);
