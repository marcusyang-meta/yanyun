/* ===================================================
 * Weekly recurring groupings ("every week at the same time",
 * migration 0044): the rule repository plus the materialization
 * service — run by the daily cron for every active rule, and run
 * for a single rule inside the request when one of its instances
 * is completed or disbanded, so the next instance appears at once
 * instead of at the next sweep.
 *
 * A rule is a configuration snapshot of the car its leader created
 * with the weekly switch on (the clone-copy set: title / type /
 * dungeon / capacity / ally-sharing + the F7 custom-field
 * definitions), the weekday and home timezone of the first
 * instance, and a chain pointer (last_starts_at_utc). Instances are
 * ordinary events rows linked back by events.recurrence_id and
 * always start with EMPTY seats — re-signing up every week is the
 * point of the series.
 *
 * Materialization is rolling one-ahead: a run guarantees exactly
 * one future instance exists per active rule. The next start is
 * the previous start + 7 days at the same wall-clock reading in
 * the rule's timezone (DST seams shift the UTC instant, never the
 * local reading). Weeks whose instance was disbanded (the row is
 * deleted) or missed (cron downtime) are skipped, never backfilled
 * into the past. Idempotency is stated in the schema (unique
 * (recurrence_id, starts_at_utc)) and re-checked here before
 * inserting, so a repeated run is a no-op.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';
import { mintPublicId } from '../platform/id-mint.ts';
import { recordGuildAudit } from '../guilds/guild-audit.ts';
import { getUserIdentityById } from '../identity/users.ts';
import { CAR_HOME_TZ_FALLBACK, isValidIanaTz } from './car-tz.ts';
import { zonedParts, zonedToUtc } from './clone.ts';
import {
  GROUPING_DEFAULT_CREATED_BY,
  insertEvent,
  listEventsByRecurrence,
  updateEventFields,
} from './events.ts';
import { replaceCustomFields, type CustomFieldDef } from './customfields.ts';

const { groupingRecurrences } = schema;
const col = (name: string) => sql.identifier(name);

export interface RecurrenceRuleRow {
  id: number;
  tenant: number;
  source_event_id: number;
  title: string;
  type: string;
  dungeon: string;
  max_slots: number;
  ally_visible: number;
  visitor_slots: number;
  custom_fields_json: string;
  weekday: number;
  tz: string | null;
  last_starts_at_utc: number;
  status: string;
  creator_user_id: number;
  created_at: number;
  updated_at: number;
}

/* ---------------- repository ---------------- */

export async function insertRecurrenceRule(
  d1: D1Database,
  row: {
    tenant: number; sourceEventId: number; title: string; type: string;
    dungeon: string; maxSlots: number; allyVisible: number; visitorSlots: number;
    customFieldsJson: string; weekday: number; tz: string | null;
    lastStartsAtUtc: number; creatorUserId: number; nowSec: number;
  },
): Promise<number> {
  const db = createDb(d1);
  // The recurrence rule ID (type code 18) is minted in the data layer.
  const id = await mintPublicId(d1, 'groupingRecurrence');
  await db.run(
    sql`INSERT INTO ${groupingRecurrences} (${col('id')}, ${col('tenant')}, ${col('source_event_id')}, ${col('title')}, ${col('type')}, ${col('dungeon')}, ${col('max_slots')}, ${col('ally_visible')}, ${col('visitor_slots')}, ${col('custom_fields_json')}, ${col('weekday')}, ${col('tz')}, ${col('last_starts_at_utc')}, ${col('status')}, ${col('creator_user_id')}, ${col('created_at')}, ${col('updated_at')})
        VALUES (${id}, ${row.tenant}, ${row.sourceEventId}, ${row.title}, ${row.type}, ${row.dungeon}, ${row.maxSlots}, ${row.allyVisible}, ${row.visitorSlots}, ${row.customFieldsJson}, ${row.weekday}, ${row.tz}, ${row.lastStartsAtUtc}, ${'active'}, ${row.creatorUserId}, ${row.nowSec}, ${row.nowSec})`,
  );
  return id;
}

export async function getRecurrenceRule(d1: D1Database, id: number): Promise<RecurrenceRuleRow | null> {
  const db = createDb(d1);
  const row = await db.get<RecurrenceRuleRow>(sql`SELECT * FROM ${groupingRecurrences} WHERE ${col('id')} = ${id}`);
  return row ?? null;
}

/** Every active rule, oldest first — the cron's work list. */
export async function listActiveRecurrenceRules(d1: D1Database): Promise<RecurrenceRuleRow[]> {
  const db = createDb(d1);
  const rows = await db.all<RecurrenceRuleRow>(sql`SELECT * FROM ${groupingRecurrences} WHERE ${col('status')} = ${'active'} ORDER BY ${col('id')} ASC`);
  return rows || [];
}

export async function setRecurrenceRuleStatus(
  d1: D1Database, id: number, status: 'active' | 'stopped', atSec: number,
): Promise<void> {
  const db = createDb(d1);
  await db.run(sql`UPDATE ${groupingRecurrences} SET ${col('status')} = ${status}, ${col('updated_at')} = ${atSec} WHERE ${col('id')} = ${id}`);
}

