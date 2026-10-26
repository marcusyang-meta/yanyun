// 燕云十六声 百业报名小工具 · Cloudflare Worker (全免费套餐)
// 多租户: worker.dev/<百业slug> ; 主站 / 为百业导航页
// Workers(免费) + D1(免费) + 静态资源(免费) + Durable Objects(免费额度内), 无需 KV / R2 / 付费功能
// 路由框架: Hono (npm hono)

export { SeatHub } from './seathub.js';
export { GuildHub } from './guildhub.js';
import { Hono } from 'hono';
import { yoga, parseGuideStructured, ensureBossStructuredColumns, ensureDungeonDexColumns, getGuildAccess, ensureEventCreatorColumn, negotiateLocale } from './graphql.js';
import { getSessionUserChecked, sessionCookieHeader, handleDiscordLogin, handleDiscordCallback, handleLogout, ensureNickStore, getUserLocalePref } from './auth.js';
import {
  getReminderConfig, getReminderSetting, setReminderSetting,
  maskWebhook, postWebhook, WEBHOOK_RE,
  ensureSignupDiscordColumn, ensureGuildMembersTable, upsertGuildMember,
} from './reminder.ts';
import { getHeirloomConfig, sendHeirloomTest, heirloomStatusFor } from './heirloompush.js';
import { maybeRunCreatorBackfill } from './creatorbackfill.js';
import { maybeRunCreatorManualFix } from './creatormanualfix.js';
import { logError, recentErrors } from './errorlog.js';
import { translate } from './domains/platform/index.ts';
import {
  AVATAR_MAX_BYTES, sniffAvatarType, getGuildAvatar, getGuildAvatarMeta,
  putGuildAvatar, deleteGuildAvatar, avatarPath,
} from './guildavatar.ts';
import {
  getSettingValue, setSettingValue, listSettingsByKey,
  listNonEmptySettingsByKey, listGlobalSettings,
} from './domains/guilds/index.ts';
import {
  getTenantRow, getTenantSlug, listTenantSlugs, listTenantsDirectory, listTenantsHubAdmin,
  updateTenantWebhook, updateTenantProfile, updateTenantFixedTeams, deleteTenantCascade,
  listFixedTeams, listFixedTeamMembers, insertFixedTeam, getFixedTeamIdForTenant,
  updateFixedTeamFields, deleteFixedTeamWithMembers, insertFixedTeamMember,
  getFixedTeamMemberIdOwned, updateFixedTeamMemberFields, deleteFixedTeamMemberById,
} from './domains/guilds/index.ts';
import {
  getEventRow, getEventRowByTenant, getEventIdByTenant, getEventIdStatusByTenant,
  listEventsWeekView, listEventsAdmin, countActivityEventsInWindow,
  insertEvent, updateEventFields, setEventStatus, deleteEventCascade,
} from './domains/groupings/index.ts';
import {
  listSignupsByEvent, listSignupDetailRows, countSignupsByEvent, getSignupCapacityStats,
  getSignupTenant, insertSignups, deleteSignupById, deleteSignupByIdAndEvent,
  deleteSignupByEventNickUid, deleteSignupsByEvent, updateSignupWeaponRoleById,
} from './domains/groupings/index.ts';
import { listUsersDirectory, listNicksByGuild, listAllNicks } from './domains/identity/index.ts';
import { listResultsByEvent, insertResult, getResultIdOwnedByTenant, deleteResultById } from './domains/groupings/index.ts';
import {
  listBossesLight, getBossById, listAllBosses, insertBoss, updateBossFields, listBossesWithGuide,
  deleteBossById, getBossIdByNameAndDungeon, getOrphanBossIdByName, renameBossesDungeon,
  listBossesFullByDungeon, listOrphanBossesByName, countBosses,
  listDungeonsPublic, getDungeonByName, getDungeonById, insertDungeonDex, updateDungeonFields,
  deleteDungeonById, countDungeons,
  listSchoolsFull, getSchoolNameBySlug, listSchoolBis, listSchoolBisBySchool,
  listSchoolRotations, getSchoolRotationBySchool, upsertSchoolBis, upsertSchoolRotation,
} from './domains/dex/index.ts';

const TYPES = { activity: '双十人本', talent: '天赋组队', race: '竞速', tower: '爬塔', gather: '采集', explore: '探索' };
const ROLES = ['输出', '承伤', '奶', '治疗', '随意'];
const RESERVED = new Set(['api', 'admin', 'hub', 'hub-admin', 'gadmin', 'index',
  'bosses', 'tenants', 'onboard', 'login', 'settings', 'events', 'static',
  'assets', 'app', 'style', 'favicon', 'robots', 'www', 'guilds']);

/* ================= 小工具 ================= */
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
const err = (message, status = 400) => json({ ok: false, message }, status);
const s = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const b64u = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (str) => {
  const pad = '='.repeat((4 - (str.length % 4)) % 4);
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};
async function sha256hex(str) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ---------- Token (HMAC, 含 tenant, 无需 KV) ---------- */
async function hmacKey(secret) {
  return crypto.subtle.importKey(
    'raw', new TextEncoder().encode('yanyun-signup:' + secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  );
}
async function makeToken(secret, tenant) {
  const payload = b64u(new TextEncoder().encode(JSON.stringify({
    tenant, exp: Date.now() + 24 * 3600 * 1000, rnd: crypto.randomUUID(),
  })));
  const key = await hmacKey(secret);
  const sig = b64u(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)));
  return payload + '.' + sig;
}
// 成功返回 tenant 字符串, 失败返回 false
async function checkToken(secret, token) {
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
function timingSafeEqual(a, b) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}

/* ---------- 简易限流(内存) ---------- */
const buckets = new Map();
function rateLimit(ip, key, max, windowMs) {
  const now = Date.now();
  const k = ip + ':' + key;
  let b = buckets.get(k);
  if (!b || now > b.reset) b = { count: 0, reset: now + windowMs };
  b.count++;
  buckets.set(k, b);
  if (buckets.size > 5000) buckets.clear();
  return b.count <= max;
}

/* ---------- 成绩解析 ---------- */
function parseTimeMs(input) {
  const t = String(input ?? '').trim();
  if (/^\d+(\.\d+)?$/.test(t)) return Math.round(parseFloat(t) * 1000);
  const m = t.match(/^(?:(\d+):)?([0-5]?\d):([0-5]?\d(?:\.\d{1,3})?)$/);
  if (!m) return null;
  const h = m[1] ? parseInt(m[1], 10) : 0;
  const min = parseInt(m[2], 10), sec = parseFloat(m[3]);
  return Math.round(((h * 3600) + (min * 60) + sec) * 1000);
}
const fmtMs = (ms) => {
  const t = Math.floor(ms / 1000), frac = ms % 1000;
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  const p = (n) => String(n).padStart(2, '0');
  return (h ? h + ':' : '') + p(m) + ':' + p(sec) + '.' + String(frac).padStart(3, '0');
};

// unix 秒(UTC) -> 'YYYY-MM-DD HH:MM:SS'(UTC 文本, 兼容旧 starts_at 字段)
const utcToText = (utc) => {
  const d = new Date(utc * 1000), p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
};

