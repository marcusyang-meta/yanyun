// Drizzle entity definitions for the guilds domain.
// Modeled on the production schema as it exists today (see the barrel
// at src/db/schema.ts for the attestation legend). Structural change
// goes through the wrangler migration chain in migrations/ — never
// through runtime DDL; the CI drift gate keeps this model and the
// chain in lockstep.
import { sql } from 'drizzle-orm';
import {
  blob,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core';


/* ---------------- tenants [production shape attested 2026-10-27] ----
 * The seven baseline columns, plus the three profile columns added by
 * migrations/0002_tenant_profile_fields.sql. An earlier model claimed
 * master_name / logo_url / bg_image_url ([qry] attestation) before
 * DDL ever created them — they were phantom columns and profile saves
 * naming them threw in production; 0002 adds them for real, in the
 * NOT NULL DEFAULT '' caliber of the other text columns. The chain
 * and the drift gate pin this shape.
 * recruit_open [alt: 0025]: the guild's recruitment switch (1 = the
 * guild appears in the platform-home recruit directory and accepts
 * applications; 0 = neither). Default closed; owned by the guild
 * admin surface, read/written only through tenants.ts. */
export const tenants = sqliteTable('tenants', {
  slug: text('slug').primaryKey(),
  guildName: text('guild_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  announcement: text('announcement').notNull().default(''),
  createdAt: text('created_at').notNull().default(sql`(strftime('%s','now'))`),
  discordWebhook: text('discord_webhook').notNull().default(''),
  slogan: text('slogan').notNull().default(''),
  masterName: text('master_name').notNull().default(''),
  logoUrl: text('logo_url').notNull().default(''),
  bgImageUrl: text('bg_image_url').notNull().default(''),
  recruitOpen: integer('recruit_open').notNull().default(0),
});

/* ---------------- settings [ddl chain baseline] -------------------- */
export const settings = sqliteTable('settings', {
  tenant: text('tenant').notNull().default(''),
  key: text('key').notNull(),
  value: text('value').notNull().default(''),
}, (t) => [
  primaryKey({ columns: [t.tenant, t.key] }),
]);

/* ---------------- guild announcements [alt: 0010] ------------------
 * One row per broadcast posted to a guild (announcements.ts
 * repository). kind 'standard' (F9 announcement) | 'urgent' (F18
 * rally call) — one pipeline, two presentations, separate daily
 * counters. The author snapshot keeps history readable after
 * renames. */
export const guildAnnouncements = sqliteTable('guild_announcements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull(),
  kind: text('kind').notNull().default('standard'),
  title: text('title').notNull().default(''),
  body: text('body').notNull().default(''),
  authorDiscordId: text('author_discord_id').notNull().default(''),
  authorName: text('author_name').notNull().default(''),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  index('idx_guild_announcements_tenant_id').on(t.tenant, t.id),
]);

/* ---------------- announcement read receipts [alt: 0010] -----------
 * One row per (announcement, member) read (F10): a row exists only
 * once that member opened the announcement — absence IS the unread
 * state, so no boolean is stored. tenant is denormalized from the
 * announcement so every read stays guild-scoped by construction. */
export const guildAnnouncementReads = sqliteTable('guild_announcement_reads', {
  announcementId: integer('announcement_id').notNull(),
  tenant: text('tenant').notNull(),
  discordId: text('discord_id').notNull(),
  readAt: integer('read_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.announcementId, t.discordId] }),
  index('idx_guild_announcement_reads_tenant_user').on(t.tenant, t.discordId),
]);

/* ---------------- announcement translations [migration 0032] ----
 * Premium P26: one row per (announcement, target locale) with the
 * translated title/body. status 'done' | 'failed' (a failed provider
 * round keeps its row so the admin surface can show the failure);
 * source_hash pins the translation to the exact source text it was
 * generated from — a mismatch reads as stale and is never served. */
export const guildAnnouncementTranslations = sqliteTable('guild_announcement_translations', {
  announcementId: integer('announcement_id').notNull(),
  tenant: text('tenant').notNull().default(''),
  locale: text('locale').notNull().default(''),
  title: text('title').notNull().default(''),
  body: text('body').notNull().default(''),
  status: text('status').notNull().default('done'),
  sourceHash: text('source_hash').notNull().default(''),
  createdAt: integer('created_at').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.announcementId, t.locale] }),
  index('idx_guild_announcement_translations_tenant').on(t.tenant, t.announcementId),
]);

