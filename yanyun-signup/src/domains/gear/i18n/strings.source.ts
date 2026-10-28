/* fbtee declaration surface for the gear domain (hand-maintained): this
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

export abstract class TiaolvFbtUtils {
  static intro(fbs: FbsAPI) { return fbs("调律推演 · 复刻 bilibili@片雲 DIY 0.10.2（100级）伤害计算器逻辑", "Intro line of the tuning (tiaolv) deduction tool, crediting the replicated bilibili creator calculator logic and its data version."); }
  static innerSkill(fbs: FbsAPI, p?: StringParams) { return fbs(["心法", fbs.param("n", pv(p, "n"))], "Label of one inner art (xinfa) input row in the tuning deduction tool; {n} is the row number."); }
  static innerSkillPlaceholder(fbs: FbsAPI) { return fbs("心法名", "Placeholder text of an inner art name input in the tuning deduction tool."); }
  static wuxue(fbs: FbsAPI) { return fbs("武学", "Label of the martial arts set selector in the tuning deduction tool."); }
  static wuku(fbs: FbsAPI) { return fbs("武库", "Label of the arsenal (wuku) selector in the tuning deduction tool."); }
  static wukuSelf(fbs: FbsAPI) { return fbs("本系", "Option in the arsenal selector for the sect's own arsenal."); }
  static wukuCommon(fbs: FbsAPI) { return fbs("通用", "Option in the arsenal selector for the shared common arsenal."); }
  static suit(fbs: FbsAPI) { return fbs("套装", "Label of the gear set selector in the tuning deduction tool."); }
  static bow(fbs: FbsAPI) { return fbs("弓决", "Label of the bow-jue selector in the tuning deduction tool."); }
  static none(fbs: FbsAPI) { return fbs("无", "Selector option meaning nothing is equipped or selected, used across the gear and tuning tools."); }
  static tuneArea(fbs: FbsAPI) { return fbs("调律区（K:R 列，对应 Excel K3:R5, K6:R24）", "Heading of the tuning parameter area in the tuning deduction tool, referencing the corresponding spreadsheet column range."); }
  static calc(fbs: FbsAPI) { return fbs("开始推演", "Button label that runs the tuning deduction calculation."); }
  static calculating(fbs: FbsAPI) { return fbs("推演中…", "Button label while the tuning deduction calculation is running."); }
  static toastFailed(fbs: FbsAPI) { return fbs("计算失败", "Toast shown when the tuning deduction calculation fails."); }
  static toastFailedWith(fbs: FbsAPI, p?: StringParams) { return fbs(["计算失败：", fbs.param("error", pv(p, "error"))], "Toast shown when the tuning deduction calculation fails; {error} is the error message."); }
  static colAttr(fbs: FbsAPI) { return fbs("属性", "Column header in the tuning deduction result table for the attribute name."); }
  static colBase(fbs: FbsAPI) { return fbs("基础白值", "Column header in the tuning deduction result table for the base white value of an attribute."); }
  static colPanel(fbs: FbsAPI) { return fbs("面板白值", "Column header in the tuning deduction result table for the panel white value of an attribute."); }
  static colFinal(fbs: FbsAPI) { return fbs("最终面板", "Column header in the tuning deduction result table for the final panel value of an attribute."); }
}

export abstract class GradFbtUtils {
  static entering(fbs: FbsAPI) { return fbs("正在进入武库…", "Loading text shown while the gear appraisal (arsenal) tool is initializing."); }
  static title(fbs: FbsAPI) { return fbs("武库鉴宝", "Title of the gear graduation appraisal tool."); }
  static subtitle(fbs: FbsAPI) { return fbs("条数50% · 数值30% · 三率20%", "Subtitle of the appraisal tool stating the scoring weights: affix line match 50 percent, value attainment 30 percent, three-rate attainment 20 percent."); }
  static mingjinNote(fbs: FbsAPI) { return fbs("鸣金 · 大外会意流", "Note on the appraisal tool for the Mingjin sect, whose build is a big-external crit-damage style."); }
  static buildBig(fbs: FbsAPI) { return fbs("大外", "Build variant label in the appraisal tool for the big-external (two-handed external) variant."); }
  static buildSmall(fbs: FbsAPI) { return fbs("小外", "Build variant label in the appraisal tool for the small-external variant."); }
  static ringLabel(fbs: FbsAPI) { return fbs("毕业率", "Label under the graduation-rate ring on the appraisal tool."); }
  static scoreCount(fbs: FbsAPI) { return fbs("条数匹配", "Name of the affix line-match component of the appraisal score."); }
  static scoreValue(fbs: FbsAPI) { return fbs("数值达成", "Name of the value attainment component of the appraisal score."); }
  static scoreRate(fbs: FbsAPI) { return fbs("三率达标", "Name of the three-rate attainment component of the appraisal score."); }
  static tier1(fbs: FbsAPI) { return fbs("天人合一", "Top appraisal tier name for a graduation score in the highest band."); }
  static tier2(fbs: FbsAPI) { return fbs("登峰造极", "Appraisal tier name for a graduation score in the second band."); }
  static tier3(fbs: FbsAPI) { return fbs("炉火纯青", "Appraisal tier name for a graduation score in the third band."); }
  static tier4(fbs: FbsAPI) { return fbs("小有所成", "Appraisal tier name for a graduation score in the fourth band."); }
  static tier5(fbs: FbsAPI) { return fbs("初窥门径", "Appraisal tier name for a graduation score in the fifth band."); }
  static tier6(fbs: FbsAPI) { return fbs("凡铁未炼", "Appraisal tier name for a graduation score in the lowest band."); }
  static tapHint(fbs: FbsAPI) { return fbs("轻触装备以镌刻词条", "Hint in the appraisal tool telling the user to tap a gear piece to inscribe its affixes."); }
  static refTitle(fbs: FbsAPI) { return fbs("📖 参考数据 · 词条满值与版位", "Heading of the reference data section in the appraisal tool, covering affix maximum values and slot layouts."); }
  static maxTableTitle(fbs: FbsAPI) { return fbs("词条满值表（100阶）", "Title of the reference table listing maximum values of every affix at tier 100."); }
  static colAffix(fbs: FbsAPI) { return fbs("词条", "Column header in the affix maximum table for the affix name."); }
  static colMax(fbs: FbsAPI) { return fbs("满值", "Column header in the affix maximum table for the maximum value."); }
  static colResonance(fbs: FbsAPI) { return fbs("承音（95%)", "Column header in the affix maximum table for the chengyin value at 95 percent."); }
  static slotTableTitle(fbs: FbsAPI, p?: StringParams) { return fbs(["部位版位表（", fbs.param("build", pv(p, "build")), "）"], "Title of the reference table showing which main and sub affix slots each equipment position can roll; {build} is the build variant name."); }
  static rateTitle(fbs: FbsAPI) { return fbs("⚡ 三率速算", "Heading of the three-rate quick calculator in the appraisal tool."); }
  static rateOk(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("v", pv(p, "v")), " ✓"], "Rate result line when a rate target is met; {v} is the reached value formatted with one decimal and a percent sign."); }
  static rateGap(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("v", pv(p, "v")), " （差", fbs.param("gap", pv(p, "gap")), "）"], "Rate result line when a rate target is not met; {v} is the reached value and {gap} the remaining gap, both formatted with percent."); }
  static rateOverflow(fbs: FbsAPI, p?: StringParams) { return fbs(["⚠️ 会心+会意=", fbs.param("sum", pv(p, "sum")), ">100，会意挤占会心"], "Warning in the three-rate calculator when crit plus crit damage exceed 100 and crit damage squeezes out crit; {sum} is their formatted sum."); }
  static compareTitle(fbs: FbsAPI) { return fbs("⚔️ 方案对比", "Heading of the build comparison section in the appraisal tool."); }
  static saveScheme(fbs: FbsAPI) { return fbs("💾 保存当前配装为方案", "Button label that saves the currently entered gear as a named scheme in the appraisal tool."); }
  static schemeName(fbs: FbsAPI, p?: StringParams) { return fbs(["方案", fbs.param("n", pv(p, "n"))], "Default name of a saved scheme in the appraisal tool; {n} is the scheme number."); }
  static noSchemes(fbs: FbsAPI) { return fbs("暂无方案，先填好装备再保存", "Empty-state text in the scheme list: fill in gear first, then save."); }
  static load(fbs: FbsAPI) { return fbs("载入", "Button label that loads a saved scheme into the appraisal tool."); }
  static deleteScheme(fbs: FbsAPI) { return fbs("删除方案", "Button label that deletes a saved scheme in the appraisal tool."); }
  static itemScore(fbs: FbsAPI, p?: StringParams) { return fbs(["本件 ", fbs.param("score", pv(p, "score")), "%"], "Per-piece score line on a gear piece in the appraisal tool; {score} is that piece's graduation percentage."); }
  static rowMain(fbs: FbsAPI) { return fbs("主词条", "Row label for the main affix of a gear piece in the appraisal tool editor."); }
  static rowSub(fbs: FbsAPI, p?: StringParams) { return fbs(["副词条", fbs.param("n", pv(p, "n"))], "Row label for one sub affix of a gear piece in the appraisal tool editor; {n} is the sub affix index."); }
  static rowResonance(fbs: FbsAPI) { return fbs("定音", "Row label for the tuning (dingyin) affix of a gear piece in the appraisal tool editor."); }
  static ratePrecision(fbs: FbsAPI) { return fbs("精准", "Name of the accuracy rate in the three-rate quick calculator."); }
  static rateCrit(fbs: FbsAPI) { return fbs("会心", "Name of the crit rate in the three-rate quick calculator."); }
  static rateAffinity(fbs: FbsAPI) { return fbs("会意", "Name of the crit damage rate in the three-rate quick calculator."); }
  static affixPlaceholder(fbs: FbsAPI) { return fbs("— 待镌刻 —", "Placeholder on an empty affix slot of a gear piece in the appraisal tool, prompting the user to inscribe an affix."); }
  static affixLoading(fbs: FbsAPI) { return fbs("词条数据加载中…", "Loading text shown in the appraisal tool while affix data is loading."); }
  static valuePlaceholderMax(fbs: FbsAPI, p?: StringParams) { return fbs(["数值 / ", fbs.param("max", pv(p, "max"))], "Placeholder of an affix value input in the appraisal tool; {max} is the maximum value of the chosen affix."); }
  static valuePlaceholder(fbs: FbsAPI) { return fbs("数值", "Placeholder of an affix value input in the appraisal tool when no affix is chosen yet."); }
  static resonance(fbs: FbsAPI) { return fbs("承音", "Short label of the chengyin (resonance) value shown next to affix values in the appraisal tool."); }
  static overMax(fbs: FbsAPI, p?: StringParams) { return fbs(["超过满值 ", fbs.param("max", pv(p, "max")), "，将按满值计算"], "Note under an affix value input when the entered value exceeds the maximum; {max} is the maximum and the calculation clamps to it."); }
  static toastSaved(fbs: FbsAPI, p?: StringParams) { return fbs(["已保存方案「", fbs.param("name", pv(p, "name")), "」"], "Toast shown after a scheme is saved in the appraisal tool; {name} is the scheme name."); }
  static toastLoaded(fbs: FbsAPI, p?: StringParams) { return fbs(["已载入方案「", fbs.param("name", pv(p, "name")), "」"], "Toast shown after a scheme is loaded in the appraisal tool; {name} is the scheme name."); }
  static toastOldScheme(fbs: FbsAPI) { return fbs("旧方案只保存了分数，无法载入配装", "Toast shown when loading a legacy scheme that only stored a score and no gear data."); }
}

export abstract class GearFbtUtils {
  static calcLabel(fbs: FbsAPI) { return fbs("计算", "Button label that runs the gear panel calculation in the gear tools."); }
  static benchTitle(fbs: FbsAPI) { return fbs("配装台", "Title of the build bench (gear planner) section."); }
  static benchIntro(fbs: FbsAPI) { return fbs("100 阶配装：按流派配方拼装备、算面板与毕业度（口径：条数 40% + 数值 24% + 定音 20%，与上方毕业计算的口径不同）。装备库与方案保存在你的 Discord 账号下，换设备也能用。", "Intro of the build bench: tier-100 builds follow sect recipes with their own graduation weights, and the gear library and schemes are stored under the user's Discord account across devices."); }
  static targetLabel(fbs: FbsAPI) { return fbs("目标流派", "Label of the target sect selector on the build bench."); }
  static bowLabel(fbs: FbsAPI) { return fbs("弓玦", "Label of the bow-jue selector on the build bench."); }
  static bowNoneLabel(fbs: FbsAPI) { return fbs("无", "Option in the bow selector meaning no bow-jue is equipped."); }
  static extrasTitle(fbs: FbsAPI) { return fbs("其他来源加成", "Title of the extra bonuses section on the build bench, for bonuses from sources outside the eight gear slots."); }
  static resLabel(fbs: FbsAPI) { return fbs("抗性", "Label of the resistance input used by the three-rate conversion on the build bench."); }
  static extraAccLabel(fbs: FbsAPI) { return fbs("白字精准（手填）", "Label of the manually entered extra white accuracy bonus in the extras section."); }
  static extraCritLabel(fbs: FbsAPI) { return fbs("白字会心（手填）", "Label of the manually entered extra white crit bonus in the extras section."); }
  static extraIntLabel(fbs: FbsAPI) { return fbs("白字会意（手填）", "Label of the manually entered extra white crit damage bonus in the extras section."); }
  static baseTitle(fbs: FbsAPI) { return fbs("角色基础", "Title of the character base stats section on the build bench."); }
  static unlockLabel(fbs: FbsAPI) { return fbs("解锁", "Button label that unlocks a base stat row for editing on the build bench."); }
  static lockLabel(fbs: FbsAPI) { return fbs("锁定", "Button label that locks a base stat row on the build bench."); }
  static modifiedTag(fbs: FbsAPI) { return fbs("已改", "Tag on a base stat row that has been changed from its preset value."); }
  static baseResetLabel(fbs: FbsAPI) { return fbs("恢复预设", "Button label that restores character base stats to preset values."); }
  static baseResetTitle(fbs: FbsAPI) { return fbs("恢复预设？", "Title of the confirmation dialog for resetting character base stats."); }
  static baseResetBody(fbs: FbsAPI) { return fbs("角色基础将回到预设值，心法选择保留。", "Body of the base reset confirmation: base stats return to presets while inner art choices are kept."); }
  static xinfaLabelTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["心法 ", fbs.param("n", pv(p, "n"))], "Label of one inner art (xinfa) selector row on the build bench; {n} is the row number."); }
  static xinfaNoneLabel(fbs: FbsAPI) { return fbs("— 不选 —", "Option in an inner art selector meaning no inner art is chosen."); }
  static loginHint(fbs: FbsAPI) { return fbs("装备库与方案按你的 Discord 账号保存，登录后可用（计算与参考数据无需登录）。", "Hint on the gear tools for signed-out visitors: the library and schemes need login because they are stored per Discord account, while calculations and reference data work without login."); }
  static libTitle(fbs: FbsAPI) { return fbs("装备库", "Title of the gear library section."); }
  static myLibTitle(fbs: FbsAPI) { return fbs("我的装备库", "Title of the signed-in user's gear library."); }
  static myBuildsTitle(fbs: FbsAPI) { return fbs("我的方案", "Title of the signed-in user's saved builds (schemes) section."); }
  static libCountTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["共 ", fbs.param("n", pv(p, "n")), " 件"], "Item count line in the gear library; {n} is the number of stored items."); }
  static usageTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["已存 ", fbs.param("n", pv(p, "n")), " / ", fbs.param("limit", pv(p, "limit")), " 件"], "Storage usage line in the gear library; {n} is the stored count and {limit} the capacity."); }
  static usageNearLimitText(fbs: FbsAPI) { return fbs("装备库快满了，导入新装备前先清理不用的装备", "Warning in the gear library when storage is nearly full, advising cleanup before importing more gear."); }
  static formSlotLabel(fbs: FbsAPI) { return fbs("部位", "Label of the equipment slot field in the manual gear entry form."); }
  static formNameLabel(fbs: FbsAPI) { return fbs("名称", "Label of the gear name field in the manual entry form."); }
  static formNamePlaceholder(fbs: FbsAPI) { return fbs("装备名（可空）", "Placeholder text in the gear name field; the name is optional."); }
  static affixPlaceholder(fbs: FbsAPI) { return fbs("选词条", "Placeholder of an affix selector row in the gear entry form."); }
  static valuePlaceholder(fbs: FbsAPI) { return fbs("数值", "Placeholder of an affix value input in the gear entry form."); }
  static refTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["满值 ", fbs.param("max", pv(p, "max")), " / 承音 ", fbs.param("cy", pv(p, "cy"))], "Reference hint under an affix row in the gear entry form; {max} is the affix maximum value and {cy} its chengyin value."); }
  static fillMaxLabel(fbs: FbsAPI) { return fbs("填满值", "Button label that fills an affix value input with the affix maximum."); }
  static fillCyLabel(fbs: FbsAPI) { return fbs("填承音", "Button label that fills an affix value input with the chengyin value."); }
  static delRowLabel(fbs: FbsAPI) { return fbs("删此行", "Button label that deletes one affix row in the gear entry form."); }
  static addRowLabel(fbs: FbsAPI) { return fbs("加一行", "Button label that adds an affix row in the gear entry form."); }
  static dyNameLabel(fbs: FbsAPI) { return fbs("定音名称", "Label of the tuning (dingyin) affix name field in the gear entry form."); }
  static dyNamePlaceholder(fbs: FbsAPI) { return fbs("如 外功穿透 / 无名剑法·蓄力技增伤", "Placeholder example text in the tuning affix name field."); }
  static dyValLabel(fbs: FbsAPI) { return fbs("定音数值", "Label of the tuning affix value field in the gear entry form."); }
  static schoolsLabel(fbs: FbsAPI) { return fbs("流派标签（武器）", "Label of the sect tag selector for a weapon in the gear entry form."); }
  static addGearLabel(fbs: FbsAPI) { return fbs("存入装备库", "Button label that saves the form's gear into the library."); }
  static updateGearLabel(fbs: FbsAPI) { return fbs("保存修改", "Button label that saves edits to an existing library item."); }
  static cancelEditLabel(fbs: FbsAPI) { return fbs("取消编辑", "Button label that cancels editing a library item."); }
  static demoLabel(fbs: FbsAPI) { return fbs("载入示例套", "Button label that loads the demo gear set into the library."); }
  static clearLibLabel(fbs: FbsAPI) { return fbs("清空装备库", "Button label that clears the whole gear library."); }
  static clearConfirmTitle(fbs: FbsAPI) { return fbs("清空装备库？", "Title of the confirmation dialog for clearing the gear library."); }
  static clearConfirmBody(fbs: FbsAPI) { return fbs("你账号下的全部装备与方案都会删除，当前搭配也会清空，此操作不可恢复。", "Body of the clear-library confirmation: all gear and schemes under the account are deleted, the current loadout is emptied, and the action cannot be undone."); }
  static equipLabel(fbs: FbsAPI) { return fbs("选入", "Button label on a library item that equips it into the loadout."); }
  static unequipLabel(fbs: FbsAPI) { return fbs("卸下", "Button label on a library item that removes it from the loadout."); }
  static editLabel(fbs: FbsAPI) { return fbs("编辑", "Button label on a library item that opens it in the entry form for editing."); }
  static deleteLabel(fbs: FbsAPI) { return fbs("删除", "Button label on a library item that deletes it."); }
  static simLabel(fbs: FbsAPI) { return fbs("模拟", "Toggle label in the library for simulated preview mode."); }
  static simRealLabel(fbs: FbsAPI) { return fbs("实际", "Toggle option for actual values in the library preview."); }
  static simCyLabel(fbs: FbsAPI) { return fbs("承音", "Toggle option simulating every affix at its chengyin value in the library preview."); }
  static simMaxLabel(fbs: FbsAPI) { return fbs("满值", "Toggle option simulating every affix at its maximum value in the library preview."); }
  static verdictHeirloom(fbs: FbsAPI) { return fbs("传家宝", "Verdict tag on a library item whose score marks it as an heirloom (top quality)."); }
  static verdictDud(fbs: FbsAPI) { return fbs("拉完了", "Verdict tag on a library item whose score marks it as a dud."); }
  static scoreTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["评分 ", fbs.param("score", pv(p, "score"))], "Score line on a library item; {score} is the item's graduation score."); }
  static qualityLabel(fbs: FbsAPI) { return fbs("数值达成", "Label of the value attainment component of an item's score."); }
  static exportLabel(fbs: FbsAPI) { return fbs("导出数据", "Button label that exports the gear library data as a file."); }
  static exportFileName(fbs: FbsAPI) { return fbs("100阶配装数据.json", "File name used when exporting the tier-100 build data file."); }
  static importNameTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["导入 · ", fbs.param("slot", pv(p, "slot"))], "Default name given to an imported gear item; {slot} is the equipment slot name."); }
  static importLabel(fbs: FbsAPI) { return fbs("导入数据", "Button label that imports gear data from a file."); }
  static importFailedToast(fbs: FbsAPI) { return fbs("导入失败：文件无效", "Toast shown when a gear data import fails because the file is invalid."); }
  static importedToastTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["已导入 ", fbs.param("n", pv(p, "n")), " 件"], "Toast shown after a gear data import; {n} is the number of imported items."); }
  static manualTitle(fbs: FbsAPI) { return fbs("手动录入", "Title of the manual gear entry section."); }
  static pasteTitle(fbs: FbsAPI) { return fbs("粘贴代码导入", "Title of the paste-code import section."); }
  static pastePlaceholder(fbs: FbsAPI) { return fbs("把装备数据代码粘到这里（JSON / Base64 / 文本均可）", "Placeholder text of the paste-code textarea, accepting JSON, Base64 or plain text gear data."); }
  static pasteButtonLabel(fbs: FbsAPI) { return fbs("解析并导入装备库", "Button label that parses the pasted code and imports the gear into the library."); }
  static pasteDemoLabel(fbs: FbsAPI) { return fbs("填入示例代码", "Button label that fills the paste-code textarea with a demo code."); }
  static pasteEmptyText(fbs: FbsAPI) { return fbs("先把代码粘到上面的框里再点解析。", "Hint under the parse button shown when the paste-code textarea is still empty."); }
  static pasteOkTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["✓ 已按「", fbs.param("mode", pv(p, "mode")), "」解析，导入 ", fbs.param("n", pv(p, "n")), " 件装备 / ", fbs.param("lines", pv(p, "lines")), " 条词条，已自动选入搭配。"], "Result text after a successful paste import; {mode} is the detected data format, {n} the imported item count and {lines} the affix line count, noting items were auto-equipped."); }
  static pasteUnknownTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["另有 ", fbs.param("n", pv(p, "n")), " 条没认出的字段被跳过（多半是气血、防御、外功穿透这类本站不计的词条）。"], "Result note after a paste import; {n} is the number of unrecognized fields that were skipped, typically stats this tool does not count."); }
  static pasteFailText(fbs: FbsAPI) { return fbs("没能从这段代码里认出装备。常见原因：复制时漏了一头一尾、复制的是角色外观分享码（不含装备数值）、或这份数据的字段格式本站还没适配。", "Failure text when no gear can be recognized from a pasted code, listing common causes such as a truncated copy or an appearance share code."); }
  static pasteFullText(fbs: FbsAPI) { return fbs("识别为本工具导出的数据，已按整库导入处理。", "Result note when the pasted code is recognized as this tool's own export and is imported as a whole-library replacement."); }
  static ocrTitle(fbs: FbsAPI) { return fbs("截图导入（本地识别，不上传）", "Title of the single-screenshot OCR import section; recognition runs locally and nothing is uploaded."); }
  static ocrDropText(fbs: FbsAPI) { return fbs("点这里选一张装备详情截图，或拖进来 / Ctrl+V 粘贴", "Drop zone text of the single-screenshot import: click to pick a gear detail screenshot, drag it in, or paste with Ctrl+V."); }
  static ocrPreparingText(fbs: FbsAPI) { return fbs("正在准备图片…", "Status text while the screenshot is being prepared for recognition."); }
  static ocrRunningText(fbs: FbsAPI) { return fbs("正在识别（首次会下载中文 + 英文识别包，可能要十几秒）…", "Status text while OCR is running, noting the first run downloads the Chinese and English recognition packs and may take a while."); }
  static ocrSecondText(fbs: FbsAPI) { return fbs("正在增强识别（第二遍）…", "Status text while the enhanced second OCR pass is running."); }
  static ocrFailedText(fbs: FbsAPI) { return fbs("识别失败了。常见原因：网络不通下不到识别包、图片太模糊。可以换一张更清晰、完整的详情页截图再试。", "Failure text for screenshot recognition, listing common causes such as no network for the recognition pack or a blurry image."); }
  static ocrBadTypeText(fbs: FbsAPI) { return fbs("这张图格式不对，只支持 PNG / JPEG / WebP 截图。", "Error text when the dropped file is not a PNG, JPEG or WebP screenshot."); }
  static ocrTooBigText(fbs: FbsAPI) { return fbs("图片超过 15MB，换一张小一点的截图。", "Error text when the screenshot exceeds the 15 MB limit."); }
  static ocrNoEngineText(fbs: FbsAPI) { return fbs("识别组件没能加载（OCR 引擎需要联网从 CDN 载入）。检查网络后刷新页面再试；粘贴代码导入不受影响。", "Error text when the OCR engine cannot be loaded from the CDN, advising a network check and noting paste import is unaffected."); }
  static ocrDoneTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["✓ 识别完成：认出 ", fbs.param("n", pv(p, "n")), " 条词条", fbs.param("slotPart", pv(p, "slotPart")), fbs.param("dyPart", pv(p, "dyPart")), "。请逐行核对数值再确认存入。"], "Result text after a screenshot recognition; {n} is the recognized affix count, {slotPart} the optional slot note and {dyPart} the optional tuning note, asking the user to verify values before saving."); }
  static ocrSlotLabel(fbs: FbsAPI) { return fbs("部位", "Label of the slot field in the OCR result review form."); }
  static ocrNameLabel(fbs: FbsAPI) { return fbs("名称", "Label of the name field in the OCR result review form."); }
  static ocrEquipLabel(fbs: FbsAPI) { return fbs("存入后直接选入搭配", "Label of the checkbox in the OCR review form that equips the item into the loadout right after saving."); }
  static ocrConfirmLabel(fbs: FbsAPI) { return fbs("确认存入", "Button label that confirms the OCR result and saves it into the library."); }
  static ocrCancelLabel(fbs: FbsAPI) { return fbs("放弃", "Button label that discards the OCR result."); }
  static ocrUnknownTitle(fbs: FbsAPI) { return fbs("下面这些行没认出词条，已原样列出（不会丢行）：需要的话点「补一条词条行」手动加上；纯界面文字可忽略。", "Heading above the list of OCR lines that could not be matched to affixes; lines are kept verbatim so nothing is lost and can be added manually."); }
  static ocrSavedTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["✓ 已存入装备库：", fbs.param("slot", pv(p, "slot")), "（", fbs.param("n", pv(p, "n")), " 条词条）"], "Confirmation after an OCR item is saved; {slot} is the equipment slot and {n} the affix count."); }
  static ocrNeedLineToast(fbs: FbsAPI) { return fbs("至少保留一条有效词条再确认", "Toast shown when confirming an OCR result with no valid affix line left."); }
  static ocrLowConfTag(fbs: FbsAPI) { return fbs("低置信，请核对", "Tag on an OCR result line with low recognition confidence, asking the user to verify it."); }
  static ocrAddRowLabel(fbs: FbsAPI) { return fbs("补一条词条行", "Button label in the OCR review that adds an affix row manually."); }
  static ocrImportSlotTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["导入", fbs.param("slot", pv(p, "slot"))], "Heading identifying which slot an OCR review block will import as; {slot} is the equipment slot name."); }
  static ocrBatchTitle(fbs: FbsAPI) { return fbs("批量截图识别（全屏截图自动框选 · 本地识别，不上传）", "Title of the batch screenshot recognition section; full screenshots are auto-cropped to the gear panel and recognition runs locally."); }
  static ocrBatchDropText(fbs: FbsAPI) { return fbs("把多张截图拖到这里，或点选多张 / Ctrl+V 粘贴（全屏截图也可以，会自动找装备面板）", "Drop zone text of the batch import: drag in multiple screenshots, click to pick several, or paste; full screenshots are fine because the gear panel is located automatically."); }
  static ocrBatchQueuedText(fbs: FbsAPI) { return fbs("排队中", "Status tag on a batch item waiting for recognition."); }
  static ocrBatchRunningText(fbs: FbsAPI) { return fbs("识别中…", "Status tag on a batch item being recognized."); }
  static ocrBatchReadyText(fbs: FbsAPI) { return fbs("待核对", "Status tag on a batch item recognized and waiting for review."); }
  static ocrBatchFailedText(fbs: FbsAPI) { return fbs("识别失败", "Status tag on a batch item whose recognition failed."); }
  static ocrBatchImportedText(fbs: FbsAPI) { return fbs("已导入", "Status tag on a batch item already imported into the library."); }
  static ocrBatchRetryLabel(fbs: FbsAPI) { return fbs("重试", "Button label that retries recognition of a failed batch item."); }
  static ocrBatchRemoveLabel(fbs: FbsAPI) { return fbs("移除", "Button label that removes an item from the batch queue."); }
  static ocrBatchAdjustLabel(fbs: FbsAPI) { return fbs("调整框选", "Button label that opens crop adjustment for a batch item."); }
  static ocrBatchApplyBoxLabel(fbs: FbsAPI) { return fbs("按此框重新识别", "Button label that re-runs recognition with the adjusted crop box."); }
  static ocrBatchDetectedText(fbs: FbsAPI) { return fbs("已自动框选面板", "Note on a batch item whose gear panel was located and cropped automatically."); }
  static ocrBatchFullImageText(fbs: FbsAPI) { return fbs("未定位到面板，按整图识别", "Note on a batch item whose gear panel was not located, so recognition ran on the whole image."); }
  static ocrBatchDupTag(fbs: FbsAPI) { return fbs("重复", "Tag on a batch item detected as a duplicate."); }
  static ocrBatchDupLibText(fbs: FbsAPI) { return fbs("与装备库已有装备相同，默认不导入", "Note on a batch item identical to an existing library item, excluded from import by default."); }
  static ocrBatchDupRowText(fbs: FbsAPI) { return fbs("与本批另一张相同，默认不导入", "Note on a batch item identical to another screenshot in the same batch, excluded from import by default."); }
  static ocrBatchIncludeLabel(fbs: FbsAPI) { return fbs("导入这件", "Button label that opts a duplicate batch item into the import anyway."); }
  static ocrBatchNoLinesText(fbs: FbsAPI) { return fbs("没认出词条：请核对部位、补词条行，或调整框选后重新识别（不会自动丢弃）", "Note on a batch item where no affix was recognized: review the slot, add affix rows, or adjust the crop and retry; the item is never discarded automatically."); }
  static ocrBatchImportTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["全部导入（", fbs.param("n", pv(p, "n")), " 件）"], "Button label that imports all reviewed batch items; {n} is the number of items to import."); }
  static ocrBatchResultTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["✓ 批量导入完成：已导入 ", fbs.param("n", pv(p, "n")), " 件，跳过 ", fbs.param("m", pv(p, "m")), " 件。"], "Result text after a batch import; {n} is the imported count and {m} the skipped count."); }
  static libEmptyText(fbs: FbsAPI) { return fbs("装备库是空的。手动录入、粘贴代码或截图识别都可以加装备。", "Empty-state text of the gear library, listing the three ways to add gear: manual entry, paste code and screenshot recognition."); }
  static equippedTag(fbs: FbsAPI) { return fbs("已选入", "Tag on a library item that is currently equipped in the loadout."); }
  static loadoutTitle(fbs: FbsAPI) { return fbs("组合搭配 · 8 个部位", "Title of the loadout section, which combines gear across the eight equipment slots."); }
  static autoLabel(fbs: FbsAPI) { return fbs("一键最优组合", "Button label that computes the best combination from the library in one click."); }
  static autoDoneToast(fbs: FbsAPI) { return fbs("已拼好", "Toast shown after the one-click best combination is composed."); }
  static autoFallbackToast(fbs: FbsAPI) { return fbs("已拼好（含兜底选装）", "Toast shown after the one-click combination is composed with fallback picks for slots lacking ideal gear."); }
  static unequipAllLabel(fbs: FbsAPI) { return fbs("全部卸下", "Button label that removes every item from the loadout."); }
  static slotEmptyText(fbs: FbsAPI) { return fbs("未选", "Placeholder on a loadout slot where no gear is equipped."); }
  static panelTitle(fbs: FbsAPI) { return fbs("面板与毕业度", "Title of the panel and graduation section on the build bench."); }
  static gradLabel(fbs: FbsAPI) { return fbs("毕业度", "Label of the overall graduation degree in the panel section."); }
  static gradCountLabel(fbs: FbsAPI) { return fbs("条数", "Label of the affix line-match component of the bench graduation degree."); }
  static gradValueLabel(fbs: FbsAPI) { return fbs("数值", "Label of the value attainment component of the bench graduation degree."); }
  static gradDyLabel(fbs: FbsAPI) { return fbs("定音", "Label of the tuning (dingyin) component of the bench graduation degree."); }
  static gradDyToggleLabel(fbs: FbsAPI) { return fbs("定音计入毕业度", "Label of the toggle that includes the tuning component in the graduation degree."); }
  static loanLabel(fbs: FbsAPI) { return fbs("满值模拟（全套满值时的毕业度）", "Label of the full-value simulation line: the graduation degree if the whole set were at maximum values."); }
  static simActiveTag(fbs: FbsAPI) { return fbs("模拟中", "Tag shown while a value simulation is active in the panel section."); }
  static copySummaryLabel(fbs: FbsAPI) { return fbs("复制摘要", "Button label that copies a text summary of the current build."); }
  static copiedToast(fbs: FbsAPI) { return fbs("已复制", "Toast shown after the build summary is copied."); }
  static copyFailedToast(fbs: FbsAPI) { return fbs("复制失败，请手动记录", "Toast shown when copying the build summary fails, asking the user to record it manually."); }
  static yAccLabel(fbs: FbsAPI) { return fbs("黄字精准", "Label of the final (yellow) accuracy value in the panel section."); }
  static yCritLabel(fbs: FbsAPI) { return fbs("黄字会心", "Label of the final (yellow) crit value in the panel section."); }
  static yIntLabel(fbs: FbsAPI) { return fbs("黄字会意", "Label of the final (yellow) crit damage value in the panel section."); }
  static finalCritLabel(fbs: FbsAPI) { return fbs("最终会心", "Label of the final crit chance after all conversions in the panel section."); }
  static whiteLabel(fbs: FbsAPI) { return fbs("白字", "Group label for the white (raw) stat values in the panel section."); }
  static dawaiLabel(fbs: FbsAPI) { return fbs("大外", "Stat group label for big-external (two-handed external) values in the panel section."); }
  static xiaowaiLabel(fbs: FbsAPI) { return fbs("小外", "Stat group label for small-external values in the panel section."); }
  static dashuLabel(fbs: FbsAPI) { return fbs("大属", "Stat group label for big-elemental values in the panel section."); }
  static xiaoshuLabel(fbs: FbsAPI) { return fbs("小属", "Stat group label for small-elemental values in the panel section."); }
  static hpLabel(fbs: FbsAPI) { return fbs("气血", "Stat label for health (HP) in the panel section."); }
  static defLabel(fbs: FbsAPI) { return fbs("防御", "Stat label for defense in the panel section."); }
  static talentLabel(fbs: FbsAPI) { return fbs("天赋", "Stat label for talent points in the panel section."); }
  static diffTitle(fbs: FbsAPI) { return fbs("差缺清单：离毕业还差什么", "Title of the gap list section: what the current build still lacks to graduate."); }
  static diffLackTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["还差 ", fbs.param("n", pv(p, "n"))], "Gap line in the gap list; {n} is how many lines of an affix are still missing."); }
  static diffExactText(fbs: FbsAPI) { return fbs("正好", "Gap list marker for an affix whose line count exactly matches the recipe."); }
  static diffOverTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["多 ", fbs.param("n", pv(p, "n"))], "Gap line for an affix exceeding the recipe; {n} is the number of extra lines."); }
  static diffExtraTitle(fbs: FbsAPI) { return fbs("配方外", "Heading in the gap list for equipped affixes that are not part of the target recipe."); }
  static diffLowTitle(fbs: FbsAPI) { return fbs("未满承音的词条", "Heading in the gap list for affixes below their chengyin value."); }
  static diffDoneText(fbs: FbsAPI) { return fbs("✓ 毕业。", "Completion line in the gap list when the build fully matches the graduation recipe."); }
  static diffEmptyText(fbs: FbsAPI) { return fbs("还没选装备。", "Empty-state text of the gap list when no gear is equipped yet."); }
  static diffInvalidTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["异常：", fbs.param("n", pv(p, "n")), " 条无相在非武器部位，未计入。"], "Warning in the gap list; {n} is the number of Wuxiang affix lines sitting on non-weapon slots, which are excluded from the calculation."); }
  static suggestTitle(fbs: FbsAPI) { return fbs("建议", "Title of the suggestions section on the build bench."); }
  static suggestSwapTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("slot", pv(p, "slot")), "：换上「", fbs.param("name", pv(p, "name")), "」"], "Swap suggestion in the suggestions section; {slot} is the equipment slot and {name} the recommended library item."); }
  static suggestWashTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("slot", pv(p, "slot")), "：把第 ", fbs.param("line", pv(p, "line")), " 条 ", fbs.param("from", pv(p, "from")), " 洗成 ", fbs.param("to", pv(p, "to"))], "Reroll suggestion in the suggestions section; {slot} is the equipment slot, {line} the affix line number, {from} the current affix and {to} the recommended affix."); }
  static suggestNoneText(fbs: FbsAPI) { return fbs("这套暂时挑不出毛病", "Text in the suggestions section when no improvement can be suggested for the current build."); }
  static suggestHeadTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["当前 ", fbs.param("cur", pv(p, "cur")), "% → 全做 ", fbs.param("final", pv(p, "final")), "%"], "Header of the suggestions section; {cur} is the current graduation percentage and {final} the percentage if every suggestion is applied."); }
  static dySummaryTitle(fbs: FbsAPI) { return fbs("定音汇总", "Title of the tuning (dingyin) summary section on the build bench."); }
  static dyCorrectText(fbs: FbsAPI) { return fbs("对", "Marker in the tuning summary for a tuning affix of the correct type."); }
  static dyWrongText(fbs: FbsAPI) { return fbs("类型不符", "Marker in the tuning summary for a tuning affix whose type does not match."); }
  static schemeTitle(fbs: FbsAPI) { return fbs("配装方案对比", "Title of the build scheme comparison section on the build bench."); }
  static schemeSaveLabel(fbs: FbsAPI) { return fbs("存为方案", "Button label that saves the current loadout as a scheme."); }
  static schemeNameTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["方案 ", fbs.param("n", pv(p, "n"))], "Default scheme name on the build bench; {n} is the scheme number."); }
  static schemeLoadLabel(fbs: FbsAPI) { return fbs("载入", "Button label that loads a scheme into the loadout."); }
  static schemeDeleteLabel(fbs: FbsAPI) { return fbs("删除", "Button label that deletes a scheme."); }
  static schemeEmptyText(fbs: FbsAPI) { return fbs("还没有保存的方案。", "Empty-state text of the bench scheme list when no scheme is saved."); }
  static schemeComposeFirstText(fbs: FbsAPI) { return fbs("先在配装台拼好一套搭配，才能存为方案。", "Hint in the scheme section: compose a loadout on the bench before it can be saved as a scheme."); }
  static schemeSavedToastTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["已存方案：", fbs.param("name", pv(p, "name"))], "Toast shown after a bench scheme is saved; {name} is the scheme name."); }
  static schemeLoadedToastTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["已载入：", fbs.param("name", pv(p, "name"))], "Toast shown after a bench scheme is loaded; {name} is the scheme name."); }
  static schemeGroupCountTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("n", pv(p, "n")), " 套"], "Count line of a scheme group on the public build share page; {n} is the number of schemes in the group."); }
  static shareLabel(fbs: FbsAPI) { return fbs("分享", "Button label that creates a public share link for a build."); }
  static revokeShareLabel(fbs: FbsAPI) { return fbs("取消分享", "Button label that revokes a build's public share link."); }
  static copyLinkLabel(fbs: FbsAPI) { return fbs("复制链接", "Button label that copies a build's share link."); }
  static shareRevokedToast(fbs: FbsAPI) { return fbs("已取消分享，旧链接已失效", "Toast shown after a share link is revoked and the old link stops working."); }
  static quickTitle(fbs: FbsAPI) { return fbs("三率速算器", "Title of the three-rate quick calculator in the gear tools."); }
  static quickResLabel(fbs: FbsAPI) { return fbs("抗性", "Label of the resistance input in the three-rate quick calculator."); }
  static quickSyncLabel(fbs: FbsAPI) { return fbs("从配装台同步", "Button label that syncs the quick calculator inputs from the build bench."); }
  static quickSyncedToast(fbs: FbsAPI) { return fbs("已同步", "Toast shown after the quick calculator is synced from the bench."); }
  static quickOkText(fbs: FbsAPI) { return fbs("✓ 已满值", "Result text in the quick calculator when a rate has reached its maximum."); }
  static quickOverTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["，溢出 ", fbs.param("v", pv(p, "v")), "%"], "Result suffix in the quick calculator for the overflow amount; {v} is the overflow percentage without a percent sign."); }
  static quickGapTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["还差白字 ", fbs.param("lack", pv(p, "lack")), "%（满值 ", fbs.param("need", pv(p, "need")), "%）≈ ", fbs.param("bars", pv(p, "bars")), " 条", fbs.param("barName", pv(p, "barName"))], "Result text in the quick calculator when a rate is short; {lack} is the missing white percentage, {need} the target white percentage, {bars} the estimated affix lines needed and {barName} the affix name."); }
  static recipesTitle(fbs: FbsAPI) { return fbs("全流派配方表（100 阶 · 承音）", "Title of the all-sects recipe table for tier-100 chengyin builds."); }
  static recipeSearchPlaceholder(fbs: FbsAPI) { return fbs("搜流派 / 套装 / 词条", "Placeholder of the search box above the recipe table, filtering by sect, set or affix."); }
  static recipeAllLabel(fbs: FbsAPI) { return fbs("全部", "Filter option in the recipe table showing all categories."); }
  static recipeColCat(fbs: FbsAPI) { return fbs("类别", "Column header in the recipe table for the build category."); }
  static recipeColSchool(fbs: FbsAPI) { return fbs("流派", "Column header in the recipe table for the sect."); }
  static recipeColSet(fbs: FbsAPI) { return fbs("套装", "Column header in the recipe table for the gear set."); }
  static recipeColRecipe(fbs: FbsAPI) { return fbs("词条搭配（承音）", "Column header in the recipe table for the affix combination at chengyin values."); }
  static recipeColBow(fbs: FbsAPI) { return fbs("推荐弓", "Column header in the recipe table for the recommended bow-jue."); }
  static recipeSetTargetLabel(fbs: FbsAPI) { return fbs("设为目标", "Button label on a recipe row that sets it as the build bench target."); }
  static recipeEmptyText(fbs: FbsAPI) { return fbs("没有符合的配方。", "Empty-state text of the recipe table when no recipe matches the filter."); }
  static recipeTargetToastTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["目标已设为：", fbs.param("school", pv(p, "school")), " · ", fbs.param("set", pv(p, "set"))], "Toast shown after a recipe is set as the bench target; {school} is the sect and {set} the gear set."); }
  static sectRecipesTitle(fbs: FbsAPI) { return fbs("100 阶配方（配装台口径）", "Title of the tier-100 recipe section on a sect page, using build bench conventions."); }
  static affixTableTitle(fbs: FbsAPI) { return fbs("词条满值 / 承音对照表（配装台）", "Title of the affix maximum and chengyin reference table on the build bench."); }
  static colCyLabel(fbs: FbsAPI) { return fbs("承音", "Column header in the affix reference table for the chengyin value."); }
  static colCyPctLabel(fbs: FbsAPI) { return fbs("承音/满值", "Column header in the affix reference table for the chengyin-to-maximum ratio."); }
  static colRecipeNamesLabel(fbs: FbsAPI) { return fbs("配方叫法", "Column header in the affix reference table for the names recipes use for the affix."); }
  static survivalNote(fbs: FbsAPI) { return fbs("生存向，配方未列", "Note in the recipe table for survival-oriented builds that the recipe does not list."); }
  static slotTableTitle(fbs: FbsAPI) { return fbs("部位版位表（配装台）", "Title of the slot layout reference table on the build bench, showing which affix positions each slot can roll."); }
  static slotsBigTitle(fbs: FbsAPI) { return fbs("大外流派", "Heading of the slot layout table for big-external sects."); }
  static slotsSmallTitle(fbs: FbsAPI) { return fbs("小外流派", "Heading of the slot layout table for small-external sects."); }
  static formulaTitle(fbs: FbsAPI) { return fbs("公式与五维换算速查", "Title of the formulas and five-dimension conversion quick reference section."); }
  static formulaRatesTitle(fbs: FbsAPI) { return fbs("三率换算", "Heading of the three-rate conversion formulas in the reference section."); }
  static formulaDimsTitle(fbs: FbsAPI) { return fbs("五维换算（每 1 点）", "Heading of the five-dimension conversion table in the reference section, stating values are per one point."); }
  static formulaOrderTitle(fbs: FbsAPI) { return fbs("选装顺序", "Heading of the gear selection order advice in the reference section."); }
  static formulaAccTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["黄字精准 = 65% +（白字精准 − 65%）÷ 抗性，白字 ", fbs.param("white", pv(p, "white")), "% 满值 100%。"], "Accuracy conversion formula in the reference section; {white} is the current white accuracy value, and the cap is 100 percent."); }
  static formulaCritTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["黄字会心 = 白字会心 ÷ 抗性，白字 ", fbs.param("white", pv(p, "white")), "% 满值 80%。"], "Crit conversion formula in the reference section; {white} is the current white crit value, and the cap is 80 percent."); }
  static formulaIntTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["黄字会意 = 白字会意 ÷ 抗性，白字 ", fbs.param("white", pv(p, "white")), "% 满值 40%。"], "Crit damage conversion formula in the reference section; {white} is the current white crit damage value, and the cap is 40 percent."); }
  static formulaBarsTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["差几条估算（按承音每条）：精准 ", fbs.param("acc", pv(p, "acc")), " / 会心 ", fbs.param("crit", pv(p, "crit")), " / 会意 ", fbs.param("int", pv(p, "int")), "；敏补会心 ≈ +", fbs.param("minCrit", pv(p, "minCrit")), "% 白字 / 条，势补会意 ≈ +", fbs.param("shiInt", pv(p, "shiInt")), "% 白字 / 条。"], "Formula line estimating missing affix lines at chengyin per line; {acc}, {crit} and {int} are the line counts for accuracy, crit and crit damage, and {minCrit} and {shiInt} are the per-line white gains from agility and momentum."); }
  static formulaBowTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["弓（弓玦）加成计入白字：精准弓 白字精准 +", fbs.param("acc", pv(p, "acc")), " / 会心弓 白字会心 +", fbs.param("crit", pv(p, "crit")), " / 会意弓 白字会意 +", fbs.param("int", pv(p, "int")), "，再按抗性换算黄字。抗性 ", fbs.param("res", pv(p, "res")), "（当前版本）。"], "Formula line explaining that bow-jue bonuses count into white values before resistance conversion; {acc}, {crit} and {int} are the bow bonuses and {res} the current resistance value."); }
  static formulaOrderText(fbs: FbsAPI) { return fbs("定流派 → 对配方 → 录装备。一键最优拼一版 → 看差缺清单补缺。精准先堆满 100%；会心 148% / 会意 74% 封顶，溢出换劲 / 势 / 增伤。两套拿不准，存方案比总分。", "Advice paragraph in the reference section on selection order: fix the sect, match the recipe, enter gear, auto-compose, then close gaps; accuracy caps first, overflow moves to other stats, and uncertain builds are compared as schemes."); }
  static colDimLabel(fbs: FbsAPI) { return fbs("五维", "Column header in the five-dimension conversion table for the dimension name."); }
  static colConvLabel(fbs: FbsAPI) { return fbs("换算", "Column header in the five-dimension conversion table for the conversion effect."); }
  static colFullBarTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["满条 ", fbs.param("v", pv(p, "v")), " 折合"], "Cell text in the five-dimension conversion table giving the full-line equivalent; {v} is the converted value."); }
  static calcFailedText(fbs: FbsAPI) { return fbs("计算失败，请稍后再试", "Error text shown when the gear calculation endpoint fails."); }
  static demoLoadedToast(fbs: FbsAPI) { return fbs("示例已载入", "Toast shown after the demo gear set is loaded."); }
  static savedToastTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["已存入：", fbs.param("name", pv(p, "name"))], "Toast shown after an item is saved to the library; {name} is the item name."); }
  static deletedToast(fbs: FbsAPI) { return fbs("已删除", "Toast shown after a library item is deleted."); }
  static clearedToast(fbs: FbsAPI) { return fbs("已清空", "Toast shown after the gear library is cleared."); }
}

export abstract class BuildshareFbtUtils {
  static kicker(fbs: FbsAPI) { return fbs("装备方案 · 公开分享", "Kicker line above the title on the public gear-build share page, identifying it as a shared gear build."); }
  static loginLabel(fbs: FbsAPI) { return fbs("打开燕云百业", "Label of the button on the public build share page that opens the main app (and its login)."); }
  static notFoundTitle(fbs: FbsAPI) { return fbs("链接已失效", "Heading shown when a build share link is invalid or has been revoked."); }
  static notFoundBody(fbs: FbsAPI) { return fbs("这条分享链接不存在，或已被方案主人取消分享。", "Explanation shown when a build share link does not exist or the owner has stopped sharing."); }
  static xinfaLabel(fbs: FbsAPI) { return fbs("心法", "Field label for the xinfa (inner art) slot on the public build share page."); }
}

