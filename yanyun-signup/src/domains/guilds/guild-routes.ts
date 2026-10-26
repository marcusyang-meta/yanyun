/* guilds 域路由 (三期域拆分): 百业设置读、流派攻略、固定队与百业管理
 * 面 (资料/头像/Discord 绑定/可见性/功能开关)。 */
import { Hono } from 'hono';
import { json, err, s, getBody, rateLimit, bearerToken, checkToken, makeToken, sha256hex, timingSafeEqual, restCheckedUser, isDevRequestC, TYPES, ROLES, RESERVED } from '../platform/http.ts';
import { needGuildAdmin } from './admin-auth.ts';
import {
  getTenantRow, updateTenantProfile, updateTenantFixedTeams, listGlobalSettings, updateTenantWebhook,
  getSettingValue, setSettingValue,
  listFixedTeams, listFixedTeamMembers, insertFixedTeam, getFixedTeamIdForTenant,
  updateFixedTeamFields, deleteFixedTeamWithMembers, insertFixedTeamMember,
  getFixedTeamMemberIdOwned, updateFixedTeamMemberFields, deleteFixedTeamMemberById,
  AVATAR_MAX_BYTES, sniffAvatarType, getGuildAvatar, getGuildAvatarMeta,
  putGuildAvatar, deleteGuildAvatar, avatarPath,
} from './index.ts';
import {
  listSchoolsFull, getSchoolNameBySlug, listSchoolBis, listSchoolBisBySchool,
  listSchoolRotations, getSchoolRotationBySchool, upsertSchoolBis, upsertSchoolRotation,
  getDungeonByName,
} from '../dex/index.ts';
import { listUsersDirectory, listNicksByGuild } from '../identity/index.ts';
import { translate } from '../platform/index.ts';
import { negotiateLocale } from '../../graphql.js';
import { nudgeReminderHub } from '../groupings/index.ts';

export const guildRoutes = new Hono();

// 百业租户查找: /api/:slug/* 先确认百业存在, 不存在 -> 404
guildRoutes.use('/:slug/*', async (c: any, next: any) => {
  const slug = s(c.req.param('slug'), 30);
  const tenant = await getTenantRow(c.env.DB, slug);
  if (!tenant) return err('百业不存在', 404);
  c.set('slug', slug);
  c.set('tenant', tenant);
  await next();
});
// GET /api/:slug/settings
guildRoutes.get('/:slug/settings', async (c: any) => {
  const tenant = c.get('tenant');
  const results = await listGlobalSettings(c.env.DB, ['game_version', 'game_notice']);
  const out: Record<string, any> = { 
    guild_name: tenant.guild_name, 
    announcement: tenant.announcement, 
    slogan: tenant.slogan || '', 
    master_name: tenant.master_name || '',
    logo_url: tenant.logo_url || '',
    bg_image_url: tenant.bg_image_url || '',
    game_version: '', 
    game_notice: '', 
    feature_fixed_teams: !!tenant.feature_fixed_teams 
  };
  for (const r of results) out[r.key] = r.value;
  return json({ ok: true, ...out });
});

// GET /api/:slug/school-guides 流派攻略(毕业词条+输出轴, 公开) - 保留兼容
guildRoutes.get('/:slug/school-guides', async (c: any) => {
  const bis = await listSchoolBis(c.env.DB);
  const rots = await listSchoolRotations(c.env.DB);
  const bisMap: Record<string, any> = {};
  for (const r of bis) {
    if (!bisMap[r.school]) bisMap[r.school] = {};
    bisMap[r.school][r.build] = { attr: r.attr, rate: r.rate, bis: JSON.parse(r.bis_json) };
  }
  const rotMap: Record<string, any> = {};
  for (const r of rots) {
    rotMap[r.school] = JSON.parse(r.rotation_json);
  }
  return json({ ok: true, bis: bisMap, rotations: rotMap });
});

// GET /api/:slug/schools/:schoolSlug/bis 单个流派毕业词条
guildRoutes.get('/:slug/schools/:schoolSlug/bis', async (c: any) => {
  const schoolSlug = c.req.param('schoolSlug');
  const schoolRow = await getSchoolNameBySlug(c.env.DB, schoolSlug);
  if (!schoolRow) return err('流派不存在', 404);
  const school = schoolRow.name;
  const results = await listSchoolBisBySchool(c.env.DB, school);
  if (!results.length) return err('流派不存在', 404);
  const bis: Record<string, any> = {};
  for (const r of results) {
    bis[r.build] = { attr: r.attr, rate: r.rate, bis: JSON.parse(r.bis_json) };
  }
  return json({ ok: true, school, slug: schoolSlug, bis });
});

