// Assembly layer only: Hono app + middleware, domain route mounts,
// GraphQL context construction, SPA/OG entry dispatch, live-subscription
// entry. Business logic lives in src/domains/<domain>/; cross-domain
// access goes through the other domain's service surface (index.ts).

export { SeatHub, GuildHub } from './domains/groupings/index.ts';
import { buildContext } from './domains/platform/context.ts';
import type { Env } from './domains/platform/context.ts';
import { Hono } from 'hono';
import { yoga } from './graphql.ts';
import { getGuildAccess, negotiateLocale } from './domains/platform/graphql-base.ts';
import { getSessionUserChecked, sessionCookieHeaders, handleDiscordLogin, handleDiscordCallback, handleLogout, getUserLocalePref } from './domains/identity/auth.ts';
import { runDueAccountDeletions } from './domains/identity/index.ts';
import { maybeRunCreatorBackfill } from './creatorbackfill.js';
import { maybeRunCreatorManualFix } from './creatormanualfix.js';
import { logError, runScheduledBackup, configureGateRuntime } from './domains/platform/index.ts';
import { err } from './domains/platform/http.ts';
import { hubOgTags, guildOgTags, carOgTags, buildOgTags } from './domains/platform/og.ts';
import { getTenantSlug, parseGuildSubdomainSlug, resolveGuildSubdomain, guildSubdomainOrigin } from './domains/guilds/index.ts';
import { hubRoutes } from './domains/platform/hub-routes.ts';
import { billingRoutes } from './domains/platform/billing-routes.ts';
import { guildAvatarRoutes } from './domains/guilds/avatar-routes.ts';
import { shortLinkRoutes } from './domains/groupings/shortlink-routes.ts';

/* Hono app */
const app = new Hono();

// Uncaught-exception sink (audit A7): exceptions escaping REST handlers
// land in error_log; the response keeps the uniform err shape. Expected
// failures inside business code return via err() and never reach here.
app.onError((e: any, c: any) => {
  try { c.executionCtx.waitUntil(logError(c.env.DB, { source: 'rest', error: e, context: { path: new URL(c.req.url).pathname } })); }
  catch { void logError(c.env.DB, { source: 'rest', error: e }); }
  return err('服务器内部错误', 500);
});

// Rate-limit IP, captured once per /api request.
app.use('/api/*', async (c: any, next: any) => {
  c.set('ip', c.req.header('cf-connecting-ip') || 'local');
  await next();
});

app.route('/api/hub', hubRoutes);
app.route('/', billingRoutes); // Stripe webhook /stripe/webhook (signature-authenticated, no session)
app.route('/', guildAvatarRoutes); // avatar public path /guilds/:slug/avatar (standalone, survives the REST shutdown)
app.route('/', shortLinkRoutes); // share short links /c/:code -> 302 to the canonical car URL

app.all('/graphql', async (c: any) => {
  // Sessions with incomplete Discord authorization are voided here
  // (user=null + cookie cleared), same path as having no cookie.
  const checked = await getSessionUserChecked(c.req.raw, c.env)
    .catch(() => ({ user: null, clearCookie: false }));
  // Locale: the frontend sends x-locale (mirroring account preference or
  // browser language); the backend negotiates it to a supported locale
  // (zh-TW/en/es/fr, else zh-CN source). A signed-in user's stored
  // account preference (users.locale_pref) beats the header — server wins.
  const browserLocale = negotiateLocale(c.req.header('x-locale'));
  const pref = checked.user
    ? await getUserLocalePref(c.env, checked.user.discordId).catch(() => null)
    : null;
  // Assembly edge: build the three-layer context once — RequestContext
  // (framework) wraps env/request/executionCtx, ViewerContext carries
  // identity only; resolvers and shells receive the Context layer.
  const res = await yoga.fetch(c.req.raw, buildContext(
    { env: c.env, request: c.req.raw, executionCtx: c.executionCtx },
    {
      user: checked.user,
      locale: pref || browserLocale,
      browserLocale,
      // Client timezone (IANA): used only so time copy in the mobile block
      // tree is rendered in the viewer's timezone; web sends none.
      tz: c.req.header('x-tz') || null,
    },
  ));
  // One-off lazy backfill (legacy cars without a creator get seat 1
  // registered): guarded inside by a production-host gate + settings
  // flag, never fires on preview/localhost; runs via waitUntil and
  // fails silently without affecting this request.
  try { c.executionCtx.waitUntil(maybeRunCreatorBackfill(c.env, c.req.raw)); } catch { /* silent when there is no executionCtx */ }
  // One-off manual ownership fix (cars 39/40, specified by the user
  // 2026-10-25): same production-host gate + settings flag as above,
  // never fires on preview.
  try { c.executionCtx.waitUntil(maybeRunCreatorManualFix(c.env, c.req.raw)); } catch { /* silent when there is no executionCtx */ }
  // GraphQL-layer 5xx sink: single-field uncaught errors are logged by
  // the yoga plugin in graphql.ts; this catches whole-request failures.
  if (res.status >= 500) {
    try { c.executionCtx.waitUntil(logError(c.env.DB, { source: 'graphql', name: 'HttpError', message: `GraphQL 请求返回 ${res.status}` })); }
    catch { /* silent when there is no executionCtx */ }
  }
  if (checked.clearCookie) {
    const headers = new Headers(res.headers);
    for (const cookie of sessionCookieHeaders('', 0, new URL(c.req.url).hostname)) {
      headers.append('set-cookie', cookie);
    }
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }
  return res;
});

