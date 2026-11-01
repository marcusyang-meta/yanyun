// Car home timezone (0039 + car-tz.ts) acceptance:
//  - capture rule: only runtime-known IANA zones are accepted from
//    the client x-tz header; anything else counts as "not captured";
//  - resolution chain: the car's own created_tz, else the creator's
//    latest captured zone on another car in the SAME guild, else
//    Asia/Shanghai — never borrowed across guilds;
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
  isValidIanaTz, capturedTzOrNull, resolveCarHomeTz, carTzLabelZh,
  fmtCarTimeZoned, tzOffsetMinutes, CAR_HOME_TZ_FALLBACK,
} from '../src/domains/groupings/car-tz.ts';
import { insertEvent, updateEventFields, getEventRow } from '../src/domains/groupings/events.ts';

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

function makeDb(seed: any[] = []) {
  const state = { events: seed.map((e) => ({ ...e })), counters: new Map<string, number>() };
  function route(kind: string, sqlRaw: string, b: any[]) {
    const sql = sqlRaw.replace(/"/g, '').replace(/events\./g, '').replace(/id_mint_counters\./g, '');
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
