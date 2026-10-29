/* gear domain GraphQL: gear-planner/tiaolv shells and all gear mutations/calculations. */
import type { Context } from '../platform/context.ts';
import {
  clampBlocksVersion, substituteForVersion, weekWindowUtc, startsAtEpoch,
  fmtStartsAt, groupByLocalDay, TYPE_SHORT_KEY, HEALER_SECT,
  getEffectiveLimits, getOcrBatchesUsedToday, recordOcrBatch,
} from '../platform/index.ts';
import { tlCalculateExcel } from './index.ts';
import { getUserServers, getGuildNick, maybeRefreshGuildNicks, getUserLocalePref, setUserLocalePref } from '../identity/auth.ts';
import { upsertGuildMember } from '../groupings/index.ts';
import { isValidPushToken, savePushToken, deletePushToken } from '../platform/index.ts';
import { evaluateHeirloomPushes } from './index.ts';
import { translate, translateError, negotiateLocale, SUPPORTED_LOCALES, CATALOG } from '../platform/index.ts';
import { logError } from '../platform/index.ts';
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
  listGearBuilds, insertGearBuild, deleteGearBuildRow, countGearItemRows,
  getBuildShareLink, buildShareUrl, resolveSharedBuild,
  shareGearBuild as shareGearBuildSvc, revokeBuildShare,
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
  TL_SUIT_OPTIONS, TL_BOW_OPTIONS, TL_WUKU_OPTIONS, TL_SECT_WUXUE, TL_TUNE_ROWS,
  tlSuitName, tlBowName, tlWukuName, GRAD_SLOTS, GRAD_RATES, gearVocabRules,
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

/* Parameterized server error copy (errText carries no params). */
function errTextP(ctx: Context, code: string, params: Record<string, number>) {
  return translateError(code, (ctx && ctx.locale) || 'zh-CN', params);
}

export const TIAOLV_MAX = { mainAttr: 88.4, outerAtk: 139.6, accuracy: 0.144, crit: 0.162, critDamage: 0.081, sectAttr: 79.2 };
// Sect weights (the user's own rule): Bellstrike affinity x3, crit builds crit x3, 裂石·威 no bonus, 牵丝·霖 healing-oriented.
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
    // Inner-skill name set (mirrors xinfa.json so the Worker reads no static files) — game data
    return ['千营一呼', '易水歌', '征人归', '断石之构', '大唐歌', '极乐泣血', '忘川绝响', '花上月令', '剑气纵横'];
  }
  genSuits(){ return SUITS; }
  genMaxValues(){ return TIAOLV_MAX; }
  genSectWeights(){ return SECT_WEIGHTS; }
  /* Closed vocabularies as {id, label} options (vocab.ts is the single
   * source): the client keys its state by id and renders label; the
   * "none" entry's label is UI copy and follows the request locale,
   * the game-term labels are the canonical names in every locale. */
  genTlSuitOptions(){
    return TL_SUIT_OPTIONS.map((o) => ({
      id: o.id, isDefault: o.isDefault,
      label: o.id === 'none' ? translate('tiaolv_none', this.locale) : o.name,
    }));
  }
  genTlBowOptions(){
    return TL_BOW_OPTIONS.map((o) => ({
      id: o.id, isDefault: o.isDefault,
      label: o.id === 'none' ? translate('tiaolv_none', this.locale) : o.name,
    }));
  }
  genTlWukuOptions(){
    return TL_WUKU_OPTIONS.map((o) => ({
      id: o.id, isDefault: o.isDefault,
      label: translate(o.id === 'self' ? 'tiaolv_wukuSelf' : 'tiaolv_wukuCommon', this.locale),
    }));
  }
  genTlTuneRows(){ return TL_TUNE_ROWS; }
  genTlSectWuxue(){ return TL_SECT_WUXUE; }
}

export const TIAOLV_TEXT_RESOLVERS = defineTextGens(TiaolvPageShell, [
  ['tlIntroText', 'tiaolv_intro'],
  ['tlInnerSkillTemplate', 'tiaolv_innerSkill'],
  ['tlInnerSkillPlaceholder', 'tiaolv_innerSkillPlaceholder'],
  ['tlWuxueLabel', 'tiaolv_wuxue'],
  ['tlWukuLabel', 'tiaolv_wuku'],
  ['tlWukuSelfLabel', 'tiaolv_wukuSelf'],
  ['tlWukuCommonLabel', 'tiaolv_wukuCommon'],
  ['tlSuitLabel', 'tiaolv_suit'],
  ['tlBowLabel', 'tiaolv_bow'],
  ['tlNoneLabel', 'tiaolv_none'],
  ['tlTuneAreaLabel', 'tiaolv_tuneArea'],
  ['tlCalcLabel', 'tiaolv_calc'],
  ['tlCalculatingLabel', 'tiaolv_calculating'],
  ['tlToastFailedText', 'tiaolv_toastFailed'],
  ['tlToastFailedWithTemplate', 'tiaolv_toastFailedWith'],
  ['tlColAttrLabel', 'tiaolv_colAttr'],
  ['tlColBaseLabel', 'tiaolv_colBase'],
  ['tlColPanelLabel', 'tiaolv_colPanel'],
  ['tlColFinalLabel', 'tiaolv_colFinal'],
]);

/* ---------- Arsenal appraisal page (graduation rate): copy-only shell; data goes through separate queries ---------- */
/* The gear planner (gear-planner port) folds into this page: reference
 * data is served through this shell's gen methods; computation goes
 * through the gearPlan / gearAutoCombine / gearParsePaste /
 * gearQuickCalc mutations. */
