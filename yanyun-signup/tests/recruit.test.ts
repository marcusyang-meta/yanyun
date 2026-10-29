// Recruitment line acceptance (F16 applications / F24 newcomer
// checklist / F17 mentor pairings):
//  - member surface: the platform-home section (Viewer.homeRecruit)
//    composes per viewer — public directory of bound guilds whose
//    recruitment switch is open (tenants.recruit_open, default
//    closed; rectest starts open, othertest closed), application
//    sections for logged-in non-members, newcomer entries
//    (checklist + pairings) for members / the paired — newcomer
//    entries ignore the switch; anonymous gets the directory alone;
//  - the switch: admin-only write (updateGuildRecruitOpen), closed
//    guilds leave the directory and refuse applications
//    (recruitClosed), opening restores both;
//  - F16: apply validation + pending dedupe (alreadyMember /
//    recruitUnavailable / guildNotFound / applicationPending),
//    admin review settles once (second review refused), rejection
//    allows re-applying, approval enrolls the applicant into the
//    guild roster, cross-guild admins cannot review;
//  - F17: mentor designation requires roster membership, pairing
//    requires a designated mentor + roster mentee, self-pairing and
//    a second active pairing are refused, ending settles (never
//    deletes) and frees the mentee for re-pairing, admin lists are
//    tenant-scoped;
//  - F24: the three checklist items derive from seats / pairings —
//    weapon on a seat (profile), an active pairing (mentor), a seat
//    in a completed grouping (first run) — for the member's own view
//    and for the admin newcomer overview (all-done members drop off).
// Real yoga + real resolvers + FakeDB routed by SQL shape (the
// activitytools pattern).
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

