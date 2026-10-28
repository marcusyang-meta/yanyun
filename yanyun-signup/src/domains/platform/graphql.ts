/* Platform GraphQL: Block/Action shells, legal page and push-token mutations. */
import type { Context } from './context.ts';
import {
  clampBlocksVersion, substituteForVersion, weekWindowUtc, startsAtEpoch,
  fmtStartsAt, groupByLocalDay, TYPE_SHORT_KEY, HEALER_SECT,
} from './index.ts';
import { tlCalculateExcel } from '../gear/index.ts';
import { getUserServers, getGuildNick, maybeRefreshGuildNicks, getUserLocalePref, setUserLocalePref } from '../identity/auth.ts';
import { upsertGuildMember } from '../groupings/index.ts';
import { isValidPushToken, savePushToken, deletePushToken } from './index.ts';
import {
  insertFeedback, countFeedbackSince, FEEDBACK_CATEGORIES,
  FEEDBACK_MAX_CONTENT, FEEDBACK_DAILY_LIMIT,
} from './index.ts';
import { evaluateHeirloomPushes } from '../gear/index.ts';
import { translate, negotiateLocale, SUPPORTED_LOCALES, CATALOG } from './index.ts';
import { logError } from './index.ts';
import { ogCardResolvers } from './og-graphql.ts';
import { platformAdminResolvers } from './admin-graphql.ts';
import { getGuildAvatarMeta, avatarPath } from '../guilds/index.ts';
import { getSettingValue, setSettingValue, listSettingsByKey } from '../guilds/index.ts';
import { getUsernameRow } from '../identity/index.ts';
import { listGuildMembers, getGuildMember } from '../identity/index.ts';
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
} from './graphql-base.ts';

export class BlockShell extends ShellBase {
  __typename: any;
  _children: any;
  _action: any;
  constructor(ctx: Context, typename: any, data: any){
    super(ctx, data);
    this.__typename = typename;
    this._children = (data && data.children) || [];
    this._action = (data && data.action) || null;
  }
  genChildren(){ return this._children; }
  genAction(){ return this._action; }
}

