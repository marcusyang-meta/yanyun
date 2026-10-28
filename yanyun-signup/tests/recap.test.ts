// P18 AI activity recaps acceptance (premium T3 line):
// three-state matrix over (tier, provider configuration):
//   A. provider UNCONFIGURED (AI binding absent): a below-T3 guild
//      composes Locked; a T3 guild composes NotEnabled on both the
//      detail surface and the admin index; generation is refused
//      with recapNotEnabled; NOTHING is stored or metered.
//   B. provider configured (Workers AI binding stub):
//      below-T3 stays Locked (a tier-1 plan row); a legacy premium
//      row reads as tier 3 under the converged TIER_BY_PLAN mapping,
//      so gamma runs the full T3 path (its completed car composes
//      Empty with manage-gated actions); a T3 guild runs the full
//      chain — Empty with manage-gated actions, leader generates,
//      the data package carries only real platform data (absentees /
//      completedAt named missing), the recap is stored with
//      provider id + snapshot summary + version, the attempt is
//      metered per guild per day, members read the Ready variant,
//      the admin index lists it, regeneration overwrites in place
//      and bumps the version.
//   C. provider failure: the attempt is refused with
//      recapProviderFailed but metered and recorded as the row's
//      failed state; retry succeeds; a failed retry on a Ready
//      recap keeps the old paragraphs and gains the failed hint.
//   D. daily ceiling: at the per-guild daily limit, generation is
//      refused with recapDailyLimit and the provider is not called.
// Real yoga + real resolvers + FakeDB routing by SQL shape into
// in-memory tables (same pattern as tests/officer.test.ts). The
// provider seam itself is the real binding-assembled Workers AI
// adapter, with env.AI stubbed at the binding boundary.
//
// Migrated from .harness-recap/run.mjs with a per-assertion mapping
// in PR #85's description (84 harness assertions -> 84 vitest
// assertions; the only scenario rewrite is the entitlement fixture:
// plans are spelled 't1' / 't3' / legacy 'premium' — the converged
// model has no stored tier column — and the legacy-premium case now
// expects the T3 outcome instead of the retired stored-tier T2
// reading; marcus's 2026-10-28 convergence ruling).
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { typeDefs } from '../src/graphql-schema.ts';
import { recapProviderFromEnv } from '../src/domains/platform/recap-provider.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: unknown, want: unknown) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* Drizzle query-builder channel helper (same as officer). */
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

