// CI runner for all 22 backend harness suites (.harness-*).
// Twenty suites run in-process against FakeDB. Two need a real wrangler dev:
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
  ['avatar', 58], ['compliance', 62], ['daycomplete', 78], ['ennames', 299],
  ['gear', 71], ['i18n', 134], ['identity', 61], ['manualfix', 47],
  ['remindercard', 81], ['tower', 38], ['laziness', 23], ['audit', 36],
  ['backup', 23], ['guildadmin', 213], ['shortlink', 27], ['templates', 49],
  ['account', 73], ['subdomain', 137],
  ['buildshare', 60],
  ['billing', 62],
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

/* ---------- local D1 bootstrap (wrangler migration chain) ---------- */
// The local database is bootstrapped ONLY by the migration chain in
// migrations/ (wrangler d1 migrations apply --local) — the same chain
// production runs. The legacy schema.sql + migrate-v2..v8 files and
// the lazy-DDL convergence shim that used to live here are retired:
// the chain's baseline already carries every table and column the
// worker used to add lazily at runtime. Apply is ledger-based, so a
// re-run against a persistent dev database is a no-op; a database left
// over from the legacy bootstrap (tables but no ledger) fails with
// "already exists" and is wiped and re-applied once.
let dbBootstrapped = false;
async function bootstrapLocalDb() {
  if (dbBootstrapped) return;
  const apply = () => execFileP('pnpm', ['exec', 'wrangler', 'd1', 'migrations', 'apply', 'yanyun-signup', '--local'], { cwd: ROOT });
  try {
    await apply();
    console.log('[fixture] migration chain applied (wrangler d1 migrations apply --local)');
  } catch (e) {
    const msg = String(e?.stdout || '') + String(e?.stderr || '') + String(e?.message || '');
    if (!/already exists/i.test(msg)) throw new Error(`bootstrap failed: ${msg.slice(0, 400)}`);
    console.log('[fixture] stale legacy local DB detected — wiping .wrangler/state/v3/d1 and re-applying the chain');
    fs.rmSync(path.join(ROOT, '.wrangler', 'state', 'v3', 'd1'), { recursive: true, force: true });
    await apply();
    console.log('[fixture] migration chain applied after wipe');
  }
  dbBootstrapped = true;
}

/* ---------- heirloom fixture ---------- */
async function d1exec(sql) {
  await execFileP('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--command', sql], { cwd: ROOT });
}

async function heirloomFixture({ sessionSecret, adminPassword }) {
  console.log('\n########## heirloom fixture: bootstrap + seed + wrangler dev :8799 ##########');
  await bootstrapLocalDb();

  const dev = spawn('pnpm', ['exec', 'wrangler', 'dev', '--port', '8799', '--local', '--ip', '127.0.0.1'],
    { cwd: ROOT, env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' }, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  dev.stdout.on('data', (d) => process.stdout.write('[wrangler] ' + d));
  dev.stderr.on('data', (d) => process.stderr.write('[wrangler] ' + d));

  let up = false;
  for (let i = 0; i < 45 && !up; i++) {
    try { const r = await fetch('http://127.0.0.1:8799/'); up = r.status > 0; } catch { await sleep(2000); }
  }
  if (!up) { try { process.kill(-dev.pid, 'SIGKILL'); } catch { dev.kill('SIGKILL'); } throw new Error('wrangler dev :8799 did not come up'); }
  console.log('[fixture] wrangler dev is up');

  // Exercise the worker once before seeding (hub login + a public
  // GraphQL read), so any boot-path failure surfaces here rather than
  // inside a suite. All tables come from the migration chain.
  await fetch('http://127.0.0.1:8799/api/hub/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ['pass' + 'word']: adminPassword }),
  }).catch(() => null);
  await fetch('http://127.0.0.1:8799/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: '{ ogGuildSlugs }' }),
  }).catch(() => null);

  const now = Math.floor(Date.now() / 1000);
  await d1exec(`
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
    report('push', 33, 0, 0, false, 'fixture failed: ' + (e?.message || e));
  }
  if (pushReady) {
    if (!await runSuite('push', 33)) allOk = false;
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
