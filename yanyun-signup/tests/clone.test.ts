// Clone a grouping ("run it again"): copies a car's configuration
// and its seat roster into a new car. Seat rules under test (the
// #124 roster-only closure applied to copies, see clone.ts):
//  1) A stamped seat is copied under its owner's CURRENT identity
//     name, stamp intact (the name lock follows renames).
//  2) A stamped seat whose identity no longer resolves keeps its
//     stored name frozen, stamp intact (the seat-edit freeze rule).
//  3) An unstamped name resolving through the identity chain or the
//     game-name roster is copied under the resolved name, unstamped.
//  4) An unstamped name resolving to NOBODY is skipped — the clone
//     still succeeds and the skipped names ride the payload back to
//     the operator.
//  5) Gate: only the source car's leader or an admin of its guild
//     may clone; the new car's creator is the operator.
//  6) Configuration carries (type/dungeon/capacity/visitor settings
//     and the custom-field DEFINITIONS; answers and ready marks do
//     not), and the default start rule (same weekday + time-of-day
//     in the operator's zone, nearest future one) is unit-pinned.
// Real yoga + real resolvers against a shape-routed FakeDB (the
// namelock harness, extended with the custom-fields table).
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { nextCloneDefaultStart } from '../src/domains/groupings/clone.ts';

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
    settings: new Map(fx.settings || []),
    users: (fx.users || []).map((u) => ({ ...u })),
    nicks: (fx.nicks || []).map((r) => ({ ...r })),
    events: (fx.events || []).map((e) => ({ ...e })),
    signups: (fx.signups || []).map((r) => ({ ...r })),
    guildMembers: (fx.guildMembers || []).map((r) => ({ ...r })),
    rosterEntries: (fx.rosterEntries || []).map((r) => ({ ...r })),
    customFields: (fx.customFields || []).map((r) => ({ ...r })),
    mint: new Map(),
  };
  let nextId = 5000;
  const unknownSql = new Set();

  function norm(sql) {
    return sql.replace(/"/g, '').replace(/\b(tenants|settings|users|events|signups|guild_members|user_guild_nicks|guild_roster_entries|grouping_custom_fields)\./g, '').replace(/\s+/g, ' ');
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
      else if (table === 'grouping_custom_fields') tables.customFields.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
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
    if (/^DELETE FROM grouping_custom_fields/i.test(sql)) {
      const before = tables.customFields.length;
      tables.customFields = tables.customFields.filter((x) => !(x.owner_kind === b[0] && x.owner_id === Number(b[1])));
      return { meta: { changes: before - tables.customFields.length } };
    }
    if (/\b(CREATE TABLE|ALTER TABLE|PRAGMA)\b/i.test(sql)) return kind === 'run' ? { meta: { changes: 0 } } : (kind === 'first' ? null : { results: [] });

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
    if (/FROM grouping_custom_fields/i.test(sql)) {
      const rows = tables.customFields
        .filter((x) => x.owner_kind === b[0] && x.owner_id === Number(b[1]))
        .sort((a, c) => (a.sort || 0) - (c.sort || 0));
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
const DGID = '666666666666666666';
const GID = { clone: 1030100011 };
const UID = { UL: 2030100051, UA: 2030100052, UM: 2030100053, UR: 2030100054 };
const serversJson = (rows) => JSON.stringify(rows);
const memberServers = serversJson([{ id: DGID, name: '复制测试服', icon: '', permissions: '0', owner: false }]);
const ownerServers = serversJson([{ id: DGID, name: '复制测试服', icon: '', permissions: '0', owner: true }]);

const LEADER = { userId: UID.UL, discordId: 'UL', name: '全局L', guilds: [DGID] };
const ADMIN = { userId: UID.UA, discordId: 'UA', name: '全局Admin', guilds: [DGID] };
const MEMBER = { userId: UID.UM, discordId: 'UM', name: '全局M', guilds: [DGID] };

function baseFx() {
  return {
    tenants: [{ id: GID.clone, slug: 'cloneguild', guild_name: '复制测试百业', slogan: '' }],
    settings: [[`${GID.clone}|discord_guild_id`, DGID]],
    users: [
      { id: UID.UL, discord_id: 'UL', username: '全局L', guilds_json: memberServers },
      { id: UID.UA, discord_id: 'UA', username: '全局Admin', guilds_json: ownerServers },
      { id: UID.UM, discord_id: 'UM', username: '全局M', guilds_json: memberServers },
      { id: UID.UR, discord_id: 'UR', username: '全局R', guilds_json: memberServers },
    ],
    nicks: [
      { discord_id: 'UL', guild_id: DGID, nick: '服昵L' },
      { discord_id: 'UM', guild_id: DGID, nick: '服昵M' },
    ],
    guildMembers: [
      { tenant: GID.clone, discord_id: 'UR', nick: '名册昵R', global_name: '全局R' },
    ],
    rosterEntries: [
      { id: 1, tenant: GID.clone, display_name: '游戏名甲', name_norm: '游戏名甲', source: 'ocr', matched_discord_id: null, created_by_user_id: UID.UL, created_at: 1 },
    ],
  };
}

const SRC_ID = 1030100012;
function srcEvent(over = {}) {
  return {
    id: SRC_ID, tenant: GID.clone, type: 'talent', title: '周三天赋车', description: '', dungeon: '玉魄染青苍',
    max_slots: 5, starts_at: '', starts_at_utc: 1799999999, status: 'completed', origin: 'member',
    creator_user_id: UID.UL, created_by: '热心侠客', created_tz: 'Asia/Shanghai',
    reminder_sent_at: null, reminder_error: null, ally_visible: 1, visitor_slots: 2, ...over,
  };
}
function seatRow(id, nickname, discordId, over = {}) {
  return {
    id, event_id: SRC_ID, nickname, uid: 'u' + id, role: '输出', weapon: '破竹·樽',
    contact: '', note: '', team_name: '', members: '', discord_id: discordId, ready_at: null, is_visitor: 0, ...over,
  };
}
function fullFx() {
  const fx = baseFx();
  fx.events = [srcEvent()];
  fx.signups = [
    seatRow(1, '旧名字M', 'UM', { ready_at: 123 }),          // stamped, renamed since -> current identity name
    seatRow(2, '冻结名', 'UGH'),                              // stamped, identity gone -> frozen
    seatRow(3, '名册昵R', null),                              // unstamped, identity-chain hit
    seatRow(4, '游戏名甲', null),                             // unstamped, game-roster hit
    seatRow(5, '查无此人', null),                             // unstamped, resolves to nobody -> skipped
    seatRow(6, '盟友客', 'UVIS', { is_visitor: 1 }),          // visitor seat, stamp off-guild -> frozen + flagged
  ];
  fx.customFields = [
    { id: 900, owner_kind: 'event', owner_id: SRC_ID, label: '备注', field_type: 'text', options_json: '[]', required: 0, sort: 0 },
    { id: 901, owner_kind: 'event', owner_id: SRC_ID, label: '位置', field_type: 'choice', options_json: '["前排","后排"]', required: 1, sort: 1 },
  ];
  return fx;
}

const cloneMut = `mutation($input: CloneGroupingInput!) {
  cloneGrouping(input: $input) { ok error errorCode skippedNames grouping { id title type status maxSlots startsAt } }
}`;
const detailQuery = `query($slug: String, $id: ID!) {
  groupingDetailPage(slug: $slug, id: $id) { cloneAction { buttonLabel defaultStartsAt } }
}`;
const startsAt = () => String(Math.floor(Date.now() / 1000) + 86400);
let ipSeq = 0;
function makeGql(env) {
  return async (query, { user, variables } = {}) => {
    const ctx = { env, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
    const res = await yoga.fetch(new Request('http://local/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': `10.0.0.${++ipSeq}` },
      body: JSON.stringify({ query, variables }),
    }), ctx);
    return res.json();
  };
}
const seatsOf = (tables, eventId) => tables.signups.filter((r) => r.event_id === eventId);

describe('clone grouping', () => {
  it('copies config, field definitions and the resolved roster; skips nobody-names', async () => {
    const { db, tables } = makeDb(fullFx());
    const gql = makeGql({ DB: db });
    const when = startsAt();
    const r = await gql(cloneMut, { user: LEADER, variables: { input: { groupingId: String(SRC_ID), startsAt: when } } });
    const p = r.data.cloneGrouping;
    check('clone ok', p.ok === true, JSON.stringify(r));
    eq('skipped names reported', JSON.stringify(p.skippedNames), JSON.stringify(['查无此人']));
    const nev = tables.events.find((e) => e.id !== SRC_ID);
    check('new event exists', !!nev);
    eq('type carried', nev.type, 'talent');
    eq('dungeon carried', nev.dungeon, '玉魄染青苍');
    eq('capacity carried', nev.max_slots, 5);
    eq('visitor settings carried', `${nev.ally_visible}/${nev.visitor_slots}`, '1/2');
    eq('title defaults to source', nev.title, '周三天赋车');
    eq('new start applied', nev.starts_at_utc, Number(when));
    eq('creator is the operator', nev.creator_user_id, UID.UL);
    eq('status open', nev.status, 'open');

    const seats = seatsOf(tables, nev.id);
    eq('five of six seats carried', seats.length, 5);
    const byName = Object.fromEntries(seats.map((x) => [x.nickname, x]));
    check('stamped seat follows current identity name', !!byName['服昵M'], JSON.stringify(seats.map((x) => x.nickname)));
    eq('stamped seat keeps its stamp', byName['服昵M'].discord_id, 'UM');
    eq('ready mark not copied', byName['服昵M'].ready_at ?? null, null);
    check('unresolvable stamp frozen', !!byName['冻结名'] && byName['冻结名'].discord_id === 'UGH');
    check('identity-chain seat copied unstamped', !!byName['名册昵R'] && !byName['名册昵R'].discord_id);
    check('game-roster seat copied unstamped', !!byName['游戏名甲'] && !byName['游戏名甲'].discord_id);
    check('visitor seat carried with flag', !!byName['盟友客'] && byName['盟友客'].is_visitor === 1 && byName['盟友客'].discord_id === 'UVIS');
    check('nobody-name absent', !byName['查无此人']);

    const fields = tables.customFields.filter((f) => f.owner_kind === 'event' && f.owner_id === nev.id);
    eq('field definitions copied', fields.length, 2);
    eq('choice options carried', fields.find((f) => f.label === '位置').options_json, '["前排","后排"]');
  });

  it('rejects a plain member and a missing car; an admin may clone', async () => {
    const { db, tables } = makeDb(fullFx());
    const gql = makeGql({ DB: db });
    const byMember = await gql(cloneMut, { user: MEMBER, variables: { input: { groupingId: String(SRC_ID), startsAt: startsAt() } } });
    eq('member rejected', byMember.data.cloneGrouping.ok, false);
    eq('member error code', byMember.data.cloneGrouping.errorCode, 'leaderOnlyEdit');
    const missing = await gql(cloneMut, { user: LEADER, variables: { input: { groupingId: '424242', startsAt: startsAt() } } });
    eq('missing car error', missing.data.cloneGrouping.errorCode, 'groupingNotFound');
    const past = await gql(cloneMut, { user: LEADER, variables: { input: { groupingId: String(SRC_ID), startsAt: '12345' } } });
    eq('past start rejected', past.data.cloneGrouping.errorCode, 'badStartTime');
    const byAdmin = await gql(cloneMut, { user: ADMIN, variables: { input: { groupingId: String(SRC_ID), title: '管理员复制车', startsAt: startsAt() } } });
    check('admin clone ok', byAdmin.data.cloneGrouping.ok === true, JSON.stringify(byAdmin));
    const nev = tables.events.find((e) => e.id !== SRC_ID);
    eq('admin is the new creator', nev.creator_user_id, UID.UA);
    eq('title override applied', nev.title, '管理员复制车');
  });

  it('composes cloneAction only for managers, with the default start', async () => {
    const { db } = makeDb(fullFx());
    const gql = makeGql({ DB: db });
    const asLeader = await gql(detailQuery, { user: LEADER, variables: { slug: 'cloneguild', id: String(SRC_ID) } });
    const action = asLeader.data.groupingDetailPage.cloneAction;
    check('leader sees cloneAction', !!action, JSON.stringify(asLeader).slice(0, 300));
    eq('button label from catalog', action.buttonLabel, '再来一车');
    const def = Number(action.defaultStartsAt);
    check('default start in the future', def > Math.floor(Date.now() / 1000));
    check('default start within 7 days', def <= Math.floor(Date.now() / 1000) + 7 * 86400);
    const asMember = await gql(detailQuery, { user: MEMBER, variables: { slug: 'cloneguild', id: String(SRC_ID) } });
    eq('member gets no cloneAction', asMember.data.groupingDetailPage.cloneAction, null);
  });
});

describe('clone default start rule', () => {
  const utc = (y, mo, d, h, mi = 0) => Math.floor(Date.UTC(y, mo - 1, d, h, mi) / 1000);
  it('same weekday later this week (Asia/Shanghai)', () => {
    // Source: Sat 2026-11-07 20:00 +08; now: Fri 2026-11-06 10:00 +08.
    eq('next saturday', nextCloneDefaultStart(utc(2026, 11, 7, 12), utc(2026, 11, 6, 2), 'Asia/Shanghai'), utc(2026, 11, 7, 12));
  });
  it('same weekday already passed -> next week', () => {
    // Now: Sat 2026-11-07 21:00 +08.
    eq('saturday next week', nextCloneDefaultStart(utc(2026, 11, 7, 12), utc(2026, 11, 7, 13), 'Asia/Shanghai'), utc(2026, 11, 14, 12));
  });
  it('earlier weekday -> the coming one', () => {
    // Now: Sun 2026-11-08 10:00 +08; next Saturday is 11-14.
    eq('coming saturday', nextCloneDefaultStart(utc(2026, 11, 7, 12), utc(2026, 11, 8, 2), 'Asia/Shanghai'), utc(2026, 11, 14, 12));
  });
  it('crosses the US fall-back seam keeping wall time (America/New_York)', () => {
    // Source: Sun 2026-10-25 09:00 EDT (UTC-4); now: Fri 2026-10-30 12:00 EDT.
    // Target: Sun 2026-11-01 09:00 EST (UTC-5) = 14:00 UTC.
    eq('dst seam', nextCloneDefaultStart(utc(2026, 10, 25, 13), utc(2026, 10, 30, 16), 'America/New_York'), utc(2026, 11, 1, 14));
  });
  it('timeless source -> next 20:00 in the zone', () => {
    eq('today 20:00', nextCloneDefaultStart(null, utc(2026, 11, 6, 2), 'Asia/Shanghai'), utc(2026, 11, 6, 12));
    eq('tomorrow 20:00 once passed', nextCloneDefaultStart(null, utc(2026, 11, 6, 13), 'Asia/Shanghai'), utc(2026, 11, 7, 12));
  });
});
