// Leader-name lock acceptance (ruling 2026-11-01: the leader seat's
// name must not be editable — not at creation, not in a full seat-table
// edit, not by the leader, not by a guild admin):
//  1) createGrouping: the submitted nickname for seat 0 (where the
//     create form auto-seats the creator) is ignored; the seat is
//     named from the creator's identity chain (bound-server nickname,
//     then the global name — canonicalSignupName, the same function
//     the self-signup path uses) and stamped with the creator
//     unconditionally. Other pre-seated rows pass through untouched.
//  2) updateGrouping seat rewrite: the leader seat is located in the
//     old table by its creator stamp (the composition layer's own
//     definition), else by a unique match on the creator's current
//     identity name; the rewritten seat at that position is forced
//     back to the creator's CURRENT identity name (a Discord rename
//     moves it), while every other seat renames freely and the save
//     itself succeeds — for the leader and for a guild admin alike.
//  3) Legacy groupings with no creator record: the first seat's
//     existing name is frozen; other seats still rename.
// Real yoga + real resolvers + a FakeDB that routes by SQL shape into
// real in-memory tables (guildadmin-harness shape, extended with the
// nickname snapshot table and real usernames).
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* Convert FakeDB object rows into the values-mode arrays the Drizzle
   D1 driver returns (same helper shape as the other suites). */
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
    tenants: (fx.tenants || []).map((t) => ({ ...t })),
    settings: new Map(fx.settings || []), // `${tenant}|${key}` -> value
    users: (fx.users || []).map((u) => ({ ...u })), // {id, discord_id, username, guilds_json}
    nicks: (fx.nicks || []).map((r) => ({ ...r })), // {discord_id, guild_id, nick}
    events: (fx.events || []).map((e) => ({ ...e })),
    signups: (fx.signups || []).map((r) => ({ ...r })),
    guildMembers: (fx.guildMembers || []).map((r) => ({ ...r })),
    mint: new Map(), // `${type_code}|${day_index}` -> last seq
  };
  let nextId = 5000;
  const unknownSql = new Set();

  function norm(sql) {
    return sql.replace(/"/g, '').replace(/\b(tenants|settings|users|events|signups|guild_members|user_guild_nicks)\./g, '').replace(/\s+/g, ' ');
  }
  function parseCols(list) {
    return list.split(',').map((c) => c.trim().split('.').pop());
  }

  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    if (/INSERT INTO id_mint_counters/i.test(sql)) {
      const key = `${b[0]}|${b[1]}`;
      const seq = (tables.mint.get(key) || 0) + 1;
      tables.mint.set(key, seq);
      return kind === 'first' ? { seq } : (kind === 'all' ? { results: [{ seq }] } : { meta: { changes: 1 } });
    }
    /* ---- generic INSERT (column list parsed) ---- */
    let m = /^INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)/i.exec(sql);
    if (m) {
      const [, table, colList] = m;
      const cols = parseCols(colList);
      const row = {};
      cols.forEach((c, i) => { row[c] = b[i]; });
      if (row.id == null) row.id = nextId++;
      if (table === 'events') tables.events.push(row);
      else if (table === 'signups') tables.signups.push(row);
      else if (table === 'settings') tables.settings.set(`${row.tenant}|${row.key}`, row.value);
      else if (table === 'guild_members') tables.guildMembers.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    /* ---- generic UPDATE ---- */
    m = /^UPDATE (\w+) SET (.+?) WHERE (.+)$/i.exec(sql);
    if (m) {
      const [, table, setList] = m;
      const setCols = setList.split(',').map((p) => p.trim().split('=')[0].trim().split('.').pop());
      const sets = {};
      setCols.forEach((c, i) => { sets[c] = b[i]; });
      const wb = b.slice(setCols.length);
      let rows = [];
      if (table === 'events') rows = tables.events.filter((e) => e.id === Number(wb[0]) && (wb.length < 2 || e.tenant === wb[1]));
      else if (table === 'signups') rows = tables.signups.filter((x) => x.id === Number(wb[0]));
      else if (table === 'users') rows = tables.users.filter((u) => u.id === Number(wb[0]) || u.discord_id === String(wb[0]));
      for (const r of rows) Object.assign(r, sets);
      return { meta: { changes: rows.length } };
    }
    /* ---- DELETE ---- */
    if (/^DELETE FROM signups WHERE event_id/i.test(sql)) {
      const before = tables.signups.length;
      tables.signups = tables.signups.filter((x) => x.event_id !== Number(b[0]));
      return { meta: { changes: before - tables.signups.length } };
    }
    if (/^DELETE FROM signups WHERE id/i.test(sql)) {
      tables.signups = tables.signups.filter((x) => x.id !== Number(b[0]));
      return { meta: { changes: 1 } };
    }
    if (/^DELETE FROM events WHERE id/i.test(sql)) {
      tables.events = tables.events.filter((x) => x.id !== Number(b[0]));
      return { meta: { changes: 1 } };
    }
    if (/\b(CREATE TABLE|ALTER TABLE|PRAGMA)\b/i.test(sql)) return kind === 'run' ? { meta: { changes: 0 } } : (kind === 'first' ? null : { results: [] });

    /* ---- SELECTs ---- */
    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });
    if (/FROM guild_entitlements/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/FROM guild_officer_grants/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/FROM tenants WHERE slug/i.test(sql)) return first(tables.tenants.find((t) => t.slug === b[0]));
    if (/FROM tenants WHERE id/i.test(sql)) return first(tables.tenants.find((t) => t.id === Number(b[0])));
    if (/FROM tenants/i.test(sql)) return kind === 'first' ? (tables.tenants[0] ?? null) : all(tables.tenants);
    if (/FROM settings/i.test(sql)) {
      if (/tenant = \?/.test(sql) && b.length > 1) {
        const v = tables.settings.get(`${b[0]}|${b[1]}`);
        return first(v === undefined ? null : { value: v });
      }
      if (/tenant = 0/.test(sql)) {
        const v = tables.settings.get(`0|${b[0]}`);
        return first(v === undefined ? null : { value: v });
      }
      const rows = [];
      for (const [k, v] of tables.settings) { const [t, key] = k.split('|'); if (key === b[0]) rows.push({ tenant: t, value: v }); }
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    if (/FROM user_guild_nicks/i.test(sql)) {
      const r = tables.nicks.find((n) => n.discord_id === String(b[0]) && n.guild_id === String(b[1]));
      return kind === 'first' ? (r ? { nick: r.nick } : null) : all(r ? [{ nick: r.nick }] : []);
    }
    if (/FROM users/i.test(sql)) {
      if (/discord_id IN \(/i.test(sql)) return all(tables.users.filter((u) => b.map(String).includes(u.discord_id)));
      if (/WHERE id IN \(/i.test(sql)) return all(tables.users.filter((u) => b.map(Number).includes(u.id)));
      if (/discord_id = \?/i.test(sql)) return first(tables.users.find((u) => u.discord_id === String(b[0])) || null);
      if (/WHERE id = \?/i.test(sql)) return first(tables.users.find((u) => u.id === Number(b[0])) || null);
      if (!/WHERE/i.test(sql)) return all(tables.users);
      return first(null);
    }
    if (/FROM guild_members/i.test(sql)) {
      let rows = tables.guildMembers.filter((x) => x.tenant === b[0]);
      if (/discord_id = \?/i.test(sql) && b.length > 1) rows = rows.filter((x) => x.discord_id === String(b[1]));
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    if (/SELECT \* FROM events WHERE id = \?/i.test(sql)) {
      return first(tables.events.find((e) => e.id === Number(b[0])));
    }
    if (/FROM events/i.test(sql) && /WHERE id = \?/i.test(sql)) {
      return first(tables.events.find((e) => e.id === Number(b[0])));
    }
    if (/FROM signups WHERE event_id/i.test(sql)) {
      return all(tables.signups.filter((r) => r.event_id === Number(b[0])).sort((a, c) => a.id - c.id));
    }
    if (/COUNT\(DISTINCT/i.test(sql)) return first({ c: 0 });
    unknownSql.add(kind + ': ' + sql.slice(0, 110));
    return kind === 'first' ? null : (kind === 'all' ? { results: [] } : { meta: { changes: 0 } });
  }

  function stmt(rawSql) {
    const q = {
      _binds: [],
      bind(...a) { this._binds = a; return this; },
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
  return { db, tables, unknownSql };
}

/* ---------------- fixtures ---------------- */
const DGID = '555555555555555555';
const GID = { locktest: 1030100007 };
const UID = { UL: 2030100021, UL2: 2030100022, UL3: 2030100023, UA: 2030100024, UM: 2030100025 };
const serversJson = (rows) => JSON.stringify(rows);
const memberServers = serversJson([{ id: DGID, name: '锁名测试服', icon: '', permissions: '0', owner: false }]);
const ownerServers = serversJson([{ id: DGID, name: '锁名测试服', icon: '', permissions: '0', owner: true }]);

const LEADER = { userId: UID.UL, discordId: 'UL', name: '全局L', guilds: [DGID] };
const LEADER2 = { userId: UID.UL2, discordId: 'UL2', name: '全局L2', guilds: [DGID] };
const LEADER3 = { userId: UID.UL3, discordId: 'UL3', name: '全局L3', guilds: [DGID] };
const ADMIN = { userId: UID.UA, discordId: 'UA', name: '全局Admin', guilds: [DGID] };

function baseFx() {
  return {
    tenants: [{ id: GID.locktest, slug: 'locktest', guild_name: '锁名测试百业', slogan: '' }],
    settings: [[`${GID.locktest}|discord_guild_id`, DGID]],
    users: [
      { id: UID.UL, discord_id: 'UL', username: '全局L', guilds_json: memberServers },
      { id: UID.UL2, discord_id: 'UL2', username: '全局L2', guilds_json: memberServers },
      { id: UID.UL3, discord_id: 'UL3', username: '全局L3', guilds_json: memberServers },
      { id: UID.UA, discord_id: 'UA', username: '全局Admin', guilds_json: ownerServers },
      { id: UID.UM, discord_id: 'UM', username: '全局M', guilds_json: memberServers },
    ],
    nicks: [
      { discord_id: 'UL', guild_id: DGID, nick: '服昵L' },
      { discord_id: 'UL3', guild_id: DGID, nick: '新服昵L3' },
      { discord_id: 'UM', guild_id: DGID, nick: '服昵M' },
    ],
  };
}

function evRow(id, over = {}) {
  return {
    id, tenant: GID.locktest, type: 'activity', title: '车' + id, description: '', dungeon: '',
    max_slots: 10, starts_at: '', starts_at_utc: null, status: 'open', origin: 'member',
    creator_user_id: UID.UL, created_by: '热心侠客', created_tz: null,
    reminder_sent_at: null, reminder_error: null, ...over,
  };
}
function seatRow(id, eventId, nickname, discordId, weapon = '破竹·樽') {
  return { id, event_id: eventId, nickname, uid: 'u' + id, role: '输出', weapon, discord_id: discordId, ready_at: null };
}

const createMut = `mutation($input: CreateGroupingInput!) {
  createGrouping(input: $input) { ok error errorCode grouping { id } }
}`;
const updateMut = `mutation($id: ID!, $input: UpdateGroupingInput!) {
  updateGrouping(id: $id, input: $input) { ok error errorCode grouping { id } }
}`;
const startsAt = () => String(Math.floor(Date.now() / 1000) + 86400);

function makeGql(env) {
  return async (query, { user, variables } = {}) => {
    const ctx = { env, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
    const res = await yoga.fetch(new Request('http://local/graphql', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    }), ctx);
    return res.json();
  };
}
const seatsOf = (tables, eventId) => tables.signups.filter((r) => r.event_id === eventId).sort((a, b) => a.id - b.id);

describe('leader name lock', () => {

  it('create: forged leader nickname is replaced by the identity name', async () => {
    const A = makeDb(baseFx());
    const gql = makeGql({ DB: A.db });
    const r = await gql(createMut, {
      user: LEADER,
      variables: {
        input: {
          slug: 'locktest', title: '锁名车', type: 'ACTIVITY', startsAt: startsAt(), dungeonId: null,
          seats: [
            { nickname: '伪造车头名', weapon: '破竹·樽' },
            { nickname: '队友甲', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('发车 ok', r.data?.createGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const evId = Number(r.data?.createGrouping?.grouping?.id);
    const seats = seatsOf(A.tables, evId);
    eq('座位数', seats.length, 2);
    eq('车头位落库为服务器昵称', seats[0]?.nickname, '服昵L');
    eq('车头位无条件盖创建人戳', seats[0]?.discord_id, 'UL');
    eq('同车预置队员不受影响', seats[1]?.nickname, '队友甲');
    eq('队员不被误盖戳', seats[1]?.discord_id ?? null, null);
  });

  it('create: no server nick falls back to the global name', async () => {
    const A = makeDb(baseFx());
    const gql = makeGql({ DB: A.db });
    const r = await gql(createMut, {
      user: LEADER2,
      variables: {
        input: {
          slug: 'locktest', title: '无服昵车', type: 'ACTIVITY', startsAt: startsAt(), dungeonId: null,
          seats: [{ nickname: '随便写的名字', weapon: '破竹·樽' }],
        },
      },
    });
    eq('发车 ok', r.data?.createGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const evId = Number(r.data?.createGrouping?.grouping?.id);
    const seats = seatsOf(A.tables, evId);
    eq('车头位落库为全局名', seats[0]?.nickname, '全局L2');
    eq('车头位盖创建人戳', seats[0]?.discord_id, 'UL2');
  });

  it('update: leader seat name is restored, other seats rename freely', async () => {
    const A = makeDb({
      ...baseFx(),
      events: [evRow(301)],
      signups: [
        seatRow(1, 301, '服昵L', 'UL'),
        seatRow(2, 301, '队员甲', null, '鸣金·虹'),
        seatRow(3, 301, '队员乙', 'UM', '鸣金·虹'),
      ],
    });
    const gql = makeGql({ DB: A.db });
    const r = await gql(updateMut, {
      user: LEADER,
      variables: {
        id: '301',
        input: {
          seats: [
            { nickname: '冒充车头', weapon: '破竹·樽' },
            { nickname: '队员甲改', weapon: '鸣金·虹' },
            { nickname: '队员乙改', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('编辑 ok', r.data?.updateGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const seats = seatsOf(A.tables, 301);
    eq('座位数', seats.length, 3);
    eq('车头名被恢复为身份名', seats[0]?.nickname, '服昵L');
    eq('车头戳按既有 carry 保留', seats[0]?.discord_id, 'UL');
    eq('队员甲改名成功', seats[1]?.nickname, '队员甲改');
    eq('队员乙改名成功', seats[2]?.nickname, '队员乙改');
  });

  it('update: a guild admin is bound by the same lock', async () => {
    const A = makeDb({
      ...baseFx(),
      events: [evRow(302)],
      signups: [
        seatRow(1, 302, '服昵L', 'UL'),
        seatRow(2, 302, '队员甲', null, '鸣金·虹'),
      ],
    });
    const gql = makeGql({ DB: A.db });
    const r = await gql(updateMut, {
      user: ADMIN,
      variables: {
        id: '302',
        input: {
          seats: [
            { nickname: '管理员乱改', weapon: '破竹·樽' },
            { nickname: '队员甲改', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('管理员编辑 ok', r.data?.updateGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const seats = seatsOf(A.tables, 302);
    eq('管理员也改不动车头名', seats[0]?.nickname, '服昵L');
    eq('队员改名成功', seats[1]?.nickname, '队员甲改');
  });

  it('update: leader seat follows the creator’s current identity name', async () => {
    // The car was created when the leader's server nick was 旧服昵L3;
    // the nick snapshot now says 新服昵L3 — the lock restores to the
    // current name, not the name the seat happened to carry.
    const A = makeDb({
      ...baseFx(),
      events: [evRow(303, { creator_user_id: UID.UL3 })],
      signups: [
        seatRow(1, 303, '旧服昵L3', 'UL3'),
        seatRow(2, 303, '队员甲', null, '鸣金·虹'),
      ],
    });
    const gql = makeGql({ DB: A.db });
    const r = await gql(updateMut, {
      user: LEADER3,
      variables: {
        id: '303',
        input: {
          seats: [
            { nickname: '乱写的名字', weapon: '破竹·樽' },
            { nickname: '队员甲', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('编辑 ok', r.data?.updateGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const seats = seatsOf(A.tables, 303);
    eq('车头名恢复为当前身份名', seats[0]?.nickname, '新服昵L3');
  });

  it('update: leader seat located by unique identity name when its stamp is gone', async () => {
    const A = makeDb({
      ...baseFx(),
      events: [evRow(304)],
      signups: [
        seatRow(1, 304, '服昵L', null),
        seatRow(2, 304, '队员甲', null, '鸣金·虹'),
      ],
    });
    const gql = makeGql({ DB: A.db });
    const r = await gql(updateMut, {
      user: LEADER,
      variables: {
        id: '304',
        input: {
          seats: [
            { nickname: '冒充车头', weapon: '破竹·樽' },
            { nickname: '队员甲改', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('编辑 ok', r.data?.updateGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const seats = seatsOf(A.tables, 304);
    eq('无戳车头名仍被恢复', seats[0]?.nickname, '服昵L');
    eq('队员改名成功', seats[1]?.nickname, '队员甲改');
  });

  it('update: legacy car without a creator record freezes its first seat name', async () => {
    const A = makeDb({
      ...baseFx(),
      events: [evRow(305, { creator_user_id: null })],
      signups: [
        seatRow(1, 305, '老车头', null),
        seatRow(2, 305, '老队员', null, '鸣金·虹'),
      ],
    });
    const gql = makeGql({ DB: A.db });
    const r = await gql(updateMut, {
      user: ADMIN,
      variables: {
        id: '305',
        input: {
          seats: [
            { nickname: '想改车头', weapon: '破竹·樽' },
            { nickname: '老队员改', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('管理员编辑无车头车 ok', r.data?.updateGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const seats = seatsOf(A.tables, 305);
    eq('存量车车头名冻结', seats[0]?.nickname, '老车头');
    eq('其他座位照常改名', seats[1]?.nickname, '老队员改');
  });
});
