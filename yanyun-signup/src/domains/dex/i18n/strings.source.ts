/* fbtee declaration surface for the dex domain (hand-maintained): this
 * domain's UI-copy declarations, one section (area) = one
 * XxxFbtUtils abstract class, one string = one static method on it,
 * one method = one fbs call. A string's identity is the declaration
 * itself (domain + export name <section>_<method>); the desc
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
 * codegen extracts the class blocks only.
 */
import type { FbsAPI } from 'fbtee/server';

export type StringParams = Record<string, unknown>;

function pv(p: StringParams | undefined, name: string): string {
  const v = p ? p[name] : undefined;
  return v === undefined ? '{' + name + '}' : String(v);
}

export abstract class DexFbtUtils {
  static backToDex(fbs: FbsAPI) { return fbs("‹ 返回攻略", "Back link on a dungeon detail page, returning to the guides index."); }
  static bossesLine(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("count", pv(p, "count")), " 位首领"], "Line under a dungeon card stating its boss count; {count} is the number of bosses."); }
  static noBossData(fbs: FbsAPI) { return fbs("暂无 Boss 数据", "Empty-state text on a dungeon page when it has no boss data."); }
  static empty(fbs: FbsAPI) { return fbs("暂无攻略", "Empty-state text on the guides index when there are no guides."); }
  static currentGuides(fbs: FbsAPI, p?: StringParams) { return fbs(["当期攻略 · ", fbs.param("category", pv(p, "category"))], "Heading of the current-season guides section on the guides index; {category} is the dungeon category name."); }
  static catSub(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("season", pv(p, "season")), " · ", fbs.param("seasonName", pv(p, "seasonName"))], "Subtitle of a dungeon category on the guides index; {season} is the season code and {seasonName} the season name."); }
  static catSubCurrent(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("season", pv(p, "season")), " · ", fbs.param("seasonName", pv(p, "seasonName")), " · 版本 ", fbs.param("version", pv(p, "version"))], "Subtitle of the current dungeon category on the guides index; {season} is the season code, {seasonName} the season name and {version} the game version."); }
  static size10(fbs: FbsAPI) { return fbs("十人本", "Dungeon size label for ten-player dungeons, shown on dungeon cards and detail pages."); }
  static size5(fbs: FbsAPI) { return fbs("五人本", "Dungeon size label for five-player dungeons, shown on dungeon cards and detail pages."); }
  static sizeN(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("n", pv(p, "n")), "人本"], "Dungeon size label for other player counts; {n} is the player count."); }
  static bossUnit(fbs: FbsAPI) { return fbs("首领", "Unit word for a boss, used when composing boss-related labels on dungeon pages."); }
  static partMechanics(fbs: FbsAPI) { return fbs("机制", "Name of the mechanics part of a boss guide, used in guide completeness labels."); }
  static partShouts(fbs: FbsAPI) { return fbs("喊话", "Name of the callout macros part of a boss guide, used in guide completeness labels."); }
  static partTalents(fbs: FbsAPI) { return fbs("天赋", "Name of the talents part of a boss guide, used in guide completeness labels."); }
  static labelAll(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("count", pv(p, "count")), "位首领 · ", fbs.param("parts", pv(p, "parts")), "俱全"], "Guide completeness label on a dungeon card when every part is present; {count} is the boss count and {parts} lists the guide parts."); }
  static labelParts(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("count", pv(p, "count")), "位首领 · ", fbs.param("parts", pv(p, "parts"))], "Guide completeness label on a dungeon card listing which parts exist; {count} is the boss count and {parts} lists the guide parts."); }
  static labelPending(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("count", pv(p, "count")), "位首领 · 攻略待补"], "Guide completeness label on a dungeon card whose guides are still to be written; {count} is the boss count."); }
  static labelNoBosses(fbs: FbsAPI) { return fbs("首领待补", "Label on a dungeon card whose boss data is still to be added."); }
  static sealBoss(fbs: FbsAPI) { return fbs("将", "Single-character seal glyph shown on boss portraits in the guides UI."); }
}

export abstract class BossFbtUtils {
  static back(fbs: FbsAPI) { return fbs("‹ 返回", "Back link on a boss detail page, returning to its dungeon page."); }
  static notFound(fbs: FbsAPI) { return fbs("Boss 不存在", "Message shown when a boss page is opened for a boss that does not exist."); }
  static tabMechanics(fbs: FbsAPI) { return fbs("机制", "Tab label on the boss detail page for the mechanics guide."); }
  static tabTalents(fbs: FbsAPI) { return fbs("天赋", "Tab label on the boss detail page for the talent recommendations."); }
  static shoutsTitle(fbs: FbsAPI) { return fbs("📢 喊话宏", "Title of the callout macros section on the boss mechanics tab."); }
  static copy(fbs: FbsAPI) { return fbs("复制", "Button label that copies one callout macro to the clipboard."); }
  static shoutCopied(fbs: FbsAPI) { return fbs("喊话已复制", "Toast shown after a callout macro is copied."); }
  static copyFailed(fbs: FbsAPI) { return fbs("复制失败", "Toast shown when copying a callout macro fails."); }
  static copyManual(fbs: FbsAPI) { return fbs("请手动复制", "Toast follow-up asking the user to copy the callout macro manually."); }
  static noMechanics(fbs: FbsAPI) { return fbs("暂无机制", "Empty-state text on the boss mechanics tab when no mechanics guide exists."); }
  static noTalents(fbs: FbsAPI) { return fbs("暂无天赋", "Empty-state text on the boss talents tab when no talent recommendations exist."); }
  static talentTitle(fbs: FbsAPI, p?: StringParams) { return fbs(["天赋 ", fbs.param("code", pv(p, "code"))], "Title of one talent recommendation card on the boss talents tab; {code} is the talent build code."); }
  static talentPending(fbs: FbsAPI) { return " " + fbs("· 待确认", "Suffix on a talent card title marking the recommendation as unconfirmed."); }
}

