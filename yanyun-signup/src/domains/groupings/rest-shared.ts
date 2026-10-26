/* groupings domain REST shared pieces: result time parsing, the
 * creation Discord notice, and GuildHub publish / reminder nudges.
 * The GraphQL side has same-definition implementations; these serve
 * the REST write paths. */
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

// unix seconds (UTC) -> 'YYYY-MM-DD HH:MM:SS' (UTC text, compatible with the legacy starts_at field).
export const utcToText = (utc: number) => {
  const d = new Date(utc * 1000), p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
};

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
  } catch { /* Push failure must not affect creation. */ }
}

/* ---------- GuildHub realtime publish (same definition as graphql.js publishGroupingEvent) ----------
 * Called after a REST write commits: the event carries only
 * {slug, groupingId, kind}; web clients re-query via GraphQL (a
 * deleted grouping switches to the nonexistent state). Best
 * effort: failures are silent and never block the response. */
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
  } catch { /* Publish failure must not affect the write. */ }
}

/* ---------- Reminder reschedule nudge (GuildHub DO alarm) ----------
 * Called after a REST write commits: makes this guild's GuildHub
 * re-read D1 and reschedule its reminder alarm. Best effort:
 * failures are silent; the DO also reschedules on connect /
 * broadcast wake-ups, so an occasional loss cannot drift for long. */
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
  } catch { /* Nudge failure must not affect the write. */ }
}
