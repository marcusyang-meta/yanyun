-- 0035: AI activity recaps (premium line P18, tier T3).
--
-- grouping_recaps: at most ONE row per grouping (event) — a
-- regeneration overwrites the row in place (the version counter
-- states how many successful generations the row is), so readers
-- never have to pick between versions. The row carries the guild
-- (tenant) denormalized from its grouping so the guild recap index
-- reads one entity without a join, the generated paragraphs as a
-- JSON array of strings (paragraphs_json), a compact JSON summary
-- of the data package the text was generated from (snapshot_json —
-- counts and facts, never the full package), the provider id that
-- produced it, the generating admin's Discord id, and epoch-second
-- stamps. status is 'ready' for a stored generation and 'failed'
-- when the last attempt failed (paragraphs then hold the previous
-- success, if any — a failed retry never destroys a good recap).
--
-- Recaps exist only while the AI recap provider seam is configured
-- AND the guild passes the T3 tier gate; with the provider
-- unconfigured (production today) nothing ever writes this table.
--
-- Pure expand: one new table, nothing else changes. The previous
-- release never touches this table, so it is unaffected if it
-- briefly runs against the migrated shape (apply runs before
-- promote anyway).

CREATE TABLE grouping_recaps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL DEFAULT '',
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ready',
  paragraphs_json TEXT NOT NULL DEFAULT '[]',
  snapshot_json TEXT NOT NULL DEFAULT '{}',
  provider TEXT NOT NULL DEFAULT '',
  generated_by TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  last_error TEXT NOT NULL DEFAULT '',
  generated_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX grouping_recaps_event_unique ON grouping_recaps (event_id);
CREATE INDEX idx_grouping_recaps_tenant ON grouping_recaps (tenant, generated_at);
