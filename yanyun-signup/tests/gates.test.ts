// Platform gates acceptance (Statsig migration, phase one): the
// gate wrapper (src/domains/platform/gates.ts) and the premiumGate /
// isPremiumActive consumers in billing-service.ts, against real D1
// (Miniflare, migration-chain bootstrap — the production shape).
// Proves the phase-one contract:
//   A. Provider unconfigured (the launch state): premiumGate and
//      isPremiumActive return the pre-migration verdict across the
//      full matrix — paygate on/off × no row / premium / lapsed.
//   B. A fixture backend (the console rules, mirrored) drives the
//      same matrix to the same verdicts; attributes arrive intact
//      (guild id as unit id, plan + paygate as private attributes,
//      nothing in the public bag); a backend that DISAGREES with the
//      local computation wins — the wiring is live, not decorative.
//   C. Degradation: a throwing backend, an abstaining backend, and
//      a per-gate abstention all resolve to the local fallback —
//      never to all-open or all-closed.
//   D. The real Statsig backend (real SDK, real KV adapter) over a
//      stub KV: an unreadable KV abstains to the fallback; a crafted
//      ruleset evaluates the matrix; an unknown gate abstains.
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { describe, it, expect, afterAll } from 'vitest';
import { insertTenant } from '../src/domains/guilds/tenants.ts';
import { upsertEntitlementRow } from '../src/domains/platform/billing.ts';
import {
  premiumGate, isPremiumActive, getEffectiveEntitlement, setPaygateEnabled,
  PREMIUM_ACCESS_GATE_KEY, PREMIUM_ACTIVE_GATE_KEY,
} from '../src/domains/platform/billing-service.ts';
import {
  gateOpen, configureGateRuntime,
  __setGateBackendForTests, __resetGateRuntimeForTests,
} from '../src/domains/platform/gates.ts';
import { createStatsigGateBackend } from '../src/domains/platform/gates-statsig.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: { DB: 'harness-gates' },
}));
const db = await mf.getD1Database('DB');
{
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
  console.log('[gates] bootstrapped from migration chain:', files.length, 'files');
}

