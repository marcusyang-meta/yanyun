-- 0031: guild alliances (P20) — symmetric cross-guild relations.
--
-- One row per UNORDERED guild pair: guild_low / guild_high are the
-- two slugs stored in lexicographic order, so the pair (A, B) has
-- exactly one possible row shape no matter which side acted — that
-- canonical ordering IS the symmetric storage rule, and the partial
-- unique index below enforces one live relation per pair. Who
-- initiated is a fact ON the row (requested_by_tenant + author
-- snapshot), not a second row.
--
-- Status machine: 'pending' (A's admin invited, awaiting B's admin)
-- -> 'active' (B accepted) | 'rejected' (B declined, terminal);
-- 'active' -> 'ended' (either side's admin dissolves, terminal,
-- ended_by_tenant records who). Rejected / ended pairs may be
-- re-invited later as a NEW row — history is never rewritten.
--
-- Sharing itself stores nothing here: an allied grouping is an
-- events row flagged ally-visible (migration 0032), and every read
-- joins the CURRENT alliance state, so dissolving an alliance
-- revokes all sharing the moment the status flips (read-time
-- verdict, no cascade writes to undo).
--
-- Pure expand: one new table, nothing else changes. The previous
-- release never touches it, and apply runs before promote anyway.

CREATE TABLE guild_alliances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_low TEXT NOT NULL DEFAULT '',
  guild_high TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by_tenant TEXT NOT NULL DEFAULT '',
  requested_by TEXT NOT NULL DEFAULT '',
  requested_by_name TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  responded_at INTEGER,
  ended_at INTEGER,
  ended_by_tenant TEXT NOT NULL DEFAULT ''
);

CREATE UNIQUE INDEX guild_alliances_live_unique ON guild_alliances (guild_low, guild_high) WHERE status IN ('pending', 'active');
CREATE INDEX idx_guild_alliances_low ON guild_alliances (guild_low, status, id);
CREATE INDEX idx_guild_alliances_high ON guild_alliances (guild_high, status, id);
