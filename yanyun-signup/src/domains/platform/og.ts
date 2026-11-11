/* Platform OG data surface: share-card tags injected at the SPA entry
 * (hub / guild / team levels), read via domain services, same semantics
 * as the OG worker. */
import { getTenantRow } from '../guilds/index.ts';
import { isDevOnlyTenant } from './http.ts';
import { getDungeonByName } from '../dex/index.ts';
import { getEventRowByTenant, getEventRow, listEventsWeekView, countActivityEventsInWindow, countSignupsByEvent, resolveSharedGrouping, fmtCarTimeDualZonesCompact } from '../groupings/index.ts';
import { resolveSharedBuild } from '../gear/index.ts';
import { startsAtEpoch } from './blocks.ts';


const OG_WORKER = 'https://og.yanyun.app';
const SITE_URL = 'https://yanyun.app';

const escHtml = (str: any) => String(str ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Team time on share text: the car's start rendered in US East and
// US West side by side with Chinese zone labels — interim ruling
// (marcus, 2026-11-01): "先放美东和美西时间". The formatters live in
// the groupings data layer (car-tz.ts) and the OG card image prints
// fmtCarTimeDualZones via ogCarCard.cardTimeText; the description
// below prints the compact variant (fmtCarTimeDualZonesCompact),
// which drops the West segment's weekday when both zones share it
// (marcus, 2026-11-07) — same instant, same zones, less crowding.
// (The home-zone resolution chain in car-tz.ts stays in place for a
// later switch back to single-zone rendering; the earlier UTC
// wall-clock format stays retired.)

const CAR_TYPE_LABEL: Record<string, string> = { activity: '双十人本', talent: '天赋组队', race: '竞速报名', tower: '爬塔', explore: '联机探索' };

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

// Share-card ruling: every real guild gets a real card — OG tags and
// image carry the guild name/slogan/this-week team count, with no
// downgrade for unbound guilds. Member nicks/rosters never appear on
// public cards. Week window matches the site: Monday 05:00 Beijing, [start, start+7d).
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

/* pageUrl overrides og:url only (the page's canonical address on
 * the host it was requested through — a guild subdomain passes its
 * own root URL). The default composes the main-host URL exactly as
 * before; og:image always stays on the OG worker. */
export async function guildOgTags(env: any, slug: string, pageUrl?: string) {
  try {
    // dev_only guilds count as nonexistent in production: inject no named OG tags
    if (await isDevOnlyTenant(env.DB, slug)) return null;
    const t = await getTenantRow(env.DB, slug);
    if (!t || !t.guild_name) return null;
    const name = t.guild_name;
    // This-week team count is decorative: lookup failure means 0 / omitted, never blocks tag injection
    let teamCount = 0;
    try {
      const [from, to] = ogWeekWindowUtc();
      const tRow = await getTenantRow(env.DB, slug).catch(() => null);
      teamCount = tRow ? await countActivityEventsInWindow(env.DB, tRow.id, from, to) : 0;
    } catch { teamCount = 0; }
    const descParts = [];
    if (t.slogan) descParts.push(t.slogan);
    if (teamCount > 0) descParts.push(`本周 ${teamCount} 个车队招募中`);
    descParts.push(`${name} | 燕云十六声国际服百业车队与攻略`);
    return [
      `<meta property="og:title" content="${escHtml(name)} · 燕云百业" />`,
      `<meta property="og:description" content="${escHtml(descParts.join(' · '))}" />`,
      `<meta property="og:image" content="${OG_WORKER}/og/${encodeURIComponent(slug)}.png" />`,
      `<meta property="og:url" content="${pageUrl || `${SITE_URL}/${encodeURIComponent(slug)}`}" />`,
      '<meta property="og:type" content="website" />',
      '<meta name="twitter:card" content="summary_large_image" />',
    ].join('\n');
  } catch { return null; }
}

export async function carOgTags(env: any, slug: string, carId: any, pageUrl?: string) {
  try {
    if (await isDevOnlyTenant(env.DB, slug)) return null;
    const ev = await getEventRow(env.DB, parseInt(carId, 10) || 0);
    const t = await getTenantRow(env.DB, slug);
    // Tenant isolation: no injection when the team is missing or belongs to another guild
    if (!ev || !t || ev.tenant !== t.id) return null;
    if (!t || !t.guild_name) return null;
    const cnt = await countSignupsByEvent(env.DB, ev.id);
    let dungeonName = '';
    if (ev.dungeon) {
      const d = await getDungeonByName(env.DB, ev.dungeon);
      if (d) dungeonName = d.name;
    }
    const typeLabel = CAR_TYPE_LABEL[ev.type] || '';
    const epoch = startsAtEpoch(ev);
    const timeText = epoch ? fmtCarTimeDualZonesCompact(epoch) : '';
    const descParts = [typeLabel, dungeonName, timeText, `已报名 ${cnt || 0}/${ev.max_slots}`].filter(Boolean);
    // Description spacing (marcus, 2026-11-07): parts breathe via a
    // full-width separator with spaces, and the site name no longer
    // rides the description tail (clients truncated it into an
    // ellipsis) — it travels as og:site_name instead. Element set
    // and order are unchanged.
    return [
      `<meta property="og:title" content="${escHtml(ev.title)} · ${escHtml(t.guild_name)}" />`,
      '<meta property="og:site_name" content="燕云十六声百业" />',
      `<meta property="og:description" content="${escHtml(descParts.join(' ｜ '))}" />`,
      `<meta property="og:image" content="${OG_WORKER}/og/${encodeURIComponent(slug)}/car/${encodeURIComponent(carId)}.png" />`,
      `<meta property="og:url" content="${pageUrl || `${SITE_URL}/${encodeURIComponent(slug)}/car/${encodeURIComponent(carId)}`}" />`,
      '<meta property="og:type" content="website" />',
      '<meta name="twitter:card" content="summary_large_image" />',
    ].join('\n');
  } catch { return null; }
}

// Car share page (/s/:code): the code resolves through the share
// service (strict dev_only handling: no view, no tags — same as the
// car tags' own rule); a live code injects the car's usual share
// card with og:url naming the share address itself, so a crawler
// following a short link lands on tags identical to the canonical
// page's. Unknown/dead codes inject nothing (the SPA renders the
// share page's not-found state).
export async function carShareOgTags(env: any, code: string) {
  try {
    const view = await resolveSharedGrouping(env.DB, code, false).catch(() => null);
    if (!view) return null;
    return carOgTags(env, view.slug, view.eventId, `${SITE_URL}/s/${encodeURIComponent(code)}`);
  } catch { return null; }
}

// Build share page (/b/:code): tags carry the build's own display
// fields only (name / target label / graduation) — the same fields
// the public page itself prints; no owner identity ever appears.
// Unknown or revoked codes inject nothing (the SPA renders its
// not-found state), exactly like an unknown tenant.
export async function buildOgTags(env: any, code: string) {
  try {
    const shared = await resolveSharedBuild(env.DB, code).catch(() => null);
    if (!shared) return null;
    const snap = shared.build.snapshot;
    const total = snap ? Math.round((snap.total || 0) * 10) / 10 : 0;
    const descParts = [shared.build.buildLabel, snap ? `毕业度 ${total}%` : ''].filter(Boolean);
    descParts.push('燕云十六声百业 · 装备方案分享');
    const name = shared.build.name || '装备方案';
    return [
      `<meta property="og:title" content="${escHtml(name)} · 燕云百业" />`,
      `<meta property="og:description" content="${escHtml(descParts.join(' · '))}" />`,
      `<meta property="og:image" content="${OG_WORKER}/og/build/${encodeURIComponent(code)}.png" />`,
      `<meta property="og:url" content="${SITE_URL}/b/${encodeURIComponent(code)}" />`,
      '<meta property="og:type" content="website" />',
      '<meta name="twitter:card" content="summary_large_image" />',
    ].join('\n');
  } catch { return null; }
}

/* ---------- Realtime subscription: GET /ws/guild/:slug (WebSocket) ----------
 * Auth is exactly the GraphQL read path: yy_session session (with grant
 * completeness check) + getGuildAccess — bound guilds are members-only,
 * unbound guilds are subscribable by signed-in viewers; bound-guild
 * non-members, anonymous and missing guilds get 403 before reaching GuildHub. Events
 * are only {slug, groupingId, kind}; clients re-query GraphQL on them,
 * no data flows over this channel. */
