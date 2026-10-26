// 燕云十六声 百业报名小工具 · Cloudflare Worker (全免费套餐)
// 多租户: worker.dev/<百业slug> ; 主站 / 为百业导航页
// Workers(免费) + D1(免费) + 静态资源(免费) + Durable Objects(免费额度内), 无需 KV / R2 / 付费功能
// 路由框架: Hono (npm hono)
//
// 三期域拆分后本文件只剩装配层: Hono 应用与中间件、各域路由挂载、
// GraphQL 上下文构造、SPA/OG 入口分发与实时订阅入口。业务逻辑在
// src/domains/<域>/ 下, 跨域只走对方服务面 (index.ts)。

export { SeatHub, GuildHub } from './domains/groupings/index.ts';
import { Hono } from 'hono';
import { yoga, getGuildAccess, negotiateLocale } from './graphql.js';
import { getSessionUserChecked, sessionCookieHeader, handleDiscordLogin, handleDiscordCallback, handleLogout, getUserLocalePref } from './auth.js';
import { maybeRunCreatorBackfill } from './creatorbackfill.js';
import { maybeRunCreatorManualFix } from './creatormanualfix.js';
import { logError } from './domains/platform/index.ts';
import { err } from './domains/platform/http.ts';
import { hubOgTags, guildOgTags, carOgTags } from './domains/platform/og.ts';
import { getTenantSlug } from './domains/guilds/index.ts';
import { hubRoutes } from './domains/platform/hub-routes.ts';
import { guildPublicRoutes } from './domains/guilds/public-routes.ts';
import { dexPublicRoutes } from './domains/dex/public-routes.ts';
import { guildRoutes } from './domains/guilds/guild-routes.ts';
import { guildAvatarRoutes } from './domains/guilds/avatar-routes.ts';
import { groupingRoutes } from './domains/groupings/grouping-routes.ts';

/* ================= Hono 应用 ================= */
const app = new Hono();

// 未捕获异常汇聚 (商业化审计 A7): REST 处理器逃逸的异常落 error_log,
// 响应保持统一 err 形态。业务代码内部的预期失败都走 err() 返回, 不到这。
app.onError((e: any, c: any) => {
  try { c.executionCtx.waitUntil(logError(c.env.DB, { source: 'rest', error: e, context: { path: new URL(c.req.url).pathname } })); }
  catch { void logError(c.env.DB, { source: 'rest', error: e }); }
  return err('服务器内部错误', 500);
});

// 限流用 IP: 每个 /api 请求先取一次
app.use('/api/*', async (c: any, next: any) => {
  c.set('ip', c.req.header('cf-connecting-ip') || 'local');
  await next();
});

/* ---------- 公开 API: /api/tenants /bosses /schools /dungeons ---------- */
/* ---------- 路由挂载 (顺序与拆分前一致: 公开读 -> 超管 -> 头像 -> 百业) ---------- */
app.route('/api', guildPublicRoutes);
app.route('/api', dexPublicRoutes);
app.route('/api/hub', hubRoutes);
app.route('/api', guildAvatarRoutes);
app.route('/api', guildRoutes);
app.route('/api', groupingRoutes);

app.all('/graphql', async (c: any) => {
  // Discord 授权不完整的会话在此作废 (user=null + 清 cookie), 与无 cookie 同路
  const checked = await getSessionUserChecked(c.req.raw, c.env)
    .catch(() => ({ user: null, clearCookie: false }));
  // 多语言: 前端带 x-locale 头 (镜像了账号偏好或浏览器语言), 后端协商为
  // 受支持 locale (zh-TW/en/es/fr, 其余回退 zh-CN 源文); 登录用户存有账号
  // 级语言偏好 (users.locale_pref) 时, 偏好压过请求头 — 服务端为准。
  const browserLocale = negotiateLocale(c.req.header('x-locale'));
  const pref = checked.user
    ? await getUserLocalePref(c.env, checked.user.discordId).catch(() => null)
    : null;
  const res = await yoga.fetch(c.req.raw, {
    env: c.env,
    executionCtx: c.executionCtx,
    request: c.req.raw,
    user: checked.user,
    locale: pref || browserLocale,
    browserLocale,
    // 客户端时区 (IANA): 仅供移动端积木树里的时间文案按观看者时区生成;
    // 网页端不传、不用, 行为不变。
    tz: c.req.header('x-tz') || null,
  });
  // 一次性懒迁移 (无车头存量车按 1 号位补登记): 函数内有生产 host
  // 安全闸 + settings 标志守卫, preview/localhost 恒不触发; waitUntil
  // 异步执行, 失败静默不影响本次请求。
  try { c.executionCtx.waitUntil(maybeRunCreatorBackfill(c.env, c.req.raw)); } catch { /* 无 executionCtx 的上下文静默 */ }
  // 一次性人工归属修正 (39/40 号车, 用户 2026-10-25 口头指定): 同上,
  // 函数内有生产 host 安全闸 + settings 标志守卫, preview 恒不触发。
  try { c.executionCtx.waitUntil(maybeRunCreatorManualFix(c.env, c.req.raw)); } catch { /* 无 executionCtx 的上下文静默 */ }
  // GraphQL 层 5xx 汇聚 (单字段未捕获异常由 graphql.js 的 yoga 插件落库,
  // 这里兜的是整请求级失败, 如 yoga 本身抛错被 Hono onError 接住前的形态)
  if (res.status >= 500) {
    try { c.executionCtx.waitUntil(logError(c.env.DB, { source: 'graphql', name: 'HttpError', message: `GraphQL 请求返回 ${res.status}` })); }
    catch { /* 无 executionCtx 时静默 */ }
  }
  if (checked.clearCookie) {
    const headers = new Headers(res.headers);
    headers.append('set-cookie', sessionCookieHeader('', 0));
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }
  return res;
});

