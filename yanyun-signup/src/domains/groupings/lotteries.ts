/* ===================================================
 * Data-layer access (Repository) for the lottery entities (F21):
 * lotteries + lottery_entries + lottery_winners.
 *
 * A lottery snapshots its participant list at creation (entries:
 * discord id + display name + weight), so later roster or seat
 * changes never rewrite a pending draw. The draw is a weighted
 * sample WITHOUT replacement — inside one lottery nobody can win
 * twice (the winners table states the same rule as a unique index).
 * Rows keep snake_case keys; writes return the D1 meta, same shape
 * as the other repositories. Business code must not hand-roll SQL
 * against these tables.
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { lotteries, lotteryEntries, lotteryWinners } from './schema.ts';

const col = (name: string) => sql.identifier(name);

export interface LotteryRow {
  id: number;
  tenant: string;
  title: string;
  prize: string;
  source: string;
  source_event_id: number | null;
  winner_count: number;
  status: string;
  created_by: string;
  created_at: number;
  drawn_at: number | null;
}

export interface LotteryEntryRow {
  id: number;
  lottery_id: number;
  discord_id: string;
  display_name: string;
  weight: number;
}

export interface LotteryWinnerRow {
  id: number;
  lottery_id: number;
  discord_id: string;
  display_name: string;
  drawn_at: number;
}

interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

/* ---------- Reads ---------- */

/** One guild's lotteries, newest first (the admin tool list order). */
export async function listLotteries(
  d1: D1Database, tenant: string,
): Promise<LotteryRow[]> {
  const db = createDb(d1);
  const rows = await db.all<LotteryRow>(
    sql`SELECT * FROM ${lotteries} WHERE ${col('tenant')} = ${tenant} ORDER BY ${col('id')} DESC`,
  );
  return rows || [];
}

/** Tenant-scoped read: a lottery id from another guild reads as null. */
export async function getLotteryByTenant(
  d1: D1Database, id: number, tenant: string,
): Promise<LotteryRow | null> {
  const db = createDb(d1);
  const row = await db.get<LotteryRow>(
    sql`SELECT * FROM ${lotteries} WHERE ${col('id')} = ${id} AND ${col('tenant')} = ${tenant}`,
  );
  return row ?? null;
}

export async function listLotteryEntries(
  d1: D1Database, lotteryId: number,
): Promise<LotteryEntryRow[]> {
  const db = createDb(d1);
  const rows = await db.all<LotteryEntryRow>(
    sql`SELECT * FROM ${lotteryEntries} WHERE ${col('lottery_id')} = ${lotteryId} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

export async function listLotteryWinners(
  d1: D1Database, lotteryId: number,
): Promise<LotteryWinnerRow[]> {
  const db = createDb(d1);
  const rows = await db.all<LotteryWinnerRow>(
    sql`SELECT * FROM ${lotteryWinners} WHERE ${col('lottery_id')} = ${lotteryId} ORDER BY ${col('id')} ASC`,
  );
  return rows || [];
}

/* ---------- Writes ---------- */

const LOTTERY_COLUMNS = new Set([
  'tenant', 'title', 'prize', 'source', 'source_event_id',
  'winner_count', 'status', 'created_by', 'created_at', 'drawn_at',
]);

function checkedLotteryColumns(row: Record<string, unknown>): string[] {
  const cols = Object.keys(row);
  for (const c of cols) {
    if (!LOTTERY_COLUMNS.has(c)) throw new Error(`lotteries repository: unknown column ${c}`);
  }
  if (!cols.length) throw new Error('lotteries repository: empty row');
  return cols;
}

export async function insertLottery(
  d1: D1Database, row: Record<string, unknown>,
): Promise<RunMeta> {
  const db = createDb(d1);
  const cols = checkedLotteryColumns(row);
  const r = await db.run(sql`INSERT INTO ${lotteries} (${sql.join(cols.map((c) => col(c)), sql`, `)})
    VALUES (${sql.join(cols.map((c) => sql`${row[c]}`), sql`,`)})`);
  return metaOf(r);
}

export async function insertLotteryEntry(
  d1: D1Database,
  row: { lotteryId: number; discordId: string; displayName: string; weight: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${lotteryEntries} (${col('lottery_id')}, ${col('discord_id')}, ${col('display_name')}, ${col('weight')})
        VALUES (${row.lotteryId}, ${row.discordId}, ${row.displayName}, ${row.weight})`,
  );
  return metaOf(r);
}

export async function insertLotteryWinner(
  d1: D1Database,
  row: { lotteryId: number; discordId: string; displayName: string; drawnAt: number },
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`INSERT INTO ${lotteryWinners} (${col('lottery_id')}, ${col('discord_id')}, ${col('display_name')}, ${col('drawn_at')})
        VALUES (${row.lotteryId}, ${row.discordId}, ${row.displayName}, ${row.drawnAt})`,
  );
  return metaOf(r);
}

/** Draw settlement: status flips to 'drawn' with the draw time. */
export async function markLotteryDrawn(
  d1: D1Database, id: number, drawnAt: number,
): Promise<RunMeta> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${lotteries} SET ${col('status')} = 'drawn', ${col('drawn_at')} = ${drawnAt} WHERE ${col('id')} = ${id}`,
  );
  return metaOf(r);
}

/* ---------- The draw (pure, injectable randomness) ---------- */

export interface DrawCandidate {
  discord_id: string;
  display_name: string;
  weight: number;
}

/**
 * Weighted sampling without replacement: each round picks one
 * remaining candidate with probability proportional to its weight,
 * then removes them from the pool — so one person can never win
 * twice in the same lottery. Non-positive weights count as 1 (the
 * mutation layer validates weights before this runs; the floor here
 * keeps the function total). Returns at most `count` winners (fewer
 * when the pool is smaller). `rand` returns [0, 1) and is injectable
 * so the harness can drive exact outcomes.
 */
export function drawWinners(
  entries: DrawCandidate[],
  count: number,
  rand: () => number = Math.random,
): DrawCandidate[] {
  const pool = entries.slice();
  const winners: DrawCandidate[] = [];
  const want = Math.max(0, Math.min(count, pool.length));
  for (let n = 0; n < want; n++) {
    let total = 0;
    for (const e of pool) total += Math.max(1, Math.floor(e.weight) || 1);
    let ticket = rand() * total;
    let idx = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      ticket -= Math.max(1, Math.floor(pool[i].weight) || 1);
      if (ticket < 0) { idx = i; break; }
    }
    winners.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return winners;
}
