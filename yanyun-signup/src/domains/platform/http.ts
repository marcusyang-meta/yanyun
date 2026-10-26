/* 平台 HTTP 基础设施 (三期域拆分): REST 响应形态、令牌签发/校验、内存
 * 限流、dev 表面识别与 REST 会话解析。各域路由只从这里取这些原语,
 * 不再各自复制。 */
import { listSettingsByKey, getSettingValue } from '../guilds/index.ts';
import { getSessionUserChecked } from '../../auth.js';

export const TYPES: Record<string, string> = { activity: '双十人本', talent: '天赋组队', race: '竞速', tower: '爬塔', gather: '采集', explore: '探索' };
export const ROLES = ['输出', '承伤', '奶', '治疗', '随意'];
export const RESERVED = new Set(['api', 'admin', 'hub', 'hub-admin', 'gadmin', 'index',
  'bosses', 'tenants', 'onboard', 'login', 'settings', 'events', 'static',
  'assets', 'app', 'style', 'favicon', 'robots', 'www', 'guilds']);

/* ================= 小工具 ================= */export const json = (data: any, status = 200, headers: any = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
export const err = (message: string, status = 400) => json({ ok: false, message }, status);
export const s = (v: any, max = 200) => String(v ?? '').trim().slice(0, max);
export const b64u = (buf: any) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const unb64u = (str: string) => {
  const pad = '='.repeat((4 - (str.length % 4)) % 4);
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};
export async function sha256hex(str: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ---------- Token (HMAC, 含 tenant, 无需 KV) ---------- */
async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    'raw', new TextEncoder().encode('yanyun-signup:' + secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  );
}
export async function makeToken(secret: string, tenant: string) {
  const payload = b64u(new TextEncoder().encode(JSON.stringify({
    tenant, exp: Date.now() + 24 * 3600 * 1000, rnd: crypto.randomUUID(),
  })));
  const key = await hmacKey(secret);
  const sig = b64u(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)));
  return payload + '.' + sig;
}
// 成功返回 tenant 字符串, 失败返回 false
export async function checkToken(secret: string, token: any) {
  try {
    const [payload, sig] = String(token || '').split('.');
    if (!payload || !sig) return false;
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify('HMAC', key, unb64u(sig), new TextEncoder().encode(payload));
    if (!ok) return false;
    const data = JSON.parse(new TextDecoder().decode(unb64u(payload)));
    if (data.exp <= Date.now()) return false;
    return data.tenant;
  } catch { return false; }
}
export function timingSafeEqual(a: string, b: string) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}

/* ---------- 简易限流(内存) ---------- */
const buckets = new Map<string, any>();
export function rateLimit(ip: string, key: string, max: number, windowMs: number) {
  const now = Date.now();
  const k = ip + ':' + key;
  let b = buckets.get(k);
  if (!b || now > b.reset) b = { count: 0, reset: now + windowMs };
  b.count++;
  buckets.set(k, b);
  if (buckets.size > 5000) buckets.clear();
  return b.count <= max;
}

/* ---------- 成绩解析 ---------- */export async function restCheckedUser(c: any) {
  return getSessionUserChecked(c.req.raw, c.env)
    .catch(() => ({ user: null, clearCookie: false }));
}

/* ---------- Hono 上下文小工具 ---------- */
export function bearerToken(c: any) {
  const auth = c.req.header('authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
}

// dev 表面识别 (与 graphql.js 同规则): 预览站 / 本地开发来源能看到 dev_only 百业,
// 生产来源看不到。依据 Origin / Referer 的 hostname —— 展示层 gate, 非安全边界。
const DEV_HOSTS = new Set(['yanyun-web-preview.tbdlab.workers.dev', 'release-yanyun.tbdlab.workers.dev', 'localhost', '127.0.0.1']);
export function isDevRequestC(c: any) {
  try {
    const h = c.req.header('origin') || c.req.header('referer') || '';
    if (!h) return false;
    return DEV_HOSTS.has(new URL(h).hostname);
  } catch { return false; }
}
export async function getDevOnlySlugs(db: D1Database) {
  try {
    const rows = await listSettingsByKey(db, 'dev_only');
    return new Set(rows.filter((r) => String(r.value) === '1').map((r) => r.tenant));
  } catch { return new Set(); }
}
export async function isDevOnlyTenant(db: D1Database, slug: string) {
  return (await getSettingValue(db, slug, 'dev_only')) === '1';
}
// 与原 handleApi 一致: POST/PUT/PATCH 才读 body, 解析失败默认为 {}
export async function getBody(c: any): Promise<any> {
  if (!['POST', 'PUT', 'PATCH'].includes(c.req.method)) return {};
  try { return await c.req.json(); } catch { return {}; }
}
