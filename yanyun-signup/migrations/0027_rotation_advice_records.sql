-- 0027: rotation advice records (Premium T2, P5 rotation advice audit trail).
-- Append-only snapshots of a saved rotation ranking for one grouping:
-- the ranked members with their factor values, who saved it and when.
-- Pure expand: one new table, nothing else changes.

CREATE TABLE rotation_advice_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL DEFAULT '',
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  advice_json TEXT NOT NULL DEFAULT '[]',
  created_by TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_rotation_advice_records_event ON rotation_advice_records (tenant, event_id, id);
