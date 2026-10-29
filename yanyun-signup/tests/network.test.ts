// Cross-guild network line acceptance (P19 fill market + P20 alliances):
//  - P19 edge matrix: supply edge is FREE (a free-tier guild's member
//    publishes and answers invitations with the paygate ON); demand
//    edge is T3 (with the paygate ON a below-tier guild composes
//    FillDemandLocked with zero demand data; with it OFF the demand
//    field resolves null — the surface does not exist, 2026-10-28
//    zero-footprint ruling; its demand mutations answer
//    premiumRequired in both states — the converged tierLocked is
//    a pure entitlement verdict that never consults the paygate
//    switch; granted guilds verify through hub tier grants);
//  - matching chain: publish -> request -> invite -> accept (matches,
//    seats NOBODY) -> the leader's manual seatFillSupplier writes the
//    seat through the capacity guard; duplicate / self / non-manager
//    attempts all refuse with stable codes;
//  - P20 relation matrix: admin invite -> target admin accept ->
//    ally-visible squads appear on the ally's page and take visitor
//    signups (quota enforced) -> dissolve revokes at read time
//    (feed empty, joins refuse allyNotAllied);
//  - P20 tier matrix: alliances are T3 — with the paygate ON a
//    below-tier guild's member composes GuildAlliesLocked (tier
//    copy, zero alliance data); with it OFF the guildAllies field
//    and the home allies-tab label resolve null (zero footprint).
//    Invite / accept / the sharing switch / visitor joins answer
//    premiumRequired in both states; the exit paths (reject,
//    dissolve) never consult a tier, proven by lapsing the
//    granted guild (paidtest, plan t3) mid-alliance (allytest
//    stays the below-tier guild throughout);
//  - cross-guild power lines: another guild's admin cannot manage
//    this guild's requests, sharing or alliances (tenant-scoped
//    repositories + the shared manage verdict resolved per-event).
// Real yoga + real resolvers + FakeDB routed by SQL shape (the
// recruit pattern).
import { yoga } from '../src/graphql.ts';
import { describe, it, expect, afterAll } from 'vitest';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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

/* ================= FakeDB ================= */
const DGID_A = '111111111111111111';
const DGID_B = '222222222222222222';
const DGID_C = '333333333333333333';
const DGID_D = '444444444444444444';
/* Typed-ID fixture keys: guilds/users carry their 0036 primary keys;
   Discord-space values (server ids, seat stamps) stay Discord IDs. */
