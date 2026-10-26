/* 平台 OG 数据面 (三期域拆分): SPA 入口注入的分享卡标签 (主页/百业/
 * 车队三级), 数据直接查各域服务面, 与 OG worker 同口径。 */
import { getTenantRow } from '../guilds/index.ts';
import { isDevOnlyTenant } from './http.ts';
import { getDungeonByName } from '../dex/index.ts';
import { getEventRowByTenant, getEventRow, listEventsWeekView, countActivityEventsInWindow, countSignupsByEvent } from '../groupings/index.ts';


const OG_WORKER = 'https://og.yanyun.app';
const SITE_URL = 'https://yanyun.app';

const escHtml = (str: any) => String(str ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// 车时间: unix 秒(UTC) -> "周六 20:00" (与 OG worker 同款 UTC 墙钟格式)
export function fmtCarTimeUtc(sec: any) {
  const n = parseInt(sec, 10);
  if (!n) return '';
  const d = new Date(n * 1000);
  if (isNaN(d.getTime())) return '';
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const p = (x: number) => String(x).padStart(2, '0');
  return `${week[d.getUTCDay()]} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

const CAR_TYPE_LABEL: Record<string, string> = { activity: '双十人本', talent: '天赋组队', race: '竞速报名', tower: '爬塔' };

export function hubOgTags() {
  return [
    '<meta property="og:title" content="百业集结 · 燕云十六声百业" />',
    '<meta property="og:description" content="燕云十六声国际服百业车队与攻略集散地 —— 择一业而入，共赴双十。" />',
    `<meta property="og:image" content="${OG_WORKER}/og/hub.png" />`,
    `<meta property="og:url" content="${SITE_URL}/" />`,
    '<meta property="og:type" content="website" />',
    '<meta name="twitter:card" content="summary_large_image" />',
  ].join('\n');
}

// 分享卡片口径 (2026-10-25 用户裁决): 所有真实百业一律真实卡片 —
// OG 标签与图都带百业名/口号/本周车队数, 不再按是否绑定 Discord 降级。
// 成员昵称/名册永不出现在公开卡片上。
// 本周窗与站点周逻辑一致: 周一 05:00 (北京时间) 起, [start, start+7d)
export function ogWeekWindowUtc() {
  const now = Math.floor(Date.now() / 1000);
  const cst = now + 8 * 3600;
  const d = new Date(cst * 1000);
  const dayStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000;
  let monday = dayStart - ((d.getUTCDay() + 6) % 7) * 86400 + 5 * 3600;
  if (cst < monday) monday -= 7 * 86400;
  const startUtc = monday - 8 * 3600;
  return [startUtc, startUtc + 7 * 86400];
}

export async function guildOgTags(env: any, slug: string) {
  try {
    // dev_only 百业在生产视为不存在: 不注入任何带名称的 OG 标签
    if (await isDevOnlyTenant(env.DB, slug)) return null;
    const t = await getTenantRow(env.DB, slug);
    if (!t || !t.guild_name) return null;
    const name = t.guild_name;
    // 本周双十车队数 (装饰性字段, 查不到按 0 不带出, 不阻塞标签注入)
    let teamCount = 0;
    try {
      const [from, to] = ogWeekWindowUtc();
      teamCount = await countActivityEventsInWindow(env.DB, slug, from, to);
    } catch { teamCount = 0; }
    const descParts = [];
    if (t.slogan) descParts.push(t.slogan);
    if (teamCount > 0) descParts.push(`本周 ${teamCount} 个车队招募中`);
    descParts.push(`${name} | 燕云十六声国际服百业车队与攻略`);
    return [
      `<meta property="og:title" content="${escHtml(name)} · 燕云百业" />`,
      `<meta property="og:description" content="${escHtml(descParts.join(' · '))}" />`,
      `<meta property="og:image" content="${OG_WORKER}/og/${encodeURIComponent(slug)}.png" />`,
      `<meta property="og:url" content="${SITE_URL}/${encodeURIComponent(slug)}" />`,
      '<meta property="og:type" content="website" />',
      '<meta name="twitter:card" content="summary_large_image" />',
    ].join('\n');
  } catch { return null; }
}

export async function carOgTags(env: any, slug: string, carId: any) {
  try {
    if (await isDevOnlyTenant(env.DB, slug)) return null;
    const ev = await getEventRow(env.DB, parseInt(carId, 10) || 0);
    // 租户隔离: 车队不存在或不属于该 slug 时不注入, 不泄露他会数据
    if (!ev || ev.tenant !== slug) return null;
    const t = await getTenantRow(env.DB, slug);
    if (!t || !t.guild_name) return null;
    const cnt = await countSignupsByEvent(env.DB, ev.id);
    let dungeonName = '';
    if (ev.dungeon) {
      const d = await getDungeonByName(env.DB, ev.dungeon);
      if (d) dungeonName = d.name;
    }
    const typeLabel = CAR_TYPE_LABEL[ev.type] || '';
    const descParts = [typeLabel, dungeonName, fmtCarTimeUtc(ev.starts_at_utc), `已报名 ${cnt || 0}/${ev.max_slots}`].filter(Boolean);
    return [
      `<meta property="og:title" content="${escHtml(ev.title)} · ${escHtml(t.guild_name)}" />`,
      `<meta property="og:description" content="${escHtml(descParts.join(' | '))} · 燕云十六声百业车队" />`,
      `<meta property="og:image" content="${OG_WORKER}/og/${encodeURIComponent(slug)}/car/${encodeURIComponent(carId)}.png" />`,
      `<meta property="og:url" content="${SITE_URL}/${encodeURIComponent(slug)}/car/${encodeURIComponent(carId)}" />`,
      '<meta property="og:type" content="website" />',
      '<meta name="twitter:card" content="summary_large_image" />',
    ].join('\n');
  } catch { return null; }
}

/* ---------- 实时推送订阅: GET /ws/guild/:slug (WebSocket) ----------
 * 鉴权与 GraphQL 读权限完全同源: yy_session 会话 (含授权完整性校验) +
 * graphql.js 的 getGuildAccess —— 已绑定百业仅成员可订阅, 未绑定百业
 * 公开可读即可订阅; 非成员/匿名/不存在一律 403, 请求根本到不了
 * GuildHub。通过后把原始升级请求转给该百业的 GuildHub 实例 (hibernation
 * WS)。事件本身只有 {slug, groupingId, kind}, 客户端靠它触发 GraphQL
 * 重查, 数据面不经过这条通道。 */