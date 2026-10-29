// i18n acceptance (backend layer): settings-page language preference
// full chain + copy-matrix spot checks + laziness proof.
// FakeDB routes by SQL substring; user/pref go through the real auth
// helpers + real yoga.
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { getUserLocalePref } from '../src/domains/identity/auth.ts';
import { negotiateLocale, CATALOG, SUPPORTED_LOCALES, i18nProbe } from '../src/domains/platform/i18n.ts';
import { typeDefs } from '../src/graphql-schema.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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
/* Typed-ID fixture keys (0036): users rows are keyed by their typed
   user ID (locale_pref reads/writes go WHERE id = ?); the Discord
   IDs '2001'/'2002' survive only as the viewers' discordId. */
const UID = { U2001: 2030100001, U2002: 2030100002 };
const GID = 1030100001;
const users = new Map(); // user id (string form) -> { locale_pref }
users.set(String(UID.U2001), { locale_pref: null });
users.set(String(UID.U2002), { locale_pref: 'zh-CN' });
const tenants = [{ id: GID, slug: 'livetest', guild_name: '测试百业', slogan: '', announcement: '', discord_guild_id: '', created_at: 1 }];
function stmt(sql) {
  // Data-layer (Drizzle) SQL normalization: strip quotes (routing match only; same rule as the identity suite).
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
      // Data-layer point lookups use the .all() channel (drizzle db.get): users.locale_pref read.
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

// Simulate worker.ts: effective = pref || negotiateLocale(header); pref goes through the real auth helper (keyed by userId, as in worker.ts).
async function workerLocale(user, headerTag) {
  const browser = negotiateLocale(headerTag);
  const pref = user ? await getUserLocalePref(env, user.userId) : null;
  return { effective: pref || browser, browser };
}

describe('i18n', () => {
  it('(a) schema', async () => {
/* ---------------- (a) schema ---------------- */
check('schema 无 Strings 类型', !/(?:^|\n)\s*(?:type|interface|union|enum|input)\s+\w*Strings/.test(typeDefs));
check('schema 含 SettingsPage', typeDefs.includes('type SettingsPage'));
check('schema 含 updateMyLocale', typeDefs.includes('updateMyLocale'));
check('schema 含 myLocalePref/myEffectiveLocale', typeDefs.includes('myLocalePref') && typeDefs.includes('myEffectiveLocale'));
  });

  it('(b) Settings-page copy x 5 locales', async () => {
/* ---------------- (b) Settings-page copy x 5 locales ---------------- */
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
  });

  it('(c) Preference beats browser language (same composition as the worker)', async () => {
/* ---------------- (c) Preference beats browser language (same composition as the worker) ---------------- */
{
  const u2002 = { userId: UID.U2002, discordId: '2002', name: '乙', guilds: [] };
  const { effective, browser } = await workerLocale(u2002, 'en-US');
  eq('pref=zh-CN + 浏览器 en → effective', effective, 'zh-CN');
  const j = await gql(`{ viewer { siteTitle myLocalePref myEffectiveLocale } }`, { user: u2002, locale: effective, browserLocale: browser });
  eq('pref 用户 siteTitle 为中文源文', j.data?.viewer?.siteTitle, CATALOG.site.title['zh-CN']);
  eq('viewer.myLocalePref', j.data?.viewer?.myLocalePref, 'zh-CN');
  eq('viewer.myEffectiveLocale', j.data?.viewer?.myEffectiveLocale, 'zh-CN');

  const u2001 = { userId: UID.U2001, discordId: '2001', name: '甲', guilds: [] };
  const w2 = await workerLocale(u2001, 'fr-FR');
  eq('无 pref + 浏览器 fr → effective', w2.effective, 'fr');
  const j2 = await gql(`{ viewer { siteTitle myLocalePref myEffectiveLocale } }`, { user: u2001, locale: w2.effective, browserLocale: w2.browser });
  eq('无 pref 用户 siteTitle 为法文', j2.data?.viewer?.siteTitle, CATALOG.site.title.fr);
  eq('viewer.myLocalePref (无 pref)', j2.data?.viewer?.myLocalePref, null);
}
  });

  it('(d) updateMyLocale', async () => {
/* ---------------- (d) updateMyLocale ---------------- */
const u2001 = { userId: UID.U2001, discordId: '2001', name: '甲', guilds: [] };
{
  // Anonymous -> loginRequired (error copy in all 5 locales).
  for (const loc of SUPPORTED_LOCALES) {
    const j = await gql(`mutation { updateMyLocale(locale: "fr") { ok error errorCode } }`, { locale: loc });
    eq(`匿名 updateMyLocale code @${loc}`, j.data?.updateMyLocale?.errorCode, 'loginRequired');
    eq(`匿名 updateMyLocale error @${loc}`, j.data?.updateMyLocale?.error, CATALOG.errors.loginRequired[loc]);
  }
  // Unsupported value -> localeUnsupported (all 5 locales).
  for (const loc of SUPPORTED_LOCALES) {
    const j = await gql(`mutation { updateMyLocale(locale: "xx") { ok error errorCode } }`, { user: u2001, locale: loc });
    eq(`非法 locale code @${loc}`, j.data?.updateMyLocale?.errorCode, 'localeUnsupported');
    eq(`非法 locale error @${loc}`, j.data?.updateMyLocale?.error, CATALOG.errors.localeUnsupported[loc]);
    eq(`非法 locale ok @${loc}`, j.data?.updateMyLocale?.ok, false);
  }
  eq('非法值未落库', users.get(String(UID.U2001)).locale_pref, null);
  // Set fr -> persisted + returns pref/effective.
  const set = await gql(`mutation { updateMyLocale(locale: "fr") { ok errorCode localePref effectiveLocale } }`, { user: u2001, locale: 'en', browserLocale: 'en' });
  eq('设置 fr ok', set.data?.updateMyLocale?.ok, true);
  eq('设置 fr 回带 localePref', set.data?.updateMyLocale?.localePref, 'fr');
  eq('设置 fr 回带 effectiveLocale', set.data?.updateMyLocale?.effectiveLocale, 'fr');
  eq('fr 已落库', users.get(String(UID.U2001)).locale_pref, 'fr');
  // After setting, the worker composition speaks French even with an en browser.
  const w = await workerLocale(u2001, 'en-US');
  eq('落库后 effective 被偏好压过', w.effective, 'fr');
  // Clearing -> back to automatic; effective returns to the browser-negotiated value.
  const clear = await gql(`mutation { updateMyLocale(locale: null) { ok localePref effectiveLocale } }`, { user: u2001, locale: 'fr', browserLocale: 'es' });
  eq('清除 ok', clear.data?.updateMyLocale?.ok, true);
  eq('清除回带 localePref', clear.data?.updateMyLocale?.localePref, null);
  eq('清除回带 effectiveLocale=浏览器', clear.data?.updateMyLocale?.effectiveLocale, 'es');
  eq('清除已落库', users.get(String(UID.U2001)).locale_pref, null);
  const w2 = await workerLocale(u2001, 'es-ES');
  eq('清除后 effective 跟随浏览器', w2.effective, 'es');
}
  });

  it('(e) Laziness: selecting only settingsTitle generates exactly one entry', async () => {
/* ---------------- (e) Laziness: selecting only settingsTitle generates exactly one entry ---------------- */
{
  i18nProbe.enabled = true; i18nProbe.reset();
  const j = await gql(`{ settingsPage { settingsTitle } }`, { locale: 'en' });
  eq('settingsTitle 值', j.data?.settingsPage?.settingsTitle, CATALOG.settings.title.en);
  const keys = [...i18nProbe.counts.keys()];
  check('只生成 settings_title 一条', keys.length === 1 && keys[0] === 'settings_title', JSON.stringify(keys));
  i18nProbe.enabled = false;
}
  });

  it('(f) Spot-check matrix regression (common viewer fields x 5)', async () => {
/* ---------------- (f) Spot-check matrix regression (common viewer fields x 5) ---------------- */
for (const loc of SUPPORTED_LOCALES) {
  const j = await gql(`{ viewer { siteTitle loginButtonLabel userBarSettingsLabel commonLoadingGuildText } }`, { locale: loc });
  eq(`viewer.siteTitle @${loc}`, j.data?.viewer?.siteTitle, CATALOG.site.title[loc]);
  eq(`viewer.loginButtonLabel @${loc}`, j.data?.viewer?.loginButtonLabel, CATALOG.login.button[loc]);
  eq(`viewer.userBarSettingsLabel @${loc}`, j.data?.viewer?.userBarSettingsLabel, CATALOG.userBar.settings[loc]);
  eq(`viewer.commonLoadingGuildText @${loc}`, j.data?.viewer?.commonLoadingGuildText, CATALOG.common.loadingGuild[loc]);
}
  });

});
