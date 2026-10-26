import { sendDeparturePush } from '../platform/index.ts';
import { logError } from '../platform/index.ts';
import { webhookIdentity } from '../guilds/index.ts';
import { getTenantRow } from '../guilds/index.ts';
import { getSettingValue, setSettingValue } from '../guilds/index.ts';
import {
  nextPendingReminderStart, listDueReminderEvents, markReminderSent, markReminderError,
  ensureReminderColumns as ensureReminderColumnsRepo,
} from './events.ts';
import { ensureSignupDiscordColumn as ensureSignupDiscordColumnRepo } from './signups.ts';
import { listSignupSeatsForReminder } from './signups.ts';
import { getUsernameRow, listUsersDirectory, listNicksByGuild, getNickRow } from '../identity/index.ts';
import {
  ensureGuildMembersTable as ensureGuildMembersTableRepo,
  upsertGuildMember as upsertGuildMemberRepo,
  listGuildMembers, getGuildMember,
} from '../identity/index.ts';

// Discord departure reminder.
// Shape: admins configure one channel webhook per guild in the
// portal (tenants.discord_webhook, the same one as the legacy
// "new grouping" notice); the toggle and state live in settings
// (tenant=slug). Ten minutes before departure, one readiness-check
// message @s everyone seated. Scheduling is not a cron scan: the
// GuildHub DO alarm wakes at the set time (see guildhub), and D1
// is always the single source of truth — the alarm is just a bell.
// Sender identity: the webhook itself, with the username
// overridden per message to the platform brand + brand avatar; it
// never impersonates a member. The first copy line is a
// user-mandated quote, verbatim — do not alter it.

export const REMINDER_LEAD_SEC = 600;
export const REMINDER_USERNAME = '燕云百业';
export const REMINDER_AVATAR_URL = 'https://og.yanyun.app/og/hub.png';
export const WEBHOOK_RE = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;

export const REMINDER_EMBED_COLOR = 0xC9A35C; // Site theme gold (same value as the web theme gold).
const SITE_URL = 'https://yanyun.app'; // Same canonical-domain definition as worker.js SITE_URL.
const OG_WORKER = 'https://og.yanyun.app'; // Same definition as worker.js OG_WORKER.
/* Grouping detail URL (same construction as carOgTags' og:url). */
export function carDetailUrl(slug: string, eventId: number): string {
  return `${SITE_URL}/${encodeURIComponent(slug)}/car/${eventId}`;
}
/* This grouping's OG image (same construction as carOgTags' og:image); used as the embed thumbnail. */
export function carOgImageUrl(slug: string, eventId: number): string {
  return `${OG_WORKER}/og/${encodeURIComponent(slug)}/car/${eventId}.png`;
}

/* ---------- events reminder-state columns (lazy DDL) ----------
 * reminder_sent_at: epoch seconds of a successful send;
 * reminder_error: failure reason (non-empty = settled, never
 * retried — prevents a retry storm against a dead webhook).
 * Both empty = not yet reminded. */
// Lazy DDL now lives in the groupings repository; the old name is kept here as a delegating re-export (worker.ts imports ensureSignupDiscordColumn from this module).
export function ensureReminderColumns(db: any) {
  return ensureReminderColumnsRepo(db);
}

export function ensureSignupDiscordColumn(db: any) {
  return ensureSignupDiscordColumnRepo(db);
}

/* ---------- Guild member roster (guild_members) ----------
 * ensureGuildMembersTable / upsertGuildMember are kept here as
 * delegating re-exports (creatorbackfill / creatormanualfix still
 * import them from this module); the implementation and lazy DDL
 * live in src/domains/identity/guildMembers.ts. */
export function ensureGuildMembersTable(db: any) {
  return ensureGuildMembersTableRepo(db);
}

export async function upsertGuildMember(db: any, slug: string, discordId: unknown, nick: unknown, globalName: unknown) {
  await upsertGuildMemberRepo(db, slug, String(discordId), String(nick || ''), String(globalName || ''));
}

async function rosterPool(db: any, slug: string) {
  await ensureGuildMembersTable(db);
  const pool = new Map();
  const results = await listGuildMembers(db, slug).catch(() => []);
  for (const r of results || []) {
    pool.set(String(r.discord_id), { globalName: String(r.global_name || ''), nick: String(r.nick || '') });
  }
  return pool;
}

