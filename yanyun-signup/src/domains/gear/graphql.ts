/* gear 域 GraphQL (三期域拆分): 配装台/调律 shells 与全部装备 mutation/计算。 */
import {
  clampBlocksVersion, substituteForVersion, weekWindowUtc, startsAtEpoch,
  fmtStartsAt, groupByLocalDay, TYPE_SHORT_KEY, HEALER_SECT,
} from '../platform/index.ts';
import { tlCalculateExcel } from './index.ts';
import { getUserServers, getGuildNick, maybeRefreshGuildNicks, getUserLocalePref, setUserLocalePref } from '../../auth.js';
import { ensureSignupDiscordColumn, ensureGuildMembersTable, upsertGuildMember } from '../groupings/index.ts';
import { ensurePushTokensTable, isValidPushToken, savePushToken, deletePushToken } from '../platform/index.ts';
import { evaluateHeirloomPushes } from './index.ts';
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
} from './index.ts';
import {
  GP_SLOTS, GP_GEAR_SLOTS, GP_AFFIX, GP_BUILDS, GP_SLOTS_BIG, GP_SLOTS_SMALL,
  GP_BASE_FIELDS, GP_BASE_PRESET, GP_BASE_FIELD_LABELS, GP_XINFA, GP_TALENT_ROWS,
  GP_BUILD_DINGYIN, GP_DINGYIN_LEFT, GP_DINGYIN_RIGHT_MAX, GP_BOW_JUE_VALUES,
  GP_BOW_RECOMMEND, GP_PASTE_NAME_TO_KEY, GP_NAME_TO_CLASS, GP_CLASS_LABEL,
  GP_SLOT_ALIAS, GP_OCR_EXTRA_ALIAS, GP_LEGACY_KEY, GP_SCHOOL_TAG_LIST,
  GP_DEMO_KIT, GP_DIM_ROWS, GP_QUICK_BAR_NAMES, GP_BUILD_SECT, GP_WUXUE_NAMES,
  gpTalentText, gpClassOf, gpSanitizeGearData, gpPlan, gpAutoCombine,
  gpParsePaste, gpQuickCalc,
} from './index.ts';
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

export const TIAOLV_MAX = { mainAttr: 88.4, outerAtk: 139.6, accuracy: 0.144, crit: 0.162, critDamage: 0.081, sectAttr: 79.2 };
// 流派权重口径 (用户亲口规则): 鸣金系会意x3, 会心流会心x3, 裂石·威无加成, 牵丝·霖治疗向
export const SECT_WEIGHTS = [
  { sectSlug: 'mingjin-hong', critWeight: 1, critDamageWeight: 3 },
  { sectSlug: 'mingjin-ying', critWeight: 1, critDamageWeight: 3 },
  { sectSlug: 'lieshi-wei', critWeight: 1, critDamageWeight: 1 },
  { sectSlug: 'lieshi-jun', critWeight: 3, critDamageWeight: 1 },
  { sectSlug: 'qiansi-yu', critWeight: 3, critDamageWeight: 1 },
  { sectSlug: 'qiansi-yi', critWeight: 3, critDamageWeight: 1 },
  { sectSlug: 'pozhu-zun', critWeight: 3, critDamageWeight: 1 },
  { sectSlug: 'pozhu-yuan', critWeight: 3, critDamageWeight: 1 },
  { sectSlug: 'pozhu-chen', critWeight: 3, critDamageWeight: 1 },
  { sectSlug: 'pozhu-feng', critWeight: 3, critDamageWeight: 1 },
  { sectSlug: 'qiansi-lin', critWeight: 1, critDamageWeight: 1 },
];
export const SUITS = ['飞隼', '白虹', '青衿', '素问'];

export class TiaolvPageShell extends ShellBase {
  async genSects(){
    return this.memo('sects', async () => {
      const schools = await listSchoolsNameSlug(this.db).catch(() => []);
      return (schools || []).map((sc: any) => ({ slug: sc.slug, name: enSectName(this.locale, sc.name) }));
    });
  }
  genInnerSkills(){
    // 心法名集合 (与 xinfa.json 对应, 避免 Worker 读静态文件) — 游戏数据
    return ['千营一呼', '易水歌', '征人归', '断石之构', '大唐歌', '极乐泣血', '忘川绝响', '花上月令', '剑气纵横'];
  }
  genSuits(){ return SUITS; }
  genMaxValues(){ return TIAOLV_MAX; }
  genSectWeights(){ return SECT_WEIGHTS; }
}

export const TIAOLV_TEXT_RESOLVERS = defineTextGens(TiaolvPageShell, [
  ['tlIntroText', 'tiaolv', 'intro'],
  ['tlInnerSkillTemplate', 'tiaolv', 'innerSkill'],
  ['tlInnerSkillPlaceholder', 'tiaolv', 'innerSkillPlaceholder'],
  ['tlWuxueLabel', 'tiaolv', 'wuxue'],
  ['tlWukuLabel', 'tiaolv', 'wuku'],
  ['tlWukuSelfLabel', 'tiaolv', 'wukuSelf'],
  ['tlWukuCommonLabel', 'tiaolv', 'wukuCommon'],
  ['tlSuitLabel', 'tiaolv', 'suit'],
  ['tlBowLabel', 'tiaolv', 'bow'],
  ['tlNoneLabel', 'tiaolv', 'none'],
  ['tlTuneAreaLabel', 'tiaolv', 'tuneArea'],
  ['tlCalcLabel', 'tiaolv', 'calc'],
  ['tlCalculatingLabel', 'tiaolv', 'calculating'],
  ['tlToastFailedText', 'tiaolv', 'toastFailed'],
  ['tlToastFailedWithTemplate', 'tiaolv', 'toastFailedWith'],
  ['tlColAttrLabel', 'tiaolv', 'colAttr'],
  ['tlColBaseLabel', 'tiaolv', 'colBase'],
  ['tlColPanelLabel', 'tiaolv', 'colPanel'],
  ['tlColFinalLabel', 'tiaolv', 'colFinal'],
]);

/* ---------- 武库鉴宝页 (毕业率): 纯文案 shell, 数据走独立查询 ---------- */
/* 配装台 (gear-planner 移植) 并入本页: 参考数据经本 shell 的 gen 方法下发,
 * 计算走 gearPlan / gearAutoCombine / gearParsePaste / gearQuickCalc mutation。 */