/* ---------------- translation provider cache [migration 0032] ---
 * Cross-announcement cache for the translation provider seam:
 * (hash of source locale + exact source text, target locale) ->
 * translated text. Only successful translations land here, so the
 * same text is never paid for twice. */
export const translationCache = sqliteTable('translation_cache', {
  sourceHash: text('source_hash').notNull(),
  targetLocale: text('target_locale').notNull().default(''),
  translatedText: text('translated_text').notNull().default(''),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.sourceHash, t.targetLocale] }),
]);

/* ---------------- season checklist state [migration 0022] --------
 * Per-guild check-off state for the backend-composed pre-season
 * checklist. Items themselves are NOT stored (composed per request
 * from live season data); season_key is the backend-derived season
 * identity "<versionCode>:<seasonCode>", so a new season starts
 * unchecked by construction. */
export const seasonChecklistChecks = sqliteTable('season_checklist_checks', {
  tenant: text('tenant').notNull(),
  seasonKey: text('season_key').notNull(),
  itemKey: text('item_key').notNull(),
  checked: integer('checked').notNull().default(0),
  checkedBy: text('checked_by').notNull().default(''),
  checkedByName: text('checked_by_name').notNull().default(''),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.tenant, t.seasonKey, t.itemKey] }),
]);

/* ---------------- guild game-name roster [migration 0023] ----------
 * The guild's game-name roster, orthogonal to guild_members: entries
 * carry a display name (typically read off a member-list screenshot)
 * and, when the name matched a Discord roster member at import time,
 * that member's Discord id as a LINK — never as membership. Nothing
 * here creates or alters guild_members / users rows. name_norm is the
 * backend normalization used for matching and dedupe (unique per
 * guild). */
export const guildRosterEntries = sqliteTable('guild_roster_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull(),
  displayName: text('display_name').notNull(),
  nameNorm: text('name_norm').notNull(),
  source: text('source').notNull().default('ocr'),
  matchedDiscordId: text('matched_discord_id'),
  createdBy: text('created_by').notNull().default(''),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  uniqueIndex('guild_roster_entries_tenant_norm_unique').on(t.tenant, t.nameNorm),
  index('idx_guild_roster_entries_tenant').on(t.tenant),
]);

/* ---------------- roster import batches [migration 0023] -----------
 * One uploaded screenshot batch awaiting (or past) admin confirmation.
 * Recognition is metered through the existing batch-OCR daily counter
 * (usage_counters), not through this table. */
export const rosterImportBatches = sqliteTable('roster_import_batches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull(),
  createdBy: text('created_by').notNull().default(''),
  status: text('status').notNull().default('pending'),
  imageCount: integer('image_count').notNull().default(0),
  createdAt: integer('created_at').notNull().default(0),
  confirmedAt: integer('confirmed_at'),
}, (t) => [
  index('idx_roster_import_batches_tenant').on(t.tenant, t.createdAt),
]);

/* ---------------- roster import rows [migration 0023] --------------
 * The recognition preview: one row per recognized line, classified by
 * the backend as matched / new / unrecognized. created_entry_id is set
 * when (and only when) an admin confirms that row into the roster. */
export const rosterImportRows = sqliteTable('roster_import_rows', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  batchId: integer('batch_id').notNull(),
  tenant: text('tenant').notNull(),
  rawName: text('raw_name').notNull().default(''),
  nameNorm: text('name_norm').notNull().default(''),
  status: text('status').notNull().default('new'),
  matchedDiscordId: text('matched_discord_id'),
  matchedName: text('matched_name').notNull().default(''),
  createdEntryId: integer('created_entry_id'),
}, (t) => [
  index('idx_roster_import_rows_batch').on(t.batchId),
  index('idx_roster_import_rows_tenant').on(t.tenant),
]);

/* ---------------- guild applications [migration 0013] -------------
 * Recruitment applications (F16): one row per application a logged-in
 * non-member filed against a guild, carrying the full state machine
 * (pending -> approved | rejected) and its review trail. The dedupe
 * rule (one PENDING application per guild + applicant) is a partial
 * unique index in the chain; the .where() below keeps the model
 * faithful to it (the drift gate compares name/unique/columns). */
export const guildApplications = sqliteTable('guild_applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull().default(''),
  discordId: text('discord_id').notNull().default(''),
  applicantName: text('applicant_name').notNull().default(''),
  message: text('message').notNull().default(''),
  status: text('status').notNull().default('pending'),
  reviewedBy: text('reviewed_by').notNull().default(''),
  reviewedByName: text('reviewed_by_name').notNull().default(''),
  createdAt: integer('created_at').notNull().default(0),
  reviewedAt: integer('reviewed_at'),
}, (t) => [
  index('idx_guild_applications_tenant').on(t.tenant, t.id),
  uniqueIndex('guild_applications_pending_unique').on(t.tenant, t.discordId)
    .where(sql`status = 'pending'`),
]);

