// CI runner for all 12 backend harness suites (.harness-*).
// Ten suites run in-process against FakeDB. Two need a real wrangler dev:
//   - push: boots its own dev server on :8797, needs ../.dev.vars (SESSION_SECRET)
//   - heirloom: needs a dev server on :8799, a seeded local D1 (livetest
//     tenant + user 2001 + user_oauth row) and a session JWT in
//     /tmp/jwt-a.txt — all provided by the fixture below. Locally those came
//     from a long-lived dev database; in CI they are rebuilt from scratch
//     with throwaway fixture secrets (never real credentials).
// A suite is red iff its process exits non-zero (every suite exits 1 on any
// failed check). Pass counts are reported next to the known baselines so a
// silently shrinking suite is visible in the job summary.
//
// Usage: node scripts/ci/run-harnesses.mjs [--only name,name]
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const execFileP = promisify(execFile);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// name -> baseline pass count at the time the pipeline was automated
const SUITES = [
  ['avatar', 56], ['compliance', 61], ['daycomplete', 78], ['ennames', 299],
  ['gear', 35], ['i18n', 134], ['identity', 61], ['manualfix', 47],
  ['remindercard', 43], ['tower', 38],
];
const onlyArg = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);
const ONLY = onlyArg ? new Set(onlyArg.split(',')) : null;
const want = (n) => !ONLY || ONLY.has(n);

const results = [];
function report(name, baseline, passN, failN, ok, note = '') {
  results.push({ name, baseline, passN, failN, ok, note });
  console.log(`\n=== ${name}: ${ok ? 'GREEN' : 'RED'} (checks ${passN} passed / ${failN} failed, baseline ${baseline})${note ? ' — ' + note : ''}`);
}

function runNode(args, { cwd = ROOT, timeout = 300000, env = {} } = {}) {
  return new Promise((resolve) => {
    const child = spawn('node', args, { cwd, env: { ...process.env, ...env } });
    let out = '';
    const to = setTimeout(() => { child.kill('SIGKILL'); }, timeout);
    child.stdout.on('data', (d) => { out += d; process.stdout.write(d); });
    child.stderr.on('data', (d) => { out += d; process.stderr.write(d); });
    child.on('close', (code) => { clearTimeout(to); resolve({ code, out }); });
  });
}

async function runSuite(name, baseline) {
  console.log(`\n########## .harness-${name} ##########`);
  const { code, out } = await runNode([`.harness-${name}/run.mjs`]);
  // Suites report either per-check PASS/FAIL lines or a single
  // "HARNESS pass=N fail=M" summary line — support both.
  let passN = (out.match(/^PASS/gm) || []).length;
  let failN = (out.match(/^FAIL/gm) || []).length;
  const summaries = [...out.matchAll(/pass=(\d+) fail=(\d+)/g)];
  if (summaries.length) {
    const last = summaries[summaries.length - 1];
    passN = Number(last[1]);
    failN = Number(last[2]);
  }
  report(name, baseline, passN, failN, code === 0, code !== 0 ? `exit=${code}` : '');
  return code === 0;
}

/* ---------- local fixture secrets (.dev.vars) ---------- */
function ensureDevVars() {
  const p = path.join(ROOT, '.dev.vars');
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, 'SESSION_SECRET=' + 'ci-fixture-session-secret' + '\n' + 'ADMIN_PASSWORD=' + 'ci-fixture-hub-password' + '\n');
    console.log('[fixture] generated throwaway .dev.vars (CI-only fixture secrets)');
  }
  const text = fs.readFileSync(p, 'utf8');
  const get = (k) => (text.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim();
  return { sessionSecret: get('SESSION_SECRET'), adminPassword: get('ADMIN_PASSWORD') };
}

/* ---------- local D1 bootstrap (schema.sql + ordered migrations) ---------- */
// schema.sql is the v1 snapshot; the tenants/events/... tables only reach
// their current shape after migrate-v2..v8 (e.g. tenants.discord_webhook
// arrives in v7). The push and heirloom suites seed via `wrangler d1
// execute --local` against this shape, so a fresh CI database must be
// bootstrapped exactly the way production was: schema first, then every
// migration in order. Duplicate-column / already-exists errors are
// tolerated (local re-runs against a persistent dev DB); anything else
// aborts the run.
const MIGRATIONS = ['migrate-v2.sql', 'migrate-v3.sql', 'migrate-v4.sql', 'migrate-v5.sql', 'migrate-v6.sql', 'migrate-v7.sql', 'migrate-v8.sql'];

