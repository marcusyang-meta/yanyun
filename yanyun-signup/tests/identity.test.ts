// Signup identity tightening acceptance (the user's three rulings,
// 2026-10-25):
//  1) Self-signup name locking: the server decides the name (Discord
//     server nickname -> global name -> session name); a fake name
//     sent by the client is overwritten; the seat unconditionally
//     carries the signer's own discord_id stamp.
//  2) Proxy signup: forDiscordId must be in this guild's roster
//     (guild_members); the seated name = roster nickname, falling back
//     to the global name; the stamp = the person signed up for; anyone
//     not in the roster is rejected. The roster read surface
//     memberRoster exists only on the Guild type (response type is
//     the permission): viewers without access resolve guild to null,
//     so no other face can carry it.
//  3) Creator backfill migration for cars with no creator: stamp only
//     from the seat-1 stamp / a unique roster nickname match;
//     ambiguity / empty seat / no match are skipped and audited; cars
//     with an existing creator and official cars are untouched;
//     idempotent; never triggers on non-production hosts
//     (preview/localhost).
// Real yoga + graphql.ts resolvers + the real creatorbackfill
// functions; FakeDB routes faithfully by SQL shape (inserts/updates
// land in real in-memory tables, not hardcoded results).
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { typeDefs } from '../src/graphql-schema.ts';
import { runCreatorBackfillOnce, maybeRunCreatorBackfill } from '../src/creatorbackfill.js';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
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

/* Typed-ID fixture keys: guilds/users carry their 0036 primary keys;
   Discord-space values (roster rows, seat stamps, nicks) stay Discord
   IDs by design. */
const GID = { idtest: 1030100001, opentest: 1030100002, migtest: 1030100003 };
const UID = {
  UA: 2030100001, UB: 2030100002, UC0: 2030100003, UZ: 2030100004,
  U1: 2030100005, U2: 2030100006, U3a: 2030100007, U3b: 2030100008,
  U7: 2030100009, U8: 2030100010, U9: 2030100011,
};

