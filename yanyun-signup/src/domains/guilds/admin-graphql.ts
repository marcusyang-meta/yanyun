/* guilds domain GraphQL: the guild admin surface — the GraphQL
 * replacement for the retired gadmin pages (REST shutdown batch,
 * 2026-10-26). One shell class, two __typenames: GuildAdmin carries
 * every management datum; GuildAdminLocked carries only the slug and
 * the locked-page copy (the response type is the permission verdict —
 * no permission flags anywhere). The verdict is getGuildAdminAccess:
 * Discord session + the viewer manages the bound Discord server (the
 * createGuild check). Every admin mutation re-runs the same verdict
 * server-side (see admin-mutations in this file's resolver export).
 * The system-path OmniscientViewer passes the same verdict in full
 * (all-accessible, ruling 2026-10-26): reads and mutations alike.
 *
 * Data notes:
 * - The reminder webhook URL is a secret: only its set-state and the
 *   numeric webhook id are ever read back (the hub portal's
 *   mask-after-save rule). Mutations accept replace/clear only.
 * - Event admin data (signups/results/CSV) is produced from the
 *   groupings domain through its barrel, byte-faithful to the retired
 *   REST admin views it replaces.
 * - School guides edit the same dex school_bis / school_rotations data
 *   the public sect pages read. */
import type { Context } from '../platform/context.ts';
import { vcOf } from '../platform/context.ts';
import {
  ShellBase, defineTextGens, getGuildAdminAccess, getTenantSetting,
  setTenantSetting, getGameVersion, TYPE_TO_ENUM, PayloadBase, s,
  publishGroupingEvent,
} from '../platform/graphql-base.ts';
import { fmtStartsAt } from '../platform/index.ts';
import {
  getGuildAvatarMeta, avatarPath, putGuildAvatar,
  deleteGuildAvatar as deleteGuildAvatarRepo, sniffAvatarType, AVATAR_MAX_BYTES,
} from './guildavatar.ts';
import { updateTenantProfile, updateTenantWebhook } from './tenants.ts';
import {
  getWhiteLabelSettings, setWhiteLabelSettings, ogAccentOption,
  sanitizeOgTitleSuffix, OG_ACCENT_PALETTE,
} from './whitelabel.ts';
import {
  isGuildSubdomainEnabled, setGuildSubdomainEnabled,
  guildSubdomainUrl, guildSubdomainCallbackUrl,
} from './subdomain.ts';
import {
  listEventsAdmin, listSignupsByEvent, listResultsByEvent, fmtMs,
  getEventRow, getEventIdByTenant, getEventRowByTenant, insertEvent,
  updateEventFields, deleteEventCascade, getSignupTenant, deleteSignupById,
  insertResult, getResultIdOwnedByTenant, deleteResultById,
  notifyDiscord, parseTimeMs, utcToText, nudgeReminderHub,
  getReminderOffsets, getReminderCustomText, serializeReminderOffsets,
  sanitizeReminderCustomText, REMINDER_OFFSET_PRESETS,
} from '../groupings/index.ts';
import { listSchoolBis, listSchoolRotations, upsertSchoolBis, upsertSchoolRotation } from '../dex/index.ts';
import { computeGuildStats } from './stats.ts';
import type { GuildStatsWeek, GuildStatsBoardEntry } from './stats.ts';

export async function guildAdminResult(ctx: Context, slug: string) {
  // The VC rides along so the verdict can apply the omniscient
  // doctrine (see getGuildAdminAccess).
  const access = await getGuildAdminAccess(ctx.env.DB, ctx.user, slug, ctx.request, vcOf(ctx));
  return new GuildAdminShell(ctx, access);
}

/* ---------------- sub shells (plain row carriers) ---------------- */

export class GuildAdminSignupShell extends ShellBase {
  genId(){ return String(this.data.id); }
  genNickname(){ return this.data.nickname || ''; }
  genUid(){ return this.data.uid || ''; }
  genRole(){ return this.data.role || ''; }
  genWeapon(){ return this.data.weapon || ''; }
  genContact(){ return this.data.contact || ''; }
  genTeamName(){ return this.data.team_name || ''; }
  genMembers(){ return this.data.members || ''; }
  genNote(){ return this.data.note || ''; }
  genCreatedAt(){ return this.data.created_at || ''; }
}

export class GuildAdminRaceResultShell extends ShellBase {
  genId(){ return String(this.data.id); }
  genTeamName(){ return this.data.team_name || ''; }
  genMembers(){ return this.data.members || ''; }
  genTimeMs(){ return this.data.time_ms || 0; }
  genTimeText(){ return fmtMs(this.data.time_ms || 0); }
  genProofUrl(){ return this.data.proof_url || ''; }
  genNote(){ return this.data.note || ''; }
}

