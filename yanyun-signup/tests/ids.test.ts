// Typed public IDs (docs/ID_SYSTEM.md): parser matrix, composer
// ranges, and the mint repository against a real SQLite database
// behind a D1-shaped double (node:sqlite), so the counter upsert runs
// the exact SQL production runs.
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import {
  PUBLIC_ID_TYPE_CODES,
  PublicIdError,
  composePublicId,
  dayIndexFromMs,
  isPublicIdOfType,
  parsePublicId,
} from '../src/domains/platform/ids.ts';
import { mintPublicId } from '../src/domains/platform/id-mint.ts';

/* ---------------- D1-shaped double over node:sqlite ---------------- */

function makeD1Double(db: DatabaseSync): D1Database {
  const prepare = (query: string) => {
    let params: unknown[] = [];
    const stmt: Record<string, unknown> = {
      bind(...values: unknown[]) {
        params = values;
        return stmt;
      },
      async run() {
        const r = db.prepare(query).run(...(params as never[]));
        return {
          success: true,
          meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) },
        };
      },
      async first(column?: string) {
        const row = db.prepare(query).get(...(params as never[])) as
          | Record<string, unknown>
          | undefined;
        if (!row) return null;
        return column ? row[column] : row;
      },
      async all() {
        const results = db.prepare(query).all(...(params as never[]));
        return { success: true, results };
      },
      async raw() {
        const rows = db.prepare(query).all(...(params as never[])) as Array<
          Record<string, unknown>
        >;
        return rows.map((row) => Object.values(row));
      },
    };
    return stmt;
  };
  return {
    prepare,
    async batch(statements: Array<{ run: () => Promise<unknown> }>) {
      const out = [];
      for (const s of statements) out.push(await s.run());
      return out;
    },
    async exec(query: string) {
      db.exec(query);
      return { count: 0, duration: 0 };
    },
  } as unknown as D1Database;
}

function makeMintDb(): D1Database {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(
    `CREATE TABLE id_mint_counters (
       type_code INTEGER NOT NULL,
       day_index INTEGER NOT NULL,
       seq INTEGER NOT NULL DEFAULT 0,
       PRIMARY KEY (type_code, day_index)
     )`,
  );
  return makeD1Double(sqlite);
}

/* ------------------------------ parser ----------------------------- */

describe('parsePublicId', () => {
  it('parses a composed example: grouping, day 364, sequence 127', () => {
    // Day index 0 is 2026-01-01, so day 364 is 2026-12-31.
    const parsed = parsePublicId(10036400127);
    expect(parsed.type).toBe('grouping');
    expect(parsed.typeCode).toBe(10);
    expect(parsed.dayIndex).toBe(364);
    expect(parsed.sequence).toBe(127);
    expect(parsed.createdOn).toBe('2026-12-31');
    expect(parsePublicId(10036500001).createdOn).toBe('2027-01-01');
  });

  it('parses the root entities and the epoch day', () => {
    // Root codes 01/02 carry the layout's leading zero: the numeric
    // values are 10 digits, the code is still the first field.
    expect(parsePublicId(1000000001)).toMatchObject({
      type: 'guild',
      dayIndex: 0,
      sequence: 1,
      createdOn: '2026-01-01',
    });
    expect(parsePublicId(2000000001).type).toBe('user');
  });

  it('round-trips every registered type through compose/parse', () => {
    for (const [type, code] of Object.entries(PUBLIC_ID_TYPE_CODES)) {
      const id = composePublicId(code, 42, 7);
      const parsed = parsePublicId(id);
      expect(parsed.type).toBe(type);
      expect(parsed.dayIndex).toBe(42);
      expect(parsed.sequence).toBe(7);
      expect(isPublicIdOfType(id, type as never)).toBe(true);
    }
  });

  it('rejects the reserved 9x extension segment instead of guessing', () => {
    for (const code of [90, 95, 99]) {
      expect(() => parsePublicId(code * 1_000_000_000 + 1)).toThrowError(
        expect.objectContaining({ code: 'reserved-extension' }),
      );
    }
  });

  it('rejects unregistered type codes', () => {
    expect(() => parsePublicId(3000000001)).toThrowError(
      expect.objectContaining({ code: 'unknown-type' }),
    );
    expect(() => parsePublicId(17000000001)).toThrowError(
      expect.objectContaining({ code: 'unknown-type' }),
    );
  });

  it('rejects wrong lengths and non-integers', () => {
    for (const bad of [123, 999_999_999, 1_000_000_000, 100_000_000_000, -10036400127]) {
      expect(() => parsePublicId(bad)).toThrowError(PublicIdError);
    }
    expect(() => parsePublicId(10036400127.5)).toThrowError(
      expect.objectContaining({ code: 'not-an-integer' }),
    );
    expect(() => parsePublicId(NaN)).toThrowError(
      expect.objectContaining({ code: 'not-an-integer' }),
    );
  });

  it('rejects sequence 0', () => {
    expect(() => parsePublicId(10036400000)).toThrowError(
      expect.objectContaining({ code: 'sequence-out-of-range' }),
    );
  });
});

