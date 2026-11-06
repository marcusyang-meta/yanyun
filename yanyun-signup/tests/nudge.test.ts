// Sign-up nudge copy (free feature): the detail page composes the
// nudge text for the car's managers only. Rules under test:
//  1) Candidates = the guild roster minus members already signed
//     up for this car, where "signed up" is judged ONLY by the
//     identity stamps on the car's seats — the P8 targeted nudge's
//     'all' segment caliber (ops.ts). A member seated by proxy
//     without a stamp is therefore still nudged.
//  2) The text is composed on the server: the car title, the
//     departure time in the share-surface dual-zone format, and
//     the candidates as real Discord mentions (<@id>) — the
//     class-A mention path. The platform sends nothing itself.
//  3) Everyone signed up -> text null + the catalog empty text.
// Real yoga + real resolvers against a shape-routed FakeDB (the
// namelock harness).
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
const GID = 1030100021;
const UID = { UL: 2030100061, UA: 2030100062, UM: 2030100063 };
const serversJson = (rows) => JSON.stringify(rows);
const memberServers = serversJson([{ id: DGID, name: '催报名测试服', icon: '', permissions: '0', owner: false }]);
const ownerServers = serversJson([{ id: DGID, name: '催报名测试服', icon: '', permissions: '0', owner: true }]);

const LEADER = { userId: UID.UL, discordId: 'UL', name: '全局L', guilds: [DGID] };
const ADMIN = { userId: UID.UA, discordId: 'UA', name: '全局Admin', guilds: [DGID] };
const MEMBER = { userId: UID.UM, discordId: 'UM', name: '全局M', guilds: [DGID] };

const CAR_ID = 1030100022;
function baseFx(signups) {
  return {
    tenants: [{ id: GID, slug: 'nudgeguild', guild_name: '催报名测试百业', slogan: '' }],
    settings: [[`${GID}|discord_guild_id`, DGID]],
    users: [
      { id: UID.UL, discord_id: 'UL', username: '全局L', guilds_json: memberServers },
      { id: UID.UA, discordId: undefined, discord_id: 'UA', username: '全局Admin', guilds_json: ownerServers },
      { id: UID.UM, discord_id: 'UM', username: '全局M', guilds_json: memberServers },
    ],
    nicks: [{ discord_id: 'UL', guild_id: DGID, nick: '服昵L' }],
    guildMembers: [
      { tenant: GID, discord_id: 'D1', nick: '阿一', global_name: '全局一' },
      { tenant: GID, discord_id: 'D2', nick: '', global_name: '阿二' },
      { tenant: GID, discord_id: 'D3', nick: '阿三', global_name: '全局三' },
      { tenant: GID, discord_id: 'UL', nick: '服昵L', global_name: '全局L' },
    ],
    rosterEntries: [],
    customFields: [],
    events: [{
      id: CAR_ID, tenant: GID, type: 'activity', title: '周六双十车', description: '', dungeon: '无',
      max_slots: 10, starts_at: '', starts_at_utc: 1799999999, status: 'open', origin: 'member',
      creator_user_id: UID.UL, created_by: '服昵L', created_tz: 'Asia/Shanghai',
      reminder_sent_at: null, reminder_error: null, ally_visible: 0, visitor_slots: 0,
    }],
    signups,
  };
}
function seatRow(id, nickname, discordId) {
  return {
    id, event_id: CAR_ID, nickname, uid: 'u' + id, role: '输出', weapon: '破竹·樽',
    contact: '', note: '', team_name: '', members: '', discord_id: discordId, ready_at: null, is_visitor: 0,
  };
}

