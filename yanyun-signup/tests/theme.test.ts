// Theme preference acceptance (backend layer): users.theme_pref full
// chain — migration + Drizzle entity surface, repository roundtrip,
// viewer/settings delivery, updateMyTheme validation — through the
// real auth helpers + real yoga, against a substring-routed FakeDB
// (same fixture shape as the i18n suite).
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { yoga } from '../src/graphql.ts';
import { getUserThemePref } from '../src/domains/identity/auth.ts';
import { resolveThemePref, SUPPORTED_THEMES } from '../src/domains/identity/users.ts';
import { CATALOG } from '../src/domains/platform/i18n.ts';
import { typeDefs } from '../src/graphql-schema.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* Drizzle query-builder channel conversion (values mode): same helper
 * as the i18n suite — object rows become value arrays in SELECT
 * column order for stmt.raw(). */
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
const UID = { U2001: 2030100001, U2002: 2030100002 };
const users = new Map(); // user id (string form) -> { theme_pref }
users.set(String(UID.U2001), { theme_pref: null });
users.set(String(UID.U2002), { theme_pref: 'glass' });
function stmt(sql) {
  sql = sql.replace(/"/g, '');
  const q = {
    _binds: [], bind(...a) { this._binds = a; return this; },
    async raw() { const res = await this.all(); return toRawRows(sql, (res && res.results) || []); },
    async first() {
      if (sql.includes('SELECT theme_pref FROM users')) { const u = users.get(String(q._binds[0])); return u ? { theme_pref: u.theme_pref } : null; }
      return null;
    },
    async all() {
      if (sql.includes('SELECT theme_pref FROM users')) { const u = users.get(String(q._binds[0])); return { results: u ? [{ theme_pref: u.theme_pref }] : [] }; }
      return { results: [] };
    },
    async run() {
      if (sql.startsWith('UPDATE users SET theme_pref')) { const u = users.get(String(q._binds[1])); if (u) u.theme_pref = q._binds[0]; return { meta: {} }; }
      return { meta: {} };
    },
  };
  return q;
}
const db = { prepare: (sql) => stmt(sql) };
const env = { DB: db };

async function gql(query, { user = null, locale = 'zh-CN' } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale, browserLocale: locale, executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query }),
  }), ctx);
  return res.json();
}

const u2001 = { userId: UID.U2001, discordId: '2001', name: '甲', guilds: [] };
const u2002 = { userId: UID.U2002, discordId: '2002', name: '乙', guilds: [] };

