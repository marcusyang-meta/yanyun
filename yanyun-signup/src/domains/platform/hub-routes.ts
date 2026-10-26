/* 平台超管门户路由 /api/hub/* (三期域拆分): 门户登录、租户管理、错误
 * 查看与各域的门户配置面 (提醒/传家宝/原语/dex 数据维护)。处理器只做
 * 门户校验与编排, 数据一律走各域服务面。 */
import { Hono } from 'hono';
import { json, err, s, getBody, rateLimit, bearerToken, checkToken, makeToken, sha256hex, timingSafeEqual, isDevRequestC, getDevOnlySlugs, restCheckedUser, TYPES, ROLES, RESERVED } from './http.ts';
import { logError, recentErrors, translate } from './index.ts';
import {
  getTenantRow, getTenantSlug, listTenantSlugs, listTenantsHubAdmin, deleteTenantCascade,
  getSettingValue, setSettingValue, listGlobalSettings, listNonEmptySettingsByKey, updateTenantWebhook, listSettingsByKey,
} from '../guilds/index.ts';
import {
  getReminderConfig, getReminderSetting, setReminderSetting, maskWebhook, postWebhook, WEBHOOK_RE,
  ensureSignupDiscordColumn, ensureGuildMembersTable, upsertGuildMember, nudgeReminderHub,
  listUnstampedSeatsByTenant, stampSignupDiscordId,
} from '../groupings/index.ts';
import { getHeirloomConfig, sendHeirloomTest, heirloomStatusFor } from '../gear/index.ts';
import {
  listAllBosses, insertBoss, updateBossFields, deleteBossById, countBosses, countDungeons,
  listDungeonsPublic, getDungeonById, insertDungeonDex, updateDungeonFields, deleteDungeonById,
  getBossById, listBossesWithGuide, getDungeonByName, renameBossesDungeon,
  getBossIdByNameAndDungeon, getOrphanBossIdByName, listBossesFullByDungeon, listOrphanBossesByName,
} from '../dex/index.ts';
import { listUsersDirectory, listAllNicks, listNicksByGuild } from '../identity/index.ts';
import { parseGuideStructured, ensureBossStructuredColumns, ensureDungeonDexColumns, ensureEventCreatorColumn } from '../../graphql.js';
import { ensureNickStore } from '../../auth.js';
import { maybeRunCreatorBackfill } from '../../creatorbackfill.js';
import { maybeRunCreatorManualFix } from '../../creatormanualfix.js';

export const hubRoutes = new Hono();

// POST /api/hub/login (无需鉴权)
hubRoutes.post('/login', async (c: any) => {
  const ip = c.get('ip');
  const body = await getBody(c);
  if (!c.env.ADMIN_PASSWORD) return err('服务端未设置超管密码', 500);
  if (!rateLimit(ip, 'hublogin', 10, 10 * 60 * 1000)) return err('尝试太频繁', 429);
  if (!timingSafeEqual(s(body.password, 200), c.env.ADMIN_PASSWORD)) return err('密码错误', 401);
  return json({ ok: true, token: await makeToken(c.env.ADMIN_PASSWORD, '__hub__') });
});

// 其余 /api/hub/* 均需超管鉴权
hubRoutes.use(async (c: any, next: any) => {
  if (!c.env.ADMIN_PASSWORD || (await checkToken(c.env.ADMIN_PASSWORD, bearerToken(c))) !== '__hub__') {
    return err('未登录或登录已过期', 401);
  }
  await next();
});

// GET /api/hub/tenants
hubRoutes.get('/tenants', async (c: any) => {
  const results = await listTenantsHubAdmin(c.env.DB);
  return json({ ok: true, tenants: results });
});

// GET /api/hub/errors 最近错误 (error_log 只读, 超管门户「最近错误」区)
// 失败口径在 errorlog.recentErrors 内吞掉, 表不可用时返回空列表。
hubRoutes.get('/errors', async (c: any) => {
  const { errors, last24h } = await recentErrors(c.env.DB, 50);
  return json({ ok: true, errors, last24h });
});

// DELETE /api/hub/tenants/:slug
hubRoutes.delete('/tenants/:slug', async (c: any) => {
  const slug = s(c.req.param('slug'), 30);
  await deleteTenantCascade(c.env.DB, slug);
  return json({ ok: true });
});

