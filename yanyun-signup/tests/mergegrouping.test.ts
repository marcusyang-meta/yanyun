// Merge grouping (free feature) acceptance: real yoga + graphql.ts
// resolvers against a shape-routed FakeDB. Covers the admission
// matrix (same car / not found / signed out / outsider / manage
// verdicts on both cars / official / cross-guild / type mismatch /
// race refusal / not open / no recorded leader), the detail-page
// merge surface composition (candidate filtering by the same
// verdicts), and the seat migration itself: whole-row moves with
// ids/uids/readiness/answers following, identity-stamp dedup with
// the target's seat winning, over-capacity rows past maxSlots
// staying as the platform's existing beyond-grid seats, visitor
// seats moving with their marker, the source closing out through
// the disband cascade, and exactly one guild audit event.
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { typeDefs } from '../src/graphql-schema.ts';

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

/* ---------------- FakeDB ---------------- */
const SLUG = 'mergetest';
const SLUG2 = 'mergeother';
const GID = 1030100001;
const GID2 = 1030100002;
const UID_LEADER = 2030100001;
const UID_OTHER = 2030100002;
const UID_ADMIN = 2030100003;
const UID_OUT = 2030100004;
const UID_MEM = 2030100005;
const now = Math.floor(Date.now() / 1000);

const T1 = 1101, S1 = 1102, S2 = 1103, TRACE = 1104, SRACE = 1105,
  TTALENT = 1106, TCLOSED = 1107, G2CAR = 1108, TNOCREATOR = 1109,
  OFFICIAL = 1110, S3 = 1111, T2 = 1112, S4 = 1113;

function ev(id, over = {}) {
  return {
    id, tenant: GID, type: 'activity', title: '车' + id, description: '', dungeon: '',
    max_slots: 10, visitor_slots: 0, ally_visible: 0,
    starts_at: '', starts_at_utc: now + (id - 1100) * 100, status: 'open', origin: 'member',
    creator_user_id: UID_LEADER, created_by: '', reminder_sent_at: null, reminder_error: null,
    ...over,
  };
}
const tables = {
  events: [
    ev(T1, { title: '目标车', max_slots: 3 }),
    ev(S1, { title: '源车' }),
    ev(S2, { title: '他人源车', creator_user_id: UID_OTHER }),
    ev(TRACE, { title: '竞速目标', type: 'race' }),
    ev(SRACE, { title: '竞速源', type: 'race' }),
    ev(TTALENT, { title: '天赋车', type: 'talent', max_slots: 5 }),
    ev(TCLOSED, { title: '已截止车', status: 'closed' }),
    ev(G2CAR, { title: '邻业车', tenant: GID2 }),
    ev(TNOCREATOR, { title: '无车头车', creator_user_id: null }),
    ev(OFFICIAL, { title: '官方车', origin: 'official' }),
    ev(S3, { title: '备用源车' }),
    ev(T2, { title: '目标车二' }),
    ev(S4, { title: '源车二' }),
  ],
  signups: [
    { id: 11, event_id: T1, nickname: '甲', uid: 't-a', role: '输出', weapon: '', discord_id: 'DA', is_visitor: 0, ready_at: null },
    { id: 12, event_id: T1, nickname: '乙目标', uid: 't-b', role: '输出', weapon: '', discord_id: 'DB', is_visitor: 0, ready_at: 1700000000 },
    { id: 21, event_id: S1, nickname: '乙源', uid: 's-a', role: '输出', weapon: '', discord_id: 'DB', is_visitor: 0, ready_at: null },
    { id: 22, event_id: S1, nickname: '丙', uid: 's-c', role: '奶', weapon: '', discord_id: 'DC', is_visitor: 0, ready_at: 1700000123 },
    { id: 23, event_id: S1, nickname: '丁访客', uid: 's-d', role: '输出', weapon: '', discord_id: '', is_visitor: 1, ready_at: null },
    { id: 24, event_id: S1, nickname: '戊', uid: 's-e', role: '输出', weapon: '', discord_id: 'DE', is_visitor: 0, ready_at: null },
    { id: 31, event_id: S2, nickname: '己', uid: 'x-f', role: '输出', weapon: '', discord_id: 'DF', is_visitor: 0, ready_at: null },
    { id: 41, event_id: T2, nickname: '庚', uid: 'y-g', role: '输出', weapon: '', discord_id: 'DG', is_visitor: 0, ready_at: null },
    { id: 42, event_id: S4, nickname: '辛', uid: 'y-h', role: '输出', weapon: '', discord_id: 'DH', is_visitor: 0, ready_at: null },
  ],
  answers: [
    { id: 1, event_id: S1, signup_uid: 's-c', field_id: 9001, value: '答丙' },
    { id: 2, event_id: S1, signup_uid: 's-a', field_id: 9001, value: '答乙源' },
  ],
  results: [
    { id: 1, event_id: S1, team_name: '源队' },
  ],
};
const tenants = [
  { id: GID, slug: SLUG, guild_name: '合并测试百业', slogan: '', announcement: '' },
  { id: GID2, slug: SLUG2, guild_name: '邻业', slogan: '', announcement: '' },
];
const MEMBER_SERVERS = JSON.stringify([{ id: 'G1', name: 'G1', permissions: '0', owner: false }]);
const ADMIN_SERVERS = JSON.stringify([{ id: 'G1', name: 'G1', permissions: '8', owner: false }]);
const users = [
  { id: UID_LEADER, discord_id: 'D1', username: '车头', guilds_json: MEMBER_SERVERS },
  { id: UID_OTHER, discord_id: 'D2', username: '队员', guilds_json: MEMBER_SERVERS },
  { id: UID_ADMIN, discord_id: 'D3', username: '管理', guilds_json: ADMIN_SERVERS },
  { id: UID_OUT, discord_id: 'D4', username: '外人', guilds_json: '[]' },
  { id: UID_MEM, discord_id: 'D5', username: '路人', guilds_json: MEMBER_SERVERS },
];
const settings = new Map([
  [`${GID}|discord_guild_id`, 'G1'],
  [`${GID2}|discord_guild_id`, 'G2'],
]);
const auditRows = [];
const mintCounters = new Map();
const unknownSql = new Set();

