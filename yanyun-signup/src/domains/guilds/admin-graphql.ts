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
import { updateTenantProfile, updateTenantWebhook, updateTenantRecruitOpen } from './tenants.ts';
import {
  getWhiteLabelSettings, getEffectiveWhiteLabelSettings, setWhiteLabelSettings, ogAccentOption,
  sanitizeOgTitleSuffix, OG_ACCENT_PALETTE,
} from './whitelabel.ts';
import {
  listEventsAdmin, listSignupsByEvent, listResultsByEvent, fmtMs,
  getEventRow, getEventIdByTenant, getEventRowByTenant, insertEvent,
  updateEventFields, deleteEventCascade, getSignupTenant, deleteSignupById,
  insertResult, getResultIdOwnedByTenant, deleteResultById,
  notifyDiscord, parseTimeMs, utcToText, nudgeReminderHub,
  getReminderOffsets, getReminderCustomText, serializeReminderOffsets,
  sanitizeReminderCustomText, REMINDER_OFFSET_PRESETS,
  listLotteries, getLotteryByTenant, listLotteryEntries, listLotteryWinners,
  insertLottery, insertLotteryEntry, insertLotteryWinner, markLotteryDrawn,
  drawWinners,
} from '../groupings/index.ts';
import { listGuildMembers, getGuildMember } from '../identity/index.ts';
import { getGuildNick } from '../identity/auth.ts';
import { upsertGuildMember } from '../groupings/index.ts';
import {
  listApplicationsByTenant, getApplicationByTenant, reviewApplication,
  listMentorIds, insertMentor, deleteMentor,
  listPairingsByTenant, getPairingByTenant, getActivePairingForMentee,
  insertPairing, endPairing, computeNewcomerChecklist,
} from './recruit.ts';
import {
  RecruitApplicationShell, MentorPairingShell, RecruitMemberShell, NewcomerProgressShell,
} from './recruit-graphql.ts';
import { listSchoolBis, listSchoolRotations, upsertSchoolBis, upsertSchoolRotation } from '../dex/index.ts';
import {
  premiumGate, isPaygateEnabled, getEffectiveEntitlement,
  PREMIUM_PLANS, PAST_DUE_GRACE_DAYS,
  stripeConfig, fetchStripePrice, createCheckoutSession,
} from '../platform/index.ts';
import { computeGuildStats } from './stats.ts';
import { announcementPageForAdmin } from './announcements-graphql.ts';
import { SeasonChecklistShell, GuildRosterShell } from './season-graphql.ts';
import { officerPageForAdmin } from './officer-graphql.ts';
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
  __typename = 'GuildAdminStats';
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

/* ---------------- premium (billing) sub shells ----------------
 * Composed by GuildAdminShell.genPremium / genStats from the
 * entitlement verdict (platform billing service): the response type
 * is the gate — no plan state is ever shipped as a flag for the
 * client to judge. */

/* One tier of the pricing panel: name and subtitle localized from
 * the guildAdmin string section (its zh source and en translations
 * carry the settled theme-B names), the monthly price formatted
 * from the backend plan catalog (PREMIUM_PLANS) through the price
 * pattern. Composed ONLY on the GuildAdminPremiumLocked variant —
 * the pricing surface itself — never on a feature's tier-locked
 * shell, and the whole premium field is null while the paygate
 * master switch is OFF, so no price is served in production until
 * the switch opens. */
export class GuildAdminPremiumTierPlanShell extends ShellBase {
  __typename = 'GuildAdminPremiumTierPlan';
  genTier(){ return this.data.tier; }
  genName(){ return this.t(`guildAdmin_premiumTier${this.data.tier}Name`); }
  genSubtitle(){ return this.t(`guildAdmin_premiumTier${this.data.tier}Subtitle`); }
  genPriceLabel(){
    let amount: string;
    try {
      amount = new Intl.NumberFormat(this.locale, { style: 'currency', currency: 'USD' }).format(this.data.priceMonthlyCents / 100);
    } catch {
      amount = `$${(this.data.priceMonthlyCents / 100).toFixed(2)}`;
    }
    return this.t('guildAdmin_premiumPriceMonth', { amount });
  }
}

export class GuildAdminPremiumActiveShell extends ShellBase {
  __typename = 'GuildAdminPremiumActive';
  /* The plan label names the guild's actual tier (backend-composed
   * from the same tier-name strings the pricing panel serves);
   * the legacy 'premium' plan keeps its historical label. */
  genPremiumPlanLabel(){
    return this.data.tier >= 1 && this.data.tier <= 3 && this.data.plan !== 'premium'
      ? this.t(`guildAdmin_premiumTier${this.data.tier}Name`)
      : this.t('guildAdmin_premiumPlanName');
  }
  genPremiumSourceText(){
    return this.t(this.data.source === 'stripe'
      ? 'guildAdmin_premiumSourceStripe'
      : this.data.source === 'trial'
        ? 'guildAdmin_premiumSourceTrial'
        : 'guildAdmin_premiumSourceManual');
  }
  /* Past-due grace notice: composed only while the stored Stripe
   * entitlement is marked past due (the read-time judgement in the
   * billing service decides the fact; this shell just renders it). */
  genPremiumPastDueText(){
    return this.data.pastDue
      ? this.t('guildAdmin_premiumPastDueNotice', { days: PAST_DUE_GRACE_DAYS })
      : null;
  }
  genPremiumPeriodEndText(){
    const end = this.data.currentPeriodEnd;
    if (end == null) return null;
    const tz = this.ctx.tz || 'Asia/Shanghai';
    const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: tz };
    let fmt: Intl.DateTimeFormat;
    try { fmt = new Intl.DateTimeFormat(this.locale, opts); }
    catch { fmt = new Intl.DateTimeFormat('zh-CN', { ...opts, timeZone: 'Asia/Shanghai' }); }
    return this.t('guildAdmin_premiumPeriodEnd', { date: fmt.format(new Date(end * 1000)) });
  }
}

