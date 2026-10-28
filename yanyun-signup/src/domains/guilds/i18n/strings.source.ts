/* fbtee declaration surface for the guilds domain (hand-maintained): this
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

export const locked_backLink = (fbs: FbsAPI) =>fbs("‹ 我的百业", "locked.backLink");
export const locked_title = (fbs: FbsAPI) =>fbs("无权访问这个百业", "locked.title");
export const locked_body1 = (fbs: FbsAPI) =>fbs("该百业不存在，或仅对某个 Discord 服务器的成员开放。", "locked.body1");
export const locked_body2 = (fbs: FbsAPI) =>fbs("加入对应的 Discord 服务器后，用同一个账号登录即可访问。", "locked.body2");
export const locked_backButton = (fbs: FbsAPI) =>fbs("回到我的百业", "locked.backButton");
export const guildHome_backToHub = (fbs: FbsAPI) =>fbs("← 百业集结", "guildHome.backToHub");
export const guildHome_backPlain = (fbs: FbsAPI) =>fbs("← 返回", "guildHome.backPlain");
export const guildHome_tabTeam = (fbs: FbsAPI) =>fbs("组队", "guildHome.tabTeam");
export const guildHome_tabDex = (fbs: FbsAPI) =>fbs("攻略", "guildHome.tabDex");
export const guildHome_tabSect = (fbs: FbsAPI) =>fbs("流派攻略", "guildHome.tabSect");
export const guildHome_tabAnnouncements = (fbs: FbsAPI) =>fbs("公告", "guildHome.tabAnnouncements");
export const guildHome_readOnlyBanner = (fbs: FbsAPI) =>fbs("该百业尚未绑定 Discord 服务器 · 只读浏览", "guildHome.readOnlyBanner");
export const guildHome_adminLink = (fbs: FbsAPI) =>fbs("管理", "guildHome.adminLink");
export const guildAdmin_title = (fbs: FbsAPI) =>fbs("管理百业", "guildAdmin.title");
export const guildAdmin_lockedTitle = (fbs: FbsAPI) =>fbs("无权管理这个百业", "guildAdmin.lockedTitle");
export const guildAdmin_lockedBody = (fbs: FbsAPI) =>fbs("只有该百业所绑 Discord 服务器的管理员（服务器主或拥有管理权限）可以进入管理页。", "guildAdmin.lockedBody");
export const guildAdmin_backLink = (fbs: FbsAPI) =>fbs("‹ 返回百业", "guildAdmin.backLink");
export const guildAdmin_tabProfile = (fbs: FbsAPI) =>fbs("资料", "guildAdmin.tabProfile");
export const guildAdmin_tabDiscord = (fbs: FbsAPI) =>fbs("Discord", "guildAdmin.tabDiscord");
export const guildAdmin_tabEvents = (fbs: FbsAPI) =>fbs("活动", "guildAdmin.tabEvents");
export const guildAdmin_tabGuides = (fbs: FbsAPI) =>fbs("攻略数据", "guildAdmin.tabGuides");
export const guildAdmin_saveButton = (fbs: FbsAPI) =>fbs("保存", "guildAdmin.saveButton");
export const guildAdmin_savedText = (fbs: FbsAPI) =>fbs("已保存", "guildAdmin.savedText");
export const guildAdmin_deleteButton = (fbs: FbsAPI) =>fbs("删除", "guildAdmin.deleteButton");
export const guildAdmin_editButton = (fbs: FbsAPI) =>fbs("编辑", "guildAdmin.editButton");
export const guildAdmin_addButton = (fbs: FbsAPI) =>fbs("新增", "guildAdmin.addButton");
export const guildAdmin_profileTitle = (fbs: FbsAPI) =>fbs("百业资料", "guildAdmin.profileTitle");
export const guildAdmin_nameLabel = (fbs: FbsAPI) =>fbs("百业名称", "guildAdmin.nameLabel");
export const guildAdmin_announcementLabel = (fbs: FbsAPI) =>fbs("公告", "guildAdmin.announcementLabel");
export const guildAdmin_sloganLabel = (fbs: FbsAPI) =>fbs("标语", "guildAdmin.sloganLabel");
export const guildAdmin_masterNameLabel = (fbs: FbsAPI) =>fbs("掌门", "guildAdmin.masterNameLabel");
export const guildAdmin_logoUrlLabel = (fbs: FbsAPI) =>fbs("标志图链接", "guildAdmin.logoUrlLabel");
export const guildAdmin_bgImageUrlLabel = (fbs: FbsAPI) =>fbs("背景图链接", "guildAdmin.bgImageUrlLabel");
export const guildAdmin_avatarTitle = (fbs: FbsAPI) =>fbs("百业头像", "guildAdmin.avatarTitle");
export const guildAdmin_avatarUpload = (fbs: FbsAPI) =>fbs("上传头像", "guildAdmin.avatarUpload");
export const guildAdmin_avatarReplace = (fbs: FbsAPI) =>fbs("更换头像", "guildAdmin.avatarReplace");
export const guildAdmin_avatarDelete = (fbs: FbsAPI) =>fbs("删除头像", "guildAdmin.avatarDelete");
export const guildAdmin_avatarNone = (fbs: FbsAPI) =>fbs("尚未设置头像，当前显示默认印章。", "guildAdmin.avatarNone");
export const guildAdmin_avatarHint = (fbs: FbsAPI) =>fbs("正方形图片效果最佳，大小 ≤ 400KB（PNG / JPEG / WebP）。", "guildAdmin.avatarHint");
export const guildAdmin_discordTitle = (fbs: FbsAPI) =>fbs("Discord 集成", "guildAdmin.discordTitle");
export const guildAdmin_webhookLabel = (fbs: FbsAPI) =>fbs("发车提醒 Webhook", "guildAdmin.webhookLabel");
export const guildAdmin_webhookSet = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["已设置（Webhook 编号 ", fbs.param("id", pv(p, "id")), "）"], "guildAdmin.webhookSet");
export const guildAdmin_webhookUnset = (fbs: FbsAPI) =>fbs("未设置", "guildAdmin.webhookUnset");
export const guildAdmin_webhookHint = (fbs: FbsAPI) =>fbs("保存后不回显完整地址；留空并保存 = 保持不变，点「清除」移除。", "guildAdmin.webhookHint");
export const guildAdmin_webhookClear = (fbs: FbsAPI) =>fbs("清除 Webhook", "guildAdmin.webhookClear");
export const guildAdmin_guildIdLabel = (fbs: FbsAPI) =>fbs("绑定的服务器 ID", "guildAdmin.guildIdLabel");
export const guildAdmin_guildIdUnbound = (fbs: FbsAPI) =>fbs("未绑定", "guildAdmin.guildIdUnbound");
export const guildAdmin_reminderTitle = (fbs: FbsAPI) =>fbs("发车提醒设置", "guildAdmin.reminderTitle");
export const guildAdmin_reminderOffsetsLabel = (fbs: FbsAPI) =>fbs("提醒提前量（可多选）", "guildAdmin.reminderOffsetsLabel");
export const guildAdmin_reminderOffsetOption = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["提前 ", fbs.param("minutes", pv(p, "minutes")), " 分钟"], "guildAdmin.reminderOffsetOption");
export const guildAdmin_reminderCustomTextLabel = (fbs: FbsAPI) =>fbs("自定义提醒文案", "guildAdmin.reminderCustomTextLabel");
export const guildAdmin_reminderCustomTextHint = (fbs: FbsAPI) =>fbs("一行文字，会出现在提醒卡片里；最多 100 字，留空不显示。第一次提前提醒会通知所有人，之后的只催还没就位的人。", "guildAdmin.reminderCustomTextHint");
export const guildAdmin_visibilityTitle = (fbs: FbsAPI) =>fbs("可见性", "guildAdmin.visibilityTitle");
export const guildAdmin_devOnlyLabel = (fbs: FbsAPI) =>fbs("仅开发环境可见", "guildAdmin.devOnlyLabel");
export const guildAdmin_eventsTitle = (fbs: FbsAPI) =>fbs("活动管理", "guildAdmin.eventsTitle");
export const guildAdmin_signupCsvSuffix = (fbs: FbsAPI) =>fbs("报名表", "guildAdmin.signupCsvSuffix");
export const guildAdmin_eventEmpty = (fbs: FbsAPI) =>fbs("暂无活动。", "guildAdmin.eventEmpty");
export const guildAdmin_eventTitleLabel = (fbs: FbsAPI) =>fbs("标题", "guildAdmin.eventTitleLabel");
export const guildAdmin_eventTypeLabel = (fbs: FbsAPI) =>fbs("类型", "guildAdmin.eventTypeLabel");
export const guildAdmin_eventStatusLabel = (fbs: FbsAPI) =>fbs("状态", "guildAdmin.eventStatusLabel");
export const guildAdmin_eventTimeLabel = (fbs: FbsAPI) =>fbs("发车时间", "guildAdmin.eventTimeLabel");
export const guildAdmin_eventSlotsLabel = (fbs: FbsAPI) =>fbs("席位上限", "guildAdmin.eventSlotsLabel");
export const guildAdmin_eventMeetLabel = (fbs: FbsAPI) =>fbs("集合信息", "guildAdmin.eventMeetLabel");
export const guildAdmin_eventDescLabel = (fbs: FbsAPI) =>fbs("说明", "guildAdmin.eventDescLabel");
export const guildAdmin_eventDungeonLabel = (fbs: FbsAPI) =>fbs("副本", "guildAdmin.eventDungeonLabel");
export const guildAdmin_statusOpen = (fbs: FbsAPI) =>fbs("开放报名", "guildAdmin.statusOpen");
export const guildAdmin_statusClosed = (fbs: FbsAPI) =>fbs("已截止", "guildAdmin.statusClosed");
export const guildAdmin_statusCompleted = (fbs: FbsAPI) =>fbs("已完成", "guildAdmin.statusCompleted");
export const guildAdmin_statusDraft = (fbs: FbsAPI) =>fbs("草稿", "guildAdmin.statusDraft");
export const guildAdmin_signupsTitle = (fbs: FbsAPI) =>fbs("报名名单", "guildAdmin.signupsTitle");
export const guildAdmin_signupEmpty = (fbs: FbsAPI) =>fbs("暂无报名。", "guildAdmin.signupEmpty");
export const guildAdmin_exportCsvButton = (fbs: FbsAPI) =>fbs("导出 CSV", "guildAdmin.exportCsvButton");
export const guildAdmin_removeSignupButton = (fbs: FbsAPI) =>fbs("移除", "guildAdmin.removeSignupButton");
export const guildAdmin_resultsTitle = (fbs: FbsAPI) =>fbs("竞速成绩", "guildAdmin.resultsTitle");
export const guildAdmin_resultTeamLabel = (fbs: FbsAPI) =>fbs("队伍名", "guildAdmin.resultTeamLabel");
export const guildAdmin_resultMembersLabel = (fbs: FbsAPI) =>fbs("队员（逗号分隔）", "guildAdmin.resultMembersLabel");
export const guildAdmin_resultTimeLabel = (fbs: FbsAPI) =>fbs("用时（如 12:34.567）", "guildAdmin.resultTimeLabel");
export const guildAdmin_resultProofLabel = (fbs: FbsAPI) =>fbs("凭证链接", "guildAdmin.resultProofLabel");
export const guildAdmin_resultNoteLabel = (fbs: FbsAPI) =>fbs("备注", "guildAdmin.resultNoteLabel");
export const guildAdmin_guidesTitle = (fbs: FbsAPI) =>fbs("流派攻略数据（BiS / 循环）", "guildAdmin.guidesTitle");
export const guildAdmin_guidesHint = (fbs: FbsAPI) =>fbs("按流派填写：build 名称、属性行、占比行、BiS（JSON）与循环（JSON）。保存后流派页即时生效。", "guildAdmin.guidesHint");
export const guildAdmin_guideSchoolLabel = (fbs: FbsAPI) =>fbs("流派", "guildAdmin.guideSchoolLabel");
export const guildAdmin_guideBuildLabel = (fbs: FbsAPI) =>fbs("Build 名称", "guildAdmin.guideBuildLabel");
export const guildAdmin_guideAttrLabel = (fbs: FbsAPI) =>fbs("属性行", "guildAdmin.guideAttrLabel");
export const guildAdmin_guideRateLabel = (fbs: FbsAPI) =>fbs("占比行", "guildAdmin.guideRateLabel");
export const guildAdmin_guideBisLabel = (fbs: FbsAPI) =>fbs("BiS（JSON）", "guildAdmin.guideBisLabel");
export const guildAdmin_guideRotationLabel = (fbs: FbsAPI) =>fbs("循环（JSON）", "guildAdmin.guideRotationLabel");
export const guildAdmin_tabStats = (fbs: FbsAPI) =>fbs("统计", "guildAdmin.tabStats");
export const guildAdmin_tabSeason = (fbs: FbsAPI) =>fbs("赛季", "guildAdmin.tabSeason");
export const guildAdmin_seasonTitle = (fbs: FbsAPI) =>fbs("赛季前检查清单", "guildAdmin.seasonTitle");
export const guildAdmin_seasonHint = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["按当前版本 ", fbs.param("version", pv(p, "version")), " 与赛季 ", fbs.param("season", pv(p, "season")), " 自动生成；换季后清单自动重置，逐项复核后勾选。"], "guildAdmin.seasonHint");
export const guildAdmin_seasonProgress = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["已完成 ", fbs.param("done", pv(p, "done")), " / ", fbs.param("total", pv(p, "total"))], "guildAdmin.seasonProgress");
export const guildAdmin_seasonItemDungeonsTitle = (fbs: FbsAPI) =>fbs("复核当前版本副本", "guildAdmin.seasonItemDungeonsTitle");
export const guildAdmin_seasonItemDungeonsDetail = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["当前版本（", fbs.param("version", pv(p, "version")), "）共有 ", fbs.param("count", pv(p, "count")), " 个副本，确认达标要求与攻略已按本赛季更新。"], "guildAdmin.seasonItemDungeonsDetail");
export const guildAdmin_seasonItemTemplatesTitle = (fbs: FbsAPI) =>fbs("复核组队模板", "guildAdmin.seasonItemTemplatesTitle");
export const guildAdmin_seasonItemTemplatesDetail = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["本百业现有 ", fbs.param("count", pv(p, "count")), " 个组队模板，确认模板的副本与人数仍适用于本赛季。"], "guildAdmin.seasonItemTemplatesDetail");
export const guildAdmin_seasonItemGuidesTitle = (fbs: FbsAPI) =>fbs("复核流派攻略数据", "guildAdmin.seasonItemGuidesTitle");
export const guildAdmin_seasonItemGuidesDetail = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["攻略数据现有 ", fbs.param("builds", pv(p, "builds")), " 份 BiS 与 ", fbs.param("rotations", pv(p, "rotations")), " 份循环，确认已按本赛季数值更新。"], "guildAdmin.seasonItemGuidesDetail");
export const guildAdmin_seasonItemRosterTitle = (fbs: FbsAPI) =>fbs("复核成员名册", "guildAdmin.seasonItemRosterTitle");
export const guildAdmin_seasonItemRosterDetail = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["Discord 名册 ", fbs.param("members", pv(p, "members")), " 人，截图名册 ", fbs.param("entries", pv(p, "entries")), " 条；确认成员装备季标与名册均为本赛季最新。"], "guildAdmin.seasonItemRosterDetail");
export const guildAdmin_rosterTitle = (fbs: FbsAPI) =>fbs("成员名册（截图导入）", "guildAdmin.rosterTitle");
export const guildAdmin_rosterHint = (fbs: FbsAPI) =>fbs("上传游戏内成员名单截图，识别出的名字先进入预览，确认后才写入名册。名册只记录游戏内名字，不会改变任何人的 Discord 成员资格。", "guildAdmin.rosterHint");
export const guildAdmin_rosterUpload = (fbs: FbsAPI) =>fbs("上传名单截图", "guildAdmin.rosterUpload");
export const guildAdmin_rosterOcrRunning = (fbs: FbsAPI) =>fbs("识别中…", "guildAdmin.rosterOcrRunning");
export const guildAdmin_rosterPreviewTitle = (fbs: FbsAPI) =>fbs("导入预览", "guildAdmin.rosterPreviewTitle");
export const guildAdmin_rosterConfirm = (fbs: FbsAPI) =>fbs("确认导入", "guildAdmin.rosterConfirm");
export const guildAdmin_rosterEmpty = (fbs: FbsAPI) =>fbs("尚无名册记录，用上方按钮上传名单截图导入。", "guildAdmin.rosterEmpty");
export const guildAdmin_rosterSourceOcr = (fbs: FbsAPI) =>fbs("截图识别", "guildAdmin.rosterSourceOcr");
export const guildAdmin_rosterMatchedMember = (fbs: FbsAPI) =>fbs("已匹配 Discord 成员", "guildAdmin.rosterMatchedMember");
export const guildAdmin_rosterStatusMatched = (fbs: FbsAPI) =>fbs("已匹配", "guildAdmin.rosterStatusMatched");
export const guildAdmin_rosterStatusNew = (fbs: FbsAPI) =>fbs("疑似新名", "guildAdmin.rosterStatusNew");
export const guildAdmin_rosterStatusUnrecognized = (fbs: FbsAPI) =>fbs("无法识别", "guildAdmin.rosterStatusUnrecognized");
export const guildAdmin_rosterImported = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["已导入 ", fbs.param("count", pv(p, "count")), " 条名册记录"], "guildAdmin.rosterImported");
export const guildAdmin_statsTitle = (fbs: FbsAPI) =>fbs("出勤与活跃", "guildAdmin.statsTitle");
export const guildAdmin_statsCurrentWeek = (fbs: FbsAPI) =>fbs("本周", "guildAdmin.statsCurrentWeek");
export const guildAdmin_statsCars = (fbs: FbsAPI) =>fbs("开车", "guildAdmin.statsCars");
export const guildAdmin_statsCompleted = (fbs: FbsAPI) =>fbs("完成", "guildAdmin.statsCompleted");
export const guildAdmin_statsSeats = (fbs: FbsAPI) =>fbs("席位", "guildAdmin.statsSeats");
export const guildAdmin_statsFillRate = (fbs: FbsAPI) =>fbs("满员率", "guildAdmin.statsFillRate");
export const guildAdmin_statsParticipants = (fbs: FbsAPI) =>fbs("参与人数", "guildAdmin.statsParticipants");
export const guildAdmin_statsPerCapita = (fbs: FbsAPI) =>fbs("人均参与", "guildAdmin.statsPerCapita");
export const guildAdmin_statsMembersTitle = (fbs: FbsAPI) =>fbs("成员参与榜 · 近 4 周", "guildAdmin.statsMembersTitle");
export const guildAdmin_statsLeadersTitle = (fbs: FbsAPI) =>fbs("车头榜 · 近 4 周", "guildAdmin.statsLeadersTitle");
export const guildAdmin_statsSeatCount = (fbs: FbsAPI) =>fbs("落座次数", "guildAdmin.statsSeatCount");
export const guildAdmin_statsCarCount = (fbs: FbsAPI) =>fbs("开车数", "guildAdmin.statsCarCount");
export const guildAdmin_statsEmpty = (fbs: FbsAPI) =>fbs("近 4 周暂无组队数据。", "guildAdmin.statsEmpty");
export const guildAdmin_statsBoardEmpty = (fbs: FbsAPI) =>fbs("暂无记录。", "guildAdmin.statsBoardEmpty");
export const guildAdmin_whiteLabelTitle = (fbs: FbsAPI) =>fbs("品牌与分享卡", "guildAdmin.whiteLabelTitle");
export const guildAdmin_hideBrandingLabel = (fbs: FbsAPI) =>fbs("隐藏平台品牌", "guildAdmin.hideBrandingLabel");
export const guildAdmin_hideBrandingHint = (fbs: FbsAPI) =>fbs("开启后，本百业的页面上不再显示平台名称与页脚声明，只呈现百业自己的信息。", "guildAdmin.hideBrandingHint");
export const guildAdmin_ogAccentLabel = (fbs: FbsAPI) =>fbs("分享卡强调色", "guildAdmin.ogAccentLabel");
export const guildAdmin_ogTitleSuffixLabel = (fbs: FbsAPI) =>fbs("分享卡标题后缀", "guildAdmin.ogTitleSuffixLabel");
export const guildAdmin_ogTitleSuffixHint = (fbs: FbsAPI) =>fbs("会接在分享卡的标题后面，如「· 招募中」；最多 30 字，留空不显示。", "guildAdmin.ogTitleSuffixHint");
export const guildAdmin_ogAccentGold = (fbs: FbsAPI) =>fbs("鎏金", "guildAdmin.ogAccentGold");
export const guildAdmin_ogAccentJade = (fbs: FbsAPI) =>fbs("翡翠", "guildAdmin.ogAccentJade");
export const guildAdmin_ogAccentAzure = (fbs: FbsAPI) =>fbs("藏青", "guildAdmin.ogAccentAzure");
export const guildAdmin_ogAccentCinnabar = (fbs: FbsAPI) =>fbs("朱砂", "guildAdmin.ogAccentCinnabar");
export const guildAdmin_ogAccentViolet = (fbs: FbsAPI) =>fbs("紫檀", "guildAdmin.ogAccentViolet");
export const guildAdmin_premiumLockedTitle = (fbs: FbsAPI) =>fbs("开通百业 Premium", "guildAdmin.premiumLockedTitle");
export const guildAdmin_premiumLockedBody = (fbs: FbsAPI) =>fbs("高级发车提醒、出勤统计、品牌与分享卡定制均为 Premium 功能。开通后立即生效，可随时取消。", "guildAdmin.premiumLockedBody");
export const guildAdmin_premiumCheckoutButton = (fbs: FbsAPI) =>fbs("立即开通", "guildAdmin.premiumCheckoutButton");
export const guildAdmin_premiumComingSoon = (fbs: FbsAPI) =>fbs("即将开放", "guildAdmin.premiumComingSoon");
export const guildAdmin_premiumActiveTitle = (fbs: FbsAPI) =>fbs("百业 Premium", "guildAdmin.premiumActiveTitle");
export const guildAdmin_premiumPlanName = (fbs: FbsAPI) =>fbs("Premium", "guildAdmin.premiumPlanName");
export const guildAdmin_premiumSourceStripe = (fbs: FbsAPI) =>fbs("通过 Stripe 订阅", "guildAdmin.premiumSourceStripe");
export const guildAdmin_premiumSourceManual = (fbs: FbsAPI) =>fbs("由平台授予", "guildAdmin.premiumSourceManual");
export const guildAdmin_premiumPeriodEnd = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["当前周期至 ", fbs.param("date", pv(p, "date"))], "guildAdmin.premiumPeriodEnd");
export const guildAdmin_premiumPriceMonth = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("amount", pv(p, "amount")), " / 月"], "guildAdmin.premiumPriceMonth");
export const guildAdmin_premiumPriceYear = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("amount", pv(p, "amount")), " / 年"], "guildAdmin.premiumPriceYear");
export const guildAdmin_billingSuccess = (fbs: FbsAPI) =>fbs("开通成功，Premium 已生效。", "guildAdmin.billingSuccess");
export const guildAdmin_billingCanceled = (fbs: FbsAPI) =>fbs("已取消开通，未产生扣费。", "guildAdmin.billingCanceled");
export const guildAdmin_tabAnnouncements = (fbs: FbsAPI) =>fbs("公告广播", "guildAdmin.tabAnnouncements");
export const announcements_title = (fbs: FbsAPI) =>fbs("百业公告", "announcements.title");
export const announcements_emptyText = (fbs: FbsAPI) =>fbs("暂无公告", "announcements.emptyText");
export const announcements_urgentLabel = (fbs: FbsAPI) =>fbs("紧急集合", "announcements.urgentLabel");
export const announcements_standardLabel = (fbs: FbsAPI) =>fbs("公告", "announcements.standardLabel");
export const announcements_unreadLabel = (fbs: FbsAPI) =>fbs("未读", "announcements.unreadLabel");
export const announcements_readLabel = (fbs: FbsAPI) =>fbs("已读", "announcements.readLabel");
export const announcements_composeTitle = (fbs: FbsAPI) =>fbs("发布公告", "announcements.composeTitle");
export const announcements_kindLabel = (fbs: FbsAPI) =>fbs("类型", "announcements.kindLabel");
export const announcements_kindStandardLabel = (fbs: FbsAPI) =>fbs("普通公告", "announcements.kindStandardLabel");
export const announcements_kindUrgentLabel = (fbs: FbsAPI) =>fbs("紧急集合呼叫", "announcements.kindUrgentLabel");
export const announcements_titleLabel = (fbs: FbsAPI) =>fbs("标题", "announcements.titleLabel");
export const announcements_titlePlaceholder = (fbs: FbsAPI) =>fbs("公告标题", "announcements.titlePlaceholder");
export const announcements_bodyLabel = (fbs: FbsAPI) =>fbs("正文", "announcements.bodyLabel");
export const announcements_bodyPlaceholder = (fbs: FbsAPI) =>fbs("公告正文", "announcements.bodyPlaceholder");
export const announcements_postLabel = (fbs: FbsAPI) =>fbs("发布并推送", "announcements.postLabel");
export const announcements_postingLabel = (fbs: FbsAPI) =>fbs("发布中…", "announcements.postingLabel");
export const announcements_postedText = (fbs: FbsAPI) =>fbs("公告已发布", "announcements.postedText");
export const announcements_deleteLabel = (fbs: FbsAPI) =>fbs("删除", "announcements.deleteLabel");
export const announcements_deleteConfirmTitle = (fbs: FbsAPI) =>fbs("删除这条公告？", "announcements.deleteConfirmTitle");
export const announcements_deleteConfirmMessage = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["确定要删除公告「", fbs.param("title", pv(p, "title")), "」吗？已读记录会一并删除。"], "announcements.deleteConfirmMessage");
export const announcements_deletedText = (fbs: FbsAPI) =>fbs("公告已删除", "announcements.deletedText");
export const announcements_receiptsTitle = (fbs: FbsAPI) =>fbs("阅读情况", "announcements.receiptsTitle");
export const announcements_readCountTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["已读 ", fbs.param("read", pv(p, "read")), " / ", fbs.param("total", pv(p, "total"))], "announcements.readCountTemplate");
export const announcements_readListLabel = (fbs: FbsAPI) =>fbs("已读成员", "announcements.readListLabel");
export const announcements_unreadListLabel = (fbs: FbsAPI) =>fbs("未读成员", "announcements.unreadListLabel");
export const announcements_authorTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("name", pv(p, "name")), " 发布"], "announcements.authorTemplate");
export const announcements_pushNote = (fbs: FbsAPI) =>fbs("发布后会向全体成员推送通知；没有开启推送的成员也能在这里看到。", "announcements.pushNote");
export const announcements_urgentNote = (fbs: FbsAPI) =>fbs("紧急集合呼叫请只用于临时集合等紧急情况，每天最多 2 次。", "announcements.urgentNote");
export const announcements_dailyLimitTemplate = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["今日还可发布 ", fbs.param("remaining", pv(p, "remaining")), " 条"], "announcements.dailyLimitTemplate");
export const guildAdmin_tabTools = (fbs: FbsAPI) =>fbs("活动工具", "guildAdmin.tabTools");
export const guildAdmin_lotteryTitle = (fbs: FbsAPI) =>fbs("活动抽奖", "guildAdmin.lotteryTitle");
export const guildAdmin_lotteryHint = (fbs: FbsAPI) =>fbs("参与名单可来自某辆车的参与者，或手选本百业成员；名单与权重在创建时定格。开奖按权重随机抽取，同一抽奖内不会重复中奖；抽奖、名单、权重与结果全部留痕可查。", "guildAdmin.lotteryHint");
export const guildAdmin_lotteryEmpty = (fbs: FbsAPI) =>fbs("还没有抽奖，先创建一个。", "guildAdmin.lotteryEmpty");
export const guildAdmin_lotteryNameLabel = (fbs: FbsAPI) =>fbs("抽奖标题", "guildAdmin.lotteryNameLabel");
export const guildAdmin_lotteryPrizeLabel = (fbs: FbsAPI) =>fbs("奖品 / 奖池", "guildAdmin.lotteryPrizeLabel");
export const guildAdmin_lotterySourceLabel = (fbs: FbsAPI) =>fbs("参与名单来源", "guildAdmin.lotterySourceLabel");
export const guildAdmin_lotterySourceGrouping = (fbs: FbsAPI) =>fbs("某辆车的参与者", "guildAdmin.lotterySourceGrouping");
export const guildAdmin_lotterySourceMembers = (fbs: FbsAPI) =>fbs("手选百业成员", "guildAdmin.lotterySourceMembers");
export const guildAdmin_lotteryGroupingLabel = (fbs: FbsAPI) =>fbs("选择车队", "guildAdmin.lotteryGroupingLabel");
export const guildAdmin_lotteryWinnerCountLabel = (fbs: FbsAPI) =>fbs("中奖人数", "guildAdmin.lotteryWinnerCountLabel");
export const guildAdmin_lotteryUniformWeightLabel = (fbs: FbsAPI) =>fbs("统一权重", "guildAdmin.lotteryUniformWeightLabel");
export const guildAdmin_lotteryWeightLabel = (fbs: FbsAPI) =>fbs("权重", "guildAdmin.lotteryWeightLabel");
export const guildAdmin_lotteryEntriesLabel = (fbs: FbsAPI) =>fbs("参与名单", "guildAdmin.lotteryEntriesLabel");
export const guildAdmin_lotteryWinnersLabel = (fbs: FbsAPI) =>fbs("中奖名单", "guildAdmin.lotteryWinnersLabel");
export const guildAdmin_lotteryCreateButton = (fbs: FbsAPI) =>fbs("创建抽奖", "guildAdmin.lotteryCreateButton");
export const guildAdmin_lotteryDrawButton = (fbs: FbsAPI) =>fbs("开奖", "guildAdmin.lotteryDrawButton");
export const guildAdmin_lotteryStatusOpen = (fbs: FbsAPI) =>fbs("待开奖", "guildAdmin.lotteryStatusOpen");
export const guildAdmin_lotteryStatusDrawn = (fbs: FbsAPI) =>fbs("已开奖", "guildAdmin.lotteryStatusDrawn");
export const guildAdmin_lotteryEntryCount = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("count", pv(p, "count")), " 人参与"], "guildAdmin.lotteryEntryCount");
