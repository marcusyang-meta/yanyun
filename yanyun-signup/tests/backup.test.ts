// Backup acceptance after the hub overhaul (HTTP + GraphQL surfaces;
// the deep export/restore semantics are proven by
// scripts/restore-drill.mjs on real D1 + R2):
//  - the retired hub paths are gone: /api/hub/login and
//    /api/hub/backup/* answer 404, and /hub-admin.html redirects to
//    the home page (the admin surface lives in the settings dialog);
//  - backup downloads authenticate with the normal site session plus
//    the platform-admin gate: no session -> 401 on the HTTP routes,
//    a signed-in non-admin -> 403, an admin -> the file;
//  - run/list moved to the GraphQL admin surface
//    (platformAdminRunBackup / PlatformAdmin.backups): a snapshot
//    lands in R2 and audits with the acting admin's REAL user ID as
//    actor (the audit summary carries key/rows/bytes only — never
//    file content);
//  - GET /api/platform-admin/backup/download returns the file
//    (refresh token and avatar blob survive), rejects traversal keys
//    with 404, and audits; the export route streams a parseable
//    backup of live data and audits the export;
//  - without the BACKUPS binding: run refuses with
//    backupStorageMissing, list composes available:false.
// FakeDB routes generic entity selects by table name; FakeR2 is a
// plain in-memory bucket double.
import { describe, it, expect } from 'vitest';
import { signJwt } from '../src/domains/identity/auth.ts';
function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name, got, want) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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

