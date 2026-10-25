-- v7: Discord webhook + 固定队 (2026-10-20)
ALTER TABLE tenants ADD COLUMN discord_webhook TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS fixed_teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_fixed_teams_tenant ON fixed_teams(tenant);

CREATE TABLE IF NOT EXISTS fixed_team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL REFERENCES fixed_teams(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  weapon TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_ftm_team ON fixed_team_members(team_id);
