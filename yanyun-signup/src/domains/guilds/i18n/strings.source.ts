/* fbtee declaration surface for the guilds domain (hand-maintained): this
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

export abstract class LockedFbtUtils {
  static backLink(fbs: FbsAPI) { return fbs("‹ 我的百业", "Back link at the top of the guild locked page, returning to the user's guild list."); }
  static title(fbs: FbsAPI) { return fbs("无权访问这个百业", "Heading of the locked page shown when the viewer may not access a guild."); }
  static body1(fbs: FbsAPI) { return fbs("该百业不存在，或仅对某个 Discord 服务器的成员开放。", "First explanation line on the guild locked page: the guild does not exist or is open only to members of a certain Discord server."); }
  static body2(fbs: FbsAPI) { return fbs("加入对应的 Discord 服务器后，用同一个账号登录即可访问。", "Second explanation line on the guild locked page: joining the corresponding Discord server and signing in with the same account grants access."); }
  static backButton(fbs: FbsAPI) { return fbs("回到我的百业", "Button label on the guild locked page that returns to the user's guild list."); }
}

export abstract class GuildHomeFbtUtils {
  static backToHub(fbs: FbsAPI) { return fbs("← 百业集结", "Back link at the top of the guild home page, returning to the guild hub."); }
  static backPlain(fbs: FbsAPI) { return fbs("← 返回", "Plain back link used on guild pages, returning to the previous page."); }
  static tabTeam(fbs: FbsAPI) { return fbs("组队", "Label of the team grouping tab on the guild home page."); }
  static tabDex(fbs: FbsAPI) { return fbs("攻略", "Label of the guides tab on the guild home page."); }
  static tabSect(fbs: FbsAPI) { return fbs("流派攻略", "Label of the sect strategy tab on the guild home page."); }
  static tabAnnouncements(fbs: FbsAPI) { return fbs("公告", "Label of the announcements tab on the guild home page."); }
  static readOnlyBanner(fbs: FbsAPI) { return fbs("该百业尚未绑定 Discord 服务器 · 只读浏览", "Banner on the guild home page when the guild has not bound a Discord server yet and is being browsed read-only."); }
  static adminLink(fbs: FbsAPI) { return fbs("管理", "Link label on the guild home page that opens the guild admin page; only composed for viewers who pass the admin check."); }
  static tabSchedule(fbs: FbsAPI) { return fbs("排期", "Label of the schedule tab on the guild home page, holding member availability and time polls."); }
}

export abstract class GuildAdminFbtUtils {
  static title(fbs: FbsAPI) { return fbs("管理百业", "Title of the guild admin page."); }
  static lockedTitle(fbs: FbsAPI) { return fbs("无权管理这个百业", "Title of the locked state of the guild admin page for non-admins."); }
  static lockedBody(fbs: FbsAPI) { return fbs("只有该百业所绑 Discord 服务器的管理员（服务器主或拥有管理权限）可以进入管理页。", "Explanation in the admin locked state: only admins of the bound Discord server (owner or manage permission holders) may enter the admin page."); }
  static backLink(fbs: FbsAPI) { return fbs("‹ 返回百业", "Back link at the top of the guild admin page, returning to the guild home page."); }
  static tabProfile(fbs: FbsAPI) { return fbs("资料", "Tab label of the guild profile section in guild admin."); }
  static tabDiscord(fbs: FbsAPI) { return fbs("Discord", "Tab label of the Discord integration section in guild admin."); }
  static tabEvents(fbs: FbsAPI) { return fbs("活动", "Tab label of the events management section in guild admin."); }
  static tabGuides(fbs: FbsAPI) { return fbs("攻略数据", "Tab label of the sect guides data section in guild admin."); }
  static saveButton(fbs: FbsAPI) { return fbs("保存", "Save button label used across the guild admin forms."); }
  static savedText(fbs: FbsAPI) { return fbs("已保存", "Transient confirmation shown in guild admin after a form is saved."); }
  static deleteButton(fbs: FbsAPI) { return fbs("删除", "Delete button label used across the guild admin lists."); }
  static editButton(fbs: FbsAPI) { return fbs("编辑", "Edit button label used across the guild admin lists."); }
  static addButton(fbs: FbsAPI) { return fbs("新增", "Add button label used across the guild admin forms."); }
  static profileTitle(fbs: FbsAPI) { return fbs("百业资料", "Title of the guild profile section in guild admin."); }
  static nameLabel(fbs: FbsAPI) { return fbs("百业名称", "Label of the guild name field in the admin profile form."); }
  static announcementLabel(fbs: FbsAPI) { return fbs("公告", "Label of the guild announcement field in the admin profile form."); }
  static sloganLabel(fbs: FbsAPI) { return fbs("标语", "Label of the guild slogan field in the admin profile form."); }
  static masterNameLabel(fbs: FbsAPI) { return fbs("掌门", "Label of the guild master name field in the admin profile form."); }
  static logoUrlLabel(fbs: FbsAPI) { return fbs("标志图链接", "Label of the guild logo image URL field in the admin profile form."); }
  static bgImageUrlLabel(fbs: FbsAPI) { return fbs("背景图链接", "Label of the guild background image URL field in the admin profile form."); }
  static avatarTitle(fbs: FbsAPI) { return fbs("百业头像", "Title of the guild avatar section in the admin profile form."); }
  static avatarUpload(fbs: FbsAPI) { return fbs("上传头像", "Button label that uploads a guild avatar when none is set."); }
  static avatarReplace(fbs: FbsAPI) { return fbs("更换头像", "Button label that replaces the existing guild avatar."); }
  static avatarDelete(fbs: FbsAPI) { return fbs("删除头像", "Button label that deletes the guild avatar."); }
  static avatarNone(fbs: FbsAPI) { return fbs("尚未设置头像，当前显示默认印章。", "Note in the avatar section when no avatar is set: the default seal is displayed instead."); }
  static avatarHint(fbs: FbsAPI) { return fbs("正方形图片效果最佳，大小 ≤ 400KB（PNG / JPEG / WebP）。", "Hint in the avatar section: square images work best, at most 400 KB, in PNG, JPEG or WebP format."); }
  static discordTitle(fbs: FbsAPI) { return fbs("Discord 集成", "Title of the Discord integration section in guild admin."); }
  static webhookLabel(fbs: FbsAPI) { return fbs("发车提醒 Webhook", "Label of the departure reminder webhook field in the Discord integration section."); }
  static webhookSet(fbs: FbsAPI, p?: StringParams) { return fbs(["已设置（Webhook 编号 ", fbs.param("id", pv(p, "id")), "）"], "Status text when a reminder webhook is set; {id} is the webhook's numeric id, as the full URL is never echoed back."); }
  static webhookUnset(fbs: FbsAPI) { return fbs("未设置", "Status text when no reminder webhook is set."); }
  static webhookHint(fbs: FbsAPI) { return fbs("保存后不回显完整地址；留空并保存 = 保持不变，点「清除」移除。", "Hint under the webhook field: the full address is not shown after saving, saving an empty value keeps the current one, and the clear button removes it."); }
  static webhookClear(fbs: FbsAPI) { return fbs("清除 Webhook", "Button label that removes the reminder webhook."); }
  static guildIdLabel(fbs: FbsAPI) { return fbs("绑定的服务器 ID", "Label of the read-only row showing the bound Discord server ID."); }
  static guildIdUnbound(fbs: FbsAPI) { return fbs("未绑定", "Value shown for the bound server ID when the guild has not bound a server."); }
  static reminderTitle(fbs: FbsAPI) { return fbs("发车提醒设置", "Title of the departure reminder settings section in guild admin."); }
  static reminderOffsetsLabel(fbs: FbsAPI) { return fbs("提醒提前量（可多选）", "Label of the multi-select for reminder lead times in the reminder settings."); }
  static reminderOffsetOption(fbs: FbsAPI, p?: StringParams) { return fbs(["提前 ", fbs.param("minutes", pv(p, "minutes")), " 分钟"], "One reminder lead time option; {minutes} is how many minutes before departure the reminder fires."); }
  static reminderCustomTextLabel(fbs: FbsAPI) { return fbs("自定义提醒文案", "Label of the custom reminder text field in the reminder settings."); }
  static reminderCustomTextHint(fbs: FbsAPI) { return fbs("一行文字，会出现在提醒卡片里；最多 100 字，留空不显示。第一次提前提醒会通知所有人，之后的只催还没就位的人。", "Hint for the custom reminder text: one line shown inside the reminder card, at most 100 characters; the first lead-time reminder notifies everyone, later ones only nudge members not yet ready."); }
  static visibilityTitle(fbs: FbsAPI) { return fbs("可见性", "Title of the visibility settings section in guild admin."); }
  static devOnlyLabel(fbs: FbsAPI) { return fbs("仅开发环境可见", "Label of the development-only visibility toggle in guild admin."); }
  static eventsTitle(fbs: FbsAPI) { return fbs("活动管理", "Title of the events management section in guild admin."); }
  static signupCsvSuffix(fbs: FbsAPI) { return fbs("报名表", "Suffix appended to the exported signup CSV file name in guild admin events."); }
  static eventEmpty(fbs: FbsAPI) { return fbs("暂无活动。", "Empty-state text in the admin events list when there are no events."); }
  static eventTitleLabel(fbs: FbsAPI) { return fbs("标题", "Label of the event title field in the admin event editor."); }
  static eventTypeLabel(fbs: FbsAPI) { return fbs("类型", "Label of the event type field in the admin event editor."); }
  static eventStatusLabel(fbs: FbsAPI) { return fbs("状态", "Label of the event status field in the admin event editor."); }
  static eventTimeLabel(fbs: FbsAPI) { return fbs("发车时间", "Label of the event departure time field in the admin event editor."); }
  static eventSlotsLabel(fbs: FbsAPI) { return fbs("席位上限", "Label of the event seat capacity field in the admin event editor."); }
  static eventMeetLabel(fbs: FbsAPI) { return fbs("集合信息", "Label of the event meeting info field in the admin event editor."); }
  static eventDescLabel(fbs: FbsAPI) { return fbs("说明", "Label of the event description field in the admin event editor."); }
  static eventDungeonLabel(fbs: FbsAPI) { return fbs("副本", "Label of the event dungeon field in the admin event editor."); }
  static statusOpen(fbs: FbsAPI) { return fbs("开放报名", "Event status label in guild admin for an event open for signup."); }
  static statusClosed(fbs: FbsAPI) { return fbs("已截止", "Event status label in guild admin for an event whose signup is closed."); }
  static statusCompleted(fbs: FbsAPI) { return fbs("已完成", "Event status label in guild admin for a completed event."); }
  static statusDraft(fbs: FbsAPI) { return fbs("草稿", "Event status label in guild admin for a draft event."); }
  static signupsTitle(fbs: FbsAPI) { return fbs("报名名单", "Title of the signup list of an event in guild admin."); }
  static signupEmpty(fbs: FbsAPI) { return fbs("暂无报名。", "Empty-state text in the admin signup list when nobody has signed up."); }
  static exportCsvButton(fbs: FbsAPI) { return fbs("导出 CSV", "Button label that exports an event's signup list as CSV."); }
  static removeSignupButton(fbs: FbsAPI) { return fbs("移除", "Button label that removes one signup from an event in guild admin."); }
  static resultsTitle(fbs: FbsAPI) { return fbs("竞速成绩", "Title of the racing results section in guild admin."); }
  static resultTeamLabel(fbs: FbsAPI) { return fbs("队伍名", "Label of the team name field in the racing result editor."); }
  static resultMembersLabel(fbs: FbsAPI) { return fbs("队员（逗号分隔）", "Label of the team members field in the racing result editor, a comma-separated list."); }
  static resultTimeLabel(fbs: FbsAPI) { return fbs("用时（如 12:34.567）", "Label of the clear time field in the racing result editor, with the expected minutes, seconds and milliseconds format."); }
  static resultProofLabel(fbs: FbsAPI) { return fbs("凭证链接", "Label of the proof link field in the racing result editor."); }
  static resultNoteLabel(fbs: FbsAPI) { return fbs("备注", "Label of the note field in the racing result editor."); }
  static guidesTitle(fbs: FbsAPI) { return fbs("流派攻略数据（BiS / 循环）", "Title of the sect guides data section in guild admin, covering best-in-slot and rotation data."); }
  static guidesHint(fbs: FbsAPI) { return fbs("按流派填写：build 名称、属性行、占比行、BiS（JSON）与循环（JSON）。保存后流派页即时生效。", "Hint in the guides data section: entries are per sect with a build name, attribute line, ratio line, BiS JSON and rotation JSON, and saving takes effect on sect pages immediately."); }
  static guideSchoolLabel(fbs: FbsAPI) { return fbs("流派", "Label of the sect selector in the guides data editor."); }
  static guideBuildLabel(fbs: FbsAPI) { return fbs("Build 名称", "Label of the build name field in the guides data editor."); }
  static guideAttrLabel(fbs: FbsAPI) { return fbs("属性行", "Label of the attribute line field in the guides data editor."); }
  static guideRateLabel(fbs: FbsAPI) { return fbs("占比行", "Label of the ratio line field in the guides data editor."); }
  static guideBisLabel(fbs: FbsAPI) { return fbs("BiS（JSON）", "Label of the BiS JSON field in the guides data editor."); }
  static guideRotationLabel(fbs: FbsAPI) { return fbs("循环（JSON）", "Label of the rotation JSON field in the guides data editor."); }
  static tabStats(fbs: FbsAPI) { return fbs("统计", "Tab label of the statistics section in guild admin."); }
  static tabSeason(fbs: FbsAPI) { return fbs("赛季", "Tab label of the season checklist section in guild admin."); }
  static seasonTitle(fbs: FbsAPI) { return fbs("赛季前检查清单", "Title of the pre-season checklist section in guild admin."); }
  static seasonHint(fbs: FbsAPI, p?: StringParams) { return fbs(["按当前版本 ", fbs.param("version", pv(p, "version")), " 与赛季 ", fbs.param("season", pv(p, "season")), " 自动生成；换季后清单自动重置，逐项复核后勾选。"], "Hint in the season checklist section; {version} is the current game version and {season} the season, and the checklist regenerates and resets each season."); }
  static seasonProgress(fbs: FbsAPI, p?: StringParams) { return fbs(["已完成 ", fbs.param("done", pv(p, "done")), " / ", fbs.param("total", pv(p, "total"))], "Progress line of the season checklist; {done} is the number of checked items and {total} the item count."); }
  static seasonItemDungeonsTitle(fbs: FbsAPI) { return fbs("复核当前版本副本", "Title of the season checklist item about reviewing current-version dungeons."); }
  static seasonItemDungeonsDetail(fbs: FbsAPI, p?: StringParams) { return fbs(["当前版本（", fbs.param("version", pv(p, "version")), "）共有 ", fbs.param("count", pv(p, "count")), " 个副本，确认达标要求与攻略已按本赛季更新。"], "Detail of the dungeons checklist item; {version} is the game version and {count} the number of dungeons in it."); }
  static seasonItemTemplatesTitle(fbs: FbsAPI) { return fbs("复核组队模板", "Title of the season checklist item about reviewing squad templates."); }
  static seasonItemTemplatesDetail(fbs: FbsAPI, p?: StringParams) { return fbs(["本百业现有 ", fbs.param("count", pv(p, "count")), " 个组队模板，确认模板的副本与人数仍适用于本赛季。"], "Detail of the templates checklist item; {count} is the number of squad templates the guild has."); }
  static seasonItemGuidesTitle(fbs: FbsAPI) { return fbs("复核流派攻略数据", "Title of the season checklist item about reviewing sect guide data."); }
  static seasonItemGuidesDetail(fbs: FbsAPI, p?: StringParams) { return fbs(["攻略数据现有 ", fbs.param("builds", pv(p, "builds")), " 份 BiS 与 ", fbs.param("rotations", pv(p, "rotations")), " 份循环，确认已按本赛季数值更新。"], "Detail of the guides checklist item; {builds} is the number of BiS entries and {rotations} the number of rotation entries."); }
  static seasonItemRosterTitle(fbs: FbsAPI) { return fbs("复核成员名册", "Title of the season checklist item about reviewing the member roster."); }
  static seasonItemRosterDetail(fbs: FbsAPI, p?: StringParams) { return fbs(["Discord 名册 ", fbs.param("members", pv(p, "members")), " 人，截图名册 ", fbs.param("entries", pv(p, "entries")), " 条；确认成员装备季标与名册均为本赛季最新。"], "Detail of the roster checklist item; {members} is the Discord roster size and {entries} the number of screenshot-imported roster entries."); }
  static rosterTitle(fbs: FbsAPI) { return fbs("成员名册（截图导入）", "Title of the member roster section in guild admin, covering screenshot-based roster import."); }
  static rosterHint(fbs: FbsAPI) { return fbs("上传游戏内成员名单截图，识别出的名字先进入预览，确认后才写入名册。名册只记录游戏内名字，不会改变任何人的 Discord 成员资格。", "Hint in the roster section: uploaded member list screenshots are recognized into a preview first and only written after confirmation, and the roster records in-game names without changing anyone's Discord membership."); }
  static rosterUpload(fbs: FbsAPI) { return fbs("上传名单截图", "Button label that uploads a member list screenshot for roster import."); }
  static rosterOcrRunning(fbs: FbsAPI) { return fbs("识别中…", "Button label while a roster screenshot is being recognized."); }
  static rosterPreviewTitle(fbs: FbsAPI) { return fbs("导入预览", "Title of the roster import preview, where recognized names are reviewed before confirming."); }
  static rosterConfirm(fbs: FbsAPI) { return fbs("确认导入", "Button label that confirms a roster import preview and writes the entries."); }
  static rosterEmpty(fbs: FbsAPI) { return fbs("尚无名册记录，用上方按钮上传名单截图导入。", "Empty-state text in the roster section when no entries exist yet."); }
  static rosterSourceOcr(fbs: FbsAPI) { return fbs("截图识别", "Source tag on roster entries that came from screenshot recognition."); }
  static rosterMatchedMember(fbs: FbsAPI) { return fbs("已匹配 Discord 成员", "Note on a roster entry that has been matched to a Discord member."); }
  static rosterStatusMatched(fbs: FbsAPI) { return fbs("已匹配", "Status label of a roster entry matched to a Discord member."); }
  static rosterStatusNew(fbs: FbsAPI) { return fbs("疑似新名", "Status label of a roster entry that looks like a new, unmatched name."); }
  static rosterStatusUnrecognized(fbs: FbsAPI) { return fbs("无法识别", "Status label of a roster entry whose name could not be recognized."); }
  static rosterImported(fbs: FbsAPI, p?: StringParams) { return fbs(["已导入 ", fbs.param("count", pv(p, "count")), " 条名册记录"], "Confirmation shown after a roster import; {count} is the number of entries written."); }
  static statsTitle(fbs: FbsAPI) { return fbs("出勤与活跃", "Title of the attendance and activity statistics section in guild admin."); }
  static statsCurrentWeek(fbs: FbsAPI) { return fbs("本周", "Column header in the weekly statistics table for the current week."); }
  static statsCars(fbs: FbsAPI) { return fbs("开车", "Metric label in statistics for the number of squads started."); }
  static statsCompleted(fbs: FbsAPI) { return fbs("完成", "Metric label in statistics for the number of completed squads."); }
  static statsSeats(fbs: FbsAPI) { return fbs("席位", "Metric label in statistics for the number of filled seats."); }
  static statsFillRate(fbs: FbsAPI) { return fbs("满员率", "Metric label in statistics for the seat fill rate."); }
  static statsParticipants(fbs: FbsAPI) { return fbs("参与人数", "Metric label in statistics for the number of participating members."); }
  static statsPerCapita(fbs: FbsAPI) { return fbs("人均参与", "Metric label in statistics for participations per member."); }
  static statsMembersTitle(fbs: FbsAPI) { return fbs("成员参与榜 · 近 4 周", "Title of the member participation leaderboard in statistics, covering the last four weeks."); }
  static statsLeadersTitle(fbs: FbsAPI) { return fbs("车头榜 · 近 4 周", "Title of the squad leader leaderboard in statistics, covering the last four weeks."); }
  static statsSeatCount(fbs: FbsAPI) { return fbs("落座次数", "Column label in the member leaderboard for the number of times a member took a seat."); }
  static statsCarCount(fbs: FbsAPI) { return fbs("开车数", "Column label in the leader leaderboard for the number of squads a member led."); }
  static statsEmpty(fbs: FbsAPI) { return fbs("近 4 周暂无组队数据。", "Empty-state text in statistics when there is no grouping data in the last four weeks."); }
  static statsBoardEmpty(fbs: FbsAPI) { return fbs("暂无记录。", "Empty-state text on a statistics leaderboard when there are no records."); }
  static whiteLabelTitle(fbs: FbsAPI) { return fbs("品牌与分享卡", "Title of the branding and share card section in guild admin (premium)."); }
  static hideBrandingLabel(fbs: FbsAPI) { return fbs("隐藏平台品牌", "Label of the toggle that hides platform branding on this guild's pages."); }
  static hideBrandingHint(fbs: FbsAPI) { return fbs("开启后，本百业的页面上不再显示平台名称与页脚声明，只呈现百业自己的信息。", "Hint for the hide-branding toggle: when on, the guild's pages show no platform name or footer disclaimer, only the guild's own information."); }
  static ogAccentLabel(fbs: FbsAPI) { return fbs("分享卡强调色", "Label of the share card (OG image) accent color selector in guild admin."); }
  static ogTitleSuffixLabel(fbs: FbsAPI) { return fbs("分享卡标题后缀", "Label of the share card title suffix field in guild admin."); }
  static ogTitleSuffixHint(fbs: FbsAPI) { return fbs("会接在分享卡的标题后面，如「· 招募中」；最多 30 字，留空不显示。", "Hint for the share card title suffix: it is appended to the card title, at most thirty characters, and empty means not shown."); }
  static ogAccentGold(fbs: FbsAPI) { return fbs("鎏金", "Accent color option for share cards: gilded gold."); }
  static ogAccentJade(fbs: FbsAPI) { return fbs("翡翠", "Accent color option for share cards: jade green."); }
  static ogAccentAzure(fbs: FbsAPI) { return fbs("藏青", "Accent color option for share cards: deep azure."); }
  static ogAccentCinnabar(fbs: FbsAPI) { return fbs("朱砂", "Accent color option for share cards: cinnabar red."); }
  static ogAccentViolet(fbs: FbsAPI) { return fbs("紫檀", "Accent color option for share cards: violet sandalwood."); }
  static premiumLockedTitle(fbs: FbsAPI) { return fbs("开通百业 Premium", "Title of the premium upsell panel shown in guild admin when the guild has no premium."); }
  static premiumLockedBody(fbs: FbsAPI) { return fbs("高级发车提醒、出勤统计、品牌与分享卡定制均为 Premium 功能。开通后立即生效，可随时取消。", "Body of the premium upsell panel, listing premium features such as advanced reminders, attendance statistics and branding customization, and noting cancellation is possible anytime."); }
  static premiumCheckoutButton(fbs: FbsAPI) { return fbs("立即开通", "Button label in the premium upsell panel that starts the premium checkout."); }
  static premiumComingSoon(fbs: FbsAPI) { return fbs("即将开放", "Label shown instead of the checkout button when premium signups are not open yet."); }
  static premiumActiveTitle(fbs: FbsAPI) { return fbs("百业 Premium", "Title of the premium status panel in guild admin when the guild has premium."); }
  static premiumPlanName(fbs: FbsAPI) { return fbs("Premium", "Plan name shown in the premium status panel."); }
  static premiumSourceStripe(fbs: FbsAPI) { return fbs("通过 Stripe 订阅", "Subscription source label in the premium status panel for a Stripe subscription."); }
  static premiumSourceManual(fbs: FbsAPI) { return fbs("由平台授予", "Subscription source label in the premium status panel for a platform-granted premium."); }
  static premiumPeriodEnd(fbs: FbsAPI, p?: StringParams) { return fbs(["当前周期至 ", fbs.param("date", pv(p, "date"))], "Line in the premium status panel giving the end of the current period; {date} is the period end date."); }
  static premiumPriceMonth(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("amount", pv(p, "amount")), " / 月"], "Monthly premium price line; {amount} is the formatted price."); }
  static premiumPriceYear(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("amount", pv(p, "amount")), " / 年"], "Yearly premium price line; {amount} is the formatted price."); }
  static billingSuccess(fbs: FbsAPI) { return fbs("开通成功，Premium 已生效。", "Confirmation shown on return from a successful premium checkout."); }
  static billingCanceled(fbs: FbsAPI) { return fbs("已取消开通，未产生扣费。", "Notice shown on return from a cancelled premium checkout: nothing was charged."); }
  static tabAnnouncements(fbs: FbsAPI) { return fbs("公告广播", "Tab label of the announcements broadcast section in guild admin."); }
  static tabTools(fbs: FbsAPI) { return fbs("活动工具", "Tab label of the event tools section in guild admin."); }
  static lotteryTitle(fbs: FbsAPI) { return fbs("活动抽奖", "Title of the event lottery section in guild admin."); }
  static lotteryHint(fbs: FbsAPI) { return fbs("参与名单可来自某辆车的参与者，或手选本百业成员；名单与权重在创建时定格。开奖按权重随机抽取，同一抽奖内不会重复中奖；抽奖、名单、权重与结果全部留痕可查。", "Hint in the lottery section: participants come from a squad's members or hand-picked guild members, entries and weights freeze at creation, drawing is weighted-random without repeats, and everything is kept on record."); }
  static lotteryEmpty(fbs: FbsAPI) { return fbs("还没有抽奖，先创建一个。", "Empty-state text in the lottery section when no lottery exists yet."); }
  static lotteryNameLabel(fbs: FbsAPI) { return fbs("抽奖标题", "Label of the lottery title field in the lottery creation form."); }
  static lotteryPrizeLabel(fbs: FbsAPI) { return fbs("奖品 / 奖池", "Label of the prize field in the lottery creation form."); }
  static lotterySourceLabel(fbs: FbsAPI) { return fbs("参与名单来源", "Label of the participant source selector in the lottery creation form."); }
  static lotterySourceGrouping(fbs: FbsAPI) { return fbs("某辆车的参与者", "Participant source option: the participants of one squad."); }
  static lotterySourceMembers(fbs: FbsAPI) { return fbs("手选百业成员", "Participant source option: hand-picked guild members."); }
  static lotteryGroupingLabel(fbs: FbsAPI) { return fbs("选择车队", "Label of the squad selector in the lottery creation form when the source is a squad."); }
  static lotteryWinnerCountLabel(fbs: FbsAPI) { return fbs("中奖人数", "Label of the winner count field in the lottery creation form."); }
  static lotteryUniformWeightLabel(fbs: FbsAPI) { return fbs("统一权重", "Label of the uniform weight field in the lottery creation form, applied to every participant."); }
  static lotteryWeightLabel(fbs: FbsAPI) { return fbs("权重", "Label of the per-participant weight input in the lottery form."); }
  static lotteryEntriesLabel(fbs: FbsAPI) { return fbs("参与名单", "Heading of the participant list of a lottery."); }
  static lotteryWinnersLabel(fbs: FbsAPI) { return fbs("中奖名单", "Heading of the winner list of a drawn lottery."); }
  static lotteryCreateButton(fbs: FbsAPI) { return fbs("创建抽奖", "Button label that creates a lottery."); }
  static lotteryDrawButton(fbs: FbsAPI) { return fbs("开奖", "Button label that draws the winners of a lottery."); }
  static lotteryStatusOpen(fbs: FbsAPI) { return fbs("待开奖", "Status label of a lottery waiting to be drawn."); }
  static lotteryStatusDrawn(fbs: FbsAPI) { return fbs("已开奖", "Status label of a lottery that has been drawn."); }
  static lotteryEntryCount(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("count", pv(p, "count")), " 人参与"], "Participant count line on a lottery card; {count} is the number of participants."); }
  static tabRecruit(fbs: FbsAPI) { return fbs("招新与导师", "Tab label of the recruiting and mentors section in guild admin."); }
  static tabOfficer(fbs: FbsAPI) { return fbs("军官工具", "Tab label of the officer tools section in guild admin."); }
}

export abstract class AnnouncementsFbtUtils {
  static title(fbs: FbsAPI) { return fbs("百业公告", "Title of the announcements tab on the guild home page."); }
  static emptyText(fbs: FbsAPI) { return fbs("暂无公告", "Empty-state text on the announcements tab when the guild has no announcements."); }
  static urgentLabel(fbs: FbsAPI) { return fbs("紧急集合", "Kind tag on an announcement card marking it as an urgent muster call."); }
  static standardLabel(fbs: FbsAPI) { return fbs("公告", "Kind tag on an announcement card marking it as a regular announcement."); }
  static unreadLabel(fbs: FbsAPI) { return fbs("未读", "Badge on an announcement the current member has not read yet."); }
  static readLabel(fbs: FbsAPI) { return fbs("已读", "Badge on an announcement the current member has already read."); }
  static composeTitle(fbs: FbsAPI) { return fbs("发布公告", "Title of the form for composing a new announcement; only composed for guild admins."); }
  static kindLabel(fbs: FbsAPI) { return fbs("类型", "Label of the announcement kind selector in the compose form."); }
  static kindStandardLabel(fbs: FbsAPI) { return fbs("普通公告", "Kind option in the compose form for a regular announcement."); }
  static kindUrgentLabel(fbs: FbsAPI) { return fbs("紧急集合呼叫", "Kind option in the compose form for an urgent muster call."); }
  static titleLabel(fbs: FbsAPI) { return fbs("标题", "Label of the announcement title field in the compose form."); }
  static titlePlaceholder(fbs: FbsAPI) { return fbs("公告标题", "Placeholder text in the announcement title field."); }
  static bodyLabel(fbs: FbsAPI) { return fbs("正文", "Label of the announcement body field in the compose form."); }
  static bodyPlaceholder(fbs: FbsAPI) { return fbs("公告正文", "Placeholder text in the announcement body field."); }
  static postLabel(fbs: FbsAPI) { return fbs("发布并推送", "Submit button label in the compose form; posting also pushes a notification to all members."); }
  static postingLabel(fbs: FbsAPI) { return fbs("发布中…", "Submit button label in the compose form while the announcement is being posted."); }
  static postedText(fbs: FbsAPI) { return fbs("公告已发布", "Confirmation shown after an announcement is posted."); }
  static deleteLabel(fbs: FbsAPI) { return fbs("删除", "Button label on an announcement card that deletes it; only composed for guild admins."); }
  static deleteConfirmTitle(fbs: FbsAPI) { return fbs("删除这条公告？", "Title of the confirmation dialog for deleting an announcement."); }
  static deleteConfirmMessage(fbs: FbsAPI, p?: StringParams) { return fbs(["确定要删除公告「", fbs.param("title", pv(p, "title")), "」吗？已读记录会一并删除。"], "Body of the delete-announcement confirmation dialog; {title} is the announcement title, and the text warns read receipts are deleted too."); }
  static deletedText(fbs: FbsAPI) { return fbs("公告已删除", "Confirmation shown after an announcement is deleted."); }
  static receiptsTitle(fbs: FbsAPI) { return fbs("阅读情况", "Title of the read-receipts panel on an announcement; only composed for guild admins."); }
  static readCountTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["已读 ", fbs.param("read", pv(p, "read")), " / ", fbs.param("total", pv(p, "total"))], "Read progress on an announcement's receipts panel; {read} is the number of members who read it and {total} the member count."); }
  static readListLabel(fbs: FbsAPI) { return fbs("已读成员", "Heading of the list of members who have read an announcement."); }
  static unreadListLabel(fbs: FbsAPI) { return fbs("未读成员", "Heading of the list of members who have not read an announcement yet."); }
  static authorTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("name", pv(p, "name")), " 发布"], "Byline on an announcement card; {name} is the publishing admin's display name."); }
  static pushNote(fbs: FbsAPI) { return fbs("发布后会向全体成员推送通知；没有开启推送的成员也能在这里看到。", "Note in the compose form: posting pushes a notification to all members, and members without push enabled can still read it here."); }
  static urgentNote(fbs: FbsAPI) { return fbs("紧急集合呼叫请只用于临时集合等紧急情况，每天最多 2 次。", "Note in the compose form for urgent muster calls: reserve them for genuine emergencies, at most two per day."); }
  static dailyLimitTemplate(fbs: FbsAPI, p?: StringParams) { return fbs(["今日还可发布 ", fbs.param("remaining", pv(p, "remaining")), " 条"], "Remaining-quota line in the compose form for urgent calls; {remaining} is how many more can be posted today."); }
}

export abstract class RecruitFbtUtils {
  static title(fbs: FbsAPI) { return fbs("招新与新人", "Title of the recruiting and newcomers page."); }
  static homeBody(fbs: FbsAPI) { return fbs("想加入一个百业？在下面挑一个开放招新的百业提交入业申请，百业管理员会在管理面审核。已经在业的新人可以在这里看自己的入业清单与导师配对。", "Intro paragraph of the recruiting section on the platform home page: visitors pick an open guild below and submit a join application for admin review, and newcomers see their onboarding checklist and mentor pairing here."); }
  static homeLoginHint(fbs: FbsAPI) { return fbs("登录后即可对心仪的百业提交入业申请，并在这里查看审核进度。", "Hint in the platform home recruiting section for signed-out visitors: after signing in they can apply to a guild of their choice and track the review progress here."); }
  static applySectionTitle(fbs: FbsAPI) { return fbs("入业申请", "Title of the join application section on the recruiting page."); }
  static messageLabel(fbs: FbsAPI) { return fbs("申请附言", "Label of the application message field on the join application form."); }
  static messagePlaceholder(fbs: FbsAPI) { return fbs("一句自我介绍（可选）：常玩的流派、在线时间……", "Placeholder text in the application message field, inviting a short self-introduction such as main sect and online hours."); }
  static submitButton(fbs: FbsAPI) { return fbs("提交申请", "Submit button label on the join application form."); }
  static submittingButton(fbs: FbsAPI) { return fbs("提交中…", "Submit button label on the join application form while the application is being sent."); }
  static myApplicationTitle(fbs: FbsAPI) { return fbs("我的申请", "Title of the section showing the signed-in non-member's own pending application status."); }
  static statusPending(fbs: FbsAPI) { return fbs("待审核", "Status label of a join application awaiting review."); }
  static statusApproved(fbs: FbsAPI) { return fbs("已通过", "Status label of an approved join application."); }
  static statusRejected(fbs: FbsAPI) { return fbs("未通过", "Status label of a rejected join application."); }
  static pendingHint(fbs: FbsAPI) { return fbs("管理员审核中，请耐心等待；审核结果会直接更新在这里。", "Hint under a pending application: admins are reviewing and the result will update right here."); }
  static approvedNextStep(fbs: FbsAPI) { return fbs("申请已通过，你已登记进百业名册。最后一步在 Discord 完成：加入本百业绑定的 Discord 服务器——成员资格由 Discord 服务器成员身份决定，平台没有 Discord 机器人权限，无法替你加入服务器或授予身份组；加入后用同一账号登录即可使用百业全部功能。", "Next-step text for an approved applicant: they are on the roster, and the final step is joining the guild's Discord server themselves because membership follows Discord server membership and the platform has no Discord bot rights."); }
  static rejectedHint(fbs: FbsAPI) { return fbs("本次申请未通过。可以修改附言后重新提交一份新申请。", "Hint under a rejected application: the applicant can edit the message and submit a fresh application."); }
  static checklistTitle(fbs: FbsAPI) { return fbs("新手入业清单", "Title of the newcomer onboarding checklist section."); }
  static checklistProgress(fbs: FbsAPI, p?: StringParams) { return fbs(["已完成 ", fbs.param("done", pv(p, "done")), " / ", fbs.param("total", pv(p, "total"))], "Progress line of the newcomer checklist; {done} is the number of completed items and {total} the item count."); }
  static itemProfileLabel(fbs: FbsAPI) { return fbs("完善流派 / 时区", "Label of the checklist item about completing sect and time zone information."); }
  static itemProfileHint(fbs: FbsAPI) { return fbs("在任意车队报名落座时填上你的流派即算完成；时区由你的客户端自动同步，无需手动填写。", "Completion rule of the profile checklist item: filling in a sect when signing up for a squad completes it, and the time zone syncs automatically from the client."); }
  static itemMentorLabel(fbs: FbsAPI) { return fbs("认一位导师", "Label of the checklist item about being paired with a mentor."); }
  static itemMentorHint(fbs: FbsAPI) { return fbs("由百业管理员为你配对一位导师后自动完成。", "Completion rule of the mentor checklist item: it completes automatically once a guild admin pairs the newcomer with a mentor."); }
  static itemFirstRunLabel(fbs: FbsAPI) { return fbs("打完第一场", "Label of the checklist item about finishing a first run."); }
  static itemFirstRunHint(fbs: FbsAPI) { return fbs("在一辆已完成的车队里落座后自动完成。", "Completion rule of the first-run checklist item: it completes automatically after sitting in a squad that gets completed."); }
  static myPairingsTitle(fbs: FbsAPI) { return fbs("我的导师配对", "Title of the section listing the member's mentor pairings."); }
  static itemAvailabilityLabel(fbs: FbsAPI) { return fbs("填写可用时间", "Label of the newcomer checklist item about filling in weekly availability."); }
  static itemAvailabilityHint(fbs: FbsAPI) { return fbs("在个人设置里填写你每周固定有空的时段，方便管理员与车头定档期；可以先跳过，之后随时补填。", "Completion hint of the availability checklist item: fill in weekly free slots in personal settings so admins and squad leaders can pick times; it may be skipped and filled in later."); }
  static pairingStatusActive(fbs: FbsAPI) { return fbs("进行中", "Status label of an active mentor pairing."); }
  static pairingStatusEnded(fbs: FbsAPI) { return fbs("已结束", "Status label of an ended mentor pairing."); }
  static mentorRoleLabel(fbs: FbsAPI) { return fbs("导师", "Role label identifying the mentor in a pairing row."); }
  static menteeRoleLabel(fbs: FbsAPI) { return fbs("新人", "Role label identifying the newcomer in a pairing row."); }
  static adminApplicationsTitle(fbs: FbsAPI) { return fbs("入业申请审核", "Title of the join application review section in guild admin."); }
  static adminApplicationsEmpty(fbs: FbsAPI) { return fbs("暂无申请记录。", "Empty-state text in the admin application review section when there are no applications."); }
  static adminApproveButton(fbs: FbsAPI) { return fbs("通过", "Button label that approves a join application in guild admin."); }
  static adminRejectButton(fbs: FbsAPI) { return fbs("拒绝", "Button label that rejects a join application in guild admin."); }
  static adminMentorPoolTitle(fbs: FbsAPI) { return fbs("导师人选", "Title of the mentor pool section in guild admin."); }
  static adminSetMentorButton(fbs: FbsAPI) { return fbs("设为导师", "Button label that marks a roster member as a mentor in guild admin."); }
  static adminUnsetMentorButton(fbs: FbsAPI) { return fbs("取消导师", "Button label that removes a member's mentor status in guild admin."); }
  static adminPairingsTitle(fbs: FbsAPI) { return fbs("导师配对", "Title of the mentor pairings management section in guild admin."); }
  static adminPairingsEmpty(fbs: FbsAPI) { return fbs("暂无配对记录。", "Empty-state text in the admin pairings section when there are no pairings."); }
  static adminPairingCreateButton(fbs: FbsAPI) { return fbs("建立配对", "Button label that creates a mentor pairing in guild admin."); }
  static adminPairingEndButton(fbs: FbsAPI) { return fbs("结束配对", "Button label that ends a mentor pairing in guild admin."); }
  static adminMentorSelectLabel(fbs: FbsAPI) { return fbs("选择导师", "Label of the mentor selector in the pairing creation form."); }
  static adminMenteeSelectLabel(fbs: FbsAPI) { return fbs("选择新人", "Label of the newcomer selector in the pairing creation form."); }
  static adminNewcomersTitle(fbs: FbsAPI) { return fbs("新人清单进度", "Title of the admin section listing newcomers and their checklist progress."); }
  static adminNewcomersEmpty(fbs: FbsAPI) { return fbs("暂无未完成清单的新人。", "Empty-state text in the admin newcomers section when no newcomer has an unfinished checklist."); }
}

export abstract class OfficerFbtUtils {
  static notesTitle(fbs: FbsAPI) { return fbs("成员备注", "Title of the member notes section in guild admin; notes are internal officer records."); }
  static notesHint(fbs: FbsAPI) { return fbs("备注仅百业管理员可见，成员本人看不到关于自己的备注。", "Hint in the member notes section: notes are visible only to guild admins, never to the member they are about."); }
  static notesEmpty(fbs: FbsAPI) { return fbs("本百业暂无成员名册。", "Empty-state text in the member notes section when the guild roster is empty."); }
  static memberNoNotes(fbs: FbsAPI) { return fbs("暂无备注", "Placeholder shown for a roster member who has no officer notes yet."); }
  static notePlaceholder(fbs: FbsAPI) { return fbs("写一条备注…", "Placeholder text of the officer note input."); }
  static noteAddButton(fbs: FbsAPI) { return fbs("添加备注", "Button label that adds an officer note to a member."); }
  static noteEditButton(fbs: FbsAPI) { return fbs("编辑", "Button label that starts editing an officer note."); }
  static noteSaveButton(fbs: FbsAPI) { return fbs("保存", "Button label that saves an edited officer note."); }
  static noteDeleteButton(fbs: FbsAPI) { return fbs("删除", "Button label that deletes an officer note."); }
  static noteAuthorTemplate(fbs: FbsAPI, p?: StringParams) { return fbs([fbs.param("name", pv(p, "name")), " 添加"], "Byline under an officer note; {name} is the admin who added it."); }
  static exportTitle(fbs: FbsAPI) { return fbs("百业数据包", "Title of the guild data pack export section in guild admin."); }
  static exportHint(fbs: FbsAPI) { return fbs("导出本百业的名册、组队历史与参与记录、成员赛季目标（JSON 文件）。导出动作会留痕记录。", "Hint in the data pack section: the export contains the roster, grouping history and participation records and member season goals as JSON, and the export action itself is audit-logged."); }
  static exportButton(fbs: FbsAPI) { return fbs("导出数据包", "Button label that downloads the guild data pack."); }
  static exportAbout(fbs: FbsAPI) { return fbs("百业数据包导出：包含本百业名册、组队历史与参与记录、成员赛季目标。军官备注为内部工作记录，不包含在本数据包内。", "README text embedded in the exported guild data pack file, stating what it contains and that officer notes are deliberately excluded as internal working records."); }
  static goalsTitle(fbs: FbsAPI) { return fbs("成员赛季目标", "Title of the member season goals overview section in guild admin."); }
  static goalsHint(fbs: FbsAPI) { return fbs("成员给自己设的赛季目标与进度，只读总览。", "Hint in the season goals overview: goals and progress are set by members themselves and this view is read-only."); }
  static goalsEmpty(fbs: FbsAPI) { return fbs("暂无成员设置赛季目标。", "Empty-state text in the season goals overview when no member has set a goal."); }
  static statusActive(fbs: FbsAPI) { return fbs("进行中", "Status label of a season goal in progress."); }
  static statusDone(fbs: FbsAPI) { return fbs("已完成", "Status label of a completed season goal."); }
  static statusDropped(fbs: FbsAPI) { return fbs("已放弃", "Status label of an abandoned season goal."); }
  static myEntryLabel(fbs: FbsAPI) { return fbs("赛季目标", "Label of the entry point in profile settings that opens the season goals page."); }
  static myTitle(fbs: FbsAPI) { return fbs("我的赛季目标", "Title of the member's own season goals page."); }
  static myHint(fbs: FbsAPI) { return fbs("在某个百业里给自己定一个本赛季目标，进度由你自己维护；该百业的管理员可以查看总览。", "Hint on the my season goals page: goals are per guild, progress is self-maintained, and that guild's admins can view the overview."); }
  static myEmpty(fbs: FbsAPI) { return fbs("你还没有设置赛季目标。", "Empty-state text on the my season goals page when the member has no goals yet."); }
  static goalGuildLabel(fbs: FbsAPI) { return fbs("所属百业", "Label of the guild selector in the season goal editor."); }
  static goalTitleLabel(fbs: FbsAPI) { return fbs("目标", "Label of the goal title field in the season goal editor."); }
  static goalTitlePlaceholder(fbs: FbsAPI) { return fbs("例如：打通某个副本、集齐一套装备…", "Placeholder example text in the goal title field, such as clearing a dungeon or completing a gear set."); }
  static goalNoteLabel(fbs: FbsAPI) { return fbs("进度备注", "Label of the progress note field in the season goal editor."); }
  static goalNotePlaceholder(fbs: FbsAPI) { return fbs("记录当前进度…", "Placeholder text in the progress note field."); }
  static goalDungeonLabel(fbs: FbsAPI) { return fbs("关联副本（可选）", "Label of the optional linked-dungeon selector in the season goal editor."); }
  static goalDungeonNone(fbs: FbsAPI) { return fbs("不关联副本", "Option in the goal editor meaning no dungeon is linked."); }
  static goalStatusLabel(fbs: FbsAPI) { return fbs("状态", "Label of the status selector in the season goal editor."); }
  static goalAddButton(fbs: FbsAPI) { return fbs("添加目标", "Button label that adds a new season goal."); }
  static goalSaveButton(fbs: FbsAPI) { return fbs("保存", "Button label that saves an edited season goal."); }
  static goalEditButton(fbs: FbsAPI) { return fbs("编辑", "Button label that starts editing a season goal."); }
  static goalDeleteButton(fbs: FbsAPI) { return fbs("删除", "Button label that deletes a season goal."); }
}

