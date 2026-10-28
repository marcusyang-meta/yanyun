// Heirloom dev-server fixture: the runner half of the retired
// scripts/ci/run-harnesses.mjs heirloom fixture. Boots a real
// `wrangler dev` on :8799 against the local (migration-chain) D1,
// seeds the livetest tenant + user 2001 + user_oauth row, and mints
// the session JWT exactly like src/domains/identity/auth.ts signJwt,
// written to /tmp/jwt-a.txt for the suite to read — all identical to
// the old fixture. Local D1 bootstrap itself lives in
// tests-server/global-setup.ts.
import { spawn, execFile, type ChildProcess } from 'node:child_process';
import { promisify } from 'node:util';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileP = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function d1exec(sql: string) {
  await execFileP('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--command', sql], { cwd: ROOT });
}

export interface HeirloomFixture {
  dev: ChildProcess;
  stop: () => void;
}

export async function startHeirloomDev(): Promise<HeirloomFixture> {
  const devVars = fs.readFileSync(path.join(ROOT, '.dev.vars'), 'utf8');
  const get = (k: string) => (devVars.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim();
  const sessionSecret = get('SESSION_SECRET');
  if (!sessionSecret) throw new Error('fixture .dev.vars lacks SESSION_SECRET');

  // Hub overhaul: the admin surface is gated by the platform-admin
  // gate, not a password. The fixture makes the seeded user 2001 a
  // platform admin through the gate's env floor (--var beats
  // .dev.vars), so the suite's session JWT doubles as the admin.
  const dev = spawn('pnpm', ['exec', 'wrangler', 'dev', '--port', '8799', '--local', '--ip', '127.0.0.1', '--var', 'PLATFORM_ADMIN_DISCORD_IDS:2001'],
    { cwd: ROOT, env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' }, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  dev.stdout?.on('data', (d) => process.stdout.write('[wrangler] ' + d));
  dev.stderr?.on('data', (d) => process.stderr.write('[wrangler] ' + d));

  const stop = () => { try { process.kill(-(dev.pid as number), 'SIGKILL'); } catch { dev.kill('SIGKILL'); } };

  let up = false;
  for (let i = 0; i < 45 && !up; i++) {
    try { const r = await fetch('http://127.0.0.1:8799/'); up = r.status > 0; } catch { await sleep(2000); }
  }
  if (!up) { stop(); throw new Error('wrangler dev :8799 did not come up'); }
  console.log('[fixture] wrangler dev is up');

  // Exercise the worker once before seeding (a public GraphQL read),
  // so any boot-path failure surfaces here rather than inside the
  // suite. All tables come from the migration chain.
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
  const b64u = (buf: Buffer | string) => Buffer.from(buf).toString('base64url');
  const head = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64u(JSON.stringify({
    sub: '2001', name: 'CI Tester', avatar: '', guilds: ['424242424242424242'],
    iat: now, exp: now + 86400,
  }));
  const sig = crypto.createHmac('sha256', sessionSecret).update(`${head}.${body}`).digest();
  fs.writeFileSync('/tmp/jwt-a.txt', `${head}.${body}.${b64u(sig)}\n`);
  console.log('[fixture] wrote /tmp/jwt-a.txt');
  return { dev, stop };
}
