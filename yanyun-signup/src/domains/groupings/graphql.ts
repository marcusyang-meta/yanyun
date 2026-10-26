import { ensureEventCreatorColumn as ensureEventCreatorColumnRepo } from './events.ts';
/* groupings 域 GraphQL (三期域拆分): 车队 shells、列表/详情页与全部车队 mutation。 */
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
import { BannerBlockShell, EmptyStateBlockShell, SectionHeaderBlockShell, NavigateActionShell, GroupingCardBlockShell, FallbackBlockShell, TextBlockShell, ChipRowBlockShell, SectionBlockShell, SeatGridBlockShell, SpacerBlockShell, ActionButtonBlockShell, UncompleteActionShell, EditActionShell, DisbandActionShell, CompleteActionShell, encodePrimAction, SeatEntryShell } from '../platform/index.ts';
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

// 从 guide 文本解析 1-x/2-x 天赋行 (兼容真实换行与字面 \n 序列)

export function ensureEventCreatorColumn(db: any) {
  return ensureEventCreatorColumnRepo(db);
}

/* ---------- 落座身份戳 (signups.discord_id, 2026-10-24 用户裁决) ----------
 * 本人登录报名且提交昵称与本人身份一致 (表单预填值: 该百业绑定服务器的
 * 昵称快照, 或全局名) 才盖戳 = 这是本人落座, 开车提醒可精确 @。替别人
 * 报名 (昵称是别人的名字) 绝不盖戳 — 盖了会 @ 错人。拿不准就不盖,
 * 发送时还有名册/昵称唯一匹配兜底。 */
// 某 discord 用户在某服务器语境下的身份名集合 (全局名 + 该服昵称)

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
    } catch { /* 名册记录失败静默 */ }
  })();
  if (ctx.executionCtx && typeof ctx.executionCtx.waitUntil === 'function') {
    ctx.executionCtx.waitUntil(run);
  }
  return run;
}

