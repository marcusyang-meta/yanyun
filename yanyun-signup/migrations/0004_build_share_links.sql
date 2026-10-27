-- 0003: build share links — public share aliases for saved gear builds.
--
-- A saved build (user_gear_builds) may carry one public alias
-- /b/<code>: the code is a random base62 primary key (never derived
-- from the sequential build id, so links cannot be enumerated into
-- neighbouring builds), build_id is unique (one active link per
-- build — regenerating replaces the row and the old code dies), and
-- discord_id records the owner so mint/revoke/resolve stay
-- ownership-scoped through the data layer, like the gear rows
-- themselves. Same shape caliber as short_links (0001 baseline).
--
-- Pure expand: one new table, nothing else changes. The previous
-- release never touches this table; the new code reaches it only
-- through the build-share repository, and apply runs before promote
-- anyway.

CREATE TABLE build_share_links (
  code TEXT PRIMARY KEY,
  build_id INTEGER NOT NULL,
  discord_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX build_share_links_build_unique ON build_share_links (build_id);
CREATE INDEX idx_build_share_links_owner ON build_share_links (discord_id);
