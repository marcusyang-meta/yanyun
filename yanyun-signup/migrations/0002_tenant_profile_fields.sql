-- 0002: tenant profile fields — master_name / logo_url / bg_image_url.
--
-- The guild profile form (web + mobile admin) has always carried these
-- three fields, and the pre-baseline entity model claimed them, but no
-- DDL ever created the columns: the production tenants table does not
-- have them (attested in 0001_baseline.sql), so profile saves naming
-- all six fields threw against production. PR #35 narrowed the write
-- to the three real columns as a stopgap; this migration deliberately
-- adds the columns so the full six-field profile works for real.
--
-- Shape: TEXT NOT NULL DEFAULT '' — the caliber every other tenants
-- text column carries (announcement / discord_webhook / slogan, the
-- last attested NOT NULL DEFAULT '' by the baseline reconciliation).
-- Pure expand: three additive columns, nothing else changes. The
-- previous release's code never writes these columns and reads them
-- only through a '' fallback, so it is unaffected if it briefly runs
-- against the migrated shape (apply runs before promote anyway).

ALTER TABLE tenants ADD COLUMN master_name TEXT NOT NULL DEFAULT '';
ALTER TABLE tenants ADD COLUMN logo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE tenants ADD COLUMN bg_image_url TEXT NOT NULL DEFAULT '';