const CSV_HEADER = ['昵称', 'UID', '职责', '流派/武器', '联系方式', '队伍名', '队员', '备注', '报名时间'];
function csvCell(v: any) {
  return '"' + String(v ?? '').replace(/"/g, '""') + '"';
}

export class GuildAdminEventShell extends ShellBase {
  genId(){ return String(this.data.id); }
  genTitle(){ return this.data.title || ''; }
  genType(){ return TYPE_TO_ENUM[this.data.type] || 'ACTIVITY'; }
  genStatus(){ return this.data.status || ''; }
  genOrigin(){ return this.data.origin || ''; }
  genStartsAtUtc(){ return this.data.starts_at_utc ?? null; }
  genStartsAtText(){
    return this.data.starts_at_utc ? fmtStartsAt(this.data.starts_at_utc, this.locale, this.ctx.tz) : '';
  }
  genDungeon(){ return this.data.dungeon || ''; }
  genMaxSlots(){ return this.data.max_slots || 0; }
  genMeetInfo(){ return this.data.meet_info || ''; }
  genDescription(){ return this.data.description || ''; }
  genSignupCount(){ return this.data.signup_count || 0; }
  genSignups(){
    return this.memo('signups', async () => {
      const rows = await listSignupsByEvent(this.db, this.data.id);
      return rows.map((r: any) => new GuildAdminSignupShell(this.ctx, r));
    });
  }
  genResults(){
    return this.memo('results', async () => {
      const rows = await listResultsByEvent(this.db, this.data.id);
      return rows.map((r: any) => new GuildAdminRaceResultShell(this.ctx, r));
    });
  }
  /* CSV export: byte-identical to the retired REST export.csv (BOM,
   * every cell quoted, CRLF row joins, no trailing newline), generated
   * server-side as a text field; the client only saves the file. */
  async genSignupsCsv(){
    const rows = await listSignupsByEvent(this.db, this.data.id);
    const lines = [CSV_HEADER.map(csvCell).join(',')];
    for (const r of rows as any[]) {
      lines.push([r.nickname, r.uid, r.role, r.weapon, r.contact, r.team_name, r.members, r.note, r.created_at].map(csvCell).join(','));
    }
    return '\ufeff' + lines.join('\r\n');
  }
}

export class GuildAdminSchoolBuildShell extends ShellBase {
  genBuild(){ return this.data.build || ''; }
  genAttr(){ return this.data.attr || ''; }
  genRate(){ return this.data.rate || ''; }
  genBisJson(){ return this.data.bis_json || ''; }
}

export class GuildAdminSchoolGuideShell extends ShellBase {
  genSchool(){ return this.data.school; }
  genBuilds(){ return (this.data.builds || []).map((b: any) => new GuildAdminSchoolBuildShell(this.ctx, b)); }
  genRotationJson(){ return this.data.rotation_json || ''; }
}

export class GuildAdminSchoolGuidesShell extends ShellBase {
  genSchools(){
    return this.memo('schools', async () => {
      const bis = await listSchoolBis(this.db);
      const rotations = await listSchoolRotations(this.db);
      const bySchool = new Map<string, any>();
      for (const r of bis as any[]) {
        if (!bySchool.has(r.school)) bySchool.set(r.school, { school: r.school, builds: [], rotation_json: '' });
        bySchool.get(r.school).builds.push(r);
      }
      for (const r of rotations as any[]) {
        if (!bySchool.has(r.school)) bySchool.set(r.school, { school: r.school, builds: [], rotation_json: '' });
        bySchool.get(r.school).rotation_json = r.rotation_json || '';
      }
      return [...bySchool.values()].map((g: any) => new GuildAdminSchoolGuideShell(this.ctx, g));
    });
  }
}

/* ---------------- stats sub shells (computed rows from stats.ts) ---------------- */

export class GuildAdminStatsWeekShell extends ShellBase {
  genWeekStartUtc(){ return this.data.weekStartUtc; }
  genWeekLabel(){
    const tz = this.ctx.tz || 'Asia/Shanghai';
    const opts: Intl.DateTimeFormatOptions = {
      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
      hourCycle: 'h23', timeZone: tz,
    };
    let fmt: Intl.DateTimeFormat;
    try { fmt = new Intl.DateTimeFormat(this.locale, opts); }
    catch { fmt = new Intl.DateTimeFormat('zh-CN', { ...opts, timeZone: 'Asia/Shanghai' }); }
    const part = (sec: number) => fmt.format(new Date(sec * 1000));
    // The product week label shows the actual range; the end reads
    // one minute before the next week's start (the list-page rule).
    return part(this.data.weekStartUtc) + ' – ' + part(this.data.weekEndUtc - 60);
  }
  genIsCurrent(){ return this.data.isCurrent; }
  genCarsActivity(){ return this.data.carsActivity; }
  genCarsTalent(){ return this.data.carsTalent; }
  genCarsRace(){ return this.data.carsRace; }
  genCarsTower(){ return this.data.carsTower; }
  genCarsTotal(){ return this.data.carsTotal; }
  genCompletedCount(){ return this.data.completedCount; }
  genTotalSeats(){ return this.data.totalSeats; }
  genFilledSeats(){ return this.data.filledSeats; }
  genFillRate(){ return this.data.fillRate; }
  genParticipantCount(){ return this.data.participantCount; }
  genParticipationCount(){ return this.data.participationCount; }
  genPerCapita(){ return this.data.perCapita; }
}

export class GuildAdminStatsMemberShell extends ShellBase {
  genDiscordId(){ return this.data.discordId; }
  genDisplayName(){ return this.data.displayName; }
  genSeatCount(){ return this.data.count; }
}

export class GuildAdminStatsLeaderShell extends ShellBase {
  genDiscordId(){ return this.data.discordId; }
  genDisplayName(){ return this.data.displayName; }
  genCarCount(){ return this.data.count; }
}

export class GuildAdminStatsShell extends ShellBase {
  genWeeks(){
    return this.data.weeks.map((w: GuildStatsWeek) => new GuildAdminStatsWeekShell(this.ctx, w));
  }
  genMemberLeaders(){
    return this.data.memberLeaders.map((e: GuildStatsBoardEntry) => new GuildAdminStatsMemberShell(this.ctx, e));
  }
  genLeaderLeaders(){
    return this.data.leaderLeaders.map((e: GuildStatsBoardEntry) => new GuildAdminStatsLeaderShell(this.ctx, e));
  }
}

/* ---------------- white-label sub shell (server-issued OG accent options) ---------------- */

export class GuildAdminOgAccentOptionShell extends ShellBase {
  genKey(){ return this.data.key; }
  genHex(){ return this.data.hex; }
  genLabel(){ return this.t('guildAdmin', this.data.labelField); }
}

/* ---------------- the admin shell ---------------- */

const ADMIN_TEXT_SPEC: [string, string, string][] = [
  ['adminTitle', 'guildAdmin', 'title'],
  ['adminBackLinkLabel', 'guildAdmin', 'backLink'],
  ['adminTabProfileLabel', 'guildAdmin', 'tabProfile'],
  ['adminTabDiscordLabel', 'guildAdmin', 'tabDiscord'],
  ['adminTabEventsLabel', 'guildAdmin', 'tabEvents'],
  ['adminTabGuidesLabel', 'guildAdmin', 'tabGuides'],
  ['adminSaveLabel', 'guildAdmin', 'saveButton'],
  ['adminSavedText', 'guildAdmin', 'savedText'],
  ['adminDeleteLabel', 'guildAdmin', 'deleteButton'],
  ['adminEditLabel', 'guildAdmin', 'editButton'],
  ['adminAddLabel', 'guildAdmin', 'addButton'],
  ['adminProfileTitle', 'guildAdmin', 'profileTitle'],
  ['adminNameLabel', 'guildAdmin', 'nameLabel'],
  ['adminAnnouncementLabel', 'guildAdmin', 'announcementLabel'],
  ['adminSloganLabel', 'guildAdmin', 'sloganLabel'],
  ['adminMasterNameLabel', 'guildAdmin', 'masterNameLabel'],
  ['adminLogoUrlLabel', 'guildAdmin', 'logoUrlLabel'],
  ['adminBgImageUrlLabel', 'guildAdmin', 'bgImageUrlLabel'],
  ['adminAvatarTitle', 'guildAdmin', 'avatarTitle'],
  ['adminAvatarUploadLabel', 'guildAdmin', 'avatarUpload'],
  ['adminAvatarReplaceLabel', 'guildAdmin', 'avatarReplace'],
  ['adminAvatarDeleteLabel', 'guildAdmin', 'avatarDelete'],
  ['adminAvatarNoneText', 'guildAdmin', 'avatarNone'],
  ['adminAvatarHint', 'guildAdmin', 'avatarHint'],
  ['adminDiscordTitle', 'guildAdmin', 'discordTitle'],
  ['adminWebhookLabel', 'guildAdmin', 'webhookLabel'],
  ['adminWebhookUnsetText', 'guildAdmin', 'webhookUnset'],
  ['adminWebhookHint', 'guildAdmin', 'webhookHint'],
  ['adminWebhookClearLabel', 'guildAdmin', 'webhookClear'],
  ['adminGuildIdLabel', 'guildAdmin', 'guildIdLabel'],
  ['adminGuildIdUnboundText', 'guildAdmin', 'guildIdUnbound'],
  ['adminReminderTitle', 'guildAdmin', 'reminderTitle'],
  ['adminReminderOffsetsLabel', 'guildAdmin', 'reminderOffsetsLabel'],
  ['adminReminderOffsetTemplate', 'guildAdmin', 'reminderOffsetOption'],
  ['adminReminderCustomTextLabel', 'guildAdmin', 'reminderCustomTextLabel'],
  ['adminReminderCustomTextHint', 'guildAdmin', 'reminderCustomTextHint'],
  ['adminVisibilityTitle', 'guildAdmin', 'visibilityTitle'],
  ['adminDevOnlyLabel', 'guildAdmin', 'devOnlyLabel'],
  ['adminEventsTitle', 'guildAdmin', 'eventsTitle'],
  ['adminEventEmptyText', 'guildAdmin', 'eventEmpty'],
  ['adminEventTitleLabel', 'guildAdmin', 'eventTitleLabel'],
  ['adminEventTypeLabel', 'guildAdmin', 'eventTypeLabel'],
  ['adminEventStatusLabel', 'guildAdmin', 'eventStatusLabel'],
  ['adminEventTimeLabel', 'guildAdmin', 'eventTimeLabel'],
  ['adminEventSlotsLabel', 'guildAdmin', 'eventSlotsLabel'],
  ['adminEventMeetLabel', 'guildAdmin', 'eventMeetLabel'],
  ['adminEventDescLabel', 'guildAdmin', 'eventDescLabel'],
  ['adminEventDungeonLabel', 'guildAdmin', 'eventDungeonLabel'],
  ['adminTypeActivityText', 'groupingType', 'tabActivity'],
  ['adminTypeTalentText', 'groupingType', 'tabTalent'],
  ['adminTypeRaceText', 'groupingType', 'tabRace'],
  ['adminTypeTowerText', 'groupingType', 'tabTower'],
  ['adminStatusOpenText', 'guildAdmin', 'statusOpen'],
  ['adminStatusClosedText', 'guildAdmin', 'statusClosed'],
  ['adminStatusCompletedText', 'guildAdmin', 'statusCompleted'],
  ['adminStatusDraftText', 'guildAdmin', 'statusDraft'],
  ['adminSignupsTitle', 'guildAdmin', 'signupsTitle'],
  ['adminSignupEmptyText', 'guildAdmin', 'signupEmpty'],
  ['adminExportCsvLabel', 'guildAdmin', 'exportCsvButton'],
  ['adminRemoveSignupLabel', 'guildAdmin', 'removeSignupButton'],
  ['adminResultsTitle', 'guildAdmin', 'resultsTitle'],
  ['adminResultTeamLabel', 'guildAdmin', 'resultTeamLabel'],
  ['adminResultMembersLabel', 'guildAdmin', 'resultMembersLabel'],
  ['adminResultTimeLabel', 'guildAdmin', 'resultTimeLabel'],
  ['adminResultProofLabel', 'guildAdmin', 'resultProofLabel'],
  ['adminResultNoteLabel', 'guildAdmin', 'resultNoteLabel'],
  ['adminGuidesTitle', 'guildAdmin', 'guidesTitle'],
  ['adminGuidesHint', 'guildAdmin', 'guidesHint'],
  ['adminGuideSchoolLabel', 'guildAdmin', 'guideSchoolLabel'],
  ['adminGuideBuildLabel', 'guildAdmin', 'guideBuildLabel'],
  ['adminGuideAttrLabel', 'guildAdmin', 'guideAttrLabel'],
  ['adminGuideRateLabel', 'guildAdmin', 'guideRateLabel'],
  ['adminGuideBisLabel', 'guildAdmin', 'guideBisLabel'],
  ['adminGuideRotationLabel', 'guildAdmin', 'guideRotationLabel'],
  ['adminTabStatsLabel', 'guildAdmin', 'tabStats'],
  ['adminStatsTitle', 'guildAdmin', 'statsTitle'],
  ['adminStatsCurrentWeekLabel', 'guildAdmin', 'statsCurrentWeek'],
  ['adminStatsCarsLabel', 'guildAdmin', 'statsCars'],
  ['adminStatsCompletedLabel', 'guildAdmin', 'statsCompleted'],
  ['adminStatsSeatsLabel', 'guildAdmin', 'statsSeats'],
  ['adminStatsFillRateLabel', 'guildAdmin', 'statsFillRate'],
  ['adminStatsParticipantsLabel', 'guildAdmin', 'statsParticipants'],
  ['adminStatsPerCapitaLabel', 'guildAdmin', 'statsPerCapita'],
  ['adminStatsMembersTitle', 'guildAdmin', 'statsMembersTitle'],
  ['adminStatsLeadersTitle', 'guildAdmin', 'statsLeadersTitle'],
  ['adminStatsSeatCountLabel', 'guildAdmin', 'statsSeatCount'],
  ['adminStatsCarCountLabel', 'guildAdmin', 'statsCarCount'],
  ['adminStatsEmptyText', 'guildAdmin', 'statsEmpty'],
  ['adminStatsBoardEmptyText', 'guildAdmin', 'statsBoardEmpty'],
  ['adminWhiteLabelTitle', 'guildAdmin', 'whiteLabelTitle'],
  ['adminHideBrandingLabel', 'guildAdmin', 'hideBrandingLabel'],
  ['adminHideBrandingHint', 'guildAdmin', 'hideBrandingHint'],
  ['adminOgAccentLabel', 'guildAdmin', 'ogAccentLabel'],
  ['adminOgTitleSuffixLabel', 'guildAdmin', 'ogTitleSuffixLabel'],
  ['adminOgTitleSuffixHint', 'guildAdmin', 'ogTitleSuffixHint'],
  ['adminSubdomainTitle', 'guildAdmin', 'subdomainTitle'],
  ['adminSubdomainLabel', 'guildAdmin', 'subdomainLabel'],
  ['adminSubdomainAddressLabel', 'guildAdmin', 'subdomainAddressLabel'],
  ['adminSubdomainCallbackLabel', 'guildAdmin', 'subdomainCallbackLabel'],
  ['adminSubdomainNote', 'guildAdmin', 'subdomainNote'],
];

const ADMIN_LOCKED_TEXT_SPEC: [string, string, string][] = [
  ['adminLockedTitle', 'guildAdmin', 'lockedTitle'],
  ['adminLockedBody', 'guildAdmin', 'lockedBody'],
  ['adminBackLinkLabel', 'guildAdmin', 'backLink'],
];

export class GuildAdminShell extends ShellBase {
  __typename: string;
  constructor(ctx: Context, access: any){
    super(ctx, access);
    this.__typename = access.isAdmin ? 'GuildAdmin' : 'GuildAdminLocked';
  }
  get access() { return this.data; }
  genSlug(){ return this.access.tenant ? this.access.tenant.slug : this.access.slug; }
  /* --- GuildAdmin content (never resolved on the Locked type) --- */
  genName(){ return this.access.tenant.guild_name; }
  genAnnouncement(){ return this.access.tenant.announcement || ''; }
  genSlogan(){ return this.access.tenant.slogan || ''; }
  genMasterName(){ return this.access.tenant.master_name || ''; }
  genLogoUrl(){ return this.access.tenant.logo_url || ''; }
  genBgImageUrl(){ return this.access.tenant.bg_image_url || ''; }
  genAvatarMeta(){
    return this.memo('avatarMeta', () => getGuildAvatarMeta(this.db, this.genSlug()).catch(() => null));
  }
  async genAvatarUrl(){
    const meta = await this.genAvatarMeta();
    if (!meta) return null;
    let origin = '';
    try { origin = new URL(this.ctx.request.url).origin; } catch { /* relative fallback */ }
    return origin + avatarPath(this.genSlug(), meta.hash);
  }
  async genAvatarUpdatedAt(){
    const meta = await this.genAvatarMeta();
    return meta ? String(meta.updatedAt) : null;
  }
  genDiscordGuildId(){ return this.access.discordGuildId || ''; }
  genReminderWebhookSet(){ return !!(this.access.tenant.discord_webhook || '').trim(); }
  genReminderWebhookId(){
    const m = /webhooks\/(\d+)\//.exec(this.access.tenant.discord_webhook || '');
    return m ? m[1] : null;
  }
  genAdminWebhookSetText(){
    return this.t('guildAdmin', 'webhookSet', { id: this.genReminderWebhookId() || '' });
  }
  /* Advanced reminders: configured lead offsets (default [10] when
   * unset) and the custom embed line ('' = none). */
  async genReminderOffsets(){
    return getReminderOffsets(this.db, this.genSlug());
  }
  async genReminderCustomText(){
    return getReminderCustomText(this.db, this.genSlug());
  }
  genDevOnly(){ return !!this.access.devOnly; }
  genGameVersion(){ return this.ctxMemo('gameVersion', () => getGameVersion(this.db)); }
  genEvents(){
    return this.memo('events', async () => {
      const rows = await listEventsAdmin(this.db, this.genSlug());
      return rows.map((r: any) => new GuildAdminEventShell(this.ctx, r));
    });
  }
  genSchoolGuides(){ return new GuildAdminSchoolGuidesShell(this.ctx, {}); }
  genStats(){
    return this.memo('stats', async () => new GuildAdminStatsShell(this.ctx, await computeGuildStats(this.db, this.genSlug())));
  }
  /* White-label+ (Premium tier 1): branding toggle + share-card
   * customization. All three live in tenant settings (whitelabel.ts);
   * the admin surface is the only read/write path — member-facing
   * shells receive only the composed chrome copy, never these raw
   * settings. */
  genWhiteLabel(){
    return this.memo('whiteLabel', () => getWhiteLabelSettings(this.db, this.genSlug()));
  }
  async genWhiteLabelHideBranding(){
    return (await this.genWhiteLabel()).hideBranding;
  }
  async genOgAccent(){
    return (await this.genWhiteLabel()).ogAccent;
  }
  async genOgTitleSuffix(){
    return (await this.genWhiteLabel()).ogTitleSuffix;
  }
  genOgAccentOptions(){
    return OG_ACCENT_PALETTE.map((o) => new GuildAdminOgAccentOptionShell(this.ctx, o));
  }
  /* Platform subdomain (white-label tier A): the opt-in switch plus
   * the server-composed addresses — clients display them verbatim
   * and never build hostnames themselves. The login-callback caveat
   * rides along as copy (adminSubdomainNote), not as client logic. */
  async genSubdomainEnabled(){
    return isGuildSubdomainEnabled(this.db, this.genSlug());
  }
  genSubdomainUrl(){
    return guildSubdomainUrl(this.genSlug());
  }
  genSubdomainCallbackUrl(){
    return guildSubdomainCallbackUrl(this.genSlug());
  }
  /* The admin page is one of this guild's pages: when branding is
   * hidden, the site shell must not show the platform footer here
   * either (same composition rule as the member-facing Guild shell). */
  async genPageFooterDisclaimerText(){
    const wl = await this.genWhiteLabel();
    return wl.hideBranding ? null : this.t('legal', 'disclaimer');
  }
}

export const GUILD_ADMIN_TEXT_RESOLVERS = defineTextGens(GuildAdminShell, ADMIN_TEXT_SPEC);
export const GUILD_ADMIN_LOCKED_TEXT_RESOLVERS = defineTextGens(GuildAdminShell, ADMIN_LOCKED_TEXT_SPEC);

function contentResolvers() {
  return {
    slug: (p: any) => p.genSlug(),
    name: (p: any) => p.genName(),
    announcement: (p: any) => p.genAnnouncement(),
    slogan: (p: any) => p.genSlogan(),
    masterName: (p: any) => p.genMasterName(),
    logoUrl: (p: any) => p.genLogoUrl(),
    bgImageUrl: (p: any) => p.genBgImageUrl(),
    avatarUrl: (p: any) => p.genAvatarUrl(),
    avatarUpdatedAt: (p: any) => p.genAvatarUpdatedAt(),
    discordGuildId: (p: any) => p.genDiscordGuildId(),
    reminderWebhookSet: (p: any) => p.genReminderWebhookSet(),
    reminderWebhookId: (p: any) => p.genReminderWebhookId(),
    adminWebhookSetText: (p: any) => p.genAdminWebhookSetText(),
    reminderOffsets: (p: any) => p.genReminderOffsets(),
    reminderCustomText: (p: any) => p.genReminderCustomText(),
    devOnly: (p: any) => p.genDevOnly(),
    gameVersion: (p: any) => p.genGameVersion(),
    events: (p: any) => p.genEvents(),
    schoolGuides: (p: any) => p.genSchoolGuides(),
    stats: (p: GuildAdminShell) => p.genStats(),
    whiteLabelHideBranding: (p: any) => p.genWhiteLabelHideBranding(),
    ogAccent: (p: any) => p.genOgAccent(),
    ogTitleSuffix: (p: any) => p.genOgTitleSuffix(),
    ogAccentOptions: (p: any) => p.genOgAccentOptions(),
    subdomainEnabled: (p: any) => p.genSubdomainEnabled(),
    subdomainUrl: (p: any) => p.genSubdomainUrl(),
    subdomainCallbackUrl: (p: any) => p.genSubdomainCallbackUrl(),
    pageFooterDisclaimerText: (p: any) => p.genPageFooterDisclaimerText(),
  };
}

export const guildAdminTypes = {
  GuildAdminResult: { __resolveType: (p: any) => p.__typename },
  GuildAdmin: { ...contentResolvers(), ...GUILD_ADMIN_TEXT_RESOLVERS },
  GuildAdminLocked: {
    slug: (p: any) => p.genSlug(),
    ...GUILD_ADMIN_LOCKED_TEXT_RESOLVERS,
  },
  GuildAdminEvent: {
    id: (p: any) => p.genId(), title: (p: any) => p.genTitle(), type: (p: any) => p.genType(),
    status: (p: any) => p.genStatus(), origin: (p: any) => p.genOrigin(),
    startsAtUtc: (p: any) => p.genStartsAtUtc(), startsAtText: (p: any) => p.genStartsAtText(),
    dungeon: (p: any) => p.genDungeon(), maxSlots: (p: any) => p.genMaxSlots(),
    meetInfo: (p: any) => p.genMeetInfo(), description: (p: any) => p.genDescription(),
    signupCount: (p: any) => p.genSignupCount(), signups: (p: any) => p.genSignups(),
    results: (p: any) => p.genResults(), signupsCsv: (p: any) => p.genSignupsCsv(),
  },
  GuildAdminSignup: {
    id: (p: any) => p.genId(), nickname: (p: any) => p.genNickname(), uid: (p: any) => p.genUid(),
    role: (p: any) => p.genRole(), weapon: (p: any) => p.genWeapon(), contact: (p: any) => p.genContact(),
    teamName: (p: any) => p.genTeamName(), members: (p: any) => p.genMembers(),
    note: (p: any) => p.genNote(), createdAt: (p: any) => p.genCreatedAt(),
  },
  GuildAdminRaceResult: {
    id: (p: any) => p.genId(), teamName: (p: any) => p.genTeamName(), members: (p: any) => p.genMembers(),
    timeMs: (p: any) => p.genTimeMs(), timeText: (p: any) => p.genTimeText(),
    proofUrl: (p: any) => p.genProofUrl(), note: (p: any) => p.genNote(),
  },
  GuildAdminSchoolGuides: { schools: (p: any) => p.genSchools() },
  GuildAdminSchoolGuide: {
    school: (p: any) => p.genSchool(), builds: (p: any) => p.genBuilds(),
    rotationJson: (p: any) => p.genRotationJson(),
  },
  GuildAdminSchoolBuild: {
    build: (p: any) => p.genBuild(), attr: (p: any) => p.genAttr(),
    rate: (p: any) => p.genRate(), bisJson: (p: any) => p.genBisJson(),
  },
  GuildAdminStats: {
    weeks: (p: GuildAdminStatsShell) => p.genWeeks(),
    memberLeaders: (p: GuildAdminStatsShell) => p.genMemberLeaders(),
    leaderLeaders: (p: GuildAdminStatsShell) => p.genLeaderLeaders(),
  },
  GuildAdminStatsWeek: {
    weekStartUtc: (p: GuildAdminStatsWeekShell) => p.genWeekStartUtc(),
    weekLabel: (p: GuildAdminStatsWeekShell) => p.genWeekLabel(),
    isCurrent: (p: GuildAdminStatsWeekShell) => p.genIsCurrent(),
    carsActivity: (p: GuildAdminStatsWeekShell) => p.genCarsActivity(),
    carsTalent: (p: GuildAdminStatsWeekShell) => p.genCarsTalent(),
    carsRace: (p: GuildAdminStatsWeekShell) => p.genCarsRace(),
    carsTower: (p: GuildAdminStatsWeekShell) => p.genCarsTower(),
    carsTotal: (p: GuildAdminStatsWeekShell) => p.genCarsTotal(),
    completedCount: (p: GuildAdminStatsWeekShell) => p.genCompletedCount(),
    totalSeats: (p: GuildAdminStatsWeekShell) => p.genTotalSeats(),
    filledSeats: (p: GuildAdminStatsWeekShell) => p.genFilledSeats(),
    fillRate: (p: GuildAdminStatsWeekShell) => p.genFillRate(),
    participantCount: (p: GuildAdminStatsWeekShell) => p.genParticipantCount(),
    participationCount: (p: GuildAdminStatsWeekShell) => p.genParticipationCount(),
    perCapita: (p: GuildAdminStatsWeekShell) => p.genPerCapita(),
  },
  GuildAdminStatsMember: {
    discordId: (p: GuildAdminStatsMemberShell) => p.genDiscordId(),
    displayName: (p: GuildAdminStatsMemberShell) => p.genDisplayName(),
    seatCount: (p: GuildAdminStatsMemberShell) => p.genSeatCount(),
  },
  GuildAdminStatsLeader: {
    discordId: (p: GuildAdminStatsLeaderShell) => p.genDiscordId(),
    displayName: (p: GuildAdminStatsLeaderShell) => p.genDisplayName(),
    carCount: (p: GuildAdminStatsLeaderShell) => p.genCarCount(),
  },
  GuildAdminOgAccentOption: {
    key: (p: GuildAdminOgAccentOptionShell) => p.genKey(),
    hex: (p: GuildAdminOgAccentOptionShell) => p.genHex(),
    label: (p: GuildAdminOgAccentOptionShell) => p.genLabel(),
  },
};

/* ---------------- admin mutations ----------------
 * Every mutation re-runs getGuildAdminAccess server-side; the client
 * is never trusted. Validation order and field caps mirror the
 * retired REST handlers they replace. The gate passes the VC through
 * to the same verdict the read path uses: under the omniscient
 * doctrine a system-path VC passes in full, while session callers are
 * judged on their stored server row exactly as before. */

export class GuildAdminPayloadShell extends PayloadBase {
  genAvatarUrl(){ return this.data.avatarUrl ?? null; }
  genId(){ return this.data.id != null ? String(this.data.id) : null; }
}
const aOk = (ctx: Context, extra: any = {}) => new GuildAdminPayloadShell(ctx, { ok: true, ...extra });
const aFail = (ctx: Context, code: string) => new GuildAdminPayloadShell(ctx, { ok: false, errorCode: code });

async function adminGate(ctx: Context, slug: string) {
  const a = await getGuildAdminAccess(ctx.env.DB, ctx.user, slug, ctx.request, vcOf(ctx));
  if (!a.exists) return { fail: aFail(ctx, 'guildNotFound') };
  if (!a.isAdmin) return { fail: aFail(ctx, 'adminOnly') };
  return { access: a };
}

const ENUM_TO_TYPE: Record<string, string> = { ACTIVITY: 'activity', TALENT: 'talent', RACE: 'race', TOWER: 'tower' };
const WEBHOOK_RE = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
const DGID_RE = /^\d{5,25}$/;

function nudgeHub(ctx: Context, slug: string) {
  try {
    nudgeReminderHub({ env: ctx.env, executionCtx: ctx.executionCtx || { waitUntil: () => {} } }, slug);
  } catch { /* best-effort, same as REST */ }
}

export const guildAdminMutations = {
  updateGuildProfile: async (_: any, { slug, input }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const t = g.access.tenant;
    const name = input.name != null ? s(input.name, 20) : t.guild_name;
    if (String(name).trim().length < 2) return aFail(ctx, 'guildNameShort');
    await updateTenantProfile(ctx.env.DB, g.access.slug, {
      guildName: name,
      announcement: input.announcement != null ? s(input.announcement, 200) : (t.announcement || ''),
      slogan: input.slogan != null ? s(input.slogan, 50) : (t.slogan || ''),
      masterName: input.masterName != null ? s(input.masterName, 20) : (t.master_name || ''),
      logoUrl: input.logoUrl != null ? s(input.logoUrl, 300) : (t.logo_url || ''),
      bgImageUrl: input.bgImageUrl != null ? s(input.bgImageUrl, 300) : (t.bg_image_url || ''),
    });
    return aOk(ctx);
  },

  updateGuildDiscord: async (_: any, { slug, input }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    let webhookChanged = false;
    if (input.webhook != null) {
      const w = String(input.webhook).trim();
      if (w && !WEBHOOK_RE.test(w)) return aFail(ctx, 'webhookInvalid');
      await updateTenantWebhook(db, g.access.slug, w);
      webhookChanged = true;
    }
    if (input.discordGuildId != null) {
      const d = String(input.discordGuildId).trim();
      if (d && !DGID_RE.test(d)) return aFail(ctx, 'discordIdInvalid');
      await setTenantSetting(db, g.access.slug, 'discord_guild_id', d);
    }
    if (webhookChanged) nudgeHub(ctx, g.access.slug);
    return aOk(ctx);
  },

  /* Advanced reminder settings: multi-select lead offsets (subset
   * of the presets; empty = no beats) + the custom embed line.
   * Always nudges the hub — the alarm schedule depends on these. */
  updateGuildReminderSettings: async (_: any, { slug, offsets, customText }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const list = Array.isArray(offsets) ? offsets.map((n: any) => Number(n)) : [];
    if (list.some((n: number) => !REMINDER_OFFSET_PRESETS.includes(n))) return aFail(ctx, 'reminderOffsetsInvalid');
    await setTenantSetting(db, g.access.slug, 'reminder_offsets', serializeReminderOffsets(list));
    if (customText != null) {
      await setTenantSetting(db, g.access.slug, 'reminder_custom_text', sanitizeReminderCustomText(customText));
    }
    nudgeHub(ctx, g.access.slug);
    return aOk(ctx);
  },

  /* White-label+: branding toggle + OG share-card accent (palette
   * key only — free-form colors are rejected) + title suffix. */
  updateGuildWhiteLabel: async (_: any, { slug, hideBranding, ogAccent, ogTitleSuffix }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const accent = String(ogAccent ?? '').trim();
    if (accent && !ogAccentOption(accent)) return aFail(ctx, 'ogAccentInvalid');
    await setWhiteLabelSettings(ctx.env.DB, g.access.slug, {
      hideBranding: !!hideBranding,
      ogAccent: accent,
      ogTitleSuffix: sanitizeOgTitleSuffix(ogTitleSuffix),
    });
    return aOk(ctx);
  },

  /* Platform subdomain (white-label tier A): flip the opt-in. The
   * host gate reads the same setting, so the subdomain starts (or
   * stops) resolving with this write — no deploy step in between. */
  updateGuildSubdomain: async (_: any, { slug, enabled }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    await setGuildSubdomainEnabled(ctx.env.DB, g.access.slug, !!enabled);
    return aOk(ctx);
  },

  updateGuildVisibility: async (_: any, { slug, devOnly }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    await setTenantSetting(ctx.env.DB, g.access.slug, 'dev_only', devOnly ? '1' : '');
    return aOk(ctx);
  },

  setGuildAvatar: async (_: any, { slug, dataBase64 }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const raw = String(dataBase64 || '').replace(/^data:[^,]*,/, '').replace(/\s+/g, '');
    if (!raw) return aFail(ctx, 'avatarEmpty');
    // Bound the work before decoding: base64 inflates by 4/3.
    if (raw.length > Math.ceil(AVATAR_MAX_BYTES / 3) * 4 + 4) return aFail(ctx, 'avatarTooLarge');
    let bytes: Uint8Array;
    try {
      const bin = atob(raw);
      bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    } catch { return aFail(ctx, 'avatarDataInvalid'); }
    if (bytes.length > AVATAR_MAX_BYTES) return aFail(ctx, 'avatarTooLarge');
    if (!bytes.length) return aFail(ctx, 'avatarEmpty');
    const type = sniffAvatarType(bytes);
    if (!type) return aFail(ctx, 'avatarBadType');
    const meta = await putGuildAvatar(db, g.access.slug, type, bytes);
    let origin = '';
    try { origin = new URL(ctx.request.url).origin; } catch { /* relative fallback */ }
    return aOk(ctx, { avatarUrl: origin + avatarPath(g.access.slug, meta.hash) });
  },

  deleteGuildAvatar: async (_: any, { slug }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    await deleteGuildAvatarRepo(ctx.env.DB, g.access.slug);
    return aOk(ctx);
  },

  createAdminEvent: async (_: any, { slug, input }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const title = s(input.title, 60);
    if (!title) return aFail(ctx, 'titleRequired');
    const type = ENUM_TO_TYPE[input.type] || 'activity';
    const utc = input.startsAtUtc != null ? (parseInt(String(input.startsAtUtc), 10) || 0) : 0;
    const maxSlots = Math.max(1, Math.min(500, parseInt(String(input.maxSlots ?? ''), 10) || 20));
    const ev = {
      tenant: g.access.slug,
      title,
      type,
      description: s(input.description, 2000),
      starts_at: utc ? utcToText(utc) : null,
      starts_at_utc: utc || null,
      // Deliberate parity-plus vs the retired REST admin create (which
      // never set a dungeon): an admin-created talent/race car without
      // a dungeon is crippled, so the GraphQL surface accepts one.
      dungeon: (type === 'talent' || type === 'race') ? s(input.dungeon, 50) : '',
      max_slots: maxSlots,
      meet_info: s(input.meetInfo, 200),
      status: input.status === 'closed' ? 'closed' : 'open',
      origin: 'admin',
    };
    const r = await insertEvent(db, ev);
    const notice = notifyDiscord(ctx.env, g.access.slug, {
      title, type, description: ev.description, starts_at_utc: utc || null, max_slots: maxSlots,
    }).catch(() => {});
    if (ctx.executionCtx && typeof ctx.executionCtx.waitUntil === 'function') ctx.executionCtx.waitUntil(notice);
    publishGroupingEvent(ctx, g.access.slug, r.last_row_id, 'created');
    return aOk(ctx, { id: r.last_row_id });
  },

  updateAdminEvent: async (_: any, { slug, eventId, input }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const owned = await getEventRowByTenant(db, parseInt(eventId, 10), g.access.slug);
    if (!owned) return aFail(ctx, 'groupingNotFound');
    const fields: Record<string, unknown> = {};
    if (input.title != null) fields.title = s(input.title, 60);
    if (input.type != null && ENUM_TO_TYPE[input.type]) fields.type = ENUM_TO_TYPE[input.type];
    if (input.description != null) fields.description = s(input.description, 2000);
    if ('startsAtUtc' in (input || {})) {
      const utc = input.startsAtUtc != null ? parseInt(String(input.startsAtUtc), 10) : null;
      fields.starts_at_utc = utc;
      fields.starts_at = utc ? utcToText(utc) : null;
    }
    if (input.meetInfo != null) fields.meet_info = s(input.meetInfo, 200);
    if (input.maxSlots != null) fields.max_slots = Math.max(1, Math.min(500, parseInt(String(input.maxSlots), 10) || 20));
    if (input.status != null) fields.status = input.status === 'closed' ? 'closed' : 'open';
    if (input.dungeon != null) fields.dungeon = s(input.dungeon, 50);
    if (!Object.keys(fields).length) return aFail(ctx, 'noFieldsToUpdate');
    await updateEventFields(db, owned.id, g.access.slug, fields);
    publishGroupingEvent(ctx, g.access.slug, owned.id, 'updated');
    return aOk(ctx);
  },

  deleteAdminEvent: async (_: any, { slug, eventId }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const owned = await getEventIdByTenant(db, parseInt(eventId, 10), g.access.slug);
    if (!owned) return aFail(ctx, 'groupingNotFound');
    await deleteEventCascade(db, owned.id, g.access.slug);
    publishGroupingEvent(ctx, g.access.slug, owned.id, 'deleted');
    return aOk(ctx);
  },

  removeEventSignup: async (_: any, { slug, signupId }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const owned = await getSignupTenant(db, parseInt(signupId, 10), g.access.slug);
    if (!owned) return aFail(ctx, 'signupNotFound');
    await deleteSignupById(db, owned.id);
    return aOk(ctx);
  },

  addEventResult: async (_: any, { slug, eventId, input }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const ev = await getEventIdByTenant(db, parseInt(eventId, 10), g.access.slug);
    if (!ev) return aFail(ctx, 'groupingNotFound');
    const teamName = String(input.teamName || '').trim();
    if (!teamName) return aFail(ctx, 'resultTeamRequired');
    const timeMs = parseTimeMs(input.timeText);
    if (timeMs == null) return aFail(ctx, 'resultTimeInvalid');
    const r = await insertResult(db, {
      eventId: ev.id, teamName,
      members: String(input.members || ''), timeMs,
      proofUrl: String(input.proofUrl || ''), note: String(input.note || ''),
    });
    return aOk(ctx, { id: r.last_row_id });
  },

  deleteEventResult: async (_: any, { slug, resultId }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const owned = await getResultIdOwnedByTenant(db, parseInt(resultId, 10), g.access.slug);
    if (!owned) return aFail(ctx, 'resultNotFound');
    await deleteResultById(db, owned.id);
    return aOk(ctx);
  },

  updateSchoolGuide: async (_: any, { slug, input }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const school = s(input.school, 30);
    if (!school) return aFail(ctx, 'schoolRequired');
    if (input.build != null) {
      const build = s(input.build, 60);
      if (!build) return aFail(ctx, 'paramsIncomplete');
      await upsertSchoolBis(db, {
        school, build,
        attr: String(input.attr || ''), rate: String(input.rate || ''),
        bisJson: String(input.bisJson || ''),
      });
    }
    if (input.rotationJson != null) {
      await upsertSchoolRotation(db, { school, rotationJson: String(input.rotationJson) });
    }
    return aOk(ctx);
  },
};

/* Payload type resolvers (registered with the admin types). */
export const guildAdminPayloadResolvers = {
  GuildAdminPayload: {
    ok: (p: any) => p.genOk(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
    avatarUrl: (p: any) => p.genAvatarUrl(),
    id: (p: any) => p.genId(),
  },
};
