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
export const common_cancel = (fbs: FbsRuntime) => fbs._("取消", null, { hk: "2sAasj" });
export const common_confirm = (fbs: FbsRuntime) => fbs._("确定", null, { hk: "4gPoIi" });
export const common_unknownError = (fbs: FbsRuntime) => fbs._("未知错误", null, { hk: "zLPv2" });
export const common_renderError = (fbs: FbsRuntime, p?: StringParams) => fbs._("渲染出错: {message}", [fbs._param("message", pv(p, "message"))], { hk: "4FnNsT" });
export const common_renderErrorHint = (fbs: FbsRuntime) => fbs._("这一页出了问题，其他页面不受影响。", null, { hk: "2m0JH6" });
export const common_backToHub = (fbs: FbsRuntime) => fbs._("返回百业集结", null, { hk: "4Fe68V" });
export const common_loadingGuild = (fbs: FbsRuntime) => fbs._("正在展开百业…", null, { hk: "vuigw" });
export const common_close = (fbs: FbsRuntime) => fbs._("关闭", null, { hk: "4BhVbM" });
export const site_title = (fbs: FbsRuntime) => fbs._("百业集结", null, { hk: "4yTeMg" });
export const site_subtitle = (fbs: FbsRuntime) => fbs._("燕云十六声 · 国际服百业车队与攻略集散地 —— 择一业而入，共赴双十。", null, { hk: "2g9rY5" });
export const site_heroAlt = (fbs: FbsRuntime) => fbs._("水墨山水", null, { hk: "30nbm1" });
export const site_seal = (fbs: FbsRuntime) => fbs._("燕", null, { hk: "2oucmC" });
export const login_cardTitle = (fbs: FbsRuntime) => fbs._("先登录，再入江湖", null, { hk: "1faEKJ" });
export const login_cardBody1 = (fbs: FbsRuntime) => fbs._("本站需用 Discord 账号认证后使用。", null, { hk: "DQUx9" });
export const login_cardBody2 = (fbs: FbsRuntime) => fbs._("登录后将按你所在的 Discord 服务器，展示你有权限访问的百业。", null, { hk: "1zXTLR" });
export const login_button = (fbs: FbsRuntime) => fbs._("用 Discord 登录", null, { hk: "2P5kWp" });
export const login_privacy = (fbs: FbsRuntime) => fbs._("我们会读取并保存你的 Discord 昵称、头像、服务器列表与登录授权，用于成员校验与提醒功能，详见隐私政策", null, { hk: "3vWIu9" });
export const userBar_logout = (fbs: FbsRuntime) => fbs._("退出登录", null, { hk: "3i0SR7" });
export const userBar_loggingOut = (fbs: FbsRuntime) => fbs._("退出中…", null, { hk: "36yEnv" });
export const userBar_settings = (fbs: FbsRuntime) => fbs._("个人资料", null, { hk: "4bHrOb" });
export const settings_title = (fbs: FbsRuntime) => fbs._("个人资料", null, { hk: "2cuWgQ" });
export const settings_discordLabel = (fbs: FbsRuntime) => fbs._("Discord 账号", null, { hk: "2NgYil" });
export const settings_languageLabel = (fbs: FbsRuntime) => fbs._("语言", null, { hk: "1RyUQH" });
export const settings_languageHint = (fbs: FbsRuntime) => fbs._("界面语言。选择「自动」时跟随浏览器语言；手动选择后保存在你的账号里，压过浏览器语言。", null, { hk: "3EPkVc" });
export const settings_autoLabel = (fbs: FbsRuntime) => fbs._("自动（跟随浏览器）", null, { hk: "3zXuZV" });
export const settings_langZhCn = (fbs: FbsRuntime) => fbs._("简体中文", null, { hk: "1Dzc6K" });
export const settings_langZhTw = (fbs: FbsRuntime) => fbs._("繁體中文", null, { hk: "2pCiIw" });
export const settings_langEn = (fbs: FbsRuntime) => fbs._("English", null, { hk: "38KElq" });
export const settings_langEs = (fbs: FbsRuntime) => fbs._("Español", null, { hk: "spUTh" });
export const settings_langFr = (fbs: FbsRuntime) => fbs._("Français", null, { hk: "3lqAzb" });
export const settings_savedText = (fbs: FbsRuntime) => fbs._("已保存", null, { hk: "NEXGD" });
export const picker_myGuilds = (fbs: FbsRuntime) => fbs._("我的百业", null, { hk: "dktjr" });
export const picker_myGuildsEn = (fbs: FbsRuntime) => fbs._("My Guilds", null, { hk: "22v7Nm" });
export const picker_publicGuilds = (fbs: FbsRuntime) => fbs._("公开百业", null, { hk: "4yOS6M" });
export const picker_publicGuildsEn = (fbs: FbsRuntime) => fbs._("Public · Read Only", null, { hk: "140dlL" });
export const picker_readOnlyBadge = (fbs: FbsRuntime) => fbs._("只读", null, { hk: "3zeu5e" });
export const picker_emptyTitle = (fbs: FbsRuntime) => fbs._("你还没有可用的百业", null, { hk: "2TT6tg" });
export const picker_emptyBody = (fbs: FbsRuntime) => fbs._("百业按 Discord 服务器划分：你所在的服务器若已绑定百业，它会出现在这里。若还没有，你可以把自己管理的服务器绑成一个新百业。", null, { hk: "2X61Iw" });
export const picker_createGuild = (fbs: FbsRuntime) => fbs._("创建百业", null, { hk: "1oIR98" });
export const picker_createGuildMore = (fbs: FbsRuntime) => fbs._("+ 创建新百业", null, { hk: "1zZ9V0" });
export const create_backLink = (fbs: FbsRuntime) => fbs._("‹ 我的百业", null, { hk: "3EholP" });
export const create_title = (fbs: FbsRuntime) => fbs._("创建百业", null, { hk: "3TjGE0" });
export const create_subtitle = (fbs: FbsRuntime) => fbs._("绑定一个你管理的 Discord 服务器 —— 之后只有该服务器的成员能看到并使用这个百业。", null, { hk: "2OG0ab" });
export const create_nameLabel = (fbs: FbsRuntime) => fbs._("百业名", null, { hk: "3Yxthi" });
export const create_namePlaceholder = (fbs: FbsRuntime) => fbs._("如：叽哩呱啦", null, { hk: "18eyGq" });
export const create_slugLabel = (fbs: FbsRuntime) => fbs._("访问标识 slug（网址后缀，只能小写字母 / 数字 / 连字符）", null, { hk: "3mKw3R" });
export const create_slugPlaceholder = (fbs: FbsRuntime) => fbs._("如：my-guild", null, { hk: "1x4exY" });
export const create_slugChecking = (fbs: FbsRuntime) => fbs._("检查中…", null, { hk: "1S89WD" });
export const create_slugAvailable = (fbs: FbsRuntime, p?: StringParams) => fbs._("✓ yanyun.app/{slug} 可用", [fbs._param("slug", pv(p, "slug"))], { hk: "pkaOI" });
export const create_slugTaken = (fbs: FbsRuntime) => fbs._("✗ 已被占用或不符合规则", null, { hk: "4pqL0G" });
export const create_slugNote = (fbs: FbsRuntime) => fbs._("创建后不可更改", null, { hk: "3dIA2t" });
export const create_serverLabel = (fbs: FbsRuntime) => fbs._("绑定 Discord 服务器（仅列出你有管理权限的）", null, { hk: "28q1Bq" });
export const create_noServers1 = (fbs: FbsRuntime) => fbs._("你还没有任何可管理的 Discord 服务器。", null, { hk: "TdXjI" });
export const create_noServers2 = (fbs: FbsRuntime) => fbs._("先在 Discord 里建一个服务器（或拿到管理员权限），重新登录刷新列表后再来创建。", null, { hk: "Fjr0z" });
export const create_submit = (fbs: FbsRuntime) => fbs._("创建百业", null, { hk: "4j3Iw9" });
export const create_submitting = (fbs: FbsRuntime) => fbs._("创建中…", null, { hk: "3k98vu" });
export const create_toastNameShort = (fbs: FbsRuntime) => fbs._("百业名至少 2 个字", null, { hk: "1naof7" });
export const create_toastSlugRequired = (fbs: FbsRuntime) => fbs._("请填写访问标识 slug", null, { hk: "1drUIP" });
export const create_toastSlugBad = (fbs: FbsRuntime) => fbs._("这个 slug 不可用，换一个", null, { hk: "cvbPq" });
export const create_toastServerRequired = (fbs: FbsRuntime) => fbs._("请选择要绑定的 Discord 服务器", null, { hk: "1rjZmC" });
export const create_toastCreated = (fbs: FbsRuntime) => fbs._("百业创建成功", null, { hk: "G8Mwi" });
export const create_toastFailed = (fbs: FbsRuntime) => fbs._("创建失败，请稍后再试", null, { hk: "1WtBPF" });
export const locked_backLink = (fbs: FbsRuntime) => fbs._("‹ 我的百业", null, { hk: "1XD74X" });
export const locked_title = (fbs: FbsRuntime) => fbs._("无权访问这个百业", null, { hk: "2oP38b" });
export const locked_body1 = (fbs: FbsRuntime) => fbs._("该百业不存在，或仅对某个 Discord 服务器的成员开放。", null, { hk: "42jD6z" });
export const locked_body2 = (fbs: FbsRuntime) => fbs._("加入对应的 Discord 服务器后，用同一个账号登录即可访问。", null, { hk: "1BmyQU" });
export const locked_backButton = (fbs: FbsRuntime) => fbs._("回到我的百业", null, { hk: "4lMYj2" });
export const guildHome_backToHub = (fbs: FbsRuntime) => fbs._("← 百业集结", null, { hk: "3IAHUH" });
export const guildHome_backPlain = (fbs: FbsRuntime) => fbs._("← 返回", null, { hk: "3lNbx3" });
export const guildHome_tabTeam = (fbs: FbsRuntime) => fbs._("组队", null, { hk: "2HMgLA" });
export const guildHome_tabDex = (fbs: FbsRuntime) => fbs._("攻略", null, { hk: "3xrJT5" });
export const guildHome_tabSect = (fbs: FbsRuntime) => fbs._("流派攻略", null, { hk: "39iHUL" });
export const guildHome_tabAnnouncements = (fbs: FbsRuntime) => fbs._("公告", null, { hk: "4fVuCK" });
export const guildHome_readOnlyBanner = (fbs: FbsRuntime) => fbs._("该百业尚未绑定 Discord 服务器 · 只读浏览", null, { hk: "3AuuxG" });
export const guildHome_adminLink = (fbs: FbsRuntime) => fbs._("管理", null, { hk: "24ndE2" });
export const guildHome_tabSchedule = (fbs: FbsRuntime) => fbs._("排期", null, { hk: "1qAdur" });
export const groupingType_tabActivity = (fbs: FbsRuntime) => fbs._("双十人本", null, { hk: "4ED85v" });
export const groupingType_tabTalent = (fbs: FbsRuntime) => fbs._("天赋组队", null, { hk: "2mJIoT" });
export const groupingType_tabRace = (fbs: FbsRuntime) => fbs._("竞速报名", null, { hk: "LJwuK" });
export const groupingType_tabTower = (fbs: FbsRuntime) => fbs._("爬塔", null, { hk: "2qlYLG" });
export const groupingType_shortActivity = (fbs: FbsRuntime) => fbs._("双十", null, { hk: "4x25H6" });
export const groupingType_shortTalent = (fbs: FbsRuntime) => fbs._("天赋", null, { hk: "5D6J" });
export const groupingType_shortRace = (fbs: FbsRuntime) => fbs._("竞速", null, { hk: "1RNge2" });
export const groupingType_shortTower = (fbs: FbsRuntime) => fbs._("爬塔", null, { hk: "13V0aQ" });
export const groupingType_shortGather = (fbs: FbsRuntime) => fbs._("采集", null, { hk: "2TSi9N" });
export const groupingType_shortExplore = (fbs: FbsRuntime) => fbs._("探索", null, { hk: "15q2zc" });
export const groupingList_prevWeek = (fbs: FbsRuntime) => fbs._("上一周", null, { hk: "3BkFgQ" });
export const groupingList_nextWeek = (fbs: FbsRuntime) => fbs._("下一周", null, { hk: "4B8XqX" });
export const groupingList_weekHeader = (fbs: FbsRuntime, p?: StringParams) => fbs._("{range} · {count} 队", [fbs._param("range", pv(p, "range")), fbs._param("count", pv(p, "count"))], { hk: "2iABLd" });
export const groupingList_emptyInteractive = (fbs: FbsRuntime) => fbs._("暂无车队，来发第一车吧", null, { hk: "4gwU2q" });
export const groupingList_emptyReadonly = (fbs: FbsRuntime) => fbs._("暂无车队", null, { hk: "3TyerJ" });
export const groupingList_statusOpen = (fbs: FbsRuntime) => fbs._("报名中", null, { hk: "3MkcWh" });
export const groupingList_people = (fbs: FbsRuntime, p?: StringParams) => fbs._("{occupied}/{max} 人", [fbs._param("occupied", pv(p, "occupied")), fbs._param("max", pv(p, "max"))], { hk: "4oOozU" });
export const groupingList_newCar = (fbs: FbsRuntime) => fbs._("📯 张贴告示 · 发新车", null, { hk: "2aJB3Y" });
export const groupingList_seal = (fbs: FbsRuntime) => fbs._("募", null, { hk: "1rqwZs" });
export const groupingList_dayGroupHeader = (fbs: FbsRuntime, p?: StringParams) => fbs._("{month}月{day}日 {weekday}", [
	fbs._param("month", pv(p, "month")),
	fbs._param("day", pv(p, "day")),
	fbs._param("weekday", pv(p, "weekday"))
], { hk: "2fm1KB" });
export const groupingList_weekday0 = (fbs: FbsRuntime) => fbs._("周日", null, { hk: "2P0qvx" });
export const groupingList_weekday1 = (fbs: FbsRuntime) => fbs._("周一", null, { hk: "2ZIdDk" });
export const groupingList_weekday2 = (fbs: FbsRuntime) => fbs._("周二", null, { hk: "18Mvtm" });
export const groupingList_weekday3 = (fbs: FbsRuntime) => fbs._("周三", null, { hk: "KIxbN" });
export const groupingList_weekday4 = (fbs: FbsRuntime) => fbs._("周四", null, { hk: "93PIO" });
export const groupingList_weekday5 = (fbs: FbsRuntime) => fbs._("周五", null, { hk: "42oHlm" });
export const groupingList_weekday6 = (fbs: FbsRuntime) => fbs._("周六", null, { hk: "2hYoYZ" });
export const groupingList_undatedGroup = (fbs: FbsRuntime) => fbs._("未定时间", null, { hk: "SDRsJ" });
export const groupingDetail_notFound = (fbs: FbsRuntime) => fbs._("车队不存在或已解散", null, { hk: "44lVRs" });
export const groupingDetail_backToList = (fbs: FbsRuntime) => fbs._("‹ 返回车队列表", null, { hk: "3M26fs" });
export const groupingDetail_share = (fbs: FbsRuntime) => fbs._("🔗 分享车队", null, { hk: "VDhGB" });
export const groupingDetail_edit = (fbs: FbsRuntime) => fbs._("✏️ 编辑", null, { hk: "2Spo5y" });
export const groupingDetail_disband = (fbs: FbsRuntime) => fbs._("解散车队", null, { hk: "2kMooV" });
export const groupingDetail_disbanding = (fbs: FbsRuntime) => fbs._("解散中…", null, { hk: "3tSTNx" });
export const groupingDetail_statusOpen = (fbs: FbsRuntime) => fbs._("报名中", null, { hk: "1kZOyd" });
export const groupingDetail_people = (fbs: FbsRuntime, p?: StringParams) => fbs._("{occupied}/{max} 人", [fbs._param("occupied", pv(p, "occupied")), fbs._param("max", pv(p, "max"))], { hk: "Ki47X" });
export const groupingDetail_readyProgress = (fbs: FbsRuntime, p?: StringParams) => fbs._("已就位 {ready}/{occupied}", [fbs._param("ready", pv(p, "ready")), fbs._param("occupied", pv(p, "occupied"))], { hk: "4vHS1S" });
export const groupingDetail_openHint = (fbs: FbsRuntime) => fbs._("人人可管 · 无需管理码 — 点空位即可落座", null, { hk: "3JBGa6" });
export const groupingDetail_readonlyHint = (fbs: FbsRuntime) => fbs._("只读浏览 · 该百业尚未绑定 Discord 服务器", null, { hk: "3PXFAD" });
export const groupingDetail_toastDisbanded = (fbs: FbsRuntime) => fbs._("车队已解散", null, { hk: "24o5Qg" });
export const groupingDetail_toastDisbandFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("解散失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "3dvU1e" });
export const groupingDetail_linkCopied = (fbs: FbsRuntime) => fbs._("链接已复制", null, { hk: "4w97DC" });
export const groupingDetail_copyFailedManual = (fbs: FbsRuntime) => fbs._("复制失败，请手动复制地址栏链接", null, { hk: "1yUnM7" });
export const groupingDetail_disbandConfirmTitle = (fbs: FbsRuntime) => fbs._("解散车队", null, { hk: "1mBJGx" });
export const groupingDetail_disbandConfirmMessage = (fbs: FbsRuntime, p?: StringParams) => fbs._("确定解散「{title}」吗？所有报名将被清空。", [fbs._param("title", pv(p, "title"))], { hk: "1FjUia" });
export const groupingDetail_complete = (fbs: FbsRuntime) => fbs._("完成车队", null, { hk: "3AmadG" });
export const groupingDetail_completing = (fbs: FbsRuntime) => fbs._("完成中…", null, { hk: "37NLwg" });
export const groupingDetail_statusCompleted = (fbs: FbsRuntime) => fbs._("已完成", null, { hk: "3RhEsZ" });
export const groupingDetail_restore = (fbs: FbsRuntime) => fbs._("恢复车队", null, { hk: "3yIWsU" });
export const groupingDetail_completeConfirmTitle = (fbs: FbsRuntime) => fbs._("完成车队", null, { hk: "swUro" });
export const groupingDetail_completeConfirmMessage = (fbs: FbsRuntime, p?: StringParams) => fbs._("确定完成「{title}」吗？完成后将从车队列表隐藏，也不再发送发车提醒；之后仍可在本页恢复。", [fbs._param("title", pv(p, "title"))], { hk: "4cOUMP" });
export const groupingDetail_toastCompleted = (fbs: FbsRuntime) => fbs._("车队已完成", null, { hk: "3Mtcxt" });
export const groupingDetail_toastCompleteFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("完成失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "25NVgL" });
export const groupingDetail_toastRestored = (fbs: FbsRuntime) => fbs._("车队已恢复", null, { hk: "3QbybC" });
export const groupingDetail_toastRestoreFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("恢复失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "1F35rq" });
export const groupingDetail_completedHint = (fbs: FbsRuntime) => fbs._("该车队已完成 · 已从列表隐藏，不再发送发车提醒", null, { hk: "2N7V2X" });
export const groupingDetail_rosterAnswersTitle = (fbs: FbsRuntime) => fbs._("报名表答案", null, { hk: "2eskS4" });
export const groupingForm_createTitle = (fbs: FbsRuntime) => fbs._("张贴告示", null, { hk: "1c1hiS" });
export const groupingForm_editTitle = (fbs: FbsRuntime) => fbs._("编辑告示", null, { hk: "ojtFZ" });
export const groupingForm_typeLabel = (fbs: FbsRuntime) => fbs._("类型", null, { hk: "4iLEw8" });
export const groupingForm_capacity = (fbs: FbsRuntime, p?: StringParams) => fbs._("人数上限 {max} 人（{hint}）", [fbs._param("max", pv(p, "max")), fbs._param("hint", pv(p, "hint"))], { hk: "CIAbD" });
export const groupingForm_hintActivity = (fbs: FbsRuntime) => fbs._("双十固定 10 人，不选副本", null, { hk: "ZATJD" });
export const groupingForm_hintDungeon = (fbs: FbsRuntime, p?: StringParams) => fbs._("按所选副本「{name}」{max} 人", [fbs._param("name", pv(p, "name")), fbs._param("max", pv(p, "max"))], { hk: "2flXgX" });
export const groupingForm_hintTalent = (fbs: FbsRuntime) => fbs._("天赋默认 5 人，选副本后按副本人数", null, { hk: "zliQd" });
export const groupingForm_hintRace = (fbs: FbsRuntime) => fbs._("竞速默认 10 人，选副本后按副本人数", null, { hk: "15DJg" });
export const groupingForm_hintTower = (fbs: FbsRuntime) => fbs._("爬塔固定 10 人，不选副本", null, { hk: "mFKEy" });
export const groupingForm_titleLabel = (fbs: FbsRuntime) => fbs._("标题", null, { hk: "19IzYf" });
export const groupingForm_titlePlaceholder = (fbs: FbsRuntime) => fbs._("如：周六晚双十来奶", null, { hk: "1NWNsO" });
export const groupingForm_startsLabel = (fbs: FbsRuntime) => fbs._("出发时间", null, { hk: "16RJk8" });
export const groupingForm_monthOption = (fbs: FbsRuntime, p?: StringParams) => fbs._("{n}月", [fbs._param("n", pv(p, "n"))], { hk: "48m1Oc" });
export const groupingForm_dayOption = (fbs: FbsRuntime, p?: StringParams) => fbs._("{n}日", [fbs._param("n", pv(p, "n"))], { hk: "1Jfcbw" });
export const groupingForm_hourOption = (fbs: FbsRuntime, p?: StringParams) => fbs._("{n}时", [fbs._param("n", pv(p, "n"))], { hk: "2E1X3Y" });
export const groupingForm_minuteOption = (fbs: FbsRuntime, p?: StringParams) => fbs._("{n}分", [fbs._param("n", pv(p, "n"))], { hk: "3gNJay" });
export const groupingForm_dungeonLabel = (fbs: FbsRuntime) => fbs._("副本（可选）", null, { hk: "2BVx8Z" });
export const groupingForm_dungeonNone = (fbs: FbsRuntime) => fbs._("不指定", null, { hk: "4BFLre" });
export const groupingForm_nicknameLabel = (fbs: FbsRuntime) => fbs._("你的昵称（发车人自动落座 0 号位）", null, { hk: "10jDu2" });
export const groupingForm_nicknamePlaceholder = (fbs: FbsRuntime) => fbs._("游戏内昵称", null, { hk: "4yjCO8" });
export const groupingForm_sectLabel = (fbs: FbsRuntime) => fbs._("你的流派", null, { hk: "2I3oL4" });
export const groupingForm_submitCreate = (fbs: FbsRuntime) => fbs._("发布", null, { hk: "HMppa" });
export const groupingForm_submitEdit = (fbs: FbsRuntime) => fbs._("保存", null, { hk: "49DkjF" });
export const groupingForm_submitting = (fbs: FbsRuntime) => fbs._("提交中…", null, { hk: "24vFY5" });
export const groupingForm_toastSect = (fbs: FbsRuntime) => fbs._("请选择你的流派", null, { hk: "2AKlXP" });
export const groupingForm_toastSaved = (fbs: FbsRuntime) => fbs._("已保存", null, { hk: "2fzGr3" });
export const groupingForm_toastSaveFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("保存失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "3NJ7wl" });
export const groupingForm_toastPosted = (fbs: FbsRuntime) => fbs._("告示已张贴", null, { hk: "3YaJAn" });
export const groupingForm_toastCreateFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("创建失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "2fuBwy" });
export const groupingForm_titleTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{nickname}的{type}车队", [fbs._param("nickname", pv(p, "nickname")), fbs._param("type", pv(p, "type"))], { hk: "1tnz07" });
export const groupingForm_customFieldsTitle = (fbs: FbsRuntime) => fbs._("报名表自定义字段", null, { hk: "47vrHv" });
export const groupingForm_customFieldAddLabel = (fbs: FbsRuntime) => fbs._("添加字段", null, { hk: "2gXhMo" });
export const groupingForm_customFieldLabelPlaceholder = (fbs: FbsRuntime) => fbs._("字段名（如：联系方式）", null, { hk: "4lxqDq" });
export const groupingForm_customFieldTypeText = (fbs: FbsRuntime) => fbs._("单行文本", null, { hk: "h6nZU" });
export const groupingForm_customFieldTypeChoice = (fbs: FbsRuntime) => fbs._("单选", null, { hk: "4uxYYi" });
export const groupingForm_customFieldOptionsPlaceholder = (fbs: FbsRuntime) => fbs._("选项，一行一个（2–6 个）", null, { hk: "3k7tp0" });
export const groupingForm_customFieldRequiredLabel = (fbs: FbsRuntime) => fbs._("必填", null, { hk: "3fzAMZ" });
export const groupingForm_customFieldRemoveLabel = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "3RZPC5" });
export const groupingForm_customFieldEmptyText = (fbs: FbsRuntime) => fbs._("未设置自定义字段时，成员报名只填固定信息。", null, { hk: "OcGRe" });
export const seat_emptyJoin = (fbs: FbsRuntime) => fbs._("空位 · 点击落座", null, { hk: "2qq5cz" });
export const seat_empty = (fbs: FbsRuntime) => fbs._("空位", null, { hk: "4C4xZf" });
export const seat_modalTitle = (fbs: FbsRuntime, p?: StringParams) => fbs._("落座 · {n} 号位", [fbs._param("n", pv(p, "n"))], { hk: "mSN0Y" });
export const seat_modalSubtitle = (fbs: FbsRuntime) => fbs._("人人可管 · 无需管理码", null, { hk: "lFoEe" });
export const seat_nameLabel = (fbs: FbsRuntime) => fbs._("名字", null, { hk: "21GSvK" });
export const seat_namePlaceholder = (fbs: FbsRuntime) => fbs._("你的名字", null, { hk: "3tQOis" });
export const seat_nameRequired = (fbs: FbsRuntime) => fbs._("请填写名字", null, { hk: "2BoOd0" });
export const seat_selfTab = (fbs: FbsRuntime) => fbs._("自己报名", null, { hk: "2QIeKD" });
export const seat_proxyTab = (fbs: FbsRuntime) => fbs._("代报名", null, { hk: "194qAa" });
export const seat_selfNameHint = (fbs: FbsRuntime) => fbs._("名字取自你的 Discord 昵称，不可修改", null, { hk: "4Gu5Rq" });
export const seat_proxySearchPlaceholder = (fbs: FbsRuntime) => fbs._("搜索成员名字", null, { hk: "1atvoA" });
export const seat_proxyPickRequired = (fbs: FbsRuntime) => fbs._("请选择要代报的成员", null, { hk: "2z840R" });
export const seat_proxyEmpty = (fbs: FbsRuntime) => fbs._("名册里还没有成员", null, { hk: "Vlao1" });
export const seat_sectLabel = (fbs: FbsRuntime) => fbs._("流派", null, { hk: "2iNI22" });
export const seat_confirmJoin = (fbs: FbsRuntime) => fbs._("确认落座", null, { hk: "19CcNV" });
export const seat_joining = (fbs: FbsRuntime) => fbs._("落座中…", null, { hk: "3jZdqe" });
export const seat_toastSect = (fbs: FbsRuntime) => fbs._("请选择流派", null, { hk: "10YJUh" });
export const seat_toastJoined = (fbs: FbsRuntime) => fbs._("落座成功", null, { hk: "42afIk" });
export const seat_toastJoinFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("报名失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "1ksaYm" });
export const seat_toastLeft = (fbs: FbsRuntime) => fbs._("已取消报名", null, { hk: "1zbZ9" });
export const seat_toastLeaveFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("取消失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "4vKZNF" });
export const seat_leaveConfirmTitle = (fbs: FbsRuntime) => fbs._("取消报名", null, { hk: "37vXHe" });
export const seat_leaveConfirmMessage = (fbs: FbsRuntime, p?: StringParams) => fbs._("确定取消「{nickname}」的报名吗？", [fbs._param("nickname", pv(p, "nickname"))], { hk: "3GdYy7" });
export const seat_roleHealer = (fbs: FbsRuntime) => fbs._("奶", null, { hk: "zfX8r" });
export const seat_roleDps = (fbs: FbsRuntime) => fbs._("输出", null, { hk: "1edxEf" });
export const seat_leader = (fbs: FbsRuntime) => fbs._("车头", null, { hk: "19Ds5R" });
export const seat_readyMark = (fbs: FbsRuntime) => fbs._("已就位", null, { hk: "vv411" });
export const seat_readyAction = (fbs: FbsRuntime) => fbs._("我已就位", null, { hk: "pHPym" });
export const seat_unreadyAction = (fbs: FbsRuntime) => fbs._("取消就位", null, { hk: "3xXyNj" });
export const seat_toastReady = (fbs: FbsRuntime) => fbs._("已标记就位", null, { hk: "1yVbN" });
export const seat_toastUnready = (fbs: FbsRuntime) => fbs._("已取消就位", null, { hk: "4vkkBj" });
export const seat_toastReadyFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("操作失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "4aEHrF" });
export const appBlocks_rosterTitle = (fbs: FbsRuntime) => fbs._("队伍名册", null, { hk: "JxG6Y" });
export const appBlocks_closedStatus = (fbs: FbsRuntime) => fbs._("已关闭", null, { hk: "wv86r" });
export const appBlocks_completedStatus = (fbs: FbsRuntime) => fbs._("已完成", null, { hk: "487lL4" });
export const appBlocks_unknownBlock = (fbs: FbsRuntime) => fbs._("该内容需要更新 App 后显示", null, { hk: "yE2Y1" });
export const dex_backToDex = (fbs: FbsRuntime) => fbs._("‹ 返回攻略", null, { hk: "1h53DM" });
export const dex_bossesLine = (fbs: FbsRuntime, p?: StringParams) => fbs._("{count} 位首领", [fbs._param("count", pv(p, "count"))], { hk: "3PBnzP" });
export const dex_noBossData = (fbs: FbsRuntime) => fbs._("暂无 Boss 数据", null, { hk: "1ImRLt" });
export const dex_empty = (fbs: FbsRuntime) => fbs._("暂无攻略", null, { hk: "45H0Gq" });
export const dex_currentGuides = (fbs: FbsRuntime, p?: StringParams) => fbs._("当期攻略 · {category}", [fbs._param("category", pv(p, "category"))], { hk: "3OvTPT" });
export const dex_catSub = (fbs: FbsRuntime, p?: StringParams) => fbs._("{season} · {seasonName}", [fbs._param("season", pv(p, "season")), fbs._param("seasonName", pv(p, "seasonName"))], { hk: "40drqm" });
export const dex_catSubCurrent = (fbs: FbsRuntime, p?: StringParams) => fbs._("{season} · {seasonName} · 版本 {version}", [
	fbs._param("season", pv(p, "season")),
	fbs._param("seasonName", pv(p, "seasonName")),
	fbs._param("version", pv(p, "version"))
], { hk: "2ra30q" });
export const dex_size10 = (fbs: FbsRuntime) => fbs._("十人本", null, { hk: "2TlWdr" });
export const dex_size5 = (fbs: FbsRuntime) => fbs._("五人本", null, { hk: "4sPt6s" });
export const dex_sizeN = (fbs: FbsRuntime, p?: StringParams) => fbs._("{n}人本", [fbs._param("n", pv(p, "n"))], { hk: "2RuVwL" });
export const dex_bossUnit = (fbs: FbsRuntime) => fbs._("首领", null, { hk: "3EDcaI" });
export const dex_partMechanics = (fbs: FbsRuntime) => fbs._("机制", null, { hk: "4aLVrn" });
export const dex_partShouts = (fbs: FbsRuntime) => fbs._("喊话", null, { hk: "3JrLt5" });
export const dex_partTalents = (fbs: FbsRuntime) => fbs._("天赋", null, { hk: "1f3ZdU" });
export const dex_labelAll = (fbs: FbsRuntime, p?: StringParams) => fbs._("{count}位首领 · {parts}俱全", [fbs._param("count", pv(p, "count")), fbs._param("parts", pv(p, "parts"))], { hk: "3cdIy6" });
export const dex_labelParts = (fbs: FbsRuntime, p?: StringParams) => fbs._("{count}位首领 · {parts}", [fbs._param("count", pv(p, "count")), fbs._param("parts", pv(p, "parts"))], { hk: "18SDW5" });
export const dex_labelPending = (fbs: FbsRuntime, p?: StringParams) => fbs._("{count}位首领 · 攻略待补", [fbs._param("count", pv(p, "count"))], { hk: "FAYQT" });
export const dex_labelNoBosses = (fbs: FbsRuntime) => fbs._("首领待补", null, { hk: "4gDcBf" });
export const dex_sealBoss = (fbs: FbsRuntime) => fbs._("将", null, { hk: "3PeVz2" });
export const boss_back = (fbs: FbsRuntime) => fbs._("‹ 返回", null, { hk: "1ypUOE" });
export const boss_notFound = (fbs: FbsRuntime) => fbs._("Boss 不存在", null, { hk: "1R8XOL" });
export const boss_tabMechanics = (fbs: FbsRuntime) => fbs._("机制", null, { hk: "1dxvYF" });
export const boss_tabTalents = (fbs: FbsRuntime) => fbs._("天赋", null, { hk: "31KA1F" });
export const boss_shoutsTitle = (fbs: FbsRuntime) => fbs._("📢 喊话宏", null, { hk: "eb2O2" });
export const boss_copy = (fbs: FbsRuntime) => fbs._("复制", null, { hk: "2rOORY" });
export const boss_shoutCopied = (fbs: FbsRuntime) => fbs._("喊话已复制", null, { hk: "5rPnl" });
export const boss_copyFailed = (fbs: FbsRuntime) => fbs._("复制失败", null, { hk: "2nOrCI" });
export const boss_copyManual = (fbs: FbsRuntime) => fbs._("请手动复制", null, { hk: "1FSrPN" });
export const boss_noMechanics = (fbs: FbsRuntime) => fbs._("暂无机制", null, { hk: "3yGEUZ" });
export const boss_noTalents = (fbs: FbsRuntime) => fbs._("暂无天赋", null, { hk: "2HED62" });
export const boss_talentTitle = (fbs: FbsRuntime, p?: StringParams) => fbs._("天赋 {code}", [fbs._param("code", pv(p, "code"))], { hk: "4GlBmS" });
export const boss_talentPending = (fbs: FbsRuntime) => " " + fbs._("· 待确认", null, { hk: "3d8ehA" });
export const sect_empty = (fbs: FbsRuntime) => fbs._("暂无流派", null, { hk: "1qX1b3" });
export const sect_back = (fbs: FbsRuntime) => fbs._("‹ 返回流派", null, { hk: "vxaLc" });
export const sect_tabBis = (fbs: FbsRuntime) => fbs._("毕业词条", null, { hk: "RqkfK" });
export const sect_tabRotation = (fbs: FbsRuntime) => fbs._("输出轴", null, { hk: "NHBc5" });
export const sect_tabRates = (fbs: FbsRuntime) => fbs._("三率目标", null, { hk: "3m94Z5" });
export const sect_tabTiaolv = (fbs: FbsRuntime) => fbs._("调律推演", null, { hk: "4cGH4V" });
export const sect_tabGrad = (fbs: FbsRuntime) => fbs._("武库鉴宝", null, { hk: "22BvKh" });
export const sect_noBis = (fbs: FbsRuntime) => fbs._("暂无毕业词条", null, { hk: "2Fhe8t" });
export const sect_noRotation = (fbs: FbsRuntime) => fbs._("暂无输出轴", null, { hk: "49gRAj" });
export const sect_noRates = (fbs: FbsRuntime) => fbs._("暂无三率目标", null, { hk: "38089W" });
export const sect_rotGreydust = (fbs: FbsRuntime) => fbs._("一分钟木桩轴", null, { hk: "4uPrhM" });
export const sect_rotOpener = (fbs: FbsRuntime) => fbs._("起手", null, { hk: "37zdTH" });
export const sect_rotLoop = (fbs: FbsRuntime) => fbs._("循环", null, { hk: "TuRdD" });
export const sect_rotKeyPoints = (fbs: FbsRuntime) => fbs._("要点", null, { hk: "28Xe10" });
export const sect_rotInnerSkills = (fbs: FbsRuntime) => fbs._("心法", null, { hk: "3y1AV0" });
export const sect_rotVideo = (fbs: FbsRuntime) => fbs._("视频攻略", null, { hk: "3vhEwi" });
export const sect_rateAccuracy = (fbs: FbsRuntime) => fbs._("精准", null, { hk: "2qqhWX" });
export const sect_rateCrit = (fbs: FbsRuntime) => fbs._("会心", null, { hk: "2rkQSy" });
export const sect_rateCritDamage = (fbs: FbsRuntime) => fbs._("会意", null, { hk: "3KKJsu" });
export const sect_bisMainWeapon = (fbs: FbsRuntime) => fbs._("主武器", null, { hk: "18SlXR" });
export const sect_bisOffWeapon = (fbs: FbsRuntime) => fbs._("副武器", null, { hk: "4eeES5" });
export const sect_bisAccessories = (fbs: FbsRuntime) => fbs._("环佩", null, { hk: "3UMLS" });
export const sect_bisHeadBody = (fbs: FbsRuntime) => fbs._("头衣", null, { hk: "3zQTY6" });
export const sect_bisLegsWrists = (fbs: FbsRuntime) => fbs._("腿腕", null, { hk: "3Y4Eie" });
export const sect_tabAffix = (fbs: FbsRuntime) => fbs._("毕业词缀", null, { hk: "3mhsqc" });
export const sect_affixEmpty = (fbs: FbsRuntime) => fbs._("暂无毕业词缀", null, { hk: "jtw3O" });
export const sect_affixSetLabel = (fbs: FbsRuntime) => fbs._("套装", null, { hk: "4ww6y8" });
export const sect_affixBowLabel = (fbs: FbsRuntime) => fbs._("弓玦", null, { hk: "3orh70" });
export const sect_affixDingyinLabel = (fbs: FbsRuntime) => fbs._("定音", null, { hk: "43M0Ct" });
export const sect_affixColAffix = (fbs: FbsRuntime) => fbs._("词缀", null, { hk: "mVWjS" });
export const sect_affixColCount = (fbs: FbsRuntime) => fbs._("条数", null, { hk: "13PJ3u" });
export const sect_affixColMax = (fbs: FbsRuntime) => fbs._("满值", null, { hk: "1klGbZ" });
export const sect_affixColCy = (fbs: FbsRuntime) => fbs._("承音", null, { hk: "18HGre" });
export const sect_affixSource = (fbs: FbsRuntime) => fbs._("按 100 阶毕业配方整理，与配装台同一口径；满值、承音为单条词缀上限。", null, { hk: "3J45dC" });
export const tiaolv_intro = (fbs: FbsRuntime) => fbs._("调律推演 · 复刻 bilibili@片雲 DIY 0.10.2（100级）伤害计算器逻辑", null, { hk: "uvAto" });
export const tiaolv_innerSkill = (fbs: FbsRuntime, p?: StringParams) => fbs._("心法{n}", [fbs._param("n", pv(p, "n"))], { hk: "eJk6D" });
export const tiaolv_innerSkillPlaceholder = (fbs: FbsRuntime) => fbs._("心法名", null, { hk: "3xzYAK" });
export const tiaolv_wuxue = (fbs: FbsRuntime) => fbs._("武学", null, { hk: "3UYXsI" });
export const tiaolv_wuku = (fbs: FbsRuntime) => fbs._("武库", null, { hk: "1cQIyC" });
export const tiaolv_wukuSelf = (fbs: FbsRuntime) => fbs._("本系", null, { hk: "2twijq" });
export const tiaolv_wukuCommon = (fbs: FbsRuntime) => fbs._("通用", null, { hk: "3UMNT2" });
export const tiaolv_suit = (fbs: FbsRuntime) => fbs._("套装", null, { hk: "2VhwKB" });
export const tiaolv_bow = (fbs: FbsRuntime) => fbs._("弓决", null, { hk: "4eN9qn" });
export const tiaolv_none = (fbs: FbsRuntime) => fbs._("无", null, { hk: "3NAjfT" });
export const tiaolv_tuneArea = (fbs: FbsRuntime) => fbs._("调律区（K:R 列，对应 Excel K3:R5, K6:R24）", null, { hk: "1ZlroU" });
export const tiaolv_calc = (fbs: FbsRuntime) => fbs._("开始推演", null, { hk: "gF2js" });
export const tiaolv_calculating = (fbs: FbsRuntime) => fbs._("推演中…", null, { hk: "3lCxX5" });
export const tiaolv_toastFailed = (fbs: FbsRuntime) => fbs._("计算失败", null, { hk: "3Vdnhs" });
export const tiaolv_toastFailedWith = (fbs: FbsRuntime, p?: StringParams) => fbs._("计算失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "a2ZO3" });
export const tiaolv_colAttr = (fbs: FbsRuntime) => fbs._("属性", null, { hk: "noCNT" });
export const tiaolv_colBase = (fbs: FbsRuntime) => fbs._("基础白值", null, { hk: "4iFYJN" });
export const tiaolv_colPanel = (fbs: FbsRuntime) => fbs._("面板白值", null, { hk: "3H5enG" });
export const tiaolv_colFinal = (fbs: FbsRuntime) => fbs._("最终面板", null, { hk: "qlDyp" });
export const grad_entering = (fbs: FbsRuntime) => fbs._("正在进入武库…", null, { hk: "2yCPze" });
export const grad_title = (fbs: FbsRuntime) => fbs._("武库鉴宝", null, { hk: "1YKAoE" });
export const grad_subtitle = (fbs: FbsRuntime) => fbs._("条数50% · 数值30% · 三率20%", null, { hk: "H4vz2" });
export const grad_mingjinNote = (fbs: FbsRuntime) => fbs._("鸣金 · 大外会意流", null, { hk: "3wlS7O" });
export const grad_buildBig = (fbs: FbsRuntime) => fbs._("大外", null, { hk: "3BT7ik" });
export const grad_buildSmall = (fbs: FbsRuntime) => fbs._("小外", null, { hk: "3riH4A" });
export const grad_ringLabel = (fbs: FbsRuntime) => fbs._("毕业率", null, { hk: "4qALNh" });
export const grad_scoreCount = (fbs: FbsRuntime) => fbs._("条数匹配", null, { hk: "oUIuP" });
export const grad_scoreValue = (fbs: FbsRuntime) => fbs._("数值达成", null, { hk: "1My4wU" });
export const grad_scoreRate = (fbs: FbsRuntime) => fbs._("三率达标", null, { hk: "306Jzn" });
export const grad_tier1 = (fbs: FbsRuntime) => fbs._("天人合一", null, { hk: "3SAJVE" });
export const grad_tier2 = (fbs: FbsRuntime) => fbs._("登峰造极", null, { hk: "m0oc8" });
export const grad_tier3 = (fbs: FbsRuntime) => fbs._("炉火纯青", null, { hk: "Cr36S" });
export const grad_tier4 = (fbs: FbsRuntime) => fbs._("小有所成", null, { hk: "1iQn5m" });
export const grad_tier5 = (fbs: FbsRuntime) => fbs._("初窥门径", null, { hk: "1Ipn2V" });
export const grad_tier6 = (fbs: FbsRuntime) => fbs._("凡铁未炼", null, { hk: "3ezFfZ" });
export const grad_tapHint = (fbs: FbsRuntime) => fbs._("轻触装备以镌刻词条", null, { hk: "4wrJe0" });
export const grad_refTitle = (fbs: FbsRuntime) => fbs._("📖 参考数据 · 词条满值与版位", null, { hk: "3HJgKL" });
export const grad_maxTableTitle = (fbs: FbsRuntime) => fbs._("词条满值表（100阶）", null, { hk: "1WICFR" });
export const grad_colAffix = (fbs: FbsRuntime) => fbs._("词条", null, { hk: "2NaR9w" });
export const grad_colMax = (fbs: FbsRuntime) => fbs._("满值", null, { hk: "3nDQ4U" });
export const grad_colResonance = (fbs: FbsRuntime) => fbs._("承音（95%)", null, { hk: "4C2lgK" });
export const grad_slotTableTitle = (fbs: FbsRuntime, p?: StringParams) => fbs._("部位版位表（{build}）", [fbs._param("build", pv(p, "build"))], { hk: "4BTyqK" });
export const grad_rateTitle = (fbs: FbsRuntime) => fbs._("⚡ 三率速算", null, { hk: "4w8MPV" });
export const grad_rateOk = (fbs: FbsRuntime, p?: StringParams) => fbs._("{v} ✓", [fbs._param("v", pv(p, "v"))], { hk: "XgX4Q" });
export const grad_rateGap = (fbs: FbsRuntime, p?: StringParams) => fbs._("{v} （差{gap}）", [fbs._param("v", pv(p, "v")), fbs._param("gap", pv(p, "gap"))], { hk: "HW6KB" });
export const grad_rateOverflow = (fbs: FbsRuntime, p?: StringParams) => fbs._("⚠️ 会心+会意={sum}>100，会意挤占会心", [fbs._param("sum", pv(p, "sum"))], { hk: "1MUsl9" });
export const grad_compareTitle = (fbs: FbsRuntime) => fbs._("⚔️ 方案对比", null, { hk: "Fbrco" });
export const grad_saveScheme = (fbs: FbsRuntime) => fbs._("💾 保存当前配装为方案", null, { hk: "EqMJN" });
export const grad_schemeName = (fbs: FbsRuntime, p?: StringParams) => fbs._("方案{n}", [fbs._param("n", pv(p, "n"))], { hk: "3WmGLj" });
export const grad_noSchemes = (fbs: FbsRuntime) => fbs._("暂无方案，先填好装备再保存", null, { hk: "3qx0B6" });
export const grad_load = (fbs: FbsRuntime) => fbs._("载入", null, { hk: "90tyr" });
export const grad_deleteScheme = (fbs: FbsRuntime) => fbs._("删除方案", null, { hk: "35SvRp" });
export const grad_itemScore = (fbs: FbsRuntime, p?: StringParams) => fbs._("本件 {score}%", [fbs._param("score", pv(p, "score"))], { hk: "3hb6jW" });
export const grad_rowMain = (fbs: FbsRuntime) => fbs._("主词条", null, { hk: "4039TQ" });
export const grad_rowSub = (fbs: FbsRuntime, p?: StringParams) => fbs._("副词条{n}", [fbs._param("n", pv(p, "n"))], { hk: "1ZmIHC" });
export const grad_rowResonance = (fbs: FbsRuntime) => fbs._("定音", null, { hk: "1DqEt" });
export const grad_ratePrecision = (fbs: FbsRuntime) => fbs._("精准", null, { hk: "2MKnS1" });
export const grad_rateCrit = (fbs: FbsRuntime) => fbs._("会心", null, { hk: "eHIz6" });
export const grad_rateAffinity = (fbs: FbsRuntime) => fbs._("会意", null, { hk: "3xLqfY" });
export const grad_affixPlaceholder = (fbs: FbsRuntime) => fbs._("— 待镌刻 —", null, { hk: "2AvWZF" });
export const grad_affixLoading = (fbs: FbsRuntime) => fbs._("词条数据加载中…", null, { hk: "4thrrD" });
export const grad_valuePlaceholderMax = (fbs: FbsRuntime, p?: StringParams) => fbs._("数值 / {max}", [fbs._param("max", pv(p, "max"))], { hk: "4bDnGK" });
export const grad_valuePlaceholder = (fbs: FbsRuntime) => fbs._("数值", null, { hk: "4yLexg" });
export const grad_resonance = (fbs: FbsRuntime) => fbs._("承音", null, { hk: "3vbPF7" });
export const grad_overMax = (fbs: FbsRuntime, p?: StringParams) => fbs._("超过满值 {max}，将按满值计算", [fbs._param("max", pv(p, "max"))], { hk: "18mSy1" });
export const grad_toastSaved = (fbs: FbsRuntime, p?: StringParams) => fbs._("已保存方案「{name}」", [fbs._param("name", pv(p, "name"))], { hk: "7yLNO" });
export const grad_toastLoaded = (fbs: FbsRuntime, p?: StringParams) => fbs._("已载入方案「{name}」", [fbs._param("name", pv(p, "name"))], { hk: "3bhiYV" });
export const grad_toastOldScheme = (fbs: FbsRuntime) => fbs._("旧方案只保存了分数，无法载入配装", null, { hk: "29pTqN" });
export const gear_calcLabel = (fbs: FbsRuntime) => fbs._("计算", null, { hk: "1aRID7" });
export const gear_benchTitle = (fbs: FbsRuntime) => fbs._("配装台", null, { hk: "xV7Ak" });
export const gear_benchIntro = (fbs: FbsRuntime) => fbs._("100 阶配装：按流派配方拼装备、算面板与毕业度（口径：条数 40% + 数值 24% + 定音 20%，与上方毕业计算的口径不同）。装备库与方案保存在你的 Discord 账号下，换设备也能用。", null, { hk: "4FrURU" });
export const gear_targetLabel = (fbs: FbsRuntime) => fbs._("目标流派", null, { hk: "ofvp4" });
export const gear_bowLabel = (fbs: FbsRuntime) => fbs._("弓玦", null, { hk: "KjmP8" });
export const gear_bowNoneLabel = (fbs: FbsRuntime) => fbs._("无", null, { hk: "2nEMjT" });
export const gear_extrasTitle = (fbs: FbsRuntime) => fbs._("其他来源加成", null, { hk: "n8tcr" });
export const gear_resLabel = (fbs: FbsRuntime) => fbs._("抗性", null, { hk: "2Ca0ZE" });
export const gear_extraAccLabel = (fbs: FbsRuntime) => fbs._("白字精准（手填）", null, { hk: "3GmGzX" });
export const gear_extraCritLabel = (fbs: FbsRuntime) => fbs._("白字会心（手填）", null, { hk: "1PRprt" });
export const gear_extraIntLabel = (fbs: FbsRuntime) => fbs._("白字会意（手填）", null, { hk: "1Bwnm4" });
export const gear_baseTitle = (fbs: FbsRuntime) => fbs._("角色基础", null, { hk: "FhgNQ" });
export const gear_unlockLabel = (fbs: FbsRuntime) => fbs._("解锁", null, { hk: "2w8W0N" });
export const gear_lockLabel = (fbs: FbsRuntime) => fbs._("锁定", null, { hk: "4bUGzs" });
export const gear_modifiedTag = (fbs: FbsRuntime) => fbs._("已改", null, { hk: "cfGmb" });
export const gear_baseResetLabel = (fbs: FbsRuntime) => fbs._("恢复预设", null, { hk: "2ySVXD" });
export const gear_baseResetTitle = (fbs: FbsRuntime) => fbs._("恢复预设？", null, { hk: "WAuLx" });
export const gear_baseResetBody = (fbs: FbsRuntime) => fbs._("角色基础将回到预设值，心法选择保留。", null, { hk: "10ij5y" });
export const gear_xinfaLabelTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("心法 {n}", [fbs._param("n", pv(p, "n"))], { hk: "30Vk1l" });
export const gear_xinfaNoneLabel = (fbs: FbsRuntime) => fbs._("— 不选 —", null, { hk: "3fFxbP" });
export const gear_loginHint = (fbs: FbsRuntime) => fbs._("装备库与方案按你的 Discord 账号保存，登录后可用（计算与参考数据无需登录）。", null, { hk: "3u96RC" });
export const gear_libTitle = (fbs: FbsRuntime) => fbs._("装备库", null, { hk: "2FouLg" });
export const gear_myLibTitle = (fbs: FbsRuntime) => fbs._("我的装备库", null, { hk: "A4N7v" });
export const gear_myBuildsTitle = (fbs: FbsRuntime) => fbs._("我的方案", null, { hk: "oYfJC" });
export const gear_libCountTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("共 {n} 件", [fbs._param("n", pv(p, "n"))], { hk: "4dqmLi" });
export const gear_usageTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("已存 {n} / {limit} 件", [fbs._param("n", pv(p, "n")), fbs._param("limit", pv(p, "limit"))], { hk: "14arWz" });
export const gear_usageNearLimitText = (fbs: FbsRuntime) => fbs._("装备库快满了，导入新装备前先清理不用的装备", null, { hk: "TKOLJ" });
export const gear_formSlotLabel = (fbs: FbsRuntime) => fbs._("部位", null, { hk: "2nHDWF" });
export const gear_formNameLabel = (fbs: FbsRuntime) => fbs._("名称", null, { hk: "3UMf5l" });
export const gear_formNamePlaceholder = (fbs: FbsRuntime) => fbs._("装备名（可空）", null, { hk: "AZbHw" });
export const gear_affixPlaceholder = (fbs: FbsRuntime) => fbs._("选词条", null, { hk: "1Wkt45" });
export const gear_valuePlaceholder = (fbs: FbsRuntime) => fbs._("数值", null, { hk: "4bVApC" });
export const gear_refTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("满值 {max} / 承音 {cy}", [fbs._param("max", pv(p, "max")), fbs._param("cy", pv(p, "cy"))], { hk: "1oASEI" });
export const gear_fillMaxLabel = (fbs: FbsRuntime) => fbs._("填满值", null, { hk: "uHbxV" });
export const gear_fillCyLabel = (fbs: FbsRuntime) => fbs._("填承音", null, { hk: "21iPzc" });
export const gear_delRowLabel = (fbs: FbsRuntime) => fbs._("删此行", null, { hk: "15NlRe" });
export const gear_addRowLabel = (fbs: FbsRuntime) => fbs._("加一行", null, { hk: "4gLm2J" });
export const gear_dyNameLabel = (fbs: FbsRuntime) => fbs._("定音名称", null, { hk: "4yKdQY" });
export const gear_dyNamePlaceholder = (fbs: FbsRuntime) => fbs._("如 外功穿透 / 无名剑法·蓄力技增伤", null, { hk: "1lW5CU" });
export const gear_dyValLabel = (fbs: FbsRuntime) => fbs._("定音数值", null, { hk: "1vldLG" });
export const gear_schoolsLabel = (fbs: FbsRuntime) => fbs._("流派标签（武器）", null, { hk: "4deRBf" });
export const gear_addGearLabel = (fbs: FbsRuntime) => fbs._("存入装备库", null, { hk: "3eQWgn" });
export const gear_updateGearLabel = (fbs: FbsRuntime) => fbs._("保存修改", null, { hk: "BMHBd" });
export const gear_cancelEditLabel = (fbs: FbsRuntime) => fbs._("取消编辑", null, { hk: "1Myz8a" });
export const gear_demoLabel = (fbs: FbsRuntime) => fbs._("载入示例套", null, { hk: "Fv7hR" });
export const gear_clearLibLabel = (fbs: FbsRuntime) => fbs._("清空装备库", null, { hk: "srSxX" });
export const gear_clearConfirmTitle = (fbs: FbsRuntime) => fbs._("清空装备库？", null, { hk: "OEBtJ" });
export const gear_clearConfirmBody = (fbs: FbsRuntime) => fbs._("你账号下的全部装备与方案都会删除，当前搭配也会清空，此操作不可恢复。", null, { hk: "dKYe8" });
export const gear_equipLabel = (fbs: FbsRuntime) => fbs._("选入", null, { hk: "2Yg5wt" });
export const gear_unequipLabel = (fbs: FbsRuntime) => fbs._("卸下", null, { hk: "4AjWug" });
export const gear_editLabel = (fbs: FbsRuntime) => fbs._("编辑", null, { hk: "32n69o" });
export const gear_deleteLabel = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "c1mL3" });
export const gear_simLabel = (fbs: FbsRuntime) => fbs._("模拟", null, { hk: "2a3nN4" });
export const gear_simRealLabel = (fbs: FbsRuntime) => fbs._("实际", null, { hk: "3LTN4z" });
export const gear_simCyLabel = (fbs: FbsRuntime) => fbs._("承音", null, { hk: "45Y22o" });
export const gear_simMaxLabel = (fbs: FbsRuntime) => fbs._("满值", null, { hk: "1FlRGr" });
export const gear_verdictHeirloom = (fbs: FbsRuntime) => fbs._("传家宝", null, { hk: "1L6ezu" });
export const gear_verdictDud = (fbs: FbsRuntime) => fbs._("拉完了", null, { hk: "2pY7yO" });
export const gear_scoreTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("评分 {score}", [fbs._param("score", pv(p, "score"))], { hk: "1jxQq3" });
export const gear_qualityLabel = (fbs: FbsRuntime) => fbs._("数值达成", null, { hk: "2JTaSy" });
export const gear_exportLabel = (fbs: FbsRuntime) => fbs._("导出数据", null, { hk: "2UNh9T" });
export const gear_exportFileName = (fbs: FbsRuntime) => fbs._("100阶配装数据.json", null, { hk: "2G9bMH" });
export const gear_importNameTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("导入 · {slot}", [fbs._param("slot", pv(p, "slot"))], { hk: "eDscX" });
export const gear_importLabel = (fbs: FbsRuntime) => fbs._("导入数据", null, { hk: "11MH1n" });
export const gear_importFailedToast = (fbs: FbsRuntime) => fbs._("导入失败：文件无效", null, { hk: "1r5Y0C" });
export const gear_importedToastTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("已导入 {n} 件", [fbs._param("n", pv(p, "n"))], { hk: "2tzLQy" });
export const gear_manualTitle = (fbs: FbsRuntime) => fbs._("手动录入", null, { hk: "4cfwWe" });
export const gear_pasteTitle = (fbs: FbsRuntime) => fbs._("粘贴代码导入", null, { hk: "tzTTU" });
export const gear_pastePlaceholder = (fbs: FbsRuntime) => fbs._("把装备数据代码粘到这里（JSON / Base64 / 文本均可）", null, { hk: "xDIFv" });
export const gear_pasteButtonLabel = (fbs: FbsRuntime) => fbs._("解析并导入装备库", null, { hk: "1365Ci" });
export const gear_pasteDemoLabel = (fbs: FbsRuntime) => fbs._("填入示例代码", null, { hk: "2UGw5W" });
export const gear_pasteEmptyText = (fbs: FbsRuntime) => fbs._("先把代码粘到上面的框里再点解析。", null, { hk: "1zStWX" });
export const gear_pasteOkTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("✓ 已按「{mode}」解析，导入 {n} 件装备 / {lines} 条词条，已自动选入搭配。", [
	fbs._param("mode", pv(p, "mode")),
	fbs._param("n", pv(p, "n")),
	fbs._param("lines", pv(p, "lines"))
], { hk: "3TvlF3" });
export const gear_pasteUnknownTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("另有 {n} 条没认出的字段被跳过（多半是气血、防御、外功穿透这类本站不计的词条）。", [fbs._param("n", pv(p, "n"))], { hk: "1pzLGI" });
export const gear_pasteFailText = (fbs: FbsRuntime) => fbs._("没能从这段代码里认出装备。常见原因：复制时漏了一头一尾、复制的是角色外观分享码（不含装备数值）、或这份数据的字段格式本站还没适配。", null, { hk: "12hDaE" });
export const gear_pasteFullText = (fbs: FbsRuntime) => fbs._("识别为本工具导出的数据，已按整库导入处理。", null, { hk: "3djBXp" });
export const gear_ocrTitle = (fbs: FbsRuntime) => fbs._("截图导入（本地识别，不上传）", null, { hk: "4he1Ia" });
export const gear_ocrDropText = (fbs: FbsRuntime) => fbs._("点这里选一张装备详情截图，或拖进来 / Ctrl+V 粘贴", null, { hk: "2wE8JE" });
export const gear_ocrPreparingText = (fbs: FbsRuntime) => fbs._("正在准备图片…", null, { hk: "1JReqb" });
export const gear_ocrRunningText = (fbs: FbsRuntime) => fbs._("正在识别（首次会下载中文 + 英文识别包，可能要十几秒）…", null, { hk: "Megq5" });
export const gear_ocrSecondText = (fbs: FbsRuntime) => fbs._("正在增强识别（第二遍）…", null, { hk: "32Gfzw" });
export const gear_ocrFailedText = (fbs: FbsRuntime) => fbs._("识别失败了。常见原因：网络不通下不到识别包、图片太模糊。可以换一张更清晰、完整的详情页截图再试。", null, { hk: "2caDTE" });
export const gear_ocrBadTypeText = (fbs: FbsRuntime) => fbs._("这张图格式不对，只支持 PNG / JPEG / WebP 截图。", null, { hk: "1t58Gw" });
export const gear_ocrTooBigText = (fbs: FbsRuntime) => fbs._("图片超过 15MB，换一张小一点的截图。", null, { hk: "apjJ9" });
export const gear_ocrNoEngineText = (fbs: FbsRuntime) => fbs._("识别组件没能加载（OCR 引擎需要联网从 CDN 载入）。检查网络后刷新页面再试；粘贴代码导入不受影响。", null, { hk: "4s1JWz" });
export const gear_ocrDoneTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("✓ 识别完成：认出 {n} 条词条{slotPart}{dyPart}。请逐行核对数值再确认存入。", [
	fbs._param("n", pv(p, "n")),
	fbs._param("slotPart", pv(p, "slotPart")),
	fbs._param("dyPart", pv(p, "dyPart"))
], { hk: "3pu4xT" });
export const gear_ocrSlotLabel = (fbs: FbsRuntime) => fbs._("部位", null, { hk: "2vtNYu" });
export const gear_ocrNameLabel = (fbs: FbsRuntime) => fbs._("名称", null, { hk: "21W74m" });
export const gear_ocrEquipLabel = (fbs: FbsRuntime) => fbs._("存入后直接选入搭配", null, { hk: "2uDtWg" });
export const gear_ocrConfirmLabel = (fbs: FbsRuntime) => fbs._("确认存入", null, { hk: "1NUNBe" });
export const gear_ocrCancelLabel = (fbs: FbsRuntime) => fbs._("放弃", null, { hk: "1AREGh" });
export const gear_ocrUnknownTitle = (fbs: FbsRuntime) => fbs._("下面这些行没认出词条，已原样列出（不会丢行）：需要的话点「补一条词条行」手动加上；纯界面文字可忽略。", null, { hk: "22byy9" });
export const gear_ocrSavedTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("✓ 已存入装备库：{slot}（{n} 条词条）", [fbs._param("slot", pv(p, "slot")), fbs._param("n", pv(p, "n"))], { hk: "2Y7DZ9" });
export const gear_ocrNeedLineToast = (fbs: FbsRuntime) => fbs._("至少保留一条有效词条再确认", null, { hk: "2NYbzl" });
export const gear_ocrLowConfTag = (fbs: FbsRuntime) => fbs._("低置信，请核对", null, { hk: "p6RHx" });
export const gear_ocrAddRowLabel = (fbs: FbsRuntime) => fbs._("补一条词条行", null, { hk: "2A2hxa" });
export const gear_ocrImportSlotTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("导入{slot}", [fbs._param("slot", pv(p, "slot"))], { hk: "37AvPx" });
export const gear_ocrBatchTitle = (fbs: FbsRuntime) => fbs._("批量截图识别（全屏截图自动框选 · 本地识别，不上传）", null, { hk: "2dPWCw" });
export const gear_ocrBatchDropText = (fbs: FbsRuntime) => fbs._("把多张截图拖到这里，或点选多张 / Ctrl+V 粘贴（全屏截图也可以，会自动找装备面板）", null, { hk: "14JKsM" });
export const gear_ocrBatchQueuedText = (fbs: FbsRuntime) => fbs._("排队中", null, { hk: "4j9SNv" });
export const gear_ocrBatchRunningText = (fbs: FbsRuntime) => fbs._("识别中…", null, { hk: "5ll73" });
export const gear_ocrBatchReadyText = (fbs: FbsRuntime) => fbs._("待核对", null, { hk: "gEgku" });
export const gear_ocrBatchFailedText = (fbs: FbsRuntime) => fbs._("识别失败", null, { hk: "2xOaVH" });
export const gear_ocrBatchImportedText = (fbs: FbsRuntime) => fbs._("已导入", null, { hk: "1i03os" });
export const gear_ocrBatchRetryLabel = (fbs: FbsRuntime) => fbs._("重试", null, { hk: "2pJUKV" });
export const gear_ocrBatchRemoveLabel = (fbs: FbsRuntime) => fbs._("移除", null, { hk: "432BTD" });
export const gear_ocrBatchAdjustLabel = (fbs: FbsRuntime) => fbs._("调整框选", null, { hk: "3kmezA" });
export const gear_ocrBatchApplyBoxLabel = (fbs: FbsRuntime) => fbs._("按此框重新识别", null, { hk: "16nOQJ" });
export const gear_ocrBatchDetectedText = (fbs: FbsRuntime) => fbs._("已自动框选面板", null, { hk: "3lhoLC" });
export const gear_ocrBatchFullImageText = (fbs: FbsRuntime) => fbs._("未定位到面板，按整图识别", null, { hk: "zgJk1" });
export const gear_ocrBatchDupTag = (fbs: FbsRuntime) => fbs._("重复", null, { hk: "1M2eWy" });
export const gear_ocrBatchDupLibText = (fbs: FbsRuntime) => fbs._("与装备库已有装备相同，默认不导入", null, { hk: "3iXudr" });
export const gear_ocrBatchDupRowText = (fbs: FbsRuntime) => fbs._("与本批另一张相同，默认不导入", null, { hk: "3omFiC" });
export const gear_ocrBatchIncludeLabel = (fbs: FbsRuntime) => fbs._("导入这件", null, { hk: "Q4m8y" });
export const gear_ocrBatchNoLinesText = (fbs: FbsRuntime) => fbs._("没认出词条：请核对部位、补词条行，或调整框选后重新识别（不会自动丢弃）", null, { hk: "46t06c" });
export const gear_ocrBatchImportTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("全部导入（{n} 件）", [fbs._param("n", pv(p, "n"))], { hk: "Xng2n" });
export const gear_ocrBatchResultTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("✓ 批量导入完成：已导入 {n} 件，跳过 {m} 件。", [fbs._param("n", pv(p, "n")), fbs._param("m", pv(p, "m"))], { hk: "47aPcw" });
export const gear_libEmptyText = (fbs: FbsRuntime) => fbs._("装备库是空的。手动录入、粘贴代码或截图识别都可以加装备。", null, { hk: "3Sju8" });
export const gear_equippedTag = (fbs: FbsRuntime) => fbs._("已选入", null, { hk: "2UnzQi" });
export const gear_loadoutTitle = (fbs: FbsRuntime) => fbs._("组合搭配 · 8 个部位", null, { hk: "1Dukgy" });
export const gear_autoLabel = (fbs: FbsRuntime) => fbs._("一键最优组合", null, { hk: "1ozTNQ" });
export const gear_autoDoneToast = (fbs: FbsRuntime) => fbs._("已拼好", null, { hk: "34zrxB" });
export const gear_autoFallbackToast = (fbs: FbsRuntime) => fbs._("已拼好（含兜底选装）", null, { hk: "3W1PdI" });
export const gear_unequipAllLabel = (fbs: FbsRuntime) => fbs._("全部卸下", null, { hk: "2M6ydF" });
export const gear_slotEmptyText = (fbs: FbsRuntime) => fbs._("未选", null, { hk: "hZuYv" });
export const gear_panelTitle = (fbs: FbsRuntime) => fbs._("面板与毕业度", null, { hk: "1PSnlC" });
export const gear_gradLabel = (fbs: FbsRuntime) => fbs._("毕业度", null, { hk: "XWnvJ" });
export const gear_gradCountLabel = (fbs: FbsRuntime) => fbs._("条数", null, { hk: "3SSOv7" });
export const gear_gradValueLabel = (fbs: FbsRuntime) => fbs._("数值", null, { hk: "omfZz" });
export const gear_gradDyLabel = (fbs: FbsRuntime) => fbs._("定音", null, { hk: "1YUU6w" });
export const gear_gradDyToggleLabel = (fbs: FbsRuntime) => fbs._("定音计入毕业度", null, { hk: "JaWlW" });
export const gear_loanLabel = (fbs: FbsRuntime) => fbs._("满值模拟（全套满值时的毕业度）", null, { hk: "20sU6k" });
export const gear_simActiveTag = (fbs: FbsRuntime) => fbs._("模拟中", null, { hk: "1MQjPE" });
export const gear_copySummaryLabel = (fbs: FbsRuntime) => fbs._("复制摘要", null, { hk: "11iHBM" });
export const gear_copiedToast = (fbs: FbsRuntime) => fbs._("已复制", null, { hk: "2zUpTT" });
export const gear_copyFailedToast = (fbs: FbsRuntime) => fbs._("复制失败，请手动记录", null, { hk: "SrcNK" });
export const gear_yAccLabel = (fbs: FbsRuntime) => fbs._("黄字精准", null, { hk: "lnOHm" });
export const gear_yCritLabel = (fbs: FbsRuntime) => fbs._("黄字会心", null, { hk: "220BJY" });
export const gear_yIntLabel = (fbs: FbsRuntime) => fbs._("黄字会意", null, { hk: "4fDDnu" });
export const gear_finalCritLabel = (fbs: FbsRuntime) => fbs._("最终会心", null, { hk: "3OOw10" });
export const gear_whiteLabel = (fbs: FbsRuntime) => fbs._("白字", null, { hk: "1mnVjv" });
export const gear_dawaiLabel = (fbs: FbsRuntime) => fbs._("大外", null, { hk: "3VwXH3" });
export const gear_xiaowaiLabel = (fbs: FbsRuntime) => fbs._("小外", null, { hk: "3QmSF8" });
export const gear_dashuLabel = (fbs: FbsRuntime) => fbs._("大属", null, { hk: "1UhTwk" });
export const gear_xiaoshuLabel = (fbs: FbsRuntime) => fbs._("小属", null, { hk: "2liA7S" });
export const gear_hpLabel = (fbs: FbsRuntime) => fbs._("气血", null, { hk: "3EvmFQ" });
export const gear_defLabel = (fbs: FbsRuntime) => fbs._("防御", null, { hk: "2DWgOi" });
export const gear_talentLabel = (fbs: FbsRuntime) => fbs._("天赋", null, { hk: "1FFk6" });
export const gear_diffTitle = (fbs: FbsRuntime) => fbs._("差缺清单：离毕业还差什么", null, { hk: "1Y55PI" });
export const gear_diffLackTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("还差 {n}", [fbs._param("n", pv(p, "n"))], { hk: "4jc9n3" });
export const gear_diffExactText = (fbs: FbsRuntime) => fbs._("正好", null, { hk: "3nm7RE" });
export const gear_diffOverTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("多 {n}", [fbs._param("n", pv(p, "n"))], { hk: "116Box" });
export const gear_diffExtraTitle = (fbs: FbsRuntime) => fbs._("配方外", null, { hk: "1mEvBD" });
export const gear_diffLowTitle = (fbs: FbsRuntime) => fbs._("未满承音的词条", null, { hk: "3bYQC5" });
export const gear_diffDoneText = (fbs: FbsRuntime) => fbs._("✓ 毕业。", null, { hk: "2seKVt" });
export const gear_diffEmptyText = (fbs: FbsRuntime) => fbs._("还没选装备。", null, { hk: "zfH4b" });
export const gear_diffInvalidTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("异常：{n} 条无相在非武器部位，未计入。", [fbs._param("n", pv(p, "n"))], { hk: "11mbb9" });
export const gear_suggestTitle = (fbs: FbsRuntime) => fbs._("建议", null, { hk: "ZJoAq" });
export const gear_suggestSwapTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{slot}：换上「{name}」", [fbs._param("slot", pv(p, "slot")), fbs._param("name", pv(p, "name"))], { hk: "48xOE9" });
export const gear_suggestWashTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{slot}：把第 {line} 条 {from} 洗成 {to}", [
	fbs._param("slot", pv(p, "slot")),
	fbs._param("line", pv(p, "line")),
	fbs._param("from", pv(p, "from")),
	fbs._param("to", pv(p, "to"))
], { hk: "2AeIGN" });
export const gear_suggestNoneText = (fbs: FbsRuntime) => fbs._("这套暂时挑不出毛病", null, { hk: "b5UiR" });
export const gear_suggestHeadTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("当前 {cur}% → 全做 {final}%", [fbs._param("cur", pv(p, "cur")), fbs._param("final", pv(p, "final"))], { hk: "LKLcu" });
export const gear_dySummaryTitle = (fbs: FbsRuntime) => fbs._("定音汇总", null, { hk: "Wwjis" });
export const gear_dyCorrectText = (fbs: FbsRuntime) => fbs._("对", null, { hk: "4jg9q0" });
export const gear_dyWrongText = (fbs: FbsRuntime) => fbs._("类型不符", null, { hk: "4dbj9T" });
export const gear_schemeTitle = (fbs: FbsRuntime) => fbs._("配装方案对比", null, { hk: "24w423" });
export const gear_schemeSaveLabel = (fbs: FbsRuntime) => fbs._("存为方案", null, { hk: "2n0kax" });
export const gear_schemeNameTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("方案 {n}", [fbs._param("n", pv(p, "n"))], { hk: "1LsRaz" });
export const gear_schemeLoadLabel = (fbs: FbsRuntime) => fbs._("载入", null, { hk: "1GZWB5" });
export const gear_schemeDeleteLabel = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "1OVebv" });
export const gear_schemeEmptyText = (fbs: FbsRuntime) => fbs._("还没有保存的方案。", null, { hk: "3Dv0iv" });
export const gear_schemeComposeFirstText = (fbs: FbsRuntime) => fbs._("先在配装台拼好一套搭配，才能存为方案。", null, { hk: "3cPed2" });
export const gear_schemeSavedToastTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("已存方案：{name}", [fbs._param("name", pv(p, "name"))], { hk: "41ODrs" });
export const gear_schemeLoadedToastTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("已载入：{name}", [fbs._param("name", pv(p, "name"))], { hk: "W68Jt" });
export const gear_schemeGroupCountTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{n} 套", [fbs._param("n", pv(p, "n"))], { hk: "rq7r4" });
export const gear_shareLabel = (fbs: FbsRuntime) => fbs._("分享", null, { hk: "4uur5j" });
export const gear_revokeShareLabel = (fbs: FbsRuntime) => fbs._("取消分享", null, { hk: "4jIgn4" });
export const gear_copyLinkLabel = (fbs: FbsRuntime) => fbs._("复制链接", null, { hk: "3R32rG" });
export const gear_shareRevokedToast = (fbs: FbsRuntime) => fbs._("已取消分享，旧链接已失效", null, { hk: "N75Vo" });
export const gear_quickTitle = (fbs: FbsRuntime) => fbs._("三率速算器", null, { hk: "4hmlhM" });
export const gear_quickResLabel = (fbs: FbsRuntime) => fbs._("抗性", null, { hk: "4ug56e" });
export const gear_quickSyncLabel = (fbs: FbsRuntime) => fbs._("从配装台同步", null, { hk: "3vKwDX" });
export const gear_quickSyncedToast = (fbs: FbsRuntime) => fbs._("已同步", null, { hk: "1nd9Db" });
export const gear_quickOkText = (fbs: FbsRuntime) => fbs._("✓ 已满值", null, { hk: "ArP85" });
export const gear_quickOverTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("，溢出 {v}%", [fbs._param("v", pv(p, "v"))], { hk: "4vzSWK" });
export const gear_quickGapTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("还差白字 {lack}%（满值 {need}%）≈ {bars} 条{barName}", [
	fbs._param("lack", pv(p, "lack")),
	fbs._param("need", pv(p, "need")),
	fbs._param("bars", pv(p, "bars")),
	fbs._param("barName", pv(p, "barName"))
], { hk: "3ZUzwO" });
export const gear_recipesTitle = (fbs: FbsRuntime) => fbs._("全流派配方表（100 阶 · 承音）", null, { hk: "4eOSkF" });
export const gear_recipeSearchPlaceholder = (fbs: FbsRuntime) => fbs._("搜流派 / 套装 / 词条", null, { hk: "2bFACa" });
export const gear_recipeAllLabel = (fbs: FbsRuntime) => fbs._("全部", null, { hk: "2BF0OX" });
export const gear_recipeColCat = (fbs: FbsRuntime) => fbs._("类别", null, { hk: "bEwu7" });
export const gear_recipeColSchool = (fbs: FbsRuntime) => fbs._("流派", null, { hk: "aikUV" });
export const gear_recipeColSet = (fbs: FbsRuntime) => fbs._("套装", null, { hk: "2aBJlS" });
export const gear_recipeColRecipe = (fbs: FbsRuntime) => fbs._("词条搭配（承音）", null, { hk: "3NuAqA" });
export const gear_recipeColBow = (fbs: FbsRuntime) => fbs._("推荐弓", null, { hk: "2NPGMB" });
export const gear_recipeSetTargetLabel = (fbs: FbsRuntime) => fbs._("设为目标", null, { hk: "2V7kT5" });
export const gear_recipeEmptyText = (fbs: FbsRuntime) => fbs._("没有符合的配方。", null, { hk: "16419y" });
export const gear_recipeTargetToastTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("目标已设为：{school} · {set}", [fbs._param("school", pv(p, "school")), fbs._param("set", pv(p, "set"))], { hk: "1ym6rV" });
export const gear_sectRecipesTitle = (fbs: FbsRuntime) => fbs._("100 阶配方（配装台口径）", null, { hk: "nem3e" });
export const gear_affixTableTitle = (fbs: FbsRuntime) => fbs._("词条满值 / 承音对照表（配装台）", null, { hk: "1sybNi" });
export const gear_colCyLabel = (fbs: FbsRuntime) => fbs._("承音", null, { hk: "1wFQ8r" });
export const gear_colCyPctLabel = (fbs: FbsRuntime) => fbs._("承音/满值", null, { hk: "vDqbT" });
export const gear_colRecipeNamesLabel = (fbs: FbsRuntime) => fbs._("配方叫法", null, { hk: "4sGUa0" });
export const gear_survivalNote = (fbs: FbsRuntime) => fbs._("生存向，配方未列", null, { hk: "Q0Gly" });
export const gear_slotTableTitle = (fbs: FbsRuntime) => fbs._("部位版位表（配装台）", null, { hk: "124Cv2" });
export const gear_slotsBigTitle = (fbs: FbsRuntime) => fbs._("大外流派", null, { hk: "1Mdh3Y" });
export const gear_slotsSmallTitle = (fbs: FbsRuntime) => fbs._("小外流派", null, { hk: "4fWfYT" });
export const gear_formulaTitle = (fbs: FbsRuntime) => fbs._("公式与五维换算速查", null, { hk: "2AmvnH" });
export const gear_formulaRatesTitle = (fbs: FbsRuntime) => fbs._("三率换算", null, { hk: "36x5K2" });
export const gear_formulaDimsTitle = (fbs: FbsRuntime) => fbs._("五维换算（每 1 点）", null, { hk: "398SdZ" });
export const gear_formulaOrderTitle = (fbs: FbsRuntime) => fbs._("选装顺序", null, { hk: "3TN9lj" });
export const gear_formulaAccTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("黄字精准 = 65% +（白字精准 − 65%）÷ 抗性，白字 {white}% 满值 100%。", [fbs._param("white", pv(p, "white"))], { hk: "2QRxtO" });
export const gear_formulaCritTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("黄字会心 = 白字会心 ÷ 抗性，白字 {white}% 满值 80%。", [fbs._param("white", pv(p, "white"))], { hk: "3mZJ4Q" });
export const gear_formulaIntTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("黄字会意 = 白字会意 ÷ 抗性，白字 {white}% 满值 40%。", [fbs._param("white", pv(p, "white"))], { hk: "4jf3vw" });
export const gear_formulaBarsTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("差几条估算（按承音每条）：精准 {acc} / 会心 {crit} / 会意 {int}；敏补会心 ≈ +{minCrit}% 白字 / 条，势补会意 ≈ +{shiInt}% 白字 / 条。", [
	fbs._param("acc", pv(p, "acc")),
	fbs._param("crit", pv(p, "crit")),
	fbs._param("int", pv(p, "int")),
	fbs._param("minCrit", pv(p, "minCrit")),
	fbs._param("shiInt", pv(p, "shiInt"))
], { hk: "3wCeJ7" });
export const gear_formulaBowTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("弓（弓玦）加成计入白字：精准弓 白字精准 +{acc} / 会心弓 白字会心 +{crit} / 会意弓 白字会意 +{int}，再按抗性换算黄字。抗性 {res}（当前版本）。", [
	fbs._param("acc", pv(p, "acc")),
	fbs._param("crit", pv(p, "crit")),
	fbs._param("int", pv(p, "int")),
	fbs._param("res", pv(p, "res"))
], { hk: "2jXSxc" });
export const gear_formulaOrderText = (fbs: FbsRuntime) => fbs._("定流派 → 对配方 → 录装备。一键最优拼一版 → 看差缺清单补缺。精准先堆满 100%；会心 148% / 会意 74% 封顶，溢出换劲 / 势 / 增伤。两套拿不准，存方案比总分。", null, { hk: "41EKgU" });
export const gear_colDimLabel = (fbs: FbsRuntime) => fbs._("五维", null, { hk: "2GVUI6" });
export const gear_colConvLabel = (fbs: FbsRuntime) => fbs._("换算", null, { hk: "3pwSMj" });
export const gear_colFullBarTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("满条 {v} 折合", [fbs._param("v", pv(p, "v"))], { hk: "2wSAHA" });
export const gear_calcFailedText = (fbs: FbsRuntime) => fbs._("计算失败，请稍后再试", null, { hk: "1q7ohX" });
export const gear_demoLoadedToast = (fbs: FbsRuntime) => fbs._("示例已载入", null, { hk: "2Rz3og" });
export const gear_savedToastTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("已存入：{name}", [fbs._param("name", pv(p, "name"))], { hk: "49o8pQ" });
export const gear_deletedToast = (fbs: FbsRuntime) => fbs._("已删除", null, { hk: "3QeWNP" });
export const gear_clearedToast = (fbs: FbsRuntime) => fbs._("已清空", null, { hk: "1h6gZJ" });
export const legal_termsTitle = (fbs: FbsRuntime) => fbs._("服务条款", null, { hk: "49ErJ7" });
export const legal_privacyTitle = (fbs: FbsRuntime) => fbs._("隐私政策", null, { hk: "4szxvL" });
export const legal_termsLink = (fbs: FbsRuntime) => fbs._("服务条款", null, { hk: "1Udgt1" });
export const legal_privacyLink = (fbs: FbsRuntime) => fbs._("隐私政策", null, { hk: "2vcnax" });
export const legal_updatedText = (fbs: FbsRuntime) => fbs._("最后更新：2026 年 10 月 25 日", null, { hk: "2kUU24" });
export const legal_disclaimer = (fbs: FbsRuntime) => fbs._("本站为玩家自发维护的非官方工具，与《燕云十六声》及其开发、发行方无隶属或背书关系；游戏名称与相关素材的权利归其各自权利方所有。", null, { hk: "287Ic8" });
export const termsBody_s1h = (fbs: FbsRuntime) => fbs._("关于本站与非官方声明", null, { hk: "1TYN9D" });
export const termsBody_s1b = (fbs: FbsRuntime) => fbs._("燕云百业（yanyun.app）是一个由玩家自发维护的非官方百业（公会）组队工具，与《燕云十六声》及其开发、发行方没有任何隶属或背书关系。本站中出现的游戏名称、副本、流派等资料，其权利归各自权利方所有。", null, { hk: "3jz1fr" });
export const termsBody_s2h = (fbs: FbsRuntime) => fbs._("账号与访问", null, { hk: "3l8iJY" });
export const termsBody_s2b = (fbs: FbsRuntime) => fbs._("本站通过 Discord OAuth 登录。使用本站即表示你同意本条款。你应妥善保管自己的 Discord 账号，通过你的账号进行的操作视为你本人行为。各百业内容的可见与可写范围，由你是否属于该百业绑定的 Discord 服务器决定。", null, { hk: "2pzYOU" });
export const termsBody_s3h = (fbs: FbsRuntime) => fbs._("使用规范", null, { hk: "3Cd00I" });
export const termsBody_s3b = (fbs: FbsRuntime) => fbs._("不得利用本站冒充他人或其它百业、抢注或占用与你无关的百业标识、发布违法或侵权内容、干扰本站运行，或绕过成员校验。车队标题、报名昵称等由用户发布的内容，由发布者自行负责。", null, { hk: "45ajl2" });
export const termsBody_s4h = (fbs: FbsRuntime) => fbs._("服务现状", null, { hk: "1juX4d" });
export const termsBody_s4b = (fbs: FbsRuntime) => fbs._("本站目前免费提供，并按现状（as is）运行。我们不承诺服务持续可用、功能保持不变，或数据永不丢失；功能可能被调整、中断或终止，原则上不另行通知。重要数据请自行留存备份。", null, { hk: "4kqzkf" });
export const termsBody_s5h = (fbs: FbsRuntime) => fbs._("责任限制", null, { hk: "1EfEtr" });
export const termsBody_s5b = (fbs: FbsRuntime) => fbs._("在适用法律允许的最大范围内，本站对因使用或无法使用本站而产生的间接、附带或后果性损失不承担责任。", null, { hk: "1jx5nL" });
export const termsBody_s6h = (fbs: FbsRuntime) => fbs._("条款变更", null, { hk: "CW7ok" });
export const termsBody_s6b = (fbs: FbsRuntime) => fbs._("本条款可能不时更新，更新后的版本在本站公布即生效；你继续使用本站即视为接受更新后的条款。", null, { hk: "1tLVME" });
export const privacyBody_s1h = (fbs: FbsRuntime) => fbs._("我们收集的信息", null, { hk: "3UJylE" });
export const privacyBody_s1b = (fbs: FbsRuntime) => fbs._("当你使用 Discord 登录时，我们会读取并保存：你的 Discord 用户 ID、用户名与头像、你加入的 Discord 服务器列表、你在这些服务器中的昵称，以及用于保持登录状态的 OAuth 授权凭据（refresh token）。你在使用本站过程中产生的数据也会被保存，包括百业名册记录、车队与报名记录（包括座位上的身份标识）、装备库与配装方案、语言偏好，以及你在移动端开启通知后注册的推送令牌。", null, { hk: "1gYexp" });
export const privacyBody_s2h = (fbs: FbsRuntime) => fbs._("我们如何使用信息", null, { hk: "lLMpd" });
export const privacyBody_s2b = (fbs: FbsRuntime) => fbs._("上述信息仅用于：登录与身份识别；校验你是否为某百业所绑定 Discord 服务器的成员；组队报名；发车提醒与应用推送；传家宝达成推送；以及按你的偏好显示语言。我们不出售你的个人数据，也不将其用于广告投放。", null, { hk: "1IEWW8" });
export const privacyBody_s3h = (fbs: FbsRuntime) => fbs._("信息的共享与第三方", null, { hk: "3rkeXO" });
export const privacyBody_s3b = (fbs: FbsRuntime) => fbs._("本站运行在 Cloudflare 的基础设施上，数据存储于其数据库服务；登录与成员校验由 Discord 提供；移动端推送经 Expo 推送服务转发至 Apple 或 Google 的推送通道。发车提醒与传家宝消息会发送到对应百业管理员配置的 Discord 频道，消息中会包含你的游戏昵称。除上述功能所必需的情形外，我们不会向其他第三方提供你的个人数据（法律法规要求除外）。", null, { hk: "1hZmAN" });
export const privacyBody_s4h = (fbs: FbsRuntime) => fbs._("保存期限", null, { hk: "4aN5dD" });
export const privacyBody_s4b = (fbs: FbsRuntime) => fbs._("你的数据保存在本站数据库中，直至你申请删除，或相关数据对本站功能不再需要为止。报名、车队等历史记录目前会持续保留；如保存规则发生变化，我们会更新本政策。", null, { hk: "2a4Dhc" });
export const privacyBody_s5h = (fbs: FbsRuntime) => fbs._("你的权利", null, { hk: "4yKwwR" });
export const privacyBody_s5b = (fbs: FbsRuntime) => fbs._("你可以查询、导出或删除你的个人数据。在「个人资料」的「我的数据」中，你可以自助导出你的全部数据（需通过 Discord 重新验证身份，每 24 小时一次），也可以自助删除账号：提交删除后有 7 天冷静期，期间可随时撤销；到期后你的个人数据会被删除或匿名化——你创建的车队会转为无主车队、你在他人车队中的座位会被匿名化，备份中的副本最迟在 14 天内随每日备份轮换清除。你也可以随时在 Discord 的设置中断开本站的授权；授权失效后，你在本站的会话会自动作废。", null, { hk: "3AahF4" });
export const privacyBody_s6h = (fbs: FbsRuntime) => fbs._("联系我们", null, { hk: "1TH1hQ" });
export const privacyBody_s6b = (fbs: FbsRuntime) => fbs._("如对本政策有疑问，或需提出查询、更正、删除申请，请通过本站社区百业「叽哩呱啦」的 Discord 服务器联系管理员。我们会先核实你的 Discord 账号身份，再处理你的申请。", null, { hk: "xLPMP" });
export const errors_rateLimited = (fbs: FbsRuntime) => fbs._("操作过于频繁, 请稍后再试", null, { hk: "14wqad" });
export const errors_createRateLimited = (fbs: FbsRuntime) => fbs._("创建太频繁, 请稍后再试", null, { hk: "3xfZZs" });
export const errors_guildNotFound = (fbs: FbsRuntime) => fbs._("百业不存在", null, { hk: "399FaN" });
export const errors_gearNotFound = (fbs: FbsRuntime) => fbs._("装备不存在或不属于你", null, { hk: "19Xtd5" });
export const errors_gearEmptyBuild = (fbs: FbsRuntime) => fbs._("搭配为空", null, { hk: "FwMOi" });
export const errors_gearCapacityReached = (fbs: FbsRuntime, p?: StringParams) => fbs._("装备库已满（上限 {limit} 件），删掉不用的装备后再添加", [fbs._param("limit", pv(p, "limit"))], { hk: "3ttZNE" });
export const errors_gearImportOverflow = (fbs: FbsRuntime, p?: StringParams) => fbs._("本批 {n} 件会让装备库达到 {total} 件，超过上限 {limit} 件，整批未导入", [
	fbs._param("n", pv(p, "n")),
	fbs._param("total", pv(p, "total")),
	fbs._param("limit", pv(p, "limit"))
], { hk: "VPJti" });
export const errors_gearOcrBatchTooLarge = (fbs: FbsRuntime, p?: StringParams) => fbs._("单批最多识别 {limit} 张截图，本批有 {n} 张，请分批导入", [fbs._param("limit", pv(p, "limit")), fbs._param("n", pv(p, "n"))], { hk: "tbHee" });
export const errors_gearOcrDailyLimit = (fbs: FbsRuntime, p?: StringParams) => fbs._("今天的批量识别次数已达上限（{limit} 批），明天再试", [fbs._param("limit", pv(p, "limit"))], { hk: "2rAFg4" });
export const errors_loginRequired = (fbs: FbsRuntime) => fbs._("请先登录 Discord 后再操作", null, { hk: "1OyxHy" });
export const errors_loginRequiredShort = (fbs: FbsRuntime) => fbs._("请先登录 Discord", null, { hk: "gIKnp" });
export const errors_localeUnsupported = (fbs: FbsRuntime) => fbs._("不支持的语言", null, { hk: "xZ6fm" });
export const errors_pushTokenInvalid = (fbs: FbsRuntime) => fbs._("推送令牌无效", null, { hk: "2k5C8X" });
export const errors_guildUnboundWrite = (fbs: FbsRuntime) => fbs._("该百业尚未绑定 Discord 服务器，写功能已锁定", null, { hk: "2s3T5u" });
export const errors_memberOnly = (fbs: FbsRuntime) => fbs._("只有该百业 Discord 服务器的成员可以操作", null, { hk: "4i9ecu" });
export const errors_memberOnlyView = (fbs: FbsRuntime) => fbs._("该百业仅对 Discord 服务器成员开放", null, { hk: "1lpBwU" });
export const errors_titleRequired = (fbs: FbsRuntime) => fbs._("请填写标题", null, { hk: "1ZO7Ye" });
export const errors_badStartTime = (fbs: FbsRuntime) => fbs._("请选择有效的出发时间", null, { hk: "2B6EbJ" });
export const errors_startTimeTooFar = (fbs: FbsRuntime) => fbs._("出发时间不能超过 60 天后", null, { hk: "2P9KyE" });
export const errors_groupingNotFound = (fbs: FbsRuntime) => fbs._("组队不存在", null, { hk: "2REfqn" });
export const errors_officialEvent = (fbs: FbsRuntime) => fbs._("官方活动请联系管理员", null, { hk: "3qxEOL" });
export const errors_noCreatorRecorded = (fbs: FbsRuntime) => fbs._("该车队未记录车头，无法解散，请联系管理员处理", null, { hk: "1YfsMV" });
export const errors_leaderOnlyDisband = (fbs: FbsRuntime) => fbs._("只有车头可以解散车队", null, { hk: "zk3fj" });
export const errors_noCreatorRecordedEdit = (fbs: FbsRuntime) => fbs._("该车队未记录车头，无法编辑，请联系管理员处理", null, { hk: "4iy998" });
export const errors_leaderOnlyEdit = (fbs: FbsRuntime) => fbs._("只有车头可以编辑车队", null, { hk: "uyGBP" });
export const errors_noCreatorRecordedComplete = (fbs: FbsRuntime) => fbs._("该车队未记录车头，无法完成，请联系管理员处理", null, { hk: "1inDhN" });
export const errors_leaderOnlyComplete = (fbs: FbsRuntime) => fbs._("只有车头可以完成车队", null, { hk: "3rm9vW" });
export const errors_noCreatorRecordedReopen = (fbs: FbsRuntime) => fbs._("该车队未记录车头，无法恢复，请联系管理员处理", null, { hk: "4uos3h" });
export const errors_leaderOnlyReopen = (fbs: FbsRuntime) => fbs._("只有车头可以恢复车队", null, { hk: "2Dfm3R" });
export const errors_groupingAlreadyCompleted = (fbs: FbsRuntime) => fbs._("该车队已是完成状态", null, { hk: "1XKpWD" });
export const errors_groupingNotCompleted = (fbs: FbsRuntime) => fbs._("该车队尚未完成", null, { hk: "3iaZ0M" });
export const errors_groupingClosed = (fbs: FbsRuntime) => fbs._("该组队已截止报名", null, { hk: "1cVyp7" });
export const errors_nicknameRequired = (fbs: FbsRuntime) => fbs._("请填写游戏昵称", null, { hk: "4vHUzy" });
export const errors_proxyTargetNotInRoster = (fbs: FbsRuntime) => fbs._("所选成员不在本百业名册中", null, { hk: "3o65pL" });
export const errors_groupingFull = (fbs: FbsRuntime) => fbs._("名额已满或报名已截止", null, { hk: "S40jn" });
export const errors_lastSeatHealer = (fbs: FbsRuntime) => fbs._("最后一个名额需要奶", null, { hk: "2Engm3" });
export const errors_alreadyJoined = (fbs: FbsRuntime) => fbs._("已报过名", null, { hk: "17GYOJ" });
export const errors_seatNotFound = (fbs: FbsRuntime) => fbs._("未找到该报名", null, { hk: "1bbhpq" });
export const errors_notSeated = (fbs: FbsRuntime) => fbs._("你还没有落座这辆车", null, { hk: "2Cxo0e" });
export const errors_reminderOffsetsInvalid = (fbs: FbsRuntime) => fbs._("提醒提前量不在可选范围内", null, { hk: "hJIJy" });
export const errors_ogAccentInvalid = (fbs: FbsRuntime) => fbs._("强调色不在可选范围内", null, { hk: "33eOIG" });
export const errors_paramsIncomplete = (fbs: FbsRuntime) => fbs._("参数不完整", null, { hk: "bUpBp" });
export const errors_bossNotFound = (fbs: FbsRuntime) => fbs._("首领不存在", null, { hk: "1anzkq" });
export const errors_guildNameShort = (fbs: FbsRuntime) => fbs._("百业名称至少 2 个字", null, { hk: "4oO92j" });
export const errors_avatarTooLarge = (fbs: FbsRuntime) => fbs._("头像图片不能超过 400KB", null, { hk: "2F2ueK" });
export const errors_avatarBadType = (fbs: FbsRuntime) => fbs._("头像只支持 PNG、JPEG 或 WebP 图片", null, { hk: "2IsoR9" });
export const errors_avatarEmpty = (fbs: FbsRuntime) => fbs._("没有收到图片数据", null, { hk: "qEJw" });
export const errors_slugInvalid = (fbs: FbsRuntime) => fbs._("站点地址只能用小写字母/数字/连字符, 2-40 位", null, { hk: "4uBRIZ" });
export const errors_slugReserved = (fbs: FbsRuntime) => fbs._("该地址为保留字, 请换一个", null, { hk: "4koC0J" });
export const errors_slugTaken = (fbs: FbsRuntime) => fbs._("该地址已被占用, 请换一个", null, { hk: "1FdwI0" });
export const errors_serverRequired = (fbs: FbsRuntime) => fbs._("请选择要绑定的 Discord 服务器", null, { hk: "2jw5Zw" });
export const errors_notInServer = (fbs: FbsRuntime) => fbs._("你不在这个 Discord 服务器中", null, { hk: "14tdzd" });
export const errors_cannotManageServer = (fbs: FbsRuntime) => fbs._("你需要在该 Discord 服务器拥有管理员或「管理服务器」权限才能绑定它", null, { hk: "36dmx6" });
export const errors_adminOnly = (fbs: FbsRuntime) => fbs._("只有所绑服务器的管理员可以执行此操作", null, { hk: "2HbOE6" });
export const errors_webhookInvalid = (fbs: FbsRuntime) => fbs._("Webhook 地址格式不正确", null, { hk: "4lZy7D" });
export const errors_discordIdInvalid = (fbs: FbsRuntime) => fbs._("Discord 服务器 ID 格式不正确", null, { hk: "RA9O9" });
export const errors_noFieldsToUpdate = (fbs: FbsRuntime) => fbs._("没有可更新的字段", null, { hk: "2ogJaD" });
export const errors_signupNotFound = (fbs: FbsRuntime) => fbs._("未找到该报名记录", null, { hk: "3459CS" });
export const errors_resultNotFound = (fbs: FbsRuntime) => fbs._("未找到该成绩", null, { hk: "20venj" });
export const errors_resultTeamRequired = (fbs: FbsRuntime) => fbs._("缺少队伍名", null, { hk: "2JgPSF" });
export const errors_resultTimeInvalid = (fbs: FbsRuntime) => fbs._("用时格式不正确（如 12:34.567）", null, { hk: "4aaXwS" });
export const errors_avatarDataInvalid = (fbs: FbsRuntime) => fbs._("图片数据无效", null, { hk: "24II5Y" });
export const errors_schoolRequired = (fbs: FbsRuntime) => fbs._("缺少流派", null, { hk: "1VK4KE" });
export const errors_generic = (fbs: FbsRuntime) => fbs._("操作失败，请稍后再试", null, { hk: "3K1pLh" });
export const errors_templateNotFound = (fbs: FbsRuntime) => fbs._("模板不存在", null, { hk: "V7yC4" });
export const errors_templateNameRequired = (fbs: FbsRuntime) => fbs._("请填写模板名", null, { hk: "Xi9qb" });
export const errors_templateForbidden = (fbs: FbsRuntime) => fbs._("只有模板创建者或百业管理员可以改删模板", null, { hk: "3cxfYY" });
export const errors_templateBadStart = (fbs: FbsRuntime) => fbs._("发车时间设置无效", null, { hk: "35TKYe" });
export const errors_accountReauthRequired = (fbs: FbsRuntime) => fbs._("请先通过 Discord 重新验证身份", null, { hk: "25og0a" });
export const errors_accountExportRateLimited = (fbs: FbsRuntime) => fbs._("每 24 小时只能导出一次数据，请稍后再试", null, { hk: "Ozxol" });
export const errors_accountUsernameMismatch = (fbs: FbsRuntime) => fbs._("输入的显示名与你的账号不一致", null, { hk: "1IAKtL" });
export const errors_accountDeletionPending = (fbs: FbsRuntime) => fbs._("已有一份删除申请在冷静期中", null, { hk: "lQQDQ" });
export const errors_accountDeletionNotPending = (fbs: FbsRuntime) => fbs._("当前没有待执行的删除申请", null, { hk: "20iJZw" });
export const errors_premiumRequired = (fbs: FbsRuntime) => fbs._("该功能需要开通 Premium", null, { hk: "2Z9jnx" });
export const errors_premiumComingSoon = (fbs: FbsRuntime) => fbs._("Premium 开通即将开放", null, { hk: "cu1vr" });
export const errors_premiumActive = (fbs: FbsRuntime) => fbs._("本百业已开通 Premium", null, { hk: "v6s45" });
export const errors_paygateDisabled = (fbs: FbsRuntime) => fbs._("收费功能尚未开启", null, { hk: "4cxV4g" });
export const errors_checkoutFailed = (fbs: FbsRuntime) => fbs._("创建支付会话失败，请稍后再试", null, { hk: "4CxoXa" });
export const errors_rosterImportEmpty = (fbs: FbsRuntime) => fbs._("没有收到任何识别文本，请重新截图后再试", null, { hk: "1REWAh" });
export const errors_rosterBatchNotFound = (fbs: FbsRuntime) => fbs._("导入预览不存在或已失效，请重新识别", null, { hk: "1WnjIl" });
export const errors_rosterBatchConfirmed = (fbs: FbsRuntime) => fbs._("这份预览已经确认导入过了", null, { hk: "2j2JA8" });
export const errors_rosterNoImportableRows = (fbs: FbsRuntime) => fbs._("没有勾选任何可导入的新名", null, { hk: "470vK4" });
export const errors_rosterEntryNotFound = (fbs: FbsRuntime) => fbs._("名册记录不存在", null, { hk: "1pB8kU" });
export const errors_checklistItemUnknown = (fbs: FbsRuntime) => fbs._("检查条目不存在", null, { hk: "131EQy" });
export const errors_feedbackEmpty = (fbs: FbsRuntime) => fbs._("反馈内容不能为空", null, { hk: "3XLeNf" });
export const errors_feedbackTooLong = (fbs: FbsRuntime) => fbs._("反馈内容太长，请精简到 2000 字以内", null, { hk: "1FK6tt" });
export const errors_feedbackRateLimited = (fbs: FbsRuntime) => fbs._("今天提交的反馈已达上限，请明天再来", null, { hk: "lO8z3" });
export const errors_announcementTitleRequired = (fbs: FbsRuntime) => fbs._("请填写公告标题", null, { hk: "1eQwhZ" });
export const errors_announcementTitleTooLong = (fbs: FbsRuntime) => fbs._("公告标题太长，请精简到 80 字以内", null, { hk: "1J86Bw" });
export const errors_announcementBodyTooLong = (fbs: FbsRuntime) => fbs._("公告正文太长，请精简到 2000 字以内", null, { hk: "1r4u3" });
export const errors_announcementNotFound = (fbs: FbsRuntime) => fbs._("公告不存在", null, { hk: "cBxPq" });
export const errors_announcementDailyLimit = (fbs: FbsRuntime, p?: StringParams) => fbs._("今天的公告已达上限（每天 {limit} 条），明天再发", [fbs._param("limit", pv(p, "limit"))], { hk: "25h4tt" });
export const errors_urgentCallDailyLimit = (fbs: FbsRuntime, p?: StringParams) => fbs._("今天的紧急集合呼叫已达上限（每天 {limit} 次），明天再试", [fbs._param("limit", pv(p, "limit"))], { hk: "GcIVw" });
export const errors_lotteryTitleRequired = (fbs: FbsRuntime) => fbs._("请填写抽奖标题", null, { hk: "2Azyy8" });
export const errors_lotteryEntriesEmpty = (fbs: FbsRuntime) => fbs._("参与名单为空，请先选择参与者", null, { hk: "3kzp4r" });
export const errors_lotteryNotFound = (fbs: FbsRuntime) => fbs._("抽奖不存在", null, { hk: "mLRgt" });
export const errors_lotteryAlreadyDrawn = (fbs: FbsRuntime) => fbs._("该抽奖已经开过奖了", null, { hk: "3M7wgo" });
export const errors_lotteryWinnerCountInvalid = (fbs: FbsRuntime) => fbs._("中奖人数必须在 1 与参与人数之间", null, { hk: "e9shV" });
export const errors_lotteryWeightInvalid = (fbs: FbsRuntime) => fbs._("权重必须是 1 到 1000 之间的整数", null, { hk: "3tNLSW" });
export const errors_lotteryMemberNotInGuild = (fbs: FbsRuntime) => fbs._("所选成员不在本百业名册中", null, { hk: "2QTSNn" });
export const errors_availabilitySlotInvalid = (fbs: FbsRuntime) => fbs._("可用时段不合法", null, { hk: "4DcHCe" });
export const errors_availabilityTooManySlots = (fbs: FbsRuntime) => fbs._("可用时段太多（最多 21 个）", null, { hk: "2UVhij" });
export const errors_pollTitleRequired = (fbs: FbsRuntime) => fbs._("请填写投票标题", null, { hk: "7gJb" });
export const errors_pollOptionsInvalid = (fbs: FbsRuntime) => fbs._("候选时间不合法（需 2–8 个不同的未来时间）", null, { hk: "NzPZY" });
export const errors_pollNotFound = (fbs: FbsRuntime) => fbs._("投票不存在", null, { hk: "3Ax9oX" });
export const errors_pollClosed = (fbs: FbsRuntime) => fbs._("该投票已关闭", null, { hk: "cbI86" });
export const errors_pollOptionInvalid = (fbs: FbsRuntime) => fbs._("所选时间不属于该投票", null, { hk: "wkcf5" });
export const errors_pollForbidden = (fbs: FbsRuntime) => fbs._("只有发起人或百业管理员可以关闭投票", null, { hk: "1cpGnm" });
export const errors_customFieldInvalid = (fbs: FbsRuntime) => fbs._("自定义字段不合法", null, { hk: "4bHYpW" });
export const errors_customFieldTooMany = (fbs: FbsRuntime) => fbs._("自定义字段最多 5 个", null, { hk: "4PcIr" });
export const errors_signupAnswerRequired = (fbs: FbsRuntime) => fbs._("请填写必填的报名信息", null, { hk: "mamUV" });
export const errors_signupAnswerInvalid = (fbs: FbsRuntime) => fbs._("报名信息不合法", null, { hk: "pjHLi" });
export const errors_applicationPending = (fbs: FbsRuntime) => fbs._("你已有一份待审核的申请，请等待审核结果", null, { hk: "1m9yfn" });
export const errors_alreadyMember = (fbs: FbsRuntime) => fbs._("你已经是这个百业的成员了", null, { hk: "3e58c0" });
export const errors_recruitUnavailable = (fbs: FbsRuntime) => fbs._("该百业尚未绑定 Discord 服务器，暂不开放招新申请", null, { hk: "2EkrmU" });
export const errors_applicationNotFound = (fbs: FbsRuntime) => fbs._("申请不存在", null, { hk: "3MgGls" });
export const errors_applicationNotPending = (fbs: FbsRuntime) => fbs._("该申请已经审核过了", null, { hk: "4c72Hp" });
export const errors_mentorNotDesignated = (fbs: FbsRuntime) => fbs._("所选导师不在本百业导师人选中，请先设为导师", null, { hk: "4xIaGW" });
export const errors_mentorNotInGuild = (fbs: FbsRuntime) => fbs._("所选导师不在本百业名册中", null, { hk: "4mXm3Z" });
export const errors_menteeNotInGuild = (fbs: FbsRuntime) => fbs._("所选新人不在本百业名册中", null, { hk: "42qBZX" });
export const errors_menteeAlreadyPaired = (fbs: FbsRuntime) => fbs._("该新人已有一段进行中的配对，请先结束它再改配", null, { hk: "4siXsr" });
export const errors_mentorSelfPairing = (fbs: FbsRuntime) => fbs._("导师和新人不能是同一个人", null, { hk: "fdyQq" });
export const errors_pairingNotFound = (fbs: FbsRuntime) => fbs._("配对不存在", null, { hk: "25HwHq" });
export const errors_pairingAlreadyEnded = (fbs: FbsRuntime) => fbs._("该配对已经结束了", null, { hk: "3BQM7S" });
export const errors_officerNoteBodyRequired = (fbs: FbsRuntime) => fbs._("请填写备注内容", null, { hk: "3VY4cV" });
export const errors_officerNoteBodyTooLong = (fbs: FbsRuntime) => fbs._("备注太长，请精简到 500 字以内", null, { hk: "4aKCB0" });
export const errors_officerNoteNotFound = (fbs: FbsRuntime) => fbs._("备注不存在", null, { hk: "4zYK9C" });
export const errors_officerMemberNotFound = (fbs: FbsRuntime) => fbs._("该成员不在本百业名册中", null, { hk: "uGLd3" });
export const errors_seasonGoalTitleRequired = (fbs: FbsRuntime) => fbs._("请填写目标", null, { hk: "1cqHEi" });
export const errors_seasonGoalTitleTooLong = (fbs: FbsRuntime) => fbs._("目标太长，请精简到 80 字以内", null, { hk: "1j0JaT" });
export const errors_seasonGoalNoteTooLong = (fbs: FbsRuntime) => fbs._("进度备注太长，请精简到 500 字以内", null, { hk: "3eY1Et" });
export const errors_seasonGoalNotFound = (fbs: FbsRuntime) => fbs._("目标不存在", null, { hk: "1w2VQy" });
export const errors_seasonGoalDungeonNotFound = (fbs: FbsRuntime) => fbs._("关联的副本不存在", null, { hk: "1oLQCb" });
export const guildAdmin_title = (fbs: FbsRuntime) => fbs._("管理百业", null, { hk: "23Vynb" });
export const guildAdmin_lockedTitle = (fbs: FbsRuntime) => fbs._("无权管理这个百业", null, { hk: "4eqp6f" });
export const guildAdmin_lockedBody = (fbs: FbsRuntime) => fbs._("只有该百业所绑 Discord 服务器的管理员（服务器主或拥有管理权限）可以进入管理页。", null, { hk: "248TMj" });
export const guildAdmin_backLink = (fbs: FbsRuntime) => fbs._("‹ 返回百业", null, { hk: "4EGMEL" });
export const guildAdmin_tabProfile = (fbs: FbsRuntime) => fbs._("资料", null, { hk: "3uMNas" });
export const guildAdmin_tabDiscord = (fbs: FbsRuntime) => fbs._("Discord", null, { hk: "3CuaG7" });
export const guildAdmin_tabEvents = (fbs: FbsRuntime) => fbs._("活动", null, { hk: "26reCQ" });
export const guildAdmin_tabGuides = (fbs: FbsRuntime) => fbs._("攻略数据", null, { hk: "2Nr9CU" });
export const guildAdmin_saveButton = (fbs: FbsRuntime) => fbs._("保存", null, { hk: "qQ7uT" });
export const guildAdmin_savedText = (fbs: FbsRuntime) => fbs._("已保存", null, { hk: "1W7oZS" });
export const guildAdmin_deleteButton = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "3GZg6n" });
export const guildAdmin_editButton = (fbs: FbsRuntime) => fbs._("编辑", null, { hk: "DniRb" });
export const guildAdmin_addButton = (fbs: FbsRuntime) => fbs._("新增", null, { hk: "yxsUz" });
export const guildAdmin_profileTitle = (fbs: FbsRuntime) => fbs._("百业资料", null, { hk: "a48QV" });
export const guildAdmin_nameLabel = (fbs: FbsRuntime) => fbs._("百业名称", null, { hk: "hhAjt" });
export const guildAdmin_announcementLabel = (fbs: FbsRuntime) => fbs._("公告", null, { hk: "25a5pC" });
export const guildAdmin_sloganLabel = (fbs: FbsRuntime) => fbs._("标语", null, { hk: "28mfAB" });
export const guildAdmin_masterNameLabel = (fbs: FbsRuntime) => fbs._("掌门", null, { hk: "3Hoc3s" });
export const guildAdmin_logoUrlLabel = (fbs: FbsRuntime) => fbs._("标志图链接", null, { hk: "3NLTG9" });
export const guildAdmin_bgImageUrlLabel = (fbs: FbsRuntime) => fbs._("背景图链接", null, { hk: "49U9ot" });
export const guildAdmin_avatarTitle = (fbs: FbsRuntime) => fbs._("百业头像", null, { hk: "zZZbX" });
export const guildAdmin_avatarUpload = (fbs: FbsRuntime) => fbs._("上传头像", null, { hk: "2F5CHj" });
export const guildAdmin_avatarReplace = (fbs: FbsRuntime) => fbs._("更换头像", null, { hk: "1IkqfU" });
export const guildAdmin_avatarDelete = (fbs: FbsRuntime) => fbs._("删除头像", null, { hk: "1zrF5u" });
export const guildAdmin_avatarNone = (fbs: FbsRuntime) => fbs._("尚未设置头像，当前显示默认印章。", null, { hk: "2BYfu5" });
export const guildAdmin_avatarHint = (fbs: FbsRuntime) => fbs._("正方形图片效果最佳，大小 ≤ 400KB（PNG / JPEG / WebP）。", null, { hk: "1G1mNe" });
export const guildAdmin_discordTitle = (fbs: FbsRuntime) => fbs._("Discord 集成", null, { hk: "1LxGti" });
export const guildAdmin_webhookLabel = (fbs: FbsRuntime) => fbs._("发车提醒 Webhook", null, { hk: "392zYT" });
export const guildAdmin_webhookSet = (fbs: FbsRuntime, p?: StringParams) => fbs._("已设置（Webhook 编号 {id}）", [fbs._param("id", pv(p, "id"))], { hk: "4CYB03" });
export const guildAdmin_webhookUnset = (fbs: FbsRuntime) => fbs._("未设置", null, { hk: "2wQhyp" });
export const guildAdmin_webhookHint = (fbs: FbsRuntime) => fbs._("保存后不回显完整地址；留空并保存 = 保持不变，点「清除」移除。", null, { hk: "1Yf03v" });
export const guildAdmin_webhookClear = (fbs: FbsRuntime) => fbs._("清除 Webhook", null, { hk: "4j6sH2" });
export const guildAdmin_guildIdLabel = (fbs: FbsRuntime) => fbs._("绑定的服务器 ID", null, { hk: "1yQyMQ" });
export const guildAdmin_guildIdUnbound = (fbs: FbsRuntime) => fbs._("未绑定", null, { hk: "PrMZj" });
export const guildAdmin_reminderTitle = (fbs: FbsRuntime) => fbs._("发车提醒设置", null, { hk: "sR14M" });
export const guildAdmin_reminderOffsetsLabel = (fbs: FbsRuntime) => fbs._("提醒提前量（可多选）", null, { hk: "2CsoVG" });
export const guildAdmin_reminderOffsetOption = (fbs: FbsRuntime, p?: StringParams) => fbs._("提前 {minutes} 分钟", [fbs._param("minutes", pv(p, "minutes"))], { hk: "2snnwp" });
export const guildAdmin_reminderCustomTextLabel = (fbs: FbsRuntime) => fbs._("自定义提醒文案", null, { hk: "10PDxk" });
export const guildAdmin_reminderCustomTextHint = (fbs: FbsRuntime) => fbs._("一行文字，会出现在提醒卡片里；最多 100 字，留空不显示。第一次提前提醒会通知所有人，之后的只催还没就位的人。", null, { hk: "3D79h6" });
export const guildAdmin_visibilityTitle = (fbs: FbsRuntime) => fbs._("可见性", null, { hk: "3J6SQ2" });
export const guildAdmin_devOnlyLabel = (fbs: FbsRuntime) => fbs._("仅开发环境可见", null, { hk: "12OF7C" });
export const guildAdmin_eventsTitle = (fbs: FbsRuntime) => fbs._("活动管理", null, { hk: "4xCOb0" });
export const guildAdmin_signupCsvSuffix = (fbs: FbsRuntime) => fbs._("报名表", null, { hk: "EaoNs" });
export const guildAdmin_eventEmpty = (fbs: FbsRuntime) => fbs._("暂无活动。", null, { hk: "3CAWZW" });
export const guildAdmin_eventTitleLabel = (fbs: FbsRuntime) => fbs._("标题", null, { hk: "Z67in" });
export const guildAdmin_eventTypeLabel = (fbs: FbsRuntime) => fbs._("类型", null, { hk: "1CCpeN" });
export const guildAdmin_eventStatusLabel = (fbs: FbsRuntime) => fbs._("状态", null, { hk: "cm4HT" });
export const guildAdmin_eventTimeLabel = (fbs: FbsRuntime) => fbs._("发车时间", null, { hk: "3yAej9" });
export const guildAdmin_eventSlotsLabel = (fbs: FbsRuntime) => fbs._("席位上限", null, { hk: "2TrBEx" });
export const guildAdmin_eventMeetLabel = (fbs: FbsRuntime) => fbs._("集合信息", null, { hk: "2yoAeI" });
export const guildAdmin_eventDescLabel = (fbs: FbsRuntime) => fbs._("说明", null, { hk: "J6otd" });
export const guildAdmin_eventDungeonLabel = (fbs: FbsRuntime) => fbs._("副本", null, { hk: "4GQUn" });
export const guildAdmin_statusOpen = (fbs: FbsRuntime) => fbs._("开放报名", null, { hk: "3cSPo1" });
export const guildAdmin_statusClosed = (fbs: FbsRuntime) => fbs._("已截止", null, { hk: "1ii010" });
export const guildAdmin_statusCompleted = (fbs: FbsRuntime) => fbs._("已完成", null, { hk: "40rbSg" });
export const guildAdmin_statusDraft = (fbs: FbsRuntime) => fbs._("草稿", null, { hk: "40FGl9" });
export const guildAdmin_signupsTitle = (fbs: FbsRuntime) => fbs._("报名名单", null, { hk: "gUogc" });
export const guildAdmin_signupEmpty = (fbs: FbsRuntime) => fbs._("暂无报名。", null, { hk: "J3AzD" });
export const guildAdmin_exportCsvButton = (fbs: FbsRuntime) => fbs._("导出 CSV", null, { hk: "3uvhR8" });
export const guildAdmin_removeSignupButton = (fbs: FbsRuntime) => fbs._("移除", null, { hk: "1YSDyJ" });
export const guildAdmin_resultsTitle = (fbs: FbsRuntime) => fbs._("竞速成绩", null, { hk: "2ha0RQ" });
export const guildAdmin_resultTeamLabel = (fbs: FbsRuntime) => fbs._("队伍名", null, { hk: "FCzZT" });
export const guildAdmin_resultMembersLabel = (fbs: FbsRuntime) => fbs._("队员（逗号分隔）", null, { hk: "llZLw" });
export const guildAdmin_resultTimeLabel = (fbs: FbsRuntime) => fbs._("用时（如 12:34.567）", null, { hk: "4BzK7V" });
export const guildAdmin_resultProofLabel = (fbs: FbsRuntime) => fbs._("凭证链接", null, { hk: "eFQVj" });
export const guildAdmin_resultNoteLabel = (fbs: FbsRuntime) => fbs._("备注", null, { hk: "2aFNM9" });
export const guildAdmin_guidesTitle = (fbs: FbsRuntime) => fbs._("流派攻略数据（BiS / 循环）", null, { hk: "4cJisQ" });
export const guildAdmin_guidesHint = (fbs: FbsRuntime) => fbs._("按流派填写：build 名称、属性行、占比行、BiS（JSON）与循环（JSON）。保存后流派页即时生效。", null, { hk: "1bDNx" });
export const guildAdmin_guideSchoolLabel = (fbs: FbsRuntime) => fbs._("流派", null, { hk: "kxSOl" });
export const guildAdmin_guideBuildLabel = (fbs: FbsRuntime) => fbs._("Build 名称", null, { hk: "4f5yn9" });
export const guildAdmin_guideAttrLabel = (fbs: FbsRuntime) => fbs._("属性行", null, { hk: "2oRBNY" });
export const guildAdmin_guideRateLabel = (fbs: FbsRuntime) => fbs._("占比行", null, { hk: "b4Xqn" });
export const guildAdmin_guideBisLabel = (fbs: FbsRuntime) => fbs._("BiS（JSON）", null, { hk: "4FUXhX" });
export const guildAdmin_guideRotationLabel = (fbs: FbsRuntime) => fbs._("循环（JSON）", null, { hk: "vkSW6" });
export const guildAdmin_tabStats = (fbs: FbsRuntime) => fbs._("统计", null, { hk: "3WvV8a" });
export const guildAdmin_tabSeason = (fbs: FbsRuntime) => fbs._("赛季", null, { hk: "2ybcHw" });
export const guildAdmin_seasonTitle = (fbs: FbsRuntime) => fbs._("赛季前检查清单", null, { hk: "4u19ZR" });
export const guildAdmin_seasonHint = (fbs: FbsRuntime, p?: StringParams) => fbs._("按当前版本 {version} 与赛季 {season} 自动生成；换季后清单自动重置，逐项复核后勾选。", [fbs._param("version", pv(p, "version")), fbs._param("season", pv(p, "season"))], { hk: "4s5M26" });
export const guildAdmin_seasonProgress = (fbs: FbsRuntime, p?: StringParams) => fbs._("已完成 {done} / {total}", [fbs._param("done", pv(p, "done")), fbs._param("total", pv(p, "total"))], { hk: "8K7qZ" });
export const guildAdmin_seasonItemDungeonsTitle = (fbs: FbsRuntime) => fbs._("复核当前版本副本", null, { hk: "AA5cY" });
export const guildAdmin_seasonItemDungeonsDetail = (fbs: FbsRuntime, p?: StringParams) => fbs._("当前版本（{version}）共有 {count} 个副本，确认达标要求与攻略已按本赛季更新。", [fbs._param("version", pv(p, "version")), fbs._param("count", pv(p, "count"))], { hk: "3eGKuc" });
export const guildAdmin_seasonItemTemplatesTitle = (fbs: FbsRuntime) => fbs._("复核组队模板", null, { hk: "2rTBPK" });
export const guildAdmin_seasonItemTemplatesDetail = (fbs: FbsRuntime, p?: StringParams) => fbs._("本百业现有 {count} 个组队模板，确认模板的副本与人数仍适用于本赛季。", [fbs._param("count", pv(p, "count"))], { hk: "O8DQJ" });
export const guildAdmin_seasonItemGuidesTitle = (fbs: FbsRuntime) => fbs._("复核流派攻略数据", null, { hk: "3ZPTln" });
export const guildAdmin_seasonItemGuidesDetail = (fbs: FbsRuntime, p?: StringParams) => fbs._("攻略数据现有 {builds} 份 BiS 与 {rotations} 份循环，确认已按本赛季数值更新。", [fbs._param("builds", pv(p, "builds")), fbs._param("rotations", pv(p, "rotations"))], { hk: "3PAvfp" });
export const guildAdmin_seasonItemRosterTitle = (fbs: FbsRuntime) => fbs._("复核成员名册", null, { hk: "1Wrubq" });
export const guildAdmin_seasonItemRosterDetail = (fbs: FbsRuntime, p?: StringParams) => fbs._("Discord 名册 {members} 人，截图名册 {entries} 条；确认成员装备季标与名册均为本赛季最新。", [fbs._param("members", pv(p, "members")), fbs._param("entries", pv(p, "entries"))], { hk: "27uzhS" });
export const guildAdmin_rosterTitle = (fbs: FbsRuntime) => fbs._("成员名册（截图导入）", null, { hk: "3VlV9Z" });
export const guildAdmin_rosterHint = (fbs: FbsRuntime) => fbs._("上传游戏内成员名单截图，识别出的名字先进入预览，确认后才写入名册。名册只记录游戏内名字，不会改变任何人的 Discord 成员资格。", null, { hk: "49PRkk" });
export const guildAdmin_rosterUpload = (fbs: FbsRuntime) => fbs._("上传名单截图", null, { hk: "2hFVPC" });
export const guildAdmin_rosterOcrRunning = (fbs: FbsRuntime) => fbs._("识别中…", null, { hk: "FDmDE" });
export const guildAdmin_rosterPreviewTitle = (fbs: FbsRuntime) => fbs._("导入预览", null, { hk: "1rUUdA" });
export const guildAdmin_rosterConfirm = (fbs: FbsRuntime) => fbs._("确认导入", null, { hk: "4edb4K" });
export const guildAdmin_rosterEmpty = (fbs: FbsRuntime) => fbs._("尚无名册记录，用上方按钮上传名单截图导入。", null, { hk: "33JFRP" });
export const guildAdmin_rosterSourceOcr = (fbs: FbsRuntime) => fbs._("截图识别", null, { hk: "duR3T" });
export const guildAdmin_rosterMatchedMember = (fbs: FbsRuntime) => fbs._("已匹配 Discord 成员", null, { hk: "2QxR8p" });
export const guildAdmin_rosterStatusMatched = (fbs: FbsRuntime) => fbs._("已匹配", null, { hk: "xFaPx" });
export const guildAdmin_rosterStatusNew = (fbs: FbsRuntime) => fbs._("疑似新名", null, { hk: "TVNTz" });
export const guildAdmin_rosterStatusUnrecognized = (fbs: FbsRuntime) => fbs._("无法识别", null, { hk: "1zhpBy" });
export const guildAdmin_rosterImported = (fbs: FbsRuntime, p?: StringParams) => fbs._("已导入 {count} 条名册记录", [fbs._param("count", pv(p, "count"))], { hk: "HA2yl" });
export const guildAdmin_statsTitle = (fbs: FbsRuntime) => fbs._("出勤与活跃", null, { hk: "iuqgf" });
export const guildAdmin_statsCurrentWeek = (fbs: FbsRuntime) => fbs._("本周", null, { hk: "2wJGBe" });
export const guildAdmin_statsCars = (fbs: FbsRuntime) => fbs._("开车", null, { hk: "4Ey6h5" });
export const guildAdmin_statsCompleted = (fbs: FbsRuntime) => fbs._("完成", null, { hk: "3hK2MZ" });
export const guildAdmin_statsSeats = (fbs: FbsRuntime) => fbs._("席位", null, { hk: "3VjKJO" });
export const guildAdmin_statsFillRate = (fbs: FbsRuntime) => fbs._("满员率", null, { hk: "3v2PvZ" });
export const guildAdmin_statsParticipants = (fbs: FbsRuntime) => fbs._("参与人数", null, { hk: "3Skv6R" });
export const guildAdmin_statsPerCapita = (fbs: FbsRuntime) => fbs._("人均参与", null, { hk: "2cv4C4" });
export const guildAdmin_statsMembersTitle = (fbs: FbsRuntime) => fbs._("成员参与榜 · 近 4 周", null, { hk: "3M1O4a" });
export const guildAdmin_statsLeadersTitle = (fbs: FbsRuntime) => fbs._("车头榜 · 近 4 周", null, { hk: "ZdSKh" });
export const guildAdmin_statsSeatCount = (fbs: FbsRuntime) => fbs._("落座次数", null, { hk: "4Fc5Hi" });
export const guildAdmin_statsCarCount = (fbs: FbsRuntime) => fbs._("开车数", null, { hk: "13S23b" });
export const guildAdmin_statsEmpty = (fbs: FbsRuntime) => fbs._("近 4 周暂无组队数据。", null, { hk: "2FAHYi" });
export const guildAdmin_statsBoardEmpty = (fbs: FbsRuntime) => fbs._("暂无记录。", null, { hk: "3hDYU9" });
export const guildAdmin_whiteLabelTitle = (fbs: FbsRuntime) => fbs._("品牌与分享卡", null, { hk: "1z2Ti0" });
export const guildAdmin_hideBrandingLabel = (fbs: FbsRuntime) => fbs._("隐藏平台品牌", null, { hk: "RBnje" });
export const guildAdmin_hideBrandingHint = (fbs: FbsRuntime) => fbs._("开启后，本百业的页面上不再显示平台名称与页脚声明，只呈现百业自己的信息。", null, { hk: "1I8KAg" });
export const guildAdmin_ogAccentLabel = (fbs: FbsRuntime) => fbs._("分享卡强调色", null, { hk: "1pOGR8" });
export const guildAdmin_ogTitleSuffixLabel = (fbs: FbsRuntime) => fbs._("分享卡标题后缀", null, { hk: "9EM3P" });
export const guildAdmin_ogTitleSuffixHint = (fbs: FbsRuntime) => fbs._("会接在分享卡的标题后面，如「· 招募中」；最多 30 字，留空不显示。", null, { hk: "2MJFYR" });
export const guildAdmin_ogAccentGold = (fbs: FbsRuntime) => fbs._("鎏金", null, { hk: "4E7oBk" });
export const guildAdmin_ogAccentJade = (fbs: FbsRuntime) => fbs._("翡翠", null, { hk: "yR59M" });
export const guildAdmin_ogAccentAzure = (fbs: FbsRuntime) => fbs._("藏青", null, { hk: "UcaFv" });
export const guildAdmin_ogAccentCinnabar = (fbs: FbsRuntime) => fbs._("朱砂", null, { hk: "3Phj2j" });
export const guildAdmin_ogAccentViolet = (fbs: FbsRuntime) => fbs._("紫檀", null, { hk: "1VAkT6" });
export const guildAdmin_premiumLockedTitle = (fbs: FbsRuntime) => fbs._("开通百业 Premium", null, { hk: "1pajiH" });
export const guildAdmin_premiumLockedBody = (fbs: FbsRuntime) => fbs._("高级发车提醒、出勤统计、品牌与分享卡定制均为 Premium 功能。开通后立即生效，可随时取消。", null, { hk: "1rg5hX" });
export const guildAdmin_premiumCheckoutButton = (fbs: FbsRuntime) => fbs._("立即开通", null, { hk: "1JlNET" });
export const guildAdmin_premiumComingSoon = (fbs: FbsRuntime) => fbs._("即将开放", null, { hk: "86Hjt" });
export const guildAdmin_premiumActiveTitle = (fbs: FbsRuntime) => fbs._("百业 Premium", null, { hk: "10hBsK" });
export const guildAdmin_premiumPlanName = (fbs: FbsRuntime) => fbs._("Premium", null, { hk: "1bWQYi" });
export const guildAdmin_premiumSourceStripe = (fbs: FbsRuntime) => fbs._("通过 Stripe 订阅", null, { hk: "46CFxl" });
export const guildAdmin_premiumSourceManual = (fbs: FbsRuntime) => fbs._("由平台授予", null, { hk: "1Mh8w8" });
export const guildAdmin_premiumPeriodEnd = (fbs: FbsRuntime, p?: StringParams) => fbs._("当前周期至 {date}", [fbs._param("date", pv(p, "date"))], { hk: "18fi8v" });
export const guildAdmin_premiumPriceMonth = (fbs: FbsRuntime, p?: StringParams) => fbs._("{amount} / 月", [fbs._param("amount", pv(p, "amount"))], { hk: "1mJBHc" });
export const guildAdmin_premiumPriceYear = (fbs: FbsRuntime, p?: StringParams) => fbs._("{amount} / 年", [fbs._param("amount", pv(p, "amount"))], { hk: "4c5dav" });
export const guildAdmin_billingSuccess = (fbs: FbsRuntime) => fbs._("开通成功，Premium 已生效。", null, { hk: "3TPHpK" });
export const guildAdmin_billingCanceled = (fbs: FbsRuntime) => fbs._("已取消开通，未产生扣费。", null, { hk: "3G32RI" });
export const guildAdmin_tabAnnouncements = (fbs: FbsRuntime) => fbs._("公告广播", null, { hk: "X5n" });
export const guildAdmin_tabTools = (fbs: FbsRuntime) => fbs._("活动工具", null, { hk: "3LQGjs" });
export const guildAdmin_lotteryTitle = (fbs: FbsRuntime) => fbs._("活动抽奖", null, { hk: "24Bubb" });
export const guildAdmin_lotteryHint = (fbs: FbsRuntime) => fbs._("参与名单可来自某辆车的参与者，或手选本百业成员；名单与权重在创建时定格。开奖按权重随机抽取，同一抽奖内不会重复中奖；抽奖、名单、权重与结果全部留痕可查。", null, { hk: "8RBeR" });
export const guildAdmin_lotteryEmpty = (fbs: FbsRuntime) => fbs._("还没有抽奖，先创建一个。", null, { hk: "2YVymx" });
export const guildAdmin_lotteryNameLabel = (fbs: FbsRuntime) => fbs._("抽奖标题", null, { hk: "XHMZj" });
export const guildAdmin_lotteryPrizeLabel = (fbs: FbsRuntime) => fbs._("奖品 / 奖池", null, { hk: "28gq5e" });
export const guildAdmin_lotterySourceLabel = (fbs: FbsRuntime) => fbs._("参与名单来源", null, { hk: "2JFp9e" });
export const guildAdmin_lotterySourceGrouping = (fbs: FbsRuntime) => fbs._("某辆车的参与者", null, { hk: "DRlga" });
export const guildAdmin_lotterySourceMembers = (fbs: FbsRuntime) => fbs._("手选百业成员", null, { hk: "F6ucB" });
export const guildAdmin_lotteryGroupingLabel = (fbs: FbsRuntime) => fbs._("选择车队", null, { hk: "Om2tk" });
export const guildAdmin_lotteryWinnerCountLabel = (fbs: FbsRuntime) => fbs._("中奖人数", null, { hk: "2zgO7O" });
export const guildAdmin_lotteryUniformWeightLabel = (fbs: FbsRuntime) => fbs._("统一权重", null, { hk: "4atw5J" });
export const guildAdmin_lotteryWeightLabel = (fbs: FbsRuntime) => fbs._("权重", null, { hk: "wlRYN" });
export const guildAdmin_lotteryEntriesLabel = (fbs: FbsRuntime) => fbs._("参与名单", null, { hk: "3Yj7U6" });
export const guildAdmin_lotteryWinnersLabel = (fbs: FbsRuntime) => fbs._("中奖名单", null, { hk: "1EObgV" });
export const guildAdmin_lotteryCreateButton = (fbs: FbsRuntime) => fbs._("创建抽奖", null, { hk: "48BYdh" });
export const guildAdmin_lotteryDrawButton = (fbs: FbsRuntime) => fbs._("开奖", null, { hk: "1EbZ3a" });
export const guildAdmin_lotteryStatusOpen = (fbs: FbsRuntime) => fbs._("待开奖", null, { hk: "3F8y2x" });
export const guildAdmin_lotteryStatusDrawn = (fbs: FbsRuntime) => fbs._("已开奖", null, { hk: "2q1FC9" });
export const guildAdmin_lotteryEntryCount = (fbs: FbsRuntime, p?: StringParams) => fbs._("{count} 人参与", [fbs._param("count", pv(p, "count"))], { hk: "4ho8Cr" });
export const guildAdmin_tabRecruit = (fbs: FbsRuntime) => fbs._("招新与导师", null, { hk: "yK4MU" });
export const guildAdmin_tabOfficer = (fbs: FbsRuntime) => fbs._("军官工具", null, { hk: "3tIenJ" });
export const groupingTemplate_sectionTitle = (fbs: FbsRuntime) => fbs._("车队模板", null, { hk: "GOM6P" });
export const groupingTemplate_nameLabel = (fbs: FbsRuntime) => fbs._("模板名", null, { hk: "1k3Wki" });
export const groupingTemplate_namePlaceholder = (fbs: FbsRuntime) => fbs._("给模板起个名字", null, { hk: "3MWfOY" });
export const groupingTemplate_saveFromForm = (fbs: FbsRuntime) => fbs._("存为模板", null, { hk: "4CUZuQ" });
export const groupingTemplate_updateSubmit = (fbs: FbsRuntime) => fbs._("保存模板修改", null, { hk: "2Bk6t2" });
export const groupingTemplate_editingNotice = (fbs: FbsRuntime, p?: StringParams) => fbs._("正在编辑模板「{name}」", [fbs._param("name", pv(p, "name"))], { hk: "1lx9SI" });
export const groupingTemplate_cancelEdit = (fbs: FbsRuntime) => fbs._("取消编辑", null, { hk: "24y5Qr" });
export const groupingTemplate_empty = (fbs: FbsRuntime) => fbs._("还没有模板，把常用配置存下来，下次一键预填", null, { hk: "2dBmbh" });
export const groupingTemplate_whenToday = (fbs: FbsRuntime, p?: StringParams) => fbs._("今天 {time} 发车", [fbs._param("time", pv(p, "time"))], { hk: "4kuJVp" });
export const groupingTemplate_whenTomorrow = (fbs: FbsRuntime, p?: StringParams) => fbs._("明天 {time} 发车", [fbs._param("time", pv(p, "time"))], { hk: "3aSyYd" });
export const groupingTemplate_whenDays = (fbs: FbsRuntime, p?: StringParams) => fbs._("{days} 天后 {time} 发车", [fbs._param("days", pv(p, "days")), fbs._param("time", pv(p, "time"))], { hk: "1xEu5s" });
export const groupingTemplate_toastSaved = (fbs: FbsRuntime) => fbs._("模板已保存", null, { hk: "4kY206" });
export const groupingTemplate_toastSaveFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("模板保存失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "wRlkj" });
export const groupingTemplate_toastDeleted = (fbs: FbsRuntime) => fbs._("模板已删除", null, { hk: "3uZBPc" });
export const groupingTemplate_toastDeleteFailed = (fbs: FbsRuntime, p?: StringParams) => fbs._("模板删除失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "Ygx0t" });
export const groupingTemplate_edit = (fbs: FbsRuntime) => fbs._("编辑", null, { hk: "3kBXbr" });
export const groupingTemplate_delete = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "1cykms" });
export const groupingTemplate_deleteConfirmTitle = (fbs: FbsRuntime) => fbs._("删除模板", null, { hk: "4GvRzx" });
export const groupingTemplate_deleteConfirmMessage = (fbs: FbsRuntime, p?: StringParams) => fbs._("确定删除模板「{name}」吗？", [fbs._param("name", pv(p, "name"))], { hk: "3lDXrV" });
export const groupingTemplate_saveButton = (fbs: FbsRuntime) => fbs._("📋 存为模板", null, { hk: "3ovT8m" });
export const groupingTemplate_saveDialogTitle = (fbs: FbsRuntime) => fbs._("存为车队模板", null, { hk: "2sNRNg" });
export const groupingTemplate_saveSubmit = (fbs: FbsRuntime) => fbs._("保存模板", null, { hk: "31IMd4" });
export const groupingTemplate_toastSavedFromCar = (fbs: FbsRuntime) => fbs._("已存为模板，可在发新车时一键预填", null, { hk: "4m9ecW" });
export const groupingTemplate_metaTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{type}{dungeon} · {max} 人", [
	fbs._param("type", pv(p, "type")),
	fbs._param("dungeon", pv(p, "dungeon")),
	fbs._param("max", pv(p, "max"))
], { hk: "37i0v8" });
export const account_sectionTitle = (fbs: FbsRuntime) => fbs._("我的数据", null, { hk: "2UMdrf" });
export const account_exportLabel = (fbs: FbsRuntime) => fbs._("导出我的数据", null, { hk: "CXJjM" });
export const account_exportHint = (fbs: FbsRuntime) => fbs._("把你账号的全部数据下载为一个 JSON 文件：账号资料、百业名册、你创建的车队、你的报名座位、装备库与方案。登录凭据与推送令牌出于安全不会包含在内。", null, { hk: "2DOC2m" });
export const account_deleteLabel = (fbs: FbsRuntime) => fbs._("删除账号", null, { hk: "1VtQ4B" });
export const account_deleteHint = (fbs: FbsRuntime) => fbs._("删除不可恢复。提交后有 7 天冷静期，期间可随时撤销；到期后你的个人数据会被删除或匿名化。", null, { hk: "1uAuep" });
export const account_reauthLabel = (fbs: FbsRuntime) => fbs._("通过 Discord 重新验证", null, { hk: "2TKGKz" });
export const account_reauthHint = (fbs: FbsRuntime) => fbs._("导出与删除属于敏感操作，继续前需要一次新鲜的 Discord 授权验证。", null, { hk: "45vyEG" });
export const account_confirmTitle = (fbs: FbsRuntime) => fbs._("确认删除账号", null, { hk: "4GEVJA" });
export const account_confirmIntro = (fbs: FbsRuntime) => fbs._("请仔细阅读删除后果。提交后进入 7 天冷静期，到期自动执行：", null, { hk: "3ssclb" });
export const account_consequenceCars = (fbs: FbsRuntime) => fbs._("你创建的车队不会被删除：车头会解绑为无主车队，创建者显示名替换为「已注销用户」；你在他人车队里的座位会被原地匿名化。", null, { hk: "4DnIic" });
export const account_consequenceData = (fbs: FbsRuntime) => fbs._("你的装备库与方案、推送令牌、昵称快照、百业名册行会被彻底删除；执行后你在所有设备上的登录会立即失效。", null, { hk: "tDGNE" });
export const account_consequenceGuilds = (fbs: FbsRuntime) => fbs._("百业本身与百业管理密码不受影响：百业不属于任何个人账号，不会因你删除账号而解散或变更。", null, { hk: "3hTFaE" });
export const account_consequenceResidual = (fbs: FbsRuntime) => fbs._("少数记录无法按个人清除：已经发到 Discord 的消息、成绩榜里的自由文本名单会保留；备份中的副本最迟在 14 天内随每日备份轮换清除。", null, { hk: "1tY20d" });
export const account_consequenceReregister = (fbs: FbsRuntime) => fbs._("删除不是封禁：之后用同一个 Discord 账号重新登录，就会注册成一个全新的账号。", null, { hk: "2WcvFl" });
export const account_exportFirstHint = (fbs: FbsRuntime) => fbs._("建议先导出一份你的数据，再提交删除。", null, { hk: "Lmt7s" });
export const account_usernameLabel = (fbs: FbsRuntime) => fbs._("输入你的 Discord 显示名以确认", null, { hk: "FE1QL" });
export const account_submitLabel = (fbs: FbsRuntime) => fbs._("提交删除申请", null, { hk: "3bBHIa" });
export const account_backLabel = (fbs: FbsRuntime) => fbs._("返回", null, { hk: "3sUiGI" });
export const account_pendingTitle = (fbs: FbsRuntime) => fbs._("账号删除已排期", null, { hk: "123jqO" });
export const account_pendingBody = (fbs: FbsRuntime, p?: StringParams) => fbs._("你的账号将于 {date} 执行删除。到期前你可以随时撤销；用新设备重新登录也会自动撤销（到期后除外）。", [fbs._param("date", pv(p, "date"))], { hk: "492HRp" });
export const account_cancelDeletionLabel = (fbs: FbsRuntime) => fbs._("撤销删除", null, { hk: "2Cc9Hs" });
export const account_deletionRequestedText = (fbs: FbsRuntime) => fbs._("删除申请已提交，7 天冷静期开始。", null, { hk: "2k7nWJ" });
export const account_deletionCancelledText = (fbs: FbsRuntime) => fbs._("删除申请已撤销，你的账号不会被删除。", null, { hk: "3O75jx" });
export const account_exportAbout = (fbs: FbsRuntime) => fbs._("这是你账号数据的导出副本。account 是账号资料（oauth 只记录授权范围与最近刷新时间，凭据本身不导出）；guilds 是你在各百业的名册行；serverNicks 是你在各 Discord 服务器的昵称快照；carsLed 是你创建的车队；seats 是你的报名座位；gearItems 是装备库；gearBuilds 是已保存方案；heirloom 是传家宝推送的去重状态。推送令牌属于设备凭据，只记录数量与平台，令牌本身不导出。", null, { hk: "1z9HId" });
export const account_deletedUser = (fbs: FbsRuntime) => fbs._("已注销用户", null, { hk: "1EEgqZ" });
export const buildshare_kicker = (fbs: FbsRuntime) => fbs._("装备方案 · 公开分享", null, { hk: "51eY3" });
export const buildshare_loginLabel = (fbs: FbsRuntime) => fbs._("打开燕云百业", null, { hk: "3XaPDB" });
export const buildshare_notFoundTitle = (fbs: FbsRuntime) => fbs._("链接已失效", null, { hk: "1Wv006" });
export const buildshare_notFoundBody = (fbs: FbsRuntime) => fbs._("这条分享链接不存在，或已被方案主人取消分享。", null, { hk: "3K1GvQ" });
export const buildshare_xinfaLabel = (fbs: FbsRuntime) => fbs._("心法", null, { hk: "pogF2" });
export const landing_featuresTitle = (fbs: FbsRuntime) => fbs._("为百业同道而备", null, { hk: "3du36p" });
export const landing_groupingTitle = (fbs: FbsRuntime) => fbs._("组队报名", null, { hk: "3JRuqp" });
export const landing_groupingBody = (fbs: FbsRuntime) => fbs._("双十、天赋、竞速、爬塔四类车队一键成行，席位名册一目了然，短链分享直达车队页。", null, { hk: "1dsTrP" });
export const landing_reminderTitle = (fbs: FbsRuntime) => fbs._("发车提醒", null, { hk: "2jQqJL" });
export const landing_reminderBody = (fbs: FbsRuntime) => fbs._("发车前自动提醒到 Discord 频道与手机 App，就位确认先行，只催还没到场的人。", null, { hk: "36Qc1H" });
export const landing_dexTitle = (fbs: FbsRuntime) => fbs._("图鉴与攻略", null, { hk: "1QBXN5" });
export const landing_dexBody = (fbs: FbsRuntime) => fbs._("副本、首领图鉴与机制攻略，十一流派毕业词缀与配装参考，随国际服版本更新。", null, { hk: "17iH96" });
export const landing_gearTitle = (fbs: FbsRuntime) => fbs._("装备规划", null, { hk: "1J9U1" });
export const landing_gearBody = (fbs: FbsRuntime) => fbs._("个人装备库与搭配筹谋：粘贴、截图识别或手动录入，承音调律与毕业度测算，离毕业还差多少一眼看清。", null, { hk: "4Gogmf" });
export const feedback_entryLabel = (fbs: FbsRuntime) => fbs._("意见反馈", null, { hk: "2iinuc" });
export const feedback_title = (fbs: FbsRuntime) => fbs._("意见反馈", null, { hk: "1351dn" });
export const feedback_categoryLabel = (fbs: FbsRuntime) => fbs._("类别", null, { hk: "XzdVT" });
export const feedback_catProblem = (fbs: FbsRuntime) => fbs._("问题", null, { hk: "25EGZt" });
export const feedback_catSuggestion = (fbs: FbsRuntime) => fbs._("建议", null, { hk: "KtkM9" });
export const feedback_catOther = (fbs: FbsRuntime) => fbs._("其他", null, { hk: "2G4CgP" });
export const feedback_placeholder = (fbs: FbsRuntime) => fbs._("请描述遇到的问题，或写下你的建议…", null, { hk: "1LyVbK" });
export const feedback_submit = (fbs: FbsRuntime) => fbs._("提交反馈", null, { hk: "2kl5j4" });
export const feedback_submitting = (fbs: FbsRuntime) => fbs._("提交中…", null, { hk: "jtGVT" });
export const feedback_success = (fbs: FbsRuntime) => fbs._("已收到，感谢你的反馈。", null, { hk: "24y5ze" });
export const announcements_title = (fbs: FbsRuntime) => fbs._("百业公告", null, { hk: "2rdImP" });
export const announcements_emptyText = (fbs: FbsRuntime) => fbs._("暂无公告", null, { hk: "2GZaOo" });
export const announcements_urgentLabel = (fbs: FbsRuntime) => fbs._("紧急集合", null, { hk: "3EPS25" });
export const announcements_standardLabel = (fbs: FbsRuntime) => fbs._("公告", null, { hk: "2B48Ti" });
export const announcements_unreadLabel = (fbs: FbsRuntime) => fbs._("未读", null, { hk: "1yRIqp" });
export const announcements_readLabel = (fbs: FbsRuntime) => fbs._("已读", null, { hk: "1n14MX" });
export const announcements_composeTitle = (fbs: FbsRuntime) => fbs._("发布公告", null, { hk: "3LOq2v" });
export const announcements_kindLabel = (fbs: FbsRuntime) => fbs._("类型", null, { hk: "4y9izH" });
export const announcements_kindStandardLabel = (fbs: FbsRuntime) => fbs._("普通公告", null, { hk: "1iLQfw" });
export const announcements_kindUrgentLabel = (fbs: FbsRuntime) => fbs._("紧急集合呼叫", null, { hk: "4veYft" });
export const announcements_titleLabel = (fbs: FbsRuntime) => fbs._("标题", null, { hk: "4bgrzB" });
export const announcements_titlePlaceholder = (fbs: FbsRuntime) => fbs._("公告标题", null, { hk: "1Cyezk" });
export const announcements_bodyLabel = (fbs: FbsRuntime) => fbs._("正文", null, { hk: "3ST7yl" });
export const announcements_bodyPlaceholder = (fbs: FbsRuntime) => fbs._("公告正文", null, { hk: "1vqVYz" });
export const announcements_postLabel = (fbs: FbsRuntime) => fbs._("发布并推送", null, { hk: "2PBBqS" });
export const announcements_postingLabel = (fbs: FbsRuntime) => fbs._("发布中…", null, { hk: "13ercY" });
export const announcements_postedText = (fbs: FbsRuntime) => fbs._("公告已发布", null, { hk: "WkEht" });
export const announcements_deleteLabel = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "1kllN6" });
export const announcements_deleteConfirmTitle = (fbs: FbsRuntime) => fbs._("删除这条公告？", null, { hk: "1NEaUQ" });
export const announcements_deleteConfirmMessage = (fbs: FbsRuntime, p?: StringParams) => fbs._("确定要删除公告「{title}」吗？已读记录会一并删除。", [fbs._param("title", pv(p, "title"))], { hk: "1ByVUx" });
export const announcements_deletedText = (fbs: FbsRuntime) => fbs._("公告已删除", null, { hk: "3DdIuK" });
export const announcements_receiptsTitle = (fbs: FbsRuntime) => fbs._("阅读情况", null, { hk: "32uux3" });
export const announcements_readCountTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("已读 {read} / {total}", [fbs._param("read", pv(p, "read")), fbs._param("total", pv(p, "total"))], { hk: "1o2RBB" });
export const announcements_readListLabel = (fbs: FbsRuntime) => fbs._("已读成员", null, { hk: "3CcsYP" });
export const announcements_unreadListLabel = (fbs: FbsRuntime) => fbs._("未读成员", null, { hk: "4faIgU" });
export const announcements_authorTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{name} 发布", [fbs._param("name", pv(p, "name"))], { hk: "2TBi3C" });
export const announcements_pushNote = (fbs: FbsRuntime) => fbs._("发布后会向全体成员推送通知；没有开启推送的成员也能在这里看到。", null, { hk: "3szI54" });
export const announcements_urgentNote = (fbs: FbsRuntime) => fbs._("紧急集合呼叫请只用于临时集合等紧急情况，每天最多 2 次。", null, { hk: "1NQJD0" });
export const announcements_dailyLimitTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("今日还可发布 {remaining} 条", [fbs._param("remaining", pv(p, "remaining"))], { hk: "1X0GIk" });
export const schedule_title = (fbs: FbsRuntime) => fbs._("排期", null, { hk: "3rqYaj" });
export const schedule_myTitle = (fbs: FbsRuntime) => fbs._("我的可用时间", null, { hk: "4nxOrJ" });
export const schedule_myHint = (fbs: FbsRuntime) => fbs._("填写你每周固定有空的时段，按你所在时区显示；管理员与车头据此定档期。", null, { hk: "2jZpwe" });
export const schedule_slotRange = (fbs: FbsRuntime, p?: StringParams) => fbs._("{start}–{end}", [fbs._param("start", pv(p, "start")), fbs._param("end", pv(p, "end"))], { hk: "2ANqy7" });
export const schedule_addSlotLabel = (fbs: FbsRuntime) => fbs._("添加时段", null, { hk: "2VYtW" });
export const schedule_removeLabel = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "ejdU9" });
export const schedule_saveLabel = (fbs: FbsRuntime) => fbs._("保存", null, { hk: "3eoE6W" });
export const schedule_savedText = (fbs: FbsRuntime) => fbs._("可用时间已保存", null, { hk: "1bh9RO" });
export const schedule_saveFailedTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("保存失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "2qONmn" });
export const schedule_emptyMineText = (fbs: FbsRuntime) => fbs._("你还没有填写可用时间。", null, { hk: "4mmv6O" });
export const schedule_summaryTitle = (fbs: FbsRuntime) => fbs._("成员可用性汇总", null, { hk: "1ZbKsN" });
export const schedule_summaryHint = (fbs: FbsRuntime) => fbs._("汇总仅百业管理员与发过车的车头可见，用于定档期。", null, { hk: "3NXwyr" });
export const schedule_summaryEmptyText = (fbs: FbsRuntime) => fbs._("还没有成员填写可用时间。", null, { hk: "3rgJIF" });
export const schedule_pollsTitle = (fbs: FbsRuntime) => fbs._("活动时间投票", null, { hk: "2a4Zbn" });
export const schedule_pollsHint = (fbs: FbsRuntime) => fbs._("给出几个候选时间，成员勾选所有能参加的时间；可参加人数最多的时段最适合定档。", null, { hk: "21C0Il" });
export const schedule_pollEmptyText = (fbs: FbsRuntime) => fbs._("还没有时间投票。", null, { hk: "2D4gAX" });
export const schedule_pollCreateLabel = (fbs: FbsRuntime) => fbs._("发起投票", null, { hk: "DfurE" });
export const schedule_pollTitleLabel = (fbs: FbsRuntime) => fbs._("投票标题", null, { hk: "4aIGaN" });
export const schedule_pollTitlePlaceholder = (fbs: FbsRuntime) => fbs._("如：本周开荒时间", null, { hk: "2TaAQ0" });
export const schedule_pollCandidatesLabel = (fbs: FbsRuntime) => fbs._("候选时间", null, { hk: "467fwR" });
export const schedule_pollAddCandidateLabel = (fbs: FbsRuntime) => fbs._("添加候选", null, { hk: "2CMdlo" });
export const schedule_pollSubmitLabel = (fbs: FbsRuntime) => fbs._("发布投票", null, { hk: "2soFfm" });
export const schedule_pollVoteLabel = (fbs: FbsRuntime) => fbs._("提交投票", null, { hk: "XP8Nz" });
export const schedule_pollVotedText = (fbs: FbsRuntime) => fbs._("已投票，可修改后重新提交。", null, { hk: "edXVJ" });
export const schedule_pollStatusOpenText = (fbs: FbsRuntime) => fbs._("进行中", null, { hk: "44Cw0j" });
export const schedule_pollStatusClosedText = (fbs: FbsRuntime) => fbs._("已关闭", null, { hk: "4BmQiK" });
export const schedule_pollCloseLabel = (fbs: FbsRuntime) => fbs._("关闭投票", null, { hk: "2W2n6k" });
export const schedule_pollVoteCountTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{count} 人可参加", [fbs._param("count", pv(p, "count"))], { hk: "2EI6k0" });
export const schedule_pollLaunchLabel = (fbs: FbsRuntime) => fbs._("以此时间发车", null, { hk: "3CtHJC" });
export const schedule_pollCancelLabel = (fbs: FbsRuntime) => fbs._("取消", null, { hk: "1lAUHh" });
export const schedule_toastPollCreated = (fbs: FbsRuntime) => fbs._("投票已发布", null, { hk: "1Q2uAf" });
export const schedule_toastVoted = (fbs: FbsRuntime) => fbs._("已提交", null, { hk: "3ycOm9" });
export const schedule_toastClosed = (fbs: FbsRuntime) => fbs._("投票已关闭", null, { hk: "3I4Yrg" });
export const schedule_toastFailedTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("操作失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "DL1dY" });
export const recruit_entryLabel = (fbs: FbsRuntime) => fbs._("招新 / 新人清单", null, { hk: "2SNTpV" });
export const recruit_title = (fbs: FbsRuntime) => fbs._("招新与新人", null, { hk: "4t6XP4" });
export const recruit_body = (fbs: FbsRuntime) => fbs._("想加入这个百业？提交一份入业申请，百业管理员会在管理面审核。已经在业的新人可以在这里看自己的入业清单与导师配对。", null, { hk: "4heuQp" });
export const recruit_applySectionTitle = (fbs: FbsRuntime) => fbs._("入业申请", null, { hk: "3o8oyN" });
export const recruit_messageLabel = (fbs: FbsRuntime) => fbs._("申请附言", null, { hk: "3wtkco" });
export const recruit_messagePlaceholder = (fbs: FbsRuntime) => fbs._("一句自我介绍（可选）：常玩的流派、在线时间……", null, { hk: "3oSljV" });
export const recruit_submitButton = (fbs: FbsRuntime) => fbs._("提交申请", null, { hk: "2Fq0my" });
export const recruit_submittingButton = (fbs: FbsRuntime) => fbs._("提交中…", null, { hk: "4lLar1" });
export const recruit_myApplicationTitle = (fbs: FbsRuntime) => fbs._("我的申请", null, { hk: "40oHah" });
export const recruit_statusPending = (fbs: FbsRuntime) => fbs._("待审核", null, { hk: "3m2NQp" });
export const recruit_statusApproved = (fbs: FbsRuntime) => fbs._("已通过", null, { hk: "1ftnLz" });
export const recruit_statusRejected = (fbs: FbsRuntime) => fbs._("未通过", null, { hk: "4m0UQf" });
export const recruit_pendingHint = (fbs: FbsRuntime) => fbs._("管理员审核中，请耐心等待；审核结果会直接更新在这里。", null, { hk: "3gukMi" });
export const recruit_approvedNextStep = (fbs: FbsRuntime) => fbs._("申请已通过，你已登记进百业名册。最后一步在 Discord 完成：加入本百业绑定的 Discord 服务器——成员资格由 Discord 服务器成员身份决定，平台没有 Discord 机器人权限，无法替你加入服务器或授予身份组；加入后用同一账号登录即可使用百业全部功能。", null, { hk: "3zFu2O" });
export const recruit_rejectedHint = (fbs: FbsRuntime) => fbs._("本次申请未通过。可以修改附言后重新提交一份新申请。", null, { hk: "2vZqEx" });
export const recruit_checklistTitle = (fbs: FbsRuntime) => fbs._("新手入业清单", null, { hk: "pzcEa" });
export const recruit_checklistProgress = (fbs: FbsRuntime, p?: StringParams) => fbs._("已完成 {done} / {total}", [fbs._param("done", pv(p, "done")), fbs._param("total", pv(p, "total"))], { hk: "1aH2Up" });
export const recruit_itemProfileLabel = (fbs: FbsRuntime) => fbs._("完善流派 / 时区", null, { hk: "18sWlq" });
export const recruit_itemProfileHint = (fbs: FbsRuntime) => fbs._("在任意车队报名落座时填上你的流派即算完成；时区由你的客户端自动同步，无需手动填写。", null, { hk: "veXu3" });
export const recruit_itemMentorLabel = (fbs: FbsRuntime) => fbs._("认一位导师", null, { hk: "4s9vPR" });
export const recruit_itemMentorHint = (fbs: FbsRuntime) => fbs._("由百业管理员为你配对一位导师后自动完成。", null, { hk: "1yCgGK" });
export const recruit_itemFirstRunLabel = (fbs: FbsRuntime) => fbs._("打完第一场", null, { hk: "1R9KHn" });
export const recruit_itemFirstRunHint = (fbs: FbsRuntime) => fbs._("在一辆已完成的车队里落座后自动完成。", null, { hk: "35ZL1B" });
export const recruit_myPairingsTitle = (fbs: FbsRuntime) => fbs._("我的导师配对", null, { hk: "4hoB1r" });
export const recruit_pairingStatusActive = (fbs: FbsRuntime) => fbs._("进行中", null, { hk: "45lgXQ" });
export const recruit_pairingStatusEnded = (fbs: FbsRuntime) => fbs._("已结束", null, { hk: "G2QDI" });
export const recruit_mentorRoleLabel = (fbs: FbsRuntime) => fbs._("导师", null, { hk: "2o5QNB" });
export const recruit_menteeRoleLabel = (fbs: FbsRuntime) => fbs._("新人", null, { hk: "1rZagp" });
export const recruit_lockedTitle = (fbs: FbsRuntime) => fbs._("无法打开招新页", null, { hk: "3z4Q8J" });
export const recruit_lockedBody = (fbs: FbsRuntime) => fbs._("请先用 Discord 账号登录；若已登录，可能是该百业不存在。", null, { hk: "KiI2u" });
export const recruit_adminApplicationsTitle = (fbs: FbsRuntime) => fbs._("入业申请审核", null, { hk: "2FReE8" });
export const recruit_adminApplicationsEmpty = (fbs: FbsRuntime) => fbs._("暂无申请记录。", null, { hk: "1LdEu6" });
export const recruit_adminApproveButton = (fbs: FbsRuntime) => fbs._("通过", null, { hk: "1CywMp" });
export const recruit_adminRejectButton = (fbs: FbsRuntime) => fbs._("拒绝", null, { hk: "2nXKuG" });
export const recruit_adminMentorPoolTitle = (fbs: FbsRuntime) => fbs._("导师人选", null, { hk: "x6XTC" });
export const recruit_adminSetMentorButton = (fbs: FbsRuntime) => fbs._("设为导师", null, { hk: "2vvBWI" });
export const recruit_adminUnsetMentorButton = (fbs: FbsRuntime) => fbs._("取消导师", null, { hk: "JcSx2" });
export const recruit_adminPairingsTitle = (fbs: FbsRuntime) => fbs._("导师配对", null, { hk: "w9eds" });
export const recruit_adminPairingsEmpty = (fbs: FbsRuntime) => fbs._("暂无配对记录。", null, { hk: "CbJsV" });
export const recruit_adminPairingCreateButton = (fbs: FbsRuntime) => fbs._("建立配对", null, { hk: "nAAix" });
export const recruit_adminPairingEndButton = (fbs: FbsRuntime) => fbs._("结束配对", null, { hk: "3m4SDf" });
export const recruit_adminMentorSelectLabel = (fbs: FbsRuntime) => fbs._("选择导师", null, { hk: "45sOSH" });
export const recruit_adminMenteeSelectLabel = (fbs: FbsRuntime) => fbs._("选择新人", null, { hk: "3yg8YS" });
export const recruit_adminNewcomersTitle = (fbs: FbsRuntime) => fbs._("新人清单进度", null, { hk: "3NjXLO" });
export const recruit_adminNewcomersEmpty = (fbs: FbsRuntime) => fbs._("暂无未完成清单的新人。", null, { hk: "2B1p8r" });
export const officer_notesTitle = (fbs: FbsRuntime) => fbs._("成员备注", null, { hk: "1uWjyO" });
export const officer_notesHint = (fbs: FbsRuntime) => fbs._("备注仅百业管理员可见，成员本人看不到关于自己的备注。", null, { hk: "6QxqA" });
export const officer_notesEmpty = (fbs: FbsRuntime) => fbs._("本百业暂无成员名册。", null, { hk: "3oQiWw" });
export const officer_memberNoNotes = (fbs: FbsRuntime) => fbs._("暂无备注", null, { hk: "3ntGnC" });
export const officer_notePlaceholder = (fbs: FbsRuntime) => fbs._("写一条备注…", null, { hk: "oJNSk" });
export const officer_noteAddButton = (fbs: FbsRuntime) => fbs._("添加备注", null, { hk: "2hs9i4" });
export const officer_noteEditButton = (fbs: FbsRuntime) => fbs._("编辑", null, { hk: "3wK2LT" });
export const officer_noteSaveButton = (fbs: FbsRuntime) => fbs._("保存", null, { hk: "1seiVI" });
export const officer_noteDeleteButton = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "fnsto" });
export const officer_noteAuthorTemplate = (fbs: FbsRuntime, p?: StringParams) => fbs._("{name} 添加", [fbs._param("name", pv(p, "name"))], { hk: "4n9nJ" });
export const officer_exportTitle = (fbs: FbsRuntime) => fbs._("百业数据包", null, { hk: "4j60Zn" });
export const officer_exportHint = (fbs: FbsRuntime) => fbs._("导出本百业的名册、组队历史与参与记录、成员赛季目标（JSON 文件）。导出动作会留痕记录。", null, { hk: "1BCLf9" });
export const officer_exportButton = (fbs: FbsRuntime) => fbs._("导出数据包", null, { hk: "4dGVMI" });
export const officer_exportAbout = (fbs: FbsRuntime) => fbs._("百业数据包导出：包含本百业名册、组队历史与参与记录、成员赛季目标。军官备注为内部工作记录，不包含在本数据包内。", null, { hk: "3jr56S" });
export const officer_goalsTitle = (fbs: FbsRuntime) => fbs._("成员赛季目标", null, { hk: "1rICOR" });
export const officer_goalsHint = (fbs: FbsRuntime) => fbs._("成员给自己设的赛季目标与进度，只读总览。", null, { hk: "4mSTfN" });
export const officer_goalsEmpty = (fbs: FbsRuntime) => fbs._("暂无成员设置赛季目标。", null, { hk: "esfuV" });
export const officer_statusActive = (fbs: FbsRuntime) => fbs._("进行中", null, { hk: "LOe21" });
export const officer_statusDone = (fbs: FbsRuntime) => fbs._("已完成", null, { hk: "2LbTwa" });
export const officer_statusDropped = (fbs: FbsRuntime) => fbs._("已放弃", null, { hk: "RUM93" });
export const officer_myEntryLabel = (fbs: FbsRuntime) => fbs._("赛季目标", null, { hk: "3gJ3GY" });
export const officer_myTitle = (fbs: FbsRuntime) => fbs._("我的赛季目标", null, { hk: "xW3DA" });
export const officer_myHint = (fbs: FbsRuntime) => fbs._("在某个百业里给自己定一个本赛季目标，进度由你自己维护；该百业的管理员可以查看总览。", null, { hk: "1KSMNl" });
export const officer_myEmpty = (fbs: FbsRuntime) => fbs._("你还没有设置赛季目标。", null, { hk: "oZld0" });
export const officer_goalGuildLabel = (fbs: FbsRuntime) => fbs._("所属百业", null, { hk: "4D8LvC" });
export const officer_goalTitleLabel = (fbs: FbsRuntime) => fbs._("目标", null, { hk: "2T1M5N" });
export const officer_goalTitlePlaceholder = (fbs: FbsRuntime) => fbs._("例如：打通某个副本、集齐一套装备…", null, { hk: "qUYlz" });
export const officer_goalNoteLabel = (fbs: FbsRuntime) => fbs._("进度备注", null, { hk: "3mDS7F" });
export const officer_goalNotePlaceholder = (fbs: FbsRuntime) => fbs._("记录当前进度…", null, { hk: "4jXz2E" });
export const officer_goalDungeonLabel = (fbs: FbsRuntime) => fbs._("关联副本（可选）", null, { hk: "4czy04" });
export const officer_goalDungeonNone = (fbs: FbsRuntime) => fbs._("不关联副本", null, { hk: "13t8q3" });
export const officer_goalStatusLabel = (fbs: FbsRuntime) => fbs._("状态", null, { hk: "3srvKd" });
export const officer_goalAddButton = (fbs: FbsRuntime) => fbs._("添加目标", null, { hk: "11LtGX" });
export const officer_goalSaveButton = (fbs: FbsRuntime) => fbs._("保存", null, { hk: "JTUNX" });
export const officer_goalEditButton = (fbs: FbsRuntime) => fbs._("编辑", null, { hk: "3kyMdw" });
export const officer_goalDeleteButton = (fbs: FbsRuntime) => fbs._("删除", null, { hk: "1uCukO" });
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
	"recruit_entryLabel": recruit_entryLabel,
	"recruit_title": recruit_title,
	"recruit_body": recruit_body,
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
	"recruit_pairingStatusActive": recruit_pairingStatusActive,
	"recruit_pairingStatusEnded": recruit_pairingStatusEnded,
	"recruit_mentorRoleLabel": recruit_mentorRoleLabel,
	"recruit_menteeRoleLabel": recruit_menteeRoleLabel,
	"recruit_lockedTitle": recruit_lockedTitle,
	"recruit_lockedBody": recruit_lockedBody,
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