const detailQuery = `query($slug: String, $id: ID!) {
  groupingDetailPage(slug: $slug, id: $id) {
    nudgeCopy { buttonLabel dialogTitle hintText text emptyText copyLabel copiedToast candidateCount }
  }
}`;
let ipSeq = 100;
function makeGql(env, locale = 'zh-CN') {
  return async (query, { user, variables } = {}) => {
    const ctx = { env, request: new Request('http://local/graphql'), user, locale, browserLocale: locale, tz: 'Asia/Shanghai', executionCtx: undefined };
    const res = await yoga.fetch(new Request('http://local/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': `10.0.1.${++ipSeq}` },
      body: JSON.stringify({ query, variables }),
    }), ctx);
    return res.json();
  };
}

describe('sign-up nudge copy', () => {
  it('composes mentions for roster members not signed up (stamp caliber)', async () => {
    const fx = baseFx([
      seatRow(1, '阿二', 'D2'),        // stamped signup -> excluded
      seatRow(2, '阿三', null),        // proxy seat, no stamp -> still nudged
    ]);
    const { db } = makeDb(fx);
    const gql = makeGql({ DB: db });
    const r = await gql(detailQuery, { user: LEADER, variables: { slug: 'nudgeguild', id: String(CAR_ID) } });
    const n = r.data.groupingDetailPage.nudgeCopy;
    check('nudgeCopy composed for the leader', !!n, JSON.stringify(r).slice(0, 300));
    eq('button label', n.buttonLabel, '催报名');
    eq('candidate count', n.candidateCount, 3);
    check('text names the car', n.text.includes('周六双十车'), n.text);
    check('time in dual-zone share format', n.text.includes('美东') && n.text.includes('美西'), n.text);
    check('unsigned member mentioned', n.text.includes('<@D1>'), n.text);
    check('proxy-seated member still mentioned', n.text.includes('<@D3>'), n.text);
    check('leader themself mentioned (roster caliber)', n.text.includes('<@UL>'), n.text);
    check('stamped member not mentioned', !n.text.includes('<@D2>'), n.text);
    eq('emptyText null while candidates exist', n.emptyText, null);
  });

  it('is null for a plain member and composed for a guild admin', async () => {
    const { db } = makeDb(baseFx([]));
    const gql = makeGql({ DB: db });
    const asMember = await gql(detailQuery, { user: MEMBER, variables: { slug: 'nudgeguild', id: String(CAR_ID) } });
    eq('member gets null', asMember.data.groupingDetailPage.nudgeCopy, null);
    const asAdmin = await gql(detailQuery, { user: ADMIN, variables: { slug: 'nudgeguild', id: String(CAR_ID) } });
    check('admin composed', !!asAdmin.data.groupingDetailPage.nudgeCopy, JSON.stringify(asAdmin).slice(0, 300));
  });

  it('everyone signed up -> no text, catalog empty text instead', async () => {
    const fx = baseFx([
      seatRow(1, '阿一', 'D1'), seatRow(2, '阿二', 'D2'),
      seatRow(3, '阿三', 'D3'), seatRow(4, '服昵L', 'UL'),
    ]);
    const { db } = makeDb(fx);
    const gql = makeGql({ DB: db });
    const r = await gql(detailQuery, { user: LEADER, variables: { slug: 'nudgeguild', id: String(CAR_ID) } });
    const n = r.data.groupingDetailPage.nudgeCopy;
    check('still composed for a manager', !!n);
    eq('candidate count zero', n.candidateCount, 0);
    eq('text null', n.text, null);
    eq('empty text from catalog', n.emptyText, '名册成员都已报名，没有需要催的伙伴。');
  });

  it('composes the English message under the en locale', async () => {
    const { db } = makeDb(baseFx([]));
    const gql = makeGql({ DB: db }, 'en');
    const r = await gql(detailQuery, { user: LEADER, variables: { slug: 'nudgeguild', id: String(CAR_ID) } });
    const n = r.data.groupingDetailPage.nudgeCopy;
    check('en text composed', !!n && typeof n.text === 'string' && n.text.includes('departs at'), n && n.text);
    check('en mentions present', n.text.includes('<@D1>'), n.text);
    eq('en button label', n.buttonLabel, 'Sign-up nudge');
  });
});
