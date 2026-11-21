// Weekly duplicate signup confirmation acceptance: real yoga +
// graphql.ts resolvers + FakeDB (in-memory tables).
// Rule (marcus, 2026-11-21): a member who already holds a seat in
// one car must confirm before signing up for ANOTHER car in the
// same week. The week is the platform's data-semantics week
// (weekWindowUtc: Monday 05:00 Beijing, half-open) anchored at the
// TARGET car's start — the same frame the grouping lists bucket
// cars by. Self signups only: proxy signups and roster seating
// never prompt. Coverage: the pure week/pick helpers (boundaries,
// DST-week stability) -> the join matrix (first car, duplicate
// refused with the other car named, confirm resubmits, left /
// draft / cross-week / timeless cars do not block, same-car rejoin
// keeps legacy behavior, proxy bypass) -> en copy.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { weekWindowUtc, weekWindowUtcAt } from '../src/domains/platform/blocks.ts';
import { pickWeekDuplicateCar } from '../src/domains/groupings/week-duplicate.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name, got, want) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* ---------------- pure helpers ---------------- */
// Monday 2026-11-16 05:00 Beijing = Sunday 2026-11-15 21:00 UTC.
const W0 = Date.UTC(2026, 10, 15, 21, 0, 0) / 1000;
const WEEK = 7 * 86400;

describe('weekWindowUtcAt', () => {
  it('anchors the window at Monday 05:00 Beijing', () => {
    eq('instant at window start', weekWindowUtcAt(W0)[0], W0);
    eq('window end is start + 7d', weekWindowUtcAt(W0)[1], W0 + WEEK);
    eq('mid-week instant (Wed 12:00 Beijing)', weekWindowUtcAt(W0 + 2 * 86400 + 7 * 3600)[0], W0);
    eq('one second before the start belongs to the previous week', weekWindowUtcAt(W0 - 1)[0], W0 - WEEK);
    eq('last second of the week still inside', weekWindowUtcAt(W0 + WEEK - 1)[0], W0);
    eq('the next Monday 05:00 opens the next week', weekWindowUtcAt(W0 + WEEK)[0], W0 + WEEK);
    // Monday 03:00 Beijing is before the 05:00 week start: it
    // belongs to the week that opened the previous Monday.
    eq('Monday 03:00 Beijing is the previous week', weekWindowUtcAt(W0 - 2 * 3600)[0], W0 - WEEK);
  });

  it('is offset-stable across DST transition weeks (fixed +8 frame)', () => {
    // US fall-back week 2026-11-01: the window still opens Monday
    // 2026-10-26 05:00 Beijing = 2026-10-25 21:00 UTC.
    const fallStart = Date.UTC(2026, 9, 25, 21, 0, 0) / 1000;
    eq('fall-back week start', weekWindowUtcAt(Date.UTC(2026, 10, 1, 12, 0, 0) / 1000)[0], fallStart);
    // US spring-forward week 2026-03-08: Monday 2026-03-09 05:00
    // Beijing = 2026-03-08 21:00 UTC.
    const springStart = Date.UTC(2026, 2, 8, 21, 0, 0) / 1000;
    eq('spring-forward week start', weekWindowUtcAt(Date.UTC(2026, 2, 9, 12, 0, 0) / 1000)[0], springStart);
  });

  it('weekWindowUtc stays the current-week form of the same frame', () => {
    const fakeNow = W0 + 3 * 86400 + 1234; // a Thursday inside the W0 week
    const spy = vi.spyOn(Date, 'now').mockReturnValue(fakeNow * 1000);
    try {
      eq('offset 0 = the anchored window', JSON.stringify(weekWindowUtc(0)), JSON.stringify(weekWindowUtcAt(fakeNow)));
      eq('offset +1 shifts a whole week', JSON.stringify(weekWindowUtc(1)), JSON.stringify([W0 + WEEK, W0 + 2 * WEEK]));
      eq('offset -1 shifts back', JSON.stringify(weekWindowUtc(-1)), JSON.stringify([W0 - WEEK, W0]));
    } finally {
      spy.mockRestore();
    }
  });
});

