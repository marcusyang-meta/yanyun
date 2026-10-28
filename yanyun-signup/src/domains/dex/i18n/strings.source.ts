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
  static backToDex(fbs: FbsAPI) { return fbs("‹ 返回攻略", "Back link for compendium sub-pages, used at the top of dungeon and sect pages to return to the compendium index."); }
  static bossesLine(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("count", pv(p, "count")), " 位首领"], "Count text for compendium category cards, used to show how many bosses the category contains, where {count} is the number of bosses."); }
  static noBossData(fbs: FbsAPI) { return fbs("暂无 Boss 数据", "Empty-state text for compendium categories, used when a category has no boss data yet."); }
  static empty(fbs: FbsAPI) { return fbs("暂无攻略", "Empty-state text for the compendium index, used when no guides exist yet."); }
  static currentGuides(fbs: FbsAPI, p?: StringParams) { return fbs(["当期攻略 · ", fbs.param("category", pv(p, "category"))], "Heading text for the compendium index, used above the current guides of a category, where {category} is the category name supplied by the server."); }
  static catSub(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("season", pv(p, "season")), " · ", fbs.param("seasonName", pv(p, "seasonName"))], "Subtitle for compendium category cards, used to show the season of the category, where {season} is the season number and {seasonName} its name."); }
  static catSubCurrent(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("season", pv(p, "season")), " · ", fbs.param("seasonName", pv(p, "seasonName")), " · 版本 ", fbs.param("version", pv(p, "version"))], "Subtitle for compendium category cards, used for the current category to show season and game version, where {season} and {seasonName} identify the season and {version} is the game version."); }
  static size10(fbs: FbsAPI) { return fbs("十人本", "Size label for compendium entries, used to mark a ten-player dungeon."); }
  static size5(fbs: FbsAPI) { return fbs("五人本", "Size label for compendium entries, used to mark a five-player dungeon."); }
  static sizeN(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("n", pv(p, "n")), "人本"], "Size label for compendium entries, used to mark a dungeon of a given size, where {n} is the player count."); }
  static bossUnit(fbs: FbsAPI) { return fbs("首领", "Unit word for boss counts in the compendium, used after a number when counting bosses."); }
  static partMechanics(fbs: FbsAPI) { return fbs("机制", "Part label for boss guides, used in guide completeness summaries to name the mechanics part."); }
  static partShouts(fbs: FbsAPI) { return fbs("喊话", "Part label for boss guides, used in guide completeness summaries to name the callout macros part."); }
  static partTalents(fbs: FbsAPI) { return fbs("天赋", "Part label for boss guides, used in guide completeness summaries to name the talents part."); }
  static labelAll(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("count", pv(p, "count")), "位首领 · ", fbs.param("parts", pv(p, "parts")), "俱全"], "Summary text for compendium category cards, used when a guide covers all parts, where {count} is the number of bosses and {parts} the joined part names."); }
  static labelParts(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("count", pv(p, "count")), "位首领 · ", fbs.param("parts", pv(p, "parts"))], "Summary text for compendium category cards, used to list which guide parts are present, where {count} is the number of bosses and {parts} the joined part names."); }
  static labelPending(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("count", pv(p, "count")), "位首领 · 攻略待补"], "Summary text for compendium category cards, used when guide content is still missing, where {count} is the number of bosses."); }
  static labelNoBosses(fbs: FbsAPI) { return fbs("首领待补", "Summary text for compendium category cards, used when the boss roster itself is still missing."); }
  static sealBoss(fbs: FbsAPI) { return fbs("将", "Seal character for boss guide artwork, used as the decorative seal glyph on boss guide headers."); }
}

export abstract class BossFbtUtils {
  static back(fbs: FbsAPI) { return fbs("‹ 返回", "Back link for the boss guide page, used at the top of the page to return to the compendium."); }
  static notFound(fbs: FbsAPI) { return fbs("Boss 不存在", "Error text for the boss guide page, used when the requested boss does not exist."); }
  static tabMechanics(fbs: FbsAPI) { return fbs("机制", "Tab label for the boss guide page, used to switch to the mechanics section of the guide."); }
  static tabTalents(fbs: FbsAPI) { return fbs("天赋", "Tab label for the boss guide page, used to switch to the talents section of the guide."); }
  static shoutsTitle(fbs: FbsAPI) { return fbs("📢 喊话宏", "Title text for the callout macros box on the boss guide page, used above the copyable fight callouts."); }
  static copy(fbs: FbsAPI) { return fbs("复制", "Button label for callout macros on the boss guide page, used to copy a callout line to the clipboard."); }
  static shoutCopied(fbs: FbsAPI) { return fbs("喊话已复制", "Confirmation text for callout macros, used as a transient notice after a callout is copied."); }
  static copyFailed(fbs: FbsAPI) { return fbs("复制失败", "Error text for callout macros, used when copying to the clipboard fails."); }
  static copyManual(fbs: FbsAPI) { return fbs("请手动复制", "Hint text for callout macros, used when automatic copying fails so the user copies the text manually."); }
  static noMechanics(fbs: FbsAPI) { return fbs("暂无机制", "Empty-state text for the boss guide mechanics tab, used when no mechanics content exists yet."); }
  static noTalents(fbs: FbsAPI) { return fbs("暂无天赋", "Empty-state text for the boss guide talents tab, used when no talent content exists yet."); }
  static talentTitle(fbs: FbsAPI, p?: StringParams) { return fbs(["天赋 ", fbs.param("code", pv(p, "code"))], "Title text for talent entries on the boss guide page, used to head a talent build, where {code} is the talent build code."); }
  static talentPending(fbs: FbsAPI) { return " " + fbs("· 待确认", "Suffix text for talent entries on the boss guide page, used after a talent title to mark the build as unconfirmed."); }
}

