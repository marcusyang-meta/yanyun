// Weekly squad image data channel (ogGuildCard.weekCars) + the
// list page's week-share fields. Rules under test:
//  1) The window is half-open [fromUtc, toUtc): a car starting
//     exactly at toUtc belongs to the NEXT week and is excluded,
//     even though the week-view repository's upper bound is <=
//     (the shell's filter is authoritative).
//  2) The image records the whole week: open, closed and completed
//     cars ride (status passthrough lets the renderer mark finished
//     ones); draft and timeless cars never reach the image, other
//     guilds' cars neither, and disbanded cars are deleted rows, so
//     they cannot appear at all.
//  3) Rows ride in departure order with card fields only; the
//     leader name resolves through the identity chain (guild
//     nick first) and falls back to the creation-time stamp.
//  4) The list page composes the week's share image URL, the
//     guild's canonical URL and the catalog share text.
// Real yoga + real resolvers against a shape-routed FakeDB (the
// namelock harness, extended with the week-view route).
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
    if (/FROM events e WHERE/i.test(sql) && /signup_count/i.test(sql)) {
      let rows = tables.events.filter((e) => e.tenant === b[0]);
      let bi = 1;
      const notIn = /e\.status NOT IN \(([^)]+)\)/i.exec(sql);
      if (notIn) {
        const excluded = [...notIn[1].matchAll(/'(\w+)'/g)].map((x) => x[1]);
        rows = rows.filter((e) => !excluded.includes(e.status));
      }
      if (/e\.type = \?/i.test(sql)) { rows = rows.filter((e) => e.type === b[bi]); bi++; }
      if (/e\.starts_at_utc >= \?/i.test(sql)) { rows = rows.filter((e) => e.starts_at_utc != null && e.starts_at_utc >= b[bi]); bi++; }
      if (/e\.starts_at_utc <= \?/i.test(sql)) { rows = rows.filter((e) => e.starts_at_utc != null && e.starts_at_utc <= b[bi]); bi++; }
      return all(rows.map((e) => ({ ...e, signup_count: tables.signups.filter((r) => r.event_id === e.id).length })));
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
const GID = 1030100031;
const UID = { UL: 2030100071, UM: 2030100073 };
const serversJson = (rows) => JSON.stringify(rows);
const memberServers = serversJson([{ id: DGID, name: '周图测试服', icon: '', permissions: '0', owner: false }]);
const MEMBER = { userId: UID.UM, discordId: 'UM', name: '全局M', guilds: [DGID] };

const FROM = 1800000000;
const TO = FROM + 7 * 86400;
// Event keys are listed in the events entity's column order (the
// week-view query selects e.*, read back positionally) with
// signup_count appended by the route.
function ev(id, over = {}) {
  return {
    id, tenant: GID, title: '车' + id, type: 'activity', description: '',
    starts_at: '', meet_info: '', max_slots: 10, status: 'open', created_at: 1,
    starts_at_utc: FROM + 3600, origin: 'member', created_by: '旧戳名', manage_code: '',
    dungeon: '无', creator_user_id: UID.UL, created_tz: 'Asia/Shanghai',
    reminder_sent_at: null, reminder_error: null, ally_visible: 0, visitor_slots: 0, ...over,
  };
}
function seatRow(id, eventId) {
  return {
    id, event_id: eventId, nickname: '乘客' + id, uid: 'u' + id, role: '输出', weapon: '',
    contact: '', note: '', team_name: '', members: '', discord_id: null, ready_at: null, is_visitor: 0,
  };
}
function baseFx() {
  return {
    tenants: [{ id: GID, slug: 'weekguild', guild_name: '周图测试百业', slogan: '' }],
    settings: [[`${GID}|discord_guild_id`, DGID]],
    users: [
      { id: UID.UL, discord_id: 'UL', username: '全局L', guilds_json: memberServers },
      { id: UID.UM, discord_id: 'UM', username: '全局M', guilds_json: memberServers },
    ],
    nicks: [],
    guildMembers: [
      { tenant: GID, discord_id: 'UL', nick: '服昵L', global_name: '全局L' },
      { tenant: GID, discord_id: 'UM', nick: '服昵M', global_name: '全局M' },
    ],
    rosterEntries: [],
    customFields: [],
    events: [
      ev(1, { title: '边界早车', starts_at_utc: FROM }),
      ev(2, { title: '压线晚车', type: 'race', starts_at_utc: TO - 1 }),
      ev(3, { title: '下周车', starts_at_utc: TO }),
      ev(4, { title: '已截止车', status: 'closed', starts_at_utc: FROM + 100 }),
      ev(5, { title: '已完成车', status: 'completed', starts_at_utc: FROM + 200 }),
      ev(6, { title: '无时间车', starts_at_utc: null }),
      ev(7, { title: '别家车', tenant: 999, starts_at_utc: FROM + 300 }),
      ev(8, { title: '佚名车头车', starts_at_utc: FROM + 50, creator_user_id: null, created_by: '热心侠客' }),
      ev(9, { title: '草稿车', status: 'draft', starts_at_utc: FROM + 400 }),
    ],
    signups: [seatRow(1, 1), seatRow(2, 1), seatRow(3, 2)],
  };
}

