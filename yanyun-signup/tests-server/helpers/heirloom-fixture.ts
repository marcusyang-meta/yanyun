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

async function d1query(sql: string): Promise<any[]> {
  const { stdout } = await execFileP('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--json', '--command', sql], { cwd: ROOT });
  const i = stdout.indexOf('[');
  const arr = i >= 0 ? JSON.parse(stdout.slice(i)) : [];
  return arr[0]?.results || [];
}

/* Typed public IDs (migration 0036): tenants / users carry minted
 * 11-digit primary keys ([type code][day index][daily sequence]).
 * Raw-SQL seeding cannot call the data layer's mintPublicId, so it
 * replicates the same atomic counter step against id_mint_counters
 * and composes the ID with the ids.ts formula. Existing rows are
 * reused by their natural keys (slug / discord_id) so repeated runs
 * keep the same IDs instead of orphaning tenant-keyed rows. */
const PUBLIC_ID_EPOCH_MS = Date.UTC(2026, 0, 1);
async function mintTypedId(typeCode: number): Promise<number> {
  const dayIndex = Math.floor((Date.now() - PUBLIC_ID_EPOCH_MS) / 86_400_000);
  const rows = await d1query(`INSERT INTO id_mint_counters (type_code, day_index, seq) VALUES (${typeCode}, ${dayIndex}, 1)
    ON CONFLICT(type_code, day_index) DO UPDATE SET seq = seq + 1 RETURNING seq`);
  const seq = Number(rows[0]?.seq);
  if (!seq) throw new Error('fixture: typed ID mint returned no sequence');
  return typeCode * 1_000_000_000 + dayIndex * 100_000 + seq;
}
function isTypedId(id: number, typeCode: number): boolean {
  return Number.isSafeInteger(id) && Math.floor(id / 1_000_000_000) === typeCode && id % 100_000 >= 1;
}
async function ensureTenantId(slug: string): Promise<number> {
  const rows = await d1query(`SELECT id FROM tenants WHERE slug='${slug}'`);
  if (rows[0]?.id && isTypedId(Number(rows[0].id), 1)) return Number(rows[0].id);
  // A pre-0036 leftover row carries a small auto-assigned ID, which the
  // converted code does not recognize; drop it and mint a typed ID.
  if (rows[0]?.id) await d1exec(`DELETE FROM tenants WHERE slug='${slug}'`);
  return mintTypedId(1); // guild type code 01
}
async function ensureUserId(discordId: string): Promise<number> {
  const rows = await d1query(`SELECT id FROM users WHERE discord_id='${discordId}'`);
  if (rows[0]?.id && isTypedId(Number(rows[0].id), 2)) return Number(rows[0].id);
  if (rows[0]?.id) await d1exec(`DELETE FROM users WHERE discord_id='${discordId}'`);
  return mintTypedId(2); // user type code 02
}

export interface HeirloomFixture {
  dev: ChildProcess;
  stop: () => void;
  guildId: number;
  userId: number;
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
  const guildId = await ensureTenantId('livetest');
  const userId = await ensureUserId('2001');
  await d1exec(`
    INSERT OR REPLACE INTO tenants (id, slug, guild_name, password_hash) VALUES (${guildId}, 'livetest', 'CI Livetest', 'ci-fixture');
    INSERT OR REPLACE INTO users (id, discord_id, username, avatar, guilds_json, guilds_checked_at) VALUES (${userId}, '2001', 'CI Tester', '', '["424242424242424242"]', ${now});
    INSERT OR REPLACE INTO user_oauth (user_id, refresh_token, scope, refresh_state, updated_at) VALUES (${userId}, 'ci-fixture-refresh', 'identify guilds guilds.members.read', 'ok', ${now});
  `);
  console.log('[fixture] seeded livetest tenant + user 2001 + user_oauth');

  // Mint the session JWT exactly like src/domains/identity/auth.ts signJwt.
  // Post-0036 the subject is the numeric user ID (users.id): a token
  // whose sub is the Discord ID no longer parses as a session at all.
  // The Discord ID is resolved back from the users row by the worker.
  const b64u = (buf: Buffer | string) => Buffer.from(buf).toString('base64url');
  const head = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64u(JSON.stringify({
    sub: String(userId), name: 'CI Tester', avatar: '', guilds: ['424242424242424242'],
    iat: now, exp: now + 86400,
  }));
  const sig = crypto.createHmac('sha256', sessionSecret).update(`${head}.${body}`).digest();
  fs.writeFileSync('/tmp/jwt-a.txt', `${head}.${body}.${b64u(sig)}\n`);
  console.log('[fixture] wrote /tmp/jwt-a.txt');
  return { dev, stop, guildId, userId };
}
