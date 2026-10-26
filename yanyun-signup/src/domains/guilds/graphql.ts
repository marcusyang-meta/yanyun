/* guilds 域 GraphQL (三期域拆分): Guild shells、集结页与建业。 */
import {
  clampBlocksVersion, substituteForVersion, weekWindowUtc, startsAtEpoch,
  fmtStartsAt, groupByLocalDay, TYPE_SHORT_KEY, HEALER_SECT,
} from '../platform/index.ts';
import { tlCalculateExcel } from '../gear/index.ts';
import { getUserServers, getGuildNick, maybeRefreshGuildNicks, getUserLocalePref, setUserLocalePref } from '../../auth.js';
import { ensureSignupDiscordColumn, ensureGuildMembersTable, upsertGuildMember,
  countDistinctNicknamesByTenant,
} from '../groupings/index.ts';
import { ensurePushTokensTable, isValidPushToken, savePushToken, deletePushToken } from '../platform/index.ts';
import { evaluateHeirloomPushes } from '../gear/index.ts';
import { translate, negotiateLocale, SUPPORTED_LOCALES, CATALOG } from '../platform/index.ts';
import { logError } from '../platform/index.ts';
import { getGuildAvatarMeta, avatarPath } from './index.ts';
import { getSettingValue, setSettingValue, listSettingsByKey } from './index.ts';
import { getUsernameRow } from '../identity/index.ts';
import { listGuildMembers, getGuildMember } from '../identity/index.ts';
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
} from './index.ts';
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
import { groupingListPage, touchGuildRoster } from '../groupings/index.ts';

export const CREATE_RESERVED = new Set([
  'admin', 'api', 'auth', 'hub', 'login', 'logout', 'og', 'graphql', 'create',
  'hub-admin', 'gadmin', 'index', 'bosses', 'tenants', 'onboard', 'settings',
  'events', 'static', 'assets', 'app', 'style', 'favicon', 'robots', 'www',
]);

// Settings access goes through the data layer (src/domains/guilds/
// settings.ts); these local names remain for the many call sites below.

export function guildResult(ctx: any, access: any) {
  return new GuildShell(ctx, access);
}

export class GuildRosterMemberShell extends ShellBase {
  genDiscordId(){ return String(this.data.discordId); }
  genDisplayName(){ return this.data.displayName; }
  genGlobalName(){ return this.data.globalName || null; }
}

/* ---------- 实体 shell: Guild (Guild / GuildReadOnly / GuildLocked) ----------
 * 一个 class, 三个 __typename (权限结论由类型表达, 与从前一致): 实例
 * 携带 getGuildAccess 的结论, 字段 gen 方法按需解析 — 内容字段仅在
 * 对应类型上声明, Locked 实例永远不会被问到内容。文案字段 (主页
 * 外壳/详情页缺失提示/锁定页) 直接长在本类上, 按类型分发 resolver。 */