export class GradPageShell extends ShellBase {
  genGearSlots(){ return GP_SLOTS; }
  genGearGearSlots(){ return GP_GEAR_SLOTS; }
  genGearAffixes(){
    return this.memo('gearAffixes', () => GP_AFFIX.map((a: any) => {
      // English-name overlay: label is localized; short is display-only and
      // uses the official full name when localized; key / recipeNames are
      // canonical match terms and stay untouched.
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
  /* Graduation calculator tables (vocab.ts): slots keyed by stable id
   * with canonical-name labels; rates keyed by the GraduationInput
   * field names with localized labels and attainment caps. */
  genGradSlots(){ return GRAD_SLOTS; }
  genGradRates(){
    const fieldOf: Record<string, string> = { precision: 'ratePrecision', crit: 'rateCrit', affinity: 'rateAffinity' };
    return GRAD_RATES.map((r) => ({ key: r.key, cap: r.cap, label: translate('grad_' + fieldOf[r.key], this.locale) }));
  }
  /* Weapon-pool + OCR recognition rules for the client engines. */
  genGearVocabRules(){ return gearVocabRules(); }
  /* Library usage vs the caller's effective capacity (limits service is
   * the only source of the number; anonymous callers have no library). */
  async genGearUsageCount(){
    const user = this.ctx.user;
    if (!user) return 0;
    return countGearItemRows(this.db, user.userId);
  }
  async genGearUsageLimit(){
    const user = this.ctx.user;
    const limits = await getEffectiveLimits(this.db, { userId: user ? user.userId : 0 });
    return limits.gearItemCapacity;
  }
}

export const GEAR_DATA_RESOLVERS: Record<string, any> = {};
for (const f of ['gearSlots', 'gearGearSlots', 'gearAffixes', 'gearBuilds', 'gearSlotsBig', 'gearSlotsSmall',
  'gearBaseFields', 'gearXinfa', 'gearTalentRows', 'gearDingyinRows', 'gearDingyinLeft', 'gearDingyinRightMax', 'gearWuxueNames',
  'gearBows', 'gearPasteNames', 'gearNameToClass', 'gearSlotAliases', 'gearOcrAliases', 'gearLegacyKeys',
  'gearClassLabels', 'gearSchoolTags', 'gearDemoKit', 'gearDimRows', 'gearQuickBarNames', 'gearResDefault',
  'gearUsageCount', 'gearUsageLimit', 'gradSlots', 'gradRates', 'gearVocabRules']) {
  const genName = 'gen' + f[0].toUpperCase() + f.slice(1);
  GEAR_DATA_RESOLVERS[f] = (p: any) => p[genName]();
}

export const GRAD_TEXT_RESOLVERS = defineTextGens(GradPageShell, [
  ['gradEnteringText', 'grad_entering'],
  ['gradTitle', 'grad_title'],
  ['gradSubtitle', 'grad_subtitle'],
  ['gradMingjinNote', 'grad_mingjinNote'],
  ['gradBuildBigLabel', 'grad_buildBig'],
  ['gradBuildSmallLabel', 'grad_buildSmall'],
  ['gradRingLabel', 'grad_ringLabel'],
  ['gradScoreCountLabel', 'grad_scoreCount'],
  ['gradScoreValueLabel', 'grad_scoreValue'],
  ['gradScoreRateLabel', 'grad_scoreRate'],
  ['gradTier1', 'grad_tier1'],
  ['gradTier2', 'grad_tier2'],
  ['gradTier3', 'grad_tier3'],
  ['gradTier4', 'grad_tier4'],
  ['gradTier5', 'grad_tier5'],
  ['gradTier6', 'grad_tier6'],
  ['gradTapHint', 'grad_tapHint'],
  ['gradRefTitle', 'grad_refTitle'],
  ['gradMaxTableTitle', 'grad_maxTableTitle'],
  ['gradColAffixLabel', 'grad_colAffix'],
  ['gradColMaxLabel', 'grad_colMax'],
  ['gradColResonanceLabel', 'grad_colResonance'],
  ['gradSlotTableTitleTemplate', 'grad_slotTableTitle'],
  ['gradRateTitle', 'grad_rateTitle'],
  ['gradRateOkTemplate', 'grad_rateOk'],
  ['gradRateGapTemplate', 'grad_rateGap'],
  ['gradRateOverflowTemplate', 'grad_rateOverflow'],
  ['gradCompareTitle', 'grad_compareTitle'],
  ['gradSaveSchemeLabel', 'grad_saveScheme'],
  ['gradSchemeNameTemplate', 'grad_schemeName'],
  ['gradNoSchemesText', 'grad_noSchemes'],
  ['gradLoadLabel', 'grad_load'],
  ['gradDeleteSchemeLabel', 'grad_deleteScheme'],
  ['gradCloseLabel', 'common_close'],
  ['gradItemScoreTemplate', 'grad_itemScore'],
  ['gradRowMainLabel', 'grad_rowMain'],
  ['gradRowSubTemplate', 'grad_rowSub'],
  ['gradRowResonanceLabel', 'grad_rowResonance'],
  ['gradAffixPlaceholder', 'grad_affixPlaceholder'],
  ['gradAffixLoadingText', 'grad_affixLoading'],
  ['gradValuePlaceholderMaxTemplate', 'grad_valuePlaceholderMax'],
  ['gradValuePlaceholder', 'grad_valuePlaceholder'],
  ['gradResonanceLabel', 'grad_resonance'],
  ['gradOverMaxTemplate', 'grad_overMax'],
  ['gradToastSavedTemplate', 'grad_toastSaved'],
  ['gradToastLoadedTemplate', 'grad_toastLoaded'],
  ['gradToastOldSchemeText', 'grad_toastOldScheme'],
  ['gradConfirmLabel', 'common_confirm'],
  ['gradCancelLabel', 'common_cancel'],
]);

export const GEAR_TEXT_RESOLVERS = defineTextGens(GradPageShell, [
  ['gearBenchTitle', 'gear_benchTitle'],
  ['gearCalcLabel', 'gear_calcLabel'],
  ['gearBenchIntro', 'gear_benchIntro'],
  ['gearTargetLabel', 'gear_targetLabel'],
  ['gearBowLabel', 'gear_bowLabel'],
  ['gearBowNoneLabel', 'gear_bowNoneLabel'],
  ['gearExtrasTitle', 'gear_extrasTitle'],
  ['gearResLabel', 'gear_resLabel'],
  ['gearExtraAccLabel', 'gear_extraAccLabel'],
  ['gearExtraCritLabel', 'gear_extraCritLabel'],
  ['gearExtraIntLabel', 'gear_extraIntLabel'],
  ['gearBaseTitle', 'gear_baseTitle'],
  ['gearUnlockLabel', 'gear_unlockLabel'],
  ['gearLockLabel', 'gear_lockLabel'],
  ['gearModifiedTag', 'gear_modifiedTag'],
  ['gearBaseResetLabel', 'gear_baseResetLabel'],
  ['gearBaseResetTitle', 'gear_baseResetTitle'],
  ['gearBaseResetBody', 'gear_baseResetBody'],
  ['gearXinfaLabelTemplate', 'gear_xinfaLabelTemplate'],
  ['gearXinfaNoneLabel', 'gear_xinfaNoneLabel'],
  ['gearLibTitle', 'gear_libTitle'],
 ['gearMyLibTitle', 'gear_myLibTitle'],
 ['gearMyBuildsTitle', 'gear_myBuildsTitle'],
  ['gearLoginHint', 'gear_loginHint'],
  ['gearLibCountTemplate', 'gear_libCountTemplate'],
  ['gearUsageTemplate', 'gear_usageTemplate'],
  ['gearUsageNearLimitText', 'gear_usageNearLimitText'],
  ['gearFormSlotLabel', 'gear_formSlotLabel'],
  ['gearFormNameLabel', 'gear_formNameLabel'],
  ['gearFormNamePlaceholder', 'gear_formNamePlaceholder'],
  ['gearAffixPlaceholder', 'gear_affixPlaceholder'],
  ['gearValuePlaceholder', 'gear_valuePlaceholder'],
  ['gearRefTemplate', 'gear_refTemplate'],
  ['gearFillMaxLabel', 'gear_fillMaxLabel'],
  ['gearFillCyLabel', 'gear_fillCyLabel'],
  ['gearDelRowLabel', 'gear_delRowLabel'],
  ['gearAddRowLabel', 'gear_addRowLabel'],
  ['gearDyNameLabel', 'gear_dyNameLabel'],
  ['gearDyNamePlaceholder', 'gear_dyNamePlaceholder'],
  ['gearDyValLabel', 'gear_dyValLabel'],
  ['gearSchoolsLabel', 'gear_schoolsLabel'],
  ['gearAddGearLabel', 'gear_addGearLabel'],
  ['gearUpdateGearLabel', 'gear_updateGearLabel'],
  ['gearCancelEditLabel', 'gear_cancelEditLabel'],
  ['gearDemoLabel', 'gear_demoLabel'],
  ['gearClearLibLabel', 'gear_clearLibLabel'],
  ['gearClearConfirmTitle', 'gear_clearConfirmTitle'],
  ['gearClearConfirmBody', 'gear_clearConfirmBody'],
  ['gearEquipLabel', 'gear_equipLabel'],
  ['gearUnequipLabel', 'gear_unequipLabel'],
  ['gearEditLabel', 'gear_editLabel'],
  ['gearDeleteLabel', 'gear_deleteLabel'],
  ['gearSimLabel', 'gear_simLabel'],
  ['gearSimRealLabel', 'gear_simRealLabel'],
  ['gearSimCyLabel', 'gear_simCyLabel'],
  ['gearSimMaxLabel', 'gear_simMaxLabel'],
  ['gearVerdictHeirloom', 'gear_verdictHeirloom'],
  ['gearVerdictDud', 'gear_verdictDud'],
  ['gearScoreTemplate', 'gear_scoreTemplate'],
  ['gearQualityLabel', 'gear_qualityLabel'],
  ['gearExportLabel', 'gear_exportLabel'],
  ['gearExportFileName', 'gear_exportFileName'],
  ['gearImportNameTemplate', 'gear_importNameTemplate'],
  ['gearImportLabel', 'gear_importLabel'],
  ['gearImportFailedToast', 'gear_importFailedToast'],
  ['gearImportedToastTemplate', 'gear_importedToastTemplate'],
  ['gearManualTitle', 'gear_manualTitle'],
  ['gearPasteTitle', 'gear_pasteTitle'],
  ['gearPastePlaceholder', 'gear_pastePlaceholder'],
  ['gearPasteButtonLabel', 'gear_pasteButtonLabel'],
  ['gearPasteDemoLabel', 'gear_pasteDemoLabel'],
  ['gearPasteEmptyText', 'gear_pasteEmptyText'],
  ['gearPasteOkTemplate', 'gear_pasteOkTemplate'],
  ['gearPasteUnknownTemplate', 'gear_pasteUnknownTemplate'],
  ['gearPasteFailText', 'gear_pasteFailText'],
  ['gearPasteFullText', 'gear_pasteFullText'],
  ['gearOcrTitle', 'gear_ocrTitle'],
  ['gearOcrDropText', 'gear_ocrDropText'],
  ['gearOcrPreparingText', 'gear_ocrPreparingText'],
  ['gearOcrRunningText', 'gear_ocrRunningText'],
  ['gearOcrSecondText', 'gear_ocrSecondText'],
  ['gearOcrFailedText', 'gear_ocrFailedText'],
  ['gearOcrBadTypeText', 'gear_ocrBadTypeText'],
  ['gearOcrTooBigText', 'gear_ocrTooBigText'],
  ['gearOcrNoEngineText', 'gear_ocrNoEngineText'],
  ['gearOcrDoneTemplate', 'gear_ocrDoneTemplate'],
  ['gearOcrSlotLabel', 'gear_ocrSlotLabel'],
  ['gearOcrNameLabel', 'gear_ocrNameLabel'],
  ['gearOcrEquipLabel', 'gear_ocrEquipLabel'],
  ['gearOcrConfirmLabel', 'gear_ocrConfirmLabel'],
  ['gearOcrCancelLabel', 'gear_ocrCancelLabel'],
  ['gearOcrUnknownTitle', 'gear_ocrUnknownTitle'],
  ['gearOcrSavedTemplate', 'gear_ocrSavedTemplate'],
  ['gearOcrNeedLineToast', 'gear_ocrNeedLineToast'],
  ['gearOcrLowConfTag', 'gear_ocrLowConfTag'],
  ['gearOcrAddRowLabel', 'gear_ocrAddRowLabel'],
  ['gearOcrImportSlotTemplate', 'gear_ocrImportSlotTemplate'],
  ['gearOcrBatchTitle', 'gear_ocrBatchTitle'],
  ['gearOcrBatchDropText', 'gear_ocrBatchDropText'],
  ['gearOcrBatchQueuedText', 'gear_ocrBatchQueuedText'],
  ['gearOcrBatchRunningText', 'gear_ocrBatchRunningText'],
  ['gearOcrBatchReadyText', 'gear_ocrBatchReadyText'],
  ['gearOcrBatchFailedText', 'gear_ocrBatchFailedText'],
  ['gearOcrBatchImportedText', 'gear_ocrBatchImportedText'],
  ['gearOcrBatchRetryLabel', 'gear_ocrBatchRetryLabel'],
  ['gearOcrBatchRemoveLabel', 'gear_ocrBatchRemoveLabel'],
  ['gearOcrBatchAdjustLabel', 'gear_ocrBatchAdjustLabel'],
  ['gearOcrBatchApplyBoxLabel', 'gear_ocrBatchApplyBoxLabel'],
  ['gearOcrBatchDetectedText', 'gear_ocrBatchDetectedText'],
  ['gearOcrBatchFullImageText', 'gear_ocrBatchFullImageText'],
  ['gearOcrBatchDupTag', 'gear_ocrBatchDupTag'],
  ['gearOcrBatchDupLibText', 'gear_ocrBatchDupLibText'],
  ['gearOcrBatchDupRowText', 'gear_ocrBatchDupRowText'],
  ['gearOcrBatchIncludeLabel', 'gear_ocrBatchIncludeLabel'],
  ['gearOcrBatchNoLinesText', 'gear_ocrBatchNoLinesText'],
  ['gearOcrBatchImportTemplate', 'gear_ocrBatchImportTemplate'],
  ['gearOcrBatchResultTemplate', 'gear_ocrBatchResultTemplate'],
  ['gearLibEmptyText', 'gear_libEmptyText'],
  ['gearEquippedTag', 'gear_equippedTag'],
  ['gearLoadoutTitle', 'gear_loadoutTitle'],
  ['gearAutoLabel', 'gear_autoLabel'],
  ['gearAutoDoneToast', 'gear_autoDoneToast'],
  ['gearAutoFallbackToast', 'gear_autoFallbackToast'],
  ['gearUnequipAllLabel', 'gear_unequipAllLabel'],
  ['gearSlotEmptyText', 'gear_slotEmptyText'],
  ['gearPanelTitle', 'gear_panelTitle'],
  ['gearGradLabel', 'gear_gradLabel'],
  ['gearGradCountLabel', 'gear_gradCountLabel'],
  ['gearGradValueLabel', 'gear_gradValueLabel'],
  ['gearGradDyLabel', 'gear_gradDyLabel'],
  ['gearGradDyToggleLabel', 'gear_gradDyToggleLabel'],
  ['gearLoanLabel', 'gear_loanLabel'],
  ['gearSimActiveTag', 'gear_simActiveTag'],
  ['gearCopySummaryLabel', 'gear_copySummaryLabel'],
  ['gearCopiedToast', 'gear_copiedToast'],
  ['gearCopyFailedToast', 'gear_copyFailedToast'],
  ['gearYAccLabel', 'gear_yAccLabel'],
  ['gearYCritLabel', 'gear_yCritLabel'],
  ['gearYIntLabel', 'gear_yIntLabel'],
  ['gearFinalCritLabel', 'gear_finalCritLabel'],
  ['gearWhiteLabel', 'gear_whiteLabel'],
  ['gearDawaiLabel', 'gear_dawaiLabel'],
  ['gearXiaowaiLabel', 'gear_xiaowaiLabel'],
  ['gearDashuLabel', 'gear_dashuLabel'],
  ['gearXiaoshuLabel', 'gear_xiaoshuLabel'],
  ['gearHpLabel', 'gear_hpLabel'],
  ['gearDefLabel', 'gear_defLabel'],
  ['gearTalentLabel', 'gear_talentLabel'],
  ['gearDiffTitle', 'gear_diffTitle'],
  ['gearDiffLackTemplate', 'gear_diffLackTemplate'],
  ['gearDiffExactText', 'gear_diffExactText'],
  ['gearDiffOverTemplate', 'gear_diffOverTemplate'],
  ['gearDiffExtraTitle', 'gear_diffExtraTitle'],
  ['gearDiffLowTitle', 'gear_diffLowTitle'],
  ['gearDiffDoneText', 'gear_diffDoneText'],
  ['gearDiffEmptyText', 'gear_diffEmptyText'],
  ['gearDiffInvalidTemplate', 'gear_diffInvalidTemplate'],
  ['gearSuggestTitle', 'gear_suggestTitle'],
  ['gearSuggestSwapTemplate', 'gear_suggestSwapTemplate'],
  ['gearSuggestWashTemplate', 'gear_suggestWashTemplate'],
  ['gearSuggestNoneText', 'gear_suggestNoneText'],
  ['gearSuggestHeadTemplate', 'gear_suggestHeadTemplate'],
  ['gearDySummaryTitle', 'gear_dySummaryTitle'],
  ['gearDyCorrectText', 'gear_dyCorrectText'],
  ['gearDyWrongText', 'gear_dyWrongText'],
  ['gearSchemeTitle', 'gear_schemeTitle'],
  ['gearSchemeSaveLabel', 'gear_schemeSaveLabel'],
  ['gearSchemeNameTemplate', 'gear_schemeNameTemplate'],
  ['gearSchemeLoadLabel', 'gear_schemeLoadLabel'],
  ['gearSchemeDeleteLabel', 'gear_schemeDeleteLabel'],
  ['gearSchemeEmptyText', 'gear_schemeEmptyText'],
  ['gearSchemeComposeFirstText', 'gear_schemeComposeFirstText'],
  ['gearSchemeSavedToastTemplate', 'gear_schemeSavedToastTemplate'],
  ['gearSchemeLoadedToastTemplate', 'gear_schemeLoadedToastTemplate'],
  ['gearSchemeGroupCountTemplate', 'gear_schemeGroupCountTemplate'],
  ['gearShareLabel', 'gear_shareLabel'],
  ['gearRevokeShareLabel', 'gear_revokeShareLabel'],
  ['gearCopyLinkLabel', 'gear_copyLinkLabel'],
  ['gearShareRevokedToast', 'gear_shareRevokedToast'],
  ['gearQuickTitle', 'gear_quickTitle'],
  ['gearQuickResLabel', 'gear_quickResLabel'],
  ['gearQuickSyncLabel', 'gear_quickSyncLabel'],
  ['gearQuickSyncedToast', 'gear_quickSyncedToast'],
  ['gearQuickOkText', 'gear_quickOkText'],
  ['gearQuickOverTemplate', 'gear_quickOverTemplate'],
  ['gearQuickGapTemplate', 'gear_quickGapTemplate'],
  ['gearRecipesTitle', 'gear_recipesTitle'],
  ['gearRecipeSearchPlaceholder', 'gear_recipeSearchPlaceholder'],
  ['gearRecipeAllLabel', 'gear_recipeAllLabel'],
  ['gearRecipeColCat', 'gear_recipeColCat'],
  ['gearRecipeColSchool', 'gear_recipeColSchool'],
  ['gearRecipeColSet', 'gear_recipeColSet'],
  ['gearRecipeColRecipe', 'gear_recipeColRecipe'],
  ['gearRecipeColBow', 'gear_recipeColBow'],
  ['gearRecipeSetTargetLabel', 'gear_recipeSetTargetLabel'],
  ['gearRecipeEmptyText', 'gear_recipeEmptyText'],
  ['gearRecipeTargetToastTemplate', 'gear_recipeTargetToastTemplate'],
  ['gearSectRecipesTitle', 'gear_sectRecipesTitle'],
  ['gearAffixTableTitle', 'gear_affixTableTitle'],
  ['gearColCyLabel', 'gear_colCyLabel'],
  ['gearColCyPctLabel', 'gear_colCyPctLabel'],
  ['gearColRecipeNamesLabel', 'gear_colRecipeNamesLabel'],
  ['gearSurvivalNote', 'gear_survivalNote'],
  ['gearSlotTableTitle', 'gear_slotTableTitle'],
  ['gearSlotsBigTitle', 'gear_slotsBigTitle'],
  ['gearSlotsSmallTitle', 'gear_slotsSmallTitle'],
  ['gearFormulaTitle', 'gear_formulaTitle'],
  ['gearFormulaRatesTitle', 'gear_formulaRatesTitle'],
  ['gearFormulaDimsTitle', 'gear_formulaDimsTitle'],
  ['gearFormulaOrderTitle', 'gear_formulaOrderTitle'],
  ['gearFormulaAccTemplate', 'gear_formulaAccTemplate'],
  ['gearFormulaCritTemplate', 'gear_formulaCritTemplate'],
  ['gearFormulaIntTemplate', 'gear_formulaIntTemplate'],
  ['gearFormulaBarsTemplate', 'gear_formulaBarsTemplate'],
  ['gearFormulaBowTemplate', 'gear_formulaBowTemplate'],
  ['gearFormulaOrderText', 'gear_formulaOrderText'],
  ['gearColDimLabel', 'gear_colDimLabel'],
  ['gearColConvLabel', 'gear_colConvLabel'],
  ['gearColFullBarTemplate', 'gear_colFullBarTemplate'],
  ['gearCalcFailedText', 'gear_calcFailedText'],
  ['gearDemoLoadedToast', 'gear_demoLoadedToast'],
  ['gearSavedToastTemplate', 'gear_savedToastTemplate'],
  ['gearDeletedToast', 'gear_deletedToast'],
  ['gearClearedToast', 'gear_clearedToast'],
]);

/* ---------- Settings-page shell (language preference) ----------
 * Copy fields are generated by gen methods from the settings section per
 * locale; localePref is the account-stored preference (null = automatic),
 * effectiveLocale is the locale actually in force for this request. */


/* ---------- Public build share page (/b/:code) ----------
 * Anonymous read surface: the shell wraps resolveSharedBuild's public
 * view (display fields only). Unknown / revoked / orphaned codes get
 * the same shell with exists=false and empty data — the client renders
 * the not-found state from this shell's own copy fields. */
export class SharedBuildPageShell extends ShellBase {
  genExists(){ return !!this.data.shared; }
  genName(){ return this.data.shared ? this.data.shared.build.name : null; }
  genTargetIdx(){ return this.data.shared ? this.data.shared.build.targetIdx : 0; }
  genXinfa(){ return this.data.shared ? this.data.shared.build.xinfa : []; }
  genBowKind(){ return this.data.shared ? this.data.shared.build.bowKind : ''; }
  genItems(){ return this.data.shared ? this.data.shared.items : []; }
  genSnap(key: string){
    const snap = this.data.shared ? this.data.shared.build.snapshot : null;
    return snap ? (snap[key] || 0) : 0;
  }
}

export const SHARED_BUILD_TEXT_RESOLVERS = defineTextGens(SharedBuildPageShell, [
  ['buildShareKicker', 'buildshare_kicker'],
  ['buildShareLoginLabel', 'buildshare_loginLabel'],
  ['buildShareNotFoundTitle', 'buildshare_notFoundTitle'],
  ['buildShareNotFoundBody', 'buildshare_notFoundBody'],
  ['buildShareXinfaLabel', 'buildshare_xinfaLabel'],
]);

export const gearResolvers = {
  Query: {
    gradPage: (_: any, __: any, ctx: Context) => new GradPageShell(ctx, {}),

    // Public build share page: anonymous; the code is the capability.
    sharedBuild: async (_: any, { code }: any, ctx: Context) => {
      const shared = await resolveSharedBuild(ctx.env.DB, String(code || '')).catch(() => null);
      return new SharedBuildPageShell(ctx, { shared });
    },

    // Gear library: only the caller's own (anonymous callers have no library -> empty)
    myGearItems: async (_: any, __: any, ctx: Context) => {
      if (!ctx.user) return [];
      return listGearItems(ctx.env.DB, ctx.user.userId);
    },
    myGearBuilds: async (_: any, __: any, ctx: Context) => {
      if (!ctx.user) return [];
      return listGearBuilds(ctx.env.DB, ctx.user.userId);
    },

    tiaolvPage: (_: any, __: any, ctx: Context) => new TiaolvPageShell(ctx, {}),
  },
  Mutation: {
    gearPlan: async (_: any, { input }: any, ctx: Context) => {
      if (!rateLimit('mut:gearplan:' + getClientIp(ctx.request), 20)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      const lib = (input.lib || []).map((g: any) => gpSanitizeGearData({
        id: g.id, slot: g.slot, name: g.name || '', lines: g.lines || [],
        dingyin: g.dingyin || null, schools: g.schools || [],
      }).gear);
      const loadout: Record<string, any> = {};
      (input.loadout || []).forEach((e: any) => { loadout[e.slot] = Number(e.gearId); });
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
      // Heirloom push evaluation (server-side, async via waitUntil; silent when logged out or on failure; never affects the calculation)
      if (ctx.user && ctx.user.userId && ctx.env && ctx.env.DB) {
        const run = evaluateHeirloomPushes(ctx.env.DB, {
          discordId: String(ctx.user.discordId),
          userName: String(ctx.user.name || ''),
          userGuilds: Array.isArray(ctx.user.guilds) ? ctx.user.guilds.map(String) : [],
          lib, loadout, targetIdx: state.targetIdx,
          evals: r.gearEvals, gradTotal: r.grad.total,
        }).catch(() => { /* a push-evaluation failure must never affect the gear calculation */ });
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

    gearAutoCombine: async (_: any, { targetIdx, lib }: any, ctx: Context) => {
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

    gearParsePaste: async (_: any, { text }: any, ctx: Context) => {
      if (!rateLimit('mut:gearpaste:' + getClientIp(ctx.request), 20)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      const r = gpParsePaste(String(text || '').slice(0, 200000));
      return {
        mode: r.mode, unknown: r.unknown, gears: r.gears,
        fullExportJson: r.fullExport ? JSON.stringify(r.fullExport) : null,
      };
    },

    gearQuickCalc: async (_: any, { input }: any, ctx: Context) => {
      if (!rateLimit('mut:gearquick:' + getClientIp(ctx.request), 30)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      return gpQuickCalc(input.whiteAcc, input.whiteCrit, input.whiteInt, input.res);
    },

    // ---- Gear-library writes (session re-verified + scoped by discord_id; other users' rows count as nonexistent) ----
    addGearItem: async (_: any, { input }: any, ctx: Context) => {
      if (!ctx.user) return { ok: false, item: null, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      if (!rateLimit('mut:gearitem:' + getClientIp(ctx.request), 60)) {
        return { ok: false, item: null, error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited' };
      }
      const limits = await getEffectiveLimits(ctx.env.DB, { userId: ctx.user.userId });
      const stored = await countGearItemRows(ctx.env.DB, ctx.user.userId);
      if (stored >= limits.gearItemCapacity) {
        return { ok: false, item: null, error: errTextP(ctx, 'gearCapacityReached', { limit: limits.gearItemCapacity }), errorCode: 'gearCapacityReached' };
      }
      const gear = gpSanitizeGearData({
        slot: input.slot, name: input.name || '', lines: input.lines || [],
        dingyin: input.dingyin || null, schools: input.schools || [],
      }).gear;
      const saved = await insertGearItem(ctx.env.DB, ctx.user.userId, gear);
      return { ok: true, item: saved, error: null, errorCode: null };
    },

    updateGearItem: async (_: any, { id: idArg, input }: any, ctx: Context) => {
      if (!ctx.user) return { ok: false, item: null, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      if (!rateLimit('mut:gearitem:' + getClientIp(ctx.request), 60)) {
        return { ok: false, item: null, error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited' };
      }
      const db = ctx.env.DB, did = ctx.user.userId;
      const id = Number(idArg);
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

    deleteGearItem: async (_: any, { id }: any, ctx: Context) => {
      if (!ctx.user) return { ok: false, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      const done = await deleteGearItemRow(ctx.env.DB, ctx.user.userId, Number(id));
      if (!done) return { ok: false, error: errText(ctx, 'gearNotFound'), errorCode: 'gearNotFound' };
      return { ok: true, error: null, errorCode: null };
    },

    importGearItems: async (_: any, { items, loadout, source, imageCount }: any, ctx: Context) => {
      if (!ctx.user) return { ok: false, items: [], autoSelect: [], error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      if (!rateLimit('mut:gearimport:' + getClientIp(ctx.request), 20)) {
        return { ok: false, items: [], autoSelect: [], error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited' };
      }
      const db = ctx.env.DB, did = ctx.user.userId;
      const list = items || [];
      const limits = await getEffectiveLimits(db, { userId: did });
      const isOcr = source === 'ocr';
      const now = Date.now();
      if (isOcr) {
        // Batch-OCR metering (limits service values; the daily count is
        // server-side in usage_counters). A missing/garbled imageCount
        // falls back to the item count — the batch recognized at least
        // the items it carries.
        const imgs = typeof imageCount === 'number' && imageCount > 0 ? Math.floor(imageCount) : list.length;
        if (imgs > limits.ocrBatchImages) {
          return { ok: false, items: [], autoSelect: [], error: errTextP(ctx, 'gearOcrBatchTooLarge', { limit: limits.ocrBatchImages, n: imgs }), errorCode: 'gearOcrBatchTooLarge' };
        }
        const usedToday = await getOcrBatchesUsedToday(db, did, now);
        if (usedToday >= limits.ocrBatchesPerDay) {
          return { ok: false, items: [], autoSelect: [], error: errTextP(ctx, 'gearOcrDailyLimit', { limit: limits.ocrBatchesPerDay }), errorCode: 'gearOcrDailyLimit' };
        }
      }
      // Capacity: the whole batch lands or none of it does — the old
      // silent slice(0, 200) truncation is gone.
      const stored = await countGearItemRows(db, did);
      if (stored + list.length > limits.gearItemCapacity) {
        return { ok: false, items: [], autoSelect: [], error: errTextP(ctx, 'gearImportOverflow', { n: list.length, total: stored + list.length, limit: limits.gearItemCapacity }), errorCode: 'gearImportOverflow' };
      }
      const saved = [];
      for (const input of list) {
        const gear = gpSanitizeGearData({
          slot: input.slot, name: input.name || '', lines: input.lines || [],
          dingyin: input.dingyin || null, schools: input.schools || [],
        }).gear;
        saved.push(await insertGearItem(db, did, gear));
      }
      // Auto-select (per the original importParsedGears): weapons fill main hand then off hand; everything else takes an empty slot
      const lo: Record<string, any> = {};
      (loadout || []).forEach((e: any) => { lo[e.slot] = e.gearId; });
      const autoSelect = [];
      for (const it of saved) {
        if (it.slot === '武器') {
          if (!lo['主武器']) { lo['主武器'] = it.id; autoSelect.push({ slot: '主武器', gearId: it.id }); }
          else if (!lo['副武器']) { lo['副武器'] = it.id; autoSelect.push({ slot: '副武器', gearId: it.id }); }
        } else if (!lo[it.slot]) { lo[it.slot] = it.id; autoSelect.push({ slot: it.slot, gearId: it.id }); }
      }
      if (isOcr) await recordOcrBatch(db, did, now);
      return { ok: true, items: saved, autoSelect, error: null, errorCode: null };
    },

    saveGearBuild: async (_: any, { input }: any, ctx: Context) => {
      if (!ctx.user) return { ok: false, build: null, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      if (!rateLimit('mut:gearbuild:' + getClientIp(ctx.request), 30)) {
        return { ok: false, build: null, error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited' };
      }
      const db = ctx.env.DB, did = ctx.user.userId;
      const items = await listGearItems(db, did);
      const owned = new Set(items.map((g: any) => g.id));
      const lo: Record<string, any> = {};
      (input.loadout || []).forEach((e: any) => { if (owned.has(Number(e.gearId))) lo[e.slot] = Number(e.gearId); });
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

    deleteGearBuild: async (_: any, { id }: any, ctx: Context) => {
      if (!ctx.user) return { ok: false, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      const done = await deleteGearBuildRow(ctx.env.DB, ctx.user.userId, Number(id));
      if (!done) return { ok: false, error: errText(ctx, 'gearNotFound'), errorCode: 'gearNotFound' };
      // A deleted build leaves no live alias behind (resolve would 404
      // anyway; dropping the row now frees the build_id unique slot).
      await revokeBuildShare(ctx.env.DB, ctx.user.userId, Number(id)).catch(() => false);
      return { ok: true, error: null, errorCode: null };
    },

    // ---- Build share links (owner-only; another user's build is "not found") ----
    shareGearBuild: async (_: any, { id }: any, ctx: Context) => {
      if (!ctx.user) return { ok: false, shareUrl: null, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      if (!rateLimit('mut:gearshare:' + getClientIp(ctx.request), 30)) {
        return { ok: false, shareUrl: null, error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited' };
      }
      const link = await shareGearBuildSvc(ctx.env.DB, ctx.user.userId, Number(id));
      if (!link) return { ok: false, shareUrl: null, error: errText(ctx, 'gearNotFound'), errorCode: 'gearNotFound' };
      return { ok: true, shareUrl: buildShareUrl(link.code), error: null, errorCode: null };
    },

    revokeGearBuildShare: async (_: any, { id }: any, ctx: Context) => {
      if (!ctx.user) return { ok: false, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      if (!rateLimit('mut:gearshare:' + getClientIp(ctx.request), 30)) {
        return { ok: false, error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited' };
      }
      const done = await revokeBuildShare(ctx.env.DB, ctx.user.userId, Number(id));
      if (!done) return { ok: false, error: errText(ctx, 'gearNotFound'), errorCode: 'gearNotFound' };
      return { ok: true, error: null, errorCode: null };
    },

    calcTiaolv: async (_: any, { input }: any, ctx: Context) => {
      // Rate limit: compute-heavy — 30 per minute per IP
      if (!rateLimit('mut:tiaolv:' + getClientIp(ctx.request), 30)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      // Faithful port of the 片雲 DIY 0.10.2 Excel formulas (src/tiaolv.js)
      // Terms: base white values (column B) / panel white values (column C) / final panel (column D)
      const tunes: Record<string, any> = {};
      for (const t of (input.tunes || [])) {
        if (!t || t.cell == null) continue;
        const n = Number(t.value);
        tunes[String(t.cell)] = Number.isFinite(n) ? n : 0;
      }
      const rows = tlCalculateExcel({
        innerSkills: input.innerSkills || [],
        wuxue: input.wuxue || undefined,
        // Closed vocabularies arrive as stable ids from current
        // clients (canonical names from legacy ones); translate at
        // the boundary so the engine only ever sees canonical names.
        wuku: input.wuku ? tlWukuName(input.wuku) : undefined,
        attrRequire: typeof input.attrRequire === 'number' ? input.attrRequire : undefined,
        suit: tlSuitName(input.suit || ''),
        bowSkill: input.bowSkill ? tlBowName(input.bowSkill) : '',
        tunes,
      });
      return { rows };
    },

    calcGraduation: async (_: any, { input }: any, ctx: Context) => {
      if (!rateLimit('mut:grad:' + getClientIp(ctx.request), 30)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      // Yardstick: 50% line-count match + 30% value attainment + 20% three-rate attainment (per gear-planner)
      const db = ctx.env.DB;
      const maxRows = await listAffixMaxValues(db);
      const maxMap: Record<string, any> = {};
      for (const r of maxRows) maxMap[r.affix_key] = r.max_value;

      // slug -> Chinese name
      let schoolName = input.sectSlug;
      const schoolRow = await getSchoolNameBySlug(db, input.sectSlug).catch(() => null);
      if (schoolRow) schoolName = schoolRow.name;

      // Target recipe's affix classes (from school_bis)
      const bisRow = await getSchoolBisJsonBySchool(db, schoolName).catch(() => null);
      let targetCats: Record<string, any> = {};
      if (bisRow && bisRow.bis_json) {
        try {
          const bis = JSON.parse(bisRow.bis_json);
          // Chinese name -> key map
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
          // bis format: [["部位", "大外（初始）、大外、劲、势"], ...]
          if (Array.isArray(bis)) {
            bis.forEach(([slot, affixStr]: any) => {
              if (!affixStr) return;
              // Split on 、 and strip parenthetical notes
              affixStr.split('、').forEach((a: any) => {
                const clean = a.replace(/（[^）]*）/g, '').trim();
                const key = nameToKey[clean];
                if (key) targetCats[key] = (targetCats[key] || 0) + 1;
              });
            });
          }
        } catch(e) {}
      }

      // Tally the user's affixes
      const userCats: Record<string, any> = {};
      let valueSum = 0, valueCount = 0;
      const items = [];
      for (const item of (input.items || [])) {
        let itemValueSum = 0, itemValueCount = 0;
        for (const affix of (item.affixes || [])) {
          if (!affix.key || !affix.value) continue;
          // Line counts (grouped by key)
          userCats[affix.key] = (userCats[affix.key] || 0) + 1;
          // Value attainment: value / resonance value (95% of max)
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
        // Per-item score = that item's value attainment
        const itemScore = itemValueCount ? Math.round((itemValueSum / itemValueCount) * 100) : 0;
        items.push({ slot: item.slot, score: itemScore });
      }

      // A: line-count match (50%) — how many of the user's affix classes appear in the target
      let matchSum = 0, catCount = 0;
      for (const [key, count] of Object.entries(userCats)) {
        // If the target has this class: min(actual, target)/target; if not: 0
        // Simplification: an empty target (no recipe configured) scores 1 (no penalty)
        const target = targetCats[key];
        if (Object.keys(targetCats).length === 0) {
          matchSum += 1; // no target: no penalty
        } else if (target) {
          matchSum += Math.min(count / target, 1);
        } else {
          matchSum += 0; // class not in the target: 0
        }
        catCount++;
      }
      const A = catCount ? matchSum / catCount : 0;

      // B: value attainment (30%)
      const B = valueCount ? valueSum / valueCount : 0;

      // C: three-rate attainment (20%)
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
    // Explicit field resolvers for plain-data result types: every field
    // delegates to the same-named property of the computed result object
    // (previously these relied on GraphQL default field resolution).
    GearAffixRow: { key: (p: any) => p.key, label: (p: any) => p.label, short: (p: any) => p.short, max: (p: any) => p.max, cy: (p: any) => p.cy, unit: (p: any) => p.unit, sys: (p: any) => p.sys, size: (p: any) => p.size, cyPct: (p: any) => p.cyPct, recipeNames: (p: any) => p.recipeNames },
    GearAutoResult: { loadout: (p: any) => p.loadout, fallbackUsed: (p: any) => p.fallbackUsed },
    GearBaseField: { key: (p: any) => p.key, label: (p: any) => p.label, preset: (p: any) => p.preset },
    GearBaseValue: { key: (p: any) => p.key, val: (p: any) => p.val },
    GearBowRow: { kind: (p: any) => p.kind, label: (p: any) => p.label, acc: (p: any) => p.acc, crit: (p: any) => p.crit, int: (p: any) => p.int },
    GearBuild: { idx: (p: any) => p.idx, cat: (p: any) => p.cat, school: (p: any) => p.school, set: (p: any) => p.set, bow: (p: any) => p.bow, bowKind: (p: any) => p.bowKind, bowLabel: (p: any) => p.bowLabel, note: (p: any) => p.note, recipe: (p: any) => p.recipe, sectName: (p: any) => p.sectName, totalBars: (p: any) => p.totalBars, targets: (p: any) => p.targets },
    GearBuildPayload: { ok: (p: any) => p.ok, build: (p: any) => p.build, error: (p: any) => p.error, errorCode: (p: any) => p.errorCode },
    GearDemoItem: { slot: (p: any) => p.slot, name: (p: any) => p.name, keys: (p: any) => p.keys, dingyinName: (p: any) => p.dingyinName, dingyinVal: (p: any) => p.dingyinVal },
    GearDimRow: { name: (p: any) => p.name, conv: (p: any) => p.conv, full: (p: any) => p.full },
    GearDingyin: { name: (p: any) => p.name, val: (p: any) => p.val },
    GearDingyinRow: { school: (p: any) => p.school, name: (p: any) => p.name, wuxue: (p: any) => p.wuxue, verified: (p: any) => p.verified, category: (p: any) => p.category },
    GearDingyinScoreRow: { slot: (p: any) => p.slot, name: (p: any) => p.name, val: (p: any) => p.val, max: (p: any) => p.max, correct: (p: any) => p.correct, score: (p: any) => p.score, has: (p: any) => p.has },
    GearEval: { id: (p: any) => p.id, score: (p: any) => p.score, quality: (p: any) => p.quality, hits: (p: any) => p.hits, verdict: (p: any) => p.verdict },
    GearExtraClass: { cls: (p: any) => p.cls, label: (p: any) => p.label, count: (p: any) => p.count },
    GearGradRow: { cls: (p: any) => p.cls, label: (p: any) => p.label, n: (p: any) => p.n, cur: (p: any) => p.cur, flex: (p: any) => p.flex },
    GearImportResult: { ok: (p: any) => p.ok, items: (p: any) => p.items, autoSelect: (p: any) => p.autoSelect, error: (p: any) => p.error, errorCode: (p: any) => p.errorCode },
    GearInvalidLine: { gearId: (p: any) => p.gearId, key: (p: any) => p.key, val: (p: any) => p.val },
    GearItem: { id: (p: any) => p.id, slot: (p: any) => p.slot, name: (p: any) => p.name, lines: (p: any) => p.lines, dingyin: (p: any) => p.dingyin, schools: (p: any) => p.schools, warnings: (p: any) => p.warnings },
    GearItemPayload: { ok: (p: any) => p.ok, item: (p: any) => p.item, error: (p: any) => p.error, errorCode: (p: any) => p.errorCode },
    GearKV: { key: (p: any) => p.key, val: (p: any) => p.val },
    GearLine: { key: (p: any) => p.key, val: (p: any) => p.val },
    GearLoadoutEntry: { slot: (p: any) => p.slot, gearId: (p: any) => p.gearId },
    GearLowLine: { gearId: (p: any) => p.gearId, key: (p: any) => p.key, val: (p: any) => p.val, score: (p: any) => p.score },
    GearNameCls: { name: (p: any) => p.name, cls: (p: any) => p.cls },
    GearNameKey: { name: (p: any) => p.name, key: (p: any) => p.key },
    GearNameMax: { name: (p: any) => p.name, max: (p: any) => p.max },
    GearOkPayload: { ok: (p: any) => p.ok, error: (p: any) => p.error, errorCode: (p: any) => p.errorCode },
    GearOtherShu: { key: (p: any) => p.key, label: (p: any) => p.label, val: (p: any) => p.val, count: (p: any) => p.count },
    GearParseResult: { mode: (p: any) => p.mode, unknown: (p: any) => p.unknown, gears: (p: any) => p.gears, fullExportJson: (p: any) => p.fullExportJson },
    GearParsedItem: { slot: (p: any) => p.slot, name: (p: any) => p.name, lines: (p: any) => p.lines, dingyin: (p: any) => p.dingyin },
    GearPlanResult: { panel: (p: any) => p.panel, grad: (p: any) => p.grad, realPanel: (p: any) => p.realPanel, realGrad: (p: any) => p.realGrad, loanGrad: (p: any) => p.loanGrad, suggestions: (p: any) => p.suggestions, extraClasses: (p: any) => p.extraClasses, gearEvals: (p: any) => p.gearEvals, baseNotes: (p: any) => p.baseNotes, xinfaPicked: (p: any) => p.xinfaPicked, xinfaDuplicates: (p: any) => p.xinfaDuplicates },
    GearQuickResult: { res: (p: any) => p.res, acc: (p: any) => p.acc, crit: (p: any) => p.crit, int: (p: any) => p.int },
    GearRateStatus: { yellow: (p: any) => p.yellow, capped: (p: any) => p.capped, over: (p: any) => p.over, lack: (p: any) => p.lack, needWhite: (p: any) => p.needWhite, bars: (p: any) => p.bars },
    GearSlotRow: { slot: (p: any) => p.slot, lines: (p: any) => p.lines },
    GearSuggestion: { kind: (p: any) => p.kind, slot: (p: any) => p.slot, gearId: (p: any) => p.gearId, name: (p: any) => p.name, lineIdx: (p: any) => p.lineIdx, fromCls: (p: any) => p.fromCls, toCls: (p: any) => p.toCls, toKey: (p: any) => p.toKey, gain: (p: any) => p.gain, score: (p: any) => p.score },
    GearSuggestions: { cur: (p: any) => p.cur, final: (p: any) => p.final, list: (p: any) => p.list },
    GearTalentRow: { name: (p: any) => p.name, text: (p: any) => p.text, xiao: (p: any) => p.xiao, da: (p: any) => p.da, acc: (p: any) => p.acc, crit: (p: any) => p.crit, int: (p: any) => p.int },
    GearTarget: { cls: (p: any) => p.cls, label: (p: any) => p.label, n: (p: any) => p.n, flex: (p: any) => p.flex },
    GearXinfaRow: { name: (p: any) => p.name, xiao: (p: any) => p.xiao, da: (p: any) => p.da, acc: (p: any) => p.acc, crit: (p: any) => p.crit, int: (p: any) => p.int, dcrit: (p: any) => p.dcrit, dint: (p: any) => p.dint, dmg: (p: any) => p.dmg, pierce: (p: any) => p.pierce, critDmg: (p: any) => p.critDmg, intDmg: (p: any) => p.intDmg, shuSys: (p: any) => p.shuSys, shuXiao: (p: any) => p.shuXiao, shuDa: (p: any) => p.shuDa, sysPierceSys: (p: any) => p.sysPierceSys, sysPierceVal: (p: any) => p.sysPierceVal, shuBonusSys: (p: any) => p.shuBonusSys, shuBonusVal: (p: any) => p.shuBonusVal },
    GraduationItemResult: { slot: (p: any) => p.slot, score: (p: any) => p.score },
    GraduationResult: { total: (p: any) => p.total, countScore: (p: any) => p.countScore, valueScore: (p: any) => p.valueScore, rateScore: (p: any) => p.rateScore, items: (p: any) => p.items },
    SectWeight: { sectSlug: (p: any) => p.sectSlug, critWeight: (p: any) => p.critWeight, critDamageWeight: (p: any) => p.critDamageWeight },
    TiaolvMaxValues: { mainAttr: (p: any) => p.mainAttr, outerAtk: (p: any) => p.outerAtk, accuracy: (p: any) => p.accuracy, crit: (p: any) => p.crit, critDamage: (p: any) => p.critDamage, sectAttr: (p: any) => p.sectAttr },
    TiaolvVocabOption: { id: (p: any) => p.id, label: (p: any) => p.label, isDefault: (p: any) => p.isDefault },
    TiaolvTuneRow: { row: (p: any) => p.row, label: (p: any) => p.label },
    TiaolvSectWuxue: { sectSlug: (p: any) => p.sectSlug, wuxue: (p: any) => p.wuxue },
    GradSlot: { id: (p: any) => p.id, label: (p: any) => p.label, icon: (p: any) => p.icon },
    GradRate: { key: (p: any) => p.key, label: (p: any) => p.label, cap: (p: any) => p.cap },
    GearVocabRules: { weaponSlot: (p: any) => p.weaponSlot, weaponPositions: (p: any) => p.weaponPositions, ocrStripPrefixes: (p: any) => p.ocrStripPrefixes, ocrDingyinMarker: (p: any) => p.ocrDingyinMarker, ocrDingyinFallbacks: (p: any) => p.ocrDingyinFallbacks },
    GearOcrFallback: { needle: (p: any) => p.needle, name: (p: any) => p.name },
    TiaolvResult: { rows: (p: any) => p.rows },
    TiaolvRow: { key: (p: any) => p.key, label: (p: any) => p.label, base: (p: any) => p.base, panel: (p: any) => p.panel, final: (p: any) => p.final },
  TiaolvPage: {
    sects: (p: any) => p.genSects(),
    innerSkills: (p: any) => p.genInnerSkills(),
    suits: (p: any) => p.genSuits(),
    maxValues: (p: any) => p.genMaxValues(),
    sectWeights: (p: any) => p.genSectWeights(),
    tlSuitOptions: (p: any) => p.genTlSuitOptions(),
    tlBowOptions: (p: any) => p.genTlBowOptions(),
    tlWukuOptions: (p: any) => p.genTlWukuOptions(),
    tlTuneRows: (p: any) => p.genTlTuneRows(),
    tlSectWuxue: (p: any) => p.genTlSectWuxue(),
    ...TIAOLV_TEXT_RESOLVERS,
  },
  GradPage: { ...GRAD_TEXT_RESOLVERS, ...GEAR_TEXT_RESOLVERS, ...GEAR_DATA_RESOLVERS },
  GearPanel: {
    sums: (p: any) => Object.entries(p.sums || {}).map(([key, val]: any) => ({ key, val })),
    classCounts: (p: any) => Object.entries(p.classCounts || {}).map(([key, val]: any) => ({ key, val })),
    dingyinTotals: (p: any) => Object.entries(p.dingyinTotals || {}).map(([key, val]: any) => ({ key, val })),
    whiteAcc: (p: any) => p.whiteAcc,
    whiteCrit: (p: any) => p.whiteCrit,
    whiteInt: (p: any) => p.whiteInt,
    yAcc: (p: any) => p.yAcc,
    yCrit: (p: any) => p.yCrit,
    yInt: (p: any) => p.yInt,
    finalCrit: (p: any) => p.finalCrit,
    dawai: (p: any) => p.dawai,
    xiaowai: (p: any) => p.xiaowai,
    dashu: (p: any) => p.dashu,
    xiaoshu: (p: any) => p.xiaoshu,
    hp: (p: any) => p.hp,
    def: (p: any) => p.def,
    ti: (p: any) => p.ti,
    jin: (p: any) => p.jin,
    yu: (p: any) => p.yu,
    min: (p: any) => p.min,
    shi: (p: any) => p.shi,
    talentCrit: (p: any) => p.talentCrit,
    talentXiaowai: (p: any) => p.talentXiaowai,
    talentInt: (p: any) => p.talentInt,
    talentDawai: (p: any) => p.talentDawai,
    talentIntStat: (p: any) => p.talentIntStat,
    talentDawaiStat: (p: any) => p.talentDawaiStat,
    equippedIds: (p: any) => p.equippedIds,
    otherShu: (p: any) => p.otherShu,
    invalidLines: (p: any) => p.invalidLines,
  },
  GearGrad: { a: (p: any) => p.A, b: (p: any) => p.B, d: (p: any) => p.D, total: (p: any) => p.total, got: (p: any) => p.got, totalBars: (p: any) => p.totalBars, rows: (p: any) => p.rows, lowLines: (p: any) => p.lowLines, dingyinRows: (p: any) => p.dingyinRows },
  GearSavedBuild: {
    // Display overlay: school / buildLabel are localized per request locale
    // (the stored buildLabel stays canonical Chinese; under a non-overlay
    // locale the reassembled result is byte-identical to the stored value).
    school: (p: any, _a: any, ctx: Context) => enBuildSchool(ctx.locale, (GP_BUILDS[p.targetIdx] || GP_BUILDS[0]).school),
    buildLabel: (p: any, _a: any, ctx: Context) => {
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
    // Public share state, composed server-side for the owner's own
    // build lists: the active alias URL, or null when not shared.
    // (Only myGearBuilds/saveGearBuild produce GearSavedBuild values,
    // both owner-scoped, so ctx.user is the owner here.)
    shareUrl: async (p: any, _a: any, ctx: Context) => {
      const did = ctx.user ? ctx.user.userId : null;
      if (!did || !p.id) return null;
      const link = await getBuildShareLink(ctx.env.DB, did, p.id).catch(() => null);
      return link ? buildShareUrl(link.code) : null;
    },
    id: (p: any) => p.id, name: (p: any) => p.name, targetIdx: (p: any) => p.targetIdx, xinfa: (p: any) => p.xinfa, gradDingyinOn: (p: any) => p.gradDingyinOn
  },
  GearBuildSharePayload: { ok: (p: any) => p.ok, shareUrl: (p: any) => p.shareUrl, error: (p: any) => p.error, errorCode: (p: any) => p.errorCode },
  SharedBuildItem: { slot: (p: any) => p.slot, name: (p: any) => p.name, lines: (p: any) => p.lines, dingyin: (p: any) => p.dingyin, warnings: (p: any) => p.warnings },
  SharedBuildPage: {
    exists: (p: any) => p.genExists(),
    name: (p: any) => p.genName(),
    // Same locale overlay as GearSavedBuild: stored labels stay
    // canonical Chinese; school/buildLabel localize per request.
    school: (p: any, _a: any, ctx: Context) => {
      if (!p.genExists()) return null;
      return enBuildSchool(ctx.locale, (GP_BUILDS[p.genTargetIdx()] || GP_BUILDS[0]).school);
    },
    buildLabel: (p: any, _a: any, ctx: Context) => {
      if (!p.genExists()) return null;
      const b = GP_BUILDS[p.genTargetIdx()] || GP_BUILDS[0];
      return enBuildSchool(ctx.locale, b.school) + ' · ' + enGearSetName(ctx.locale, b.set);
    },
    items: (p: any) => p.genItems(),
    xinfa: (p: any) => p.genXinfa(),
    bowKind: (p: any) => p.genBowKind(),
    snapTotal: (p: any) => p.genSnap('total'),
    snapA: (p: any) => p.genSnap('a'),
    snapB: (p: any) => p.genSnap('b'),
    snapD: (p: any) => p.genSnap('d'),
    snapLoan: (p: any) => p.genSnap('loan'),
    snapYAcc: (p: any) => p.genSnap('yAcc'),
    snapYCrit: (p: any) => p.genSnap('yCrit'),
    snapYInt: (p: any) => p.genSnap('yInt'),
    ...SHARED_BUILD_TEXT_RESOLVERS,
  },
  },
};