// 未匹配的 /api/* -> 404 (与原 handleApi 尾部一致)
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
    const headers: Record<string, string> = { 'content-type': 'application/json; charset=utf-8' };
    if (checked.clearCookie) headers['set-cookie'] = sessionCookieHeader('', 0);
    return new Response(JSON.stringify({ ok: false, message: '无权订阅该百业的实时更新' }), { status: 403, headers });
  }
  const stub = env.GUILD_HUB.get(env.GUILD_HUB.idFromName('guild:' + access.slug));
  return stub.fetch(request);
}
async function handleFetch(request: any, env: any, ctx: any) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Discord OAuth (登录入口/回调/退出): 不走 SPA, 直接由 Worker 处理
    if (path === '/auth/discord/login') return handleDiscordLogin(request, env);
    if (path === '/auth/discord/callback') return handleDiscordCallback(request, env);
    if (path === '/auth/logout') return handleLogout(request);

    // 实时推送订阅 (WS): 独立于 Hono REST/GraphQL 路由, 不动 /api/* 语义
    if (path.startsWith('/ws/guild/')) {
      const slug = decodeURIComponent(path.slice('/ws/guild/'.length).split('/')[0] || '');
      return handleGuildLive(request, env, slug);
    }

    if (path.startsWith('/api/') || path === '/graphql') {
      return app.fetch(request, env, ctx);
    }

    const serveAsset = async (assetPath: string) => {
      const u = new URL(request.url);
      u.pathname = assetPath;
      let res = await env.ASSETS.fetch(new Request(u.toString(), request));
      // 资源层可能对 .html 做 clean-URL 跳转, 内部跟随, 浏览器地址栏保持原样
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (loc) res = await env.ASSETS.fetch(new Request(new URL(loc, u).toString(), request));
      }
      return res;
    };
    const findTenant = async (slug: string) => {
      try {
        return await getTenantSlug(env.DB, slug);
      } catch { return null; } // 表未建时视为无租户
    };
    // React SPA 入口: 返回 index.html 并注入 OG 标签 (无标签时传 null)
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

    // 后台页 (保留旧版): 超管后台 + 旧路径跳转
    if (path === '/hub-admin.html') return serveAsset('/hub-admin.html');
    if (path === '/index.html' || path === '/admin.html') {
      return Response.redirect(new URL('/', url).toString(), 301);
    }
    if (path === '/gadmin.html') {
      return Response.redirect(new URL('/', url).toString(), 301); // 必须带 slug 访问
    }

    const seg = path.split('/').filter(Boolean);
    const slugRe = /^[a-z0-9-]{2,30}$/;
    // /<slug>/admin.html -> 百业管理后台 (保留旧版)
    if (seg.length === 2 && seg[1] === 'admin.html' && slugRe.test(seg[0])) {
      if (await findTenant(seg[0])) return serveAsset('/gadmin.html');
    }
    // 旧版分享路径 /<slug>/cars/:id -> 新版 /<slug>/car/:id
    if (seg.length === 3 && seg[1] === 'cars' && slugRe.test(seg[0]) && /^\d+$/.test(seg[2])) {
      if (await findTenant(seg[0])) {
        return Response.redirect(new URL(`/${seg[0]}/car/${seg[2]}`, url).toString(), 301);
      }
    }
    // / -> 百业导航 (React Hub) + 主页 OG
    if (path === '/') return serveSpa(hubOgTags());
    // /<slug>/car/:id -> 车队详情 (React) + 车 OG; 租户不存在时也返回 SPA, 由前端渲染不存在状态
    if (seg.length === 3 && seg[1] === 'car' && slugRe.test(seg[0]) && /^\d+$/.test(seg[2])) {
      if (await findTenant(seg[0])) return serveSpa(await carOgTags(env, seg[0], seg[2]));
      return serveSpa(null);
    }
    // /<slug> -> 百业前台 (React) + 百业 OG
    if (seg.length === 1 && slugRe.test(seg[0])) {
      if (await findTenant(seg[0])) return serveSpa(await guildOgTags(env, seg[0]));
      return serveSpa(null);
    }
    // 静态资源 (React 构建产物 / 后台 JS/CSS / 图片等)
    const res = await env.ASSETS.fetch(request);
    // SPA 客户端路由兜底: 无扩展名的未知路径交给前端路由
    if (res.status === 404 && request.method === 'GET' && !/\.[a-z0-9]+$/i.test(path)) {
      return serveSpa(null);
    }
    return res;
}

export default {
  // 全请求兜底 (商业化审计 A7): handleFetch 内部各路径的未捕获异常在此
  // 落 error_log 并回统一 500; 记日志失败静默, 绝不二次抛错。
  async fetch(request: any, env: any, ctx: any) {
    try {
      return await handleFetch(request, env, ctx);
    } catch (e) {
      try { ctx.waitUntil(logError(env.DB, { source: 'worker', error: e, context: { path: new URL(request.url).pathname } })); }
      catch { void logError(env.DB, { source: 'worker', error: e }); }
      return err('服务器内部错误', 500);
    }
  },
};