export class GuildShell extends ShellBase {
  __typename: any;
  constructor(ctx: any, access: any){
    super(ctx, access);
    this.__typename = !access.exists || !access.canView ? 'GuildLocked'
      : access.canWrite ? 'Guild' : 'GuildReadOnly';
  }
  get access() { return this.data; }
  genSlug(){ return this.access.tenant ? this.access.tenant.slug : this.access.slug; }
  genName(){ return this.access.tenant.guild_name; }
  // 百业自定义头像: 有头像才给带 hash 的版本化 URL (相对本站 origin),
  // 没有给 null — 客户端照字段渲染, 不许自己拼 URL。
  genAvatarUrl(){
    return this.memo('avatarUrl', async () => {
      const meta = await getGuildAvatarMeta(this.db, this.genSlug()).catch(() => null);
      if (!meta) return null;
      let origin = '';
      try { origin = new URL(this.ctx.request.url).origin; } catch { /* 无 request 时退相对路径 */ }
      return origin + avatarPath(this.genSlug(), meta.hash);
    });
  }
  genSlogan(){ return this.access.tenant.slogan || ''; }
  genGameVersion(){ return this.ctxMemo('gameVersion', () => getGameVersion(this.db)); }
  genMemberCount(){
    return this.memo('memberCount', async () => {
      return countDistinctNicknamesByTenant(this.db, this.genSlug()).catch(() => 0);
    });
  }
  genGroupings({ tab }: any){
    return groupingListPage(this.ctx, this.genSlug(), tab);
  }
  // 本百业成员名册 (代报名选人面): 只挂在完整 Guild 类型上
  // (GuildReadOnly / GuildLocked 的 schema 里没有这个字段)。按展示名
  // 排序下发; 展示名为空 (昵称与全局名都缺) 的行不下发 — 选了也落不了座。
  genMemberRoster(){
    return this.memo('memberRoster', async () => {
      await ensureGuildMembersTable(this.db);
      const results = await listGuildMembers(this.db, this.genSlug()).catch(() => []);
      const out = [];
      for (const r of results || []) {
        const displayName = String(r.nick || '').trim() || String(r.global_name || '').trim();
        if (!displayName) continue;
        out.push(new GuildRosterMemberShell(this.ctx, {
          discordId: String(r.discord_id),
          displayName,
          globalName: String(r.global_name || '').trim(),
        }));
      }
      out.sort((a: any, b: any) => a.data.displayName.localeCompare(b.data.displayName, 'zh-Hans-CN'));
      return out;
    });
  }
  // 当前用户在该百业绑定服务器的 Discord 昵称 (数据, 非权限标记);
  // 未登录/未绑定/无绑定服务器 -> null; 昵称为空 -> null (前端回退全局名)
  genViewerNick(){
    return this.memo('viewerNick', async () => {
      if (!this.ctx.user || !this.access.bound || !this.access.discordGuildId) return null;
      const nick = await getGuildNick(this.db, this.ctx.user.discordId, this.access.discordGuildId).catch(() => null);
      return nick || null;
    });
  }
}

export const GUILD_HOME_TEXT_SPEC = [
  ['homeBackToHubLabel', 'guildHome', 'backToHub'],
  ['homeTabTeamLabel', 'guildHome', 'tabTeam'],
  ['homeTabDexLabel', 'guildHome', 'tabDex'],
  ['homeTabSectLabel', 'guildHome', 'tabSect'],
  ['detailNotFoundText', 'groupingDetail', 'notFound'],
  ['detailBackToListLabel', 'groupingDetail', 'backToList'],
];
export const GUILD_TEXT_RESOLVERS = defineTextGens(GuildShell, GUILD_HOME_TEXT_SPEC);
export const GUILD_READONLY_TEXT_RESOLVERS = defineTextGens(GuildShell, [
  ['homeReadOnlyBanner', 'guildHome', 'readOnlyBanner'],
]);
export const GUILD_LOCKED_TEXT_RESOLVERS = defineTextGens(GuildShell, [
  ['lockedBackLinkLabel', 'locked', 'backLink'],
  ['lockedTitle', 'locked', 'title'],
  ['lockedBody1', 'locked', 'body1'],
  ['lockedBody2', 'locked', 'body2'],
  ['lockedBackButtonLabel', 'locked', 'backButton'],
]);

// Guild / GuildReadOnly 的内容字段 (两者数据面相同; 区别只在类型与前端挂载的组件)
export function guildContentResolvers() {
  return {
    slug: (p: any) => p.genSlug(),
    name: (p: any) => p.genName(),
    slogan: (p: any) => p.genSlogan(),
    gameVersion: (p: any) => p.genGameVersion(),
    memberCount: (p: any) => p.genMemberCount(),
    avatarUrl: (p: any) => p.genAvatarUrl(),
    groupings: (p: any, { tab }: any) => p.genGroupings({ tab }),
    viewerNick: (p: any) => p.genViewerNick(),
    ...GUILD_TEXT_RESOLVERS,
  };
}



/* ================= 页面 shell ================= */