function listOrder(rows) {
  return [...rows].sort((a, b) =>
    ((a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1))
    || ((a.starts_at_utc ?? 9999999999) - (b.starts_at_utc ?? 9999999999))
    || (b.id - a.id));
}
function statusExcluded(sql, status) {
  if (/NOT IN \('draft', 'completed'\)/.test(sql)) return status === 'draft' || status === 'completed';
  if (/status != 'draft'/.test(sql)) return status === 'draft';
  return false;
}

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
        return { results: listOrder(tables.events.filter((e) => e.tenant === b[0] && e.type === b[1] && !statusExcluded(sql, e.status))) };
      }
      if (/FROM events WHERE id = \?/.test(sql)) {
        const row = tables.events.find((e) => e.id === Number(b[0])) || null;
        return { results: row ? [row] : [] };
      }
      if (/FROM signups/.test(sql) && /COUNT\(\*\)/.test(sql)) {
        return { results: [{ c: tables.signups.filter((r) => r.event_id === Number(b[0])).length }] };
      }
      if (/FROM signups WHERE event_id\s*=\s*\?/.test(sql)) {
        let rows = tables.signups.filter((r) => r.event_id === Number(b[0])).sort((a, c) => a.id - c.id);
        if (/LIMIT \?/.test(sql)) rows = rows.slice(0, Number(b[1]));
        else if (/LIMIT \d+/.test(sql)) rows = rows.slice(0, Number(/LIMIT (\d+)/.exec(sql)[1]));
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
      if (/FROM officer_grants/.test(sql)) return { results: [] };
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
      if (/^UPDATE signup_answers SET event_id\s*=\s*\? WHERE event_id\s*=\s*\? AND signup_uid\s*=\s*\?/.test(sql)) {
        let n = 0;
        for (const r of tables.answers) if (r.event_id === Number(b[1]) && r.signup_uid === String(b[2])) { r.event_id = Number(b[0]); n++; }
        return { meta: { changes: n } };
      }
      if (/^DELETE FROM signup_answers WHERE event_id\s*=\s*\? AND signup_uid\s*=\s*\?/.test(sql)) {
        const before = tables.answers.length;
        tables.answers = tables.answers.filter((r) => !(r.event_id === Number(b[0]) && r.signup_uid === String(b[1])));
        return { meta: { changes: before - tables.answers.length } };
      }
      if (/^DELETE FROM signups WHERE id\s*=\s*\? AND event_id\s*=\s*\?/.test(sql)) {
        const before = tables.signups.length;
        tables.signups = tables.signups.filter((r) => !(r.id === Number(b[0]) && r.event_id === Number(b[1])));
        return { meta: { changes: before - tables.signups.length } };
      }
      if (/^DELETE FROM signups WHERE event_id\s*=\s*\?/.test(sql)) {
        const before = tables.signups.length;
        tables.signups = tables.signups.filter((r) => r.event_id !== Number(b[0]));
        return { meta: { changes: before - tables.signups.length } };
      }
      if (/^DELETE FROM results WHERE event_id\s*=\s*\?/.test(sql)) {
        const before = tables.results.length;
        tables.results = tables.results.filter((r) => r.event_id !== Number(b[0]));
        return { meta: { changes: before - tables.results.length } };
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
const env = { DB: db };

const leader = { userId: UID_LEADER, discordId: 'D1', name: '车头', guilds: ['G1'] };
const admin = { userId: UID_ADMIN, discordId: 'D3', name: '管理', guilds: ['G1'] };
const plainMember = { userId: UID_MEM, discordId: 'D5', name: '路人', guilds: ['G1'] };
const outsider = { userId: UID_OUT, discordId: 'D4', name: '外人', guilds: [] };

let ipSeq = 0;
async function gql(query, { user = leader, locale = 'zh-CN', variables } = {}) {
  ipSeq += 1;
  // A distinct client IP per call: the merge mutation is rate
  // limited per IP (10/min), and this suite fires more calls than
  // that from one "client" on purpose. Yoga exposes the FETCH
  // request as ctx.request, so the header rides the fetch request.
  const req = new Request('http://local/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '10.0.0.' + ipSeq },
    body: JSON.stringify({ query, variables }),
  });
  const ctx = { env, request: req, user, locale, browserLocale: locale, tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(req, ctx);
  return res.json();
}

const mergeMut = `mutation($input: MergeGroupingInput!) {
  mergeGrouping(input: $input) { ok error errorCode grouping { id title status } }
}`;
const detailQ = `query($slug: String, $id: ID!) {
  groupingDetailPage(slug: $slug, id: $id) {
    grouping { id title status occupiedCount maxSlots seats { nickname ready } }
    merge {
      buttonLabel dialogTitle emptyText confirmTitle confirmMessageTemplate
      confirmSubmitLabel toastMerged toastFailedTemplate
      candidates { id title metaText }
    }
  }
}`;
const seatsOf = (evId) => tables.signups.filter((r) => r.event_id === evId).sort((a, b) => a.id - b.id);

describe('mergegrouping', () => {
  it('Schema contract', () => {
    check('schema: Mutation.mergeGrouping', typeDefs.includes('mergeGrouping(input: MergeGroupingInput!): GroupingPayload!'));
    check('schema: GroupingDetailPage.merge', typeDefs.includes('merge: GroupingMerge'));
    check('schema: input MergeGroupingInput', typeDefs.includes('input MergeGroupingInput'));
  });

  it('Merge surface composition', async () => {
    const d = await gql(detailQ, { variables: { slug: SLUG, id: String(T1) } });
    const merge = d.data?.groupingDetailPage?.merge;
    check('车头看目标车: merge 面在场', !!merge, JSON.stringify(d.errors || d.data).slice(0, 200));
    eq('按钮文案', merge?.buttonLabel, '合并车队');
    eq('选车标题', merge?.dialogTitle, '选择要并入的车队');
    eq('空态文案', merge?.emptyText, '暂无可合并的车队');
    eq('确认标题', merge?.confirmTitle, '确认合并');
    check('确认文案模板带 {title}', (merge?.confirmMessageTemplate || '').includes('{title}'), merge?.confirmMessageTemplate);
    eq('确认按钮', merge?.confirmSubmitLabel, '确认合并');
    eq('成功 toast', merge?.toastMerged, '车队已合并');
    check('失败 toast 模板带 {error}', (merge?.toastFailedTemplate || '').includes('{error}'));
    const cands = (merge?.candidates || []).map((c) => c.id);
    eq('候选 = 本人可管理的同百业同类型 open 车 (按出发序)', cands.join(','), [S1, S3, T2, S4].join(','));
    const s1 = (merge?.candidates || []).find((c) => c.id === String(S1));
    eq('候选源车标题', s1?.title, '源车');
    check('候选 meta 行含人数 4/10 人', (s1?.metaText || '').endsWith('4/10 人'), s1?.metaText);
    check('候选 meta 行含时间分隔', (s1?.metaText || '').includes('·'), s1?.metaText);

    const dMember = await gql(detailQ, { user: plainMember, variables: { slug: SLUG, id: String(T1) } });
    eq('无管理权的成员: merge 面为 null', dMember.data?.groupingDetailPage?.merge, null);
    const dRace = await gql(detailQ, { variables: { slug: SLUG, id: String(TRACE) } });
    eq('竞速车: merge 面为 null', dRace.data?.groupingDetailPage?.merge, null);
    const dClosed = await gql(detailQ, { variables: { slug: SLUG, id: String(TCLOSED) } });
    eq('已截止车: merge 面为 null', dClosed.data?.groupingDetailPage?.merge, null);
  });

  it('Admission matrix (rejections write nothing)', async () => {
    const call = (targetId, sourceId, opts = {}) =>
      gql(mergeMut, { variables: { input: { targetId: String(targetId), sourceId: String(sourceId) } }, ...opts });

    const same = await call(T1, T1);
    eq('并入自己被拒', same.data?.mergeGrouping?.ok, false);
    eq('并入自己错误码', same.data?.mergeGrouping?.errorCode, 'mergeSameGrouping');
    eq('并入自己文案', same.data?.mergeGrouping?.error, '不能把车队并入它自己');

    const missing = await call(T1, 999999);
    eq('源车不存在错误码', missing.data?.mergeGrouping?.errorCode, 'groupingNotFound');

    const anon = await call(T1, S1, { user: null });
    eq('未登录被拒', anon.data?.mergeGrouping?.ok, false);
    eq('未登录文案', anon.data?.mergeGrouping?.error, '请先登录 Discord 后再操作');

    const out = await call(T1, S1, { user: outsider });
    eq('非服务器成员被拒 (memberOnly)', out.data?.mergeGrouping?.error, '只有该百业 Discord 服务器的成员可以操作');

    const mem = await call(T1, S1, { user: plainMember });
    eq('普通成员合并被拒', mem.data?.mergeGrouping?.ok, false);
    eq('普通成员文案 (leaderOnlyMerge)', mem.data?.mergeGrouping?.error, '只有车头或百业管理员可以合并车队');

    const srcNotMine = await call(T1, S2);
    eq('只管目标车不管源车被拒', srcNotMine.data?.mergeGrouping?.ok, false);
    eq('源车无权错误码', srcNotMine.data?.mergeGrouping?.errorCode, 'leaderOnlyMerge');

    const official = await call(T1, OFFICIAL);
    eq('官方车作源被拒 (officialEvent)', official.data?.mergeGrouping?.error, '官方活动请联系管理员');

    const nocreator = await call(T1, TNOCREATOR);
    eq('无车头源车被拒', nocreator.data?.mergeGrouping?.ok, false);
    eq('无车头文案 (noCreatorRecordedMerge)', nocreator.data?.mergeGrouping?.error, '该车队未记录车头，无法合并，请联系管理员处理');

    // Cross-guild: the operator must first pass BOTH cars' write
    // gates, so this call uses a session that sits in both guilds'
    // Discord servers (and leads both cars) — only then does the
    // tenant check itself get to speak.
    const bothGuilds = { userId: UID_LEADER, discordId: 'D1', name: '车头', guilds: ['G1', 'G2'] };
    const cross = await call(G2CAR, S3, { user: bothGuilds });
    eq('跨百业被拒', cross.data?.mergeGrouping?.ok, false);
    eq('跨百业错误码', cross.data?.mergeGrouping?.errorCode, 'mergeGuildMismatch');
    eq('跨百业文案', cross.data?.mergeGrouping?.error, '只能合并同一百业的车队');

    const typeMis = await call(TTALENT, S3);
    eq('类型不同被拒', typeMis.data?.mergeGrouping?.ok, false);
    eq('类型不同错误码', typeMis.data?.mergeGrouping?.errorCode, 'mergeTypeMismatch');

    const raceSrc = await call(T1, SRACE);
    eq('竞速源并入活动目标: 先撞类型校验', raceSrc.data?.mergeGrouping?.errorCode, 'mergeTypeMismatch');
    const race = await call(TRACE, SRACE);
    eq('竞速对竞速被拒', race.data?.mergeGrouping?.ok, false);
    eq('竞速错误码', race.data?.mergeGrouping?.errorCode, 'mergeRaceUnsupported');
    eq('竞速文案', race.data?.mergeGrouping?.error, '竞速车队暂不支持合并');

    const closed = await call(T1, TCLOSED);
    eq('已截止源车被拒', closed.data?.mergeGrouping?.ok, false);
    eq('已截止错误码', closed.data?.mergeGrouping?.errorCode, 'mergeNotOpen');
    const closedEn = await call(T1, TCLOSED, { locale: 'en' });
    eq('已截止文案 (en)', closedEn.data?.mergeGrouping?.error, 'Only squads that are open for signup can be merged');

    eq('拒绝后源车座位原样', seatsOf(S1).map((r) => r.id).join(','), '21,22,23,24');
    eq('拒绝后目标车座位原样', seatsOf(T1).map((r) => r.id).join(','), '11,12');
    eq('拒绝不写审计', auditRows.length, 0);
    check('源车仍在', !!tables.events.find((e) => e.id === S1));
  });

  it('Happy path: whole-row migration, dedup, overflow, visitor, cascade, audit', async () => {
    const r = await gql(mergeMut, { variables: { input: { targetId: String(T1), sourceId: String(S1) } } });
    eq('合并 ok', r.data?.mergeGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 300));
    eq('返回目标车', r.data?.mergeGrouping?.grouping?.id, String(T1));
    eq('目标车标题不变', r.data?.mergeGrouping?.grouping?.title, '目标车');

    const rows = seatsOf(T1);
    eq('目标车行集 (整行迁移, 按报名序)', rows.map((x) => x.id).join(','), '11,12,22,23,24');
    eq('源车行清零', seatsOf(S1).length, 0);
    const moved = rows.find((x) => x.id === 22);
    eq('迁移行 uid 不变', moved?.uid, 's-c');
    eq('迁移行 ready_at 跟随', moved?.ready_at, 1700000123);
    const visitor = rows.find((x) => x.id === 23);
    eq('访客座标记保留', visitor?.is_visitor, 1);
    check('去重: 目标车 DB 行 (12) 保留', rows.some((x) => x.id === 12 && x.nickname === '乙目标'));
    check('去重: 源车 DB 行 (21) 已丢弃', !tables.signups.some((x) => x.id === 21));

    const ansC = tables.answers.find((x) => x.signup_uid === 's-c');
    eq('迁移座答案跟随到目标车', ansC?.event_id, T1);
    check('被弃座答案清除', !tables.answers.some((x) => x.signup_uid === 's-a'));
    check('源车成绩被级联删除', !tables.results.some((x) => x.event_id === S1));
    check('源车本体被级联删除 (解散收尾)', !tables.events.find((e) => e.id === S1));
    const t1 = tables.events.find((e) => e.id === T1);
    eq('目标车容量不变', t1?.max_slots, 3);
    eq('目标车状态不变', t1?.status, 'open');

    eq('审计恰一条', auditRows.length, 1);
    eq('审计动作', auditRows[0]?.action, 'event.merge');
    eq('审计目标 = 目标车', auditRows[0]?.target_id, String(T1));
    eq('审计类型', auditRows[0]?.target_type, 'event');
    eq('审计操作者', auditRows[0]?.actor_discord_id, 'D1');
    eq('审计摘要含源→目标', auditRows[0]?.target_label, '源车 → 目标车');
    eq('审计百业', auditRows[0]?.tenant, GID);

    const d = await gql(detailQ, { variables: { slug: SLUG, id: String(T1) } });
    const g = d.data?.groupingDetailPage?.grouping;
    eq('occupiedCount 含超员行', g?.occupiedCount, 5);
    eq('座位格只排前 maxSlots 行 (报名序)', (g?.seats || []).map((s) => s.nickname).join(','), '甲,乙目标,丙');
    eq('迁移行 ready 在格内可见', g?.seats?.[2]?.ready, true);
    const cands = (d.data?.groupingDetailPage?.merge?.candidates || []).map((c) => c.id);
    check('合并后候选不再含源车', !cands.includes(String(S1)), cands.join(','));
  });

  it('Guild admin path: admin of neither car merges by server verdict', async () => {
    const r = await gql(mergeMut, { user: admin, variables: { input: { targetId: String(T1), sourceId: String(S2) } } });
    eq('管理员合并 ok', r.data?.mergeGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 300));
    check('他人源车座位迁入', seatsOf(T1).some((x) => x.id === 31));
    check('他人源车已收尾', !tables.events.find((e) => e.id === S2));
    eq('审计第二条', auditRows.length, 2);
    eq('审计操作者 = 管理员', auditRows[1]?.actor_discord_id, 'D3');
  });

  it('Second pair merges clean (en locale)', async () => {
    const r = await gql(mergeMut, { locale: 'en', variables: { input: { targetId: String(T2), sourceId: String(S4) } } });
    eq('第二对合并 ok', r.data?.mergeGrouping?.ok, true, JSON.stringify(r.errors || r.data).slice(0, 300));
    eq('第二对目标行集', seatsOf(T2).map((x) => x.id).join(','), '41,42');
    eq('审计第三条', auditRows.length, 3);

    if (unknownSql.size) console.log('\n[FakeDB 未路由 SQL — 已走默认空结果]\n' + [...unknownSql].join('\n'));
  });
});
