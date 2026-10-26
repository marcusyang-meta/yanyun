/* identity 域 GraphQL (三期域拆分): Viewer/Discord shells、设置页与 updateMyLocale。 */
import {
  clampBlocksVersion, substituteForVersion, weekWindowUtc, startsAtEpoch,
  fmtStartsAt, groupByLocalDay, TYPE_SHORT_KEY, HEALER_SECT,
} from '../platform/index.ts';
import {
  clampPrimitivesVersion, primEnabled, primNav, primJoin, primEdit,
  primUncomplete, primLeave, primDisband, primComplete,
} from '../platform/index.ts';
import { tlCalculateExcel } from '../gear/index.ts';
import { getUserServers, getGuildNick, maybeRefreshGuildNicks, getUserLocalePref, setUserLocalePref } from '../../auth.js';
import { ensureSignupDiscordColumn, ensureGuildMembersTable, upsertGuildMember } from '../groupings/index.ts';
import { ensurePushTokensTable, isValidPushToken, savePushToken, deletePushToken } from '../platform/index.ts';
import { evaluateHeirloomPushes } from '../gear/index.ts';
import { translate, negotiateLocale, SUPPORTED_LOCALES, CATALOG } from '../platform/index.ts';
import { logError } from '../platform/index.ts';
import { getGuildAvatarMeta, avatarPath } from '../guilds/index.ts';
import { getSettingValue, setSettingValue, listSettingsByKey } from '../guilds/index.ts';
import { getUsernameRow } from './index.ts';
import { listGuildMembers, getGuildMember } from './index.ts';
import {
  getBossById, listBossesByDungeon, ensureBossStructuredColumns as ensureBossStructuredColumnsRepo,
  listSchoolsFull, listSchoolsNameSlug, getSchoolNameBySlug, listSchoolBis,
  getSchoolBisJsonBySchool, listSchoolRotations, listSlotAffixByBuild, listAffixMax, listAffixMaxValues,
} from '../dex/index.ts';
import {
  getDungeonByName, getDungeonNameSizeById, listDungeonsDex, getLatestDungeonVersion,
  ensureDungeonDexColumns as ensureDungeonDexColumnsRepo,
} from '../dex/index.ts';
import {
  getTenantRow, getTenantSlug, listTenantSlugs, listTenantsDirectory, insertTenant,
} from '../guilds/index.ts';
import {
  getEventRow, getEventTenant, getEventTenantCreator, listEventsByTenantType,
  insertEvent, updateEventFields, setEventStatus, deleteEventCascade,
  ensureEventCreatorColumn as ensureEventCreatorColumnRepo,
} from '../groupings/index.ts';
import {
  listSignupSeats, listSignupSeatsBasic, listSignupNamesStamps, getSignupCapacityStats,
  insertSignups, deleteSignupById, deleteSignupByEventUid, deleteSignupsByEvent,
  updateSignupWeaponRoleByUid,
} from '../groupings/index.ts';
import {
  listGearItems, insertGearItem, updateGearItemRow, deleteGearItemRow,
  listGearBuilds, insertGearBuild, deleteGearBuildRow,
} from '../gear/index.ts';
import {
  GP_SLOTS, GP_GEAR_SLOTS, GP_AFFIX, GP_BUILDS, GP_SLOTS_BIG, GP_SLOTS_SMALL,
  GP_BASE_FIELDS, GP_BASE_PRESET, GP_BASE_FIELD_LABELS, GP_XINFA, GP_TALENT_ROWS,
  GP_BUILD_DINGYIN, GP_DINGYIN_LEFT, GP_DINGYIN_RIGHT_MAX, GP_BOW_JUE_VALUES,
  GP_BOW_RECOMMEND, GP_PASTE_NAME_TO_KEY, GP_NAME_TO_CLASS, GP_CLASS_LABEL,
  GP_SLOT_ALIAS, GP_OCR_EXTRA_ALIAS, GP_LEGACY_KEY, GP_SCHOOL_TAG_LIST,
  GP_DEMO_KIT, GP_DIM_ROWS, GP_QUICK_BAR_NAMES, GP_BUILD_SECT, GP_WUXUE_NAMES,
  gpTalentText, gpClassOf, gpSanitizeGearData, gpPlan, gpAutoCombine,
  gpParsePaste, gpQuickCalc,
} from '../gear/index.ts';
import {
  enDungeonName, enBossName, enSectName, enBuildSchool, enAffixName,
  enAffixSys, enMartialArtName, enClassLabel, enGearSetName,
} from '../dex/index.ts';
import {
  ShellBase, defineTextGens, loadMyLocalePref, errText, assertTenant,
  getTenantSetting, setTenantSetting, isDevRequest, getServersForUser,
  serverCanManage, getGuildAccess, publishGroupingEvent, requireWrite,
  sha256hexLocal, rateLimitGql as rateLimit, getClientIp, s, roleOf, newUid,
  TAB_TO_TYPE, TYPE_TO_ENUM, GUILD_TABS, getGameVersion, getCurrentVersionCode,
  PayloadBase, GroupingPayloadShell, SeatPayloadShell, DeletePayloadShell,
  CreateGuildPayloadShell, UpdateLocalePayloadShell, uFail, gFail, sFail, dFail, cFail,
} from '../platform/graphql-base.ts';
import { guildResult } from '../guilds/index.ts';
import { touchGuildRoster } from '../groupings/index.ts';

