-- 0026: guild gear standards (premium insights line, P9).
--
-- guild_gear_standards: one row per readiness threshold a guild admin
-- sets for a scene (a free-text scene label, typically a dungeon or a
-- season phase). The threshold dimension is min_score: the minimum
-- build graduation score, in percent (0..100), read off the member's
-- best saved gear build snapshot (gear domain, snapshot.total x 100).
-- The board itself is computed at read time from roster + gear data;
-- this entity stores ONLY the admin-set lines, never member results,
-- so a lapsed guild keeps its lines and re-subscribing restores the
-- board exactly (freeze-not-delete caliber of the premium program).
--
-- Pure expand: one new table, nothing else changes. The previous
-- release never touches this table, so it is unaffected if it briefly
-- runs against the migrated shape (apply runs before promote anyway).

CREATE TABLE guild_gear_standards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  min_score INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_guild_gear_standards_tenant ON guild_gear_standards (tenant, id);
