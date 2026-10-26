/* groupings 域 REST 路由 (三期域拆分): 车队读/报名/管理与百业管理面
 * 的车队、名单、成绩部分。产品写路径以 GraphQL 为准, 这里是保留的
 * REST 兼容面 (关停另行裁决, 不在本期)。 */
import { Hono } from 'hono';
import { json, err, s, getBody, rateLimit, bearerToken, restCheckedUser, isDevRequestC, getDevOnlySlugs, TYPES, ROLES, RESERVED } from '../platform/http.ts';
import { needGuildAdmin } from '../guilds/index.ts';
import { parseTimeMs, fmtMs, utcToText, notifyDiscord, publishGuildEvent, nudgeReminderHub } from './rest-shared.ts';
import {
  getEventRow, getEventRowByTenant, getEventIdByTenant, getEventIdStatusByTenant,
  listEventsWeekView, listEventsAdmin, countActivityEventsInWindow,
  insertEvent, updateEventFields, setEventStatus, deleteEventCascade,
  listSignupsByEvent, listSignupDetailRows, countSignupsByEvent, getSignupCapacityStats,
  getSignupTenant, insertSignups, deleteSignupById, deleteSignupByIdAndEvent,
  deleteSignupByEventNickUid, deleteSignupsByEvent, updateSignupWeaponRoleById,
  listResultsByEvent, insertResult, getResultIdOwnedByTenant, deleteResultById,
  getReminderConfig, ensureSignupDiscordColumn, ensureGuildMembersTable, upsertGuildMember,
} from './index.ts';
import { ensureEventCreatorColumn } from '../../graphql.js';
import { sessionCookieHeader } from '../../auth.js';

const evOwned = (c: any, id: any) => getEventRowByTenant(c.env.DB, id, c.get('slug'));
import { getTenantRow, getSettingValue, setSettingValue } from '../guilds/index.ts';
import { listUsersDirectory, listNicksByGuild, listAllNicks } from '../identity/index.ts';
import { getDungeonByName, listDungeonsPublic } from '../dex/index.ts';

export const groupingRoutes = new Hono();

// 百业租户查找: /api/:slug/* 先确认百业存在, 不存在 -> 404
groupingRoutes.use('/:slug/*', async (c: any, next: any) => {
  const slug = s(c.req.param('slug'), 30);
  const tenant = await getTenantRow(c.env.DB, slug);
  if (!tenant) return err('百业不存在', 404);
  c.set('slug', slug);
  c.set('tenant', tenant);
  await next();
});
groupingRoutes.get('/:slug/events', async (c: any) => {
  const slug = c.get('slug');
  const url = new URL(c.req.url);
  const type = s(url.searchParams.get('type'), 20);
  const from = parseInt(url.searchParams.get('from') || '', 10) || 0;
  const to = parseInt(url.searchParams.get('to') || '', 10) || 0;
  const results = await listEventsWeekView(c.env.DB, {
    tenant: slug,
    type: type && TYPES[type] ? type : undefined,
    from: from || undefined,
    to: to || undefined,
  });
  return json({ ok: true, events: results });
});

// GET /api/:slug/events/:id
groupingRoutes.get('/:slug/events/:id', async (c: any) => {
  const slug = c.get('slug');
  const id = parseInt(c.req.param('id'), 10);
  if (!id) return err('活动不存在', 404);
  const event = await getEventRowByTenant(c.env.DB, id, slug);
  if (!event) return err('活动不存在', 404);
  const signups = await listSignupDetailRows(c.env.DB, id);
  const results = await listResultsByEvent(c.env.DB, id);
  return json({ ok: true, event, signups, results: results.map((r) => ({ ...r, time_str: fmtMs(r.time_ms) })) });
});

// WS 实时座位: /api/:slug/events/:id/live (每个活动一个 SeatHub 实例)
// 注: 原代码未限制 method, 保持 .all()
groupingRoutes.all('/:slug/events/:id/live', async (c: any) => {
  const slug = c.get('slug');
  const id = parseInt(c.req.param('id'), 10);
  if (!id) return err('活动不存在', 404);
  const ev = await getEventIdByTenant(c.env.DB, id, slug);
  if (!ev) return err('活动不存在', 404);
  if (c.req.header('Upgrade') !== 'websocket') return err('需要 WebSocket 连接', 426);
  if (!c.env.SEAT_HUB) return err('实时服务未启用', 503);
  const stub = c.env.SEAT_HUB.get(c.env.SEAT_HUB.idFromName(`seat:${slug}:${id}`));
  return stub.fetch(c.req.raw);
});

