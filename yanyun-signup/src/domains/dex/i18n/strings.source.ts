/* fbtee declaration surface for the dex domain (hand-maintained): this
 * domain's UI-copy declarations, one entry = one fbs call, desc =
 * 'section.field' (the stable anchor translations hang off). Source
 * locale zh-CN; translations live in platform/i18n/translations/*.json.
 * scripts/i18n-codegen.mjs collects the per-domain declaration files
 * into the compiled strings.ts / catalogs / CATALOG projection; after
 * editing copy, rerun it (--check runs in CI). Shared copy (common,
 * errors, legal, ...) is declared by the platform domain and reached
 * through its text util, never duplicated here. The StringParams/pv
 * prelude is repeated per file so each file typechecks standalone;
 * codegen extracts the entry statements only.
 */
import type { FbsAPI } from 'fbtee/server';

export type StringParams = Record<string, unknown>;

function pv(p: StringParams | undefined, name: string): string {
  const v = p ? p[name] : undefined;
  return v === undefined ? '{' + name + '}' : String(v);
}

export const dex_backToDex = (fbs: FbsAPI) =>fbs("‹ 返回攻略", "dex.backToDex");
export const dex_bossesLine = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("count", pv(p, "count")), " 位首领"], "dex.bossesLine");
export const dex_noBossData = (fbs: FbsAPI) =>fbs("暂无 Boss 数据", "dex.noBossData");
export const dex_empty = (fbs: FbsAPI) =>fbs("暂无攻略", "dex.empty");
export const dex_currentGuides = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["当期攻略 · ", fbs.param("category", pv(p, "category"))], "dex.currentGuides");
export const dex_catSub = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("season", pv(p, "season")), " · ", fbs.param("seasonName", pv(p, "seasonName"))], "dex.catSub");
export const dex_catSubCurrent = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("season", pv(p, "season")), " · ", fbs.param("seasonName", pv(p, "seasonName")), " · 版本 ", fbs.param("version", pv(p, "version"))], "dex.catSubCurrent");
export const dex_size10 = (fbs: FbsAPI) =>fbs("十人本", "dex.size10");
export const dex_size5 = (fbs: FbsAPI) =>fbs("五人本", "dex.size5");
export const dex_sizeN = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("n", pv(p, "n")), "人本"], "dex.sizeN");
export const dex_bossUnit = (fbs: FbsAPI) =>fbs("首领", "dex.bossUnit");
export const dex_partMechanics = (fbs: FbsAPI) =>fbs("机制", "dex.partMechanics");
export const dex_partShouts = (fbs: FbsAPI) =>fbs("喊话", "dex.partShouts");
export const dex_partTalents = (fbs: FbsAPI) =>fbs("天赋", "dex.partTalents");
export const dex_labelAll = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("count", pv(p, "count")), "位首领 · ", fbs.param("parts", pv(p, "parts")), "俱全"], "dex.labelAll");
export const dex_labelParts = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("count", pv(p, "count")), "位首领 · ", fbs.param("parts", pv(p, "parts"))], "dex.labelParts");
export const dex_labelPending = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("count", pv(p, "count")), "位首领 · 攻略待补"], "dex.labelPending");
export const dex_labelNoBosses = (fbs: FbsAPI) =>fbs("首领待补", "dex.labelNoBosses");
export const dex_sealBoss = (fbs: FbsAPI) =>fbs("将", "dex.sealBoss");
export const boss_back = (fbs: FbsAPI) =>fbs("‹ 返回", "boss.back");
export const boss_notFound = (fbs: FbsAPI) =>fbs("Boss 不存在", "boss.notFound");
export const boss_tabMechanics = (fbs: FbsAPI) =>fbs("机制", "boss.tabMechanics");
export const boss_tabTalents = (fbs: FbsAPI) =>fbs("天赋", "boss.tabTalents");
export const boss_shoutsTitle = (fbs: FbsAPI) =>fbs("📢 喊话宏", "boss.shoutsTitle");
export const boss_copy = (fbs: FbsAPI) =>fbs("复制", "boss.copy");
export const boss_shoutCopied = (fbs: FbsAPI) =>fbs("喊话已复制", "boss.shoutCopied");
export const boss_copyFailed = (fbs: FbsAPI) =>fbs("复制失败", "boss.copyFailed");
export const boss_copyManual = (fbs: FbsAPI) =>fbs("请手动复制", "boss.copyManual");
export const boss_noMechanics = (fbs: FbsAPI) =>fbs("暂无机制", "boss.noMechanics");
export const boss_noTalents = (fbs: FbsAPI) =>fbs("暂无天赋", "boss.noTalents");
export const boss_talentTitle = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["天赋 ", fbs.param("code", pv(p, "code"))], "boss.talentTitle");
export const boss_talentPending = (fbs: FbsAPI) =>" " + fbs("· 待确认", "boss.talentPending");
export const sect_empty = (fbs: FbsAPI) =>fbs("暂无流派", "sect.empty");
export const sect_back = (fbs: FbsAPI) =>fbs("‹ 返回流派", "sect.back");
export const sect_tabBis = (fbs: FbsAPI) =>fbs("毕业词条", "sect.tabBis");
export const sect_tabRotation = (fbs: FbsAPI) =>fbs("输出轴", "sect.tabRotation");
export const sect_tabRates = (fbs: FbsAPI) =>fbs("三率目标", "sect.tabRates");
export const sect_tabTiaolv = (fbs: FbsAPI) =>fbs("调律推演", "sect.tabTiaolv");
export const sect_tabGrad = (fbs: FbsAPI) =>fbs("武库鉴宝", "sect.tabGrad");
export const sect_noBis = (fbs: FbsAPI) =>fbs("暂无毕业词条", "sect.noBis");
export const sect_noRotation = (fbs: FbsAPI) =>fbs("暂无输出轴", "sect.noRotation");
export const sect_noRates = (fbs: FbsAPI) =>fbs("暂无三率目标", "sect.noRates");
export const sect_rotGreydust = (fbs: FbsAPI) =>fbs("一分钟木桩轴", "sect.rotGreydust");
export const sect_rotOpener = (fbs: FbsAPI) =>fbs("起手", "sect.rotOpener");
export const sect_rotLoop = (fbs: FbsAPI) =>fbs("循环", "sect.rotLoop");
export const sect_rotKeyPoints = (fbs: FbsAPI) =>fbs("要点", "sect.rotKeyPoints");
export const sect_rotInnerSkills = (fbs: FbsAPI) =>fbs("心法", "sect.rotInnerSkills");
export const sect_rotVideo = (fbs: FbsAPI) =>fbs("视频攻略", "sect.rotVideo");
export const sect_rateAccuracy = (fbs: FbsAPI) =>fbs("精准", "sect.rateAccuracy");
export const sect_rateCrit = (fbs: FbsAPI) =>fbs("会心", "sect.rateCrit");
export const sect_rateCritDamage = (fbs: FbsAPI) =>fbs("会意", "sect.rateCritDamage");
export const sect_bisMainWeapon = (fbs: FbsAPI) =>fbs("主武器", "sect.bisMainWeapon");
export const sect_bisOffWeapon = (fbs: FbsAPI) =>fbs("副武器", "sect.bisOffWeapon");
export const sect_bisAccessories = (fbs: FbsAPI) =>fbs("环佩", "sect.bisAccessories");
export const sect_bisHeadBody = (fbs: FbsAPI) =>fbs("头衣", "sect.bisHeadBody");
export const sect_bisLegsWrists = (fbs: FbsAPI) =>fbs("腿腕", "sect.bisLegsWrists");