export async function getReminderSetting(db: any, slug: string, key: string) {
  return getSettingValue(db, slug, key);
}
export async function setReminderSetting(db: any, slug: string, key: string, value: string) {
  await setSettingValue(db, slug, key, value);
}

export async function getReminderConfig(db: any, slug: string) {
const t = await getTenantRow(db, slug).catch(() => null);
if (!t) return null;
const enabled = (await getReminderSetting(db, slug, 'reminder_enabled')) === '1';
return { webhook: String(t.discord_webhook || ''), guildName: String(t.guild_name || slug), enabled};
}

// Portal display mask: only host + webhook id + last 4 chars of the token are shown.
export function maskWebhook(url: string): string {
const m = String(url || '').match(/^https:\/\/discord\.com\/api\/webhooks\/(\d+)\/([\w-]+)$/);
if (!m) return url? '已配置（自定义地址）': '';
const tail = m[2].slice(-4);
return `discord.com/api/webhooks/${m[1]}/…${tail}`;
}

/* ---------- Scheduling math (D1 is the single source of truth) ----------
 * The pending definition (published open/closed, has a start time,
 * unsettled) lives in the events repository
 * (nextPendingReminderStart / listDueReminderEvents); the next
 * reminder time = the earliest one's starts_at_utc - 600. */

export async function nextReminderAt(db: any, slug: string, nowSec: number): Promise<number | null> {
await ensureReminderColumns(db);
const m = await nextPendingReminderStart(db, slug, nowSec);
if (!m) return null;
return m - REMINDER_LEAD_SEC;
}

// Due groupings: reminder time reached, departure time not yet.
export async function dueReminders(db: any, slug: string, nowSec: number) {
await ensureReminderColumns(db);
return listDueReminderEvents(db, slug, nowSec, REMINDER_LEAD_SEC);
}

/* ---------- Name & @ resolution ----------
 * Resolved per seat at send time: (a) the signups.discord_id
 * identity stamp (stamped on self signups) @s precisely; (b) with
 * no stamp, match the nickname against the bound server's known
 * users — a hit on the global name (users.username) or the server
 * nickname snapshot (user_guild_nicks) makes a candidate, and only
 * a unique candidate becomes <@id>; (c) ambiguous / not found
 * stays plain text. The candidate pool is limited to that server's
 * members (has a nickname snapshot, or users.guilds_json contains
 * the server id). */
async function memberPool(db: any, dgid: string) {
const pool = new Map(); // discord_id -> { globalName, nick}
if (!dgid) return pool;
const nicks = await listNicksByGuild(db, dgid).catch(() => []);
for (const r of nicks || []) {
pool.set(String(r.discord_id), { globalName: '', nick: String(r.nick || '')});
}
const users = await listUsersDirectory(db).catch(() => []);
for (const u of users || []) {
let member = pool.has(String(u.discord_id));
if (!member) {
try {
const gs = JSON.parse(u.guilds_json || '[]');
member = Array.isArray(gs) && gs.some((g) => String(g.id) === String(dgid));
} catch { /* unparseable -> not a member */}
}
if (!member) continue;
const cur = pool.get(String(u.discord_id)) || { globalName: '', nick: ''};
cur.globalName = String(u.username || '');
pool.set(String(u.discord_id), cur);
}
return pool;
}

function resolveUnique(pool: Map<string, { globalName: string; nick: string }>, nickname: string): string | null {
const hits = [];
for (const [id, u] of pool) {
if ((u.globalName && u.globalName === nickname) || (u.nick && u.nick === nickname)) hits.push(id);
}
return hits.length === 1? hits[0]: null;
}

/* Leader display name: creator_discord_id -> that server's
 * nickname (preferred) -> global name; legacy groupings with no
 * leader record -> the created_by text; failing that, the guild
 * name. */