export class GuildAdminPremiumLockedShell extends ShellBase {
  __typename = 'GuildAdminPremiumLocked';
  genPremiumTitle(){ return this.t('guildAdmin_premiumLockedTitle'); }
  genPremiumBody(){ return this.t('guildAdmin_premiumLockedBody'); }
  genPremiumCheckoutLabel(){ return this.t('guildAdmin_premiumCheckoutButton'); }
  /* Price slot: composed ONLY from the price object Stripe returns
   * for the configured price id — null when Stripe is not
   * configured (or unreachable), in which case the coming-soon
   * text occupies the slot instead. No amount is ever invented
   * client- or server-side. */
  async genPremiumPriceLabel(){
    const cfg = stripeConfig(this.ctx.env);
    if (!cfg) return null;
    const price = await fetchStripePrice(cfg).catch(() => null);
    if (!price) return null;
    let amount: string;
    try {
      amount = new Intl.NumberFormat(this.locale, { style: 'currency', currency: price.currency }).format(price.unitAmount / 100);
    } catch {
      amount = `${(price.unitAmount / 100).toFixed(2)} ${price.currency.toUpperCase()}`;
    }
    return this.t(price.interval === 'year' ? 'guildAdmin_premiumPriceYear' : 'guildAdmin_premiumPriceMonth', { amount });
  }
  async genPremiumComingSoonText(){
    return stripeConfig(this.ctx.env) ? null : this.t('guildAdmin_premiumComingSoon');
  }
  /* The settled three-tier pricing, composed from the backend plan
   * catalog. This Locked variant exists only when the paygate
   * master switch is ON (see GuildAdminShell.genPremium), which is
   * what keeps prices out of production while the switch is OFF. */
  genPremiumTierPlans(){
    return PREMIUM_PLANS.map((p) => new GuildAdminPremiumTierPlanShell(this.ctx, {
      tier: p.tier, priceMonthlyCents: p.priceMonthlyCents,
    }));
  }
}

export class GuildAdminStatsLockedShell extends ShellBase {
  __typename = 'GuildAdminStatsLocked';
  genPremiumTitle(){ return this.t('guildAdmin_premiumLockedTitle'); }
  genPremiumBody(){ return this.t('guildAdmin_premiumLockedBody'); }
}

/* ---------------- white-label sub shell (server-issued OG accent options) ---------------- */

export class GuildAdminOgAccentOptionShell extends ShellBase {
  genKey(){ return this.data.key; }
  genHex(){ return this.data.hex; }
  genLabel(){ return this.t('guildAdmin_' + this.data.labelField); }
}

/* ---------------- activity tools sub shells (F8 + F21) ----------------
 * Free features: no entitlement gate anywhere on this surface. The
 * lottery shell composes its list from the groupings repositories;
 * times render server-side in the viewer's timezone, like the stats
 * week labels. */

export class GuildAdminLotteryEntryShell extends ShellBase {
  genDiscordId(){ return this.data.discord_id || ''; }
  genDisplayName(){ return this.data.display_name || ''; }
  genWeight(){ return this.data.weight || 1; }
}

export class GuildAdminLotteryShell extends ShellBase {
  genId(){ return String(this.data.id); }
  genTitle(){ return this.data.title || ''; }
  genPrize(){ return this.data.prize || ''; }
  genSource(){ return this.data.source === 'grouping' ? 'GROUPING' : 'MEMBERS'; }
  genSourceEventId(){ return this.data.source_event_id != null ? String(this.data.source_event_id) : null; }
  genWinnerCount(){ return this.data.winner_count || 1; }
  genStatus(){ return this.data.status === 'drawn' ? 'DRAWN' : 'OPEN'; }
  genEntries(){
    return this.memo('entries', async () => {
      const rows = await listLotteryEntries(this.db, this.data.id);
      return rows.map((r) => new GuildAdminLotteryEntryShell(this.ctx, r));
    });
  }
  genWinners(){
    return this.memo('winners', async () => {
      const rows = await listLotteryWinners(this.db, this.data.id);
      // A winner's displayed weight is their frozen entry weight.
      const entries = await listLotteryEntries(this.db, this.data.id);
      const weightOf = new Map(entries.map((e) => [e.discord_id, e.weight]));
      return rows.map((r) => new GuildAdminLotteryEntryShell(this.ctx, {
        ...r, weight: weightOf.get(r.discord_id) ?? 1,
      }));
    });
  }
  async genEntryCountText(){
    const entries = await this.genEntries();
    return this.t('guildAdmin_lotteryEntryCount', { count: entries.length });
  }
  async genSourceEventTitle(){
    if (this.data.source !== 'grouping' || this.data.source_event_id == null) return null;
    const ev = await getEventRow(this.db, this.data.source_event_id).catch(() => null);
    return ev && ev.tenant === this.data.tenant ? (ev.title || '') : null;
  }
  genCreatedAtText(){
    return this.data.created_at ? fmtStartsAt(this.data.created_at, this.locale, this.ctx.tz) : '';
  }
  genDrawnAtText(){
    return this.data.drawn_at ? fmtStartsAt(this.data.drawn_at, this.locale, this.ctx.tz) : null;
  }
}

export class GuildAdminLotteryMemberShell extends ShellBase {
  genDiscordId(){ return this.data.discord_id; }
  genDisplayName(){ return this.data.nick || this.data.global_name || ''; }
}

/* ---------------- the admin shell ---------------- */

