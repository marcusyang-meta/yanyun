import type { Context } from '../platform/context.ts';
import { vcOf } from '../platform/context.ts';
 './events.ts';
import { mintShortLink, shortLinkUrl, canonicalGroupingUrl, subdomainGroupingUrl } from './shortlinks.ts';
import { GROUPING_DEFAULT_CREATED_BY } from './events.ts';
/* groupings domain GraphQL: grouping shells, list/detail pages, and all grouping mutations. */
import {
  clampBlocksVersion, substituteForVersion, weekWindowUtc, startsAtEpoch,
  fmtStartsAt, groupByLocalDay, TYPE_SHORT_KEY, HEALER_SECT, tierLocked,
} from '../platform/index.ts';
import { tlCalculateExcel } from '../gear/index.ts';
import { getUserServers, getGuildNick, maybeRefreshGuildNicks, getUserLocalePref, setUserLocalePref } from '../identity/auth.ts';
import { upsertGuildMember } from './index.ts';
import { isValidPushToken, savePushToken, deletePushToken } from '../platform/index.ts';
import { evaluateHeirloomPushes } from '../gear/index.ts';
import { translate, negotiateLocale, SUPPORTED_LOCALES, CATALOG } from '../platform/index.ts';
import { logError } from '../platform/index.ts';
import { getGuildAvatarMeta, avatarPath } from '../guilds/index.ts';
import { getSettingValue, setSettingValue, listSettingsByKey, parseGuildSubdomainSlug, isGuildSubdomainEnabled, guildSubdomainOrigin, isLiveCustomDomainHost } from '../guilds/index.ts';
import { getUsernameRow, getDiscordIdByUserId } from '../identity/index.ts';
import { listGuildMembers, getGuildMember } from '../identity/index.ts';
import { getBossById, listBossesByDungeon, listSchoolsFull, listSchoolsNameSlug, getSchoolNameBySlug, listSchoolBis, getSchoolBisJsonBySchool, listSchoolRotations, listSlotAffixByBuild, listAffixMax, listAffixMaxValues } from '../dex/index.ts';
import { getDungeonByName, getDungeonNameSizeById, listDungeonsDex, getLatestDungeonVersion } from '../dex/index.ts';
import {
  getTenantRow, getTenantRowById, getGuildIdBySlug, getTenantSlug, listTenantSlugs, listTenantsDirectory, insertTenant,
} from '../guilds/index.ts';
import {
  getEventRow, getEventTenant, getEventTenantCreator, listEventsByTenantType,
  insertEvent, updateEventFields, setEventStatus, deleteEventCascade,
  capturedTzOrNull,
} from './index.ts';
import {
  listGroupingTemplates, getGroupingTemplate, insertGroupingTemplate,
  updateGroupingTemplateFields, deleteGroupingTemplate as deleteGroupingTemplateRow,
  templateOffsetFromStartsAt,
  type GroupingTemplateRow,
} from './index.ts';
import {
  listCustomFields, parseCustomFieldDefs, validateSignupAnswers,
  replaceCustomFields, insertSignupAnswer, listSignupAnswersByEvent,
  deleteSignupAnswersByEventUid, deleteSignupAnswersByEvent,
  parseFieldOptions, type CustomFieldDef,
} from './index.ts';
import { carOgImageUrl } from './reminder.ts';
import { scheduleResolvers } from './schedule-graphql.ts';
import { resolveSharedGrouping } from './shareview.ts';
import { schedulingAdviceResolvers, composeGroupingSchedulingAdvice, composeCrossCarAdvice, renderAdviceReason, adviceRoleLabel } from './scheduling-graphql.ts';
import { buildMemberFacts, buildTeamDraft, rankSubstitutes } from './scheduling.ts';
import { recapSurfaceForGrouping, recapResolvers } from './recap-graphql.ts';
import { combatReportSurfaceForGrouping, combatResolvers } from './combat-graphql.ts';
import {
  listSignupSeats, listSignupSeatsBasic, listSignupNamesStamps,
  insertSignups, insertSignupWithCapacityGuard, deleteSignupByEventUid, deleteSignupsByEvent,
  updateSignupWeaponRoleByUid, updateSignupReadyByEventDiscord,
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
  getGroupingManageVerdict, groupingManageGate,
  sha256hexLocal, rateLimitGql as rateLimit, getClientIp, s, roleOf, newUid,
  TAB_TO_TYPE, TYPE_TO_ENUM, GUILD_TABS, getGameVersion, getCurrentVersionCode,
  PayloadBase, GroupingPayloadShell, SeatPayloadShell, DeletePayloadShell, TemplatePayloadShell,
  CreateGuildPayloadShell, UpdateLocalePayloadShell, uFail, gFail, sFail, dFail, cFail, tFail,
} from '../platform/graphql-base.ts';
import { BannerBlockShell, EmptyStateBlockShell, SectionHeaderBlockShell, NavigateActionShell, GroupingCardBlockShell, FallbackBlockShell, TextBlockShell, ChipRowBlockShell, SectionBlockShell, SeatGridBlockShell, SpacerBlockShell, ActionButtonBlockShell, UncompleteActionShell, EditActionShell, DisbandActionShell, CompleteActionShell, SeatEntryShell } from '../platform/index.ts';
import { DungeonShell } from '../dex/index.ts';
import { selfStampFor, identityNamesFor, canonicalSignupName } from '../identity/index.ts';

export class GroupingShell extends ShellBase {
  constructor(ctx: Context, ev: any){ super(ctx, ev); }
  get ev() { return this.data; }
  genId(){ return String(this.ev.id); }
  genTitle(){ return this.ev.title; }
  genType(){ return TYPE_TO_ENUM[this.ev.type] || 'ACTIVITY'; }
  genStartsAt(){ return this.ev.starts_at_utc ? String(this.ev.starts_at_utc) : (this.ev.starts_at || ''); }
  genStatus(){ return this.ev.status || 'open'; }
  genMaxSlots(){ return this.ev.max_slots; }
  genCreatorDiscordId(){
    return this.memo('creatorDiscordId', async () => {
      if (!this.ev.creator_user_id) return null;
      return getDiscordIdByUserId(this.db, this.ev.creator_user_id).catch(() => null);
    });
  }
  // F7: this car's own signup-form field definitions (creator data,
  // copied from its template at creation when one was used).
  genCustomFields(){
    return this.memo('customFields', async () => {
      const rows = await listCustomFields(this.db, 'event', this.ev.id);
      return rows.map((r) => ({
        id: String(r.id), label: r.label,
        fieldType: r.field_type === 'choice' ? 'CHOICE' : 'TEXT',
        options: parseFieldOptions(r.options_json), required: !!r.required,
      }));
    });
  }
  genSeatRows(){
    return this.memo('seatRows', async () => {
      return listSignupSeats(this.db, this.ev.id);
    });
  }
  genSeats(){
    return this.memo('seats', async () => {
      const rows = await this.genSeatRows();
      const myId = this.ctx.user ? String((this.ctx.user as any).discordId) : '';
      const seats = [];
      for (let i = 0; i < this.ev.max_slots; i++) {
        const r = rows[i];
        seats.push(r ? {
          index: i, nickname: r.nickname, weapon: enSectName(this.locale, r.weapon),
          role: r.role === '奶' || r.role === '治疗' ? this.t('seat_roleHealer') : this.t('seat_roleDps'),
          uid: r.uid, occupied: true,
          ready: !!r.ready_at,
          mine: !!(myId && r.discord_id && String(r.discord_id) === myId),
        } : { index: i, nickname: null, weapon: null, role: null, uid: null, occupied: false, ready: false, mine: false });
      }
      return seats;
    });
  }
  genOccupiedCount(){
    return this.memo('occupiedCount', async () => (await this.genSeatRows()).length);
  }
  genReadyCount(){
    return this.memo('readyCount', async () => (await this.genSeatRows()).filter((r: any) => r.ready_at).length);
  }
  genDungeon(){
    return this.memo('dungeon', async () => {
      if (!this.ev.dungeon) return null;
      const d = await getDungeonByName(this.db, this.ev.dungeon);
      return d ? new DungeonShell(this.ctx, d) : null;
    });
  }
}

export function toGrouping(ctx: Context, ev: any) {
  return new GroupingShell(ctx, ev);
}

/* ---------- Grouping templates ----------
 * A template is a guild-shared grouping configuration snapshot. The
 * shape derivation (dungeon name + seat count from type + dungeonId)
 * is shared verbatim with createGrouping, so a car built from a
 * template is field-identical to one built by hand: activity/tower
 * write no dungeon name and are always 10; talent/race with a dungeon
 * use the dungeon's size, without one the default (talent 5 / race 10). */
export async function resolveGroupingShape(db: any, type: string, dungeonId: any): Promise<{ dungeonName: string; maxSlots: number }> {
  let maxSlots = type === 'talent' ? 5 : 10;
  let dungeonName = '';
  if (type !== 'activity' && type !== 'tower' && dungeonId) {
    const d = await getDungeonNameSizeById(db, parseInt(dungeonId, 10) || 0);
    if (d) {
      dungeonName = d.name;
      const sz = Number(d.size);
      if (sz === 5 || sz === 10) maxSlots = sz;
    }
  }
  return { dungeonName, maxSlots };
}