export async function leaderDisplayName(db: any, ev: any, slug: string, dgid: string, guildName: string): Promise<string> {
if (ev.creator_discord_id) {
const id = String(ev.creator_discord_id);
// Roster first: if the leader has entered this guild, their roster nickname is their display name in this guild's context.
await ensureGuildMembersTable(db);
const rm = await getGuildMember(db, slug, id).catch(() => null);
if (rm && String(rm.nick || '').trim()) return String(rm.nick).trim();
if (rm && String(rm.global_name || '').trim()) return String(rm.global_name).trim();
if (dgid) {
const nickRow = await getNickRow(db, id, dgid).catch(() => null);
if (nickRow && String(nickRow.nick || '').trim()) return String(nickRow.nick).trim();
}
const u = await getUsernameRow(db, id).catch(() => null);
if (u && String(u.username || '').trim()) return String(u.username).trim();
}
const cb = String(ev.created_by?? '').trim();
if (cb) return cb;
return guildName || '车头';
}

/* Compose the message: returns { content, embeds, userIds }
 * (userIds = the set of discord_ids actually <@>-ed, deduped).
 * Structure (embed card since the 2026-10-26 redesign; two lines
 * are user-mandated and frozen verbatim — the literals in the code
 * below — everything else was rewritten in a wuxia tone):
 *   content (plain-text header above the card, two lines):
 *     frozen line 1, then the grouping name in brackets.
 *   embed (theme-gold border; title = grouping name, linked to
 *     the detail page; thumbnail = the grouping's OG image):
 *     description: frozen line 2, then — only when a dungeon
 *       exists — a dungeon line.
 *     field "roster (occupied/total)": one line per occupied seat,
 *       in seat order: {i}. {<@id>|nickname}[(leader)][ - school][ healer mark]
 *     footer: either the still-missing-K line or the all-aboard line.
 * @s are inline in the roster lines — there is no separate @ line;
 * time is relative minutes only, no absolute-time line.
 * Token resolution ladder, unchanged from the old version:
 * (a) identity stamp; (b) unique match in this guild's roster;
 * (c) unique match server-wide; (d) plain text.
 * One person in two seats = two lines (by seat); allowed_mentions
 * ids still dedupe.
 * Leader marker: first, a seat whose resolution is exactly
 * creator_discord_id (the first, if several); failing that, fall
 * back to the unique seat whose nickname equals the header's
 * leader display name (legacy groupings without a creator record
 * carry that name as created_by — same definition); else none. */
