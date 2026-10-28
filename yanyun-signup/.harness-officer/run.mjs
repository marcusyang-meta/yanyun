// Officer tools acceptance (free officer tools line F12/F11/F19):
//  - F12 notes: the admin verdict gates every note write (anonymous /
//    plain member / admin of ANOTHER guild -> adminOnly); the target
//    must be on the guild's roster (officerMemberNotFound); body shape
//    (empty -> officerNoteBodyRequired, >500 -> officerNoteBodyTooLong)
//    stores nothing on rejection. Notes live ONLY on the GuildAdmin
//    officer page: a member's guildAdmin resolves GuildAdminLocked
//    with no officer field, and the member Guild type has no officer
//    field in the schema at all (querying it is a validation error) —
//    invisibility by response type, not by client hiding. Updates and
//    deletes resolve the note inside the caller's guild (a foreign
//    guild's note id -> officerNoteNotFound).
//  - F19 goals: anonymous -> loginRequired; a non-member of the guild
//    -> memberOnly; title/note shape codes; a dungeon binding must
//    name a real dungeon row (seasonGoalDungeonNotFound) and composes
//    the dungeon name + season name from backend data; a member can
//    update/delete ONLY their own goal (another member's goal id ->
//    seasonGoalNotFound, the row untouched). The settings page
//    (settingsPage.seasonGoals) lists the caller's goals across
//    guilds; the officer overview shows them read-only per member.
//  - F11 export: admin-only, guild-scoped. The package parses as
//    'guild-export v1' JSON: roster + this guild's groupings with
//    participants + season goals; the other guild's rows never leak;
//    officer notes are NOT part of the package; the export leaves
//    exactly one hub_audit_log row (action guild.export, tenant set,
//    actor = the exporting admin, counts-only summary).
// Real yoga + real resolvers + FakeDB routing by SQL shape into
// in-memory tables (same pattern as .harness-announcements).
import { yoga } from '../src/graphql.ts';
import { typeDefs } from '../src/graphql-schema.ts';

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
      { slug: 'alpha', guild_name: '甲百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '' },
      { slug: 'beta', guild_name: '乙百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '' },
    ],
    settings: new Map([
      ['alpha|discord_guild_id', 'DG1'],
      ['beta|discord_guild_id', 'DG2'],
    ]),
    users: new Map([
      ['A1', JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '8', owner: false }])],
      ['M1', JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '0', owner: false }])],
      ['M2', JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '0', owner: false }])],
      ['B1', JSON.stringify([{ id: 'DG2', name: 'S2', permissions: '8', owner: false }])],
    ]),
    guildMembers: [
      { tenant: 'alpha', discord_id: 'A1', nick: '管理员甲', global_name: 'AdminA' },
      { tenant: 'alpha', discord_id: 'M1', nick: '成员一', global_name: 'MemberOne' },
      { tenant: 'alpha', discord_id: 'M2', nick: '', global_name: '成员二' },
      { tenant: 'beta', discord_id: 'B1', nick: '乙管理员', global_name: 'AdminB' },
    ],
    // EventRow key order: id, tenant, title, type, description, starts_at,
    // meet_info, max_slots, status, starts_at_utc, origin, created_by,
    // manage_code, dungeon, creator_discord_id, reminder_sent_at, reminder_error
    events: [
      { id: 11, tenant: 'alpha', title: '周六双十人', type: 'activity', description: '', starts_at: null, meet_info: '', max_slots: 20, status: 'completed', starts_at_utc: 1760000000, origin: 'web', created_by: '管理员甲', manage_code: '', dungeon: '试炼本', creator_discord_id: 'A1', reminder_sent_at: null, reminder_error: null },
      { id: 12, tenant: 'alpha', title: '周三爬塔', type: 'tower', description: '', starts_at: null, meet_info: '', max_slots: 10, status: 'open', starts_at_utc: 1760100000, origin: 'web', created_by: '成员一', manage_code: '', dungeon: '', creator_discord_id: 'M1', reminder_sent_at: null, reminder_error: null },
      { id: 21, tenant: 'beta', title: '乙百业活动', type: 'activity', description: '', starts_at: null, meet_info: '', max_slots: 20, status: 'open', starts_at_utc: 1760200000, origin: 'web', created_by: '乙管理员', manage_code: '', dungeon: '', creator_discord_id: 'B1', reminder_sent_at: null, reminder_error: null },
    ],
    // SignupRow key order: id, event_id, nickname, uid, role, weapon,
    // contact, note, team_name, members, created_at, discord_id, ready_at
    signups: [
      { id: 1, event_id: 11, nickname: '成员一', uid: 'u1', role: '输出', weapon: '破竹', contact: '', note: '', team_name: '', members: '', created_at: '2026-10-01 10:00:00', discord_id: 'M1', ready_at: null },
      { id: 2, event_id: 11, nickname: '成员二', uid: 'u2', role: '奶', weapon: '万丝', contact: '', note: '', team_name: '', members: '', created_at: '2026-10-01 10:01:00', discord_id: 'M2', ready_at: null },
      { id: 3, event_id: 12, nickname: '成员一', uid: 'u1', role: '输出', weapon: '破竹', contact: '', note: '', team_name: '', members: '', created_at: '2026-10-02 10:00:00', discord_id: 'M1', ready_at: null },
      { id: 4, event_id: 21, nickname: '乙管理员', uid: 'u9', role: '输出', weapon: '破竹', contact: '', note: '', team_name: '', members: '', created_at: '2026-10-03 10:00:00', discord_id: 'B1', ready_at: null },
    ],
    // DungeonRow key order: id, name, size, is_current, sort_order,
    // video_url, video_title, season, category, level, version
    dungeons: [
      { id: 7, name: '试炼本', size: 10, is_current: 1, sort_order: 1, video_url: '', video_title: '', season: 'S5', category: '传薪', level: 100, version: 'intl-v2.3' },
    ],
    notes: [], // guild_member_notes rows
    goals: [], // member_season_goals rows
    audit: [], // hub_audit_log rows
  };
  let nextNoteId = 100;
  let nextGoalId = 200;

  function norm(sql) {
    return sql.replace(/"/g, '')
      .replace(/\b(tenants|settings|users|guild_members|guild_member_notes|member_season_goals|events|signups|dungeons|hub_audit_log|guild_entitlements)\./g, '')
      .replace(/\s+/g, ' ');
  }

  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });

    /* officer notes */
    if (/^INSERT INTO guild_member_notes/i.test(sql)) {
      const [tenant, memberDiscordId, body, authorId, authorName, createdAt, updatedAt] = b;
      const row = { id: nextNoteId++, tenant, member_discord_id: memberDiscordId, body, author_discord_id: authorId, author_name: authorName, created_at: createdAt, updated_at: updatedAt };
      state.notes.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    if (/^UPDATE guild_member_notes/i.test(sql)) {
      const [body, updatedAt, tenant, id] = b;
      const row = state.notes.find((r) => r.tenant === tenant && r.id === Number(id));
      if (!row) return { meta: { changes: 0 } };
      row.body = body; row.updated_at = updatedAt;
      return { meta: { changes: 1 } };
    }
    if (/^DELETE FROM guild_member_notes/i.test(sql)) {
      const before = state.notes.length;
      state.notes = state.notes.filter((r) => !(r.tenant === b[0] && r.id === Number(b[1])));
      return { meta: { changes: before - state.notes.length } };
    }
    if (/FROM guild_member_notes/i.test(sql)) {
      let rows = state.notes.filter((r) => r.tenant === b[0]);
      if (/AND id =/i.test(sql)) {
        const row = rows.find((r) => r.id === Number(b[1]));
        return first(row ? { ...row } : null);
      }
      if (/member_discord_id =/i.test(sql)) rows = rows.filter((r) => r.member_discord_id === b[1]);
      return all(rows.map((r) => ({ ...r })));
    }
    /* season goals */
    if (/^INSERT INTO member_season_goals/i.test(sql)) {
      const [tenant, discordId, memberName, title, note, status, dungeonId, createdAt, updatedAt] = b;
      const row = { id: nextGoalId++, tenant, discord_id: discordId, member_name: memberName, title, note, status, dungeon_id: dungeonId, created_at: createdAt, updated_at: updatedAt };
      state.goals.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    if (/^UPDATE member_season_goals/i.test(sql)) {
      const [title, note, status, dungeonId, memberName, updatedAt, tenant, discordId, id] = b;
      const row = state.goals.find((r) => r.tenant === tenant && r.discord_id === discordId && r.id === Number(id));
      if (!row) return { meta: { changes: 0 } };
      Object.assign(row, { title, note, status, dungeon_id: dungeonId, member_name: memberName, updated_at: updatedAt });
      return { meta: { changes: 1 } };
    }
    if (/^DELETE FROM member_season_goals/i.test(sql)) {
      const before = state.goals.length;
      state.goals = state.goals.filter((r) => !(r.tenant === b[0] && r.discord_id === b[1] && r.id === Number(b[2])));
      return { meta: { changes: before - state.goals.length } };
    }
    if (/FROM member_season_goals/i.test(sql)) {
      if (/WHERE id =/i.test(sql)) {
        const row = state.goals.find((r) => r.id === Number(b[0]));
        return first(row ? { ...row } : null);
      }
      let rows = [...state.goals];
      if (/tenant = \? AND discord_id =/i.test(sql)) rows = rows.filter((r) => r.tenant === b[0] && r.discord_id === b[1]);
      else if (/WHERE discord_id =/i.test(sql)) rows = rows.filter((r) => r.discord_id === b[0]);
      else if (/WHERE tenant =/i.test(sql)) rows = rows.filter((r) => r.tenant === b[0]);
      rows.sort((x, y) => y.id - x.id);
      return all(rows.map((r) => ({ ...r })));
    }
    /* guild export reads: events (admin list) + signups per event */
    if (/FROM events/i.test(sql)) {
      const rows = state.events
        .filter((e) => e.tenant === b[0])
        .sort((x, y) => y.id - x.id)
        .map((e) => ({ ...e, signup_count: state.signups.filter((s) => s.event_id === e.id).length }));
      return all(rows);
    }
    if (/FROM signups/i.test(sql)) {
      return all(state.signups.filter((s) => s.event_id === Number(b[0])).map((s) => ({ ...s })));
    }
    if (/FROM dungeons/i.test(sql)) {
      if (/WHERE id =/i.test(sql)) {
        const row = state.dungeons.find((d) => d.id === Number(b[0]));
        return first(row ? { ...row } : null);
      }
      return all(state.dungeons.map((d) => ({ ...d })));
    }
    /* audit trail */
    if (/^INSERT INTO hub_audit_log/i.test(sql)) {
      const [at, actor, action, tenant, summary, ip] = b;
      state.audit.push({ at, actor, action, tenant, summary, ip });
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
      if (/WHERE discord_id =/i.test(sql)) {
        return all(state.guildMembers.filter((m) => m.discord_id === b[0]).map((m) => ({ tenant: m.tenant, nick: m.nick, global_name: m.global_name })));
      }
      return all(state.guildMembers.filter((m) => m.tenant === b[0]).map((m) => ({ ...m })));
    }
    if (/FROM guild_entitlements/i.test(sql)) return first(null);
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
const adminB = { discordId: 'B1', name: '乙管理员', guilds: ['DG2'] };
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

/* ================= schema shape: notes exist only on the admin surface ================= */
{
  check('SDL: GuildOfficerPage 只挂 GuildAdmin (officer 字段仅出现一次)', (typeDefs.match(/officer: GuildOfficerPage!/g) || []).length === 1);
  const guildType = /type Guild \{([\s\S]*?)\n\}/.exec(typeDefs)?.[1] || '';
  check('SDL: 成员 Guild 类型不带 officer/备注字段', !/officer|Note/.test(guildType), guildType.slice(0, 80));
}

/* ================= F12: verdict + roster + shape ================= */
const addNoteMut = `mutation($slug: String!, $m: ID!, $body: String!) {
  addGuildMemberNote(slug: $slug, memberDiscordId: $m, body: $body) {
    ok error errorCode note { id body authorName authorText } } }`;
const addNote = (user, slug, m, body) => gql(addNoteMut, { user, variables: { slug, m, body } });
let noteId;
{
  eq('匿名加备注 -> adminOnly', (await addNote(null, 'alpha', 'M1', 'x')).data?.addGuildMemberNote?.errorCode, 'adminOnly');
  eq('普通成员加备注 -> adminOnly', (await addNote(member1, 'alpha', 'M1', 'x')).data?.addGuildMemberNote?.errorCode, 'adminOnly');
  eq('他百业管理员加备注 -> adminOnly (跨百业不串权)', (await addNote(adminB, 'alpha', 'M1', 'x')).data?.addGuildMemberNote?.errorCode, 'adminOnly');
  eq('不存在的百业 -> guildNotFound', (await addNote(adminA, 'nope', 'M1', 'x')).data?.addGuildMemberNote?.errorCode, 'guildNotFound');
  eq('目标不在名册 -> officerMemberNotFound', (await addNote(adminA, 'alpha', 'X9', 'x')).data?.addGuildMemberNote?.errorCode, 'officerMemberNotFound');
  eq('空备注 -> officerNoteBodyRequired', (await addNote(adminA, 'alpha', 'M1', '   ')).data?.addGuildMemberNote?.errorCode, 'officerNoteBodyRequired');
  eq('备注 501 字 -> officerNoteBodyTooLong', (await addNote(adminA, 'alpha', 'M1', '备'.repeat(501))).data?.addGuildMemberNote?.errorCode, 'officerNoteBodyTooLong');
  eq('拒绝不落库', state.notes.length, 0);

  const r = await addNote(adminA, 'alpha', 'M1', '  经常迟到，需关注  ');
  eq('管理员加备注 -> ok', r.data?.addGuildMemberNote?.ok, true);
  noteId = r.data?.addGuildMemberNote?.note?.id;
  eq('落库一行', state.notes.length, 1);
  const row = state.notes[0];
  eq('备注已去空白且按百业落库', [row.tenant, row.member_discord_id, row.body], ['alpha', 'M1', '经常迟到，需关注']);
  eq('作者快照', [row.author_discord_id, row.author_name], ['A1', '管理员甲']);
  eq('返回作者组合文案', r.data?.addGuildMemberNote?.note?.authorText, '管理员甲 添加');
}

/* ================= F12: admin surface reads, member surfaces carry nothing ================= */
const officerPageQ = `query($slug: String!) { viewer { guildAdmin(slug: $slug) { __typename
  ... on GuildAdmin { adminTabOfficerLabel officer {
    notesTitle notesHint memberNoNotesText goalsTitle goalsEmptyText hasGoals
    members { discordId displayName notes { id body authorText } goals { id title status } } } } } } }`;
{
  const page = await gql(officerPageQ, { user: adminA, variables: { slug: 'alpha' } });
  const off = page.data?.viewer?.guildAdmin?.officer;
  eq('管理面页签文案', page.data?.viewer?.guildAdmin?.adminTabOfficerLabel, '军官工具');
  eq('备注区标题文案', off?.notesTitle, '成员备注');
  eq('备注区提示文案 (仅管理员可见)', off?.notesHint, '备注仅百业管理员可见，成员本人看不到关于自己的备注。');
  const m1 = (off?.members || []).find((m) => m.discordId === 'M1') || {};
  eq('成员一挂着备注', (m1.notes || []).map((n) => n.body), ['经常迟到，需关注']);
  eq('名册显示名口径 (昵称)', m1.displayName, '成员一');
  const m2 = (off?.members || []).find((m) => m.discordId === 'M2') || {};
  eq('成员二无备注且显示名回退全局名', [(m2.notes || []).length, m2.displayName], [0, '成员二']);
  eq('此时尚无目标 hasGoals=false', off?.hasGoals, false);

  const locked = await gql(officerPageQ, { user: member1, variables: { slug: 'alpha' } });
  eq('成员看管理面 -> GuildAdminLocked', locked.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
  check('Locked 不带 officer 字段', !('officer' in (locked.data?.viewer?.guildAdmin || {})));

  const memberGuildQ = `query($slug: String!) { viewer { guild(slug: $slug) { __typename
    ... on Guild { officer { notesTitle } } } } }`;
  const bad = await gql(memberGuildQ, { user: member1, variables: { slug: 'alpha' } });
  check('成员 Guild 类型查 officer -> 验证错误 (字段根本不存在)',
    Array.isArray(bad.errors) && bad.errors.some((e) => String(e.message).includes('officer')),
    JSON.stringify(bad.errors || bad.data));
}

/* ================= F12: update + delete, guild-scoped ================= */
const updNoteMut = `mutation($slug: String!, $id: ID!, $body: String!) {
  updateGuildMemberNote(slug: $slug, noteId: $id, body: $body) { ok error errorCode note { id body } } }`;
const delNoteMut = `mutation($slug: String!, $id: ID!) {
  deleteGuildMemberNote(slug: $slug, noteId: $id) { ok error errorCode } }`;
{
  const memberUpd = await gql(updNoteMut, { user: member1, variables: { slug: 'alpha', id: noteId, body: '改' } });
  eq('成员改备注 -> adminOnly', memberUpd.data?.updateGuildMemberNote?.errorCode, 'adminOnly');
  const crossUpd = await gql(updNoteMut, { user: adminB, variables: { slug: 'beta', id: noteId, body: '改' } });
  eq('他百业管理员按本百业改 alpha 的备注 id -> officerNoteNotFound (按 guild 解析)', crossUpd.data?.updateGuildMemberNote?.errorCode, 'officerNoteNotFound');
  eq('跨百业改不动原行', state.notes[0].body, '经常迟到，需关注');
  const ok = await gql(updNoteMut, { user: adminA, variables: { slug: 'alpha', id: noteId, body: '已沟通，恢复正常' } });
  eq('管理员改备注 -> ok', ok.data?.updateGuildMemberNote?.ok, true);
  eq('正文已更新', state.notes[0].body, '已沟通，恢复正常');

  const memberDel = await gql(delNoteMut, { user: member2, variables: { slug: 'alpha', id: noteId } });
  eq('成员删备注 -> adminOnly', memberDel.data?.deleteGuildMemberNote?.errorCode, 'adminOnly');
  const okDel = await gql(delNoteMut, { user: adminA, variables: { slug: 'alpha', id: noteId } });
  eq('管理员删备注 -> ok', okDel.data?.deleteGuildMemberNote?.ok, true);
  eq('行已删', state.notes.length, 0);
  const again = await gql(delNoteMut, { user: adminA, variables: { slug: 'alpha', id: noteId } });
  eq('再删 -> officerNoteNotFound', again.data?.deleteGuildMemberNote?.errorCode, 'officerNoteNotFound');
  // A fresh note survives into the export check below (must NOT be in the package).
  await addNote(adminA, 'alpha', 'M2', '内部观察记录');
  eq('导出前另有一条备注在库', state.notes.length, 1);
}

/* ================= F19: member write gate + shape + binding ================= */
const upsertGoalMut = `mutation($input: SeasonGoalInput!) {
  upsertMySeasonGoal(input: $input) { ok error errorCode goal {
    id guildSlug title note status statusLabel dungeonId dungeonName seasonName } } }`;
const upsert = (user, input) => gql(upsertGoalMut, { user, variables: { input } });
let goalId;
{
  eq('匿名建目标 -> loginRequired', (await upsert(null, { slug: 'alpha', title: '目标' })).data?.upsertMySeasonGoal?.errorCode, 'loginRequired');
  eq('非成员建目标 -> memberOnly', (await upsert(outsider, { slug: 'alpha', title: '目标' })).data?.upsertMySeasonGoal?.errorCode, 'memberOnly');
  eq('他百业管理员 (非本服务器成员) 建目标 -> memberOnly', (await upsert(adminB, { slug: 'alpha', title: '目标' })).data?.upsertMySeasonGoal?.errorCode, 'memberOnly');
  eq('不存在的百业 -> guildNotFound', (await upsert(member1, { slug: 'nope', title: '目标' })).data?.upsertMySeasonGoal?.errorCode, 'guildNotFound');
  eq('空目标 -> seasonGoalTitleRequired', (await upsert(member1, { slug: 'alpha', title: '  ' })).data?.upsertMySeasonGoal?.errorCode, 'seasonGoalTitleRequired');
  eq('目标 81 字 -> seasonGoalTitleTooLong', (await upsert(member1, { slug: 'alpha', title: '标'.repeat(81) })).data?.upsertMySeasonGoal?.errorCode, 'seasonGoalTitleTooLong');
  eq('进度备注 501 字 -> seasonGoalNoteTooLong', (await upsert(member1, { slug: 'alpha', title: '目标', note: '注'.repeat(501) })).data?.upsertMySeasonGoal?.errorCode, 'seasonGoalNoteTooLong');
  eq('关联不存在的副本 -> seasonGoalDungeonNotFound', (await upsert(member1, { slug: 'alpha', title: '目标', dungeonId: 999 })).data?.upsertMySeasonGoal?.errorCode, 'seasonGoalDungeonNotFound');
  eq('拒绝不落库', state.goals.length, 0);

  const plain = await upsert(member1, { slug: 'alpha', title: '本赛季集齐一套装备', note: '已集齐 3 件' });
  eq('成员建纯文本目标 -> ok', plain.data?.upsertMySeasonGoal?.ok, true);
  const prow = state.goals.at(-1);
  eq('纯文本目标落库 (无副本绑定)', [prow.tenant, prow.discord_id, prow.status, prow.dungeon_id], ['alpha', 'M1', 'active', null]);
  eq('默认状态文案', plain.data?.upsertMySeasonGoal?.goal?.statusLabel, '进行中');

  const bound = await upsert(member1, { slug: 'alpha', title: '打通试炼本', dungeonId: 7 });
  eq('成员建绑副本目标 -> ok', bound.data?.upsertMySeasonGoal?.ok, true);
  goalId = bound.data?.upsertMySeasonGoal?.goal?.id;
  eq('副本名由后端数据下发', bound.data?.upsertMySeasonGoal?.goal?.dungeonName, '试炼本');
  eq('赛季名由后端赛季表下发', bound.data?.upsertMySeasonGoal?.goal?.seasonName, 'Ever Aflame');
}

/* ================= F19: owner pinning + settings page + officer overview ================= */
const delGoalMut = `mutation($id: ID!) { deleteMySeasonGoal(goalId: $id) { ok error errorCode } }`;
const myGoalsQ = `query { settingsPage { seasonGoals {
  entryLabel title emptyText goals { id guildSlug guildName title status statusLabel dungeonName }
  guildOptions { slug name } dungeonOptions { id name seasonName } } } }`;
{
  const steal = await upsert(member2, { id: goalId, slug: 'alpha', title: '篡改' });
  eq('改他人目标 -> seasonGoalNotFound', steal.data?.upsertMySeasonGoal?.errorCode, 'seasonGoalNotFound');
  eq('他人目标未被改动', state.goals.find((g) => g.id === Number(goalId))?.title, '打通试炼本');
  const stealDel = await gql(delGoalMut, { user: member2, variables: { id: goalId } });
  eq('删他人目标 -> seasonGoalNotFound', stealDel.data?.deleteMySeasonGoal?.errorCode, 'seasonGoalNotFound');
  eq('他人目标仍在', state.goals.filter((g) => g.id === Number(goalId)).length, 1);

  const upd = await upsert(member1, { id: goalId, slug: 'alpha', title: '打通试炼本', note: '已过老一', status: 'DONE', dungeonId: 7 });
  eq('本人改目标 -> ok', upd.data?.upsertMySeasonGoal?.ok, true);
  eq('状态落 done 且文案=已完成', [state.goals.find((g) => g.id === Number(goalId))?.status, upd.data?.upsertMySeasonGoal?.goal?.statusLabel], ['done', '已完成']);
  eq('进度备注已更新', state.goals.find((g) => g.id === Number(goalId))?.note, '已过老一');

  const mine = await gql(myGoalsQ, { user: member1 });
  const page = mine.data?.settingsPage?.seasonGoals;
  eq('设置页入口文案', page?.entryLabel, '赛季目标');
  eq('我的目标共 2 条', (page?.goals || []).length, 2);
  check('我的目标都带所属百业名', (page?.goals || []).every((g) => g.guildName === '甲百业'), JSON.stringify(page?.goals));
  eq('百业选项 = 我的名册行', (page?.guildOptions || []).map((g) => [g.slug, g.name]), [['alpha', '甲百业']]);
  eq('副本选项来自 dex 数据', (page?.dungeonOptions || []).map((d) => [d.id, d.name, d.seasonName]), [[7, '试炼本', 'Ever Aflame']]);
  const other = await gql(myGoalsQ, { user: member2 });
  eq('成员二的设置页看不到成员一的目标', (other.data?.settingsPage?.seasonGoals?.goals || []).length, 0);
  const anon = await gql(myGoalsQ, { user: null });
  eq('匿名设置页目标为空', (anon.data?.settingsPage?.seasonGoals?.goals || []).length, 0);

  const overview = await gql(officerPageQ, { user: adminA, variables: { slug: 'alpha' } });
  const off = overview.data?.viewer?.guildAdmin?.officer;
  eq('总览 hasGoals=true', off?.hasGoals, true);
  const m1 = (off?.members || []).find((m) => m.discordId === 'M1') || {};
  eq('军官总览看到成员一的 2 个目标', (m1.goals || []).length, 2);
  const done = (m1.goals || []).find((g) => g.id === goalId) || {};
  eq('总览目标状态为 DONE', done.status, 'DONE');

  const betaOverview = await gql(officerPageQ, { user: adminB, variables: { slug: 'beta' } });
  const betaOff = betaOverview.data?.viewer?.guildAdmin?.officer;
  eq('乙百业总览无 alpha 的目标 (跨百业不串)', (betaOff?.members || []).flatMap((m) => m.goals || []).length, 0);
  eq('乙百业总览 hasGoals=false', betaOff?.hasGoals, false);

  const del = await gql(delGoalMut, { user: member1, variables: { id: goalId } });
  eq('本人删目标 -> ok', del.data?.deleteMySeasonGoal?.ok, true);
  eq('行已删', state.goals.filter((g) => g.id === Number(goalId)).length, 0);
}

/* ================= F11: export verdict + package shape + audit ================= */
const exportMut = `mutation($slug: String!) {
  exportGuildDataPackage(slug: $slug) { ok error errorCode json filename } }`;
{
  eq('成员导出 -> adminOnly', (await gql(exportMut, { user: member1, variables: { slug: 'alpha' } })).data?.exportGuildDataPackage?.errorCode, 'adminOnly');
  eq('他百业管理员导出 -> adminOnly', (await gql(exportMut, { user: adminB, variables: { slug: 'alpha' } })).data?.exportGuildDataPackage?.errorCode, 'adminOnly');
  eq('拒绝不留痕', state.audit.length, 0);

  const r = await gql(exportMut, { user: adminA, variables: { slug: 'alpha' } });
  const p = r.data?.exportGuildDataPackage || {};
  eq('管理员导出 -> ok', p.ok, true);
  eq('文件名按百业组合', p.filename, 'alpha-guild-export.json');
  const doc = JSON.parse(p.json);
  eq('包格式戳', doc.format, 'guild-export v1');
  eq('包属于本百业', [doc.guild.slug, doc.guild.name], ['alpha', '甲百业']);
  eq('名册完整 3 人', doc.members.map((m) => m.discordId).sort(), ['A1', 'M1', 'M2']);
  eq('组队历史 = 本百业 2 辆车', doc.groupings.map((g) => g.id).sort((a, b) => a - b), [11, 12]);
  const seats = doc.groupings.flatMap((g) => g.participants || []);
  eq('参与记录共 3 座', seats.length, 3);
  check('参与记录带成员身份', seats.every((s) => s.discordId && s.nickname), JSON.stringify(seats).slice(0, 120));
  check('乙百业的车不入包', !doc.groupings.some((g) => g.id === 21));
  eq('赛季目标入包 1 条', doc.seasonGoals.length, 1);
  eq('入包目标为成员一的纯文本目标', doc.seasonGoals[0]?.title, '本赛季集齐一套装备');
  check('军官备注不入包', !p.json.includes('内部观察记录'));
  check('密码哈希不入包', !p.json.includes('password'));

  eq('导出留痕恰一行', state.audit.length, 1);
  const a = state.audit[0];
  eq('留痕动作/百业/执行者', [a.action, a.tenant, a.actor], ['guild.export', 'alpha', 'A1']);
  const summary = JSON.parse(a.summary);
  eq('留痕摘要只有计数', summary, { members: 3, groupings: 2, seats: 3, seasonGoals: 1 });

  const rb = await gql(exportMut, { user: adminB, variables: { slug: 'beta' } });
  const docB = JSON.parse(rb.data?.exportGuildDataPackage?.json || '{}');
  eq('乙百业导出只含自己的 1 辆车', (docB.groupings || []).map((g) => g.id), [21]);
  eq('乙百业名册 1 人', (docB.members || []).length, 1);
}

console.log(`\n== officer harness: ${pass} pass, ${fail} fail ==`);
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