export async function identityNamesFor(db: any, discordId: any, dgid: any) {
  const names = new Set();
  const u = await getUsernameRow(db, String(discordId)).catch(() => null);
  if (u && String(u.username || '').trim()) names.add(String(u.username).trim());
  if (dgid) {
    const nick = await getGuildNick(db, String(discordId), dgid).catch(() => null);
    if (nick && String(nick).trim()) names.add(String(nick).trim());
  }
  return names;
}

// 本人落座判定: 昵称命中会话用户自己的身份名 -> 返回其 discord_id, 否则 null
export async function selfStampFor(db: any, user: any, slug: any, nickname: any) {
  if (!user || !user.discordId || !nickname) return null;
  const dgid = await getTenantSetting(db, slug, 'discord_guild_id');
  const names = await identityNamesFor(db, user.discordId, dgid);
  if (user.name && String(user.name).trim()) names.add(String(user.name).trim());
  return names.has(nickname) ? String(user.discordId) : null;
}

/* ---------- 报名身份收口 (2026-10-25 用户裁决) ----------
 * 自报名落座名由服务端定: 报名者在该百业绑定服务器的 Discord 昵称
 * (user_guild_nicks 快照), 回退全局名 (users.username, 再回退会话名)。
 * 前端不再能改名, 客户端传来的昵称一律不作数 (覆盖, 不报错); 座位
 * 无条件落本人 discord_id 戳 — 旧「昵称恰等于身份名集合才盖戳」的
 * 条件盖戳就此废除 (那套只剩发车预排座位与整表编辑的保守沿用在用)。 */
export async function canonicalSignupName(db: any, user: any, slug: any) {
  if (!user || !user.discordId) return '';
  const dgid = await getTenantSetting(db, slug, 'discord_guild_id');
  if (dgid) {
    const nick = await getGuildNick(db, String(user.discordId), dgid).catch(() => null);
    if (nick && String(nick).trim()) return String(nick).trim();
  }
  const u = await getUsernameRow(db, String(user.discordId)).catch(() => null);
  if (u && String(u.username || '').trim()) return String(u.username).trim();
  return String(user.name || '').trim();
}

/* ---------- 百业成员名册记录 (用户进入百业时) ----------
 * 读取路径在确认可读 (canView) 后顺手把当前用户记进该百业名册
 * (guild_members): 只用登录已拿到的数据 (全局名 + 该服昵称快照), 不新增
 * 抓取。全程容错且走 waitUntil, 记录失败绝不影响页面读取; 匿名/被锁
 * (GuildLocked) 不记录。 */

export class DiscordUserShell extends ShellBase {
  genDiscordId(){ return String(this.data.discordId); }
  genName(){ return this.data.name; }
  genAvatar(){ return this.data.avatar || null; }
}

export class DiscordServerShell extends ShellBase {
  genId(){ return String(this.data.id); }
  genName(){ return this.data.name || this.data.id; }
  genIcon(){ return this.data.icon || null; }
}

export class ViewerShell extends ShellBase {
  genUser(){
    return this.ctx.user
      ? new DiscordUserShell(this.ctx, this.ctx.user)
      : null;
  }
  async genGuilds(){
    if (!this.ctx.user) return [];
    return this.memo('guilds', async () => {
      const results = await listTenantSlugs(this.db);
      const out = [];
      for (const t of results || []) {
        const a = await getGuildAccess(this.db, this.ctx.user, t.slug, this.ctx.request);
        // 可用百业 = 已绑定 Discord 服务器且我是其成员 (服务端过滤)
        if (a.bound && a.isMember) out.push(guildResult(this.ctx, a));
      }
      return out;
    });
  }
  async genPublicGuilds(){
    return this.memo('publicGuilds', async () => {
      const results = await listTenantSlugs(this.db);
      const out = [];
      for (const t of results || []) {
        const a = await getGuildAccess(this.db, this.ctx.user, t.slug, this.ctx.request);
        // 未绑定服务器的百业: 公开只读类型下发
        if (a.exists && !a.bound) out.push(guildResult(this.ctx, a));
      }
      return out;
    });
  }
  async genGuild({ slug }: any){
    const a = await getGuildAccess(this.db, this.ctx.user, slug, this.ctx.request);
    touchGuildRoster(this.ctx, a); // 进入百业 -> 名册记录 (被锁/匿名在 helper 内过滤)
    // 不存在也返回 GuildLocked (类型即结论, 不下发内容)
    return guildResult(this.ctx, a);
  }
  async genDiscordServers(){
    if (!this.ctx.user) return [];
    return this.memo('discordServers', async () => {
      const servers = await getServersForUser(this.db, this.ctx.user);
      // 服务端过滤: 只下发我有管理权限的服务器 (不下发权限位给前端判断)
      return servers.filter(serverCanManage).map((sv: any) => new DiscordServerShell(this.ctx, sv));
    });
  }
  // 账号级语言偏好 (null = 自动) 与本请求实际生效 locale (ctx.locale 已由
  // worker 按 偏好 > 浏览器语言 > zh-CN 解析完毕)
  genMyLocalePref(){ return loadMyLocalePref(this.ctx); }
  genMyEffectiveLocale(){ return this.locale; }
}