export class SectionBlockShell extends BlockShell {
  constructor(ctx: Context, data: any){ super(ctx, 'SectionBlock', data); }
  genTitle(){ return this.data.titleRef ? this.t(...(this.data.titleRef as [string, any?])) : (this.data.title ?? null); }
}
export class SectionHeaderBlockShell extends BlockShell {
  constructor(ctx: Context, data: any){ super(ctx, 'SectionHeaderBlock', data); }
  genText(){ return this.data.textRef ? this.t(...(this.data.textRef as [string, any?])) : this.data.text; }
}
export class TextBlockShell extends BlockShell {
  constructor(ctx: Context, data: any){ super(ctx, 'TextBlock', data); }
  genText(){
    if (this.data.textRef) return this.t(...(this.data.textRef as [string, any?]));
    if (this.data.variant === 'meta') {
      const parts = [];
      if (this.data.epoch != null) parts.push(fmtStartsAt(this.data.epoch, this.locale, this.ctx.tz));
      parts.push(this.t('groupingDetail_people', { occupied: this.data.occupied, max: this.data.max }));
      return parts.join(' · ');
    }
    return this.data.text;
  }
  genVariant(){ return this.data.variant || 'body'; }
}
export class BannerBlockShell extends BlockShell {
  constructor(ctx: Context, data: any){ super(ctx, 'BannerBlock', data); }
  genText(){ return this.data.text; }
}
export class ChipRowBlockShell extends BlockShell {
  constructor(ctx: Context, data: any){ super(ctx, 'ChipRowBlock', data); }
  genChips(){
    const chips: any[] = [this.t('groupingType_' + (TYPE_SHORT_KEY[this.data.evType] || 'shortActivity'))];
    if (this.data.dungeonName) chips.push(enDungeonName(this.locale, this.data.dungeonName as any));
    chips.push(this.data.status === 'open' ? this.t('groupingDetail_statusOpen')
      : this.data.status === 'completed' ? this.t('appBlocks_completedStatus')
      : this.t('appBlocks_closedStatus'));
    return chips;
  }
}
export class GroupingCardBlockShell extends BlockShell {
  constructor(ctx: Context, data: any){ super(ctx, 'GroupingCardBlock', data); }
  get g() { return this.data.g; }
  genGroupingId(){ return this.g.genId(); }
  genTitle(){ return this.g.genTitle(); }
  genBadgeText(){ return this.t('groupingType_' + (TYPE_SHORT_KEY[this.g.ev.type] || 'shortActivity')); }
  genTimeText(){
    const ts = startsAtEpoch(this.g.ev);
    return ts != null ? fmtStartsAt(ts, this.locale, this.ctx.tz) : '';
  }
  genDungeonName(){ return enDungeonName(this.locale, this.g.ev.dungeon || null); }
  genPeopleText(){ return this.t('groupingList_people', { occupied: this.data.occupied, max: this.g.ev.max_slots }); }
  genStatusText(){
    return this.g.ev.status === 'open' ? this.t('groupingList_statusOpen')
      : this.g.ev.status === 'completed' ? this.t('appBlocks_completedStatus')
      : this.t('appBlocks_closedStatus');
  }
}
export class SeatEntryShell extends ShellBase {
  // data: { row|null, index, ev, access } — actions are generated per viewer here
  genIndex(){ return this.data.index; }
  genOccupied(){ return !!this.data.row; }
  genNickname(){ return this.data.row ? this.data.row.nickname : null; }
  genWeapon(){ return this.data.row ? enSectName(this.locale, this.data.row.weapon) : null; }
  genRole(){
    const r = this.data.row;
    if (!r) return null;
    return r.role === '奶' || r.role === '治疗' ? this.t('seat_roleHealer') : this.t('seat_roleDps');
  }
  genHealer(){ return !!this.data.row && this.data.row.weapon === HEALER_SECT; }
  genIsLeader(){
    const { row, creatorDiscordId } = this.data;
    return !!row && !!row.discord_id && !!creatorDiscordId
      && String(row.discord_id) === String(creatorDiscordId);
  }
  genReady(){ return !!this.data.row && !!(this.data.row as any).ready_at; }
  /* Readiness toggle rides beside the main seat action: only the
   * seat's own holder gets one (same identity test as LeaveAction),
   * and only while the grouping can still depart (open/closed).
   * `ready` on the action is the TARGET state (tap to flip). */
  genReadyAction(){
    return this.memo('readyAction', () => {
      const { row, ev } = this.data;
      const user = this.ctx.user;
      if (!row || !user || !row.discord_id || String(row.discord_id) !== String(user.discordId)) return null;
      if (ev.status !== 'open' && ev.status !== 'closed') return null;
      return new SetReadyActionShell(this.ctx, { groupingId: String(ev.id), ready: !(row as any).ready_at });
    });
  }
  genAction(){
    return this.memo('action', () => {
      const { row, ev, access } = this.data;
      const user = this.ctx.user;
      if (row) {
        if (user && row.discord_id && String(row.discord_id) === String(user.discordId)) {
          return new LeaveActionShell(this.ctx, { groupingId: String(ev.id), uid: row.uid, nickname: row.nickname });
        }
        return null;
      }
      if (access && access.canWrite && ev.status === 'open') {
        return new JoinActionShell(this.ctx, { groupingId: String(ev.id), seatIndex: this.data.index });
      }
      return null;
    });
  }
}
export class SeatGridBlockShell extends BlockShell {
  constructor(ctx: Context, data: any){ super(ctx, 'SeatGridBlock', data); }
  genSeats(){ return this.data.entries; }
}
export class ActionButtonBlockShell extends BlockShell {
  constructor(ctx: Context, data: any){ super(ctx, 'ActionButtonBlock', data); }
  genLabel(){ return this.t(...(this.data.labelRef as [string, any?])); }
  genStyle(){ return this.data.style; }
}
export class EmptyStateBlockShell extends BlockShell {
  constructor(ctx: Context, data: any){ super(ctx, 'EmptyStateBlock', data); }
  genText(){ return this.t(...(this.data.textRef as [string, any?])); }
}
export class SpacerBlockShell extends BlockShell {
  constructor(ctx: Context, data: any){ super(ctx, 'SpacerBlock', data); }
  genSize(){ return this.data.size; }
}
export class FallbackBlockShell extends BlockShell {
  constructor(ctx: Context){ super(ctx, 'FallbackBlock', {}); }
  genText(){ return this.t('appBlocks_unknownBlock'); }
}

