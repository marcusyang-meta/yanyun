/* Generated, do not hand-edit: source = strings.source.ts; rerun node scripts/i18n-codegen.mjs */
import type { FbsAPI } from "fbtee/server";
/* Compiled fbtee output calls fbs._ / fbs._param (runtime internals, not
 * part of the public FbsAPI types): parameter annotations are widened to
 * the local FbsRuntime, which carries those internal entry points. The
 * runtime object is fbtee's fbs and has them natively; this only states
 * the type honestly. */
export type FbsRuntime = FbsAPI & {
  _: (pattern: string, args: ReadonlyArray<unknown> | null, opts: { hk: string }) => string;
  _param: (name: string, value: unknown) => unknown;
};
export type StringFn = (fbs: FbsRuntime, p?: StringParams) => string;

export type StringParams = Record<string, unknown>;
function pv(p: StringParams | undefined, name: string): string {
	const v = p ? p[name] : undefined;
	return v === undefined ? "{" + name + "}" : String(v);
}
export const common_cancel = (fbs: FbsRuntime) => fbs._("取消", null, { hk: "1T5Kf0" });
export const common_confirm = (fbs: FbsRuntime) => fbs._("确定", null, { hk: "4qsCYN" });
export const common_unknownError = (fbs: FbsRuntime) => fbs._("未知错误", null, { hk: "2Zug7R" });
export const common_renderError = (fbs: FbsRuntime, p?: StringParams) => fbs._("渲染出错: {message}", [fbs._param("message", pv(p, "message"))], { hk: "1xNsEz" });
export const common_renderErrorHint = (fbs: FbsRuntime) => fbs._("这一页出了问题，其他页面不受影响。", null, { hk: "1Gn8la" });
export const common_backToHub = (fbs: FbsRuntime) => fbs._("返回百业集结", null, { hk: "1yQB1" });
export const common_loadingGuild = (fbs: FbsRuntime) => fbs._("正在展开百业…", null, { hk: "4nB2wr" });
export const common_close = (fbs: FbsRuntime) => fbs._("关闭", null, { hk: "2XVutD" });
export const site_title = (fbs: FbsRuntime) => fbs._("百业集结", null, { hk: "2jruiT" });
export const site_subtitle = (fbs: FbsRuntime) => fbs._("燕云十六声 · 国际服百业车队与攻略集散地 —— 择一业而入，共赴双十。", null, { hk: "Ql8Gh" });
export const site_heroAlt = (fbs: FbsRuntime) => fbs._("水墨山水", null, { hk: "YCzQi" });
export const site_seal = (fbs: FbsRuntime) => fbs._("燕", null, { hk: "3GmS65" });
export const login_cardTitle = (fbs: FbsRuntime) => fbs._("先登录，再入江湖", null, { hk: "1gT8hG" });
export const login_cardBody1 = (fbs: FbsRuntime) => fbs._("本站需用 Discord 账号认证后使用。", null, { hk: "2UE2ER" });
export const login_cardBody2 = (fbs: FbsRuntime) => fbs._("登录后将按你所在的 Discord 服务器，展示你有权限访问的百业。", null, { hk: "de4Ds" });
export const login_button = (fbs: FbsRuntime) => fbs._("用 Discord 登录", null, { hk: "HacAA" });
export const login_privacy = (fbs: FbsRuntime) => fbs._("我们会读取并保存你的 Discord 昵称、头像、服务器列表与登录授权，用于成员校验与提醒功能，详见隐私政策", null, { hk: "4kmvlL" });
export const userBar_logout = (fbs: FbsRuntime) => fbs._("退出登录", null, { hk: "24H2KM" });
export const userBar_loggingOut = (fbs: FbsRuntime) => fbs._("退出中…", null, { hk: "4ajAun" });
export const userBar_settings = (fbs: FbsRuntime) => fbs._("个人资料", null, { hk: "2vDUiU" });
export const settings_title = (fbs: FbsRuntime) => fbs._("个人资料", null, { hk: "1FMLkq" });
export const settings_discordLabel = (fbs: FbsRuntime) => fbs._("Discord 账号", null, { hk: "jkPxs" });
export const settings_languageLabel = (fbs: FbsRuntime) => fbs._("语言", null, { hk: "3N6DA1" });
export const settings_languageHint = (fbs: FbsRuntime) => fbs._("界面语言。选择「自动」时跟随浏览器语言；手动选择后保存在你的账号里，压过浏览器语言。", null, { hk: "22QAB5" });
export const settings_autoLabel = (fbs: FbsRuntime) => fbs._("自动（跟随浏览器）", null, { hk: "1AC95K" });
export const settings_langZhCn = (fbs: FbsRuntime) => fbs._("简体中文", null, { hk: "1HYYwY" });
export const settings_langZhTw = (fbs: FbsRuntime) => fbs._("繁體中文", null, { hk: "19sXq3" });
export const settings_langEn = (fbs: FbsRuntime) => fbs._("English", null, { hk: "1e0zxu" });
export const settings_langEs = (fbs: FbsRuntime) => fbs._("Español", null, { hk: "1rJbZh" });
export const settings_langFr = (fbs: FbsRuntime) => fbs._("Français", null, { hk: "1hewJ7" });
export const settings_savedText = (fbs: FbsRuntime) => fbs._("已保存", null, { hk: "1C5hv6" });
export const picker_myGuilds = (fbs: FbsRuntime) => fbs._("我的百业", null, { hk: "3Wuwix" });
export const picker_myGuildsEn = (fbs: FbsRuntime) => fbs._("My Guilds", null, { hk: "3LVjVP" });
export const picker_publicGuilds = (fbs: FbsRuntime) => fbs._("公开百业", null, { hk: "WVDnJ" });
export const picker_publicGuildsEn = (fbs: FbsRuntime) => fbs._("Public · Read Only", null, { hk: "Wgh4O" });
export const picker_readOnlyBadge = (fbs: FbsRuntime) => fbs._("只读", null, { hk: "QbGBq" });
export const picker_emptyTitle = (fbs: FbsRuntime) => fbs._("你还没有可用的百业", null, { hk: "1bERbv" });
export const picker_emptyBody = (fbs: FbsRuntime) => fbs._("百业按 Discord 服务器划分：你所在的服务器若已绑定百业，它会出现在这里。若还没有，你可以把自己管理的服务器绑成一个新百业。", null, { hk: "3aFcAI" });
export const picker_createGuild = (fbs: FbsRuntime) => fbs._("创建百业", null, { hk: "2GnqPL" });
export const picker_createGuildMore = (fbs: FbsRuntime) => fbs._("+ 创建新百业", null, { hk: "41z6Vc" });
export const create_backLink = (fbs: FbsRuntime) => fbs._("‹ 我的百业", null, { hk: "4cJd0j" });
export const create_title = (fbs: FbsRuntime) => fbs._("创建百业", null, { hk: "33JcWe" });
export const create_subtitle = (fbs: FbsRuntime) => fbs._("绑定一个你管理的 Discord 服务器 —— 之后只有该服务器的成员能看到并使用这个百业。", null, { hk: "3jafPb" });
export const create_nameLabel = (fbs: FbsRuntime) => fbs._("百业名", null, { hk: "1Sg01X" });
export const create_namePlaceholder = (fbs: FbsRuntime) => fbs._("如：叽哩呱啦", null, { hk: "3hXVh1" });
export const create_slugLabel = (fbs: FbsRuntime) => fbs._("访问标识 slug（网址后缀，只能小写字母 / 数字 / 连字符）", null, { hk: "35gMQN" });
export const create_slugPlaceholder = (fbs: FbsRuntime) => fbs._("如：my-guild", null, { hk: "3ermuW" });
export const create_slugChecking = (fbs: FbsRuntime) => fbs._("检查中…", null, { hk: "O8SaV" });
export const create_slugAvailable = (fbs: FbsRuntime, p?: StringParams) => fbs._("✓ yanyun.app/{slug} 可用", [fbs._param("slug", pv(p, "slug"))], { hk: "4wf3F5" });
export const create_slugTaken = (fbs: FbsRuntime) => fbs._("✗ 已被占用或不符合规则", null, { hk: "dPVdK" });
export const create_slugNote = (fbs: FbsRuntime) => fbs._("创建后不可更改", null, { hk: "1joIo7" });
export const create_serverLabel = (fbs: FbsRuntime) => fbs._("绑定 Discord 服务器（仅列出你有管理权限的）", null, { hk: "1iWgbr" });
export const create_noServers1 = (fbs: FbsRuntime) => fbs._("你还没有任何可管理的 Discord 服务器。", null, { hk: "1GVdMj" });
export const create_noServers2 = (fbs: FbsRuntime) => fbs._("先在 Discord 里建一个服务器（或拿到管理员权限），重新登录刷新列表后再来创建。", null, { hk: "4yOqEf" });
export const create_submit = (fbs: FbsRuntime) => fbs._("创建百业", null, { hk: "3K2Nj9" });
export const create_submitting = (fbs: FbsRuntime) => fbs._("创建中…", null, { hk: "37zW5R" });
export const create_toastNameShort = (fbs: FbsRuntime) => fbs._("百业名至少 2 个字", null, { hk: "4oqDb" });
export const create_toastSlugRequired = (fbs: FbsRuntime) => fbs._("请填写访问标识 slug", null, { hk: "1WRTtq" });
export const create_toastSlugBad = (fbs: FbsRuntime) => fbs._("这个 slug 不可用，换一个", null, { hk: "RJyM9" });
export const create_toastServerRequired = (fbs: FbsRuntime) => fbs._("请选择要绑定的 Discord 服务器", null, { hk: "3fgJkk" });
export const create_toastCreated = (fbs: FbsRuntime) => fbs._("百业创建成功", null, { hk: "2kj0I6" });
export const create_toastFailed = (fbs: FbsRuntime) => fbs._("创建失败，请稍后再试", null, { hk: "2MoCyd" });
export const locked_backLink = (fbs: FbsRuntime) => fbs._("‹ 我的百业", null, { hk: "2JUJhQ" });
export const locked_title = (fbs: FbsRuntime) => fbs._("无权访问这个百业", null, { hk: "3eeH3W" });
export const locked_body1 = (fbs: FbsRuntime) => fbs._("该百业不存在，或仅对某个 Discord 服务器的成员开放。", null, { hk: "6kLub" });
export const locked_body2 = (fbs: FbsRuntime) => fbs._("加入对应的 Discord 服务器后，用同一个账号登录即可访问。", null, { hk: "3Z18vd" });
export const locked_backButton = (fbs: FbsRuntime) => fbs._("回到我的百业", null, { hk: "3zSe3X" });
export const guildHome_backToHub = (fbs: FbsRuntime) => fbs._("← 百业集结", null, { hk: "3QHsGc" });
export const guildHome_backPlain = (fbs: FbsRuntime) => fbs._("← 返回", null, { hk: "4G9PJQ" });
export const guildHome_tabTeam = (fbs: FbsRuntime) => fbs._("组队", null, { hk: "1J8jz4" });
export const guildHome_tabDex = (fbs: FbsRuntime) => fbs._("攻略", null, { hk: "2EY4Gq" });
export const guildHome_tabSect = (fbs: FbsRuntime) => fbs._("流派攻略", null, { hk: "37hCbH" });
export const guildHome_tabAnnouncements = (fbs: FbsRuntime) => fbs._("公告", null, { hk: "1AlrM9" });
export const guildHome_readOnlyBanner = (fbs: FbsRuntime) => fbs._("该百业尚未绑定 Discord 服务器 · 只读浏览", null, { hk: "1SB8uD" });
export const guildHome_adminLink = (fbs: FbsRuntime) => fbs._("管理", null, { hk: "24HBEg" });
export const guildHome_tabSchedule = (fbs: FbsRuntime) => fbs._("排期", null, { hk: "2Cvf6D" });
export const groupingType_tabActivity = (fbs: FbsRuntime) => fbs._("双十人本", null, { hk: "4iJ2on" });
export const groupingType_tabTalent = (fbs: FbsRuntime) => fbs._("天赋组队", null, { hk: "lcmft" });
export const groupingType_tabRace = (fbs: FbsRuntime) => fbs._("竞速报名", null, { hk: "3lugJ5" });
export const groupingType_tabTower = (fbs: FbsRuntime) => fbs._("爬塔", null, { hk: "32l5QT" });
export const groupingType_shortActivity = (fbs: FbsRuntime) => fbs._("双十", null, { hk: "eURez" });
export const groupingType_shortTalent = (fbs: FbsRuntime) => fbs._("天赋", null, { hk: "1nxJ9j" });
export const groupingType_shortRace = (fbs: FbsRuntime) => fbs._("竞速", null, { hk: "2sbUhY" });
export const groupingType_shortTower = (fbs: FbsRuntime) => fbs._("爬塔", null, { hk: "x5In2" });
export const groupingType_shortGather = (fbs: FbsRuntime) => fbs._("采集", null, { hk: "2mea0" });
export const groupingType_shortExplore = (fbs: FbsRuntime) => fbs._("探索", null, { hk: "M5BFH" });
export const groupingList_prevWeek = (fbs: FbsRuntime) => fbs._("上一周", null, { hk: "4niiyD" });
export const groupingList_nextWeek = (fbs: FbsRuntime) => fbs._("下一周", null, { hk: "TVC07" });
export const groupingList_weekHeader = (fbs: FbsRuntime, p?: StringParams) => fbs._("{range} · {count} 队", [fbs._param("range", pv(p, "range")), fbs._param("count", pv(p, "count"))], { hk: "1eEnhN" });
export const groupingList_emptyInteractive = (fbs: FbsRuntime) => fbs._("暂无车队，来发第一车吧", null, { hk: "1rU4o2" });
export const groupingList_emptyReadonly = (fbs: FbsRuntime) => fbs._("暂无车队", null, { hk: "31j3wi" });
export const groupingList_statusOpen = (fbs: FbsRuntime) => fbs._("报名中", null, { hk: "2GJkBY" });
export const groupingList_people = (fbs: FbsRuntime, p?: StringParams) => fbs._("{occupied}/{max} 人", [fbs._param("occupied", pv(p, "occupied")), fbs._param("max", pv(p, "max"))], { hk: "3ZhMZO" });
export const groupingList_newCar = (fbs: FbsRuntime) => fbs._("📯 张贴告示 · 发新车", null, { hk: "4BN2p0" });
export const groupingList_seal = (fbs: FbsRuntime) => fbs._("募", null, { hk: "1IVvkA" });
export const groupingList_dayGroupHeader = (fbs: FbsRuntime, p?: StringParams) => fbs._("{month}月{day}日 {weekday}", [
	fbs._param("month", pv(p, "month")),
	fbs._param("day", pv(p, "day")),
	fbs._param("weekday", pv(p, "weekday"))
], { hk: "1BlfRw" });
export const groupingList_weekday0 = (fbs: FbsRuntime) => fbs._("周日", null, { hk: "h0csq" });
export const groupingList_weekday1 = (fbs: FbsRuntime) => fbs._("周一", null, { hk: "3WI7b8" });
export const groupingList_weekday2 = (fbs: FbsRuntime) => fbs._("周二", null, { hk: "4ouSVz" });
export const groupingList_weekday3 = (fbs: FbsRuntime) => fbs._("周三", null, { hk: "1qGP0c" });
export const groupingList_weekday4 = (fbs: FbsRuntime) => fbs._("周四", null, { hk: "3Ojwo0" });
export const groupingList_weekday5 = (fbs: FbsRuntime) => fbs._("周五", null, { hk: "3EHVYp" });
export const groupingList_weekday6 = (fbs: FbsRuntime) => fbs._("周六", null, { hk: "3t7PZj" });
export const groupingList_undatedGroup = (fbs: FbsRuntime) => fbs._("未定时间", null, { hk: "4znqzn" });
export const groupingDetail_notFound = (fbs: FbsRuntime) => fbs._("车队不存在或已解散", null, { hk: "4irp9k" });
export const groupingDetail_backToList = (fbs: FbsRuntime) => fbs._("‹ 返回车队列表", null, { hk: "225y6i" });
export const groupingDetail_share = (fbs: FbsRuntime) => fbs._("🔗 分享车队", null, { hk: "uuLgS" });
export const groupingDetail_edit = (fbs: FbsRuntime) => fbs._("✏️ 编辑", null, { hk: "1cQtpw" });
export const groupingDetail_disband = (fbs: FbsRuntime) => fbs._("解散车队", null, { hk: "3ApWNM" });
export const groupingDetail_disbanding = (fbs: FbsRuntime) => fbs._("解散中…", null, { hk: "2xn0s" });
export const groupingDetail_statusOpen = (fbs: FbsRuntime) => fbs._("报名中", null, { hk: "4vPJaR" });
export const groupingDetail_people = (fbs: FbsRuntime, p?: StringParams) => fbs._("{occupied}/{max} 人", [fbs._param("occupied", pv(p, "occupied")), fbs._param("max", pv(p, "max"))], { hk: "2mGHU9" });
export const groupingDetail_readyProgress = (fbs: FbsRuntime, p?: StringParams) => fbs._("已就位 {ready}/{occupied}", [fbs._param("ready", pv(p, "ready")), fbs._param("occupied", pv(p, "occupied"))], { hk: "pfx4F" });
export const groupingDetail_openHint = (fbs: FbsRuntime) => fbs._("人人可管 · 无需管理码 — 点空位即可落座", null, { hk: "4nekNp" });
export const groupingDetail_readonlyHint = (fbs: FbsRuntime) => fbs._("只读浏览 · 该百业尚未绑定 Discord 服务器", null, { hk: "1zPQCZ" });
export const groupingDetail_toastDisbanded = (fbs: FbsRuntime) => fbs._("车队已解散", null, { hk: "U5kzB" });
export const groupingDetail_toastDisbandFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("解散失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "1ULKcf" });
export const groupingDetail_linkCopied = (fbs: FbsRuntime) => fbs._("链接已复制", null, { hk: "3dkbPe" });
export const groupingDetail_copyFailedManual = (fbs: FbsRuntime) => fbs._("复制失败，请手动复制地址栏链接", null, { hk: "ygDBg" });
export const groupingDetail_disbandConfirmTitle = (fbs: FbsRuntime) => fbs._("解散车队", null, { hk: "1viTsz" });
export const groupingDetail_disbandConfirmMessage = (fbs: FbsRuntime, p?: StringParams) => fbs._("确定解散「{title}」吗？所有报名将被清空。", [fbs._param("title", pv(p, "title"))], { hk: "3bqGvz" });
export const groupingDetail_complete = (fbs: FbsRuntime) => fbs._("完成车队", null, { hk: "3uoQwL" });
export const groupingDetail_completing = (fbs: FbsRuntime) => fbs._("完成中…", null, { hk: "2pxWpJ" });
export const groupingDetail_statusCompleted = (fbs: FbsRuntime) => fbs._("已完成", null, { hk: "2ZpgUr" });
export const groupingDetail_restore = (fbs: FbsRuntime) => fbs._("恢复车队", null, { hk: "2GzueF" });
export const groupingDetail_completeConfirmTitle = (fbs: FbsRuntime) => fbs._("完成车队", null, { hk: "3Cxz4X" });
export const groupingDetail_completeConfirmMessage = (fbs: FbsRuntime, p?: StringParams) => fbs._("确定完成「{title}」吗？完成后将从车队列表隐藏，也不再发送发车提醒；之后仍可在本页恢复。", [fbs._param("title", pv(p, "title"))], { hk: "3LzcLB" });
export const groupingDetail_toastCompleted = (fbs: FbsRuntime) => fbs._("车队已完成", null, { hk: "3RHtYh" });
export const groupingDetail_toastCompleteFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("完成失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "pOx3A" });
export const groupingDetail_toastRestored = (fbs: FbsRuntime) => fbs._("车队已恢复", null, { hk: "1vDQac" });
export const groupingDetail_toastRestoreFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("恢复失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "1HkMp8" });
export const groupingDetail_completedHint = (fbs: FbsRuntime) => fbs._("该车队已完成 · 已从列表隐藏，不再发送发车提醒", null, { hk: "2WmufQ" });
export const groupingDetail_rosterAnswersTitle = (fbs: FbsRuntime) => fbs._("报名表答案", null, { hk: "2ICCPM" });
export const groupingForm_createTitle = (fbs: FbsRuntime) => fbs._("张贴告示", null, { hk: "2if4Nm" });
export const groupingForm_editTitle = (fbs: FbsRuntime) => fbs._("编辑告示", null, { hk: "2ZHjx1" });
export const groupingForm_typeLabel = (fbs: FbsRuntime) => fbs._("类型", null, { hk: "3GuMNw" });
export const groupingForm_capacity = (fbs: FbsRuntime, p?: StringParams) => fbs._("人数上限 {max} 人（{hint}）", [fbs._param("max", pv(p, "max")), fbs._param("hint", pv(p, "hint"))], { hk: "3ZC0l6" });
export const groupingForm_hintActivity = (fbs: FbsRuntime) => fbs._("双十固定 10 人，不选副本", null, { hk: "4wWMM" });
export const groupingForm_hintDungeon = (fbs: FbsRuntime, p?: StringParams) => fbs._("按所选副本「{name}」{max} 人", [fbs._param("name", pv(p, "name")), fbs._param("max", pv(p, "max"))], { hk: "3Ond6Y" });
export const groupingForm_hintTalent = (fbs: FbsRuntime) => fbs._("天赋默认 5 人，选副本后按副本人数", null, { hk: "2UQGFu" });
export const groupingForm_hintRace = (fbs: FbsRuntime) => fbs._("竞速默认 10 人，选副本后按副本人数", null, { hk: "Vetdf" });
export const groupingForm_hintTower = (fbs: FbsRuntime) => fbs._("爬塔固定 10 人，不选副本", null, { hk: "3nAIwc" });
export const groupingForm_titleLabel = (fbs: FbsRuntime) => fbs._("标题", null, { hk: "3FK2Yy" });
export const groupingForm_titlePlaceholder = (fbs: FbsRuntime) => fbs._("如：周六晚双十来奶", null, { hk: "2KZJTY" });
export const groupingForm_startsLabel = (fbs: FbsRuntime) => fbs._("出发时间", null, { hk: "1j8pbx" });
export const groupingForm_monthOption = (fbs: FbsRuntime, p?: StringParams) => fbs._("{n}月", [fbs._param("n", pv(p, "n"))], { hk: "qKFsl" });
export const groupingForm_dayOption = (fbs: FbsRuntime, p?: StringParams) => fbs._("{n}日", [fbs._param("n", pv(p, "n"))], { hk: "1U3cMZ" });
export const groupingForm_hourOption = (fbs: FbsRuntime, p?: StringParams) => fbs._("{n}时", [fbs._param("n", pv(p, "n"))], { hk: "477MMe" });
export const groupingForm_minuteOption = (fbs: FbsRuntime, p?: StringParams) => fbs._("{n}分", [fbs._param("n", pv(p, "n"))], { hk: "Fvsjq" });
export const groupingForm_dungeonLabel = (fbs: FbsRuntime) => fbs._("副本（可选）", null, { hk: "1kITz0" });
export const groupingForm_dungeonNone = (fbs: FbsRuntime) => fbs._("不指定", null, { hk: "1IAOtB" });
export const groupingForm_nicknameLabel = (fbs: FbsRuntime) => fbs._("你的昵称（发车人自动落座 0 号位）", null, { hk: "3fBzGh" });
export const groupingForm_nicknamePlaceholder = (fbs: FbsRuntime) => fbs._("游戏内昵称", null, { hk: "2iaKtP" });
export const groupingForm_sectLabel = (fbs: FbsRuntime) => fbs._("你的流派", null, { hk: "25pXXR" });
export const groupingForm_submitCreate = (fbs: FbsRuntime) => fbs._("发布", null, { hk: "4iXt77" });
export const groupingForm_submitEdit = (fbs: FbsRuntime) => fbs._("保存", null, { hk: "1YzH3H" });
export const groupingForm_submitting = (fbs: FbsRuntime) => fbs._("提交中…", null, { hk: "4g4R3h" });
export const groupingForm_toastSect = (fbs: FbsRuntime) => fbs._("请选择你的流派", null, { hk: "3AfhYj" });
export const groupingForm_toastSaved = (fbs: FbsRuntime) => fbs._("已保存", null, { hk: "3r1utC" });
export const groupingForm_toastSaveFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("保存失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "X9H9D" });
export const groupingForm_toastPosted = (fbs: FbsRuntime) => fbs._("告示已张贴", null, { hk: "3gNP8m" });
export const groupingForm_toastCreateFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("创建失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "2Z4b2r" });
export const groupingForm_titleTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{nickname}的{type}车队", [fbs._param("nickname", pv(p, "nickname")), fbs._param("type", pv(p, "type"))], { hk: "3I3lZm" });
export const groupingForm_customFieldsTitle = (fbs: FbsRuntime) => fbs._("报名表自定义字段", null, { hk: "2DLDVn" });
export const groupingForm_customFieldAddLabel = (fbs: FbsRuntime) => fbs._("添加字段", null, { hk: "IDN35" });
export const groupingForm_customFieldLabelPlaceholder = (fbs: FbsRuntime) => fbs._("字段名（如：联系方式）", null, { hk: "xonoE" });
export const groupingForm_customFieldTypeText = (fbs: FbsRuntime) => fbs._("单行文本", null, { hk: "J1GOA" });
export const groupingForm_customFieldTypeChoice = (fbs: FbsRuntime) => fbs._("单选", null, { hk: "GKzKm" });
export const groupingForm_customFieldOptionsPlaceholder = (fbs: FbsRuntime) => fbs._("选项，一行一个（2–6 个）", null, { hk: "1ZUQFl" });
export const groupingForm_customFieldRequiredLabel = (fbs: FbsRuntime) => fbs._("必填", null, { hk: "1fvjhr" });
export const groupingForm_customFieldRemoveLabel = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "1GalTE" });
export const groupingForm_customFieldEmptyText = (fbs: FbsRuntime) => fbs._("未设置自定义字段时，成员报名只填固定信息。", null, { hk: "2o6Sjz" });
export const seat_emptyJoin = (fbs: FbsRuntime) => fbs._("空位 · 点击落座", null, { hk: "2gCqvY" });
export const seat_empty = (fbs: FbsRuntime) => fbs._("空位", null, { hk: "1YuSgX" });
export const seat_modalTitle = (fbs: FbsRuntime, p?: StringParams) => fbs._("落座 · {n} 号位", [fbs._param("n", pv(p, "n"))], { hk: "1j2oAn" });
export const seat_modalSubtitle = (fbs: FbsRuntime) => fbs._("人人可管 · 无需管理码", null, { hk: "1mHXoH" });
export const seat_nameLabel = (fbs: FbsRuntime) => fbs._("名字", null, { hk: "V7imB" });
export const seat_namePlaceholder = (fbs: FbsRuntime) => fbs._("你的名字", null, { hk: "2LxN40" });
export const seat_nameRequired = (fbs: FbsRuntime) => fbs._("请填写名字", null, { hk: "b1hhN" });
export const seat_selfTab = (fbs: FbsRuntime) => fbs._("自己报名", null, { hk: "3cGlqv" });
export const seat_proxyTab = (fbs: FbsRuntime) => fbs._("代报名", null, { hk: "323xwD" });
export const seat_selfNameHint = (fbs: FbsRuntime) => fbs._("名字取自你的 Discord 昵称，不可修改", null, { hk: "1zrx54" });
export const seat_proxySearchPlaceholder = (fbs: FbsRuntime) => fbs._("搜索成员名字", null, { hk: "2Zfx1F" });
export const seat_proxyPickRequired = (fbs: FbsRuntime) => fbs._("请选择要代报的成员", null, { hk: "4h89Rs" });
export const seat_proxyEmpty = (fbs: FbsRuntime) => fbs._("名册里还没有成员", null, { hk: "1rYTOn" });
export const seat_sectLabel = (fbs: FbsRuntime) => fbs._("流派", null, { hk: "1zx56S" });
export const seat_confirmJoin = (fbs: FbsRuntime) => fbs._("确认落座", null, { hk: "9qXPZ" });
export const seat_joining = (fbs: FbsRuntime) => fbs._("落座中…", null, { hk: "1k5xDe" });
export const seat_toastSect = (fbs: FbsRuntime) => fbs._("请选择流派", null, { hk: "46LE9b" });
export const seat_toastJoined = (fbs: FbsRuntime) => fbs._("落座成功", null, { hk: "4y4FIW" });
export const seat_toastJoinFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("报名失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "4pwoLk" });
export const seat_toastLeft = (fbs: FbsRuntime) => fbs._("已取消报名", null, { hk: "eE9Cf" });
export const seat_toastLeaveFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("取消失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "3cOOqd" });
export const seat_leaveConfirmTitle = (fbs: FbsRuntime) => fbs._("取消报名", null, { hk: "2UTW6n" });
export const seat_leaveConfirmMessage = (fbs: FbsRuntime, p?: StringParams) => fbs._("确定取消「{nickname}」的报名吗？", [fbs._param("nickname", pv(p, "nickname"))], { hk: "4eNe7M" });
export const seat_roleHealer = (fbs: FbsRuntime) => fbs._("奶", null, { hk: "21AMbF" });
export const seat_roleDps = (fbs: FbsRuntime) => fbs._("输出", null, { hk: "1hQI77" });
export const seat_leader = (fbs: FbsRuntime) => fbs._("车头", null, { hk: "3g1KD2" });
export const seat_readyMark = (fbs: FbsRuntime) => fbs._("已就位", null, { hk: "3gsY37" });
export const seat_readyAction = (fbs: FbsRuntime) => fbs._("我已就位", null, { hk: "4Far4z" });
export const seat_unreadyAction = (fbs: FbsRuntime) => fbs._("取消就位", null, { hk: "1zNvU0" });
export const seat_toastReady = (fbs: FbsRuntime) => fbs._("已标记就位", null, { hk: "2f6aOP" });
export const seat_toastUnready = (fbs: FbsRuntime) => fbs._("已取消就位", null, { hk: "2yeuHM" });
export const seat_toastReadyFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("操作失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "3dqRNR" });
export const appBlocks_rosterTitle = (fbs: FbsRuntime) => fbs._("队伍名册", null, { hk: "3DkQ89" });
export const appBlocks_closedStatus = (fbs: FbsRuntime) => fbs._("已关闭", null, { hk: "2YGpco" });
export const appBlocks_completedStatus = (fbs: FbsRuntime) => fbs._("已完成", null, { hk: "3Nonz2" });
export const appBlocks_unknownBlock = (fbs: FbsRuntime) => fbs._("该内容需要更新 App 后显示", null, { hk: "1hwid8" });
export const dex_backToDex = (fbs: FbsRuntime) => fbs._("‹ 返回攻略", null, { hk: "GP0PX" });
export const dex_bossesLine = (fbs: FbsRuntime, p?: StringParams) => fbs._("{count} 位首领", [fbs._param("count", pv(p, "count"))], { hk: "EhIYn" });
export const dex_noBossData = (fbs: FbsRuntime) => fbs._("暂无 Boss 数据", null, { hk: "rshdc" });
export const dex_empty = (fbs: FbsRuntime) => fbs._("暂无攻略", null, { hk: "1n8U5h" });
export const dex_currentGuides = (fbs: FbsRuntime, p?: StringParams) => fbs._("当期攻略 · {category}", [fbs._param("category", pv(p, "category"))], { hk: "4w4Opf" });
export const dex_catSub = (fbs: FbsRuntime, p?: StringParams) => fbs._("{season} · {seasonName}", [fbs._param("season", pv(p, "season")), fbs._param("seasonName", pv(p, "seasonName"))], { hk: "uWuXy" });
export const dex_catSubCurrent = (fbs: FbsRuntime, p?: StringParams) => fbs._("{season} · {seasonName} · 版本 {version}", [
	fbs._param("season", pv(p, "season")),
	fbs._param("seasonName", pv(p, "seasonName")),
	fbs._param("version", pv(p, "version"))
], { hk: "3cWHub" });
export const dex_size10 = (fbs: FbsRuntime) => fbs._("十人本", null, { hk: "zKTRY" });
export const dex_size5 = (fbs: FbsRuntime) => fbs._("五人本", null, { hk: "1sC8oB" });
export const dex_sizeN = (fbs: FbsRuntime, p?: StringParams) => fbs._("{n}人本", [fbs._param("n", pv(p, "n"))], { hk: "2oQXOb" });
export const dex_bossUnit = (fbs: FbsRuntime) => fbs._("首领", null, { hk: "3FD2eL" });
export const dex_partMechanics = (fbs: FbsRuntime) => fbs._("机制", null, { hk: "4160zn" });
export const dex_partShouts = (fbs: FbsRuntime) => fbs._("喊话", null, { hk: "CTS01" });
export const dex_partTalents = (fbs: FbsRuntime) => fbs._("天赋", null, { hk: "2ooolG" });
export const dex_labelAll = (fbs: FbsRuntime, p?: StringParams) => fbs._("{count}位首领 · {parts}俱全", [fbs._param("count", pv(p, "count")), fbs._param("parts", pv(p, "parts"))], { hk: "4A6V89" });
export const dex_labelParts = (fbs: FbsRuntime, p?: StringParams) => fbs._("{count}位首领 · {parts}", [fbs._param("count", pv(p, "count")), fbs._param("parts", pv(p, "parts"))], { hk: "1X0sPP" });
export const dex_labelPending = (fbs: FbsRuntime, p?: StringParams) => fbs._("{count}位首领 · 攻略待补", [fbs._param("count", pv(p, "count"))], { hk: "pJw7S" });
export const dex_labelNoBosses = (fbs: FbsRuntime) => fbs._("首领待补", null, { hk: "2alZvi" });
export const dex_sealBoss = (fbs: FbsRuntime) => fbs._("将", null, { hk: "4dcgwj" });
export const boss_back = (fbs: FbsRuntime) => fbs._("‹ 返回", null, { hk: "48jekW" });
export const boss_notFound = (fbs: FbsRuntime) => fbs._("Boss 不存在", null, { hk: "2Bt5pu" });
export const boss_tabMechanics = (fbs: FbsRuntime) => fbs._("机制", null, { hk: "2BIvk9" });
export const boss_tabTalents = (fbs: FbsRuntime) => fbs._("天赋", null, { hk: "188RLy" });
export const boss_shoutsTitle = (fbs: FbsRuntime) => fbs._("📢 喊话宏", null, { hk: "3QoYl2" });
export const boss_copy = (fbs: FbsRuntime) => fbs._("复制", null, { hk: "3ReM89" });
export const boss_shoutCopied = (fbs: FbsRuntime) => fbs._("喊话已复制", null, { hk: "FIBAo" });
export const boss_copyFailed = (fbs: FbsRuntime) => fbs._("复制失败", null, { hk: "1IRlWh" });
export const boss_copyManual = (fbs: FbsRuntime) => fbs._("请手动复制", null, { hk: "2wAUs3" });
export const boss_noMechanics = (fbs: FbsRuntime) => fbs._("暂无机制", null, { hk: "1RbSsQ" });
export const boss_noTalents = (fbs: FbsRuntime) => fbs._("暂无天赋", null, { hk: "1QQloH" });
export const boss_talentTitle = (fbs: FbsRuntime, p?: StringParams) => fbs._("天赋 {code}", [fbs._param("code", pv(p, "code"))], { hk: "1xEAHf" });
export const boss_talentPending = (fbs: FbsRuntime) => " " + fbs._("· 待确认", null, { hk: "1fHrxs" });
export const sect_empty = (fbs: FbsRuntime) => fbs._("暂无流派", null, { hk: "1nn2V3" });
export const sect_back = (fbs: FbsRuntime) => fbs._("‹ 返回流派", null, { hk: "1HPJ9u" });
export const sect_tabBis = (fbs: FbsRuntime) => fbs._("毕业词条", null, { hk: "2VRpEl" });
export const sect_tabRotation = (fbs: FbsRuntime) => fbs._("输出轴", null, { hk: "26U8wO" });
export const sect_tabRates = (fbs: FbsRuntime) => fbs._("三率目标", null, { hk: "2xLfOo" });
export const sect_tabTiaolv = (fbs: FbsRuntime) => fbs._("调律推演", null, { hk: "XqxUl" });
export const sect_tabGrad = (fbs: FbsRuntime) => fbs._("武库鉴宝", null, { hk: "3BHuVO" });
export const sect_noBis = (fbs: FbsRuntime) => fbs._("暂无毕业词条", null, { hk: "2kzwDh" });
export const sect_noRotation = (fbs: FbsRuntime) => fbs._("暂无输出轴", null, { hk: "3C6iz4" });
export const sect_noRates = (fbs: FbsRuntime) => fbs._("暂无三率目标", null, { hk: "bd2DC" });
export const sect_rotGreydust = (fbs: FbsRuntime) => fbs._("一分钟木桩轴", null, { hk: "2aTWP7" });
export const sect_rotOpener = (fbs: FbsRuntime) => fbs._("起手", null, { hk: "2HglyR" });
export const sect_rotLoop = (fbs: FbsRuntime) => fbs._("循环", null, { hk: "mjtjZ" });
export const sect_rotKeyPoints = (fbs: FbsRuntime) => fbs._("要点", null, { hk: "4nrcZx" });
export const sect_rotInnerSkills = (fbs: FbsRuntime) => fbs._("心法", null, { hk: "3Rm4gP" });
export const sect_rotVideo = (fbs: FbsRuntime) => fbs._("视频攻略", null, { hk: "ZCgjO" });
export const sect_rateAccuracy = (fbs: FbsRuntime) => fbs._("精准", null, { hk: "2AeGqy" });
export const sect_rateCrit = (fbs: FbsRuntime) => fbs._("会心", null, { hk: "2HYy58" });
export const sect_rateCritDamage = (fbs: FbsRuntime) => fbs._("会意", null, { hk: "2NISlu" });
export const sect_bisMainWeapon = (fbs: FbsRuntime) => fbs._("主武器", null, { hk: "2xLZ0B" });
export const sect_bisOffWeapon = (fbs: FbsRuntime) => fbs._("副武器", null, { hk: "29LKLY" });
export const sect_bisAccessories = (fbs: FbsRuntime) => fbs._("环佩", null, { hk: "1xr2Xu" });
export const sect_bisHeadBody = (fbs: FbsRuntime) => fbs._("头衣", null, { hk: "5q234" });
export const sect_bisLegsWrists = (fbs: FbsRuntime) => fbs._("腿腕", null, { hk: "2V4vsW" });
export const sect_tabAffix = (fbs: FbsRuntime) => fbs._("毕业词缀", null, { hk: "3PpHTl" });
export const sect_affixEmpty = (fbs: FbsRuntime) => fbs._("暂无毕业词缀", null, { hk: "2VvGck" });
export const sect_affixSetLabel = (fbs: FbsRuntime) => fbs._("套装", null, { hk: "3Enl6Q" });
export const sect_affixBowLabel = (fbs: FbsRuntime) => fbs._("弓玦", null, { hk: "1AajFm" });
export const sect_affixDingyinLabel = (fbs: FbsRuntime) => fbs._("定音", null, { hk: "26KxhC" });
export const sect_affixColAffix = (fbs: FbsRuntime) => fbs._("词缀", null, { hk: "16EKBF" });
export const sect_affixColCount = (fbs: FbsRuntime) => fbs._("条数", null, { hk: "4mwXYi" });
export const sect_affixColMax = (fbs: FbsRuntime) => fbs._("满值", null, { hk: "eId1V" });
export const sect_affixColCy = (fbs: FbsRuntime) => fbs._("承音", null, { hk: "4FnHSO" });
export const sect_affixSource = (fbs: FbsRuntime) => fbs._("按 100 阶毕业配方整理，与配装台同一口径；满值、承音为单条词缀上限。", null, { hk: "1MY2sq" });
export const tiaolv_intro = (fbs: FbsRuntime) => fbs._("调律推演 · 复刻 bilibili@片雲 DIY 0.10.2（100级）伤害计算器逻辑", null, { hk: "xKnus" });
export const tiaolv_innerSkill = (fbs: FbsRuntime, p?: StringParams) => fbs._("心法{n}", [fbs._param("n", pv(p, "n"))], { hk: "2jqPjk" });
export const tiaolv_innerSkillPlaceholder = (fbs: FbsRuntime) => fbs._("心法名", null, { hk: "4Mj94" });
export const tiaolv_wuxue = (fbs: FbsRuntime) => fbs._("武学", null, { hk: "3dhSON" });
export const tiaolv_wuku = (fbs: FbsRuntime) => fbs._("武库", null, { hk: "XYxXn" });
export const tiaolv_wukuSelf = (fbs: FbsRuntime) => fbs._("本系", null, { hk: "3w8iOp" });
export const tiaolv_wukuCommon = (fbs: FbsRuntime) => fbs._("通用", null, { hk: "2xPWC9" });
export const tiaolv_suit = (fbs: FbsRuntime) => fbs._("套装", null, { hk: "YjsNP" });
export const tiaolv_bow = (fbs: FbsRuntime) => fbs._("弓决", null, { hk: "38Tf0A" });
export const tiaolv_none = (fbs: FbsRuntime) => fbs._("无", null, { hk: "rH9It" });
export const tiaolv_tuneArea = (fbs: FbsRuntime) => fbs._("调律区（K:R 列，对应 Excel K3:R5, K6:R24）", null, { hk: "p72sz" });
export const tiaolv_calc = (fbs: FbsRuntime) => fbs._("开始推演", null, { hk: "4BLTKr" });
export const tiaolv_calculating = (fbs: FbsRuntime) => fbs._("推演中…", null, { hk: "qGaJh" });
export const tiaolv_toastFailed = (fbs: FbsRuntime) => fbs._("计算失败", null, { hk: "1BD4dr" });
export const tiaolv_toastFailedWith = (fbs: FbsRuntime, p?: StringParams) => fbs._("计算失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "2JHtzB" });
export const tiaolv_colAttr = (fbs: FbsRuntime) => fbs._("属性", null, { hk: "SD6RS" });
export const tiaolv_colBase = (fbs: FbsRuntime) => fbs._("基础白值", null, { hk: "30sYgQ" });
export const tiaolv_colPanel = (fbs: FbsRuntime) => fbs._("面板白值", null, { hk: "315ddm" });
export const tiaolv_colFinal = (fbs: FbsRuntime) => fbs._("最终面板", null, { hk: "14LkAK" });
export const grad_entering = (fbs: FbsRuntime) => fbs._("正在进入武库…", null, { hk: "3ORrmk" });
export const grad_title = (fbs: FbsRuntime) => fbs._("武库鉴宝", null, { hk: "4x79Cr" });
export const grad_subtitle = (fbs: FbsRuntime) => fbs._("条数50% · 数值30% · 三率20%", null, { hk: "3XPjcv" });
export const grad_mingjinNote = (fbs: FbsRuntime) => fbs._("鸣金 · 大外会意流", null, { hk: "1l1zwq" });
export const grad_buildBig = (fbs: FbsRuntime) => fbs._("大外", null, { hk: "OsDVe" });
export const grad_buildSmall = (fbs: FbsRuntime) => fbs._("小外", null, { hk: "1P2b7v" });
export const grad_ringLabel = (fbs: FbsRuntime) => fbs._("毕业率", null, { hk: "4qywKu" });
export const grad_scoreCount = (fbs: FbsRuntime) => fbs._("条数匹配", null, { hk: "VlieX" });
export const grad_scoreValue = (fbs: FbsRuntime) => fbs._("数值达成", null, { hk: "kVEgR" });
export const grad_scoreRate = (fbs: FbsRuntime) => fbs._("三率达标", null, { hk: "40YIA1" });
export const grad_tier1 = (fbs: FbsRuntime) => fbs._("天人合一", null, { hk: "2EeKpV" });
export const grad_tier2 = (fbs: FbsRuntime) => fbs._("登峰造极", null, { hk: "36U3RW" });
export const grad_tier3 = (fbs: FbsRuntime) => fbs._("炉火纯青", null, { hk: "2pnyqw" });
export const grad_tier4 = (fbs: FbsRuntime) => fbs._("小有所成", null, { hk: "49EmwB" });
export const grad_tier5 = (fbs: FbsRuntime) => fbs._("初窥门径", null, { hk: "1BzJ98" });
export const grad_tier6 = (fbs: FbsRuntime) => fbs._("凡铁未炼", null, { hk: "3ojv4W" });
export const grad_tapHint = (fbs: FbsRuntime) => fbs._("轻触装备以镌刻词条", null, { hk: "3HeLov" });
export const grad_refTitle = (fbs: FbsRuntime) => fbs._("📖 参考数据 · 词条满值与版位", null, { hk: "2OEwck" });
export const grad_maxTableTitle = (fbs: FbsRuntime) => fbs._("词条满值表（100阶）", null, { hk: "4kYhuB" });
export const grad_colAffix = (fbs: FbsRuntime) => fbs._("词条", null, { hk: "3PpLky" });
export const grad_colMax = (fbs: FbsRuntime) => fbs._("满值", null, { hk: "VyZKd" });
export const grad_colResonance = (fbs: FbsRuntime) => fbs._("承音（95%)", null, { hk: "14RNqj" });
export const grad_slotTableTitle = (fbs: FbsRuntime, p?: StringParams) => fbs._("部位版位表（{build}）", [fbs._param("build", pv(p, "build"))], { hk: "BpqwT" });
export const grad_rateTitle = (fbs: FbsRuntime) => fbs._("⚡ 三率速算", null, { hk: "h65pG" });
export const grad_rateOk = (fbs: FbsRuntime, p?: StringParams) => fbs._("{v} ✓", [fbs._param("v", pv(p, "v"))], { hk: "2yR10d" });
export const grad_rateGap = (fbs: FbsRuntime, p?: StringParams) => fbs._("{v} （差{gap}）", [fbs._param("v", pv(p, "v")), fbs._param("gap", pv(p, "gap"))], { hk: "sKEhV" });
export const grad_rateOverflow = (fbs: FbsRuntime, p?: StringParams) => fbs._("⚠️ 会心+会意={sum}>100，会意挤占会心", [fbs._param("sum", pv(p, "sum"))], { hk: "ZWubl" });
export const grad_compareTitle = (fbs: FbsRuntime) => fbs._("⚔️ 方案对比", null, { hk: "2bDsft" });
export const grad_saveScheme = (fbs: FbsRuntime) => fbs._("💾 保存当前配装为方案", null, { hk: "1q6Dfu" });
export const grad_schemeName = (fbs: FbsRuntime, p?: StringParams) => fbs._("方案{n}", [fbs._param("n", pv(p, "n"))], { hk: "iP58k" });
export const grad_noSchemes = (fbs: FbsRuntime) => fbs._("暂无方案，先填好装备再保存", null, { hk: "19NTg6" });
export const grad_load = (fbs: FbsRuntime) => fbs._("载入", null, { hk: "Ku4mt" });
export const grad_deleteScheme = (fbs: FbsRuntime) => fbs._("删除方案", null, { hk: "2p79rN" });
export const grad_itemScore = (fbs: FbsRuntime, p?: StringParams) => fbs._("本件 {score}%", [fbs._param("score", pv(p, "score"))], { hk: "16GG9c" });
export const grad_rowMain = (fbs: FbsRuntime) => fbs._("主词条", null, { hk: "2jGdya" });
export const grad_rowSub = (fbs: FbsRuntime, p?: StringParams) => fbs._("副词条{n}", [fbs._param("n", pv(p, "n"))], { hk: "vsfjK" });
export const grad_rowResonance = (fbs: FbsRuntime) => fbs._("定音", null, { hk: "2IoF6H" });
export const grad_ratePrecision = (fbs: FbsRuntime) => fbs._("精准", null, { hk: "2vSyyP" });
export const grad_rateCrit = (fbs: FbsRuntime) => fbs._("会心", null, { hk: "1IhDD7" });
export const grad_rateAffinity = (fbs: FbsRuntime) => fbs._("会意", null, { hk: "2pX9a2" });
export const grad_affixPlaceholder = (fbs: FbsRuntime) => fbs._("— 待镌刻 —", null, { hk: "3daHQR" });
export const grad_affixLoading = (fbs: FbsRuntime) => fbs._("词条数据加载中…", null, { hk: "2TUyPm" });
export const grad_valuePlaceholderMax = (fbs: FbsRuntime, p?: StringParams) => fbs._("数值 / {max}", [fbs._param("max", pv(p, "max"))], { hk: "11leO4" });
export const grad_valuePlaceholder = (fbs: FbsRuntime) => fbs._("数值", null, { hk: "45srMh" });
export const grad_resonance = (fbs: FbsRuntime) => fbs._("承音", null, { hk: "3HpWKQ" });
export const grad_overMax = (fbs: FbsRuntime, p?: StringParams) => fbs._("超过满值 {max}，将按满值计算", [fbs._param("max", pv(p, "max"))], { hk: "26Hpge" });
export const grad_toastSaved = (fbs: FbsRuntime, p?: StringParams) => fbs._("已保存方案「{name}」", [fbs._param("name", pv(p, "name"))], { hk: "FHZfc" });
export const grad_toastLoaded = (fbs: FbsRuntime, p?: StringParams) => fbs._("已载入方案「{name}」", [fbs._param("name", pv(p, "name"))], { hk: "1migJf" });
export const grad_toastOldScheme = (fbs: FbsRuntime) => fbs._("旧方案只保存了分数，无法载入配装", null, { hk: "2ZGG3u" });
export const gear_calcLabel = (fbs: FbsRuntime) => fbs._("计算", null, { hk: "2kLCD4" });
export const gear_benchTitle = (fbs: FbsRuntime) => fbs._("配装台", null, { hk: "1K2f4q" });
export const gear_benchIntro = (fbs: FbsRuntime) => fbs._("100 阶配装：按流派配方拼装备、算面板与毕业度（口径：条数 40% + 数值 24% + 定音 20%，与上方毕业计算的口径不同）。装备库与方案保存在你的 Discord 账号下，换设备也能用。", null, { hk: "1wK3RF" });
export const gear_targetLabel = (fbs: FbsRuntime) => fbs._("目标流派", null, { hk: "1kdjnX" });
export const gear_bowLabel = (fbs: FbsRuntime) => fbs._("弓玦", null, { hk: "34xSPl" });
export const gear_bowNoneLabel = (fbs: FbsRuntime) => fbs._("无", null, { hk: "4avWGd" });
export const gear_extrasTitle = (fbs: FbsRuntime) => fbs._("其他来源加成", null, { hk: "4yvpq7" });
export const gear_resLabel = (fbs: FbsRuntime) => fbs._("抗性", null, { hk: "3g1w0Q" });
export const gear_extraAccLabel = (fbs: FbsRuntime) => fbs._("白字精准（手填）", null, { hk: "35QYtU" });
export const gear_extraCritLabel = (fbs: FbsRuntime) => fbs._("白字会心（手填）", null, { hk: "3ILVKb" });
export const gear_extraIntLabel = (fbs: FbsRuntime) => fbs._("白字会意（手填）", null, { hk: "1G95ny" });
export const gear_baseTitle = (fbs: FbsRuntime) => fbs._("角色基础", null, { hk: "HGR1O" });
export const gear_unlockLabel = (fbs: FbsRuntime) => fbs._("解锁", null, { hk: "34oqrL" });
export const gear_lockLabel = (fbs: FbsRuntime) => fbs._("锁定", null, { hk: "2kGaTl" });
export const gear_modifiedTag = (fbs: FbsRuntime) => fbs._("已改", null, { hk: "3sJauA" });
export const gear_baseResetLabel = (fbs: FbsRuntime) => fbs._("恢复预设", null, { hk: "1RNJ44" });
export const gear_baseResetTitle = (fbs: FbsRuntime) => fbs._("恢复预设？", null, { hk: "vc9fT" });
export const gear_baseResetBody = (fbs: FbsRuntime) => fbs._("角色基础将回到预设值，心法选择保留。", null, { hk: "1ptiAP" });
export const gear_xinfaLabelTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("心法 {n}", [fbs._param("n", pv(p, "n"))], { hk: "20ZwzO" });
export const gear_xinfaNoneLabel = (fbs: FbsRuntime) => fbs._("— 不选 —", null, { hk: "46K6vA" });
export const gear_loginHint = (fbs: FbsRuntime) => fbs._("装备库与方案按你的 Discord 账号保存，登录后可用（计算与参考数据无需登录）。", null, { hk: "3o4TzZ" });
export const gear_libTitle = (fbs: FbsRuntime) => fbs._("装备库", null, { hk: "29CS95" });
export const gear_myLibTitle = (fbs: FbsRuntime) => fbs._("我的装备库", null, { hk: "1pgRT0" });
export const gear_myBuildsTitle = (fbs: FbsRuntime) => fbs._("我的方案", null, { hk: "474ufs" });
export const gear_libCountTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("共 {n} 件", [fbs._param("n", pv(p, "n"))], { hk: "29Bsbl" });
export const gear_usageTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("已存 {n} / {limit} 件", [fbs._param("n", pv(p, "n")), fbs._param("limit", pv(p, "limit"))], { hk: "uPN2o" });
export const gear_usageNearLimitText = (fbs: FbsRuntime) => fbs._("装备库快满了，导入新装备前先清理不用的装备", null, { hk: "1oHkuC" });
export const gear_formSlotLabel = (fbs: FbsRuntime) => fbs._("部位", null, { hk: "3SIgEj" });
export const gear_formNameLabel = (fbs: FbsRuntime) => fbs._("名称", null, { hk: "EyEyK" });
export const gear_formNamePlaceholder = (fbs: FbsRuntime) => fbs._("装备名（可空）", null, { hk: "1zpr6v" });
export const gear_affixPlaceholder = (fbs: FbsRuntime) => fbs._("选词条", null, { hk: "2FvZa9" });
export const gear_valuePlaceholder = (fbs: FbsRuntime) => fbs._("数值", null, { hk: "4k2wu0" });
export const gear_refTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("满值 {max} / 承音 {cy}", [fbs._param("max", pv(p, "max")), fbs._param("cy", pv(p, "cy"))], { hk: "JcCgj" });
export const gear_fillMaxLabel = (fbs: FbsRuntime) => fbs._("填满值", null, { hk: "e6Hwa" });
export const gear_fillCyLabel = (fbs: FbsRuntime) => fbs._("填承音", null, { hk: "qFM4n" });
export const gear_delRowLabel = (fbs: FbsRuntime) => fbs._("删此行", null, { hk: "18L69d" });
export const gear_addRowLabel = (fbs: FbsRuntime) => fbs._("加一行", null, { hk: "2MhrV1" });
export const gear_dyNameLabel = (fbs: FbsRuntime) => fbs._("定音名称", null, { hk: "1R819K" });
export const gear_dyNamePlaceholder = (fbs: FbsRuntime) => fbs._("如 外功穿透 / 无名剑法·蓄力技增伤", null, { hk: "36gPAs" });
export const gear_dyValLabel = (fbs: FbsRuntime) => fbs._("定音数值", null, { hk: "2sQLHA" });
export const gear_schoolsLabel = (fbs: FbsRuntime) => fbs._("流派标签（武器）", null, { hk: "2C9XYw" });
export const gear_addGearLabel = (fbs: FbsRuntime) => fbs._("存入装备库", null, { hk: "1FyM8n" });
export const gear_updateGearLabel = (fbs: FbsRuntime) => fbs._("保存修改", null, { hk: "3dWDoQ" });
export const gear_cancelEditLabel = (fbs: FbsRuntime) => fbs._("取消编辑", null, { hk: "yvQPZ" });
export const gear_demoLabel = (fbs: FbsRuntime) => fbs._("载入示例套", null, { hk: "29Zox3" });
export const gear_clearLibLabel = (fbs: FbsRuntime) => fbs._("清空装备库", null, { hk: "4u6XIj" });
export const gear_clearConfirmTitle = (fbs: FbsRuntime) => fbs._("清空装备库？", null, { hk: "4sK2X9" });
export const gear_clearConfirmBody = (fbs: FbsRuntime) => fbs._("你账号下的全部装备与方案都会删除，当前搭配也会清空，此操作不可恢复。", null, { hk: "38FtqH" });
export const gear_equipLabel = (fbs: FbsRuntime) => fbs._("选入", null, { hk: "33DB2v" });
export const gear_unequipLabel = (fbs: FbsRuntime) => fbs._("卸下", null, { hk: "4qcTjb" });
export const gear_editLabel = (fbs: FbsRuntime) => fbs._("编辑", null, { hk: "3sGW5y" });
export const gear_deleteLabel = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "2ybcd4" });
export const gear_simLabel = (fbs: FbsRuntime) => fbs._("模拟", null, { hk: "2kj8uB" });
export const gear_simRealLabel = (fbs: FbsRuntime) => fbs._("实际", null, { hk: "4CbeUi" });
export const gear_simCyLabel = (fbs: FbsRuntime) => fbs._("承音", null, { hk: "6ICcQ" });
export const gear_simMaxLabel = (fbs: FbsRuntime) => fbs._("满值", null, { hk: "NeQqC" });
export const gear_verdictHeirloom = (fbs: FbsRuntime) => fbs._("传家宝", null, { hk: "4wMZCA" });
export const gear_verdictDud = (fbs: FbsRuntime) => fbs._("拉完了", null, { hk: "1BVStm" });
export const gear_scoreTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("评分 {score}", [fbs._param("score", pv(p, "score"))], { hk: "2n0qfX" });
export const gear_qualityLabel = (fbs: FbsRuntime) => fbs._("数值达成", null, { hk: "2VZfM3" });
export const gear_exportLabel = (fbs: FbsRuntime) => fbs._("导出数据", null, { hk: "DPENA" });
export const gear_exportFileName = (fbs: FbsRuntime) => fbs._("100阶配装数据.json", null, { hk: "uPYjV" });
export const gear_importNameTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("导入 · {slot}", [fbs._param("slot", pv(p, "slot"))], { hk: "4bhbtM" });
export const gear_importLabel = (fbs: FbsRuntime) => fbs._("导入数据", null, { hk: "1puJ5B" });
export const gear_importFailedToast = (fbs: FbsRuntime) => fbs._("导入失败：文件无效", null, { hk: "2zTvFc" });
export const gear_importedToastTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("已导入 {n} 件", [fbs._param("n", pv(p, "n"))], { hk: "2xdGoD" });
export const gear_manualTitle = (fbs: FbsRuntime) => fbs._("手动录入", null, { hk: "2E7B70" });
export const gear_pasteTitle = (fbs: FbsRuntime) => fbs._("粘贴代码导入", null, { hk: "Yp0xy" });
export const gear_pastePlaceholder = (fbs: FbsRuntime) => fbs._("把装备数据代码粘到这里（JSON / Base64 / 文本均可）", null, { hk: "27wtI6" });
export const gear_pasteButtonLabel = (fbs: FbsRuntime) => fbs._("解析并导入装备库", null, { hk: "2Xx6Fb" });
export const gear_pasteDemoLabel = (fbs: FbsRuntime) => fbs._("填入示例代码", null, { hk: "2KDdRA" });
export const gear_pasteEmptyText = (fbs: FbsRuntime) => fbs._("先把代码粘到上面的框里再点解析。", null, { hk: "3LqYU6" });
export const gear_pasteOkTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("✓ 已按「{mode}」解析，导入 {n} 件装备 / {lines} 条词条，已自动选入搭配。", [
	fbs._param("mode", pv(p, "mode")),
	fbs._param("n", pv(p, "n")),
	fbs._param("lines", pv(p, "lines"))
], { hk: "34sVb" });
export const gear_pasteUnknownTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("另有 {n} 条没认出的字段被跳过（多半是气血、防御、外功穿透这类本站不计的词条）。", [fbs._param("n", pv(p, "n"))], { hk: "4kjkKf" });
export const gear_pasteFailText = (fbs: FbsRuntime) => fbs._("没能从这段代码里认出装备。常见原因：复制时漏了一头一尾、复制的是角色外观分享码（不含装备数值）、或这份数据的字段格式本站还没适配。", null, { hk: "3Rgv6z" });
export const gear_pasteFullText = (fbs: FbsRuntime) => fbs._("识别为本工具导出的数据，已按整库导入处理。", null, { hk: "3N27QR" });
export const gear_ocrTitle = (fbs: FbsRuntime) => fbs._("截图导入（本地识别，不上传）", null, { hk: "4CCfbj" });
export const gear_ocrDropText = (fbs: FbsRuntime) => fbs._("点这里选一张装备详情截图，或拖进来 / Ctrl+V 粘贴", null, { hk: "2W43tH" });
export const gear_ocrPreparingText = (fbs: FbsRuntime) => fbs._("正在准备图片…", null, { hk: "26RxjO" });
export const gear_ocrRunningText = (fbs: FbsRuntime) => fbs._("正在识别（首次会下载中文 + 英文识别包，可能要十几秒）…", null, { hk: "1TYlTe" });
export const gear_ocrSecondText = (fbs: FbsRuntime) => fbs._("正在增强识别（第二遍）…", null, { hk: "2Upo35" });
export const gear_ocrFailedText = (fbs: FbsRuntime) => fbs._("识别失败了。常见原因：网络不通下不到识别包、图片太模糊。可以换一张更清晰、完整的详情页截图再试。", null, { hk: "paBas" });
export const gear_ocrBadTypeText = (fbs: FbsRuntime) => fbs._("这张图格式不对，只支持 PNG / JPEG / WebP 截图。", null, { hk: "3vqEQa" });
export const gear_ocrTooBigText = (fbs: FbsRuntime) => fbs._("图片超过 15MB，换一张小一点的截图。", null, { hk: "1lKcJR" });
export const gear_ocrNoEngineText = (fbs: FbsRuntime) => fbs._("识别组件没能加载（OCR 引擎需要联网从 CDN 载入）。检查网络后刷新页面再试；粘贴代码导入不受影响。", null, { hk: "2q3N9Q" });
export const gear_ocrDoneTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("✓ 识别完成：认出 {n} 条词条{slotPart}{dyPart}。请逐行核对数值再确认存入。", [
	fbs._param("n", pv(p, "n")),
	fbs._param("slotPart", pv(p, "slotPart")),
	fbs._param("dyPart", pv(p, "dyPart"))
], { hk: "oJviZ" });
export const gear_ocrSlotLabel = (fbs: FbsRuntime) => fbs._("部位", null, { hk: "2CiU41" });
export const gear_ocrNameLabel = (fbs: FbsRuntime) => fbs._("名称", null, { hk: "2umFBC" });
export const gear_ocrEquipLabel = (fbs: FbsRuntime) => fbs._("存入后直接选入搭配", null, { hk: "3J3VVR" });
export const gear_ocrConfirmLabel = (fbs: FbsRuntime) => fbs._("确认存入", null, { hk: "3r4Zg4" });
export const gear_ocrCancelLabel = (fbs: FbsRuntime) => fbs._("放弃", null, { hk: "QBedJ" });
export const gear_ocrUnknownTitle = (fbs: FbsRuntime) => fbs._("下面这些行没认出词条，已原样列出（不会丢行）：需要的话点「补一条词条行」手动加上；纯界面文字可忽略。", null, { hk: "1Ijdtk" });
export const gear_ocrSavedTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("✓ 已存入装备库：{slot}（{n} 条词条）", [fbs._param("slot", pv(p, "slot")), fbs._param("n", pv(p, "n"))], { hk: "8uNKY" });
export const gear_ocrNeedLineToast = (fbs: FbsRuntime) => fbs._("至少保留一条有效词条再确认", null, { hk: "3WGSLg" });
export const gear_ocrLowConfTag = (fbs: FbsRuntime) => fbs._("低置信，请核对", null, { hk: "1N2fGy" });
export const gear_ocrAddRowLabel = (fbs: FbsRuntime) => fbs._("补一条词条行", null, { hk: "2VJpfv" });
export const gear_ocrImportSlotTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("导入{slot}", [fbs._param("slot", pv(p, "slot"))], { hk: "1akSw1" });
export const gear_ocrBatchTitle = (fbs: FbsRuntime) => fbs._("批量截图识别（全屏截图自动框选 · 本地识别，不上传）", null, { hk: "1cOsFj" });
export const gear_ocrBatchDropText = (fbs: FbsRuntime) => fbs._("把多张截图拖到这里，或点选多张 / Ctrl+V 粘贴（全屏截图也可以，会自动找装备面板）", null, { hk: "1hhLhQ" });
export const gear_ocrBatchQueuedText = (fbs: FbsRuntime) => fbs._("排队中", null, { hk: "Nd17m" });
export const gear_ocrBatchRunningText = (fbs: FbsRuntime) => fbs._("识别中…", null, { hk: "3eorYj" });
export const gear_ocrBatchReadyText = (fbs: FbsRuntime) => fbs._("待核对", null, { hk: "2Uq8hS" });
export const gear_ocrBatchFailedText = (fbs: FbsRuntime) => fbs._("识别失败", null, { hk: "3PCxKB" });
export const gear_ocrBatchImportedText = (fbs: FbsRuntime) => fbs._("已导入", null, { hk: "4hyCeG" });
export const gear_ocrBatchRetryLabel = (fbs: FbsRuntime) => fbs._("重试", null, { hk: "hpwIZ" });
export const gear_ocrBatchRemoveLabel = (fbs: FbsRuntime) => fbs._("移除", null, { hk: "3EXgWk" });
export const gear_ocrBatchAdjustLabel = (fbs: FbsRuntime) => fbs._("调整框选", null, { hk: "2zEp4m" });
export const gear_ocrBatchApplyBoxLabel = (fbs: FbsRuntime) => fbs._("按此框重新识别", null, { hk: "1KSFKG" });
export const gear_ocrBatchDetectedText = (fbs: FbsRuntime) => fbs._("已自动框选面板", null, { hk: "1Zd71Q" });
export const gear_ocrBatchFullImageText = (fbs: FbsRuntime) => fbs._("未定位到面板，按整图识别", null, { hk: "zUdNB" });
export const gear_ocrBatchDupTag = (fbs: FbsRuntime) => fbs._("重复", null, { hk: "1P2q5L" });
export const gear_ocrBatchDupLibText = (fbs: FbsRuntime) => fbs._("与装备库已有装备相同，默认不导入", null, { hk: "C0m3T" });
export const gear_ocrBatchDupRowText = (fbs: FbsRuntime) => fbs._("与本批另一张相同，默认不导入", null, { hk: "LC6BT" });
export const gear_ocrBatchIncludeLabel = (fbs: FbsRuntime) => fbs._("导入这件", null, { hk: "2vvawT" });
export const gear_ocrBatchNoLinesText = (fbs: FbsRuntime) => fbs._("没认出词条：请核对部位、补词条行，或调整框选后重新识别（不会自动丢弃）", null, { hk: "4nCcYr" });
export const gear_ocrBatchImportTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("全部导入（{n} 件）", [fbs._param("n", pv(p, "n"))], { hk: "3wzPsN" });
export const gear_ocrBatchResultTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("✓ 批量导入完成：已导入 {n} 件，跳过 {m} 件。", [fbs._param("n", pv(p, "n")), fbs._param("m", pv(p, "m"))], { hk: "3MGNKr" });
export const gear_libEmptyText = (fbs: FbsRuntime) => fbs._("装备库是空的。手动录入、粘贴代码或截图识别都可以加装备。", null, { hk: "2LmP6i" });
export const gear_equippedTag = (fbs: FbsRuntime) => fbs._("已选入", null, { hk: "1n0CUW" });
export const gear_loadoutTitle = (fbs: FbsRuntime) => fbs._("组合搭配 · 8 个部位", null, { hk: "4eBhro" });
export const gear_autoLabel = (fbs: FbsRuntime) => fbs._("一键最优组合", null, { hk: "3Nmnt7" });
export const gear_autoDoneToast = (fbs: FbsRuntime) => fbs._("已拼好", null, { hk: "39nlZg" });
export const gear_autoFallbackToast = (fbs: FbsRuntime) => fbs._("已拼好（含兜底选装）", null, { hk: "fDSDV" });
export const gear_unequipAllLabel = (fbs: FbsRuntime) => fbs._("全部卸下", null, { hk: "1oBB3K" });
export const gear_slotEmptyText = (fbs: FbsRuntime) => fbs._("未选", null, { hk: "2dMnk2" });
export const gear_panelTitle = (fbs: FbsRuntime) => fbs._("面板与毕业度", null, { hk: "dKMoc" });
export const gear_gradLabel = (fbs: FbsRuntime) => fbs._("毕业度", null, { hk: "2PSuTH" });
export const gear_gradCountLabel = (fbs: FbsRuntime) => fbs._("条数", null, { hk: "9JeT5" });
export const gear_gradValueLabel = (fbs: FbsRuntime) => fbs._("数值", null, { hk: "2nrC3Y" });
export const gear_gradDyLabel = (fbs: FbsRuntime) => fbs._("定音", null, { hk: "UkPqT" });
export const gear_gradDyToggleLabel = (fbs: FbsRuntime) => fbs._("定音计入毕业度", null, { hk: "1Bs9cJ" });
export const gear_loanLabel = (fbs: FbsRuntime) => fbs._("满值模拟（全套满值时的毕业度）", null, { hk: "2jzqY8" });
export const gear_simActiveTag = (fbs: FbsRuntime) => fbs._("模拟中", null, { hk: "2UgeZN" });
export const gear_copySummaryLabel = (fbs: FbsRuntime) => fbs._("复制摘要", null, { hk: "30M19Y" });
export const gear_copiedToast = (fbs: FbsRuntime) => fbs._("已复制", null, { hk: "1hd4E9" });
export const gear_copyFailedToast = (fbs: FbsRuntime) => fbs._("复制失败，请手动记录", null, { hk: "2z8oFs" });
export const gear_yAccLabel = (fbs: FbsRuntime) => fbs._("黄字精准", null, { hk: "4miIvq" });
export const gear_yCritLabel = (fbs: FbsRuntime) => fbs._("黄字会心", null, { hk: "1ukzo5" });
export const gear_yIntLabel = (fbs: FbsRuntime) => fbs._("黄字会意", null, { hk: "1sVWx0" });
export const gear_finalCritLabel = (fbs: FbsRuntime) => fbs._("最终会心", null, { hk: "3VZKgq" });
export const gear_whiteLabel = (fbs: FbsRuntime) => fbs._("白字", null, { hk: "4zm2VF" });
export const gear_dawaiLabel = (fbs: FbsRuntime) => fbs._("大外", null, { hk: "28cDC6" });
export const gear_xiaowaiLabel = (fbs: FbsRuntime) => fbs._("小外", null, { hk: "xpxre" });
export const gear_dashuLabel = (fbs: FbsRuntime) => fbs._("大属", null, { hk: "4e7d2u" });
export const gear_xiaoshuLabel = (fbs: FbsRuntime) => fbs._("小属", null, { hk: "1YzVlC" });
export const gear_hpLabel = (fbs: FbsRuntime) => fbs._("气血", null, { hk: "1bqIkl" });
export const gear_defLabel = (fbs: FbsRuntime) => fbs._("防御", null, { hk: "4kHWSA" });
export const gear_talentLabel = (fbs: FbsRuntime) => fbs._("天赋", null, { hk: "2T0Q4d" });
export const gear_diffTitle = (fbs: FbsRuntime) => fbs._("差缺清单：离毕业还差什么", null, { hk: "2kQAAI" });
export const gear_diffLackTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("还差 {n}", [fbs._param("n", pv(p, "n"))], { hk: "4oUCd7" });
export const gear_diffExactText = (fbs: FbsRuntime) => fbs._("正好", null, { hk: "1XCcbg" });
export const gear_diffOverTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("多 {n}", [fbs._param("n", pv(p, "n"))], { hk: "SwjEJ" });
export const gear_diffExtraTitle = (fbs: FbsRuntime) => fbs._("配方外", null, { hk: "1EvvUu" });
export const gear_diffLowTitle = (fbs: FbsRuntime) => fbs._("未满承音的词条", null, { hk: "3JL0dH" });
export const gear_diffDoneText = (fbs: FbsRuntime) => fbs._("✓ 毕业。", null, { hk: "2KOp6i" });
export const gear_diffEmptyText = (fbs: FbsRuntime) => fbs._("还没选装备。", null, { hk: "3w3K5C" });
export const gear_diffInvalidTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("异常：{n} 条无相在非武器部位，未计入。", [fbs._param("n", pv(p, "n"))], { hk: "2k3PQ2" });
export const gear_suggestTitle = (fbs: FbsRuntime) => fbs._("建议", null, { hk: "JtH1A" });
export const gear_suggestSwapTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{slot}：换上「{name}」", [fbs._param("slot", pv(p, "slot")), fbs._param("name", pv(p, "name"))], { hk: "3RINgn" });
export const gear_suggestWashTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{slot}：把第 {line} 条 {from} 洗成 {to}", [
	fbs._param("slot", pv(p, "slot")),
	fbs._param("line", pv(p, "line")),
	fbs._param("from", pv(p, "from")),
	fbs._param("to", pv(p, "to"))
], { hk: "3vjrF0" });
export const gear_suggestNoneText = (fbs: FbsRuntime) => fbs._("这套暂时挑不出毛病", null, { hk: "VI5lW" });
export const gear_suggestHeadTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("当前 {cur}% → 全做 {final}%", [fbs._param("cur", pv(p, "cur")), fbs._param("final", pv(p, "final"))], { hk: "2pSurh" });
export const gear_dySummaryTitle = (fbs: FbsRuntime) => fbs._("定音汇总", null, { hk: "4FAPsu" });
export const gear_dyCorrectText = (fbs: FbsRuntime) => fbs._("对", null, { hk: "3QSDTA" });
export const gear_dyWrongText = (fbs: FbsRuntime) => fbs._("类型不符", null, { hk: "1dsd3p" });
export const gear_schemeTitle = (fbs: FbsRuntime) => fbs._("配装方案对比", null, { hk: "GzWD9" });
export const gear_schemeSaveLabel = (fbs: FbsRuntime) => fbs._("存为方案", null, { hk: "48SHwL" });
export const gear_schemeNameTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("方案 {n}", [fbs._param("n", pv(p, "n"))], { hk: "3KZMLk" });
export const gear_schemeLoadLabel = (fbs: FbsRuntime) => fbs._("载入", null, { hk: "3cSr50" });
export const gear_schemeDeleteLabel = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "2uzrOO" });
export const gear_schemeEmptyText = (fbs: FbsRuntime) => fbs._("还没有保存的方案。", null, { hk: "13Qrl7" });
export const gear_schemeComposeFirstText = (fbs: FbsRuntime) => fbs._("先在配装台拼好一套搭配，才能存为方案。", null, { hk: "1hRS7o" });
export const gear_schemeSavedToastTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("已存方案：{name}", [fbs._param("name", pv(p, "name"))], { hk: "18UCJp" });
export const gear_schemeLoadedToastTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("已载入：{name}", [fbs._param("name", pv(p, "name"))], { hk: "jhqOF" });
export const gear_schemeGroupCountTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{n} 套", [fbs._param("n", pv(p, "n"))], { hk: "2IInPZ" });
export const gear_shareLabel = (fbs: FbsRuntime) => fbs._("分享", null, { hk: "2RwuEu" });
export const gear_revokeShareLabel = (fbs: FbsRuntime) => fbs._("取消分享", null, { hk: "2pIwAc" });
export const gear_copyLinkLabel = (fbs: FbsRuntime) => fbs._("复制链接", null, { hk: "24xTKv" });
export const gear_shareRevokedToast = (fbs: FbsRuntime) => fbs._("已取消分享，旧链接已失效", null, { hk: "1eg1bQ" });
export const gear_quickTitle = (fbs: FbsRuntime) => fbs._("三率速算器", null, { hk: "1nEC7h" });
export const gear_quickResLabel = (fbs: FbsRuntime) => fbs._("抗性", null, { hk: "2KKyUH" });
export const gear_quickSyncLabel = (fbs: FbsRuntime) => fbs._("从配装台同步", null, { hk: "1QQ9rx" });
export const gear_quickSyncedToast = (fbs: FbsRuntime) => fbs._("已同步", null, { hk: "3nSq5d" });
export const gear_quickOkText = (fbs: FbsRuntime) => fbs._("✓ 已满值", null, { hk: "1hwt0O" });
export const gear_quickOverTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("，溢出 {v}%", [fbs._param("v", pv(p, "v"))], { hk: "1xODvp" });
export const gear_quickGapTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("还差白字 {lack}%（满值 {need}%）≈ {bars} 条{barName}", [
	fbs._param("lack", pv(p, "lack")),
	fbs._param("need", pv(p, "need")),
	fbs._param("bars", pv(p, "bars")),
	fbs._param("barName", pv(p, "barName"))
], { hk: "2EhVjX" });
export const gear_recipesTitle = (fbs: FbsRuntime) => fbs._("全流派配方表（100 阶 · 承音）", null, { hk: "1j76JG" });
export const gear_recipeSearchPlaceholder = (fbs: FbsRuntime) => fbs._("搜流派 / 套装 / 词条", null, { hk: "8Iu0u" });
export const gear_recipeAllLabel = (fbs: FbsRuntime) => fbs._("全部", null, { hk: "3STF5h" });
export const gear_recipeColCat = (fbs: FbsRuntime) => fbs._("类别", null, { hk: "1PSW6B" });
export const gear_recipeColSchool = (fbs: FbsRuntime) => fbs._("流派", null, { hk: "30osQ2" });
export const gear_recipeColSet = (fbs: FbsRuntime) => fbs._("套装", null, { hk: "1f8EHH" });
export const gear_recipeColRecipe = (fbs: FbsRuntime) => fbs._("词条搭配（承音）", null, { hk: "1QbkHD" });
export const gear_recipeColBow = (fbs: FbsRuntime) => fbs._("推荐弓", null, { hk: "15lpkw" });
export const gear_recipeSetTargetLabel = (fbs: FbsRuntime) => fbs._("设为目标", null, { hk: "6M1Ad" });
export const gear_recipeEmptyText = (fbs: FbsRuntime) => fbs._("没有符合的配方。", null, { hk: "23dIhx" });
export const gear_recipeTargetToastTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("目标已设为：{school} · {set}", [fbs._param("school", pv(p, "school")), fbs._param("set", pv(p, "set"))], { hk: "MwpSG" });
export const gear_sectRecipesTitle = (fbs: FbsRuntime) => fbs._("100 阶配方（配装台口径）", null, { hk: "1w0r1S" });
export const gear_affixTableTitle = (fbs: FbsRuntime) => fbs._("词条满值 / 承音对照表（配装台）", null, { hk: "uSC6s" });
export const gear_colCyLabel = (fbs: FbsRuntime) => fbs._("承音", null, { hk: "3l5J5X" });
export const gear_colCyPctLabel = (fbs: FbsRuntime) => fbs._("承音/满值", null, { hk: "1Ew3lL" });
export const gear_colRecipeNamesLabel = (fbs: FbsRuntime) => fbs._("配方叫法", null, { hk: "3agAXO" });
export const gear_survivalNote = (fbs: FbsRuntime) => fbs._("生存向，配方未列", null, { hk: "1rZukJ" });
export const gear_slotTableTitle = (fbs: FbsRuntime) => fbs._("部位版位表（配装台）", null, { hk: "3JjSZ0" });
export const gear_slotsBigTitle = (fbs: FbsRuntime) => fbs._("大外流派", null, { hk: "3IBUAh" });
export const gear_slotsSmallTitle = (fbs: FbsRuntime) => fbs._("小外流派", null, { hk: "2ZTbet" });
export const gear_formulaTitle = (fbs: FbsRuntime) => fbs._("公式与五维换算速查", null, { hk: "31wzz9" });
export const gear_formulaRatesTitle = (fbs: FbsRuntime) => fbs._("三率换算", null, { hk: "1wVoEL" });
export const gear_formulaDimsTitle = (fbs: FbsRuntime) => fbs._("五维换算（每 1 点）", null, { hk: "3YX8Dx" });
export const gear_formulaOrderTitle = (fbs: FbsRuntime) => fbs._("选装顺序", null, { hk: "ShpWL" });
export const gear_formulaAccTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("黄字精准 = 65% +（白字精准 − 65%）÷ 抗性，白字 {white}% 满值 100%。", [fbs._param("white", pv(p, "white"))], { hk: "40UKam" });
export const gear_formulaCritTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("黄字会心 = 白字会心 ÷ 抗性，白字 {white}% 满值 80%。", [fbs._param("white", pv(p, "white"))], { hk: "3UDngG" });
export const gear_formulaIntTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("黄字会意 = 白字会意 ÷ 抗性，白字 {white}% 满值 40%。", [fbs._param("white", pv(p, "white"))], { hk: "2bOd0Q" });
export const gear_formulaBarsTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("差几条估算（按承音每条）：精准 {acc} / 会心 {crit} / 会意 {int}；敏补会心 ≈ +{minCrit}% 白字 / 条，势补会意 ≈ +{shiInt}% 白字 / 条。", [
	fbs._param("acc", pv(p, "acc")),
	fbs._param("crit", pv(p, "crit")),
	fbs._param("int", pv(p, "int")),
	fbs._param("minCrit", pv(p, "minCrit")),
	fbs._param("shiInt", pv(p, "shiInt"))
], { hk: "4zVvJw" });
export const gear_formulaBowTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("弓（弓玦）加成计入白字：精准弓 白字精准 +{acc} / 会心弓 白字会心 +{crit} / 会意弓 白字会意 +{int}，再按抗性换算黄字。抗性 {res}（当前版本）。", [
	fbs._param("acc", pv(p, "acc")),
	fbs._param("crit", pv(p, "crit")),
	fbs._param("int", pv(p, "int")),
	fbs._param("res", pv(p, "res"))
], { hk: "1xLzR4" });
export const gear_formulaOrderText = (fbs: FbsRuntime) => fbs._("定流派 → 对配方 → 录装备。一键最优拼一版 → 看差缺清单补缺。精准先堆满 100%；会心 148% / 会意 74% 封顶，溢出换劲 / 势 / 增伤。两套拿不准，存方案比总分。", null, { hk: "2kac7u" });
export const gear_colDimLabel = (fbs: FbsRuntime) => fbs._("五维", null, { hk: "1qZt6N" });
export const gear_colConvLabel = (fbs: FbsRuntime) => fbs._("换算", null, { hk: "3nMzJn" });
export const gear_colFullBarTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("满条 {v} 折合", [fbs._param("v", pv(p, "v"))], { hk: "A0wwY" });
export const gear_calcFailedText = (fbs: FbsRuntime) => fbs._("计算失败，请稍后再试", null, { hk: "4EV81i" });
export const gear_demoLoadedToast = (fbs: FbsRuntime) => fbs._("示例已载入", null, { hk: "2OWtHa" });
export const gear_savedToastTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("已存入：{name}", [fbs._param("name", pv(p, "name"))], { hk: "3P2eD5" });
export const gear_deletedToast = (fbs: FbsRuntime) => fbs._("已删除", null, { hk: "4hqOVh" });
export const gear_clearedToast = (fbs: FbsRuntime) => fbs._("已清空", null, { hk: "sNPSz" });
export const legal_termsTitle = (fbs: FbsRuntime) => fbs._("服务条款", null, { hk: "34DESW" });
export const legal_privacyTitle = (fbs: FbsRuntime) => fbs._("隐私政策", null, { hk: "LS3Ub" });
export const legal_termsLink = (fbs: FbsRuntime) => fbs._("服务条款", null, { hk: "kCpyF" });
export const legal_privacyLink = (fbs: FbsRuntime) => fbs._("隐私政策", null, { hk: "tIZGL" });
export const legal_updatedText = (fbs: FbsRuntime) => fbs._("最后更新：2026 年 10 月 25 日", null, { hk: "2QXCh8" });
export const legal_disclaimer = (fbs: FbsRuntime) => fbs._("本站为玩家自发维护的非官方工具，与《燕云十六声》及其开发、发行方无隶属或背书关系；游戏名称与相关素材的权利归其各自权利方所有。", null, { hk: "1LmOGD" });
export const termsBody_s1h = (fbs: FbsRuntime) => fbs._("关于本站与非官方声明", null, { hk: "ojxr4" });
export const termsBody_s1b = (fbs: FbsRuntime) => fbs._("燕云百业（yanyun.app）是一个由玩家自发维护的非官方百业（公会）组队工具，与《燕云十六声》及其开发、发行方没有任何隶属或背书关系。本站中出现的游戏名称、副本、流派等资料，其权利归各自权利方所有。", null, { hk: "XSiit" });
export const termsBody_s2h = (fbs: FbsRuntime) => fbs._("账号与访问", null, { hk: "4kWL7n" });
export const termsBody_s2b = (fbs: FbsRuntime) => fbs._("本站通过 Discord OAuth 登录。使用本站即表示你同意本条款。你应妥善保管自己的 Discord 账号，通过你的账号进行的操作视为你本人行为。各百业内容的可见与可写范围，由你是否属于该百业绑定的 Discord 服务器决定。", null, { hk: "3gozWo" });
export const termsBody_s3h = (fbs: FbsRuntime) => fbs._("使用规范", null, { hk: "3GabVI" });
export const termsBody_s3b = (fbs: FbsRuntime) => fbs._("不得利用本站冒充他人或其它百业、抢注或占用与你无关的百业标识、发布违法或侵权内容、干扰本站运行，或绕过成员校验。车队标题、报名昵称等由用户发布的内容，由发布者自行负责。", null, { hk: "4dXIYD" });
export const termsBody_s4h = (fbs: FbsRuntime) => fbs._("服务现状", null, { hk: "4x0sgN" });
export const termsBody_s4b = (fbs: FbsRuntime) => fbs._("本站目前免费提供，并按现状（as is）运行。我们不承诺服务持续可用、功能保持不变，或数据永不丢失；功能可能被调整、中断或终止，原则上不另行通知。重要数据请自行留存备份。", null, { hk: "3ek0eT" });
export const termsBody_s5h = (fbs: FbsRuntime) => fbs._("责任限制", null, { hk: "1r7u2o" });
export const termsBody_s5b = (fbs: FbsRuntime) => fbs._("在适用法律允许的最大范围内，本站对因使用或无法使用本站而产生的间接、附带或后果性损失不承担责任。", null, { hk: "3tT9J5" });
export const termsBody_s6h = (fbs: FbsRuntime) => fbs._("条款变更", null, { hk: "2QKQhC" });
export const termsBody_s6b = (fbs: FbsRuntime) => fbs._("本条款可能不时更新，更新后的版本在本站公布即生效；你继续使用本站即视为接受更新后的条款。", null, { hk: "1cDdQ1" });
export const privacyBody_s1h = (fbs: FbsRuntime) => fbs._("我们收集的信息", null, { hk: "3DC5sT" });
export const privacyBody_s1b = (fbs: FbsRuntime) => fbs._("当你使用 Discord 登录时，我们会读取并保存：你的 Discord 用户 ID、用户名与头像、你加入的 Discord 服务器列表、你在这些服务器中的昵称，以及用于保持登录状态的 OAuth 授权凭据（refresh token）。你在使用本站过程中产生的数据也会被保存，包括百业名册记录、车队与报名记录（包括座位上的身份标识）、装备库与配装方案、语言偏好，以及你在移动端开启通知后注册的推送令牌。", null, { hk: "QzffU" });
export const privacyBody_s2h = (fbs: FbsRuntime) => fbs._("我们如何使用信息", null, { hk: "2xsvgr" });
export const privacyBody_s2b = (fbs: FbsRuntime) => fbs._("上述信息仅用于：登录与身份识别；校验你是否为某百业所绑定 Discord 服务器的成员；组队报名；发车提醒与应用推送；传家宝达成推送；以及按你的偏好显示语言。我们不出售你的个人数据，也不将其用于广告投放。", null, { hk: "3PLd7Q" });
export const privacyBody_s3h = (fbs: FbsRuntime) => fbs._("信息的共享与第三方", null, { hk: "2YIysf" });
export const privacyBody_s3b = (fbs: FbsRuntime) => fbs._("本站运行在 Cloudflare 的基础设施上，数据存储于其数据库服务；登录与成员校验由 Discord 提供；移动端推送经 Expo 推送服务转发至 Apple 或 Google 的推送通道。发车提醒与传家宝消息会发送到对应百业管理员配置的 Discord 频道，消息中会包含你的游戏昵称。除上述功能所必需的情形外，我们不会向其他第三方提供你的个人数据（法律法规要求除外）。", null, { hk: "43OqWT" });
export const privacyBody_s4h = (fbs: FbsRuntime) => fbs._("保存期限", null, { hk: "1U9Wy5" });
export const privacyBody_s4b = (fbs: FbsRuntime) => fbs._("你的数据保存在本站数据库中，直至你申请删除，或相关数据对本站功能不再需要为止。报名、车队等历史记录目前会持续保留；如保存规则发生变化，我们会更新本政策。", null, { hk: "1abLW7" });
export const privacyBody_s5h = (fbs: FbsRuntime) => fbs._("你的权利", null, { hk: "1FsOlT" });
export const privacyBody_s5b = (fbs: FbsRuntime) => fbs._("你可以查询、导出或删除你的个人数据。在「个人资料」的「我的数据」中，你可以自助导出你的全部数据（需通过 Discord 重新验证身份，每 24 小时一次），也可以自助删除账号：提交删除后有 7 天冷静期，期间可随时撤销；到期后你的个人数据会被删除或匿名化——你创建的车队会转为无主车队、你在他人车队中的座位会被匿名化，备份中的副本最迟在 14 天内随每日备份轮换清除。你也可以随时在 Discord 的设置中断开本站的授权；授权失效后，你在本站的会话会自动作废。", null, { hk: "1uyGts" });
export const privacyBody_s6h = (fbs: FbsRuntime) => fbs._("联系我们", null, { hk: "2c6z90" });
export const privacyBody_s6b = (fbs: FbsRuntime) => fbs._("如对本政策有疑问，或需提出查询、更正、删除申请，请通过本站社区百业「叽哩呱啦」的 Discord 服务器联系管理员。我们会先核实你的 Discord 账号身份，再处理你的申请。", null, { hk: "3xquvS" });
export const errors_rateLimited = (fbs: FbsRuntime) => fbs._("操作过于频繁, 请稍后再试", null, { hk: "24gcAF" });
export const errors_createRateLimited = (fbs: FbsRuntime) => fbs._("创建太频繁, 请稍后再试", null, { hk: "2VXEs2" });
export const errors_guildNotFound = (fbs: FbsRuntime) => fbs._("百业不存在", null, { hk: "1sJVTz" });
export const errors_gearNotFound = (fbs: FbsRuntime) => fbs._("装备不存在或不属于你", null, { hk: "4Bqufd" });
export const errors_gearEmptyBuild = (fbs: FbsRuntime) => fbs._("搭配为空", null, { hk: "3P3YIH" });
export const errors_gearCapacityReached = (fbs: FbsRuntime, p?: StringParams) => fbs._("装备库已满（上限 {limit} 件），删掉不用的装备后再添加", [fbs._param("limit", pv(p, "limit"))], { hk: "Rmyp7" });
export const errors_gearImportOverflow = (fbs: FbsRuntime, p?: StringParams) => fbs._("本批 {n} 件会让装备库达到 {total} 件，超过上限 {limit} 件，整批未导入", [
	fbs._param("n", pv(p, "n")),
	fbs._param("total", pv(p, "total")),
	fbs._param("limit", pv(p, "limit"))
], { hk: "i9Eg0" });
export const errors_gearOcrBatchTooLarge = (fbs: FbsRuntime, p?: StringParams) => fbs._("单批最多识别 {limit} 张截图，本批有 {n} 张，请分批导入", [fbs._param("limit", pv(p, "limit")), fbs._param("n", pv(p, "n"))], { hk: "QzYA" });
export const errors_gearOcrDailyLimit = (fbs: FbsRuntime, p?: StringParams) => fbs._("今天的批量识别次数已达上限（{limit} 批），明天再试", [fbs._param("limit", pv(p, "limit"))], { hk: "16O6RH" });
export const errors_loginRequired = (fbs: FbsRuntime) => fbs._("请先登录 Discord 后再操作", null, { hk: "1SEQ55" });
export const errors_loginRequiredShort = (fbs: FbsRuntime) => fbs._("请先登录 Discord", null, { hk: "pJJ75" });
export const errors_localeUnsupported = (fbs: FbsRuntime) => fbs._("不支持的语言", null, { hk: "j9YN8" });
export const errors_pushTokenInvalid = (fbs: FbsRuntime) => fbs._("推送令牌无效", null, { hk: "1LhKcu" });
export const errors_guildUnboundWrite = (fbs: FbsRuntime) => fbs._("该百业尚未绑定 Discord 服务器，写功能已锁定", null, { hk: "2fp9pu" });
export const errors_memberOnly = (fbs: FbsRuntime) => fbs._("只有该百业 Discord 服务器的成员可以操作", null, { hk: "2SEGVd" });
export const errors_memberOnlyView = (fbs: FbsRuntime) => fbs._("该百业仅对 Discord 服务器成员开放", null, { hk: "3Hv1KW" });
export const errors_titleRequired = (fbs: FbsRuntime) => fbs._("请填写标题", null, { hk: "1Jsgcg" });
export const errors_badStartTime = (fbs: FbsRuntime) => fbs._("请选择有效的出发时间", null, { hk: "3sAvLq" });
export const errors_startTimeTooFar = (fbs: FbsRuntime) => fbs._("出发时间不能超过 60 天后", null, { hk: "DMtM9" });
export const errors_groupingNotFound = (fbs: FbsRuntime) => fbs._("组队不存在", null, { hk: "UNb4g" });
export const errors_officialEvent = (fbs: FbsRuntime) => fbs._("官方活动请联系管理员", null, { hk: "43nkzu" });
export const errors_noCreatorRecorded = (fbs: FbsRuntime) => fbs._("该车队未记录车头，无法解散，请联系管理员处理", null, { hk: "LcMio" });
export const errors_leaderOnlyDisband = (fbs: FbsRuntime) => fbs._("只有车头可以解散车队", null, { hk: "3pk75u" });
export const errors_noCreatorRecordedEdit = (fbs: FbsRuntime) => fbs._("该车队未记录车头，无法编辑，请联系管理员处理", null, { hk: "3P84TA" });
export const errors_leaderOnlyEdit = (fbs: FbsRuntime) => fbs._("只有车头可以编辑车队", null, { hk: "yIOhs" });
export const errors_noCreatorRecordedComplete = (fbs: FbsRuntime) => fbs._("该车队未记录车头，无法完成，请联系管理员处理", null, { hk: "3fTeYQ" });
export const errors_leaderOnlyComplete = (fbs: FbsRuntime) => fbs._("只有车头可以完成车队", null, { hk: "3sKwKR" });
export const errors_noCreatorRecordedReopen = (fbs: FbsRuntime) => fbs._("该车队未记录车头，无法恢复，请联系管理员处理", null, { hk: "2hftHh" });
export const errors_leaderOnlyReopen = (fbs: FbsRuntime) => fbs._("只有车头可以恢复车队", null, { hk: "39coxw" });
export const errors_groupingAlreadyCompleted = (fbs: FbsRuntime) => fbs._("该车队已是完成状态", null, { hk: "25147t" });
export const errors_groupingNotCompleted = (fbs: FbsRuntime) => fbs._("该车队尚未完成", null, { hk: "4rkNE3" });
export const errors_groupingClosed = (fbs: FbsRuntime) => fbs._("该组队已截止报名", null, { hk: "2VgEG4" });
export const errors_nicknameRequired = (fbs: FbsRuntime) => fbs._("请填写游戏昵称", null, { hk: "dEulb" });
export const errors_proxyTargetNotInRoster = (fbs: FbsRuntime) => fbs._("所选成员不在本百业名册中", null, { hk: "a9Yz0" });
export const errors_groupingFull = (fbs: FbsRuntime) => fbs._("名额已满或报名已截止", null, { hk: "2oRCcW" });
export const errors_lastSeatHealer = (fbs: FbsRuntime) => fbs._("最后一个名额需要奶", null, { hk: "41E3Sj" });
export const errors_alreadyJoined = (fbs: FbsRuntime) => fbs._("已报过名", null, { hk: "3ITdhJ" });
export const errors_seatNotFound = (fbs: FbsRuntime) => fbs._("未找到该报名", null, { hk: "4qCeKk" });
export const errors_notSeated = (fbs: FbsRuntime) => fbs._("你还没有落座这辆车", null, { hk: "2XueBH" });
export const errors_reminderOffsetsInvalid = (fbs: FbsRuntime) => fbs._("提醒提前量不在可选范围内", null, { hk: "36SXgz" });
export const errors_ogAccentInvalid = (fbs: FbsRuntime) => fbs._("强调色不在可选范围内", null, { hk: "znj0W" });
export const errors_paramsIncomplete = (fbs: FbsRuntime) => fbs._("参数不完整", null, { hk: "fv2xj" });
export const errors_bossNotFound = (fbs: FbsRuntime) => fbs._("首领不存在", null, { hk: "hPhwR" });
export const errors_guildNameShort = (fbs: FbsRuntime) => fbs._("百业名称至少 2 个字", null, { hk: "3FgoBZ" });
export const errors_avatarTooLarge = (fbs: FbsRuntime) => fbs._("头像图片不能超过 400KB", null, { hk: "3bJhEG" });
export const errors_avatarBadType = (fbs: FbsRuntime) => fbs._("头像只支持 PNG、JPEG 或 WebP 图片", null, { hk: "4y3c4p" });
export const errors_avatarEmpty = (fbs: FbsRuntime) => fbs._("没有收到图片数据", null, { hk: "2ECMBn" });
export const errors_slugInvalid = (fbs: FbsRuntime) => fbs._("站点地址只能用小写字母/数字/连字符, 2-40 位", null, { hk: "2mgcnU" });
export const errors_slugReserved = (fbs: FbsRuntime) => fbs._("该地址为保留字, 请换一个", null, { hk: "2f5iTY" });
export const errors_slugTaken = (fbs: FbsRuntime) => fbs._("该地址已被占用, 请换一个", null, { hk: "1Hon8z" });
export const errors_serverRequired = (fbs: FbsRuntime) => fbs._("请选择要绑定的 Discord 服务器", null, { hk: "4C2p7o" });
export const errors_notInServer = (fbs: FbsRuntime) => fbs._("你不在这个 Discord 服务器中", null, { hk: "4mZrHl" });
export const errors_cannotManageServer = (fbs: FbsRuntime) => fbs._("你需要在该 Discord 服务器拥有管理员或「管理服务器」权限才能绑定它", null, { hk: "37PvZE" });
export const errors_adminOnly = (fbs: FbsRuntime) => fbs._("只有所绑服务器的管理员可以执行此操作", null, { hk: "13a8ee" });
export const errors_webhookInvalid = (fbs: FbsRuntime) => fbs._("Webhook 地址格式不正确", null, { hk: "3TamDe" });
export const errors_discordIdInvalid = (fbs: FbsRuntime) => fbs._("Discord 服务器 ID 格式不正确", null, { hk: "2WO0bx" });
export const errors_noFieldsToUpdate = (fbs: FbsRuntime) => fbs._("没有可更新的字段", null, { hk: "1BCEnK" });
export const errors_signupNotFound = (fbs: FbsRuntime) => fbs._("未找到该报名记录", null, { hk: "1CDqBx" });
export const errors_resultNotFound = (fbs: FbsRuntime) => fbs._("未找到该成绩", null, { hk: "V660K" });
export const errors_resultTeamRequired = (fbs: FbsRuntime) => fbs._("缺少队伍名", null, { hk: "1tmhSg" });
export const errors_resultTimeInvalid = (fbs: FbsRuntime) => fbs._("用时格式不正确（如 12:34.567）", null, { hk: "69rGE" });
export const errors_avatarDataInvalid = (fbs: FbsRuntime) => fbs._("图片数据无效", null, { hk: "3vzaSY" });
export const errors_schoolRequired = (fbs: FbsRuntime) => fbs._("缺少流派", null, { hk: "2EpNBU" });
export const errors_generic = (fbs: FbsRuntime) => fbs._("操作失败，请稍后再试", null, { hk: "2rYUtK" });
export const errors_templateNotFound = (fbs: FbsRuntime) => fbs._("模板不存在", null, { hk: "2GDkiI" });
export const errors_templateNameRequired = (fbs: FbsRuntime) => fbs._("请填写模板名", null, { hk: "2LkPVU" });
export const errors_templateForbidden = (fbs: FbsRuntime) => fbs._("只有模板创建者或百业管理员可以改删模板", null, { hk: "RvJFt" });
export const errors_templateBadStart = (fbs: FbsRuntime) => fbs._("发车时间设置无效", null, { hk: "20lZIE" });
export const errors_accountReauthRequired = (fbs: FbsRuntime) => fbs._("请先通过 Discord 重新验证身份", null, { hk: "2vPwx1" });
export const errors_accountExportRateLimited = (fbs: FbsRuntime) => fbs._("每 24 小时只能导出一次数据，请稍后再试", null, { hk: "2McU4D" });
export const errors_accountUsernameMismatch = (fbs: FbsRuntime) => fbs._("输入的显示名与你的账号不一致", null, { hk: "11ujee" });
export const errors_accountDeletionPending = (fbs: FbsRuntime) => fbs._("已有一份删除申请在冷静期中", null, { hk: "32JC0o" });
export const errors_accountDeletionNotPending = (fbs: FbsRuntime) => fbs._("当前没有待执行的删除申请", null, { hk: "1QUdHI" });
export const errors_premiumRequired = (fbs: FbsRuntime) => fbs._("该功能需要开通 Premium", null, { hk: "19jkus" });
export const errors_premiumComingSoon = (fbs: FbsRuntime) => fbs._("Premium 开通即将开放", null, { hk: "46IB9m" });
export const errors_premiumActive = (fbs: FbsRuntime) => fbs._("本百业已开通 Premium", null, { hk: "4ceZGD" });
export const errors_paygateDisabled = (fbs: FbsRuntime) => fbs._("收费功能尚未开启", null, { hk: "2u3Wa8" });
export const errors_checkoutFailed = (fbs: FbsRuntime) => fbs._("创建支付会话失败，请稍后再试", null, { hk: "2JSaBi" });
export const errors_rosterImportEmpty = (fbs: FbsRuntime) => fbs._("没有收到任何识别文本，请重新截图后再试", null, { hk: "4i5R8K" });
export const errors_rosterBatchNotFound = (fbs: FbsRuntime) => fbs._("导入预览不存在或已失效，请重新识别", null, { hk: "2QDDb1" });
export const errors_rosterBatchConfirmed = (fbs: FbsRuntime) => fbs._("这份预览已经确认导入过了", null, { hk: "1Gts0b" });
export const errors_rosterNoImportableRows = (fbs: FbsRuntime) => fbs._("没有勾选任何可导入的新名", null, { hk: "3ebrUb" });
export const errors_rosterEntryNotFound = (fbs: FbsRuntime) => fbs._("名册记录不存在", null, { hk: "4pVJDO" });
export const errors_checklistItemUnknown = (fbs: FbsRuntime) => fbs._("检查条目不存在", null, { hk: "2zs7yq" });
export const errors_feedbackEmpty = (fbs: FbsRuntime) => fbs._("反馈内容不能为空", null, { hk: "2fa2ne" });
export const errors_feedbackTooLong = (fbs: FbsRuntime) => fbs._("反馈内容太长，请精简到 2000 字以内", null, { hk: "3xgizG" });
export const errors_feedbackRateLimited = (fbs: FbsRuntime) => fbs._("今天提交的反馈已达上限，请明天再来", null, { hk: "4tzXEe" });
export const errors_announcementTitleRequired = (fbs: FbsRuntime) => fbs._("请填写公告标题", null, { hk: "W041z" });
export const errors_announcementTitleTooLong = (fbs: FbsRuntime) => fbs._("公告标题太长，请精简到 80 字以内", null, { hk: "2Ik1AD" });
export const errors_announcementBodyTooLong = (fbs: FbsRuntime) => fbs._("公告正文太长，请精简到 2000 字以内", null, { hk: "118qKc" });
export const errors_announcementNotFound = (fbs: FbsRuntime) => fbs._("公告不存在", null, { hk: "1Lw7VE" });
export const errors_announcementDailyLimit = (fbs: FbsRuntime, p?: StringParams) => fbs._("今天的公告已达上限（每天 {limit} 条），明天再发", [fbs._param("limit", pv(p, "limit"))], { hk: "1xinu8" });
export const errors_urgentCallDailyLimit = (fbs: FbsRuntime, p?: StringParams) => fbs._("今天的紧急集合呼叫已达上限（每天 {limit} 次），明天再试", [fbs._param("limit", pv(p, "limit"))], { hk: "3ElFFE" });
export const errors_lotteryTitleRequired = (fbs: FbsRuntime) => fbs._("请填写抽奖标题", null, { hk: "20oyyi" });
export const errors_lotteryEntriesEmpty = (fbs: FbsRuntime) => fbs._("参与名单为空，请先选择参与者", null, { hk: "keAMM" });
export const errors_lotteryNotFound = (fbs: FbsRuntime) => fbs._("抽奖不存在", null, { hk: "1Lg4Ze" });
export const errors_lotteryAlreadyDrawn = (fbs: FbsRuntime) => fbs._("该抽奖已经开过奖了", null, { hk: "4zGOSK" });
export const errors_lotteryWinnerCountInvalid = (fbs: FbsRuntime) => fbs._("中奖人数必须在 1 与参与人数之间", null, { hk: "3wDQQO" });
export const errors_lotteryWeightInvalid = (fbs: FbsRuntime) => fbs._("权重必须是 1 到 1000 之间的整数", null, { hk: "rU9E9" });
export const errors_lotteryMemberNotInGuild = (fbs: FbsRuntime) => fbs._("所选成员不在本百业名册中", null, { hk: "4sq9UB" });
export const errors_availabilitySlotInvalid = (fbs: FbsRuntime) => fbs._("可用时段不合法", null, { hk: "1PVvrL" });
export const errors_availabilityTooManySlots = (fbs: FbsRuntime) => fbs._("可用时段太多（最多 21 个）", null, { hk: "5cg7H" });
export const errors_pollTitleRequired = (fbs: FbsRuntime) => fbs._("请填写投票标题", null, { hk: "1ICL5j" });
export const errors_pollOptionsInvalid = (fbs: FbsRuntime) => fbs._("候选时间不合法（需 2–8 个不同的未来时间）", null, { hk: "4a76Lv" });
export const errors_pollNotFound = (fbs: FbsRuntime) => fbs._("投票不存在", null, { hk: "SEsAt" });
export const errors_pollClosed = (fbs: FbsRuntime) => fbs._("该投票已关闭", null, { hk: "2ThdE3" });
export const errors_pollOptionInvalid = (fbs: FbsRuntime) => fbs._("所选时间不属于该投票", null, { hk: "4csk84" });
export const errors_pollForbidden = (fbs: FbsRuntime) => fbs._("只有发起人或百业管理员可以关闭投票", null, { hk: "2XIBcy" });
export const errors_customFieldInvalid = (fbs: FbsRuntime) => fbs._("自定义字段不合法", null, { hk: "27PyP1" });
export const errors_customFieldTooMany = (fbs: FbsRuntime) => fbs._("自定义字段最多 5 个", null, { hk: "1Rti3z" });
export const errors_signupAnswerRequired = (fbs: FbsRuntime) => fbs._("请填写必填的报名信息", null, { hk: "4c3jjL" });
export const errors_signupAnswerInvalid = (fbs: FbsRuntime) => fbs._("报名信息不合法", null, { hk: "1s3HzU" });
export const errors_applicationPending = (fbs: FbsRuntime) => fbs._("你已有一份待审核的申请，请等待审核结果", null, { hk: "2Giyct" });
export const errors_alreadyMember = (fbs: FbsRuntime) => fbs._("你已经是这个百业的成员了", null, { hk: "4g3vga" });
export const errors_recruitUnavailable = (fbs: FbsRuntime) => fbs._("该百业尚未绑定 Discord 服务器，暂不开放招新申请", null, { hk: "48ddMS" });
export const errors_applicationNotFound = (fbs: FbsRuntime) => fbs._("申请不存在", null, { hk: "1MBYm8" });
export const errors_applicationNotPending = (fbs: FbsRuntime) => fbs._("该申请已经审核过了", null, { hk: "2ZFW5h" });
export const errors_mentorNotDesignated = (fbs: FbsRuntime) => fbs._("所选导师不在本百业导师人选中，请先设为导师", null, { hk: "3iSGns" });
export const errors_mentorNotInGuild = (fbs: FbsRuntime) => fbs._("所选导师不在本百业名册中", null, { hk: "3Ip8br" });
export const errors_menteeNotInGuild = (fbs: FbsRuntime) => fbs._("所选新人不在本百业名册中", null, { hk: "2ugrgv" });
export const errors_menteeAlreadyPaired = (fbs: FbsRuntime) => fbs._("该新人已有一段进行中的配对，请先结束它再改配", null, { hk: "2Z8vlr" });
export const errors_mentorSelfPairing = (fbs: FbsRuntime) => fbs._("导师和新人不能是同一个人", null, { hk: "h0eUX" });
export const errors_pairingNotFound = (fbs: FbsRuntime) => fbs._("配对不存在", null, { hk: "pRRzR" });
export const errors_pairingAlreadyEnded = (fbs: FbsRuntime) => fbs._("该配对已经结束了", null, { hk: "2EbjaL" });
export const errors_officerNoteBodyRequired = (fbs: FbsRuntime) => fbs._("请填写备注内容", null, { hk: "2SinE2" });
export const errors_officerNoteBodyTooLong = (fbs: FbsRuntime) => fbs._("备注太长，请精简到 500 字以内", null, { hk: "2UmXWp" });
export const errors_officerNoteNotFound = (fbs: FbsRuntime) => fbs._("备注不存在", null, { hk: "12m1fk" });
export const errors_officerMemberNotFound = (fbs: FbsRuntime) => fbs._("该成员不在本百业名册中", null, { hk: "1h5oBR" });
export const errors_seasonGoalTitleRequired = (fbs: FbsRuntime) => fbs._("请填写目标", null, { hk: "4hkl3C" });
export const errors_seasonGoalTitleTooLong = (fbs: FbsRuntime) => fbs._("目标太长，请精简到 80 字以内", null, { hk: "1G5w06" });
export const errors_seasonGoalNoteTooLong = (fbs: FbsRuntime) => fbs._("进度备注太长，请精简到 500 字以内", null, { hk: "1CggSQ" });
export const errors_seasonGoalNotFound = (fbs: FbsRuntime) => fbs._("目标不存在", null, { hk: "29dqqZ" });
export const errors_seasonGoalDungeonNotFound = (fbs: FbsRuntime) => fbs._("关联的副本不存在", null, { hk: "1EQ8a5" });
export const guildAdmin_title = (fbs: FbsRuntime) => fbs._("管理百业", null, { hk: "4uAK0w" });
export const guildAdmin_lockedTitle = (fbs: FbsRuntime) => fbs._("无权管理这个百业", null, { hk: "2scxga" });
export const guildAdmin_lockedBody = (fbs: FbsRuntime) => fbs._("只有该百业所绑 Discord 服务器的管理员（服务器主或拥有管理权限）可以进入管理页。", null, { hk: "9JZbD" });
export const guildAdmin_backLink = (fbs: FbsRuntime) => fbs._("‹ 返回百业", null, { hk: "ZRhTA" });
export const guildAdmin_tabProfile = (fbs: FbsRuntime) => fbs._("资料", null, { hk: "2uIwip" });
export const guildAdmin_tabDiscord = (fbs: FbsRuntime) => fbs._("Discord", null, { hk: "45mhJu" });
export const guildAdmin_tabEvents = (fbs: FbsRuntime) => fbs._("活动", null, { hk: "4y5dH" });
export const guildAdmin_tabGuides = (fbs: FbsRuntime) => fbs._("攻略数据", null, { hk: "2mnh27" });
export const guildAdmin_saveButton = (fbs: FbsRuntime) => fbs._("保存", null, { hk: "3tEfi7" });
export const guildAdmin_savedText = (fbs: FbsRuntime) => fbs._("已保存", null, { hk: "1YXNnN" });
export const guildAdmin_deleteButton = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "1FjjIp" });
export const guildAdmin_editButton = (fbs: FbsRuntime) => fbs._("编辑", null, { hk: "2hBYX0" });
export const guildAdmin_addButton = (fbs: FbsRuntime) => fbs._("新增", null, { hk: "upio1" });
export const guildAdmin_profileTitle = (fbs: FbsRuntime) => fbs._("百业资料", null, { hk: "35e1aj" });
export const guildAdmin_nameLabel = (fbs: FbsRuntime) => fbs._("百业名称", null, { hk: "3VGhAA" });
export const guildAdmin_announcementLabel = (fbs: FbsRuntime) => fbs._("公告", null, { hk: "3MPdbH" });
export const guildAdmin_sloganLabel = (fbs: FbsRuntime) => fbs._("标语", null, { hk: "3g5s53" });
export const guildAdmin_masterNameLabel = (fbs: FbsRuntime) => fbs._("掌门", null, { hk: "1NFB6U" });
export const guildAdmin_logoUrlLabel = (fbs: FbsRuntime) => fbs._("标志图链接", null, { hk: "OzzkB" });
export const guildAdmin_bgImageUrlLabel = (fbs: FbsRuntime) => fbs._("背景图链接", null, { hk: "2d8wA9" });
export const guildAdmin_avatarTitle = (fbs: FbsRuntime) => fbs._("百业头像", null, { hk: "4boKYO" });
export const guildAdmin_avatarUpload = (fbs: FbsRuntime) => fbs._("上传头像", null, { hk: "LWhmg" });
export const guildAdmin_avatarReplace = (fbs: FbsRuntime) => fbs._("更换头像", null, { hk: "1rpgyJ" });
export const guildAdmin_avatarDelete = (fbs: FbsRuntime) => fbs._("删除头像", null, { hk: "GFBdo" });
export const guildAdmin_avatarNone = (fbs: FbsRuntime) => fbs._("尚未设置头像，当前显示默认印章。", null, { hk: "1pyVEl" });
export const guildAdmin_avatarHint = (fbs: FbsRuntime) => fbs._("正方形图片效果最佳，大小 ≤ 400KB（PNG / JPEG / WebP）。", null, { hk: "4Ekxwl" });
export const guildAdmin_discordTitle = (fbs: FbsRuntime) => fbs._("Discord 集成", null, { hk: "2hbHGk" });
export const guildAdmin_webhookLabel = (fbs: FbsRuntime) => fbs._("发车提醒 Webhook", null, { hk: "1BAh7o" });
export const guildAdmin_webhookSet = (fbs: FbsRuntime, p?: StringParams) => fbs._("已设置（Webhook 编号 {id}）", [fbs._param("id", pv(p, "id"))], { hk: "1ZdRAw" });
export const guildAdmin_webhookUnset = (fbs: FbsRuntime) => fbs._("未设置", null, { hk: "dDpeY" });
export const guildAdmin_webhookHint = (fbs: FbsRuntime) => fbs._("保存后不回显完整地址；留空并保存 = 保持不变，点「清除」移除。", null, { hk: "2P97lk" });
export const guildAdmin_webhookClear = (fbs: FbsRuntime) => fbs._("清除 Webhook", null, { hk: "2eQC6C" });
export const guildAdmin_guildIdLabel = (fbs: FbsRuntime) => fbs._("绑定的服务器 ID", null, { hk: "lQd0C" });
export const guildAdmin_guildIdUnbound = (fbs: FbsRuntime) => fbs._("未绑定", null, { hk: "10avrI" });
export const guildAdmin_reminderTitle = (fbs: FbsRuntime) => fbs._("发车提醒设置", null, { hk: "2jq1TS" });
export const guildAdmin_reminderOffsetsLabel = (fbs: FbsRuntime) => fbs._("提醒提前量（可多选）", null, { hk: "1OIui1" });
export const guildAdmin_reminderOffsetOption = (fbs: FbsRuntime, p?: StringParams) => fbs._("提前 {minutes} 分钟", [fbs._param("minutes", pv(p, "minutes"))], { hk: "sAIKh" });
export const guildAdmin_reminderCustomTextLabel = (fbs: FbsRuntime) => fbs._("自定义提醒文案", null, { hk: "14aT54" });
export const guildAdmin_reminderCustomTextHint = (fbs: FbsRuntime) => fbs._("一行文字，会出现在提醒卡片里；最多 100 字，留空不显示。第一次提前提醒会通知所有人，之后的只催还没就位的人。", null, { hk: "BIh2B" });
export const guildAdmin_visibilityTitle = (fbs: FbsRuntime) => fbs._("可见性", null, { hk: "1w8r08" });
export const guildAdmin_devOnlyLabel = (fbs: FbsRuntime) => fbs._("仅开发环境可见", null, { hk: "1jjubx" });
export const guildAdmin_eventsTitle = (fbs: FbsRuntime) => fbs._("活动管理", null, { hk: "43Z9ae" });
export const guildAdmin_signupCsvSuffix = (fbs: FbsRuntime) => fbs._("报名表", null, { hk: "2nKUMV" });
export const guildAdmin_eventEmpty = (fbs: FbsRuntime) => fbs._("暂无活动。", null, { hk: "Pnib" });
export const guildAdmin_eventTitleLabel = (fbs: FbsRuntime) => fbs._("标题", null, { hk: "4mMdVp" });
export const guildAdmin_eventTypeLabel = (fbs: FbsRuntime) => fbs._("类型", null, { hk: "3rcy57" });
export const guildAdmin_eventStatusLabel = (fbs: FbsRuntime) => fbs._("状态", null, { hk: "3DODtd" });
export const guildAdmin_eventTimeLabel = (fbs: FbsRuntime) => fbs._("发车时间", null, { hk: "45yZmx" });
export const guildAdmin_eventSlotsLabel = (fbs: FbsRuntime) => fbs._("席位上限", null, { hk: "M1vcc" });
export const guildAdmin_eventMeetLabel = (fbs: FbsRuntime) => fbs._("集合信息", null, { hk: "47Q0k7" });
export const guildAdmin_eventDescLabel = (fbs: FbsRuntime) => fbs._("说明", null, { hk: "1lo3WX" });
export const guildAdmin_eventDungeonLabel = (fbs: FbsRuntime) => fbs._("副本", null, { hk: "1FAR1r" });
export const guildAdmin_statusOpen = (fbs: FbsRuntime) => fbs._("开放报名", null, { hk: "49jUMw" });
export const guildAdmin_statusClosed = (fbs: FbsRuntime) => fbs._("已截止", null, { hk: "1FI1Se" });
export const guildAdmin_statusCompleted = (fbs: FbsRuntime) => fbs._("已完成", null, { hk: "2SS8zB" });
export const guildAdmin_statusDraft = (fbs: FbsRuntime) => fbs._("草稿", null, { hk: "BswMc" });
export const guildAdmin_signupsTitle = (fbs: FbsRuntime) => fbs._("报名名单", null, { hk: "1WhBXM" });
export const guildAdmin_signupEmpty = (fbs: FbsRuntime) => fbs._("暂无报名。", null, { hk: "2xX0pW" });
export const guildAdmin_exportCsvButton = (fbs: FbsRuntime) => fbs._("导出 CSV", null, { hk: "Dg2q6" });
export const guildAdmin_removeSignupButton = (fbs: FbsRuntime) => fbs._("移除", null, { hk: "2ybZdT" });
export const guildAdmin_resultsTitle = (fbs: FbsRuntime) => fbs._("竞速成绩", null, { hk: "QIlMo" });
export const guildAdmin_resultTeamLabel = (fbs: FbsRuntime) => fbs._("队伍名", null, { hk: "3ZsqJ1" });
export const guildAdmin_resultMembersLabel = (fbs: FbsRuntime) => fbs._("队员（逗号分隔）", null, { hk: "2KAIPK" });
export const guildAdmin_resultTimeLabel = (fbs: FbsRuntime) => fbs._("用时（如 12:34.567）", null, { hk: "4niMVm" });
export const guildAdmin_resultProofLabel = (fbs: FbsRuntime) => fbs._("凭证链接", null, { hk: "20Lpgi" });
export const guildAdmin_resultNoteLabel = (fbs: FbsRuntime) => fbs._("备注", null, { hk: "1I3mrb" });
export const guildAdmin_guidesTitle = (fbs: FbsRuntime) => fbs._("流派攻略数据（BiS / 循环）", null, { hk: "NfNBl" });
export const guildAdmin_guidesHint = (fbs: FbsRuntime) => fbs._("按流派填写：build 名称、属性行、占比行、BiS（JSON）与循环（JSON）。保存后流派页即时生效。", null, { hk: "3fKKdw" });
export const guildAdmin_guideSchoolLabel = (fbs: FbsRuntime) => fbs._("流派", null, { hk: "31M4rS" });
export const guildAdmin_guideBuildLabel = (fbs: FbsRuntime) => fbs._("Build 名称", null, { hk: "4eWJd5" });
export const guildAdmin_guideAttrLabel = (fbs: FbsRuntime) => fbs._("属性行", null, { hk: "vQj17" });
export const guildAdmin_guideRateLabel = (fbs: FbsRuntime) => fbs._("占比行", null, { hk: "2yVL7z" });
export const guildAdmin_guideBisLabel = (fbs: FbsRuntime) => fbs._("BiS（JSON）", null, { hk: "3Vlq5G" });
export const guildAdmin_guideRotationLabel = (fbs: FbsRuntime) => fbs._("循环（JSON）", null, { hk: "485Lhi" });
export const guildAdmin_tabStats = (fbs: FbsRuntime) => fbs._("统计", null, { hk: "4gdHXs" });
export const guildAdmin_tabSeason = (fbs: FbsRuntime) => fbs._("赛季", null, { hk: "fqm56" });
export const guildAdmin_seasonTitle = (fbs: FbsRuntime) => fbs._("赛季前检查清单", null, { hk: "3HWK5z" });
export const guildAdmin_seasonHint = (fbs: FbsRuntime, p?: StringParams) => fbs._("按当前版本 {version} 与赛季 {season} 自动生成；换季后清单自动重置，逐项复核后勾选。", [fbs._param("version", pv(p, "version")), fbs._param("season", pv(p, "season"))], { hk: "1e7TcX" });
export const guildAdmin_seasonProgress = (fbs: FbsRuntime, p?: StringParams) => fbs._("已完成 {done} / {total}", [fbs._param("done", pv(p, "done")), fbs._param("total", pv(p, "total"))], { hk: "495BtM" });
export const guildAdmin_seasonItemDungeonsTitle = (fbs: FbsRuntime) => fbs._("复核当前版本副本", null, { hk: "2R9yUh" });
export const guildAdmin_seasonItemDungeonsDetail = (fbs: FbsRuntime, p?: StringParams) => fbs._("当前版本（{version}）共有 {count} 个副本，确认达标要求与攻略已按本赛季更新。", [fbs._param("version", pv(p, "version")), fbs._param("count", pv(p, "count"))], { hk: "enjun" });
export const guildAdmin_seasonItemTemplatesTitle = (fbs: FbsRuntime) => fbs._("复核组队模板", null, { hk: "3liaSF" });
export const guildAdmin_seasonItemTemplatesDetail = (fbs: FbsRuntime, p?: StringParams) => fbs._("本百业现有 {count} 个组队模板，确认模板的副本与人数仍适用于本赛季。", [fbs._param("count", pv(p, "count"))], { hk: "YK3vP" });
export const guildAdmin_seasonItemGuidesTitle = (fbs: FbsRuntime) => fbs._("复核流派攻略数据", null, { hk: "4t8rLI" });
export const guildAdmin_seasonItemGuidesDetail = (fbs: FbsRuntime, p?: StringParams) => fbs._("攻略数据现有 {builds} 份 BiS 与 {rotations} 份循环，确认已按本赛季数值更新。", [fbs._param("builds", pv(p, "builds")), fbs._param("rotations", pv(p, "rotations"))], { hk: "3drPJK" });
export const guildAdmin_seasonItemRosterTitle = (fbs: FbsRuntime) => fbs._("复核成员名册", null, { hk: "2milrJ" });
export const guildAdmin_seasonItemRosterDetail = (fbs: FbsRuntime, p?: StringParams) => fbs._("Discord 名册 {members} 人，截图名册 {entries} 条；确认成员装备季标与名册均为本赛季最新。", [fbs._param("members", pv(p, "members")), fbs._param("entries", pv(p, "entries"))], { hk: "loIXD" });
export const guildAdmin_rosterTitle = (fbs: FbsRuntime) => fbs._("成员名册（截图导入）", null, { hk: "4odyJR" });
export const guildAdmin_rosterHint = (fbs: FbsRuntime) => fbs._("上传游戏内成员名单截图，识别出的名字先进入预览，确认后才写入名册。名册只记录游戏内名字，不会改变任何人的 Discord 成员资格。", null, { hk: "1tY3Tc" });
export const guildAdmin_rosterUpload = (fbs: FbsRuntime) => fbs._("上传名单截图", null, { hk: "4fA2Sc" });
export const guildAdmin_rosterOcrRunning = (fbs: FbsRuntime) => fbs._("识别中…", null, { hk: "3pewht" });
export const guildAdmin_rosterPreviewTitle = (fbs: FbsRuntime) => fbs._("导入预览", null, { hk: "VXLD3" });
export const guildAdmin_rosterConfirm = (fbs: FbsRuntime) => fbs._("确认导入", null, { hk: "2nVVvB" });
export const guildAdmin_rosterEmpty = (fbs: FbsRuntime) => fbs._("尚无名册记录，用上方按钮上传名单截图导入。", null, { hk: "2cZATc" });
export const guildAdmin_rosterSourceOcr = (fbs: FbsRuntime) => fbs._("截图识别", null, { hk: "4zaKkq" });
export const guildAdmin_rosterMatchedMember = (fbs: FbsRuntime) => fbs._("已匹配 Discord 成员", null, { hk: "UdOw4" });
export const guildAdmin_rosterStatusMatched = (fbs: FbsRuntime) => fbs._("已匹配", null, { hk: "34fWrG" });
export const guildAdmin_rosterStatusNew = (fbs: FbsRuntime) => fbs._("疑似新名", null, { hk: "CoCsv" });
export const guildAdmin_rosterStatusUnrecognized = (fbs: FbsRuntime) => fbs._("无法识别", null, { hk: "2S9DbJ" });
export const guildAdmin_rosterImported = (fbs: FbsRuntime, p?: StringParams) => fbs._("已导入 {count} 条名册记录", [fbs._param("count", pv(p, "count"))], { hk: "4xXpcv" });
export const guildAdmin_statsTitle = (fbs: FbsRuntime) => fbs._("出勤与活跃", null, { hk: "4idJiT" });
export const guildAdmin_statsCurrentWeek = (fbs: FbsRuntime) => fbs._("本周", null, { hk: "4np6l1" });
export const guildAdmin_statsCars = (fbs: FbsRuntime) => fbs._("开车", null, { hk: "2zyIkm" });
export const guildAdmin_statsCompleted = (fbs: FbsRuntime) => fbs._("完成", null, { hk: "3MgE3M" });
export const guildAdmin_statsSeats = (fbs: FbsRuntime) => fbs._("席位", null, { hk: "1FGaVr" });
export const guildAdmin_statsFillRate = (fbs: FbsRuntime) => fbs._("满员率", null, { hk: "2xV9Kf" });
export const guildAdmin_statsParticipants = (fbs: FbsRuntime) => fbs._("参与人数", null, { hk: "qwhmF" });
export const guildAdmin_statsPerCapita = (fbs: FbsRuntime) => fbs._("人均参与", null, { hk: "2pPXsv" });
export const guildAdmin_statsMembersTitle = (fbs: FbsRuntime) => fbs._("成员参与榜 · 近 4 周", null, { hk: "2ZOPoL" });
export const guildAdmin_statsLeadersTitle = (fbs: FbsRuntime) => fbs._("车头榜 · 近 4 周", null, { hk: "10yBQi" });
export const guildAdmin_statsSeatCount = (fbs: FbsRuntime) => fbs._("落座次数", null, { hk: "1RpL2x" });
export const guildAdmin_statsCarCount = (fbs: FbsRuntime) => fbs._("开车数", null, { hk: "2sLw8Q" });
export const guildAdmin_statsEmpty = (fbs: FbsRuntime) => fbs._("近 4 周暂无组队数据。", null, { hk: "4g8K6d" });
export const guildAdmin_statsBoardEmpty = (fbs: FbsRuntime) => fbs._("暂无记录。", null, { hk: "2kDDc8" });
export const guildAdmin_whiteLabelTitle = (fbs: FbsRuntime) => fbs._("品牌与分享卡", null, { hk: "3tBF8B" });
export const guildAdmin_hideBrandingLabel = (fbs: FbsRuntime) => fbs._("隐藏平台品牌", null, { hk: "B3gJ7" });
export const guildAdmin_hideBrandingHint = (fbs: FbsRuntime) => fbs._("开启后，本百业的页面上不再显示平台名称与页脚声明，只呈现百业自己的信息。", null, { hk: "2CFQCo" });
export const guildAdmin_ogAccentLabel = (fbs: FbsRuntime) => fbs._("分享卡强调色", null, { hk: "43xymh" });
export const guildAdmin_ogTitleSuffixLabel = (fbs: FbsRuntime) => fbs._("分享卡标题后缀", null, { hk: "1TtHpA" });
export const guildAdmin_ogTitleSuffixHint = (fbs: FbsRuntime) => fbs._("会接在分享卡的标题后面，如「· 招募中」；最多 30 字，留空不显示。", null, { hk: "3QJFGn" });
export const guildAdmin_ogAccentGold = (fbs: FbsRuntime) => fbs._("鎏金", null, { hk: "4crX3k" });
export const guildAdmin_ogAccentJade = (fbs: FbsRuntime) => fbs._("翡翠", null, { hk: "4gz8QP" });
export const guildAdmin_ogAccentAzure = (fbs: FbsRuntime) => fbs._("藏青", null, { hk: "31zoiU" });
export const guildAdmin_ogAccentCinnabar = (fbs: FbsRuntime) => fbs._("朱砂", null, { hk: "hHKO6" });
export const guildAdmin_ogAccentViolet = (fbs: FbsRuntime) => fbs._("紫檀", null, { hk: "xcFB8" });
export const guildAdmin_premiumLockedTitle = (fbs: FbsRuntime) => fbs._("开通百业 Premium", null, { hk: "1zTlqd" });
export const guildAdmin_premiumLockedBody = (fbs: FbsRuntime) => fbs._("高级发车提醒、出勤统计、品牌与分享卡定制均为 Premium 功能。开通后立即生效，可随时取消。", null, { hk: "2QMm7e" });
export const guildAdmin_premiumCheckoutButton = (fbs: FbsRuntime) => fbs._("立即开通", null, { hk: "3btQcg" });
export const guildAdmin_premiumComingSoon = (fbs: FbsRuntime) => fbs._("即将开放", null, { hk: "4nnoW" });
export const guildAdmin_premiumActiveTitle = (fbs: FbsRuntime) => fbs._("百业 Premium", null, { hk: "esBvK" });
export const guildAdmin_premiumPlanName = (fbs: FbsRuntime) => fbs._("Premium", null, { hk: "2NSkmp" });
export const guildAdmin_premiumSourceStripe = (fbs: FbsRuntime) => fbs._("通过 Stripe 订阅", null, { hk: "2kIc06" });
export const guildAdmin_premiumSourceManual = (fbs: FbsRuntime) => fbs._("由平台授予", null, { hk: "47VlRz" });
export const guildAdmin_premiumPeriodEnd = (fbs: FbsRuntime, p?: StringParams) => fbs._("当前周期至 {date}", [fbs._param("date", pv(p, "date"))], { hk: "YJWyt" });
export const guildAdmin_premiumPriceMonth = (fbs: FbsRuntime, p?: StringParams) => fbs._("{amount} / 月", [fbs._param("amount", pv(p, "amount"))], { hk: "1WGP5w" });
export const guildAdmin_premiumPriceYear = (fbs: FbsRuntime, p?: StringParams) => fbs._("{amount} / 年", [fbs._param("amount", pv(p, "amount"))], { hk: "13GQbX" });
export const guildAdmin_billingSuccess = (fbs: FbsRuntime) => fbs._("开通成功，Premium 已生效。", null, { hk: "30ayWl" });
export const guildAdmin_billingCanceled = (fbs: FbsRuntime) => fbs._("已取消开通，未产生扣费。", null, { hk: "3I6hit" });
export const guildAdmin_tabAnnouncements = (fbs: FbsRuntime) => fbs._("公告广播", null, { hk: "1mwQts" });
export const guildAdmin_tabTools = (fbs: FbsRuntime) => fbs._("活动工具", null, { hk: "4xZo00" });
export const guildAdmin_lotteryTitle = (fbs: FbsRuntime) => fbs._("活动抽奖", null, { hk: "4tJDFB" });
export const guildAdmin_lotteryHint = (fbs: FbsRuntime) => fbs._("参与名单可来自某辆车的参与者，或手选本百业成员；名单与权重在创建时定格。开奖按权重随机抽取，同一抽奖内不会重复中奖；抽奖、名单、权重与结果全部留痕可查。", null, { hk: "1VRaXI" });
export const guildAdmin_lotteryEmpty = (fbs: FbsRuntime) => fbs._("还没有抽奖，先创建一个。", null, { hk: "1mIUhs" });
export const guildAdmin_lotteryNameLabel = (fbs: FbsRuntime) => fbs._("抽奖标题", null, { hk: "1FtwJ" });
export const guildAdmin_lotteryPrizeLabel = (fbs: FbsRuntime) => fbs._("奖品 / 奖池", null, { hk: "1rPO0u" });
export const guildAdmin_lotterySourceLabel = (fbs: FbsRuntime) => fbs._("参与名单来源", null, { hk: "3yFZMg" });
export const guildAdmin_lotterySourceGrouping = (fbs: FbsRuntime) => fbs._("某辆车的参与者", null, { hk: "2F5EyL" });
export const guildAdmin_lotterySourceMembers = (fbs: FbsRuntime) => fbs._("手选百业成员", null, { hk: "3Ujpnt" });
export const guildAdmin_lotteryGroupingLabel = (fbs: FbsRuntime) => fbs._("选择车队", null, { hk: "x4B3O" });
export const guildAdmin_lotteryWinnerCountLabel = (fbs: FbsRuntime) => fbs._("中奖人数", null, { hk: "2CH5eF" });
export const guildAdmin_lotteryUniformWeightLabel = (fbs: FbsRuntime) => fbs._("统一权重", null, { hk: "2fcJFz" });
export const guildAdmin_lotteryWeightLabel = (fbs: FbsRuntime) => fbs._("权重", null, { hk: "1AvaaD" });
export const guildAdmin_lotteryEntriesLabel = (fbs: FbsRuntime) => fbs._("参与名单", null, { hk: "1hfF9X" });
export const guildAdmin_lotteryWinnersLabel = (fbs: FbsRuntime) => fbs._("中奖名单", null, { hk: "1divNO" });
export const guildAdmin_lotteryCreateButton = (fbs: FbsRuntime) => fbs._("创建抽奖", null, { hk: "117nty" });
export const guildAdmin_lotteryDrawButton = (fbs: FbsRuntime) => fbs._("开奖", null, { hk: "1MxeN3" });
export const guildAdmin_lotteryStatusOpen = (fbs: FbsRuntime) => fbs._("待开奖", null, { hk: "13jw7h" });
export const guildAdmin_lotteryStatusDrawn = (fbs: FbsRuntime) => fbs._("已开奖", null, { hk: "YcXPM" });
export const guildAdmin_lotteryEntryCount = (fbs: FbsRuntime, p?: StringParams) => fbs._("{count} 人参与", [fbs._param("count", pv(p, "count"))], { hk: "28nwar" });
export const guildAdmin_tabRecruit = (fbs: FbsRuntime) => fbs._("招新与导师", null, { hk: "3UZ4d3" });
export const guildAdmin_tabOfficer = (fbs: FbsRuntime) => fbs._("军官工具", null, { hk: "2bm6Co" });
export const groupingTemplate_sectionTitle = (fbs: FbsRuntime) => fbs._("车队模板", null, { hk: "35g98E" });
export const groupingTemplate_nameLabel = (fbs: FbsRuntime) => fbs._("模板名", null, { hk: "2tuPfR" });
export const groupingTemplate_namePlaceholder = (fbs: FbsRuntime) => fbs._("给模板起个名字", null, { hk: "1ekuCO" });
export const groupingTemplate_saveFromForm = (fbs: FbsRuntime) => fbs._("存为模板", null, { hk: "34Ujtw" });
export const groupingTemplate_updateSubmit = (fbs: FbsRuntime) => fbs._("保存模板修改", null, { hk: "4dbCfT" });
export const groupingTemplate_editingNotice = (fbs: FbsRuntime, p?: StringParams) => fbs._("正在编辑模板「{name}」", [fbs._param("name", pv(p, "name"))], { hk: "3VIw1K" });
export const groupingTemplate_cancelEdit = (fbs: FbsRuntime) => fbs._("取消编辑", null, { hk: "x9ZpB" });
export const groupingTemplate_empty = (fbs: FbsRuntime) => fbs._("还没有模板，把常用配置存下来，下次一键预填", null, { hk: "4dGBVt" });
export const groupingTemplate_whenToday = (fbs: FbsRuntime, p?: StringParams) => fbs._("今天 {time} 发车", [fbs._param("time", pv(p, "time"))], { hk: "2qIdnB" });
export const groupingTemplate_whenTomorrow = (fbs: FbsRuntime, p?: StringParams) => fbs._("明天 {time} 发车", [fbs._param("time", pv(p, "time"))], { hk: "1N3ckF" });
export const groupingTemplate_whenDays = (fbs: FbsRuntime, p?: StringParams) => fbs._("{days} 天后 {time} 发车", [fbs._param("days", pv(p, "days")), fbs._param("time", pv(p, "time"))], { hk: "3Ddy0K" });
export const groupingTemplate_toastSaved = (fbs: FbsRuntime) => fbs._("模板已保存", null, { hk: "1BVsie" });
export const groupingTemplate_toastSaveFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("模板保存失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "10GAbm" });
export const groupingTemplate_toastDeleted = (fbs: FbsRuntime) => fbs._("模板已删除", null, { hk: "1DAJEz" });
export const groupingTemplate_toastDeleteFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("模板删除失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "2Sd7qc" });
export const groupingTemplate_edit = (fbs: FbsRuntime) => fbs._("编辑", null, { hk: "15FuoF" });
export const groupingTemplate_delete = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "17uB9L" });
export const groupingTemplate_deleteConfirmTitle = (fbs: FbsRuntime) => fbs._("删除模板", null, { hk: "4n7M52" });
export const groupingTemplate_deleteConfirmMessage = (fbs: FbsRuntime, p?: StringParams) => fbs._("确定删除模板「{name}」吗？", [fbs._param("name", pv(p, "name"))], { hk: "1p5NmL" });
export const groupingTemplate_saveButton = (fbs: FbsRuntime) => fbs._("📋 存为模板", null, { hk: "2uyg98" });
export const groupingTemplate_saveDialogTitle = (fbs: FbsRuntime) => fbs._("存为车队模板", null, { hk: "3sxchw" });
export const groupingTemplate_saveSubmit = (fbs: FbsRuntime) => fbs._("保存模板", null, { hk: "1RhWGo" });
export const groupingTemplate_toastSavedFromCar = (fbs: FbsRuntime) => fbs._("已存为模板，可在发新车时一键预填", null, { hk: "C7G72" });
export const groupingTemplate_metaTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{type}{dungeon} · {max} 人", [
	fbs._param("type", pv(p, "type")),
	fbs._param("dungeon", pv(p, "dungeon")),
	fbs._param("max", pv(p, "max"))
], { hk: "28bnDJ" });
export const account_sectionTitle = (fbs: FbsRuntime) => fbs._("我的数据", null, { hk: "OCui9" });
export const account_exportLabel = (fbs: FbsRuntime) => fbs._("导出我的数据", null, { hk: "3O9t2L" });
export const account_exportHint = (fbs: FbsRuntime) => fbs._("把你账号的全部数据下载为一个 JSON 文件：账号资料、百业名册、你创建的车队、你的报名座位、装备库与方案。登录凭据与推送令牌出于安全不会包含在内。", null, { hk: "1NMi3z" });
export const account_deleteLabel = (fbs: FbsRuntime) => fbs._("删除账号", null, { hk: "1E1eYG" });
export const account_deleteHint = (fbs: FbsRuntime) => fbs._("删除不可恢复。提交后有 7 天冷静期，期间可随时撤销；到期后你的个人数据会被删除或匿名化。", null, { hk: "witTx" });
export const account_reauthLabel = (fbs: FbsRuntime) => fbs._("通过 Discord 重新验证", null, { hk: "2FLJo7" });
export const account_reauthHint = (fbs: FbsRuntime) => fbs._("导出与删除属于敏感操作，继续前需要一次新鲜的 Discord 授权验证。", null, { hk: "1veUxg" });
export const account_confirmTitle = (fbs: FbsRuntime) => fbs._("确认删除账号", null, { hk: "1IhRo9" });
export const account_confirmIntro = (fbs: FbsRuntime) => fbs._("请仔细阅读删除后果。提交后进入 7 天冷静期，到期自动执行：", null, { hk: "19FbVN" });
export const account_consequenceCars = (fbs: FbsRuntime) => fbs._("你创建的车队不会被删除：车头会解绑为无主车队，创建者显示名替换为「已注销用户」；你在他人车队里的座位会被原地匿名化。", null, { hk: "3R3D8w" });
export const account_consequenceData = (fbs: FbsRuntime) => fbs._("你的装备库与方案、推送令牌、昵称快照、百业名册行会被彻底删除；执行后你在所有设备上的登录会立即失效。", null, { hk: "3C3jLk" });
export const account_consequenceGuilds = (fbs: FbsRuntime) => fbs._("百业本身与百业管理密码不受影响：百业不属于任何个人账号，不会因你删除账号而解散或变更。", null, { hk: "QwtV4" });
export const account_consequenceResidual = (fbs: FbsRuntime) => fbs._("少数记录无法按个人清除：已经发到 Discord 的消息、成绩榜里的自由文本名单会保留；备份中的副本最迟在 14 天内随每日备份轮换清除。", null, { hk: "4ym2I3" });
export const account_consequenceReregister = (fbs: FbsRuntime) => fbs._("删除不是封禁：之后用同一个 Discord 账号重新登录，就会注册成一个全新的账号。", null, { hk: "4tutR4" });
export const account_exportFirstHint = (fbs: FbsRuntime) => fbs._("建议先导出一份你的数据，再提交删除。", null, { hk: "4n50u1" });
export const account_usernameLabel = (fbs: FbsRuntime) => fbs._("输入你的 Discord 显示名以确认", null, { hk: "47r3xJ" });
export const account_submitLabel = (fbs: FbsRuntime) => fbs._("提交删除申请", null, { hk: "1sQhip" });
export const account_backLabel = (fbs: FbsRuntime) => fbs._("返回", null, { hk: "4qWno6" });
export const account_pendingTitle = (fbs: FbsRuntime) => fbs._("账号删除已排期", null, { hk: "3p15DP" });
export const account_pendingBody = (fbs: FbsRuntime, p?: StringParams) => fbs._("你的账号将于 {date} 执行删除。到期前你可以随时撤销；用新设备重新登录也会自动撤销（到期后除外）。", [fbs._param("date", pv(p, "date"))], { hk: "4r5pfd" });
export const account_cancelDeletionLabel = (fbs: FbsRuntime) => fbs._("撤销删除", null, { hk: "3pylJe" });
export const account_deletionRequestedText = (fbs: FbsRuntime) => fbs._("删除申请已提交，7 天冷静期开始。", null, { hk: "d0xuE" });
export const account_deletionCancelledText = (fbs: FbsRuntime) => fbs._("删除申请已撤销，你的账号不会被删除。", null, { hk: "2aktzH" });
export const account_exportAbout = (fbs: FbsRuntime) => fbs._("这是你账号数据的导出副本。account 是账号资料（oauth 只记录授权范围与最近刷新时间，凭据本身不导出）；guilds 是你在各百业的名册行；serverNicks 是你在各 Discord 服务器的昵称快照；carsLed 是你创建的车队；seats 是你的报名座位；gearItems 是装备库；gearBuilds 是已保存方案；heirloom 是传家宝推送的去重状态。推送令牌属于设备凭据，只记录数量与平台，令牌本身不导出。", null, { hk: "2jkr2d" });
export const account_deletedUser = (fbs: FbsRuntime) => fbs._("已注销用户", null, { hk: "VSvGc" });
export const buildshare_kicker = (fbs: FbsRuntime) => fbs._("装备方案 · 公开分享", null, { hk: "2mR3Q6" });
export const buildshare_loginLabel = (fbs: FbsRuntime) => fbs._("打开燕云百业", null, { hk: "1VNDBE" });
export const buildshare_notFoundTitle = (fbs: FbsRuntime) => fbs._("链接已失效", null, { hk: "2d2xok" });
export const buildshare_notFoundBody = (fbs: FbsRuntime) => fbs._("这条分享链接不存在，或已被方案主人取消分享。", null, { hk: "4yzes1" });
export const buildshare_xinfaLabel = (fbs: FbsRuntime) => fbs._("心法", null, { hk: "2FvBYf" });
export const landing_featuresTitle = (fbs: FbsRuntime) => fbs._("为百业同道而备", null, { hk: "30fiRp" });
export const landing_groupingTitle = (fbs: FbsRuntime) => fbs._("组队报名", null, { hk: "3GcCE6" });
export const landing_groupingBody = (fbs: FbsRuntime) => fbs._("双十、天赋、竞速、爬塔四类车队一键成行，席位名册一目了然，短链分享直达车队页。", null, { hk: "TYPkk" });
export const landing_reminderTitle = (fbs: FbsRuntime) => fbs._("发车提醒", null, { hk: "1I57Xc" });
export const landing_reminderBody = (fbs: FbsRuntime) => fbs._("发车前自动提醒到 Discord 频道与手机 App，就位确认先行，只催还没到场的人。", null, { hk: "4yOrhR" });
export const landing_dexTitle = (fbs: FbsRuntime) => fbs._("图鉴与攻略", null, { hk: "2yRnb3" });
export const landing_dexBody = (fbs: FbsRuntime) => fbs._("副本、首领图鉴与机制攻略，十一流派毕业词缀与配装参考，随国际服版本更新。", null, { hk: "2sWNHM" });
export const landing_gearTitle = (fbs: FbsRuntime) => fbs._("装备规划", null, { hk: "1GYbKD" });
export const landing_gearBody = (fbs: FbsRuntime) => fbs._("个人装备库与搭配筹谋：粘贴、截图识别或手动录入，承音调律与毕业度测算，离毕业还差多少一眼看清。", null, { hk: "MUw86" });
export const feedback_entryLabel = (fbs: FbsRuntime) => fbs._("意见反馈", null, { hk: "2EHi6W" });
export const feedback_title = (fbs: FbsRuntime) => fbs._("意见反馈", null, { hk: "3jiyS5" });
export const feedback_categoryLabel = (fbs: FbsRuntime) => fbs._("类别", null, { hk: "29BWdW" });
export const feedback_catProblem = (fbs: FbsRuntime) => fbs._("问题", null, { hk: "41yRJv" });
export const feedback_catSuggestion = (fbs: FbsRuntime) => fbs._("建议", null, { hk: "R3Ote" });
export const feedback_catOther = (fbs: FbsRuntime) => fbs._("其他", null, { hk: "2Sijpr" });
export const feedback_placeholder = (fbs: FbsRuntime) => fbs._("请描述遇到的问题，或写下你的建议…", null, { hk: "3hlL0j" });
export const feedback_submit = (fbs: FbsRuntime) => fbs._("提交反馈", null, { hk: "3hPuq7" });
export const feedback_submitting = (fbs: FbsRuntime) => fbs._("提交中…", null, { hk: "4zlo50" });
export const feedback_success = (fbs: FbsRuntime) => fbs._("已收到，感谢你的反馈。", null, { hk: "R7XC9" });
export const announcements_title = (fbs: FbsRuntime) => fbs._("百业公告", null, { hk: "MGb24" });
export const announcements_emptyText = (fbs: FbsRuntime) => fbs._("暂无公告", null, { hk: "3M3Yf8" });
export const announcements_urgentLabel = (fbs: FbsRuntime) => fbs._("紧急集合", null, { hk: "3VNREO" });
export const announcements_standardLabel = (fbs: FbsRuntime) => fbs._("公告", null, { hk: "2ukk4" });
export const announcements_unreadLabel = (fbs: FbsRuntime) => fbs._("未读", null, { hk: "1ZLfIs" });
export const announcements_readLabel = (fbs: FbsRuntime) => fbs._("已读", null, { hk: "HoPYb" });
export const announcements_composeTitle = (fbs: FbsRuntime) => fbs._("发布公告", null, { hk: "wlwhx" });
export const announcements_kindLabel = (fbs: FbsRuntime) => fbs._("类型", null, { hk: "1sGP4D" });
export const announcements_kindStandardLabel = (fbs: FbsRuntime) => fbs._("普通公告", null, { hk: "3dgvPU" });
export const announcements_kindUrgentLabel = (fbs: FbsRuntime) => fbs._("紧急集合呼叫", null, { hk: "1xO5fU" });
export const announcements_titleLabel = (fbs: FbsRuntime) => fbs._("标题", null, { hk: "1SYkdB" });
export const announcements_titlePlaceholder = (fbs: FbsRuntime) => fbs._("公告标题", null, { hk: "4EHXbv" });
export const announcements_bodyLabel = (fbs: FbsRuntime) => fbs._("正文", null, { hk: "2fGGLN" });
export const announcements_bodyPlaceholder = (fbs: FbsRuntime) => fbs._("公告正文", null, { hk: "3BtnFr" });
export const announcements_postLabel = (fbs: FbsRuntime) => fbs._("发布并推送", null, { hk: "157qYg" });
export const announcements_postingLabel = (fbs: FbsRuntime) => fbs._("发布中…", null, { hk: "1xsGJe" });
export const announcements_postedText = (fbs: FbsRuntime) => fbs._("公告已发布", null, { hk: "2coh5Z" });
export const announcements_deleteLabel = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "1kSM6C" });
export const announcements_deleteConfirmTitle = (fbs: FbsRuntime) => fbs._("删除这条公告？", null, { hk: "4ysWFd" });
export const announcements_deleteConfirmMessage = (fbs: FbsRuntime, p?: StringParams) => fbs._("确定要删除公告「{title}」吗？已读记录会一并删除。", [fbs._param("title", pv(p, "title"))], { hk: "2KIeBM" });
export const announcements_deletedText = (fbs: FbsRuntime) => fbs._("公告已删除", null, { hk: "2EEtMN" });
export const announcements_receiptsTitle = (fbs: FbsRuntime) => fbs._("阅读情况", null, { hk: "1ZFpZL" });
export const announcements_readCountTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("已读 {read} / {total}", [fbs._param("read", pv(p, "read")), fbs._param("total", pv(p, "total"))], { hk: "lnaew" });
export const announcements_readListLabel = (fbs: FbsRuntime) => fbs._("已读成员", null, { hk: "2qaUIa" });
export const announcements_unreadListLabel = (fbs: FbsRuntime) => fbs._("未读成员", null, { hk: "2Kpwzn" });
export const announcements_authorTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{name} 发布", [fbs._param("name", pv(p, "name"))], { hk: "2KA9Ho" });
export const announcements_pushNote = (fbs: FbsRuntime) => fbs._("发布后会向全体成员推送通知；没有开启推送的成员也能在这里看到。", null, { hk: "1f9zk3" });
export const announcements_urgentNote = (fbs: FbsRuntime) => fbs._("紧急集合呼叫请只用于临时集合等紧急情况，每天最多 2 次。", null, { hk: "3hzPCL" });
export const announcements_dailyLimitTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("今日还可发布 {remaining} 条", [fbs._param("remaining", pv(p, "remaining"))], { hk: "cJfJv" });
export const schedule_title = (fbs: FbsRuntime) => fbs._("排期", null, { hk: "1kg7Hz" });
export const schedule_myTitle = (fbs: FbsRuntime) => fbs._("我的可用时间", null, { hk: "37Skxo" });
export const schedule_myHint = (fbs: FbsRuntime) => fbs._("填写你每周固定有空的时段，按你所在时区显示；管理员与车头据此定档期。", null, { hk: "11ksia" });
export const schedule_slotRange = (fbs: FbsRuntime, p?: StringParams) => fbs._("{start}–{end}", [fbs._param("start", pv(p, "start")), fbs._param("end", pv(p, "end"))], { hk: "3uCLiw" });
export const schedule_addSlotLabel = (fbs: FbsRuntime) => fbs._("添加时段", null, { hk: "49aLiX" });
export const schedule_removeLabel = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "kzr6q" });
export const schedule_saveLabel = (fbs: FbsRuntime) => fbs._("保存", null, { hk: "1da7CH" });
export const schedule_savedText = (fbs: FbsRuntime) => fbs._("可用时间已保存", null, { hk: "2e2sB6" });
export const schedule_saveFailedTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("保存失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "3oB9P5" });
export const schedule_emptyMineText = (fbs: FbsRuntime) => fbs._("你还没有填写可用时间。", null, { hk: "oz2zF" });
export const schedule_summaryTitle = (fbs: FbsRuntime) => fbs._("成员可用性汇总", null, { hk: "4rLG6c" });
export const schedule_summaryHint = (fbs: FbsRuntime) => fbs._("汇总仅百业管理员与发过车的车头可见，用于定档期。", null, { hk: "qVAlc" });
export const schedule_summaryEmptyText = (fbs: FbsRuntime) => fbs._("还没有成员填写可用时间。", null, { hk: "3hxXXz" });
export const schedule_pollsTitle = (fbs: FbsRuntime) => fbs._("活动时间投票", null, { hk: "3y6XMv" });
export const schedule_pollsHint = (fbs: FbsRuntime) => fbs._("给出几个候选时间，成员勾选所有能参加的时间；可参加人数最多的时段最适合定档。", null, { hk: "TPTvZ" });
export const schedule_pollEmptyText = (fbs: FbsRuntime) => fbs._("还没有时间投票。", null, { hk: "4atD2M" });
export const schedule_pollCreateLabel = (fbs: FbsRuntime) => fbs._("发起投票", null, { hk: "1EMF3" });
export const schedule_pollTitleLabel = (fbs: FbsRuntime) => fbs._("投票标题", null, { hk: "2TJHm3" });
export const schedule_pollTitlePlaceholder = (fbs: FbsRuntime) => fbs._("如：本周开荒时间", null, { hk: "4tBVc1" });
export const schedule_pollCandidatesLabel = (fbs: FbsRuntime) => fbs._("候选时间", null, { hk: "2bb1k7" });
export const schedule_pollAddCandidateLabel = (fbs: FbsRuntime) => fbs._("添加候选", null, { hk: "4tjT2I" });
export const schedule_pollSubmitLabel = (fbs: FbsRuntime) => fbs._("发布投票", null, { hk: "PwjQA" });
export const schedule_pollVoteLabel = (fbs: FbsRuntime) => fbs._("提交投票", null, { hk: "1QVvp8" });
export const schedule_pollVotedText = (fbs: FbsRuntime) => fbs._("已投票，可修改后重新提交。", null, { hk: "4h7A52" });
export const schedule_pollStatusOpenText = (fbs: FbsRuntime) => fbs._("进行中", null, { hk: "2spNSZ" });
export const schedule_pollStatusClosedText = (fbs: FbsRuntime) => fbs._("已关闭", null, { hk: "3jbo32" });
export const schedule_pollCloseLabel = (fbs: FbsRuntime) => fbs._("关闭投票", null, { hk: "SyIKu" });
export const schedule_pollVoteCountTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{count} 人可参加", [fbs._param("count", pv(p, "count"))], { hk: "3YclRu" });
export const schedule_pollLaunchLabel = (fbs: FbsRuntime) => fbs._("以此时间发车", null, { hk: "2uEZ9B" });
export const schedule_pollCancelLabel = (fbs: FbsRuntime) => fbs._("取消", null, { hk: "2a0yi5" });
export const schedule_toastPollCreated = (fbs: FbsRuntime) => fbs._("投票已发布", null, { hk: "4rKnD1" });
export const schedule_toastVoted = (fbs: FbsRuntime) => fbs._("已提交", null, { hk: "10p0Jr" });
export const schedule_toastClosed = (fbs: FbsRuntime) => fbs._("投票已关闭", null, { hk: "3aX8KY" });
export const schedule_toastFailedTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("操作失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "1yF32T" });
export const schedule_settingsLinkLabel = (fbs: FbsRuntime) => fbs._("在个人设置中填写", null, { hk: "2v8aPQ" });
export const schedule_noGuildsText = (fbs: FbsRuntime) => fbs._("你还没有加入任何百业，加入后可在此填写可用时间。", null, { hk: "2L9e4n" });
export const recruit_title = (fbs: FbsRuntime) => fbs._("招新与新人", null, { hk: "2Kv5c8" });
export const recruit_homeBody = (fbs: FbsRuntime) => fbs._("想加入一个百业？在下面挑一个开放招新的百业提交入业申请，百业管理员会在管理面审核。已经在业的新人可以在这里看自己的入业清单与导师配对。", null, { hk: "3aGDP8" });
export const recruit_homeLoginHint = (fbs: FbsRuntime) => fbs._("登录后即可对心仪的百业提交入业申请，并在这里查看审核进度。", null, { hk: "wi0kU" });
export const recruit_applySectionTitle = (fbs: FbsRuntime) => fbs._("入业申请", null, { hk: "1wGTaS" });
export const recruit_messageLabel = (fbs: FbsRuntime) => fbs._("申请附言", null, { hk: "39x2FC" });
export const recruit_messagePlaceholder = (fbs: FbsRuntime) => fbs._("一句自我介绍（可选）：常玩的流派、在线时间……", null, { hk: "1VplXa" });
export const recruit_submitButton = (fbs: FbsRuntime) => fbs._("提交申请", null, { hk: "34YRGv" });
export const recruit_submittingButton = (fbs: FbsRuntime) => fbs._("提交中…", null, { hk: "4aBpl4" });
export const recruit_myApplicationTitle = (fbs: FbsRuntime) => fbs._("我的申请", null, { hk: "2yCLBb" });
export const recruit_statusPending = (fbs: FbsRuntime) => fbs._("待审核", null, { hk: "37MjXN" });
export const recruit_statusApproved = (fbs: FbsRuntime) => fbs._("已通过", null, { hk: "1WgveJ" });
export const recruit_statusRejected = (fbs: FbsRuntime) => fbs._("未通过", null, { hk: "3oqA2g" });
export const recruit_pendingHint = (fbs: FbsRuntime) => fbs._("管理员审核中，请耐心等待；审核结果会直接更新在这里。", null, { hk: "6u8tD" });
export const recruit_approvedNextStep = (fbs: FbsRuntime) => fbs._("申请已通过，你已登记进百业名册。最后一步在 Discord 完成：加入本百业绑定的 Discord 服务器——成员资格由 Discord 服务器成员身份决定，平台没有 Discord 机器人权限，无法替你加入服务器或授予身份组；加入后用同一账号登录即可使用百业全部功能。", null, { hk: "2yVdgv" });
export const recruit_rejectedHint = (fbs: FbsRuntime) => fbs._("本次申请未通过。可以修改附言后重新提交一份新申请。", null, { hk: "3EZtok" });
export const recruit_checklistTitle = (fbs: FbsRuntime) => fbs._("新手入业清单", null, { hk: "SdChL" });
export const recruit_checklistProgress = (fbs: FbsRuntime, p?: StringParams) => fbs._("已完成 {done} / {total}", [fbs._param("done", pv(p, "done")), fbs._param("total", pv(p, "total"))], { hk: "43OtnH" });
export const recruit_itemProfileLabel = (fbs: FbsRuntime) => fbs._("完善流派 / 时区", null, { hk: "2BseCa" });
export const recruit_itemProfileHint = (fbs: FbsRuntime) => fbs._("在任意车队报名落座时填上你的流派即算完成；时区由你的客户端自动同步，无需手动填写。", null, { hk: "25XMMS" });
export const recruit_itemMentorLabel = (fbs: FbsRuntime) => fbs._("认一位导师", null, { hk: "4m0bsF" });
export const recruit_itemMentorHint = (fbs: FbsRuntime) => fbs._("由百业管理员为你配对一位导师后自动完成。", null, { hk: "2XT8L7" });
export const recruit_itemFirstRunLabel = (fbs: FbsRuntime) => fbs._("打完第一场", null, { hk: "1C3tvD" });
export const recruit_itemFirstRunHint = (fbs: FbsRuntime) => fbs._("在一辆已完成的车队里落座后自动完成。", null, { hk: "2SJLl3" });
export const recruit_myPairingsTitle = (fbs: FbsRuntime) => fbs._("我的导师配对", null, { hk: "33EX47" });
export const recruit_itemAvailabilityLabel = (fbs: FbsRuntime) => fbs._("填写可用时间", null, { hk: "1ccGNR" });
export const recruit_itemAvailabilityHint = (fbs: FbsRuntime) => fbs._("在个人设置里填写你每周固定有空的时段，方便管理员与车头定档期；可以先跳过，之后随时补填。", null, { hk: "4y5PHe" });
export const recruit_pairingStatusActive = (fbs: FbsRuntime) => fbs._("进行中", null, { hk: "24mBsd" });
export const recruit_pairingStatusEnded = (fbs: FbsRuntime) => fbs._("已结束", null, { hk: "eBun0" });
export const recruit_mentorRoleLabel = (fbs: FbsRuntime) => fbs._("导师", null, { hk: "22AZ4f" });
export const recruit_menteeRoleLabel = (fbs: FbsRuntime) => fbs._("新人", null, { hk: "3kLesg" });
export const recruit_adminApplicationsTitle = (fbs: FbsRuntime) => fbs._("入业申请审核", null, { hk: "3gB0cy" });
export const recruit_adminApplicationsEmpty = (fbs: FbsRuntime) => fbs._("暂无申请记录。", null, { hk: "cXV3X" });
export const recruit_adminApproveButton = (fbs: FbsRuntime) => fbs._("通过", null, { hk: "4efpOC" });
export const recruit_adminRejectButton = (fbs: FbsRuntime) => fbs._("拒绝", null, { hk: "bqOYJ" });
export const recruit_adminMentorPoolTitle = (fbs: FbsRuntime) => fbs._("导师人选", null, { hk: "22uvrk" });
export const recruit_adminSetMentorButton = (fbs: FbsRuntime) => fbs._("设为导师", null, { hk: "3jzxHY" });
export const recruit_adminUnsetMentorButton = (fbs: FbsRuntime) => fbs._("取消导师", null, { hk: "4i8mD4" });
export const recruit_adminPairingsTitle = (fbs: FbsRuntime) => fbs._("导师配对", null, { hk: "39ltUF" });
export const recruit_adminPairingsEmpty = (fbs: FbsRuntime) => fbs._("暂无配对记录。", null, { hk: "3Rkx0G" });
export const recruit_adminPairingCreateButton = (fbs: FbsRuntime) => fbs._("建立配对", null, { hk: "1BZnGt" });
export const recruit_adminPairingEndButton = (fbs: FbsRuntime) => fbs._("结束配对", null, { hk: "3xXyJj" });
export const recruit_adminMentorSelectLabel = (fbs: FbsRuntime) => fbs._("选择导师", null, { hk: "33oCpc" });
export const recruit_adminMenteeSelectLabel = (fbs: FbsRuntime) => fbs._("选择新人", null, { hk: "2xbYJV" });
export const recruit_adminNewcomersTitle = (fbs: FbsRuntime) => fbs._("新人清单进度", null, { hk: "20h3yo" });
export const recruit_adminNewcomersEmpty = (fbs: FbsRuntime) => fbs._("暂无未完成清单的新人。", null, { hk: "aqRS1" });
export const officer_notesTitle = (fbs: FbsRuntime) => fbs._("成员备注", null, { hk: "2AROGK" });
export const officer_notesHint = (fbs: FbsRuntime) => fbs._("备注仅百业管理员可见，成员本人看不到关于自己的备注。", null, { hk: "3R2nV5" });
export const officer_notesEmpty = (fbs: FbsRuntime) => fbs._("本百业暂无成员名册。", null, { hk: "4t3SZG" });
export const officer_memberNoNotes = (fbs: FbsRuntime) => fbs._("暂无备注", null, { hk: "2rQTg8" });
export const officer_notePlaceholder = (fbs: FbsRuntime) => fbs._("写一条备注…", null, { hk: "1p5gjW" });
export const officer_noteAddButton = (fbs: FbsRuntime) => fbs._("添加备注", null, { hk: "4D1YhV" });
export const officer_noteEditButton = (fbs: FbsRuntime) => fbs._("编辑", null, { hk: "3EnOv0" });
export const officer_noteSaveButton = (fbs: FbsRuntime) => fbs._("保存", null, { hk: "rxrIq" });
export const officer_noteDeleteButton = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "1PU9oZ" });
export const officer_noteAuthorTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{name} 添加", [fbs._param("name", pv(p, "name"))], { hk: "3kP8Jz" });
export const officer_exportTitle = (fbs: FbsRuntime) => fbs._("百业数据包", null, { hk: "4qW6cR" });
export const officer_exportHint = (fbs: FbsRuntime) => fbs._("导出本百业的名册、组队历史与参与记录、成员赛季目标（JSON 文件）。导出动作会留痕记录。", null, { hk: "2T41m9" });
export const officer_exportButton = (fbs: FbsRuntime) => fbs._("导出数据包", null, { hk: "28tcf" });
export const officer_exportAbout = (fbs: FbsRuntime) => fbs._("百业数据包导出：包含本百业名册、组队历史与参与记录、成员赛季目标。军官备注为内部工作记录，不包含在本数据包内。", null, { hk: "9GX1a" });
export const officer_goalsTitle = (fbs: FbsRuntime) => fbs._("成员赛季目标", null, { hk: "1BxvGF" });
export const officer_goalsHint = (fbs: FbsRuntime) => fbs._("成员给自己设的赛季目标与进度，只读总览。", null, { hk: "3uKLY1" });
export const officer_goalsEmpty = (fbs: FbsRuntime) => fbs._("暂无成员设置赛季目标。", null, { hk: "50Gat" });
export const officer_statusActive = (fbs: FbsRuntime) => fbs._("进行中", null, { hk: "3UrRel" });
export const officer_statusDone = (fbs: FbsRuntime) => fbs._("已完成", null, { hk: "1awIDe" });
export const officer_statusDropped = (fbs: FbsRuntime) => fbs._("已放弃", null, { hk: "4dKtph" });
export const officer_myEntryLabel = (fbs: FbsRuntime) => fbs._("赛季目标", null, { hk: "1kLnPO" });
export const officer_myTitle = (fbs: FbsRuntime) => fbs._("我的赛季目标", null, { hk: "3lOtvC" });
export const officer_myHint = (fbs: FbsRuntime) => fbs._("在某个百业里给自己定一个本赛季目标，进度由你自己维护；该百业的管理员可以查看总览。", null, { hk: "uirzj" });
export const officer_myEmpty = (fbs: FbsRuntime) => fbs._("你还没有设置赛季目标。", null, { hk: "1FD0fY" });
export const officer_goalGuildLabel = (fbs: FbsRuntime) => fbs._("所属百业", null, { hk: "1Mf5w5" });
export const officer_goalTitleLabel = (fbs: FbsRuntime) => fbs._("目标", null, { hk: "3ry3Jp" });
export const officer_goalTitlePlaceholder = (fbs: FbsRuntime) => fbs._("例如：打通某个副本、集齐一套装备…", null, { hk: "4spG3F" });
export const officer_goalNoteLabel = (fbs: FbsRuntime) => fbs._("进度备注", null, { hk: "2Y90cT" });
export const officer_goalNotePlaceholder = (fbs: FbsRuntime) => fbs._("记录当前进度…", null, { hk: "3WuGTh" });
export const officer_goalDungeonLabel = (fbs: FbsRuntime) => fbs._("关联副本（可选）", null, { hk: "4q5yP7" });
export const officer_goalDungeonNone = (fbs: FbsRuntime) => fbs._("不关联副本", null, { hk: "2OWi4w" });
export const officer_goalStatusLabel = (fbs: FbsRuntime) => fbs._("状态", null, { hk: "441NsN" });
export const officer_goalAddButton = (fbs: FbsRuntime) => fbs._("添加目标", null, { hk: "40sX57" });
export const officer_goalSaveButton = (fbs: FbsRuntime) => fbs._("保存", null, { hk: "3vvb4n" });
export const officer_goalEditButton = (fbs: FbsRuntime) => fbs._("编辑", null, { hk: "1yqvac" });
export const officer_goalDeleteButton = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "2StBfp" });
export const STRING_FNS: Record<string, StringFn> = {
	"common_cancel": common_cancel,
	"common_confirm": common_confirm,
	"common_unknownError": common_unknownError,
	"common_renderError": common_renderError,
	"common_renderErrorHint": common_renderErrorHint,
	"common_backToHub": common_backToHub,
	"common_loadingGuild": common_loadingGuild,
	"common_close": common_close,
	"site_title": site_title,
	"site_subtitle": site_subtitle,
	"site_heroAlt": site_heroAlt,
	"site_seal": site_seal,
	"login_cardTitle": login_cardTitle,
	"login_cardBody1": login_cardBody1,
	"login_cardBody2": login_cardBody2,
	"login_button": login_button,
	"login_privacy": login_privacy,
	"userBar_logout": userBar_logout,
	"userBar_loggingOut": userBar_loggingOut,
	"userBar_settings": userBar_settings,
	"settings_title": settings_title,
	"settings_discordLabel": settings_discordLabel,
	"settings_languageLabel": settings_languageLabel,
	"settings_languageHint": settings_languageHint,
	"settings_autoLabel": settings_autoLabel,
	"settings_langZhCn": settings_langZhCn,
	"settings_langZhTw": settings_langZhTw,
	"settings_langEn": settings_langEn,
	"settings_langEs": settings_langEs,
	"settings_langFr": settings_langFr,
	"settings_savedText": settings_savedText,
	"picker_myGuilds": picker_myGuilds,
	"picker_myGuildsEn": picker_myGuildsEn,
	"picker_publicGuilds": picker_publicGuilds,
	"picker_publicGuildsEn": picker_publicGuildsEn,
	"picker_readOnlyBadge": picker_readOnlyBadge,
	"picker_emptyTitle": picker_emptyTitle,
	"picker_emptyBody": picker_emptyBody,
	"picker_createGuild": picker_createGuild,
	"picker_createGuildMore": picker_createGuildMore,
	"create_backLink": create_backLink,
	"create_title": create_title,
	"create_subtitle": create_subtitle,
	"create_nameLabel": create_nameLabel,
	"create_namePlaceholder": create_namePlaceholder,
	"create_slugLabel": create_slugLabel,
	"create_slugPlaceholder": create_slugPlaceholder,
	"create_slugChecking": create_slugChecking,
	"create_slugAvailable": create_slugAvailable,
	"create_slugTaken": create_slugTaken,
	"create_slugNote": create_slugNote,
	"create_serverLabel": create_serverLabel,
	"create_noServers1": create_noServers1,
	"create_noServers2": create_noServers2,
	"create_submit": create_submit,
	"create_submitting": create_submitting,
	"create_toastNameShort": create_toastNameShort,
	"create_toastSlugRequired": create_toastSlugRequired,
	"create_toastSlugBad": create_toastSlugBad,
	"create_toastServerRequired": create_toastServerRequired,
	"create_toastCreated": create_toastCreated,
	"create_toastFailed": create_toastFailed,
	"locked_backLink": locked_backLink,
	"locked_title": locked_title,
	"locked_body1": locked_body1,
	"locked_body2": locked_body2,
	"locked_backButton": locked_backButton,
	"guildHome_backToHub": guildHome_backToHub,
	"guildHome_backPlain": guildHome_backPlain,
	"guildHome_tabTeam": guildHome_tabTeam,
	"guildHome_tabDex": guildHome_tabDex,
	"guildHome_tabSect": guildHome_tabSect,
	"guildHome_tabAnnouncements": guildHome_tabAnnouncements,
	"guildHome_readOnlyBanner": guildHome_readOnlyBanner,
	"guildHome_adminLink": guildHome_adminLink,
	"guildHome_tabSchedule": guildHome_tabSchedule,
	"groupingType_tabActivity": groupingType_tabActivity,
	"groupingType_tabTalent": groupingType_tabTalent,
	"groupingType_tabRace": groupingType_tabRace,
	"groupingType_tabTower": groupingType_tabTower,
	"groupingType_shortActivity": groupingType_shortActivity,
	"groupingType_shortTalent": groupingType_shortTalent,
	"groupingType_shortRace": groupingType_shortRace,
	"groupingType_shortTower": groupingType_shortTower,
	"groupingType_shortGather": groupingType_shortGather,
	"groupingType_shortExplore": groupingType_shortExplore,
	"groupingList_prevWeek": groupingList_prevWeek,
	"groupingList_nextWeek": groupingList_nextWeek,
	"groupingList_weekHeader": groupingList_weekHeader,
	"groupingList_emptyInteractive": groupingList_emptyInteractive,
	"groupingList_emptyReadonly": groupingList_emptyReadonly,
	"groupingList_statusOpen": groupingList_statusOpen,
	"groupingList_people": groupingList_people,
	"groupingList_newCar": groupingList_newCar,
	"groupingList_seal": groupingList_seal,
	"groupingList_dayGroupHeader": groupingList_dayGroupHeader,
	"groupingList_weekday0": groupingList_weekday0,
	"groupingList_weekday1": groupingList_weekday1,
	"groupingList_weekday2": groupingList_weekday2,
	"groupingList_weekday3": groupingList_weekday3,
	"groupingList_weekday4": groupingList_weekday4,
	"groupingList_weekday5": groupingList_weekday5,
	"groupingList_weekday6": groupingList_weekday6,
	"groupingList_undatedGroup": groupingList_undatedGroup,
	"groupingDetail_notFound": groupingDetail_notFound,
	"groupingDetail_backToList": groupingDetail_backToList,
	"groupingDetail_share": groupingDetail_share,
	"groupingDetail_edit": groupingDetail_edit,
	"groupingDetail_disband": groupingDetail_disband,
	"groupingDetail_disbanding": groupingDetail_disbanding,
	"groupingDetail_statusOpen": groupingDetail_statusOpen,
	"groupingDetail_people": groupingDetail_people,
	"groupingDetail_readyProgress": groupingDetail_readyProgress,
	"groupingDetail_openHint": groupingDetail_openHint,
	"groupingDetail_readonlyHint": groupingDetail_readonlyHint,
	"groupingDetail_toastDisbanded": groupingDetail_toastDisbanded,
	"groupingDetail_toastDisbandFailed": groupingDetail_toastDisbandFailed,
	"groupingDetail_linkCopied": groupingDetail_linkCopied,
	"groupingDetail_copyFailedManual": groupingDetail_copyFailedManual,
	"groupingDetail_disbandConfirmTitle": groupingDetail_disbandConfirmTitle,
	"groupingDetail_disbandConfirmMessage": groupingDetail_disbandConfirmMessage,
	"groupingDetail_complete": groupingDetail_complete,
	"groupingDetail_completing": groupingDetail_completing,
	"groupingDetail_statusCompleted": groupingDetail_statusCompleted,
	"groupingDetail_restore": groupingDetail_restore,
	"groupingDetail_completeConfirmTitle": groupingDetail_completeConfirmTitle,
	"groupingDetail_completeConfirmMessage": groupingDetail_completeConfirmMessage,
	"groupingDetail_toastCompleted": groupingDetail_toastCompleted,
	"groupingDetail_toastCompleteFailed": groupingDetail_toastCompleteFailed,
	"groupingDetail_toastRestored": groupingDetail_toastRestored,
	"groupingDetail_toastRestoreFailed": groupingDetail_toastRestoreFailed,
	"groupingDetail_completedHint": groupingDetail_completedHint,
	"groupingDetail_rosterAnswersTitle": groupingDetail_rosterAnswersTitle,
	"groupingForm_createTitle": groupingForm_createTitle,
	"groupingForm_editTitle": groupingForm_editTitle,
	"groupingForm_typeLabel": groupingForm_typeLabel,
	"groupingForm_capacity": groupingForm_capacity,
	"groupingForm_hintActivity": groupingForm_hintActivity,
	"groupingForm_hintDungeon": groupingForm_hintDungeon,
	"groupingForm_hintTalent": groupingForm_hintTalent,
	"groupingForm_hintRace": groupingForm_hintRace,
	"groupingForm_hintTower": groupingForm_hintTower,
	"groupingForm_titleLabel": groupingForm_titleLabel,
	"groupingForm_titlePlaceholder": groupingForm_titlePlaceholder,
	"groupingForm_startsLabel": groupingForm_startsLabel,
	"groupingForm_monthOption": groupingForm_monthOption,
	"groupingForm_dayOption": groupingForm_dayOption,
	"groupingForm_hourOption": groupingForm_hourOption,
	"groupingForm_minuteOption": groupingForm_minuteOption,
	"groupingForm_dungeonLabel": groupingForm_dungeonLabel,
	"groupingForm_dungeonNone": groupingForm_dungeonNone,
	"groupingForm_nicknameLabel": groupingForm_nicknameLabel,
	"groupingForm_nicknamePlaceholder": groupingForm_nicknamePlaceholder,
	"groupingForm_sectLabel": groupingForm_sectLabel,
	"groupingForm_submitCreate": groupingForm_submitCreate,
	"groupingForm_submitEdit": groupingForm_submitEdit,
	"groupingForm_submitting": groupingForm_submitting,
	"groupingForm_toastSect": groupingForm_toastSect,
	"groupingForm_toastSaved": groupingForm_toastSaved,
	"groupingForm_toastSaveFailed": groupingForm_toastSaveFailed,
	"groupingForm_toastPosted": groupingForm_toastPosted,
	"groupingForm_toastCreateFailed": groupingForm_toastCreateFailed,
	"groupingForm_titleTemplate": groupingForm_titleTemplate,
	"groupingForm_customFieldsTitle": groupingForm_customFieldsTitle,
	"groupingForm_customFieldAddLabel": groupingForm_customFieldAddLabel,
	"groupingForm_customFieldLabelPlaceholder": groupingForm_customFieldLabelPlaceholder,
	"groupingForm_customFieldTypeText": groupingForm_customFieldTypeText,
	"groupingForm_customFieldTypeChoice": groupingForm_customFieldTypeChoice,
	"groupingForm_customFieldOptionsPlaceholder": groupingForm_customFieldOptionsPlaceholder,
	"groupingForm_customFieldRequiredLabel": groupingForm_customFieldRequiredLabel,
	"groupingForm_customFieldRemoveLabel": groupingForm_customFieldRemoveLabel,
	"groupingForm_customFieldEmptyText": groupingForm_customFieldEmptyText,
	"seat_emptyJoin": seat_emptyJoin,
	"seat_empty": seat_empty,
	"seat_modalTitle": seat_modalTitle,
	"seat_modalSubtitle": seat_modalSubtitle,
	"seat_nameLabel": seat_nameLabel,
	"seat_namePlaceholder": seat_namePlaceholder,
	"seat_nameRequired": seat_nameRequired,
	"seat_selfTab": seat_selfTab,
	"seat_proxyTab": seat_proxyTab,
	"seat_selfNameHint": seat_selfNameHint,
	"seat_proxySearchPlaceholder": seat_proxySearchPlaceholder,
	"seat_proxyPickRequired": seat_proxyPickRequired,
	"seat_proxyEmpty": seat_proxyEmpty,
	"seat_sectLabel": seat_sectLabel,
	"seat_confirmJoin": seat_confirmJoin,
	"seat_joining": seat_joining,
	"seat_toastSect": seat_toastSect,
	"seat_toastJoined": seat_toastJoined,
	"seat_toastJoinFailed": seat_toastJoinFailed,
	"seat_toastLeft": seat_toastLeft,
	"seat_toastLeaveFailed": seat_toastLeaveFailed,
	"seat_leaveConfirmTitle": seat_leaveConfirmTitle,
	"seat_leaveConfirmMessage": seat_leaveConfirmMessage,
	"seat_roleHealer": seat_roleHealer,
	"seat_roleDps": seat_roleDps,
	"seat_leader": seat_leader,
	"seat_readyMark": seat_readyMark,
	"seat_readyAction": seat_readyAction,
	"seat_unreadyAction": seat_unreadyAction,
	"seat_toastReady": seat_toastReady,
	"seat_toastUnready": seat_toastUnready,
	"seat_toastReadyFailed": seat_toastReadyFailed,
	"appBlocks_rosterTitle": appBlocks_rosterTitle,
	"appBlocks_closedStatus": appBlocks_closedStatus,
	"appBlocks_completedStatus": appBlocks_completedStatus,
	"appBlocks_unknownBlock": appBlocks_unknownBlock,
	"dex_backToDex": dex_backToDex,
	"dex_bossesLine": dex_bossesLine,
	"dex_noBossData": dex_noBossData,
	"dex_empty": dex_empty,
	"dex_currentGuides": dex_currentGuides,
	"dex_catSub": dex_catSub,
	"dex_catSubCurrent": dex_catSubCurrent,
	"dex_size10": dex_size10,
	"dex_size5": dex_size5,
	"dex_sizeN": dex_sizeN,
	"dex_bossUnit": dex_bossUnit,
	"dex_partMechanics": dex_partMechanics,
	"dex_partShouts": dex_partShouts,
	"dex_partTalents": dex_partTalents,
	"dex_labelAll": dex_labelAll,
	"dex_labelParts": dex_labelParts,
	"dex_labelPending": dex_labelPending,
	"dex_labelNoBosses": dex_labelNoBosses,
	"dex_sealBoss": dex_sealBoss,
	"boss_back": boss_back,
	"boss_notFound": boss_notFound,
	"boss_tabMechanics": boss_tabMechanics,
	"boss_tabTalents": boss_tabTalents,
	"boss_shoutsTitle": boss_shoutsTitle,
	"boss_copy": boss_copy,
	"boss_shoutCopied": boss_shoutCopied,
	"boss_copyFailed": boss_copyFailed,
	"boss_copyManual": boss_copyManual,
	"boss_noMechanics": boss_noMechanics,
	"boss_noTalents": boss_noTalents,
	"boss_talentTitle": boss_talentTitle,
	"boss_talentPending": boss_talentPending,
	"sect_empty": sect_empty,
	"sect_back": sect_back,
	"sect_tabBis": sect_tabBis,
	"sect_tabRotation": sect_tabRotation,
	"sect_tabRates": sect_tabRates,
	"sect_tabTiaolv": sect_tabTiaolv,
	"sect_tabGrad": sect_tabGrad,
	"sect_noBis": sect_noBis,
	"sect_noRotation": sect_noRotation,
	"sect_noRates": sect_noRates,
	"sect_rotGreydust": sect_rotGreydust,
	"sect_rotOpener": sect_rotOpener,
	"sect_rotLoop": sect_rotLoop,
	"sect_rotKeyPoints": sect_rotKeyPoints,
	"sect_rotInnerSkills": sect_rotInnerSkills,
	"sect_rotVideo": sect_rotVideo,
	"sect_rateAccuracy": sect_rateAccuracy,
	"sect_rateCrit": sect_rateCrit,
	"sect_rateCritDamage": sect_rateCritDamage,
	"sect_bisMainWeapon": sect_bisMainWeapon,
	"sect_bisOffWeapon": sect_bisOffWeapon,
	"sect_bisAccessories": sect_bisAccessories,
	"sect_bisHeadBody": sect_bisHeadBody,
	"sect_bisLegsWrists": sect_bisLegsWrists,
	"sect_tabAffix": sect_tabAffix,
	"sect_affixEmpty": sect_affixEmpty,
	"sect_affixSetLabel": sect_affixSetLabel,
	"sect_affixBowLabel": sect_affixBowLabel,
	"sect_affixDingyinLabel": sect_affixDingyinLabel,
	"sect_affixColAffix": sect_affixColAffix,
	"sect_affixColCount": sect_affixColCount,
	"sect_affixColMax": sect_affixColMax,
	"sect_affixColCy": sect_affixColCy,
	"sect_affixSource": sect_affixSource,
	"tiaolv_intro": tiaolv_intro,
	"tiaolv_innerSkill": tiaolv_innerSkill,
	"tiaolv_innerSkillPlaceholder": tiaolv_innerSkillPlaceholder,
	"tiaolv_wuxue": tiaolv_wuxue,
	"tiaolv_wuku": tiaolv_wuku,
	"tiaolv_wukuSelf": tiaolv_wukuSelf,
	"tiaolv_wukuCommon": tiaolv_wukuCommon,
	"tiaolv_suit": tiaolv_suit,
	"tiaolv_bow": tiaolv_bow,
	"tiaolv_none": tiaolv_none,
	"tiaolv_tuneArea": tiaolv_tuneArea,
	"tiaolv_calc": tiaolv_calc,
	"tiaolv_calculating": tiaolv_calculating,
	"tiaolv_toastFailed": tiaolv_toastFailed,
	"tiaolv_toastFailedWith": tiaolv_toastFailedWith,
	"tiaolv_colAttr": tiaolv_colAttr,
	"tiaolv_colBase": tiaolv_colBase,
	"tiaolv_colPanel": tiaolv_colPanel,
	"tiaolv_colFinal": tiaolv_colFinal,
	"grad_entering": grad_entering,
	"grad_title": grad_title,
	"grad_subtitle": grad_subtitle,
	"grad_mingjinNote": grad_mingjinNote,
	"grad_buildBig": grad_buildBig,
	"grad_buildSmall": grad_buildSmall,
	"grad_ringLabel": grad_ringLabel,
	"grad_scoreCount": grad_scoreCount,
	"grad_scoreValue": grad_scoreValue,
	"grad_scoreRate": grad_scoreRate,
	"grad_tier1": grad_tier1,
	"grad_tier2": grad_tier2,
	"grad_tier3": grad_tier3,
	"grad_tier4": grad_tier4,
	"grad_tier5": grad_tier5,
	"grad_tier6": grad_tier6,
	"grad_tapHint": grad_tapHint,
	"grad_refTitle": grad_refTitle,
	"grad_maxTableTitle": grad_maxTableTitle,
	"grad_colAffix": grad_colAffix,
	"grad_colMax": grad_colMax,
	"grad_colResonance": grad_colResonance,
	"grad_slotTableTitle": grad_slotTableTitle,
	"grad_rateTitle": grad_rateTitle,
	"grad_rateOk": grad_rateOk,
	"grad_rateGap": grad_rateGap,
	"grad_rateOverflow": grad_rateOverflow,
	"grad_compareTitle": grad_compareTitle,
	"grad_saveScheme": grad_saveScheme,
	"grad_schemeName": grad_schemeName,
	"grad_noSchemes": grad_noSchemes,
	"grad_load": grad_load,
	"grad_deleteScheme": grad_deleteScheme,
	"grad_itemScore": grad_itemScore,
	"grad_rowMain": grad_rowMain,
	"grad_rowSub": grad_rowSub,
	"grad_rowResonance": grad_rowResonance,
	"grad_ratePrecision": grad_ratePrecision,
	"grad_rateCrit": grad_rateCrit,
	"grad_rateAffinity": grad_rateAffinity,
	"grad_affixPlaceholder": grad_affixPlaceholder,
	"grad_affixLoading": grad_affixLoading,
	"grad_valuePlaceholderMax": grad_valuePlaceholderMax,
	"grad_valuePlaceholder": grad_valuePlaceholder,
	"grad_resonance": grad_resonance,
	"grad_overMax": grad_overMax,
	"grad_toastSaved": grad_toastSaved,
	"grad_toastLoaded": grad_toastLoaded,
	"grad_toastOldScheme": grad_toastOldScheme,
	"gear_calcLabel": gear_calcLabel,
	"gear_benchTitle": gear_benchTitle,
	"gear_benchIntro": gear_benchIntro,
	"gear_targetLabel": gear_targetLabel,
	"gear_bowLabel": gear_bowLabel,
	"gear_bowNoneLabel": gear_bowNoneLabel,
	"gear_extrasTitle": gear_extrasTitle,
	"gear_resLabel": gear_resLabel,
	"gear_extraAccLabel": gear_extraAccLabel,
	"gear_extraCritLabel": gear_extraCritLabel,
	"gear_extraIntLabel": gear_extraIntLabel,
	"gear_baseTitle": gear_baseTitle,
	"gear_unlockLabel": gear_unlockLabel,
	"gear_lockLabel": gear_lockLabel,
	"gear_modifiedTag": gear_modifiedTag,
	"gear_baseResetLabel": gear_baseResetLabel,
	"gear_baseResetTitle": gear_baseResetTitle,
	"gear_baseResetBody": gear_baseResetBody,
	"gear_xinfaLabelTemplate": gear_xinfaLabelTemplate,
	"gear_xinfaNoneLabel": gear_xinfaNoneLabel,
	"gear_loginHint": gear_loginHint,
	"gear_libTitle": gear_libTitle,
	"gear_myLibTitle": gear_myLibTitle,
	"gear_myBuildsTitle": gear_myBuildsTitle,
	"gear_libCountTemplate": gear_libCountTemplate,
	"gear_usageTemplate": gear_usageTemplate,
	"gear_usageNearLimitText": gear_usageNearLimitText,
	"gear_formSlotLabel": gear_formSlotLabel,
	"gear_formNameLabel": gear_formNameLabel,
	"gear_formNamePlaceholder": gear_formNamePlaceholder,
	"gear_affixPlaceholder": gear_affixPlaceholder,
	"gear_valuePlaceholder": gear_valuePlaceholder,
	"gear_refTemplate": gear_refTemplate,
	"gear_fillMaxLabel": gear_fillMaxLabel,
	"gear_fillCyLabel": gear_fillCyLabel,
	"gear_delRowLabel": gear_delRowLabel,
	"gear_addRowLabel": gear_addRowLabel,
	"gear_dyNameLabel": gear_dyNameLabel,
	"gear_dyNamePlaceholder": gear_dyNamePlaceholder,
	"gear_dyValLabel": gear_dyValLabel,
	"gear_schoolsLabel": gear_schoolsLabel,
	"gear_addGearLabel": gear_addGearLabel,
	"gear_updateGearLabel": gear_updateGearLabel,
	"gear_cancelEditLabel": gear_cancelEditLabel,
	"gear_demoLabel": gear_demoLabel,
	"gear_clearLibLabel": gear_clearLibLabel,
	"gear_clearConfirmTitle": gear_clearConfirmTitle,
	"gear_clearConfirmBody": gear_clearConfirmBody,
	"gear_equipLabel": gear_equipLabel,
	"gear_unequipLabel": gear_unequipLabel,
	"gear_editLabel": gear_editLabel,
	"gear_deleteLabel": gear_deleteLabel,
	"gear_simLabel": gear_simLabel,
	"gear_simRealLabel": gear_simRealLabel,
	"gear_simCyLabel": gear_simCyLabel,
	"gear_simMaxLabel": gear_simMaxLabel,
	"gear_verdictHeirloom": gear_verdictHeirloom,
	"gear_verdictDud": gear_verdictDud,
	"gear_scoreTemplate": gear_scoreTemplate,
	"gear_qualityLabel": gear_qualityLabel,
	"gear_exportLabel": gear_exportLabel,
	"gear_exportFileName": gear_exportFileName,
	"gear_importNameTemplate": gear_importNameTemplate,
	"gear_importLabel": gear_importLabel,
	"gear_importFailedToast": gear_importFailedToast,
	"gear_importedToastTemplate": gear_importedToastTemplate,
	"gear_manualTitle": gear_manualTitle,
	"gear_pasteTitle": gear_pasteTitle,
	"gear_pastePlaceholder": gear_pastePlaceholder,
	"gear_pasteButtonLabel": gear_pasteButtonLabel,
	"gear_pasteDemoLabel": gear_pasteDemoLabel,
	"gear_pasteEmptyText": gear_pasteEmptyText,
	"gear_pasteOkTemplate": gear_pasteOkTemplate,
	"gear_pasteUnknownTemplate": gear_pasteUnknownTemplate,
	"gear_pasteFailText": gear_pasteFailText,
	"gear_pasteFullText": gear_pasteFullText,
	"gear_ocrTitle": gear_ocrTitle,
	"gear_ocrDropText": gear_ocrDropText,
	"gear_ocrPreparingText": gear_ocrPreparingText,
	"gear_ocrRunningText": gear_ocrRunningText,
	"gear_ocrSecondText": gear_ocrSecondText,
	"gear_ocrFailedText": gear_ocrFailedText,
	"gear_ocrBadTypeText": gear_ocrBadTypeText,
	"gear_ocrTooBigText": gear_ocrTooBigText,
	"gear_ocrNoEngineText": gear_ocrNoEngineText,
	"gear_ocrDoneTemplate": gear_ocrDoneTemplate,
	"gear_ocrSlotLabel": gear_ocrSlotLabel,
	"gear_ocrNameLabel": gear_ocrNameLabel,
	"gear_ocrEquipLabel": gear_ocrEquipLabel,
	"gear_ocrConfirmLabel": gear_ocrConfirmLabel,
	"gear_ocrCancelLabel": gear_ocrCancelLabel,
	"gear_ocrUnknownTitle": gear_ocrUnknownTitle,
	"gear_ocrSavedTemplate": gear_ocrSavedTemplate,
	"gear_ocrNeedLineToast": gear_ocrNeedLineToast,
	"gear_ocrLowConfTag": gear_ocrLowConfTag,
	"gear_ocrAddRowLabel": gear_ocrAddRowLabel,
	"gear_ocrImportSlotTemplate": gear_ocrImportSlotTemplate,
	"gear_ocrBatchTitle": gear_ocrBatchTitle,
	"gear_ocrBatchDropText": gear_ocrBatchDropText,
	"gear_ocrBatchQueuedText": gear_ocrBatchQueuedText,
	"gear_ocrBatchRunningText": gear_ocrBatchRunningText,
	"gear_ocrBatchReadyText": gear_ocrBatchReadyText,
	"gear_ocrBatchFailedText": gear_ocrBatchFailedText,
	"gear_ocrBatchImportedText": gear_ocrBatchImportedText,
	"gear_ocrBatchRetryLabel": gear_ocrBatchRetryLabel,
	"gear_ocrBatchRemoveLabel": gear_ocrBatchRemoveLabel,
	"gear_ocrBatchAdjustLabel": gear_ocrBatchAdjustLabel,
	"gear_ocrBatchApplyBoxLabel": gear_ocrBatchApplyBoxLabel,
	"gear_ocrBatchDetectedText": gear_ocrBatchDetectedText,
	"gear_ocrBatchFullImageText": gear_ocrBatchFullImageText,
	"gear_ocrBatchDupTag": gear_ocrBatchDupTag,
	"gear_ocrBatchDupLibText": gear_ocrBatchDupLibText,
	"gear_ocrBatchDupRowText": gear_ocrBatchDupRowText,
	"gear_ocrBatchIncludeLabel": gear_ocrBatchIncludeLabel,
	"gear_ocrBatchNoLinesText": gear_ocrBatchNoLinesText,
	"gear_ocrBatchImportTemplate": gear_ocrBatchImportTemplate,
	"gear_ocrBatchResultTemplate": gear_ocrBatchResultTemplate,
	"gear_libEmptyText": gear_libEmptyText,
	"gear_equippedTag": gear_equippedTag,
	"gear_loadoutTitle": gear_loadoutTitle,
	"gear_autoLabel": gear_autoLabel,
	"gear_autoDoneToast": gear_autoDoneToast,
	"gear_autoFallbackToast": gear_autoFallbackToast,
	"gear_unequipAllLabel": gear_unequipAllLabel,
	"gear_slotEmptyText": gear_slotEmptyText,
	"gear_panelTitle": gear_panelTitle,
	"gear_gradLabel": gear_gradLabel,
	"gear_gradCountLabel": gear_gradCountLabel,
	"gear_gradValueLabel": gear_gradValueLabel,
	"gear_gradDyLabel": gear_gradDyLabel,
	"gear_gradDyToggleLabel": gear_gradDyToggleLabel,
	"gear_loanLabel": gear_loanLabel,
	"gear_simActiveTag": gear_simActiveTag,
	"gear_copySummaryLabel": gear_copySummaryLabel,
	"gear_copiedToast": gear_copiedToast,
	"gear_copyFailedToast": gear_copyFailedToast,
	"gear_yAccLabel": gear_yAccLabel,
	"gear_yCritLabel": gear_yCritLabel,
	"gear_yIntLabel": gear_yIntLabel,
	"gear_finalCritLabel": gear_finalCritLabel,
	"gear_whiteLabel": gear_whiteLabel,
	"gear_dawaiLabel": gear_dawaiLabel,
	"gear_xiaowaiLabel": gear_xiaowaiLabel,
	"gear_dashuLabel": gear_dashuLabel,
	"gear_xiaoshuLabel": gear_xiaoshuLabel,
	"gear_hpLabel": gear_hpLabel,
	"gear_defLabel": gear_defLabel,
	"gear_talentLabel": gear_talentLabel,
	"gear_diffTitle": gear_diffTitle,
	"gear_diffLackTemplate": gear_diffLackTemplate,
	"gear_diffExactText": gear_diffExactText,
	"gear_diffOverTemplate": gear_diffOverTemplate,
	"gear_diffExtraTitle": gear_diffExtraTitle,
	"gear_diffLowTitle": gear_diffLowTitle,
	"gear_diffDoneText": gear_diffDoneText,
	"gear_diffEmptyText": gear_diffEmptyText,
	"gear_diffInvalidTemplate": gear_diffInvalidTemplate,
	"gear_suggestTitle": gear_suggestTitle,
	"gear_suggestSwapTemplate": gear_suggestSwapTemplate,
	"gear_suggestWashTemplate": gear_suggestWashTemplate,
	"gear_suggestNoneText": gear_suggestNoneText,
	"gear_suggestHeadTemplate": gear_suggestHeadTemplate,
	"gear_dySummaryTitle": gear_dySummaryTitle,
	"gear_dyCorrectText": gear_dyCorrectText,
	"gear_dyWrongText": gear_dyWrongText,
	"gear_schemeTitle": gear_schemeTitle,
	"gear_schemeSaveLabel": gear_schemeSaveLabel,
	"gear_schemeNameTemplate": gear_schemeNameTemplate,
	"gear_schemeLoadLabel": gear_schemeLoadLabel,
	"gear_schemeDeleteLabel": gear_schemeDeleteLabel,
	"gear_schemeEmptyText": gear_schemeEmptyText,
	"gear_schemeComposeFirstText": gear_schemeComposeFirstText,
	"gear_schemeSavedToastTemplate": gear_schemeSavedToastTemplate,
	"gear_schemeLoadedToastTemplate": gear_schemeLoadedToastTemplate,
	"gear_schemeGroupCountTemplate": gear_schemeGroupCountTemplate,
	"gear_shareLabel": gear_shareLabel,
	"gear_revokeShareLabel": gear_revokeShareLabel,
	"gear_copyLinkLabel": gear_copyLinkLabel,
	"gear_shareRevokedToast": gear_shareRevokedToast,
	"gear_quickTitle": gear_quickTitle,
	"gear_quickResLabel": gear_quickResLabel,
	"gear_quickSyncLabel": gear_quickSyncLabel,
	"gear_quickSyncedToast": gear_quickSyncedToast,
	"gear_quickOkText": gear_quickOkText,
	"gear_quickOverTemplate": gear_quickOverTemplate,
	"gear_quickGapTemplate": gear_quickGapTemplate,
	"gear_recipesTitle": gear_recipesTitle,
	"gear_recipeSearchPlaceholder": gear_recipeSearchPlaceholder,
	"gear_recipeAllLabel": gear_recipeAllLabel,
	"gear_recipeColCat": gear_recipeColCat,
	"gear_recipeColSchool": gear_recipeColSchool,
	"gear_recipeColSet": gear_recipeColSet,
	"gear_recipeColRecipe": gear_recipeColRecipe,
	"gear_recipeColBow": gear_recipeColBow,
	"gear_recipeSetTargetLabel": gear_recipeSetTargetLabel,
	"gear_recipeEmptyText": gear_recipeEmptyText,
	"gear_recipeTargetToastTemplate": gear_recipeTargetToastTemplate,
	"gear_sectRecipesTitle": gear_sectRecipesTitle,
	"gear_affixTableTitle": gear_affixTableTitle,
	"gear_colCyLabel": gear_colCyLabel,
	"gear_colCyPctLabel": gear_colCyPctLabel,
	"gear_colRecipeNamesLabel": gear_colRecipeNamesLabel,
	"gear_survivalNote": gear_survivalNote,
	"gear_slotTableTitle": gear_slotTableTitle,
	"gear_slotsBigTitle": gear_slotsBigTitle,
	"gear_slotsSmallTitle": gear_slotsSmallTitle,
	"gear_formulaTitle": gear_formulaTitle,
	"gear_formulaRatesTitle": gear_formulaRatesTitle,
	"gear_formulaDimsTitle": gear_formulaDimsTitle,
	"gear_formulaOrderTitle": gear_formulaOrderTitle,
	"gear_formulaAccTemplate": gear_formulaAccTemplate,
	"gear_formulaCritTemplate": gear_formulaCritTemplate,
	"gear_formulaIntTemplate": gear_formulaIntTemplate,
	"gear_formulaBarsTemplate": gear_formulaBarsTemplate,
	"gear_formulaBowTemplate": gear_formulaBowTemplate,
	"gear_formulaOrderText": gear_formulaOrderText,
	"gear_colDimLabel": gear_colDimLabel,
	"gear_colConvLabel": gear_colConvLabel,
	"gear_colFullBarTemplate": gear_colFullBarTemplate,
	"gear_calcFailedText": gear_calcFailedText,
	"gear_demoLoadedToast": gear_demoLoadedToast,
	"gear_savedToastTemplate": gear_savedToastTemplate,
	"gear_deletedToast": gear_deletedToast,
	"gear_clearedToast": gear_clearedToast,
	"legal_termsTitle": legal_termsTitle,
	"legal_privacyTitle": legal_privacyTitle,
	"legal_termsLink": legal_termsLink,
	"legal_privacyLink": legal_privacyLink,
	"legal_updatedText": legal_updatedText,
	"legal_disclaimer": legal_disclaimer,
	"termsBody_s1h": termsBody_s1h,
	"termsBody_s1b": termsBody_s1b,
	"termsBody_s2h": termsBody_s2h,
	"termsBody_s2b": termsBody_s2b,
	"termsBody_s3h": termsBody_s3h,
	"termsBody_s3b": termsBody_s3b,
	"termsBody_s4h": termsBody_s4h,
	"termsBody_s4b": termsBody_s4b,
	"termsBody_s5h": termsBody_s5h,
	"termsBody_s5b": termsBody_s5b,
	"termsBody_s6h": termsBody_s6h,
	"termsBody_s6b": termsBody_s6b,
	"privacyBody_s1h": privacyBody_s1h,
	"privacyBody_s1b": privacyBody_s1b,
	"privacyBody_s2h": privacyBody_s2h,
	"privacyBody_s2b": privacyBody_s2b,
	"privacyBody_s3h": privacyBody_s3h,
	"privacyBody_s3b": privacyBody_s3b,
	"privacyBody_s4h": privacyBody_s4h,
	"privacyBody_s4b": privacyBody_s4b,
	"privacyBody_s5h": privacyBody_s5h,
	"privacyBody_s5b": privacyBody_s5b,
	"privacyBody_s6h": privacyBody_s6h,
	"privacyBody_s6b": privacyBody_s6b,
	"errors_rateLimited": errors_rateLimited,
	"errors_createRateLimited": errors_createRateLimited,
	"errors_guildNotFound": errors_guildNotFound,
	"errors_gearNotFound": errors_gearNotFound,
	"errors_gearEmptyBuild": errors_gearEmptyBuild,
	"errors_gearCapacityReached": errors_gearCapacityReached,
	"errors_gearImportOverflow": errors_gearImportOverflow,
	"errors_gearOcrBatchTooLarge": errors_gearOcrBatchTooLarge,
	"errors_gearOcrDailyLimit": errors_gearOcrDailyLimit,
	"errors_loginRequired": errors_loginRequired,
	"errors_loginRequiredShort": errors_loginRequiredShort,
	"errors_localeUnsupported": errors_localeUnsupported,
	"errors_pushTokenInvalid": errors_pushTokenInvalid,
	"errors_guildUnboundWrite": errors_guildUnboundWrite,
	"errors_memberOnly": errors_memberOnly,
	"errors_memberOnlyView": errors_memberOnlyView,
	"errors_titleRequired": errors_titleRequired,
	"errors_badStartTime": errors_badStartTime,
	"errors_startTimeTooFar": errors_startTimeTooFar,
	"errors_groupingNotFound": errors_groupingNotFound,
	"errors_officialEvent": errors_officialEvent,
	"errors_noCreatorRecorded": errors_noCreatorRecorded,
	"errors_leaderOnlyDisband": errors_leaderOnlyDisband,
	"errors_noCreatorRecordedEdit": errors_noCreatorRecordedEdit,
	"errors_leaderOnlyEdit": errors_leaderOnlyEdit,
	"errors_noCreatorRecordedComplete": errors_noCreatorRecordedComplete,
	"errors_leaderOnlyComplete": errors_leaderOnlyComplete,
	"errors_noCreatorRecordedReopen": errors_noCreatorRecordedReopen,
	"errors_leaderOnlyReopen": errors_leaderOnlyReopen,
	"errors_groupingAlreadyCompleted": errors_groupingAlreadyCompleted,
	"errors_groupingNotCompleted": errors_groupingNotCompleted,
	"errors_groupingClosed": errors_groupingClosed,
	"errors_nicknameRequired": errors_nicknameRequired,
	"errors_proxyTargetNotInRoster": errors_proxyTargetNotInRoster,
	"errors_groupingFull": errors_groupingFull,
	"errors_lastSeatHealer": errors_lastSeatHealer,
	"errors_alreadyJoined": errors_alreadyJoined,
	"errors_seatNotFound": errors_seatNotFound,
	"errors_notSeated": errors_notSeated,
	"errors_reminderOffsetsInvalid": errors_reminderOffsetsInvalid,
	"errors_ogAccentInvalid": errors_ogAccentInvalid,
	"errors_paramsIncomplete": errors_paramsIncomplete,
	"errors_bossNotFound": errors_bossNotFound,
	"errors_guildNameShort": errors_guildNameShort,
	"errors_avatarTooLarge": errors_avatarTooLarge,
	"errors_avatarBadType": errors_avatarBadType,
	"errors_avatarEmpty": errors_avatarEmpty,
	"errors_slugInvalid": errors_slugInvalid,
	"errors_slugReserved": errors_slugReserved,
	"errors_slugTaken": errors_slugTaken,
	"errors_serverRequired": errors_serverRequired,
	"errors_notInServer": errors_notInServer,
	"errors_cannotManageServer": errors_cannotManageServer,
	"errors_adminOnly": errors_adminOnly,
	"errors_webhookInvalid": errors_webhookInvalid,
	"errors_discordIdInvalid": errors_discordIdInvalid,
	"errors_noFieldsToUpdate": errors_noFieldsToUpdate,
	"errors_signupNotFound": errors_signupNotFound,
	"errors_resultNotFound": errors_resultNotFound,
	"errors_resultTeamRequired": errors_resultTeamRequired,
	"errors_resultTimeInvalid": errors_resultTimeInvalid,
	"errors_avatarDataInvalid": errors_avatarDataInvalid,
	"errors_schoolRequired": errors_schoolRequired,
	"errors_generic": errors_generic,
	"errors_templateNotFound": errors_templateNotFound,
	"errors_templateNameRequired": errors_templateNameRequired,
	"errors_templateForbidden": errors_templateForbidden,
	"errors_templateBadStart": errors_templateBadStart,
	"errors_accountReauthRequired": errors_accountReauthRequired,
	"errors_accountExportRateLimited": errors_accountExportRateLimited,
	"errors_accountUsernameMismatch": errors_accountUsernameMismatch,
	"errors_accountDeletionPending": errors_accountDeletionPending,
	"errors_accountDeletionNotPending": errors_accountDeletionNotPending,
	"errors_premiumRequired": errors_premiumRequired,
	"errors_premiumComingSoon": errors_premiumComingSoon,
	"errors_premiumActive": errors_premiumActive,
	"errors_paygateDisabled": errors_paygateDisabled,
	"errors_checkoutFailed": errors_checkoutFailed,
	"errors_rosterImportEmpty": errors_rosterImportEmpty,
	"errors_rosterBatchNotFound": errors_rosterBatchNotFound,
	"errors_rosterBatchConfirmed": errors_rosterBatchConfirmed,
	"errors_rosterNoImportableRows": errors_rosterNoImportableRows,
	"errors_rosterEntryNotFound": errors_rosterEntryNotFound,
	"errors_checklistItemUnknown": errors_checklistItemUnknown,
	"errors_feedbackEmpty": errors_feedbackEmpty,
	"errors_feedbackTooLong": errors_feedbackTooLong,
	"errors_feedbackRateLimited": errors_feedbackRateLimited,
	"errors_announcementTitleRequired": errors_announcementTitleRequired,
	"errors_announcementTitleTooLong": errors_announcementTitleTooLong,
	"errors_announcementBodyTooLong": errors_announcementBodyTooLong,
	"errors_announcementNotFound": errors_announcementNotFound,
	"errors_announcementDailyLimit": errors_announcementDailyLimit,
	"errors_urgentCallDailyLimit": errors_urgentCallDailyLimit,
	"errors_lotteryTitleRequired": errors_lotteryTitleRequired,
	"errors_lotteryEntriesEmpty": errors_lotteryEntriesEmpty,
	"errors_lotteryNotFound": errors_lotteryNotFound,
	"errors_lotteryAlreadyDrawn": errors_lotteryAlreadyDrawn,
	"errors_lotteryWinnerCountInvalid": errors_lotteryWinnerCountInvalid,
	"errors_lotteryWeightInvalid": errors_lotteryWeightInvalid,
	"errors_lotteryMemberNotInGuild": errors_lotteryMemberNotInGuild,
	"errors_availabilitySlotInvalid": errors_availabilitySlotInvalid,
	"errors_availabilityTooManySlots": errors_availabilityTooManySlots,
	"errors_pollTitleRequired": errors_pollTitleRequired,
	"errors_pollOptionsInvalid": errors_pollOptionsInvalid,
	"errors_pollNotFound": errors_pollNotFound,
	"errors_pollClosed": errors_pollClosed,
	"errors_pollOptionInvalid": errors_pollOptionInvalid,
	"errors_pollForbidden": errors_pollForbidden,
	"errors_customFieldInvalid": errors_customFieldInvalid,
	"errors_customFieldTooMany": errors_customFieldTooMany,
	"errors_signupAnswerRequired": errors_signupAnswerRequired,
	"errors_signupAnswerInvalid": errors_signupAnswerInvalid,
	"errors_applicationPending": errors_applicationPending,
	"errors_alreadyMember": errors_alreadyMember,
	"errors_recruitUnavailable": errors_recruitUnavailable,
	"errors_applicationNotFound": errors_applicationNotFound,
	"errors_applicationNotPending": errors_applicationNotPending,
	"errors_mentorNotDesignated": errors_mentorNotDesignated,
	"errors_mentorNotInGuild": errors_mentorNotInGuild,
	"errors_menteeNotInGuild": errors_menteeNotInGuild,
	"errors_menteeAlreadyPaired": errors_menteeAlreadyPaired,
	"errors_mentorSelfPairing": errors_mentorSelfPairing,
	"errors_pairingNotFound": errors_pairingNotFound,
	"errors_pairingAlreadyEnded": errors_pairingAlreadyEnded,
	"errors_officerNoteBodyRequired": errors_officerNoteBodyRequired,
	"errors_officerNoteBodyTooLong": errors_officerNoteBodyTooLong,
	"errors_officerNoteNotFound": errors_officerNoteNotFound,
	"errors_officerMemberNotFound": errors_officerMemberNotFound,
	"errors_seasonGoalTitleRequired": errors_seasonGoalTitleRequired,
	"errors_seasonGoalTitleTooLong": errors_seasonGoalTitleTooLong,
	"errors_seasonGoalNoteTooLong": errors_seasonGoalNoteTooLong,
	"errors_seasonGoalNotFound": errors_seasonGoalNotFound,
	"errors_seasonGoalDungeonNotFound": errors_seasonGoalDungeonNotFound,
	"guildAdmin_title": guildAdmin_title,
	"guildAdmin_lockedTitle": guildAdmin_lockedTitle,
	"guildAdmin_lockedBody": guildAdmin_lockedBody,
	"guildAdmin_backLink": guildAdmin_backLink,
	"guildAdmin_tabProfile": guildAdmin_tabProfile,
	"guildAdmin_tabDiscord": guildAdmin_tabDiscord,
	"guildAdmin_tabEvents": guildAdmin_tabEvents,
	"guildAdmin_tabGuides": guildAdmin_tabGuides,
	"guildAdmin_saveButton": guildAdmin_saveButton,
	"guildAdmin_savedText": guildAdmin_savedText,
	"guildAdmin_deleteButton": guildAdmin_deleteButton,
	"guildAdmin_editButton": guildAdmin_editButton,
	"guildAdmin_addButton": guildAdmin_addButton,
	"guildAdmin_profileTitle": guildAdmin_profileTitle,
	"guildAdmin_nameLabel": guildAdmin_nameLabel,
	"guildAdmin_announcementLabel": guildAdmin_announcementLabel,
	"guildAdmin_sloganLabel": guildAdmin_sloganLabel,
	"guildAdmin_masterNameLabel": guildAdmin_masterNameLabel,
	"guildAdmin_logoUrlLabel": guildAdmin_logoUrlLabel,
	"guildAdmin_bgImageUrlLabel": guildAdmin_bgImageUrlLabel,
	"guildAdmin_avatarTitle": guildAdmin_avatarTitle,
	"guildAdmin_avatarUpload": guildAdmin_avatarUpload,
	"guildAdmin_avatarReplace": guildAdmin_avatarReplace,
	"guildAdmin_avatarDelete": guildAdmin_avatarDelete,
	"guildAdmin_avatarNone": guildAdmin_avatarNone,
	"guildAdmin_avatarHint": guildAdmin_avatarHint,
	"guildAdmin_discordTitle": guildAdmin_discordTitle,
	"guildAdmin_webhookLabel": guildAdmin_webhookLabel,
	"guildAdmin_webhookSet": guildAdmin_webhookSet,
	"guildAdmin_webhookUnset": guildAdmin_webhookUnset,
	"guildAdmin_webhookHint": guildAdmin_webhookHint,
	"guildAdmin_webhookClear": guildAdmin_webhookClear,
	"guildAdmin_guildIdLabel": guildAdmin_guildIdLabel,
	"guildAdmin_guildIdUnbound": guildAdmin_guildIdUnbound,
	"guildAdmin_reminderTitle": guildAdmin_reminderTitle,
	"guildAdmin_reminderOffsetsLabel": guildAdmin_reminderOffsetsLabel,
	"guildAdmin_reminderOffsetOption": guildAdmin_reminderOffsetOption,
	"guildAdmin_reminderCustomTextLabel": guildAdmin_reminderCustomTextLabel,
	"guildAdmin_reminderCustomTextHint": guildAdmin_reminderCustomTextHint,
	"guildAdmin_visibilityTitle": guildAdmin_visibilityTitle,
	"guildAdmin_devOnlyLabel": guildAdmin_devOnlyLabel,
	"guildAdmin_eventsTitle": guildAdmin_eventsTitle,
	"guildAdmin_signupCsvSuffix": guildAdmin_signupCsvSuffix,
	"guildAdmin_eventEmpty": guildAdmin_eventEmpty,
	"guildAdmin_eventTitleLabel": guildAdmin_eventTitleLabel,
	"guildAdmin_eventTypeLabel": guildAdmin_eventTypeLabel,
	"guildAdmin_eventStatusLabel": guildAdmin_eventStatusLabel,
	"guildAdmin_eventTimeLabel": guildAdmin_eventTimeLabel,
	"guildAdmin_eventSlotsLabel": guildAdmin_eventSlotsLabel,
	"guildAdmin_eventMeetLabel": guildAdmin_eventMeetLabel,
	"guildAdmin_eventDescLabel": guildAdmin_eventDescLabel,
	"guildAdmin_eventDungeonLabel": guildAdmin_eventDungeonLabel,
	"guildAdmin_statusOpen": guildAdmin_statusOpen,
	"guildAdmin_statusClosed": guildAdmin_statusClosed,
	"guildAdmin_statusCompleted": guildAdmin_statusCompleted,
	"guildAdmin_statusDraft": guildAdmin_statusDraft,
	"guildAdmin_signupsTitle": guildAdmin_signupsTitle,
	"guildAdmin_signupEmpty": guildAdmin_signupEmpty,
	"guildAdmin_exportCsvButton": guildAdmin_exportCsvButton,
	"guildAdmin_removeSignupButton": guildAdmin_removeSignupButton,
	"guildAdmin_resultsTitle": guildAdmin_resultsTitle,
	"guildAdmin_resultTeamLabel": guildAdmin_resultTeamLabel,
	"guildAdmin_resultMembersLabel": guildAdmin_resultMembersLabel,
	"guildAdmin_resultTimeLabel": guildAdmin_resultTimeLabel,
	"guildAdmin_resultProofLabel": guildAdmin_resultProofLabel,
	"guildAdmin_resultNoteLabel": guildAdmin_resultNoteLabel,
	"guildAdmin_guidesTitle": guildAdmin_guidesTitle,
	"guildAdmin_guidesHint": guildAdmin_guidesHint,
	"guildAdmin_guideSchoolLabel": guildAdmin_guideSchoolLabel,
	"guildAdmin_guideBuildLabel": guildAdmin_guideBuildLabel,
	"guildAdmin_guideAttrLabel": guildAdmin_guideAttrLabel,
	"guildAdmin_guideRateLabel": guildAdmin_guideRateLabel,
	"guildAdmin_guideBisLabel": guildAdmin_guideBisLabel,
	"guildAdmin_guideRotationLabel": guildAdmin_guideRotationLabel,
	"guildAdmin_tabStats": guildAdmin_tabStats,
	"guildAdmin_tabSeason": guildAdmin_tabSeason,
	"guildAdmin_seasonTitle": guildAdmin_seasonTitle,
	"guildAdmin_seasonHint": guildAdmin_seasonHint,
	"guildAdmin_seasonProgress": guildAdmin_seasonProgress,
	"guildAdmin_seasonItemDungeonsTitle": guildAdmin_seasonItemDungeonsTitle,
	"guildAdmin_seasonItemDungeonsDetail": guildAdmin_seasonItemDungeonsDetail,
	"guildAdmin_seasonItemTemplatesTitle": guildAdmin_seasonItemTemplatesTitle,
	"guildAdmin_seasonItemTemplatesDetail": guildAdmin_seasonItemTemplatesDetail,
	"guildAdmin_seasonItemGuidesTitle": guildAdmin_seasonItemGuidesTitle,
	"guildAdmin_seasonItemGuidesDetail": guildAdmin_seasonItemGuidesDetail,
	"guildAdmin_seasonItemRosterTitle": guildAdmin_seasonItemRosterTitle,
	"guildAdmin_seasonItemRosterDetail": guildAdmin_seasonItemRosterDetail,
	"guildAdmin_rosterTitle": guildAdmin_rosterTitle,
	"guildAdmin_rosterHint": guildAdmin_rosterHint,
	"guildAdmin_rosterUpload": guildAdmin_rosterUpload,
	"guildAdmin_rosterOcrRunning": guildAdmin_rosterOcrRunning,
	"guildAdmin_rosterPreviewTitle": guildAdmin_rosterPreviewTitle,
	"guildAdmin_rosterConfirm": guildAdmin_rosterConfirm,
	"guildAdmin_rosterEmpty": guildAdmin_rosterEmpty,
	"guildAdmin_rosterSourceOcr": guildAdmin_rosterSourceOcr,
	"guildAdmin_rosterMatchedMember": guildAdmin_rosterMatchedMember,
	"guildAdmin_rosterStatusMatched": guildAdmin_rosterStatusMatched,
	"guildAdmin_rosterStatusNew": guildAdmin_rosterStatusNew,
	"guildAdmin_rosterStatusUnrecognized": guildAdmin_rosterStatusUnrecognized,
	"guildAdmin_rosterImported": guildAdmin_rosterImported,
	"guildAdmin_statsTitle": guildAdmin_statsTitle,
	"guildAdmin_statsCurrentWeek": guildAdmin_statsCurrentWeek,
	"guildAdmin_statsCars": guildAdmin_statsCars,
	"guildAdmin_statsCompleted": guildAdmin_statsCompleted,
	"guildAdmin_statsSeats": guildAdmin_statsSeats,
	"guildAdmin_statsFillRate": guildAdmin_statsFillRate,
	"guildAdmin_statsParticipants": guildAdmin_statsParticipants,
	"guildAdmin_statsPerCapita": guildAdmin_statsPerCapita,
	"guildAdmin_statsMembersTitle": guildAdmin_statsMembersTitle,
	"guildAdmin_statsLeadersTitle": guildAdmin_statsLeadersTitle,
	"guildAdmin_statsSeatCount": guildAdmin_statsSeatCount,
	"guildAdmin_statsCarCount": guildAdmin_statsCarCount,
	"guildAdmin_statsEmpty": guildAdmin_statsEmpty,
	"guildAdmin_statsBoardEmpty": guildAdmin_statsBoardEmpty,
	"guildAdmin_whiteLabelTitle": guildAdmin_whiteLabelTitle,
	"guildAdmin_hideBrandingLabel": guildAdmin_hideBrandingLabel,
	"guildAdmin_hideBrandingHint": guildAdmin_hideBrandingHint,
	"guildAdmin_ogAccentLabel": guildAdmin_ogAccentLabel,
	"guildAdmin_ogTitleSuffixLabel": guildAdmin_ogTitleSuffixLabel,
	"guildAdmin_ogTitleSuffixHint": guildAdmin_ogTitleSuffixHint,
	"guildAdmin_ogAccentGold": guildAdmin_ogAccentGold,
	"guildAdmin_ogAccentJade": guildAdmin_ogAccentJade,
	"guildAdmin_ogAccentAzure": guildAdmin_ogAccentAzure,
	"guildAdmin_ogAccentCinnabar": guildAdmin_ogAccentCinnabar,
	"guildAdmin_ogAccentViolet": guildAdmin_ogAccentViolet,
	"guildAdmin_premiumLockedTitle": guildAdmin_premiumLockedTitle,
	"guildAdmin_premiumLockedBody": guildAdmin_premiumLockedBody,
	"guildAdmin_premiumCheckoutButton": guildAdmin_premiumCheckoutButton,
	"guildAdmin_premiumComingSoon": guildAdmin_premiumComingSoon,
	"guildAdmin_premiumActiveTitle": guildAdmin_premiumActiveTitle,
	"guildAdmin_premiumPlanName": guildAdmin_premiumPlanName,
	"guildAdmin_premiumSourceStripe": guildAdmin_premiumSourceStripe,
	"guildAdmin_premiumSourceManual": guildAdmin_premiumSourceManual,
	"guildAdmin_premiumPeriodEnd": guildAdmin_premiumPeriodEnd,
	"guildAdmin_premiumPriceMonth": guildAdmin_premiumPriceMonth,
	"guildAdmin_premiumPriceYear": guildAdmin_premiumPriceYear,
	"guildAdmin_billingSuccess": guildAdmin_billingSuccess,
	"guildAdmin_billingCanceled": guildAdmin_billingCanceled,
	"guildAdmin_tabAnnouncements": guildAdmin_tabAnnouncements,
	"guildAdmin_tabTools": guildAdmin_tabTools,
	"guildAdmin_lotteryTitle": guildAdmin_lotteryTitle,
	"guildAdmin_lotteryHint": guildAdmin_lotteryHint,
	"guildAdmin_lotteryEmpty": guildAdmin_lotteryEmpty,
	"guildAdmin_lotteryNameLabel": guildAdmin_lotteryNameLabel,
	"guildAdmin_lotteryPrizeLabel": guildAdmin_lotteryPrizeLabel,
	"guildAdmin_lotterySourceLabel": guildAdmin_lotterySourceLabel,
	"guildAdmin_lotterySourceGrouping": guildAdmin_lotterySourceGrouping,
	"guildAdmin_lotterySourceMembers": guildAdmin_lotterySourceMembers,
	"guildAdmin_lotteryGroupingLabel": guildAdmin_lotteryGroupingLabel,
	"guildAdmin_lotteryWinnerCountLabel": guildAdmin_lotteryWinnerCountLabel,
	"guildAdmin_lotteryUniformWeightLabel": guildAdmin_lotteryUniformWeightLabel,
	"guildAdmin_lotteryWeightLabel": guildAdmin_lotteryWeightLabel,
	"guildAdmin_lotteryEntriesLabel": guildAdmin_lotteryEntriesLabel,
	"guildAdmin_lotteryWinnersLabel": guildAdmin_lotteryWinnersLabel,
	"guildAdmin_lotteryCreateButton": guildAdmin_lotteryCreateButton,
	"guildAdmin_lotteryDrawButton": guildAdmin_lotteryDrawButton,
	"guildAdmin_lotteryStatusOpen": guildAdmin_lotteryStatusOpen,
	"guildAdmin_lotteryStatusDrawn": guildAdmin_lotteryStatusDrawn,
	"guildAdmin_lotteryEntryCount": guildAdmin_lotteryEntryCount,
	"guildAdmin_tabRecruit": guildAdmin_tabRecruit,
	"guildAdmin_tabOfficer": guildAdmin_tabOfficer,
	"groupingTemplate_sectionTitle": groupingTemplate_sectionTitle,
	"groupingTemplate_nameLabel": groupingTemplate_nameLabel,
	"groupingTemplate_namePlaceholder": groupingTemplate_namePlaceholder,
	"groupingTemplate_saveFromForm": groupingTemplate_saveFromForm,
	"groupingTemplate_updateSubmit": groupingTemplate_updateSubmit,
	"groupingTemplate_editingNotice": groupingTemplate_editingNotice,
	"groupingTemplate_cancelEdit": groupingTemplate_cancelEdit,
	"groupingTemplate_empty": groupingTemplate_empty,
	"groupingTemplate_whenToday": groupingTemplate_whenToday,
	"groupingTemplate_whenTomorrow": groupingTemplate_whenTomorrow,
	"groupingTemplate_whenDays": groupingTemplate_whenDays,
	"groupingTemplate_toastSaved": groupingTemplate_toastSaved,
	"groupingTemplate_toastSaveFailed": groupingTemplate_toastSaveFailed,
	"groupingTemplate_toastDeleted": groupingTemplate_toastDeleted,
	"groupingTemplate_toastDeleteFailed": groupingTemplate_toastDeleteFailed,
	"groupingTemplate_edit": groupingTemplate_edit,
	"groupingTemplate_delete": groupingTemplate_delete,
	"groupingTemplate_deleteConfirmTitle": groupingTemplate_deleteConfirmTitle,
	"groupingTemplate_deleteConfirmMessage": groupingTemplate_deleteConfirmMessage,
	"groupingTemplate_saveButton": groupingTemplate_saveButton,
	"groupingTemplate_saveDialogTitle": groupingTemplate_saveDialogTitle,
	"groupingTemplate_saveSubmit": groupingTemplate_saveSubmit,
	"groupingTemplate_toastSavedFromCar": groupingTemplate_toastSavedFromCar,
	"groupingTemplate_metaTemplate": groupingTemplate_metaTemplate,
	"account_sectionTitle": account_sectionTitle,
	"account_exportLabel": account_exportLabel,
	"account_exportHint": account_exportHint,
	"account_deleteLabel": account_deleteLabel,
	"account_deleteHint": account_deleteHint,
	"account_reauthLabel": account_reauthLabel,
	"account_reauthHint": account_reauthHint,
	"account_confirmTitle": account_confirmTitle,
	"account_confirmIntro": account_confirmIntro,
	"account_consequenceCars": account_consequenceCars,
	"account_consequenceData": account_consequenceData,
	"account_consequenceGuilds": account_consequenceGuilds,
	"account_consequenceResidual": account_consequenceResidual,
	"account_consequenceReregister": account_consequenceReregister,
	"account_exportFirstHint": account_exportFirstHint,
	"account_usernameLabel": account_usernameLabel,
	"account_submitLabel": account_submitLabel,
	"account_backLabel": account_backLabel,
	"account_pendingTitle": account_pendingTitle,
	"account_pendingBody": account_pendingBody,
	"account_cancelDeletionLabel": account_cancelDeletionLabel,
	"account_deletionRequestedText": account_deletionRequestedText,
	"account_deletionCancelledText": account_deletionCancelledText,
	"account_exportAbout": account_exportAbout,
	"account_deletedUser": account_deletedUser,
	"buildshare_kicker": buildshare_kicker,
	"buildshare_loginLabel": buildshare_loginLabel,
	"buildshare_notFoundTitle": buildshare_notFoundTitle,
	"buildshare_notFoundBody": buildshare_notFoundBody,
	"buildshare_xinfaLabel": buildshare_xinfaLabel,
	"landing_featuresTitle": landing_featuresTitle,
	"landing_groupingTitle": landing_groupingTitle,
	"landing_groupingBody": landing_groupingBody,
	"landing_reminderTitle": landing_reminderTitle,
	"landing_reminderBody": landing_reminderBody,
	"landing_dexTitle": landing_dexTitle,
	"landing_dexBody": landing_dexBody,
	"landing_gearTitle": landing_gearTitle,
	"landing_gearBody": landing_gearBody,
	"feedback_entryLabel": feedback_entryLabel,
	"feedback_title": feedback_title,
	"feedback_categoryLabel": feedback_categoryLabel,
	"feedback_catProblem": feedback_catProblem,
	"feedback_catSuggestion": feedback_catSuggestion,
	"feedback_catOther": feedback_catOther,
	"feedback_placeholder": feedback_placeholder,
	"feedback_submit": feedback_submit,
	"feedback_submitting": feedback_submitting,
	"feedback_success": feedback_success,
	"announcements_title": announcements_title,
	"announcements_emptyText": announcements_emptyText,
	"announcements_urgentLabel": announcements_urgentLabel,
	"announcements_standardLabel": announcements_standardLabel,
	"announcements_unreadLabel": announcements_unreadLabel,
	"announcements_readLabel": announcements_readLabel,
	"announcements_composeTitle": announcements_composeTitle,
	"announcements_kindLabel": announcements_kindLabel,
	"announcements_kindStandardLabel": announcements_kindStandardLabel,
	"announcements_kindUrgentLabel": announcements_kindUrgentLabel,
	"announcements_titleLabel": announcements_titleLabel,
	"announcements_titlePlaceholder": announcements_titlePlaceholder,
	"announcements_bodyLabel": announcements_bodyLabel,
	"announcements_bodyPlaceholder": announcements_bodyPlaceholder,
	"announcements_postLabel": announcements_postLabel,
	"announcements_postingLabel": announcements_postingLabel,
	"announcements_postedText": announcements_postedText,
	"announcements_deleteLabel": announcements_deleteLabel,
	"announcements_deleteConfirmTitle": announcements_deleteConfirmTitle,
	"announcements_deleteConfirmMessage": announcements_deleteConfirmMessage,
	"announcements_deletedText": announcements_deletedText,
	"announcements_receiptsTitle": announcements_receiptsTitle,
	"announcements_readCountTemplate": announcements_readCountTemplate,
	"announcements_readListLabel": announcements_readListLabel,
	"announcements_unreadListLabel": announcements_unreadListLabel,
	"announcements_authorTemplate": announcements_authorTemplate,
	"announcements_pushNote": announcements_pushNote,
	"announcements_urgentNote": announcements_urgentNote,
	"announcements_dailyLimitTemplate": announcements_dailyLimitTemplate,
	"schedule_title": schedule_title,
	"schedule_myTitle": schedule_myTitle,
	"schedule_myHint": schedule_myHint,
	"schedule_slotRange": schedule_slotRange,
	"schedule_addSlotLabel": schedule_addSlotLabel,
	"schedule_removeLabel": schedule_removeLabel,
	"schedule_saveLabel": schedule_saveLabel,
	"schedule_savedText": schedule_savedText,
	"schedule_saveFailedTemplate": schedule_saveFailedTemplate,
	"schedule_emptyMineText": schedule_emptyMineText,
	"schedule_summaryTitle": schedule_summaryTitle,
	"schedule_summaryHint": schedule_summaryHint,
	"schedule_summaryEmptyText": schedule_summaryEmptyText,
	"schedule_pollsTitle": schedule_pollsTitle,
	"schedule_pollsHint": schedule_pollsHint,
	"schedule_pollEmptyText": schedule_pollEmptyText,
	"schedule_pollCreateLabel": schedule_pollCreateLabel,
	"schedule_pollTitleLabel": schedule_pollTitleLabel,
	"schedule_pollTitlePlaceholder": schedule_pollTitlePlaceholder,
	"schedule_pollCandidatesLabel": schedule_pollCandidatesLabel,
	"schedule_pollAddCandidateLabel": schedule_pollAddCandidateLabel,
	"schedule_pollSubmitLabel": schedule_pollSubmitLabel,
	"schedule_pollVoteLabel": schedule_pollVoteLabel,
	"schedule_pollVotedText": schedule_pollVotedText,
	"schedule_pollStatusOpenText": schedule_pollStatusOpenText,
	"schedule_pollStatusClosedText": schedule_pollStatusClosedText,
	"schedule_pollCloseLabel": schedule_pollCloseLabel,
	"schedule_pollVoteCountTemplate": schedule_pollVoteCountTemplate,
	"schedule_pollLaunchLabel": schedule_pollLaunchLabel,
	"schedule_pollCancelLabel": schedule_pollCancelLabel,
	"schedule_toastPollCreated": schedule_toastPollCreated,
	"schedule_toastVoted": schedule_toastVoted,
	"schedule_toastClosed": schedule_toastClosed,
	"schedule_toastFailedTemplate": schedule_toastFailedTemplate,
	"schedule_settingsLinkLabel": schedule_settingsLinkLabel,
	"schedule_noGuildsText": schedule_noGuildsText,
	"recruit_title": recruit_title,
	"recruit_homeBody": recruit_homeBody,
	"recruit_homeLoginHint": recruit_homeLoginHint,
	"recruit_applySectionTitle": recruit_applySectionTitle,
	"recruit_messageLabel": recruit_messageLabel,
	"recruit_messagePlaceholder": recruit_messagePlaceholder,
	"recruit_submitButton": recruit_submitButton,
	"recruit_submittingButton": recruit_submittingButton,
	"recruit_myApplicationTitle": recruit_myApplicationTitle,
	"recruit_statusPending": recruit_statusPending,
	"recruit_statusApproved": recruit_statusApproved,
	"recruit_statusRejected": recruit_statusRejected,
	"recruit_pendingHint": recruit_pendingHint,
	"recruit_approvedNextStep": recruit_approvedNextStep,
	"recruit_rejectedHint": recruit_rejectedHint,
	"recruit_checklistTitle": recruit_checklistTitle,
	"recruit_checklistProgress": recruit_checklistProgress,
	"recruit_itemProfileLabel": recruit_itemProfileLabel,
	"recruit_itemProfileHint": recruit_itemProfileHint,
	"recruit_itemMentorLabel": recruit_itemMentorLabel,
	"recruit_itemMentorHint": recruit_itemMentorHint,
	"recruit_itemFirstRunLabel": recruit_itemFirstRunLabel,
	"recruit_itemFirstRunHint": recruit_itemFirstRunHint,
	"recruit_myPairingsTitle": recruit_myPairingsTitle,
	"recruit_itemAvailabilityLabel": recruit_itemAvailabilityLabel,
	"recruit_itemAvailabilityHint": recruit_itemAvailabilityHint,
	"recruit_pairingStatusActive": recruit_pairingStatusActive,
	"recruit_pairingStatusEnded": recruit_pairingStatusEnded,
	"recruit_mentorRoleLabel": recruit_mentorRoleLabel,
	"recruit_menteeRoleLabel": recruit_menteeRoleLabel,
	"recruit_adminApplicationsTitle": recruit_adminApplicationsTitle,
	"recruit_adminApplicationsEmpty": recruit_adminApplicationsEmpty,
	"recruit_adminApproveButton": recruit_adminApproveButton,
	"recruit_adminRejectButton": recruit_adminRejectButton,
	"recruit_adminMentorPoolTitle": recruit_adminMentorPoolTitle,
	"recruit_adminSetMentorButton": recruit_adminSetMentorButton,
	"recruit_adminUnsetMentorButton": recruit_adminUnsetMentorButton,
	"recruit_adminPairingsTitle": recruit_adminPairingsTitle,
	"recruit_adminPairingsEmpty": recruit_adminPairingsEmpty,
	"recruit_adminPairingCreateButton": recruit_adminPairingCreateButton,
	"recruit_adminPairingEndButton": recruit_adminPairingEndButton,
	"recruit_adminMentorSelectLabel": recruit_adminMentorSelectLabel,
	"recruit_adminMenteeSelectLabel": recruit_adminMenteeSelectLabel,
	"recruit_adminNewcomersTitle": recruit_adminNewcomersTitle,
	"recruit_adminNewcomersEmpty": recruit_adminNewcomersEmpty,
	"officer_notesTitle": officer_notesTitle,
	"officer_notesHint": officer_notesHint,
	"officer_notesEmpty": officer_notesEmpty,
	"officer_memberNoNotes": officer_memberNoNotes,
	"officer_notePlaceholder": officer_notePlaceholder,
	"officer_noteAddButton": officer_noteAddButton,
	"officer_noteEditButton": officer_noteEditButton,
	"officer_noteSaveButton": officer_noteSaveButton,
	"officer_noteDeleteButton": officer_noteDeleteButton,
	"officer_noteAuthorTemplate": officer_noteAuthorTemplate,
	"officer_exportTitle": officer_exportTitle,
	"officer_exportHint": officer_exportHint,
	"officer_exportButton": officer_exportButton,
	"officer_exportAbout": officer_exportAbout,
	"officer_goalsTitle": officer_goalsTitle,
	"officer_goalsHint": officer_goalsHint,
	"officer_goalsEmpty": officer_goalsEmpty,
	"officer_statusActive": officer_statusActive,
	"officer_statusDone": officer_statusDone,
	"officer_statusDropped": officer_statusDropped,
	"officer_myEntryLabel": officer_myEntryLabel,
	"officer_myTitle": officer_myTitle,
	"officer_myHint": officer_myHint,
	"officer_myEmpty": officer_myEmpty,
	"officer_goalGuildLabel": officer_goalGuildLabel,
	"officer_goalTitleLabel": officer_goalTitleLabel,
	"officer_goalTitlePlaceholder": officer_goalTitlePlaceholder,
	"officer_goalNoteLabel": officer_goalNoteLabel,
	"officer_goalNotePlaceholder": officer_goalNotePlaceholder,
	"officer_goalDungeonLabel": officer_goalDungeonLabel,
	"officer_goalDungeonNone": officer_goalDungeonNone,
	"officer_goalStatusLabel": officer_goalStatusLabel,
	"officer_goalAddButton": officer_goalAddButton,
	"officer_goalSaveButton": officer_goalSaveButton,
	"officer_goalEditButton": officer_goalEditButton,
	"officer_goalDeleteButton": officer_goalDeleteButton
};
