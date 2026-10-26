// Hub super-admin audit trail acceptance:
//  - login success AND failure leave audit rows (failure carries only a
//    reason digest, never the attempted password);
//  - a webhook write is audited with a digest (replaced/cleared) — the
//    webhook URL itself must never appear in the stored summary;
//  - settings writes audit the changed key names only;
//  - tenant deletion is audited;
//  - GET /api/hub/errors (sensitive read) is audited as errors.view;
//  - GET /api/hub/audit requires hub auth, lists newest-first, filters
//    by tenant, paginates, and audits its own viewing;
//  - a broken audit store never breaks the audited operation.
// FakeDB routes by SQL shape (same pattern as .harness-compliance);
// hub_audit_log / tenants / settings land in real in-memory tables.
let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}
function eq(name, got, want) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* Drizzle query-builder channel: selects run via stmt.bind(...).raw();
 * convert routed object rows into value arrays in SELECT column order
 * (same helper as .harness-compliance). */
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
function makeDb({ failAudit = false } = {}) {
  const state = {
    // Key order mirrors the tenants entity column order (SELECT * mapping).
    tenants: [
      { slug: 'alpha', guild_name: '甲百业', password_hash: 'h1', announcement: '', created_at: '2026-01-01', discord_webhook: '', slogan: null, master_name: null, logo_url: null, bg_image_url: null, feature_fixed_teams: null },
      { slug: 'beta', guild_name: '乙百业', password_hash: 'h2', announcement: '', created_at: '2026-01-02', discord_webhook: '', slogan: null, master_name: null, logo_url: null, bg_image_url: null, feature_fixed_teams: null },
    ],
    settings: [], // {tenant, key, value}
    audit: [],    // {id, at, actor, action, tenant, summary, ip}
    events: [{ id: 1, tenant: 'alpha' }, { id: 2, tenant: 'beta' }],
    signups: [{ id: 1, event_id: 1 }, { id: 2, event_id: 2 }],
    users: [
      { discord_id: '3001', username: '代登目标', avatar: 'https://cdn.example/a.png', guilds_json: JSON.stringify([{ id: 'G9', name: '服九', icon: '', permissions: '0', owner: false }]) },
      { discord_id: '3002', username: '另一个人', avatar: '', guilds_json: '[]' },
    ],
    nicks: [
      { discord_id: '3002', guild_id: 'G9', nick: '服昵乙' },
    ],
  };
  function route(kind, sql, b) {
    const raw = sql;
    sql = sql.replace(/"/g, '').replace(/hub_audit_log\./g, '').replace(/tenants\./g, '').replace(/settings\./g, '').replace(/user_guild_nicks\./g, '').replace(/users\./g, '');
    if (/hub_audit_log/.test(sql)) {
      if (/INSERT INTO hub_audit_log/.test(sql)) {
        if (failAudit) throw new Error('audit store down');
        state.audit.push({ id: state.audit.length + 1, at: b[0], actor: b[1], action: b[2], tenant: b[3], summary: b[4], ip: b[5] });
        return { meta: {} };
      }
      if (/COUNT\(\*\)/.test(sql)) {
        const rows = /WHERE tenant =/.test(sql) ? state.audit.filter((r) => r.tenant === b[0]) : state.audit;
        return kind === 'all' ? { results: [{ c: rows.length }] } : { c: rows.length };
      }
      if (/DELETE FROM hub_audit_log/.test(sql)) {
        if (/WHERE at </.test(sql)) {
          const cutoff = b[0];
          state.audit = state.audit.filter((r) => r.at >= cutoff);
        } else {
          const cap = b[0];
          const keep = [...state.audit].sort((x, y) => y.id - x.id).slice(0, cap).map((r) => r.id);
          state.audit = state.audit.filter((r) => keep.includes(r.id));
        }
        return { meta: {} };
      }
      if (/FROM hub_audit_log/.test(sql)) {
        let rows = [...state.audit];
        let limit = 50, offset = 0;
        if (/WHERE tenant =/.test(sql)) { rows = rows.filter((r) => r.tenant === b[0]); limit = b[1]; offset = b[2]; }
        else { limit = b[0]; offset = b[1]; }
        rows = rows.sort((x, y) => y.id - x.id).slice(offset, offset + limit);
        return { results: rows };
      }
      return { meta: {} }; // CREATE TABLE / INDEX
    }
    if (/settings/.test(sql)) {
      if (/INSERT INTO settings/.test(sql)) {
        const [tenant, key, value] = b;
        const hit = state.settings.find((r) => r.tenant === tenant && r.key === key);
        if (hit) hit.value = value; else state.settings.push({ tenant, key, value });
        return { meta: {} };
      }
      if (/FROM settings/.test(sql)) {
        if (/tenant = \? AND key = \?/.test(sql) || /WHERE tenant = .* AND key =/.test(sql)) {
          const row = state.settings.find((r) => r.tenant === b[0] && r.key === b[1]);
          return { results: row ? [{ value: row.value }] : [] };
        }
        return { results: state.settings.filter((r) => r.tenant === '').map((r) => ({ key: r.key, value: r.value })) };
      }
      return { meta: {} };
    }
    if (/tenants/.test(sql)) {
      if (/UPDATE tenants SET discord_webhook/.test(sql)) {
        const t = state.tenants.find((x) => x.slug === b[1]);
        if (t) t.discord_webhook = b[0];
        return { meta: {} };
      }
      if (/DELETE FROM tenants/.test(sql)) {
        state.tenants = state.tenants.filter((x) => x.slug !== b[0]);
        return { meta: {} };
      }
      if (/FROM tenants/.test(sql)) {
        if (/WHERE slug/.test(sql)) {
          const t = state.tenants.find((x) => x.slug === b[0]) || null;
          return kind === 'first' ? t : { results: t ? [t] : [] };
        }
        return { results: state.tenants };
      }
      return { meta: {} };
    }
    if (/DELETE FROM signups/.test(sql)) {
      const evIds = state.events.filter((e) => e.tenant === b[0]).map((e) => e.id);
      state.signups = state.signups.filter((sg) => !evIds.includes(sg.event_id));
      return { meta: {} };
    }
    if (/DELETE FROM events/.test(sql)) {
      state.events = state.events.filter((e) => e.tenant !== b[0]);
      return { meta: {} };
    }
    if (/user_guild_nicks/.test(sql)) {
      // LoginAs search: nick snapshot join back to the user row.
      const needle = String(b[0] || '').replace(/[%\\]/g, '');
      const rows = state.nicks.filter((n) => n.nick.includes(needle)).map((n) => {
        const u = state.users.find((x) => x.discord_id === n.discord_id);
        return u ? { discord_id: u.discord_id, username: u.username, avatar: u.avatar, nick: n.nick } : null;
      }).filter(Boolean);
      return { results: rows };
    }
    if (/FROM users/.test(sql)) {
      if (/WHERE discord_id =/.test(sql)) {
        const u = state.users.find((x) => x.discord_id === String(b[0])) || null;
        return { results: u ? [u] : [] };
      }
      if (/LIKE/.test(sql)) {
        const needle = String(b[0] || '').replace(/[%\\]/g, '');
        return { results: state.users.filter((u) => u.username.includes(needle) || u.discord_id.includes(needle)) };
      }
      return { results: state.users };
    }
    if (/DELETE FROM results/.test(sql)) return { meta: {} };
    if (/error_log/.test(sql)) {
      if (/COUNT\(\*\)/.test(sql)) return kind === 'all' ? { results: [{ c: 0 }] } : { c: 0 };
      return { results: [] };
    }
    void raw;
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

const WEBHOOK = 'https://discord.com/api/webhooks/1234567890/SECRET_TOKEN_DO_NOT_LEAK';

/* ================= login + writes + reads ================= */
{
  const { db, state } = makeDb({});
  const env = { DB: db, ADMIN_PASSWORD: 'test-admin-pw', ASSETS };
  const { ctx } = makeCtx();

  // Failed login: 401, audited with a reason digest only.
  const bad = await worker.fetch(req('/api/hub/login', { method: 'POST', body: { password: 'wrong-pw' } }), env, ctx);
  eq('坏密码登录 -> 401', bad.status, 401);
  const failRow = state.audit.find((r) => r.action === 'auth.login_failed');
  check('登录失败留痕', !!failRow);
  check('失败摘要只有 reason', !!failRow && JSON.parse(failRow.summary).reason === 'bad_password', failRow && failRow.summary);
  check('失败留痕不含尝试的密码', !!failRow && !JSON.stringify(state.audit).includes('wrong-pw'));

  // Good login: token + auth.login row.
  const login = await worker.fetch(req('/api/hub/login', { method: 'POST', body: { password: 'test-admin-pw' } }), env, ctx);
  eq('正确密码登录 -> 200', login.status, 200);
  const { token } = await login.json();
  check('登录成功留痕', state.audit.some((r) => r.action === 'auth.login'));
  check('留痕含来源 IP', state.audit.every((r) => typeof r.ip === 'string'));

  // Webhook write: audited as a digest, the URL never reaches the log.
  const put = await worker.fetch(req('/api/hub/tenants/alpha/reminder', {
    method: 'PUT', token, body: { webhook: WEBHOOK, enabled: true },
  }), env, ctx);
  eq('reminder 配置写入 -> 200', put.status, 200);
  const remRow = state.audit.find((r) => r.action === 'reminder.update');
  check('reminder 写入留痕', !!remRow && remRow.tenant === 'alpha');
  const remSummary = remRow ? JSON.parse(remRow.summary) : {};
  eq('摘要记 webhook=replaced', remSummary.webhook, 'replaced');
  eq('摘要记 enabled=true', remSummary.enabled, true);
  check('审计全表绝不含 Webhook 全文', !JSON.stringify(state.audit).includes('SECRET_TOKEN_DO_NOT_LEAK'));
  check('租户行真的换了 webhook', state.tenants.find((t) => t.slug === 'alpha').discord_webhook === WEBHOOK);

  // Webhook clear: digest says cleared.
  const clear = await worker.fetch(req('/api/hub/tenants/alpha/reminder', {
    method: 'PUT', token, body: { webhook: '' },
  }), env, ctx);
  eq('reminder 清除 webhook -> 200', clear.status, 200);
  const clearRow = state.audit.filter((r) => r.action === 'reminder.update').pop();
  eq('摘要记 webhook=cleared', clearRow && JSON.parse(clearRow.summary).webhook, 'cleared');

  // Settings write: only the key names are digested.
  const set = await worker.fetch(req('/api/hub/settings', {
    method: 'PUT', token, body: { game_version: '国际服 V9.9', game_notice: '公告' },
  }), env, ctx);
  eq('全站设置写入 -> 200', set.status, 200);
  const setRow = state.audit.find((r) => r.action === 'settings.update');
  check('设置留痕含键名', !!setRow && JSON.stringify(JSON.parse(setRow.summary).keys) === '["game_version","game_notice"]', setRow && setRow.summary);
  check('设置留痕不含设置值', !!setRow && !setRow.summary.includes('V9.9') && !setRow.summary.includes('公告'));

  // Sensitive read: /errors is audited.
  const beforeErrors = state.audit.filter((r) => r.action === 'errors.view').length;
  const er = await worker.fetch(req('/api/hub/errors', { token }), env, ctx);
  eq('错误日志查看 -> 200', er.status, 200);
  eq('errors.view 留痕 +1', state.audit.filter((r) => r.action === 'errors.view').length, beforeErrors + 1);

  // Tenant delete is audited and really cascades.
  const del = await worker.fetch(req('/api/hub/tenants/beta', { method: 'DELETE', token }), env, ctx);
  eq('删除百业 -> 200', del.status, 200);
  check('删除百业留痕', state.audit.some((r) => r.action === 'tenant.delete' && r.tenant === 'beta'));
  check('百业真的删掉', !state.tenants.some((t) => t.slug === 'beta'));
  check('级联删掉其活动', !state.events.some((e) => e.tenant === 'beta'));

  // Audit read: auth required, newest first, tenant filter, pagination.
  const noTok = await worker.fetch(req('/api/hub/audit'), env, ctx);
  eq('审计查看无 token -> 401', noTok.status, 401);
  const list = await worker.fetch(req('/api/hub/audit?limit=50', { token }), env, ctx);
  eq('审计查看 -> 200', list.status, 200);
  const lj = await list.json();
  check('审计列表非空', lj.total >= 6 && lj.entries.length >= 6, `total=${lj.total}`);
  check('审计列表最新在前', lj.entries[0].action === 'errors.view' || lj.entries[0].action === 'tenant.delete', lj.entries[0].action);
  check('查看审计本身也留痕', state.audit.some((r) => r.action === 'audit.view'));
  const onlyAlpha = await worker.fetch(req('/api/hub/audit?tenant=alpha', { token }), env, ctx);
  const aj = await onlyAlpha.json();
  check('按租户筛选全中', aj.entries.every((r) => r.tenant === 'alpha') && aj.total >= 2, `total=${aj.total}`);
  const page1 = await worker.fetch(req('/api/hub/audit?limit=3&offset=0', { token }), env, ctx);
  const p1 = await page1.json();
  const page2 = await worker.fetch(req('/api/hub/audit?limit=3&offset=3', { token }), env, ctx);
  const p2 = await page2.json();
  eq('分页第一页 3 条', p1.entries.length, 3);
  // Every /audit read appends its own audit.view row AFTER the page is
  // read, so the second fetch's window shifts by exactly that one row:
  // page 2 must start with page 1's last row, then continue older rows.
  eq('分页窗口因自审计恰好移位一条', p2.entries[0].id, p1.entries[2].id);
  check('分页第二页其余为更旧行', p2.entries.slice(1).every((r) => r.id < p1.entries[2].id));
}

/* ================= LoginAs: search, mint, exit — all audited ================= */
{
  const { db, state } = makeDb({});
  const env = { DB: db, ADMIN_PASSWORD: 'test-admin-pw', SESSION_SECRET: 'harness-session-secret', ASSETS };
  const { ctx } = makeCtx();
  const login = await worker.fetch(req('/api/hub/login', { method: 'POST', body: { password: 'test-admin-pw' } }), env, ctx);
  const { token } = await login.json();

  // Mint without a hub token -> 401 (a session cookie never authorizes a mint).
  const noTok = await worker.fetch(req('/api/hub/login-as', { method: 'POST', body: { discordId: '3001' } }), env, ctx);
  eq('无 hub token 代登录 -> 401', noTok.status, 401);

  // User search: global-name hit, nick-snapshot hit, discord-id hit.
  const byName = await (await worker.fetch(req('/api/hub/users?q=' + encodeURIComponent('代登'), { token }), env, ctx)).json();
  check('按全局名搜到目标', byName.users?.length === 1 && byName.users[0].discordId === '3001', JSON.stringify(byName).slice(0, 160));
  const byNick = await (await worker.fetch(req('/api/hub/users?q=' + encodeURIComponent('服昵乙'), { token }), env, ctx)).json();
  check('按服昵称搜到目标', byNick.users?.length === 1 && byNick.users[0].discordId === '3002' && byNick.users[0].nick === '服昵乙', JSON.stringify(byNick).slice(0, 160));
  const byId = await (await worker.fetch(req('/api/hub/users?q=3001', { token }), env, ctx)).json();
  check('按 ID 搜到目标', byId.users?.length === 1 && byId.users[0].discordId === '3001');

  // Mint for a never-registered user -> 404 and no audit row.
  const ghost = await worker.fetch(req('/api/hub/login-as', { method: 'POST', token, body: { discordId: '9999' } }), env, ctx);
  eq('未注册用户代登录 -> 404', ghost.status, 404);
  check('404 不留 mint 审计', !state.audit.some((r) => r.action === 'auth.login_as'));

  // Mint success: the cookie JWT carries sub + imp mark + 30-min window.
  const mint = await worker.fetch(req('/api/hub/login-as', { method: 'POST', token, body: { discordId: '3001' } }), env, ctx);
  eq('代登录 mint -> 200', mint.status, 200);
  const setCookie = mint.headers.get('set-cookie') || '';
  check('mint 下发 yy_session cookie', setCookie.startsWith('yy_session='));
  const jwt = setCookie.slice('yy_session='.length).split(';')[0];
  const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString('utf8'));
  eq('JWT sub = 目标', payload.sub, '3001');
  eq('JWT imp.by = hub-admin', payload.imp?.by, 'hub-admin');
  check('JWT imp.at 是签发时刻', Math.abs((payload.imp?.at || 0) - Math.floor(Date.now() / 1000)) <= 5);
  eq('JWT 有效期 = 30 分钟', payload.exp - payload.iat, 1800);
  eq('JWT 服务器列表来自 guilds_json', JSON.stringify(payload.guilds), '["G9"]');
  const mintRow = state.audit.find((r) => r.action === 'auth.login_as');
  check('mint 留痕', !!mintRow);
  const mintSummary = mintRow ? JSON.parse(mintRow.summary) : {};
  eq('mint 摘要记目标 ID', mintSummary.targetDiscordId, '3001');
  eq('mint 摘要记目标昵称', mintSummary.targetName, '代登目标');
  check('审计不含 cookie/JWT', !JSON.stringify(state.audit).includes(jwt) && !JSON.stringify(state.audit).includes('yy_session'));

  // Exit with the impersonated cookie: audited, cookie cleared.
  const exit = await worker.fetch(new Request('http://local/auth/login-as/exit', {
    method: 'POST', headers: { cookie: 'yy_session=' + jwt },
  }), env, ctx);
  eq('代登录退出 -> 200', exit.status, 200);
  check('退出清除 cookie', (exit.headers.get('set-cookie') || '').includes('Max-Age=0'));
  const exitRow = state.audit.find((r) => r.action === 'auth.login_as_exit');
  check('退出留痕', !!exitRow && JSON.parse(exitRow.summary).targetDiscordId === '3001');

  // Exit with no session: still 200 + clears, but no audit row is added.
  const exitRowsBefore = state.audit.filter((r) => r.action === 'auth.login_as_exit').length;
  const anonExit = await worker.fetch(new Request('http://local/auth/login-as/exit', { method: 'POST' }), env, ctx);
  eq('无会话退出 -> 200', anonExit.status, 200);
  eq('无会话退出不留痕', state.audit.filter((r) => r.action === 'auth.login_as_exit').length, exitRowsBefore);
}

/* ================= audit store failure never breaks the op ================= */
{
  const { db } = makeDb({ failAudit: true });
  const env = { DB: db, ADMIN_PASSWORD: 'test-admin-pw', ASSETS };
  const { ctx } = makeCtx();
  const login = await worker.fetch(req('/api/hub/login', { method: 'POST', body: { password: 'test-admin-pw' } }), env, ctx);
  eq('审计库故障时登录仍 -> 200', login.status, 200);
  const { token } = await login.json();
  const set = await worker.fetch(req('/api/hub/settings', {
    method: 'PUT', token, body: { game_version: '国际服 V1.0' },
  }), env, ctx);
  eq('审计库故障时设置写入仍 -> 200', set.status, 200);
  const er = await worker.fetch(req('/api/hub/errors', { token }), env, ctx);
  eq('审计库故障时错误查看仍 -> 200', er.status, 200);
}

console.log(`\n== audit harness: ${pass} pass, ${fail} fail ==`);
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
