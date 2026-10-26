/* fbtee 声明面 (人工维护): 全部 UI 文案的源声明, 一条 = 一个 fbs 调用。
 * - desc 即 'section.field', 与旧手搓目录的键一一对应 (唯一且稳定, 是翻译的锚)。
 * - 源语言 zh-CN; 其余 locale 的译文在 ./translations/*.json (fbtee 格式)。
 * - 带参条目用「字面分段 + fbs.param」形态 (fbtee 编译器要求), 参数编组 pv():
 *   未传参 -> 字面量 '{name}' (复现旧 translate 的占位符保留行为); 其余 String(v)
 *   (复现旧替换口径, 且绕开 fbtee 对 number 的 Intl 格式化)。
 * - fbtee 收集时会 trim 源文首尾空白: 带首尾空白的条目 (仅 boss.talentPending)
 *   把空白放在 fbs 调用外拼接, 其译文在 translations 里同样存 trim 后的文本。
 * 改文案后必须重跑: node scripts/i18n-codegen.mjs (生成 strings.ts / catalogs /
 * catalog.ts), --check 已进 CI。生成物勿手改。
 */
import type { FbsAPI } from 'fbtee/server';

export type StringParams = Record<string, unknown>;

function pv(p: StringParams | undefined, name: string): string {
  const v = p ? p[name] : undefined;
  return v === undefined ? '{' + name + '}' : String(v);
}

export const common_cancel = (fbs: FbsAPI) =>fbs("取消", "common.cancel");
export const common_confirm = (fbs: FbsAPI) =>fbs("确定", "common.confirm");
export const common_unknownError = (fbs: FbsAPI) =>fbs("未知错误", "common.unknownError");
export const common_renderError = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["渲染出错: ", fbs.param("message", pv(p, "message"))], "common.renderError");
export const common_renderErrorHint = (fbs: FbsAPI) =>fbs("这一页出了问题，其他页面不受影响。", "common.renderErrorHint");
export const common_backToHub = (fbs: FbsAPI) =>fbs("返回百业集结", "common.backToHub");
export const common_loadingGuild = (fbs: FbsAPI) =>fbs("正在展开百业…", "common.loadingGuild");
export const common_close = (fbs: FbsAPI) =>fbs("关闭", "common.close");
export const site_title = (fbs: FbsAPI) =>fbs("百业集结", "site.title");
export const site_subtitle = (fbs: FbsAPI) =>fbs("燕云十六声 · 国际服百业车队与攻略集散地 —— 择一业而入，共赴双十。", "site.subtitle");
export const site_heroAlt = (fbs: FbsAPI) =>fbs("水墨山水", "site.heroAlt");
export const login_cardTitle = (fbs: FbsAPI) =>fbs("先登录，再入江湖", "login.cardTitle");
export const login_cardBody1 = (fbs: FbsAPI) =>fbs("本站需用 Discord 账号认证后使用。", "login.cardBody1");
export const login_cardBody2 = (fbs: FbsAPI) =>fbs("登录后将按你所在的 Discord 服务器，展示你有权限访问的百业。", "login.cardBody2");
export const login_button = (fbs: FbsAPI) =>fbs("用 Discord 登录", "login.button");
export const login_privacy = (fbs: FbsAPI) =>fbs("我们会读取并保存你的 Discord 昵称、头像、服务器列表与登录授权，用于成员校验与提醒功能，详见隐私政策", "login.privacy");
export const userBar_logout = (fbs: FbsAPI) =>fbs("退出登录", "userBar.logout");
export const userBar_loggingOut = (fbs: FbsAPI) =>fbs("退出中…", "userBar.loggingOut");
export const userBar_settings = (fbs: FbsAPI) =>fbs("个人资料", "userBar.settings");
export const settings_title = (fbs: FbsAPI) =>fbs("个人资料", "settings.title");
export const settings_discordLabel = (fbs: FbsAPI) =>fbs("Discord 账号", "settings.discordLabel");
export const settings_languageLabel = (fbs: FbsAPI) =>fbs("语言", "settings.languageLabel");
export const settings_languageHint = (fbs: FbsAPI) =>fbs("界面语言。选择「自动」时跟随浏览器语言；手动选择后保存在你的账号里，压过浏览器语言。", "settings.languageHint");
export const settings_autoLabel = (fbs: FbsAPI) =>fbs("自动（跟随浏览器）", "settings.autoLabel");
export const settings_langZhCn = (fbs: FbsAPI) =>fbs("简体中文", "settings.langZhCn");
export const settings_langZhTw = (fbs: FbsAPI) =>fbs("繁體中文", "settings.langZhTw");
export const settings_langEn = (fbs: FbsAPI) =>fbs("English", "settings.langEn");
export const settings_langEs = (fbs: FbsAPI) =>fbs("Español", "settings.langEs");
export const settings_langFr = (fbs: FbsAPI) =>fbs("Français", "settings.langFr");
export const settings_savedText = (fbs: FbsAPI) =>fbs("已保存", "settings.savedText");
export const picker_myGuilds = (fbs: FbsAPI) =>fbs("我的百业", "picker.myGuilds");
export const picker_myGuildsEn = (fbs: FbsAPI) =>fbs("My Guilds", "picker.myGuildsEn");
export const picker_publicGuilds = (fbs: FbsAPI) =>fbs("公开百业", "picker.publicGuilds");
export const picker_publicGuildsEn = (fbs: FbsAPI) =>fbs("Public · Read Only", "picker.publicGuildsEn");
export const picker_readOnlyBadge = (fbs: FbsAPI) =>fbs("只读", "picker.readOnlyBadge");
export const picker_emptyTitle = (fbs: FbsAPI) =>fbs("你还没有可用的百业", "picker.emptyTitle");
export const picker_emptyBody = (fbs: FbsAPI) =>fbs("百业按 Discord 服务器划分：你所在的服务器若已绑定百业，它会出现在这里。若还没有，你可以把自己管理的服务器绑成一个新百业。", "picker.emptyBody");
export const picker_createGuild = (fbs: FbsAPI) =>fbs("创建百业", "picker.createGuild");
export const picker_createGuildMore = (fbs: FbsAPI) =>fbs("+ 创建新百业", "picker.createGuildMore");
export const create_backLink = (fbs: FbsAPI) =>fbs("‹ 我的百业", "create.backLink");
export const create_title = (fbs: FbsAPI) =>fbs("创建百业", "create.title");
export const create_subtitle = (fbs: FbsAPI) =>fbs("绑定一个你管理的 Discord 服务器 —— 之后只有该服务器的成员能看到并使用这个百业。", "create.subtitle");
export const create_nameLabel = (fbs: FbsAPI) =>fbs("百业名", "create.nameLabel");
export const create_namePlaceholder = (fbs: FbsAPI) =>fbs("如：叽哩呱啦", "create.namePlaceholder");
export const create_slugLabel = (fbs: FbsAPI) =>fbs("访问标识 slug（网址后缀，只能小写字母 / 数字 / 连字符）", "create.slugLabel");
export const create_slugPlaceholder = (fbs: FbsAPI) =>fbs("如：my-guild", "create.slugPlaceholder");
export const create_slugChecking = (fbs: FbsAPI) =>fbs("检查中…", "create.slugChecking");
export const create_slugAvailable = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["✓ yanyun.app/", fbs.param("slug", pv(p, "slug")), " 可用"], "create.slugAvailable");
export const create_slugTaken = (fbs: FbsAPI) =>fbs("✗ 已被占用或不符合规则", "create.slugTaken");
export const create_slugNote = (fbs: FbsAPI) =>fbs("创建后不可更改", "create.slugNote");
export const create_serverLabel = (fbs: FbsAPI) =>fbs("绑定 Discord 服务器（仅列出你有管理权限的）", "create.serverLabel");
export const create_noServers1 = (fbs: FbsAPI) =>fbs("你还没有任何可管理的 Discord 服务器。", "create.noServers1");
export const create_noServers2 = (fbs: FbsAPI) =>fbs("先在 Discord 里建一个服务器（或拿到管理员权限），重新登录刷新列表后再来创建。", "create.noServers2");
export const create_submit = (fbs: FbsAPI) =>fbs("创建百业", "create.submit");
export const create_submitting = (fbs: FbsAPI) =>fbs("创建中…", "create.submitting");
export const create_toastNameShort = (fbs: FbsAPI) =>fbs("百业名至少 2 个字", "create.toastNameShort");
export const create_toastSlugRequired = (fbs: FbsAPI) =>fbs("请填写访问标识 slug", "create.toastSlugRequired");
export const create_toastSlugBad = (fbs: FbsAPI) =>fbs("这个 slug 不可用，换一个", "create.toastSlugBad");
export const create_toastServerRequired = (fbs: FbsAPI) =>fbs("请选择要绑定的 Discord 服务器", "create.toastServerRequired");
export const create_toastCreated = (fbs: FbsAPI) =>fbs("百业创建成功", "create.toastCreated");
export const create_toastFailed = (fbs: FbsAPI) =>fbs("创建失败，请稍后再试", "create.toastFailed");
export const locked_backLink = (fbs: FbsAPI) =>fbs("‹ 我的百业", "locked.backLink");
export const locked_title = (fbs: FbsAPI) =>fbs("无权访问这个百业", "locked.title");
export const locked_body1 = (fbs: FbsAPI) =>fbs("该百业不存在，或仅对某个 Discord 服务器的成员开放。", "locked.body1");
export const locked_body2 = (fbs: FbsAPI) =>fbs("加入对应的 Discord 服务器后，用同一个账号登录即可访问。", "locked.body2");
export const locked_backButton = (fbs: FbsAPI) =>fbs("回到我的百业", "locked.backButton");
export const guildHome_backToHub = (fbs: FbsAPI) =>fbs("← 百业集结", "guildHome.backToHub");
export const guildHome_tabTeam = (fbs: FbsAPI) =>fbs("组队", "guildHome.tabTeam");
export const guildHome_tabDex = (fbs: FbsAPI) =>fbs("攻略", "guildHome.tabDex");
export const guildHome_tabSect = (fbs: FbsAPI) =>fbs("流派攻略", "guildHome.tabSect");
export const guildHome_readOnlyBanner = (fbs: FbsAPI) =>fbs("该百业尚未绑定 Discord 服务器 · 只读浏览", "guildHome.readOnlyBanner");
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
export const appBlocks_rosterTitle = (fbs: FbsAPI) =>fbs("队伍名册", "appBlocks.rosterTitle");
export const appBlocks_closedStatus = (fbs: FbsAPI) =>fbs("已关闭", "appBlocks.closedStatus");
export const appBlocks_completedStatus = (fbs: FbsAPI) =>fbs("已完成", "appBlocks.completedStatus");
export const appBlocks_unknownBlock = (fbs: FbsAPI) =>fbs("该内容需要更新 App 后显示", "appBlocks.unknownBlock");
export const dex_backToDex = (fbs: FbsAPI) =>fbs("‹ 返回攻略", "dex.backToDex");
export const dex_bossesLine = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("count", pv(p, "count")), " 位首领"], "dex.bossesLine");
export const dex_noBossData = (fbs: FbsAPI) =>fbs("暂无 Boss 数据", "dex.noBossData");
export const dex_empty = (fbs: FbsAPI) =>fbs("暂无攻略", "dex.empty");
export const dex_currentGuides = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["当期攻略 · ", fbs.param("category", pv(p, "category"))], "dex.currentGuides");
export const dex_catSub = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("season", pv(p, "season")), " · ", fbs.param("seasonName", pv(p, "seasonName"))], "dex.catSub");
export const dex_catSubCurrent = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("season", pv(p, "season")), " · ", fbs.param("seasonName", pv(p, "seasonName")), " · 版本 ", fbs.param("version", pv(p, "version"))], "dex.catSubCurrent");
export const dex_size10 = (fbs: FbsAPI) =>fbs("十人本", "dex.size10");
export const dex_size5 = (fbs: FbsAPI) =>fbs("五人本", "dex.size5");
export const dex_sizeN = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("n", pv(p, "n")), "人本"], "dex.sizeN");
export const dex_bossUnit = (fbs: FbsAPI) =>fbs("首领", "dex.bossUnit");
export const dex_partMechanics = (fbs: FbsAPI) =>fbs("机制", "dex.partMechanics");
export const dex_partShouts = (fbs: FbsAPI) =>fbs("喊话", "dex.partShouts");
export const dex_partTalents = (fbs: FbsAPI) =>fbs("天赋", "dex.partTalents");
export const dex_labelAll = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("count", pv(p, "count")), "位首领 · ", fbs.param("parts", pv(p, "parts")), "俱全"], "dex.labelAll");
export const dex_labelParts = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("count", pv(p, "count")), "位首领 · ", fbs.param("parts", pv(p, "parts"))], "dex.labelParts");
export const dex_labelPending = (fbs: FbsAPI, p?: StringParams) =>
  fbs([fbs.param("count", pv(p, "count")), "位首领 · 攻略待补"], "dex.labelPending");
