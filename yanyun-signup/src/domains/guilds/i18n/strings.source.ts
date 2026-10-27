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
export const guildAdmin_subdomainTitle = (fbs: FbsAPI) =>fbs("平台子域", "guildAdmin.subdomainTitle");
export const guildAdmin_subdomainLabel = (fbs: FbsAPI) =>fbs("启用专属子域", "guildAdmin.subdomainLabel");
export const guildAdmin_subdomainAddressLabel = (fbs: FbsAPI) =>fbs("子域地址", "guildAdmin.subdomainAddressLabel");
export const guildAdmin_subdomainCallbackLabel = (fbs: FbsAPI) =>fbs("登录回调地址", "guildAdmin.subdomainCallbackLabel");
export const guildAdmin_subdomainNote = (fbs: FbsAPI) =>fbs("开启后，成员可通过上方子域地址访问本百业。注意：子域上的 Discord 登录需要站长先在 Discord 开发者后台为该子域登记登录回调（地址见上方）；登记完成前，子域可以打开浏览，但无法在子域上完成登录。", "guildAdmin.subdomainNote");
