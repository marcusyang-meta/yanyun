-- 0003: billing — guild entitlements + Stripe event dedupe.
--
-- Monetization infrastructure (entitlement + paygate + Stripe
-- readiness). Two new tables, nothing else changes:
--
--   guild_entitlements  one row per guild that has ever held a plan
--     assignment: plan ('free' | 'premium'), source ('stripe' |
--     'manual' | ''), the current period end (unix seconds; NULL =
--     no expiry on file), and the Stripe customer / subscription ids
--     that link the row to Stripe. Expiry is judged at READ time by
--     the entitlement service (an expired premium row reads as free);
--     no cron rewrites state, so this table is a record, not a clock.
--
--   stripe_events       webhook idempotency ledger: one row per
--     processed Stripe event id. The webhook handler inserts before
--     applying; a replay hits the primary key and is dropped. This
--     table is dedupe state, not business data (excluded from
--     backups, like error_log).
--
-- Pure expand: two additive tables. The previous release's code never
-- references them, so it is unaffected if it briefly runs against
-- the migrated shape (apply runs before promote anyway).
-- Expand/contract discipline holds: nothing here narrows a shape an
-- older binary depends on.

CREATE TABLE guild_entitlements (
  tenant TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'free',
  source TEXT NOT NULL DEFAULT '',
  current_period_end INTEGER,
  stripe_customer_id TEXT NOT NULL DEFAULT '',
  stripe_subscription_id TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE stripe_events (
  event_id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT '',
  processed_at INTEGER NOT NULL DEFAULT 0
);
