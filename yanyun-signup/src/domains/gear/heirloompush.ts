// Heirloom Discord pushes (added by user ruling, 2026-10-24; fully
// independent of the event reminders).
// Shape: the admin portal configures one channel Webhook per guild
// (settings.heirloom_webhook — a separate config from the reminders'
// tenants.discord_webhook; neither replaces the other); the toggle and
// status also live in settings (tenant=slug). Evaluation happens
// server-side on the gearPlan path (session user + target build +
// whole-library verdicts are all at hand), entirely via waitUntil;
// failures only record status and never affect the gear calculation.
// Triggers (user ruled both):
//  (a) A member records an heirloom: an item judged heirloom for the
//      current target build (gearEvals yardstick) whose (user, build
//      signature, item content hash) was never pushed — the content
//      hash ignores row ids, so deleting and re-recording the same
//      item does not re-announce; several new items in one evaluation
//      merge into a single message.
//  (b) Set completion: all 8 loadout slots are heirlooms — pushed only
//      on the incomplete -> complete transition; breaking the set
//      re-arms it automatically (state in heirloom_set_state).
// Dedup follows the reminders' settlement discipline: a send is
// recorded as pushed whether it succeeds or fails (a dead webhook must
// not retry-storm on every calculation); outcome and reason go to
// heirloom_last_* for the portal.
// Sender identity matches the reminders (guild name + brand avatar,
// reusing postWebhook). Copy is fixed Discord copy (same nature as the
// reminder copy, not i18n-catalog); tone set by the user: generous
// hype — 2026-10-24 follow-up ruling "go over the top, @ everyone and
// the person": real announcements carry @everyone + @ the actor
// (allowed_mentions parse=['everyone'], users = the actor only); test
// messages @ nobody (path check only, don't wake the server).

import { GP_SLOTS, GP_AFFIX_BY_KEY, gpBuild } from './gearplanner.ts';
import { getReminderSetting, setReminderSetting, postWebhook } from '../groupings/index.ts';
import { getGuildNick } from '../identity/auth.ts';
import { webhookIdentity } from '../guilds/index.ts';
import { getTenantRow, listTenantNames } from '../guilds/index.ts';
import { getUsernameRow, getUserIdByDiscordId } from '../identity/index.ts';
import { getGuildMember, hasGuildMember } from '../identity/index.ts';
import { listPushedItemHashes, insertHeirloomItemPush, getHeirloomSetState, upsertHeirloomSetState } from './heirloom.ts';

/* ---------- Config (settings, tenant=slug) ---------- */
export async function getHeirloomConfig(db: D1Database, slug: string) {
  const t = await getTenantRow(db, slug).catch(() => null);
  if (!t) return null;
  return {
    webhook: await getReminderSetting(db, slug, 'heirloom_webhook'),
    guildName: String(t.guild_name || slug),
    enabled: (await getReminderSetting(db, slug, 'heirloom_enabled')) === '1',
  };
}

async function recordHeirloomStatus(db: D1Database, slug: string, { ok, error, atSec, event, test }: any) {
  await setReminderSetting(db, slug, 'heirloom_last_at', String(atSec));
  await setReminderSetting(db, slug, 'heirloom_last_status', test ? (ok ? 'test-ok' : 'test-error') : (ok ? 'ok' : 'error'));
  await setReminderSetting(db, slug, 'heirloom_last_error', ok ? '' : String(error || '未知错误').slice(0, 300));
  if (event) await setReminderSetting(db, slug, 'heirloom_last_event', String(event).slice(0, 60));
}

/* Item content hash: slot + affixes (key+value) + attunement — excludes
 * the row id and the item name, so deleting/re-recording or importing
 * the same item on another device yields the same hash and no repeat. */
export async function heirloomItemHash(g: any) {
  const canon = JSON.stringify({
    s: String(g.slot || ''),
    l: (g.lines || []).map((l: any) => [String(l.key), Math.round((Number(l.val) || 0) * 100) / 100]),
    d: g.dingyin && g.dingyin.name
      ? [String(g.dingyin.name), Math.round((Number(g.dingyin.val) || 0) * 100) / 100]
      : null,
  });
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canon));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
}

/* ---------- Announced member's display name ----------
 * This guild's roster (guild_members) nickname -> global name -> that
 * server's nickname snapshot -> users global name -> session name ->
 * fallback. Same ladder as the reminders' creator display name. */
