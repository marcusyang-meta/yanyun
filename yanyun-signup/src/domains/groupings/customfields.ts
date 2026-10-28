/* ===================================================
 * Data-layer access (Repository) for the custom signup-form
 * entities (F7): grouping_custom_fields + signup_answers.
 *
 * Field definitions are owned by one grouping (owner_kind =
 * 'event') or one grouping template (owner_kind = 'template'); a
 * car's fields are its own rows, copied from its template's set at
 * creation time by the mutation layer. The type set is deliberately
 * small — 'text' (single line) and 'choice' (single choice from a
 * fixed option list) — and every limit (field count, label length,
 * option count/length, answer length) is validated here in the
 * pure parse/validate functions so all mutation paths share one
 * rule set. Labels and options are creator-written DATA, never UI
 * copy. Business code must not hand-roll SQL against these tables.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { mintPublicId } from '../platform/id-mint.ts';
import { groupingCustomFields, signupAnswers } from './schema.ts';

const col = (name: string) => sql.identifier(name);

export interface CustomFieldRow {
  id: number;
  owner_kind: string;
  owner_id: number;
  label: string;
  field_type: string;
  options_json: string;
  required: number;
  sort: number;
}

export interface SignupAnswerRow {
  id: number;
  event_id: number;
  signup_uid: string;
  field_id: number;
  value: string;
}

export interface CustomFieldDef {
  label: string;
  fieldType: 'text' | 'choice';
  options: string[];
  required: boolean;
}

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

export const MAX_CUSTOM_FIELDS = 5;
export const MAX_FIELD_LABEL_LEN = 30;
export const MAX_FIELD_OPTIONS = 6;
export const MAX_FIELD_OPTION_LEN = 30;
export const MAX_ANSWER_LEN = 200;

const trim = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

/**
 * Validate a creator-submitted field set (pure). Returns normalized
 * definitions or a stable error code: too many fields, an empty or
 * over-long label, an unknown type, or a choice without 2..6 valid
 * options all reject the WHOLE set — a form definition is never
 * partially saved.
 */
export function parseCustomFieldDefs(
  input: unknown,
): { defs: CustomFieldDef[] } | { error: string } {
  if (input == null) return { defs: [] };
  if (!Array.isArray(input)) return { error: 'customFieldInvalid' };
  if (input.length > MAX_CUSTOM_FIELDS) return { error: 'customFieldTooMany' };
  const defs: CustomFieldDef[] = [];
  for (const raw of input) {
    const r = (raw || {}) as Record<string, unknown>;
    const label = trim(r.label, MAX_FIELD_LABEL_LEN + 1);
    if (!label || label.length > MAX_FIELD_LABEL_LEN) return { error: 'customFieldInvalid' };
    const fieldType = String(r.fieldType ?? '').toUpperCase() === 'CHOICE' ? 'choice'
      : String(r.fieldType ?? '').toUpperCase() === 'TEXT' ? 'text' : null;
    if (!fieldType) return { error: 'customFieldInvalid' };
    let options: string[] = [];
    if (fieldType === 'choice') {
      if (!Array.isArray(r.options)) return { error: 'customFieldInvalid' };
      options = r.options.map((o) => trim(o, MAX_FIELD_OPTION_LEN + 1));
      if (options.length < 2 || options.length > MAX_FIELD_OPTIONS) return { error: 'customFieldInvalid' };
      if (options.some((o) => !o || o.length > MAX_FIELD_OPTION_LEN)) return { error: 'customFieldInvalid' };
      if (new Set(options).size !== options.length) return { error: 'customFieldInvalid' };
    }
    defs.push({ label, fieldType, options, required: !!r.required });
  }
  return { defs };
}

/** A stored row's option list; corrupt data reads as no options. */
export function parseFieldOptions(json: string | null | undefined): string[] {
  try {
    const arr = JSON.parse(json || '[]');
    return Array.isArray(arr) ? arr.map((x) => String(x)) : [];
  } catch {
    return [];
  }
}

/**
 * Validate one member's answers against a car's field set (pure).
 * Answers for unknown fields are invalid; a required field with no
 * (or an empty) answer is its own code; a choice answer must be one
 * of the field's options; text answers are length-capped. Returns
 * the normalized answers to store.
 */
