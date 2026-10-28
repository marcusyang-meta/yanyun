-- 0021: activity lotteries — guild-admin raffle tool (F21).
--
-- A lottery is created by a guild admin over one participant list:
-- either the seated participants of one of the guild's groupings
-- (source = 'grouping', source_event_id set) or a hand-picked set of
-- guild members (source = 'members'). The list is snapshotted into
-- lottery_entries at creation (discord id + display name + weight),
-- so a later roster/seat change never rewrites a pending draw's
-- odds. Drawing writes one lottery_winners row per winner (a winner
-- can never repeat inside one lottery: the draw is without
-- replacement, and the unique index states the same rule in the
-- schema) and stamps lotteries.drawn_at / status = 'drawn'. Lottery,
-- entries and winners are all kept — the full audit trail (prize
-- pool, list, weights, result, times) stays queryable forever.
--
-- Pure expand: three new tables, nothing else changes. The previous
-- release never touches them, and apply runs before promote anyway.

CREATE TABLE lotteries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  prize TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'members',
  source_event_id INTEGER,
  winner_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open',
  created_by TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  drawn_at INTEGER
);

CREATE INDEX idx_lotteries_tenant ON lotteries (tenant, id);

CREATE TABLE lottery_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lottery_id INTEGER NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
  discord_id TEXT NOT NULL DEFAULT '',
  display_name TEXT NOT NULL DEFAULT '',
  weight INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX lottery_entries_member_unique ON lottery_entries (lottery_id, discord_id);
CREATE INDEX idx_lottery_entries_lottery ON lottery_entries (lottery_id);

CREATE TABLE lottery_winners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lottery_id INTEGER NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
  discord_id TEXT NOT NULL DEFAULT '',
  display_name TEXT NOT NULL DEFAULT '',
  drawn_at INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX lottery_winners_member_unique ON lottery_winners (lottery_id, discord_id);
CREATE INDEX idx_lottery_winners_lottery ON lottery_winners (lottery_id);
