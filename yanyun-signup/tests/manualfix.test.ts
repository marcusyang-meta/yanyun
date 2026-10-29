// One-off manual ownership fix acceptance (user's verbal instruction,
// 2026-10-25):
//  Car 39: owner temporarily set to '橘橘如笙' — exact-name signups
//    stamps in this guild, deduplicated to a unique one (seat-stamp),
//    take priority; else a unique roster display-name match
//    (roster-unique); otherwise skip.
//  Car 40: find 'be8bo / 木瓜PAPAYA' — case-insensitive exact match
//    across four sources (users.username / guild_members.nick /
//    guild_members.global_name / bound server's user_guild_nicks.nick),
//    deduplicated; stamp only when exactly one (account-match); zero
//    -> not-found; several -> ambiguous, with the audit detail recorded
//    per name.
//  Both cars write only while the creator is still empty; the settings
//  flag creator_manual_fix_v1 makes it idempotent; the production-host
//  safety gate is identical to creatorbackfill's (never triggers on
//  preview/localhost, never writes the flag there).
// Real functions + FakeDB routed faithfully by SQL shape (updates land
// in real in-memory tables).
import { describe, it, expect } from 'vitest';
import { runCreatorManualFixOnce, maybeRunCreatorManualFix } from '../src/creatormanualfix.js';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name, got, want) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* Drizzle query-builder channel: selects/gets with field mapping run in
   values mode on the D1 driver, i.e. stmt.bind(...).raw(), which returns
   value arrays in SELECT column order. Convert this FakeDB's routed
   object rows into that shape; unparseable column lists (functions /
   subqueries) fall back to the row objects' own value order. */
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

/* Typed-ID fixtures: the guild carries its 0036 primary key; users
   carry theirs, keyed here by their Discord ID (Discord-space values
   — seat stamps, roster rows, audit resolved ids — stay Discord IDs
   by design; the stamp itself lands as creator_user_id). */
const GID = 1030100001;
const GID_OTHER = 1030100002;
const UID: Record<string, number> = {
  UJ: 2030100001, U40: 2030100002, UZZ: 2030100003, UJ2: 2030100004,
  UX: 2030100005, UA1: 2030100006, UZ: 2030100007, UKEEP: 2030100008,
};

