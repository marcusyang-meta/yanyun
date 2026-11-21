-- 0044: weekly recurring groupings ("every week at the same time").
--
-- grouping_recurrences: one row per weekly series a leader switched
-- on at car creation. The row is the series' source of truth: it
-- snapshots the car's configuration at creation (title / type /
-- dungeon / capacity / ally-sharing / the F7 custom-field
-- definitions as a JSON document — configuration data, never UI
-- copy), the weekday + home timezone of the first instance, and
-- last_starts_at_utc, the start of the most recent instance in the
-- chain. The daily cron materializes exactly one future instance
-- per active rule (rolling one-ahead): the next instance's start is
-- last_starts_at_utc + 7 days at the same wall-clock reading in tz.
--
-- Instances are ordinary events rows; events.recurrence_id links an
-- instance back to its rule (NULL for every non-series car). The
-- unique (recurrence_id, starts_at_utc) index states the
-- one-instance-per-week rule in the schema — a repeated
-- materialization run for the same week cannot double-book. NULL
-- recurrence_id rows never collide (SQLite treats NULLs as
-- distinct), so ordinary cars are unaffected.
--
-- status: 'active' (the cron keeps the series going) or 'stopped'
-- (a manager stopped the series; already-materialized instances are
-- untouched and stay ordinary cars). Nothing is ever deleted here:
-- a stopped rule is the record that the series existed.
--
-- Pure expand: one new table, one nullable column, two indexes;
-- the previous release never reads any of it.

CREATE TABLE grouping_recurrences (
  id INTEGER PRIMARY KEY,
  tenant INTEGER NOT NULL DEFAULT 0,
  source_event_id INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'activity',
  dungeon TEXT NOT NULL DEFAULT '',
  max_slots INTEGER NOT NULL DEFAULT 10,
  ally_visible INTEGER NOT NULL DEFAULT 0,
  visitor_slots INTEGER NOT NULL DEFAULT 0,
  custom_fields_json TEXT NOT NULL DEFAULT '[]',
  weekday INTEGER NOT NULL DEFAULT 0,
  tz TEXT,
  last_starts_at_utc INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  creator_user_id INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_grouping_recurrences_tenant ON grouping_recurrences (tenant, status);

ALTER TABLE events ADD COLUMN recurrence_id INTEGER;

CREATE UNIQUE INDEX events_recurrence_start_unique ON events (recurrence_id, starts_at_utc);
