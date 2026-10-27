-- 0003: usage counters — the metering substrate for plan limits.
--
-- One row per (user, metric, day): the server-side count of a metered
-- action on one calendar day (day key = Asia/Shanghai date, computed by
-- the limits service; the storage layer treats it as an opaque string).
-- First consumer: gear batch-OCR imports (metric 'gear_ocr_batches').
-- Daily rows make the day rollover free: a new day is a new row, and
-- yesterday's row is never read again by the hot path (it stays for
-- audit until a future retention cleanup).
--
-- Pure expand: one new table, nothing else changes. The previous
-- release's code never references this table, so it is unaffected if it
-- briefly runs against the migrated shape (apply runs before promote
-- anyway). Backward compatible with the previous code version.

CREATE TABLE usage_counters (
  discord_id TEXT NOT NULL,
  metric TEXT NOT NULL,
  day TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (discord_id, metric, day)
);