describe('composePublicId validation', () => {
  it('refuses reserved and unknown codes, bad days, bad sequences', () => {
    expect(() => composePublicId(90, 0, 1)).toThrowError(
      expect.objectContaining({ code: 'reserved-extension' }),
    );
    expect(() => composePublicId(3, 0, 1)).toThrowError(
      expect.objectContaining({ code: 'unknown-type' }),
    );
    expect(() => composePublicId(10, -1, 1)).toThrowError(
      expect.objectContaining({ code: 'day-out-of-range' }),
    );
    expect(() => composePublicId(10, 10_000, 1)).toThrowError(
      expect.objectContaining({ code: 'day-out-of-range' }),
    );
    expect(() => composePublicId(10, 0, 0)).toThrowError(
      expect.objectContaining({ code: 'sequence-out-of-range' }),
    );
    expect(() => composePublicId(10, 0, 100_000)).toThrowError(
      expect.objectContaining({ code: 'sequence-out-of-range' }),
    );
  });

  it('dayIndexFromMs floors to UTC days from the epoch', () => {
    expect(dayIndexFromMs(Date.UTC(2026, 0, 1))).toBe(0);
    expect(dayIndexFromMs(Date.UTC(2026, 0, 1, 23, 59, 59))).toBe(0);
    expect(dayIndexFromMs(Date.UTC(2026, 0, 2))).toBe(1);
    expect(dayIndexFromMs(Date.UTC(2026, 11, 31))).toBe(364);
    expect(dayIndexFromMs(Date.UTC(2025, 11, 31))).toBe(-1);
  });
});

/* ------------------------------ minting ---------------------------- */

describe('mintPublicId', () => {
  const day1 = Date.UTC(2026, 9, 28, 12, 0, 0); // day index 300
  const day2 = Date.UTC(2026, 9, 29, 1, 0, 0); // day index 301

  it('increments within a type and day', async () => {
    const d1 = makeMintDb();
    const a = await mintPublicId(d1, 'grouping', day1);
    const b = await mintPublicId(d1, 'grouping', day1);
    const c = await mintPublicId(d1, 'grouping', day1);
    expect([a, b, c]).toEqual([10030000001, 10030000002, 10030000003]);
  });

  it('resets the sequence on a new day and stays independent across types', async () => {
    const d1 = makeMintDb();
    await mintPublicId(d1, 'grouping', day1);
    await mintPublicId(d1, 'grouping', day1);
    const nextDay = await mintPublicId(d1, 'grouping', day2);
    expect(nextDay).toBe(10030100001);
    const otherType = await mintPublicId(d1, 'announcement', day1);
    expect(otherType).toBe(20030000001);
  });

  it('never repeats under interleaved concurrent minting', async () => {
    const d1 = makeMintDb();
    const ids = await Promise.all(
      Array.from({ length: 50 }, () => mintPublicId(d1, 'signup', day1)),
    );
    expect(new Set(ids).size).toBe(50);
    expect(Math.min(...ids)).toBe(12030000001);
    expect(Math.max(...ids)).toBe(12030000050);
    for (const id of ids) expect(parsePublicId(id).type).toBe('signup');
  });

  it('refuses to mint before the epoch', async () => {
    const d1 = makeMintDb();
    await expect(
      mintPublicId(d1, 'grouping', Date.UTC(2025, 11, 31)),
    ).rejects.toMatchObject({ code: 'day-out-of-range' });
  });
});
