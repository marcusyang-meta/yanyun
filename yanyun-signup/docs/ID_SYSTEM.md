# Typed public IDs — design and migration inventory

Status: ruled by marcus 2026-10-28 (04:12–04:17). This document is the
single source for the ID format, the type-code registry, and the
renumber migration's scope. The registry in code lives in
`src/domains/platform/ids.ts` and must match this file.

## Format

An entity ID is an 11-digit decimal integer:

```
[ type code: 2 ][ day index: 4 ][ daily sequence: 5 ]
id = typeCode * 1_000_000_000 + dayIndex * 100_000 + sequence
```

- `dayIndex` = whole days between 2026-01-01 (day 0) and the creation
  day, UTC. Range 0..9999 (~27 years).
- `sequence` = per-(type code, day) serial, starting at 1, range
  1..99999.
- The layout is 11 digits wide and < 2^53, so IDs are exact JS
  numbers end to end and store as plain D1 INTEGER primary keys. The
  0x root codes occupy the layout's leading zero (a guild ID is the
  10-digit number 1xxxxxxxxx, zero-padded to 010xxxxxxxx in fixed
  width); the parser reads the code as the first field either way.
  There is no side "public id" column and no mapping layer at
  runtime: the ID *is* the primary key.
- Parsing is prefix-driven and lives in exactly one function,
  `parsePublicId` (data layer). Type codes 90–99 are the reserved
  extension segment: minting with them is refused, and the parser
  rejects them as "extension layout not defined" rather than guessing.
  A future layout widens whichever dimension runs out under a 9x code;
  existing IDs keep parsing under the layout of their own prefix and
  are never renumbered.

## Type-code registry

| Code | Entity | Table |
|-----:|--------|-------|
| 01 | guild | `tenants` (new `id` PK; `slug` becomes a UNIQUE handle) |
| 02 | user | `users` (new `id` PK; `discord_id` becomes a UNIQUE identity column) |
| 10 | grouping | `events` |
| 11 | grouping template | `grouping_templates` |
| 12 | signup (seat) | `signups` |
| 13 | race result | `results` |
| 14 | custom signup field | `grouping_custom_fields` |
| 20 | guild announcement | `guild_announcements` |
| 30 | gear item | `user_gear_items` |
| 31 | gear build | `user_gear_builds` |
| 40 | recruit application | `guild_applications` |
| 41 | mentor pairing | `mentor_pairings` |
| 42 | roster entry | `guild_roster_entries` |
| 43 | roster import batch | `roster_import_batches` |
| 44 | roster import row | `roster_import_rows` |
| 45 | member note | `guild_member_notes` |
| 46 | member season goal | `member_season_goals` |
| 50 | alliance | `guild_alliances` |
| 51 | fill offer | `fill_offers` |
| 52 | fill request | `fill_requests` |
| 53 | fill invite | `fill_invites` |
| 60 | lottery | `lotteries` |
| 61 | time poll | `time_polls` |
| 62 | time poll option | `time_poll_options` |
| 70 | feedback | `feedback` |
| 80 | ops nudge send | `ops_nudge_sends` |
| 90–99 | RESERVED extension segment | — |

Free segments for future entities: 03–09 (platform roots), 15–19,
21–29, 32–39, 47–49, 54–59, 63–69, 71–79, 81–89.

## Minting

- New rows are minted by the data layer before insert
  (`mintPublicId` in `src/domains/platform/id-mint.ts`): one atomic
  upsert against `id_mint_counters` (`INSERT … ON CONFLICT(type_code,
  day_index) DO UPDATE SET seq = seq + 1 RETURNING seq`); the caller
  then inserts its row carrying the composed ID as the explicit
  primary key. The counter upsert is a single atomic statement and D1
  serializes writes per database, so concurrent minters can never
  receive the same sequence; a failed entity insert merely burns a
  sequence number (IDs must be unique, never dense). No repository
  relies on `autoIncrement` for a registered entity any more.
- The mint day is the insertion day (UTC), independent of any
  `created_at` column value.
- Sequence exhaustion (> 99999 in one day for one type) throws; it is
  the signal to open an extension layout under a 9x code, never to
  wrap or reuse.

## Backfill rules (migration 0033)

Existing rows receive IDs by the same formula, deterministically:

- Effective day = UTC day of the row's `created_at`. Text timestamps
  (`events`, `signups`, `results`: `datetime('now')` strings; tenants
  and users: unix-seconds-as-text) and integer unix-second timestamps
  are all normalized to a UTC day.
- `created_at = 0` means "never stamped", not a 1970 creation: the row
  inherits its parent entity's day when it has one
  (`roster_import_rows` ← its batch), otherwise it lands in day 0.
  Sequence order inside a (type, day) group is old-id order, which is
  insertion order.
- A row with `0 < created_at < 2026-01-01` would be real pre-epoch
  data: the migration asserts none exist (guard statement fails the
  migration rather than minting a negative day). Production's first
  rows date from the platform's launch in October 2026.
