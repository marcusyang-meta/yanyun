// Name lock for every identified person (ruling 2026-11-01,
// generalizing the leader-seat lock in tests/leadername.test.ts):
// a person with a platform identity is displayed in a guild's
// context under their identity-chain name only, and no seat-writing
// surface may store a different name for them.
//  1) updateGrouping seat rewrite: an old seat carrying an identity
//     stamp is forced back to the stamp owner's CURRENT identity
//     name (stamp kept) — for the leader AND for a guild admin.
//  2) A submitted name that resolves to exactly one platform person
//     (unique roster match, then unique bound-server match — the
//     reminder's resolution chain) is rewritten to that person's
//     identity name; the resolution alone never stamps the seat.
//  3) Roster-only seat names (ruling 2026-11-02, superseding the
//     placeholder opening point (3) used to record): a name that
//     resolves to NOBODY — ambiguous names included — rejects the
//     whole save (create or rewrite) with the names listed; nothing
//     is written. Resolution gained a stage: after the identity
//     chain, the guild's game-name roster (guild_roster_entries)
//     counts as a roster, and its recorded display name is stored.
//  4) createGrouping pre-seats follow the same rule (2)/(3), and
//     pre-seating still never stamps another person.
// Self/proxy signup naming was already server-decided and is pinned
// by tests/identity.test.ts; roster/profile name sources have no
// in-tool write surface at all (login snapshots only).
// Real yoga + real resolvers against a shape-routed FakeDB (the
// leadername harness, extended with the guild-wide nick list route
// the server-pool resolution needs).
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';

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
    rosterEntries: (fx.rosterEntries || []).map((r) => ({ ...r })),
    mint: new Map(), // `${type_code}|${day_index}` -> last seq
  };
  let nextId = 5000;
  const unknownSql = new Set();

  function norm(sql) {
    return sql.replace(/"/g, '').replace(/\b(tenants|settings|users|events|signups|guild_members|user_guild_nicks|guild_roster_entries)\./g, '').replace(/\s+/g, ' ');
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
      // Guild-wide list (the name-resolution server pool): one bind.
      if (!/discord_id = \?/i.test(sql)) {
        const rows = tables.nicks.filter((n) => n.guild_id === String(b[0]));
        return kind === 'first' ? (rows[0] ?? null) : all(rows);
      }
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
    if (/FROM guild_roster_entries/i.test(sql)) {
      const rows = tables.rosterEntries.filter((x) => x.tenant === b[0]);
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

/* ---------------- fixtures ---------------- */
const DGID = '555555555555555555';
const GID = { namelock: 1030100009 };
const UID = { UL: 2030100041, UA: 2030100042, UM: 2030100043, UR: 2030100044, US: 2030100045 };
const serversJson = (rows) => JSON.stringify(rows);
const memberServers = serversJson([{ id: DGID, name: '全员锁名测试服', icon: '', permissions: '0', owner: false }]);
const ownerServers = serversJson([{ id: DGID, name: '全员锁名测试服', icon: '', permissions: '0', owner: true }]);

const LEADER = { userId: UID.UL, discordId: 'UL', name: '全局L', guilds: [DGID] };
const ADMIN = { userId: UID.UA, discordId: 'UA', name: '全局Admin', guilds: [DGID] };

function baseFx() {
  return {
    tenants: [{ id: GID.namelock, slug: 'namelock', guild_name: '全员锁名测试百业', slogan: '' }],
    settings: [[`${GID.namelock}|discord_guild_id`, DGID]],
    users: [
      { id: UID.UL, discord_id: 'UL', username: '全局L', guilds_json: memberServers },
      { id: UID.UA, discord_id: 'UA', username: '全局Admin', guilds_json: ownerServers },
      { id: UID.UM, discord_id: 'UM', username: '全局M', guilds_json: memberServers },
      { id: UID.UR, discord_id: 'UR', username: '全局R', guilds_json: memberServers },
      { id: UID.US, discord_id: 'US', username: '全局S', guilds_json: memberServers },
    ],
    nicks: [
      { discord_id: 'UL', guild_id: DGID, nick: '服昵L' },
      { discord_id: 'UM', guild_id: DGID, nick: '服昵M' },
      { discord_id: 'US', guild_id: DGID, nick: '服昵S' },
    ],
    guildMembers: [
      { tenant: GID.namelock, discord_id: 'UR', nick: '名册昵R', global_name: '全局R' },
      { tenant: GID.namelock, discord_id: 'UAMB1', nick: '', global_name: '重名' },
      { tenant: GID.namelock, discord_id: 'UAMB2', nick: '', global_name: '重名' },
    ],
    // Game-name roster (screenshot-imported names): one unlinked
    // entry, one linked to UR whose game name differs from every
    // Discord-side name UR carries.
    rosterEntries: [
      { id: 1, tenant: GID.namelock, display_name: '游戏名甲', name_norm: '游戏名甲', source: 'ocr', matched_discord_id: null, created_by_user_id: UID.UL, created_at: 1 },
      { id: 2, tenant: GID.namelock, display_name: '游戏里的R', name_norm: '游戏里的r', source: 'ocr', matched_discord_id: 'UR', created_by_user_id: UID.UL, created_at: 1 },
    ],
  };
}

function evRow(id, over = {}) {
  return {
    id, tenant: GID.namelock, type: 'activity', title: '车' + id, description: '', dungeon: '',
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

describe('name lock for every identified person', () => {

  it('update: leader renaming a stamped member seat is written back', async () => {
    const A = makeDb({
      ...baseFx(),
      events: [evRow(401)],
      signups: [
        seatRow(1, 401, '服昵L', 'UL'),
        seatRow(2, 401, '服昵M', 'UM', '鸣金·虹'),
      ],
    });
    const gql = makeGql({ DB: A.db });
    const r = await gql(updateMut, {
      user: LEADER,
      variables: {
        id: '401',
        input: {
          seats: [
            { nickname: '服昵L', weapon: '破竹·樽' },
            { nickname: '冒充M的名字', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('编辑 ok', r.data?.updateGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const seats = seatsOf(A.tables, 401);
    eq('带戳成员名被写回身份名', seats[1]?.nickname, '服昵M');
    eq('成员身份戳保留', seats[1]?.discord_id, 'UM');
  });

  it('update: a guild admin is bound by the lock for member seats too', async () => {
    const A = makeDb({
      ...baseFx(),
      events: [evRow(402)],
      signups: [
        seatRow(1, 402, '服昵L', 'UL'),
        seatRow(2, 402, '服昵M', 'UM', '鸣金·虹'),
      ],
    });
    const gql = makeGql({ DB: A.db });
    const r = await gql(updateMut, {
      user: ADMIN,
      variables: {
        id: '402',
        input: {
          seats: [
            { nickname: '服昵L', weapon: '破竹·樽' },
            { nickname: '管理员乱改', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('管理员编辑 ok', r.data?.updateGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const seats = seatsOf(A.tables, 402);
    eq('管理员也改不动带戳成员名', seats[1]?.nickname, '服昵M');
    eq('成员身份戳保留', seats[1]?.discord_id, 'UM');
  });

  it('update: a stamped seat follows the owner’s current identity name', async () => {
    const fx = baseFx();
    fx.nicks = fx.nicks.map((n) => (n.discord_id === 'UM' ? { ...n, nick: '新服昵M' } : n));
    const A = makeDb({
      ...fx,
      events: [evRow(403)],
      signups: [
        seatRow(1, 403, '服昵L', 'UL'),
        seatRow(2, 403, '服昵M', 'UM', '鸣金·虹'),
      ],
    });
    const gql = makeGql({ DB: A.db });
    const r = await gql(updateMut, {
      user: LEADER,
      variables: {
        id: '403',
        input: {
          seats: [
            { nickname: '服昵L', weapon: '破竹·樽' },
            { nickname: '服昵M', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('编辑 ok', r.data?.updateGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const seats = seatsOf(A.tables, 403);
    eq('成员改名后座位名跟随当前身份名', seats[1]?.nickname, '新服昵M');
    eq('成员身份戳保留', seats[1]?.discord_id, 'UM');
  });

  it('update: a name uniquely matching a roster member is rewritten to the roster identity name', async () => {
    const A = makeDb({
      ...baseFx(),
      events: [evRow(404)],
      signups: [
        seatRow(1, 404, '服昵L', 'UL'),
        seatRow(2, 404, '旧占位', null, '鸣金·虹'),
      ],
    });
    const gql = makeGql({ DB: A.db });
    const r = await gql(updateMut, {
      user: LEADER,
      variables: {
        id: '404',
        input: {
          seats: [
            { nickname: '服昵L', weapon: '破竹·樽' },
            // UR's roster global name; UR's identity name in this
            // guild is the roster nickname 名册昵R.
            { nickname: '全局R', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('编辑 ok', r.data?.updateGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const seats = seatsOf(A.tables, 404);
    eq('唯一命中名册的名字被改写为身份名', seats[1]?.nickname, '名册昵R');
    eq('仅凭解析命中不盖戳', seats[1]?.discord_id ?? null, null);
  });

  it('update: a name uniquely matching a bound-server member is rewritten to the server identity name', async () => {
    const A = makeDb({
      ...baseFx(),
      events: [evRow(405)],
      signups: [
        seatRow(1, 405, '服昵L', 'UL'),
        seatRow(2, 405, '旧占位', null, '鸣金·虹'),
      ],
    });
    const gql = makeGql({ DB: A.db });
    const r = await gql(updateMut, {
      user: LEADER,
      variables: {
        id: '405',
        input: {
          seats: [
            { nickname: '服昵L', weapon: '破竹·樽' },
            // US is not on this guild's roster; US's global name
            // matches uniquely in the bound-server pool and US's
            // identity name is the server nickname 服昵S.
            { nickname: '全局S', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('编辑 ok', r.data?.updateGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const seats = seatsOf(A.tables, 405);
    eq('唯一命中同服成员的名字被改写为身份名', seats[1]?.nickname, '服昵S');
    eq('仅凭解析命中不盖戳', seats[1]?.discord_id ?? null, null);
  });

  it('update: an ambiguous name resolves to nobody and rejects the whole save', async () => {
    const A = makeDb({
      ...baseFx(),
      events: [evRow(406)],
      signups: [
        seatRow(1, 406, '服昵L', 'UL'),
        seatRow(2, 406, '旧占位', null, '鸣金·虹'),
      ],
    });
    const gql = makeGql({ DB: A.db });
    const r = await gql(updateMut, {
      user: LEADER,
      variables: {
        id: '406',
        input: {
          seats: [
            { nickname: '服昵L', weapon: '破竹·樽' },
            // Two roster members share this global name — it cannot
            // be resolved to one person on any roster.
            { nickname: '重名', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('编辑被拒', r.data?.updateGrouping?.ok, false, JSON.stringify(r.errors || r.data).slice(0, 240));
    eq('错误码', r.data?.updateGrouping?.errorCode, 'seatNamesNotInRoster');
    check('错误列出未解析的名字', String(r.data?.updateGrouping?.error || '').includes('重名'), String(r.data?.updateGrouping?.error || ''));
    const seats = seatsOf(A.tables, 406);
    eq('旧座位原样未动', seats.map((x) => x.nickname).join(','), '服昵L,旧占位');
  });

  it('update: a placeholder name resolving to nobody rejects the whole save, patch included', async () => {
    const A = makeDb({
      ...baseFx(),
      events: [evRow(407)],
      signups: [
        seatRow(1, 407, '服昵L', 'UL'),
        seatRow(2, 407, '旧占位', null, '鸣金·虹'),
      ],
    });
    const gql = makeGql({ DB: A.db });
    const r = await gql(updateMut, {
      user: LEADER,
      variables: {
        id: '407',
        input: {
          title: '不该落库的标题',
          seats: [
            { nickname: '服昵L', weapon: '破竹·樽' },
            { nickname: '路人甲', weapon: '鸣金·虹' },
            { nickname: '路人乙', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('编辑被拒', r.data?.updateGrouping?.ok, false, JSON.stringify(r.errors || r.data).slice(0, 240));
    eq('错误码', r.data?.updateGrouping?.errorCode, 'seatNamesNotInRoster');
    const errText = String(r.data?.updateGrouping?.error || '');
    check('错误列出全部未解析的名字', errText.includes('路人甲') && errText.includes('路人乙'), errText);
    eq('连标题补丁也不落库', A.tables.events.find((e) => e.id === 407)?.title, '车407');
    const seats = seatsOf(A.tables, 407);
    eq('旧座位原样未动', seats.map((x) => x.nickname).join(','), '服昵L,旧占位');
  });

  it('update: a seat can be re-pointed to a game-name roster entry', async () => {
    const A = makeDb({
      ...baseFx(),
      events: [evRow(408)],
      signups: [
        seatRow(1, 408, '服昵L', 'UL'),
        seatRow(2, 408, '旧占位', null, '鸣金·虹'),
      ],
    });
    const gql = makeGql({ DB: A.db });
    const r = await gql(updateMut, {
      user: LEADER,
      variables: {
        id: '408',
        input: {
          seats: [
            { nickname: '服昵L', weapon: '破竹·樽' },
            // On the game-name roster only (no platform identity):
            // seated under the roster's recorded display name; the
            // OCR-style spaced submission still matches by the
            // roster's normalized equality.
            { nickname: '游 戏名甲', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('编辑 ok', r.data?.updateGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const seats = seatsOf(A.tables, 408);
    eq('落库为游戏名名册记录名', seats[1]?.nickname, '游戏名甲');
    eq('游戏名名册落座不盖戳', seats[1]?.discord_id ?? null, null);
  });

  it('create: a pre-seat name uniquely matching a roster member is rewritten, never stamped', async () => {
    const A = makeDb(baseFx());
    const gql = makeGql({ DB: A.db });
    const r = await gql(createMut, {
      user: LEADER,
      variables: {
        input: {
          slug: 'namelock', title: '预置锁名车', type: 'ACTIVITY', startsAt: startsAt(), dungeonId: null,
          seats: [
            { nickname: '车头随便写', weapon: '破竹·樽' },
            { nickname: '全局R', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('发车 ok', r.data?.createGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const evId = Number(r.data?.createGrouping?.grouping?.id);
    const seats = seatsOf(A.tables, evId);
    eq('座位数', seats.length, 2);
    eq('车头位落库为身份名', seats[0]?.nickname, '服昵L');
    eq('预置命中名册者改写为身份名', seats[1]?.nickname, '名册昵R');
    eq('预置他人不盖戳', seats[1]?.discord_id ?? null, null);
  });

  it('create: a placeholder pre-seat rejects the whole create, no car left behind', async () => {
    const A = makeDb(baseFx());
    const gql = makeGql({ DB: A.db });
    const r = await gql(createMut, {
      user: LEADER,
      variables: {
        input: {
          slug: 'namelock', title: '占位发车', type: 'ACTIVITY', startsAt: startsAt(), dungeonId: null,
          seats: [
            { nickname: '车头随便写', weapon: '破竹·樽' },
            { nickname: '全局R', weapon: '鸣金·虹' },
            { nickname: '路人甲', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('发车被拒', r.data?.createGrouping?.ok, false, JSON.stringify(r.errors || r.data).slice(0, 240));
    eq('错误码', r.data?.createGrouping?.errorCode, 'seatNamesNotInRoster');
    check('错误列出未解析的名字', String(r.data?.createGrouping?.error || '').includes('路人甲'), String(r.data?.createGrouping?.error || ''));
    eq('没有留下车', A.tables.events.length, 0);
    eq('没有留下座位', A.tables.signups.length, 0);
  });

  it('create: game-name roster pre-seats land under the roster entry names', async () => {
    const A = makeDb(baseFx());
    const gql = makeGql({ DB: A.db });
    const r = await gql(createMut, {
      user: LEADER,
      variables: {
        input: {
          slug: 'namelock', title: '游戏名名册车', type: 'ACTIVITY', startsAt: startsAt(), dungeonId: null,
          seats: [
            { nickname: '车头随便写', weapon: '破竹·樽' },
            { nickname: '游戏名甲', weapon: '鸣金·虹' },
            // The entry is linked to UR, but the stored name is the
            // game-name roster's own recorded name, not UR's
            // Discord-side identity name.
            { nickname: '游戏里的R', weapon: '鸣金·虹' },
          ],
        },
      },
    });
    eq('发车 ok', r.data?.createGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 240));
    const evId = Number(r.data?.createGrouping?.grouping?.id);
    const seats = seatsOf(A.tables, evId);
    eq('座位数', seats.length, 3);
    eq('无链接条目落库为名册记录名', seats[1]?.nickname, '游戏名甲');
    eq('无链接条目不盖戳', seats[1]?.discord_id ?? null, null);
    eq('有链接条目落库为游戏名而非身份名', seats[2]?.nickname, '游戏里的R');
    eq('预置他人不盖戳 (链接也不盖)', seats[2]?.discord_id ?? null, null);
  });
});
