// Drizzle entity definitions for the identity domain.
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


/* ---------------- users / oauth / nicks [ddl auth.js lazy] ------------ */
export const users = sqliteTable('users', {
  discordId: text('discord_id').primaryKey(),
  username: text('username').notNull().default(''),
  avatar: text('avatar').notNull().default(''),
  guildsJson: text('guilds_json').notNull().default('[]'),
  guildsCheckedAt: integer('guilds_checked_at').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(strftime('%s','now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(strftime('%s','now'))`),
  localePref: text('locale_pref'),
});

export const userOauth = sqliteTable('user_oauth', {
  discordId: text('discord_id').primaryKey(),
  refreshToken: text('refresh_token').notNull().default(''),
  scope: text('scope').notNull().default(''),
  refreshState: text('refresh_state').notNull().default('ok'),
  lastRefreshAt: integer('last_refresh_at').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
});

export const userGuildNicks = sqliteTable('user_guild_nicks', {
  discordId: text('discord_id').notNull(),
  guildId: text('guild_id').notNull(),
  nick: text('nick').notNull().default(''),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.discordId, t.guildId] }),
]);

/* ---------------- guild roster [ddl reminder.js lazy] ----------------- */
export const guildMembers = sqliteTable('guild_members', {
  tenant: text('tenant').notNull(),
  discordId: text('discord_id').notNull(),
  nick: text('nick').notNull().default(''),
  globalName: text('global_name').notNull().default(''),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.tenant, t.discordId] }),
]);
