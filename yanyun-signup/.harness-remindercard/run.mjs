// Departure-reminder embed redesign acceptance (2026-10-26): the real
// buildReminderMessage / postWebhook / sendReminderForEvent functions +
// FakeDB routed faithfully by SQL shape + a global fetch stub capturing
// send bodies (never sends a real message). Asserted surface: card
// structure (theme gold / thumbnail / detail link / fields), the two
// mandated lines frozen verbatim, the N-minutes rule, roster semantic
// markers (numbering / @ / creator / sect / healer ✚), the
// allowed_mentions rule unchanged (IDs only, never @everyone), the
// three shapes (no dungeon / full / not full), and postWebhook's old
// shape unchanged when no embeds are passed.
import {
buildReminderMessage, postWebhook, sendReminderForEvent, sendReminderBeat,
dueReminderBeats, nextReminderAt,
parseReminderOffsets, serializeReminderOffsets,
sanitizeReminderCustomText, neutralizeMentions,
REMINDER_EMBED_COLOR, REMINDER_USERNAME, REMINDER_AVATAR_URL,
carDetailUrl, carOgImageUrl,
} from '../src/domains/groupings/reminder.ts';

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

/* Drizzle query-builder channel: selects/gets with field mapping run in
   values mode on the D1 driver, i.e. stmt.bind(...).raw(), which returns
   value arrays in SELECT column order. Convert this FakeDB's routed
   object rows into that shape; unparseable column lists (functions /
   subqueries) fall back to the row objects' own value order. */
function toRawRows(sqlText, rows) {
  if (!rows || !rows.length) return [];
  let cols = null;
  const m = /select\s+([\s\S]+?)\s+from\s/i.exec(sqlText);
  if (m) {
    const parts = m[1].split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length && parts.every((p) => !p.includes('(') && !p.includes(')'))) {
      cols = parts.map((p) => {
        const as = /\bas\s+"?([A-Za-z0-9_]+)"?\s*$/i.exec(p);
        if (as) return as[1];
        const clean = p.replace(/"/g, '');
        const dot = clean.lastIndexOf('.');
        return (dot >= 0 ? clean.slice(dot + 1) : clean).trim();
      });
      if (cols.some((c) => !c || c === '*')) cols = null;
    }
  }
  return rows.map((r) => (cols
    ? cols.map((c) => (r[c] === undefined ? null : r[c]))
    : Object.values(r)));
}

