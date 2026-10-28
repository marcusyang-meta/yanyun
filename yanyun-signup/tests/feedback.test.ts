// In-app feedback acceptance:
//  - GraphQL submitFeedback: anonymous -> loginRequired; a logged-in
//    submit lands one row (trimmed content, enum category mapped to its
//    stored value, submitter name snapshot, status open); empty and
//    over-2000-char texts are rejected with their catalog error codes
//    and store nothing; the per-user rolling-24h cap (5) rejects the
//    6th submission with feedbackRateLimited;
//  - text surfaces: the viewer landing fields and the settingsPage
//    feedback fields resolve from the catalog (zh-CN source; an en
//    request falls back to the source per field, the standing rule for
//    not-yet-translated strings);
//  - admin: the list requires the platform-admin gate, shows submissions newest first,
//    filters by triage status; the status endpoint resolves and
//    reopens a row (resolved_at stamped / cleared), 404s unknown ids
//    and 400s bad statuses; viewing and flipping are audited, and the
//    audit summary never carries feedback content.
// FakeDB routes by SQL shape (same pattern as .harness-audit);
// feedback / hub_audit_log land in real in-memory tables.
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* Drizzle query-builder channel helper (same as .harness-audit). */
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
    feedback: [], // {id, discord_id, user_name, category, content, status, created_at, resolved_at}
    audit: [],    // {id, at, actor, action, tenant, summary, ip}
  };
  function route(kind, sql, b) {
    sql = sql.replace(/"/g, '').replace(/feedback\./g, '').replace(/hub_audit_log\./g, '');
    if (/feedback/.test(sql)) {
      if (/INSERT INTO feedback/.test(sql)) {
        const [discordId, userName, category, content, createdAt] = b;
        state.feedback.push({
          id: state.feedback.length + 1, discord_id: discordId, user_name: userName,
          category, content, status: 'open', created_at: createdAt, resolved_at: null,
        });
        return { meta: { changes: 1 } };
      }
      if (/UPDATE feedback/.test(sql)) {
        const [status, resolvedAt, id] = b;
        const row = state.feedback.find((r) => r.id === Number(id));
        if (!row) return { meta: { changes: 0 } };
        row.status = status; row.resolved_at = resolvedAt;
        return { meta: { changes: 1 } };
      }
      if (/COUNT\(\*\)/.test(sql)) {
        let rows = state.feedback;
        if (/WHERE discord_id =/.test(sql)) rows = rows.filter((r) => r.discord_id === b[0] && r.created_at >= b[1]);
        else if (/WHERE status =/.test(sql)) rows = rows.filter((r) => r.status === b[0]);
        return kind === 'first' ? { c: rows.length } : { results: [{ c: rows.length }] };
      }
      if (/FROM feedback/.test(sql)) {
        let rows = [...state.feedback];
        let limit = 50, offset = 0;
        if (/WHERE status =/.test(sql)) { rows = rows.filter((r) => r.status === b[0]); limit = b[1]; offset = b[2]; }
        else { limit = b[0]; offset = b[1]; }
        rows = rows.sort((x, y) => y.id - x.id).slice(offset, offset + limit);
        return { results: rows };
      }
      return { meta: {} };
    }
    if (/hub_audit_log/.test(sql)) {
      if (/INSERT INTO hub_audit_log/.test(sql)) {
        state.audit.push({ id: state.audit.length + 1, at: b[0], actor: b[1], action: b[2], tenant: b[3], summary: b[4], ip: b[5] });
        return { meta: {} };
      }
      if (/DELETE FROM hub_audit_log/.test(sql)) return { meta: {} }; // prune: no-op at this scale
      if (/COUNT\(\*\)/.test(sql)) return kind === 'first' ? { c: state.audit.length } : { results: [{ c: state.audit.length }] };
      return { results: [...state.audit].sort((x, y) => y.id - x.id) };
    }
    if (/error_log/.test(sql)) {
      if (/COUNT\(\*\)/.test(sql)) return kind === 'first' ? { c: 0 } : { results: [{ c: 0 }] };
      return { results: [] };
    }
    if (/FROM users/.test(sql)) return kind === 'first' ? null : { results: [] };
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
const env = { DB: db, PLATFORM_ADMIN_DISCORD_IDS: 'FB-ADMIN' };
const userA = { discordId: 'UF1', name: '反馈用户甲', guilds: [] };
const userB = { discordId: 'UF2', name: '反馈用户乙', guilds: [] };

async function gql(query, { user = userA, variables, locale = 'zh-CN' } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale, browserLocale: locale, tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}
const submitMut = `mutation($category: FeedbackCategory!, $text: String!) {
  submitFeedback(category: $category, text: $text) { ok error errorCode }
}`;
const submit = (user, category, text) => gql(submitMut, { user, variables: { category, text } });

describe('feedback', () => {
/* ================= GraphQL: submitFeedback ================= */
  it('GraphQL: submitFeedback', async () => {
  const anon = await submit(null, 'PROBLEM', '匿名反馈');
  eq('匿名提交 -> loginRequired', anon.data?.submitFeedback?.errorCode, 'loginRequired');
  eq('匿名提交 ok=false', anon.data?.submitFeedback?.ok, false);
  eq('匿名提交不落库', state.feedback.length, 0);

  const r1 = await submit(userA, 'PROBLEM', '  报名页偶尔打不开  ');
  eq('登录提交 -> ok', r1.data?.submitFeedback?.ok, true);
  eq('落库一行', state.feedback.length, 1);
  const row1 = state.feedback[0];
  eq('内容已去空白', row1.content, '报名页偶尔打不开');
  eq('类别 PROBLEM -> problem', row1.category, 'problem');
  eq('提交者快照', [row1.discord_id, row1.user_name], ['UF1', '反馈用户甲']);
  eq('新行状态 open', row1.status, 'open');
  check('created_at 为毫秒时间戳', typeof row1.created_at === 'number' && Math.abs(row1.created_at - Date.now()) < 60000, String(row1.created_at));

  await submit(userA, 'SUGGESTION', '希望有夜间模式');
  await submit(userA, 'OTHER', '路过留名');
  eq('SUGGESTION/OTHER 映射落库', state.feedback.map((r) => r.category), ['problem', 'suggestion', 'other']);

  const empty = await submit(userB, 'PROBLEM', '   ');
  eq('空白内容 -> feedbackEmpty', empty.data?.submitFeedback?.errorCode, 'feedbackEmpty');
  eq('feedbackEmpty 文案走目录', empty.data?.submitFeedback?.error, '反馈内容不能为空');
  const tooLong = await submit(userB, 'PROBLEM', '长'.repeat(2001));
  eq('2001 字 -> feedbackTooLong', tooLong.data?.submitFeedback?.errorCode, 'feedbackTooLong');
  eq('拒绝不落库', state.feedback.filter((r) => r.discord_id === 'UF2').length, 0);
  const exact = await submit(userB, 'SUGGESTION', '长'.repeat(2000));
  eq('恰好 2000 字 -> ok', exact.data?.submitFeedback?.ok, true);

  // Daily cap: userA has 3 in the window; two more fit, the 6th is rejected.
  await submit(userA, 'OTHER', '第四条');
  await submit(userA, 'OTHER', '第五条');
  const sixth = await submit(userA, 'OTHER', '第六条');
  eq('24h 第 6 条 -> feedbackRateLimited', sixth.data?.submitFeedback?.errorCode, 'feedbackRateLimited');
  eq('限流文案走目录', sixth.data?.submitFeedback?.error, '今天提交的反馈已达上限，请明天再来');
  eq('限流不落库', state.feedback.filter((r) => r.discord_id === 'UF1').length, 5);
  const otherUser = await submit(userB, 'OTHER', '乙的第二条');
  eq('限流按用户隔离', otherUser.data?.submitFeedback?.ok, true);
  });

/* ================= GraphQL: text surfaces ================= */
  it('GraphQL: text surfaces', async () => {
  const q = `{ viewer {
    landingFeaturesTitle landingGroupingTitle landingGroupingBody
    landingReminderTitle landingReminderBody landingDexTitle landingDexBody
    landingGearTitle landingGearBody }
    settingsPage {
    feedbackEntryLabel feedbackTitle feedbackCategoryLabel
    feedbackCategoryProblemLabel feedbackCategorySuggestionLabel
    feedbackCategoryOtherLabel feedbackPlaceholder feedbackSubmitLabel
    feedbackSubmittingLabel feedbackSuccessText } }`;
  const zh = await gql(q, { user: null });
  const v = zh.data?.viewer || {};
  check('落地页 9 个文案字段全部非空', ['landingFeaturesTitle', 'landingGroupingTitle', 'landingGroupingBody', 'landingReminderTitle', 'landingReminderBody', 'landingDexTitle', 'landingDexBody', 'landingGearTitle', 'landingGearBody'].every((k) => typeof v[k] === 'string' && v[k].length > 0), JSON.stringify(v).slice(0, 160));
  eq('落地页组队块标题', v.landingGroupingTitle, '组队报名');
  const sp = zh.data?.settingsPage || {};
  check('反馈 10 个文案字段全部非空', ['feedbackEntryLabel', 'feedbackTitle', 'feedbackCategoryLabel', 'feedbackCategoryProblemLabel', 'feedbackCategorySuggestionLabel', 'feedbackCategoryOtherLabel', 'feedbackPlaceholder', 'feedbackSubmitLabel', 'feedbackSubmittingLabel', 'feedbackSuccessText'].every((k) => typeof sp[k] === 'string' && sp[k].length > 0), JSON.stringify(sp).slice(0, 160));
  eq('反馈入口文案', sp.feedbackEntryLabel, '意见反馈');
  eq('反馈类别文案', [sp.feedbackCategoryProblemLabel, sp.feedbackCategorySuggestionLabel, sp.feedbackCategoryOtherLabel], ['问题', '建议', '其他']);

  const en = await gql(q, { user: null, locale: 'en' });
  eq('en 未译字符串逐字段回退源文', en.data?.viewer?.landingGroupingTitle, '组队报名');
  });

/* ================= Admin: list + triage =================
 * Hub overhaul: this section used to drive triage through the
 * retired hub REST portal (password login + bearer token). It now
 * goes through the GraphQL admin surface: anonymous composition is
 * the Locked type with zero feedback data, and the env-floor admin
 * reads and flips through feedbackEntries /
 * platformAdminSetFeedbackStatus. Status-code assertions map to
 * payload outcomes (refusal -> Locked / badParams /
 * feedbackNotFound). */
  it('Admin: list + triage', async () => {
  const admin = { discordId: 'FB-ADMIN', name: '反馈管理员', guilds: [] };
  const listQ = (status) => `{ viewer { platformAdmin { __typename
    ... on PlatformAdmin { feedbackEntries(status: ${status ? JSON.stringify(status) : 'null'}) { total entries { id discordId userName category content status createdAt resolvedAt } } } } } }`;
  const flipM = (id, status) => `mutation { platformAdminSetFeedbackStatus(id: ${id}, status: ${JSON.stringify(status)}) { ok error errorCode } }`;

  const anon = await gql(listQ(null), { user: null });
  eq('匿名列表 -> Locked', anon.data?.viewer?.platformAdmin?.__typename, 'PlatformAdminLocked');
  check('匿名零反馈数据下发', !JSON.stringify(anon).includes('乙的第二条'));

  const list = await gql(listQ(null), { user: admin });
  const lj = list.data?.viewer?.platformAdmin?.feedbackEntries;
  check('超管列表可达', !!lj, JSON.stringify(list).slice(0, 160));
  eq('列表 total = 全部待处理数', lj.total, 7);
  eq('列表最新在前', lj.entries[0].content, '乙的第二条');
  check('列表行带用户快照与类别', lj.entries.every((r) => r.discordId && r.userName && r.category), JSON.stringify(lj.entries[0]).slice(0, 160));

  const firstId = lj.entries[0].id;
  const flip = await gql(flipM(firstId, 'resolved'), { user: admin });
  eq('标记已处理 -> ok', flip.data?.platformAdminSetFeedbackStatus?.ok, true);
  const flipped = state.feedback.find((r) => r.id === firstId);
  eq('行状态 resolved 且有 resolved_at', [flipped.status, typeof flipped.resolved_at], ['resolved', 'number']);

  const openList = (await gql(listQ('open'), { user: admin })).data?.viewer?.platformAdmin?.feedbackEntries;
  eq('按 open 筛选', openList.total, 6);
  const resList = (await gql(listQ('resolved'), { user: admin })).data?.viewer?.platformAdmin?.feedbackEntries;
  eq('按 resolved 筛选', resList.total, 1);
  eq('resolved 列表就是该行', resList.entries[0].id, firstId);

  const badStatus = await gql(flipM(firstId, 'nope'), { user: admin });
  eq('非法状态 -> badParams', badStatus.data?.platformAdminSetFeedbackStatus?.errorCode, 'badParams');
  const missing = await gql(flipM(99999, 'resolved'), { user: admin });
  eq('未知 id -> feedbackNotFound', missing.data?.platformAdminSetFeedbackStatus?.errorCode, 'feedbackNotFound');

  const reopen = await gql(flipM(firstId, 'open'), { user: admin });
  eq('重开 -> ok', reopen.data?.platformAdminSetFeedbackStatus?.ok, true);
  eq('重开清 resolved_at', [flipped.status, flipped.resolved_at], ['open', null]);

  check('查看反馈留痕 feedback.view', state.audit.some((r) => r.action === 'feedback.view' && r.actor === 'FB-ADMIN'));
  check('状态变更留痕 feedback.status', state.audit.some((r) => r.action === 'feedback.status' && r.actor === 'FB-ADMIN'));
  check('审计摘要绝不含反馈正文', !JSON.stringify(state.audit).includes('报名页偶尔打不开') && !JSON.stringify(state.audit).includes('乙的第二条'));
  });
});
