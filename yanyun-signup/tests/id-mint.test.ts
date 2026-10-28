/* Minting (id-mint.ts) against an in-memory SQLite standing in for
 * D1. The fake implements exactly the prepared-statement surface
 * drizzle's D1 driver uses (prepare/bind/run/first/all); every
 * statement executes synchronously on one connection, mirroring
 * D1's per-database write serialization. */
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { mintPublicId } from '../src/domains/platform/id-mint.ts';
import { parsePublicId } from '../src/domains/platform/ids.ts';

function makeFakeD1() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(
    `CREATE TABLE id_mint_counters (
       type_code INTEGER NOT NULL,
       day_index INTEGER NOT NULL,
       seq INTEGER NOT NULL,
       PRIMARY KEY (type_code, day_index)
     )`,
  );
  const prepare = (query: string) => {
    let params: unknown[] = [];
    const stmt = {
      bind(...args: unknown[]) {
        params = args;
        return stmt;
      },
      async run() {
        const r = sqlite.prepare(query).run(...(params as any[]));
        return { success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
      },
      async first() {
        const rows = sqlite.prepare(query).all(...(params as any[]));
        return rows.length ? rows[0] : null;
      },
      async all() {
        const rows = sqlite.prepare(query).all(...(params as any[]));
        return { success: true, results: rows, meta: {} };
      },
      async raw() {
        return sqlite.prepare(query).all(...(params as any[]));
      },
    };
    return stmt;
  };
  return { prepare, sqlite } as any;
}

const DAY = 24 * 3600 * 1000;
const T0 = Date.UTC(2026, 9, 28, 12, 0, 0); // 2026-10-28, day index 300

describe('mintPublicId', () => {
  it('mints increasing sequences within one type and day', async () => {
    const db = makeFakeD1();
    const a = await mintPublicId(db, 'grouping', T0);
    const b = await mintPublicId(db, 'grouping', T0);
    const c = await mintPublicId(db, 'grouping', T0);
    expect(parsePublicId(a)).toMatchObject({ type: 'grouping', typeCode: 10, dayIndex: 300, sequence: 1 });
    expect(parsePublicId(b)).toMatchObject({ sequence: 2 });
    expect(parsePublicId(c)).toMatchObject({ sequence: 3 });
  });

  it('restarts the sequence on the next day', async () => {
    const db = makeFakeD1();
    await mintPublicId(db, 'grouping', T0);
    await mintPublicId(db, 'grouping', T0);
    const next = await mintPublicId(db, 'grouping', T0 + DAY);
    expect(parsePublicId(next)).toMatchObject({ dayIndex: 301, sequence: 1 });
  });

  it('keeps counters independent per type', async () => {
    const db = makeFakeD1();
    const g = await mintPublicId(db, 'grouping', T0);
    const a = await mintPublicId(db, 'announcement', T0);
    const g2 = await mintPublicId(db, 'grouping', T0);
    expect(parsePublicId(g)).toMatchObject({ typeCode: 10, sequence: 1 });
    expect(parsePublicId(a)).toMatchObject({ typeCode: 20, sequence: 1 });
    expect(parsePublicId(g2)).toMatchObject({ typeCode: 10, sequence: 2 });
  });

  it('never repeats under concurrent minters', async () => {
    const db = makeFakeD1();
    const ids = await Promise.all(
      Array.from({ length: 50 }, () => mintPublicId(db, 'user', T0)),
    );
    expect(new Set(ids).size).toBe(50);
    const seqs = ids.map((id) => parsePublicId(id).sequence).sort((x, y) => x - y);
    expect(seqs).toEqual(Array.from({ length: 50 }, (_, i) => i + 1));
  });

  it('continues past a seeded counter (migration backfill maximum)', async () => {
    const db = makeFakeD1();
    db.sqlite
      .prepare('INSERT INTO id_mint_counters (type_code, day_index, seq) VALUES (10, 300, 41)')
      .run();
    const id = await mintPublicId(db, 'grouping', T0);
    expect(parsePublicId(id)).toMatchObject({ dayIndex: 300, sequence: 42 });
  });

  it('refuses days outside the layout range', async () => {
    const db = makeFakeD1();
    await expect(mintPublicId(db, 'grouping', Date.UTC(2025, 11, 31))).rejects.toThrowError(
      /day index/,
    );
  });
});