const ADMIN_TEXT_SPEC: [string, string][] = [
  ['adminTitle', 'guildAdmin_title'],
  ['adminBackLinkLabel', 'guildAdmin_backLink'],
  ['adminTabProfileLabel', 'guildAdmin_tabProfile'],
  ['adminTabDiscordLabel', 'guildAdmin_tabDiscord'],
  ['adminTabEventsLabel', 'guildAdmin_tabEvents'],
  ['adminTabGuidesLabel', 'guildAdmin_tabGuides'],
  ['adminTabAnnouncementsLabel', 'guildAdmin_tabAnnouncements'],
  ['adminTabOfficerLabel', 'guildAdmin_tabOfficer'],
  ['adminSaveLabel', 'guildAdmin_saveButton'],
  ['adminSavedText', 'guildAdmin_savedText'],
  ['adminDeleteLabel', 'guildAdmin_deleteButton'],
  ['adminEditLabel', 'guildAdmin_editButton'],
  ['adminAddLabel', 'guildAdmin_addButton'],
  ['adminProfileTitle', 'guildAdmin_profileTitle'],
  ['adminNameLabel', 'guildAdmin_nameLabel'],
  ['adminAnnouncementLabel', 'guildAdmin_announcementLabel'],
  ['adminSloganLabel', 'guildAdmin_sloganLabel'],
  ['adminMasterNameLabel', 'guildAdmin_masterNameLabel'],
  ['adminLogoUrlLabel', 'guildAdmin_logoUrlLabel'],
  ['adminBgImageUrlLabel', 'guildAdmin_bgImageUrlLabel'],
  ['adminAvatarTitle', 'guildAdmin_avatarTitle'],
  ['adminAvatarUploadLabel', 'guildAdmin_avatarUpload'],
  ['adminAvatarReplaceLabel', 'guildAdmin_avatarReplace'],
  ['adminAvatarDeleteLabel', 'guildAdmin_avatarDelete'],
  ['adminAvatarNoneText', 'guildAdmin_avatarNone'],
  ['adminAvatarHint', 'guildAdmin_avatarHint'],
  ['adminDiscordTitle', 'guildAdmin_discordTitle'],
  ['adminWebhookLabel', 'guildAdmin_webhookLabel'],
  ['adminWebhookUnsetText', 'guildAdmin_webhookUnset'],
  ['adminWebhookHint', 'guildAdmin_webhookHint'],
  ['adminWebhookClearLabel', 'guildAdmin_webhookClear'],
  ['adminGuildIdLabel', 'guildAdmin_guildIdLabel'],
  ['adminGuildIdUnboundText', 'guildAdmin_guildIdUnbound'],
  ['adminReminderTitle', 'guildAdmin_reminderTitle'],
  ['adminReminderOffsetsLabel', 'guildAdmin_reminderOffsetsLabel'],
  ['adminReminderOffsetTemplate', 'guildAdmin_reminderOffsetOption'],
  ['adminReminderCustomTextLabel', 'guildAdmin_reminderCustomTextLabel'],
  ['adminReminderCustomTextHint', 'guildAdmin_reminderCustomTextHint'],
  ['adminVisibilityTitle', 'guildAdmin_visibilityTitle'],
  ['adminDevOnlyLabel', 'guildAdmin_devOnlyLabel'],
  ['adminEventsTitle', 'guildAdmin_eventsTitle'],
  ['adminSignupCsvSuffix', 'guildAdmin_signupCsvSuffix'],
  ['adminEventEmptyText', 'guildAdmin_eventEmpty'],
  ['adminEventTitleLabel', 'guildAdmin_eventTitleLabel'],
  ['adminEventTypeLabel', 'guildAdmin_eventTypeLabel'],
  ['adminEventStatusLabel', 'guildAdmin_eventStatusLabel'],
  ['adminEventTimeLabel', 'guildAdmin_eventTimeLabel'],
  ['adminEventSlotsLabel', 'guildAdmin_eventSlotsLabel'],
  ['adminEventMeetLabel', 'guildAdmin_eventMeetLabel'],
  ['adminEventDescLabel', 'guildAdmin_eventDescLabel'],
  ['adminEventDungeonLabel', 'guildAdmin_eventDungeonLabel'],
  ['adminTypeActivityText', 'groupingType_tabActivity'],
  ['adminTypeTalentText', 'groupingType_tabTalent'],
  ['adminTypeRaceText', 'groupingType_tabRace'],
  ['adminTypeTowerText', 'groupingType_tabTower'],
  ['adminStatusOpenText', 'guildAdmin_statusOpen'],
  ['adminStatusClosedText', 'guildAdmin_statusClosed'],
  ['adminStatusCompletedText', 'guildAdmin_statusCompleted'],
  ['adminStatusDraftText', 'guildAdmin_statusDraft'],
  ['adminSignupsTitle', 'guildAdmin_signupsTitle'],
  ['adminSignupEmptyText', 'guildAdmin_signupEmpty'],
  ['adminExportCsvLabel', 'guildAdmin_exportCsvButton'],
  ['adminRemoveSignupLabel', 'guildAdmin_removeSignupButton'],
  ['adminResultsTitle', 'guildAdmin_resultsTitle'],
  ['adminResultTeamLabel', 'guildAdmin_resultTeamLabel'],
  ['adminResultMembersLabel', 'guildAdmin_resultMembersLabel'],
  ['adminResultTimeLabel', 'guildAdmin_resultTimeLabel'],
  ['adminResultProofLabel', 'guildAdmin_resultProofLabel'],
  ['adminResultNoteLabel', 'guildAdmin_resultNoteLabel'],
  ['adminGuidesTitle', 'guildAdmin_guidesTitle'],
  ['adminGuidesHint', 'guildAdmin_guidesHint'],
  ['adminGuideSchoolLabel', 'guildAdmin_guideSchoolLabel'],
  ['adminGuideBuildLabel', 'guildAdmin_guideBuildLabel'],
  ['adminGuideAttrLabel', 'guildAdmin_guideAttrLabel'],
  ['adminGuideRateLabel', 'guildAdmin_guideRateLabel'],
  ['adminGuideBisLabel', 'guildAdmin_guideBisLabel'],
  ['adminGuideRotationLabel', 'guildAdmin_guideRotationLabel'],
  ['adminTabStatsLabel', 'guildAdmin_tabStats'],
  ['adminTabSeasonLabel', 'guildAdmin_tabSeason'],
  ['adminStatsTitle', 'guildAdmin_statsTitle'],
  ['adminStatsCurrentWeekLabel', 'guildAdmin_statsCurrentWeek'],
  ['adminStatsCarsLabel', 'guildAdmin_statsCars'],
  ['adminStatsCompletedLabel', 'guildAdmin_statsCompleted'],
  ['adminStatsSeatsLabel', 'guildAdmin_statsSeats'],
  ['adminStatsFillRateLabel', 'guildAdmin_statsFillRate'],
  ['adminStatsParticipantsLabel', 'guildAdmin_statsParticipants'],
  ['adminStatsPerCapitaLabel', 'guildAdmin_statsPerCapita'],
  ['adminStatsMembersTitle', 'guildAdmin_statsMembersTitle'],
  ['adminStatsLeadersTitle', 'guildAdmin_statsLeadersTitle'],
  ['adminStatsSeatCountLabel', 'guildAdmin_statsSeatCount'],
  ['adminStatsCarCountLabel', 'guildAdmin_statsCarCount'],
  ['adminStatsEmptyText', 'guildAdmin_statsEmpty'],
  ['adminStatsBoardEmptyText', 'guildAdmin_statsBoardEmpty'],
  ['adminBillingSuccessText', 'guildAdmin_billingSuccess'],
  ['adminPremiumTitle', 'guildAdmin_premiumActiveTitle'],
  ['adminBillingCanceledText', 'guildAdmin_billingCanceled'],
  ['adminWhiteLabelTitle', 'guildAdmin_whiteLabelTitle'],
  ['adminHideBrandingLabel', 'guildAdmin_hideBrandingLabel'],
  ['adminHideBrandingHint', 'guildAdmin_hideBrandingHint'],
  ['adminOgAccentLabel', 'guildAdmin_ogAccentLabel'],
  ['adminOgTitleSuffixLabel', 'guildAdmin_ogTitleSuffixLabel'],
  ['adminOgTitleSuffixHint', 'guildAdmin_ogTitleSuffixHint'],
  ['adminTabToolsLabel', 'guildAdmin_tabTools'],
  ['adminLotteryTitle', 'guildAdmin_lotteryTitle'],
  ['adminLotteryHint', 'guildAdmin_lotteryHint'],
  ['adminLotteryEmptyText', 'guildAdmin_lotteryEmpty'],
  ['adminLotteryNameLabel', 'guildAdmin_lotteryNameLabel'],
  ['adminLotteryPrizeLabel', 'guildAdmin_lotteryPrizeLabel'],
  ['adminLotterySourceLabel', 'guildAdmin_lotterySourceLabel'],
  ['adminLotterySourceGroupingText', 'guildAdmin_lotterySourceGrouping'],
  ['adminLotterySourceMembersText', 'guildAdmin_lotterySourceMembers'],
  ['adminLotteryGroupingLabel', 'guildAdmin_lotteryGroupingLabel'],
  ['adminLotteryWinnerCountLabel', 'guildAdmin_lotteryWinnerCountLabel'],
  ['adminLotteryUniformWeightLabel', 'guildAdmin_lotteryUniformWeightLabel'],
  ['adminLotteryWeightLabel', 'guildAdmin_lotteryWeightLabel'],
  ['adminLotteryEntriesLabel', 'guildAdmin_lotteryEntriesLabel'],
  ['adminLotteryWinnersLabel', 'guildAdmin_lotteryWinnersLabel'],
  ['adminLotteryCreateLabel', 'guildAdmin_lotteryCreateButton'],
  ['adminLotteryDrawLabel', 'guildAdmin_lotteryDrawButton'],
  ['adminLotteryStatusOpenText', 'guildAdmin_lotteryStatusOpen'],
  ['adminLotteryStatusDrawnText', 'guildAdmin_lotteryStatusDrawn'],
  ['adminTabRecruitLabel', 'guildAdmin_tabRecruit'],
  ['adminRecruitApplicationsTitle', 'recruit_adminApplicationsTitle'],
  ['adminRecruitApplicationsEmptyText', 'recruit_adminApplicationsEmpty'],
  ['adminRecruitApproveLabel', 'recruit_adminApproveButton'],
  ['adminRecruitRejectLabel', 'recruit_adminRejectButton'],
  ['adminRecruitMentorPoolTitle', 'recruit_adminMentorPoolTitle'],
  ['adminRecruitSetMentorLabel', 'recruit_adminSetMentorButton'],
  ['adminRecruitUnsetMentorLabel', 'recruit_adminUnsetMentorButton'],
  ['adminRecruitPairingsTitle', 'recruit_adminPairingsTitle'],
  ['adminRecruitPairingsEmptyText', 'recruit_adminPairingsEmpty'],
  ['adminRecruitPairingCreateLabel', 'recruit_adminPairingCreateButton'],
  ['adminRecruitPairingEndLabel', 'recruit_adminPairingEndButton'],
  ['adminRecruitMentorSelectLabel', 'recruit_adminMentorSelectLabel'],
  ['adminRecruitMenteeSelectLabel', 'recruit_adminMenteeSelectLabel'],
  ['adminRecruitNewcomersTitle', 'recruit_adminNewcomersTitle'],
  ['adminRecruitNewcomersEmptyText', 'recruit_adminNewcomersEmpty'],
  ['adminRecruitOpenLabel', 'recruit_adminRecruitOpenLabel'],
  ['adminRecruitOpenHint', 'recruit_adminRecruitOpenHint'],
  ['adminRecruitProfileLabel', 'recruit_itemProfileLabel'],
  ['adminRecruitMentorLabel', 'recruit_itemMentorLabel'],
  ['adminRecruitFirstRunLabel', 'recruit_itemFirstRunLabel'],
];

