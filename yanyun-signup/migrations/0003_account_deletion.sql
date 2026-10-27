-- 0003: account self-service export / deletion state on users.
--
-- The account-deletion design (research_notes/account-deletion) puts two
-- pieces of per-account state on the users row:
--   deletion_requested_at — epoch seconds when the user submitted a
--     deletion request; NULL = no pending deletion. The account enters
--     a 7-day cooling-off period from this timestamp; a daily sweep on
--     the existing backup cron executes the cascade once it expires.
--   fresh_auth_at — epoch seconds of the last completed Discord OAuth
--     round trip. Export and deletion submission require a fresh auth
--     no older than 10 minutes, so a stolen long-lived session cannot
--     drain or nuke the account.
--
-- Shape: plain nullable INTEGER (epoch seconds, the caliber of
-- users.guilds_checked_at / user_oauth.last_refresh_at). Pure expand:
-- two additive columns; the previous release never reads or writes
-- them, so it is unaffected if it briefly runs against the migrated
-- shape (apply runs before promote anyway).

ALTER TABLE users ADD COLUMN deletion_requested_at INTEGER;
ALTER TABLE users ADD COLUMN fresh_auth_at INTEGER;
