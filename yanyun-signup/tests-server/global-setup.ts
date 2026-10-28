// Global setup for the `server` vitest project (push / heirloom):
// the fixture half of the retired scripts/ci/run-harnesses.mjs.
// Ensures throwaway local fixture secrets (.dev.vars) exist and that
// the local D1 is bootstrapped ONLY by the migration chain in
// migrations/ (wrangler d1 migrations apply --local) — the same chain
// production runs. A database left over from the legacy bootstrap
// (tables but no ledger) fails with "already exists" and is wiped and
// re-applied once, exactly as the old runner handled it.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileP = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function ensureDevVars() {
  const p = path.join(ROOT, '.dev.vars');
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, 'SESSION_SECRET=' + 'ci-fixture-session-secret' + '\n' + 'ADMIN_PASSWORD=' + 'ci-fixture-hub-password' + '\n');
    console.log('[fixture] generated throwaway .dev.vars (CI-only fixture secrets)');
  }
}

async function bootstrapLocalDb() {
  const apply = () => execFileP('pnpm', ['exec', 'wrangler', 'd1', 'migrations', 'apply', 'yanyun-signup', '--local'], { cwd: ROOT });
  try {
    await apply();
    console.log('[fixture] migration chain applied (wrangler d1 migrations apply --local)');
  } catch (e: any) {
    const msg = String(e?.stdout || '') + String(e?.stderr || '') + String(e?.message || '');
    if (!/already exists/i.test(msg)) throw new Error(`bootstrap failed: ${msg.slice(0, 400)}`);
    console.log('[fixture] stale legacy local DB detected — wiping .wrangler/state/v3/d1 and re-applying the chain');
    fs.rmSync(path.join(ROOT, '.wrangler', 'state', 'v3', 'd1'), { recursive: true, force: true });
    await apply();
    console.log('[fixture] migration chain applied after wipe');
  }
}

export default async function setup() {
  ensureDevVars();
  await bootstrapLocalDb();
}
