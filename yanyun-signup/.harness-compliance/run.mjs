// Commercialization-audit A2/A3/A4/A7 fix acceptance (2026-10-25):
//  A4: the anonymous guild-creation endpoint POST /api/onboard is
//      deleted — a real worker.fetch probe must 404 and add zero
//      tenants; the guild-admin token's 'fallback-secret' fallback is
//      now fail-closed (no ADMIN_PASSWORD -> login 500; no secret ->
//      admin surface 500).
//  A2: legalPage(TERMS/PRIVACY) is publicly reachable; body = zh-CN
//      source + full en translation, es/fr/zh-TW fall back per-field
//      to the source (titles and other UI copy still localize in all 5).
//  A3: viewer footer fields (unofficial disclaimer + terms/privacy
//      links) match the catalog in all 5 locales; the login-page
//      privacy line now matches actual data handling.
//  A7: error_log write/truncate/portal-read full chain — direct
//      logError writes, worker-level injected uncaught exceptions
//      (REST 500 + logged), GraphQL uncaught exceptions logged via the
//      yoga plugin while business-copy errors are not, and
//      GET /api/hub/errors readable after auth.
// FakeDB routes by SQL shape; error_log and tenant updates land in
// real in-memory tables.
import { yoga } from '../src/graphql.ts';
import { typeDefs } from '../src/graphql-schema.ts';
import { CATALOG } from '../src/domains/platform/i18n.ts';
import { logError, recentErrors } from '../src/domains/platform/index.ts';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}
function eq(name, got, want) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

async function sha256hex(str) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
function makeDb({ tenants = [], throwOnTenantsList = false } = {}) {
  // throwOnTenantsList now targets the hub-admin tenant list query
  // (listTenantsHubAdmin: FROM tenants t ORDER BY t.created_at) — the
  // retired public /api/tenants read is gone with product REST.
  const state = { tenants: tenants.map((t) => ({ ...t })), errorLog: [], tenantInserts: 0 };
  function route(kind, sql, b) {
    // Data-layer (Drizzle) SQL normalization: strip quotes + error_log. qualifiers (routing match only).
    sql = sql.replace(/"/g, '').replace(/error_log\./g, '');
    if (/error_log/.test(sql)) {
      if (/INSERT INTO error_log/.test(sql)) {
        state.errorLog.push({ id: state.errorLog.length + 1, at: b[0], source: b[1], name: b[2], message: b[3], tenant: b[4], context: b[5], stack: b[6] });
        return { meta: {} };
      }
      if (/COUNT\(\*\)/.test(sql)) {
        // Legacy .first() channel returns {c}; data-layer counting uses the .all() channel, returning {results:[{c}]}.
        return kind === 'all' ? { results: [{ c: state.errorLog.length }] } : { c: state.errorLog.length };
      }
      if (/FROM error_log/.test(sql)) return { results: [...state.errorLog].sort((x, y) => y.id - x.id).slice(0, b[0] || 50) };
      return { meta: {} }; // CREATE TABLE / INDEX / DELETE(prune)
    }
    if (/INSERT INTO tenants/.test(sql)) {
      state.tenantInserts++;
      state.tenants.push({ slug: b[0], guild_name: b[1], password_hash: b[2], announcement: b[3] });
      return { meta: {} };
    }
    if (/FROM tenants/.test(sql)) {
      if (throwOnTenantsList && /FROM tenants( t)? ORDER BY/.test(sql)) throw new TypeError('boom-test');
      if (/WHERE slug/.test(sql)) {
        const t = state.tenants.find((x) => x.slug === b[0]) || null;
        return kind === 'first' ? t : { results: t ? [t] : [] };
      }
      return kind === 'first' ? (state.tenants[0] || null) : { results: state.tenants };
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

function makeCtx() {
  const pending = [];
  return { ctx: { waitUntil(p) { pending.push(Promise.resolve(p).catch(() => {})); } }, pending };
}
const ASSETS = { fetch: async () => new Response('not found', { status: 404 }) };

/* ================= A4: onboard removal + fallback fail-closed ================= */
{
  const worker = (await import('../src/worker.ts')).default;
  const { db, state } = makeDb({ tenants: [{ slug: 'jijiguagua', guild_name: '叽哩呱啦', password_hash: 'x' }] });
  const env = { DB: db, ADMIN_PASSWORD: 'test-admin-pw', ASSETS };
  const { ctx, pending } = makeCtx();

  const res = await worker.fetch(new Request('http://local/api/onboard', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ slug: 'evilguild', guild_name: '冒名百业', password: '12345678', hp: '' }),
  }), env, ctx);
  eq('A4 匿名 POST /api/onboard -> 404', res.status, 404);
  const j = await res.json();
  eq('A4 响应 ok:false', j.ok, false);
  eq('A4 租户表零新增', state.tenantInserts, 0);
  eq('A4 租户数不变', state.tenants.length, 1);
  await Promise.all(pending);
}

/* fallback-secret fail-closed */
{
  const worker = (await import('../src/worker.ts')).default;
  const hash = await sha256hex('guildpass123');
  const { db } = makeDb({ tenants: [{ slug: 'testguild', guild_name: '测试百业', password_hash: hash }] });
  const { ctx } = makeCtx();

  // No ADMIN_PASSWORD: guild-admin login must 500 even with the correct password (no token issued).
  const noPwEnv = { DB: db, ASSETS };
  const r1 = await worker.fetch(new Request('http://local/api/testguild/admin/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'guildpass123' }),
  }), noPwEnv, ctx);
  eq('A4 无超管密码时百业管理员登录 -> 500 fail-closed', r1.status, 500);
  const j1 = await r1.json();
  check('A4 500 响应不含 token', !j1.token, JSON.stringify(j1).slice(0, 100));

  // No ADMIN_PASSWORD: admin-surface middleware 500s (neither a pass-through nor an ordinary 401).
  const r2 = await worker.fetch(new Request('http://local/api/testguild/admin/profile', {
    headers: { authorization: 'Bearer garbage.token' },
  }), noPwEnv, ctx);
  eq('A4 无超管密码时管理面 -> 500 fail-closed', r2.status, 500);

  // With ADMIN_PASSWORD (production shape): login issues a token normally.
  const pwEnv = { DB: db, ADMIN_PASSWORD: 'test-admin-pw', ASSETS };
  const r3 = await worker.fetch(new Request('http://local/api/testguild/admin/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'guildpass123' }),
  }), pwEnv, ctx);
  eq('A4 有超管密码时百业管理员登录 -> 200', r3.status, 200);
  const j3 = await r3.json();
  check('A4 正常签发 token', typeof j3.token === 'string' && j3.token.includes('.'));
}