describe('theme preference', () => {
  it('(a) schema + migration surface', async () => {
    check('schema 含 updateMyTheme', typeDefs.includes('updateMyTheme'));
    check('schema 含 myThemePref', typeDefs.includes('myThemePref'));
    check('schema SettingsPage 含 themePref', typeDefs.includes('themePref: String!'));
    check('0043 迁移存在', existsSync(new URL('../migrations/0043_user_theme_pref.sql', import.meta.url)));
    const mig = readFileSync(new URL('../migrations/0043_user_theme_pref.sql', import.meta.url), 'utf8');
    check('0043 只加 theme_pref 列', mig.includes('ALTER TABLE users ADD COLUMN theme_pref TEXT'));
    const entity = readFileSync(new URL('../src/domains/identity/schema.ts', import.meta.url), 'utf8');
    check('Drizzle 实体含 themePref', entity.includes("themePref: text('theme_pref')"));
    eq('支持集', SUPPORTED_THEMES.join(','), 'classic,glass');
    eq('resolveThemePref(null)', resolveThemePref(null), 'classic');
    eq('resolveThemePref(glass)', resolveThemePref('glass'), 'glass');
    eq('resolveThemePref(脏值)', resolveThemePref('neon'), 'classic');
  });

  it('(b) defaults: anonymous and unset members read classic', async () => {
    const anon = await gql(`{ viewer { myThemePref } settingsPage { themePref } }`);
    eq('匿名 viewer.myThemePref', anon.data?.viewer?.myThemePref, 'classic');
    eq('匿名 settingsPage.themePref', anon.data?.settingsPage?.themePref, 'classic');
    const unset = await gql(`{ viewer { myThemePref } settingsPage { themePref } }`, { user: u2001 });
    eq('未设置 viewer.myThemePref', unset.data?.viewer?.myThemePref, 'classic');
    eq('未设置 settingsPage.themePref', unset.data?.settingsPage?.themePref, 'classic');
    const stored = await gql(`{ viewer { myThemePref } }`, { user: u2002 });
    eq('已存 glass 的成员', stored.data?.viewer?.myThemePref, 'glass');
    eq('auth helper 有效值', await getUserThemePref(env, UID.U2002), 'glass');
    eq('auth helper 未设置', await getUserThemePref(env, UID.U2001), 'classic');
  });

  it('(c) settings copy resolves from the catalog (zh + en)', async () => {
    const q = `{ settingsPage { settingsThemeLabel settingsThemeHint settingsThemeClassicLabel settingsThemeGlassLabel } }`;
    const zh = await gql(q, { locale: 'zh-CN' });
    eq('zh 主题标签', zh.data?.settingsPage?.settingsThemeLabel, CATALOG.settings.themeLabel['zh-CN']);
    eq('zh 经典', zh.data?.settingsPage?.settingsThemeClassicLabel, CATALOG.settings.themeClassicLabel['zh-CN']);
    eq('zh 玻璃', zh.data?.settingsPage?.settingsThemeGlassLabel, CATALOG.settings.themeGlassLabel['zh-CN']);
    const en = await gql(q, { locale: 'en' });
    eq('en 主题标签', en.data?.settingsPage?.settingsThemeLabel, 'Theme');
    eq('en 经典', en.data?.settingsPage?.settingsThemeClassicLabel, 'Classic');
    eq('en 玻璃', en.data?.settingsPage?.settingsThemeGlassLabel, 'Glass');
  });

  it('(d) updateMyTheme: gates, validation, roundtrip', async () => {
    // Anonymous -> loginRequired.
    const anon = await gql(`mutation { updateMyTheme(theme: "glass") { ok error errorCode themePref } }`);
    eq('匿名 code', anon.data?.updateMyTheme?.errorCode, 'loginRequired');
    eq('匿名 error 文案', anon.data?.updateMyTheme?.error, CATALOG.errors.loginRequired['zh-CN']);
    eq('匿名 themePref 回 classic', anon.data?.updateMyTheme?.themePref, 'classic');

    // Unsupported value -> themeUnsupported, nothing persisted.
    const bad = await gql(`mutation { updateMyTheme(theme: "neon") { ok error errorCode themePref } }`, { user: u2001 });
    eq('非法值 ok', bad.data?.updateMyTheme?.ok, false);
    eq('非法值 code', bad.data?.updateMyTheme?.errorCode, 'themeUnsupported');
    eq('非法值 error 文案', bad.data?.updateMyTheme?.error, CATALOG.errors.themeUnsupported['zh-CN']);
    eq('非法值未落库', users.get(String(UID.U2001)).theme_pref, null);

    // Set glass -> persisted + returned; both read paths now say glass.
    const set = await gql(`mutation { updateMyTheme(theme: "glass") { ok errorCode themePref } }`, { user: u2001 });
    eq('设置 glass ok', set.data?.updateMyTheme?.ok, true);
    eq('设置 glass 回带', set.data?.updateMyTheme?.themePref, 'glass');
    eq('glass 已落库', users.get(String(UID.U2001)).theme_pref, 'glass');
    const after = await gql(`{ viewer { myThemePref } settingsPage { themePref } }`, { user: u2001 });
    eq('落库后 viewer', after.data?.viewer?.myThemePref, 'glass');
    eq('落库后 settingsPage', after.data?.settingsPage?.themePref, 'glass');

    // Back to classic.
    const back = await gql(`mutation { updateMyTheme(theme: "classic") { ok themePref } }`, { user: u2001 });
    eq('切回经典 ok', back.data?.updateMyTheme?.ok, true);
    eq('切回经典落库', users.get(String(UID.U2001)).theme_pref, 'classic');

    // Dirty stored value resolves to classic on read.
    users.get(String(UID.U2001)).theme_pref = 'neon';
    const dirty = await gql(`{ viewer { myThemePref } }`, { user: u2001 });
    eq('脏值读为 classic', dirty.data?.viewer?.myThemePref, 'classic');
    users.get(String(UID.U2001)).theme_pref = null;
  });
});
