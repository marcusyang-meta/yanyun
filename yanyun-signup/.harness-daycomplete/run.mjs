// 完成态 (completed) + 列表按日分组验收: 真实 yoga + graphql.js resolver +
// reminder.js 真函数 + worker.js 真 fetch, FakeDB 按 SQL 形状忠实路由
// (状态过滤/排序在 FakeDB 里按 SQL 文本语义执行, 不是写死结果)。
// A: completeGrouping/reopenGrouping 闸门 (车头/无车头/官方车/未登录) ->
//     列表 (GraphQL groupings + Block 树) 与 REST 列表消失 -> 详情直达仍可
//     打开 (已完成态 + 恢复入口) -> 提醒口径过滤 (nextReminderAt /
//     dueReminders, 含"闹钟已排队后完成"场景) -> 恢复后重现。
// B: 周框架不变, 一屏内 Block 树按查看者本地日分组 (组头 SectionHeader
//     整句下发; 组日期升序、组内时刻升序 — 含打乱 SQL 序的同日两车);
//     跨周边界 (周末尾车在内、下周车不在本周/在下周); Web 契约字段
//     (dayGroupHeaderTemplate / weekdayNames / undatedGroupLabel)。
import { yoga } from '../src/graphql.js';
import { typeDefs } from '../src/graphql-schema.js';
import { nextReminderAt, dueReminders } from '../src/reminder.js';
import { weekWindowUtc, localDayParts } from '../src/blocks.js';
import { translate } from '../src/i18n.js';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
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

/* ---------------- FakeDB ---------------- */
const SLUG = 'daytest';
const now = Math.floor(Date.now() / 1000);
const [ws, we] = weekWindowUtc(0);
const D1 = ws + 2 * 86400; // 本周内的一个日子 (周三 05:00 北京时间起)
function ev(id, over = {}) {
  return {
    id, tenant: SLUG, type: 'activity', title: '车' + id, description: '', dungeon: '',
    max_slots: 10, starts_at: '', starts_at_utc: null, status: 'open', origin: 'member',
    creator_discord_id: 'U1', created_by: '', reminder_sent_at: null, reminder_error: null,
    ...over,
  };
}
const tables = {
  events: [
    // A 组 (activity): 提醒/完成链
    ev(201, { title: '提醒车', starts_at_utc: now + 300 }),
    ev(207, { title: '无车头老车', creator_discord_id: null, starts_at_utc: now + 400 }),
    ev(208, { title: '已关闭待完成车', status: 'closed', starts_at_utc: now + 500 }),
    ev(209, { title: '官方车', origin: 'official', starts_at_utc: now + 600 }),
    // B 组 (talent): 按日分组 — 同日两车 (SQL 序 open 在前, 组内须按时刻重排)
    ev(202, { type: 'talent', title: '同日晚场', starts_at_utc: D1 + 7200 }),
    ev(203, { type: 'talent', title: '同日早场', status: 'closed', starts_at_utc: D1 + 3600 }),
    ev(204, { type: 'talent', title: '周五车', starts_at_utc: ws + 4 * 86400 + 3600 }),
    ev(205, { type: 'talent', title: '周末尾车', starts_at_utc: we - 3600 }),
    ev(206, { type: 'talent', title: '下周车', starts_at_utc: we + 3600 }),
  ],
  signups: [
    { id: 1, event_id: 201, nickname: '车头', uid: 'u1', role: '输出', weapon: '破竹·樽', discord_id: 'U1' },
  ],
};
const tenants = [{ slug: SLUG, guild_name: '按天测试百业', slogan: '', announcement: '' }];
const settings = new Map([[`${SLUG}|discord_guild_id`, 'G1']]);
const unknownSql = new Set();

// 列表排序口径与产品 SQL 一致: open 在前, starts_at_utc 升序 (空值垫底), id 降序
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
function pendingFilter(b, withDue) {
  return tables.events.filter((e) =>
    e.tenant === b[0]
    && (e.status === 'open' || e.status === 'closed')
    && e.starts_at_utc != null && e.starts_at_utc > b[1]
    && e.reminder_sent_at == null && e.reminder_error == null
    && (!withDue || e.starts_at_utc - b[2] <= b[3]));
}

