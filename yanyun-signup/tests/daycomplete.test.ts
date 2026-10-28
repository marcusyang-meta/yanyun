// Completed state + per-day list grouping acceptance: real yoga +
// graphql.ts resolvers + real reminder functions + real worker fetch;
// FakeDB routes faithfully by SQL shape (status filtering/sorting are
// executed in FakeDB per the SQL text's semantics, not hardcoded).
// A: completeGrouping/reopenGrouping gates (creator / no creator /
//     official car / signed out) -> disappears from lists (GraphQL
//     groupings + Block tree) and the REST list -> detail deep-link
//     still opens (completed state + restore entry) -> reminder
//     filtering (nextReminderAt / dueReminders, including the
//     "completed after the alarm was already queued" case) -> reappears
//     after restore.
// B: week frame unchanged; within one screen the Block tree groups by
//     the viewer's local day (SectionHeader group heads sent as full
//     sentences; group dates ascending, times ascending within a group
//     — including two same-day cars whose SQL order is scrambled);
//     week-boundary behavior (end-of-week car in, next-week car not in
//     this week / in next week); Web contract fields
//     (dayGroupHeaderTemplate / weekdayNames / undatedGroupLabel).
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { typeDefs } from '../src/graphql-schema.ts';
import { nextReminderAt, dueReminderBeats } from '../src/domains/groupings/reminder.ts';
import { weekWindowUtc, localDayParts } from '../src/domains/platform/blocks.ts';
import { translate } from '../src/domains/platform/i18n.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: unknown, want: unknown) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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
const D1 = ws + 2 * 86400; // A day inside this week (Wednesday, from 05:00 Beijing time).
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
    // Group A (activity): reminder/completion chain.
    ev(201, { title: '提醒车', starts_at_utc: now + 300 }),
    ev(207, { title: '无车头老车', creator_discord_id: null, starts_at_utc: now + 400 }),
    ev(208, { title: '已关闭待完成车', status: 'closed', starts_at_utc: now + 500 }),
    ev(209, { title: '官方车', origin: 'official', starts_at_utc: now + 600 }),
    // Group B (talent): per-day grouping — two same-day cars (SQL order puts open first; within the group they must be re-sorted by time).
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

