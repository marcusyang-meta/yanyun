/* guilds 域公开读路由 (三期域拆分): 百业导航名单。 */
import { Hono } from 'hono';
import { json, isDevRequestC, getDevOnlySlugs } from '../platform/http.ts';
import { listTenantsDirectory } from './index.ts';

export const guildPublicRoutes = new Hono();

// GET /api/tenants 百业导航
guildPublicRoutes.get('/tenants', async (c: any) => {
  const results = await listTenantsDirectory(c.env.DB);
  // dev_only 百业 (如 demo): 非 dev 表面来源一律不列出 (OG worker 也靠这份名单判存在)
  if (!isDevRequestC(c)) {
    const devSet = await getDevOnlySlugs(c.env.DB);
    if (devSet.size) return json({ ok: true, tenants: results.filter((t) => !devSet.has(t.slug)) });
  }
  return json({ ok: true, tenants: results });
});

// POST /api/onboard 匿名自助入驻 —— 已删除 (2026-10-25 商业化审计 A4):
// 该端点匿名可建租户, 与 GraphQL createGuild 的「必须是目标 Discord
// 服务器管理员」校验自相矛盾, 可抢注 slug / 冒名建业。全仓无在用调用
// 方 (唯一引用在未部署的 public-legacy-backup/hub.js), 故整段下线;
// 建业唯一路径 = GraphQL createGuild (登录 + 服务器管理员校验)。
// slug 'onboard' 仍留在 RESERVED 保留字表里, 防被注册成百业地址。

// GET /api/bosses 首领列表(轻量, 不含攻略正文)