export const dex_labelNoBosses = (fbs: FbsAPI) =>fbs("首领待补", "dex.labelNoBosses");
export const dex_sealBoss = (fbs: FbsAPI) =>fbs("将", "dex.sealBoss");
export const boss_back = (fbs: FbsAPI) =>fbs("‹ 返回", "boss.back");
export const boss_notFound = (fbs: FbsAPI) =>fbs("Boss 不存在", "boss.notFound");
export const boss_tabMechanics = (fbs: FbsAPI) =>fbs("机制", "boss.tabMechanics");
export const boss_tabTalents = (fbs: FbsAPI) =>fbs("天赋", "boss.tabTalents");
export const boss_shoutsTitle = (fbs: FbsAPI) =>fbs("📢 喊话宏", "boss.shoutsTitle");
export const boss_copy = (fbs: FbsAPI) =>fbs("复制", "boss.copy");
export const boss_shoutCopied = (fbs: FbsAPI) =>fbs("喊话已复制", "boss.shoutCopied");
export const boss_copyFailed = (fbs: FbsAPI) =>fbs("复制失败", "boss.copyFailed");
export const boss_copyManual = (fbs: FbsAPI) =>fbs("请手动复制", "boss.copyManual");
export const boss_noMechanics = (fbs: FbsAPI) =>fbs("暂无机制", "boss.noMechanics");
export const boss_noTalents = (fbs: FbsAPI) =>fbs("暂无天赋", "boss.noTalents");
export const boss_talentTitle = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["天赋 ", fbs.param("code", pv(p, "code"))], "boss.talentTitle");
export const boss_talentPending = (fbs: FbsAPI) =>" " + fbs("· 待确认", "boss.talentPending");
export const sect_empty = (fbs: FbsAPI) =>fbs("暂无流派", "sect.empty");
export const sect_back = (fbs: FbsAPI) =>fbs("‹ 返回流派", "sect.back");
export const sect_tabBis = (fbs: FbsAPI) =>fbs("毕业词条", "sect.tabBis");
export const sect_tabRotation = (fbs: FbsAPI) =>fbs("输出轴", "sect.tabRotation");
export const sect_tabRates = (fbs: FbsAPI) =>fbs("三率目标", "sect.tabRates");
export const sect_tabTiaolv = (fbs: FbsAPI) =>fbs("调律推演", "sect.tabTiaolv");
export const sect_tabGrad = (fbs: FbsAPI) =>fbs("武库鉴宝", "sect.tabGrad");
export const sect_noBis = (fbs: FbsAPI) =>fbs("暂无毕业词条", "sect.noBis");
export const sect_noRotation = (fbs: FbsAPI) =>fbs("暂无输出轴", "sect.noRotation");
export const sect_noRates = (fbs: FbsAPI) =>fbs("暂无三率目标", "sect.noRates");
export const sect_rotGreydust = (fbs: FbsAPI) =>fbs("一分钟木桩轴", "sect.rotGreydust");
export const sect_rotOpener = (fbs: FbsAPI) =>fbs("起手", "sect.rotOpener");
export const sect_rotLoop = (fbs: FbsAPI) =>fbs("循环", "sect.rotLoop");
export const sect_rotKeyPoints = (fbs: FbsAPI) =>fbs("要点", "sect.rotKeyPoints");
export const sect_rotInnerSkills = (fbs: FbsAPI) =>fbs("心法", "sect.rotInnerSkills");
export const sect_rotVideo = (fbs: FbsAPI) =>fbs("视频攻略", "sect.rotVideo");
export const sect_rateAccuracy = (fbs: FbsAPI) =>fbs("精准", "sect.rateAccuracy");
export const sect_rateCrit = (fbs: FbsAPI) =>fbs("会心", "sect.rateCrit");
export const sect_rateCritDamage = (fbs: FbsAPI) =>fbs("会意", "sect.rateCritDamage");
export const sect_bisMainWeapon = (fbs: FbsAPI) =>fbs("主武器", "sect.bisMainWeapon");
export const sect_bisOffWeapon = (fbs: FbsAPI) =>fbs("副武器", "sect.bisOffWeapon");
export const sect_bisAccessories = (fbs: FbsAPI) =>fbs("环佩", "sect.bisAccessories");
export const sect_bisHeadBody = (fbs: FbsAPI) =>fbs("头衣", "sect.bisHeadBody");
export const sect_bisLegsWrists = (fbs: FbsAPI) =>fbs("腿腕", "sect.bisLegsWrists");
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
export const legal_termsTitle = (fbs: FbsAPI) =>fbs("服务条款", "legal.termsTitle");
export const legal_privacyTitle = (fbs: FbsAPI) =>fbs("隐私政策", "legal.privacyTitle");
export const legal_termsLink = (fbs: FbsAPI) =>fbs("服务条款", "legal.termsLink");
export const legal_privacyLink = (fbs: FbsAPI) =>fbs("隐私政策", "legal.privacyLink");
export const legal_updatedText = (fbs: FbsAPI) =>fbs("最后更新：2026 年 10 月 25 日", "legal.updatedText");
export const legal_disclaimer = (fbs: FbsAPI) =>fbs("本站为玩家自发维护的非官方工具，与《燕云十六声》及其开发、发行方无隶属或背书关系；游戏名称与相关素材的权利归其各自权利方所有。", "legal.disclaimer");
export const termsBody_s1h = (fbs: FbsAPI) =>fbs("关于本站与非官方声明", "termsBody.s1h");
export const termsBody_s1b = (fbs: FbsAPI) =>fbs("燕云百业（yanyun.app）是一个由玩家自发维护的非官方百业（公会）组队工具，与《燕云十六声》及其开发、发行方没有任何隶属或背书关系。本站中出现的游戏名称、副本、流派等资料，其权利归各自权利方所有。", "termsBody.s1b");
export const termsBody_s2h = (fbs: FbsAPI) =>fbs("账号与访问", "termsBody.s2h");
export const termsBody_s2b = (fbs: FbsAPI) =>fbs("本站通过 Discord OAuth 登录。使用本站即表示你同意本条款。你应妥善保管自己的 Discord 账号，通过你的账号进行的操作视为你本人行为。各百业内容的可见与可写范围，由你是否属于该百业绑定的 Discord 服务器决定。", "termsBody.s2b");
export const termsBody_s3h = (fbs: FbsAPI) =>fbs("使用规范", "termsBody.s3h");
export const termsBody_s3b = (fbs: FbsAPI) =>fbs("不得利用本站冒充他人或其它百业、抢注或占用与你无关的百业标识、发布违法或侵权内容、干扰本站运行，或绕过成员校验。车队标题、报名昵称等由用户发布的内容，由发布者自行负责。", "termsBody.s3b");
export const termsBody_s4h = (fbs: FbsAPI) =>fbs("服务现状", "termsBody.s4h");
export const termsBody_s4b = (fbs: FbsAPI) =>fbs("本站目前免费提供，并按现状（as is）运行。我们不承诺服务持续可用、功能保持不变，或数据永不丢失；功能可能被调整、中断或终止，原则上不另行通知。重要数据请自行留存备份。", "termsBody.s4b");
export const termsBody_s5h = (fbs: FbsAPI) =>fbs("责任限制", "termsBody.s5h");
export const termsBody_s5b = (fbs: FbsAPI) =>fbs("在适用法律允许的最大范围内，本站对因使用或无法使用本站而产生的间接、附带或后果性损失不承担责任。", "termsBody.s5b");
export const termsBody_s6h = (fbs: FbsAPI) =>fbs("条款变更", "termsBody.s6h");
export const termsBody_s6b = (fbs: FbsAPI) =>fbs("本条款可能不时更新，更新后的版本在本站公布即生效；你继续使用本站即视为接受更新后的条款。", "termsBody.s6b");
export const privacyBody_s1h = (fbs: FbsAPI) =>fbs("我们收集的信息", "privacyBody.s1h");
export const privacyBody_s1b = (fbs: FbsAPI) =>fbs("当你使用 Discord 登录时，我们会读取并保存：你的 Discord 用户 ID、用户名与头像、你加入的 Discord 服务器列表、你在这些服务器中的昵称，以及用于保持登录状态的 OAuth 授权凭据（refresh token）。你在使用本站过程中产生的数据也会被保存，包括百业名册记录、车队与报名记录（包括座位上的身份标识）、装备库与配装方案、语言偏好，以及你在移动端开启通知后注册的推送令牌。", "privacyBody.s1b");
export const privacyBody_s2h = (fbs: FbsAPI) =>fbs("我们如何使用信息", "privacyBody.s2h");
export const privacyBody_s2b = (fbs: FbsAPI) =>fbs("上述信息仅用于：登录与身份识别；校验你是否为某百业所绑定 Discord 服务器的成员；组队报名；发车提醒与应用推送；传家宝达成推送；以及按你的偏好显示语言。我们不出售你的个人数据，也不将其用于广告投放。", "privacyBody.s2b");
export const privacyBody_s3h = (fbs: FbsAPI) =>fbs("信息的共享与第三方", "privacyBody.s3h");
export const privacyBody_s3b = (fbs: FbsAPI) =>fbs("本站运行在 Cloudflare 的基础设施上，数据存储于其数据库服务；登录与成员校验由 Discord 提供；移动端推送经 Expo 推送服务转发至 Apple 或 Google 的推送通道。发车提醒与传家宝消息会发送到对应百业管理员配置的 Discord 频道，消息中会包含你的游戏昵称。除上述功能所必需的情形外，我们不会向其他第三方提供你的个人数据（法律法规要求除外）。", "privacyBody.s3b");
export const privacyBody_s4h = (fbs: FbsAPI) =>fbs("保存期限", "privacyBody.s4h");
export const privacyBody_s4b = (fbs: FbsAPI) =>fbs("你的数据保存在本站数据库中，直至你申请删除，或相关数据对本站功能不再需要为止。报名、车队等历史记录目前会持续保留；如保存规则发生变化，我们会更新本政策。", "privacyBody.s4b");
export const privacyBody_s5h = (fbs: FbsAPI) =>fbs("你的权利", "privacyBody.s5h");
export const privacyBody_s5b = (fbs: FbsAPI) =>fbs("你可以申请查询、更正或删除你的个人数据。目前本站尚未提供自助注销功能，请通过下方联系渠道提出申请，我们会在合理期限内处理。你也可以随时在 Discord 的设置中断开本站的授权；授权失效后，你在本站的会话会自动作废。", "privacyBody.s5b");
export const privacyBody_s6h = (fbs: FbsAPI) =>fbs("联系我们", "privacyBody.s6h");
export const privacyBody_s6b = (fbs: FbsAPI) =>fbs("如对本政策有疑问，或需提出查询、更正、删除申请，请通过本站社区百业「叽哩呱啦」的 Discord 服务器联系管理员。我们会先核实你的 Discord 账号身份，再处理你的申请。", "privacyBody.s6b");
export const errors_rateLimited = (fbs: FbsAPI) =>fbs("操作过于频繁, 请稍后再试", "errors.rateLimited");
export const errors_createRateLimited = (fbs: FbsAPI) =>fbs("创建太频繁, 请稍后再试", "errors.createRateLimited");
export const errors_guildNotFound = (fbs: FbsAPI) =>fbs("百业不存在", "errors.guildNotFound");
export const errors_gearNotFound = (fbs: FbsAPI) =>fbs("装备不存在或不属于你", "errors.gearNotFound");
export const errors_gearEmptyBuild = (fbs: FbsAPI) =>fbs("搭配为空", "errors.gearEmptyBuild");
export const errors_loginRequired = (fbs: FbsAPI) =>fbs("请先登录 Discord 后再操作", "errors.loginRequired");
export const errors_loginRequiredShort = (fbs: FbsAPI) =>fbs("请先登录 Discord", "errors.loginRequiredShort");
export const errors_localeUnsupported = (fbs: FbsAPI) =>fbs("不支持的语言", "errors.localeUnsupported");
export const errors_pushTokenInvalid = (fbs: FbsAPI) =>fbs("推送令牌无效", "errors.pushTokenInvalid");
export const errors_guildUnboundWrite = (fbs: FbsAPI) =>fbs("该百业尚未绑定 Discord 服务器，写功能已锁定", "errors.guildUnboundWrite");
export const errors_memberOnly = (fbs: FbsAPI) =>fbs("只有该百业 Discord 服务器的成员可以操作", "errors.memberOnly");
export const errors_memberOnlyView = (fbs: FbsAPI) =>fbs("该百业仅对 Discord 服务器成员开放", "errors.memberOnlyView");
export const errors_titleRequired = (fbs: FbsAPI) =>fbs("请填写标题", "errors.titleRequired");
export const errors_badStartTime = (fbs: FbsAPI) =>fbs("请选择有效的出发时间", "errors.badStartTime");
export const errors_startTimeTooFar = (fbs: FbsAPI) =>fbs("出发时间不能超过 60 天后", "errors.startTimeTooFar");
export const errors_groupingNotFound = (fbs: FbsAPI) =>fbs("组队不存在", "errors.groupingNotFound");
export const errors_officialEvent = (fbs: FbsAPI) =>fbs("官方活动请联系管理员", "errors.officialEvent");
export const errors_noCreatorRecorded = (fbs: FbsAPI) =>fbs("该车队未记录车头，无法解散，请联系管理员处理", "errors.noCreatorRecorded");
export const errors_leaderOnlyDisband = (fbs: FbsAPI) =>fbs("只有车头可以解散车队", "errors.leaderOnlyDisband");
export const errors_noCreatorRecordedEdit = (fbs: FbsAPI) =>fbs("该车队未记录车头，无法编辑，请联系管理员处理", "errors.noCreatorRecordedEdit");
export const errors_leaderOnlyEdit = (fbs: FbsAPI) =>fbs("只有车头可以编辑车队", "errors.leaderOnlyEdit");
export const errors_noCreatorRecordedComplete = (fbs: FbsAPI) =>fbs("该车队未记录车头，无法完成，请联系管理员处理", "errors.noCreatorRecordedComplete");
export const errors_leaderOnlyComplete = (fbs: FbsAPI) =>fbs("只有车头可以完成车队", "errors.leaderOnlyComplete");
export const errors_noCreatorRecordedReopen = (fbs: FbsAPI) =>fbs("该车队未记录车头，无法恢复，请联系管理员处理", "errors.noCreatorRecordedReopen");
export const errors_leaderOnlyReopen = (fbs: FbsAPI) =>fbs("只有车头可以恢复车队", "errors.leaderOnlyReopen");
export const errors_groupingAlreadyCompleted = (fbs: FbsAPI) =>fbs("该车队已是完成状态", "errors.groupingAlreadyCompleted");
export const errors_groupingNotCompleted = (fbs: FbsAPI) =>fbs("该车队尚未完成", "errors.groupingNotCompleted");
export const errors_groupingClosed = (fbs: FbsAPI) =>fbs("该组队已截止报名", "errors.groupingClosed");
export const errors_nicknameRequired = (fbs: FbsAPI) =>fbs("请填写游戏昵称", "errors.nicknameRequired");
export const errors_proxyTargetNotInRoster = (fbs: FbsAPI) =>fbs("所选成员不在本百业名册中", "errors.proxyTargetNotInRoster");
export const errors_groupingFull = (fbs: FbsAPI) =>fbs("名额已满或报名已截止", "errors.groupingFull");
export const errors_lastSeatHealer = (fbs: FbsAPI) =>fbs("最后一个名额需要奶", "errors.lastSeatHealer");
export const errors_alreadyJoined = (fbs: FbsAPI) =>fbs("已报过名", "errors.alreadyJoined");
export const errors_seatNotFound = (fbs: FbsAPI) =>fbs("未找到该报名", "errors.seatNotFound");
export const errors_paramsIncomplete = (fbs: FbsAPI) =>fbs("参数不完整", "errors.paramsIncomplete");
export const errors_bossNotFound = (fbs: FbsAPI) =>fbs("首领不存在", "errors.bossNotFound");
export const errors_guildNameShort = (fbs: FbsAPI) =>fbs("百业名称至少 2 个字", "errors.guildNameShort");
export const errors_avatarTooLarge = (fbs: FbsAPI) =>fbs("头像图片不能超过 400KB", "errors.avatarTooLarge");
export const errors_avatarBadType = (fbs: FbsAPI) =>fbs("头像只支持 PNG、JPEG 或 WebP 图片", "errors.avatarBadType");
export const errors_avatarEmpty = (fbs: FbsAPI) =>fbs("没有收到图片数据", "errors.avatarEmpty");
export const errors_slugInvalid = (fbs: FbsAPI) =>fbs("站点地址只能用小写字母/数字/连字符, 2-40 位", "errors.slugInvalid");
export const errors_slugReserved = (fbs: FbsAPI) =>fbs("该地址为保留字, 请换一个", "errors.slugReserved");
export const errors_slugTaken = (fbs: FbsAPI) =>fbs("该地址已被占用, 请换一个", "errors.slugTaken");
export const errors_serverRequired = (fbs: FbsAPI) =>fbs("请选择要绑定的 Discord 服务器", "errors.serverRequired");
export const errors_notInServer = (fbs: FbsAPI) =>fbs("你不在这个 Discord 服务器中", "errors.notInServer");
export const errors_cannotManageServer = (fbs: FbsAPI) =>fbs("你需要在该 Discord 服务器拥有管理员或「管理服务器」权限才能绑定它", "errors.cannotManageServer");
export const errors_generic = (fbs: FbsAPI) =>fbs("操作失败，请稍后再试", "errors.generic");
export const STRING_FNS: Record<string, (fbs: FbsAPI, p?: StringParams) => string> = {
  "common.cancel": common_cancel,
  "common.confirm": common_confirm,
  "common.unknownError": common_unknownError,
  "common.renderError": common_renderError,
  "common.renderErrorHint": common_renderErrorHint,
  "common.backToHub": common_backToHub,
  "common.loadingGuild": common_loadingGuild,
  "common.close": common_close,
  "site.title": site_title,
  "site.subtitle": site_subtitle,
  "site.heroAlt": site_heroAlt,
  "login.cardTitle": login_cardTitle,
  "login.cardBody1": login_cardBody1,
  "login.cardBody2": login_cardBody2,
  "login.button": login_button,
  "login.privacy": login_privacy,
  "userBar.logout": userBar_logout,
  "userBar.loggingOut": userBar_loggingOut,
  "userBar.settings": userBar_settings,
  "settings.title": settings_title,
  "settings.discordLabel": settings_discordLabel,
  "settings.languageLabel": settings_languageLabel,
  "settings.languageHint": settings_languageHint,
  "settings.autoLabel": settings_autoLabel,
  "settings.langZhCn": settings_langZhCn,
  "settings.langZhTw": settings_langZhTw,
  "settings.langEn": settings_langEn,
  "settings.langEs": settings_langEs,
  "settings.langFr": settings_langFr,
  "settings.savedText": settings_savedText,
  "picker.myGuilds": picker_myGuilds,
  "picker.myGuildsEn": picker_myGuildsEn,
  "picker.publicGuilds": picker_publicGuilds,
  "picker.publicGuildsEn": picker_publicGuildsEn,
  "picker.readOnlyBadge": picker_readOnlyBadge,
  "picker.emptyTitle": picker_emptyTitle,
  "picker.emptyBody": picker_emptyBody,
  "picker.createGuild": picker_createGuild,
  "picker.createGuildMore": picker_createGuildMore,
  "create.backLink": create_backLink,
  "create.title": create_title,
  "create.subtitle": create_subtitle,
  "create.nameLabel": create_nameLabel,
  "create.namePlaceholder": create_namePlaceholder,
  "create.slugLabel": create_slugLabel,
  "create.slugPlaceholder": create_slugPlaceholder,
  "create.slugChecking": create_slugChecking,
  "create.slugAvailable": create_slugAvailable,
  "create.slugTaken": create_slugTaken,
  "create.slugNote": create_slugNote,
  "create.serverLabel": create_serverLabel,
  "create.noServers1": create_noServers1,
  "create.noServers2": create_noServers2,
  "create.submit": create_submit,
  "create.submitting": create_submitting,
  "create.toastNameShort": create_toastNameShort,
  "create.toastSlugRequired": create_toastSlugRequired,
  "create.toastSlugBad": create_toastSlugBad,
  "create.toastServerRequired": create_toastServerRequired,
  "create.toastCreated": create_toastCreated,
  "create.toastFailed": create_toastFailed,
  "locked.backLink": locked_backLink,
  "locked.title": locked_title,
  "locked.body1": locked_body1,
  "locked.body2": locked_body2,
  "locked.backButton": locked_backButton,
  "guildHome.backToHub": guildHome_backToHub,
  "guildHome.tabTeam": guildHome_tabTeam,
  "guildHome.tabDex": guildHome_tabDex,
  "guildHome.tabSect": guildHome_tabSect,
  "guildHome.readOnlyBanner": guildHome_readOnlyBanner,
  "groupingType.tabActivity": groupingType_tabActivity,
  "groupingType.tabTalent": groupingType_tabTalent,
  "groupingType.tabRace": groupingType_tabRace,
  "groupingType.tabTower": groupingType_tabTower,
  "groupingType.shortActivity": groupingType_shortActivity,
  "groupingType.shortTalent": groupingType_shortTalent,
  "groupingType.shortRace": groupingType_shortRace,
  "groupingType.shortTower": groupingType_shortTower,
  "groupingType.shortGather": groupingType_shortGather,
  "groupingType.shortExplore": groupingType_shortExplore,
  "groupingList.prevWeek": groupingList_prevWeek,
  "groupingList.nextWeek": groupingList_nextWeek,
  "groupingList.weekHeader": groupingList_weekHeader,
  "groupingList.emptyInteractive": groupingList_emptyInteractive,
  "groupingList.emptyReadonly": groupingList_emptyReadonly,
  "groupingList.statusOpen": groupingList_statusOpen,
  "groupingList.people": groupingList_people,
  "groupingList.newCar": groupingList_newCar,
  "groupingList.seal": groupingList_seal,
  "groupingList.dayGroupHeader": groupingList_dayGroupHeader,
  "groupingList.weekday0": groupingList_weekday0,
  "groupingList.weekday1": groupingList_weekday1,
  "groupingList.weekday2": groupingList_weekday2,
  "groupingList.weekday3": groupingList_weekday3,
  "groupingList.weekday4": groupingList_weekday4,
  "groupingList.weekday5": groupingList_weekday5,
  "groupingList.weekday6": groupingList_weekday6,
  "groupingList.undatedGroup": groupingList_undatedGroup,
  "groupingDetail.notFound": groupingDetail_notFound,
  "groupingDetail.backToList": groupingDetail_backToList,
  "groupingDetail.share": groupingDetail_share,
  "groupingDetail.edit": groupingDetail_edit,
  "groupingDetail.disband": groupingDetail_disband,
  "groupingDetail.disbanding": groupingDetail_disbanding,
  "groupingDetail.statusOpen": groupingDetail_statusOpen,
  "groupingDetail.people": groupingDetail_people,
  "groupingDetail.openHint": groupingDetail_openHint,
  "groupingDetail.readonlyHint": groupingDetail_readonlyHint,
  "groupingDetail.toastDisbanded": groupingDetail_toastDisbanded,
  "groupingDetail.toastDisbandFailed": groupingDetail_toastDisbandFailed,
  "groupingDetail.linkCopied": groupingDetail_linkCopied,
  "groupingDetail.copyFailedManual": groupingDetail_copyFailedManual,
  "groupingDetail.disbandConfirmTitle": groupingDetail_disbandConfirmTitle,
  "groupingDetail.disbandConfirmMessage": groupingDetail_disbandConfirmMessage,
  "groupingDetail.complete": groupingDetail_complete,
  "groupingDetail.completing": groupingDetail_completing,
  "groupingDetail.statusCompleted": groupingDetail_statusCompleted,
  "groupingDetail.restore": groupingDetail_restore,
  "groupingDetail.completeConfirmTitle": groupingDetail_completeConfirmTitle,
  "groupingDetail.completeConfirmMessage": groupingDetail_completeConfirmMessage,
  "groupingDetail.toastCompleted": groupingDetail_toastCompleted,
  "groupingDetail.toastCompleteFailed": groupingDetail_toastCompleteFailed,
  "groupingDetail.toastRestored": groupingDetail_toastRestored,
  "groupingDetail.toastRestoreFailed": groupingDetail_toastRestoreFailed,
  "groupingDetail.completedHint": groupingDetail_completedHint,
  "groupingForm.createTitle": groupingForm_createTitle,
  "groupingForm.editTitle": groupingForm_editTitle,
  "groupingForm.typeLabel": groupingForm_typeLabel,
  "groupingForm.capacity": groupingForm_capacity,
  "groupingForm.hintActivity": groupingForm_hintActivity,
  "groupingForm.hintDungeon": groupingForm_hintDungeon,
  "groupingForm.hintTalent": groupingForm_hintTalent,
  "groupingForm.hintRace": groupingForm_hintRace,
  "groupingForm.hintTower": groupingForm_hintTower,
  "groupingForm.titleLabel": groupingForm_titleLabel,
  "groupingForm.titlePlaceholder": groupingForm_titlePlaceholder,
  "groupingForm.startsLabel": groupingForm_startsLabel,
  "groupingForm.monthOption": groupingForm_monthOption,
  "groupingForm.dayOption": groupingForm_dayOption,
  "groupingForm.hourOption": groupingForm_hourOption,
  "groupingForm.minuteOption": groupingForm_minuteOption,
  "groupingForm.dungeonLabel": groupingForm_dungeonLabel,
  "groupingForm.dungeonNone": groupingForm_dungeonNone,
  "groupingForm.nicknameLabel": groupingForm_nicknameLabel,
  "groupingForm.nicknamePlaceholder": groupingForm_nicknamePlaceholder,
  "groupingForm.sectLabel": groupingForm_sectLabel,
  "groupingForm.submitCreate": groupingForm_submitCreate,
  "groupingForm.submitEdit": groupingForm_submitEdit,
  "groupingForm.submitting": groupingForm_submitting,
  "groupingForm.toastSect": groupingForm_toastSect,
  "groupingForm.toastSaved": groupingForm_toastSaved,
  "groupingForm.toastSaveFailed": groupingForm_toastSaveFailed,
  "groupingForm.toastPosted": groupingForm_toastPosted,
  "groupingForm.toastCreateFailed": groupingForm_toastCreateFailed,
  "groupingForm.titleTemplate": groupingForm_titleTemplate,
  "seat.emptyJoin": seat_emptyJoin,
  "seat.empty": seat_empty,
  "seat.modalTitle": seat_modalTitle,
  "seat.modalSubtitle": seat_modalSubtitle,
  "seat.nameLabel": seat_nameLabel,
  "seat.namePlaceholder": seat_namePlaceholder,
  "seat.nameRequired": seat_nameRequired,
  "seat.selfTab": seat_selfTab,
  "seat.proxyTab": seat_proxyTab,
  "seat.selfNameHint": seat_selfNameHint,
  "seat.proxySearchPlaceholder": seat_proxySearchPlaceholder,
  "seat.proxyPickRequired": seat_proxyPickRequired,
  "seat.proxyEmpty": seat_proxyEmpty,
  "seat.sectLabel": seat_sectLabel,
  "seat.confirmJoin": seat_confirmJoin,
  "seat.joining": seat_joining,
  "seat.toastSect": seat_toastSect,
  "seat.toastJoined": seat_toastJoined,
  "seat.toastJoinFailed": seat_toastJoinFailed,
  "seat.toastLeft": seat_toastLeft,
  "seat.toastLeaveFailed": seat_toastLeaveFailed,
  "seat.leaveConfirmTitle": seat_leaveConfirmTitle,
  "seat.leaveConfirmMessage": seat_leaveConfirmMessage,
  "seat.roleHealer": seat_roleHealer,
  "seat.roleDps": seat_roleDps,
  "appBlocks.rosterTitle": appBlocks_rosterTitle,
  "appBlocks.closedStatus": appBlocks_closedStatus,
  "appBlocks.completedStatus": appBlocks_completedStatus,
  "appBlocks.unknownBlock": appBlocks_unknownBlock,
  "dex.backToDex": dex_backToDex,
  "dex.bossesLine": dex_bossesLine,
  "dex.noBossData": dex_noBossData,
  "dex.empty": dex_empty,
  "dex.currentGuides": dex_currentGuides,
  "dex.catSub": dex_catSub,
  "dex.catSubCurrent": dex_catSubCurrent,
  "dex.size10": dex_size10,
  "dex.size5": dex_size5,
  "dex.sizeN": dex_sizeN,
  "dex.bossUnit": dex_bossUnit,
  "dex.partMechanics": dex_partMechanics,
  "dex.partShouts": dex_partShouts,
  "dex.partTalents": dex_partTalents,
  "dex.labelAll": dex_labelAll,
  "dex.labelParts": dex_labelParts,
  "dex.labelPending": dex_labelPending,
  "dex.labelNoBosses": dex_labelNoBosses,
  "dex.sealBoss": dex_sealBoss,
  "boss.back": boss_back,
  "boss.notFound": boss_notFound,
  "boss.tabMechanics": boss_tabMechanics,
  "boss.tabTalents": boss_tabTalents,
  "boss.shoutsTitle": boss_shoutsTitle,
  "boss.copy": boss_copy,
  "boss.shoutCopied": boss_shoutCopied,
  "boss.copyFailed": boss_copyFailed,
  "boss.copyManual": boss_copyManual,
  "boss.noMechanics": boss_noMechanics,
  "boss.noTalents": boss_noTalents,
  "boss.talentTitle": boss_talentTitle,
  "boss.talentPending": boss_talentPending,
  "sect.empty": sect_empty,
  "sect.back": sect_back,
  "sect.tabBis": sect_tabBis,
  "sect.tabRotation": sect_tabRotation,
  "sect.tabRates": sect_tabRates,
  "sect.tabTiaolv": sect_tabTiaolv,
  "sect.tabGrad": sect_tabGrad,
  "sect.noBis": sect_noBis,
  "sect.noRotation": sect_noRotation,
  "sect.noRates": sect_noRates,
  "sect.rotGreydust": sect_rotGreydust,
  "sect.rotOpener": sect_rotOpener,
  "sect.rotLoop": sect_rotLoop,
  "sect.rotKeyPoints": sect_rotKeyPoints,
  "sect.rotInnerSkills": sect_rotInnerSkills,
  "sect.rotVideo": sect_rotVideo,
  "sect.rateAccuracy": sect_rateAccuracy,
  "sect.rateCrit": sect_rateCrit,
  "sect.rateCritDamage": sect_rateCritDamage,
  "sect.bisMainWeapon": sect_bisMainWeapon,
  "sect.bisOffWeapon": sect_bisOffWeapon,
  "sect.bisAccessories": sect_bisAccessories,
  "sect.bisHeadBody": sect_bisHeadBody,
  "sect.bisLegsWrists": sect_bisLegsWrists,
  "tiaolv.intro": tiaolv_intro,
  "tiaolv.innerSkill": tiaolv_innerSkill,
  "tiaolv.innerSkillPlaceholder": tiaolv_innerSkillPlaceholder,
  "tiaolv.wuxue": tiaolv_wuxue,
  "tiaolv.wuku": tiaolv_wuku,
  "tiaolv.wukuSelf": tiaolv_wukuSelf,
  "tiaolv.wukuCommon": tiaolv_wukuCommon,
  "tiaolv.suit": tiaolv_suit,
  "tiaolv.bow": tiaolv_bow,
  "tiaolv.none": tiaolv_none,
  "tiaolv.tuneArea": tiaolv_tuneArea,
  "tiaolv.calc": tiaolv_calc,
  "tiaolv.calculating": tiaolv_calculating,
  "tiaolv.toastFailed": tiaolv_toastFailed,
  "tiaolv.toastFailedWith": tiaolv_toastFailedWith,
  "tiaolv.colAttr": tiaolv_colAttr,
  "tiaolv.colBase": tiaolv_colBase,
  "tiaolv.colPanel": tiaolv_colPanel,
  "tiaolv.colFinal": tiaolv_colFinal,
  "grad.entering": grad_entering,
  "grad.title": grad_title,
  "grad.subtitle": grad_subtitle,
  "grad.mingjinNote": grad_mingjinNote,
  "grad.buildBig": grad_buildBig,
  "grad.buildSmall": grad_buildSmall,
  "grad.ringLabel": grad_ringLabel,
  "grad.scoreCount": grad_scoreCount,
  "grad.scoreValue": grad_scoreValue,
  "grad.scoreRate": grad_scoreRate,
  "grad.tier1": grad_tier1,
  "grad.tier2": grad_tier2,
  "grad.tier3": grad_tier3,
  "grad.tier4": grad_tier4,
  "grad.tier5": grad_tier5,
  "grad.tier6": grad_tier6,
  "grad.tapHint": grad_tapHint,
  "grad.refTitle": grad_refTitle,
  "grad.maxTableTitle": grad_maxTableTitle,
  "grad.colAffix": grad_colAffix,
  "grad.colMax": grad_colMax,
  "grad.colResonance": grad_colResonance,
  "grad.slotTableTitle": grad_slotTableTitle,
  "grad.rateTitle": grad_rateTitle,
  "grad.rateOk": grad_rateOk,
  "grad.rateGap": grad_rateGap,
  "grad.rateOverflow": grad_rateOverflow,
  "grad.compareTitle": grad_compareTitle,
  "grad.saveScheme": grad_saveScheme,
  "grad.schemeName": grad_schemeName,
  "grad.noSchemes": grad_noSchemes,
  "grad.load": grad_load,
  "grad.deleteScheme": grad_deleteScheme,
  "grad.itemScore": grad_itemScore,
  "grad.rowMain": grad_rowMain,
  "grad.rowSub": grad_rowSub,
  "grad.rowResonance": grad_rowResonance,
  "grad.affixPlaceholder": grad_affixPlaceholder,
  "grad.affixLoading": grad_affixLoading,
  "grad.valuePlaceholderMax": grad_valuePlaceholderMax,
  "grad.valuePlaceholder": grad_valuePlaceholder,
  "grad.resonance": grad_resonance,
  "grad.overMax": grad_overMax,
  "grad.toastSaved": grad_toastSaved,
  "grad.toastLoaded": grad_toastLoaded,
  "grad.toastOldScheme": grad_toastOldScheme,
  "gear.calcLabel": gear_calcLabel,
  "gear.benchTitle": gear_benchTitle,
  "gear.benchIntro": gear_benchIntro,
  "gear.targetLabel": gear_targetLabel,
  "gear.bowLabel": gear_bowLabel,
  "gear.bowNoneLabel": gear_bowNoneLabel,
  "gear.extrasTitle": gear_extrasTitle,
  "gear.resLabel": gear_resLabel,
  "gear.extraAccLabel": gear_extraAccLabel,
  "gear.extraCritLabel": gear_extraCritLabel,
  "gear.extraIntLabel": gear_extraIntLabel,
  "gear.baseTitle": gear_baseTitle,
  "gear.unlockLabel": gear_unlockLabel,
  "gear.lockLabel": gear_lockLabel,
  "gear.modifiedTag": gear_modifiedTag,
  "gear.baseResetLabel": gear_baseResetLabel,
  "gear.baseResetTitle": gear_baseResetTitle,
  "gear.baseResetBody": gear_baseResetBody,
  "gear.xinfaLabelTemplate": gear_xinfaLabelTemplate,
  "gear.xinfaNoneLabel": gear_xinfaNoneLabel,
  "gear.loginHint": gear_loginHint,
  "gear.libTitle": gear_libTitle,
  "gear.myLibTitle": gear_myLibTitle,
  "gear.myBuildsTitle": gear_myBuildsTitle,
  "gear.libCountTemplate": gear_libCountTemplate,
  "gear.formSlotLabel": gear_formSlotLabel,
  "gear.formNameLabel": gear_formNameLabel,
  "gear.formNamePlaceholder": gear_formNamePlaceholder,
  "gear.affixPlaceholder": gear_affixPlaceholder,
  "gear.valuePlaceholder": gear_valuePlaceholder,
  "gear.refTemplate": gear_refTemplate,
  "gear.fillMaxLabel": gear_fillMaxLabel,
  "gear.fillCyLabel": gear_fillCyLabel,
  "gear.delRowLabel": gear_delRowLabel,
  "gear.addRowLabel": gear_addRowLabel,
  "gear.dyNameLabel": gear_dyNameLabel,
  "gear.dyNamePlaceholder": gear_dyNamePlaceholder,
  "gear.dyValLabel": gear_dyValLabel,
  "gear.schoolsLabel": gear_schoolsLabel,
  "gear.addGearLabel": gear_addGearLabel,
  "gear.updateGearLabel": gear_updateGearLabel,
  "gear.cancelEditLabel": gear_cancelEditLabel,
  "gear.demoLabel": gear_demoLabel,
  "gear.clearLibLabel": gear_clearLibLabel,
  "gear.clearConfirmTitle": gear_clearConfirmTitle,
  "gear.clearConfirmBody": gear_clearConfirmBody,
  "gear.equipLabel": gear_equipLabel,
  "gear.unequipLabel": gear_unequipLabel,
  "gear.editLabel": gear_editLabel,
  "gear.deleteLabel": gear_deleteLabel,
  "gear.simLabel": gear_simLabel,
  "gear.simRealLabel": gear_simRealLabel,
  "gear.simCyLabel": gear_simCyLabel,
  "gear.simMaxLabel": gear_simMaxLabel,
  "gear.verdictHeirloom": gear_verdictHeirloom,
  "gear.verdictDud": gear_verdictDud,
  "gear.scoreTemplate": gear_scoreTemplate,
  "gear.qualityLabel": gear_qualityLabel,
  "gear.exportLabel": gear_exportLabel,
  "gear.importLabel": gear_importLabel,
  "gear.importFailedToast": gear_importFailedToast,
  "gear.importedToastTemplate": gear_importedToastTemplate,
  "gear.pasteTitle": gear_pasteTitle,
  "gear.pastePlaceholder": gear_pastePlaceholder,
  "gear.pasteButtonLabel": gear_pasteButtonLabel,
  "gear.pasteDemoLabel": gear_pasteDemoLabel,
  "gear.pasteEmptyText": gear_pasteEmptyText,
  "gear.pasteOkTemplate": gear_pasteOkTemplate,
  "gear.pasteUnknownTemplate": gear_pasteUnknownTemplate,
  "gear.pasteFailText": gear_pasteFailText,
  "gear.pasteFullText": gear_pasteFullText,
  "gear.ocrTitle": gear_ocrTitle,
  "gear.ocrDropText": gear_ocrDropText,
  "gear.ocrPreparingText": gear_ocrPreparingText,
  "gear.ocrRunningText": gear_ocrRunningText,
  "gear.ocrSecondText": gear_ocrSecondText,
  "gear.ocrFailedText": gear_ocrFailedText,
  "gear.ocrBadTypeText": gear_ocrBadTypeText,
  "gear.ocrTooBigText": gear_ocrTooBigText,
  "gear.ocrNoEngineText": gear_ocrNoEngineText,
  "gear.ocrDoneTemplate": gear_ocrDoneTemplate,
  "gear.ocrSlotLabel": gear_ocrSlotLabel,
  "gear.ocrNameLabel": gear_ocrNameLabel,
  "gear.ocrEquipLabel": gear_ocrEquipLabel,
  "gear.ocrConfirmLabel": gear_ocrConfirmLabel,
  "gear.ocrCancelLabel": gear_ocrCancelLabel,
  "gear.ocrUnknownTitle": gear_ocrUnknownTitle,
  "gear.ocrSavedTemplate": gear_ocrSavedTemplate,
  "gear.ocrNeedLineToast": gear_ocrNeedLineToast,
  "gear.ocrLowConfTag": gear_ocrLowConfTag,
  "gear.ocrAddRowLabel": gear_ocrAddRowLabel,
  "gear.ocrImportSlotTemplate": gear_ocrImportSlotTemplate,
  "gear.ocrBatchTitle": gear_ocrBatchTitle,
  "gear.ocrBatchDropText": gear_ocrBatchDropText,
  "gear.ocrBatchQueuedText": gear_ocrBatchQueuedText,
  "gear.ocrBatchRunningText": gear_ocrBatchRunningText,
  "gear.ocrBatchReadyText": gear_ocrBatchReadyText,
  "gear.ocrBatchFailedText": gear_ocrBatchFailedText,
  "gear.ocrBatchImportedText": gear_ocrBatchImportedText,
  "gear.ocrBatchRetryLabel": gear_ocrBatchRetryLabel,
  "gear.ocrBatchRemoveLabel": gear_ocrBatchRemoveLabel,
  "gear.ocrBatchAdjustLabel": gear_ocrBatchAdjustLabel,
  "gear.ocrBatchApplyBoxLabel": gear_ocrBatchApplyBoxLabel,
  "gear.ocrBatchDetectedText": gear_ocrBatchDetectedText,
  "gear.ocrBatchFullImageText": gear_ocrBatchFullImageText,
  "gear.ocrBatchDupTag": gear_ocrBatchDupTag,
  "gear.ocrBatchDupLibText": gear_ocrBatchDupLibText,
  "gear.ocrBatchDupRowText": gear_ocrBatchDupRowText,
  "gear.ocrBatchIncludeLabel": gear_ocrBatchIncludeLabel,
  "gear.ocrBatchNoLinesText": gear_ocrBatchNoLinesText,
  "gear.ocrBatchImportTemplate": gear_ocrBatchImportTemplate,
  "gear.ocrBatchResultTemplate": gear_ocrBatchResultTemplate,
  "gear.libEmptyText": gear_libEmptyText,
  "gear.equippedTag": gear_equippedTag,
  "gear.loadoutTitle": gear_loadoutTitle,
  "gear.autoLabel": gear_autoLabel,
  "gear.autoDoneToast": gear_autoDoneToast,
  "gear.autoFallbackToast": gear_autoFallbackToast,
  "gear.unequipAllLabel": gear_unequipAllLabel,
  "gear.slotEmptyText": gear_slotEmptyText,
  "gear.panelTitle": gear_panelTitle,
  "gear.gradLabel": gear_gradLabel,
  "gear.gradCountLabel": gear_gradCountLabel,
  "gear.gradValueLabel": gear_gradValueLabel,
  "gear.gradDyLabel": gear_gradDyLabel,
  "gear.gradDyToggleLabel": gear_gradDyToggleLabel,
  "gear.loanLabel": gear_loanLabel,
  "gear.simActiveTag": gear_simActiveTag,
  "gear.copySummaryLabel": gear_copySummaryLabel,
  "gear.copiedToast": gear_copiedToast,
  "gear.copyFailedToast": gear_copyFailedToast,
  "gear.yAccLabel": gear_yAccLabel,
  "gear.yCritLabel": gear_yCritLabel,
  "gear.yIntLabel": gear_yIntLabel,
  "gear.finalCritLabel": gear_finalCritLabel,
  "gear.whiteLabel": gear_whiteLabel,
  "gear.dawaiLabel": gear_dawaiLabel,
  "gear.xiaowaiLabel": gear_xiaowaiLabel,
  "gear.dashuLabel": gear_dashuLabel,
  "gear.xiaoshuLabel": gear_xiaoshuLabel,
  "gear.hpLabel": gear_hpLabel,
  "gear.defLabel": gear_defLabel,
  "gear.talentLabel": gear_talentLabel,
  "gear.diffTitle": gear_diffTitle,
  "gear.diffLackTemplate": gear_diffLackTemplate,
  "gear.diffExactText": gear_diffExactText,
  "gear.diffOverTemplate": gear_diffOverTemplate,
  "gear.diffExtraTitle": gear_diffExtraTitle,
  "gear.diffLowTitle": gear_diffLowTitle,
  "gear.diffDoneText": gear_diffDoneText,
  "gear.diffEmptyText": gear_diffEmptyText,
  "gear.diffInvalidTemplate": gear_diffInvalidTemplate,
  "gear.suggestTitle": gear_suggestTitle,
  "gear.suggestSwapTemplate": gear_suggestSwapTemplate,
  "gear.suggestWashTemplate": gear_suggestWashTemplate,
  "gear.suggestNoneText": gear_suggestNoneText,
  "gear.suggestHeadTemplate": gear_suggestHeadTemplate,
  "gear.dySummaryTitle": gear_dySummaryTitle,
  "gear.dyCorrectText": gear_dyCorrectText,
  "gear.dyWrongText": gear_dyWrongText,
  "gear.schemeTitle": gear_schemeTitle,
  "gear.schemeSaveLabel": gear_schemeSaveLabel,
  "gear.schemeNameTemplate": gear_schemeNameTemplate,
  "gear.schemeLoadLabel": gear_schemeLoadLabel,
  "gear.schemeDeleteLabel": gear_schemeDeleteLabel,
  "gear.schemeEmptyText": gear_schemeEmptyText,
  "gear.schemeComposeFirstText": gear_schemeComposeFirstText,
  "gear.schemeSavedToastTemplate": gear_schemeSavedToastTemplate,
  "gear.schemeLoadedToastTemplate": gear_schemeLoadedToastTemplate,
  "gear.schemeGroupCountTemplate": gear_schemeGroupCountTemplate,
  "gear.quickTitle": gear_quickTitle,
  "gear.quickResLabel": gear_quickResLabel,
  "gear.quickSyncLabel": gear_quickSyncLabel,
  "gear.quickSyncedToast": gear_quickSyncedToast,
  "gear.quickOkText": gear_quickOkText,
  "gear.quickOverTemplate": gear_quickOverTemplate,
  "gear.quickGapTemplate": gear_quickGapTemplate,
  "gear.recipesTitle": gear_recipesTitle,
  "gear.recipeSearchPlaceholder": gear_recipeSearchPlaceholder,
  "gear.recipeAllLabel": gear_recipeAllLabel,
  "gear.recipeColCat": gear_recipeColCat,
  "gear.recipeColSchool": gear_recipeColSchool,
  "gear.recipeColSet": gear_recipeColSet,
  "gear.recipeColRecipe": gear_recipeColRecipe,
  "gear.recipeColBow": gear_recipeColBow,
  "gear.recipeSetTargetLabel": gear_recipeSetTargetLabel,
  "gear.recipeEmptyText": gear_recipeEmptyText,
  "gear.recipeTargetToastTemplate": gear_recipeTargetToastTemplate,
  "gear.sectRecipesTitle": gear_sectRecipesTitle,
  "gear.affixTableTitle": gear_affixTableTitle,
  "gear.colCyLabel": gear_colCyLabel,
  "gear.colCyPctLabel": gear_colCyPctLabel,
  "gear.colRecipeNamesLabel": gear_colRecipeNamesLabel,
  "gear.survivalNote": gear_survivalNote,
  "gear.slotTableTitle": gear_slotTableTitle,
  "gear.slotsBigTitle": gear_slotsBigTitle,
  "gear.slotsSmallTitle": gear_slotsSmallTitle,
  "gear.formulaTitle": gear_formulaTitle,
  "gear.formulaRatesTitle": gear_formulaRatesTitle,
  "gear.formulaDimsTitle": gear_formulaDimsTitle,
  "gear.formulaOrderTitle": gear_formulaOrderTitle,
  "gear.formulaAccTemplate": gear_formulaAccTemplate,
  "gear.formulaCritTemplate": gear_formulaCritTemplate,
  "gear.formulaIntTemplate": gear_formulaIntTemplate,
  "gear.formulaBarsTemplate": gear_formulaBarsTemplate,
  "gear.formulaBowTemplate": gear_formulaBowTemplate,
  "gear.formulaOrderText": gear_formulaOrderText,
  "gear.colDimLabel": gear_colDimLabel,
  "gear.colConvLabel": gear_colConvLabel,
  "gear.colFullBarTemplate": gear_colFullBarTemplate,
  "gear.calcFailedText": gear_calcFailedText,
  "gear.demoLoadedToast": gear_demoLoadedToast,
  "gear.savedToastTemplate": gear_savedToastTemplate,
  "gear.deletedToast": gear_deletedToast,
  "gear.clearedToast": gear_clearedToast,
  "legal.termsTitle": legal_termsTitle,
  "legal.privacyTitle": legal_privacyTitle,
  "legal.termsLink": legal_termsLink,
  "legal.privacyLink": legal_privacyLink,
  "legal.updatedText": legal_updatedText,
  "legal.disclaimer": legal_disclaimer,
  "termsBody.s1h": termsBody_s1h,
  "termsBody.s1b": termsBody_s1b,
  "termsBody.s2h": termsBody_s2h,
  "termsBody.s2b": termsBody_s2b,
  "termsBody.s3h": termsBody_s3h,
  "termsBody.s3b": termsBody_s3b,
  "termsBody.s4h": termsBody_s4h,
  "termsBody.s4b": termsBody_s4b,
  "termsBody.s5h": termsBody_s5h,
  "termsBody.s5b": termsBody_s5b,
  "termsBody.s6h": termsBody_s6h,
  "termsBody.s6b": termsBody_s6b,
  "privacyBody.s1h": privacyBody_s1h,
  "privacyBody.s1b": privacyBody_s1b,
  "privacyBody.s2h": privacyBody_s2h,
  "privacyBody.s2b": privacyBody_s2b,
  "privacyBody.s3h": privacyBody_s3h,
  "privacyBody.s3b": privacyBody_s3b,
  "privacyBody.s4h": privacyBody_s4h,
  "privacyBody.s4b": privacyBody_s4b,
  "privacyBody.s5h": privacyBody_s5h,
  "privacyBody.s5b": privacyBody_s5b,
  "privacyBody.s6h": privacyBody_s6h,
  "privacyBody.s6b": privacyBody_s6b,
  "errors.rateLimited": errors_rateLimited,
  "errors.createRateLimited": errors_createRateLimited,
  "errors.guildNotFound": errors_guildNotFound,
  "errors.gearNotFound": errors_gearNotFound,
  "errors.gearEmptyBuild": errors_gearEmptyBuild,
  "errors.loginRequired": errors_loginRequired,
  "errors.loginRequiredShort": errors_loginRequiredShort,
  "errors.localeUnsupported": errors_localeUnsupported,
  "errors.pushTokenInvalid": errors_pushTokenInvalid,
  "errors.guildUnboundWrite": errors_guildUnboundWrite,
  "errors.memberOnly": errors_memberOnly,
  "errors.memberOnlyView": errors_memberOnlyView,
  "errors.titleRequired": errors_titleRequired,
  "errors.badStartTime": errors_badStartTime,
  "errors.startTimeTooFar": errors_startTimeTooFar,
  "errors.groupingNotFound": errors_groupingNotFound,
  "errors.officialEvent": errors_officialEvent,
  "errors.noCreatorRecorded": errors_noCreatorRecorded,
  "errors.leaderOnlyDisband": errors_leaderOnlyDisband,
  "errors.noCreatorRecordedEdit": errors_noCreatorRecordedEdit,
  "errors.leaderOnlyEdit": errors_leaderOnlyEdit,
  "errors.noCreatorRecordedComplete": errors_noCreatorRecordedComplete,
  "errors.leaderOnlyComplete": errors_leaderOnlyComplete,
  "errors.noCreatorRecordedReopen": errors_noCreatorRecordedReopen,
  "errors.leaderOnlyReopen": errors_leaderOnlyReopen,
  "errors.groupingAlreadyCompleted": errors_groupingAlreadyCompleted,
  "errors.groupingNotCompleted": errors_groupingNotCompleted,
  "errors.groupingClosed": errors_groupingClosed,
  "errors.nicknameRequired": errors_nicknameRequired,
  "errors.proxyTargetNotInRoster": errors_proxyTargetNotInRoster,
  "errors.groupingFull": errors_groupingFull,
  "errors.lastSeatHealer": errors_lastSeatHealer,
  "errors.alreadyJoined": errors_alreadyJoined,
  "errors.seatNotFound": errors_seatNotFound,
  "errors.paramsIncomplete": errors_paramsIncomplete,
  "errors.bossNotFound": errors_bossNotFound,
  "errors.guildNameShort": errors_guildNameShort,
  "errors.avatarTooLarge": errors_avatarTooLarge,
  "errors.avatarBadType": errors_avatarBadType,
  "errors.avatarEmpty": errors_avatarEmpty,
  "errors.slugInvalid": errors_slugInvalid,
  "errors.slugReserved": errors_slugReserved,
  "errors.slugTaken": errors_slugTaken,
  "errors.serverRequired": errors_serverRequired,
  "errors.notInServer": errors_notInServer,
  "errors.cannotManageServer": errors_cannotManageServer,
  "errors.generic": errors_generic,
};