function toRawRows(sqlText, rows) {
  if (!rows || !rows.length) return [];
  let cols = null;
  const m = /select\s+([\s\S]+?)\s+from\s/i.exec(sqlText);
  if (m) {
    const parts = m[1].split(',').map((x) => x.trim()).filter(Boolean);
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

/* ================= FakeDB ================= */
const DGID_A = '111111111111111111';
const DGID_B = '222222222222222222';
/* Typed-ID fixture keys: guilds/users carry their 0036 primary keys;
   Discord-space values (server ids, roster ids) stay Discord IDs. */
const GID = { rectest: 1030100001, othertest: 1030100002, freetest: 1030100003 };
const UID = { UA: 2030100001, UB: 2030100002, UC: 2030100003, UN: 2030100004, UD: 2030100005 };
function makeDb(fx = {}) {
  const tables = {
    tenants: (fx.tenants || []).map((t) => ({ ...t })),
    settings: new Map(fx.settings || []),
    users: (fx.users || []).map(([did, gj]) => ({ id: UID[did] || 0, discord_id: did, username: (fx.usernames || []).find(([d]) => d === did)?.[1] || '', guilds_json: gj })),
    // Seed the user mint counter past the fixture users' sequences
    // (fixture ids are day-301 seq 1..5) so ensure-minted users for
    // roster-only members (UM, U9) never collide with a fixture PK.
    mint: new Map([[`2|${Math.floor((Date.now() - Date.UTC(2026, 0, 1)) / 86400000)}`, 5]]),
    usernames: new Map(fx.usernames || []),
    events: (fx.events || []).map((e) => ({ ...e })),
    signups: (fx.signups || []).map((x) => ({ ...x })),
    guildMembers: (fx.guildMembers || []).map((m) => ({ ...m })),
    applications: [],
    mentors: [],
    pairings: [],
    availability: [],
  };
  let nextId = 9000;
  function norm(sql) {
    return sql.replace(/"/g, '')
      .replace(/\b(tenants|settings|users|events|signups|guild_members|guild_applications|guild_mentors|mentor_pairings|user_guild_nicks|member_availability)\./g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function parseCols(list) { return list.split(',').map((c) => c.trim().split('.').pop()); }
  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    if (/^INSERT INTO id_mint_counters/i.test(sql)) {
      const key = `${b[0]}|${b[1]}`;
      const seq = (tables.mint.get(key) || 0) + 1;
      tables.mint.set(key, seq);
      return kind === 'first' ? { seq } : (kind === 'all' ? { results: [{ seq }] } : { meta: { changes: 1 } });
    }
    let m = /^INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)/i.exec(sql);
    if (m) {
      const [, table, colList] = m;
      const cols = parseCols(colList);
      const row = {};
      cols.forEach((c, i) => { row[c] = b[i]; });
      if (/ON CONFLICT/i.test(sql) && table === 'guild_members') {
        const hit = tables.guildMembers.find((x) => x.tenant === row.tenant && x.discord_id === row.discord_id);
        if (hit) { hit.nick = row.nick; hit.global_name = row.global_name; }
        else tables.guildMembers.push(row);
        return { meta: { changes: 1 } };
      }
      if (table === 'users') {
        if (!tables.users.some((u) => u.discord_id === row.discord_id)) tables.users.push(row);
        return { meta: { changes: 1 } };
      }
      if (table === 'member_availability') {
        const hit = tables.availability.find((x) => x.tenant === row.tenant && x.user_id === row.user_id);
        if (hit) Object.assign(hit, row);
        else tables.availability.push(row);
        return { meta: { changes: 1 } };
      }
      if (table === 'guild_mentors') {
        if (!tables.mentors.some((x) => x.tenant === row.tenant && x.user_id === row.user_id)) tables.mentors.push(row);
        return { meta: { changes: 1 } };
      }
      if (table === 'guild_applications') {
        if (tables.applications.some((x) => x.tenant === row.tenant && x.user_id === row.user_id && x.status === 'pending')) {
          throw new Error('UNIQUE constraint failed: guild_applications_pending_unique');
        }
        if (row.id === undefined) row.id = nextId++;
        row.status = 'pending'; row.reviewed_by_user_id = 0; row.reviewed_by_name = ''; row.reviewed_at = null;
        tables.applications.push(row);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      if (table === 'mentor_pairings') {
        if (tables.pairings.some((x) => x.tenant === row.tenant && x.mentee_user_id === row.mentee_user_id && x.status === 'active')) {
          throw new Error('UNIQUE constraint failed: mentor_pairings_active_mentee_unique');
        }
        if (row.id === undefined) row.id = nextId++;
        row.status = 'active'; row.ended_at = null;
        tables.pairings.push(row);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      return { meta: { changes: 0 } };
    }
    m = /^UPDATE (\w+) SET (.+?) WHERE (.+)$/i.exec(sql);
    if (m) {
      const [, table, setList] = m;
      const sets = {};
      let bi = 0;
      for (const part of setList.split(',')) {
        const eqAt = part.indexOf('=');
        const c = part.slice(0, eqAt).trim().split('.').pop();
        const rhs = part.slice(eqAt + 1).trim();
        if (rhs === '?') sets[c] = b[bi++];
        else if (/^'[^']*'$/.test(rhs)) sets[c] = rhs.slice(1, -1);
        else if (/^-?\d+$/.test(rhs)) sets[c] = Number(rhs);
        else sets[c] = null;
      }
      const wb = b.slice(bi);
      let rows = [];
      if (table === 'tenants') {
        rows = tables.tenants.filter((x) => x.slug === wb[0]);
      } else if (table === 'guild_applications') {
        rows = tables.applications.filter((x) => x.id === Number(wb[0]) && x.tenant === wb[1] && x.status === 'pending');
      } else if (table === 'mentor_pairings') {
        rows = tables.pairings.filter((x) => x.id === Number(wb[0]) && x.tenant === wb[1] && x.status === 'active');
      }
      for (const r of rows) Object.assign(r, sets);
      return { meta: { changes: rows.length } };
    }
    if (/^DELETE FROM guild_mentors/i.test(sql)) {
      const before = tables.mentors.length;
      tables.mentors = tables.mentors.filter((x) => !(x.tenant === b[0] && x.user_id === Number(b[1])));
      return { meta: { changes: before - tables.mentors.length } };
    }
    if (/\b(CREATE TABLE|CREATE INDEX|ALTER TABLE|PRAGMA)\b/i.test(sql)) return kind === 'run' ? { meta: { changes: 0 } } : (kind === 'first' ? null : { results: [] });
    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });
    if (/FROM tenants WHERE slug/i.test(sql)) return first(tables.tenants.find((t) => t.slug === b[0]));
    if (/FROM tenants/i.test(sql) && /id = \?/i.test(sql)) return first(tables.tenants.find((t) => t.id === Number(b[0])));
    if (/FROM tenants/i.test(sql)) return all(tables.tenants);
    if (/FROM settings/i.test(sql) && /tenant = 0/i.test(sql)) {
      const v = tables.settings.get(`0|${b[0]}`);
      return first(v === undefined ? null : { value: v });
    }
    if (/FROM settings WHERE tenant = \? AND key = \?/i.test(sql)) {
      const v = tables.settings.get(`${b[0]}|${b[1]}`);
      return first(v === undefined ? null : { value: v });
    }
    if (/FROM settings WHERE key = \?/i.test(sql)) {
      const rows = [];
      for (const [k, v] of tables.settings.entries()) {
        const at = k.lastIndexOf('|');
        if (k.slice(at + 1) === String(b[0])) rows.push({ tenant: Number(k.slice(0, at)), value: v });
      }
      return all(rows);
    }
    if (/FROM settings/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/SELECT guilds_json FROM users/i.test(sql)) {
      const u = tables.users.find((x) => x.id === Number(b[0])) || tables.users.find((x) => x.discord_id === String(b[0]));
      return first(u === undefined ? null : { guilds_json: u.guilds_json });
    }
    if (/SELECT username FROM users/i.test(sql)) {
      const u = tables.users.find((x) => x.discord_id === String(b[0])) || tables.users.find((x) => x.id === Number(b[0]));
      const v = u ? (u.username || tables.usernames.get(u.discord_id)) : tables.usernames.get(String(b[0]));
      return first(v === undefined ? null : { username: v });
    }
    if (/FROM users/i.test(sql)) {
      if (/discord_id IN/i.test(sql)) {
        const rows = tables.users.filter((x) => b.map(String).includes(x.discord_id));
        return kind === 'first' ? (rows[0] ?? null) : all(rows);
      }
      if (/id IN/i.test(sql)) {
        const rows = tables.users.filter((x) => b.map(Number).includes(x.id));
        return kind === 'first' ? (rows[0] ?? null) : all(rows);
      }
      if (/discord_id = \?/i.test(sql)) return first(tables.users.find((x) => x.discord_id === String(b[0])));
      if (/id = \?/i.test(sql)) return first(tables.users.find((x) => x.id === Number(b[0])));
      return kind === 'first' ? (tables.users[0] ?? null) : all(tables.users);
    }
    if (/FROM user_guild_nicks/i.test(sql)) return kind === 'first' ? null : all([]);
    if (/FROM guild_members WHERE tenant = \?/i.test(sql)) {
      let rows = tables.guildMembers.filter((x) => x.tenant === b[0]);
      if (/discord_id = \?/i.test(sql) && b.length > 1) rows = rows.filter((x) => x.discord_id === String(b[1]));
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    if (/FROM guild_applications/i.test(sql)) {
      let rows = tables.applications.filter((x) => x.tenant === b[0]);
      if (/^SELECT .* FROM guild_applications WHERE id = \?/i.test(sql)) {
        return first(tables.applications.find((x) => x.id === Number(b[0]) && x.tenant === b[1]));
      }
      if (/user_id = \?/i.test(sql) && b.length > 1) rows = rows.filter((x) => x.user_id === Number(b[1]));
      if (/status = 'pending'/i.test(sql)) rows = rows.filter((x) => x.status === 'pending');
      rows = rows.slice().sort((x, y) => y.id - x.id);
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    if (/FROM member_availability/i.test(sql)) {
      const rows = tables.availability.filter((x) => x.tenant === b[0] && x.user_id === Number(b[1]));
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    if (/FROM guild_mentors/i.test(sql)) {
      return all(tables.mentors.filter((x) => x.tenant === b[0]).map((x) => ({ user_id: x.user_id })));
    }
    if (/FROM mentor_pairings/i.test(sql)) {
      if (/^SELECT .* FROM mentor_pairings WHERE id = \?/i.test(sql)) {
        return first(tables.pairings.find((x) => x.id === Number(b[0]) && x.tenant === b[1]));
      }
      let rows = tables.pairings.filter((x) => x.tenant === b[0]);
      if (/mentee_user_id = \? AND status = 'active'/i.test(sql)) {
        rows = rows.filter((x) => x.mentee_user_id === Number(b[1]) && x.status === 'active');
        return first(rows[0]);
      }
      if (/mentor_user_id = \? OR mentee_user_id = \?/i.test(sql)) {
        rows = rows.filter((x) => x.mentor_user_id === Number(b[1]) || x.mentee_user_id === Number(b[1]));
      }
      rows = rows.slice().sort((x, y) => y.id - x.id);
      return kind === 'first' ? (rows[0] ?? null) : all(rows);
    }
    if (/FROM signups JOIN events/i.test(sql)) {
      const evById = new Map(tables.events.map((e) => [e.id, e]));
      const rows = tables.signups
        .filter((x) => String(x.discord_id) === String(b[1]) && evById.get(x.event_id)?.tenant === b[0])
        .map((x) => ({ weapon: x.weapon, event_status: evById.get(x.event_id).status }));
      return all(rows);
    }
    return kind === 'first' ? null : (kind === 'all' ? { results: [] } : { meta: { changes: 0 } });
  }
  function stmt(rawSql) {
    const q = {
      _binds: [], bind(...a) { this._binds = a; return this; },
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
  return { db, tables };
}

/* ---------------- fixtures ---------------- */
const serversJson = (rows) => JSON.stringify(rows);
const srv = (id, permissions = '0', owner = false) => ({ id, name: '测试服', icon: '', permissions, owner });
const ADMIN = { userId: UID.UA, discordId: 'UA', name: '管理员甲', guilds: [DGID_A] };
const MEMBER = { userId: UID.UB, discordId: 'UB', name: '成员乙', guilds: [DGID_A] };
const MEMBER2 = { userId: UID.UC, discordId: 'UC', name: '成员丙', guilds: [DGID_A] };
const APPLICANT = { userId: UID.UN, discordId: 'UN', name: '新人甲', guilds: [] };
const ADMIN_B = { userId: UID.UD, discordId: 'UD', name: '乙业管理员', guilds: [DGID_B] };

const tenantRow = (slug, name, recruitOpen = 0) => ({
  id: GID[slug], slug, guild_name: name, password_hash: 'x', announcement: '', slogan: '',
  master_name: '', logo_url: '', bg_image_url: '', discord_webhook: '', created_at: '2026-01-01 00:00:00',
  recruit_open: recruitOpen,
});
const { db, tables } = makeDb({
  tenants: [tenantRow('rectest', '招新测试百业', 1), tenantRow('othertest', '乙百业'), tenantRow('freetest', '未绑百业')],
  settings: [
    [`${GID.rectest}|discord_guild_id`, DGID_A],
    [`${GID.othertest}|discord_guild_id`, DGID_B],
    ['0|game_version', 'intl-v2.3'],
  ],
  users: [
    ['UA', serversJson([srv(DGID_A, '32')])],
    ['UB', serversJson([srv(DGID_A)])],
    ['UC', serversJson([srv(DGID_A)])],
    ['UN', serversJson([])],
    ['UD', serversJson([srv(DGID_B, '32')])],
  ],
  usernames: [['UN', '新人甲全局名']],
  guildMembers: [
    { tenant: GID.rectest, discord_id: 'UB', nick: '成员乙', global_name: '乙' },
    { tenant: GID.rectest, discord_id: 'UC', nick: '成员丙', global_name: '丙' },
    { tenant: GID.rectest, discord_id: 'UM', nick: '导师甲', global_name: '甲' },
    { tenant: GID.othertest, discord_id: 'U9', nick: '乙业成员', global_name: '玖' },
  ],
  events: [
    { id: 601, tenant: GID.rectest, title: '已完成车', status: 'completed' },
    { id: 602, tenant: GID.rectest, title: '进行中车', status: 'open' },
  ],
  signups: [
    { id: 1, event_id: 601, nickname: '成员乙', uid: 'q1', weapon: '破竹·樽', discord_id: 'UB' },
    { id: 2, event_id: 602, nickname: '成员丙', uid: 'q2', weapon: '', discord_id: 'UC' },
  ],
});
const env = { DB: db, ASSETS: { fetch: async () => new Response('not found', { status: 404 }) } };

async function gql(query, { user = null, variables } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

describe('recruit', () => {
let app1: any, pair1: any, adminQB: any;

const homeQ = `{ viewer { homeRecruit { recruitTitle homeBody
  guilds { slug name slogan myApplicationSection { application { id applicantName message status statusLabel reviewedByName } } }
  myNewcomer { slug guildName checklist { doneCount totalCount progressText items { key label hint done } }
    myPairings { id mentorName menteeName status statusLabel } } } } }`;
const homeGuild = (r, slug) => (r.data?.viewer?.homeRecruit?.guilds || []).find((g) => g.slug === slug);
const homeNewcomer = (r, slug) => (r.data?.viewer?.homeRecruit?.myNewcomer || []).find((g) => g.slug === slug);
const myApp = (r, slug) => homeGuild(r, slug)?.myApplicationSection?.application ?? null;

it('home recruit section: composition', async () => {
/* ================= the home recruit section: composition ================= */

let r = await gql(homeQ, { user: null });
eq('匿名: 区标题文案由后端下发', r.data?.viewer?.homeRecruit?.recruitTitle, '招新与新人');
eq('匿名: 目录 = 已绑定且开启招新的百业 (含甲, 不含未开启的乙/未绑)', (r.data?.viewer?.homeRecruit?.guilds || []).map((g) => g.slug), ['rectest']);
eq('匿名: 目录带百业名 (公开口径)', homeGuild(r, 'rectest')?.name, '招新测试百业');
eq('匿名: 无任何申请区', (r.data?.viewer?.homeRecruit?.guilds || []).every((g) => g.myApplicationSection === null), true);
eq('匿名: 无新人拼装', r.data?.viewer?.homeRecruit?.myNewcomer, []);
r = await gql(`{ viewer { guildRecruit(slug: "rectest") { __typename } } }`, { user: MEMBER });
check('旧招新页字段已下线 (guildRecruit 不存在)', Array.isArray(r.errors) && r.errors.length > 0, JSON.stringify(r).slice(0, 120));
r = await gql(homeQ, { user: APPLICANT });
eq('未入业登录用户: 甲业有申请区', !!homeGuild(r, 'rectest')?.myApplicationSection, true);
eq('未入业登录用户: 无申请时 application 为 null', myApp(r, 'rectest'), null);
eq('未入业登录用户: 无新人拼装 (清单不下发)', r.data?.viewer?.homeRecruit?.myNewcomer, []);
r = await gql(homeQ, { user: MEMBER });
eq('成员: 自己百业无申请区', homeGuild(r, 'rectest')?.myApplicationSection ?? null, null);
eq('成员: 新人拼装含甲业', !!homeNewcomer(r, 'rectest'), true);
eq('成员: 未开启招新的乙业不在目录 (无从申请)', homeGuild(r, 'othertest'), undefined);
});

const applyMut = `mutation($slug: String!, $message: String) { applyToGuild(slug: $slug, message: $message) { ok error errorCode application { id status applicantName } } }`;

it('F16: apply + dedupe', async () => {
/* ================= F16: apply + dedupe ================= */
let r = await gql(applyMut, { user: null, variables: { slug: 'rectest', message: 'x' } });
eq('匿名申请 -> loginRequired', r.data?.applyToGuild?.errorCode, 'loginRequired');
r = await gql(applyMut, { user: MEMBER, variables: { slug: 'rectest', message: 'x' } });
eq('已是成员申请 -> alreadyMember', r.data?.applyToGuild?.errorCode, 'alreadyMember');
r = await gql(applyMut, { user: APPLICANT, variables: { slug: 'freetest', message: 'x' } });
eq('未绑百业申请 -> recruitUnavailable', r.data?.applyToGuild?.errorCode, 'recruitUnavailable');
r = await gql(applyMut, { user: APPLICANT, variables: { slug: 'othertest', message: 'x' } });
eq('已绑定但未开启招新的百业申请 -> recruitClosed', r.data?.applyToGuild?.errorCode, 'recruitClosed');
eq('recruitClosed 文案由后端下发', r.data?.applyToGuild?.error, '该百业尚未开放招新，暂时不能提交申请');
r = await gql(applyMut, { user: APPLICANT, variables: { slug: 'nosuch', message: 'x' } });
eq('不存在的百业 -> guildNotFound', r.data?.applyToGuild?.errorCode, 'guildNotFound');
r = await gql(applyMut, { user: APPLICANT, variables: { slug: 'rectest', message: '  我常玩奶，想入业  ' } });
eq('提交申请 ok', r.data?.applyToGuild?.ok, true);
eq('申请状态 PENDING', r.data?.applyToGuild?.application?.status, 'PENDING');
eq('申请人名快照 = 存储全局名', r.data?.applyToGuild?.application?.applicantName, '新人甲全局名');
app1 = r.data?.applyToGuild?.application?.id;
r = await gql(applyMut, { user: APPLICANT, variables: { slug: 'rectest', message: '再来一份' } });
eq('已有待审申请再提 -> applicationPending (去重)', r.data?.applyToGuild?.errorCode, 'applicationPending');
eq('去重后仍只有一份申请', tables.applications.length, 1);
r = await gql(homeQ, { user: APPLICANT });
eq('申请人回读自己的待审申请', myApp(r, 'rectest')?.status, 'PENDING');
eq('申请人回读状态文案', myApp(r, 'rectest')?.statusLabel, '待审核');
eq('附言已落库 (裁剪后)', tables.applications[0].message, '我常玩奶，想入业');
});

const adminQ = `{ viewer { guildAdmin(slug: "rectest") { __typename
  ... on GuildAdmin { slug adminTabRecruitLabel adminRecruitOpenLabel recruitOpen
    recruitApplications { id applicantDiscordId applicantName message status statusLabel reviewedByName }
    recruitPairings { id mentorName menteeName status }
    recruitRoster { discordId displayName isMentor }
    newcomerProgress { discordId displayName profileDone availabilityDone mentorDone firstRunDone doneCount progressText } }
  ... on GuildAdminLocked { slug } } } }`;

it('F16: review (admin surface)', async () => {
/* ================= F16: review (admin surface) ================= */
let r = await gql(adminQ, { user: MEMBER });
eq('普通成员 -> GuildAdminLocked (无招新面)', r.data?.viewer?.guildAdmin?.__typename, 'GuildAdminLocked');
r = await gql(adminQ, { user: ADMIN });
eq('管理员招新页签文案', r.data?.viewer?.guildAdmin?.adminTabRecruitLabel, '招新与导师');
eq('招新开关文案由后端下发', r.data?.viewer?.guildAdmin?.adminRecruitOpenLabel, '开放招新');
eq('甲业招新开关回读 = 开启 (夹具初值)', r.data?.viewer?.guildAdmin?.recruitOpen, true);
eq('审核队列含待审申请', (r.data?.viewer?.guildAdmin?.recruitApplications || []).map((a) => [a.applicantDiscordId, a.status]), [['UN', 'PENDING']]);

const reviewMut = `mutation($slug: String!, $id: ID!, $approve: Boolean!) { reviewGuildApplication(slug: $slug, applicationId: $id, approve: $approve) { ok error errorCode id } }`;
r = await gql(reviewMut, { user: MEMBER, variables: { slug: 'rectest', id: app1, approve: true } });
eq('成员审核 -> adminOnly', r.data?.reviewGuildApplication?.errorCode, 'adminOnly');
r = await gql(reviewMut, { user: ADMIN_B, variables: { slug: 'rectest', id: app1, approve: true } });
eq('乙业管理员审甲业 -> adminOnly (不串权)', r.data?.reviewGuildApplication?.errorCode, 'adminOnly');
r = await gql(reviewMut, { user: ADMIN, variables: { slug: 'rectest', id: '424242', approve: true } });
eq('不存在的申请 -> applicationNotFound', r.data?.reviewGuildApplication?.errorCode, 'applicationNotFound');
r = await gql(reviewMut, { user: ADMIN, variables: { slug: 'rectest', id: app1, approve: false } });
eq('拒绝 ok', r.data?.reviewGuildApplication?.ok, true);
r = await gql(homeQ, { user: APPLICANT });
eq('申请人看到已拒绝 + 审核人留痕', [myApp(r, 'rectest')?.status, myApp(r, 'rectest')?.reviewedByName], ['REJECTED', '管理员甲']);
r = await gql(reviewMut, { user: ADMIN, variables: { slug: 'rectest', id: app1, approve: true } });
eq('已结案再审 -> applicationNotPending', r.data?.reviewGuildApplication?.errorCode, 'applicationNotPending');
eq('拒绝不登记名册', tables.guildMembers.some((m) => m.discord_id === 'UN'), false);

r = await gql(applyMut, { user: APPLICANT, variables: { slug: 'rectest', message: '再试一次' } });
eq('被拒后可重新申请', r.data?.applyToGuild?.ok, true);
const app2 = r.data?.applyToGuild?.application?.id;
check('新申请是新行', app2 && app2 !== app1, `${app1} -> ${app2}`);
r = await gql(reviewMut, { user: ADMIN, variables: { slug: 'rectest', id: app2, approve: true } });
eq('通过 ok', r.data?.reviewGuildApplication?.ok, true);
eq('通过后登记进百业名册 (平台侧入业)', tables.guildMembers.some((m) => m.tenant === GID.rectest && m.discord_id === 'UN'), true);
eq('名册行全局名 = 申请快照名', tables.guildMembers.find((m) => m.discord_id === 'UN')?.global_name, '新人甲全局名');
r = await gql(homeQ, { user: APPLICANT });
eq('申请人看到已通过', myApp(r, 'rectest')?.status, 'APPROVED');
r = await gql(adminQ, { user: ADMIN });
eq('队列留痕: 两份申请最新在前', (r.data?.viewer?.guildAdmin?.recruitApplications || []).map((a) => a.status), ['APPROVED', 'REJECTED']);
});

const setMentorMut = `mutation($slug: String!, $id: String!, $v: Boolean!) { setGuildMentor(slug: $slug, discordId: $id, isMentor: $v) { ok error errorCode } }`;
const pairMut = `mutation($slug: String!, $mentor: String!, $mentee: String!) { createMentorPairing(slug: $slug, mentorDiscordId: $mentor, menteeDiscordId: $mentee) { ok error errorCode id } }`;
const endMut = `mutation($slug: String!, $id: ID!) { endMentorPairing(slug: $slug, pairingId: $id) { ok error errorCode } }`;

it('F17: mentors + pairings', async () => {
/* ================= F17: mentors + pairings ================= */

let r = await gql(setMentorMut, { user: MEMBER, variables: { slug: 'rectest', id: 'UM', v: true } });
eq('成员设导师 -> adminOnly', r.data?.setGuildMentor?.errorCode, 'adminOnly');
r = await gql(setMentorMut, { user: ADMIN, variables: { slug: 'rectest', id: 'U9', v: true } });
eq('设乙业成员为甲业导师 -> mentorNotInGuild', r.data?.setGuildMentor?.errorCode, 'mentorNotInGuild');
r = await gql(pairMut, { user: ADMIN, variables: { slug: 'rectest', mentor: 'UB', mentee: 'UC' } });
eq('未设为导师就配对 -> mentorNotDesignated', r.data?.createMentorPairing?.errorCode, 'mentorNotDesignated');
r = await gql(setMentorMut, { user: ADMIN, variables: { slug: 'rectest', id: 'UM', v: true } });
eq('设导师 ok', r.data?.setGuildMentor?.ok, true);
r = await gql(adminQ, { user: ADMIN });
eq('名册行带导师标记', r.data?.viewer?.guildAdmin?.recruitRoster?.find((m) => m.discordId === 'UM')?.isMentor, true);
r = await gql(pairMut, { user: ADMIN, variables: { slug: 'rectest', mentor: 'UM', mentee: 'UM' } });
eq('自配 -> mentorSelfPairing', r.data?.createMentorPairing?.errorCode, 'mentorSelfPairing');
r = await gql(pairMut, { user: ADMIN, variables: { slug: 'rectest', mentor: 'UM', mentee: 'U9' } });
eq('配乙业成员 -> menteeNotInGuild', r.data?.createMentorPairing?.errorCode, 'menteeNotInGuild');
r = await gql(pairMut, { user: ADMIN, variables: { slug: 'rectest', mentor: 'UM', mentee: 'UB' } });
eq('建配对 ok', r.data?.createMentorPairing?.ok, true);
pair1 = r.data?.createMentorPairing?.id;
r = await gql(pairMut, { user: ADMIN, variables: { slug: 'rectest', mentor: 'UM', mentee: 'UB' } });
eq('新人已有进行中配对 -> menteeAlreadyPaired', r.data?.createMentorPairing?.errorCode, 'menteeAlreadyPaired');
eq('配对只落一行', tables.pairings.length, 1);
});

it('F24: checklist derivation', async () => {
/* ================= F24: checklist derivation ================= */
let r = await gql(homeQ, { user: MEMBER });
const cl = homeNewcomer(r, 'rectest')?.checklist;
eq('成员清单: 四项齐发', (cl?.items || []).map((i) => i.key), ['profile', 'availability', 'mentor', 'firstRun']);
eq('清单条目文案后端下发', cl?.items?.[0]?.label, '完善流派 / 时区');
eq('可用时间条目文案后端下发', cl?.items?.[1]?.label, '填写可用时间');
eq('未填可用时间时仅该项未勾 (流派座位+导师+完成车已勾)', (cl?.items || []).map((i) => i.done), [true, false, true, true]);
eq('清单进度文案后端拼', cl?.progressText, '已完成 3 / 4');
eq('本人配对回读', (homeNewcomer(r, 'rectest')?.myPairings || []).map((p) => [p.mentorName, p.status]), [['导师甲', 'ACTIVE']]);
const availMut = `mutation($input: SetAvailabilityInput!) { setMyAvailability(input: $input) { ok error errorCode } }`;
r = await gql(availMut, { user: MEMBER, variables: { input: { slug: 'rectest', slots: [{ weekday: 5, startMinute: 1140, endMinute: 1320 }] } } });
eq('成员保存可用时间 ok (清单完成态的事实来源)', r.data?.setMyAvailability?.ok, true);
r = await gql(homeQ, { user: MEMBER });
eq('填后四项全勾 (流派座位+可用时间+导师+完成车)', (homeNewcomer(r, 'rectest')?.checklist?.items || []).map((i) => i.done), [true, true, true, true]);
eq('填后清单进度 4/4', homeNewcomer(r, 'rectest')?.checklist?.progressText, '已完成 4 / 4');
r = await gql(homeQ, { user: MEMBER2 });
eq('丙清单: 无流派/未填可用时间/无导师/未完成全未勾', (homeNewcomer(r, 'rectest')?.checklist?.items || []).map((i) => i.done), [false, false, false, false]);
eq('丙清单进度 0/4', homeNewcomer(r, 'rectest')?.checklist?.doneCount, 0);
r = await gql(adminQ, { user: ADMIN });
const prog = r.data?.viewer?.guildAdmin?.newcomerProgress || [];
check('总览含未完成的丙 (0 项)', prog.some((p) => p.discordId === 'UC' && p.doneCount === 0), JSON.stringify(prog.map((p) => p.discordId)));
check('总览不含全勾的乙', !prog.some((p) => p.discordId === 'UB'));
check('总览含刚入册的新人甲 (0 项)', prog.some((p) => p.discordId === 'UN' && p.doneCount === 0));
eq('总览逐项结论与本人视图一致 (丙)', prog.find((p) => p.discordId === 'UC')?.profileDone, false);
eq('总览逐项结论与本人视图一致 (丙·可用时间)', prog.find((p) => p.discordId === 'UC')?.availabilityDone, false);
});

it('pairing end + re-pair', async () => {
/* pairing end + re-pair */
let r = await gql(endMut, { user: ADMIN_B, variables: { slug: 'rectest', id: pair1 } });
eq('乙业管理员结束甲业配对 -> adminOnly', r.data?.endMentorPairing?.errorCode, 'adminOnly');
r = await gql(endMut, { user: ADMIN, variables: { slug: 'rectest', id: '424242' } });
eq('结束不存在配对 -> pairingNotFound', r.data?.endMentorPairing?.errorCode, 'pairingNotFound');
r = await gql(endMut, { user: ADMIN, variables: { slug: 'rectest', id: pair1 } });
eq('结束配对 ok', r.data?.endMentorPairing?.ok, true);
eq('结束留痕不删行', tables.pairings.length, 1);
eq('结束行状态落痕', tables.pairings[0].status, 'ended');
r = await gql(endMut, { user: ADMIN, variables: { slug: 'rectest', id: pair1 } });
eq('重复结束 -> pairingAlreadyEnded', r.data?.endMentorPairing?.errorCode, 'pairingAlreadyEnded');
r = await gql(homeQ, { user: MEMBER });
eq('结束后导师项掉勾', homeNewcomer(r, 'rectest')?.checklist?.items?.find((i) => i.key === 'mentor')?.done, false);
eq('本人配对列表仍见已结束配对 (留痕)', (homeNewcomer(r, 'rectest')?.myPairings || []).map((p) => p.status), ['ENDED']);
r = await gql(pairMut, { user: ADMIN, variables: { slug: 'rectest', mentor: 'UM', mentee: 'UB' } });
eq('结束后可改配', r.data?.createMentorPairing?.ok, true);
});

it('undesignate keeps pairings; cross-guild isolation', async () => {
/* undesignate keeps pairings; cross-guild isolation */
let r = await gql(setMentorMut, { user: ADMIN, variables: { slug: 'rectest', id: 'UM', v: false } });
eq('取消导师 ok', r.data?.setGuildMentor?.ok, true);
r = await gql(adminQ, { user: ADMIN });
eq('取消导师不改已有配对', (r.data?.viewer?.guildAdmin?.recruitPairings || []).filter((p) => p.status === 'ACTIVE').length, 1);
adminQB = adminQ.replaceAll('rectest', 'othertest');
r = await gql(adminQB, { user: ADMIN_B });
eq('乙业面申请队列为空 (隔离)', r.data?.viewer?.guildAdmin?.recruitApplications, []);
eq('乙业面配对列表为空 (隔离)', r.data?.viewer?.guildAdmin?.recruitPairings, []);
eq('乙业招新开关回读 = 关闭 (默认关)', r.data?.viewer?.guildAdmin?.recruitOpen, false);
});

it('the recruitment switch', async () => {
/* ================= the recruitment switch ================= */
const openMut = `mutation($slug: String!, $open: Boolean!) { updateGuildRecruitOpen(slug: $slug, open: $open) { ok error errorCode } }`;
let r = await gql(openMut, { user: MEMBER, variables: { slug: 'othertest', open: true } });
eq('成员拨开关 -> adminOnly', r.data?.updateGuildRecruitOpen?.errorCode, 'adminOnly');
r = await gql(openMut, { user: ADMIN, variables: { slug: 'othertest', open: true } });
eq('甲业管理员拨乙业开关 -> adminOnly (不串权)', r.data?.updateGuildRecruitOpen?.errorCode, 'adminOnly');
r = await gql(openMut, { user: ADMIN_B, variables: { slug: 'othertest', open: true } });
eq('乙业管理员开启本业招新 ok', r.data?.updateGuildRecruitOpen?.ok, true);
eq('开关落库 (tenants.recruit_open = 1)', tables.tenants.find((t) => t.slug === 'othertest')?.recruit_open, 1);
r = await gql(adminQB, { user: ADMIN_B });
eq('开启后乙业面回读 = 开启', r.data?.viewer?.guildAdmin?.recruitOpen, true);
r = await gql(homeQ, { user: null });
eq('开启后匿名目录含乙业', (r.data?.viewer?.homeRecruit?.guilds || []).map((g) => g.slug), ['rectest', 'othertest']);
eq('开启后匿名仍无申请区', (r.data?.viewer?.homeRecruit?.guilds || []).every((g) => g.myApplicationSection === null), true);
r = await gql(applyMut, { user: APPLICANT, variables: { slug: 'othertest', message: '想入乙业' } });
eq('开启后可向乙业提交申请', r.data?.applyToGuild?.ok, true);
r = await gql(openMut, { user: ADMIN, variables: { slug: 'rectest', open: false } });
eq('关闭甲业招新 ok', r.data?.updateGuildRecruitOpen?.ok, true);
r = await gql(homeQ, { user: null });
eq('关闭后甲业离开匿名目录', (r.data?.viewer?.homeRecruit?.guilds || []).map((g) => g.slug), ['othertest']);
r = await gql(applyMut, { user: APPLICANT, variables: { slug: 'rectest', message: 'x' } });
eq('关闭后申请甲业 -> recruitClosed', r.data?.applyToGuild?.errorCode, 'recruitClosed');
r = await gql(homeQ, { user: MEMBER });
eq('关闭不影响成员的新人拼装 (清单照常下发)', !!homeNewcomer(r, 'rectest')?.checklist, true);
eq('关闭不影响成员的配对回读', (homeNewcomer(r, 'rectest')?.myPairings || []).length > 0, true);
r = await gql(adminQ, { user: ADMIN });
eq('关闭后甲业面回读 = 关闭', r.data?.viewer?.guildAdmin?.recruitOpen, false);
eq('关闭不影响待审/历史申请的审核面留痕', (r.data?.viewer?.guildAdmin?.recruitApplications || []).length > 0, true);
});

});