/* ---------------- FakeDB ---------------- */
const unknownSql = new Set();
function makeDb(fx) {
const state = { eventUpdates: [], settingsWrites: [], beats: []};
function route(kind, sql, b) {
// Data-layer (Drizzle) SQL normalization: strip quotes + settings. qualifiers (routing match only).
sql = sql.replace(/"/g, '').replace(/settings\./g, '');
if (/PRAGMA table_info/.test(sql)) {
return { results: ['id', 'discord_id', 'ready_at', 'reminder_sent_at', 'reminder_error'].map((name) => ({ name}))};
}
if (/INSERT INTO event_reminders/.test(sql)) {
const isSent = /sent_at/.test(sql.split('VALUES')[0]);
const prev = state.beats.find((r) => r.event_id === b[0] && r.offset_min === b[1]);
const row = isSent
? { event_id: b[0], offset_min: b[1], sent_at: b[2], error: null }
: { event_id: b[0], offset_min: b[1], sent_at: prev ? prev.sent_at : null, error: b[2] };
if (prev) Object.assign(prev, row); else state.beats.push(row);
return { meta: {}};
}
if (/FROM event_reminders/.test(sql)) {
return { results: state.beats.filter((r) => b.includes(r.event_id))};
}
if (/FROM events/.test(sql)) {
const pending = fx.events.filter((e) => e.tenant === b[0] && (e.status === 'open' || e.status === 'closed')
&& e.starts_at_utc != null && e.reminder_sent_at == null && e.reminder_error == null);
if (/SELECT id, starts_at_utc/.test(sql)) {
return { results: pending.filter((e) => e.starts_at_utc > b[1]).map((e) => ({ id: e.id, starts_at_utc: e.starts_at_utc }))};
}
if (/id IN/.test(sql)) {
return { results: pending.filter((e) => b.slice(1).includes(e.id))};
}
return { results: []};
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
async raw() { const res = await route('all', sql, this._b); return toRawRows(sql, (res && res.results) || []); },
async first() { return route('first', sql, this._b);},
async all() { return route('all', sql, this._b);},
async run() { return route('run', sql, this._b);},
});
return { db: { prepare: (sql) => stmt(sql)}, state};
}

/* ---------------- Fixtures ---------------- */
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
{ event_id: 503, nickname: '路怀', discord_id: '9001', weapon: '', ready_at: NOW},
{ event_id: 503, nickname: '鱼崽', discord_id: '', weapon: ''},
],
events: [
{ id: 501, tenant: SLUG, title: '今晚双十·冲层', type: 'activity', dungeon: '玉魄染青苍', max_slots: 3, starts_at_utc: NOW + 540, creator_discord_id: '9001', created_by: '', status: 'open', reminder_sent_at: null, reminder_error: null},
{ id: 502, tenant: SLUG, title: '爬塔试水', type: 'tower', dungeon: '', max_slots: 10, starts_at_utc: NOW + 1500, creator_discord_id: '', created_by: '热心侠客', status: 'open', reminder_sent_at: null, reminder_error: null},
{ id: 503, tenant: SLUG, title: '就位验收车', type: 'activity', dungeon: '', max_slots: 2, starts_at_utc: NOW + 1500, creator_discord_id: '9001', created_by: '', status: 'open', reminder_sent_at: null, reminder_error: null},
],
};
const { db, state} = makeDb(fx);

/* Car A: full 3/3 + has a dungeon + stamped creator + healer seat + same person in two seats (deduplicated) */
const evA = {
id: 501, tenant: SLUG, title: '今晚双十·冲层', type: 'activity', dungeon: '玉魄染青苍',
max_slots: 3, starts_at_utc: NOW + 540, creator_discord_id: '9001', created_by: '',
};
/* Car B: not full 2/10 + no dungeon + no creator record (created_by text fallback marks the creator) */
const evB = {
id: 502, tenant: SLUG, title: '爬塔试水', type: 'tower', dungeon: '',
max_slots: 10, starts_at_utc: NOW + 1500, creator_discord_id: '', created_by: '热心侠客',
};

/* ================= URL construction ================= */
eq('详情页 URL', carDetailUrl(SLUG, 501), 'https://yanyun.app/cardtest/car/501');
eq('车 OG 图 URL', carOgImageUrl(SLUG, 501), 'https://og.yanyun.app/og/cardtest/car/501.png');
eq('embed 主题金 = 0xC9A35C', REMINDER_EMBED_COLOR, 0xC9A35C);

/* ================= Car A: full + dungeon ================= */
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

/* ================= Car B: not full + no dungeon + creator fallback ================= */
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

/* ================= Minutes floor rule ================= */
const msgC = await buildReminderMessage(db, {...evB, starts_at_utc: NOW + 20}, SLUG, NOW);
check('分钟下限 = 1 (既有口径)', String(msgC.embeds[0].description).includes('还有 1 分钟就发车咯，笨笨要加油哦！'),
msgC.embeds[0].description);

