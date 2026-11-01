// Combat reports v1 acceptance (premium T2 line):
//   A. GOLD reconciliation: the layer-1 sample file (423 events)
//      imports through the real service and the stored snapshot
//      matches prototype-output.txt item by item — all 13 skill
//      rows (total + casts exact), player totals, team total,
//      buff coverage, activity, rDPS, and attribution
//      conservation |sum(rDamage) - sum(raw)| < 1.
//   B. three-state surface + zero footprint: below T2 with the
//      paygate OFF the detail field resolves null (the section
//      does not exist); paygate ON composes Locked with zero
//      encounter data; a T2 guild runs Empty -> import -> Ready
//      on both the detail surface and the standalone report
//      page query; the write verdict refuses below tier even
//      with the paygate OFF.
//   C. overlay sessions: a panel-series export normalizes into
//      the same pipeline (panel deltas become hits, boss debuff
//      clusters become system intervals, cast points ride
//      along), totals equal the panel's final values.
//   D. validation: an unsupported formatVersion and an invalid
//      event are rejected whole-file — zero rows, zero metering.
//   E. delete verdicts: uploader and guild admin may delete; an
//      unrelated member is refused.
//   F. identity mapping: a roster entry whose display name
//      matches an actor name binds that actor as a member for
//      this encounter; unmatched actors stay guests verbatim.
//   G. multiplier fallback: without a file-carried dictionary,
//      the platform dictionary resolves by buff id / name;
//      unknown buffs attribute at 1.0 and are flagged
//      multiplier-undetermined, never invented.
// Real yoga + real resolvers + FakeDB routing by SQL shape into
// in-memory tables (same pattern as tests/recap.test.ts).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { yoga } from '../src/graphql.ts';
import { typeDefs } from '../src/graphql-schema.ts';
import { importCombatReport } from '../src/domains/groupings/combat-report-service.ts';
import { tierLocked } from '../src/domains/platform/billing-service.ts';
import { normalizeRosterName } from '../src/domains/guilds/roster.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: unknown, want: unknown) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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

const GID = { alpha: 1030100001, beta: 1030100002, gamma: 1030100003 };
const UID = { A1: 2030100001, B1: 2030100002, BM: 2030100003, G1: 2030100004, A2: 2030100005 };
const GOLD = JSON.parse(readFileSync(new URL('./fixtures/combat-sample-events.json', import.meta.url), 'utf8'));

