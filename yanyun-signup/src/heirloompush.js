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

import { GP_SLOTS, GP_AFFIX_BY_KEY, gpBuild } from './gearplanner.js';
import {
  getReminderSetting, setReminderSetting, postWebhook, ensureGuildMembersTable,
} from './reminder.js';
import { getGuildNick } from './auth.js';
import { webhookIdentity } from './guildavatar.ts';
import { getTenantRow, listTenantNames } from './db/repositories/tenants.ts';

/* ---------- 配置 (settings, tenant=slug) ---------- */
export async function getHeirloomConfig(db, slug) {
  const t = await getTenantRow(db, slug).catch(() => null);
  if (!t) return null;
  return {
    webhook: await getReminderSetting(db, slug, 'heirloom_webhook'),
    guildName: String(t.guild_name || slug),
    enabled: (await getReminderSetting(db, slug, 'heirloom_enabled')) === '1',
  };
}

async function recordHeirloomStatus(db, slug, { ok, error, atSec, event, test }) {
  await setReminderSetting(db, slug, 'heirloom_last_at', String(atSec));
  await setReminderSetting(db, slug, 'heirloom_last_status', test ? (ok ? 'test-ok' : 'test-error') : (ok ? 'ok' : 'error'));
  await setReminderSetting(db, slug, 'heirloom_last_error', ok ? '' : String(error || '未知错误').slice(0, 300));
  if (event) await setReminderSetting(db, slug, 'heirloom_last_event', String(event).slice(0, 60));
}

/* ---------- 去重 / 集齐状态表 (懒 DDL) ---------- */
let heirloomTablesReady = null;
export function ensureHeirloomTables(db) {
  if (!heirloomTablesReady) {
    heirloomTablesReady = (async () => {
      try {
        await db.prepare(`CREATE TABLE IF NOT EXISTS heirloom_item_pushes (
          tenant TEXT NOT NULL,
          discord_id TEXT NOT NULL,
          build_sig TEXT NOT NULL,
          item_hash TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (tenant, discord_id, build_sig, item_hash)
        )`).run();
        await db.prepare(`CREATE TABLE IF NOT EXISTS heirloom_set_state (
          tenant TEXT NOT NULL,
          discord_id TEXT NOT NULL,
          build_sig TEXT NOT NULL,
          complete INTEGER NOT NULL DEFAULT 0,
          updated_at INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (tenant, discord_id, build_sig)
        )`).run();
      } catch { /* 表已存在等情况静默 */ }
    })();
  }
  return heirloomTablesReady;
}

/* 装备内容哈希: 部位 + 词条 (键+值) + 定音 — 不含行 id 与装备名,
 * 删掉重录/换设备导入同一件 => 同一哈希 => 不重复播报。 */