export abstract class SectFbtUtils {
  static empty(fbs: FbsAPI) { return fbs("暂无流派", "Empty-state text for the sect list, used when no sects exist yet."); }
  static back(fbs: FbsAPI) { return fbs("‹ 返回流派", "Back link for sect detail pages, used at the top of the page to return to the sect list."); }
  static tabBis(fbs: FbsAPI) { return fbs("毕业词条", "Tab label for sect detail pages, used to switch to the best-in-slot affixes tab."); }
  static tabRotation(fbs: FbsAPI) { return fbs("输出轴", "Tab label for sect detail pages, used to switch to the rotation tab."); }
  static tabRates(fbs: FbsAPI) { return fbs("三率目标", "Tab label for sect detail pages, used to switch to the stat targets tab."); }
  static tabTiaolv(fbs: FbsAPI) { return fbs("调律推演", "Tab label for sect detail pages, used to switch to the tuning simulation tab."); }
  static tabGrad(fbs: FbsAPI) { return fbs("武库鉴宝", "Tab label for sect detail pages, used to switch to the gear appraisal tab."); }
  static noBis(fbs: FbsAPI) { return fbs("暂无毕业词条", "Empty-state text for the best-in-slot tab on sect detail pages, used when no best-in-slot data exists yet."); }
  static noRotation(fbs: FbsAPI) { return fbs("暂无输出轴", "Empty-state text for the rotation tab on sect detail pages, used when no rotation data exists yet."); }
  static noRates(fbs: FbsAPI) { return fbs("暂无三率目标", "Empty-state text for the stat targets tab on sect detail pages, used when no stat target data exists yet."); }
  static rotGreydust(fbs: FbsAPI) { return fbs("一分钟木桩轴", "Label for rotation data on sect detail pages, used for the one-minute training-dummy rotation."); }
  static rotOpener(fbs: FbsAPI) { return fbs("起手", "Section label for rotation data on sect detail pages, used for the opener sequence."); }
  static rotLoop(fbs: FbsAPI) { return fbs("循环", "Section label for rotation data on sect detail pages, used for the repeating loop sequence."); }
  static rotKeyPoints(fbs: FbsAPI) { return fbs("要点", "Section label for rotation data on sect detail pages, used for the key points notes."); }
  static rotInnerSkills(fbs: FbsAPI) { return fbs("心法", "Section label for rotation data on sect detail pages, used for the inner arts (xinfa) listing."); }
  static rotVideo(fbs: FbsAPI) { return fbs("视频攻略", "Link label for rotation data on sect detail pages, used for the video guide link."); }
  static rateAccuracy(fbs: FbsAPI) { return fbs("精准", "Stat name for the stat targets tab on sect detail pages, used for the accuracy stat."); }
  static rateCrit(fbs: FbsAPI) { return fbs("会心", "Stat name for the stat targets tab on sect detail pages, used for the critical hit stat."); }
  static rateCritDamage(fbs: FbsAPI) { return fbs("会意", "Stat name for the stat targets tab on sect detail pages, used for the critical damage stat."); }
  static bisMainWeapon(fbs: FbsAPI) { return fbs("主武器", "Slot label for the best-in-slot tab on sect detail pages, used for the main weapon group."); }
  static bisOffWeapon(fbs: FbsAPI) { return fbs("副武器", "Slot label for the best-in-slot tab on sect detail pages, used for the off-hand weapon group."); }
  static bisAccessories(fbs: FbsAPI) { return fbs("环佩", "Slot label for the best-in-slot tab on sect detail pages, used for the accessories group."); }
  static bisHeadBody(fbs: FbsAPI) { return fbs("头衣", "Slot label for the best-in-slot tab on sect detail pages, used for the head and body armor group."); }
  static bisLegsWrists(fbs: FbsAPI) { return fbs("腿腕", "Slot label for the best-in-slot tab on sect detail pages, used for the legs and wrists armor group."); }
  static tabAffix(fbs: FbsAPI) { return fbs("毕业词缀", "Tab label for sect detail pages, used to switch to the graduation affixes tab."); }
  static affixEmpty(fbs: FbsAPI) { return fbs("暂无毕业词缀", "Empty-state text for the graduation affixes tab on sect detail pages, used when no graduation affix data exists yet."); }
  static affixSetLabel(fbs: FbsAPI) { return fbs("套装", "Row label for the graduation affixes table, used for the set bonus rows."); }
  static affixBowLabel(fbs: FbsAPI) { return fbs("弓玦", "Row label for the graduation affixes table, used for the bow jade rows."); }
  static affixDingyinLabel(fbs: FbsAPI) { return fbs("定音", "Row label for the graduation affixes table, used for the pitch-setting (dingyin) rows."); }
  static affixColAffix(fbs: FbsAPI) { return fbs("词缀", "Column header for the graduation affixes table, used for the affix name column."); }
  static affixColCount(fbs: FbsAPI) { return fbs("条数", "Column header for the graduation affixes table, used for the affix line count column."); }
  static affixColMax(fbs: FbsAPI) { return fbs("满值", "Column header for the graduation affixes table, used for the maximum value column."); }
  static affixColCy(fbs: FbsAPI) { return fbs("承音", "Column header for the graduation affixes table, used for the resonance (chengyin) column."); }
  static affixSource(fbs: FbsAPI) { return fbs("按 100 阶毕业配方整理，与配装台同一口径；满值、承音为单条词缀上限。", "Source note for the graduation affixes tab, used under the table to explain that the data follows the tier-100 graduation recipe and the same conventions as the build desk."); }
}

