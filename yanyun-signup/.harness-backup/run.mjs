// Hub backup endpoints acceptance (HTTP surface; the deep
// export/restore semantics are proven by scripts/restore-drill.mjs on
// real D1 + R2):
//  - every backup path requires hub auth;
//  - POST /backup/run stores a snapshot in R2 and audits it (the audit
//    summary carries key/rows/bytes only — never file content);
//  - GET /backup/list shows the stored snapshot;
//  - GET /backup/download returns the file (refresh token and avatar
//    blob survive), rejects traversal keys with 404, and audits;
//  - GET /backup/export streams a parseable backup of live data and
//    audits the export;
//  - without the BACKUPS binding: run -> 500, list -> available:false.
// FakeDB routes generic entity selects by table name; FakeR2 is a plain
// in-memory bucket double.
let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
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
    users: [{ discord_id: '1001', username: '甲用户', avatar: '', guilds_json: '[]', guilds_checked_at: 0, created_at: '2026-01-01', updated_at: '2026-01-01', locale_pref: null }],
    user_oauth: [{ discord_id: '1001', refresh_token: 'REFRESH-DO-NOT-LEAK-INTO-AUDIT', scope: 'identify', refresh_state: 'ok', last_refresh_at: 0, updated_at: 0 }],
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
      return { results: state.tables[m[1]] || [] };
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
function req(path, { method = 'GET', token, body } = {}) {
  const headers = {};
  if (token) headers.authorization = 'Bearer ' + token;
  if (body !== undefined) headers['content-type'] = 'application/json';
  return new Request('http://local' + path, {
    method, headers, body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

{
  const { db, state } = makeDb();
  const r2 = makeR2();
  const env = { DB: db, ADMIN_PASSWORD: 'test-admin-pw', ASSETS, BACKUPS: r2 };
  const { ctx } = makeCtx();

  const noTok = await worker.fetch(req('/api/hub/backup/list'), env, ctx);
  eq('备份列表无 token -> 401', noTok.status, 401);

  const login = await worker.fetch(req('/api/hub/login', { method: 'POST', body: { password: 'test-admin-pw' } }), env, ctx);
  const { token } = await login.json();

  const run = await worker.fetch(req('/api/hub/backup/run', { method: 'POST', token }), env, ctx);
  eq('立即备份 -> 200', run.status, 200);
  const rj = await run.json();
  check('快照 key 在 manual/ 下', typeof rj.backup?.key === 'string' && rj.backup.key.startsWith('manual/'), rj.backup?.key);
  eq('快照计数含 tenants=1', rj.backup?.counts?.tenants, 1);
  check('R2 里真的存了对象', r2.store.has(rj.backup.key));
  const runAudit = state.audit.find((r) => r.action === 'backup.run');
  check('backup.run 留痕', !!runAudit);
  check('备份留痕不含文件内容（无 refresh token）', !!runAudit && !runAudit.summary.includes('REFRESH-DO-NOT-LEAK'));

  const list = await worker.fetch(req('/api/hub/backup/list', { token }), env, ctx);
  const lj = await list.json();
  eq('列表 available', lj.available, true);
  check('列表含刚存的快照', lj.backups.some((b) => b.key === rj.backup.key));

  const dl = await worker.fetch(req('/api/hub/backup/download?key=' + encodeURIComponent(rj.backup.key), { token }), env, ctx);
  eq('下载快照 -> 200', dl.status, 200);
  const file = JSON.parse(await dl.text());
  eq('下载文件格式正确', file.format, 'yanyun-backup');
  eq('文件内 oauth token 保真', file.entities.user_oauth.rows[0].refresh_token, 'REFRESH-DO-NOT-LEAK-INTO-AUDIT');
  check('下载留痕 backup.download', state.audit.some((r) => r.action === 'backup.download'));

  const trav = await worker.fetch(req('/api/hub/backup/download?key=' + encodeURIComponent('../secret.json'), { token }), env, ctx);
  eq('路径穿越 key -> 404', trav.status, 404);
  const missing = await worker.fetch(req('/api/hub/backup/download?key=' + encodeURIComponent('daily/1999-01-01.json'), { token }), env, ctx);
  eq('不存在的快照 -> 404', missing.status, 404);

  const exp = await worker.fetch(req('/api/hub/backup/export', { token }), env, ctx);
  eq('流式导出 -> 200', exp.status, 200);
  check('导出是附件下载', (exp.headers.get('content-disposition') || '').includes('attachment'));
  const expFile = JSON.parse(await exp.text());
  eq('导出格式正确', expFile.format, 'yanyun-backup');
  eq('导出 tenants 行数', expFile.entities.tenants.count, 1);
  const blob = expFile.entities.guild_avatars.rows[0].bytes;
  const decoded = Uint8Array.from(atob(blob.$blob), (ch) => ch.charCodeAt(0));
  check('导出头像 blob 可解码且字节一致', decoded.length === AVATAR.length && decoded.every((v, i) => v === AVATAR[i]));
  check('导出留痕 backup.export', state.audit.some((r) => r.action === 'backup.export'));
}

{
  const { db } = makeDb();
  const env = { DB: db, ADMIN_PASSWORD: 'test-admin-pw', ASSETS };
  const { ctx } = makeCtx();
  const login = await worker.fetch(req('/api/hub/login', { method: 'POST', body: { password: 'test-admin-pw' } }), env, ctx);
  const { token } = await login.json();
  const run = await worker.fetch(req('/api/hub/backup/run', { method: 'POST', token }), env, ctx);
  eq('无 BACKUPS 绑定时立即备份 -> 500', run.status, 500);
  const list = await worker.fetch(req('/api/hub/backup/list', { token }), env, ctx);
  const lj = await list.json();
  eq('无 BACKUPS 绑定时列表 available:false', lj.available, false);
}

console.log(`\n== backup harness: ${pass} pass, ${fail} fail ==`);
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