const GID = { nettest: 1030100001, allytest: 1030100002, thirdtest: 1030100003, paidtest: 1030100004 };
const UID = { UA: 2030100001, UL: 2030100002, UB: 2030100003, UD: 2030100004, US: 2030100005, UM: 2030100006, UN: 2030100007, UC: 2030100008, UP1: 2030100009, UP2: 2030100010, UP3: 2030100011, UX: 2030100012 };
function makeDb(fx = {}) {
  const tables = {
    tenants: (fx.tenants || []).map((t) => ({ ...t })),
    settings: new Map(fx.settings || []),
    users: (fx.users || []).map(([did, gj]) => ({ id: UID[did] || 0, discord_id: did, username: '', guilds_json: gj })),
    mint: new Map(),
    guildMembers: (fx.guildMembers || []).map((m) => ({ ...m })),
    events: (fx.events || []).map((e) => ({ ...e })),
    signups: (fx.signups || []).map((x) => ({ ...x })),
    entitlements: (fx.entitlements || []).map((e) => ({ ...e })),
    offers: [],
    requests: [],
    invites: [],
    alliances: [],
  };
  let nextId = 9000;
  function norm(sql) {
    return sql.replace(/"(\w+)"\."(\w+)"/g, '$2').replace(/"/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function parseCols(list) { return list.split(',').map((c) => c.trim().split('.').pop()); }
  function applySets(rows, setList, b) {
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
    for (const r of rows) Object.assign(r, sets);
    return bi;
  }
  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    if (/^INSERT INTO id_mint_counters/i.test(sql)) {
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
      const store = { fill_offers: tables.offers, fill_requests: tables.requests, fill_invites: tables.invites, guild_alliances: tables.alliances }[table];
      if (!store) {
        if (table === 'users') { if (!tables.users.some((u) => u.discord_id === row.discord_id)) tables.users.push(row); return { meta: { changes: 1 } }; }
        if (table === 'settings') { tables.settings.set(`${row.tenant}|${row.key}`, row.value); return { meta: { changes: 1 } }; }
        if (table === 'guild_members') {
          const hit = tables.guildMembers.find((x) => x.tenant === row.tenant && x.discord_id === row.discord_id);
          if (hit) Object.assign(hit, row); else tables.guildMembers.push(row);
          return { meta: { changes: 1 } };
        }
        return { meta: { changes: 0 } };
      }
      if (table === 'fill_offers') {
        if (store.some((x) => x.user_id === row.user_id && x.status === 'open')) throw new Error('UNIQUE constraint failed: fill_offers_open_unique');
        row.status = 'open';
      }
      if (table === 'fill_requests') { row.status = 'open'; row.matched_at = null; row.closed_at = null; }
      if (table === 'fill_invites') {
        if (store.some((x) => x.request_id === row.request_id && x.to_user_id === row.to_user_id && (x.status === 'pending' || x.status === 'accepted'))) throw new Error('UNIQUE constraint failed: fill_invites_pair_unique');
        row.status = 'pending'; row.responded_at = null;
      }
      if (table === 'guild_alliances') {
        if (store.some((x) => x.guild_low === row.guild_low && x.guild_high === row.guild_high && (x.status === 'pending' || x.status === 'active'))) throw new Error('UNIQUE constraint failed: guild_alliances_live_unique');
        row.status = 'pending'; row.responded_at = null; row.ended_at = null; row.ended_by_tenant = '';
      }
      if (row.id === undefined) row.id = nextId++;
      store.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    // Capacity-guard seat insert: INSERT INTO signups (cols) SELECT vals WHERE count < max
    if (/^INSERT INTO signups \([^)]+\) SELECT /i.test(sql)) {
      const colList = /^INSERT INTO signups \(([^)]+)\)/i.exec(sql)[1];
      const cols = parseCols(colList);
      const row = {};
      cols.forEach((c, i) => { row[c] = b[i]; });
      const ev = tables.events.find((e) => e.id === Number(row.event_id));
      const count = tables.signups.filter((x) => x.event_id === Number(row.event_id)).length;
      if (!ev || ev.status !== 'open' || count >= ev.max_slots) return { meta: { changes: 0 } };
      if (row.id === undefined) row.id = nextId++;
      row.ready_at = null;
      tables.signups.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    m = /^UPDATE (\w+) SET (.+?) WHERE (.+)$/i.exec(sql);
    if (m) {
      const [, table, setList] = m;
      // SET values come first in the bind list; find them by parsing.
      const tmp = {};
      let bi = 0;
      for (const part of setList.split(',')) {
        const eqAt = part.indexOf('=');
        const c = part.slice(0, eqAt).trim().split('.').pop();
        const rhs = part.slice(eqAt + 1).trim();
        if (rhs === '?') tmp[c] = b[bi++];
        else if (/^'[^']*'$/.test(rhs)) tmp[c] = rhs.slice(1, -1);
        else if (/^-?\d+$/.test(rhs)) tmp[c] = Number(rhs);
        else tmp[c] = null;
      }
      const wb = b.slice(bi);
      let rows = [];
      if (table === 'fill_offers') rows = tables.offers.filter((x) => x.user_id === Number(wb[0]) && x.status === 'open');
      else if (table === 'fill_requests' && /status = 'open'/i.test(sql)) rows = tables.requests.filter((x) => x.id === Number(wb[0]) && x.status === 'open');
      else if (table === 'fill_requests') rows = tables.requests.filter((x) => x.id === Number(wb[0]) && (x.status === 'open' || x.status === 'matched'));
      else if (table === 'fill_invites' && /to_user_id/i.test(sql)) rows = tables.invites.filter((x) => x.id === Number(wb[0]) && x.to_user_id === Number(wb[1]) && x.status === 'pending');
      else if (table === 'fill_invites') rows = tables.invites.filter((x) => x.request_id === Number(wb[0]) && x.status === 'pending');
      else if (table === 'guild_alliances' && /responded_at/i.test(setList)) {
        rows = tables.alliances.filter((x) => x.id === Number(wb[0]) && x.status === 'pending' && x.requested_by_tenant !== Number(wb[1]) && (x.guild_low === Number(wb[1]) || x.guild_high === Number(wb[1])));
      } else if (table === 'guild_alliances') {
        rows = tables.alliances.filter((x) => x.id === Number(wb[0]) && x.status === 'active' && (x.guild_low === Number(wb[1]) || x.guild_high === Number(wb[1])));
      } else if (table === 'events') {
        rows = tables.events.filter((x) => x.id === Number(wb[0]) && x.tenant === Number(wb[1]));
      }
      // fill_alliances end: SET carries ended_by bind too — wb[0]=id, wb[1]=byTenant is wrong there:
      // end SET = status, ended_at, ended_by_tenant (3 binds), WHERE id, byTenant.
      // The generic slice above already consumed exactly the SET binds.
      for (const r of rows) Object.assign(r, tmp);
      return { meta: { changes: rows.length } };
    }
    if (/\b(CREATE TABLE|CREATE INDEX|ALTER TABLE|PRAGMA)\b/i.test(sql)) return kind === 'run' ? { meta: { changes: 0 } } : (kind === 'first' ? null : { results: [] });
    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });
    if (/FROM tenants WHERE slug/i.test(sql)) return first(tables.tenants.find((t) => t.slug === b[0]));
    if (/FROM tenants/i.test(sql) && /id = \?/i.test(sql)) return first(tables.tenants.find((t) => t.id === Number(b[0])));
    if (/FROM tenants ORDER BY/i.test(sql)) return all(tables.tenants.slice().sort((x, y) => String(x.created_at).localeCompare(String(y.created_at))));
    if (/FROM settings/i.test(sql) && /tenant = 0/i.test(sql)) {
      const v = tables.settings.get(`0|${b[0]}`);
      return first(v === undefined ? null : { value: v });
    }
    if (/FROM settings WHERE tenant = \? AND key = \?/i.test(sql)) {
      const v = tables.settings.get(`${b[0]}|${b[1]}`);
      return first(v === undefined ? null : { value: v });
    }
    if (/FROM settings WHERE key = \?/i.test(sql)) {
      const rows = [];
      for (const [k, v] of tables.settings) { const at = k.lastIndexOf('|'); if (k.slice(at + 1) === String(b[0])) rows.push({ tenant: Number(k.slice(0, at)), value: v }); }
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    if (/FROM settings/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/SELECT guilds_json FROM users/i.test(sql)) {
      const u = tables.users.find((x) => x.id === Number(b[0])) || tables.users.find((x) => x.discord_id === String(b[0]));
      return first(u === undefined ? null : { guilds_json: u.guilds_json });
    }
    if (/FROM users/i.test(sql)) {
      if (/discord_id IN/i.test(sql)) {
        const rows = tables.users.filter((x) => b.map(String).includes(x.discord_id));
        return kind === 'first' ? (rows[0] ?? null) : all(rows);
      }
      if (/id IN/i.test(sql)) {
        const rows = tables.users.filter((x) => b.map(Number).includes(x.id));
        return kind === 'first' ? (rows[0] ?? null) : all(rows);
      }
      if (/discord_id = \?/i.test(sql)) return first(tables.users.find((x) => x.discord_id === String(b[0])));
      if (/id = \?/i.test(sql)) return first(tables.users.find((x) => x.id === Number(b[0])));
      return kind === 'first' ? (tables.users[0] ?? null) : all(tables.users);
    }
    if (/FROM user_guild_nicks/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/FROM guild_entitlements/i.test(sql)) return first(tables.entitlements.find((e) => e.tenant === b[0]));
    if (/FROM guild_members WHERE tenant = \? AND discord_id = \?/i.test(sql)) {
      return first(tables.guildMembers.find((x) => x.tenant === b[0] && x.discord_id === String(b[1])));
    }
    if (/FROM guild_members/i.test(sql)) return kind === 'first' ? null : all(tables.guildMembers.filter((x) => x.tenant === b[0]));
    // events: capacity stats for the guard's healer rollback
    if (/AS c, \(SELECT COUNT\(\*\) FROM signups/i.test(sql)) {
      const evId = Number(b[0]);
      const ev = tables.events.find((e) => e.id === evId);
      const seats = tables.signups.filter((x) => x.event_id === evId);
      return first({ c: seats.length, h: seats.filter((x) => x.role === '奶' || x.role === '治疗').length, m: ev ? ev.max_slots : null });
    }
    if (/SELECT COUNT\(\*\) AS c FROM signups WHERE event_id = \? AND is_visitor = 1/i.test(sql)) {
      return first({ c: tables.signups.filter((x) => x.event_id === Number(b[0]) && Number(x.is_visitor) === 1).length });
    }
    if (/FROM signups WHERE event_id = \? AND discord_id = \?/i.test(sql)) {
      return first(tables.signups.find((x) => x.event_id === Number(b[0]) && x.discord_id === String(b[1])));
    }
    if (/FROM events e WHERE e\.tenant = \?/i.test(sql)) {
      const rows = tables.events.filter((e) => e.tenant === b[0] && e.status !== 'draft' && e.status !== 'completed')
        .map((e) => ({ ...e, signup_count: tables.signups.filter((x) => x.event_id === e.id).length }));
      return all(rows);
    }
    if (/FROM events WHERE tenant IN/i.test(sql)) {
      const tenants = b.slice(0, b.length - 1).map(Number);
      const rows = tables.events.filter((e) => tenants.includes(e.tenant) && Number(e.ally_visible) === 1 && Number(e.visitor_slots) > 0 && e.status === 'open')
        .sort((x, y) => y.id - x.id);
      return all(rows);
    }
    if (/FROM events WHERE id = \? AND tenant = \?/i.test(sql)) return first(tables.events.find((e) => e.id === Number(b[0]) && e.tenant === b[1]));
    if (/FROM events WHERE id = \?/i.test(sql)) return first(tables.events.find((e) => e.id === Number(b[0])));
    if (/FROM fill_offers WHERE user_id = \? AND status = 'open'/i.test(sql)) return first(tables.offers.find((x) => x.user_id === Number(b[0]) && x.status === 'open'));
    if (/FROM fill_offers WHERE id = \?/i.test(sql)) return first(tables.offers.find((x) => x.id === Number(b[0])));
    if (/FROM fill_offers WHERE status = 'open'/i.test(sql)) return all(tables.offers.filter((x) => x.status === 'open').sort((x, y) => y.id - x.id));
    if (/FROM fill_requests WHERE id = \? AND tenant = \?/i.test(sql)) return first(tables.requests.find((x) => x.id === Number(b[0]) && x.tenant === b[1]));
    if (/FROM fill_requests WHERE tenant = \?/i.test(sql)) return all(tables.requests.filter((x) => x.tenant === b[0]).sort((x, y) => y.id - x.id));
    if (/FROM fill_requests WHERE id = \?/i.test(sql)) return first(tables.requests.find((x) => x.id === Number(b[0])));
    if (/FROM fill_invites WHERE request_id = \? AND to_user_id = \?/i.test(sql)) return first(tables.invites.find((x) => x.request_id === Number(b[0]) && x.to_user_id === Number(b[1]) && (x.status === 'pending' || x.status === 'accepted')));
    if (/FROM fill_invites WHERE to_user_id = \?/i.test(sql)) return all(tables.invites.filter((x) => x.to_user_id === Number(b[0])).sort((x, y) => y.id - x.id));
    if (/FROM fill_invites WHERE request_id = \?/i.test(sql)) return all(tables.invites.filter((x) => x.request_id === Number(b[0])).sort((x, y) => y.id - x.id));
    if (/FROM fill_invites WHERE id = \?/i.test(sql)) return first(tables.invites.find((x) => x.id === Number(b[0])));
    if (/FROM guild_alliances WHERE guild_low = \? AND guild_high = \? AND status = 'active'/i.test(sql)) {
      return first(tables.alliances.find((x) => x.guild_low === b[0] && x.guild_high === b[1] && x.status === 'active'));
    }
    if (/FROM guild_alliances WHERE guild_low = \? AND guild_high = \?/i.test(sql)) {
      return first(tables.alliances.find((x) => x.guild_low === b[0] && x.guild_high === b[1] && (x.status === 'pending' || x.status === 'active')));
    }
    if (/FROM guild_alliances WHERE \(guild_low = \? OR guild_high = \?\)/i.test(sql)) {
      return all(tables.alliances.filter((x) => (x.guild_low === b[0] || x.guild_high === b[0]) && (x.status === 'pending' || x.status === 'active')).sort((x, y) => y.id - x.id));
    }
    if (/FROM guild_alliances WHERE id = \?/i.test(sql)) return first(tables.alliances.find((x) => x.id === Number(b[0])));
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
const ADMIN_A = { userId: UID.UA, discordId: 'UA', name: '甲业管理员', guilds: [DGID_A] };
const LEADER_A = { userId: UID.UL, discordId: 'UL', name: '甲业车头', guilds: [DGID_A] };
const MEMBER_A = { userId: UID.UB, discordId: 'UB', name: '甲业成员', guilds: [DGID_A] };
const ADMIN_B = { userId: UID.UD, discordId: 'UD', name: '乙业管理员', guilds: [DGID_B] };
const SUPPLIER_B = { userId: UID.US, discordId: 'US', name: '乙业补位', guilds: [DGID_B] };
const MEMBER_B = { userId: UID.UM, discordId: 'UM', name: '乙业成员', guilds: [DGID_B] };
const MEMBER_B2 = { userId: UID.UN, discordId: 'UN', name: '乙业成员二', guilds: [DGID_B] };
const MEMBER_C = { userId: UID.UC, discordId: 'UC', name: '丙业成员', guilds: [DGID_C] };
const ADMIN_P = { userId: UID.UP1, discordId: 'UP1', name: '丁业管理员', guilds: [DGID_D] };
const MEMBER_P = { userId: UID.UP2, discordId: 'UP2', name: '丁业成员', guilds: [DGID_D] };
const MEMBER_P2 = { userId: UID.UP3, discordId: 'UP3', name: '丁业成员二', guilds: [DGID_D] };
const OUTSIDER = { userId: UID.UX, discordId: 'UX', name: '路人', guilds: [] };

const FUTURE = Math.floor(Date.now() / 1000) + 365 * 86400;
const tenantRow = (slug, name) => ({
  id: GID[slug], slug, guild_name: name, password_hash: 'x', announcement: '', slogan: '',
  master_name: '', logo_url: '', bg_image_url: '', discord_webhook: '', created_at: '2026-01-01 00:00:00', recruit_open: 0,
});
const evRow = (id, tenant, title, creator) => ({
  id, tenant, title, type: 'activity', description: '', starts_at: null, meet_info: '',
  max_slots: 10, status: 'open', created_at: '2026-01-01 00:00:00', starts_at_utc: 1799999999,
  origin: 'member', created_by: '', manage_code: '', dungeon: '测试副本', creator_user_id: creator,
  reminder_sent_at: null, reminder_error: null, ally_visible: 0, visitor_slots: 0,
});
const { db, tables } = makeDb({
  tenants: [tenantRow('nettest', '甲百业'), tenantRow('allytest', '乙百业'), tenantRow('thirdtest', '丙百业'), tenantRow('paidtest', '丁百业')],
  settings: [
    [`${GID.nettest}|discord_guild_id`, DGID_A],
    [`${GID.allytest}|discord_guild_id`, DGID_B],
    [`${GID.thirdtest}|discord_guild_id`, DGID_C],
    [`${GID.paidtest}|discord_guild_id`, DGID_D],
    ['0|game_version', 'intl-v2.3'],
  ],
  users: [
    ['UA', serversJson([srv(DGID_A, '32')])],
    ['UL', serversJson([srv(DGID_A)])],
    ['UB', serversJson([srv(DGID_A)])],
    ['UD', serversJson([srv(DGID_B, '32')])],
    ['US', serversJson([srv(DGID_B)])],
    ['UM', serversJson([srv(DGID_B)])],
    ['UN', serversJson([srv(DGID_B)])],
    ['UC', serversJson([srv(DGID_C)])],
    ['UP1', serversJson([srv(DGID_D, '32')])],
    ['UP2', serversJson([srv(DGID_D)])],
    ['UP3', serversJson([srv(DGID_D)])],
    ['UX', serversJson([])],
  ],
  guildMembers: [
    { tenant: GID.nettest, discord_id: 'UA', nick: '甲业管理员', global_name: '甲管' },
    { tenant: GID.nettest, discord_id: 'UL', nick: '甲业车头', global_name: '甲头' },
    { tenant: GID.nettest, discord_id: 'UB', nick: '甲业成员', global_name: '甲员' },
    { tenant: GID.allytest, discord_id: 'UD', nick: '乙业管理员', global_name: '乙管' },
    { tenant: GID.allytest, discord_id: 'US', nick: '乙业补位', global_name: '乙补' },
    { tenant: GID.allytest, discord_id: 'UM', nick: '乙业成员', global_name: '乙员' },
    { tenant: GID.allytest, discord_id: 'UN', nick: '乙业成员二', global_name: '乙员二' },
    { tenant: GID.thirdtest, discord_id: 'UC', nick: '丙业成员', global_name: '丙员' },
    { tenant: GID.paidtest, discord_id: 'UP1', nick: '丁业管理员', global_name: '丁管' },
    { tenant: GID.paidtest, discord_id: 'UP2', nick: '丁业成员', global_name: '丁员' },
    { tenant: GID.paidtest, discord_id: 'UP3', nick: '丁业成员二', global_name: '丁员二' },
  ],
  events: [evRow(701, GID.nettest, '甲业缺奶车', UID.UL), evRow(702, GID.allytest, '乙业自家车', UID.UD)],
  entitlements: [
    { tenant: GID.nettest, plan: 'premium', source: 'manual', current_period_end: FUTURE, stripe_customer_id: '', stripe_subscription_id: '', updated_at: 1 },
    { tenant: GID.paidtest, plan: 't3', source: 'manual', current_period_end: FUTURE, stripe_customer_id: '', stripe_subscription_id: '', updated_at: 1 },
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
const setPaygate = (on) => { tables.settings.set('0|paygate_enabled', on ? '1' : ''); };

let r: any;
let req1: any;

const marketQ = `{ viewer { fillMarket(slug: "nettest") { __typename
  ... on FillMarketPage { slug guildName marketTitle supply { myOffer { id school } myInvites { id status } }
    demand { __typename ... on FillDemandSection { requests { id status } offers { id displayName school homeGuildName } }
      ... on FillDemandLocked { lockedTitle } } }
  ... on FillMarketLocked { slug lockedTitle } } } }`;

const alliesQ = `{ viewer { guildAllies(slug: "allytest") { __typename
  ... on GuildAlliesPage { slug allies { slug name } adminSection { relations { id otherSlug status outgoing } candidates { slug } }
    sharedGroupings { id hostSlug title visitorLeft joined } }
  ... on GuildAlliesLocked { slug lockedTitle lockedBody } } } }`;

const alliesQP = alliesQ.replaceAll('allytest', 'paidtest');

let offerB: any;

let offerA: any;

const marketQB = marketQ.replaceAll('nettest', 'allytest');

let ally1: any;

const createReqMut = `mutation($slug: String!, $gid: ID!, $role: String!) { createFillRequest(slug: $slug, groupingId: $gid, neededRole: $role) { ok errorCode request { id status neededRole } } }`;

describe('network', () => {
  it('market page gates', async () => {
/* ================= market page gates ================= */
r = await gql(marketQ, { user: null });
eq('匿名 -> FillMarketLocked', r.data?.viewer?.fillMarket?.__typename, 'FillMarketLocked');
r = await gql(marketQ, { user: OUTSIDER });
eq('非成员 -> FillMarketLocked', r.data?.viewer?.fillMarket?.__typename, 'FillMarketLocked');
r = await gql(marketQ, { user: MEMBER_A });
eq('成员 -> FillMarketPage', r.data?.viewer?.fillMarket?.__typename, 'FillMarketPage');
eq('paygate OFF: 已授予百业需求区直接合成 (hub 授予验档路径)', r.data?.viewer?.fillMarket?.demand?.__typename, 'FillDemandSection');
r = await gql(marketQB, { user: MEMBER_B });
eq('paygate OFF: T0 百业市场页仍合成 (供给层免费)', r.data?.viewer?.fillMarket?.__typename, 'FillMarketPage');
eq('paygate OFF + T0 百业: 需求区为 null (零足迹)', r.data?.viewer?.fillMarket?.demand ?? null, null);
  });

  it('supply edge is FREE (paygate ON, guild below tier)', async () => {
/* ================= supply edge is FREE (paygate ON, guild below tier) ================= */
setPaygate(true);
const publishMut = `mutation($slug: String!, $school: String!, $note: String) { publishFillOffer(slug: $slug, school: $school, windows: [{ weekday: 5, startMinute: 1140, endMinute: 1380 }], note: $note) { ok errorCode offer { id displayName school homeGuildName } } }`;
r = await gql(publishMut, { user: SUPPLIER_B, variables: { slug: 'allytest', school: '牵丝·霖', note: '奶妈在线' } });
eq('供给侧免费: 乙业 (T0) 成员在 paygate ON 时发布供给 ok', r.data?.publishFillOffer?.ok, true);
eq('供给快照名 = 名册名', r.data?.publishFillOffer?.offer?.displayName, '乙业补位');
offerB = r.data?.publishFillOffer?.offer?.id;
r = await gql(publishMut, { user: SUPPLIER_B, variables: { slug: 'allytest', school: '破竹·樽', note: '再发一份' } });
eq('一人一份: 重复发布 -> fillOfferExists', r.data?.publishFillOffer?.errorCode, 'fillOfferExists');
r = await gql(publishMut, { user: MEMBER_A, variables: { slug: 'nettest', school: '破竹·樽', note: '输出可补' } });
eq('甲业成员发布供给 ok', r.data?.publishFillOffer?.ok, true);
offerA = r.data?.publishFillOffer?.offer?.id;
r = await gql(publishMut, { user: OUTSIDER, variables: { slug: 'nettest', school: '破竹·樽', note: '' } });
eq('非成员发布 -> memberOnly', r.data?.publishFillOffer?.errorCode, 'memberOnly');

/* demand section: free guild locked, premium guild open */
r = await gql(marketQB, { user: MEMBER_B });
eq('paygate ON + T0 百业: 需求区 FillDemandLocked', r.data?.viewer?.fillMarket?.demand?.__typename, 'FillDemandLocked');
check('Locked 区零需求数据 (无 requests/offers 字段)', r.data?.viewer?.fillMarket?.demand?.requests === undefined && r.data?.viewer?.fillMarket?.demand?.offers === undefined);
r = await gql(marketQ, { user: MEMBER_A });
eq('paygate ON + T3 百业: 需求区合成', r.data?.viewer?.fillMarket?.demand?.__typename, 'FillDemandSection');
eq('需求区可浏览全市场供给 (含乙业供给)', (r.data?.viewer?.fillMarket?.demand?.offers || []).map((o) => o.displayName).sort(), ['乙业补位', '甲业成员']);
check('供给公开面不含 discordId 字段', (r.data?.viewer?.fillMarket?.demand?.offers || []).every((o) => !('discordId' in o) && !('discord_id' in o)));
  });

  it('demand mutations: tier + manage verdicts', async () => {
/* ================= demand mutations: tier + manage verdicts ================= */
r = await gql(createReqMut, { user: ADMIN_B, variables: { slug: 'allytest', gid: '702', role: '奶' } });
eq('T0 百业管理员发需求 -> premiumRequired', r.data?.createFillRequest?.errorCode, 'premiumRequired');
r = await gql(createReqMut, { user: MEMBER_A, variables: { slug: 'nettest', gid: '701', role: '奶' } });
eq('普通成员 (非车头/管理员) 发需求 -> marketManageOnly', r.data?.createFillRequest?.errorCode, 'marketManageOnly');
r = await gql(createReqMut, { user: ADMIN_B, variables: { slug: 'nettest', gid: '701', role: '奶' } });
eq('乙业管理员对甲业车发需求 -> memberOnly (不串权)', r.data?.createFillRequest?.errorCode, 'memberOnly');
r = await gql(createReqMut, { user: LEADER_A, variables: { slug: 'nettest', gid: '701', role: '奶' } });
eq('车头对自己的车发需求 ok', r.data?.createFillRequest?.ok, true);
req1 = r.data?.createFillRequest?.request?.id;
eq('需求状态 OPEN', r.data?.createFillRequest?.request?.status, 'OPEN');
  });

  it('invite -> accept -> manual seat', async () => {
/* ================= invite -> accept -> manual seat ================= */
const inviteMut = `mutation($slug: String!, $req: ID!, $offer: ID!) { inviteFillSupplier(slug: $slug, requestId: $req, offerId: $offer) { ok errorCode invite { id status toName } } }`;
r = await gql(inviteMut, { user: MEMBER_A, variables: { slug: 'nettest', req: req1, offer: offerB } });
eq('非管理者邀请 -> marketManageOnly', r.data?.inviteFillSupplier?.errorCode, 'marketManageOnly');
r = await gql(inviteMut, { user: LEADER_A, variables: { slug: 'nettest', req: req1, offer: offerA } });
eq('邀请自己百业成员的供给可发 (对方非本人)', r.data?.inviteFillSupplier?.ok, true);
const invA = r.data?.inviteFillSupplier?.invite?.id;
r = await gql(inviteMut, { user: LEADER_A, variables: { slug: 'nettest', req: req1, offer: offerB } });
eq('车头邀请乙业补位 ok', r.data?.inviteFillSupplier?.ok, true);
const invB = r.data?.inviteFillSupplier?.invite?.id;
r = await gql(inviteMut, { user: LEADER_A, variables: { slug: 'nettest', req: req1, offer: offerB } });
eq('重复邀请 -> fillInviteExists', r.data?.inviteFillSupplier?.errorCode, 'fillInviteExists');

const respondMut = `mutation($id: ID!, $accept: Boolean!) { respondFillInvite(inviteId: $id, accept: $accept) { ok errorCode invite { id status } } }`;
r = await gql(respondMut, { user: MEMBER_B, variables: { id: invB, accept: true } });
eq('他人代答邀请 -> fillInviteNotFound', r.data?.respondFillInvite?.errorCode, 'fillInviteNotFound');
r = await gql(marketQB, { user: SUPPLIER_B });
eq('补位人收件箱见到待确认邀请', (r.data?.viewer?.fillMarket?.supply?.myInvites || []).map((i) => i.status), ['PENDING']);
r = await gql(respondMut, { user: SUPPLIER_B, variables: { id: invB, accept: true } });
eq('补位人接受 ok (供给侧免费动作)', r.data?.respondFillInvite?.ok, true);
eq('邀请状态 ACCEPTED', r.data?.respondFillInvite?.invite?.status, 'ACCEPTED');
eq('接受只撮合: 需求转 MATCHED', tables.requests.find((x) => x.id === Number(req1))?.status, 'matched');
eq('接受不落座: 车 701 尚无该补位人的座位', tables.signups.some((x) => x.event_id === 701 && x.discord_id === 'US'), false);
r = await gql(respondMut, { user: MEMBER_A, variables: { id: invA, accept: true } });
eq('撮合后其余待确认邀请已失效 -> fillInviteNotPending', r.data?.respondFillInvite?.errorCode, 'fillInviteNotPending');
eq('失效邀请状态 EXPIRED (留痕)', tables.invites.find((x) => x.id === Number(invA))?.status, 'expired');

const seatMut = `mutation($slug: String!, $id: ID!) { seatFillSupplier(slug: $slug, inviteId: $id) { ok errorCode } }`;
r = await gql(seatMut, { user: ADMIN_B, variables: { slug: 'nettest', id: invB } });
eq('乙业管理员在甲业落座 -> memberOnly (不串权)', r.data?.seatFillSupplier?.errorCode, 'memberOnly');
r = await gql(seatMut, { user: MEMBER_A, variables: { slug: 'nettest', id: invB } });
eq('普通成员落座 -> marketManageOnly', r.data?.seatFillSupplier?.errorCode, 'marketManageOnly');
r = await gql(seatMut, { user: LEADER_A, variables: { slug: 'nettest', id: invB } });
eq('车头人工落座 ok', r.data?.seatFillSupplier?.ok, true);
const seatRow = tables.signups.find((x) => x.event_id === 701 && x.discord_id === 'US');
check('落座行存在且为普通座位 (非访客)', !!seatRow && Number(seatRow.is_visitor) === 0, JSON.stringify(seatRow));
eq('落座流派 = 供给流派快照', seatRow?.weapon, '牵丝·霖');
r = await gql(seatMut, { user: LEADER_A, variables: { slug: 'nettest', id: invB } });
eq('重复落座 -> alreadyJoined', r.data?.seatFillSupplier?.errorCode, 'alreadyJoined');

/* withdraw + close paths */
const withdrawMut = `mutation { withdrawFillOffer { ok errorCode } }`;
r = await gql(withdrawMut, { user: MEMBER_A });
eq('撤下供给 ok', r.data?.withdrawFillOffer?.ok, true);
r = await gql(withdrawMut, { user: MEMBER_A });
eq('重复撤下 -> fillOfferNotOpen', r.data?.withdrawFillOffer?.errorCode, 'fillOfferNotOpen');
const closeMut = `mutation($slug: String!, $req: ID!) { closeFillRequest(slug: $slug, requestId: $req) { ok errorCode } }`;
r = await gql(closeMut, { user: ADMIN_B, variables: { slug: 'nettest', req: req1 } });
eq('乙业管理员关甲业需求 -> memberOnly (不串权)', r.data?.closeFillRequest?.errorCode, 'memberOnly');
r = await gql(closeMut, { user: LEADER_A, variables: { slug: 'nettest', req: req1 } });
eq('车头关闭已撮合需求 ok', r.data?.closeFillRequest?.ok, true);
r = await gql(closeMut, { user: LEADER_A, variables: { slug: 'nettest', req: req1 } });
eq('重复关闭 -> fillRequestNotOpen', r.data?.closeFillRequest?.errorCode, 'fillRequestNotOpen');
  });

  it('P20: alliance lifecycle', async () => {
/* ================= P20: alliance lifecycle ================= */
r = await gql(alliesQ, { user: null });
eq('匿名盟友页 -> GuildAlliesLocked', r.data?.viewer?.guildAllies?.__typename, 'GuildAlliesLocked');
eq('匿名锁定文案 = 成员口径', r.data?.viewer?.guildAllies?.lockedTitle, '无法打开盟友百业');
r = await gql(alliesQ, { user: MEMBER_B });
eq('T0 百业成员盟友页 -> GuildAlliesLocked (档位面)', r.data?.viewer?.guildAllies?.__typename, 'GuildAlliesLocked');
eq('T0 锁定文案 = 档位口径 (不是成员口径)', r.data?.viewer?.guildAllies?.lockedTitle, '盟友百业是盟主档功能');
check('Locked 零联盟数据下发 (无 allies/adminSection/sharedGroupings 字段)', r.data?.viewer?.guildAllies?.allies === undefined && r.data?.viewer?.guildAllies?.adminSection === undefined && r.data?.viewer?.guildAllies?.sharedGroupings === undefined);
r = await gql(alliesQP, { user: MEMBER_P });
eq('T3 百业成员盟友页合成', r.data?.viewer?.guildAllies?.__typename, 'GuildAlliesPage');
eq('非管理员: adminSection 为 null (零管理数据)', r.data?.viewer?.guildAllies?.adminSection, null);
eq('未结盟: 共享活动为空', r.data?.viewer?.guildAllies?.sharedGroupings, []);

const inviteAllyMut = `mutation($slug: String!, $target: String!) { inviteAlliance(slug: $slug, targetSlug: $target) { ok errorCode alliance { id status otherSlug outgoing } } }`;
r = await gql(inviteAllyMut, { user: MEMBER_B, variables: { slug: 'allytest', target: 'nettest' } });
eq('普通成员发起结盟 -> adminOnly', r.data?.inviteAlliance?.errorCode, 'adminOnly');
r = await gql(inviteAllyMut, { user: ADMIN_B, variables: { slug: 'allytest', target: 'nettest' } });
eq('T0 百业管理员发起结盟 -> premiumRequired', r.data?.inviteAlliance?.errorCode, 'premiumRequired');
r = await gql(inviteAllyMut, { user: ADMIN_P, variables: { slug: 'paidtest', target: 'paidtest' } });
eq('与自己结盟 -> allianceSelf', r.data?.inviteAlliance?.errorCode, 'allianceSelf');
r = await gql(inviteAllyMut, { user: ADMIN_P, variables: { slug: 'paidtest', target: 'nettest' } });
eq('T3 丁业管理员向甲业发起结盟 ok', r.data?.inviteAlliance?.ok, true);
ally1 = r.data?.inviteAlliance?.alliance?.id;
eq('结盟待确认 PENDING', r.data?.inviteAlliance?.alliance?.status, 'PENDING');
eq('关系对称存储: 一行 (low, high) 排序', [tables.alliances[0].guild_low, tables.alliances[0].guild_high], [GID.nettest, GID.paidtest]);
r = await gql(inviteAllyMut, { user: ADMIN_A, variables: { slug: 'nettest', target: 'paidtest' } });
eq('反向重复邀请 -> allianceExists (同一对只一行)', r.data?.inviteAlliance?.errorCode, 'allianceExists');

const respondAllyMut = `mutation($slug: String!, $id: ID!, $accept: Boolean!) { respondAlliance(slug: $slug, allianceId: $id, accept: $accept) { ok errorCode alliance { id status } } }`;
r = await gql(respondAllyMut, { user: ADMIN_P, variables: { slug: 'paidtest', id: ally1, accept: true } });
eq('发起方自答 -> allianceNotPending', r.data?.respondAlliance?.errorCode, 'allianceNotPending');
r = await gql(respondAllyMut, { user: ADMIN_P, variables: { slug: 'nettest', id: ally1, accept: true } });
eq('丁业管理员冒充甲业处理 -> adminOnly (不串权)', r.data?.respondAlliance?.errorCode, 'adminOnly');
r = await gql(respondAllyMut, { user: ADMIN_A, variables: { slug: 'nettest', id: ally1, accept: true } });
eq('甲业管理员接受 ok', r.data?.respondAlliance?.ok, true);
eq('结盟生效 ACTIVE', r.data?.respondAlliance?.alliance?.status, 'ACTIVE');
r = await gql(alliesQP, { user: MEMBER_P });
eq('结盟后盟友列表含甲业', (r.data?.viewer?.guildAllies?.allies || []).map((a) => a.slug), ['nettest']);

/* below-tier accept is refused; the reject exit stays open */
r = await gql(inviteAllyMut, { user: ADMIN_A, variables: { slug: 'nettest', target: 'allytest' } });
eq('甲业 (T3) 向乙业 (T0) 发起结盟 ok (发起方验档)', r.data?.inviteAlliance?.ok, true);
const allyT0 = r.data?.inviteAlliance?.alliance?.id;
r = await gql(respondAllyMut, { user: ADMIN_B, variables: { slug: 'allytest', id: allyT0, accept: true } });
eq('T0 百业管理员接受结盟 -> premiumRequired', r.data?.respondAlliance?.errorCode, 'premiumRequired');
r = await gql(respondAllyMut, { user: ADMIN_B, variables: { slug: 'allytest', id: allyT0, accept: false } });
eq('T0 百业管理员拒绝结盟 ok (退出通道不验档)', r.data?.respondAlliance?.ok, true);
  });

  it('P20: sharing + visitor seats', async () => {
/* ================= P20: sharing + visitor seats ================= */
const shareMut = `mutation($slug: String!, $gid: ID!, $vis: Boolean!, $slots: Int!) { setGroupingAllySharing(slug: $slug, groupingId: $gid, allyVisible: $vis, visitorSlots: $slots) { ok errorCode } }`;
r = await gql(shareMut, { user: MEMBER_A, variables: { slug: 'nettest', gid: '701', vis: true, slots: 1 } });
eq('普通成员设共享 -> marketManageOnly', r.data?.setGroupingAllySharing?.errorCode, 'marketManageOnly');
r = await gql(shareMut, { user: ADMIN_B, variables: { slug: 'nettest', gid: '701', vis: true, slots: 1 } });
eq('乙业管理员设甲业车共享 -> memberOnly (不串权)', r.data?.setGroupingAllySharing?.errorCode, 'memberOnly');
r = await gql(shareMut, { user: LEADER_A, variables: { slug: 'nettest', gid: '701', vis: true, slots: 11 } });
eq('访客名额超总名额 -> visitorSlotsInvalid', r.data?.setGroupingAllySharing?.errorCode, 'visitorSlotsInvalid');
r = await gql(shareMut, { user: LEADER_A, variables: { slug: 'nettest', gid: '701', vis: true, slots: 1 } });
eq('车头开启盟友共享 (访客位 1) ok', r.data?.setGroupingAllySharing?.ok, true);
r = await gql(shareMut, { user: ADMIN_B, variables: { slug: 'allytest', gid: '702', vis: true, slots: 1 } });
eq('T0 百业管理员设自家车共享 -> premiumRequired', r.data?.setGroupingAllySharing?.errorCode, 'premiumRequired');

r = await gql(alliesQP, { user: MEMBER_P });
eq('盟友页见到共享车', (r.data?.viewer?.guildAllies?.sharedGroupings || []).map((g) => g.id), ['701']);
eq('访客位余量 1', r.data?.viewer?.guildAllies?.sharedGroupings?.[0]?.visitorLeft, 1);

const joinMut = `mutation($slug: String!, $gid: ID!, $w: String!) { joinAllyGrouping(slug: $slug, groupingId: $gid, weapon: $w) { ok errorCode } }`;
r = await gql(joinMut, { user: MEMBER_C, variables: { slug: 'thirdtest', gid: '701', w: '破竹·樽' } });
eq('未结盟百业成员报名访客位 -> allyNotAllied', r.data?.joinAllyGrouping?.errorCode, 'allyNotAllied');
r = await gql(joinMut, { user: MEMBER_P, variables: { slug: 'paidtest', gid: '701', w: '破竹·樽' } });
eq('盟友成员报名访客位 ok', r.data?.joinAllyGrouping?.ok, true);
const vSeat = tables.signups.find((x) => x.event_id === 701 && x.discord_id === 'UP2');
check('访客座位标记 is_visitor=1 (既有座位模型)', !!vSeat && Number(vSeat.is_visitor) === 1, JSON.stringify(vSeat));
r = await gql(joinMut, { user: MEMBER_P, variables: { slug: 'paidtest', gid: '701', w: '破竹·樽' } });
eq('重复报名访客位 -> alreadyJoined', r.data?.joinAllyGrouping?.errorCode, 'alreadyJoined');
r = await gql(joinMut, { user: MEMBER_P2, variables: { slug: 'paidtest', gid: '701', w: '牵丝·霖' } });
eq('访客位满 -> visitorSlotsFull', r.data?.joinAllyGrouping?.errorCode, 'visitorSlotsFull');
r = await gql(alliesQP, { user: MEMBER_P2 });
eq('满员后余量 0 且本人未报名', [r.data?.viewer?.guildAllies?.sharedGroupings?.[0]?.visitorLeft, r.data?.viewer?.guildAllies?.sharedGroupings?.[0]?.joined], [0, false]);
r = await gql(alliesQP, { user: MEMBER_P });
eq('访客本人在共享行显示已报名 (同一座位模型)', r.data?.viewer?.guildAllies?.sharedGroupings?.[0]?.joined, true);

/* dissolve revokes at read time */
const endAllyMut = `mutation($slug: String!, $id: ID!) { endAlliance(slug: $slug, allianceId: $id) { ok errorCode } }`;
r = await gql(endAllyMut, { user: MEMBER_P, variables: { slug: 'paidtest', id: ally1 } });
eq('普通成员解除结盟 -> adminOnly', r.data?.endAlliance?.errorCode, 'adminOnly');
r = await gql(endAllyMut, { user: ADMIN_P, variables: { slug: 'paidtest', id: ally1 } });
eq('任一方管理员单方解除 ok', r.data?.endAlliance?.ok, true);
r = await gql(alliesQP, { user: MEMBER_P });
eq('解除后共享即刻失效: 盟友页共享列表为空', r.data?.viewer?.guildAllies?.sharedGroupings, []);
eq('解除后盟友列表为空', r.data?.viewer?.guildAllies?.allies, []);
r = await gql(joinMut, { user: MEMBER_B, variables: { slug: 'allytest', gid: '702', w: '破竹·樽' } });
eq('解除后报名 (自家车) -> allyNotShared 口径外的主办车拒绝', r.data?.joinAllyGrouping?.errorCode, 'allyNotShared');
r = await gql(endAllyMut, { user: ADMIN_A, variables: { slug: 'nettest', id: ally1 } });
eq('重复解除 -> allianceNotActive', r.data?.endAlliance?.errorCode, 'allianceNotActive');

/* tier lapse: new actions refuse, the dissolve exit stays open */
const inviteAllyMut2 = `mutation($slug: String!, $target: String!) { inviteAlliance(slug: $slug, targetSlug: $target) { ok errorCode alliance { id status } } }`;
const respondAllyMut2 = `mutation($slug: String!, $id: ID!, $accept: Boolean!) { respondAlliance(slug: $slug, allianceId: $id, accept: $accept) { ok errorCode } }`;
r = await gql(inviteAllyMut2, { user: ADMIN_A, variables: { slug: 'nettest', target: 'paidtest' } });
eq('档位过期前重建结盟: 甲业邀请丁业 ok', r.data?.inviteAlliance?.ok, true);
const ally2 = r.data?.inviteAlliance?.alliance?.id;
r = await gql(respondAllyMut2, { user: ADMIN_P, variables: { slug: 'paidtest', id: ally2, accept: true } });
eq('丁业接受重建结盟 ok', r.data?.respondAlliance?.ok, true);
tables.entitlements.splice(tables.entitlements.findIndex((e) => e.tenant === GID.paidtest), 1);
r = await gql(alliesQP, { user: MEMBER_P });
eq('档位过期: 丁业盟友页 -> GuildAlliesLocked', r.data?.viewer?.guildAllies?.__typename, 'GuildAlliesLocked');
r = await gql(inviteAllyMut2, { user: ADMIN_P, variables: { slug: 'paidtest', target: 'thirdtest' } });
eq('档位过期: 丁业发起新结盟 -> premiumRequired', r.data?.inviteAlliance?.errorCode, 'premiumRequired');
r = await gql(joinMut, { user: MEMBER_P, variables: { slug: 'paidtest', gid: '701', w: '牵丝·霖' } });
eq('档位过期: 存量联盟下报名访客位 -> premiumRequired', r.data?.joinAllyGrouping?.errorCode, 'premiumRequired');
r = await gql(endAllyMut, { user: ADMIN_P, variables: { slug: 'paidtest', id: ally2 } });
eq('档位过期: 解除存量结盟仍 ok (退出通道恒开)', r.data?.endAlliance?.ok, true);

/* converged verdict: tierLocked (foundation final) is a pure
 * entitlement verdict and does NOT consult the paygate master
 * switch — a T0 guild's demand mutation is tier-refused even with
 * the paygate OFF (verification goes through hub tier grants). */
setPaygate(false);
r = await gql(createReqMut, { user: ADMIN_B, variables: { slug: 'allytest', gid: '702', role: '输出' } });
eq('paygate OFF: T0 百业管理员发需求仍被档位拦 (F0 定版: tierLocked 纯权益判定)', r.data?.createFillRequest?.errorCode, 'premiumRequired');
  });

  it('paygate OFF: zero footprint on the tiered network surfaces', async () => {
/* ============ paygate OFF: zero footprint (2026-10-28 ruling) ============ */
// State here: paygate OFF (set by the block above), allytest is
// T0 throughout, paidtest's grant has lapsed (tier 0). The Locked
// assertions in the lifecycle sections above ran with the
// paygate ON — the sales variant. With the switch OFF the tiered
// surfaces do not exist: the allies root field resolves null and
// the guild home carries no allies tab label, while the free
// market tab label keeps shipping.
r = await gql(alliesQ, { user: MEMBER_B });
eq('paygate OFF + T0: 盟友页根字段为 null (零足迹)', r.data?.viewer?.guildAllies ?? null, null);
r = await gql(alliesQP, { user: MEMBER_P });
eq('paygate OFF + 档位过期: 丁业盟友页根字段为 null', r.data?.viewer?.guildAllies ?? null, null);
r = await gql(`{ viewer { guild(slug: "allytest") { __typename ... on Guild { homeTabAlliesLabel homeTabMarketLabel } } } }`, { user: MEMBER_B });
eq('paygate OFF + T0: 百业主页无盟友页签 (label 为 null)', r.data?.viewer?.guild?.homeTabAlliesLabel ?? null, null);
check('paygate OFF + T0: 补位市场页签文案照常下发 (供给层免费)', typeof r.data?.viewer?.guild?.homeTabMarketLabel === 'string' && r.data.viewer.guild.homeTabMarketLabel.length > 0);
  });

});