/* ================= A2/A3: legal pages + footer fields ================= */
async function gql(query, { locale = 'zh-CN', db } = {}) {
  const { db: d } = db ? { db } : makeDb({});
  const ctx = { env: { DB: d }, request: new Request('http://local/graphql'), user: null, locale, browserLocale: locale, executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query }),
  }), ctx);
  return res.json();
}
{
  check('A2 schema 含 legalPage/LegalPage', typeDefs.includes('legalPage(kind: LegalKind!)') && typeDefs.includes('type LegalPage'));
  check('A2 schema 无 Strings 类型', !/(?:^|\n)\s*(?:type|interface|union|enum|input)\s+\w*Strings/.test(typeDefs));
  check('A3 schema 含页脚三字段', ['footerDisclaimerText', 'footerTermsLabel', 'footerPrivacyLabel'].every((f) => typeDefs.includes(f)));

  const termsQ = '{ legalPage(kind: TERMS) { kind title updatedText backLabel sections { heading body } } }';
  const zh = await gql(termsQ, { locale: 'zh-CN' });
  const tp = zh.data?.legalPage;
  eq('A2 条款 kind', tp?.kind, 'TERMS');
  eq('A2 条款标题 zh-CN', tp?.title, '服务条款');
  check('A2 条款 6 节', tp?.sections?.length === 6, `n=${tp?.sections?.length}`);
  check('A2 条款首节含非官方声明', (tp?.sections?.[0]?.body || '').includes('没有任何隶属或背书关系'));
  check('A2 条款更新日期', (tp?.updatedText || '').includes('2026'));

  const en = await gql('{ legalPage(kind: PRIVACY) { title sections { heading body } } }', { locale: 'en' });
  const pp = en.data?.legalPage;
  eq('A2 隐私标题 en', pp?.title, 'Privacy Policy');
  check('A2 隐私 en 首节含 refresh token', (pp?.sections?.[0]?.body || '').includes('refresh token'));
  check('A2 隐私 en 权利节如实写无自助注销', (pp?.sections?.[4]?.body || '').includes('does not yet offer a self-service'));

  // Fallback: es/fr/zh-TW body = zh-CN source; titles are UI copy and localize as usual.
  const zhBody = tp.sections.map((s) => s.body).join('|');
  for (const [loc, title] of [['es', 'Términos del servicio'], ['fr', "Conditions d'utilisation"], ['zh-TW', '服務條款']]) {
    const r = await gql(termsQ, { locale: loc });
    eq(`A2 条款标题本地化 @${loc}`, r.data?.legalPage?.title, title);
    eq(`A2 条款正文回退源文 @${loc}`, r.data?.legalPage?.sections?.map((s) => s.body).join('|'), zhBody);
  }

  // Footer fields match the catalog in all 5 locales.
  for (const loc of ['zh-CN', 'en', 'es', 'fr', 'zh-TW']) {
    const v = await gql('{ viewer { footerDisclaimerText footerTermsLabel footerPrivacyLabel loginPrivacyText } }', { locale: loc });
    eq(`A3 disclaimer @${loc}`, v.data?.viewer?.footerDisclaimerText, CATALOG.legal.disclaimer[loc]);
    eq(`A3 termsLabel @${loc}`, v.data?.viewer?.footerTermsLabel, CATALOG.legal.termsLink[loc]);
    eq(`A3 privacyLabel @${loc}`, v.data?.viewer?.footerPrivacyLabel, CATALOG.legal.privacyLink[loc]);
  }
  const lp = await gql('{ viewer { loginPrivacyText } }', { locale: 'zh-CN' });
  check('A2 登录隐私行与实际一致 (含登录授权/详见隐私政策)', lp.data?.viewer?.loginPrivacyText.includes('登录授权') && lp.data.viewer.loginPrivacyText.includes('隐私政策'), lp.data?.viewer?.loginPrivacyText);
}

