// Drizzle schema: the data layer's single source of truth for every D1
// entity (phase 1 of the backend TS + Drizzle migration, 2026-10-26).
//
// This file MODELS the production schema as it exists today; it does not
// change it. Migration execution discipline is unchanged: structural
// changes are applied Worker-side through the versioned lazy-DDL ledger
// (the deploy token has no D1 API permission), never via drizzle-kit.
//
// Attestation per entity (where the shape was verified from):
//   [ddl]  CREATE TABLE in src lazy DDL, schema.sql, or migrate-v*.sql
//   [alt]  plus ALTER TABLE ... ADD COLUMN in src / migrate files
//   [qry]  columns attested only by queries in src (no DDL survives in the
//          repo; the columns exist in production and are read/written by
//          live code paths) — modeled nullable unless a query proves more
//
// Column order follows the historical DDL so generated statements keep
// the legacy bind order.
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
  featureFixedTeams: integer('feature_fixed_teams'),
});

/* ---------------- events [ddl schema.sql; alt v3/v4 + lazy creator/
   reminder columns] ---------------- */
export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull().default(''),
  title: text('title').notNull(),
  type: text('type').notNull().default('activity'),
  description: text('description').notNull().default(''),
  startsAt: text('starts_at'),
  meetInfo: text('meet_info').notNull().default(''),
  maxSlots: integer('max_slots').notNull().default(20),
  status: text('status').notNull().default('open'),
  startsAtUtc: integer('starts_at_utc'),
  origin: text('origin').notNull().default('admin'),
  createdBy: text('created_by').notNull().default(''),
  manageCode: text('manage_code').notNull().default(''),
  dungeon: text('dungeon').notNull().default(''),
  creatorDiscordId: text('creator_discord_id'),
  reminderSentAt: integer('reminder_sent_at'),
  reminderError: text('reminder_error'),
}, (t) => [
  index('idx_events_tenant').on(t.tenant, t.type, t.status),
  index('idx_events_utc').on(t.tenant, t.startsAtUtc),
]);

/* ---------------- signups [ddl schema.sql; alt lazy discord_id] -------- */
export const signups = sqliteTable('signups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  nickname: text('nickname').notNull(),
  uid: text('uid').notNull(),
  role: text('role').notNull().default('随意'),
  weapon: text('weapon').notNull().default(''),
  contact: text('contact').notNull().default(''),
  note: text('note').notNull().default(''),
  teamName: text('team_name').notNull().default(''),
  members: text('members').notNull().default(''),
  createdAt: text('created_at').notNull().default(sql`(strftime('%s','now'))`),
  discordId: text('discord_id'),
}, (t) => [
  uniqueIndex('signups_event_uid_unique').on(t.eventId, t.uid),
  index('idx_signups_event').on(t.eventId),
]);

/* ---------------- results [ddl schema.sql] ---------------------------- */
export const results = sqliteTable('results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  teamName: text('team_name').notNull(),
  members: text('members').notNull().default(''),
  timeMs: integer('time_ms').notNull(),
  proofUrl: text('proof_url').notNull().default(''),
  note: text('note').notNull().default(''),
  createdAt: text('created_at').notNull().default(sql`(strftime('%s','now'))`),
}, (t) => [
  index('idx_results_event').on(t.eventId, t.timeMs),
]);

/* ---------------- settings [ddl schema.sql / v2 rebuild] -------------- */
export const settings = sqliteTable('settings', {
  tenant: text('tenant').notNull().default(''),
  key: text('key').notNull(),
  value: text('value').notNull().default(''),
}, (t) => [
  primaryKey({ columns: [t.tenant, t.key] }),
]);

/* ---------------- bosses [ddl schema.sql; alt v4 dungeon, v5 guide,
   lazy structured json columns] ---------------- */
export const bosses = sqliteTable('bosses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  talent: text('talent').notNull().default(''),
  source: text('source').notNull().default(''),
  note: text('note').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  dungeon: text('dungeon').notNull().default(''),
  guide: text('guide').notNull().default(''),
  mechanicsJson: text('mechanics_json'),
  talentsJson: text('talents_json'),
  shoutsJson: text('shouts_json'),
});

/* ---------------- dungeons [ddl v4; alt v6 video, lazy dex columns] --- */
export const dungeons = sqliteTable('dungeons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  size: integer('size').notNull().default(10),
  isCurrent: integer('is_current').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  videoUrl: text('video_url').notNull().default(''),
  videoTitle: text('video_title').notNull().default(''),
  season: text('season'),
  category: text('category'),
  level: integer('level'),
});

