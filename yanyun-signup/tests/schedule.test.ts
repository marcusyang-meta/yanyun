// Scheduling acceptance (F5 availability + F7 custom signup fields
// + F13 time polls):
//  - pure validators: availability slot ranges/caps, poll candidate
//    window (2..8 distinct future instants), custom field defs
//    (count/label/type/options limits), signup answers (required,
//    choice membership, unknown field, length cap);
//  - availability GraphQL: a member saves and re-reads their own
//    slots; the guild summary is composed for the guild admin and
//    for a car leader of THIS guild, and is null for a plain member,
//    for another guild's admin, and for anonymous — cross-guild
//    data never leaks;
//  - polls GraphQL: creation validation codes, multi-select voting
//    with whole-set replacement and live tallies, voter-name
//    snapshots, close by creator / guild admin only, closed polls
//    refuse votes, another guild's admin cannot close;
//  - custom fields GraphQL: create/template validation codes,
//    template fields carried onto a car created with them, join
//    answers validated (required / choice) and stored, roster
//    answers visible only to the car's manager set, answers die
//    with the seat on leave.
// Real yoga + real resolvers + FakeDB routed by SQL shape.
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import {
  validateAvailabilitySlots, parseAvailabilitySlots,
  validatePollCandidates, parseCustomFieldDefs, validateSignupAnswers,
} from '../src/domains/groupings/index.ts';

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
/* Typed-ID fixture keys: guilds/users carry their 0036 primary keys;
   Discord-space values (server ids, seat stamps) stay Discord IDs. */