export class GradPageShell extends ShellBase {
  genGearSlots(){ return GP_SLOTS; }
  genGearGearSlots(){ return GP_GEAR_SLOTS; }
  genGearAffixes(){
    return this.memo('gearAffixes', () => GP_AFFIX.map((a: any) => {
      // 英文名覆盖层: label 本地化; short 仅展示, 本地化时用官方全名;
      // key / recipeNames 是规范匹配词, 不动。
      const lab = enAffixName(this.locale, a.label);
      return {
        key: a.key, label: lab, short: lab !== a.label ? lab : a.short, max: a.max, cy: a.cy,
        unit: a.unit || '', sys: a.sys ? enAffixSys(this.locale, a.sys) : null, size: a.size || null,
        cyPct: a.cy / a.max * 100,
        recipeNames: Object.keys(GP_NAME_TO_CLASS).filter((n: any) => GP_NAME_TO_CLASS[n] === gpClassOf(a.key)),
      };
    }));
  }
  genGearBuilds(){
    return this.memo('gearBuilds', () => GP_BUILDS.map((b: any, i: any) => {
      const bowKind = GP_BOW_RECOMMEND[b.bow] || '';
      return {
        idx: i, cat: b.cat, school: enBuildSchool(this.locale, b.school), set: enGearSetName(this.locale, b.set), bow: b.bow,
        bowKind, bowLabel: bowKind ? (GP_BOW_JUE_VALUES[bowKind].label || '') : '',
        note: b.note || null, recipe: b.recipe, sectName: enSectName(this.locale, GP_BUILD_SECT[i] || ''),
        totalBars: b.total,
        targets: b.targets.map((t: any) => ({ cls: t.cls, label: enClassLabel(this.locale, t.label), n: t.n, flex: t.flex || null })),
      };
    }));
  }
  genGearSlotsBig(){ return GP_SLOTS_BIG; }
  genGearSlotsSmall(){ return GP_SLOTS_SMALL; }
  genGearBaseFields(){
    return GP_BASE_FIELDS.map((f: any) => ({ key: f, label: GP_BASE_FIELD_LABELS[f] || f, preset: GP_BASE_PRESET[f] ?? 0 }));
  }
  genGearXinfa(){
    return GP_XINFA.map((x: any) => ({
      name: x.n, xiao: x.xiao ?? null, da: x.da ?? null, acc: x.acc ?? null,
      crit: x.crit ?? null, int: x.int ?? null, dcrit: x.dcrit ?? null, dint: x.dint ?? null,
      dmg: x.dmg ?? null, pierce: x.pierce ?? null, critDmg: x.critDmg ?? null, intDmg: x.intDmg ?? null,
      shuSys: x.shu ? x.shu.sys : null, shuXiao: x.shu ? (x.shu.xiao ?? null) : null, shuDa: x.shu ? (x.shu.da ?? null) : null,
      sysPierceSys: x.sysPierce ? x.sysPierce.sys : null, sysPierceVal: x.sysPierce ? x.sysPierce.v : null,
      shuBonusSys: x.shuBonus ? x.shuBonus.sys : null, shuBonusVal: x.shuBonus ? x.shuBonus.v : null,
    }));
  }
  genGearTalentRows(){
    return Object.keys(GP_TALENT_ROWS).map((name: any) => {
      const t = GP_TALENT_ROWS[name];
      return { name, text: gpTalentText(name), xiao: t.xiao || 0, da: t.da || 0, acc: t.acc || 0, crit: t.crit || 0, int: t.int || 0 };
    });
  }
  genGearDingyinRows(){
    return Object.keys(GP_BUILD_DINGYIN).map((school: any) => {
      const o = GP_BUILD_DINGYIN[school];
      return { school: enBuildSchool(this.locale, school), name: o.name ? enAffixName(this.locale, o.name) : null, wuxue: o.wuxue ? enMartialArtName(this.locale, o.wuxue) : null, verified: !!o.verified, category: o.category || null };
    });
  }
  genGearDingyinLeft(){ return Object.keys(GP_DINGYIN_LEFT).map((name: any) => ({ name: enAffixName(this.locale, name), max: GP_DINGYIN_LEFT[name] })); }
  genGearDingyinRightMax(){ return GP_DINGYIN_RIGHT_MAX; }
  genGearWuxueNames(){ return [...GP_WUXUE_NAMES]; }
  genGearBows(){
    return Object.keys(GP_BOW_JUE_VALUES).map((kind: any) => {
      const v = GP_BOW_JUE_VALUES[kind];
      return { kind, label: v.label, acc: v.acc || 0, crit: v.crit || 0, int: v.int || 0 };
    });
  }
  genGearPasteNames(){ return Object.keys(GP_PASTE_NAME_TO_KEY).map((name: any) => ({ name, key: GP_PASTE_NAME_TO_KEY[name] })); }
  genGearNameToClass(){ return Object.keys(GP_NAME_TO_CLASS).map((name: any) => ({ name, cls: GP_NAME_TO_CLASS[name] })); }
  genGearSlotAliases(){ return Object.keys(GP_SLOT_ALIAS).map((name: any) => ({ name, key: GP_SLOT_ALIAS[name] })); }
  genGearOcrAliases(){ return Object.keys(GP_OCR_EXTRA_ALIAS).map((name: any) => ({ name, key: GP_OCR_EXTRA_ALIAS[name] })); }
  genGearLegacyKeys(){ return Object.keys(GP_LEGACY_KEY).map((name: any) => ({ name, key: GP_LEGACY_KEY[name] })); }
  genGearClassLabels(){ return Object.keys(GP_CLASS_LABEL).map((name: any) => ({ name, cls: enClassLabel(this.locale, GP_CLASS_LABEL[name]) })); }
  genGearSchoolTags(){ return GP_SCHOOL_TAG_LIST; }
  genGearDemoKit(){
    return GP_DEMO_KIT.map((d: any) => ({ slot: d.slot, name: d.name, keys: d.keys, dingyinName: d.dingyin.name, dingyinVal: d.dingyin.val }));
  }
  genGearDimRows(){ return GP_DIM_ROWS; }
  genGearQuickBarNames(){ return GP_QUICK_BAR_NAMES; }
  genGearResDefault(){ return 1.85; }
}

export const GEAR_DATA_RESOLVERS: Record<string, any> = {};
for (const f of ['gearSlots', 'gearGearSlots', 'gearAffixes', 'gearBuilds', 'gearSlotsBig', 'gearSlotsSmall',
  'gearBaseFields', 'gearXinfa', 'gearTalentRows', 'gearDingyinRows', 'gearDingyinLeft', 'gearDingyinRightMax', 'gearWuxueNames',
  'gearBows', 'gearPasteNames', 'gearNameToClass', 'gearSlotAliases', 'gearOcrAliases', 'gearLegacyKeys',
  'gearClassLabels', 'gearSchoolTags', 'gearDemoKit', 'gearDimRows', 'gearQuickBarNames', 'gearResDefault']) {
  const genName = 'gen' + f[0].toUpperCase() + f.slice(1);
  GEAR_DATA_RESOLVERS[f] = (p: any) => p[genName]();
}

