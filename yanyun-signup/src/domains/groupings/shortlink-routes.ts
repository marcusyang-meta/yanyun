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
import { parseGuildSubdomainSlug, isGuildSubdomainEnabled, isLiveCustomDomainHost } from '../guilds/index.ts';

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
  // A hit through the car's own guild subdomain lands on the clean
  // subdomain car path (the host names the guild); every other host
  // keeps the canonical slug path on the request's own origin, as
  // before.
  const reqUrl = new URL(c.req.url);
  const onOwnSubdomain = parseGuildSubdomainSlug(reqUrl.hostname) === row.tenant
    && await isGuildSubdomainEnabled(c.env.DB, row.tenant).catch(() => false);
  // Same rule for the guild's own custom domain (white-label
  // tier B): a hit through it lands on the clean car path there.
  const onOwnCustomDomain = !onOwnSubdomain
    && await isLiveCustomDomainHost(c.env.DB, reqUrl.hostname, row.tenant).catch(() => false);
  const target = onOwnSubdomain || onOwnCustomDomain
    ? new URL(`/car/${row.event_id}`, reqUrl)
    : new URL(`/${encodeURIComponent(row.tenant)}/car/${row.event_id}`, reqUrl);
  return Response.redirect(target.toString(), 302);
});
