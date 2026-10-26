// Drizzle entity definitions for the groupings domain.
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

/* ---------------- short_links [lazy DDL in shortlinks.ts] -------------
 * Share-link aliases: one stable random code per grouping (car).
 * code is the public alias (base62, 7 chars, random — never derived
 * from the sequential event id); (tenant, event_id) is unique so a
 * car mints exactly one code and reuses it forever. */
export const shortLinks = sqliteTable('short_links', {
  code: text('code').primaryKey(),
  tenant: text('tenant').notNull().default(''),
  eventId: integer('event_id').notNull(),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  uniqueIndex('short_links_target_unique').on(t.tenant, t.eventId),
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
