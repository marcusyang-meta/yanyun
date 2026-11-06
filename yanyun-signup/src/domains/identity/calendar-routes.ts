/* identity domain public calendar feed route: GET
 * /calendar/<token>.ics (standalone path, mounted at the root like
 * the guild avatar path). The token IS the credential: an unknown
 * token answers 404, indistinguishable from a missing path. The
 * document carries only the token owner's own signed-up,
 * not-yet-ended cars (see identity/calendar.ts); no session is
 * involved — calendar apps subscribe anonymously with the URL. */
import { Hono } from 'hono';
import { buildCalendarFeed } from './calendar.ts';

export const calendarFeedRoutes = new Hono();
calendarFeedRoutes.get('/calendar/:file', async (c: any) => {
  const file = String(c.req.param('file') || '');
  const token = file.endsWith('.ics') ? file.slice(0, -4) : '';
  const ics = token ? await buildCalendarFeed(c.env.DB, token).catch(() => null) : null;
  if (!ics) return new Response('Not found', { status: 404 });
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      // Short private cache: calendar apps poll on their own
      // schedule anyway; five minutes keeps a reset's old document
      // from lingering at the edge.
      'Cache-Control': 'private, max-age=300',
    },
  });
});
