// i18n 验收 (后端层): 设置页语言偏好全链路 + 文案矩阵抽查 + 惰性证明。
// FakeDB 按 SQL 子串路由; user/pref 走真实 auth.js 帮助函数 + 真实 yoga。
import { yoga } from '../src/graphql.js';
import { getUserLocalePref } from '../src/auth.js';
import { negotiateLocale, CATALOG, SUPPORTED_LOCALES, i18nProbe } from '../src/i18n.js';
import { typeDefs } from '../src/graphql-schema.js';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') { if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); } }
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
const users = new Map(); // discord_id -> { locale_pref }
users.set('2001', { locale_pref: null });
users.set('2002', { locale_pref: 'zh-CN' });
const tenants = [{ slug: 'livetest', guild_name: '测试百业', slogan: '', announcement: '', discord_guild_id: '', created_at: 1 }];
function stmt(sql) {
  // 数据层 (Drizzle) SQL 规范化: 去引号 (仅路由匹配, 与 identity 套件同口径)
  sql = sql.replace(/"/g, '');
  const q = {
    _binds: [], bind(...a) { this._binds = a; return this; },
    async raw() { const res = await this.all(); return toRawRows(sql, (res && res.results) || []); },
    async first() {
      if (sql.includes('SELECT locale_pref FROM users')) { const u = users.get(String(q._binds[0])); return u ? { locale_pref: u.locale_pref } : null; }
      if (sql.includes('FROM tenants WHERE slug')) return tenants.find(t => t.slug === q._binds[0]) || null;
      if (sql.includes('FROM settings')) return null;
      return null;
    },
    async all() {
      // 数据层点查走 .all() 通道 (drizzle db.get): users.locale_pref 读
      if (sql.includes('SELECT locale_pref FROM users')) { const u = users.get(String(q._binds[0])); return { results: u ? [{ locale_pref: u.locale_pref }] : [] }; }
      if (sql.includes('FROM tenants')) return { results: tenants };
      return { results: [] };
    },
    async run() {
      if (sql.startsWith('UPDATE users SET locale_pref')) { const u = users.get(String(q._binds[1])); if (u) u.locale_pref = q._binds[0]; return { meta: {} }; }
      return { meta: {} };
    },
  };
  return q;
}
const db = { prepare: (sql) => stmt(sql) };
const env = { DB: db };

async function gql(query, { user = null, locale = 'zh-CN', browserLocale } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale, browserLocale: browserLocale ?? locale, executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query }),
  }), ctx);
  return res.json();
}

/* ---------------- (a) schema ---------------- */
check('schema 无 Strings 类型', !/(?:^|\n)\s*(?:type|interface|union|enum|input)\s+\w*Strings/.test(typeDefs));
check('schema 含 SettingsPage', typeDefs.includes('type SettingsPage'));
check('schema 含 updateMyLocale', typeDefs.includes('updateMyLocale'));
check('schema 含 myLocalePref/myEffectiveLocale', typeDefs.includes('myLocalePref') && typeDefs.includes('myEffectiveLocale'));

/* ---------------- (b) 设置页文案 × 5 locale ---------------- */
const SETTINGS_FIELDS = [
  ['settingsTitle', 'title'], ['settingsLanguageLabel', 'languageLabel'], ['settingsLanguageHint', 'languageHint'],
  ['settingsAutoLabel', 'autoLabel'], ['settingsLangZhCnLabel', 'langZhCn'], ['settingsLangZhTwLabel', 'langZhTw'],
  ['settingsLangEnLabel', 'langEn'], ['settingsLangEsLabel', 'langEs'], ['settingsLangFrLabel', 'langFr'],
  ['settingsSavedText', 'savedText'],
];
const settingsQuery = `{ settingsPage { ${SETTINGS_FIELDS.map(([f]) => f).join(' ')} localePref effectiveLocale } }`;
for (const loc of SUPPORTED_LOCALES) {
  const j = await gql(settingsQuery, { locale: loc });
  const page = j.data?.settingsPage;
  check(`settings ${loc} 无 errors`, !j.errors, JSON.stringify(j.errors || '').slice(0, 200));
  for (const [field, catField] of SETTINGS_FIELDS) {
    eq(`settings.${field} @${loc}`, page?.[field], CATALOG.settings[catField][loc]);
  }
  eq(`settings.effectiveLocale @${loc} (匿名)`, page?.effectiveLocale, loc);
  eq(`settings.localePref @${loc} (匿名)`, page?.localePref, null);
}

/* ---------------- (c) 偏好压过浏览器语言 (worker 同款组合) ---------------- */
// 模拟 worker.js: effective = pref || negotiateLocale(header), pref 走真实 auth 帮助函数
async function workerLocale(user, headerTag) {
  const browser = negotiateLocale(headerTag);
  const pref = user ? await getUserLocalePref(env, user.discordId) : null;
  return { effective: pref || browser, browser };
}
{
  const u2002 = { discordId: '2002', name: '乙', guilds: [] };
  const { effective, browser } = await workerLocale(u2002, 'en-US');
  eq('pref=zh-CN + 浏览器 en → effective', effective, 'zh-CN');
  const j = await gql(`{ viewer { siteTitle myLocalePref myEffectiveLocale } }`, { user: u2002, locale: effective, browserLocale: browser });
  eq('pref 用户 siteTitle 为中文源文', j.data?.viewer?.siteTitle, CATALOG.site.title['zh-CN']);
  eq('viewer.myLocalePref', j.data?.viewer?.myLocalePref, 'zh-CN');
  eq('viewer.myEffectiveLocale', j.data?.viewer?.myEffectiveLocale, 'zh-CN');

  const u2001 = { discordId: '2001', name: '甲', guilds: [] };
  const w2 = await workerLocale(u2001, 'fr-FR');
  eq('无 pref + 浏览器 fr → effective', w2.effective, 'fr');
  const j2 = await gql(`{ viewer { siteTitle myLocalePref myEffectiveLocale } }`, { user: u2001, locale: w2.effective, browserLocale: w2.browser });
  eq('无 pref 用户 siteTitle 为法文', j2.data?.viewer?.siteTitle, CATALOG.site.title.fr);
  eq('viewer.myLocalePref (无 pref)', j2.data?.viewer?.myLocalePref, null);
}