// GET /api/:slug/schools/:schoolSlug/rotations 单个流派输出轴
guildRoutes.get('/:slug/schools/:schoolSlug/rotations', async (c: any) => {
  const schoolSlug = c.req.param('schoolSlug');
  const schoolRow = await getSchoolNameBySlug(c.env.DB, schoolSlug);
  if (!schoolRow) return err('流派不存在', 404);
  const school = schoolRow.name;
  const row = await getSchoolRotationBySchool(c.env.DB, school);
  if (!row) return err('流派不存在', 404);
  return json({ ok: true, school, slug: schoolSlug, rotations: JSON.parse(row.rotation_json) });
});

// GET /api/:slug/fixed-teams 固定队列表(含队员, 公开)
guildRoutes.get('/:slug/fixed-teams', async (c: any) => {
  const slug = c.get('slug');
  const teams = await listFixedTeams(c.env.DB, slug);
  for (const t of teams) {
    (t as any).members = await listFixedTeamMembers(c.env.DB, t.id);
  }
  return json({ ok: true, teams });
});

// POST /api/:slug/fixed-teams 公开建队(限流)
guildRoutes.post('/:slug/fixed-teams', async (c: any) => {
  const slug = c.get('slug');
  // 检查功能开关
  const tenant = c.get('tenant');
  if (!tenant.feature_fixed_teams) return err('固定队功能未开启', 403);
  // 限流: 5/天/IP
  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  if (!rateLimit(c.env, `mkteam:${slug}:${ip}`, 5, 86400)) {
    return err('建队太频繁，请明天再试', 429);
  }
  const body = await getBody(c);
  // 蜜罐
  if (body.website) return json({ ok: true, id: 0 });
  const name = s(body.name, 30);
  if (!name) return err('队伍名不能为空', 400);
  const r = await insertFixedTeam(c.env.DB, { tenant: slug, name, description: s(body.description, 200) });
  return json({ ok: true, id: r.last_row_id });
});

// GET /api/:slug/events?type=&from=&to= (from/to 为 UTC unix 秒, 本周视图用)
guildRoutes.post('/:slug/admin/login', async (c: any) => {
  const slug = c.get('slug');
  const ip = c.get('ip');
  const body = await getBody(c);
  if (!rateLimit(ip, 'glogin', 10, 10 * 60 * 1000)) return err('尝试太频繁', 429);
  const row = await getTenantRow(c.env.DB, slug);
  if (!row || !timingSafeEqual(await sha256hex(s(body.password, 200)), row.password_hash)) {
    return err('密码错误', 401);
  }
  // 管理员 token 以 ADMIN_PASSWORD 为 HMAC 签名根: 未配置即 fail-closed
  // 拒绝签发 (原 'fallback-secret' 字面量回退已删, 2026-10-25 审计 B2)。
  if (!c.env.ADMIN_PASSWORD) return err('服务端未设置超管密码, 管理员登录不可用', 500);
  return json({ ok: true, token: await makeToken(c.env.ADMIN_PASSWORD, slug) });
});

// 其余 /api/:slug/admin/* 均需百业管理员鉴权
guildRoutes.put('/:slug/admin/school-guides', needGuildAdmin, async (c: any) => {
  const body = await getBody(c);
  const { school, build, bis, rotation, attr, rate } = body;
  if (!school) return json({ ok: false, error: 'missing school' }, 400);
  const buildName = build || '小外流';
  if (bis !== undefined) {
    await upsertSchoolBis(c.env.DB, {
      school, build: buildName, attr: attr || '', rate: rate || '', bisJson: JSON.stringify(bis),
    });
  }
  if (rotation !== undefined) {
    await upsertSchoolRotation(c.env.DB, { school, rotationJson: JSON.stringify(rotation) });
  }
  return json({ ok: true });
});

// GET /api/:slug/admin/profile, PUT /api/:slug/admin/profile
guildRoutes.get('/:slug/admin/profile', needGuildAdmin, async (c: any) => {
  const tenant = c.get('tenant');
  return json({ ok: true, profile: { 
    guild_name: tenant.guild_name, 
    announcement: tenant.announcement,
    slogan: tenant.slogan || '',
    master_name: tenant.master_name || '',
    logo_url: tenant.logo_url || '',
    bg_image_url: tenant.bg_image_url || ''
  } });
});
guildRoutes.put('/:slug/admin/profile', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  const guild_name = s(body.guild_name, 20), announcement = s(body.announcement, 200), slogan = s(body.slogan, 50);
  const master_name = s(body.master_name, 20), logo_url = s(body.logo_url, 300), bg_image_url = s(body.bg_image_url, 300);
  if (guild_name.length < 2) return err('百业名称至少 2 个字', 400);
  await updateTenantProfile(c.env.DB, slug, {
    guildName: guild_name, announcement, slogan,
    masterName: master_name, logoUrl: logo_url, bgImageUrl: bg_image_url,
  });
  return json({ ok: true });
});

