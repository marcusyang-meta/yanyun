/* Short-link repository: share aliases of the form /c/<code> for
 * groupings (cars). One stable code per (tenant, event_id): the
 * detail-page shell mints lazily on first read and every later read
 * reuses the same row, so a shared link never changes. Codes are
 * random base62 (never derived from the sequential event id, so a
 * code cannot be enumerated into neighbouring cars). The alias is
 * privacy-neutral: resolving it only redirects to the canonical car
 * URL, whose own login/membership gates apply unchanged. */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { shortLinks } from './schema.ts';

const col = (name: string) => sql.identifier(name);

// Same canonical-domain definition as guilds/guildavatar.ts.
const SITE_ORIGIN = 'https://yanyun.app';

export interface ShortLinkRow {
  code: string;
  tenant: string;
  event_id: number;
  created_at: number;
}

/* ---------- Lazy DDL ---------- */

let shortLinksTableReady: Promise<void> | null = null;
export function ensureShortLinksTable(d1: D1Database): Promise<void> {
  if (!shortLinksTableReady) {
    shortLinksTableReady = (async () => {
      try {
        const db = createDb(d1);
        await db.run(sql`CREATE TABLE IF NOT EXISTS ${shortLinks} (
          code TEXT PRIMARY KEY,
          tenant TEXT NOT NULL DEFAULT '',
          event_id INTEGER NOT NULL,
          created_at INTEGER NOT NULL DEFAULT 0
        )`);
        await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS short_links_target_unique
          ON short_links (tenant, event_id)`);
      } catch { /* Table-creation failure is silent: sharing falls back to the canonical URL. */ }
    })();
  }
  return shortLinksTableReady;
}

/* ---------- Code generation ---------- */

const CODE_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const SHORT_CODE_LENGTH = 7;
export const SHORT_CODE_RE = /^[0-9A-Za-z]{7}$/;

/** Random base62 code (62^7 ≈ 3.5e12 space; collisions are retried on insert). */
export function generateShortCode(): string {
  const bytes = new Uint8Array(SHORT_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return out;
}

/* ---------- Reads ---------- */

export async function getShortLinkByCode(
  d1: D1Database,
  code: string,
): Promise<ShortLinkRow | null> {
  await ensureShortLinksTable(d1);
  const db = createDb(d1);
  const row = await db.get<ShortLinkRow>(
    sql`SELECT * FROM ${shortLinks} WHERE ${col('code')} = ${code}`,
  );
  return row ?? null;
}

export async function getShortLinkByTarget(
  d1: D1Database,
  tenant: string,
  eventId: number,
): Promise<ShortLinkRow | null> {
  await ensureShortLinksTable(d1);
  const db = createDb(d1);
  const row = await db.get<ShortLinkRow>(
    sql`SELECT * FROM ${shortLinks} WHERE ${col('tenant')} = ${tenant} AND ${col('event_id')} = ${eventId}`,
  );
  return row ?? null;
}

/* ---------- Mint (get-or-create, stable per target) ---------- */

async function insertShortLink(
  d1: D1Database,
  code: string,
  tenant: string,
  eventId: number,
): Promise<ShortLinkRow> {
  const db = createDb(d1);
  const createdAt = Math.floor(Date.now() / 1000);
  await db.run(
    sql`INSERT INTO ${shortLinks} (${col('code')}, ${col('tenant')}, ${col('event_id')}, ${col('created_at')})
        VALUES (${code}, ${tenant}, ${eventId}, ${createdAt})`,
  );
  return { code, tenant, event_id: eventId, created_at: createdAt };
}

/**
 * Returns the target's existing link, or mints one. An insert can
 * lose two races — the code was taken by another target (retry with
 * a fresh code) or a concurrent mint for the same target won (adopt
 * the winner's row). `nextCode` is injectable for tests.
 */
export async function mintShortLink(
  d1: D1Database,
  tenant: string,
  eventId: number,
  nextCode: () => string = generateShortCode,
): Promise<ShortLinkRow> {
  const existing = await getShortLinkByTarget(d1, tenant, eventId);
  if (existing) return existing;
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = nextCode();
    try {
      return await insertShortLink(d1, code, tenant, eventId);
    } catch {
      const winner = await getShortLinkByTarget(d1, tenant, eventId);
      if (winner) return winner;
      // Code collision with a different target: loop for a fresh code.
    }
  }
  throw new Error('short link mint failed');
}

/* ---------- URL composition (the only place share URLs are built) ---------- */

export function shortLinkUrl(code: string): string {
  return `${SITE_ORIGIN}/c/${code}`;
}

export function canonicalGroupingUrl(tenant: string, eventId: number): string {
  return `${SITE_ORIGIN}/${encodeURIComponent(tenant)}/car/${eventId}`;
}
