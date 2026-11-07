// Platform-admin car management (ruling 2026-11-07): the platform
// admin (admin-gate verdict: PLATFORM_ADMIN_DISCORD_IDS env floor
// unioned with the living roster row) manages groupings in EVERY
// guild through the one shared grouping manage verdict/gate — as a
// plain guild member, as a non-member (the write gate passes too),
// and end-to-end through the merge mutation. Fail closed when the
// roster names nobody; the guild-local lanes (leader / guild admin /
// events officer) keep their exact markers.
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { getGroupingManageVerdict, groupingManageGate } from '../src/domains/platform/graphql-base.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: unknown, want: unknown) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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

/* ---------------- FakeDB (mergegrouping pattern, trimmed) -------- */
const SLUG = 'padmtest';
const GID = 1030100001;
const UID_LEADER = 2030100001;
const UID_ADMIN = 2030100003;
const UID_PAD = 2030100006;   // platform admin: plain member of G1
const UID_POUT = 2030100007;  // platform admin (env floor) but NOT in G1's server
const UID_MEM = 2030100005;
const now = Math.floor(Date.now() / 1000);

const T1 = 1201, S1 = 1202;
function ev(id, over = {}) {
  return {
    id, tenant: GID, type: 'activity', title: '车' + id, description: '', dungeon: '',
    max_slots: 10, visitor_slots: 0, ally_visible: 0,
    starts_at: '', starts_at_utc: now + (id - 1200) * 100, status: 'open', origin: 'member',
    creator_user_id: UID_LEADER, created_by: '', reminder_sent_at: null, reminder_error: null,
    ...over,
  };
}
const tables = {
  events: [ev(T1, { title: '目标车' }), ev(S1, { title: '源车' })],
  signups: [
    { id: 11, event_id: T1, nickname: '甲', uid: 't-a', role: '输出', weapon: '', discord_id: 'DA', is_visitor: 0, ready_at: null },
    { id: 21, event_id: S1, nickname: '乙', uid: 's-b', role: '奶', weapon: '', discord_id: 'DB', is_visitor: 0, ready_at: null },
  ],
  answers: [],
  results: [],
};
const tenants = [{ id: GID, slug: SLUG, guild_name: '超管测试百业', slogan: '', announcement: '' }];
const MEMBER_SERVERS = JSON.stringify([{ id: 'G1', name: 'G1', permissions: '0', owner: false }]);
const ADMIN_SERVERS = JSON.stringify([{ id: 'G1', name: 'G1', permissions: '8', owner: false }]);
const users = [
  { id: UID_LEADER, discord_id: 'D1', username: '车头', guilds_json: MEMBER_SERVERS },
  { id: UID_ADMIN, discord_id: 'D3', username: '管理', guilds_json: ADMIN_SERVERS },
  { id: UID_MEM, discord_id: 'D5', username: '路人', guilds_json: MEMBER_SERVERS },
  { id: UID_PAD, discord_id: 'DP', username: '超管成员', guilds_json: MEMBER_SERVERS },
  { id: UID_POUT, discord_id: 'DQ', username: '超管外人', guilds_json: '[]' },
];
const settings = new Map([[`${GID}|discord_guild_id`, 'G1']]);
const auditRows = [];
const mintCounters = new Map();
const unknownSql = new Set();