export const VIEWER_TEXT_RESOLVERS = defineTextGens(ViewerShell, [
  ['siteTitle', 'site', 'title'],
  ['siteSubtitle', 'site', 'subtitle'],
  ['siteHeroAlt', 'site', 'heroAlt'],
  ['loginCardTitle', 'login', 'cardTitle'],
  ['loginCardBody1', 'login', 'cardBody1'],
  ['loginCardBody2', 'login', 'cardBody2'],
  ['loginButtonLabel', 'login', 'button'],
  ['loginPrivacyText', 'login', 'privacy'],
  ['userBarLogoutLabel', 'userBar', 'logout'],
  ['userBarLoggingOutLabel', 'userBar', 'loggingOut'],
  ['userBarSettingsLabel', 'userBar', 'settings'],
  ['pickerMyGuildsLabel', 'picker', 'myGuilds'],
  ['pickerMyGuildsEnLabel', 'picker', 'myGuildsEn'],
  ['pickerPublicGuildsLabel', 'picker', 'publicGuilds'],
  ['pickerPublicGuildsEnLabel', 'picker', 'publicGuildsEn'],
  ['pickerReadOnlyBadge', 'picker', 'readOnlyBadge'],
  ['pickerEmptyTitle', 'picker', 'emptyTitle'],
  ['pickerEmptyBody', 'picker', 'emptyBody'],
  ['pickerCreateGuildLabel', 'picker', 'createGuild'],
  ['pickerCreateGuildMoreLabel', 'picker', 'createGuildMore'],
  ['createBackLinkLabel', 'create', 'backLink'],
  ['createTitle', 'create', 'title'],
  ['createSubtitle', 'create', 'subtitle'],
  ['createNameLabel', 'create', 'nameLabel'],
  ['createNamePlaceholder', 'create', 'namePlaceholder'],
  ['createSlugLabel', 'create', 'slugLabel'],
  ['createSlugPlaceholder', 'create', 'slugPlaceholder'],
  ['createSlugCheckingText', 'create', 'slugChecking'],
  ['createSlugTakenText', 'create', 'slugTaken'],
  ['createSlugNote', 'create', 'slugNote'],
  ['createServerLabel', 'create', 'serverLabel'],
  ['createNoServers1', 'create', 'noServers1'],
  ['createNoServers2', 'create', 'noServers2'],
  ['createSubmitLabel', 'create', 'submit'],
  ['createSubmittingLabel', 'create', 'submitting'],
  ['createToastNameShort', 'create', 'toastNameShort'],
  ['createToastSlugRequired', 'create', 'toastSlugRequired'],
  ['createToastSlugBad', 'create', 'toastSlugBad'],
  ['createToastServerRequired', 'create', 'toastServerRequired'],
  ['createToastCreated', 'create', 'toastCreated'],
  ['createToastFailed', 'create', 'toastFailed'],
  ['slugAvailableMessage', 'create', 'slugAvailable', (args: any) => ({ slug: args.slug })],
  ['commonCancelLabel', 'common', 'cancel'],
  ['commonConfirmLabel', 'common', 'confirm'],
  ['commonUnknownErrorText', 'common', 'unknownError'],
  ['commonRenderErrorTemplate', 'common', 'renderError'],
  ['commonRenderErrorHint', 'common', 'renderErrorHint'],
  ['commonBackToHubLabel', 'common', 'backToHub'],
  ['commonLoadingGuildText', 'common', 'loadingGuild'],
  // 全站页脚: 非官方声明 (审计 A3) + 条款/隐私入口文案 (审计 A2)
  ['footerDisclaimerText', 'legal', 'disclaimer'],
  ['footerTermsLabel', 'legal', 'termsLink'],
  ['footerPrivacyLabel', 'legal', 'privacyLink'],
]);

