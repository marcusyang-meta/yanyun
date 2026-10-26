// GuildHub · Durable Object 实时推送中枢 (每个百业一个实例, id = guild:<slug>)
// 职责: 维护该百业页面 (列表/详情) 的 WebSocket 连接; GraphQL mutation 在
// D1 落库成功后 POST /publish 进来, 这里把最小事件 {slug, groupingId, kind}
// 广播给全部连接。事件不带业务数据 —— 客户端收到后走正常 GraphQL 重查,
// 权限规则仍以 resolver 为唯一真相源。
// 鉴权不在本类做: WS 升级请求先经 worker.js 的 /ws/guild/:slug 路由
// (yy_session 会话 + getGuildAccess 成员校验), 非成员/匿名根本到不了这里。
// 使用 WebSocket Hibernation API: 无消息时休眠, 不烧 duration。
//
// 开车提醒调度 (2026-10-24 用户裁决: 不用每分钟 cron 扫描, 用 DO alarm
// 定点预约): 本 DO 至多挂一个 alarm = 本百业下一台待提醒车的提醒时刻
// (starts_at-10min)。alarm 只是唤醒铃, D1 是唯一真相: 每次重排都现查
// D1; 触发时再查一遍到点车辆并逐台复验 (改时间跟新时间、已解散查无此车、
// 已发/已失败不重发)。发车/改车/解散等写路径经 /nudge 催促重排, 连接与
// 广播唤醒时也顺手重排, 偶发丢 nudge 不会漂移太久。

import {
  ensureReminderColumns, getReminderConfig, nextReminderAt, dueReminders, sendReminderForEvent,
} from './reminder.js';
import { logError } from './errorlog.js';

const KINDS = new Set(['created', 'updated', 'deleted', 'seats']);

export class GuildHub {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  /* 本百业 slug: 优先取已存的 (任一入口带入), 回退到 DO id 名 guild:<slug> */
  async slug() {
    let slug = await this.ctx.storage.get('slug').catch(() => null);
    if (!slug && this.ctx.id && this.ctx.id.name) {
      const n = String(this.ctx.id.name);
      if (n.startsWith('guild:')) slug = n.slice('guild:'.length);
    }
    return slug || null;
  }
  async rememberSlug(slug) {
    if (slug) await this.ctx.storage.put('slug', String(slug)).catch(() => {});
  }

  /* 重排 alarm: 现查 D1 算下一提醒时刻; 未配 webhook / 未启用直接撤铃 */
  async recomputeAlarm() {
    const slug = await this.slug();
    if (!slug || !this.env.DB) return null;
    const cfg = await getReminderConfig(this.env.DB, slug).catch(() => null);
    if (!cfg || !cfg.webhook || !cfg.enabled) {
      await this.ctx.storage.deleteAlarm().catch(() => {});
      return null;
    }
    const nowSec = Math.floor(Date.now() / 1000);
    const next = await nextReminderAt(this.env.DB, slug, nowSec).catch(() => null);
    if (next == null) {
      await this.ctx.storage.deleteAlarm().catch(() => {});
      return null;
    }
    const atMs = Math.max(next * 1000, Date.now());
    await this.ctx.storage.setAlarm(atMs).catch(() => {});
    return atMs;
  }

