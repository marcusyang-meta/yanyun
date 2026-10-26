import { ensureEventCreatorColumn as ensureEventCreatorColumnRepo } from './events.ts';
/* groupings domain GraphQL: grouping shells, list/detail pages, and all grouping mutations. */
import {
  clampBlocksVersion, substituteForVersion, weekWindowUtc, startsAtEpoch,
  fmtStartsAt, groupByLocalDay, TYPE_SHORT_KEY, HEALER_SECT,
} from '../platform/index.ts';
import { tlCalculateExcel } from '../gear/index.ts';
import { getUserServers, getGuildNick, maybeRefreshGuildNicks, getUserLocalePref, setUserLocalePref } from '../identity/auth.ts';
import { ensureSignupDiscordColumn, ensureGuildMembersTable, upsertGuildMember } from './index.ts';
import { ensurePushTokensTable, isValidPushToken, savePushToken, deletePushToken } from '../platform/index.ts';
import { evaluateHeirloomPushes } from '../gear/index.ts';
import { translate, negotiateLocale, SUPPORTED_LOCALES, CATALOG } from '../platform/index.ts';
import { logError } from '../platform/index.ts';
import { getGuildAvatarMeta, avatarPath } from '../guilds/index.ts';
import { getSettingValue, setSettingValue, listSettingsByKey } from '../guilds/index.ts';
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
} from '../guilds/index.ts';
import {
  getEventRow, getEventTenant, getEventTenantCreator, listEventsByTenantType,
  insertEvent, updateEventFields, setEventStatus, deleteEventCascade,
} from './index.ts';
import {
  listSignupSeats, listSignupSeatsBasic, listSignupNamesStamps,
  insertSignups, insertSignupWithCapacityGuard, deleteSignupByEventUid, deleteSignupsByEvent,
  updateSignupWeaponRoleByUid,
} from './index.ts';
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
import { BannerBlockShell, EmptyStateBlockShell, SectionHeaderBlockShell, NavigateActionShell, GroupingCardBlockShell, FallbackBlockShell, TextBlockShell, ChipRowBlockShell, SectionBlockShell, SeatGridBlockShell, SpacerBlockShell, ActionButtonBlockShell, UncompleteActionShell, EditActionShell, DisbandActionShell, CompleteActionShell, SeatEntryShell } from '../platform/index.ts';
import { DungeonShell } from '../dex/index.ts';
import { selfStampFor, identityNamesFor, canonicalSignupName } from '../identity/index.ts';

export class GroupingShell extends ShellBase {
  constructor(ctx: any, ev: any){ super(ctx, ev); }
  get ev() { return this.data; }
  genId(){ return String(this.ev.id); }
  genTitle(){ return this.ev.title; }
  genType(){ return TYPE_TO_ENUM[this.ev.type] || 'ACTIVITY'; }
  genStartsAt(){ return this.ev.starts_at_utc ? String(this.ev.starts_at_utc) : (this.ev.starts_at || ''); }
  genStatus(){ return this.ev.status || 'open'; }
  genMaxSlots(){ return this.ev.max_slots; }
  genCreatorDiscordId(){ return this.ev.creator_discord_id ? String(this.ev.creator_discord_id) : null; }
  genSeatRows(){
    return this.memo('seatRows', async () => {
      return listSignupSeatsBasic(this.db, this.ev.id);
    });
  }
  genSeats(){
    return this.memo('seats', async () => {
      const rows = await this.genSeatRows();
      const seats = [];
      for (let i = 0; i < this.ev.max_slots; i++) {
        const r = rows[i];
        seats.push(r ? {
          index: i, nickname: r.nickname, weapon: enSectName(this.locale, r.weapon),
          role: r.role === '奶' || r.role === '治疗' ? this.t('seat', 'roleHealer') : this.t('seat', 'roleDps'),
          uid: r.uid, occupied: true,
        } : { index: i, nickname: null, weapon: null, role: null, uid: null, occupied: false });
      }
      return seats;
    });
  }
  genOccupiedCount(){
    return this.memo('occupiedCount', async () => (await this.genSeatRows()).length);
  }
  genDungeon(){
    return this.memo('dungeon', async () => {
      if (!this.ev.dungeon) return null;
      await ensureDungeonDexColumnsRepo(this.db);
      const d = await getDungeonByName(this.db, this.ev.dungeon);
      return d ? new DungeonShell(this.ctx, d) : null;
    });
  }
}

export function toGrouping(ctx: any, ev: any) {
  return new GroupingShell(ctx, ev);
}

// Parse 1-x/2-x talent rows from guide text (accepts real newlines and literal \n sequences).

export function ensureEventCreatorColumn(db: any) {
  return ensureEventCreatorColumnRepo(db);
}

/* ---------- Seat identity stamp (signups.discord_id) ----------
 * Stamped only when the signed-in user signs up for themselves and
 * the submitted nickname matches their own identity (the form's
 * prefilled value: their nickname snapshot on the guild's bound
 * server, or their global name) — only then may departure
 * reminders @ them precisely. Signing up someone else (their
 * name) is never stamped: that would @ the wrong person. When
 * unsure, don't stamp; sending falls back to roster/nickname
 * unique matching. */
// Identity names of a Discord user in one server's context (global name + that server's nickname).

