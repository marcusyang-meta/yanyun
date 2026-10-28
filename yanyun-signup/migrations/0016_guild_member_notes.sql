-- 0016: guild member officer notes (free officer tools line, F12).
--
-- guild_member_notes: one row per note an officer (guild admin) writes
-- about a member of their own guild. Notes are an admin-side-only
-- record: the row carries the guild (tenant), the member it is about,
-- the note text, and the author snapshot (Discord id + display name at
-- write time, so history stays readable after renames). created_at /
-- updated_at are epoch seconds, the guild_announcements caliber.
-- Nothing member-facing ever reads this table — the GraphQL member
-- variants carry no note field at all.
--
-- Pure expand: one new table, nothing else changes. The previous
-- release never touches this table, so it is unaffected if it briefly
-- runs against the migrated shape (apply runs before promote anyway).

CREATE TABLE guild_member_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL,
  member_discord_id TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  author_discord_id TEXT NOT NULL DEFAULT '',
  author_name TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_guild_member_notes_tenant_member ON guild_member_notes (tenant, member_discord_id, id);