/* ---------------- FakeDB ---------------- */
function makeDb(fx = {}) {
  const tables = {
    tenants: fx.tenants || [],
    settings: new Map(fx.settings || []),
    events: (fx.events || []).map((e) => ({ ...e })),
    signups: (fx.signups || []).map((r) => ({ ...r })),
    users: new Map((fx.users || []).map(([did, name]) => [did, { id: UID[did] || 0, username: name }])), // discord_id -> {id, username}
    nicks: (fx.nicks || []).map((r) => ({ ...r })), // {discord_id, guild_id, nick}
    guildMembers: (fx.guildMembers || []).map((r) => ({ ...r })),
    audit: [],
    mint: new Map(),
  };
  let nextSignupId = 1000;
  const unknownSql = new Set();
  function stmt(sql) {
    // Data-layer (Drizzle) SQL normalization: strip quotes + settings. qualifiers (routing match only).
    sql = sql.replace(/"/g, '').replace(/settings\./g, '');
    const q = {
      _binds: [],
      bind(...a) { this._binds = a; return this; },
      async raw() { const res = await this.all(); return toRawRows(sql, (res && res.results) || []); },
      async first() {
        const b = this._binds;
        if (/FROM tenants WHERE slug/.test(sql)) return tables.tenants.find((t) => t.slug === b[0]) || null;
        if (/FROM settings/.test(sql)) {
          // Shapes: tenant/key two-binding form; or a tenant = 0 literal binding only the key (global-scope jobs).
          const k = /tenant = 0/.test(sql) ? `0|${b[0]}` : `${b[0]}|${b[1]}`;
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
          return u === undefined ? null : { username: u.username };
        }
        if (/FROM users/.test(sql) && /discord_id = \?/.test(sql)) {
          const u = tables.users.get(String(b[0]));
          return u === undefined ? null : { id: u.id, discord_id: String(b[0]), username: u.username };
        }
        if (/FROM users/.test(sql) && /WHERE id = \?/.test(sql)) {
          const u = [...tables.users.values()].find((x) => x.id === Number(b[0]));
          return u === undefined ? null : u;
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
        if (/INSERT INTO id_mint_counters/.test(sql)) {
          const key = `${b[0]}|${b[1]}`;
          const seq = (tables.mint.get(key) || 0) + 1;
          tables.mint.set(key, seq);
          return { seq };
        }
        if (/CREATE|ALTER|PRAGMA/.test(sql)) return null;
        unknownSql.add('first: ' + sql.slice(0, 90));
        return null;
      },
      async all() {
        const b = this._binds;
        if (/INSERT INTO id_mint_counters/.test(sql)) {
          const key = `${b[0]}|${b[1]}`;
          const seq = (tables.mint.get(key) || 0) + 1;
          tables.mint.set(key, seq);
          return { results: [{ seq }] };
        }
        if (/FROM settings/.test(sql)) {
          // The data layer reads settings via the .all() channel (drizzle db.get/all): point lookups and per-key scans.
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
          // Data-layer point lookups use the .all() channel (drizzle db.get): same shape as first()'s by-id branch.
          const row = tables.events.find((e) => e.id === Number(b[0])) || null;
          return { results: row ? [row] : [] };
        }
        if (/FROM user_guild_nicks/.test(sql)) {
          // users repository point lookups use the .all() channel: same shape as first()'s nickname branch.
          const r = tables.nicks.find((n) => n.discord_id === String(b[0]) && n.guild_id === String(b[1]));
          return { results: r ? [{ nick: r.nick }] : [] };
        }
        if (/SELECT username FROM users/.test(sql)) {
          const u = tables.users.get(String(b[0]));
          return { results: u === undefined ? [] : [{ username: u.username }] };
        }
        if (/FROM users/.test(sql) && /discord_id = \?/.test(sql)) {
          const u = tables.users.get(String(b[0]));
          return { results: u === undefined ? [] : [{ id: u.id, discord_id: String(b[0]), username: u.username }] };
        }
        if (/FROM events/.test(sql) && /origin = 'member'/.test(sql)) {
          return { results: tables.events.filter((e) => e.origin === 'member' && (e.creator_user_id == null || e.creator_user_id === 0)).sort((a, c) => a.id - c.id) };
        }
        if (/FROM signups WHERE event_id/.test(sql)) {
          return { results: tables.signups.filter((r) => r.event_id === Number(b[0])).sort((a, c) => a.id - c.id) };
        }
        if (/FROM guild_members/.test(sql) && /discord_id = \?/.test(sql)) {
          // Data-layer point lookups use the .all() channel (drizzle
          // db.get): must filter by discord_id and must not fall through
          // to the whole-table branch below (db.get takes only the first row).
          const r = tables.guildMembers.find((m) => m.tenant === b[0] && m.discord_id === String(b[1]));
          return { results: r ? [r] : [] };
        }
        if (/FROM guild_members WHERE tenant = \?/.test(sql)) {
          return { results: tables.guildMembers.filter((m) => m.tenant === b[0]) };
        }
        if (/FROM tenants/.test(sql) && /slug = \?/.test(sql)) {
          const row = tables.tenants.find((t) => t.slug === b[0]) || null;
          return { results: row ? [row] : [] };
        }
        if (/FROM tenants/.test(sql) && /WHERE id = \?/.test(sql)) {
          const row = tables.tenants.find((t) => t.id === Number(b[0])) || null;
          return { results: row ? [row] : [] };
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
          // join's conditional insert: seat only when not full and open.
          // Binds follow the SQL column list (the minted id leads since 0036).
          const cols = /INSERT INTO signups \(([^)]+)\)/.exec(sql)[1].split(',').map((c) => c.trim());
          const v = {};
          cols.forEach((c, i) => { v[c] = b[i]; });
          const ev = tables.events.find((e) => e.id === Number(v.event_id));
          const count = tables.signups.filter((r) => r.event_id === Number(v.event_id)).length;
          if (!ev || ev.status !== 'open' || count >= ev.max_slots) return { meta: { changes: 0 } };
          const row = { id: Number(v.id) || nextSignupId++, event_id: Number(v.event_id), nickname: v.nickname, uid: v.uid, role: v.role, weapon: v.weapon, discord_id: v.discord_id };
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
          if (/VALUES\(0, \?, '1'\)/.test(sql)) tables.settings.set(`0|${b[0]}`, '1');
          else tables.settings.set(`${b[0]}|${b[1]}`, b[2]);
          return { meta: { changes: 1 } };
        }
        if (/UPDATE events SET creator_user_id/.test(sql)) {
          const ev = tables.events.find((e) => e.id === Number(b[1]));
          if (ev && (ev.creator_user_id == null || ev.creator_user_id === 0)) {
            ev.creator_user_id = b[0];
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
    id, tenant: GID.idtest, type: 'activity', title: '车' + id, description: '', dungeon: '',
    max_slots: 10, starts_at: '', starts_at_utc: null, status: 'open', origin: 'member',
    creator_user_id: UID.U1, created_by: '', reminder_sent_at: null, reminder_error: null,
    ...over,
  };
}


describe('identity', () => {

  it('schema contract', async () => {
/* ---------------- Schema contract ---------------- */
check('schema: JoinGroupingInput.forDiscordId', /input JoinGroupingInput \{[^}]*forDiscordId: ID/.test(typeDefs));
check('schema: type GuildRosterMember', typeDefs.includes('type GuildRosterMember'));
check('schema: Guild.memberRoster', /type Guild \{[^]*?memberRoster: \[GuildRosterMember!\]!/.test(typeDefs));
{
  // The read-only / locked guild faces were deleted (demo surfaces,
  // 2026-10-28): absence from the schema IS the contract now.
  check('schema: 无 GuildReadOnly 类型', !typeDefs.includes('type GuildReadOnly'));
  check('schema: 无 GuildLocked 类型', !typeDefs.includes('type GuildLocked'));
  check('schema: 无 publicGuilds 字段', !typeDefs.includes('publicGuilds'));
  check('schema: Viewer.guild 返回 Guild', /guild\(slug: String!\): Guild/.test(typeDefs));
}
for (const f of ['seatSelfTabLabel', 'seatProxyTabLabel', 'seatSelfNameHint', 'seatProxySearchPlaceholder', 'seatProxyPickRequired', 'seatProxyEmptyText']) {
  check('schema: 字段 ' + f, typeDefs.includes(f + ': String!'));
}

  });
/* ---------------- Signup path (join) ---------------- */
let r: any;
const A = makeDb({
  tenants: [
    { id: GID.idtest, slug: 'idtest', guild_name: '身份测试百业', slogan: '' },
    { id: GID.opentest, slug: 'opentest', guild_name: '公开百业', slogan: '' },
  ],
  settings: [[`${GID.idtest}|discord_guild_id`, 'G1']],
  users: [['UA', '全局A'], ['UB', '全局B']],
  nicks: [{ discord_id: 'UA', guild_id: 'G1', nick: '服昵A' }],
  guildMembers: [
    { tenant: GID.idtest, discord_id: 'UC', nick: '服昵C', global_name: '全局C', updated_at: 1 },
    { tenant: GID.idtest, discord_id: 'UD', nick: '', global_name: '全局D', updated_at: 1 },
  ],
  events: [ev(101), ev(102), ev(103)],
  signups: [],
});
const envA = { DB: A.db };
const userA = { userId: UID.UA, discordId: 'UA', name: '全局A', guilds: ['G1'] };
const userB = { userId: UID.UB, discordId: 'UB', name: '会话名B', guilds: ['G1'] };
const userC = { userId: UID.UC0, discordId: 'UC0', name: '会话名C', guilds: ['G1'] };
const userZ = { userId: UID.UZ, discordId: 'UZ', name: '路人', guilds: [] };

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


  it('self-signup: server nickname overwrites fake name', async () => {
// 1) Self-signup with a fake name -> seated under the server nickname + own stamp.
r = await join(userA, { groupingId: '101', nickname: '假名', weapon: '破竹·樽', seatIndex: 0 });
check('自报名 ok', r.data?.joinGrouping?.ok === true, JSON.stringify(r).slice(0, 200));
eq('自报名落座名 = 服昵 (覆盖假名)', seatsOf(101)[0]?.nickname, '服昵A');
eq('自报名戳 = 本人', seatsOf(101)[0]?.discord_id, 'UA');
eq('自报名响应座位名 = 服昵', r.data?.joinGrouping?.seats?.[0]?.nickname, '服昵A');

  });

  it('self-signup: fall back to global name', async () => {
// 2) Self-signup with no server nickname -> fall back to the global name (users.username beats the session name).
r = await join(userB, { groupingId: '101', nickname: '随便写', weapon: '裂石·钧', seatIndex: 1 });
eq('无服昵落座名 = 全局名', seatsOf(101)[1]?.nickname, '全局B');
eq('无服昵戳 = 本人', seatsOf(101)[1]?.discord_id, 'UB');

  });

  it('self-signup: fall back to session name', async () => {
// 3) Self-signup with no server nickname and no users row -> fall back to the session name.
r = await join(userC, { groupingId: '102', nickname: 'x', weapon: '鸣金·影', seatIndex: 0 });
eq('三级回退落座名 = 会话名', seatsOf(102)[0]?.nickname, '会话名C');
eq('三级回退戳 = 本人', seatsOf(102)[0]?.discord_id, 'UC0');

  });

  it('proxy signup: roster nickname', async () => {
// 4) Proxy signup picking a roster member (roster nickname) -> name/stamp are both the picked person's.
r = await join(userA, { groupingId: '101', nickname: '乱填', weapon: '牵丝·霖', seatIndex: 2, forDiscordId: 'UC' });
check('代报名 ok', r.data?.joinGrouping?.ok === true, JSON.stringify(r).slice(0, 200));
eq('代报名落座名 = 名册昵称', seatsOf(101)[2]?.nickname, '服昵C');
eq('代报名戳 = 被代报者', seatsOf(101)[2]?.discord_id, 'UC');

  });

  it('proxy signup: fall back to roster global name', async () => {
// 5) Proxy signup where the roster member's nickname is empty -> fall back to the roster global name.
r = await join(userA, { groupingId: '102', nickname: '乱填', weapon: '破竹·风', seatIndex: 1, forDiscordId: 'UD' });
eq('代报名落座名 = 名册全局名 (昵称为空)', seatsOf(102)[1]?.nickname, '全局D');
eq('代报名戳 = 被代报者 UD', seatsOf(102)[1]?.discord_id, 'UD');

  });

  it('proxy signup: not in roster rejected', async () => {
// 6) Proxy signup picking an id not in the roster -> rejected, no seat taken.
const before103 = seatsOf(103).length;
r = await join(userA, { groupingId: '103', nickname: '乱填', weapon: '破竹·樽', seatIndex: 0, forDiscordId: 'UX' });
eq('不在册代报名 ok=false', r.data?.joinGrouping?.ok, false);
eq('不在册代报名 errorCode', r.data?.joinGrouping?.errorCode, 'proxyTargetNotInRoster');
eq('不在册代报名文案 (zh)', r.data?.joinGrouping?.error, '所选成员不在本百业名册中');
eq('不在册代报名未落座', seatsOf(103).length, before103);

  });

  it('roster read surface', async () => {
/* ---------------- Roster read surface ---------------- */
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

// Unbound guild: the read-only variant is gone — the guild resolves on
// the single Guild face (write access is composed inside, per field).
const guildFaceQ = `query($slug: String!) { viewer { guild(slug: $slug) { __typename slug } } }`;
r = await gql(guildFaceQ, { user: userA, variables: { slug: 'opentest' } });
eq('未绑百业 guild 面 = Guild（只读变体已删）', r.data?.viewer?.guild?.__typename, 'Guild');

// Bound guild, non-member: no locked face either — guild resolves to null.
r = await gql(guildFaceQ, { user: userZ, variables: { slug: 'idtest' } });
eq('非成员 guild = null（锁定面已删）', r.data?.viewer?.guild, null);

// New detail-page copy fields (both modes).
const detailTextQ = `query($slug: String, $id: ID!) { groupingDetailPage(slug: $slug, id: $id) {
  seatSelfTabLabel seatProxyTabLabel seatSelfNameHint seatProxySearchPlaceholder seatProxyPickRequired seatProxyEmptyText
} }`;
r = await gql(detailTextQ, { user: userA, variables: { slug: 'idtest', id: '101' } });
eq('seatSelfTabLabel (zh)', r.data?.groupingDetailPage?.seatSelfTabLabel, '自己报名');
eq('seatProxyTabLabel (zh)', r.data?.groupingDetailPage?.seatProxyTabLabel, '代报名');
eq('seatProxyEmptyText (zh)', r.data?.groupingDetailPage?.seatProxyEmptyText, '名册里还没有成员');

  });

  it('creator backfill migration', async () => {
/* ---------------- Migration ---------------- */
function migDb() {
  return makeDb({
    tenants: [{ id: GID.migtest, slug: 'migtest', guild_name: '迁移百业', slogan: '' }],
    settings: [[`${GID.migtest}|discord_guild_id`, 'G9']],
    users: [['U1', ''], ['U2', ''], ['U3a', ''], ['U3b', ''], ['U7', ''], ['U8', ''], ['U9', '']],
    guildMembers: [
      { tenant: GID.migtest, discord_id: 'U2', nick: '小明', global_name: '', updated_at: 1 },
      { tenant: GID.migtest, discord_id: 'U3a', nick: '重名', global_name: '', updated_at: 1 },
      { tenant: GID.migtest, discord_id: 'U3b', nick: '重名', global_name: '', updated_at: 1 },
    ],
    events: [
      ev(201, { tenant: GID.migtest, creator_user_id: null }),
      ev(202, { tenant: GID.migtest, creator_user_id: null }),
      ev(203, { tenant: GID.migtest, creator_user_id: null }),
      ev(204, { tenant: GID.migtest, creator_user_id: null }),
      ev(205, { tenant: GID.migtest, creator_user_id: UID.U9 }),
      ev(206, { tenant: GID.migtest, creator_user_id: null, origin: 'official' }),
      ev(207, { tenant: GID.migtest, creator_user_id: null }),
      ev(208, { tenant: GID.migtest, creator_user_id: 0 }),
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
const creatorOf = (id) => M.tables.events.find((e) => e.id === id)?.creator_user_id;
let sum = await runCreatorBackfillOnce(M.db);
check('迁移执行 done', sum.done === true, JSON.stringify(sum));
eq('迁移 stamped 数', sum.stamped, 3);
eq('迁移 skipped 数', sum.skipped, 3);
eq('201 座位戳命中 -> U1 的 user id', creatorOf(201), UID.U1);
eq('202 名册唯一命中 -> U2 的 user id', creatorOf(202), UID.U2);
eq('203 重名歧义 -> 不补', creatorOf(203), null);
eq('204 空座 -> 不补', creatorOf(204), null);
eq('205 已有车头 -> 不动', creatorOf(205), UID.U9);
eq('206 官方车 -> 不碰', creatorOf(206), null);
eq('207 无匹配 -> 不补', creatorOf(207), null);
eq('208 零值车头按未记录处理 -> U8 的 user id', creatorOf(208), UID.U8);
eq('审计行数 = 候选车数 6', M.tables.audit.length, 6);
const auditOf = (id) => M.tables.audit.find((a) => a.event_id === id);
eq('审计 201 reason', auditOf(201)?.reason, 'seat-stamp');
eq('审计 202 reason', auditOf(202)?.reason, 'roster-unique');
eq('审计 203 outcome/reason', `${auditOf(203)?.outcome}/${auditOf(203)?.reason}`, 'skipped/ambiguous');
eq('审计 204 reason', auditOf(204)?.reason, 'no-seat1');
eq('审计 207 reason', auditOf(207)?.reason, 'no-match');
eq('迁移标志已置位', M.tables.settings.get('0|creator_backfill_v1'), '1');
sum = await runCreatorBackfillOnce(M.db);
check('迁移幂等: 二次运行 flag-set 跳过', sum.done === false && sum.reason === 'flag-set', JSON.stringify(sum));
eq('迁移幂等: 审计不增行', M.tables.audit.length, 6);

  });

  it('migration host safety gate', async () => {
// Host safety gate: preview / localhost never trigger; only production hosts run it.
const H = makeDb({
  tenants: [{ id: GID.migtest, slug: 'migtest', guild_name: '迁移百业', slogan: '' }],
  users: [['U1', '']],
  events: [ev(301, { tenant: GID.migtest, creator_user_id: null })],
  signups: [{ id: 1, event_id: 301, nickname: '甲', uid: 'a', role: '输出', weapon: '破竹·樽', discord_id: 'U1' }],
});
const envH = { DB: H.db };
let hr = await maybeRunCreatorBackfill(envH, new Request('https://release-yanyun.tbdlab.workers.dev/graphql', { method: 'POST' }));
check('preview host 不触发', hr.done === false && hr.reason === 'host-not-prod', JSON.stringify(hr));
eq('preview host 未写数据', H.tables.events[0].creator_user_id, null);
hr = await maybeRunCreatorBackfill(envH, new Request('http://localhost:8787/graphql', { method: 'POST' }));
check('localhost 不触发', hr.done === false && hr.reason === 'host-not-prod', JSON.stringify(hr));
hr = await maybeRunCreatorBackfill(envH, new Request('https://yanyun.app/graphql', { method: 'POST' }));
check('生产 host 触发', hr.done === true, JSON.stringify(hr));
eq('生产 host 已补登记', H.tables.events[0].creator_user_id, UID.U1);
  });
});
