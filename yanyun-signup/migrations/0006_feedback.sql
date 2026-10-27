-- 0003: user feedback — in-app feedback submitted from the profile
-- surface (web dialog + mobile profile screen), triaged in the hub
-- portal.
--
-- One row per submission: the submitter snapshot (Discord id + display
-- name at submit time, so the hub list stays readable even if the user
-- later renames), the category (problem / suggestion / other), the
-- free text, and a triage status (open / resolved) with the moment it
-- was resolved. Pure expand: one new table, nothing else changes. The
-- previous release never touches this table, so it is unaffected if it
-- briefly runs against the migrated shape (apply runs before promote
-- anyway).

CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'other',
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  created_at INTEGER NOT NULL DEFAULT 0,
  resolved_at INTEGER
);

CREATE INDEX idx_feedback_created ON feedback (created_at);
CREATE INDEX idx_feedback_user_created ON feedback (discord_id, created_at);
CREATE INDEX idx_feedback_status ON feedback (status);
