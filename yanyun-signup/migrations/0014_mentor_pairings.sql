-- 0014: mentor pairings — guild-admin mentor matching (F17).
--
-- One row per pairing a guild admin created between a designated
-- mentor and a mentee (both guild members, snapshotted display names
-- so the list stays readable after renames). A pairing is 'active'
-- until an admin ends it ('ended', ended_at stamped) — rows are
-- never deleted: the pairing history is the audit trail, and the
-- newcomer checklist (F24) reads "has an active pairing as mentee"
-- straight from this table.
--
-- The one-active-pairing-per-mentee rule is stated in the schema as
-- a partial unique index: only rows with status = 'active'
-- participate, so re-pairing after an ending is always possible.
-- A mentor may carry several active mentees; no index limits that.
--
-- Pure expand: one new table, nothing else changes. The previous
-- release never touches this table; the new code reaches it only
-- through the recruit repository, and apply runs before promote
-- anyway.

CREATE TABLE mentor_pairings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL DEFAULT '',
  mentor_discord_id TEXT NOT NULL DEFAULT '',
  mentor_name TEXT NOT NULL DEFAULT '',
  mentee_discord_id TEXT NOT NULL DEFAULT '',
  mentee_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_by TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  ended_at INTEGER
);

CREATE INDEX idx_mentor_pairings_tenant ON mentor_pairings (tenant, id);
CREATE UNIQUE INDEX mentor_pairings_active_mentee_unique ON mentor_pairings (tenant, mentee_discord_id) WHERE status = 'active';
