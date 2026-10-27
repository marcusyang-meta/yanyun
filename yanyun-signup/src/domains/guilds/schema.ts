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