// POST /api/:slug/events/:id/signup
groupingRoutes.post('/:slug/events/:id/signup', async (c: any) => {
  const slug = c.get('slug');
  const ip = c.get('ip');
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  if (!id) return err('活动不存在', 404);
  if (!rateLimit(ip, 'signup', 10, 10 * 60 * 1000)) return err('报名太频繁, 请稍后再试', 429);
  if (s(body.hp, 10)) return err('报名失败', 400);
  const event = await getEventRowByTenant(c.env.DB, id, slug);
  if (!event) return err('活动不存在', 404);
  if (event.status !== 'open') return err('该活动已截止报名', 400);
  const nickname = s(body.nickname, 30);
  let uid = s(body.uid, 30);
  if (!nickname) return err('请填写游戏昵称', 400);
  if (!uid) uid = 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  let role = ROLES.includes(body.role) ? body.role : null;
  if (!role) role = s(body.weapon, 40) === '牵丝·霖' ? '奶' : '输出'; // 快捷报名: 流派决定职责
  // 原子写入: 名额判断与插入在一条语句内完成, 杜绝并发超卖
  // (SQLite 单条语句原子执行; 顺带复核活动仍为 open 状态)
  try {
    const r = await c.env.DB.prepare(
      `INSERT INTO signups (event_id, nickname, uid, role, weapon, contact, note, team_name, members)
       SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
       WHERE (SELECT COUNT(*) FROM signups WHERE event_id = ?)
           < (SELECT max_slots FROM events WHERE id = ? AND status = 'open')`
    ).bind(id, nickname, uid, role, s(body.weapon, 40), s(body.contact, 60),
      s(body.note, 200), s(body.team_name, 40), s(body.members, 300),
      id, id).run();
    if (!r.meta.changes) return err('名额已满或报名已截止, 手慢了', 400);
    // 最后一单校验: 满员时队里至少要有一个治疗, 否则回滚本次报名
    const full = await getSignupCapacityStats(c.env.DB, id);
    if (full && full.c >= (full.m as any) && full.h === 0) {
      await deleteSignupById(c.env.DB, r.meta.last_row_id);
      return err('最后一个名额需要奶, 请切换奶或先找个奶再来', 400);
    }
  } catch (e) {
    if (String((e as any).message).includes('UNIQUE')) return err('该 UID 已报过名, 无需重复报名', 400);
    throw e;
  }
  const seatsTaken = await countSignupsByEvent(c.env.DB, id);
  // 广播 seat 变化 (后台执行, 不阻塞报名响应)
  if (c.env.SEAT_HUB) {
    const payload = { event_id: id, seats_taken: seatsTaken, max_slots: event.max_slots };
    c.executionCtx.waitUntil((async () => {
      try {
        const stub = c.env.SEAT_HUB.get(c.env.SEAT_HUB.idFromName(`seat:${slug}:${id}`));
        await stub.fetch('https://seat-hub/publish', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch { /* 广播失败不影响报名结果, 客户端降级为轮询 */ }
    })());
  }
  return json({ ok: true, message: '报名成功!', seats_taken: seatsTaken, max_slots: event.max_slots });
});

// POST /api/:slug/events/:id/cancel
groupingRoutes.post('/:slug/events/:id/cancel', async (c: any) => {
  const slug = c.get('slug');
  const ip = c.get('ip');
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  if (!rateLimit(ip, 'cancel', 10, 10 * 60 * 1000)) return err('操作太频繁', 429);
  const ev = await getEventIdByTenant(c.env.DB, id, slug);
  if (!ev) return err('活动不存在', 404);
  // 座位格模式: 按报名 id 取消(点位二次确认)
  const signupId = parseInt(body.signup_id, 10);
  if (signupId) {
    const r = await deleteSignupByIdAndEvent(c.env.DB, signupId, id);
    if (!r.changes) return err('未找到该报名记录', 404);
    return json({ ok: true, message: '已取消报名' });
  }
  const nickname = s(body.nickname, 30), uid = s(body.uid, 30);
  if (!id || !nickname || !uid) return err('请提供昵称和 UID', 400);
  const r = await deleteSignupByEventNickUid(c.env.DB, id, nickname, uid);
  if (!r.changes) return err('未找到该报名记录', 404);
  return json({ ok: true, message: '已取消报名' });
});

// POST /api/:slug/events/:id/update-weapon 改流派 (座位格模式, 按报名 id)
groupingRoutes.post('/:slug/events/:id/update-weapon', async (c: any) => {
  const slug = c.get('slug');
  const ip = c.get('ip');
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  if (!rateLimit(ip, 'updwpn', 10, 10 * 60 * 1000)) return err('操作太频繁', 429);
  const ev = await getEventIdStatusByTenant(c.env.DB, id, slug);
  if (!ev) return err('活动不存在', 404);
  if (ev.status !== 'open') return err('该活动已截止报名', 400);
  const signupId = parseInt(body.signup_id, 10);
  const weapon = s(body.weapon, 40);
  if (!signupId || !weapon) return err('参数不完整', 400);
  // 流派决定职责: 牵丝·霖=奶, 其他=输出
  const role = weapon === '牵丝·霖' ? '奶' : '输出';
  const r = await updateSignupWeaponRoleById(c.env.DB, signupId, id, weapon, role);
  if (!r.changes) return err('未找到该报名记录', 404);
  return json({ ok: true, message: '流派已更新' });
});

// POST /api/:slug/cars/draft 创建空车队草稿，返回 id，前端直接打开编辑
groupingRoutes.post('/:slug/cars/draft', async (c: any) => {
  const slug = c.get('slug');
  const ip = c.get('ip');
  const body = await getBody(c);
  if (!rateLimit(ip, 'cars', 5, 24 * 3600 * 1000)) return err('发车太频繁, 每人每天最多发 5 车', 429);
  if (s(body.hp, 10)) return err('发车失败', 400);
  const type = TYPES[body.type] ? body.type : 'activity';
  const max_slots = type === 'talent' ? 5 : 10;
  const now = Math.floor(Date.now() / 1000);
  // 带有效会话的调用顺带落车头身份, 使该车日后可被车头本人解散/删除;
  // overlay 等无会话调用留空 (未记录车头), 不臆造身份。
  await ensureEventCreatorColumn(c.env.DB);
  const checked = await restCheckedUser(c);
  const creatorId = checked.user ? String(checked.user.discordId) : null;
  const r = await insertEvent(c.env.DB, {
    tenant: slug, title: '未命名车队', type, description: '', starts_at: '', starts_at_utc: now,
    max_slots, status: 'draft', origin: 'member', created_by: '热心车友', creator_discord_id: creatorId,
  });
  nudgeReminderHub(c, slug);
  return json({ ok: true, id: r.last_row_id });
});

// POST /api/:slug/cars 成员发车 (无需登录, 限流 + 蜜罐)
groupingRoutes.post('/:slug/cars', async (c: any) => {
  const slug = c.get('slug');
  const ip = c.get('ip');
  const body = await getBody(c);
  if (!rateLimit(ip, 'cars', 5, 24 * 3600 * 1000)) return err('发车太频繁, 每人每天最多发 5 车', 429);
  if (s(body.hp, 10)) return err('发车失败', 400);
  const title = s(body.title, 40);
  if (!title) return err('请填写车队标题', 400);
  const type = TYPES[body.type] ? body.type : 'activity';
  const utc = parseInt(body.starts_at_utc, 10) || 0;
  const now = Math.floor(Date.now() / 1000);
  if (!utc || utc < now - 3600) return err('请选择有效的发车时间', 400);
  if (utc > now + 60 * 86400) return err('发车时间不能超过 60 天后', 400);
  const max_slots = Math.min(Math.max(parseInt(body.max_slots, 10) || 10, 2), 40);
  const nickname = s(body.nickname, 30) || '热心车友';
  const dungeon = s(body.dungeon, 30);
  // 同草稿路径: 带有效会话则落车头身份 (与手填的 created_by 昵称无关,
  // 身份只认会话 discord_id); 无会话留空。
  await ensureEventCreatorColumn(c.env.DB);
  const checked = await restCheckedUser(c);
  const creatorId = checked.user ? String(checked.user.discordId) : null;
  const r = await insertEvent(c.env.DB, {
    tenant: slug, title, type, description: s(body.description, 500), starts_at: utcToText(utc),
    starts_at_utc: utc, meet_info: s(body.meet_info, 120), max_slots, status: 'open', origin: 'member',
    created_by: nickname, dungeon, creator_discord_id: creatorId,
  });
  const eventId = r.last_row_id;
  // 初始座位：车主发布时直接排座
  if (Array.isArray(body.seats)) {
    const seatRows = [];
    for (const st of body.seats.slice(0, max_slots)) {
      const nm = s(st.name, 30);
      const wp = s(st.weapon, 20);
      if (!nm || !wp) continue;
      const role = wp === '牵丝·霖' ? '奶' : '输出';
      const uid = 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      seatRows.push({ event_id: eventId, nickname: nm, uid, role, weapon: wp });
    }
    if (seatRows.length) await insertSignups(c.env.DB, seatRows);
  }
  c.executionCtx.waitUntil(notifyDiscord(c.env, slug, { title, type, description: s(body.description, 500), starts_at_utc: utc, max_slots }));
  nudgeReminderHub(c, slug);
  return json({ ok: true, id: eventId });
});

// POST /api/:slug/events/:id/manage 成员管理车 (无需管理码; 四个动作全部
// 只认车头 — 2026-10-24 删车收口, 2026-10-25 编辑/关闭/重开一并收口)
groupingRoutes.post('/:slug/events/:id/manage', async (c: any) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  if (!id) return err('车队不存在', 404);
  await ensureEventCreatorColumn(c.env.DB);
  const ev = await getEventRowByTenant(c.env.DB, id, slug);
  if (!ev) return err('车队不存在', 404);
  if (ev.origin !== 'member') return err('官方活动请联系管理员', 403);
  const action = s(body.action, 20);
  const VERB: Record<string, string> = { update: '编辑', close: '关闭', reopen: '重开', delete: '删除', complete: '完成', uncomplete: '恢复' };
  if (!VERB[action]) return err('未知操作', 400);
  // 车头闸门 (与 GraphQL disbandGrouping / updateGrouping 同一条规则):
  // 必须带有效 yy_session (与 /graphql 同源的授权完整性校验), 且会话
  // discord_id 必须等于该车的 creator_discord_id (发车落库所得)。无会话 /
  // 非车头 / 未记录车头一律拒绝且车无损; 未记录车头的车只能走管理员通道。
  const checked = await restCheckedUser(c);
  const clearHdr = checked.clearCookie ? { 'set-cookie': sessionCookieHeader('', 0) } : {};
  if (!checked.user) {
    return json({ ok: false, message: '请先登录 Discord 后再操作' }, 401, clearHdr);
  }
  const creatorId = ev.creator_discord_id ? String(ev.creator_discord_id) : '';
  if (!creatorId) {
    return json({ ok: false, message: `该车队未记录车头，无法${VERB[action]}，请联系管理员处理` }, 403, clearHdr);
  }
  if (creatorId !== String(checked.user.discordId)) {
    return json({ ok: false, message: `只有车头可以${VERB[action]}车队` }, 403, clearHdr);
  }
  if (action === 'close' || action === 'reopen') {
    await setEventStatus(c.env.DB, id, action === 'close' ? 'closed' : 'open');
  } else if (action === 'complete' || action === 'uncomplete') {
    // 完成态 (与 GraphQL completeGrouping / reopenGrouping 同语义): 完成
    // 只从 open/closed 进入; 恢复只从 completed 回到 open。完成车从列表
    // 消失且不再发提醒 (提醒口径只认 open/closed), 与 GraphQL 一致。
    if (action === 'complete') {
      if (ev.status === 'completed') return err('该车队已是完成状态', 400);
      if (ev.status !== 'open' && ev.status !== 'closed') return err('该车队当前状态不可完成', 400);
      await setEventStatus(c.env.DB, id, 'completed');
    } else {
      if (ev.status !== 'completed') return err('该车队尚未完成', 400);
      await setEventStatus(c.env.DB, id, 'open');
    }
  } else if (action === 'delete') {
    await deleteEventCascade(c.env.DB, id, slug);
    // 与 GraphQL 解散一致: 广播 deleted, 开着的网页即时切到不存在态
    publishGuildEvent(c, slug, id, 'deleted');
  } else if (action === 'update') {
    const patch: Record<string, any> = {};
    const set = (col: any, val: any) => { patch[col] = val; };
    if (body.title !== undefined) set('title', s(body.title, 40));
    if (body.type !== undefined && TYPES[body.type]) set('type', body.type);
    if (body.description !== undefined) set('description', s(body.description, 500));
    if (body.meet_info !== undefined) set('meet_info', s(body.meet_info, 120));
    if (body.max_slots !== undefined) set('max_slots', Math.min(Math.max(parseInt(body.max_slots, 10) || 10, 2), 40));
    if (body.dungeon !== undefined) set('dungeon', s(body.dungeon, 30));
    if (body.starts_at_utc !== undefined) {
      const u = parseInt(body.starts_at_utc, 10) || 0;
      if (u > 0) { set('starts_at_utc', u); set('starts_at', utcToText(u)); }
    }
    // 草稿发布时状态改为 open
    if (ev.status === 'draft') set('status', 'open');
    if (Object.keys(patch).length) {
      await updateEventFields(c.env.DB, id, slug, patch);
    }
    // 更新座位：先清空再插入
    if (Array.isArray(body.seats)) {
      await deleteSignupsByEvent(c.env.DB, id);
      const seatRows = [];
      for (const st of body.seats.slice(0, ev.max_slots)) {
        const nm = s(st.name, 30);
        const wp = s(st.weapon, 20);
        if (!nm || !wp) continue;
        const role = wp === '牵丝·霖' ? '奶' : '输出';
        const uid = 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        seatRows.push({ event_id: id, nickname: nm, uid, role, weapon: wp });
      }
      if (seatRows.length) await insertSignups(c.env.DB, seatRows);
    }
  }
  nudgeReminderHub(c, slug);
  return json({ ok: true });
});

/* ---------- 百业管理员: /api/:slug/admin/* ---------- */
// POST /api/:slug/admin/login (无需鉴权, 但百业必须存在)
groupingRoutes.get('/:slug/admin/events', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const results = await listEventsAdmin(c.env.DB, slug);
  return json({ ok: true, events: results });
});

