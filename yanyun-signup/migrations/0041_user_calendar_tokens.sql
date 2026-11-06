-- 0041: personal calendar subscription tokens (free feature).
--
-- user_calendar_tokens: at most ONE row per member — the token is
-- the credential for that member's read-only iCalendar feed
-- (GET /calendar/<token>.ics), so it is stored like the share
-- short-link codes are: an unguessable random string, unique,
-- looked up directly. The feed carries only the token owner's own
-- signed-up, not-yet-ended cars; the token is resettable from the
-- member's personal settings, which overwrites the row in place
-- (the old URL dies immediately). updated_at is epoch seconds of
-- the last mint/reset.
--
-- Privacy shape: the token is a bearer secret for exactly one
-- member's own signup list. It is only ever composed into that
-- member's own settings surface, never into any other member's
-- payload, an admin surface, or a log line.
--
-- Pure expand: one new table, nothing else changes; the previous
-- release never touches it.

CREATE TABLE user_calendar_tokens (
  user_id INTEGER PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  updated_at INTEGER NOT NULL DEFAULT 0
);
