-- 0028: premium ops engine (T2) — P8 targeted nudges, P11 churn
-- warnings, P12 season rollover, P14 contribution points.
--
-- Four new entities plus one additive column:
--   ops_nudge_sends      — one row per targeted-nudge send (P8). The
--                          row IS the frequency-control record and
--                          the audit trail: daily caps and per-event
--                          cooldowns are judged from these rows, never
--                          from counters that could drift.
--   season_rollovers     — one row per EXECUTED season rollover
--                          (P12). Previews are computed live and never
--                          stored; only an admin-confirmed execution
--                          leaves this trace, with the full report.
--   contribution_rules   — per-guild point values per action (P14).
--                          One row per (guild, action); absence means
--                          the backend default applies.
--   contribution_entries — the points ledger (P14): one row per
--                          credited platform event, points frozen at
--                          accrual time. dedupe_key is unique, so an
--                          event can never credit twice. Points only
--                          — no goods, donations or withdrawals exist
--                          anywhere in this design (F20 stays cut).
--   grouping_templates.season_key — the season a template copy
--                          belongs to ('' = the pre-rollover
--                          originals). The rollover engine copies
--                          templates forward under the new key.
--
-- Pure expand: additive tables/column only, previous code is
-- unaffected if it briefly runs against the migrated shape.

CREATE TABLE ops_nudge_sends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL,
  event_id INTEGER NOT NULL,
  segment_kind TEXT NOT NULL DEFAULT 'all',
  segment_value TEXT NOT NULL DEFAULT '',
  recipient_count INTEGER NOT NULL DEFAULT 0,
  recipient_ids TEXT NOT NULL DEFAULT '[]',
  sent_by TEXT NOT NULL DEFAULT '',
  sent_at INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_ops_nudge_sends_tenant_at ON ops_nudge_sends(tenant, sent_at);
CREATE INDEX idx_ops_nudge_sends_tenant_event ON ops_nudge_sends(tenant, event_id, sent_at);

CREATE TABLE season_rollovers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL,
  from_season_key TEXT NOT NULL DEFAULT '',
  to_season_key TEXT NOT NULL DEFAULT '',
  templates_copied INTEGER NOT NULL DEFAULT 0,
  report_json TEXT NOT NULL DEFAULT '{}',
  created_by TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_season_rollovers_tenant ON season_rollovers(tenant, id);

CREATE TABLE contribution_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL,
  action_key TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL DEFAULT 0,
  UNIQUE(tenant, action_key)
);

CREATE TABLE contribution_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL,
  discord_id TEXT NOT NULL,
  action_key TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  event_id INTEGER,
  dedupe_key TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_contribution_entries_tenant_user ON contribution_entries(tenant, discord_id, id);
CREATE INDEX idx_contribution_entries_tenant ON contribution_entries(tenant, id);

ALTER TABLE grouping_templates ADD COLUMN season_key TEXT NOT NULL DEFAULT '';
