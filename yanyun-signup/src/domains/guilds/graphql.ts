/* guilds domain GraphQL: Guild shells, the rally page, and guild creation. */
import type { Context } from '../platform/context.ts';
import {
  clampBlocksVersion, substituteForVersion, weekWindowUtc, startsAtEpoch,
  fmtStartsAt, groupByLocalDay, TYPE_SHORT_KEY, HEALER_SECT,
} from '../platform/index.ts';
import { tlCalculateExcel } from '../gear/index.ts';
import { getUserServers, getGuildNick, maybeRefreshGuildNicks, getUserLocalePref, setUserLocalePref } from '../identity/auth.ts';
import { upsertGuildMember, countDistinctNicknamesByTenant } from '../groupings/index.ts';
import { isValidPushToken, savePushToken, deletePushToken } from '../platform/index.ts';
import { evaluateHeirloomPushes } from '../gear/index.ts';
import { translate, negotiateLocale, SUPPORTED_LOCALES, CATALOG } from '../platform/index.ts';
import { logError, grantTrialEntitlement } from '../platform/index.ts';
import { getGuildAvatarMeta, avatarPath } from './index.ts';
import { getSettingValue, setSettingValue, listSettingsByKey } from './index.ts';
import { getUsernameRow } from '../identity/index.ts';
import { listGuildMembers, getGuildMember } from '../identity/index.ts';
import { getBossById, listBossesByDungeon, listSchoolsFull, listSchoolsNameSlug, getSchoolNameBySlug, listSchoolBis, getSchoolBisJsonBySchool, listSchoolRotations, listSlotAffixByBuild, listAffixMax, listAffixMaxValues } from '../dex/index.ts';
import { getDungeonByName, getDungeonNameSizeById, listDungeonsDex, getLatestDungeonVersion } from '../dex/index.ts';
import {
  getTenantRow, getTenantSlug, listTenantSlugs, listTenantsDirectory, insertTenant,
  getEffectiveWhiteLabelSettings,
} from './index.ts';
import { getEventRow, getEventTenant, getEventTenantCreator, listEventsByTenantType, insertEvent, updateEventFields, setEventStatus, deleteEventCascade } from '../groupings/index.ts';
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
  serverCanManage, getGuildAccess, getGuildAdminAccess, publishGroupingEvent, requireWrite,
  sha256hexLocal, rateLimitGql as rateLimit, getClientIp, s, roleOf, newUid,
  TAB_TO_TYPE, TYPE_TO_ENUM, GUILD_TABS, getGameVersion, getCurrentVersionCode,
  PayloadBase, GroupingPayloadShell, SeatPayloadShell, DeletePayloadShell,
  CreateGuildPayloadShell, UpdateLocalePayloadShell, uFail, gFail, sFail, dFail, cFail,
} from '../platform/graphql-base.ts';
import { groupingListPage, touchGuildRoster } from '../groupings/index.ts';
import { guildAdminTypes, guildAdminMutations, guildAdminPayloadResolvers } from './admin-graphql.ts';
import { opsTypes, opsMutations, targetedNudgePreviewResult, myContributionResult } from './ops-graphql.ts';
import { homeRecruitTypes, recruitTypes, recruitMutations } from './recruit-graphql.ts';
import { networkTypes, networkMutations } from './network-graphql.ts';
import {
  announcementPageForMember, guildAnnouncementMutations, guildAnnouncementTypes,
} from './announcements-graphql.ts';
import { seasonAdminTypes, seasonAdminMutations } from './season-graphql.ts';
import { guildOfficerMutations, guildOfficerTypes } from './officer-graphql.ts';
import {
  guildInsightsTypes, guildInsightsMutations, guildInsightsPayloadResolvers,
  raceBoardForViewer, gearSelfForMember,
} from './insights-graphql.ts';
import { guildGovernanceMutations, guildGovernanceTypes } from './governance-graphql.ts';

export const CREATE_RESERVED = new Set([
  'admin', 'api', 'auth', 'hub', 'login', 'logout', 'og', 'graphql', 'create',
  'hub-admin', 'gadmin', 'index', 'bosses', 'tenants', 'onboard', 'settings',
  'events', 'static', 'assets', 'app', 'style', 'favicon', 'robots', 'www',
  'c', 'b',
]);

// Settings access goes through the data layer (src/domains/guilds/
// settings.ts); these local names remain for the many call sites below.

export function guildResult(ctx: Context, access: any) {
  return new GuildShell(ctx, access);
}

