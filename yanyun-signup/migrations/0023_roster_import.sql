-- 0023: guild roster + roster screenshot import (F25).
--
-- guild_roster_entries is the guild's GAME-NAME roster: an orthogonal
-- record next to guild_members, never a replacement for it. Membership
-- itself is Discord-driven — guild_members rows are keyed by Discord
-- id and written when a bound-server member actually shows up — while
-- a name read off a screenshot carries no Discord identity at all.
-- OCR-imported names therefore land here (display name + the Discord
-- member they matched, when one matched), and NOTHING in this feature
-- inserts, updates or deletes guild_members / users rows.
--
-- The import is two-phase so nothing lands silently:
--   roster_import_batches  one uploaded screenshot batch (metered
--     through the existing batch-OCR daily counter in usage_counters;
--     no new metering channel). status pending -> confirmed.
--   roster_import_rows     the recognition preview, one row per
--     recognized line, pre-classified by the backend against the
--     guild's Discord roster + existing roster entries:
--     matched (already a Discord roster member) / new (plausible
--     game name, not seen anywhere) / unrecognized (not a plausible
--     name). Only rows the admin explicitly confirms create entries.
--
-- Pure expand: three new tables, nothing else changes. The previous
-- release never touches them, so it is unaffected if it briefly runs
-- against the migrated shape (apply runs before promote anyway).

CREATE TABLE guild_roster_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL,
  display_name TEXT NOT NULL,
  name_norm TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'ocr',
  matched_discord_id TEXT,
  created_by TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX guild_roster_entries_tenant_norm_unique ON guild_roster_entries (tenant, name_norm);
CREATE INDEX idx_guild_roster_entries_tenant ON guild_roster_entries (tenant);

CREATE TABLE roster_import_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  image_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT 0,
  confirmed_at INTEGER
);

CREATE INDEX idx_roster_import_batches_tenant ON roster_import_batches (tenant, created_at);

CREATE TABLE roster_import_rows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id INTEGER NOT NULL,
  tenant TEXT NOT NULL,
  raw_name TEXT NOT NULL DEFAULT '',
  name_norm TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  matched_discord_id TEXT,
  matched_name TEXT NOT NULL DEFAULT '',
  created_entry_id INTEGER
);

CREATE INDEX idx_roster_import_rows_batch ON roster_import_rows (batch_id);
CREATE INDEX idx_roster_import_rows_tenant ON roster_import_rows (tenant);
