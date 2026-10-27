/* Identity GraphQL: Viewer/Discord shells, settings page and updateMyLocale. */
import type { Context } from '../platform/context.ts';
import {
  clampBlocksVersion, substituteForVersion, weekWindowUtc, startsAtEpoch,
  fmtStartsAt, groupByLocalDay, TYPE_SHORT_KEY, HEALER_SECT,
} from '../platform/index.ts';
import { tlCalculateExcel } from '../gear/index.ts';
import { getUserServers, getGuildNick, maybeRefreshGuildNicks, getUserLocalePref, setUserLocalePref } from './auth.ts';
import { upsertGuildMember } from '../groupings/index.ts';
import { isValidPushToken, savePushToken, deletePushToken } from '../platform/index.ts';
import { evaluateHeirloomPushes } from '../gear/index.ts';
import { translate, negotiateLocale, SUPPORTED_LOCALES, CATALOG } from '../platform/index.ts';
import { logError } from '../platform/index.ts';
import { getGuildAvatarMeta, avatarPath } from '../guilds/index.ts';
import { getSettingValue, setSettingValue, listSettingsByKey } from '../guilds/index.ts';
import { getUsernameRow } from './index.ts';
import { listGuildMembers, getGuildMember } from './index.ts';
import { getAccountRow } from './users.ts';
import type { AccountRow } from './users.ts';
import {
  exportMyData as exportMyDataService,
  requestAccountDeletion as requestAccountDeletionService,
  cancelAccountDeletion as cancelAccountDeletionService,
  deletionExecutesAt,
} from './account.ts';
import { getBossById, listBossesByDungeon, listSchoolsFull, listSchoolsNameSlug, getSchoolNameBySlug, listSchoolBis, getSchoolBisJsonBySchool, listSchoolRotations, listSlotAffixByBuild, listAffixMax, listAffixMaxValues } from '../dex/index.ts';
import { getDungeonByName, getDungeonNameSizeById, listDungeonsDex, getLatestDungeonVersion } from '../dex/index.ts';
import {
  getTenantRow, getTenantSlug, listTenantSlugs, listTenantsDirectory, insertTenant,
} from '../guilds/index.ts';
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
  serverCanManage, getGuildAccess, publishGroupingEvent, requireWrite,
  sha256hexLocal, rateLimitGql as rateLimit, getClientIp, s, roleOf, newUid,
  TAB_TO_TYPE, TYPE_TO_ENUM, GUILD_TABS, getGameVersion, getCurrentVersionCode,
  PayloadBase, GroupingPayloadShell, SeatPayloadShell, DeletePayloadShell,
  CreateGuildPayloadShell, UpdateLocalePayloadShell, uFail, gFail, sFail, dFail, cFail,
} from '../platform/graphql-base.ts';
import { guildResult, guildAdminResult } from '../guilds/index.ts';
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

export async function selfStampFor(db: any, user: any, slug: any, nickname: any) {
  if (!user || !user.discordId || !nickname) return null;
  const dgid = await getTenantSetting(db, slug, 'discord_guild_id');
  const names = await identityNamesFor(db, user.discordId, dgid);
  if (user.name && String(user.name).trim()) names.add(String(user.name).trim());
  return names.has(nickname) ? String(user.discordId) : null;
}

/* ---------- Signup identity (ruling) ----------
 * The server decides a self-signup's seat name: the member's Discord nick
 * in the guild's bound server (user_guild_nicks snapshot), falling back to
 * the global name (users.username, then the session name). Client-sent
 * nicknames are ignored (overwritten, not an error), and the seat is
 * unconditionally stamped with the user's own discord_id — the old
 * conditional stamping (nick must equal an identity name) is abolished;
 * it survives only in pre-arranged seats and full-table edits. */
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

/* ---------- Guild roster recording (on entering a guild) ----------
 * After a read confirms canView, record the current user in the guild
 * roster (guild_members), using only data login already fetched (global
 * name + that server's nick snapshot) — no new fetching. Fully tolerant
 * and via waitUntil; recording failure never affects the page read.
 * Anonymous / locked (GuildLocked) visits are not recorded. */

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
        // Usable guilds = bound Discord server and I am a member (filtered server-side)
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
        // Unbound guilds are served as the public read-only type
        if (a.exists && !a.bound) out.push(guildResult(this.ctx, a));
      }
      return out;
    });
  }
  async genGuild({ slug }: any){
    const a = await getGuildAccess(this.db, this.ctx.user, slug, this.ctx.request);
    touchGuildRoster(this.ctx, a); // entering a guild records the roster (locked/anonymous filtered inside the helper)
    // A missing guild also returns GuildLocked (the type is the verdict; no content)
    return guildResult(this.ctx, a);
  }
  async genGuildAdmin({ slug }: any){
    // Admin surface: the GuildAdmin / GuildAdminLocked type is the verdict.
    return guildAdminResult(this.ctx, slug);
  }
  async genDiscordServers(){
    if (!this.ctx.user) return [];
    return this.memo('discordServers', async () => {
      const servers = await getServersForUser(this.db, this.ctx.user);
      // Server-side filter: only servers I can manage (permission bits are never sent for frontend judging)
      return servers.filter(serverCanManage).map((sv: any) => new DiscordServerShell(this.ctx, sv));
    });
  }
  // Account locale preference (null = automatic) and this request's effective
  // locale (ctx.locale already resolved: preference > browser language > zh-CN)
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
  // Site footer: unofficial disclaimer + terms/privacy entry labels
  ['footerDisclaimerText', 'legal', 'disclaimer'],
  ['footerTermsLabel', 'legal', 'termsLink'],
  ['footerPrivacyLabel', 'legal', 'privacyLink'],
]);

