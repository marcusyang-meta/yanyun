// Drizzle entity definitions for the groupings domain.
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


/* ---------------- events [ddl chain baseline] ---------------------- */
export const events = sqliteTable('events', {
  id: integer('id').primaryKey(),
  tenant: integer('tenant').notNull().default(0),
  title: text('title').notNull(),
  type: text('type').notNull().default('activity'),
  description: text('description').notNull().default(''),
  startsAt: text('starts_at'),
  meetInfo: text('meet_info').notNull().default(''),
  maxSlots: integer('max_slots').notNull().default(20),
  status: text('status').notNull().default('open'),
  // Present in production since the table's first (pre-repo) creation
  // but missing from the model until the 2026-10-27 shape audit; the
  // baseline migration now carries it. No repository reads or writes
  // it — the database default fills it.
  createdAt: text('created_at').notNull().default(sql`datetime('now')`),
  startsAtUtc: integer('starts_at_utc'),
  origin: text('origin').notNull().default('admin'),
  createdBy: text('created_by').notNull().default(''),
  manageCode: text('manage_code').notNull().default(''),
  dungeon: text('dungeon').notNull().default(''),
  creatorUserId: integer('creator_user_id'),
  reminderSentAt: integer('reminder_sent_at'),
  reminderError: text('reminder_error'),
  // Ally sharing [alt: 0032]: leader-flagged visibility to allied
  // guilds + the leader-controlled visitor-seat quota (0 = closed).
  allyVisible: integer('ally_visible').notNull().default(0),
  visitorSlots: integer('visitor_slots').notNull().default(0),
}, (t) => [
  index('idx_events_tenant').on(t.tenant, t.type, t.status),
  index('idx_events_utc').on(t.tenant, t.startsAtUtc),
]);

/* ---------------- signups [ddl chain baseline] --------------------- */
export const signups = sqliteTable('signups', {
  id: integer('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  nickname: text('nickname').notNull(),
  uid: text('uid').notNull(),
  role: text('role').notNull().default('随意'),
  weapon: text('weapon').notNull().default(''),
  contact: text('contact').notNull().default(''),
  note: text('note').notNull().default(''),
  teamName: text('team_name').notNull().default(''),
  members: text('members').notNull().default(''),
  createdAt: text('created_at').notNull().default(sql`datetime('now')`),
  discordId: text('discord_id'),
  readyAt: integer('ready_at'),
  // Visitor seat marker [alt: 0032]: 1 only for seats taken through
  // the allied-guild visitor path (P20); member seats never set it.
  isVisitor: integer('is_visitor').notNull().default(0),
}, (t) => [
  uniqueIndex('signups_event_uid_unique').on(t.eventId, t.uid),
  index('idx_signups_event').on(t.eventId),
]);

/* ---------------- grouping_templates [ddl chain baseline] ----------
 * Guild-shared car templates: a saved grouping configuration (type,
 * dungeon, seats, title, departure offset) that guild members can
 * apply to prefill the create form. Guild-scoped (tenant), created by
 * a member; only the creator or an admin of the template's own guild
 * may edit or delete it (the grouping manage verdict on tenant +
 * creator_discord_id). start_minutes is the local time-of-day
 * (hour*60+minute in the saver's timezone) and start_days_ahead the
 * day offset, so a template never carries a stale absolute date. */
export const groupingTemplates = sqliteTable('grouping_templates', {
  id: integer('id').primaryKey(),
  tenant: integer('tenant').notNull().default(0),
  name: text('name').notNull().default(''),
  type: text('type').notNull().default('activity'),
  title: text('title').notNull().default(''),
  dungeon: text('dungeon').notNull().default(''),
  maxSlots: integer('max_slots').notNull().default(10),
  startDaysAhead: integer('start_days_ahead').notNull().default(0),
  startMinutes: integer('start_minutes').notNull().default(1200),
  creatorUserId: integer('creator_user_id'),
  createdAt: integer('created_at').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
  /* season_key [alt: 0028]: the season this template copy belongs
   * to ('' = a pre-rollover original). The P12 rollover engine
   * copies templates forward under the new season's key. */
  seasonKey: text('season_key').notNull().default(''),
}, (t) => [
  index('idx_grouping_templates_tenant').on(t.tenant),
]);

/* ---------------- short_links [ddl chain baseline] -----------------
 * Share-link aliases: one stable random code per grouping (car).
 * code is the public alias (base62, 7 chars, random — never derived
 * from the sequential event id); (tenant, event_id) is unique so a
 * car mints exactly one code and reuses it forever. */
export const shortLinks = sqliteTable('short_links', {
  code: text('code').primaryKey(),
  tenant: integer('tenant').notNull().default(0),
  eventId: integer('event_id').notNull(),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  uniqueIndex('short_links_target_unique').on(t.tenant, t.eventId),
]);

/* ---------------- lotteries [migration 0021] -----------------------
 * Guild-admin activity lotteries (F21). The participant list is
 * snapshotted into lottery_entries at creation (discord id + display
 * name + weight); source records where the list came from ('grouping'
 * with source_event_id, or hand-picked 'members'). A draw is without
 * replacement — lottery_winners' unique (lottery_id, discord_id)
 * states the no-repeat rule in the schema — and stamps drawn_at /
 * status = 'drawn' on the lottery. Nothing is ever deleted: the
 * lottery, its entries and its winners are the audit trail. */
export const lotteries = sqliteTable('lotteries', {
  id: integer('id').primaryKey(),
  tenant: integer('tenant').notNull().default(0),
  title: text('title').notNull().default(''),
  prize: text('prize').notNull().default(''),
  source: text('source').notNull().default('members'),
  sourceEventId: integer('source_event_id'),
  winnerCount: integer('winner_count').notNull().default(1),
  status: text('status').notNull().default('open'),
  createdByUserId: integer('created_by_user_id').notNull().default(0),
  createdAt: integer('created_at').notNull().default(0),
  drawnAt: integer('drawn_at'),
}, (t) => [
  index('idx_lotteries_tenant').on(t.tenant, t.id),
]);

export const lotteryEntries = sqliteTable('lottery_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  lotteryId: integer('lottery_id').notNull().references(() => lotteries.id, { onDelete: 'cascade' }),
  discordId: text('discord_id').notNull().default(''),
  displayName: text('display_name').notNull().default(''),
  weight: integer('weight').notNull().default(1),
}, (t) => [
  uniqueIndex('lottery_entries_member_unique').on(t.lotteryId, t.discordId),
  index('idx_lottery_entries_lottery').on(t.lotteryId),
]);