/* ---------- Discord webhook 推送 ---------- */
async function notifyDiscord(env, slug, event) {
  try {
    const t = await getTenantRow(env.DB, slug);
    const wh = t?.discord_webhook;
    if (!wh) return;
    const timeStr = event.starts_at_utc
      ? new Date(event.starts_at_utc * 1000).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      : '时间待定';
    const typeName = TYPES[event.type] || event.type;
    const embed = {
      title: `📣 新车队：${event.title}`,
      description: event.description || '',
      color: 0xb8860b,
      fields: [
        { name: '类型', value: typeName, inline: true },
        { name: '时间', value: timeStr, inline: true },
        { name: '名额', value: String(event.max_slots || '-'), inline: true },
      ],
      footer: { text: t.guild_name || slug },
    };
    await fetch(wh, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch { /* 推送失败不影响发车 */ }
}

/* ---------- GuildHub 实时推送 (与 graphql.js publishGroupingEvent 同口径) ----------
 * REST 写路径落库成功后调用: 事件只带 {slug, groupingId, kind}, 网页端收到
 * 后走 GraphQL 重查 (删车则切到不存在态)。尽力而为: 失败静默, 不阻塞响应。 */
function publishGuildEvent(c, slug, groupingId, kind) {
  try {
    if (!c.env.GUILD_HUB || !slug) return;
    const stub = c.env.GUILD_HUB.get(c.env.GUILD_HUB.idFromName('guild:' + slug));
    const p = stub.fetch('https://guild-hub/publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, groupingId: String(groupingId), kind }),
    }).then(() => {}).catch(() => {});
    c.executionCtx.waitUntil(p);
  } catch { /* 推送故障不影响写操作 */ }
}

/* ---------- 开车提醒重排催促 (GuildHub DO alarm) ----------
 * REST 写路径落库后调用: 让该百业 GuildHub 现查 D1 重排提醒铃。尽力而为:
 * 失败静默; DO 在连接/广播唤醒时也会顺手重排, 偶发丢失不会长期漂移。 */
function nudgeReminderHub(c, slug) {
  try {
    if (!c.env.GUILD_HUB || !slug) return;
    const stub = c.env.GUILD_HUB.get(c.env.GUILD_HUB.idFromName('guild:' + slug));
    const p = stub.fetch('https://guild-hub/nudge', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).then(() => {}).catch(() => {});
    c.executionCtx.waitUntil(p);
  } catch { /* 催促故障不影响写操作 */ }
}

/* ---------- REST 路径的会话解析 (与 /graphql 完全同源) ----------
 * getSessionUserChecked: JWT 校验 + Discord 授权完整性 (不完整即 user=null
 * 并要求清 cookie)。删车/发车落车头身份都只认它给出的 user; 任何异常按
 * 未登录处理, 绝不放行。 */
async function restCheckedUser(c) {
  return getSessionUserChecked(c.req.raw, c.env)
    .catch(() => ({ user: null, clearCookie: false }));
}

/* ---------- Hono 上下文小工具 ---------- */
function bearerToken(c) {
  const auth = c.req.header('authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
}

// dev 表面识别 (与 graphql.js 同规则): 预览站 / 本地开发来源能看到 dev_only 百业,
// 生产来源看不到。依据 Origin / Referer 的 hostname —— 展示层 gate, 非安全边界。
const DEV_HOSTS = new Set(['yanyun-web-preview.tbdlab.workers.dev', 'release-yanyun.tbdlab.workers.dev', 'localhost', '127.0.0.1']);
function isDevRequestC(c) {
  try {
    const h = c.req.header('origin') || c.req.header('referer') || '';
    if (!h) return false;
    return DEV_HOSTS.has(new URL(h).hostname);
  } catch { return false; }
}
async function getDevOnlySlugs(db) {
  try {
    const rows = await listSettingsByKey(db, 'dev_only');
    return new Set(rows.filter((r) => String(r.value) === '1').map((r) => r.tenant));
  } catch { return new Set(); }
}
async function isDevOnlyTenant(db, slug) {
  return (await getSettingValue(db, slug, 'dev_only')) === '1';
}
// 与原 handleApi 一致: POST/PUT/PATCH 才读 body, 解析失败默认为 {}
async function getBody(c) {
  if (!['POST', 'PUT', 'PATCH'].includes(c.req.method)) return {};
  try { return await c.req.json(); } catch { return {}; }
}

/* ================= Hono 应用 ================= */
const app = new Hono();

// 未捕获异常汇聚 (商业化审计 A7): REST 处理器逃逸的异常落 error_log,
// 响应保持统一 err 形态。业务代码内部的预期失败都走 err() 返回, 不到这。
app.onError((e, c) => {
  try { c.executionCtx.waitUntil(logError(c.env.DB, { source: 'rest', error: e, context: { path: new URL(c.req.url).pathname } })); }
  catch { void logError(c.env.DB, { source: 'rest', error: e }); }
  return err('服务器内部错误', 500);
});

// 限流用 IP: 每个 /api 请求先取一次
app.use('/api/*', async (c, next) => {
  c.set('ip', c.req.header('cf-connecting-ip') || 'local');
  await next();
});

/* ---------- 公开 API: /api/tenants /bosses /schools /dungeons ---------- */
const pub = new Hono();

// GET /api/tenants 百业导航
pub.get('/tenants', async (c) => {
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
pub.get('/bosses', async (c) => {
  return json({ ok: true, bosses: await listBossesLight(c.env.DB) });
});

// GET /api/bosses/:id 单个首领攻略(含正文)
pub.get('/bosses/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const boss = await getBossById(c.env.DB, id);
  if (!boss) return err('首领不存在', 404);
  return json({ ok: true, boss });
});

// GET /api/schools 流派列表(全站共用)
pub.get('/schools', async (c) => {
  return json({ ok: true, schools: await listSchoolsFull(c.env.DB) });
});

// GET /api/dungeons 副本列表(全站共用, 按规模/排序)
pub.get('/dungeons', async (c) => {
  return json({ ok: true, dungeons: await listDungeonsPublic(c.env.DB) });
});

app.route('/api', pub);

/* ---------- 超管 API: /api/hub/* ---------- */
const hub = new Hono();

// POST /api/hub/login (无需鉴权)
hub.post('/login', async (c) => {
  const ip = c.get('ip');
  const body = await getBody(c);
  if (!c.env.ADMIN_PASSWORD) return err('服务端未设置超管密码', 500);
  if (!rateLimit(ip, 'hublogin', 10, 10 * 60 * 1000)) return err('尝试太频繁', 429);
  if (!timingSafeEqual(s(body.password, 200), c.env.ADMIN_PASSWORD)) return err('密码错误', 401);
  return json({ ok: true, token: await makeToken(c.env.ADMIN_PASSWORD, '__hub__') });
});

// 其余 /api/hub/* 均需超管鉴权
hub.use(async (c, next) => {
  if (!c.env.ADMIN_PASSWORD || (await checkToken(c.env.ADMIN_PASSWORD, bearerToken(c))) !== '__hub__') {
    return err('未登录或登录已过期', 401);
  }
  await next();
});

// GET /api/hub/tenants
hub.get('/tenants', async (c) => {
  const results = await listTenantsHubAdmin(c.env.DB);
  return json({ ok: true, tenants: results });
});

// GET /api/hub/errors 最近错误 (error_log 只读, 超管门户「最近错误」区)
// 失败口径在 errorlog.recentErrors 内吞掉, 表不可用时返回空列表。
hub.get('/errors', async (c) => {
  const { errors, last24h } = await recentErrors(c.env.DB, 50);
  return json({ ok: true, errors, last24h });
});

// DELETE /api/hub/tenants/:slug
hub.delete('/tenants/:slug', async (c) => {
  const slug = s(c.req.param('slug'), 30);
  await deleteTenantCascade(c.env.DB, slug);
  return json({ ok: true });
});

/* ---------- Discord 开车提醒配置 (超管 portal) ----------
 * 每百业: Webhook URL (tenants.discord_webhook, 只存服务端; 本组接口只回
 * 掩码状态, 保存后永不回显全文) + 启用开关 + 测试发送 + 状态/下次提醒。
 * URL 只允许管理员替换或清除, 校验同百业管理员端点 (discord.com 官方格式)。 */
async function reminderStateFor(c, slug) {
  const cfg = await getReminderConfig(c.env.DB, slug);
  if (!cfg) return null;
  let nextAlarm = null;
  try {
    if (c.env.GUILD_HUB) {
      const stub = c.env.GUILD_HUB.get(c.env.GUILD_HUB.idFromName('guild:' + slug));
      const r = await stub.fetch('https://guild-hub/alarm-state', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const j = await r.json().catch(() => null);
      if (j && typeof j.alarm === 'number') nextAlarm = j.alarm;
    }
  } catch { /* DO 状态读不到时留空, 不影响配置面 */ }
  const lastAt = await getReminderSetting(c.env.DB, slug, 'reminder_last_at');
  return {
    slug,
    guild_name: cfg.guildName,
    webhookSet: !!cfg.webhook,
    webhookMasked: cfg.webhook ? maskWebhook(cfg.webhook) : '',
    enabled: cfg.enabled,
    lastAt: lastAt ? parseInt(lastAt, 10) || null : null,
    lastStatus: await getReminderSetting(c.env.DB, slug, 'reminder_last_status'),
    lastError: await getReminderSetting(c.env.DB, slug, 'reminder_last_error'),
    lastEvent: await getReminderSetting(c.env.DB, slug, 'reminder_last_event'),
    nextAlarmAt: nextAlarm,
  };
}

// GET /api/hub/reminders 全部百业的提醒配置与状态
hub.get('/reminders', async (c) => {
  const results = await listTenantSlugs(c.env.DB);
  const out = [];
  for (const t of results) {
    const st = await reminderStateFor(c, t.slug);
    if (st) out.push(st);
  }
  return json({ ok: true, reminders: out });
});

// PUT /api/hub/tenants/:slug/reminder {webhook?, enabled?}
// webhook 传字符串 = 替换 (空串 = 清除), 不传 = 保持原样
hub.put('/tenants/:slug/reminder', async (c) => {
  const slug = s(c.req.param('slug'), 40);
  const t = await getTenantSlug(c.env.DB, slug);
  if (!t) return err('百业不存在', 404);
  const body = await getBody(c);
  if (body.webhook !== undefined) {
    const wh = s(body.webhook, 300);
    if (wh && !WEBHOOK_RE.test(wh)) return err('Webhook URL 格式不对（应为 https://discord.com/api/webhooks/...）', 400);
    await updateTenantWebhook(c.env.DB, slug, wh);
  }
  if (body.enabled !== undefined) {
    await setReminderSetting(c.env.DB, slug, 'reminder_enabled', body.enabled ? '1' : '0');
  }
  nudgeReminderHub(c, slug); // 配置变化立即重排提醒铃
  return json({ ok: true, reminder: await reminderStateFor(c, slug) });
});

// POST /api/hub/tenants/:slug/reminder/test 发送测试消息验证频道连通
hub.post('/tenants/:slug/reminder/test', async (c) => {
  const slug = s(c.req.param('slug'), 40);
  const ip = c.get('ip');
  if (!rateLimit(ip, 'remindertest', 10, 10 * 60 * 1000)) return err('测试太频繁', 429);
  const cfg = await getReminderConfig(c.env.DB, slug);
  if (!cfg) return err('百业不存在', 404);
  if (!cfg.webhook) return err('尚未配置 Webhook URL', 400);
  const nowSec = Math.floor(Date.now() / 1000);
  const res = await postWebhook(cfg.webhook,
    `🔔 测试消息：${cfg.guildName} 的开车提醒已接通。开车前 10 分钟，我会在这里发起就位确认并 @ 全车人。`, []);
  await setReminderSetting(c.env.DB, slug, 'reminder_last_at', String(nowSec));
  await setReminderSetting(c.env.DB, slug, 'reminder_last_status', res.ok ? 'test-ok' : 'test-error');
  await setReminderSetting(c.env.DB, slug, 'reminder_last_error', res.ok ? '' : String(res.error || '发送失败').slice(0, 300));
  if (!res.ok) return json({ ok: false, message: '测试发送失败: ' + res.error }, 200);
  return json({ ok: true, reminder: await reminderStateFor(c, slug) });
});

/* ---------- 传家宝推送配置 (超管 portal, 与开车提醒相互独立) ----------
 * 每百业单独配一个展示频道 Webhook: URL 存 settings.heirloom_webhook
 * (只存服务端, 接口只回掩码), 与开车提醒的 tenants.discord_webhook
 * 是两条独立配置 — 在这里替换/清除绝不动提醒的那条。触发与去重在
 * src/heirloompush.js (gearPlan 服务端评估)。 */
async function heirloomStateFor(c, slug) {
  const cfg = await getHeirloomConfig(c.env.DB, slug);
  if (!cfg) return null;
  const st = await heirloomStatusFor(c.env.DB, slug);
  const t = await getTenantRow(c.env.DB, slug).catch(() => null);
  return {
    slug,
    guild_name: t ? String(t.guild_name || slug) : slug,
    webhookSet: !!cfg.webhook,
    webhookMasked: cfg.webhook ? maskWebhook(cfg.webhook) : '',
    enabled: cfg.enabled,
    lastAt: st.lastAt ? parseInt(st.lastAt, 10) || null : null,
    lastStatus: st.lastStatus || '',
    lastError: st.lastError || '',
    lastEvent: st.lastEvent || '',
  };
}

// GET /api/hub/heirlooms 全部百业的传家宝推送配置与状态
hub.get('/heirlooms', async (c) => {
  const results = await listTenantSlugs(c.env.DB);
  const out = [];
  for (const t of results) {
    const st = await heirloomStateFor(c, t.slug);
    if (st) out.push(st);
  }
  return json({ ok: true, heirlooms: out });
});

// PUT /api/hub/tenants/:slug/heirloom {webhook?, enabled?}
// webhook 传字符串 = 替换 (空串 = 清除), 不传 = 保持原样
hub.put('/tenants/:slug/heirloom', async (c) => {
  const slug = s(c.req.param('slug'), 40);
  const t = await getTenantSlug(c.env.DB, slug);
  if (!t) return err('百业不存在', 404);
  const body = await getBody(c);
  if (body.webhook !== undefined) {
    const wh = s(body.webhook, 300);
    if (wh && !WEBHOOK_RE.test(wh)) return err('Webhook URL 格式不对（应为 https://discord.com/api/webhooks/...）', 400);
    await setReminderSetting(c.env.DB, slug, 'heirloom_webhook', wh);
  }
  if (body.enabled !== undefined) {
    await setReminderSetting(c.env.DB, slug, 'heirloom_enabled', body.enabled ? '1' : '0');
  }
  return json({ ok: true, heirloom: await heirloomStateFor(c, slug) });
});

// POST /api/hub/tenants/:slug/heirloom/test 发送测试消息验证频道连通
hub.post('/tenants/:slug/heirloom/test', async (c) => {
  const slug = s(c.req.param('slug'), 40);
  const ip = c.get('ip');
  if (!rateLimit(ip, 'heirloomtest', 10, 10 * 60 * 1000)) return err('测试太频繁', 429);
  const res = await sendHeirloomTest(c.env.DB, slug);
  if (res.missing) return err(res.error, res.error === '百业不存在' ? 404 : 400);
  if (!res.ok) return json({ ok: false, message: '测试发送失败: ' + res.error }, 200);
  return json({ ok: true, heirloom: await heirloomStateFor(c, slug) });
});

/* ---------- 原语面开关 (超管 portal, C 路线灰度/回滚) ----------
 * 组队列表 / 车队详情的原语树 (primTree) 按百业 × 页面开关, 存
 * settings.primitives_list / primitives_detail ('1' 开), 默认 OFF。
 * 关掉即回落功能块树 — 客户端双通道都在, 回滚不需要发版。另有全局
 * 急停 settings('', primitives_global_off) 在 prim.js 的 primEnabled
 * 里判, 本组端点只管百业级开关。 */
async function primitivesStateFor(c, slug) {
  const t = await getTenantRow(c.env.DB, slug).catch(() => null);
  if (!t) return null;
  return {
    slug,
    guild_name: String(t.guild_name || slug),
    list: (await getReminderSetting(c.env.DB, slug, 'primitives_list')) === '1',
    detail: (await getReminderSetting(c.env.DB, slug, 'primitives_detail')) === '1',
  };
}

// GET /api/hub/primitives 全部百业的原语面开关状态
hub.get('/primitives', async (c) => {
  const results = await listTenantSlugs(c.env.DB);
  const out = [];
  for (const t of results) {
    const st = await primitivesStateFor(c, t.slug);
    if (st) out.push(st);
  }
  return json({ ok: true, primitives: out });
});

// PUT /api/hub/tenants/:slug/primitives {list?, detail?} 不传 = 保持原样
hub.put('/tenants/:slug/primitives', async (c) => {
  const slug = s(c.req.param('slug'), 40);
  const t = await getTenantSlug(c.env.DB, slug);
  if (!t) return err('百业不存在', 404);
  const body = await getBody(c);
  if (body.list !== undefined) {
    await setReminderSetting(c.env.DB, slug, 'primitives_list', body.list ? '1' : '0');
  }
  if (body.detail !== undefined) {
    await setReminderSetting(c.env.DB, slug, 'primitives_detail', body.detail ? '1' : '0');
  }
  return json({ ok: true, primitives: await primitivesStateFor(c, slug) });
});

/* POST /api/hub/backfill/reminder-identity 开车提醒身份回填 (2026-10-24
 * 用户裁决: 现在就 backfill)。与车头回填同一纪律: 幂等、{dryRun:true} 只报
 * 不写、只认唯一无歧义匹配、绝不猜。两件事:
 *  1) 名册播种: 每个已绑定百业, 把 guilds_json 含其绑定服务器的用户写入
 *     guild_members (昵称取该服务器昵称快照, 可空)。
 *  2) 座位盖戳: 无戳的 signup 昵称对该百业绑定服务器的成员候选 (全局名 /
 *     该服昵称快照, 同一用户双源命中仍算一个候选) 恰好唯一才盖
 *     signups.discord_id; 两名以上 = 歧义跳过, 零 = 无匹配跳过。
 * 只动 discord_id 与 guild_members, 不改昵称及其他字段。 */
hub.post('/backfill/reminder-identity', async (c) => {
  const db = c.env.DB;
  const body = await getBody(c);
  const dryRun = !!body.dryRun;
  await ensureSignupDiscordColumn(db);
  await ensureGuildMembersTable(db);
  const bindRows = await listNonEmptySettingsByKey(db, 'discord_guild_id');
  const allUsers = await listUsersDirectory(db);
  const userInGuild = (u, dgid) => {
    try {
      const gs = JSON.parse(u.guilds_json || '[]');
      return Array.isArray(gs) && gs.some((g) => String(typeof g === 'object' && g ? g.id : g) === String(dgid));
    } catch { return false; }
  };
  const guilds = [];
  const totals = { rosterSeeded: 0, seatsTotal: 0, stamped: 0, ambiguous: 0, unmatched: 0 };
  for (const b of bindRows) {
    const slug = String(b.tenant), dgid = String(b.value);
    const members = (allUsers || []).filter((u) => userInGuild(u, dgid));
    const nickRows = await listNicksByGuild(db, dgid);
    const nickOf = new Map((nickRows || []).map((r) => [String(r.discord_id), String(r.nick || '')]));
    // 1) 名册播种
    let rosterSeeded = 0;
    for (const u of members) {
      rosterSeeded++;
      if (!dryRun) {
        await upsertGuildMember(db, slug, u.discord_id, nickOf.get(String(u.discord_id)) || '', u.username || '');
      }
    }
    // 2) 座位盖戳
    const { results: seats } = await db.prepare(
      `SELECT s.id, s.nickname FROM signups s JOIN events e ON e.id = s.event_id
       WHERE e.tenant = ? AND (s.discord_id IS NULL OR s.discord_id = '')`
    ).bind(slug).all();
    let stamped = 0, ambiguous = 0, unmatched = 0;
    for (const seat of seats || []) {
      const nick = String(seat.nickname || '').trim();
      const hits = new Set();
      if (nick) {
        for (const u of members) {
          if (String(u.username || '').trim() === nick || (nickOf.get(String(u.discord_id)) || '').trim() === nick) {
            hits.add(String(u.discord_id));
          }
        }
      }
      if (hits.size === 1) {
        stamped++;
        if (!dryRun) {
          await db.prepare('UPDATE signups SET discord_id = ? WHERE id = ?').bind([...hits][0], seat.id).run();
        }
      } else if (hits.size > 1) ambiguous++;
      else unmatched++;
    }
    guilds.push({
      slug, discordGuildId: dgid, rosterSeeded,
      seatsTotal: (seats || []).length, stamped, ambiguous, unmatched,
    });
    totals.rosterSeeded += rosterSeeded;
    totals.seatsTotal += (seats || []).length;
    totals.stamped += stamped; totals.ambiguous += ambiguous; totals.unmatched += unmatched;
  }
  return json({ ok: true, dryRun, guilds, totals });
});

// GET /api/hub/settings, PUT /api/hub/settings (game_version/game_notice/game_version_code)
hub.get('/settings', async (c) => {
  const rows = await listGlobalSettings(c.env.DB, ['game_version', 'game_notice', 'game_version_code']);
  const out = { game_version: '', game_notice: '', game_version_code: '' };
  for (const r of rows) out[r.key] = r.value;
  return json({ ok: true, settings: out });
});
hub.put('/settings', async (c) => {
  const body = await getBody(c);
  for (const k of ['game_version', 'game_notice', 'game_version_code']) {
    if (body[k] !== undefined) {
      await setSettingValue(c.env.DB, '', k, s(body[k], 2000));
    }
  }
  return json({ ok: true });
});

// /api/hub/bosses CRUD
hub.get('/bosses', async (c) => {
  return json({ ok: true, bosses: await listAllBosses(c.env.DB) });
});
hub.post('/bosses', async (c) => {
  const body = await getBody(c);
  const name = s(body.name, 30);
  if (!name) return err('首领名不能为空', 400);
  const r = await insertBoss(c.env.DB, {
    name, talent: s(body.talent, 40), source: s(body.source, 40),
    note: s(body.note, 200), sortOrder: parseInt(body.sort_order, 10) || 0,
  });
  return json({ ok: true, id: r.last_row_id });
});
hub.put('/bosses/:id', async (c) => {
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  const patch = {};
  const set = (col, val) => { patch[col] = val; };
  if (body.name !== undefined) set('name', s(body.name, 30));
  if (body.talent !== undefined) set('talent', s(body.talent, 40));
  if (body.source !== undefined) set('source', s(body.source, 40));
  if (body.note !== undefined) set('note', s(body.note, 200));
  if (body.sort_order !== undefined) set('sort_order', parseInt(body.sort_order, 10) || 0);
  if (body.guide !== undefined) set('guide', s(body.guide, 30000));
  // 结构化攻略 (GraphQL bossPage 读取): 传数组则存 JSON
  await ensureBossStructuredColumns(c.env.DB);
  for (const [key, col] of [['mechanics', 'mechanics_json'], ['talents', 'talents_json'], ['shouts', 'shouts_json']]) {
    if (body[key] !== undefined) set(col, Array.isArray(body[key]) ? JSON.stringify(body[key]) : s(body[key], 60000));
  }
  if (!Object.keys(patch).length) return err('没有要更新的字段', 400);
  await updateBossFields(c.env.DB, id, patch);
  return json({ ok: true });
});

// POST /api/hub/bosses/migrate-structured 一次性物化: 把 bosses.guide 文本按旧前端
// (guild-app.js openBoss) 的拆分规则解析为结构化列, 供 GraphQL bossPage 读取。
// 幂等: 可重复执行, 结果只取决于 guide 文本。
hub.post('/bosses/migrate-structured', async (c) => {
  const db = c.env.DB;
  await ensureBossStructuredColumns(db);
  const results = await listBossesWithGuide(db);
  const migrated = [];
  for (const b of results) {
    const st = parseGuideStructured(b.guide);
    await updateBossFields(db, b.id, {
      mechanics_json: JSON.stringify(st.mechanics),
      talents_json: JSON.stringify(st.talents),
      shouts_json: JSON.stringify(st.shouts),
    });
    migrated.push({ id: b.id, name: b.name, mechanics: st.mechanics.length, talents: st.talents.length, shouts: st.shouts.length });
  }
  return json({ ok: true, migrated });
});
hub.delete('/bosses/:id', async (c) => {
  await deleteBossById(c.env.DB, parseInt(c.req.param('id'), 10));
  return json({ ok: true });
});

// POST /api/hub/dex/apply-season-map 攻略赛季重分类一次性迁移 (2026-10-24 用户定型)。
// 口径: 游戏内分类 (试锋/梦洄/鉴心/铸矩/传薪) 与赛季等级档一一对应 (S1..S5);
// 名字/等级以用户国际服游戏内截图为准 (笑渡苦行舟/缺口袋保留, 万壑化龙吟,
// 云梦金明池/风火鸾猊舞/同悲红尘劫/笑引阎罗帖/碧血照黄沙, 舞马人=用户提供);
// 跨档 boss 按档拆行 (·极 为独立条目); 国服残留删除 (删前校验无攻略内容,
// 有内容则跳过并在 warnings 里报告, 不硬删)。幂等: 可重复执行。
hub.post('/dex/apply-season-map', async (c) => {
  const db = c.env.DB;
  await ensureDungeonDexColumns(db);
  await ensureBossStructuredColumns(db);
  const rep = {
    updated: [], createdDungeons: [], createdBosses: [], reassignedBosses: [],
    deletedDungeons: [], deletedBosses: [], warnings: [],
  };
  const countAll = async () => ({
    dungeons: await countDungeons(db),
    bosses: await countBosses(db),
  });
  const before = await countAll();
  const hasContent = (b) => {
    const ne = (v) => { const t = String(v ?? '').trim(); return t !== '' && t !== '[]' && t !== 'null'; };
    return ne(b.guide) || ne(b.mechanics_json) || ne(b.talents_json) || ne(b.shouts_json);
  };
  const bossSource = (d) => (Number(d.size) === 10 ? '侠境·' : '试剑·') + d.name;

  // ---- 望月婵媛 → 万壑化龙吟 改名 (boss 归属按副本名关联, 必须先迁) ----
  const oldD = await getDungeonByName(db, '望月婵媛');
  const newD = await getDungeonByName(db, '万壑化龙吟');
  if (oldD && !newD) {
    await updateDungeonFields(db, oldD.id, { name: '万壑化龙吟' });
    await renameBossesDungeon(db, '望月婵媛', '万壑化龙吟');
    rep.updated.push('望月婵媛 → 万壑化龙吟 (改名, 游戏内正式名)');
  }

  // ---- boss 行确保: 已有 (名, 副本) 直接用; 无主孤儿行可认领 (每行只认领一次); 否则新建 ----
  const claimed = new Set();
  const ensureBoss = async (d, bossName, sortOrder) => {
    const exact = await getBossIdByNameAndDungeon(db, bossName, d.name);
    if (exact) {
      await updateBossFields(db, exact.id, { sort_order: sortOrder });
      return exact.id;
    }
    const orphan = await getOrphanBossIdByName(db, bossName);
    if (orphan && !claimed.has(orphan.id)) {
      claimed.add(orphan.id);
      await updateBossFields(db, orphan.id, { dungeon: d.name, source: bossSource(d), sort_order: sortOrder });
      rep.reassignedBosses.push(`${bossName} → ${d.name} (#${orphan.id})`);
      return orphan.id;
    }
    const r = await insertBoss(db, {
      name: bossName, dungeon: d.name, talent: '', source: bossSource(d), note: '', sortOrder,
    });
    rep.createdBosses.push(`${bossName} @ ${d.name} (#${r.last_row_id})`);
    return r.last_row_id;
  };

  const upsertDungeon = async (spec) => {
    let d = await getDungeonByName(db, spec.name);
    if (!d) {
      const r = await insertDungeonDex(db, {
        name: spec.name, size: spec.size, season: spec.season, category: spec.category, level: spec.level,
      });
      rep.createdDungeons.push(`${spec.name} (#${r.last_row_id})`);
      d = await getDungeonById(db, r.last_row_id);
    } else {
      await updateDungeonFields(db, d.id, { size: spec.size, season: spec.season, category: spec.category, level: spec.level });
      rep.updated.push(`${spec.name} → ${spec.category}/${spec.season}/Lv${spec.level}`);
      d = { ...d, ...spec };
    }
    const roster = spec.roster || [];
    for (let i = 0; i < roster.length; i++) await ensureBoss(d, roster[i], (i + 1) * 10);
    return d;
  };

  // 顺序即孤儿认领顺序 (基础档先于 ·极 档)
  const SPECS = [
    { name: '玉魄染青苍', size: 10, season: 'S5', category: '传薪', level: 100 },
    { name: '定极分更', size: 5, season: 'S5', category: '传薪', level: 100 },
    { name: '点雪断恩仇', size: 10, season: 'S4', category: '铸矩', level: 96 },
    { name: '笑渡苦行舟', size: 10, season: 'S4', category: '铸矩', level: 96 },
    { name: '俣俣神浒', size: 5, season: 'S4', category: '铸矩', level: 96 },
    { name: '白驹飞霞', size: 5, season: 'S4', category: '铸矩', level: 96, roster: ['舞马人', '冯如之'] },
    { name: '风饕五残灾', size: 10, season: 'S3', category: '鉴心', level: 91 },
    { name: '万壑化龙吟', size: 10, season: 'S3', category: '鉴心', level: 91, roster: ['天禄', '望月婵媛'] },
    { name: '幽牙蛇影', size: 5, season: 'S3', category: '鉴心', level: 91 },
    { name: '煞地惊雷', size: 5, season: 'S3', category: '鉴心', level: 91 },
    { name: '山河醉影', size: 5, season: 'S2', category: '梦洄', level: 81 },
    { name: '沉棺泊梦', size: 5, season: 'S2', category: '梦洄', level: 86 },
    { name: '赤霄惊梦', size: 5, season: 'S1', category: '试锋', level: 66, roster: ['睡道人', '容鸢'] },
    { name: '云梦金明池', size: 10, season: 'S1', category: '试锋', level: 51, roster: ['睡道人', '容鸢'] },
    { name: '云梦金明池·极', size: 10, season: 'S1', category: '试锋', level: 56, roster: ['睡道人', '容鸢'] },
    { name: '风火鸾猊舞', size: 10, season: 'S1', category: '试锋', level: 66, roster: ['容鸢', '舞狮兄弟'] },
    { name: '同悲红尘劫', size: 10, season: 'S1', category: '试锋', level: 71, roster: ['舞狮兄弟', '鬼公子'] },
    { name: '同悲红尘劫·极', size: 10, season: 'S2', category: '梦洄', level: 81, roster: ['舞狮兄弟', '鬼公子'] },
    { name: '笑引阎罗帖', size: 10, season: 'S2', category: '梦洄', level: 81, roster: ['道主', '黑财神'] },
    { name: '笑引阎罗帖·极', size: 10, season: 'S2', category: '梦洄', level: 86, roster: ['道主', '黑财神'] },
    { name: '碧血照黄沙', size: 10, season: 'S2', category: '梦洄', level: 86, roster: ['田英', '郭昕'] },
    { name: '碧血照黄沙·极', size: 10, season: 'S3', category: '鉴心', level: 91, roster: ['田英', '郭昕'] },
    { name: '赤霄惊梦·极', size: 5, season: 'S1', category: '试锋', level: 71, roster: ['睡道人', '容鸢'] },
    { name: '无相关山', size: 5, season: 'S1', category: '试锋', level: 51, roster: [] },
    { name: '铁血狼烟', size: 5, season: 'S1', category: '试锋', level: 56, roster: [] },
    { name: '伉洲孽海', size: 5, season: 'S1', category: '试锋', level: 61, roster: [] },
  ];
  for (const spec of SPECS) await upsertDungeon(spec);

  // ---- 国服残留删除 (删前逐行校验无攻略内容) ----
  const DELETE_DUNGEONS = ['锋锷断迷狂', '啸风峙玉', '鲲鹏图千山', '霜催落月', '笃山衔蝉', '流火袭星', '沧流走虺'];
  for (const name of DELETE_DUNGEONS) {
    const d = await getDungeonByName(db, name);
    if (!d) continue;
    const bs = await listBossesFullByDungeon(db, name);
    const withContent = bs.filter(hasContent);
    if (withContent.length) {
      rep.warnings.push(`跳过删除 ${name}: boss ${withContent.map((b) => b.name).join('/')} 有攻略内容`);
      continue;
    }
    for (const b of bs) {
      await deleteBossById(db, b.id);
      rep.deletedBosses.push(`${b.name} @ ${name}`);
    }
    await deleteDungeonById(db, d.id);
    rep.deletedDungeons.push(name);
  }
  for (const name of ['茧中老人', '愁铃客']) {
    const bs = await listOrphanBossesByName(db, name);
    for (const b of bs) {
      if (hasContent(b)) { rep.warnings.push(`跳过删除孤儿 boss ${name}: 有攻略内容`); continue; }
      await deleteBossById(db, b.id);
      rep.deletedBosses.push(`${name} (孤儿)`);
    }
  }

  const after = await countAll();
  return json({ ok: true, before, after, ...rep });
});

// POST /api/hub/events/backfill-creators 存量车车头身份回填 (2026-10-24 用户裁决)。
// 背景: creator_discord_id 上线前建的车只有 created_by 展示串 (REST 发车 =
// 用户手填昵称; GraphQL 发车 = 写死占位 '热心侠客'), 没有权威身份, 按
// "解散/删车只认车头" 的规则永远删不掉。回填只认无歧义证据: created_by
// 与某用户的 Discord 全局名 (users.username, 登录时落库) 或其在该百业
// 绑定服务器内的昵称快照 (user_guild_nicks) 对应, 且候选恰好唯一 (已绑定
// 百业再过一层成员校验: users.guilds_json 含该服务器, 或昵称快照本身即
// 成员证据) 才落库。占位串 / 查无此人 / 多名候选一律不动, 保持无车头
// (仅管理员通道可删)。绝不猜、绝不按座位/昵称模糊匹配多人。
// body {dryRun:true} 只报告不落库。幂等: 只处理 creator_discord_id 为空
// 的行, 重复执行的 backfilled 为 0。
hub.post('/events/backfill-creators', async (c) => {
  const db = c.env.DB;
  const body = await getBody(c);
  const dryRun = !!(body && body.dryRun);
  await ensureEventCreatorColumn(db);
  await ensureNickStore(db).catch(() => {});
  const PLACEHOLDERS = new Set(['', '热心侠客', '热心车友']);

  // 用户目录: 全局名 -> discord_id 集合; 成员关系: discord_id -> 服务器集合
  const userRows = await listUsersDirectory(db);
  const byGlobalName = new Map();
  const memberOf = new Map();
  for (const u of userRows) {
    const did = String(u.discord_id);
    const name = String(u.username || '').trim();
    if (name) {
      if (!byGlobalName.has(name)) byGlobalName.set(name, new Set());
      byGlobalName.get(name).add(did);
    }
    let guildIds = new Set();
    try {
      const gs = JSON.parse(u.guilds_json || '[]');
      if (Array.isArray(gs)) guildIds = new Set(gs.map((g) => String(g && g.id)));
    } catch { /* guilds_json 损坏时按无成员证据处理 */ }
    memberOf.set(did, guildIds);
  }
  // 服务器昵称快照: `${guild_id}|${nick}` -> discord_id 集合
  const nickIndex = new Map();
  try {
    const nickRows = await listAllNicks(db);
    for (const n of nickRows) {
      const nick = String(n.nick || '').trim();
      if (!nick) continue;
      const key = String(n.guild_id) + '|' + nick;
      if (!nickIndex.has(key)) nickIndex.set(key, new Set());
      nickIndex.get(key).add(String(n.discord_id));
    }
  } catch { /* 快照表不存在时仅用全局名匹配 */ }
  // 租户 -> 绑定 Discord 服务器 id
  const bindRows = await listSettingsByKey(db, 'discord_guild_id');
  const bindMap = new Map(bindRows.map((r) => [String(r.tenant), String(r.value || '')]));

  const { results: cars } = await db.prepare(
    'SELECT id, tenant, created_by, creator_discord_id FROM events ORDER BY id ASC'
  ).all();
  const rep = {
    dryRun,
    totals: {
      events: cars.length, alreadyStamped: 0, considered: 0, backfilled: 0,
      unstamped: { placeholder: 0, noMatch: 0, ambiguous: 0 },
    },
    groups: [],
  };
  const groupMap = new Map();
  const groupOf = (tenant, createdBy) => {
    const key = tenant + '|' + createdBy;
    if (!groupMap.has(key)) {
      const g = { tenant, createdBy, cars: 0, outcome: 'considered', matchedDiscordId: null, candidates: 0 };
      groupMap.set(key, g);
      rep.groups.push(g);
    }
    return groupMap.get(key);
  };
  const updates = [];
  for (const car of cars) {
    if (car.creator_discord_id && String(car.creator_discord_id).trim()) {
      rep.totals.alreadyStamped++;
      continue;
    }
    rep.totals.considered++;
    const cb = String(car.created_by ?? '').trim();
    const g = groupOf(String(car.tenant), cb);
    g.cars++;
    if (PLACEHOLDERS.has(cb)) { rep.totals.unstamped.placeholder++; g.outcome = 'placeholder'; continue; }
    const gid = bindMap.get(String(car.tenant)) || '';
    const cand = new Set();
    for (const did of byGlobalName.get(cb) || []) cand.add(did);
    const nickHits = gid ? (nickIndex.get(gid + '|' + cb) || new Set()) : new Set();
    for (const did of nickHits) cand.add(did);
    // 百业语境收窄: 已绑定百业只认该服务器成员 (全局名命中必须有成员
    // 记录; 昵称快照命中本身就是成员证据, 登录时仅为成员抓取)。
    const scoped = gid
      ? [...cand].filter((did) => (memberOf.get(did) || new Set()).has(gid) || nickHits.has(did))
      : [...cand];
    g.candidates = scoped.length;
    if (scoped.length === 1) {
      g.outcome = 'matched';
      g.matchedDiscordId = scoped[0];
      rep.totals.backfilled++;
      updates.push([scoped[0], car.id]);
    } else if (scoped.length === 0) {
      rep.totals.unstamped.noMatch++;
      g.outcome = 'noMatch';
    } else {
      rep.totals.unstamped.ambiguous++;
      g.outcome = 'ambiguous';
    }
  }
  if (!dryRun && updates.length) {
    await db.batch(updates.map(([did, id]) => db.prepare(
      "UPDATE events SET creator_discord_id = ? WHERE id = ? AND (creator_discord_id IS NULL OR creator_discord_id = '')"
    ).bind(did, id)));
  }
  return json({ ok: true, ...rep });
});

// /api/hub/dungeons 副本当期 toggle
hub.get('/dungeons', async (c) => {
  return json({ ok: true, dungeons: await listDungeonsPublic(c.env.DB) });
});
hub.put('/dungeons/:id', async (c) => {
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  const patch = {};
  if (body.is_current !== undefined) patch.is_current = body.is_current ? 1 : 0;
  if (body.video_url !== undefined) patch.video_url = String(body.video_url || '').slice(0, 200);
  if (body.video_title !== undefined) patch.video_title = String(body.video_title || '').slice(0, 80);
  if (!Object.keys(patch).length) return err('没有要更新的字段', 400);
  await updateDungeonFields(c.env.DB, id, patch);
  return json({ ok: true });
});

app.route('/api/hub', hub);

/* ---------- 百业 API: /api/:slug/* ---------- */
const guild = new Hono();

// 百业租户查找: /api/:slug/* 先确认百业存在, 不存在 -> 404
guild.use('/:slug/*', async (c, next) => {
  const slug = s(c.req.param('slug'), 30);
  const tenant = await getTenantRow(c.env.DB, slug);
  if (!tenant) return err('百业不存在', 404);
  c.set('slug', slug);
  c.set('tenant', tenant);
  await next();
});

// GET /api/:slug/settings
guild.get('/:slug/settings', async (c) => {
  const tenant = c.get('tenant');
  const results = await listGlobalSettings(c.env.DB, ['game_version', 'game_notice']);
  const out = { 
    guild_name: tenant.guild_name, 
    announcement: tenant.announcement, 
    slogan: tenant.slogan || '', 
    master_name: tenant.master_name || '',
    logo_url: tenant.logo_url || '',
    bg_image_url: tenant.bg_image_url || '',
    game_version: '', 
    game_notice: '', 
    feature_fixed_teams: !!tenant.feature_fixed_teams 
  };
  for (const r of results) out[r.key] = r.value;
  return json({ ok: true, ...out });
});

// GET /api/:slug/school-guides 流派攻略(毕业词条+输出轴, 公开) - 保留兼容
guild.get('/:slug/school-guides', async (c) => {
  const bis = await listSchoolBis(c.env.DB);
  const rots = await listSchoolRotations(c.env.DB);
  const bisMap = {};
  for (const r of bis) {
    if (!bisMap[r.school]) bisMap[r.school] = {};
    bisMap[r.school][r.build] = { attr: r.attr, rate: r.rate, bis: JSON.parse(r.bis_json) };
  }
  const rotMap = {};
  for (const r of rots) {
    rotMap[r.school] = JSON.parse(r.rotation_json);
  }
  return json({ ok: true, bis: bisMap, rotations: rotMap });
});

// GET /api/:slug/schools/:schoolSlug/bis 单个流派毕业词条
guild.get('/:slug/schools/:schoolSlug/bis', async (c) => {
  const schoolSlug = c.req.param('schoolSlug');
  const schoolRow = await getSchoolNameBySlug(c.env.DB, schoolSlug);
  if (!schoolRow) return err('流派不存在', 404);
  const school = schoolRow.name;
  const results = await listSchoolBisBySchool(c.env.DB, school);
  if (!results.length) return err('流派不存在', 404);
  const bis = {};
  for (const r of results) {
    bis[r.build] = { attr: r.attr, rate: r.rate, bis: JSON.parse(r.bis_json) };
  }
  return json({ ok: true, school, slug: schoolSlug, bis });
});

// GET /api/:slug/schools/:schoolSlug/rotations 单个流派输出轴
guild.get('/:slug/schools/:schoolSlug/rotations', async (c) => {
  const schoolSlug = c.req.param('schoolSlug');
  const schoolRow = await getSchoolNameBySlug(c.env.DB, schoolSlug);
  if (!schoolRow) return err('流派不存在', 404);
  const school = schoolRow.name;
  const row = await getSchoolRotationBySchool(c.env.DB, school);
  if (!row) return err('流派不存在', 404);
  return json({ ok: true, school, slug: schoolSlug, rotations: JSON.parse(row.rotation_json) });
});

// GET /api/:slug/fixed-teams 固定队列表(含队员, 公开)
guild.get('/:slug/fixed-teams', async (c) => {
  const slug = c.get('slug');
  const teams = await listFixedTeams(c.env.DB, slug);
  for (const t of teams) {
    t.members = await listFixedTeamMembers(c.env.DB, t.id);
  }
  return json({ ok: true, teams });
});

// POST /api/:slug/fixed-teams 公开建队(限流)
guild.post('/:slug/fixed-teams', async (c) => {
  const slug = c.get('slug');
  // 检查功能开关
  const tenant = c.get('tenant');
  if (!tenant.feature_fixed_teams) return err('固定队功能未开启', 403);
  // 限流: 5/天/IP
  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  if (!rateLimit(c.env, `mkteam:${slug}:${ip}`, 5, 86400)) {
    return err('建队太频繁，请明天再试', 429);
  }
  const body = await getBody(c);
  // 蜜罐
  if (body.website) return json({ ok: true, id: 0 });
  const name = s(body.name, 30);
  if (!name) return err('队伍名不能为空', 400);
  const r = await insertFixedTeam(c.env.DB, { tenant: slug, name, description: s(body.description, 200) });
  return json({ ok: true, id: r.last_row_id });
});

// GET /api/:slug/events?type=&from=&to= (from/to 为 UTC unix 秒, 本周视图用)
guild.get('/:slug/events', async (c) => {
  const slug = c.get('slug');
  const url = new URL(c.req.url);
  const type = s(url.searchParams.get('type'), 20);
  const from = parseInt(url.searchParams.get('from'), 10) || 0;
  const to = parseInt(url.searchParams.get('to'), 10) || 0;
  const results = await listEventsWeekView(c.env.DB, {
    tenant: slug,
    type: type && TYPES[type] ? type : undefined,
    from: from || undefined,
    to: to || undefined,
  });
  return json({ ok: true, events: results });
});

// GET /api/:slug/events/:id
guild.get('/:slug/events/:id', async (c) => {
  const slug = c.get('slug');
  const id = parseInt(c.req.param('id'), 10);
  if (!id) return err('活动不存在', 404);
  const event = await getEventRowByTenant(c.env.DB, id, slug);
  if (!event) return err('活动不存在', 404);
  const signups = await listSignupDetailRows(c.env.DB, id);
  const results = await listResultsByEvent(c.env.DB, id);
  return json({ ok: true, event, signups, results: results.map((r) => ({ ...r, time_str: fmtMs(r.time_ms) })) });
});

// WS 实时座位: /api/:slug/events/:id/live (每个活动一个 SeatHub 实例)
// 注: 原代码未限制 method, 保持 .all()
guild.all('/:slug/events/:id/live', async (c) => {
  const slug = c.get('slug');
  const id = parseInt(c.req.param('id'), 10);
  if (!id) return err('活动不存在', 404);
  const ev = await getEventIdByTenant(c.env.DB, id, slug);
  if (!ev) return err('活动不存在', 404);
  if (c.req.header('Upgrade') !== 'websocket') return err('需要 WebSocket 连接', 426);
  if (!c.env.SEAT_HUB) return err('实时服务未启用', 503);
  const stub = c.env.SEAT_HUB.get(c.env.SEAT_HUB.idFromName(`seat:${slug}:${id}`));
  return stub.fetch(c.req.raw);
});

// POST /api/:slug/events/:id/signup
guild.post('/:slug/events/:id/signup', async (c) => {
  const slug = c.get('slug');
  const ip = c.get('ip');
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  if (!id) return err('活动不存在', 404);
  if (!rateLimit(ip, 'signup', 10, 10 * 60 * 1000)) return err('报名太频繁, 请稍后再试', 429);
  if (s(body.hp, 10)) return err('报名失败', 400);
  const event = await getEventRowByTenant(c.env.DB, id, slug);
  if (!event) return err('活动不存在', 404);
  if (event.status !== 'open') return err('该活动已截止报名', 400);
  const nickname = s(body.nickname, 30);
  let uid = s(body.uid, 30);
  if (!nickname) return err('请填写游戏昵称', 400);
  if (!uid) uid = 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  let role = ROLES.includes(body.role) ? body.role : null;
  if (!role) role = s(body.weapon, 40) === '牵丝·霖' ? '奶' : '输出'; // 快捷报名: 流派决定职责
  // 原子写入: 名额判断与插入在一条语句内完成, 杜绝并发超卖
  // (SQLite 单条语句原子执行; 顺带复核活动仍为 open 状态)
  try {
    const r = await c.env.DB.prepare(
      `INSERT INTO signups (event_id, nickname, uid, role, weapon, contact, note, team_name, members)
       SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
       WHERE (SELECT COUNT(*) FROM signups WHERE event_id = ?)
           < (SELECT max_slots FROM events WHERE id = ? AND status = 'open')`
    ).bind(id, nickname, uid, role, s(body.weapon, 40), s(body.contact, 60),
      s(body.note, 200), s(body.team_name, 40), s(body.members, 300),
      id, id).run();
    if (!r.meta.changes) return err('名额已满或报名已截止, 手慢了', 400);
    // 最后一单校验: 满员时队里至少要有一个治疗, 否则回滚本次报名
    const full = await getSignupCapacityStats(c.env.DB, id);
    if (full && full.c >= full.m && full.h === 0) {
      await deleteSignupById(c.env.DB, r.meta.last_row_id);
      return err('最后一个名额需要奶, 请切换奶或先找个奶再来', 400);
    }
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return err('该 UID 已报过名, 无需重复报名', 400);
    throw e;
  }
  const seatsTaken = await countSignupsByEvent(c.env.DB, id);
  // 广播 seat 变化 (后台执行, 不阻塞报名响应)
  if (c.env.SEAT_HUB) {
    const payload = { event_id: id, seats_taken: seatsTaken, max_slots: event.max_slots };
    c.executionCtx.waitUntil((async () => {
      try {
        const stub = c.env.SEAT_HUB.get(c.env.SEAT_HUB.idFromName(`seat:${slug}:${id}`));
        await stub.fetch('https://seat-hub/publish', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch { /* 广播失败不影响报名结果, 客户端降级为轮询 */ }
    })());
  }
  return json({ ok: true, message: '报名成功!', seats_taken: seatsTaken, max_slots: event.max_slots });
});

// POST /api/:slug/events/:id/cancel
guild.post('/:slug/events/:id/cancel', async (c) => {
  const slug = c.get('slug');
  const ip = c.get('ip');
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  if (!rateLimit(ip, 'cancel', 10, 10 * 60 * 1000)) return err('操作太频繁', 429);
  const ev = await getEventIdByTenant(c.env.DB, id, slug);
  if (!ev) return err('活动不存在', 404);
  // 座位格模式: 按报名 id 取消(点位二次确认)
  const signupId = parseInt(body.signup_id, 10);
  if (signupId) {
    const r = await deleteSignupByIdAndEvent(c.env.DB, signupId, id);
    if (!r.changes) return err('未找到该报名记录', 404);
    return json({ ok: true, message: '已取消报名' });
  }
  const nickname = s(body.nickname, 30), uid = s(body.uid, 30);
  if (!id || !nickname || !uid) return err('请提供昵称和 UID', 400);
  const r = await deleteSignupByEventNickUid(c.env.DB, id, nickname, uid);
  if (!r.changes) return err('未找到该报名记录', 404);
  return json({ ok: true, message: '已取消报名' });
});

// POST /api/:slug/events/:id/update-weapon 改流派 (座位格模式, 按报名 id)
guild.post('/:slug/events/:id/update-weapon', async (c) => {
  const slug = c.get('slug');
  const ip = c.get('ip');
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  if (!rateLimit(ip, 'updwpn', 10, 10 * 60 * 1000)) return err('操作太频繁', 429);
  const ev = await getEventIdStatusByTenant(c.env.DB, id, slug);
  if (!ev) return err('活动不存在', 404);
  if (ev.status !== 'open') return err('该活动已截止报名', 400);
  const signupId = parseInt(body.signup_id, 10);
  const weapon = s(body.weapon, 40);
  if (!signupId || !weapon) return err('参数不完整', 400);
  // 流派决定职责: 牵丝·霖=奶, 其他=输出
  const role = weapon === '牵丝·霖' ? '奶' : '输出';
  const r = await updateSignupWeaponRoleById(c.env.DB, signupId, id, weapon, role);
  if (!r.changes) return err('未找到该报名记录', 404);
  return json({ ok: true, message: '流派已更新' });
});

// POST /api/:slug/cars/draft 创建空车队草稿，返回 id，前端直接打开编辑
guild.post('/:slug/cars/draft', async (c) => {
  const slug = c.get('slug');
  const ip = c.get('ip');
  const body = await getBody(c);
  if (!rateLimit(ip, 'cars', 5, 24 * 3600 * 1000)) return err('发车太频繁, 每人每天最多发 5 车', 429);
  if (s(body.hp, 10)) return err('发车失败', 400);
  const type = TYPES[body.type] ? body.type : 'activity';
  const max_slots = type === 'talent' ? 5 : 10;
  const now = Math.floor(Date.now() / 1000);
  // 带有效会话的调用顺带落车头身份, 使该车日后可被车头本人解散/删除;
  // overlay 等无会话调用留空 (未记录车头), 不臆造身份。
  await ensureEventCreatorColumn(c.env.DB);
  const checked = await restCheckedUser(c);
  const creatorId = checked.user ? String(checked.user.discordId) : null;
  const r = await insertEvent(c.env.DB, {
    tenant: slug, title: '未命名车队', type, description: '', starts_at: '', starts_at_utc: now,
    max_slots, status: 'draft', origin: 'member', created_by: '热心车友', creator_discord_id: creatorId,
  });
  nudgeReminderHub(c, slug);
  return json({ ok: true, id: r.last_row_id });
});

// POST /api/:slug/cars 成员发车 (无需登录, 限流 + 蜜罐)
guild.post('/:slug/cars', async (c) => {
  const slug = c.get('slug');
  const ip = c.get('ip');
  const body = await getBody(c);
  if (!rateLimit(ip, 'cars', 5, 24 * 3600 * 1000)) return err('发车太频繁, 每人每天最多发 5 车', 429);
  if (s(body.hp, 10)) return err('发车失败', 400);
  const title = s(body.title, 40);
  if (!title) return err('请填写车队标题', 400);
  const type = TYPES[body.type] ? body.type : 'activity';
  const utc = parseInt(body.starts_at_utc, 10) || 0;
  const now = Math.floor(Date.now() / 1000);
  if (!utc || utc < now - 3600) return err('请选择有效的发车时间', 400);
  if (utc > now + 60 * 86400) return err('发车时间不能超过 60 天后', 400);
  const max_slots = Math.min(Math.max(parseInt(body.max_slots, 10) || 10, 2), 40);
  const nickname = s(body.nickname, 30) || '热心车友';
  const dungeon = s(body.dungeon, 30);
  // 同草稿路径: 带有效会话则落车头身份 (与手填的 created_by 昵称无关,
  // 身份只认会话 discord_id); 无会话留空。
  await ensureEventCreatorColumn(c.env.DB);
  const checked = await restCheckedUser(c);
  const creatorId = checked.user ? String(checked.user.discordId) : null;
  const r = await insertEvent(c.env.DB, {
    tenant: slug, title, type, description: s(body.description, 500), starts_at: utcToText(utc),
    starts_at_utc: utc, meet_info: s(body.meet_info, 120), max_slots, status: 'open', origin: 'member',
    created_by: nickname, dungeon, creator_discord_id: creatorId,
  });
  const eventId = r.last_row_id;
  // 初始座位：车主发布时直接排座
  if (Array.isArray(body.seats)) {
    const seatRows = [];
    for (const st of body.seats.slice(0, max_slots)) {
      const nm = s(st.name, 30);
      const wp = s(st.weapon, 20);
      if (!nm || !wp) continue;
      const role = wp === '牵丝·霖' ? '奶' : '输出';
      const uid = 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      seatRows.push({ event_id: eventId, nickname: nm, uid, role, weapon: wp });
    }
    if (seatRows.length) await insertSignups(c.env.DB, seatRows);
  }
  c.executionCtx.waitUntil(notifyDiscord(c.env, slug, { title, type, description: s(body.description, 500), starts_at_utc: utc, max_slots }));
  nudgeReminderHub(c, slug);
  return json({ ok: true, id: eventId });
});

// POST /api/:slug/events/:id/manage 成员管理车 (无需管理码; 四个动作全部
// 只认车头 — 2026-10-24 删车收口, 2026-10-25 编辑/关闭/重开一并收口)
guild.post('/:slug/events/:id/manage', async (c) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  if (!id) return err('车队不存在', 404);
  await ensureEventCreatorColumn(c.env.DB);
  const ev = await getEventRowByTenant(c.env.DB, id, slug);
  if (!ev) return err('车队不存在', 404);
  if (ev.origin !== 'member') return err('官方活动请联系管理员', 403);
  const action = s(body.action, 20);
  const VERB = { update: '编辑', close: '关闭', reopen: '重开', delete: '删除', complete: '完成', uncomplete: '恢复' };
  if (!VERB[action]) return err('未知操作', 400);
  // 车头闸门 (与 GraphQL disbandGrouping / updateGrouping 同一条规则):
  // 必须带有效 yy_session (与 /graphql 同源的授权完整性校验), 且会话
  // discord_id 必须等于该车的 creator_discord_id (发车落库所得)。无会话 /
  // 非车头 / 未记录车头一律拒绝且车无损; 未记录车头的车只能走管理员通道。
  const checked = await restCheckedUser(c);
  const clearHdr = checked.clearCookie ? { 'set-cookie': sessionCookieHeader('', 0) } : {};
  if (!checked.user) {
    return json({ ok: false, message: '请先登录 Discord 后再操作' }, 401, clearHdr);
  }
  const creatorId = ev.creator_discord_id ? String(ev.creator_discord_id) : '';
  if (!creatorId) {
    return json({ ok: false, message: `该车队未记录车头，无法${VERB[action]}，请联系管理员处理` }, 403, clearHdr);
  }
  if (creatorId !== String(checked.user.discordId)) {
    return json({ ok: false, message: `只有车头可以${VERB[action]}车队` }, 403, clearHdr);
  }
  if (action === 'close' || action === 'reopen') {
    await setEventStatus(c.env.DB, id, action === 'close' ? 'closed' : 'open');
  } else if (action === 'complete' || action === 'uncomplete') {
    // 完成态 (与 GraphQL completeGrouping / reopenGrouping 同语义): 完成
    // 只从 open/closed 进入; 恢复只从 completed 回到 open。完成车从列表
    // 消失且不再发提醒 (提醒口径只认 open/closed), 与 GraphQL 一致。
    if (action === 'complete') {
      if (ev.status === 'completed') return err('该车队已是完成状态', 400);
      if (ev.status !== 'open' && ev.status !== 'closed') return err('该车队当前状态不可完成', 400);
      await setEventStatus(c.env.DB, id, 'completed');
    } else {
      if (ev.status !== 'completed') return err('该车队尚未完成', 400);
      await setEventStatus(c.env.DB, id, 'open');
    }
  } else if (action === 'delete') {
    await deleteEventCascade(c.env.DB, id, slug);
    // 与 GraphQL 解散一致: 广播 deleted, 开着的网页即时切到不存在态
    publishGuildEvent(c, slug, id, 'deleted');
  } else if (action === 'update') {
    const patch = {};
    const set = (col, val) => { patch[col] = val; };
    if (body.title !== undefined) set('title', s(body.title, 40));
    if (body.type !== undefined && TYPES[body.type]) set('type', body.type);
    if (body.description !== undefined) set('description', s(body.description, 500));
    if (body.meet_info !== undefined) set('meet_info', s(body.meet_info, 120));
    if (body.max_slots !== undefined) set('max_slots', Math.min(Math.max(parseInt(body.max_slots, 10) || 10, 2), 40));
    if (body.dungeon !== undefined) set('dungeon', s(body.dungeon, 30));
    if (body.starts_at_utc !== undefined) {
      const u = parseInt(body.starts_at_utc, 10) || 0;
      if (u > 0) { set('starts_at_utc', u); set('starts_at', utcToText(u)); }
    }
    // 草稿发布时状态改为 open
    if (ev.status === 'draft') set('status', 'open');
    if (Object.keys(patch).length) {
      await updateEventFields(c.env.DB, id, slug, patch);
    }
    // 更新座位：先清空再插入
    if (Array.isArray(body.seats)) {
      await deleteSignupsByEvent(c.env.DB, id);
      const seatRows = [];
      for (const st of body.seats.slice(0, ev.max_slots)) {
        const nm = s(st.name, 30);
        const wp = s(st.weapon, 20);
        if (!nm || !wp) continue;
        const role = wp === '牵丝·霖' ? '奶' : '输出';
        const uid = 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        seatRows.push({ event_id: id, nickname: nm, uid, role, weapon: wp });
      }
      if (seatRows.length) await insertSignups(c.env.DB, seatRows);
    }
  }
  nudgeReminderHub(c, slug);
  return json({ ok: true });
});

/* ---------- 百业管理员: /api/:slug/admin/* ---------- */
// POST /api/:slug/admin/login (无需鉴权, 但百业必须存在)
guild.post('/:slug/admin/login', async (c) => {
  const slug = c.get('slug');
  const ip = c.get('ip');
  const body = await getBody(c);
  if (!rateLimit(ip, 'glogin', 10, 10 * 60 * 1000)) return err('尝试太频繁', 429);
  const row = await getTenantRow(c.env.DB, slug);
  if (!row || !timingSafeEqual(await sha256hex(s(body.password, 200)), row.password_hash)) {
    return err('密码错误', 401);
  }
  // 管理员 token 以 ADMIN_PASSWORD 为 HMAC 签名根: 未配置即 fail-closed
  // 拒绝签发 (原 'fallback-secret' 字面量回退已删, 2026-10-25 审计 B2)。
  if (!c.env.ADMIN_PASSWORD) return err('服务端未设置超管密码, 管理员登录不可用', 500);
  return json({ ok: true, token: await makeToken(c.env.ADMIN_PASSWORD, slug) });
});

// 其余 /api/:slug/admin/* 均需百业管理员鉴权
const needGuildAdmin = async (c, next) => {
  const slug = c.get('slug');
  // 签名根缺失即 fail-closed (原 'fallback-secret' 回退已删, 同上)。
  const key = c.env.ADMIN_PASSWORD;
  if (!key) return err('服务端未设置超管密码, 管理员接口不可用', 500);
  if ((await checkToken(key, bearerToken(c))) !== slug) {
    return err('未登录或登录已过期', 401);
  }
  await next();
};
const evOwned = (c, id) => getEventRowByTenant(c.env.DB, id, c.get('slug'));

// PUT /api/:slug/admin/school-guides 更新流派攻略(需管理员)
// 注: 原生版本此处调用了未定义的 checkAdmin(slug, req, env), 该路由实际 500;
// Hono 版按其余 admin 路由的鉴权方式正确实现, URL 与响应格式不变。
guild.put('/:slug/admin/school-guides', needGuildAdmin, async (c) => {
  const body = await getBody(c);
  const { school, build, bis, rotation, attr, rate } = body;
  if (!school) return json({ ok: false, error: 'missing school' }, 400);
  const buildName = build || '小外流';
  if (bis !== undefined) {
    await upsertSchoolBis(c.env.DB, {
      school, build: buildName, attr: attr || '', rate: rate || '', bisJson: JSON.stringify(bis),
    });
  }
  if (rotation !== undefined) {
    await upsertSchoolRotation(c.env.DB, { school, rotationJson: JSON.stringify(rotation) });
  }
  return json({ ok: true });
});

// GET /api/:slug/admin/profile, PUT /api/:slug/admin/profile
guild.get('/:slug/admin/profile', needGuildAdmin, async (c) => {
  const tenant = c.get('tenant');
  return json({ ok: true, profile: { 
    guild_name: tenant.guild_name, 
    announcement: tenant.announcement,
    slogan: tenant.slogan || '',
    master_name: tenant.master_name || '',
    logo_url: tenant.logo_url || '',
    bg_image_url: tenant.bg_image_url || ''
  } });
});
guild.put('/:slug/admin/profile', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  const guild_name = s(body.guild_name, 20), announcement = s(body.announcement, 200), slogan = s(body.slogan, 50);
  const master_name = s(body.master_name, 20), logo_url = s(body.logo_url, 300), bg_image_url = s(body.bg_image_url, 300);
  if (guild_name.length < 2) return err('百业名称至少 2 个字', 400);
  await updateTenantProfile(c.env.DB, slug, {
    guildName: guild_name, announcement, slogan,
    masterName: master_name, logoUrl: logo_url, bgImageUrl: bg_image_url,
  });
  return json({ ok: true });
});

// 百业头像 (管理员直传, blob 存 D1 guild_avatars; 存储/嗅探/身份在 guildavatar.js)
// 错误文案走 i18n 目录 errors 段 (×5 语), 按请求头协商 locale。
const avatarErr = (c, code, status = 400) => {
  const locale = negotiateLocale(c.req.header('x-locale') || c.req.header('accept-language'));
  return json({ ok: false, message: translate('errors', code, locale), errorCode: code }, status);
};
// GET /api/:slug/admin/avatar 当前头像状态 (管理页预览/删除按钮据此渲染)
guild.get('/:slug/admin/avatar', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const meta = await getGuildAvatarMeta(c.env.DB, slug);
  return json({
    ok: true,
    hasAvatar: !!meta,
    avatarUrl: meta ? avatarPath(slug, meta.hash) : null,
    hash: meta ? meta.hash : null,
    updatedAt: meta ? meta.updatedAt : null,
  });
});
// PUT /api/:slug/admin/avatar 上传/更换 (请求体 = 图片原始字节, 前端已裁方缩到 ≤512)
guild.put('/:slug/admin/avatar', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const declared = parseInt(c.req.header('content-length') || '0', 10);
  if (declared > AVATAR_MAX_BYTES) return avatarErr(c, 'avatarTooLarge', 413);
  const buf = new Uint8Array(await c.req.arrayBuffer());
  if (!buf.byteLength) return avatarErr(c, 'avatarEmpty');
  if (buf.byteLength > AVATAR_MAX_BYTES) return avatarErr(c, 'avatarTooLarge', 413);
  const type = sniffAvatarType(buf); // 只认魔数, 伪类型 (改后缀的假图) 在此拒绝
  if (!type) return avatarErr(c, 'avatarBadType', 415);
  const { hash } = await putGuildAvatar(c.env.DB, slug, type, buf);
  return json({ ok: true, avatarUrl: avatarPath(slug, hash), hash });
});
// DELETE /api/:slug/admin/avatar 删除 (删后出图 404, avatarUrl 回 null)
guild.delete('/:slug/admin/avatar', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  await deleteGuildAvatar(c.env.DB, slug);
  return json({ ok: true });
});

// GET /api/:slug/admin/events
guild.get('/:slug/admin/events', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const results = await listEventsAdmin(c.env.DB, slug);
  return json({ ok: true, events: results });
});