- A (type, day) group larger than 99999 rows fails the same guard.

## Renumbered tables

The tables in the registry above (26). `tenants` and `users` change
primary-key *kind* (text → typed integer); the rest keep an integer PK
whose values are re-minted. Tables not listed keep their existing
primary keys; their reference columns still remap (next section).

## Remapped reference columns

### Tenant class — slug text → guild ID (01), column name `tenant` kept

Every `tenant` column in: `settings` (PK part), `events`, `signups`
(no — signups has no tenant column; see entity class), `grouping_templates`,
`short_links`, `lotteries`, `time_polls`, `guild_roster_entries`,
`roster_import_batches`, `roster_import_rows`, `guild_announcements`,
`guild_announcement_reads`, `guild_announcement_translations`,
`season_checklist_checks`, `guild_applications`, `mentor_pairings`,
`guild_mentors` (PK part), `guild_member_notes`, `member_season_goals`,
`fill_requests`, `fill_invites`, `guild_avatars` (PK), `ops_nudge_sends`,
`season_rollovers`, `contribution_rules`, `contribution_entries`,
`guild_entitlements` (PK), `heirloom_item_pushes` (PK part),
`heirloom_set_state` (PK part), `member_availability` (PK part),
`error_log`, `hub_audit_log`, `creator_backfill_log`.
Plus the alliance pair columns: `guild_alliances.guild_low`,
`guild_alliances.guild_high` (the low/high ordering rule becomes
numeric order on guild IDs), `guild_alliances.requested_by_tenant`,
`guild_alliances.ended_by_tenant`; and `fill_offers.home_tenant`.

### Discord class A — Discord-boundary columns, NOT remapped

These columns keep real Discord IDs forever: their consumers hand the
value to Discord itself. Internal code that holds a user ID (02) and
reaches one of these boundaries resolves the Discord ID through the
`users` row — the only sanctioned conversion point.

| Column | Consumer (evidence) |
|--------|---------------------|
| `signups.discord_id` | Departure reminders build `<@id>` mentions from seat rows (`src/domains/groupings/reminder.ts`) |
| `lottery_entries.discord_id` | Winner announcement broadcasts |
| `lottery_winners.discord_id` | Winner announcement broadcasts |
| `ops_nudge_sends.recipient_ids` (JSON array values) | Targeted-nudge sends address Discord users |
| `creator_backfill_log.resolved_discord_id` | Historical audit snapshot of a resolved Discord identity |
| `guild_members.discord_id` | Roster synced from Discord; membership verdicts compare Discord IDs at the boundary (members may have no platform user row) |
| `user_guild_nicks.discord_id` | Discord-side nick snapshot, keyed by Discord user + Discord server |
| `hub_audit_log.actor` | Free-text actor label (`hub` / admin name), not a join key |

### Discord class B — internal association columns, remapped to user ID (02)

Renamed to a `*_user_id` integer column so the stored meaning is
unmistakable (the `users.discord_id` column itself keeps its name and
now-unique Discord value):

| Column | Becomes |
|--------|---------|
| `users` PK / `user_oauth.discord_id` (PK) | `users.id` (02) / `user_oauth.user_id` |
| `push_tokens.discord_id` (PK part) | `user_id` |
| `usage_counters.discord_id` (PK part) | `user_id` |
| `feedback.discord_id` | `user_id` |
| `events.creator_discord_id` | `creator_user_id` |
| `grouping_templates.creator_discord_id` | `creator_user_id` |
| `user_gear_items.discord_id` | `user_id` |
| `user_gear_builds.discord_id` | `user_id` |
| `build_share_links.discord_id` | `user_id` |
| `heirloom_item_pushes.discord_id` (PK part) | `user_id` |
| `heirloom_set_state.discord_id` (PK part) | `user_id` |
| `member_availability.discord_id` (PK part) | `user_id` |
| `guild_announcement_reads.discord_id` (PK part) | `user_id` |
| `guild_announcements.author_discord_id` | `author_user_id` |
| `guild_applications.discord_id` | `user_id` |
| `guild_applications.reviewed_by` | `reviewed_by_user_id` |
| `mentor_pairings.mentor_discord_id` / `mentee_discord_id` | `mentor_user_id` / `mentee_user_id` |
| `guild_mentors.discord_id` (PK part) | `user_id` |
| `guild_member_notes.member_discord_id` / `author_discord_id` | `member_user_id` / `author_user_id` |
| `member_season_goals.discord_id` | `user_id` |
| `guild_roster_entries.created_by` | `created_by_user_id` |
| `roster_import_batches.created_by` | `created_by_user_id` |
| `fill_offers.discord_id` | `user_id` |
| `fill_invites.from_discord_id` / `to_discord_id` | `from_user_id` / `to_user_id` |
| `guild_alliances.requested_by` | `requested_by_user_id` |
| `time_poll_votes.discord_id` | `user_id` |
| `contribution_entries.discord_id` | `user_id` |
| `contribution_rules.updated_by` | `updated_by_user_id` |
| `season_rollovers.created_by` | `created_by_user_id` |
| `season_checklist_checks.checked_by` | `checked_by_user_id` |
| `lotteries.created_by` | `created_by_user_id` |
| `time_polls.created_by` | `created_by_user_id` |
| `fill_requests.created_by` | `created_by_user_id` |