/* ---------- Viewer (站点/登录/用户栏/选择页/创建页/通用文案 + 用户层级) ---------- */

export class GuildCardShell extends ShellBase {
  genSlug(){ return this.data.slug; }
  genName(){ return this.data.name; }
  genSlogan(){ return this.data.slogan || ''; }
  genGameVersion(){ return this.data.gameVersion; }
  genMemberCount(){ return this.data.memberCount; }
  genAvatarUrl(){
    return this.memo('avatarUrl', async () => {
      const meta = await getGuildAvatarMeta(this.db, this.genSlug()).catch(() => null);
      if (!meta) return null;
      let origin = '';
      try { origin = new URL(this.ctx.request.url).origin; } catch { /* 同 GuildShell */ }
      return origin + avatarPath(this.genSlug(), meta.hash);
    });
  }
}

export class HubPageShell extends ShellBase {
  async genGuilds(){
    return this.memo('guilds', async () => {
      const db = this.db;
      const results = await listTenantsDirectory(db);
      // 已绑定百业仅对其 Discord 服务器成员可见: 匿名/非成员在此层就过滤掉
      const bindRows = await listSettingsByKey(db, 'discord_guild_id').catch(() => []);
      const bindMap: Record<string, any> = {};
      for (const r of bindRows || []) if (r.value) bindMap[r.tenant] = String(r.value);
      // dev_only 百业: 非 dev 表面来源不出现在导航里
      const devRows = await listSettingsByKey(db, 'dev_only').catch(() => []);
      const devSet = new Set((devRows || []).filter((r: any) => String(r.value) === '1').map((r: any) => r.tenant));
      const devVisible = isDevRequest(this.ctx.request);
      const gameVersion = await this.ctxMemo('gameVersion', () => getGameVersion(db));
      const guilds: any[] = [];
      for (const t of results || []) {
        if (devSet.has(t.slug) && !devVisible) continue;
        const dgid = bindMap[t.slug];
        if (dgid && !(this.ctx.user && (this.ctx.user.guilds || []).includes(dgid))) continue;
        const mc = await countDistinctNicknamesByTenant(db, t.slug).catch(() => 0);
        guilds.push(new GuildCardShell(this.ctx, {
          slug: t.slug, name: t.guild_name, slogan: t.slogan || '', gameVersion, memberCount: mc,
        }));
      }
      return guilds;
    });
  }
}

/* ---------- 法律页 (服务条款 / 隐私政策, 2026-10-25 审计 A2) ----------
 * 正文按实际数据处理写 (见 i18n.js 的 termsBody/privacyBody 段):
 * zh-CN 源文 + en 全译, es/fr/zh-TW 经 translate() 逐字段回退源文。
 * 页面公开可达 (未登录访客从登录页页脚进入), resolver 不做登录校验。 */

export class GuildPageShell extends ShellBase {
  genSlug(){ return this.data.slug; }
  genName(){ return this.data.name; }
  genGameVersion(){ return this.data.gameVersion; }
  genCurrentVersion(){ return this.data.currentVersion; }
  genTabs(){ return this.data.tabs; }
}

/* ---------- 组队详情页 ---------- */