/* ---------------- mentor pairings [migration 0014] ----------------
 * Mentor pairings (F17): one row per admin-created pairing, 'active'
 * until an admin ends it ('ended'); rows are never deleted. The
 * one-ACTIVE-pairing-per-mentee rule is a partial unique index in
 * the chain, modeled with .where() as above. */
export const mentorPairings = sqliteTable('mentor_pairings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull().default(''),
  mentorDiscordId: text('mentor_discord_id').notNull().default(''),
  mentorName: text('mentor_name').notNull().default(''),
  menteeDiscordId: text('mentee_discord_id').notNull().default(''),
  menteeName: text('mentee_name').notNull().default(''),
  status: text('status').notNull().default('active'),
  createdBy: text('created_by').notNull().default(''),
  createdAt: integer('created_at').notNull().default(0),
  endedAt: integer('ended_at'),
}, (t) => [
  index('idx_mentor_pairings_tenant').on(t.tenant, t.id),
  uniqueIndex('mentor_pairings_active_mentee_unique').on(t.tenant, t.menteeDiscordId)
    .where(sql`status = 'active'`),
]);

/* ---------------- guild mentors [migration 0015] ------------------
 * The designated mentor pool (F17): a row exists only while an admin
 * designates that member as a mentor candidate (absence IS the
 * undesignated state, announcement-reads caliber). */
export const guildMentors = sqliteTable('guild_mentors', {
  tenant: text('tenant').notNull().default(''),
  discordId: text('discord_id').notNull().default(''),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.tenant, t.discordId] }),
]);

/* ---------------- guild member notes [alt: 0016] ------------------
 * One row per officer note about a guild member (F12, membernotes.ts
 * repository). Admin-side only: no member-facing surface reads this
 * entity. The author snapshot keeps history readable after renames. */
export const guildMemberNotes = sqliteTable('guild_member_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull(),
  memberDiscordId: text('member_discord_id').notNull(),
  body: text('body').notNull().default(''),
  authorDiscordId: text('author_discord_id').notNull().default(''),
  authorName: text('author_name').notNull().default(''),
  createdAt: integer('created_at').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  index('idx_guild_member_notes_tenant_member').on(t.tenant, t.memberDiscordId, t.id),
]);

/* ---------------- member season goals [alt: 0017] -----------------
 * One row per season goal a member keeps for themselves in one guild
 * (F19, seasongoals.ts repository). status is the member's own
 * bookkeeping ('active' | 'done' | 'dropped'); dungeonId optionally
 * binds the goal to an existing dex dungeon row — null is a plain
 * text goal. memberName is the owner's display snapshot. */
export const memberSeasonGoals = sqliteTable('member_season_goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull(),
  discordId: text('discord_id').notNull(),
  memberName: text('member_name').notNull().default(''),
  title: text('title').notNull().default(''),
  note: text('note').notNull().default(''),
  status: text('status').notNull().default('active'),
  dungeonId: integer('dungeon_id'),
  createdAt: integer('created_at').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  index('idx_member_season_goals_tenant_user').on(t.tenant, t.discordId, t.id),
  index('idx_member_season_goals_tenant_id').on(t.tenant, t.id),
]);

/* ---------------- fill offers [migration 0030] --------------------
 * P19 supply edge (free): one row per fill-in offer, keyed to the
 * person (discord_id), not to a guild — home_tenant only records
 * where they published from. windows_json is the F5 availability
 * caliber (UTC minutes of day). Status 'open' | 'withdrawn'; the
 * one-open-offer-per-person rule is the partial unique index. */
export const fillOffers = sqliteTable('fill_offers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  discordId: text('discord_id').notNull().default(''),
  displayName: text('display_name').notNull().default(''),
  homeTenant: text('home_tenant').notNull().default(''),
  school: text('school').notNull().default(''),
  windowsJson: text('windows_json').notNull().default('[]'),
  note: text('note').notNull().default(''),
  status: text('status').notNull().default('open'),
  createdAt: integer('created_at').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  index('idx_fill_offers_status').on(t.status, t.id),
  uniqueIndex('fill_offers_open_unique').on(t.discordId)
    .where(sql`status = 'open'`),
]);

