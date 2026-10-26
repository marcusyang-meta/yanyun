import { sendDeparturePush } from './push.js';
import { logError } from './errorlog.js';
import { webhookIdentity } from './guildavatar.js';

// Discord 开车提醒 (2026-10-24 用户定型)
// 形态: 管理员 portal 按百业配一个频道 Webhook (tenants.discord_webhook,
// 与旧"新车通知"同一条), 开关与状态存 settings(tenant=slug)。开车前 10 分钟
// 往频道发一条就位确认消息 @ 全车人。调度不用 cron 扫描: GuildHub DO 的
// alarm 定点唤醒 (见 guildhub.js), D1 始终是唯一真相, alarm 只是唤醒铃。
// 发送身份: Webhook 自身, 每条消息以 username 覆盖为「燕云百业」+ 品牌头像,
// 不冒充任何成员。文案首行是用户钦定的魔兽原句, 一字不改。

export const REMINDER_LEAD_SEC = 600; // 开车前 10 分钟
export const REMINDER_USERNAME = '燕云百业';
export const REMINDER_AVATAR_URL = 'https://og.yanyun.app/og/hub.png';
export const WEBHOOK_RE = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;

/* ---------- events 提醒状态列 (懒 DDL, 与 ensureEventCreatorColumn 同套路) ----------
* reminder_sent_at: 成功发送的 epoch 秒; reminder_error: 失败原因 (非空 =
* 该车已结算, 永不重试 — 防死 webhook 重试风暴)。两列皆空 = 尚未提醒。 */
let reminderColsReady = null;
export function ensureReminderColumns(db) {
if (!reminderColsReady) {
reminderColsReady = (async () => {
try {
const { results} = await db.prepare('PRAGMA table_info(events)').all();
const cols = new Set(results.map((r) => r.name));
if (!cols.has('reminder_sent_at')) {
await db.prepare('ALTER TABLE events ADD COLUMN reminder_sent_at INTEGER').run();
}
if (!cols.has('reminder_error')) {
await db.prepare('ALTER TABLE events ADD COLUMN reminder_error TEXT').run();
}
} catch { /* 列已存在等情况静默 */}
})();
}
return reminderColsReady;
}

/* ---------- signups 身份戳列 (懒 DDL) ----------
 * signups.discord_id: 落座者本人登录报名时由服务端按会话盖戳 (写入规则在
 * graphql.js: 昵称与本人身份一致才盖)。有戳 = 精确身份, 提醒时直接 <@id>,
 * 不再依赖昵称匹配; 无戳 (代报名/REST/旧数据) 才回退昵称唯一匹配。 */
let signupDiscordColReady = null;
export function ensureSignupDiscordColumn(db) {
  if (!signupDiscordColReady) {
    signupDiscordColReady = (async () => {
      try {
        const { results } = await db.prepare('PRAGMA table_info(signups)').all();
        const cols = new Set(results.map((r) => r.name));
        if (!cols.has('discord_id')) {
          await db.prepare('ALTER TABLE signups ADD COLUMN discord_id TEXT').run();
        }
      } catch { /* 列已存在等情况静默 */ }
    })();
  }
  return signupDiscordColReady;
}

/* ---------- 百业成员名册 (guild_members, 懒 DDL) ----------
 * 用户进入百业时由读取路径顺手记录 (graphql.js captureGuildMember): 这是
 * 该百业自己的成员名单 (区别于按 Discord 服务器维度的 users/昵称快照 —
 * 两个百业可绑同一服务器, 名册各不相同)。提醒 @ 解析第二梯队用它。 */
let guildMembersReady = null;
export function ensureGuildMembersTable(db) {
  if (!guildMembersReady) {
    guildMembersReady = (async () => {
      try {
        await db.prepare(`CREATE TABLE IF NOT EXISTS guild_members (
          tenant TEXT NOT NULL,
          discord_id TEXT NOT NULL,
          nick TEXT NOT NULL DEFAULT '',
          global_name TEXT NOT NULL DEFAULT '',
          updated_at INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (tenant, discord_id)
        )`).run();
      } catch { /* 表已存在等情况静默 */ }
    })();
  }
  return guildMembersReady;
}

export async function upsertGuildMember(db, slug, discordId, nick, globalName) {
  await ensureGuildMembersTable(db);
  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`INSERT INTO guild_members (tenant, discord_id, nick, global_name, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(tenant, discord_id) DO UPDATE SET nick = excluded.nick,
      global_name = excluded.global_name, updated_at = excluded.updated_at`)
    .bind(slug, String(discordId), String(nick || ''), String(globalName || ''), now).run();
}

