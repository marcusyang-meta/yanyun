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
  readyAt: integer('ready_at'),
}, (t) => [
  uniqueIndex('signups_event_uid_unique').on(t.eventId, t.uid),
  index('idx_signups_event').on(t.eventId),
]);

/* ---------------- grouping_templates [lazy DDL in templates.ts] -------
 * Guild-shared car templates: a saved grouping configuration (type,
 * dungeon, seats, title, departure offset) that guild members can
 * apply to prefill the create form. Guild-scoped (tenant), created by
 * a member; only the creator or an admin of the template's own guild
 * may edit or delete it (the grouping manage verdict on tenant +
 * creator_discord_id). start_minutes is the local time-of-day
 * (hour*60+minute in the saver's timezone) and start_days_ahead the
 * day offset, so a template never carries a stale absolute date. */
export const groupingTemplates = sqliteTable('grouping_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull().default(''),
  name: text('name').notNull().default(''),
  type: text('type').notNull().default('activity'),
  title: text('title').notNull().default(''),
  dungeon: text('dungeon').notNull().default(''),
  maxSlots: integer('max_slots').notNull().default(10),
  startDaysAhead: integer('start_days_ahead').notNull().default(0),
  startMinutes: integer('start_minutes').notNull().default(1200),
  creatorDiscordId: text('creator_discord_id'),
  createdAt: integer('created_at').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  index('idx_grouping_templates_tenant').on(t.tenant),
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

/* ---------------- event_reminders [lazy DDL in the events repository] --
 * Per-(grouping, offset) departure-reminder settlement for multi-offset
 * reminders: one row per settled beat; no row = that beat is still
 * pending. sent_at set = delivered; error set = failed (settled, never
 * retried). The legacy events.reminder_sent_at / reminder_error pair
 * stays the whole-grouping settlement mark, written when the grouping's
 * last pending beat settles. */
export const eventReminders = sqliteTable('event_reminders', {
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  offsetMin: integer('offset_min').notNull(),
  sentAt: integer('sent_at'),
  error: text('error'),
}, (t) => [
  primaryKey({ columns: [t.eventId, t.offsetMin] }),
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