export const GRAD_TEXT_RESOLVERS = defineTextGens(GradPageShell, [
  ['gradEnteringText', 'grad', 'entering'],
  ['gradTitle', 'grad', 'title'],
  ['gradSubtitle', 'grad', 'subtitle'],
  ['gradMingjinNote', 'grad', 'mingjinNote'],
  ['gradBuildBigLabel', 'grad', 'buildBig'],
  ['gradBuildSmallLabel', 'grad', 'buildSmall'],
  ['gradRingLabel', 'grad', 'ringLabel'],
  ['gradScoreCountLabel', 'grad', 'scoreCount'],
  ['gradScoreValueLabel', 'grad', 'scoreValue'],
  ['gradScoreRateLabel', 'grad', 'scoreRate'],
  ['gradTier1', 'grad', 'tier1'],
  ['gradTier2', 'grad', 'tier2'],
  ['gradTier3', 'grad', 'tier3'],
  ['gradTier4', 'grad', 'tier4'],
  ['gradTier5', 'grad', 'tier5'],
  ['gradTier6', 'grad', 'tier6'],
  ['gradTapHint', 'grad', 'tapHint'],
  ['gradRefTitle', 'grad', 'refTitle'],
  ['gradMaxTableTitle', 'grad', 'maxTableTitle'],
  ['gradColAffixLabel', 'grad', 'colAffix'],
  ['gradColMaxLabel', 'grad', 'colMax'],
  ['gradColResonanceLabel', 'grad', 'colResonance'],
  ['gradSlotTableTitleTemplate', 'grad', 'slotTableTitle'],
  ['gradRateTitle', 'grad', 'rateTitle'],
  ['gradRateOkTemplate', 'grad', 'rateOk'],
  ['gradRateGapTemplate', 'grad', 'rateGap'],
  ['gradRateOverflowTemplate', 'grad', 'rateOverflow'],
  ['gradCompareTitle', 'grad', 'compareTitle'],
  ['gradSaveSchemeLabel', 'grad', 'saveScheme'],
  ['gradSchemeNameTemplate', 'grad', 'schemeName'],
  ['gradNoSchemesText', 'grad', 'noSchemes'],
  ['gradLoadLabel', 'grad', 'load'],
  ['gradDeleteSchemeLabel', 'grad', 'deleteScheme'],
  ['gradCloseLabel', 'common', 'close'],
  ['gradItemScoreTemplate', 'grad', 'itemScore'],
  ['gradRowMainLabel', 'grad', 'rowMain'],
  ['gradRowSubTemplate', 'grad', 'rowSub'],
  ['gradRowResonanceLabel', 'grad', 'rowResonance'],
  ['gradAffixPlaceholder', 'grad', 'affixPlaceholder'],
  ['gradAffixLoadingText', 'grad', 'affixLoading'],
  ['gradValuePlaceholderMaxTemplate', 'grad', 'valuePlaceholderMax'],
  ['gradValuePlaceholder', 'grad', 'valuePlaceholder'],
  ['gradResonanceLabel', 'grad', 'resonance'],
  ['gradOverMaxTemplate', 'grad', 'overMax'],
  ['gradToastSavedTemplate', 'grad', 'toastSaved'],
  ['gradToastLoadedTemplate', 'grad', 'toastLoaded'],
  ['gradToastOldSchemeText', 'grad', 'toastOldScheme'],
  ['gradConfirmLabel', 'common', 'confirm'],
  ['gradCancelLabel', 'common', 'cancel'],
]);