/* ---------- Hub page (navigation) ---------- */

/* Account self-service state (users row), request-memoized like the
 * locale preference: fresh_auth_at drives the re-verification step,
 * deletion_requested_at the pending-deletion panel. */
export function loadMyAccountRow(ctx: Context): Promise<AccountRow | null> {
  const store = ctx._memo || (ctx._memo = new Map());
  if (!store.has('myAccountRow')) {
    store.set('myAccountRow', (async () => {
      if (!ctx.user) return null;
      return getAccountRow(ctx.env.DB, ctx.user.discordId).catch(() => null);
    })());
  }
  return store.get('myAccountRow') as Promise<AccountRow | null>;
}

export class SettingsPageShell extends ShellBase {
  genLocalePref(){ return loadMyLocalePref(this.ctx); }
  genEffectiveLocale(){ return this.locale; }
  async genFreshAuthAt(){
    const row = await loadMyAccountRow(this.ctx);
    return row && row.fresh_auth_at != null ? Number(row.fresh_auth_at) : null;
  }
  async genAccountPendingDeletion(){
    const row = await loadMyAccountRow(this.ctx);
    const executesAt = deletionExecutesAt(row);
    if (!row || executesAt == null) return null;
    return new AccountPendingDeletionShell(this.ctx, {
      requestedAt: Number(row.deletion_requested_at),
      executesAt,
    });
  }
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
  ['accountSectionTitle', 'account', 'sectionTitle'],
  ['accountExportLabel', 'account', 'exportLabel'],
  ['accountExportHint', 'account', 'exportHint'],
  ['accountDeleteLabel', 'account', 'deleteLabel'],
  ['accountDeleteHint', 'account', 'deleteHint'],
  ['accountReauthLabel', 'account', 'reauthLabel'],
  ['accountReauthHint', 'account', 'reauthHint'],
  ['accountConfirmTitle', 'account', 'confirmTitle'],
  ['accountConfirmIntro', 'account', 'confirmIntro'],
  ['accountConsequenceCars', 'account', 'consequenceCars'],
  ['accountConsequenceData', 'account', 'consequenceData'],
  ['accountConsequenceGuilds', 'account', 'consequenceGuilds'],
  ['accountConsequenceResidual', 'account', 'consequenceResidual'],
  ['accountConsequenceReregister', 'account', 'consequenceReregister'],
  ['accountExportFirstHint', 'account', 'exportFirstHint'],
  ['accountUsernameLabel', 'account', 'usernameLabel'],
  ['accountSubmitLabel', 'account', 'submitLabel'],
  ['accountBackLabel', 'account', 'backLabel'],
  ['accountCancelDeletionLabel', 'account', 'cancelDeletionLabel'],
  ['accountDeletionRequestedText', 'account', 'deletionRequestedText'],
  ['accountDeletionCancelledText', 'account', 'deletionCancelledText'],
]);

/* Pending-deletion panel: the type's presence IS the state (no flag);
 * the body copy is composed server-side with the execution date in the
 * viewer's locale/timezone. */
export class AccountPendingDeletionShell extends ShellBase {
  genExecutesAt(){ return new Date(this.data.executesAt * 1000).toISOString(); }
  genDaysLeft(){
    const left = this.data.executesAt - Math.floor(Date.now() / 1000);
    return Math.max(0, Math.ceil(left / 86400));
  }
  genAccountPendingBody(){
    let date = this.genExecutesAt().slice(0, 10);
    try {
      date = new Intl.DateTimeFormat(this.locale, {
        year: 'numeric', month: 'long', day: 'numeric',
        timeZone: this.ctx.tz || 'Asia/Shanghai',
      }).format(new Date(this.data.executesAt * 1000));
    } catch { /* keep the ISO date */ }
    return this.t('account', 'pendingBody', { date });
  }
}
export const PENDING_DELETION_TEXT_RESOLVERS = defineTextGens(AccountPendingDeletionShell, [
  ['accountPendingTitle', 'account', 'pendingTitle'],
]);

/* ---------- Account self-service payloads ---------- */
export class ExportMyDataPayloadShell extends PayloadBase {
  genJson(){ return this.data.json ?? null; }
  genFilename(){ return this.data.ok ? 'yanyun-data-export.json' : null; }
}
export class AccountDeletionPayloadShell extends PayloadBase {
  genExecutesAt(){
    return this.data.executesAt != null
      ? new Date(this.data.executesAt * 1000).toISOString()
      : null;
  }
}