export const guildsResolvers = {
  Query: {
    hubPage: (_: any, __: any, ctx: any) => new HubPageShell(ctx, {}),

    // 法律页 (服务条款/隐私政策): 公开页面, 匿名可达 (登录页页脚入口)
    guildPage: async (_: any, { slug }: any, ctx: any) => {
      const db = ctx.env.DB;
      const a = await getGuildAccess(db, ctx.user, slug, ctx.request);
      if (!a.exists) throw new Error(errText(ctx, 'guildNotFound'));
      if (!a.canView) throw new Error(errText(ctx, 'memberOnlyView'));
      touchGuildRoster(ctx, a);
      const gameVersion = await getGameVersion(db);
      return new GuildPageShell(ctx, {
        slug: a.tenant.slug, name: a.tenant.guild_name, gameVersion, currentVersion: gameVersion, tabs: GUILD_TABS,
      });
    },

    slugAvailable: async (_: any, { slug }: any, ctx: any) => {
      const db = ctx.env.DB;
      const v = String(slug || '').trim().toLowerCase();
      if (!/^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/.test(v) || v.length < 2 || v.length > 40) return false;
      if (CREATE_RESERVED.has(v)) return false;
      const t = await getTenantSlug(db, v);
      return !t;
    },
  },
  Mutation: {
    createGuild: async (_: any, { input }: any, ctx: any) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:createGuild:' + getClientIp(ctx.request), 5, 3600000)) {
        return cFail(ctx, 'createRateLimited');
      }
      const user = ctx.user;
      if (!user) return cFail(ctx, 'loginRequiredShort');
      const name = s(input.name, 20);
      if (name.length < 2) return cFail(ctx, 'guildNameShort');
      const slug = String(input.slug || '').trim().toLowerCase();
      if (!/^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/.test(slug) || slug.length < 2 || slug.length > 40) {
        return cFail(ctx, 'slugInvalid');
      }
      if (CREATE_RESERVED.has(slug)) return cFail(ctx, 'slugReserved');
      const exists = await getTenantSlug(db, slug);
      if (exists) return cFail(ctx, 'slugTaken');
      const dgid = String(input.discordGuildId || '');
      if (!/^\d{5,25}$/.test(dgid)) return cFail(ctx, 'serverRequired');
      const servers = await getServersForUser(db, user);
      const sv = servers.find((x: any) => x.id === dgid);
      if (!sv) return cFail(ctx, 'notInServer');
      if (!serverCanManage(sv)) {
        return cFail(ctx, 'cannotManageServer');
      }
      // 租户结构与 tenants 表一致; password_hash 随机生成 (Discord 建的业暂不走密码登录)。
      // 注: REST /api/onboard 匿名建业已于 2026-10-25 下线 (审计 A4), 本 mutation 是唯一建业路径。
      const hash = await sha256hexLocal(crypto.randomUUID() + ':' + user.discordId + ':' + Date.now());
      await insertTenant(db, { slug, guildName: name, passwordHash: hash, announcement: '' });
      await setTenantSetting(db, slug, 'discord_guild_id', dgid);
      const a = await getGuildAccess(db, user, slug, ctx.request);
      return new CreateGuildPayloadShell(ctx, { ok: true, guild: guildResult(ctx, a) });
    },

    // 写操作 gate (requireWrite): 登录 + 已绑定 + 成员; 未绑定百业写功能锁死
  },
  types: {
  HubPage: {
    guilds: (p: any) => p.genGuilds(),
  },
  GuildCard: {
    slug: (p: any) => p.genSlug(),
    name: (p: any) => p.genName(),
    slogan: (p: any) => p.genSlogan(),
    gameVersion: (p: any) => p.genGameVersion(),
    memberCount: (p: any) => p.genMemberCount(),
    avatarUrl: (p: any) => p.genAvatarUrl(),
  },
  GuildPage: {
    slug: (p: any) => p.genSlug(),
    name: (p: any) => p.genName(),
    gameVersion: (p: any) => p.genGameVersion(),
    currentVersion: (p: any) => p.genCurrentVersion(),
    tabs: (p: any) => p.genTabs(),
  },
  CreateGuildPayload: {
    ok: (p: any) => p.genOk(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
    guild: (p: any) => p.genGuild(),
  },
  Guild: {
    ...guildContentResolvers(),
    memberRoster: (p: any) => p.genMemberRoster(),
  },
  GuildRosterMember: {
    discordId: (p: any) => p.genDiscordId(),
    displayName: (p: any) => p.genDisplayName(),
    globalName: (p: any) => p.genGlobalName(),
  },
  GuildReadOnly: { ...guildContentResolvers(), ...GUILD_READONLY_TEXT_RESOLVERS },
  GuildLocked: {
    slug: (p: any) => p.genSlug(),
    ...GUILD_LOCKED_TEXT_RESOLVERS,
  },
  },
};