/* ---------------- affix_max [ddl schema.sql] -------------------------- */
export const affixMax = sqliteTable('affix_max', {
  affixKey: text('affix_key').primaryKey(),
  nameCn: text('name_cn').notNull(),
  maxValue: real('max_value').notNull(),
  unit: text('unit').default(''),
});

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

/* ---------------- school reference data [ddl v8] ---------------------- */
export const schoolBis = sqliteTable('school_bis', {
  school: text('school').primaryKey(),
  attr: text('attr'),
  rate: text('rate'),
  bisJson: text('bis_json').notNull(),
  updatedAt: integer('updated_at').default(sql`(strftime('%s','now'))`),
});

export const schoolRotations = sqliteTable('school_rotations', {
  school: text('school').primaryKey(),
  rotationJson: text('rotation_json').notNull(),
  updatedAt: integer('updated_at').default(sql`(strftime('%s','now'))`),
});

/* ---------------- schools / slot_affix [qry only: read-only reference
   data seeded by the gear data pipelines; no DDL survives in the repo] -- */
export const schools = sqliteTable('schools', {
  name: text('name'),
  slug: text('slug').primaryKey(),
  short: text('short'),
  family: text('family'),
  color: text('color'),
  attr: text('attr'),
  talentDesc: text('talent_desc'),
});

export const slotAffix = sqliteTable('slot_affix', {
  build: text('build').notNull(),
  slot: text('slot').notNull(),
  affixKey: text('affix_key').notNull(),
}, (t) => [
  primaryKey({ columns: [t.build, t.slot, t.affixKey] }),
]);

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

/* ---------------- push tokens [ddl push.js lazy] ---------------------- */
export const pushTokens = sqliteTable('push_tokens', {
  discordId: text('discord_id').notNull(),
  token: text('token').notNull(),
  platform: text('platform').notNull().default(''),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.discordId, t.token] }),
]);

/* ---------------- error log [ddl errorlog.js lazy] -------------------- */
export const errorLog = sqliteTable('error_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  at: integer('at').notNull(),
  source: text('source').notNull().default(''),
  name: text('name').notNull().default(''),
  message: text('message').notNull().default(''),
  tenant: text('tenant').notNull().default(''),
  context: text('context').notNull().default(''),
  stack: text('stack').notNull().default(''),
}, (t) => [
  index('idx_error_log_at').on(t.at),
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

/* ---------------- gear library [ddl gearstore.js lazy] ---------------- */
export const userGearItems = sqliteTable('user_gear_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  discordId: text('discord_id').notNull(),
  slot: text('slot').notNull().default(''),
  name: text('name').notNull().default(''),
  payload: text('payload').notNull().default('{}'),
  createdAt: integer('created_at').notNull().default(0),
});

export const userGearBuilds = sqliteTable('user_gear_builds', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  discordId: text('discord_id').notNull(),
  name: text('name').notNull().default(''),
  targetIdx: integer('target_idx').notNull().default(0),
  payload: text('payload').notNull().default('{}'),
  createdAt: integer('created_at').notNull().default(0),
});

/* ---------------- heirloom push state [ddl heirloompush.js lazy] ------ */
export const heirloomItemPushes = sqliteTable('heirloom_item_pushes', {
  tenant: text('tenant').notNull(),
  discordId: text('discord_id').notNull(),
  buildSig: text('build_sig').notNull(),
  itemHash: text('item_hash').notNull(),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.tenant, t.discordId, t.buildSig, t.itemHash] }),
]);

export const heirloomSetState = sqliteTable('heirloom_set_state', {
  tenant: text('tenant').notNull(),
  discordId: text('discord_id').notNull(),
  buildSig: text('build_sig').notNull(),
  complete: integer('complete').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.tenant, t.discordId, t.buildSig] }),
]);

/* ---------------- creator backfill audit [ddl creatorbackfill.js lazy;
   alt lazy detail] ---------------- */
export const creatorBackfillLog = sqliteTable('creator_backfill_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull(),
  tenant: text('tenant'),
  seatNickname: text('seat_nickname'),
  resolvedDiscordId: text('resolved_discord_id'),
  outcome: text('outcome').notNull(),
  reason: text('reason'),
  createdAt: integer('created_at').notNull().default(0),
  detail: text('detail'),
});