/* ---------------- fill requests [migration 0030] ------------------
 * P19 demand edge (T3): one row per fill request a guild's leader /
 * admin posted against one of its own groupings. Status machine
 * 'open' -> 'matched' | 'closed', terminal rows keep matched_at /
 * closed_at as the trail. */
export const fillRequests = sqliteTable('fill_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull().default(''),
  eventId: integer('event_id').notNull().default(0),
  neededRole: text('needed_role').notNull().default(''),
  neededSchool: text('needed_school').notNull().default(''),
  note: text('note').notNull().default(''),
  status: text('status').notNull().default('open'),
  createdBy: text('created_by').notNull().default(''),
  createdByName: text('created_by_name').notNull().default(''),
  createdAt: integer('created_at').notNull().default(0),
  matchedAt: integer('matched_at'),
  closedAt: integer('closed_at'),
}, (t) => [
  index('idx_fill_requests_tenant').on(t.tenant, t.id),
  index('idx_fill_requests_event').on(t.eventId, t.status),
]);

/* ---------------- fill invites [migration 0030] -------------------
 * P19 matching: one row per invitation from a request to a supplier.
 * Status 'pending' -> 'accepted' | 'declined' | 'expired' (settled
 * by the request-side transitions). The partial unique index states
 * one live (pending/accepted) invite per (request, supplier). */
export const fillInvites = sqliteTable('fill_invites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  requestId: integer('request_id').notNull().references(() => fillRequests.id, { onDelete: 'cascade' }),
  offerId: integer('offer_id').notNull().references(() => fillOffers.id, { onDelete: 'cascade' }),
  tenant: text('tenant').notNull().default(''),
  eventId: integer('event_id').notNull().default(0),
  fromDiscordId: text('from_discord_id').notNull().default(''),
  fromName: text('from_name').notNull().default(''),
  toDiscordId: text('to_discord_id').notNull().default(''),
  toName: text('to_name').notNull().default(''),
  status: text('status').notNull().default('pending'),
  createdAt: integer('created_at').notNull().default(0),
  respondedAt: integer('responded_at'),
}, (t) => [
  uniqueIndex('fill_invites_pair_unique').on(t.requestId, t.toDiscordId)
    .where(sql`status IN ('pending', 'accepted')`),
  index('idx_fill_invites_request').on(t.requestId, t.status),
  index('idx_fill_invites_supplier').on(t.toDiscordId, t.status, t.id),
]);

/* ---------------- guild alliances [migration 0031] ----------------
 * P20: one row per UNORDERED guild pair — guild_low / guild_high
 * are the two slugs in lexicographic order (the symmetric storage
 * rule); who initiated is a fact on the row. Status machine
 * 'pending' -> 'active' | 'rejected'; 'active' -> 'ended'. The
 * partial unique index states one live relation per pair. */
export const guildAlliances = sqliteTable('guild_alliances', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  guildLow: text('guild_low').notNull().default(''),
  guildHigh: text('guild_high').notNull().default(''),
  status: text('status').notNull().default('pending'),
  requestedByTenant: text('requested_by_tenant').notNull().default(''),
  requestedBy: text('requested_by').notNull().default(''),
  requestedByName: text('requested_by_name').notNull().default(''),
  createdAt: integer('created_at').notNull().default(0),
  respondedAt: integer('responded_at'),
  endedAt: integer('ended_at'),
  endedByTenant: text('ended_by_tenant').notNull().default(''),
}, (t) => [
  uniqueIndex('guild_alliances_live_unique').on(t.guildLow, t.guildHigh)
    .where(sql`status IN ('pending', 'active')`),
  index('idx_guild_alliances_low').on(t.guildLow, t.status, t.id),
  index('idx_guild_alliances_high').on(t.guildHigh, t.status, t.id),
]);

/* ---------------- guild custom domains [migration 0033] ----------
 * One row per guild that bound its own domain (P23, white-label
 * tier B): hostname is globally unique, status is the binding
 * state machine (pending | active | disabled), verify_token is
 * the ownership-proof secret the admin publishes as a TXT record.
 * Repository + verdicts live in customdomain.ts. */
export const guildCustomDomains = sqliteTable('guild_custom_domains', {
  tenant: text('tenant').primaryKey(),
  hostname: text('hostname').notNull(),
  status: text('status').notNull().default('pending'),
  verifyToken: text('verify_token').notNull().default(''),
  createdBy: text('created_by').notNull().default(''),
  createdAt: integer('created_at').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
  verifiedAt: integer('verified_at'),
}, (t) => [
  uniqueIndex('guild_custom_domains_hostname_unique').on(t.hostname),
  index('idx_guild_custom_domains_status').on(t.status),
]);