export async function heirloomItemHash(g) {
  const canon = JSON.stringify({
    s: String(g.slot || ''),
    l: (g.lines || []).map((l) => [String(l.key), Math.round((Number(l.val) || 0) * 100) / 100]),
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
async function memberDisplayName(db, slug, dgid, discordId, userName) {
  await ensureGuildMembersTable(db);
  const rm = await db.prepare('SELECT nick, global_name FROM guild_members WHERE tenant = ? AND discord_id = ?')
    .bind(slug, discordId).first().catch(() => null);
  if (rm && String(rm.nick || '').trim()) return String(rm.nick).trim();
  if (rm && String(rm.global_name || '').trim()) return String(rm.global_name).trim();
  if (dgid) {
    const n = await getGuildNick(db, discordId, dgid).catch(() => null);
    if (n && String(n).trim()) return String(n).trim();
  }
  const u = await db.prepare('SELECT username FROM users WHERE discord_id = ?')
    .bind(discordId).first().catch(() => null);
  if (u && String(u.username || '').trim()) return String(u.username).trim();
  if (userName && String(userName).trim()) return String(userName).trim();
  return '百业侠客';
}

/* ---------- 文案 (Discord 固定文案, 用户定调: 给足情绪价值) ---------- */
function fmtNum(v) {
  return String(Math.round((Number(v) || 0) * 10) / 10);
}

export function heirloomAffixSummary(g) {
  const parts = (g.lines || []).map((l) => {
    const a = GP_AFFIX_BY_KEY[l.key];
    return `${a ? a.label : l.key} ${fmtNum(l.val)}`;
  });
  let s = parts.join(' · ');
  if (g.dingyin && g.dingyin.name) s += `\n定音：${g.dingyin.name} ${fmtNum(g.dingyin.val)}`;
  return s;
}

export function buildHeirloomItemMessage({ displayName, mention, items, build }) {
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
  const blocks = shown.map((g) => `${g.slot}「${g.name || '未命名'}」\n${heirloomAffixSummary(g)}`);
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

export function buildHeirloomSetMessage({ displayName, mention, build, gradTotal }) {
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

export function buildHeirloomTestMessage(guildName) {
  return `🎉 测试消息：${guildName} 的传家宝推送已接通。有人录得传家宝、或集齐全套传家宝时，我会在这里播报。`;
}

/* ---------- 评估入口 (gearPlan 路径, waitUntil 异步调用) ----------
 * 对每个「已启用传家宝推送」的百业: 行动者是其成员 (会话服务器列表含
 * 绑定服务器, 或已在该百业名册中) 才评估。单百业失败静默, 不影响其他。 */
export async function evaluateHeirloomPushes(db, args) {
  if (!db || !args || !args.discordId) return;
  const results = await listTenantNames(db).catch(() => []);
  for (const t of results || []) {
    try {
      await evaluateForTenant(db, t, args);
    } catch { /* 单个百业的推送评估失败绝不外溢 */ }
  }
}

async function evaluateForTenant(db, t, args) {
  const slug = t.slug;
  const cfg = await getHeirloomConfig(db, slug);
  if (!cfg || !cfg.enabled || !cfg.webhook) return;
  const dgid = await getReminderSetting(db, slug, 'discord_guild_id');
  let member = !!(dgid && (args.userGuilds || []).includes(String(dgid)));
  if (!member) {
    await ensureGuildMembersTable(db);
    const row = await db.prepare('SELECT discord_id FROM guild_members WHERE tenant = ? AND discord_id = ?')
      .bind(slug, args.discordId).first().catch(() => null);
    member = !!row;
  }
  if (!member) return;

  await ensureHeirloomTables(db);
  const build = gpBuild(args.targetIdx || 0);
  const buildSig = `${build.school}|${build.set}`;
  const evalById = new Map((args.evals || []).map((e) => [e.id, e.verdict]));
  const nowSec = Math.floor(Date.now() / 1000);
  const displayName = await memberDisplayName(db, slug, dgid, args.discordId, args.userName);
  // 发送身份 per-百业 (有自定义头像才切换; 见 guildavatar.webhookIdentity)
  const identity = await webhookIdentity(db, slug).catch(() => null);

  /* (a) 新传家宝: 本次评估里判定为传家宝且从未推过的, 合并一条播报 */
  const heirloomItems = (args.lib || []).filter((g) => g && g.id != null && evalById.get(g.id) === 'heirloom');
  if (heirloomItems.length) {
    const hashed = [];
    for (const g of heirloomItems) hashed.push({ g, hash: await heirloomItemHash(g) });
    const { results: pushed } = await db.prepare(
      'SELECT item_hash FROM heirloom_item_pushes WHERE tenant = ? AND discord_id = ? AND build_sig = ?'
    ).bind(slug, args.discordId, buildSig).all().catch(() => ({ results: [] }));
    const seen = new Set((pushed || []).map((r) => String(r.item_hash)));
    const fresh = hashed.filter((h) => !seen.has(h.hash));
    if (fresh.length) {
      const content = buildHeirloomItemMessage({ displayName, mention: `<@${args.discordId}>`, items: fresh.map((h) => h.g), build });
      const res = await postWebhook(cfg.webhook, content, [args.discordId], ['everyone'], identity);
      for (const h of fresh) {
        await db.prepare('INSERT OR IGNORE INTO heirloom_item_pushes (tenant, discord_id, build_sig, item_hash, created_at) VALUES (?, ?, ?, ?, ?)')
          .bind(slug, args.discordId, buildSig, h.hash, nowSec).run().catch(() => {});
      }
      await recordHeirloomStatus(db, slug, {
        ok: res.ok, error: res.error, atSec: nowSec,
        event: fresh.length === 1 ? `传家宝 · ${fresh[0].g.name || fresh[0].g.slot}` : `传家宝 ×${fresh.length}`,
        test: false,
      });
    }
  }

  /* (b) 集齐跃迁: 状态与当前搭配比对, 只在 未齐 -> 集齐 时播报 */
  const complete = GP_SLOTS.every((pos) => {
    const id = args.loadout ? args.loadout[pos] : null;
    return id != null && evalById.get(id) === 'heirloom';
  });
  const stRow = await db.prepare('SELECT complete FROM heirloom_set_state WHERE tenant = ? AND discord_id = ? AND build_sig = ?')
    .bind(slug, args.discordId, buildSig).first().catch(() => null);
  const wasComplete = !!(stRow && Number(stRow.complete) === 1);
  if (complete !== wasComplete) {
    await db.prepare(`INSERT INTO heirloom_set_state (tenant, discord_id, build_sig, complete, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(tenant, discord_id, build_sig) DO UPDATE SET complete = excluded.complete, updated_at = excluded.updated_at`)
      .bind(slug, args.discordId, buildSig, complete ? 1 : 0, nowSec).run().catch(() => {});
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
export async function sendHeirloomTest(db, slug) {
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

export async function heirloomStatusFor(db, slug) {
  return {
    lastAt: await getReminderSetting(db, slug, 'heirloom_last_at'),
    lastStatus: await getReminderSetting(db, slug, 'heirloom_last_status'),
    lastError: await getReminderSetting(db, slug, 'heirloom_last_error'),
    lastEvent: await getReminderSetting(db, slug, 'heirloom_last_event'),
  };
}
