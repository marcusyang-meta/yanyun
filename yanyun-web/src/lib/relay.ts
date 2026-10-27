import { Environment, Network, RecordSource, Store, fetchQuery } from 'relay-runtime';
import { effectiveLocaleTag, onLocaleChanged } from './locale';
import { jsOperationLoader } from './JSResource';

/* ---------- Registry of executed queries (for locale-change refetch) ----------
 * The environment is a module singleton and the store is never cleared: if a
 * locale change only remounted components, queries would hit the cached
 * old-language records via store-or-network and never reach the network (the
 * root cause of "clicking did nothing until a refresh"). So every executed
 * query is registered at the execute layer; on a locale change each is
 * force-refetched with fetchQuery, writing new-language data into the same
 * store records so mounted components re-render via their subscriptions —
 * no environment rebuild, no page reload. */
const executedQueries = new Map<string, { node: any; variables: any; at: number }>();
function registerDescriptor(descriptor: any) {
  // OperationDescriptor = { fragment, request, root }: request.node is the
  // full ConcreteRequest and the operation kind is node.params.operationKind.
  // The network fetch function only receives params (no AST), so registration
  // has to happen at the execute layer.
  const request = descriptor && descriptor.request;
  const node = request && request.node;
  const params = node && node.params;
  if (!request || !params || params.operationKind !== 'query') return;
  const variables = request.variables || {};
  const key = request.identifier + '|' + JSON.stringify(variables);
  if (!executedQueries.has(key)) {
    executedQueries.set(key, { node, variables, at: Date.now() });
  }
}

export async function refetchQueriesAfterLocaleChange(): Promise<void> {
  const jobs: Promise<unknown>[] = [];
  for (const { node, variables } of executedQueries.values()) {
    try {
      // This fetchPolicy is only used by this imperative refetch (triggered
      // from an event callback, not a render-path component fetchPolicy), so
      // it cannot cause a Suspense loop.
      jobs.push(
        fetchQuery(relayEnvironment, node, variables, { fetchPolicy: 'network-only' })
          .toPromise()
          .catch(() => undefined),
      );
    } catch { /* one failure must not affect the other queries */ }
  }
  await Promise.all(jobs);
}

/* The gear library's two surfaces (Profile dialog / gear bench) share one
 * GearLibraryQuery. Refetch it imperatively whenever either surface opens
 * (GearLibrary mounts) or the Profile dialog closes — same mechanism as the
 * locale-change refetch; fetchPolicy appears only in relay.ts imperative
 * refetches — so the other surface sees DB changes as soon as the store
 * updates. The first mount duplicates the component's own initial fetch once,
 * in exchange for deterministic two-way visibility. */
/* Refetches of the same query must be serialized: fetchQuery dedupes onto a
 * still-in-flight request of the same name, and if the mount-time request
 * returns after an import/save mutation, its stale snapshot would overwrite
 * the store back to the pre-mutation state. Each refetch therefore waits for
 * the previous one to settle before issuing a fresh request, guaranteeing the
 * returned data is newer than the call time. */
const gearRefetchChains = new Map<string, Promise<unknown>>();
export async function refetchGearLibraryQueries(): Promise<void> {
  const jobs: Promise<unknown>[] = [];
  for (const [key, entry] of executedQueries.entries()) {
    if (!entry.node?.params || entry.node.params.name !== 'GearLibraryQuery') continue;
    entry.at = Date.now();
    const prev = gearRefetchChains.get(key);
    const job = (async () => {
      if (prev) { try { await prev; } catch { /* a failed predecessor must not block */ } }
      try {
        await fetchQuery(relayEnvironment, entry.node, entry.variables, { fetchPolicy: 'network-only' })
          .toPromise();
      } catch { /* ignore individual failures */ }
    })();
    gearRefetchChains.set(key, job);
    jobs.push(job);
  }
  await Promise.all(jobs);
}

/* Guild admin surface: after an admin mutation commits, refetch the
 * mounted GuildAdminRouteQuery imperatively (same serialized-chain
 * mechanism as the gear library refetch) so the page re-renders from
 * the updated store records. */
const adminRefetchChains = new Map<string, Promise<unknown>>();
export async function refetchGuildAdminQueries(): Promise<void> {
  const jobs: Promise<unknown>[] = [];
  for (const [key, entry] of executedQueries.entries()) {
    if (!entry.node?.params || entry.node.params.name !== 'GuildAdminRouteQuery') continue;
    entry.at = Date.now();
    const prev = adminRefetchChains.get(key);
    const job = (async () => {
      if (prev) { try { await prev; } catch { /* a failed predecessor must not block */ } }
      try {
        await fetchQuery(relayEnvironment, entry.node, entry.variables, { fetchPolicy: 'network-only' })
          .toPromise();
      } catch { /* ignore individual failures */ }
    })();
    adminRefetchChains.set(key, job);
    jobs.push(job);
  }
  await Promise.all(jobs);
}