// Unmatched /api/* -> 404.
app.notFound((c: any) => err('接口不存在', 404));

async function handleGuildLive(request: any, env: any, slug: string) {
  if (request.headers.get('Upgrade') !== 'websocket') {
    return err('需要 WebSocket 连接', 426);
  }
  if (!env.GUILD_HUB) return err('实时服务未启用', 503);
  const checked = await getSessionUserChecked(request, env)
    .catch(() => ({ user: null, clearCookie: false }));
  const access: any = await getGuildAccess(env.DB, checked.user, slug, request)
    .catch(() => ({ exists: false, canView: false }));
  if (!access.exists || !access.canView) {
    const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });
    if (checked.clearCookie) {
      for (const cookie of sessionCookieHeaders('', 0, new URL(request.url).hostname)) {
        headers.append('set-cookie', cookie);
      }
    }
    return new Response(JSON.stringify({ ok: false, message: '无权订阅该百业的实时更新' }), { status: 403, headers });
  }
  const stub = env.GUILD_HUB.get(env.GUILD_HUB.idFromName('guild:' + access.slug));
  return stub.fetch(request);
}
async function handleFetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Platform subdomains (white-label tier A): a {slug}.yanyun.app
    // host exists as a site only while that guild's subdomain switch
    // is on. An unopened or unknown subdomain gets the plain 404 for
    // every path — identical either way, so labels cannot be
    // enumerated and main-site content never leaks onto arbitrary
    // hosts. When a subdomain resolves, hostGuild/hostOrigin thread
    // through the SPA dispatch below; every main-host path is
    // byte-identical to before (both stay null).
    let hostGuild: string | null = null;
    let hostOrigin: string | null = null;
    if (parseGuildSubdomainSlug(url.hostname)) {
      hostGuild = await resolveGuildSubdomain(env.DB, url.hostname).catch(() => null);
      if (!hostGuild) return new Response('Not found', { status: 404 });
      hostOrigin = guildSubdomainOrigin(hostGuild);
    }

    // Discord OAuth (login/callback/logout): handled by the Worker, not the SPA.
    if (path === '/auth/discord/login') return handleDiscordLogin(request, env);
    if (path === '/auth/discord/callback') return handleDiscordCallback(request, env);
    if (path === '/auth/logout') return handleLogout(request);

    // Live push subscription (WS): separate from Hono REST/GraphQL routing.
    if (path.startsWith('/ws/guild/')) {
      const slug = decodeURIComponent(path.slice('/ws/guild/'.length).split('/')[0] || '');
      return handleGuildLive(request, env, slug);
    }

    if (path.startsWith('/api/') || path === '/graphql' || path === '/stripe/webhook' || /^\/guilds\/[^/]+\/avatar$/.test(path) || /^\/c\/[^/]+$/.test(path)) {
      return app.fetch(request, env, ctx);
    }

    const serveAsset = async (assetPath: string) => {
      const u = new URL(request.url);
      u.pathname = assetPath;
      let res = await env.ASSETS.fetch(new Request(u.toString(), request));
      // The asset layer may clean-URL-redirect .html; follow internally so
      // the browser URL stays unchanged.
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (loc) res = await env.ASSETS.fetch(new Request(new URL(loc, u).toString(), request));
      }
      return res;
    };
    const findTenant = async (slug: string) => {
      try {
        return await getTenantSlug(env.DB, slug);
      } catch { return null; } // Table not created yet = no tenant.
    };
    // React SPA entry: serve index.html with OG tags injected (null = none).
    const serveSpa = async (ogTags: any) => {
      const res = await serveAsset('/index.html');
      if (!res.ok) return res;
      let html = await res.text();
      if (ogTags) {
        const idx = html.indexOf('</head>');
        if (idx !== -1) html = html.slice(0, idx) + ogTags + '\n' + html.slice(idx);
      }
      return new Response(html, {
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' },
      });
    };

    // Legacy admin pages + old-path redirects.
    if (path === '/hub-admin.html') return serveAsset('/hub-admin.html');
    if (path === '/index.html' || path === '/admin.html') {
      return Response.redirect(new URL('/', url).toString(), 301);
    }
    if (path === '/gadmin.html') {
      return Response.redirect(new URL('/', url).toString(), 301); // Must be visited with a slug.
    }

    const seg = path.split('/').filter(Boolean);
    const slugRe = /^[a-z0-9-]{2,30}$/;
    // Legacy share path /<slug>/cars/:id -> /<slug>/car/:id.
    if (seg.length === 3 && seg[1] === 'cars' && slugRe.test(seg[0]) && /^\d+$/.test(seg[2])) {
      if (await findTenant(seg[0])) {
        return Response.redirect(new URL(`/${seg[0]}/car/${seg[2]}`, url).toString(), 301);
      }
    }
    // Subdomain-native shapes: on the guild's own subdomain the slug
    // segment is the host itself, so /car/:id and /admin are this
    // guild's car page / admin page, and / is its front page. Other
    // guilds' slug paths do not exist under this host (plain 404 in
    // the shared branches below).
    if (hostGuild && hostOrigin) {
      if (seg.length === 2 && seg[0] === 'cars' && /^\d+$/.test(seg[1])) {
        return Response.redirect(new URL(`/car/${seg[1]}`, url).toString(), 301);
      }
      if (seg.length === 2 && seg[0] === 'car' && /^\d+$/.test(seg[1])) {
        return serveSpa(await carOgTags(env, hostGuild, seg[1], `${hostOrigin}/car/${seg[1]}`));
      }
      if (seg.length === 1 && seg[0] === 'admin') return serveSpa(null);
    }
    // / -> guild hub (React) + home OG; on a guild subdomain, the
    // guild's own front page + its OG tags (og:url = the subdomain root).
    if (path === '/') {
      return serveSpa(hostGuild && hostOrigin
        ? await guildOgTags(env, hostGuild, `${hostOrigin}/`)
        : hubOgTags());
    }
    // /b/:code -> public build share page (React, anonymous) + build OG
    // tags; unknown/revoked codes inject nothing and the page renders
    // its not-found state. The static segment must win over /:slug.
    if (seg.length === 2 && seg[0] === 'b') {
      return serveSpa(await buildOgTags(env, seg[1]));
    }
    // /<slug>/car/:id -> car detail (React) + car OG; unknown tenants still
    // get the SPA, which renders the not-found state.
    if (seg.length === 3 && seg[1] === 'car' && slugRe.test(seg[0]) && /^\d+$/.test(seg[2])) {
      if (await findTenant(seg[0])) {
        if (hostGuild && seg[0] !== hostGuild) return new Response('Not found', { status: 404 });
        return serveSpa(await carOgTags(env, seg[0], seg[2],
          hostGuild && hostOrigin ? `${hostOrigin}/car/${seg[2]}` : undefined));
      }
      return serveSpa(null);
    }
    // /<slug> -> guild front page (React) + guild OG.
    if (seg.length === 1 && slugRe.test(seg[0])) {
      if (await findTenant(seg[0])) {
        if (hostGuild && seg[0] !== hostGuild) return new Response('Not found', { status: 404 });
        return serveSpa(await guildOgTags(env, seg[0],
          hostGuild && hostOrigin ? `${hostOrigin}/` : undefined));
      }
      return serveSpa(null);
    }
    // Static assets (React build output, admin JS/CSS, images).
    const res = await env.ASSETS.fetch(request);
    // SPA fallback: unknown extensionless paths go to the client router.
    if (res.status === 404 && request.method === 'GET' && !/\.[a-z0-9]+$/i.test(path)) {
      return serveSpa(null);
    }
    return res;
}

export default {
  // Whole-request sink (audit A7): uncaught errors from handleFetch land
  // in error_log with a uniform 500; logging failures stay silent and
  // must never throw a second error.
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    configureGateRuntime(env);
    try {
      return await handleFetch(request, env, ctx);
    } catch (e) {
      try { ctx.waitUntil(logError(env.DB, { source: 'worker', error: e, context: { path: new URL(request.url).pathname } })); }
      catch { void logError(env.DB, { source: 'worker', error: e }); }
      return err('服务器内部错误', 500);
    }
  },
  // Daily backup snapshot to the private R2 bucket (see wrangler.toml
  // [triggers]); the run leaves a system audit row, failures land in
  // error_log via the backup service.
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    configureGateRuntime(env);
    void event;
    ctx.waitUntil(runScheduledBackup(env));
    // Account-deletion sweep rides the same daily cron (no separate
    // scheduler): accounts whose 7-day cooling-off has expired are
    // executed here. Failures are contained per account inside the
    // sweep; the .catch is belt-and-braces so the backup above can
    // never be affected.
    ctx.waitUntil(runDueAccountDeletions(env.DB).catch(() => 0));
  },
};
