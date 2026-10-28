-- 0032: ally sharing on groupings (P20) — extends the existing
-- seat model instead of building a second one.
--
-- events.ally_visible: the grouping's leader (or its guild's admin)
-- flags the car as visible to allied guilds. Visibility alone opens
-- nothing: events.visitor_slots is the leader-controlled visitor
-- quota (0 = closed, the default for every existing and new car).
-- Allied members see flagged cars of allied guilds on their own
-- guild's activity surface and may claim a visitor seat while the
-- quota lasts; dissolution of the alliance hides and locks all of
-- it at read time (the alliance state is consulted on every read
-- and every visitor signup, never cached on the grouping).
--
-- signups.is_visitor: marks a seat taken through the visitor path.
-- A visitor seat is an ordinary seat in every other respect — same
-- capacity guard (max_slots), same ready flag, same roster — the
-- flag exists so the visitor quota can be counted and so a roster
-- can tell guests from members. Member signups never set it.
--
-- Pure expand: three additive columns with closed-by-default
-- values, nothing else changes. The previous release never names
-- these columns, so it is unaffected if it briefly runs against
-- the migrated shape (apply runs before promote anyway).

ALTER TABLE events ADD COLUMN ally_visible INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN visitor_slots INTEGER NOT NULL DEFAULT 0;
ALTER TABLE signups ADD COLUMN is_visitor INTEGER NOT NULL DEFAULT 0;