async function advanceRecurrenceRule(
  d1: D1Database, id: number, lastStartsAtUtc: number, atSec: number,
): Promise<void> {
  const db = createDb(d1);
  await db.run(sql`UPDATE ${groupingRecurrences} SET ${col('last_starts_at_utc')} = ${lastStartsAtUtc}, ${col('updated_at')} = ${atSec} WHERE ${col('id')} = ${id}`);
}

/* ---------------- time math (pure) ---------------- */

/** The frame a rule's wall-clock readings live in: the stored zone
 * when it is a valid IANA name, else the platform home fallback —
 * the same resolution the clone default start applies. */
export function resolveRuleTz(tzRaw: string | null | undefined): string {
  return tzRaw && isValidIanaTz(tzRaw) ? tzRaw : CAR_HOME_TZ_FALLBACK;
}

/** Weekday (0 = Sunday) of an instant read in the rule's zone. */
export function weekdayInTz(epochSec: number, tzRaw: string | null | undefined): number {
  return zonedParts(epochSec, resolveRuleTz(tzRaw)).weekday;
}

/** The same wall-clock reading seven days later: take the previous
 * start's zoned parts, move the calendar date +7, and convert back
 * — across a DST seam the UTC instant shifts so the local reading
 * (weekday + time of day) is preserved exactly. */
export function nextWeeklyStartUtc(prevUtc: number, tzRaw: string | null | undefined): number {
  const tz = resolveRuleTz(tzRaw);
  const p = zonedParts(prevUtc, tz);
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + 7));
  return zonedToUtc(
    d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(),
    p.hour, p.minute, p.second, tz,
  );
}

/* ---------------- field-definition snapshot ---------------- */

/** The rule's copy of the car's F7 field definitions, stored as a
 * JSON document (configuration data in the template's shape). */
export function snapshotFieldDefsJson(defs: CustomFieldDef[]): string {
  return JSON.stringify((defs || []).map((d) => ({
    label: d.label,
    fieldType: d.fieldType === 'choice' ? 'choice' : 'text',
    options: Array.isArray(d.options) ? d.options.map((o) => String(o)) : [],
    required: !!d.required,
  })));
}

/** Read a snapshot back into definitions; malformed entries are
 * dropped rather than failing the whole materialization. */
export function parseFieldDefsSnapshot(json: string | null | undefined): CustomFieldDef[] {
  let raw: unknown;
  try { raw = JSON.parse(json || '[]'); } catch { return []; }
  if (!Array.isArray(raw)) return [];
  const out: CustomFieldDef[] = [];
  for (const e of raw) {
    if (!e || typeof e !== 'object') continue;
    const label = String((e as { label?: unknown }).label || '').trim();
    if (!label) continue;
    const ft = (e as { fieldType?: unknown }).fieldType;
    const opts = (e as { options?: unknown }).options;
    out.push({
      label,
      fieldType: ft === 'choice' ? 'choice' : 'text',
      options: Array.isArray(opts) ? opts.map((o) => String(o)) : [],
      required: !!(e as { required?: unknown }).required,
    });
  }
  return out;
}

/* ---------------- rule lifecycle ---------------- */

/** Switch a freshly created car into a weekly series: snapshot its
 * configuration into a new rule and link the car as the first
 * instance. Called by the create mutation only, in the same
 * request that created the car. */
export async function createRecurrenceRuleForEvent(
  d1: D1Database,
  input: {
    tenant: number; eventId: number; title: string; type: string;
    dungeon: string; maxSlots: number; fieldDefs: CustomFieldDef[];
    startsAtUtc: number; tz: string | null; creatorUserId: number; nowSec: number;
  },
): Promise<number> {
  const ruleId = await insertRecurrenceRule(d1, {
    tenant: input.tenant,
    sourceEventId: input.eventId,
    title: input.title,
    type: input.type,
    dungeon: input.dungeon,
    maxSlots: input.maxSlots,
    allyVisible: 0,
    visitorSlots: 0,
    customFieldsJson: snapshotFieldDefsJson(input.fieldDefs),
    weekday: weekdayInTz(input.startsAtUtc, input.tz),
    tz: input.tz,
    lastStartsAtUtc: input.startsAtUtc,
    creatorUserId: input.creatorUserId,
    nowSec: input.nowSec,
  });
  await updateEventFields(d1, input.eventId, null, { recurrence_id: ruleId });
  return ruleId;
}

/** The active rule behind one instance car, or null when the car
 * is not part of a live series (no link, or the series stopped). */
export async function getActiveRecurrenceForEvent(
  d1: D1Database, ev: { recurrence_id?: number | null },
): Promise<RecurrenceRuleRow | null> {
  const ruleId = ev && ev.recurrence_id ? Number(ev.recurrence_id) : 0;
  if (!ruleId) return null;
  const rule = await getRecurrenceRule(d1, ruleId).catch(() => null);
  return rule && rule.status === 'active' ? rule : null;
}

/** Stop a series: future materialization ends; instances already
 * on the calendar are untouched ordinary cars. */
