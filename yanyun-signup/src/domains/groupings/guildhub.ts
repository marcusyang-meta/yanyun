// GuildHub — Durable Object realtime push hub (one instance per
// guild, id = guild:<slug>).
// Holds the WebSocket connections of the guild's pages (list /
// detail); after a GraphQL mutation commits to D1 it POSTs
// /publish here, and the minimal event {slug, groupingId, kind} is
// broadcast to all connections. Events carry no business data —
// clients re-query through normal GraphQL, and resolvers remain
// the single source of truth for permissions.
// No auth in this class: WS upgrades pass the worker's
// /ws/guild/:slug route first (yy_session + getGuildAccess member
// check); non-members and anonymous users never reach here.
// Uses the WebSocket Hibernation API: idle connections sleep and
// burn no duration.
// Departure-reminder scheduling (no per-minute cron scan): this DO
// holds at most one alarm = the next pending reminder time of this
// guild (starts_at - 10min). The alarm is only a wake-up bell; D1
// is the single source of truth — every reschedule re-reads D1,
// and at fire time due groupings are re-read and re-verified one
// by one (a changed time follows the new time, a disbanded
// grouping is gone, sent/failed ones never resend). Write paths
// nudge a reschedule via /nudge; connects and broadcasts
// reschedule too, so a lost nudge cannot drift for long.

import {
  ensureReminderColumns, getReminderConfig, nextReminderAt, dueReminders, sendReminderForEvent,
} from './reminder.ts';
import { logError } from '../platform/index.ts';

const KINDS = new Set(['created', 'updated', 'deleted', 'seats']);

export class GuildHub {
  ctx: any;
  env: any;
  constructor(ctx: any, env: any) {
    this.ctx = ctx;
    this.env = env;
  }

  /* This guild's slug: prefer the stored one (brought in by whichever entry ran), else parse the DO id name guild:<slug>. */
  async slug() {
    let slug = await this.ctx.storage.get('slug').catch(() => null);
    if (!slug && this.ctx.id && this.ctx.id.name) {
      const n = String(this.ctx.id.name);
      if (n.startsWith('guild:')) slug = n.slice('guild:'.length);
    }
    return slug || null;
  }
  async rememberSlug(slug: any) {
    if (slug) await this.ctx.storage.put('slug', String(slug)).catch(() => {});
  }

  /* Reschedule the alarm: re-read D1 for the next reminder time; no webhook configured / reminders off clears the alarm. */
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

  /* Alarm fired: send every due grouping (each re-verified against
 * D1 inside the send function), then reschedule. One grouping's
 * failure only records its reminder_error — never break the chain. */
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
              /* One grouping's failure must not take down later groupings or the reschedule; but leave a trace (audit A7 sink). */
              void logError(this.env.DB, { source: 'guildhub-alarm', error: e, tenant: slug, context: { eventId: ev.id } });
            }
          }
        }
      }
    } catch (e) {
      // Alarm-chain-level error: record it, then rethrow — do not change the DO runtime's existing handling.
      void logError(this.env.DB, { source: 'guildhub-alarm', error: e, tenant: slug || '' });
      throw e;
    } finally {
      await this.recomputeAlarm().catch(() => {});
    }
  }

  async fetch(request: any) {
    const url = new URL(request.url);

    // Client subscribe: WS handshake (worker route already did session + member checks).
    if (request.headers.get('Upgrade') === 'websocket') {
      const m = url.pathname.match(/^\/ws\/guild\/([^/]+)/);
      if (m) await this.rememberSlug(decodeURIComponent(m[1]));
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      this.ctx.waitUntil(this.recomputeAlarm().catch(() => {}));
      return new Response(null, { status: 101, webSocket: client });
    }

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
        try { ws.send(msg); n++; } catch { /* Disconnected sockets are cleaned up by the close callback. */ }
      }
      // Grouping changes also reschedule the reminder alarm (seats don't affect timing — skip, saves a query).
      if (data.kind !== 'seats') this.ctx.waitUntil(this.recomputeAlarm().catch(() => {}));
      return Response.json({ ok: true, delivered: n });
    }

    if (url.pathname.endsWith('/nudge') && request.method === 'POST') {
      const data = await request.json().catch(() => null);
      if (data && typeof data.slug === 'string' && data.slug) await this.rememberSlug(data.slug);
      const alarm = await this.recomputeAlarm();
      return Response.json({ ok: true, alarm });
    }

    if (url.pathname.endsWith('/alarm-state') && request.method === 'POST') {
      const data = await request.json().catch(() => null);
      if (data && typeof data.slug === 'string' && data.slug) await this.rememberSlug(data.slug);
      const alarm = await this.ctx.storage.getAlarm().catch(() => null);
      return Response.json({ ok: true, slug: await this.slug(), alarm });
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
