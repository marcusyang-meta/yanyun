/* guilds domain guild-admin gate: password-token verification
 * middleware for /api/:slug/admin/*, shared by the guilds and
 * groupings admin routes. */
import { json, err, s, getBody, rateLimit, bearerToken, checkToken, makeToken, sha256hex, timingSafeEqual, isDevRequestC, getDevOnlySlugs, restCheckedUser, TYPES, ROLES, RESERVED } from '../platform/http.ts';
import { getTenantRow } from './tenants.ts';
import { getSettingValue } from './settings.ts';

export const needGuildAdmin = async (c: any, next: any) => {
  const slug = c.get('slug');
  // A missing signing root fails closed (the old 'fallback-secret' fallback is removed — see above).
  const key = c.env.ADMIN_PASSWORD;
  if (!key) return err('服务端未设置超管密码, 管理员接口不可用', 500);
  if ((await checkToken(key, bearerToken(c))) !== slug) {
    return err('未登录或登录已过期', 401);
  }
  await next();
};

// PUT /api/:slug/admin/school-guides — update school guides (admin).
// Note: the original version called an undefined
// checkAdmin(slug, req, env), so this route actually returned
// 500; the Hono version authenticates like the other admin
// routes. URL and response format unchanged.
