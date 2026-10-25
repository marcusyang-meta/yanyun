import { useEffect, useRef } from 'react';
import { createOperationDescriptor, getRequest } from 'relay-runtime';
import { relayEnvironment } from './relay';

/* ================= 百业实时推送 (GuildHub WebSocket) =================
 * 通道: 同源 WS /ws/guild/:slug, yy_session cookie 随握手自动带上;
 * 服务端按 GraphQL 同一套成员规则校验 (非成员连不上)。事件只有
 * {slug, groupingId, kind} —— 不带业务数据; 收到事件后组件走正常
 * GraphQL 重查回填 store, 权限与数据口径仍以 resolver 为唯一真相。
 *
 * 可靠性:
 * - 断线自动重连 (指数退避 1s→30s 封顶 + 抖动); 页面切回前台时立即重试。
 * - 重连成功 (非首次) 先通知 resync, 组件重查当前视图, 不靠补发事件,
 *   断线期间的变化靠重查一次性对齐, 不会分叉。
 * - 通道整体不可用时 (服务端 403/网络不通) 应用照常工作: 查询与本人
 *   mutation 的 store 更新 (updater) 都不依赖这条通道。
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
  // 与 relay.ts 的 GraphQL 地址同一口径: workers.dev 预览站直连生产后端,
  // 其余 (生产同源 / 本地开发) 用当前 origin。
  if (typeof window !== 'undefined' && window.location.hostname.includes('workers.dev')) {
    return `wss://yanyun.tbdlab.workers.dev/ws/guild/${encodeURIComponent(slug)}`;
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/ws/guild/${encodeURIComponent(slug)}`;
}

function notify(entry: Entry, ev: GuildLiveEvent) {
  for (const h of [...entry.handlers]) {
    try { h(ev); } catch { /* 单个订阅者异常不影响其他订阅者 */ }
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
    // 首次连接不 resync (页面数据刚由 entrypoint/loadQuery 拉过);
    // 重连必 resync: 断线期间可能错过事件, 靠重查对齐。
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
    } catch { /* 非法消息忽略 */ }
  });

  const onDead = () => {
    if (entry.ws === ws) entry.ws = null;
    stopPing(entry);
    scheduleReconnect(slug, entry);
  };
  ws.addEventListener('close', onDead);
  ws.addEventListener('error', () => {
    // error 后浏览器会接着发 close; 这里只负责把连接关掉确保 close 触发
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

// 页面回到前台: 若连接已断且正在等退避, 立即重试 (退避计时器在后台会被节流)
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

/** React hook: 组件挂载期间订阅某百业的实时事件; handler 用 ref 转发最新闭包,
 *  避免 handler 身份变化导致反复订阅。 */
export function useGuildLive(slug: string | null | undefined, onEvent: Handler) {
  const ref = useRef(onEvent);
  ref.current = onEvent;
  useEffect(() => {
    if (!slug) return;
    return subscribeGuildLive(slug, (ev) => ref.current(ev));
  }, [slug]);
}

/* ---------- 事件驱动重查 ----------
 * 直接对 Relay environment 执行一次查询 (必走网络, 结果规范化进 store),
 * 已挂载的 usePreloadedQuery 组件随 store 更新自动重渲染。这不是渲染路径
 * 的 fetchPolicy: 不经过 React/Suspense, 不存在 network-only 挂起重试
 * 循环的成因; 且只由 socket 事件 / 本人操作完成回调触发, 数据回填本身
 * 不产生新事件, 不会自激。 */
export function executeQueryRefresh(queryNode: any, variables: Record<string, any>): Promise<void> {
  const operation = createOperationDescriptor(getRequest(queryNode), variables);
  return relayEnvironment.execute({ operation }).toPromise().then(
    () => undefined,
    (e) => { throw e; }
  );
}