/* ================= Advanced reminders: offset config ================= */
deepEq('提前量: 未设置 = 默认 [10]', parseReminderOffsets(''), [10]);
deepEq('提前量: null = 默认 [10]', parseReminderOffsets(null), [10]);
deepEq('提前量: none =  explicit 空', parseReminderOffsets('none'), []);
deepEq('提前量: 多选保序 (降序)', parseReminderOffsets('30,60'), [60, 30]);
deepEq('提前量: 去重 + 过滤非预置', parseReminderOffsets('10,10,45,5'), [10, 5]);
deepEq('提前量: 全非法 = 默认 [10]', parseReminderOffsets('abc'), [10]);
eq('提前量序列化: 降序逗号', serializeReminderOffsets([30, 60]), '60,30');
eq('提前量序列化: 空 = none', serializeReminderOffsets([]), 'none');
eq('提前量序列化: 非法项剔除后为空 = none', serializeReminderOffsets([7]), 'none');
eq('自定义文案: 换行折叠为一行', sanitizeReminderCustomText('第一行\n第二行\r\n第三行'), '第一行 第二行 第三行');
eq('自定义文案: 100 字上限', [...sanitizeReminderCustomText('长'.repeat(150))].length, 100);
check('提及中和: @everyone 被零宽空格打断', neutralizeMentions('@everyone').includes('@\u200beveryone') &&!neutralizeMentions('@everyone').includes('@everyone'));

/* ================= Advanced reminders: ready-aware compose ================= */
/* Car C: leader (9001) already ready, member (9002) not ready. */
const evC = fx.events.find((e) => e.id === 503);
const msgCFirst = await buildReminderMessage(db, evC, SLUG, NOW, { isFirst: true });
deepEq('首拍 @ 全部落座者 (含已就位)', msgCFirst.userIds, ['9001', '9002']);
deepEq('推送目标恒为未就位者 (首拍)', msgCFirst.pushUserIds, ['9002']);
const msgCLater = await buildReminderMessage(db, evC, SLUG, NOW, { isFirst: false });
deepEq('后续拍只 @ 未就位者', msgCLater.userIds, ['9002']);
const rowsCLater = String(msgCLater.embeds[0].fields?.[0]?.value || '').split('\n');
eq('后续拍: 已就位者名册行降为纯文本 (仍在册)', rowsCLater[0], '1. 路怀（车头）');
eq('后续拍: 未就位者仍被 @', rowsCLater[1], '2. <@9002>');
deepEq('推送目标恒为未就位者 (后续拍)', msgCLater.pushUserIds, ['9002']);
/* Custom line: inside the embed, after the frozen line, mention-safe. */
const msgCustom = await buildReminderMessage(db, evA, SLUG, NOW, { isFirst: true, customText: '记得带药 @everyone <@9001>' });
const descCustom = String(msgCustom.embeds[0].description || '').split('\n');
eq('自定义行: 钦定行 2 仍逐字居首', descCustom[0], '还有 9 分钟就发车咯，笨笨要加油哦！');
eq('自定义行: 紧随险地行之后', descCustom[1], '此行险地：玉魄染青苍');
check('自定义行: 原文保留但提及已中和', descCustom[2].startsWith('记得带药') &&!descCustom[2].includes('@everyone') &&!descCustom[2].includes('<@9001>'), descCustom[2]);
const msgNoCustom = await buildReminderMessage(db, evA, SLUG, NOW, { isFirst: true, customText: '  ' });
eq('自定义行空白 = 旧观感 (正文两行)', String(msgNoCustom.embeds[0].description).split('\n').length, 2);

