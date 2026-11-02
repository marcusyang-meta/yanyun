// Car home timezone (0039 + 0040 + car-tz.ts) acceptance:
//  - capture rule: only runtime-known IANA zones are accepted from
//    the client x-tz header; anything else counts as "not captured";
//  - member capture: users.last_tz persists the signed-in member's
//    latest zone, written only when it changes;
//  - resolution chain: the car's own created_tz, else the creator's
//    zone (persisted member zone first, then their latest captured
//    zone on another car in the SAME guild), else the guild roster's
//    mode zone, else Asia/Shanghai — never borrowed across guilds;
//  - labels: recognised zones get their Chinese name (美西/美东/
//    北京时间…), unmapped zones fall back to the real UTC offset at
//    the printed instant, the UTC zone itself stays "UTC";
//  - rendering: weekday + wall clock in the home zone, correct
//    across DST boundaries (both transition directions, incl. the
//    repeated hour at fall-back);
//  - repository plumbing: insertEvent/updateEventFields carry the
//    created_tz column end to end.
// FakeDB routes by SQL shape (same pattern as shortlink.test.ts).
import { describe, it, expect } from 'vitest';
import {
  isValidIanaTz, capturedTzOrNull, resolveCarHomeTz, pickGuildModeTz, carTzLabelZh,
  fmtCarTimeZoned, tzOffsetMinutes, CAR_HOME_TZ_FALLBACK,
} from '../src/domains/groupings/car-tz.ts';
import { insertEvent, updateEventFields, getEventRow } from '../src/domains/groupings/events.ts';
import {
  getUserLastTz, recordUserLastTzIfChanged, listGuildMemberTzStats,
} from '../src/domains/identity/index.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

const sec = (iso: string) => Math.floor(Date.parse(iso) / 1000);

/* ---------------- FakeDB ---------------- */
const GID = 1030100001;
const GID2 = 1030200001;
const UID1 = 2030100001;
const UID2 = 2030200001;

function evRow(id: number, over: Record<string, any> = {}) {
  return {
    id, tenant: GID, type: 'activity', title: '车' + id, description: '', dungeon: '',
    max_slots: 10, starts_at: '', starts_at_utc: null, status: 'open', origin: 'member',
    creator_user_id: UID1, created_by: '', created_tz: null,
    reminder_sent_at: null, reminder_error: null, ...over,
  };
}

