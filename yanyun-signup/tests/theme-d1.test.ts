// Theme preference roundtrip against a REAL local D1 (Miniflare)
// bootstrapped from the migration chain — the layer the FakeDB-based
// tests/theme.test.ts cannot validate (its substring-routed fake
// answers the SQL it expects, not the SQL D1 executes).
//
// Why this suite exists: the shipped "web theme pick does not stick"
// defect was chased through this seam first. The verdict it pins —
// the server half was never at fault — is kept as a regression: the
// exact mutation document the web client sends persists to the real
// schema (migration 0043 included) and both read paths
// (Viewer.myThemePref, SettingsPage.themePref) serve the persisted
// value on the very next request.
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { describe, it, expect } from 'vitest';

const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: { DB: 'harness-theme-d1' },
}));
const db = await mf.getD1Database('DB');

{ // Bootstrap from the migration chain, like the drift gate / verifier.
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { splitSqlStatements } = await import('../scripts/ci/schema-shape.mjs');
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    for (const stmt of splitSqlStatements(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      await db.prepare(stmt).run();
    }
  }
}

const UID1 = 2030100001;
await db.prepare(`INSERT INTO users (id, discord_id, username, avatar, guilds_json, guilds_checked_at)
  VALUES (${UID1}, '9001', '主题回归员', 'av1', '[]', 1800000000)`).run();

const { yoga } = await import('../src/graphql.ts');
const env = { DB: db };
const user = { userId: UID1, discordId: '9001', name: '主题回归员', guilds: [] };

async function gql(query: string, variables?: unknown) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

// The exact document the web client compiles and sends
// (SettingsDialogUpdateThemeMutation in yanyun-web).
const UPDATE_THEME = `mutation SettingsDialogUpdateThemeMutation(
  $theme: String!
) {
  updateMyTheme(theme: $theme) {
    ok
    error
    errorCode
    themePref
  }
}`;

describe('theme pref roundtrip (real D1)', () => {
  it('persists glass and serves it back on both read paths, then classic again', async () => {
    const before = await gql(`{ viewer { myThemePref } settingsPage { themePref } }`);
    expect(before.data?.viewer?.myThemePref).toBe('classic');
    expect(before.data?.settingsPage?.themePref).toBe('classic');

    const mut = await gql(UPDATE_THEME, { theme: 'glass' });
    expect(mut.errors).toBeUndefined();
    expect(mut.data?.updateMyTheme?.ok).toBe(true);
    expect(mut.data?.updateMyTheme?.themePref).toBe('glass');

    const row = await db.prepare(`SELECT theme_pref FROM users WHERE id = ${UID1}`).first<{ theme_pref: string | null }>();
    expect(row?.theme_pref).toBe('glass');

    const after = await gql(`{ viewer { myThemePref } settingsPage { themePref } }`);
    expect(after.data?.viewer?.myThemePref).toBe('glass');
    expect(after.data?.settingsPage?.themePref).toBe('glass');

    const back = await gql(UPDATE_THEME, { theme: 'classic' });
    expect(back.data?.updateMyTheme?.ok).toBe(true);
    const row2 = await db.prepare(`SELECT theme_pref FROM users WHERE id = ${UID1}`).first<{ theme_pref: string | null }>();
    expect(row2?.theme_pref).toBe('classic');
    const after2 = await gql(`{ viewer { myThemePref } settingsPage { themePref } }`);
    expect(after2.data?.viewer?.myThemePref).toBe('classic');
    expect(after2.data?.settingsPage?.themePref).toBe('classic');
  });
});