const AVATAR = new Uint8Array([137, 80, 78, 71, 1, 2, 3, 4]);
function makeDb() {
  const tables = {
    tenants: [{ slug: 'alpha', guild_name: '甲百业', password_hash: 'hash-alpha', announcement: '', created_at: '2026-01-01', discord_webhook: 'https://discord.com/api/webhooks/111/aaa', slogan: null, master_name: null, logo_url: null, bg_image_url: null }],
    users: [{ discord_id: '1001', username: '甲用户', avatar: '', guilds_json: '[]', guilds_checked_at: 0, created_at: '2026-01-01', updated_at: '2026-01-01', locale_pref: null },
            { discord_id: '2002', username: '乙用户', avatar: '', guilds_json: '[]', guilds_checked_at: 0, created_at: '2026-01-01', updated_at: '2026-01-01', locale_pref: null }],
    // Complete grants (refresh token + guilds.members.read scope):
    // the checked session voids anything less (session ruling).
    user_oauth: [{ discord_id: '1001', refresh_token: 'REFRESH-DO-NOT-LEAK-INTO-AUDIT', scope: 'identify guilds.members.read', refresh_state: 'ok', last_refresh_at: 0, updated_at: 0 },
                 { discord_id: '2002', refresh_token: 'REFRESH-USER-2002', scope: 'identify guilds.members.read', refresh_state: 'ok', last_refresh_at: 0, updated_at: 0 }],
    guild_avatars: [{ tenant: 'alpha', content_type: 'image/png', bytes: AVATAR.buffer, hash: 'abc', updated_at: 1700000000 }],
    events: [{ id: 101, tenant: 'alpha', title: '车', type: 'activity', description: '', starts_at: null, meet_info: '', max_slots: 10, status: 'open', starts_at_utc: 1800000000, origin: 'admin', created_by: '甲', manage_code: '', dungeon: '', creator_discord_id: '1001', reminder_sent_at: null, reminder_error: null }],
    hub_audit_log: [],
  };
  const state = { tables, audit: tables.hub_audit_log };
  function route(kind, sql, b) {
    sql = sql.replace(/"/g, '').replace(/hub_audit_log\./g, '');
    if (/INSERT INTO hub_audit_log/.test(sql)) {
      state.audit.push({ id: state.audit.length + 1, at: b[0], actor: b[1], action: b[2], tenant: b[3], summary: b[4], ip: b[5] });
      return { meta: {} };
    }
    const m = /from\s+([a-z_]+)/i.exec(sql);
    if (m && /^\s*select/i.test(sql)) {
      const rows = state.tables[m[1]] || [];
      // Single-row reads (session grant checks, locale pref) take the
      // first row; list reads take the table.
      if (kind === 'first') return rows[0] ?? null;
      return { results: rows };
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

function makeR2() {
  const store = new Map();
  return {
    store,
    async put(key, body) { store.set(key, { body: String(body), size: String(body).length, uploaded: new Date() }); },
    async get(key) { const o = store.get(key); return o ? { body: o.body, size: o.size, uploaded: o.uploaded } : null; },
    async list({ prefix }) {
      const objects = [...store.entries()].filter(([k]) => k.startsWith(prefix))
        .map(([key, o]) => ({ key, size: o.size, uploaded: o.uploaded }));
      return { objects };
    },
    async delete(key) { store.delete(key); },
  };
}

function makeCtx() {
  const pending = [];
  return { ctx: { waitUntil(p) { pending.push(Promise.resolve(p).catch(() => {})); } }, pending };
}
const ASSETS = { fetch: async () => new Response('not found', { status: 404 }) };
const worker = (await import('../src/worker.ts')).default;
const SESSION_SECRET = 'backup-test-secret';
function req(path, { method = 'GET', jwt, body } = {}) {
  const headers = {};
  if (jwt) headers.cookie = 'yy_session=' + jwt;
  if (body !== undefined) headers['content-type'] = 'application/json';
  return new Request('http://local' + path, {
    method, headers, body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
async function gqlReq(query, jwt) {
  return req('/graphql', { method: 'POST', jwt, body: { query } });
}

describe('backup', () => {

  it('backup surface with BACKUPS binding', async () => {

{
  const { db, state } = makeDb();
  const r2 = makeR2();
  const env = { DB: db, ASSETS, BACKUPS: r2, SESSION_SECRET, PLATFORM_ADMIN_DISCORD_IDS: '1001' };
  const { ctx } = makeCtx();
  const adminJwt = await signJwt(SESSION_SECRET, { sub: '1001', name: '甲用户', guilds: [] });
  const userJwt = await signJwt(SESSION_SECRET, { sub: '2002', name: '乙用户', guilds: [] });

  // The retired portal is gone.
  const oldLogin = await worker.fetch(req('/api/hub/login', { method: 'POST', body: { password: 'test-admin-pw' } }), env, ctx);
  eq('旧 hub 登录已退役 -> 404', oldLogin.status, 404);
  const oldList = await worker.fetch(req('/api/hub/backup/list', { jwt: adminJwt }), env, ctx);
  eq('旧 hub 备份列表已退役 -> 404', oldList.status, 404);
  const oldPage = await worker.fetch(req('/hub-admin.html'), env, ctx);
  eq('旧门户页重定向', oldPage.status, 301);
  eq('重定向落点为主页', new URL(oldPage.headers.get('location')).pathname, '/');

  // Session + gate on the HTTP download route.
  const noSession = await worker.fetch(req('/api/platform-admin/backup/download?key=manual/x.json'), env, ctx);
  eq('无会话下载 -> 401', noSession.status, 401);
  const nonAdmin = await worker.fetch(req('/api/platform-admin/backup/download?key=manual/x.json', { jwt: userJwt }), env, ctx);
  eq('非超管会话下载 -> 403', nonAdmin.status, 403);

  // Run + list through the GraphQL admin surface.
  const runRes = await worker.fetch(await gqlReq('mutation { platformAdminRunBackup { ok key rows bytes } }', adminJwt), env, ctx);
  eq('立即备份 (GraphQL) -> 200', runRes.status, 200);
  const runJson = (await runRes.json()).data.platformAdminRunBackup;
  eq('立即备份 ok', runJson.ok, true);
  check('快照 key 在 manual/ 下', typeof runJson.key === 'string' && runJson.key.startsWith('manual/'), runJson.key);
  check('快照行数 > 0', runJson.rows > 0, String(runJson.rows));
  check('R2 里真的存了对象', r2.store.has(runJson.key));
  const runAudit = state.audit.find((r) => r.action === 'backup.run');
  check('backup.run 留痕', !!runAudit);
  eq('backup.run actor 是真实用户 ID', runAudit?.actor, '1001');
  check('备份留痕不含文件内容（无 refresh token）', !!runAudit && !runAudit.summary.includes('REFRESH-DO-NOT-LEAK'));

  const listRes = await worker.fetch(await gqlReq('{ viewer { platformAdmin { ... on PlatformAdmin { backups { available entries { key } } } } } }', adminJwt), env, ctx);
  const listJson = (await listRes.json()).data.viewer.platformAdmin.backups;
  eq('列表 available', listJson.available, true);
  check('列表含刚存的快照', listJson.entries.some((b) => b.key === runJson.key));

  const dl = await worker.fetch(req('/api/platform-admin/backup/download?key=' + encodeURIComponent(runJson.key), { jwt: adminJwt }), env, ctx);
  eq('下载快照 -> 200', dl.status, 200);
  const file = JSON.parse(await dl.text());
  eq('下载文件格式正确', file.format, 'yanyun-backup');
  eq('文件内 oauth token 保真', file.entities.user_oauth.rows[0].refresh_token, 'REFRESH-DO-NOT-LEAK-INTO-AUDIT');
  const dlAudit = state.audit.find((r) => r.action === 'backup.download');
  check('下载留痕 backup.download', !!dlAudit);
  eq('backup.download actor 是真实用户 ID', dlAudit?.actor, '1001');

  const trav = await worker.fetch(req('/api/platform-admin/backup/download?key=' + encodeURIComponent('../secret.json'), { jwt: adminJwt }), env, ctx);
  eq('路径穿越 key -> 404', trav.status, 404);
  const missing = await worker.fetch(req('/api/platform-admin/backup/download?key=' + encodeURIComponent('daily/1999-01-01.json'), { jwt: adminJwt }), env, ctx);
  eq('不存在的快照 -> 404', missing.status, 404);

  const exp = await worker.fetch(req('/api/platform-admin/backup/export', { jwt: adminJwt }), env, ctx);
  eq('流式导出 -> 200', exp.status, 200);
  check('导出是附件下载', (exp.headers.get('content-disposition') || '').includes('attachment'));
  const expFile = JSON.parse(await exp.text());
  eq('导出格式正确', expFile.format, 'yanyun-backup');
  eq('导出 tenants 行数', expFile.entities.tenants.count, 1);
  const blob = expFile.entities.guild_avatars.rows[0].bytes;
  const decoded = Uint8Array.from(atob(blob.$blob), (ch) => ch.charCodeAt(0));
  check('导出头像 blob 可解码且字节一致', decoded.length === AVATAR.length && decoded.every((v, i) => v === AVATAR[i]));
  const expAudit = state.audit.find((r) => r.action === 'backup.export');
  check('导出留痕 backup.export', !!expAudit);
  eq('backup.export actor 是真实用户 ID', expAudit?.actor, '1001');
}
  });

  it('without BACKUPS binding', async () => {

{
  const { db } = makeDb();
  const env = { DB: db, ASSETS, SESSION_SECRET, PLATFORM_ADMIN_DISCORD_IDS: '1001' };
  const { ctx } = makeCtx();
  const adminJwt = await signJwt(SESSION_SECRET, { sub: '1001', name: '甲用户', guilds: [] });
  const runRes = await worker.fetch(await gqlReq('mutation { platformAdminRunBackup { ok errorCode } }', adminJwt), env, ctx);
  const runJson = (await runRes.json()).data.platformAdminRunBackup;
  eq('无 BACKUPS 绑定时立即备份被拒', runJson.ok, false);
  eq('拒绝原因是备份存储未配置', runJson.errorCode, 'backupStorageMissing');
  const listRes = await worker.fetch(await gqlReq('{ viewer { platformAdmin { ... on PlatformAdmin { backups { available } } } } }', adminJwt), env, ctx);
  const listJson = (await listRes.json()).data.viewer.platformAdmin.backups;
  eq('无 BACKUPS 绑定时列表 available:false', listJson.available, false);
}
  });
});
