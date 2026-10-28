-- 0022: season checklist state — per-guild check-off state for the
-- pre-season checklist on the guild admin surface (F23).
--
-- The checklist ITEMS are not stored: the backend composes them per
-- request from the live season data (current version code, the dex
-- season table, this guild's templates / roster counts), so a new
-- season yields a new list with no data migration. Only the check-off
-- state persists, one row per (guild, season, item): season_key is the
-- backend-derived season identity ("<versionCode>:<seasonCode>", e.g.
-- "intl-v2.3:S5"), so last season's checks never leak into the new
-- season's list — the new season starts unchecked by construction.
-- checked_by snapshots the acting admin's Discord id + display name
-- (same snapshot rule as feedback) so the row stays readable.
--
-- Pure expand: one new table, nothing else changes. The previous
-- release never touches this table, so it is unaffected if it briefly
-- runs against the migrated shape (apply runs before promote anyway).

CREATE TABLE season_checklist_checks (
  tenant TEXT NOT NULL,
  season_key TEXT NOT NULL,
  item_key TEXT NOT NULL,
  checked INTEGER NOT NULL DEFAULT 0,
  checked_by TEXT NOT NULL DEFAULT '',
  checked_by_name TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant, season_key, item_key)
);