function makeDb() {
  const state: any = {
    tenants: [
      { id: GID.alpha, slug: 'alpha', guild_name: '甲百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', recruit_open: 0 },
      { id: GID.beta, slug: 'beta', guild_name: '乙百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', recruit_open: 0 },
      { id: GID.gamma, slug: 'gamma', guild_name: '丙百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', recruit_open: 0 },
    ],
    settings: new Map([
      [`${GID.alpha}|discord_guild_id`, 'DG1'],
      [`${GID.beta}|discord_guild_id`, 'DG2'],
      [`${GID.gamma}|discord_guild_id`, 'DG3'],
      ['0|paygate_enabled', '1'],
    ]),
    users: new Map([
      [String(UID.A1), JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '8', owner: false }])],
      [String(UID.B1), JSON.stringify([{ id: 'DG2', name: 'S2', permissions: '8', owner: false }])],
      [String(UID.BM), JSON.stringify([{ id: 'DG2', name: 'S2', permissions: '0', owner: false }])],
      [String(UID.G1), JSON.stringify([{ id: 'DG3', name: 'S3', permissions: '8', owner: false }])],
      [String(UID.A2), JSON.stringify([{ id: 'DG2', name: 'S2', permissions: '8', owner: false }])],
    ]),
    usernames: new Map([
      [String(UID.A1), '管理员甲'], [String(UID.B1), '乙车头'],
      [String(UID.BM), '乙成员'], [String(UID.G1), '丙管理员'],
      [String(UID.A2), '乙管理员'],
    ]),
    entitlements: new Map([
      [String(GID.alpha), { tenant: GID.alpha, plan: 't1', source: 'manual', current_period_end: null, stripe_customer_id: '', stripe_subscription_id: '', updated_at: 1 }],
      [String(GID.beta), { tenant: GID.beta, plan: 't3', source: 'manual', current_period_end: null, stripe_customer_id: '', stripe_subscription_id: '', updated_at: 1 }],
      [String(GID.gamma), { tenant: GID.gamma, plan: 'premium', source: 'manual', current_period_end: null, stripe_customer_id: '', stripe_subscription_id: '', updated_at: 1 }],
    ]),
    guildMembers: [
      { tenant: GID.beta, discord_id: 'B1', nick: '乙车头', global_name: 'LeaderB' },
      { tenant: GID.beta, discord_id: 'BM', nick: '乙成员', global_name: 'MemberB' },
    ],
    rosterEntries: [
      { id: 501, tenant: GID.beta, display_name: '主视角', name_norm: normalizeRosterName('主视角'), source: 'manual', matched_discord_id: '', created_by_user_id: UID.B1, created_at: 1 },
    ],
    events: [
      { id: 11, tenant: GID.alpha, title: '甲竞速车', type: 'race', description: '', starts_at: null, meet_info: '', max_slots: 10, status: 'completed', starts_at_utc: 1760000000, origin: 'member', created_by: '管理员甲', manage_code: '', dungeon: '试炼本', creator_user_id: UID.A1, reminder_sent_at: null, reminder_error: null, created_at: '2026-10-01 09:00:00' },
      { id: 12, tenant: GID.beta, title: '乙竞速车', type: 'race', description: '', starts_at: null, meet_info: '', max_slots: 10, status: 'completed', starts_at_utc: 1760000000, origin: 'member', created_by: '乙车头', manage_code: '', dungeon: '试炼本', creator_user_id: UID.B1, reminder_sent_at: null, reminder_error: null, created_at: '2026-10-01 09:00:00' },
      { id: 14, tenant: GID.beta, title: '乙成员的车', type: 'activity', description: '', starts_at: null, meet_info: '', max_slots: 10, status: 'completed', starts_at_utc: 1760100000, origin: 'member', created_by: '乙成员', manage_code: '', dungeon: '', creator_user_id: UID.BM, reminder_sent_at: null, reminder_error: null, created_at: '2026-10-03 09:00:00' },
      { id: 31, tenant: GID.gamma, title: '丙竞速车', type: 'race', description: '', starts_at: null, meet_info: '', max_slots: 10, status: 'completed', starts_at_utc: 1760000000, origin: 'member', created_by: '丙管理员', manage_code: '', dungeon: '试炼本', creator_user_id: UID.G1, reminder_sent_at: null, reminder_error: null, created_at: '2026-10-01 09:00:00' },
    ],
    signups: [
      { id: 1, event_id: 12, nickname: '乙车头', uid: 'u1', role: '输出', weapon: '破竹', contact: '', note: '', team_name: '', members: '', created_at: '2026-10-01 10:00:00', discord_id: 'B1', ready_at: 1759999800 },
      { id: 2, event_id: 12, nickname: '乙成员', uid: 'u2', role: '奶', weapon: '万丝', contact: '', note: '', team_name: '', members: '', created_at: '2026-10-01 10:01:00', discord_id: 'BM', ready_at: 1759999801 },
    ],
    encounters: [], // combat_encounters rows
    usage: new Map(),
    mint: new Map(),
  };

  function norm(sql: string) {
    return sql.replace(/"/g, '')
      .replace(/\b(tenants|settings|users|guild_members|events|signups|guild_entitlements|usage_counters|guild_roster_entries|combat_encounters)\./g, '')
      .replace(/\s+/g, ' ');
  }

  function route(kind: string, rawSql: string, b: any[]) {
    const sql = norm(rawSql);
    if (/^INSERT INTO id_mint_counters/i.test(sql)) {
      const key = `${b[0]}|${b[1]}`;
      const seq = (state.mint.get(key) || 0) + 1;
      state.mint.set(key, seq);
      return kind === 'first' ? { seq } : { results: [{ seq }] };
    }
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    if (/^INSERT INTO guild_members/i.test(sql)) return { meta: { changes: 1 } };
    const first = (row: any) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows: any[]) => ({ results: rows });

    if (/FROM tenants/i.test(sql)) {
      const row = state.tenants.find((t: any) => t.slug === b[0] || t.id === Number(b[0]));
      return first(row ? { ...row } : null);
    }
    if (/FROM settings/i.test(sql)) {
      const v = state.settings.get(`${b[0]}|${b[1]}`);
      if (kind === 'first') return v === undefined ? null : { value: v };
      return all(v === undefined ? [] : [{ tenant: b[0], key: b[1], value: v }]);
    }
    if (/SELECT guilds_json FROM users/i.test(sql)) {
      const v = state.users.get(String(b[0]));
      return first(v === undefined ? null : { guilds_json: v });
    }
    if (/FROM users/i.test(sql)) {
      const name = state.usernames.get(String(b[0]));
      return first(name === undefined ? null : { username: name });
    }
    if (/FROM guild_entitlements/i.test(sql)) {
      const row = state.entitlements.get(String(b[0]));
      return first(row ? { ...row } : null);
    }
    if (/FROM events/i.test(sql)) {
      const row = state.events.find((e: any) => e.id === Number(b[0]));
      return first(row ? { ...row } : null);
    }
    if (/FROM signups/i.test(sql)) {
      return all(state.signups.filter((r: any) => r.event_id === Number(b[0])).map((r: any) => ({ ...r })));
    }
    if (/FROM guild_members/i.test(sql)) {
      return all(state.guildMembers.filter((m: any) => m.tenant === b[0]).map((m: any) => ({ ...m })));
    }
    if (/FROM guild_roster_entries/i.test(sql)) {
      return all(state.rosterEntries.filter((r: any) => r.tenant === b[0]).map((r: any) => ({ ...r })));
    }
    if (/^INSERT INTO usage_counters/i.test(sql)) {
      const [scope, metric, day, by] = b;
      const key = `${scope}|${metric}|${day}`;
      state.usage.set(key, (state.usage.get(key) || 0) + Number(by));
      return { meta: { changes: 1 } };
    }
    if (/FROM usage_counters/i.test(sql)) {
      const key = `${b[0]}|${b[1]}|${b[2]}`;
      return all([{ count: state.usage.get(key) || 0 }]);
    }
    /* combat_encounters */
    if (/^INSERT INTO combat_encounters/i.test(sql)) {
      const [id, tenant, eventId, uploader, bossName, startedAtMs, durationMs, result, source,
        formatVersion, modelVersion, status, lastError, snapshotJson, actorMapJson, eventsJson, atSec] = b;
      const row = {
        id, tenant, event_id: Number(eventId), uploader_user_id: uploader,
        boss_name: bossName, started_at_ms: startedAtMs, duration_ms: durationMs,
        result, source, format_version: formatVersion, model_version: modelVersion,
        status, last_error: lastError, snapshot_json: snapshotJson,
        actor_map_json: actorMapJson, events_json: eventsJson, created_at: atSec,
      };
      state.encounters.push(row);
      return { meta: { changes: 1, last_row_id: id } };
    }
    if (/^DELETE FROM combat_encounters/i.test(sql)) {
      const before = state.encounters.length;
      state.encounters = state.encounters.filter((r: any) => r.id !== Number(b[0]));
      return { meta: { changes: before - state.encounters.length } };
    }
    if (/FROM combat_encounters/i.test(sql)) {
      if (/WHERE id =/i.test(sql)) {
        const row = state.encounters.find((r: any) => r.id === Number(b[0]));
        return first(row ? { ...row } : null);
      }
      if (/status = 'failed'/i.test(sql)) {
        const rows = state.encounters.filter((r: any) => r.event_id === Number(b[0]) && r.status === 'failed')
          .sort((x: any, y: any) => y.id - x.id);
        return first(rows[0] ? { ...rows[0] } : null);
      }
      if (/status = 'parsed'/i.test(sql)) {
        const rows = state.encounters.filter((r: any) => r.event_id === Number(b[0]) && r.status === 'parsed')
          .sort((x: any, y: any) => (x.started_at_ms - y.started_at_ms) || (x.id - y.id));
        return all(rows.map((r: any) => ({ ...r })));
      }
      const rows = state.encounters.filter((r: any) => r.tenant === Number(b[0]))
        .sort((x: any, y: any) => (y.created_at - x.created_at) || (y.id - x.id));
      return all(rows.map((r: any) => ({ ...r })));
    }
    if (kind === 'first') return null;
    return { results: [] };
  }

  const stmt = (sql: string) => ({
    _b: [] as any[],
    bind(...a: any[]) { this._b = a; return this; },
    async raw() { const res: any = await route('all', sql, this._b); return toRawRows(sql, (res && res.results) || []); },
    async first() { return route('first', sql, this._b); },
    async all() { return route('all', sql, this._b); },
    async run() { return route('run', sql, this._b); },
  });
  const db = {
    prepare: (sql: string) => stmt(sql),
    batch: async (stmts: any[]) => { for (const st of stmts) await st.run(); return []; },
  };
  return { db, state };
}

