// Grouping templates acceptance (Premium tier 2, 2026-10-26):
// guild-shared car templates. Covers: create from form values (shape
// derivation shared with createGrouping — dungeon size seats, activity
// ignores a dungeon), save-from-grouping snapshot (absolute start ->
// day offset + time-of-day in the saver's tz; timeless car defaults),
// the list on GroupingListPage (guild-scoped, newest first, template
// copy fields), manageActions composition (creator / own-guild admin
// only), update/delete gates re-verified server-side (creator, guild
// admin, omni pass; plain member and other guild's admin rejected),
// write-gate codes for anonymous / non-member callers, and validation
// errors (name/title required, bad time-of-day). Real yoga + real
// resolvers + FakeDB routed by SQL shape (guildadmin pattern).
import { yoga } from '../src/graphql.ts';
import { OMNISCIENT_VIEWER } from '../src/domains/platform/context.ts';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}
function eq(name, got, want) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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
function makeDb(fx = {}) {
  const tables = {
    tenants: (fx.tenants || []).map((t) => ({ ...t })),
    settings: new Map(fx.settings || []),
    users: new Map(fx.users || []),
    events: (fx.events || []).map((e) => ({ ...e })),
    dungeons: (fx.dungeons || []).map((d) => ({ ...d })),
    guildMembers: (fx.guildMembers || []).map((m) => ({ ...m })),
    templates: (fx.templates || []).map((t) => ({ ...t })),
    customFields: (fx.customFields || []).map((t) => ({ ...t })),
    signupAnswers: (fx.signupAnswers || []).map((t) => ({ ...t })),
  };
  let nextId = 7000;
  const unknownSql = new Set();

  function norm(sql) {
    return sql.replace(/"/g, '')
      .replace(/\b(tenants|settings|users|events|dungeons|guild_members|grouping_templates|grouping_custom_fields|signup_answers)\./g, '')
      .replace(/\s+/g, ' ');
  }
  function parseCols(list) { return list.split(',').map((c) => c.trim().split('.').pop()); }

  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    let m = /^INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)/i.exec(sql);
    if (m) {
      const [, table, colList] = m;
      const cols = parseCols(colList);
      const row = {};
      cols.forEach((c, i) => { row[c] = b[i]; });
      if (/ON CONFLICT/i.test(sql)) {
        if (table === 'settings') { tables.settings.set(`${row.tenant}|${row.key}`, row.value); return { meta: { changes: 1 } }; }
        if (table === 'guild_members') {
          const ex = tables.guildMembers.find((x) => x.tenant === row.tenant && x.discord_id === row.discord_id);
          if (ex) Object.assign(ex, row); else tables.guildMembers.push(row);
          return { meta: { changes: 1 } };
        }
      }
      row.id = nextId++;
      if (table === 'grouping_templates') tables.templates.push(row);
      else if (table === 'grouping_custom_fields') tables.customFields.push(row);
      else if (table === 'signup_answers') tables.signupAnswers.push(row);
      else if (table === 'events') tables.events.push(row);
      else if (table === 'guild_members') tables.guildMembers.push(row);
      else if (table === 'settings') tables.settings.set(`${row.tenant}|${row.key}`, row.value);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    m = /^UPDATE (\w+) SET (.+?) WHERE (.+)$/i.exec(sql);
    if (m) {
      const [, table, setList] = m;
      const setCols = setList.split(',').map((p) => p.trim().split('=')[0].trim().split('.').pop());
      const sets = {};
      setCols.forEach((c, i) => { sets[c] = b[i]; });
      const wb = b.slice(setCols.length);
      let rows = [];
      if (table === 'grouping_templates') rows = tables.templates.filter((t) => t.id === Number(wb[0]));
      else if (table === 'events') rows = tables.events.filter((e) => e.id === Number(wb[0]));
      for (const r of rows) Object.assign(r, sets);
      return { meta: { changes: rows.length } };
    }
    if (/^DELETE FROM grouping_custom_fields WHERE owner_kind/i.test(sql)) {
      const before = tables.customFields.length;
      tables.customFields = tables.customFields.filter((t) => !(t.owner_kind === b[0] && t.owner_id === Number(b[1])));
      return { meta: { changes: before - tables.customFields.length } };
    }
    if (/^DELETE FROM signup_answers WHERE event_id/i.test(sql)) {
      const before = tables.signupAnswers.length;
      tables.signupAnswers = /signup_uid/i.test(sql)
        ? tables.signupAnswers.filter((t) => !(t.event_id === Number(b[0]) && t.signup_uid === b[1]))
        : tables.signupAnswers.filter((t) => t.event_id !== Number(b[0]));
      return { meta: { changes: before - tables.signupAnswers.length } };
    }
    if (/^DELETE FROM grouping_templates WHERE id/i.test(sql)) {
      const before = tables.templates.length;
      tables.templates = tables.templates.filter((t) => t.id !== Number(b[0]));
      return { meta: { changes: before - tables.templates.length } };
    }
    if (/\b(CREATE TABLE|CREATE INDEX|ALTER TABLE|PRAGMA)\b/i.test(sql)) return kind === 'run' ? { meta: { changes: 0 } } : (kind === 'first' ? null : { results: [] });

    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });
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
    if (/FROM user_guild_nicks/i.test(sql)) return kind === 'first' ? null : all([]);
    // Governance line (P16): fixture guilds hold no officer grants.
    if (/FROM guild_officer_grants/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/SELECT \* FROM events WHERE id = \?/i.test(sql)) {
      return first(tables.events.find((e) => e.id === Number(b[0])));
    }
    if (/FROM events WHERE tenant = \? AND type = \?/i.test(sql)) {
      return all(tables.events.filter((e) => e.tenant === b[0] && e.type === b[1] && !['draft', 'completed'].includes(e.status)));
    }
    if (/FROM dungeons WHERE name = \?/i.test(sql)) {
      return first(tables.dungeons.find((d) => d.name === b[0]));
    }
    if (/FROM dungeons WHERE id = \?/i.test(sql)) {
      return first(tables.dungeons.find((d) => d.id === Number(b[0])));
    }
    if (/FROM guild_members/i.test(sql)) {
      let rows = tables.guildMembers.filter((x) => x.tenant === b[0]);
      if (/discord_id = \?/i.test(sql) && b.length > 1) rows = rows.filter((x) => x.discord_id === String(b[1]));
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    if (/FROM grouping_custom_fields WHERE owner_kind = \? AND owner_id = \?/i.test(sql)) {
      return all(tables.customFields.filter((t) => t.owner_kind === b[0] && t.owner_id === Number(b[1])).sort((a, c) => a.sort - c.sort || a.id - c.id));
    }
    if (/FROM signup_answers WHERE event_id = \?/i.test(sql)) {
      return all(tables.signupAnswers.filter((t) => t.event_id === Number(b[0])));
    }
    if (/FROM grouping_templates WHERE tenant = \?/i.test(sql)) {
      return all(tables.templates.filter((t) => t.tenant === b[0]).sort((a, c) => c.id - a.id));
    }
    if (/FROM grouping_templates WHERE id = \?/i.test(sql)) {
      return first(tables.templates.find((t) => t.id === Number(b[0])));
    }
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
const DGID_A = '111111111111111111'; // guild tpltest's server
const DGID_B = '222222222222222222'; // guild othertest's server
const serversJson = (rows) => JSON.stringify(rows);
const srv = (id, permissions = '0', owner = false) => ({ id, name: '测试服', icon: '', permissions, owner });

const CREATOR = { discordId: 'UC', name: '模板君', guilds: [DGID_A] };
const MEMBER = { discordId: 'UB', name: '成员', guilds: [DGID_A] };
const ADMIN = { discordId: 'UA', name: '管理员甲', guilds: [DGID_A] };   // ManageGuild on A
const ADMIN_B = { discordId: 'UD', name: '乙业管理员', guilds: [DGID_B] }; // admin of B only
const OUTSIDER = { discordId: 'UZ', name: '路人', guilds: [] };

// A car 3 days out at 20:30 Asia/Shanghai from the fixed "now" the save
// mutation reads (real clock) — computed dynamically so the harness is
// clock-independent: take today 20:30 CST + 3 days as the start.
function futureStartUtc(daysAhead, hour, minute) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now);
  const p = {};
  for (const x of parts) p[x.type] = Number(x.value);
  const dayMs = Date.UTC(p.year, p.month - 1, p.day) + daysAhead * 86400000;
  // 20:30 CST = 12:30 UTC (CST is UTC+8, no DST)
  return Math.floor(dayMs / 1000) + (hour - 8) * 3600 + minute * 60;
}