export const lotteryWinners = sqliteTable('lottery_winners', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  lotteryId: integer('lottery_id').notNull().references(() => lotteries.id, { onDelete: 'cascade' }),
  discordId: text('discord_id').notNull().default(''),
  displayName: text('display_name').notNull().default(''),
  drawnAt: integer('drawn_at').notNull().default(0),
}, (t) => [
  uniqueIndex('lottery_winners_member_unique').on(t.lotteryId, t.discordId),
  index('idx_lottery_winners_lottery').on(t.lotteryId),
]);

/* ---------------- member_availability [migration 0007] ------------
 * F5: one row per (guild, member) holding the member's recurring
 * weekly availability windows in slots_json — a JSON array of
 * { weekday (0 = Sunday), startMinute, endMinute } in UTC minutes of
 * day. UTC is the only stored frame; clients render in the viewer's
 * timezone. display_name snapshots the roster name at save time. */
export const memberAvailability = sqliteTable('member_availability', {
  tenant: integer('tenant').notNull().default(0),
  userId: integer('user_id').notNull().default(0),
  displayName: text('display_name').notNull().default(''),
  slotsJson: text('slots_json').notNull().default('[]'),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.tenant, t.userId] }),
]);

/* ---------------- time_polls [migration 0007] ----------------------
 * F13: guild-scoped scheduling polls. Options are absolute candidate
 * start times (epoch seconds UTC). Votes are multi-select
 * availability votes — one row per (poll, option, member) the member
 * can attend; the unique index states the no-duplicate rule and
 * re-voting replaces the member's whole set. */
export const timePolls = sqliteTable('time_polls', {
  id: integer('id').primaryKey(),
  tenant: integer('tenant').notNull().default(0),
  title: text('title').notNull().default(''),
  status: text('status').notNull().default('open'),
  createdByUserId: integer('created_by_user_id').notNull().default(0),
  createdAt: integer('created_at').notNull().default(0),
  closedAt: integer('closed_at'),
}, (t) => [
  index('idx_time_polls_tenant').on(t.tenant, t.id),
]);

export const timePollOptions = sqliteTable('time_poll_options', {
  id: integer('id').primaryKey(),
  pollId: integer('poll_id').notNull().references(() => timePolls.id, { onDelete: 'cascade' }),
  startsAtUtc: integer('starts_at_utc').notNull().default(0),
}, (t) => [
  index('idx_time_poll_options_poll').on(t.pollId),
]);

export const timePollVotes = sqliteTable('time_poll_votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pollId: integer('poll_id').notNull().references(() => timePolls.id, { onDelete: 'cascade' }),
  optionId: integer('option_id').notNull().references(() => timePollOptions.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().default(0),
  displayName: text('display_name').notNull().default(''),
}, (t) => [
  uniqueIndex('time_poll_votes_member_unique').on(t.pollId, t.optionId, t.userId),
  index('idx_time_poll_votes_poll').on(t.pollId),
]);

/* ---------------- grouping_custom_fields [migration 0008] ----------
 * F7: custom signup-form field definitions owned by one grouping
 * (owner_kind = 'event') or one grouping template ('template'). A
 * car's fields are always its own rows (copied from the template at
 * creation when the creator used one). field_type is the constrained
 * set 'text' | 'choice'; options_json carries a choice's options. */
