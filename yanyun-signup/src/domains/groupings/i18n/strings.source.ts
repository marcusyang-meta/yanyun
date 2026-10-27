/* fbtee declaration surface for the groupings domain (hand-maintained): this
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

export const groupingType_tabActivity = (fbs: FbsAPI) =>fbs("双十人本", "groupingType.tabActivity");
export const groupingType_tabTalent = (fbs: FbsAPI) =>fbs("天赋组队", "groupingType.tabTalent");
export const groupingType_tabRace = (fbs: FbsAPI) =>fbs("竞速报名", "groupingType.tabRace");
export const groupingType_tabTower = (fbs: FbsAPI) =>fbs("爬塔", "groupingType.tabTower");
export const groupingType_shortActivity = (fbs: FbsAPI) =>fbs("双十", "groupingType.shortActivity");
export const groupingType_shortTalent = (fbs: FbsAPI) =>fbs("天赋", "groupingType.shortTalent");
export const groupingType_shortRace = (fbs: FbsAPI) =>fbs("竞速", "groupingType.shortRace");
export const groupingType_shortTower = (fbs: FbsAPI) =>fbs("爬塔", "groupingType.shortTower");
export const groupingType_shortGather = (fbs: FbsAPI) =>fbs("采集", "groupingType.shortGather");
export const groupingType_shortExplore = (fbs: FbsAPI) =>fbs("探索", "groupingType.shortExplore");
export const groupingList_prevWeek = (fbs: FbsAPI) =>fbs("上一周", "groupingList.prevWeek");
export const groupingList_nextWeek = (fbs: FbsAPI) =>fbs("下一周", "groupingList.nextWeek");
export const groupingList_weekHeader = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("range", pv(p, "range")), " · ", fbs.param("count", pv(p, "count")), " 队"], "groupingList.weekHeader");
export const groupingList_emptyInteractive = (fbs: FbsAPI) =>fbs("暂无车队，来发第一车吧", "groupingList.emptyInteractive");
export const groupingList_emptyReadonly = (fbs: FbsAPI) =>fbs("暂无车队", "groupingList.emptyReadonly");
export const groupingList_statusOpen = (fbs: FbsAPI) =>fbs("报名中", "groupingList.statusOpen");
export const groupingList_people = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("occupied", pv(p, "occupied")), "/", fbs.param("max", pv(p, "max")), " 人"], "groupingList.people");
export const groupingList_newCar = (fbs: FbsAPI) =>fbs("📯 张贴告示 · 发新车", "groupingList.newCar");
export const groupingList_seal = (fbs: FbsAPI) =>fbs("募", "groupingList.seal");
export const groupingList_dayGroupHeader = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("month", pv(p, "month")), "月", fbs.param("day", pv(p, "day")), "日 ", fbs.param("weekday", pv(p, "weekday"))], "groupingList.dayGroupHeader");
export const groupingList_weekday0 = (fbs: FbsAPI) =>fbs("周日", "groupingList.weekday0");
export const groupingList_weekday1 = (fbs: FbsAPI) =>fbs("周一", "groupingList.weekday1");
export const groupingList_weekday2 = (fbs: FbsAPI) =>fbs("周二", "groupingList.weekday2");
export const groupingList_weekday3 = (fbs: FbsAPI) =>fbs("周三", "groupingList.weekday3");
export const groupingList_weekday4 = (fbs: FbsAPI) =>fbs("周四", "groupingList.weekday4");
export const groupingList_weekday5 = (fbs: FbsAPI) =>fbs("周五", "groupingList.weekday5");
export const groupingList_weekday6 = (fbs: FbsAPI) =>fbs("周六", "groupingList.weekday6");
export const groupingList_undatedGroup = (fbs: FbsAPI) =>fbs("未定时间", "groupingList.undatedGroup");
export const groupingDetail_notFound = (fbs: FbsAPI) =>fbs("车队不存在或已解散", "groupingDetail.notFound");
export const groupingDetail_backToList = (fbs: FbsAPI) =>fbs("‹ 返回车队列表", "groupingDetail.backToList");
export const groupingDetail_share = (fbs: FbsAPI) =>fbs("🔗 分享车队", "groupingDetail.share");
export const groupingDetail_edit = (fbs: FbsAPI) =>fbs("✏️ 编辑", "groupingDetail.edit");
export const groupingDetail_disband = (fbs: FbsAPI) =>fbs("解散车队", "groupingDetail.disband");
export const groupingDetail_disbanding = (fbs: FbsAPI) =>fbs("解散中…", "groupingDetail.disbanding");
export const groupingDetail_statusOpen = (fbs: FbsAPI) =>fbs("报名中", "groupingDetail.statusOpen");
export const groupingDetail_people = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("occupied", pv(p, "occupied")), "/", fbs.param("max", pv(p, "max")), " 人"], "groupingDetail.people");
export const groupingDetail_readyProgress = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["已就位 ", fbs.param("ready", pv(p, "ready")), "/", fbs.param("occupied", pv(p, "occupied"))], "groupingDetail.readyProgress");
export const groupingDetail_openHint = (fbs: FbsAPI) =>fbs("人人可管 · 无需管理码 — 点空位即可落座", "groupingDetail.openHint");
export const groupingDetail_readonlyHint = (fbs: FbsAPI) =>fbs("只读浏览 · 该百业尚未绑定 Discord 服务器", "groupingDetail.readonlyHint");
export const groupingDetail_toastDisbanded = (fbs: FbsAPI) =>fbs("车队已解散", "groupingDetail.toastDisbanded");
export const groupingDetail_toastDisbandFailed = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["解散失败：", fbs.param("error", pv(p, "error"))], "groupingDetail.toastDisbandFailed");
export const groupingDetail_linkCopied = (fbs: FbsAPI) =>fbs("链接已复制", "groupingDetail.linkCopied");
export const groupingDetail_copyFailedManual = (fbs: FbsAPI) =>fbs("复制失败，请手动复制地址栏链接", "groupingDetail.copyFailedManual");
export const groupingDetail_disbandConfirmTitle = (fbs: FbsAPI) =>fbs("解散车队", "groupingDetail.disbandConfirmTitle");
export const groupingDetail_disbandConfirmMessage = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["确定解散「", fbs.param("title", pv(p, "title")), "」吗？所有报名将被清空。"], "groupingDetail.disbandConfirmMessage");
export const groupingDetail_complete = (fbs: FbsAPI) =>fbs("完成车队", "groupingDetail.complete");
export const groupingDetail_completing = (fbs: FbsAPI) =>fbs("完成中…", "groupingDetail.completing");
export const groupingDetail_statusCompleted = (fbs: FbsAPI) =>fbs("已完成", "groupingDetail.statusCompleted");
export const groupingDetail_restore = (fbs: FbsAPI) =>fbs("恢复车队", "groupingDetail.restore");
export const groupingDetail_completeConfirmTitle = (fbs: FbsAPI) =>fbs("完成车队", "groupingDetail.completeConfirmTitle");
export const groupingDetail_completeConfirmMessage = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["确定完成「", fbs.param("title", pv(p, "title")), "」吗？完成后将从车队列表隐藏，也不再发送发车提醒；之后仍可在本页恢复。"], "groupingDetail.completeConfirmMessage");
export const groupingDetail_toastCompleted = (fbs: FbsAPI) =>fbs("车队已完成", "groupingDetail.toastCompleted");
export const groupingDetail_toastCompleteFailed = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["完成失败：", fbs.param("error", pv(p, "error"))], "groupingDetail.toastCompleteFailed");
export const groupingDetail_toastRestored = (fbs: FbsAPI) =>fbs("车队已恢复", "groupingDetail.toastRestored");
export const groupingDetail_toastRestoreFailed = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["恢复失败：", fbs.param("error", pv(p, "error"))], "groupingDetail.toastRestoreFailed");
export const groupingDetail_completedHint = (fbs: FbsAPI) =>fbs("该车队已完成 · 已从列表隐藏，不再发送发车提醒", "groupingDetail.completedHint");
export const groupingForm_createTitle = (fbs: FbsAPI) =>fbs("张贴告示", "groupingForm.createTitle");
export const groupingForm_editTitle = (fbs: FbsAPI) =>fbs("编辑告示", "groupingForm.editTitle");
export const groupingForm_typeLabel = (fbs: FbsAPI) =>fbs("类型", "groupingForm.typeLabel");
export const groupingForm_capacity = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["人数上限 ", fbs.param("max", pv(p, "max")), " 人（", fbs.param("hint", pv(p, "hint")), "）"], "groupingForm.capacity");
export const groupingForm_hintActivity = (fbs: FbsAPI) =>fbs("双十固定 10 人，不选副本", "groupingForm.hintActivity");
export const groupingForm_hintDungeon = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["按所选副本「", fbs.param("name", pv(p, "name")), "」", fbs.param("max", pv(p, "max")), " 人"], "groupingForm.hintDungeon");
export const groupingForm_hintTalent = (fbs: FbsAPI) =>fbs("天赋默认 5 人，选副本后按副本人数", "groupingForm.hintTalent");
export const groupingForm_hintRace = (fbs: FbsAPI) =>fbs("竞速默认 10 人，选副本后按副本人数", "groupingForm.hintRace");
export const groupingForm_hintTower = (fbs: FbsAPI) =>fbs("爬塔固定 10 人，不选副本", "groupingForm.hintTower");
export const groupingForm_titleLabel = (fbs: FbsAPI) =>fbs("标题", "groupingForm.titleLabel");
export const groupingForm_titlePlaceholder = (fbs: FbsAPI) =>fbs("如：周六晚双十来奶", "groupingForm.titlePlaceholder");
export const groupingForm_startsLabel = (fbs: FbsAPI) =>fbs("出发时间", "groupingForm.startsLabel");
export const groupingForm_monthOption = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("n", pv(p, "n")), "月"], "groupingForm.monthOption");
export const groupingForm_dayOption = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("n", pv(p, "n")), "日"], "groupingForm.dayOption");
export const groupingForm_hourOption = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("n", pv(p, "n")), "时"], "groupingForm.hourOption");
export const groupingForm_minuteOption = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("n", pv(p, "n")), "分"], "groupingForm.minuteOption");
export const groupingForm_dungeonLabel = (fbs: FbsAPI) =>fbs("副本（可选）", "groupingForm.dungeonLabel");
export const groupingForm_dungeonNone = (fbs: FbsAPI) =>fbs("不指定", "groupingForm.dungeonNone");
export const groupingForm_nicknameLabel = (fbs: FbsAPI) =>fbs("你的昵称（发车人自动落座 0 号位）", "groupingForm.nicknameLabel");
export const groupingForm_nicknamePlaceholder = (fbs: FbsAPI) =>fbs("游戏内昵称", "groupingForm.nicknamePlaceholder");
export const groupingForm_sectLabel = (fbs: FbsAPI) =>fbs("你的流派", "groupingForm.sectLabel");
export const groupingForm_submitCreate = (fbs: FbsAPI) =>fbs("发布", "groupingForm.submitCreate");
export const groupingForm_submitEdit = (fbs: FbsAPI) =>fbs("保存", "groupingForm.submitEdit");
export const groupingForm_submitting = (fbs: FbsAPI) =>fbs("提交中…", "groupingForm.submitting");
export const groupingForm_toastSect = (fbs: FbsAPI) =>fbs("请选择你的流派", "groupingForm.toastSect");
export const groupingForm_toastSaved = (fbs: FbsAPI) =>fbs("已保存", "groupingForm.toastSaved");
export const groupingForm_toastSaveFailed = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["保存失败：", fbs.param("error", pv(p, "error"))], "groupingForm.toastSaveFailed");
export const groupingForm_toastPosted = (fbs: FbsAPI) =>fbs("告示已张贴", "groupingForm.toastPosted");
export const groupingForm_toastCreateFailed = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["创建失败：", fbs.param("error", pv(p, "error"))], "groupingForm.toastCreateFailed");
export const groupingForm_titleTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("nickname", pv(p, "nickname")), "的", fbs.param("type", pv(p, "type")), "车队"], "groupingForm.titleTemplate");
export const seat_emptyJoin = (fbs: FbsAPI) =>fbs("空位 · 点击落座", "seat.emptyJoin");
export const seat_empty = (fbs: FbsAPI) =>fbs("空位", "seat.empty");
export const seat_modalTitle = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["落座 · ", fbs.param("n", pv(p, "n")), " 号位"], "seat.modalTitle");
export const seat_modalSubtitle = (fbs: FbsAPI) =>fbs("人人可管 · 无需管理码", "seat.modalSubtitle");
export const seat_nameLabel = (fbs: FbsAPI) =>fbs("名字", "seat.nameLabel");
export const seat_namePlaceholder = (fbs: FbsAPI) =>fbs("你的名字", "seat.namePlaceholder");
export const seat_nameRequired = (fbs: FbsAPI) =>fbs("请填写名字", "seat.nameRequired");
export const seat_selfTab = (fbs: FbsAPI) =>fbs("自己报名", "seat.selfTab");
export const seat_proxyTab = (fbs: FbsAPI) =>fbs("代报名", "seat.proxyTab");
export const seat_selfNameHint = (fbs: FbsAPI) =>fbs("名字取自你的 Discord 昵称，不可修改", "seat.selfNameHint");
export const seat_proxySearchPlaceholder = (fbs: FbsAPI) =>fbs("搜索成员名字", "seat.proxySearchPlaceholder");
export const seat_proxyPickRequired = (fbs: FbsAPI) =>fbs("请选择要代报的成员", "seat.proxyPickRequired");
export const seat_proxyEmpty = (fbs: FbsAPI) =>fbs("名册里还没有成员", "seat.proxyEmpty");
export const seat_sectLabel = (fbs: FbsAPI) =>fbs("流派", "seat.sectLabel");
export const seat_confirmJoin = (fbs: FbsAPI) =>fbs("确认落座", "seat.confirmJoin");
export const seat_joining = (fbs: FbsAPI) =>fbs("落座中…", "seat.joining");
export const seat_toastSect = (fbs: FbsAPI) =>fbs("请选择流派", "seat.toastSect");
export const seat_toastJoined = (fbs: FbsAPI) =>fbs("落座成功", "seat.toastJoined");
export const seat_toastJoinFailed = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["报名失败：", fbs.param("error", pv(p, "error"))], "seat.toastJoinFailed");
export const seat_toastLeft = (fbs: FbsAPI) =>fbs("已取消报名", "seat.toastLeft");
export const seat_toastLeaveFailed = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["取消失败：", fbs.param("error", pv(p, "error"))], "seat.toastLeaveFailed");
export const seat_leaveConfirmTitle = (fbs: FbsAPI) =>fbs("取消报名", "seat.leaveConfirmTitle");
export const seat_leaveConfirmMessage = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["确定取消「", fbs.param("nickname", pv(p, "nickname")), "」的报名吗？"], "seat.leaveConfirmMessage");
export const seat_roleHealer = (fbs: FbsAPI) =>fbs("奶", "seat.roleHealer");
export const seat_roleDps = (fbs: FbsAPI) =>fbs("输出", "seat.roleDps");
export const seat_leader = (fbs: FbsAPI) =>fbs("车头", "seat.leader");
export const seat_readyMark = (fbs: FbsAPI) =>fbs("已就位", "seat.readyMark");
export const seat_readyAction = (fbs: FbsAPI) =>fbs("我已就位", "seat.readyAction");
export const seat_unreadyAction = (fbs: FbsAPI) =>fbs("取消就位", "seat.unreadyAction");
export const seat_toastReady = (fbs: FbsAPI) =>fbs("已标记就位", "seat.toastReady");
export const seat_toastUnready = (fbs: FbsAPI) =>fbs("已取消就位", "seat.toastUnready");
export const seat_toastReadyFailed = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["操作失败：", fbs.param("error", pv(p, "error"))], "seat.toastReadyFailed");
export const groupingTemplate_sectionTitle = (fbs: FbsAPI) =>fbs("车队模板", "groupingTemplate.sectionTitle");
export const groupingTemplate_nameLabel = (fbs: FbsAPI) =>fbs("模板名", "groupingTemplate.nameLabel");
export const groupingTemplate_namePlaceholder = (fbs: FbsAPI) =>fbs("给模板起个名字", "groupingTemplate.namePlaceholder");
export const groupingTemplate_saveFromForm = (fbs: FbsAPI) =>fbs("存为模板", "groupingTemplate.saveFromForm");
export const groupingTemplate_updateSubmit = (fbs: FbsAPI) =>fbs("保存模板修改", "groupingTemplate.updateSubmit");
export const groupingTemplate_editingNotice = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["正在编辑模板「", fbs.param("name", pv(p, "name")), "」"], "groupingTemplate.editingNotice");
export const groupingTemplate_cancelEdit = (fbs: FbsAPI) =>fbs("取消编辑", "groupingTemplate.cancelEdit");
export const groupingTemplate_empty = (fbs: FbsAPI) =>fbs("还没有模板，把常用配置存下来，下次一键预填", "groupingTemplate.empty");
export const groupingTemplate_whenToday = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["今天 ", fbs.param("time", pv(p, "time")), " 发车"], "groupingTemplate.whenToday");
export const groupingTemplate_whenTomorrow = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["明天 ", fbs.param("time", pv(p, "time")), " 发车"], "groupingTemplate.whenTomorrow");
export const groupingTemplate_whenDays = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("days", pv(p, "days")), " 天后 ", fbs.param("time", pv(p, "time")), " 发车"], "groupingTemplate.whenDays");
export const groupingTemplate_toastSaved = (fbs: FbsAPI) =>fbs("模板已保存", "groupingTemplate.toastSaved");
export const groupingTemplate_toastSaveFailed = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["模板保存失败：", fbs.param("error", pv(p, "error"))], "groupingTemplate.toastSaveFailed");
export const groupingTemplate_toastDeleted = (fbs: FbsAPI) =>fbs("模板已删除", "groupingTemplate.toastDeleted");
export const groupingTemplate_toastDeleteFailed = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["模板删除失败：", fbs.param("error", pv(p, "error"))], "groupingTemplate.toastDeleteFailed");
export const groupingTemplate_edit = (fbs: FbsAPI) =>fbs("编辑", "groupingTemplate.edit");
export const groupingTemplate_delete = (fbs: FbsAPI) =>fbs("删除", "groupingTemplate.delete");
export const groupingTemplate_deleteConfirmTitle = (fbs: FbsAPI) =>fbs("删除模板", "groupingTemplate.deleteConfirmTitle");
export const groupingTemplate_deleteConfirmMessage = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["确定删除模板「", fbs.param("name", pv(p, "name")), "」吗？"], "groupingTemplate.deleteConfirmMessage");
export const groupingTemplate_saveButton = (fbs: FbsAPI) =>fbs("📋 存为模板", "groupingTemplate.saveButton");
export const groupingTemplate_saveDialogTitle = (fbs: FbsAPI) =>fbs("存为车队模板", "groupingTemplate.saveDialogTitle");
export const groupingTemplate_saveSubmit = (fbs: FbsAPI) =>fbs("保存模板", "groupingTemplate.saveSubmit");
export const groupingTemplate_toastSavedFromCar = (fbs: FbsAPI) =>fbs("已存为模板，可在发新车时一键预填", "groupingTemplate.toastSavedFromCar");
export const groupingTemplate_metaTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("type", pv(p, "type")), fbs.param("dungeon", pv(p, "dungeon")), " · ", fbs.param("max", pv(p, "max")), " 人"], "groupingTemplate.metaTemplate");