export class GuildRosterMemberShell extends ShellBase {
  genDiscordId(){ return String(this.data.discordId); }
  genDisplayName(){ return this.data.displayName; }
  genGlobalName(){ return this.data.globalName || null; }
}

/* ---------- Entity shell: Guild (Guild / GuildReadOnly / GuildLocked) ----------
 * One class, three __typenames (the permission conclusion is
 * expressed by type, as before): instances carry the
 * getGuildAccess conclusion, field generators resolve on demand —
 * content fields are declared only on the types that have them,
 * and a Locked instance is never asked for content. Copy fields
 * (home shell / detail-missing notice / locked page) live on this
 * class and dispatch resolvers by type. */
export class GuildShell extends ShellBase {
  __typename: any;
  constructor(ctx: Context, access: any){
    super(ctx, access);
    this.__typename = !access.exists || !access.canView ? 'GuildLocked'
      : access.canWrite ? 'Guild' : 'GuildReadOnly';
  }
  get access() { return this.data; }
  genSlug(){ return this.access.tenant ? this.access.tenant.slug : this.access.slug; }
  genName(){ return this.access.tenant.guild_name; }
  // Custom guild avatar: only with an avatar, a versioned URL carrying the hash (relative to this origin); otherwise null — clients render the field as-is and must not build URLs themselves.
  genAvatarUrl(){
    return this.memo('avatarUrl', async () => {
      const meta = await getGuildAvatarMeta(this.db, this.genSlug()).catch(() => null);
      if (!meta) return null;
      let origin = '';
      try { origin = new URL(this.ctx.request.url).origin; } catch { /* Without a request, fall back to a relative path. */ }
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
  /* Announcements (F9/F10/F18): the member variant of the
   * announcement page — declared on Guild and GuildReadOnly (the
   * shared content surface), never on GuildLocked. Compose and
   * receipts live only on the admin variant (GuildAdmin shell). */
  genAnnouncements(){
    return announcementPageForMember(this.ctx, this.genSlug());
  }
  /* Premium insights member reads (T1): the race season board is a
   * showcase surface members may read, and gear self status shows a
   * member only their OWN P9 standing. Both compose through
   * insights-graphql, where tierLocked picks the full variant or
   * GuildInsightsLocked (zero data below tier 1). Declared on Guild
   * and GuildReadOnly only — GuildLocked has neither field. */
  genRaceSeasonBoard(){
    return this.memo('raceSeasonBoard', () => raceBoardForViewer(this.ctx, this.genSlug()));
  }
  genGearSelfStatus(){
    return this.memo('gearSelfStatus', () => gearSelfForMember(this.ctx, this.genSlug()));
  }
  // This guild's member roster (proxy-signup picker): attached only
  // to the full Guild type (GuildReadOnly / GuildLocked have no such
  // field in the schema). Sent sorted by display name; rows whose
  // display name is empty (no nickname and no global name) are not
  // sent — picking one could never seat.
  genMemberRoster(){
    return this.memo('memberRoster', async () => {
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
  // The current user's Discord nickname on this guild's bound server (data, not a permission flag); null when logged out / unbound / no bound server, and null for an empty nickname (the frontend falls back to the global name).
  genViewerNick(){
    return this.memo('viewerNick', async () => {
      if (!this.ctx.user || !this.access.bound || !this.access.discordGuildId) return null;
      const nick = await getGuildNick(this.db, this.ctx.user.discordId, this.access.discordGuildId).catch(() => null);
      return nick || null;
    });
  }
  // Admin entry label: emitted only when the viewer passes the same
  // admin verdict the admin surface itself uses (getGuildAdminAccess:
  // bound-server admins, plus the omniscient viewer). Every other
  // member gets null and the home page renders no admin entry at all —
  // an entry that only leads to GuildAdminLocked must not be
  // advertised (variant-granularity ruling, 2026-10-26).
  genHomeAdminLabel(){
    return this.memo('homeAdminLabel', async () => {
      const access = await getGuildAdminAccess(this.db, this.ctx.user, this.genSlug(), this.ctx.request, this.vc).catch(() => null);
      return access && access.isAdmin ? this.t('guildHome_adminLink') : null;
    });
  }
  /* White-label chrome composition (Premium tier 1): the server
   * sends this guild's effective chrome copy, so clients render it
   * verbatim with zero branding logic of their own. Branding on
   * (default): the back label carries the platform name and the
   * footer disclaimer is the platform's. Branding off: a plain back
   * label and NO footer disclaimer (null — the web shell renders no
   * footer at all on this guild's pages). */
  genWhiteLabel(){
    return this.memo('whiteLabel', () => getEffectiveWhiteLabelSettings(this.db, this.genSlug()));
  }
  async genPageBackLabel(){
    const wl = await this.genWhiteLabel();
    return wl.hideBranding ? this.t('guildHome_backPlain') : this.t('guildHome_backToHub');
  }
  async genPageFooterDisclaimerText(){
    const wl = await this.genWhiteLabel();
    return wl.hideBranding ? null : this.t('legal_disclaimer');
  }
}

export const GUILD_HOME_TEXT_SPEC = [
  ['homeBackToHubLabel', 'guildHome_backToHub'],
  ['homeTabTeamLabel', 'guildHome_tabTeam'],
  ['homeTabDexLabel', 'guildHome_tabDex'],
  ['homeTabSectLabel', 'guildHome_tabSect'],
  ['homeTabAnnouncementsLabel', 'guildHome_tabAnnouncements'],
  ['homeTabScheduleLabel', 'guildHome_tabSchedule'],
  ['homeTabMarketLabel', 'guildHome_tabMarket'],
  ['homeTabAlliesLabel', 'guildHome_tabAllies'],
  ['homeInsightsRaceTitle', 'guildAdmin_insightsRaceTitle'],
  ['homeInsightsRaceEmptyText', 'guildAdmin_insightsRaceEmpty'],
  ['homeInsightsRaceTeamLabel', 'guildAdmin_insightsRaceTeamLabel'],
  ['homeInsightsRaceRunsLabel', 'guildAdmin_insightsRaceRunsLabel'],
  ['homeInsightsRaceWinsLabel', 'guildAdmin_insightsRaceWinsLabel'],
  ['homeInsightsRaceBestLabel', 'guildAdmin_insightsRaceBestLabel'],
  ['homeInsightsSelfGearTitle', 'guildAdmin_insightsSelfGearTitle'],
  ['homeInsightsGearScoreLabel', 'guildAdmin_insightsGearScoreLabel'],
  ['homeInsightsGearMinScoreLabel', 'guildAdmin_insightsGearMinScoreLabel'],
  ['detailNotFoundText', 'groupingDetail_notFound'],
  ['detailBackToListLabel', 'groupingDetail_backToList'],
];
export const GUILD_TEXT_RESOLVERS = defineTextGens(GuildShell, GUILD_HOME_TEXT_SPEC);
// Admin entry label: declared only on the full Guild type (member
// branch), so its resolver must not leak into the shared content map.
// Unlike the plain text fields above it is verdict-gated (see
// GuildShell.genHomeAdminLabel), so it keeps an explicit resolver
// instead of a defineTextGens entry.
export const GUILD_ADMIN_LINK_RESOLVERS = {
  homeAdminLabel: (p: GuildShell) => p.genHomeAdminLabel(),
};
export const GUILD_READONLY_TEXT_RESOLVERS = defineTextGens(GuildShell, [
  ['homeReadOnlyBanner', 'guildHome_readOnlyBanner'],
]);
export const GUILD_LOCKED_TEXT_RESOLVERS = defineTextGens(GuildShell, [
  ['lockedBackLinkLabel', 'locked_backLink'],
  ['lockedTitle', 'locked_title'],
  ['lockedBody1', 'locked_body1'],
  ['lockedBody2', 'locked_body2'],
  ['lockedBackButtonLabel', 'locked_backButton'],
]);

// Content fields of Guild / GuildReadOnly (identical data surface; they differ only in type and in which components the frontend mounts).
export function guildContentResolvers() {
  return {
    slug: (p: any) => p.genSlug(),
    name: (p: any) => p.genName(),
    slogan: (p: any) => p.genSlogan(),
    gameVersion: (p: any) => p.genGameVersion(),
    memberCount: (p: any) => p.genMemberCount(),
    avatarUrl: (p: any) => p.genAvatarUrl(),
    groupings: (p: any, { tab }: any) => p.genGroupings({ tab }),
    announcements: (p: any) => p.genAnnouncements(),
    raceSeasonBoard: (p: any) => p.genRaceSeasonBoard(),
    gearSelfStatus: (p: any) => p.genGearSelfStatus(),
    viewerNick: (p: any) => p.genViewerNick(),
    pageBackLabel: (p: any) => p.genPageBackLabel(),
    pageFooterDisclaimerText: (p: any) => p.genPageFooterDisclaimerText(),
    ...GUILD_TEXT_RESOLVERS,
  };
}





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
      try { origin = new URL(this.ctx.request.url).origin; } catch { /* as in GuildShell: origin stays empty */ }
      return origin + avatarPath(this.genSlug(), meta.hash);
    });
  }
}

export class HubPageShell extends ShellBase {
  async genGuilds(){
    return this.memo('guilds', async () => {
      const db = this.db;
      const results = await listTenantsDirectory(db);
      // Bound guilds are visible only to members of their Discord server: anonymous users and non-members are filtered out at this layer.
      const bindRows = await listSettingsByKey(db, 'discord_guild_id').catch(() => []);
      const bindMap: Record<string, any> = {};
      for (const r of bindRows || []) if (r.value) bindMap[r.tenant] = String(r.value);
      // dev_only guilds: do not appear in navigation from non-dev surfaces.
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

/* ---------- Legal pages (terms / privacy, audit A2) ----------
 * The body copy is written against the actual data handling (see
 * the termsBody/privacyBody sections in i18n): zh-CN source + full
 * en translation; es/fr/zh-TW fall back field-by-field to the
 * source via translate(). Pages are publicly reachable (logged-out
 * visitors enter from the login page footer); the resolver does
 * no login check. */

export class GuildPageShell extends ShellBase {
  genSlug(){ return this.data.slug; }
  genName(){ return this.data.name; }
  genGameVersion(){ return this.data.gameVersion; }
  genCurrentVersion(){ return this.data.currentVersion; }
  genTabs(){ return this.data.tabs; }
}



export const guildsResolvers = {
  Query: {
    hubPage: (_: any, __: any, ctx: Context) => new HubPageShell(ctx, {}),

    // Legal pages (terms/privacy): public pages, reachable anonymously (login-page footer entry).
    guildPage: async (_: any, { slug }: any, ctx: Context) => {
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

    targetedNudgePreview: async (_: any, { slug, eventId, segmentKind, segmentValue }: any, ctx: Context) =>
      targetedNudgePreviewResult(ctx, slug, Number(eventId), String(segmentKind || 'all'), String(segmentValue || '')),
    myContribution: async (_: any, { slug }: any, ctx: Context) => myContributionResult(ctx, slug),

    slugAvailable: async (_: any, { slug }: any, ctx: Context) => {
      const db = ctx.env.DB;
      const v = String(slug || '').trim().toLowerCase();
      if (!/^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/.test(v) || v.length < 2 || v.length > 40) return false;
      if (CREATE_RESERVED.has(v)) return false;
      const t = await getTenantSlug(db, v);
      return !t;
    },
  },
  Mutation: {
    createGuild: async (_: any, { input }: any, ctx: Context) => {
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
      // Tenant structure matches the tenants table; password_hash is
      // randomly generated (Discord-created guilds do not use password
      // login for now).
      // Note: REST /api/onboard anonymous guild creation was removed
      // on 2026-10-25 (audit A4); this mutation is the only creation
      // path.
      const hash = await sha256hexLocal(crypto.randomUUID() + ':' + user.discordId + ':' + Date.now());
      await insertTenant(db, { slug, guildName: name, passwordHash: hash, announcement: '' });
      await setTenantSetting(db, slug, 'discord_guild_id', dgid);
      // Trial arming (lifecycle ruling, 2026-10-28): creating the
      // guild IS completing the create/bind flow — the tenant row
      // and its Discord binding both exist at this point — so the
      // one-per-guild trial (14 days, T2, no card at the door) is
      // granted here, the single creation path. The grant is
      // idempotent by construction (trial_used stamp), so no retry
      // or re-entry can ever issue a second one.
      await grantTrialEntitlement(db, slug);
      const a = await getGuildAccess(db, user, slug, ctx.request);
      return new CreateGuildPayloadShell(ctx, { ok: true, guild: guildResult(ctx, a) });
    },

    ...guildAdminMutations,
    ...opsMutations,
    ...seasonAdminMutations,

    ...guildAnnouncementMutations,

    ...recruitMutations,

    ...networkMutations,
    ...guildOfficerMutations,
    ...guildInsightsMutations,
    ...guildGovernanceMutations,

    // Write gate (requireWrite): logged in + bound + member; an unbound guild's writes are fully locked.
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
    ...GUILD_ADMIN_LINK_RESOLVERS,
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
  ...guildAdminTypes,
  ...guildAdminPayloadResolvers,
  ...guildAnnouncementTypes,
  ...seasonAdminTypes,
  ...recruitTypes,
  ...homeRecruitTypes,
  ...guildOfficerTypes,
  ...opsTypes,
  ...networkTypes,
  ...guildInsightsTypes,
  ...guildInsightsPayloadResolvers,
  ...guildGovernanceTypes,
  },
};