/* ---------- Bloks-lite action shells ---------- */
export class ActionShell extends ShellBase {
  __typename: any;
  constructor(ctx: Context, typename: any, data: any){ super(ctx, data); this.__typename = typename; }
  genActionType(){ return this.__typename; }
}
export class NavigateActionShell extends ActionShell {
  constructor(ctx: Context, data: any){ super(ctx, 'NavigateAction', data); }
  genSlug(){ return this.data.slug; }
  genGroupingId(){ return this.data.groupingId; }
  genName(){ return this.data.name; }
  genNick(){ return this.data.nick || ''; }
}
export class JoinActionShell extends ActionShell {
  constructor(ctx: Context, data: any){ super(ctx, 'JoinAction', data); }
  genGroupingId(){ return this.data.groupingId; }
  genSeatIndex(){ return this.data.seatIndex; }
}
export class LeaveActionShell extends ActionShell {
  constructor(ctx: Context, data: any){ super(ctx, 'LeaveAction', data); }
  genGroupingId(){ return this.data.groupingId; }
  genUid(){ return this.data.uid; }
  genConfirmTitle(){ return this.t('seat_leaveConfirmTitle'); }
  genConfirmMessage(){ return this.t('seat_leaveConfirmMessage', { nickname: this.data.nickname }); }
  genOkLabel(){ return this.t('common_confirm'); }
  genCancelLabel(){ return this.t('common_cancel'); }
}
export class DisbandActionShell extends ActionShell {
  constructor(ctx: Context, data: any){ super(ctx, 'DisbandAction', data); }
  genGroupingId(){ return this.data.groupingId; }
  genConfirmTitle(){ return this.t('groupingDetail_disbandConfirmTitle'); }
  genConfirmMessage(){ return this.t('groupingDetail_disbandConfirmMessage', { title: this.data.title }); }
  genOkLabel(){ return this.t('common_confirm'); }
  genCancelLabel(){ return this.t('common_cancel'); }
}
export class EditActionShell extends ActionShell {
  constructor(ctx: Context, data: any){ super(ctx, 'EditAction', data); }
  genGroupingId(){ return this.data.groupingId; }
}
// Complete action (vocab v4): same shape as DisbandAction (confirm text on
// the action object); emitted only for the leader while the team is not completed.
export class CompleteActionShell extends ActionShell {
  constructor(ctx: Context, data: any){ super(ctx, 'CompleteAction', data); }
  genGroupingId(){ return this.data.groupingId; }
  genConfirmTitle(){ return this.t('groupingDetail_completeConfirmTitle'); }
  genConfirmMessage(){ return this.t('groupingDetail_completeConfirmMessage', { title: this.data.title }); }
  genOkLabel(){ return this.t('common_confirm'); }
  genCancelLabel(){ return this.t('common_cancel'); }
}
// Uncomplete action (vocab v4): undoes completion, no confirmation
// (reversible, low risk); emitted only for the leader once completed.
export class UncompleteActionShell extends ActionShell {
  constructor(ctx: Context, data: any){ super(ctx, 'UncompleteAction', data); }
  genGroupingId(){ return this.data.groupingId; }
}
// Set-ready action: the seat holder's readiness toggle for departure
// reminders. `ready` is the target state to set (not the current one).
export class SetReadyActionShell extends ActionShell {
  constructor(ctx: Context, data: any){ super(ctx, 'SetReadyAction', data); }
  genGroupingId(){ return this.data.groupingId; }
  genReady(){ return !!this.data.ready; }
}

/* ---------- Page shell: grouping list ----------
 * groupings/currentVersion are data fields (lazy query + memo); the rest
 * are text fields generated by locale from the GROUPING_LIST_TEXT /
 * DETAIL / FORM specs below (list and detail pages share the FORM spec). */

export const LEGAL_SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'];
export class LegalSectionShell extends ShellBase {
  genHeading(){ return this.t(this.data.section + '_' + this.data.key + 'h'); }
  genBody(){ return this.t(this.data.section + '_' + this.data.key + 'b'); }
}
export class LegalPageShell extends ShellBase {
  get isTerms() { return this.data.kind === 'TERMS'; }
  genKind(){ return this.data.kind; }
  genTitle(){ return this.t(this.isTerms ? 'legal_termsTitle' : 'legal_privacyTitle'); }
  genUpdatedText(){ return this.t('legal_updatedText'); }
  genBackLabel(){ return this.t('common_backToHub'); }
  genSections(){
    const section = this.isTerms ? 'termsBody' : 'privacyBody';
    return LEGAL_SECTION_KEYS.map((key: any) => new LegalSectionShell(this.ctx, { section, key }));
  }
}



