// Expo push: the app channel for departure reminders. Runs parallel to
// the Discord webhook reminder from the same T-10 trigger (GuildHub
// alarm), targeting participants whose accounts were resolved during
// reminder identity resolution, mapped to their registered
// ExponentPushTokens. Seats without a resolved account have no app
// identity and simply receive nothing — coverage is never faked; the
// Discord channel remains the full-coverage one.
import { logError } from './error-log.ts';
import { upsertPushToken, deletePushTokenForUser, deletePushTokenEverywhere as deleteTokenEverywhere, listPushTokensForUsers } from './pushTokens.ts';

// Sends via the Expo Push Service HTTP API; DeviceNotRegistered tokens
// are deleted immediately (checked in both tickets and receipts). Fully
// failure-isolated: any exception is only logged, never bubbles into the
// Discord send or alarm settlement.

// EXPO_PUSH_BASE exists only for local stub testing; production never
// sets it and always uses exp.host.
function expoEndpoints(base: any) {
  const b = (base && String(base).trim()) || 'https://exp.host';
  return {
    send: b + '/--/api/v2/push/send',
    receipts: b + '/--/api/v2/push/getReceipts',
  };
}
const EXPO_CHUNK = 100; // Expo per-request limit
const PUSH_TOKEN_RE = /^(ExponentPushToken|ExpoPushToken)\[[^\]\s]+\]$/;

export function isValidPushToken(token: any) {
  return typeof token === 'string' && PUSH_TOKEN_RE.test(token.trim());
}

export async function savePushToken(db: D1Database, discordId: string, token: string, platform: any) {
  const now = Math.floor(Date.now() / 1000);
  await upsertPushToken(
    db, String(discordId), String(token), String(platform || '').slice(0, 20), now,
  );
}

export async function deletePushToken(db: D1Database, discordId: string, token: string) {
  await deletePushTokenForUser(db, String(discordId), String(token));
}

// Invalid-token cleanup deletes by token itself (receipts name tokens, not users)
async function deletePushTokenEverywhere(db: D1Database, token: string) {
  await deleteTokenEverywhere(db, String(token));
}

// discord_id -> [token...]
export async function pushTokensForUsers(db: D1Database, discordIds: any) {
  const out = new Map<string, string[]>();
  const ids: string[] = [...new Set<string>((discordIds || []).map((x: any) => String(x)).filter(Boolean))];
  if (!ids.length) return out;
  const results = await listPushTokensForUsers(db, ids).catch(() => []);
  for (const r of results || []) {
    const k = String(r.discord_id);
    if (!out.has(k)) out.set(k, []);
    out.get(k)!.push(String(r.token));
  }
  return out;
}

/* ---------- Expo Push Service sending ---------- */
async function expoFetchJson(url: string, payload: any, timeoutMs = 15000, attempts = 1): Promise<any> {
  // Egress can stall (exp.host first connect has been seen stuck 20s):
  // one retry allowed; still failing returns null for the caller to record.
  for (let a = 0; a < attempts; a++) {
    if (a > 0) await new Promise((r) => setTimeout(r, 1500));
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          'accept-encoding': 'gzip',
        },
        body: JSON.stringify(payload),
        signal: ctl.signal,
      });
      if (!r.ok) continue;
      const j = await r.json().catch(() => null);
      if (j) return j;
    } catch { /* timeout/network jitter: retry per attempts */ } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

/* Batch-send messages [{to, title, body, data}]. Tickets filter obvious
 * DeviceNotRegistered first; surviving ticket ids are confirmed via
 * receipts and hit tokens are deleted. Returns stats; never throws. */