const adminA = { userId: UID.A1, discordId: 'A1', name: '管理员甲', guilds: ['DG1'] };
const leaderB = { userId: UID.B1, discordId: 'B1', name: '乙车头', guilds: ['DG2'] };
const memberB = { userId: UID.BM, discordId: 'BM', name: '乙成员', guilds: ['DG2'] };
const adminB = { userId: UID.A2, discordId: 'A2', name: '乙管理员', guilds: ['DG2'] };
const adminG = { userId: UID.G1, discordId: 'G1', name: '丙管理员', guilds: ['DG3'] };

function makeGql(db: any) {
  return async function gql(query: string, { user = leaderB, variables }: any = {}) {
    const ctx = {
      env: { DB: db }, request: new Request('http://local/graphql'), user,
      locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai',
      executionCtx: { waitUntil() {} },
    };
    const res = await yoga.fetch(new Request('http://local/graphql', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    }), ctx);
    return res.json();
  };
}

const detailQ = `query($slug: String, $id: ID!) { groupingDetailPage(slug: $slug, id: $id) { combatReport {
  __typename
  ... on GroupingCombatReportLocked { title body }
  ... on GroupingCombatReportEmpty { title body failedHint actions { importLabel } }
  ... on GroupingCombatReportReady { title failedHint
    encounters { id bossName result resultText uploaderText deleteAction { deleteLabel } }
    detail { bossName overviewLines partyRows { playerName memberName guestTag total rdpsText } buffRows { buffName multiplierText uptimePctText } }
    actions { importLabel } }
} } }`;
const pageQ = `query($slug: String, $gid: ID!, $eid: ID) { combatReportPage(slug: $slug, groupingId: $gid, encounterId: $eid) {
  __typename
  ... on GroupingCombatReportReady { encounters { id } detail { bossName partyRows { playerName total } } }
  ... on GroupingCombatReportLocked { title body }
  ... on GroupingCombatReportEmpty { title body }
} }`;
const adminQ = `query($slug: String!) { viewer { guildAdmin(slug: $slug) { __typename
  ... on GuildAdmin { adminTabCombatReportsLabel combatReports { __typename
    ... on GroupingCombatReportLocked { title body }
    ... on GuildAdminCombatReportList { title emptyText items { id groupingId groupingTitle bossName status statusText } }
  } } } } }`;