export function validateSignupAnswers(
  fields: CustomFieldRow[],
  input: unknown,
): { answers: { fieldId: number; value: string }[] } | { error: string } {
  const byId = new Map(fields.map((f) => [f.id, f]));
  const given = new Map<number, string>();
  if (input != null) {
    if (!Array.isArray(input)) return { error: 'signupAnswerInvalid' };
    for (const raw of input) {
      const r = (raw || {}) as Record<string, unknown>;
      const fieldId = parseInt(String(r.fieldId ?? ''), 10) || 0;
      if (!byId.has(fieldId)) return { error: 'signupAnswerInvalid' };
      given.set(fieldId, trim(r.value, MAX_ANSWER_LEN + 1));
    }
  }
  const answers: { fieldId: number; value: string }[] = [];
  for (const f of fields) {
    const value = given.get(f.id) ?? '';
    if (value.length > MAX_ANSWER_LEN) return { error: 'signupAnswerInvalid' };
    if (f.required && !value) return { error: 'signupAnswerRequired' };
    if (!value) continue;
    if (f.field_type === 'choice' && !parseFieldOptions(f.options_json).includes(value)) {
      return { error: 'signupAnswerInvalid' };
    }
    answers.push({ fieldId: f.id, value });
  }
  return { answers };
}

/* ---------- Reads ---------- */

export async function listCustomFields(
  d1: D1Database, ownerKind: 'event' | 'template', ownerId: number,
): Promise<CustomFieldRow[]> {
  const db = createDb(d1);
  const rows = await db.all<CustomFieldRow>(
    sql`SELECT * FROM ${groupingCustomFields} WHERE ${col('owner_kind')} = ${ownerKind} AND ${col('owner_id')} = ${ownerId} ORDER BY ${col('sort')} ASC, ${col('id')} ASC`,
  );
  return rows || [];
}

export async function listSignupAnswersByEvent(
  d1: D1Database, eventId: number,
): Promise<SignupAnswerRow[]> {
  const db = createDb(d1);
  const rows = await db.all<SignupAnswerRow>(
    sql`SELECT * FROM ${signupAnswers} WHERE ${col('event_id')} = ${eventId} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

/* ---------- Writes ---------- */

export async function insertCustomField(
  d1: D1Database,
  row: { ownerKind: 'event' | 'template'; ownerId: number; def: CustomFieldDef; sort: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const id = await mintPublicId(d1, 'customField');
  const r = await db.run(
    sql`INSERT INTO ${groupingCustomFields} (${col('id')}, ${col('owner_kind')}, ${col('owner_id')}, ${col('label')}, ${col('field_type')}, ${col('options_json')}, ${col('required')}, ${col('sort')})
        VALUES (${id}, ${row.ownerKind}, ${row.ownerId}, ${row.def.label}, ${row.def.fieldType}, ${JSON.stringify(row.def.options)}, ${row.def.required ? 1 : 0}, ${row.sort})`,
  );
  const meta = metaOf(r);
  return { changes: meta.changes, last_row_id: id };
}

/** Replace an owner's whole field set (template edits; car creation copies). */
export async function replaceCustomFields(
  d1: D1Database, ownerKind: 'event' | 'template', ownerId: number, defs: CustomFieldDef[],
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`DELETE FROM ${groupingCustomFields} WHERE ${col('owner_kind')} = ${ownerKind} AND ${col('owner_id')} = ${ownerId}`,
  );
  for (let i = 0; i < defs.length; i++) {
    await insertCustomField(d1, { ownerKind, ownerId, def: defs[i], sort: i });
  }
}

export async function insertSignupAnswer(
  d1: D1Database,
  row: { eventId: number; signupUid: string; fieldId: number; value: string },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${signupAnswers} (${col('event_id')}, ${col('signup_uid')}, ${col('field_id')}, ${col('value')})
        VALUES (${row.eventId}, ${row.signupUid}, ${row.fieldId}, ${row.value})`,
  );
  return metaOf(r);
}

/** A seat's answers leave with the seat (leave / roster rewrite). */
export async function deleteSignupAnswersByEventUid(
  d1: D1Database, eventId: number, signupUid: string,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`DELETE FROM ${signupAnswers} WHERE ${col('event_id')} = ${eventId} AND ${col('signup_uid')} = ${signupUid}`,
  );
  return metaOf(r);
}

export async function deleteSignupAnswersByEvent(
  d1: D1Database, eventId: number,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`DELETE FROM ${signupAnswers} WHERE ${col('event_id')} = ${eventId}`,
  );
  return metaOf(r);
}