const A = makeDb({
  tenants: [
    { slug: 'tpltest', guild_name: '模板测试百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', discord_webhook: '', created_at: '2026-01-01 00:00:00' },
    { slug: 'othertest', guild_name: '乙百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', discord_webhook: '', created_at: '2026-01-01 00:00:00' },
    { slug: 'freetest', guild_name: '未绑定百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '', discord_webhook: '', created_at: '2026-01-01 00:00:00' },
  ],
  settings: [
    ['tpltest|discord_guild_id', DGID_A],
    ['othertest|discord_guild_id', DGID_B],
    ['|game_version', 'intl-v2.3'],
  ],
  users: [
    ['UC', serversJson([srv(DGID_A)])],
    ['UB', serversJson([srv(DGID_A)])],
    ['UA', serversJson([srv(DGID_A, '32')])],
    ['UD', serversJson([srv(DGID_B, '32')])],
  ],
  dungeons: [
    { id: 7, name: '定极分更', size: 5, version: 'intl-v2.3', is_current: 1 },
    { id: 4, name: '玉魄染青苍', size: 10, version: 'intl-v2.3', is_current: 1 },
  ],
  guildMembers: [
    { tenant: 'tpltest', discord_id: 'UC', nick: '模板君本服名', global_name: '模板君' },
  ],
  events: [
    {
      id: 401, tenant: 'tpltest', title: '周六天赋车', type: 'talent', description: '',
      starts_at: '', starts_at_utc: futureStartUtc(3, 20, 30), meet_info: '', max_slots: 5,
      status: 'open', origin: 'member', created_by: '', manage_code: '', dungeon: '定极分更',
      creator_discord_id: 'UB', reminder_sent_at: null, reminder_error: null,
    },
    {
      id: 402, tenant: 'tpltest', title: '随缘双十', type: 'activity', description: '',
      starts_at: '', starts_at_utc: null, meet_info: '', max_slots: 10,
      status: 'open', origin: 'member', created_by: '', manage_code: '', dungeon: '',
      creator_discord_id: 'UB', reminder_sent_at: null, reminder_error: null,
    },
    {
      id: 403, tenant: 'freetest', title: '公开车', type: 'activity', description: '',
      starts_at: '', starts_at_utc: null, meet_info: '', max_slots: 10,
      status: 'open', origin: 'member', created_by: '', manage_code: '', dungeon: '',
      creator_discord_id: 'UB', reminder_sent_at: null, reminder_error: null,
    },
  ],
});
const env = { DB: A.db };

async function gql(query, { user = null, variables, vc, tz = 'Asia/Shanghai' } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz, executionCtx: undefined };
  if (vc) ctx.vc = vc;
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

/* ---------------- create from form values ---------------- */
const createMut = `mutation($input: CreateGroupingTemplateInput!) {
  createGroupingTemplate(input: $input) {
    ok errorCode
    template { id name type title dungeonName dungeonId maxSlots startDaysAhead startHour startMinute creatorDiscordId creatorName manageActions { editLabel deleteLabel } }
  }
}`;
let r = await gql(createMut, {
  user: CREATOR,
  variables: { input: { slug: 'tpltest', name: '周常天赋', type: 'TALENT', title: '周常天赋车', dungeonId: '7', startsInDays: 2, startHour: 20, startMinute: 30 } },
});
eq('成员建模板 ok', r.data?.createGroupingTemplate?.ok, true);
const tpl1 = r.data?.createGroupingTemplate?.template;
eq('模板 type', tpl1?.type, 'TALENT');
eq('模板 dungeonName 由 dungeonId 解析', tpl1?.dungeonName, '定极分更');
eq('模板 dungeonId 回读', tpl1?.dungeonId, '7');
eq('席位由副本尺寸派生 (5 人本)', tpl1?.maxSlots, 5);
eq('发车偏移回读', [tpl1?.startDaysAhead, tpl1?.startHour, tpl1?.startMinute], [2, 20, 30]);
eq('创建者身份戳', tpl1?.creatorDiscordId, 'UC');
eq('创建者名走名册', tpl1?.creatorName, '模板君本服名');
check('创建者见 manageActions', !!tpl1?.manageActions);
eq('manageActions.editLabel 文案', tpl1?.manageActions?.editLabel, '编辑');
const tpl1Id = tpl1?.id;

// Activity ignores the dungeon entirely (createGrouping's own rule).
r = await gql(createMut, {
  user: MEMBER,
  variables: { input: { slug: 'tpltest', name: '双十老本', type: 'ACTIVITY', title: '双十车', dungeonId: '7', startsInDays: 0, startHour: 20, startMinute: 0 } },
});
eq('双十建模板 ok', r.data?.createGroupingTemplate?.ok, true);
eq('双十模板无副本', r.data?.createGroupingTemplate?.template?.dungeonName, null);
eq('双十模板恒 10 席', r.data?.createGroupingTemplate?.template?.maxSlots, 10);
const tpl2Id = r.data?.createGroupingTemplate?.template?.id;

// Write gates.
r = await gql(createMut, { user: null, variables: { input: { slug: 'tpltest', name: 'x', type: 'ACTIVITY', title: 'x', startsInDays: 0, startHour: 20, startMinute: 0 } } });
eq('匿名建模板 -> loginRequired', r.data?.createGroupingTemplate?.errorCode, 'loginRequired');
r = await gql(createMut, { user: OUTSIDER, variables: { input: { slug: 'tpltest', name: 'x', type: 'ACTIVITY', title: 'x', startsInDays: 0, startHour: 20, startMinute: 0 } } });
eq('非成员建模板 -> memberOnly', r.data?.createGroupingTemplate?.errorCode, 'memberOnly');

// Validation.
r = await gql(createMut, { user: CREATOR, variables: { input: { slug: 'tpltest', name: '  ', type: 'ACTIVITY', title: 'x', startsInDays: 0, startHour: 20, startMinute: 0 } } });
eq('空模板名 -> templateNameRequired', r.data?.createGroupingTemplate?.errorCode, 'templateNameRequired');
r = await gql(createMut, { user: CREATOR, variables: { input: { slug: 'tpltest', name: 'x', type: 'ACTIVITY', title: ' ', startsInDays: 0, startHour: 20, startMinute: 0 } } });
eq('空标题 -> titleRequired', r.data?.createGroupingTemplate?.errorCode, 'titleRequired');
r = await gql(createMut, { user: CREATOR, variables: { input: { slug: 'tpltest', name: 'x', type: 'ACTIVITY', title: 'x', startsInDays: 0, startHour: 24, startMinute: 0 } } });
eq('非法小时 -> templateBadStart', r.data?.createGroupingTemplate?.errorCode, 'templateBadStart');

/* ---------------- list on the list page ---------------- */
const listQ = `{ groupingListPage(slug: "tpltest", tab: ACTIVITY) {
  templateSectionTitle templateEmptyText
  groupingTemplates { id name type creatorDiscordId manageActions { deleteLabel } }
} }`;
r = await gql(listQ, { user: MEMBER });
eq('列表页模板数', r.data?.groupingListPage?.groupingTemplates?.length, 2);
eq('列表最新在前', r.data?.groupingListPage?.groupingTemplates?.[0]?.id, tpl2Id);
eq('模板区标题文案', r.data?.groupingListPage?.templateSectionTitle, '车队模板');
const memberViewTpl1 = (r.data?.groupingListPage?.groupingTemplates || []).find((t) => t.id === tpl1Id);
eq('普通成员看他人模板 manageActions 为 null', memberViewTpl1?.manageActions, null);
const memberViewOwn = (r.data?.groupingListPage?.groupingTemplates || []).find((t) => t.id === tpl2Id);
check('成员看自己模板有 manageActions', !!memberViewOwn?.manageActions);
r = await gql(listQ, { user: ADMIN });
const adminViewTpl1 = (r.data?.groupingListPage?.groupingTemplates || []).find((t) => t.id === tpl1Id);
check('本百业管理员看他人模板有 manageActions', !!adminViewTpl1?.manageActions);
r = await gql(listQ.replaceAll('tpltest', 'othertest'), { user: ADMIN_B });
eq('乙百业列表看不到甲百业模板', r.data?.groupingListPage?.groupingTemplates?.length, 0);
r = await gql(listQ, { user: null });
check('匿名查列表页 -> 报错 (成员可见门)', Array.isArray(r.errors) && r.errors.length > 0);

/* ---------------- save from an existing car ---------------- */
const saveMut = `mutation($input: SaveGroupingTemplateInput!) {
  saveGroupingTemplate(input: $input) {
    ok errorCode
    template { id name type title dungeonName maxSlots startDaysAhead startHour startMinute creatorDiscordId }
  }
}`;
r = await gql(saveMut, { user: MEMBER, variables: { input: { groupingId: '401', name: '周六天赋存档' } } });
eq('从车存模板 ok', r.data?.saveGroupingTemplate?.ok, true);
const saved = r.data?.saveGroupingTemplate?.template;
eq('快照字段逐项', saved && [saved.type, saved.title, saved.dungeonName, saved.maxSlots], ['TALENT', '周六天赋车', '定极分更', 5]);
eq('快照偏移 = 3 天后 20:30 (Asia/Shanghai)', saved && [saved.startDaysAhead, saved.startHour, saved.startMinute], [3, 20, 30]);
eq('快照创建者 = 保存者', saved?.creatorDiscordId, 'UB');
r = await gql(saveMut, { user: MEMBER, variables: { input: { groupingId: '402' } } });
eq('无时间车存模板 ok', r.data?.saveGroupingTemplate?.ok, true);
eq('无时间车默认今天 20:00', r.data?.saveGroupingTemplate?.template && [r.data.saveGroupingTemplate.template.startDaysAhead, r.data.saveGroupingTemplate.template.startHour, r.data.saveGroupingTemplate.template.startMinute], [0, 20, 0]);
r = await gql(saveMut, { user: MEMBER, variables: { input: { groupingId: '999' } } });
eq('存不存在的车 -> groupingNotFound', r.data?.saveGroupingTemplate?.errorCode, 'groupingNotFound');
r = await gql(saveMut, { user: OUTSIDER, variables: { input: { groupingId: '401' } } });
eq('非成员存模板 -> memberOnly', r.data?.saveGroupingTemplate?.errorCode, 'memberOnly');

/* ---------------- update / delete gates ---------------- */
const updateMut = `mutation($id: ID!, $input: GroupingTemplateInput!) {
  updateGroupingTemplate(id: $id, input: $input) { ok errorCode template { id name title startDaysAhead } }
}`;
const updInput = { name: '改名模板', type: 'TALENT', title: '改后标题', dungeonId: '4', startsInDays: 1, startHour: 21, startMinute: 0 };
r = await gql(updateMut, { user: MEMBER, variables: { id: tpl1Id, input: updInput } });
eq('他人改模板 -> templateForbidden', r.data?.updateGroupingTemplate?.errorCode, 'templateForbidden');
r = await gql(updateMut, { user: ADMIN_B, variables: { id: tpl1Id, input: updInput } });
eq('乙百业管理员改甲模板 -> memberOnly (按模板所属百业判定)', r.data?.updateGroupingTemplate?.errorCode, 'memberOnly');
r = await gql(updateMut, { user: ADMIN, variables: { id: tpl1Id, input: updInput } });
eq('本百业管理员改模板 ok', r.data?.updateGroupingTemplate?.ok, true);
eq('改后字段 (副本换 10 人本)', r.data?.updateGroupingTemplate?.template?.name, '改名模板');
r = await gql(updateMut, { user: CREATOR, variables: { id: tpl1Id, input: { ...updInput, name: '创建者再改' } } });
eq('创建者改模板 ok', r.data?.updateGroupingTemplate?.ok, true);
r = await gql(updateMut, { user: CREATOR, variables: { id: '99999', input: updInput } });
eq('改不存在的模板 -> templateNotFound', r.data?.updateGroupingTemplate?.errorCode, 'templateNotFound');
r = await gql(updateMut, { user: null, vc: OMNISCIENT_VIEWER, variables: { id: tpl1Id, input: { ...updInput, name: 'omni 改' } } });
eq('omni 改模板 ok', r.data?.updateGroupingTemplate?.ok, true);

const deleteMut = `mutation($id: ID!) { deleteGroupingTemplate(id: $id) { ok errorCode } }`;
r = await gql(deleteMut, { user: MEMBER, variables: { id: tpl1Id } });
eq('他人删模板 -> templateForbidden', r.data?.deleteGroupingTemplate?.errorCode, 'templateForbidden');
r = await gql(deleteMut, { user: ADMIN, variables: { id: tpl1Id } });
eq('本百业管理员删模板 ok', r.data?.deleteGroupingTemplate?.ok, true);
eq('删后仓储无行', A.tables.templates.some((t) => String(t.id) === String(tpl1Id)), false);
r = await gql(deleteMut, { user: ADMIN, variables: { id: tpl1Id } });
eq('再删 -> templateNotFound', r.data?.deleteGroupingTemplate?.errorCode, 'templateNotFound');

/* ---------------- detail page templateSave composition ---------------- */
const detailQ = `{ groupingDetailPage(slug: "tpltest", id: "401") { templateSave { buttonLabel dialogTitle submitLabel } } }`;
r = await gql(detailQ, { user: MEMBER });
eq('成员详情页有 templateSave', r.data?.groupingDetailPage?.templateSave?.buttonLabel, '📋 存为模板');
r = await gql(detailQ, { user: OUTSIDER });
check('绑定百业非成员详情页 -> 报错 (按不存在处理)', Array.isArray(r.errors) && r.errors.length > 0);
// Unbound guild: anyone may view, nobody may write -> templateSave null.
r = await gql(`{ groupingDetailPage(slug: "freetest", id: "403") { templateSave { buttonLabel } } }`, { user: MEMBER });
eq('未绑定百业详情页 templateSave 为 null', r.data?.groupingDetailPage?.templateSave, null);

check('无未路由 SQL', A.unknownSql.size === 0, [...A.unknownSql].join(' | '));

console.log(`\nHARNESS pass=${pass} fail=${fail}`);
if (fail) { console.log('FAILS:', fails.join(' | ')); process.exit(1); }