// 百业头像 (管理员直传, blob 存 D1 guild_avatars; 存储/嗅探/身份在 guildavatar.js)
// 错误文案走 i18n 目录 errors 段 (×5 语), 按请求头协商 locale。
const avatarErr = (c: any, code: string, status = 400) => {
  const locale = negotiateLocale(c.req.header('x-locale') || c.req.header('accept-language'));
  return json({ ok: false, message: translate('errors', code, locale), errorCode: code }, status);
};
// GET /api/:slug/admin/avatar 当前头像状态 (管理页预览/删除按钮据此渲染)
guildRoutes.get('/:slug/admin/avatar', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const meta = await getGuildAvatarMeta(c.env.DB, slug);
  return json({
    ok: true,
    hasAvatar: !!meta,
    avatarUrl: meta ? avatarPath(slug, meta.hash) : null,
    hash: meta ? meta.hash : null,
    updatedAt: meta ? meta.updatedAt : null,
  });
});
// PUT /api/:slug/admin/avatar 上传/更换 (请求体 = 图片原始字节, 前端已裁方缩到 ≤512)
guildRoutes.put('/:slug/admin/avatar', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const declared = parseInt(c.req.header('content-length') || '0', 10);
  if (declared > AVATAR_MAX_BYTES) return avatarErr(c, 'avatarTooLarge', 413);
  const buf = new Uint8Array(await c.req.arrayBuffer());
  if (!buf.byteLength) return avatarErr(c, 'avatarEmpty');
  if (buf.byteLength > AVATAR_MAX_BYTES) return avatarErr(c, 'avatarTooLarge', 413);
  const type = sniffAvatarType(buf); // 只认魔数, 伪类型 (改后缀的假图) 在此拒绝
  if (!type) return avatarErr(c, 'avatarBadType', 415);
  const { hash } = await putGuildAvatar(c.env.DB, slug, type, buf);
  return json({ ok: true, avatarUrl: avatarPath(slug, hash), hash });
});
// DELETE /api/:slug/admin/avatar 删除 (删后出图 404, avatarUrl 回 null)
guildRoutes.delete('/:slug/admin/avatar', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  await deleteGuildAvatar(c.env.DB, slug);
  return json({ ok: true });
});

// GET /api/:slug/admin/events
guildRoutes.get('/:slug/admin/discord', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const t = await getTenantRow(c.env.DB, slug);
  const dgid = await getSettingValue(c.env.DB, slug, 'discord_guild_id');
  return json({ ok: true, discord_webhook: t?.discord_webhook || '', discord_guild_id: dgid });
});
guildRoutes.put('/:slug/admin/discord', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  if (body.discord_webhook !== undefined) {
    const wh = s(body.discord_webhook, 300);
    if (wh && !/^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(wh)) {
      return err('Webhook URL 格式不对', 400);
    }
    await updateTenantWebhook(c.env.DB, slug, wh);
  }
  if (body.discord_guild_id !== undefined) {
    const dgid = s(body.discord_guild_id, 25);
    if (dgid && !/^\d{5,25}$/.test(dgid)) return err('Discord 服务器 ID 格式不对（应为纯数字）', 400);
    await setSettingValue(c.env.DB, slug, 'discord_guild_id', dgid);
  }
  nudgeReminderHub(c, slug); // webhook 配置变化会影响提醒挂铃
  return json({ ok: true });
});

// GET /api/:slug/admin/visibility, PUT /api/:slug/admin/visibility
// dev_only 存 settings 表 (tenant=slug): 开启后该百业在生产来源视为不存在,
// 仅 dev 表面 (预览站/本地) 可见。供 demo 这类开发租户使用, 无现成 settings
// 任意键写入口, 故在此提供这个最窄的专用端点 (与 discord 端点同鉴权同落库方式)。
guildRoutes.get('/:slug/admin/visibility', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const value = await getSettingValue(c.env.DB, slug, 'dev_only');
  return json({ ok: true, dev_only: value === '1' });
});
guildRoutes.put('/:slug/admin/visibility', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  if (body.dev_only !== undefined) {
    await setSettingValue(c.env.DB, slug, 'dev_only', body.dev_only ? '1' : '0');
  }
  return json({ ok: true });
});