// POST /api/:slug/admin/events
groupingRoutes.post('/:slug/admin/events', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  const title = s(body.title, 60);
  if (!title) return err('标题不能为空', 400);
  const type = TYPES[body.type] ? body.type : 'activity';
  const utc = parseInt(body.starts_at_utc, 10) || 0;
  const maxSlots = Math.max(1, Math.min(500, parseInt(body.max_slots, 10) || 20));
  const r = await insertEvent(c.env.DB, {
    tenant: slug, title, type, description: s(body.description, 2000),
    starts_at: utc ? utcToText(utc) : (s(body.starts_at, 30) || null), starts_at_utc: utc || null,
    meet_info: s(body.meet_info, 200), max_slots: maxSlots,
    status: body.status === 'closed' ? 'closed' : 'open', origin: 'admin',
  });
  c.executionCtx.waitUntil(notifyDiscord(c.env, slug, { title, type, description: s(body.description, 2000), starts_at_utc: utc, max_slots: maxSlots }));
  nudgeReminderHub(c, slug);
  return json({ ok: true, id: r.last_row_id });
});

// PUT /api/:slug/admin/events/:id
groupingRoutes.put('/:slug/admin/events/:id', needGuildAdmin, async (c: any) => {
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  if (!(await evOwned(c, id))) return err('活动不存在', 404);
  const patch: Record<string, any> = {};
  const set = (col: any, val: any) => { patch[col] = val; };
  if (body.title !== undefined) set('title', s(body.title, 60));
  if (body.type !== undefined && TYPES[body.type]) set('type', body.type);
  if (body.description !== undefined) set('description', s(body.description, 2000));
  if (body.starts_at !== undefined) set('starts_at', s(body.starts_at, 30) || null);
  if (body.starts_at_utc !== undefined) {
    const u = parseInt(body.starts_at_utc, 10) || 0;
    set('starts_at_utc', u || null);
    set('starts_at', u ? utcToText(u) : null);
  }
  if (body.meet_info !== undefined) set('meet_info', s(body.meet_info, 200));
  if (body.max_slots !== undefined) set('max_slots', Math.max(1, Math.min(500, parseInt(body.max_slots, 10) || 20)));
  if (body.status !== undefined) set('status', body.status === 'closed' ? 'closed' : 'open');
  if (!Object.keys(patch).length) return err('没有要更新的字段', 400);
  await updateEventFields(c.env.DB, id, null, patch);
  nudgeReminderHub(c, c.get('slug'));
  return json({ ok: true });
});

