-- 0029: guild governance (premium line L4: P16 fine-grained officer
-- capabilities + officer private board, P17 guild audit log). All
-- three entities are T3 governance infrastructure (DESIGN §8): the
-- tables exist for every guild from day one (built, not enabled —
-- the paygate stays OFF), and the GraphQL surfaces compose their
-- locked variants until the guild's tier reaches T3.
--
-- guild_officer_grants: one row per (guild, member) a Discord-server
-- admin of that guild has delegated management capabilities to. The
-- capability set is a comma-separated list of capability keys (the
-- vocabulary lives in code: platform/graphql-base.ts
-- OFFICER_CAPABILITIES); absence of a row IS the ungranted state.
-- Discord admins / the guild master are never rows here — they hold
-- every capability by the admin verdict itself.
--
-- guild_officer_posts: the officer private board — free-form internal
-- posts (shift notes, internal messages) visible only to officers
-- (Discord admins + granted capability holders). Author snapshot
-- (Discord id + display name at write time) like every other
-- officer-side record, so history stays readable after renames.
--
-- guild_audit_events: the guild-level audit log (P17). One row per
-- management action taken inside the guild: who (actor snapshot),
-- when, what (action key from the code-owned vocabulary), and a
-- target summary (target type + id + a short label snapshot). No
-- sensitive body text is ever stored — note bodies, announcement
-- bodies and application messages stay in their own entities; the
-- audit row names the target, it does not copy it. This is a
-- per-guild log for the guild's own officers; the platform
-- hub_audit_log is a different log and is untouched.
--
-- Pure expand: three new tables, nothing else changes. The previous
-- release never touches these tables, so it is unaffected if it
-- briefly runs against the migrated shape (apply runs before
-- promote anyway).

CREATE TABLE guild_officer_grants (
  tenant TEXT NOT NULL,
  discord_id TEXT NOT NULL,
  capabilities TEXT NOT NULL DEFAULT '',
  granted_by TEXT NOT NULL DEFAULT '',
  granted_by_name TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant, discord_id)
);

CREATE TABLE guild_officer_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  author_discord_id TEXT NOT NULL DEFAULT '',
  author_name TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_guild_officer_posts_tenant_id ON guild_officer_posts (tenant, id);

CREATE TABLE guild_audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL,
  actor_discord_id TEXT NOT NULL DEFAULT '',
  actor_name TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL DEFAULT '',
  target_type TEXT NOT NULL DEFAULT '',
  target_id TEXT NOT NULL DEFAULT '',
  target_label TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_guild_audit_events_tenant_id ON guild_audit_events (tenant, id);