/* ================= A7: error_log full chain ================= */
{
  // Direct write + truncation + read-back.
  const { db, state } = makeDb({});
  const longErr = new Error('x'.repeat(50));
  longErr.stack = 'Error: x\n' + 's'.repeat(4000);
  const okWrite = await logError(db, { source: 'harness', error: longErr, tenant: 'jijiguagua', context: { eventId: 41 } });
  eq('A7 logError 写入成功', okWrite, true);
  eq('A7 落库一条', state.errorLog.length, 1);
  check('A7 stack 截断 <=1500', (state.errorLog[0].stack || '').length <= 1500, `len=${state.errorLog[0].stack.length}`);
  eq('A7 context JSON 落库', state.errorLog[0].context, '{"eventId":41}');
  const rec = await recentErrors(db, 50);
  eq('A7 recentErrors 读回一条', rec.errors.length, 1);
  check('A7 last24h 计数 >=1', rec.last24h >= 1, `n=${rec.last24h}`);

  // Write failures stay silent: logError never throws.
  const badDb = { prepare() { throw new Error('db down'); } };
  let threw = false;
  try { await logError(badDb, { source: 'x', message: 'y' }); } catch { threw = true; }
  check('A7 logError 对坏 DB 不抛错', !threw);
}
{
  // Worker-level injection: uncaught Hono-handler exception -> 500 +
  // error_log(source=rest). Vehicle: the hub tenant list (kept
  // surface) with a DB that throws inside its query.
  const worker = (await import('../src/worker.ts')).default;
  const { db, state } = makeDb({ throwOnTenantsList: true });
  const env = { DB: db, ADMIN_PASSWORD: 'test-admin-pw', ASSETS };
  const { ctx, pending } = makeCtx();
  const login0 = await worker.fetch(new Request('http://local/api/hub/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'test-admin-pw' }),
  }), env, ctx);
  const lj0 = await login0.json();
  const res = await worker.fetch(new Request('http://local/api/hub/tenants', {
    headers: { authorization: 'Bearer ' + lj0.token },
  }), env, ctx);
  eq('A7 Hono 未捕获异常 -> 500', res.status, 500);
  await Promise.all(pending);
  const restRow = state.errorLog.find((r) => r.source === 'rest');
  check('A7 Hono 异常落 error_log', !!restRow, JSON.stringify(state.errorLog).slice(0, 200));
  check('A7 Hono 落库含原始消息', (restRow?.message || '').includes('boom-test'), restRow?.message);

  // Portal read: log in for a token -> GET /api/hub/errors; no token -> 401.
  const login = await worker.fetch(new Request('http://local/api/hub/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'test-admin-pw' }),
  }), env, ctx);
  const lj = await login.json();
  check('A7 hub 登录签发 token', typeof lj.token === 'string');
  const er = await worker.fetch(new Request('http://local/api/hub/errors', {
    headers: { authorization: 'Bearer ' + lj.token },
  }), env, ctx);
  eq('A7 hub errors -> 200', er.status, 200);
  const ej = await er.json();
  check('A7 hub errors 含注入行', (ej.errors || []).some((r) => r.source === 'rest' && r.message.includes('boom-test')), JSON.stringify(ej).slice(0, 200));
  check('A7 hub errors last24h >=1', ej.last24h >= 1, `n=${ej.last24h}`);
  const er401 = await worker.fetch(new Request('http://local/api/hub/errors'), env, ctx);
  eq('A7 hub errors 无 token -> 401', er401.status, 401);
}
{
  // GraphQL: uncaught exceptions are logged via the plugin; business-copy errors (guildNotFound) are not.
  const { db, state } = makeDb({ throwOnTenantsList: true });
  const before = state.errorLog.length;
  await gql('{ hubPage { guilds { slug } } }', { db });
  await sleep(120);
  const gqlRow = state.errorLog.slice(before).find((r) => r.source === 'graphql');
  check('A7 GraphQL 未捕获异常落 error_log', !!gqlRow, JSON.stringify(state.errorLog).slice(0, 200));
  check('A7 GraphQL 落库含原始消息', (gqlRow?.message || '').includes('boom-test'), gqlRow?.message);

  const ok = makeDb({});
  const beforeOk = ok.state.errorLog.length;
  const notFound = await gql('{ guildPage(slug: "nope") { slug } }', { db: ok.db });
  check('A7 业务错误仍回 GraphQL error', Array.isArray(notFound.errors) && notFound.errors.length > 0);
  await sleep(120);
  eq('A7 业务文案错误不落 error_log', ok.state.errorLog.length, beforeOk);
}

console.log(`\n== compliance harness: ${pass} pass, ${fail} fail ==`);
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