// Columns/tables the worker itself adds lazily at runtime (the ensure*
// helpers in src). Suites that seed via direct SQL run before any worker
// request could trigger those helpers, so the bootstrap converges the same
// shape up front. Mirrors, from src: bosses.ts ensureBossStructuredColumns,
// dungeons.ts (season/category/level), events.ts ensureEventCreatorColumn +
// ensureReminderColumns, signups.ts (discord_id), users.ts (locale_pref),
// pushTokens.ts ensurePushTokensTable. The identity tables below are not in
// schema.sql or any migration at all — they exist only as lazy DDL in
// users.ts (ensureUsersTable / ensureNickStoreTables) and guildMembers.ts
// (ensureGuildMembersTable) — and the push suite seeds users / user_oauth /
// guild_members directly, so on a fresh CI database they must be created
// here first (this was the one gap in the original bootstrap: push went red
// with "no such table: users" until some earlier run had created it).
const LAZY_TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
     discord_id TEXT PRIMARY KEY,
     username TEXT NOT NULL DEFAULT '',
     avatar TEXT NOT NULL DEFAULT '',
     guilds_json TEXT NOT NULL DEFAULT '[]',
     guilds_checked_at INTEGER NOT NULL DEFAULT 0,
     created_at TEXT NOT NULL DEFAULT (strftime('%s','now')),
     updated_at TEXT NOT NULL DEFAULT (strftime('%s','now'))
   )`,
  `CREATE TABLE IF NOT EXISTS user_oauth (
     discord_id TEXT PRIMARY KEY,
     refresh_token TEXT NOT NULL DEFAULT '',
     scope TEXT NOT NULL DEFAULT '',
     refresh_state TEXT NOT NULL DEFAULT 'ok',
     last_refresh_at INTEGER NOT NULL DEFAULT 0,
     updated_at INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE TABLE IF NOT EXISTS user_guild_nicks (
     discord_id TEXT NOT NULL,
     guild_id TEXT NOT NULL,
     nick TEXT NOT NULL DEFAULT '',
     updated_at INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (discord_id, guild_id)
   )`,
  `CREATE TABLE IF NOT EXISTS guild_members (
     tenant TEXT NOT NULL,
     discord_id TEXT NOT NULL,
     nick TEXT NOT NULL DEFAULT '',
     global_name TEXT NOT NULL DEFAULT '',
     updated_at INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (tenant, discord_id)
   )`,
];
const LAZY_COLUMNS = {
  bosses: [['mechanics_json', 'TEXT'], ['talents_json', 'TEXT'], ['shouts_json', 'TEXT']],
  dungeons: [['season', 'TEXT'], ['category', 'TEXT'], ['level', 'INTEGER']],
  events: [['creator_discord_id', 'TEXT'], ['reminder_sent_at', 'INTEGER'], ['reminder_error', 'TEXT']],
  signups: [['discord_id', 'TEXT']],
  users: [['locale_pref', 'TEXT']],
};

async function d1json(sqlText) {
  const { stdout } = await execFileP('npx', ['wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--json', '--command', sqlText], { cwd: ROOT });
  const parsed = JSON.parse(stdout.slice(stdout.indexOf('[')));
  return parsed[0]?.results || [];
}

async function convergeLazyDdl() {
  for (const ddl of LAZY_TABLES) {
    await execFileP('npx', ['wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--command', ddl], { cwd: ROOT });
  }
  console.log('[fixture] lazy-DDL converge: identity tables (users / user_oauth / user_guild_nicks / guild_members)');
  await execFileP('npx', ['wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--command',
    "CREATE TABLE IF NOT EXISTS push_tokens (discord_id TEXT NOT NULL, token TEXT NOT NULL, platform TEXT NOT NULL DEFAULT '', updated_at INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (discord_id, token))"], { cwd: ROOT });
  for (const [table, cols] of Object.entries(LAZY_COLUMNS)) {
    const existing = new Set((await d1json(`PRAGMA table_info(${table})`)).map((r) => r.name));
    if (!existing.size) continue; // table itself is created by schema/migrations or not needed
    for (const [colName, colType] of cols) {
      if (!existing.has(colName)) {
        await execFileP('npx', ['wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--command',
          `ALTER TABLE ${table} ADD COLUMN ${colName} ${colType}`], { cwd: ROOT });
        console.log(`[fixture] lazy-DDL converge: ${table}.${colName}`);
      }
    }
  }
}

let dbBootstrapped = false;
async function bootstrapLocalDb() {
  if (dbBootstrapped) return;
  for (const file of ['schema.sql', ...MIGRATIONS]) {
    try {
      await execFileP('npx', ['wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--file', file], { cwd: ROOT });
      console.log(`[fixture] applied ${file}`);
    } catch (e) {
      const msg = String(e?.stdout || '') + String(e?.stderr || '') + String(e?.message || '');
      if (/duplicate column|already exists/i.test(msg)) {
        console.log(`[fixture] ${file}: already applied (duplicate/exists) — continuing`);
      } else {
        throw new Error(`bootstrap failed on ${file}: ${msg.slice(0, 400)}`);
      }
    }
  }
  await convergeLazyDdl();
  dbBootstrapped = true;
}

/* ---------- heirloom fixture ---------- */
async function d1exec(sql) {
  await execFileP('npx', ['wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--command', sql], { cwd: ROOT });
}

async function heirloomFixture({ sessionSecret, adminPassword }) {
  console.log('\n########## heirloom fixture: bootstrap + seed + wrangler dev :8799 ##########');
  await bootstrapLocalDb();

  const dev = spawn('npx', ['wrangler', 'dev', '--port', '8799', '--local', '--ip', '127.0.0.1'],
    { cwd: ROOT, env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' }, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  dev.stdout.on('data', (d) => process.stdout.write('[wrangler] ' + d));
  dev.stderr.on('data', (d) => process.stderr.write('[wrangler] ' + d));

  let up = false;
  for (let i = 0; i < 45 && !up; i++) {
    try { const r = await fetch('http://127.0.0.1:8799/'); up = r.status > 0; } catch { await sleep(2000); }
  }
  if (!up) { try { process.kill(-dev.pid, 'SIGKILL'); } catch { dev.kill('SIGKILL'); } throw new Error('wrangler dev :8799 did not come up'); }
  console.log('[fixture] wrangler dev is up');

  // Warm the lazy-DDL paths the seed relies on (hub login ensures hub tables).
  await fetch('http://127.0.0.1:8799/api/hub/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ['pass' + 'word']: adminPassword }),
  }).catch(() => null);
  await fetch('http://127.0.0.1:8799/api/tenants').catch(() => null);

  const now = Math.floor(Date.now() / 1000);
  await d1exec(`
    CREATE TABLE IF NOT EXISTS settings (tenant TEXT NOT NULL DEFAULT '', key TEXT NOT NULL, value TEXT NOT NULL DEFAULT '', PRIMARY KEY (tenant, key));
    CREATE TABLE IF NOT EXISTS guild_members (tenant TEXT NOT NULL, discord_id TEXT NOT NULL, nick TEXT NOT NULL DEFAULT '', global_name TEXT NOT NULL DEFAULT '', updated_at INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (tenant, discord_id));
    CREATE TABLE IF NOT EXISTS users (discord_id TEXT PRIMARY KEY, username TEXT NOT NULL DEFAULT '', avatar TEXT NOT NULL DEFAULT '', guilds_json TEXT NOT NULL DEFAULT '[]', guilds_checked_at INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (strftime('%s','now')), updated_at TEXT NOT NULL DEFAULT (strftime('%s','now')));
    CREATE TABLE IF NOT EXISTS user_oauth (discord_id TEXT PRIMARY KEY, refresh_token TEXT NOT NULL DEFAULT '', scope TEXT NOT NULL DEFAULT '', refresh_state TEXT NOT NULL DEFAULT 'ok', last_refresh_at INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL DEFAULT 0);
    INSERT OR REPLACE INTO tenants (slug, guild_name, password_hash) VALUES ('livetest', 'CI Livetest', 'ci-fixture');
    INSERT OR REPLACE INTO users (discord_id, username, avatar, guilds_json, guilds_checked_at) VALUES ('2001', 'CI Tester', '', '["424242424242424242"]', ${now});
    INSERT OR REPLACE INTO user_oauth (discord_id, refresh_token, scope, refresh_state, updated_at) VALUES ('2001', 'ci-fixture-refresh', 'identify guilds guilds.members.read', 'ok', ${now});
  `);
  console.log('[fixture] seeded livetest tenant + user 2001 + user_oauth');

  // Mint the session JWT exactly like src/domains/identity/auth.ts signJwt.
  const b64u = (buf) => Buffer.from(buf).toString('base64url');
  const head = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64u(JSON.stringify({
    sub: '2001', name: 'CI Tester', avatar: '', guilds: ['424242424242424242'],
    iat: now, exp: now + 86400,
  }));
  const sig = crypto.createHmac('sha256', sessionSecret).update(`${head}.${body}`).digest();
  fs.writeFileSync('/tmp/jwt-a.txt', `${head}.${body}.${b64u(sig)}\n`);
  console.log('[fixture] wrote /tmp/jwt-a.txt');
  return dev;
}

/* ---------- main ---------- */
const secrets = ensureDevVars();
let allOk = true;

for (const [name, baseline] of SUITES) {
  if (!want(name)) continue;
  if (!await runSuite(name, baseline)) allOk = false;
}

if (want('push')) {
  let pushReady = true;
  try {
    await bootstrapLocalDb();
  } catch (e) {
    pushReady = false;
    allOk = false;
    report('push', 17, 0, 0, false, 'fixture failed: ' + (e?.message || e));
  }
  if (pushReady) {
    if (!await runSuite('push', 17)) allOk = false;
  }
}

if (want('heirloom')) {
  let dev = null;
  try {
    dev = await heirloomFixture(secrets);
    if (!await runSuite('heirloom', 26)) allOk = false;
  } catch (e) {
    allOk = false;
    report('heirloom', 26, 0, 0, false, 'fixture failed: ' + (e?.message || e));
  } finally {
    if (dev) { try { process.kill(-dev.pid, 'SIGKILL'); } catch { dev.kill('SIGKILL'); } }
  }
}

const lines = [
  '## Harness results',
  '',
  '| suite | checks passed | checks failed | baseline | verdict |',
  '|---|---|---|---|---|',
  ...results.map((r) => `| ${r.name} | ${r.passN} | ${r.failN} | ${r.baseline} | ${r.ok ? '✅ green' : '❌ RED'}${r.note ? ' (' + r.note + ')' : ''} |`),
];
console.log('\n' + lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
process.exit(allOk ? 0 : 1);
