/* identity domain service: the personal calendar subscription
 * (free feature, migration 0041). Each signed-in member owns one
 * unguessable token; the token IS the credential for a public
 * read-only iCalendar feed (GET /calendar/<token>.ics) carrying
 * only that member's own signed-up, not-yet-ended cars. The token
 * lives in the data layer (user_calendar_tokens), is lazy-minted
 * the first time the member's settings surface asks for it — the
 * same lazy-mint shape as the detail page's share short link —
 * and is resettable from those settings, which overwrites the row
 * in place (the old URL dies immediately).
 *
 * "Not yet ended": cars carry only a start instant, so the feed
 * assumes a 2-hour duration (stated as an estimate in every
 * event's description) and keeps a car while start + 2h is still
 * ahead; disbanded / completed / draft cars never appear. The
 * feed contains no other member's data: seats are read strictly
 * by the owner's own discord_id stamp. */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { userCalendarTokens } from './schema.ts';
import { getAccountRow } from './users.ts';
import { listCalendarSeatsByDiscordId } from '../groupings/index.ts';
import { getTenantRowById } from '../guilds/index.ts';
import { translate } from '../platform/i18n.ts';

const col = (name: string) => sql.identifier(name);
const nowSec = () => Math.floor(Date.now() / 1000);

/* Canonical site origin (same literal as groupings/shortlinks.ts
 * SITE_ORIGIN and groupings/reminder.ts SITE_URL; URL composition
 * for public links lives with each surface by codebase precedent). */
const SITE_ORIGIN = 'https://yanyun.app';

/** Assumed car duration for the feed, in seconds (2h). */
export const CALENDAR_CAR_DURATION_SEC = 2 * 3600;

export function calendarFeedUrl(token: string): string {
  return `${SITE_ORIGIN}/calendar/${token}.ics`;
}

/* 24 random bytes, base64url — 32 chars, ~192 bits of entropy. */
export function mintCalendarToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function getCalendarToken(d1: D1Database, userId: number): Promise<string | null> {
  const db = createDb(d1);
  const row = await db.get<{ token: string }>(
    sql`SELECT ${col('token')} FROM ${userCalendarTokens} WHERE ${col('user_id')} = ${userId}`,
  );
  return row?.token ?? null;
}

/** The member's token, minted on first use. */
export async function ensureCalendarToken(d1: D1Database, userId: number): Promise<string> {
  const existing = await getCalendarToken(d1, userId);
  if (existing) return existing;
  const token = mintCalendarToken();
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${userCalendarTokens} (${col('user_id')}, ${col('token')}, ${col('updated_at')})
        VALUES (${userId}, ${token}, ${nowSec()})
        ON CONFLICT(${col('user_id')}) DO NOTHING`,
  );
  // A concurrent first-read may have won the insert; re-read so the
  // caller always gets the stored token.
  return (await getCalendarToken(d1, userId)) || token;
}

/** Reset: overwrite the row with a fresh token; the old URL dies. */
export async function rotateCalendarToken(d1: D1Database, userId: number): Promise<string> {
  const token = mintCalendarToken();
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${userCalendarTokens} (${col('user_id')}, ${col('token')}, ${col('updated_at')})
        VALUES (${userId}, ${token}, ${nowSec()})
        ON CONFLICT(${col('user_id')}) DO UPDATE SET ${col('token')} = ${token}, ${col('updated_at')} = ${nowSec()}`,
  );
  return token;
}

export async function getCalendarTokenOwner(d1: D1Database, token: string): Promise<number | null> {
  if (!token || token.length > 64) return null;
  const db = createDb(d1);
  const row = await db.get<{ user_id: number }>(
    sql`SELECT ${col('user_id')} FROM ${userCalendarTokens} WHERE ${col('token')} = ${token}`,
  );
  return row ? Number(row.user_id) : null;
}

/* ---------------- ICS composition (pure) ------------------------ */

export interface CalendarFeedCar {
  eventId: number;
  title: string;
  startsAtUtc: number;
  guildName: string;
  carUrl: string;
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function icsUtc(epochSec: number): string {
  const d = new Date(epochSec * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

/* Fold content lines at 75 octets (RFC 5545) without splitting a
 * multi-byte UTF-8 character. */
function icsFold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out: string[] = [];
  let current = '';
  let currentBytes = 0;
  let budget = 75;
  for (const ch of line) {
    const len = enc.encode(ch).length;
    if (currentBytes + len > budget) {
      out.push(current);
      current = ' ' + ch;
      currentBytes = 1 + len;
      budget = 75;
    } else {
      current += ch;
      currentBytes += len;
    }
  }
  out.push(current);
  return out.join('\r\n');
}

/** Build the member's iCalendar document. Pure: the caller has
 * already selected exactly the cars the feed may carry. */
export function buildCalendarIcs(
  cars: CalendarFeedCar[], opts: { nowSec: number; calName: string; durationNote: string; ownerUserId: number },
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//yanyun//calendar-feed//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape(opts.calName)}`,
  ];
  for (const car of cars) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:car-${car.eventId}-u${opts.ownerUserId}@yanyun.app`,
      `DTSTAMP:${icsUtc(opts.nowSec)}`,
      `DTSTART:${icsUtc(car.startsAtUtc)}`,
      `DTEND:${icsUtc(car.startsAtUtc + CALENDAR_CAR_DURATION_SEC)}`,
      `SUMMARY:${icsEscape(car.title)}`,
      `LOCATION:${icsEscape(car.guildName)}`,
      `DESCRIPTION:${icsEscape(`${opts.durationNote}\n${car.carUrl}`)}`,
      `URL:${car.carUrl}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(icsFold).join('\r\n') + '\r\n';
}

/* ---------------- feed assembly --------------------------------- */

/** Resolve a feed token to the ICS document. Returns null for an
 * unknown token (the route answers 404, indistinguishable from
 * every other missing path). */
export async function buildCalendarFeed(d1: D1Database, token: string): Promise<string | null> {
  const ownerId = await getCalendarTokenOwner(d1, token);
  if (ownerId == null) return null;
  const account = await getAccountRow(d1, ownerId).catch(() => null);
  if (!account) return null;
  const now = nowSec();
  const seats = await listCalendarSeatsByDiscordId(d1, account.discord_id).catch(() => []);
  const locale = account.locale_pref || 'zh-CN';
  const tenantNames = new Map<number, { slug: string; name: string }>();
  const cars: CalendarFeedCar[] = [];
  for (const seat of seats || []) {
    if (seat.starts_at_utc == null) continue;
    if (seat.event_status !== 'open' && seat.event_status !== 'closed') continue;
    if (Number(seat.starts_at_utc) + CALENDAR_CAR_DURATION_SEC <= now) continue;
    let tenant = tenantNames.get(seat.tenant);
    if (!tenant) {
      const row = await getTenantRowById(d1, seat.tenant).catch(() => null);
      tenant = { slug: row ? row.slug : '', name: row ? row.guild_name || row.slug : '' };
      tenantNames.set(seat.tenant, tenant);
    }
    if (!tenant.slug) continue;
    cars.push({
      eventId: seat.event_id,
      title: seat.event_title || '',
      startsAtUtc: Number(seat.starts_at_utc),
      guildName: tenant.name,
      carUrl: `${SITE_ORIGIN}/${encodeURIComponent(tenant.slug)}/car/${seat.event_id}`,
    });
  }
  return buildCalendarIcs(cars, {
    nowSec: now,
    calName: translate('settings_calendarName', locale),
    durationNote: translate('settings_calendarDurationNote', locale),
    ownerUserId: ownerId,
  });
}
