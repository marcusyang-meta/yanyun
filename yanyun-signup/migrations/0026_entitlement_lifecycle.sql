-- 0026: entitlement lifecycle — past-due grace, trial usage, card on file.
--
-- Premium lifecycle line (marcus's rulings, 2026-10-28): a 14-day
-- past-due grace for Stripe-sourced entitlements, a one-per-guild
-- 14-day T2 trial for new guilds, and the card-on-file fact the
-- persistence gate reads. Three additive columns on
-- guild_entitlements, all judged at READ time by the entitlement
-- service (billing-service.ts) — no cron rewrites state:
--
--   past_due_since  unix seconds when a Stripe delinquency was
--     marked (invoice.payment_failed / subscription past_due);
--     NULL = not past due. Only ever set on source='stripe' rows:
--     manual and trial entitlements get no grace, they lapse at
--     their period end exactly as before. Cleared when the
--     subscription returns to a live status.
--   has_card  1 when a payment method is on file for the guild.
--     Written by the future Stripe line (checkout / setup flows);
--     the lifecycle engine only reads it (the persistence-card
--     verdict). Default 0 — no guild gains a card by this migration.
--   trial_used  1 once the guild has consumed its one trial,
--     stamped by the trial grant itself so neither expiry, revoke
--     nor a later paid plan can ever re-arm a second trial.
--
-- Pure expand: three additive columns, nothing else changes. The
-- previous release's code never names these columns, so it is
-- unaffected if it briefly runs against the migrated shape (apply
-- runs before promote anyway).

ALTER TABLE guild_entitlements ADD COLUMN past_due_since INTEGER;
ALTER TABLE guild_entitlements ADD COLUMN has_card INTEGER NOT NULL DEFAULT 0;
ALTER TABLE guild_entitlements ADD COLUMN trial_used INTEGER NOT NULL DEFAULT 0;
