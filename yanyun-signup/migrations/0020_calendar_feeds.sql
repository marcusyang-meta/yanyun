-- 0020: calendar feeds — one iCal subscription feed per guild (F8).
--
-- A feed row carries the guild's unguessable subscription token: the
-- public endpoint /cal/<token> serves the guild's groupings as
-- text/calendar to anyone holding the link (calendar apps poll it
-- without a session, by design). Resetting the feed replaces the
-- token in place, which revokes the old link immediately — one row
-- per guild, tenant is the primary key. Same shape caliber as
-- short_links (0001 baseline) and build_share_links (0004).
--
-- Pure expand: one new table, nothing else changes. The previous
-- release never touches this table; the new code reaches it only
-- through the calendar-feed repository, and apply runs before
-- promote anyway.

CREATE TABLE calendar_feeds (
  tenant TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX calendar_feeds_token_unique ON calendar_feeds (token);
