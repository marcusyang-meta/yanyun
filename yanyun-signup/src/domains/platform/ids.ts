// Typed public IDs — the platform's entity identity system.
//
// Every registered entity carries an 11-digit decimal primary key:
//
//   [ type code: 2 ][ day index: 4 ][ daily sequence: 5 ]
//   id = typeCode * 1_000_000_000 + dayIndex * 100_000 + sequence
//
// dayIndex counts whole UTC days since 2026-01-01 (day 0); sequence is
// a per-(type, day) serial starting at 1. Given a stranger's ID, the
// prefix alone names the entity type and its creation day — no lookup
// needed (the FB-style property this design was ruled for, 2026-10-28;
// see docs/ID_SYSTEM.md for the full design and inventory).
//
// Parsing is prefix-driven and lives ONLY in parsePublicId below.
// Type codes 90-99 are the reserved extension segment: when a
// dimension runs out, a wider layout opens under a 9x code and old IDs
// keep parsing under their own prefix's layout. IDs are never
// renumbered.

/** Milliseconds of the ID epoch: 2026-01-01T00:00:00Z (day index 0). */
export const PUBLIC_ID_EPOCH_MS = Date.UTC(2026, 0, 1);

const DAY_MS = 86_400_000;
const SEQUENCE_MAX = 99_999;
const DAY_INDEX_MAX = 9_999;

/** The type-code registry. Single source: docs/ID_SYSTEM.md mirrors it. */
export const PUBLIC_ID_TYPE_CODES = {
  guild: 1,
  user: 2,
  grouping: 10,
  groupingTemplate: 11,
  signup: 12,
  raceResult: 13,
  customField: 14,
  announcement: 20,
  gearItem: 30,
  gearBuild: 31,
  recruitApplication: 40,
  mentorPairing: 41,
  rosterEntry: 42,
  rosterImportBatch: 43,
  rosterImportRow: 44,
  memberNote: 45,
  seasonGoal: 46,
  alliance: 50,
  fillOffer: 51,
  fillRequest: 52,
  fillInvite: 53,
  lottery: 60,
  timePoll: 61,
  timePollOption: 62,
  feedback: 70,
  opsNudgeSend: 80,
} as const;

export type PublicIdType = keyof typeof PUBLIC_ID_TYPE_CODES;

const CODE_TO_TYPE = new Map<number, PublicIdType>(
  Object.entries(PUBLIC_ID_TYPE_CODES).map(([type, code]) => [
    code,
    type as PublicIdType,
  ]),
);

/** Type codes 90-99: reserved for future extension layouts. */
export function isReservedExtensionCode(typeCode: number): boolean {
  return typeCode >= 90 && typeCode <= 99;
}

export type PublicIdErrorCode =
  | 'not-an-integer'
  | 'wrong-length'
  | 'reserved-extension'
  | 'unknown-type'
  | 'sequence-out-of-range'
  | 'day-out-of-range';

export class PublicIdError extends Error {
  readonly code: PublicIdErrorCode;
  constructor(code: PublicIdErrorCode, message: string) {
    super(message);
    this.name = 'PublicIdError';
    this.code = code;
  }
}

export interface ParsedPublicId {
  type: PublicIdType;
  typeCode: number;
  dayIndex: number;
  sequence: number;
  /** UTC calendar day the entity was created on, as YYYY-MM-DD. */
  createdOn: string;
}

/** Whole UTC days between the ID epoch and `ms` (negative before it). */
export function dayIndexFromMs(ms: number): number {
  return Math.floor((ms - PUBLIC_ID_EPOCH_MS) / DAY_MS);
}

/** Compose an ID from its parts, validating every range. */
export function composePublicId(
  typeCode: number,
  dayIndex: number,
  sequence: number,
): number {
  if (!CODE_TO_TYPE.has(typeCode)) {
    if (isReservedExtensionCode(typeCode)) {
      throw new PublicIdError(
        'reserved-extension',
        `type code ${typeCode} is in the reserved extension segment`,
      );
    }
    throw new PublicIdError('unknown-type', `unregistered type code ${typeCode}`);
  }
  if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex > DAY_INDEX_MAX) {
    throw new PublicIdError(
      'day-out-of-range',
      `day index ${dayIndex} outside 0..${DAY_INDEX_MAX}`,
    );
  }
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > SEQUENCE_MAX) {
    throw new PublicIdError(
      'sequence-out-of-range',
      `sequence ${sequence} outside 1..${SEQUENCE_MAX}`,
    );
  }
  return typeCode * 1_000_000_000 + dayIndex * 100_000 + sequence;
}

/**
 * The one and only public-ID parser. Prefix-driven: the type code
 * selects the layout; a 9x prefix is refused as an undefined extension
 * layout rather than guessed at.
 */
export function parsePublicId(id: number): ParsedPublicId {
  if (typeof id !== 'number' || !Number.isSafeInteger(id)) {
    throw new PublicIdError('not-an-integer', `id ${String(id)} is not a safe integer`);
  }
  // The layout is 11 decimal digits wide, but the 0x root codes carry
  // a leading zero in that layout, so guild and user IDs are 10-digit
  // numbers whose type code is floor(id / 1e9) in 1..9. The smallest
  // legal ID is code 1, day 0, sequence 1.
  if (id < 1_000_000_001 || id > 99_999_999_999) {
    throw new PublicIdError('wrong-length', `id ${id} does not fit the 11-digit layout`);
  }
  const typeCode = Math.floor(id / 1_000_000_000);
  if (isReservedExtensionCode(typeCode)) {
    throw new PublicIdError(
      'reserved-extension',
      `id ${id} uses reserved extension type code ${typeCode}; its layout is not defined`,
    );
  }
  const type = CODE_TO_TYPE.get(typeCode);
  if (!type) {
    throw new PublicIdError('unknown-type', `id ${id} has unregistered type code ${typeCode}`);
  }
  const dayIndex = Math.floor(id / 100_000) % 10_000;
  const sequence = id % 100_000;
  if (sequence < 1) {
    throw new PublicIdError(
      'sequence-out-of-range',
      `id ${id} has sequence 0; sequences start at 1`,
    );
  }
  const createdOn = new Date(PUBLIC_ID_EPOCH_MS + dayIndex * DAY_MS)
    .toISOString()
    .slice(0, 10);
  return { type, typeCode, dayIndex, sequence, createdOn };
}

/** True when `id` parses as a public ID of exactly `type`. */
export function isPublicIdOfType(id: number, type: PublicIdType): boolean {
  try {
    return parsePublicId(id).type === type;
  } catch {
    return false;
  }
}