function stmt(sql) {
  sql = sql.replace(/"/g, '').replace(/settings\./g, '');
  const q = {
    _binds: [],
    bind(...a) { this._binds = a; return this; },
    async raw() { const res = await this.all(); return toRawRows(sql, (res && res.results) || []); },
    async first() { const res = await this.all(); return (res.results && res.results[0]) || null; },
    async all() {
      const b = this._binds;
      if (/INSERT INTO id_mint_counters/.test(sql)) {
        const key = `${b[0]}|${b[1]}`;
        const seq = (mintCounters.get(key) || 0) + 1;
        mintCounters.set(key, seq);
        return { results: [{ seq }] };
      }
      if (/FROM settings/.test(sql)) {
        if (/tenant = \?/.test(sql)) {
          const v = settings.get(`${b[0]}|${b[1]}`);
          return { results: v === undefined ? [] : [{ value: v }] };
        }
        const rows = [];
        for (const [k, v] of settings) {
          const [t, key] = k.split('|');
          if (key === b[0]) rows.push({ tenant: t, value: v });
        }
        return { results: rows };
      }
      if (/FROM tenants WHERE slug/.test(sql)) {
        const row = tenants.find((t) => t.slug === b[0]) || null;
        return { results: row ? [row] : [] };
      }
      if (/FROM tenants/.test(sql) && /WHERE id = \?/.test(sql)) {
        const row = tenants.find((t) => t.id === Number(b[0])) || null;
        return { results: row ? [row] : [] };
      }
      if (/FROM tenants/.test(sql)) return { results: tenants };
      if (/FROM events WHERE tenant = \? AND type = \?/.test(sql)) {
        return { results: tables.events.filter((e) => e.tenant === b[0] && e.type === b[1]) };
      }
      if (/FROM events WHERE id = \?/.test(sql)) {
        const row = tables.events.find((e) => e.id === Number(b[0])) || null;
        return { results: row ? [row] : [] };
      }
      if (/FROM signups/.test(sql) && /COUNT\(\*\)/.test(sql)) {
        return { results: [{ c: tables.signups.filter((r) => r.event_id === Number(b[0])).length }] };
      }
      if (/FROM signups WHERE event_id\s*=\s*\?/.test(sql)) {
        const rows = tables.signups.filter((r) => r.event_id === Number(b[0])).sort((a, c) => a.id - c.id);
        return { results: rows };
      }
      if (/FROM signup_answers WHERE event_id\s*=\s*\?/.test(sql)) {
        return { results: tables.answers.filter((r) => r.event_id === Number(b[0])) };
      }
      if (/FROM users/.test(sql) && /guilds_json/.test(sql) && /WHERE id = \?/.test(sql)) {
        const row = users.find((u) => u.id === Number(b[0])) || null;
        return { results: row ? [{ guilds_json: row.guilds_json }] : [] };
      }
      if (/FROM users/.test(sql) && /WHERE id = \?/.test(sql)) {
        const row = users.find((u) => u.id === Number(b[0])) || null;
        return { results: row ? [row] : [] };
      }
      if (/FROM users/.test(sql) && /discord_id = \?/.test(sql)) {
        const row = users.find((u) => u.discord_id === String(b[0])) || null;
        return { results: row ? [row] : [] };
      }
      if (/officer_grants/.test(sql)) return { results: [] };
      if (/FROM user_guild_nicks|FROM guild_members|FROM guild_roster_entries/.test(sql)) return { results: [] };
      if (/CREATE|ALTER|PRAGMA/.test(sql)) return { results: [] };
      unknownSql.add('all: ' + sql.slice(0, 90));
      return { results: [] };
    },
    async run() {
      const b = this._binds;
      if (/CREATE|ALTER/.test(sql)) return { meta: { changes: 0 } };
      if (/INSERT INTO guild_audit_events/.test(sql)) {
        auditRows.push({
          id: b[0], tenant: b[1], actor_discord_id: b[2], actor_name: b[3],
          action: b[4], target_type: b[5], target_id: b[6], target_label: b[7], created_at: b[8],
        });
        return { meta: { changes: 1 } };
      }
      let m;
      if ((m = /^UPDATE signups SET event_id\s*=\s*\? WHERE id\s*=\s*\? AND event_id\s*=\s*\?/.exec(sql))) {
        const row = tables.signups.find((r) => r.id === Number(b[1]) && r.event_id === Number(b[2]));
        if (row) row.event_id = Number(b[0]);
        return { meta: { changes: row ? 1 : 0 } };
      }
      if (/^DELETE FROM signups WHERE event_id\s*=\s*\?/.test(sql)) {
        const before = tables.signups.length;
        tables.signups = tables.signups.filter((r) => r.event_id !== Number(b[0]));
        return { meta: { changes: before - tables.signups.length } };
      }
      if (/^DELETE FROM events WHERE id\s*=\s*\?/.test(sql)) {
        const before = tables.events.length;
        tables.events = tables.events.filter((e) => e.id !== Number(b[0]));
        return { meta: { changes: before - tables.events.length } };
      }
      if (/^UPDATE/.test(sql)) return { meta: { changes: 1 } };
      if (/^INSERT/.test(sql)) return { meta: { changes: 1, last_row_id: 999 } };
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

const envSecret = { DB: db, PLATFORM_ADMIN_DISCORD_IDS: 'DP DQ' };
const envBare = { DB: db };

const leader = { userId: UID_LEADER, discordId: 'D1', name: '车头', guilds: ['G1'] };
const guildAdmin = { userId: UID_ADMIN, discordId: 'D3', name: '管理', guilds: ['G1'] };
const padm = { userId: UID_PAD, discordId: 'DP', name: '超管成员', guilds: ['G1'] };
const pout = { userId: UID_POUT, discordId: 'DQ', name: '超管外人', guilds: [] };
const plainMember = { userId: UID_MEM, discordId: 'D5', name: '路人', guilds: ['G1'] };
const fakeReq = new Request('http://local/graphql');
const carT = { tenant: GID, creator_user_id: UID_LEADER };

describe('platform-admin-manage', () => {
  it('Verdict lane: platform admin (plain member) manages any car', async () => {
    const v = await getGroupingManageVerdict(db, padm, fakeReq, null, carT, envSecret);
    eq('超管成员可管车', v.canManage, true);
    eq('标记 isPlatformAdmin', v.isPlatformAdmin, true);
    eq('不是车头', v.isLeader, false);
    eq('不是百业管理员', v.isAdmin, false);
    eq('不是委任', v.isOfficer, false);
  });

  it('Fail closed: no env secret and no roster row names nobody', async () => {
    const v = await getGroupingManageVerdict(db, padm, fakeReq, null, carT, envBare);
    eq('无 secret 时超管成员不可管', v.canManage, false);
    eq('无 secret 时无标记', v.isPlatformAdmin, false);
    const v2 = await getGroupingManageVerdict(db, padm, fakeReq, null, carT);
    eq('不传 env 不可管', v2.canManage, false);
    const v3 = await getGroupingManageVerdict(db, plainMember, fakeReq, null, carT, envSecret);
    eq('名单外成员不可管', v3.canManage, false);
    eq('名单外无标记', v3.isPlatformAdmin, false);
  });

  it('Roster lane: the living roster row also grants (unioned predicate)', async () => {
    settings.set('0|platform_admin_discord_ids', JSON.stringify([String(UID_PAD)]));
    try {
      const v = await getGroupingManageVerdict(db, padm, fakeReq, null, carT, envBare);
      eq('roster 命中可管车', v.canManage, true);
      eq('roster 命中标记', v.isPlatformAdmin, true);
    } finally {
      settings.delete('0|platform_admin_discord_ids');
    }
    const after = await getGroupingManageVerdict(db, padm, fakeReq, null, carT, envBare);
    eq('roster 清除后恢复 fail closed', after.canManage, false);
  });

  it('Gate: write gate passes a platform admin outside the guild', async () => {
    const g = await groupingManageGate(db, pout, fakeReq, null, carT, envSecret);
    eq('超管外人写门放行 (writeCode null)', g.writeCode, null);
    eq('超管外人可管车', g.canManage, true);
    eq('超管外人标记', g.isPlatformAdmin, true);
    const g2 = await groupingManageGate(db, pout, fakeReq, null, carT, envBare);
    eq('无 secret 时外人撞 memberOnly', g2.writeCode, 'memberOnly');
    eq('无 secret 时外人不可管', g2.canManage, false);
    const g3 = await groupingManageGate(db, plainMember, fakeReq, null, carT, envSecret);
    eq('普通成员过写门', g3.writeCode, null);
    eq('普通成员仍不可管', g3.canManage, false);
  });

  it('Regression: leader and guild-admin lanes keep their markers', async () => {
    const vl = await getGroupingManageVerdict(db, leader, fakeReq, null, carT, envSecret);
    eq('车头仍 isLeader', vl.isLeader, true);
    eq('车头无超管标记', vl.isPlatformAdmin, false);
    const va = await getGroupingManageVerdict(db, guildAdmin, fakeReq, null, carT, envSecret);
    eq('百业管理员仍 isAdmin', va.isAdmin, true);
    eq('百业管理员无超管标记', va.isPlatformAdmin, false);
    eq('百业管理员可管', va.canManage, true);
  });

  it('End-to-end: platform admin merges in a guild he only belongs to', async () => {
    let ipSeq = 0;
    async function gql(query, { user, env }) {
      ipSeq += 1;
      const req = new Request('http://local/graphql', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'cf-connecting-ip': '10.0.1.' + ipSeq },
        body: JSON.stringify({ query }),
      });
      const ctx = { env, request: req, user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
      const res = await yoga.fetch(req, ctx);
      return res.json();
    }
    const mut = `mutation { mergeGrouping(input: { targetId: "${T1}", sourceId: "${S1}" }) { ok error errorCode } }`;

    const denied = await gql(mut, { user: padm, env: envBare });
    eq('无 secret 时超管合并被拒', denied.data?.mergeGrouping?.ok, false);
    eq('拒绝码 leaderOnlyMerge', denied.data?.mergeGrouping?.errorCode, 'leaderOnlyMerge');
    eq('拒绝不写审计', auditRows.length, 0);
    check('拒绝后源车仍在', !!tables.events.find((e) => e.id === S1));

    const ok = await gql(mut, { user: padm, env: envSecret });
    eq('超管合并 ok', ok.data?.mergeGrouping?.ok, true, JSON.stringify(ok.errors || ok.data).slice(0, 300));
    check('源车已收尾', !tables.events.find((e) => e.id === S1));
    check('座位迁入目标车', tables.signups.some((r) => r.id === 21 && r.event_id === T1));
    eq('审计恰一条', auditRows.length, 1);
    eq('审计动作', auditRows[0]?.action, 'event.merge');
    eq('审计操作者 = 超管本人 Discord ID', auditRows[0]?.actor_discord_id, 'DP');

    if (unknownSql.size) console.log('\n[FakeDB 未路由 SQL]\n' + [...unknownSql].join('\n'));
  });
});