export async function buildReminderMessage(db: any, ev: any, slug: string, nowSec: number) {
const dgid = await getReminderSetting(db, slug, 'discord_guild_id');
const t = await getTenantRow(db, slug).catch(() => null);
const guildName = t? String(t.guild_name || slug): slug;
const leader = await leaderDisplayName(db, ev, slug, dgid, guildName);
const roster = await rosterPool(db, slug);
const pool = await memberPool(db, dgid);
await ensureSignupDiscordColumn(db);
const seats = await listSignupSeatsForReminder(db, ev.id);
const creatorId = ev.creator_discord_id ? String(ev.creator_discord_id) : '';
const parsed = [];
const userIds: string[] = [];
for (const seat of seats) {
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
// Leader-marker placement: a creator resolution hit wins; else the unique same-name fallback; else no marker.
let leaderIdx = parsed.findIndex((p) => p.isCreator);
if (leaderIdx < 0) {
const sameName = parsed.map((p, i) => (p.nick === leader ? i : -1)).filter((i) => i >= 0);
if (sameName.length === 1) leaderIdx = sameName[0];
}
const rows = parsed.map((p, i) => {
let line = `${i + 1}. ${p.token}`;
if (i === leaderIdx) line += '（车头）';
if (p.sect) line += ` · ${p.sect}`;
if (p.sect === '牵丝·霖') line += ' ✚'; // The game's only healer school.
return line;
});
const occupied = rows.length;
const total = Number(ev.max_slots) || occupied; // Capacity matches the site's toGrouping: events.max_slots.
const mins = Math.max(1, Math.round((Number(ev.starts_at_utc) - nowSec) / 60));
// Header (plain-text content): frozen line 1 verbatim + the grouping-name line — the two key facts a plain-text reader gets first, visible above the card.
const content = [
`${leader} 发起了就位确认：你准备好了吗？`,
`【${ev.title}】`,
].join('\n');
// Card body: frozen line 2 verbatim; the dungeon line in wuxia tone.
const descLines = [`还有 ${mins} 分钟就发车咯，笨笨要加油哦！`];
if (ev.dungeon && String(ev.dungeon).trim()) descLines.push(`此行险地：${String(ev.dungeon).trim()}`);
const embed = {
title: String(ev.title || ''),
url: carDetailUrl(slug, ev.id),
color: REMINDER_EMBED_COLOR,
thumbnail: { url: carOgImageUrl(slug, ev.id) },
description: descLines.join('\n'),
fields: [{
name: `同行名册（${occupied}/${total}）`,
// With an empty roster the field value cannot be an empty string (Discord rejects it) — a placeholder line keeps the shape.
value: rows.length ? rows.join('\n') : '虚位以待，静候同道',
inline: false,
}],
footer: {
text: occupied < total
? `尚缺 ${total - occupied} 位同道未至，江湖路远，望速来同行哦`
: '全员到齐，拔寨启程！',
},
};
return { content, embeds: [embed], userIds };
}

export async function postWebhook(webhook: string, content: string, userIds?: string[], parseTypes?: string[], identity?: any, embeds?: any[]) {
const body: any = {
content,
// Sender identity is per-guild: with a custom avatar, use the guild name + avatar URL; without one (identity=null) fall back to the platform default identity. Only identity fields change — never the copy.
username: (identity && identity.username) || REMINDER_USERNAME,
avatar_url: (identity && identity.avatarUrl) || REMINDER_AVATAR_URL,
allowed_mentions: { parse: parseTypes || [], users: userIds || []},
};
// Card (optional; only departure reminders pass one): omitting it means the payload has no embeds key — legacy callers (heirloom / test messages) keep their exact send shape.
if (Array.isArray(embeds) && embeds.length) body.embeds = embeds;
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
} catch (e: any) {
return { ok: false, status: 0, error: 'Webhook 请求失败: ' + String(e && e.message || e).slice(0, 160)};
} finally {
clearTimeout(timer);
}
}

async function recordStatus(db: any, slug: string, st: { ok: boolean; error?: string; atSec: number; eventTitle?: string; test?: boolean }) {
const { ok, error, atSec, eventTitle, test } = st;
await setReminderSetting(db, slug, 'reminder_last_at', String(atSec));
await setReminderSetting(db, slug, 'reminder_last_status', test? (ok? 'test-ok': 'test-error'): (ok? 'ok': 'error'));
await setReminderSetting(db, slug, 'reminder_last_error', ok? '': String(error || '未知错误').slice(0, 300));
if (eventTitle) await setReminderSetting(db, slug, 'reminder_last_event', String(eventTitle).slice(0, 60));
}

/* Send one grouping's reminder and record the outcome: success
 * writes reminder_sent_at, failure writes reminder_error
 * (settled, never retried). Returns the send result. */
export async function sendReminderForEvent(db: any, slug: string, ev: any, cfg: any, nowSec: number, expoBase?: string) {
await ensureReminderColumns(db);
const { content, embeds, userIds} = await buildReminderMessage(db, ev, slug, nowSec);
const identity = await webhookIdentity(db, slug).catch(() => null);
const res = await postWebhook(cfg.webhook, content, userIds, undefined, identity, embeds);
if (res.ok) {
await markReminderSent(db, ev.id, nowSec);
} else {
await markReminderError(db, ev.id, String(res.error || '发送失败').slice(0, 300));
// Site-wide error sink (audit A7): alongside reminder_error, for the hub portal's unified board.
void logError(db, { source: 'reminder', name: 'WebhookError', message: String(res.error || '发送失败'), tenant: slug, context: { eventId: ev.id } });
}
await recordStatus(db, slug, { ok: res.ok, error: res.error, atSec: nowSec, eventTitle: ev.title, test: false});
// App push channel (added 2026-10-25 alongside Discord): targets
// the participants already resolved to accounts above (userIds),
// mapped to their app device tokens. Fully isolated: a push
// failure never changes the Discord settlement state
// (reminder_sent_at / reminder_error are written first).
try { await sendDeparturePush(db, slug, ev, cfg, userIds, nowSec, expoBase); } catch { /* Push failures are silent. */ }
return res;
}
