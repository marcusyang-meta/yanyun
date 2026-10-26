// SeatHub · Durable Object 广播中枢 (每个活动一个实例)
// 职责: 维护该活动详情页的 WebSocket 连接, 报名成功后广播 seat 变化。
// 使用 WebSocket Hibernation API: 无消息时休眠, 不烧 duration。

export class SeatHub {
  ctx: any;
  env: any;
  constructor(ctx: any, env: any) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request: any) {
    const url = new URL(request.url);

    // 客户端订阅: WS 握手
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server); // hibernation: 空闲自动休眠
      return new Response(null, { status: 101, webSocket: client });
    }

    // 服务端广播: POST /publish {event_id, seats_taken, max_slots}
    if (url.pathname.endsWith('/publish') && request.method === 'POST') {
      const data: any = await request.json().catch(() => null);
      if (!data || typeof data.seats_taken !== 'number') {
        return new Response('bad request', { status: 400 });
      }
      const msg = JSON.stringify({ type: 'seats', ...data, at: Date.now() });
      let n = 0;
      for (const ws of this.ctx.getWebSockets()) {
        try { ws.send(msg); n++; } catch { /* 断开的连接由 close 回调清理 */ }
      }
      return Response.json({ ok: true, delivered: n });
    }

    return new Response('not found', { status: 404 });
  }

  // hibernation 回调: 客户端心跳
  async webSocketMessage(ws: any, message: any) {
    try {
      const d = JSON.parse(message);
      if (d && d.type === 'ping') ws.send(JSON.stringify({ type: 'pong' }));
    } catch { /* 忽略非 JSON 消息 */ }
  }

  async webSocketClose(ws: any, code: any, reason: any, wasClean: any) {
    // hibernation 下连接自动从集合移除, 无需手动清理
  }

  async webSocketError(ws: any, error: any) {
    try { ws.close(1011, 'internal error'); } catch {}
  }
}
