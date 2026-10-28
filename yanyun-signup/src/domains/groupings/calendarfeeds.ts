/* Calendar feed repository + iCal rendering (F8): one subscription
 * feed per guild. The feed's token is the credential — calendar apps
 * poll /cal/<token> without a session, so the token is a long random
 * base62 string (never derived from the slug or a sequence) and
 * resetting it replaces the row's token in place, revoking the old
 * link the moment the write lands. The admin surface mints lazily on
 * first read, exactly like the car share link.
 *
 * buildCalendarIcs is a pure function (rows in, RFC 5545 text out)
 * so the harness asserts the wire format — UTC timestamps, escaping,
 * 75-octet line folding — without a database. */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { calendarFeeds } from './schema.ts';
import type { EventRow } from './events.ts';

const col = (name: string) => sql.identifier(name);

// Same canonical-domain definition as shortlinks.ts.
const SITE_ORIGIN = 'https://yanyun.app';

export interface CalendarFeedRow {
  tenant: string;
  token: string;
  created_at: number;
  updated_at: number;
}

/* ---------- Token generation ---------- */

const TOKEN_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const CALENDAR_TOKEN_LENGTH = 32;
export const CALENDAR_TOKEN_RE = /^[0-9A-Za-z]{32}$/;

/** Random base62 token (62^32 space; collisions are retried on insert). */
export function generateCalendarToken(): string {
  const bytes = new Uint8Array(CALENDAR_TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += TOKEN_ALPHABET[b % TOKEN_ALPHABET.length];
  return out;
}

/* ---------- Reads ---------- */

export async function getCalendarFeedByTenant(
  d1: D1Database,
  tenant: string,
): Promise<CalendarFeedRow | null> {
  const db = createDb(d1);
  const row = await db.get<CalendarFeedRow>(
    sql`SELECT * FROM ${calendarFeeds} WHERE ${col('tenant')} = ${tenant}`,
  );
  return row ?? null;
}

export async function getCalendarFeedByToken(
  d1: D1Database,
  token: string,
): Promise<CalendarFeedRow | null> {
  const db = createDb(d1);
  const row = await db.get<CalendarFeedRow>(
    sql`SELECT * FROM ${calendarFeeds} WHERE ${col('token')} = ${token}`,
  );
  return row ?? null;
}

/* ---------- Mint / reset ---------- */

function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Returns the guild's existing feed, or mints one. A lost insert
 * race either hit the tenant primary key (adopt the winner's row)
 * or the token unique index (retry with a fresh token). `nextToken`
 * is injectable for tests.
 */
export async function mintCalendarFeed(
  d1: D1Database,
  tenant: string,
  nextToken: () => string = generateCalendarToken,
): Promise<CalendarFeedRow> {
  const existing = await getCalendarFeedByTenant(d1, tenant);
  if (existing) return existing;
  const db = createDb(d1);
  for (let attempt = 0; attempt < 8; attempt++) {
    const token = nextToken();
    const ts = nowSec();
    try {
      await db.run(
        sql`INSERT INTO ${calendarFeeds} (${col('tenant')}, ${col('token')}, ${col('created_at')}, ${col('updated_at')})
            VALUES (${tenant}, ${token}, ${ts}, ${ts})`,
      );
      return { tenant, token, created_at: ts, updated_at: ts };
    } catch {
      const winner = await getCalendarFeedByTenant(d1, tenant);
      if (winner) return winner;
      // Token collision with a different guild: loop for a fresh token.
    }
  }
  throw new Error('calendar feed mint failed');
}

/**
 * Reset = replace the token in place: the old link 404s from this
 * moment on. A guild without a feed gets one minted (reset on an
 * unminted feed is just the first mint). Token collision with
 * another guild retries with a fresh token.
 */
export async function resetCalendarFeed(
  d1: D1Database,
  tenant: string,
  nextToken: () => string = generateCalendarToken,
): Promise<CalendarFeedRow> {
  const existing = await getCalendarFeedByTenant(d1, tenant);
  if (!existing) return mintCalendarFeed(d1, tenant, nextToken);
  const db = createDb(d1);
  for (let attempt = 0; attempt < 8; attempt++) {
    const token = nextToken();
    if (token === existing.token) continue;
    const ts = nowSec();
    try {
      await db.run(
        sql`UPDATE ${calendarFeeds} SET ${col('token')} = ${token}, ${col('updated_at')} = ${ts} WHERE ${col('tenant')} = ${tenant}`,
      );
      return { tenant, token, created_at: existing.created_at, updated_at: ts };
    } catch {
      // Token taken by another guild: loop for a fresh token.
    }
  }
  throw new Error('calendar feed reset failed');
}

/* ---------- URL composition (the only place feed URLs are built) ---------- */

/* `origin` defaults to the main site; a request that arrived through
 * the guild's own subdomain passes its origin so a link the admin
 * copies there stays on that host (same rule as short links). */
export function calendarFeedUrl(token: string, origin: string = SITE_ORIGIN): string {
  return `${origin}/cal/${token}`;
}

export function calendarFeedPath(token: string): string {
  return `/cal/${token}`;
}

/* ---------- iCal rendering (RFC 5545) ---------- */

/** UTC basic format: YYYYMMDDTHHMMSSZ. */
export function icalUtc(epochSec: number): string {
  const d = new Date(epochSec * 1000);
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

/** TEXT escaping: backslash, semicolon, comma, newline (RFC 5545 §3.3.11). */
export function icalEscape(text: string): string {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/** Fold a content line to at most 75 octets per physical line
 * (RFC 5545 §3.1): continuation lines start with one space, and a
 * multi-byte character is never split across the fold. */
export function icalFold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out: string[] = [];
  let current = '';
  let currentBytes = 0;
  let limit = 75;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (currentBytes + b > limit) {
      out.push(current);
      current = ' ' + ch;
      currentBytes = 1 + b;
      limit = 75;
    } else {
      current += ch;
      currentBytes += b;
    }
  }
  if (current) out.push(current);
  return out.join('\r\n');
}

/* Groupings carry no end time; a feed event spans one hour from its
 * start so calendar clients render a block, not a zero-length point. */
export const CALENDAR_EVENT_DURATION_SEC = 3600;

export interface CalendarEventInput {
  id: number;
  title: string;
  description: string;
  meet_info: string;
  dungeon: string;
  starts_at_utc: number;
}

/**
 * The guild's whole feed as one VCALENDAR document. DTSTAMP comes
 * from `stampSec` (injected so the output is deterministic under
 * test); every VEVENT carries UID / DTSTAMP / DTSTART / DTEND in
 * UTC. The description assembles what the grouping entity holds:
 * its own description, then the dungeon line, then the canonical
 * car URL so a subscriber can jump from calendar to the car page.
 */
export function buildCalendarIcs(opts: {
  guildName: string;
  tenant: string;
  events: CalendarEventInput[];
  stampSec: number;
}): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Yanyun//Guild Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icalEscape(opts.guildName)}`,
  ];
  for (const ev of opts.events) {
    const start = ev.starts_at_utc;
    const descParts: string[] = [];
    if (ev.description) descParts.push(ev.description);
    if (ev.dungeon) descParts.push(ev.dungeon);
    descParts.push(`${SITE_ORIGIN}/${encodeURIComponent(opts.tenant)}/car/${ev.id}`);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:grouping-${ev.id}@yanyun.app`);
    lines.push(`DTSTAMP:${icalUtc(opts.stampSec)}`);
    lines.push(`DTSTART:${icalUtc(start)}`);
    lines.push(`DTEND:${icalUtc(start + CALENDAR_EVENT_DURATION_SEC)}`);
    lines.push(`SUMMARY:${icalEscape(ev.title)}`);
    if (ev.meet_info) lines.push(`LOCATION:${icalEscape(ev.meet_info)}`);
    lines.push(`DESCRIPTION:${icalEscape(descParts.join('\n'))}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(icalFold).join('\r\n') + '\r\n';
}

/** Row-shape adapter: EventRow -> the builder's input shape. */
export function calendarEventInput(row: EventRow): CalendarEventInput | null {
  if (row.starts_at_utc == null) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    meet_info: row.meet_info || '',
    dungeon: row.dungeon || '',
    starts_at_utc: row.starts_at_utc,
  };
}