/* ---------------- (d) updateMyLocale ---------------- */
const u2001 = { discordId: '2001', name: '甲', guilds: [] };
{
  // 匿名 → loginRequired (五语 error 文案)
  for (const loc of SUPPORTED_LOCALES) {
    const j = await gql(`mutation { updateMyLocale(locale: "fr") { ok error errorCode } }`, { locale: loc });
    eq(`匿名 updateMyLocale code @${loc}`, j.data?.updateMyLocale?.errorCode, 'loginRequired');
    eq(`匿名 updateMyLocale error @${loc}`, j.data?.updateMyLocale?.error, CATALOG.errors.loginRequired[loc]);
  }
  // 不支持的值 → localeUnsupported (五语)
  for (const loc of SUPPORTED_LOCALES) {
    const j = await gql(`mutation { updateMyLocale(locale: "xx") { ok error errorCode } }`, { user: u2001, locale: loc });
    eq(`非法 locale code @${loc}`, j.data?.updateMyLocale?.errorCode, 'localeUnsupported');
    eq(`非法 locale error @${loc}`, j.data?.updateMyLocale?.error, CATALOG.errors.localeUnsupported[loc]);
    eq(`非法 locale ok @${loc}`, j.data?.updateMyLocale?.ok, false);
  }
  eq('非法值未落库', users.get('2001').locale_pref, null);
  // 设置 fr → 落库 + 回带 pref/effective
  const set = await gql(`mutation { updateMyLocale(locale: "fr") { ok errorCode localePref effectiveLocale } }`, { user: u2001, locale: 'en', browserLocale: 'en' });
  eq('设置 fr ok', set.data?.updateMyLocale?.ok, true);
  eq('设置 fr 回带 localePref', set.data?.updateMyLocale?.localePref, 'fr');
  eq('设置 fr 回带 effectiveLocale', set.data?.updateMyLocale?.effectiveLocale, 'fr');
  eq('fr 已落库', users.get('2001').locale_pref, 'fr');
  // 设置后 worker 组合: 浏览器 en 也说法文
  const w = await workerLocale(u2001, 'en-US');
  eq('落库后 effective 被偏好压过', w.effective, 'fr');
  // 清除 → 回自动, effective 回到浏览器协商值
  const clear = await gql(`mutation { updateMyLocale(locale: null) { ok localePref effectiveLocale } }`, { user: u2001, locale: 'fr', browserLocale: 'es' });
  eq('清除 ok', clear.data?.updateMyLocale?.ok, true);
  eq('清除回带 localePref', clear.data?.updateMyLocale?.localePref, null);
  eq('清除回带 effectiveLocale=浏览器', clear.data?.updateMyLocale?.effectiveLocale, 'es');
  eq('清除已落库', users.get('2001').locale_pref, null);
  const w2 = await workerLocale(u2001, 'es-ES');
  eq('清除后 effective 跟随浏览器', w2.effective, 'es');
}

/* ---------------- (e) 惰性: 只选 settingsTitle 只生成一条 ---------------- */
{
  i18nProbe.enabled = true; i18nProbe.reset();
  const j = await gql(`{ settingsPage { settingsTitle } }`, { locale: 'en' });
  eq('settingsTitle 值', j.data?.settingsPage?.settingsTitle, CATALOG.settings.title.en);
  const keys = [...i18nProbe.counts.keys()];
  check('只生成 settings.title 一条', keys.length === 1 && keys[0] === 'settings.title', JSON.stringify(keys));
  i18nProbe.enabled = false;
}

/* ---------------- (f) 抽查矩阵回归 (viewer 常用字段 × 5) ---------------- */
for (const loc of SUPPORTED_LOCALES) {
  const j = await gql(`{ viewer { siteTitle loginButtonLabel userBarSettingsLabel commonLoadingGuildText } }`, { locale: loc });
  eq(`viewer.siteTitle @${loc}`, j.data?.viewer?.siteTitle, CATALOG.site.title[loc]);
  eq(`viewer.loginButtonLabel @${loc}`, j.data?.viewer?.loginButtonLabel, CATALOG.login.button[loc]);
  eq(`viewer.userBarSettingsLabel @${loc}`, j.data?.viewer?.userBarSettingsLabel, CATALOG.userBar.settings[loc]);
  eq(`viewer.commonLoadingGuildText @${loc}`, j.data?.viewer?.commonLoadingGuildText, CATALOG.common.loadingGuild[loc]);
}

console.log(`\n==== ${pass} passed, ${fail} failed ====`);
for (const f of fails) console.log('FAIL', f);
process.exit(fail ? 1 : 0);