async function rosterPool(db, slug) {
  await ensureGuildMembersTable(db);
  const pool = new Map();
  const { results } = await db.prepare(
    'SELECT discord_id, nick, global_name FROM guild_members WHERE tenant = ?'
  ).bind(slug).all().catch(() => ({ results: [] }));
  for (const r of results || []) {
    pool.set(String(r.discord_id), { globalName: String(r.global_name || ''), nick: String(r.nick || '') });
  }
  return pool;
}

/* ---------- settings 小工具 (tenant 级) ---------- */
export async function getReminderSetting(db, slug, key) {
try {
const row = await db.prepare('SELECT value FROM settings WHERE tenant =? AND key =?')
.bind(slug, key).first();
return row? String(row.value || ''): '';
} catch { return '';}
}
export async function setReminderSetting(db, slug, key, value) {
await db.prepare(
'INSERT INTO settings(tenant, key, value) VALUES(?,?,?) ON CONFLICT(tenant, key) DO UPDATE SET value = excluded.value'
).bind(slug, key, String(value?? '')).run();
}

/* ---------- 配置 ---------- */
export async function getReminderConfig(db, slug) {
const t = await db.prepare('SELECT discord_webhook, guild_name FROM tenants WHERE slug =?')
.bind(slug).first().catch(() => null);
if (!t) return null;
const enabled = (await getReminderSetting(db, slug, 'reminder_enabled')) === '1';
return { webhook: String(t.discord_webhook || ''), guildName: String(t.guild_name || slug), enabled};
}

// portal 展示用掩码: 只露 host + webhook id + token 末 4 位
export function maskWebhook(url) {
const m = String(url || '').match(/^https:\/\/discord\.com\/api\/webhooks\/(\d+)\/([\w-]+)$/);
if (!m) return url? '已配置（自定义地址）': '';
const tail = m[2].slice(-4);
return `discord.com/api/webhooks/${m[1]}/…${tail}`;
}

/* ---------- 调度计算 (D1 为唯一真相) ----------
* 待提醒的车: 已发布 (open/closed, 不含 draft)、有出发时间、未结算
* (没发过也没失败过)。下一提醒时刻 = 最早一台的 starts_at_utc - 600。 */
const PENDING_WHERE = `tenant =? AND status IN ('open', 'closed')
AND starts_at_utc IS NOT NULL AND starts_at_utc >?
AND reminder_sent_at IS NULL AND reminder_error IS NULL`;

export async function nextReminderAt(db, slug, nowSec) {
await ensureReminderColumns(db);
const row = await db.prepare(
`SELECT MIN(starts_at_utc) AS m FROM events WHERE ${PENDING_WHERE}`
).bind(slug, nowSec).first();
if (!row ||!row.m) return null;
return Number(row.m) - REMINDER_LEAD_SEC;
}

// 到点待发的车 (提醒时刻已到、出发时间未到)
export async function dueReminders(db, slug, nowSec) {
await ensureReminderColumns(db);
const { results} = await db.prepare(
`SELECT * FROM events WHERE ${PENDING_WHERE} AND starts_at_utc -? <=? ORDER BY starts_at_utc ASC, id ASC`
).bind(slug, nowSec, REMINDER_LEAD_SEC, nowSec).all();
return results || [];
}

/* ---------- 名字与 @ 解析 ----------
* 发送时逐座解析: (a) signups.discord_id 身份戳 (本人登录报名时盖的) 直接
* 精确 @; (b) 无戳才把昵称拿去和该百业绑定服务器的已知用户做匹配 — 全局名
* (users.username) 与服务器昵称快照 (user_guild_nicks) 任一命中都算候选,
* 候选恰好唯一才 <@id>; (c) 歧义/查无只写纯文本名字。候选池限定为该服务器
* 成员 (有昵称快照, 或 users 的 guilds_json 含该服务器 id)。 */
async function memberPool(db, dgid) {
const pool = new Map(); // discord_id -> { globalName, nick}
if (!dgid) return pool;
const nicks = await db.prepare(
'SELECT discord_id, nick FROM user_guild_nicks WHERE guild_id =?'
).bind(dgid).all().catch(() => ({ results: []}));
for (const r of nicks.results || []) {
pool.set(String(r.discord_id), { globalName: '', nick: String(r.nick || '')});
}
const users = await db.prepare('SELECT discord_id, username, guilds_json FROM users').all()
.catch(() => ({ results: []}));
for (const u of users.results || []) {
let member = pool.has(String(u.discord_id));
if (!member) {
try {
const gs = JSON.parse(u.guilds_json || '[]');
member = Array.isArray(gs) && gs.some((g) => String(g.id) === String(dgid));
} catch { /* 非成员 */}
}
if (!member) continue;
const cur = pool.get(String(u.discord_id)) || { globalName: '', nick: ''};
cur.globalName = String(u.username || '');
pool.set(String(u.discord_id), cur);
}
return pool;
}