// List ordering matches the product SQL: open first, starts_at_utc ascending (nulls last), id descending.
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
  // Data-layer (Drizzle) SQL normalization: strip quotes + settings. qualifiers (routing match only).
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
        // Data-layer point lookups use the .all() channel (drizzle db.get): same shape as first()'s settings branch.
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
      if (/MIN\(starts_at_utc\) AS m FROM events/.test(sql)) {
        // Data-layer point lookups use the .all() channel (drizzle db.get): same shape as first()'s MIN branch.
        const rows = pendingFilter(b, false);
        return { results: [{ m: rows.length ? Math.min(...rows.map((e) => e.starts_at_utc)) : null }] };
      }
      if (/FROM events WHERE id = \?/.test(sql)) {
        // Data-layer point lookups use the .all() channel (drizzle db.get): full row/subset, same as first()'s by-id branch.
        const row = tables.events.find((e) => e.id === Number(b[0])) || null;
        return { results: row ? [row] : [] };
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
      if (/SELECT id, starts_at_utc FROM events/.test(sql)) {
        // Multi-beat scheduling: pending (legacy-unsettled) starts list.
        return { results: pendingFilter(b, false)
          .sort((a, c) => a.starts_at_utc - c.starts_at_utc || a.id - c.id)
          .map((e) => ({ id: e.id, starts_at_utc: e.starts_at_utc })) };
      }
      if (/FROM events WHERE tenant = \? AND id IN/.test(sql)) {
        // Multi-beat scheduling: full rows for planned groupings.
        return { results: tables.events
          .filter((e) => e.tenant === b[0] && b.slice(1).map(Number).includes(e.id))
          .sort((a, c) => a.starts_at_utc - c.starts_at_utc || a.id - c.id) };
      }
      if (/FROM event_reminders/.test(sql)) {
        // No beat in this fixture ever settles.
        return { results: [] };
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
      if (/^UPDATE events SET status = \? WHERE id = \?/.test(sql)) {
        // Data-layer setEventStatus: status comes via a binding (equivalent branch to the old literal form).
        const row = tables.events.find((e) => e.id === Number(b[1]));
        if (row) row.status = b[0];
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

const listTextQ = `query($slug: String!, $tab: GroupingTab!) {
  groupingListPage(slug: $slug, tab: $tab) {
    dayGroupHeaderTemplate weekdayNames undatedGroupLabel
    groupings { id status }
  }
}`;

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

const seatQ = `query($slug: String, $id: ID!) {
  groupingDetailPage(slug: $slug, id: $id) {
    blocks(blocksVersion: 4) {
      __typename
      ... on SeatGridBlock { seats { index occupied nickname isLeader } }
      ... on SectionBlock { children { __typename
        ... on SeatGridBlock { seats { index occupied nickname isLeader } }
      } }
    }
  }
}`;
function findSeats(page) {
  const flat = [];
  const walk = (bs) => { for (const b of bs || []) { flat.push(b); if (b.children) walk(b.children); } };
  walk(page?.blocks);
  return flat.find((b) => b.__typename === 'SeatGridBlock')?.seats || [];
}

describe('daycomplete', () => {
  /* ---------------- Schema contract ---------------- */
  it('Schema contract', () => {
    check('schema: Mutation.completeGrouping', typeDefs.includes('completeGrouping(id: ID!): GroupingPayload!'));
    check('schema: Mutation.reopenGrouping', typeDefs.includes('reopenGrouping(id: ID!): GroupingPayload!'));
    check('schema: CompleteAction 类型', /type CompleteAction implements Action/.test(typeDefs));
    check('schema: UncompleteAction 类型', /type UncompleteAction implements Action/.test(typeDefs));
    for (const f of ['dayGroupHeaderTemplate', 'weekdayNames', 'undatedGroupLabel', 'detailCompleteLabel', 'detailStatusCompletedLabel', 'detailRestoreLabel', 'detailCompletedHint']) {
      check('schema: 字段 ' + f, typeDefs.includes(f + ':'));
    }
  });

  /* ---------------- B: Web contract copy fields ---------------- */
  it('B: Web contract copy fields', async () => {
    const ltext = await gql(listTextQ, { variables: { slug: SLUG, tab: 'ACTIVITY' } });
    eq('dayGroupHeaderTemplate (zh)', ltext.data?.groupingListPage?.dayGroupHeaderTemplate, '{month}月{day}日 {weekday}');
    eq('weekdayNames[0] (zh, 周日)', ltext.data?.groupingListPage?.weekdayNames?.[0], '周日');
    eq('weekdayNames[1] (zh, 周一)', ltext.data?.groupingListPage?.weekdayNames?.[1], '周一');
    eq('weekdayNames 长度 7', ltext.data?.groupingListPage?.weekdayNames?.length, 7);
    eq('undatedGroupLabel (zh)', ltext.data?.groupingListPage?.undatedGroupLabel, '未定时间');
    const ltextEn = await gql(listTextQ, { variables: { slug: SLUG, tab: 'ACTIVITY' }, locale: 'en' });
    eq('weekdayNames[1] (en)', ltextEn.data?.groupingListPage?.weekdayNames?.[1], 'Mon');
    eq('undatedGroupLabel (en)', ltextEn.data?.groupingListPage?.undatedGroupLabel, 'Time TBD');
  });

  /* ---------------- B: Block tree grouped by day ---------------- */
  it('B: Block tree grouped by day', async () => {
    const bk = await gql(listBlocksQ, { variables: { slug: SLUG, tab: 'TALENT', wo: 0, bv: 4 } });
    const seq = seqOf(bk.data?.groupingListPage?.blocks);
    const p1 = localDayParts(D1 + 3600, 'Asia/Shanghai');
    const h1 = translate('groupingList_dayGroupHeader', 'zh-CN', {
      month: p1.month, day: p1.day, weekday: translate('groupingList_weekday' + p1.weekday, 'zh-CN'),
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
    // Old client (v3): SectionHeaderBlock is a v1 block; group heads are still sent, not substituted.
    const bkV3 = await gql(listBlocksQ, { variables: { slug: SLUG, tab: 'TALENT', wo: 0, bv: 3 } });
    const seqV3 = seqOf(bkV3.data?.groupingListPage?.blocks);
    eq('v3 客户端组头数仍为 3 (无 Fallback 替代)', seqV3.filter((x) => x.startsWith('H:')).length, 3);
  });

  /* ---------------- A: completion chain ---------------- */
  it('A: completion chain', async () => {
    // Reminder baseline: 201 is the earliest car pending a reminder (the alarm is already queued for it).
    eq('基线 nextReminderAt = 201 出发-600', await nextReminderAt(db, SLUG, now), now + 300 - 600);
    const due0 = (await dueReminderBeats(db, SLUG, now)).map((x) => x.ev);
    eq('基线 dueReminders 含 201/207/208/209 (官方车也在提醒口径内)', due0.map((e) => e.id).join(','), '201,207,208,209');

    // Gates: signed out / not the creator / no creator record / official car.
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

    /* ---------------- A2: seat creator marker isLeader ---------------- */
    const seats201 = findSeats((await gql(seatQ, { variables: { slug: SLUG, id: '201' } })).data?.groupingDetailPage);
    eq('isLeader 车头座位 (201#0)', seats201[0]?.isLeader, true);
    eq('isLeader 空位 (201#1)', seats201[1]?.isLeader, false);
    eq('isLeader 全场恰一位车头 (201)', seats201.filter((s) => s.isLeader).length, 1);
    const seats207 = findSeats((await gql(seatQ, { variables: { slug: SLUG, id: '207' } })).data?.groupingDetailPage);
    eq('isLeader 无车头记录车全 false (207)', seats207.every((s) => s.isLeader === false), true);

    // Detail tree before completion: the creator has CompleteAction.
    const dBefore = await gql(detailQ, { variables: { slug: SLUG, id: '201' } });
    const actsBefore = (dBefore.data?.groupingDetailPage?.blocks || []).filter((b) => b.__typename === 'ActionButtonBlock').map((b) => b.action?.__typename);
    eq('完成前车头动作集 = Edit/Complete/Disband', actsBefore.join(','), 'EditAction,CompleteAction,DisbandAction');
    eq('detailCompleteLabel (zh)', dBefore.data?.groupingDetailPage?.detailCompleteLabel, '完成车队');

    // Creator completes 201.
    const c1 = await gql(completeMut, { variables: { id: '201' } });
    eq('车头完成 ok', c1.data?.completeGrouping?.ok, true, JSON.stringify(c1.errors || c1.data));
    eq('完成后 status=completed', c1.data?.completeGrouping?.grouping?.status, 'completed');
    eq('DB 行 status=completed', tables.events.find((e) => e.id === 201)?.status, 'completed');

    // Disappears from lists (GraphQL groupings + Block tree).
    const la = await gql(listQ, { variables: { slug: SLUG, tab: 'ACTIVITY' } });
    check('GraphQL 列表不再含 201', !(la.data?.groupingListPage?.groupings || []).some((g) => g.id === '201'));
    check('GraphQL 列表仍含 207/208', ['207', '208'].every((id) => (la.data?.groupingListPage?.groupings || []).some((g) => g.id === id)));
    const bkA = await gql(listBlocksQ, { variables: { slug: SLUG, tab: 'ACTIVITY', wo: 0, bv: 4 } });
    check('Block 树不再含卡片 201', !seqOf(bkA.data?.groupingListPage?.blocks).includes('C:201'));

    // Reminder filtering: the alarm was already queued for 201; after completion, the due-time recheck (dueReminders) must block it.
    eq('完成后 nextReminderAt 移到 207', await nextReminderAt(db, SLUG, now), now + 400 - 600);
    const due1 = (await dueReminderBeats(db, SLUG, now)).map((x) => x.ev);
    eq('完成后 dueReminders 只剩 207/208/209 (201 被拦住)', due1.map((e) => e.id).join(','), '207,208,209');

    // Detail deep-link: completed state + restore entry.
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

    // v3 old client viewing a completed car: UncompleteAction (v4) is nulled — the button is unclickable but nothing crashes.
    const dV3 = await gql(detailQ.replace('blocksVersion: 4', 'blocksVersion: 3'), { variables: { slug: SLUG, id: '201' } });
    const actsV3 = (dV3.data?.groupingDetailPage?.blocks || []).filter((b) => b.__typename === 'ActionButtonBlock');
    eq('v3 客户端: 恢复按钮 action 被置空 (版本替代)', actsV3.length === 1 && actsV3[0].action === null, true);

    // Repeat completion / restore gates.
    const c2 = await gql(completeMut, { variables: { id: '201' } });
    eq('重复完成被拒', c2.data?.completeGrouping?.ok, false);
    eq('重复完成文案 (groupingAlreadyCompleted)', c2.data?.completeGrouping?.error, '该车队已是完成状态');
    const rMember = await gql(reopenMut, { user: member, variables: { id: '201' } });
    eq('非车头恢复被拒', rMember.data?.reopenGrouping?.ok, false);
    eq('非车头恢复文案 (leaderOnlyReopen)', rMember.data?.reopenGrouping?.error, '只有车头可以恢复车队');
    const rNoLeader = await gql(reopenMut, { variables: { id: '207' } });
    eq('无车头记录恢复被拒 (闸门先于状态)', rNoLeader.data?.reopenGrouping?.error, '该车队未记录车头，无法恢复，请联系管理员处理');

    // Public-surface consistency at the same flow point (the REST list
    // checks retired with product REST — the GraphQL list disappearance
    // is asserted above; here the OG card channel and the mutation
    // gates carry the equivalent properties).
    try {
      const anon = await gql(completeMut, { user: null, variables: { id: '207' } });
      check('无会话 completeGrouping 被拒 (与旧 manage 同闸门)', anon.data?.completeGrouping?.ok === false, JSON.stringify(anon.data || anon.errors).slice(0, 160));
      const bogus = await gql(`mutation { bogusAction(id: "207") { ok } }`, { variables: {} });
      check('未知动作被 schema 拒绝 (与旧 manage 400 等价)', Array.isArray(bogus.errors) && bogus.errors.length > 0, JSON.stringify(bogus).slice(0, 160));
      const card201 = await gql(`query($slug: String!, $id: ID!) { ogCarCard(slug: $slug, id: $id) { status } }`, { user: null, variables: { slug: SLUG, id: '201' } });
      eq('OG 车卡 201 状态 = completed', card201.data?.ogCarCard?.status, 'completed');
      const card207 = await gql(`query($slug: String!, $id: ID!) { ogCarCard(slug: $slug, id: $id) { title status } }`, { user: null, variables: { slug: SLUG, id: '207' } });
      check('OG 车卡 207 可读且 open', card207.data?.ogCarCard?.status === 'open' && typeof card207.data?.ogCarCard?.title === 'string', JSON.stringify(card207.data || card207.errors).slice(0, 160));
    } catch (e) {
      check('公开面/manage 等价验证', false, String(e && e.message));
    }

    // Creator restores 201 -> it reappears.
    const r1 = await gql(reopenMut, { variables: { id: '201' } });
    eq('车头恢复 ok', r1.data?.reopenGrouping?.ok, true, JSON.stringify(r1.errors || r1.data));
    eq('恢复后 status=open', r1.data?.reopenGrouping?.grouping?.status, 'open');
    const la2 = await gql(listQ, { variables: { slug: SLUG, tab: 'ACTIVITY' } });
    check('恢复后 GraphQL 列表重现 201', (la2.data?.groupingListPage?.groupings || []).some((g) => g.id === '201'));
    const due2 = (await dueReminderBeats(db, SLUG, now)).map((x) => x.ev);
    check('恢复后 dueReminders 重含 201', due2.some((e) => e.id === 201));
    const r2 = await gql(reopenMut, { variables: { id: '201' } });
    eq('未完成车恢复被拒', r2.data?.reopenGrouping?.ok, false);
    eq('未完成恢复文案 (groupingNotCompleted)', r2.data?.reopenGrouping?.error, '该车队尚未完成');
    const r2en = await gql(reopenMut, { locale: 'en', variables: { id: '201' } });
    eq('未完成恢复文案 (en)', r2en.data?.reopenGrouping?.error, 'This squad is not completed');

    // A closed car can also be completed (closed -> completed), then restored back to open.
    const c208 = await gql(completeMut, { variables: { id: '208' } });
    eq('closed 车完成 ok', c208.data?.completeGrouping?.ok, true, JSON.stringify(c208.errors || c208.data));
    eq('208 status=completed', tables.events.find((e) => e.id === 208)?.status, 'completed');
    const r208 = await gql(reopenMut, { variables: { id: '208' } });
    eq('208 恢复 ok 且回 open (不还原 closed)', r208.data?.reopenGrouping?.grouping?.status, 'open');

    if (unknownSql.size) console.log('\n[FakeDB 未路由 SQL — 已走默认空结果]\n' + [...unknownSql].join('\n'));
  });
});