async function memberDisplayName(db: D1Database, guildId: number, dgid: any, discordId: string, userName: any) {
  const rm = await getGuildMember(db, guildId, discordId).catch(() => null);
  if (rm && String(rm.nick || '').trim()) return String(rm.nick).trim();
  if (rm && String(rm.global_name || '').trim()) return String(rm.global_name).trim();
  if (dgid) {
    const n = await getGuildNick(db, discordId, dgid).catch(() => null);
    if (n && String(n).trim()) return String(n).trim();
  }
  const u = await getUsernameRow(db, discordId).catch(() => null);
  if (u && String(u.username || '').trim()) return String(u.username).trim();
  if (userName && String(userName).trim()) return String(userName).trim();
  return '百业侠客';
}

/* ---------- Copy (fixed Discord copy; tone set by the user: generous hype) ---------- */
function fmtNum(v: any) {
  return String(Math.round((Number(v) || 0) * 10) / 10);
}

export function heirloomAffixSummary(g: any) {
  const parts = (g.lines || []).map((l: any) => {
    const a = GP_AFFIX_BY_KEY[l.key];
    return `${a ? a.label : l.key} ${fmtNum(l.val)}`;
  });
  let s = parts.join(' · ');
  if (g.dingyin && g.dingyin.name) s += `\n定音：${g.dingyin.name} ${fmtNum(g.dingyin.val)}`;
  return s;
}

export function buildHeirloomItemMessage({ displayName, mention, items, build }: any) {
  const opener = [
    '@everyone',
    '',
    '📣 号外号外，都别睡了——传家宝出世啦！！！',
    '',
  ];
  const closer = [
    '严丝合缝，分毫不差！这哪是运气，这是老天爷追着喂饭！',
    `${mention} 说你呢——快出来接受全百业的膜拜，恭喜恭喜！！！`,
  ];
  if (items.length === 1) {
    const g = items[0];
    return [
      ...opener,
      `🎉 ${displayName} 录得一件传家宝 —— ${g.slot}「${g.name || '未命名'}」`,
      `目标流派：${build.school} · ${build.set}`,
      heirloomAffixSummary(g),
      ...closer,
    ].join('\n');
  }
  const shown = items.slice(0, 8);
  const blocks = shown.map((g: any) => `${g.slot}「${g.name || '未命名'}」\n${heirloomAffixSummary(g)}`);
  if (items.length > shown.length) blocks.push(`（另有 ${items.length - shown.length} 件同批录入）`);
  return [
    ...opener,
    `🎉 ${displayName} 一口气录得 ${items.length} 件传家宝！`,
    `目标流派：${build.school} · ${build.set}`,
    '',
    blocks.join('\n\n'),
    '',
    ...closer,
  ].join('\n');
}

export function buildHeirloomSetMessage({ displayName, mention, build, gradTotal }: any) {
  const pct = Math.round((Number(gradTotal) || 0) * 1000) / 10;
  return [
    '@everyone',
    '',
    '🚨 出大事啦——有人集齐全套传家宝啦！！！',
    '',
    `🏆 ${displayName} 的「${build.school} · ${build.set}」搭配，8 个部位全！员！传！家！宝！`,
    `毕业度 ${pct}%！`,
    '',
    '这已经不是配装了，这是可以传家的家底——能写进族谱、摆上供桌的那种！',
    `锣鼓喧天，鞭炮齐鸣——${mention} 快出来，全百业同贺！！！🎊`,
  ].join('\n');
}

export function buildHeirloomTestMessage(guildName: any) {
  return `🎉 测试消息：${guildName} 的传家宝推送已接通。有人录得传家宝、或集齐全套传家宝时，我会在这里播报。`;
}

/* ---------- Evaluation entry (gearPlan path, called via waitUntil) ----------
 * For each guild with heirloom pushes enabled: evaluate only when the
 * actor is a member (the session's server list contains the bound
 * server, or they are already in that guild's roster). One guild's
 * failure stays silent and does not affect the others. */
export async function evaluateHeirloomPushes(db: D1Database, args: any) {
  if (!db || !args || !args.discordId) return;
  const results = await listTenantNames(db).catch(() => []);
  for (const t of results || []) {
    try {
      await evaluateForTenant(db, t, args);
    } catch { /* one guild's push evaluation failure must never leak out */ }
  }
}

