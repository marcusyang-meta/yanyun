import { useEffect, useRef } from 'react';
import { createOperationDescriptor, getRequest } from 'relay-runtime';
import { relayEnvironment } from './relay';

/* ================= Guild live push (GuildHub WebSocket) =================
 * Channel: same-origin WS /ws/guild/:slug; the yy_session cookie rides the
 * handshake automatically. The server applies the same membership rules as
 * GraphQL (non-members cannot connect). Events carry only
 * {slug, groupingId, kind} — no business data; on an event, components run a
 * normal GraphQL refetch to backfill the store, and resolvers remain the
 * single source of truth for permissions and data.
 *
 * Reliability:
 * - Auto-reconnect with exponential backoff (1s→30s cap, with jitter); retry
 *   immediately when the page returns to the foreground.
 * - A successful reconnect (not the first connect) first notifies resync and
 *   components refetch the current view — no event replay; changes made
 *   while disconnected are aligned by that one refetch, never forked.
 * - If the channel is entirely unavailable (server 403 / network down) the
 *   app keeps working: queries and own-mutation store updates (updaters) do
 *   not depend on it.
 */

export type GuildLiveEvent =
  | { resync: true }
  | {
      resync: false;
      slug: string;
      groupingId: string;
      kind: 'created' | 'updated' | 'deleted' | 'seats';
    };

type Handler = (ev: GuildLiveEvent) => void;

interface Entry {
  handlers: Set<Handler>;
  ws: WebSocket | null;
  attempts: number;
  everOpened: boolean;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  pingTimer: ReturnType<typeof setInterval> | null;
}

const entries = new Map<string, Entry>();

function liveUrl(slug: string): string {
  // Same rule as relay.ts's GraphQL URL: always the current origin. The
  // preview Worker binds its own GuildHub DOs (wrangler.toml [previews]), so
  // live events on a preview stay inside that preview deployment — matching
  // its own /graphql — instead of leaking into production's hubs.
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/ws/guild/${encodeURIComponent(slug)}`;
}

function notify(entry: Entry, ev: GuildLiveEvent) {
  for (const h of [...entry.handlers]) {
    try { h(ev); } catch { /* one subscriber's exception must not affect the others */ }
  }
}

function stopPing(entry: Entry) {
  if (entry.pingTimer) { clearInterval(entry.pingTimer); entry.pingTimer = null; }
}

function scheduleReconnect(slug: string, entry: Entry) {
  if (!entry.handlers.size) return;
  if (entry.reconnectTimer) return;
  const base = Math.min(1000 * 2 ** entry.attempts, 30000);
  const delay = base * (0.75 + Math.random() * 0.5);
  entry.attempts += 1;
  entry.reconnectTimer = setTimeout(() => {
    entry.reconnectTimer = null;
    connect(slug, entry);
  }, delay);
}

function connect(slug: string, entry: Entry) {
  if (!entry.handlers.size) return;
  if (entry.ws && (entry.ws.readyState === WebSocket.OPEN || entry.ws.readyState === WebSocket.CONNECTING)) return;
  let ws: WebSocket;
  try {
    ws = new WebSocket(liveUrl(slug));
  } catch {
    scheduleReconnect(slug, entry);
    return;
  }
  entry.ws = ws;

  ws.addEventListener('open', () => {
    entry.attempts = 0;
    stopPing(entry);
    entry.pingTimer = setInterval(() => {
      try { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' })); } catch { /* ignore */ }
    }, 30000);
    // No resync on the first connect (page data was just fetched by
    // entrypoint/loadQuery); always resync on reconnect — events may have
    // been missed while disconnected and the refetch realigns.
    if (entry.everOpened) notify(entry, { resync: true });
    entry.everOpened = true;
  });

  ws.addEventListener('message', (msg) => {
    try {
      const d = JSON.parse(String(msg.data));
      if (!d || d.type !== 'grouping-changed') return;
      if (d.slug !== slug) return;
      if (!['created', 'updated', 'deleted', 'seats'].includes(d.kind)) return;
      notify(entry, { resync: false, slug, groupingId: String(d.groupingId), kind: d.kind });
    } catch { /* ignore malformed messages */ }
  });

  const onDead = () => {
    if (entry.ws === ws) entry.ws = null;
    stopPing(entry);
    scheduleReconnect(slug, entry);
  };
  ws.addEventListener('close', onDead);
  ws.addEventListener('error', () => {
    // The browser fires close after error; just close the socket to ensure close triggers
    try { ws.close(); } catch { /* ignore */ }
  });
}

export function subscribeGuildLive(slug: string, handler: Handler): () => void {
  let entry = entries.get(slug);
  if (!entry) {
    entry = {
      handlers: new Set(), ws: null, attempts: 0,
      everOpened: false, reconnectTimer: null, pingTimer: null,
    };
    entries.set(slug, entry);
  }
  entry.handlers.add(handler);
  connect(slug, entry);
  return () => {
    entry.handlers.delete(handler);
    if (!entry.handlers.size) {
      if (entry.reconnectTimer) { clearTimeout(entry.reconnectTimer); entry.reconnectTimer = null; }
      stopPing(entry);
      if (entry.ws) { try { entry.ws.close(); } catch { /* ignore */ } entry.ws = null; }
      entries.delete(slug);
    }
  };
}

// Back in the foreground: if disconnected and waiting out a backoff, retry
// now (background backoff timers get throttled)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    for (const [slug, entry] of entries) {
      if (!entry.ws) {
        if (entry.reconnectTimer) { clearTimeout(entry.reconnectTimer); entry.reconnectTimer = null; }
        connect(slug, entry);
      }
    }
  });
}

/** React hook: subscribe to a guild's live events while mounted. The handler
 *  is forwarded through a ref so handler identity changes don't resubscribe. */
export function useGuildLive(slug: string | null | undefined, onEvent: Handler) {
  const ref = useRef(onEvent);
  ref.current = onEvent;
  useEffect(() => {
    if (!slug) return;
    return subscribeGuildLive(slug, (ev) => ref.current(ev));
  }, [slug]);
}

/* ---------- Event-driven refetch ----------
 * Execute a query directly on the Relay environment (always hits the network;
 * results normalize into the store) and mounted usePreloadedQuery components
 * re-render as the store updates. This is not a render-path fetchPolicy: it
 * bypasses React/Suspense, so the network-only suspend-retry loop cannot
 * arise; and it is only triggered by socket events / own-operation completion
 * callbacks — the backfill itself emits no new events, so it cannot
 * self-excite. */
export function executeQueryRefresh(queryNode: any, variables: Record<string, any>): Promise<void> {
  const operation = createOperationDescriptor(getRequest(queryNode), variables);
  return relayEnvironment.execute({ operation }).toPromise().then(
    () => undefined,
    (e) => { throw e; }
  );
}