export abstract class SectFbtUtils {
  static empty(fbs: FbsAPI) { return fbs("暂无流派", "Empty-state text on the sect list when no sects exist."); }
  static back(fbs: FbsAPI) { return fbs("‹ 返回流派", "Back link on a sect detail page, returning to the sect list."); }
  static tabBis(fbs: FbsAPI) { return fbs("毕业词条", "Tab label on the sect detail page for best-in-slot affixes."); }
  static tabRotation(fbs: FbsAPI) { return fbs("输出轴", "Tab label on the sect detail page for the damage rotation guide."); }
  static tabRates(fbs: FbsAPI) { return fbs("三率目标", "Tab label on the sect detail page for the three-rate targets (accuracy, crit and crit damage)."); }
  static tabTiaolv(fbs: FbsAPI) { return fbs("调律推演", "Tab label on the sect detail page for the tuning (tiaolv) deduction tool."); }
  static tabGrad(fbs: FbsAPI) { return fbs("武库鉴宝", "Tab label on the sect detail page for the gear graduation appraisal tool."); }
  static noBis(fbs: FbsAPI) { return fbs("暂无毕业词条", "Empty-state text on the best-in-slot tab when a sect has no graduation affixes yet."); }
  static noRotation(fbs: FbsAPI) { return fbs("暂无输出轴", "Empty-state text on the rotation tab when a sect has no rotation guide yet."); }
  static noRates(fbs: FbsAPI) { return fbs("暂无三率目标", "Empty-state text on the rates tab when a sect has no three-rate targets yet."); }
  static rotGreydust(fbs: FbsAPI) { return fbs("一分钟木桩轴", "Heading of the one-minute training-dummy rotation section on the rotation tab."); }
  static rotOpener(fbs: FbsAPI) { return fbs("起手", "Heading of the opener segment of a rotation guide."); }
  static rotLoop(fbs: FbsAPI) { return fbs("循环", "Heading of the loop segment of a rotation guide."); }
  static rotKeyPoints(fbs: FbsAPI) { return fbs("要点", "Heading of the key points list of a rotation guide."); }
  static rotInnerSkills(fbs: FbsAPI) { return fbs("心法", "Heading of the inner arts (xinfa) list of a rotation guide."); }
  static rotVideo(fbs: FbsAPI) { return fbs("视频攻略", "Heading of the video guide links section of a rotation guide."); }
  static rateAccuracy(fbs: FbsAPI) { return fbs("精准", "Name of the accuracy stat in the three-rate targets."); }
  static rateCrit(fbs: FbsAPI) { return fbs("会心", "Name of the crit rate stat in the three-rate targets."); }
  static rateCritDamage(fbs: FbsAPI) { return fbs("会意", "Name of the crit damage stat in the three-rate targets."); }
  static bisMainWeapon(fbs: FbsAPI) { return fbs("主武器", "Equipment slot group heading on the best-in-slot tab for the main weapon."); }
  static bisOffWeapon(fbs: FbsAPI) { return fbs("副武器", "Equipment slot group heading on the best-in-slot tab for the secondary weapon."); }
  static bisAccessories(fbs: FbsAPI) { return fbs("环佩", "Equipment slot group heading on the best-in-slot tab for rings and pendants."); }
  static bisHeadBody(fbs: FbsAPI) { return fbs("头衣", "Equipment slot group heading on the best-in-slot tab for head and body armor."); }
  static bisLegsWrists(fbs: FbsAPI) { return fbs("腿腕", "Equipment slot group heading on the best-in-slot tab for legs and wrist armor."); }
  static tabAffix(fbs: FbsAPI) { return fbs("毕业词缀", "Tab label on the sect detail page for graduation affix tables."); }
  static affixEmpty(fbs: FbsAPI) { return fbs("暂无毕业词缀", "Empty-state text on the graduation affix tab when there is no affix data."); }
  static affixSetLabel(fbs: FbsAPI) { return fbs("套装", "Field label for the gear set name in the graduation affix table header."); }
  static affixBowLabel(fbs: FbsAPI) { return fbs("弓玦", "Field label for the bow-jue equipment group in the graduation affix table header."); }
  static affixDingyinLabel(fbs: FbsAPI) { return fbs("定音", "Field label for the tuning (dingyin) setting in the graduation affix table header."); }
  static affixColAffix(fbs: FbsAPI) { return fbs("词缀", "Column header in the graduation affix table for the affix name."); }
  static affixColCount(fbs: FbsAPI) { return fbs("条数", "Column header in the graduation affix table for the number of affix lines."); }
  static affixColMax(fbs: FbsAPI) { return fbs("满值", "Column header in the graduation affix table for the maximum value of one affix line."); }
  static affixColCy(fbs: FbsAPI) { return fbs("承音", "Column header in the graduation affix table for the chengyin (resonance) value."); }
  static affixSource(fbs: FbsAPI) { return fbs("按 100 阶毕业配方整理，与配装台同一口径；满值、承音为单条词缀上限。", "Source note under the graduation affix table: compiled from tier-100 graduation recipes with the same conventions as the build planner; max and chengyin are per-line caps."); }
}

