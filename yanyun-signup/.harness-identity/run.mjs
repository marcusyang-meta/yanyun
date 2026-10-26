// 报名身份收口验收 (2026-10-25 用户裁决三条):
//  1) 自报名锁名: 服务端定名 (Discord 服务器昵称 -> 全局名 -> 会话名),
//     客户端传假名被覆盖; 座位无条件落本人 discord_id 戳。
//  2) 代报名选人: forDiscordId 必须在本百业名册 (guild_members) 内,
//     落座名 = 名册昵称回退全局名, 戳 = 被代报者; 不在册被拒。
//     名册读取面 memberRoster 只在完整 Guild 类型上 (响应类型即权限):
//     GuildReadOnly / GuildLocked 上查此字段是 schema 校验错误。
//  3) 无车头车补登记迁移: 1 号位座位戳 / 名册唯一昵称匹配才补,
//     歧义/空座/无匹配跳过并审计, 已有车头与官方车不碰, 幂等,
//     非生产 host (preview/localhost) 绝不触发。
// 真实 yoga + graphql.js resolver + creatorbackfill.js 真函数, FakeDB 按
// SQL 形状忠实路由 (插入/更新真落到内存表, 不是写死结果)。
import { yoga } from '../src/graphql.js';
import { typeDefs } from '../src/graphql-schema.js';
import { runCreatorBackfillOnce, maybeRunCreatorBackfill } from '../src/creatorbackfill.js';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}
function eq(name, got, want) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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
function makeDb(fx = {}) {
  const tables = {
    tenants: fx.tenants || [],
    settings: new Map(fx.settings || []),
    events: (fx.events || []).map((e) => ({ ...e })),
    signups: (fx.signups || []).map((r) => ({ ...r })),
    users: new Map(fx.users || []),           // discord_id -> username
    nicks: (fx.nicks || []).map((r) => ({ ...r })), // {discord_id, guild_id, nick}
    guildMembers: (fx.guildMembers || []).map((r) => ({ ...r })),
    audit: [],
  };
  let nextSignupId = 1000;
  const unknownSql = new Set();
  function stmt(sql) {
    // 数据层 (Drizzle) SQL 规范化: 去引号 + 去 settings. 限定前缀 (仅路由匹配)
    sql = sql.replace(/"/g, '').replace(/settings\./g, '');
    const q = {
      _binds: [],
      bind(...a) { this._binds = a; return this; },
      async raw() { const res = await this.all(); return toRawRows(sql, (res && res.results) || []); },
      async first() {
        const b = this._binds;
        if (/FROM tenants WHERE slug/.test(sql)) return tables.tenants.find((t) => t.slug === b[0]) || null;
        if (/FROM settings/.test(sql)) {
          // 两种形状: tenant/key 双参绑定; 或 tenant = '' 字面量只绑 key
          const k = /tenant = ''/.test(sql) ? `|${b[0]}` : `${b[0]}|${b[1]}`;
          const v = tables.settings.get(k);
          return v === undefined ? null : { value: v };
        }
        if (/SELECT \* FROM events WHERE id = \?/.test(sql)) return tables.events.find((e) => e.id === Number(b[0])) || null;
        if (/FROM user_guild_nicks/.test(sql)) {
          const r = tables.nicks.find((n) => n.discord_id === String(b[0]) && n.guild_id === String(b[1]));
          return r ? { nick: r.nick } : null;
        }
        if (/SELECT username FROM users/.test(sql)) {
          const u = tables.users.get(String(b[0]));
          return u === undefined ? null : { username: u };
        }
        if (/FROM guild_members/.test(sql) && /discord_id = \?/.test(sql)) {
          return tables.guildMembers.find((m) => m.tenant === b[0] && m.discord_id === String(b[1])) || null;
        }
        if (/FROM signups/.test(sql) && /LIMIT 1/.test(sql)) {
          const rows = tables.signups.filter((r) => r.event_id === Number(b[0])).sort((a, c) => a.id - c.id);
          return rows[0] || null;
        }
        if (/FROM signups/.test(sql) && /COUNT/.test(sql)) {
          const ev = tables.events.find((e) => e.id === Number(b[0]));
          const rows = tables.signups.filter((r) => r.event_id === Number(b[0]));
          return { c: rows.length, h: rows.filter((r) => r.role === '奶' || r.role === '治疗').length, m: ev ? ev.max_slots : 0 };
        }
        if (/CREATE|ALTER|PRAGMA/.test(sql)) return null;
        unknownSql.add('first: ' + sql.slice(0, 90));
        return null;
      },
      async all() {
        const b = this._binds;
        if (/FROM settings/.test(sql)) {
          // 数据层经 .all() 通道读 settings (drizzle db.get/all): 点查与按 key 扫描
          if (/tenant = \?/.test(sql)) {
            const v = tables.settings.get(`${b[0]}|${b[1]}`);
            return { results: v === undefined ? [] : [{ value: v }] };
          }
          const rows = [];
          for (const [k, v] of tables.settings) {
            const [t, key] = k.split('|');
            if (key === b[0]) rows.push({ tenant: t, value: v });
          }
          return { results: rows };
        }
        if (/FROM events WHERE id = \?/.test(sql)) {
          // 数据层点查走 .all() 通道 (drizzle db.get): 形状同 first() 的按 id 分支
          const row = tables.events.find((e) => e.id === Number(b[0])) || null;
          return { results: row ? [row] : [] };
        }
        if (/FROM user_guild_nicks/.test(sql)) {
          // users repository 点查走 .all() 通道: 形状同 first() 的昵称分支
          const r = tables.nicks.find((n) => n.discord_id === String(b[0]) && n.guild_id === String(b[1]));
          return { results: r ? [{ nick: r.nick }] : [] };
        }
        if (/SELECT username FROM users/.test(sql)) {
          const u = tables.users.get(String(b[0]));
          return { results: u === undefined ? [] : [{ username: u }] };
        }
        if (/FROM events/.test(sql) && /origin = 'member'/.test(sql)) {
          return { results: tables.events.filter((e) => e.origin === 'member' && (e.creator_discord_id == null || e.creator_discord_id === '')).sort((a, c) => a.id - c.id) };
        }
        if (/FROM signups WHERE event_id/.test(sql)) {
          return { results: tables.signups.filter((r) => r.event_id === Number(b[0])).sort((a, c) => a.id - c.id) };
        }
        if (/FROM guild_members/.test(sql) && /discord_id = \?/.test(sql)) {
          // 数据层点查走 .all() 通道 (drizzle db.get): 须按 discord_id 过滤,
          // 不能落到下面的整表分支 (db.get 只取首行)。
          const r = tables.guildMembers.find((m) => m.tenant === b[0] && m.discord_id === String(b[1]));
          return { results: r ? [r] : [] };
        }
        if (/FROM guild_members WHERE tenant = \?/.test(sql)) {
          return { results: tables.guildMembers.filter((m) => m.tenant === b[0]) };
        }
        if (/FROM tenants/.test(sql)) return { results: tables.tenants };
        if (/CREATE|ALTER|PRAGMA/.test(sql)) return { results: [] };
        unknownSql.add('all: ' + sql.slice(0, 90));
        return { results: [] };
      },
      async run() {
        const b = this._binds;
        if (/CREATE|ALTER/.test(sql)) return { meta: { changes: 0 } };
        if (/INSERT INTO signups/.test(sql) && /SELECT \?/.test(sql)) {
          // join 的条件插入: 未满且 open 才落座
          const [gid, nickname, uid, role, weapon, stamp] = b;
          const ev = tables.events.find((e) => e.id === Number(gid));
          const count = tables.signups.filter((r) => r.event_id === Number(gid)).length;
          if (!ev || ev.status !== 'open' || count >= ev.max_slots) return { meta: { changes: 0 } };
          const row = { id: nextSignupId++, event_id: Number(gid), nickname, uid, role, weapon, discord_id: stamp };
          tables.signups.push(row);
          return { meta: { changes: 1, last_row_id: row.id } };
        }
        if (/INSERT INTO guild_members/.test(sql)) {
          const [tenant, discordId, nick, globalName, now] = b;
          const ex = tables.guildMembers.find((m) => m.tenant === tenant && m.discord_id === String(discordId));
          if (ex) { ex.nick = nick; ex.global_name = globalName; ex.updated_at = now; }
          else tables.guildMembers.push({ tenant, discord_id: String(discordId), nick, global_name: globalName, updated_at: now });
          return { meta: { changes: 1 } };
        }
        if (/INSERT INTO creator_backfill_log/.test(sql)) {
          tables.audit.push({ event_id: b[0], tenant: b[1], seat_nickname: b[2], resolved_discord_id: b[3], outcome: b[4], reason: b[5], created_at: b[6] });
          return { meta: { changes: 1 } };
        }
        if (/INSERT INTO settings/.test(sql)) {
          if (/VALUES\('', \?, '1'\)/.test(sql)) tables.settings.set(`|${b[0]}`, '1');
          else tables.settings.set(`${b[0]}|${b[1]}`, b[2]);
          return { meta: { changes: 1 } };
        }
        if (/UPDATE events SET creator_discord_id/.test(sql)) {
          const ev = tables.events.find((e) => e.id === Number(b[1]));
          if (ev && (ev.creator_discord_id == null || ev.creator_discord_id === '')) {
            ev.creator_discord_id = b[0];
            return { meta: { changes: 1 } };
          }
          return { meta: { changes: 0 } };
        }
        if (/^INSERT/.test(sql)) return { meta: { changes: 1, last_row_id: 999 } };
        if (/^UPDATE/.test(sql)) return { meta: { changes: 1 } };
        if (/^DELETE/.test(sql)) return { meta: { changes: 0 } };
        unknownSql.add('run: ' + sql.slice(0, 90));
        return { meta: { changes: 0 } };
      },
    };
    return q;
  }
  const db = {
    prepare: (sql) => stmt(sql),
    async batch(stmts) { const out = []; for (const s of stmts) out.push(await s.run()); return out; },
  };
  return { db, tables, unknownSql };
}

function ev(id, over = {}) {
  return {
    id, tenant: 'idtest', type: 'activity', title: '车' + id, description: '', dungeon: '',
    max_slots: 10, starts_at: '', starts_at_utc: null, status: 'open', origin: 'member',
    creator_discord_id: 'U1', created_by: '', reminder_sent_at: null, reminder_error: null,
    ...over,
  };
}

/* ---------------- schema 契约 ---------------- */
check('schema: JoinGroupingInput.forDiscordId', /input JoinGroupingInput \{[^}]*forDiscordId: ID/.test(typeDefs));
check('schema: type GuildRosterMember', typeDefs.includes('type GuildRosterMember'));
check('schema: Guild.memberRoster', /type Guild \{[^]*?memberRoster: \[GuildRosterMember!\]!/.test(typeDefs));
{
  const ro = typeDefs.slice(typeDefs.indexOf('type GuildReadOnly'), typeDefs.indexOf('type GuildLocked'));
  check('schema: GuildReadOnly 无 memberRoster', !ro.includes('memberRoster'));
  const lk = typeDefs.slice(typeDefs.indexOf('type GuildLocked'), typeDefs.indexOf('type GuildLocked') + 400);
  check('schema: GuildLocked 无 memberRoster', !lk.includes('memberRoster'));
}
for (const f of ['seatSelfTabLabel', 'seatProxyTabLabel', 'seatSelfNameHint', 'seatProxySearchPlaceholder', 'seatProxyPickRequired', 'seatProxyEmptyText']) {
  check('schema: 字段 ' + f, typeDefs.includes(f + ': String!'));
}

/* ---------------- 报名路径 (join) ---------------- */
const A = makeDb({
  tenants: [
    { slug: 'idtest', guild_name: '身份测试百业', slogan: '' },
    { slug: 'opentest', guild_name: '公开百业', slogan: '' },
  ],
  settings: [['idtest|discord_guild_id', 'G1']],
  users: [['UA', '全局A'], ['UB', '全局B']],
  nicks: [{ discord_id: 'UA', guild_id: 'G1', nick: '服昵A' }],
  guildMembers: [
    { tenant: 'idtest', discord_id: 'UC', nick: '服昵C', global_name: '全局C', updated_at: 1 },
    { tenant: 'idtest', discord_id: 'UD', nick: '', global_name: '全局D', updated_at: 1 },
  ],
  events: [ev(101), ev(102), ev(103)],
  signups: [],
});
const envA = { DB: A.db };
const userA = { discordId: 'UA', name: '全局A', guilds: ['G1'] };
const userB = { discordId: 'UB', name: '会话名B', guilds: ['G1'] };
const userC = { discordId: 'UC0', name: '会话名C', guilds: ['G1'] };
const userZ = { discordId: 'UZ', name: '路人', guilds: [] };

async function gql(query, { user = userA, variables } = {}) {
  const ctx = { env: envA, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}
const joinMut = `mutation($input: JoinGroupingInput!) {
  joinGrouping(input: $input) { ok error errorCode seats { index nickname uid occupied } }
}`;
const join = (user, input) => gql(joinMut, { user, variables: { input } });
const seatsOf = (eventId) => A.tables.signups.filter((r) => r.event_id === eventId).sort((a, b) => a.id - b.id);

// 1) 自报名传假名 -> 落座为服务器昵称 + 本人戳
let r = await join(userA, { groupingId: '101', nickname: '假名', weapon: '破竹·樽', seatIndex: 0 });
check('自报名 ok', r.data?.joinGrouping?.ok === true, JSON.stringify(r).slice(0, 200));
eq('自报名落座名 = 服昵 (覆盖假名)', seatsOf(101)[0]?.nickname, '服昵A');
eq('自报名戳 = 本人', seatsOf(101)[0]?.discord_id, 'UA');
eq('自报名响应座位名 = 服昵', r.data?.joinGrouping?.seats?.[0]?.nickname, '服昵A');

// 2) 自报名无服昵 -> 回退全局名 (users.username 压过会话名)
r = await join(userB, { groupingId: '101', nickname: '随便写', weapon: '裂石·钧', seatIndex: 1 });
eq('无服昵落座名 = 全局名', seatsOf(101)[1]?.nickname, '全局B');
eq('无服昵戳 = 本人', seatsOf(101)[1]?.discord_id, 'UB');

// 3) 自报名无服昵无 users 行 -> 回退会话名
r = await join(userC, { groupingId: '102', nickname: 'x', weapon: '鸣金·影', seatIndex: 0 });
eq('三级回退落座名 = 会话名', seatsOf(102)[0]?.nickname, '会话名C');
eq('三级回退戳 = 本人', seatsOf(102)[0]?.discord_id, 'UC0');

// 4) 代报名选在册者 (名册昵称) -> 名/戳都是被选者
r = await join(userA, { groupingId: '101', nickname: '乱填', weapon: '牵丝·霖', seatIndex: 2, forDiscordId: 'UC' });
check('代报名 ok', r.data?.joinGrouping?.ok === true, JSON.stringify(r).slice(0, 200));
eq('代报名落座名 = 名册昵称', seatsOf(101)[2]?.nickname, '服昵C');
eq('代报名戳 = 被代报者', seatsOf(101)[2]?.discord_id, 'UC');

// 5) 代报名在册者昵称为空 -> 回退名册全局名
r = await join(userA, { groupingId: '102', nickname: '乱填', weapon: '破竹·风', seatIndex: 1, forDiscordId: 'UD' });
eq('代报名落座名 = 名册全局名 (昵称为空)', seatsOf(102)[1]?.nickname, '全局D');
eq('代报名戳 = 被代报者 UD', seatsOf(102)[1]?.discord_id, 'UD');

// 6) 代报名选不在册 id -> 被拒, 不落座
const before103 = seatsOf(103).length;
r = await join(userA, { groupingId: '103', nickname: '乱填', weapon: '破竹·樽', seatIndex: 0, forDiscordId: 'UX' });
eq('不在册代报名 ok=false', r.data?.joinGrouping?.ok, false);
eq('不在册代报名 errorCode', r.data?.joinGrouping?.errorCode, 'proxyTargetNotInRoster');
eq('不在册代报名文案 (zh)', r.data?.joinGrouping?.error, '所选成员不在本百业名册中');
eq('不在册代报名未落座', seatsOf(103).length, before103);

/* ---------------- 名册读取面 ---------------- */
const rosterQ = `query($slug: String!) { viewer { guild(slug: $slug) {
  __typename
  ... on Guild { memberRoster { discordId displayName globalName } }
} } }`;
r = await gql(rosterQ, { user: userA, variables: { slug: 'idtest' } });
eq('成员面 __typename = Guild', r.data?.viewer?.guild?.__typename, 'Guild');
const roster = r.data?.viewer?.guild?.memberRoster || [];
const rc = roster.find((m) => m.discordId === 'UC');
const rd = roster.find((m) => m.discordId === 'UD');
check('名册含 UC 且展示名 = 服昵C', !!rc && rc.displayName === '服昵C' && rc.globalName === '全局C', JSON.stringify(roster));
check('名册含 UD 且展示名回退全局D', !!rd && rd.displayName === '全局D', JSON.stringify(roster));

// 只读面 (未绑定百业): memberRoster 字段不存在 -> 校验错误形态
const rosterOnRo = `query($slug: String!) { viewer { guild(slug: $slug) {
  ... on GuildReadOnly { memberRoster { discordId } }
} } }`;
r = await gql(rosterOnRo, { user: userA, variables: { slug: 'opentest' } });
check('GuildReadOnly 上 memberRoster = 校验错误',
  Array.isArray(r.errors) && /Cannot query field "memberRoster" on type "GuildReadOnly"/.test(r.errors[0]?.message || ''),
  JSON.stringify(r).slice(0, 240));

// 锁定面 (已绑定非成员): 同样字段不存在
const rosterOnLocked = `query($slug: String!) { viewer { guild(slug: $slug) {
  ... on GuildLocked { memberRoster { discordId } }
} } }`;
r = await gql(rosterOnLocked, { user: userZ, variables: { slug: 'idtest' } });
check('GuildLocked 上 memberRoster = 校验错误',
  Array.isArray(r.errors) && /Cannot query field "memberRoster" on type "GuildLocked"/.test(r.errors[0]?.message || ''),
  JSON.stringify(r).slice(0, 240));

// 详情页新文案字段 (双模式)
const detailTextQ = `query($slug: String, $id: ID!) { groupingDetailPage(slug: $slug, id: $id) {
  seatSelfTabLabel seatProxyTabLabel seatSelfNameHint seatProxySearchPlaceholder seatProxyPickRequired seatProxyEmptyText
} }`;
r = await gql(detailTextQ, { user: userA, variables: { slug: 'idtest', id: '101' } });
eq('seatSelfTabLabel (zh)', r.data?.groupingDetailPage?.seatSelfTabLabel, '自己报名');
eq('seatProxyTabLabel (zh)', r.data?.groupingDetailPage?.seatProxyTabLabel, '代报名');
eq('seatProxyEmptyText (zh)', r.data?.groupingDetailPage?.seatProxyEmptyText, '名册里还没有成员');

/* ---------------- 迁移 ---------------- */
function migDb() {
  return makeDb({
    tenants: [{ slug: 'migtest', guild_name: '迁移百业', slogan: '' }],
    settings: [['migtest|discord_guild_id', 'G9']],
    guildMembers: [
      { tenant: 'migtest', discord_id: 'U2', nick: '小明', global_name: '', updated_at: 1 },
      { tenant: 'migtest', discord_id: 'U3a', nick: '重名', global_name: '', updated_at: 1 },
      { tenant: 'migtest', discord_id: 'U3b', nick: '重名', global_name: '', updated_at: 1 },
    ],
    events: [
      ev(201, { tenant: 'migtest', creator_discord_id: null }),
      ev(202, { tenant: 'migtest', creator_discord_id: null }),
      ev(203, { tenant: 'migtest', creator_discord_id: null }),
      ev(204, { tenant: 'migtest', creator_discord_id: null }),
      ev(205, { tenant: 'migtest', creator_discord_id: 'U9' }),
      ev(206, { tenant: 'migtest', creator_discord_id: null, origin: 'official' }),
      ev(207, { tenant: 'migtest', creator_discord_id: null }),
      ev(208, { tenant: 'migtest', creator_discord_id: '' }),
    ],
    signups: [
      { id: 1, event_id: 201, nickname: '甲', uid: 'a', role: '输出', weapon: '破竹·樽', discord_id: 'U1' },
      { id: 2, event_id: 202, nickname: '小明', uid: 'b', role: '输出', weapon: '破竹·樽', discord_id: null },
      { id: 3, event_id: 203, nickname: '重名', uid: 'c', role: '输出', weapon: '破竹·樽', discord_id: null },
      { id: 4, event_id: 205, nickname: '甲', uid: 'd', role: '输出', weapon: '破竹·樽', discord_id: 'U1' },
      { id: 5, event_id: 206, nickname: '乙', uid: 'e', role: '输出', weapon: '破竹·樽', discord_id: 'U7' },
      { id: 6, event_id: 207, nickname: '查无此人', uid: 'f', role: '输出', weapon: '破竹·樽', discord_id: null },
      { id: 7, event_id: 208, nickname: '丙', uid: 'g', role: '输出', weapon: '破竹·樽', discord_id: 'U8' },
    ],
  });
}
const M = migDb();
const creatorOf = (id) => M.tables.events.find((e) => e.id === id)?.creator_discord_id;
let sum = await runCreatorBackfillOnce(M.db);
check('迁移执行 done', sum.done === true, JSON.stringify(sum));
eq('迁移 stamped 数', sum.stamped, 3);
eq('迁移 skipped 数', sum.skipped, 3);
eq('201 座位戳命中 -> U1', creatorOf(201), 'U1');
eq('202 名册唯一命中 -> U2', creatorOf(202), 'U2');
eq('203 重名歧义 -> 不补', creatorOf(203), null);
eq('204 空座 -> 不补', creatorOf(204), null);
eq('205 已有车头 -> 不动', creatorOf(205), 'U9');
eq('206 官方车 -> 不碰', creatorOf(206), null);
eq('207 无匹配 -> 不补', creatorOf(207), null);
eq('208 空串车头按未记录处理 -> U8', creatorOf(208), 'U8');
eq('审计行数 = 候选车数 6', M.tables.audit.length, 6);
const auditOf = (id) => M.tables.audit.find((a) => a.event_id === id);
eq('审计 201 reason', auditOf(201)?.reason, 'seat-stamp');
eq('审计 202 reason', auditOf(202)?.reason, 'roster-unique');
eq('审计 203 outcome/reason', `${auditOf(203)?.outcome}/${auditOf(203)?.reason}`, 'skipped/ambiguous');
eq('审计 204 reason', auditOf(204)?.reason, 'no-seat1');
eq('审计 207 reason', auditOf(207)?.reason, 'no-match');
eq('迁移标志已置位', M.tables.settings.get('|creator_backfill_v1'), '1');
sum = await runCreatorBackfillOnce(M.db);
check('迁移幂等: 二次运行 flag-set 跳过', sum.done === false && sum.reason === 'flag-set', JSON.stringify(sum));
eq('迁移幂等: 审计不增行', M.tables.audit.length, 6);

// host 安全闸: preview / localhost 绝不触发, 生产 host 才跑
const H = makeDb({
  events: [ev(301, { tenant: 'migtest', creator_discord_id: null })],
  signups: [{ id: 1, event_id: 301, nickname: '甲', uid: 'a', role: '输出', weapon: '破竹·樽', discord_id: 'U1' }],
});
const envH = { DB: H.db };
let hr = await maybeRunCreatorBackfill(envH, new Request('https://release-yanyun.tbdlab.workers.dev/graphql', { method: 'POST' }));
check('preview host 不触发', hr.done === false && hr.reason === 'host-not-prod', JSON.stringify(hr));
eq('preview host 未写数据', H.tables.events[0].creator_discord_id, null);
hr = await maybeRunCreatorBackfill(envH, new Request('http://localhost:8787/graphql', { method: 'POST' }));
check('localhost 不触发', hr.done === false && hr.reason === 'host-not-prod', JSON.stringify(hr));
hr = await maybeRunCreatorBackfill(envH, new Request('https://yanyun.app/graphql', { method: 'POST' }));
check('生产 host 触发', hr.done === true, JSON.stringify(hr));
eq('生产 host 已补登记', H.tables.events[0].creator_discord_id, 'U1');

console.log(`\n身份收口 harness: ${pass} PASS / ${fail} FAIL`);
if (A.unknownSql.size || M.unknownSql.size || H.unknownSql.size) {
  console.log('未路由 SQL (供核对):', [...A.unknownSql, ...M.unknownSql, ...H.unknownSql]);
}
if (fail) { console.log('FAILURES:\n' + fails.join('\n')); process.exit(1); }
