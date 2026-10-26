/* groupings 域 REST 共享件 (三期域拆分): 成绩时间解析、发车 Discord
 * 通知与 GuildHub 发布/提醒催促。GraphQL 侧有同口径实现, 这里是 REST
 * 写路径的对应件。 */
import { getTenantRow } from '../guilds/index.ts';
import { TYPES } from '../platform/http.ts';

export function parseTimeMs(input: any) {
  const t = String(input ?? '').trim();
  if (/^\d+(\.\d+)?$/.test(t)) return Math.round(parseFloat(t) * 1000);
  const m = t.match(/^(?:(\d+):)?([0-5]?\d):([0-5]?\d(?:\.\d{1,3})?)$/);
  if (!m) return null;
  const h = m[1] ? parseInt(m[1], 10) : 0;
  const min = parseInt(m[2], 10), sec = parseFloat(m[3]);
  return Math.round(((h * 3600) + (min * 60) + sec) * 1000);
}
export const fmtMs = (ms: number) => {
  const t = Math.floor(ms / 1000), frac = ms % 1000;
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return (h ? h + ':' : '') + p(m) + ':' + p(sec) + '.' + String(frac).padStart(3, '0');
};

// unix 秒(UTC) -> 'YYYY-MM-DD HH:MM:SS'(UTC 文本, 兼容旧 starts_at 字段)
export const utcToText = (utc: number) => {
  const d = new Date(utc * 1000), p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
};

/* ---------- Discord webhook 推送 ---------- */
export async function notifyDiscord(env: any, slug: string, event: any) {
  try {
    const t = await getTenantRow(env.DB, slug);
    const wh = t?.discord_webhook;
    if (!wh) return;
    const timeStr = event.starts_at_utc
      ? new Date(event.starts_at_utc * 1000).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      : '时间待定';
    const typeName = TYPES[event.type] || event.type;
    const embed = {
      title: `📣 新车队：${event.title}`,
      description: event.description || '',
      color: 0xb8860b,
      fields: [
        { name: '类型', value: typeName, inline: true },
        { name: '时间', value: timeStr, inline: true },
        { name: '名额', value: String(event.max_slots || '-'), inline: true },
      ],
      footer: { text: t.guild_name || slug },
    };
    await fetch(wh, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch { /* 推送失败不影响发车 */ }
}

/* ---------- GuildHub 实时推送 (与 graphql.js publishGroupingEvent 同口径) ----------
 * REST 写路径落库成功后调用: 事件只带 {slug, groupingId, kind}, 网页端收到
 * 后走 GraphQL 重查 (删车则切到不存在态)。尽力而为: 失败静默, 不阻塞响应。 */
export function publishGuildEvent(c: any, slug: string, groupingId: any, kind: string) {
  try {
    if (!c.env.GUILD_HUB || !slug) return;
    const stub = c.env.GUILD_HUB.get(c.env.GUILD_HUB.idFromName('guild:' + slug));
    const p = stub.fetch('https://guild-hub/publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, groupingId: String(groupingId), kind }),
    }).then(() => {}).catch(() => {});
    c.executionCtx.waitUntil(p);
  } catch { /* 推送故障不影响写操作 */ }
}

/* ---------- 开车提醒重排催促 (GuildHub DO alarm) ----------
 * REST 写路径落库后调用: 让该百业 GuildHub 现查 D1 重排提醒铃。尽力而为:
 * 失败静默; DO 在连接/广播唤醒时也会顺手重排, 偶发丢失不会长期漂移。 */
export function nudgeReminderHub(c: any, slug: string) {
  try {
    if (!c.env.GUILD_HUB || !slug) return;
    const stub = c.env.GUILD_HUB.get(c.env.GUILD_HUB.idFromName('guild:' + slug));
    const p = stub.fetch('https://guild-hub/nudge', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).then(() => {}).catch(() => {});
    c.executionCtx.waitUntil(p);
  } catch { /* 催促故障不影响写操作 */ }
}