export function touchGuildRoster(ctx: any, access: any) {
  const run = (async () => {
    try {
      const user = ctx.user;
      if (!user || !user.discordId || !access || !access.exists || !access.canView) return;
      const db = ctx.env.DB;
      const slug = access.tenant.slug;
      const dgid = access.discordGuildId || '';
      let nick = '';
      if (dgid) {
        const n = await getGuildNick(db, user.discordId, dgid).catch(() => null);
        if (n) nick = String(n).trim();
      }
      let globalName = String(user.name || '').trim();
      const u = await getUsernameRow(db, String(user.discordId)).catch(() => null);
      if (u && String(u.username || '').trim()) globalName = String(u.username).trim();
      await ensureGuildMembersTable(db);
      await upsertGuildMember(db, slug, user.discordId, nick, globalName);
    } catch { /* roster recording failures are silent */ }
  })();
  if (ctx.executionCtx && typeof ctx.executionCtx.waitUntil === 'function') {
    ctx.executionCtx.waitUntil(run);
  }
  return run;
}

export class GroupingListPageShell extends ShellBase {
  constructor(ctx: any, slug: any, tab: any){ super(ctx, { slug, tab }); }
  // Mobile Bloks-lite: block tree for this page's content area, composed per viewer (access decides nav params and empty states), then substituted by the client's blocksVersion.
  async genBlocks({ blocksVersion, weekOffset }: any = {}){
    const v = clampBlocksVersion(blocksVersion);
    const wo = Number.isFinite(weekOffset) ? weekOffset | 0 : 0;
    return this.memo(`blocks:${v}:${wo}`, async () => {
      const access = await getGuildAccess(this.db, this.ctx.user, this.data.slug, this.ctx.request);
      const tRow = await getTenantRow(this.db, access.slug).catch(() => null);
      let viewerNick = null;
      if (this.ctx.user && access.bound && access.discordGuildId) {
        viewerNick = await getGuildNick(this.db, this.ctx.user.discordId, access.discordGuildId).catch(() => null);
      }
      const [ws, we] = weekWindowUtc(wo);
      const shells = await this.genGroupings();
      const blocks = [];
      if (tRow && tRow.announcement) blocks.push(new BannerBlockShell(this.ctx, { text: tRow.announcement }));
      const inWeek = shells.filter((g: any) => {
        const ts = startsAtEpoch(g.ev);
        return ts != null && ts >= ws && ts < we;
      });
      if (!inWeek.length) {
        blocks.push(new EmptyStateBlockShell(this.ctx, {
          textRef: access.canWrite ? ['groupingList', 'emptyInteractive'] : ['groupingList', 'emptyReadonly'],
        }));
      } else {
        // Grouped by natural day in the viewer's local timezone within one
        // screen (one week): the header is a SectionHeaderBlock with its
        // text fully composed here from the catalog template — clients
        // neither reorder nor compose copy. Groups ascend by date,
        // groupings by start time. Timeless groupings never enter the
        // mobile week (ts != null), so there is no undated group.
        const items = inWeek.map((g: any) => ({ g, ts: startsAtEpoch(g.ev) }));
        for (const group of groupByLocalDay(items, this.ctx.tz)) {
          const p = group.parts;
          blocks.push(new SectionHeaderBlockShell(this.ctx, {
            text: this.t('groupingList', 'dayGroupHeader', {
              month: p.month, day: p.day, weekday: this.t('groupingList', 'weekday' + p.weekday),
            }),
          }));
          for (const { g } of group.items) {
            const nav = new NavigateActionShell(this.ctx, {
              slug: access.slug, groupingId: g.genId(), name: tRow ? tRow.guild_name : access.slug,
              readOnly: !access.canWrite, nick: viewerNick || '',
            });
            blocks.push(new GroupingCardBlockShell(this.ctx, { g, occupied: await g.genOccupiedCount(), action: nav }));
          }
        }
      }
      return substituteForVersion(blocks, v, () => new FallbackBlockShell(this.ctx));
    });
  }
  async genGroupings(){
    return this.memo('groupings', async () => {
      const type = TAB_TO_TYPE[this.data.tab] || 'activity';
      // completed, like draft, appears in no list: a completed grouping opens only via a direct detail link. closed stays listed (it merely closed signups) — a separate state from completed.
      const results = await listEventsByTenantType(this.db, s(this.data.slug, 40), type);
      return results.map((ev: any) => new GroupingShell(this.ctx, ev));
    });
  }
  // Weekday short names (index 0 = Sunday, aligned with JS getDay and the server's localDayParts): fills the {weekday} slot in web group-header templates; the whole table is generated per locale.
  genWeekdayNames(){
    return this.memo('weekdayNames', () => [0, 1, 2, 3, 4, 5, 6].map((i: any) => this.t('groupingList', 'weekday' + i)));
  }
  genCurrentVersion(){
    return this.ctxMemo('gameVersion', () => getGameVersion(this.db));
  }
}

// Grouping list data entry (shared by groupingListPage and Guild.groupings; gating is the caller's job).
export function groupingListPage(ctx: any, slug: any, tab: any) {
  return new GroupingListPageShell(ctx, slug, tab);
}