export const groupingCustomFields = sqliteTable('grouping_custom_fields', {
  id: integer('id').primaryKey(),
  ownerKind: text('owner_kind').notNull().default('event'),
  ownerId: integer('owner_id').notNull().default(0),
  label: text('label').notNull().default(''),
  fieldType: text('field_type').notNull().default('text'),
  optionsJson: text('options_json').notNull().default('[]'),
  required: integer('required').notNull().default(0),
  sort: integer('sort').notNull().default(0),
}, (t) => [
  index('idx_grouping_custom_fields_owner').on(t.ownerKind, t.ownerId, t.sort),
]);

/* ---------------- signup_answers [migration 0008] ------------------
 * F7: one member answer per (grouping, signup uid, field); the uid
 * ties the answer to its seat row. Manager-only reads (resolver
 * concern); rows die with their seat and with the grouping. */
export const signupAnswers = sqliteTable('signup_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  signupUid: text('signup_uid').notNull().default(''),
  fieldId: integer('field_id').notNull().default(0),
  value: text('value').notNull().default(''),
}, (t) => [
  uniqueIndex('signup_answers_unique').on(t.eventId, t.signupUid, t.fieldId),
  index('idx_signup_answers_event').on(t.eventId),
]);

/* ---------------- event_reminders [ddl chain baseline] -------------
 * Per-(grouping, offset) departure-reminder settlement for multi-offset
 * reminders: one row per settled beat; no row = that beat is still
 * pending. sent_at set = delivered; error set = failed (settled, never
 * retried). The legacy events.reminder_sent_at / reminder_error pair
 * stays the whole-grouping settlement mark, written when the grouping's
 * last pending beat settles. */
export const eventReminders = sqliteTable('event_reminders', {
  // No REFERENCES clause: the production table was created without a
  // foreign key (unlike signups/results) and the model now says so.
  eventId: integer('event_id').notNull(),
  offsetMin: integer('offset_min').notNull(),
  sentAt: integer('sent_at'),
  error: text('error'),
}, (t) => [
  primaryKey({ columns: [t.eventId, t.offsetMin] }),
]);

/* ---------------- grouping_recaps [migration 0035] ----------------
 * P18 AI activity recaps (premium T3): at most one row per grouping —
 * a regeneration overwrites in place and bumps version. paragraphs_json
 * is a JSON array of generated paragraph strings (generated content,
 * NOT UI copy — it never enters the strings catalog); snapshot_json is
 * the compact summary of the data package the text was generated
 * from. status 'ready' = paragraphs hold a successful generation;
 * 'failed' = the last attempt failed and paragraphs still hold the
 * previous success (or none). tenant is denormalized from the
 * grouping so the guild recap index reads this entity alone. */
export const groupingRecaps = sqliteTable('grouping_recaps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull().default(''),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('ready'),
  paragraphsJson: text('paragraphs_json').notNull().default('[]'),
  snapshotJson: text('snapshot_json').notNull().default('{}'),
  provider: text('provider').notNull().default(''),
  generatedBy: text('generated_by').notNull().default(''),
  version: integer('version').notNull().default(1),
  lastError: text('last_error').notNull().default(''),
  generatedAt: integer('generated_at').notNull().default(0),
  updatedAt: integer('updated_at').notNull().default(0),
}, (t) => [
  uniqueIndex('grouping_recaps_event_unique').on(t.eventId),
  index('idx_grouping_recaps_tenant').on(t.tenant, t.generatedAt),
]);

/* ---------------- results [ddl chain baseline] ----------------------- */
export const results = sqliteTable('results', {
  id: integer('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  teamName: text('team_name').notNull(),
  members: text('members').notNull().default(''),
  timeMs: integer('time_ms').notNull(),
  proofUrl: text('proof_url').notNull().default(''),
  note: text('note').notNull().default(''),
  createdAt: text('created_at').notNull().default(sql`datetime('now')`),
}, (t) => [
  index('idx_results_event').on(t.eventId, t.timeMs),
]);

/* ---------------- rotation_advice_records [migration 0027] --------
 * P5 audit trail: a saved snapshot of one rotation-advice ranking for one
 * grouping — who saved it, when, and the exact ranked entries with
 * their factor values. Append-only: fairness disputes are settled
 * against these rows, so nothing updates or deletes them. */
export const rotationAdviceRecords = sqliteTable('rotation_advice_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant: text('tenant').notNull().default(''),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  adviceJson: text('advice_json').notNull().default('[]'),
  createdBy: text('created_by').notNull().default(''),
  createdAt: integer('created_at').notNull().default(0),
}, (t) => [
  index('idx_rotation_advice_records_event').on(t.tenant, t.eventId, t.id),
]);
