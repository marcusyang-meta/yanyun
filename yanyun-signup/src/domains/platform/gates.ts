/* Platform feature gates: the one door gated surfaces walk through
 * to ask "is this capability open for this subject?".
 *
 * Policy lives outside this codebase, in the Statsig project the
 * platform operates: which surfaces a gate covers, who it targets,
 * rollout percentages and the kill switch are console data, changed
 * without a release (docs/STATSIG.md carries the console checklist).
 * Facts stay ours: callers compute the fact attributes (plan,
 * paygate state) from the data layer and pass them in; this module
 * owns no fact and reads no table.
 *
 * The wrapper is the exit hatch. Provider types and SDK calls exist
 * only behind the backend seam in gates-statsig.ts; replacing the
 * provider rewrites that one file while this surface and every call
 * site stay untouched.
 *
 * Degradation contract — the part that keeps an unconfigured or
 * unreachable provider from becoming an outage: a check whose
 * backend abstains (provider not configured in this isolate, init
 * failed, the gate unknown to the provider, the call threw) resolves
 * to the caller-supplied FALLBACK. Callers set the fallback to the
 * verdict the pre-Statsig code produced, so until the console setup
 * lands (phase two of the migration), production behavior is the
 * pre-migration behavior by construction.
 */

export interface GateSubject {
  /** Bucketing unit (one guild slug for tenant gates). Console ID
   *  overrides key on this id, which is what makes per-guild
   *  force-on / force-off a console edit. */
  unitId: string;
  /** Fact attributes the console rules target on. */
  attributes?: Record<string, string>;
  /** Attributes used in evaluation but stripped from provider-side
   *  logs before they leave the platform (the plan fact rides
   *  here). */
  privateAttributes?: Record<string, string>;
}

/** A gate backend answers true (open) / false (closed), or null to
 *  abstain and let the caller's fallback decide. */
export interface GateBackend {
  check(gateKey: string, subject: GateSubject): Promise<boolean | null>;
}

/** The provider wiring one isolate runs with: our KV binding (the
 *  Config Sync target), the server secret, and the project id that
 *  names the ruleset key inside the namespace (statsig-<id>). */
export interface GateRuntimeConfig {
  kv: KVNamespace;
  serverSecret: string;
  projectId: string;
}

let runtimeConfig: GateRuntimeConfig | null = null;
let runtimeArmed = false;
let backendPromise: Promise<GateBackend | null> | null = null;
let testBackend: GateBackend | null = null;
let testBackendArmed = false;

function sameConfig(a: GateRuntimeConfig | null, b: GateRuntimeConfig | null): boolean {
  if (a === null || b === null) return a === b;
  return a.kv === b.kv && a.serverSecret === b.serverSecret && a.projectId === b.projectId;
}

/** Assembly-edge wiring: the worker entry and the Durable Objects
 *  call this with the env they were constructed with. Idempotent —
 *  bindings and secrets are isolate constants, so repeat calls with
 *  the same values are free; a changed secret (a rotation rolling
 *  out) re-arms the lazy backend build. Services never call this:
 *  they receive verdicts, not configuration. */
export function configureGateRuntime(env: {
  STATSIG_KV?: KVNamespace;
  STATSIG_SERVER_SECRET?: string;
  STATSIG_PROJECT_ID?: string;
}): void {
  const next: GateRuntimeConfig | null =
    env.STATSIG_KV && env.STATSIG_SERVER_SECRET && env.STATSIG_PROJECT_ID
      ? { kv: env.STATSIG_KV, serverSecret: env.STATSIG_SERVER_SECRET, projectId: env.STATSIG_PROJECT_ID }
      : null;
  if (runtimeArmed && sameConfig(runtimeConfig, next)) return;
  runtimeConfig = next;
  runtimeArmed = true;
  backendPromise = null;
}

async function resolveBackend(): Promise<GateBackend | null> {
  if (testBackendArmed) return testBackend;
  if (!runtimeConfig) return null;
  if (!backendPromise) {
    const config = runtimeConfig;
    backendPromise = (async () => {
      try {
        const mod = await import('./gates-statsig.ts');
        return mod.createStatsigGateBackend(config);
      } catch {
        return null;
      }
    })();
  }
  return backendPromise;
}

/** Ask whether gateKey is open for subject. Resolves to fallback
 *  whenever the provider abstains (see the degradation contract in
 *  the header); never throws. */
export async function gateOpen(
  gateKey: string,
  subject: GateSubject,
  fallback: boolean,
): Promise<boolean> {
  const backend = await resolveBackend().catch(() => null);
  if (!backend) return fallback;
  try {
    const verdict = await backend.check(gateKey, subject);
    return verdict === null ? fallback : verdict;
  } catch {
    return fallback;
  }
}

/* ---------------- harness seams (production never calls these) --- */

/** Install a stand-in backend for the harness suites. */
export function __setGateBackendForTests(backend: GateBackend | null): void {
  testBackend = backend;
  testBackendArmed = true;
}

/** Restore the pristine unconfigured state between harness phases. */
export function __resetGateRuntimeForTests(): void {
  testBackend = null;
  testBackendArmed = false;
  runtimeConfig = null;
  runtimeArmed = false;
  backendPromise = null;
}