// Create/edit form copy spec (shared by the list-page and detail-page shells, same names, same meaning).
export const FORM_TEXT_SPEC = [
  ['formCreateTitle', 'groupingForm', 'createTitle'],
  ['formEditTitle', 'groupingForm', 'editTitle'],
  ['formTypeLabel', 'groupingForm', 'typeLabel'],
  ['formTypeActivityLabel', 'groupingType', 'tabActivity'],
  ['formTypeTalentLabel', 'groupingType', 'tabTalent'],
  ['formTypeRaceLabel', 'groupingType', 'tabRace'],
  ['formTypeTowerLabel', 'groupingType', 'tabTower'],
  ['formCapacityTemplate', 'groupingForm', 'capacity'],
  ['formHintActivity', 'groupingForm', 'hintActivity'],
  ['formHintDungeonTemplate', 'groupingForm', 'hintDungeon'],
  ['formHintTalent', 'groupingForm', 'hintTalent'],
  ['formHintRace', 'groupingForm', 'hintRace'],
  ['formHintTower', 'groupingForm', 'hintTower'],
  ['formTitleLabel', 'groupingForm', 'titleLabel'],
  ['formTitlePlaceholder', 'groupingForm', 'titlePlaceholder'],
  ['formStartsLabel', 'groupingForm', 'startsLabel'],
  ['formMonthTemplate', 'groupingForm', 'monthOption'],
  ['formDayTemplate', 'groupingForm', 'dayOption'],
  ['formHourTemplate', 'groupingForm', 'hourOption'],
  ['formMinuteTemplate', 'groupingForm', 'minuteOption'],
  ['formDungeonLabel', 'groupingForm', 'dungeonLabel'],
  ['formDungeonNoneLabel', 'groupingForm', 'dungeonNone'],
  ['formNicknameLabel', 'groupingForm', 'nicknameLabel'],
  ['formNicknamePlaceholder', 'groupingForm', 'nicknamePlaceholder'],
  ['formSectLabel', 'groupingForm', 'sectLabel'],
  ['formCancelLabel', 'common', 'cancel'],
  ['formSubmitCreateLabel', 'groupingForm', 'submitCreate'],
  ['formSubmitEditLabel', 'groupingForm', 'submitEdit'],
  ['formSubmittingLabel', 'groupingForm', 'submitting'],
  ['formToastSect', 'groupingForm', 'toastSect'],
  ['formToastSaved', 'groupingForm', 'toastSaved'],
  ['formToastSaveFailedTemplate', 'groupingForm', 'toastSaveFailed'],
  ['formToastPosted', 'groupingForm', 'toastPosted'],
  ['formToastCreateFailedTemplate', 'groupingForm', 'toastCreateFailed'],
  ['formTitleTemplate', 'groupingForm', 'titleTemplate'],
];
export const TYPE_SHORT_SPEC = [
  ['typeShortActivity', 'groupingType', 'shortActivity'],
  ['typeShortTalent', 'groupingType', 'shortTalent'],
  ['typeShortRace', 'groupingType', 'shortRace'],
  ['typeShortTower', 'groupingType', 'shortTower'],
  ['typeShortGather', 'groupingType', 'shortGather'],
  ['typeShortExplore', 'groupingType', 'shortExplore'],
];
export const LIST_TEXT_RESOLVERS = {
  ...defineTextGens(GroupingListPageShell, [
    ['tabActivityLabel', 'groupingType', 'tabActivity'],
    ['tabTalentLabel', 'groupingType', 'tabTalent'],
    ['tabRaceLabel', 'groupingType', 'tabRace'],
    ['tabTowerLabel', 'groupingType', 'tabTower'],
    ...TYPE_SHORT_SPEC,
    ['prevWeekLabel', 'groupingList', 'prevWeek'],
    ['nextWeekLabel', 'groupingList', 'nextWeek'],
    ['weekHeaderTemplate', 'groupingList', 'weekHeader'],
    ['dayGroupHeaderTemplate', 'groupingList', 'dayGroupHeader'],
    ['undatedGroupLabel', 'groupingList', 'undatedGroup'],
    ['emptyInteractiveText', 'groupingList', 'emptyInteractive'],
    ['emptyReadonlyText', 'groupingList', 'emptyReadonly'],
    ['statusOpenLabel', 'groupingList', 'statusOpen'],
    ['peopleTemplate', 'groupingList', 'people'],
    ['newCarLabel', 'groupingList', 'newCar'],
    ['sealText', 'groupingList', 'seal'],
    ...FORM_TEXT_SPEC,
  ]),
  // Array fields bypass defineTextGens (catalog entries are always strings): the whole table is generated here.
  weekdayNames: (p: any) => p.genWeekdayNames(),
};

/* ---------- Guild member roster entries (proxy-signup picker) ----------
 * Roster = guild_members (recorded by the read path when a user
 * enters the guild). Entries ship only via the full Guild
 * surface's memberRoster field; displayName matches the
 * server-side seat name (roster nickname, falling back to global
 * name), so the name the picker shows is the name that gets
 * seated. */