/* ---------------- guild gear standards [migration 0034] ----------
 * One row per readiness threshold a guild admin sets for a scene
 * (P9 gear readiness board, premium insights line). minScore is the
 * minimum build graduation score in percent (0..100) read off a
 * member's best saved gear build snapshot (gear domain). The board
 * is computed at read time; this entity stores only the admin-set
 * lines, never member results (freeze-not-delete on lapse). */
export const guildGearStandards = sqliteTable('guild_gear_standards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull(),
  label: text('label').notNull().default(''),
  minScore: integer('min_score').notNull().default(0),
  createdBy: text('created_by').notNull().default(''),
  createdAt: integer('created_at').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  index('idx_guild_gear_standards_tenant').on(t.tenant, t.id),
]);

/* ---------------- guild avatars [ddl chain baseline] --------------- */
export const guildAvatars = sqliteTable('guild_avatars', {
  tenant: text('tenant').primaryKey(),
  contentType: text('content_type').notNull(),
  // D1 returns BLOB values as ArrayBuffer; the repository boundary
  // normalizes to Uint8Array for callers.
  bytes: blob('bytes', { mode: 'buffer' }).notNull(),
  hash: text('hash').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

/* ---------------- ops nudge sends [migration 0028] ---------------
 * One row per targeted-nudge send (P8): the row is both the
 * frequency-control record (daily cap + per-event cooldown are
 * judged from these rows) and the audit trail. recipient_ids is a
 * JSON array of Discord ids the send targeted. */
export const opsNudgeSends = sqliteTable('ops_nudge_sends', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull(),
  eventId: integer('event_id').notNull(),
  segmentKind: text('segment_kind').notNull().default('all'),
  segmentValue: text('segment_value').notNull().default(''),
  recipientCount: integer('recipient_count').notNull().default(0),
  recipientIds: text('recipient_ids').notNull().default('[]'),
  sentBy: text('sent_by').notNull().default(''),
  sentAt: integer('sent_at').notNull().default(0),
}, (t) => [
  index('idx_ops_nudge_sends_tenant_at').on(t.tenant, t.sentAt),
  index('idx_ops_nudge_sends_tenant_event').on(t.tenant, t.eventId, t.sentAt),
]);

/* ---------------- season rollovers [migration 0028] --------------
 * One row per EXECUTED season rollover (P12). Previews are computed
 * live and never stored; only an admin-confirmed execution leaves
 * this trace, with the full report as JSON. */
export const seasonRollovers = sqliteTable('season_rollovers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull(),
  fromSeasonKey: text('from_season_key').notNull().default(''),
  toSeasonKey: text('to_season_key').notNull().default(''),
  templatesCopied: integer('templates_copied').notNull().default(0),
  reportJson: text('report_json').notNull().default('{}'),
  createdBy: text('created_by').notNull().default(''),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  index('idx_season_rollovers_tenant').on(t.tenant, t.id),
]);

/* ---------------- contribution rules [migration 0028] ------------
 * Per-guild point values per action (P14). One row per (guild,
 * action); absence of a row means the backend default applies.
 * Actions are platform events only (attendance / leading /
 * mentoring) — points only, no goods or donation concepts. */
export const contributionRules = sqliteTable('contribution_rules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull(),
  actionKey: text('action_key').notNull(),
  points: integer('points').notNull().default(0),
  enabled: integer('enabled').notNull().default(1),
  updatedBy: text('updated_by').notNull().default(''),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  uniqueIndex('contribution_rules_tenant_action_unique').on(t.tenant, t.actionKey),
]);

/* ---------------- contribution entries [migration 0028] ----------
 * The points ledger (P14): one row per credited platform event,
 * points frozen at accrual time. dedupe_key is unique, so one event
 * can never credit the same member twice for the same action. */
export const contributionEntries = sqliteTable('contribution_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull(),
  discordId: text('discord_id').notNull(),
  actionKey: text('action_key').notNull(),
  points: integer('points').notNull().default(0),
  eventId: integer('event_id'),
  dedupeKey: text('dedupe_key').notNull(),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  uniqueIndex('contribution_entries_dedupe_unique').on(t.dedupeKey),
  index('idx_contribution_entries_tenant_user').on(t.tenant, t.discordId, t.id),
  index('idx_contribution_entries_tenant').on(t.tenant, t.id),
]);
