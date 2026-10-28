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
