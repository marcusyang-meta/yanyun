/* Platform HTTP infrastructure: REST response shapes, in-memory rate
 * limiting, dev-surface detection and REST session parsing.
 * Domain routes take these primitives from here; never copy them.
 * (The HMAC bearer-token helpers that authenticated the retired hub
 * portal were removed with it — the platform admin surface uses the
 * site session plus the gating-layer admin gate instead.) */
import { listSettingsByKey, getSettingValue } from '../guilds/index.ts';
import { getSessionUserChecked } from '../identity/auth.ts';

export const TYPES: Record<string, string> = { activity: '双十人本', talent: '天赋组队', race: '竞速', tower: '爬塔', gather: '采集', explore: '探索' };
export const ROLES = ['输出', '承伤', '奶', '治疗', '随意'];
export const RESERVED = new Set(['api', 'admin', 'hub', 'hub-admin', 'gadmin', 'index',
  'bosses', 'tenants', 'onboard', 'login', 'settings', 'events', 'static',
  'assets', 'app', 'style', 'favicon', 'robots', 'www', 'guilds']);

/* ================= Small helpers ================= */export const json = (data: any, status = 200, headers: any = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
export const err = (message: string, status = 400) => json({ ok: false, message }, status);
export const s = (v: any, max = 200) => String(v ?? '').trim().slice(0, max);

/* ---------- Simple rate limit (in-memory) ---------- */
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

/* ---------- Session resolution ---------- */export async function restCheckedUser(c: any) {
  return getSessionUserChecked(c.req.raw, c.env)
    .catch(() => ({ user: null, clearCookie: false }));
}

/* ---------- Hono context helpers ---------- */
// Dev-surface detection (same rule as graphql-base): preview / localhost
// origins can see dev_only guilds, production origins cannot. Judged by
// Origin/Referer hostname — a presentation gate, not a security boundary.
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
// Only POST/PUT/PATCH read a body; parse failure defaults to {}
export async function getBody(c: any): Promise<any> {
  if (!['POST', 'PUT', 'PATCH'].includes(c.req.method)) return {};
  try { return await c.req.json(); } catch { return {}; }
}
