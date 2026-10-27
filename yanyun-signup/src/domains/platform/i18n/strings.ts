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
export const guildHome_readOnlyBanner = (fbs: FbsRuntime) => fbs._("该百业尚未绑定 Discord 服务器 · 只读浏览", null, { hk: "3AuuxG" });
export const guildHome_adminLink = (fbs: FbsRuntime) => fbs._("管理", null, { hk: "24ndE2" });
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
export const privacyBody_s5b = (fbs: FbsRuntime) => fbs._("你可以申请查询、更正或删除你的个人数据。目前本站尚未提供自助注销功能，请通过下方联系渠道提出申请，我们会在合理期限内处理。你也可以随时在 Discord 的设置中断开本站的授权；授权失效后，你在本站的会话会自动作废。", null, { hk: "2QU0Hc" });
export const privacyBody_s6h = (fbs: FbsRuntime) => fbs._("联系我们", null, { hk: "1TH1hQ" });
export const privacyBody_s6b = (fbs: FbsRuntime) => fbs._("如对本政策有疑问，或需提出查询、更正、删除申请，请通过本站社区百业「叽哩呱啦」的 Discord 服务器联系管理员。我们会先核实你的 Discord 账号身份，再处理你的申请。", null, { hk: "xLPMP" });
export const errors_rateLimited = (fbs: FbsRuntime) => fbs._("操作过于频繁, 请稍后再试", null, { hk: "14wqad" });
export const errors_createRateLimited = (fbs: FbsRuntime) => fbs._("创建太频繁, 请稍后再试", null, { hk: "3xfZZs" });
export const errors_guildNotFound = (fbs: FbsRuntime) => fbs._("百业不存在", null, { hk: "399FaN" });
export const errors_gearNotFound = (fbs: FbsRuntime) => fbs._("装备不存在或不属于你", null, { hk: "19Xtd5" });
export const errors_gearEmptyBuild = (fbs: FbsRuntime) => fbs._("搭配为空", null, { hk: "FwMOi" });
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
export const STRING_FNS: Record<string, StringFn> = {
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
	"guildHome.backPlain": guildHome_backPlain,
	"guildHome.tabTeam": guildHome_tabTeam,
	"guildHome.tabDex": guildHome_tabDex,
	"guildHome.tabSect": guildHome_tabSect,
	"guildHome.readOnlyBanner": guildHome_readOnlyBanner,
	"guildHome.adminLink": guildHome_adminLink,
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
	"groupingDetail.readyProgress": groupingDetail_readyProgress,
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
	"seat.leader": seat_leader,
	"seat.readyMark": seat_readyMark,
	"seat.readyAction": seat_readyAction,
	"seat.unreadyAction": seat_unreadyAction,
	"seat.toastReady": seat_toastReady,
	"seat.toastUnready": seat_toastUnready,
	"seat.toastReadyFailed": seat_toastReadyFailed,
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
	"sect.tabAffix": sect_tabAffix,
	"sect.affixEmpty": sect_affixEmpty,
	"sect.affixSetLabel": sect_affixSetLabel,
	"sect.affixBowLabel": sect_affixBowLabel,
	"sect.affixDingyinLabel": sect_affixDingyinLabel,
	"sect.affixColAffix": sect_affixColAffix,
	"sect.affixColCount": sect_affixColCount,
	"sect.affixColMax": sect_affixColMax,
	"sect.affixColCy": sect_affixColCy,
	"sect.affixSource": sect_affixSource,
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
	"gear.manualTitle": gear_manualTitle,
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
	"errors.notSeated": errors_notSeated,
	"errors.reminderOffsetsInvalid": errors_reminderOffsetsInvalid,
	"errors.ogAccentInvalid": errors_ogAccentInvalid,
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
	"errors.adminOnly": errors_adminOnly,
	"errors.webhookInvalid": errors_webhookInvalid,
	"errors.discordIdInvalid": errors_discordIdInvalid,
	"errors.noFieldsToUpdate": errors_noFieldsToUpdate,
	"errors.signupNotFound": errors_signupNotFound,
	"errors.resultNotFound": errors_resultNotFound,
	"errors.resultTeamRequired": errors_resultTeamRequired,
	"errors.resultTimeInvalid": errors_resultTimeInvalid,
	"errors.avatarDataInvalid": errors_avatarDataInvalid,
	"errors.schoolRequired": errors_schoolRequired,
	"errors.generic": errors_generic,
	"errors.templateNotFound": errors_templateNotFound,
	"errors.templateNameRequired": errors_templateNameRequired,
	"errors.templateForbidden": errors_templateForbidden,
	"errors.templateBadStart": errors_templateBadStart,
	"guildAdmin.title": guildAdmin_title,
	"guildAdmin.lockedTitle": guildAdmin_lockedTitle,
	"guildAdmin.lockedBody": guildAdmin_lockedBody,
	"guildAdmin.backLink": guildAdmin_backLink,
	"guildAdmin.tabProfile": guildAdmin_tabProfile,
	"guildAdmin.tabDiscord": guildAdmin_tabDiscord,
	"guildAdmin.tabEvents": guildAdmin_tabEvents,
	"guildAdmin.tabGuides": guildAdmin_tabGuides,
	"guildAdmin.saveButton": guildAdmin_saveButton,
	"guildAdmin.savedText": guildAdmin_savedText,
	"guildAdmin.deleteButton": guildAdmin_deleteButton,
	"guildAdmin.editButton": guildAdmin_editButton,
	"guildAdmin.addButton": guildAdmin_addButton,
	"guildAdmin.profileTitle": guildAdmin_profileTitle,
	"guildAdmin.nameLabel": guildAdmin_nameLabel,
	"guildAdmin.announcementLabel": guildAdmin_announcementLabel,
	"guildAdmin.sloganLabel": guildAdmin_sloganLabel,
	"guildAdmin.masterNameLabel": guildAdmin_masterNameLabel,
	"guildAdmin.logoUrlLabel": guildAdmin_logoUrlLabel,
	"guildAdmin.bgImageUrlLabel": guildAdmin_bgImageUrlLabel,
	"guildAdmin.avatarTitle": guildAdmin_avatarTitle,
	"guildAdmin.avatarUpload": guildAdmin_avatarUpload,
	"guildAdmin.avatarReplace": guildAdmin_avatarReplace,
	"guildAdmin.avatarDelete": guildAdmin_avatarDelete,
	"guildAdmin.avatarNone": guildAdmin_avatarNone,
	"guildAdmin.avatarHint": guildAdmin_avatarHint,
	"guildAdmin.discordTitle": guildAdmin_discordTitle,
	"guildAdmin.webhookLabel": guildAdmin_webhookLabel,
	"guildAdmin.webhookSet": guildAdmin_webhookSet,
	"guildAdmin.webhookUnset": guildAdmin_webhookUnset,
	"guildAdmin.webhookHint": guildAdmin_webhookHint,
	"guildAdmin.webhookClear": guildAdmin_webhookClear,
	"guildAdmin.guildIdLabel": guildAdmin_guildIdLabel,
	"guildAdmin.guildIdUnbound": guildAdmin_guildIdUnbound,
	"guildAdmin.reminderTitle": guildAdmin_reminderTitle,
	"guildAdmin.reminderOffsetsLabel": guildAdmin_reminderOffsetsLabel,
	"guildAdmin.reminderOffsetOption": guildAdmin_reminderOffsetOption,
	"guildAdmin.reminderCustomTextLabel": guildAdmin_reminderCustomTextLabel,
	"guildAdmin.reminderCustomTextHint": guildAdmin_reminderCustomTextHint,
	"guildAdmin.visibilityTitle": guildAdmin_visibilityTitle,
	"guildAdmin.devOnlyLabel": guildAdmin_devOnlyLabel,
	"guildAdmin.eventsTitle": guildAdmin_eventsTitle,
	"guildAdmin.eventEmpty": guildAdmin_eventEmpty,
	"guildAdmin.eventTitleLabel": guildAdmin_eventTitleLabel,
	"guildAdmin.eventTypeLabel": guildAdmin_eventTypeLabel,
	"guildAdmin.eventStatusLabel": guildAdmin_eventStatusLabel,
	"guildAdmin.eventTimeLabel": guildAdmin_eventTimeLabel,
	"guildAdmin.eventSlotsLabel": guildAdmin_eventSlotsLabel,
	"guildAdmin.eventMeetLabel": guildAdmin_eventMeetLabel,
	"guildAdmin.eventDescLabel": guildAdmin_eventDescLabel,
	"guildAdmin.eventDungeonLabel": guildAdmin_eventDungeonLabel,
	"guildAdmin.statusOpen": guildAdmin_statusOpen,
	"guildAdmin.statusClosed": guildAdmin_statusClosed,
	"guildAdmin.statusCompleted": guildAdmin_statusCompleted,
	"guildAdmin.statusDraft": guildAdmin_statusDraft,
	"guildAdmin.signupsTitle": guildAdmin_signupsTitle,
	"guildAdmin.signupEmpty": guildAdmin_signupEmpty,
	"guildAdmin.exportCsvButton": guildAdmin_exportCsvButton,
	"guildAdmin.removeSignupButton": guildAdmin_removeSignupButton,
	"guildAdmin.resultsTitle": guildAdmin_resultsTitle,
	"guildAdmin.resultTeamLabel": guildAdmin_resultTeamLabel,
	"guildAdmin.resultMembersLabel": guildAdmin_resultMembersLabel,
	"guildAdmin.resultTimeLabel": guildAdmin_resultTimeLabel,
	"guildAdmin.resultProofLabel": guildAdmin_resultProofLabel,
	"guildAdmin.resultNoteLabel": guildAdmin_resultNoteLabel,
	"guildAdmin.guidesTitle": guildAdmin_guidesTitle,
	"guildAdmin.guidesHint": guildAdmin_guidesHint,
	"guildAdmin.guideSchoolLabel": guildAdmin_guideSchoolLabel,
	"guildAdmin.guideBuildLabel": guildAdmin_guideBuildLabel,
	"guildAdmin.guideAttrLabel": guildAdmin_guideAttrLabel,
	"guildAdmin.guideRateLabel": guildAdmin_guideRateLabel,
	"guildAdmin.guideBisLabel": guildAdmin_guideBisLabel,
	"guildAdmin.guideRotationLabel": guildAdmin_guideRotationLabel,
	"guildAdmin.tabStats": guildAdmin_tabStats,
	"guildAdmin.statsTitle": guildAdmin_statsTitle,
	"guildAdmin.statsCurrentWeek": guildAdmin_statsCurrentWeek,
	"guildAdmin.statsCars": guildAdmin_statsCars,
	"guildAdmin.statsCompleted": guildAdmin_statsCompleted,
	"guildAdmin.statsSeats": guildAdmin_statsSeats,
	"guildAdmin.statsFillRate": guildAdmin_statsFillRate,
	"guildAdmin.statsParticipants": guildAdmin_statsParticipants,
	"guildAdmin.statsPerCapita": guildAdmin_statsPerCapita,
	"guildAdmin.statsMembersTitle": guildAdmin_statsMembersTitle,
	"guildAdmin.statsLeadersTitle": guildAdmin_statsLeadersTitle,
	"guildAdmin.statsSeatCount": guildAdmin_statsSeatCount,
	"guildAdmin.statsCarCount": guildAdmin_statsCarCount,
	"guildAdmin.statsEmpty": guildAdmin_statsEmpty,
	"guildAdmin.statsBoardEmpty": guildAdmin_statsBoardEmpty,
	"guildAdmin.whiteLabelTitle": guildAdmin_whiteLabelTitle,
	"guildAdmin.hideBrandingLabel": guildAdmin_hideBrandingLabel,
	"guildAdmin.hideBrandingHint": guildAdmin_hideBrandingHint,
	"guildAdmin.ogAccentLabel": guildAdmin_ogAccentLabel,
	"guildAdmin.ogTitleSuffixLabel": guildAdmin_ogTitleSuffixLabel,
	"guildAdmin.ogTitleSuffixHint": guildAdmin_ogTitleSuffixHint,
	"guildAdmin.ogAccentGold": guildAdmin_ogAccentGold,
	"guildAdmin.ogAccentJade": guildAdmin_ogAccentJade,
	"guildAdmin.ogAccentAzure": guildAdmin_ogAccentAzure,
	"guildAdmin.ogAccentCinnabar": guildAdmin_ogAccentCinnabar,
	"guildAdmin.ogAccentViolet": guildAdmin_ogAccentViolet,
	"groupingTemplate.sectionTitle": groupingTemplate_sectionTitle,
	"groupingTemplate.nameLabel": groupingTemplate_nameLabel,
	"groupingTemplate.namePlaceholder": groupingTemplate_namePlaceholder,
	"groupingTemplate.saveFromForm": groupingTemplate_saveFromForm,
	"groupingTemplate.updateSubmit": groupingTemplate_updateSubmit,
	"groupingTemplate.editingNotice": groupingTemplate_editingNotice,
	"groupingTemplate.cancelEdit": groupingTemplate_cancelEdit,
	"groupingTemplate.empty": groupingTemplate_empty,
	"groupingTemplate.whenToday": groupingTemplate_whenToday,
	"groupingTemplate.whenTomorrow": groupingTemplate_whenTomorrow,
	"groupingTemplate.whenDays": groupingTemplate_whenDays,
	"groupingTemplate.toastSaved": groupingTemplate_toastSaved,
	"groupingTemplate.toastSaveFailed": groupingTemplate_toastSaveFailed,
	"groupingTemplate.toastDeleted": groupingTemplate_toastDeleted,
	"groupingTemplate.toastDeleteFailed": groupingTemplate_toastDeleteFailed,
	"groupingTemplate.edit": groupingTemplate_edit,
	"groupingTemplate.delete": groupingTemplate_delete,
	"groupingTemplate.deleteConfirmTitle": groupingTemplate_deleteConfirmTitle,
	"groupingTemplate.deleteConfirmMessage": groupingTemplate_deleteConfirmMessage,
	"groupingTemplate.saveButton": groupingTemplate_saveButton,
	"groupingTemplate.saveDialogTitle": groupingTemplate_saveDialogTitle,
	"groupingTemplate.saveSubmit": groupingTemplate_saveSubmit,
	"groupingTemplate.toastSavedFromCar": groupingTemplate_toastSavedFromCar,
	"groupingTemplate.metaTemplate": groupingTemplate_metaTemplate
};
