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
 * 404 with the same plain shape as the avatar route.
 *
 * Link-preview crawlers (chat/social unfurlers) are the exception:
 * they do not reliably follow redirects, so a bare 302 leaves the
 * pasted link faceless in the apps members actually share into.
 * For a recognised preview-bot user agent the short link instead
 * answers 200 with a minimal document carrying the car's share tags
 * (the exact set carShareOgTags injects on the /s/ page — the
 * public projection only, never member data) plus a zero-second
 * meta refresh to the share page, so a human arriving through a
 * misdetected UA is never stuck on the stub. A code that does not
 * resolve renders no named tags, exactly like the share page
 * itself; malformed codes still 404 for every UA. */
import { Hono, type Context } from 'hono';
import { getShortLinkByCode, SHORT_CODE_RE } from './shortlinks.ts';
import { getEventRowByTenant } from './events.ts';
import { parseGuildSubdomainSlug, isGuildSubdomainEnabled, isLiveCustomDomainHost, getTenantRowById } from '../guilds/index.ts';
import { getGuildAccess } from '../platform/graphql-base.ts';
import { carShareOgTags } from '../platform/og.ts';
import { getSessionUserChecked } from '../identity/auth.ts';
import type { Env } from '../platform/context.ts';

type ShortLinkContext = Context<{ Bindings: Env }>;

/* Preview-bot UA tokens: the mainstream chat/social unfurlers,
 * matched case-insensitively as substrings. Deliberately a closed
 * list — ordinary browsers (and anything unlisted) keep the plain
 * redirect behaviour below. */
const LINK_PREVIEW_BOT_TOKENS = [
  'discordbot', 'twitterbot', 'facebookexternalhit', 'whatsapp',
  'telegrambot', 'slackbot', 'linkedinbot', 'micromessenger',
  'mqqbrowser', 'qq/',
];
export function isLinkPreviewBot(userAgent: string): boolean {
  const ua = (userAgent || '').toLowerCase();
  return LINK_PREVIEW_BOT_TOKENS.some((t) => ua.includes(t));
}

/* The crawler document served at the short URL itself: the car's
 * share tags (or none for a dead code) + an instant refresh to the
 * share page on the request's own origin. */
async function shortLinkPreviewResponse(env: Env, code: string, reqUrl: URL): Promise<Response> {
  const tags = await carShareOgTags(env, code).catch(() => null);
  const target = new URL(`/s/${encodeURIComponent(code)}`, reqUrl).toString();
  const html = [
    '<!doctype html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="utf-8" />',
    tags || '',
    `<meta http-equiv="refresh" content="0; url=${target}" />`,
    '</head>',
    '<body>',
    `<p><a href="${target}">${target}</a></p>`,
    '</body>',
    '</html>',
  ].join('\n');
  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' },
  });
}

export const shortLinkRoutes = new Hono();
shortLinkRoutes.get('/c/:code', async (c: ShortLinkContext) => {
  const code = c.req.param('code') || '';
  if (!SHORT_CODE_RE.test(code)) return new Response('Not found', { status: 404 });
  if (isLinkPreviewBot(c.req.header('user-agent') || '')) {
    return shortLinkPreviewResponse(c.env, code, new URL(c.req.url));
  }
  const row = await getShortLinkByCode(c.env.DB, code).catch(() => null);
  if (!row) return new Response('Not found', { status: 404 });
  // The target may have been disbanded/deleted after the link was shared.
  const ev = await getEventRowByTenant(c.env.DB, row.event_id, row.tenant).catch(() => null);
  if (!ev) return new Response('Not found', { status: 404 });
  const tenantRow = await getTenantRowById(c.env.DB, row.tenant).catch(() => null);
  const tenantSlug = tenantRow ? tenantRow.slug : '';
  const reqUrl = new URL(c.req.url);
  // Landing split: only visitors who pass the guild's own view gate
  // earn the canonical (interactive) URL; the rest get the public
  // share page on the request's own origin.
  const checked = await getSessionUserChecked(c.req.raw, c.env)
    .catch(() => ({ user: null, clearCookie: false }));
  const access = await getGuildAccess(c.env.DB, checked.user, tenantSlug, c.req.raw)
    .catch(() => ({ canView: false }));
  if (!access.canView) {
    return Response.redirect(new URL(`/s/${encodeURIComponent(code)}`, reqUrl).toString(), 302);
  }
  // A hit through the car's own guild subdomain lands on the clean
  // subdomain car path (the host names the guild); every other host
  // keeps the canonical slug path on the request's own origin, as
  // before.
  const onOwnSubdomain = parseGuildSubdomainSlug(reqUrl.hostname) === tenantSlug
    && await isGuildSubdomainEnabled(c.env.DB, tenantSlug).catch(() => false);
  // Same rule for the guild's own custom domain (white-label
  // tier B): a hit through it lands on the clean car path there.
  const onOwnCustomDomain = !onOwnSubdomain
    && await isLiveCustomDomainHost(c.env.DB, reqUrl.hostname, tenantSlug).catch(() => false);
  const target = onOwnSubdomain || onOwnCustomDomain
    ? new URL(`/car/${row.event_id}`, reqUrl)
    : new URL(`/${encodeURIComponent(tenantSlug)}/car/${row.event_id}`, reqUrl);
  return Response.redirect(target.toString(), 302);
});
