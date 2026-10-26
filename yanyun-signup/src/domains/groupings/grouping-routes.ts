/* groupings domain REST routes: grouping reads/signups/management,
 * plus the guild-admin surface's grouping, roster, and results
 * parts. GraphQL is the product write path; this is the retained
 * REST compatibility surface (retiring it is a separate decision). */
import { Hono } from 'hono';
import { json, err, s, getBody, rateLimit, bearerToken, restCheckedUser, isDevRequestC, getDevOnlySlugs, TYPES, ROLES, RESERVED } from '../platform/http.ts';
import { needGuildAdmin } from '../guilds/index.ts';
import { parseTimeMs, fmtMs, utcToText, notifyDiscord, publishGuildEvent, nudgeReminderHub } from './rest-shared.ts';
import {
  getEventRow, getEventRowByTenant, getEventIdByTenant, getEventIdStatusByTenant,
  listEventsWeekView, listEventsAdmin, countActivityEventsInWindow,
  insertEvent, updateEventFields, setEventStatus, deleteEventCascade,
  listSignupsByEvent, listSignupDetailRows, countSignupsByEvent,
  getSignupTenant, insertSignups, insertSignupWithCapacityGuard, deleteSignupById, deleteSignupByIdAndEvent,
  deleteSignupByEventNickUid, deleteSignupsByEvent, updateSignupWeaponRoleById,
  listResultsByEvent, insertResult, getResultIdOwnedByTenant, deleteResultById,
  getReminderConfig, ensureSignupDiscordColumn, ensureGuildMembersTable, upsertGuildMember,
} from './index.ts';
import { ensureEventCreatorColumn } from './graphql.ts';
import { sessionCookieHeader } from '../identity/auth.ts';

const evOwned = (c: any, id: any) => getEventRowByTenant(c.env.DB, id, c.get('slug'));
import { getTenantRow, getSettingValue, setSettingValue } from '../guilds/index.ts';
import { listUsersDirectory, listNicksByGuild, listAllNicks } from '../identity/index.ts';
import { getDungeonByName, listDungeonsPublic } from '../dex/index.ts';

export const groupingRoutes = new Hono();

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

// WS live seats: /api/:slug/events/:id/live (one SeatHub instance per event).
// Note: the original code did not restrict the method — keep .all().
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
  if (!role) role = s(body.weapon, 40) === '牵丝·霖' ? '奶' : '输出';
  // Atomic write: capacity check and insert in a single statement, so concurrent signups cannot oversell (SQLite runs one statement atomically); also re-checks the event is still open.
  try {
    const r = await insertSignupWithCapacityGuard(c.env.DB, {
      event_id: id, nickname, uid, role, weapon: s(body.weapon, 40),
      contact: s(body.contact, 60), note: s(body.note, 200),
      team_name: s(body.team_name, 40), members: s(body.members, 300),
    });
    if (r.outcome === 'full') return err('名额已满或报名已截止, 手慢了', 400);
    // Final-seat check: if this signup fills the car, the team must contain at least one healer, else roll back this signup.
    if (r.outcome === 'needsHealer') return err('最后一个名额需要奶, 请切换奶或先找个奶再来', 400);
  } catch (e) {
    if (String((e as any).message).includes('UNIQUE')) return err('该 UID 已报过名, 无需重复报名', 400);
    throw e;
  }
  const seatsTaken = await countSignupsByEvent(c.env.DB, id);
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
      } catch { /* Broadcast failure must not affect the signup result; clients degrade to polling. */ }
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
  const role = weapon === '牵丝·霖' ? '奶' : '输出';
  const r = await updateSignupWeaponRoleById(c.env.DB, signupId, id, weapon, role);
  if (!r.changes) return err('未找到该报名记录', 404);
  return json({ ok: true, message: '流派已更新' });
});

groupingRoutes.post('/:slug/cars/draft', async (c: any) => {
  const slug = c.get('slug');
  const ip = c.get('ip');
  const body = await getBody(c);
  if (!rateLimit(ip, 'cars', 5, 24 * 3600 * 1000)) return err('发车太频繁, 每人每天最多发 5 车', 429);
  if (s(body.hp, 10)) return err('发车失败', 400);
  const type = TYPES[body.type] ? body.type : 'activity';
  const max_slots = type === 'talent' ? 5 : 10;
  const now = Math.floor(Date.now() / 1000);
  // A call with a valid session also records leader identity, so this car can later be disbanded/deleted by its leader; session-less calls (e.g. overlay) leave it empty — never fabricate an identity.
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
  // Same as the draft path: with a valid session, record leader identity from the session discord_id (unrelated to the hand-typed created_by nickname); empty without a session.
  await ensureEventCreatorColumn(c.env.DB);
  const checked = await restCheckedUser(c);
  const creatorId = checked.user ? String(checked.user.discordId) : null;
  const r = await insertEvent(c.env.DB, {
    tenant: slug, title, type, description: s(body.description, 500), starts_at: utcToText(utc),
    starts_at_utc: utc, meet_info: s(body.meet_info, 120), max_slots, status: 'open', origin: 'member',
    created_by: nickname, dungeon, creator_discord_id: creatorId,
  });
  const eventId = r.last_row_id;
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

// POST /api/:slug/events/:id/manage — member car management (no admin code; all four actions are leader-only: delete gated 2026-10-24, edit/close/reopen gated 2026-10-25).
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
  // Leader gate (same rule as GraphQL disbandGrouping /
  // updateGrouping): requires a valid yy_session (same authorization
  // integrity check as /graphql) whose discord_id equals this car's
  // creator_discord_id (recorded at creation). No session / not the
  // leader / no recorded leader — all rejected with the car intact;
  // leaderless cars go through the admin channel only.
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
    // Completed state (same semantics as GraphQL completeGrouping /
    // reopenGrouping): complete only from open/closed; reopen only
    // from completed back to open. Completed groupings vanish from
    // lists and no longer remind (the reminder definition accepts only
    // open/closed) — identical to GraphQL.
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
    // Same as GraphQL disband: broadcast deleted so open pages switch to the nonexistent state at once.
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
    if (ev.status === 'draft') set('status', 'open');
    if (Object.keys(patch).length) {
      await updateEventFields(c.env.DB, id, slug, patch);
    }
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
// discord_guild_id lives in settings (tenant=slug): the guild's
// bound Discord server, which drives post-login visibility and
// write permission (the member gate). Admins configure it here;
// it is not configured centrally.