// DELETE /api/:slug/admin/events/:id
groupingRoutes.delete('/:slug/admin/events/:id', needGuildAdmin, async (c: any) => {
  const id = parseInt(c.req.param('id'), 10);
  if (!(await evOwned(c, id))) return err('活动不存在', 404);
  await deleteEventCascade(c.env.DB, id, null);
  nudgeReminderHub(c, c.get('slug'));
  return json({ ok: true });
});

// GET /api/:slug/admin/events/:id/signups
groupingRoutes.get('/:slug/admin/events/:id/signups', needGuildAdmin, async (c: any) => {
  const id = parseInt(c.req.param('id'), 10);
  if (!(await evOwned(c, id))) return err('活动不存在', 404);
  const results = await listSignupsByEvent(c.env.DB, id);
  return json({ ok: true, signups: results });
});

// GET /api/:slug/admin/events/:id/export.csv
groupingRoutes.get('/:slug/admin/events/:id/export.csv', needGuildAdmin, async (c: any) => {
  const id = parseInt(c.req.param('id'), 10);
  const event = await evOwned(c, id);
  if (!event) return err('活动不存在', 404);
  const results = await listSignupsByEvent(c.env.DB, id);
  const q = (v: any) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const rows = [['昵称', 'UID', '职责', '流派/武器', '联系方式', '队伍名', '队员', '备注', '报名时间'].map(q).join(',')];
  for (const r of results) {
    rows.push([r.nickname, r.uid, r.role, r.weapon, r.contact, r.team_name, r.members, r.note, r.created_at].map(q).join(','));
  }
  const csv = '﻿' + rows.join('\r\n');
  const fname = encodeURIComponent((event.title || 'event') + '_报名表.csv');
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename*=UTF-8''${fname}`,
    },
  });
});

// DELETE /api/:slug/admin/signups/:id
groupingRoutes.delete('/:slug/admin/signups/:id', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const sid = parseInt(c.req.param('id'), 10);
  const own = await getSignupTenant(c.env.DB, sid, slug);
  if (!own) return err('记录不存在', 404);
  await deleteSignupById(c.env.DB, sid);
  return json({ ok: true });
});

// POST /api/:slug/admin/events/:id/results
groupingRoutes.post('/:slug/admin/events/:id/results', needGuildAdmin, async (c: any) => {
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  if (!(await evOwned(c, id))) return err('活动不存在', 404);
  const ms = parseTimeMs(body.time);
  if (!s(body.team_name, 40)) return err('队伍名不能为空', 400);
  if (ms === null || ms <= 0) return err('成绩格式不对, 例: 3:42.15', 400);
  const r = await insertResult(c.env.DB, {
    eventId: id, teamName: s(body.team_name, 40), members: s(body.members, 300),
    timeMs: ms, proofUrl: s(body.proof_url, 300), note: s(body.note, 200),
  });
  return json({ ok: true, id: r.last_row_id });
});

// DELETE /api/:slug/admin/results/:id
groupingRoutes.delete('/:slug/admin/results/:id', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const rid = parseInt(c.req.param('id'), 10);
  const own = await getResultIdOwnedByTenant(c.env.DB, rid, slug);
  if (!own) return err('记录不存在', 404);
  await deleteResultById(c.env.DB, rid);
  return json({ ok: true });
});

// GET /api/:slug/admin/discord, PUT /api/:slug/admin/discord
// discord_guild_id 存 settings 表 (tenant=slug): 该百业绑定的 Discord 服务器,
// 决定前台登录后的可见性与写权限 (成员 gate)。管理员在此自配, 不集中配置。