const weekQuery = `query($slug: String!, $from: Int!, $to: Int!) {
  ogGuildCard(slug: $slug) {
    exists
    weekCars(fromUtc: $from, toUtc: $to) {
      title type dungeonName startsAtUtc cardTimeText occupiedCount maxSlots leaderName status
    }
  }
}`;
const listQuery = `query($slug: String!) {
  groupingListPage(slug: $slug, tab: ACTIVITY) {
    weekShareImageLabel weekShareImageUrl weekShareText weekShareUrl
  }
}`;
let ipSeq = 200;
function makeGql(env) {
  return async (query, { user, variables } = {}) => {
    const ctx = { env, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
    const res = await yoga.fetch(new Request('http://local/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': `10.0.2.${++ipSeq}` },
      body: JSON.stringify({ query, variables }),
    }), ctx);
    return res.json();
  };
}

describe('weekly squad image data channel', () => {
  it('selects the week cars that happened or will happen, in departure order', async () => {
    const { db } = makeDb(baseFx());
    const gql = makeGql({ DB: db });
    const r = await gql(weekQuery, { variables: { slug: 'weekguild', from: FROM, to: TO } });
    const cars = r.data.ogGuildCard.weekCars;
    eq('five cars ride', cars.length, 5);
    eq('departure order', JSON.stringify(cars.map((c) => c.title)), JSON.stringify(['边界早车', '佚名车头车', '已截止车', '已完成车', '压线晚车']));
    const first = cars[0];
    eq('boundary car included', first.startsAtUtc, FROM);
    eq('occupied from signup rows', first.occupiedCount, 2);
    eq('capacity passthrough', first.maxSlots, 10);
    check('dual-zone card time', first.cardTimeText.includes('美东') && first.cardTimeText.includes('美西'), first.cardTimeText);
    eq('leader name via guild nick', first.leaderName, '服昵L');
    eq('leader fallback to creation stamp', cars[1].leaderName, '热心侠客');
    eq('open status passthrough', first.status, 'open');
    eq('closed car rides with its status', cars[2].status, 'closed');
    eq('completed car rides with its status', cars[3].status, 'completed');
    eq('race type passthrough', cars[4].type, 'race');
    eq('late car occupied', cars[4].occupiedCount, 1);
  });

  it('unknown guild yields no cars', async () => {
    const { db } = makeDb(baseFx());
    const gql = makeGql({ DB: db });
    const r = await gql(weekQuery, { variables: { slug: 'nosuchguild', from: FROM, to: TO } });
    eq('exists false', r.data.ogGuildCard.exists, false);
    eq('no cars', r.data.ogGuildCard.weekCars.length, 0);
  });

  it('composes the list page week-share fields', async () => {
    const { db } = makeDb(baseFx());
    const gql = makeGql({ DB: db });
    const r = await gql(listQuery, { user: MEMBER, variables: { slug: 'weekguild' } });
    const p = r.data.groupingListPage;
    check('list page composed', !!p, JSON.stringify(r).slice(0, 300));
    eq('image url', p.weekShareImageUrl, 'https://og.yanyun.app/og/weekguild/week.png');
    eq('landing url', p.weekShareUrl, 'https://yanyun.app/weekguild');
    eq('share text', p.weekShareText, '周图测试百业 本周车队图');
    eq('button label', p.weekShareImageLabel, '本周车队图');
  });
});