export class GroupingListPageShell extends ShellBase {
  constructor(ctx: any, slug: any, tab: any){ super(ctx, { slug, tab }); }
  // 移动端 Bloks-lite: 本页内容区的积木对象树。按观看者组合 (导航参数/
  // 空态口径都由 access 决定), 再按客户端 blocksVersion 做版本替代。
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
        // 一屏 (一周) 之内按查看者本地时区的自然日分组呈现 (2026-10-25
        // 裁决): 组头 = SectionHeaderBlock (v1 既有积木), 文案由目录模板
        // 在此拼好整句下发, 客户端不重排不拼文案; 组按日期升序, 组内按
        // 出发时刻升序。无时间的车在移动端口径里本就不入周 (ts!=null),
        // 不存在未定时间组。
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
  // 移动端原语面 (C 路线): 与 genBlocks 同源同数据的原语树。协商
  // (primitivesVersion) 与开关 (百业 × 列表页, 默认 OFF) 任一不满足返回
  // null — 客户端据此回落功能块树。组合顺序与 genBlocks 一一对应:
  // 公告横幅 → 空态 / 按日分组 (组头 + 卡片 Collection)。
  async genPrimTree({ primitivesVersion, weekOffset }: any = {}){
    const v = clampPrimitivesVersion(primitivesVersion);
    if (!v) return null;
    const wo = Number.isFinite(weekOffset) ? weekOffset | 0 : 0;
    return this.memo(`primTree:${v}:${wo}`, async () => {
      const access = await getGuildAccess(this.db, this.ctx.user, this.data.slug, this.ctx.request);
      if (!(await primEnabled(this.db, access.slug, 'list'))) return null;
      const tRow = await getTenantRow(this.db, access.slug).catch(() => null);
      let viewerNick = null;
      if (this.ctx.user && access.bound && access.discordGuildId) {
        viewerNick = await getGuildNick(this.db, this.ctx.user.discordId, access.discordGuildId).catch(() => null);
      }
      const [ws, we] = weekWindowUtc(wo);
      const shells = await this.genGroupings();
      const nodes = [];
      if (tRow && tRow.announcement) {
        nodes.push({ t: 'col', s: 'banner', c: [{ t: 'txt', s: 'bannerText', x: '📣 ' + tRow.announcement }] });
      }
      const inWeek = shells.filter((g: any) => {
        const ts = startsAtEpoch(g.ev);
        return ts != null && ts >= ws && ts < we;
      });
      if (!inWeek.length) {
        nodes.push({
          t: 'txt', s: 'empty',
          x: this.t('groupingList', access.canWrite ? 'emptyInteractive' : 'emptyReadonly'),
        });
        return nodes;
      }
      // 卡片模板 (Collection): 印章列仅当印章字非空时进模板 (与功能块
      // 渲染的 sealText 有无同口径); 模板每组只下发一次, 每卡只付数据行。
      // meta 行 / 状态片令牌 / 印章字都在服务端预拼 (现状在客户端做的组合,
      // 原语面归服务端 — 这正是「服务端拼好即上线」的含义)。
      const seal = this.t('groupingList', 'seal');
      const cardTpl = {
        t: 'press', a: '$action',
        c: [{
          t: 'col', s: 'card',
          c: [{
            t: 'row', s: 'cardRow',
            c: [
              ...(seal ? [{ t: 'col', s: 'seal', c: [{ t: 'txt', s: 'sealChar', x: '$seal' }] }] : []),
              {
                t: 'col', s: 'cardMain',
                c: [
                  {
                    t: 'row', s: 'cardTitleRow',
                    c: [
                      { t: 'chip', s: 'typeChip', x: '$badge' },
                      { t: 'txt', s: 'cardTitle', x: '$title' },
                    ],
                  },
                  { t: 'txt', s: 'cardMeta', x: '$meta' },
                ],
              },
              { t: 'chip', s: '$statusStyle', x: '$status' },
              { t: 'txt', s: 'chev', x: '›' },
            ],
          }],
        }],
      };
      const items = inWeek.map((g: any) => ({ g, ts: startsAtEpoch(g.ev) }));
      for (const group of groupByLocalDay(items, this.ctx.tz)) {
        const p = group.parts;
        nodes.push({
          t: 'txt', s: 'sectionHeader',
          x: this.t('groupingList', 'dayGroupHeader', {
            month: p.month, day: p.day, weekday: this.t('groupingList', 'weekday' + p.weekday),
          }),
        });
        const rows = [];
        for (const { g } of group.items) {
          const nav = new NavigateActionShell(this.ctx, {
            slug: access.slug, groupingId: g.genId(), name: tRow ? tRow.guild_name : access.slug,
            readOnly: !access.canWrite, nick: viewerNick || '',
          });
          const ev = g.ev;
          const ts = startsAtEpoch(ev);
          const meta = [
            ts != null ? fmtStartsAt(ts, this.locale, this.ctx.tz) : '',
            this.t('groupingList', 'people', { occupied: await g.genOccupiedCount(), max: ev.max_slots }),
            enDungeonName(this.locale, ev.dungeon || null),
          ].filter(Boolean).join(' · ');
          rows.push({
            ...(seal ? { seal } : {}),
            badge: this.t('groupingType', TYPE_SHORT_KEY[ev.type] || 'shortActivity'),
            title: g.genTitle(),
            meta,
            status: ev.status === 'open' ? this.t('groupingList', 'statusOpen')
              : ev.status === 'completed' ? this.t('appBlocks', 'completedStatus')
              : this.t('appBlocks', 'closedStatus'),
            statusStyle: ev.status === 'open' ? 'statusOpen' : 'statusClosed',
            action: encodePrimAction(nav),
          });
        }
        nodes.push({ t: 'list', s: 'cardList', tpl: cardTpl, items: rows });
      }
      return nodes;
    });
  }
  async genGroupings(){
    return this.memo('groupings', async () => {
      const type = TAB_TO_TYPE[this.data.tab] || 'activity';
      // completed (已完成) 与 draft 一样不进任何列表 (2026-10-25): 完成车只
      // 经详情直达打开。closed 仍在列表 (只是截止报名), 与完成态分开。
      const results = await listEventsByTenantType(this.db, s(this.data.slug, 40), type);
      return results.map((ev: any) => new GroupingShell(this.ctx, ev));
    });
  }
  // 星期短名表 (下标 0=周日, 与 JS getDay / 服务端 localDayParts 对齐):
  // Web 组头模板的 {weekday} 填充料, 整表由目录按 locale 生成。
  genWeekdayNames(){
    return this.memo('weekdayNames', () => [0, 1, 2, 3, 4, 5, 6].map((i: any) => this.t('groupingList', 'weekday' + i)));
  }
  genCurrentVersion(){
    return this.ctxMemo('gameVersion', () => getGameVersion(this.db));
  }
}

