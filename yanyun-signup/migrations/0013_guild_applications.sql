-- 0013: guild applications — the recruitment application flow (F16).
--
-- A logged-in user who is not yet a member of a guild's bound Discord
-- server applies to join the guild; the row is the full state machine
-- (pending -> approved | rejected) plus its audit trail (who reviewed,
-- when). The applicant name is a snapshot taken at submission, so the
-- review queue stays readable after renames.
--
-- The one-pending-application-per-(guild, applicant) rule is stated
-- in the schema as a partial unique index: only rows with
-- status = 'pending' participate, so a rejected applicant may apply
-- again and an approved history never blocks a fresh application.
--
-- Approval's platform-side effect is roster enrollment (a
-- guild_members row, written by the review path). Actual Discord
-- server membership can only change on Discord's side: the platform
-- holds no bot token and its OAuth grant is read-only, so no row in
-- this table pretends to be a Discord grant.
--
-- Pure expand: one new table, nothing else changes. The previous
-- release never touches this table; the new code reaches it only
-- through the recruit repository, and apply runs before promote
-- anyway.

CREATE TABLE guild_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL DEFAULT '',
  discord_id TEXT NOT NULL DEFAULT '',
  applicant_name TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by TEXT NOT NULL DEFAULT '',
  reviewed_by_name TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  reviewed_at INTEGER
);

CREATE INDEX idx_guild_applications_tenant ON guild_applications (tenant, id);
CREATE UNIQUE INDEX guild_applications_pending_unique ON guild_applications (tenant, discord_id) WHERE status = 'pending';
