/* fbtee declaration surface for the gear domain (hand-maintained): this
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

export const tiaolv_intro = (fbs: FbsAPI) =>fbs("调律推演 · 复刻 bilibili@片雲 DIY 0.10.2（100级）伤害计算器逻辑", "tiaolv.intro");
export const tiaolv_innerSkill = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["心法", fbs.param("n", pv(p, "n"))], "tiaolv.innerSkill");
export const tiaolv_innerSkillPlaceholder = (fbs: FbsAPI) =>fbs("心法名", "tiaolv.innerSkillPlaceholder");
export const tiaolv_wuxue = (fbs: FbsAPI) =>fbs("武学", "tiaolv.wuxue");
export const tiaolv_wuku = (fbs: FbsAPI) =>fbs("武库", "tiaolv.wuku");
export const tiaolv_wukuSelf = (fbs: FbsAPI) =>fbs("本系", "tiaolv.wukuSelf");
export const tiaolv_wukuCommon = (fbs: FbsAPI) =>fbs("通用", "tiaolv.wukuCommon");
export const tiaolv_suit = (fbs: FbsAPI) =>fbs("套装", "tiaolv.suit");
export const tiaolv_bow = (fbs: FbsAPI) =>fbs("弓决", "tiaolv.bow");
export const tiaolv_none = (fbs: FbsAPI) =>fbs("无", "tiaolv.none");
export const tiaolv_tuneArea = (fbs: FbsAPI) =>fbs("调律区（K:R 列，对应 Excel K3:R5, K6:R24）", "tiaolv.tuneArea");
export const tiaolv_calc = (fbs: FbsAPI) =>fbs("开始推演", "tiaolv.calc");
export const tiaolv_calculating = (fbs: FbsAPI) =>fbs("推演中…", "tiaolv.calculating");
export const tiaolv_toastFailed = (fbs: FbsAPI) =>fbs("计算失败", "tiaolv.toastFailed");
export const tiaolv_toastFailedWith = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["计算失败：", fbs.param("error", pv(p, "error"))], "tiaolv.toastFailedWith");
export const tiaolv_colAttr = (fbs: FbsAPI) =>fbs("属性", "tiaolv.colAttr");
export const tiaolv_colBase = (fbs: FbsAPI) =>fbs("基础白值", "tiaolv.colBase");
export const tiaolv_colPanel = (fbs: FbsAPI) =>fbs("面板白值", "tiaolv.colPanel");
export const tiaolv_colFinal = (fbs: FbsAPI) =>fbs("最终面板", "tiaolv.colFinal");
export const grad_entering = (fbs: FbsAPI) =>fbs("正在进入武库…", "grad.entering");
export const grad_title = (fbs: FbsAPI) =>fbs("武库鉴宝", "grad.title");
export const grad_subtitle = (fbs: FbsAPI) =>fbs("条数50% · 数值30% · 三率20%", "grad.subtitle");
export const grad_mingjinNote = (fbs: FbsAPI) =>fbs("鸣金 · 大外会意流", "grad.mingjinNote");
export const grad_buildBig = (fbs: FbsAPI) =>fbs("大外", "grad.buildBig");
export const grad_buildSmall = (fbs: FbsAPI) =>fbs("小外", "grad.buildSmall");
export const grad_ringLabel = (fbs: FbsAPI) =>fbs("毕业率", "grad.ringLabel");
export const grad_scoreCount = (fbs: FbsAPI) =>fbs("条数匹配", "grad.scoreCount");
export const grad_scoreValue = (fbs: FbsAPI) =>fbs("数值达成", "grad.scoreValue");
export const grad_scoreRate = (fbs: FbsAPI) =>fbs("三率达标", "grad.scoreRate");
export const grad_tier1 = (fbs: FbsAPI) =>fbs("天人合一", "grad.tier1");
export const grad_tier2 = (fbs: FbsAPI) =>fbs("登峰造极", "grad.tier2");
export const grad_tier3 = (fbs: FbsAPI) =>fbs("炉火纯青", "grad.tier3");
export const grad_tier4 = (fbs: FbsAPI) =>fbs("小有所成", "grad.tier4");
export const grad_tier5 = (fbs: FbsAPI) =>fbs("初窥门径", "grad.tier5");
export const grad_tier6 = (fbs: FbsAPI) =>fbs("凡铁未炼", "grad.tier6");
export const grad_tapHint = (fbs: FbsAPI) =>fbs("轻触装备以镌刻词条", "grad.tapHint");
export const grad_refTitle = (fbs: FbsAPI) =>fbs("📖 参考数据 · 词条满值与版位", "grad.refTitle");
export const grad_maxTableTitle = (fbs: FbsAPI) =>fbs("词条满值表（100阶）", "grad.maxTableTitle");
export const grad_colAffix = (fbs: FbsAPI) =>fbs("词条", "grad.colAffix");
export const grad_colMax = (fbs: FbsAPI) =>fbs("满值", "grad.colMax");
export const grad_colResonance = (fbs: FbsAPI) =>fbs("承音（95%)", "grad.colResonance");
export const grad_slotTableTitle = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["部位版位表（", fbs.param("build", pv(p, "build")), "）"], "grad.slotTableTitle");
export const grad_rateTitle = (fbs: FbsAPI) =>fbs("⚡ 三率速算", "grad.rateTitle");
export const grad_rateOk = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("v", pv(p, "v")), " ✓"], "grad.rateOk");
export const grad_rateGap = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("v", pv(p, "v")), " （差", fbs.param("gap", pv(p, "gap")), "）"], "grad.rateGap");
export const grad_rateOverflow = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["⚠️ 会心+会意=", fbs.param("sum", pv(p, "sum")), ">100，会意挤占会心"], "grad.rateOverflow");
export const grad_compareTitle = (fbs: FbsAPI) =>fbs("⚔️ 方案对比", "grad.compareTitle");
export const grad_saveScheme = (fbs: FbsAPI) =>fbs("💾 保存当前配装为方案", "grad.saveScheme");
export const grad_schemeName = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["方案", fbs.param("n", pv(p, "n"))], "grad.schemeName");
export const grad_noSchemes = (fbs: FbsAPI) =>fbs("暂无方案，先填好装备再保存", "grad.noSchemes");
export const grad_load = (fbs: FbsAPI) =>fbs("载入", "grad.load");
export const grad_deleteScheme = (fbs: FbsAPI) =>fbs("删除方案", "grad.deleteScheme");
export const grad_itemScore = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["本件 ", fbs.param("score", pv(p, "score")), "%"], "grad.itemScore");
export const grad_rowMain = (fbs: FbsAPI) =>fbs("主词条", "grad.rowMain");
export const grad_rowSub = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["副词条", fbs.param("n", pv(p, "n"))], "grad.rowSub");
export const grad_rowResonance = (fbs: FbsAPI) =>fbs("定音", "grad.rowResonance");
export const grad_affixPlaceholder = (fbs: FbsAPI) =>fbs("— 待镌刻 —", "grad.affixPlaceholder");
export const grad_affixLoading = (fbs: FbsAPI) =>fbs("词条数据加载中…", "grad.affixLoading");
export const grad_valuePlaceholderMax = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["数值 / ", fbs.param("max", pv(p, "max"))], "grad.valuePlaceholderMax");
export const grad_valuePlaceholder = (fbs: FbsAPI) =>fbs("数值", "grad.valuePlaceholder");
export const grad_resonance = (fbs: FbsAPI) =>fbs("承音", "grad.resonance");
export const grad_overMax = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["超过满值 ", fbs.param("max", pv(p, "max")), "，将按满值计算"], "grad.overMax");
export const grad_toastSaved = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["已保存方案「", fbs.param("name", pv(p, "name")), "」"], "grad.toastSaved");
export const grad_toastLoaded = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["已载入方案「", fbs.param("name", pv(p, "name")), "」"], "grad.toastLoaded");
export const grad_toastOldScheme = (fbs: FbsAPI) =>fbs("旧方案只保存了分数，无法载入配装", "grad.toastOldScheme");
export const gear_calcLabel = (fbs: FbsAPI) =>fbs("计算", "gear.calcLabel");
export const gear_benchTitle = (fbs: FbsAPI) =>fbs("配装台", "gear.benchTitle");
export const gear_benchIntro = (fbs: FbsAPI) =>fbs("100 阶配装：按流派配方拼装备、算面板与毕业度（口径：条数 40% + 数值 24% + 定音 20%，与上方毕业计算的口径不同）。装备库与方案保存在你的 Discord 账号下，换设备也能用。", "gear.benchIntro");
export const gear_targetLabel = (fbs: FbsAPI) =>fbs("目标流派", "gear.targetLabel");
export const gear_bowLabel = (fbs: FbsAPI) =>fbs("弓玦", "gear.bowLabel");
export const gear_bowNoneLabel = (fbs: FbsAPI) =>fbs("无", "gear.bowNoneLabel");
export const gear_extrasTitle = (fbs: FbsAPI) =>fbs("其他来源加成", "gear.extrasTitle");
export const gear_resLabel = (fbs: FbsAPI) =>fbs("抗性", "gear.resLabel");
export const gear_extraAccLabel = (fbs: FbsAPI) =>fbs("白字精准（手填）", "gear.extraAccLabel");
export const gear_extraCritLabel = (fbs: FbsAPI) =>fbs("白字会心（手填）", "gear.extraCritLabel");
export const gear_extraIntLabel = (fbs: FbsAPI) =>fbs("白字会意（手填）", "gear.extraIntLabel");
export const gear_baseTitle = (fbs: FbsAPI) =>fbs("角色基础", "gear.baseTitle");
export const gear_unlockLabel = (fbs: FbsAPI) =>fbs("解锁", "gear.unlockLabel");
export const gear_lockLabel = (fbs: FbsAPI) =>fbs("锁定", "gear.lockLabel");
export const gear_modifiedTag = (fbs: FbsAPI) =>fbs("已改", "gear.modifiedTag");
export const gear_baseResetLabel = (fbs: FbsAPI) =>fbs("恢复预设", "gear.baseResetLabel");
export const gear_baseResetTitle = (fbs: FbsAPI) =>fbs("恢复预设？", "gear.baseResetTitle");
export const gear_baseResetBody = (fbs: FbsAPI) =>fbs("角色基础将回到预设值，心法选择保留。", "gear.baseResetBody");
export const gear_xinfaLabelTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["心法 ", fbs.param("n", pv(p, "n"))], "gear.xinfaLabelTemplate");
export const gear_xinfaNoneLabel = (fbs: FbsAPI) =>fbs("— 不选 —", "gear.xinfaNoneLabel");
export const gear_loginHint = (fbs: FbsAPI) =>fbs("装备库与方案按你的 Discord 账号保存，登录后可用（计算与参考数据无需登录）。", "gear.loginHint");
export const gear_libTitle = (fbs: FbsAPI) =>fbs("装备库", "gear.libTitle");
export const gear_myLibTitle = (fbs: FbsAPI) =>fbs("我的装备库", "gear.myLibTitle");
export const gear_myBuildsTitle = (fbs: FbsAPI) =>fbs("我的方案", "gear.myBuildsTitle");
export const gear_libCountTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["共 ", fbs.param("n", pv(p, "n")), " 件"], "gear.libCountTemplate");
export const gear_formSlotLabel = (fbs: FbsAPI) =>fbs("部位", "gear.formSlotLabel");
export const gear_formNameLabel = (fbs: FbsAPI) =>fbs("名称", "gear.formNameLabel");
export const gear_formNamePlaceholder = (fbs: FbsAPI) =>fbs("装备名（可空）", "gear.formNamePlaceholder");
export const gear_affixPlaceholder = (fbs: FbsAPI) =>fbs("选词条", "gear.affixPlaceholder");
export const gear_valuePlaceholder = (fbs: FbsAPI) =>fbs("数值", "gear.valuePlaceholder");
export const gear_refTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["满值 ", fbs.param("max", pv(p, "max")), " / 承音 ", fbs.param("cy", pv(p, "cy"))], "gear.refTemplate");
export const gear_fillMaxLabel = (fbs: FbsAPI) =>fbs("填满值", "gear.fillMaxLabel");
export const gear_fillCyLabel = (fbs: FbsAPI) =>fbs("填承音", "gear.fillCyLabel");
export const gear_delRowLabel = (fbs: FbsAPI) =>fbs("删此行", "gear.delRowLabel");
export const gear_addRowLabel = (fbs: FbsAPI) =>fbs("加一行", "gear.addRowLabel");
export const gear_dyNameLabel = (fbs: FbsAPI) =>fbs("定音名称", "gear.dyNameLabel");
export const gear_dyNamePlaceholder = (fbs: FbsAPI) =>fbs("如 外功穿透 / 无名剑法·蓄力技增伤", "gear.dyNamePlaceholder");
export const gear_dyValLabel = (fbs: FbsAPI) =>fbs("定音数值", "gear.dyValLabel");
export const gear_schoolsLabel = (fbs: FbsAPI) =>fbs("流派标签（武器）", "gear.schoolsLabel");
export const gear_addGearLabel = (fbs: FbsAPI) =>fbs("存入装备库", "gear.addGearLabel");
export const gear_updateGearLabel = (fbs: FbsAPI) =>fbs("保存修改", "gear.updateGearLabel");
export const gear_cancelEditLabel = (fbs: FbsAPI) =>fbs("取消编辑", "gear.cancelEditLabel");
export const gear_demoLabel = (fbs: FbsAPI) =>fbs("载入示例套", "gear.demoLabel");
export const gear_clearLibLabel = (fbs: FbsAPI) =>fbs("清空装备库", "gear.clearLibLabel");
export const gear_clearConfirmTitle = (fbs: FbsAPI) =>fbs("清空装备库？", "gear.clearConfirmTitle");
export const gear_clearConfirmBody = (fbs: FbsAPI) =>fbs("你账号下的全部装备与方案都会删除，当前搭配也会清空，此操作不可恢复。", "gear.clearConfirmBody");
export const gear_equipLabel = (fbs: FbsAPI) =>fbs("选入", "gear.equipLabel");
export const gear_unequipLabel = (fbs: FbsAPI) =>fbs("卸下", "gear.unequipLabel");
export const gear_editLabel = (fbs: FbsAPI) =>fbs("编辑", "gear.editLabel");
export const gear_deleteLabel = (fbs: FbsAPI) =>fbs("删除", "gear.deleteLabel");
export const gear_simLabel = (fbs: FbsAPI) =>fbs("模拟", "gear.simLabel");
export const gear_simRealLabel = (fbs: FbsAPI) =>fbs("实际", "gear.simRealLabel");
export const gear_simCyLabel = (fbs: FbsAPI) =>fbs("承音", "gear.simCyLabel");
export const gear_simMaxLabel = (fbs: FbsAPI) =>fbs("满值", "gear.simMaxLabel");
export const gear_verdictHeirloom = (fbs: FbsAPI) =>fbs("传家宝", "gear.verdictHeirloom");
export const gear_verdictDud = (fbs: FbsAPI) =>fbs("拉完了", "gear.verdictDud");
export const gear_scoreTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["评分 ", fbs.param("score", pv(p, "score"))], "gear.scoreTemplate");
export const gear_qualityLabel = (fbs: FbsAPI) =>fbs("数值达成", "gear.qualityLabel");
export const gear_exportLabel = (fbs: FbsAPI) =>fbs("导出数据", "gear.exportLabel");
export const gear_importLabel = (fbs: FbsAPI) =>fbs("导入数据", "gear.importLabel");
export const gear_importFailedToast = (fbs: FbsAPI) =>fbs("导入失败：文件无效", "gear.importFailedToast");
export const gear_importedToastTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["已导入 ", fbs.param("n", pv(p, "n")), " 件"], "gear.importedToastTemplate");
export const gear_manualTitle = (fbs: FbsAPI) =>fbs("手动录入", "gear.manualTitle");
export const gear_pasteTitle = (fbs: FbsAPI) =>fbs("粘贴代码导入", "gear.pasteTitle");
export const gear_pastePlaceholder = (fbs: FbsAPI) =>fbs("把装备数据代码粘到这里（JSON / Base64 / 文本均可）", "gear.pastePlaceholder");
export const gear_pasteButtonLabel = (fbs: FbsAPI) =>fbs("解析并导入装备库", "gear.pasteButtonLabel");
export const gear_pasteDemoLabel = (fbs: FbsAPI) =>fbs("填入示例代码", "gear.pasteDemoLabel");
export const gear_pasteEmptyText = (fbs: FbsAPI) =>fbs("先把代码粘到上面的框里再点解析。", "gear.pasteEmptyText");
export const gear_pasteOkTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["✓ 已按「", fbs.param("mode", pv(p, "mode")), "」解析，导入 ", fbs.param("n", pv(p, "n")), " 件装备 / ", fbs.param("lines", pv(p, "lines")), " 条词条，已自动选入搭配。"], "gear.pasteOkTemplate");
export const gear_pasteUnknownTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["另有 ", fbs.param("n", pv(p, "n")), " 条没认出的字段被跳过（多半是气血、防御、外功穿透这类本站不计的词条）。"], "gear.pasteUnknownTemplate");
export const gear_pasteFailText = (fbs: FbsAPI) =>fbs("没能从这段代码里认出装备。常见原因：复制时漏了一头一尾、复制的是角色外观分享码（不含装备数值）、或这份数据的字段格式本站还没适配。", "gear.pasteFailText");
export const gear_pasteFullText = (fbs: FbsAPI) =>fbs("识别为本工具导出的数据，已按整库导入处理。", "gear.pasteFullText");
export const gear_ocrTitle = (fbs: FbsAPI) =>fbs("截图导入（本地识别，不上传）", "gear.ocrTitle");
export const gear_ocrDropText = (fbs: FbsAPI) =>fbs("点这里选一张装备详情截图，或拖进来 / Ctrl+V 粘贴", "gear.ocrDropText");
export const gear_ocrPreparingText = (fbs: FbsAPI) =>fbs("正在准备图片…", "gear.ocrPreparingText");
export const gear_ocrRunningText = (fbs: FbsAPI) =>fbs("正在识别（首次会下载中文 + 英文识别包，可能要十几秒）…", "gear.ocrRunningText");
export const gear_ocrSecondText = (fbs: FbsAPI) =>fbs("正在增强识别（第二遍）…", "gear.ocrSecondText");
export const gear_ocrFailedText = (fbs: FbsAPI) =>fbs("识别失败了。常见原因：网络不通下不到识别包、图片太模糊。可以换一张更清晰、完整的详情页截图再试。", "gear.ocrFailedText");
export const gear_ocrBadTypeText = (fbs: FbsAPI) =>fbs("这张图格式不对，只支持 PNG / JPEG / WebP 截图。", "gear.ocrBadTypeText");
export const gear_ocrTooBigText = (fbs: FbsAPI) =>fbs("图片超过 15MB，换一张小一点的截图。", "gear.ocrTooBigText");
export const gear_ocrNoEngineText = (fbs: FbsAPI) =>fbs("识别组件没能加载（OCR 引擎需要联网从 CDN 载入）。检查网络后刷新页面再试；粘贴代码导入不受影响。", "gear.ocrNoEngineText");
export const gear_ocrDoneTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["✓ 识别完成：认出 ", fbs.param("n", pv(p, "n")), " 条词条", fbs.param("slotPart", pv(p, "slotPart")), fbs.param("dyPart", pv(p, "dyPart")), "。请逐行核对数值再确认存入。"], "gear.ocrDoneTemplate");
export const gear_ocrSlotLabel = (fbs: FbsAPI) =>fbs("部位", "gear.ocrSlotLabel");
export const gear_ocrNameLabel = (fbs: FbsAPI) =>fbs("名称", "gear.ocrNameLabel");
export const gear_ocrEquipLabel = (fbs: FbsAPI) =>fbs("存入后直接选入搭配", "gear.ocrEquipLabel");
export const gear_ocrConfirmLabel = (fbs: FbsAPI) =>fbs("确认存入", "gear.ocrConfirmLabel");
export const gear_ocrCancelLabel = (fbs: FbsAPI) =>fbs("放弃", "gear.ocrCancelLabel");
export const gear_ocrUnknownTitle = (fbs: FbsAPI) =>fbs("下面这些行没认出词条，已原样列出（不会丢行）：需要的话点「补一条词条行」手动加上；纯界面文字可忽略。", "gear.ocrUnknownTitle");
export const gear_ocrSavedTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["✓ 已存入装备库：", fbs.param("slot", pv(p, "slot")), "（", fbs.param("n", pv(p, "n")), " 条词条）"], "gear.ocrSavedTemplate");
export const gear_ocrNeedLineToast = (fbs: FbsAPI) =>fbs("至少保留一条有效词条再确认", "gear.ocrNeedLineToast");
export const gear_ocrLowConfTag = (fbs: FbsAPI) =>fbs("低置信，请核对", "gear.ocrLowConfTag");
export const gear_ocrAddRowLabel = (fbs: FbsAPI) =>fbs("补一条词条行", "gear.ocrAddRowLabel");
export const gear_ocrImportSlotTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["导入", fbs.param("slot", pv(p, "slot"))], "gear.ocrImportSlotTemplate");
export const gear_ocrBatchTitle = (fbs: FbsAPI) =>fbs("批量截图识别（全屏截图自动框选 · 本地识别，不上传）", "gear.ocrBatchTitle");
export const gear_ocrBatchDropText = (fbs: FbsAPI) =>fbs("把多张截图拖到这里，或点选多张 / Ctrl+V 粘贴（全屏截图也可以，会自动找装备面板）", "gear.ocrBatchDropText");
export const gear_ocrBatchQueuedText = (fbs: FbsAPI) =>fbs("排队中", "gear.ocrBatchQueuedText");
export const gear_ocrBatchRunningText = (fbs: FbsAPI) =>fbs("识别中…", "gear.ocrBatchRunningText");
export const gear_ocrBatchReadyText = (fbs: FbsAPI) =>fbs("待核对", "gear.ocrBatchReadyText");
export const gear_ocrBatchFailedText = (fbs: FbsAPI) =>fbs("识别失败", "gear.ocrBatchFailedText");
export const gear_ocrBatchImportedText = (fbs: FbsAPI) =>fbs("已导入", "gear.ocrBatchImportedText");
export const gear_ocrBatchRetryLabel = (fbs: FbsAPI) =>fbs("重试", "gear.ocrBatchRetryLabel");
export const gear_ocrBatchRemoveLabel = (fbs: FbsAPI) =>fbs("移除", "gear.ocrBatchRemoveLabel");
export const gear_ocrBatchAdjustLabel = (fbs: FbsAPI) =>fbs("调整框选", "gear.ocrBatchAdjustLabel");
export const gear_ocrBatchApplyBoxLabel = (fbs: FbsAPI) =>fbs("按此框重新识别", "gear.ocrBatchApplyBoxLabel");
export const gear_ocrBatchDetectedText = (fbs: FbsAPI) =>fbs("已自动框选面板", "gear.ocrBatchDetectedText");
export const gear_ocrBatchFullImageText = (fbs: FbsAPI) =>fbs("未定位到面板，按整图识别", "gear.ocrBatchFullImageText");
export const gear_ocrBatchDupTag = (fbs: FbsAPI) =>fbs("重复", "gear.ocrBatchDupTag");
export const gear_ocrBatchDupLibText = (fbs: FbsAPI) =>fbs("与装备库已有装备相同，默认不导入", "gear.ocrBatchDupLibText");
export const gear_ocrBatchDupRowText = (fbs: FbsAPI) =>fbs("与本批另一张相同，默认不导入", "gear.ocrBatchDupRowText");
export const gear_ocrBatchIncludeLabel = (fbs: FbsAPI) =>fbs("导入这件", "gear.ocrBatchIncludeLabel");
export const gear_ocrBatchNoLinesText = (fbs: FbsAPI) =>fbs("没认出词条：请核对部位、补词条行，或调整框选后重新识别（不会自动丢弃）", "gear.ocrBatchNoLinesText");
export const gear_ocrBatchImportTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["全部导入（", fbs.param("n", pv(p, "n")), " 件）"], "gear.ocrBatchImportTemplate");
export const gear_ocrBatchResultTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["✓ 批量导入完成：已导入 ", fbs.param("n", pv(p, "n")), " 件，跳过 ", fbs.param("m", pv(p, "m")), " 件。"], "gear.ocrBatchResultTemplate");
export const gear_libEmptyText = (fbs: FbsAPI) =>fbs("装备库是空的。手动录入、粘贴代码或截图识别都可以加装备。", "gear.libEmptyText");
export const gear_equippedTag = (fbs: FbsAPI) =>fbs("已选入", "gear.equippedTag");
export const gear_loadoutTitle = (fbs: FbsAPI) =>fbs("组合搭配 · 8 个部位", "gear.loadoutTitle");
export const gear_autoLabel = (fbs: FbsAPI) =>fbs("一键最优组合", "gear.autoLabel");
export const gear_autoDoneToast = (fbs: FbsAPI) =>fbs("已拼好", "gear.autoDoneToast");
export const gear_autoFallbackToast = (fbs: FbsAPI) =>fbs("已拼好（含兜底选装）", "gear.autoFallbackToast");
export const gear_unequipAllLabel = (fbs: FbsAPI) =>fbs("全部卸下", "gear.unequipAllLabel");
export const gear_slotEmptyText = (fbs: FbsAPI) =>fbs("未选", "gear.slotEmptyText");
export const gear_panelTitle = (fbs: FbsAPI) =>fbs("面板与毕业度", "gear.panelTitle");
export const gear_gradLabel = (fbs: FbsAPI) =>fbs("毕业度", "gear.gradLabel");
export const gear_gradCountLabel = (fbs: FbsAPI) =>fbs("条数", "gear.gradCountLabel");
export const gear_gradValueLabel = (fbs: FbsAPI) =>fbs("数值", "gear.gradValueLabel");
export const gear_gradDyLabel = (fbs: FbsAPI) =>fbs("定音", "gear.gradDyLabel");
export const gear_gradDyToggleLabel = (fbs: FbsAPI) =>fbs("定音计入毕业度", "gear.gradDyToggleLabel");
export const gear_loanLabel = (fbs: FbsAPI) =>fbs("满值模拟（全套满值时的毕业度）", "gear.loanLabel");
export const gear_simActiveTag = (fbs: FbsAPI) =>fbs("模拟中", "gear.simActiveTag");
export const gear_copySummaryLabel = (fbs: FbsAPI) =>fbs("复制摘要", "gear.copySummaryLabel");
export const gear_copiedToast = (fbs: FbsAPI) =>fbs("已复制", "gear.copiedToast");
export const gear_copyFailedToast = (fbs: FbsAPI) =>fbs("复制失败，请手动记录", "gear.copyFailedToast");
export const gear_yAccLabel = (fbs: FbsAPI) =>fbs("黄字精准", "gear.yAccLabel");
export const gear_yCritLabel = (fbs: FbsAPI) =>fbs("黄字会心", "gear.yCritLabel");
export const gear_yIntLabel = (fbs: FbsAPI) =>fbs("黄字会意", "gear.yIntLabel");
export const gear_finalCritLabel = (fbs: FbsAPI) =>fbs("最终会心", "gear.finalCritLabel");
export const gear_whiteLabel = (fbs: FbsAPI) =>fbs("白字", "gear.whiteLabel");
export const gear_dawaiLabel = (fbs: FbsAPI) =>fbs("大外", "gear.dawaiLabel");
export const gear_xiaowaiLabel = (fbs: FbsAPI) =>fbs("小外", "gear.xiaowaiLabel");
export const gear_dashuLabel = (fbs: FbsAPI) =>fbs("大属", "gear.dashuLabel");
export const gear_xiaoshuLabel = (fbs: FbsAPI) =>fbs("小属", "gear.xiaoshuLabel");
export const gear_hpLabel = (fbs: FbsAPI) =>fbs("气血", "gear.hpLabel");
export const gear_defLabel = (fbs: FbsAPI) =>fbs("防御", "gear.defLabel");
export const gear_talentLabel = (fbs: FbsAPI) =>fbs("天赋", "gear.talentLabel");
export const gear_diffTitle = (fbs: FbsAPI) =>fbs("差缺清单：离毕业还差什么", "gear.diffTitle");
export const gear_diffLackTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["还差 ", fbs.param("n", pv(p, "n"))], "gear.diffLackTemplate");
export const gear_diffExactText = (fbs: FbsAPI) =>fbs("正好", "gear.diffExactText");
export const gear_diffOverTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["多 ", fbs.param("n", pv(p, "n"))], "gear.diffOverTemplate");
export const gear_diffExtraTitle = (fbs: FbsAPI) =>fbs("配方外", "gear.diffExtraTitle");
export const gear_diffLowTitle = (fbs: FbsAPI) =>fbs("未满承音的词条", "gear.diffLowTitle");
export const gear_diffDoneText = (fbs: FbsAPI) =>fbs("✓ 毕业。", "gear.diffDoneText");
export const gear_diffEmptyText = (fbs: FbsAPI) =>fbs("还没选装备。", "gear.diffEmptyText");
export const gear_diffInvalidTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["异常：", fbs.param("n", pv(p, "n")), " 条无相在非武器部位，未计入。"], "gear.diffInvalidTemplate");
export const gear_suggestTitle = (fbs: FbsAPI) =>fbs("建议", "gear.suggestTitle");
export const gear_suggestSwapTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("slot", pv(p, "slot")), "：换上「", fbs.param("name", pv(p, "name")), "」"], "gear.suggestSwapTemplate");
export const gear_suggestWashTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("slot", pv(p, "slot")), "：把第 ", fbs.param("line", pv(p, "line")), " 条 ", fbs.param("from", pv(p, "from")), " 洗成 ", fbs.param("to", pv(p, "to"))], "gear.suggestWashTemplate");
export const gear_suggestNoneText = (fbs: FbsAPI) =>fbs("这套暂时挑不出毛病", "gear.suggestNoneText");
export const gear_suggestHeadTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["当前 ", fbs.param("cur", pv(p, "cur")), "% → 全做 ", fbs.param("final", pv(p, "final")), "%"], "gear.suggestHeadTemplate");
export const gear_dySummaryTitle = (fbs: FbsAPI) =>fbs("定音汇总", "gear.dySummaryTitle");
export const gear_dyCorrectText = (fbs: FbsAPI) =>fbs("对", "gear.dyCorrectText");
export const gear_dyWrongText = (fbs: FbsAPI) =>fbs("类型不符", "gear.dyWrongText");
export const gear_schemeTitle = (fbs: FbsAPI) =>fbs("配装方案对比", "gear.schemeTitle");
export const gear_schemeSaveLabel = (fbs: FbsAPI) =>fbs("存为方案", "gear.schemeSaveLabel");
export const gear_schemeNameTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["方案 ", fbs.param("n", pv(p, "n"))], "gear.schemeNameTemplate");
export const gear_schemeLoadLabel = (fbs: FbsAPI) =>fbs("载入", "gear.schemeLoadLabel");
export const gear_schemeDeleteLabel = (fbs: FbsAPI) =>fbs("删除", "gear.schemeDeleteLabel");
export const gear_schemeEmptyText = (fbs: FbsAPI) =>fbs("还没有保存的方案。", "gear.schemeEmptyText");
export const gear_schemeComposeFirstText = (fbs: FbsAPI) =>fbs("先在配装台拼好一套搭配，才能存为方案。", "gear.schemeComposeFirstText");
export const gear_schemeSavedToastTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["已存方案：", fbs.param("name", pv(p, "name"))], "gear.schemeSavedToastTemplate");
export const gear_schemeLoadedToastTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["已载入：", fbs.param("name", pv(p, "name"))], "gear.schemeLoadedToastTemplate");
export const gear_schemeGroupCountTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("n", pv(p, "n")), " 套"], "gear.schemeGroupCountTemplate");
export const gear_quickTitle = (fbs: FbsAPI) =>fbs("三率速算器", "gear.quickTitle");
export const gear_quickResLabel = (fbs: FbsAPI) =>fbs("抗性", "gear.quickResLabel");
export const gear_quickSyncLabel = (fbs: FbsAPI) =>fbs("从配装台同步", "gear.quickSyncLabel");
export const gear_quickSyncedToast = (fbs: FbsAPI) =>fbs("已同步", "gear.quickSyncedToast");
export const gear_quickOkText = (fbs: FbsAPI) =>fbs("✓ 已满值", "gear.quickOkText");
export const gear_quickOverTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["，溢出 ", fbs.param("v", pv(p, "v")), "%"], "gear.quickOverTemplate");
export const gear_quickGapTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["还差白字 ", fbs.param("lack", pv(p, "lack")), "%（满值 ", fbs.param("need", pv(p, "need")), "%）≈ ", fbs.param("bars", pv(p, "bars")), " 条", fbs.param("barName", pv(p, "barName"))], "gear.quickGapTemplate");
export const gear_recipesTitle = (fbs: FbsAPI) =>fbs("全流派配方表（100 阶 · 承音）", "gear.recipesTitle");
export const gear_recipeSearchPlaceholder = (fbs: FbsAPI) =>fbs("搜流派 / 套装 / 词条", "gear.recipeSearchPlaceholder");
export const gear_recipeAllLabel = (fbs: FbsAPI) =>fbs("全部", "gear.recipeAllLabel");
export const gear_recipeColCat = (fbs: FbsAPI) =>fbs("类别", "gear.recipeColCat");
export const gear_recipeColSchool = (fbs: FbsAPI) =>fbs("流派", "gear.recipeColSchool");
export const gear_recipeColSet = (fbs: FbsAPI) =>fbs("套装", "gear.recipeColSet");
export const gear_recipeColRecipe = (fbs: FbsAPI) =>fbs("词条搭配（承音）", "gear.recipeColRecipe");
export const gear_recipeColBow = (fbs: FbsAPI) =>fbs("推荐弓", "gear.recipeColBow");
export const gear_recipeSetTargetLabel = (fbs: FbsAPI) =>fbs("设为目标", "gear.recipeSetTargetLabel");
export const gear_recipeEmptyText = (fbs: FbsAPI) =>fbs("没有符合的配方。", "gear.recipeEmptyText");
export const gear_recipeTargetToastTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["目标已设为：", fbs.param("school", pv(p, "school")), " · ", fbs.param("set", pv(p, "set"))], "gear.recipeTargetToastTemplate");
export const gear_sectRecipesTitle = (fbs: FbsAPI) =>fbs("100 阶配方（配装台口径）", "gear.sectRecipesTitle");
export const gear_affixTableTitle = (fbs: FbsAPI) =>fbs("词条满值 / 承音对照表（配装台）", "gear.affixTableTitle");
export const gear_colCyLabel = (fbs: FbsAPI) =>fbs("承音", "gear.colCyLabel");
export const gear_colCyPctLabel = (fbs: FbsAPI) =>fbs("承音/满值", "gear.colCyPctLabel");
export const gear_colRecipeNamesLabel = (fbs: FbsAPI) =>fbs("配方叫法", "gear.colRecipeNamesLabel");
export const gear_survivalNote = (fbs: FbsAPI) =>fbs("生存向，配方未列", "gear.survivalNote");
export const gear_slotTableTitle = (fbs: FbsAPI) =>fbs("部位版位表（配装台）", "gear.slotTableTitle");
export const gear_slotsBigTitle = (fbs: FbsAPI) =>fbs("大外流派", "gear.slotsBigTitle");
export const gear_slotsSmallTitle = (fbs: FbsAPI) =>fbs("小外流派", "gear.slotsSmallTitle");
export const gear_formulaTitle = (fbs: FbsAPI) =>fbs("公式与五维换算速查", "gear.formulaTitle");
export const gear_formulaRatesTitle = (fbs: FbsAPI) =>fbs("三率换算", "gear.formulaRatesTitle");
export const gear_formulaDimsTitle = (fbs: FbsAPI) =>fbs("五维换算（每 1 点）", "gear.formulaDimsTitle");
export const gear_formulaOrderTitle = (fbs: FbsAPI) =>fbs("选装顺序", "gear.formulaOrderTitle");
export const gear_formulaAccTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["黄字精准 = 65% +（白字精准 − 65%）÷ 抗性，白字 ", fbs.param("white", pv(p, "white")), "% 满值 100%。"], "gear.formulaAccTemplate");
export const gear_formulaCritTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["黄字会心 = 白字会心 ÷ 抗性，白字 ", fbs.param("white", pv(p, "white")), "% 满值 80%。"], "gear.formulaCritTemplate");
export const gear_formulaIntTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["黄字会意 = 白字会意 ÷ 抗性，白字 ", fbs.param("white", pv(p, "white")), "% 满值 40%。"], "gear.formulaIntTemplate");
export const gear_formulaBarsTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["差几条估算（按承音每条）：精准 ", fbs.param("acc", pv(p, "acc")), " / 会心 ", fbs.param("crit", pv(p, "crit")), " / 会意 ", fbs.param("int", pv(p, "int")), "；敏补会心 ≈ +", fbs.param("minCrit", pv(p, "minCrit")), "% 白字 / 条，势补会意 ≈ +", fbs.param("shiInt", pv(p, "shiInt")), "% 白字 / 条。"], "gear.formulaBarsTemplate");
export const gear_formulaBowTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["弓（弓玦）加成计入白字：精准弓 白字精准 +", fbs.param("acc", pv(p, "acc")), " / 会心弓 白字会心 +", fbs.param("crit", pv(p, "crit")), " / 会意弓 白字会意 +", fbs.param("int", pv(p, "int")), "，再按抗性换算黄字。抗性 ", fbs.param("res", pv(p, "res")), "（当前版本）。"], "gear.formulaBowTemplate");
export const gear_formulaOrderText = (fbs: FbsAPI) =>fbs("定流派 → 对配方 → 录装备。一键最优拼一版 → 看差缺清单补缺。精准先堆满 100%；会心 148% / 会意 74% 封顶，溢出换劲 / 势 / 增伤。两套拿不准，存方案比总分。", "gear.formulaOrderText");
export const gear_colDimLabel = (fbs: FbsAPI) =>fbs("五维", "gear.colDimLabel");
export const gear_colConvLabel = (fbs: FbsAPI) =>fbs("换算", "gear.colConvLabel");
export const gear_colFullBarTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["满条 ", fbs.param("v", pv(p, "v")), " 折合"], "gear.colFullBarTemplate");
export const gear_calcFailedText = (fbs: FbsAPI) =>fbs("计算失败，请稍后再试", "gear.calcFailedText");
export const gear_demoLoadedToast = (fbs: FbsAPI) =>fbs("示例已载入", "gear.demoLoadedToast");
export const gear_savedToastTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["已存入：", fbs.param("name", pv(p, "name"))], "gear.savedToastTemplate");
export const gear_deletedToast = (fbs: FbsAPI) =>fbs("已删除", "gear.deletedToast");
export const gear_clearedToast = (fbs: FbsAPI) =>fbs("已清空", "gear.clearedToast");
