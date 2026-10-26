// 一次性人工归属修正验收 (2026-10-25 用户口头指令):
//  39 号车 owner 暂设「橘橘如笙」: 本百业内恰名 signups 戳去重唯一
//    (seat-stamp) 优先, 否则名册展示名唯一 (roster-unique), 都不行跳过。
//  40 号车找人「be8bo / 木瓜PAPAYA」: users.username / guild_members
//    .nick / guild_members.global_name / 绑定服务器 user_guild_nicks
//    .nick 四来源不分大小写恰等, 汇总去重恰一个才落 (account-match),
//    零个 not-found, 多个 ambiguous 且审计 detail 按名字分开记录。
//  两车只在 creator 仍为空时写; settings 标志 creator_manual_fix_v1
//  幂等; 生产 host 安全闸与 creatorbackfill 完全一致 (preview /
//  localhost 绝不触发、绝不写标志)。
// 真函数 + FakeDB 按 SQL 形状忠实路由 (更新真落到内存表)。
import { runCreatorManualFixOnce, maybeRunCreatorManualFix } from '../src/creatormanualfix.js';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}
function eq(name, got, want) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* ---------------- FakeDB ---------------- */
function makeDb(fx = {}) {
  const tables = {
    tenants: fx.tenants || [{ slug: 'jijiguagua', guild_name: '叽哩呱啦', slogan: '' }],
    settings: new Map(fx.settings || []),
    events: (fx.events || []).map((e) => ({ ...e })),
    signups: (fx.signups || []).map((r) => ({ ...r })),
    users: new Map(fx.users || []),           // discord_id -> username
    nicks: (fx.nicks || []).map((r) => ({ ...r })), // {discord_id, guild_id, nick}
    guildMembers: (fx.guildMembers || []).map((r) => ({ ...r })),
    audit: [],
  };
  const unknownSql = new Set();
  function stmt(sql) {
    const q = {
      _binds: [],
      bind(...a) { this._binds = a; return this; },
      async first() {
        const b = this._binds;
        if (/FROM settings/.test(sql)) {
          const k = /tenant = ''/.test(sql) ? `|${b[0]}` : `${b[0]}|${b[1]}`;
          const v = tables.settings.get(k);
          return v === undefined ? null : { value: v };
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
        if (/FROM users/.test(sql)) {
          return { results: [...tables.users.entries()].map(([discord_id, username]) => ({ discord_id, username })) };
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
          if (/VALUES\('', \?, '1'\)/.test(sql)) tables.settings.set(`|${b[0]}`, '1');
          else tables.settings.set(`${b[0]}|${b[1]}`, b[2]);
          return { meta: { changes: 1 } };
        }
        if (/UPDATE events SET creator_discord_id/.test(sql)) {
          const ev = tables.events.find((e) => e.id === Number(b[1]));
          if (ev && (ev.creator_discord_id == null || ev.creator_discord_id === '')) {
            ev.creator_discord_id = b[0];
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
  id, tenant: 'jijiguagua', origin: 'member', creator_discord_id: null, ...over,
});
const creatorOf = (M, id) => M.tables.events.find((e) => e.id === id)?.creator_discord_id;
const auditOf = (M, id) => M.tables.audit.find((a) => a.event_id === id);
const detailOf = (M, id) => { try { return JSON.parse(auditOf(M, id)?.detail || ''); } catch { return null; } };

/* -------- DB1: 39 座位戳命中 (同名同人两戳去重 + 跨租户同名不算);
 *          40 users.username 单名命中 (大小写不同照中) -------- */
const M1 = makeDb({
  settings: [['jijiguagua|discord_guild_id', 'G1']],
  events: [ev(38, { creator_discord_id: 'UX' }), ev(39), ev(40), ev(41, { tenant: 'othert' })],
  signups: [
    { id: 1, event_id: 38, nickname: '橘橘如笙', discord_id: 'UJ' },
    { id: 2, event_id: 38, nickname: '橘橘如笙', discord_id: 'UJ' },
    { id: 3, event_id: 41, nickname: '橘橘如笙', discord_id: 'UOTHER' },
    { id: 4, event_id: 39, nickname: 'Pianlan', discord_id: null },
  ],
  users: [['U40', 'Be8Bo'], ['UZZ', '无关用户']],
  nicks: [{ discord_id: 'UQQ', guild_id: 'G1', nick: '路人' }],
});
let sum = await runCreatorManualFixOnce(M1.db);
check('DB1 执行 done', sum.done === true, JSON.stringify(sum));
eq('DB1 stamped 数', sum.stamped, 2);
eq('DB1 39 -> UJ (座位戳)', creatorOf(M1, 39), 'UJ');
eq('DB1 39 审计 outcome/reason', `${auditOf(M1, 39)?.outcome}/${auditOf(M1, 39)?.reason}`, 'stamped/manual-fix:seat-stamp');
eq('DB1 39 审计 resolved', auditOf(M1, 39)?.resolved_discord_id, 'UJ');
check('DB1 39 detail 含来源与戳集合', detailOf(M1, 39)?.source === 'seat-stamp'
  && JSON.stringify(detailOf(M1, 39)?.seatStampIds) === '["UJ"]', auditOf(M1, 39)?.detail);
eq('DB1 40 -> U40 (users.username)', creatorOf(M1, 40), 'U40');
eq('DB1 40 审计 reason', auditOf(M1, 40)?.reason, 'manual-fix:account-match');
eq('DB1 40 detail be8bo 来源', JSON.stringify(detailOf(M1, 40)?.['be8bo']), '{"U40":["users.username"]}');
eq('DB1 40 detail 木瓜PAPAYA 空', JSON.stringify(detailOf(M1, 40)?.['木瓜PAPAYA']), '{}');
eq('DB1 审计行数 = 2', M1.tables.audit.length, 2);
eq('DB1 标志已置位', M1.tables.settings.get('|creator_manual_fix_v1'), '1');
sum = await runCreatorManualFixOnce(M1.db);
check('DB1 幂等: 二次运行 flag-set', sum.done === false && sum.reason === 'flag-set', JSON.stringify(sum));
eq('DB1 幂等: 审计不增行', M1.tables.audit.length, 2);
eq('DB1 幂等: 39 不被覆盖', creatorOf(M1, 39), 'UJ');

/* -------- DB2: 39 名册展示名唯一命中 (戳缺位, 全局名回退);
 *          40 两名同指一人 (三来源合流仍是同一账号) -------- */
const M2 = makeDb({
  settings: [['jijiguagua|discord_guild_id', 'G1']],
  events: [ev(38), ev(39), ev(40)],
  signups: [
    { id: 1, event_id: 38, nickname: '橘橘如笙', discord_id: null },
    { id: 2, event_id: 39, nickname: 'Pianlan', discord_id: 'UP' },
  ],
  users: [['UX', 'be8bo']],
  guildMembers: [
    { tenant: 'jijiguagua', discord_id: 'UJ2', nick: '', global_name: '橘橘如笙', updated_at: 1 },
    { tenant: 'jijiguagua', discord_id: 'UX', nick: '路人甲', global_name: '木瓜PAPAYA', updated_at: 1 },
    { tenant: 'jijiguagua', discord_id: 'UD', nick: '橘橘', global_name: '', updated_at: 1 },
  ],
  nicks: [{ discord_id: 'UX', guild_id: 'G1', nick: '木瓜papaya' }],
});
sum = await runCreatorManualFixOnce(M2.db);
check('DB2 执行 done', sum.done === true, JSON.stringify(sum));
eq('DB2 39 -> UJ2 (名册唯一)', creatorOf(M2, 39), 'UJ2');
eq('DB2 39 审计 reason', auditOf(M2, 39)?.reason, 'manual-fix:roster-unique');
eq('DB2 40 -> UX (两名同一人)', creatorOf(M2, 40), 'UX');
eq('DB2 40 detail be8bo 来源', JSON.stringify(detailOf(M2, 40)?.['be8bo']), '{"UX":["users.username"]}');
check('DB2 40 detail 木瓜PAPAYA 两来源同指 UX',
  JSON.stringify(detailOf(M2, 40)?.['木瓜PAPAYA']?.UX?.slice().sort())
    === '["guild_members.global_name","user_guild_nicks.nick"]',
  auditOf(M2, 40)?.detail);

/* -------- DB3: 39 两路都不中跳过; 40 两名两个人 ambiguous -------- */
const M3 = makeDb({
  settings: [['jijiguagua|discord_guild_id', 'G1']],
  events: [ev(38), ev(39), ev(40)],
  signups: [
    { id: 1, event_id: 38, nickname: '橘橘如笙', discord_id: '' },
    { id: 2, event_id: 38, nickname: '别人', discord_id: 'UB' },
  ],
  users: [['UA1', 'be8bo']],
  guildMembers: [
    { tenant: 'jijiguagua', discord_id: 'UQ', nick: '别人', global_name: '橘橘', updated_at: 1 },
    { tenant: 'jijiguagua', discord_id: 'UB2', nick: '木瓜PAPAYA', global_name: '', updated_at: 1 },
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
eq('DB3 标志已置位 (跳过也是定论)', M3.tables.settings.get('|creator_manual_fix_v1'), '1');

/* -------- DB4: 39 已有车头不覆盖; 40 零命中 not-found -------- */
const M4 = makeDb({
  settings: [['jijiguagua|discord_guild_id', 'G1']],
  events: [ev(39, { creator_discord_id: 'UKEEP' }), ev(40)],
  users: [['UZ', '路人']],
  guildMembers: [
    { tenant: 'jijiguagua', discord_id: 'UQ', nick: '甲', global_name: '乙', updated_at: 1 },
  ],
  nicks: [{ discord_id: 'UQ', guild_id: 'G1', nick: '丙' }],
});
sum = await runCreatorManualFixOnce(M4.db);
check('DB4 执行 done', sum.done === true, JSON.stringify(sum));
eq('DB4 39 已有车头不动', creatorOf(M4, 39), 'UKEEP');
eq('DB4 39 审计 reason', auditOf(M4, 39)?.reason, 'manual-fix:already-set');
eq('DB4 40 不补', creatorOf(M4, 40), null);
eq('DB4 40 审计 outcome/reason', `${auditOf(M4, 40)?.outcome}/${auditOf(M4, 40)?.reason}`, 'skipped/manual-fix:not-found');
eq('DB4 审计行数 = 2', M4.tables.audit.length, 2);

/* -------- DB5: host 安全闸 (preview/localhost 不触发不写, 生产才跑)
 *          + isolate latch -------- */
const M5 = makeDb({
  settings: [['jijiguagua|discord_guild_id', 'G1']],
  events: [ev(38), ev(39), ev(40)],
  signups: [{ id: 1, event_id: 38, nickname: '橘橘如笙', discord_id: 'UJ' }],
  users: [['U40', 'be8bo']],
});
const env5 = { DB: M5.db };
let hr = await maybeRunCreatorManualFix(env5, new Request('https://release-yanyun.tbdlab.workers.dev/graphql', { method: 'POST' }));
check('preview host 不触发', hr.done === false && hr.reason === 'host-not-prod', JSON.stringify(hr));
eq('preview host 未写 39', creatorOf(M5, 39), null);
eq('preview host 未写审计', M5.tables.audit.length, 0);
eq('preview host 未写标志', M5.tables.settings.get('|creator_manual_fix_v1'), undefined);
hr = await maybeRunCreatorManualFix(env5, new Request('http://localhost:8787/graphql', { method: 'POST' }));
check('localhost 不触发', hr.done === false && hr.reason === 'host-not-prod', JSON.stringify(hr));
hr = await maybeRunCreatorManualFix(env5, new Request('https://yanyun.app/graphql', { method: 'POST' }));
check('生产 host 触发', hr.done === true, JSON.stringify(hr));
eq('生产 host 39 已补', creatorOf(M5, 39), 'UJ');
eq('生产 host 40 已补', creatorOf(M5, 40), 'U40');
hr = await maybeRunCreatorManualFix(env5, new Request('https://yanyun.app/graphql', { method: 'POST' }));
check('同 isolate 二次调用 latch', hr.done === false && hr.reason === 'isolate-latch', JSON.stringify(hr));
eq('latch 后审计不增行', M5.tables.audit.length, 2);

console.log(`\n人工归属修正 harness: ${pass} PASS / ${fail} FAIL`);
const unknown = new Set([...M1.unknownSql, ...M2.unknownSql, ...M3.unknownSql, ...M4.unknownSql, ...M5.unknownSql]);
if (unknown.size) console.log('未路由 SQL (供核对):', [...unknown]);
if (fail) { console.log('FAILURES:\n' + fails.join('\n')); process.exit(1); }
