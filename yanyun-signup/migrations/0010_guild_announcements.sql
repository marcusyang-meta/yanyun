-- 0010: guild announcements — the guild communication line (F9/F10/F18).
--
-- guild_announcements: one row per broadcast a guild admin posts to
-- their own guild. kind is 'standard' for a normal announcement (F9)
-- or 'urgent' for an emergency rally call (F18) — both ride the same
-- row, the same push pipeline and the same rate-limit metering; the
-- kind only changes presentation (server-composed urgent label) and
-- which daily counter the post is charged to. The author snapshot
-- (Discord id + display name at post time) keeps history readable
-- after renames. created_at is epoch seconds, the guild_members /
-- push_tokens caliber.
--
-- guild_announcement_reads: one row per (announcement, member) read
-- receipt (F10). A row exists only once that member has opened the
-- announcement; absence of a row IS the unread state, so no boolean
-- column is stored. read_at is epoch seconds.
--
-- Pure expand: two new tables, nothing else changes. The previous
-- release never touches these tables, so it is unaffected if it
-- briefly runs against the migrated shape (apply runs before promote
-- anyway).

CREATE TABLE guild_announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'standard',
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  author_discord_id TEXT NOT NULL DEFAULT '',
  author_name TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_guild_announcements_tenant_id ON guild_announcements (tenant, id);

CREATE TABLE guild_announcement_reads (
  announcement_id INTEGER NOT NULL,
  tenant TEXT NOT NULL,
  discord_id TEXT NOT NULL,
  read_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (announcement_id, discord_id)
);

CREATE INDEX idx_guild_announcement_reads_tenant_user ON guild_announcement_reads (tenant, discord_id);
