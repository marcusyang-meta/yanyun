// Drizzle entity definitions for the identity domain.
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


/* ---------------- users / oauth / nicks [ddl chain baseline] ------- */
export const users = sqliteTable('users', {
  // Typed public ID primary key (migration 0036, code 02); discord_id
  // is demoted to the UNIQUE identity column, resolved only at the
  // login boundary. Every other table's user reference points at id.
  id: integer('id').primaryKey(),
  discordId: text('discord_id').notNull().unique(),
  username: text('username').notNull().default(''),
  avatar: text('avatar').notNull().default(''),
  guildsJson: text('guilds_json').notNull().default('[]'),
  guildsCheckedAt: integer('guilds_checked_at').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(strftime('%s','now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(strftime('%s','now'))`),
  localePref: text('locale_pref'),
  // IANA timezone of the member's most recent signed-in request
  // (migration 0040), captured from the x-tz header, change-only.
  // NULL = never captured. Aggregate-only: it feeds the car home-zone
  // resolution (creator ring + guild mode ring) and is never exposed
  // as a per-member field on a surface. [alt 0040]
  lastTz: text('last_tz'),
  // Account self-service deletion (migration 0003): epoch seconds of
  // the deletion request; NULL = no pending deletion (7-day cooling-off
  // runs from this timestamp). [alt 0003]
  deletionRequestedAt: integer('deletion_requested_at'),
  // Epoch seconds of the last completed Discord OAuth round trip;
  // export / deletion submission require one no older than 10 minutes.
  // [alt 0003]
  freshAuthAt: integer('fresh_auth_at'),
});

export const userOauth = sqliteTable('user_oauth', {
  userId: integer('user_id').primaryKey(),
  refreshToken: text('refresh_token').notNull().default(''),
  scope: text('scope').notNull().default(''),
  refreshState: text('refresh_state').notNull().default('ok'),
  lastRefreshAt: integer('last_refresh_at').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
});

/* ------------- calendar feed tokens [ddl 0041] ------------------ */
// One row per member: the bearer token for the member's personal
// iCalendar subscription feed (migration 0041). The token is the
// credential — unguessable, unique, resettable from personal
// settings (overwrite in place). The feed serves only this
// member's own signed-up, not-yet-ended cars.
export const userCalendarTokens = sqliteTable('user_calendar_tokens', {
  userId: integer('user_id').primaryKey(),
  token: text('token').notNull().unique(),
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

/* ---------------- guild roster [ddl chain baseline] ---------------- */
export const guildMembers = sqliteTable('guild_members', {
  tenant: integer('tenant').notNull(),
  discordId: text('discord_id').notNull(),
  nick: text('nick').notNull().default(''),
  globalName: text('global_name').notNull().default(''),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.tenant, t.discordId] }),
]);
