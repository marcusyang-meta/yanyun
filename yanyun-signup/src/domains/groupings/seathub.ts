import type { Env } from '../platform/context.ts';
import { configureGateRuntime } from '../platform/index.ts';
// SeatHub — Durable Object broadcast hub (one instance per event).
// Holds the WebSocket connections of the event's detail page;
// after a successful signup it broadcasts seat changes.
// Uses the WebSocket Hibernation API: idle connections sleep and
// burn no duration.

export class SeatHub {
  ctx: DurableObjectState;
  env: Env;
  constructor(ctx: DurableObjectState, env: Env) {
    this.ctx = ctx;
    this.env = env;
    configureGateRuntime(env);
  }

  async fetch(request: any) {
    const url = new URL(request.url);

    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname.endsWith('/publish') && request.method === 'POST') {
      const data: any = await request.json().catch(() => null);
      if (!data || typeof data.seats_taken !== 'number') {
        return new Response('bad request', { status: 400 });
      }
      const msg = JSON.stringify({ type: 'seats', ...data, at: Date.now() });
      let n = 0;
      for (const ws of this.ctx.getWebSockets()) {
        try { ws.send(msg); n++; } catch { /* Disconnected sockets are cleaned up by the close callback. */ }
      }
      return Response.json({ ok: true, delivered: n });
    }

    return new Response('not found', { status: 404 });
  }

  async webSocketMessage(ws: any, message: any) {
    try {
      const d = JSON.parse(message);
      if (d && d.type === 'ping') ws.send(JSON.stringify({ type: 'pong' }));
    } catch { }
  }

  async webSocketClose(ws: any, code: any, reason: any, wasClean: any) {
    // Under hibernation, connections are removed from the set automatically — no manual cleanup needed.
  }

  async webSocketError(ws: any, error: any) {
    try { ws.close(1011, 'internal error'); } catch {}
  }
}