const nowS = Math.floor(Date.now() / 1000);
const G_NONE = 'g-none';
const G_PREM = 'g-premium';
const G_LAPSED = 'g-lapsed';
const GID: Record<string, number> = {};
for (const slug of [G_NONE, G_PREM, G_LAPSED]) {
  GID[slug] = await insertTenant(db, { slug, guildName: '门控测试 ' + slug, passwordHash: '', announcement: '' });
}
await upsertEntitlementRow(db, {
  tenant: GID[G_PREM], plan: 'premium', source: 'manual', currentPeriodEnd: nowS + 30 * 86400,
  stripeCustomerId: '', stripeSubscriptionId: '', updatedAt: nowS,
});
await upsertEntitlementRow(db, {
  tenant: GID[G_LAPSED], plan: 'premium', source: 'manual', currentPeriodEnd: nowS - 100,
  stripeCustomerId: '', stripeSubscriptionId: '', updatedAt: nowS,
});
describe('gates', () => {
// Fixture sanity: the effective plans the matrix math below assumes.
  it('fixture sanity', async () => {
eq('fixture: lapsed row reads as free', (await getEffectiveEntitlement(db, GID[G_LAPSED])).plan, 'free');
eq('fixture: live row reads as premium', (await getEffectiveEntitlement(db, GID[G_PREM])).plan, 'premium');
  });

async function setPaygate(on) {
  // The production write path (global scope), not a hand-rolled row.
  await setPaygateEnabled(db, on);
}

/** The pre-migration truth table, computed by hand. */
function legacy(paygateOn, effectivePlan) {
  return {
    locked: paygateOn && effectivePlan !== 'premium',
    active: paygateOn && effectivePlan === 'premium',
  };
}
const MATRIX = [
  // [paygateOn, slug, effectivePlan]
  [false, G_NONE, 'free'], [false, G_PREM, 'premium'], [false, G_LAPSED, 'free'],
  [true, G_NONE, 'free'], [true, G_PREM, 'premium'], [true, G_LAPSED, 'free'],
];
async function runMatrix(label) {
  for (const [on, slug, plan] of MATRIX) {
    await setPaygate(on);
    const want = legacy(on, plan);
    eq(`${label}: premiumGate paygate=${on ? 'on' : 'off'} ${slug}`,
      await premiumGate(db, GID[slug]), want.locked);
    eq(`${label}: isPremiumActive paygate=${on ? 'on' : 'off'} ${slug}`,
      await isPremiumActive(db, GID[slug]), want.active);
  }
}

/* ------------- A. unconfigured: launch-day parity ------------- */
  it('A. unconfigured: launch-day parity', async () => {
__resetGateRuntimeForTests();
await runMatrix('A unconfigured');
  });

/* ------------- B. fixture backend drives the verdicts --------- */
  it('B. fixture backend drives the verdicts', async () => {
const records = [];
const rulesBackend = {
  async check(key, subject) {
    records.push({
      key, unitId: subject.unitId,
      pub: { ...(subject.attributes ?? {}) },
      priv: { ...(subject.privateAttributes ?? {}) },
    });
    const plan = subject.privateAttributes?.plan;
    const paygate = subject.privateAttributes?.paygate;
    if (key === PREMIUM_ACCESS_GATE_KEY) return paygate === 'off' || plan === 'premium';
    if (key === PREMIUM_ACTIVE_GATE_KEY) return paygate === 'on' && plan === 'premium';
    return null;
  },
};
__setGateBackendForTests(rulesBackend);
await runMatrix('B fixture-rules');

// Attribute plumbing, exactly: one premiumGate call, paygate ON,
// premium guild. unit id is the guild ID; plan/paygate ride the private
// bag; the public bag is empty (facts never enter provider logs).
records.length = 0;
await setPaygate(true);
await premiumGate(db, GID[G_PREM]);
eq('B attributes: single premium_access check', records.map((r) => r.key), [PREMIUM_ACCESS_GATE_KEY]);
eq('B attributes: unit id is the guild id', records[0]?.unitId, String(GID[G_PREM]));
eq('B attributes: private bag carries the facts', records[0]?.priv, { plan: 'premium', paygate: 'on' });
eq('B attributes: public bag stays empty', records[0]?.pub, {});

// No cross-guild leakage: two guilds checked back to back keep
// their own unit ids and plans.
records.length = 0;
await premiumGate(db, GID[G_NONE]);
await isPremiumActive(db, GID[G_PREM]);
eq('B attributes: per-guild unit ids stay separate',
  records.map((r) => [r.key, r.unitId, r.priv.plan]),
  [[PREMIUM_ACCESS_GATE_KEY, String(GID[G_NONE]), 'free'], [PREMIUM_ACTIVE_GATE_KEY, String(GID[G_PREM]), 'premium']]);

// A backend that disagrees with the local computation WINS: the
// path is live. Paygate ON + free guild is locked/inactive
// locally; the inverted backend flips both answers. (While the
// paygate is OFF the verdict short-circuits in code — the master
// switch predates the console and stays the platform's — so the
// live-wiring proof runs with the switch ON.)
__setGateBackendForTests({
  async check(key) {
    if (key === PREMIUM_ACCESS_GATE_KEY) return true;
    if (key === PREMIUM_ACTIVE_GATE_KEY) return true;
    return null;
  },
});
await setPaygate(true);
eq('B live wiring: backend can unlock against local fallback', await premiumGate(db, GID[G_NONE]), false);
eq('B live wiring: backend can activate against local fallback', await isPremiumActive(db, GID[G_NONE]), true);
  });

/* ------------- C. degradation resolves to the fallback --------- */
  it('C. degradation resolves to the fallback', async () => {
__setGateBackendForTests({
  async check() { throw new Error('provider exploded'); },
});
await runMatrix('C throwing-backend');

__setGateBackendForTests({ async check() { return null; } });
await runMatrix('C abstaining-backend');

// Per-gate abstention: the fixture rules govern premium_access
// while premium_active abstains and falls back locally.
__setGateBackendForTests({
  async check(key, subject) {
    if (key === PREMIUM_ACCESS_GATE_KEY) return subject.privateAttributes?.paygate === 'off';
    return null;
  },
});
await setPaygate(true);
eq('C partial: ruled gate follows the backend', await premiumGate(db, GID[G_PREM]), true);
eq('C partial: abstained gate follows the fallback', await isPremiumActive(db, GID[G_PREM]), true);
__resetGateRuntimeForTests();
  });

/* ------------- D. real SDK backend over a stub KV -------------- */
// Init failure comes FIRST: the SDK singleton burns on its first
// successful init, and a failed init is what leaves it retryable.
// An unreadable KV must abstain (null), and gateOpen must fold the
// abstention into the caller's fallback in both directions.
  it('D. real SDK backend over a stub KV: broken KV', async () => {
  const brokenKv = { async get() { throw new Error('kv down'); } };
  const backend = createStatsigGateBackend({
    kv: brokenKv, serverSecret: 'secret-harness-not-real', projectId: 'harnessproj',
  });
  eq('D broken KV: backend abstains', await backend.check(PREMIUM_ACCESS_GATE_KEY,
    { unitId: String(GID[G_PREM]), privateAttributes: { plan: 'premium', paygate: 'off' } }), null);
  __setGateBackendForTests(backend);
  eq('D broken KV: gateOpen true-fallback holds', await gateOpen(PREMIUM_ACCESS_GATE_KEY,
    { unitId: String(GID[G_PREM]), privateAttributes: { plan: 'free', paygate: 'on' } }, true), true);
  eq('D broken KV: gateOpen false-fallback holds', await gateOpen(PREMIUM_ACCESS_GATE_KEY,
    { unitId: String(GID[G_PREM]), privateAttributes: { plan: 'free', paygate: 'on' } }, false), false);
  __resetGateRuntimeForTests();
  });

// The good-ruleset phase runs in a CHILD process (sdk-good.mjs):
// the SDK is a process-wide singleton whose first successful init
// wins, and the broken-KV phase above already spent this process's
// one init — exactly like production, where an isolate carries one
// gate configuration for its whole life. The child prints one JSON
// line of [name, got, want] rows; the verdicts are asserted here.
  it('D sdk: good ruleset (child process)', async () => {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const childPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'gates', 'sdk-good.mjs');
  let rows = null;
  try {
    const { stdout } = await promisify(execFile)(process.execPath, [childPath], { timeout: 120000 });
    rows = JSON.parse(stdout.trim().split('\n').pop());
  } catch (e) {
    check('D sdk: child process completed', false, String(e?.message || e).slice(0, 200));
  }
  if (rows) {
    for (const [name, got, want] of rows) eq('D sdk: ' + name, got, want);
  }
  });

// configureGateRuntime smoke: env without the trio leaves the
// runtime unconfigured (already proven by section A); calling it
// must not throw and must not arm a backend.
  it('D runtime: empty env configure is a no-op', async () => {
configureGateRuntime({});
eq('D runtime: empty env configure is a no-op', await gateOpen(PREMIUM_ACCESS_GATE_KEY,
  { unitId: 'x', privateAttributes: {} }, false), false);
  });

  afterAll(async () => { await mf.dispose(); });
});