export class GroupingDetailPageShell extends ShellBase {
  constructor(ctx: any, ev: any){ super(ctx, ev); }
  genGrouping(){
    return this.memo('grouping', () => new GroupingShell(this.ctx, this.data));
  }
  // Mobile Bloks-lite: block tree for this page's content area. Per-seat actions and the disband button are composed per viewer (identity-stamp / leader checks all server-side), then substituted by blocksVersion.
  async genBlocks({ blocksVersion }: any = {}){
    const v = clampBlocksVersion(blocksVersion);
    return this.memo(`blocks:${v}`, async () => {
      const ev = this.data;
      const access = await getGuildAccess(this.db, this.ctx.user, ev.tenant, this.ctx.request);
      const tRow = await getTenantRow(this.db, ev.tenant).catch(() => null);
      await ensureSignupDiscordColumn(this.db);
      const rows = await listSignupSeats(this.db, ev.id);
      const entries = [];
      for (let i = 0; i < ev.max_slots; i++) {
        entries.push(new SeatEntryShell(this.ctx, { row: rows[i] || null, index: i, ev, access }));
      }
      const blocks = [];
      if (tRow && tRow.announcement) blocks.push(new BannerBlockShell(this.ctx, { text: tRow.announcement }));
      blocks.push(new TextBlockShell(this.ctx, { text: ev.title, variant: 'title' }));
      blocks.push(new ChipRowBlockShell(this.ctx, { evType: ev.type, dungeonName: ev.dungeon || null, status: ev.status }));
      blocks.push(new TextBlockShell(this.ctx, {
        variant: 'meta', epoch: startsAtEpoch(ev), occupied: rows.length, max: ev.max_slots,
      }));
      blocks.push(new TextBlockShell(this.ctx, {
        variant: 'muted',
        textRef: ev.status === 'completed' ? ['groupingDetail', 'completedHint']
          : access.canWrite ? ['groupingDetail', 'openHint'] : ['groupingDetail', 'readonlyHint'],
      }));
      blocks.push(new SectionBlockShell(this.ctx, {
        title: null,
        children: [
          new SectionHeaderBlockShell(this.ctx, { textRef: ['appBlocks', 'rosterTitle'] }),
          new SeatGridBlockShell(this.ctx, { entries }),
        ],
      }));
      const isLeader = !!(this.ctx.user && ev.creator_discord_id
        && String(ev.creator_discord_id) === String(this.ctx.user.discordId));
      if (isLeader && access.canWrite) {
        blocks.push(new SpacerBlockShell(this.ctx, { size: 18 }));
        if (ev.status === 'completed') {
          // Completed: only the reopen entry is offered (edit/disband/complete are no longer sent).
          blocks.push(new ActionButtonBlockShell(this.ctx, {
            labelRef: ['groupingDetail', 'restore'], style: 'ghost',
            action: new UncompleteActionShell(this.ctx, { groupingId: String(ev.id) }),
          }));
        } else {
          blocks.push(new ActionButtonBlockShell(this.ctx, {
            labelRef: ['groupingDetail', 'edit'], style: 'ghost',
            action: new EditActionShell(this.ctx, { groupingId: String(ev.id) }),
          }));
          blocks.push(new SpacerBlockShell(this.ctx, { size: 10 }));
          blocks.push(new ActionButtonBlockShell(this.ctx, {
            labelRef: ['groupingDetail', 'complete'], style: 'ghost',
            action: new CompleteActionShell(this.ctx, { groupingId: String(ev.id), title: ev.title }),
          }));
          blocks.push(new SpacerBlockShell(this.ctx, { size: 10 }));
          blocks.push(new ActionButtonBlockShell(this.ctx, {
            labelRef: ['groupingDetail', 'disband'], style: 'danger',
            action: new DisbandActionShell(this.ctx, { groupingId: String(ev.id), title: ev.title }),
          }));
        }
      }
      return substituteForVersion(blocks, v, () => new FallbackBlockShell(this.ctx));
    });
  }
}

export const DETAIL_TEXT_RESOLVERS = {
  ...defineTextGens(GroupingDetailPageShell, [
    ['detailNotFoundText', 'groupingDetail', 'notFound'],
    ['detailBackToListLabel', 'groupingDetail', 'backToList'],
    ['detailShareLabel', 'groupingDetail', 'share'],
    ['detailEditLabel', 'groupingDetail', 'edit'],
    ['detailDisbandLabel', 'groupingDetail', 'disband'],
    ['detailDisbandingLabel', 'groupingDetail', 'disbanding'],
    ['detailStatusOpenLabel', 'groupingDetail', 'statusOpen'],
    ['detailPeopleTemplate', 'groupingDetail', 'people'],
    ['detailOpenHint', 'groupingDetail', 'openHint'],
    ['detailReadonlyHint', 'groupingDetail', 'readonlyHint'],
    ['detailToastDisbanded', 'groupingDetail', 'toastDisbanded'],
    ['detailToastDisbandFailedTemplate', 'groupingDetail', 'toastDisbandFailed'],
    ['detailCompleteLabel', 'groupingDetail', 'complete'],
    ['detailCompletingLabel', 'groupingDetail', 'completing'],
    ['detailStatusCompletedLabel', 'groupingDetail', 'statusCompleted'],
    ['detailRestoreLabel', 'groupingDetail', 'restore'],
    ['detailCompleteConfirmTitle', 'groupingDetail', 'completeConfirmTitle'],
    ['detailCompleteConfirmMessageTemplate', 'groupingDetail', 'completeConfirmMessage'],
    ['detailToastCompleted', 'groupingDetail', 'toastCompleted'],
    ['detailToastCompleteFailedTemplate', 'groupingDetail', 'toastCompleteFailed'],
    ['detailToastRestored', 'groupingDetail', 'toastRestored'],
    ['detailToastRestoreFailedTemplate', 'groupingDetail', 'toastRestoreFailed'],
    ['detailCompletedHint', 'groupingDetail', 'completedHint'],
    ['detailLinkCopied', 'groupingDetail', 'linkCopied'],
    ['detailCopyFailedManual', 'groupingDetail', 'copyFailedManual'],
    ['detailDisbandConfirmTitle', 'groupingDetail', 'disbandConfirmTitle'],
    ['detailDisbandConfirmMessageTemplate', 'groupingDetail', 'disbandConfirmMessage'],
    ['confirmOkLabel', 'common', 'confirm'],
    ['confirmCancelLabel', 'common', 'cancel'],
    ...TYPE_SHORT_SPEC,
    ['seatEmptyJoinLabel', 'seat', 'emptyJoin'],
    ['seatEmptyLabel', 'seat', 'empty'],
    ['seatModalTitleTemplate', 'seat', 'modalTitle'],
    ['seatModalSubtitle', 'seat', 'modalSubtitle'],
    ['seatNameLabel', 'seat', 'nameLabel'],
    ['seatNamePlaceholder', 'seat', 'namePlaceholder'],
    ['seatNameRequired', 'seat', 'nameRequired'],
    ['seatSelfTabLabel', 'seat', 'selfTab'],
    ['seatProxyTabLabel', 'seat', 'proxyTab'],
    ['seatSelfNameHint', 'seat', 'selfNameHint'],
    ['seatProxySearchPlaceholder', 'seat', 'proxySearchPlaceholder'],
    ['seatProxyPickRequired', 'seat', 'proxyPickRequired'],
    ['seatProxyEmptyText', 'seat', 'proxyEmpty'],
    ['seatSectLabel', 'seat', 'sectLabel'],
    ['seatCancelLabel', 'common', 'cancel'],
    ['seatConfirmJoinLabel', 'seat', 'confirmJoin'],
    ['seatJoiningLabel', 'seat', 'joining'],
    ['seatLeaderLabel', 'seat', 'leader'],
    ['seatToastSect', 'seat', 'toastSect'],
    ['seatToastJoined', 'seat', 'toastJoined'],
    ['seatToastJoinFailedTemplate', 'seat', 'toastJoinFailed'],
    ['seatToastLeft', 'seat', 'toastLeft'],
    ['seatToastLeaveFailedTemplate', 'seat', 'toastLeaveFailed'],
    ['seatLeaveConfirmTitle', 'seat', 'leaveConfirmTitle'],
    ['seatLeaveConfirmMessageTemplate', 'seat', 'leaveConfirmMessage'],
    ...FORM_TEXT_SPEC,
  ]),
};



