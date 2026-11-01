-- 0038: combat encounters (combat reports v1, premium line, tier T2).
--
-- combat_encounters: ONE row per imported encounter (one event
-- file = one attempt; a grouping holds MANY encounters, 1:N —
-- unlike grouping_recaps' 1:1). The row carries the guild (tenant)
-- and grouping (event_id) denormalized for the guild admin index,
-- the uploader's platform user id, the encounter facts the file
-- declared (boss name, start, duration, result), the import source
-- ('events' for a layer-1 event file, 'overlay' for an overlay
-- session export), the file format version and the attribution
-- model version (so a model upgrade can tell which snapshot was
-- computed by which model), the processing status ('parsed' /
-- 'failed' — a failed processing attempt records last_error and
-- never touches other encounters of the grouping), the aggregation
-- snapshot as one JSON document (overview / skill / buff / party
-- rows; pages read the snapshot, they never recompute), the
-- per-encounter actor identity map as JSON (character name ->
-- roster member or guest, decided at import time for this
-- encounter only), and the retained raw import document
-- (events_json, capped at the service layer; empty when retention
-- was skipped for size) so a future model version can recompute.
--
-- Pure expand: one new table, nothing else changes.

CREATE TABLE combat_encounters (
  id INTEGER PRIMARY KEY,
  tenant INTEGER NOT NULL DEFAULT 0,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  uploader_user_id INTEGER NOT NULL DEFAULT 0,
  boss_name TEXT NOT NULL DEFAULT '',
  started_at_ms INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  result TEXT NOT NULL DEFAULT 'unknown',
  source TEXT NOT NULL DEFAULT 'events',
  format_version INTEGER NOT NULL DEFAULT 1,
  model_version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'parsed',
  last_error TEXT NOT NULL DEFAULT '',
  snapshot_json TEXT NOT NULL DEFAULT '{}',
  actor_map_json TEXT NOT NULL DEFAULT '[]',
  events_json TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_combat_encounters_event ON combat_encounters (event_id, started_at_ms);
CREATE INDEX idx_combat_encounters_tenant ON combat_encounters (tenant, created_at);
