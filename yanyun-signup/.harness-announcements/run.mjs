// Guild announcements acceptance (communication line F9/F10/F18):
//  - F9 post: the admin verdict gates posting (anonymous / plain
//    member / admin of ANOTHER guild -> adminOnly or guildNotFound;
//    the guild's own bound-server admin posts); a post lands one row
//    (kind/title/body trimmed, author snapshot, epoch-seconds stamp),
//    charges the guild's daily usage counter, marks the author read,
//    and pushes over the shared Expo pipeline to roster members with
//    tokens (author excluded; the push fetch is stubbed and counted).
//  - Shape: empty title -> announcementTitleRequired; title >80 ->
//    announcementTitleTooLong; body >2000 -> announcementBodyTooLong;
//    rejected posts store nothing and charge nothing.
//  - Rate limits (per guild per day, usage counters): the 6th
//    standard post -> announcementDailyLimit (limit 5, copy carries
//    the number); urgent calls have their own counter — the 3rd ->
//    urgentCallDailyLimit (limit 2) even while standard budget
//    remains; another guild's budget is untouched.
//  - F18: kind URGENT lands kind 'urgent', the member surface
//    composes urgent=true + the server urgent label, and the push
//    title carries that same label.
//  - Member surface: members read the list on Guild with their own
//    viewerHasRead; GuildLocked (non-member) carries NO announcements
//    field at all; receipts (readCount / receipts) stay null on the
//    member variant and are composed only on GuildAdmin.
//  - F10 mark-read: anonymous -> loginRequired; non-member ->
//    memberOnly; a foreign guild's announcement id ->
//    announcementNotFound (guild-scoped resolution); a member's mark
//    lands one receipt row, is idempotent (first read_at wins), and
//    the admin receipt surface then shows read/unread per roster
//    member with counts.
//  - Delete: admin-only, guild-scoped; removes the row and its
//    receipts; deleting again -> announcementNotFound.
// Real yoga + real resolvers + FakeDB routing by SQL shape into
// in-memory tables (same pattern as .harness-guildadmin).
import { yoga } from '../src/graphql.ts';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}
function eq(name, got, want) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* Drizzle query-builder channel helper (same as .harness-feedback). */
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
function makeDb() {
  const state = {
    tenants: [
      { slug: 'alpha', guild_name: '甲百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '' },
      { slug: 'beta', guild_name: '乙百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '' },
    ],
    settings: new Map([
      ['alpha|discord_guild_id', 'DG1'],
      ['beta|discord_guild_id', 'DG2'],
    ]),
    users: new Map([
      // Admin of DG1 (Administrator bit), plain member of DG1, admin of DG2.
      ['A1', JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '8', owner: false }])],
      ['M1', JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '0', owner: false }])],
      ['M2', JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '0', owner: false }])],
      ['B1', JSON.stringify([{ id: 'DG2', name: 'S2', permissions: '8', owner: false }])],
    ]),
    guildMembers: [
      { tenant: 'alpha', discord_id: 'A1', nick: '管理员甲', global_name: 'AdminA' },
      { tenant: 'alpha', discord_id: 'M1', nick: '成员一', global_name: 'MemberOne' },
      { tenant: 'alpha', discord_id: 'M2', nick: '', global_name: '成员二' },
      { tenant: 'beta', discord_id: 'B1', nick: '乙管理员', global_name: 'AdminB' },
    ],
    pushTokens: [
      { discord_id: 'M1', token: 'ExponentPushToken[member-one]', platform: 'ios' },
      { discord_id: 'A1', token: 'ExponentPushToken[admin-a]', platform: 'ios' },
    ],
    announcements: [], // {id, tenant, kind, title, body, author_discord_id, author_name, created_at}
    reads: [],         // {announcement_id, tenant, discord_id, read_at}
    usage: new Map(),  // `${scope}|${metric}|${day}` -> count
  };
  let nextId = 100;

  function norm(sql) {
    return sql.replace(/"/g, '')
      .replace(/\b(tenants|settings|users|guild_members|guild_announcements|guild_announcement_reads|usage_counters|push_tokens|guild_entitlements)\./g, '')
      .replace(/\s+/g, ' ');
  }

  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });

    /* announcements */
    if (/^INSERT INTO guild_announcements/i.test(sql)) {
      const [tenant, kindV, title, body, authorId, authorName, createdAt] = b;
      const row = { id: nextId++, tenant, kind: kindV, title, body, author_discord_id: authorId, author_name: authorName, created_at: createdAt };
      state.announcements.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    if (/^INSERT INTO guild_announcement_reads/i.test(sql)) {
      const [announcementId, tenant, discordId, readAt] = b;
      if (!state.reads.some((r) => r.announcement_id === Number(announcementId) && r.discord_id === discordId)) {
        state.reads.push({ announcement_id: Number(announcementId), tenant, discord_id: discordId, read_at: readAt });
      }
      return { meta: { changes: 1 } };
    }
    if (/^DELETE FROM guild_announcements/i.test(sql)) {
      const before = state.announcements.length;
      state.announcements = state.announcements.filter((r) => !(r.tenant === b[0] && r.id === Number(b[1])));
      return { meta: { changes: before - state.announcements.length } };
    }
    if (/^DELETE FROM guild_announcement_reads/i.test(sql)) {
      state.reads = state.reads.filter((r) => !(r.tenant === b[0] && r.announcement_id === Number(b[1])));
      return { meta: { changes: 1 } };
    }
    if (/FROM guild_announcements/i.test(sql)) {
      let rows = state.announcements.filter((r) => r.tenant === b[0]);
      if (/AND id =/i.test(sql)) {
        const row = rows.find((r) => r.id === Number(b[1]));
        return first(row ? { ...row } : null);
      }
      rows = rows.sort((x, y) => y.id - x.id).slice(0, Number(b[1] ?? 50));
      return all(rows.map((r) => ({ ...r })));
    }
    if (/FROM guild_announcement_reads/i.test(sql)) {
      if (/announcement_id FROM/i.test(sql) || /^SELECT announcement_id/i.test(sql)) {
        return all(state.reads.filter((r) => r.tenant === b[0] && r.discord_id === b[1]).map((r) => ({ announcement_id: r.announcement_id })));
      }
      const rows = state.reads
        .filter((r) => r.tenant === b[0] && r.announcement_id === Number(b[1]))
        .sort((x, y) => x.read_at - y.read_at)
        .map((r) => ({ discord_id: r.discord_id, read_at: r.read_at }));
      return all(rows);
    }
    /* usage counters */
    if (/^INSERT INTO usage_counters/i.test(sql)) {
      const [scope, metric, day, by, , byAgain] = b;
      const key = `${scope}|${metric}|${day}`;
      state.usage.set(key, (state.usage.get(key) || 0) + Number(byAgain ?? by));
      return { meta: { changes: 1 } };
    }
    if (/FROM usage_counters/i.test(sql)) {
      const key = `${b[0]}|${b[1]}|${b[2]}`;
      return all(state.usage.has(key) ? [{ count: state.usage.get(key) }] : []);
    }
    /* tenants / settings / users / roster / tokens / entitlements */
    if (/FROM tenants WHERE slug/i.test(sql)) return first(state.tenants.find((t) => t.slug === b[0]));
    if (/FROM settings WHERE tenant = \? AND key = \?/i.test(sql)) {
      const v = state.settings.get(`${b[0]}|${b[1]}`);
      return first(v === undefined ? null : { value: v });
    }
    if (/FROM settings WHERE key = \?/i.test(sql)) {
      const rows = [];
      for (const [k, v] of state.settings) { const [t, key] = k.split('|'); if (key === b[0]) rows.push({ tenant: t, value: v }); }
      return all(rows);
    }
    if (/SELECT guilds_json FROM users/i.test(sql)) {
      const v = state.users.get(String(b[0]));
      return first(v === undefined ? null : { guilds_json: v });
    }
    if (/FROM users/i.test(sql)) return first(null);
    if (/FROM guild_members/i.test(sql)) {
      return all(state.guildMembers.filter((m) => m.tenant === b[0]).map((m) => ({ ...m })));
    }
    if (/FROM push_tokens/i.test(sql)) {
      const ids = b.map(String);
      return all(state.pushTokens.filter((t) => ids.includes(t.discord_id)).map((t) => ({ ...t })));
    }
    if (/FROM guild_entitlements/i.test(sql)) return first(null);
    if (/FROM settings/i.test(sql)) return all([]);
    if (kind === 'first') return null;
    return { results: [] };
  }

  const stmt = (sql) => ({
    _b: [], bind(...a) { this._b = a; return this; },
    async raw() { const res = await route('all', sql, this._b); return toRawRows(sql, (res && res.results) || []); },
    async first() { return route('first', sql, this._b); },
    async all() { return route('all', sql, this._b); },
    async run() { return route('run', sql, this._b); },
  });
  const db = {
    prepare: (sql) => stmt(sql),
    batch: async (stmts) => { for (const st of stmts) await st.run(); return []; },
  };
  return { db, state };
}

