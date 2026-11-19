/* fbtee declaration surface for the gear domain (hand-maintained): this
 * domain's UI-copy declarations, one section (area) = one
 * XxxFbtUtils abstract class, one string = one static method on it,
 * one method = one fbs call. A string's identity is the declaration
 * itself (domain + export name <section>_<method>); the desc
 * is a natural-language note FOR TRANSLATORS -- what the string is,
 * where it appears, what its parameters mean -- never a key.
 * Descriptions follow the role-first paradigm: '<Role> for
 * <surface>, used for <purpose>' — the copy's role first (Title
 * text, Button label, Hint text, Error message, ...), then the
 * feature surface it belongs to, then what it is used for,
 * written from the real call site; parameters are explained in
 * the used-for part. Source
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

export abstract class TiaolvFbtUtils {
  static intro(fbs: FbsAPI) { return fbs("调律推演 · 复刻 bilibili@片雲 DIY 0.10.2（100级）伤害计算器逻辑", "Intro text for the tuning simulation tab, used under the tab heading to credit the replicated DIY calculator version and list the inputs the simulation needs."); }
  static innerSkill(fbs: FbsAPI, p?: StringParams) { return fbs(["心法", fbs.param("n", pv(p, "n"))], "Field label pattern for the tuning simulation form, used for an inner art slot, where {n} is the slot number."); }
  static innerSkillPlaceholder(fbs: FbsAPI) { return fbs("心法名", "Placeholder text for the tuning simulation form, used in an inner art name input."); }
  static wuxue(fbs: FbsAPI) { return fbs("武学", "Field label for the tuning simulation form, used for the martial arts (wuxue) selector."); }
  static wuku(fbs: FbsAPI) { return fbs("武库", "Field label for the tuning simulation form, used for the arsenal (wuku) selector."); }
  static wukuSelf(fbs: FbsAPI) { return fbs("本系", "Option label for the arsenal selector in the tuning simulation, used for the same-school arsenal choice."); }
  static wukuCommon(fbs: FbsAPI) { return fbs("通用", "Option label for the arsenal selector in the tuning simulation, used for the general arsenal choice."); }
  static suit(fbs: FbsAPI) { return fbs("套装", "Field label for the tuning simulation form, used for the gear set selector."); }
  static bow(fbs: FbsAPI) { return fbs("弓决", "Field label for the tuning simulation form, used for the bow art selector."); }
  static none(fbs: FbsAPI) { return fbs("无", "Option label for tuning simulation selectors, used for the empty choice."); }
  static tuneArea(fbs: FbsAPI) { return fbs("调律区（K:R 列，对应 Excel K3:R5, K6:R24）", "Section label for the tuning simulation form, used for the tuning area grid with its spreadsheet cell reference."); }
  static calc(fbs: FbsAPI) { return fbs("开始推演", "Button label for the tuning simulation, used to start the damage simulation."); }
  static calculating(fbs: FbsAPI) { return fbs("推演中…", "Button label for the tuning simulation, used while the simulation is running."); }
  static toastFailed(fbs: FbsAPI) { return fbs("计算失败", "Toast message for the tuning simulation, used when the simulation fails without detail."); }
  static toastFailedWith(fbs: FbsAPI, p?: StringParams) { return fbs(["计算失败：", fbs.param("error", pv(p, "error"))], "Toast message for the tuning simulation, used when the simulation fails, where {error} is the failure detail."); }
  static colAttr(fbs: FbsAPI) { return fbs("属性", "Column header for the tuning simulation result table, used for the attribute column."); }
  static colBase(fbs: FbsAPI) { return fbs("基础白值", "Column header for the tuning simulation result table, used for the base flat value column."); }
  static colPanel(fbs: FbsAPI) { return fbs("面板白值", "Column header for the tuning simulation result table, used for the panel flat value column."); }
  static colFinal(fbs: FbsAPI) { return fbs("最终面板", "Column header for the tuning simulation result table, used for the final panel column."); }
}

export abstract class GradFbtUtils {
  static entering(fbs: FbsAPI) { return fbs("正在进入武库…", "Loading text for the gear appraisal page, used as a splash while the appraisal view loads."); }
  static title(fbs: FbsAPI) { return fbs("武库鉴宝", "Title text for the gear appraisal page, used as the page heading."); }
  static subtitle(fbs: FbsAPI) { return fbs("条数50% · 数值30% · 三率20%", "Subtitle for the gear appraisal page, used under the title to state the scoring weights for count, value and rates."); }
  static mingjinNote(fbs: FbsAPI) { return fbs("鸣金 · 大外会意流", "Note text for the gear appraisal page, used to name the build the default appraisal recipe follows."); }
  static buildBig(fbs: FbsAPI) { return fbs("大外", "Build label for the gear appraisal page, used for the major-external build choice."); }
  static buildSmall(fbs: FbsAPI) { return fbs("小外", "Build label for the gear appraisal page, used for the minor-external build choice."); }
  static ringLabel(fbs: FbsAPI) { return fbs("毕业率", "Label for the graduation ring on the appraisal page, used for the overall graduation rate figure."); }
  static scoreCount(fbs: FbsAPI) { return fbs("条数匹配", "Score label for the appraisal breakdown, used for the affix count match component."); }
  static scoreValue(fbs: FbsAPI) { return fbs("数值达成", "Score label for the appraisal breakdown, used for the roll value achievement component."); }
  static scoreRate(fbs: FbsAPI) { return fbs("三率达标", "Score label for the appraisal breakdown, used for the three-rate target component."); }
  static tier1(fbs: FbsAPI) { return fbs("天人合一", "Tier name for appraisal results, used for the highest verdict tier."); }
  static tier2(fbs: FbsAPI) { return fbs("登峰造极", "Tier name for appraisal results, used for the second verdict tier."); }
  static tier3(fbs: FbsAPI) { return fbs("炉火纯青", "Tier name for appraisal results, used for the third verdict tier."); }
  static tier4(fbs: FbsAPI) { return fbs("小有所成", "Tier name for appraisal results, used for the fourth verdict tier."); }
  static tier5(fbs: FbsAPI) { return fbs("初窥门径", "Tier name for appraisal results, used for the fifth verdict tier."); }
  static tier6(fbs: FbsAPI) { return fbs("凡铁未炼", "Tier name for appraisal results, used for the lowest verdict tier."); }
  static tapHint(fbs: FbsAPI) { return fbs("轻触装备以镌刻词条", "Hint text for the appraisal page, used to tell the user to tap a gear piece to inscribe its affixes."); }
  static refTitle(fbs: FbsAPI) { return fbs("📖 参考数据 · 词条满值与版位", "Title text for the appraisal reference section, used above the affix maximum and slot layout reference data."); }
  static maxTableTitle(fbs: FbsAPI) { return fbs("词条满值表（100阶）", "Title text for the affix maximum table on the appraisal page, used above the tier-100 maximum values."); }
  static colAffix(fbs: FbsAPI) { return fbs("词条", "Column header for the appraisal maximum table, used for the affix name column."); }
  static colMax(fbs: FbsAPI) { return fbs("满值", "Column header for the appraisal maximum table, used for the maximum value column."); }
  static colResonance(fbs: FbsAPI) { return fbs("承音（95%)", "Column header for the appraisal maximum table, used for the resonance value column at ninety-five percent."); }
  static slotTableTitle(fbs: FbsAPI, p?: StringParams) { return fbs(["部位版位表（", fbs.param("build", pv(p, "build")), "）"], "Title text for the appraisal slot layout table, used above the layout for a build, where {build} is the build name."); }
  static rateTitle(fbs: FbsAPI) { return fbs("⚡ 三率速算", "Title text for the appraisal quick rate calculator, used above the three-rate quick calculation."); }
  static rateOk(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("v", pv(p, "v")), " ✓"], "Result text for the appraisal quick rate calculator, used when a rate meets its target, where {v} is the formatted rate value."); }
  static rateGap(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("v", pv(p, "v")), " （差", fbs.param("gap", pv(p, "gap")), "）"], "Result text for the appraisal quick rate calculator, used when a rate falls short of its target, where {v} is the formatted rate value and {gap} the formatted shortfall."); }
  static rateOverflow(fbs: FbsAPI, p?: StringParams) { return fbs(["⚠️ 会心+会意=", fbs.param("sum", pv(p, "sum")), ">100，会意挤占会心"], "Warning text for the appraisal quick rate calculator, used when critical hit plus critical damage exceed one hundred percent, where {sum} is their combined percentage."); }
  static compareTitle(fbs: FbsAPI) { return fbs("⚔️ 方案对比", "Title text for the appraisal scheme comparison section, used above the saved scheme comparison."); }
  static saveScheme(fbs: FbsAPI) { return fbs("💾 保存当前配装为方案", "Button label for the appraisal page, used to save the current loadout as a scheme."); }
  static schemeName(fbs: FbsAPI, p?: StringParams) { return fbs(["方案", fbs.param("n", pv(p, "n"))], "Name pattern for appraisal schemes, used as the default name of a saved scheme, where {n} is the scheme number."); }
  static noSchemes(fbs: FbsAPI) { return fbs("暂无方案，先填好装备再保存", "Empty-state text for the appraisal scheme section, used when no schemes are saved yet."); }
  static load(fbs: FbsAPI) { return fbs("载入", "Button label for appraisal schemes, used to load a scheme."); }
  static deleteScheme(fbs: FbsAPI) { return fbs("删除方案", "Button label for appraisal schemes, used to delete a scheme."); }
  static itemScore(fbs: FbsAPI, p?: StringParams) { return fbs(["本件 ", fbs.param("score", pv(p, "score")), "%"], "Score text for appraised gear items, used on an item to show its individual score, where {score} is the item's percentage score."); }
  static rowMain(fbs: FbsAPI) { return fbs("主词条", "Row label for the appraisal item editor, used for the main affix row."); }
  static rowSub(fbs: FbsAPI, p?: StringParams) { return fbs(["副词条", fbs.param("n", pv(p, "n"))], "Row label pattern for the appraisal item editor, used for a sub affix row, where {n} is the row number."); }
  static rowResonance(fbs: FbsAPI) { return fbs("定音", "Row label for the appraisal item editor, used for the dingyin resonance row."); }
  static ratePrecision(fbs: FbsAPI) { return fbs("精准", "Rate name for the appraisal page, used for the accuracy rate."); }
  static rateCrit(fbs: FbsAPI) { return fbs("会心", "Rate name for the appraisal page, used for the critical hit rate."); }
  static rateAffinity(fbs: FbsAPI) { return fbs("会意", "Rate name for the appraisal page, used for the critical damage rate."); }
  static affixPlaceholder(fbs: FbsAPI) { return fbs("— 待镌刻 —", "Placeholder text for the appraisal item editor, used in an affix selector before an affix is inscribed."); }
  static affixLoading(fbs: FbsAPI) { return fbs("词条数据加载中…", "Loading text for the appraisal item editor, used while affix data loads."); }
  static valuePlaceholderMax(fbs: FbsAPI, p?: StringParams) { return fbs(["数值 / ", fbs.param("max", pv(p, "max"))], "Placeholder text for the appraisal item editor, used in a value input to show the maximum, where {max} is the affix maximum value."); }
  static valuePlaceholder(fbs: FbsAPI) { return fbs("数值", "Placeholder text for the appraisal item editor, used in a value input."); }
  static resonance(fbs: FbsAPI) { return fbs("承音", "Label for the appraisal item editor, used for the resonance quick-fill value."); }
  static overMax(fbs: FbsAPI, p?: StringParams) { return fbs(["超过满值 ", fbs.param("max", pv(p, "max")), "，将按满值计算"], "Warning text for the appraisal item editor, used when an entered value exceeds the maximum and will be clamped, where {max} is the affix maximum value."); }
  static toastSaved(fbs: FbsAPI, p?: StringParams) { return fbs(["已保存方案「", fbs.param("name", pv(p, "name")), "」"], "Toast message for the appraisal page, used after a scheme is saved, where {name} is the scheme name."); }
  static toastLoaded(fbs: FbsAPI, p?: StringParams) { return fbs(["已载入方案「", fbs.param("name", pv(p, "name")), "」"], "Toast message for the appraisal page, used after a scheme is loaded, where {name} is the scheme name."); }
  static toastOldScheme(fbs: FbsAPI) { return fbs("旧方案只保存了分数，无法载入配装", "Toast message for the appraisal page, used when loading a legacy scheme that stored only scores and cannot restore a loadout."); }
}

export abstract class GearFbtUtils {
  static calcLabel(fbs: FbsAPI) { return fbs("计算", "Button label for the gear library, used to run the graduation calculation for the selected gear."); }
  static benchTitle(fbs: FbsAPI) { return fbs("配装台", "Title text for the build desk page, used as the page heading."); }
  static benchIntro(fbs: FbsAPI) { return fbs("100 阶配装：按流派配方拼装备、算面板与毕业度（口径：条数 40% + 数值 24% + 定音 20%，与上方毕业计算的口径不同）。装备库与方案保存在你的 Discord 账号下，换设备也能用。", "Intro text for the build desk page, used under the title to explain tier-100 building, the graduation formula weights and the tuning rules."); }
  static targetLabel(fbs: FbsAPI) { return fbs("目标流派", "Field label for the build desk, used for the target sect selector."); }
  static bowLabel(fbs: FbsAPI) { return fbs("弓玦", "Field label for the build desk, used for the bow jade selector."); }
  static bowNoneLabel(fbs: FbsAPI) { return fbs("无", "Option label for the bow jade selector on the build desk, used for the choice with no bow jade equipped."); }
  static extrasTitle(fbs: FbsAPI) { return fbs("其他来源加成", "Section heading for the build desk, used above the other-source bonus inputs."); }
  static resLabel(fbs: FbsAPI) { return fbs("抗性", "Field label for the build desk extras, used for the resistance bonus input."); }
  static extraAccLabel(fbs: FbsAPI) { return fbs("白字精准（手填）", "Field label for the build desk extras, used for the manually entered flat accuracy bonus."); }
  static extraCritLabel(fbs: FbsAPI) { return fbs("白字会心（手填）", "Field label for the build desk extras, used for the manually entered flat critical hit bonus."); }
  static extraIntLabel(fbs: FbsAPI) { return fbs("白字会意（手填）", "Field label for the build desk extras, used for the manually entered flat critical damage bonus."); }
  static baseTitle(fbs: FbsAPI) { return fbs("角色基础", "Section heading for the build desk, used above the character base stats panel."); }
  static unlockLabel(fbs: FbsAPI) { return fbs("解锁", "Button label for the character base panel, used to unlock the base stats for editing."); }
  static lockLabel(fbs: FbsAPI) { return fbs("锁定", "Button label for the character base panel, used to lock the base stats after editing."); }
  static modifiedTag(fbs: FbsAPI) { return fbs("已改", "Tag text for the character base panel, used to mark that base stats differ from the preset."); }
  static baseResetLabel(fbs: FbsAPI) { return fbs("恢复预设", "Button label for the character base panel, used to restore the preset base stats."); }
  static baseResetTitle(fbs: FbsAPI) { return fbs("恢复预设？", "Title text for the base stats reset confirmation, used as the confirmation dialog heading."); }
  static baseResetBody(fbs: FbsAPI) { return fbs("角色基础将回到预设值，心法选择保留。", "Body text for the base stats reset confirmation, used to explain that base stats return to the preset while inner art choices are kept."); }
  static xinfaLabelTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["心法 ", fbs.param("n", pv(p, "n"))], "Field label for the build desk, used for an inner art (xinfa) slot, where {n} is the slot number."); }
  static xinfaNoneLabel(fbs: FbsAPI) { return fbs("— 不选 —", "Option label for the inner art selector on the build desk, used for the choice with no inner art selected."); }
  static loginHint(fbs: FbsAPI) { return fbs("装备库与方案按你的 Discord 账号保存，登录后可用（计算与参考数据无需登录）。", "Hint text for signed-out visitors on gear pages, used to explain that the library and builds are stored per Discord account while calculation and reference data work without login."); }
  static libTitle(fbs: FbsAPI) { return fbs("装备库", "Title text for the gear library, used as the library heading."); }
  static myLibTitle(fbs: FbsAPI) { return fbs("我的装备库", "Title text for the gear library page, used as the heading of the signed-in user's own library."); }
  static myBuildsTitle(fbs: FbsAPI) { return fbs("我的方案", "Title text for the builds page, used as the heading of the signed-in user's saved builds."); }
  static libCountTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["共 ", fbs.param("n", pv(p, "n")), " 件"], "Count text for the gear library header, used to show the total number of stored items, where {n} is the item count."); }
  static usageTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["已存 ", fbs.param("n", pv(p, "n")), " / ", fbs.param("limit", pv(p, "limit")), " 件"], "Usage text for the gear library header, used to show stored items against capacity, where {n} is the stored count and {limit} the capacity."); }
  static usageNearLimitText(fbs: FbsAPI) { return fbs("装备库快满了，导入新装备前先清理不用的装备", "Warning text for the gear library, used when the library is close to full to prompt cleanup before importing more gear."); }
  static formSlotLabel(fbs: FbsAPI) { return fbs("部位", "Field label for the gear entry form, used for the equipment slot selector."); }
  static formNameLabel(fbs: FbsAPI) { return fbs("名称", "Field label for the gear entry form, used for the gear name input."); }
  static formNamePlaceholder(fbs: FbsAPI) { return fbs("装备名（可空）", "Placeholder text for the gear entry form, used in the name input to note that the name may stay empty."); }
  static affixPlaceholder(fbs: FbsAPI) { return fbs("选词条", "Placeholder text for the gear entry form, used in the affix selector of an affix row."); }
  static valuePlaceholder(fbs: FbsAPI) { return fbs("数值", "Placeholder text for the gear entry form, used in the value input of an affix row."); }
  static refTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["满值 ", fbs.param("max", pv(p, "max")), " / 承音 ", fbs.param("cy", pv(p, "cy"))], "Reference text for affix rows in the gear entry form, used to show the affix ceiling and resonance value, where {max} is the maximum roll and {cy} the resonance (chengyin) value."); }
  static fillMaxLabel(fbs: FbsAPI) { return fbs("填满值", "Button label for affix rows in the gear entry form, used to fill the value input with the maximum roll."); }
  static fillCyLabel(fbs: FbsAPI) { return fbs("填承音", "Button label for affix rows in the gear entry form, used to fill the value input with the resonance value."); }
  static delRowLabel(fbs: FbsAPI) { return fbs("删此行", "Button label for affix rows in the gear entry form, used to delete the row."); }
  static addRowLabel(fbs: FbsAPI) { return fbs("加一行", "Button label for the gear entry form, used to add another affix row."); }
  static dyNameLabel(fbs: FbsAPI) { return fbs("定音名称", "Field label for the pitch-setting (dingyin) affix editor, used for the dingyin name selector."); }
  static dyNamePlaceholder(fbs: FbsAPI) { return fbs("如 外功穿透 / 无名剑法·蓄力技增伤", "Placeholder text for the dingyin affix editor, used in the name field with example dingyin names."); }
  static dyValLabel(fbs: FbsAPI) { return fbs("定音数值", "Field label for the dingyin affix editor, used for the dingyin value input."); }
  static schoolsLabel(fbs: FbsAPI) { return fbs("流派标签（武器）", "Field label for the gear entry form, used for the sect tag selector shown on weapon entries."); }
  static addGearLabel(fbs: FbsAPI) { return fbs("存入装备库", "Button label for the gear entry form, used to save a new item into the library."); }
  static entryLabel(fbs: FbsAPI) { return fbs("录入装备", "Button label that opens the equipment entry panel in the gear library."); }
  static updateGearLabel(fbs: FbsAPI) { return fbs("保存修改", "Button label for the gear entry form, used to save changes to the item being edited."); }
  static cancelEditLabel(fbs: FbsAPI) { return fbs("取消编辑", "Button label for the gear entry form, used to cancel editing and return to adding new items."); }
  static demoLabel(fbs: FbsAPI) { return fbs("载入示例套", "Button label for the gear library, used to load the demo gear set."); }
  static clearLibLabel(fbs: FbsAPI) { return fbs("清空装备库", "Button label for the gear library, used to start clearing the whole library."); }
  static clearConfirmTitle(fbs: FbsAPI) { return fbs("清空装备库？", "Title text for the clear-library confirmation, used as the confirmation dialog heading."); }
  static clearConfirmBody(fbs: FbsAPI) { return fbs("你账号下的全部装备与方案都会删除，当前搭配也会清空，此操作不可恢复。", "Body text for the clear-library confirmation, used to warn that all gear, builds and the current desk setup are deleted irreversibly."); }
  static equipLabel(fbs: FbsAPI) { return fbs("选入", "Button label for gear library cards, used to equip the item onto the build desk."); }
  static unequipLabel(fbs: FbsAPI) { return fbs("卸下", "Button label for gear library cards, used to remove the item from the build desk."); }
  static editLabel(fbs: FbsAPI) { return fbs("编辑", "Button label for gear library cards, used to load the item into the entry form for editing."); }
  static deleteLabel(fbs: FbsAPI) { return fbs("删除", "Button label for gear library cards, used to delete the item from the library."); }
  static simLabel(fbs: FbsAPI) { return fbs("模拟", "Toggle label for gear values, used for the simulated state in value displays."); }
  static simRealLabel(fbs: FbsAPI) { return fbs("实际", "Toggle label for gear values, used for the actual state in value displays."); }
  static simCyLabel(fbs: FbsAPI) { return fbs("承音", "Toggle label for gear values, used for the resonance (chengyin) simulation state."); }
  static simMaxLabel(fbs: FbsAPI) { return fbs("满值", "Toggle label for gear values, used for the maximum-roll simulation state."); }
  static verdictHeirloom(fbs: FbsAPI) { return fbs("传家宝", "Verdict label for gear scoring, used for a top-tier scoring result on a gear card."); }
  static verdictDud(fbs: FbsAPI) { return fbs("拉完了", "Verdict label for gear scoring, used for a bottom-tier scoring result on a gear card."); }
  static scoreTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["评分 ", fbs.param("score", pv(p, "score"))], "Score text for gear cards, used to show the computed score of an item, where {score} is the numeric score."); }
  static qualityLabel(fbs: FbsAPI) { return fbs("数值达成", "Label for the gear quality meter, used for the roll achievement ratio on gear cards."); }
  static exportLabel(fbs: FbsAPI) { return fbs("导出数据", "Button label for the gear library, used to export the library data as a file."); }
  static exportFileName(fbs: FbsAPI) { return fbs("100阶配装数据.json", "File name for gear data exports, used as the downloaded file's name."); }
  static importNameTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["导入 · ", fbs.param("slot", pv(p, "slot"))], "Name pattern for imported gear items, used to name an item created by import, where {slot} is the slot name."); }
  static importLabel(fbs: FbsAPI) { return fbs("导入数据", "Button label for the gear library, used to open the import flow."); }
  static importFailedToast(fbs: FbsAPI) { return fbs("导入失败：文件无效", "Toast message for gear import, used when the imported file is invalid."); }
  static importedToastTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["已导入 ", fbs.param("n", pv(p, "n")), " 件"], "Toast message for gear import, used after items are imported, where {n} is the number of imported items."); }
  static manualTitle(fbs: FbsAPI) { return fbs("手动录入", "Title text for the manual entry section of the gear page, used above the entry form."); }
  static pasteTitle(fbs: FbsAPI) { return fbs("粘贴代码导入", "Title text for the paste import section of the gear page, used above the code paste box."); }
  static pastePlaceholder(fbs: FbsAPI) { return fbs("把装备数据代码粘到这里（JSON / Base64 / 文本均可）", "Placeholder text for the paste import box, used to explain that gear data code in JSON, Base64 or plain text form can be pasted."); }
  static pasteButtonLabel(fbs: FbsAPI) { return fbs("解析并导入装备库", "Button label for the paste import section, used to parse the pasted code and import the gear."); }
  static pasteDemoLabel(fbs: FbsAPI) { return fbs("填入示例代码", "Button label for the paste import section, used to fill the box with example code."); }
  static pasteEmptyText(fbs: FbsAPI) { return fbs("先把代码粘到上面的框里再点解析。", "Hint text for the paste import section, used when the parse button is pressed with an empty box."); }
  static pasteOkTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["✓ 已按「", fbs.param("mode", pv(p, "mode")), "」解析，导入 ", fbs.param("n", pv(p, "n")), " 件装备 / ", fbs.param("lines", pv(p, "lines")), " 条词条，已自动选入搭配。"], "Success text for paste import, used to report the parse mode, the imported item and affix counts and the auto-equip result, where {mode} is the detected code format, {n} the item count and {lines} the affix line count."); }
  static pasteUnknownTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["另有 ", fbs.param("n", pv(p, "n")), " 条没认出的字段被跳过（多半是气血、防御、外功穿透这类本站不计的词条）。"], "Note text for paste import, used to report fields that were skipped as unrecognized, where {n} is the number of skipped fields."); }
  static pasteFailText(fbs: FbsAPI) { return fbs("没能从这段代码里认出装备。常见原因：复制时漏了一头一尾、复制的是角色外观分享码（不含装备数值）、或这份数据的字段格式本站还没适配。", "Error text for paste import, used when no gear can be recognized in the pasted code, listing common causes such as truncated copies or appearance share codes."); }
  static pasteFullText(fbs: FbsAPI) { return fbs("识别为本工具导出的数据，已按整库导入处理。", "Note text for paste import, used when the pasted code is recognized as this tool's own export and handled as a whole-library import."); }
  static ocrTitle(fbs: FbsAPI) { return fbs("截图导入（本地识别，不上传）", "Title text for the single-screenshot OCR import section, used above the drop zone and to note that recognition runs locally without upload."); }
  static ocrDropText(fbs: FbsAPI) { return fbs("点这里选一张装备详情截图，或拖进来 / Ctrl+V 粘贴", "Prompt text for the OCR drop zone, used to invite clicking, dragging or pasting a gear detail screenshot."); }
  static ocrPreparingText(fbs: FbsAPI) { return fbs("正在准备图片…", "Progress text for OCR import, used while the image is being prepared."); }
  static ocrRunningText(fbs: FbsAPI) { return fbs("正在识别（首次会下载中文 + 英文识别包，可能要十几秒）…", "Progress text for OCR import, used during the first recognition pass, noting the first-run language pack download."); }
  static ocrSecondText(fbs: FbsAPI) { return fbs("正在增强识别（第二遍）…", "Progress text for OCR import, used during the enhanced second recognition pass."); }
  static ocrFailedText(fbs: FbsAPI) { return fbs("识别失败了。常见原因：网络不通下不到识别包、图片太模糊。可以换一张更清晰、完整的详情页截图再试。", "Error text for OCR import, used when recognition fails, with common causes and the alternative import routes."); }
  static ocrBadTypeText(fbs: FbsAPI) { return fbs("这张图格式不对，只支持 PNG / JPEG / WebP 截图。", "Error text for OCR import, used when the chosen file is not a PNG, JPEG or WebP screenshot."); }
  static ocrTooBigText(fbs: FbsAPI) { return fbs("图片超过 15MB，换一张小一点的截图。", "Error text for OCR import, used when the screenshot exceeds the 15 MB size limit."); }
  static ocrNoEngineText(fbs: FbsAPI) { return fbs("识别组件没能加载（OCR 引擎需要联网从 CDN 载入）。检查网络后刷新页面再试；粘贴代码导入不受影响。", "Error text for OCR import, used when the OCR engine cannot load from the CDN, suggesting a network check and the paste import fallback."); }
  static ocrDoneTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["✓ 识别完成：认出 ", fbs.param("n", pv(p, "n")), " 条词条", fbs.param("slotPart", pv(p, "slotPart")), fbs.param("dyPart", pv(p, "dyPart")), "。请逐行核对数值再确认存入。"], "Result text for OCR import, used after recognition to report the recognized affix count and ask the user to verify each value, where {n} is the affix count, {slotPart} an optional slot note and {dyPart} an optional dingyin note."); }
  static ocrSlotLabel(fbs: FbsAPI) { return fbs("部位", "Field label for the OCR review form, used for the recognized slot selector."); }
  static ocrNameLabel(fbs: FbsAPI) { return fbs("名称", "Field label for the OCR review form, used for the recognized name input."); }
  static ocrEquipLabel(fbs: FbsAPI) { return fbs("存入后直接选入搭配", "Checkbox label for the OCR review form, used for the option to equip the item right after saving."); }
  static ocrConfirmLabel(fbs: FbsAPI) { return fbs("确认存入", "Button label for the OCR review form, used to confirm and save the recognized item."); }
  static ocrCancelLabel(fbs: FbsAPI) { return fbs("放弃", "Button label for the OCR review form, used to discard the recognition result."); }
  static ocrUnknownTitle(fbs: FbsAPI) { return fbs("下面这些行没认出词条，已原样列出（不会丢行）：需要的话点「补一条词条行」手动加上；纯界面文字可忽略。", "Title text for the OCR unknown lines box, used above raw unrecognized lines that are preserved for manual fixing."); }
  static ocrSavedTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["✓ 已存入装备库：", fbs.param("slot", pv(p, "slot")), "（", fbs.param("n", pv(p, "n")), " 条词条）"], "Confirmation text for OCR import, used after the item is saved to the library, where {slot} is the slot name and {n} the affix count."); }
  static ocrNeedLineToast(fbs: FbsAPI) { return fbs("至少保留一条有效词条再确认", "Toast message for the OCR review form, used when confirming with no valid affix lines left."); }
  static ocrLowConfTag(fbs: FbsAPI) { return fbs("低置信，请核对", "Tag text for OCR review rows, used to flag a low-confidence recognition that needs checking."); }
  static ocrAddRowLabel(fbs: FbsAPI) { return fbs("补一条词条行", "Button label for the OCR review form, used to add a blank affix row manually."); }
  static ocrImportSlotTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["导入", fbs.param("slot", pv(p, "slot"))], "Button label for OCR batch entries, used to import the entry, where {slot} is the slot name."); }
  static ocrBatchTitle(fbs: FbsAPI) { return fbs("批量截图识别（全屏截图自动框选 · 本地识别，不上传）", "Title text for the batch screenshot recognition section, used above the batch drop zone and to note local processing with automatic panel detection."); }
  static ocrBatchDropText(fbs: FbsAPI) { return fbs("把多张截图拖到这里，或点选多张 / Ctrl+V 粘贴（全屏截图也可以，会自动找装备面板）", "Prompt text for the batch OCR drop zone, used to invite dragging, selecting or pasting multiple screenshots including full-screen captures."); }
  static ocrBatchQueuedText(fbs: FbsAPI) { return fbs("排队中", "Status text for batch OCR entries, used while an entry waits in the recognition queue."); }
  static ocrBatchRunningText(fbs: FbsAPI) { return fbs("识别中…", "Status text for batch OCR entries, used while recognition is running."); }
  static ocrBatchReadyText(fbs: FbsAPI) { return fbs("待核对", "Status text for batch OCR entries, used when recognition finished and the entry awaits review."); }
  static ocrBatchFailedText(fbs: FbsAPI) { return fbs("识别失败", "Status text for batch OCR entries, used when recognition failed for the entry."); }
  static ocrBatchImportedText(fbs: FbsAPI) { return fbs("已导入", "Status text for batch OCR entries, used after the entry is imported into the library."); }
  static ocrBatchRetryLabel(fbs: FbsAPI) { return fbs("重试", "Button label for batch OCR entries, used to retry recognition for a failed entry."); }
  static ocrBatchRemoveLabel(fbs: FbsAPI) { return fbs("移除", "Button label for batch OCR entries, used to remove the entry from the batch."); }
  static ocrBatchAdjustLabel(fbs: FbsAPI) { return fbs("调整框选", "Button label for batch OCR entries, used to open the crop region editor."); }
  static ocrBatchApplyBoxLabel(fbs: FbsAPI) { return fbs("按此框重新识别", "Button label for the batch OCR crop editor, used to re-run recognition with the adjusted region."); }
  static ocrBatchDetectedText(fbs: FbsAPI) { return fbs("已自动框选面板", "Note text for batch OCR entries, used when the gear panel was located automatically in a full-screen screenshot."); }
  static ocrBatchFullImageText(fbs: FbsAPI) { return fbs("未定位到面板，按整图识别", "Note text for batch OCR entries, used when no panel was located and the whole image was recognized."); }
  static ocrBatchDupTag(fbs: FbsAPI) { return fbs("重复", "Tag text for batch OCR entries, used to mark an entry as a duplicate."); }
  static ocrBatchDupLibText(fbs: FbsAPI) { return fbs("与装备库已有装备相同，默认不导入", "Note text for batch OCR entries, used when the entry matches gear already in the library and is excluded from import by default."); }
  static ocrBatchDupRowText(fbs: FbsAPI) { return fbs("与本批另一张相同，默认不导入", "Note text for batch OCR entries, used when the entry matches another screenshot in the same batch and is excluded by default."); }
  static ocrBatchIncludeLabel(fbs: FbsAPI) { return fbs("导入这件", "Checkbox label for batch OCR entries, used to include a duplicate entry in the import after all."); }
  static ocrBatchNoLinesText(fbs: FbsAPI) { return fbs("没认出词条：请核对部位、补词条行，或调整框选后重新识别（不会自动丢弃）", "Note text for batch OCR entries, used when no affixes were recognized and the entry is kept for manual fixing instead of being dropped."); }
  static ocrBatchImportTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["全部导入（", fbs.param("n", pv(p, "n")), " 件）"], "Button label for batch OCR import, used on the import-all button, where {n} is the number of entries to import."); }
  static ocrBatchResultTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["✓ 批量导入完成：已导入 ", fbs.param("n", pv(p, "n")), " 件，跳过 ", fbs.param("m", pv(p, "m")), " 件。"], "Result text for batch OCR import, used after importing to report imported and skipped counts, where {n} is the imported count and {m} the skipped count."); }
  static libEmptyText(fbs: FbsAPI) { return fbs("装备库是空的。手动录入、粘贴代码或截图识别都可以加装备。", "Empty-state text for the gear library, used when the library holds no items, listing the three ways to add gear."); }
  static equippedTag(fbs: FbsAPI) { return fbs("已选入", "Tag text for gear library cards, used to mark an item that is currently equipped on the build desk."); }
  static loadoutTitle(fbs: FbsAPI) { return fbs("组合搭配 · 8 个部位", "Title text for the loadout panel, used above the eight equipment slot cells."); }
  static autoLabel(fbs: FbsAPI) { return fbs("一键最优组合", "Button label for the loadout panel, used to auto-pick the best combination from the library."); }
  static autoDoneToast(fbs: FbsAPI) { return fbs("已拼好", "Toast message for auto-pick, used after the best combination is assembled."); }
  static autoFallbackToast(fbs: FbsAPI) { return fbs("已拼好（含兜底选装）", "Toast message for auto-pick, used when the assembled combination includes fallback picks for slots without a graded candidate."); }
  static unequipAllLabel(fbs: FbsAPI) { return fbs("全部卸下", "Button label for the loadout panel, used to clear the whole current combination."); }
  static slotEmptyText(fbs: FbsAPI) { return fbs("未选", "Placeholder text for loadout slot cells, used when no item is equipped in the slot."); }
  static panelTitle(fbs: FbsAPI) { return fbs("面板与毕业度", "Title text for the stats panel on the build desk, used above the computed panel stats and graduation figures."); }
  static gradLabel(fbs: FbsAPI) { return fbs("毕业度", "Label for the graduation meter, used for the overall graduation percentage."); }
  static gradCountLabel(fbs: FbsAPI) { return fbs("条数", "Label for the graduation breakdown, used for the affix count component."); }
  static gradValueLabel(fbs: FbsAPI) { return fbs("数值", "Label for the graduation breakdown, used for the roll value component."); }
  static gradDyLabel(fbs: FbsAPI) { return fbs("定音", "Label for the graduation breakdown, used for the dingyin component."); }
  static gradDyToggleLabel(fbs: FbsAPI) { return fbs("定音计入毕业度", "Toggle label for the graduation settings, used to include or exclude dingyin from the graduation score."); }
  static loanLabel(fbs: FbsAPI) { return fbs("满值模拟（全套满值时的毕业度）", "Label for the maximum-roll simulation, used for the simulated graduation figure when every equipped item is at maximum rolls."); }
  static simActiveTag(fbs: FbsAPI) { return fbs("模拟中", "Tag text for the stats panel, used to mark that a simulation is active."); }
  static copySummaryLabel(fbs: FbsAPI) { return fbs("复制摘要", "Button label for the stats panel, used to copy the build summary to the clipboard."); }
  static copiedToast(fbs: FbsAPI) { return fbs("已复制", "Toast message for copy actions on gear pages, used after content is copied."); }
  static copyFailedToast(fbs: FbsAPI) { return fbs("复制失败，请手动记录", "Toast message for copy actions on gear pages, used when copying fails and the user must record the content manually."); }
  static yAccLabel(fbs: FbsAPI) { return fbs("黄字精准", "Stat label for the stats panel, used for the yellow-text accuracy value."); }
  static yCritLabel(fbs: FbsAPI) { return fbs("黄字会心", "Stat label for the stats panel, used for the yellow-text critical hit value."); }
  static yIntLabel(fbs: FbsAPI) { return fbs("黄字会意", "Stat label for the stats panel, used for the yellow-text critical damage value."); }
  static finalCritLabel(fbs: FbsAPI) { return fbs("最终会心", "Stat label for the stats panel, used for the final critical hit rate."); }
  static whiteLabel(fbs: FbsAPI) { return fbs("白字", "Stat label for the stats panel, used for the flat white-text stat group."); }
  static dawaiLabel(fbs: FbsAPI) { return fbs("大外", "Stat label for the stats panel, used for the major external attack value."); }
  static xiaowaiLabel(fbs: FbsAPI) { return fbs("小外", "Stat label for the stats panel, used for the minor external attack value."); }
  static dashuLabel(fbs: FbsAPI) { return fbs("大属", "Stat label for the stats panel, used for the major elemental attack value."); }
  static xiaoshuLabel(fbs: FbsAPI) { return fbs("小属", "Stat label for the stats panel, used for the minor elemental attack value."); }
  static hpLabel(fbs: FbsAPI) { return fbs("气血", "Stat label for the stats panel, used for the health value."); }
  static defLabel(fbs: FbsAPI) { return fbs("防御", "Stat label for the stats panel, used for the defense value."); }
  static talentLabel(fbs: FbsAPI) { return fbs("天赋", "Label for the stats panel, used for the talent row."); }
  static diffTitle(fbs: FbsAPI) { return fbs("差缺清单：离毕业还差什么", "Title text for the graduation gap list, used above the list of what the build still lacks for graduation."); }
  static diffLackTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["还差 ", fbs.param("n", pv(p, "n"))], "Row text for the graduation gap list, used to show a still-missing amount, where {n} is the missing quantity with its unit."); }
  static diffExactText(fbs: FbsAPI) { return fbs("正好", "Status text for the graduation gap list, used when an affix exactly meets the recipe target."); }
  static diffOverTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["多 ", fbs.param("n", pv(p, "n"))], "Status text for the graduation gap list, used when an affix exceeds the recipe target, where {n} is the surplus quantity with its unit."); }
  static diffExtraTitle(fbs: FbsAPI) { return fbs("配方外", "Subheading for the graduation gap list, used above affixes that fall outside the recipe."); }
  static diffLowTitle(fbs: FbsAPI) { return fbs("未满承音的词条", "Subheading for the graduation gap list, used above affixes below their resonance value."); }
  static diffDoneText(fbs: FbsAPI) { return fbs("✓ 毕业。", "Status text for the graduation gap list, used when the build has graduated."); }
  static diffEmptyText(fbs: FbsAPI) { return fbs("还没选装备。", "Empty-state text for the graduation gap list, used when no gear is equipped yet."); }
  static diffInvalidTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["异常：", fbs.param("n", pv(p, "n")), " 条无相在非武器部位，未计入。"], "Warning text for the graduation gap list, used to report formless affixes on non-weapon slots that are excluded from the score, where {n} is the number of such lines."); }
  static suggestTitle(fbs: FbsAPI) { return fbs("建议", "Title text for the build suggestions box, used above the improvement suggestions."); }
  static suggestSwapTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("slot", pv(p, "slot")), "：换上「", fbs.param("name", pv(p, "name")), "」"], "Suggestion text for the build desk, used to propose swapping in a library item, where {slot} is the slot name and {name} the candidate item name."); }
  static suggestWashTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("slot", pv(p, "slot")), "：把第 ", fbs.param("line", pv(p, "line")), " 条 ", fbs.param("from", pv(p, "from")), " 洗成 ", fbs.param("to", pv(p, "to"))], "Suggestion text for the build desk, used to propose reforging one affix line into another, where {slot} is the slot name, {line} the line number, {from} the current affix and {to} the target affix."); }
  static suggestNoneText(fbs: FbsAPI) { return fbs("这套暂时挑不出毛病", "Status text for the build suggestions box, used when no improvement can be suggested for the current build."); }
  static suggestHeadTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["当前 ", fbs.param("cur", pv(p, "cur")), "% → 全做 ", fbs.param("final", pv(p, "final")), "%"], "Heading text for the build suggestions box, used to show the graduation gain if every suggestion is applied, where {cur} is the current percentage and {final} the projected one."); }
  static dySummaryTitle(fbs: FbsAPI) { return fbs("定音汇总", "Title text for the dingyin summary box, used above the per-weapon dingyin tallies."); }
  static dyCorrectText(fbs: FbsAPI) { return fbs("对", "Status text for dingyin rows, used when a dingyin entry matches the expected type."); }
  static dyWrongText(fbs: FbsAPI) { return fbs("类型不符", "Status text for dingyin rows, used when a dingyin entry's type does not match its weapon."); }
  static schemeTitle(fbs: FbsAPI) { return fbs("配装方案对比", "Title text for the build schemes section, used above the saved build comparison list."); }
  static schemeSaveLabel(fbs: FbsAPI) { return fbs("存为方案", "Button label for the build schemes section, used to save the current desk setup as a scheme."); }
  static schemeNameTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["方案 ", fbs.param("n", pv(p, "n"))], "Name pattern for saved build schemes, used as the default name of a new scheme, where {n} is the scheme number."); }
  static schemeLoadLabel(fbs: FbsAPI) { return fbs("载入", "Button label for saved build schemes, used to load a scheme onto the build desk."); }
  static schemeDeleteLabel(fbs: FbsAPI) { return fbs("删除", "Button label for saved build schemes, used to delete a scheme."); }
  static schemeEmptyText(fbs: FbsAPI) { return fbs("还没有保存的方案。", "Empty-state text for the build schemes section, used when no schemes are saved yet."); }
  static schemeComposeFirstText(fbs: FbsAPI) { return fbs("先在配装台拼好一套搭配，才能存为方案。", "Hint text for the build schemes section, used when saving is attempted with an empty desk setup."); }
  static schemeSavedToastTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["已存方案：", fbs.param("name", pv(p, "name"))], "Toast message for build schemes, used after a scheme is saved, where {name} is the scheme name."); }
  static schemeLoadedToastTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["已载入：", fbs.param("name", pv(p, "name"))], "Toast message for build schemes, used after a scheme is loaded, where {name} is the scheme name."); }
  static schemeGroupCountTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("n", pv(p, "n")), " 套"], "Count text for build scheme groups, used to show how many schemes a group holds, where {n} is the scheme count."); }
  static shareLabel(fbs: FbsAPI) { return fbs("分享", "Button label for build sharing, used to create or show the public share link of the current build."); }
  static revokeShareLabel(fbs: FbsAPI) { return fbs("取消分享", "Button label for build sharing, used to revoke the public share link."); }
  static copyLinkLabel(fbs: FbsAPI) { return fbs("复制链接", "Button label for build sharing, used to copy the public share link."); }
  static shareRevokedToast(fbs: FbsAPI) { return fbs("已取消分享，旧链接已失效", "Toast message for build sharing, used after the share link is revoked and the old link stops working."); }
  static quickTitle(fbs: FbsAPI) { return fbs("三率速算器", "Title text for the quick stat calculator, used above the standalone three-rate calculator."); }
  static quickResLabel(fbs: FbsAPI) { return fbs("抗性", "Field label for the quick stat calculator, used for the resistance input."); }
  static quickSyncLabel(fbs: FbsAPI) { return fbs("从配装台同步", "Button label for the quick stat calculator, used to import the current build desk stats."); }
  static quickSyncedToast(fbs: FbsAPI) { return fbs("已同步", "Toast message for the quick stat calculator, used after desk stats are imported."); }
  static quickOkText(fbs: FbsAPI) { return fbs("✓ 已满值", "Status text for quick calculator results, used when a rate has reached its cap."); }
  static quickOverTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["，溢出 ", fbs.param("v", pv(p, "v")), "%"], "Status text for quick calculator results, used to report overflow past a cap, where {v} is the overflow percentage."); }
  static quickGapTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["还差白字 ", fbs.param("lack", pv(p, "lack")), "%（满值 ", fbs.param("need", pv(p, "need")), "%）≈ ", fbs.param("bars", pv(p, "bars")), " 条", fbs.param("barName", pv(p, "barName"))], "Result text for the quick calculator, used to report the remaining flat-stat gap and its affix-line estimate, where {lack} is the missing percentage, {need} the cap value, {bars} the estimated line count and {barName} the line type."); }
  static recipesTitle(fbs: FbsAPI) { return fbs("全流派配方表（100 阶 · 承音）", "Title text for the all-sect recipe table, used above the tier-100 resonance recipe reference table."); }
  static recipeSearchPlaceholder(fbs: FbsAPI) { return fbs("搜流派 / 套装 / 词条", "Placeholder text for the recipe table search box, used to prompt searching by sect, set or affix."); }
  static recipeAllLabel(fbs: FbsAPI) { return fbs("全部", "Filter label for the recipe table, used for the choice that shows all categories."); }
  static recipeColCat(fbs: FbsAPI) { return fbs("类别", "Column header for the recipe table, used for the category column."); }
  static recipeColSchool(fbs: FbsAPI) { return fbs("流派", "Column header for the recipe table, used for the sect column."); }
  static recipeColSet(fbs: FbsAPI) { return fbs("套装", "Column header for the recipe table, used for the set column."); }
  static recipeColRecipe(fbs: FbsAPI) { return fbs("词条搭配（承音）", "Column header for the recipe table, used for the affix combination column at resonance value."); }
  static recipeColBow(fbs: FbsAPI) { return fbs("推荐弓", "Column header for the recipe table, used for the recommended bow column."); }
  static recipeSetTargetLabel(fbs: FbsAPI) { return fbs("设为目标", "Button label for recipe table rows, used to set the row's sect recipe as the build desk target."); }
  static recipeEmptyText(fbs: FbsAPI) { return fbs("没有符合的配方。", "Empty-state text for the recipe table, used when no recipe matches the current filter."); }
  static recipeTargetToastTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["目标已设为：", fbs.param("school", pv(p, "school")), " · ", fbs.param("set", pv(p, "set"))], "Toast message for the recipe table, used after a recipe becomes the desk target, where {school} is the sect name and {set} the set name."); }
  static sectRecipesTitle(fbs: FbsAPI) { return fbs("100 阶配方（配装台口径）", "Title text for the per-sect recipe table on sect detail pages, used above the tier-100 recipes in build desk conventions."); }
  static affixTableTitle(fbs: FbsAPI) { return fbs("词条满值 / 承音对照表（配装台）", "Title text for the affix reference table, used above the maximum and resonance value comparison table."); }
  static colCyLabel(fbs: FbsAPI) { return fbs("承音", "Column header for gear reference tables, used for the resonance (chengyin) value column."); }
  static colCyPctLabel(fbs: FbsAPI) { return fbs("承音/满值", "Column header for gear reference tables, used for the resonance-to-maximum ratio column."); }
  static colRecipeNamesLabel(fbs: FbsAPI) { return fbs("配方叫法", "Column header for gear reference tables, used for the recipe naming column."); }
  static survivalNote(fbs: FbsAPI) { return fbs("生存向，配方未列", "Note text for recipe tables, used on survival-oriented rows that the recipe does not list."); }
  static slotTableTitle(fbs: FbsAPI) { return fbs("部位版位表（配装台）", "Title text for the slot layout table, used above the per-slot affix position reference table."); }
  static slotsBigTitle(fbs: FbsAPI) { return fbs("大外流派", "Subheading for the slot layout table, used above the major-external sect layouts."); }
  static slotsSmallTitle(fbs: FbsAPI) { return fbs("小外流派", "Subheading for the slot layout table, used above the minor-external sect layouts."); }
  static formulaTitle(fbs: FbsAPI) { return fbs("公式与五维换算速查", "Title text for the formula reference card, used above the conversion formulas and stat reference."); }
  static formulaRatesTitle(fbs: FbsAPI) { return fbs("三率换算", "Subheading for the formula reference card, used above the three-rate conversion formulas."); }
  static formulaDimsTitle(fbs: FbsAPI) { return fbs("五维换算（每 1 点）", "Subheading for the formula reference card, used above the five-dimension conversion table."); }
  static formulaOrderTitle(fbs: FbsAPI) { return fbs("选装顺序", "Subheading for the formula reference card, used above the gearing order advice."); }
  static formulaAccTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["黄字精准 = 65% +（白字精准 − 65%）÷ 抗性，白字 ", fbs.param("white", pv(p, "white")), "% 满值 100%。"], "Formula text for the accuracy conversion, used in the formula reference card to show how yellow-text accuracy derives from the flat value divided by resistance, where {white} is the current flat accuracy percentage."); }
  static formulaCritTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["黄字会心 = 白字会心 ÷ 抗性，白字 ", fbs.param("white", pv(p, "white")), "% 满值 80%。"], "Formula text for the critical hit conversion, used in the formula reference card to show how yellow-text critical hit derives from the flat value divided by resistance, where {white} is the current flat critical percentage."); }
  static formulaIntTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["黄字会意 = 白字会意 ÷ 抗性，白字 ", fbs.param("white", pv(p, "white")), "% 满值 40%。"], "Formula text for the critical damage conversion, used in the formula reference card to show how yellow-text critical damage derives from the flat value divided by resistance, where {white} is the current flat critical damage percentage."); }
  static formulaBarsTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["差几条估算（按承音每条）：精准 ", fbs.param("acc", pv(p, "acc")), " / 会心 ", fbs.param("crit", pv(p, "crit")), " / 会意 ", fbs.param("int", pv(p, "int")), "；敏补会心 ≈ +", fbs.param("minCrit", pv(p, "minCrit")), "% 白字 / 条，势补会意 ≈ +", fbs.param("shiInt", pv(p, "shiInt")), "% 白字 / 条。"], "Estimate text for the formula reference card, used to show how many resonance lines each rate still needs and the agility-accuracy conversion, where {acc}, {crit} and {int} are the estimated line counts."); }
  static formulaBowTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["弓（弓玦）加成计入白字：精准弓 白字精准 +", fbs.param("acc", pv(p, "acc")), " / 会心弓 白字会心 +", fbs.param("crit", pv(p, "crit")), " / 会意弓 白字会意 +", fbs.param("int", pv(p, "int")), "，再按抗性换算黄字。抗性 ", fbs.param("res", pv(p, "res")), "（当前版本）。"], "Formula text for bow bonuses, used in the formula reference card to explain that bow jade bonuses count into flat stats, where {acc} is the accuracy bow bonus and {crit} the critical bow bonus."); }
  static formulaOrderText(fbs: FbsAPI) { return fbs("定流派 → 对配方 → 录装备。一键最优拼一版 → 看差缺清单补缺。精准先堆满 100%；会心 148% / 会意 74% 封顶，溢出换劲 / 势 / 增伤。两套拿不准，存方案比总分。", "Advice text for the formula reference card, used as the gearing order guide covering target setting, recipe matching, auto-pick and gap filling."); }
  static colDimLabel(fbs: FbsAPI) { return fbs("五维", "Column header for the dimension conversion table, used for the five-dimension name column."); }
  static colConvLabel(fbs: FbsAPI) { return fbs("换算", "Column header for the dimension conversion table, used for the per-point conversion column."); }
  static colFullBarTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["满条 ", fbs.param("v", pv(p, "v")), " 折合"], "Column header pattern for the dimension conversion table, used for a full-line equivalent column, where {v} is the full-line value."); }
  static calcFailedText(fbs: FbsAPI) { return fbs("计算失败，请稍后再试", "Error text for gear calculation, used when a graduation calculation request fails."); }
  static demoLoadedToast(fbs: FbsAPI) { return fbs("示例已载入", "Toast message for the gear library, used after the demo gear set is loaded."); }
  static savedToastTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["已存入：", fbs.param("name", pv(p, "name"))], "Toast message for the gear library, used after an item is saved, where {name} is the item name."); }
  static deletedToast(fbs: FbsAPI) { return fbs("已删除", "Toast message for the gear library, used after an item is deleted."); }
  static clearedToast(fbs: FbsAPI) { return fbs("已清空", "Toast message for the gear library, used after the whole library is cleared."); }
}

export abstract class BuildshareFbtUtils {
  static kicker(fbs: FbsAPI) { return fbs("装备方案 · 公开分享", "Kicker text for the public gear-build share page, used above the title to identify the page as a shared gear build."); }
  static loginLabel(fbs: FbsAPI) { return fbs("打开燕云百业", "Button label for the public gear-build share page, used to open the main app and its login flow."); }
  static notFoundTitle(fbs: FbsAPI) { return fbs("链接已失效", "Title text for the build share error state, used when a share link is invalid or has been revoked."); }
  static notFoundBody(fbs: FbsAPI) { return fbs("这条分享链接不存在，或已被方案主人取消分享。", "Body text for the build share error state, used to explain that the share link does not exist or the owner has stopped sharing."); }
  static xinfaLabel(fbs: FbsAPI) { return fbs("心法", "Field label for the public gear-build share page, used for the inner art (xinfa) slot in the shared build."); }
}