describe('pickWeekDuplicateCar', () => {
  const target = W0 + 74 * 3600; // Thursday of the W0 week
  const car = (eventId: number, startsEpoch: number | null, title = '车') => ({ eventId, title, startsEpoch });

  it('picks the other car in the same week, earliest first', () => {
    const dup = pickWeekDuplicateCar(target, 99, [
      car(5, W0 + 50 * 3600, '晚车'),
      car(3, W0 + 26 * 3600, '早车'),
    ]);
    eq('earliest wins', dup?.eventId, 3);
    eq('title carried', dup?.title, '早车');
  });

  it('never counts the target car itself', () => {
    eq('same car only', pickWeekDuplicateCar(target, 99, [car(99, W0 + 3600)]), null);
  });

  it('respects the half-open window on both sides', () => {
    check('at window start counts', pickWeekDuplicateCar(target, 99, [car(1, W0)]) !== null);
    check('last second counts', pickWeekDuplicateCar(target, 99, [car(1, W0 + WEEK - 1)]) !== null);
    eq('one second before does not', pickWeekDuplicateCar(target, 99, [car(1, W0 - 1)]), null);
    eq('at window end does not', pickWeekDuplicateCar(target, 99, [car(1, W0 + WEEK)]), null);
  });

  it('ignores timeless cars and empty lists', () => {
    eq('null start ignored', pickWeekDuplicateCar(target, 99, [car(1, null)]), null);
    eq('empty list', pickWeekDuplicateCar(target, 99, []), null);
  });
});

/* ---------------- FakeDB: in-memory tables routed by SQL shape ---------------- */
const SLUG = 'weekduptest';
const GID = 1030100001;
const UID: Record<string, number> = {};
const users: any[] = [];
for (let i = 1; i <= 8; i++) {
  UID['U' + i] = 2030100000 + i;
  users.push({ id: UID['U' + i], discord_id: 'U' + i, username: '队员' + i, guilds_json: '[]' });
}
const tables: any = { events: [], signups: [], guild_members: [], users, mint: new Map() };
const tenants = [{ id: GID, slug: SLUG, guild_name: '同周确认测试百业', slogan: '', announcement: '' }];
const settings = new Map([[`${GID}|discord_guild_id`, 'G123']]);
let nextId = 100;
const unknownSql = new Set<string>();

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

function insertRow(table, cols, vals) {
  const row = { id: nextId++ };
  cols.forEach((c, i) => { row[c] = vals[i]; });
  (tables[table] ||= []).push(row);
  return row;
}
function parseInsert(sql) {
  const m = sql.match(/INSERT INTO (\w+) \(([^)]+)\)/);
  if (!m) return null;
  return { table: m[1], cols: m[2].split(',').map((x) => x.trim()) };
}
function parseValues(sql, binds) {
  const vm = sql.match(/VALUES\s*\(([\s\S]*?)\)\s*(?:ON CONFLICT|RETURNING|$|;)/);
  if (!vm) {
    const alt = sql.match(/VALUES\s*\(([\s\S]*)\)/);
    if (!alt) return null;
    return splitTokens(alt[1], binds);
  }
  return splitTokens(vm[1], binds);
}
function splitTokens(body, binds) {
  const toks: string[] = [];
  let cur = '', inQ = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inQ) {
      cur += ch;
      if (ch === "'") { if (body[i + 1] === "'") { cur += "'"; i++; } else inQ = false; }
    } else if (ch === "'") { inQ = true; cur += ch; }
    else if (ch === ',') { toks.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) toks.push(cur.trim());
  let bi = 0;
  return toks.map((t) => {
    if (t === '?') return binds[bi++];
    if (/^'.*'$/s.test(t)) return t.slice(1, -1).replace(/''/g, "'");
    if (/^NULL$/i.test(t)) return null;
    if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
    return t;
  });
}

