/* fbtee declaration surface for the groupings domain (hand-maintained): this
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

export abstract class GroupingTypeFbtUtils {
  static tabAll(fbs: FbsAPI) { return fbs("全部", "Tab label for the squad list, used to switch to the all-types squads tab."); }
  static tabActivity(fbs: FbsAPI) { return fbs("双十人本", "Tab label for the squad list, used to switch to the ten-player dungeon (shuangshi) squads tab."); }
  static tabTalent(fbs: FbsAPI) { return fbs("天赋组队", "Tab label for the squad list, used to switch to the talent squads tab."); }
  static tabRace(fbs: FbsAPI) { return fbs("竞速报名", "Tab label for the squad list, used to switch to the racing signup tab."); }
  static tabTower(fbs: FbsAPI) { return fbs("爬塔", "Tab label for the squad list, used to switch to the tower squads tab."); }
  static tabExplore(fbs: FbsAPI) { return fbs("联机探索", "Tab label for the squad list, used to switch to the co-op exploration squads tab."); }
  static shortActivity(fbs: FbsAPI) { return fbs("双十", "Short label for the shuangshi squad type, used in compact squad type badges and default titles."); }
  static shortTalent(fbs: FbsAPI) { return fbs("天赋", "Short label for the talent squad type, used in compact squad type badges and default titles."); }
  static shortRace(fbs: FbsAPI) { return fbs("竞速", "Short label for the racing squad type, used in compact squad type badges and default titles."); }
  static shortTower(fbs: FbsAPI) { return fbs("爬塔", "Short label for the tower squad type, used in compact squad type badges and default titles."); }
  static shortCoopExplore(fbs: FbsAPI) { return fbs("联机探索", "Short label for the co-op exploration squad type, used in compact squad type badges and default titles."); }
  static shortGather(fbs: FbsAPI) { return fbs("采集", "Short label for the gathering activity type, used in compact type badges in officer attendance views."); }
  static shortExplore(fbs: FbsAPI) { return fbs("探索", "Short label for the exploration activity type, used in compact type badges in officer attendance views."); }
}

export abstract class GroupingListFbtUtils {
  static weekShareImageLabel(fbs: FbsAPI) { return fbs("本周车队图", "Button label for the squad list page, used to share or download the weekly squad image listing this guild's open squads for the current platform week."); }
  static weekShareText(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("name", pv(p, "name")), " 本周车队图"], "Share text for the weekly squad image on the squad list page, used as the message attached when sharing the image, where {name} is the guild name."); }
  static weekShareImageSaved(fbs: FbsAPI) { return fbs("图片已保存、链接已复制，去微信发图粘贴即可", "Toast message for the weekly squad image action on the squad list page, used after the image is saved and the guild link copied, telling the user to post the image in WeChat and paste the link there."); }
  static weekShareImageCopied(fbs: FbsAPI) { return fbs("图片已复制，去聊天里粘贴即可", "Toast message for the weekly squad image action on the squad list page, used after the image is copied to the system clipboard on desktop, telling the user to paste it into a chat window."); }
  static weekShareImageFailed(fbs: FbsAPI) { return fbs("分享图获取失败，请重试", "Toast message for the weekly squad image action on the squad list page, used when the image cannot be fetched or shared."); }
  static weekCopyFailedManual(fbs: FbsAPI) { return fbs("复制失败，请手动复制地址栏链接", "Hint text for the weekly squad image action on the squad list page, used when copying fails so the user copies the address bar link manually."); }
  static prevWeek(fbs: FbsAPI) { return fbs("上一周", "Button label for the squad list week navigation, used to move to the previous week."); }
  static nextWeek(fbs: FbsAPI) { return fbs("下一周", "Button label for the squad list week navigation, used to move to the next week."); }
  static weekHeader(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("range", pv(p, "range")), " · ", fbs.param("count", pv(p, "count")), " 队"], "Header text for the squad list week view, used to show the week range and squad count, where {range} is the formatted Monday-to-Sunday range and {count} the number of squads."); }
  static emptyInteractive(fbs: FbsAPI) { return fbs("暂无车队，来发第一车吧", "Empty-state text for the squad list, used when a writable week has no squads, inviting the viewer to post the first one."); }
  static statusOpen(fbs: FbsAPI) { return fbs("报名中", "Status label for squad cards, used to mark a squad that is open for signup."); }
  static people(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("occupied", pv(p, "occupied")), "/", fbs.param("max", pv(p, "max")), " 人"], "Count text for squad cards, used to show seated members against capacity, where {occupied} is the seated count and {max} the capacity."); }
  static newCar(fbs: FbsAPI) { return fbs("📯 张贴告示 · 发新车", "Button label for the squad list, used to open the new squad form."); }
  static seal(fbs: FbsAPI) { return fbs("募", "Seal character for squad list artwork, used as the decorative seal glyph on the recruit section of the list page."); }
  static dayGroupHeader(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("month", pv(p, "month")), "月", fbs.param("day", pv(p, "day")), "日 ", fbs.param("weekday", pv(p, "weekday"))], "Header text for day groups in the squad list, used above the squads of one day, where {month} and {day} form the date and {weekday} is the weekday name."); }
  static weekday0(fbs: FbsAPI) { return fbs("周日", "Weekday name for Sunday, used in day group headers and schedule views to label the day."); }
  static weekday1(fbs: FbsAPI) { return fbs("周一", "Weekday name for Monday, used in day group headers and schedule views to label the day."); }
  static weekday2(fbs: FbsAPI) { return fbs("周二", "Weekday name for Tuesday, used in day group headers and schedule views to label the day."); }
  static weekday3(fbs: FbsAPI) { return fbs("周三", "Weekday name for Wednesday, used in day group headers and schedule views to label the day."); }
  static weekday4(fbs: FbsAPI) { return fbs("周四", "Weekday name for Thursday, used in day group headers and schedule views to label the day."); }
  static weekday5(fbs: FbsAPI) { return fbs("周五", "Weekday name for Friday, used in day group headers and schedule views to label the day."); }
  static weekday6(fbs: FbsAPI) { return fbs("周六", "Weekday name for Saturday, used in day group headers and schedule views to label the day."); }
  static undatedGroup(fbs: FbsAPI) { return fbs("未定时间", "Header text for the undated group in the squad list, used above squads that have no scheduled start time."); }
}

export abstract class GroupingDetailFbtUtils {
  static notFound(fbs: FbsAPI) { return fbs("车队不存在或已解散", "Error text for the squad detail page, used when the squad does not exist or has been disbanded."); }
  static backToList(fbs: FbsAPI) { return fbs("‹ 返回车队列表", "Back link for the squad detail page, used at the top of the page to return to the squad list."); }
  static share(fbs: FbsAPI) { return fbs("🔗 分享车队", "Button label for the squad detail page, used to copy the squad's short share link."); }
  static shareImage(fbs: FbsAPI) { return fbs("🖼 分享图", "Button label for the squad detail page and the public squad share page, used to share the squad's card image together with its short link, for posting into chat groups that render no link previews."); }
  static shareImageSaved(fbs: FbsAPI) { return fbs("图片已保存、链接已复制，去微信发图粘贴即可", "Toast message for the share image action, used after the card image is saved and the short link copied, telling the user to post the image in WeChat and paste the link there."); }
  static shareImageCopied(fbs: FbsAPI) { return fbs("图片已复制，去聊天里粘贴即可", "Toast message for the share image action, used after the card image is copied to the system clipboard on desktop, telling the user to paste it into a chat window."); }
  static shareImageFailed(fbs: FbsAPI) { return fbs("分享图获取失败，请重试", "Toast message for the share image action, used when the card image cannot be fetched or shared."); }
  static edit(fbs: FbsAPI) { return fbs("✏️ 编辑", "Button label for the squad detail page, used to open the edit form, shown to the leader or a guild admin."); }
  static disband(fbs: FbsAPI) { return fbs("解散车队", "Button label for the squad detail page, used to start disbanding the squad, shown to the leader or a guild admin."); }
  static disbanding(fbs: FbsAPI) { return fbs("解散中…", "Button label for the squad detail page, used while disbanding is in progress."); }
  static statusOpen(fbs: FbsAPI) { return fbs("报名中", "Status label for the squad detail page, used to mark a squad that is open for signup."); }
  static people(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("occupied", pv(p, "occupied")), "/", fbs.param("max", pv(p, "max")), " 人"], "Count text for the squad detail page, used to show seated members against capacity, where {occupied} is the seated count and {max} the capacity."); }
  static readyProgress(fbs: FbsAPI, p?: StringParams) { return fbs(["已就位 ", fbs.param("ready", pv(p, "ready")), "/", fbs.param("occupied", pv(p, "occupied"))], "Progress text for the squad detail page, used to show how many seated members are marked ready, where {ready} is the ready count and {occupied} the seated count."); }
  static openHint(fbs: FbsAPI) { return fbs("人人可管 · 无需管理码 — 点空位即可落座", "Hint text for the squad detail page, used under the roster to explain that everyone can manage seats without an admin code."); }
  static toastDisbanded(fbs: FbsAPI) { return fbs("车队已解散", "Toast message for the squad detail page, used after the squad is disbanded."); }
  static toastDisbandFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["解散失败：", fbs.param("error", pv(p, "error"))], "Toast message for the squad detail page, used when disbanding fails, where {error} is the failure reason."); }
  static linkCopied(fbs: FbsAPI) { return fbs("链接已复制", "Confirmation text for the share action, used as a transient notice after the share link is copied."); }
  static copyFailedManual(fbs: FbsAPI) { return fbs("复制失败，请手动复制地址栏链接", "Hint text for the share action, used when copying fails so the user copies the address bar link manually."); }
  static disbandConfirmTitle(fbs: FbsAPI) { return fbs("解散车队", "Title text for the disband confirmation, used as the confirmation dialog heading."); }
  static disbandConfirmMessage(fbs: FbsAPI, p?: StringParams) { return fbs(["确定解散「", fbs.param("title", pv(p, "title")), "」吗？所有报名将被清空。"], "Confirmation message for disbanding a squad, used in the dialog to warn that all signups are cleared, where {title} is the squad title."); }
  static complete(fbs: FbsAPI) { return fbs("完成车队", "Button label for the squad detail page, used to mark the squad as completed, shown to the leader or a guild admin."); }
  static completing(fbs: FbsAPI) { return fbs("完成中…", "Button label for the squad detail page, used while completion is in progress."); }
  static statusCompleted(fbs: FbsAPI) { return fbs("已完成", "Status label for the squad detail page, used to mark a squad that has been completed."); }
  static restore(fbs: FbsAPI) { return fbs("恢复车队", "Button label for the squad detail page, used to restore a completed squad, shown to the leader or a guild admin."); }
  static completeConfirmTitle(fbs: FbsAPI) { return fbs("完成车队", "Title text for the complete confirmation, used as the confirmation dialog heading."); }
  static completeConfirmMessage(fbs: FbsAPI, p?: StringParams) { return fbs(["确定完成「", fbs.param("title", pv(p, "title")), "」吗？完成后将从车队列表隐藏，也不再发送发车提醒；之后仍可在本页恢复。"], "Confirmation message for completing a squad, used in the dialog to explain the squad is hidden from the list and stops receiving reminders but can be restored here, where {title} is the squad title."); }
  static toastCompleted(fbs: FbsAPI) { return fbs("车队已完成", "Toast message for the squad detail page, used after the squad is marked completed."); }
  static toastCompleteFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["完成失败：", fbs.param("error", pv(p, "error"))], "Toast message for the squad detail page, used when completion fails, where {error} is the failure reason."); }
  static toastRestored(fbs: FbsAPI) { return fbs("车队已恢复", "Toast message for the squad detail page, used after a completed squad is restored."); }
  static toastRestoreFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["恢复失败：", fbs.param("error", pv(p, "error"))], "Toast message for the squad detail page, used when restoring fails, where {error} is the failure reason."); }
  static completedHint(fbs: FbsAPI) { return fbs("该车队已完成 · 已从列表隐藏，不再发送发车提醒", "Hint text for completed squads on the detail page, used to explain the squad is hidden from the list and no longer receives departure reminders."); }
  static rosterAnswersTitle(fbs: FbsAPI) { return fbs("报名表答案", "Title text for the roster answers section on the squad detail page, used above the per-seat custom signup answers shown to the leader and guild admins."); }
  static merge(fbs: FbsAPI) { return fbs("合并车队", "Button label for the squad detail page, used to open the merge picker, shown to the leader or a guild admin."); }
  static mergeDialogTitle(fbs: FbsAPI) { return fbs("选择要并入的车队", "Title text for the merge picker on the squad detail page, used as the dialog heading above the list of squads that can be merged into this one."); }
  static mergeEmpty(fbs: FbsAPI) { return fbs("暂无可合并的车队", "Empty-state text for the merge picker on the squad detail page, used when no other squad in this guild can be merged into this one."); }
  static mergeConfirmTitle(fbs: FbsAPI) { return fbs("确认合并", "Title text for the merge confirmation on the squad detail page, used as the confirmation step heading after a source squad is picked."); }
  static mergeConfirmMessage(fbs: FbsAPI, p?: StringParams) { return fbs(["确定把「", fbs.param("title", pv(p, "title")), "」并入本车队吗？它的成员将整体迁入本车，同一人两边都有座位时以本车为准，超出本车人数上限的成员按报名顺序列在座位之后；合并后源车将解散。"], "Confirmation message for merging squads, used in the dialog to explain that the source squad's members move into this squad, this squad's seat wins for a person seated in both, members past this squad's capacity line up behind the seats in signup order, and the source squad is disbanded afterwards, where {title} is the source squad title."); }
  static mergeConfirmSubmit(fbs: FbsAPI) { return fbs("确认合并", "Button label for the merge confirmation on the squad detail page, used to execute the merge."); }
  static toastMerged(fbs: FbsAPI) { return fbs("车队已合并", "Toast message for the squad detail page, used after another squad is merged into this one."); }
  static toastMergeFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["合并失败：", fbs.param("error", pv(p, "error"))], "Toast message for the squad detail page, used when merging fails, where {error} is the failure reason."); }
  static cloneButton(fbs: FbsAPI) { return fbs("再来一车", "Button label for the squad detail page, used to start cloning this squad into a new one with the same roster, shown to the leader or a guild admin."); }
  static cloneDialogTitle(fbs: FbsAPI) { return fbs("复制车队", "Title text for the clone dialog on the squad detail page, used as the heading of the dialog that posts the cloned squad."); }
  static cloneToastCloned(fbs: FbsAPI) { return fbs("已复制为新车", "Toast message for the squad detail page, used after the squad is cloned into a new squad."); }
  static cloneToastFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["复制失败：", fbs.param("error", pv(p, "error"))], "Toast message for the squad detail page, used when cloning fails, where {error} is the failure reason."); }
  static cloneToastSkipped(fbs: FbsAPI, p?: StringParams) { return fbs(["以下成员未能带入新车（请先加入名册）：", fbs.param("names", pv(p, "names"))], "Toast message for the squad detail page, used after a clone where some roster names resolved to nobody and their seats were skipped, where {names} lists the skipped members."); }
  static nudgeButton(fbs: FbsAPI) { return fbs("催报名", "Button label for the squad detail page, used to open the sign-up nudge dialog with copyable text mentioning roster members who have not signed up, shown to the leader or a guild admin."); }
  static nudgeDialogTitle(fbs: FbsAPI) { return fbs("催报名", "Title text for the sign-up nudge dialog on the squad detail page, used as the heading above the generated mention text."); }
  static nudgeHintText(fbs: FbsAPI) { return fbs("复制下面的文案到 Discord 发送，就能 @ 到还没报名的伙伴。", "Hint text for the sign-up nudge dialog on the squad detail page, used to explain that copying the text into Discord mentions the members who have not signed up yet."); }
  static nudgeMessage(fbs: FbsAPI, p?: StringParams) { return fbs(["「", fbs.param("title", pv(p, "title")), "」", fbs.param("time", pv(p, "time")), " 出发，还没报名的伙伴：", fbs.param("mentions", pv(p, "mentions")), "，快来占座！"], "Sign-up nudge message composed on the server for the squad detail page, pasted into Discord by the leader, where {title} is the squad title, {time} its departure time line and {mentions} the space-separated Discord mentions of roster members who have not signed up."); }
  static nudgeMessageNoTime(fbs: FbsAPI, p?: StringParams) { return fbs(["「", fbs.param("title", pv(p, "title")), "」还没报名的伙伴：", fbs.param("mentions", pv(p, "mentions")), "，快来占座！"], "Sign-up nudge message composed on the server for a squad without a departure time, pasted into Discord by the leader, where {title} is the squad title and {mentions} the space-separated Discord mentions of roster members who have not signed up."); }
  static nudgeEmptyText(fbs: FbsAPI) { return fbs("名册成员都已报名，没有需要催的伙伴。", "Empty-state text for the sign-up nudge dialog on the squad detail page, used when every roster member has already signed up for this squad."); }
  static nudgeCopyLabel(fbs: FbsAPI) { return fbs("复制文案", "Button label for the sign-up nudge dialog on the squad detail page, used to copy the generated mention text to the clipboard."); }
  static nudgeCopiedToast(fbs: FbsAPI) { return fbs("已复制，去 Discord 粘贴发送吧", "Toast message for the squad detail page, used after the sign-up nudge text is copied to the clipboard."); }
}

export abstract class GroupingFormFbtUtils {
  static createTitle(fbs: FbsAPI) { return fbs("张贴告示", "Title text for the squad form, used as the heading when posting a new squad."); }
  static editTitle(fbs: FbsAPI) { return fbs("编辑告示", "Title text for the squad form, used as the heading when editing an existing squad."); }
  static typeLabel(fbs: FbsAPI) { return fbs("类型", "Field label for the squad form, used for the squad type selector."); }
  static capacity(fbs: FbsAPI, p?: StringParams) { return fbs(["人数上限 ", fbs.param("max", pv(p, "max")), " 人（", fbs.param("hint", pv(p, "hint")), "）"], "Capacity text for the squad form, used to show the squad size for the chosen type, where {max} is the capacity and {hint} the explanation of how it was derived."); }
  static hintActivity(fbs: FbsAPI) { return fbs("双十固定 10 人，不选副本", "Capacity hint for the squad form, used for shuangshi squads to state the fixed size of ten and that no dungeon is chosen."); }
  static hintDungeon(fbs: FbsAPI, p?: StringParams) { return fbs(["按所选副本「", fbs.param("name", pv(p, "name")), "」", fbs.param("max", pv(p, "max")), " 人"], "Capacity hint for the squad form, used when a dungeon sets the size, where {name} is the dungeon name and {max} its player count."); }
  static hintTalent(fbs: FbsAPI) { return fbs("天赋默认 5 人，选副本后按副本人数", "Capacity hint for the squad form, used for talent squads to state the default size of five before a dungeon is chosen."); }
  static hintRace(fbs: FbsAPI) { return fbs("竞速默认 10 人，选副本后按副本人数", "Capacity hint for the squad form, used for racing squads to state the default size of ten before a dungeon is chosen."); }
  static hintTower(fbs: FbsAPI) { return fbs("爬塔固定 10 人，不选副本", "Capacity hint for the squad form, used for tower squads to state the fixed size of ten and that no dungeon is chosen."); }
  static hintExplore(fbs: FbsAPI) { return fbs("联机探索不选副本，人数可选 5 或 10 人", "Capacity hint for the squad form, used for co-op exploration squads to state that no dungeon is chosen and the size is picked between five and ten."); }
  static sizeLabel(fbs: FbsAPI) { return fbs("人数", "Field label for the squad form, used for the co-op exploration squad size selector."); }
  static sizeOption(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("n", pv(p, "n")), " 人"], "Option pattern for the squad size selector on the squad form, used to label a seat count, where {n} is the number of seats."); }
  static titleLabel(fbs: FbsAPI) { return fbs("标题", "Field label for the squad form, used for the squad title input."); }
  static titlePlaceholder(fbs: FbsAPI) { return fbs("如：周六晚双十来奶", "Placeholder text for the squad form, used in the title input with an example title."); }
  static startsLabel(fbs: FbsAPI) { return fbs("出发时间", "Field label for the squad form, used for the departure time selectors."); }
  static monthOption(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("n", pv(p, "n")), "月"], "Option pattern for the departure month selector on the squad form, used to label a month, where {n} is the month number."); }
  static dayOption(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("n", pv(p, "n")), "日"], "Option pattern for the departure day selector on the squad form, used to label a day of month, where {n} is the day number."); }
  static hourOption(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("n", pv(p, "n")), "时"], "Option pattern for the departure hour selector on the squad form, used to label an hour, where {n} is the hour."); }
  static minuteOption(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("n", pv(p, "n")), "分"], "Option pattern for the departure minute selector on the squad form, used to label a minute, where {n} is the minute."); }
  static tzEastLabel(fbs: FbsAPI) { return fbs("美东", "Zone label for the squad form, used in the start-time echo for the US Eastern timezone."); }
  static tzWestLabel(fbs: FbsAPI) { return fbs("美西", "Zone label for the squad form, used in the start-time echo for the US Pacific timezone."); }
  static tzEcho(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("eastLabel", pv(p, "eastLabel")), " ", fbs.param("eastWeekday", pv(p, "eastWeekday")), " ", fbs.param("eastTime", pv(p, "eastTime")), " · ", fbs.param("westLabel", pv(p, "westLabel")), " ", fbs.param("westWeekday", pv(p, "westWeekday")), " ", fbs.param("westTime", pv(p, "westTime"))], "Echo line for the squad form, used to restate the chosen start time in the US Eastern and Pacific timezones, where {eastLabel} and {westLabel} are the zone labels, {eastWeekday} and {westWeekday} the weekday in each zone's own calendar, and {eastTime} and {westTime} the wall-clock times."); }
  static dungeonLabel(fbs: FbsAPI) { return fbs("副本（可选）", "Field label for the squad form, used for the optional dungeon selector."); }
  static dungeonNone(fbs: FbsAPI) { return fbs("不指定", "Option label for the dungeon selector on the squad form, used for the choice that leaves the dungeon unspecified."); }
  static nicknameLabel(fbs: FbsAPI) { return fbs("你的昵称（发车人自动落座 0 号位）", "Field label for the squad form, used for the creator nickname input and to note the creator auto-seats at seat zero."); }
  static nicknamePlaceholder(fbs: FbsAPI) { return fbs("游戏内昵称", "Placeholder text for the squad form, used in the nickname input."); }
  static sectLabel(fbs: FbsAPI) { return fbs("你的流派", "Field label for the squad form, used for the creator sect selector."); }
  static submitCreate(fbs: FbsAPI) { return fbs("发布", "Button label for the squad form, used to publish a new squad."); }
  static submitEdit(fbs: FbsAPI) { return fbs("保存", "Button label for the squad form, used to save edits to an existing squad."); }
  static submitting(fbs: FbsAPI) { return fbs("提交中…", "Button label for the squad form, used while the form is being submitted."); }
  static toastSect(fbs: FbsAPI) { return fbs("请选择你的流派", "Toast message for the squad form, used when submitting without choosing a sect."); }
  static toastSaved(fbs: FbsAPI) { return fbs("已保存", "Toast message for the squad form, used after edits are saved."); }
  static toastSaveFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["保存失败：", fbs.param("error", pv(p, "error"))], "Toast message for the squad form, used when saving edits fails, where {error} is the failure reason."); }
  static toastPosted(fbs: FbsAPI) { return fbs("告示已张贴", "Toast message for the squad form, used after a new squad is posted."); }
  static toastCreateFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["创建失败：", fbs.param("error", pv(p, "error"))], "Toast message for the squad form, used when creating a squad fails, where {error} is the failure reason."); }
  static titleTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("nickname", pv(p, "nickname")), "的", fbs.param("type", pv(p, "type")), "车队"], "Default title pattern for new squads, used to prefill the title when the creator leaves it blank, where {nickname} is the creator nickname and {type} the squad type label."); }
  static customFieldsTitle(fbs: FbsAPI) { return fbs("报名表自定义字段", "Section heading for the squad form, used above the custom signup field editor."); }
  static customFieldAddLabel(fbs: FbsAPI) { return fbs("添加字段", "Button label for the custom field editor on the squad form, used to add a signup field."); }
  static customFieldLabelPlaceholder(fbs: FbsAPI) { return fbs("字段名（如：联系方式）", "Placeholder text for the custom field editor, used in the field name input with an example name."); }
  static customFieldTypeText(fbs: FbsAPI) { return fbs("单行文本", "Option label for the custom field editor, used for the single-line text field type."); }
  static customFieldTypeChoice(fbs: FbsAPI) { return fbs("单选", "Option label for the custom field editor, used for the single-choice field type."); }
  static customFieldOptionsPlaceholder(fbs: FbsAPI) { return fbs("选项，一行一个（2–6 个）", "Placeholder text for the custom field editor, used in the options textarea to explain one option per line with two to six options."); }
  static customFieldRequiredLabel(fbs: FbsAPI) { return fbs("必填", "Checkbox label for the custom field editor, used to mark a signup field as required."); }
  static customFieldRemoveLabel(fbs: FbsAPI) { return fbs("删除", "Button label for the custom field editor, used to remove a signup field."); }
  static customFieldEmptyText(fbs: FbsAPI) { return fbs("未设置自定义字段时，成员报名只填固定信息。", "Empty-state text for the custom field editor, used when no custom fields are set to explain that signups then collect only the standard information."); }
}

export abstract class SeatFbtUtils {
  static emptyJoin(fbs: FbsAPI) { return fbs("空位 · 点击落座", "Seat cell text for empty seats, used on writable squad pages to invite clicking the seat to sign up."); }
  static empty(fbs: FbsAPI) { return fbs("空位", "Seat cell text for empty seats, used on read-only squad pages."); }
  static modalTitle(fbs: FbsAPI, p?: StringParams) { return fbs(["落座 · ", fbs.param("n", pv(p, "n")), " 号位"], "Title text for the seat signup dialog, used as the dialog heading, where {n} is the seat number."); }
  static modalSubtitle(fbs: FbsAPI) { return fbs("人人可管 · 无需管理码", "Subtitle for the seat signup dialog, used under the title to explain that seats are self-managed without an admin code."); }
  static nameLabel(fbs: FbsAPI) { return fbs("名字", "Field label for the seat signup dialog, used for the name input in proxy mode."); }
  static namePlaceholder(fbs: FbsAPI) { return fbs("你的名字", "Placeholder text for the seat signup dialog, used in the proxy name input."); }
  static nameRequired(fbs: FbsAPI) { return fbs("请填写名字", "Validation text for the seat signup dialog, used when the name is left empty."); }
  static selfTab(fbs: FbsAPI) { return fbs("自己报名", "Tab label for the seat signup dialog, used to switch to signing up oneself."); }
  static proxyTab(fbs: FbsAPI) { return fbs("代报名", "Tab label for the seat signup dialog, used to switch to signing up another member."); }
  static selfNameHint(fbs: FbsAPI) { return fbs("名字取自你的 Discord 昵称，不可修改", "Hint text for the seat signup dialog, used in self mode to explain the name comes from the Discord nickname and cannot be edited."); }
  static proxySearchPlaceholder(fbs: FbsAPI) { return fbs("搜索成员名字", "Placeholder text for the proxy member search in the seat signup dialog, used to prompt searching roster members by name."); }
  static proxyPickRequired(fbs: FbsAPI) { return fbs("请选择要代报的成员", "Validation text for the seat signup dialog, used when proxy mode is submitted without picking a member."); }
  static proxyEmpty(fbs: FbsAPI) { return fbs("名册里还没有成员", "Empty-state text for the proxy member picker, used when the guild roster has no members yet."); }
  static sectLabel(fbs: FbsAPI) { return fbs("流派", "Field label for the seat signup dialog, used for the sect selector."); }
  static confirmJoin(fbs: FbsAPI) { return fbs("确认落座", "Button label for the seat signup dialog, used to confirm taking the seat."); }
  static joining(fbs: FbsAPI) { return fbs("落座中…", "Button label for the seat signup dialog, used while the signup is being submitted."); }
  static toastSect(fbs: FbsAPI) { return fbs("请选择流派", "Toast message for the seat signup dialog, used when submitting without choosing a sect."); }
  static toastJoined(fbs: FbsAPI) { return fbs("落座成功", "Toast message for the seat signup dialog, used after a successful signup."); }
  static toastJoinFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["报名失败：", fbs.param("error", pv(p, "error"))], "Toast message for the seat signup dialog, used when a signup fails, where {error} is the failure reason."); }
  static toastLeft(fbs: FbsAPI) { return fbs("已取消报名", "Toast message for seat actions, used after a signup is cancelled."); }
  static toastLeaveFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["取消失败：", fbs.param("error", pv(p, "error"))], "Toast message for seat actions, used when cancelling a signup fails, where {error} is the failure reason."); }
  static leaveConfirmTitle(fbs: FbsAPI) { return fbs("取消报名", "Title text for the leave-seat confirmation, used as the confirmation dialog heading."); }
  static leaveConfirmMessage(fbs: FbsAPI, p?: StringParams) { return fbs(["确定取消「", fbs.param("nickname", pv(p, "nickname")), "」的报名吗？"], "Confirmation message for leaving a seat, used in the dialog, where {nickname} is the seated member's nickname."); }
  static roleHealer(fbs: FbsAPI) { return fbs("奶", "Role tag for seated members, used on a seat cell when the member's sect is a healer."); }
  static roleDps(fbs: FbsAPI) { return fbs("输出", "Role tag for seated members, used on a seat cell when the member's sect is a damage dealer."); }
  static roleFlex(fbs: FbsAPI) { return fbs("随意", "Role tag for seated members, used when the member can fill any role."); }
  static leader(fbs: FbsAPI) { return fbs("车头", "Tag text for the squad leader, used on the leader's seat cell and in roster views."); }
  static readyMark(fbs: FbsAPI) { return fbs("已就位", "Status text for seated members, used on a seat cell when the member is marked ready."); }
  static readyAction(fbs: FbsAPI) { return fbs("我已就位", "Button label for seat actions, used by a seated member to mark themselves ready."); }
  static unreadyAction(fbs: FbsAPI) { return fbs("取消就位", "Button label for seat actions, used by a seated member to withdraw the ready mark."); }
  static toastReady(fbs: FbsAPI) { return fbs("已标记就位", "Toast message for seat actions, used after the ready mark is set."); }
  static toastUnready(fbs: FbsAPI) { return fbs("已取消就位", "Toast message for seat actions, used after the ready mark is withdrawn."); }
  static toastReadyFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["操作失败：", fbs.param("error", pv(p, "error"))], "Toast message for seat actions, used when toggling the ready mark fails, where {error} is the failure reason."); }
}

export abstract class GroupingTemplateFbtUtils {
  static sectionTitle(fbs: FbsAPI) { return fbs("车队模板", "Section heading for the squad form, used above the template picker and editor."); }
  static nameLabel(fbs: FbsAPI) { return fbs("模板名", "Field label for the template editor, used for the template name input."); }
  static namePlaceholder(fbs: FbsAPI) { return fbs("给模板起个名字", "Placeholder text for the template editor, used in the template name input."); }
  static saveFromForm(fbs: FbsAPI) { return fbs("存为模板", "Button label for the squad form, used to save the current form content as a template."); }
  static updateSubmit(fbs: FbsAPI) { return fbs("保存模板修改", "Button label for the template editor, used to save changes to the template being edited."); }
  static editingNotice(fbs: FbsAPI, p?: StringParams) { return fbs(["正在编辑模板「", fbs.param("name", pv(p, "name")), "」"], "Notice text for the template editor, used to show which template is being edited, where {name} is the template name."); }
  static cancelEdit(fbs: FbsAPI) { return fbs("取消编辑", "Button label for the template editor, used to cancel editing a template."); }
  static empty(fbs: FbsAPI) { return fbs("还没有模板，把常用配置存下来，下次一键预填", "Empty-state text for the template section, used when the user has no templates, explaining that saved setups prefill future squad forms."); }
  static whenToday(fbs: FbsAPI, p?: StringParams) { return fbs(["今天 ", fbs.param("time", pv(p, "time")), " 发车"], "Schedule text for template cards, used when the template departs today, where {time} is the departure time."); }
  static whenTomorrow(fbs: FbsAPI, p?: StringParams) { return fbs(["明天 ", fbs.param("time", pv(p, "time")), " 发车"], "Schedule text for template cards, used when the template departs tomorrow, where {time} is the departure time."); }
  static whenDays(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("days", pv(p, "days")), " 天后 ", fbs.param("time", pv(p, "time")), " 发车"], "Schedule text for template cards, used when the template departs in a number of days, where {days} is the day offset and {time} the departure time."); }
  static toastSaved(fbs: FbsAPI) { return fbs("模板已保存", "Toast message for templates, used after a template is saved."); }
  static toastSaveFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["模板保存失败：", fbs.param("error", pv(p, "error"))], "Toast message for templates, used when saving a template fails, where {error} is the failure reason."); }
  static toastDeleted(fbs: FbsAPI) { return fbs("模板已删除", "Toast message for templates, used after a template is deleted."); }
  static toastDeleteFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["模板删除失败：", fbs.param("error", pv(p, "error"))], "Toast message for templates, used when deleting a template fails, where {error} is the failure reason."); }
  static edit(fbs: FbsAPI) { return fbs("编辑", "Button label for template cards, used to edit a template."); }
  static delete(fbs: FbsAPI) { return fbs("删除", "Button label for template cards, used to start deleting a template."); }
  static deleteConfirmTitle(fbs: FbsAPI) { return fbs("删除模板", "Title text for the template deletion confirmation, used as the confirmation dialog heading."); }
  static deleteConfirmMessage(fbs: FbsAPI, p?: StringParams) { return fbs(["确定删除模板「", fbs.param("name", pv(p, "name")), "」吗？"], "Confirmation message for deleting a template, used in the dialog, where {name} is the template name."); }
  static saveButton(fbs: FbsAPI) { return fbs("📋 存为模板", "Button label for the squad detail page, used to open the save-as-template dialog for the current squad."); }
  static saveDialogTitle(fbs: FbsAPI) { return fbs("存为车队模板", "Title text for the save-as-template dialog, used as the dialog heading."); }
  static saveSubmit(fbs: FbsAPI) { return fbs("保存模板", "Button label for the save-as-template dialog, used to save the template."); }
  static toastSavedFromCar(fbs: FbsAPI) { return fbs("已存为模板，可在发新车时一键预填", "Toast message for the save-as-template flow, used after a squad is saved as a template for one-tap prefilling."); }
  static metaTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("type", pv(p, "type")), fbs.param("dungeon", pv(p, "dungeon")), " · ", fbs.param("max", pv(p, "max")), " 人"], "Meta text for template cards, used to summarize a template, where {type} is the squad type label, {dungeon} the optional dungeon label and {max} the capacity."); }
}

export abstract class ScheduleFbtUtils {
  static title(fbs: FbsAPI) { return fbs("排期", "Title text for the guild schedule tab, used as the tab heading."); }
  static myTitle(fbs: FbsAPI) { return fbs("我的可用时间", "Title text for the personal availability page, used as the heading of the weekly availability editor inside profile settings."); }
  static myHint(fbs: FbsAPI) { return fbs("填写你每周固定有空的时段，按你所在时区显示；管理员与车头据此定档期。", "Hint text for the personal availability editor, used to explain that weekly recurring windows are shown in the viewer's timezone and read by admins and leaders when scheduling."); }
  static slotRange(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("start", pv(p, "start")), "–", fbs.param("end", pv(p, "end"))], "Range text pattern for availability slots, used to render one weekly window, where {start} and {end} are the formatted boundary times."); }
  static addSlotLabel(fbs: FbsAPI) { return fbs("添加时段", "Button label for the availability editor, used to add a weekly window."); }
  static removeLabel(fbs: FbsAPI) { return fbs("删除", "Button label for availability slot rows, used to delete the window."); }
  static saveLabel(fbs: FbsAPI) { return fbs("保存", "Button label for the availability editor, used to save the weekly windows."); }
  static savedText(fbs: FbsAPI) { return fbs("可用时间已保存", "Confirmation text for the availability editor, used after the windows are saved."); }
  static saveFailedTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["保存失败：", fbs.param("error", pv(p, "error"))], "Error text for the availability editor, used when saving fails, where {error} is the failure reason."); }
  static emptyMineText(fbs: FbsAPI) { return fbs("你还没有填写可用时间。", "Empty-state text for the availability editor, used when the user has not entered availability yet."); }
  static summaryTitle(fbs: FbsAPI) { return fbs("成员可用性汇总", "Title text for the member availability summary in the guild schedule tab, used as the section heading."); }
  static summaryHint(fbs: FbsAPI) { return fbs("汇总仅百业管理员与发过车的车头可见，用于定档期。", "Hint text for the availability summary, used to state that only guild admins and members who have led a squad can see it, for scheduling purposes."); }
  static summaryEmptyText(fbs: FbsAPI) { return fbs("还没有成员填写可用时间。", "Empty-state text for the availability summary, used when no member has entered availability yet."); }
  static pollsTitle(fbs: FbsAPI) { return fbs("活动时间投票", "Title text for the time polls section in the guild schedule tab, used as the section heading."); }
  static pollsHint(fbs: FbsAPI) { return fbs("给出几个候选时间，成员勾选所有能参加的时间；可参加人数最多的时段最适合定档。", "Hint text for the time polls section, used to explain that members tick every time they can join and the slot with the most available members suits scheduling best."); }
  static pollEmptyText(fbs: FbsAPI) { return fbs("还没有时间投票。", "Empty-state text for the time polls section, used when no polls exist yet."); }
  static pollCreateLabel(fbs: FbsAPI) { return fbs("发起投票", "Button label for the time polls section, used to open the poll creation form."); }
  static pollTitleLabel(fbs: FbsAPI) { return fbs("投票标题", "Field label for the poll creation form, used for the poll title input."); }
  static pollTitlePlaceholder(fbs: FbsAPI) { return fbs("如：本周开荒时间", "Placeholder text for the poll creation form, used in the title input with an example title."); }
  static pollCandidatesLabel(fbs: FbsAPI) { return fbs("候选时间", "Field label for the poll creation form, used for the candidate time list."); }
  static pollAddCandidateLabel(fbs: FbsAPI) { return fbs("添加候选", "Button label for the poll creation form, used to add a candidate time."); }
  static pollSubmitLabel(fbs: FbsAPI) { return fbs("发布投票", "Button label for the poll creation form, used to publish the poll."); }
  static pollVoteLabel(fbs: FbsAPI) { return fbs("提交投票", "Button label for poll cards, used to submit or resubmit the viewer's votes."); }
  static pollVotedText(fbs: FbsAPI) { return fbs("已投票，可修改后重新提交。", "Status text for poll cards, used when the viewer has voted and may still change and resubmit."); }
  static pollStatusOpenText(fbs: FbsAPI) { return fbs("进行中", "Status label for poll cards, used for a poll that is still open."); }
  static pollStatusClosedText(fbs: FbsAPI) { return fbs("已关闭", "Status label for poll cards, used for a poll that has been closed."); }
  static pollCloseLabel(fbs: FbsAPI) { return fbs("关闭投票", "Button label for poll cards, used by the poll creator or a guild admin to close the poll."); }
  static pollVoteCountTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("count", pv(p, "count")), " 人可参加"], "Count text for poll candidate rows, used to show how many members can join at that time, where {count} is the number of available members."); }
  static pollLaunchLabel(fbs: FbsAPI) { return fbs("以此时间发车", "Button label for poll candidate rows, used to create a squad at that candidate time with the form prefilled."); }
  static pollCancelLabel(fbs: FbsAPI) { return fbs("取消", "Button label for the poll creation form, used to abandon creating a poll."); }
  static toastPollCreated(fbs: FbsAPI) { return fbs("投票已发布", "Toast message for time polls, used after a poll is published."); }
  static toastVoted(fbs: FbsAPI) { return fbs("已提交", "Toast message for time polls, used after votes are submitted."); }
  static toastClosed(fbs: FbsAPI) { return fbs("投票已关闭", "Toast message for time polls, used after a poll is closed."); }
  static toastFailedTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["操作失败：", fbs.param("error", pv(p, "error"))], "Toast message for schedule actions, used when an availability or poll operation fails, where {error} is the failure reason."); }
  static settingsLinkLabel(fbs: FbsAPI) { return fbs("在个人设置中填写", "Link label for the guild schedule tab, used on the line that points members to the availability editor in their profile settings."); }
  static noGuildsText(fbs: FbsAPI) { return fbs("你还没有加入任何百业，加入后可在此填写可用时间。", "Empty-state text for the personal availability page, used when the user belongs to no guild yet and must join one before entering availability."); }
}

export abstract class CarshareFbtUtils {
  static kicker(fbs: FbsAPI) { return fbs("车队招募 · 公开分享", "Kicker text for the public squad share page, used above the title to identify the page as a shared squad."); }
  static loginLabel(fbs: FbsAPI) { return fbs("登录并报名", "Button label for the public squad share page, used by signed-out visitors to start Discord login and land on the full squad page to sign up."); }
  static openLabel(fbs: FbsAPI) { return fbs("打开车队页", "Button label for the public squad share page, used by signed-in visitors to open the full interactive squad page."); }
  static notFoundTitle(fbs: FbsAPI) { return fbs("链接已失效", "Title text for the squad share error state, used when a share link is invalid or its squad is gone."); }
  static notFoundBody(fbs: FbsAPI) { return fbs("这条分享链接不存在，或对应的车队已经解散。", "Body text for the squad share error state, used to explain that the share link does not exist or the squad behind it has been disbanded."); }
  static readonlyHint(fbs: FbsAPI) { return fbs("这是只读的分享视图：只能查看车队信息，报名要登录后在车队页里操作。", "Hint text for the public squad share page, used to explain that the shared view is read-only and signing up happens on the full squad page after login."); }
  static statusClosed(fbs: FbsAPI) { return fbs("已截止", "Status label for the public squad share page, used when the squad is no longer open for signups."); }
  static seatsTitle(fbs: FbsAPI) { return fbs("座位", "Section title for the public squad share page, used above the read-only seat occupancy grid."); }
}


export abstract class SchedulingAdviceFbtUtils {
  static lockedTitle(fbs: FbsAPI) { return fbs("智能调度建议", "Title text for the scheduling advice locked shell, used as the heading of the premium upgrade prompt shown instead of scheduling advice."); }
  static lockedBody(fbs: FbsAPI) { return fbs("智能配队、替补推荐、名额轮换、最优档期与跨车调度建议属于执事档（T2）权益，升级后即可使用。", "Body text for the scheduling advice locked shell, used to explain that the advice engines belong to the T2 tier and unlock on upgrade."); }
  static title(fbs: FbsAPI) { return fbs("调度建议", "Title text for the scheduling advice panel, used as the section heading on squad and schedule surfaces."); }
  static hint(fbs: FbsAPI) { return fbs("建议仅供参考，最终人选由车头点选决定，系统不会自动落座或递补。", "Hint text for the scheduling advice panel, used to state that advice never seats or substitutes anyone automatically and the leader always decides."); }
  static draftTitle(fbs: FbsAPI) { return fbs("智能配队草案", "Title text for the team draft advice, used as the heading of the suggested seat assignment list."); }
  static draftApplyLabel(fbs: FbsAPI) { return fbs("套用草案", "Button label for the team draft advice, used by the leader to apply the whole draft through the existing seat actions."); }
  static substitutesTitle(fbs: FbsAPI) { return fbs("替补推荐", "Title text for the substitute advice, used as the heading of the ranked substitute candidate list."); }
  static rotationTitle(fbs: FbsAPI) { return fbs("名额轮换建议", "Title text for the rotation advice, used as the heading of the fairness-ranked applicant list."); }
  static rotationSaveLabel(fbs: FbsAPI) { return fbs("保存本次轮换依据", "Button label for the rotation advice, used by the leader to save the current ranking as an auditable record."); }
  static rotationSavedText(fbs: FbsAPI) { return fbs("轮换依据已留痕保存", "Confirmation text for the rotation advice, used after the ranking snapshot is saved."); }
  static bestSlotsTitle(fbs: FbsAPI) { return fbs("最优档期推荐", "Title text for the best-slot advice, used as the heading of the top candidate time windows on the schedule page."); }
  static bestSlotsEmptyText(fbs: FbsAPI) { return fbs("还没有成员填写可用时间，暂无法推荐档期。", "Empty-state text for the best-slot advice, used when no member availability data exists and no slot can be recommended."); }
  static bestSlotCoverTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("count", pv(p, "count")), " 人有空"], "Count text for best-slot advice rows, used to show how many members are available in that window, where {count} is the number of available members."); }
  static bestSlotUseLabel(fbs: FbsAPI) { return fbs("以此时段发车", "Button label for best-slot advice rows, used to open the create-squad form prefilled with that window."); }
  static crossTitle(fbs: FbsAPI) { return fbs("跨车调度建议", "Title text for the cross-squad advice, used as the heading on the squad list overview."); }
  static conflictTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("name", pv(p, "name")), " 同时出现在时段重叠的多辆车中"], "Warning text for cross-squad advice, used to flag a member seated in overlapping squads, where {name} is the member's display name."); }
  static moveTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["可考虑邀请 ", fbs.param("name", pv(p, "name")), " 补入本车"], "Suggestion text for cross-squad advice, used to propose inviting an unconflicted member into an under-filled squad, where {name} is the member's display name."); }
  static reasonRoleNeeded(fbs: FbsAPI, p?: StringParams) { return fbs(["补齐所缺职责：", fbs.param("role", pv(p, "role"))], "Reason text for scheduling advice entries, used when the member fills a role the squad still lacks, where {role} is the role name."); }
  static reasonRoleCovered(fbs: FbsAPI, p?: StringParams) { return fbs(["职责 ", fbs.param("role", pv(p, "role")), " 已有覆盖"], "Reason text for scheduling advice entries, used when the member's role is already covered, where {role} is the role name."); }
  static reasonRoleFlex(fbs: FbsAPI) { return fbs("职责灵活，可补任意位置", "Reason text for scheduling advice entries, used when the member can flex into every role."); }
  static reasonRoleMatch(fbs: FbsAPI, p?: StringParams) { return fbs(["职责与空缺一致：", fbs.param("role", pv(p, "role"))], "Reason text for substitute advice entries, used when the candidate's role matches the vacated role, where {role} is the role name."); }
  static reasonRoleOther(fbs: FbsAPI, p?: StringParams) { return fbs(["职责为 ", fbs.param("role", pv(p, "role")), "，与空缺不同"], "Reason text for substitute advice entries, used when the candidate's role differs from the vacated role, where {role} is the role name."); }
  static reasonRoleUnknown(fbs: FbsAPI) { return fbs("暂无职责记录", "Reason text for scheduling advice entries, used when the member has no recorded role yet."); }
  static reasonGearReady(fbs: FbsAPI, p?: StringParams) { return fbs(["装备库已有 ", fbs.param("count", pv(p, "count")), " 件装备"], "Reason text for scheduling advice entries, used when the member has gear on file, where {count} is the number of gear items."); }
  static reasonGearUnknown(fbs: FbsAPI) { return fbs("装备库暂无记录", "Reason text for scheduling advice entries, used when the member has no gear on file."); }
  static reasonReliable(fbs: FbsAPI, p?: StringParams) { return fbs(["历史就位率 ", fbs.param("rate", pv(p, "rate")), "%（参加 ", fbs.param("count", pv(p, "count")), " 次）"], "Reason text for scheduling advice entries, used to show a member's historical ready rate, where {rate} is the percentage and {count} the participation count."); }
  static reasonNoHistory(fbs: FbsAPI) { return fbs("暂无历史参与记录，按中性评估", "Reason text for scheduling advice entries, used when a member has no participation history and is scored neutrally."); }
  static reasonAvailable(fbs: FbsAPI) { return fbs("该时段在其可用时间内", "Reason text for scheduling advice entries, used when the member's saved availability covers the squad time."); }
  static reasonUnavailable(fbs: FbsAPI) { return fbs("该时段不在其可用时间内", "Reason text for scheduling advice entries, used when the member's saved availability does not cover the squad time."); }
  static reasonAvailabilityUnknown(fbs: FbsAPI) { return fbs("未填写可用时间", "Reason text for scheduling advice entries, used when the member has not saved availability."); }
  static reasonLongestWaiting(fbs: FbsAPI, p?: StringParams) { return fbs(["距上次参与已 ", fbs.param("days", pv(p, "days")), " 天"], "Reason text for rotation advice entries, used to show how long the member has waited since their last participation, where {days} is the day count (30 means a month or more, or never)."); }
  static reasonFewRecent(fbs: FbsAPI, p?: StringParams) { return fbs(["近期参与 ", fbs.param("count", pv(p, "count")), " 次"], "Reason text for rotation advice entries, used to show the member's recent participation count, where {count} is the count."); }
  static reasonNoConflict(fbs: FbsAPI) { return fbs("同时段没有其他车冲突", "Reason text for cross-squad advice entries, used when the candidate has no overlapping squad at that time."); }
}

export abstract class RecapFbtUtils {
  static title(fbs: FbsAPI) { return fbs("AI 活动复盘", "Title text for the AI recap section on the squad detail page, used as the heading above the generated recap of a completed squad."); }
  static lockedTitle(fbs: FbsAPI) { return fbs("AI 复盘 · 高阶档专属", "Title text for the locked AI recap section on the squad detail page, used when the guild is below the top premium tier that includes AI recaps."); }
  static lockedBody(fbs: FbsAPI) { return fbs("AI 活动复盘是高阶订阅档功能：为每场完成的车队生成出席、就位与成绩小结，帮车头与军官快速回顾这一场。", "Body text for the locked AI recap section on the squad detail page, used to explain what the top-tier AI recap feature does for guilds that have not unlocked it."); }
  static notEnabledTitle(fbs: FbsAPI) { return fbs("AI 复盘尚未开启", "Title text for the not-enabled AI recap section on the squad detail page, used when the platform has not configured an AI recap provider yet."); }
  static notEnabledBody(fbs: FbsAPI) { return fbs("平台尚未开启 AI 复盘服务，功能上线后，完成的车队可在此生成复盘。", "Body text for the not-enabled AI recap section on the squad detail page, used to explain that the AI recap service is not switched on yet."); }
  static emptyNotCompletedBody(fbs: FbsAPI) { return fbs("车队完成后，车头或百业管理员可在此生成 AI 复盘。", "Body text for the empty AI recap section on the squad detail page, used when the squad has not been completed yet so no recap can be generated."); }
  static emptyNoRecapBody(fbs: FbsAPI) { return fbs("本场车队还没有复盘。生成后，复盘将展示在这里，全车队成员可见。", "Body text for the empty AI recap section on the squad detail page, used when a completed squad has no recap yet and generation is available."); }
  static generateLabel(fbs: FbsAPI) { return fbs("生成复盘", "Button label for the AI recap section on the squad detail page, used by the squad leader or a guild admin to generate the first recap of a completed squad."); }
  static regenerateLabel(fbs: FbsAPI) { return fbs("重新生成", "Button label for the AI recap section on the squad detail page, used by the squad leader or a guild admin to regenerate the recap, replacing the stored one."); }
  static generatingLabel(fbs: FbsAPI) { return fbs("生成中…", "Button label for the AI recap section on the squad detail page, used while a recap generation request is in progress."); }
  static generateConfirmTitle(fbs: FbsAPI) { return fbs("生成 AI 复盘？", "Title text for the AI recap generation confirmation dialog, used to confirm generating a recap for a squad."); }
  static generateConfirmMessage(fbs: FbsAPI, p?: StringParams) { return fbs(["将为「", fbs.param("title", pv(p, "title")), "」生成 AI 复盘，内容基于本场车的报名、就位与成绩数据。"], "Body text for the AI recap generation confirmation dialog, used to explain what data the recap is generated from, where {title} is the squad title."); }
  static toastGenerated(fbs: FbsAPI) { return fbs("复盘已生成", "Toast message for the AI recap section, used after a recap generation succeeds."); }
  static toastGenerateFailed(fbs: FbsAPI, p?: StringParams) { return fbs(["复盘生成失败：", fbs.param("error", pv(p, "error"))], "Toast message for the AI recap section, used when a recap generation fails, where {error} is the failure reason."); }
  static generatedAt(fbs: FbsAPI, p?: StringParams) { return fbs(["生成于 ", fbs.param("time", pv(p, "time"))], "Meta text for the AI recap section, used to show when the recap was generated, where {time} is the formatted generation time."); }
  static providerText(fbs: FbsAPI, p?: StringParams) { return fbs(["由 ", fbs.param("provider", pv(p, "provider")), " 生成"], "Meta text for the AI recap section, used to name the provider and model that generated the recap, where {provider} is the provider identifier."); }
  static versionText(fbs: FbsAPI, p?: StringParams) { return fbs(["第 ", fbs.param("version", pv(p, "version")), " 版"], "Meta text for the AI recap section, used to show which generation version the stored recap is, where {version} is the version number."); }
  static failedHint(fbs: FbsAPI) { return fbs("上次生成失败，可重试；下方仍是此前生成的复盘。", "Hint text for the AI recap section, used when the latest generation attempt failed but an earlier successful recap is still shown."); }
  static failedHintEmpty(fbs: FbsAPI) { return fbs("上次生成失败，可重试。", "Hint text for the empty AI recap section, used when the latest generation attempt failed and no recap has been generated yet."); }
  static summaryAttendance(fbs: FbsAPI, p?: StringParams) { return fbs(["出席 ", fbs.param("seated", pv(p, "seated")), "/", fbs.param("capacity", pv(p, "capacity")), " 人"], "Summary line for the AI recap section, used to show how many of the squad's seats were filled, where {seated} is the seated count and {capacity} the seat total."); }
  static summaryReady(fbs: FbsAPI, p?: StringParams) { return fbs(["就位 ", fbs.param("ready", pv(p, "ready")), "/", fbs.param("seated", pv(p, "seated")), " 人"], "Summary line for the AI recap section, used to show how many seated members were marked ready, where {ready} is the ready count and {seated} the seated count."); }
  static summaryResults(fbs: FbsAPI, p?: StringParams) { return fbs(["竞速成绩 ", fbs.param("count", pv(p, "count")), " 条 · 最佳 ", fbs.param("best", pv(p, "best"))], "Summary line for the AI recap section, used to show the racing result count and best time of the squad, where {count} is the number of recorded results and {best} the formatted best time."); }
  static adminTabLabel(fbs: FbsAPI) { return fbs("复盘", "Tab label for the guild admin page, used to switch to the AI recap index tab."); }
  static adminTitle(fbs: FbsAPI) { return fbs("AI 复盘记录", "Title text for the AI recap index on the guild admin page, used as the heading above the guild's recap list."); }
  static adminEmptyText(fbs: FbsAPI) { return fbs("暂无复盘记录。在已完成车队的详情页生成复盘后，会在这里汇总。", "Empty-state text for the AI recap index on the guild admin page, used when the guild has no recaps yet and explains where recaps come from."); }
  static adminStatusReadyText(fbs: FbsAPI) { return fbs("已生成", "Status label for the AI recap index on the guild admin page, used for a recap whose latest generation succeeded."); }
  static adminStatusFailedText(fbs: FbsAPI) { return fbs("生成失败", "Status label for the AI recap index on the guild admin page, used for a recap whose latest generation attempt failed."); }
  static adminParagraphCount(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("count", pv(p, "count")), " 段"], "Count text for the AI recap index on the guild admin page, used to show how many paragraphs a recap holds, where {count} is the paragraph count."); }
}

export abstract class CombatReportFbtUtils {
  static title(fbs: FbsAPI) { return fbs("战斗报告", "Title text for the combat report section on the squad detail page and the combat report page, used as the heading above one squad's encounter reports."); }
  static lockedTitle(fbs: FbsAPI) { return fbs("战斗报告 · 订阅专属", "Title text for the locked combat report section on the squad detail page, used when the guild is below the premium tier that includes combat reports."); }
  static lockedBody(fbs: FbsAPI) { return fbs("战斗报告是进阶订阅档（执事起）功能：导入一场的战斗事件文件后，生成技能构成、增益覆盖时间轴与 rDPS 归因表，帮全车看清每一份伤害的来历。", "Body text for the locked combat report section on the squad detail page, used to explain what the combat report feature does for guilds that have not unlocked it."); }
  static emptyBody(fbs: FbsAPI) { return fbs("本场车队还没有战斗报告。车队成员导入一场战斗的事件文件后，报告将展示在这里，全车队成员可见。", "Body text for the empty combat report section on the squad detail page, used when a squad has no imported encounter yet."); }
  static failedHint(fbs: FbsAPI) { return fbs("上次导入处理失败，可重新导入；已经生成的报告不受影响。", "Hint text for the combat report section, used when the latest import attempt failed during processing but earlier reports are unaffected."); }
  static encountersTitle(fbs: FbsAPI) { return fbs("场次", "Heading text for the encounter (attempt) list in the combat report section, used above the rows of imported encounters of one squad."); }
  static viewReportLabel(fbs: FbsAPI) { return fbs("查看完整报告", "Link label for the combat report section on the squad detail page, used to open the full combat report page of the selected encounter."); }
  static resultKill(fbs: FbsAPI) { return fbs("击杀", "Result label for a combat encounter, used when the encounter file declares the boss was killed."); }
  static resultWipe(fbs: FbsAPI) { return fbs("团灭", "Result label for a combat encounter, used when the encounter file declares the attempt wiped."); }
  static resultUnknown(fbs: FbsAPI) { return fbs("结果未记录", "Result label for a combat encounter, used when the encounter file does not declare an outcome."); }
  static bossFallback(fbs: FbsAPI) { return fbs("未知目标", "Fallback boss name for a combat encounter, used when the imported data carries no boss name (overlay session exports)."); }
  static summaryTeam(fbs: FbsAPI, p?: StringParams) { return fbs(["全队总伤 ", fbs.param("total", pv(p, "total")), " · 秒伤 ", fbs.param("dps", pv(p, "dps"))], "Summary line for the combat report overview, used to show the team's total damage and team DPS, where {total} is the formatted team damage and {dps} the formatted team DPS."); }
  static summaryDuration(fbs: FbsAPI, p?: StringParams) { return fbs(["战斗时长 ", fbs.param("duration", pv(p, "duration"))], "Summary line for the combat report overview, used to show the encounter duration, where {duration} is the formatted duration."); }
  static summaryPlayers(fbs: FbsAPI, p?: StringParams) { return fbs(["参战 ", fbs.param("count", pv(p, "count")), " 人"], "Summary line for the combat report overview, used to show how many players were observed in the encounter, where {count} is the player count."); }
  static summarySourceEvents(fbs: FbsAPI) { return fbs("数据来源：战斗事件文件", "Summary line for the combat report overview, used when the encounter was imported from a layer-1 event file."); }
  static summarySourceOverlay(fbs: FbsAPI) { return fbs("数据来源：屏幕视觉记录（官方团队面板口径）", "Summary line for the combat report overview, used when the encounter was imported from an overlay session export whose damage comes from the game's own team panel."); }
  static qualityUnclosed(fbs: FbsAPI, p?: StringParams) { return fbs(["数据提示：", fbs.param("count", pv(p, "count")), " 处增益区间未正常关闭，已按战斗结束时刻收口"], "Data-quality line for the combat report overview, used when buff intervals had to be closed at the encounter end, where {count} is how many intervals were affected."); }
  static modelVersionText(fbs: FbsAPI, p?: StringParams) { return fbs(["归因模型 v", fbs.param("version", pv(p, "version"))], "Meta text for the combat report, used to name the attribution model version that computed the report, where {version} is the model version number."); }
  static startedAtText(fbs: FbsAPI, p?: StringParams) { return fbs(["开场于 ", fbs.param("time", pv(p, "time"))], "Meta text for a combat encounter row, used to show when the encounter started, where {time} is the formatted start time."); }
  static importedAtText(fbs: FbsAPI, p?: StringParams) { return fbs(["导入于 ", fbs.param("time", pv(p, "time"))], "Meta text for a combat encounter row, used to show when the encounter was imported (for overlay exports that carry no start time), where {time} is the formatted import time."); }
  static uploaderText(fbs: FbsAPI, p?: StringParams) { return fbs(["由 ", fbs.param("name", pv(p, "name")), " 导入"], "Meta text for a combat encounter row, used to name the member who imported it, where {name} is the uploader's display name."); }
  static guestTag(fbs: FbsAPI) { return fbs("访客", "Tag text for a combat report party row, used when the in-game character name matched no member of this guild's roster and is shown as a guest."); }
  static multiplierUndetermined(fbs: FbsAPI) { return fbs("倍率未定", "Marker text for a combat report buff row, used when the buff's damage multiplier is in neither the file nor the platform dictionary, so attribution treats it as 1.0 and says so."); }
  static applierSystem(fbs: FbsAPI) { return fbs("系统", "Applier name for a combat report buff row, used when the buff was applied by the game system rather than a player."); }
  static panelSkillLabel(fbs: FbsAPI) { return fbs("面板伤害", "Skill name for a combat report skill row of an overlay import, used for damage that comes from the team panel totals without per-skill attribution."); }
  static unnamedCast(fbs: FbsAPI) { return fbs("未命名技能", "Cast name for a combat report cast point, used when the cast's skill name was not identified."); }
  static importLabel(fbs: FbsAPI) { return fbs("导入战斗报告", "Button label for the combat report section, used by a squad member to import one encounter file."); }
  static importingLabel(fbs: FbsAPI) { return fbs("导入中…", "Button label for the combat report section, used while an encounter import request is in progress."); }
  static importHint(fbs: FbsAPI) { return fbs("选择一场战斗的事件文件（JSON）或 overlay 会话导出，导入后全车队可见。", "Hint text for the combat report section, used to explain which files the import accepts."); }
  static toastImported(fbs: FbsAPI) { return fbs("战斗报告已导入", "Toast message for the combat report section, used after an encounter import succeeds."); }
  static toastImportFailedTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["导入失败：", fbs.param("error", pv(p, "error"))], "Toast message for the combat report section, used when an encounter import fails, where {error} is the failure reason."); }
  static importErrorFormat(fbs: FbsAPI) { return fbs("文件格式版本不受支持", "Error reason for a combat report import, used when the file's format version is not supported."); }
  static importErrorValidation(fbs: FbsAPI) { return fbs("文件内容校验未通过", "Error reason for a combat report import, used when the file fails validation and nothing was imported."); }
  static importErrorLimit(fbs: FbsAPI) { return fbs("今日导入次数已达上限", "Error reason for a combat report import, used when the guild reaches its daily import ceiling."); }
  static importErrorForbidden(fbs: FbsAPI) { return fbs("没有导入权限", "Error reason for a combat report import, used when the caller may not import into this squad."); }
  static importErrorNotFound(fbs: FbsAPI) { return fbs("车队不存在", "Error reason for a combat report import, used when the target squad does not exist."); }
  static importErrorTier(fbs: FbsAPI) { return fbs("本百业尚未开通战斗报告", "Error reason for a combat report import, used when the guild is below the tier that includes combat reports."); }
  static deleteLabel(fbs: FbsAPI) { return fbs("删除", "Button label for a combat encounter row, used by the uploader or a squad manager to delete that encounter's report."); }
  static deleteConfirmTitle(fbs: FbsAPI) { return fbs("删除这场战斗报告？", "Title text for the combat encounter deletion confirmation dialog, used to confirm deleting one encounter report."); }
  static deleteConfirmMessageTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["将删除「", fbs.param("boss", pv(p, "boss")), "」的这场战斗报告，删除后不可恢复。"], "Body text for the combat encounter deletion confirmation dialog, where {boss} is the encounter's boss name."); }
  static toastDeleted(fbs: FbsAPI) { return fbs("已删除", "Toast message for the combat report section, used after an encounter report is deleted."); }
  static toastDeleteFailedTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["删除失败：", fbs.param("error", pv(p, "error"))], "Toast message for the combat report section, used when deleting an encounter report fails, where {error} is the failure reason."); }
  static tabOverviewLabel(fbs: FbsAPI) { return fbs("总览", "Tab label for the combat report page, used to switch to the overview tab (summary and party table)."); }
  static tabDamageLabel(fbs: FbsAPI) { return fbs("伤害", "Tab label for the combat report page, used to switch to the per-player skill breakdown tab."); }
  static tabBuffsLabel(fbs: FbsAPI) { return fbs("增益", "Tab label for the combat report page, used to switch to the buff uptime timeline tab."); }
  static tabCastsLabel(fbs: FbsAPI) { return fbs("施法", "Tab label for the combat report page, used to switch to the cast list tab."); }
  static tabTimelineLabel(fbs: FbsAPI) { return fbs("时间线", "Tab label for the combat report page, used to switch to the team damage timeline tab."); }
  static backLabel(fbs: FbsAPI) { return fbs("返回车队", "Link label for the combat report page, used to go back to the squad detail page."); }
  static colPlayer(fbs: FbsAPI) { return fbs("玩家", "Column header for the combat report party table, used above the player name column."); }
  static colTotal(fbs: FbsAPI) { return fbs("总量", "Column header for combat report tables, used above a total damage column."); }
  static colActivity(fbs: FbsAPI) { return fbs("活跃", "Column header for the combat report party table, used above the activity percentage column."); }
  static colDps(fbs: FbsAPI) { return fbs("秒伤", "Column header for combat report tables, used above a damage-per-second column."); }
  static colRdps(fbs: FbsAPI) { return fbs("rDPS", "Column header for the combat report party table, used above the attributed damage-per-second column."); }
  static colRShare(fbs: FbsAPI) { return fbs("rDPS 占比", "Column header for the combat report party table, used above the attributed share column."); }
  static colSkill(fbs: FbsAPI) { return fbs("技能", "Column header for the combat report skill table, used above the skill name column."); }
  static colCasts(fbs: FbsAPI) { return fbs("次数", "Column header for the combat report skill table, used above the cast count column."); }
  static colHits(fbs: FbsAPI) { return fbs("命中", "Column header for the combat report skill table, used above the hit count column."); }
  static colAvg(fbs: FbsAPI) { return fbs("平均", "Column header for the combat report skill table, used above the average hit column."); }
  static colCrit(fbs: FbsAPI) { return fbs("会心", "Column header for the combat report skill table, used above the huiXin crit percentage column."); }
  static colSpec(fbs: FbsAPI) { return fbs("会意", "Column header for the combat report skill table, used above the huiYi crit percentage column."); }
  static colMax(fbs: FbsAPI) { return fbs("最高", "Column header for the combat report skill table, used above the maximum single hit column."); }
  static colShare(fbs: FbsAPI) { return fbs("占比", "Column header for the combat report skill table, used above the share-of-player column."); }
  static colBuff(fbs: FbsAPI) { return fbs("增益", "Column header for the combat report buff table, used above the buff name column."); }
  static colApplier(fbs: FbsAPI) { return fbs("施加者", "Column header for the combat report buff table, used above the applier column."); }
  static colTarget(fbs: FbsAPI) { return fbs("目标", "Column header for the combat report buff table, used above the target column."); }
  static colUptime(fbs: FbsAPI) { return fbs("覆盖率", "Column header for the combat report buff table, used above the uptime percentage column."); }
  static colTime(fbs: FbsAPI) { return fbs("时刻", "Column header for the combat report cast list, used above the time-offset column."); }
  static activityNote(fbs: FbsAPI) { return fbs("活跃口径：以 1 秒为格，玩家在格内有施法、命中或施加增益事件即记为活跃。", "Footnote for the combat report party table, used to state the activity percentage definition."); }
  static rdpsNote(fbs: FbsAPI) { return fbs("rDPS 口径：增益带来的额外伤害按各增益倍率的对数权重归还施加者；系统增益留在受益者名下，全队 rDPS 与总伤守恒。", "Footnote for the combat report party table, used to state the rDPS attribution definition."); }
  static castsLocalTitle(fbs: FbsAPI) { return fbs("本地施法记录", "Heading text for the combat report casts tab of an overlay import, used because overlay cast points belong to the local player only."); }
  static timelineTitle(fbs: FbsAPI) { return fbs("每秒全队伤害", "Heading text for the combat report timeline tab, used above the per-second team damage chart."); }
  static adminTabLabel(fbs: FbsAPI) { return fbs("战斗报告", "Tab label for the guild admin page, used to switch to the combat report index tab."); }
  static adminTitle(fbs: FbsAPI) { return fbs("战斗报告记录", "Title text for the combat report index on the guild admin page, used as the heading above the guild's encounter list."); }
  static adminEmptyText(fbs: FbsAPI) { return fbs("暂无战斗报告记录。车队成员导入战斗报告后，会在这里汇总。", "Empty-state text for the combat report index on the guild admin page, used when the guild has no encounters yet."); }
  static adminStatusParsedText(fbs: FbsAPI) { return fbs("已生成", "Status label for the combat report index on the guild admin page, used for an encounter that was processed successfully."); }
  static adminStatusFailedText(fbs: FbsAPI) { return fbs("处理失败", "Status label for the combat report index on the guild admin page, used for an encounter whose import processing failed."); }
}