export class GroupingTemplateShell extends ShellBase {
  constructor(ctx: Context, row: GroupingTemplateRow){ super(ctx, row); }
  get row() { return this.data as GroupingTemplateRow; }
  genId(){ return String(this.row.id); }
  genName(){ return this.row.name; }
  genType(){ return TYPE_TO_ENUM[this.row.type] || 'ACTIVITY'; }
  genTitle(){ return this.row.title; }
  genDungeonName(){ return this.row.dungeon ? this.row.dungeon : null; }
  // The form's dungeon picker keys on the current dex id; the template
  // stores the stable dungeon NAME (same as events.dungeon) and the id
  // is resolved live — a dungeon retired by a version change reads null.
  genDungeonId(){
    return this.memo('dungeonId', async () => {
      if (!this.row.dungeon) return null;
      const d = await getDungeonByName(this.db, this.row.dungeon);
      return d ? String(d.id) : null;
    });
  }
  genMaxSlots(){ return this.row.max_slots; }
  genStartDaysAhead(){ return this.row.start_days_ahead; }
  genStartHour(){ return Math.floor((this.row.start_minutes || 0) / 60); }
  genStartMinute(){ return (this.row.start_minutes || 0) % 60; }
  genCreatorDiscordId(){
    return this.memo('creatorDiscordId', async () => {
      if (!this.row.creator_user_id) return null;
      return getDiscordIdByUserId(this.db, this.row.creator_user_id).catch(() => null);
    });
  }
  // F7: the template's signup-form fields; a car created from this
  // template receives a copy of this set as its own definitions.
  genCustomFields(){
    return this.memo('customFields', async () => {
      const rows = await listCustomFields(this.db, 'template', this.row.id);
      return rows.map((r) => ({
        id: String(r.id), label: r.label,
        fieldType: r.field_type === 'choice' ? 'CHOICE' : 'TEXT',
        options: parseFieldOptions(r.options_json), required: !!r.required,
      }));
    });
  }
  // Creator display name, roster-first like seat names (guild nickname,
  // falling back to the global name snapshot).
  genCreatorName(){
    return this.memo('creatorName', async () => {
      const cid = this.row.creator_user_id
        ? await getDiscordIdByUserId(this.db, this.row.creator_user_id).catch(() => null)
        : null;
      if (!cid) return null;
      const m = await getGuildMember(this.db, this.row.tenant, cid).catch(() => null);
      const nick = m ? String(m.nick || '').trim() : '';
      if (nick) return nick;
      const globalName = m ? String(m.global_name || '').trim() : '';
      if (globalName) return globalName;
      const u = await getUsernameRow(this.db, String(cid)).catch(() => null);
      const name = u ? String(u.username || '').trim() : '';
      return name || null;
    });
  }
  // Manage action set, composed only for viewers who may edit/delete
  // this template: its creator, or an admin of the template's own
  // guild (the shared grouping manage verdict on tenant +
  // creator_discord_id; omni passes in full). Everyone else gets null
  // and the clients render no edit/delete entry; the mutations
  // re-verify with the same verdict.
  async genManageActions(){
    const verdict = await getGroupingManageVerdict(this.db, this.ctx.user, this.ctx.request, this.vc, this.row);
    if (!verdict.canManage) return null;
    return {
      editLabel: this.t('groupingTemplate_edit'),
      deleteLabel: this.t('groupingTemplate_delete'),
      deleteConfirmTitle: this.t('groupingTemplate_deleteConfirmTitle'),
      deleteConfirmMessageTemplate: this.t('groupingTemplate_deleteConfirmMessage'),
    };
  }
}

export function toGroupingTemplate(ctx: Context, row: GroupingTemplateRow) {
  return new GroupingTemplateShell(ctx, row);
}

/* Shared create/update input validation for templates: name and car
 * title are required; the shape (dungeon name + seats) derives exactly
 * like a real car's; the departure offset is a day count (clamped to
 * the same 60-day horizon createGrouping enforces) plus a time-of-day. */
async function parseTemplateInput(db: any, input: any): Promise<any> {
  const name = s(input.name, 40);
  if (!name) return { error: 'templateNameRequired' };
  const title = s(input.title, 40);
  if (!title) return { error: 'titleRequired' };
  const type = TAB_TO_TYPE[input.type] || 'activity';
  const { dungeonName, maxSlots } = await resolveGroupingShape(db, type, input.dungeonId);
  const daysAhead = Math.max(0, Math.min(60, parseInt(input.startsInDays, 10) || 0));
  const hour = parseInt(input.startHour, 10);
  const minute = parseInt(input.startMinute, 10);
  if (!(hour >= 0 && hour <= 23) || !(minute >= 0 && minute <= 59)) return { error: 'templateBadStart' };
  return { name, title, type, dungeonName, maxSlots, daysAhead, startMinutes: hour * 60 + minute };
}

// Parse 1-x/2-x talent rows from guide text (accepts real newlines and literal \n sequences).

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

export function touchGuildRoster(ctx: Context, access: any) {
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
      await upsertGuildMember(db, slug, user.discordId, nick, globalName);
    } catch { /* roster recording failures are silent */ }
  })();
  if (ctx.executionCtx && typeof ctx.executionCtx.waitUntil === 'function') {
    ctx.executionCtx.waitUntil(run);
  }
  return run;
}

