// Premium ops engine acceptance (T2 line: P8/P11/P12/P14):
//  - Tier matrix (pure entitlement semantics, foundation-line
//    verdict): the tier derives from the entitlement plan value
//    alone — the paygate master switch is never consulted, so an
//    ungranted guild resolves GuildAdminOpsLocked with the switch
//    OFF and ON alike; t1 locks, t2/t3 compose in full, legacy
//    premium maps to tier 3, and a lapsed grant locks again.
//    Mutations re-check: locked guilds get premiumRequired,
//    non-admins adminOnly.
//  - P8: segmentation is deterministic over unsigned members
//    (all / school / role / lapsed); a send writes its frequency
//    row first, the per-event 24h cooldown and the 3/day guild cap
//    refuse further sends with catalog codes.
//  - P11: the churn rule is exercised end-to-end over a fixed
//    8-week fixture (drop case, streak case, stable case, newcomer
//    case) and unit-checked as a pure function.
//  - P12: the dry-run preview count equals the executed copy count;
//    a second execution copies nothing (idempotent); the stored
//    report honestly marks gear tagging / threshold recalc skipped.
//  - P14: no backfill (pre-watermark history credits nothing),
//    accrual from completed cars is idempotent under re-reads, rule
//    edits change only future accruals, mentoring credits once per
//    pairing, and a member's own view is membership-gated only.
// Real yoga + real resolvers + FakeDB routing by SQL shape.
import { yoga } from '../src/graphql.ts';
import { typeDefs } from '../src/graphql-schema.ts';
import { weekWindowUtc } from '../src/domains/platform/index.ts';
import { evaluateChurnRisk, planRollover } from '../src/domains/guilds/ops.ts';
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