/* ---------- Mutation payload shell ----------
 * ok/grouping/seats/guild are data; error text is generated by genError
 * from errorCode + request locale (codes stable, text may vary); no code
 * means error is null. */


export const identityResolvers = {
  Query: {
    viewer: async (_: any, __: any, ctx: Context) => {
      // Lazy refresh: a viewer check also refetches missing / >24h server
      // nick snapshots with the refresh token, in-request; failure is silent
      // and the old snapshot is used.
      if (ctx.user) { try { await maybeRefreshGuildNicks(ctx.env, ctx.user); } catch { /* ignore */ } }
      return new ViewerShell(ctx, {});
    },

    settingsPage: (_: any, __: any, ctx: Context) => new SettingsPageShell(ctx, {}),
  },
  Mutation: {
    updateMyLocale: async (_: any, { locale }: any, ctx: Context) => {
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

    /* Account self-service: export + deletion. All gates (fresh auth,
     * rate limit, typed-name confirmation, cooling-off) live in the
     * identity account service; these resolvers only adapt payloads. */
    exportMyData: async (_: any, __: any, ctx: Context) => {
      if (!ctx.user) return new ExportMyDataPayloadShell(ctx, { ok: false, errorCode: 'loginRequired' });
      const r = await exportMyDataService(ctx.env.DB, ctx.user.discordId, ctx.locale);
      return new ExportMyDataPayloadShell(ctx, r.ok
        ? { ok: true, errorCode: null, json: r.json }
        : { ok: false, errorCode: r.errorCode });
    },

    requestAccountDeletion: async (_: any, { typedUsername }: any, ctx: Context) => {
      if (!ctx.user) return new AccountDeletionPayloadShell(ctx, { ok: false, errorCode: 'loginRequired' });
      const r = await requestAccountDeletionService(ctx.env.DB, ctx.user.discordId, typedUsername);
      return new AccountDeletionPayloadShell(ctx, r.ok
        ? { ok: true, errorCode: null, executesAt: r.executesAt }
        : { ok: false, errorCode: r.errorCode });
    },

    cancelAccountDeletion: async (_: any, __: any, ctx: Context) => {
      if (!ctx.user) return new AccountDeletionPayloadShell(ctx, { ok: false, errorCode: 'loginRequired' });
      const r = await cancelAccountDeletionService(ctx.env.DB, ctx.user.discordId);
      return new AccountDeletionPayloadShell(ctx, r.ok
        ? { ok: true, errorCode: null }
        : { ok: false, errorCode: r.errorCode });
    },

    // App push-token register/unregister (Expo departure channel): identity
    // comes only from the session ctx.user; malformed tokens are rejected.
  },
  types: {
  SettingsPage: {
    localePref: (p: any) => p.genLocalePref(),
    effectiveLocale: (p: any) => p.genEffectiveLocale(),
    freshAuthAt: (p: any) => p.genFreshAuthAt(),
    accountPendingDeletion: (p: any) => p.genAccountPendingDeletion(),
    ...SETTINGS_TEXT_RESOLVERS,
  },
  AccountPendingDeletion: {
    executesAt: (p: any) => p.genExecutesAt(),
    daysLeft: (p: any) => p.genDaysLeft(),
    accountPendingBody: (p: any) => p.genAccountPendingBody(),
    ...PENDING_DELETION_TEXT_RESOLVERS,
  },
  ExportMyDataPayload: {
    ok: (p: any) => p.genOk(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
    json: (p: any) => p.genJson(),
    filename: (p: any) => p.genFilename(),
  },
  AccountDeletionPayload: {
    ok: (p: any) => p.genOk(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
    executesAt: (p: any) => p.genExecutesAt(),
  },
  UpdateLocalePayload: {
    ok: (p: any) => p.genOk(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
    localePref: (p: any) => p.genLocalePref(),
    effectiveLocale: (p: any) => p.genEffectiveLocale(),
  },

  Viewer: {
    myLocalePref: (p: any) => p.genMyLocalePref(),
    myEffectiveLocale: (p: any) => p.genMyEffectiveLocale(),
    user: (p: any) => p.genUser(),
    guilds: (p: any) => p.genGuilds(),
    publicGuilds: (p: any) => p.genPublicGuilds(),
    guild: (p: any, { slug }: any) => p.genGuild({ slug }),
    guildAdmin: (p: any, { slug }: any) => p.genGuildAdmin({ slug }),
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

  // Guild / GuildReadOnly share field implementations (read-only types just
  // mount no write-entry components; the data is public anyway). GuildLocked
  // resolves only slug and locked-page text, no content fields. memberRoster
  // is registered only on full Guild: GuildReadOnly / GuildLocked lack the
  // field in the schema — roster permission is expressed by response type.
  },
};
