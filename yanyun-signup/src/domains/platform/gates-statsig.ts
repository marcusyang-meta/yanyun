/* Statsig backend for the platform gate wrapper (gates.ts). This
 * is the ONLY module that names the provider SDK: the wrapper's
 * exit hatch is rewriting this file against a different provider
 * while gates.ts and every call site stay untouched.
 *
 * Shape follows the provider's official Workers pattern: Config
 * Sync keeps the project ruleset in our own Workers KV, the SDK
 * reads it through CloudflareKVDataAdapter and evaluates locally
 * in the isolate — checks make no network call. Exposure logging
 * is disabled on every check in this phase: these gates are
 * entitlement plumbing, not experiments, and no per-request data
 * leaves the platform.
 */
import type { StatsigUser } from 'statsig-node';
import type { GateBackend, GateRuntimeConfig, GateSubject } from './gates.ts';

/** Cool-down before a failed init is retried in this isolate, so a
 *  transient KV or SDK failure degrades to fallbacks instead of an
 *  isolate-lifetime outage — and a hard-down provider is not
 *  retried on every request either. */
const INIT_RETRY_COOLDOWN_MS = 60_000;

type StatsigModule = typeof import('statsig-node');

export function createStatsigGateBackend(config: GateRuntimeConfig): GateBackend {
  let sdk: StatsigModule | null = null;
  let initPromise: Promise<boolean> | null = null;
  let failedUntil = 0;

  async function ensureReady(): Promise<boolean> {
    if (sdk) return true;
    if (initPromise) return initPromise;
    if (Date.now() < failedUntil) return false;
    initPromise = (async () => {
      try {
        const statsig = await import('statsig-node');
        const { CloudflareKVDataAdapter } = await import('statsig-node-cloudflare-kv');
        // The adapter package pins an older workers-types major
        // than the repo's, so the two KVNamespace types clash at
        // the type level; at runtime the adapter only ever calls
        // kv.get(key), whose contract both versions share. The cast
        // bridges exactly that gap.
        const adapter = new CloudflareKVDataAdapter(
          config.kv as unknown as ConstructorParameters<typeof CloudflareKVDataAdapter>[0],
          `statsig-${config.projectId}`,
        );
        await statsig.default.initialize(config.serverSecret, {
          dataAdapter: adapter,
          disableRulesetsSync: true,
          disableIdListsSync: true,
          initStrategyForIDLists: 'none',
          initStrategyForIP3Country: 'none',
          disableDiagnostics: true,
          postLogsRetryLimit: 0,
        });
        sdk = statsig;
        return true;
      } catch {
        initPromise = null;
        failedUntil = Date.now() + INIT_RETRY_COOLDOWN_MS;
        return false;
      }
    })();
    return initPromise;
  }

  return {
    async check(gateKey: string, subject: GateSubject): Promise<boolean | null> {
      if (!(await ensureReady()) || !sdk) return null;
      try {
        const user: StatsigUser = {
          userID: subject.unitId,
          custom: subject.attributes ?? {},
          privateAttributes: subject.privateAttributes ?? {},
        };
        const gate = await sdk.default.getFeatureGateWithExposureLoggingDisabled(user, gateKey);
        const reason = gate.evaluationDetails?.reason;
        // Unrecognized: the console does not define this gate
        // (yet). Uninitialized / Unsupported: the SDK holds no
        // ruleset to judge with. All three are abstentions, not
        // a "closed" verdict.
        if (reason === 'Unrecognized' || reason === 'Uninitialized' || reason === 'Unsupported') {
          return null;
        }
        return gate.value;
      } catch {
        return null;
      }
    },
  };
}
