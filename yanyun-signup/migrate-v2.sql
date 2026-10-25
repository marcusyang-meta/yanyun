-- v1(单百业) -> v2(多租户) 迁移, 2026-10-20, 仅对 prod 执行一次
CREATE TABLE IF NOT EXISTS tenants (
  slug          TEXT PRIMARY KEY,
  guild_name    TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  announcement  TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (strftime('%s','now'))
);
ALTER TABLE events ADD COLUMN tenant TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_events_tenant ON events(tenant, type, status);
CREATE TABLE IF NOT EXISTS settings_new (
  tenant TEXT NOT NULL DEFAULT '',
  key    TEXT NOT NULL,
  value  TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (tenant, key)
);
INSERT OR IGNORE INTO settings_new(tenant, key, value) SELECT '', key, value FROM settings;
DELETE FROM settings_new WHERE key IN ('guild_name', 'announcement');
DROP TABLE settings;
ALTER TABLE settings_new RENAME TO settings;