const GID = { schedtest: 1030100001, othertest: 1030100002 };
const UID = { UA: 2030100001, UL: 2030100002, UB: 2030100003, UC: 2030100004, UD: 2030100005 };
function makeDb(fx = {}) {
  const tables = {
    tenants: (fx.tenants || []).map((t) => ({ ...t })),
    settings: new Map(fx.settings || []),
    users: (fx.users || []).map(([did, gj]) => ({ id: UID[did] || 0, discord_id: did, username: '', guilds_json: gj })),
    mint: new Map(),
    events: (fx.events || []).map((e) => ({ ...e })),
    signups: (fx.signups || []).map((x) => ({ ...x })),
    guildMembers: (fx.guildMembers || []).map((m) => ({ ...m })),
    templates: (fx.templates || []).map((t) => ({ ...t })),
    customFields: [], signupAnswers: [], availability: [], polls: [], pollOptions: [], pollVotes: [],
  };
  let nextId = 9000;
  const tableOf = {
    events: tables.events, signups: tables.signups, guild_members: tables.guildMembers,
    grouping_templates: tables.templates, grouping_custom_fields: tables.customFields,
    signup_answers: tables.signupAnswers, time_polls: tables.polls,
    time_poll_options: tables.pollOptions, time_poll_votes: tables.pollVotes,
  };
  const unknownSql = new Set();
  function norm(sql) {
    return sql.replace(/"/g, '')
      .replace(/\b(tenants|settings|users|events|signups|guild_members|grouping_templates|grouping_custom_fields|signup_answers|member_availability|time_polls|time_poll_options|time_poll_votes|dungeons)\./g, '')
      .replace(/\s+/g, ' ');
  }
  function parseCols(list) { return list.split(',').map((c) => c.trim().split('.').pop()); }
  // In-place delete: tableOf holds references to these arrays, so a
  // reassignment would strand every later insert on the old array.
  function spliceWhere(arr, pred) { for (let i = arr.length - 1; i >= 0; i--) if (pred(arr[i])) arr.splice(i, 1); }
  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    if (/^INSERT INTO id_mint_counters/i.test(sql)) {
      const key = `${b[0]}|${b[1]}`;
      const seq = (tables.mint.get(key) || 0) + 1;
      tables.mint.set(key, seq);
      return kind === 'first' ? { seq } : (kind === 'all' ? { results: [{ seq }] } : { meta: { changes: 1 } });
    }
    // Availability upsert (PK tenant+user_id, DO UPDATE).
    if (/^INSERT INTO member_availability/i.test(sql)) {
      const row = { tenant: b[0], user_id: b[1], display_name: b[2], slots_json: b[3], updated_at: b[4] };
      const ex = tables.availability.find((x) => x.tenant === row.tenant && x.user_id === row.user_id);
      if (ex) Object.assign(ex, row); else tables.availability.push(row);
      return { meta: { changes: 1 } };
    }
    // Capacity-guard insert: INSERT INTO signups (cols) SELECT vals WHERE (count < max)
    let m = /^INSERT INTO signups \(([^)]+)\) SELECT/i.exec(sql);
    if (m) {
      const cols = parseCols(m[1]);
      const row = {};
      cols.forEach((c, i) => { row[c] = b[i]; });
      const ev = tables.events.find((e) => e.id === Number(row.event_id));
      const count = tables.signups.filter((x) => x.event_id === Number(row.event_id)).length;
      if (!ev || ev.status !== 'open' || count >= (ev.max_slots || 0)) return { meta: { changes: 0 } };
      if (tables.signups.some((x) => x.event_id === row.event_id && x.uid === row.uid)) throw new Error('UNIQUE constraint failed: signups_event_uid_unique');
      if (row.id === undefined) row.id = nextId++;
      tables.signups.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    m = /^INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)/i.exec(sql);
    if (m) {
      const [, table, colList] = m;
      const cols = parseCols(colList);
      const row = {};
      cols.forEach((c, i) => { row[c] = b[i]; });
      if (/ON CONFLICT/i.test(sql)) {
        if (table === 'settings') { tables.settings.set(`${row.tenant}|${row.key}`, row.value); return { meta: { changes: 1 } }; }
        if (table === 'guild_members') {
          const ex = tables.guildMembers.find((x) => x.tenant === row.tenant && x.discord_id === row.discord_id);
          if (ex) Object.assign(ex, row); else tables.guildMembers.push(row);
          return { meta: { changes: 1 } };
        }
      }
      if (row.id === undefined) row.id = nextId++;
      if (table === 'users') { if (!tables.users.some((u) => u.discord_id === row.discord_id)) tables.users.push(row); }
      else (tableOf[table] || tables.polls).push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    m = /^UPDATE (\w+) SET (.+?) WHERE (.+)$/i.exec(sql);
    if (m) {
      const [, table, setList] = m;
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
      const arr = tableOf[table];
      if (arr) rows = arr.filter((r) => r.id === Number(wb[0]));
      for (const r of rows) Object.assign(r, sets);
      return { meta: { changes: rows.length } };
    }
    if (/^DELETE FROM grouping_custom_fields WHERE owner_kind/i.test(sql)) {
      const before = tables.customFields.length;
      spliceWhere(tables.customFields, (t) => t.owner_kind === b[0] && t.owner_id === Number(b[1]));
      return { meta: { changes: before - tables.customFields.length } };
    }
    if (/^DELETE FROM time_poll_votes WHERE poll_id/i.test(sql)) {
      const before = tables.pollVotes.length;
      spliceWhere(tables.pollVotes, (t) => t.poll_id === Number(b[0]) && t.user_id === Number(b[1]));
      return { meta: { changes: before - tables.pollVotes.length } };
    }
    if (/^DELETE FROM signup_answers WHERE event_id/i.test(sql)) {
      const before = tables.signupAnswers.length;
      if (/signup_uid/i.test(sql)) spliceWhere(tables.signupAnswers, (t) => t.event_id === Number(b[0]) && t.signup_uid === b[1]);
      else spliceWhere(tables.signupAnswers, (t) => t.event_id === Number(b[0]));
      return { meta: { changes: before - tables.signupAnswers.length } };
    }
    if (/^DELETE FROM signups WHERE event_id = \? AND uid = \?/i.test(sql)) {
      const before = tables.signups.length;
      spliceWhere(tables.signups, (t) => t.event_id === Number(b[0]) && t.uid === b[1]);
      return { meta: { changes: before - tables.signups.length } };
    }
    if (/^DELETE FROM signups WHERE id = \?/i.test(sql)) {
      const before = tables.signups.length;
      spliceWhere(tables.signups, (t) => t.id === Number(b[0]));
      return { meta: { changes: before - tables.signups.length } };
    }
    if (/\b(CREATE TABLE|CREATE INDEX|ALTER TABLE|PRAGMA)\b/i.test(sql)) return kind === 'run' ? { meta: { changes: 0 } } : (kind === 'first' ? null : { results: [] });
    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });
    if (/FROM tenants WHERE slug/i.test(sql)) return first(tables.tenants.find((t) => t.slug === b[0]));
    if (/FROM tenants/i.test(sql) && /id = \?/i.test(sql)) return first(tables.tenants.find((t) => t.id === Number(b[0])));
    if (/FROM tenants/i.test(sql)) return kind === 'first' ? (tables.tenants[0] ?? null) : all(tables.tenants);
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
      for (const [k, v] of tables.settings) { const [t, key] = k.split('|'); if (key === b[0]) rows.push({ tenant: t, value: v }); }
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
    // Governance line (P16): fixture guilds hold no officer grants.
    if (/FROM guild_officer_grants/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/FROM member_availability WHERE tenant = \? AND user_id = \?/i.test(sql)) {
      return first(tables.availability.find((x) => x.tenant === b[0] && x.user_id === Number(b[1])));
    }
    if (/FROM member_availability WHERE tenant = \?/i.test(sql)) {
      return all(tables.availability.filter((x) => x.tenant === b[0]));
    }
    if (/FROM time_polls WHERE tenant = \?/i.test(sql)) {
      return all(tables.polls.filter((x) => x.tenant === b[0]).sort((x, y) => y.id - x.id));
    }
    if (/FROM time_polls WHERE id = \?/i.test(sql)) {
      return first(tables.polls.find((x) => x.id === Number(b[0])));
    }
    if (/FROM time_poll_options WHERE poll_id = \?/i.test(sql)) {
      return all(tables.pollOptions.filter((x) => x.poll_id === Number(b[0])).sort((x, y) => x.starts_at_utc - y.starts_at_utc));
    }
    if (/FROM time_poll_votes WHERE poll_id = \?/i.test(sql)) {
      return all(tables.pollVotes.filter((x) => x.poll_id === Number(b[0])));
    }
    if (/FROM grouping_custom_fields WHERE owner_kind = \? AND owner_id = \?/i.test(sql)) {
      return all(tables.customFields.filter((t) => t.owner_kind === b[0] && t.owner_id === Number(b[1])).sort((x, y) => x.sort - y.sort || x.id - y.id));
    }
    if (/FROM signup_answers WHERE event_id = \?/i.test(sql)) {
      return all(tables.signupAnswers.filter((t) => t.event_id === Number(b[0])));
    }
    if (/FROM grouping_templates WHERE tenant = \?/i.test(sql)) {
      return all(tables.templates.filter((t) => t.tenant === b[0]).sort((x, y) => y.id - x.id));
    }
    if (/FROM grouping_templates WHERE id = \?/i.test(sql)) {
      return first(tables.templates.find((t) => t.id === Number(b[0])));
    }
    if (/SELECT id FROM events WHERE tenant = \? AND creator_user_id = \?/i.test(sql)) {
      return first(tables.events.find((e) => e.tenant === b[0] && e.creator_user_id === Number(b[1])) ? { id: 1 } : null);
    }
    if (/SELECT id, tenant FROM events WHERE id = \?/i.test(sql)) {
      const ev = tables.events.find((e) => e.id === Number(b[0]));
      return first(ev ? { id: ev.id, tenant: ev.tenant } : null);
    }
    if (/SELECT \* FROM events WHERE id = \?/i.test(sql)) {
      return first(tables.events.find((e) => e.id === Number(b[0])));
    }
    if (/FROM events WHERE tenant = \? AND type = \?/i.test(sql)) {
      return all(tables.events.filter((e) => e.tenant === b[0] && e.type === b[1] && !['draft', 'completed'].includes(e.status)));
    }
    if (/FROM events WHERE tenant = \?/i.test(sql)) {
      return all(tables.events.filter((e) => e.tenant === b[0]));
    }
    if (/AS c/i.test(sql) && /FROM signups/i.test(sql) && /max_slots/i.test(sql)) {
      const ev = tables.events.find((e) => e.id === Number(b[0]));
      const rows = tables.signups.filter((x) => x.event_id === Number(b[0]));
      return first({ c: rows.length, h: rows.filter((x) => x.role === '奶' || x.role === '治疗').length, m: ev ? ev.max_slots : null });
    }
    if (/FROM signups WHERE event_id = \?/i.test(sql)) {
      return all(tables.signups.filter((x) => x.event_id === Number(b[0])).sort((x, y) => x.id - y.id));
    }
    if (/FROM guild_members/i.test(sql)) {
      let rows = tables.guildMembers.filter((x) => x.tenant === b[0]);
      if (/discord_id = \?/i.test(sql) && b.length > 1) rows = rows.filter((x) => x.discord_id === String(b[1]));
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    if (/FROM dungeons/i.test(sql)) return kind === 'first' ? null : all([]);
    unknownSql.add(kind + ': ' + sql.slice(0, 110));
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
  return { db, tables, unknownSql };
}