const { db, state } = makeDb();
const env = { DB: db };
const adminA = { discordId: 'A1', name: '管理员甲', guilds: ['DG1'] };
const member1 = { discordId: 'M1', name: '成员一', guilds: ['DG1'] };
const member2 = { discordId: 'M2', name: '成员二', guilds: ['DG1'] };
const adminB = { discordId: 'B1', name: '乙管理员', guilds: ['DG2'] };
const outsider = { discordId: 'X1', name: '路人', guilds: [] };

/* Expo push stub: count sends, answer ok tickets (no receipts work). */
const pushCalls = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  const u = String(url);
  if (u.includes('/--/api/v2/push/send')) {
    const msgs = JSON.parse(opts.body);
    pushCalls.push(msgs);
    return new Response(JSON.stringify({ data: msgs.map(() => ({ status: 'ok' })) }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  if (u.includes('/--/api/v2/push/getReceipts')) {
    return new Response(JSON.stringify({ data: {} }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  return realFetch(url, opts);
};

const pending = [];
async function gql(query, { user = adminA, variables } = {}) {
  const ctx = {
    env, request: new Request('http://local/graphql'), user,
    locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai',
    executionCtx: { waitUntil(p) { pending.push(Promise.resolve(p).catch(() => {})); } },
  };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

const postMut = `mutation($slug: String!, $kind: AnnouncementKind!, $title: String!, $body: String!) {
  postGuildAnnouncement(slug: $slug, kind: $kind, title: $title, body: $body) {
    ok error errorCode announcement { id kind urgent title } } }`;
const post = (user, slug, kind, title, body) => gql(postMut, { user, variables: { slug, kind, title, body } });
const markMut = `mutation($slug: String!, $id: ID!) {
  markGuildAnnouncementRead(slug: $slug, announcementId: $id) {
    ok error errorCode announcement { id viewerHasRead } } }`;
const mark = (user, slug, id) => gql(markMut, { user, variables: { slug, id: String(id) } });
const delMut = `mutation($slug: String!, $id: ID!) {
  deleteGuildAnnouncement(slug: $slug, announcementId: $id) { ok error errorCode } }`;
const del = (user, slug, id) => gql(delMut, { user, variables: { slug, id: String(id) } });

/* ================= post: verdict + shape ================= */
{
  const anon = await post(null, 'alpha', 'STANDARD', '标题', '正文');
  eq('匿名发布 -> adminOnly', anon.data?.postGuildAnnouncement?.errorCode, 'adminOnly');
  const member = await post(member1, 'alpha', 'STANDARD', '标题', '正文');
  eq('普通成员发布 -> adminOnly', member.data?.postGuildAnnouncement?.errorCode, 'adminOnly');
  const crossAdmin = await post(adminB, 'alpha', 'STANDARD', '标题', '正文');
  eq('他百业管理员发布 -> adminOnly (跨百业不串权)', crossAdmin.data?.postGuildAnnouncement?.errorCode, 'adminOnly');
  const missing = await post(adminA, 'nope', 'STANDARD', '标题', '正文');
  eq('不存在的百业 -> guildNotFound', missing.data?.postGuildAnnouncement?.errorCode, 'guildNotFound');
  eq('拒绝不落库', state.announcements.length, 0);

  const empty = await post(adminA, 'alpha', 'STANDARD', '   ', '正文');
  eq('空标题 -> announcementTitleRequired', empty.data?.postGuildAnnouncement?.errorCode, 'announcementTitleRequired');
  const longTitle = await post(adminA, 'alpha', 'STANDARD', '题'.repeat(81), '正文');
  eq('标题 81 字 -> announcementTitleTooLong', longTitle.data?.postGuildAnnouncement?.errorCode, 'announcementTitleTooLong');
  const longBody = await post(adminA, 'alpha', 'STANDARD', '标题', '文'.repeat(2001));
  eq('正文 2001 字 -> announcementBodyTooLong', longBody.data?.postGuildAnnouncement?.errorCode, 'announcementBodyTooLong');
  eq('形状拒绝不落库', state.announcements.length, 0);
  eq('形状拒绝不计频控', state.usage.size, 0);
}

/* ================= F9: a standard post ================= */
let firstId;
{
  const r = await post(adminA, 'alpha', 'STANDARD', '  周六活动安排  ', '  本周六晚八点集合。  ');
  eq('管理员发布 -> ok', r.data?.postGuildAnnouncement?.ok, true);
  eq('落库一行', state.announcements.length, 1);
  const row = state.announcements[0];
  firstId = row.id;
  eq('标题/正文已去空白', [row.title, row.body], ['周六活动安排', '本周六晚八点集合。']);
  eq('kind 落 standard', row.kind, 'standard');
  eq('作者快照', [row.author_discord_id, row.author_name], ['A1', '管理员甲']);
  check('created_at 为秒级时间戳', Math.abs(row.created_at - Math.floor(Date.now() / 1000)) < 60, String(row.created_at));
  eq('作者自动已读一行回执', state.reads.map((x) => [x.announcement_id, x.discord_id]), [[firstId, 'A1']]);
  const usageKeys = [...state.usage.keys()];
  check('频控计入 guild:alpha 的 guild_announcements', usageKeys.some((k) => k.startsWith('guild:alpha|guild_announcements|')), usageKeys.join(','));
  eq('普通计数 = 1', [...state.usage.values()].reduce((a, b) => a + b, 0), 1);

  await Promise.all(pending);
  eq('推送恰好发送一次', pushCalls.length, 1);
  const msgs = pushCalls[0] || [];
  eq('推送只达有令牌的成员 (作者除外, M2 无令牌)', msgs.map((m) => m.to), ['ExponentPushToken[member-one]']);
  eq('推送标题为百业名 + 标题', msgs[0]?.title, '甲百业 · 周六活动安排');
  eq('推送 data 带公告 id', msgs[0]?.data?.announcementId, String(firstId));
}

/* ================= member surface + F10 ================= */
const memberPageQ = `query($slug: String!) { viewer { guild(slug: $slug) { __typename
  ... on Guild { homeTabAnnouncementsLabel announcements {
    title emptyText canPost standardRemaining announcements {
      id kind urgent urgentLabel kindLabel title authorText viewerHasRead readCount receipts { discordId } } } }
  ... on GuildReadOnly { announcements { title } }
  ... on GuildLocked { slug } } } }`;
{
  const page = await gql(memberPageQ, { user: member1, variables: { slug: 'alpha' } });
  const ann = page.data?.viewer?.guild?.announcements;
  eq('成员面类型为 Guild', page.data?.viewer?.guild?.__typename, 'Guild');
  eq('成员面页签文案由后端下发', page.data?.viewer?.guild?.homeTabAnnouncementsLabel, '公告');
  eq('成员面标题文案', ann?.title, '百业公告');
  eq('成员变体 canPost=false', ann?.canPost, false);
  eq('成员变体无余量', ann?.standardRemaining, null);
  const item = (ann?.announcements || [])[0] || {};
  eq('成员看到公告', item.title, '周六活动安排');
  eq('普通公告 urgent=false 且无紧急标记文案', [item.urgent, item.urgentLabel], [false, null]);
  eq('普通公告类型文案', item.kindLabel, '公告');
  eq('作者组合文案', item.authorText, '管理员甲 发布');
  eq('成员一未读', item.viewerHasRead, false);
  eq('成员变体不下发已读数', item.readCount, null);
  eq('成员变体不下发回执名单', item.receipts, null);

  const locked = await gql(memberPageQ, { user: outsider, variables: { slug: 'alpha' } });
  eq('非成员 -> GuildLocked', locked.data?.viewer?.guild?.__typename, 'GuildLocked');
  check('Locked 不带公告字段', !('announcements' in (locked.data?.viewer?.guild || {})), JSON.stringify(locked.data?.viewer?.guild));

  const anonMark = await mark(null, 'alpha', firstId);
  eq('匿名标已读 -> loginRequired', anonMark.data?.markGuildAnnouncementRead?.errorCode, 'loginRequired');
  const outsiderMark = await mark(outsider, 'alpha', firstId);
  eq('非成员标已读 -> memberOnly', outsiderMark.data?.markGuildAnnouncementRead?.errorCode, 'memberOnly');
  const foreignMark = await mark(adminB, 'beta', firstId);
  eq('跨百业 id 标已读 -> announcementNotFound', foreignMark.data?.markGuildAnnouncementRead?.errorCode, 'announcementNotFound');
  eq('拒绝不产生回执', state.reads.length, 1);

  const m1 = await mark(member1, 'alpha', firstId);
  eq('成员标已读 -> ok', m1.data?.markGuildAnnouncementRead?.ok, true);
  eq('返回本人已读态 true', m1.data?.markGuildAnnouncementRead?.announcement?.viewerHasRead, true);
  eq('回执落一行', state.reads.filter((x) => x.discord_id === 'M1').length, 1);
  const firstReadAt = state.reads.find((x) => x.discord_id === 'M1').read_at;
  const again = await mark(member1, 'alpha', firstId);
  eq('重复标已读仍 ok (幂等)', again.data?.markGuildAnnouncementRead?.ok, true);
  eq('重复标已读不新增行', state.reads.filter((x) => x.discord_id === 'M1').length, 1);
  eq('首次已读时刻不变', state.reads.find((x) => x.discord_id === 'M1').read_at, firstReadAt);

  const page2 = await gql(memberPageQ, { user: member1, variables: { slug: 'alpha' } });
  eq('标后成员面显示本人已读', page2.data?.viewer?.guild?.announcements?.announcements?.[0]?.viewerHasRead, true);
  const page3 = await gql(memberPageQ, { user: member2, variables: { slug: 'alpha' } });
  eq('成员二仍未读 (回执按人隔离)', page3.data?.viewer?.guild?.announcements?.announcements?.[0]?.viewerHasRead, false);
}

/* ================= admin receipts (F10 admin face) ================= */
const adminPageQ = `query($slug: String!) { viewer { guildAdmin(slug: $slug) { __typename
  ... on GuildAdmin { adminTabAnnouncementsLabel announcements {
    canPost standardRemaining urgentRemaining dailyLimitText announcements {
      id readCount memberCount readCountText receipts { discordId displayName read readAtText } } } } } } }`;
{
  const page = await gql(adminPageQ, { user: adminA, variables: { slug: 'alpha' } });
  const ann = page.data?.viewer?.guildAdmin?.announcements;
  eq('管理面页签文案', page.data?.viewer?.guildAdmin?.adminTabAnnouncementsLabel, '公告广播');
  eq('管理变体 canPost=true', ann?.canPost, true);
  eq('普通余量 5-1=4', ann?.standardRemaining, 4);
  eq('紧急余量 2', ann?.urgentRemaining, 2);
  eq('余量组合文案', ann?.dailyLimitText, '今日还可发布 4 条');
  const item = (ann?.announcements || [])[0] || {};
  eq('已读数 = 作者 + 成员一', item.readCount, 2);
  eq('成员总数 = 名册 3', item.memberCount, 3);
  eq('已读组合文案', item.readCountText, '已读 2 / 3');
  const byId = Object.fromEntries((item.receipts || []).map((r) => [r.discordId, r]));
  eq('回执: 管理员甲已读且有时刻', [byId.A1?.read, typeof byId.A1?.readAtText], [true, 'string']);
  eq('回执: 成员一已读', byId.M1?.read, true);
  eq('回执: 成员二未读且无时刻', [byId.M2?.read, byId.M2?.readAtText], [false, null]);
  eq('回执显示名走名册口径 (昵称回退全局名)', byId.M2?.displayName, '成员二');

  const lockedAdmin = await gql(adminPageQ, { user: member1, variables: { slug: 'alpha' } });
  eq('普通成员看管理面 -> GuildAdminLocked', lockedAdmin.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
  check('Locked 管理面不带公告字段', !('announcements' in (lockedAdmin.data?.viewer?.guildAdmin || {})));
}

/* ================= F18: urgent calls + separate stricter limit ================= */
{
  const u1 = await post(adminA, 'alpha', 'URGENT', '今晚集合', '临时集合，看到请上线。');
  eq('紧急呼叫发布 -> ok', u1.data?.postGuildAnnouncement?.ok, true);
  eq('紧急落库 kind', state.announcements.at(-1).kind, 'urgent');
  await Promise.all(pending);
  const msgs = pushCalls.at(-1) || [];
  eq('紧急推送标题带服务端紧急标记', msgs[0]?.title, '甲百业 · 紧急集合');
  eq('紧急推送正文为呼叫标题', msgs[0]?.body, '今晚集合');

  const page = await gql(memberPageQ, { user: member2, variables: { slug: 'alpha' } });
  const urgentItem = (page.data?.viewer?.guild?.announcements?.announcements || [])[0] || {};
  eq('成员面最新为紧急呼叫', urgentItem.kind, 'URGENT');
  eq('紧急标记 urgent=true', urgentItem.urgent, true);
  eq('紧急标记文案由后端下发', urgentItem.urgentLabel, '紧急集合');
  eq('紧急类型文案', urgentItem.kindLabel, '紧急集合');

  const u2 = await post(adminA, 'alpha', 'URGENT', '再次集合', '第二次。');
  eq('第 2 次紧急 -> ok', u2.data?.postGuildAnnouncement?.ok, true);
  const u3 = await post(adminA, 'alpha', 'URGENT', '第三次', '第三次。');
  eq('第 3 次紧急 -> urgentCallDailyLimit', u3.data?.postGuildAnnouncement?.errorCode, 'urgentCallDailyLimit');
  eq('紧急上限文案带数值', u3.data?.postGuildAnnouncement?.error, '今天的紧急集合呼叫已达上限（每天 2 次），明天再试');
  eq('紧急拒绝不落库', state.announcements.filter((r) => r.kind === 'urgent').length, 2);
}

/* ================= standard daily limit (5/day) + guild isolation ================= */
{
  // alpha already used 1 standard today; 4 more fit, the 6th is refused.
  for (let i = 2; i <= 5; i++) {
    const r = await post(adminA, 'alpha', 'STANDARD', `公告 ${i}`, '正文');
    eq(`第 ${i} 条普通公告 -> ok`, r.data?.postGuildAnnouncement?.ok, true);
  }
  const sixth = await post(adminA, 'alpha', 'STANDARD', '第六条', '正文');
  eq('第 6 条普通公告 -> announcementDailyLimit', sixth.data?.postGuildAnnouncement?.errorCode, 'announcementDailyLimit');
  eq('普通上限文案带数值', sixth.data?.postGuildAnnouncement?.error, '今天的公告已达上限（每天 5 条），明天再发');
  eq('普通公告落库恰 5 条', state.announcements.filter((r) => r.tenant === 'alpha' && r.kind === 'standard').length, 5);

  const beta = await post(adminB, 'beta', 'STANDARD', '乙百业公告', '正文');
  eq('另一百业频控独立 -> ok', beta.data?.postGuildAnnouncement?.ok, true);
  eq('乙百业落库一行', state.announcements.filter((r) => r.tenant === 'beta').length, 1);
}

/* ================= delete ================= */
{
  const memberDel = await del(member1, 'alpha', firstId);
  eq('成员删除 -> adminOnly', memberDel.data?.deleteGuildAnnouncement?.errorCode, 'adminOnly');
  const crossDel = await del(adminB, 'alpha', firstId);
  eq('他百业管理员删除 -> adminOnly', crossDel.data?.deleteGuildAnnouncement?.errorCode, 'adminOnly');
  const ok = await del(adminA, 'alpha', firstId);
  eq('管理员删除 -> ok', ok.data?.deleteGuildAnnouncement?.ok, true);
  check('公告行已删', !state.announcements.some((r) => r.id === firstId));
  eq('其回执一并删除', state.reads.filter((r) => r.announcement_id === firstId).length, 0);
  const again = await del(adminA, 'alpha', firstId);
  eq('再删 -> announcementNotFound', again.data?.deleteGuildAnnouncement?.errorCode, 'announcementNotFound');
}

globalThis.fetch = realFetch;
console.log(`\n== announcements harness: ${pass} pass, ${fail} fail ==`);
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
