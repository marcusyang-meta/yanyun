// Child process for .harness-gates section D: the real Statsig
// backend (real SDK, real KV adapter from gates-statsig.ts) over a
// stub KV holding a crafted ruleset. Runs in its own process
// because the SDK is a process-wide singleton whose first
// successful init wins — the parent suite already spent its init
// on the broken-KV degradation phase. Prints ONE JSON line:
// [[name, got, want], ...] for the parent to assert.
import { createStatsigGateBackend } from '../src/domains/platform/gates-statsig.ts';
import { gateOpen, __setGateBackendForTests } from '../src/domains/platform/gates.ts';

// The ruleset spec is the console spec from docs/STATSIG.md,
// byte-shaped like Config Sync writes it.
function cond(field, values) {
  return {
    type: 'user_field', targetValue: values, operator: 'any', field,
    additionalValues: {}, isDeviceBased: false, idType: 'userID',
  };
}
function rule(name, conditions) {
  return {
    name, passPercentage: 100, conditions, returnValue: true,
    id: name, salt: 'harness-salt-' + name, isDeviceBased: false, idType: 'userID',
  };
}
function specGate(name, rules) {
  return {
    name, type: 'feature_gate', salt: 'harness-' + name, enabled: true,
    defaultValue: false, rules, isDeviceBased: false, idType: 'userID',
    entity: 'feature_gate',
  };
}
const spec = {
  time: Date.now(),
  has_updates: true,
  feature_gates: [
    specGate('premium_access', [
      rule('paygate-off-parity', [cond('paygate', ['off'])]),
      rule('premium-plan', [cond('plan', ['premium'])]),
    ]),
    specGate('premium_active', [
      rule('paygate-on-and-premium', [cond('paygate', ['on']), cond('plan', ['premium'])]),
    ]),
  ],
  dynamic_configs: [],
  layer_configs: [],
  id_lists: {},
};
const KV_KEY = 'statsig-harnessproj';
const goodKv = {
  async get(key) { return key === KV_KEY ? JSON.stringify(spec) : null; },
};

const backend = createStatsigGateBackend({
  kv: goodKv, serverSecret: 'secret-harness-not-real', projectId: 'harnessproj',
});
__setGateBackendForTests(backend);

const rows = [];
for (const [paygate, plan, wantAccess, wantActive] of [
  ['off', 'free', true, false],
  ['off', 'premium', true, false],
  ['on', 'premium', true, true],
  ['on', 'free', false, false],
]) {
  const subject = { unitId: 'guild-alpha', privateAttributes: { plan, paygate } };
  // Fallbacks are the OPPOSITE of the wanted verdicts, so a pass
  // can only come from the SDK's own evaluation.
  rows.push([`premium_access paygate=${paygate} plan=${plan}`,
    await gateOpen('premium_access', subject, !wantAccess), wantAccess]);
  rows.push([`premium_active paygate=${paygate} plan=${plan}`,
    await gateOpen('premium_active', subject, !wantActive), wantActive]);
}
// A gate the console never defined abstains — the fallback, in
// both directions, decides.
const subject = { unitId: 'guild-alpha', privateAttributes: { plan: 'free', paygate: 'on' } };
rows.push(['unknown gate abstains to true fallback',
  await gateOpen('gate_that_does_not_exist', subject, true), true]);
rows.push(['unknown gate abstains to false fallback',
  await gateOpen('gate_that_does_not_exist', subject, false), false]);

console.log(JSON.stringify(rows));
process.exit(0);