const delMut = `mutation($id: ID!) { deleteCombatEncounter(id: $id) { ok error errorCode combatReport { __typename } } }`;
const combatOf = (r: any) => r.data?.groupingDetailPage?.combatReport;
const dayKey = new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10);
const combatUsage = (state: any, gid: number) => state.usage.get(`${gid}|combat_report_imports|${dayKey}`) || 0;

/* Gold skill table from prototype-output.txt (total, casts). */
const GOLD_SKILLS: Record<string, Record<string, [number, number]>> = {
  '主视角': {
    '凌波·撼玉': [753346, 9], '无痕剑意': [121480, 12], '衍九矢': [95211, 14],
    '鼓乐和': [93544, 2], '箫吟千浪': [92622, 5], '飞絮轻击': [88204, 22],
    '破空指': [76930, 7], '回风拂柳': [64517, 9], '基础轻击': [58940, 28],
    '寒江钓雪': [49940, 4],
  },
  '队友·辅助': {
    '银针渡穴': [148200, 16], '清音梵唱': [132660, 8], '基础轻击': [131520, 24],
  },
};

describe('combat reports', () => {
  it('SDL shape', () => {
    check('SDL: GroupingDetailPage 带 combatReport 字段 (可空 = 零足迹)', /type GroupingDetailPage \{[\s\S]*?\n  combatReport: GroupingCombatReportResult\n/.test(typeDefs));
    check('SDL: deleteCombatEncounter mutation 存在', typeDefs.includes('deleteCombatEncounter(id: ID!): CombatReportPayload!'));
    check('SDL: combatReportPage 查询存在', typeDefs.includes('combatReportPage(slug: String, groupingId: ID!, encounterId: ID): GroupingCombatReportResult'));
    check('SDL: GuildAdmin 带 combatReports 字段 (可空 = 零足迹)', /type GuildAdmin \{[\s\S]*?\n  combatReports: GuildAdminCombatReportResult\n/.test(typeDefs));
    check('SDL: 战斗报告 union 含三变体', typeDefs.includes('union GroupingCombatReportResult = GroupingCombatReportReady | GroupingCombatReportLocked | GroupingCombatReportEmpty'));
  });

  it('A: gold reconciliation (sample-events.json, 423 events)', async () => {
    const { db, state } = makeDb();
    const ev = state.events.find((e: any) => e.id === 12);
    const res = await importCombatReport(db as any, ev, UID.B1, GOLD, JSON.stringify(GOLD));
    eq('A: 导入成功', res.ok, true);
    if (!res.ok) return;
    eq('A: 存储一行 parsed', [state.encounters.length, state.encounters[0].status], [1, 'parsed']);
    eq('A: 导入计量 = 1', combatUsage(state, GID.beta), 1);
    const snap = JSON.parse(res.row.snapshot_json);
    eq('A: 团队总伤', snap.teamTotal, 1907114);
    const byName = new Map(snap.players.map((p: any) => [p.name, p]));
    const p1 = byName.get('主视角'); const p2 = byName.get('队友·辅助');
    eq('A: 主视角总伤', p1.total, 1494734);
    eq('A: 队友总伤', p2.total, 412380);
    eq('A: 主视角 DPS', Math.round(p1.dps), 40840);
    eq('A: 主视角活跃%', Number(p1.activityPct.toFixed(1)), 91.9);
    eq('A: 队友活跃%', Number(p2.activityPct.toFixed(1)), 75.7);
    eq('A: 主视角 rDPS', Math.round(p1.rDps), 33804);
    eq('A: 队友 rDPS', Math.round(p2.rDps), 18303);
    const sumR = snap.players.reduce((a: number, p: any) => a + p.rDamage, 0);
    check('A: 归因守恒 |ΣrDamage − Σ原始| < 1', Math.abs(sumR - 1907114) < 1, `sumR=${sumR}`);
    let skillRows = 0;
    for (const table of snap.skillTables) {
      const gold = GOLD_SKILLS[table.playerName] || {};
      for (const row of table.rows) {
        skillRows++;
        eq(`A: 技能对账 ${table.playerName}·${row.skillName} (总量/次数)`, [row.total, row.casts], gold[row.skillName]);
      }
    }
    eq('A: 技能行数 = 13', skillRows, 13);
    const buffByName = new Map(snap.buffRows.map((r: any) => [r.buffName, r]));
    eq('A: 易伤覆盖%', Number(buffByName.get('易伤').uptimePct.toFixed(1)), 60.1);
    eq('A: 增伤·霖覆盖%', Number(buffByName.get('增伤·霖').uptimePct.toFixed(1)), 54.6);
    eq('A: 易伤倍率来自文件词典', [buffByName.get('易伤').multiplier, buffByName.get('易伤').multiplierSource], [1.15, 'file']);
    eq('A: 事件数', snap.quality.eventCount, 423);
    /* F (identity) rides the same import: roster display name
     * 主视角 matches actor p1; 队友·辅助 matches nothing. */
    eq('F: 主视角绑定名册成员', [p1.member?.rosterEntryId, p1.member?.displayName], [501, '主视角']);
    eq('F: 队友·辅助为 guest (member 为空)', p2.member, null);
    eq('F: actor_map_json 与快照一致', JSON.parse(res.row.actor_map_json).map((a: any) => a.member !== null), [true, false]);
  });

  it('B: three-state surface, zero footprint, page query, admin index', async () => {
    const { db, state } = makeDb();
    const gql = makeGql(db);
    /* paygate ON + below T2 -> Locked, no encounter content */
    const locked = await gql(detailQ, { user: adminA, variables: { slug: 'alpha', id: '11' } });
    eq('B: T1 百业详情 (总闸开) -> Locked', combatOf(locked)?.__typename, 'GroupingCombatReportLocked');
    check('B: Locked 不带 encounters 字段', !('encounters' in (combatOf(locked) || {})));
    const adminLocked = await gql(adminQ, { user: adminA, variables: { slug: 'alpha' } });
    eq('B: T1 管理面索引 -> Locked', adminLocked.data?.viewer?.guildAdmin?.combatReports?.__typename, 'GroupingCombatReportLocked');
    eq('B: 管理面战斗报告页签文案下发', adminLocked.data?.viewer?.guildAdmin?.adminTabCombatReportsLabel, '战斗报告');
    /* paygate OFF + below T2 -> field resolves null: zero footprint */
    state.settings.set('0|paygate_enabled', '0');
    const absent = await gql(detailQ, { user: adminA, variables: { slug: 'alpha', id: '11' } });
    eq('B: T1 百业详情 (总闸关) -> combatReport 为 null (零足迹)', combatOf(absent), null);
    check('B: 零足迹查询无错误', !absent.errors);
    const adminAbsent = await gql(adminQ, { user: adminA, variables: { slug: 'alpha' } });
    eq('B: T1 管理面索引 (总闸关) -> null', adminAbsent.data?.viewer?.guildAdmin?.combatReports, null);
    /* entitled guild stays open under either switch state */
    const emptyOff = await gql(detailQ, { user: leaderB, variables: { slug: 'beta', id: '12' } });
    eq('B: T3 百业 (总闸关, 无导入) -> Empty', combatOf(emptyOff)?.__typename, 'GroupingCombatReportEmpty');
    eq('B: Empty 带导入动作文案', combatOf(emptyOff)?.actions?.importLabel, '导入战斗报告');
    state.settings.set('0|paygate_enabled', '1');
    const emptyOn = await gql(detailQ, { user: leaderB, variables: { slug: 'beta', id: '12' } });
    eq('B: T3 百业 (总闸开, 无导入) -> Empty', combatOf(emptyOn)?.__typename, 'GroupingCombatReportEmpty');
    /* import, then Ready everywhere */
    const ev = state.events.find((e: any) => e.id === 12);
    const imp = await importCombatReport(db as any, ev, UID.B1, GOLD, JSON.stringify(GOLD));
    eq('B: 导入成功', imp.ok, true);
    const ready = await gql(detailQ, { user: memberB, variables: { slug: 'beta', id: '12' } });
    eq('B: 成员看详情 -> Ready', combatOf(ready)?.__typename, 'GroupingCombatReportReady');
    eq('B: Ready 场次列表一条', combatOf(ready)?.encounters?.length, 1);
    eq('B: 场次 boss 名', combatOf(ready)?.encounters?.[0]?.bossName, '演武木桩');
    eq('B: 场次导入者文案', combatOf(ready)?.encounters?.[0]?.uploaderText, '由 乙车头 导入');
    eq('B: 成员看场次无删除动作对象', combatOf(ready)?.encounters?.[0]?.deleteAction, null);
    eq('B: 详情队伍表首行', [combatOf(ready)?.detail?.partyRows?.[0]?.playerName, combatOf(ready)?.detail?.partyRows?.[0]?.total], ['主视角', 1494734]);
    eq('B: 详情 guest 标记', combatOf(ready)?.detail?.partyRows?.[1]?.guestTag, '访客');
    const readyLeader = await gql(detailQ, { user: leaderB, variables: { slug: 'beta', id: '12' } });
    eq('B: 导入者看场次带删除动作对象', readyLeader?.data?.groupingDetailPage?.combatReport?.encounters?.[0]?.deleteAction?.deleteLabel, '删除');
    const page = await gql(pageQ, { user: memberB, variables: { slug: 'beta', gid: '12' } });
    eq('B: 报告页查询 -> Ready', page.data?.combatReportPage?.__typename, 'GroupingCombatReportReady');
    eq('B: 报告页详情 boss', page.data?.combatReportPage?.detail?.bossName, '演武木桩');
    const adminList = await gql(adminQ, { user: leaderB, variables: { slug: 'beta' } });
    const list = adminList.data?.viewer?.guildAdmin?.combatReports;
    eq('B: 管理面索引 -> List', list?.__typename, 'GuildAdminCombatReportList');
    eq('B: 管理面索引一条且带车名', [list?.items?.length, list?.items?.[0]?.groupingTitle, list?.items?.[0]?.status], [1, '乙竞速车', 'PARSED']);
    /* non-member of a bound guild sees nothing at all */
    const outsider = await gql(detailQ, { user: adminG, variables: { slug: 'beta', id: '12' } });
    check('B: 非成员查绑定百业车队 -> 报错且零数据', !!outsider.errors && !outsider.data?.groupingDetailPage);
  });

  it('C: overlay session import', async () => {
    const { db, state } = makeDb();
    const ev = state.events.find((e: any) => e.id === 12);
    const session = {
      formatVersion: 1,
      panel_series: {
        players: {
          '玩家甲': { '0.0': 0, '1.0': 100, '2.0': 300 },
          '玩家乙': { '0.0': 0, '2.0': 50 },
        },
      },
      buff_timeline: {
        boss_debuff: { c1: { intervals: [[0.5, 1.5]] } },
        self_buff: {},
      },
      buff_identities: { boss_debuff: { c1: { name: '真气易伤' } } },
      casts: { points: [{ t: 0.5, name: '技能A' }, { t: 1.5, name: null }] },
    };
    const res = await importCombatReport(db as any, ev, UID.BM, session, JSON.stringify(session));
    eq('C: overlay 导入成功', res.ok, true);
    if (!res.ok) return;
    eq('C: 来源标记 overlay', res.row.source, 'overlay');
    const snap = JSON.parse(res.row.snapshot_json);
    eq('C: 团队总伤 = 面板终值之和', snap.teamTotal, 350);
    eq('C: 时长 = 末采样点', snap.durationMs, 2000);
    const totals = Object.fromEntries(snap.players.map((p: any) => [p.name, p.total]));
    eq('C: 分人总伤', [totals['玩家甲'], totals['玩家乙']], [300, 50]);
    eq('C: boss debuff 簇成一条 buff 行', snap.buffRows.length, 1);
    eq('C: buff 覆盖 = 区间/时长', [snap.buffRows[0].buffName, Number(snap.buffRows[0].uptimePct.toFixed(1))], ['真气易伤', 50]);
    eq('C: overlay buff 倍率走平台词典 (按无歧义名)', [snap.buffRows[0].multiplier, snap.buffRows[0].multiplierSource], [1.4, 'dict']);
    eq('C: 施法点随行', snap.overlayCastPoints.length, 2);
    eq('C: 面板技能行标注', snap.skillTables[0].rows[0].skillName, '');
  });

  it('D: validation rejects whole-file, zero rows, zero metering', async () => {
    const { db, state } = makeDb();
    const ev = state.events.find((e: any) => e.id === 12);
    const v2 = { ...GOLD, formatVersion: 2 };
    const r1 = await importCombatReport(db as any, ev, UID.B1, v2, JSON.stringify(v2));
    eq('D: formatVersion 2 -> formatUnsupported', [!r1.ok, !r1.ok && r1.errorCode], [true, 'formatUnsupported']);
    const bad = JSON.parse(JSON.stringify(GOLD));
    const hitIdx = bad.events.findIndex((e: any) => e.type === 'hit');
    bad.events[hitIdx] = { ...bad.events[hitIdx], amount: -5 };
    const r2 = await importCombatReport(db as any, ev, UID.B1, bad, JSON.stringify(bad));
    eq('D: 负伤害事件 -> validationFailed', [!r2.ok, !r2.ok && r2.errorCode], [true, 'validationFailed']);
    eq('D: 拒绝后零存储', state.encounters.length, 0);
    eq('D: 拒绝后零计量', combatUsage(state, GID.beta), 0);
  });

  it('E: delete verdicts', async () => {
    const { db, state } = makeDb();
    const gql = makeGql(db);
    const ev = state.events.find((e: any) => e.id === 12);
    const imp = await importCombatReport(db as any, ev, UID.B1, GOLD, JSON.stringify(GOLD));
    eq('E: 导入成功', imp.ok, true);
    if (!imp.ok) return;
    const id = String(imp.row.id);
    const byMember = await gql(delMut, { user: memberB, variables: { id } });
    eq('E: 无关成员删除 -> combatReportForbidden', byMember.data?.deleteCombatEncounter?.errorCode, 'combatReportForbidden');
    eq('E: 被拒后行仍在', state.encounters.length, 1);
    const byUploader = await gql(delMut, { user: leaderB, variables: { id } });
    eq('E: 导入者删除 -> ok', byUploader.data?.deleteCombatEncounter?.ok, true);
    eq('E: 删除后零行', state.encounters.length, 0);
    const imp2 = await importCombatReport(db as any, ev, UID.B1, GOLD, JSON.stringify(GOLD));
    eq('E: 二次导入成功', imp2.ok, true);
    if (!imp2.ok) return;
    const byAdmin = await gql(delMut, { user: adminB, variables: { id: String(imp2.row.id) } });
    eq('E: 百业管理员删除他人报告 -> ok', byAdmin.data?.deleteCombatEncounter?.ok, true);
    eq('E: 管理员删除后零行', state.encounters.length, 0);
    /* write verdict refuses below tier in every paygate state */
    state.entitlements.set(String(GID.beta), { tenant: GID.beta, plan: 't1', source: 'manual', current_period_end: null, stripe_customer_id: '', stripe_subscription_id: '', updated_at: 1 });
    const imp3 = await importCombatReport(db as any, ev, UID.B1, GOLD, JSON.stringify(GOLD));
    eq('E: 降档后服务层导入本身不设门 (门在路由/变异层)', imp3.ok, true);
    if (!imp3.ok) return;
    eq('E: tierLocked(beta 降为 T1, 2) = true', await tierLocked(db as any, GID.beta, 2), true);
    const byTier = await gql(delMut, { user: leaderB, variables: { id: String(imp3.row.id) } });
    eq('E: 低于 T2 删除 -> combatTierLocked', byTier.data?.deleteCombatEncounter?.errorCode, 'combatTierLocked');
    eq('E: 档位拒绝后行仍在', state.encounters.length, 1);
  });

  it('G: multiplier fallback to the platform dictionary', async () => {
    const { db, state } = makeDb();
    const ev = state.events.find((e: any) => e.id === 12);
    const doc = {
      formatVersion: 1,
      encounter: { bossName: '测试桩', startedAtMs: 1700000000000, durationMs: 10000, result: 'kill' },
      actors: [
        { id: 'a1', name: '玩家甲', kind: 'player' },
        { id: 'boss', name: '测试桩', kind: 'boss' },
      ],
      events: [
        { t: 0, type: 'buffApply', source: 'a1', target: 'boss', buffId: '200100', buffName: '易伤', applier: 'a1' },
        { t: 0, type: 'buffApply', source: 'a1', target: 'boss', buffId: 'zzz', buffName: '不存在的增益', applier: 'a1' },
        { t: 0, type: 'buffApply', source: 'a1', target: 'boss', buffId: 'qqq', buffName: '易伤', applier: 'a1' },
        { t: 1000, type: 'hit', source: 'a1', target: 'boss', skillId: 's1', skillName: '测试技能', amount: 1000, crit: 'none' },
        { t: 5000, type: 'buffRemove', source: 'a1', target: 'boss', buffId: '200100', buffName: '易伤' },
        { t: 5000, type: 'buffRemove', source: 'a1', target: 'boss', buffId: 'zzz', buffName: '不存在的增益' },
        { t: 5000, type: 'buffRemove', source: 'a1', target: 'boss', buffId: 'qqq', buffName: '易伤' },
        { t: 9000, type: 'hit', source: 'a1', target: 'boss', skillId: 's1', skillName: '测试技能', amount: 1000, crit: 'none' },
      ],
    };
    const res = await importCombatReport(db as any, ev, UID.B1, doc, JSON.stringify(doc));
    eq('G: 无文件词典导入成功', res.ok, true);
    if (!res.ok) return;
    const snap = JSON.parse(res.row.snapshot_json);
    const byId = new Map(snap.buffRows.map((r: any) => [r.buffId, r]));
    eq('G: 易伤按 ID 命中平台词典', [byId.get('200100').multiplier, byId.get('200100').multiplierKnown, byId.get('200100').multiplierSource], [1.08, true, 'dict']);
    eq('G: 未知 buff 倍率 1.0 且标注未定', [byId.get('zzz').multiplier, byId.get('zzz').multiplierKnown, byId.get('zzz').multiplierSource], [1, false, 'default']);
    eq('G: 歧义名 (易伤对应多个倍率) 不按名解析', [byId.get('qqq').multiplier, byId.get('qqq').multiplierKnown, byId.get('qqq').multiplierSource], [1, false, 'default']);
    eq('G: 结果透传 kill', snap.result, 'kill');
    const sumR = snap.players.reduce((a: number, p: any) => a + p.rDamage, 0);
    check('G: 自增益守恒 |ΣrDamage − 2000| < 1', Math.abs(sumR - 2000) < 1, `sumR=${sumR}`);
  });
});