const ADMIN_LOCKED_TEXT_SPEC: [string, string][] = [
  ['adminLockedTitle', 'guildAdmin_lockedTitle'],
  ['adminLockedBody', 'guildAdmin_lockedBody'],
  ['adminBackLinkLabel', 'guildAdmin_backLink'],
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
    return this.t('guildAdmin_webhookSet', { id: this.genReminderWebhookId() || '' });
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
  /* Announcements (F9/F10/F18): the admin variant of the announcement
   * page — compose form copy, remaining daily quota and per-post read
   * receipts. Only on the GuildAdmin type: GuildAdminLocked never
   * resolves it, the verdict is the type. */
  genAnnouncements(){ return announcementPageForAdmin(this.ctx, this.genSlug()); }
  /* Season surface (F23 checklist + F25 roster): free features,
   * composed in season-graphql.ts; shells are lazy like every other
   * admin field, so unselected season data costs nothing. */
  genSeasonChecklist(){ return new SeasonChecklistShell(this.ctx, { slug: this.genSlug() }); }
  genRoster(){ return new GuildRosterShell(this.ctx, { slug: this.genSlug() }); }
  /* Officer tools (F12/F11/F19, free — no gate): member notes, the
   * guild data export and the season-goal overview, composed as one
   * page object. Only on the GuildAdmin type, like announcements. */
  genOfficer(){ return officerPageForAdmin(this.ctx, this.genSlug()); }
  genStats(){
    return this.memo('stats', async () => {
      // Premium read gate: gated guilds get the locked variant —
      // the computed stats are never even produced for them.
      if (await premiumGate(this.db, this.genSlug())) return new GuildAdminStatsLockedShell(this.ctx, {});
      return new GuildAdminStatsShell(this.ctx, await computeGuildStats(this.db, this.genSlug()));
    });
  }
  /* Premium surface: null while the paygate master switch is OFF
   * (the admin surface then composes exactly as it did before
   * billing existed — no plan name and no price is served at all);
   * with the switch ON, the entitlement verdict picks the Active /
   * Locked variant. Active covers every live entitlement: the
   * legacy premium plan, a tiered plan, a trial, and a past-due
   * Stripe plan inside its grace window (its tier still reads
   * above 0 and pastDue rides along for the notice). */
  genPremium(){
    return this.memo('premium', async () => {
      if (!(await isPaygateEnabled(this.db))) return null;
      const eff = await getEffectiveEntitlement(this.db, this.genSlug());
      if (eff.tier > 0) {
        return new GuildAdminPremiumActiveShell(this.ctx, {
          source: eff.source, currentPeriodEnd: eff.currentPeriodEnd,
          plan: eff.plan, tier: eff.tier, pastDue: eff.pastDue,
        });
      }
      return new GuildAdminPremiumLockedShell(this.ctx, {});
    });
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
  /* Platform subdomain (white-label tier A) deliberately has NO
   * fields on this shell: the switch is platform-operated from the
   * hub and the capability stays invisible to tenants until the
   * Premium launch — no status, no addresses, no copy here. */
  /* The admin page is one of this guild's pages: when branding is
   * hidden, the site shell must not show the platform footer here
   * either (same composition rule as the member-facing Guild shell). */
  async genPageFooterDisclaimerText(){
    const wl = await getEffectiveWhiteLabelSettings(this.db, this.genSlug());
    return wl.hideBranding ? null : this.t('legal_disclaimer');
  }
  /* Activity tools (F21, free — no gate). */
  genLotteries(){
    return this.memo('lotteries', async () => {
      const rows = await listLotteries(this.db, this.genSlug());
      return rows.map((r) => new GuildAdminLotteryShell(this.ctx, r));
    });
  }
  genLotteryRoster(){
    return this.memo('lotteryRoster', async () => {
      const rows = await listGuildMembers(this.db, this.genSlug());
      return rows.map((r) => new GuildAdminLotteryMemberShell(this.ctx, r));
    });
  }
  /* Recruitment line (F16/F17/F24, free — no gate): the review
   * queue, the pairing list, the roster with mentor designations,
   * and the newcomer checklist overview. All four live only on the
   * GuildAdmin type; every write re-runs the admin verdict in the
   * mutations below. */
  /* The recruitment switch (tenants.recruit_open, default closed):
   * only an open guild appears in the platform-home recruit
   * directory and accepts applications. The write path is
   * updateGuildRecruitOpen below. */
  genRecruitOpen(){ return Number(this.access.tenant?.recruit_open || 0) === 1; }
  genRecruitApplications(){
    return this.memo('recruitApplications', async () => {
      const rows = await listApplicationsByTenant(this.db, this.genSlug());
      return rows.map((r) => new RecruitApplicationShell(this.ctx, r));
    });
  }
  genRecruitPairings(){
    return this.memo('recruitPairings', async () => {
      const rows = await listPairingsByTenant(this.db, this.genSlug());
      return rows.map((r) => new MentorPairingShell(this.ctx, r));
    });
  }
  genRecruitRoster(){
    return this.memo('recruitRoster', async () => {
      const rows = await listGuildMembers(this.db, this.genSlug());
      const mentors = new Set(await listMentorIds(this.db, this.genSlug()));
      const out = [];
      for (const r of rows || []) {
        const displayName = String(r.nick || '').trim() || String(r.global_name || '').trim();
        if (!displayName) continue;
        out.push(new RecruitMemberShell(this.ctx, {
          discordId: String(r.discord_id), displayName, isMentor: mentors.has(String(r.discord_id)),
        }));
      }
      out.sort((a: any, b: any) => a.data.displayName.localeCompare(b.data.displayName, 'zh-Hans-CN'));
      return out;
    });
  }
  /* Newcomer overview: roster members whose derived checklist is
   * not fully done (the F24 definition of still-new), fewest items
   * done first. Members who finished everything drop off the list. */
  genNewcomerProgress(){
    return this.memo('newcomerProgress', async () => {
      const rows = await listGuildMembers(this.db, this.genSlug());
      const out = [];
      for (const r of rows || []) {
        const displayName = String(r.nick || '').trim() || String(r.global_name || '').trim();
        if (!displayName) continue;
        const facts = await computeNewcomerChecklist(this.db, this.genSlug(), String(r.discord_id));
        if (facts.allDone) continue;
        out.push(new NewcomerProgressShell(this.ctx, {
          discordId: String(r.discord_id), displayName, facts,
        }));
      }
      out.sort((a: any, b: any) => (a.data.facts.doneCount - b.data.facts.doneCount)
        || a.data.displayName.localeCompare(b.data.displayName, 'zh-Hans-CN'));
      return out.slice(0, 100);
    });
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
    announcements: (p: any) => p.genAnnouncements(),
    officer: (p: any) => p.genOfficer(),
    stats: (p: GuildAdminShell) => p.genStats(),
    premium: (p: GuildAdminShell) => p.genPremium(),
    seasonChecklist: (p: GuildAdminShell) => p.genSeasonChecklist(),
    roster: (p: GuildAdminShell) => p.genRoster(),
    whiteLabelHideBranding: (p: any) => p.genWhiteLabelHideBranding(),
    ogAccent: (p: any) => p.genOgAccent(),
    ogTitleSuffix: (p: any) => p.genOgTitleSuffix(),
    ogAccentOptions: (p: any) => p.genOgAccentOptions(),
    pageFooterDisclaimerText: (p: any) => p.genPageFooterDisclaimerText(),
    lotteries: (p: any) => p.genLotteries(),
    lotteryRoster: (p: any) => p.genLotteryRoster(),
    recruitOpen: (p: any) => p.genRecruitOpen(),
    recruitApplications: (p: any) => p.genRecruitApplications(),
    recruitPairings: (p: any) => p.genRecruitPairings(),
    recruitRoster: (p: any) => p.genRecruitRoster(),
    newcomerProgress: (p: any) => p.genNewcomerProgress(),
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
  GuildAdminStatsResult: { __resolveType: (p: any) => p.__typename },
  GuildAdminStatsLocked: {
    premiumTitle: (p: GuildAdminStatsLockedShell) => p.genPremiumTitle(),
    premiumBody: (p: GuildAdminStatsLockedShell) => p.genPremiumBody(),
  },
  GuildAdminPremiumResult: { __resolveType: (p: any) => p.__typename },
  GuildAdminPremiumActive: {
    premiumPlanLabel: (p: GuildAdminPremiumActiveShell) => p.genPremiumPlanLabel(),
    premiumSourceText: (p: GuildAdminPremiumActiveShell) => p.genPremiumSourceText(),
    premiumPeriodEndText: (p: GuildAdminPremiumActiveShell) => p.genPremiumPeriodEndText(),
    premiumPastDueText: (p: GuildAdminPremiumActiveShell) => p.genPremiumPastDueText(),
  },
  GuildAdminPremiumLocked: {
    premiumTitle: (p: GuildAdminPremiumLockedShell) => p.genPremiumTitle(),
    premiumBody: (p: GuildAdminPremiumLockedShell) => p.genPremiumBody(),
    premiumPriceLabel: (p: GuildAdminPremiumLockedShell) => p.genPremiumPriceLabel(),
    premiumComingSoonText: (p: GuildAdminPremiumLockedShell) => p.genPremiumComingSoonText(),
    premiumCheckoutLabel: (p: GuildAdminPremiumLockedShell) => p.genPremiumCheckoutLabel(),
    premiumTierPlans: (p: GuildAdminPremiumLockedShell) => p.genPremiumTierPlans(),
  },
  GuildAdminPremiumTierPlan: {
    tier: (p: GuildAdminPremiumTierPlanShell) => p.genTier(),
    name: (p: GuildAdminPremiumTierPlanShell) => p.genName(),
    subtitle: (p: GuildAdminPremiumTierPlanShell) => p.genSubtitle(),
    priceLabel: (p: GuildAdminPremiumTierPlanShell) => p.genPriceLabel(),
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
  GuildAdminLottery: {
    id: (p: GuildAdminLotteryShell) => p.genId(),
    title: (p: GuildAdminLotteryShell) => p.genTitle(),
    prize: (p: GuildAdminLotteryShell) => p.genPrize(),
    source: (p: GuildAdminLotteryShell) => p.genSource(),
    sourceEventId: (p: GuildAdminLotteryShell) => p.genSourceEventId(),
    sourceEventTitle: (p: GuildAdminLotteryShell) => p.genSourceEventTitle(),
    winnerCount: (p: GuildAdminLotteryShell) => p.genWinnerCount(),
    status: (p: GuildAdminLotteryShell) => p.genStatus(),
    entryCountText: (p: GuildAdminLotteryShell) => p.genEntryCountText(),
    createdAtText: (p: GuildAdminLotteryShell) => p.genCreatedAtText(),
    drawnAtText: (p: GuildAdminLotteryShell) => p.genDrawnAtText(),
    entries: (p: GuildAdminLotteryShell) => p.genEntries(),
    winners: (p: GuildAdminLotteryShell) => p.genWinners(),
  },
  GuildAdminLotteryEntry: {
    discordId: (p: GuildAdminLotteryEntryShell) => p.genDiscordId(),
    displayName: (p: GuildAdminLotteryEntryShell) => p.genDisplayName(),
    weight: (p: GuildAdminLotteryEntryShell) => p.genWeight(),
  },
  GuildAdminLotteryMember: {
    discordId: (p: GuildAdminLotteryMemberShell) => p.genDiscordId(),
    displayName: (p: GuildAdminLotteryMemberShell) => p.genDisplayName(),
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
  genCheckoutUrl(){ return this.data.checkoutUrl ?? null; }
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
    // Premium write gate (advanced reminder settings).
    if (await premiumGate(ctx.env.DB, g.access.slug)) return aFail(ctx, 'premiumRequired');
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
    // Premium write gate (white-label settings).
    if (await premiumGate(ctx.env.DB, g.access.slug)) return aFail(ctx, 'premiumRequired');
    const accent = String(ogAccent ?? '').trim();
    if (accent && !ogAccentOption(accent)) return aFail(ctx, 'ogAccentInvalid');
    await setWhiteLabelSettings(ctx.env.DB, g.access.slug, {
      hideBranding: !!hideBranding,
      ogAccent: accent,
      ogTitleSuffix: sanitizeOgTitleSuffix(ogTitleSuffix),
    });
    return aOk(ctx);
  },

  /* Premium checkout: creates the Stripe Checkout Session for this
   * guild and returns the hosted page URL. Refusals are catalog
   * copy keyed by stable codes — paygateDisabled (master switch
   * OFF: the offer does not exist), premiumActive (already
   * entitled), premiumComingSoon (Stripe not configured yet), and
   * checkoutFailed (Stripe refused). The webhook, not this
   * mutation, is what grants the entitlement. */
  startPremiumCheckout: async (_: any, { slug }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    if (!(await isPaygateEnabled(db))) return aFail(ctx, 'paygateDisabled');
    const eff = await getEffectiveEntitlement(db, g.access.slug);
    if (eff.plan === 'premium') return aFail(ctx, 'premiumActive');
    const cfg = stripeConfig(ctx.env);
    if (!cfg) return aFail(ctx, 'premiumComingSoon');
    let origin = '';
    try { origin = new URL(ctx.request.url).origin; } catch { /* relative fallback */ }
    try {
      const session = await createCheckoutSession(cfg, { slug: g.access.slug, origin });
      return new GuildAdminPayloadShell(ctx, { ok: true, checkoutUrl: session.url });
    } catch {
      return aFail(ctx, 'checkoutFailed');
    }
  },

  updateGuildVisibility: async (_: any, { slug, devOnly }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    await setTenantSetting(ctx.env.DB, g.access.slug, 'dev_only', devOnly ? '1' : '');
    return aOk(ctx);
  },

  /* The recruitment switch: open guilds are listed in the
   * platform-home recruit directory and accept applications;
   * closing refuses new applications (recruitClosed) and unlists
   * the guild, while pending applications stay reviewable and
   * members' newcomer entries are untouched. */
  updateGuildRecruitOpen: async (_: any, { slug, open }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    await updateTenantRecruitOpen(ctx.env.DB, g.access.slug, !!open);
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

  /* Activity lottery (F21): the participant list is frozen into
   * lottery_entries at creation. GROUPING snapshots the source car's
   * seated participants (identity = their Discord id; seats without
   * one cannot be keyed and do not enter); MEMBERS snapshots the
   * admin's hand-picked roster members with their per-person
   * weights. Weights are plain integers 1..1000 — deliberately no
   * points/attendance linkage (that is a paid-layer concern). */
  createLottery: async (_: any, { slug, input }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const title = s(input.title, 60);
    if (!title) return aFail(ctx, 'lotteryTitleRequired');
    const prize = s(input.prize, 200);
    const validWeight = (w: unknown) => {
      const n = Number(w);
      return Number.isInteger(n) && n >= 1 && n <= 1000 ? n : null;
    };
    const entries: { discordId: string; displayName: string; weight: number }[] = [];
    let sourceEventId: number | null = null;
    if (input.source === 'GROUPING') {
      const ev = await getEventRowByTenant(db, parseInt(String(input.sourceEventId || ''), 10) || 0, g.access.slug);
      if (!ev) return aFail(ctx, 'groupingNotFound');
      sourceEventId = ev.id;
      const w = validWeight(input.uniformWeight ?? 1);
      if (w == null) return aFail(ctx, 'lotteryWeightInvalid');
      const seen = new Set<string>();
      for (const seat of await listSignupsByEvent(db, ev.id)) {
        const did = seat.discord_id ? String(seat.discord_id) : '';
        if (!did || seen.has(did)) continue;
        seen.add(did);
        entries.push({ discordId: did, displayName: seat.nickname || '', weight: w });
      }
    } else {
      const roster = await listGuildMembers(db, g.access.slug);
      const byId = new Map(roster.map((m) => [String(m.discord_id), m.nick || m.global_name || '']));
      const picked = new Map<string, { discordId: string; displayName: string; weight: number }>();
      for (const e of (Array.isArray(input.entries) ? input.entries : [])) {
        const did = String(e.discordId || '');
        if (!byId.has(did)) return aFail(ctx, 'lotteryMemberNotInGuild');
        const w = validWeight(e.weight ?? 1);
        if (w == null) return aFail(ctx, 'lotteryWeightInvalid');
        picked.set(did, { discordId: did, displayName: byId.get(did) || '', weight: w });
      }
      entries.push(...picked.values());
    }
    if (!entries.length) return aFail(ctx, 'lotteryEntriesEmpty');
    const winnerCount = Number(input.winnerCount);
    if (!Number.isInteger(winnerCount) || winnerCount < 1 || winnerCount > entries.length) {
      return aFail(ctx, 'lotteryWinnerCountInvalid');
    }
    const now = Math.floor(Date.now() / 1000);
    const r = await insertLottery(db, {
      tenant: g.access.slug,
      title,
      prize,
      source: input.source === 'GROUPING' ? 'grouping' : 'members',
      source_event_id: sourceEventId,
      winner_count: winnerCount,
      status: 'open',
      created_by: ctx.user ? String(ctx.user.discordId) : '',
      created_at: now,
    });
    for (const e of entries) {
      await insertLotteryEntry(db, { lotteryId: r.last_row_id, ...e });
    }
    return aOk(ctx, { id: r.last_row_id });
  },

  /* The draw: weighted, without replacement (nobody wins twice in
   * one lottery), then the winners and the draw time are written —
   * the lottery row, its frozen entries and the winner rows are the
   * permanent record. A drawn lottery can never be drawn again. */
  drawLottery: async (_: any, { slug, lotteryId }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const lot = await getLotteryByTenant(db, parseInt(String(lotteryId), 10) || 0, g.access.slug);
    if (!lot) return aFail(ctx, 'lotteryNotFound');
    if (lot.status === 'drawn') return aFail(ctx, 'lotteryAlreadyDrawn');
    const entries = await listLotteryEntries(db, lot.id);
    if (!entries.length) return aFail(ctx, 'lotteryEntriesEmpty');
    const now = Math.floor(Date.now() / 1000);
    const winners = drawWinners(entries, lot.winner_count);
    for (const w of winners) {
      await insertLotteryWinner(db, {
        lotteryId: lot.id, discordId: w.discord_id, displayName: w.display_name, drawnAt: now,
      });
    }
    await markLotteryDrawn(db, lot.id, now);
    return aOk(ctx, { id: lot.id });
  },

  /* F16 review: settle a pending application of THIS guild. The
   * repository's still-pending guard makes the verdict final — a
   * raced second review reports applicationNotPending and changes
   * nothing. Approval's platform-side effect is roster enrollment:
   * the applicant joins guild_members (the roster every picker and
   * the newcomer overview read) with the best name the platform
   * holds — their bound-server nick snapshot when one exists (it
   * cannot, for someone not yet in the server, but a re-applicant
   * who joined in the meantime may have one), else their stored
   * global name, else the application snapshot. Nothing here touches
   * Discord: the platform has no write channel into Discord (see
   * recruit.ts), and the applicant's page states the remaining
   * Discord-side step verbatim. */
  reviewGuildApplication: async (_: any, { slug, applicationId, approve }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const app = await getApplicationByTenant(db, parseInt(String(applicationId), 10) || 0, g.access.slug);
    if (!app) return aFail(ctx, 'applicationNotFound');
    const now = Math.floor(Date.now() / 1000);
    const settled = await reviewApplication(db, app.id, g.access.slug, {
      status: approve ? 'approved' : 'rejected',
      reviewedBy: ctx.user ? ctx.user.discordId : '',
      reviewedByName: ctx.user ? String(ctx.user.name || '') : '',
      reviewedAt: now,
    });
    if (!settled.changes) return aFail(ctx, 'applicationNotPending');
    if (approve) {
      const nick = g.access.discordGuildId
        ? await getGuildNick(db, app.discord_id, g.access.discordGuildId).catch(() => null)
        : null;
      await upsertGuildMember(db, g.access.slug, app.discord_id, nick || '', app.applicant_name || '');
    }
    return aOk(ctx, { id: app.id });
  },

  /* F17 mentor designation: the target must be on this guild's
   * roster. Undesignating never touches existing pairings. */
  setGuildMentor: async (_: any, { slug, discordId, isMentor }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const target = String(discordId || '');
    if (isMentor) {
      const member = await getGuildMember(db, g.access.slug, target).catch(() => null);
      if (!member) return aFail(ctx, 'mentorNotInGuild');
      await insertMentor(db, g.access.slug, target, Math.floor(Date.now() / 1000));
    } else {
      await deleteMentor(db, g.access.slug, target);
    }
    return aOk(ctx);
  },

  /* F17 pairing creation: mentor must be designated AND on the
   * roster, mentee must be on the roster, nobody pairs with
   * themselves, and a mentee carries at most one active pairing
   * (re-pairing = end the old one first — the partial unique index
   * backstops the check). Display names snapshot from the roster. */
  createMentorPairing: async (_: any, { slug, mentorDiscordId, menteeDiscordId }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const mentorId = String(mentorDiscordId || '');
    const menteeId = String(menteeDiscordId || '');
    if (mentorId && mentorId === menteeId) return aFail(ctx, 'mentorSelfPairing');
    const mentorRow = await getGuildMember(db, g.access.slug, mentorId).catch(() => null);
    if (!mentorRow) return aFail(ctx, 'mentorNotInGuild');
    const designated = await listMentorIds(db, g.access.slug);
    if (!designated.includes(mentorId)) return aFail(ctx, 'mentorNotDesignated');
    const menteeRow = await getGuildMember(db, g.access.slug, menteeId).catch(() => null);
    if (!menteeRow) return aFail(ctx, 'menteeNotInGuild');
    const active = await getActivePairingForMentee(db, g.access.slug, menteeId).catch(() => null);
    if (active) return aFail(ctx, 'menteeAlreadyPaired');
    const nameOf = (r: { nick: string; global_name: string }) =>
      String(r.nick || '').trim() || String(r.global_name || '').trim();
    let id: number;
    try {
      id = await insertPairing(db, {
        tenant: g.access.slug,
        mentorDiscordId: mentorId, mentorName: nameOf(mentorRow),
        menteeDiscordId: menteeId, menteeName: nameOf(menteeRow),
        createdBy: ctx.user ? ctx.user.discordId : '',
        createdAt: Math.floor(Date.now() / 1000),
      });
    } catch {
      return aFail(ctx, 'menteeAlreadyPaired');
    }
    return aOk(ctx, { id });
  },

  /* F17 pairing end: settles the row (status + ended_at), never
   * deletes it — the ended pairing stays in the list as history. */
  endMentorPairing: async (_: any, { slug, pairingId }: any, ctx: Context) => {
    const g = await adminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const pairing = await getPairingByTenant(db, parseInt(String(pairingId), 10) || 0, g.access.slug);
    if (!pairing) return aFail(ctx, 'pairingNotFound');
    const ended = await endPairing(db, pairing.id, g.access.slug, Math.floor(Date.now() / 1000));
    if (!ended.changes) return aFail(ctx, 'pairingAlreadyEnded');
    return aOk(ctx, { id: pairing.id });
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
    checkoutUrl: (p: any) => p.genCheckoutUrl(),
  },
};