/* ---------------- FakeDB ---------------- */
function makeDb(fx = {}) {
  const tables = {
    tenants: fx.tenants || [{ id: GID, slug: 'jijiguagua', guild_name: '叽哩呱啦', slogan: '' }],
    settings: new Map(fx.settings || []),
    events: (fx.events || []).map((e) => ({ ...e })),
    signups: (fx.signups || []).map((r) => ({ ...r })),
    users: new Map((fx.users || []).map(([did, name]) => [did, { id: UID[did] || 0, username: name }])), // discord_id -> {id, username}
    nicks: (fx.nicks || []).map((r) => ({ ...r })), // {discord_id, guild_id, nick}
    guildMembers: (fx.guildMembers || []).map((r) => ({ ...r })),
    audit: [],
    mint: new Map(),
  };
  const unknownSql = new Set();
  function stmt(sql) {
    // Data-layer (Drizzle) SQL normalization: strip quotes (routing match only).
    sql = sql.replace(/"/g, '');
    const q = {
      _binds: [],
      bind(...a) { this._binds = a; return this; },
      async raw() { const res = await this.all(); return toRawRows(sql, (res && res.results) || []); },
      async first() {
        const b = this._binds;
        if (/FROM settings/.test(sql)) {
          const k = /tenant = 0/.test(sql) ? `0|${b[0]}` : `${b[0]}|${b[1]}`;
          const v = tables.settings.get(k);
          return v === undefined ? null : { value: v };
        }
        if (/FROM tenants/.test(sql)) {
          return tables.tenants.find((x) => x.slug === b[0]) || null;
        }
        if (/FROM users/.test(sql) && /discord_id = \?/.test(sql)) {
          const u = tables.users.get(String(b[0]));
          return u === undefined ? null : { id: u.id, discord_id: String(b[0]), username: u.username };
        }
        if (/INSERT INTO id_mint_counters/.test(sql)) {
          const key = `${b[0]}|${b[1]}`;
          const seq = (tables.mint.get(key) || 0) + 1;
          tables.mint.set(key, seq);
          return { seq };
        }
        if (/FROM events WHERE id = \?/.test(sql)) {
          return tables.events.find((e) => e.id === Number(b[0])) || null;
        }
        if (/CREATE|ALTER|PRAGMA/.test(sql)) return null;
        unknownSql.add('first: ' + sql.slice(0, 90));
        return null;
      },
      async all() {
        const b = this._binds;
        if (/PRAGMA/.test(sql)) return { results: [] };
        if (/FROM signups s JOIN events e/.test(sql)) {
          const rows = tables.signups.filter((s) => {
            const ev = tables.events.find((e) => e.id === s.event_id);
            return ev && ev.tenant === b[0] && s.nickname === b[1]
              && s.discord_id != null && s.discord_id !== '';
          });
          return { results: rows.map((s) => ({ did: s.discord_id })) };
        }
        if (/FROM guild_members WHERE tenant = \?/.test(sql)) {
          return { results: tables.guildMembers.filter((m) => m.tenant === b[0]) };
        }
        if (/INSERT INTO id_mint_counters/.test(sql)) {
          const key = `${b[0]}|${b[1]}`;
          const seq = (tables.mint.get(key) || 0) + 1;
          tables.mint.set(key, seq);
          return { results: [{ seq }] };
        }
        if (/FROM users/.test(sql) && /discord_id = \?/.test(sql)) {
          const u = tables.users.get(String(b[0]));
          return { results: u === undefined ? [] : [{ id: u.id, discord_id: String(b[0]), username: u.username }] };
        }
        if (/FROM users/.test(sql)) {
          return { results: [...tables.users.entries()].map(([discord_id, u]) => ({ discord_id, username: u.username })) };
        }
        if (/FROM settings/.test(sql)) {
          const v = tables.settings.get(`${b[0]}|${b[1]}`);
          return { results: v === undefined ? [] : [{ value: v }] };
        }
        if (/FROM user_guild_nicks WHERE guild_id = \?/.test(sql)) {
          return { results: tables.nicks.filter((n) => String(n.guild_id) === String(b[0])) };
        }
        if (/FROM tenants/.test(sql)) return { results: tables.tenants };
        if (/CREATE|ALTER/.test(sql)) return { results: [] };
        unknownSql.add('all: ' + sql.slice(0, 90));
        return { results: [] };
      },
      async run() {
        const b = this._binds;
        if (/CREATE|ALTER/.test(sql)) return { meta: { changes: 0 } };
        if (/INSERT INTO creator_backfill_log/.test(sql)) {
          tables.audit.push({
            event_id: b[0], tenant: b[1], seat_nickname: b[2], resolved_discord_id: b[3],
            outcome: b[4], reason: b[5], detail: b[6], created_at: b[7],
          });
          return { meta: { changes: 1 } };
        }
        if (/INSERT INTO settings/.test(sql)) {
          if (/VALUES\(0, \?, '1'\)/.test(sql)) tables.settings.set(`0|${b[0]}`, '1');
          else tables.settings.set(`${b[0]}|${b[1]}`, b[2]);
          return { meta: { changes: 1 } };
        }
        if (/INSERT INTO users/.test(sql)) {
          const cols = /INSERT INTO users \(([^)]+)\)/.exec(sql)![1].split(',').map((c) => c.trim());
          const v: any = {};
          cols.forEach((c, i) => { v[c] = b[i]; });
          if (!tables.users.has(String(v.discord_id))) {
            tables.users.set(String(v.discord_id), { id: Number(v.id), username: v.username || '' });
          }
          return { meta: { changes: 1 } };
        }
        if (/UPDATE events SET creator_user_id/.test(sql)) {
          const ev = tables.events.find((e) => e.id === Number(b[1]));
          if (ev && (ev.creator_user_id == null || ev.creator_user_id === 0)) {
            ev.creator_user_id = b[0];
            return { meta: { changes: 1 } };
          }
          return { meta: { changes: 0 } };
        }
        if (/^INSERT/.test(sql)) return { meta: { changes: 1 } };
        if (/^UPDATE/.test(sql)) return { meta: { changes: 1 } };
        if (/^DELETE/.test(sql)) return { meta: { changes: 0 } };
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
  return { db, tables, unknownSql };
}

const ev = (id, over = {}) => ({
  id, tenant: GID, origin: 'member', creator_user_id: null, ...over,
});
const creatorOf = (M, id) => M.tables.events.find((e) => e.id === id)?.creator_user_id;
const auditOf = (M, id) => M.tables.audit.find((a) => a.event_id === id);
const detailOf = (M, id) => { try { return JSON.parse(auditOf(M, id)?.detail || ''); } catch { return null; } };

let sum: any;

describe('manualfix', () => {

  it('DB1: car 39 seat-stamp hit; car 40 users.username hit', async () => {
/* -------- DB1: car 39 seat-stamp hit (two stamps, same name and person, deduplicated; same name in another tenant does not count);
 *          car 40 single-name hit on users.username (different case still matches) -------- */
const M1 = makeDb({
  settings: [[`${GID}|discord_guild_id`, 'G1']],
  events: [ev(38, { creator_user_id: UID.UX }), ev(39), ev(40), ev(41, { tenant: GID_OTHER })],
  signups: [
    { id: 1, event_id: 38, nickname: '橘橘如笙', discord_id: 'UJ' },
    { id: 2, event_id: 38, nickname: '橘橘如笙', discord_id: 'UJ' },
    { id: 3, event_id: 41, nickname: '橘橘如笙', discord_id: 'UOTHER' },
    { id: 4, event_id: 39, nickname: 'Pianlan', discord_id: null },
  ],
  users: [['UJ', '橘橘如笙'], ['U40', 'Be8Bo'], ['UZZ', '无关用户']],
  nicks: [{ discord_id: 'UQQ', guild_id: 'G1', nick: '路人' }],
});
sum = await runCreatorManualFixOnce(M1.db);
check('DB1 执行 done', sum.done === true, JSON.stringify(sum));
eq('DB1 stamped 数', sum.stamped, 2);
eq('DB1 39 -> UJ 的 user id (座位戳)', creatorOf(M1, 39), UID.UJ);
eq('DB1 39 审计 outcome/reason', `${auditOf(M1, 39)?.outcome}/${auditOf(M1, 39)?.reason}`, 'stamped/manual-fix:seat-stamp');
eq('DB1 39 审计 resolved', auditOf(M1, 39)?.resolved_discord_id, 'UJ');
check('DB1 39 detail 含来源与戳集合', detailOf(M1, 39)?.source === 'seat-stamp'
  && JSON.stringify(detailOf(M1, 39)?.seatStampIds) === '["UJ"]', auditOf(M1, 39)?.detail);
eq('DB1 40 -> U40 的 user id (users.username)', creatorOf(M1, 40), UID.U40);
eq('DB1 40 审计 reason', auditOf(M1, 40)?.reason, 'manual-fix:account-match');
eq('DB1 40 detail be8bo 来源', JSON.stringify(detailOf(M1, 40)?.['be8bo']), '{"U40":["users.username"]}');
eq('DB1 40 detail 木瓜PAPAYA 空', JSON.stringify(detailOf(M1, 40)?.['木瓜PAPAYA']), '{}');
eq('DB1 审计行数 = 2', M1.tables.audit.length, 2);
eq('DB1 标志已置位', M1.tables.settings.get('0|creator_manual_fix_v1'), '1');
sum = await runCreatorManualFixOnce(M1.db);
check('DB1 幂等: 二次运行 flag-set', sum.done === false && sum.reason === 'flag-set', JSON.stringify(sum));
eq('DB1 幂等: 审计不增行', M1.tables.audit.length, 2);
eq('DB1 幂等: 39 不被覆盖', creatorOf(M1, 39), UID.UJ);

  });

  it('DB2: car 39 roster-unique; car 40 both names one person', async () => {
/* -------- DB2: car 39 unique roster display-name hit (no stamp; global-name fallback);
 *          car 40 both names point to one person (three sources converge on the same account) -------- */
const M2 = makeDb({
  settings: [[`${GID}|discord_guild_id`, 'G1']],
  events: [ev(38), ev(39), ev(40)],
  signups: [
    { id: 1, event_id: 38, nickname: '橘橘如笙', discord_id: null },
    { id: 2, event_id: 39, nickname: 'Pianlan', discord_id: 'UP' },
  ],
  users: [['UJ2', '橘橘如笙'], ['UX', 'be8bo']],
  guildMembers: [
    { tenant: GID, discord_id: 'UJ2', nick: '', global_name: '橘橘如笙', updated_at: 1 },
    { tenant: GID, discord_id: 'UX', nick: '路人甲', global_name: '木瓜PAPAYA', updated_at: 1 },
    { tenant: GID, discord_id: 'UD', nick: '橘橘', global_name: '', updated_at: 1 },
  ],
  nicks: [{ discord_id: 'UX', guild_id: 'G1', nick: '木瓜papaya' }],
});
sum = await runCreatorManualFixOnce(M2.db);
check('DB2 执行 done', sum.done === true, JSON.stringify(sum));
eq('DB2 39 -> UJ2 的 user id (名册唯一)', creatorOf(M2, 39), UID.UJ2);
eq('DB2 39 审计 reason', auditOf(M2, 39)?.reason, 'manual-fix:roster-unique');
eq('DB2 40 -> UX 的 user id (两名同一人)', creatorOf(M2, 40), UID.UX);
eq('DB2 40 detail be8bo 来源', JSON.stringify(detailOf(M2, 40)?.['be8bo']), '{"UX":["users.username"]}');
check('DB2 40 detail 木瓜PAPAYA 两来源同指 UX',
  JSON.stringify(detailOf(M2, 40)?.['木瓜PAPAYA']?.UX?.slice().sort())
    === '["guild_members.global_name","user_guild_nicks.nick"]',
  auditOf(M2, 40)?.detail);

  });

  it('DB3: car 39 no match; car 40 ambiguous', async () => {
/* -------- DB3: car 39 both routes miss -> skip; car 40 two names, two people -> ambiguous -------- */
const M3 = makeDb({
  settings: [[`${GID}|discord_guild_id`, 'G1']],
  events: [ev(38), ev(39), ev(40)],
  signups: [
    { id: 1, event_id: 38, nickname: '橘橘如笙', discord_id: '' },
    { id: 2, event_id: 38, nickname: '别人', discord_id: 'UB' },
  ],
  users: [['UA1', 'be8bo']],
  guildMembers: [
    { tenant: GID, discord_id: 'UQ', nick: '别人', global_name: '橘橘', updated_at: 1 },
    { tenant: GID, discord_id: 'UB2', nick: '木瓜PAPAYA', global_name: '', updated_at: 1 },
  ],
});
sum = await runCreatorManualFixOnce(M3.db);
check('DB3 执行 done', sum.done === true, JSON.stringify(sum));
eq('DB3 stamped 数', sum.stamped, 0);
eq('DB3 39 不补', creatorOf(M3, 39), null);
eq('DB3 39 审计 outcome/reason', `${auditOf(M3, 39)?.outcome}/${auditOf(M3, 39)?.reason}`, 'skipped/manual-fix:no-match');
eq('DB3 40 不补', creatorOf(M3, 40), null);
eq('DB3 40 审计 outcome/reason', `${auditOf(M3, 40)?.outcome}/${auditOf(M3, 40)?.reason}`, 'skipped/manual-fix:ambiguous');
eq('DB3 40 detail be8bo 命中 UA1', JSON.stringify(detailOf(M3, 40)?.['be8bo']), '{"UA1":["users.username"]}');
eq('DB3 40 detail 木瓜PAPAYA 命中 UB2', JSON.stringify(detailOf(M3, 40)?.['木瓜PAPAYA']), '{"UB2":["guild_members.nick"]}');
eq('DB3 审计行数 = 2', M3.tables.audit.length, 2);
eq('DB3 标志已置位 (跳过也是定论)', M3.tables.settings.get('0|creator_manual_fix_v1'), '1');

  });

  it('DB4: car 39 already set; car 40 not found', async () => {
/* -------- DB4: car 39 existing creator not overwritten; car 40 zero hits -> not-found -------- */
const M4 = makeDb({
  settings: [[`${GID}|discord_guild_id`, 'G1']],
  events: [ev(39, { creator_user_id: UID.UKEEP }), ev(40)],
  users: [['UZ', '路人']],
  guildMembers: [
    { tenant: GID, discord_id: 'UQ', nick: '甲', global_name: '乙', updated_at: 1 },
  ],
  nicks: [{ discord_id: 'UQ', guild_id: 'G1', nick: '丙' }],
});
sum = await runCreatorManualFixOnce(M4.db);
check('DB4 执行 done', sum.done === true, JSON.stringify(sum));
eq('DB4 39 已有车头不动', creatorOf(M4, 39), UID.UKEEP);
eq('DB4 39 审计 reason', auditOf(M4, 39)?.reason, 'manual-fix:already-set');
eq('DB4 40 不补', creatorOf(M4, 40), null);
eq('DB4 40 审计 outcome/reason', `${auditOf(M4, 40)?.outcome}/${auditOf(M4, 40)?.reason}`, 'skipped/manual-fix:not-found');
eq('DB4 审计行数 = 2', M4.tables.audit.length, 2);

  });

  it('DB5: host safety gate + isolate latch', async () => {
/* -------- DB5: host safety gate (preview/localhost neither trigger nor write; production runs)
 *          + isolate latch -------- */
const M5 = makeDb({
  settings: [[`${GID}|discord_guild_id`, 'G1']],
  events: [ev(38), ev(39), ev(40)],
  signups: [{ id: 1, event_id: 38, nickname: '橘橘如笙', discord_id: 'UJ' }],
  users: [['UJ', '橘橘如笙'], ['U40', 'be8bo']],
});
const env5 = { DB: M5.db };
let hr = await maybeRunCreatorManualFix(env5, new Request('https://release-yanyun.tbdlab.workers.dev/graphql', { method: 'POST' }));
check('preview host 不触发', hr.done === false && hr.reason === 'host-not-prod', JSON.stringify(hr));
eq('preview host 未写 39', creatorOf(M5, 39), null);
eq('preview host 未写审计', M5.tables.audit.length, 0);
eq('preview host 未写标志', M5.tables.settings.get('0|creator_manual_fix_v1'), undefined);
hr = await maybeRunCreatorManualFix(env5, new Request('http://localhost:8787/graphql', { method: 'POST' }));
check('localhost 不触发', hr.done === false && hr.reason === 'host-not-prod', JSON.stringify(hr));
hr = await maybeRunCreatorManualFix(env5, new Request('https://yanyun.app/graphql', { method: 'POST' }));
check('生产 host 触发', hr.done === true, JSON.stringify(hr));
eq('生产 host 39 已补', creatorOf(M5, 39), UID.UJ);
eq('生产 host 40 已补', creatorOf(M5, 40), UID.U40);
hr = await maybeRunCreatorManualFix(env5, new Request('https://yanyun.app/graphql', { method: 'POST' }));
check('同 isolate 二次调用 latch', hr.done === false && hr.reason === 'isolate-latch', JSON.stringify(hr));
eq('latch 后审计不增行', M5.tables.audit.length, 2);
  });
});
