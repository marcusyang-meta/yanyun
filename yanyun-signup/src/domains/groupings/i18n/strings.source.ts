/* fbtee declaration surface for the groupings domain (hand-maintained): this
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

export abstract class GroupingTypeFbtUtils {
  static tabActivity(fbs: FbsAPI) { return fbs("双十人本", "Full tab label for the ten-player dungeon grouping type in grouping lists and forms."); }
  static tabTalent(fbs: FbsAPI) { return fbs("天赋组队", "Full tab label for the talent grouping type in grouping lists and forms."); }
  static tabRace(fbs: FbsAPI) { return fbs("竞速报名", "Full tab label for the racing signup grouping type in grouping lists and forms."); }
  static tabTower(fbs: FbsAPI) { return fbs("爬塔", "Full tab label for the tower-climbing grouping type in grouping lists and forms."); }
  static shortActivity(fbs: FbsAPI) { return fbs("双十", "Short label for the ten-player dungeon grouping type, used in compact lists and block compositions."); }
  static shortTalent(fbs: FbsAPI) { return fbs("天赋", "Short label for the talent grouping type, used in compact lists and block compositions."); }
  static shortRace(fbs: FbsAPI) { return fbs("竞速", "Short label for the racing grouping type, used in compact lists and block compositions."); }
  static shortTower(fbs: FbsAPI) { return fbs("爬塔", "Short label for the tower grouping type, used in compact lists and block compositions."); }
  static shortGather(fbs: FbsAPI) { return fbs("采集", "Short label for the gathering grouping type, used in compact lists and block compositions."); }
  static shortExplore(fbs: FbsAPI) { return fbs("探索", "Short label for the exploration grouping type, used in compact lists and block compositions."); }
}

export abstract class GroupingListFbtUtils {
  static prevWeek(fbs: FbsAPI) { return fbs("上一周", "Button label in the grouping list that moves the weekly view to the previous week."); }
  static nextWeek(fbs: FbsAPI) { return fbs("下一周", "Button label in the grouping list that moves the weekly view to the next week."); }
  static weekHeader(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("range", pv(p, "range")), " · ", fbs.param("count", pv(p, "count")), " 队"], "Header of a week group in the grouping list; {range} is the week's date range and {count} is the number of squads in that week."); }
  static emptyInteractive(fbs: FbsAPI) { return fbs("暂无车队，来发第一车吧", "Empty-state text in the grouping list when the viewer can create squads, inviting them to post the first one."); }
  static emptyReadonly(fbs: FbsAPI) { return fbs("暂无车队", "Empty-state text in the grouping list for read-only viewers when there are no squads."); }
  static statusOpen(fbs: FbsAPI) { return fbs("报名中", "Status badge on a squad card in the grouping list while signups are open."); }
  static people(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("occupied", pv(p, "occupied")), "/", fbs.param("max", pv(p, "max")), " 人"], "Seat occupancy shown on a squad card; {occupied} is the number of taken seats and {max} the squad size."); }
  static newCar(fbs: FbsAPI) { return fbs("📯 张贴告示 · 发新车", "Label of the button in the grouping list that opens the create-squad form."); }
  static seal(fbs: FbsAPI) { return fbs("募", "Single-character seal glyph shown on squad cards in the grouping list, marking an open call for members."); }
  static dayGroupHeader(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("month", pv(p, "month")), "月", fbs.param("day", pv(p, "day")), "日 ", fbs.param("weekday", pv(p, "weekday"))], "Header of a day group in the grouping list; {month} and {day} are the date and {weekday} the localized weekday name."); }
  static weekday0(fbs: FbsAPI) { return fbs("周日", "Weekday name for Sunday, used in grouping list day headers and schedule views."); }
  static weekday1(fbs: FbsAPI) { return fbs("周一", "Weekday name for Monday, used in grouping list day headers and schedule views."); }
  static weekday2(fbs: FbsAPI) { return fbs("周二", "Weekday name for Tuesday, used in grouping list day headers and schedule views."); }
  static weekday3(fbs: FbsAPI) { return fbs("周三", "Weekday name for Wednesday, used in grouping list day headers and schedule views."); }
  static weekday4(fbs: FbsAPI) { return fbs("周四", "Weekday name for Thursday, used in grouping list day headers and schedule views."); }
  static weekday5(fbs: FbsAPI) { return fbs("周五", "Weekday name for Friday, used in grouping list day headers and schedule views."); }
  static weekday6(fbs: FbsAPI) { return fbs("周六", "Weekday name for Saturday, used in grouping list day headers and schedule views."); }
  static undatedGroup(fbs: FbsAPI) { return fbs("未定时间", "Header of the group in the grouping list for squads whose start time is not decided yet."); }
}

export abstract class GroupingDetailFbtUtils {
  static notFound(fbs: FbsAPI) { return fbs("车队不存在或已解散", "Message shown when a squad page is opened for a squad that does not exist or has been disbanded."); }
  static backToList(fbs: FbsAPI) { return fbs("‹ 返回车队列表", "Back link at the top of the squad detail page, returning to the squad list."); }
  static share(fbs: FbsAPI) { return fbs("🔗 分享车队", "Button label on the squad detail page that copies the squad's share link."); }
  static edit(fbs: FbsAPI) { return fbs("✏️ 编辑", "Button label on the squad detail page that opens the edit form; only composed for the squad leader or a guild admin."); }
  static disband(fbs: FbsAPI) { return fbs("解散车队", "Button label on the squad detail page that disbands the squad; only composed for the squad leader or a guild admin."); }
  static disbanding(fbs: FbsAPI) { return fbs("解散中…", "Disband button label on the squad detail page while the disband request is in progress."); }
  static statusOpen(fbs: FbsAPI) { return fbs("报名中", "Status badge on the squad detail page while signups are open."); }
  static people(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("occupied", pv(p, "occupied")), "/", fbs.param("max", pv(p, "max")), " 人"], "Seat occupancy on the squad detail page; {occupied} is the number of taken seats and {max} the squad size."); }
  static readyProgress(fbs: FbsAPI, p?: StringParams) { return fbs(["已就位 ", fbs.param("ready", pv(p, "ready")), "/", fbs.param("occupied", pv(p, "occupied"))], "Ready-check progress on the squad detail page; {ready} is the number of seated members marked ready and {occupied} the number of taken seats."); }
  static openHint(fbs: FbsAPI) { return fbs("人人可管 · 无需管理码 — 点空位即可落座", "Hint on the squad detail page for interactive viewers: anyone may manage, no admin code is needed, and tapping an empty seat signs up."); }
  static readonlyHint(fbs: FbsAPI) { return fbs("只读浏览 · 该百业尚未绑定 Discord 服务器", "Hint on the squad detail page when the guild has not bound a Discord server and the page is read-only."); }
  static toastDisbanded(fbs: FbsAPI) { return fbs("车队已解散", "Toast shown after a squad is disbanded."); }
  static toastDisbandFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["解散失败：", fbs.param("error", pv(p, "error"))], "Toast shown when disbanding a squad fails; {error} is the error message."); }
  static linkCopied(fbs: FbsAPI) { return fbs("链接已复制", "Toast shown after the squad share link is copied to the clipboard."); }
  static copyFailedManual(fbs: FbsAPI) { return fbs("复制失败，请手动复制地址栏链接", "Toast shown when copying the share link fails, asking the user to copy the address bar link manually."); }
  static disbandConfirmTitle(fbs: FbsAPI) { return fbs("解散车队", "Title of the confirmation dialog for disbanding a squad."); }
  static disbandConfirmMessage(fbs: FbsAPI, p?: StringParams) { return fbs(["确定解散「", fbs.param("title", pv(p, "title")), "」吗？所有报名将被清空。"], "Body of the disband confirmation dialog; {title} is the squad title, and the text warns all signups will be cleared."); }
  static complete(fbs: FbsAPI) { return fbs("完成车队", "Button label on the squad detail page that marks the squad as completed; only composed for the squad leader or a guild admin."); }
  static completing(fbs: FbsAPI) { return fbs("完成中…", "Complete button label on the squad detail page while the completion request is in progress."); }
  static statusCompleted(fbs: FbsAPI) { return fbs("已完成", "Status badge on the squad detail page for a completed squad."); }
  static restore(fbs: FbsAPI) { return fbs("恢复车队", "Button label on the squad detail page that restores a completed squad to open state."); }
  static completeConfirmTitle(fbs: FbsAPI) { return fbs("完成车队", "Title of the confirmation dialog for completing a squad."); }
  static completeConfirmMessage(fbs: FbsAPI, p?: StringParams) { return fbs(["确定完成「", fbs.param("title", pv(p, "title")), "」吗？完成后将从车队列表隐藏，也不再发送发车提醒；之后仍可在本页恢复。"], "Body of the complete confirmation dialog; {title} is the squad title, and the text explains the squad will be hidden from the list and stop sending reminders but can be restored from this page."); }
  static toastCompleted(fbs: FbsAPI) { return fbs("车队已完成", "Toast shown after a squad is marked completed."); }
  static toastCompleteFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["完成失败：", fbs.param("error", pv(p, "error"))], "Toast shown when completing a squad fails; {error} is the error message."); }
  static toastRestored(fbs: FbsAPI) { return fbs("车队已恢复", "Toast shown after a completed squad is restored."); }
  static toastRestoreFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["恢复失败：", fbs.param("error", pv(p, "error"))], "Toast shown when restoring a squad fails; {error} is the error message."); }
  static completedHint(fbs: FbsAPI) { return fbs("该车队已完成 · 已从列表隐藏，不再发送发车提醒", "Hint banner on the detail page of a completed squad: it is hidden from the list and no longer sends departure reminders."); }
  static rosterAnswersTitle(fbs: FbsAPI) { return fbs("报名表答案", "Title of the section on the squad detail page listing signups' answers to the custom signup form; only composed for viewers who manage the squad."); }
}

export abstract class GroupingFormFbtUtils {
  static createTitle(fbs: FbsAPI) { return fbs("张贴告示", "Title of the form for posting a new squad (create mode)."); }
  static editTitle(fbs: FbsAPI) { return fbs("编辑告示", "Title of the squad form in edit mode."); }
  static typeLabel(fbs: FbsAPI) { return fbs("类型", "Label of the grouping type selector on the squad form."); }
  static capacity(fbs: FbsAPI, p?: StringParams) { return fbs(["人数上限 ", fbs.param("max", pv(p, "max")), " 人（", fbs.param("hint", pv(p, "hint")), "）"], "Capacity line on the squad form; {max} is the seat cap and {hint} explains how the cap is derived for the chosen type."); }
  static hintActivity(fbs: FbsAPI) { return fbs("双十固定 10 人，不选副本", "Capacity hint on the squad form for the ten-player type: fixed at ten seats and no dungeon is chosen."); }
  static hintDungeon(fbs: FbsAPI, p?: StringParams) { return fbs(["按所选副本「", fbs.param("name", pv(p, "name")), "」", fbs.param("max", pv(p, "max")), " 人"], "Capacity hint on the squad form when a dungeon is selected; {name} is the dungeon name and {max} its player count."); }
  static hintTalent(fbs: FbsAPI) { return fbs("天赋默认 5 人，选副本后按副本人数", "Capacity hint on the squad form for the talent type: five seats by default, or the dungeon's player count once a dungeon is chosen."); }
  static hintRace(fbs: FbsAPI) { return fbs("竞速默认 10 人，选副本后按副本人数", "Capacity hint on the squad form for the racing type: ten seats by default, or the dungeon's player count once a dungeon is chosen."); }
  static hintTower(fbs: FbsAPI) { return fbs("爬塔固定 10 人，不选副本", "Capacity hint on the squad form for the tower type: fixed at ten seats and no dungeon is chosen."); }
  static titleLabel(fbs: FbsAPI) { return fbs("标题", "Label of the squad title field on the squad form."); }
  static titlePlaceholder(fbs: FbsAPI) { return fbs("如：周六晚双十来奶", "Placeholder example text in the squad title field."); }
  static startsLabel(fbs: FbsAPI) { return fbs("出发时间", "Label of the departure time picker on the squad form."); }
  static monthOption(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("n", pv(p, "n")), "月"], "Month option in the departure time picker on the squad form; {n} is the month number."); }
  static dayOption(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("n", pv(p, "n")), "日"], "Day option in the departure time picker on the squad form; {n} is the day of the month."); }
  static hourOption(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("n", pv(p, "n")), "时"], "Hour option in the departure time picker on the squad form; {n} is the hour."); }
  static minuteOption(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("n", pv(p, "n")), "分"], "Minute option in the departure time picker on the squad form; {n} is the minute."); }
  static dungeonLabel(fbs: FbsAPI) { return fbs("副本（可选）", "Label of the optional dungeon selector on the squad form."); }
  static dungeonNone(fbs: FbsAPI) { return fbs("不指定", "Option in the dungeon selector on the squad form meaning no dungeon is specified."); }
  static nicknameLabel(fbs: FbsAPI) { return fbs("你的昵称（发车人自动落座 0 号位）", "Label of the nickname field on the squad form, noting the poster is auto-seated in seat zero."); }
  static nicknamePlaceholder(fbs: FbsAPI) { return fbs("游戏内昵称", "Placeholder text in the nickname field on the squad form, asking for the in-game nickname."); }
  static sectLabel(fbs: FbsAPI) { return fbs("你的流派", "Label of the poster's sect selector on the squad form."); }
  static submitCreate(fbs: FbsAPI) { return fbs("发布", "Submit button label on the squad form in create mode."); }
  static submitEdit(fbs: FbsAPI) { return fbs("保存", "Submit button label on the squad form in edit mode."); }
  static submitting(fbs: FbsAPI) { return fbs("提交中…", "Submit button label on the squad form while the request is in progress."); }
  static toastSect(fbs: FbsAPI) { return fbs("请选择你的流派", "Toast shown when the squad form is submitted without choosing a sect."); }
  static toastSaved(fbs: FbsAPI) { return fbs("已保存", "Toast shown after an edited squad is saved."); }
  static toastSaveFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["保存失败：", fbs.param("error", pv(p, "error"))], "Toast shown when saving a squad fails; {error} is the error message."); }
  static toastPosted(fbs: FbsAPI) { return fbs("告示已张贴", "Toast shown after a new squad is posted."); }
  static toastCreateFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["创建失败：", fbs.param("error", pv(p, "error"))], "Toast shown when creating a squad fails; {error} is the error message."); }
  static titleTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("nickname", pv(p, "nickname")), "的", fbs.param("type", pv(p, "type")), "车队"], "Default squad title template on the squad form; {nickname} is the poster's nickname and {type} the grouping type name."); }
  static customFieldsTitle(fbs: FbsAPI) { return fbs("报名表自定义字段", "Title of the custom signup fields editor section on the squad form."); }
  static customFieldAddLabel(fbs: FbsAPI) { return fbs("添加字段", "Button label in the custom fields editor that adds another signup field."); }
  static customFieldLabelPlaceholder(fbs: FbsAPI) { return fbs("字段名（如：联系方式）", "Placeholder text for a custom signup field's name input, with an example such as a contact field."); }
  static customFieldTypeText(fbs: FbsAPI) { return fbs("单行文本", "Field type option in the custom fields editor for a single-line text answer."); }
  static customFieldTypeChoice(fbs: FbsAPI) { return fbs("单选", "Field type option in the custom fields editor for a single-choice answer."); }
  static customFieldOptionsPlaceholder(fbs: FbsAPI) { return fbs("选项，一行一个（2–6 个）", "Placeholder text for the options textarea of a choice-type signup field, one option per line, two to six options."); }
  static customFieldRequiredLabel(fbs: FbsAPI) { return fbs("必填", "Label of the required toggle for a custom signup field in the editor."); }
  static customFieldRemoveLabel(fbs: FbsAPI) { return fbs("删除", "Button label that removes a custom signup field in the editor."); }
  static customFieldEmptyText(fbs: FbsAPI) { return fbs("未设置自定义字段时，成员报名只填固定信息。", "Explanation in the custom fields editor when no custom fields exist: members then only fill in the fixed signup information."); }
}

export abstract class SeatFbtUtils {
  static emptyJoin(fbs: FbsAPI) { return fbs("空位 · 点击落座", "Label of an empty seat that the viewer can tap to sign up for it."); }
  static empty(fbs: FbsAPI) { return fbs("空位", "Label of an empty seat shown to viewers who cannot sign up."); }
  static modalTitle(fbs: FbsAPI, p?: StringParams) { return fbs(["落座 · ", fbs.param("n", pv(p, "n")), " 号位"], "Title of the seat signup dialog; {n} is the seat number."); }
  static modalSubtitle(fbs: FbsAPI) { return fbs("人人可管 · 无需管理码", "Subtitle of the seat signup dialog: anyone may manage it and no admin code is needed."); }
  static nameLabel(fbs: FbsAPI) { return fbs("名字", "Label of the name field in the seat signup dialog."); }
  static namePlaceholder(fbs: FbsAPI) { return fbs("你的名字", "Placeholder text in the name field of the seat signup dialog."); }
  static nameRequired(fbs: FbsAPI) { return fbs("请填写名字", "Validation message in the seat signup dialog when the name is empty."); }
  static selfTab(fbs: FbsAPI) { return fbs("自己报名", "Tab label in the seat signup dialog for signing up oneself."); }
  static proxyTab(fbs: FbsAPI) { return fbs("代报名", "Tab label in the seat signup dialog for signing up another member by proxy."); }
  static selfNameHint(fbs: FbsAPI) { return fbs("名字取自你的 Discord 昵称，不可修改", "Hint in the self-signup tab: the name comes from the Discord nickname and cannot be changed."); }
  static proxySearchPlaceholder(fbs: FbsAPI) { return fbs("搜索成员名字", "Placeholder text of the member search box in the proxy signup tab."); }
  static proxyPickRequired(fbs: FbsAPI) { return fbs("请选择要代报的成员", "Validation message in the proxy signup tab when no member has been picked."); }
  static proxyEmpty(fbs: FbsAPI) { return fbs("名册里还没有成员", "Empty-state text in the proxy signup tab when the roster has no members yet."); }
  static sectLabel(fbs: FbsAPI) { return fbs("流派", "Label of the sect selector in the seat signup dialog."); }
  static confirmJoin(fbs: FbsAPI) { return fbs("确认落座", "Confirm button label in the seat signup dialog."); }
  static joining(fbs: FbsAPI) { return fbs("落座中…", "Confirm button label in the seat signup dialog while the signup is being submitted."); }
  static toastSect(fbs: FbsAPI) { return fbs("请选择流派", "Toast shown when the seat signup is submitted without choosing a sect."); }
  static toastJoined(fbs: FbsAPI) { return fbs("落座成功", "Toast shown after a seat signup succeeds."); }
  static toastJoinFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["报名失败：", fbs.param("error", pv(p, "error"))], "Toast shown when a seat signup fails; {error} is the error message."); }
  static toastLeft(fbs: FbsAPI) { return fbs("已取消报名", "Toast shown after a signup is cancelled."); }
  static toastLeaveFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["取消失败：", fbs.param("error", pv(p, "error"))], "Toast shown when cancelling a signup fails; {error} is the error message."); }
  static leaveConfirmTitle(fbs: FbsAPI) { return fbs("取消报名", "Title of the confirmation dialog for cancelling a signup."); }
  static leaveConfirmMessage(fbs: FbsAPI, p?: StringParams) { return fbs(["确定取消「", fbs.param("nickname", pv(p, "nickname")), "」的报名吗？"], "Body of the cancel-signup confirmation dialog; {nickname} is the seated member's nickname."); }
  static roleHealer(fbs: FbsAPI) { return fbs("奶", "Short role tag on a seat for a healer."); }
  static roleDps(fbs: FbsAPI) { return fbs("输出", "Short role tag on a seat for a damage dealer."); }
  static leader(fbs: FbsAPI) { return fbs("车头", "Tag on the seat occupied by the squad leader."); }
  static readyMark(fbs: FbsAPI) { return fbs("已就位", "Badge on a seat whose member has marked themselves ready."); }
  static readyAction(fbs: FbsAPI) { return fbs("我已就位", "Button label for a seated member to mark themselves ready."); }
  static unreadyAction(fbs: FbsAPI) { return fbs("取消就位", "Button label for a seated member to undo their ready mark."); }
  static toastReady(fbs: FbsAPI) { return fbs("已标记就位", "Toast shown after the member marks themselves ready."); }
  static toastUnready(fbs: FbsAPI) { return fbs("已取消就位", "Toast shown after the member removes their ready mark."); }
  static toastReadyFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["操作失败：", fbs.param("error", pv(p, "error"))], "Toast shown when toggling the ready mark fails; {error} is the error message."); }
}

export abstract class GroupingTemplateFbtUtils {
  static sectionTitle(fbs: FbsAPI) { return fbs("车队模板", "Title of the squad templates section on the squad form and template management area."); }
  static nameLabel(fbs: FbsAPI) { return fbs("模板名", "Label of the template name field in the template editor."); }
  static namePlaceholder(fbs: FbsAPI) { return fbs("给模板起个名字", "Placeholder text in the template name field."); }
  static saveFromForm(fbs: FbsAPI) { return fbs("存为模板", "Button label on the squad form that saves the current form configuration as a template."); }
  static updateSubmit(fbs: FbsAPI) { return fbs("保存模板修改", "Button label that saves changes to the template currently being edited."); }
  static editingNotice(fbs: FbsAPI, p?: StringParams) { return fbs(["正在编辑模板「", fbs.param("name", pv(p, "name")), "」"], "Notice shown while a template is being edited; {name} is the template name."); }
  static cancelEdit(fbs: FbsAPI) { return fbs("取消编辑", "Button label that cancels editing a template."); }
  static empty(fbs: FbsAPI) { return fbs("还没有模板，把常用配置存下来，下次一键预填", "Empty-state text in the templates section: save a frequent configuration to prefill the squad form next time."); }
  static whenToday(fbs: FbsAPI, p?: StringParams) { return fbs(["今天 ", fbs.param("time", pv(p, "time")), " 发车"], "Departure time preview in a template card for a departure today; {time} is the departure time."); }
  static whenTomorrow(fbs: FbsAPI, p?: StringParams) { return fbs(["明天 ", fbs.param("time", pv(p, "time")), " 发车"], "Departure time preview in a template card for a departure tomorrow; {time} is the departure time."); }
  static whenDays(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("days", pv(p, "days")), " 天后 ", fbs.param("time", pv(p, "time")), " 发车"], "Departure time preview in a template card for a departure in some days; {days} is the number of days ahead and {time} the departure time."); }
  static toastSaved(fbs: FbsAPI) { return fbs("模板已保存", "Toast shown after a template is saved."); }
  static toastSaveFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["模板保存失败：", fbs.param("error", pv(p, "error"))], "Toast shown when saving a template fails; {error} is the error message."); }
  static toastDeleted(fbs: FbsAPI) { return fbs("模板已删除", "Toast shown after a template is deleted."); }
  static toastDeleteFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["模板删除失败：", fbs.param("error", pv(p, "error"))], "Toast shown when deleting a template fails; {error} is the error message."); }
  static edit(fbs: FbsAPI) { return fbs("编辑", "Button label that starts editing a template."); }
  static delete(fbs: FbsAPI) { return fbs("删除", "Button label that deletes a template."); }
  static deleteConfirmTitle(fbs: FbsAPI) { return fbs("删除模板", "Title of the confirmation dialog for deleting a template."); }
  static deleteConfirmMessage(fbs: FbsAPI, p?: StringParams) { return fbs(["确定删除模板「", fbs.param("name", pv(p, "name")), "」吗？"], "Body of the delete-template confirmation dialog; {name} is the template name."); }
  static saveButton(fbs: FbsAPI) { return fbs("📋 存为模板", "Button label on the squad detail page that saves this squad's configuration as a template."); }
  static saveDialogTitle(fbs: FbsAPI) { return fbs("存为车队模板", "Title of the dialog for saving a squad as a template."); }
  static saveSubmit(fbs: FbsAPI) { return fbs("保存模板", "Submit button label in the save-as-template dialog."); }
  static toastSavedFromCar(fbs: FbsAPI) { return fbs("已存为模板，可在发新车时一键预填", "Toast shown after a squad is saved as a template, noting it can prefill the new-squad form in one tap."); }
  static metaTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("type", pv(p, "type")), fbs.param("dungeon", pv(p, "dungeon")), " · ", fbs.param("max", pv(p, "max")), " 人"], "Meta line on a template card; {type} is the grouping type, {dungeon} the optional dungeon name, and {max} the seat count."); }
}

export abstract class ScheduleFbtUtils {
  static title(fbs: FbsAPI) { return fbs("排期", "Title of the schedule tab on the guild home page."); }
  static myTitle(fbs: FbsAPI) { return fbs("我的可用时间", "Title of the my-availability section, where a member edits their weekly free time slots."); }
  static myHint(fbs: FbsAPI) { return fbs("填写你每周固定有空的时段，按你所在时区显示；管理员与车头据此定档期。", "Hint in the my-availability section: slots are weekly recurring, shown in the member's own time zone, and used by admins and squad leaders to pick times."); }
  static slotRange(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("start", pv(p, "start")), "–", fbs.param("end", pv(p, "end"))], "Time range of one availability slot; {start} is the slot start and {end} the slot end, both local times."); }
  static addSlotLabel(fbs: FbsAPI) { return fbs("添加时段", "Button label that adds an availability slot to a weekday in the my-availability editor."); }
  static removeLabel(fbs: FbsAPI) { return fbs("删除", "Button label that removes an availability slot in the my-availability editor."); }
  static saveLabel(fbs: FbsAPI) { return fbs("保存", "Save button label in the my-availability editor."); }
  static savedText(fbs: FbsAPI) { return fbs("可用时间已保存", "Confirmation shown after the member's availability is saved."); }
  static saveFailedTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["保存失败：", fbs.param("error", pv(p, "error"))], "Toast shown when saving availability fails; {error} is the error message."); }
  static emptyMineText(fbs: FbsAPI) { return fbs("你还没有填写可用时间。", "Empty-state text in the my-availability section when the member has not entered availability yet."); }
  static summaryTitle(fbs: FbsAPI) { return fbs("成员可用性汇总", "Title of the member availability summary section on the schedule tab."); }
  static summaryHint(fbs: FbsAPI) { return fbs("汇总仅百业管理员与发过车的车头可见，用于定档期。", "Hint in the availability summary: it is visible only to guild admins and members who have led a squad, and is used to pick activity times."); }
  static summaryEmptyText(fbs: FbsAPI) { return fbs("还没有成员填写可用时间。", "Empty-state text in the availability summary when no member has entered availability yet."); }
  static pollsTitle(fbs: FbsAPI) { return fbs("活动时间投票", "Title of the activity time polls section on the schedule tab."); }
  static pollsHint(fbs: FbsAPI) { return fbs("给出几个候选时间，成员勾选所有能参加的时间；可参加人数最多的时段最适合定档。", "Hint in the time polls section: members tick every candidate time they can make, and the time with the most available members suits best."); }
  static pollEmptyText(fbs: FbsAPI) { return fbs("还没有时间投票。", "Empty-state text in the time polls section when no poll exists yet."); }
  static pollCreateLabel(fbs: FbsAPI) { return fbs("发起投票", "Button label that opens the form for creating a time poll."); }
  static pollTitleLabel(fbs: FbsAPI) { return fbs("投票标题", "Label of the poll title field in the time poll creation form."); }
  static pollTitlePlaceholder(fbs: FbsAPI) { return fbs("如：本周开荒时间", "Placeholder example text in the poll title field."); }
  static pollCandidatesLabel(fbs: FbsAPI) { return fbs("候选时间", "Label of the candidate times list in the time poll creation form."); }
  static pollAddCandidateLabel(fbs: FbsAPI) { return fbs("添加候选", "Button label that adds another candidate time in the poll creation form."); }
  static pollSubmitLabel(fbs: FbsAPI) { return fbs("发布投票", "Button label that publishes a new time poll."); }
  static pollVoteLabel(fbs: FbsAPI) { return fbs("提交投票", "Button label that submits the member's votes in a time poll."); }
  static pollVotedText(fbs: FbsAPI) { return fbs("已投票，可修改后重新提交。", "Note on a time poll the member has already voted in: the vote can be changed and resubmitted."); }
  static pollStatusOpenText(fbs: FbsAPI) { return fbs("进行中", "Status label of an open time poll."); }
  static pollStatusClosedText(fbs: FbsAPI) { return fbs("已关闭", "Status label of a closed time poll."); }
  static pollCloseLabel(fbs: FbsAPI) { return fbs("关闭投票", "Button label that closes a time poll."); }
  static pollVoteCountTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("count", pv(p, "count")), " 人可参加"], "Availability count shown under a candidate time; {count} is the number of members who can make that time."); }
  static pollLaunchLabel(fbs: FbsAPI) { return fbs("以此时间发车", "Button label on a candidate time that starts creating a squad prefilled with that time."); }
  static pollCancelLabel(fbs: FbsAPI) { return fbs("取消", "Cancel button label in the time poll creation form."); }
  static toastPollCreated(fbs: FbsAPI) { return fbs("投票已发布", "Toast shown after a time poll is published."); }
  static toastVoted(fbs: FbsAPI) { return fbs("已提交", "Toast shown after the member's poll vote is submitted."); }
  static toastClosed(fbs: FbsAPI) { return fbs("投票已关闭", "Toast shown after a time poll is closed."); }
  static toastFailedTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["操作失败：", fbs.param("error", pv(p, "error"))], "Toast shown when a schedule operation fails; {error} is the error message."); }
  static settingsLinkLabel(fbs: FbsAPI) { return fbs("在个人设置中填写", "Link text left on the schedule tab where the availability editor used to be, pointing members to the availability editor in their personal settings."); }
  static noGuildsText(fbs: FbsAPI) { return fbs("你还没有加入任何百业，加入后可在此填写可用时间。", "Empty-state text in the personal settings availability section when the user has not joined a guild yet; availability can be filled in once they join one."); }
}