export async function sendExpoPush(db: D1Database, messages: any, expoBase: any) {
  const EP = expoEndpoints(expoBase);
  const summary: { attempted: number; ticketOk: number; removed: number; errors: string[] } = { attempted: 0, ticketOk: 0, removed: 0, errors: [] };
  const list = (messages || []).filter((m: any) => m && isValidPushToken(m.to));
  summary.attempted = list.length;
  if (!list.length) return summary;
  const receiptIds = new Map<string, string>(); // ticket id -> token
  for (let i = 0; i < list.length; i += EXPO_CHUNK) {
    const chunk = list.slice(i, i + EXPO_CHUNK);
    const resp = await expoFetchJson(EP.send, chunk, 15000, 2);
    const tickets = resp && Array.isArray(resp.data) ? resp.data : null;
    if (!tickets) { summary.errors.push('push send: no response'); continue; }
    for (let j = 0; j < tickets.length; j++) {
      const t = tickets[j];
      const token = chunk[j] && chunk[j].to;
      if (!t || !token) continue;
      if (t.status === 'ok' && t.id) {
        summary.ticketOk++;
        receiptIds.set(String(t.id), token);
      } else if (t.status === 'error') {
        const code = t.details && t.details.error;
        summary.errors.push(`ticket ${code || '?'}: ${String(t.message || '').slice(0, 120)}`);
        if (code === 'DeviceNotRegistered') {
          await deletePushTokenEverywhere(db, token).catch(() => {});
          summary.removed++;
        }
      }
    }
  }
  // Receipts: Expo suggests waiting 15 min, but dead tokens are usually
  // visible at once; check immediately as a second cleanup net. Not-ready is not a failure.
  if (receiptIds.size) {
    const ids = [...receiptIds.keys()];
    for (let i = 0; i < ids.length; i += EXPO_CHUNK) {
      const part = ids.slice(i, i + EXPO_CHUNK);
      const resp = await expoFetchJson(EP.receipts, { ids: part });
      const receipts = resp && resp.data && typeof resp.data === 'object' ? resp.data : null;
      if (!receipts) continue;
      for (const [id, receipt] of Object.entries(receipts)) {
        if (receipt && (receipt as any).status === 'error'
          && (receipt as any).details && (receipt as any).details.error === 'DeviceNotRegistered') {
          const token = receiptIds.get(id);
          if (token) {
            await deletePushTokenEverywhere(db, token).catch(() => {});
            summary.removed++;
          }
        }
      }
    }
  }
  return summary;
}

/* Departure-reminder app channel: userIds are participants already
 * resolved to accounts. Same information as the Discord version
 * (title/minutes/dungeon/guild), in a concise form without the roster. */
export async function sendDeparturePush(db: D1Database, slug: string, ev: any, cfg: any, userIds: any, nowSec: number, expoBase: any) {
  const byUser = await pushTokensForUsers(db, userIds || []);
  if (!byUser.size) return { attempted: 0, ticketOk: 0, removed: 0, errors: [] };
  const guildName = (cfg && cfg.guildName) || slug;
  const mins = Math.max(1, Math.round((Number(ev.starts_at_utc) - nowSec) / 60));
  let body = `「${ev.title}」还有 ${mins} 分钟发车`;
  if (ev.dungeon && String(ev.dungeon).trim()) body += ` · 副本：${String(ev.dungeon).trim()}`;
  const messages = [];
  for (const tokens of byUser.values()) {
    for (const token of tokens) {
      messages.push({
        to: token,
        title: `${guildName} · 发车提醒`,
        body,
        sound: 'default',
        channelId: 'default',
        data: { slug: String(slug), groupingId: String(ev.id) },
      });
    }
  }
  const summary = await sendExpoPush(db, messages, expoBase);
  if (summary.errors.length) {
    console.log(`[push] event ${ev.id} (${slug}): attempted=${summary.attempted} ok=${summary.ticketOk} removed=${summary.removed} errors=${summary.errors.slice(0, 3).join(' | ')}`);
    // Error sink: push failures also land in error_log, not only console
    void logError(db, {
      source: 'push', name: 'PushError', tenant: slug,
      message: summary.errors.slice(0, 3).join(' | '),
      context: { eventId: ev.id, attempted: summary.attempted, ticketOk: summary.ticketOk },
    });
  }
  return summary;
}