export const GEAR_TEXT_RESOLVERS = defineTextGens(GradPageShell, [
  ['gearBenchTitle', 'gear', 'benchTitle'],
  ['gearCalcLabel', 'gear', 'calcLabel'],
  ['gearBenchIntro', 'gear', 'benchIntro'],
  ['gearTargetLabel', 'gear', 'targetLabel'],
  ['gearBowLabel', 'gear', 'bowLabel'],
  ['gearBowNoneLabel', 'gear', 'bowNoneLabel'],
  ['gearExtrasTitle', 'gear', 'extrasTitle'],
  ['gearResLabel', 'gear', 'resLabel'],
  ['gearExtraAccLabel', 'gear', 'extraAccLabel'],
  ['gearExtraCritLabel', 'gear', 'extraCritLabel'],
  ['gearExtraIntLabel', 'gear', 'extraIntLabel'],
  ['gearBaseTitle', 'gear', 'baseTitle'],
  ['gearUnlockLabel', 'gear', 'unlockLabel'],
  ['gearLockLabel', 'gear', 'lockLabel'],
  ['gearModifiedTag', 'gear', 'modifiedTag'],
  ['gearBaseResetLabel', 'gear', 'baseResetLabel'],
  ['gearBaseResetTitle', 'gear', 'baseResetTitle'],
  ['gearBaseResetBody', 'gear', 'baseResetBody'],
  ['gearXinfaLabelTemplate', 'gear', 'xinfaLabelTemplate'],
  ['gearXinfaNoneLabel', 'gear', 'xinfaNoneLabel'],
  ['gearLibTitle', 'gear', 'libTitle'],
 ['gearMyLibTitle', 'gear', 'myLibTitle'],
 ['gearMyBuildsTitle', 'gear', 'myBuildsTitle'],
  ['gearLoginHint', 'gear', 'loginHint'],
  ['gearLibCountTemplate', 'gear', 'libCountTemplate'],
  ['gearFormSlotLabel', 'gear', 'formSlotLabel'],
  ['gearFormNameLabel', 'gear', 'formNameLabel'],
  ['gearFormNamePlaceholder', 'gear', 'formNamePlaceholder'],
  ['gearAffixPlaceholder', 'gear', 'affixPlaceholder'],
  ['gearValuePlaceholder', 'gear', 'valuePlaceholder'],
  ['gearRefTemplate', 'gear', 'refTemplate'],
  ['gearFillMaxLabel', 'gear', 'fillMaxLabel'],
  ['gearFillCyLabel', 'gear', 'fillCyLabel'],
  ['gearDelRowLabel', 'gear', 'delRowLabel'],
  ['gearAddRowLabel', 'gear', 'addRowLabel'],
  ['gearDyNameLabel', 'gear', 'dyNameLabel'],
  ['gearDyNamePlaceholder', 'gear', 'dyNamePlaceholder'],
  ['gearDyValLabel', 'gear', 'dyValLabel'],
  ['gearSchoolsLabel', 'gear', 'schoolsLabel'],
  ['gearAddGearLabel', 'gear', 'addGearLabel'],
  ['gearUpdateGearLabel', 'gear', 'updateGearLabel'],
  ['gearCancelEditLabel', 'gear', 'cancelEditLabel'],
  ['gearDemoLabel', 'gear', 'demoLabel'],
  ['gearClearLibLabel', 'gear', 'clearLibLabel'],
  ['gearClearConfirmTitle', 'gear', 'clearConfirmTitle'],
  ['gearClearConfirmBody', 'gear', 'clearConfirmBody'],
  ['gearEquipLabel', 'gear', 'equipLabel'],
  ['gearUnequipLabel', 'gear', 'unequipLabel'],
  ['gearEditLabel', 'gear', 'editLabel'],
  ['gearDeleteLabel', 'gear', 'deleteLabel'],
  ['gearSimLabel', 'gear', 'simLabel'],
  ['gearSimRealLabel', 'gear', 'simRealLabel'],
  ['gearSimCyLabel', 'gear', 'simCyLabel'],
  ['gearSimMaxLabel', 'gear', 'simMaxLabel'],
  ['gearVerdictHeirloom', 'gear', 'verdictHeirloom'],
  ['gearVerdictDud', 'gear', 'verdictDud'],
  ['gearScoreTemplate', 'gear', 'scoreTemplate'],
  ['gearQualityLabel', 'gear', 'qualityLabel'],
  ['gearExportLabel', 'gear', 'exportLabel'],
  ['gearImportLabel', 'gear', 'importLabel'],
  ['gearImportFailedToast', 'gear', 'importFailedToast'],
  ['gearImportedToastTemplate', 'gear', 'importedToastTemplate'],
  ['gearPasteTitle', 'gear', 'pasteTitle'],
  ['gearPastePlaceholder', 'gear', 'pastePlaceholder'],
  ['gearPasteButtonLabel', 'gear', 'pasteButtonLabel'],
  ['gearPasteDemoLabel', 'gear', 'pasteDemoLabel'],
  ['gearPasteEmptyText', 'gear', 'pasteEmptyText'],
  ['gearPasteOkTemplate', 'gear', 'pasteOkTemplate'],
  ['gearPasteUnknownTemplate', 'gear', 'pasteUnknownTemplate'],
  ['gearPasteFailText', 'gear', 'pasteFailText'],
  ['gearPasteFullText', 'gear', 'pasteFullText'],
  ['gearOcrTitle', 'gear', 'ocrTitle'],
  ['gearOcrDropText', 'gear', 'ocrDropText'],
  ['gearOcrPreparingText', 'gear', 'ocrPreparingText'],
  ['gearOcrRunningText', 'gear', 'ocrRunningText'],
  ['gearOcrSecondText', 'gear', 'ocrSecondText'],
  ['gearOcrFailedText', 'gear', 'ocrFailedText'],
  ['gearOcrBadTypeText', 'gear', 'ocrBadTypeText'],
  ['gearOcrTooBigText', 'gear', 'ocrTooBigText'],
  ['gearOcrNoEngineText', 'gear', 'ocrNoEngineText'],
  ['gearOcrDoneTemplate', 'gear', 'ocrDoneTemplate'],
  ['gearOcrSlotLabel', 'gear', 'ocrSlotLabel'],
  ['gearOcrNameLabel', 'gear', 'ocrNameLabel'],
  ['gearOcrEquipLabel', 'gear', 'ocrEquipLabel'],
  ['gearOcrConfirmLabel', 'gear', 'ocrConfirmLabel'],
  ['gearOcrCancelLabel', 'gear', 'ocrCancelLabel'],
  ['gearOcrUnknownTitle', 'gear', 'ocrUnknownTitle'],
  ['gearOcrSavedTemplate', 'gear', 'ocrSavedTemplate'],
  ['gearOcrNeedLineToast', 'gear', 'ocrNeedLineToast'],
  ['gearOcrLowConfTag', 'gear', 'ocrLowConfTag'],
  ['gearOcrAddRowLabel', 'gear', 'ocrAddRowLabel'],
  ['gearOcrImportSlotTemplate', 'gear', 'ocrImportSlotTemplate'],
  ['gearOcrBatchTitle', 'gear', 'ocrBatchTitle'],
  ['gearOcrBatchDropText', 'gear', 'ocrBatchDropText'],
  ['gearOcrBatchQueuedText', 'gear', 'ocrBatchQueuedText'],
  ['gearOcrBatchRunningText', 'gear', 'ocrBatchRunningText'],
  ['gearOcrBatchReadyText', 'gear', 'ocrBatchReadyText'],
  ['gearOcrBatchFailedText', 'gear', 'ocrBatchFailedText'],
  ['gearOcrBatchImportedText', 'gear', 'ocrBatchImportedText'],
  ['gearOcrBatchRetryLabel', 'gear', 'ocrBatchRetryLabel'],
  ['gearOcrBatchRemoveLabel', 'gear', 'ocrBatchRemoveLabel'],
  ['gearOcrBatchAdjustLabel', 'gear', 'ocrBatchAdjustLabel'],
  ['gearOcrBatchApplyBoxLabel', 'gear', 'ocrBatchApplyBoxLabel'],
  ['gearOcrBatchDetectedText', 'gear', 'ocrBatchDetectedText'],
  ['gearOcrBatchFullImageText', 'gear', 'ocrBatchFullImageText'],
  ['gearOcrBatchDupTag', 'gear', 'ocrBatchDupTag'],
  ['gearOcrBatchDupLibText', 'gear', 'ocrBatchDupLibText'],
  ['gearOcrBatchDupRowText', 'gear', 'ocrBatchDupRowText'],
  ['gearOcrBatchIncludeLabel', 'gear', 'ocrBatchIncludeLabel'],
  ['gearOcrBatchNoLinesText', 'gear', 'ocrBatchNoLinesText'],
  ['gearOcrBatchImportTemplate', 'gear', 'ocrBatchImportTemplate'],
  ['gearOcrBatchResultTemplate', 'gear', 'ocrBatchResultTemplate'],
  ['gearLibEmptyText', 'gear', 'libEmptyText'],
  ['gearEquippedTag', 'gear', 'equippedTag'],
  ['gearLoadoutTitle', 'gear', 'loadoutTitle'],
  ['gearAutoLabel', 'gear', 'autoLabel'],
  ['gearAutoDoneToast', 'gear', 'autoDoneToast'],
  ['gearAutoFallbackToast', 'gear', 'autoFallbackToast'],
  ['gearUnequipAllLabel', 'gear', 'unequipAllLabel'],
  ['gearSlotEmptyText', 'gear', 'slotEmptyText'],
  ['gearPanelTitle', 'gear', 'panelTitle'],
  ['gearGradLabel', 'gear', 'gradLabel'],
  ['gearGradCountLabel', 'gear', 'gradCountLabel'],
  ['gearGradValueLabel', 'gear', 'gradValueLabel'],
  ['gearGradDyLabel', 'gear', 'gradDyLabel'],
  ['gearGradDyToggleLabel', 'gear', 'gradDyToggleLabel'],
  ['gearLoanLabel', 'gear', 'loanLabel'],
  ['gearSimActiveTag', 'gear', 'simActiveTag'],
  ['gearCopySummaryLabel', 'gear', 'copySummaryLabel'],
  ['gearCopiedToast', 'gear', 'copiedToast'],
  ['gearCopyFailedToast', 'gear', 'copyFailedToast'],
  ['gearYAccLabel', 'gear', 'yAccLabel'],
  ['gearYCritLabel', 'gear', 'yCritLabel'],
  ['gearYIntLabel', 'gear', 'yIntLabel'],
  ['gearFinalCritLabel', 'gear', 'finalCritLabel'],
  ['gearWhiteLabel', 'gear', 'whiteLabel'],
  ['gearDawaiLabel', 'gear', 'dawaiLabel'],
  ['gearXiaowaiLabel', 'gear', 'xiaowaiLabel'],
  ['gearDashuLabel', 'gear', 'dashuLabel'],
  ['gearXiaoshuLabel', 'gear', 'xiaoshuLabel'],
  ['gearHpLabel', 'gear', 'hpLabel'],
  ['gearDefLabel', 'gear', 'defLabel'],
  ['gearTalentLabel', 'gear', 'talentLabel'],
  ['gearDiffTitle', 'gear', 'diffTitle'],
  ['gearDiffLackTemplate', 'gear', 'diffLackTemplate'],
  ['gearDiffExactText', 'gear', 'diffExactText'],
  ['gearDiffOverTemplate', 'gear', 'diffOverTemplate'],
  ['gearDiffExtraTitle', 'gear', 'diffExtraTitle'],
  ['gearDiffLowTitle', 'gear', 'diffLowTitle'],
  ['gearDiffDoneText', 'gear', 'diffDoneText'],
  ['gearDiffEmptyText', 'gear', 'diffEmptyText'],
  ['gearDiffInvalidTemplate', 'gear', 'diffInvalidTemplate'],
  ['gearSuggestTitle', 'gear', 'suggestTitle'],
  ['gearSuggestSwapTemplate', 'gear', 'suggestSwapTemplate'],
  ['gearSuggestWashTemplate', 'gear', 'suggestWashTemplate'],
  ['gearSuggestNoneText', 'gear', 'suggestNoneText'],
  ['gearSuggestHeadTemplate', 'gear', 'suggestHeadTemplate'],
  ['gearDySummaryTitle', 'gear', 'dySummaryTitle'],
  ['gearDyCorrectText', 'gear', 'dyCorrectText'],
  ['gearDyWrongText', 'gear', 'dyWrongText'],
  ['gearSchemeTitle', 'gear', 'schemeTitle'],
  ['gearSchemeSaveLabel', 'gear', 'schemeSaveLabel'],
  ['gearSchemeNameTemplate', 'gear', 'schemeNameTemplate'],
  ['gearSchemeLoadLabel', 'gear', 'schemeLoadLabel'],
  ['gearSchemeDeleteLabel', 'gear', 'schemeDeleteLabel'],
  ['gearSchemeEmptyText', 'gear', 'schemeEmptyText'],
  ['gearSchemeComposeFirstText', 'gear', 'schemeComposeFirstText'],
  ['gearSchemeSavedToastTemplate', 'gear', 'schemeSavedToastTemplate'],
  ['gearSchemeLoadedToastTemplate', 'gear', 'schemeLoadedToastTemplate'],
  ['gearSchemeGroupCountTemplate', 'gear', 'schemeGroupCountTemplate'],
  ['gearQuickTitle', 'gear', 'quickTitle'],
  ['gearQuickResLabel', 'gear', 'quickResLabel'],
  ['gearQuickSyncLabel', 'gear', 'quickSyncLabel'],
  ['gearQuickSyncedToast', 'gear', 'quickSyncedToast'],
  ['gearQuickOkText', 'gear', 'quickOkText'],
  ['gearQuickOverTemplate', 'gear', 'quickOverTemplate'],
  ['gearQuickGapTemplate', 'gear', 'quickGapTemplate'],
  ['gearRecipesTitle', 'gear', 'recipesTitle'],
  ['gearRecipeSearchPlaceholder', 'gear', 'recipeSearchPlaceholder'],
  ['gearRecipeAllLabel', 'gear', 'recipeAllLabel'],
  ['gearRecipeColCat', 'gear', 'recipeColCat'],
  ['gearRecipeColSchool', 'gear', 'recipeColSchool'],
  ['gearRecipeColSet', 'gear', 'recipeColSet'],
  ['gearRecipeColRecipe', 'gear', 'recipeColRecipe'],
  ['gearRecipeColBow', 'gear', 'recipeColBow'],
  ['gearRecipeSetTargetLabel', 'gear', 'recipeSetTargetLabel'],
  ['gearRecipeEmptyText', 'gear', 'recipeEmptyText'],
  ['gearRecipeTargetToastTemplate', 'gear', 'recipeTargetToastTemplate'],
  ['gearSectRecipesTitle', 'gear', 'sectRecipesTitle'],
  ['gearAffixTableTitle', 'gear', 'affixTableTitle'],
  ['gearColCyLabel', 'gear', 'colCyLabel'],
  ['gearColCyPctLabel', 'gear', 'colCyPctLabel'],
  ['gearColRecipeNamesLabel', 'gear', 'colRecipeNamesLabel'],
  ['gearSurvivalNote', 'gear', 'survivalNote'],
  ['gearSlotTableTitle', 'gear', 'slotTableTitle'],
  ['gearSlotsBigTitle', 'gear', 'slotsBigTitle'],
  ['gearSlotsSmallTitle', 'gear', 'slotsSmallTitle'],
  ['gearFormulaTitle', 'gear', 'formulaTitle'],
  ['gearFormulaRatesTitle', 'gear', 'formulaRatesTitle'],
  ['gearFormulaDimsTitle', 'gear', 'formulaDimsTitle'],
  ['gearFormulaOrderTitle', 'gear', 'formulaOrderTitle'],
  ['gearFormulaAccTemplate', 'gear', 'formulaAccTemplate'],
  ['gearFormulaCritTemplate', 'gear', 'formulaCritTemplate'],
  ['gearFormulaIntTemplate', 'gear', 'formulaIntTemplate'],
  ['gearFormulaBarsTemplate', 'gear', 'formulaBarsTemplate'],
  ['gearFormulaBowTemplate', 'gear', 'formulaBowTemplate'],
  ['gearFormulaOrderText', 'gear', 'formulaOrderText'],
  ['gearColDimLabel', 'gear', 'colDimLabel'],
  ['gearColConvLabel', 'gear', 'colConvLabel'],
  ['gearColFullBarTemplate', 'gear', 'colFullBarTemplate'],
  ['gearCalcFailedText', 'gear', 'calcFailedText'],
  ['gearDemoLoadedToast', 'gear', 'demoLoadedToast'],
  ['gearSavedToastTemplate', 'gear', 'savedToastTemplate'],
  ['gearDeletedToast', 'gear', 'deletedToast'],
  ['gearClearedToast', 'gear', 'clearedToast'],
]);