  /* alarm 触发: 发所有到点车辆 (逐台在发送函数内复验 D1 现状), 然后重排。
   * 单台失败只落该车的 reminder_error, 不许中断铃链。 */
  async alarm() {
    const slug = await this.slug();
    try {
      if (slug && this.env.DB) {
        const cfg = await getReminderConfig(this.env.DB, slug).catch(() => null);
        if (cfg && cfg.webhook && cfg.enabled) {
          await ensureReminderColumns(this.env.DB);
          const nowSec = Math.floor(Date.now() / 1000);
          const due = await dueReminders(this.env.DB, slug, nowSec).catch(() => []);
          for (const ev of due) {
            try { await sendReminderForEvent(this.env.DB, slug, ev, cfg, nowSec, this.env.EXPO_PUSH_BASE); }
            catch (e) {
              /* 单车异常不许拖垮后续车辆与重排; 但要留痕 (审计 A7 汇聚) */
              void logError(this.env.DB, { source: 'guildhub-alarm', error: e, tenant: slug, context: { eventId: ev.id } });
            }
          }
        }
      }
    } catch (e) {
      // 铃链级异常: 落库留痕后照旧抛出, 不改变 DO 运行时的既有处理
      void logError(this.env.DB, { source: 'guildhub-alarm', error: e, tenant: slug || '' });
      throw e;
    } finally {
      await this.recomputeAlarm().catch(() => {});
    }
  }

  async fetch(request) {
    const url = new URL(request.url);

    // 客户端订阅: WS 握手 (worker.js 已完成会话与成员校验)
    if (request.headers.get('Upgrade') === 'websocket') {
      const m = url.pathname.match(/^\/ws\/guild\/([^/]+)/);
      if (m) await this.rememberSlug(decodeURIComponent(m[1]));
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server); // hibernation: 空闲自动休眠
      this.ctx.waitUntil(this.recomputeAlarm().catch(() => {})); // 唤醒顺手重排
      return new Response(null, { status: 101, webSocket: client });
    }

    // 服务端广播: POST /publish {slug, groupingId, kind}
    if (url.pathname.endsWith('/publish') && request.method === 'POST') {
      const data = await request.json().catch(() => null);
      if (!data || typeof data.slug !== 'string' || !data.slug
        || (typeof data.groupingId !== 'string' && typeof data.groupingId !== 'number')
        || !KINDS.has(data.kind)) {
        return new Response('bad request', { status: 400 });
      }
      await this.rememberSlug(data.slug);
      const msg = JSON.stringify({
        type: 'grouping-changed',
        slug: data.slug,
        groupingId: String(data.groupingId),
        kind: data.kind,
        at: Date.now(),
      });
      let n = 0;
      for (const ws of this.ctx.getWebSockets()) {
        try { ws.send(msg); n++; } catch { /* 断开的连接由 close 回调清理 */ }
      }
      // 车辆增删改顺带重排提醒铃 (seats 不影响时刻, 跳过省一次查询)
      if (data.kind !== 'seats') this.ctx.waitUntil(this.recomputeAlarm().catch(() => {}));
      return Response.json({ ok: true, delivered: n });
    }

    // 提醒重排催促: POST /nudge {slug} (写路径落库后调用, 尽力而为)
    if (url.pathname.endsWith('/nudge') && request.method === 'POST') {
      const data = await request.json().catch(() => null);
      if (data && typeof data.slug === 'string' && data.slug) await this.rememberSlug(data.slug);
      const alarm = await this.recomputeAlarm();
      return Response.json({ ok: true, alarm });
    }

    // 提醒状态查询: POST /alarm-state {slug?} -> 当前挂铃时刻 (portal 展示)
    if (url.pathname.endsWith('/alarm-state') && request.method === 'POST') {
      const data = await request.json().catch(() => null);
      if (data && typeof data.slug === 'string' && data.slug) await this.rememberSlug(data.slug);
      const alarm = await this.ctx.storage.getAlarm().catch(() => null);
      return Response.json({ ok: true, slug: await this.slug(), alarm });
    }

    return new Response('not found', { status: 404 });
  }

  // hibernation 回调: 客户端心跳
  async webSocketMessage(ws, message) {
    try {
      const d = JSON.parse(message);
      if (d && d.type === 'ping') ws.send(JSON.stringify({ type: 'pong' }));
    } catch { /* 忽略非 JSON 消息 */ }
  }

  async webSocketClose(ws, code, reason, wasClean) {
    // hibernation 下连接自动从集合移除, 无需手动清理
  }

  async webSocketError(ws, error) {
    try { ws.close(1011, 'internal error'); } catch {}
  }
}
