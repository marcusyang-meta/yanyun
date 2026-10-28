// Guild custom domains acceptance (P23, white-label tier B):
//  - validation matrix: format (bare hostname, label rules, alpha
//    TLD, no IP literals), reserved (platform hosts + non-public
//    suffixes), conflict (a hostname bound by another guild);
//  - state machine: bind -> pending (fresh ownership token),
//    rebind restarts at pending, remove deletes; hub disable keeps
//    the record, hub re-enable returns to pending (re-verify);
//  - the SaaS seam: SAAS_FALLBACK_ORIGIN unset = unconfigured —
//    verification stops at 'seam', nothing resolves, and the main
//    host / subdomain behavior is byte-identical; configured +
//    DNS answers right (CNAME to the fallback + ownership TXT)
//    = active; wrong DNS = stays pending with per-record flags;
//  - resolution: active + seam + tier pass -> the worker serves
//    the guild on its own host (root / car / admin shapes mirror
//    the subdomain dispatch, og:url follows the host); a host a
//    binding NAMES but that is not live gets the plain 404; a
//    host NO binding names falls through to today's behavior;
//  - tier matrix (T3, F0 semantics: tierLocked is a pure
//    entitlement verdict that never consults the paygate switch):
//    below T3 -> admin surface composes the Locked variant (zero
//    binding data), writes refuse with premiumRequired, and an
//    active binding stops resolving (freeze, not delete); a
//    manual grant (legacy premium maps to tier 3) restores all
//    of it;
//  - composition: reminder links prefer the custom origin over
//    the platform subdomain; shareUrl and short-link landings
//    follow a live custom host; main-host outputs unchanged;
//  - platform side: the hub billing state lists bindings (no
//    token) and the audited disable switch flips them.
// Real worker fetch + real yoga + FakeDB routing by SQL shape into
// in-memory tables (same pattern as .harness-subdomain).
import { yoga } from '../src/graphql.ts';
import {
  normalizeCustomDomainHostname, validateCustomDomainHostname,
  isCustomDomainCandidateHost, bindCustomDomain, getCustomDomainByTenant,
  getCustomDomainByHostname, listCustomDomainBindings, deleteCustomDomainBinding,
  setCustomDomainDisabled, verifyCustomDomainBinding, checkCustomDomainDns,
  customDomainDnsGuidance, customDomainSaasConfigured, customDomainFallbackOrigin,
  isCustomDomainLive, guildCustomDomainOrigin, lookupGuildCustomDomainHost,
  DEFAULT_SAAS_FALLBACK_ORIGIN,
} from '../src/domains/guilds/customdomain.ts';
import { tierLocked, grantPremiumManual, revokePremium } from '../src/domains/platform/billing-service.ts';
import { resolveGuildSubdomain } from '../src/domains/guilds/subdomain.ts';
import { hubRoutes } from '../src/domains/platform/hub-routes.ts';
import { makeToken } from '../src/domains/platform/http.ts';
import { Hono } from 'hono';
import { mintShortLink } from '../src/domains/groupings/shortlinks.ts';
import { buildReminderMessage } from '../src/domains/groupings/reminder.ts';
import { BACKUP_ENTITIES, exportBackup } from '../src/domains/platform/backup.ts';
import { describe, it, expect, afterAll } from 'vitest';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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
const DGID = '424242424242424242';
function makeDb(fx = {}) {
  const tables = {
    tenants: (fx.tenants || []).map((t) => ({ ...t })),
    settings: new Map(fx.settings || []),
    users: new Map(fx.users || []),
    events: (fx.events || []).map((e) => ({ ...e })),
    signups: (fx.signups || []).map((r) => ({ ...r })),
    links: (fx.links || []).map((l) => ({ ...l })),
    guildMembers: (fx.guildMembers || []).map((m) => ({ ...m })),
    entitlements: new Map(fx.entitlements || []),
    customDomains: new Map(fx.customDomains || []),
  };
  const unknownSql = new Set();
  function norm(sql) {
    return sql.replace(/"/g, '').replace(/\b(tenants|settings|users|events|signups|short_links|guild_members|guild_avatars|user_guild_nicks|dungeons|guild_entitlements|guild_custom_domains)\./g, '').replace(/\s+/g, ' ');
  }
  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    if (/^INSERT INTO hub_audit_log/i.test(sql)) return { meta: { changes: 1 } };
    /* guild_custom_domains: real UNIQUE(hostname) semantics */
    if (/guild_custom_domains/i.test(sql)) {
      if (/^INSERT INTO guild_custom_domains/i.test(sql)) {
        const [tenant, hostname, status, verifyToken, createdBy, createdAt, updatedAt, verifiedAt] = b;
        for (const row of tables.customDomains.values()) {
          if (row.hostname === hostname && row.tenant !== tenant) throw new Error('UNIQUE constraint failed: guild_custom_domains.hostname');
        }
        tables.customDomains.set(tenant, {
          tenant, hostname, status, verify_token: verifyToken, created_by: createdBy,
          created_at: createdAt, updated_at: updatedAt, verified_at: verifiedAt,
        });
        return { meta: { changes: 1 } };
      }
      if (/^UPDATE guild_custom_domains/i.test(sql)) {
        const row = tables.customDomains.get(b[b.length - 1]);
        if (row) {
          row.status = b[0]; row.updated_at = b[1];
          if (/verified_at = \?/i.test(sql)) row.verified_at = b[2];
        }
        return { meta: { changes: row ? 1 : 0 } };
      }
      if (/^DELETE FROM guild_custom_domains/i.test(sql)) {
        tables.customDomains.delete(b[0]);
        return { meta: { changes: 1 } };
      }
      let row = null;
      if (/WHERE tenant = \?/i.test(sql)) row = tables.customDomains.get(b[0]) ?? null;
      else if (/WHERE hostname = \?/i.test(sql)) row = [...tables.customDomains.values()].find((r) => r.hostname === b[0]) ?? null;
      if (kind === 'first') return row;
      if (!/WHERE/i.test(sql) || /ORDER BY/i.test(sql)) return { results: [...tables.customDomains.values()] };
      return { results: row ? [row] : [] };
    }
    if (/short_links/i.test(sql)) {
      if (/^INSERT INTO short_links/i.test(sql)) {
        const [code, tenant, eventId, createdAt] = b;
        if (tables.links.some((l) => l.code === code)) throw new Error('UNIQUE constraint failed: short_links.code');
        if (tables.links.some((l) => l.tenant === tenant && l.event_id === eventId)) throw new Error('UNIQUE constraint failed: short_links_target_unique');
        tables.links.push({ code, tenant, event_id: eventId, created_at: createdAt });
        return { meta: { changes: 1 } };
      }
      let row = null;
      if (/WHERE tenant = \? AND event_id = \?/i.test(sql)) row = tables.links.find((l) => l.tenant === b[0] && l.event_id === Number(b[1])) || null;
      else if (/WHERE code = \?/i.test(sql)) row = tables.links.find((l) => l.code === b[0]) || null;
      return kind === 'first' ? row : { results: row ? [row] : [] };
    }
    let m = /^INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)/i.exec(sql);
    if (m) {
      const [, table, colList] = m;
      const cols = colList.split(',').map((c) => c.trim().split('.').pop());
      const row = {};
      cols.forEach((c, i) => { row[c] = b[i]; });
      if (table === 'settings') { tables.settings.set(`${row.tenant}|${row.key}`, row.value); return { meta: { changes: 1 } }; }
      if (table === 'guild_entitlements') { tables.entitlements.set(row.tenant, { ...row }); return { meta: { changes: 1 } }; }
      if (table === 'events') tables.events.push(row);
      else if (table === 'signups') tables.signups.push(row);
      return { meta: { changes: 1, last_row_id: row.id ?? 0 } };
    }
    if (/\b(CREATE TABLE|ALTER TABLE|PRAGMA)\b/i.test(sql)) return kind === 'run' ? { meta: { changes: 0 } } : (kind === 'first' ? null : { results: [] });
    if (/^DELETE FROM/i.test(sql)) return { meta: { changes: 0 } };

    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });
    if (/FROM guild_entitlements WHERE tenant = \?/i.test(sql)) return first(tables.entitlements.get(b[0]) ?? null);
    if (/FROM tenants WHERE slug/i.test(sql)) return first(tables.tenants.find((t) => t.slug === b[0]));
    if (/FROM tenants/i.test(sql)) return kind === 'first' ? (tables.tenants[0] ?? null) : all(tables.tenants);
    if (/FROM settings WHERE tenant = \? AND key = \?/i.test(sql)) {
      const v = tables.settings.get(`${b[0]}|${b[1]}`);
      return first(v === undefined ? null : { value: v });
    }
    if (/FROM settings WHERE key = \?/i.test(sql)) {
      const rows = [];
      for (const [k, v] of tables.settings) { const [t, key] = k.split('|'); if (key === b[0]) rows.push({ tenant: t, value: v }); }
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    if (/SELECT guilds_json FROM users/i.test(sql)) {
      const v = tables.users.get(String(b[0]));
      return first(v === undefined ? null : { guilds_json: v });
    }
    if (/FROM users/i.test(sql)) return first(null);
    if (/FROM guild_avatars/i.test(sql)) return first(null);
    if (/FROM dungeons/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/FROM user_guild_nicks/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/FROM events/i.test(sql) && /COUNT/i.test(sql)) {
      const nums = b.filter((x) => typeof x === 'number' && x > 1e9);
      const lo = nums.length ? Math.min(...nums) : 0;
      const hi = nums.length > 1 ? Math.max(...nums) : Number.MAX_SAFE_INTEGER;
      const rows = tables.events.filter((e) => e.tenant === b[0] && e.type === 'activity'
        && e.starts_at_utc != null && e.starts_at_utc >= lo && e.starts_at_utc < hi
        && !['draft', 'completed'].includes(e.status));
      return first({ c: rows.length });
    }
    if (/FROM events WHERE id = \? AND tenant = \?/i.test(sql)) {
      return first(tables.events.find((e) => e.id === Number(b[0]) && e.tenant === b[1]));
    }
    if (/FROM events WHERE id = \?/i.test(sql)) return first(tables.events.find((e) => e.id === Number(b[0])));
    if (/FROM events/i.test(sql)) return kind === 'first' ? (tables.events[0] ?? null) : all(tables.events);
    if (/FROM signups/i.test(sql) && /COUNT/i.test(sql)) {
      return first({ c: tables.signups.filter((r) => r.event_id === Number(b[0])).length });
    }
    if (/FROM signups/i.test(sql)) return all(tables.signups.filter((r) => r.event_id === Number(b[0])).sort((a, c) => a.id - c.id));
    if (/FROM guild_members/i.test(sql)) {
      let rows = tables.guildMembers.filter((x) => x.tenant === b[0]);
      if (/discord_id = \?/i.test(sql) && b.length > 1) rows = rows.filter((x) => x.discord_id === String(b[1]));
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    // Governance line (P16): the fixture guilds carry no officer
    // grants, so the verdict's grant read answers empty here (the
    // dedicated governance harness covers granted shapes).
    if (/FROM guild_officer_grants/i.test(sql)) return kind === 'first' ? null : all([]);
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
const NOW = Math.floor(Date.now() / 1000);
function tenantRow(slug, guildName) {
  return {
    slug, guild_name: guildName, password_hash: 'x', announcement: '', slogan: '同舟共济',
    master_name: '', logo_url: '', bg_image_url: '', discord_webhook: '',
    created_at: '2026-01-01 00:00:00',
  };
}
function evRow(id, tenant, over = {}) {
  return {
    id, tenant, title: '车' + id, type: 'activity', description: '', dungeon: '',
    starts_at: null, starts_at_utc: NOW + 7200, max_slots: 10, status: 'open',
    origin: 'member', created_by: '', creator_discord_id: 'U1',
    reminder_sent_at: null, reminder_error: null, ...over,
  };
}
const A = makeDb({
  tenants: [tenantRow('guild-a', '甲百业'), tenantRow('guild-b', '乙百业'), tenantRow('guild-c', '丙百业'), tenantRow('subtest', '子域测试百业')],
  settings: [
    ['guild-a|discord_guild_id', DGID],
    ['guild-b|discord_guild_id', DGID],
    ['guild-c|discord_guild_id', DGID],
    ['subtest|discord_guild_id', DGID],
    ['guild-a|subdomain_enabled', '1'],
    ['subtest|subdomain_enabled', '1'],
    ['|game_version', 'intl-v2.3'],
  ],
  users: [
    ['UA', JSON.stringify([{ id: DGID, name: '测试服', icon: '', permissions: '0', owner: true }])],
    ['UB', JSON.stringify([{ id: DGID, name: '测试服', icon: '', permissions: '0', owner: false }])],
  ],
  events: [evRow(7, 'guild-a', { title: '甲业周六车' }), evRow(8, 'guild-b', { title: '乙业车' })],
});
const ADMIN = { discordId: 'UA', name: '服主', guilds: [DGID] };
const MEMBER = { discordId: 'UB', name: '成员', guilds: [DGID] };
const SEAM_ENV = { SAAS_FALLBACK_ORIGIN: 'fallback.yanyun.app' };

let r: any;
let dnsTable: any;

const realFetch = globalThis.fetch;

const callSeam = (url) => worker.fetch(new Request(url), envSeam, wctx);

let worker: any;

let envSeam: any;

let wctx: any;

let res: any;
let g: any;

describe('customdomain', () => {
  it('A. validation matrix', async () => {
/* ---------------- A. validation matrix ---------------- */
const V = (h) => validateCustomDomainHostname(h);
eq('合法 www 子域', V('www.guild-a.com').ok, true);
eq('合法裸域', V('guild-a.com').ok, true);
eq('大写归一后合法', V('WWW.Guild-A.COM').hostname, 'www.guild-a.com');
eq('尾点剥除', normalizeCustomDomainHostname('www.guild-a.com.'), 'www.guild-a.com');
eq('无点不合格', V('localhost2').code, 'customDomainInvalid');
eq('带 scheme 不合格', V('https://www.guild-a.com').code, 'customDomainInvalid');
eq('带端口不合格', V('www.guild-a.com:8443').code, 'customDomainInvalid');
eq('带路径不合格', V('www.guild-a.com/x').code, 'customDomainInvalid');
eq('带空格不合格', V('www. guild-a.com').code, 'customDomainInvalid');
eq('IP 字面不合格', V('203.0.113.7').code, 'customDomainInvalid');
eq('数字 TLD 不合格', V('www.guild-a.123').code, 'customDomainInvalid');
eq('一位 TLD 不合格', V('www.guild-a.c').code, 'customDomainInvalid');
eq('标签前导连字符不合格', V('-www.guild-a.com').code, 'customDomainInvalid');
eq('标签尾随连字符不合格', V('www-.guild-a.com').code, 'customDomainInvalid');
eq('空标签不合格', V('www..guild-a.com').code, 'customDomainInvalid');
eq('平台 apex 保留', V('yanyun.app').code, 'customDomainReserved');
eq('平台子域保留', V('jijiguagua.yanyun.app').code, 'customDomainReserved');
eq('og 保留', V('og.yanyun.app').code, 'customDomainReserved');
eq('workers.dev 保留', V('release-yanyun.tbdlab.workers.dev').code, 'customDomainReserved');
eq('localhost 保留', V('localhost').code, 'customDomainInvalid');
eq('.local 保留', V('guild.local').code, 'customDomainReserved');
eq('.test 保留', V('guild.test').code, 'customDomainReserved');
  });

  it('B. candidate hosts', async () => {
/* ---------------- B. candidate hosts ---------------- */
eq('apex 非候选', isCustomDomainCandidateHost('yanyun.app'), false);
eq('平台子域非候选', isCustomDomainCandidateHost('subtest.yanyun.app'), false);
eq('workers.dev 非候选', isCustomDomainCandidateHost('release-yanyun.tbdlab.workers.dev'), false);
eq('localhost 非候选', isCustomDomainCandidateHost('localhost'), false);
eq('IP 非候选', isCustomDomainCandidateHost('203.0.113.7'), false);
eq('外部域名是候选', isCustomDomainCandidateHost('www.guild-a.com'), true);
  });

  it('C. bind service', async () => {
/* ---------------- C. bind service ---------------- */
r = await bindCustomDomain(A.db, 'guild-a', 'www.guild-a.com', 'UA', NOW);
eq('绑定成功', r.ok, true);
eq('绑定初始 pending', r.binding.status, 'pending');
check('所有权令牌 = 32 hex', /^[0-9a-f]{32}$/.test(r.binding.verifyToken), r.binding.verifyToken);
eq('按租户回读', (await getCustomDomainByTenant(A.db, 'guild-a'))?.hostname, 'www.guild-a.com');
eq('按域名回读', (await getCustomDomainByHostname(A.db, 'www.guild-a.com'))?.tenant, 'guild-a');
r = await bindCustomDomain(A.db, 'guild-b', 'www.guild-a.com', 'UA', NOW);
eq('他人域名冲突', r.ok === false && r.code, 'customDomainConflict');
r = await bindCustomDomain(A.db, 'guild-b', 'yanyun.app', 'UA', NOW);
eq('服务层保留拦截', r.ok === false && r.code, 'customDomainReserved');
r = await bindCustomDomain(A.db, 'guild-b', 'not a host', 'UA', NOW);
eq('服务层格式拦截', r.ok === false && r.code, 'customDomainInvalid');
const tokenA = (await getCustomDomainByTenant(A.db, 'guild-a')).verifyToken;
r = await bindCustomDomain(A.db, 'guild-a', 'www.guild-a.com', 'UA', NOW + 10);
eq('pending 同名重绑仍 pending', r.binding.status, 'pending');
check('重绑换新令牌', r.binding.verifyToken !== tokenA);
eq('清单含一条', (await listCustomDomainBindings(A.db)).length, 1);
const guide = customDomainDnsGuidance(await getCustomDomainByTenant(A.db, 'guild-a'), DEFAULT_SAAS_FALLBACK_ORIGIN);
eq('指引 CNAME 名 = 域名', guide.cnameName, 'www.guild-a.com');
eq('指引 CNAME 值 = fallback', guide.cnameValue, 'fallback.yanyun.app');
eq('指引 TXT 名', guide.txtName, '_yanyun-verify.www.guild-a.com');
eq('指引 TXT 值 = 令牌', guide.txtValue, (await getCustomDomainByTenant(A.db, 'guild-a')).verifyToken);
  });

  it('D. seam + DNS verification', async () => {
/* ---------------- D. seam + DNS verification ---------------- */
eq('接缝未配置判定', customDomainSaasConfigured({}), false);
eq('接缝已配置判定', customDomainSaasConfigured(SEAM_ENV), true);
eq('未配置时 fallback 用计划值 (仅指引用)', customDomainFallbackOrigin({}), DEFAULT_SAAS_FALLBACK_ORIGIN);
let v = await verifyCustomDomainBinding(A.db, 'guild-a', {}, NOW);
eq('接缝未通: 验证停在 seam', v.outcome, 'seam');
eq('接缝未通: 仍 pending', (await getCustomDomainByTenant(A.db, 'guild-a')).status, 'pending');
v = await verifyCustomDomainBinding(A.db, 'guild-b', SEAM_ENV, NOW);
eq('未绑定: none', v.outcome, 'none');

/* DNS stub: CNAME/TXT answers keyed by "name|type" */
dnsTable = new Map();
globalThis.fetch = async (input) => {
  const u = new URL(String(typeof input === 'string' ? input : input.url));
  if (u.hostname === 'cloudflare-dns.com') {
    const key = `${u.searchParams.get('name')}|${u.searchParams.get('type')}`;
    const data = dnsTable.get(key);
    return Response.json(data ? { Answer: data.map((d) => ({ data: d })) } : {});
  }
  return new Response('unstubbed', { status: 404 });
};
const bindingA = await getCustomDomainByTenant(A.db, 'guild-a');
dnsTable.set('www.guild-a.com|CNAME', ['other.example.net.']);
dnsTable.set('_yanyun-verify.www.guild-a.com|TXT', [`"${bindingA.verifyToken}"`]);
let dc = await checkCustomDomainDns(bindingA, 'fallback.yanyun.app');
eq('CNAME 错: cnameOk=false', dc.cnameOk, false);
eq('TXT 对: txtOk=true', dc.txtOk, true);
v = await verifyCustomDomainBinding(A.db, 'guild-a', SEAM_ENV, NOW);
eq('DNS 未齐: 停在 dns', v.outcome, 'dns');
eq('DNS 未齐: 仍 pending', (await getCustomDomainByTenant(A.db, 'guild-a')).status, 'pending');
dnsTable.set('www.guild-a.com|CNAME', ['fallback.yanyun.app.']);
dc = await checkCustomDomainDns(bindingA, 'fallback.yanyun.app');
eq('CNAME 对 (尾点容忍)', dc.cnameOk, true);
v = await verifyCustomDomainBinding(A.db, 'guild-a', SEAM_ENV, NOW + 60);
eq('DNS 齐 + 接缝通: 激活', v.outcome, 'activated');
eq('激活落库 active', (await getCustomDomainByTenant(A.db, 'guild-a')).status, 'active');
eq('verified_at 落库', (await getCustomDomainByTenant(A.db, 'guild-a')).verifiedAt, NOW + 60);
v = await verifyCustomDomainBinding(A.db, 'guild-a', SEAM_ENV, NOW);
eq('已 active 再验证: alreadyActive', v.outcome, 'alreadyActive');
r = await bindCustomDomain(A.db, 'guild-a', 'www.guild-a.com', 'UA', NOW + 120);
eq('active 同名重绑 = 无操作成功', r.ok && r.binding.status, 'active');

/* F0 tier semantics: live resolution follows the pure tier
 * verdict, so the resolution matrix below runs with guild-a
 * granted (legacy premium maps to tier 3). */
await grantPremiumManual(A.db, 'guild-a', 30);
  });

  it('E. lookup + worker resolution', async () => {
/* ---------------- E. lookup + worker resolution ---------------- */
eq('未知域名 lookup = null (回退现状)', await lookupGuildCustomDomainHost(A.db, 'www.unknown-guild.com', true), null);
eq('active + 接缝通 lookup', (await lookupGuildCustomDomainHost(A.db, 'www.guild-a.com', true))?.kind, 'active');
eq('active + 接缝通 slug', (await lookupGuildCustomDomainHost(A.db, 'www.guild-a.com', true))?.slug, 'guild-a');
eq('active 但接缝断 lookup = known', (await lookupGuildCustomDomainHost(A.db, 'www.guild-a.com', false))?.kind, 'known');

const assets = { fetch: async (req) => {
  const p = new URL(req.url).pathname;
  if (p === '/index.html') return new Response('<html><head></head><body>SPA-INDEX</body></html>', { status: 200, headers: { 'content-type': 'text/html' } });
  return new Response('not found', { status: 404 });
} };
worker = (await import('../src/worker.ts')).default;
wctx = { waitUntil() {} };
envSeam = { DB: A.db, ASSETS: assets, SAAS_FALLBACK_ORIGIN: 'fallback.yanyun.app' };
const envNoSeam = { DB: A.db, ASSETS: assets };
const callNoSeam = (url) => worker.fetch(new Request(url), envNoSeam, wctx);

res = await callSeam('https://www.guild-a.com/');
eq('自定义域名 / -> 200', res.status, 200);
let html = await res.text();
check('自定义域名根 og:url = 该域名根', html.includes('<meta property="og:url" content="https://www.guild-a.com/" />'), html.slice(0, 400));
check('自定义域名根 og:title 是本百业', html.includes('甲百业'), html.slice(0, 400));
res = await callSeam('https://www.guild-a.com/car/7');
eq('自定义域名 /car/7 -> 200', res.status, 200);
html = await res.text();
check('自定义域名车页 og:url', html.includes('<meta property="og:url" content="https://www.guild-a.com/car/7" />'), html.slice(0, 400));
res = await callSeam('https://www.guild-a.com/admin');
eq('自定义域名 /admin -> 200 (SPA)', res.status, 200);
await res.text();
res = await callSeam('https://www.guild-a.com/guild-b');
eq('自定义域名上他人百业 -> 404', res.status, 404);
await res.text();
res = await callNoSeam('https://www.guild-a.com/');
eq('接缝断时 active 域名 -> 404 (不漏主站)', res.status, 404);
const seamOffBody = await res.text();
res = await callSeam('https://www.unknown-guild.com/');
eq('无绑定外部域名 -> 回退现状 (200 主站)', res.status, 200);
await res.text();
/* pending host behaves like the seam-off host: plain 404 */
await bindCustomDomain(A.db, 'guild-b', 'www.guild-b.com', 'UA', NOW);
res = await callSeam('https://www.guild-b.com/');
eq('pending 域名 -> 404', res.status, 404);
eq('pending 与接缝断 404 响应体一致', await res.text(), seamOffBody);
/* main-host + subdomain regressions */
res = await callSeam('https://yanyun.app/');
eq('主域 / -> 200', res.status, 200);
html = await res.text();
check('主域根 og:url 不变', html.includes('<meta property="og:url" content="https://yanyun.app/" />'), html.slice(0, 400));
res = await callSeam('https://yanyun.app/guild-a');
eq('主域百业主页 -> 200', res.status, 200);
await res.text();
res = await callSeam('https://subtest.yanyun.app/');
eq('子域回归: 已开子域 -> 200', res.status, 200);
await res.text();
eq('子域解析回归', await resolveGuildSubdomain(A.db, 'subtest.yanyun.app'), 'subtest');
  });

  it('F. tier matrix (F0 pure verdict)', async () => {
/* ---------------- F. tier matrix (F0 pure verdict) ---------------- */
eq('有权益: tierLocked(3) 不锁', await tierLocked(A.db, 'guild-a', 3), false);
eq('有权益: active 判定 live', await isCustomDomainLive(A.db, await getCustomDomainByTenant(A.db, 'guild-a')), true);
eq('有权益: canonical origin = 自定义域名', await guildCustomDomainOrigin(A.db, 'guild-a'), 'https://www.guild-a.com');
await revokePremium(A.db, 'guild-a');
eq('无权益: tierLocked(3) 锁 (纯权益判定, 不看总闸)', await tierLocked(A.db, 'guild-a', 3), true);
eq('无权益: tierLocked(1) 也锁 (tier 0)', await tierLocked(A.db, 'guild-a', 1), true);
eq('无权益: 不再 live', await isCustomDomainLive(A.db, await getCustomDomainByTenant(A.db, 'guild-a')), false);
eq('无权益: lookup = known', (await lookupGuildCustomDomainHost(A.db, 'www.guild-a.com', true))?.kind, 'known');
res = await callSeam('https://www.guild-a.com/');
eq('无权益: 域名 404 (冻结)', res.status, 404);
await res.text();
await grantPremiumManual(A.db, 'guild-a', 30);
eq('授予后 tierLocked(3) 解锁', await tierLocked(A.db, 'guild-a', 3), false);
eq('授予后恢复 live', await isCustomDomainLive(A.db, await getCustomDomainByTenant(A.db, 'guild-a')), true);
res = await callSeam('https://www.guild-a.com/');
eq('授予后域名恢复出页', res.status, 200);
await res.text();
await revokePremium(A.db, 'guild-a');
eq('撤销后停解析 (记录仍在)', (await lookupGuildCustomDomainHost(A.db, 'www.guild-a.com', true))?.kind, 'known');
eq('撤销后绑定记录保留 (冻结不删)', (await getCustomDomainByTenant(A.db, 'guild-a'))?.status, 'active');
await grantPremiumManual(A.db, 'guild-a', 30);
eq('再授予后恢复 live (供组合点与 hub 段)', await isCustomDomainLive(A.db, await getCustomDomainByTenant(A.db, 'guild-a')), true);
A.tables.settings.set('guild-a|dev_only', '1');
eq('dev_only 百业自定义域名永不 live', await isCustomDomainLive(A.db, await getCustomDomainByTenant(A.db, 'guild-a')), false);
A.tables.settings.delete('guild-a|dev_only');
  });

  it('G. GraphQL admin surface', async () => {
/* ---------------- G. GraphQL admin surface ---------------- */
async function gql(query, { user = null, variables, env = {} } = {}) {
  const ctx = { env: { DB: A.db, ...env }, request: new Request('https://yanyun.app/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res2 = await yoga.fetch(new Request('https://yanyun.app/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res2.json();
}
const cdQFor = (slug) => `{ viewer { guildAdmin(slug: "${slug}") { ... on GuildAdmin { customDomain {
  __typename
  ... on GuildAdminCustomDomain { status hostname statusText guidanceText dnsCnameName dnsCnameValue dnsTxtName dnsTxtValue boundAtText }
  ... on GuildAdminCustomDomainLocked { premiumTitle premiumBody } } } } } }`;
const cdQ = cdQFor('guild-b');
/* entitled guilds compose the full variant and may bind;
 * the tier-lock sub-section below revokes guild-b on purpose. */
await grantPremiumManual(A.db, 'guild-b', 30);
await grantPremiumManual(A.db, 'guild-c', 30);
g = await gql(cdQFor('guild-c'), { user: ADMIN });
eq('未绑定: 变体为完整壳', g.data?.viewer?.guildAdmin?.customDomain?.__typename, 'GuildAdminCustomDomain');
eq('未绑定: status NONE', g.data?.viewer?.guildAdmin?.customDomain?.status, 'NONE');
eq('未绑定: hostname null', g.data?.viewer?.guildAdmin?.customDomain?.hostname, null);
eq('未绑定: statusText', g.data?.viewer?.guildAdmin?.customDomain?.statusText, '尚未绑定域名');
eq('未绑定: DNS 字段全 null', g.data?.viewer?.guildAdmin?.customDomain?.dnsTxtValue, null);
g = await gql(`{ viewer { guildAdmin(slug: "guild-b") { __typename } } }`, { user: MEMBER });
eq('成员只见 Locked 壳 (不变)', g.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
g = await gql(cdQ, { user: MEMBER });
eq('成员面 customDomain 零下发 (Locked 无此字段)', g.data?.viewer?.guildAdmin?.customDomain, undefined);

const bindM = `mutation($slug: String!, $hostname: String!) { bindGuildCustomDomain(slug: $slug, hostname: $hostname) { ok errorCode error } }`;
g = await gql(bindM, { user: MEMBER, variables: { slug: 'guild-b', hostname: 'www.guild-b.com' } });
eq('成员绑定 -> adminOnly', g.data?.bindGuildCustomDomain?.errorCode, 'adminOnly');
g = await gql(bindM, { user: ADMIN, variables: { slug: 'guild-b', hostname: 'bad host' } });
eq('格式错误码', g.data?.bindGuildCustomDomain?.errorCode, 'customDomainInvalid');
eq('错误文案后端下发', g.data?.bindGuildCustomDomain?.error, '域名格式不正确，请填写裸域名（如 www.example.com）');
g = await gql(bindM, { user: ADMIN, variables: { slug: 'guild-b', hostname: 'og.yanyun.app' } });
eq('保留错误码', g.data?.bindGuildCustomDomain?.errorCode, 'customDomainReserved');
g = await gql(bindM, { user: ADMIN, variables: { slug: 'guild-b', hostname: 'www.guild-a.com' } });
eq('冲突错误码', g.data?.bindGuildCustomDomain?.errorCode, 'customDomainConflict');
g = await gql(bindM, { user: ADMIN, variables: { slug: 'guild-b', hostname: 'www.guild-b.com' } });
eq('管理员绑定 ok (guild-b 已由服务层绑定同名, active 判定外为 pending 无操作)', g.data?.bindGuildCustomDomain?.ok, true);
g = await gql(cdQ, { user: ADMIN });
const cdB = g.data?.viewer?.guildAdmin?.customDomain;
eq('guild-b 状态 PENDING', cdB?.status, 'PENDING');
eq('guild-b statusText = 待平台接通 (无 env)', cdB?.statusText, '已绑定，待平台接通');
eq('guild-b CNAME 值 = 计划 fallback', cdB?.dnsCnameValue, 'fallback.yanyun.app');
check('guild-b TXT 值 = 令牌下发', /^[0-9a-f]{32}$/.test(cdB?.dnsTxtValue || ''), cdB?.dnsTxtValue);
check('guild-b boundAtText 有值', typeof cdB?.boundAtText === 'string' && cdB.boundAtText.length > 0, cdB?.boundAtText);
const verifyM = `mutation($slug: String!) { verifyGuildCustomDomain(slug: $slug) { ok errorCode } }`;
g = await gql(verifyM, { user: ADMIN, variables: { slug: 'guild-b' } });
eq('无接缝验证 -> seam 错误码', g.data?.verifyGuildCustomDomain?.errorCode, 'customDomainSeamPending');
/* seam on + DNS stubbed for guild-b */
const bindingB = await getCustomDomainByTenant(A.db, 'guild-b');
dnsTable.set('www.guild-b.com|CNAME', ['fallback.yanyun.app.']);
dnsTable.set('_yanyun-verify.www.guild-b.com|TXT', [`"${bindingB.verifyToken}"`]);
g = await gql(verifyM, { user: ADMIN, variables: { slug: 'guild-b' }, env: SEAM_ENV });
eq('接缝通 + DNS 齐: 验证 ok', g.data?.verifyGuildCustomDomain?.ok, true);
g = await gql(cdQ, { user: ADMIN, env: SEAM_ENV });
eq('guild-b 转 ACTIVE', g.data?.viewer?.guildAdmin?.customDomain?.status, 'ACTIVE');
eq('guild-b statusText 已生效', g.data?.viewer?.guildAdmin?.customDomain?.statusText, '已生效');
/* tier lock: entitlement revoked (pure verdict, no paygate) */
await revokePremium(A.db, 'guild-b');
g = await gql(cdQ, { user: ADMIN });
eq('未达 T3: Locked 变体', g.data?.viewer?.guildAdmin?.customDomain?.__typename, 'GuildAdminCustomDomainLocked');
eq('Locked 变体带 premium 文案', g.data?.viewer?.guildAdmin?.customDomain?.premiumTitle, '开通百业 Premium');
eq('Locked 变体零绑定数据 (hostname 不下发)', g.data?.viewer?.guildAdmin?.customDomain?.hostname, undefined);
eq('Locked 变体零 DNS 数据', g.data?.viewer?.guildAdmin?.customDomain?.dnsTxtValue, undefined);
g = await gql(bindM, { user: ADMIN, variables: { slug: 'guild-b', hostname: 'www.other-b.com' } });
eq('未达 T3 绑定 -> premiumRequired', g.data?.bindGuildCustomDomain?.errorCode, 'premiumRequired');
g = await gql(verifyM, { user: ADMIN, variables: { slug: 'guild-b' } });
eq('未达 T3 验证 -> premiumRequired', g.data?.verifyGuildCustomDomain?.errorCode, 'premiumRequired');
const removeM = `mutation($slug: String!) { removeGuildCustomDomain(slug: $slug) { ok errorCode } }`;
await grantPremiumManual(A.db, 'guild-b', 30);
g = await gql(cdQ, { user: ADMIN });
eq('授予后回到完整变体', g.data?.viewer?.guildAdmin?.customDomain?.__typename, 'GuildAdminCustomDomain');
g = await gql(removeM, { user: ADMIN, variables: { slug: 'guild-b' } });
eq('解绑 ok', g.data?.removeGuildCustomDomain?.ok, true);
eq('解绑后记录删除', await getCustomDomainByTenant(A.db, 'guild-b'), null);
g = await gql(verifyM, { user: ADMIN, variables: { slug: 'guild-b' }, env: SEAM_ENV });
eq('解绑后验证 -> notBound', g.data?.verifyGuildCustomDomain?.errorCode, 'customDomainNotBound');
  });

  it('H. composition points', async () => {
/* ---------------- H. composition points ---------------- */
const link = await mintShortLink(A.db, 'guild-a', 7);
const msgCustom = await buildReminderMessage(A.db, A.tables.events.find((e) => e.id === 7), 'guild-a', NOW);
eq('提醒链接: 自定义域名优先于子域', msgCustom.embeds[0].url, 'https://www.guild-a.com/car/7');
const shareQ = `query($slug: String, $id: ID!) { groupingDetailPage(slug: $slug, id: $id) { shareUrl } }`;
async function gqlAt(url, query, variables, user) {
  const ctx = { env: { DB: A.db }, request: new Request(url), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res2 = await yoga.fetch(new Request(url, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res2.json();
}
g = await gqlAt('https://www.guild-a.com/graphql', shareQ, { slug: 'guild-a', id: '7' }, MEMBER);
eq('自定义域名请求 shareUrl 在该域名上', g.data?.groupingDetailPage?.shareUrl, `https://www.guild-a.com/c/${link.code}`);
g = await gqlAt('https://yanyun.app/graphql', shareQ, { slug: 'guild-a', id: '7' }, MEMBER);
eq('主域请求 shareUrl 不变', g.data?.groupingDetailPage?.shareUrl, `https://yanyun.app/c/${link.code}`);
res = await callSeam(`https://www.guild-a.com/c/${link.code}`);
eq('自定义域名短链 -> 302', res.status, 302);
eq('自定义域名短链落点 = 该域名车页', res.headers.get('location'), 'https://www.guild-a.com/car/7');
await res.text();
res = await callSeam(`https://yanyun.app/c/${link.code}`);
eq('主域短链落点不变', res.headers.get('location'), 'https://yanyun.app/guild-a/car/7');
await res.text();
  });

  it('I. hub platform surface', async () => {
/* ---------------- I. hub platform surface ---------------- */
const hubApp = new Hono();
hubApp.use('*', async (c, next) => { c.set('ip', '127.0.0.1'); await next(); });
hubApp.route('/api/hub', hubRoutes);
const hubEnv = { DB: A.db, ADMIN_PASSWORD: 'customdomain-test-pw', SITE_URL: 'http://local', SAAS_FALLBACK_ORIGIN: 'fallback.yanyun.app' };
const hubToken = await makeToken('customdomain-test-pw', '__hub__');
async function hub(path, method = 'GET', body, withToken = true) {
  const res2 = await hubApp.fetch(new Request('http://local' + path, {
    method,
    headers: { ...(withToken ? { authorization: `Bearer ${hubToken}` } : {}), 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }), hubEnv);
  return { status: res2.status, json: await res2.json().catch(() => null) };
}
let hb = await hub('/api/hub/billing', 'GET', undefined, false);
eq('hub: 计费状态需超管令牌', hb.status, 401);
hb = await hub('/api/hub/billing');
eq('hub: 计费状态可读', hb.status, 200);
eq('hub: 接缝状态下发', hb.json?.billing?.customDomainSaasConfigured, true);
const tstate = (slug) => hb.json?.billing?.tenants?.find((t) => t.slug === slug);
eq('hub: guild-a 绑定可见', tstate('guild-a')?.customDomain?.hostname, 'www.guild-a.com');
eq('hub: guild-a 状态 active', tstate('guild-a')?.customDomain?.status, 'active');
eq('hub: guild-b 未绑定为 null', tstate('guild-b')?.customDomain, null);
check('hub: 令牌不下发', !JSON.stringify(hb.json).includes((await getCustomDomainByTenant(A.db, 'guild-a')).verifyToken));
hb = await hub('/api/hub/billing/custom-domain', 'PUT', { slug: 'guild-a', disabled: true });
eq('hub: 停用 ok', hb.status, 200);
eq('hub: 停用后状态 disabled', tstate('guild-a')?.customDomain?.status, 'disabled');
res = await callSeam('https://www.guild-a.com/');
eq('hub 停用后域名立即 404', res.status, 404);
await res.text();
hb = await hub('/api/hub/billing/custom-domain', 'PUT', { slug: 'guild-a', disabled: false });
eq('hub: 恢复后状态回 pending (须重验)', tstate('guild-a')?.customDomain?.status, 'pending');
hb = await hub('/api/hub/billing/custom-domain', 'PUT', { slug: 'guild-b', disabled: true });
eq('hub: 未绑定百业停用 -> 404', hb.status, 404);
hb = await hub('/api/hub/billing/custom-domain', 'PUT', { slug: 'ghost', disabled: true });
eq('hub: 不存在百业 -> 404', hb.status, 404);
/* restore guild-a to active for the backup assertion below */
await verifyCustomDomainBinding(A.db, 'guild-a', SEAM_ENV, NOW + 300);
eq('重验后恢复 active', (await getCustomDomainByTenant(A.db, 'guild-a')).status, 'active');

check('无未路由 SQL (备份全表导出前)', A.unknownSql.size === 0, [...A.unknownSql].join(' | '));
  });

  it('J. backup coverage', async () => {
/* ---------------- J. backup coverage ---------------- */
check('备份清单含 guild_custom_domains', BACKUP_ENTITIES.some(([k]) => k === 'guild_custom_domains'));
const backup = await exportBackup(A.db).catch(() => null);
eq('备份导出含绑定行', backup?.entities?.guild_custom_domains?.count, 1);

globalThis.fetch = realFetch;
  });

  afterAll(async () => { globalThis.fetch = realFetch; });
});