export const platformResolvers = {
  Query: {
    legalPage: (_: any, { kind }: any, ctx: Context) => new LegalPageShell(ctx, { kind }),
    ...ogCardResolvers.Query,
  },
  Mutation: {
    registerPushToken: async (_: any, { token, platform }: any, ctx: Context) => {
      if (!ctx.user) return { ok: false, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      const t = String(token || '').trim();
      if (!isValidPushToken(t)) {
        return { ok: false, error: errText(ctx, 'pushTokenInvalid'), errorCode: 'pushTokenInvalid' };
      }
      await savePushToken(ctx.env.DB, ctx.user.userId, t, platform || '');
      return { ok: true, error: null, errorCode: null };
    },

    unregisterPushToken: async (_: any, { token }: any, ctx: Context) => {
      if (!ctx.user) return { ok: false, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      await deletePushToken(ctx.env.DB, ctx.user.userId, String(token || '').trim());
      return { ok: true, error: null, errorCode: null };
    },

    // In-app feedback (profile form): identity comes only from the
    // session; the row snapshots the display name so the hub list stays
    // readable after renames. Anti-spam = per-user rolling-24h cap,
    // counted through the repository (durable across isolates, unlike
    // the in-memory REST limiter).
    submitFeedback: async (_: any, { category, text }: any, ctx: Context) => {
      if (!ctx.user) return { ok: false, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      const content = String(text || '').trim();
      if (!content) return { ok: false, error: errText(ctx, 'feedbackEmpty'), errorCode: 'feedbackEmpty' };
      if (content.length > FEEDBACK_MAX_CONTENT) {
        return { ok: false, error: errText(ctx, 'feedbackTooLong'), errorCode: 'feedbackTooLong' };
      }
      const cat = String(category || '').toLowerCase();
      const stored = (FEEDBACK_CATEGORIES as readonly string[]).includes(cat) ? cat : 'other';
      const now = Date.now();
      const recent = await countFeedbackSince(ctx.env.DB, ctx.user.userId, now - 24 * 3600 * 1000);
      if (recent >= FEEDBACK_DAILY_LIMIT) {
        return { ok: false, error: errText(ctx, 'feedbackRateLimited'), errorCode: 'feedbackRateLimited' };
      }
      await insertFeedback(ctx.env.DB, {
        userId: ctx.user.userId,
        userName: String(ctx.user.name || ''),
        category: stored,
        content,
        createdAt: now,
      });
      return { ok: true, error: null, errorCode: null };
    },

    // Self-service guild creation: logged in + admin/owner of the bound Discord server
    /* Platform admin (super-admin) surface: mutations re-evaluate
     * the platform-admin gate server-side (admin-graphql.ts). */
    ...platformAdminResolvers.Mutation,
  },
  types: {
    ...ogCardResolvers.types,
    ...platformAdminResolvers.types,
    // Explicit field resolvers for plain-data result types: every field
    // delegates to the same-named property of the computed result object
    // (previously these relied on GraphQL default field resolution).
    PushTokenPayload: { ok: (p: any) => p.ok, error: (p: any) => p.error, errorCode: (p: any) => p.errorCode },
    SubmitFeedbackPayload: { ok: (p: any) => p.ok, error: (p: any) => p.error, errorCode: (p: any) => p.errorCode },
  Block: { __resolveType: (p: any) => p.__typename, children: (p: any) => p.genChildren(), js: (p: any, a: any) => a.module },
  Action: { __resolveType: (p: any) => p.__typename, actionType: (p: any) => p.actionType },
  SectionBlock: { js: (p: any, a: any) => a.module, title: (p: any) => p.genTitle(), children: (p: any) => p.genChildren() },
  SectionHeaderBlock: { js: (p: any, a: any) => a.module, text: (p: any) => p.genText(), children: (p: any) => p.genChildren() },
  TextBlock: { js: (p: any, a: any) => a.module, text: (p: any) => p.genText(), variant: (p: any) => p.genVariant(), children: (p: any) => p.genChildren() },
  BannerBlock: { js: (p: any, a: any) => a.module, text: (p: any) => p.genText(), children: (p: any) => p.genChildren() },
  ChipRowBlock: { js: (p: any, a: any) => a.module, chips: (p: any) => p.genChips(), children: (p: any) => p.genChildren() },
  GroupingCardBlock: { js: (p: any, a: any) => a.module,
    groupingId: (p: any) => p.genGroupingId(), title: (p: any) => p.genTitle(),
    badgeText: (p: any) => p.genBadgeText(), timeText: (p: any) => p.genTimeText(),
    dungeonName: (p: any) => p.genDungeonName(), peopleText: (p: any) => p.genPeopleText(),
    statusText: (p: any) => p.genStatusText(), action: (p: any) => p.genAction(),
    children: (p: any) => p.genChildren(),
  },
  SeatGridBlock: { js: (p: any, a: any) => a.module, seats: (p: any) => p.genSeats(), children: (p: any) => p.genChildren() },
  SeatEntry: {
    index: (p: any) => p.genIndex(), occupied: (p: any) => p.genOccupied(),
    nickname: (p: any) => p.genNickname(), weapon: (p: any) => p.genWeapon(),
    role: (p: any) => p.genRole(), healer: (p: any) => p.genHealer(),
    isLeader: (p: any) => p.genIsLeader(),
    ready: (p: any) => p.genReady(),
    readyAction: (p: any) => p.genReadyAction(),
    action: (p: any) => p.genAction(),
  },
  ActionButtonBlock: { js: (p: any, a: any) => a.module,
    label: (p: any) => p.genLabel(), style: (p: any) => p.genStyle(),
    action: (p: any) => p.genAction(), children: (p: any) => p.genChildren(),
  },
  EmptyStateBlock: { js: (p: any, a: any) => a.module, text: (p: any) => p.genText(), children: (p: any) => p.genChildren() },
  SpacerBlock: { js: (p: any, a: any) => a.module, size: (p: any) => p.genSize(), children: (p: any) => p.genChildren() },
  FallbackBlock: { js: (p: any, a: any) => a.module, text: (p: any) => p.genText(), children: (p: any) => p.genChildren() },
  NavigateAction: {
    actionType: (p: any) => p.genActionType(), slug: (p: any) => p.genSlug(),
    groupingId: (p: any) => p.genGroupingId(), name: (p: any) => p.genName(),
    nick: (p: any) => p.genNick(),
  },
  JoinAction: {
    actionType: (p: any) => p.genActionType(), groupingId: (p: any) => p.genGroupingId(),
    seatIndex: (p: any) => p.genSeatIndex(),
  },
  LeaveAction: {
    actionType: (p: any) => p.genActionType(), groupingId: (p: any) => p.genGroupingId(),
    uid: (p: any) => p.genUid(), confirmTitle: (p: any) => p.genConfirmTitle(),
    confirmMessage: (p: any) => p.genConfirmMessage(), okLabel: (p: any) => p.genOkLabel(),
    cancelLabel: (p: any) => p.genCancelLabel(),
  },
  DisbandAction: {
    actionType: (p: any) => p.genActionType(), groupingId: (p: any) => p.genGroupingId(),
    confirmTitle: (p: any) => p.genConfirmTitle(), confirmMessage: (p: any) => p.genConfirmMessage(),
    okLabel: (p: any) => p.genOkLabel(), cancelLabel: (p: any) => p.genCancelLabel(),
  },
  EditAction: {
    actionType: (p: any) => p.genActionType(), groupingId: (p: any) => p.genGroupingId(),
  },
  CompleteAction: {
    actionType: (p: any) => p.genActionType(), groupingId: (p: any) => p.genGroupingId(),
    confirmTitle: (p: any) => p.genConfirmTitle(), confirmMessage: (p: any) => p.genConfirmMessage(),
    okLabel: (p: any) => p.genOkLabel(), cancelLabel: (p: any) => p.genCancelLabel(),
  },
  UncompleteAction: {
    actionType: (p: any) => p.genActionType(), groupingId: (p: any) => p.genGroupingId(),
  },
  SetReadyAction: {
    actionType: (p: any) => p.genActionType(), groupingId: (p: any) => p.genGroupingId(),
    ready: (p: any) => p.genReady(),
  },
  LegalPage: {
    kind: (p: any) => p.genKind(),
    title: (p: any) => p.genTitle(),
    updatedText: (p: any) => p.genUpdatedText(),
    backLabel: (p: any) => p.genBackLabel(),
    sections: (p: any) => p.genSections(),
  },
  LegalSection: {
    heading: (p: any) => p.genHeading(),
    body: (p: any) => p.genBody(),
  },
  },
};
