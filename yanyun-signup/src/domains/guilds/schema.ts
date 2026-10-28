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
 * and the drift gate pin this shape. */
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