function stmt(sql) {
  sql = sql.replace(/"/g, '').replace(/settings\./g, '');
  const q = {
    _binds: [] as any[],
    bind(...a) { this._binds = a; return this; },
    async raw() { const res = await this.all(); return toRawRows(sql, (res && res.results) || []); },
    async first() {
      const b = this._binds;
      if (/INSERT INTO id_mint_counters/.test(sql)) {
        const key = `${b[0]}|${b[1]}`;
        const seq = (tables.mint.get(key) || 0) + 1;
        tables.mint.set(key, seq);
        return { seq };
      }
      if (/FROM users/.test(sql) && /WHERE id = \?/.test(sql)) return tables.users.find((u) => u.id === Number(b[0])) || null;
      if (/FROM users/.test(sql) && /discord_id = \?/.test(sql)) return tables.users.find((u) => u.discord_id === String(b[0])) || null;
      if (/FROM tenants WHERE slug/.test(sql)) return tenants.find((t) => t.slug === b[0]) || null;
      if (/FROM settings/.test(sql)) {
        const v = settings.get(`${b[0]}|${b[1]}`);
        return v === undefined ? null : { value: v };
      }
      if (/SELECT \* FROM events WHERE id = \?/.test(sql)) return tables.events.find((e) => e.id === Number(b[0])) || null;
      if (/AS c,/.test(sql) && /FROM signups/.test(sql)) {
        const gid = Number(b[0]);
        const rows = tables.signups.filter((r) => r.event_id === gid);
        const ev = tables.events.find((e) => e.id === gid);
        return { c: rows.length, h: rows.filter((r) => r.role === '奶' || r.role === '治疗').length, m: ev ? ev.max_slots : 0 };
      }
      if (/CREATE|ALTER/.test(sql)) return null;
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
      if (/FROM users/.test(sql) && /WHERE id = \?/.test(sql)) {
        const u = tables.users.find((x) => x.id === Number(b[0])) || null;
        return { results: u ? [u] : [] };
      }
      if (/FROM users/.test(sql) && /discord_id = \?/.test(sql)) {
        const u = tables.users.find((x) => x.discord_id === String(b[0])) || null;
        return { results: u ? [u] : [] };
      }
      if (/FROM users/.test(sql)) return { results: tables.users };
      if (/FROM settings/.test(sql)) {
        if (/tenant = \?/.test(sql)) {
          const v = settings.get(`${b[0]}|${b[1]}`);
          return { results: v === undefined ? [] : [{ value: v }] };
        }
        const rows: any[] = [];
        for (const [k, v] of settings) {
          const [t, key] = k.split('|');
          if (key === b[0]) rows.push({ tenant: t, value: v });
        }
        return { results: rows };
      }
      if (/FROM grouping_custom_fields/.test(sql)) return { results: [] };
      if (/FROM user_guild_nicks/.test(sql)) return { results: [] };
      if (/FROM guild_members/.test(sql)) {
        const row = tables.guild_members.find((m) => m.tenant === Number(b[0]) && m.discord_id === String(b[1])) || null;
        return { results: row ? [row] : [] };
      }
      if (/FROM signups JOIN events/.test(sql) && /discord_id = \?/.test(sql)) {
        const rows = tables.signups
          .filter((r) => r.discord_id === String(b[0]))
          .map((r) => {
            const ev = tables.events.find((e) => e.id === r.event_id);
            return ev ? {
              event_id: ev.id, event_title: ev.title, event_status: ev.status,
              starts_at: ev.starts_at, starts_at_utc: ev.starts_at_utc,
            } : null;
          })
          .filter(Boolean)
          .sort((x, y) => x.event_id - y.event_id);
        return { results: rows };
      }
      if (/FROM events WHERE id = \?/.test(sql)) {
        const row = tables.events.find((e) => e.id === Number(b[0])) || null;
        return { results: row ? [row] : [] };
      }
      if (/AS c,/.test(sql) && /FROM signups/.test(sql)) {
        const gid = Number(b[0]);
        const rows = tables.signups.filter((r) => r.event_id === gid);
        const ev = tables.events.find((e) => e.id === gid);
        return { results: [{ c: rows.length, h: rows.filter((r) => r.role === '奶' || r.role === '治疗').length, m: ev ? ev.max_slots : 0 }] };
      }
      if (/FROM signups WHERE event_id\s*=\s*\?/.test(sql)) {
        return { results: tables.signups.filter((r) => r.event_id === Number(b[0])) };
      }
      if (/FROM tenants/.test(sql) && /slug = \?/.test(sql)) {
        const row = tenants.find((x) => x.slug === b[0]) || null;
        return { results: row ? [row] : [] };
      }
      if (/FROM tenants/.test(sql) && /WHERE id = \?/.test(sql)) {
        const row = tenants.find((x) => x.id === Number(b[0])) || null;
        return { results: row ? [row] : [] };
      }
      if (/FROM tenants/.test(sql)) return { results: tenants };
      if (/CREATE|ALTER|PRAGMA/.test(sql)) return { results: [] };
      unknownSql.add('all: ' + sql.slice(0, 90));
      return { results: [] };
    },
    async run() {
      const b = this._binds;
      if (/CREATE|ALTER/.test(sql)) return { meta: { changes: 0 } };
      if (/^INSERT INTO/.test(sql)) {
        const ins = parseInsert(sql);
        if (!ins) { unknownSql.add('run-insert: ' + sql.slice(0, 90)); return { meta: { changes: 0 } }; }
        if (/INSERT INTO signups/.test(sql) && /COUNT\(\*\) FROM signups/.test(sql) && !/VALUES/.test(sql)) {
          const v: any = {};
          ins.cols.forEach((c, i) => { v[c] = b[i]; });
          const gid = Number(v.event_id);
          const ev = tables.events.find((e) => e.id === gid);
          const cnt = tables.signups.filter((r) => r.event_id === gid).length;
          if (!ev || ev.status !== 'open' || cnt >= ev.max_slots) return { meta: { changes: 0 } };
          const row = insertRow(ins.table, ins.cols, b.slice(0, ins.cols.length));
          return { meta: { changes: 1, last_row_id: row.id } };
        }
        const vals = parseValues(sql, b);
        if (!vals) { unknownSql.add('run-values: ' + sql.slice(0, 90)); return { meta: { changes: 0 } }; }
        const row = insertRow(ins.table, ins.cols, vals);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      if (/^DELETE FROM signup_answers/.test(sql)) return { meta: { changes: 0 } };
      if (/^DELETE FROM signups WHERE event_id = \? AND uid = \?/.test(sql)) {
        const i = tables.signups.findIndex((r) => r.event_id === Number(b[0]) && r.uid === String(b[1]));
        if (i >= 0) tables.signups.splice(i, 1);
        return { meta: { changes: i >= 0 ? 1 : 0 } };
      }
      if (/^DELETE FROM signups WHERE id = \?/.test(sql)) {
        const i = tables.signups.findIndex((r) => r.id === Number(b[0]));
        if (i >= 0) tables.signups.splice(i, 1);
        return { meta: { changes: i >= 0 ? 1 : 0 } };
      }
      if (/^UPDATE/.test(sql)) return { meta: { changes: 1 } };
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
const env = { DB: db };

const leader = { userId: UID.U1, discordId: 'U1', name: '队员1', guilds: ['G123'] };
const asUser = (n: number) => ({ userId: UID['U' + n], discordId: 'U' + n, name: '队员' + n, guilds: ['G123'] });

async function gql(query, { user = leader, locale = 'zh-CN', variables } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale, browserLocale: locale, tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

const joinMut = `mutation($input: JoinGroupingInput!) {
  joinGrouping(input: $input) { ok error errorCode seats { nickname occupied } }
}`;
const leaveMut = `mutation($input: LeaveGroupingInput!) {
  leaveGrouping(input: $input) { ok error errorCode }
}`;

let carSeq = 5000;
function seedCar(title: string, startsEpoch: number | null, status = 'open') {
  const id = ++carSeq;
  tables.events.push({
    id, tenant: GID, title, type: 'activity', description: '',
    starts_at: startsEpoch == null ? '' : String(startsEpoch), meet_info: '',
    max_slots: 10, status, starts_at_utc: startsEpoch, origin: 'member',
    created_by: '队员1', manage_code: '', dungeon: '', creator_user_id: UID.U1,
    created_tz: 'Asia/Shanghai', reminder_sent_at: null, reminder_error: null,
    ally_visible: 0, visitor_slots: 0,
  });
  return id;
}
let seatSeq = 9000;
function seedSeat(eventId: number, discordId: string, nickname: string) {
  const id = ++seatSeq;
  tables.signups.push({
    id, event_id: eventId, nickname, uid: 'seed-uid-' + id, role: '输出',
    weapon: '破竹·樽', contact: '', note: '', team_name: null, members: null,
    created_at: '', discord_id: discordId, ready_at: null, is_visitor: 0,
  });
  return id;
}
function join(user: any, groupingId: number, extra: any = {}, locale = 'zh-CN') {
  return gql(joinMut, {
    user, locale,
    variables: { input: { groupingId: String(groupingId), nickname: user.name, weapon: '破竹·樽', seatIndex: 0, ...extra } },
  });
}
const seatsOf = (eventId: number, discordId: string) =>
  tables.signups.filter((r) => r.event_id === eventId && r.discord_id === discordId);

beforeEach(() => {
  tables.events.length = 0;
  tables.signups.length = 0;
  tables.guild_members.length = 0;
  for (let i = 1; i <= 8; i++) {
    tables.guild_members.push({ tenant: GID, discord_id: 'U' + i, nick: '队员' + i, global_name: '队员' + i });
  }
});

describe('joinGrouping weekly duplicate confirmation', () => {
  it('first car of the week joins without any prompt', async () => {
    const a = seedCar('本周首车', W0 + 26 * 3600);
    const r = await join(asUser(2), a);
    eq('ok', r.data?.joinGrouping?.ok, true);
    eq('seat written', seatsOf(a, 'U2').length, 1);
  });

  it('second car in the same week is refused, naming the first car, and writes nothing', async () => {
    const a = seedCar('先报名的车', W0 + 26 * 3600);
    const b = seedCar('同周第二辆', W0 + 74 * 3600);
    await join(asUser(2), a);
    const r = await join(asUser(2), b);
    eq('refused', r.data?.joinGrouping?.ok, false);
    eq('error code', r.data?.joinGrouping?.errorCode, 'alreadyBookedThisWeek');
    check('message names the booked car', (r.data?.joinGrouping?.error || '').includes('先报名的车'), r.data?.joinGrouping?.error);
    check('message carries the week framing', (r.data?.joinGrouping?.error || '').includes('本周你已报名'), r.data?.joinGrouping?.error);
    eq('no seat written on refusal', seatsOf(b, 'U2').length, 0);
  });

  it('resubmitting with the confirm flag joins', async () => {
    const a = seedCar('先报名的车', W0 + 26 * 3600);
    const b = seedCar('同周第二辆', W0 + 74 * 3600);
    await join(asUser(2), a);
    const refused = await join(asUser(2), b);
    eq('first attempt refused', refused.data?.joinGrouping?.errorCode, 'alreadyBookedThisWeek');
    const confirmed = await join(asUser(2), b, { confirmWeekDuplicate: true });
    eq('confirmed ok', confirmed.data?.joinGrouping?.ok, true);
    eq('seat written after confirm', seatsOf(b, 'U2').length, 1);
  });

  it('the refusal message is localized (en)', async () => {
    const a = seedCar('Early Car', W0 + 26 * 3600);
    const b = seedCar('Later Car', W0 + 74 * 3600);
    await join(asUser(2), a, {}, 'en');
    const r = await join(asUser(2), b, {}, 'en');
    eq('error code', r.data?.joinGrouping?.errorCode, 'alreadyBookedThisWeek');
    check('en message names the car', (r.data?.joinGrouping?.error || '').includes('Early Car'), r.data?.joinGrouping?.error);
    check('en message is English', (r.data?.joinGrouping?.error || '').includes('already signed up'), r.data?.joinGrouping?.error);
  });

  it('cars in other weeks do not block', async () => {
    const prev = seedCar('上周的车', W0 - 2 * 3600);
    const next = seedCar('下周的车', W0 + WEEK + 2 * 3600);
    const target = seedCar('本周目标车', W0 + 74 * 3600);
    await join(asUser(2), prev);
    await join(asUser(2), next);
    const r = await join(asUser(2), target);
    eq('target joins freely', r.data?.joinGrouping?.ok, true);
  });

  it('leaving the first car clears the block', async () => {
    const a = seedCar('先报名的车', W0 + 26 * 3600);
    const b = seedCar('同周第二辆', W0 + 74 * 3600);
    await join(asUser(3), a);
    const blocked = await join(asUser(3), b);
    eq('blocked while seated', blocked.data?.joinGrouping?.errorCode, 'alreadyBookedThisWeek');
    const mySeat = seatsOf(a, 'U3')[0];
    const left = await gql(leaveMut, {
      user: asUser(3),
      variables: { input: { groupingId: String(a), uid: mySeat.uid } },
    });
    eq('leave ok', left.data?.leaveGrouping?.ok, true);
    const r = await join(asUser(3), b);
    eq('joins after leaving', r.data?.joinGrouping?.ok, true);
  });

  it('a seat in a draft car does not count', async () => {
    const draft = seedCar('草稿车', W0 + 30 * 3600, 'draft');
    const target = seedCar('本周目标车', W0 + 74 * 3600);
    seedSeat(draft, 'U4', '队员4');
    const r = await join(asUser(4), target);
    eq('joins freely', r.data?.joinGrouping?.ok, true);
  });

  it('a seat in a completed car still counts (the seat was never left)', async () => {
    const done = seedCar('已完成的车', W0 + 26 * 3600, 'completed');
    const target = seedCar('本周目标车', W0 + 74 * 3600);
    seedSeat(done, 'U4', '队员4');
    const r = await join(asUser(4), target);
    eq('still refused', r.data?.joinGrouping?.errorCode, 'alreadyBookedThisWeek');
  });

  it('week boundaries at the GraphQL level: window start counts, window end does not', async () => {
    const atStart = seedCar('周界开始车', W0);
    const atEnd = seedCar('周界结束车', W0 + WEEK);
    const target = seedCar('本周目标车', W0 + 3600);
    seedSeat(atStart, 'U5', '队员5');
    const blocked = await join(asUser(5), target);
    eq('seat at Monday 05:00 sharp blocks', blocked.data?.joinGrouping?.errorCode, 'alreadyBookedThisWeek');
    check('names the boundary car', (blocked.data?.joinGrouping?.error || '').includes('周界开始车'), blocked.data?.joinGrouping?.error);
    seedSeat(atEnd, 'U6', '队员6');
    const free = await join(asUser(6), target);
    eq('seat at next Monday 05:00 does not block', free.data?.joinGrouping?.ok, true);
  });

  it('re-joining the same car keeps the legacy path (never the week prompt)', async () => {
    const a = seedCar('同一辆车', W0 + 26 * 3600);
    await join(asUser(7), a);
    const r = await join(asUser(7), a);
    check('week prompt does not fire for the same car',
      r.data?.joinGrouping?.errorCode !== 'alreadyBookedThisWeek',
      JSON.stringify(r.data?.joinGrouping));
  });

  it('proxy signup never prompts (the manager seats someone else)', async () => {
    const a = seedCar('先报名的车', W0 + 26 * 3600);
    const b = seedCar('同周第二辆', W0 + 74 * 3600);
    seedSeat(a, 'U7', '队员7');
    const r = await gql(joinMut, {
      user: leader,
      variables: { input: { groupingId: String(b), nickname: '队员7', weapon: '破竹·樽', seatIndex: 0, forDiscordId: 'U7' } },
    });
    eq('proxy join ok without confirm', r.data?.joinGrouping?.ok, true);
    eq('seat landed on the target member', seatsOf(b, 'U7').length, 1);
  });

  it('a timeless target car belongs to no week and is never blocked', async () => {
    const a = seedCar('先报名的车', W0 + 26 * 3600);
    const timeless = seedCar('无时间车', null);
    seedSeat(a, 'U8', '队员8');
    const r = await join(asUser(8), timeless);
    eq('joins freely', r.data?.joinGrouping?.ok, true);
  });

  it('no unknown SQL was routed', () => {
    eq('unknownSql empty', unknownSql.size, 0);
  });
});