async function fetchGraphQL(operation: any, variables: any) {
  // Always same-origin /graphql, on every host. One Worker serves both this
  // app (its public/ assets) and the API: production (yanyun.app) and the
  // workers.dev preview are the same deployment unit at different versions —
  // the preview is `wrangler preview` of the backend Worker with these exact
  // assets synced in, bound to the same D1 by database_id. A browser fetch to
  // the page's own origin therefore never crosses a worker-to-worker hop, so
  // the old workers.dev → production redirect (a leftover from when web and
  // backend were separate Workers) is gone: a preview now answers with its
  // own schema and data behavior — which is the point of a preview, and what
  // lets CI's render smoke exercise the PR's schema instead of production's.
  const graphqlUrl = '/graphql';
  const res = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // Locale negotiation: the effective language tag rides along (account
      // preference mirror first, else the browser language); the backend maps
      // it to a supported locale (zh-TW/en/es/fr, otherwise zh-CN) and
      // generates all UI copy in that locale.
      'x-locale': effectiveLocaleTag(),
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json;
}

/**
 * Record identity is namespaced by type: `${__typename}:${id}`.
 *
 * Why: backend ids are per-table D1 autoincrement integers, not globally
 * unique — Boss 30 and Grouping 30 coexist. Relay by default uses the bare id
 * as the store record key, so same-numbered records of different types merge
 * into one (the dev-build RelayResponseNormalizer "conflicting types" warning
 * is exactly this), and viewing boss 30 then car 30 (or vice versa) in one
 * session risks field cross-talk. Only the store-internal record key changes
 * here: the record's id field itself, URLs (/:slug/car/30) and mutation
 * arguments stay bare ids; the wire format and backend are untouched.
 *
 * Where typeName comes from: when the normalizer calls getDataID(data,
 * typeName), typeName is field.concreteType ?? the response's __typename, so
 * concrete-type fields are covered even when the query didn't explicitly
 * select __typename; data.__typename is only a fallback. The types actually
 * namespaced: Dungeon / Boss / Grouping (integer ids) and DiscordServer
 * (snowflake string ids). Records without an id field (the Page wrapper
 * types, Seat, Sect, ...) return null and keep Relay-generated client ids,
 * unchanged.
 *
 * Viewer exception: matches defaultGetDataID's Viewer singleton semantics
 * (the app-root viewer has no id field; the default gives it the fixed record
 * key client:root:viewer), so queries don't each create their own viewer
 * record.
 *
 * Dual wiring (same trap as operationLoader below): the Environment only
 * injects config.getDataID into a store it creates itself; this app supplies
 * its own store, so the same function must be passed both to the Environment
 * config (used by the normalizer / executor / publish queue) and to the Store
 * options (used by store.check's DataChecker). Pass it in only one place and
 * the two sides compute different record keys, and check() on hot navigation
 * judges already-published data as missing.
 */
function getDataID(
  data: { [key: string]: unknown },
  typeName?: string | null,
): string | null {
  const id = data.id;
  if (id == null) {
    return typeName === 'Viewer' ? 'client:root:viewer' : null;
  }
  const typename =
    typeName ?? (typeof data.__typename === 'string' ? data.__typename : null);
  return typename != null ? `${typename}:${String(id)}` : String(id);
}

// v21's Store options type (.d.ts) doesn't declare getDataID, but
// RelayModernStore does read options.getDataID at runtime (same options
// object as operationLoader), so widen the type with an intersection.
type StoreOptions = ConstructorParameters<typeof Store>[1];
const storeOptions = {
  operationLoader: jsOperationLoader,
  getDataID,
} as StoreOptions & { getDataID: typeof getDataID };

export const relayEnvironment = new Environment({
  network: Network.create(fetchGraphQL),
  getDataID,
  // Critical: operationLoader must also be passed to the Store.
  // RelayModernEnvironment only builds a default store from
  // config.operationLoader when no store is provided; with a supplied store,
  // store._operationLoader is null, and store.check() (triggered by entrypoint
  // reloads / hot navigation) walks @module selections into
  // DataChecker._checkModuleImport and throws an invariant ("DataChecker:
  // Expected an operationLoader to be configured when using `@module`.",
  // minified in production builds to "Minified exception occurred...").
  // getDataID needs the same dual wiring (see its comment above), hence
  // storeOptions.
  store: new Store(new RecordSource(), storeOptions),
  // @match followup payloads arrive with an operationReference produced by the
  // compiler-emitted operationModuleProvider (a () => JSResourceReference).
  // Resolve it to its SplitOperation via src/lib/JSResource.ts.
  operationLoader: jsOperationLoader,
});

// Query registration: the environment's execute is the single entry point
// for all queries (hooks / entrypoint / fetchQuery); wrap it to register each
// executed query descriptor for locale-change refetch. Registration failure
// must never affect execution itself.
const originalExecute = relayEnvironment.execute.bind(relayEnvironment);
(relayEnvironment as any).execute = (args: any) => {
  try { registerDescriptor(args && args.operation); } catch { /* ignore */ }
  return originalExecute(args);
};
// The entrypoint / loadQuery family goes through executeWithSource; register there too
const originalExecuteWithSource = relayEnvironment.executeWithSource.bind(relayEnvironment);
(relayEnvironment as any).executeWithSource = (args: any) => {
  try { registerDescriptor(args && args.operation); } catch { /* ignore */ }
  return originalExecuteWithSource(args);
};

// On locale change (settings save, or reconciliation finding a different
// server preference), refetch all executed queries to switch the UI language
// in place within the same environment.
onLocaleChanged(() => { void refetchQueriesAfterLocaleChange(); });