/* ---------------- FakeDB ---------------- */
function makeDb() {
  const state: any = {
    tenants: [
      { slug: 'alpha', guild_name: '甲百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', recruit_open: 0 },
      { slug: 'beta', guild_name: '乙百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', recruit_open: 0 },
      { slug: 'gamma', guild_name: '丙百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', recruit_open: 0 },
    ],
    settings: new Map([
      ['alpha|discord_guild_id', 'DG1'],
      ['beta|discord_guild_id', 'DG2'],
      ['gamma|discord_guild_id', 'DG3'],
      ['|paygate_enabled', '1'],
    ]),
    users: new Map([
      ['A1', JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '8', owner: false }])],
      ['B1', JSON.stringify([{ id: 'DG2', name: 'S2', permissions: '8', owner: false }])],
      ['BM', JSON.stringify([{ id: 'DG2', name: 'S2', permissions: '0', owner: false }])],
      ['G1', JSON.stringify([{ id: 'DG3', name: 'S3', permissions: '8', owner: false }])],
    ]),
    // Entitlement rows (snake_case, repository shape) under the
    // converged plan model: alpha holds plan 't1'; beta plan 't3';
    // gamma a legacy 'premium' row (reads as tier 3 via
    // TIER_BY_PLAN). The retired stored-tier column is gone.
    entitlements: new Map([
      ['alpha', { tenant: 'alpha', plan: 't1', source: 'manual', current_period_end: null, stripe_customer_id: '', stripe_subscription_id: '', updated_at: 1 }],
      ['beta', { tenant: 'beta', plan: 't3', source: 'manual', current_period_end: null, stripe_customer_id: '', stripe_subscription_id: '', updated_at: 1 }],
      ['gamma', { tenant: 'gamma', plan: 'premium', source: 'manual', current_period_end: null, stripe_customer_id: '', stripe_subscription_id: '', updated_at: 1 }],
    ]),
    guildMembers: [
      { tenant: 'beta', discord_id: 'B1', nick: '乙车头', global_name: 'LeaderB' },
      { tenant: 'beta', discord_id: 'BM', nick: '乙成员', global_name: 'MemberB' },
    ],
    // EventRow key order: id, tenant, title, type, description, starts_at,
    // meet_info, max_slots, status, starts_at_utc, origin, created_by,
    // manage_code, dungeon, creator_discord_id, reminder_sent_at,
    // reminder_error, created_at
    events: [
      { id: 11, tenant: 'alpha', title: '甲竞速车', type: 'race', description: '', starts_at: null, meet_info: '', max_slots: 10, status: 'completed', starts_at_utc: 1760000000, origin: 'member', created_by: '管理员甲', manage_code: '', dungeon: '试炼本', creator_discord_id: 'A1', reminder_sent_at: 1759999900, reminder_error: null, created_at: '2026-10-01 09:00:00' },
      { id: 12, tenant: 'beta', title: '乙竞速车', type: 'race', description: '', starts_at: null, meet_info: '', max_slots: 10, status: 'completed', starts_at_utc: 1760000000, origin: 'member', created_by: '乙车头', manage_code: '', dungeon: '试炼本', creator_discord_id: 'B1', reminder_sent_at: 1759999900, reminder_error: null, created_at: '2026-10-01 09:00:00' },
      { id: 13, tenant: 'beta', title: '乙未完成车', type: 'activity', description: '', starts_at: null, meet_info: '', max_slots: 10, status: 'open', starts_at_utc: 1760500000, origin: 'member', created_by: '乙车头', manage_code: '', dungeon: '', creator_discord_id: 'B1', reminder_sent_at: null, reminder_error: null, created_at: '2026-10-02 09:00:00' },
      { id: 14, tenant: 'beta', title: '乙成员的车', type: 'activity', description: '', starts_at: null, meet_info: '', max_slots: 10, status: 'completed', starts_at_utc: 1760100000, origin: 'member', created_by: '乙成员', manage_code: '', dungeon: '', creator_discord_id: 'BM', reminder_sent_at: null, reminder_error: null, created_at: '2026-10-03 09:00:00' },
      { id: 31, tenant: 'gamma', title: '丙竞速车', type: 'race', description: '', starts_at: null, meet_info: '', max_slots: 10, status: 'completed', starts_at_utc: 1760000000, origin: 'member', created_by: '丙管理员', manage_code: '', dungeon: '试炼本', creator_discord_id: 'G1', reminder_sent_at: null, reminder_error: null, created_at: '2026-10-01 09:00:00' },
    ],
    // SignupRow key order: id, event_id, nickname, uid, role, weapon,
    // contact, note, team_name, members, created_at, discord_id, ready_at
    signups: [
      { id: 1, event_id: 12, nickname: '乙车头', uid: 'u1', role: '输出', weapon: '破竹', contact: '', note: '', team_name: '', members: '', created_at: '2026-10-01 10:00:00', discord_id: 'B1', ready_at: 1759999800 },
      { id: 2, event_id: 12, nickname: '乙成员', uid: 'u2', role: '奶', weapon: '万丝', contact: '', note: '', team_name: '', members: '', created_at: '2026-10-01 10:01:00', discord_id: 'BM', ready_at: 1759999801 },
      { id: 3, event_id: 12, nickname: '路人丙', uid: 'u3', role: '输出', weapon: '破竹', contact: '', note: '', team_name: '', members: '', created_at: '2026-10-01 10:02:00', discord_id: null, ready_at: null },
      { id: 4, event_id: 14, nickname: '乙成员', uid: 'u4', role: '输出', weapon: '破竹', contact: '', note: '', team_name: '', members: '', created_at: '2026-10-03 10:00:00', discord_id: 'BM', ready_at: null },
    ],
    results: [
      { id: 1, event_id: 12, team_name: '一队', members: '乙车头,乙成员', time_ms: 754000, proof_url: '', note: '', created_at: '2026-10-01 12:00:00' },
      { id: 2, event_id: 12, team_name: '一队', members: '乙车头,乙成员', time_ms: 702000, proof_url: '', note: '二刷', created_at: '2026-10-01 12:30:00' },
    ],
    recaps: [], // grouping_recaps rows
    usage: new Map(), // 'scope|metric|day' -> count
  };
  let nextRecapId = 100;

  function norm(sql: string) {
    return sql.replace(/"/g, '')
      .replace(/\b(tenants|settings|users|guild_members|events|signups|results|guild_entitlements|usage_counters|grouping_recaps)\./g, '')
      .replace(/\s+/g, ' ');
  }

  function route(kind: string, rawSql: string, b: any[]) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    if (/^INSERT INTO guild_members/i.test(sql)) return { meta: { changes: 1 } };
    const first = (row: any) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows: any[]) => ({ results: rows });

    if (/FROM tenants/i.test(sql)) {
      const row = state.tenants.find((t: any) => t.slug === b[0]);
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
    if (/FROM results/i.test(sql)) {
      const rows = state.results.filter((r: any) => r.event_id === Number(b[0]))
        .sort((x: any, y: any) => x.time_ms - y.time_ms);
      return all(rows.map((r: any) => ({ ...r })));
    }
    if (/FROM guild_members/i.test(sql)) {
      return all(state.guildMembers.filter((m: any) => m.tenant === b[0]).map((m: any) => ({ ...m })));
    }
    /* usage counters */
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
    /* grouping_recaps */
    if (/^INSERT INTO grouping_recaps/i.test(sql)) {
      if (/status.*'ready'/i.test(sql) || /VALUES \(\?, \?, 'ready'/i.test(sql) || sql.includes("'ready'")) {
        const [tenant, eventId, paragraphsJson, snapshotJson, provider, generatedBy, atSec] = b;
        const existing = state.recaps.find((r: any) => r.event_id === Number(eventId));
        if (existing) {
          Object.assign(existing, {
            tenant, status: 'ready', paragraphs_json: paragraphsJson, snapshot_json: snapshotJson,
            provider, generated_by: generatedBy, version: existing.version + 1, last_error: '',
            generated_at: atSec, updated_at: atSec,
          });
          return { meta: { changes: 1, last_row_id: existing.id } };
        }
        const row = {
          id: nextRecapId++, tenant, event_id: Number(eventId), status: 'ready',
          paragraphs_json: paragraphsJson, snapshot_json: snapshotJson, provider,
          generated_by: generatedBy, version: 1, last_error: '',
          generated_at: atSec, updated_at: atSec,
        };
        state.recaps.push(row);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      const [tenant, eventId, generatedBy, error, atSec] = b;
      const existing = state.recaps.find((r: any) => r.event_id === Number(eventId));
      if (existing) {
        Object.assign(existing, { status: 'failed', last_error: error, generated_by: generatedBy, updated_at: atSec });
        return { meta: { changes: 1, last_row_id: existing.id } };
      }
      const row = {
        id: nextRecapId++, tenant, event_id: Number(eventId), status: 'failed',
        paragraphs_json: '[]', snapshot_json: '{}', provider: '',
        generated_by: generatedBy, version: 0, last_error: error,
        generated_at: 0, updated_at: atSec,
      };
      state.recaps.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    if (/FROM grouping_recaps/i.test(sql)) {
      if (/WHERE event_id =/i.test(sql)) {
        const row = state.recaps.find((r: any) => r.event_id === Number(b[0]));
        return first(row ? { ...row } : null);
      }
      const rows = state.recaps.filter((r: any) => r.tenant === b[0])
        .sort((x: any, y: any) => Math.max(y.generated_at, y.updated_at) - Math.max(x.generated_at, x.updated_at));
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

const { db, state } = makeDb();
const adminA = { discordId: 'A1', name: '管理员甲', guilds: ['DG1'] };
const leaderB = { discordId: 'B1', name: '乙车头', guilds: ['DG2'] };
const memberB = { discordId: 'BM', name: '乙成员', guilds: ['DG2'] };
const adminG = { discordId: 'G1', name: '丙管理员', guilds: ['DG3'] };

/* Workers AI binding stub: stands in for env.AI. Records the model
 * and the data package it was handed, answers in the model's real
 * chat-completion output shape, and can fail or emit a reasoning
 * block on demand. */
let providerMode = 'ok';
let providerCalls = 0;
let providerParagraphs = ['本场竞速顺利完赛。', '全员就位及时，配合默契。'];
let providerThink = false;
let lastPackage: any = null;
let lastModel: any = null;
const PROVIDER_ID = 'workers-ai:@cf/qwen/qwen3-30b-a3b-fp8';
const fakeAi = {
  async run(model: string, inputs: any) {
    providerCalls++;
    lastModel = model;
    lastPackage = JSON.parse(inputs.messages[1].content);
    if (providerMode === 'fail') throw new Error('stub workers ai boom');
    const json = JSON.stringify({ paragraphs: providerParagraphs });
    const text = providerThink ? `<think>内部推理，不应出现在复盘里。</think>\n${json}` : json;
    return { choices: [{ message: { content: text } }] };
  },
};

const ENV_OFF: any = { DB: db };
const ENV_ON: any = { DB: db, AI: fakeAi };

async function gql(query: string, { user = leaderB, variables, env = ENV_OFF }: any = {}) {
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

const detailQ = `query($slug: String, $id: ID!) { groupingDetailPage(slug: $slug, id: $id) { recap {
  __typename
  ... on GroupingRecapLocked { title body }
  ... on GroupingRecapNotEnabled { title body }
  ... on GroupingRecapEmpty { title body failedHint actions { generateLabel } }
  ... on GroupingRecapReady { title paragraphs summaryLines generatedAtText providerText versionText failedHint actions { generateLabel } }
} } }`;
const adminQ = `query($slug: String!) { viewer { guildAdmin(slug: $slug) { __typename
  ... on GuildAdmin { adminTabRecapsLabel recaps { __typename
    ... on GroupingRecapLocked { title body }
    ... on GroupingRecapNotEnabled { title body }
    ... on GuildAdminRecapList { title emptyText items { id groupingId groupingTitle status statusText provider version paragraphCountText generatedAtText } }
  } } } } }`;
const genMut = `mutation($id: ID!) { generateGroupingRecap(id: $id) { ok error errorCode recap { __typename
  ... on GroupingRecapReady { paragraphs versionText } } } }`;
const recapOf = (r: any) => r.data?.groupingDetailPage?.recap;
const dayKey = new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10);
const betaUsage = () => state.usage.get(`guild:beta|ai_recap_generations|${dayKey}`) || 0;

describe('recap', () => {
  it('SDL shape', () => {
    check('SDL: GroupingDetailPage 带 recap 字段', /type GroupingDetailPage \{[\s\S]*?\n  recap: GroupingRecapResult!/.test(typeDefs));
    check('SDL: generateGroupingRecap mutation 存在', typeDefs.includes('generateGroupingRecap(id: ID!): RecapPayload!'));
    check('SDL: GuildAdmin 带 recaps 字段', /type GuildAdmin \{[\s\S]*?\n  recaps: GuildAdminRecapResult!/.test(typeDefs));
    check('SDL: 复盘 union 含四变体', typeDefs.includes('union GroupingRecapResult = GroupingRecapReady | GroupingRecapLocked | GroupingRecapNotEnabled | GroupingRecapEmpty'));
  });

  it('provider seam (binding assembly)', () => {
    eq('无 AI binding -> provider 为 null', recapProviderFromEnv({}), null);
    eq('AI binding 为 undefined -> provider 为 null', recapProviderFromEnv({ AI: undefined }), null);
    eq('有 AI binding -> provider id 为 workers-ai:<钉死模型>', recapProviderFromEnv(ENV_ON)?.id, PROVIDER_ID);
  });

  it('A: provider unconfigured', async () => {
    const locked = await gql(detailQ, { user: adminA, variables: { slug: 'alpha', id: '11' }, env: ENV_OFF });
    eq('A: T1 百业详情 -> GroupingRecapLocked', recapOf(locked)?.__typename, 'GroupingRecapLocked');
    eq('A: Locked 标题为泛称文案 (不硬编码档位名)', recapOf(locked)?.title, 'AI 复盘 · 高阶档专属');
    check('A: Locked 不带 paragraphs 字段', !('paragraphs' in (recapOf(locked) || {})));

    const notEnabled = await gql(detailQ, { user: leaderB, variables: { slug: 'beta', id: '12' }, env: ENV_OFF });
    eq('A: T3 百业详情 (未配置) -> GroupingRecapNotEnabled', recapOf(notEnabled)?.__typename, 'GroupingRecapNotEnabled');
    eq('A: NotEnabled 标题文案', recapOf(notEnabled)?.title, 'AI 复盘尚未开启');

    const gen = await gql(genMut, { user: leaderB, variables: { id: '12' }, env: ENV_OFF });
    eq('A: 未配置时生成 -> recapNotEnabled', gen.data?.generateGroupingRecap?.errorCode, 'recapNotEnabled');
    eq('A: 未配置时零存储', state.recaps.length, 0);
    eq('A: 未配置时零计量', betaUsage(), 0);

    const adminBeta = await gql(adminQ, { user: leaderB, variables: { slug: 'beta' }, env: ENV_OFF });
    eq('A: T3 管理面索引 -> GroupingRecapNotEnabled', adminBeta.data?.viewer?.guildAdmin?.recaps?.__typename, 'GroupingRecapNotEnabled');
    const adminAlpha = await gql(adminQ, { user: adminA, variables: { slug: 'alpha' }, env: ENV_OFF });
    eq('A: T1 管理面索引 -> GroupingRecapLocked', adminAlpha.data?.viewer?.guildAdmin?.recaps?.__typename, 'GroupingRecapLocked');
    eq('A: 管理面复盘页签文案下发', adminAlpha.data?.viewer?.guildAdmin?.adminTabRecapsLabel, '复盘');
  });

  it('B: provider configured', async () => {
    const locked = await gql(detailQ, { user: adminA, variables: { slug: 'alpha', id: '11' }, env: ENV_ON });
    eq('B: T1 百业详情 (已配置) 仍 -> Locked', recapOf(locked)?.__typename, 'GroupingRecapLocked');
    const genLocked = await gql(genMut, { user: adminA, variables: { id: '11' }, env: ENV_ON });
    eq('B: T1 生成 -> recapTierLocked', genLocked.data?.generateGroupingRecap?.errorCode, 'recapTierLocked');
    eq('B: T1 被拒后仍零存储', state.recaps.length, 0);

    const gamma = await gql(detailQ, { user: adminG, variables: { slug: 'gamma', id: '31' }, env: ENV_ON });
    eq('B: legacy premium 读作 T3 -> 已完成车 Empty 且管理者带 actions', [recapOf(gamma)?.__typename, recapOf(gamma)?.actions?.generateLabel], ['GroupingRecapEmpty', '生成复盘']);

    const emptyMember = await gql(detailQ, { user: memberB, variables: { slug: 'beta', id: '12' }, env: ENV_ON });
    eq('B: T3 已完成车 (成员看) -> Empty', recapOf(emptyMember)?.__typename, 'GroupingRecapEmpty');
    eq('B: 成员看 Empty 无 actions', recapOf(emptyMember)?.actions, null);
    const emptyLeader = await gql(detailQ, { user: leaderB, variables: { slug: 'beta', id: '12' }, env: ENV_ON });
    eq('B: 车头看 Empty 带 actions', recapOf(emptyLeader)?.actions?.generateLabel, '生成复盘');
    const openCar = await gql(detailQ, { user: leaderB, variables: { slug: 'beta', id: '13' }, env: ENV_ON });
    eq('B: 未完成车 -> Empty', recapOf(openCar)?.__typename, 'GroupingRecapEmpty');
    eq('B: 未完成车无 actions', recapOf(openCar)?.actions, null);

    const forbidden = await gql(genMut, { user: memberB, variables: { id: '12' }, env: ENV_ON });
    eq('B: 普通成员生成 -> recapForbidden', forbidden.data?.generateGroupingRecap?.errorCode, 'recapForbidden');
    const notCompleted = await gql(genMut, { user: leaderB, variables: { id: '13' }, env: ENV_ON });
    eq('B: 未完成车生成 -> recapNotCompleted', notCompleted.data?.generateGroupingRecap?.errorCode, 'recapNotCompleted');
    eq('B: 被拒生成不计量', betaUsage(), 0);
    eq('B: 被拒生成不调 provider', providerCalls, 0);

    const gen = await gql(genMut, { user: leaderB, variables: { id: '12' }, env: ENV_ON });
    eq('B: 车头生成 -> ok', gen.data?.generateGroupingRecap?.ok, true);
    eq('B: 生成 payload 直接回 Ready', gen.data?.generateGroupingRecap?.recap?.__typename, 'GroupingRecapReady');
    eq('B: payload 段落与 provider 输出一致', gen.data?.generateGroupingRecap?.recap?.paragraphs, providerParagraphs);
    eq('B: provider 被调一次', providerCalls, 1);
    eq('B: adapter 以钉死模型调用 binding', lastModel, '@cf/qwen/qwen3-30b-a3b-fp8');
    eq('B: 数据包出席数 = 落座行数', lastPackage?.attendance?.seatedCount, 3);
    eq('B: 数据包就位数 = ready_at 行数', lastPackage?.attendance?.readyCount, 2);
    eq('B: 数据包空位数 = 容量-落座', lastPackage?.attendance?.emptySeats, 7);
    eq('B: 数据包竞速成绩条数', lastPackage?.results?.length, 2);
    check('B: 数据包 missing 含 absentees (平台无缺席记录)', (lastPackage?.missing || []).includes('absentees'));
    check('B: 数据包 missing 含 completedAt (平台无完成时间)', (lastPackage?.missing || []).includes('completedAt'));
    eq('B: 数据包时间线 completedAt 为 null', lastPackage?.timeline?.completedAt, null);
    check('B: 数据包座位不带 discord_id', (lastPackage?.attendance?.seats || []).every((s: any) => !('discord_id' in s) && !('discordId' in s)));

    eq('B: 存储一行', state.recaps.length, 1);
    const row = state.recaps[0];
    eq('B: 存储行 provider 标识', row.provider, PROVIDER_ID);
    eq('B: 存储行 version = 1', row.version, 1);
    eq('B: 存储行生成者为车头', row.generated_by, 'B1');
    const snap = JSON.parse(row.snapshot_json);
    eq('B: 快照摘要 seated/capacity', [snap.seated, snap.capacity], [3, 10]);
    eq('B: 快照摘要成绩数与最佳时间', [snap.resultCount, snap.bestTimeMs], [2, 702000]);
    eq('B: 生成尝试计量 = 1', betaUsage(), 1);

    const readyMember = await gql(detailQ, { user: memberB, variables: { slug: 'beta', id: '12' }, env: ENV_ON });
    eq('B: 成员看详情 -> Ready', recapOf(readyMember)?.__typename, 'GroupingRecapReady');
    eq('B: 成员读到段落', recapOf(readyMember)?.paragraphs, providerParagraphs);
    eq('B: 成员看 Ready 无 actions', recapOf(readyMember)?.actions, null);
    check('B: Ready 摘要行含出席行', (recapOf(readyMember)?.summaryLines || []).some((l: string) => l.includes('出席 3/10')));
    check('B: Ready 摘要行含成绩行', (recapOf(readyMember)?.summaryLines || []).some((l: string) => l.includes('竞速成绩 2 条')));
    eq('B: Ready 版本文案', recapOf(readyMember)?.versionText, '第 1 版');

    const adminList = await gql(adminQ, { user: leaderB, variables: { slug: 'beta' }, env: ENV_ON });
    const list = adminList.data?.viewer?.guildAdmin?.recaps;
    eq('B: 管理面索引 -> List', list?.__typename, 'GuildAdminRecapList');
    eq('B: 索引条数', list?.items?.length, 1);
    eq('B: 索引条目标题为车队名', list?.items?.[0]?.groupingTitle, '乙竞速车');
    eq('B: 索引条目状态文案', list?.items?.[0]?.statusText, '已生成');
    eq('B: 索引条目段落数文案', list?.items?.[0]?.paragraphCountText, '2 段');

    providerParagraphs = ['重新生成后的复盘。'];
    providerThink = true; // model answers with a reasoning block this time
    const regen = await gql(genMut, { user: leaderB, variables: { id: '12' }, env: ENV_ON });
    providerThink = false;
    eq('B: 重新生成 -> ok', regen.data?.generateGroupingRecap?.ok, true);
    eq('B: 重新生成仍是一行 (原地覆盖)', state.recaps.length, 1);
    eq('B: 重新生成 version = 2', state.recaps[0].version, 2);
    eq('B: 重新生成段落已替换', JSON.parse(state.recaps[0].paragraphs_json), ['重新生成后的复盘。']);
    check('B: 段落不含 think 推理块内容', !state.recaps[0].paragraphs_json.includes('内部推理'));
    eq('B: 计量累计 = 2', betaUsage(), 2);
  });

  it('C: provider failure + retry', async () => {
    providerMode = 'fail';
    const failGen = await gql(genMut, { user: leaderB, variables: { id: '14' }, env: ENV_ON });
    eq('C: provider 失败 -> recapProviderFailed', failGen.data?.generateGroupingRecap?.errorCode, 'recapProviderFailed');
    eq('C: 失败也计量 (provider 调用即成本)', betaUsage(), 3);
    const failRow = state.recaps.find((r: any) => r.event_id === 14);
    eq('C: 失败落行状态 failed', failRow?.status, 'failed');
    eq('C: 失败行无段落', JSON.parse(failRow?.paragraphs_json || '[]'), []);
    const emptyAfterFail = await gql(detailQ, { user: leaderB, variables: { slug: 'beta', id: '14' }, env: ENV_ON });
    eq('C: 失败后详情 -> Empty', recapOf(emptyAfterFail)?.__typename, 'GroupingRecapEmpty');
    check('C: 失败后 Empty 带失败提示', !!(recapOf(emptyAfterFail)?.failedHint || '').length);

    providerMode = 'ok';
    providerParagraphs = ['乙成员的车复盘。'];
    const retry = await gql(genMut, { user: leaderB, variables: { id: '14' }, env: ENV_ON });
    eq('C: 百业管理员可为他人车生成 (重试) -> ok', retry.data?.generateGroupingRecap?.ok, true);
    eq('C: 重试成功行状态 ready', state.recaps.find((r: any) => r.event_id === 14)?.status, 'ready');
    eq('C: 首次成功 version = 1', state.recaps.find((r: any) => r.event_id === 14)?.version, 1);

    providerMode = 'fail';
    const failRegen = await gql(genMut, { user: leaderB, variables: { id: '12' }, env: ENV_ON });
    eq('C: Ready 后失败重试 -> recapProviderFailed', failRegen.data?.generateGroupingRecap?.errorCode, 'recapProviderFailed');
    const readyAfterFail = await gql(detailQ, { user: memberB, variables: { slug: 'beta', id: '12' }, env: ENV_ON });
    eq('C: 失败重试后仍 -> Ready', recapOf(readyAfterFail)?.__typename, 'GroupingRecapReady');
    eq('C: 失败重试不毁旧段落', recapOf(readyAfterFail)?.paragraphs, ['重新生成后的复盘。']);
    check('C: Ready 带失败提示', !!(recapOf(readyAfterFail)?.failedHint || '').length);
    eq('C: 失败重试不升 version', state.recaps.find((r: any) => r.event_id === 12)?.version, 2);
    providerMode = 'ok';
  });

  it('D: daily ceiling', async () => {
    state.usage.set(`guild:beta|ai_recap_generations|${dayKey}`, 10);
    const callsBefore = providerCalls;
    const limited = await gql(genMut, { user: leaderB, variables: { id: '12' }, env: ENV_ON });
    eq('D: 达每日上限 -> recapDailyLimit', limited.data?.generateGroupingRecap?.errorCode, 'recapDailyLimit');
    eq('D: 达上限时不调 provider', providerCalls, callsBefore);
  });
});
