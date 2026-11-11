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

/* ------------- agent-native OAuth (MCP) [ddl 0042] -------------- */
// The platform runs a small OAuth 2.1 authorization server for the
// MCP endpoint: MCP clients register dynamically (oauth_clients,
// public clients — code flow + PKCE S256 only, no secrets), members
// authorize them through the platform consent page behind their
// Discord login (oauth_auth_codes, hash-only, 10-minute, single
// use), and each resulting grant is one user_agent_tokens row
// holding the SHA-256 hashes of its access + refresh pair. The
// plaintext tokens exist only in the token endpoint's response.
// Revocation sets revoked_at; rotation rewrites the hashes in
// place. `source` is an open issuance-path tag ('oauth').
export const oauthClients = sqliteTable('oauth_clients', {
  id: integer('id').primaryKey(),
  clientId: text('client_id').notNull().unique(),
  clientName: text('client_name').notNull().default(''),
  redirectUris: text('redirect_uris').notNull().default('[]'),
  scopes: text('scopes').notNull().default('read'),
  createdAt: integer('created_at').notNull().default(0),
});

export const oauthAuthCodes = sqliteTable('oauth_auth_codes', {
  id: integer('id').primaryKey(),
  codeHash: text('code_hash').notNull().unique(),
  clientId: text('client_id').notNull(),
  userId: integer('user_id').notNull(),
  scopes: text('scopes').notNull().default('read'),
  codeChallenge: text('code_challenge').notNull(),
  redirectUri: text('redirect_uri').notNull(),
  resource: text('resource'),
  expiresAt: integer('expires_at').notNull(),
  usedAt: integer('used_at'),
  createdAt: integer('created_at').notNull().default(0),
});

export const userAgentTokens = sqliteTable('user_agent_tokens', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull(),
  clientId: text('client_id'),
  clientName: text('client_name').notNull().default(''),
  name: text('name').notNull().default(''),
  source: text('source').notNull().default('oauth'),
  scopes: text('scopes').notNull().default('read'),
  accessTokenHash: text('access_token_hash').notNull().unique(),
  accessPrefix: text('access_prefix').notNull().default(''),
  refreshTokenHash: text('refresh_token_hash').unique(),
  refreshPrefix: text('refresh_prefix').notNull().default(''),
  accessExpiresAt: integer('access_expires_at').notNull().default(0),
  createdAt: integer('created_at').notNull().default(0),
  lastUsedAt: integer('last_used_at'),
  revokedAt: integer('revoked_at'),
}, (t) => [
  index('idx_user_agent_tokens_user').on(t.userId),
]);

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
