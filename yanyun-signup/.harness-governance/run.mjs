// Governance acceptance (premium governance line P16/P17, both T3):
//  - Tier matrix on the governance union, over the foundation's
//    tierLocked (a pure entitlement verdict that never consults
//    the paygate master switch): no entitlement / t1 / t2 / an
//    expired t3 composes GuildGovernanceLocked with zero
//    governance data, and governance writes answer
//    governanceTierRequired; plan t3 — and legacy 'premium', which
//    the foundation reads as tier 3 — composes the full page, with
//    the paygate switch on or off alike.
//  - Permission matrix: an ungranted member's guildAdmin is
//    GuildAdminLocked and the governance field does not exist for
//    them (SDL pins it to GuildAdmin only). A granted officer
//    resolves GuildAdmin with exactly their capabilities in
//    viewerCapabilities; per-surface composition follows the set
//    (events list ships, stats is not section-locked, the officer
//    page composes zero members, announcements fall back to the
//    member variant, profile values are neutralized). Writes:
//    officer with the capability passes; officer without it gets
//    capabilityRequired; a member with nothing keeps the historic
//    adminOnly. Granting itself is ungrantable (officer ->
//    adminOnly). The grouping manage verdict passes an events
//    officer of the grouping's own guild and nobody else new.
//  - Board: any officer posts; a plain member cannot; delete is
//    author-or-admin only; posts never appear in member responses.
//  - Audit: the scripted management actions land as audit events
//    (newest first, paged by limit/offset, total count matches),
//    carrying actor + target summary only — a note's body never
//    appears anywhere in the audit payload. The label map is
//    pinned to the action vocabulary both ways.
// Real yoga + real resolvers + FakeDB routing by SQL shape into
// in-memory tables (same pattern as .harness-officer).
import { yoga } from '../src/graphql.ts';
import { typeDefs } from '../src/graphql-schema.ts';
import { getGroupingManageVerdict } from '../src/domains/platform/graphql-base.ts';
import { GUILD_AUDIT_ACTIONS } from '../src/domains/guilds/guild-audit.ts';
import { AUDIT_ACTION_LABEL_FIELD } from '../src/domains/guilds/governance-graphql.ts';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}
function eq(name, got, want) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* Drizzle query-builder channel helper (same as .harness-announcements). */
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
function makeDb() {
  const state = {
    tenants: [
      { slug: 'alpha', guild_name: '甲百业', password_hash: 'x', announcement: '甲公告原文', slogan: '甲标语', master_name: '甲掌门', logo_url: '', bg_image_url: '', recruit_open: 0 },
      { slug: 'beta', guild_name: '乙百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', recruit_open: 0 },
    ],
    settings: new Map([
      ['alpha|discord_guild_id', 'DG1'],
      ['beta|discord_guild_id', 'DG2'],
    ]),
    users: new Map([
      ['A1', JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '8', owner: false }])],
      ['M1', JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '0', owner: false }])],
      ['M2', JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '0', owner: false }])],
      ['M3', JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '0', owner: false }])],
      ['B1', JSON.stringify([{ id: 'DG2', name: 'S2', permissions: '8', owner: false }])],
    ]),
    guildMembers: [
      { tenant: 'alpha', discord_id: 'A1', nick: '管理员甲', global_name: 'AdminA' },
      { tenant: 'alpha', discord_id: 'M1', nick: '成员一', global_name: 'MemberOne' },
      { tenant: 'alpha', discord_id: 'M2', nick: '成员二', global_name: 'MemberTwo' },
      { tenant: 'alpha', discord_id: 'M3', nick: '成员三', global_name: 'MemberThree' },
      { tenant: 'beta', discord_id: 'B1', nick: '乙管理员', global_name: 'AdminB' },
    ],
    // EventRow key order mirrors .harness-officer.
    events: [
      { id: 11, tenant: 'alpha', title: '周六双十人', type: 'activity', description: '', starts_at: null, meet_info: '', max_slots: 20, status: 'open', starts_at_utc: 1760000000, origin: 'web', created_by: '管理员甲', manage_code: '', dungeon: '', creator_discord_id: 'M2', reminder_sent_at: null, reminder_error: null },
      { id: 21, tenant: 'beta', title: '乙百业活动', type: 'activity', description: '', starts_at: null, meet_info: '', max_slots: 20, status: 'open', starts_at_utc: 1760200000, origin: 'web', created_by: '乙管理员', manage_code: '', dungeon: '', creator_discord_id: 'B1', reminder_sent_at: null, reminder_error: null },
    ],
    signups: [],
    entitlements: new Map(), // tenant -> row
    grants: [],              // guild_officer_grants rows
    posts: [],               // guild_officer_posts rows
    auditEvents: [],         // guild_audit_events rows
    notes: [],               // guild_member_notes rows
    announcements: [],       // guild_announcements rows
  };
  let nextId = 1000;

  function norm(sql) {
    return sql.replace(/"/g, '')
      .replace(/\b(tenants|settings|users|guild_members|guild_officer_grants|guild_officer_posts|guild_audit_events|guild_entitlements|guild_member_notes|member_season_goals|events|signups|guild_announcements|guild_announcement_reads|usage_counters|push_tokens)\./g, '')
      .replace(/\s+/g, ' ');
  }

  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });

    /* officer grants */
    if (/^INSERT INTO guild_officer_grants/i.test(sql)) {
      const [tenant, discordId, capabilities, grantedBy, grantedByName, createdAt, updatedAt] = b;
      const ex = state.grants.find((r) => r.tenant === tenant && r.discord_id === discordId);
      if (ex) Object.assign(ex, { capabilities, granted_by: grantedBy, granted_by_name: grantedByName, updated_at: updatedAt });
      else state.grants.push({ tenant, discord_id: discordId, capabilities, granted_by: grantedBy, granted_by_name: grantedByName, created_at: createdAt, updated_at: updatedAt });
      return { meta: { changes: 1 } };
    }
    if (/^DELETE FROM guild_officer_grants/i.test(sql)) {
      const before = state.grants.length;
      state.grants = state.grants.filter((r) => !(r.tenant === b[0] && r.discord_id === b[1]));
      return { meta: { changes: before - state.grants.length } };
    }
    if (/FROM guild_officer_grants/i.test(sql)) {
      let rows = state.grants.filter((r) => r.tenant === b[0]);
      if (/discord_id = \?/i.test(sql) && b.length > 1) rows = rows.filter((r) => r.discord_id === b[1]);
      return kind === 'first' ? (rows[0] ?? null) : all(rows.map((r) => ({ ...r })));
    }
    /* board posts */
    if (/^INSERT INTO guild_officer_posts/i.test(sql)) {
      const [tenant, body, authorId, authorName, createdAt, updatedAt] = b;
      const row = { id: nextId++, tenant, body, author_discord_id: authorId, author_name: authorName, created_at: createdAt, updated_at: updatedAt };
      state.posts.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    if (/^DELETE FROM guild_officer_posts/i.test(sql)) {
      const before = state.posts.length;
      state.posts = state.posts.filter((r) => !(r.tenant === b[0] && r.id === Number(b[1])));
      return { meta: { changes: before - state.posts.length } };
    }
    if (/FROM guild_officer_posts/i.test(sql)) {
      let rows = state.posts.filter((r) => r.tenant === b[0]);
      if (/AND id =/i.test(sql)) {
        const row = rows.find((r) => r.id === Number(b[1]));
        return first(row ? { ...row } : null);
      }
      rows = [...rows].sort((x, y) => y.id - x.id);
      return all(rows.map((r) => ({ ...r })));
    }
    /* audit events */
    if (/^INSERT INTO guild_audit_events/i.test(sql)) {
      const [tenant, actorId, actorName, action, targetType, targetId, targetLabel, createdAt] = b;
      const row = { id: nextId++, tenant, actor_discord_id: actorId, actor_name: actorName, action, target_type: targetType, target_id: targetId, target_label: targetLabel, created_at: createdAt };
      state.auditEvents.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    if (/FROM guild_audit_events/i.test(sql)) {
      if (/COUNT\(\*\)/i.test(sql)) return first({ c: state.auditEvents.filter((r) => r.tenant === b[0]).length });
      let rows = state.auditEvents.filter((r) => r.tenant === b[0]).sort((x, y) => y.id - x.id);
      const lim = /LIMIT \?/i.test(sql) ? Number(b[1]) : null;
      const off = /OFFSET \?/i.test(sql) ? Number(b[2]) : 0;
      if (lim != null) rows = rows.slice(off, off + lim);
      return all(rows.map((r) => ({ ...r })));
    }
    /* officer notes (F12 surface sharing) */
    if (/^INSERT INTO guild_member_notes/i.test(sql)) {
      const [tenant, memberDiscordId, body, authorId, authorName, createdAt, updatedAt] = b;
      const row = { id: nextId++, tenant, member_discord_id: memberDiscordId, body, author_discord_id: authorId, author_name: authorName, created_at: createdAt, updated_at: updatedAt };
      state.notes.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    if (/FROM guild_member_notes/i.test(sql)) {
      let rows = state.notes.filter((r) => r.tenant === b[0]);
      if (/AND id =/i.test(sql)) {
        const row = rows.find((r) => r.id === Number(b[1]));
        return first(row ? { ...row } : null);
      }
      return all(rows.map((r) => ({ ...r })));
    }
    if (/FROM member_season_goals/i.test(sql)) return all([]);
    /* announcements (post path only) */
    if (/^INSERT INTO guild_announcements/i.test(sql)) {
      const [tenant, kind2, title, body, authorId, authorName, createdAt] = b;
      const row = { id: nextId++, tenant, kind: kind2, title, body, author_discord_id: authorId, author_name: authorName, created_at: createdAt };
      state.announcements.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    if (/FROM guild_announcements/i.test(sql)) {
      let rows = state.announcements.filter((r) => r.tenant === b[0]);
      if (/AND id =/i.test(sql)) {
        const row = rows.find((r) => r.id === Number(b[1]));
        return first(row ? { ...row } : null);
      }
      return all(rows.map((r) => ({ ...r })));
    }
    if (/FROM guild_announcement_reads/i.test(sql)) return all([]);
    if (/FROM usage_counters/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/^INSERT INTO usage_counters/i.test(sql)) return { meta: { changes: 1 } };
    if (/^UPDATE usage_counters/i.test(sql)) return { meta: { changes: 1 } };
    if (/FROM push_tokens/i.test(sql)) return all([]);
    /* events / signups */
    if (/^INSERT INTO events/i.test(sql)) {
      const row = { id: nextId++, tenant: b[0], title: b[1], type: b[2], description: b[3], starts_at: b[4], starts_at_utc: b[5], dungeon: b[6], max_slots: b[7], meet_info: b[8], status: b[9], origin: b[10], created_by: '', manage_code: '', creator_discord_id: '', reminder_sent_at: null, reminder_error: null };
      state.events.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    if (/FROM events/i.test(sql)) {
      let rows = state.events.filter((e) => e.tenant === b[0]);
      if (/starts_at_utc >= \?/i.test(sql)) rows = rows.filter((e) => e.starts_at_utc != null && e.starts_at_utc >= b[1] && e.starts_at_utc < b[2]);
      if (/ORDER BY .* DESC/i.test(sql)) rows = [...rows].sort((x, y) => y.id - x.id);
      return all(rows.map((e) => ({ ...e, signup_count: state.signups.filter((s) => s.event_id === e.id).length })));
    }
    if (/FROM signups/i.test(sql)) {
      return all(state.signups.filter((s) => s.event_id === Number(b[0])).map((s) => ({ ...s })));
    }
    /* generic tenant profile update */
    if (/^UPDATE tenants SET/i.test(sql)) {
      const t = state.tenants.find((x) => x.slug === b[b.length - 1]);
      if (t) {
        const sets = /SET (.+?) WHERE/i.exec(sql)?.[1] || '';
        const cols = sets.split(',').map((p) => p.trim().split('=')[0].trim());
        cols.forEach((c, i) => { t[c] = b[i]; });
      }
      return { meta: { changes: 1 } };
    }
    /* tenants / settings / users / roster / entitlements */
    if (/FROM tenants WHERE slug/i.test(sql)) return first(state.tenants.find((t) => t.slug === b[0]));
    if (/FROM settings WHERE tenant = \? AND key = \?/i.test(sql)) {
      const v = state.settings.get(`${b[0]}|${b[1]}`);
      return first(v === undefined ? null : { value: v });
    }
    if (/FROM settings WHERE key = \?/i.test(sql)) {
      const rows = [];
      for (const [k, v] of state.settings) { const [t, key] = k.split('|'); if (key === b[0]) rows.push({ tenant: t, value: v }); }
      return all(rows);
    }
    if (/SELECT guilds_json FROM users/i.test(sql)) {
      const v = state.users.get(String(b[0]));
      return first(v === undefined ? null : { guilds_json: v });
    }
    if (/FROM users/i.test(sql)) return first(null);
    if (/FROM guild_members/i.test(sql)) {
      if (/tenant = \? AND discord_id =/i.test(sql)) {
        const row = state.guildMembers.find((m) => m.tenant === b[0] && m.discord_id === b[1]);
        return first(row ? { nick: row.nick, global_name: row.global_name } : null);
      }
      return all(state.guildMembers.filter((m) => m.tenant === b[0]).map((m) => ({ ...m })));
    }
    if (/FROM guild_entitlements/i.test(sql)) {
      const row = state.entitlements.get(String(b[0]));
      return first(row ? { ...row } : null);
    }
    if (/FROM settings/i.test(sql)) return all([]);
    if (kind === 'first') return null;
    return { results: [] };
  }

  const stmt = (sql) => ({
    _b: [], bind(...a) { this._b = a; return this; },
    async raw() { const res = await route('all', sql, this._b); return toRawRows(sql, (res && res.results) || []); },
    async first() { return route('first', sql, this._b); },
    async all() { return route('all', sql, this._b); },
    async run() { return route('run', sql, this._b); },
  });
  const db = {
    prepare: (sql) => stmt(sql),
    batch: async (stmts) => { for (const st of stmts) await st.run(); return []; },
  };
  return { db, state };
}

const { db, state } = makeDb();
const env = { DB: db };
const adminA = { discordId: 'A1', name: '管理员甲', guilds: ['DG1'] };
const member1 = { discordId: 'M1', name: '成员一', guilds: ['DG1'] };
const member2 = { discordId: 'M2', name: '成员二', guilds: ['DG1'] };
const member3 = { discordId: 'M3', name: '成员三', guilds: ['DG1'] };
const adminB = { discordId: 'B1', name: '乙管理员', guilds: ['DG2'] };

async function gql(query, { user = adminA, variables } = {}) {
  const ctx = {
    env, request: new Request('http://local/graphql'), user,
    locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai',
    executionCtx: { waitUntil() {} },
  };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

/* ---- A. SDL pins + label map pin ---- */
{
  const adminBlock = /type GuildAdmin \{([\s\S]*?)\n\}/.exec(typeDefs)?.[1] || '';
  check('SDL: governance 只挂 GuildAdmin', adminBlock.includes('governance'));
  check('SDL: governanceResult union 含 Locked', /union GuildGovernanceResult = GuildGovernancePage \| GuildGovernanceLocked/.test(typeDefs));
  check('SDL: viewerCapabilities 在 GuildAdmin', adminBlock.includes('viewerCapabilities'));
  const guildBlock = /type Guild \{([\s\S]*?)\n\}/.exec(typeDefs)?.[1] || '';
  check('SDL: Guild 块已捕获( pin 非空转)', guildBlock.length > 100);
  check('SDL: 成员 Guild 类型无 governance', !guildBlock.includes('governance'));
  check('SDL: stats union 含 SectionLocked', /union GuildAdminStatsResult = GuildAdminStats \| GuildAdminStatsLocked \| GuildAdminSectionLocked/.test(typeDefs));
  eq('审计动作标签映射与动作词表双向一致',
    Object.keys(AUDIT_ACTION_LABEL_FIELD).sort(), [...GUILD_AUDIT_ACTIONS].sort());
  eq('审计动作词表共 36 个', GUILD_AUDIT_ACTIONS.length, 36);
}

/* ---- B. Tier matrix (admin viewer) ---- */
const GOV_Q = `query($slug: String!) {
  viewer { guildAdmin(slug: $slug) {
    __typename
    ... on GuildAdmin {
      viewerCapabilities
      governance {
        __typename
        ... on GuildGovernancePage {
          canManageGrants
          officers { discordId capabilities }
          boardPosts { id body }
          auditEvents { action }
          auditTotalCount
        }
        ... on GuildGovernanceLocked { lockedTitle lockedBody }
      }
    }
  } }
}`;
{
  const ENT = (plan, current_period_end = null) => ({
    tenant: 'alpha', plan, source: 'manual', current_period_end,
    stripe_customer_id: null, stripe_subscription_id: null, updated_at: 1,
  });
  // No entitlement (today's production shape for every guild):
  // Locked, and the admin's capability set still composes on the
  // shell — capabilities are a verdict fact, not tier data.
  let r = await gql(GOV_Q, { variables: { slug: 'alpha' } });
  eq('无权益: 管理员治理面 Locked', r.data?.viewer?.guildAdmin?.governance?.__typename, 'GuildGovernanceLocked');
  eq('无权益: 管理员能力全集仍下发', [...(r.data?.viewer?.guildAdmin?.viewerCapabilities || [])].sort(),
    ['announce', 'discord', 'events', 'guides', 'officer', 'profile', 'recruit', 'season', 'stats', 'tools']);
  check('无权益: Locked 只带文案两字段',
    r.data?.viewer?.guildAdmin?.governance?.lockedTitle != null && r.data?.viewer?.guildAdmin?.governance?.lockedBody != null
    && !('boardPosts' in (r.data?.viewer?.guildAdmin?.governance || {})));

  state.entitlements.set('alpha', ENT('t1'));
  r = await gql(GOV_Q, { variables: { slug: 'alpha' } });
  eq('T1: Locked', r.data?.viewer?.guildAdmin?.governance?.__typename, 'GuildGovernanceLocked');

  state.entitlements.set('alpha', ENT('t2'));
  r = await gql(GOV_Q, { variables: { slug: 'alpha' } });
  eq('T2: Locked', r.data?.viewer?.guildAdmin?.governance?.__typename, 'GuildGovernanceLocked');

  let m = await gql(`mutation { setOfficerGrant(slug: "alpha", memberDiscordId: "M1", capabilities: ["events"]) { ok errorCode } }`);
  eq('档位不足时授权写入拒绝 governanceTierRequired', m.data?.setOfficerGrant?.errorCode, 'governanceTierRequired');
  eq('档位不足时 grants 表零写入', state.grants.length, 0);

  // Legacy boolean premium reads as tier 3 in the foundation's
  // derivation, so a stored premium grant unlocks governance.
  state.entitlements.set('alpha', ENT('premium'));
  r = await gql(GOV_Q, { variables: { slug: 'alpha' } });
  eq('旧 premium(底座读作 T3): Page 下发', r.data?.viewer?.guildAdmin?.governance?.__typename, 'GuildGovernancePage');

  state.entitlements.set('alpha', ENT('t3'));
  r = await gql(GOV_Q, { variables: { slug: 'alpha' } });
  eq('T3: Page 下发', r.data?.viewer?.guildAdmin?.governance?.__typename, 'GuildGovernancePage');
  eq('T3: canManageGrants=true', r.data?.viewer?.guildAdmin?.governance?.canManageGrants, true);

  state.entitlements.set('alpha', ENT('t3', 1));
  r = await gql(GOV_Q, { variables: { slug: 'alpha' } });
  eq('T3 已过期: Locked', r.data?.viewer?.guildAdmin?.governance?.__typename, 'GuildGovernanceLocked');

  // The verdict ignores the paygate master switch both ways:
  // switch ON with a live t3 still composes the page.
  state.entitlements.set('alpha', ENT('t3'));
  state.settings.set('|paygate_enabled', '1');
  r = await gql(GOV_Q, { variables: { slug: 'alpha' } });
  eq('paygate ON + T3: Page 下发(tierLocked 不看总闸)', r.data?.viewer?.guildAdmin?.governance?.__typename, 'GuildGovernancePage');
  state.settings.delete('|paygate_enabled');
}

/* ---- C. Grants + permission matrix (T3 in force from here) ---- */
{
  // Member with nothing: Locked shell, and governance does not exist.
  let r = await gql(GOV_Q, { user: member1, variables: { slug: 'alpha' } });
  eq('无授权成员: GuildAdminLocked', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
  r = await gql(`query { viewer { guildAdmin(slug: "alpha") { ... on GuildAdmin { governance { __typename } } } } }`, { user: member1 });
  eq('无授权成员响应零治理数据(Locked 变体无此面)', r.data?.viewer?.guildAdmin?.governance, undefined);

  // Member write before any grant: historic adminOnly.
  let m = await gql(`mutation { updateGuildProfile(slug: "alpha", input: { name: "改名测试" }) { ok errorCode } }`, { user: member1 });
  eq('无授权成员写资料 -> adminOnly(回归口径)', m.data?.updateGuildProfile?.errorCode, 'adminOnly');

  // Admin grants M1 events+stats.
  m = await gql(`mutation { setOfficerGrant(slug: "alpha", memberDiscordId: "M1", capabilities: ["events", "stats", "bogus"]) { ok errorCode } }`);
  eq('管理员授权 M1 成功', m.data?.setOfficerGrant?.ok, true);
  eq('授权行落库(未知能力已过滤)', state.grants.find((g) => g.discord_id === 'M1')?.capabilities, 'events,stats');

  r = await gql(GOV_Q, { user: member1, variables: { slug: 'alpha' } });
  eq('被授军官 M1: GuildAdmin 解析', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdmin');
  eq('M1 viewerCapabilities 精确', r.data?.viewer?.guildAdmin?.viewerCapabilities, ['events', 'stats']);
  eq('M1 治理页 Page', r.data?.viewer?.guildAdmin?.governance?.__typename, 'GuildGovernancePage');
  eq('M1 canManageGrants=false', r.data?.viewer?.guildAdmin?.governance?.canManageGrants, false);
  eq('M1 治理页 officers 零下发(授权名单仅管理员)', r.data?.viewer?.guildAdmin?.governance?.officers, []);
  check('M1 治理页 audit 可见(本线动作已有留痕)', (r.data?.viewer?.guildAdmin?.governance?.auditEvents || []).length >= 1);

  // Composition per capability for M1.
  r = await gql(`query { viewer { guildAdmin(slug: "alpha") {
    ... on GuildAdmin {
      announcement
      events { id title }
      stats { __typename }
      announcements { canPost }
      officer { members { discordId } }
    } } } }`, { user: member1 });
  eq('M1(events): 活动列表下发', (r.data?.viewer?.guildAdmin?.events || []).map((e) => String(e.id)), ['11']);
  eq('M1(stats): stats 非 SectionLocked', r.data?.viewer?.guildAdmin?.stats?.__typename === 'GuildAdminStats', true);
  eq('M1(无 profile): 公告原文零下发', r.data?.viewer?.guildAdmin?.announcement, '');
  eq('M1(无 announce): 公告面降级成员变体 canPost=false', r.data?.viewer?.guildAdmin?.announcements?.canPost, false);
  eq('M1(无 officer): 军官页成员零下发', r.data?.viewer?.guildAdmin?.officer?.members, []);

  // Write matrix for M1.
  m = await gql(`mutation { createAdminEvent(slug: "alpha", input: { title: "军官建车", type: ACTIVITY, startsAtUtc: 1999999999, maxSlots: 20 }) { ok errorCode id } }`, { user: member1 });
  eq('M1(events): 建活动成功', m.data?.createAdminEvent?.ok, true);
  m = await gql(`mutation { updateGuildProfile(slug: "alpha", input: { announcement: "篡改" }) { ok errorCode } }`, { user: member1 });
  eq('M1(无 profile): 改资料 -> capabilityRequired', m.data?.updateGuildProfile?.errorCode, 'capabilityRequired');
  eq('资料未被改动', state.tenants.find((t) => t.slug === 'alpha').announcement, '甲公告原文');
  m = await gql(`mutation { setOfficerGrant(slug: "alpha", memberDiscordId: "M2", capabilities: ["events"]) { ok errorCode } }`, { user: member1 });
  eq('军官不得授权(granting 不可授予) -> adminOnly', m.data?.setOfficerGrant?.errorCode, 'adminOnly');

  // Cross-guild: beta's admin holds nothing in alpha.
  m = await gql(`mutation { updateGuildProfile(slug: "alpha", input: { announcement: "串权" }) { ok errorCode } }`, { user: adminB });
  eq('他百业管理员在甲百业 -> adminOnly(不串权)', m.data?.updateGuildProfile?.errorCode, 'adminOnly');

  // Grant targeting rules.
  m = await gql(`mutation { setOfficerGrant(slug: "alpha", memberDiscordId: "ZZ", capabilities: ["events"]) { ok errorCode } }`);
  eq('授权给非名册成员 -> officerTargetNotFound', m.data?.setOfficerGrant?.errorCode, 'officerTargetNotFound');
  m = await gql(`mutation { setOfficerGrant(slug: "alpha", memberDiscordId: "M2", capabilities: ["officer", "announce"]) { ok errorCode } }`);
  eq('管理员授权 M2 officer+announce 成功', m.data?.setOfficerGrant?.ok, true);

  // Officer notes positive/negative via the officer capability.
  m = await gql(`mutation { addGuildMemberNote(slug: "alpha", memberDiscordId: "M3", body: "内部备注机密甲") { ok errorCode } }`, { user: member2 });
  eq('M2(officer): 加备注成功', m.data?.addGuildMemberNote?.ok, true);
  m = await gql(`mutation { addGuildMemberNote(slug: "alpha", memberDiscordId: "M3", body: "越权备注") { ok errorCode } }`, { user: member1 });
  eq('M1(无 officer): 加备注 -> capabilityRequired', m.data?.addGuildMemberNote?.errorCode, 'capabilityRequired');
  m = await gql(`mutation { addGuildMemberNote(slug: "alpha", memberDiscordId: "M3", body: "成员备注") { ok errorCode } }`, { user: member3 });
  eq('普通成员加备注 -> adminOnly(回归口径)', m.data?.addGuildMemberNote?.errorCode, 'adminOnly');

  // Announcement positive via announce capability.
  m = await gql(`mutation { postGuildAnnouncement(slug: "alpha", kind: STANDARD, title: "军官公告", body: "军官发布正文") { ok errorCode } }`, { user: member2 });
  eq('M2(announce): 发公告成功', m.data?.postGuildAnnouncement?.ok, true);
  m = await gql(`mutation { postGuildAnnouncement(slug: "alpha", kind: STANDARD, title: "越权公告", body: "x") { ok errorCode } }`, { user: member1 });
  eq('M1(无 announce): 发公告 -> capabilityRequired', m.data?.postGuildAnnouncement?.errorCode, 'capabilityRequired');

  // Revoke restores the Locked shell.
  m = await gql(`mutation { revokeOfficerGrant(slug: "alpha", memberDiscordId: "M1") { ok errorCode } }`);
  eq('管理员撤销 M1 授权成功', m.data?.revokeOfficerGrant?.ok, true);
  r = await gql(GOV_Q, { user: member1, variables: { slug: 'alpha' } });
  eq('撤销后 M1 回到 GuildAdminLocked', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
}

/* ---- D. Board (officer private area) ---- */
{
  let m = await gql(`mutation { postOfficerBoardMessage(slug: "alpha", body: "本周排班注记") { ok errorCode } }`, { user: member2 });
  eq('军官 M2 发私密留言成功', m.data?.postOfficerBoardMessage?.ok, true);
  m = await gql(`mutation { postOfficerBoardMessage(slug: "alpha", body: "成员留言") { ok errorCode } }`, { user: member3 });
  eq('普通成员发私密留言 -> capabilityRequired', m.data?.postOfficerBoardMessage?.errorCode, 'capabilityRequired');

  let r = await gql(GOV_Q, { variables: { slug: 'alpha' } });
  const posts = r.data?.viewer?.guildAdmin?.governance?.boardPosts || [];
  eq('管理员读私密区见留言', posts.map((p) => p.body), ['本周排班注记']);
  const postId = posts[0]?.id;

  m = await gql(`mutation { deleteOfficerBoardPost(slug: "alpha", postId: "${postId}") { ok errorCode } }`, { user: member1 });
  eq('非作者非管理员删留言 -> capabilityRequired', m.data?.deleteOfficerBoardPost?.errorCode, 'capabilityRequired');
  m = await gql(`mutation { deleteOfficerBoardPost(slug: "alpha", postId: "${postId}") { ok errorCode } }`, { user: member2 });
  eq('作者删自己留言成功', m.data?.deleteOfficerBoardPost?.ok, true);

  // Board content must never leak into member-variant responses.
  await gql(`mutation { postOfficerBoardMessage(slug: "alpha", body: "绝密排班乙") { ok } }`);
  r = await gql(`query { viewer { guildAdmin(slug: "alpha") { __typename } } }`, { user: member3 });
  check('成员响应全文不含私密区内容', !JSON.stringify(r).includes('绝密排班乙'));
  r = await gql(GOV_Q, { user: member3, variables: { slug: 'alpha' } });
  eq('成员治理查询仍 Locked', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
}

/* ---- E. Audit read-back: coverage, order, paging, no bodies ---- */
{
  // One more scripted admin action so profile.update is in the log.
  await gql(`mutation { updateGuildProfile(slug: "alpha", input: { slogan: "审计标语" }) { ok } }`);
  const AUDIT_Q = `query($limit: Int, $offset: Int) {
    viewer { guildAdmin(slug: "alpha") {
      ... on GuildAdmin { governance {
        ... on GuildGovernancePage {
          auditEvents(limit: $limit, offset: $offset) { action actionLabel actorName targetType targetId targetLabel }
          auditTotalCount
        } } }
    } } }`;
  const r = await gql(AUDIT_Q, { variables: { limit: 50, offset: 0 } });
  const events = r.data?.viewer?.guildAdmin?.governance?.auditEvents || [];
  const actions = events.map((e) => e.action);
  for (const want of ['profile.update', 'event.create', 'officer.grant', 'officer.revoke', 'note.add', 'announcement.post', 'board.post', 'board.delete']) {
    check(`审计覆盖: ${want} 已留痕`, actions.includes(want));
  }
  eq('审计总数与列表一致', r.data?.viewer?.guildAdmin?.governance?.auditTotalCount, events.length);
  check('审计倒序(最新在前)', events.length >= 2 && events[0].action === 'profile.update', JSON.stringify(actions.slice(0, 3)));
  const noteEvent = events.find((e) => e.action === 'note.add');
  eq('备注审计目标 = 成员显示名', noteEvent?.targetLabel, '成员三');
  check('审计全文不含备注正文', !JSON.stringify(events).includes('内部备注机密甲'));
  check('审计 actionLabel 已下发', events.every((e) => typeof e.actionLabel === 'string' && e.actionLabel.length > 0));
  check('审计 actorName 已下发', events.every((e) => typeof e.actorName === 'string' && e.actorName.length > 0));
  const grantEvent = events.find((e) => e.action === 'officer.grant' && e.targetId === 'M1');
  eq('授权审计目标 = 被授成员', grantEvent?.targetLabel, '成员一');

  const page1 = await gql(AUDIT_Q, { variables: { limit: 2, offset: 0 } });
  const page2 = await gql(AUDIT_Q, { variables: { limit: 2, offset: 2 } });
  const p1 = page1.data?.viewer?.guildAdmin?.governance?.auditEvents || [];
  const p2 = page2.data?.viewer?.guildAdmin?.governance?.auditEvents || [];
  eq('审计分页第一页 2 条', p1.length, 2);
  check('审计分页第二页不与第一页重叠',
    p2.length >= 1 && p1.every((a) => p2.every((b) => JSON.stringify(a) !== JSON.stringify(b))));
}

/* ---- F. Grouping manage verdict: events officer joins ---- */
{
  const fakeReq = new Request('http://local/graphql');
  const grouping = { creator_discord_id: 'M2', tenant: 'alpha' };
  let v = await getGroupingManageVerdict(db, member1, fakeReq, null, grouping);
  eq('分组判定: events 军官可管他人车', v.canManage, false); // M1 was revoked above
  await gql(`mutation { setOfficerGrant(slug: "alpha", memberDiscordId: "M1", capabilities: ["events"]) { ok } }`);
  v = await getGroupingManageVerdict(db, member1, fakeReq, null, grouping);
  check('分组判定: 重新授权后 events 军官可管他人车', v.canManage === true && v.isOfficer === true, JSON.stringify(v));
  v = await getGroupingManageVerdict(db, member3, fakeReq, null, grouping);
  eq('分组判定: 普通成员仍不可管', v.canManage, false);
  v = await getGroupingManageVerdict(db, member2, fakeReq, null, grouping);
  eq('分组判定: 车头本人可管(回归)', v.canManage, true);
  const other = { creator_discord_id: 'B1', tenant: 'beta' };
  v = await getGroupingManageVerdict(db, member1, fakeReq, null, other);
  eq('分组判定: 甲军官不管乙百业的车(不串权)', v.canManage, false);
  v = await getGroupingManageVerdict(db, adminA, fakeReq, null, grouping);
  eq('分组判定: 百业管理员可管(回归)', v.canManage, true);
}

console.log(`\nGOVERNANCE pass=${pass} fail=${fail}`);
if (fails.length) { console.log('FAILS:\n' + fails.map((f) => '  - ' + f).join('\n')); process.exit(1); }
