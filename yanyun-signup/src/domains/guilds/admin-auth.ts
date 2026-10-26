/* guilds 域百业管理员闸 (三期域拆分): /api/:slug/admin/* 的密码令牌
 * 校验中间件, guilds 与 groupings 的管理路由共用。 */
import { json, err, s, getBody, rateLimit, bearerToken, checkToken, makeToken, sha256hex, timingSafeEqual, isDevRequestC, getDevOnlySlugs, restCheckedUser, TYPES, ROLES, RESERVED } from '../platform/http.ts';
import { getTenantRow } from './tenants.ts';
import { getSettingValue } from './settings.ts';

export const needGuildAdmin = async (c: any, next: any) => {
  const slug = c.get('slug');
  // 签名根缺失即 fail-closed (原 'fallback-secret' 回退已删, 同上)。
  const key = c.env.ADMIN_PASSWORD;
  if (!key) return err('服务端未设置超管密码, 管理员接口不可用', 500);
  if ((await checkToken(key, bearerToken(c))) !== slug) {
    return err('未登录或登录已过期', 401);
  }
  await next();
};

// PUT /api/:slug/admin/school-guides 更新流派攻略(需管理员)
// 注: 原生版本此处调用了未定义的 checkAdmin(slug, req, env), 该路由实际 500;
// Hono 版按其余 admin 路由的鉴权方式正确实现, URL 与响应格式不变。