function toRawRows(sqlText: string, rows: any[]) {
  if (!rows || !rows.length) return [];
  let cols: string[] | null = null;
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

function userRow(id: number, over: Record<string, any> = {}) {
  return {
    id, discord_id: 'dc' + id, username: 'u' + id, avatar: '', guilds_json: '[]',
    last_tz: null, updated_at: '1700000000', ...over,
  };
}

function memberRow(tenant: number, discordId: string) {
  return { tenant, discord_id: discordId, nick: '', global_name: '', updated_at: 1700000000 };
}

function makeDb(seed: any = []) {
  const s = Array.isArray(seed) ? { events: seed } : seed;
  const state = {
    events: (s.events || []).map((e: any) => ({ ...e })),
    users: (s.users || []).map((u: any) => ({ ...u })),
    members: (s.members || []).map((m: any) => ({ ...m })),
    counters: new Map<string, number>(),
  };
  function route(kind: string, sqlRaw: string, b: any[]) {
    const sql = sqlRaw.replace(/"/g, '').replace(/events\./g, '').replace(/id_mint_counters\./g, '')
      .replace(/users\./g, '').replace(/guild_members\./g, '');
    if (/INSERT INTO id_mint_counters/.test(sql)) {
      const key = `${b[0]}/${b[1]}`;
      const next = (state.counters.get(key) || 0) + 1;
      state.counters.set(key, next);
      const row = { seq: next };
      return kind === 'first' ? row : { results: [row] };
    }
    if (/INSERT INTO events/.test(sql)) {
      const m = /INSERT INTO events \(([^)]+)\)/.exec(sql);
      const cols = m![1].split(',').map((s) => s.trim());
      const row: Record<string, any> = {};
      cols.forEach((c, i) => { row[c] = b[i]; });
      state.events.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    if (/UPDATE events/.test(sql)) {
      const m = /SET ([\s\S]+?) WHERE/.exec(sql);
      const assigns = m![1].split(',').map((s) => s.trim());
      const id = Number(b[b.length - 1]);
      const row = state.events.find((e) => e.id === id);
      if (row) assigns.forEach((a, i) => { row[a.split('=')[0].trim()] = b[i]; });
      return { meta: { changes: row ? 1 : 0, last_row_id: 0 } };
    }
    if (/UPDATE users/.test(sql)) {
      // recordUserLastTzIfChanged: SET last_tz = ? WHERE id = ? AND
      // (last_tz IS NULL OR last_tz != ?) — apply the guard for real.
      const [tz, userId] = b;
      const row = state.users.find((u) => u.id === Number(userId));
      const changed = !!row && (row.last_tz === null || row.last_tz !== tz);
      if (changed && row) row.last_tz = tz;
      return { meta: { changes: changed ? 1 : 0, last_row_id: 0 } };
    }
    if (/FROM guild_members/.test(sql)) {
      // listGuildMemberTzStats: roster joined to users, grouped by zone.
      const tenant = Number(b[0]);
      const byZone = new Map<string, { tz: string; member_count: number; latest_active_at: number }>();
      for (const m of state.members) {
        if (m.tenant !== tenant) continue;
        const u = state.users.find((x) => x.discord_id === m.discord_id);
        if (!u || u.last_tz == null) continue;
        const cur = byZone.get(u.last_tz) || { tz: u.last_tz, member_count: 0, latest_active_at: 0 };
        cur.member_count += 1;
        cur.latest_active_at = Math.max(cur.latest_active_at, parseInt(u.updated_at, 10) || 0);
        byZone.set(u.last_tz, cur);
      }
      const rows = [...byZone.values()];
      return kind === 'first' ? (rows[0] ?? null) : { results: rows };
    }
    if (/FROM users/.test(sql)) {
      const row = state.users.find((u) => u.id === Number(b[0])) || null;
      const shaped = row ? { last_tz: row.last_tz } : null;
      return kind === 'first' ? shaped : { results: shaped ? [shaped] : [] };
    }
    if (/FROM events/.test(sql)) {
      // The resolver probe: latest captured zone of one creator in one guild.
      if (/created_tz IS NOT NULL/.test(sql) && /creator_user_id/.test(sql)) {
        const [tenant, creator, excludeId] = b;
        const cands = state.events
          .filter((e) => e.tenant === tenant && e.creator_user_id === creator && e.created_tz != null && e.id !== Number(excludeId))
          .sort((x, y) => y.id - x.id);
        const row = cands.length ? { created_tz: cands[0].created_tz } : null;
        return kind === 'first' ? row : { results: row ? [row] : [] };
      }
      if (/WHERE id = \?/.test(sql)) {
        const row = state.events.find((e) => e.id === Number(b[0])) || null;
        return kind === 'first' ? row : { results: row ? [row] : [] };
      }
      return kind === 'first' ? null : { results: [] };
    }
    if (kind === 'first') return null;
    if (kind === 'all') return { results: [] };
    return { meta: {} };
  }
  const stmt = (sql: string) => ({
    _b: [] as any[], bind(...a: any[]) { this._b = a; return this; },
    async raw() { const res: any = await route('all', sql, this._b); return toRawRows(sql, (res && res.results) || []); },
    async first() { return route('first', sql, this._b); },
    async all() { return route('all', sql, this._b); },
    async run() { return route('run', sql, this._b); },
  });
  return { db: { prepare: (sql: string) => stmt(sql) } as any, state };
}

/* ================= capture rule ================= */
describe('car-tz capture rule', () => {
  it('accepts real zones, rejects junk', () => {
    eq('IANA 洛杉矶合法', isValidIanaTz('America/Los_Angeles'), true);
    eq('IANA 上海合法', isValidIanaTz('Asia/Shanghai'), true);
    eq('乱写的区名拒绝', isValidIanaTz('Mars/Olympus'), false);
    eq('空串拒绝', isValidIanaTz(''), false);
    eq('null 拒绝', isValidIanaTz(null), false);
    eq('超长串拒绝', isValidIanaTz('A'.repeat(65)), false);
    eq('capturedTzOrNull 合法直通', capturedTzOrNull('Europe/Paris'), 'Europe/Paris');
    eq('capturedTzOrNull 非法归 null', capturedTzOrNull('GMT+8'), null);
    eq('capturedTzOrNull 缺失归 null', capturedTzOrNull(undefined), null);
  });
});

/* ================= labels ================= */
describe('car-tz labels', () => {
  it('named zones and offset fallback', () => {
    const jan = sec('2025-01-01T00:00:00Z');
    eq('上海 = 北京时间', carTzLabelZh('Asia/Shanghai', jan), '北京时间');
    eq('洛杉矶 = 美西', carTzLabelZh('America/Los_Angeles', jan), '美西');
    eq('纽约 = 美东', carTzLabelZh('America/New_York', jan), '美东');
    eq('温哥华 = 美西', carTzLabelZh('America/Vancouver', jan), '美西');
    eq('东京 = 东京时间', carTzLabelZh('Asia/Tokyo', jan), '东京时间');
    eq('UTC 区本身仍标 UTC', carTzLabelZh('UTC', jan), 'UTC');
    eq('未映射开罗 -> 真实偏移 UTC+2', carTzLabelZh('Africa/Cairo', jan), 'UTC+2');
    eq('未映射加德满都 -> 半小时偏移 UTC+5:45', carTzLabelZh('Asia/Kathmandu', jan), 'UTC+5:45');
    eq('偏移分钟数 (上海)', tzOffsetMinutes(jan, 'Asia/Shanghai'), 480);
    eq('偏移随夏令时变 (洛杉矶冬)', tzOffsetMinutes(jan, 'America/Los_Angeles'), -480);
    eq('偏移随夏令时变 (洛杉矶夏)', tzOffsetMinutes(sec('2025-07-01T00:00:00Z'), 'America/Los_Angeles'), -420);
  });
});

/* ================= zoned rendering ================= */
describe('car-tz zoned rendering', () => {
  it('renders wall clock + label in the home zone', () => {
    eq('上海渲染', fmtCarTimeZoned(sec('2025-01-01T00:00:00Z'), 'Asia/Shanghai'), '周三 08:00 北京时间');
    eq('美西渲染 (与标题语义 13:30 对齐)', fmtCarTimeZoned(sec('2026-11-01T21:30:00Z'), 'America/Los_Angeles'), '周日 13:30 美西');
    eq('空值 -> 空串', fmtCarTimeZoned(0, 'Asia/Shanghai'), '');
    eq('null -> 空串', fmtCarTimeZoned(null, 'Asia/Shanghai'), '');
    eq('非法区 -> 回退上海渲染', fmtCarTimeZoned(sec('2025-01-01T00:00:00Z'), 'Bogus/Zone'), '周三 08:00 北京时间');
    eq('缺省常量 = Asia/Shanghai', CAR_HOME_TZ_FALLBACK, 'Asia/Shanghai');
  });

  it('is correct across DST boundaries', () => {
    // Fall-back 2026: Nov 1, 02:00 PDT -> 01:00 PST; the 01:30 wall
    // time happens twice — both instants render 01:30 美西.
    eq('回拨前 (PDT) 的 01:30', fmtCarTimeZoned(sec('2026-11-01T08:30:00Z'), 'America/Los_Angeles'), '周日 01:30 美西');
    eq('回拨后 (PST) 的 01:30', fmtCarTimeZoned(sec('2026-11-01T09:30:00Z'), 'America/Los_Angeles'), '周日 01:30 美西');
    // Spring-forward 2026: Mar 8, 02:00 PST -> 03:00 PDT; 02:30 does
    // not exist — the instants around the gap render 01:30 / 03:30.
    eq('前跳前 (PST) 01:30', fmtCarTimeZoned(sec('2026-03-08T09:30:00Z'), 'America/Los_Angeles'), '周日 01:30 美西');
    eq('前跳后 (PDT) 03:30', fmtCarTimeZoned(sec('2026-03-08T10:30:00Z'), 'America/Los_Angeles'), '周日 03:30 美西');
    // Weekday follows the ZONE's calendar day, not UTC's: late Sunday
    // UTC is already Monday in Shanghai.
    eq('星期按所在时区的日期算', fmtCarTimeZoned(sec('2026-11-01T21:30:00Z'), 'Asia/Shanghai'), '周一 05:30 北京时间');
  });
});

/* ================= resolution chain ================= */
describe('car-tz resolution chain', () => {
  it('own stamp wins; then same-guild creator fleet; then default', async () => {
    const { db } = makeDb([
      evRow(501, { created_tz: 'America/Los_Angeles' }),            // creator's older car, stamped
      evRow(502, { tenant: GID2, created_tz: 'Asia/Tokyo' }),       // same creator, OTHER guild — must not leak in
      evRow(503, { creator_user_id: UID2, created_tz: 'Asia/Tokyo' }), // another creator's car in this guild
    ]);
    eq('本车有戳 -> 用本车的', await resolveCarHomeTz(db, evRow(601, { created_tz: 'Europe/Paris' })), 'Europe/Paris');
    eq('本车无戳 -> 同百业同创建者最近的戳', await resolveCarHomeTz(db, evRow(602)), 'America/Los_Angeles');
    eq('创建者在本百业无戳 -> 平台默认 (不借别百业/别人的)', await resolveCarHomeTz(db, evRow(603, { creator_user_id: 999999 })), 'Asia/Shanghai');
    eq('无创建者记录 -> 平台默认', await resolveCarHomeTz(db, evRow(604, { creator_user_id: null })), 'Asia/Shanghai');
    eq('本车戳非法 -> 当没戳继续下探', await resolveCarHomeTz(db, evRow(605, { created_tz: 'Bogus/Zone' })), 'America/Los_Angeles');
  });
});

/* ================= repository plumbing ================= */
describe('car-tz repository plumbing', () => {
  it('insertEvent and updateEventFields carry created_tz', async () => {
    const { db, state } = makeDb();
    const r = await insertEvent(db, {
      tenant: GID, title: '落戳车', type: 'activity', description: '', starts_at: '',
      starts_at_utc: 1999999999, max_slots: 10, status: 'open', origin: 'member',
      created_by: '热心侠客', dungeon: '', creator_user_id: UID1,
      created_tz: capturedTzOrNull('America/Los_Angeles'),
    });
    const stored = state.events.find((e) => e.id === r.last_row_id);
    check('insert 落行', !!stored);
    eq('created_tz 随 insert 落库', stored?.created_tz, 'America/Los_Angeles');
    eq('读回带 created_tz', (await getEventRow(db, r.last_row_id))?.created_tz, 'America/Los_Angeles');

    await updateEventFields(db, r.last_row_id, null, { starts_at_utc: 1999999999, created_tz: capturedTzOrNull('Asia/Taipei') });
    eq('改时间重落戳', (await getEventRow(db, r.last_row_id))?.created_tz, 'Asia/Taipei');
  });
});

/* ================= member tz persistence (0040) ================= */
describe('car-tz member persistence', () => {
  it('records the member zone only when it changes', async () => {
    const { db, state } = makeDb({ users: [userRow(UID1)] });
    eq('从未捕获 -> 读为 null', await getUserLastTz(db, UID1), null);
    eq('首次捕获落库', await recordUserLastTzIfChanged(db, UID1, 'America/Los_Angeles'), true);
    eq('落库后读回', await getUserLastTz(db, UID1), 'America/Los_Angeles');
    eq('同值重报不写', await recordUserLastTzIfChanged(db, UID1, 'America/Los_Angeles'), false);
    eq('值仍在', await getUserLastTz(db, UID1), 'America/Los_Angeles');
    eq('换区才再写', await recordUserLastTzIfChanged(db, UID1, 'Asia/Tokyo'), true);
    eq('换区后读回', await getUserLastTz(db, UID1), 'Asia/Tokyo');
    eq('不存在的用户不写', await recordUserLastTzIfChanged(db, 424242, 'Asia/Tokyo'), false);
    check('未知用户没有被造出来', !state.users.some((u) => u.id === 424242));
  });

  it('guild tz stats join roster to users and skip uncaptured members', async () => {
    const { db } = makeDb({
      users: [
        userRow(UID1, { last_tz: 'America/Los_Angeles', updated_at: '1700000100' }),
        userRow(UID2, { last_tz: 'America/Los_Angeles', updated_at: '1700000200' }),
        userRow(2030300001, { last_tz: 'Asia/Tokyo', updated_at: '1700000300' }),
        userRow(2030400001, { last_tz: null }),
        userRow(2030500001, { last_tz: 'Europe/Paris', updated_at: '1700000400' }), // not on this roster
      ],
      members: [
        memberRow(GID, 'dc' + UID1), memberRow(GID, 'dc' + UID2),
        memberRow(GID, 'dc2030300001'), memberRow(GID, 'dc2030400001'),
        memberRow(GID2, 'dc2030500001'),
      ],
    });
    const stats = await listGuildMemberTzStats(db, GID);
    const la = stats.find((s) => s.tz === 'America/Los_Angeles');
    const tyo = stats.find((s) => s.tz === 'Asia/Tokyo');
    eq('统计只含本百业有投票的区', stats.length, 2);
    eq('美西人数', la?.member_count, 2);
    eq('美西最近活跃取成员最大值', la?.latest_active_at, 1700000200);
    eq('东京人数', tyo?.member_count, 1);
    eq('别百业成员不计入', await listGuildMemberTzStats(db, GID2).then((r) => r.length), 1);
  });
});

/* ================= guild mode picker ================= */
describe('car-tz guild mode picker', () => {
  const stat = (tz: string, member_count: number, latest_active_at = 0) => ({ tz, member_count, latest_active_at });
  it('picks deterministically: count, creator, recency, name', () => {
    eq('人数多者胜', pickGuildModeTz([stat('Asia/Tokyo', 1), stat('America/Los_Angeles', 3)]), 'America/Los_Angeles');
    eq('并列时创建者时区优先', pickGuildModeTz([stat('Asia/Tokyo', 2, 900), stat('America/Los_Angeles', 2, 100)], 'Asia/Tokyo'), 'Asia/Tokyo');
    eq('创建者不在并列集内不生效', pickGuildModeTz([stat('Asia/Tokyo', 2, 900), stat('America/Los_Angeles', 2, 100)], 'Europe/Paris'), 'Asia/Tokyo');
    eq('并列无创建者取最近活跃', pickGuildModeTz([stat('Asia/Tokyo', 2, 100), stat('America/Los_Angeles', 2, 900)]), 'America/Los_Angeles');
    eq('活跃也并列取字典序第一', pickGuildModeTz([stat('Asia/Tokyo', 2, 100), stat('America/Los_Angeles', 2, 100)]), 'America/Los_Angeles');
    eq('非法区不投票', pickGuildModeTz([stat('Bogus/Zone', 9), stat('Asia/Tokyo', 1)]), 'Asia/Tokyo');
    eq('零人数不投票', pickGuildModeTz([stat('Asia/Tokyo', 0), stat('Asia/Seoul', 1)]), 'Asia/Seoul');
    eq('无人投票 -> null', pickGuildModeTz([]), null);
    eq('全非法 -> null', pickGuildModeTz([stat('Bogus/Zone', 3)]), null);
  });
});

/* ================= resolution chain: member + guild rings ================= */
describe('car-tz resolution chain (0040 rings)', () => {
  it('creator persisted zone beats the fleet stamp; guild mode catches the rest', async () => {
    const { db } = makeDb({
      events: [
        evRow(501, { created_tz: 'Asia/Tokyo' }), // creator UID1's older stamped car (fleet ring)
      ],
      users: [
        userRow(UID1, { last_tz: 'America/New_York', updated_at: '1700000500' }),
        userRow(UID2, { last_tz: 'America/Los_Angeles', updated_at: '1700000100' }),
        userRow(2030300001, { last_tz: 'America/Los_Angeles', updated_at: '1700000200' }),
        userRow(2030400001, { last_tz: 'Asia/Seoul', updated_at: '1700000300' }),
        userRow(2030500001, { last_tz: 'Bogus/Zone', updated_at: '1700000400' }), // dirty stored value must never print
      ],
      members: [
        memberRow(GID, 'dc' + UID1), memberRow(GID, 'dc' + UID2),
        memberRow(GID, 'dc2030300001'), memberRow(GID, 'dc2030400001'),
      ],
    });
    // UID1 created the car: persisted zone (New_York) is fresher than
    // their own fleet stamp (Tokyo) — persisted wins.
    eq('创建者已落库时区优先于其车队旧戳', await resolveCarHomeTz(db, evRow(601)), 'America/New_York');
    // Unknown creator: no user row, no stamps — the guild mode (LA,
    // 2 members) frames the car, not the platform default.
    eq('创建者无数据 -> 百业众数', await resolveCarHomeTz(db, evRow(602, { creator_user_id: 2030999999 })), 'America/Los_Angeles');
    // A creator whose persisted zone is garbage falls through to the
    // guild mode instead of printing a bogus zone.
    eq('创建者落库值非法 -> 继续下探到众数', await resolveCarHomeTz(db, evRow(603, { creator_user_id: 2030500001 })), 'America/Los_Angeles');
  });

  it('fleet stamp still beats the guild mode when the creator has no persisted zone', async () => {
    const { db } = makeDb({
      events: [evRow(501, { created_tz: 'Europe/Paris' })],
      users: [
        userRow(UID2, { last_tz: 'America/Los_Angeles', updated_at: '1700000100' }),
        userRow(2030300001, { last_tz: 'America/Los_Angeles', updated_at: '1700000200' }),
      ],
      members: [memberRow(GID, 'dc' + UID2), memberRow(GID, 'dc2030300001')],
    });
    // UID1 (the creator) has no users row at all: their pre-0040 fleet
    // stamp is the best signal of their zone and outranks the mode.
    eq('创建者无落库时区 -> 车队旧戳优先于众数', await resolveCarHomeTz(db, evRow(601)), 'Europe/Paris');
  });
});