Class-B judgement calls worth a second look (treated B, flagged in
the PR): `guild_roster_entries.matched_discord_id` and
`roster_import_rows.matched_discord_id` are **kept as Discord IDs**
(class A in effect): they link a roster name to a Discord server
member who may never have registered, so no user row need exist.
`contribution_entries.dedupe_key` values are historical opaque tokens
(`attendance:<old event id>:<discord id>`); they are not remapped —
post-migration keys are minted from new IDs, a disjoint key space, so
uniqueness (their only job) is preserved.

### Entity foreign-key class — values remapped to the target's new ID

`signups.event_id`, `results.event_id`, `event_reminders.event_id`,
`signup_answers.event_id`, `signup_answers.field_id` (→ custom field),
`grouping_custom_fields.owner_id` (polymorphic: remapped through the
events map when `owner_kind = 'event'`, through the templates map
when `owner_kind = 'template'`), `short_links.event_id`,
`lotteries.source_event_id`, `fill_requests.event_id`,
`fill_invites.request_id` / `offer_id` / `event_id`,
`time_poll_options.poll_id`, `time_poll_votes.poll_id` / `option_id`,
`lottery_entries.lottery_id`, `lottery_winners.lottery_id`,
`roster_import_rows.batch_id`, `roster_import_rows.created_entry_id`
(→ roster entry), `guild_announcement_reads.announcement_id`,
`guild_announcement_translations.announcement_id`,
`ops_nudge_sends.event_id`, `contribution_entries.event_id`,
`build_share_links.build_id` (→ gear build), `creator_backfill_log.event_id`.

Explicitly NOT remapped: `member_season_goals.dungeon_id` (dungeons
are not renumbered — see held surfaces), `user_guild_nicks.guild_id`
(a *Discord server* id — an external system's key, not a tenant
reference), `users.guilds_json` (Discord server ids from OAuth),
`settings.value` (opaque per-key payloads; Discord-server bindings in
values are external keys), `tenants.discord_webhook` (external URL).

## Held surfaces （暂留） and reasons

| Surface | Reason |
|---------|--------|
| `dungeons`, `bosses` PKs | Reference catalog with no `created_at` (the day segment is underivable); written by offline data pipelines outside the Worker; never shared as user-facing identifiers (events reference dungeons by name). Flagged for a follow-up ruling. |
| `error_log`, `hub_audit_log`, `creator_backfill_log`, `season_rollovers`, `contribution_rules`, `contribution_entries`, `lottery_entries`, `lottery_winners`, `time_poll_votes`, `signup_answers`, `guild_announcement_reads`, `guild_announcement_translations`, `event_reminders` PKs | Internal row ids: never served as a GraphQL `id`, never accepted as API input, referenced by nothing. Their reference *columns* still remap. |
| Short-link codes (`short_links.code`, `build_share_links.code`) | Random base62 aliases by design; out of scope per ruling. |
| `signups.uid` | Per-seat join token; out of scope per ruling. |
| Discord-server-keyed data (`user_guild_nicks.guild_id`, `users.guilds_json`, settings binding values) | External system's key space — not ours to renumber. |
| Session/JWT contents | Carry the user ID (02) and, per request, the resolved guild ID (01). Discord IDs appear only in the OAuth callback, which resolves (or first-registers) the user row and mints the session from it. Pre-migration sessions die at deploy (one forced re-login), which the migration window accepts. |
| GuildHub Durable Object name | Stays `guild:<slug>` — the slug is the public handle and the DO name is an edge address, resolved to the guild ID before any data access. |

## Rehearsal protocol (gate for the migration)

`scripts/rehearse-id-migration.mjs` builds a production-shaped
snapshot (full chain 0001–0032 + seeded multi-guild data: seats with
Discord IDs, lotteries, alliances, fill market, gear, polls,
contributions), captures a pre-migration baseline (row counts, sample
relationship joins, and the reminder mention list for a seeded
grouping), applies migration 0033, and asserts:

1. `PRAGMA foreign_key_check` returns zero rows.
2. Every table's row count is unchanged.
3. Old↔new ID maps are bijective per renumbered table; every new ID
   parses under `parsePublicId` rules with the table's type code.
4. Sample relationships are equivalent before/after (member↔guild,
   signup↔grouping, gear↔owner, alliance pair symmetry, short-link
   target, contribution dedupe uniqueness).
5. The reminder mention list is byte-identical to the baseline and
   every mention is `<@` + a seeded real Discord ID + `>`.
6. Every tenant column value is an existing guild ID; every class-B
   user column value is an existing user ID; every class-A column is
   byte-identical to the snapshot.
