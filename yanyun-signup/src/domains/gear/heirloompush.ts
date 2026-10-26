// 传家宝 Discord 推送 (2026-10-24 用户裁决新增, 与开车提醒相互独立)
// 形态: 管理员 portal 按百业单独配一个频道 Webhook (settings.heirloom_webhook,
// 与开车提醒的 tenants.discord_webhook 是两条独立配置, 互不替换), 开关与
// 状态同样存 settings(tenant=slug)。触发在 gearPlan 计算路径服务端评估
// (会话用户 + 目标流派 + 全库判定都现成), 全程 waitUntil 异步、失败只落
// 状态, 绝不影响配装计算本身。
// 触发 (用户裁决两者都要):
//  (a) 成员录得传家宝: 某件装备对当前目标流派判定为传家宝 (gearEvals 口径)
//      且 (用户, 流派签名, 装备内容哈希) 从未推过 — 内容哈希不认行 id,
//      删掉重录同一件不重复播报; 同一次评估新出多件合并成一条消息。
//  (b) 集齐: 搭配 8 个部位全为传家宝 — 只在 未齐 -> 集齐 跃迁时推,
//      破齐后自动重新待命 (状态存 heirloom_set_state)。
// 去重落库与提醒的"结算"纪律一致: 发送无论成败都记已推 (防死 webhook 在
// 每次计算时重试风暴), 成败与原因记 heirloom_last_* 供 portal 查看。
// 发送身份与开车提醒相同 (燕云百业 + 品牌头像, postWebhook 复用)。
// 文案为 Discord 固定文案 (与提醒文案同性质, 不走 i18n 目录), 用户定调:
// 给足情绪价值; 2026-10-24 续裁「离谱一点, 要 at 所有人和那个人」—
// 真触发播报带 @everyone + @ 本人 (allowed_mentions parse=['everyone']
// 且 users 只放行动者本人); 测试消息不 @ (只验通路, 不吵全服)。

import { GP_SLOTS, GP_AFFIX_BY_KEY, gpBuild } from './gearplanner.ts';
import {
  getReminderSetting, setReminderSetting, postWebhook, ensureGuildMembersTable,
} from '../groupings/index.ts';
import { getGuildNick } from '../../auth.js';
import { webhookIdentity } from '../guilds/index.ts';
import { getTenantRow, listTenantNames } from '../guilds/index.ts';
import { getUsernameRow } from '../identity/index.ts';
import { getGuildMember, hasGuildMember } from '../identity/index.ts';
import {
  ensureHeirloomTables as ensureHeirloomTablesRepo, listPushedItemHashes,
  insertHeirloomItemPush, getHeirloomSetState, upsertHeirloomSetState,
} from './heirloom.ts';

/* ---------- 配置 (settings, tenant=slug) ---------- */
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

/* ---------- 去重 / 集齐状态表 (懒 DDL 已归 gear 域 heirloom 仓库) ---------- */
export function ensureHeirloomTables(db: D1Database) {
  return ensureHeirloomTablesRepo(db);
}

/* 装备内容哈希: 部位 + 词条 (键+值) + 定音 — 不含行 id 与装备名,
 * 删掉重录/换设备导入同一件 => 同一哈希 => 不重复播报。 */
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

/* ---------- 播报对象显示名 ----------
 * 本百业名册 (guild_members) 昵称 -> 全局名 -> 该服昵称快照 ->
 * users 全局名 -> 会话名 -> 兜底。与提醒的车头显示名同一梯队。 */