// POST /api/:slug/admin/events
guild.post('/:slug/admin/events', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  const title = s(body.title, 60);
  if (!title) return err('标题不能为空', 400);
  const type = TYPES[body.type] ? body.type : 'activity';
  const utc = parseInt(body.starts_at_utc, 10) || 0;
  const maxSlots = Math.max(1, Math.min(500, parseInt(body.max_slots, 10) || 20));
  const r = await insertEvent(c.env.DB, {
    tenant: slug, title, type, description: s(body.description, 2000),
    starts_at: utc ? utcToText(utc) : (s(body.starts_at, 30) || null), starts_at_utc: utc || null,
    meet_info: s(body.meet_info, 200), max_slots: maxSlots,
    status: body.status === 'closed' ? 'closed' : 'open', origin: 'admin',
  });
  c.executionCtx.waitUntil(notifyDiscord(c.env, slug, { title, type, description: s(body.description, 2000), starts_at_utc: utc, max_slots: maxSlots }));
  nudgeReminderHub(c, slug);
  return json({ ok: true, id: r.last_row_id });
});

// PUT /api/:slug/admin/events/:id
guild.put('/:slug/admin/events/:id', needGuildAdmin, async (c) => {
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  if (!(await evOwned(c, id))) return err('活动不存在', 404);
  const fields = []; const params = [];
  const set = (col, val) => { fields.push(col + ' = ?'); params.push(val); };
  if (body.title !== undefined) set('title', s(body.title, 60));
  if (body.type !== undefined && TYPES[body.type]) set('type', body.type);
  if (body.description !== undefined) set('description', s(body.description, 2000));
  if (body.starts_at !== undefined) set('starts_at', s(body.starts_at, 30) || null);
  if (body.starts_at_utc !== undefined) {
    const u = parseInt(body.starts_at_utc, 10) || 0;
    set('starts_at_utc', u || null);
    set('starts_at', u ? utcToText(u) : null);
  }
  if (body.meet_info !== undefined) set('meet_info', s(body.meet_info, 200));
  if (body.max_slots !== undefined) set('max_slots', Math.max(1, Math.min(500, parseInt(body.max_slots, 10) || 20)));
  if (body.status !== undefined) set('status', body.status === 'closed' ? 'closed' : 'open');
  if (!Object.keys(patch).length) return err('没有要更新的字段', 400);
  await updateEventFields(c.env.DB, id, null, patch);
  nudgeReminderHub(c, c.get('slug'));
  return json({ ok: true });
});