/* ---------------- fixtures ---------------- */
const serversJson = (rows) => JSON.stringify(rows);
const srv = (id, permissions = '0', owner = false) => ({ id, name: '测试服', icon: '', permissions, owner });
const ADMIN = { userId: UID.UA, discordId: 'UA', name: '管理员甲', guilds: [DGID_A] };
const LEADER = { userId: UID.UL, discordId: 'UL', name: '车头甲', guilds: [DGID_A] };
const MEMBER = { userId: UID.UB, discordId: 'UB', name: '成员乙', guilds: [DGID_A] };
const MEMBER2 = { userId: UID.UC, discordId: 'UC', name: '成员丙', guilds: [DGID_A] };
const ADMIN_B = { userId: UID.UD, discordId: 'UD', name: '乙业管理员', guilds: [DGID_B] };

const { db, tables, unknownSql } = makeDb({
  tenants: [
    { id: GID.schedtest, slug: 'schedtest', guild_name: '排期测试百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', discord_webhook: '', created_at: '2026-01-01 00:00:00' },
    { id: GID.othertest, slug: 'othertest', guild_name: '乙百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', discord_webhook: '', created_at: '2026-01-01 00:00:00' },
  ],
  settings: [
    [`${GID.schedtest}|discord_guild_id`, DGID_A],
    [`${GID.othertest}|discord_guild_id`, DGID_B],
    ['0|game_version', 'intl-v2.3'],
  ],
  users: [
    ['UA', serversJson([srv(DGID_A, '32')])],
    ['UL', serversJson([srv(DGID_A)])],
    ['UB', serversJson([srv(DGID_A)])],
    ['UC', serversJson([srv(DGID_A)])],
    ['UD', serversJson([srv(DGID_B, '32')])],
  ],
  guildMembers: [
    { tenant: GID.schedtest, discord_id: 'UA', nick: '管理员', global_name: '管理员甲' },
    { tenant: GID.schedtest, discord_id: 'UL', nick: '车头', global_name: '车头甲' },
    { tenant: GID.schedtest, discord_id: 'UB', nick: '乙', global_name: '成员乙' },
    { tenant: GID.schedtest, discord_id: 'UC', nick: '丙', global_name: '成员丙' },
  ],
  events: [
    { id: 601, tenant: GID.schedtest, title: '车头甲的车', type: 'activity', description: '', starts_at: '', starts_at_utc: 1999999999, meet_info: '', max_slots: 10, status: 'open', origin: 'member', created_by: '', manage_code: '', dungeon: '', creator_user_id: UID.UL, reminder_sent_at: null, reminder_error: null },
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
const nowSec = () => Math.floor(Date.now() / 1000);

describe('schedule', () => {
it('pure validators: availability slots / poll candidates / custom field defs / signup answers', () => {
  const ok = validateAvailabilitySlots([{ weekday: 3, startMinute: 1200, endMinute: 1380 }, { weekday: 1, startMinute: 60, endMinute: 120 }]);
  eq('slots sort by weekday then start', ok.slots?.map((x) => x.weekday), [1, 3]);
  eq('slot crossing midnight rejected', validateAvailabilitySlots([{ weekday: 1, startMinute: 1300, endMinute: 60 }]).error, 'availabilitySlotInvalid');
  eq('weekday 7 rejected', validateAvailabilitySlots([{ weekday: 7, startMinute: 0, endMinute: 60 }]).error, 'availabilitySlotInvalid');
  eq('end 1440 allowed', validateAvailabilitySlots([{ weekday: 6, startMinute: 1380, endMinute: 1440 }]).slots?.length, 1);
  eq('22 slots rejected as too many', validateAvailabilitySlots(Array.from({ length: 22 }, () => ({ weekday: 1, startMinute: 0, endMinute: 30 }))).error, 'availabilityTooManySlots');
  eq('parseAvailabilitySlots survives corrupt json', parseAvailabilitySlots('{nope'), []);
  const now = 2000000000;
  eq('one candidate rejected', validatePollCandidates([String(now + 3600)], now).error, 'pollOptionsInvalid');
  eq('duplicate candidates collapse below minimum', validatePollCandidates([String(now + 3600), String(now + 3600)], now).error, 'pollOptionsInvalid');
  eq('past candidate rejected', validatePollCandidates([String(now - 7200), String(now + 3600)], now).error, 'pollOptionsInvalid');
  eq('two future candidates pass sorted', validatePollCandidates([String(now + 7200), String(now + 3600)], now).candidates, [now + 3600, now + 7200]);
  eq('9 candidates rejected', validatePollCandidates(Array.from({ length: 9 }, (_, i) => String(now + 3600 * (i + 1))), now).error, 'pollOptionsInvalid');

  const six = Array.from({ length: 6 }, (_, i) => ({ label: 'F' + i, fieldType: 'TEXT' }));
  eq('6 fields rejected as too many', parseCustomFieldDefs(six).error, 'customFieldTooMany');
  eq('empty label rejected', parseCustomFieldDefs([{ label: '  ', fieldType: 'TEXT' }]).error, 'customFieldInvalid');
  eq('unknown type rejected', parseCustomFieldDefs([{ label: 'X', fieldType: 'NUMBER' }]).error, 'customFieldInvalid');
  eq('choice with 1 option rejected', parseCustomFieldDefs([{ label: 'X', fieldType: 'CHOICE', options: ['a'] }]).error, 'customFieldInvalid');
  eq('choice with duplicate options rejected', parseCustomFieldDefs([{ label: 'X', fieldType: 'CHOICE', options: ['a', 'a'] }]).error, 'customFieldInvalid');
  eq('valid defs normalize', parseCustomFieldDefs([{ label: ' 称呼 ', fieldType: 'CHOICE', options: [' 甲 ', '乙'], required: true }]).defs,
    [{ label: '称呼', fieldType: 'choice', options: ['甲', '乙'], required: true }]);

  const fields = [
    { id: 11, label: '联系方式', field_type: 'text', options_json: '[]', required: 1 },
    { id: 12, label: '吃辣', field_type: 'choice', options_json: '["辣","不辣"]', required: 0 },
  ];
  eq('missing required answer', validateSignupAnswers(fields, []).error, 'signupAnswerRequired');
  eq('choice outside options rejected', validateSignupAnswers(fields, [{ fieldId: 11, value: 'x' }, { fieldId: 12, value: '微辣' }]).error, 'signupAnswerInvalid');
  eq('unknown field rejected', validateSignupAnswers(fields, [{ fieldId: 99, value: 'x' }, { fieldId: 11, value: 'y' }]).error, 'signupAnswerInvalid');
  eq('valid answers pass', validateSignupAnswers(fields, [{ fieldId: 11, value: 'wx-1' }, { fieldId: 12, value: '辣' }]).answers,
    [{ fieldId: 11, value: 'wx-1' }, { fieldId: 12, value: '辣' }]);
  eq('optional unanswered field is skipped', validateSignupAnswers(fields, [{ fieldId: 11, value: 'wx-1' }]).answers, [{ fieldId: 11, value: 'wx-1' }]);
});

it('F5 availability GraphQL', async () => {
/* ================= F5 availability ================= */
const schedQ = `{ guildSchedulePage(slug: "schedtest") { slug myAvailability { weekday startMinute endMinute }
  availabilitySummary { discordId displayName slots { weekday startMinute endMinute } }
  polls { id title status } scheduleSummaryTitle } }`;

let r = await gql(schedQ, { user: MEMBER });
check('member page loads with empty availability', r.data?.guildSchedulePage?.myAvailability?.length === 0, JSON.stringify(r.errors || r.data));
eq('plain member gets NO summary', r.data?.guildSchedulePage?.availabilitySummary, null);

r = await gql(`mutation { setMyAvailability(input: { slug: "schedtest", slots: [{ weekday: 5, startMinute: 1140, endMinute: 1320 }, { weekday: 6, startMinute: 600, endMinute: 720 }] }) { ok errorCode slots { weekday startMinute endMinute } } }`, { user: MEMBER });
check('member saves availability', r.data?.setMyAvailability?.ok === true, JSON.stringify(r));
eq('saved slots echo sorted', r.data?.setMyAvailability?.slots?.map((x) => x.weekday), [5, 6]);

r = await gql(`mutation { setMyAvailability(input: { slug: "schedtest", slots: [{ weekday: 9, startMinute: 0, endMinute: 60 }] }) { ok errorCode } }`, { user: MEMBER2 });
eq('invalid slot rejected with code', r.data?.setMyAvailability?.errorCode, 'availabilitySlotInvalid');
r = await gql(`mutation { setMyAvailability(input: { slug: "schedtest", slots: [] }) { ok errorCode } }`, { user: null });
eq('anonymous cannot save availability', r.data?.setMyAvailability?.errorCode, 'loginRequired');
r = await gql(`mutation { setMyAvailability(input: { slug: "schedtest", slots: [] }) { ok errorCode } }`, { user: ADMIN_B });
eq('other guild admin cannot write here', r.data?.setMyAvailability?.errorCode, 'memberOnly');

r = await gql(schedQ, { user: MEMBER });
eq('member re-reads own slots', r.data?.guildSchedulePage?.myAvailability?.length, 2);
r = await gql(schedQ, { user: ADMIN });
check('guild admin sees summary with member row', (r.data?.guildSchedulePage?.availabilitySummary || []).some((x) => x.discordId === 'UB' && x.slots.length === 2), JSON.stringify(r.data?.guildSchedulePage?.availabilitySummary));
r = await gql(schedQ, { user: LEADER });
check('car leader of this guild sees summary', Array.isArray(r.data?.guildSchedulePage?.availabilitySummary), JSON.stringify(r.data));
r = await gql(schedQ, { user: ADMIN_B });
check('other guild admin gets errors, no page', !!r.errors && !r.data?.guildSchedulePage, JSON.stringify(r).slice(0, 200));
r = await gql(schedQ, { user: null });
eq('anonymous on a bound guild gets no summary', r.data?.guildSchedulePage?.availabilitySummary ?? null, null);
});

it('F13 time polls GraphQL', async () => {
/* ================= F13 polls ================= */
const t1 = nowSec() + 86400, t2 = nowSec() + 2 * 86400, t3 = nowSec() + 3 * 86400;
let r = await gql(`mutation { createTimePoll(input: { slug: "schedtest", title: "", candidateStartsAt: ["${t1}", "${t2}"] }) { ok errorCode } }`, { user: LEADER });
eq('poll without title rejected', r.data?.createTimePoll?.errorCode, 'pollTitleRequired');
r = await gql(`mutation { createTimePoll(input: { slug: "schedtest", title: "本周开荒", candidateStartsAt: ["${t1}"] }) { ok errorCode } }`, { user: LEADER });
eq('poll with one candidate rejected', r.data?.createTimePoll?.errorCode, 'pollOptionsInvalid');

const pollQ = `poll { id title status creatorName options { id startsAtUtc voteCount voterNames votedByMe } myOptionIds closeActions { closeLabel } launchActions { launchLabel } }`;
r = await gql(`mutation { createTimePoll(input: { slug: "schedtest", title: "本周开荒", candidateStartsAt: ["${t2}", "${t1}", "${t3}"] }) { ok errorCode ${pollQ} } }`, { user: LEADER });
check('leader creates poll', r.data?.createTimePoll?.ok === true, JSON.stringify(r));
const poll = r.data?.createTimePoll?.poll;
eq('poll options sorted by time', poll?.options?.map((o) => o.startsAtUtc), [t1, t2, t3]);
check('creator sees close + launch actions', !!poll?.closeActions && !!poll?.launchActions);
const pollId = poll?.id;
const [o1, o2, o3] = (poll?.options || []).map((o) => o.id);

r = await gql(`mutation { voteTimePoll(input: { pollId: "${pollId}", optionIds: ["${o1}", "${o3}"] }) { ok errorCode ${pollQ} } }`, { user: MEMBER });
check('member multi-selects two candidates', r.data?.voteTimePoll?.ok === true, JSON.stringify(r));
eq('tallies after first vote', r.data?.voteTimePoll?.poll?.options?.map((o) => o.voteCount), [1, 0, 1]);
eq('myOptionIds reflect picks', r.data?.voteTimePoll?.poll?.myOptionIds, [o1, o3]);
r = await gql(`mutation { voteTimePoll(input: { pollId: "${pollId}", optionIds: ["${o2}"] }) { ok errorCode ${pollQ} } }`, { user: MEMBER });
eq('re-vote REPLACES the whole set', r.data?.voteTimePoll?.poll?.options?.map((o) => o.voteCount), [0, 1, 0]);
r = await gql(`mutation { voteTimePoll(input: { pollId: "${pollId}", optionIds: ["999999"] }) { ok errorCode } }`, { user: MEMBER2 });
eq('foreign option rejected', r.data?.voteTimePoll?.errorCode, 'pollOptionInvalid');
r = await gql(`mutation { voteTimePoll(input: { pollId: "${pollId}", optionIds: ["${o1}", "${o2}"] }) { ok errorCode ${pollQ} } }`, { user: MEMBER2 });
eq('second voter tallies add up', r.data?.voteTimePoll?.poll?.options?.map((o) => o.voteCount), [1, 2, 0]);
// Voter names are snapshots taken at vote time (roster nick first):
// UC never touched the roster-read path, so its roster nick '丙' is
// what lands; UB's row was refreshed by its own page view first.
check('voter names snapshot from roster', (r.data?.voteTimePoll?.poll?.options?.[1]?.voterNames || []).includes('丙'), JSON.stringify(r.data?.voteTimePoll?.poll?.options?.[1]));

r = await gql(`mutation { closeTimePoll(id: "${pollId}") { ok errorCode } }`, { user: MEMBER });
eq('plain member cannot close', r.data?.closeTimePoll?.errorCode, 'pollForbidden');
r = await gql(`mutation { closeTimePoll(id: "${pollId}") { ok errorCode poll { status } } }`, { user: ADMIN });
check('guild admin closes the poll', r.data?.closeTimePoll?.ok === true && r.data?.closeTimePoll?.poll?.status === 'closed', JSON.stringify(r.data));
r = await gql(`mutation { voteTimePoll(input: { pollId: "${pollId}", optionIds: ["${o1}"] }) { ok errorCode } }`, { user: MEMBER });
eq('closed poll refuses votes', r.data?.voteTimePoll?.errorCode, 'pollClosed');
r = await gql(`mutation { closeTimePoll(id: "${pollId}") { ok errorCode } }`, { user: LEADER });
eq('closing twice refused', r.data?.closeTimePoll?.errorCode, 'pollClosed');
r = await gql(`mutation { closeTimePoll(id: "424242") { ok errorCode } }`, { user: ADMIN });
eq('unknown poll code', r.data?.closeTimePoll?.errorCode, 'pollNotFound');
});

it('F7 custom fields GraphQL', async () => {
/* ================= F7 custom fields ================= */
const FUT = nowSec() + 86400;
let r = await gql(`mutation { createGrouping(input: { slug: "schedtest", title: "字段车", type: ACTIVITY, startsAt: "${FUT}", customFields: [{ label: "吃辣", fieldType: CHOICE, options: ["辣"] }] }) { ok errorCode } }`, { user: LEADER });
eq('invalid field set rejects the whole create', r.data?.createGrouping?.errorCode, 'customFieldInvalid');
eq('no car was created by the rejected create', tables.events.filter((e) => e.title === '字段车').length, 0);

r = await gql(`mutation { createGrouping(input: { slug: "schedtest", title: "字段车", type: ACTIVITY, startsAt: "${FUT}", customFields: [{ label: "联系方式", fieldType: TEXT, required: true }, { label: "吃辣", fieldType: CHOICE, options: ["辣", "不辣"] }] }) { ok errorCode grouping { id customFields { id label fieldType options required } } } }`, { user: LEADER });
check('leader creates car with fields', r.data?.createGrouping?.ok === true, JSON.stringify(r));
const carId = r.data?.createGrouping?.grouping?.id;
const carFields = r.data?.createGrouping?.grouping?.customFields || [];
eq('car carries its two fields', carFields.map((f) => f.label), ['联系方式', '吃辣']);
const [fContact, fSpicy] = carFields.map((f) => f.id);

const detailQ = (id) => `{ groupingDetailPage(id: "${id}") { grouping { id } rosterAnswers { uid nickname fieldLabel value } rosterAnswersTitle } }`;
r = await gql(`mutation { joinGrouping(input: { groupingId: "${carId}", nickname: "x", weapon: "破竹·樽", seatIndex: 0 }) { ok errorCode } }`, { user: MEMBER });
eq('join without required answer refused', r.data?.joinGrouping?.errorCode, 'signupAnswerRequired');
r = await gql(`mutation { joinGrouping(input: { groupingId: "${carId}", nickname: "x", weapon: "破竹·樽", seatIndex: 0, answers: [{ fieldId: "${fContact}", value: "wx-9" }, { fieldId: "${fSpicy}", value: "微辣" }] }) { ok errorCode } }`, { user: MEMBER });
eq('join with out-of-options choice refused', r.data?.joinGrouping?.errorCode, 'signupAnswerInvalid');
r = await gql(`mutation { joinGrouping(input: { groupingId: "${carId}", nickname: "x", weapon: "破竹·樽", seatIndex: 0, answers: [{ fieldId: "${fContact}", value: "wx-9" }, { fieldId: "${fSpicy}", value: "辣" }] }) { ok errorCode seats { occupied nickname uid } } }`, { user: MEMBER });
check('join with valid answers seats', r.data?.joinGrouping?.ok === true, JSON.stringify(r));
const mySeat = (r.data?.joinGrouping?.seats || []).find((x) => x.occupied);
eq('answers stored for the seat uid', tables.signupAnswers.filter((a) => a.signup_uid === mySeat?.uid).map((a) => a.value).sort(), ['wx-9', '辣']);

r = await gql(detailQ(carId), { user: MEMBER2 });
eq('plain member gets NO roster answers', r.data?.groupingDetailPage?.rosterAnswers, null);
r = await gql(detailQ(carId), { user: LEADER });
check('car leader sees roster answers', (r.data?.groupingDetailPage?.rosterAnswers || []).length === 2, JSON.stringify(r.data?.groupingDetailPage?.rosterAnswers));
check('roster answer rows carry label + value + seat nickname', (r.data?.groupingDetailPage?.rosterAnswers || []).some((a) => a.fieldLabel === '联系方式' && a.value === 'wx-9' && a.nickname === mySeat?.nickname), JSON.stringify(r.data?.groupingDetailPage?.rosterAnswers));
r = await gql(detailQ(carId), { user: ADMIN });
check('guild admin sees roster answers', (r.data?.groupingDetailPage?.rosterAnswers || []).length === 2);

r = await gql(`mutation { leaveGrouping(input: { groupingId: "${carId}", uid: "${mySeat?.uid}" }) { ok errorCode } }`, { user: MEMBER });
check('member leaves', r.data?.leaveGrouping?.ok === true, JSON.stringify(r));
eq('answers die with the seat', tables.signupAnswers.filter((a) => a.signup_uid === mySeat?.uid).length, 0);

/* template carry: fields defined on a template land on request data */
r = await gql(`mutation { createGroupingTemplate(input: { slug: "schedtest", name: "带字段模板", type: ACTIVITY, title: "模板车", startsInDays: 1, startHour: 20, startMinute: 0, customFields: [{ label: "联系方式", fieldType: TEXT, required: true }] }) { ok errorCode template { id customFields { label fieldType required } } } }`, { user: MEMBER });
check('member creates template with fields', r.data?.createGroupingTemplate?.ok === true, JSON.stringify(r));
eq('template carries its field', r.data?.createGroupingTemplate?.template?.customFields?.map((f) => f.label), ['联系方式']);
const tplFieldDefs = r.data?.createGroupingTemplate?.template?.customFields || [];
r = await gql(`mutation { createGrouping(input: { slug: "schedtest", title: "模板发的车", type: ACTIVITY, startsAt: "${FUT}", customFields: [${tplFieldDefs.map((f) => `{ label: "${f.label}", fieldType: ${f.fieldType}, required: ${f.required} }`).join(',')}] }) { ok errorCode grouping { customFields { label required } } } }`, { user: MEMBER2 });
check('car created from template defs carries the fields', r.data?.createGrouping?.grouping?.customFields?.length === 1, JSON.stringify(r.data?.createGrouping));
r = await gql(`mutation { createGroupingTemplate(input: { slug: "schedtest", name: "坏模板", type: ACTIVITY, title: "x", startsInDays: 0, startHour: 20, startMinute: 0, customFields: [{ label: "a", fieldType: TEXT }, { label: "b", fieldType: TEXT }, { label: "c", fieldType: TEXT }, { label: "d", fieldType: TEXT }, { label: "e", fieldType: TEXT }, { label: "f", fieldType: TEXT }] }) { ok errorCode } }`, { user: MEMBER });
eq('template with 6 fields rejected', r.data?.createGroupingTemplate?.errorCode, 'customFieldTooMany');
});

it('no unrouted SQL', async () => {
check('无未路由 SQL', unknownSql.size === 0, [...unknownSql].join(' | '));
});

});