async function memberDisplayName(db: D1Database, slug: string, dgid: any, discordId: string, userName: any) {
  await ensureGuildMembersTable(db);
  const rm = await getGuildMember(db, slug, discordId).catch(() => null);
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

/* ---------- 文案 (Discord 固定文案, 用户定调: 给足情绪价值) ---------- */
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

/* ---------- 评估入口 (gearPlan 路径, waitUntil 异步调用) ----------
 * 对每个「已启用传家宝推送」的百业: 行动者是其成员 (会话服务器列表含
 * 绑定服务器, 或已在该百业名册中) 才评估。单百业失败静默, 不影响其他。 */
export async function evaluateHeirloomPushes(db: D1Database, args: any) {
  if (!db || !args || !args.discordId) return;
  const results = await listTenantNames(db).catch(() => []);
  for (const t of results || []) {
    try {
      await evaluateForTenant(db, t, args);
    } catch { /* 单个百业的推送评估失败绝不外溢 */ }
  }
}

async function evaluateForTenant(db: D1Database, t: any, args: any) {
  const slug = t.slug;
  const cfg = await getHeirloomConfig(db, slug);
  if (!cfg || !cfg.enabled || !cfg.webhook) return;
  const dgid = await getReminderSetting(db, slug, 'discord_guild_id');
  let member = !!(dgid && (args.userGuilds || []).includes(String(dgid)));
  if (!member) {
    await ensureGuildMembersTable(db);
    member = await hasGuildMember(db, slug, args.discordId).catch(() => false);
  }
  if (!member) return;

  await ensureHeirloomTables(db);
  const build = gpBuild(args.targetIdx || 0);
  const buildSig = `${build.school}|${build.set}`;
  const evalById = new Map((args.evals || []).map((e: any) => [e.id, e.verdict]));
  const nowSec = Math.floor(Date.now() / 1000);
  const displayName = await memberDisplayName(db, slug, dgid, args.discordId, args.userName);
  // 发送身份 per-百业 (有自定义头像才切换; 见 guildavatar.webhookIdentity)
  const identity = await webhookIdentity(db, slug).catch(() => null);

  /* (a) 新传家宝: 本次评估里判定为传家宝且从未推过的, 合并一条播报 */
  const heirloomItems = (args.lib || []).filter((g: any) => g && g.id != null && evalById.get(g.id) === 'heirloom');
  if (heirloomItems.length) {
    const hashed = [];
    for (const g of heirloomItems) hashed.push({ g, hash: await heirloomItemHash(g) });
    const pushed = await listPushedItemHashes(db, slug, args.discordId, buildSig).catch(() => []);
    const seen = new Set(pushed);
    const fresh = hashed.filter((h) => !seen.has(h.hash));
    if (fresh.length) {
      const content = buildHeirloomItemMessage({ displayName, mention: `<@${args.discordId}>`, items: fresh.map((h) => h.g), build });
      const res = await postWebhook(cfg.webhook, content, [args.discordId], ['everyone'], identity);
      for (const h of fresh) {
        await insertHeirloomItemPush(db, {
          tenant: slug, discordId: args.discordId, buildSig, itemHash: h.hash, createdAt: nowSec,
        }).catch(() => {});
      }
      await recordHeirloomStatus(db, slug, {
        ok: res.ok, error: res.error, atSec: nowSec,
        event: fresh.length === 1 ? `传家宝 · ${fresh[0].g.name || fresh[0].g.slot}` : `传家宝 ×${fresh.length}`,
        test: false,
      });
    }
  }

  /* (b) 集齐跃迁: 状态与当前搭配比对, 只在 未齐 -> 集齐 时播报 */
  const complete = GP_SLOTS.every((pos: any) => {
    const id = args.loadout ? args.loadout[pos] : null;
    return id != null && evalById.get(id) === 'heirloom';
  });
  const stRow = await getHeirloomSetState(db, slug, args.discordId, buildSig).catch(() => null);
  const wasComplete = !!(stRow && Number(stRow.complete) === 1);
  if (complete !== wasComplete) {
    await upsertHeirloomSetState(db, {
      tenant: slug, discordId: args.discordId, buildSig, complete: complete ? 1 : 0, updatedAt: nowSec,
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

/* portal 测试发送与状态读取共用 */
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