/* ================= Advanced reminders: beat scheduling ================= */
eq('下一拍时刻 = 最早车的 30 分钟拍 (已过点)', await nextReminderAt(db, SLUG, NOW, [30, 10]), NOW + 540 - 1800);
const dueBeats = await dueReminderBeats(db, SLUG, NOW, [30, 10]);
eq('到期拍数 (501 合并双拍 + 502/503 各一拍)', dueBeats.length, 3);
const beat501 = dueBeats.find((b) => b.ev.id === 501);
check('501: 双拍同到期只发最晚一拍', !!beat501 && beat501.offsetMin === 10, JSON.stringify(beat501 && beat501.offsetMin));
deepEq('501: 被合并的早拍标记 superseded', beat501 ? beat501.superseded : null, [30]);
check('501: 首拍语义 + 末拍语义', !!beat501 && beat501.isFirst === true && beat501.isLast === true);
const beat503 = dueBeats.find((b) => b.ev.id === 503);
check('503: 只 30 分钟拍到期 (25 分钟后发车)', !!beat503 && beat503.offsetMin === 30 && beat503.isLast === false, JSON.stringify(beat503 && beat503.offsetMin));
deepEq('提前量全关: 无到期拍', await dueReminderBeats(db, SLUG, NOW, []), []);
eq('提前量全关: 无下一拍', await nextReminderAt(db, SLUG, NOW, []), null);

/* ================= End-to-end send (captured by the fetch stub) ================= */
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

// postWebhook legacy-shape compat: no embeds passed -> the payload has no embeds key (heirloom/test sends take the same path).
sent.length = 0;
await postWebhook('https://discord.com/api/webhooks/123456/abcdef', '纯文本消息', ['42'], ['everyone'], null);
check('无 embeds 时载荷不含 embeds 键', sent[0] &&!('embeds' in sent[0].body));
deepEq('旧调用 parse 透传不变', sent[0]?.body.allowed_mentions, { parse: ['everyone'], users: ['42']});
eq('旧调用 content 透传', sent[0]?.body.content, '纯文本消息');
} finally {
globalThis.fetch = realFetch;
}
}

/* ================= Advanced reminders: per-beat send + settlement ================= */
{
const sent = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
sent.push({ url: String(url), body: JSON.parse(opts.body) });
return new Response(null, { status: 204 });
};
try {
const cfg = { webhook: 'https://discord.com/api/webhooks/123456/abcdef', guildName: '卡面验收百业', enabled: true, offsets: [30, 10], customText: '' };
const r1 = await sendReminderBeat(db, SLUG, evC, { offsetMin: 30, isFirst: true, isLast: false, superseded: [] }, cfg, NOW);
check('拍 30 发送 ok', r1.ok === true, JSON.stringify(r1));
eq('拍 30: 首拍 @ 全部', sent[0]?.body.allowed_mentions?.users?.join(','), '9001,9002');
deepEq('拍 30 后未写整车结算 (后续拍未到)', state.eventUpdates.filter((u) => u.id === 503), []);
const r2 = await sendReminderBeat(db, SLUG, evC, { offsetMin: 10, isFirst: false, isLast: true, superseded: [] }, cfg, NOW);
check('拍 10 发送 ok', r2.ok === true, JSON.stringify(r2));
eq('拍 10: 只 @ 未就位者', sent[1]?.body.allowed_mentions?.users?.join(','), '9002');
deepEq('末拍后写整车结算 reminder_sent_at', state.eventUpdates.filter((u) => u.id === 503), [{ sentAt: NOW, id: 503 }]);
deepEq('逐拍结算行齐备 (30/10 均 sent)', state.beats.filter((r) => r.event_id === 503).map((r) => `${r.offset_min}:${r.sent_at === NOW ? 'sent' : r.sent_at}`).sort(), ['10:sent', '30:sent']);
/* After full settlement the grouping leaves the pending set: no more beats. */
const dueAfter = await dueReminderBeats(db, SLUG, NOW, [30, 10]);
check('整车结算后不再产生到期拍 (503)', !dueAfter.some((b) => b.ev.id === 503));
} finally {
globalThis.fetch = realFetch;
}
}

if (unknownSql.size) console.log('\n[FakeDB 未路由 SQL — 已走默认空结果]\n' + [...unknownSql].join('\n'));
console.log(`\n== remindercard harness: ${pass} passed, ${fail} failed ==`);
if (fails.length) { console.log('FAILS:\n' + fails.map((f) => ' - ' + f).join('\n')); process.exit(1);}
