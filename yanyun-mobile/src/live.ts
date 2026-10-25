import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { API_URL } from './config';
import { getToken } from './storage';

// 实时更新：与网站 guildLive 同协议 —— 连上 /ws/guild/:slug（GuildHub DO），
// 每 25s 发 {type:'ping'} 保活；收到 {type:'grouping-changed'} 只当信号，
// 回调让当前表面按下拉刷新同一路径重拉积木树（数据仍以 GraphQL 为准）。
// 鉴权：Authorization Bearer（与 GraphQL 同一张 JWT；后端 WS 端点同一校验路径）。
//
// 前台/后台纪律（与用户讨论定的）：只在 App 前台时保持连接；切后台立即关
// socket（移动系统本来也会杀后台 socket），回前台重连 + 全量 resync 一次。
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
        // RN 的 WebSocket 支持 headers 选项；Web 浏览器不支持 —— Web 端仅作
        // 本地预览运行时，实时靠下拉刷新兜底（原生端不受影响）。
        ws = Platform.OS === 'web'
          ? new WebSocket(url)
          : new (WebSocket as unknown as new (u: string, p?: string, o?: object) => WebSocket)(
              url, undefined, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      } catch { schedule(); return; }
      ws.onopen = () => {
        attempt = 0;
        ping = setInterval(() => {
          try { ws?.send(JSON.stringify({ type: 'ping' })); } catch { /* 已断开走重连 */ }
        }, 25000);
      };
      ws.onmessage = (ev) => {
        try {
          const d = JSON.parse(String(ev.data)) as { type?: string };
          if (d?.type === 'grouping-changed') cbRef.current();
        } catch { /* 非 JSON 帧忽略 */ }
      };
      ws.onclose = () => { if (ping) { clearInterval(ping); ping = null; } ws = null; schedule(); };
      ws.onerror = () => { try { ws?.close(); } catch { /* onclose 里重连 */ } };
    };

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // 回前台: 重连 + 立即全量对齐一次
        void connect();
        cbRef.current();
      } else {
        // 切后台: 主动关 socket，不留后台连接
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
