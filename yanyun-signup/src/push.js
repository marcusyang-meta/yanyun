// Expo 推送 · 发车提醒的 App 通道 (2026-10-25)
// 与 Discord webhook 提醒并行: 同一个 T-10min 触发点 (GuildHub alarm ->
// reminder.js sendReminderForEvent), 对象 = 提醒身份解析已命中账号的参与者
// (buildReminderMessage 返回的 userIds), 再映射到这些账号在 App 里注册的
// ExponentPushToken。解析不到账号的座位没有 App 身份, 天然收不到 —— 不
// 伪造覆盖率, Discord 那条仍是全覆盖通道。
import { logError } from './errorlog.js';
import {
  upsertPushToken, deletePushTokenForUser, deletePushTokenEverywhere as deleteTokenEverywhere,
  listPushTokensForUsers,
} from './db/repositories/pushTokens.ts';

// 发送走 Expo Push Service HTTP API; DeviceNotRegistered 的令牌立即自清
// (tickets 与 receipts 两处都查)。全模块失败隔离: 任何异常只记日志, 绝不
// 冒泡影响 Discord 发送与 alarm 结算。

// EXPO_PUSH_BASE 仅供本地打桩验收覆盖 (与 auth.js 的 DISCORD_API_BASE 同
// 套路), 生产不设此变量, 恒走 exp.host。
function expoEndpoints(base) {
  const b = (base && String(base).trim()) || 'https://exp.host';
  return {
    send: b + '/--/api/v2/push/send',
    receipts: b + '/--/api/v2/push/getReceipts',
  };
}
const EXPO_CHUNK = 100; // Expo 单请求上限
const PUSH_TOKEN_RE = /^(ExponentPushToken|ExpoPushToken)\[[^\]\s]+\]$/;

export function isValidPushToken(token) {
  return typeof token === 'string' && PUSH_TOKEN_RE.test(token.trim());
}

/* ---------- push_tokens 表 (懒 DDL, 与 reminder.js 同套路) ----------
 * 一人可多设备多令牌; (discord_id, token) 唯一, 同令牌重注册只刷新
 * platform/updated_at。注销按 (discord_id, token) 删, 不误删他人设备。 */
let pushTokensReady = null;
export function ensurePushTokensTable(db) {
  if (!pushTokensReady) {
    pushTokensReady = (async () => {
      try {
        await db.prepare(`CREATE TABLE IF NOT EXISTS push_tokens (
          discord_id TEXT NOT NULL,
          token TEXT NOT NULL,
          platform TEXT NOT NULL DEFAULT '',
          updated_at INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (discord_id, token)
        )`).run();
      } catch { /* 表已存在等情况静默 */ }
    })();
  }
  return pushTokensReady;
}

export async function savePushToken(db, discordId, token, platform) {
  await ensurePushTokensTable(db);
  const now = Math.floor(Date.now() / 1000);
  await upsertPushToken(
    db, String(discordId), String(token), String(platform || '').slice(0, 20), now,
  );
}

export async function deletePushToken(db, discordId, token) {
  await ensurePushTokensTable(db);
  await deletePushTokenForUser(db, String(discordId), String(token));
}

// 令牌失效自清: 按令牌本身删 (回执只认令牌不认人)
async function deletePushTokenEverywhere(db, token) {
  await ensurePushTokensTable(db);
  await deleteTokenEverywhere(db, String(token));
}

// discord_id -> [token...]
export async function pushTokensForUsers(db, discordIds) {
  const out = new Map();
  const ids = [...new Set((discordIds || []).map(String).filter(Boolean))];
  if (!ids.length) return out;
  await ensurePushTokensTable(db);
  const results = await listPushTokensForUsers(db, ids).catch(() => []);
  for (const r of results || []) {
    const k = String(r.discord_id);
    if (!out.has(k)) out.set(k, []);
    out.get(k).push(String(r.token));
  }
  return out;
}

/* ---------- Expo Push Service 发送 ---------- */
async function expoFetchJson(url, payload, timeoutMs = 15000, attempts = 1) {
  // 出口网络偶发卡顿 (实测 exp.host 首连可卡 20s): 发送允许重试一次,
  // 仍失败按 null 返回, 由调用方记账, 不冒泡。
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
    } catch { /* 超时/网络抖动: 按 attempts 重试 */ } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

/* 批量发送 messages: [{to, title, body, data}]。tickets 先行过滤明显的
 * DeviceNotRegistered; 其余拿到 ticket id 再查 receipts 二次确认, 命中
 * 的令牌自清。返回统计, 永不抛错。 */
export async function sendExpoPush(db, messages, expoBase) {
  const EP = expoEndpoints(expoBase);
  const summary = { attempted: 0, ticketOk: 0, removed: 0, errors: [] };
  const list = (messages || []).filter((m) => m && isValidPushToken(m.to));
  summary.attempted = list.length;
  if (!list.length) return summary;
  const receiptIds = new Map(); // ticket id -> token
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
  // receipts: Expo 建议 15 分钟后查, 但失效令牌通常即刻可见; 这里立即查
  // 一次作为自清的第二道网, 查不到/未就绪不算失败。
  if (receiptIds.size) {
    const ids = [...receiptIds.keys()];
    for (let i = 0; i < ids.length; i += EXPO_CHUNK) {
      const part = ids.slice(i, i + EXPO_CHUNK);
      const resp = await expoFetchJson(EP.receipts, { ids: part });
      const receipts = resp && resp.data && typeof resp.data === 'object' ? resp.data : null;
      if (!receipts) continue;
      for (const [id, receipt] of Object.entries(receipts)) {
        if (receipt && receipt.status === 'error'
          && receipt.details && receipt.details.error === 'DeviceNotRegistered') {
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

/* 发车提醒的 App 通道: userIds = buildReminderMessage 已解析到账号的参与
 * 者。文案与 Discord 版同信息 (车名/分钟数/副本/百业), 简洁版不带名册。 */
export async function sendDeparturePush(db, slug, ev, cfg, userIds, nowSec, expoBase) {
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
    // 全站错误汇聚 (审计 A7): 推送失败除 console 外同步落 error_log
    void logError(db, {
      source: 'push', name: 'PushError', tenant: slug,
      message: summary.errors.slice(0, 3).join(' | '),
      context: { eventId: ev.id, attempted: summary.attempted, ticketOk: summary.ticketOk },
    });
  }
  return summary;
}