function resolveUnique(pool, nickname) {
const hits = [];
for (const [id, u] of pool) {
if ((u.globalName && u.globalName === nickname) || (u.nick && u.nick === nickname)) hits.push(id);
}
return hits.length === 1? hits[0]: null;
}

/* 车头显示名: creator_discord_id -> 该服昵称 (优先) -> 全局名;
* 无车头记录的老车 -> created_by 原文; 再无 -> 百业名兜底。 */
export async function leaderDisplayName(db, ev, slug, dgid, guildName) {
if (ev.creator_discord_id) {
const id = String(ev.creator_discord_id);
// 名册优先: 车头进过这个百业时, 名册里的昵称就是本百业语境的显示名
await ensureGuildMembersTable(db);
const rm = await db.prepare(
'SELECT nick, global_name FROM guild_members WHERE tenant =? AND discord_id =?'
).bind(slug, id).first().catch(() => null);
if (rm && String(rm.nick || '').trim()) return String(rm.nick).trim();
if (rm && String(rm.global_name || '').trim()) return String(rm.global_name).trim();
if (dgid) {
const nickRow = await db.prepare(
'SELECT nick FROM user_guild_nicks WHERE discord_id =? AND guild_id =?'
).bind(id, dgid).first().catch(() => null);
if (nickRow && String(nickRow.nick || '').trim()) return String(nickRow.nick).trim();
}
const u = await db.prepare('SELECT username FROM users WHERE discord_id =?')
.bind(id).first().catch(() => null);
if (u && String(u.username || '').trim()) return String(u.username).trim();
}
const cb = String(ev.created_by?? '').trim();
if (cb) return cb;
return guildName || '车头';
}

/* 拼消息: 返回 { content, userIds} (userIds = 实际被 <@> 到的 discord_id 集, 去重)
 * 结构 (2026-10-24 用户定型, 一字不改):
 *   {车头显示名} 发起了就位确认：你准备好了吗？
 *   【{车名}】
 *   还有 {N} 分钟就发车咯，笨笨要加油哦！
 *   [副本：{dungeon}]              仅有副本时出现
 *   (空行)
 *   队伍名册（{occupied}/{total}）：
 *   {i}. {<@id>|昵称}[（车头）][ · 流派][ ✚]
 *   (空行)
 *   {还差 K 个人就齐咯，还没上线的要快一点哦 | 全员到齐咯，出发！}
 * @ 内联在名册行里, 不再有独立的 @ 行; 时间只写相对分钟数, 无绝对时间行。
 * 名册行: 一行一个已占座位 (座位顺序); token 的解析梯队与旧版相同 —
 * (a) 身份戳; (b) 本百业名册唯一匹配; (c) 全服唯一匹配; (d) 纯文本。
 * 同一人占两个座 = 两行 (按座位出), allowed_mentions 的 id 集仍去重。
 * 车头标记: 先认解析结果恰为 creator_discord_id 的座位 (多个时标第一个);
 * 一个都没有时回退 — 恰好一个座位的昵称等于首行车头显示名才标 (老车无
 * creator 记录时 created_by 原文即为该名, 同口径); 否则不标。 */
export async function buildReminderMessage(db, ev, slug, nowSec) {
const dgid = await getReminderSetting(db, slug, 'discord_guild_id');
const t = await db.prepare('SELECT guild_name FROM tenants WHERE slug =?').bind(slug).first().catch(() => null);
const guildName = t? String(t.guild_name || slug): slug;
const leader = await leaderDisplayName(db, ev, slug, dgid, guildName);
const roster = await rosterPool(db, slug);
const pool = await memberPool(db, dgid);
await ensureSignupDiscordColumn(db);
const { results: seats} = await db.prepare(
'SELECT nickname, discord_id, weapon FROM signups WHERE event_id =? ORDER BY id ASC'
).bind(ev.id).all();
const creatorId = ev.creator_discord_id ? String(ev.creator_discord_id) : '';
const parsed = [];
const userIds = [];
for (const seat of seats || []) {
const nick = String(seat.nickname || '').trim();
if (!nick) continue;
const stamped = seat.discord_id ? String(seat.discord_id) : '';
const id = stamped || resolveUnique(roster, nick) || resolveUnique(pool, nick);
if (id && !userIds.includes(id)) userIds.push(id);
parsed.push({
nick,
token: id ? `<@${id}>` : nick,
sect: String(seat.weapon || '').trim(),
isCreator: !!(creatorId && id && id === creatorId),
});
}
// 车头标记定位: 梯队解析命中 creator 优先; 否则唯一同名回退; 都不成立不标
let leaderIdx = parsed.findIndex((p) => p.isCreator);
if (leaderIdx < 0) {
const sameName = parsed.map((p, i) => (p.nick === leader ? i : -1)).filter((i) => i >= 0);
if (sameName.length === 1) leaderIdx = sameName[0];
}
const rows = parsed.map((p, i) => {
let line = `${i + 1}. ${p.token}`;
if (i === leaderIdx) line += '（车头）';
if (p.sect) line += ` · ${p.sect}`;
if (p.sect === '牵丝·霖') line += ' ✚'; // 全游戏唯一治疗流派
return line;
});
const occupied = rows.length;
const total = Number(ev.max_slots) || occupied; // 容量口径与站点 toGrouping 一致: events.max_slots
const mins = Math.max(1, Math.round((Number(ev.starts_at_utc) - nowSec) / 60));
const lines = [
`${leader} 发起了就位确认：你准备好了吗？`,
`【${ev.title}】`,
`还有 ${mins} 分钟就发车咯，笨笨要加油哦！`,
];
if (ev.dungeon && String(ev.dungeon).trim()) lines.push(`副本：${String(ev.dungeon).trim()}`);
lines.push('', `队伍名册（${occupied}/${total}）：`, ...rows, '');
lines.push(occupied < total
? `还差 ${total - occupied} 个人就齐咯，还没上线的要快一点哦`
: '全员到齐咯，出发！');
return { content: lines.join('\n'), userIds};
}

