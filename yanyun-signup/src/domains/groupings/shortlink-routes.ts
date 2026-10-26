/* groupings domain public short-link route: GET /c/:code
 * (standalone path, mounted at the root like the guild avatar
 * route — not part of the product REST surface). A hit 302s to the
 * canonical car URL; crawlers follow the redirect and pick up the
 * target page's OG tags as usual. Unknown codes, malformed codes
 * and codes whose car is gone all 404 with the same plain shape as
 * the avatar route. The alias grants nothing: the target page's
 * own login/membership gates apply after the redirect. */
import { Hono, type Context } from 'hono';
import { getShortLinkByCode, SHORT_CODE_RE } from './shortlinks.ts';
import { getEventRowByTenant } from './events.ts';

type ShortLinkContext = Context<{ Bindings: { DB: D1Database } }>;

export const shortLinkRoutes = new Hono();
shortLinkRoutes.get('/c/:code', async (c: ShortLinkContext) => {
  const code = c.req.param('code') || '';
  if (!SHORT_CODE_RE.test(code)) return new Response('Not found', { status: 404 });
  const row = await getShortLinkByCode(c.env.DB, code).catch(() => null);
  if (!row) return new Response('Not found', { status: 404 });
  // The target may have been disbanded/deleted after the link was shared.
  const ev = await getEventRowByTenant(c.env.DB, row.event_id, row.tenant).catch(() => null);
  if (!ev) return new Response('Not found', { status: 404 });
  const target = new URL(
    `/${encodeURIComponent(row.tenant)}/car/${row.event_id}`,
    c.req.url,
  );
  return Response.redirect(target.toString(), 302);
});
