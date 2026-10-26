import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { API_URL } from './config';
import { getToken } from './storage';

// Live updates: same protocol as Web guildLive -- connect to
// /ws/guild/:slug (GuildHub DO), send {type:'ping'} every 25s to keep
// alive; a {type:'grouping-changed'} message is only a signal -- the
// callback refetches the block tree via the same path as pull-to-refresh
// (GraphQL remains the source of truth). Auth: Authorization Bearer
// (same JWT as GraphQL; the backend WS endpoint uses the same check).
//
// Foreground/background rule (agreed with the user): keep the connection
// only while the app is foregrounded; close the socket immediately on
// backgrounding (the OS would kill it anyway); on foregrounding,
// reconnect + one full resync.
export function useGuildLive(slug: string | null, onChange: () => void) {
  const cbRef = useRef(onChange);
  useEffect(() => { cbRef.current = onChange; });

  useEffect(() => {
    if (!slug) return;
    let ws: WebSocket | null = null;
    let ping: ReturnType<typeof setInterval> | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;
    let attempt = 0;

    const clearTimers = () => {
      if (ping) { clearInterval(ping); ping = null; }
      if (retry) { clearTimeout(retry); retry = null; }
    };

    const disconnect = () => {
      clearTimers();
      if (ws) {
        ws.onopen = null; ws.onmessage = null; ws.onclose = null; ws.onerror = null;
        try { ws.close(); } catch { /* ignore */ }
        ws = null;
      }
    };

    const schedule = () => {
      if (disposed || AppState.currentState !== 'active') return;
      attempt += 1;
      retry = setTimeout(connect, Math.min(30000, 1000 * 2 ** Math.min(attempt, 5)));
    };

    const connect = async () => {
      if (disposed || AppState.currentState !== 'active' || ws) return;
      const token = await getToken();
      if (disposed || AppState.currentState !== 'active') return;
      const url = `${API_URL.replace(/^http/, 'ws')}/ws/guild/${encodeURIComponent(slug)}`;
      try {
        // RN's WebSocket supports the headers option; Web browsers don't -- the
        // Web runtime is local-preview only and relies on pull-to-refresh
        // (native is unaffected).
        ws = Platform.OS === 'web'
          ? new WebSocket(url)
          : new (WebSocket as unknown as new (u: string, p?: string, o?: object) => WebSocket)(
              url, undefined, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      } catch { schedule(); return; }
      ws.onopen = () => {
        attempt = 0;
        ping = setInterval(() => {
          try { ws?.send(JSON.stringify({ type: 'ping' })); } catch { /* Already disconnected: go through reconnect */ }
        }, 25000);
      };
      ws.onmessage = (ev) => {
        try {
          const d = JSON.parse(String(ev.data)) as { type?: string };
          if (d?.type === 'grouping-changed') cbRef.current();
        } catch { /* Ignore non-JSON frames */ }
      };
      ws.onclose = () => { if (ping) { clearInterval(ping); ping = null; } ws = null; schedule(); };
      ws.onerror = () => { try { ws?.close(); } catch { /* Reconnect in onclose */ } };
    };

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // Back to foreground: reconnect + one immediate full resync
        void connect();
        cbRef.current();
      } else {
        // To background: close the socket proactively; keep no background connection
        disconnect();
      }
    });

    void connect();
    return () => {
      disposed = true;
      sub.remove();
      disconnect();
    };
  }, [slug]);
}