// DELETE /api/:slug/admin/events/:id
guild.delete('/:slug/admin/events/:id', needGuildAdmin, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (!(await evOwned(c, id))) return err('活动不存在', 404);
  await deleteEventCascade(c.env.DB, id, null);
  nudgeReminderHub(c, c.get('slug'));
  return json({ ok: true });
});

// GET /api/:slug/admin/events/:id/signups
guild.get('/:slug/admin/events/:id/signups', needGuildAdmin, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (!(await evOwned(c, id))) return err('活动不存在', 404);
  const results = await listSignupsByEvent(c.env.DB, id);
  return json({ ok: true, signups: results });
});

// GET /api/:slug/admin/events/:id/export.csv
guild.get('/:slug/admin/events/:id/export.csv', needGuildAdmin, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const event = await evOwned(c, id);
  if (!event) return err('活动不存在', 404);
  const results = await listSignupsByEvent(c.env.DB, id);
  const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const rows = [['昵称', 'UID', '职责', '流派/武器', '联系方式', '队伍名', '队员', '备注', '报名时间'].map(q).join(',')];
  for (const r of results) {
    rows.push([r.nickname, r.uid, r.role, r.weapon, r.contact, r.team_name, r.members, r.note, r.created_at].map(q).join(','));
  }
  const csv = '﻿' + rows.join('\r\n');
  const fname = encodeURIComponent((event.title || 'event') + '_报名表.csv');
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename*=UTF-8''${fname}`,
    },
  });
});

// DELETE /api/:slug/admin/signups/:id
guild.delete('/:slug/admin/signups/:id', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const sid = parseInt(c.req.param('id'), 10);
  const own = await getSignupTenant(c.env.DB, sid, slug);
  if (!own) return err('记录不存在', 404);
  await deleteSignupById(c.env.DB, sid);
  return json({ ok: true });
});

// POST /api/:slug/admin/events/:id/results
guild.post('/:slug/admin/events/:id/results', needGuildAdmin, async (c) => {
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  if (!(await evOwned(c, id))) return err('活动不存在', 404);
  const ms = parseTimeMs(body.time);
  if (!s(body.team_name, 40)) return err('队伍名不能为空', 400);
  if (ms === null || ms <= 0) return err('成绩格式不对, 例: 3:42.15', 400);
  const r = await insertResult(c.env.DB, {
    eventId: id, teamName: s(body.team_name, 40), members: s(body.members, 300),
    timeMs: ms, proofUrl: s(body.proof_url, 300), note: s(body.note, 200),
  });
  return json({ ok: true, id: r.last_row_id });
});

// DELETE /api/:slug/admin/results/:id
guild.delete('/:slug/admin/results/:id', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const rid = parseInt(c.req.param('id'), 10);
  const own = await getResultIdOwnedByTenant(c.env.DB, rid, slug);
  if (!own) return err('记录不存在', 404);
  await deleteResultById(c.env.DB, rid);
  return json({ ok: true });
});

// GET /api/:slug/admin/discord, PUT /api/:slug/admin/discord
// discord_guild_id 存 settings 表 (tenant=slug): 该百业绑定的 Discord 服务器,
// 决定前台登录后的可见性与写权限 (成员 gate)。管理员在此自配, 不集中配置。
guild.get('/:slug/admin/discord', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const t = await getTenantRow(c.env.DB, slug);
  const dgid = await getSettingValue(c.env.DB, slug, 'discord_guild_id');
  return json({ ok: true, discord_webhook: t?.discord_webhook || '', discord_guild_id: dgid });
});
guild.put('/:slug/admin/discord', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  if (body.discord_webhook !== undefined) {
    const wh = s(body.discord_webhook, 300);
    if (wh && !/^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(wh)) {
      return err('Webhook URL 格式不对', 400);
    }
    await updateTenantWebhook(c.env.DB, slug, wh);
  }
  if (body.discord_guild_id !== undefined) {
    const dgid = s(body.discord_guild_id, 25);
    if (dgid && !/^\d{5,25}$/.test(dgid)) return err('Discord 服务器 ID 格式不对（应为纯数字）', 400);
    await setSettingValue(c.env.DB, slug, 'discord_guild_id', dgid);
  }
  nudgeReminderHub(c, slug); // webhook 配置变化会影响提醒挂铃
  return json({ ok: true });
});

// GET /api/:slug/admin/visibility, PUT /api/:slug/admin/visibility
// dev_only 存 settings 表 (tenant=slug): 开启后该百业在生产来源视为不存在,
// 仅 dev 表面 (预览站/本地) 可见。供 demo 这类开发租户使用, 无现成 settings
// 任意键写入口, 故在此提供这个最窄的专用端点 (与 discord 端点同鉴权同落库方式)。
guild.get('/:slug/admin/visibility', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const value = await getSettingValue(c.env.DB, slug, 'dev_only');
  return json({ ok: true, dev_only: value === '1' });
});
guild.put('/:slug/admin/visibility', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  if (body.dev_only !== undefined) {
    await setSettingValue(c.env.DB, slug, 'dev_only', body.dev_only ? '1' : '0');
  }
  return json({ ok: true });
});

// PUT /api/:slug/admin/features 开关功能 flag
guild.put('/:slug/admin/features', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  if (body.feature_fixed_teams !== undefined) {
    await updateTenantFixedTeams(c.env.DB, slug, body.feature_fixed_teams ? 1 : 0);
  }
  return json({ ok: true });
});

// POST /api/:slug/admin/fixed-teams 新建固定队
guild.post('/:slug/admin/fixed-teams', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  const name = s(body.name, 30);
  if (!name) return err('队伍名不能为空', 400);
  const r = await insertFixedTeam(c.env.DB, { tenant: slug, name, description: s(body.description, 200) });
  return json({ ok: true, id: r.last_row_id });
});

// PUT /api/:slug/admin/fixed-teams/:id 更新固定队
guild.put('/:slug/admin/fixed-teams/:id', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  const own = await getFixedTeamIdForTenant(c.env.DB, id, slug);
  if (!own) return err('队伍不存在', 404);
  const patch = {};
  if (body.name !== undefined) patch.name = s(body.name, 30);
  if (body.description !== undefined) patch.description = s(body.description, 200);
  if (!Object.keys(patch).length) return err('没有要更新的字段', 400);
  await updateFixedTeamFields(c.env.DB, id, patch);
  return json({ ok: true });
});

// DELETE /api/:slug/admin/fixed-teams/:id 删除固定队
guild.delete('/:slug/admin/fixed-teams/:id', needGuildAdmin, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const own = await getFixedTeamIdForTenant(c.env.DB, id, c.get('slug'));
  if (!own) return err('队伍不存在', 404);
  await deleteFixedTeamWithMembers(c.env.DB, id);
  return json({ ok: true });
});

// POST /api/:slug/admin/fixed-teams/:id/members 添加队员
guild.post('/:slug/admin/fixed-teams/:id/members', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  const own = await getFixedTeamIdForTenant(c.env.DB, id, slug);
  if (!own) return err('队伍不存在', 404);
  const nickname = s(body.nickname, 30);
  if (!nickname) return err('游戏昵称不能为空', 400);
  const weapon = s(body.weapon, 40);
  const role = weapon === '牵丝·霖' ? '奶' : (ROLES.includes(body.role) ? body.role : '输出');
  const r = await insertFixedTeamMember(c.env.DB, {
    teamId: id, nickname, weapon, role, note: s(body.note, 100), sortOrder: parseInt(body.sort_order, 10) || 0,
  });
  return json({ ok: true, id: r.last_row_id });
});

// PUT /api/:slug/admin/fixed-teams/members/:mid 更新队员
guild.put('/:slug/admin/fixed-teams/members/:mid', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  const mid = parseInt(c.req.param('mid'), 10);
  const own = await getFixedTeamMemberIdOwned(c.env.DB, mid, slug);
  if (!own) return err('队员不存在', 404);
  const patch = {};
  if (body.nickname !== undefined) patch.nickname = s(body.nickname, 30);
  if (body.weapon !== undefined) {
    const w = s(body.weapon, 40);
    patch.weapon = w;
    patch.role = w === '牵丝·霖' ? '奶' : '输出';
  }
  if (body.note !== undefined) patch.note = s(body.note, 100);
  if (body.sort_order !== undefined) patch.sort_order = parseInt(body.sort_order, 10) || 0;
  if (!Object.keys(patch).length) return err('没有要更新的字段', 400);
  await updateFixedTeamMemberFields(c.env.DB, mid, patch);
  return json({ ok: true });
});

// DELETE /api/:slug/admin/fixed-teams/members/:mid 删除队员
guild.delete('/:slug/admin/fixed-teams/members/:mid', needGuildAdmin, async (c) => {
  const slug = c.get('slug');
  const mid = parseInt(c.req.param('mid'), 10);
  const own = await getFixedTeamMemberIdOwned(c.env.DB, mid, slug);
  if (!own) return err('队员不存在', 404);
  await deleteFixedTeamMemberById(c.env.DB, mid);
  return json({ ok: true });
});

// GET /api/guilds/:slug/avatar 百业头像公开出图 (品牌图, 与 OG 图同性质,
// 可匿名读)。URL 带 ?v=<hash8>: 与当前 hash 一致时回不可变长缓存,
// 头像更换后 GraphQL avatarUrl 给出新 URL, 旧 URL 自然失效; 无头像/
// 百业不存在一律 404。'guilds' 已入 RESERVED, 不与 /api/:slug/* 冲突。
app.get('/api/guilds/:slug/avatar', async (c) => {
  const slug = c.req.param('slug');
  const row = await getGuildAvatar(c.env.DB, slug);
  if (!row) return new Response('Not found', { status: 404 });
  const etag = `"${row.hash}"`;
  if (c.req.header('if-none-match') === etag) return new Response(null, { status: 304 });
  const versioned = new URL(c.req.url).searchParams.get('v') === String(row.hash).slice(0, 8);
  return new Response(row.bytes, {
    headers: {
      'Content-Type': row.contentType,
      'Cache-Control': versioned ? 'public, max-age=31536000, immutable' : 'public, max-age=60',
      ETag: etag,
    },
  });
});

app.route('/api', guild);

// GraphQL (新增, 与 REST 并存): Hono 挂载 yoga, 所有方法
// context 包含 request (供限流取 IP) 与 user (Discord 会话, 供成员 gate)
app.all('/graphql', async (c) => {
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
app.notFound((c) => err('接口不存在', 404));

/* ================= 非 API: 静态资源与多租户页面 ================= */
/* 前台已切换为 Vite+React SPA (public/index.html + public/assets/*);
   旧版 vanilla 前台保存在 public-legacy-backup/, 后台页 hub-admin/gadmin 仍用旧页。
   OG 标签注入逻辑由 preview worker (yanyun-web-preview) 移植, 数据直接查 D1,
   og:url / 图片均指向生产域名。 */

const OG_WORKER = 'https://og.yanyun.app';
const SITE_URL = 'https://yanyun.app';

const escHtml = (str) => String(str ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// 车时间: unix 秒(UTC) -> "周六 20:00" (与 OG worker 同款 UTC 墙钟格式)
function fmtCarTimeUtc(sec) {
  const n = parseInt(sec, 10);
  if (!n) return '';
  const d = new Date(n * 1000);
  if (isNaN(d.getTime())) return '';
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const p = (x) => String(x).padStart(2, '0');
  return `${week[d.getUTCDay()]} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

const CAR_TYPE_LABEL = { activity: '双十人本', talent: '天赋组队', race: '竞速报名', tower: '爬塔' };

function hubOgTags() {
  return [
    '<meta property="og:title" content="百业集结 · 燕云十六声百业" />',
    '<meta property="og:description" content="燕云十六声国际服百业车队与攻略集散地 —— 择一业而入，共赴双十。" />',
    `<meta property="og:image" content="${OG_WORKER}/og/hub.png" />`,
    `<meta property="og:url" content="${SITE_URL}/" />`,
    '<meta property="og:type" content="website" />',
    '<meta name="twitter:card" content="summary_large_image" />',
  ].join('\n');
}

// 分享卡片口径 (2026-10-25 用户裁决): 所有真实百业一律真实卡片 —
// OG 标签与图都带百业名/口号/本周车队数, 不再按是否绑定 Discord 降级。
// 成员昵称/名册永不出现在公开卡片上。
// 本周窗与站点周逻辑一致: 周一 05:00 (北京时间) 起, [start, start+7d)
function ogWeekWindowUtc() {
  const now = Math.floor(Date.now() / 1000);
  const cst = now + 8 * 3600;
  const d = new Date(cst * 1000);
  const dayStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000;
  let monday = dayStart - ((d.getUTCDay() + 6) % 7) * 86400 + 5 * 3600;
  if (cst < monday) monday -= 7 * 86400;
  const startUtc = monday - 8 * 3600;
  return [startUtc, startUtc + 7 * 86400];
}

async function guildOgTags(env, slug) {
  try {
    // dev_only 百业在生产视为不存在: 不注入任何带名称的 OG 标签
    if (await isDevOnlyTenant(env.DB, slug)) return null;
    const t = await getTenantRow(env.DB, slug);
    if (!t || !t.guild_name) return null;
    const name = t.guild_name;
    // 本周双十车队数 (装饰性字段, 查不到按 0 不带出, 不阻塞标签注入)
    let teamCount = 0;
    try {
      const [from, to] = ogWeekWindowUtc();
      teamCount = await countActivityEventsInWindow(env.DB, slug, from, to);
    } catch { teamCount = 0; }
    const descParts = [];
    if (t.slogan) descParts.push(t.slogan);
    if (teamCount > 0) descParts.push(`本周 ${teamCount} 个车队招募中`);
    descParts.push(`${name} | 燕云十六声国际服百业车队与攻略`);
    return [
      `<meta property="og:title" content="${escHtml(name)} · 燕云百业" />`,
      `<meta property="og:description" content="${escHtml(descParts.join(' · '))}" />`,
      `<meta property="og:image" content="${OG_WORKER}/og/${encodeURIComponent(slug)}.png" />`,
      `<meta property="og:url" content="${SITE_URL}/${encodeURIComponent(slug)}" />`,
      '<meta property="og:type" content="website" />',
      '<meta name="twitter:card" content="summary_large_image" />',
    ].join('\n');
  } catch { return null; }
}

async function carOgTags(env, slug, carId) {
  try {
    if (await isDevOnlyTenant(env.DB, slug)) return null;
    const ev = await getEventRow(env.DB, parseInt(carId, 10) || 0);
    // 租户隔离: 车队不存在或不属于该 slug 时不注入, 不泄露他会数据
    if (!ev || ev.tenant !== slug) return null;
    const t = await getTenantRow(env.DB, slug);
    if (!t || !t.guild_name) return null;
    const cnt = await countSignupsByEvent(env.DB, ev.id);
    let dungeonName = '';
    if (ev.dungeon) {
      const d = await getDungeonByName(env.DB, ev.dungeon);
      if (d) dungeonName = d.name;
    }
    const typeLabel = CAR_TYPE_LABEL[ev.type] || '';
    const descParts = [typeLabel, dungeonName, fmtCarTimeUtc(ev.starts_at_utc), `已报名 ${cnt || 0}/${ev.max_slots}`].filter(Boolean);
    return [
      `<meta property="og:title" content="${escHtml(ev.title)} · ${escHtml(t.guild_name)}" />`,
      `<meta property="og:description" content="${escHtml(descParts.join(' | '))} · 燕云十六声百业车队" />`,
      `<meta property="og:image" content="${OG_WORKER}/og/${encodeURIComponent(slug)}/car/${encodeURIComponent(carId)}.png" />`,
      `<meta property="og:url" content="${SITE_URL}/${encodeURIComponent(slug)}/car/${encodeURIComponent(carId)}" />`,
      '<meta property="og:type" content="website" />',
      '<meta name="twitter:card" content="summary_large_image" />',
    ].join('\n');
  } catch { return null; }
}

/* ---------- 实时推送订阅: GET /ws/guild/:slug (WebSocket) ----------
 * 鉴权与 GraphQL 读权限完全同源: yy_session 会话 (含授权完整性校验) +
 * graphql.js 的 getGuildAccess —— 已绑定百业仅成员可订阅, 未绑定百业
 * 公开可读即可订阅; 非成员/匿名/不存在一律 403, 请求根本到不了
 * GuildHub。通过后把原始升级请求转给该百业的 GuildHub 实例 (hibernation
 * WS)。事件本身只有 {slug, groupingId, kind}, 客户端靠它触发 GraphQL
 * 重查, 数据面不经过这条通道。 */
async function handleGuildLive(request, env, slug) {
  if (request.headers.get('Upgrade') !== 'websocket') {
    return err('需要 WebSocket 连接', 426);
  }
  if (!env.GUILD_HUB) return err('实时服务未启用', 503);
  const checked = await getSessionUserChecked(request, env)
    .catch(() => ({ user: null, clearCookie: false }));
  const access = await getGuildAccess(env.DB, checked.user, slug, request)
    .catch(() => ({ exists: false, canView: false }));
  if (!access.exists || !access.canView) {
    const headers = { 'content-type': 'application/json; charset=utf-8' };
    if (checked.clearCookie) headers['set-cookie'] = sessionCookieHeader('', 0);
    return new Response(JSON.stringify({ ok: false, message: '无权订阅该百业的实时更新' }), { status: 403, headers });
  }
  const stub = env.GUILD_HUB.get(env.GUILD_HUB.idFromName('guild:' + access.slug));
  return stub.fetch(request);
}

async function handleFetch(request, env, ctx) {
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

    const serveAsset = async (assetPath) => {
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
    const findTenant = async (slug) => {
      try {
        return await getTenantSlug(env.DB, slug);
      } catch { return null; } // 表未建时视为无租户
    };
    // React SPA 入口: 返回 index.html 并注入 OG 标签 (无标签时传 null)
    const serveSpa = async (ogTags) => {
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
  async fetch(request, env, ctx) {
    try {
      return await handleFetch(request, env, ctx);
    } catch (e) {
      try { ctx.waitUntil(logError(env.DB, { source: 'worker', error: e, context: { path: new URL(request.url).pathname } })); }
      catch { void logError(env.DB, { source: 'worker', error: e }); }
      return err('服务器内部错误', 500);
    }
  },
};
