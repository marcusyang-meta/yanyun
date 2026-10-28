-- 0030: fill-in market (P19) — cross-guild substitute matching.
--
-- Pricing is per-edge (DESIGN.md §9): the SUPPLY edge is free (any
-- guild member may offer to fill in — a market starved of supply has
-- no liquidity), the DEMAND edge is T3 (a guild's leaders/admins post
-- fill requests against their own groupings and invite suppliers).
-- The market only matches: publishing, browsing, inviting and both
-- sides confirming. It never seats anyone — seating stays the demand
-- side's manual action on the grouping itself (auto-substitution is
-- a cut feature and does not come back through this door).
--
-- fill_offers: one row per supply offer, keyed to the PERSON (a
-- member may serve several guilds; the offer is theirs, not their
-- guild's). home_tenant records the guild they published from and
-- the public guild name is read off tenants at composition time —
-- the market surface sends only the fields the market needs (school,
-- windows, home guild name); no contact or account field is stored
-- here at all. windows_json is the F5 availability caliber: a JSON
-- array of { weekday (0 = Sunday), startMinute, endMinute } in UTC
-- minutes of day. Status: 'open' until the member withdraws it
-- ('withdrawn'); rows are never deleted (the trail is the record).
-- The one-open-offer-per-person rule is a partial unique index.
--
-- fill_requests: one row per demand a T3 guild's leader/admin posted
-- against one of its own groupings (event_id). needed_role is the
-- derived seat role (the roleOf healer/dps vocabulary); needed_school optionally pins a
-- school. Status machine: 'open' -> 'matched' (a supplier accepted
-- an invite) | 'closed' (poster closed it); terminal rows keep
-- their timestamps — matched_at / closed_at are the audit trail.
--
-- fill_invites: one row per invitation from a request to an offer.
-- Status: 'pending' -> 'accepted' | 'declined'; when a request
-- closes or matches another supplier, its remaining pending invites
-- settle as 'expired' (written by the request-side transitions, so
-- no pending invite can outlive its request). The unique index
-- (request, supplier) states one live invite per pair; a declined
-- invite can be re-issued only after the old row settles — the
-- repository deletes nothing, the mutation refuses while a pending
-- or accepted row exists for the pair (the unique index below is
-- partial on exactly those two statuses).
--
-- Pure expand: three new tables, nothing else changes. The previous
-- release never touches them, and apply runs before promote anyway.

CREATE TABLE fill_offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_id TEXT NOT NULL DEFAULT '',
  display_name TEXT NOT NULL DEFAULT '',
  home_tenant TEXT NOT NULL DEFAULT '',
  school TEXT NOT NULL DEFAULT '',
  windows_json TEXT NOT NULL DEFAULT '[]',
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_fill_offers_status ON fill_offers (status, id);
CREATE UNIQUE INDEX fill_offers_open_unique ON fill_offers (discord_id) WHERE status = 'open';

CREATE TABLE fill_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant TEXT NOT NULL DEFAULT '',
  event_id INTEGER NOT NULL DEFAULT 0,
  needed_role TEXT NOT NULL DEFAULT '',
  needed_school TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  created_by TEXT NOT NULL DEFAULT '',
  created_by_name TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  matched_at INTEGER,
  closed_at INTEGER
);

CREATE INDEX idx_fill_requests_tenant ON fill_requests (tenant, id);
CREATE INDEX idx_fill_requests_event ON fill_requests (event_id, status);

CREATE TABLE fill_invites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL REFERENCES fill_requests(id) ON DELETE CASCADE,
  offer_id INTEGER NOT NULL REFERENCES fill_offers(id) ON DELETE CASCADE,
  tenant TEXT NOT NULL DEFAULT '',
  event_id INTEGER NOT NULL DEFAULT 0,
  from_discord_id TEXT NOT NULL DEFAULT '',
  from_name TEXT NOT NULL DEFAULT '',
  to_discord_id TEXT NOT NULL DEFAULT '',
  to_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL DEFAULT 0,
  responded_at INTEGER
);

CREATE UNIQUE INDEX fill_invites_pair_unique ON fill_invites (request_id, to_discord_id) WHERE status IN ('pending', 'accepted');
CREATE INDEX idx_fill_invites_request ON fill_invites (request_id, status);
CREATE INDEX idx_fill_invites_supplier ON fill_invites (to_discord_id, status, id);