export const groupingsResolvers = {
  Query: {
    groupingListPage: async (_: any, { slug, tab }: any, ctx: any) => {
      const db = ctx.env.DB;
      // Tenant must exist; bound guilds are members-only (enforced server-side — non-members get no data).
      const a = await getGuildAccess(db, ctx.user, slug, ctx.request);
      if (!a.exists) throw new Error(errText(ctx, 'guildNotFound'));
      if (!a.canView) throw new Error(errText(ctx, 'memberOnlyView'));
      touchGuildRoster(ctx, a);
      return groupingListPage(ctx, a.tenant.slug, tab);
    },

    groupingDetailPage: async (_: any, { slug, id }: any, ctx: any) => {
      const db = ctx.env.DB;
      const ev = await getEventRow(db, parseInt(id, 10) || 0);
      if (!ev) throw new Error(errText(ctx, 'groupingNotFound'));
      // Tenant isolation: a supplied slug must match the grouping's own guild, else treat as nonexistent (never leak another guild's data).
      if (slug != null && s(slug, 40) !== ev.tenant) throw new Error(errText(ctx, 'groupingNotFound'));
      // Bound guild: non-members are treated as nonexistent — no grouping content leaks.
      const a = await getGuildAccess(db, ctx.user, ev.tenant, ctx.request);
      if (!a.canView) throw new Error(errText(ctx, 'groupingNotFound'));
      touchGuildRoster(ctx, a);
      return new GroupingDetailPageShell(ctx, ev);
    },

    // ===== Viewer hierarchy (root = user) =====
  },
  Mutation: {
    createGrouping: async (_: any, { input }: any, ctx: any) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:create:' + getClientIp(ctx.request), 10)) {
        return gFail(ctx, 'rateLimited');
      }
      const slug = s(input.slug, 40);
      const gate = await requireWrite(db, ctx.user, slug, ctx.request);
      if (gate) return gFail(ctx, gate);
      const title = s(input.title, 40);
      if (!title) return gFail(ctx, 'titleRequired');
      const type = TAB_TO_TYPE[input.type] || 'activity';
      let utc = parseInt(input.startsAt, 10) || 0;
      if (!utc && input.startsAt) {
        const ms = Date.parse(input.startsAt);
        if (!Number.isNaN(ms)) utc = Math.floor(ms / 1000);
      }
      const now = Math.floor(Date.now() / 1000);
      if (!utc || utc < now - 3600) return gFail(ctx, 'badStartTime');
      if (utc > now + 60 * 86400) return gFail(ctx, 'startTimeTooFar');
      // Headcount rules: double-ten writes no dungeon name and is always
      // 10 (a dungeonId is ignored); tower mirrors double-ten the same
      // way; talent/race with a dungeon use the dungeon's size, without
      // one the default (talent 5 / race 10).
      let maxSlots = type === 'talent' ? 5 : 10;
      let dungeonName = '';
      if (type !== 'activity' && type !== 'tower' && input.dungeonId) {
        const d = await getDungeonNameSizeById(db, parseInt(input.dungeonId, 10) || 0);
        if (d) {
          dungeonName = d.name;
          const sz = Number(d.size);
          if (sz === 5 || sz === 10) maxSlots = sz;
        }
      }
      // Persist leader identity from the session discord_id (requireWrite guarantees login); re-verified at disband.
      await ensureEventCreatorColumn(db);
      const r = await insertEvent(db, {
        tenant: slug, title, type, description: '', starts_at: '', starts_at_utc: utc,
        max_slots: maxSlots, status: 'open', origin: 'member', created_by: '热心侠客',
        dungeon: dungeonName, creator_discord_id: String(ctx.user.discordId),
      });
      const eventId = r.last_row_id;
      if (Array.isArray(input.seats)) {
        await ensureSignupDiscordColumn(db);
        const seatRows = [];
        for (const st of input.seats.slice(0, maxSlots)) {
          const nm = s(st.nickname, 30), wp = s(st.weapon, 20);
          if (!nm || !wp) continue;
          // Pre-seating at creation follows the join rule: stamp only when the nickname is the creator's own identity.
          const stamp = await selfStampFor(db, ctx.user, slug, nm);
          seatRows.push({ event_id: eventId, nickname: nm, uid: newUid(), role: roleOf(wp), weapon: wp, discord_id: stamp });
        }
        if (seatRows.length) await insertSignups(db, seatRows);
      }
      const ev = await getEventRow(db, eventId);
      publishGroupingEvent(ctx, slug, eventId, 'created');
      return new GroupingPayloadShell(ctx, { ok: true, grouping: toGrouping(ctx, ev) });
    },

    updateGrouping: async (_: any, { id, input }: any, ctx: any) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:update:' + getClientIp(ctx.request), 20)) {
        return gFail(ctx, 'rateLimited');
      }
      await ensureEventCreatorColumn(db);
      const gid = parseInt(id, 10) || 0;
      const ev = await getEventRow(db, gid);
      if (!ev) return gFail(ctx, 'groupingNotFound');
      const gate = await requireWrite(db, ctx.user, ev.tenant, ctx.request);
      if (gate) return gFail(ctx, gate);
      if (ev.origin !== 'member') return gFail(ctx, 'officialEvent');
      // Edit gating (2026-10-25): only the leader may edit a grouping —
      // the same rule as disbandGrouping. Identity is solely
      // creator_discord_id vs the session discord_id; seat-list edits go
      // through this mutation too. Legacy groupings with no recorded
      // leader can be edited by no one — admin channel only.
      if (!ev.creator_discord_id) {
        return gFail(ctx, 'noCreatorRecordedEdit');
      }
      if (String(ev.creator_discord_id) !== String(ctx.user.discordId)) {
        return gFail(ctx, 'leaderOnlyEdit');
      }
      const patch: Record<string, any> = {};
      const set = (col: any, val: any) => { patch[col] = val; };
      if (input.title !== undefined && input.title !== null) set('title', s(input.title, 40));
      if (input.startsAt !== undefined && input.startsAt !== null) {
        let u = parseInt(input.startsAt, 10) || 0;
        if (!u) { const ms = Date.parse(input.startsAt); if (!Number.isNaN(ms)) u = Math.floor(ms / 1000); }
        if (u > 0) set('starts_at_utc', u);
      }
      if (ev.status === 'draft') set('status', 'open');
      if (Object.keys(patch).length) {
        await updateEventFields(db, gid, null, patch);
      }
      if (Array.isArray(input.seats)) {
        await ensureSignupDiscordColumn(db);
        // Identity stamps when the seat table is rewritten wholesale
        // (conservative): keep a stamp only if the old seats held exactly
        // one stamp for that nickname and the stamp owner's current
        // identity name still equals it. A nickname changed to someone
        // else, an ambiguous old stamp, or a renamed owner all drop the
        // stamp. Editing itself never stamps (saving is not seating).
        const oldSeats = await listSignupNamesStamps(db, gid);
        const stampByNick = new Map();
        for (const os of oldSeats || []) {
          if (!os.discord_id) continue;
          const key = String(os.nickname || '').trim();
          if (!stampByNick.has(key)) stampByNick.set(key, new Set());
          stampByNick.get(key).add(String(os.discord_id));
        }
        const dgidU = await getTenantSetting(db, ev.tenant, 'discord_guild_id');
        const carryCache = new Map();
        const carryStamp = async (nm: any) => {
          const set = stampByNick.get(nm);
          if (!set || set.size !== 1) return null;
          const d = [...set][0];
          if (!carryCache.has(d)) carryCache.set(d, await identityNamesFor(db, d, dgidU));
          return carryCache.get(d).has(nm) ? d : null;
        };
        await deleteSignupsByEvent(db, gid);
        const seatRows = [];
        for (const st of input.seats.slice(0, ev.max_slots)) {
          const nm = s(st.nickname, 30), wp = s(st.weapon, 20);
          if (!nm || !wp) continue;
          const stamp = await carryStamp(nm);
          seatRows.push({ event_id: gid, nickname: nm, uid: newUid(), role: roleOf(wp), weapon: wp, discord_id: stamp });
        }
        if (seatRows.length) await insertSignups(db, seatRows);
      }
      const nev = await getEventRow(db, gid);
      publishGroupingEvent(ctx, ev.tenant, gid, 'updated');
      return new GroupingPayloadShell(ctx, { ok: true, grouping: toGrouping(ctx, nev) });
    },

    // Disband (2026-10-24): the sole exception to "anyone can manage" —
    // leader only. Identity is solely events.creator_discord_id vs
    // the session discord_id, re-verified server-side regardless of
    // what the frontend shows. Legacy groupings with no recorded
    // leader can be disbanded by no one — admin channel only (REST
    // admin delete unchanged).
    disbandGrouping: async (_: any, { id }: any, ctx: any) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:disband:' + getClientIp(ctx.request), 10)) {
        return dFail(ctx, 'rateLimited');
      }
      await ensureEventCreatorColumn(db);
      const gid = parseInt(id, 10) || 0;
      const ev = await getEventTenantCreator(db, gid);
      if (!ev) return dFail(ctx, 'groupingNotFound');
      const gate = await requireWrite(db, ctx.user, ev.tenant, ctx.request);
      if (gate) return dFail(ctx, gate);
      if (!ev.creator_discord_id) {
        return dFail(ctx, 'noCreatorRecorded');
      }
      if (String(ev.creator_discord_id) !== String(ctx.user.discordId)) {
        return dFail(ctx, 'leaderOnlyDisband');
      }
      await deleteEventCascade(db, gid, null);
      publishGroupingEvent(ctx, ev.tenant, gid, 'deleted');
      return new DeletePayloadShell(ctx, { ok: true });
    },

    // Complete (2026-10-25): a finished grouping is marked completed —
    // unlike closed, which merely stops signups, stays listed, and
    // still reminds. completed vanishes from every list, and the
    // reminder/push definitions (PENDING_WHERE accepts only
    // open/closed) stop firing automatically — even a queued alarm is
    // filtered when GuildHub re-reads D1 at fire time. Same gate as
    // edit/disband: leader only; leaderless legacy groupings go
    // through the admin channel. Completable from open or closed.
    completeGrouping: async (_: any, { id }: any, ctx: any) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:complete:' + getClientIp(ctx.request), 10)) {
        return gFail(ctx, 'rateLimited');
      }
      await ensureEventCreatorColumn(db);
      const gid = parseInt(id, 10) || 0;
      const ev = await getEventRow(db, gid);
      if (!ev) return gFail(ctx, 'groupingNotFound');
      const gate = await requireWrite(db, ctx.user, ev.tenant, ctx.request);
      if (gate) return gFail(ctx, gate);
      if (ev.origin !== 'member') return gFail(ctx, 'officialEvent');
      if (!ev.creator_discord_id) {
        return gFail(ctx, 'noCreatorRecordedComplete');
      }
      if (String(ev.creator_discord_id) !== String(ctx.user.discordId)) {
        return gFail(ctx, 'leaderOnlyComplete');
      }
      if (ev.status === 'completed') return gFail(ctx, 'groupingAlreadyCompleted');
      // draft is invisible across the whole GraphQL surface (lists filter it): treat as nonexistent.
      if (ev.status !== 'open' && ev.status !== 'closed') return gFail(ctx, 'groupingNotFound');
      await setEventStatus(db, gid, 'completed');
      const nev = await getEventRow(db, gid);
      // kind=updated: live-remove from lists + GuildHub reschedules alarms (a completed grouping is no longer a pending reminder).
      publishGroupingEvent(ctx, ev.tenant, gid, 'updated');
      return new GroupingPayloadShell(ctx, { ok: true, grouping: toGrouping(ctx, nev) });
    },

    // Reopen (undo complete): pairs with completeGrouping, same gate.
    // Always returns to open — the pre-complete closed state is not
    // restored (keep it simple; the leader can close again, via REST
    // close / the state machine).
    reopenGrouping: async (_: any, { id }: any, ctx: any) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:reopen:' + getClientIp(ctx.request), 10)) {
        return gFail(ctx, 'rateLimited');
      }
      await ensureEventCreatorColumn(db);
      const gid = parseInt(id, 10) || 0;
      const ev = await getEventRow(db, gid);
      if (!ev) return gFail(ctx, 'groupingNotFound');
      const gate = await requireWrite(db, ctx.user, ev.tenant, ctx.request);
      if (gate) return gFail(ctx, gate);
      if (ev.origin !== 'member') return gFail(ctx, 'officialEvent');
      if (!ev.creator_discord_id) {
        return gFail(ctx, 'noCreatorRecordedReopen');
      }
      if (String(ev.creator_discord_id) !== String(ctx.user.discordId)) {
        return gFail(ctx, 'leaderOnlyReopen');
      }
      if (ev.status !== 'completed') return gFail(ctx, 'groupingNotCompleted');
      await setEventStatus(db, gid, 'open');
      const nev = await getEventRow(db, gid);
      publishGroupingEvent(ctx, ev.tenant, gid, 'updated');
      return new GroupingPayloadShell(ctx, { ok: true, grouping: toGrouping(ctx, nev) });
    },

    joinGrouping: async (_: any, { input }: any, ctx: any) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:join:' + getClientIp(ctx.request), 30)) {
        return sFail(ctx, 'rateLimited');
      }
      const gid = parseInt(input.groupingId, 10) || 0;
      const ev = await getEventRow(db, gid);
      if (!ev) return sFail(ctx, 'groupingNotFound');
      if (ev.status !== 'open') return sFail(ctx, 'groupingClosed');
      const gate = await requireWrite(db, ctx.user, ev.tenant, ctx.request);
      if (gate) return sFail(ctx, gate);
      const weapon = s(input.weapon, 40);
      const uid = newUid();
      await ensureSignupDiscordColumn(db);
      // Signup identity (2026-10-25): seat name and identity stamp are
      // decided server-side; the client-sent nickname is ignored
      // (overwritten, not an error).
      //  - Self signup: name = the user's Discord server nickname
      //    (fallback global name), stamp = the user.
      //  - Proxy signup (forDiscordId): the target must be in this
      //    guild's roster (guild_members), re-verified server-side;
      //    name = roster nickname (fallback global name), stamp = the
      //    target — so reminder @s and pushes reach the real person.
      let nickname = '';
      let stamp = null;
      const forId = input.forDiscordId ? String(input.forDiscordId).trim() : '';
      if (forId) {
        await ensureGuildMembersTable(db);
        const m = await getGuildMember(db, ev.tenant, forId).catch(() => null);
        if (!m) return sFail(ctx, 'proxyTargetNotInRoster');
        nickname = String(m.nick || '').trim() || String(m.global_name || '').trim();
        if (!nickname) return sFail(ctx, 'nicknameRequired');
        nickname = nickname.slice(0, 30);
        stamp = forId;
      } else {
        nickname = (await canonicalSignupName(db, ctx.user, ev.tenant)).slice(0, 30);
        if (!nickname) return sFail(ctx, 'nicknameRequired');
        stamp = String(ctx.user.discordId);
      }
      try {
        const r = await insertSignupWithCapacityGuard(db, {
          event_id: gid, nickname, uid, role: roleOf(weapon), weapon, discord_id: stamp,
        });
        if (r.outcome === 'full') return sFail(ctx, 'groupingFull');
        if (r.outcome === 'needsHealer') return sFail(ctx, 'lastSeatHealer');
      } catch (e) {
        if (String((e as any).message).includes('UNIQUE')) return sFail(ctx, 'alreadyJoined');
        throw e;
      }
      const g = toGrouping(ctx, ev);
      publishGroupingEvent(ctx, ev.tenant, gid, 'seats');
      return new SeatPayloadShell(ctx, { ok: true, seats: await g.genSeats() });
    },

    leaveGrouping: async (_: any, { input }: any, ctx: any) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:leave:' + getClientIp(ctx.request), 30)) {
        return sFail(ctx, 'rateLimited');
      }
      const gid = parseInt(input.groupingId, 10) || 0;
      const ev0 = await getEventTenant(db, gid);
      if (!ev0) return sFail(ctx, 'groupingNotFound');
      const gate = await requireWrite(db, ctx.user, ev0.tenant, ctx.request);
      if (gate) return sFail(ctx, gate);
      const r = await deleteSignupByEventUid(db, gid, s(input.uid, 30));
      if (!r.changes) return sFail(ctx, 'seatNotFound');
      const ev = await getEventRow(db, gid);
      const g = ev ? toGrouping(ctx, ev) : null;
      publishGroupingEvent(ctx, ev0.tenant, gid, 'seats');
      return new SeatPayloadShell(ctx, { ok: true, seats: g ? await g.genSeats() : null });
    },

    updateSeatWeapon: async (_: any, { input }: any, ctx: any) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:seat:' + getClientIp(ctx.request), 30)) {
        return sFail(ctx, 'rateLimited');
      }
      const gid = parseInt(input.groupingId, 10) || 0;
      const weapon = s(input.weapon, 40);
      if (!weapon) return sFail(ctx, 'paramsIncomplete');
      const ev0 = await getEventTenant(db, gid);
      if (!ev0) return sFail(ctx, 'groupingNotFound');
      const gate = await requireWrite(db, ctx.user, ev0.tenant, ctx.request);
      if (gate) return sFail(ctx, gate);
      const r = await updateSignupWeaponRoleByUid(db, gid, s(input.uid, 30), weapon, roleOf(weapon));
      if (!r.changes) return sFail(ctx, 'seatNotFound');
      const ev = await getEventRow(db, gid);
      const g = ev ? toGrouping(ctx, ev) : null;
      publishGroupingEvent(ctx, ev0.tenant, gid, 'seats');
      return new SeatPayloadShell(ctx, { ok: true, seats: g ? await g.genSeats() : null });
    },
  },
  types: {
    // Explicit field resolvers for plain-data result types: every field
    // delegates to the same-named property of the computed result object
    // (previously these relied on GraphQL default field resolution).
    Seat: { index: (p: any) => p.index, nickname: (p: any) => p.nickname, weapon: (p: any) => p.weapon, role: (p: any) => p.role, uid: (p: any) => p.uid, occupied: (p: any) => p.occupied },
  Grouping: {
    id: (p: any) => p.genId(),
    title: (p: any) => p.genTitle(),
    type: (p: any) => p.genType(),
    startsAt: (p: any) => p.genStartsAt(),
    dungeon: (p: any) => p.genDungeon(),
    seats: (p: any) => p.genSeats(),
    occupiedCount: (p: any) => p.genOccupiedCount(),
    maxSlots: (p: any) => p.genMaxSlots(),
    status: (p: any) => p.genStatus(),
    creatorDiscordId: (p: any) => p.genCreatorDiscordId(),
  },
  GroupingListPage: {
    groupings: (p: any) => p.genGroupings(),
    currentVersion: (p: any) => p.genCurrentVersion(),
    blocks: (p: any, args: any) => p.genBlocks(args),
    ...LIST_TEXT_RESOLVERS,
  },
  GroupingDetailPage: {
    grouping: (p: any) => p.genGrouping(),
    blocks: (p: any, args: any) => p.genBlocks(args),
    ...DETAIL_TEXT_RESOLVERS,
  },
  // ===== Bloks-lite blocks/actions (dispatch by type; shells carry __typename) =====
  GroupingPayload: {
    ok: (p: any) => p.genOk(),
    grouping: (p: any) => p.genGrouping(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
  },
  SeatPayload: {
    ok: (p: any) => p.genOk(),
    seats: (p: any) => p.genSeats(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
  },
  DeletePayload: {
    ok: (p: any) => p.genOk(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
  },
  },
};
