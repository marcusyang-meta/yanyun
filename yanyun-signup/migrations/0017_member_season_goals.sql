-- 0017: member season goals (free officer tools line, F19).
--
-- member_season_goals: one row per season goal a member sets for
-- themselves inside one guild. The goal is free text (title + a
-- progress note the member maintains), a self-kept status
-- ('active' | 'done' | 'dropped'), and an OPTIONAL binding to an
-- existing dungeon row (dungeon_id, nullable — the dungeon's season
-- comes along through the dex data; no season or dungeon data is
-- duplicated or invented here). member_name is the owner's display
-- snapshot at write time so the officer overview stays readable
-- after renames. created_at / updated_at are epoch seconds.
--
-- Pure expand: one new table, nothing else changes. The previous
-- release never touches this table, so it is unaffected if it briefly
-- runs against the migrated shape (apply runs before promote anyway).

CREATE TABLE member_season_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL,
  discord_id TEXT NOT NULL,
  member_name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  dungeon_id INTEGER,
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_member_season_goals_tenant_user ON member_season_goals (tenant, discord_id, id);
CREATE INDEX idx_member_season_goals_tenant_id ON member_season_goals (tenant, id);
