-- 0033: guild custom domains (P23, white-label tier B).
--
-- One row per guild that has bound its own domain (e.g.
-- www.some-guild.com): the binding record for the Cloudflare for
-- SaaS custom-hostname flow designed in
-- research_notes/white-label/DESIGN.md (tier B). The row is the
-- code-side state machine only:
--
--   pending   bound by the guild admin, DNS / ownership steps not
--             yet verified (or the platform's zone-level SaaS seam
--             not connected yet) — the hostname does NOT resolve.
--   active    DNS guidance verified in code (CNAME to the fallback
--             origin + ownership TXT); the worker's host gate
--             resolves the hostname to this guild, subject to the
--             tier verdict and the seam being configured.
--   disabled  switched off from the hub operations surface (or by
--             the admin removing the binding's effect); the row is
--             kept as the record, the hostname does NOT resolve.
--
-- hostname is globally unique: a domain can belong to one guild.
-- verify_token is the ownership-proof secret served to the admin
-- as the TXT record value; it is never exposed outside the admin
-- surface of the owning guild.
--
-- Pure expand: one new table, nothing else changes. The previous
-- release never touches it, so it is unaffected if it briefly runs
-- against the migrated shape (apply runs before promote anyway).

CREATE TABLE guild_custom_domains (
  tenant TEXT PRIMARY KEY,
  hostname TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verify_token TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  verified_at INTEGER
);

CREATE UNIQUE INDEX guild_custom_domains_hostname_unique ON guild_custom_domains (hostname);
CREATE INDEX idx_guild_custom_domains_status ON guild_custom_domains (status);
