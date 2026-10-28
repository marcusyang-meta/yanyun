-- 0015: guild mentors — the designated mentor pool (F17).
--
-- A row exists only while a guild admin designates that guild member
-- as a mentor candidate: absence IS the undesignated state, so no
-- boolean is stored (the announcement-reads caliber). Pairings
-- (0014) may only name mentors present here at creation time; ending
-- a designation never rewrites existing pairings.
--
-- Pure expand: one new table, nothing else changes. The previous
-- release never touches this table; the new code reaches it only
-- through the recruit repository, and apply runs before promote
-- anyway.

CREATE TABLE guild_mentors (
  tenant TEXT NOT NULL DEFAULT '',
  discord_id TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant, discord_id)
);