export class GroupingListPageShell extends ShellBase {
  constructor(ctx: Context, slug: any, tab: any){ super(ctx, { slug, tab }); }
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
          textRef: ['groupingList_emptyInteractive'],
        }));
      } else {
        // Grouped by natural day in the viewer's local timezone within one
        // screen (one week): the header is a SectionHeaderBlock with its
        // text fully composed here from the catalog template — clients
        // neither reorder nor compose copy. Groups ascend by date,
        // groupings by start time. Timeless groupings never enter the
        // mobile week (ts != null), so there is no undated group.
        const items = inWeek.map((g: any) => ({ g, ts: startsAtEpoch(g.ev) })).filter((x): x is { g: any; ts: number } & Record<string, any> => x.ts != null);
        for (const group of groupByLocalDay(items, this.ctx.tz)) {
          const p = group.parts;
          blocks.push(new SectionHeaderBlockShell(this.ctx, {
            text: this.t('groupingList_dayGroupHeader', {
              month: p.month, day: p.day, weekday: this.t('groupingList_weekday' + p.weekday),
            }),
          }));
          for (const { g } of group.items) {
            const nav = new NavigateActionShell(this.ctx, {
              slug: access.slug, groupingId: g.genId(), name: tRow ? tRow.guild_name : access.slug,
              nick: viewerNick || '',
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
      const gid = await getGuildIdBySlug(this.db, s(this.data.slug, 40));
      const results = gid == null ? [] : await listEventsByTenantType(this.db, gid, type);
      return results.map((ev: any) => new GroupingShell(this.ctx, ev));
    });
  }
  // The guild's shared car templates (guild-scoped, not per-tab): the
  // create form opened from any tab reads the same list. Visibility is
  // the page's own gate (the list-page query already enforced canView).
  async genGroupingTemplates(){
    return this.memo('groupingTemplates', async () => {
      const gid = await getGuildIdBySlug(this.db, s(this.data.slug, 40));
      const rows = gid == null ? [] : await listGroupingTemplates(this.db, gid);
      return rows.map((r: GroupingTemplateRow) => new GroupingTemplateShell(this.ctx, r));
    });
  }
  // Premium T2 cross-car advice (P13): admins / car leaders only,
  // composed by tierSurfaceState (see scheduling-graphql.ts).
  genCrossCarAdvice(){
    return this.memo('crossCarAdvice', async () => composeCrossCarAdvice(this.ctx, s(this.data.slug, 40)));
  }
  // Weekday short names (index 0 = Sunday, aligned with JS getDay and the server's localDayParts): fills the {weekday} slot in web group-header templates; the whole table is generated per locale.
  genWeekdayNames(){
    return this.memo('weekdayNames', () => [0, 1, 2, 3, 4, 5, 6].map((i: any) => this.t('groupingList_weekday' + i)));
  }
  genCurrentVersion(){
    return this.ctxMemo('gameVersion', () => getGameVersion(this.db));
  }
}

// Grouping list data entry (shared by groupingListPage and Guild.groupings; gating is the caller's job).
export function groupingListPage(ctx: Context, slug: any, tab: any) {
  return new GroupingListPageShell(ctx, slug, tab);
}

import { FORM_TEXT_SPEC, TYPE_SHORT_SPEC } from './form-text.ts';
export { FORM_TEXT_SPEC, TYPE_SHORT_SPEC };
// Template section copy for the create form (delivered by the list-page
// shell like the form* fields; the per-template edit/delete labels ride
// the template's own manageActions object instead).
export const TEMPLATE_TEXT_SPEC = [
  ['templateSectionTitle', 'groupingTemplate_sectionTitle'],
  ['templateNameLabel', 'groupingTemplate_nameLabel'],
  ['templateNamePlaceholder', 'groupingTemplate_namePlaceholder'],
  ['templateSaveLabel', 'groupingTemplate_saveFromForm'],
  ['templateUpdateLabel', 'groupingTemplate_updateSubmit'],
  ['templateEditingNoticeTemplate', 'groupingTemplate_editingNotice'],
  ['templateCancelEditLabel', 'groupingTemplate_cancelEdit'],
  ['templateEmptyText', 'groupingTemplate_empty'],
  ['templateWhenTodayTemplate', 'groupingTemplate_whenToday'],
  ['templateWhenTomorrowTemplate', 'groupingTemplate_whenTomorrow'],
  ['templateWhenDaysTemplate', 'groupingTemplate_whenDays'],
  ['templateToastSaved', 'groupingTemplate_toastSaved'],
  ['templateToastSaveFailedTemplate', 'groupingTemplate_toastSaveFailed'],
  ['templateToastDeleted', 'groupingTemplate_toastDeleted'],
  ['templateToastDeleteFailedTemplate', 'groupingTemplate_toastDeleteFailed'],
  ['templateMetaTemplate', 'groupingTemplate_metaTemplate'],
];
export const LIST_TEXT_RESOLVERS = {
  ...defineTextGens(GroupingListPageShell, [
    ['tabActivityLabel', 'groupingType_tabActivity'],
    ['tabTalentLabel', 'groupingType_tabTalent'],
    ['tabRaceLabel', 'groupingType_tabRace'],
    ['tabTowerLabel', 'groupingType_tabTower'],
    ...TYPE_SHORT_SPEC,
    ['prevWeekLabel', 'groupingList_prevWeek'],
    ['nextWeekLabel', 'groupingList_nextWeek'],
    ['weekHeaderTemplate', 'groupingList_weekHeader'],
    ['dayGroupHeaderTemplate', 'groupingList_dayGroupHeader'],
    ['undatedGroupLabel', 'groupingList_undatedGroup'],
    ['emptyInteractiveText', 'groupingList_emptyInteractive'],
    ['statusOpenLabel', 'groupingList_statusOpen'],
    ['peopleTemplate', 'groupingList_people'],
    ['newCarLabel', 'groupingList_newCar'],
    ['sealText', 'groupingList_seal'],
    ...FORM_TEXT_SPEC,
    ...TEMPLATE_TEXT_SPEC,
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
  constructor(ctx: Context, ev: any){ super(ctx, ev); }
  genGrouping(){
    return this.memo('grouping', () => new GroupingShell(this.ctx, this.data));
  }
  // Manage verdict for this page's grouping (leader, or an admin of
  // the grouping's own guild — the single shared verdict in
  // graphql-base). Drives both the block-tree action composition and
  // the web manageActions object below.
  genManageVerdict(){
    return this.memo('manageVerdict', async () => {
      return getGroupingManageVerdict(this.db, this.ctx.user, this.ctx.request, this.vc, this.data);
    });
  }
  // The manage action set as a composed object: present only when the
  // viewer may manage this grouping (the mutations re-verify with the
  // same verdict). Labels reuse the page's own catalog strings.
  async genManageActions(){
    const verdict = await this.genManageVerdict();
    if (!verdict.canManage) return null;
    return {
      editLabel: this.t('groupingDetail_edit'),
      completeLabel: this.t('groupingDetail_complete'),
      completingLabel: this.t('groupingDetail_completing'),
      restoreLabel: this.t('groupingDetail_restore'),
      disbandLabel: this.t('groupingDetail_disband'),
      disbandingLabel: this.t('groupingDetail_disbanding'),
      disbandConfirmTitle: this.t('groupingDetail_disbandConfirmTitle'),
      disbandConfirmMessageTemplate: this.t('groupingDetail_disbandConfirmMessage'),
      completeConfirmTitle: this.t('groupingDetail_completeConfirmTitle'),
      completeConfirmMessageTemplate: this.t('groupingDetail_completeConfirmMessage'),
    };
  }
  // Save-as-template action set: composed only for viewers who may
  // write in this car's guild (the same canWrite the create entry
  // requires); the mutation re-verifies. Labels come from the
  // groupingTemplate catalog section; the name input starts from the
  // car's title (client-side initial value, editable).
  async genTemplateSave(){
    return this.memo('templateSave', async () => {
      const tRow = await getTenantRowById(this.db, this.data.tenant).catch(() => null);
      const access = await getGuildAccess(this.db, this.ctx.user, tRow ? tRow.slug : '', this.ctx.request);
      if (!access.canWrite) return null;
      return {
        buttonLabel: this.t('groupingTemplate_saveButton'),
        dialogTitle: this.t('groupingTemplate_saveDialogTitle'),
        nameLabel: this.t('groupingTemplate_nameLabel'),
        submitLabel: this.t('groupingTemplate_saveSubmit'),
        toastSaved: this.t('groupingTemplate_toastSavedFromCar'),
        toastFailedTemplate: this.t('groupingTemplate_toastSaveFailed'),
      };
    });
  }
  // P20 ally sharing control: composed ONLY for viewers who may
  // manage this car (the same shared verdict as manageActions);
  // everyone else gets null and the sharing state is not sent as a
  // control at all. The setGroupingAllySharing mutation re-verifies.
  async genAllySharing(){
    const verdict = await this.genManageVerdict();
    if (!verdict.canManage) return null;
    // P20 is a T3 surface: below tier the sharing control is not
    // composed at all (the setGroupingAllySharing mutation
    // re-verifies the same verdict server-side).
    if (await tierLocked(this.db, this.data.tenant, 3)) return null;
    return {
      allyVisible: Number(this.data.ally_visible) === 1,
      visitorSlots: Number(this.data.visitor_slots) || 0,
      title: this.t('allies_sharingTitle'),
      hint: this.t('allies_sharingHint'),
      allyVisibleLabel: this.t('allies_allyVisibleLabel'),
      visitorSlotsLabel: this.t('allies_visitorSlotsLabel'),
      saveLabel: this.t('allies_sharingSaveButton'),
    };
  }
  // P18 AI recap (premium T3): the union variant is the verdict —
  // null (below T3 with the paygate OFF: the section does not
  // exist) / Locked (below T3, paygate ON) / NotEnabled (provider
  // unconfigured) / Ready / Empty, composed in recap-graphql.ts.
  // The detail page's own canView gate already ran, so every
  // viewer here may see a Ready recap; the generate action object
  // inside the variants is manage-verdict-gated there.
  genRecap(){
    return this.memo('recap', async () => recapSurfaceForGrouping(this.ctx, this.data));
  }
  // Combat reports v1 (premium T2): the union variant is the
  // verdict — null (below T2 with the paygate OFF: the section
  // does not exist) / Locked (below T2, paygate ON) / Ready /
  // Empty, composed in combat-graphql.ts. The detail page's own
  // canView gate already ran, so every viewer here may see a
  // Ready report; the per-encounter delete action objects inside
  // are uploader/manage-gated there.
  genCombatReport(){
    return this.memo('combatReport', async () => combatReportSurfaceForGrouping(this.ctx, this.data));
  }
  // F7 roster answers: composed ONLY for viewers who may manage this
  // car (leader / this guild's admins — the shared verdict); everyone
  // else gets null and the answers never leave the server.
  genRosterAnswers(){
    return this.memo('rosterAnswers', async () => {
      const verdict = await this.genManageVerdict();
      if (!verdict.canManage) return null;
      const ev = this.data;
      const [fields, answers, seats] = await Promise.all([
        listCustomFields(this.db, 'event', ev.id),
        listSignupAnswersByEvent(this.db, ev.id),
        listSignupSeats(this.db, ev.id),
      ]);
      if (!answers.length) return [];
      const labelOf = new Map(fields.map((f) => [f.id, f.label]));
      const nickOf = new Map((seats || []).map((r: any) => [String(r.uid), r.nickname]));
      return answers.map((a) => ({
        uid: a.signup_uid, nickname: nickOf.get(String(a.signup_uid)) || '',
        fieldId: String(a.field_id), fieldLabel: labelOf.get(a.field_id) || '',
        value: a.value,
      }));
    });
  }
  // Premium T2 scheduling advice (P3/P4/P5): composed only for the
  // car's managers; full shell when entitled, Locked shell when
  // unentitled with the paygate ON, null for everyone else —
  // including unentitled guilds while the paygate is OFF
  // (see scheduling-graphql.ts).
  genSchedulingAdvice(){
    return this.memo('schedulingAdvice', async () => composeGroupingSchedulingAdvice(this.ctx, this.data));
  }
  // Share URL for this car: the stable short link (lazily minted on
  // first read, then reused forever). Clients share exactly this
  // string and never compose URLs themselves; if minting fails, the
  // canonical long URL is served instead so sharing never breaks.
  async genShareUrl(){
    return this.memo('shareUrl', async () => {
      const ev = this.data;
      // A request that arrived through this guild's own subdomain
      // (white-label tier A) shares links on that host; every other
      // request keeps the main-host composition byte-identically.
      let origin: string | null = null;
      const tenantRow = await getTenantRowById(this.db, ev.tenant).catch(() => null);
      const tenantSlug = tenantRow ? tenantRow.slug : '';
      try {
        const host = new URL(this.ctx.request.url).hostname;
        if (parseGuildSubdomainSlug(host) === tenantSlug
          && await isGuildSubdomainEnabled(this.db, tenantSlug)) {
          origin = guildSubdomainOrigin(tenantSlug);
        } else if (await isLiveCustomDomainHost(this.db, host, tenantSlug)) {
          // A request that arrived through this guild's own custom
          // domain (white-label tier B) shares links on that host.
          origin = `https://${host.toLowerCase()}`;
        }
      } catch { origin = null; }
      try {
        const link = await mintShortLink(this.db, ev.tenant, ev.id);
        return origin ? shortLinkUrl(link.code, origin) : shortLinkUrl(link.code);
      } catch {
        return origin ? subdomainGroupingUrl(origin, ev.id) : canonicalGroupingUrl(tenantSlug, ev.id);
      }
    });
  }
  // Share-card image for this car: the same OG card URL the share
  // page's og:image and the reminder embed thumbnail use. The web
  // share-image action fetches exactly this URL and never composes
  // OG URLs itself; a missing tenant row yields null and the client
  // renders no share-image button.
  async genShareImageUrl(){
    return this.memo('shareImageUrl', async () => {
      const ev = this.data;
      const tenantRow = await getTenantRowById(this.db, ev.tenant).catch(() => null);
      return tenantRow ? carOgImageUrl(tenantRow.slug, ev.id) : null;
    });
  }
  // Mobile Bloks-lite: block tree for this page's content area. Per-seat actions and the disband button are composed per viewer (identity-stamp / leader-or-guild-admin checks all server-side), then substituted by blocksVersion.
  async genBlocks({ blocksVersion }: any = {}){
    const v = clampBlocksVersion(blocksVersion);
    return this.memo(`blocks:${v}`, async () => {
      const ev = this.data;
      const tRow = await getTenantRowById(this.db, ev.tenant).catch(() => null);
      const access = await getGuildAccess(this.db, this.ctx.user, tRow ? tRow.slug : '', this.ctx.request);
      const creatorDiscordId = ev.creator_user_id
        ? await getDiscordIdByUserId(this.db, ev.creator_user_id).catch(() => null)
        : null;
      const rows = await listSignupSeats(this.db, ev.id);
      const entries = [];
      for (let i = 0; i < ev.max_slots; i++) {
        entries.push(new SeatEntryShell(this.ctx, { row: rows[i] || null, index: i, ev, access, creatorDiscordId }));
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
        textRef: ev.status === 'completed' ? ['groupingDetail_completedHint']
          : ['groupingDetail_openHint'],
      }));
      blocks.push(new SectionBlockShell(this.ctx, {
        title: null,
        children: [
          new SectionHeaderBlockShell(this.ctx, { textRef: ['appBlocks_rosterTitle'] }),
          new SeatGridBlockShell(this.ctx, { entries }),
        ],
      }));
      const manage = await this.genManageVerdict();
      // Premium T2 scheduling advice (P3/P4/P5 summary lines for
      // mobile): managers only, composed by tierSurfaceState —
      // absent (unentitled, paygate OFF) pushes no block at all;
      // locked (paygate ON) pushes the locked copy as a plain text
      // block; open pushes draft + substitute headline lines with
      // server-rendered reasons. Advice only: no block here
      // carries a seat/invite action.
      if (manage.canManage) {
        try {
          const { tierSurfaceState } = await import('../platform/billing-service.ts');
          const adviceState = await tierSurfaceState(this.db, ev.tenant, 2);
          if (adviceState === 'locked') {
            blocks.push(new TextBlockShell(this.ctx, { variant: 'muted', text: this.t('schedulingAdvice_lockedBody') }));
          } else if (adviceState === 'open') {
            const facts = await buildMemberFacts(this.db, ev.tenant, startsAtEpoch(ev));
            const seatedIds = new Set(rows.map((r: any) => String(r.discord_id || '')).filter(Boolean));
            const pool = facts.filter((f: any) => !seatedIds.has(f.discordId));
            const draft = buildTeamDraft(pool, ev.max_slots || 0);
            const tt = (k: string, p?: any) => this.t(k, p);
            const renderReason = (r: any) => renderAdviceReason(tt, r);
            const lines: any[] = [new SectionHeaderBlockShell(this.ctx, { textRef: ['schedulingAdvice_draftTitle'] })];
            for (const d of draft.slice(0, 5)) {
              lines.push(new TextBlockShell(this.ctx, { variant: 'muted', text: `${d.facts.displayName} · ${adviceRoleLabel(tt, d.role)} · ${d.reasons.map(renderReason).join('；')}` }));
            }
            if (rows.length < (ev.max_slots || 0)) {
              const subs = rankSubstitutes(pool, '');
              if (subs.length) {
                lines.push(new SectionHeaderBlockShell(this.ctx, { textRef: ['schedulingAdvice_substitutesTitle'] }));
                for (const sub of subs.slice(0, 3)) {
                  lines.push(new TextBlockShell(this.ctx, { variant: 'muted', text: `${sub.facts.displayName} · ${sub.reasons.map(renderReason).join('；')}` }));
                }
              }
            }
            if (lines.length > 1) blocks.push(new SectionBlockShell(this.ctx, { title: null, children: lines }));
          }
        } catch { /* advice is additive: never break the detail blocks */ }
      }
      if (manage.canManage && access.canWrite) {
        blocks.push(new SpacerBlockShell(this.ctx, { size: 18 }));
        if (ev.status === 'completed') {
          // Completed: only the reopen entry is offered (edit/disband/complete are no longer sent).
          blocks.push(new ActionButtonBlockShell(this.ctx, {
            labelRef: ['groupingDetail_restore'], style: 'ghost',
            action: new UncompleteActionShell(this.ctx, { groupingId: String(ev.id) }),
          }));
        } else {
          blocks.push(new ActionButtonBlockShell(this.ctx, {
            labelRef: ['groupingDetail_edit'], style: 'ghost',
            action: new EditActionShell(this.ctx, { groupingId: String(ev.id) }),
          }));
          blocks.push(new SpacerBlockShell(this.ctx, { size: 10 }));
          blocks.push(new ActionButtonBlockShell(this.ctx, {
            labelRef: ['groupingDetail_complete'], style: 'ghost',
            action: new CompleteActionShell(this.ctx, { groupingId: String(ev.id), title: ev.title }),
          }));
          blocks.push(new SpacerBlockShell(this.ctx, { size: 10 }));
          blocks.push(new ActionButtonBlockShell(this.ctx, {
            labelRef: ['groupingDetail_disband'], style: 'danger',
            action: new DisbandActionShell(this.ctx, { groupingId: String(ev.id), title: ev.title }),
          }));
        }
      }
      return substituteForVersion(blocks, v, () => new FallbackBlockShell(this.ctx));
    });
  }
}

/* ---------- Public car share page (/s/:code) ----------
 * Anonymous read surface: the shell wraps resolveSharedGrouping's
 * public view (OG-card fields only — the service drops every member
 * detail before data reaches this shell). Unknown / malformed /
 * deleted / dev_only targets get the same shell with exists=false
 * and empty data: the client renders the not-found state from this
 * shell's own copy fields. Mirrors gear's SharedBuildPageShell. */
export class SharedGroupingPageShell extends ShellBase {
  get view(){ return this.data.shared || null; }
  genExists(){ return !!this.view; }
  genSlug(){ return this.view ? this.view.slug : null; }
  genGuildName(){ return this.view ? this.view.guildName : null; }
  genTitle(){ return this.view ? this.view.title : null; }
  genType(){ return this.view ? (TYPE_TO_ENUM[this.view.type] || 'ACTIVITY') : null; }
  genDungeonName(){ return this.view ? enDungeonName(this.locale, this.view.dungeon || null) : null; }
  genStartsAt(){
    if (!this.view) return null;
    return this.view.startsAtUtc ? String(this.view.startsAtUtc) : (this.view.startsAt || '');
  }
  genStatus(){ return this.view ? this.view.status : null; }
  genOccupiedCount(){ return this.view ? this.view.occupiedCount : 0; }
  genMaxSlots(){ return this.view ? this.view.maxSlots : 0; }
  genSeats(){ return this.view ? this.view.seats : []; }
  // OG card image for this shared car (the view already carries the
  // public slug + event id the card URL is built from; the same URL
  // this page's og:image names). Null for a missing target.
  genShareImageUrl(){ return this.view ? carOgImageUrl(this.view.slug, this.view.eventId) : null; }
  // People count line: the detail page's own template, filled with
  // this view's public counts (never rendered for a missing target).
  genSharePeopleTemplate(){
    return this.memo('sharePeople', () => this.t('groupingDetail_people', {
      occupied: this.view ? this.view.occupiedCount : 0,
      max: this.view ? this.view.maxSlots : 0,
    }));
  }
  // Type chip: the groupingType catalog's short label for this car's
  // type (same composition as the block tree's ChipRow).
  genShareTypeLabel(){
    return this.t('groupingType_' + (TYPE_SHORT_KEY[this.view ? this.view.type : ''] || 'shortActivity'));
  }
}

export const SHARED_GROUPING_TEXT_RESOLVERS = {
  ...defineTextGens(SharedGroupingPageShell, [
    ['shareKicker', 'carshare_kicker'],
    ['shareLoginLabel', 'carshare_loginLabel'],
    ['shareOpenLabel', 'carshare_openLabel'],
    ['shareNotFoundTitle', 'carshare_notFoundTitle'],
    ['shareNotFoundBody', 'carshare_notFoundBody'],
    ['shareReadonlyHint', 'carshare_readonlyHint'],
    ['shareStatusClosedLabel', 'carshare_statusClosed'],
    ['shareSeatsTitle', 'carshare_seatsTitle'],
    ['shareStatusOpenLabel', 'groupingDetail_statusOpen'],
    ['shareStatusCompletedLabel', 'groupingDetail_statusCompleted'],
    ['shareImageLabel', 'groupingDetail_shareImage'],
    ['shareImageSaved', 'groupingDetail_shareImageSaved'],
    ['shareImageCopied', 'groupingDetail_shareImageCopied'],
    ['shareImageFailed', 'groupingDetail_shareImageFailed'],
    ['shareCopyFailedManual', 'groupingDetail_copyFailedManual'],
  ]),
};

export const DETAIL_TEXT_RESOLVERS = {
  ...defineTextGens(GroupingDetailPageShell, [
    ['detailNotFoundText', 'groupingDetail_notFound'],
    ['detailBackToListLabel', 'groupingDetail_backToList'],
    ['detailShareLabel', 'groupingDetail_share'],
    ['detailShareImageLabel', 'groupingDetail_shareImage'],
    ['detailShareImageSaved', 'groupingDetail_shareImageSaved'],
    ['detailShareImageCopied', 'groupingDetail_shareImageCopied'],
    ['detailShareImageFailed', 'groupingDetail_shareImageFailed'],
    ['detailEditLabel', 'groupingDetail_edit'],
    ['detailDisbandLabel', 'groupingDetail_disband'],
    ['detailDisbandingLabel', 'groupingDetail_disbanding'],
    ['detailStatusOpenLabel', 'groupingDetail_statusOpen'],
    ['detailPeopleTemplate', 'groupingDetail_people'],
    ['detailOpenHint', 'groupingDetail_openHint'],
    ['detailToastDisbanded', 'groupingDetail_toastDisbanded'],
    ['detailToastDisbandFailedTemplate', 'groupingDetail_toastDisbandFailed'],
    ['detailCompleteLabel', 'groupingDetail_complete'],
    ['detailCompletingLabel', 'groupingDetail_completing'],
    ['detailStatusCompletedLabel', 'groupingDetail_statusCompleted'],
    ['detailRestoreLabel', 'groupingDetail_restore'],
    ['detailCompleteConfirmTitle', 'groupingDetail_completeConfirmTitle'],
    ['detailCompleteConfirmMessageTemplate', 'groupingDetail_completeConfirmMessage'],
    ['detailToastCompleted', 'groupingDetail_toastCompleted'],
    ['detailToastCompleteFailedTemplate', 'groupingDetail_toastCompleteFailed'],
    ['detailToastRestored', 'groupingDetail_toastRestored'],
    ['detailToastRestoreFailedTemplate', 'groupingDetail_toastRestoreFailed'],
    ['detailCompletedHint', 'groupingDetail_completedHint'],
    ['detailLinkCopied', 'groupingDetail_linkCopied'],
    ['detailCopyFailedManual', 'groupingDetail_copyFailedManual'],
    ['detailDisbandConfirmTitle', 'groupingDetail_disbandConfirmTitle'],
    ['detailDisbandConfirmMessageTemplate', 'groupingDetail_disbandConfirmMessage'],
    ['confirmOkLabel', 'common_confirm'],
    ['confirmCancelLabel', 'common_cancel'],
    ...TYPE_SHORT_SPEC,
    ['seatEmptyJoinLabel', 'seat_emptyJoin'],
    ['seatEmptyLabel', 'seat_empty'],
    ['seatModalTitleTemplate', 'seat_modalTitle'],
    ['seatModalSubtitle', 'seat_modalSubtitle'],
    ['seatNameLabel', 'seat_nameLabel'],
    ['seatNamePlaceholder', 'seat_namePlaceholder'],
    ['seatNameRequired', 'seat_nameRequired'],
    ['seatSelfTabLabel', 'seat_selfTab'],
    ['seatProxyTabLabel', 'seat_proxyTab'],
    ['seatSelfNameHint', 'seat_selfNameHint'],
    ['seatProxySearchPlaceholder', 'seat_proxySearchPlaceholder'],
    ['seatProxyPickRequired', 'seat_proxyPickRequired'],
    ['seatProxyEmptyText', 'seat_proxyEmpty'],
    ['seatSectLabel', 'seat_sectLabel'],
    ['seatCancelLabel', 'common_cancel'],
    ['seatConfirmJoinLabel', 'seat_confirmJoin'],
    ['seatJoiningLabel', 'seat_joining'],
    ['seatLeaderLabel', 'seat_leader'],
    ['seatToastSect', 'seat_toastSect'],
    ['seatToastJoined', 'seat_toastJoined'],
    ['seatToastJoinFailedTemplate', 'seat_toastJoinFailed'],
    ['seatToastLeft', 'seat_toastLeft'],
    ['seatToastLeaveFailedTemplate', 'seat_toastLeaveFailed'],
    ['detailReadyProgressTemplate', 'groupingDetail_readyProgress'],
    ['rosterAnswersTitle', 'groupingDetail_rosterAnswersTitle'],
    ['seatReadyLabel', 'seat_readyMark'],
    ['seatReadyActionLabel', 'seat_readyAction'],
    ['seatUnreadyActionLabel', 'seat_unreadyAction'],
    ['seatToastReady', 'seat_toastReady'],
    ['seatToastUnready', 'seat_toastUnready'],
    ['seatToastReadyFailedTemplate', 'seat_toastReadyFailed'],
    ['seatLeaveConfirmTitle', 'seat_leaveConfirmTitle'],
    ['seatLeaveConfirmMessageTemplate', 'seat_leaveConfirmMessage'],
    ...FORM_TEXT_SPEC,
  ]),
};



export const groupingsResolvers = {
  Query: {
    ...scheduleResolvers.Query,
    ...combatResolvers.Query,
    groupingListPage: async (_: any, { slug, tab }: any, ctx: Context) => {
      const db = ctx.env.DB;
      // Tenant must exist; bound guilds are members-only (enforced server-side — non-members get no data).
      const a = await getGuildAccess(db, ctx.user, slug, ctx.request);
      if (!a.exists) throw new Error(errText(ctx, 'guildNotFound'));
      if (!a.canView) throw new Error(errText(ctx, 'memberOnlyView'));
      touchGuildRoster(ctx, a);
      return groupingListPage(ctx, a.tenant.slug, tab);
    },

    groupingDetailPage: async (_: any, { slug, id }: any, ctx: Context) => {
      const db = ctx.env.DB;
      const ev = await getEventRow(db, parseInt(id, 10) || 0);
      if (!ev) throw new Error(errText(ctx, 'groupingNotFound'));
      // Tenant isolation: a supplied slug must match the grouping's own guild, else treat as nonexistent (never leak another guild's data).
      const evTenant = await getTenantRowById(db, ev.tenant).catch(() => null);
      const evSlug = evTenant ? evTenant.slug : '';
      if (slug != null && s(slug, 40) !== evSlug) throw new Error(errText(ctx, 'groupingNotFound'));
      // Bound guild: non-members are treated as nonexistent — no grouping content leaks.
      const a = await getGuildAccess(db, ctx.user, evSlug, ctx.request);
      if (!a.canView) throw new Error(errText(ctx, 'groupingNotFound'));
      touchGuildRoster(ctx, a);
      return new GroupingDetailPageShell(ctx, ev);
    },

    // Public car share page (/s/:code): anonymous; the short code is
    // the capability — resolving it yields only the car's public face.
    sharedGrouping: async (_: any, { code }: any, ctx: Context) => {
      const shared = await resolveSharedGrouping(ctx.env.DB, String(code || ''), isDevRequest(ctx.request)).catch(() => null);
      return new SharedGroupingPageShell(ctx, { shared });
    },

    // ===== Viewer hierarchy (root = user) =====
  },
  Mutation: {
    ...scheduleResolvers.Mutation,
    ...schedulingAdviceResolvers.Mutation,
    ...recapResolvers.Mutation,
    ...combatResolvers.Mutation,
    createGrouping: async (_: any, { input }: any, ctx: Context) => {
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
      // Headcount rules live in resolveGroupingShape (shared with the
      // template mutations, so template-built cars match hand-built ones).
      const { dungeonName, maxSlots } = await resolveGroupingShape(db, type, input.dungeonId);
      // F7: the car's custom signup fields are validated BEFORE the
      // car exists — an invalid field set rejects the whole create.
      const fieldParse = parseCustomFieldDefs(input.customFields);
      if ('error' in fieldParse) return gFail(ctx, fieldParse.error);
      // Persist leader identity from the session (requireWrite guarantees login); re-verified at disband.
      const tenantRow = await getTenantRow(db, slug).catch(() => null);
      if (!tenantRow) return gFail(ctx, 'guildNotFound');
      const r = await insertEvent(db, {
        tenant: tenantRow.id, title, type, description: '', starts_at: '', starts_at_utc: utc,
        max_slots: maxSlots, status: 'open', origin: 'member', created_by: GROUPING_DEFAULT_CREATED_BY,
        dungeon: dungeonName, creator_user_id: ctx.user!.userId,
        // The car's home timezone: the leader's own zone as presented
        // by their client on this request (share cards print the
        // start in it — see car-tz.ts). Null when the client sent none.
        created_tz: capturedTzOrNull(ctx.tz),
      });
      const eventId = r.last_row_id;
      if (fieldParse.defs.length) {
        await replaceCustomFields(db, 'event', eventId, fieldParse.defs);
      }
      if (Array.isArray(input.seats)) {
        // Leader-name lock (ruling 2026-11-01): the leader seat — seat
        // 0 of the submitted list, where the create form auto-seats
        // the creator — is named by the server from the creator's
        // identity chain (the same canonicalSignupName the self-signup
        // path uses: bound-server nickname, then the global name);
        // whatever nickname the client sent for that seat is ignored,
        // and the seat is stamped with the creator unconditionally,
        // exactly like a self-signup. When no identity name resolves
        // (the chain ends at the session name, so this is a degenerate
        // case), the submitted name stands and the old conditional
        // stamping applies. Other pre-seated rows are untouched.
        const leaderName = (await canonicalSignupName(db, ctx.user, slug).catch(() => '')).slice(0, 30);
        const seatRows = [];
        const seatsIn = input.seats.slice(0, maxSlots);
        for (let i = 0; i < seatsIn.length; i++) {
          const st = seatsIn[i];
          const nm = s(st.nickname, 30);
          const wp = s(st.weapon, 20);
          if (!wp) continue;
          if (i === 0 && leaderName) {
            seatRows.push({ event_id: eventId, nickname: leaderName, uid: newUid(), role: roleOf(wp), weapon: wp, discord_id: String(ctx.user!.discordId) });
            continue;
          }
          if (!nm) continue;
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

    /* ---------- Grouping templates (guild-shared) ---------- */

    createGroupingTemplate: async (_: any, { input }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:tplcreate:' + getClientIp(ctx.request), 20)) {
        return tFail(ctx, 'rateLimited');
      }
      const slug = s(input.slug, 40);
      const gate = await requireWrite(db, ctx.user, slug, ctx.request);
      if (gate) return tFail(ctx, gate);
      const parsed = await parseTemplateInput(db, input);
      if (parsed.error) return tFail(ctx, parsed.error);
      const fieldParse = parseCustomFieldDefs(input.customFields);
      if ('error' in fieldParse) return tFail(ctx, fieldParse.error);
      const now = Math.floor(Date.now() / 1000);
      const tenantRow = await getTenantRow(db, slug).catch(() => null);
      if (!tenantRow) return tFail(ctx, 'guildNotFound');
      const r = await insertGroupingTemplate(db, {
        tenant: tenantRow.id, name: parsed.name, type: parsed.type, title: parsed.title,
        dungeon: parsed.dungeonName, max_slots: parsed.maxSlots,
        start_days_ahead: parsed.daysAhead, start_minutes: parsed.startMinutes,
        creator_user_id: ctx.user!.userId, created_at: now, updated_at: now,
      });
      if (fieldParse.defs.length) {
        await replaceCustomFields(db, 'template', r.last_row_id, fieldParse.defs);
      }
      const row = await getGroupingTemplate(db, r.last_row_id);
      return new TemplatePayloadShell(ctx, { ok: true, template: row ? toGroupingTemplate(ctx, row) : null });
    },

    // Snapshot an existing car into a template: any member who may
    // write in the car's guild (i.e. anyone who can create cars there).
    // The car's absolute start becomes a day offset + time-of-day in
    // the saver's timezone; a timeless car defaults to today at 20:00,
    // the create form's own default hour.
    saveGroupingTemplate: async (_: any, { input }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:tplsave:' + getClientIp(ctx.request), 20)) {
        return tFail(ctx, 'rateLimited');
      }
      const gid = parseInt(input.groupingId, 10) || 0;
      const ev = await getEventRow(db, gid);
      if (!ev) return tFail(ctx, 'groupingNotFound');
      const evTenantRow = await getTenantRowById(db, ev.tenant).catch(() => null);
      const gate = await requireWrite(db, ctx.user, evTenantRow ? evTenantRow.slug : '', ctx.request);
      if (gate) return tFail(ctx, gate);
      const name = s(input.name, 40) || s(ev.title, 40);
      if (!name) return tFail(ctx, 'templateNameRequired');
      let daysAhead = 0;
      let startMinutes = 20 * 60;
      if (ev.starts_at_utc) {
        const off = templateOffsetFromStartsAt(ev.starts_at_utc, Math.floor(Date.now() / 1000), ctx.tz);
        daysAhead = off.daysAhead;
        startMinutes = off.startMinutes;
      }
      const now = Math.floor(Date.now() / 1000);
      const r = await insertGroupingTemplate(db, {
        tenant: ev.tenant, name, type: ev.type, title: ev.title,
        dungeon: ev.dungeon || '', max_slots: ev.max_slots,
        start_days_ahead: daysAhead, start_minutes: startMinutes,
        creator_user_id: ctx.user!.userId, created_at: now, updated_at: now,
      });
      // F7: the saved template inherits the car's signup-form fields,
      // so a car built from it later carries the same form.
      const carFields = await listCustomFields(db, 'event', ev.id);
      if (carFields.length) {
        await replaceCustomFields(db, 'template', r.last_row_id, carFields.map((f) => ({
          label: f.label, fieldType: f.field_type === 'choice' ? 'choice' : 'text',
          options: parseFieldOptions(f.options_json), required: !!f.required,
        }) as CustomFieldDef));
      }
      const row = await getGroupingTemplate(db, r.last_row_id);
      return new TemplatePayloadShell(ctx, { ok: true, template: row ? toGroupingTemplate(ctx, row) : null });
    },

    // Edit/delete gate (ruling for this feature): the template's
    // creator, or an admin of the template's OWN guild — the shared
    // grouping manage verdict and gate, re-verified here regardless of
    // what the clients rendered.
    updateGroupingTemplate: async (_: any, { id, input }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:tplupdate:' + getClientIp(ctx.request), 20)) {
        return tFail(ctx, 'rateLimited');
      }
      const tid = parseInt(id, 10) || 0;
      const row = await getGroupingTemplate(db, tid);
      if (!row) return tFail(ctx, 'templateNotFound');
      const manage = await groupingManageGate(db, ctx.user, ctx.request, vcOf(ctx), row);
      if (manage.writeCode) return tFail(ctx, manage.writeCode);
      if (!manage.canManage) return tFail(ctx, 'templateForbidden');
      const parsed = await parseTemplateInput(db, input);
      if (parsed.error) return tFail(ctx, parsed.error);
      if (input.customFields != null) {
        const fieldParse = parseCustomFieldDefs(input.customFields);
        if ('error' in fieldParse) return tFail(ctx, fieldParse.error);
        await replaceCustomFields(db, 'template', tid, fieldParse.defs);
      }
      await updateGroupingTemplateFields(db, tid, {
        name: parsed.name, type: parsed.type, title: parsed.title,
        dungeon: parsed.dungeonName, max_slots: parsed.maxSlots,
        start_days_ahead: parsed.daysAhead, start_minutes: parsed.startMinutes,
        updated_at: Math.floor(Date.now() / 1000),
      });
      const nrow = await getGroupingTemplate(db, tid);
      return new TemplatePayloadShell(ctx, { ok: true, template: nrow ? toGroupingTemplate(ctx, nrow) : null });
    },

    deleteGroupingTemplate: async (_: any, { id }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:tpldelete:' + getClientIp(ctx.request), 20)) {
        return dFail(ctx, 'rateLimited');
      }
      const tid = parseInt(id, 10) || 0;
      const row = await getGroupingTemplate(db, tid);
      if (!row) return dFail(ctx, 'templateNotFound');
      const manage = await groupingManageGate(db, ctx.user, ctx.request, vcOf(ctx), row);
      if (manage.writeCode) return dFail(ctx, manage.writeCode);
      if (!manage.canManage) return dFail(ctx, 'templateForbidden');
      await deleteGroupingTemplateRow(db, tid);
      return new DeletePayloadShell(ctx, { ok: true });
    },

    updateGrouping: async (_: any, { id, input }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:update:' + getClientIp(ctx.request), 20)) {
        return gFail(ctx, 'rateLimited');
      }
      const gid = parseInt(id, 10) || 0;
      const ev = await getEventRow(db, gid);
      if (!ev) return gFail(ctx, 'groupingNotFound');
      const manage = await groupingManageGate(db, ctx.user, ctx.request, vcOf(ctx), ev);
      if (manage.writeCode) return gFail(ctx, manage.writeCode);
      if (ev.origin !== 'member') return gFail(ctx, 'officialEvent');
      // Edit gating: the leader, or an admin of this grouping's own
      // guild (ruling 2026-10-26: guild admins manage every grouping in
      // their guild with the leader's rights; seat-list edits go
      // through this mutation too). Legacy groupings with no recorded
      // leader can be edited by a guild admin; with neither, no one.
      if (!manage.canManage) {
        return gFail(ctx, ev.creator_user_id ? 'leaderOnlyEdit' : 'noCreatorRecordedEdit');
      }
      const patch: Record<string, any> = {};
      const set = (col: any, val: any) => { patch[col] = val; };
      if (input.title !== undefined && input.title !== null) set('title', s(input.title, 40));
      if (input.startsAt !== undefined && input.startsAt !== null) {
        let u = parseInt(input.startsAt, 10) || 0;
        if (!u) { const ms = Date.parse(input.startsAt); if (!Number.isNaN(ms)) u = Math.floor(ms / 1000); }
        if (u > 0) {
          set('starts_at_utc', u);
          // Re-framing the start re-frames the car's home timezone:
          // it follows whoever set the time, from their client's zone.
          const tz = capturedTzOrNull(ctx.tz);
          if (tz) set('created_tz', tz);
        }
      }
      if (ev.status === 'draft') set('status', 'open');
      if (Object.keys(patch).length) {
        await updateEventFields(db, gid, null, patch);
      }
      if (Array.isArray(input.seats)) {
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
        // Leader-name lock (ruling 2026-11-01): the leader seat's name
        // is not editable — not by the leader, not by a guild admin.
        // The seat is located in the OLD table the same way the seat
        // composition and the reminder identify it: the row stamped
        // with the creator's discord_id, else the unique row carrying
        // the creator's current identity name. Its position carries
        // over to the rewritten table, where the submitted name for
        // that position is replaced by the creator's CURRENT identity
        // name (canonicalSignupName, resolved for the creator — the
        // name follows the person, so a Discord rename moves it); if
        // no identity name resolves, the old name is frozen in place
        // instead. Legacy groupings with no (resolvable) creator
        // record freeze their first seat's existing name. When no
        // leader seat can be located (the creator is not seated),
        // nothing is forced.
        // Stamps are unaffected: the carry rules above still decide
        // them (editing never stamps).
        const oldOrdered = await listSignupSeats(db, gid);
        let leaderIdx = -1;
        let leaderName = '';
        const creatorDiscordId = ev.creator_user_id
          ? await getDiscordIdByUserId(db, ev.creator_user_id).catch(() => null)
          : null;
        if (creatorDiscordId) {
          leaderIdx = oldOrdered.findIndex((r) => r.discord_id && String(r.discord_id) === String(creatorDiscordId));
          const evTenantRow = await getTenantRowById(db, ev.tenant).catch(() => null);
          const identityName = (await canonicalSignupName(db, { discordId: String(creatorDiscordId), name: '' }, evTenantRow ? evTenantRow.slug : '').catch(() => '')).slice(0, 30);
          if (leaderIdx < 0 && identityName) {
            const sameName = oldOrdered.map((r, i) => (String(r.nickname || '').trim() === identityName ? i : -1)).filter((i) => i >= 0);
            if (sameName.length === 1) leaderIdx = sameName[0];
          }
          if (leaderIdx >= 0) leaderName = identityName || String(oldOrdered[leaderIdx].nickname || '').slice(0, 30);
        } else if (oldOrdered.length) {
          leaderIdx = 0;
          leaderName = String(oldOrdered[0].nickname || '').slice(0, 30);
        }
        await deleteSignupsByEvent(db, gid);
        // F7: the rewrite re-mints every seat uid; answers keyed by
        // the old uids would point at seats that no longer exist.
        await deleteSignupAnswersByEvent(db, gid);
        const seatRows = [];
        let insertIdx = 0;
        for (const st of input.seats.slice(0, ev.max_slots)) {
          let nm = s(st.nickname, 30);
          const wp = s(st.weapon, 20);
          if (!wp) continue;
          // The leader position's name comes from the lock, not the
          // submission (the save still succeeds; other seats rename
          // freely).
          if (insertIdx === leaderIdx && leaderName) nm = leaderName;
          if (!nm) continue;
          const stamp = await carryStamp(nm);
          seatRows.push({ event_id: gid, nickname: nm, uid: newUid(), role: roleOf(wp), weapon: wp, discord_id: stamp });
          insertIdx++;
        }
        if (seatRows.length) await insertSignups(db, seatRows);
      }
      const nev = await getEventRow(db, gid);
      publishGroupingEvent(ctx, (await getTenantRowById(db, ev.tenant).catch(() => null))?.slug || '', gid, 'updated');
      return new GroupingPayloadShell(ctx, { ok: true, grouping: toGrouping(ctx, nev) });
    },

    // Disband (2026-10-24): the sole exception to "anyone can manage" —
    // the leader, or an admin of the grouping's own guild (ruling
    // 2026-10-26), re-verified server-side via the shared manage gate
    // regardless of what the frontend shows. Legacy groupings with no
    // recorded leader can be disbanded by a guild admin; with neither,
    // no one.
    disbandGrouping: async (_: any, { id }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:disband:' + getClientIp(ctx.request), 10)) {
        return dFail(ctx, 'rateLimited');
      }
      const gid = parseInt(id, 10) || 0;
      const ev = await getEventTenantCreator(db, gid);
      if (!ev) return dFail(ctx, 'groupingNotFound');
      const manage = await groupingManageGate(db, ctx.user, ctx.request, vcOf(ctx), ev);
      if (manage.writeCode) return dFail(ctx, manage.writeCode);
      if (!manage.canManage) {
        return dFail(ctx, ev.creator_user_id ? 'leaderOnlyDisband' : 'noCreatorRecorded');
      }
      await deleteEventCascade(db, gid, null);
      const evTenantRow = await getTenantRowById(db, ev.tenant).catch(() => null);
      publishGroupingEvent(ctx, evTenantRow ? evTenantRow.slug : '', gid, 'deleted');
      return new DeletePayloadShell(ctx, { ok: true });
    },

    // Complete (2026-10-25): a finished grouping is marked completed —
    // unlike closed, which merely stops signups, stays listed, and
    // still reminds. completed vanishes from every list, and the
    // reminder/push definitions (PENDING_WHERE accepts only
    // open/closed) stop firing automatically — even a queued alarm is
    // filtered when GuildHub re-reads D1 at fire time. Same gate as
    // edit/disband: the leader, or an admin of the grouping's own
    // guild. Completable from open or closed.
    completeGrouping: async (_: any, { id }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:complete:' + getClientIp(ctx.request), 10)) {
        return gFail(ctx, 'rateLimited');
      }
      const gid = parseInt(id, 10) || 0;
      const ev = await getEventRow(db, gid);
      if (!ev) return gFail(ctx, 'groupingNotFound');
      const manage = await groupingManageGate(db, ctx.user, ctx.request, vcOf(ctx), ev);
      if (manage.writeCode) return gFail(ctx, manage.writeCode);
      if (ev.origin !== 'member') return gFail(ctx, 'officialEvent');
      if (!manage.canManage) {
        return gFail(ctx, ev.creator_user_id ? 'leaderOnlyComplete' : 'noCreatorRecordedComplete');
      }
      if (ev.status === 'completed') return gFail(ctx, 'groupingAlreadyCompleted');
      // draft is invisible across the whole GraphQL surface (lists filter it): treat as nonexistent.
      if (ev.status !== 'open' && ev.status !== 'closed') return gFail(ctx, 'groupingNotFound');
      await setEventStatus(db, gid, 'completed');
      const nev = await getEventRow(db, gid);
      // kind=updated: live-remove from lists + GuildHub reschedules alarms (a completed grouping is no longer a pending reminder).
      publishGroupingEvent(ctx, (await getTenantRowById(db, ev.tenant).catch(() => null))?.slug || '', gid, 'updated');
      return new GroupingPayloadShell(ctx, { ok: true, grouping: toGrouping(ctx, nev) });
    },

    // Reopen (undo complete): pairs with completeGrouping, same gate.
    // Always returns to open — the pre-complete closed state is not
    // restored (keep it simple; the leader can close again, via REST
    // close / the state machine).
    reopenGrouping: async (_: any, { id }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:reopen:' + getClientIp(ctx.request), 10)) {
        return gFail(ctx, 'rateLimited');
      }
      const gid = parseInt(id, 10) || 0;
      const ev = await getEventRow(db, gid);
      if (!ev) return gFail(ctx, 'groupingNotFound');
      const manage = await groupingManageGate(db, ctx.user, ctx.request, vcOf(ctx), ev);
      if (manage.writeCode) return gFail(ctx, manage.writeCode);
      if (ev.origin !== 'member') return gFail(ctx, 'officialEvent');
      if (!manage.canManage) {
        return gFail(ctx, ev.creator_user_id ? 'leaderOnlyReopen' : 'noCreatorRecordedReopen');
      }
      if (ev.status !== 'completed') return gFail(ctx, 'groupingNotCompleted');
      await setEventStatus(db, gid, 'open');
      const nev = await getEventRow(db, gid);
      publishGroupingEvent(ctx, (await getTenantRowById(db, ev.tenant).catch(() => null))?.slug || '', gid, 'updated');
      return new GroupingPayloadShell(ctx, { ok: true, grouping: toGrouping(ctx, nev) });
    },

    joinGrouping: async (_: any, { input }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:join:' + getClientIp(ctx.request), 30)) {
        return sFail(ctx, 'rateLimited');
      }
      const gid = parseInt(input.groupingId, 10) || 0;
      const ev = await getEventRow(db, gid);
      if (!ev) return sFail(ctx, 'groupingNotFound');
      if (ev.status !== 'open') return sFail(ctx, 'groupingClosed');
      const evTenantRow = await getTenantRowById(db, ev.tenant).catch(() => null);
      const gate = await requireWrite(db, ctx.user, evTenantRow ? evTenantRow.slug : '', ctx.request);
      if (gate) return sFail(ctx, gate);
      const weapon = s(input.weapon, 40);
      const uid = newUid();
      // F7: answers are validated against THIS car's field set before
      // any seat is taken — required fields, choice membership and
      // length caps are re-verified server-side.
      const carFields = await listCustomFields(db, 'event', gid);
      let answerRows: { fieldId: number; value: string }[] = [];
      if (carFields.length) {
        const parsedAnswers = validateSignupAnswers(carFields, input.answers);
        if ('error' in parsedAnswers) return sFail(ctx, parsedAnswers.error);
        answerRows = parsedAnswers.answers;
      }
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
        const m = await getGuildMember(db, ev.tenant, forId).catch(() => null);
        if (!m) return sFail(ctx, 'proxyTargetNotInRoster');
        nickname = String(m.nick || '').trim() || String(m.global_name || '').trim();
        if (!nickname) return sFail(ctx, 'nicknameRequired');
        nickname = nickname.slice(0, 30);
        stamp = forId;
      } else {
        nickname = (await canonicalSignupName(db, ctx.user, evTenantRow ? evTenantRow.slug : '')).slice(0, 30);
        if (!nickname) return sFail(ctx, 'nicknameRequired');
        stamp = String(ctx.user!.discordId);
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
      for (const a of answerRows) {
        await insertSignupAnswer(db, { eventId: gid, signupUid: uid, fieldId: a.fieldId, value: a.value });
      }
      const g = toGrouping(ctx, ev);
      publishGroupingEvent(ctx, (await getTenantRowById(db, ev.tenant).catch(() => null))?.slug || '', gid, 'seats');
      return new SeatPayloadShell(ctx, { ok: true, seats: await g.genSeats() });
    },

    leaveGrouping: async (_: any, { input }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:leave:' + getClientIp(ctx.request), 30)) {
        return sFail(ctx, 'rateLimited');
      }
      const gid = parseInt(input.groupingId, 10) || 0;
      const ev0 = await getEventTenant(db, gid);
      if (!ev0) return sFail(ctx, 'groupingNotFound');
      const ev0TenantRow = await getTenantRowById(db, ev0.tenant).catch(() => null);
      const gate = await requireWrite(db, ctx.user, ev0TenantRow ? ev0TenantRow.slug : '', ctx.request);
      if (gate) return sFail(ctx, gate);
      const r = await deleteSignupByEventUid(db, gid, s(input.uid, 30));
      if (!r.changes) return sFail(ctx, 'seatNotFound');
      // F7: the seat's form answers leave with the seat.
      await deleteSignupAnswersByEventUid(db, gid, s(input.uid, 30));
      const ev = await getEventRow(db, gid);
      const g = ev ? toGrouping(ctx, ev) : null;
      publishGroupingEvent(ctx, ev0TenantRow ? ev0TenantRow.slug : '', gid, 'seats');
      return new SeatPayloadShell(ctx, { ok: true, seats: g ? await g.genSeats() : null });
    },

    updateSeatWeapon: async (_: any, { input }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:seat:' + getClientIp(ctx.request), 30)) {
        return sFail(ctx, 'rateLimited');
      }
      const gid = parseInt(input.groupingId, 10) || 0;
      const weapon = s(input.weapon, 40);
      if (!weapon) return sFail(ctx, 'paramsIncomplete');
      const ev0 = await getEventTenant(db, gid);
      if (!ev0) return sFail(ctx, 'groupingNotFound');
      const ev0TenantRow = await getTenantRowById(db, ev0.tenant).catch(() => null);
      const gate = await requireWrite(db, ctx.user, ev0TenantRow ? ev0TenantRow.slug : '', ctx.request);
      if (gate) return sFail(ctx, gate);
      const r = await updateSignupWeaponRoleByUid(db, gid, s(input.uid, 30), weapon, roleOf(weapon));
      if (!r.changes) return sFail(ctx, 'seatNotFound');
      const ev = await getEventRow(db, gid);
      const g = ev ? toGrouping(ctx, ev) : null;
      publishGroupingEvent(ctx, ev0TenantRow ? ev0TenantRow.slug : '', gid, 'seats');
      return new SeatPayloadShell(ctx, { ok: true, seats: g ? await g.genSeats() : null });
    },

    /* Readiness toggle: marks every seat stamped with the caller's
     * own discord_id in this grouping (one person may hold two
     * seats — one readiness fact). Zero touched seats = the caller
     * is not seated here. Later reminder beats skip ready members. */
    setSeatReady: async (_: any, { input }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:ready:' + getClientIp(ctx.request), 30)) {
        return sFail(ctx, 'rateLimited');
      }
      const gid = parseInt(input.groupingId, 10) || 0;
      const ev0 = await getEventTenant(db, gid);
      if (!ev0) return sFail(ctx, 'groupingNotFound');
      const ev0TenantRow = await getTenantRowById(db, ev0.tenant).catch(() => null);
      const gate = await requireWrite(db, ctx.user, ev0TenantRow ? ev0TenantRow.slug : '', ctx.request);
      if (gate) return sFail(ctx, gate);
      const readyAt = input.ready ? Math.floor(Date.now() / 1000) : null;
      const r = await updateSignupReadyByEventDiscord(db, gid, String(ctx.user!.discordId), readyAt);
      if (!r.changes) return sFail(ctx, 'notSeated');
      const ev = await getEventRow(db, gid);
      const g = ev ? toGrouping(ctx, ev) : null;
      publishGroupingEvent(ctx, ev0TenantRow ? ev0TenantRow.slug : '', gid, 'seats');
      return new SeatPayloadShell(ctx, { ok: true, seats: g ? await g.genSeats() : null });
    },
  },
  types: {
    ...scheduleResolvers.types,
    ...schedulingAdviceResolvers.types,
    CustomField: {
      id: (p: any) => p.id, label: (p: any) => p.label, fieldType: (p: any) => p.fieldType,
      options: (p: any) => p.options, required: (p: any) => p.required,
    },
    RosterAnswer: {
      uid: (p: any) => p.uid, nickname: (p: any) => p.nickname, fieldId: (p: any) => p.fieldId,
      fieldLabel: (p: any) => p.fieldLabel, value: (p: any) => p.value,
    },
    // Explicit field resolvers for plain-data result types: every field
    // delegates to the same-named property of the computed result object
    // (previously these relied on GraphQL default field resolution).
    Seat: { index: (p: any) => p.index, nickname: (p: any) => p.nickname, weapon: (p: any) => p.weapon, role: (p: any) => p.role, uid: (p: any) => p.uid, occupied: (p: any) => p.occupied, ready: (p: any) => p.ready, mine: (p: any) => p.mine },
  Grouping: {
    id: (p: any) => p.genId(),
    title: (p: any) => p.genTitle(),
    type: (p: any) => p.genType(),
    startsAt: (p: any) => p.genStartsAt(),
    dungeon: (p: any) => p.genDungeon(),
    seats: (p: any) => p.genSeats(),
    occupiedCount: (p: any) => p.genOccupiedCount(),
    readyCount: (p: any) => p.genReadyCount(),
    maxSlots: (p: any) => p.genMaxSlots(),
    status: (p: any) => p.genStatus(),
    creatorDiscordId: (p: any) => p.genCreatorDiscordId(),
    customFields: (p: any) => p.genCustomFields(),
  },
  GroupingRecapResult: { __resolveType: (p: any) => p.__typename },
  GroupingRecapLocked: {
    title: (p: any) => p.genTitle(), body: (p: any) => p.genBody(),
  },
  GroupingRecapNotEnabled: {
    title: (p: any) => p.genTitle(), body: (p: any) => p.genBody(),
  },
  GroupingRecapEmpty: {
    title: (p: any) => p.genTitle(), body: (p: any) => p.genBody(),
    failedHint: (p: any) => p.genFailedHint(), actions: (p: any) => p.genActions(),
  },
  GroupingRecapReady: {
    title: (p: any) => p.genTitle(), paragraphs: (p: any) => p.genParagraphs(),
    summaryLines: (p: any) => p.genSummaryLines(),
    generatedAtText: (p: any) => p.genGeneratedAtText(),
    providerText: (p: any) => p.genProviderText(), versionText: (p: any) => p.genVersionText(),
    failedHint: (p: any) => p.genFailedHint(), actions: (p: any) => p.genActions(),
  },
  GroupingRecapActions: {
    generateLabel: (p: any) => p.genGenerateLabel(),
    regenerateLabel: (p: any) => p.genRegenerateLabel(),
    generatingLabel: (p: any) => p.genGeneratingLabel(),
    confirmTitle: (p: any) => p.genConfirmTitle(),
    confirmMessageTemplate: (p: any) => p.genConfirmMessageTemplate(),
    toastGenerated: (p: any) => p.genToastGenerated(),
    toastFailedTemplate: (p: any) => p.genToastFailedTemplate(),
  },
  RecapPayload: {
    ok: (p: any) => p.genOk(), error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(), recap: (p: any) => p.genRecap(),
  },
  GroupingCombatReportResult: { __resolveType: (p: any) => p.__typename },
  GroupingCombatReportLocked: {
    title: (p: any) => p.genTitle(), body: (p: any) => p.genBody(),
  },
  GroupingCombatReportEmpty: {
    title: (p: any) => p.genTitle(), body: (p: any) => p.genBody(),
    failedHint: (p: any) => p.genFailedHint(), actions: (p: any) => p.genActions(),
  },
  GroupingCombatReportReady: {
    title: (p: any) => p.genTitle(),
    encountersTitle: (p: any) => p.genEncountersTitle(),
    viewReportLabel: (p: any) => p.genViewReportLabel(),
    backLabel: (p: any) => p.genBackLabel(),
    tabOverviewLabel: (p: any) => p.genTabOverviewLabel(),
    tabDamageLabel: (p: any) => p.genTabDamageLabel(),
    tabBuffsLabel: (p: any) => p.genTabBuffsLabel(),
    tabCastsLabel: (p: any) => p.genTabCastsLabel(),
    tabTimelineLabel: (p: any) => p.genTabTimelineLabel(),
    encounters: (p: any) => p.genEncounters(),
    detail: (p: any) => p.genDetail(),
    failedHint: (p: any) => p.genFailedHint(), actions: (p: any) => p.genActions(),
  },
  CombatEncounterSummary: {
    id: (p: any) => p.genId(), bossName: (p: any) => p.genBossName(),
    startedAtText: (p: any) => p.genStartedAtText(),
    durationText: (p: any) => p.genDurationText(),
    result: (p: any) => p.genResult(), resultText: (p: any) => p.genResultText(),
    teamDpsText: (p: any) => p.genTeamDpsText(),
    uploaderText: (p: any) => p.genUploaderText(),
    sourceText: (p: any) => p.genSourceText(),
    deleteAction: (p: any) => p.genDeleteAction(),
  },
  CombatEncounterDetail: {
    bossName: (p: any) => p.genBossName(),
    resultText: (p: any) => p.genResultText(),
    durationText: (p: any) => p.genDurationText(),
    startedAtText: (p: any) => p.genStartedAtText(),
    overviewLines: (p: any) => p.genOverviewLines(),
    modelVersionText: (p: any) => p.genModelVersionText(),
    activityNote: (p: any) => p.genActivityNote(),
    rdpsNote: (p: any) => p.genRdpsNote(),
    colPlayer: (p: any) => p.genColPlayer(), colTotal: (p: any) => p.genColTotal(),
    colActivity: (p: any) => p.genColActivity(), colDps: (p: any) => p.genColDps(),
    colRdps: (p: any) => p.genColRdps(), colRShare: (p: any) => p.genColRShare(),
    colSkill: (p: any) => p.genColSkill(), colCasts: (p: any) => p.genColCasts(),
    colHits: (p: any) => p.genColHits(), colAvg: (p: any) => p.genColAvg(),
    colCrit: (p: any) => p.genColCrit(), colSpec: (p: any) => p.genColSpec(),
    colMax: (p: any) => p.genColMax(), colShare: (p: any) => p.genColShare(),
    colBuff: (p: any) => p.genColBuff(), colApplier: (p: any) => p.genColApplier(),
    colTarget: (p: any) => p.genColTarget(), colUptime: (p: any) => p.genColUptime(),
    colTime: (p: any) => p.genColTime(),
    castsLocalTitle: (p: any) => p.genCastsLocalTitle(),
    timelineTitle: (p: any) => p.genTimelineTitle(),
    durationMs: (p: any) => p.genDurationMs(),
    partyRows: (p: any) => p.genPartyRows(),
    skillTables: (p: any) => p.genSkillTables(),
    buffRows: (p: any) => p.genBuffRows(),
    castRows: (p: any) => p.genCastRows(),
    dpsSeries: (p: any) => p.genDpsSeries(),
  },
  CombatReportActions: {
    importLabel: (p: any) => p.genImportLabel(),
    importingLabel: (p: any) => p.genImportingLabel(),
    importHint: (p: any) => p.genImportHint(),
    toastImported: (p: any) => p.genToastImported(),
    toastImportFailedTemplate: (p: any) => p.genToastImportFailedTemplate(),
    importErrorFormat: (p: any) => p.genImportErrorFormat(),
    importErrorValidation: (p: any) => p.genImportErrorValidation(),
    importErrorLimit: (p: any) => p.genImportErrorLimit(),
    importErrorForbidden: (p: any) => p.genImportErrorForbidden(),
    importErrorNotFound: (p: any) => p.genImportErrorNotFound(),
    importErrorTier: (p: any) => p.genImportErrorTier(),
    deleteLabel: (p: any) => p.genDeleteLabel(),
    deleteConfirmTitle: (p: any) => p.genDeleteConfirmTitle(),
    deleteConfirmMessageTemplate: (p: any) => p.genDeleteConfirmMessageTemplate(),
    toastDeleted: (p: any) => p.genToastDeleted(),
    toastDeleteFailedTemplate: (p: any) => p.genToastDeleteFailedTemplate(),
  },
  CombatEncounterDeleteAction: {
    deleteLabel: (p: any) => p.genDeleteLabel(),
    confirmTitle: (p: any) => p.genConfirmTitle(),
    confirmMessageTemplate: (p: any) => p.genConfirmMessageTemplate(),
    toastDeleted: (p: any) => p.genToastDeleted(),
    toastDeleteFailedTemplate: (p: any) => p.genToastDeleteFailedTemplate(),
  },
  CombatReportPayload: {
    ok: (p: any) => p.genOk(), error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(), combatReport: (p: any) => p.genCombatReport(),
  },
  CombatPartyRow: {
    playerName: (p: any) => p.playerName, memberName: (p: any) => p.memberName,
    guestTag: (p: any) => p.guestTag, total: (p: any) => p.total,
    activityPctText: (p: any) => p.activityPctText, dpsText: (p: any) => p.dpsText,
    rdpsText: (p: any) => p.rdpsText, rSharePctText: (p: any) => p.rSharePctText,
  },
  CombatSkillTable: {
    playerName: (p: any) => p.playerName, rows: (p: any) => p.rows,
  },
  CombatSkillRow: {
    skillName: (p: any) => p.skillName, total: (p: any) => p.total,
    casts: (p: any) => p.casts, hits: (p: any) => p.hits,
    avgText: (p: any) => p.avgText, critPctText: (p: any) => p.critPctText,
    specPctText: (p: any) => p.specPctText, maxHit: (p: any) => p.maxHit,
    dpsText: (p: any) => p.dpsText, sharePctText: (p: any) => p.sharePctText,
  },
  CombatBuffRow: {
    buffName: (p: any) => p.buffName, applierName: (p: any) => p.applierName,
    targetName: (p: any) => p.targetName, multiplierText: (p: any) => p.multiplierText,
    uptimePctText: (p: any) => p.uptimePctText, intervals: (p: any) => p.intervals,
  },
  CombatInterval: {
    startMs: (p: any) => p.startMs, endMs: (p: any) => p.endMs,
  },
  CombatCastRow: {
    timeText: (p: any) => p.timeText, playerName: (p: any) => p.playerName,
    skillName: (p: any) => p.skillName,
  },
  CombatDpsPoint: {
    second: (p: any) => p.second, damage: (p: any) => p.damage,
  },
  GroupingListPage: {
    groupings: (p: any) => p.genGroupings(),
    crossCarAdvice: (p: any) => p.genCrossCarAdvice(),
    groupingTemplates: (p: any) => p.genGroupingTemplates(),
    currentVersion: (p: any) => p.genCurrentVersion(),
    blocks: (p: any, args: any) => p.genBlocks(args),
    ...LIST_TEXT_RESOLVERS,
  },
  GroupingDetailPage: {
    grouping: (p: any) => p.genGrouping(),
    schedulingAdvice: (p: any) => p.genSchedulingAdvice(),
    recap: (p: any) => p.genRecap(),
    combatReport: (p: any) => p.genCombatReport(),
    rosterAnswers: (p: any) => p.genRosterAnswers(),
    shareUrl: (p: GroupingDetailPageShell) => p.genShareUrl(),
    shareImageUrl: (p: GroupingDetailPageShell) => p.genShareImageUrl(),
    templateSave: (p: any) => p.genTemplateSave(),
    blocks: (p: any, args: any) => p.genBlocks(args),
    manageActions: (p: any) => p.genManageActions(),
    allySharing: (p: any) => p.genAllySharing(),
    ...DETAIL_TEXT_RESOLVERS,
  },
  SharedGroupingPage: {
    exists: (p: any) => p.genExists(),
    slug: (p: any) => p.genSlug(),
    guildName: (p: any) => p.genGuildName(),
    title: (p: any) => p.genTitle(),
    type: (p: any) => p.genType(),
    dungeonName: (p: any) => p.genDungeonName(),
    startsAt: (p: any) => p.genStartsAt(),
    status: (p: any) => p.genStatus(),
    occupiedCount: (p: any) => p.genOccupiedCount(),
    maxSlots: (p: any) => p.genMaxSlots(),
    seats: (p: any) => p.genSeats(),
    shareImageUrl: (p: SharedGroupingPageShell) => p.genShareImageUrl(),
    sharePeopleTemplate: (p: any) => p.genSharePeopleTemplate(),
    shareTypeLabel: (p: any) => p.genShareTypeLabel(),
    ...SHARED_GROUPING_TEXT_RESOLVERS,
  },
  // Plain-data seat occupancy: fields delegate to the view object the
  // share service composed (index + occupancy, nothing else exists).
  SharedGroupingSeat: { index: (p: any) => p.index, occupied: (p: any) => p.occupied },
  // Plain-data sharing control (P20): fields delegate to the object
  // the detail shell composed for managers of this grouping only.
  AllySharingControl: {
    allyVisible: (p: any) => p.allyVisible,
    visitorSlots: (p: any) => p.visitorSlots,
    title: (p: any) => p.title,
    hint: (p: any) => p.hint,
    allyVisibleLabel: (p: any) => p.allyVisibleLabel,
    visitorSlotsLabel: (p: any) => p.visitorSlotsLabel,
    saveLabel: (p: any) => p.saveLabel,
  },
  GroupingTemplate: {
    id: (p: any) => p.genId(),
    name: (p: any) => p.genName(),
    type: (p: any) => p.genType(),
    title: (p: any) => p.genTitle(),
    dungeonName: (p: any) => p.genDungeonName(),
    dungeonId: (p: any) => p.genDungeonId(),
    maxSlots: (p: any) => p.genMaxSlots(),
    startDaysAhead: (p: any) => p.genStartDaysAhead(),
    startHour: (p: any) => p.genStartHour(),
    startMinute: (p: any) => p.genStartMinute(),
    creatorDiscordId: (p: any) => p.genCreatorDiscordId(),
    creatorName: (p: any) => p.genCreatorName(),
    manageActions: (p: any) => p.genManageActions(),
    customFields: (p: any) => p.genCustomFields(),
  },
  // Plain-data action sets: fields delegate to the same-named property
  // of the object the shell composed (present only for viewers who may
  // use them; the mutations re-verify).
  GroupingTemplateManageActions: {
    editLabel: (p: any) => p.editLabel,
    deleteLabel: (p: any) => p.deleteLabel,
    deleteConfirmTitle: (p: any) => p.deleteConfirmTitle,
    deleteConfirmMessageTemplate: (p: any) => p.deleteConfirmMessageTemplate,
  },
  GroupingTemplateSave: {
    buttonLabel: (p: any) => p.buttonLabel,
    dialogTitle: (p: any) => p.dialogTitle,
    nameLabel: (p: any) => p.nameLabel,
    submitLabel: (p: any) => p.submitLabel,
    toastSaved: (p: any) => p.toastSaved,
    toastFailedTemplate: (p: any) => p.toastFailedTemplate,
  },
  GroupingTemplatePayload: {
    ok: (p: any) => p.genOk(),
    template: (p: any) => p.genTemplate(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
  },
  // Plain-data action set: fields delegate to the same-named property
  // of the object the detail shell composed (present only for viewers
  // who may manage the grouping).
  GroupingManageActions: {
    editLabel: (p: any) => p.editLabel,
    completeLabel: (p: any) => p.completeLabel,
    completingLabel: (p: any) => p.completingLabel,
    restoreLabel: (p: any) => p.restoreLabel,
    disbandLabel: (p: any) => p.disbandLabel,
    disbandingLabel: (p: any) => p.disbandingLabel,
    disbandConfirmTitle: (p: any) => p.disbandConfirmTitle,
    disbandConfirmMessageTemplate: (p: any) => p.disbandConfirmMessageTemplate,
    completeConfirmTitle: (p: any) => p.completeConfirmTitle,
    completeConfirmMessageTemplate: (p: any) => p.completeConfirmMessageTemplate,
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
