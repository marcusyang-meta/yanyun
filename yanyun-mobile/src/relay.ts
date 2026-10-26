import {
  Environment, Network, RecordSource, Store, fetchQuery,
  type FetchFunction, type GraphQLResponse,
} from 'relay-runtime';
import { blockOperationLoader } from '@yanyun/blocks-core';
import { API_URL } from './config';
import { getToken } from './storage';
import { effectiveLocaleTag, onLocaleChanged } from './locale';

// Relay environment: same GraphQL contract as Web. Auth uses
// Authorization Bearer (backend getSessionUser validates it on the same
// path as cookies, incl. revocation checks). x-locale is taken per
// request from effectiveLocaleTag() (account-preference mirror ?? device
// language); the backend generates all UI copy and errors by locale.
const fetchFn: FetchFunction = async (operation, variables) => {
  const token = await getToken();
  let tz: string | undefined;
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* Keep undefined */ }
  const res = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-locale': effectiveLocaleTag(),
      ...(tz ? { 'x-tz': tz } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query: operation.text, variables }),
  });
  return (await res.json()) as GraphQLResponse;
};

/**
 * Record identity is namespaced by type: `${__typename}:${id}` (same
 * semantics as Web relay.ts; added 2026-10-25 when the dex shipped).
 *
 * Why: backend ids are per-table D1 autoincrements, not globally
 * unique -- Boss 1 and Dungeon 1 coexist. Relay by default keys store
 * records by bare id, so same-number records of different types merge
 * into one (that is how a dungeon name got overwritten by the boss of
 * the same id). Only the internal store key changes here: the id field
 * itself, URLs and mutation inputs stay bare ids, and neither the wire
 * format nor the backend changes. Records without an id return null and
 * Relay generates a client id as before; Viewer keeps singleton semantics.
 *
 * Double wiring (same pitfall as Web): Environment injects
 * config.getDataID into the store only for stores it creates itself;
 * this app supplies its own store, so the same function must be passed
 * to both the Environment config and the Store options -- with only one,
 * the two sides compute different record keys and store.check reports
 * published data as missing.
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

// v21's Store options types (.d.ts) don't declare getDataID, but the
// runtime does read options.getDataID -- hence the intersection type
// (same approach as Web).
type StoreOptions = ConstructorParameters<typeof Store>[1];
const storeOptions = {
  getDataID,
} as StoreOptions & { getDataID: typeof getDataID };

export const relayEnvironment = new Environment({
  network: Network.create(fetchFn),
  getDataID,
  // Server 3D: split operations for @match/@module are resolved by the
  // operationLoader from server-returned references (the block split-
  // artifact registry lives in blocks-core).
  operationLoader: blockOperationLoader,
  store: new Store(new RecordSource(), storeOptions),
});

/* Executed-query registry (for locale-switch refetch; same mechanism as Web relay.ts)
 * The environment is a module singleton and the store is never cleared:
 * on a locale switch, component re-renders alone would hit old-locale
 * records via store-or-network and send no request. So every executed
 * query is registered at the execute layer, and on a locale change each
 * is force-refetched with fetchQuery (fetchPolicy is used only on this
 * imperative path, not the render path): new-locale data writes back
 * into the same store records and mounted components re-render via
 * subscriptions -- no environment rebuild, no full-page refresh. */
const executedQueries = new Map<string, { node: unknown; variables: Record<string, unknown> }>();

function registerDescriptor(descriptor: unknown) {
  const d = descriptor as {
    request?: { node?: { params?: { operationKind?: string; name?: string }; }; variables?: Record<string, unknown>; identifier?: string };
  } | null;
  const request = d?.request;
  const node = request?.node;
  const params = node?.params;
  if (!request || !node || !params || params.operationKind !== 'query') return;
  const variables = request.variables ?? {};
  const key = `${request.identifier ?? params.name ?? ''}|${JSON.stringify(variables)}`;
  if (!executedQueries.has(key)) executedQueries.set(key, { node, variables });
}

const originalExecute = relayEnvironment.execute.bind(relayEnvironment);
(relayEnvironment as any).execute = (args: any) => {
  registerDescriptor(args?.operation);
  return originalExecute(args);
};
const originalExecuteWithSource = relayEnvironment.executeWithSource.bind(relayEnvironment);
(relayEnvironment as any).executeWithSource = (args: any) => {
  registerDescriptor(args?.operation);
  return originalExecuteWithSource(args);
};

export async function refetchQueriesAfterLocaleChange(): Promise<void> {
  const jobs: Promise<unknown>[] = [];
  for (const { node, variables } of executedQueries.values()) {
    try {
      jobs.push(
        fetchQuery(relayEnvironment, node as any, variables, { fetchPolicy: 'network-only' })
          .toPromise()
          .catch(() => undefined),
      );
    } catch { /* One failure doesn't affect the other queries */ }
  }
  await Promise.all(jobs);
}

// Locale switch -> refetch all registered queries in the new locale
// (fetchFn reads the new effectiveLocaleTag because Profile writes the
// mirror before firing the event).
let refetching = false;
onLocaleChanged(() => {
  if (refetching) return;
  refetching = true;
  void refetchQueriesAfterLocaleChange().finally(() => { refetching = false; });
});
