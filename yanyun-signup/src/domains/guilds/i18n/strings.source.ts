/* fbtee declaration surface for the guilds domain (hand-maintained): this
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

export abstract class LockedFbtUtils {
  static backLink(fbs: FbsAPI) { return fbs("‹ 我的百业", "Back link for the guild locked page, used at the top of the page to return to the user's guild list."); }
  static title(fbs: FbsAPI) { return fbs("无权访问这个百业", "Title text for the guild locked page, used as the heading shown when the viewer has no access to a guild."); }
  static body1(fbs: FbsAPI) { return fbs("该百业不存在，或仅对某个 Discord 服务器的成员开放。", "Body text for the guild locked page, used as the first paragraph to explain the guild does not exist or is restricted to one Discord server's members."); }
  static body2(fbs: FbsAPI) { return fbs("加入对应的 Discord 服务器后，用同一个账号登录即可访问。", "Body text for the guild locked page, used as the second paragraph to explain that joining that Discord server and signing in with the same account grants access."); }
  static backButton(fbs: FbsAPI) { return fbs("回到我的百业", "Button label for the guild locked page, used to return to the user's guild list."); }
}

export abstract class GuildHomeFbtUtils {
  static backToHub(fbs: FbsAPI) { return fbs("← 百业集结", "Back link for the guild home page, used at the top of the page to return to the platform hub."); }
  static backPlain(fbs: FbsAPI) { return fbs("← 返回", "Back link for guild sub-pages, used at the top of pages inside a guild to go back one level."); }
  static tabTeam(fbs: FbsAPI) { return fbs("组队", "Tab label for the guild home page, used to switch to the squads tab."); }
  static tabDex(fbs: FbsAPI) { return fbs("攻略", "Tab label for the guild home page, used to switch to the guides tab."); }
  static tabSect(fbs: FbsAPI) { return fbs("流派攻略", "Tab label for the guild home page, used to switch to the sect guides tab."); }
  static tabAnnouncements(fbs: FbsAPI) { return fbs("公告", "Tab label for the guild home page, used to switch to the announcements tab."); }
  static readOnlyBanner(fbs: FbsAPI) { return fbs("该百业尚未绑定 Discord 服务器 · 只读浏览", "Banner text for unbound guilds on the guild home page, used to warn that the guild has not bound a Discord server and is read-only."); }
  static adminLink(fbs: FbsAPI) { return fbs("管理", "Link label for the guild home page, used to open the guild admin area, shown only to viewers who pass the admin check."); }
  static tabSchedule(fbs: FbsAPI) { return fbs("排期", "Tab label for the guild home page, used to switch to the schedule tab."); }
  static tabMarket(fbs: FbsAPI) { return fbs("补位市场", "Tab label for the guild home page, used to switch to the fill-in market tab."); }
  static tabAllies(fbs: FbsAPI) { return fbs("盟友", "Tab label for the guild home page, used to switch to the allied guilds tab."); }
}

export abstract class GuildAdminFbtUtils {
  static title(fbs: FbsAPI) { return fbs("管理百业", "Title text for the guild admin page, used as the page heading."); }
  static lockedTitle(fbs: FbsAPI) { return fbs("无权管理这个百业", "Title text for the guild admin locked page, used as the heading shown to viewers without admin access."); }
  static lockedBody(fbs: FbsAPI) { return fbs("只有该百业所绑 Discord 服务器的管理员（服务器主或拥有管理权限）可以进入管理页。", "Body text for the guild admin locked page, used to explain that only administrators of the guild's bound Discord server may enter."); }
  static backLink(fbs: FbsAPI) { return fbs("‹ 返回百业", "Back link for the guild admin page, used at the top of the page to return to the guild home."); }
  static tabProfile(fbs: FbsAPI) { return fbs("资料", "Tab label for the guild admin page, used to switch to the profile settings tab."); }
  static tabDiscord(fbs: FbsAPI) { return fbs("Discord", "Tab label for the guild admin page, used to switch to the Discord integration tab."); }
  static tabEvents(fbs: FbsAPI) { return fbs("活动", "Tab label for the guild admin page, used to switch to the events tab."); }
  static tabGuides(fbs: FbsAPI) { return fbs("攻略数据", "Tab label for the guild admin page, used to switch to the guide data tab."); }
  static saveButton(fbs: FbsAPI) { return fbs("保存", "Button label for guild admin forms, used to save the current tab's changes."); }
  static savedText(fbs: FbsAPI) { return fbs("已保存", "Confirmation text for guild admin forms, used as a transient notice after changes are saved."); }
  static deleteButton(fbs: FbsAPI) { return fbs("删除", "Button label for guild admin rows, used to delete the row's record."); }
  static editButton(fbs: FbsAPI) { return fbs("编辑", "Button label for guild admin rows, used to edit the row's record."); }
  static addButton(fbs: FbsAPI) { return fbs("新增", "Button label for guild admin sections, used to add a new record."); }
  static profileTitle(fbs: FbsAPI) { return fbs("百业资料", "Section heading for the guild admin profile tab, used above the guild profile form."); }
  static nameLabel(fbs: FbsAPI) { return fbs("百业名称", "Field label for the guild profile form, used for the guild name input."); }
  static announcementLabel(fbs: FbsAPI) { return fbs("公告", "Field label for the guild profile form, used for the guild announcement input."); }
  static sloganLabel(fbs: FbsAPI) { return fbs("标语", "Field label for the guild profile form, used for the guild slogan input."); }
  static masterNameLabel(fbs: FbsAPI) { return fbs("掌门", "Field label for the guild profile form, used for the guild master display name input."); }
  static logoUrlLabel(fbs: FbsAPI) { return fbs("标志图链接", "Field label for the guild profile form, used for the logo image URL input."); }
  static bgImageUrlLabel(fbs: FbsAPI) { return fbs("背景图链接", "Field label for the guild profile form, used for the background image URL input."); }
  static avatarTitle(fbs: FbsAPI) { return fbs("百业头像", "Section heading for the guild avatar settings, used above the avatar upload controls."); }
  static avatarUpload(fbs: FbsAPI) { return fbs("上传头像", "Button label for the guild avatar settings, used to upload an avatar image."); }
  static avatarReplace(fbs: FbsAPI) { return fbs("更换头像", "Button label for the guild avatar settings, used to replace the current avatar image."); }
  static avatarDelete(fbs: FbsAPI) { return fbs("删除头像", "Button label for the guild avatar settings, used to delete the current avatar image."); }
  static avatarNone(fbs: FbsAPI) { return fbs("尚未设置头像，当前显示默认印章。", "Status text for the guild avatar settings, used when no avatar is set and the default seal is shown."); }
  static avatarHint(fbs: FbsAPI) { return fbs("正方形图片效果最佳，大小 ≤ 400KB（PNG / JPEG / WebP）。", "Hint text for the guild avatar settings, used to state the preferred square shape and the size and format limits."); }
  static discordTitle(fbs: FbsAPI) { return fbs("Discord 集成", "Section heading for the guild admin Discord tab, used above the integration settings."); }
  static webhookLabel(fbs: FbsAPI) { return fbs("发车提醒 Webhook", "Field label for the Discord tab, used for the departure reminder webhook input."); }
  static webhookSet(fbs: FbsAPI, p?: StringParams) { return fbs(["已设置（Webhook 编号 ", fbs.param("id", pv(p, "id")), "）"], "Status text for the webhook setting, used when a webhook is configured, where {id} is a masked identifier of the webhook."); }
  static webhookUnset(fbs: FbsAPI) { return fbs("未设置", "Status text for the webhook setting, used when no webhook is configured."); }
  static webhookHint(fbs: FbsAPI) { return fbs("保存后不回显完整地址；留空并保存 = 保持不变，点「清除」移除。", "Hint text for the webhook setting, used to explain the saved URL is never shown again, an empty save keeps it and the clear button removes it."); }
  static webhookClear(fbs: FbsAPI) { return fbs("清除 Webhook", "Button label for the Discord tab, used to remove the configured webhook."); }
  static guildIdLabel(fbs: FbsAPI) { return fbs("绑定的服务器 ID", "Field label for the Discord tab, used for the bound server ID display."); }
  static guildIdUnbound(fbs: FbsAPI) { return fbs("未绑定", "Status text for the bound server display, used when the guild has not bound a server."); }
  static reminderTitle(fbs: FbsAPI) { return fbs("发车提醒设置", "Section heading for the reminder settings in the Discord tab, used above the departure reminder options."); }
  static reminderOffsetsLabel(fbs: FbsAPI) { return fbs("提醒提前量（可多选）", "Field label for the reminder settings, used for the multi-select of reminder lead times."); }
  static reminderOffsetOption(fbs: FbsAPI, p?: StringParams) { return fbs(["提前 ", fbs.param("minutes", pv(p, "minutes")), " 分钟"], "Option pattern for the reminder lead time selector, used to label a lead time, where {minutes} is the number of minutes before departure."); }
  static reminderCustomTextLabel(fbs: FbsAPI) { return fbs("自定义提醒文案", "Field label for the reminder settings, used for the custom reminder text input."); }
  static reminderCustomTextHint(fbs: FbsAPI) { return fbs("一行文字，会出现在提醒卡片里；最多 100 字，留空不显示。第一次提前提醒会通知所有人，之后的只催还没就位的人。", "Hint text for the custom reminder text, used to explain the one-line limit, where it appears on the reminder card, and how the first and later reminders differ in reach."); }
  static visibilityTitle(fbs: FbsAPI) { return fbs("可见性", "Section heading for the guild admin profile tab, used above the visibility settings."); }
  static devOnlyLabel(fbs: FbsAPI) { return fbs("仅开发环境可见", "Option label for the visibility settings, used for the development-environment-only choice."); }
  static eventsTitle(fbs: FbsAPI) { return fbs("活动管理", "Section heading for the guild admin events tab, used above the event management list."); }
  static signupCsvSuffix(fbs: FbsAPI) { return fbs("报名表", "File name suffix for signup exports, used when naming the exported signup sheet CSV for an event."); }
  static eventEmpty(fbs: FbsAPI) { return fbs("暂无活动。", "Empty-state text for the events tab, used when the guild has no events."); }
  static eventTitleLabel(fbs: FbsAPI) { return fbs("标题", "Field label for the event editor, used for the event title input."); }
  static eventTypeLabel(fbs: FbsAPI) { return fbs("类型", "Field label for the event editor, used for the event type selector."); }
  static eventStatusLabel(fbs: FbsAPI) { return fbs("状态", "Field label for the event editor, used for the event status selector."); }
  static eventTimeLabel(fbs: FbsAPI) { return fbs("发车时间", "Field label for the event editor, used for the departure time input."); }
  static eventSlotsLabel(fbs: FbsAPI) { return fbs("席位上限", "Field label for the event editor, used for the seat capacity input."); }
  static eventMeetLabel(fbs: FbsAPI) { return fbs("集合信息", "Field label for the event editor, used for the meetup information input."); }
  static eventDescLabel(fbs: FbsAPI) { return fbs("说明", "Field label for the event editor, used for the event description input."); }
  static eventDungeonLabel(fbs: FbsAPI) { return fbs("副本", "Field label for the event editor, used for the dungeon selector."); }
  static statusOpen(fbs: FbsAPI) { return fbs("开放报名", "Status label for admin event lists, used for an event open for signup."); }
  static statusClosed(fbs: FbsAPI) { return fbs("已截止", "Status label for admin event lists, used for an event whose signup has closed."); }
  static statusCompleted(fbs: FbsAPI) { return fbs("已完成", "Status label for admin event lists, used for a completed event."); }
  static statusDraft(fbs: FbsAPI) { return fbs("草稿", "Status label for admin event lists, used for a draft event."); }
  static signupsTitle(fbs: FbsAPI) { return fbs("报名名单", "Section heading for the event editor, used above the signup roster of the event."); }
  static signupEmpty(fbs: FbsAPI) { return fbs("暂无报名。", "Empty-state text for the event signup roster, used when the event has no signups."); }
  static exportCsvButton(fbs: FbsAPI) { return fbs("导出 CSV", "Button label for the event editor, used to export the signup roster as a CSV file."); }
  static removeSignupButton(fbs: FbsAPI) { return fbs("移除", "Button label for signup roster rows, used to remove a signup."); }
  static resultsTitle(fbs: FbsAPI) { return fbs("竞速成绩", "Section heading for the event editor, used above the racing results list."); }
  static resultTeamLabel(fbs: FbsAPI) { return fbs("队伍名", "Field label for the racing result editor, used for the team name input."); }
  static resultMembersLabel(fbs: FbsAPI) { return fbs("队员（逗号分隔）", "Field label for the racing result editor, used for the comma-separated members input."); }
  static resultTimeLabel(fbs: FbsAPI) { return fbs("用时（如 12:34.567）", "Field label for the racing result editor, used for the clear time input with its expected format."); }
  static resultProofLabel(fbs: FbsAPI) { return fbs("凭证链接", "Field label for the racing result editor, used for the proof link input."); }
  static resultNoteLabel(fbs: FbsAPI) { return fbs("备注", "Field label for the racing result editor, used for the note input."); }
  static guidesTitle(fbs: FbsAPI) { return fbs("流派攻略数据（BiS / 循环）", "Section heading for the guild admin guides tab, used above the per-sect guide data editor."); }
  static guidesHint(fbs: FbsAPI) { return fbs("按流派填写：build 名称、属性行、占比行、BiS（JSON）与循环（JSON）。保存后流派页即时生效。", "Hint text for the guides tab, used to explain the per-sect fields, the JSON conventions for BiS and rotation data and the fallback to built-in data while empty."); }
  static guideSchoolLabel(fbs: FbsAPI) { return fbs("流派", "Field label for the guide data editor, used for the sect selector."); }
  static guideBuildLabel(fbs: FbsAPI) { return fbs("Build 名称", "Field label for the guide data editor, used for the build name input."); }
  static guideAttrLabel(fbs: FbsAPI) { return fbs("属性行", "Field label for the guide data editor, used for the attribute lines input."); }
  static guideRateLabel(fbs: FbsAPI) { return fbs("占比行", "Field label for the guide data editor, used for the ratio lines input."); }
  static guideBisLabel(fbs: FbsAPI) { return fbs("BiS（JSON）", "Field label for the guide data editor, used for the BiS JSON input."); }
  static guideRotationLabel(fbs: FbsAPI) { return fbs("循环（JSON）", "Field label for the guide data editor, used for the rotation JSON input."); }
  static tabStats(fbs: FbsAPI) { return fbs("统计", "Tab label for the guild admin page, used to switch to the statistics tab."); }
  static tabSeason(fbs: FbsAPI) { return fbs("赛季", "Tab label for the guild admin page, used to switch to the season tab."); }
  static seasonTitle(fbs: FbsAPI) { return fbs("赛季前检查清单", "Title text for the season checklist in the guild admin season tab, used as the section heading."); }
  static seasonHint(fbs: FbsAPI, p?: StringParams) { return fbs(["按当前版本 ", fbs.param("version", pv(p, "version")), " 与赛季 ", fbs.param("season", pv(p, "season")), " 自动生成；换季后清单自动重置，逐项复核后勾选。"], "Hint text for the season checklist, used to explain it is generated from the current version and season and refreshes itself after a season change, where {version} is the game version and {season} the season number."); }
  static seasonProgress(fbs: FbsAPI, p?: StringParams) { return fbs(["已完成 ", fbs.param("done", pv(p, "done")), " / ", fbs.param("total", pv(p, "total"))], "Progress text for the season checklist, used to show completed items against the total, where {done} is the completed count and {total} the item total."); }
  static seasonItemDungeonsTitle(fbs: FbsAPI) { return fbs("复核当前版本副本", "Item title for the season checklist, used for the current-version dungeon review item."); }
  static seasonItemDungeonsDetail(fbs: FbsAPI, p?: StringParams) { return fbs(["当前版本（", fbs.param("version", pv(p, "version")), "）共有 ", fbs.param("count", pv(p, "count")), " 个副本，确认达标要求与攻略已按本赛季更新。"], "Item detail for the season checklist, used to state the current-version dungeon count and ask for a standards and guide review, where {version} is the game version and {count} the dungeon count."); }
  static seasonItemTemplatesTitle(fbs: FbsAPI) { return fbs("复核组队模板", "Item title for the season checklist, used for the squad template review item."); }
  static seasonItemTemplatesDetail(fbs: FbsAPI, p?: StringParams) { return fbs(["本百业现有 ", fbs.param("count", pv(p, "count")), " 个组队模板，确认模板的副本与人数仍适用于本赛季。"], "Item detail for the season checklist, used to state the guild's template count and ask for a season-fit review, where {count} is the number of templates."); }
  static seasonItemGuidesTitle(fbs: FbsAPI) { return fbs("复核流派攻略数据", "Item title for the season checklist, used for the sect guide data review item."); }
  static seasonItemGuidesDetail(fbs: FbsAPI, p?: StringParams) { return fbs(["攻略数据现有 ", fbs.param("builds", pv(p, "builds")), " 份 BiS 与 ", fbs.param("rotations", pv(p, "rotations")), " 份循环，确认已按本赛季数值更新。"], "Item detail for the season checklist, used to state the BiS and rotation counts and ask for a new-version review, where {builds} is the BiS count and {rotations} the rotation count."); }
  static seasonItemRosterTitle(fbs: FbsAPI) { return fbs("复核成员名册", "Item title for the season checklist, used for the member roster review item."); }
  static seasonItemRosterDetail(fbs: FbsAPI, p?: StringParams) { return fbs(["Discord 名册 ", fbs.param("members", pv(p, "members")), " 人，截图名册 ", fbs.param("entries", pv(p, "entries")), " 条；确认成员装备季标与名册均为本赛季最新。"], "Item detail for the season checklist, used to compare the Discord roster against screenshot roster entries, where {members} is the Discord member count and {entries} the roster entry count."); }
  static rosterTitle(fbs: FbsAPI) { return fbs("成员名册（截图导入）", "Section heading for the guild admin season tab, used above the screenshot roster import tools."); }
  static rosterHint(fbs: FbsAPI) { return fbs("上传游戏内成员名单截图，识别出的名字先进入预览，确认后才写入名册。名册只记录游戏内名字，不会改变任何人的 Discord 成员资格。", "Hint text for the roster import, used to explain that recognized names land in a preview before saving and that the roster records in-game names only."); }
  static rosterUpload(fbs: FbsAPI) { return fbs("上传名单截图", "Button label for the roster import, used to upload a member list screenshot."); }
  static rosterOcrRunning(fbs: FbsAPI) { return fbs("识别中…", "Progress text for the roster import, used while screenshot recognition runs."); }
  static rosterPreviewTitle(fbs: FbsAPI) { return fbs("导入预览", "Title text for the roster import preview, used above the recognized name list awaiting confirmation."); }
  static rosterConfirm(fbs: FbsAPI) { return fbs("确认导入", "Button label for the roster import preview, used to confirm importing the recognized names."); }
  static rosterEmpty(fbs: FbsAPI) { return fbs("尚无名册记录，用上方按钮上传名单截图导入。", "Empty-state text for the roster section, used when no roster records exist yet."); }
  static rosterSourceOcr(fbs: FbsAPI) { return fbs("截图识别", "Source label for roster entries, used for entries created by screenshot recognition."); }
  static rosterMatchedMember(fbs: FbsAPI) { return fbs("已匹配 Discord 成员", "Status text for roster preview rows, used when a recognized name matches a Discord member."); }
  static rosterStatusMatched(fbs: FbsAPI) { return fbs("已匹配", "Status label for roster preview rows, used for a name matched to a Discord member."); }
  static rosterStatusNew(fbs: FbsAPI) { return fbs("疑似新名", "Status label for roster preview rows, used for a likely new name."); }
  static rosterStatusUnrecognized(fbs: FbsAPI) { return fbs("无法识别", "Status label for roster preview rows, used for a name that could not be recognized."); }
  static rosterImported(fbs: FbsAPI, p?: StringParams) { return fbs(["已导入 ", fbs.param("count", pv(p, "count")), " 条名册记录"], "Confirmation text for the roster import, used after records are imported, where {count} is the number of imported records."); }
  static statsTitle(fbs: FbsAPI) { return fbs("出勤与活跃", "Title text for the guild admin statistics tab, used as the tab heading."); }
  static statsCurrentWeek(fbs: FbsAPI) { return fbs("本周", "Label for the statistics tab, used for the current week figures column."); }
  static statsCars(fbs: FbsAPI) { return fbs("开车", "Metric label for the statistics tab, used for the squads created count."); }
  static statsCompleted(fbs: FbsAPI) { return fbs("完成", "Metric label for the statistics tab, used for the squads completed count."); }
  static statsSeats(fbs: FbsAPI) { return fbs("席位", "Metric label for the statistics tab, used for the seats filled count."); }
  static statsFillRate(fbs: FbsAPI) { return fbs("满员率", "Metric label for the statistics tab, used for the seat fill rate."); }
  static statsParticipants(fbs: FbsAPI) { return fbs("参与人数", "Metric label for the statistics tab, used for the participant count."); }
  static statsPerCapita(fbs: FbsAPI) { return fbs("人均参与", "Metric label for the statistics tab, used for the per-member participation figure."); }
  static statsMembersTitle(fbs: FbsAPI) { return fbs("成员参与榜 · 近 4 周", "Title text for the member participation board in the statistics tab, used above the four-week member ranking."); }
  static statsLeadersTitle(fbs: FbsAPI) { return fbs("车头榜 · 近 4 周", "Title text for the leader board in the statistics tab, used above the four-week leader ranking."); }
  static statsSeatCount(fbs: FbsAPI) { return fbs("落座次数", "Column label for the member participation board, used for the seat count column."); }
  static statsCarCount(fbs: FbsAPI) { return fbs("开车数", "Column label for the leader board, used for the squads led count column."); }
  static statsEmpty(fbs: FbsAPI) { return fbs("近 4 周暂无组队数据。", "Empty-state text for the statistics tab, used when the last four weeks have no squad data."); }
  static tabInsights(fbs: FbsAPI) { return fbs("数据洞察", "Tab label for the guild admin page, used to switch to the premium insights tab."); }
  static insightsReliabilityTitle(fbs: FbsAPI) { return fbs("可靠性档案", "Title text for the reliability profiles section in the insights tab, used as the section heading."); }
  static insightsReliabilityHint(fbs: FbsAPI) { return fbs("出席 = 已完成车辆上落座且已就位；鸽 = 已完成车辆上落座但始终未就位。未完成的车辆不计入出席率。", "Hint text for the reliability profiles section, used to state the attendance and no-show definitions the counts follow."); }
  static insightsSignupsLabel(fbs: FbsAPI) { return fbs("报名", "Column label for the reliability profiles section, used for the signup count column."); }
  static insightsAttendedLabel(fbs: FbsAPI) { return fbs("出席", "Column label for the reliability profiles section, used for the attended count column."); }
  static insightsNoShowLabel(fbs: FbsAPI) { return fbs("鸽", "Column label for the reliability profiles section, used for the no-show count column."); }
  static insightsRateLabel(fbs: FbsAPI) { return fbs("出席率", "Column label for the reliability profiles section, used for the attendance rate column."); }
  static insightsReliabilityEmpty(fbs: FbsAPI) { return fbs("暂无带身份戳的报名记录。", "Empty-state text for the reliability profiles section, used when no member has a stamped signup record."); }
  static insightsHeatmapTitle(fbs: FbsAPI) { return fbs("成员参与热力图", "Title text for the participation heatmap section in the insights tab, used as the section heading."); }
  static insightsHeatmapHint(fbs: FbsAPI) { return fbs("按你所在时区统计已完成车辆的出席人次，格子越亮人越多。", "Hint text for the participation heatmap section, used to explain the buckets follow the viewer's timezone and count attended participations."); }
  static insightsHeatmapEmpty(fbs: FbsAPI) { return fbs("暂无出席记录。", "Empty-state text for the participation heatmap section, used when no attended participation exists yet."); }
  static insightsHeatmapTotal(fbs: FbsAPI, p?: StringParams) { return fbs(["共 ", fbs.param("count", pv(p, "count")), " 人次出席"], "Summary text for the participation heatmap section, used to state the total attended participations, where {count} is that total."); }
  static insightsWeekdayMon(fbs: FbsAPI) { return fbs("周一", "Weekday label for the participation heatmap, used for the Monday row."); }
  static insightsWeekdayTue(fbs: FbsAPI) { return fbs("周二", "Weekday label for the participation heatmap, used for the Tuesday row."); }
  static insightsWeekdayWed(fbs: FbsAPI) { return fbs("周三", "Weekday label for the participation heatmap, used for the Wednesday row."); }
  static insightsWeekdayThu(fbs: FbsAPI) { return fbs("周四", "Weekday label for the participation heatmap, used for the Thursday row."); }
  static insightsWeekdayFri(fbs: FbsAPI) { return fbs("周五", "Weekday label for the participation heatmap, used for the Friday row."); }
  static insightsWeekdaySat(fbs: FbsAPI) { return fbs("周六", "Weekday label for the participation heatmap, used for the Saturday row."); }
  static insightsWeekdaySun(fbs: FbsAPI) { return fbs("周日", "Weekday label for the participation heatmap, used for the Sunday row."); }
  static insightsGearTitle(fbs: FbsAPI) { return fbs("装备达标盘", "Title text for the gear readiness board section in the insights tab, used as the section heading."); }
  static insightsGearHint(fbs: FbsAPI) { return fbs("达标线按成员最佳构筑的毕业分判定；缺口名单列出未达标成员与差距。", "Hint text for the gear readiness board section, used to explain the board judges each member's best build graduation score against the line."); }
  static insightsGearEmpty(fbs: FbsAPI) { return fbs("尚未设置达标线，先在下方添加一条。", "Empty-state text for the gear readiness board section, used when the guild has no readiness line yet."); }
  static insightsGearLabelLabel(fbs: FbsAPI) { return fbs("场景名称", "Field label for the gear readiness form, used for the scene name input."); }
  static insightsGearMinScoreLabel(fbs: FbsAPI) { return fbs("达标线（毕业分）", "Field label for the gear readiness form, used for the minimum graduation score input."); }
  static insightsGearAddLabel(fbs: FbsAPI) { return fbs("添加达标线", "Button label for the gear readiness form, used to add a new readiness line."); }
  static insightsGearMetLabel(fbs: FbsAPI) { return fbs("达标", "Status label for the gear readiness board, used for a member whose best score meets the line."); }
  static insightsGearUnmetLabel(fbs: FbsAPI) { return fbs("未达标", "Status label for the gear readiness board, used for a member whose best score is below the line."); }
  static insightsGearNoBuildLabel(fbs: FbsAPI) { return fbs("无构筑", "Status label for the gear readiness board, used for a member with no saved build snapshot."); }
  static insightsGearScoreLabel(fbs: FbsAPI) { return fbs("毕业分", "Column label for the gear readiness board, used for the best graduation score column."); }
  static insightsGearGapLabel(fbs: FbsAPI) { return fbs("缺口", "Column label for the gear readiness board, used for the gap-to-line column."); }
  static insightsGearSummary(fbs: FbsAPI, p?: StringParams) { return fbs(["达标 ", fbs.param("met", pv(p, "met")), " · 未达标 ", fbs.param("unmet", pv(p, "unmet")), " · 无构筑 ", fbs.param("nobuild", pv(p, "nobuild"))], "Summary text for one gear readiness line, used to state its met, unmet and no-build member counts, where {met}, {unmet} and {nobuild} are those counts."); }
  static insightsRaceTitle(fbs: FbsAPI) { return fbs("竞速赛季总榜", "Title text for the race season board section, used as the section heading in the insights tab and on the guild home board."); }
  static insightsRaceEmpty(fbs: FbsAPI) { return fbs("暂无竞速成绩记录。", "Empty-state text for the race season board, used when the guild has no recorded race results."); }
  static insightsRaceTeamLabel(fbs: FbsAPI) { return fbs("队伍", "Column label for the race season board, used for the team name column."); }
  static insightsRaceRunsLabel(fbs: FbsAPI) { return fbs("场次", "Column label for the race season board, used for the run count column."); }
  static insightsRaceWinsLabel(fbs: FbsAPI) { return fbs("夺冠", "Column label for the race season board, used for the win count column."); }
  static insightsRaceBestLabel(fbs: FbsAPI) { return fbs("最佳成绩", "Column label for the race season board, used for the best time column."); }
  static insightsRaceUnclassified(fbs: FbsAPI) { return fbs("未分类赛季", "Section label for the race season board, used for results whose dungeon has no season classification."); }
  static insightsSelfGearTitle(fbs: FbsAPI) { return fbs("我的达标状态", "Title text for the member's own gear readiness status on the guild home page, used as the section heading."); }
  static statsBoardEmpty(fbs: FbsAPI) { return fbs("暂无记录。", "Empty-state text for statistics boards, used when a board has no records."); }
  static whiteLabelTitle(fbs: FbsAPI) { return fbs("品牌与分享卡", "Section heading for the guild admin profile tab, used above the branding and share card settings."); }
  static hideBrandingLabel(fbs: FbsAPI) { return fbs("隐藏平台品牌", "Toggle label for the branding settings, used for the option that hides platform branding on the guild's pages."); }
  static hideBrandingHint(fbs: FbsAPI) { return fbs("开启后，本百业的页面上不再显示平台名称与页脚声明，只呈现百业自己的信息。", "Hint text for the branding settings, used to explain that enabling it removes the platform name and footer statement from the guild's pages."); }
  static ogAccentLabel(fbs: FbsAPI) { return fbs("分享卡强调色", "Field label for the share card settings, used for the accent color selector."); }
  static ogTitleSuffixLabel(fbs: FbsAPI) { return fbs("分享卡标题后缀", "Field label for the share card settings, used for the title suffix input."); }
  static ogTitleSuffixHint(fbs: FbsAPI) { return fbs("会接在分享卡的标题后面，如「· 招募中」；最多 30 字，留空不显示。", "Hint text for the share card title suffix, used to explain it is appended to the share card title, limited to thirty characters and hidden while empty."); }
  static ogAccentGold(fbs: FbsAPI) { return fbs("鎏金", "Option label for the share card accent selector, used for the gold accent."); }
  static ogAccentJade(fbs: FbsAPI) { return fbs("翡翠", "Option label for the share card accent selector, used for the jade accent."); }
  static ogAccentAzure(fbs: FbsAPI) { return fbs("藏青", "Option label for the share card accent selector, used for the azure accent."); }
  static ogAccentCinnabar(fbs: FbsAPI) { return fbs("朱砂", "Option label for the share card accent selector, used for the cinnabar accent."); }
  static ogAccentViolet(fbs: FbsAPI) { return fbs("紫檀", "Option label for the share card accent selector, used for the violet accent."); }
  static premiumLockedTitle(fbs: FbsAPI) { return fbs("开通百业 Premium", "Title text for the premium upsell panel in guild admin, used as the heading shown to guilds without premium."); }
  static premiumLockedBody(fbs: FbsAPI) { return fbs("高级发车提醒、出勤统计、品牌与分享卡定制均为 Premium 功能。开通后立即生效，可随时取消。", "Body text for the premium upsell panel, used to list the premium features and the activation and cancellation terms."); }
  static premiumCheckoutButton(fbs: FbsAPI) { return fbs("立即开通", "Button label for the premium upsell panel, used to start premium checkout."); }
  static premiumComingSoon(fbs: FbsAPI) { return fbs("即将开放", "Status text for the premium upsell panel, used while premium checkout is not open yet."); }
  static premiumActiveTitle(fbs: FbsAPI) { return fbs("百业 Premium", "Title text for the premium status panel in guild admin, used as the heading for a guild with premium active."); }
  static premiumPlanName(fbs: FbsAPI) { return fbs("Premium", "Plan name for the premium status panel, used to label the active plan."); }
  static premiumSourceStripe(fbs: FbsAPI) { return fbs("通过 Stripe 订阅", "Source label for the premium status panel, used when premium comes from a Stripe subscription."); }
  static premiumSourceManual(fbs: FbsAPI) { return fbs("由平台授予", "Source label for the premium status panel, used when premium was granted by the platform."); }
  static premiumPeriodEnd(fbs: FbsAPI, p?: StringParams) { return fbs(["当前周期至 ", fbs.param("date", pv(p, "date"))], "Period text for the premium status panel, used to show the current billing period end, where {date} is the period end date."); }
  static premiumPriceMonth(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("amount", pv(p, "amount")), " / 月"], "Price pattern for premium plans, used for the monthly price, where {amount} is the formatted price."); }
  static premiumTier1Name(fbs: FbsAPI) { return fbs("同道", "Plan name for the first premium tier, used on the pricing panel and the premium status panel to name the tier."); }
  static premiumTier2Name(fbs: FbsAPI) { return fbs("执事", "Plan name for the second premium tier, used on the pricing panel and the premium status panel to name the tier."); }
  static premiumTier3Name(fbs: FbsAPI) { return fbs("盟主", "Plan name for the third premium tier, used on the pricing panel and the premium status panel to name the tier."); }
  static premiumTier1Subtitle(fbs: FbsAPI) { return fbs("数据", "Subtitle text for the first premium tier, used on the pricing panel next to the tier name to summarize the tier's focus."); }
  static premiumTier2Subtitle(fbs: FbsAPI) { return fbs("智能", "Subtitle text for the second premium tier, used on the pricing panel next to the tier name to summarize the tier's focus."); }
  static premiumTier3Subtitle(fbs: FbsAPI) { return fbs("旗舰", "Subtitle text for the third premium tier, used on the pricing panel next to the tier name to summarize the tier's focus."); }
  static premiumSourceTrial(fbs: FbsAPI) { return fbs("试用授予", "Source label for the premium status panel, used when the guild's entitlement comes from the new-guild trial grant."); }
  static premiumPastDueNotice(fbs: FbsAPI, p?: StringParams) { return fbs(["订阅已欠费：宽限期 ", fbs.param("days", pv(p, "days")), " 天内仍按原档位使用，请尽快完成续费。"], "Notice text for the premium status panel, used when a Stripe subscription is past due but still inside its grace window, where {days} is the grace length in days."); }
  static premiumPriceYear(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("amount", pv(p, "amount")), " / 年"], "Price pattern for premium plans, used for the yearly price, where {amount} is the formatted price."); }
  static customDomainTitle(fbs: FbsAPI) { return fbs("自定义域名", "Section heading for the custom domain settings in guild admin, used above the domain binding form."); }
  static customDomainHint(fbs: FbsAPI) { return fbs("把百业自己的域名（如 www.example.com）绑定到这里，成员就能用这个域名打开百业页面。每个百业可绑定一个域名；绑定后需要按下方指引在域名服务商处添加两条 DNS 记录。根域名（裸域）能否直接使用取决于注册商是否支持 CNAME 展平，建议使用 www 等子域名。", "Hint text for the custom domain settings, used to explain what binding a custom domain does, the one-domain limit, the DNS records required, and why a subdomain like www is recommended over the bare apex."); }
  static customDomainHostnameLabel(fbs: FbsAPI) { return fbs("域名", "Field label for the custom domain settings, used for the hostname input."); }
  static customDomainHostnamePlaceholder(fbs: FbsAPI) { return fbs("www.example.com", "Placeholder text for the custom domain hostname input, used to show the expected bare hostname format."); }
  static customDomainBindButton(fbs: FbsAPI) { return fbs("绑定域名", "Button label for the custom domain settings, used to submit the hostname binding."); }
  static customDomainRebindButton(fbs: FbsAPI) { return fbs("更换域名", "Button label for the custom domain settings, used to replace the currently bound hostname with a new one."); }
  static customDomainVerifyButton(fbs: FbsAPI) { return fbs("验证并启用", "Button label for the custom domain settings, used to run the DNS verification and activate the domain."); }
  static customDomainRemoveButton(fbs: FbsAPI) { return fbs("解绑域名", "Button label for the custom domain settings, used to remove the domain binding entirely."); }
  static customDomainStatusNone(fbs: FbsAPI) { return fbs("尚未绑定域名", "Status text for the custom domain settings, used when the guild has not bound a domain yet."); }
  static customDomainStatusPendingSeam(fbs: FbsAPI) { return fbs("已绑定，待平台接通", "Status text for the custom domain settings, used when a domain is bound but the platform domain service is not connected yet, so the domain cannot take effect."); }
  static customDomainStatusPendingDns(fbs: FbsAPI) { return fbs("已绑定，待验证 DNS", "Status text for the custom domain settings, used when a domain is bound and waiting for its DNS records to be verified."); }
  static customDomainStatusActive(fbs: FbsAPI) { return fbs("已生效", "Status text for the custom domain settings, used when the bound domain is verified and live."); }
  static customDomainStatusDisabled(fbs: FbsAPI) { return fbs("已被平台停用", "Status text for the custom domain settings, used when the platform has switched the bound domain off."); }
  static customDomainBoundAt(fbs: FbsAPI, p?: StringParams) { return fbs(["绑定于 ", fbs.param("date", pv(p, "date"))], "Timestamp text for the custom domain settings, used to show when the domain was bound, where {date} is the binding date."); }
  static customDomainDnsTitle(fbs: FbsAPI) { return fbs("DNS 设置指引", "Subheading for the custom domain DNS guidance, used above the records the admin must add at their registrar."); }
  static customDomainCnameLabel(fbs: FbsAPI) { return fbs("CNAME 记录（让域名指向平台）", "Record label for the custom domain DNS guidance, used for the CNAME record that points the domain at the platform."); }
  static customDomainTxtLabel(fbs: FbsAPI) { return fbs("TXT 记录（证明域名归你所有）", "Record label for the custom domain DNS guidance, used for the TXT record that proves domain ownership."); }
  static customDomainRecordNameLabel(fbs: FbsAPI) { return fbs("主机记录", "Column label for the custom domain DNS guidance, used for the record name column."); }
  static customDomainRecordValueLabel(fbs: FbsAPI) { return fbs("记录值", "Column label for the custom domain DNS guidance, used for the record value column."); }
  static customDomainSeamNote(fbs: FbsAPI) { return fbs("平台的域名服务尚在接通中：你可以先绑定域名并添加 DNS 记录，平台接通后点「验证并启用」即可生效；接通前该域名不会打开任何页面。", "Note text for the custom domain settings, used while the platform domain service is not connected, explaining that binding and DNS setup can be done ahead and activation follows once the platform connects."); }
  static customDomainDnsNote(fbs: FbsAPI) { return fbs("两条记录都添加后，点「验证并启用」：平台会检查 DNS 是否正确，证书由平台自动签发。DNS 生效可能需要几分钟到几小时，未通过时可稍后再试。", "Note text for the custom domain settings, used to explain the verification step, automatic certificate issuance, and DNS propagation delay."); }
  static customDomainActiveNote(fbs: FbsAPI) { return fbs("域名已生效：用这个域名打开的页面与主站一致。登录使用该域名自己的登录流程，平台会为该域名登记登录回调；更换或解绑域名后，该域名立即停止打开百业页面。", "Note text for the custom domain settings, used when the domain is live, explaining sign-in on the custom domain and that rebinding or removing stops it at once."); }
  static customDomainDisabledNote(fbs: FbsAPI) { return fbs("该域名已被平台停用，当前不会打开任何页面。如需恢复，请联系平台。", "Note text for the custom domain settings, used when the platform has disabled the binding."); }
  static billingSuccess(fbs: FbsAPI) { return fbs("开通成功，Premium 已生效。", "Confirmation text for the billing return page, used after a successful premium checkout."); }
  static billingCanceled(fbs: FbsAPI) { return fbs("已取消开通，未产生扣费。", "Notice text for the billing return page, used after a cancelled premium checkout with no charge made."); }
  static tabAnnouncements(fbs: FbsAPI) { return fbs("公告广播", "Tab label for the guild admin page, used to switch to the announcements broadcast tab."); }
  static tabTools(fbs: FbsAPI) { return fbs("活动工具", "Tab label for the guild admin page, used to switch to the activity tools tab."); }
  static lotteryTitle(fbs: FbsAPI) { return fbs("活动抽奖", "Title text for the lottery section in the guild admin tools tab, used as the section heading."); }
  static lotteryHint(fbs: FbsAPI) { return fbs("参与名单可来自某辆车的参与者，或手选本百业成员；名单与权重在创建时定格。开奖按权重随机抽取，同一抽奖内不会重复中奖；抽奖、名单、权重与结果全部留痕可查。", "Hint text for the lottery section, used to explain participant sources, frozen entries and weights, weighted drawing and result publication."); }
  static lotteryEmpty(fbs: FbsAPI) { return fbs("还没有抽奖，先创建一个。", "Empty-state text for the lottery section, used when the guild has no lotteries yet."); }
  static lotteryNameLabel(fbs: FbsAPI) { return fbs("抽奖标题", "Field label for the lottery creation form, used for the lottery title input."); }
  static lotteryPrizeLabel(fbs: FbsAPI) { return fbs("奖品 / 奖池", "Field label for the lottery creation form, used for the prize description input."); }
  static lotterySourceLabel(fbs: FbsAPI) { return fbs("参与名单来源", "Field label for the lottery creation form, used for the participant source selector."); }
  static lotterySourceGrouping(fbs: FbsAPI) { return fbs("某辆车的参与者", "Option label for the lottery participant source selector, used for the choice that takes a squad's participants."); }
  static lotterySourceMembers(fbs: FbsAPI) { return fbs("手选百业成员", "Option label for the lottery participant source selector, used for the choice that hand-picks guild members."); }
  static lotteryGroupingLabel(fbs: FbsAPI) { return fbs("选择车队", "Field label for the lottery creation form, used for the source squad selector."); }
  static lotteryWinnerCountLabel(fbs: FbsAPI) { return fbs("中奖人数", "Field label for the lottery creation form, used for the winner count input."); }
  static lotteryUniformWeightLabel(fbs: FbsAPI) { return fbs("统一权重", "Checkbox label for the lottery creation form, used for the option that gives every participant equal weight."); }
  static lotteryWeightLabel(fbs: FbsAPI) { return fbs("权重", "Field label for lottery participant rows, used for the per-participant weight input."); }
  static lotteryEntriesLabel(fbs: FbsAPI) { return fbs("参与名单", "List label for lottery cards, used above the participant list."); }
  static lotteryWinnersLabel(fbs: FbsAPI) { return fbs("中奖名单", "List label for lottery cards, used above the winners list after drawing."); }
  static lotteryCreateButton(fbs: FbsAPI) { return fbs("创建抽奖", "Button label for the lottery creation form, used to create the lottery."); }
  static lotteryDrawButton(fbs: FbsAPI) { return fbs("开奖", "Button label for lottery cards, used to draw the winners."); }
  static lotteryStatusOpen(fbs: FbsAPI) { return fbs("待开奖", "Status label for lottery cards, used for a lottery awaiting its draw."); }
  static lotteryStatusDrawn(fbs: FbsAPI) { return fbs("已开奖", "Status label for lottery cards, used for a lottery that has been drawn."); }
  static lotteryEntryCount(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("count", pv(p, "count")), " 人参与"], "Count text for lottery cards, used to show the participant count, where {count} is the number of participants."); }
  static tabRecruit(fbs: FbsAPI) { return fbs("招新与导师", "Tab label for the guild admin page, used to switch to the recruiting and mentors tab."); }
  static tabOfficer(fbs: FbsAPI) { return fbs("军官工具", "Tab label for the guild admin page, used to switch to the officer tools tab."); }
  static tabGovernance(fbs: FbsAPI) { return fbs("治理", "Tab label for the guild admin page, used to switch to the governance tab with officer grants, the officer private board and the guild audit log."); }
}

export abstract class AnnouncementsFbtUtils {
  static title(fbs: FbsAPI) { return fbs("百业公告", "Title text for the announcements tab, used as the tab heading."); }
  static emptyText(fbs: FbsAPI) { return fbs("暂无公告", "Empty-state text for the announcements tab, used when the guild has no announcements."); }
  static urgentLabel(fbs: FbsAPI) { return fbs("紧急集合", "Kind label for announcements, used to mark an urgent call announcement."); }
  static standardLabel(fbs: FbsAPI) { return fbs("公告", "Kind label for announcements, used to mark a standard announcement."); }
  static unreadLabel(fbs: FbsAPI) { return fbs("未读", "Read-state label for announcement cards, used to mark an announcement the viewer has not read."); }
  static readLabel(fbs: FbsAPI) { return fbs("已读", "Read-state label for announcement cards, used to mark an announcement the viewer has read."); }
  static composeTitle(fbs: FbsAPI) { return fbs("发布公告", "Title text for the announcement composer, used as the form heading shown to guild admins."); }
  static kindLabel(fbs: FbsAPI) { return fbs("类型", "Field label for the announcement composer, used for the announcement kind selector."); }
  static kindStandardLabel(fbs: FbsAPI) { return fbs("普通公告", "Option label for the announcement kind selector, used for a standard announcement."); }
  static kindUrgentLabel(fbs: FbsAPI) { return fbs("紧急集合呼叫", "Option label for the announcement kind selector, used for an urgent call."); }
  static titleLabel(fbs: FbsAPI) { return fbs("标题", "Field label for the announcement composer, used for the title input."); }
  static titlePlaceholder(fbs: FbsAPI) { return fbs("公告标题", "Placeholder text for the announcement composer, used in the title input."); }
  static bodyLabel(fbs: FbsAPI) { return fbs("正文", "Field label for the announcement composer, used for the body textarea."); }
  static bodyPlaceholder(fbs: FbsAPI) { return fbs("公告正文", "Placeholder text for the announcement composer, used in the body textarea."); }
  static postLabel(fbs: FbsAPI) { return fbs("发布并推送", "Button label for the announcement composer, used to publish and push the announcement."); }
  static postingLabel(fbs: FbsAPI) { return fbs("发布中…", "Button label for the announcement composer, used while publishing is in progress."); }
  static postedText(fbs: FbsAPI) { return fbs("公告已发布", "Confirmation text for the announcement composer, used after an announcement is published."); }
  static deleteLabel(fbs: FbsAPI) { return fbs("删除", "Button label for announcement cards, used by admins to delete an announcement."); }
  static deleteConfirmTitle(fbs: FbsAPI) { return fbs("删除这条公告？", "Title text for the announcement deletion confirmation, used as the confirmation dialog heading."); }
  static deleteConfirmMessage(fbs: FbsAPI, p?: StringParams) { return fbs(["确定要删除公告「", fbs.param("title", pv(p, "title")), "」吗？已读记录会一并删除。"], "Confirmation message for deleting an announcement, used in the dialog to warn that read records are deleted with it, where {title} is the announcement title."); }
  static deletedText(fbs: FbsAPI) { return fbs("公告已删除", "Confirmation text for announcements, used after an announcement is deleted."); }
  static receiptsTitle(fbs: FbsAPI) { return fbs("阅读情况", "Title text for the announcement read receipts section, used above the read and unread member lists shown to admins."); }
  static readCountTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["已读 ", fbs.param("read", pv(p, "read")), " / ", fbs.param("total", pv(p, "total"))], "Count text for announcement receipts, used to show read members against the guild total, where {read} is the read count and {total} the member total."); }
  static readListLabel(fbs: FbsAPI) { return fbs("已读成员", "List label for announcement receipts, used above the members who have read the announcement."); }
  static unreadListLabel(fbs: FbsAPI) { return fbs("未读成员", "List label for announcement receipts, used above the members who have not read the announcement."); }
  static authorTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("name", pv(p, "name")), " 发布"], "Author line pattern for announcement cards, used to show who published the announcement, where {name} is the author's name."); }
  static pushNote(fbs: FbsAPI) { return fbs("发布后会向全体成员推送通知；没有开启推送的成员也能在这里看到。", "Note text for the announcement composer, used to explain that publishing pushes a notification to all members and the announcement stays visible here for members without push enabled."); }
  static urgentNote(fbs: FbsAPI) { return fbs("紧急集合呼叫请只用于临时集合等紧急情况，每天最多 2 次。", "Note text for the announcement composer, used to warn that urgent calls are for emergencies only and capped at two per day."); }
  static dailyLimitTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["今日还可发布 ", fbs.param("remaining", pv(p, "remaining")), " 条"], "Quota text for the announcement composer, used to show how many announcements can still be published today, where {remaining} is the remaining daily count."); }
  static translatedSourceLabel(fbs: FbsAPI) { return fbs("译文", "Source label for announcement cards, used to mark that the displayed text is a translation of the original announcement."); }
  static originalSourceLabel(fbs: FbsAPI) { return fbs("原文", "Source label for announcement cards, used to mark that the displayed text is the original announcement text."); }
  static generateTranslationsLabel(fbs: FbsAPI) { return fbs("生成多语版", "Button label for announcement cards on the admin surface, used to generate the multilingual versions of an announcement."); }
  static generatingTranslationsLabel(fbs: FbsAPI) { return fbs("生成中…", "Button label for announcement cards on the admin surface, used while the multilingual versions are being generated."); }
  static translationsGeneratedText(fbs: FbsAPI) { return fbs("多语版已生成", "Confirmation text for the admin announcement surface, used after an announcement's multilingual versions finish generating."); }
  static translationsPartialText(fbs: FbsAPI) { return fbs("多语版部分生成失败，可重试", "Notice text for the admin announcement surface, used when some locales of an announcement's multilingual versions failed to generate."); }
  static translationUnavailableText(fbs: FbsAPI) { return fbs("多语翻译尚未配置，配置完成后可生成多语版公告。", "Note text for the admin announcement surface, used when the guild's tier includes multilingual announcements but the translation provider is not configured yet."); }
  static translationStatusNone(fbs: FbsAPI) { return fbs("多语版：未生成", "Status text for announcement cards on the admin surface, used when no multilingual version of the announcement has been generated."); }
  static translationStatusDoneTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["多语版：已生成 ", fbs.param("done", pv(p, "done")), " / ", fbs.param("total", pv(p, "total"))], "Status text for announcement cards on the admin surface, used to show how many locales of the multilingual version are generated, where {done} is the generated locale count and {total} the target locale count."); }
  static translationStatusFailed(fbs: FbsAPI) { return fbs("多语版：生成失败", "Status text for announcement cards on the admin surface, used when generating the multilingual version of the announcement failed."); }
  static translationLocaleDoneLabel(fbs: FbsAPI) { return fbs("已生成", "Status label for one locale of an announcement's multilingual version, used in the per-locale translation list on the admin surface."); }
  static translationLocaleFailedLabel(fbs: FbsAPI) { return fbs("生成失败", "Status label for one locale of an announcement's multilingual version, used in the per-locale translation list on the admin surface."); }
  static translationLocalePendingLabel(fbs: FbsAPI) { return fbs("未生成", "Status label for one locale of an announcement's multilingual version, used in the per-locale translation list on the admin surface."); }
}

export abstract class RecruitFbtUtils {
  static title(fbs: FbsAPI) { return fbs("招新与新人", "Title text for the recruitment and newcomers section, used as the heading of the recruit area on the platform home page."); }
  static directoryTitle(fbs: FbsAPI) { return fbs("招新", "Title text for the recruiting section on the platform home page, used as the heading above the directory of guilds whose recruitment is open for applications."); }
  static newcomerTitle(fbs: FbsAPI) { return fbs("新人", "Title text for the newcomers section on the platform home page, used as the heading above a member's onboarding checklist and mentor pairings."); }
  static homeBody(fbs: FbsAPI) { return fbs("想加入一个百业？在下面挑一个开放招新的百业提交入业申请，百业管理员会在管理面审核。已经在业的新人可以在这里看自己的入业清单与导师配对。", "Intro text for the recruiting section on the platform home page, used to explain that visitors pick an open guild below and apply for admin review, and that newcomers see their onboarding checklist and mentor pairing here."); }
  static homeLoginHint(fbs: FbsAPI) { return fbs("登录后即可对心仪的百业提交入业申请，并在这里查看审核进度。", "Hint text for the recruiting section on the platform home page, used for signed-out visitors to explain that after signing in they can apply to a guild and track the review progress here."); }
  static applySectionTitle(fbs: FbsAPI) { return fbs("入业申请", "Section heading for the join application form in the home recruiting section, used above the guild directory entries' application controls."); }
  static messageLabel(fbs: FbsAPI) { return fbs("申请附言", "Field label for the join application form, used for the optional application message input."); }
  static messagePlaceholder(fbs: FbsAPI) { return fbs("一句自我介绍（可选）：常玩的流派、在线时间……", "Placeholder text for the join application form, used in the message input to prompt a short self-introduction."); }
  static submitButton(fbs: FbsAPI) { return fbs("提交申请", "Button label for the join application form, used to submit an application to the guild."); }
  static submittingButton(fbs: FbsAPI) { return fbs("提交中…", "Button label for the join application form, used while the application is being submitted."); }
  static myApplicationTitle(fbs: FbsAPI) { return fbs("我的申请", "Title text for the my-application block in the home recruiting section, used above the viewer's own application status."); }
  static statusPending(fbs: FbsAPI) { return fbs("待审核", "Status label for join applications, used for an application awaiting review."); }
  static statusApproved(fbs: FbsAPI) { return fbs("已通过", "Status label for join applications, used for an approved application."); }
  static statusRejected(fbs: FbsAPI) { return fbs("未通过", "Status label for join applications, used for a rejected application."); }
  static pendingHint(fbs: FbsAPI) { return fbs("管理员审核中，请耐心等待；审核结果会直接更新在这里。", "Hint text for the my-application block, used while an application awaits review to explain the result appears here."); }
  static approvedNextStep(fbs: FbsAPI) { return fbs("申请已通过，你已登记进百业名册。最后一步在 Discord 完成：加入本百业绑定的 Discord 服务器——成员资格由 Discord 服务器成员身份决定，平台没有 Discord 机器人权限，无法替你加入服务器或授予身份组；加入后用同一账号登录即可使用百业全部功能。", "Next-step text for approved applicants in the my-application block, used to explain they are on the roster and must join the guild's bound Discord server to finish."); }
  static rejectedHint(fbs: FbsAPI) { return fbs("本次申请未通过。可以修改附言后重新提交一份新申请。", "Hint text for the my-application block, used after a rejection to explain a new application can be submitted with a revised message."); }
  static checklistTitle(fbs: FbsAPI) { return fbs("新手入业清单", "Title text for the newcomer onboarding checklist in the home recruiting section, used as the checklist heading for guild members."); }
  static checklistProgress(fbs: FbsAPI, p?: StringParams) { return fbs(["已完成 ", fbs.param("done", pv(p, "done")), " / ", fbs.param("total", pv(p, "total"))], "Progress text for the onboarding checklist, used to show completed items against the total, where {done} is the completed count and {total} the item total."); }
  static itemProfileLabel(fbs: FbsAPI) { return fbs("完善流派 / 时区", "Item label for the onboarding checklist, used for the profile completion item about sect and timezone."); }
  static itemProfileHint(fbs: FbsAPI) { return fbs("在任意车队报名落座时填上你的流派即算完成；时区由你的客户端自动同步，无需手动填写。", "Hint text for the onboarding checklist, used for the profile item to explain it completes on the first signup with a sect and the timezone syncs automatically."); }
  static itemMentorLabel(fbs: FbsAPI) { return fbs("认一位导师", "Item label for the onboarding checklist, used for the mentor pairing item."); }
  static itemMentorHint(fbs: FbsAPI) { return fbs("由百业管理员为你配对一位导师后自动完成。", "Hint text for the onboarding checklist, used for the mentor item to explain it completes once a guild admin pairs the newcomer with a mentor."); }
  static itemFirstRunLabel(fbs: FbsAPI) { return fbs("打完第一场", "Item label for the onboarding checklist, used for the first completed run item."); }
  static itemFirstRunHint(fbs: FbsAPI) { return fbs("在一辆已完成的车队里落座后自动完成。", "Hint text for the onboarding checklist, used for the first-run item to explain it completes after sitting in a completed squad."); }
  static myPairingsTitle(fbs: FbsAPI) { return fbs("我的导师配对", "Title text for the my-pairings block in the home recruiting section, used above the viewer's mentor pairings."); }
  static itemAvailabilityLabel(fbs: FbsAPI) { return fbs("填写可用时间", "Item label for the onboarding checklist, used for the availability entry item."); }
  static itemAvailabilityHint(fbs: FbsAPI) { return fbs("在个人设置里填写你每周固定有空的时段，方便管理员与车头定档期；可以先跳过，之后随时补填。", "Hint text for the onboarding checklist, used for the availability item to explain it is filled in profile settings, can be skipped now and completed later."); }
  static pairingStatusActive(fbs: FbsAPI) { return fbs("进行中", "Status label for mentor pairings, used for a pairing in progress."); }
  static pairingStatusEnded(fbs: FbsAPI) { return fbs("已结束", "Status label for mentor pairings, used for an ended pairing."); }
  static mentorRoleLabel(fbs: FbsAPI) { return fbs("导师", "Role label for mentor pairings, used next to the mentor's name."); }
  static menteeRoleLabel(fbs: FbsAPI) { return fbs("新人", "Role label for mentor pairings, used next to the newcomer's name."); }
  static adminApplicationsTitle(fbs: FbsAPI) { return fbs("入业申请审核", "Title text for the application review section in the guild admin recruit tab, used as the section heading."); }
  static adminApplicationsEmpty(fbs: FbsAPI) { return fbs("暂无申请记录。", "Empty-state text for the application review section, used when the guild has no applications."); }
  static adminApproveButton(fbs: FbsAPI) { return fbs("通过", "Button label for application review rows, used to approve an application."); }
  static adminRejectButton(fbs: FbsAPI) { return fbs("拒绝", "Button label for application review rows, used to reject an application."); }
  static adminMentorPoolTitle(fbs: FbsAPI) { return fbs("导师人选", "Title text for the mentor pool section in the guild admin recruit tab, used as the section heading."); }
  static adminSetMentorButton(fbs: FbsAPI) { return fbs("设为导师", "Button label for mentor pool rows, used to designate a roster member as a mentor."); }
  static adminUnsetMentorButton(fbs: FbsAPI) { return fbs("取消导师", "Button label for mentor pool rows, used to remove a member's mentor designation."); }
  static adminPairingsTitle(fbs: FbsAPI) { return fbs("导师配对", "Title text for the mentor pairings section in the guild admin recruit tab, used as the section heading."); }
  static adminPairingsEmpty(fbs: FbsAPI) { return fbs("暂无配对记录。", "Empty-state text for the mentor pairings section, used when the guild has no pairings."); }
  static adminPairingCreateButton(fbs: FbsAPI) { return fbs("建立配对", "Button label for the pairing creation form, used to create a mentor pairing."); }
  static adminPairingEndButton(fbs: FbsAPI) { return fbs("结束配对", "Button label for pairing rows, used to end a pairing."); }
  static adminMentorSelectLabel(fbs: FbsAPI) { return fbs("选择导师", "Field label for the pairing creation form, used for the mentor selector."); }
  static adminMenteeSelectLabel(fbs: FbsAPI) { return fbs("选择新人", "Field label for the pairing creation form, used for the newcomer selector."); }
  static adminNewcomersTitle(fbs: FbsAPI) { return fbs("新人清单进度", "Title text for the newcomer progress section in the guild admin recruit tab, used as the section heading."); }
  static adminNewcomersEmpty(fbs: FbsAPI) { return fbs("暂无未完成清单的新人。", "Empty-state text for the newcomer progress section, used when no newcomers have unfinished checklists."); }
  static adminRecruitOpenLabel(fbs: FbsAPI) { return fbs("开放招新", "Label text for the recruitment switch in the guild admin recruit tab, used for opening or closing the guild's listing in the platform home recruitment directory."); }
  static adminRecruitOpenHint(fbs: FbsAPI) { return fbs("开启后，本百业会出现在平台主页的招新目录里，登录用户可以提交入业申请；关闭后目录不再展示本百业，也不能提交新申请（已提交的申请仍可审核，成员的入业清单与导师配对不受影响）。", "Hint text for the recruitment switch in the guild admin recruit tab, used for explaining that an open guild appears in the platform home recruitment directory and accepts join applications, and that closing it hides the guild and stops new applications while submitted applications, member checklists and mentor pairings stay unaffected."); }
}

export abstract class OfficerFbtUtils {
  static notesTitle(fbs: FbsAPI) { return fbs("成员备注", "Title text for the member notes section in the guild admin officer tab, used as the section heading."); }
  static notesHint(fbs: FbsAPI) { return fbs("备注仅百业管理员可见，成员本人看不到关于自己的备注。", "Hint text for the member notes section, used to state that notes are visible only to guild admins and never to the member they describe."); }
  static notesEmpty(fbs: FbsAPI) { return fbs("本百业暂无成员名册。", "Empty-state text for the member notes section, used when the guild roster is empty."); }
  static memberNoNotes(fbs: FbsAPI) { return fbs("暂无备注", "Status text for member note rows, used when a member has no notes yet."); }
  static notePlaceholder(fbs: FbsAPI) { return fbs("写一条备注…", "Placeholder text for the member notes editor, used in the note body input."); }
  static noteAddButton(fbs: FbsAPI) { return fbs("添加备注", "Button label for the member notes editor, used to add a note to the member."); }
  static noteEditButton(fbs: FbsAPI) { return fbs("编辑", "Button label for note rows, used to edit a note."); }
  static noteSaveButton(fbs: FbsAPI) { return fbs("保存", "Button label for the member notes editor, used to save the note being edited."); }
  static noteDeleteButton(fbs: FbsAPI) { return fbs("删除", "Button label for note rows, used to delete a note."); }
  static noteAuthorTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("name", pv(p, "name")), " 添加"], "Author line pattern for member notes, used to show who added the note, where {name} is the note author's name."); }
  static exportTitle(fbs: FbsAPI) { return fbs("百业数据包", "Title text for the guild data package section in the officer tab, used as the section heading."); }
  static exportHint(fbs: FbsAPI) { return fbs("导出本百业的名册、组队历史与参与记录、成员赛季目标（JSON 文件）。导出动作会留痕记录。", "Hint text for the guild data export, used to explain the JSON package contents and that the export action itself is audit-logged."); }
  static exportButton(fbs: FbsAPI) { return fbs("导出数据包", "Button label for the guild data export section, used to download the data package."); }
  static exportAbout(fbs: FbsAPI) { return fbs("百业数据包导出：包含本百业名册、组队历史与参与记录、成员赛季目标。军官备注为内部工作记录，不包含在本数据包内。", "Readme text for the exported guild data package, used inside the JSON file to explain its contents and why officer notes are excluded."); }
  static goalsTitle(fbs: FbsAPI) { return fbs("成员赛季目标", "Title text for the member season goals section in the officer tab, used as the section heading."); }
  static goalsHint(fbs: FbsAPI) { return fbs("成员给自己设的赛季目标与进度，只读总览。", "Hint text for the member season goals section, used to explain the overview is read-only and covers member-set goals and their progress."); }
  static goalsEmpty(fbs: FbsAPI) { return fbs("暂无成员设置赛季目标。", "Empty-state text for the member season goals section, used when no member has set a season goal."); }
  static statusActive(fbs: FbsAPI) { return fbs("进行中", "Status label for season goals, used for a goal in progress."); }
  static statusDone(fbs: FbsAPI) { return fbs("已完成", "Status label for season goals, used for a completed goal."); }
  static statusDropped(fbs: FbsAPI) { return fbs("已放弃", "Status label for season goals, used for an abandoned goal."); }
  static myEntryLabel(fbs: FbsAPI) { return fbs("赛季目标", "Entry label for season goals in profile settings, used on the control that opens the season goals page."); }
  static myTitle(fbs: FbsAPI) { return fbs("我的赛季目标", "Title text for the my season goals page in profile settings, used as the page heading."); }
  static myHint(fbs: FbsAPI) { return fbs("在某个百业里给自己定一个本赛季目标，进度由你自己维护；该百业的管理员可以查看总览。", "Hint text for the my season goals page, used to explain that goals are set per guild and maintained by the member, with an admin overview on the guild side."); }
  static myEmpty(fbs: FbsAPI) { return fbs("你还没有设置赛季目标。", "Empty-state text for the my season goals page, used when the user has no season goals yet."); }
  static goalGuildLabel(fbs: FbsAPI) { return fbs("所属百业", "Field label for the season goal form, used for the guild selector."); }
  static goalTitleLabel(fbs: FbsAPI) { return fbs("目标", "Field label for the season goal form, used for the goal title input."); }
  static goalTitlePlaceholder(fbs: FbsAPI) { return fbs("例如：打通某个副本、集齐一套装备…", "Placeholder text for the season goal form, used in the title input with example goals."); }
  static goalNoteLabel(fbs: FbsAPI) { return fbs("进度备注", "Field label for the season goal form, used for the progress note input."); }
  static goalNotePlaceholder(fbs: FbsAPI) { return fbs("记录当前进度…", "Placeholder text for the season goal form, used in the progress note input."); }
  static goalDungeonLabel(fbs: FbsAPI) { return fbs("关联副本（可选）", "Field label for the season goal form, used for the optional linked dungeon selector."); }
  static goalDungeonNone(fbs: FbsAPI) { return fbs("不关联副本", "Option label for the season goal dungeon selector, used for the choice with no linked dungeon."); }
  static goalStatusLabel(fbs: FbsAPI) { return fbs("状态", "Field label for the season goal form, used for the status selector."); }
  static goalAddButton(fbs: FbsAPI) { return fbs("添加目标", "Button label for the season goal form, used to add a new goal."); }
  static goalSaveButton(fbs: FbsAPI) { return fbs("保存", "Button label for the season goal form, used to save edits to a goal."); }
  static goalEditButton(fbs: FbsAPI) { return fbs("编辑", "Button label for season goal rows, used to edit a goal."); }
  static goalDeleteButton(fbs: FbsAPI) { return fbs("删除", "Button label for season goal rows, used to delete a goal."); }
}


export abstract class OpsFbtUtils {
  static tabOps(fbs: FbsAPI) { return fbs("运营引擎", "Tab label for the guild admin page, used to switch to the premium operations engine tab."); }
  static title(fbs: FbsAPI) { return fbs("运营引擎", "Title text for the operations engine tab, used as the tab heading."); }
  static hint(fbs: FbsAPI) { return fbs("定向催报、流失预警、赛季滚动与贡献积分都在这里——都是给军官省时间的引擎，判定与数字全部由平台算好下发。", "Hint text for the operations engine tab, used under the heading to explain what the four engines do."); }
  static nudgeTitle(fbs: FbsAPI) { return fbs("定向催报", "Title text for the targeted nudge section, used as the section heading for nudging members who have not signed up yet."); }
  static nudgeHint(fbs: FbsAPI) { return fbs("只催还没报名的人：按分段圈定目标，先预览人数与名单，确认后才发送（走百业 Discord 频道与 App 推送）。每天最多 3 次，同一辆车 24 小时内只催一次。", "Hint text for the targeted nudge section, used to explain the segmentation, the preview-then-send flow and the frequency caps."); }
  static nudgeEventLabel(fbs: FbsAPI) { return fbs("目标车队", "Field label for the targeted nudge section, used for the grouping picker."); }
  static nudgeSegmentLabel(fbs: FbsAPI) { return fbs("圈人分段", "Field label for the targeted nudge section, used for the segment picker."); }
  static segmentAll(fbs: FbsAPI) { return fbs("全部未报名成员", "Option label for the targeted nudge segment picker, used for the segment that targets every unsigned member."); }
  static segmentSchool(fbs: FbsAPI) { return fbs("按流派（填流派名）", "Option label for the targeted nudge segment picker, used for the segment that targets unsigned members by their known school."); }
  static segmentRole(fbs: FbsAPI) { return fbs("按职责（填职责名）", "Option label for the targeted nudge segment picker, used for the segment that targets unsigned members by their known role to fill a role gap."); }
  static segmentLapsed(fbs: FbsAPI) { return fbs("久未出勤（14 天以上）", "Option label for the targeted nudge segment picker, used for the segment that targets members whose last participation was at least 14 days ago."); }
  static nudgeSegmentValueLabel(fbs: FbsAPI) { return fbs("分段值", "Field label for the targeted nudge section, used for the free-text segment value such as a school or role name."); }
  static nudgePreviewButton(fbs: FbsAPI) { return fbs("预览圈人", "Button label for the targeted nudge section, used to compute the candidate preview without sending anything."); }
  static nudgeSendButton(fbs: FbsAPI) { return fbs("确认发送催报", "Button label for the targeted nudge section, used to confirm and send the previewed nudge."); }
  static nudgeCandidateCount(fbs: FbsAPI, p?: StringParams) { return fbs(["将催报 ", fbs.param("count", pv(p, "count")), " 人"], "Status text for the targeted nudge preview, used to state how many members will be nudged, where {count} is the candidate count."); }
  static nudgeEmpty(fbs: FbsAPI) { return fbs("没有符合条件的未报名成员。", "Empty-state text for the targeted nudge preview, used when the chosen segment matches nobody."); }
  static nudgeDailyRemaining(fbs: FbsAPI, p?: StringParams) { return fbs(["今日还可发送 ", fbs.param("remaining", pv(p, "remaining")), " 次"], "Quota text for the targeted nudge section, used to show how many nudges can still be sent today, where {remaining} is the remaining daily count."); }
  static nudgeMessage(fbs: FbsAPI, p?: StringParams) { return fbs(["「", fbs.param("title", pv(p, "title")), "」还差人，快来报名啦！"], "Message body for a targeted nudge, used as the webhook and push text sent to unsigned members, where {title} is the grouping title."); }
  static lastNever(fbs: FbsAPI) { return fbs("从未出勤", "Evidence text for member lists, used when a member has no recorded participation yet."); }
  static lastAt(fbs: FbsAPI, p?: StringParams) { return fbs(["上次出勤 ", fbs.param("date", pv(p, "date"))], "Evidence text for member lists, used to show when a member last participated, where {date} is the formatted date."); }
  static churnTitle(fbs: FbsAPI) { return fbs("流失预警", "Title text for the churn warning section, used as the section heading for the officer watchlist of members whose participation is dropping."); }
  static churnHint(fbs: FbsAPI) { return fbs("参与下滑的成员会出现在这里（基线 = 此前 4 周，近期 = 最近 4 周；近期参与降到基线一半以下，或连续缺席最近 3 场已完成车队，即入名单）。名单只给军官看，不会自动联系任何人。", "Hint text for the churn warning section, used to explain the detection rule and that outreach stays manual."); }
  static churnEmpty(fbs: FbsAPI) { return fbs("暂无流失风险成员。", "Empty-state text for the churn warning section, used when no member matches the drop rule."); }
  static churnEvidence(fbs: FbsAPI, p?: StringParams) { return fbs(["基线 ", fbs.param("baseline", pv(p, "baseline")), " 次 · 近期 ", fbs.param("recent", pv(p, "recent")), " 次 · 连缺 ", fbs.param("streak", pv(p, "streak")), " 场"], "Evidence text for one churn warning row, used to show the baseline count, the recent count and the consecutive-miss streak, where {baseline}, {recent} and {streak} are the member's numbers."); }
  static rolloverTitle(fbs: FbsAPI) { return fbs("赛季滚动", "Title text for the season rollover section, used as the section heading for the one-click season migration engine."); }
  static rolloverHint(fbs: FbsAPI) { return fbs("把组队模板批量迁移为新赛季副本。先看预览，确认后才执行；执行结果会留痕。", "Hint text for the season rollover section, used to explain the preview-then-execute flow."); }
  static rolloverSeason(fbs: FbsAPI, p?: StringParams) { return fbs(["目标赛季：", fbs.param("season", pv(p, "season"))], "Status text for the season rollover section, used to name the season templates will be copied into, where {season} is the season label."); }
  static rolloverPreview(fbs: FbsAPI, p?: StringParams) { return fbs(["将迁移 ", fbs.param("count", pv(p, "count")), " 个模板（共 ", fbs.param("total", pv(p, "total")), " 个，已有新赛季副本 ", fbs.param("copied", pv(p, "copied")), " 个）"], "Preview text for the season rollover section, used to state how many templates will be copied, where {count} is the pending count, {total} the library size and {copied} the count already copied."); }
  static rolloverExecuteButton(fbs: FbsAPI) { return fbs("执行赛季滚动", "Button label for the season rollover section, used to confirm and run the previewed migration."); }
  static rolloverDone(fbs: FbsAPI, p?: StringParams) { return fbs(["已迁移 ", fbs.param("count", pv(p, "count")), " 个模板到新赛季"], "Success text for the season rollover section, used after an execution copied templates, where {count} is the number copied."); }
  static rolloverGearNote(fbs: FbsAPI) { return fbs("旧赛季装备打季标：装备暂无赛季概念，本步跳过。", "Note text for the season rollover report, used to state honestly that gear season tagging was skipped because gear carries no season concept."); }
  static rolloverThresholdNote(fbs: FbsAPI) { return fbs("达标线按新赛季重算：装备达标盘尚未上线，本步跳过，待其上线后接入。", "Note text for the season rollover report, used to state honestly that threshold recalculation was skipped until the gear readiness board ships."); }
  static rolloverLast(fbs: FbsAPI, p?: StringParams) { return fbs(["上次滚动：", fbs.param("date", pv(p, "date")), " · 迁移 ", fbs.param("count", pv(p, "count")), " 个模板"], "Status text for the season rollover section, used to show the last execution's date and copied count, where {date} is the formatted date and {count} the copied count."); }
  static pointsTitle(fbs: FbsAPI) { return fbs("贡献积分", "Title text for the contribution points section, used as the section heading for point rules and the member points board."); }
  static pointsHint(fbs: FbsAPI) { return fbs("积分只认平台里的真实动作：出席已完成的车队、带队完成车队、成为导师。积分从功能启用后累计，不补历史；成员能看自己的余额与流水，规则与总览只有军官能改能看。", "Hint text for the contribution points section, used to explain which actions earn points, that there is no historical backfill, and the member-versus-officer visibility split."); }
  static ruleAttendance(fbs: FbsAPI) { return fbs("出席", "Label text for the attendance point rule, used for the action of attending a completed grouping."); }
  static ruleLeading(fbs: FbsAPI) { return fbs("带队", "Label text for the leading point rule, used for the action of leading a completed grouping."); }
  static ruleMentoring(fbs: FbsAPI) { return fbs("导师", "Label text for the mentoring point rule, used for the action of becoming a mentor on a pairing."); }
  static pointsValue(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("points", pv(p, "points")), " 分"], "Value text for contribution points, used to render a point amount, where {points} is the number of points."); }
  static pointsBoardEmpty(fbs: FbsAPI) { return fbs("暂无积分记录（从启用后的第一场已完成车队开始累计）。", "Empty-state text for the contribution points board, used when no points have accrued yet."); }
  static pointsTotalLabel(fbs: FbsAPI) { return fbs("总分", "Column label for the contribution points board, used above each member's total points."); }
  static pointsEntriesLabel(fbs: FbsAPI) { return fbs("笔数", "Column label for the contribution points board, used above each member's ledger entry count."); }
  static saveButton(fbs: FbsAPI) { return fbs("保存", "Button label for the contribution points rules, used to save one action's point value."); }
  static myPointsTitle(fbs: FbsAPI) { return fbs("我的贡献积分", "Title text for the member's own contribution points view, used as the heading above their balance and ledger."); }
  static myPointsTotal(fbs: FbsAPI, p?: StringParams) { return fbs(["累计 ", fbs.param("points", pv(p, "points")), " 分"], "Balance text for the member's own contribution points view, used to show their total, where {points} is the total point count."); }
}

export abstract class MarketFbtUtils {
  static title(fbs: FbsAPI) { return fbs("补位市场", "Title text for the fill-in market page, used as the heading of the cross-guild substitute market."); }
  static body(fbs: FbsAPI) { return fbs("缺人时来这里找补位：任何成员都可以免费发布自己的补位供给；百业盟主档的车头与管理员可以针对车队缺口发布需求、邀请补位。市场只负责撮合，是否落座由车头在车队里手动确认。", "Intro text for the fill-in market page, used to explain the supply side is free for every member, the demand side belongs to top-tier guild leaders and admins, and seating always stays a manual step by the squad leader."); }
  static lockedTitle(fbs: FbsAPI) { return fbs("无法打开补位市场", "Title text for the fill-in market locked page, used when the viewer is signed out or not a member of the guild."); }
  static lockedBody(fbs: FbsAPI) { return fbs("登录并成为本百业成员后，可以发布补位供给、处理收到的邀请。", "Body text for the fill-in market locked page, used to explain that signing in as a guild member unlocks publishing supply and handling invitations."); }
  static supplyTitle(fbs: FbsAPI) { return fbs("我的补位供给", "Section heading for the my-supply area of the fill-in market page, used above the viewer's own fill-in offer."); }
  static supplyHint(fbs: FbsAPI) { return fbs("发布供给免费、与百业档位无关。公开面只展示你的流派、可补位时段与所属百业名，不展示任何联系方式。", "Hint text for the my-supply area, used to explain publishing is free on every tier and only the school, windows and home guild name are shown publicly."); }
  static supplyEmpty(fbs: FbsAPI) { return fbs("你还没有发布补位供给。", "Empty-state text for the my-supply area, used when the viewer has no open fill-in offer."); }
  static schoolLabel(fbs: FbsAPI) { return fbs("流派", "Field label for the fill-in offer form, used for the school input."); }
  static windowsLabel(fbs: FbsAPI) { return fbs("可补位时段", "Field label for the fill-in offer form, used for the weekly availability windows input."); }
  static noteLabel(fbs: FbsAPI) { return fbs("自我说明", "Field label for the fill-in offer form, used for the short self-description input."); }
  static notePlaceholder(fbs: FbsAPI) { return fbs("一句说明：擅长的副本、装备情况……", "Placeholder text for the fill-in offer form, used in the self-description input."); }
  static publishButton(fbs: FbsAPI) { return fbs("发布供给", "Button label for the fill-in offer form, used to publish the viewer's fill-in offer."); }
  static withdrawButton(fbs: FbsAPI) { return fbs("撤下供给", "Button label for the my-supply area, used to withdraw the viewer's open fill-in offer."); }
  static offerStatusOpen(fbs: FbsAPI) { return fbs("已发布", "Status label for fill-in offers, used for an offer currently open on the market."); }
  static homeGuildPattern(fbs: FbsAPI, p?: StringParams) { return fbs(["所属百业：", fbs.param("name", pv(p, "name"))], "Home guild line pattern for fill-in offers, used to show which guild the supplier belongs to, where {name} is the guild name."); }
  static windowLine(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("day", pv(p, "day")), " ", fbs.param("start", pv(p, "start")), "–", fbs.param("end", pv(p, "end"))], "Availability window line pattern for fill-in offers, used to render one weekly window, where {day} is the weekday label and {start} / {end} are local clock times."); }
  static weekday0(fbs: FbsAPI) { return fbs("周日", "Weekday label for fill-in offer windows, used for Sunday."); }
  static weekday1(fbs: FbsAPI) { return fbs("周一", "Weekday label for fill-in offer windows, used for Monday."); }
  static weekday2(fbs: FbsAPI) { return fbs("周二", "Weekday label for fill-in offer windows, used for Tuesday."); }
  static weekday3(fbs: FbsAPI) { return fbs("周三", "Weekday label for fill-in offer windows, used for Wednesday."); }
  static weekday4(fbs: FbsAPI) { return fbs("周四", "Weekday label for fill-in offer windows, used for Thursday."); }
  static weekday5(fbs: FbsAPI) { return fbs("周五", "Weekday label for fill-in offer windows, used for Friday."); }
  static weekday6(fbs: FbsAPI) { return fbs("周六", "Weekday label for fill-in offer windows, used for Saturday."); }
  static inboxTitle(fbs: FbsAPI) { return fbs("收到的补位邀请", "Section heading for the invitation inbox on the fill-in market page, used above the invitations addressed to the viewer."); }
  static inboxEmpty(fbs: FbsAPI) { return fbs("暂无补位邀请。", "Empty-state text for the invitation inbox, used when the viewer has no fill-in invitations."); }
  static acceptButton(fbs: FbsAPI) { return fbs("接受邀请", "Button label for invitation rows, used to accept a fill-in invitation."); }
  static declineButton(fbs: FbsAPI) { return fbs("婉拒", "Button label for invitation rows, used to decline a fill-in invitation."); }
  static inviteStatusPending(fbs: FbsAPI) { return fbs("待确认", "Status label for fill-in invitations, used for an invitation awaiting the supplier's answer."); }
  static inviteStatusAccepted(fbs: FbsAPI) { return fbs("已接受", "Status label for fill-in invitations, used for an accepted invitation."); }
  static inviteStatusDeclined(fbs: FbsAPI) { return fbs("已婉拒", "Status label for fill-in invitations, used for a declined invitation."); }
  static inviteStatusExpired(fbs: FbsAPI) { return fbs("已失效", "Status label for fill-in invitations, used when the request matched someone else or closed."); }
  static inviteFromPattern(fbs: FbsAPI, p?: StringParams) { return fbs(["来自 ", fbs.param("guild", pv(p, "guild")), " · ", fbs.param("title", pv(p, "title"))], "Invitation source line pattern, used to show which guild and squad an invitation belongs to, where {guild} is the demanding guild's name and {title} the squad title."); }
  static demandTitle(fbs: FbsAPI) { return fbs("补位需求", "Section heading for the demand area of the fill-in market page, used above the guild's fill requests and the supplier browse list."); }
  static demandLockedTitle(fbs: FbsAPI) { return fbs("补位需求是盟主档功能", "Title text for the locked demand area, used when the guild is below the top premium tier."); }
  static demandLockedBody(fbs: FbsAPI) { return fbs("发布补位需求、浏览并邀请补位人选需要百业开通盟主档（T3）。发布补位供给与处理收到的邀请不受档位限制，所有成员免费可用。", "Body text for the locked demand area, used to explain posting requests and inviting suppliers needs the top tier while publishing supply and answering invitations stay free."); }
  static demandNoManageHint(fbs: FbsAPI) { return fbs("只有本百业的车头与管理员可以发布需求与发出邀请。", "Hint text for the demand area, used when the viewer is a guild member but leads no squad and is not an admin."); }
  static requestsTitle(fbs: FbsAPI) { return fbs("本百业的补位需求", "Subheading for the demand area, used above the guild's own fill requests."); }
  static requestsEmpty(fbs: FbsAPI) { return fbs("暂无补位需求。在车队详情里针对缺口发布，或在这里新建。", "Empty-state text for the demand area, used when the guild has no fill requests."); }
  static createRequestTitle(fbs: FbsAPI) { return fbs("发布补位需求", "Subheading for the request creation form in the demand area, used above the form."); }
  static groupingLabel(fbs: FbsAPI) { return fbs("缺人的车队", "Field label for the request creation form, used for the squad selector."); }
  static neededRoleLabel(fbs: FbsAPI) { return fbs("缺的职责", "Field label for the request creation form, used for the needed role selector."); }
  static neededSchoolLabel(fbs: FbsAPI) { return fbs("指定流派（可选）", "Field label for the request creation form, used for the optional school input."); }
  static requestNoteLabel(fbs: FbsAPI) { return fbs("需求说明", "Field label for the request creation form, used for the request note input."); }
  static createRequestButton(fbs: FbsAPI) { return fbs("发布需求", "Button label for the request creation form, used to post a fill request."); }
  static closeRequestButton(fbs: FbsAPI) { return fbs("关闭需求", "Button label for request rows, used to close a fill request."); }
  static requestStatusOpen(fbs: FbsAPI) { return fbs("招募中", "Status label for fill requests, used for a request still looking for a supplier."); }
  static requestStatusMatched(fbs: FbsAPI) { return fbs("已撮合", "Status label for fill requests, used when a supplier accepted an invitation."); }
  static requestStatusClosed(fbs: FbsAPI) { return fbs("已关闭", "Status label for fill requests, used for a closed request."); }
  static offersTitle(fbs: FbsAPI) { return fbs("可邀请的补位人选", "Subheading for the demand area, used above the browsable supplier list."); }
  static offersEmpty(fbs: FbsAPI) { return fbs("市场里暂无补位供给。", "Empty-state text for the supplier browse list, used when no offers are open."); }
  static inviteButton(fbs: FbsAPI) { return fbs("发出邀请", "Button label for supplier rows, used to invite that supplier to the selected request."); }
  static invitedLabel(fbs: FbsAPI) { return fbs("已邀请", "Status text for supplier rows, used when an invitation is already pending or accepted for the selected request."); }
  static seatButton(fbs: FbsAPI) { return fbs("落座到车队", "Button label for accepted invitation rows, used by the squad leader to manually seat the matched supplier into the squad."); }
  static seatedLabel(fbs: FbsAPI) { return fbs("已落座", "Status text for accepted invitation rows, used once the supplier sits in the squad."); }
  static roleHealer(fbs: FbsAPI) { return fbs("奶", "Role label for fill requests and offers, used for the healer role."); }
  static roleDps(fbs: FbsAPI) { return fbs("输出", "Role label for fill requests and offers, used for the damage role."); }
  static backLabel(fbs: FbsAPI) { return fbs("‹ 返回百业", "Back link for the fill-in market page, used at the top to return to the guild home page."); }
}

export abstract class AlliesFbtUtils {
  static title(fbs: FbsAPI) { return fbs("盟友百业", "Title text for the allied guilds page, used as the page heading."); }
  static body(fbs: FbsAPI) { return fbs("结盟后，双方车队可以互相开放：车头把车队标为盟友可见并设置访客名额，盟友成员就能在自己百业看到并报名访客位。解除结盟后，共享立即失效。", "Intro text for the allied guilds page, used to explain allied squads can be flagged visible with a visitor quota, allied members can claim visitor seats, and dissolving the alliance revokes sharing at once."); }
  static lockedTitle(fbs: FbsAPI) { return fbs("无法打开盟友百业", "Title text for the allied guilds locked page, used when the viewer is signed out or not a member of the guild."); }
  static lockedBody(fbs: FbsAPI) { return fbs("登录并成为本百业成员后，可以查看盟友与共享活动。", "Body text for the allied guilds locked page, used to explain signing in as a guild member unlocks allies and shared squads."); }
  static activeTitle(fbs: FbsAPI) { return fbs("已结盟百业", "Section heading for the allied guilds page, used above the list of active allies."); }
  static activeEmpty(fbs: FbsAPI) { return fbs("本百业暂无盟友。", "Empty-state text for the allied guilds page, used when the guild has no active allies."); }
  static statusPending(fbs: FbsAPI) { return fbs("待对方确认", "Status label for alliance relations, used for an invitation awaiting the other guild's admin."); }
  static statusActive(fbs: FbsAPI) { return fbs("已结盟", "Status label for alliance relations, used for an active alliance."); }
  static adminTitle(fbs: FbsAPI) { return fbs("结盟管理", "Section heading for the alliance admin area, used above the invitation and relation management controls, shown only to guild admins."); }
  static inviteLabel(fbs: FbsAPI) { return fbs("对方百业", "Field label for the alliance invitation form, used for the other guild selector."); }
  static inviteHint(fbs: FbsAPI) { return fbs("结盟邀请由对方百业管理员确认后生效；任一方管理员都可以单方解除结盟。", "Hint text for the alliance invitation form, used to explain the other guild's admin must accept and either side's admin may dissolve later."); }
  static inviteButton(fbs: FbsAPI) { return fbs("发出结盟邀请", "Button label for the alliance invitation form, used to send an alliance invitation."); }
  static incomingTitle(fbs: FbsAPI) { return fbs("待处理的结盟邀请", "Subheading for the alliance admin area, used above invitations from other guilds awaiting this guild's admin."); }
  static outgoingTitle(fbs: FbsAPI) { return fbs("已发出的结盟邀请", "Subheading for the alliance admin area, used above this guild's pending outgoing invitations."); }
  static acceptButton(fbs: FbsAPI) { return fbs("接受结盟", "Button label for incoming alliance invitations, used to accept and activate the alliance."); }
  static rejectButton(fbs: FbsAPI) { return fbs("拒绝", "Button label for incoming alliance invitations, used to decline the alliance."); }
  static endButton(fbs: FbsAPI) { return fbs("解除结盟", "Button label for active alliance rows, used to dissolve the alliance; sharing stops immediately."); }
  static sharedTitle(fbs: FbsAPI) { return fbs("盟友共享活动", "Section heading for the allied guilds page, used above the ally-visible squads of allied guilds."); }
  static sharedEmpty(fbs: FbsAPI) { return fbs("暂无盟友共享活动。", "Empty-state text for the shared squads section, used when no allied guild has an open ally-visible squad."); }
  static hostPattern(fbs: FbsAPI, p?: StringParams) { return fbs(["主办：", fbs.param("name", pv(p, "name"))], "Host line pattern for shared squads, used to show which allied guild hosts the squad, where {name} is the host guild name."); }
  static visitorLeftPattern(fbs: FbsAPI, p?: StringParams) { return fbs(["访客位 ", fbs.param("left", pv(p, "left")), " / ", fbs.param("total", pv(p, "total"))], "Visitor quota pattern for shared squads, used to show remaining visitor seats against the quota, where {left} is the remaining count and {total} the quota."); }
  static visitorJoinButton(fbs: FbsAPI) { return fbs("报名访客位", "Button label for shared squad rows, used to claim a visitor seat in the allied guild's squad."); }
  static visitorJoinedLabel(fbs: FbsAPI) { return fbs("已报名访客位", "Status text for shared squad rows, used once the viewer holds a seat in that squad."); }
  static sharingTitle(fbs: FbsAPI) { return fbs("盟友共享设置", "Section heading for the squad sharing controls, used in the squad detail area where the leader sets ally visibility and the visitor quota."); }
  static sharingHint(fbs: FbsAPI) { return fbs("开启后，盟友百业成员可以在他们的盟友页看到这辆车，并报名访客位（计入车队总名额）。访客名额为 0 时不开放报名。", "Hint text for the squad sharing controls, used to explain ally-visible squads appear on allies' pages, visitor seats count toward the squad's total capacity, and a zero quota opens no seats."); }
  static allyVisibleLabel(fbs: FbsAPI) { return fbs("对盟友可见", "Label text for the squad sharing switch, used to flag the squad visible to allied guilds."); }
  static visitorSlotsLabel(fbs: FbsAPI) { return fbs("访客名额", "Field label for the squad sharing controls, used for the visitor seat quota input."); }
  static sharingSaveButton(fbs: FbsAPI) { return fbs("保存共享设置", "Button label for the squad sharing controls, used to save ally visibility and the visitor quota."); }
  static backLabel(fbs: FbsAPI) { return fbs("‹ 返回百业", "Back link for the allied guilds page, used at the top to return to the guild home page."); }
}

export abstract class GovernanceFbtUtils {
  static sectionLockedTitle(fbs: FbsAPI) { return fbs("此面未在你的授权内", "Title text for the capability locked panel on admin sub-surfaces, used when a delegated officer opens a management surface their capability set does not cover."); }
  static sectionLockedBody(fbs: FbsAPI) { return fbs("这个管理面需要对应的军官能力，你的授权不包含它。请百业管理员在治理页调整你的授权。", "Body text for the capability locked panel, used to explain that the surface needs a matching officer capability and a guild admin can adjust the viewer's grant on the governance page."); }
  static lockedTitle(fbs: FbsAPI) { return fbs("治理功能未开通", "Title text for the governance locked panel in the guild admin page, used when the guild's tier is below the governance tier."); }
  static lockedBody(fbs: FbsAPI) { return fbs("细粒度权限、军官私密区与百业审计日志是最高档位（T3）的治理功能。本百业尚未达到该档位，治理数据不会下发。", "Body text for the governance locked panel, used to explain that officer delegation, the officer private board and the guild audit log belong to the top tier and no governance data is served below it."); }
  static title(fbs: FbsAPI) { return fbs("治理与审计", "Title text for the governance tab in the guild admin page, used as the tab heading."); }
  static hint(fbs: FbsAPI) { return fbs("百业管理员可以把部分管理面授权给军官成员分工处理；管理员本人始终全权。授权与全部管理动作都会记入本百业的审计日志。", "Hint text for the governance tab, used to explain that guild admins delegate parts of the admin surface to officers, admins keep full authority, and grants plus all management actions land in the guild audit log."); }
  static officersTitle(fbs: FbsAPI) { return fbs("军官授权", "Title text for the officer grants section in the governance tab, used as the section heading."); }
  static officersHint(fbs: FbsAPI) { return fbs("被授权的军官只能进入被授予的管理面与动作；授权本身与付费结账始终只有百业管理员可以操作。", "Hint text for the officer grants section, used to explain that a granted officer reaches only the surfaces and actions in their capability set, while granting and billing always stay with guild admins."); }
  static officersEmpty(fbs: FbsAPI) { return fbs("尚无被授权的军官。在下方选择名册成员并勾选能力即可授权。", "Empty-state text for the officer grants section, used when no member holds a grant yet and the grant form below is the way to create one."); }
  static grantMemberLabel(fbs: FbsAPI) { return fbs("选择成员", "Field label for the officer grant form, used for the roster member selector."); }
  static grantCapabilitiesLabel(fbs: FbsAPI) { return fbs("授予能力", "Field label for the officer grant form, used above the capability checkbox list."); }
  static grantButton(fbs: FbsAPI) { return fbs("保存授权", "Button label for the officer grant form, used to save the selected member's capability set; saving an empty set revokes the grant."); }
  static revokeButton(fbs: FbsAPI) { return fbs("撤销授权", "Button label for officer grant rows, used to remove that member's grant entirely."); }
  static grantedByTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("name", pv(p, "name")), " 授予"], "Grantor line pattern for officer grant rows, used to show who issued the grant, where {name} is the granting admin's display name."); }
  static adminBadge(fbs: FbsAPI) { return fbs("百业管理员 · 全权", "Badge text for the governance officers list, used next to Discord-server admins who hold every capability by the admin verdict itself."); }
  static boardTitle(fbs: FbsAPI) { return fbs("军官私密区", "Title text for the officer private board section in the governance tab, used as the section heading."); }
  static boardHint(fbs: FbsAPI) { return fbs("只有军官（百业管理员与被授权成员）能看到这里的内容：内部留言、排班注记都可以写在这里，普通成员完全看不到这一区。", "Hint text for the officer private board, used to explain that only officers — guild admins and granted members — can see the board, and regular members cannot see the area at all."); }
  static boardEmpty(fbs: FbsAPI) { return fbs("私密区暂无留言。", "Empty-state text for the officer private board, used when no officer has posted yet."); }
  static boardPlaceholder(fbs: FbsAPI) { return fbs("写一条内部留言或排班注记…", "Placeholder text for the officer private board composer, used in the post body input."); }
  static boardPostButton(fbs: FbsAPI) { return fbs("发布到私密区", "Button label for the officer private board composer, used to publish a post to the board."); }
  static boardDeleteButton(fbs: FbsAPI) { return fbs("删除", "Button label for officer board posts, used by the post's author or a guild admin to delete the post."); }
  static boardAuthorTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("name", pv(p, "name")), " 留言"], "Author line pattern for officer board posts, used to show who wrote the post, where {name} is the author's display name."); }
  static auditTitle(fbs: FbsAPI) { return fbs("百业审计日志", "Title text for the guild audit log section in the governance tab, used as the section heading."); }
  static auditHint(fbs: FbsAPI) { return fbs("本百业内的管理动作留痕：谁在何时对什么做了什么。日志只记动作与目标摘要，不含备注正文等敏感内容。", "Hint text for the guild audit log, used to explain that it traces who did what to which target inside this guild and stores only action and target summaries, never sensitive body text."); }
  static auditEmpty(fbs: FbsAPI) { return fbs("暂无审计记录。", "Empty-state text for the guild audit log, used when no management action has been recorded yet."); }
  static auditLoadMoreButton(fbs: FbsAPI) { return fbs("加载更多", "Button label for the guild audit log, used to load the next page of older audit events."); }
  static auditActorFallback(fbs: FbsAPI) { return fbs("系统", "Fallback actor name for guild audit events, used when an action was recorded without a user snapshot, such as a system-path operation."); }
  static capProfile(fbs: FbsAPI) { return fbs("资料设置", "Capability label for officer grants, used for the capability that covers the guild profile, avatar and branding settings surfaces."); }
  static capDiscord(fbs: FbsAPI) { return fbs("Discord 与提醒", "Capability label for officer grants, used for the capability that covers the Discord binding, reminder webhook and reminder settings surfaces."); }
  static capEvents(fbs: FbsAPI) { return fbs("车队管理", "Capability label for officer grants, used for the capability that covers admin event management and managing the guild's groupings."); }
  static capGuides(fbs: FbsAPI) { return fbs("攻略数据", "Capability label for officer grants, used for the capability that covers editing the school guide data."); }
  static capAnnounce(fbs: FbsAPI) { return fbs("公告发布", "Capability label for officer grants, used for the capability that covers posting and deleting guild announcements."); }
  static capStats(fbs: FbsAPI) { return fbs("数据查看", "Capability label for officer grants, used for the capability that covers viewing the guild activity statistics surface."); }
  static capTools(fbs: FbsAPI) { return fbs("活动工具", "Capability label for officer grants, used for the capability that covers the activity tools such as lotteries."); }
  static capSeason(fbs: FbsAPI) { return fbs("赛季管理", "Capability label for officer grants, used for the capability that covers the season checklist and the game-name roster import surfaces."); }
  static capRecruit(fbs: FbsAPI) { return fbs("招新审核", "Capability label for officer grants, used for the capability that covers join-application review, mentor designation and mentor pairings."); }
  static capOfficer(fbs: FbsAPI) { return fbs("成员备注", "Capability label for officer grants, used for the capability that covers officer member notes and the guild data package export."); }
  static actionProfileUpdate(fbs: FbsAPI) { return fbs("修改百业资料", "Audit action label for the guild audit log, used when a guild profile is updated."); }
  static actionAvatarSet(fbs: FbsAPI) { return fbs("设置百业头像", "Audit action label for the guild audit log, used when a guild avatar is uploaded."); }
  static actionAvatarDelete(fbs: FbsAPI) { return fbs("删除百业头像", "Audit action label for the guild audit log, used when a guild avatar is deleted."); }
  static actionDiscordUpdate(fbs: FbsAPI) { return fbs("修改 Discord 集成", "Audit action label for the guild audit log, used when the Discord binding or reminder webhook is updated."); }
  static actionReminderUpdate(fbs: FbsAPI) { return fbs("修改提醒设置", "Audit action label for the guild audit log, used when reminder offsets or the custom reminder text are updated."); }
  static actionWhitelabelUpdate(fbs: FbsAPI) { return fbs("修改白标设置", "Audit action label for the guild audit log, used when white-label branding settings are updated."); }
  static actionVisibilityUpdate(fbs: FbsAPI) { return fbs("修改可见性", "Audit action label for the guild audit log, used when the guild's dev-only visibility is toggled."); }
  static actionRecruitOpen(fbs: FbsAPI) { return fbs("切换招新开关", "Audit action label for the guild audit log, used when the guild's recruitment open switch is toggled."); }
  static actionEventCreate(fbs: FbsAPI) { return fbs("创建活动", "Audit action label for the guild audit log, used when an admin event is created."); }
  static actionEventUpdate(fbs: FbsAPI) { return fbs("修改活动", "Audit action label for the guild audit log, used when an admin event is edited."); }
  static actionEventDelete(fbs: FbsAPI) { return fbs("删除活动", "Audit action label for the guild audit log, used when an admin event is deleted."); }
  static actionSignupRemove(fbs: FbsAPI) { return fbs("移除报名", "Audit action label for the guild audit log, used when a signup is removed from an event."); }
  static actionResultAdd(fbs: FbsAPI) { return fbs("登记竞速成绩", "Audit action label for the guild audit log, used when a race result is added to an event."); }
  static actionResultDelete(fbs: FbsAPI) { return fbs("删除竞速成绩", "Audit action label for the guild audit log, used when a race result is deleted."); }
  static actionLotteryCreate(fbs: FbsAPI) { return fbs("创建抽奖", "Audit action label for the guild audit log, used when a lottery is created."); }
  static actionLotteryDraw(fbs: FbsAPI) { return fbs("抽奖开奖", "Audit action label for the guild audit log, used when a lottery is drawn."); }
  static actionGuideUpdate(fbs: FbsAPI) { return fbs("修改攻略数据", "Audit action label for the guild audit log, used when school guide data is edited."); }
  static actionAnnouncementPost(fbs: FbsAPI) { return fbs("发布公告", "Audit action label for the guild audit log, used when a guild announcement is posted."); }
  static actionAnnouncementDelete(fbs: FbsAPI) { return fbs("删除公告", "Audit action label for the guild audit log, used when a guild announcement is deleted."); }
  static actionApplicationApprove(fbs: FbsAPI) { return fbs("通过入业申请", "Audit action label for the guild audit log, used when a join application is approved."); }
  static actionApplicationReject(fbs: FbsAPI) { return fbs("拒绝入业申请", "Audit action label for the guild audit log, used when a join application is rejected."); }
  static actionMentorSet(fbs: FbsAPI) { return fbs("设为导师", "Audit action label for the guild audit log, used when a member is designated as a mentor."); }
  static actionMentorUnset(fbs: FbsAPI) { return fbs("取消导师", "Audit action label for the guild audit log, used when a member's mentor designation is removed."); }
  static actionPairingCreate(fbs: FbsAPI) { return fbs("建立导师配对", "Audit action label for the guild audit log, used when a mentor pairing is created."); }
  static actionPairingEnd(fbs: FbsAPI) { return fbs("结束导师配对", "Audit action label for the guild audit log, used when a mentor pairing is ended."); }
  static actionNoteAdd(fbs: FbsAPI) { return fbs("添加成员备注", "Audit action label for the guild audit log, used when an officer note is added about a member; the note body itself is never written to the log."); }
  static actionNoteUpdate(fbs: FbsAPI) { return fbs("修改成员备注", "Audit action label for the guild audit log, used when an officer note is edited; the note body itself is never written to the log."); }
  static actionNoteDelete(fbs: FbsAPI) { return fbs("删除成员备注", "Audit action label for the guild audit log, used when an officer note is deleted."); }
  static actionExportPackage(fbs: FbsAPI) { return fbs("导出百业数据包", "Audit action label for the guild audit log, used when the guild data package is exported."); }
  static actionSeasonChecklist(fbs: FbsAPI) { return fbs("勾选赛季清单", "Audit action label for the guild audit log, used when a season checklist item is checked or unchecked."); }
  static actionRosterImport(fbs: FbsAPI) { return fbs("导入名册", "Audit action label for the guild audit log, used when a roster import batch is confirmed into the game-name roster."); }
  static actionRosterEntryDelete(fbs: FbsAPI) { return fbs("删除名册记录", "Audit action label for the guild audit log, used when a game-name roster entry is deleted."); }
  static actionOfficerGrant(fbs: FbsAPI) { return fbs("授予军官能力", "Audit action label for the guild audit log, used when a guild admin grants a member officer capabilities."); }
  static actionOfficerRevoke(fbs: FbsAPI) { return fbs("撤销军官授权", "Audit action label for the guild audit log, used when a member's officer grant is revoked."); }
  static actionBoardPost(fbs: FbsAPI) { return fbs("私密区留言", "Audit action label for the guild audit log, used when an officer posts to the private board; the post body itself is never written to the log."); }
  static actionBoardDelete(fbs: FbsAPI) { return fbs("删除私密区留言", "Audit action label for the guild audit log, used when an officer board post is deleted."); }
}
