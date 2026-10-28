/* groupings domain public calendar-feed route: GET /cal/:token
 * (standalone path, mounted at the root like the short-link route —
 * not part of the product REST surface). The token IS the credential:
 * calendar clients poll without a session, so a hit serves the
 * guild's groupings as text/calendar (RFC 5545, built by the
 * calendar-feed service). Unknown or malformed tokens — including a
 * token revoked by an admin reset — 404 with the same plain shape as
 * the avatar/short-link routes; a token never leaks which guild it
 * belonged to. */
import { Hono, type Context } from 'hono';
import {
  getCalendarFeedByToken, buildCalendarIcs, calendarEventInput,
  CALENDAR_TOKEN_RE,
} from './calendarfeeds.ts';
import { listEventsForCalendar } from './events.ts';
import { getTenantRow } from '../guilds/index.ts';

type CalendarContext = Context<{ Bindings: { DB: D1Database } }>;

export const calendarRoutes = new Hono();
calendarRoutes.get('/cal/:token', async (c: CalendarContext) => {
  const token = c.req.param('token') || '';
  if (!CALENDAR_TOKEN_RE.test(token)) return new Response('Not found', { status: 404 });
  const feed = await getCalendarFeedByToken(c.env.DB, token).catch(() => null);
  if (!feed) return new Response('Not found', { status: 404 });
  const tenant = await getTenantRow(c.env.DB, feed.tenant).catch(() => null);
  if (!tenant) return new Response('Not found', { status: 404 });
  const rows = await listEventsForCalendar(c.env.DB, feed.tenant).catch(() => []);
  const events = rows.map(calendarEventInput).filter((e) => e !== null);
  const ics = buildCalendarIcs({
    guildName: tenant.guild_name || feed.tenant,
    tenant: feed.tenant,
    events,
    stampSec: Math.floor(Date.now() / 1000),
  });
  return new Response(ics, {
    status: 200,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `inline; filename="${feed.tenant}.ics"`,
      'cache-control': 'private, max-age=300',
    },
  });
});