export async function stopRecurrenceRule(d1: D1Database, ruleId: number, atSec: number): Promise<void> {
  await setRecurrenceRuleStatus(d1, ruleId, 'stopped', atSec);
}

/* ---------------- materialization ---------------- */

/** Guarantee the rule's one future instance. Returns the created
 * event's ID, or null when the invariant already held (a future
 * instance exists) or the week's slot was already filled. */
export async function materializeRecurrenceRule(
  d1: D1Database, rule: RecurrenceRuleRow, nowSec: number,
): Promise<{ createdEventId: number | null }> {
  const instances = await listEventsByRecurrence(d1, rule.id);
  let latestExisting = 0;
  for (const ev of instances) {
    latestExisting = Math.max(latestExisting, Number(ev.starts_at_utc) || 0);
  }
  if (latestExisting > nowSec) {
    // A future instance already exists — the invariant holds; just
    // keep the chain pointer honest (the leader may have moved it).
    if (rule.last_starts_at_utc !== latestExisting) {
      await advanceRecurrenceRule(d1, rule.id, latestExisting, nowSec);
    }
    return { createdEventId: null };
  }
  // Walk whole weeks forward from the later of the pointer and the
  // latest surviving instance until the start is in the future.
  // Past weeks are skipped, never backfilled: their instance either
  // already ran, was disbanded, or was missed while the cron was
  // down — none of those should produce a car in the past.
  let cursor = Math.max(Number(rule.last_starts_at_utc) || 0, latestExisting);
  let next = nextWeeklyStartUtc(cursor, rule.tz);
  while (next <= nowSec) {
    cursor = next;
    next = nextWeeklyStartUtc(cursor, rule.tz);
  }
  let createdEventId: number | null = null;
  const alreadyThere = instances.some((ev) => Number(ev.starts_at_utc) === next);
  if (!alreadyThere) {
    const r = await insertEvent(d1, {
      tenant: rule.tenant, title: rule.title, type: rule.type, description: '',
      starts_at: '', starts_at_utc: next,
      max_slots: rule.max_slots, status: 'open', origin: 'member',
      created_by: GROUPING_DEFAULT_CREATED_BY,
      dungeon: rule.dungeon || '', creator_user_id: rule.creator_user_id || null,
      created_tz: rule.tz ?? null,
      ally_visible: rule.ally_visible ? 1 : 0, visitor_slots: Number(rule.visitor_slots) || 0,
      recurrence_id: rule.id,
    });
    createdEventId = r.last_row_id;
    const defs = parseFieldDefsSnapshot(rule.custom_fields_json);
    if (defs.length) {
      await replaceCustomFields(d1, 'event', createdEventId, defs);
    }
    // The series' audit trail: one row per materialized instance,
    // recorded in the name of the member who set the series up.
    const actor = rule.creator_user_id
      ? await getUserIdentityById(d1, rule.creator_user_id).catch(() => null)
      : null;
    await recordGuildAudit(d1, {
      tenant: rule.tenant,
      actor: actor ? { discordId: actor.discordId, name: actor.name } : null,
      action: 'event.recurrence', targetType: 'event', targetId: createdEventId,
      targetLabel: rule.title, at: nowSec,
    });
  }
  if (Number(rule.last_starts_at_utc) !== next) {
    await advanceRecurrenceRule(d1, rule.id, next, nowSec);
  }
  return { createdEventId };
}

/** The request-time trigger: run the cron's materialization for
 * the single rule behind one instance car. Called by the complete
 * and disband mutations right after the lifecycle change succeeds,
 * so finishing a series car surfaces its next instance immediately.
 * The semantics are exactly the cron's — this resolves the car's
 * rule through the same active check and hands it to the same
 * materializeRecurrenceRule — so a car outside a live series (no
 * link, or the rule has stopped) is a no-op, completing an old
 * instance while a future one exists creates nothing, and a
 * disbanded future instance skips its week rather than reviving. */
export async function materializeRecurrenceForEvent(
  d1: D1Database,
  ev: { recurrence_id?: number | null },
  nowSec: number = Math.floor(Date.now() / 1000),
): Promise<{ createdEventId: number | null }> {
  const rule = await getActiveRecurrenceForEvent(d1, ev);
  if (!rule) return { createdEventId: null };
  return materializeRecurrenceRule(d1, rule, nowSec);
}

/** The daily cron's entry point (rides the existing scheduled
 * handler next to the backup and the account-deletion sweep): run
 * every active rule once. Failures are contained per rule — one
 * broken series never blocks the others or the co-scheduled jobs. */
export async function runDueRecurrences(
  d1: D1Database, nowSec: number = Math.floor(Date.now() / 1000),
): Promise<{ created: number }> {
  const rules = await listActiveRecurrenceRules(d1).catch(() => [] as RecurrenceRuleRow[]);
  let created = 0;
  for (const rule of rules) {
    try {
      const r = await materializeRecurrenceRule(d1, rule, nowSec);
      if (r.createdEventId) created += 1;
    } catch { /* contained per rule; the next run retries */ }
  }
  return { created };
}