// PUT /api/:slug/admin/features 开关功能 flag
guildRoutes.put('/:slug/admin/features', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  if (body.feature_fixed_teams !== undefined) {
    await updateTenantFixedTeams(c.env.DB, slug, body.feature_fixed_teams ? 1 : 0);
  }
  return json({ ok: true });
});

// POST /api/:slug/admin/fixed-teams 新建固定队
guildRoutes.post('/:slug/admin/fixed-teams', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  const name = s(body.name, 30);
  if (!name) return err('队伍名不能为空', 400);
  const r = await insertFixedTeam(c.env.DB, { tenant: slug, name, description: s(body.description, 200) });
  return json({ ok: true, id: r.last_row_id });
});

// PUT /api/:slug/admin/fixed-teams/:id 更新固定队
guildRoutes.put('/:slug/admin/fixed-teams/:id', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  const own = await getFixedTeamIdForTenant(c.env.DB, id, slug);
  if (!own) return err('队伍不存在', 404);
  const patch: Record<string, any> = {};
  if (body.name !== undefined) patch.name = s(body.name, 30);
  if (body.description !== undefined) patch.description = s(body.description, 200);
  if (!Object.keys(patch).length) return err('没有要更新的字段', 400);
  await updateFixedTeamFields(c.env.DB, id, patch);
  return json({ ok: true });
});

// DELETE /api/:slug/admin/fixed-teams/:id 删除固定队
guildRoutes.delete('/:slug/admin/fixed-teams/:id', needGuildAdmin, async (c: any) => {
  const id = parseInt(c.req.param('id'), 10);
  const own = await getFixedTeamIdForTenant(c.env.DB, id, c.get('slug'));
  if (!own) return err('队伍不存在', 404);
  await deleteFixedTeamWithMembers(c.env.DB, id);
  return json({ ok: true });
});

// POST /api/:slug/admin/fixed-teams/:id/members 添加队员
guildRoutes.post('/:slug/admin/fixed-teams/:id/members', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  const own = await getFixedTeamIdForTenant(c.env.DB, id, slug);
  if (!own) return err('队伍不存在', 404);
  const nickname = s(body.nickname, 30);
  if (!nickname) return err('游戏昵称不能为空', 400);
  const weapon = s(body.weapon, 40);
  const role = weapon === '牵丝·霖' ? '奶' : (ROLES.includes(body.role) ? body.role : '输出');
  const r = await insertFixedTeamMember(c.env.DB, {
    teamId: id, nickname, weapon, role, note: s(body.note, 100), sortOrder: parseInt(body.sort_order, 10) || 0,
  });
  return json({ ok: true, id: r.last_row_id });
});

// PUT /api/:slug/admin/fixed-teams/members/:mid 更新队员
guildRoutes.put('/:slug/admin/fixed-teams/members/:mid', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const body = await getBody(c);
  const mid = parseInt(c.req.param('mid'), 10);
  const own = await getFixedTeamMemberIdOwned(c.env.DB, mid, slug);
  if (!own) return err('队员不存在', 404);
  const patch: Record<string, any> = {};
  if (body.nickname !== undefined) patch.nickname = s(body.nickname, 30);
  if (body.weapon !== undefined) {
    const w = s(body.weapon, 40);
    patch.weapon = w;
    patch.role = w === '牵丝·霖' ? '奶' : '输出';
  }
  if (body.note !== undefined) patch.note = s(body.note, 100);
  if (body.sort_order !== undefined) patch.sort_order = parseInt(body.sort_order, 10) || 0;
  if (!Object.keys(patch).length) return err('没有要更新的字段', 400);
  await updateFixedTeamMemberFields(c.env.DB, mid, patch);
  return json({ ok: true });
});

// DELETE /api/:slug/admin/fixed-teams/members/:mid 删除队员
guildRoutes.delete('/:slug/admin/fixed-teams/members/:mid', needGuildAdmin, async (c: any) => {
  const slug = c.get('slug');
  const mid = parseInt(c.req.param('mid'), 10);
  const own = await getFixedTeamMemberIdOwned(c.env.DB, mid, slug);
  if (!own) return err('队员不存在', 404);
  await deleteFixedTeamMemberById(c.env.DB, mid);
  return json({ ok: true });
});

// GET /api/guilds/:slug/avatar 百业头像公开出图 (品牌图, 与 OG 图同性质,
// 可匿名读)。URL 带 ?v=<hash8>: 与当前 hash 一致时回不可变长缓存,
// 头像更换后 GraphQL avatarUrl 给出新 URL, 旧 URL 自然失效; 无头像/
// 百业不存在一律 404。'guilds' 已入 RESERVED, 不与 /api/:slug/* 冲突。