/* ---------- Webhook 发送 ---------- */
export async function postWebhook(webhook, content, userIds, parseTypes, identity) {
const body = {
content,
// 发送身份 per-百业: 该百业有自定义头像时用百业名 + 头像 URL,
// 没有时 (identity=null) 回退平台默认身份。只换身份字段, 文案不动。
username: (identity && identity.username) || REMINDER_USERNAME,
avatar_url: (identity && identity.avatarUrl) || REMINDER_AVATAR_URL,
allowed_mentions: { parse: parseTypes || [], users: userIds || []},
};
const ctl = new AbortController();
const timer = setTimeout(() => ctl.abort(), 8000);
try {
const r = await fetch(webhook, {
method: 'POST',
headers: { 'content-type': 'application/json'},
body: JSON.stringify(body),
signal: ctl.signal,
});
if (r.ok || r.status === 204) return { ok: true, status: r.status, error: ''};
let detail = '';
try { detail = (await r.text()).slice(0, 200);} catch { /* */}
const label = r.status === 429? 'Discord 限流 (429)': `Webhook 返回 ${r.status}`;
return { ok: false, status: r.status, error: detail? `${label}: ${detail}`: label};
} catch (e) {
return { ok: false, status: 0, error: 'Webhook 请求失败: ' + String(e && e.message || e).slice(0, 160)};
} finally {
clearTimeout(timer);
}
}

async function recordStatus(db, slug, { ok, error, atSec, eventTitle, test}) {
await setReminderSetting(db, slug, 'reminder_last_at', String(atSec));
await setReminderSetting(db, slug, 'reminder_last_status', test? (ok? 'test-ok': 'test-error'): (ok? 'ok': 'error'));
await setReminderSetting(db, slug, 'reminder_last_error', ok? '': String(error || '未知错误').slice(0, 300));
if (eventTitle) await setReminderSetting(db, slug, 'reminder_last_event', String(eventTitle).slice(0, 60));
}

/* 发一台车的提醒并落状态: 成功写 reminder_sent_at, 失败写 reminder_error
* (结算, 不重试)。返回发送结果。 */
export async function sendReminderForEvent(db, slug, ev, cfg, nowSec, expoBase) {
await ensureReminderColumns(db);
const { content, userIds} = await buildReminderMessage(db, ev, slug, nowSec);
const identity = await webhookIdentity(db, slug).catch(() => null);
const res = await postWebhook(cfg.webhook, content, userIds, undefined, identity);
if (res.ok) {
await db.prepare('UPDATE events SET reminder_sent_at =? WHERE id =?').bind(nowSec, ev.id).run();
} else {
await db.prepare('UPDATE events SET reminder_error =? WHERE id =?')
.bind(String(res.error || '发送失败').slice(0, 300), ev.id).run();
// 全站错误汇聚 (审计 A7): 与 reminder_error 并存, 供 hub 门户统一看板
void logError(db, { source: 'reminder', name: 'WebhookError', message: String(res.error || '发送失败'), tenant: slug, context: { eventId: ev.id } });
}
await recordStatus(db, slug, { ok: res.ok, error: res.error, atSec: nowSec, eventTitle: ev.title, test: false});
// App 推送通道 (2026-10-25 与 Discord 并行加挂): 对象 = 上面已解析到账号
// 的参与者 userIds, 映射其 App 注册令牌。失败全隔离: 推送异常不改变
// Discord 的结算状态 (reminder_sent_at / reminder_error 已先行落定)。
try { await sendDeparturePush(db, slug, ev, cfg, userIds, nowSec, expoBase); } catch { /* 推送失败静默 */ }
return res;
}
