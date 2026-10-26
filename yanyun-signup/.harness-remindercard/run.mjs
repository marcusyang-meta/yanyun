// 发车提醒 embed 改版验收 (2026-10-26): buildReminderMessage / postWebhook /
// sendReminderForEvent 真函数 + FakeDB 按 SQL 形状忠实路由 + 全局 fetch
// stub 捕获发送体 (绝不发真消息)。断言面: 卡面结构 (主题金/thumbnail/
// 详情链接/字段)、两条钦定行逐字冻结、N 分钟口径、名册语义标记 (编号/
// @/车头/流派/治疗 ✚)、allowed_mentions 口径不变 (只解析 ID, 永不
// @everyone)、无副本/满员/未满三形态、postWebhook 无 embeds 时旧形态不变。
import {
buildReminderMessage, postWebhook, sendReminderForEvent,
REMINDER_EMBED_COLOR, REMINDER_USERNAME, REMINDER_AVATAR_URL,
carDetailUrl, carOgImageUrl,
} from '../src/reminder.js';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
if (ok) pass++; else { fail++; fails.push(name + (extra? ' — ' + extra: ''));}
console.log(`${ok? 'PASS': 'FAIL'} ${name}${extra &&!ok? ' — ' + extra: ''}`);
}
function eq(name, got, want) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);}
function deepEq(name, got, want) {
check(name, JSON.stringify(got) === JSON.stringify(want),
`got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
}

/* ---------------- FakeDB ---------------- */
const unknownSql = new Set();
function makeDb(fx) {
const state = { eventUpdates: [], settingsWrites: []};
function route(kind, sql, b) {
if (/PRAGMA table_info/.test(sql)) {
return { results: ['id', 'discord_id', 'reminder_sent_at', 'reminder_error'].map((name) => ({ name}))};
}
if (/guild_members/.test(sql)) {
if (/CREATE TABLE/.test(sql)) return { meta: {}};
if (/WHERE tenant\s*=\s*\? AND discord_id\s*=\s*\?/.test(sql)) {
const row = fx.roster.find((r) => r.discord_id === b[1]) || null;
return kind === 'first'? row: { results: row? [row]: []};
}
if (/WHERE tenant\s*=\s*\?/.test(sql)) return { results: fx.roster};
return kind === 'first'? null: { results: []};
}
if (/FROM settings/.test(sql)) {
if (/WHERE tenant/.test(sql)) {
const v = fx.settings[`${b[0]}::${b[1]}`];
return kind === 'first'? (v == null? null: { value: v}): { results: v == null? []: [{ value: v}]};
}
return kind === 'first'? null: { results: []};
}
if (/INSERT INTO settings/.test(sql)) { state.settingsWrites.push(b); return { meta: {}};}
if (/FROM tenants/.test(sql)) {
const t = fx.tenants.find((x) => x.slug === b[0]) || null;
return kind === 'first'? t: { results: t? [t]: []};
}
if (/FROM signups/.test(sql)) {
return { results: fx.signups.filter((s) => s.event_id === b[0])};
}
if (/FROM user_guild_nicks/.test(sql)) {
if (/WHERE guild_id/.test(sql)) return { results: fx.guildNicks};
if (/WHERE discord_id/.test(sql)) {
const row = fx.guildNicks.find((r) => r.discord_id === b[0]) || null;
return kind === 'first'? row: { results: row? [row]: []};
}
return { results: []};
}
if (/FROM users/.test(sql)) {
if (/WHERE discord_id/.test(sql)) {
const u = fx.users.find((x) => x.discord_id === b[0]) || null;
return kind === 'first'? u: { results: u? [u]: []};
}
return { results: fx.users};
}
if (/UPDATE events SET reminder_sent_at/.test(sql)) { state.eventUpdates.push({ sentAt: b[0], id: b[1]}); return { meta: {}};}
if (/UPDATE events SET reminder_error/.test(sql)) { state.eventUpdates.push({ error: b[0], id: b[1]}); return { meta: {}};}
if (/guild_avatars|CREATE TABLE/.test(sql)) return kind === 'first'? null: (kind === 'all'? { results: []}: { meta: {}});
unknownSql.add(sql.replace(/\s+/g, ' ').slice(0, 110));
if (kind === 'first') return null;
if (kind === 'all') return { results: []};
return { meta: {}};
}
const stmt = (sql) => ({
_b: [], bind(...a) { this._b = a; return this;},
async first() { return route('first', sql, this._b);},
async all() { return route('all', sql, this._b);},
async run() { return route('run', sql, this._b);},
});
return { db: { prepare: (sql) => stmt(sql)}, state};
}

/* ---------------- 夹具 ---------------- */
const SLUG = 'cardtest';
const DGID = '777000111222333444';
const NOW = Math.floor(Date.now() / 1000);
const fx = {
tenants: [{ slug: SLUG, guild_name: '卡面验收百业'}],
settings: { [`${SLUG}::discord_guild_id`]: DGID},
roster: [
{ discord_id: '9001', nick: '路怀', global_name: 'LeaderGlobal'},
{ discord_id: '9002', nick: '鱼崽', global_name: 'FishGlobal'},
],
users: [
{ discord_id: '9001', username: 'LeaderGlobal', guilds_json: `["${DGID}"]`},
{ discord_id: '9002', username: 'FishGlobal', guilds_json: `["${DGID}"]`},
],
guildNicks: [
{ discord_id: '9001', nick: '路怀'},
{ discord_id: '9002', nick: '鱼崽'},
],
signups: [
{ event_id: 501, nickname: '路怀', discord_id: '9001', weapon: '破竹·樽'},
{ event_id: 501, nickname: '鱼崽', discord_id: '', weapon: '牵丝·霖'},
{ event_id: 501, nickname: '路怀', discord_id: '9001', weapon: ''},
{ event_id: 502, nickname: '热心侠客', discord_id: '', weapon: '鸣金·虹'},
{ event_id: 502, nickname: '鱼崽', discord_id: '', weapon: ''},
],
};
const { db, state} = makeDb(fx);

/* 车 A: 满员 3/3 + 有副本 + 车头盖戳 + 治疗位 + 同人双座 (去重) */
const evA = {
id: 501, tenant: SLUG, title: '今晚双十·冲层', type: 'activity', dungeon: '玉魄染青苍',
max_slots: 3, starts_at_utc: NOW + 540, creator_discord_id: '9001', created_by: '',
};
/* 车 B: 未满 2/10 + 无副本 + 无车头记录 (created_by 原文回退标车头) */
const evB = {
id: 502, tenant: SLUG, title: '爬塔试水', type: 'tower', dungeon: '',
max_slots: 10, starts_at_utc: NOW + 1500, creator_discord_id: '', created_by: '热心侠客',
};

/* ================= URL 构造 ================= */
eq('详情页 URL', carDetailUrl(SLUG, 501), 'https://yanyun.app/cardtest/car/501');
eq('车 OG 图 URL', carOgImageUrl(SLUG, 501), 'https://og.yanyun.app/og/cardtest/car/501.png');
eq('embed 主题金 = 0xC9A35C', REMINDER_EMBED_COLOR, 0xC9A35C);

/* ================= 车 A: 满员 + 副本 ================= */
const msgA = await buildReminderMessage(db, evA, SLUG, NOW);
const [lineA1, lineA2] = msgA.content.split('\n');
eq('钦定行 1 逐字 (content 首行)', lineA1, '路怀 发起了就位确认：你准备好了吗？');
eq('content 次行 = 车名行', lineA2, '【今晚双十·冲层】');
eq('content 恰两行', msgA.content.split('\n').length, 2);
eq('embeds 恰一张卡', msgA.embeds.length, 1);
const emA = msgA.embeds[0];
eq('卡 title = 车名', emA.title, '今晚双十·冲层');
eq('卡 url = 详情页', emA.url, 'https://yanyun.app/cardtest/car/501');
eq('卡 color = 主题金', emA.color, 0xC9A35C);
eq('卡 thumbnail = 车 OG 图', emA.thumbnail?.url, 'https://og.yanyun.app/og/cardtest/car/501.png');
const [descA1, descA2] = String(emA.description || '').split('\n');
eq('钦定行 2 逐字 + 真实分钟 (9)', descA1, '还有 9 分钟就发车咯，笨笨要加油哦！');
eq('副本行武侠化', descA2, '此行险地：玉魄染青苍');
eq('名册 field 名 (满员)', emA.fields?.[0]?.name, '同行名册（3/3）');
const rowsA = String(emA.fields?.[0]?.value || '').split('\n');
eq('名册行 1: 车头标记 + 流派', rowsA[0], '1. <@9001>（车头） · 破竹·樽');
eq('名册行 2: 名册解析 @ + 治疗 ✚', rowsA[1], '2. <@9002> · 牵丝·霖 ✚');
eq('名册行 3: 同人次座无标记无流派', rowsA[2], '3. <@9001>');
eq('满员尾行', emA.footer?.text, '全员到齐，拔寨启程！');
deepEq('userIds 解析序 + 去重', msgA.userIds, ['9001', '9002']);
check('全载荷含钦定行 1 逐字', JSON.stringify(msgA).includes('路怀 发起了就位确认：你准备好了吗？'));
check('全载荷含钦定行 2 逐字', JSON.stringify(msgA).includes('还有 9 分钟就发车咯，笨笨要加油哦！'));
check('旧文案已退场 (队伍名册/还差/副本：)',!JSON.stringify(msgA).includes('队伍名册')
&&!JSON.stringify(msgA).includes('还差') &&!JSON.stringify(msgA).includes('副本：'));

/* ================= 车 B: 未满 + 无副本 + 车头回退 ================= */
const msgB = await buildReminderMessage(db, evB, SLUG, NOW);
eq('车 B 钦定行 1 (created_by 显示名)', msgB.content.split('\n')[0], '热心侠客 发起了就位确认：你准备好了吗？');
const emB = msgB.embeds[0];
eq('车 B 正文仅钦定行 2 (25 分钟, 无险地行)', emB.description, '还有 25 分钟就发车咯，笨笨要加油哦！');
eq('车 B 名册 field 名 (未满)', emB.fields?.[0]?.name, '同行名册（2/10）');
const rowsB = String(emB.fields?.[0]?.value || '').split('\n');
eq('车 B 行 1: 未解析纯文本 + 同名回退车头标', rowsB[0], '1. 热心侠客（车头） · 鸣金·虹');
eq('车 B 行 2: 名册解析 @', rowsB[1], '2. <@9002>');
eq('车 B 未满尾行 (尚缺 8)', emB.footer?.text, '尚缺 8 位同道未至，江湖路远，望速来同行哦');
deepEq('车 B userIds 只含解析成功者', msgB.userIds, ['9002']);
eq('车 B 卡 url/thumbnail 按本车 id', emB.url, 'https://yanyun.app/cardtest/car/502');

/* ================= 分钟下限口径 ================= */
const msgC = await buildReminderMessage(db, {...evB, starts_at_utc: NOW + 20}, SLUG, NOW);
check('分钟下限 = 1 (既有口径)', String(msgC.embeds[0].description).includes('还有 1 分钟就发车咯，笨笨要加油哦！'),
msgC.embeds[0].description);

/* ================= 端到端发送 (stub fetch 捕获) ================= */
{
const sent = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
sent.push({ url: String(url), body: JSON.parse(opts.body)});
return new Response(null, { status: 204});
};
try {
const res = await sendReminderForEvent(db, SLUG, evA,
{ webhook: 'https://discord.com/api/webhooks/123456/abcdef', guildName: '卡面验收百业', enabled: true}, NOW);
check('端到端发送 ok', res.ok === true, JSON.stringify(res));
eq('发送恰一条', sent.length, 1);
const body = sent[0]?.body || {};
eq('发送体 content 与构造一致', body.content, msgA.content);
deepEq('发送体 embeds 与构造一致', body.embeds, msgA.embeds);
deepEq('allowed_mentions: parse 空 + users = 解析集', body.allowed_mentions, { parse: [], users: ['9001', '9002']});
check('载荷永不 @everyone',!JSON.stringify(body).includes('@everyone') &&!JSON.stringify(body).includes('"everyone"'));
eq('无头像身份回退: username', body.username, REMINDER_USERNAME);
eq('无头像身份回退: avatar_url', body.avatar_url, REMINDER_AVATAR_URL);
deepEq('结算: reminder_sent_at 已写', state.eventUpdates, [{ sentAt: NOW, id: 501}]);

// postWebhook 旧形态回 compat: 不传 embeds -> 载荷无 embeds 键 (传家宝/测试同路)
sent.length = 0;
await postWebhook('https://discord.com/api/webhooks/123456/abcdef', '纯文本消息', ['42'], ['everyone'], null);
check('无 embeds 时载荷不含 embeds 键', sent[0] &&!('embeds' in sent[0].body));
deepEq('旧调用 parse 透传不变', sent[0]?.body.allowed_mentions, { parse: ['everyone'], users: ['42']});
eq('旧调用 content 透传', sent[0]?.body.content, '纯文本消息');
} finally {
globalThis.fetch = realFetch;
}
}

if (unknownSql.size) console.log('\n[FakeDB 未路由 SQL — 已走默认空结果]\n' + [...unknownSql].join('\n'));
console.log(`\n== remindercard harness: ${pass} passed, ${fail} failed ==`);
if (fails.length) { console.log('FAILS:\n' + fails.map((f) => ' - ' + f).join('\n')); process.exit(1);}
