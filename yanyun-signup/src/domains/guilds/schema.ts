// Drizzle entity definitions for the guilds domain.
// Modeled on the production schema as it exists today (see the barrel
// at src/db/schema.ts for the attestation legend); structural change
// still goes through Worker-side lazy DDL, never drizzle-kit.
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


/* ---------------- tenants [ddl schema.sql + v7 alt; slogan/master_name/
   logo_url/feature_fixed_teams qry] ---------------- */
export const tenants = sqliteTable('tenants', {
  slug: text('slug').primaryKey(),
  guildName: text('guild_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  announcement: text('announcement').notNull().default(''),
  createdAt: text('created_at').notNull().default(sql`(strftime('%s','now'))`),
  discordWebhook: text('discord_webhook').notNull().default(''),
  // [qry] no DDL in repo; read as strings / bound as 1|0 flag in worker.js
  slogan: text('slogan'),
  masterName: text('master_name'),
  logoUrl: text('logo_url'),
  bgImageUrl: text('bg_image_url'),
  featureFixedTeams: integer('feature_fixed_teams'),
});

/* ---------------- settings [ddl schema.sql / v2 rebuild] -------------- */
export const settings = sqliteTable('settings', {
  tenant: text('tenant').notNull().default(''),
  key: text('key').notNull(),
  value: text('value').notNull().default(''),
}, (t) => [
  primaryKey({ columns: [t.tenant, t.key] }),
]);

/* ---------------- fixed teams [ddl v7] -------------------------------- */
export const fixedTeams = sqliteTable('fixed_teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  createdAt: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
}, (t) => [
  index('idx_fixed_teams_tenant').on(t.tenant),
]);

export const fixedTeamMembers = sqliteTable('fixed_team_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  teamId: integer('team_id').notNull().references(() => fixedTeams.id, { onDelete: 'cascade' }),
  nickname: text('nickname').notNull(),
  weapon: text('weapon').notNull().default(''),
  role: text('role').notNull().default(''),
  note: text('note').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => [
  index('idx_ftm_team').on(t.teamId),
]);

/* ---------------- guild avatars [ddl guildavatar.js lazy] -------------- */
export const guildAvatars = sqliteTable('guild_avatars', {
  tenant: text('tenant').primaryKey(),
  contentType: text('content_type').notNull(),
  // D1 returns BLOB values as ArrayBuffer; the repository boundary
  // normalizes to Uint8Array for callers.
  bytes: blob('bytes', { mode: 'buffer' }).notNull(),
  hash: text('hash').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
