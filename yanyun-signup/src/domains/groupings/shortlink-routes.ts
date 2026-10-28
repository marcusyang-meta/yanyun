/* groupings domain public short-link route: GET /c/:code
 * (standalone path, mounted at the root like the guild avatar
 * route — not part of the product REST surface).
 *
 * Landing split (access-policy ruling, 2026-10-28: shared links are
 * anonymously readable, non-shared links require login):
 * - A visitor who may view the car's guild (a signed-in member of a
 *   bound guild, or a signed-in viewer for an unbound guild)
 *   lands on the canonical car URL exactly as before, where the
 *   page's own gates apply.
 * - Everyone else (signed out, or signed in without membership)
 *   lands on the public share page /s/:code instead: the code is
 *   the capability and that page serves only the car's public face,
 *   read-only — the anonymous share view the policy grants, with no
 *   path from it to member data or mutations.
 * Unknown codes, malformed codes and codes whose car is gone all
 * 404 with the same plain shape as the avatar route. */
import { Hono, type Context } from 'hono';
import { getShortLinkByCode, SHORT_CODE_RE } from './shortlinks.ts';
import { getEventRowByTenant } from './events.ts';
import { parseGuildSubdomainSlug, isGuildSubdomainEnabled, isLiveCustomDomainHost } from '../guilds/index.ts';
import { getGuildAccess } from '../platform/graphql-base.ts';
import { getSessionUserChecked } from '../identity/auth.ts';
import type { Env } from '../platform/context.ts';

type ShortLinkContext = Context<{ Bindings: Env }>;

export const shortLinkRoutes = new Hono();
shortLinkRoutes.get('/c/:code', async (c: ShortLinkContext) => {
  const code = c.req.param('code') || '';
  if (!SHORT_CODE_RE.test(code)) return new Response('Not found', { status: 404 });
  const row = await getShortLinkByCode(c.env.DB, code).catch(() => null);
  if (!row) return new Response('Not found', { status: 404 });
  // The target may have been disbanded/deleted after the link was shared.
  const ev = await getEventRowByTenant(c.env.DB, row.event_id, row.tenant).catch(() => null);
  if (!ev) return new Response('Not found', { status: 404 });
  const reqUrl = new URL(c.req.url);
  // Landing split: only visitors who pass the guild's own view gate
  // earn the canonical (interactive) URL; the rest get the public
  // share page on the request's own origin.
  const checked = await getSessionUserChecked(c.req.raw, c.env)
    .catch(() => ({ user: null, clearCookie: false }));
  const access = await getGuildAccess(c.env.DB, checked.user, row.tenant, c.req.raw)
    .catch(() => ({ canView: false }));
  if (!access.canView) {
    return Response.redirect(new URL(`/s/${encodeURIComponent(code)}`, reqUrl).toString(), 302);
  }
  // A hit through the car's own guild subdomain lands on the clean
  // subdomain car path (the host names the guild); every other host
  // keeps the canonical slug path on the request's own origin, as
  // before.
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