async function evaluateForTenant(db: D1Database, t: any, args: any) {
  const slug = t.slug;
  const cfg = await getHeirloomConfig(db, slug);
  if (!cfg || !cfg.enabled || !cfg.webhook) return;
  const dgid = await getReminderSetting(db, slug, 'discord_guild_id');
  let member = !!(dgid && (args.userGuilds || []).includes(String(dgid)));
  if (!member) {
    member = await hasGuildMember(db, t.id, args.discordId).catch(() => false);
  }
  if (!member) return;
  // Dedupe state is keyed by the internal user ID; the Discord ID
  // stays only on the mention path below.
  const userId = await getUserIdByDiscordId(db, args.discordId).catch(() => null);
  if (userId == null) return;

  const build = gpBuild(args.targetIdx || 0);
  const buildSig = `${build.school}|${build.set}`;
  const evalById = new Map((args.evals || []).map((e: any) => [e.id, e.verdict]));
  const nowSec = Math.floor(Date.now() / 1000);
  const displayName = await memberDisplayName(db, t.id, dgid, args.discordId, args.userName);
  // Sender identity is per-guild (switches only when a custom avatar exists; see guildavatar.webhookIdentity)
  const identity = await webhookIdentity(db, slug).catch(() => null);

  /* (a) New heirlooms: judged heirloom in this evaluation and never pushed before -> one merged announcement */
  const heirloomItems = (args.lib || []).filter((g: any) => g && g.id != null && evalById.get(g.id) === 'heirloom');
  if (heirloomItems.length) {
    const hashed = [];
    for (const g of heirloomItems) hashed.push({ g, hash: await heirloomItemHash(g) });
    const pushed = await listPushedItemHashes(db, t.id, userId, buildSig).catch(() => []);
    const seen = new Set(pushed);
    const fresh = hashed.filter((h) => !seen.has(h.hash));
    if (fresh.length) {
      const content = buildHeirloomItemMessage({ displayName, mention: `<@${args.discordId}>`, items: fresh.map((h) => h.g), build });
      const res = await postWebhook(cfg.webhook, content, [args.discordId], ['everyone'], identity);
      for (const h of fresh) {
        await insertHeirloomItemPush(db, {
          tenant: t.id, userId, buildSig, itemHash: h.hash, createdAt: nowSec,
        }).catch(() => {});
      }
      await recordHeirloomStatus(db, slug, {
        ok: res.ok, error: res.error, atSec: nowSec,
        event: fresh.length === 1 ? `传家宝 · ${fresh[0].g.name || fresh[0].g.slot}` : `传家宝 ×${fresh.length}`,
        test: false,
      });
    }
  }

  /* (b) Set-completion transition: compare state with the current loadout; announce only on incomplete -> complete */
  const complete = GP_SLOTS.every((pos: any) => {
    const id = args.loadout ? args.loadout[pos] : null;
    return id != null && evalById.get(id) === 'heirloom';
  });
  const stRow = await getHeirloomSetState(db, t.id, userId, buildSig).catch(() => null);
  const wasComplete = !!(stRow && Number(stRow.complete) === 1);
  if (complete !== wasComplete) {
    await upsertHeirloomSetState(db, {
      tenant: t.id, userId, buildSig, complete: complete ? 1 : 0, updatedAt: nowSec,
    }).catch(() => {});
    if (complete) {
      const content = buildHeirloomSetMessage({ displayName, mention: `<@${args.discordId}>`, build, gradTotal: args.gradTotal });
      const res = await postWebhook(cfg.webhook, content, [args.discordId], ['everyone'], identity);
      await recordHeirloomStatus(db, slug, {
        ok: res.ok, error: res.error, atSec: nowSec,
        event: `集齐全套 · ${build.school} · ${build.set}`,
        test: false,
      });
    }
  }
}

/* Shared by the portal test-send and the status read */
export async function sendHeirloomTest(db: D1Database, slug: string) {
  const cfg = await getHeirloomConfig(db, slug);
  if (!cfg) return { ok: false, error: '百业不存在', missing: true };
  if (!cfg.webhook) return { ok: false, error: '尚未配置 Webhook URL', missing: true };
  const nowSec = Math.floor(Date.now() / 1000);
  const identity = await webhookIdentity(db, slug).catch(() => null);
  const res = await postWebhook(cfg.webhook, buildHeirloomTestMessage(cfg.guildName), [], undefined, identity);
  await recordHeirloomStatus(db, slug, {
    ok: res.ok, error: res.error, atSec: nowSec, event: '', test: true,
  });
  return res;
}

export async function heirloomStatusFor(db: D1Database, slug: string) {
  return {
    lastAt: await getReminderSetting(db, slug, 'heirloom_last_at'),
    lastStatus: await getReminderSetting(db, slug, 'heirloom_last_status'),
    lastError: await getReminderSetting(db, slug, 'heirloom_last_error'),
    lastEvent: await getReminderSetting(db, slug, 'heirloom_last_event'),
  };
}
