// Activity lottery acceptance (F21):
//  - draw (pure): weighted picks are deterministic under an injected
//    rand, and nobody wins twice — checked over repeated full draws;
//  - GraphQL admin surface: the tool lives only on GuildAdmin (Locked
//    for member / other guild's admin / anonymous); lottery creation
//    freezes the list from either source (a car's seated participants,
//    deduped by Discord id, or hand-picked roster members),
//    validation codes are stable, the draw persists distinct winners
//    + the drawn state, a second draw is refused, and guild B never
//    sees guild A's lotteries.
// Real yoga + real resolvers + FakeDB routed by SQL shape (templates
// pattern).
import { yoga } from '../src/graphql.ts';
import { drawWinners } from '../src/domains/groupings/lotteries.ts';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}
function eq(name, got, want) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

function toRawRows(sqlText, rows) {
  if (!rows || !rows.length) return [];
  let cols = null;
  const m = /select\s+([\s\S]+?)\s+from\s/i.exec(sqlText);
  if (m) {
    const parts = m[1].split(',').map((x) => x.trim()).filter(Boolean);
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

/* ================= pure units: the draw ================= */
{
  const pool = [
    { discord_id: 'A', display_name: '甲', weight: 1 },
    { discord_id: 'B', display_name: '乙', weight: 5 },
    { discord_id: 'C', display_name: '丙', weight: 1 },
  ];
  eq('rand=0 draws the first candidate', drawWinners(pool, 1, () => 0).map((w) => w.discord_id), ['A']);
  eq('rand near 1 draws the last candidate', drawWinners(pool, 1, () => 0.999999).map((w) => w.discord_id), ['C']);
  eq('rand=0 twice draws A then B (pool shrinks)', drawWinners(pool, 2, () => 0).map((w) => w.discord_id), ['A', 'B']);
  eq('count above pool size returns the whole pool', drawWinners(pool, 9, () => 0).length, 3);
  let noRepeat = true;
  for (let i = 0; i < 200; i++) {
    const w = drawWinners(pool, 3, Math.random);
    if (new Set(w.map((x) => x.discord_id)).size !== 3) noRepeat = false;
  }
  check('200 full draws never repeat a winner', noRepeat);
  // Weight actually steers the draw: with weights 100 vs 1, a ticket
  // in the first 99% of the range must land on the heavy candidate.
  const heavy = [
    { discord_id: 'H', display_name: '重', weight: 100 },
    { discord_id: 'L', display_name: '轻', weight: 1 },
  ];
  eq('heavy weight wins a mid-range ticket', drawWinners(heavy, 1, () => 0.5).map((w) => w.discord_id), ['H']);
  eq('the last 1% ticket reaches the light candidate', drawWinners(heavy, 1, () => 0.999).map((w) => w.discord_id), ['L']);
}

/* ================= FakeDB ================= */
const DGID_A = '111111111111111111';
const DGID_B = '222222222222222222';
function makeDb(fx = {}) {
  const tables = {
    tenants: (fx.tenants || []).map((t) => ({ ...t })),
    settings: new Map(fx.settings || []),
    users: new Map(fx.users || []),
    events: (fx.events || []).map((e) => ({ ...e })),
    signups: (fx.signups || []).map((x) => ({ ...x })),
    guildMembers: (fx.guildMembers || []).map((m) => ({ ...m })),
    lotteries: [],
    entries: [],
    winners: [],
  };
  let nextId = 9000;
  const tableOf = {
    lottery_entries: tables.entries, lottery_winners: tables.winners,
    events: tables.events, signups: tables.signups, guild_members: tables.guildMembers,
  };
  function norm(sql) {
    return sql.replace(/"/g, '')
      .replace(/\b(tenants|settings|users|events|signups|guild_members|lotteries|lottery_entries|lottery_winners)\./g, '')
      .replace(/\s+/g, ' ');
  }
  function parseCols(list) { return list.split(',').map((c) => c.trim().split('.').pop()); }
  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    let m = /^INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)/i.exec(sql);
    if (m) {
      const [, table, colList] = m;
      const cols = parseCols(colList);
      const row = {};
      cols.forEach((c, i) => { row[c] = b[i]; });
      if (/ON CONFLICT/i.test(sql) && table === 'settings') {
        tables.settings.set(`${row.tenant}|${row.key}`, row.value);
        return { meta: { changes: 1 } };
      }
      if (table === 'lottery_entries' && tables.entries.some((e) => e.lottery_id === row.lottery_id && e.discord_id === row.discord_id)) {
        throw new Error('UNIQUE constraint failed: lottery_entries_member_unique');
      }
      if (table === 'lottery_winners' && tables.winners.some((e) => e.lottery_id === row.lottery_id && e.discord_id === row.discord_id)) {
        throw new Error('UNIQUE constraint failed: lottery_winners_member_unique');
      }
      row.id = nextId++;
      (tableOf[table] || tables.lotteries).push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    m = /^UPDATE (\w+) SET (.+?) WHERE (.+)$/i.exec(sql);
    if (m) {
      const [, table, setList] = m;
      // SET assignments mix binds (?) with inlined literals ('drawn'):
      // consume binds in order, decode literals in place.
      const sets = {};
      let bi = 0;
      for (const part of setList.split(',')) {
        const eqAt = part.indexOf('=');
        const c = part.slice(0, eqAt).trim().split('.').pop();
        const rhs = part.slice(eqAt + 1).trim();
        if (rhs === '?') sets[c] = b[bi++];
        else if (/^'[^']*'$/.test(rhs)) sets[c] = rhs.slice(1, -1);
        else if (/^-?\d+$/.test(rhs)) sets[c] = Number(rhs);
        else sets[c] = null;
      }
      const wb = b.slice(bi);
      let rows = [];
if (table === 'lotteries') rows = tables.lotteries.filter((l) => l.id === Number(wb[0]));
      for (const r of rows) Object.assign(r, sets);
      return { meta: { changes: rows.length } };
    }
    if (/\b(CREATE TABLE|CREATE INDEX|ALTER TABLE|PRAGMA)\b/i.test(sql)) return kind === 'run' ? { meta: { changes: 0 } } : (kind === 'first' ? null : { results: [] });
    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });
    if (/FROM tenants WHERE slug/i.test(sql)) return first(tables.tenants.find((t) => t.slug === b[0]));
    if (/FROM settings WHERE tenant = \? AND key = \?/i.test(sql)) {
      const v = tables.settings.get(`${b[0]}|${b[1]}`);
      return first(v === undefined ? null : { value: v });
    }
    if (/FROM settings/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/SELECT guilds_json FROM users/i.test(sql)) {
      const v = tables.users.get(String(b[0]));
      return first(v === undefined ? null : { guilds_json: v });
    }
    if (/FROM users/i.test(sql)) return first(null);
    if (/FROM user_guild_nicks/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/SELECT \* FROM events WHERE id = \? AND tenant = \?/i.test(sql)) {
      return first(tables.events.find((e) => e.id === Number(b[0]) && e.tenant === b[1]));
    }
    if (/SELECT \* FROM events WHERE id = \?/i.test(sql)) {
      return first(tables.events.find((e) => e.id === Number(b[0])));
    }
    if (/FROM signups WHERE event_id = \?/i.test(sql)) {
      return all(tables.signups.filter((x) => x.event_id === Number(b[0])).sort((x, y) => x.id - y.id));
    }
    if (/FROM guild_members WHERE tenant = \?/i.test(sql)) {
      let rows = tables.guildMembers.filter((x) => x.tenant === b[0]);
      if (/discord_id = \?/i.test(sql) && b.length > 1) rows = rows.filter((x) => x.discord_id === String(b[1]));
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    if (/FROM lotteries WHERE tenant = \?/i.test(sql)) {
      return all(tables.lotteries.filter((l) => l.tenant === b[0]).sort((x, y) => y.id - x.id));
    }
    if (/FROM lotteries WHERE id = \? AND tenant = \?/i.test(sql)) {
      return first(tables.lotteries.find((l) => l.id === Number(b[0]) && l.tenant === b[1]));
    }
    if (/FROM lottery_entries WHERE lottery_id = \?/i.test(sql)) {
      return all(tables.entries.filter((e) => e.lottery_id === Number(b[0])).sort((x, y) => x.id - y.id));
    }
    if (/FROM lottery_winners WHERE lottery_id = \?/i.test(sql)) {
      return all(tables.winners.filter((e) => e.lottery_id === Number(b[0])).sort((x, y) => x.id - y.id));
    }
    return kind === 'first' ? null : (kind === 'all' ? { results: [] } : { meta: { changes: 0 } });
  }
  function stmt(rawSql) {
    const q = {
      _binds: [], bind(...a) { this._binds = a; return this; },
      async raw() { const res = await this.all(); return toRawRows(rawSql, (res && res.results) || []); },
      async first() { return route('first', rawSql, this._binds); },
      async all() { return route('all', rawSql, this._binds); },
      async run() { return route('run', rawSql, this._binds); },
    };
    return q;
  }
  const db = {
    prepare: (sql) => stmt(sql),
    async batch(stmts) { const out = []; for (const s of stmts) out.push(await s.run()); return out; },
  };
  return { db, tables };
}

/* ---------------- fixtures ---------------- */
const serversJson = (rows) => JSON.stringify(rows);
const srv = (id, permissions = '0', owner = false) => ({ id, name: '测试服', icon: '', permissions, owner });
const ADMIN = { discordId: 'UA', name: '管理员甲', guilds: [DGID_A] };
const MEMBER = { discordId: 'UB', name: '成员', guilds: [DGID_A] };
const ADMIN_B = { discordId: 'UD', name: '乙业管理员', guilds: [DGID_B] };

const START_501 = Date.UTC(2026, 9, 30, 12, 0, 0) / 1000;
const { db, tables } = makeDb({
  tenants: [
    { slug: 'acttest', guild_name: '活动测试百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', discord_webhook: '', created_at: '2026-01-01 00:00:00' },
    { slug: 'othertest', guild_name: '乙百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', discord_webhook: '', created_at: '2026-01-01 00:00:00' },
  ],
  settings: [
    ['acttest|discord_guild_id', DGID_A],
    ['othertest|discord_guild_id', DGID_B],
    ['|game_version', 'intl-v2.3'],
  ],
  users: [
    ['UA', serversJson([srv(DGID_A, '32')])],
    ['UB', serversJson([srv(DGID_A)])],
    ['UD', serversJson([srv(DGID_B, '32')])],
  ],
  guildMembers: [
    { tenant: 'acttest', discord_id: 'M1', nick: '名册甲', global_name: '甲' },
    { tenant: 'acttest', discord_id: 'M2', nick: '名册乙', global_name: '乙' },
    { tenant: 'acttest', discord_id: 'M3', nick: '', global_name: '丙全名' },
    { tenant: 'othertest', discord_id: 'M9', nick: '乙业成员', global_name: '玖' },
  ],
  events: [
    { id: 501, tenant: 'acttest', title: '万圣节活动车', type: 'activity', description: '带好药', starts_at: '', starts_at_utc: START_501, meet_info: '语音频道 2', max_slots: 10, status: 'open', origin: 'member', created_by: '', manage_code: '', dungeon: '', creator_discord_id: 'UB', reminder_sent_at: null, reminder_error: null },
    { id: 502, tenant: 'acttest', title: '未定时间车', type: 'activity', description: '', starts_at: '', starts_at_utc: null, meet_info: '', max_slots: 10, status: 'open', origin: 'member', created_by: '', manage_code: '', dungeon: '', creator_discord_id: 'UB', reminder_sent_at: null, reminder_error: null },
    { id: 503, tenant: 'acttest', title: '草稿车', type: 'activity', description: '', starts_at: '', starts_at_utc: START_501, meet_info: '', max_slots: 10, status: 'draft', origin: 'admin', created_by: '', manage_code: '', dungeon: '', creator_discord_id: 'UA', reminder_sent_at: null, reminder_error: null },
    { id: 504, tenant: 'othertest', title: '乙业的车', type: 'activity', description: '', starts_at: '', starts_at_utc: START_501, meet_info: '', max_slots: 10, status: 'open', origin: 'member', created_by: '', manage_code: '', dungeon: '', creator_discord_id: 'UD', reminder_sent_at: null, reminder_error: null },
  ],
  signups: [
    { id: 1, event_id: 501, nickname: '座位甲', uid: 'q1', role: '输出', weapon: '', contact: '', note: '', team_name: '', members: '', created_at: '2026-10-01 00:00:00', discord_id: 'M1', ready_at: null },
    { id: 2, event_id: 501, nickname: '座位乙', uid: 'q2', role: '输出', weapon: '', contact: '', note: '', team_name: '', members: '', created_at: '2026-10-01 00:00:00', discord_id: 'M2', ready_at: null },
    { id: 3, event_id: 501, nickname: '座位甲二号位', uid: 'q3', role: '输出', weapon: '', contact: '', note: '', team_name: '', members: '', created_at: '2026-10-01 00:00:00', discord_id: 'M1', ready_at: null },
    { id: 4, event_id: 501, nickname: '无身份座位', uid: 'q4', role: '输出', weapon: '', contact: '', note: '', team_name: '', members: '', created_at: '2026-10-01 00:00:00', discord_id: null, ready_at: null },
  ],
});
const env = { DB: db, ASSETS: { fetch: async () => new Response('not found', { status: 404 }) } };

async function gql(query, { user = null, variables } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

/* ================= admin surface gates ================= */
const toolsQ = `{ viewer { guildAdmin(slug: "acttest") { __typename
  ... on GuildAdmin { slug adminTabToolsLabel
    lotteries { id title prize source sourceEventId sourceEventTitle winnerCount status entryCountText createdAtText drawnAtText
      entries { discordId displayName weight } winners { discordId displayName weight } }
    lotteryRoster { discordId displayName } }
  ... on GuildAdminLocked { slug adminLockedTitle } } } }`;

let r = await gql(toolsQ, { user: null });
eq('匿名 -> GuildAdminLocked (无工具面)', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
r = await gql(toolsQ, { user: MEMBER });
eq('普通成员 -> GuildAdminLocked', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
r = await gql(toolsQ, { user: ADMIN_B });
eq('乙业管理员看甲业 -> GuildAdminLocked (不串权)', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');

r = await gql(toolsQ, { user: ADMIN });
const ga = r.data?.viewer?.guildAdmin;
eq('管理员 -> GuildAdmin', ga?.__typename, 'GuildAdmin');
eq('tools 页签文案由后端下发', ga?.adminTabToolsLabel, '活动工具');
eq('名册候选 = 本百业成员', (ga?.lotteryRoster || []).map((m) => m.discordId), ['M1', 'M2', 'M3']);
eq('名册名回退全局名', ga?.lotteryRoster?.[2]?.displayName, '丙全名');
eq('初始无抽奖', ga?.lotteries, []);
/* ================= lottery: members source ================= */
const createMut = `mutation($slug: String!, $input: CreateLotteryInput!) { createLottery(slug: $slug, input: $input) { ok error errorCode id } }`;
r = await gql(createMut, { user: MEMBER, variables: { slug: 'acttest', input: { title: 'x', source: 'MEMBERS', winnerCount: 1, entries: [{ discordId: 'M1', weight: 1 }] } } });
eq('成员建抽奖被拒 (adminOnly)', r.data?.createLottery?.errorCode, 'adminOnly');
r = await gql(createMut, { user: ADMIN, variables: { slug: 'acttest', input: { title: '  ', source: 'MEMBERS', winnerCount: 1, entries: [{ discordId: 'M1', weight: 1 }] } } });
eq('空标题 -> lotteryTitleRequired', r.data?.createLottery?.errorCode, 'lotteryTitleRequired');
r = await gql(createMut, { user: ADMIN, variables: { slug: 'acttest', input: { title: 'x', source: 'MEMBERS', winnerCount: 1, entries: [] } } });
eq('空名单 -> lotteryEntriesEmpty', r.data?.createLottery?.errorCode, 'lotteryEntriesEmpty');
r = await gql(createMut, { user: ADMIN, variables: { slug: 'acttest', input: { title: 'x', source: 'MEMBERS', winnerCount: 1, entries: [{ discordId: 'M9', weight: 1 }] } } });
eq('选了乙业成员 -> lotteryMemberNotInGuild', r.data?.createLottery?.errorCode, 'lotteryMemberNotInGuild');
r = await gql(createMut, { user: ADMIN, variables: { slug: 'acttest', input: { title: 'x', source: 'MEMBERS', winnerCount: 1, entries: [{ discordId: 'M1', weight: 0 }] } } });
eq('权重 0 -> lotteryWeightInvalid', r.data?.createLottery?.errorCode, 'lotteryWeightInvalid');
r = await gql(createMut, { user: ADMIN, variables: { slug: 'acttest', input: { title: 'x', source: 'MEMBERS', winnerCount: 5, entries: [{ discordId: 'M1', weight: 1 }] } } });
eq('中奖人数超名单 -> lotteryWinnerCountInvalid', r.data?.createLottery?.errorCode, 'lotteryWinnerCountInvalid');
eq('失败路径零落库', tables.lotteries.length, 0);

r = await gql(createMut, { user: ADMIN, variables: { slug: 'acttest', input: {
  title: '周年庆抽奖', prize: '坐骑一只', source: 'MEMBERS', winnerCount: 2,
  entries: [{ discordId: 'M1', weight: 3 }, { discordId: 'M2', weight: 1 }, { discordId: 'M3', weight: 2 }],
} } });
eq('手选名单建抽奖 ok', r.data?.createLottery?.ok, true);
const lot1 = r.data?.createLottery?.id;
check('建抽奖返回 id', !!lot1);
r = await gql(toolsQ, { user: ADMIN });
const l1 = r.data?.viewer?.guildAdmin?.lotteries?.find((x) => x.id === lot1);
eq('抽奖回读: 标题/奖池', [l1?.title, l1?.prize], ['周年庆抽奖', '坐骑一只']);
eq('抽奖回读: 来源 MEMBERS', l1?.source, 'MEMBERS');
eq('抽奖回读: 状态 OPEN', l1?.status, 'OPEN');
eq('抽奖回读: 名单定格 (名走名册, 权重原样)', (l1?.entries || []).map((e) => [e.discordId, e.displayName, e.weight]),
  [['M1', '名册甲', 3], ['M2', '名册乙', 1], ['M3', '丙全名', 2]]);
eq('抽奖回读: 人数文案后端拼', l1?.entryCountText, '3 人参与');
eq('抽奖回读: 未开奖 drawnAtText 为 null', l1?.drawnAtText, null);
eq('抽奖回读: winners 空', l1?.winners, []);

/* ================= lottery: grouping source ================= */
r = await gql(createMut, { user: ADMIN, variables: { slug: 'acttest', input: {
  title: '车队抽奖', prize: '', source: 'GROUPING', sourceEventId: '504', winnerCount: 1, uniformWeight: 1,
} } });
eq('拿乙业的车当名单源 -> groupingNotFound', r.data?.createLottery?.errorCode, 'groupingNotFound');
r = await gql(createMut, { user: ADMIN, variables: { slug: 'acttest', input: {
  title: '车队抽奖', prize: '称号一个', source: 'GROUPING', sourceEventId: '501', winnerCount: 2, uniformWeight: 2,
} } });
eq('车队名单建抽奖 ok', r.data?.createLottery?.ok, true);
const lot2 = r.data?.createLottery?.id;
r = await gql(toolsQ, { user: ADMIN });
const l2 = r.data?.viewer?.guildAdmin?.lotteries?.find((x) => x.id === lot2);
eq('车队抽奖: 来源回读', [l2?.source, l2?.sourceEventId, l2?.sourceEventTitle], ['GROUPING', '501', '万圣节活动车']);
eq('车队抽奖: 名单按 Discord id 去重 + 无身份座位不入 + 统一权重', (l2?.entries || []).map((e) => [e.discordId, e.displayName, e.weight]),
  [['M1', '座位甲', 2], ['M2', '座位乙', 2]]);

/* ================= the draw ================= */
const drawMut = `mutation($slug: String!, $id: ID!) { drawLottery(slug: $slug, lotteryId: $id) { ok error errorCode id } }`;
r = await gql(drawMut, { user: MEMBER, variables: { slug: 'acttest', id: lot1 } });
eq('成员开奖被拒 (adminOnly)', r.data?.drawLottery?.errorCode, 'adminOnly');
r = await gql(drawMut, { user: ADMIN_B, variables: { slug: 'acttest', id: lot1 } });
eq('乙业管理员开甲业奖被拒 (adminOnly)', r.data?.drawLottery?.errorCode, 'adminOnly');
r = await gql(drawMut, { user: ADMIN, variables: { slug: 'acttest', id: '424242' } });
eq('不存在的抽奖 -> lotteryNotFound', r.data?.drawLottery?.errorCode, 'lotteryNotFound');
r = await gql(drawMut, { user: ADMIN, variables: { slug: 'acttest', id: lot1 } });
eq('开奖 ok', r.data?.drawLottery?.ok, true);
r = await gql(toolsQ, { user: ADMIN });
const l1d = r.data?.viewer?.guildAdmin?.lotteries?.find((x) => x.id === lot1);
eq('开奖后状态 DRAWN', l1d?.status, 'DRAWN');
check('开奖后 drawnAtText 有值', typeof l1d?.drawnAtText === 'string' && l1d.drawnAtText.length > 0, l1d?.drawnAtText);
eq('中奖人数 = 设定人数', l1d?.winners?.length, 2);
eq('中奖不重复', new Set((l1d?.winners || []).map((w) => w.discordId)).size, 2);
check('中奖者都在名单内', (l1d?.winners || []).every((w) => ['M1', 'M2', 'M3'].includes(w.discordId)));
eq('中奖行留痕 (winners 表)', tables.winners.filter((w) => w.lottery_id === Number(lot1)).length, 2);
eq('中奖者权重回读 = 定格权重', (l1d?.winners || []).every((w) => {
  const e = (l1d?.entries || []).find((x) => x.discordId === w.discordId);
  return e && e.weight === w.weight;
}), true);
r = await gql(drawMut, { user: ADMIN, variables: { slug: 'acttest', id: lot1 } });
eq('重复开奖 -> lotteryAlreadyDrawn', r.data?.drawLottery?.errorCode, 'lotteryAlreadyDrawn');
eq('重复开奖不新增中奖行', tables.winners.filter((w) => w.lottery_id === Number(lot1)).length, 2);

/* cross-guild visibility: B's admin surface carries only B's lotteries */
const toolsQB = toolsQ.replaceAll('acttest', 'othertest');
r = await gql(toolsQB, { user: ADMIN_B });
eq('乙业面只见乙业抽奖 (空)', r.data?.viewer?.guildAdmin?.lotteries, []);

console.log(`\n== activitytools harness: ${pass} passed, ${fail} failed ==`);
if (fails.length) { console.log('FAILS:\n' + fails.map((f) => ' - ' + f).join('\n')); process.exit(1); }