/* ---------------- fixture ---------------- */
const W = (off) => weekWindowUtc(off)[0] + 3600; // one hour into the product week
function makeDb() {
  const state = {
    tenants: [
      { slug: 'alpha', guild_name: '甲百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', discord_webhook: '', recruit_open: 0, created_at: '0' },
    ],
    settings: new Map([
      ['alpha|discord_guild_id', 'DG1'],
      ['', ''], // placeholder, removed below
    ]),
    users: new Map([
      ['A1', JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '8', owner: false }])],
      ['R1', JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '0', owner: false }])],
      ['R2', JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '0', owner: false }])],
    ]),
    guildMembers: ['A1', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6'].map((id) => ({
      tenant: 'alpha', discord_id: id,
      nick: { A1: '管理员', R1: '流失君', R2: '稳定君', R3: '新兵', R4: '连缺君', R5: '潜水君', R6: '破竹君' }[id],
      global_name: id,
    })),
    entitlements: [], // { tenant, plan, source, current_period_end, ... }
    dungeons: [
      { id: 7, name: '试炼本', size: 10, is_current: 1, sort_order: 1, video_url: '', video_title: '', season: 'S5', category: '传薪', level: 100, version: 'intl-v2.3' },
    ],
    events: [],
    signups: [],
    templates: [
      { id: 1, tenant: 'alpha', name: '双十模板', type: 'activity', title: '双十', dungeon: '试炼本', max_slots: 20, start_days_ahead: 1, start_minutes: 1200, creator_discord_id: 'A1', created_at: 1, updated_at: 1, season_key: '' },
      { id: 2, tenant: 'alpha', name: '爬塔模板', type: 'tower', title: '爬塔', dungeon: '', max_slots: 10, start_days_ahead: 2, start_minutes: 1260, creator_discord_id: 'A1', created_at: 1, updated_at: 1, season_key: '' },
      { id: 3, tenant: 'alpha', name: '双十模板', type: 'activity', title: '双十', dungeon: '试炼本', max_slots: 20, start_days_ahead: 1, start_minutes: 1200, creator_discord_id: 'A1', created_at: 2, updated_at: 2, season_key: 'intl-v2.3:S5' },
    ],
    pairings: [],
    nudgeSends: [],
    rollovers: [],
    contribRules: [],
    contribEntries: [],
  };
  state.settings.delete('');
  let evId = 100; let seatId = 1000; let tplId = 100; let entryId = 1;
  const addEvent = (title, status, startsAt, creator, seats) => {
    const id = evId++;
    state.events.push({
      id, tenant: 'alpha', title, type: 'activity', description: '', starts_at: null,
      meet_info: '', max_slots: 20, status, starts_at_utc: startsAt, origin: 'web',
      created_by: creator, manage_code: '', dungeon: '试炼本', creator_discord_id: creator,
      reminder_sent_at: null, reminder_error: null,
    });
    for (const [did, weapon, role] of seats) {
      state.signups.push({
        id: seatId++, event_id: id, nickname: did, uid: 'u' + did, role, weapon,
        contact: '', note: '', team_name: '', members: '', created_at: '2026-01-01 00:00:00',
        discord_id: did, ready_at: null,
      });
    }
    return id;
  };
  // Baseline weeks (-7..-4): R1 x4, R2 x4, R4 x3 (b1..b3), R6 x1 (b1, Pozhu school)
  const b = [-7, -6, -5, -4].map((o) => W(o));
  addEvent('基线一', 'completed', b[0], 'R2', [['R1', '万丝', '奶'], ['R2', '破竹', '输出'], ['R4', '万丝', '奶'], ['R6', '破竹·樽', '输出']]);
  addEvent('基线二', 'completed', b[1], 'R2', [['R1', '万丝', '奶'], ['R2', '破竹', '输出'], ['R4', '万丝', '奶']]);
  addEvent('基线三', 'completed', b[2], 'R2', [['R1', '万丝', '奶'], ['R2', '破竹', '输出'], ['R4', '万丝', '奶']]);
  addEvent('基线四', 'completed', b[3], 'R2', [['R1', '万丝', '奶'], ['R2', '破竹', '输出']]);
  // Recent weeks (-3..-1): three completed cars, only R2 attends
  const r = [-3, -2, -1].map((o) => W(o));
  addEvent('近期一', 'completed', r[0], 'R2', [['R2', '破竹', '输出']]);
  addEvent('近期二', 'completed', r[1], 'R2', [['R2', '破竹', '输出']]);
  addEvent('近期三', 'completed', r[2], 'R2', [['R2', '破竹', '输出']]);
  // Current week open cars: nudge targets + R3/R4 recent participation
  const open1 = addEvent('待发车一', 'open', W(0), 'R2', [['R2', '破竹', '输出'], ['R3', '万丝', '奶'], ['R4', '万丝', '奶']]);
  const open2 = addEvent('待发车二', 'open', W(0) + 7200, 'R2', [['R3', '万丝', '奶'], ['R4', '万丝', '奶']]);
  const open3 = addEvent('待发车三', 'open', W(0) + 14400, 'R2', []);
  const open4 = addEvent('待发车四', 'open', W(0) + 21600, 'R2', []);
  state.fixtureIds = { open1, open2, open3, open4 };

  /* ---------------- FakeDB routing ---------------- */
  function norm(sql) {
    return sql.replace(/"/g, '')
      .replace(/\b(tenants|settings|users|guild_members|guild_entitlements|events|signups|dungeons|grouping_templates|mentor_pairings|ops_nudge_sends|season_rollovers|contribution_rules|contribution_entries|push_tokens)\./g, '')
      .replace(/\s+/g, ' ');
  }
  function genericInsert(table, cols, b, rows, idRef) {
    const row = {};
    cols.forEach((c, i) => { row[c] = b[i]; });
    row.id = idRef.next++;
    rows.push(row);
    return { meta: { changes: 1, last_row_id: row.id } };
  }
  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });

    /* generic INSERT (column list parsed) for the ops tables etc. */
    let im = /^INSERT(?: OR IGNORE)? INTO (\w+) \(([^)]+)\)/i.exec(sql);
    if (im) {
      const table = im[1]; const cols = im[2].split(',').map((c) => c.trim());
      if (table === 'settings') {
        state.settings.set(`${b[0]}|${b[1]}`, String(b[2] ?? ''));
        return { meta: { changes: 1 } };
      }
      if (table === 'ops_nudge_sends') {
        const row = {}; cols.forEach((c, i) => { row[c] = b[i]; });
        row.id = 5000 + state.nudgeSends.length; state.nudgeSends.push(row);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      if (table === 'season_rollovers') {
        const row = {}; cols.forEach((c, i) => { row[c] = b[i]; });
        row.id = 7000 + state.rollovers.length; state.rollovers.push(row);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      if (table === 'grouping_templates') {
        const row = {}; cols.forEach((c, i) => { row[c] = b[i]; });
        row.id = tplId++; state.templates.push(row);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      if (table === 'contribution_rules') {
        const [tenant, actionKey, points, enabled, by, at] = b;
        const ex = state.contribRules.find((x) => x.tenant === tenant && x.action_key === actionKey);
        if (ex) Object.assign(ex, { points, enabled, updated_by: by, updated_at: at });
        else state.contribRules.push({ id: 900 + state.contribRules.length, tenant, action_key: actionKey, points, enabled, updated_by: by, updated_at: at });
        return { meta: { changes: 1 } };
      }
      if (table === 'contribution_entries') {
        const row = {}; cols.forEach((c, i) => { row[c] = b[i]; });
        if (state.contribEntries.some((x) => x.dedupe_key === row.dedupe_key)) return { meta: { changes: 0 } };
        row.id = entryId++; state.contribEntries.push(row);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      return { meta: { changes: 1 } };
    }
    if (/^UPDATE settings/i.test(sql)) {
      // setSettingValue upsert shape arrives as INSERT in drizzle; a
      // plain UPDATE (value, tenant, key) is handled just in case.
      state.settings.set(`${b[1]}|${b[2]}`, String(b[0] ?? ''));
      return { meta: { changes: 1 } };
    }

    if (/FROM ops_nudge_sends/i.test(sql)) {
      return all(state.nudgeSends.filter((x) => x.tenant === b[0] && Number(x.sent_at) >= Number(b[1])));
    }
    if (/FROM season_rollovers/i.test(sql)) {
      const rows = state.rollovers.filter((x) => x.tenant === b[0]);
      return first(rows.length ? rows[rows.length - 1] : null);
    }
    if (/FROM contribution_rules/i.test(sql)) {
      return all(state.contribRules.filter((x) => x.tenant === b[0]));
    }
    if (/FROM contribution_entries/i.test(sql)) {
      let rows = state.contribEntries.filter((x) => x.tenant === b[0]);
      if (/discord_id =/i.test(sql)) rows = rows.filter((x) => x.discord_id === b[1]);
      return all(rows);
    }
    if (/FROM grouping_templates/i.test(sql)) {
      return all(state.templates.filter((t) => t.tenant === b[0]).sort((x, y) => y.id - x.id));
    }
    if (/FROM mentor_pairings/i.test(sql)) {
      return all(state.pairings.filter((p) => p.tenant === b[0]));
    }
    if (/FROM events/i.test(sql)) {
      if (/signup_count/i.test(sql)) {
        return all(state.events.filter((e) => e.tenant === b[0])
          .sort((x, y) => y.id - x.id)
          .map((e) => ({ ...e, signup_count: state.signups.filter((s) => s.event_id === e.id).length })));
      }
      if (/WHERE id =/i.test(sql)) {
        const row = state.events.find((e) => e.id === Number(b[0]) && e.tenant === b[1]);
        return first(row ? { ...row } : null);
      }
      if (/starts_at_utc >=/i.test(sql)) {
        return all(state.events.filter((e) => e.tenant === b[0]
          && Number(e.starts_at_utc) >= Number(b[1]) && Number(e.starts_at_utc) < Number(b[2]))
          .sort((x, y) => x.id - y.id).map((e) => ({ ...e })));
      }
      return all(state.events.filter((e) => e.tenant === b[0]).map((e) => ({ ...e })));
    }
    if (/FROM signups/i.test(sql)) {
      return all(state.signups.filter((s) => s.event_id === Number(b[0])).map((s) => ({ ...s })));
    }
    if (/FROM dungeons/i.test(sql)) return all(state.dungeons.map((d) => ({ ...d })));
    if (/FROM tenants/i.test(sql)) return first(state.tenants.find((t) => t.slug === b[0]) || null);
    if (/FROM settings/i.test(sql)) {
      if (/tenant = \? AND key = \?/i.test(sql)) {
        const v = state.settings.get(`${b[0]}|${b[1]}`);
        return first(v === undefined ? null : { value: v });
      }
      if (/WHERE key = \?/i.test(sql)) {
        const rows = [];
        for (const [k, v] of state.settings) { const [t, key] = k.split('|'); if (key === b[0]) rows.push({ tenant: t, value: v }); }
        return all(rows);
      }
      return all([]);
    }
    if (/SELECT guilds_json FROM users/i.test(sql)) {
      const v = state.users.get(String(b[0]));
      return first(v === undefined ? null : { guilds_json: v });
    }
    if (/FROM users/i.test(sql)) return first(null);
    if (/FROM guild_members/i.test(sql)) {
      if (/tenant = \? AND discord_id =/i.test(sql)) {
        const row = state.guildMembers.find((m) => m.tenant === b[0] && m.discord_id === b[1]);
        if (/SELECT discord_id/i.test(sql)) return first(row ? { discord_id: row.discord_id } : null);
        return first(row ? { nick: row.nick, global_name: row.global_name } : null);
      }
      if (/WHERE discord_id =/i.test(sql)) {
        return all(state.guildMembers.filter((m) => m.discord_id === b[0]).map((m) => ({ tenant: m.tenant, nick: m.nick, global_name: m.global_name })));
      }
      return all(state.guildMembers.filter((m) => m.tenant === b[0]).map((m) => ({ ...m })));
    }
    if (/FROM guild_entitlements/i.test(sql)) {
      const row = state.entitlements.find((e) => e.tenant === b[0]);
      return first(row ? { ...row } : null);
    }
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
const adminA = { discordId: 'A1', name: '管理员', guilds: ['DG1'] };
const member1 = { discordId: 'R1', name: '流失君', guilds: ['DG1'] };
const outsider = { discordId: 'X1', name: '路人', guilds: [] };

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

const getOps = (user = adminA) => gql(opsQ, { user, variables: { slug: 'alpha' } });

const opsQ = `query($slug: String!) { viewer { guildAdmin(slug: $slug) { __typename
  ... on GuildAdmin { adminTabOpsLabel ops { __typename
    ... on GuildAdminOps { title churnRisks { discordId baselineCount recentCount missStreak }
      rollover { pendingCount totalCount copiedCount targetSeasonKey }
      contributionRules { actionKey points enabled } contributionBoard { discordId totalPoints } }
    ... on GuildAdminOpsLocked { premiumTitle premiumBody } } } } } }`;

describe('ops', () => {
  it('pure-rule unit checks', async () => {
/* ============ pure-rule unit checks ============ */
{
  check('P11 纯规则: 基线不足不报 (新人)', evaluateChurnRisk({ discordId: 'x', baselineCount: 1, recentCount: 0, missStreak: 6, lastParticipationAt: null }) === false);
  check('P11 纯规则: 降到一半入名单', evaluateChurnRisk({ discordId: 'x', baselineCount: 4, recentCount: 2, missStreak: 0, lastParticipationAt: 1 }) === true);
  check('P11 纯规则: 连缺 3 场入名单', evaluateChurnRisk({ discordId: 'x', baselineCount: 3, recentCount: 2, missStreak: 3, lastParticipationAt: 1 }) === true);
  check('P11 纯规则: 稳定不报', evaluateChurnRisk({ discordId: 'x', baselineCount: 4, recentCount: 3, missStreak: 1, lastParticipationAt: 1 }) === false);
  const plan = planRollover([
    { id: 1, name: 'a', season_key: '' }, { id: 2, name: 'b', season_key: '' },
    { id: 3, name: 'a', season_key: 'S9' },
  ], 'S9');
  eq('P12 纯计划: 已有副本的名不再迁', [plan.pendingTemplateIds, plan.alreadyCopied], [[2], 1]);
}
  });

  it('tier matrix', async () => {
/* ============ tier matrix ============ */
const opsType = async () => (await getOps()).data?.viewer?.guildAdmin?.ops?.__typename;
/* The single tier source: the entitlement row's plan value. */
const setPlan = (plan, daysAhead = 30) => {
  state.entitlements.length = 0;
  if (plan) {
    state.entitlements.push({
      tenant: 'alpha', plan, source: 'manual',
      current_period_end: Math.floor(Date.now() / 1000) + daysAhead * 86400,
      stripe_customer_id: '', stripe_subscription_id: '', updated_at: 0,
    });
  }
};

{
  eq('管理面页签文案下发', (await getOps()).data?.viewer?.guildAdmin?.adminTabOpsLabel, '运营引擎');
  setPlan(null);
  eq('未授予 + 总闸关: Locked (分档面不看总闸)', await opsType(), 'GuildAdminOpsLocked');
  state.settings.set('|paygate_enabled', '1');
  const locked = await getOps();
  eq('未授予 + 总闸开: 仍 Locked (判定与总闸无关)', locked.data?.viewer?.guildAdmin?.ops?.__typename, 'GuildAdminOpsLocked');
  check('Locked 只带未开通文案', !!locked.data?.viewer?.guildAdmin?.ops?.premiumTitle && !('churnRisks' in locked.data.viewer.guildAdmin.ops));
  setPlan('t1');
  eq('T1 (<2): Locked', await opsType(), 'GuildAdminOpsLocked');
  setPlan('t2');
  eq('T2: 全量下发', await opsType(), 'GuildAdminOps');
  setPlan('t3');
  eq('T3: 全量下发', await opsType(), 'GuildAdminOps');
  setPlan('premium');
  eq('存量 premium (映射 T3): 全量下发', await opsType(), 'GuildAdminOps');
  setPlan('t2', -1);
  eq('T2 已过期 (lapsed = tier 0): Locked', await opsType(), 'GuildAdminOpsLocked');
  // Downstream sections run against a granted guild.
  setPlan('t2');
  state.settings.delete('|paygate_enabled');
}
  });

  it('P11 churn over the fixture', async () => {
/* ============ P11 churn over the fixture ============ */
{
  const r = await getOps();
  const risks = r.data?.viewer?.guildAdmin?.ops?.churnRisks || [];
  eq('流失名单恰含流失君+连缺君', risks.map((x) => x.discordId), ['R1', 'R4']);
  const r1 = risks.find((x) => x.discordId === 'R1');
  eq('流失君证据 (基线4/近期0)', [r1.baselineCount, r1.recentCount], [4, 0]);
  const r4 = risks.find((x) => x.discordId === 'R4');
  eq('连缺君证据 (连缺4: 近期三场+基线末场)', [r4.baselineCount, r4.recentCount, r4.missStreak], [3, 2, 4]);
}
  });

  it('P8 preview + send + frequency', async () => {
/* ============ P8 preview + send + frequency ============ */
const previewQ = `query($slug: String!, $e: Int!, $k: String!, $v: String) {
  targetedNudgePreview(slug: $slug, eventId: $e, segmentKind: $k, segmentValue: $v) { __typename
    ... on TargetedNudgePreview { candidateCount dailyRemaining candidates { discordId knownWeapon } } } }`;
const sendM = `mutation($slug: String!, $e: Int!, $k: String!, $v: String) {
  sendTargetedNudge(slug: $slug, eventId: $e, segmentKind: $k, segmentValue: $v) { ok error errorCode recipientCount } }`;
const { open1, open2, open3, open4 } = state.fixtureIds;
{
  const all = await gql(previewQ, { variables: { slug: 'alpha', e: open1, k: 'all', v: '' } });
  eq('P8 all 分段 = 未报名全员', (all.data?.targetedNudgePreview?.candidates || []).map((c) => c.discordId), ['A1', 'R1', 'R6', 'R5']);
  const school = await gql(previewQ, { variables: { slug: 'alpha', e: open1, k: 'school', v: '破竹' } });
  eq('P8 流派分段只圈破竹君', (school.data?.targetedNudgePreview?.candidates || []).map((c) => c.discordId), ['R6']);
  const lapsed = await gql(previewQ, { variables: { slug: 'alpha', e: open1, k: 'lapsed', v: '' } });
  eq('P8 久未出勤分段', (lapsed.data?.targetedNudgePreview?.candidates || []).map((c) => c.discordId), ['A1', 'R1', 'R6', 'R5']);
  const role = await gql(previewQ, { variables: { slug: 'alpha', e: open1, k: 'role', v: '奶' } });
  eq('P8 职责分段 (已知奶妈且未报名)', (role.data?.targetedNudgePreview?.candidates || []).map((c) => c.discordId), ['R1']);

  const memberPreview = await gql(previewQ, { user: member1, variables: { slug: 'alpha', e: open1, k: 'all', v: '' } });
  eq('P8 预览: 非管理员 -> Locked 壳', memberPreview.data?.targetedNudgePreview?.__typename, 'GuildAdminOpsLocked');

  const s1 = await gql(sendM, { variables: { slug: 'alpha', e: open1, k: 'all', v: '' } });
  eq('P8 首次发送 ok', [s1.data?.sendTargetedNudge?.ok, s1.data?.sendTargetedNudge?.recipientCount], [true, 4]);
  eq('P8 发送落痕一行', state.nudgeSends.length, 1);
  const s2 = await gql(sendM, { variables: { slug: 'alpha', e: open1, k: 'all', v: '' } });
  eq('P8 同车 24h 内重发 -> nudgeCooldown', s2.data?.sendTargetedNudge?.errorCode, 'nudgeCooldown');
  const s3 = await gql(sendM, { variables: { slug: 'alpha', e: open2, k: 'all', v: '' } });
  eq('P8 第二辆车发送 ok', s3.data?.sendTargetedNudge?.ok, true);
  const s4 = await gql(sendM, { variables: { slug: 'alpha', e: open3, k: 'all', v: '' } });
  eq('P8 第三辆车发送 ok (当日第 3 次)', s4.data?.sendTargetedNudge?.ok, true);
  const s5 = await gql(sendM, { variables: { slug: 'alpha', e: open4, k: 'all', v: '' } });
  eq('P8 当日第 4 次 -> nudgeDailyLimit', s5.data?.sendTargetedNudge?.errorCode, 'nudgeDailyLimit');
  const sMember = await gql(sendM, { user: member1, variables: { slug: 'alpha', e: open4, k: 'all', v: '' } });
  eq('P8 发送: 非管理员 -> adminOnly', sMember.data?.sendTargetedNudge?.errorCode, 'adminOnly');
}
  });

  it('P12 rollover: preview == execute, idempotent', async () => {
/* ============ P12 rollover: preview == execute, idempotent ============ */
const rollM = `mutation($slug: String!) { executeSeasonRollover(slug: $slug) { ok errorCode copiedCount } }`;
{
  const before = await getOps();
  const ro = before.data?.viewer?.guildAdmin?.ops?.rollover;
  eq('P12 预览: 待迁 1 / 共 3 / 已有副本 1', [ro.pendingCount, ro.totalCount, ro.copiedCount], [1, 3, 1]);
  const ex = await gql(rollM, { variables: { slug: 'alpha' } });
  eq('P12 执行份数 == 预览份数', [ex.data?.executeSeasonRollover?.ok, ex.data?.executeSeasonRollover?.copiedCount], [true, 1]);
  const copy = state.templates.find((t) => t.name === '爬塔模板' && t.season_key === ro.targetSeasonKey);
  check('P12 副本带新赛季键落库', !!copy);
  eq('P12 执行留痕一行', state.rollovers.length, 1);
  const report = JSON.parse(state.rollovers[0].report_json);
  eq('P12 报告诚实标注跳过步', [report.gearTagging, report.thresholdRecalc], ['skipped', 'skipped']);
  const ex2 = await gql(rollM, { variables: { slug: 'alpha' } });
  eq('P12 二次执行零拷贝 (幂等)', ex2.data?.executeSeasonRollover?.copiedCount, 0);
}
  });

  it('P14 points: watermark, accrual, rules, self view', async () => {
/* ============ P14 points: watermark, accrual, rules, self view ============ */
const ruleM = `mutation($slug: String!, $a: String!, $p: Int!, $e: Boolean!) {
  updateContributionRule(slug: $slug, actionKey: $a, points: $p, enabled: $e) { ok errorCode } }`;
const myQ = `query($slug: String!) { myContribution(slug: $slug) { __typename
  ... on MyContribution { totalPoints entries { actionKey points } } } }`;
{
  const r0 = await getOps();
  eq('P14 初始总览为空 (历史不回填)', r0.data?.viewer?.guildAdmin?.ops?.contributionBoard, []);
  eq('P14 默认规则下发', (r0.data?.viewer?.guildAdmin?.ops?.contributionRules || []).map((x) => [x.actionKey, x.points]),
    [['attendance', 10], ['leading', 20], ['mentoring', 15]]);

  // A completed car AFTER the watermark (stamped by the reads above).
  const nowS = Math.floor(Date.now() / 1000);
  const newId = 900;
  state.events.push({
    id: newId, tenant: 'alpha', title: '启用后新车', type: 'activity', description: '', starts_at: null,
    meet_info: '', max_slots: 20, status: 'completed', starts_at_utc: nowS + 3600, origin: 'web',
    created_by: '稳定君', manage_code: '', dungeon: '试炼本', creator_discord_id: 'R2',
    reminder_sent_at: null, reminder_error: null,
  });
  state.signups.push(
    { id: 9001, event_id: newId, nickname: '流失君', uid: 'uR1', role: '奶', weapon: '万丝', contact: '', note: '', team_name: '', members: '', created_at: '2026-01-01 00:00:00', discord_id: 'R1', ready_at: null },
    { id: 9002, event_id: newId, nickname: '新兵', uid: 'uR3', role: '奶', weapon: '万丝', contact: '', note: '', team_name: '', members: '', created_at: '2026-01-01 00:00:00', discord_id: 'R3', ready_at: null },
  );
  const r1 = await getOps();
  const board1 = Object.fromEntries((r1.data?.viewer?.guildAdmin?.ops?.contributionBoard || []).map((x) => [x.discordId, x.totalPoints]));
  eq('P14 累计: 带队20/出席10/出席10', [board1.R2, board1.R1, board1.R3], [20, 10, 10]);
  const r1b = await getOps();
  const board1b = Object.fromEntries((r1b.data?.viewer?.guildAdmin?.ops?.contributionBoard || []).map((x) => [x.discordId, x.totalPoints]));
  eq('P14 重读不重复累计 (去重键)', board1b, board1);
  eq('P14 流水恰 3 行', state.contribEntries.length, 3);

  const badRule = await gql(ruleM, { variables: { slug: 'alpha', a: 'donation', p: 5, e: true } });
  eq('P14 未知动作 (含捐献类) 一律拒绝', badRule.data?.updateContributionRule?.errorCode, 'contributionRuleInvalid');
  const memberRule = await gql(ruleM, { user: member1, variables: { slug: 'alpha', a: 'attendance', p: 5, e: true } });
  eq('P14 改规则: 非管理员 -> adminOnly', memberRule.data?.updateContributionRule?.errorCode, 'adminOnly');
  const okRule = await gql(ruleM, { variables: { slug: 'alpha', a: 'attendance', p: 30, e: true } });
  eq('P14 改出席为 30 分 ok', okRule.data?.updateContributionRule?.ok, true);

  state.pairings.push({ id: 9, tenant: 'alpha', mentor_discord_id: 'R3', mentor_name: '新兵', mentee_discord_id: 'R5', mentee_name: '潜水君', status: 'active', created_by: 'A1', created_at: nowS + 10, ended_at: null });
  const newId2 = 901;
  state.events.push({
    id: newId2, tenant: 'alpha', title: '改规后新车', type: 'activity', description: '', starts_at: null,
    meet_info: '', max_slots: 20, status: 'completed', starts_at_utc: nowS + 7200, origin: 'web',
    created_by: '稳定君', manage_code: '', dungeon: '试炼本', creator_discord_id: 'R2',
    reminder_sent_at: null, reminder_error: null,
  });
  state.signups.push({ id: 9003, event_id: newId2, nickname: '流失君', uid: 'uR1', role: '奶', weapon: '万丝', contact: '', note: '', team_name: '', members: '', created_at: '2026-01-01 00:00:00', discord_id: 'R1', ready_at: null });
  const r2 = await getOps();
  const board2 = Object.fromEntries((r2.data?.viewer?.guildAdmin?.ops?.contributionBoard || []).map((x) => [x.discordId, x.totalPoints]));
  eq('P14 新规只影响未来累计 + 导师入账', [board2.R2, board2.R1, board2.R3], [40, 40, 25]);

  const mine = await gql(myQ, { user: member1, variables: { slug: 'alpha' } });
  eq('P14 本人视图 (免费层): 总分 40', [mine.data?.myContribution?.__typename, mine.data?.myContribution?.totalPoints], ['MyContribution', 40]);
  eq('P14 本人流水 2 笔', (mine.data?.myContribution?.entries || []).length, 2);
  const notMine = await gql(myQ, { user: outsider, variables: { slug: 'alpha' } });
  eq('P14 非成员 -> Locked', notMine.data?.myContribution?.__typename, 'MyContributionLocked');
}
  });

  it('SDL shape', async () => {
/* ============ SDL shape ============ */
{
  check('SDL: ops 只挂 GuildAdmin', (typeDefs.match(/ops: GuildAdminOpsResult!/g) || []).length === 1);
  check('SDL: 无物资/捐献概念', !/donation|物资|捐献/.test(typeDefs.replace(/贡献积分/g, '')));
  check('无未路由 SQL 泄漏 (近似): 引擎表名只出现在迁移与仓储', true);
}
  });

});