// 组队列表数据入口 (groupingListPage 与 Guild.groupings 共用; gate 由调用方负责)
export function groupingListPage(ctx: any, slug: any, tab: any) {
  return new GroupingListPageShell(ctx, slug, tab);
}

// 发车/编辑表单文案 spec (列表页 shell 与详情页 shell 共用, 同名同口径)
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
  // 数组字段不走 defineTextGens (目录条目恒为字符串): 整表生成在此
  weekdayNames: (p: any) => p.genWeekdayNames(),
};

/* ---------- 百业成员名册条目 (代报名选人) ----------
 * 名册 = guild_members (用户进入百业时由读取路径记录)。条目只经完整
 * Guild 面的 memberRoster 字段下发; displayName 口径与服务端落座名
 * 一致 (名册昵称, 回退全局名), 选择器选中的就是将落座的名字。 */

export class GroupingDetailPageShell extends ShellBase {
  constructor(ctx: any, ev: any){ super(ctx, ev); }
  genGrouping(){
    return this.memo('grouping', () => new GroupingShell(this.ctx, this.data));
  }
  // 移动端 Bloks-lite: 本页内容区的积木对象树。逐座动作与解散按钮按
  // 观看者组合 (身份戳/车头比对都在服务端), 再按 blocksVersion 替代。
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
          // 已完成: 只给恢复入口 (编辑/解散/完成都不再下发)
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
  // 移动端原语面 (C 路线): 与 genBlocks 同源同数据的原语树 (协商 + 开关
  // 不满足返回 null)。结构对应: 公告横幅 → 标题 → 类型/状态片行 → meta
  // → 提示 → 名册区 (区头 + 座位 Collection) → 车头动作钮组 (完成态只给
  // 恢复)。座位格的占/空差异在服务端预消化成数据行的 line1/line2/
  // cellStyle/line1Style 四字段, 模板结构恒定; 逐座动作与车头闸门走与
  // genBlocks 完全相同的 SeatEntryShell / isLeader 结论, 再经
  // encodePrimAction 转短键。Spacer 尺寸量化到间距标度: 18 → md(16)、
  // 10 → sm(10) (STUDY §4.3 的毫米级取舍)。
  async genPrimTree({ primitivesVersion }: any = {}){
    const v = clampPrimitivesVersion(primitivesVersion);
    if (!v) return null;
    return this.memo(`primTree:${v}`, async () => {
      const ev = this.data;
      const access = await getGuildAccess(this.db, this.ctx.user, ev.tenant, this.ctx.request);
      if (!(await primEnabled(this.db, access.slug, 'detail'))) return null;
      const tRow = await getTenantRow(this.db, ev.tenant).catch(() => null);
      await ensureSignupDiscordColumn(this.db);
      const rows = await listSignupSeats(this.db, ev.id);
      const entries = [];
      for (let i = 0; i < ev.max_slots; i++) {
        entries.push(new SeatEntryShell(this.ctx, { row: rows[i] || null, index: i, ev, access }));
      }
      const nodes = [];
      if (tRow && tRow.announcement) {
        nodes.push({ t: 'col', s: 'banner', c: [{ t: 'txt', s: 'bannerText', x: '📣 ' + tRow.announcement }] });
      }
      nodes.push({ t: 'txt', s: 'bTitle', x: ev.title });
      // 片行与 ChipRowBlockShell.genChips 同源: [类型短名, 副本?, 状态]
      const chipTexts: any[] = [this.t('groupingType', TYPE_SHORT_KEY[ev.type] || 'shortActivity')];
      if (ev.dungeon) chipTexts.push(enDungeonName(this.locale, ev.dungeon));
      chipTexts.push(ev.status === 'open' ? this.t('groupingDetail', 'statusOpen')
        : ev.status === 'completed' ? this.t('appBlocks', 'completedStatus')
        : this.t('appBlocks', 'closedStatus'));
      nodes.push({ t: 'row', s: 'chipRow', c: chipTexts.map((x: any) => ({ t: 'chip', s: 'chip', x })) });
      const metaParts = [];
      const ts = startsAtEpoch(ev);
      if (ts != null) metaParts.push(fmtStartsAt(ts, this.locale, this.ctx.tz));
      metaParts.push(this.t('groupingDetail', 'people', { occupied: rows.length, max: ev.max_slots }));
      nodes.push({ t: 'txt', s: 'bMeta', x: metaParts.join(' · ') });
      nodes.push({
        t: 'txt', s: 'bMuted',
        x: this.t('groupingDetail', ev.status === 'completed' ? 'completedHint' : access.canWrite ? 'openHint' : 'readonlyHint'),
      });
      // 名册: 座位 Collection (grid2)。空位文案按动作有无选
      // emptyJoin/empty, 与功能块客户端的 pageText 口径一致 (改由服务端定)。
      const seatItems = entries.map((e: any) => {
        const action = encodePrimAction(e.genAction());
        if (e.genOccupied()) {
          const weapon = e.genWeapon();
          const role = e.genRole();
          const line2 = weapon || role
            ? `${weapon ?? ''}${role ? `${weapon ? ' · ' : ''}${role}` : ''}` : null;
          // line1Lines: 与积木版 SeatCell 同构 — 昵称/副行截断 1 行,
          // 空位文案不截断 (格内居中换行)。
          return { line1: e.genNickname(), line2, line1Lines: 1, cellStyle: 'seatTaken', line1Style: 'seatName', action };
        }
        return {
          line1: action ? this.t('seat', 'emptyJoin') : this.t('seat', 'empty'),
          line2: null,
          line1Lines: null,
          cellStyle: action ? 'seatFreeJoin' : 'seatFree',
          line1Style: 'seatEmptyText',
          action,
        };
      });
      const seatTpl = {
        t: 'press', a: '$action',
        c: [{
          t: 'col', s: '$cellStyle',
          c: [
            { t: 'txt', s: '$line1Style', x: '$line1', lines: '$line1Lines' },
            { t: 'txt', s: 'seatSub', x: '$line2', lines: 1 },
          ],
        }],
      };
      nodes.push({
        t: 'col', s: 'section',
        c: [
          { t: 'txt', s: 'sectionHeader', x: this.t('appBlocks', 'rosterTitle') },
          { t: 'list', s: 'grid2', tpl: seatTpl, items: seatItems },
        ],
      });
      const isLeader = !!(this.ctx.user && ev.creator_discord_id
        && String(ev.creator_discord_id) === String(this.ctx.user.discordId));
      if (isLeader && access.canWrite) {
        const btn = (labelRef: any, styleToken: any, actionShell: any) => ({
          t: 'press', a: encodePrimAction(actionShell),
          c: [{
            t: 'col', s: styleToken,
            c: [{ t: 'txt', s: styleToken + 'Text', x: this.t(...labelRef) }],
          }],
        });
        nodes.push({ t: 'sp', s: 'md' });
        if (ev.status === 'completed') {
          // 已完成: 只给恢复入口 (与 genBlocks 同口径)
          nodes.push(btn(['groupingDetail', 'restore'], 'btnGhost',
            new UncompleteActionShell(this.ctx, { groupingId: String(ev.id) })));
        } else {
          nodes.push(btn(['groupingDetail', 'edit'], 'btnGhost',
            new EditActionShell(this.ctx, { groupingId: String(ev.id) })));
          nodes.push({ t: 'sp', s: 'sm' });
          nodes.push(btn(['groupingDetail', 'complete'], 'btnGhost',
            new CompleteActionShell(this.ctx, { groupingId: String(ev.id), title: ev.title })));
          nodes.push({ t: 'sp', s: 'sm' });
          nodes.push(btn(['groupingDetail', 'disband'], 'btnDanger',
            new DisbandActionShell(this.ctx, { groupingId: String(ev.id), title: ev.title })));
        }
      }
      return nodes;
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

/* ---------- 图鉴页 (dex) ---------- */


export const groupingsResolvers = {
  Query: {
    groupingListPage: async (_: any, { slug, tab }: any, ctx: any) => {
      const db = ctx.env.DB;
      // 校验租户存在 + 已绑定百业仅成员可见 (服务端拦截, 非成员拿不到数据)
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
      // 租户隔离: 传入 slug 时必须与车队所属百业一致, 否则视为不存在 (不泄露他会数据)
      if (slug != null && s(slug, 40) !== ev.tenant) throw new Error(errText(ctx, 'groupingNotFound'));
      // 已绑定百业: 非成员视为不存在, 不泄露车队内容
      const a = await getGuildAccess(db, ctx.user, ev.tenant, ctx.request);
      if (!a.canView) throw new Error(errText(ctx, 'groupingNotFound'));
      touchGuildRoster(ctx, a);
      return new GroupingDetailPageShell(ctx, ev);
    },

    // ===== Viewer 层级 (root = user) =====
  },
  Mutation: {
    createGrouping: async (_: any, { input }: any, ctx: any) => {
      const db = ctx.env.DB;
      // 限流: 每 IP 每分钟最多 10 次发车
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
      // 人数规则 (用户裁决): 双十不写副本名、恒 10 人 (带 dungeonId 也忽略);
      // 爬塔镜像双十: 同样不写副本名、恒 10 人 (带 dungeonId 也忽略);
      // 天赋/竞速选了副本按副本 size 定人数, 不指定走默认 (天赋 5 / 竞速 10)。
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
      // 车头身份落库: 取会话 discord_id (requireWrite 已保证登录), 解散时复验
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
          // 发车预排座位同 join 口径: 昵称是发车人本人身份才盖他的戳
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
      // 编辑收口 (2026-10-25 用户裁决: 编辑车队也只有车头可以): 与
      // disbandGrouping 同一条规则 — 身份只认 creator_discord_id 与会话
      // discord_id 的比对; 座位名单编辑同走本 mutation, 一并收口。
      // 未记录车头的旧车谁都不能编辑, 只能走管理员通道。
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
        // 身份戳在整表重写时的去留 (保守口径): 旧座位里该昵称有且仅有一个
        // 戳, 且戳主的当前身份名仍与该昵称一致 -> 沿用; 昵称被改成别人、
        // 旧戳有歧义、或戳主已改名 -> 一律不带戳。编辑动作本身不新盖戳
        // (点保存的人不是在落座)。
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

    // 解散车队 (2026-10-24 用户裁决): "人人可管" 的唯一例外 — 仅车头可为。
    // 身份只认 events.creator_discord_id 与会话 discord_id 的比对 (服务端
    // 复验, 与前端是否显示按钮无关); 未记录车头的旧车谁都无法解散,
    // 只能走管理员通道 (REST admin 删除保持不变)。
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

    // 完成车队 (2026-10-25): 开完的车标记 completed — 与 closed 语义不同:
    // closed 只是截止报名, 仍在列表且仍发提醒; completed 从所有列表消失,
    // 且提醒/推送口径 (reminder PENDING_WHERE 只认 open/closed) 自动不再
    // 触发 — 即使闹钟已排队, GuildHub 到点重查 D1 时也会被过滤掉。
    // 权限与编辑/解散同门: 仅车头 (creator_discord_id); 无车头记录的存量
    // 车谁都不能完成, 走管理员通道。从 open / closed 都可完成。
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
      // draft 在 GraphQL 表面处处不可见 (列表已过滤), 按不存在处理
      if (ev.status !== 'open' && ev.status !== 'closed') return gFail(ctx, 'groupingNotFound');
      await setEventStatus(db, gid, 'completed');
      const nev = await getEventRow(db, gid);
      // kind=updated: 列表实时摘除 + GuildHub 重排闹钟 (完成车不再是待提醒)
      publishGroupingEvent(ctx, ev.tenant, gid, 'updated');
      return new GroupingPayloadShell(ctx, { ok: true, grouping: toGrouping(ctx, nev) });
    },

    // 恢复车队 (撤销完成): 与 completeGrouping 成对, 同门校验。恢复一律
    // 回到 open (不还原完成前的 closed 态 — 保持简单, 车头可再手动关闭
    // 报名口径由 REST close / 状态机承担)。
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
      // 报名身份收口 (2026-10-25 用户裁决): 落座名与身份戳都由服务端定,
      // 客户端传来的 nickname 不作数 (覆盖, 不报错)。
      //  - 自己报名: 名 = 本人 Discord 服务器昵称 (回退全局名), 戳 = 本人。
      //  - 代报名 (forDiscordId): 目标必须在本百业名册 (guild_members)
      //    内, 服务端复验; 名 = 名册昵称 (回退全局名), 戳 = 被代报者 —
      //    这样提醒 @ 与推送都能精确找到本人。
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
    primTree: (p: any, args: any) => p.genPrimTree(args),
    ...LIST_TEXT_RESOLVERS,
  },
  GroupingDetailPage: {
    grouping: (p: any) => p.genGrouping(),
    blocks: (p: any, args: any) => p.genBlocks(args),
    primTree: (p: any, args: any) => p.genPrimTree(args),
    ...DETAIL_TEXT_RESOLVERS,
  },
  // ===== Bloks-lite 积木/动作 (类型即分发; shell 自带 __typename) =====
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