function stmt(sql) {
  // 数据层 (Drizzle) SQL 规范化: 去引号 + 去 settings. 限定前缀 (仅路由匹配)
  sql = sql.replace(/"/g, '').replace(/settings\./g, '');
  const q = {
    _binds: [],
    bind(...a) { this._binds = a; return this; },
    async raw() { const res = await this.all(); return toRawRows(sql, (res && res.results) || []); },
    async first() {
      const b = this._binds;
      if (/FROM tenants WHERE slug/.test(sql)) return tenants.find((t) => t.slug === b[0]) || null;
      if (/FROM settings/.test(sql)) {
        const v = settings.get(`${b[0]}|${b[1]}`);
        return v === undefined ? null : { value: v };
      }
      if (/SELECT \* FROM events WHERE id = \?/.test(sql)) return tables.events.find((e) => e.id === Number(b[0])) || null;
      if (/MIN\(starts_at_utc\) AS m FROM events/.test(sql)) {
        const rows = pendingFilter(b, false);
        return { m: rows.length ? Math.min(...rows.map((e) => e.starts_at_utc)) : null };
      }
      if (/FROM signups/.test(sql) && /COUNT/.test(sql)) {
        return { c: tables.signups.filter((r) => r.event_id === Number(b[0])).length, h: 0, m: 10 };
      }
      if (/FROM users|FROM user_guild_nicks|FROM guild_members/.test(sql)) return null;
      if (/CREATE|ALTER|PRAGMA/.test(sql)) return null;
      unknownSql.add('first: ' + sql.slice(0, 90));
      return null;
    },
    async all() {
      const b = this._binds;
      if (/FROM settings/.test(sql)) {
        // 数据层点查走 .all() 通道 (drizzle db.get): 形状同 first() 的 settings 分支
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
      if (/FROM events WHERE tenant = \? AND type = \?/.test(sql)) {
        return { results: listOrder(tables.events.filter((e) => e.tenant === b[0] && e.type === b[1] && !statusExcluded(sql, e.status))) };
      }
      if (/FROM events e WHERE e\.tenant/.test(sql)) {
        let rows = tables.events.filter((e) => e.tenant === b[0] && !statusExcluded(sql, e.status));
        if (/AND e\.type = \?/.test(sql)) rows = rows.filter((e) => e.type === b[1]);
        return { results: listOrder(rows) };
      }
      if (/SELECT \* FROM events WHERE/.test(sql) && /reminder_sent_at IS NULL/.test(sql)) {
        return { results: pendingFilter(b, true).sort((a, c) => a.starts_at_utc - c.starts_at_utc || a.id - c.id) };
      }
      if (/FROM signups WHERE event_id\s*=\s*\?/.test(sql)) {
        return { results: tables.signups.filter((r) => r.event_id === Number(b[0])).sort((a, c) => a.id - c.id) };
      }
      if (/FROM tenants/.test(sql)) return { results: tenants };
      if (/CREATE|ALTER|PRAGMA/.test(sql)) return { results: [] };
      unknownSql.add('all: ' + sql.slice(0, 90));
      return { results: [] };
    },
    async run() {
      const b = this._binds;
      if (/CREATE|ALTER/.test(sql)) return { meta: { changes: 0 } };
      const um = sql.match(/^UPDATE events SET status = '(\w+)' WHERE id = \?/);
      if (um) {
        const row = tables.events.find((e) => e.id === Number(b[0]));
        if (row) row.status = um[1];
        return { meta: { changes: row ? 1 : 0 } };
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

const leader = { discordId: 'U1', name: '车头', guilds: ['G1'] };
const member = { discordId: 'U2', name: '队员', guilds: ['G1'] };

async function gql(query, { user = leader, locale = 'zh-CN', tz = 'Asia/Shanghai', variables } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale, browserLocale: locale, tz, executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

/* ---------------- schema 契约 ---------------- */
check('schema: Mutation.completeGrouping', typeDefs.includes('completeGrouping(id: ID!): GroupingPayload!'));
check('schema: Mutation.reopenGrouping', typeDefs.includes('reopenGrouping(id: ID!): GroupingPayload!'));
check('schema: CompleteAction 类型', /type CompleteAction implements Action/.test(typeDefs));
check('schema: UncompleteAction 类型', /type UncompleteAction implements Action/.test(typeDefs));
for (const f of ['dayGroupHeaderTemplate', 'weekdayNames', 'undatedGroupLabel', 'detailCompleteLabel', 'detailStatusCompletedLabel', 'detailRestoreLabel', 'detailCompletedHint']) {
  check('schema: 字段 ' + f, typeDefs.includes(f + ':'));
}

/* ---------------- B: Web 契约文案字段 ---------------- */
const listTextQ = `query($slug: String!, $tab: GroupingTab!) {
  groupingListPage(slug: $slug, tab: $tab) {
    dayGroupHeaderTemplate weekdayNames undatedGroupLabel
    groupings { id status }
  }
}`;
const ltext = await gql(listTextQ, { variables: { slug: SLUG, tab: 'ACTIVITY' } });
eq('dayGroupHeaderTemplate (zh)', ltext.data?.groupingListPage?.dayGroupHeaderTemplate, '{month}月{day}日 {weekday}');
eq('weekdayNames[0] (zh, 周日)', ltext.data?.groupingListPage?.weekdayNames?.[0], '周日');
eq('weekdayNames[1] (zh, 周一)', ltext.data?.groupingListPage?.weekdayNames?.[1], '周一');
eq('weekdayNames 长度 7', ltext.data?.groupingListPage?.weekdayNames?.length, 7);
eq('undatedGroupLabel (zh)', ltext.data?.groupingListPage?.undatedGroupLabel, '未定时间');
const ltextEn = await gql(listTextQ, { variables: { slug: SLUG, tab: 'ACTIVITY' }, locale: 'en' });
eq('weekdayNames[1] (en)', ltextEn.data?.groupingListPage?.weekdayNames?.[1], 'Mon');
eq('undatedGroupLabel (en)', ltextEn.data?.groupingListPage?.undatedGroupLabel, 'Time TBD');

/* ---------------- B: Block 树按日分组 ---------------- */
const listBlocksQ = `query($slug: String!, $tab: GroupingTab!, $wo: Int, $bv: Int) {
  groupingListPage(slug: $slug, tab: $tab) {
    blocks(blocksVersion: $bv, weekOffset: $wo) {
      __typename
      ... on SectionHeaderBlock { text }
      ... on GroupingCardBlock { groupingId }
    }
  }
}`;
function seqOf(blocks) {
  return (blocks || []).map((b) => b.__typename === 'SectionHeaderBlock' ? 'H:' + b.text
    : b.__typename === 'GroupingCardBlock' ? 'C:' + b.groupingId : b.__typename);
}
const bk = await gql(listBlocksQ, { variables: { slug: SLUG, tab: 'TALENT', wo: 0, bv: 4 } });
const seq = seqOf(bk.data?.groupingListPage?.blocks);
const p1 = localDayParts(D1 + 3600, 'Asia/Shanghai');
const h1 = translate('groupingList', 'dayGroupHeader', 'zh-CN', {
  month: p1.month, day: p1.day, weekday: translate('groupingList', 'weekday' + p1.weekday, 'zh-CN'),
});
eq('组头[0] 整句 = 目录模板拼装 (D1 日)', seq[0], 'H:' + h1);
eq('组内按时刻升序: 早场闭车 203 在晚场 202 前 (逆 SQL 的 open 优先序)', seq[1] + ',' + seq[2], 'C:203,C:202');
const i204 = seq.indexOf('C:204'), i205 = seq.indexOf('C:205');
check('跨日升序: 周五车 204 在周末尾车 205 前', i204 > 0 && i205 > i204, JSON.stringify(seq));
check('周末尾车 205 在本周内 (跨周边界内侧)', i205 > 0);
check('下周车 206 不在 本周', !seq.includes('C:206'));
eq('组头数 = 3 个不同日期', seq.filter((x) => x.startsWith('H:')).length, 3);
const bkNext = await gql(listBlocksQ, { variables: { slug: SLUG, tab: 'TALENT', wo: 1, bv: 4 } });
const seqNext = seqOf(bkNext.data?.groupingListPage?.blocks);
check('下周车 206 在下周出现 (跨周边界外侧)', seqNext.includes('C:206'), JSON.stringify(seqNext));
check('下周不含本周车 202', !seqNext.includes('C:202'));
// 老客户端 (v3): SectionHeaderBlock 是 v1 积木, 组头照常下发不被替代
const bkV3 = await gql(listBlocksQ, { variables: { slug: SLUG, tab: 'TALENT', wo: 0, bv: 3 } });
const seqV3 = seqOf(bkV3.data?.groupingListPage?.blocks);
eq('v3 客户端组头数仍为 3 (无 Fallback 替代)', seqV3.filter((x) => x.startsWith('H:')).length, 3);

/* ---------------- A: 完成链 ---------------- */
const completeMut = `mutation($id: ID!) { completeGrouping(id: $id) { ok error grouping { id status } } }`;
const reopenMut = `mutation($id: ID!) { reopenGrouping(id: $id) { ok error grouping { id status } } }`;
const listQ = `query($slug: String!, $tab: GroupingTab!) {
  groupingListPage(slug: $slug, tab: $tab) { groupings { id status } }
}`;
const detailQ = `query($slug: String, $id: ID!) {
  groupingDetailPage(slug: $slug, id: $id) {
    grouping { id status }
    detailCompleteLabel detailStatusCompletedLabel detailRestoreLabel detailCompletedHint
    blocks(blocksVersion: 4) {
      __typename
      ... on ChipRowBlock { chips }
      ... on TextBlock { text variant }
      ... on ActionButtonBlock { label action { __typename } }
    }
  }
}`;

// 提醒基线: 201 是最早的待提醒车 (闹钟已按它排队)
eq('基线 nextReminderAt = 201 出发-600', await nextReminderAt(db, SLUG, now), now + 300 - 600);
const due0 = await dueReminders(db, SLUG, now);
eq('基线 dueReminders 含 201/207/208/209 (官方车也在提醒口径内)', due0.map((e) => e.id).join(','), '201,207,208,209');

// 闸门: 未登录 / 非车头 / 无车头记录 / 官方车
const cAnon = await gql(completeMut, { user: null, variables: { id: '201' } });
eq('未登录完成被拒', cAnon.data?.completeGrouping?.ok, false);
eq('未登录错误文案', cAnon.data?.completeGrouping?.error, '请先登录 Discord 后再操作');
const cMember = await gql(completeMut, { user: member, variables: { id: '201' } });
eq('非车头完成被拒', cMember.data?.completeGrouping?.ok, false);
eq('非车头错误文案 (leaderOnlyComplete)', cMember.data?.completeGrouping?.error, '只有车头可以完成车队');
const cNoLeader = await gql(completeMut, { variables: { id: '207' } });
eq('无车头记录完成被拒', cNoLeader.data?.completeGrouping?.ok, false);
eq('无车头错误文案 (noCreatorRecordedComplete)', cNoLeader.data?.completeGrouping?.error, '该车队未记录车头，无法完成，请联系管理员处理');
const cOfficial = await gql(completeMut, { variables: { id: '209' } });
eq('官方车完成被拒', cOfficial.data?.completeGrouping?.ok, false);
eq('官方车错误文案 (officialEvent)', cOfficial.data?.completeGrouping?.error, '官方活动请联系管理员');

// 完成前详情树: 车头有 CompleteAction
const dBefore = await gql(detailQ, { variables: { slug: SLUG, id: '201' } });
const actsBefore = (dBefore.data?.groupingDetailPage?.blocks || []).filter((b) => b.__typename === 'ActionButtonBlock').map((b) => b.action?.__typename);
eq('完成前车头动作集 = Edit/Complete/Disband', actsBefore.join(','), 'EditAction,CompleteAction,DisbandAction');
eq('detailCompleteLabel (zh)', dBefore.data?.groupingDetailPage?.detailCompleteLabel, '完成车队');

// 车头完成 201
const c1 = await gql(completeMut, { variables: { id: '201' } });
eq('车头完成 ok', c1.data?.completeGrouping?.ok, true, JSON.stringify(c1.errors || c1.data));
eq('完成后 status=completed', c1.data?.completeGrouping?.grouping?.status, 'completed');
eq('DB 行 status=completed', tables.events.find((e) => e.id === 201)?.status, 'completed');

// 列表消失 (GraphQL groupings + Block 树)
const la = await gql(listQ, { variables: { slug: SLUG, tab: 'ACTIVITY' } });
check('GraphQL 列表不再含 201', !(la.data?.groupingListPage?.groupings || []).some((g) => g.id === '201'));
check('GraphQL 列表仍含 207/208', ['207', '208'].every((id) => (la.data?.groupingListPage?.groupings || []).some((g) => g.id === id)));
const bkA = await gql(listBlocksQ, { variables: { slug: SLUG, tab: 'ACTIVITY', wo: 0, bv: 4 } });
check('Block 树不再含卡片 201', !seqOf(bkA.data?.groupingListPage?.blocks).includes('C:201'));

// 提醒过滤: 闹钟已按 201 排队, 完成后到点重查 (dueReminders) 必须拦住
eq('完成后 nextReminderAt 移到 207', await nextReminderAt(db, SLUG, now), now + 400 - 600);
const due1 = await dueReminders(db, SLUG, now);
eq('完成后 dueReminders 只剩 207/208/209 (201 被拦住)', due1.map((e) => e.id).join(','), '207,208,209');

// 详情直达: 已完成态 + 恢复入口
const dAfter = await gql(detailQ, { variables: { slug: SLUG, id: '201' } });
eq('详情直达仍可打开, status=completed', dAfter.data?.groupingDetailPage?.grouping?.status, 'completed');
const chips = (dAfter.data?.groupingDetailPage?.blocks || []).find((b) => b.__typename === 'ChipRowBlock')?.chips || [];
check('详情 chips 含已完成', chips.includes('已完成'), JSON.stringify(chips));
const muted = (dAfter.data?.groupingDetailPage?.blocks || []).find((b) => b.__typename === 'TextBlock' && b.variant === 'muted');
eq('详情提示 = completedHint', muted?.text, '该车队已完成 · 已从列表隐藏，不再发送发车提醒');
const actsAfter = (dAfter.data?.groupingDetailPage?.blocks || []).filter((b) => b.__typename === 'ActionButtonBlock');
eq('完成后车头只剩恢复按钮', actsAfter.map((b) => b.action?.__typename).join(','), 'UncompleteAction');
eq('恢复按钮文案', actsAfter[0]?.label, '恢复车队');
const dMember = await gql(detailQ, { user: member, variables: { slug: SLUG, id: '201' } });
eq('非车头看完成车详情: 无动作按钮', (dMember.data?.groupingDetailPage?.blocks || []).filter((b) => b.__typename === 'ActionButtonBlock').length, 0);
eq('detailStatusCompletedLabel (zh)', dAfter.data?.groupingDetailPage?.detailStatusCompletedLabel, '已完成');

// v3 老客户端看完成车详情: UncompleteAction (v4) 被置空, 按钮不可点但不崩
const dV3 = await gql(detailQ.replace('blocksVersion: 4', 'blocksVersion: 3'), { variables: { slug: SLUG, id: '201' } });
const actsV3 = (dV3.data?.groupingDetailPage?.blocks || []).filter((b) => b.__typename === 'ActionButtonBlock');
eq('v3 客户端: 恢复按钮 action 被置空 (版本替代)', actsV3.length === 1 && actsV3[0].action === null, true);

// 重复完成 / 恢复闸门
const c2 = await gql(completeMut, { variables: { id: '201' } });
eq('重复完成被拒', c2.data?.completeGrouping?.ok, false);
eq('重复完成文案 (groupingAlreadyCompleted)', c2.data?.completeGrouping?.error, '该车队已是完成状态');
const rMember = await gql(reopenMut, { user: member, variables: { id: '201' } });
eq('非车头恢复被拒', rMember.data?.reopenGrouping?.ok, false);
eq('非车头恢复文案 (leaderOnlyReopen)', rMember.data?.reopenGrouping?.error, '只有车头可以恢复车队');
const rNoLeader = await gql(reopenMut, { variables: { id: '207' } });
eq('无车头记录恢复被拒 (闸门先于状态)', rNoLeader.data?.reopenGrouping?.error, '该车队未记录车头，无法恢复，请联系管理员处理');

// REST 列表: 完成车消失 (与 GraphQL 一致)
try {
  const worker = (await import('../src/worker.js')).default;
  const res = await worker.fetch(new Request(`http://local/api/${SLUG}/events?type=activity`), env, { waitUntil() {} });
  const j = await res.json();
  const ids = (j.events || []).map((e) => e.id);
  check('REST 列表不再含 201', !ids.includes(201), JSON.stringify(ids));
  check('REST 列表仍含 207', ids.includes(207));
  // REST manage: complete 是已注册动作且同闸门 — 无会话先撞 401; 未知动作 400
  const m1 = await worker.fetch(new Request(`http://local/api/${SLUG}/events/207/manage`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'complete' }),
  }), env, { waitUntil() {} });
  eq('REST manage complete 无会话 -> 401 (同闸门)', m1.status, 401);
  const m2 = await worker.fetch(new Request(`http://local/api/${SLUG}/events/207/manage`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'bogus' }),
  }), env, { waitUntil() {} });
  eq('REST manage 未知动作 -> 400', m2.status, 400);
} catch (e) {
  check('REST 列表/manage 验证', false, String(e && e.message));
}

// 车头恢复 201 -> 重现
const r1 = await gql(reopenMut, { variables: { id: '201' } });
eq('车头恢复 ok', r1.data?.reopenGrouping?.ok, true, JSON.stringify(r1.errors || r1.data));
eq('恢复后 status=open', r1.data?.reopenGrouping?.grouping?.status, 'open');
const la2 = await gql(listQ, { variables: { slug: SLUG, tab: 'ACTIVITY' } });
check('恢复后 GraphQL 列表重现 201', (la2.data?.groupingListPage?.groupings || []).some((g) => g.id === '201'));
const due2 = await dueReminders(db, SLUG, now);
check('恢复后 dueReminders 重含 201', due2.some((e) => e.id === 201));
const r2 = await gql(reopenMut, { variables: { id: '201' } });
eq('未完成车恢复被拒', r2.data?.reopenGrouping?.ok, false);
eq('未完成恢复文案 (groupingNotCompleted)', r2.data?.reopenGrouping?.error, '该车队尚未完成');
const r2en = await gql(reopenMut, { locale: 'en', variables: { id: '201' } });
eq('未完成恢复文案 (en)', r2en.data?.reopenGrouping?.error, 'This squad is not completed');

// closed 车也可完成 (从 closed 进入 completed), 再恢复回 open
const c208 = await gql(completeMut, { variables: { id: '208' } });
eq('closed 车完成 ok', c208.data?.completeGrouping?.ok, true, JSON.stringify(c208.errors || c208.data));
eq('208 status=completed', tables.events.find((e) => e.id === 208)?.status, 'completed');
const r208 = await gql(reopenMut, { variables: { id: '208' } });
eq('208 恢复 ok 且回 open (不还原 closed)', r208.data?.reopenGrouping?.grouping?.status, 'open');

if (unknownSql.size) console.log('\n[FakeDB 未路由 SQL — 已走默认空结果]\n' + [...unknownSql].join('\n'));
console.log(`\n== daycomplete harness: ${pass} pass, ${fail} fail ==`);
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