/* ---------- Hub 页 (导航) ---------- */

export class SettingsPageShell extends ShellBase {
  genLocalePref(){ return loadMyLocalePref(this.ctx); }
  genEffectiveLocale(){ return this.locale; }
}
export const SETTINGS_TEXT_RESOLVERS = defineTextGens(SettingsPageShell, [
  ['settingsTitle', 'settings', 'title'],
  ['settingsDiscordLabel', 'settings', 'discordLabel'],
  ['settingsLanguageLabel', 'settings', 'languageLabel'],
  ['settingsLanguageHint', 'settings', 'languageHint'],
  ['settingsAutoLabel', 'settings', 'autoLabel'],
  ['settingsLangZhCnLabel', 'settings', 'langZhCn'],
  ['settingsLangZhTwLabel', 'settings', 'langZhTw'],
  ['settingsLangEnLabel', 'settings', 'langEn'],
  ['settingsLangEsLabel', 'settings', 'langEs'],
  ['settingsLangFrLabel', 'settings', 'langFr'],
  ['settingsSavedText', 'settings', 'savedText'],
]);

/* ---------- Mutation payload shell ----------
 * ok/grouping/seats/guild 是数据; error 文案由 genError 按 errorCode +
 * 请求 locale 生成 (码稳定, 文案可变); 无码时 error 为 null。 */


export const identityResolvers = {
  Query: {
    viewer: async (_: any, __: any, ctx: any) => {
      // 懒刷新: 用户打开应用走 viewer 校验时, 顺带把缺失/超 24h 的服务器昵称
      // 快照用 refresh token 现拉 (本次请求内完成); 失败静默, 用旧快照继续。
      if (ctx.user) { try { await maybeRefreshGuildNicks(ctx.env, ctx.user); } catch { /* 忽略 */ } }
      return new ViewerShell(ctx, {});
    },

    settingsPage: (_: any, __: any, ctx: any) => new SettingsPageShell(ctx, {}),
  },
  Mutation: {
    updateMyLocale: async (_: any, { locale }: any, ctx: any) => {
      const browser = ctx.browserLocale || ctx.locale || 'zh-CN';
      if (!ctx.user) return uFail(ctx, 'loginRequired', browser);
      if (locale !== null && locale !== undefined && !SUPPORTED_LOCALES.includes(locale)) {
        return uFail(ctx, 'localeUnsupported', ctx.locale || browser);
      }
      const pref = locale || null;
      await setUserLocalePref(ctx.env, ctx.user.discordId, pref);
      return new UpdateLocalePayloadShell(ctx, {
        ok: true, errorCode: null, localePref: pref, effectiveLocale: pref || browser,
      });
    },

    // App 推送令牌注册/注销 (发车提醒的 Expo 通道): 身份只认会话
    // ctx.user, 客户端传什么都不信; 令牌格式不合直接拒。
  },
  types: {
  SettingsPage: {
    localePref: (p: any) => p.genLocalePref(),
    effectiveLocale: (p: any) => p.genEffectiveLocale(),
    ...SETTINGS_TEXT_RESOLVERS,
  },
  UpdateLocalePayload: {
    ok: (p: any) => p.genOk(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
    localePref: (p: any) => p.genLocalePref(),
    effectiveLocale: (p: any) => p.genEffectiveLocale(),
  },

  // ===== Viewer 层级字段 =====
  Viewer: {
    myLocalePref: (p: any) => p.genMyLocalePref(),
    myEffectiveLocale: (p: any) => p.genMyEffectiveLocale(),
    user: (p: any) => p.genUser(),
    guilds: (p: any) => p.genGuilds(),
    publicGuilds: (p: any) => p.genPublicGuilds(),
    guild: (p: any, { slug }: any) => p.genGuild({ slug }),
    discordServers: (p: any) => p.genDiscordServers(),
    ...VIEWER_TEXT_RESOLVERS,
  },
  DiscordUser: {
    discordId: (p: any) => p.genDiscordId(),
    name: (p: any) => p.genName(),
    avatar: (p: any) => p.genAvatar(),
  },
  DiscordServer: {
    id: (p: any) => p.genId(),
    name: (p: any) => p.genName(),
    icon: (p: any) => p.genIcon(),
  },

  // Guild / GuildReadOnly 字段实现相同 (只读类型只是不挂写入口组件, 数据本就公开);
  // GuildLocked 只有 slug 与锁定页文案, 不解析任何内容字段。
  // memberRoster 只注册在完整 Guild 上: schema 里 GuildReadOnly /
  // GuildLocked 没有这个字段, 名册权限由响应类型表达。
  },
};
