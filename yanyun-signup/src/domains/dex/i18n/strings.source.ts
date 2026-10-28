/* fbtee declaration surface for the dex domain (hand-maintained): this
 * domain's UI-copy declarations, one entry = one fbs call. A string's
 * identity is the declaration itself (domain + export name); the desc
 * is a natural-language note FOR TRANSLATORS -- what the string is,
 * where it appears, what its parameters mean -- never a key. Source
 * locale zh-CN; translations live in platform/i18n/translations/*.json
 * and hang off the id codegen stamps into each of their entries.
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

export const dex_backToDex = (fbs: FbsAPI) =>fbs("‹ 返回攻略", "Back link on a dungeon detail page, returning to the guides index.");
export const dex_bossesLine = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("count", pv(p, "count")), " 位首领"], "Line under a dungeon card stating its boss count; {count} is the number of bosses.");
export const dex_noBossData = (fbs: FbsAPI) =>fbs("暂无 Boss 数据", "Empty-state text on a dungeon page when it has no boss data.");
export const dex_empty = (fbs: FbsAPI) =>fbs("暂无攻略", "Empty-state text on the guides index when there are no guides.");
export const dex_currentGuides = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["当期攻略 · ", fbs.param("category", pv(p, "category"))], "Heading of the current-season guides section on the guides index; {category} is the dungeon category name.");
export const dex_catSub = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("season", pv(p, "season")), " · ", fbs.param("seasonName", pv(p, "seasonName"))], "Subtitle of a dungeon category on the guides index; {season} is the season code and {seasonName} the season name.");
export const dex_catSubCurrent = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("season", pv(p, "season")), " · ", fbs.param("seasonName", pv(p, "seasonName")), " · 版本 ", fbs.param("version", pv(p, "version"))], "Subtitle of the current dungeon category on the guides index; {season} is the season code, {seasonName} the season name and {version} the game version.");
export const dex_size10 = (fbs: FbsAPI) =>fbs("十人本", "Dungeon size label for ten-player dungeons, shown on dungeon cards and detail pages.");
export const dex_size5 = (fbs: FbsAPI) =>fbs("五人本", "Dungeon size label for five-player dungeons, shown on dungeon cards and detail pages.");
export const dex_sizeN = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("n", pv(p, "n")), "人本"], "Dungeon size label for other player counts; {n} is the player count.");
export const dex_bossUnit = (fbs: FbsAPI) =>fbs("首领", "Unit word for a boss, used when composing boss-related labels on dungeon pages.");
export const dex_partMechanics = (fbs: FbsAPI) =>fbs("机制", "Name of the mechanics part of a boss guide, used in guide completeness labels.");
export const dex_partShouts = (fbs: FbsAPI) =>fbs("喊话", "Name of the callout macros part of a boss guide, used in guide completeness labels.");
export const dex_partTalents = (fbs: FbsAPI) =>fbs("天赋", "Name of the talents part of a boss guide, used in guide completeness labels.");
export const dex_labelAll = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("count", pv(p, "count")), "位首领 · ", fbs.param("parts", pv(p, "parts")), "俱全"], "Guide completeness label on a dungeon card when every part is present; {count} is the boss count and {parts} lists the guide parts.");
export const dex_labelParts = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("count", pv(p, "count")), "位首领 · ", fbs.param("parts", pv(p, "parts"))], "Guide completeness label on a dungeon card listing which parts exist; {count} is the boss count and {parts} lists the guide parts.");
export const dex_labelPending = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("count", pv(p, "count")), "位首领 · 攻略待补"], "Guide completeness label on a dungeon card whose guides are still to be written; {count} is the boss count.");
export const dex_labelNoBosses = (fbs: FbsAPI) =>fbs("首领待补", "Label on a dungeon card whose boss data is still to be added.");
export const dex_sealBoss = (fbs: FbsAPI) =>fbs("将", "Single-character seal glyph shown on boss portraits in the guides UI.");
export const boss_back = (fbs: FbsAPI) =>fbs("‹ 返回", "Back link on a boss detail page, returning to its dungeon page.");
export const boss_notFound = (fbs: FbsAPI) =>fbs("Boss 不存在", "Message shown when a boss page is opened for a boss that does not exist.");
export const boss_tabMechanics = (fbs: FbsAPI) =>fbs("机制", "Tab label on the boss detail page for the mechanics guide.");
export const boss_tabTalents = (fbs: FbsAPI) =>fbs("天赋", "Tab label on the boss detail page for the talent recommendations.");
export const boss_shoutsTitle = (fbs: FbsAPI) =>fbs("📢 喊话宏", "Title of the callout macros section on the boss mechanics tab.");
export const boss_copy = (fbs: FbsAPI) =>fbs("复制", "Button label that copies one callout macro to the clipboard.");
export const boss_shoutCopied = (fbs: FbsAPI) =>fbs("喊话已复制", "Toast shown after a callout macro is copied.");
export const boss_copyFailed = (fbs: FbsAPI) =>fbs("复制失败", "Toast shown when copying a callout macro fails.");
export const boss_copyManual = (fbs: FbsAPI) =>fbs("请手动复制", "Toast follow-up asking the user to copy the callout macro manually.");
export const boss_noMechanics = (fbs: FbsAPI) =>fbs("暂无机制", "Empty-state text on the boss mechanics tab when no mechanics guide exists.");
export const boss_noTalents = (fbs: FbsAPI) =>fbs("暂无天赋", "Empty-state text on the boss talents tab when no talent recommendations exist.");
export const boss_talentTitle = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["天赋 ", fbs.param("code", pv(p, "code"))], "Title of one talent recommendation card on the boss talents tab; {code} is the talent build code.");
export const boss_talentPending = (fbs: FbsAPI) =>" " + fbs("· 待确认", "Suffix on a talent card title marking the recommendation as unconfirmed.");
export const sect_empty = (fbs: FbsAPI) =>fbs("暂无流派", "Empty-state text on the sect list when no sects exist.");
export const sect_back = (fbs: FbsAPI) =>fbs("‹ 返回流派", "Back link on a sect detail page, returning to the sect list.");
export const sect_tabBis = (fbs: FbsAPI) =>fbs("毕业词条", "Tab label on the sect detail page for best-in-slot affixes.");
export const sect_tabRotation = (fbs: FbsAPI) =>fbs("输出轴", "Tab label on the sect detail page for the damage rotation guide.");
export const sect_tabRates = (fbs: FbsAPI) =>fbs("三率目标", "Tab label on the sect detail page for the three-rate targets (accuracy, crit and crit damage).");
export const sect_tabTiaolv = (fbs: FbsAPI) =>fbs("调律推演", "Tab label on the sect detail page for the tuning (tiaolv) deduction tool.");
export const sect_tabGrad = (fbs: FbsAPI) =>fbs("武库鉴宝", "Tab label on the sect detail page for the gear graduation appraisal tool.");
export const sect_noBis = (fbs: FbsAPI) =>fbs("暂无毕业词条", "Empty-state text on the best-in-slot tab when a sect has no graduation affixes yet.");
export const sect_noRotation = (fbs: FbsAPI) =>fbs("暂无输出轴", "Empty-state text on the rotation tab when a sect has no rotation guide yet.");
export const sect_noRates = (fbs: FbsAPI) =>fbs("暂无三率目标", "Empty-state text on the rates tab when a sect has no three-rate targets yet.");
export const sect_rotGreydust = (fbs: FbsAPI) =>fbs("一分钟木桩轴", "Heading of the one-minute training-dummy rotation section on the rotation tab.");
export const sect_rotOpener = (fbs: FbsAPI) =>fbs("起手", "Heading of the opener segment of a rotation guide.");
export const sect_rotLoop = (fbs: FbsAPI) =>fbs("循环", "Heading of the loop segment of a rotation guide.");
export const sect_rotKeyPoints = (fbs: FbsAPI) =>fbs("要点", "Heading of the key points list of a rotation guide.");
export const sect_rotInnerSkills = (fbs: FbsAPI) =>fbs("心法", "Heading of the inner arts (xinfa) list of a rotation guide.");
export const sect_rotVideo = (fbs: FbsAPI) =>fbs("视频攻略", "Heading of the video guide links section of a rotation guide.");
export const sect_rateAccuracy = (fbs: FbsAPI) =>fbs("精准", "Name of the accuracy stat in the three-rate targets.");
export const sect_rateCrit = (fbs: FbsAPI) =>fbs("会心", "Name of the crit rate stat in the three-rate targets.");
export const sect_rateCritDamage = (fbs: FbsAPI) =>fbs("会意", "Name of the crit damage stat in the three-rate targets.");
export const sect_bisMainWeapon = (fbs: FbsAPI) =>fbs("主武器", "Equipment slot group heading on the best-in-slot tab for the main weapon.");
export const sect_bisOffWeapon = (fbs: FbsAPI) =>fbs("副武器", "Equipment slot group heading on the best-in-slot tab for the secondary weapon.");
export const sect_bisAccessories = (fbs: FbsAPI) =>fbs("环佩", "Equipment slot group heading on the best-in-slot tab for rings and pendants.");
export const sect_bisHeadBody = (fbs: FbsAPI) =>fbs("头衣", "Equipment slot group heading on the best-in-slot tab for head and body armor.");
export const sect_bisLegsWrists = (fbs: FbsAPI) =>fbs("腿腕", "Equipment slot group heading on the best-in-slot tab for legs and wrist armor.");
export const sect_tabAffix = (fbs: FbsAPI) =>fbs("毕业词缀", "Tab label on the sect detail page for graduation affix tables.");
export const sect_affixEmpty = (fbs: FbsAPI) =>fbs("暂无毕业词缀", "Empty-state text on the graduation affix tab when there is no affix data.");
export const sect_affixSetLabel = (fbs: FbsAPI) =>fbs("套装", "Field label for the gear set name in the graduation affix table header.");
export const sect_affixBowLabel = (fbs: FbsAPI) =>fbs("弓玦", "Field label for the bow-jue equipment group in the graduation affix table header.");
export const sect_affixDingyinLabel = (fbs: FbsAPI) =>fbs("定音", "Field label for the tuning (dingyin) setting in the graduation affix table header.");
export const sect_affixColAffix = (fbs: FbsAPI) =>fbs("词缀", "Column header in the graduation affix table for the affix name.");
export const sect_affixColCount = (fbs: FbsAPI) =>fbs("条数", "Column header in the graduation affix table for the number of affix lines.");
export const sect_affixColMax = (fbs: FbsAPI) =>fbs("满值", "Column header in the graduation affix table for the maximum value of one affix line.");
export const sect_affixColCy = (fbs: FbsAPI) =>fbs("承音", "Column header in the graduation affix table for the chengyin (resonance) value.");
export const sect_affixSource = (fbs: FbsAPI) =>fbs("按 100 阶毕业配方整理，与配装台同一口径；满值、承音为单条词缀上限。", "Source note under the graduation affix table: compiled from tier-100 graduation recipes with the same conventions as the build planner; max and chengyin are per-line caps.");