/* ---------- 设置页 shell (语言偏好) ----------
 * 文案字段由 gen 方法按 locale 从 settings 节生成; localePref 是账号存储
 * 的偏好 (null = 自动), effectiveLocale 是本请求实际生效的 locale。 */


export const gearResolvers = {
  Query: {
    gradPage: (_: any, __: any, ctx: any) => new GradPageShell(ctx, {}),

    // 配装台装备库: 只回调用者自己的 (匿名无库, 返回空)
    myGearItems: async (_: any, __: any, ctx: any) => {
      if (!ctx.user) return [];
      return listGearItems(ctx.env.DB, ctx.user.discordId);
    },
    myGearBuilds: async (_: any, __: any, ctx: any) => {
      if (!ctx.user) return [];
      return listGearBuilds(ctx.env.DB, ctx.user.discordId);
    },

    tiaolvPage: (_: any, __: any, ctx: any) => new TiaolvPageShell(ctx, {}),
  },
  Mutation: {
    gearPlan: async (_: any, { input }: any, ctx: any) => {
      if (!rateLimit('mut:gearplan:' + getClientIp(ctx.request), 20)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      const lib = (input.lib || []).map((g: any) => gpSanitizeGearData({
        id: g.id, slot: g.slot, name: g.name || '', lines: g.lines || [],
        dingyin: g.dingyin || null, schools: g.schools || [],
      }).gear);
      const loadout: Record<string, any> = {};
      (input.loadout || []).forEach((e: any) => { loadout[e.slot] = e.gearId; });
      const baseValues: Record<string, any> = {};
      (input.baseValues || []).forEach((v: any) => { baseValues[v.key] = v.val; });
      const sim: Record<string, any> = {};
      (input.sim || []).forEach((s: any) => { if (s.tier === 'cy' || s.tier === 'max') sim[s.id] = s.tier; });
      const state = {
        targetIdx: input.targetIdx || 0, baseValues, xinfa: input.xinfa || [],
        extras: { res: input.res, acc: input.extraAcc, crit: input.extraCrit, int: input.extraInt, bowKind: input.bowKind || '' },
        sim, gradDingyinOn: input.gradDingyinOn !== false,
      };
      const r = gpPlan(lib, loadout, state);
      // 传家宝推送评估 (服务端, waitUntil 异步; 未登录/失败静默, 不影响计算)
      if (ctx.user && ctx.user.discordId && ctx.env && ctx.env.DB) {
        const run = evaluateHeirloomPushes(ctx.env.DB, {
          discordId: String(ctx.user.discordId),
          userName: String(ctx.user.name || ''),
          userGuilds: Array.isArray(ctx.user.guilds) ? ctx.user.guilds.map(String) : [],
          lib, loadout, targetIdx: state.targetIdx,
          evals: r.gearEvals, gradTotal: r.grad.total,
        }).catch(() => { /* 推送评估失败绝不影响配装计算 */ });
        if (ctx.executionCtx && typeof ctx.executionCtx.waitUntil === 'function') {
          ctx.executionCtx.waitUntil(run);
        }
      }
      return {
        panel: r.panel, grad: r.grad, realPanel: r.realPanel, realGrad: r.realGrad,
        loanGrad: r.loanGrad, suggestions: r.suggestions, extraClasses: r.extraClasses,
        gearEvals: r.gearEvals,
        baseNotes: r.baseSummary.xinfaNotes, xinfaPicked: r.baseSummary.xinfaPicked,
        xinfaDuplicates: r.baseSummary.xinfaDuplicates,
      };
    },

    gearAutoCombine: async (_: any, { targetIdx, lib }: any, ctx: any) => {
      if (!rateLimit('mut:gearauto:' + getClientIp(ctx.request), 20)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      const clean = (lib || []).map((g: any) => gpSanitizeGearData({
        id: g.id, slot: g.slot, name: g.name || '', lines: g.lines || [],
        dingyin: g.dingyin || null, schools: g.schools || [],
      }).gear);
      const r = gpAutoCombine(clean, targetIdx || 0);
      return {
        loadout: Object.keys(r.loadout).map((slot: any) => ({ slot, gearId: r.loadout[slot] })),
        fallbackUsed: r.fallbackUsed,
      };
    },

    gearParsePaste: async (_: any, { text }: any, ctx: any) => {
      if (!rateLimit('mut:gearpaste:' + getClientIp(ctx.request), 20)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      const r = gpParsePaste(String(text || '').slice(0, 200000));
      return {
        mode: r.mode, unknown: r.unknown, gears: r.gears,
        fullExportJson: r.fullExport ? JSON.stringify(r.fullExport) : null,
      };
    },

    gearQuickCalc: async (_: any, { input }: any, ctx: any) => {
      if (!rateLimit('mut:gearquick:' + getClientIp(ctx.request), 30)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      return gpQuickCalc(input.whiteAcc, input.whiteCrit, input.whiteInt, input.res);
    },

    // ---- 配装台装备库写操作 (会话复验 + discord_id 限定; 他人行视为不存在) ----
    addGearItem: async (_: any, { input }: any, ctx: any) => {
      if (!ctx.user) return { ok: false, item: null, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      if (!rateLimit('mut:gearitem:' + getClientIp(ctx.request), 60)) {
        return { ok: false, item: null, error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited' };
      }
      const gear = gpSanitizeGearData({
        slot: input.slot, name: input.name || '', lines: input.lines || [],
        dingyin: input.dingyin || null, schools: input.schools || [],
      }).gear;
      const saved = await insertGearItem(ctx.env.DB, ctx.user.discordId, gear);
      return { ok: true, item: saved, error: null, errorCode: null };
    },

    updateGearItem: async (_: any, { id, input }: any, ctx: any) => {
      if (!ctx.user) return { ok: false, item: null, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      if (!rateLimit('mut:gearitem:' + getClientIp(ctx.request), 60)) {
        return { ok: false, item: null, error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited' };
      }
      const db = ctx.env.DB, did = ctx.user.discordId;
      let schools = input.schools;
      if (schools == null) {
        const mine = await listGearItems(db, did);
        const old = mine.find((g: any) => g.id === id);
        if (!old) return { ok: false, item: null, error: errText(ctx, 'gearNotFound'), errorCode: 'gearNotFound' };
        schools = old.schools || [];
      }
      const gear = gpSanitizeGearData({
        slot: input.slot, name: input.name || '', lines: input.lines || [],
        dingyin: input.dingyin || null, schools,
      }).gear;
      const saved = await updateGearItemRow(db, did, id, gear);
      if (!saved) return { ok: false, item: null, error: errText(ctx, 'gearNotFound'), errorCode: 'gearNotFound' };
      return { ok: true, item: saved, error: null, errorCode: null };
    },

    deleteGearItem: async (_: any, { id }: any, ctx: any) => {
      if (!ctx.user) return { ok: false, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      const done = await deleteGearItemRow(ctx.env.DB, ctx.user.discordId, id);
      if (!done) return { ok: false, error: errText(ctx, 'gearNotFound'), errorCode: 'gearNotFound' };
      return { ok: true, error: null, errorCode: null };
    },

    importGearItems: async (_: any, { items, loadout }: any, ctx: any) => {
      if (!ctx.user) return { ok: false, items: [], autoSelect: [], error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      if (!rateLimit('mut:gearimport:' + getClientIp(ctx.request), 20)) {
        return { ok: false, items: [], autoSelect: [], error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited' };
      }
      const db = ctx.env.DB, did = ctx.user.discordId;
      const saved = [];
      for (const input of (items || []).slice(0, 200)) {
        const gear = gpSanitizeGearData({
          slot: input.slot, name: input.name || '', lines: input.lines || [],
          dingyin: input.dingyin || null, schools: input.schools || [],
        }).gear;
        saved.push(await insertGearItem(db, did, gear));
      }
      // 自动选入 (对照原站 importParsedGears): 武器先主后副, 其余取空位
      const lo: Record<string, any> = {};
      (loadout || []).forEach((e: any) => { lo[e.slot] = e.gearId; });
      const autoSelect = [];
      for (const it of saved) {
        if (it.slot === '武器') {
          if (!lo['主武器']) { lo['主武器'] = it.id; autoSelect.push({ slot: '主武器', gearId: it.id }); }
          else if (!lo['副武器']) { lo['副武器'] = it.id; autoSelect.push({ slot: '副武器', gearId: it.id }); }
        } else if (!lo[it.slot]) { lo[it.slot] = it.id; autoSelect.push({ slot: it.slot, gearId: it.id }); }
      }
      return { ok: true, items: saved, autoSelect, error: null, errorCode: null };
    },

    saveGearBuild: async (_: any, { input }: any, ctx: any) => {
      if (!ctx.user) return { ok: false, build: null, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      if (!rateLimit('mut:gearbuild:' + getClientIp(ctx.request), 30)) {
        return { ok: false, build: null, error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited' };
      }
      const db = ctx.env.DB, did = ctx.user.discordId;
      const items = await listGearItems(db, did);
      const owned = new Set(items.map((g: any) => g.id));
      const lo: Record<string, any> = {};
      (input.loadout || []).forEach((e: any) => { if (owned.has(e.gearId)) lo[e.slot] = e.gearId; });
      if (!Object.keys(lo).length) {
        return { ok: false, build: null, error: errText(ctx, 'gearEmptyBuild'), errorCode: 'gearEmptyBuild' };
      }
      const baseValues: Record<string, any> = {};
      (input.baseValues || []).forEach((v: any) => { baseValues[v.key] = v.val; });
      const state = {
        targetIdx: input.targetIdx || 0, baseValues, xinfa: input.xinfa || [],
        extras: { res: input.res, acc: input.extraAcc, crit: input.extraCrit, int: input.extraInt, bowKind: input.bowKind || '' },
        sim: {}, gradDingyinOn: input.gradDingyinOn !== false,
      };
      const r = gpPlan(items, lo, state);
      const b = GP_BUILDS[state.targetIdx] || GP_BUILDS[0];
      const snapshot = {
        total: r.realGrad.total, a: r.realGrad.A, b: r.realGrad.B, d: r.realGrad.D,
        loan: r.loanGrad.total, yAcc: r.realPanel.yAcc, yCrit: r.realPanel.yCrit,
        yInt: r.realPanel.yInt, dawai: r.realPanel.dawai, xiaowai: r.realPanel.xiaowai,
      };
      const saved = await insertGearBuild(db, did, {
        name: input.name || '', targetIdx: state.targetIdx,
        buildLabel: b.school + ' · ' + b.set, loadout: lo, baseValues,
        xinfa: state.xinfa, extras: { res: state.extras.res ?? 1.85, acc: state.extras.acc || 0, crit: state.extras.crit || 0, int: state.extras.int || 0 },
        bowKind: state.extras.bowKind, gradDingyinOn: state.gradDingyinOn, snapshot,
      });
      return { ok: true, build: saved, error: null, errorCode: null };
    },

    deleteGearBuild: async (_: any, { id }: any, ctx: any) => {
      if (!ctx.user) return { ok: false, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      const done = await deleteGearBuildRow(ctx.env.DB, ctx.user.discordId, id);
      if (!done) return { ok: false, error: errText(ctx, 'gearNotFound'), errorCode: 'gearNotFound' };
      return { ok: true, error: null, errorCode: null };
    },

    // 账号级语言偏好: locale=null 清除 (回自动); 有值必须在受支持集合内。
    // 生效 locale 的解析在 worker 层完成 (偏好压过浏览器语言), 这里只落库
    // 并回带变更后的 pref 与即时生效值 (清除时回退到浏览器协商值)。
    calcTiaolv: async (_: any, { input }: any, ctx: any) => {
      // 限流: 计算密集型, 每 IP 每分钟 30 次
      if (!rateLimit('mut:tiaolv:' + getClientIp(ctx.request), 30)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      // 严格复刻 片雲 DIY 0.10.2 Excel 公式 (src/tiaolv.js)
      // 术语: 基础白值(B列) / 面板白值(C列) / 最终面板(D列)
      const tunes: Record<string, any> = {};
      for (const t of (input.tunes || [])) {
        if (!t || t.cell == null) continue;
        const n = Number(t.value);
        tunes[String(t.cell)] = Number.isFinite(n) ? n : 0;
      }
      const rows = tlCalculateExcel({
        innerSkills: input.innerSkills || [],
        wuxue: input.wuxue || undefined,
        wuku: input.wuku || undefined,
        attrRequire: typeof input.attrRequire === 'number' ? input.attrRequire : undefined,
        suit: input.suit || '',
        bowSkill: input.bowSkill || '',
        tunes,
      });
      return { rows };
    },

    calcGraduation: async (_: any, { input }: any, ctx: any) => {
      if (!rateLimit('mut:grad:' + getClientIp(ctx.request), 30)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      // 口径：50%条数匹配 + 30%数值达成 + 20%三率达标（参考 gear-planner）
      const db = ctx.env.DB;
      const maxRows = await listAffixMaxValues(db);
      const maxMap: Record<string, any> = {};
      for (const r of maxRows) maxMap[r.affix_key] = r.max_value;

      // slug -> 中文名
      let schoolName = input.sectSlug;
      const schoolRow = await getSchoolNameBySlug(db, input.sectSlug).catch(() => null);
      if (schoolRow) schoolName = schoolRow.name;

      // 获取目标配方的词条类别（从 school_bis）
      const bisRow = await getSchoolBisJsonBySchool(db, schoolName).catch(() => null);
      let targetCats: Record<string, any> = {};
      if (bisRow && bisRow.bis_json) {
        try {
          const bis = JSON.parse(bisRow.bis_json);
          // 中文名 -> key 映射
          const nameToKey: Record<string, string> = {
            '大外': 'max_atk', '小外': 'min_atk',
            '劲': 'power', '敏': 'agility', '体': 'constitution', '御': 'defense', '势': 'spirit',
            '会心': 'crit_rate', '会心率': 'crit_rate',
            '精准': 'precision', '精准率': 'precision',
            '会意': 'affinity', '会意率': 'affinity',
            '大属攻': 'class_atk_max', '小属攻': 'class_atk_min',
            '外穿': 'phys_pen', '属穿': 'class_pen',
            '全武学增伤': 'all_weapon', '首领增伤': 'boss_dmg', '调律增伤': 'tuning'
          };
          // bis 格式：[["部位", "大外（初始）、大外、劲、势"], ...]
          if (Array.isArray(bis)) {
            bis.forEach(([slot, affixStr]: any) => {
              if (!affixStr) return;
              // 按顿号分割，清理括号内容
              affixStr.split('、').forEach((a: any) => {
                const clean = a.replace(/（[^）]*）/g, '').trim();
                const key = nameToKey[clean];
                if (key) targetCats[key] = (targetCats[key] || 0) + 1;
              });
            });
          }
        } catch(e) {}
      }

      // 统计用户词条
      const userCats: Record<string, any> = {};
      let valueSum = 0, valueCount = 0;
      const items = [];
      for (const item of (input.items || [])) {
        let itemValueSum = 0, itemValueCount = 0;
        for (const affix of (item.affixes || [])) {
          if (!affix.key || !affix.value) continue;
          // 条数统计（按key归类）
          userCats[affix.key] = (userCats[affix.key] || 0) + 1;
          // 数值达成：value ÷ 承音值(95% max)
          const max = maxMap[affix.key];
          if (max) {
            const cy = max * 0.95;
            const score = Math.min(Math.max(0, affix.value) / cy, 1);
            valueSum += score;
            valueCount++;
            itemValueSum += score;
            itemValueCount++;
          }
        }
        // 单件分数 = 该件数值达成度
        const itemScore = itemValueCount ? Math.round((itemValueSum / itemValueCount) * 100) : 0;
        items.push({ slot: item.slot, score: itemScore });
      }

      // A: 条数匹配度（50%）- 用户词条类别中，有多少在目标里
      let matchSum = 0, catCount = 0;
      for (const [key, count] of Object.entries(userCats)) {
        // 如果目标有这个类别，按 min(实际,目标)/目标 算；目标没有则按0
        // 简化：如果目标为空（没配配方），则按1算（不扣分）
        const target = targetCats[key];
        if (Object.keys(targetCats).length === 0) {
          matchSum += 1; // 无目标时不扣分
        } else if (target) {
          matchSum += Math.min(count / target, 1);
        } else {
          matchSum += 0; // 目标没有这个词条，0分
        }
        catCount++;
      }
      const A = catCount ? matchSum / catCount : 0;

      // B: 数值达成度（30%）
      const B = valueCount ? valueSum / valueCount : 0;

      // C: 三率达标度（20%）
      const p = Math.min((input.precision || 0) / 100, 1);
      const c = Math.min((input.crit || 0) / 80, 1);
      const a = Math.min((input.affinity || 0) / 40, 1);
      const C = (p + c + a) / 3;

      const total = 0.5 * A + 0.3 * B + 0.2 * C;
      return {
        total: Math.round(total * 100),
        countScore: Math.round(A * 100),
        valueScore: Math.round(B * 100),
        rateScore: Math.round(C * 100),
        items
      };
    },
  },
  types: {
  TiaolvPage: {
    sects: (p: any) => p.genSects(),
    innerSkills: (p: any) => p.genInnerSkills(),
    suits: (p: any) => p.genSuits(),
    maxValues: (p: any) => p.genMaxValues(),
    sectWeights: (p: any) => p.genSectWeights(),
    ...TIAOLV_TEXT_RESOLVERS,
  },
  GradPage: { ...GRAD_TEXT_RESOLVERS, ...GEAR_TEXT_RESOLVERS, ...GEAR_DATA_RESOLVERS },
  GearPanel: {
    sums: (p: any) => Object.entries(p.sums || {}).map(([key, val]: any) => ({ key, val })),
    classCounts: (p: any) => Object.entries(p.classCounts || {}).map(([key, val]: any) => ({ key, val })),
    dingyinTotals: (p: any) => Object.entries(p.dingyinTotals || {}).map(([key, val]: any) => ({ key, val })),
  },
  GearGrad: { a: (p: any) => p.A, b: (p: any) => p.B, d: (p: any) => p.D },
  GearSavedBuild: {
    // 显示覆盖层: school / buildLabel 按请求 locale 本地化 (存储的
    // buildLabel 保持规范中文; 非覆盖 locale 下重组结果与存储值逐字一致)。
    school: (p: any, _a: any, ctx: any) => enBuildSchool(ctx.locale, (GP_BUILDS[p.targetIdx] || GP_BUILDS[0]).school),
    buildLabel: (p: any, _a: any, ctx: any) => {
      const b = GP_BUILDS[p.targetIdx] || GP_BUILDS[0];
      return enBuildSchool(ctx.locale, b.school) + ' · ' + enGearSetName(ctx.locale, b.set);
    },
    loadout: (p: any) => Object.entries(p.loadout || {}).map(([slot, gearId]: any) => ({ slot, gearId })),
    baseValues: (p: any) => Object.entries(p.baseValues || {}).map(([key, val]: any) => ({ key, val })),
    res: (p: any) => (p.extras && typeof p.extras.res === 'number') ? p.extras.res : 1.85,
    extraAcc: (p: any) => (p.extras && p.extras.acc) || 0,
    extraCrit: (p: any) => (p.extras && p.extras.crit) || 0,
    extraInt: (p: any) => (p.extras && p.extras.int) || 0,
    bowKind: (p: any) => p.bowKind || '',
    snapTotal: (p: any) => (p.snapshot && p.snapshot.total) || 0,
    snapA: (p: any) => (p.snapshot && p.snapshot.a) || 0,
    snapB: (p: any) => (p.snapshot && p.snapshot.b) || 0,
    snapD: (p: any) => (p.snapshot && p.snapshot.d) || 0,
    snapLoan: (p: any) => (p.snapshot && p.snapshot.loan) || 0,
    snapYAcc: (p: any) => (p.snapshot && p.snapshot.yAcc) || 0,
    snapYCrit: (p: any) => (p.snapshot && p.snapshot.yCrit) || 0,
    snapYInt: (p: any) => (p.snapshot && p.snapshot.yInt) || 0,
    snapDawai: (p: any) => (p.snapshot && p.snapshot.dawai) || 0,
    snapXiaowai: (p: any) => (p.snapshot && p.snapshot.xiaowai) || 0,
    createdAt: (p: any) => p.createdAt || 0,
  },
  },
};