/* ---------- Discord 开车提醒配置 (超管 portal) ----------
 * 每百业: Webhook URL (tenants.discord_webhook, 只存服务端; 本组接口只回
 * 掩码状态, 保存后永不回显全文) + 启用开关 + 测试发送 + 状态/下次提醒。
 * URL 只允许管理员替换或清除, 校验同百业管理员端点 (discord.com 官方格式)。 */
async function reminderStateFor(c: any, slug: string) {
  const cfg = await getReminderConfig(c.env.DB, slug);
  if (!cfg) return null;
  let nextAlarm = null;
  try {
    if (c.env.GUILD_HUB) {
      const stub = c.env.GUILD_HUB.get(c.env.GUILD_HUB.idFromName('guild:' + slug));
      const r = await stub.fetch('https://guild-hub/alarm-state', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const j = await r.json().catch(() => null);
      if (j && typeof j.alarm === 'number') nextAlarm = j.alarm;
    }
  } catch { /* DO 状态读不到时留空, 不影响配置面 */ }
  const lastAt = await getReminderSetting(c.env.DB, slug, 'reminder_last_at');
  return {
    slug,
    guild_name: cfg.guildName,
    webhookSet: !!cfg.webhook,
    webhookMasked: cfg.webhook ? maskWebhook(cfg.webhook) : '',
    enabled: cfg.enabled,
    lastAt: lastAt ? parseInt(lastAt, 10) || null : null,
    lastStatus: await getReminderSetting(c.env.DB, slug, 'reminder_last_status'),
    lastError: await getReminderSetting(c.env.DB, slug, 'reminder_last_error'),
    lastEvent: await getReminderSetting(c.env.DB, slug, 'reminder_last_event'),
    nextAlarmAt: nextAlarm,
  };
}

// GET /api/hub/reminders 全部百业的提醒配置与状态
hubRoutes.get('/reminders', async (c: any) => {
  const results = await listTenantSlugs(c.env.DB);
  const out: any[] = [];
  for (const t of results) {
    const st = await reminderStateFor(c, t.slug);
    if (st) out.push(st);
  }
  return json({ ok: true, reminders: out });
});

// PUT /api/hub/tenants/:slug/reminder {webhook?, enabled?}
// webhook 传字符串 = 替换 (空串 = 清除), 不传 = 保持原样
hubRoutes.put('/tenants/:slug/reminder', async (c: any) => {
  const slug = s(c.req.param('slug'), 40);
  const t = await getTenantSlug(c.env.DB, slug);
  if (!t) return err('百业不存在', 404);
  const body = await getBody(c);
  if (body.webhook !== undefined) {
    const wh = s(body.webhook, 300);
    if (wh && !WEBHOOK_RE.test(wh)) return err('Webhook URL 格式不对（应为 https://discord.com/api/webhooks/...）', 400);
    await updateTenantWebhook(c.env.DB, slug, wh);
  }
  if (body.enabled !== undefined) {
    await setReminderSetting(c.env.DB, slug, 'reminder_enabled', body.enabled ? '1' : '0');
  }
  nudgeReminderHub(c, slug); // 配置变化立即重排提醒铃
  return json({ ok: true, reminder: await reminderStateFor(c, slug) });
});

// POST /api/hub/tenants/:slug/reminder/test 发送测试消息验证频道连通
hubRoutes.post('/tenants/:slug/reminder/test', async (c: any) => {
  const slug = s(c.req.param('slug'), 40);
  const ip = c.get('ip');
  if (!rateLimit(ip, 'remindertest', 10, 10 * 60 * 1000)) return err('测试太频繁', 429);
  const cfg = await getReminderConfig(c.env.DB, slug);
  if (!cfg) return err('百业不存在', 404);
  if (!cfg.webhook) return err('尚未配置 Webhook URL', 400);
  const nowSec = Math.floor(Date.now() / 1000);
  const res = await postWebhook(cfg.webhook,
    `🔔 测试消息：${cfg.guildName} 的开车提醒已接通。开车前 10 分钟，我会在这里发起就位确认并 @ 全车人。`, []);
  await setReminderSetting(c.env.DB, slug, 'reminder_last_at', String(nowSec));
  await setReminderSetting(c.env.DB, slug, 'reminder_last_status', res.ok ? 'test-ok' : 'test-error');
  await setReminderSetting(c.env.DB, slug, 'reminder_last_error', res.ok ? '' : String(res.error || '发送失败').slice(0, 300));
  if (!res.ok) return json({ ok: false, message: '测试发送失败: ' + res.error }, 200);
  return json({ ok: true, reminder: await reminderStateFor(c, slug) });
});

/* ---------- 传家宝推送配置 (超管 portal, 与开车提醒相互独立) ----------
 * 每百业单独配一个展示频道 Webhook: URL 存 settings.heirloom_webhook
 * (只存服务端, 接口只回掩码), 与开车提醒的 tenants.discord_webhook
 * 是两条独立配置 — 在这里替换/清除绝不动提醒的那条。触发与去重在
 * src/heirloompush.js (gearPlan 服务端评估)。 */
async function heirloomStateFor(c: any, slug: string) {
  const cfg = await getHeirloomConfig(c.env.DB, slug);
  if (!cfg) return null;
  const st = await heirloomStatusFor(c.env.DB, slug);
  const t = await getTenantRow(c.env.DB, slug).catch(() => null);
  return {
    slug,
    guild_name: t ? String(t.guild_name || slug) : slug,
    webhookSet: !!cfg.webhook,
    webhookMasked: cfg.webhook ? maskWebhook(cfg.webhook) : '',
    enabled: cfg.enabled,
    lastAt: st.lastAt ? parseInt(st.lastAt, 10) || null : null,
    lastStatus: st.lastStatus || '',
    lastError: st.lastError || '',
    lastEvent: st.lastEvent || '',
  };
}

// GET /api/hub/heirlooms 全部百业的传家宝推送配置与状态
hubRoutes.get('/heirlooms', async (c: any) => {
  const results = await listTenantSlugs(c.env.DB);
  const out: any[] = [];
  for (const t of results) {
    const st = await heirloomStateFor(c, t.slug);
    if (st) out.push(st);
  }
  return json({ ok: true, heirlooms: out });
});

// PUT /api/hub/tenants/:slug/heirloom {webhook?, enabled?}
// webhook 传字符串 = 替换 (空串 = 清除), 不传 = 保持原样
hubRoutes.put('/tenants/:slug/heirloom', async (c: any) => {
  const slug = s(c.req.param('slug'), 40);
  const t = await getTenantSlug(c.env.DB, slug);
  if (!t) return err('百业不存在', 404);
  const body = await getBody(c);
  if (body.webhook !== undefined) {
    const wh = s(body.webhook, 300);
    if (wh && !WEBHOOK_RE.test(wh)) return err('Webhook URL 格式不对（应为 https://discord.com/api/webhooks/...）', 400);
    await setReminderSetting(c.env.DB, slug, 'heirloom_webhook', wh);
  }
  if (body.enabled !== undefined) {
    await setReminderSetting(c.env.DB, slug, 'heirloom_enabled', body.enabled ? '1' : '0');
  }
  return json({ ok: true, heirloom: await heirloomStateFor(c, slug) });
});

// POST /api/hub/tenants/:slug/heirloom/test 发送测试消息验证频道连通
hubRoutes.post('/tenants/:slug/heirloom/test', async (c: any) => {
  const slug = s(c.req.param('slug'), 40);
  const ip = c.get('ip');
  if (!rateLimit(ip, 'heirloomtest', 10, 10 * 60 * 1000)) return err('测试太频繁', 429);
  const res = await sendHeirloomTest(c.env.DB, slug);
  if ((res as any).missing) return err(res.error, res.error === '百业不存在' ? 404 : 400);
  if (!res.ok) return json({ ok: false, message: '测试发送失败: ' + res.error }, 200);
  return json({ ok: true, heirloom: await heirloomStateFor(c, slug) });
});

/* POST /api/hub/backfill/reminder-identity 开车提醒身份回填 (2026-10-24
 * 用户裁决: 现在就 backfill)。与车头回填同一纪律: 幂等、{dryRun:true} 只报
 * 不写、只认唯一无歧义匹配、绝不猜。两件事:
 *  1) 名册播种: 每个已绑定百业, 把 guilds_json 含其绑定服务器的用户写入
 *     guild_members (昵称取该服务器昵称快照, 可空)。
 *  2) 座位盖戳: 无戳的 signup 昵称对该百业绑定服务器的成员候选 (全局名 /
 *     该服昵称快照, 同一用户双源命中仍算一个候选) 恰好唯一才盖
 *     signups.discord_id; 两名以上 = 歧义跳过, 零 = 无匹配跳过。
 * 只动 discord_id 与 guild_members, 不改昵称及其他字段。 */
hubRoutes.post('/backfill/reminder-identity', async (c: any) => {
  const db = c.env.DB;
  const body = await getBody(c);
  const dryRun = !!body.dryRun;
  await ensureSignupDiscordColumn(db);
  await ensureGuildMembersTable(db);
  const bindRows = await listNonEmptySettingsByKey(db, 'discord_guild_id');
  const allUsers = await listUsersDirectory(db);
  const userInGuild = (u: any, dgid: any) => {
    try {
      const gs = JSON.parse(u.guilds_json || '[]');
      return Array.isArray(gs) && gs.some((g: any) => String(typeof g === 'object' && g ? g.id : g) === String(dgid));
    } catch { return false; }
  };
  const guilds: any[] = [];
  const totals = { rosterSeeded: 0, seatsTotal: 0, stamped: 0, ambiguous: 0, unmatched: 0 };
  for (const b of bindRows) {
    const slug = String(b.tenant), dgid = String(b.value);
    const members = (allUsers || []).filter((u) => userInGuild(u, dgid));
    const nickRows = await listNicksByGuild(db, dgid);
    const nickOf = new Map((nickRows || []).map((r) => [String(r.discord_id), String(r.nick || '')]));
    // 1) 名册播种
    let rosterSeeded = 0;
    for (const u of members) {
      rosterSeeded++;
      if (!dryRun) {
        await upsertGuildMember(db, slug, u.discord_id, nickOf.get(String(u.discord_id)) || '', u.username || '');
      }
    }
    // 2) 座位盖戳
    const seats = await listUnstampedSeatsByTenant(db, slug);
    let stamped = 0, ambiguous = 0, unmatched = 0;
    for (const seat of seats || []) {
      const nick = String(seat.nickname || '').trim();
      const hits = new Set();
      if (nick) {
        for (const u of members) {
          if (String(u.username || '').trim() === nick || (nickOf.get(String(u.discord_id)) || '').trim() === nick) {
            hits.add(String(u.discord_id));
          }
        }
      }
      if (hits.size === 1) {
        stamped++;
        if (!dryRun) {
          await stampSignupDiscordId(db, seat.id, [...hits][0] as string);
        }
      } else if (hits.size > 1) ambiguous++;
      else unmatched++;
    }
    guilds.push({
      slug, discordGuildId: dgid, rosterSeeded,
      seatsTotal: (seats || []).length, stamped, ambiguous, unmatched,
    });
    totals.rosterSeeded += rosterSeeded;
    totals.seatsTotal += (seats || []).length;
    totals.stamped += stamped; totals.ambiguous += ambiguous; totals.unmatched += unmatched;
  }
  return json({ ok: true, dryRun, guilds, totals });
});

// GET /api/hub/settings, PUT /api/hub/settings (game_version/game_notice/game_version_code)
hubRoutes.get('/settings', async (c: any) => {
  const rows = await listGlobalSettings(c.env.DB, ['game_version', 'game_notice', 'game_version_code']);
  const out: Record<string, string> = { game_version: '', game_notice: '', game_version_code: '' };
  for (const r of rows) out[r.key] = r.value;
  return json({ ok: true, settings: out });
});
hubRoutes.put('/settings', async (c: any) => {
  const body = await getBody(c);
  for (const k of ['game_version', 'game_notice', 'game_version_code']) {
    if (body[k] !== undefined) {
      await setSettingValue(c.env.DB, '', k, s(body[k], 2000));
    }
  }
  return json({ ok: true });
});

// /api/hub/bosses CRUD
hubRoutes.get('/bosses', async (c: any) => {
  return json({ ok: true, bosses: await listAllBosses(c.env.DB) });
});
hubRoutes.post('/bosses', async (c: any) => {
  const body = await getBody(c);
  const name = s(body.name, 30);
  if (!name) return err('首领名不能为空', 400);
  const r = await insertBoss(c.env.DB, {
    name, talent: s(body.talent, 40), source: s(body.source, 40),
    note: s(body.note, 200), sortOrder: parseInt(body.sort_order, 10) || 0,
  });
  return json({ ok: true, id: r.last_row_id });
});
hubRoutes.put('/bosses/:id', async (c: any) => {
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  const patch: Record<string, any> = {};
  const set = (col: any, val: any) => { patch[col] = val; };
  if (body.name !== undefined) set('name', s(body.name, 30));
  if (body.talent !== undefined) set('talent', s(body.talent, 40));
  if (body.source !== undefined) set('source', s(body.source, 40));
  if (body.note !== undefined) set('note', s(body.note, 200));
  if (body.sort_order !== undefined) set('sort_order', parseInt(body.sort_order, 10) || 0);
  if (body.guide !== undefined) set('guide', s(body.guide, 30000));
  // 结构化攻略 (GraphQL bossPage 读取): 传数组则存 JSON
  await ensureBossStructuredColumns(c.env.DB);
  for (const [key, col] of [['mechanics', 'mechanics_json'], ['talents', 'talents_json'], ['shouts', 'shouts_json']]) {
    if (body[key] !== undefined) set(col, Array.isArray(body[key]) ? JSON.stringify(body[key]) : s(body[key], 60000));
  }
  if (!Object.keys(patch).length) return err('没有要更新的字段', 400);
  await updateBossFields(c.env.DB, id, patch);
  return json({ ok: true });
});

// POST /api/hub/bosses/migrate-structured 一次性物化: 把 bosses.guide 文本按旧前端
// (guild-app.js openBoss) 的拆分规则解析为结构化列, 供 GraphQL bossPage 读取。
// 幂等: 可重复执行, 结果只取决于 guide 文本。
hubRoutes.post('/bosses/migrate-structured', async (c: any) => {
  const db = c.env.DB;
  await ensureBossStructuredColumns(db);
  const results = await listBossesWithGuide(db);
  const migrated: any[] = [];
  for (const b of results) {
    const st = parseGuideStructured(b.guide);
    await updateBossFields(db, b.id, {
      mechanics_json: JSON.stringify(st.mechanics),
      talents_json: JSON.stringify(st.talents),
      shouts_json: JSON.stringify(st.shouts),
    });
    migrated.push({ id: b.id, name: b.name, mechanics: st.mechanics.length, talents: st.talents.length, shouts: st.shouts.length });
  }
  return json({ ok: true, migrated });
});
hubRoutes.delete('/bosses/:id', async (c: any) => {
  await deleteBossById(c.env.DB, parseInt(c.req.param('id'), 10));
  return json({ ok: true });
});

// POST /api/hub/dex/apply-season-map 攻略赛季重分类一次性迁移 (2026-10-24 用户定型)。
// 口径: 游戏内分类 (试锋/梦洄/鉴心/铸矩/传薪) 与赛季等级档一一对应 (S1..S5);
// 名字/等级以用户国际服游戏内截图为准 (笑渡苦行舟/缺口袋保留, 万壑化龙吟,
// 云梦金明池/风火鸾猊舞/同悲红尘劫/笑引阎罗帖/碧血照黄沙, 舞马人=用户提供);
// 跨档 boss 按档拆行 (·极 为独立条目); 国服残留删除 (删前校验无攻略内容,
// 有内容则跳过并在 warnings 里报告, 不硬删)。幂等: 可重复执行。
hubRoutes.post('/dex/apply-season-map', async (c: any) => {
  const db = c.env.DB;
  await ensureDungeonDexColumns(db);
  await ensureBossStructuredColumns(db);
  const rep: any = {
    updated: [], createdDungeons: [], createdBosses: [], reassignedBosses: [],
    deletedDungeons: [], deletedBosses: [], warnings: [],
  };
  const countAll = async () => ({
    dungeons: await countDungeons(db),
    bosses: await countBosses(db),
  });
  const before = await countAll();
  const hasContent = (b: any) => {
    const ne = (v: any) => { const t = String(v ?? '').trim(); return t !== '' && t !== '[]' && t !== 'null'; };
    return ne(b.guide) || ne(b.mechanics_json) || ne(b.talents_json) || ne(b.shouts_json);
  };
  const bossSource = (d: any) => (Number(d.size) === 10 ? '侠境·' : '试剑·') + d.name;

  // ---- 望月婵媛 → 万壑化龙吟 改名 (boss 归属按副本名关联, 必须先迁) ----
  const oldD = await getDungeonByName(db, '望月婵媛');
  const newD = await getDungeonByName(db, '万壑化龙吟');
  if (oldD && !newD) {
    await updateDungeonFields(db, oldD.id, { name: '万壑化龙吟' });
    await renameBossesDungeon(db, '望月婵媛', '万壑化龙吟');
    rep.updated.push('望月婵媛 → 万壑化龙吟 (改名, 游戏内正式名)');
  }

  // ---- boss 行确保: 已有 (名, 副本) 直接用; 无主孤儿行可认领 (每行只认领一次); 否则新建 ----
  const claimed = new Set();
  const ensureBoss = async (d: any, bossName: any, sortOrder: any) => {
    const exact = await getBossIdByNameAndDungeon(db, bossName, d.name);
    if (exact) {
      await updateBossFields(db, exact.id, { sort_order: sortOrder });
      return exact.id;
    }
    const orphan = await getOrphanBossIdByName(db, bossName);
    if (orphan && !claimed.has(orphan.id)) {
      claimed.add(orphan.id);
      await updateBossFields(db, orphan.id, { dungeon: d.name, source: bossSource(d), sort_order: sortOrder });
      rep.reassignedBosses.push(`${bossName} → ${d.name} (#${orphan.id})`);
      return orphan.id;
    }
    const r = await insertBoss(db, {
      name: bossName, dungeon: d.name, talent: '', source: bossSource(d), note: '', sortOrder,
    });
    rep.createdBosses.push(`${bossName} @ ${d.name} (#${r.last_row_id})`);
    return r.last_row_id;
  };

  const upsertDungeon = async (spec: any) => {
    let d = await getDungeonByName(db, spec.name);
    if (!d) {
      const r = await insertDungeonDex(db, {
        name: spec.name, size: spec.size, season: spec.season, category: spec.category, level: spec.level,
      });
      rep.createdDungeons.push(`${spec.name} (#${r.last_row_id})`);
      d = await getDungeonById(db, r.last_row_id);
    } else {
      await updateDungeonFields(db, d.id, { size: spec.size, season: spec.season, category: spec.category, level: spec.level });
      rep.updated.push(`${spec.name} → ${spec.category}/${spec.season}/Lv${spec.level}`);
      d = { ...d, ...spec };
    }
    const roster = spec.roster || [];
    for (let i = 0; i < roster.length; i++) await ensureBoss(d, roster[i], (i + 1) * 10);
    return d;
  };

  // 顺序即孤儿认领顺序 (基础档先于 ·极 档)
  const SPECS = [
    { name: '玉魄染青苍', size: 10, season: 'S5', category: '传薪', level: 100 },
    { name: '定极分更', size: 5, season: 'S5', category: '传薪', level: 100 },
    { name: '点雪断恩仇', size: 10, season: 'S4', category: '铸矩', level: 96 },
    { name: '笑渡苦行舟', size: 10, season: 'S4', category: '铸矩', level: 96 },
    { name: '俣俣神浒', size: 5, season: 'S4', category: '铸矩', level: 96 },
    { name: '白驹飞霞', size: 5, season: 'S4', category: '铸矩', level: 96, roster: ['舞马人', '冯如之'] },
    { name: '风饕五残灾', size: 10, season: 'S3', category: '鉴心', level: 91 },
    { name: '万壑化龙吟', size: 10, season: 'S3', category: '鉴心', level: 91, roster: ['天禄', '望月婵媛'] },
    { name: '幽牙蛇影', size: 5, season: 'S3', category: '鉴心', level: 91 },
    { name: '煞地惊雷', size: 5, season: 'S3', category: '鉴心', level: 91 },
    { name: '山河醉影', size: 5, season: 'S2', category: '梦洄', level: 81 },
    { name: '沉棺泊梦', size: 5, season: 'S2', category: '梦洄', level: 86 },
    { name: '赤霄惊梦', size: 5, season: 'S1', category: '试锋', level: 66, roster: ['睡道人', '容鸢'] },
    { name: '云梦金明池', size: 10, season: 'S1', category: '试锋', level: 51, roster: ['睡道人', '容鸢'] },
    { name: '云梦金明池·极', size: 10, season: 'S1', category: '试锋', level: 56, roster: ['睡道人', '容鸢'] },
    { name: '风火鸾猊舞', size: 10, season: 'S1', category: '试锋', level: 66, roster: ['容鸢', '舞狮兄弟'] },
    { name: '同悲红尘劫', size: 10, season: 'S1', category: '试锋', level: 71, roster: ['舞狮兄弟', '鬼公子'] },
    { name: '同悲红尘劫·极', size: 10, season: 'S2', category: '梦洄', level: 81, roster: ['舞狮兄弟', '鬼公子'] },
    { name: '笑引阎罗帖', size: 10, season: 'S2', category: '梦洄', level: 81, roster: ['道主', '黑财神'] },
    { name: '笑引阎罗帖·极', size: 10, season: 'S2', category: '梦洄', level: 86, roster: ['道主', '黑财神'] },
    { name: '碧血照黄沙', size: 10, season: 'S2', category: '梦洄', level: 86, roster: ['田英', '郭昕'] },
    { name: '碧血照黄沙·极', size: 10, season: 'S3', category: '鉴心', level: 91, roster: ['田英', '郭昕'] },
    { name: '赤霄惊梦·极', size: 5, season: 'S1', category: '试锋', level: 71, roster: ['睡道人', '容鸢'] },
    { name: '无相关山', size: 5, season: 'S1', category: '试锋', level: 51, roster: [] },
    { name: '铁血狼烟', size: 5, season: 'S1', category: '试锋', level: 56, roster: [] },
    { name: '伉洲孽海', size: 5, season: 'S1', category: '试锋', level: 61, roster: [] },
  ];
  for (const spec of SPECS) await upsertDungeon(spec);

  // ---- 国服残留删除 (删前逐行校验无攻略内容) ----
  const DELETE_DUNGEONS = ['锋锷断迷狂', '啸风峙玉', '鲲鹏图千山', '霜催落月', '笃山衔蝉', '流火袭星', '沧流走虺'];
  for (const name of DELETE_DUNGEONS) {
    const d = await getDungeonByName(db, name);
    if (!d) continue;
    const bs = await listBossesFullByDungeon(db, name);
    const withContent = bs.filter(hasContent);
    if (withContent.length) {
      rep.warnings.push(`跳过删除 ${name}: boss ${withContent.map((b) => b.name).join('/')} 有攻略内容`);
      continue;
    }
    for (const b of bs) {
      await deleteBossById(db, b.id);
      rep.deletedBosses.push(`${b.name} @ ${name}`);
    }
    await deleteDungeonById(db, d.id);
    rep.deletedDungeons.push(name);
  }
  for (const name of ['茧中老人', '愁铃客']) {
    const bs = await listOrphanBossesByName(db, name);
    for (const b of bs) {
      if (hasContent(b)) { rep.warnings.push(`跳过删除孤儿 boss ${name}: 有攻略内容`); continue; }
      await deleteBossById(db, b.id);
      rep.deletedBosses.push(`${name} (孤儿)`);
    }
  }

  const after = await countAll();
  return json({ ok: true, before, after, ...rep });
});

// POST /api/hub/events/backfill-creators 存量车车头身份回填 (2026-10-24 用户裁决)。
// 背景: creator_discord_id 上线前建的车只有 created_by 展示串 (REST 发车 =
// 用户手填昵称; GraphQL 发车 = 写死占位 '热心侠客'), 没有权威身份, 按
// "解散/删车只认车头" 的规则永远删不掉。回填只认无歧义证据: created_by
// 与某用户的 Discord 全局名 (users.username, 登录时落库) 或其在该百业
// 绑定服务器内的昵称快照 (user_guild_nicks) 对应, 且候选恰好唯一 (已绑定
// 百业再过一层成员校验: users.guilds_json 含该服务器, 或昵称快照本身即
// 成员证据) 才落库。占位串 / 查无此人 / 多名候选一律不动, 保持无车头
// (仅管理员通道可删)。绝不猜、绝不按座位/昵称模糊匹配多人。
// body {dryRun:true} 只报告不落库。幂等: 只处理 creator_discord_id 为空
// 的行, 重复执行的 backfilled 为 0。
hubRoutes.post('/events/backfill-creators', async (c: any) => {
  const db = c.env.DB;
  const body = await getBody(c);
  const dryRun = !!(body && body.dryRun);
  await ensureEventCreatorColumn(db);
  await ensureNickStore(db).catch(() => {});
  const PLACEHOLDERS = new Set(['', '热心侠客', '热心车友']);

  // 用户目录: 全局名 -> discord_id 集合; 成员关系: discord_id -> 服务器集合
  const userRows = await listUsersDirectory(db);
  const byGlobalName = new Map();
  const memberOf = new Map();
  for (const u of userRows) {
    const did = String(u.discord_id);
    const name = String(u.username || '').trim();
    if (name) {
      if (!byGlobalName.has(name)) byGlobalName.set(name, new Set());
      byGlobalName.get(name).add(did);
    }
    let guildIds = new Set();
    try {
      const gs = JSON.parse(u.guilds_json || '[]');
      if (Array.isArray(gs)) guildIds = new Set(gs.map((g) => String(g && g.id)));
    } catch { /* guilds_json 损坏时按无成员证据处理 */ }
    memberOf.set(did, guildIds);
  }
  // 服务器昵称快照: `${guild_id}|${nick}` -> discord_id 集合
  const nickIndex = new Map();
  try {
    const nickRows = await listAllNicks(db);
    for (const n of nickRows) {
      const nick = String(n.nick || '').trim();
      if (!nick) continue;
      const key = String(n.guild_id) + '|' + nick;
      if (!nickIndex.has(key)) nickIndex.set(key, new Set());
      nickIndex.get(key).add(String(n.discord_id));
    }
  } catch { /* 快照表不存在时仅用全局名匹配 */ }
  // 租户 -> 绑定 Discord 服务器 id
  const bindRows = await listSettingsByKey(db, 'discord_guild_id');
  const bindMap = new Map(bindRows.map((r) => [String(r.tenant), String(r.value || '')]));

  const { results: cars } = await db.prepare(
    'SELECT id, tenant, created_by, creator_discord_id FROM events ORDER BY id ASC'
  ).all();
  const rep: any = {
    dryRun,
    totals: {
      events: cars.length, alreadyStamped: 0, considered: 0, backfilled: 0,
      unstamped: { placeholder: 0, noMatch: 0, ambiguous: 0 },
    },
    groups: [],
  };
  const groupMap = new Map();
  const groupOf = (tenant: any, createdBy: any) => {
    const key = tenant + '|' + createdBy;
    if (!groupMap.has(key)) {
      const g = { tenant, createdBy, cars: 0, outcome: 'considered', matchedDiscordId: null, candidates: 0 };
      groupMap.set(key, g);
      rep.groups.push(g);
    }
    return groupMap.get(key);
  };
  const updates: any[] = [];
  for (const car of cars) {
    if (car.creator_discord_id && String(car.creator_discord_id).trim()) {
      rep.totals.alreadyStamped++;
      continue;
    }
    rep.totals.considered++;
    const cb = String(car.created_by ?? '').trim();
    const g = groupOf(String(car.tenant), cb);
    g.cars++;
    if (PLACEHOLDERS.has(cb)) { rep.totals.unstamped.placeholder++; g.outcome = 'placeholder'; continue; }
    const gid = bindMap.get(String(car.tenant)) || '';
    const cand = new Set();
    for (const did of byGlobalName.get(cb) || []) cand.add(did);
    const nickHits = gid ? (nickIndex.get(gid + '|' + cb) || new Set()) : new Set();
    for (const did of nickHits) cand.add(did);
    // 百业语境收窄: 已绑定百业只认该服务器成员 (全局名命中必须有成员
    // 记录; 昵称快照命中本身就是成员证据, 登录时仅为成员抓取)。
    const scoped = gid
      ? [...cand].filter((did) => (memberOf.get(did) || new Set()).has(gid) || nickHits.has(did))
      : [...cand];
    g.candidates = scoped.length;
    if (scoped.length === 1) {
      g.outcome = 'matched';
      g.matchedDiscordId = scoped[0];
      rep.totals.backfilled++;
      updates.push([scoped[0], car.id]);
    } else if (scoped.length === 0) {
      rep.totals.unstamped.noMatch++;
      g.outcome = 'noMatch';
    } else {
      rep.totals.unstamped.ambiguous++;
      g.outcome = 'ambiguous';
    }
  }
  if (!dryRun && updates.length) {
    await db.batch(updates.map(([did, id]) => db.prepare(
      "UPDATE events SET creator_discord_id = ? WHERE id = ? AND (creator_discord_id IS NULL OR creator_discord_id = '')"
    ).bind(did, id)));
  }
  return json({ ok: true, ...rep });
});

// /api/hub/dungeons 副本当期 toggle
hubRoutes.get('/dungeons', async (c: any) => {
  return json({ ok: true, dungeons: await listDungeonsPublic(c.env.DB) });
});
hubRoutes.put('/dungeons/:id', async (c: any) => {
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  const patch: Record<string, any> = {};
  if (body.is_current !== undefined) patch.is_current = body.is_current ? 1 : 0;
  if (body.video_url !== undefined) patch.video_url = String(body.video_url || '').slice(0, 200);
  if (body.video_title !== undefined) patch.video_title = String(body.video_title || '').slice(0, 80);
  if (!Object.keys(patch).length) return err('没有要更新的字段', 400);
  await updateDungeonFields(c.env.DB, id, patch);
  return json({ ok: true });
});
