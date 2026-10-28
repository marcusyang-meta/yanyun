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

