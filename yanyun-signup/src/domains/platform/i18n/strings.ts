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
export abstract class CommonFbtUtils {
	static cancel(fbs: FbsRuntime) {
		return fbs._("取消", null, { hk: "1CiXLY" });
	}
	static confirm(fbs: FbsRuntime) {
		return fbs._("确定", null, { hk: "4pX4XR" });
	}
	static unknownError(fbs: FbsRuntime) {
		return fbs._("未知错误", null, { hk: "uDGXT" });
	}
	static renderError(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("渲染出错: {message}", [fbs._param("message", pv(p, "message"))], { hk: "24vkQx" });
	}
	static renderErrorHint(fbs: FbsRuntime) {
		return fbs._("这一页出了问题，其他页面不受影响。", null, { hk: "4cxJrX" });
	}
	static backToHub(fbs: FbsRuntime) {
		return fbs._("返回百业集结", null, { hk: "3vlM85" });
	}
	static loadingGuild(fbs: FbsRuntime) {
		return fbs._("正在展开百业…", null, { hk: "13XtSs" });
	}
	static close(fbs: FbsRuntime) {
		return fbs._("关闭", null, { hk: "HbuOI" });
	}
}
export abstract class SiteFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("百业集结", null, { hk: "1FJE8H" });
	}
	static subtitle(fbs: FbsRuntime) {
		return fbs._("燕云十六声 · 国际服百业车队与攻略集散地 —— 择一业而入，共赴双十。", null, { hk: "1ynQnz" });
	}
	static heroAlt(fbs: FbsRuntime) {
		return fbs._("水墨山水", null, { hk: "177cw2" });
	}
	static seal(fbs: FbsRuntime) {
		return fbs._("燕", null, { hk: "QfZlY" });
	}
}
export abstract class LoginFbtUtils {
	static cardTitle(fbs: FbsRuntime) {
		return fbs._("先登录，再入江湖", null, { hk: "3S8Krl" });
	}
	static cardBody1(fbs: FbsRuntime) {
		return fbs._("本站需用 Discord 账号认证后使用。", null, { hk: "VVjgD" });
	}
	static cardBody2(fbs: FbsRuntime) {
		return fbs._("登录后将按你所在的 Discord 服务器，展示你有权限访问的百业。", null, { hk: "2x3s6p" });
	}
	static button(fbs: FbsRuntime) {
		return fbs._("用 Discord 登录", null, { hk: "WKEvG" });
	}
	static privacy(fbs: FbsRuntime) {
		return fbs._("我们会读取并保存你的 Discord 昵称、头像、服务器列表与登录授权，用于成员校验与提醒功能，详见隐私政策", null, { hk: "3n1Qx9" });
	}
}
export abstract class UserBarFbtUtils {
	static logout(fbs: FbsRuntime) {
		return fbs._("退出登录", null, { hk: "4nrcRN" });
	}
	static loggingOut(fbs: FbsRuntime) {
		return fbs._("退出中…", null, { hk: "206L2t" });
	}
	static settings(fbs: FbsRuntime) {
		return fbs._("个人资料", null, { hk: "2DhZ1q" });
	}
}
export abstract class SettingsFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("个人资料", null, { hk: "3m0iPy" });
	}
	static discordLabel(fbs: FbsRuntime) {
		return fbs._("Discord 账号", null, { hk: "25yyHF" });
	}
	static languageLabel(fbs: FbsRuntime) {
		return fbs._("语言", null, { hk: "3AUEqn" });
	}
	static languageHint(fbs: FbsRuntime) {
		return fbs._("界面语言。选择「自动」时跟随浏览器语言；手动选择后保存在你的账号里，压过浏览器语言。", null, { hk: "yZK0b" });
	}
	static autoLabel(fbs: FbsRuntime) {
		return fbs._("自动（跟随浏览器）", null, { hk: "9jzwW" });
	}
	static langZhCn(fbs: FbsRuntime) {
		return fbs._("简体中文", null, { hk: "15TeYN" });
	}
	static langZhTw(fbs: FbsRuntime) {
		return fbs._("繁體中文", null, { hk: "24tFaJ" });
	}
	static langEn(fbs: FbsRuntime) {
		return fbs._("English", null, { hk: "4ggsL7" });
	}
	static langEs(fbs: FbsRuntime) {
		return fbs._("Español", null, { hk: "4CORc8" });
	}
	static langFr(fbs: FbsRuntime) {
		return fbs._("Français", null, { hk: "RixX9" });
	}
	static savedText(fbs: FbsRuntime) {
		return fbs._("已保存", null, { hk: "2leaVp" });
	}
	static calendarSectionTitle(fbs: FbsRuntime) {
		return fbs._("日历订阅", null, { hk: "m7S6c" });
	}
	static calendarHint(fbs: FbsRuntime) {
		return fbs._("把这个链接粘贴到日历应用的「订阅日历」里，你报名的车队会自动同步过去。链接包含你的专属凭证，请勿外传；怀疑泄露时可重置链接，旧链接会立即失效。", null, { hk: "2OWvAR" });
	}
	static calendarCopyLabel(fbs: FbsRuntime) {
		return fbs._("复制订阅链接", null, { hk: "1OebUy" });
	}
	static calendarCopiedText(fbs: FbsRuntime) {
		return fbs._("订阅链接已复制", null, { hk: "313p2k" });
	}
	static calendarResetLabel(fbs: FbsRuntime) {
		return fbs._("重置订阅链接", null, { hk: "418T7R" });
	}
	static calendarResetDoneText(fbs: FbsRuntime) {
		return fbs._("订阅链接已重置，旧链接已失效", null, { hk: "1kgzst" });
	}
	static calendarName(fbs: FbsRuntime) {
		return fbs._("我的车队", null, { hk: "45LSjC" });
	}
	static calendarDurationNote(fbs: FbsRuntime) {
		return fbs._("时长为预估：车队未设结束时间，按 2 小时计。", null, { hk: "15NlC4" });
	}
}
export abstract class PickerFbtUtils {
	static myGuilds(fbs: FbsRuntime) {
		return fbs._("我的百业", null, { hk: "17QhfM" });
	}
	static myGuildsEn(fbs: FbsRuntime) {
		return fbs._("My Guilds", null, { hk: "q37mh" });
	}
	static emptyTitle(fbs: FbsRuntime) {
		return fbs._("你还没有可用的百业", null, { hk: "2sEnS1" });
	}
	static emptyBody(fbs: FbsRuntime) {
		return fbs._("百业按 Discord 服务器划分：你所在的服务器若已绑定百业，它会出现在这里。若还没有，你可以把自己管理的服务器绑成一个新百业。", null, { hk: "1Qsz8x" });
	}
	static createGuild(fbs: FbsRuntime) {
		return fbs._("创建百业", null, { hk: "1ctm10" });
	}
	static createGuildMore(fbs: FbsRuntime) {
		return fbs._("+ 创建新百业", null, { hk: "44eIuq" });
	}
}
export abstract class CreateFbtUtils {
	static backLink(fbs: FbsRuntime) {
		return fbs._("‹ 我的百业", null, { hk: "4DEBet" });
	}
	static title(fbs: FbsRuntime) {
		return fbs._("创建百业", null, { hk: "1OMIvG" });
	}
	static subtitle(fbs: FbsRuntime) {
		return fbs._("绑定一个你管理的 Discord 服务器 —— 之后只有该服务器的成员能看到并使用这个百业。", null, { hk: "2Tr5np" });
	}
	static nameLabel(fbs: FbsRuntime) {
		return fbs._("百业名", null, { hk: "270YDk" });
	}
	static namePlaceholder(fbs: FbsRuntime) {
		return fbs._("如：叽哩呱啦", null, { hk: "e2Sa7" });
	}
	static slugLabel(fbs: FbsRuntime) {
		return fbs._("访问标识 slug（网址后缀，只能小写字母 / 数字 / 连字符）", null, { hk: "zLVor" });
	}
	static slugPlaceholder(fbs: FbsRuntime) {
		return fbs._("如：my-guild", null, { hk: "1FDcD1" });
	}
	static slugChecking(fbs: FbsRuntime) {
		return fbs._("检查中…", null, { hk: "3UtnOG" });
	}
	static slugAvailable(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("✓ yanyun.app/{slug} 可用", [fbs._param("slug", pv(p, "slug"))], { hk: "3b7Qwu" });
	}
	static slugTaken(fbs: FbsRuntime) {
		return fbs._("✗ 已被占用或不符合规则", null, { hk: "3QfEyR" });
	}
	static slugNote(fbs: FbsRuntime) {
		return fbs._("创建后不可更改", null, { hk: "2DmCxo" });
	}
	static serverLabel(fbs: FbsRuntime) {
		return fbs._("绑定 Discord 服务器（仅列出你有管理权限的）", null, { hk: "2OECpF" });
	}
	static noServers1(fbs: FbsRuntime) {
		return fbs._("你还没有任何可管理的 Discord 服务器。", null, { hk: "F5Be3" });
	}
	static noServers2(fbs: FbsRuntime) {
		return fbs._("先在 Discord 里建一个服务器（或拿到管理员权限），重新登录刷新列表后再来创建。", null, { hk: "1sWjTE" });
	}
	static submit(fbs: FbsRuntime) {
		return fbs._("创建百业", null, { hk: "2gNKI1" });
	}
	static submitting(fbs: FbsRuntime) {
		return fbs._("创建中…", null, { hk: "zORYc" });
	}
	static toastNameShort(fbs: FbsRuntime) {
		return fbs._("百业名至少 2 个字", null, { hk: "3TQVYO" });
	}
	static toastSlugRequired(fbs: FbsRuntime) {
		return fbs._("请填写访问标识 slug", null, { hk: "1HKDDN" });
	}
	static toastSlugBad(fbs: FbsRuntime) {
		return fbs._("这个 slug 不可用，换一个", null, { hk: "16cIqq" });
	}
	static toastServerRequired(fbs: FbsRuntime) {
		return fbs._("请选择要绑定的 Discord 服务器", null, { hk: "2HezSV" });
	}
	static toastCreated(fbs: FbsRuntime) {
		return fbs._("百业创建成功", null, { hk: "BYoKP" });
	}
	static toastFailed(fbs: FbsRuntime) {
		return fbs._("创建失败，请稍后再试", null, { hk: "1wWEzO" });
	}
}
export abstract class GuildHomeFbtUtils {
	static backToHub(fbs: FbsRuntime) {
		return fbs._("← 百业集结", null, { hk: "4qETst" });
	}
	static backPlain(fbs: FbsRuntime) {
		return fbs._("← 返回", null, { hk: "IbRN8" });
	}
	static tabTeam(fbs: FbsRuntime) {
		return fbs._("组队", null, { hk: "2M1thr" });
	}
	static tabDex(fbs: FbsRuntime) {
		return fbs._("攻略", null, { hk: "1Qw8ND" });
	}
	static tabSect(fbs: FbsRuntime) {
		return fbs._("流派攻略", null, { hk: "4c8Ifh" });
	}
	static tabAnnouncements(fbs: FbsRuntime) {
		return fbs._("公告", null, { hk: "2atzxz" });
	}
	static adminLink(fbs: FbsRuntime) {
		return fbs._("管理", null, { hk: "2d78VF" });
	}
	static tabSchedule(fbs: FbsRuntime) {
		return fbs._("排期", null, { hk: "1EEoyu" });
	}
	static tabMarket(fbs: FbsRuntime) {
		return fbs._("补位市场", null, { hk: "1xsTTH" });
	}
	static tabAllies(fbs: FbsRuntime) {
		return fbs._("盟友", null, { hk: "2c0jVq" });
	}
}
export abstract class GroupingTypeFbtUtils {
	static tabActivity(fbs: FbsRuntime) {
		return fbs._("双十人本", null, { hk: "2jK8uC" });
	}
	static tabTalent(fbs: FbsRuntime) {
		return fbs._("天赋组队", null, { hk: "4uB1wI" });
	}
	static tabRace(fbs: FbsRuntime) {
		return fbs._("竞速报名", null, { hk: "2tOEHu" });
	}
	static tabTower(fbs: FbsRuntime) {
		return fbs._("爬塔", null, { hk: "4xMJtQ" });
	}
	static tabExplore(fbs: FbsRuntime) {
		return fbs._("联机探索", null, { hk: "465XV8" });
	}
	static shortActivity(fbs: FbsRuntime) {
		return fbs._("双十", null, { hk: "438asB" });
	}
	static shortTalent(fbs: FbsRuntime) {
		return fbs._("天赋", null, { hk: "23TJZt" });
	}
	static shortRace(fbs: FbsRuntime) {
		return fbs._("竞速", null, { hk: "4uUQAV" });
	}
	static shortTower(fbs: FbsRuntime) {
		return fbs._("爬塔", null, { hk: "1ryCD" });
	}
	static shortCoopExplore(fbs: FbsRuntime) {
		return fbs._("联机探索", null, { hk: "1TO6Ls" });
	}
	static shortGather(fbs: FbsRuntime) {
		return fbs._("采集", null, { hk: "39V4fW" });
	}
	static shortExplore(fbs: FbsRuntime) {
		return fbs._("探索", null, { hk: "46xJZG" });
	}
}
export abstract class GroupingListFbtUtils {
	static weekShareImageLabel(fbs: FbsRuntime) {
		return fbs._("本周车队图", null, { hk: "RqoyN" });
	}
	static weekShareText(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{name} 本周车队图", [fbs._param("name", pv(p, "name"))], { hk: "3XW1hn" });
	}
	static weekShareImageSaved(fbs: FbsRuntime) {
		return fbs._("图片已保存、链接已复制，去微信发图粘贴即可", null, { hk: "1KPa8j" });
	}
	static weekShareImageCopied(fbs: FbsRuntime) {
		return fbs._("图片已复制，去聊天里粘贴即可", null, { hk: "1fgH4l" });
	}
	static weekShareImageFailed(fbs: FbsRuntime) {
		return fbs._("分享图获取失败，请重试", null, { hk: "2Jycqw" });
	}
	static weekCopyFailedManual(fbs: FbsRuntime) {
		return fbs._("复制失败，请手动复制地址栏链接", null, { hk: "4daQk8" });
	}
	static prevWeek(fbs: FbsRuntime) {
		return fbs._("上一周", null, { hk: "1VIUgL" });
	}
	static nextWeek(fbs: FbsRuntime) {
		return fbs._("下一周", null, { hk: "zltWk" });
	}
	static weekHeader(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{range} · {count} 队", [fbs._param("range", pv(p, "range")), fbs._param("count", pv(p, "count"))], { hk: "1s9Ksi" });
	}
	static emptyInteractive(fbs: FbsRuntime) {
		return fbs._("暂无车队，来发第一车吧", null, { hk: "2vDSDi" });
	}
	static statusOpen(fbs: FbsRuntime) {
		return fbs._("报名中", null, { hk: "2w0LaA" });
	}
	static people(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{occupied}/{max} 人", [fbs._param("occupied", pv(p, "occupied")), fbs._param("max", pv(p, "max"))], { hk: "25f8zN" });
	}
	static newCar(fbs: FbsRuntime) {
		return fbs._("📯 张贴告示 · 发新车", null, { hk: "1yjgii" });
	}
	static seal(fbs: FbsRuntime) {
		return fbs._("募", null, { hk: "2saVta" });
	}
	static dayGroupHeader(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{month}月{day}日 {weekday}", [
			fbs._param("month", pv(p, "month")),
			fbs._param("day", pv(p, "day")),
			fbs._param("weekday", pv(p, "weekday"))
		], { hk: "gSOnf" });
	}
	static weekday0(fbs: FbsRuntime) {
		return fbs._("周日", null, { hk: "1xaZh5" });
	}
	static weekday1(fbs: FbsRuntime) {
		return fbs._("周一", null, { hk: "2xkqqQ" });
	}
	static weekday2(fbs: FbsRuntime) {
		return fbs._("周二", null, { hk: "2NDcyR" });
	}
	static weekday3(fbs: FbsRuntime) {
		return fbs._("周三", null, { hk: "4ywi1w" });
	}
	static weekday4(fbs: FbsRuntime) {
		return fbs._("周四", null, { hk: "xTSQs" });
	}
	static weekday5(fbs: FbsRuntime) {
		return fbs._("周五", null, { hk: "1IZZa1" });
	}
	static weekday6(fbs: FbsRuntime) {
		return fbs._("周六", null, { hk: "1H4PGz" });
	}
	static undatedGroup(fbs: FbsRuntime) {
		return fbs._("未定时间", null, { hk: "1EVyR3" });
	}
}
export abstract class GroupingDetailFbtUtils {
	static notFound(fbs: FbsRuntime) {
		return fbs._("车队不存在或已解散", null, { hk: "JkZQr" });
	}
	static backToList(fbs: FbsRuntime) {
		return fbs._("‹ 返回车队列表", null, { hk: "4Afz4z" });
	}
	static share(fbs: FbsRuntime) {
		return fbs._("🔗 分享车队", null, { hk: "2T1YHP" });
	}
	static shareImage(fbs: FbsRuntime) {
		return fbs._("🖼 分享图", null, { hk: "13bpIc" });
	}
	static shareImageSaved(fbs: FbsRuntime) {
		return fbs._("图片已保存、链接已复制，去微信发图粘贴即可", null, { hk: "3hPFEj" });
	}
	static shareImageCopied(fbs: FbsRuntime) {
		return fbs._("图片已复制，去聊天里粘贴即可", null, { hk: "8GPQT" });
	}
	static shareImageFailed(fbs: FbsRuntime) {
		return fbs._("分享图获取失败，请重试", null, { hk: "22wMuj" });
	}
	static edit(fbs: FbsRuntime) {
		return fbs._("✏️ 编辑", null, { hk: "1w0Ren" });
	}
	static disband(fbs: FbsRuntime) {
		return fbs._("解散车队", null, { hk: "2qBbBB" });
	}
	static disbanding(fbs: FbsRuntime) {
		return fbs._("解散中…", null, { hk: "4DfQ3M" });
	}
	static statusOpen(fbs: FbsRuntime) {
		return fbs._("报名中", null, { hk: "4m4dtZ" });
	}
	static people(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{occupied}/{max} 人", [fbs._param("occupied", pv(p, "occupied")), fbs._param("max", pv(p, "max"))], { hk: "47UNcm" });
	}
	static readyProgress(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已就位 {ready}/{occupied}", [fbs._param("ready", pv(p, "ready")), fbs._param("occupied", pv(p, "occupied"))], { hk: "190tmu" });
	}
	static openHint(fbs: FbsRuntime) {
		return fbs._("人人可管 · 无需管理码 — 点空位即可落座", null, { hk: "1t3TFu" });
	}
	static toastDisbanded(fbs: FbsRuntime) {
		return fbs._("车队已解散", null, { hk: "1X1Q25" });
	}
	static toastDisbandFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("解散失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "1HhFij" });
	}
	static linkCopied(fbs: FbsRuntime) {
		return fbs._("链接已复制", null, { hk: "1jk0ZB" });
	}
	static copyFailedManual(fbs: FbsRuntime) {
		return fbs._("复制失败，请手动复制地址栏链接", null, { hk: "2DqSum" });
	}
	static disbandConfirmTitle(fbs: FbsRuntime) {
		return fbs._("解散车队", null, { hk: "23Fgs9" });
	}
	static disbandConfirmMessage(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("确定解散「{title}」吗？所有报名将被清空。", [fbs._param("title", pv(p, "title"))], { hk: "Q4K1" });
	}
	static complete(fbs: FbsRuntime) {
		return fbs._("完成车队", null, { hk: "4cgL9F" });
	}
	static completing(fbs: FbsRuntime) {
		return fbs._("完成中…", null, { hk: "1y7fBc" });
	}
	static statusCompleted(fbs: FbsRuntime) {
		return fbs._("已完成", null, { hk: "3Ci3su" });
	}
	static restore(fbs: FbsRuntime) {
		return fbs._("恢复车队", null, { hk: "13zJRI" });
	}
	static completeConfirmTitle(fbs: FbsRuntime) {
		return fbs._("完成车队", null, { hk: "1b21ik" });
	}
	static completeConfirmMessage(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("确定完成「{title}」吗？完成后将从车队列表隐藏，也不再发送发车提醒；之后仍可在本页恢复。", [fbs._param("title", pv(p, "title"))], { hk: "497bry" });
	}
	static toastCompleted(fbs: FbsRuntime) {
		return fbs._("车队已完成", null, { hk: "1qvBVX" });
	}
	static toastCompleteFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("完成失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "lyhfI" });
	}
	static toastRestored(fbs: FbsRuntime) {
		return fbs._("车队已恢复", null, { hk: "2XcpBo" });
	}
	static toastRestoreFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("恢复失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "QifSE" });
	}
	static completedHint(fbs: FbsRuntime) {
		return fbs._("该车队已完成 · 已从列表隐藏，不再发送发车提醒", null, { hk: "3S9D3R" });
	}
	static rosterAnswersTitle(fbs: FbsRuntime) {
		return fbs._("报名表答案", null, { hk: "31Ych" });
	}
	static merge(fbs: FbsRuntime) {
		return fbs._("合并车队", null, { hk: "3tEfjv" });
	}
	static mergeDialogTitle(fbs: FbsRuntime) {
		return fbs._("选择要并入的车队", null, { hk: "21kLiG" });
	}
	static mergeEmpty(fbs: FbsRuntime) {
		return fbs._("暂无可合并的车队", null, { hk: "3r6fZn" });
	}
	static mergeConfirmTitle(fbs: FbsRuntime) {
		return fbs._("确认合并", null, { hk: "1DFhkC" });
	}
	static mergeConfirmMessage(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("确定把「{title}」并入本车队吗？它的成员将整体迁入本车，同一人两边都有座位时以本车为准，超出本车人数上限的成员按报名顺序列在座位之后；合并后源车将解散。", [fbs._param("title", pv(p, "title"))], { hk: "3YkBc0" });
	}
	static mergeConfirmSubmit(fbs: FbsRuntime) {
		return fbs._("确认合并", null, { hk: "CDHrB" });
	}
	static toastMerged(fbs: FbsRuntime) {
		return fbs._("车队已合并", null, { hk: "2Zlblf" });
	}
	static toastMergeFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("合并失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "1LuwI7" });
	}
	static cloneButton(fbs: FbsRuntime) {
		return fbs._("再来一车", null, { hk: "2KJYu1" });
	}
	static cloneDialogTitle(fbs: FbsRuntime) {
		return fbs._("复制车队", null, { hk: "1wTWWO" });
	}
	static cloneToastCloned(fbs: FbsRuntime) {
		return fbs._("已复制为新车", null, { hk: "48xe5N" });
	}
	static cloneToastFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("复制失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "2bZWJJ" });
	}
	static cloneToastSkipped(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("以下成员未能带入新车（请先加入名册）：{names}", [fbs._param("names", pv(p, "names"))], { hk: "39eOzZ" });
	}
	static nudgeButton(fbs: FbsRuntime) {
		return fbs._("催报名", null, { hk: "2kzmsk" });
	}
	static nudgeDialogTitle(fbs: FbsRuntime) {
		return fbs._("催报名", null, { hk: "ZeGoy" });
	}
	static nudgeHintText(fbs: FbsRuntime) {
		return fbs._("复制下面的文案到 Discord 发送，就能 @ 到还没报名的伙伴。", null, { hk: "G2qUC" });
	}
	static nudgeMessage(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("「{title}」{time} 出发，还没报名的伙伴：{mentions}，快来占座！", [
			fbs._param("title", pv(p, "title")),
			fbs._param("time", pv(p, "time")),
			fbs._param("mentions", pv(p, "mentions"))
		], { hk: "339RPk" });
	}
	static nudgeMessageNoTime(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("「{title}」还没报名的伙伴：{mentions}，快来占座！", [fbs._param("title", pv(p, "title")), fbs._param("mentions", pv(p, "mentions"))], { hk: "U4CZm" });
	}
	static nudgeEmptyText(fbs: FbsRuntime) {
		return fbs._("名册成员都已报名，没有需要催的伙伴。", null, { hk: "tEzL6" });
	}
	static nudgeCopyLabel(fbs: FbsRuntime) {
		return fbs._("复制文案", null, { hk: "2ho77t" });
	}
	static nudgeCopiedToast(fbs: FbsRuntime) {
		return fbs._("已复制，去 Discord 粘贴发送吧", null, { hk: "1UamFj" });
	}
}
export abstract class GroupingFormFbtUtils {
	static createTitle(fbs: FbsRuntime) {
		return fbs._("张贴告示", null, { hk: "31Dx3W" });
	}
	static editTitle(fbs: FbsRuntime) {
		return fbs._("编辑告示", null, { hk: "3HSTc7" });
	}
	static typeLabel(fbs: FbsRuntime) {
		return fbs._("类型", null, { hk: "12jYnj" });
	}
	static capacity(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("人数上限 {max} 人（{hint}）", [fbs._param("max", pv(p, "max")), fbs._param("hint", pv(p, "hint"))], { hk: "2Xg7OD" });
	}
	static hintActivity(fbs: FbsRuntime) {
		return fbs._("双十固定 10 人，不选副本", null, { hk: "426fQm" });
	}
	static hintDungeon(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("按所选副本「{name}」{max} 人", [fbs._param("name", pv(p, "name")), fbs._param("max", pv(p, "max"))], { hk: "4vrUY9" });
	}
	static hintTalent(fbs: FbsRuntime) {
		return fbs._("天赋默认 5 人，选副本后按副本人数", null, { hk: "3TTZD9" });
	}
	static hintRace(fbs: FbsRuntime) {
		return fbs._("竞速默认 10 人，选副本后按副本人数", null, { hk: "1RsFet" });
	}
	static hintTower(fbs: FbsRuntime) {
		return fbs._("爬塔固定 10 人，不选副本", null, { hk: "2PUEJY" });
	}
	static hintExplore(fbs: FbsRuntime) {
		return fbs._("联机探索不选副本，人数可选 5 或 10 人", null, { hk: "3pIfiu" });
	}
	static sizeLabel(fbs: FbsRuntime) {
		return fbs._("人数", null, { hk: "2p5BVA" });
	}
	static sizeOption(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{n} 人", [fbs._param("n", pv(p, "n"))], { hk: "2sLK1O" });
	}
	static titleLabel(fbs: FbsRuntime) {
		return fbs._("标题", null, { hk: "3buLUa" });
	}
	static titlePlaceholder(fbs: FbsRuntime) {
		return fbs._("如：周六晚双十来奶", null, { hk: "3aiWRR" });
	}
	static startsLabel(fbs: FbsRuntime) {
		return fbs._("出发时间", null, { hk: "mKKoD" });
	}
	static monthOption(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{n}月", [fbs._param("n", pv(p, "n"))], { hk: "xmKnY" });
	}
	static dayOption(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{n}日", [fbs._param("n", pv(p, "n"))], { hk: "2YJwNS" });
	}
	static hourOption(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{n}时", [fbs._param("n", pv(p, "n"))], { hk: "3JhYn6" });
	}
	static minuteOption(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{n}分", [fbs._param("n", pv(p, "n"))], { hk: "TVPPL" });
	}
	static tzEastLabel(fbs: FbsRuntime) {
		return fbs._("美东", null, { hk: "4n1BO7" });
	}
	static tzWestLabel(fbs: FbsRuntime) {
		return fbs._("美西", null, { hk: "3uaFkc" });
	}
	static tzEcho(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{eastLabel} {eastWeekday} {eastTime} · {westLabel} {westWeekday} {westTime}", [
			fbs._param("eastLabel", pv(p, "eastLabel")),
			fbs._param("eastWeekday", pv(p, "eastWeekday")),
			fbs._param("eastTime", pv(p, "eastTime")),
			fbs._param("westLabel", pv(p, "westLabel")),
			fbs._param("westWeekday", pv(p, "westWeekday")),
			fbs._param("westTime", pv(p, "westTime"))
		], { hk: "4iFZUe" });
	}
	static dungeonLabel(fbs: FbsRuntime) {
		return fbs._("副本（可选）", null, { hk: "2YRvK4" });
	}
	static dungeonNone(fbs: FbsRuntime) {
		return fbs._("不指定", null, { hk: "3gVHq5" });
	}
	static nicknameLabel(fbs: FbsRuntime) {
		return fbs._("你的昵称（发车人自动落座 0 号位）", null, { hk: "2PdwC7" });
	}
	static nicknamePlaceholder(fbs: FbsRuntime) {
		return fbs._("游戏内昵称", null, { hk: "2prsut" });
	}
	static sectLabel(fbs: FbsRuntime) {
		return fbs._("你的流派", null, { hk: "I7g01" });
	}
	static submitCreate(fbs: FbsRuntime) {
		return fbs._("发布", null, { hk: "1d6OJr" });
	}
	static submitEdit(fbs: FbsRuntime) {
		return fbs._("保存", null, { hk: "Tf89p" });
	}
	static submitting(fbs: FbsRuntime) {
		return fbs._("提交中…", null, { hk: "LsFE7" });
	}
	static toastSect(fbs: FbsRuntime) {
		return fbs._("请选择你的流派", null, { hk: "4d6YUS" });
	}
	static toastSaved(fbs: FbsRuntime) {
		return fbs._("已保存", null, { hk: "1nWleu" });
	}
	static toastSaveFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("保存失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "1pmaHO" });
	}
	static toastPosted(fbs: FbsRuntime) {
		return fbs._("告示已张贴", null, { hk: "1EN9kp" });
	}
	static toastCreateFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("创建失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "21fjOn" });
	}
	static titleTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{nickname}的{type}车队", [fbs._param("nickname", pv(p, "nickname")), fbs._param("type", pv(p, "type"))], { hk: "34GnDi" });
	}
	static customFieldsTitle(fbs: FbsRuntime) {
		return fbs._("报名表自定义字段", null, { hk: "2nvj67" });
	}
	static customFieldAddLabel(fbs: FbsRuntime) {
		return fbs._("添加字段", null, { hk: "zIoHm" });
	}
	static customFieldLabelPlaceholder(fbs: FbsRuntime) {
		return fbs._("字段名（如：联系方式）", null, { hk: "2NtkAs" });
	}
	static customFieldTypeText(fbs: FbsRuntime) {
		return fbs._("单行文本", null, { hk: "33IdMw" });
	}
	static customFieldTypeChoice(fbs: FbsRuntime) {
		return fbs._("单选", null, { hk: "weMxm" });
	}
	static customFieldOptionsPlaceholder(fbs: FbsRuntime) {
		return fbs._("选项，一行一个（2–6 个）", null, { hk: "4lfO7O" });
	}
	static customFieldRequiredLabel(fbs: FbsRuntime) {
		return fbs._("必填", null, { hk: "6U5AK" });
	}
	static customFieldRemoveLabel(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "2037mG" });
	}
	static customFieldEmptyText(fbs: FbsRuntime) {
		return fbs._("未设置自定义字段时，成员报名只填固定信息。", null, { hk: "2PhC18" });
	}
}
export abstract class SeatFbtUtils {
	static emptyJoin(fbs: FbsRuntime) {
		return fbs._("空位 · 点击落座", null, { hk: "tQSG1" });
	}
	static empty(fbs: FbsRuntime) {
		return fbs._("空位", null, { hk: "2vmR8X" });
	}
	static modalTitle(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("落座 · {n} 号位", [fbs._param("n", pv(p, "n"))], { hk: "d0yj9" });
	}
	static modalSubtitle(fbs: FbsRuntime) {
		return fbs._("人人可管 · 无需管理码", null, { hk: "2ht33g" });
	}
	static nameLabel(fbs: FbsRuntime) {
		return fbs._("名字", null, { hk: "2Tb5im" });
	}
	static namePlaceholder(fbs: FbsRuntime) {
		return fbs._("你的名字", null, { hk: "44lRmn" });
	}
	static nameRequired(fbs: FbsRuntime) {
		return fbs._("请填写名字", null, { hk: "10Tgvw" });
	}
	static selfTab(fbs: FbsRuntime) {
		return fbs._("自己报名", null, { hk: "1iIOxP" });
	}
	static proxyTab(fbs: FbsRuntime) {
		return fbs._("代报名", null, { hk: "jaXI4" });
	}
	static selfNameHint(fbs: FbsRuntime) {
		return fbs._("名字取自你的 Discord 昵称，不可修改", null, { hk: "4Bp5B4" });
	}
	static proxySearchPlaceholder(fbs: FbsRuntime) {
		return fbs._("搜索成员名字", null, { hk: "1UkhU7" });
	}
	static proxyPickRequired(fbs: FbsRuntime) {
		return fbs._("请选择要代报的成员", null, { hk: "3sgDVc" });
	}
	static proxyEmpty(fbs: FbsRuntime) {
		return fbs._("名册里还没有成员", null, { hk: "31z0R6" });
	}
	static sectLabel(fbs: FbsRuntime) {
		return fbs._("流派", null, { hk: "1Tx9PV" });
	}
	static confirmJoin(fbs: FbsRuntime) {
		return fbs._("确认落座", null, { hk: "4pWW9Q" });
	}
	static joining(fbs: FbsRuntime) {
		return fbs._("落座中…", null, { hk: "316ko8" });
	}
	static toastSect(fbs: FbsRuntime) {
		return fbs._("请选择流派", null, { hk: "3v0Szq" });
	}
	static toastJoined(fbs: FbsRuntime) {
		return fbs._("落座成功", null, { hk: "4zFO3o" });
	}
	static toastJoinFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("报名失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "1e4UbO" });
	}
	static toastLeft(fbs: FbsRuntime) {
		return fbs._("已取消报名", null, { hk: "2F5ng8" });
	}
	static toastLeaveFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("取消失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "10Hrdh" });
	}
	static leaveConfirmTitle(fbs: FbsRuntime) {
		return fbs._("取消报名", null, { hk: "1lRJ5T" });
	}
	static leaveConfirmMessage(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("确定取消「{nickname}」的报名吗？", [fbs._param("nickname", pv(p, "nickname"))], { hk: "TKeEq" });
	}
	static roleHealer(fbs: FbsRuntime) {
		return fbs._("奶", null, { hk: "376NYU" });
	}
	static roleDps(fbs: FbsRuntime) {
		return fbs._("输出", null, { hk: "108M9t" });
	}
	static roleFlex(fbs: FbsRuntime) {
		return fbs._("随意", null, { hk: "3u5DpG" });
	}
	static leader(fbs: FbsRuntime) {
		return fbs._("车头", null, { hk: "1jG5Bx" });
	}
	static readyMark(fbs: FbsRuntime) {
		return fbs._("已就位", null, { hk: "2H92pn" });
	}
	static readyAction(fbs: FbsRuntime) {
		return fbs._("我已就位", null, { hk: "2UwlH2" });
	}
	static unreadyAction(fbs: FbsRuntime) {
		return fbs._("取消就位", null, { hk: "3IXRy7" });
	}
	static toastReady(fbs: FbsRuntime) {
		return fbs._("已标记就位", null, { hk: "3wKQ0b" });
	}
	static toastUnready(fbs: FbsRuntime) {
		return fbs._("已取消就位", null, { hk: "3HIOO0" });
	}
	static toastReadyFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("操作失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "1uyG8H" });
	}
}
export abstract class AppBlocksFbtUtils {
	static rosterTitle(fbs: FbsRuntime) {
		return fbs._("队伍名册", null, { hk: "38VxGR" });
	}
	static closedStatus(fbs: FbsRuntime) {
		return fbs._("已关闭", null, { hk: "U8WMi" });
	}
	static completedStatus(fbs: FbsRuntime) {
		return fbs._("已完成", null, { hk: "1tSAGR" });
	}
	static unknownBlock(fbs: FbsRuntime) {
		return fbs._("该内容需要更新 App 后显示", null, { hk: "fCZpo" });
	}
}
export abstract class DexFbtUtils {
	static backToDex(fbs: FbsRuntime) {
		return fbs._("‹ 返回攻略", null, { hk: "159LFQ" });
	}
	static bossesLine(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{count} 位首领", [fbs._param("count", pv(p, "count"))], { hk: "fVk5j" });
	}
	static noBossData(fbs: FbsRuntime) {
		return fbs._("暂无 Boss 数据", null, { hk: "QAp7b" });
	}
	static empty(fbs: FbsRuntime) {
		return fbs._("暂无攻略", null, { hk: "1aCSGE" });
	}
	static currentGuides(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("当期攻略 · {category}", [fbs._param("category", pv(p, "category"))], { hk: "4FxWTb" });
	}
	static catSub(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{season} · {seasonName}", [fbs._param("season", pv(p, "season")), fbs._param("seasonName", pv(p, "seasonName"))], { hk: "WP94f" });
	}
	static catSubCurrent(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{season} · {seasonName} · 版本 {version}", [
			fbs._param("season", pv(p, "season")),
			fbs._param("seasonName", pv(p, "seasonName")),
			fbs._param("version", pv(p, "version"))
		], { hk: "3gOB5J" });
	}
	static size10(fbs: FbsRuntime) {
		return fbs._("十人本", null, { hk: "1peotw" });
	}
	static size5(fbs: FbsRuntime) {
		return fbs._("五人本", null, { hk: "2olQjD" });
	}
	static sizeN(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{n}人本", [fbs._param("n", pv(p, "n"))], { hk: "3OFBPW" });
	}
	static bossUnit(fbs: FbsRuntime) {
		return fbs._("首领", null, { hk: "47RJiZ" });
	}
	static partMechanics(fbs: FbsRuntime) {
		return fbs._("机制", null, { hk: "2fk0Z6" });
	}
	static partShouts(fbs: FbsRuntime) {
		return fbs._("喊话", null, { hk: "1IwIVV" });
	}
	static partTalents(fbs: FbsRuntime) {
		return fbs._("天赋", null, { hk: "1wpt8b" });
	}
	static labelAll(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{count}位首领 · {parts}俱全", [fbs._param("count", pv(p, "count")), fbs._param("parts", pv(p, "parts"))], { hk: "4gTsB" });
	}
	static labelParts(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{count}位首领 · {parts}", [fbs._param("count", pv(p, "count")), fbs._param("parts", pv(p, "parts"))], { hk: "YGWtf" });
	}
	static labelPending(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{count}位首领 · 攻略待补", [fbs._param("count", pv(p, "count"))], { hk: "4cwmlJ" });
	}
	static labelNoBosses(fbs: FbsRuntime) {
		return fbs._("首领待补", null, { hk: "1IjNit" });
	}
	static sealBoss(fbs: FbsRuntime) {
		return fbs._("将", null, { hk: "21FFne" });
	}
}
export abstract class BossFbtUtils {
	static back(fbs: FbsRuntime) {
		return fbs._("‹ 返回", null, { hk: "4qNmEq" });
	}
	static notFound(fbs: FbsRuntime) {
		return fbs._("Boss 不存在", null, { hk: "BPEXm" });
	}
	static tabMechanics(fbs: FbsRuntime) {
		return fbs._("机制", null, { hk: "2Y7k7F" });
	}
	static tabTalents(fbs: FbsRuntime) {
		return fbs._("天赋", null, { hk: "yVaO8" });
	}
	static shoutsTitle(fbs: FbsRuntime) {
		return fbs._("📢 喊话宏", null, { hk: "3IE6pm" });
	}
	static copy(fbs: FbsRuntime) {
		return fbs._("复制", null, { hk: "8PKpE" });
	}
	static shoutCopied(fbs: FbsRuntime) {
		return fbs._("喊话已复制", null, { hk: "uA0WC" });
	}
	static copyFailed(fbs: FbsRuntime) {
		return fbs._("复制失败", null, { hk: "3tdhCC" });
	}
	static copyManual(fbs: FbsRuntime) {
		return fbs._("请手动复制", null, { hk: "45sniM" });
	}
	static noMechanics(fbs: FbsRuntime) {
		return fbs._("暂无机制", null, { hk: "44lrr8" });
	}
	static noTalents(fbs: FbsRuntime) {
		return fbs._("暂无天赋", null, { hk: "3EnxKH" });
	}
	static talentTitle(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("天赋 {code}", [fbs._param("code", pv(p, "code"))], { hk: "4xOP3Q" });
	}
	static talentPending(fbs: FbsRuntime) {
		return " " + fbs._("· 待确认", null, { hk: "3MpsYE" });
	}
}
export abstract class SectFbtUtils {
	static empty(fbs: FbsRuntime) {
		return fbs._("暂无流派", null, { hk: "1LhgRT" });
	}
	static back(fbs: FbsRuntime) {
		return fbs._("‹ 返回流派", null, { hk: "164Cid" });
	}
	static tabBis(fbs: FbsRuntime) {
		return fbs._("毕业词条", null, { hk: "25ir4i" });
	}
	static tabRotation(fbs: FbsRuntime) {
		return fbs._("输出轴", null, { hk: "1b0a0d" });
	}
	static tabRates(fbs: FbsRuntime) {
		return fbs._("三率目标", null, { hk: "S01Lm" });
	}
	static tabTiaolv(fbs: FbsRuntime) {
		return fbs._("调律推演", null, { hk: "2Aam9B" });
	}
	static tabGrad(fbs: FbsRuntime) {
		return fbs._("武库鉴宝", null, { hk: "39y3DG" });
	}
	static noBis(fbs: FbsRuntime) {
		return fbs._("暂无毕业词条", null, { hk: "4dDoE6" });
	}
	static noRotation(fbs: FbsRuntime) {
		return fbs._("暂无输出轴", null, { hk: "2wjxog" });
	}
	static noRates(fbs: FbsRuntime) {
		return fbs._("暂无三率目标", null, { hk: "Fd7jz" });
	}
	static rotGreydust(fbs: FbsRuntime) {
		return fbs._("一分钟木桩轴", null, { hk: "Zoqav" });
	}
	static rotOpener(fbs: FbsRuntime) {
		return fbs._("起手", null, { hk: "34pMYq" });
	}
	static rotLoop(fbs: FbsRuntime) {
		return fbs._("循环", null, { hk: "X0SsN" });
	}
	static rotKeyPoints(fbs: FbsRuntime) {
		return fbs._("要点", null, { hk: "2FLfR1" });
	}
	static rotInnerSkills(fbs: FbsRuntime) {
		return fbs._("心法", null, { hk: "Yhbia" });
	}
	static rotVideo(fbs: FbsRuntime) {
		return fbs._("视频攻略", null, { hk: "2HKAqB" });
	}
	static rateAccuracy(fbs: FbsRuntime) {
		return fbs._("精准", null, { hk: "1lPS1V" });
	}
	static rateCrit(fbs: FbsRuntime) {
		return fbs._("会心", null, { hk: "3AQC41" });
	}
	static rateCritDamage(fbs: FbsRuntime) {
		return fbs._("会意", null, { hk: "3qCLun" });
	}
	static bisMainWeapon(fbs: FbsRuntime) {
		return fbs._("主武器", null, { hk: "1beGtr" });
	}
	static bisOffWeapon(fbs: FbsRuntime) {
		return fbs._("副武器", null, { hk: "1RbSjR" });
	}
	static bisAccessories(fbs: FbsRuntime) {
		return fbs._("环佩", null, { hk: "3UhA0K" });
	}
	static bisHeadBody(fbs: FbsRuntime) {
		return fbs._("头衣", null, { hk: "2v68hl" });
	}
	static bisLegsWrists(fbs: FbsRuntime) {
		return fbs._("腿腕", null, { hk: "1Z8qML" });
	}
	static tabAffix(fbs: FbsRuntime) {
		return fbs._("毕业词缀", null, { hk: "bJD2a" });
	}
	static affixEmpty(fbs: FbsRuntime) {
		return fbs._("暂无毕业词缀", null, { hk: "2M4Vd2" });
	}
	static affixSetLabel(fbs: FbsRuntime) {
		return fbs._("套装", null, { hk: "1aKrcg" });
	}
	static affixBowLabel(fbs: FbsRuntime) {
		return fbs._("弓玦", null, { hk: "255y3E" });
	}
	static affixDingyinLabel(fbs: FbsRuntime) {
		return fbs._("定音", null, { hk: "4txE8B" });
	}
	static affixColAffix(fbs: FbsRuntime) {
		return fbs._("词缀", null, { hk: "5naEu" });
	}
	static affixColCount(fbs: FbsRuntime) {
		return fbs._("条数", null, { hk: "cy4Pb" });
	}
	static affixColMax(fbs: FbsRuntime) {
		return fbs._("满值", null, { hk: "AAfzh" });
	}
	static affixColCy(fbs: FbsRuntime) {
		return fbs._("承音", null, { hk: "166ef" });
	}
	static affixSource(fbs: FbsRuntime) {
		return fbs._("按 100 阶毕业配方整理，与配装台同一口径；满值、承音为单条词缀上限。", null, { hk: "1JGA8s" });
	}
}
export abstract class TiaolvFbtUtils {
	static intro(fbs: FbsRuntime) {
		return fbs._("调律推演 · 复刻 bilibili@片雲 DIY 0.10.2（100级）伤害计算器逻辑", null, { hk: "oXbi2" });
	}
	static innerSkill(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("心法{n}", [fbs._param("n", pv(p, "n"))], { hk: "4nobFV" });
	}
	static innerSkillPlaceholder(fbs: FbsRuntime) {
		return fbs._("心法名", null, { hk: "1p5g4g" });
	}
	static wuxue(fbs: FbsRuntime) {
		return fbs._("武学", null, { hk: "38ZKxB" });
	}
	static wuku(fbs: FbsRuntime) {
		return fbs._("武库", null, { hk: "F9TOg" });
	}
	static wukuSelf(fbs: FbsRuntime) {
		return fbs._("本系", null, { hk: "4lByE7" });
	}
	static wukuCommon(fbs: FbsRuntime) {
		return fbs._("通用", null, { hk: "3VSIAU" });
	}
	static suit(fbs: FbsRuntime) {
		return fbs._("套装", null, { hk: "icbtk" });
	}
	static bow(fbs: FbsRuntime) {
		return fbs._("弓决", null, { hk: "2Hp9I1" });
	}
	static none(fbs: FbsRuntime) {
		return fbs._("无", null, { hk: "2VqZEV" });
	}
	static tuneArea(fbs: FbsRuntime) {
		return fbs._("调律区（K:R 列，对应 Excel K3:R5, K6:R24）", null, { hk: "zIw4K" });
	}
	static calc(fbs: FbsRuntime) {
		return fbs._("开始推演", null, { hk: "1MPdji" });
	}
	static calculating(fbs: FbsRuntime) {
		return fbs._("推演中…", null, { hk: "4nLVv6" });
	}
	static toastFailed(fbs: FbsRuntime) {
		return fbs._("计算失败", null, { hk: "2JGojs" });
	}
	static toastFailedWith(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("计算失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "3Gscrk" });
	}
	static colAttr(fbs: FbsRuntime) {
		return fbs._("属性", null, { hk: "3lWoaL" });
	}
	static colBase(fbs: FbsRuntime) {
		return fbs._("基础白值", null, { hk: "1DoR3" });
	}
	static colPanel(fbs: FbsRuntime) {
		return fbs._("面板白值", null, { hk: "lFk73" });
	}
	static colFinal(fbs: FbsRuntime) {
		return fbs._("最终面板", null, { hk: "4tbf3T" });
	}
}
export abstract class GradFbtUtils {
	static entering(fbs: FbsRuntime) {
		return fbs._("正在进入武库…", null, { hk: "4vRHhg" });
	}
	static title(fbs: FbsRuntime) {
		return fbs._("武库鉴宝", null, { hk: "2ImO9a" });
	}
	static subtitle(fbs: FbsRuntime) {
		return fbs._("条数50% · 数值30% · 三率20%", null, { hk: "1coJjB" });
	}
	static mingjinNote(fbs: FbsRuntime) {
		return fbs._("鸣金 · 大外会意流", null, { hk: "1WeUoM" });
	}
	static buildBig(fbs: FbsRuntime) {
		return fbs._("大外", null, { hk: "3vU4fV" });
	}
	static buildSmall(fbs: FbsRuntime) {
		return fbs._("小外", null, { hk: "f88cW" });
	}
	static ringLabel(fbs: FbsRuntime) {
		return fbs._("毕业率", null, { hk: "46d0pJ" });
	}
	static scoreCount(fbs: FbsRuntime) {
		return fbs._("条数匹配", null, { hk: "2RI02B" });
	}
	static scoreValue(fbs: FbsRuntime) {
		return fbs._("数值达成", null, { hk: "1qvop8" });
	}
	static scoreRate(fbs: FbsRuntime) {
		return fbs._("三率达标", null, { hk: "32Zcxf" });
	}
	static tier1(fbs: FbsRuntime) {
		return fbs._("天人合一", null, { hk: "3tVBTW" });
	}
	static tier2(fbs: FbsRuntime) {
		return fbs._("登峰造极", null, { hk: "1fuGmv" });
	}
	static tier3(fbs: FbsRuntime) {
		return fbs._("炉火纯青", null, { hk: "1uspPh" });
	}
	static tier4(fbs: FbsRuntime) {
		return fbs._("小有所成", null, { hk: "2D8sSW" });
	}
	static tier5(fbs: FbsRuntime) {
		return fbs._("初窥门径", null, { hk: "1Firpl" });
	}
	static tier6(fbs: FbsRuntime) {
		return fbs._("凡铁未炼", null, { hk: "1koAjY" });
	}
	static tapHint(fbs: FbsRuntime) {
		return fbs._("轻触装备以镌刻词条", null, { hk: "1Qa0v8" });
	}
	static refTitle(fbs: FbsRuntime) {
		return fbs._("📖 参考数据 · 词条满值与版位", null, { hk: "3sFcA3" });
	}
	static maxTableTitle(fbs: FbsRuntime) {
		return fbs._("词条满值表（100阶）", null, { hk: "3WD0G1" });
	}
	static colAffix(fbs: FbsRuntime) {
		return fbs._("词条", null, { hk: "1XSEDZ" });
	}
	static colMax(fbs: FbsRuntime) {
		return fbs._("满值", null, { hk: "2n0qXK" });
	}
	static colResonance(fbs: FbsRuntime) {
		return fbs._("承音（95%)", null, { hk: "3d96aB" });
	}
	static slotTableTitle(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("部位版位表（{build}）", [fbs._param("build", pv(p, "build"))], { hk: "3hyz6B" });
	}
	static rateTitle(fbs: FbsRuntime) {
		return fbs._("⚡ 三率速算", null, { hk: "2rU8Qf" });
	}
	static rateOk(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{v} ✓", [fbs._param("v", pv(p, "v"))], { hk: "3eNNkZ" });
	}
	static rateGap(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{v} （差{gap}）", [fbs._param("v", pv(p, "v")), fbs._param("gap", pv(p, "gap"))], { hk: "2nxACQ" });
	}
	static rateOverflow(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("⚠️ 会心+会意={sum}>100，会意挤占会心", [fbs._param("sum", pv(p, "sum"))], { hk: "2XodyQ" });
	}
	static compareTitle(fbs: FbsRuntime) {
		return fbs._("⚔️ 方案对比", null, { hk: "2wGENA" });
	}
	static saveScheme(fbs: FbsRuntime) {
		return fbs._("💾 保存当前配装为方案", null, { hk: "2S5qKc" });
	}
	static schemeName(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("方案{n}", [fbs._param("n", pv(p, "n"))], { hk: "1BadHH" });
	}
	static noSchemes(fbs: FbsRuntime) {
		return fbs._("暂无方案，先填好装备再保存", null, { hk: "24hWKH" });
	}
	static load(fbs: FbsRuntime) {
		return fbs._("载入", null, { hk: "38zYLz" });
	}
	static deleteScheme(fbs: FbsRuntime) {
		return fbs._("删除方案", null, { hk: "2IbiPj" });
	}
	static itemScore(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("本件 {score}%", [fbs._param("score", pv(p, "score"))], { hk: "1MLc9G" });
	}
	static rowMain(fbs: FbsRuntime) {
		return fbs._("主词条", null, { hk: "10NRjY" });
	}
	static rowSub(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("副词条{n}", [fbs._param("n", pv(p, "n"))], { hk: "4sEF3B" });
	}
	static rowResonance(fbs: FbsRuntime) {
		return fbs._("定音", null, { hk: "Y8tmn" });
	}
	static ratePrecision(fbs: FbsRuntime) {
		return fbs._("精准", null, { hk: "4FDUeH" });
	}
	static rateCrit(fbs: FbsRuntime) {
		return fbs._("会心", null, { hk: "1ngGNQ" });
	}
	static rateAffinity(fbs: FbsRuntime) {
		return fbs._("会意", null, { hk: "3kJSPm" });
	}
	static affixPlaceholder(fbs: FbsRuntime) {
		return fbs._("— 待镌刻 —", null, { hk: "1uJWUF" });
	}
	static affixLoading(fbs: FbsRuntime) {
		return fbs._("词条数据加载中…", null, { hk: "1xXFCJ" });
	}
	static valuePlaceholderMax(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("数值 / {max}", [fbs._param("max", pv(p, "max"))], { hk: "3qLgzI" });
	}
	static valuePlaceholder(fbs: FbsRuntime) {
		return fbs._("数值", null, { hk: "2RZxP9" });
	}
	static resonance(fbs: FbsRuntime) {
		return fbs._("承音", null, { hk: "2ZWwxF" });
	}
	static overMax(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("超过满值 {max}，将按满值计算", [fbs._param("max", pv(p, "max"))], { hk: "24SYXu" });
	}
	static toastSaved(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已保存方案「{name}」", [fbs._param("name", pv(p, "name"))], { hk: "3aceAQ" });
	}
	static toastLoaded(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已载入方案「{name}」", [fbs._param("name", pv(p, "name"))], { hk: "3Uzy9Q" });
	}
	static toastOldScheme(fbs: FbsRuntime) {
		return fbs._("旧方案只保存了分数，无法载入配装", null, { hk: "2WTMMU" });
	}
}
export abstract class GearFbtUtils {
	static calcLabel(fbs: FbsRuntime) {
		return fbs._("计算", null, { hk: "4yW8H7" });
	}
	static benchTitle(fbs: FbsRuntime) {
		return fbs._("配装台", null, { hk: "5Ew0h" });
	}
	static benchIntro(fbs: FbsRuntime) {
		return fbs._("100 阶配装：按流派配方拼装备、算面板与毕业度（口径：条数 40% + 数值 24% + 定音 20%，与上方毕业计算的口径不同）。装备库与方案保存在你的 Discord 账号下，换设备也能用。", null, { hk: "4fa1Hg" });
	}
	static targetLabel(fbs: FbsRuntime) {
		return fbs._("目标流派", null, { hk: "45QWaG" });
	}
	static bowLabel(fbs: FbsRuntime) {
		return fbs._("弓玦", null, { hk: "40JcWJ" });
	}
	static bowNoneLabel(fbs: FbsRuntime) {
		return fbs._("无", null, { hk: "1fJFXE" });
	}
	static extrasTitle(fbs: FbsRuntime) {
		return fbs._("其他来源加成", null, { hk: "2OZKs8" });
	}
	static resLabel(fbs: FbsRuntime) {
		return fbs._("抗性", null, { hk: "1mfaBV" });
	}
	static extraAccLabel(fbs: FbsRuntime) {
		return fbs._("白字精准（手填）", null, { hk: "sv4I5" });
	}
	static extraCritLabel(fbs: FbsRuntime) {
		return fbs._("白字会心（手填）", null, { hk: "1e7sB4" });
	}
	static extraIntLabel(fbs: FbsRuntime) {
		return fbs._("白字会意（手填）", null, { hk: "3CR3N4" });
	}
	static baseTitle(fbs: FbsRuntime) {
		return fbs._("角色基础", null, { hk: "pjnBL" });
	}
	static unlockLabel(fbs: FbsRuntime) {
		return fbs._("解锁", null, { hk: "33y8jY" });
	}
	static lockLabel(fbs: FbsRuntime) {
		return fbs._("锁定", null, { hk: "3qiLvx" });
	}
	static modifiedTag(fbs: FbsRuntime) {
		return fbs._("已改", null, { hk: "AxU4Y" });
	}
	static baseResetLabel(fbs: FbsRuntime) {
		return fbs._("恢复预设", null, { hk: "2jKpXX" });
	}
	static baseResetTitle(fbs: FbsRuntime) {
		return fbs._("恢复预设？", null, { hk: "7f5it" });
	}
	static baseResetBody(fbs: FbsRuntime) {
		return fbs._("角色基础将回到预设值，心法选择保留。", null, { hk: "7NFA2" });
	}
	static xinfaLabelTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("心法 {n}", [fbs._param("n", pv(p, "n"))], { hk: "2K8xD8" });
	}
	static xinfaNoneLabel(fbs: FbsRuntime) {
		return fbs._("— 不选 —", null, { hk: "1x62WA" });
	}
	static loginHint(fbs: FbsRuntime) {
		return fbs._("装备库与方案按你的 Discord 账号保存，登录后可用（计算与参考数据无需登录）。", null, { hk: "4BEVzt" });
	}
	static libTitle(fbs: FbsRuntime) {
		return fbs._("装备库", null, { hk: "46uSMP" });
	}
	static myLibTitle(fbs: FbsRuntime) {
		return fbs._("我的装备库", null, { hk: "2F5moS" });
	}
	static myBuildsTitle(fbs: FbsRuntime) {
		return fbs._("我的方案", null, { hk: "3kY4E6" });
	}
	static libCountTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("共 {n} 件", [fbs._param("n", pv(p, "n"))], { hk: "2I37Ih" });
	}
	static usageTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已存 {n} / {limit} 件", [fbs._param("n", pv(p, "n")), fbs._param("limit", pv(p, "limit"))], { hk: "1VqKRZ" });
	}
	static usageNearLimitText(fbs: FbsRuntime) {
		return fbs._("装备库快满了，导入新装备前先清理不用的装备", null, { hk: "HlS1G" });
	}
	static formSlotLabel(fbs: FbsRuntime) {
		return fbs._("部位", null, { hk: "4lnYDt" });
	}
	static formNameLabel(fbs: FbsRuntime) {
		return fbs._("名称", null, { hk: "15UsBA" });
	}
	static formNamePlaceholder(fbs: FbsRuntime) {
		return fbs._("装备名（可空）", null, { hk: "3kDM9E" });
	}
	static affixPlaceholder(fbs: FbsRuntime) {
		return fbs._("选词条", null, { hk: "3Q1dGP" });
	}
	static valuePlaceholder(fbs: FbsRuntime) {
		return fbs._("数值", null, { hk: "4EHCxo" });
	}
	static refTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("满值 {max} / 承音 {cy}", [fbs._param("max", pv(p, "max")), fbs._param("cy", pv(p, "cy"))], { hk: "2gJcql" });
	}
	static fillMaxLabel(fbs: FbsRuntime) {
		return fbs._("填满值", null, { hk: "cRHZT" });
	}
	static fillCyLabel(fbs: FbsRuntime) {
		return fbs._("填承音", null, { hk: "1NymVZ" });
	}
	static delRowLabel(fbs: FbsRuntime) {
		return fbs._("删此行", null, { hk: "wS94O" });
	}
	static addRowLabel(fbs: FbsRuntime) {
		return fbs._("加一行", null, { hk: "3a3uLZ" });
	}
	static dyNameLabel(fbs: FbsRuntime) {
		return fbs._("定音名称", null, { hk: "2dpd8A" });
	}
	static dyNamePlaceholder(fbs: FbsRuntime) {
		return fbs._("如 外功穿透 / 无名剑法·蓄力技增伤", null, { hk: "3zCssy" });
	}
	static dyValLabel(fbs: FbsRuntime) {
		return fbs._("定音数值", null, { hk: "4ydc7H" });
	}
	static schoolsLabel(fbs: FbsRuntime) {
		return fbs._("流派标签（武器）", null, { hk: "1d7OgL" });
	}
	static addGearLabel(fbs: FbsRuntime) {
		return fbs._("存入装备库", null, { hk: "2U7Vve" });
	}
	static updateGearLabel(fbs: FbsRuntime) {
		return fbs._("保存修改", null, { hk: "1hIpLR" });
	}
	static cancelEditLabel(fbs: FbsRuntime) {
		return fbs._("取消编辑", null, { hk: "3p9kFF" });
	}
	static demoLabel(fbs: FbsRuntime) {
		return fbs._("载入示例套", null, { hk: "cxx9v" });
	}
	static clearLibLabel(fbs: FbsRuntime) {
		return fbs._("清空装备库", null, { hk: "2vmGUK" });
	}
	static clearConfirmTitle(fbs: FbsRuntime) {
		return fbs._("清空装备库？", null, { hk: "4Y33D" });
	}
	static clearConfirmBody(fbs: FbsRuntime) {
		return fbs._("你账号下的全部装备与方案都会删除，当前搭配也会清空，此操作不可恢复。", null, { hk: "xkBN7" });
	}
	static equipLabel(fbs: FbsRuntime) {
		return fbs._("选入", null, { hk: "1ViGlP" });
	}
	static unequipLabel(fbs: FbsRuntime) {
		return fbs._("卸下", null, { hk: "4BpXFA" });
	}
	static editLabel(fbs: FbsRuntime) {
		return fbs._("编辑", null, { hk: "1IeJyL" });
	}
	static deleteLabel(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "3PX3ar" });
	}
	static simLabel(fbs: FbsRuntime) {
		return fbs._("模拟", null, { hk: "25RrEi" });
	}
	static simRealLabel(fbs: FbsRuntime) {
		return fbs._("实际", null, { hk: "2oNMSF" });
	}
	static simCyLabel(fbs: FbsRuntime) {
		return fbs._("承音", null, { hk: "3u95YZ" });
	}
	static simMaxLabel(fbs: FbsRuntime) {
		return fbs._("满值", null, { hk: "3zGRzQ" });
	}
	static verdictHeirloom(fbs: FbsRuntime) {
		return fbs._("传家宝", null, { hk: "3SODAl" });
	}
	static verdictDud(fbs: FbsRuntime) {
		return fbs._("拉完了", null, { hk: "1f8Mtw" });
	}
	static scoreTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("评分 {score}", [fbs._param("score", pv(p, "score"))], { hk: "1T239Z" });
	}
	static qualityLabel(fbs: FbsRuntime) {
		return fbs._("数值达成", null, { hk: "1aLZdi" });
	}
	static exportLabel(fbs: FbsRuntime) {
		return fbs._("导出数据", null, { hk: "3ppO90" });
	}
	static exportFileName(fbs: FbsRuntime) {
		return fbs._("100阶配装数据.json", null, { hk: "1nF0W5" });
	}
	static importNameTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("导入 · {slot}", [fbs._param("slot", pv(p, "slot"))], { hk: "9IF0K" });
	}
	static importLabel(fbs: FbsRuntime) {
		return fbs._("导入数据", null, { hk: "22hIjM" });
	}
	static importFailedToast(fbs: FbsRuntime) {
		return fbs._("导入失败：文件无效", null, { hk: "1crJB7" });
	}
	static importedToastTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已导入 {n} 件", [fbs._param("n", pv(p, "n"))], { hk: "Ava70" });
	}
	static manualTitle(fbs: FbsRuntime) {
		return fbs._("手动录入", null, { hk: "1N5DR9" });
	}
	static pasteTitle(fbs: FbsRuntime) {
		return fbs._("粘贴代码导入", null, { hk: "30UnRe" });
	}
	static pastePlaceholder(fbs: FbsRuntime) {
		return fbs._("把装备数据代码粘到这里（JSON / Base64 / 文本均可）", null, { hk: "1bfgrW" });
	}
	static pasteButtonLabel(fbs: FbsRuntime) {
		return fbs._("解析并导入装备库", null, { hk: "4ay48m" });
	}
	static pasteDemoLabel(fbs: FbsRuntime) {
		return fbs._("填入示例代码", null, { hk: "18Iquh" });
	}
	static pasteEmptyText(fbs: FbsRuntime) {
		return fbs._("先把代码粘到上面的框里再点解析。", null, { hk: "4hDbrH" });
	}
	static pasteOkTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("✓ 已按「{mode}」解析，导入 {n} 件装备 / {lines} 条词条，已自动选入搭配。", [
			fbs._param("mode", pv(p, "mode")),
			fbs._param("n", pv(p, "n")),
			fbs._param("lines", pv(p, "lines"))
		], { hk: "4e0PnW" });
	}
	static pasteUnknownTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("另有 {n} 条没认出的字段被跳过（多半是气血、防御、外功穿透这类本站不计的词条）。", [fbs._param("n", pv(p, "n"))], { hk: "26uiRZ" });
	}
	static pasteFailText(fbs: FbsRuntime) {
		return fbs._("没能从这段代码里认出装备。常见原因：复制时漏了一头一尾、复制的是角色外观分享码（不含装备数值）、或这份数据的字段格式本站还没适配。", null, { hk: "2oG8K6" });
	}
	static pasteFullText(fbs: FbsRuntime) {
		return fbs._("识别为本工具导出的数据，已按整库导入处理。", null, { hk: "35QvzG" });
	}
	static ocrTitle(fbs: FbsRuntime) {
		return fbs._("截图导入（本地识别，不上传）", null, { hk: "Dx6x6" });
	}
	static ocrDropText(fbs: FbsRuntime) {
		return fbs._("点这里选一张装备详情截图，或拖进来 / Ctrl+V 粘贴", null, { hk: "3FenDv" });
	}
	static ocrPreparingText(fbs: FbsRuntime) {
		return fbs._("正在准备图片…", null, { hk: "3YfDW4" });
	}
	static ocrRunningText(fbs: FbsRuntime) {
		return fbs._("正在识别（首次会下载中文 + 英文识别包，可能要十几秒）…", null, { hk: "1IiGWt" });
	}
	static ocrSecondText(fbs: FbsRuntime) {
		return fbs._("正在增强识别（第二遍）…", null, { hk: "28MEqZ" });
	}
	static ocrFailedText(fbs: FbsRuntime) {
		return fbs._("识别失败了。常见原因：网络不通下不到识别包、图片太模糊。可以换一张更清晰、完整的详情页截图再试。", null, { hk: "2k2kbH" });
	}
	static ocrBadTypeText(fbs: FbsRuntime) {
		return fbs._("这张图格式不对，只支持 PNG / JPEG / WebP 截图。", null, { hk: "3QL0xP" });
	}
	static ocrTooBigText(fbs: FbsRuntime) {
		return fbs._("图片超过 15MB，换一张小一点的截图。", null, { hk: "42zAVE" });
	}
	static ocrNoEngineText(fbs: FbsRuntime) {
		return fbs._("识别组件没能加载（OCR 引擎需要联网从 CDN 载入）。检查网络后刷新页面再试；粘贴代码导入不受影响。", null, { hk: "aIn0l" });
	}
	static ocrDoneTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("✓ 识别完成：认出 {n} 条词条{slotPart}{dyPart}。请逐行核对数值再确认存入。", [
			fbs._param("n", pv(p, "n")),
			fbs._param("slotPart", pv(p, "slotPart")),
			fbs._param("dyPart", pv(p, "dyPart"))
		], { hk: "Mu22w" });
	}
	static ocrSlotLabel(fbs: FbsRuntime) {
		return fbs._("部位", null, { hk: "4lIvFo" });
	}
	static ocrNameLabel(fbs: FbsRuntime) {
		return fbs._("名称", null, { hk: "U2LBc" });
	}
	static ocrEquipLabel(fbs: FbsRuntime) {
		return fbs._("存入后直接选入搭配", null, { hk: "3FIunH" });
	}
	static ocrConfirmLabel(fbs: FbsRuntime) {
		return fbs._("确认存入", null, { hk: "3WqTD1" });
	}
	static ocrCancelLabel(fbs: FbsRuntime) {
		return fbs._("放弃", null, { hk: "20dc5U" });
	}
	static ocrUnknownTitle(fbs: FbsRuntime) {
		return fbs._("下面这些行没认出词条，已原样列出（不会丢行）：需要的话点「补一条词条行」手动加上；纯界面文字可忽略。", null, { hk: "41gOUB" });
	}
	static ocrSavedTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("✓ 已存入装备库：{slot}（{n} 条词条）", [fbs._param("slot", pv(p, "slot")), fbs._param("n", pv(p, "n"))], { hk: "3soQ7q" });
	}
	static ocrNeedLineToast(fbs: FbsRuntime) {
		return fbs._("至少保留一条有效词条再确认", null, { hk: "1XZ1cS" });
	}
	static ocrLowConfTag(fbs: FbsRuntime) {
		return fbs._("低置信，请核对", null, { hk: "26nqBd" });
	}
	static ocrAddRowLabel(fbs: FbsRuntime) {
		return fbs._("补一条词条行", null, { hk: "m177q" });
	}
	static ocrImportSlotTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("导入{slot}", [fbs._param("slot", pv(p, "slot"))], { hk: "31wzwa" });
	}
	static ocrBatchTitle(fbs: FbsRuntime) {
		return fbs._("批量截图识别（全屏截图自动框选 · 本地识别，不上传）", null, { hk: "1no4fj" });
	}
	static ocrBatchDropText(fbs: FbsRuntime) {
		return fbs._("把多张截图拖到这里，或点选多张 / Ctrl+V 粘贴（全屏截图也可以，会自动找装备面板）", null, { hk: "dpylj" });
	}
	static ocrBatchQueuedText(fbs: FbsRuntime) {
		return fbs._("排队中", null, { hk: "H7XUk" });
	}
	static ocrBatchRunningText(fbs: FbsRuntime) {
		return fbs._("识别中…", null, { hk: "2AzaGg" });
	}
	static ocrBatchReadyText(fbs: FbsRuntime) {
		return fbs._("待核对", null, { hk: "1YY9Gt" });
	}
	static ocrBatchFailedText(fbs: FbsRuntime) {
		return fbs._("识别失败", null, { hk: "4zJSN9" });
	}
	static ocrBatchImportedText(fbs: FbsRuntime) {
		return fbs._("已导入", null, { hk: "3KJdM2" });
	}
	static ocrBatchRetryLabel(fbs: FbsRuntime) {
		return fbs._("重试", null, { hk: "2Txdbu" });
	}
	static ocrBatchRemoveLabel(fbs: FbsRuntime) {
		return fbs._("移除", null, { hk: "2szCqk" });
	}
	static ocrBatchAdjustLabel(fbs: FbsRuntime) {
		return fbs._("调整框选", null, { hk: "z3HY0" });
	}
	static ocrBatchApplyBoxLabel(fbs: FbsRuntime) {
		return fbs._("按此框重新识别", null, { hk: "4jySZY" });
	}
	static ocrBatchDetectedText(fbs: FbsRuntime) {
		return fbs._("已自动框选面板", null, { hk: "4fhL5u" });
	}
	static ocrBatchFullImageText(fbs: FbsRuntime) {
		return fbs._("未定位到面板，按整图识别", null, { hk: "2V5DqY" });
	}
	static ocrBatchDupTag(fbs: FbsRuntime) {
		return fbs._("重复", null, { hk: "24C1tX" });
	}
	static ocrBatchDupLibText(fbs: FbsRuntime) {
		return fbs._("与装备库已有装备相同，默认不导入", null, { hk: "4EzUV6" });
	}
	static ocrBatchDupRowText(fbs: FbsRuntime) {
		return fbs._("与本批另一张相同，默认不导入", null, { hk: "F4SHd" });
	}
	static ocrBatchIncludeLabel(fbs: FbsRuntime) {
		return fbs._("导入这件", null, { hk: "4gljQ5" });
	}
	static ocrBatchNoLinesText(fbs: FbsRuntime) {
		return fbs._("没认出词条：请核对部位、补词条行，或调整框选后重新识别（不会自动丢弃）", null, { hk: "qvkgS" });
	}
	static ocrBatchImportTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("全部导入（{n} 件）", [fbs._param("n", pv(p, "n"))], { hk: "2gEXEe" });
	}
	static ocrBatchResultTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("✓ 批量导入完成：已导入 {n} 件，跳过 {m} 件。", [fbs._param("n", pv(p, "n")), fbs._param("m", pv(p, "m"))], { hk: "1eiBlT" });
	}
	static libEmptyText(fbs: FbsRuntime) {
		return fbs._("装备库是空的。手动录入、粘贴代码或截图识别都可以加装备。", null, { hk: "WYTUs" });
	}
	static equippedTag(fbs: FbsRuntime) {
		return fbs._("已选入", null, { hk: "4720iY" });
	}
	static loadoutTitle(fbs: FbsRuntime) {
		return fbs._("组合搭配 · 8 个部位", null, { hk: "f8IHN" });
	}
	static autoLabel(fbs: FbsRuntime) {
		return fbs._("一键最优组合", null, { hk: "3oFlhW" });
	}
	static autoDoneToast(fbs: FbsRuntime) {
		return fbs._("已拼好", null, { hk: "1lNlw3" });
	}
	static autoFallbackToast(fbs: FbsRuntime) {
		return fbs._("已拼好（含兜底选装）", null, { hk: "1bc5Qa" });
	}
	static unequipAllLabel(fbs: FbsRuntime) {
		return fbs._("全部卸下", null, { hk: "2pablA" });
	}
	static slotEmptyText(fbs: FbsRuntime) {
		return fbs._("未选", null, { hk: "1PpQaI" });
	}
	static panelTitle(fbs: FbsRuntime) {
		return fbs._("面板与毕业度", null, { hk: "1XWjwm" });
	}
	static gradLabel(fbs: FbsRuntime) {
		return fbs._("毕业度", null, { hk: "4DNxDq" });
	}
	static gradCountLabel(fbs: FbsRuntime) {
		return fbs._("条数", null, { hk: "1nnEaC" });
	}
	static gradValueLabel(fbs: FbsRuntime) {
		return fbs._("数值", null, { hk: "1HKJnl" });
	}
	static gradDyLabel(fbs: FbsRuntime) {
		return fbs._("定音", null, { hk: "2F2Ak9" });
	}
	static gradDyToggleLabel(fbs: FbsRuntime) {
		return fbs._("定音计入毕业度", null, { hk: "1yZjy3" });
	}
	static loanLabel(fbs: FbsRuntime) {
		return fbs._("满值模拟（全套满值时的毕业度）", null, { hk: "g3rDh" });
	}
	static simActiveTag(fbs: FbsRuntime) {
		return fbs._("模拟中", null, { hk: "CtuBJ" });
	}
	static copySummaryLabel(fbs: FbsRuntime) {
		return fbs._("复制摘要", null, { hk: "vhTqp" });
	}
	static copiedToast(fbs: FbsRuntime) {
		return fbs._("已复制", null, { hk: "4tHGli" });
	}
	static copyFailedToast(fbs: FbsRuntime) {
		return fbs._("复制失败，请手动记录", null, { hk: "Sd4gD" });
	}
	static yAccLabel(fbs: FbsRuntime) {
		return fbs._("黄字精准", null, { hk: "1ZzT3" });
	}
	static yCritLabel(fbs: FbsRuntime) {
		return fbs._("黄字会心", null, { hk: "4cjYB0" });
	}
	static yIntLabel(fbs: FbsRuntime) {
		return fbs._("黄字会意", null, { hk: "1hibxI" });
	}
	static finalCritLabel(fbs: FbsRuntime) {
		return fbs._("最终会心", null, { hk: "476RDi" });
	}
	static whiteLabel(fbs: FbsRuntime) {
		return fbs._("白字", null, { hk: "2EJaJj" });
	}
	static dawaiLabel(fbs: FbsRuntime) {
		return fbs._("大外", null, { hk: "6UzRd" });
	}
	static xiaowaiLabel(fbs: FbsRuntime) {
		return fbs._("小外", null, { hk: "2VdEGB" });
	}
	static dashuLabel(fbs: FbsRuntime) {
		return fbs._("大属", null, { hk: "3nMDVW" });
	}
	static xiaoshuLabel(fbs: FbsRuntime) {
		return fbs._("小属", null, { hk: "1wzLaA" });
	}
	static hpLabel(fbs: FbsRuntime) {
		return fbs._("气血", null, { hk: "4bwBXS" });
	}
	static defLabel(fbs: FbsRuntime) {
		return fbs._("防御", null, { hk: "216UCL" });
	}
	static talentLabel(fbs: FbsRuntime) {
		return fbs._("天赋", null, { hk: "3KOSWI" });
	}
	static diffTitle(fbs: FbsRuntime) {
		return fbs._("差缺清单：离毕业还差什么", null, { hk: "3BjuUn" });
	}
	static diffLackTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("还差 {n}", [fbs._param("n", pv(p, "n"))], { hk: "1xnjD" });
	}
	static diffExactText(fbs: FbsRuntime) {
		return fbs._("正好", null, { hk: "xI8Bs" });
	}
	static diffOverTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("多 {n}", [fbs._param("n", pv(p, "n"))], { hk: "4E8LPd" });
	}
	static diffExtraTitle(fbs: FbsRuntime) {
		return fbs._("配方外", null, { hk: "zexy4" });
	}
	static diffLowTitle(fbs: FbsRuntime) {
		return fbs._("未满承音的词条", null, { hk: "zMN9v" });
	}
	static diffDoneText(fbs: FbsRuntime) {
		return fbs._("✓ 毕业。", null, { hk: "1bnxKu" });
	}
	static diffEmptyText(fbs: FbsRuntime) {
		return fbs._("还没选装备。", null, { hk: "3M9Lgj" });
	}
	static diffInvalidTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("异常：{n} 条无相在非武器部位，未计入。", [fbs._param("n", pv(p, "n"))], { hk: "250XRX" });
	}
	static suggestTitle(fbs: FbsRuntime) {
		return fbs._("建议", null, { hk: "3DezQI" });
	}
	static suggestSwapTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{slot}：换上「{name}」", [fbs._param("slot", pv(p, "slot")), fbs._param("name", pv(p, "name"))], { hk: "8T916" });
	}
	static suggestWashTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{slot}：把第 {line} 条 {from} 洗成 {to}", [
			fbs._param("slot", pv(p, "slot")),
			fbs._param("line", pv(p, "line")),
			fbs._param("from", pv(p, "from")),
			fbs._param("to", pv(p, "to"))
		], { hk: "U8SWf" });
	}
	static suggestNoneText(fbs: FbsRuntime) {
		return fbs._("这套暂时挑不出毛病", null, { hk: "uKBpY" });
	}
	static suggestHeadTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("当前 {cur}% → 全做 {final}%", [fbs._param("cur", pv(p, "cur")), fbs._param("final", pv(p, "final"))], { hk: "eiZ73" });
	}
	static dySummaryTitle(fbs: FbsRuntime) {
		return fbs._("定音汇总", null, { hk: "4CF5eU" });
	}
	static dyCorrectText(fbs: FbsRuntime) {
		return fbs._("对", null, { hk: "3Oq9Or" });
	}
	static dyWrongText(fbs: FbsRuntime) {
		return fbs._("类型不符", null, { hk: "2UJUCP" });
	}
	static schemeTitle(fbs: FbsRuntime) {
		return fbs._("配装方案对比", null, { hk: "2e6hXS" });
	}
	static schemeSaveLabel(fbs: FbsRuntime) {
		return fbs._("存为方案", null, { hk: "1F84oF" });
	}
	static schemeNameTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("方案 {n}", [fbs._param("n", pv(p, "n"))], { hk: "1XTf0P" });
	}
	static schemeLoadLabel(fbs: FbsRuntime) {
		return fbs._("载入", null, { hk: "108t9l" });
	}
	static schemeDeleteLabel(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "1t6zM0" });
	}
	static schemeEmptyText(fbs: FbsRuntime) {
		return fbs._("还没有保存的方案。", null, { hk: "1tOv8w" });
	}
	static schemeComposeFirstText(fbs: FbsRuntime) {
		return fbs._("先在配装台拼好一套搭配，才能存为方案。", null, { hk: "1j5BCg" });
	}
	static schemeSavedToastTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已存方案：{name}", [fbs._param("name", pv(p, "name"))], { hk: "PuHjW" });
	}
	static schemeLoadedToastTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已载入：{name}", [fbs._param("name", pv(p, "name"))], { hk: "27B6l6" });
	}
	static schemeGroupCountTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{n} 套", [fbs._param("n", pv(p, "n"))], { hk: "2Od7bV" });
	}
	static shareLabel(fbs: FbsRuntime) {
		return fbs._("分享", null, { hk: "2wPj7k" });
	}
	static revokeShareLabel(fbs: FbsRuntime) {
		return fbs._("取消分享", null, { hk: "IEh1w" });
	}
	static copyLinkLabel(fbs: FbsRuntime) {
		return fbs._("复制链接", null, { hk: "1tP5kc" });
	}
	static shareRevokedToast(fbs: FbsRuntime) {
		return fbs._("已取消分享，旧链接已失效", null, { hk: "1U5IlO" });
	}
	static quickTitle(fbs: FbsRuntime) {
		return fbs._("三率速算器", null, { hk: "2llWVj" });
	}
	static quickResLabel(fbs: FbsRuntime) {
		return fbs._("抗性", null, { hk: "4di7o2" });
	}
	static quickSyncLabel(fbs: FbsRuntime) {
		return fbs._("从配装台同步", null, { hk: "1QfqcH" });
	}
	static quickSyncedToast(fbs: FbsRuntime) {
		return fbs._("已同步", null, { hk: "3818ay" });
	}
	static quickOkText(fbs: FbsRuntime) {
		return fbs._("✓ 已满值", null, { hk: "3nmrL0" });
	}
	static quickOverTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("，溢出 {v}%", [fbs._param("v", pv(p, "v"))], { hk: "3X8Y8t" });
	}
	static quickGapTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("还差白字 {lack}%（满值 {need}%）≈ {bars} 条{barName}", [
			fbs._param("lack", pv(p, "lack")),
			fbs._param("need", pv(p, "need")),
			fbs._param("bars", pv(p, "bars")),
			fbs._param("barName", pv(p, "barName"))
		], { hk: "3XLhkJ" });
	}
	static recipesTitle(fbs: FbsRuntime) {
		return fbs._("全流派配方表（100 阶 · 承音）", null, { hk: "1sCL45" });
	}
	static recipeSearchPlaceholder(fbs: FbsRuntime) {
		return fbs._("搜流派 / 套装 / 词条", null, { hk: "2X2wTr" });
	}
	static recipeAllLabel(fbs: FbsRuntime) {
		return fbs._("全部", null, { hk: "25AlAJ" });
	}
	static recipeColCat(fbs: FbsRuntime) {
		return fbs._("类别", null, { hk: "1hWarV" });
	}
	static recipeColSchool(fbs: FbsRuntime) {
		return fbs._("流派", null, { hk: "2W82Gt" });
	}
	static recipeColSet(fbs: FbsRuntime) {
		return fbs._("套装", null, { hk: "2lImYs" });
	}
	static recipeColRecipe(fbs: FbsRuntime) {
		return fbs._("词条搭配（承音）", null, { hk: "2yCBtL" });
	}
	static recipeColBow(fbs: FbsRuntime) {
		return fbs._("推荐弓", null, { hk: "2SqDuS" });
	}
	static recipeSetTargetLabel(fbs: FbsRuntime) {
		return fbs._("设为目标", null, { hk: "4rcFcr" });
	}
	static recipeEmptyText(fbs: FbsRuntime) {
		return fbs._("没有符合的配方。", null, { hk: "1ohBvd" });
	}
	static recipeTargetToastTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("目标已设为：{school} · {set}", [fbs._param("school", pv(p, "school")), fbs._param("set", pv(p, "set"))], { hk: "2xH0Q4" });
	}
	static sectRecipesTitle(fbs: FbsRuntime) {
		return fbs._("100 阶配方（配装台口径）", null, { hk: "2TmPX9" });
	}
	static affixTableTitle(fbs: FbsRuntime) {
		return fbs._("词条满值 / 承音对照表（配装台）", null, { hk: "4fm1zT" });
	}
	static colCyLabel(fbs: FbsRuntime) {
		return fbs._("承音", null, { hk: "3eAEKf" });
	}
	static colCyPctLabel(fbs: FbsRuntime) {
		return fbs._("承音/满值", null, { hk: "3H1bmZ" });
	}
	static colRecipeNamesLabel(fbs: FbsRuntime) {
		return fbs._("配方叫法", null, { hk: "1tHujY" });
	}
	static survivalNote(fbs: FbsRuntime) {
		return fbs._("生存向，配方未列", null, { hk: "1lh7ys" });
	}
	static slotTableTitle(fbs: FbsRuntime) {
		return fbs._("部位版位表（配装台）", null, { hk: "1VTobE" });
	}
	static slotsBigTitle(fbs: FbsRuntime) {
		return fbs._("大外流派", null, { hk: "2IkxuV" });
	}
	static slotsSmallTitle(fbs: FbsRuntime) {
		return fbs._("小外流派", null, { hk: "43GAT6" });
	}
	static formulaTitle(fbs: FbsRuntime) {
		return fbs._("公式与五维换算速查", null, { hk: "2jbfBQ" });
	}
	static formulaRatesTitle(fbs: FbsRuntime) {
		return fbs._("三率换算", null, { hk: "irDff" });
	}
	static formulaDimsTitle(fbs: FbsRuntime) {
		return fbs._("五维换算（每 1 点）", null, { hk: "19pOdZ" });
	}
	static formulaOrderTitle(fbs: FbsRuntime) {
		return fbs._("选装顺序", null, { hk: "24lDn4" });
	}
	static formulaAccTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("黄字精准 = 65% +（白字精准 − 65%）÷ 抗性，白字 {white}% 满值 100%。", [fbs._param("white", pv(p, "white"))], { hk: "4znmhw" });
	}
	static formulaCritTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("黄字会心 = 白字会心 ÷ 抗性，白字 {white}% 满值 80%。", [fbs._param("white", pv(p, "white"))], { hk: "1x15PH" });
	}
	static formulaIntTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("黄字会意 = 白字会意 ÷ 抗性，白字 {white}% 满值 40%。", [fbs._param("white", pv(p, "white"))], { hk: "1KkYS4" });
	}
	static formulaBarsTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("差几条估算（按承音每条）：精准 {acc} / 会心 {crit} / 会意 {int}；敏补会心 ≈ +{minCrit}% 白字 / 条，势补会意 ≈ +{shiInt}% 白字 / 条。", [
			fbs._param("acc", pv(p, "acc")),
			fbs._param("crit", pv(p, "crit")),
			fbs._param("int", pv(p, "int")),
			fbs._param("minCrit", pv(p, "minCrit")),
			fbs._param("shiInt", pv(p, "shiInt"))
		], { hk: "np2li" });
	}
	static formulaBowTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("弓（弓玦）加成计入白字：精准弓 白字精准 +{acc} / 会心弓 白字会心 +{crit} / 会意弓 白字会意 +{int}，再按抗性换算黄字。抗性 {res}（当前版本）。", [
			fbs._param("acc", pv(p, "acc")),
			fbs._param("crit", pv(p, "crit")),
			fbs._param("int", pv(p, "int")),
			fbs._param("res", pv(p, "res"))
		], { hk: "1fWGnJ" });
	}
	static formulaOrderText(fbs: FbsRuntime) {
		return fbs._("定流派 → 对配方 → 录装备。一键最优拼一版 → 看差缺清单补缺。精准先堆满 100%；会心 148% / 会意 74% 封顶，溢出换劲 / 势 / 增伤。两套拿不准，存方案比总分。", null, { hk: "Bgq5s" });
	}
	static colDimLabel(fbs: FbsRuntime) {
		return fbs._("五维", null, { hk: "UUQQP" });
	}
	static colConvLabel(fbs: FbsRuntime) {
		return fbs._("换算", null, { hk: "4uStUa" });
	}
	static colFullBarTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("满条 {v} 折合", [fbs._param("v", pv(p, "v"))], { hk: "1Jaa62" });
	}
	static calcFailedText(fbs: FbsRuntime) {
		return fbs._("计算失败，请稍后再试", null, { hk: "p85G1" });
	}
	static demoLoadedToast(fbs: FbsRuntime) {
		return fbs._("示例已载入", null, { hk: "3wXhDH" });
	}
	static savedToastTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已存入：{name}", [fbs._param("name", pv(p, "name"))], { hk: "kVNe0" });
	}
	static deletedToast(fbs: FbsRuntime) {
		return fbs._("已删除", null, { hk: "49DbLu" });
	}
	static clearedToast(fbs: FbsRuntime) {
		return fbs._("已清空", null, { hk: "2lKE6e" });
	}
}
export abstract class LegalFbtUtils {
	static termsTitle(fbs: FbsRuntime) {
		return fbs._("服务条款", null, { hk: "2QnlAX" });
	}
	static privacyTitle(fbs: FbsRuntime) {
		return fbs._("隐私政策", null, { hk: "2es3S0" });
	}
	static termsLink(fbs: FbsRuntime) {
		return fbs._("服务条款", null, { hk: "3R2KXN" });
	}
	static privacyLink(fbs: FbsRuntime) {
		return fbs._("隐私政策", null, { hk: "3Ju9Yi" });
	}
	static updatedText(fbs: FbsRuntime) {
		return fbs._("最后更新：2026 年 10 月 25 日", null, { hk: "mB4yG" });
	}
	static disclaimer(fbs: FbsRuntime) {
		return fbs._("本站为玩家自发维护的非官方工具，与《燕云十六声》及其开发、发行方无隶属或背书关系；游戏名称与相关素材的权利归其各自权利方所有。", null, { hk: "9w1B9" });
	}
}
export abstract class TermsBodyFbtUtils {
	static s1h(fbs: FbsRuntime) {
		return fbs._("关于本站与非官方声明", null, { hk: "Zg8RV" });
	}
	static s1b(fbs: FbsRuntime) {
		return fbs._("燕云百业（yanyun.app）是一个由玩家自发维护的非官方百业（公会）组队工具，与《燕云十六声》及其开发、发行方没有任何隶属或背书关系。本站中出现的游戏名称、副本、流派等资料，其权利归各自权利方所有。", null, { hk: "k0Qko" });
	}
	static s2h(fbs: FbsRuntime) {
		return fbs._("账号与访问", null, { hk: "2OBUPr" });
	}
	static s2b(fbs: FbsRuntime) {
		return fbs._("本站通过 Discord OAuth 登录。使用本站即表示你同意本条款。你应妥善保管自己的 Discord 账号，通过你的账号进行的操作视为你本人行为。各百业内容的可见与可写范围，由你是否属于该百业绑定的 Discord 服务器决定。", null, { hk: "2DR8ok" });
	}
	static s3h(fbs: FbsRuntime) {
		return fbs._("使用规范", null, { hk: "3JZhyU" });
	}
	static s3b(fbs: FbsRuntime) {
		return fbs._("不得利用本站冒充他人或其它百业、抢注或占用与你无关的百业标识、发布违法或侵权内容、干扰本站运行，或绕过成员校验。车队标题、报名昵称等由用户发布的内容，由发布者自行负责。", null, { hk: "3va66a" });
	}
	static s4h(fbs: FbsRuntime) {
		return fbs._("服务现状", null, { hk: "Yb3T4" });
	}
	static s4b(fbs: FbsRuntime) {
		return fbs._("本站目前免费提供，并按现状（as is）运行。我们不承诺服务持续可用、功能保持不变，或数据永不丢失；功能可能被调整、中断或终止，原则上不另行通知。重要数据请自行留存备份。", null, { hk: "4pJ6TZ" });
	}
	static s5h(fbs: FbsRuntime) {
		return fbs._("责任限制", null, { hk: "VNl3F" });
	}
	static s5b(fbs: FbsRuntime) {
		return fbs._("在适用法律允许的最大范围内，本站对因使用或无法使用本站而产生的间接、附带或后果性损失不承担责任。", null, { hk: "3Q9PP0" });
	}
	static s6h(fbs: FbsRuntime) {
		return fbs._("条款变更", null, { hk: "3zp1KL" });
	}
	static s6b(fbs: FbsRuntime) {
		return fbs._("本条款可能不时更新，更新后的版本在本站公布即生效；你继续使用本站即视为接受更新后的条款。", null, { hk: "3d66Jy" });
	}
}
export abstract class PrivacyBodyFbtUtils {
	static s1h(fbs: FbsRuntime) {
		return fbs._("我们收集的信息", null, { hk: "2wFYT" });
	}
	static s1b(fbs: FbsRuntime) {
		return fbs._("当你使用 Discord 登录时，我们会读取并保存：你的 Discord 用户 ID、用户名与头像、你加入的 Discord 服务器列表、你在这些服务器中的昵称，以及用于保持登录状态的 OAuth 授权凭据（refresh token）。你在使用本站过程中产生的数据也会被保存，包括百业名册记录、车队与报名记录（包括座位上的身份标识）、装备库与配装方案、语言偏好，以及你在移动端开启通知后注册的推送令牌。", null, { hk: "1ptoBj" });
	}
	static s2h(fbs: FbsRuntime) {
		return fbs._("我们如何使用信息", null, { hk: "40kVIK" });
	}
	static s2b(fbs: FbsRuntime) {
		return fbs._("上述信息仅用于：登录与身份识别；校验你是否为某百业所绑定 Discord 服务器的成员；组队报名；发车提醒与应用推送；传家宝达成推送；以及按你的偏好显示语言。我们不出售你的个人数据，也不将其用于广告投放。", null, { hk: "2qNzon" });
	}
	static s3h(fbs: FbsRuntime) {
		return fbs._("信息的共享与第三方", null, { hk: "2h2z6Y" });
	}
	static s3b(fbs: FbsRuntime) {
		return fbs._("本站运行在 Cloudflare 的基础设施上，数据存储于其数据库服务；登录与成员校验由 Discord 提供；移动端推送经 Expo 推送服务转发至 Apple 或 Google 的推送通道。发车提醒与传家宝消息会发送到对应百业管理员配置的 Discord 频道，消息中会包含你的游戏昵称。除上述功能所必需的情形外，我们不会向其他第三方提供你的个人数据（法律法规要求除外）。", null, { hk: "3Dykqu" });
	}
	static s4h(fbs: FbsRuntime) {
		return fbs._("保存期限", null, { hk: "3d99wW" });
	}
	static s4b(fbs: FbsRuntime) {
		return fbs._("你的数据保存在本站数据库中，直至你申请删除，或相关数据对本站功能不再需要为止。报名、车队等历史记录目前会持续保留；如保存规则发生变化，我们会更新本政策。", null, { hk: "4s0Ul2" });
	}
	static s5h(fbs: FbsRuntime) {
		return fbs._("你的权利", null, { hk: "4bvpsY" });
	}
	static s5b(fbs: FbsRuntime) {
		return fbs._("你可以查询、导出或删除你的个人数据。在「个人资料」的「我的数据」中，你可以自助导出你的全部数据（需通过 Discord 重新验证身份，每 24 小时一次），也可以自助删除账号：提交删除后有 7 天冷静期，期间可随时撤销；到期后你的个人数据会被删除或匿名化——你创建的车队会转为无主车队、你在他人车队中的座位会被匿名化，备份中的副本最迟在 14 天内随每日备份轮换清除。你也可以随时在 Discord 的设置中断开本站的授权；授权失效后，你在本站的会话会自动作废。", null, { hk: "1XxYb5" });
	}
	static s6h(fbs: FbsRuntime) {
		return fbs._("联系我们", null, { hk: "3hyST0" });
	}
	static s6b(fbs: FbsRuntime) {
		return fbs._("如对本政策有疑问，或需提出查询、更正、删除申请，请通过本站社区百业「叽哩呱啦」的 Discord 服务器联系管理员。我们会先核实你的 Discord 账号身份，再处理你的申请。", null, { hk: "1wbYB2" });
	}
}
export abstract class ErrorsFbtUtils {
	static rateLimited(fbs: FbsRuntime) {
		return fbs._("操作过于频繁, 请稍后再试", null, { hk: "2pyv56" });
	}
	static createRateLimited(fbs: FbsRuntime) {
		return fbs._("创建太频繁, 请稍后再试", null, { hk: "3eTjil" });
	}
	static guildNotFound(fbs: FbsRuntime) {
		return fbs._("百业不存在", null, { hk: "1GM9TF" });
	}
	static gearNotFound(fbs: FbsRuntime) {
		return fbs._("装备不存在或不属于你", null, { hk: "4qS0bn" });
	}
	static gearEmptyBuild(fbs: FbsRuntime) {
		return fbs._("搭配为空", null, { hk: "15RdTy" });
	}
	static gearCapacityReached(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("装备库已满（上限 {limit} 件），删掉不用的装备后再添加", [fbs._param("limit", pv(p, "limit"))], { hk: "3LZ8Pv" });
	}
	static gearImportOverflow(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("本批 {n} 件会让装备库达到 {total} 件，超过上限 {limit} 件，整批未导入", [
			fbs._param("n", pv(p, "n")),
			fbs._param("total", pv(p, "total")),
			fbs._param("limit", pv(p, "limit"))
		], { hk: "1Mt0sS" });
	}
	static gearOcrBatchTooLarge(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("单批最多识别 {limit} 张截图，本批有 {n} 张，请分批导入", [fbs._param("limit", pv(p, "limit")), fbs._param("n", pv(p, "n"))], { hk: "vxCx" });
	}
	static gearOcrDailyLimit(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("今天的批量识别次数已达上限（{limit} 批），明天再试", [fbs._param("limit", pv(p, "limit"))], { hk: "2adKLK" });
	}
	static loginRequired(fbs: FbsRuntime) {
		return fbs._("请先登录 Discord 后再操作", null, { hk: "XElrV" });
	}
	static loginRequiredShort(fbs: FbsRuntime) {
		return fbs._("请先登录 Discord", null, { hk: "3Wkd6f" });
	}
	static localeUnsupported(fbs: FbsRuntime) {
		return fbs._("不支持的语言", null, { hk: "1pYDD7" });
	}
	static pushTokenInvalid(fbs: FbsRuntime) {
		return fbs._("推送令牌无效", null, { hk: "4i11th" });
	}
	static guildUnboundWrite(fbs: FbsRuntime) {
		return fbs._("该百业尚未绑定 Discord 服务器，写功能已锁定", null, { hk: "3MXuOf" });
	}
	static memberOnly(fbs: FbsRuntime) {
		return fbs._("只有该百业 Discord 服务器的成员可以操作", null, { hk: "4sO6xI" });
	}
	static memberOnlyView(fbs: FbsRuntime) {
		return fbs._("该百业仅对 Discord 服务器成员开放", null, { hk: "Hvf6X" });
	}
	static recruitClosed(fbs: FbsRuntime) {
		return fbs._("该百业尚未开放招新，暂时不能提交申请", null, { hk: "1WRvI8" });
	}
	static titleRequired(fbs: FbsRuntime) {
		return fbs._("请填写标题", null, { hk: "Lg5ef" });
	}
	static badStartTime(fbs: FbsRuntime) {
		return fbs._("请选择有效的出发时间", null, { hk: "yMv8N" });
	}
	static startTimeTooFar(fbs: FbsRuntime) {
		return fbs._("出发时间不能超过 60 天后", null, { hk: "3rOSP6" });
	}
	static badMaxSlots(fbs: FbsRuntime) {
		return fbs._("联机探索人数只能选 5 或 10 人", null, { hk: "39i2Ho" });
	}
	static groupingNotFound(fbs: FbsRuntime) {
		return fbs._("组队不存在", null, { hk: "2pu7yf" });
	}
	static officialEvent(fbs: FbsRuntime) {
		return fbs._("官方活动请联系管理员", null, { hk: "2HWqG3" });
	}
	static noCreatorRecorded(fbs: FbsRuntime) {
		return fbs._("该车队未记录车头，无法解散，请联系管理员处理", null, { hk: "42GnLi" });
	}
	static leaderOnlyDisband(fbs: FbsRuntime) {
		return fbs._("只有车头可以解散车队", null, { hk: "2PNuza" });
	}
	static noCreatorRecordedEdit(fbs: FbsRuntime) {
		return fbs._("该车队未记录车头，无法编辑，请联系管理员处理", null, { hk: "1PdrLp" });
	}
	static leaderOnlyEdit(fbs: FbsRuntime) {
		return fbs._("只有车头可以编辑车队", null, { hk: "AOZDf" });
	}
	static noCreatorRecordedComplete(fbs: FbsRuntime) {
		return fbs._("该车队未记录车头，无法完成，请联系管理员处理", null, { hk: "3wQIJ3" });
	}
	static leaderOnlyComplete(fbs: FbsRuntime) {
		return fbs._("只有车头可以完成车队", null, { hk: "1xQB1D" });
	}
	static noCreatorRecordedReopen(fbs: FbsRuntime) {
		return fbs._("该车队未记录车头，无法恢复，请联系管理员处理", null, { hk: "4E2Yv" });
	}
	static leaderOnlyReopen(fbs: FbsRuntime) {
		return fbs._("只有车头可以恢复车队", null, { hk: "4sJPNK" });
	}
	static groupingAlreadyCompleted(fbs: FbsRuntime) {
		return fbs._("该车队已是完成状态", null, { hk: "2IGiQa" });
	}
	static noCreatorRecordedMerge(fbs: FbsRuntime) {
		return fbs._("该车队未记录车头，无法合并，请联系管理员处理", null, { hk: "2jd3oo" });
	}
	static leaderOnlyMerge(fbs: FbsRuntime) {
		return fbs._("只有车头或百业管理员可以合并车队", null, { hk: "12RSta" });
	}
	static mergeSameGrouping(fbs: FbsRuntime) {
		return fbs._("不能把车队并入它自己", null, { hk: "1OzY7b" });
	}
	static mergeGuildMismatch(fbs: FbsRuntime) {
		return fbs._("只能合并同一百业的车队", null, { hk: "1hx4Tq" });
	}
	static mergeTypeMismatch(fbs: FbsRuntime) {
		return fbs._("只能合并相同类型的车队", null, { hk: "3OFVU8" });
	}
	static mergeRaceUnsupported(fbs: FbsRuntime) {
		return fbs._("竞速车队暂不支持合并", null, { hk: "2YYqTf" });
	}
	static mergeNotOpen(fbs: FbsRuntime) {
		return fbs._("只能合并报名中的车队", null, { hk: "bPWl4" });
	}
	static groupingNotCompleted(fbs: FbsRuntime) {
		return fbs._("该车队尚未完成", null, { hk: "vjrAY" });
	}
	static groupingClosed(fbs: FbsRuntime) {
		return fbs._("该组队已截止报名", null, { hk: "2Zto41" });
	}
	static nicknameRequired(fbs: FbsRuntime) {
		return fbs._("请填写游戏昵称", null, { hk: "49YVGH" });
	}
	static proxyTargetNotInRoster(fbs: FbsRuntime) {
		return fbs._("所选成员不在本百业名册中", null, { hk: "28nCt9" });
	}
	static seatNamesNotInRoster(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("以下名字不在本百业名册中，无法占座：{names}。请先将他们加入名册（或导入游戏名名册）后再保存", [fbs._param("names", pv(p, "names"))], { hk: "3ziBlo" });
	}
	static groupingFull(fbs: FbsRuntime) {
		return fbs._("名额已满或报名已截止", null, { hk: "15cLeP" });
	}
	static lastSeatHealer(fbs: FbsRuntime) {
		return fbs._("最后一个名额需要奶", null, { hk: "1x74S" });
	}
	static alreadyJoined(fbs: FbsRuntime) {
		return fbs._("已报过名", null, { hk: "3FzZxW" });
	}
	static seatNotFound(fbs: FbsRuntime) {
		return fbs._("未找到该报名", null, { hk: "3fPe8z" });
	}
	static notSeated(fbs: FbsRuntime) {
		return fbs._("你还没有落座这辆车", null, { hk: "4abppU" });
	}
	static reminderOffsetsInvalid(fbs: FbsRuntime) {
		return fbs._("提醒提前量不在可选范围内", null, { hk: "2UilSo" });
	}
	static ogAccentInvalid(fbs: FbsRuntime) {
		return fbs._("强调色不在可选范围内", null, { hk: "4wOaUO" });
	}
	static paramsIncomplete(fbs: FbsRuntime) {
		return fbs._("参数不完整", null, { hk: "1i6CaD" });
	}
	static bossNotFound(fbs: FbsRuntime) {
		return fbs._("首领不存在", null, { hk: "1Nmosi" });
	}
	static guildNameShort(fbs: FbsRuntime) {
		return fbs._("百业名称至少 2 个字", null, { hk: "Bdsei" });
	}
	static avatarTooLarge(fbs: FbsRuntime) {
		return fbs._("头像图片不能超过 400KB", null, { hk: "1Ihpg4" });
	}
	static avatarBadType(fbs: FbsRuntime) {
		return fbs._("头像只支持 PNG、JPEG 或 WebP 图片", null, { hk: "2rh9Ep" });
	}
	static avatarEmpty(fbs: FbsRuntime) {
		return fbs._("没有收到图片数据", null, { hk: "4FU2d1" });
	}
	static slugInvalid(fbs: FbsRuntime) {
		return fbs._("站点地址只能用小写字母/数字/连字符, 2-40 位", null, { hk: "1hyi9b" });
	}
	static slugReserved(fbs: FbsRuntime) {
		return fbs._("该地址为保留字, 请换一个", null, { hk: "3BxCZz" });
	}
	static slugTaken(fbs: FbsRuntime) {
		return fbs._("该地址已被占用, 请换一个", null, { hk: "324KKZ" });
	}
	static serverRequired(fbs: FbsRuntime) {
		return fbs._("请选择要绑定的 Discord 服务器", null, { hk: "28b7CE" });
	}
	static notInServer(fbs: FbsRuntime) {
		return fbs._("你不在这个 Discord 服务器中", null, { hk: "4iWZX9" });
	}
	static cannotManageServer(fbs: FbsRuntime) {
		return fbs._("你需要在该 Discord 服务器拥有管理员或「管理服务器」权限才能绑定它", null, { hk: "VYEGD" });
	}
	static adminOnly(fbs: FbsRuntime) {
		return fbs._("只有所绑服务器的管理员可以执行此操作", null, { hk: "4quKVx" });
	}
	static platformAdminRequired(fbs: FbsRuntime) {
		return fbs._("需要平台超管权限", null, { hk: "13JVbw" });
	}
	static tierInvalid(fbs: FbsRuntime) {
		return fbs._("档位无效", null, { hk: "CJ5UQ" });
	}
	static feedbackNotFound(fbs: FbsRuntime) {
		return fbs._("反馈不存在", null, { hk: "1HI5j9" });
	}
	static bossNameRequired(fbs: FbsRuntime) {
		return fbs._("首领名不能为空", null, { hk: "4GB25u" });
	}
	static webhookFormatInvalid(fbs: FbsRuntime) {
		return fbs._("Webhook URL 格式不对（应为 https://discord.com/api/webhooks/...）", null, { hk: "3iBaHK" });
	}
	static webhookNotConfigured(fbs: FbsRuntime) {
		return fbs._("尚未配置 Webhook URL", null, { hk: "1IM8hg" });
	}
	static subdomainTrialCardRequired(fbs: FbsRuntime) {
		return fbs._("该百业处于试用期且未登记支付方式：启用平台子域名前需先登记卡（试用期启用持久化功能需绑卡）", null, { hk: "40mHIj" });
	}
	static backupStorageMissing(fbs: FbsRuntime) {
		return fbs._("备份存储（R2 BACKUPS 绑定）未配置", null, { hk: "2OMHMJ" });
	}
	static backupNotFound(fbs: FbsRuntime) {
		return fbs._("备份不存在", null, { hk: "uPJcJ" });
	}
	static badParams(fbs: FbsRuntime) {
		return fbs._("参数不正确", null, { hk: "VQLwo" });
	}
	static testSendFailed(fbs: FbsRuntime) {
		return fbs._("测试发送失败", null, { hk: "26RU2h" });
	}
	static noCandidates(fbs: FbsRuntime) {
		return fbs._("没有符合条件的成员可发送", null, { hk: "3jeRkP" });
	}
	static nudgeDailyLimit(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("今天的定向催报已达上限（每天 {limit} 次），明天再发", [fbs._param("limit", pv(p, "limit"))], { hk: "1WbvW0" });
	}
	static nudgeCooldown(fbs: FbsRuntime) {
		return fbs._("这辆车刚催报过，24 小时内不能重复催报", null, { hk: "2RZdK8" });
	}
	static nudgeEventInvalid(fbs: FbsRuntime) {
		return fbs._("要催报的车队不存在或不属于本百业", null, { hk: "1EDLkK" });
	}
	static contributionRuleInvalid(fbs: FbsRuntime) {
		return fbs._("积分规则不合法", null, { hk: "3kQt6V" });
	}
	static webhookInvalid(fbs: FbsRuntime) {
		return fbs._("Webhook 地址格式不正确", null, { hk: "rSB9v" });
	}
	static discordIdInvalid(fbs: FbsRuntime) {
		return fbs._("Discord 服务器 ID 格式不正确", null, { hk: "41ALcR" });
	}
	static noFieldsToUpdate(fbs: FbsRuntime) {
		return fbs._("没有可更新的字段", null, { hk: "z18tt" });
	}
	static signupNotFound(fbs: FbsRuntime) {
		return fbs._("未找到该报名记录", null, { hk: "2a9V1i" });
	}
	static resultNotFound(fbs: FbsRuntime) {
		return fbs._("未找到该成绩", null, { hk: "1JL8Ch" });
	}
	static resultTeamRequired(fbs: FbsRuntime) {
		return fbs._("缺少队伍名", null, { hk: "3DzmOG" });
	}
	static resultTimeInvalid(fbs: FbsRuntime) {
		return fbs._("用时格式不正确（如 12:34.567）", null, { hk: "2weeFB" });
	}
	static avatarDataInvalid(fbs: FbsRuntime) {
		return fbs._("图片数据无效", null, { hk: "2P3QaG" });
	}
	static schoolRequired(fbs: FbsRuntime) {
		return fbs._("缺少流派", null, { hk: "21UKzg" });
	}
	static generic(fbs: FbsRuntime) {
		return fbs._("操作失败，请稍后再试", null, { hk: "ewnSH" });
	}
	static templateNotFound(fbs: FbsRuntime) {
		return fbs._("模板不存在", null, { hk: "PkmJL" });
	}
	static templateNameRequired(fbs: FbsRuntime) {
		return fbs._("请填写模板名", null, { hk: "2UTQmV" });
	}
	static templateForbidden(fbs: FbsRuntime) {
		return fbs._("只有模板创建者或百业管理员可以改删模板", null, { hk: "4xa9aw" });
	}
	static templateBadStart(fbs: FbsRuntime) {
		return fbs._("发车时间设置无效", null, { hk: "bhhli" });
	}
	static accountReauthRequired(fbs: FbsRuntime) {
		return fbs._("请先通过 Discord 重新验证身份", null, { hk: "2NzjLD" });
	}
	static accountExportRateLimited(fbs: FbsRuntime) {
		return fbs._("每 24 小时只能导出一次数据，请稍后再试", null, { hk: "13uyVM" });
	}
	static accountUsernameMismatch(fbs: FbsRuntime) {
		return fbs._("输入的显示名与你的账号不一致", null, { hk: "1CybfK" });
	}
	static accountDeletionPending(fbs: FbsRuntime) {
		return fbs._("已有一份删除申请在冷静期中", null, { hk: "1oQcTg" });
	}
	static accountDeletionNotPending(fbs: FbsRuntime) {
		return fbs._("当前没有待执行的删除申请", null, { hk: "WUmgX" });
	}
	static premiumRequired(fbs: FbsRuntime) {
		return fbs._("该功能需要开通 Premium", null, { hk: "2XIDnE" });
	}
	static customDomainInvalid(fbs: FbsRuntime) {
		return fbs._("域名格式不正确，请填写裸域名（如 www.example.com）", null, { hk: "3wp5Hu" });
	}
	static customDomainReserved(fbs: FbsRuntime) {
		return fbs._("该域名为平台保留域名，不能绑定", null, { hk: "2T9xkJ" });
	}
	static customDomainConflict(fbs: FbsRuntime) {
		return fbs._("该域名已被其他百业绑定", null, { hk: "1gDvlL" });
	}
	static customDomainNotBound(fbs: FbsRuntime) {
		return fbs._("本百业尚未绑定域名", null, { hk: "8NHoC" });
	}
	static customDomainDisabled(fbs: FbsRuntime) {
		return fbs._("该域名已被平台停用", null, { hk: "1Zlfnr" });
	}
	static customDomainSeamPending(fbs: FbsRuntime) {
		return fbs._("平台域名服务尚在接通中，暂不能验证", null, { hk: "36D48R" });
	}
	static customDomainDnsPending(fbs: FbsRuntime) {
		return fbs._("DNS 记录尚未生效或不完整，请确认两条记录后稍后再试", null, { hk: "1E9FYb" });
	}
	static gearStandardInvalid(fbs: FbsRuntime) {
		return fbs._("达标线参数不合法", null, { hk: "eTWTZ" });
	}
	static gearStandardNotFound(fbs: FbsRuntime) {
		return fbs._("达标线不存在", null, { hk: "HqhRP" });
	}
	static capabilityRequired(fbs: FbsRuntime) {
		return fbs._("你没有这项管理权限（需要百业管理员授予对应的军官能力）", null, { hk: "2tAr2Z" });
	}
	static governanceTierRequired(fbs: FbsRuntime) {
		return fbs._("治理功能需要百业达到最高档位（T3）", null, { hk: "2mfxS" });
	}
	static officerTargetNotFound(fbs: FbsRuntime) {
		return fbs._("目标成员不在本百业名册中", null, { hk: "1p6Vlk" });
	}
	static officerBoardBodyRequired(fbs: FbsRuntime) {
		return fbs._("私密区留言不能为空", null, { hk: "22nc8i" });
	}
	static officerBoardBodyTooLong(fbs: FbsRuntime) {
		return fbs._("私密区留言过长", null, { hk: "2v6QSo" });
	}
	static officerBoardPostNotFound(fbs: FbsRuntime) {
		return fbs._("私密区留言不存在", null, { hk: "2qSADj" });
	}
	static premiumComingSoon(fbs: FbsRuntime) {
		return fbs._("Premium 开通即将开放", null, { hk: "2AKPwI" });
	}
	static premiumActive(fbs: FbsRuntime) {
		return fbs._("本百业已开通 Premium", null, { hk: "tHT2r" });
	}
	static paygateDisabled(fbs: FbsRuntime) {
		return fbs._("收费功能尚未开启", null, { hk: "EirAh" });
	}
	static checkoutFailed(fbs: FbsRuntime) {
		return fbs._("创建支付会话失败，请稍后再试", null, { hk: "2vnze9" });
	}
	static rosterImportEmpty(fbs: FbsRuntime) {
		return fbs._("没有收到任何识别文本，请重新截图后再试", null, { hk: "251ACD" });
	}
	static rosterBatchNotFound(fbs: FbsRuntime) {
		return fbs._("导入预览不存在或已失效，请重新识别", null, { hk: "1caSDb" });
	}
	static rosterBatchConfirmed(fbs: FbsRuntime) {
		return fbs._("这份预览已经确认导入过了", null, { hk: "1vzhMM" });
	}
	static rosterNoImportableRows(fbs: FbsRuntime) {
		return fbs._("没有勾选任何可导入的新名", null, { hk: "mIP3K" });
	}
	static rosterEntryNotFound(fbs: FbsRuntime) {
		return fbs._("名册记录不存在", null, { hk: "1CSA4T" });
	}
	static checklistItemUnknown(fbs: FbsRuntime) {
		return fbs._("检查条目不存在", null, { hk: "2dupXm" });
	}
	static feedbackEmpty(fbs: FbsRuntime) {
		return fbs._("反馈内容不能为空", null, { hk: "39jTvZ" });
	}
	static feedbackTooLong(fbs: FbsRuntime) {
		return fbs._("反馈内容太长，请精简到 2000 字以内", null, { hk: "2O5Yen" });
	}
	static feedbackRateLimited(fbs: FbsRuntime) {
		return fbs._("今天提交的反馈已达上限，请明天再来", null, { hk: "42gbR4" });
	}
	static announcementTitleRequired(fbs: FbsRuntime) {
		return fbs._("请填写公告标题", null, { hk: "2PyyXK" });
	}
	static announcementTitleTooLong(fbs: FbsRuntime) {
		return fbs._("公告标题太长，请精简到 80 字以内", null, { hk: "1qURcq" });
	}
	static announcementBodyTooLong(fbs: FbsRuntime) {
		return fbs._("公告正文太长，请精简到 2000 字以内", null, { hk: "1idQ5j" });
	}
	static announcementNotFound(fbs: FbsRuntime) {
		return fbs._("公告不存在", null, { hk: "Dt2z1" });
	}
	static translationNotConfigured(fbs: FbsRuntime) {
		return fbs._("多语翻译尚未配置", null, { hk: "E71Jo" });
	}
	static translationTierLocked(fbs: FbsRuntime) {
		return fbs._("多语公告需要更高的百业档位", null, { hk: "2yvLrR" });
	}
	static announcementDailyLimit(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("今天的公告已达上限（每天 {limit} 条），明天再发", [fbs._param("limit", pv(p, "limit"))], { hk: "2OFzHt" });
	}
	static urgentCallDailyLimit(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("今天的紧急集合呼叫已达上限（每天 {limit} 次），明天再试", [fbs._param("limit", pv(p, "limit"))], { hk: "1lFShV" });
	}
	static lotteryTitleRequired(fbs: FbsRuntime) {
		return fbs._("请填写抽奖标题", null, { hk: "317GDK" });
	}
	static lotteryEntriesEmpty(fbs: FbsRuntime) {
		return fbs._("参与名单为空，请先选择参与者", null, { hk: "1VGSMM" });
	}
	static lotteryNotFound(fbs: FbsRuntime) {
		return fbs._("抽奖不存在", null, { hk: "111JHY" });
	}
	static lotteryAlreadyDrawn(fbs: FbsRuntime) {
		return fbs._("该抽奖已经开过奖了", null, { hk: "3NeN8P" });
	}
	static lotteryWinnerCountInvalid(fbs: FbsRuntime) {
		return fbs._("中奖人数必须在 1 与参与人数之间", null, { hk: "2YNQbr" });
	}
	static lotteryWeightInvalid(fbs: FbsRuntime) {
		return fbs._("权重必须是 1 到 1000 之间的整数", null, { hk: "790lO" });
	}
	static lotteryMemberNotInGuild(fbs: FbsRuntime) {
		return fbs._("所选成员不在本百业名册中", null, { hk: "GI6NX" });
	}
	static availabilitySlotInvalid(fbs: FbsRuntime) {
		return fbs._("可用时段不合法", null, { hk: "2JZVSE" });
	}
	static availabilityTooManySlots(fbs: FbsRuntime) {
		return fbs._("可用时段太多（最多 21 个）", null, { hk: "2KgN3s" });
	}
	static pollTitleRequired(fbs: FbsRuntime) {
		return fbs._("请填写投票标题", null, { hk: "UZ2Yt" });
	}
	static pollOptionsInvalid(fbs: FbsRuntime) {
		return fbs._("候选时间不合法（需 2–8 个不同的未来时间）", null, { hk: "3YUbnT" });
	}
	static pollNotFound(fbs: FbsRuntime) {
		return fbs._("投票不存在", null, { hk: "3cxDti" });
	}
	static pollClosed(fbs: FbsRuntime) {
		return fbs._("该投票已关闭", null, { hk: "FESnS" });
	}
	static pollOptionInvalid(fbs: FbsRuntime) {
		return fbs._("所选时间不属于该投票", null, { hk: "WkfTY" });
	}
	static pollForbidden(fbs: FbsRuntime) {
		return fbs._("只有发起人或百业管理员可以关闭投票", null, { hk: "ZRp8J" });
	}
	static customFieldInvalid(fbs: FbsRuntime) {
		return fbs._("自定义字段不合法", null, { hk: "36ve4H" });
	}
	static fillOfferExists(fbs: FbsRuntime) {
		return fbs._("你已有一份发布中的补位供给，请先撤下再重新发布", null, { hk: "VWY62" });
	}
	static fillSchoolRequired(fbs: FbsRuntime) {
		return fbs._("请填写流派", null, { hk: "45mSYI" });
	}
	static fillWindowsInvalid(fbs: FbsRuntime) {
		return fbs._("可补位时段不合法", null, { hk: "33usQH" });
	}
	static fillRequestNotFound(fbs: FbsRuntime) {
		return fbs._("补位需求不存在", null, { hk: "4oQsOj" });
	}
	static fillRequestNotOpen(fbs: FbsRuntime) {
		return fbs._("该补位需求已撮合或已关闭", null, { hk: "1doZyX" });
	}
	static fillOfferNotOpen(fbs: FbsRuntime) {
		return fbs._("该补位供给已撤下", null, { hk: "3aErMD" });
	}
	static fillInviteExists(fbs: FbsRuntime) {
		return fbs._("已经邀请过这位补位人选了", null, { hk: "286M71" });
	}
	static fillInviteNotFound(fbs: FbsRuntime) {
		return fbs._("补位邀请不存在", null, { hk: "1dbwo2" });
	}
	static fillInviteNotPending(fbs: FbsRuntime) {
		return fbs._("该邀请已经处理过了", null, { hk: "2PZXd" });
	}
	static fillInviteNotAccepted(fbs: FbsRuntime) {
		return fbs._("对方尚未接受邀请，不能落座", null, { hk: "2588eH" });
	}
	static fillSelfInvite(fbs: FbsRuntime) {
		return fbs._("不能邀请自己补位", null, { hk: "4xiqVM" });
	}
	static marketManageOnly(fbs: FbsRuntime) {
		return fbs._("只有该车队的车头或本百业管理员可以操作补位需求", null, { hk: "mhXwx" });
	}
	static allianceSelf(fbs: FbsRuntime) {
		return fbs._("不能和自己的百业结盟", null, { hk: "25JbBc" });
	}
	static allianceExists(fbs: FbsRuntime) {
		return fbs._("与该百业已有待确认或生效中的结盟关系", null, { hk: "1faqXe" });
	}
	static allianceNotFound(fbs: FbsRuntime) {
		return fbs._("结盟关系不存在", null, { hk: "2m0sVJ" });
	}
	static allianceNotPending(fbs: FbsRuntime) {
		return fbs._("该结盟邀请已经处理过了", null, { hk: "2y5pxu" });
	}
	static allianceNotActive(fbs: FbsRuntime) {
		return fbs._("该结盟已不在生效中", null, { hk: "1dnnZ1" });
	}
	static allyNotAllied(fbs: FbsRuntime) {
		return fbs._("与主办百业尚未结盟（或结盟已解除）", null, { hk: "3dVJYa" });
	}
	static allyNotShared(fbs: FbsRuntime) {
		return fbs._("该车队未向盟友开放访客位", null, { hk: "3GjNKO" });
	}
	static visitorSlotsFull(fbs: FbsRuntime) {
		return fbs._("访客位已满", null, { hk: "3DmyRm" });
	}
	static visitorSlotsInvalid(fbs: FbsRuntime) {
		return fbs._("访客名额必须在 0 与车队总名额之间", null, { hk: "qaWoB" });
	}
	static customFieldTooMany(fbs: FbsRuntime) {
		return fbs._("自定义字段最多 5 个", null, { hk: "1gXwio" });
	}
	static signupAnswerRequired(fbs: FbsRuntime) {
		return fbs._("请填写必填的报名信息", null, { hk: "3DN0rV" });
	}
	static signupAnswerInvalid(fbs: FbsRuntime) {
		return fbs._("报名信息不合法", null, { hk: "DiAr9" });
	}
	static applicationPending(fbs: FbsRuntime) {
		return fbs._("你已有一份待审核的申请，请等待审核结果", null, { hk: "YywBz" });
	}
	static alreadyMember(fbs: FbsRuntime) {
		return fbs._("你已经是这个百业的成员了", null, { hk: "zr7kv" });
	}
	static recruitUnavailable(fbs: FbsRuntime) {
		return fbs._("该百业尚未绑定 Discord 服务器，暂不开放招新申请", null, { hk: "3JLEwO" });
	}
	static applicationNotFound(fbs: FbsRuntime) {
		return fbs._("申请不存在", null, { hk: "422lQz" });
	}
	static applicationNotPending(fbs: FbsRuntime) {
		return fbs._("该申请已经审核过了", null, { hk: "2W6JS" });
	}
	static mentorNotDesignated(fbs: FbsRuntime) {
		return fbs._("所选导师不在本百业导师人选中，请先设为导师", null, { hk: "3Q97YD" });
	}
	static mentorNotInGuild(fbs: FbsRuntime) {
		return fbs._("所选导师不在本百业名册中", null, { hk: "NWHi3" });
	}
	static menteeNotInGuild(fbs: FbsRuntime) {
		return fbs._("所选新人不在本百业名册中", null, { hk: "42rtta" });
	}
	static menteeAlreadyPaired(fbs: FbsRuntime) {
		return fbs._("该新人已有一段进行中的配对，请先结束它再改配", null, { hk: "2GH9B6" });
	}
	static mentorSelfPairing(fbs: FbsRuntime) {
		return fbs._("导师和新人不能是同一个人", null, { hk: "1z5pjj" });
	}
	static pairingNotFound(fbs: FbsRuntime) {
		return fbs._("配对不存在", null, { hk: "ZCzrm" });
	}
	static pairingAlreadyEnded(fbs: FbsRuntime) {
		return fbs._("该配对已经结束了", null, { hk: "1Pmb8D" });
	}
	static officerNoteBodyRequired(fbs: FbsRuntime) {
		return fbs._("请填写备注内容", null, { hk: "3Gb9bz" });
	}
	static officerNoteBodyTooLong(fbs: FbsRuntime) {
		return fbs._("备注太长，请精简到 500 字以内", null, { hk: "3PoGXu" });
	}
	static officerNoteNotFound(fbs: FbsRuntime) {
		return fbs._("备注不存在", null, { hk: "Yni1B" });
	}
	static officerMemberNotFound(fbs: FbsRuntime) {
		return fbs._("该成员不在本百业名册中", null, { hk: "UtFS5" });
	}
	static seasonGoalTitleRequired(fbs: FbsRuntime) {
		return fbs._("请填写目标", null, { hk: "1klOH8" });
	}
	static seasonGoalTitleTooLong(fbs: FbsRuntime) {
		return fbs._("目标太长，请精简到 80 字以内", null, { hk: "3GdnU8" });
	}
	static seasonGoalNoteTooLong(fbs: FbsRuntime) {
		return fbs._("进度备注太长，请精简到 500 字以内", null, { hk: "VReM3" });
	}
	static seasonGoalNotFound(fbs: FbsRuntime) {
		return fbs._("目标不存在", null, { hk: "4ACIew" });
	}
	static seasonGoalDungeonNotFound(fbs: FbsRuntime) {
		return fbs._("关联的副本不存在", null, { hk: "4rkG4k" });
	}
	static recapForbidden(fbs: FbsRuntime) {
		return fbs._("只有车头或本百业管理员可以生成复盘", null, { hk: "Xs3KV" });
	}
	static recapNotCompleted(fbs: FbsRuntime) {
		return fbs._("车队完成后才能生成复盘", null, { hk: "2ooaBT" });
	}
	static recapTierLocked(fbs: FbsRuntime) {
		return fbs._("该百业尚未开通 AI 复盘（高阶订阅档功能）", null, { hk: "3sBJcs" });
	}
	static recapNotEnabled(fbs: FbsRuntime) {
		return fbs._("AI 复盘尚未开启", null, { hk: "qgRsD" });
	}
	static recapDailyLimit(fbs: FbsRuntime) {
		return fbs._("今日复盘生成次数已达上限，明天再试", null, { hk: "2XN78P" });
	}
	static recapProviderFailed(fbs: FbsRuntime) {
		return fbs._("复盘生成失败，请稍后重试", null, { hk: "3ZuNJ8" });
	}
	static combatReportForbidden(fbs: FbsRuntime) {
		return fbs._("只有导入者本人、车头或本百业管理员可以删除这场报告", null, { hk: "292Rmf" });
	}
	static combatEncounterNotFound(fbs: FbsRuntime) {
		return fbs._("战斗报告不存在", null, { hk: "NEZSl" });
	}
	static combatTierLocked(fbs: FbsRuntime) {
		return fbs._("该百业尚未开通战斗报告（进阶订阅档功能）", null, { hk: "1RmU0Z" });
	}
}
export abstract class GuildAdminFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("管理百业", null, { hk: "phqWb" });
	}
	static lockedTitle(fbs: FbsRuntime) {
		return fbs._("无权管理这个百业", null, { hk: "2bppxm" });
	}
	static lockedBody(fbs: FbsRuntime) {
		return fbs._("只有该百业所绑 Discord 服务器的管理员（服务器主或拥有管理权限）可以进入管理页。", null, { hk: "3YUq72" });
	}
	static backLink(fbs: FbsRuntime) {
		return fbs._("‹ 返回百业", null, { hk: "24fZWW" });
	}
	static tabProfile(fbs: FbsRuntime) {
		return fbs._("资料", null, { hk: "1HgYhF" });
	}
	static tabDiscord(fbs: FbsRuntime) {
		return fbs._("Discord", null, { hk: "4w7eCd" });
	}
	static tabEvents(fbs: FbsRuntime) {
		return fbs._("活动", null, { hk: "4my4EZ" });
	}
	static tabGuides(fbs: FbsRuntime) {
		return fbs._("攻略数据", null, { hk: "20bLzZ" });
	}
	static saveButton(fbs: FbsRuntime) {
		return fbs._("保存", null, { hk: "2K3Ixv" });
	}
	static savedText(fbs: FbsRuntime) {
		return fbs._("已保存", null, { hk: "4g7ibo" });
	}
	static deleteButton(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "4CBC8M" });
	}
	static editButton(fbs: FbsRuntime) {
		return fbs._("编辑", null, { hk: "3W12fJ" });
	}
	static addButton(fbs: FbsRuntime) {
		return fbs._("新增", null, { hk: "1lDtAP" });
	}
	static profileTitle(fbs: FbsRuntime) {
		return fbs._("百业资料", null, { hk: "2jfk0Q" });
	}
	static nameLabel(fbs: FbsRuntime) {
		return fbs._("百业名称", null, { hk: "43S8K0" });
	}
	static announcementLabel(fbs: FbsRuntime) {
		return fbs._("公告", null, { hk: "SQMdb" });
	}
	static sloganLabel(fbs: FbsRuntime) {
		return fbs._("标语", null, { hk: "3J9jrh" });
	}
	static masterNameLabel(fbs: FbsRuntime) {
		return fbs._("掌门", null, { hk: "OMeO3" });
	}
	static logoUrlLabel(fbs: FbsRuntime) {
		return fbs._("标志图链接", null, { hk: "2DjwOu" });
	}
	static bgImageUrlLabel(fbs: FbsRuntime) {
		return fbs._("背景图链接", null, { hk: "4gAXNC" });
	}
	static avatarTitle(fbs: FbsRuntime) {
		return fbs._("百业头像", null, { hk: "1FHosS" });
	}
	static avatarUpload(fbs: FbsRuntime) {
		return fbs._("上传头像", null, { hk: "3PxMBe" });
	}
	static avatarReplace(fbs: FbsRuntime) {
		return fbs._("更换头像", null, { hk: "1hB6ZX" });
	}
	static avatarDelete(fbs: FbsRuntime) {
		return fbs._("删除头像", null, { hk: "1BtJXp" });
	}
	static avatarNone(fbs: FbsRuntime) {
		return fbs._("尚未设置头像，当前显示默认印章。", null, { hk: "3htYqY" });
	}
	static avatarHint(fbs: FbsRuntime) {
		return fbs._("正方形图片效果最佳，大小 ≤ 400KB（PNG / JPEG / WebP）。", null, { hk: "21Brtp" });
	}
	static discordTitle(fbs: FbsRuntime) {
		return fbs._("Discord 集成", null, { hk: "1rvCzP" });
	}
	static webhookLabel(fbs: FbsRuntime) {
		return fbs._("发车提醒 Webhook", null, { hk: "3PxssL" });
	}
	static webhookSet(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已设置（Webhook 编号 {id}）", [fbs._param("id", pv(p, "id"))], { hk: "3g4z2k" });
	}
	static webhookUnset(fbs: FbsRuntime) {
		return fbs._("未设置", null, { hk: "2RhZdb" });
	}
	static webhookHint(fbs: FbsRuntime) {
		return fbs._("保存后不回显完整地址；留空并保存 = 保持不变，点「清除」移除。", null, { hk: "2gModH" });
	}
	static webhookClear(fbs: FbsRuntime) {
		return fbs._("清除 Webhook", null, { hk: "2w709f" });
	}
	static guildIdLabel(fbs: FbsRuntime) {
		return fbs._("绑定的服务器 ID", null, { hk: "21rL3U" });
	}
	static guildIdUnbound(fbs: FbsRuntime) {
		return fbs._("未绑定", null, { hk: "4cL5Mt" });
	}
	static reminderTitle(fbs: FbsRuntime) {
		return fbs._("发车提醒设置", null, { hk: "TTeLg" });
	}
	static reminderOffsetsLabel(fbs: FbsRuntime) {
		return fbs._("提醒提前量（可多选）", null, { hk: "3ErCYd" });
	}
	static reminderOffsetOption(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("提前 {minutes} 分钟", [fbs._param("minutes", pv(p, "minutes"))], { hk: "3643QP" });
	}
	static reminderCustomTextLabel(fbs: FbsRuntime) {
		return fbs._("自定义提醒文案", null, { hk: "Al9ru" });
	}
	static reminderCustomTextHint(fbs: FbsRuntime) {
		return fbs._("一行文字，会出现在提醒卡片里；最多 100 字，留空不显示。第一次提前提醒会通知所有人，之后的只催还没就位的人。", null, { hk: "1GufX5" });
	}
	static visibilityTitle(fbs: FbsRuntime) {
		return fbs._("可见性", null, { hk: "2jxYpd" });
	}
	static devOnlyLabel(fbs: FbsRuntime) {
		return fbs._("仅开发环境可见", null, { hk: "3KjpgY" });
	}
	static eventsTitle(fbs: FbsRuntime) {
		return fbs._("活动管理", null, { hk: "IUICH" });
	}
	static signupCsvSuffix(fbs: FbsRuntime) {
		return fbs._("报名表", null, { hk: "QWX2s" });
	}
	static eventEmpty(fbs: FbsRuntime) {
		return fbs._("暂无活动。", null, { hk: "aUFdm" });
	}
	static eventTitleLabel(fbs: FbsRuntime) {
		return fbs._("标题", null, { hk: "1GwVGx" });
	}
	static eventTypeLabel(fbs: FbsRuntime) {
		return fbs._("类型", null, { hk: "RrOsQ" });
	}
	static eventStatusLabel(fbs: FbsRuntime) {
		return fbs._("状态", null, { hk: "48aj7O" });
	}
	static eventTimeLabel(fbs: FbsRuntime) {
		return fbs._("发车时间", null, { hk: "SM7LR" });
	}
	static eventSlotsLabel(fbs: FbsRuntime) {
		return fbs._("席位上限", null, { hk: "3Dj9x5" });
	}
	static eventMeetLabel(fbs: FbsRuntime) {
		return fbs._("集合信息", null, { hk: "1UzbbL" });
	}
	static eventDescLabel(fbs: FbsRuntime) {
		return fbs._("说明", null, { hk: "1EChB4" });
	}
	static eventDungeonLabel(fbs: FbsRuntime) {
		return fbs._("副本", null, { hk: "VGSRH" });
	}
	static statusOpen(fbs: FbsRuntime) {
		return fbs._("开放报名", null, { hk: "1nWrNu" });
	}
	static statusClosed(fbs: FbsRuntime) {
		return fbs._("已截止", null, { hk: "3z5ryU" });
	}
	static statusCompleted(fbs: FbsRuntime) {
		return fbs._("已完成", null, { hk: "1hmgKs" });
	}
	static statusDraft(fbs: FbsRuntime) {
		return fbs._("草稿", null, { hk: "2wboXb" });
	}
	static signupsTitle(fbs: FbsRuntime) {
		return fbs._("报名名单", null, { hk: "1bbyfd" });
	}
	static signupEmpty(fbs: FbsRuntime) {
		return fbs._("暂无报名。", null, { hk: "1FB1hT" });
	}
	static exportCsvButton(fbs: FbsRuntime) {
		return fbs._("导出 CSV", null, { hk: "4C0a4W" });
	}
	static removeSignupButton(fbs: FbsRuntime) {
		return fbs._("移除", null, { hk: "hVM2D" });
	}
	static resultsTitle(fbs: FbsRuntime) {
		return fbs._("竞速成绩", null, { hk: "3HGuVd" });
	}
	static resultTeamLabel(fbs: FbsRuntime) {
		return fbs._("队伍名", null, { hk: "14nAxa" });
	}
	static resultMembersLabel(fbs: FbsRuntime) {
		return fbs._("队员（逗号分隔）", null, { hk: "9d0OS" });
	}
	static resultTimeLabel(fbs: FbsRuntime) {
		return fbs._("用时（如 12:34.567）", null, { hk: "28gLyc" });
	}
	static resultProofLabel(fbs: FbsRuntime) {
		return fbs._("凭证链接", null, { hk: "2XjaSy" });
	}
	static resultNoteLabel(fbs: FbsRuntime) {
		return fbs._("备注", null, { hk: "1So4A5" });
	}
	static guidesTitle(fbs: FbsRuntime) {
		return fbs._("流派攻略数据（BiS / 循环）", null, { hk: "YEm37" });
	}
	static guidesHint(fbs: FbsRuntime) {
		return fbs._("按流派填写：build 名称、属性行、占比行、BiS（JSON）与循环（JSON）。保存后流派页即时生效。", null, { hk: "1Cqxi3" });
	}
	static guideSchoolLabel(fbs: FbsRuntime) {
		return fbs._("流派", null, { hk: "1L2k94" });
	}
	static guideBuildLabel(fbs: FbsRuntime) {
		return fbs._("Build 名称", null, { hk: "2u1q3c" });
	}
	static guideAttrLabel(fbs: FbsRuntime) {
		return fbs._("属性行", null, { hk: "4D8fIM" });
	}
	static guideRateLabel(fbs: FbsRuntime) {
		return fbs._("占比行", null, { hk: "2zYxCM" });
	}
	static guideBisLabel(fbs: FbsRuntime) {
		return fbs._("BiS（JSON）", null, { hk: "1koeYA" });
	}
	static guideRotationLabel(fbs: FbsRuntime) {
		return fbs._("循环（JSON）", null, { hk: "3rnrXc" });
	}
	static tabStats(fbs: FbsRuntime) {
		return fbs._("统计", null, { hk: "1tT5ai" });
	}
	static tabSeason(fbs: FbsRuntime) {
		return fbs._("赛季", null, { hk: "4dtous" });
	}
	static seasonTitle(fbs: FbsRuntime) {
		return fbs._("赛季前检查清单", null, { hk: "1F2NNh" });
	}
	static seasonHint(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("按当前版本 {version} 与赛季 {season} 自动生成；换季后清单自动重置，逐项复核后勾选。", [fbs._param("version", pv(p, "version")), fbs._param("season", pv(p, "season"))], { hk: "1T8uMC" });
	}
	static seasonProgress(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已完成 {done} / {total}", [fbs._param("done", pv(p, "done")), fbs._param("total", pv(p, "total"))], { hk: "2stl1X" });
	}
	static seasonItemDungeonsTitle(fbs: FbsRuntime) {
		return fbs._("复核当前版本副本", null, { hk: "3nKedm" });
	}
	static seasonItemDungeonsDetail(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("当前版本（{version}）共有 {count} 个副本，确认达标要求与攻略已按本赛季更新。", [fbs._param("version", pv(p, "version")), fbs._param("count", pv(p, "count"))], { hk: "443QkV" });
	}
	static seasonItemTemplatesTitle(fbs: FbsRuntime) {
		return fbs._("复核组队模板", null, { hk: "2toNUi" });
	}
	static seasonItemTemplatesDetail(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("本百业现有 {count} 个组队模板，确认模板的副本与人数仍适用于本赛季。", [fbs._param("count", pv(p, "count"))], { hk: "1eb5h2" });
	}
	static seasonItemGuidesTitle(fbs: FbsRuntime) {
		return fbs._("复核流派攻略数据", null, { hk: "1h3Uyv" });
	}
	static seasonItemGuidesDetail(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("攻略数据现有 {builds} 份 BiS 与 {rotations} 份循环，确认已按本赛季数值更新。", [fbs._param("builds", pv(p, "builds")), fbs._param("rotations", pv(p, "rotations"))], { hk: "41VAHi" });
	}
	static seasonItemRosterTitle(fbs: FbsRuntime) {
		return fbs._("复核成员名册", null, { hk: "1MaJyn" });
	}
	static seasonItemRosterDetail(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("Discord 名册 {members} 人，截图名册 {entries} 条；确认成员装备季标与名册均为本赛季最新。", [fbs._param("members", pv(p, "members")), fbs._param("entries", pv(p, "entries"))], { hk: "18nbKu" });
	}
	static rosterTitle(fbs: FbsRuntime) {
		return fbs._("成员名册（截图导入）", null, { hk: "2EVVmK" });
	}
	static rosterHint(fbs: FbsRuntime) {
		return fbs._("上传游戏内成员名单截图，识别出的名字先进入预览，确认后才写入名册。名册只记录游戏内名字，不会改变任何人的 Discord 成员资格。", null, { hk: "xQu1d" });
	}
	static rosterUpload(fbs: FbsRuntime) {
		return fbs._("上传名单截图", null, { hk: "2Ezjr4" });
	}
	static rosterOcrRunning(fbs: FbsRuntime) {
		return fbs._("识别中…", null, { hk: "3oU98u" });
	}
	static rosterPreviewTitle(fbs: FbsRuntime) {
		return fbs._("导入预览", null, { hk: "3r4YsS" });
	}
	static rosterConfirm(fbs: FbsRuntime) {
		return fbs._("确认导入", null, { hk: "3SCWF5" });
	}
	static rosterEmpty(fbs: FbsRuntime) {
		return fbs._("尚无名册记录，用上方按钮上传名单截图导入。", null, { hk: "NE4D8" });
	}
	static rosterSourceOcr(fbs: FbsRuntime) {
		return fbs._("截图识别", null, { hk: "4vh69O" });
	}
	static rosterMatchedMember(fbs: FbsRuntime) {
		return fbs._("已匹配 Discord 成员", null, { hk: "uvLxl" });
	}
	static rosterStatusMatched(fbs: FbsRuntime) {
		return fbs._("已匹配", null, { hk: "41WuRA" });
	}
	static rosterStatusNew(fbs: FbsRuntime) {
		return fbs._("疑似新名", null, { hk: "nf5eD" });
	}
	static rosterStatusUnrecognized(fbs: FbsRuntime) {
		return fbs._("无法识别", null, { hk: "oCnUh" });
	}
	static rosterImported(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已导入 {count} 条名册记录", [fbs._param("count", pv(p, "count"))], { hk: "7ceJQ" });
	}
	static statsTitle(fbs: FbsRuntime) {
		return fbs._("出勤与活跃", null, { hk: "1d3keX" });
	}
	static statsCurrentWeek(fbs: FbsRuntime) {
		return fbs._("本周", null, { hk: "2ZZZOD" });
	}
	static statsCars(fbs: FbsRuntime) {
		return fbs._("开车", null, { hk: "1MTNce" });
	}
	static statsCompleted(fbs: FbsRuntime) {
		return fbs._("完成", null, { hk: "19gVWH" });
	}
	static statsSeats(fbs: FbsRuntime) {
		return fbs._("席位", null, { hk: "4gR2r6" });
	}
	static statsFillRate(fbs: FbsRuntime) {
		return fbs._("满员率", null, { hk: "3exrAe" });
	}
	static statsParticipants(fbs: FbsRuntime) {
		return fbs._("参与人数", null, { hk: "4wr5b2" });
	}
	static statsPerCapita(fbs: FbsRuntime) {
		return fbs._("人均参与", null, { hk: "254tDj" });
	}
	static statsMembersTitle(fbs: FbsRuntime) {
		return fbs._("成员参与榜 · 近 4 周", null, { hk: "1113tN" });
	}
	static statsLeadersTitle(fbs: FbsRuntime) {
		return fbs._("车头榜 · 近 4 周", null, { hk: "26hx5l" });
	}
	static statsSeatCount(fbs: FbsRuntime) {
		return fbs._("落座次数", null, { hk: "47hsXV" });
	}
	static statsCarCount(fbs: FbsRuntime) {
		return fbs._("开车数", null, { hk: "2XBgTP" });
	}
	static statsEmpty(fbs: FbsRuntime) {
		return fbs._("近 4 周暂无组队数据。", null, { hk: "2cKSLW" });
	}
	static tabInsights(fbs: FbsRuntime) {
		return fbs._("数据洞察", null, { hk: "1G3thU" });
	}
	static insightsReliabilityTitle(fbs: FbsRuntime) {
		return fbs._("可靠性档案", null, { hk: "KvDkk" });
	}
	static insightsReliabilityHint(fbs: FbsRuntime) {
		return fbs._("出席 = 已完成车辆上落座且已就位；鸽 = 已完成车辆上落座但始终未就位。未完成的车辆不计入出席率。", null, { hk: "2TN6kn" });
	}
	static insightsSignupsLabel(fbs: FbsRuntime) {
		return fbs._("报名", null, { hk: "1yHhz2" });
	}
	static insightsAttendedLabel(fbs: FbsRuntime) {
		return fbs._("出席", null, { hk: "3uOoGs" });
	}
	static insightsNoShowLabel(fbs: FbsRuntime) {
		return fbs._("鸽", null, { hk: "1CGZvj" });
	}
	static insightsRateLabel(fbs: FbsRuntime) {
		return fbs._("出席率", null, { hk: "uZshK" });
	}
	static insightsReliabilityEmpty(fbs: FbsRuntime) {
		return fbs._("暂无带身份戳的报名记录。", null, { hk: "oUbzD" });
	}
	static insightsHeatmapTitle(fbs: FbsRuntime) {
		return fbs._("成员参与热力图", null, { hk: "3hRcLJ" });
	}
	static insightsHeatmapHint(fbs: FbsRuntime) {
		return fbs._("按你所在时区统计已完成车辆的出席人次，格子越亮人越多。", null, { hk: "1XAJr7" });
	}
	static insightsHeatmapEmpty(fbs: FbsRuntime) {
		return fbs._("暂无出席记录。", null, { hk: "1ewFRf" });
	}
	static insightsHeatmapTotal(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("共 {count} 人次出席", [fbs._param("count", pv(p, "count"))], { hk: "3pnT6q" });
	}
	static insightsWeekdayMon(fbs: FbsRuntime) {
		return fbs._("周一", null, { hk: "2lhzwr" });
	}
	static insightsWeekdayTue(fbs: FbsRuntime) {
		return fbs._("周二", null, { hk: "2C7wRT" });
	}
	static insightsWeekdayWed(fbs: FbsRuntime) {
		return fbs._("周三", null, { hk: "bAiwD" });
	}
	static insightsWeekdayThu(fbs: FbsRuntime) {
		return fbs._("周四", null, { hk: "xUv0l" });
	}
	static insightsWeekdayFri(fbs: FbsRuntime) {
		return fbs._("周五", null, { hk: "1FCLuT" });
	}
	static insightsWeekdaySat(fbs: FbsRuntime) {
		return fbs._("周六", null, { hk: "3M8RNa" });
	}
	static insightsWeekdaySun(fbs: FbsRuntime) {
		return fbs._("周日", null, { hk: "1ttpfv" });
	}
	static insightsGearTitle(fbs: FbsRuntime) {
		return fbs._("装备达标盘", null, { hk: "jy71W" });
	}
	static insightsGearHint(fbs: FbsRuntime) {
		return fbs._("达标线按成员最佳构筑的毕业分判定；缺口名单列出未达标成员与差距。", null, { hk: "49Hveh" });
	}
	static insightsGearEmpty(fbs: FbsRuntime) {
		return fbs._("尚未设置达标线，先在下方添加一条。", null, { hk: "25DOn6" });
	}
	static insightsGearLabelLabel(fbs: FbsRuntime) {
		return fbs._("场景名称", null, { hk: "2nY7z9" });
	}
	static insightsGearMinScoreLabel(fbs: FbsRuntime) {
		return fbs._("达标线（毕业分）", null, { hk: "3634qI" });
	}
	static insightsGearAddLabel(fbs: FbsRuntime) {
		return fbs._("添加达标线", null, { hk: "2fQLk5" });
	}
	static insightsGearMetLabel(fbs: FbsRuntime) {
		return fbs._("达标", null, { hk: "1QV82A" });
	}
	static insightsGearUnmetLabel(fbs: FbsRuntime) {
		return fbs._("未达标", null, { hk: "1tbl9O" });
	}
	static insightsGearNoBuildLabel(fbs: FbsRuntime) {
		return fbs._("无构筑", null, { hk: "2xbGEN" });
	}
	static insightsGearScoreLabel(fbs: FbsRuntime) {
		return fbs._("毕业分", null, { hk: "2m5Qk6" });
	}
	static insightsGearGapLabel(fbs: FbsRuntime) {
		return fbs._("缺口", null, { hk: "33A8Ox" });
	}
	static insightsGearSummary(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("达标 {met} · 未达标 {unmet} · 无构筑 {nobuild}", [
			fbs._param("met", pv(p, "met")),
			fbs._param("unmet", pv(p, "unmet")),
			fbs._param("nobuild", pv(p, "nobuild"))
		], { hk: "1UNsvv" });
	}
	static insightsRaceTitle(fbs: FbsRuntime) {
		return fbs._("竞速赛季总榜", null, { hk: "2YsFMh" });
	}
	static insightsRaceEmpty(fbs: FbsRuntime) {
		return fbs._("暂无竞速成绩记录。", null, { hk: "CWk9I" });
	}
	static insightsRaceTeamLabel(fbs: FbsRuntime) {
		return fbs._("队伍", null, { hk: "4zCTdf" });
	}
	static insightsRaceRunsLabel(fbs: FbsRuntime) {
		return fbs._("场次", null, { hk: "2kKUFC" });
	}
	static insightsRaceWinsLabel(fbs: FbsRuntime) {
		return fbs._("夺冠", null, { hk: "4fBvZl" });
	}
	static insightsRaceBestLabel(fbs: FbsRuntime) {
		return fbs._("最佳成绩", null, { hk: "2zP15I" });
	}
	static insightsRaceUnclassified(fbs: FbsRuntime) {
		return fbs._("未分类赛季", null, { hk: "4kMuoq" });
	}
	static insightsSelfGearTitle(fbs: FbsRuntime) {
		return fbs._("我的达标状态", null, { hk: "1vMHi7" });
	}
	static statsBoardEmpty(fbs: FbsRuntime) {
		return fbs._("暂无记录。", null, { hk: "2JXqs8" });
	}
	static whiteLabelTitle(fbs: FbsRuntime) {
		return fbs._("品牌与分享卡", null, { hk: "2DcaHH" });
	}
	static hideBrandingLabel(fbs: FbsRuntime) {
		return fbs._("隐藏平台品牌", null, { hk: "3ABREp" });
	}
	static hideBrandingHint(fbs: FbsRuntime) {
		return fbs._("开启后，本百业的页面上不再显示平台名称与页脚声明，只呈现百业自己的信息。", null, { hk: "1hvrWO" });
	}
	static ogAccentLabel(fbs: FbsRuntime) {
		return fbs._("分享卡强调色", null, { hk: "2bhhCd" });
	}
	static ogTitleSuffixLabel(fbs: FbsRuntime) {
		return fbs._("分享卡标题后缀", null, { hk: "CGErb" });
	}
	static ogTitleSuffixHint(fbs: FbsRuntime) {
		return fbs._("会接在分享卡的标题后面，如「· 招募中」；最多 30 字，留空不显示。", null, { hk: "2EuKHV" });
	}
	static ogAccentGold(fbs: FbsRuntime) {
		return fbs._("鎏金", null, { hk: "2iiYlN" });
	}
	static ogAccentJade(fbs: FbsRuntime) {
		return fbs._("翡翠", null, { hk: "32KIrh" });
	}
	static ogAccentAzure(fbs: FbsRuntime) {
		return fbs._("藏青", null, { hk: "3pW4pX" });
	}
	static ogAccentCinnabar(fbs: FbsRuntime) {
		return fbs._("朱砂", null, { hk: "2ARHJJ" });
	}
	static ogAccentViolet(fbs: FbsRuntime) {
		return fbs._("紫檀", null, { hk: "16ipi2" });
	}
	static premiumLockedTitle(fbs: FbsRuntime) {
		return fbs._("开通百业 Premium", null, { hk: "3q1CRR" });
	}
	static premiumLockedBody(fbs: FbsRuntime) {
		return fbs._("高级发车提醒、出勤统计、品牌与分享卡定制均为 Premium 功能。开通后立即生效，可随时取消。", null, { hk: "1hdfCw" });
	}
	static premiumCheckoutButton(fbs: FbsRuntime) {
		return fbs._("立即开通", null, { hk: "22w8h" });
	}
	static premiumComingSoon(fbs: FbsRuntime) {
		return fbs._("即将开放", null, { hk: "k66GU" });
	}
	static premiumActiveTitle(fbs: FbsRuntime) {
		return fbs._("百业 Premium", null, { hk: "28MgWt" });
	}
	static premiumPlanName(fbs: FbsRuntime) {
		return fbs._("Premium", null, { hk: "3ouIur" });
	}
	static premiumSourceStripe(fbs: FbsRuntime) {
		return fbs._("通过 Stripe 订阅", null, { hk: "PRNG5" });
	}
	static premiumSourceManual(fbs: FbsRuntime) {
		return fbs._("由平台授予", null, { hk: "44nAt1" });
	}
	static premiumPeriodEnd(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("当前周期至 {date}", [fbs._param("date", pv(p, "date"))], { hk: "dmW4g" });
	}
	static premiumPriceMonth(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{amount} / 月", [fbs._param("amount", pv(p, "amount"))], { hk: "4xgQIo" });
	}
	static premiumTier1Name(fbs: FbsRuntime) {
		return fbs._("同道", null, { hk: "22zWat" });
	}
	static premiumTier2Name(fbs: FbsRuntime) {
		return fbs._("执事", null, { hk: "2dWrJs" });
	}
	static premiumTier3Name(fbs: FbsRuntime) {
		return fbs._("盟主", null, { hk: "1xam2d" });
	}
	static premiumTier1Subtitle(fbs: FbsRuntime) {
		return fbs._("数据", null, { hk: "3Mj3yJ" });
	}
	static premiumTier2Subtitle(fbs: FbsRuntime) {
		return fbs._("智能", null, { hk: "3dqtOo" });
	}
	static premiumTier3Subtitle(fbs: FbsRuntime) {
		return fbs._("旗舰", null, { hk: "4sQgFH" });
	}
	static premiumSourceTrial(fbs: FbsRuntime) {
		return fbs._("试用授予", null, { hk: "3qqZxm" });
	}
	static premiumPastDueNotice(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("订阅已欠费：宽限期 {days} 天内仍按原档位使用，请尽快完成续费。", [fbs._param("days", pv(p, "days"))], { hk: "wDUEp" });
	}
	static premiumPriceYear(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{amount} / 年", [fbs._param("amount", pv(p, "amount"))], { hk: "2Osvuz" });
	}
	static customDomainTitle(fbs: FbsRuntime) {
		return fbs._("自定义域名", null, { hk: "1UfnhR" });
	}
	static customDomainHint(fbs: FbsRuntime) {
		return fbs._("把百业自己的域名（如 www.example.com）绑定到这里，成员就能用这个域名打开百业页面。每个百业可绑定一个域名；绑定后需要按下方指引在域名服务商处添加两条 DNS 记录。根域名（裸域）能否直接使用取决于注册商是否支持 CNAME 展平，建议使用 www 等子域名。", null, { hk: "iH5Ny" });
	}
	static customDomainHostnameLabel(fbs: FbsRuntime) {
		return fbs._("域名", null, { hk: "3or9GY" });
	}
	static customDomainHostnamePlaceholder(fbs: FbsRuntime) {
		return fbs._("www.example.com", null, { hk: "2jOyPt" });
	}
	static customDomainBindButton(fbs: FbsRuntime) {
		return fbs._("绑定域名", null, { hk: "qTnKJ" });
	}
	static customDomainRebindButton(fbs: FbsRuntime) {
		return fbs._("更换域名", null, { hk: "56aDh" });
	}
	static customDomainVerifyButton(fbs: FbsRuntime) {
		return fbs._("验证并启用", null, { hk: "1eq0zI" });
	}
	static customDomainRemoveButton(fbs: FbsRuntime) {
		return fbs._("解绑域名", null, { hk: "2X1lsX" });
	}
	static customDomainStatusNone(fbs: FbsRuntime) {
		return fbs._("尚未绑定域名", null, { hk: "3mGbIM" });
	}
	static customDomainStatusPendingSeam(fbs: FbsRuntime) {
		return fbs._("已绑定，待平台接通", null, { hk: "2CU3rB" });
	}
	static customDomainStatusPendingDns(fbs: FbsRuntime) {
		return fbs._("已绑定，待验证 DNS", null, { hk: "4GcA5P" });
	}
	static customDomainStatusActive(fbs: FbsRuntime) {
		return fbs._("已生效", null, { hk: "1CTLLp" });
	}
	static customDomainStatusDisabled(fbs: FbsRuntime) {
		return fbs._("已被平台停用", null, { hk: "18o8bd" });
	}
	static customDomainBoundAt(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("绑定于 {date}", [fbs._param("date", pv(p, "date"))], { hk: "3cjEdL" });
	}
	static customDomainDnsTitle(fbs: FbsRuntime) {
		return fbs._("DNS 设置指引", null, { hk: "1VZKK2" });
	}
	static customDomainCnameLabel(fbs: FbsRuntime) {
		return fbs._("CNAME 记录（让域名指向平台）", null, { hk: "4dFKdv" });
	}
	static customDomainTxtLabel(fbs: FbsRuntime) {
		return fbs._("TXT 记录（证明域名归你所有）", null, { hk: "3cHn1N" });
	}
	static customDomainRecordNameLabel(fbs: FbsRuntime) {
		return fbs._("主机记录", null, { hk: "3jw4KT" });
	}
	static customDomainRecordValueLabel(fbs: FbsRuntime) {
		return fbs._("记录值", null, { hk: "2n1K7R" });
	}
	static customDomainSeamNote(fbs: FbsRuntime) {
		return fbs._("平台的域名服务尚在接通中：你可以先绑定域名并添加 DNS 记录，平台接通后点「验证并启用」即可生效；接通前该域名不会打开任何页面。", null, { hk: "1lHecd" });
	}
	static customDomainDnsNote(fbs: FbsRuntime) {
		return fbs._("两条记录都添加后，点「验证并启用」：平台会检查 DNS 是否正确，证书由平台自动签发。DNS 生效可能需要几分钟到几小时，未通过时可稍后再试。", null, { hk: "kV8ua" });
	}
	static customDomainActiveNote(fbs: FbsRuntime) {
		return fbs._("域名已生效：用这个域名打开的页面与主站一致。登录使用该域名自己的登录流程，平台会为该域名登记登录回调；更换或解绑域名后，该域名立即停止打开百业页面。", null, { hk: "BO2S6" });
	}
	static customDomainDisabledNote(fbs: FbsRuntime) {
		return fbs._("该域名已被平台停用，当前不会打开任何页面。如需恢复，请联系平台。", null, { hk: "fCK4w" });
	}
	static billingSuccess(fbs: FbsRuntime) {
		return fbs._("开通成功，Premium 已生效。", null, { hk: "2ux3TB" });
	}
	static billingCanceled(fbs: FbsRuntime) {
		return fbs._("已取消开通，未产生扣费。", null, { hk: "Auyqu" });
	}
	static tabAnnouncements(fbs: FbsRuntime) {
		return fbs._("公告广播", null, { hk: "1cEu26" });
	}
	static tabTools(fbs: FbsRuntime) {
		return fbs._("活动工具", null, { hk: "BRJC" });
	}
	static lotteryTitle(fbs: FbsRuntime) {
		return fbs._("活动抽奖", null, { hk: "phb3W" });
	}
	static lotteryHint(fbs: FbsRuntime) {
		return fbs._("参与名单可来自某辆车的参与者，或手选本百业成员；名单与权重在创建时定格。开奖按权重随机抽取，同一抽奖内不会重复中奖；抽奖、名单、权重与结果全部留痕可查。", null, { hk: "l6I0C" });
	}
	static lotteryEmpty(fbs: FbsRuntime) {
		return fbs._("还没有抽奖，先创建一个。", null, { hk: "1IA3EI" });
	}
	static lotteryNameLabel(fbs: FbsRuntime) {
		return fbs._("抽奖标题", null, { hk: "QNIoN" });
	}
	static lotteryPrizeLabel(fbs: FbsRuntime) {
		return fbs._("奖品 / 奖池", null, { hk: "3GyAIo" });
	}
	static lotterySourceLabel(fbs: FbsRuntime) {
		return fbs._("参与名单来源", null, { hk: "X1d6d" });
	}
	static lotterySourceGrouping(fbs: FbsRuntime) {
		return fbs._("某辆车的参与者", null, { hk: "2fXkEv" });
	}
	static lotterySourceMembers(fbs: FbsRuntime) {
		return fbs._("手选百业成员", null, { hk: "8bxHX" });
	}
	static lotteryGroupingLabel(fbs: FbsRuntime) {
		return fbs._("选择车队", null, { hk: "2iP9L6" });
	}
	static lotteryWinnerCountLabel(fbs: FbsRuntime) {
		return fbs._("中奖人数", null, { hk: "2feMXp" });
	}
	static lotteryUniformWeightLabel(fbs: FbsRuntime) {
		return fbs._("统一权重", null, { hk: "2vN0nT" });
	}
	static lotteryWeightLabel(fbs: FbsRuntime) {
		return fbs._("权重", null, { hk: "ssarZ" });
	}
	static lotteryEntriesLabel(fbs: FbsRuntime) {
		return fbs._("参与名单", null, { hk: "34bJ92" });
	}
	static lotteryWinnersLabel(fbs: FbsRuntime) {
		return fbs._("中奖名单", null, { hk: "2xoFrz" });
	}
	static lotteryCreateButton(fbs: FbsRuntime) {
		return fbs._("创建抽奖", null, { hk: "4n1dlX" });
	}
	static lotteryDrawButton(fbs: FbsRuntime) {
		return fbs._("开奖", null, { hk: "knVEh" });
	}
	static lotteryStatusOpen(fbs: FbsRuntime) {
		return fbs._("待开奖", null, { hk: "Vf68n" });
	}
	static lotteryStatusDrawn(fbs: FbsRuntime) {
		return fbs._("已开奖", null, { hk: "aOTQE" });
	}
	static lotteryEntryCount(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{count} 人参与", [fbs._param("count", pv(p, "count"))], { hk: "blqBq" });
	}
	static tabRecruit(fbs: FbsRuntime) {
		return fbs._("招新与导师", null, { hk: "FbDY5" });
	}
	static tabOfficer(fbs: FbsRuntime) {
		return fbs._("军官工具", null, { hk: "16xzS9" });
	}
	static tabGovernance(fbs: FbsRuntime) {
		return fbs._("治理", null, { hk: "39il6d" });
	}
}
export abstract class GroupingTemplateFbtUtils {
	static sectionTitle(fbs: FbsRuntime) {
		return fbs._("车队模板", null, { hk: "3quDgk" });
	}
	static nameLabel(fbs: FbsRuntime) {
		return fbs._("模板名", null, { hk: "4aGP2J" });
	}
	static namePlaceholder(fbs: FbsRuntime) {
		return fbs._("给模板起个名字", null, { hk: "37hTvU" });
	}
	static saveFromForm(fbs: FbsRuntime) {
		return fbs._("存为模板", null, { hk: "38Jz4" });
	}
	static updateSubmit(fbs: FbsRuntime) {
		return fbs._("保存模板修改", null, { hk: "2cGJmg" });
	}
	static editingNotice(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("正在编辑模板「{name}」", [fbs._param("name", pv(p, "name"))], { hk: "2hyKYs" });
	}
	static cancelEdit(fbs: FbsRuntime) {
		return fbs._("取消编辑", null, { hk: "2hAVvb" });
	}
	static empty(fbs: FbsRuntime) {
		return fbs._("还没有模板，把常用配置存下来，下次一键预填", null, { hk: "3mPnoT" });
	}
	static whenToday(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("今天 {time} 发车", [fbs._param("time", pv(p, "time"))], { hk: "4A7Tc8" });
	}
	static whenTomorrow(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("明天 {time} 发车", [fbs._param("time", pv(p, "time"))], { hk: "4yg4KR" });
	}
	static whenDays(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{days} 天后 {time} 发车", [fbs._param("days", pv(p, "days")), fbs._param("time", pv(p, "time"))], { hk: "1wXgKZ" });
	}
	static toastSaved(fbs: FbsRuntime) {
		return fbs._("模板已保存", null, { hk: "5LVTC" });
	}
	static toastSaveFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("模板保存失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "3mOupN" });
	}
	static toastDeleted(fbs: FbsRuntime) {
		return fbs._("模板已删除", null, { hk: "4xSDSZ" });
	}
	static toastDeleteFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("模板删除失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "24wSeo" });
	}
	static edit(fbs: FbsRuntime) {
		return fbs._("编辑", null, { hk: "qd89o" });
	}
	static delete(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "49DBvC" });
	}
	static deleteConfirmTitle(fbs: FbsRuntime) {
		return fbs._("删除模板", null, { hk: "34NwU7" });
	}
	static deleteConfirmMessage(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("确定删除模板「{name}」吗？", [fbs._param("name", pv(p, "name"))], { hk: "3xPfcu" });
	}
	static saveButton(fbs: FbsRuntime) {
		return fbs._("📋 存为模板", null, { hk: "3hxnR" });
	}
	static saveDialogTitle(fbs: FbsRuntime) {
		return fbs._("存为车队模板", null, { hk: "4ybLZ1" });
	}
	static saveSubmit(fbs: FbsRuntime) {
		return fbs._("保存模板", null, { hk: "49Qh9x" });
	}
	static toastSavedFromCar(fbs: FbsRuntime) {
		return fbs._("已存为模板，可在发新车时一键预填", null, { hk: "330giC" });
	}
	static metaTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{type}{dungeon} · {max} 人", [
			fbs._param("type", pv(p, "type")),
			fbs._param("dungeon", pv(p, "dungeon")),
			fbs._param("max", pv(p, "max"))
		], { hk: "2VDLQh" });
	}
}
export abstract class AccountFbtUtils {
	static sectionTitle(fbs: FbsRuntime) {
		return fbs._("我的数据", null, { hk: "2C3057" });
	}
	static exportLabel(fbs: FbsRuntime) {
		return fbs._("导出我的数据", null, { hk: "lAScY" });
	}
	static exportHint(fbs: FbsRuntime) {
		return fbs._("把你账号的全部数据下载为一个 JSON 文件：账号资料、百业名册、你创建的车队、你的报名座位、装备库与方案。登录凭据与推送令牌出于安全不会包含在内。", null, { hk: "2OaWJF" });
	}
	static deleteLabel(fbs: FbsRuntime) {
		return fbs._("删除账号", null, { hk: "2HXNPU" });
	}
	static deleteHint(fbs: FbsRuntime) {
		return fbs._("删除不可恢复。提交后有 7 天冷静期，期间可随时撤销；到期后你的个人数据会被删除或匿名化。", null, { hk: "1B0WeD" });
	}
	static reauthLabel(fbs: FbsRuntime) {
		return fbs._("通过 Discord 重新验证", null, { hk: "2ZYxvo" });
	}
	static reauthHint(fbs: FbsRuntime) {
		return fbs._("导出与删除属于敏感操作，继续前需要一次新鲜的 Discord 授权验证。", null, { hk: "3TfE8s" });
	}
	static confirmTitle(fbs: FbsRuntime) {
		return fbs._("确认删除账号", null, { hk: "ZcmS6" });
	}
	static confirmIntro(fbs: FbsRuntime) {
		return fbs._("请仔细阅读删除后果。提交后进入 7 天冷静期，到期自动执行：", null, { hk: "1bkJpS" });
	}
	static consequenceCars(fbs: FbsRuntime) {
		return fbs._("你创建的车队不会被删除：车头会解绑为无主车队，创建者显示名替换为「已注销用户」；你在他人车队里的座位会被原地匿名化。", null, { hk: "2AKbLM" });
	}
	static consequenceData(fbs: FbsRuntime) {
		return fbs._("你的装备库与方案、推送令牌、昵称快照、百业名册行会被彻底删除；执行后你在所有设备上的登录会立即失效。", null, { hk: "1P0XQs" });
	}
	static consequenceGuilds(fbs: FbsRuntime) {
		return fbs._("百业本身与百业管理密码不受影响：百业不属于任何个人账号，不会因你删除账号而解散或变更。", null, { hk: "2FIM4d" });
	}
	static consequenceResidual(fbs: FbsRuntime) {
		return fbs._("少数记录无法按个人清除：已经发到 Discord 的消息、成绩榜里的自由文本名单会保留；备份中的副本最迟在 14 天内随每日备份轮换清除。", null, { hk: "1OELp3" });
	}
	static consequenceReregister(fbs: FbsRuntime) {
		return fbs._("删除不是封禁：之后用同一个 Discord 账号重新登录，就会注册成一个全新的账号。", null, { hk: "2SWuxz" });
	}
	static exportFirstHint(fbs: FbsRuntime) {
		return fbs._("建议先导出一份你的数据，再提交删除。", null, { hk: "3RUghD" });
	}
	static usernameLabel(fbs: FbsRuntime) {
		return fbs._("输入你的 Discord 显示名以确认", null, { hk: "1XEE9O" });
	}
	static submitLabel(fbs: FbsRuntime) {
		return fbs._("提交删除申请", null, { hk: "wa5fb" });
	}
	static backLabel(fbs: FbsRuntime) {
		return fbs._("返回", null, { hk: "4tDwiS" });
	}
	static pendingTitle(fbs: FbsRuntime) {
		return fbs._("账号删除已排期", null, { hk: "2j4Iaj" });
	}
	static pendingBody(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("你的账号将于 {date} 执行删除。到期前你可以随时撤销；用新设备重新登录也会自动撤销（到期后除外）。", [fbs._param("date", pv(p, "date"))], { hk: "36HqHq" });
	}
	static cancelDeletionLabel(fbs: FbsRuntime) {
		return fbs._("撤销删除", null, { hk: "1tCo9v" });
	}
	static deletionRequestedText(fbs: FbsRuntime) {
		return fbs._("删除申请已提交，7 天冷静期开始。", null, { hk: "xKpOH" });
	}
	static deletionCancelledText(fbs: FbsRuntime) {
		return fbs._("删除申请已撤销，你的账号不会被删除。", null, { hk: "Jq5IE" });
	}
	static exportAbout(fbs: FbsRuntime) {
		return fbs._("这是你账号数据的导出副本。account 是账号资料（oauth 只记录授权范围与最近刷新时间，凭据本身不导出）；guilds 是你在各百业的名册行；serverNicks 是你在各 Discord 服务器的昵称快照；carsLed 是你创建的车队；seats 是你的报名座位；gearItems 是装备库；gearBuilds 是已保存方案；heirloom 是传家宝推送的去重状态。推送令牌属于设备凭据，只记录数量与平台，令牌本身不导出。", null, { hk: "1FjcJY" });
	}
	static deletedUser(fbs: FbsRuntime) {
		return fbs._("已注销用户", null, { hk: "4bmHSv" });
	}
}
export abstract class BuildshareFbtUtils {
	static kicker(fbs: FbsRuntime) {
		return fbs._("装备方案 · 公开分享", null, { hk: "1RvbTq" });
	}
	static loginLabel(fbs: FbsRuntime) {
		return fbs._("打开燕云百业", null, { hk: "2ax7GF" });
	}
	static notFoundTitle(fbs: FbsRuntime) {
		return fbs._("链接已失效", null, { hk: "1AdOse" });
	}
	static notFoundBody(fbs: FbsRuntime) {
		return fbs._("这条分享链接不存在，或已被方案主人取消分享。", null, { hk: "1FcBRq" });
	}
	static xinfaLabel(fbs: FbsRuntime) {
		return fbs._("心法", null, { hk: "4dKZV3" });
	}
}
export abstract class LandingFbtUtils {
	static featuresTitle(fbs: FbsRuntime) {
		return fbs._("为百业同道而备", null, { hk: "4pC0fZ" });
	}
	static groupingTitle(fbs: FbsRuntime) {
		return fbs._("组队报名", null, { hk: "2efXDW" });
	}
	static groupingBody(fbs: FbsRuntime) {
		return fbs._("双十、天赋、竞速、爬塔四类车队一键成行，席位名册一目了然，短链分享直达车队页。", null, { hk: "2E8ItN" });
	}
	static reminderTitle(fbs: FbsRuntime) {
		return fbs._("发车提醒", null, { hk: "3WslHD" });
	}
	static reminderBody(fbs: FbsRuntime) {
		return fbs._("发车前自动提醒到 Discord 频道与手机 App，就位确认先行，只催还没到场的人。", null, { hk: "aYVcL" });
	}
	static dexTitle(fbs: FbsRuntime) {
		return fbs._("图鉴与攻略", null, { hk: "46IR4H" });
	}
	static dexBody(fbs: FbsRuntime) {
		return fbs._("副本、首领图鉴与机制攻略，十一流派毕业词缀与配装参考，随国际服版本更新。", null, { hk: "3WbOIh" });
	}
	static gearTitle(fbs: FbsRuntime) {
		return fbs._("装备规划", null, { hk: "4aGlmc" });
	}
	static gearBody(fbs: FbsRuntime) {
		return fbs._("个人装备库与搭配筹谋：粘贴、截图识别或手动录入，承音调律与毕业度测算，离毕业还差多少一眼看清。", null, { hk: "4sb8Rl" });
	}
}
export abstract class FeedbackFbtUtils {
	static entryLabel(fbs: FbsRuntime) {
		return fbs._("意见反馈", null, { hk: "3Ly20a" });
	}
	static title(fbs: FbsRuntime) {
		return fbs._("意见反馈", null, { hk: "23s3l" });
	}
	static categoryLabel(fbs: FbsRuntime) {
		return fbs._("类别", null, { hk: "1anB7A" });
	}
	static catProblem(fbs: FbsRuntime) {
		return fbs._("问题", null, { hk: "4acxkA" });
	}
	static catSuggestion(fbs: FbsRuntime) {
		return fbs._("建议", null, { hk: "3fHFGc" });
	}
	static catOther(fbs: FbsRuntime) {
		return fbs._("其他", null, { hk: "3BCeiF" });
	}
	static placeholder(fbs: FbsRuntime) {
		return fbs._("请描述遇到的问题，或写下你的建议…", null, { hk: "W5kNb" });
	}
	static submit(fbs: FbsRuntime) {
		return fbs._("提交反馈", null, { hk: "498RUK" });
	}
	static submitting(fbs: FbsRuntime) {
		return fbs._("提交中…", null, { hk: "PZiKp" });
	}
	static success(fbs: FbsRuntime) {
		return fbs._("已收到，感谢你的反馈。", null, { hk: "45W2e8" });
	}
}
export abstract class AnnouncementsFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("百业公告", null, { hk: "33c879" });
	}
	static emptyText(fbs: FbsRuntime) {
		return fbs._("暂无公告", null, { hk: "1Atxtc" });
	}
	static urgentLabel(fbs: FbsRuntime) {
		return fbs._("紧急集合", null, { hk: "3s3ns6" });
	}
	static standardLabel(fbs: FbsRuntime) {
		return fbs._("公告", null, { hk: "Eo2As" });
	}
	static unreadLabel(fbs: FbsRuntime) {
		return fbs._("未读", null, { hk: "1XQ8rO" });
	}
	static readLabel(fbs: FbsRuntime) {
		return fbs._("已读", null, { hk: "46MbrS" });
	}
	static composeTitle(fbs: FbsRuntime) {
		return fbs._("发布公告", null, { hk: "3NEVMc" });
	}
	static kindLabel(fbs: FbsRuntime) {
		return fbs._("类型", null, { hk: "35GUJL" });
	}
	static kindStandardLabel(fbs: FbsRuntime) {
		return fbs._("普通公告", null, { hk: "4j2o9T" });
	}
	static kindUrgentLabel(fbs: FbsRuntime) {
		return fbs._("紧急集合呼叫", null, { hk: "24MNbU" });
	}
	static titleLabel(fbs: FbsRuntime) {
		return fbs._("标题", null, { hk: "OPlrd" });
	}
	static titlePlaceholder(fbs: FbsRuntime) {
		return fbs._("公告标题", null, { hk: "2pxwvH" });
	}
	static bodyLabel(fbs: FbsRuntime) {
		return fbs._("正文", null, { hk: "KxBat" });
	}
	static bodyPlaceholder(fbs: FbsRuntime) {
		return fbs._("公告正文", null, { hk: "1LfFJr" });
	}
	static postLabel(fbs: FbsRuntime) {
		return fbs._("发布并推送", null, { hk: "4Dhpf9" });
	}
	static postingLabel(fbs: FbsRuntime) {
		return fbs._("发布中…", null, { hk: "1R3tPu" });
	}
	static postedText(fbs: FbsRuntime) {
		return fbs._("公告已发布", null, { hk: "2C0QYr" });
	}
	static deleteLabel(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "30tkbE" });
	}
	static deleteConfirmTitle(fbs: FbsRuntime) {
		return fbs._("删除这条公告？", null, { hk: "19UFOH" });
	}
	static deleteConfirmMessage(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("确定要删除公告「{title}」吗？已读记录会一并删除。", [fbs._param("title", pv(p, "title"))], { hk: "PRY4B" });
	}
	static deletedText(fbs: FbsRuntime) {
		return fbs._("公告已删除", null, { hk: "18kD5o" });
	}
	static receiptsTitle(fbs: FbsRuntime) {
		return fbs._("阅读情况", null, { hk: "1LwIZ1" });
	}
	static readCountTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已读 {read} / {total}", [fbs._param("read", pv(p, "read")), fbs._param("total", pv(p, "total"))], { hk: "OPt2y" });
	}
	static readListLabel(fbs: FbsRuntime) {
		return fbs._("已读成员", null, { hk: "2BJqen" });
	}
	static unreadListLabel(fbs: FbsRuntime) {
		return fbs._("未读成员", null, { hk: "2aMZIi" });
	}
	static authorTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{name} 发布", [fbs._param("name", pv(p, "name"))], { hk: "3ipTDA" });
	}
	static pushNote(fbs: FbsRuntime) {
		return fbs._("发布后会向全体成员推送通知；没有开启推送的成员也能在这里看到。", null, { hk: "JBSZr" });
	}
	static urgentNote(fbs: FbsRuntime) {
		return fbs._("紧急集合呼叫请只用于临时集合等紧急情况，每天最多 2 次。", null, { hk: "4ku8la" });
	}
	static dailyLimitTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("今日还可发布 {remaining} 条", [fbs._param("remaining", pv(p, "remaining"))], { hk: "4bcg3p" });
	}
	static translatedSourceLabel(fbs: FbsRuntime) {
		return fbs._("译文", null, { hk: "13D96T" });
	}
	static originalSourceLabel(fbs: FbsRuntime) {
		return fbs._("原文", null, { hk: "1l4VJb" });
	}
	static generateTranslationsLabel(fbs: FbsRuntime) {
		return fbs._("生成多语版", null, { hk: "THc3" });
	}
	static generatingTranslationsLabel(fbs: FbsRuntime) {
		return fbs._("生成中…", null, { hk: "3Kga1a" });
	}
	static translationsGeneratedText(fbs: FbsRuntime) {
		return fbs._("多语版已生成", null, { hk: "49CmnK" });
	}
	static translationsPartialText(fbs: FbsRuntime) {
		return fbs._("多语版部分生成失败，可重试", null, { hk: "3wTbHs" });
	}
	static translationUnavailableText(fbs: FbsRuntime) {
		return fbs._("多语翻译尚未配置，配置完成后可生成多语版公告。", null, { hk: "4xJzYh" });
	}
	static translationStatusNone(fbs: FbsRuntime) {
		return fbs._("多语版：未生成", null, { hk: "2jMP5F" });
	}
	static translationStatusDoneTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("多语版：已生成 {done} / {total}", [fbs._param("done", pv(p, "done")), fbs._param("total", pv(p, "total"))], { hk: "2lGkDS" });
	}
	static translationStatusFailed(fbs: FbsRuntime) {
		return fbs._("多语版：生成失败", null, { hk: "nWrjs" });
	}
	static translationLocaleDoneLabel(fbs: FbsRuntime) {
		return fbs._("已生成", null, { hk: "29eGCe" });
	}
	static translationLocaleFailedLabel(fbs: FbsRuntime) {
		return fbs._("生成失败", null, { hk: "4cwlBJ" });
	}
	static translationLocalePendingLabel(fbs: FbsRuntime) {
		return fbs._("未生成", null, { hk: "2y8c5X" });
	}
}
export abstract class ScheduleFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("排期", null, { hk: "4e5ZUH" });
	}
	static myTitle(fbs: FbsRuntime) {
		return fbs._("我的可用时间", null, { hk: "Uql95" });
	}
	static myHint(fbs: FbsRuntime) {
		return fbs._("填写你每周固定有空的时段，按你所在时区显示；管理员与车头据此定档期。", null, { hk: "43MWjk" });
	}
	static slotRange(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{start}–{end}", [fbs._param("start", pv(p, "start")), fbs._param("end", pv(p, "end"))], { hk: "3jIir5" });
	}
	static addSlotLabel(fbs: FbsRuntime) {
		return fbs._("添加时段", null, { hk: "INGQV" });
	}
	static removeLabel(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "11g5IU" });
	}
	static saveLabel(fbs: FbsRuntime) {
		return fbs._("保存", null, { hk: "3Uypjc" });
	}
	static savedText(fbs: FbsRuntime) {
		return fbs._("可用时间已保存", null, { hk: "1Z2uaz" });
	}
	static saveFailedTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("保存失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "UYGoy" });
	}
	static emptyMineText(fbs: FbsRuntime) {
		return fbs._("你还没有填写可用时间。", null, { hk: "SEZmJ" });
	}
	static summaryTitle(fbs: FbsRuntime) {
		return fbs._("成员可用性汇总", null, { hk: "2gTYcM" });
	}
	static summaryHint(fbs: FbsRuntime) {
		return fbs._("汇总仅百业管理员与发过车的车头可见，用于定档期。", null, { hk: "xBW3h" });
	}
	static summaryEmptyText(fbs: FbsRuntime) {
		return fbs._("还没有成员填写可用时间。", null, { hk: "2fhz15" });
	}
	static pollsTitle(fbs: FbsRuntime) {
		return fbs._("活动时间投票", null, { hk: "2rojqF" });
	}
	static pollsHint(fbs: FbsRuntime) {
		return fbs._("给出几个候选时间，成员勾选所有能参加的时间；可参加人数最多的时段最适合定档。", null, { hk: "1Ve2jN" });
	}
	static pollEmptyText(fbs: FbsRuntime) {
		return fbs._("还没有时间投票。", null, { hk: "4k1ML2" });
	}
	static pollCreateLabel(fbs: FbsRuntime) {
		return fbs._("发起投票", null, { hk: "2FnrX" });
	}
	static pollTitleLabel(fbs: FbsRuntime) {
		return fbs._("投票标题", null, { hk: "3KE6yQ" });
	}
	static pollTitlePlaceholder(fbs: FbsRuntime) {
		return fbs._("如：本周开荒时间", null, { hk: "2ghRpZ" });
	}
	static pollCandidatesLabel(fbs: FbsRuntime) {
		return fbs._("候选时间", null, { hk: "23sOCb" });
	}
	static pollAddCandidateLabel(fbs: FbsRuntime) {
		return fbs._("添加候选", null, { hk: "4kjiG2" });
	}
	static pollSubmitLabel(fbs: FbsRuntime) {
		return fbs._("发布投票", null, { hk: "1GgpjB" });
	}
	static pollVoteLabel(fbs: FbsRuntime) {
		return fbs._("提交投票", null, { hk: "6K6lE" });
	}
	static pollVotedText(fbs: FbsRuntime) {
		return fbs._("已投票，可修改后重新提交。", null, { hk: "3iBL6B" });
	}
	static pollStatusOpenText(fbs: FbsRuntime) {
		return fbs._("进行中", null, { hk: "9To" });
	}
	static pollStatusClosedText(fbs: FbsRuntime) {
		return fbs._("已关闭", null, { hk: "2mdTgu" });
	}
	static pollCloseLabel(fbs: FbsRuntime) {
		return fbs._("关闭投票", null, { hk: "1kSf7U" });
	}
	static pollVoteCountTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{count} 人可参加", [fbs._param("count", pv(p, "count"))], { hk: "2AmVFV" });
	}
	static pollLaunchLabel(fbs: FbsRuntime) {
		return fbs._("以此时间发车", null, { hk: "2DYm8y" });
	}
	static pollCancelLabel(fbs: FbsRuntime) {
		return fbs._("取消", null, { hk: "13HkO0" });
	}
	static toastPollCreated(fbs: FbsRuntime) {
		return fbs._("投票已发布", null, { hk: "4iUhhT" });
	}
	static toastVoted(fbs: FbsRuntime) {
		return fbs._("已提交", null, { hk: "UUacF" });
	}
	static toastClosed(fbs: FbsRuntime) {
		return fbs._("投票已关闭", null, { hk: "379JZw" });
	}
	static toastFailedTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("操作失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "Tiamx" });
	}
	static settingsLinkLabel(fbs: FbsRuntime) {
		return fbs._("在个人设置中填写", null, { hk: "16JlsI" });
	}
	static noGuildsText(fbs: FbsRuntime) {
		return fbs._("你还没有加入任何百业，加入后可在此填写可用时间。", null, { hk: "3ppXP0" });
	}
}
export abstract class RecruitFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("招新与新人", null, { hk: "122QLo" });
	}
	static directoryTitle(fbs: FbsRuntime) {
		return fbs._("招新", null, { hk: "3clW8y" });
	}
	static newcomerTitle(fbs: FbsRuntime) {
		return fbs._("新人", null, { hk: "3wwr2i" });
	}
	static homeBody(fbs: FbsRuntime) {
		return fbs._("想加入一个百业？在下面挑一个开放招新的百业提交入业申请，百业管理员会在管理面审核。已经在业的新人可以在这里看自己的入业清单与导师配对。", null, { hk: "zIXqK" });
	}
	static homeLoginHint(fbs: FbsRuntime) {
		return fbs._("登录后即可对心仪的百业提交入业申请，并在这里查看审核进度。", null, { hk: "SLTpU" });
	}
	static applySectionTitle(fbs: FbsRuntime) {
		return fbs._("入业申请", null, { hk: "2huxzt" });
	}
	static messageLabel(fbs: FbsRuntime) {
		return fbs._("申请附言", null, { hk: "49ECV4" });
	}
	static messagePlaceholder(fbs: FbsRuntime) {
		return fbs._("一句自我介绍（可选）：常玩的流派、在线时间……", null, { hk: "4f3LwU" });
	}
	static submitButton(fbs: FbsRuntime) {
		return fbs._("提交申请", null, { hk: "4GeQ8X" });
	}
	static submittingButton(fbs: FbsRuntime) {
		return fbs._("提交中…", null, { hk: "2WeyIP" });
	}
	static myApplicationTitle(fbs: FbsRuntime) {
		return fbs._("我的申请", null, { hk: "3YrKJ2" });
	}
	static statusPending(fbs: FbsRuntime) {
		return fbs._("待审核", null, { hk: "1CrKA3" });
	}
	static statusApproved(fbs: FbsRuntime) {
		return fbs._("已通过", null, { hk: "4zuqMf" });
	}
	static statusRejected(fbs: FbsRuntime) {
		return fbs._("未通过", null, { hk: "2JzXqE" });
	}
	static pendingHint(fbs: FbsRuntime) {
		return fbs._("管理员审核中，请耐心等待；审核结果会直接更新在这里。", null, { hk: "3WYf8F" });
	}
	static approvedNextStep(fbs: FbsRuntime) {
		return fbs._("申请已通过，你已登记进百业名册。最后一步在 Discord 完成：加入本百业绑定的 Discord 服务器——成员资格由 Discord 服务器成员身份决定，平台没有 Discord 机器人权限，无法替你加入服务器或授予身份组；加入后用同一账号登录即可使用百业全部功能。", null, { hk: "12zvjS" });
	}
	static rejectedHint(fbs: FbsRuntime) {
		return fbs._("本次申请未通过。可以修改附言后重新提交一份新申请。", null, { hk: "3CLWCY" });
	}
	static checklistTitle(fbs: FbsRuntime) {
		return fbs._("新手入业清单", null, { hk: "1yTce5" });
	}
	static checklistProgress(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已完成 {done} / {total}", [fbs._param("done", pv(p, "done")), fbs._param("total", pv(p, "total"))], { hk: "2l84MK" });
	}
	static itemProfileLabel(fbs: FbsRuntime) {
		return fbs._("完善流派 / 时区", null, { hk: "1D4zIt" });
	}
	static itemProfileHint(fbs: FbsRuntime) {
		return fbs._("在任意车队报名落座时填上你的流派即算完成；时区由你的客户端自动同步，无需手动填写。", null, { hk: "wSimz" });
	}
	static itemMentorLabel(fbs: FbsRuntime) {
		return fbs._("认一位导师", null, { hk: "GduGt" });
	}
	static itemMentorHint(fbs: FbsRuntime) {
		return fbs._("由百业管理员为你配对一位导师后自动完成。", null, { hk: "2B2icA" });
	}
	static itemFirstRunLabel(fbs: FbsRuntime) {
		return fbs._("打完第一场", null, { hk: "3bor3X" });
	}
	static itemFirstRunHint(fbs: FbsRuntime) {
		return fbs._("在一辆已完成的车队里落座后自动完成。", null, { hk: "2s9wAL" });
	}
	static myPairingsTitle(fbs: FbsRuntime) {
		return fbs._("我的导师配对", null, { hk: "1tvO2V" });
	}
	static itemAvailabilityLabel(fbs: FbsRuntime) {
		return fbs._("填写可用时间", null, { hk: "371i2H" });
	}
	static itemAvailabilityHint(fbs: FbsRuntime) {
		return fbs._("在个人设置里填写你每周固定有空的时段，方便管理员与车头定档期；可以先跳过，之后随时补填。", null, { hk: "4lcT4a" });
	}
	static pairingStatusActive(fbs: FbsRuntime) {
		return fbs._("进行中", null, { hk: "dJxf3" });
	}
	static pairingStatusEnded(fbs: FbsRuntime) {
		return fbs._("已结束", null, { hk: "4aVXB6" });
	}
	static mentorRoleLabel(fbs: FbsRuntime) {
		return fbs._("导师", null, { hk: "2ctG8a" });
	}
	static menteeRoleLabel(fbs: FbsRuntime) {
		return fbs._("新人", null, { hk: "30dd1K" });
	}
	static adminApplicationsTitle(fbs: FbsRuntime) {
		return fbs._("入业申请审核", null, { hk: "2qiATZ" });
	}
	static adminApplicationsEmpty(fbs: FbsRuntime) {
		return fbs._("暂无申请记录。", null, { hk: "405FRY" });
	}
	static adminApproveButton(fbs: FbsRuntime) {
		return fbs._("通过", null, { hk: "2fL0qz" });
	}
	static adminRejectButton(fbs: FbsRuntime) {
		return fbs._("拒绝", null, { hk: "2zL672" });
	}
	static adminMentorPoolTitle(fbs: FbsRuntime) {
		return fbs._("导师人选", null, { hk: "4G0vQI" });
	}
	static adminSetMentorButton(fbs: FbsRuntime) {
		return fbs._("设为导师", null, { hk: "Ykxp" });
	}
	static adminUnsetMentorButton(fbs: FbsRuntime) {
		return fbs._("取消导师", null, { hk: "3NfN3y" });
	}
	static adminPairingsTitle(fbs: FbsRuntime) {
		return fbs._("导师配对", null, { hk: "3xAoGY" });
	}
	static adminPairingsEmpty(fbs: FbsRuntime) {
		return fbs._("暂无配对记录。", null, { hk: "u3TAD" });
	}
	static adminPairingCreateButton(fbs: FbsRuntime) {
		return fbs._("建立配对", null, { hk: "2B65s9" });
	}
	static adminPairingEndButton(fbs: FbsRuntime) {
		return fbs._("结束配对", null, { hk: "1cMTWk" });
	}
	static adminMentorSelectLabel(fbs: FbsRuntime) {
		return fbs._("选择导师", null, { hk: "FGC8h" });
	}
	static adminMenteeSelectLabel(fbs: FbsRuntime) {
		return fbs._("选择新人", null, { hk: "s08A4" });
	}
	static adminNewcomersTitle(fbs: FbsRuntime) {
		return fbs._("新人清单进度", null, { hk: "2Ze5tb" });
	}
	static adminNewcomersEmpty(fbs: FbsRuntime) {
		return fbs._("暂无未完成清单的新人。", null, { hk: "p8Uup" });
	}
	static adminRecruitOpenLabel(fbs: FbsRuntime) {
		return fbs._("开放招新", null, { hk: "4hN6BI" });
	}
	static adminRecruitOpenHint(fbs: FbsRuntime) {
		return fbs._("开启后，本百业会出现在平台主页的招新目录里，登录用户可以提交入业申请；关闭后目录不再展示本百业，也不能提交新申请（已提交的申请仍可审核，成员的入业清单与导师配对不受影响）。", null, { hk: "35OepQ" });
	}
}
export abstract class OfficerFbtUtils {
	static notesTitle(fbs: FbsRuntime) {
		return fbs._("成员备注", null, { hk: "2YE3NF" });
	}
	static notesHint(fbs: FbsRuntime) {
		return fbs._("备注仅百业管理员可见，成员本人看不到关于自己的备注。", null, { hk: "1DUC1I" });
	}
	static notesEmpty(fbs: FbsRuntime) {
		return fbs._("本百业暂无成员名册。", null, { hk: "4GEtBW" });
	}
	static memberNoNotes(fbs: FbsRuntime) {
		return fbs._("暂无备注", null, { hk: "44PZBD" });
	}
	static notePlaceholder(fbs: FbsRuntime) {
		return fbs._("写一条备注…", null, { hk: "3zy827" });
	}
	static noteAddButton(fbs: FbsRuntime) {
		return fbs._("添加备注", null, { hk: "29saa4" });
	}
	static noteEditButton(fbs: FbsRuntime) {
		return fbs._("编辑", null, { hk: "3bHO0D" });
	}
	static noteSaveButton(fbs: FbsRuntime) {
		return fbs._("保存", null, { hk: "pA2kH" });
	}
	static noteDeleteButton(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "1pjk87" });
	}
	static noteAuthorTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{name} 添加", [fbs._param("name", pv(p, "name"))], { hk: "18reDe" });
	}
	static exportTitle(fbs: FbsRuntime) {
		return fbs._("百业数据包", null, { hk: "36s9HF" });
	}
	static exportHint(fbs: FbsRuntime) {
		return fbs._("导出本百业的名册、组队历史与参与记录、成员赛季目标（JSON 文件）。导出动作会留痕记录。", null, { hk: "3jb43g" });
	}
	static exportButton(fbs: FbsRuntime) {
		return fbs._("导出数据包", null, { hk: "4kZDIz" });
	}
	static exportAbout(fbs: FbsRuntime) {
		return fbs._("百业数据包导出：包含本百业名册、组队历史与参与记录、成员赛季目标。军官备注为内部工作记录，不包含在本数据包内。", null, { hk: "1ghuF0" });
	}
	static exportDefaultCreatorName(fbs: FbsRuntime) {
		return fbs._("热心侠客", null, { hk: "4oZ40A" });
	}
	static goalsTitle(fbs: FbsRuntime) {
		return fbs._("成员赛季目标", null, { hk: "VPNsC" });
	}
	static goalsHint(fbs: FbsRuntime) {
		return fbs._("成员给自己设的赛季目标与进度，只读总览。", null, { hk: "11SEaw" });
	}
	static goalsEmpty(fbs: FbsRuntime) {
		return fbs._("暂无成员设置赛季目标。", null, { hk: "259tzE" });
	}
	static statusActive(fbs: FbsRuntime) {
		return fbs._("进行中", null, { hk: "jHCfK" });
	}
	static statusDone(fbs: FbsRuntime) {
		return fbs._("已完成", null, { hk: "4bZZR" });
	}
	static statusDropped(fbs: FbsRuntime) {
		return fbs._("已放弃", null, { hk: "2ZmTKT" });
	}
	static myEntryLabel(fbs: FbsRuntime) {
		return fbs._("赛季目标", null, { hk: "1LayvS" });
	}
	static myTitle(fbs: FbsRuntime) {
		return fbs._("我的赛季目标", null, { hk: "41DJfy" });
	}
	static myHint(fbs: FbsRuntime) {
		return fbs._("在某个百业里给自己定一个本赛季目标，进度由你自己维护；该百业的管理员可以查看总览。", null, { hk: "3DM8f7" });
	}
	static myEmpty(fbs: FbsRuntime) {
		return fbs._("你还没有设置赛季目标。", null, { hk: "1VBMA6" });
	}
	static goalGuildLabel(fbs: FbsRuntime) {
		return fbs._("所属百业", null, { hk: "4namkx" });
	}
	static goalTitleLabel(fbs: FbsRuntime) {
		return fbs._("目标", null, { hk: "324BnE" });
	}
	static goalTitlePlaceholder(fbs: FbsRuntime) {
		return fbs._("例如：打通某个副本、集齐一套装备…", null, { hk: "1xywUV" });
	}
	static goalNoteLabel(fbs: FbsRuntime) {
		return fbs._("进度备注", null, { hk: "1KDQIC" });
	}
	static goalNotePlaceholder(fbs: FbsRuntime) {
		return fbs._("记录当前进度…", null, { hk: "ZaF3j" });
	}
	static goalDungeonLabel(fbs: FbsRuntime) {
		return fbs._("关联副本（可选）", null, { hk: "3eEZ7w" });
	}
	static goalDungeonNone(fbs: FbsRuntime) {
		return fbs._("不关联副本", null, { hk: "1cLix" });
	}
	static goalStatusLabel(fbs: FbsRuntime) {
		return fbs._("状态", null, { hk: "3NgrgJ" });
	}
	static goalAddButton(fbs: FbsRuntime) {
		return fbs._("添加目标", null, { hk: "4kohdK" });
	}
	static goalSaveButton(fbs: FbsRuntime) {
		return fbs._("保存", null, { hk: "kd8Ty" });
	}
	static goalEditButton(fbs: FbsRuntime) {
		return fbs._("编辑", null, { hk: "47bsyA" });
	}
	static goalDeleteButton(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "1MpXfY" });
	}
}
export abstract class OpsFbtUtils {
	static tabOps(fbs: FbsRuntime) {
		return fbs._("运营引擎", null, { hk: "10XHBU" });
	}
	static title(fbs: FbsRuntime) {
		return fbs._("运营引擎", null, { hk: "2ucJkY" });
	}
	static hint(fbs: FbsRuntime) {
		return fbs._("定向催报、流失预警、赛季滚动与贡献积分都在这里——都是给军官省时间的引擎，判定与数字全部由平台算好下发。", null, { hk: "2mXVUt" });
	}
	static nudgeTitle(fbs: FbsRuntime) {
		return fbs._("定向催报", null, { hk: "1MeEZD" });
	}
	static nudgeHint(fbs: FbsRuntime) {
		return fbs._("只催还没报名的人：按分段圈定目标，先预览人数与名单，确认后才发送（走百业 Discord 频道与 App 推送）。每天最多 3 次，同一辆车 24 小时内只催一次。", null, { hk: "1saUun" });
	}
	static nudgeEventLabel(fbs: FbsRuntime) {
		return fbs._("目标车队", null, { hk: "2cS4vG" });
	}
	static nudgeSegmentLabel(fbs: FbsRuntime) {
		return fbs._("圈人分段", null, { hk: "l0Q0F" });
	}
	static segmentAll(fbs: FbsRuntime) {
		return fbs._("全部未报名成员", null, { hk: "1hrGmL" });
	}
	static segmentSchool(fbs: FbsRuntime) {
		return fbs._("按流派（填流派名）", null, { hk: "22SaMF" });
	}
	static segmentRole(fbs: FbsRuntime) {
		return fbs._("按职责（填职责名）", null, { hk: "3wkZMe" });
	}
	static segmentLapsed(fbs: FbsRuntime) {
		return fbs._("久未出勤（14 天以上）", null, { hk: "4sXGpu" });
	}
	static nudgeSegmentValueLabel(fbs: FbsRuntime) {
		return fbs._("分段值", null, { hk: "43meMH" });
	}
	static nudgePreviewButton(fbs: FbsRuntime) {
		return fbs._("预览圈人", null, { hk: "43wq1C" });
	}
	static nudgeSendButton(fbs: FbsRuntime) {
		return fbs._("确认发送催报", null, { hk: "IF6Pe" });
	}
	static nudgeCandidateCount(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("将催报 {count} 人", [fbs._param("count", pv(p, "count"))], { hk: "1v5JM2" });
	}
	static nudgeEmpty(fbs: FbsRuntime) {
		return fbs._("没有符合条件的未报名成员。", null, { hk: "25Tlvd" });
	}
	static nudgeDailyRemaining(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("今日还可发送 {remaining} 次", [fbs._param("remaining", pv(p, "remaining"))], { hk: "8fx47" });
	}
	static nudgeMessage(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("「{title}」还差人，快来报名啦！", [fbs._param("title", pv(p, "title"))], { hk: "2e4Up1" });
	}
	static lastNever(fbs: FbsRuntime) {
		return fbs._("从未出勤", null, { hk: "3U6S02" });
	}
	static lastAt(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("上次出勤 {date}", [fbs._param("date", pv(p, "date"))], { hk: "2IGt0W" });
	}
	static churnTitle(fbs: FbsRuntime) {
		return fbs._("流失预警", null, { hk: "4lqPi6" });
	}
	static churnHint(fbs: FbsRuntime) {
		return fbs._("参与下滑的成员会出现在这里（基线 = 此前 4 周，近期 = 最近 4 周；近期参与降到基线一半以下，或连续缺席最近 3 场已完成车队，即入名单）。名单只给军官看，不会自动联系任何人。", null, { hk: "o6Kwj" });
	}
	static churnEmpty(fbs: FbsRuntime) {
		return fbs._("暂无流失风险成员。", null, { hk: "4CYTXO" });
	}
	static churnEvidence(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("基线 {baseline} 次 · 近期 {recent} 次 · 连缺 {streak} 场", [
			fbs._param("baseline", pv(p, "baseline")),
			fbs._param("recent", pv(p, "recent")),
			fbs._param("streak", pv(p, "streak"))
		], { hk: "2qlt79" });
	}
	static rolloverTitle(fbs: FbsRuntime) {
		return fbs._("赛季滚动", null, { hk: "2bTcb6" });
	}
	static rolloverHint(fbs: FbsRuntime) {
		return fbs._("把组队模板批量迁移为新赛季副本。先看预览，确认后才执行；执行结果会留痕。", null, { hk: "1EFZ91" });
	}
	static rolloverSeason(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("目标赛季：{season}", [fbs._param("season", pv(p, "season"))], { hk: "4jgM3i" });
	}
	static rolloverPreview(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("将迁移 {count} 个模板（共 {total} 个，已有新赛季副本 {copied} 个）", [
			fbs._param("count", pv(p, "count")),
			fbs._param("total", pv(p, "total")),
			fbs._param("copied", pv(p, "copied"))
		], { hk: "4ei1DP" });
	}
	static rolloverExecuteButton(fbs: FbsRuntime) {
		return fbs._("执行赛季滚动", null, { hk: "2FGDZh" });
	}
	static rolloverDone(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已迁移 {count} 个模板到新赛季", [fbs._param("count", pv(p, "count"))], { hk: "40In16" });
	}
	static rolloverGearNote(fbs: FbsRuntime) {
		return fbs._("旧赛季装备打季标：装备暂无赛季概念，本步跳过。", null, { hk: "1wMHaB" });
	}
	static rolloverThresholdNote(fbs: FbsRuntime) {
		return fbs._("达标线按新赛季重算：装备达标盘尚未上线，本步跳过，待其上线后接入。", null, { hk: "2yqPiO" });
	}
	static rolloverLast(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("上次滚动：{date} · 迁移 {count} 个模板", [fbs._param("date", pv(p, "date")), fbs._param("count", pv(p, "count"))], { hk: "20Cj56" });
	}
	static pointsTitle(fbs: FbsRuntime) {
		return fbs._("贡献积分", null, { hk: "2pCDS" });
	}
	static pointsHint(fbs: FbsRuntime) {
		return fbs._("积分只认平台里的真实动作：出席已完成的车队、带队完成车队、成为导师。积分从功能启用后累计，不补历史；成员能看自己的余额与流水，规则与总览只有军官能改能看。", null, { hk: "3AiUgQ" });
	}
	static ruleAttendance(fbs: FbsRuntime) {
		return fbs._("出席", null, { hk: "1mPvpB" });
	}
	static ruleLeading(fbs: FbsRuntime) {
		return fbs._("带队", null, { hk: "d1Mqw" });
	}
	static ruleMentoring(fbs: FbsRuntime) {
		return fbs._("导师", null, { hk: "2IfNYQ" });
	}
	static pointsValue(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{points} 分", [fbs._param("points", pv(p, "points"))], { hk: "16gXN3" });
	}
	static pointsBoardEmpty(fbs: FbsRuntime) {
		return fbs._("暂无积分记录（从启用后的第一场已完成车队开始累计）。", null, { hk: "4ddvvW" });
	}
	static pointsTotalLabel(fbs: FbsRuntime) {
		return fbs._("总分", null, { hk: "1cMOYj" });
	}
	static pointsEntriesLabel(fbs: FbsRuntime) {
		return fbs._("笔数", null, { hk: "25idUf" });
	}
	static saveButton(fbs: FbsRuntime) {
		return fbs._("保存", null, { hk: "3WdqEQ" });
	}
	static myPointsTitle(fbs: FbsRuntime) {
		return fbs._("我的贡献积分", null, { hk: "3xZhO8" });
	}
	static myPointsTotal(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("累计 {points} 分", [fbs._param("points", pv(p, "points"))], { hk: "1tRCSy" });
	}
}
export abstract class MarketFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("补位市场", null, { hk: "1nNUrx" });
	}
	static body(fbs: FbsRuntime) {
		return fbs._("缺人时来这里找补位：任何成员都可以免费发布自己的补位供给；百业盟主档的车头与管理员可以针对车队缺口发布需求、邀请补位。市场只负责撮合，是否落座由车头在车队里手动确认。", null, { hk: "3AScnP" });
	}
	static lockedTitle(fbs: FbsRuntime) {
		return fbs._("无法打开补位市场", null, { hk: "57rLj" });
	}
	static lockedBody(fbs: FbsRuntime) {
		return fbs._("登录并成为本百业成员后，可以发布补位供给、处理收到的邀请。", null, { hk: "b6KK8" });
	}
	static supplyTitle(fbs: FbsRuntime) {
		return fbs._("我的补位供给", null, { hk: "1NFpif" });
	}
	static supplyHint(fbs: FbsRuntime) {
		return fbs._("发布供给免费、与百业档位无关。公开面只展示你的流派、可补位时段与所属百业名，不展示任何联系方式。", null, { hk: "3DJoV0" });
	}
	static supplyEmpty(fbs: FbsRuntime) {
		return fbs._("你还没有发布补位供给。", null, { hk: "6LtBE" });
	}
	static schoolLabel(fbs: FbsRuntime) {
		return fbs._("流派", null, { hk: "411lAx" });
	}
	static windowsLabel(fbs: FbsRuntime) {
		return fbs._("可补位时段", null, { hk: "3aLwnV" });
	}
	static noteLabel(fbs: FbsRuntime) {
		return fbs._("自我说明", null, { hk: "nP5Hk" });
	}
	static notePlaceholder(fbs: FbsRuntime) {
		return fbs._("一句说明：擅长的副本、装备情况……", null, { hk: "2od1ee" });
	}
	static publishButton(fbs: FbsRuntime) {
		return fbs._("发布供给", null, { hk: "3wwmpt" });
	}
	static withdrawButton(fbs: FbsRuntime) {
		return fbs._("撤下供给", null, { hk: "29G9l2" });
	}
	static offerStatusOpen(fbs: FbsRuntime) {
		return fbs._("已发布", null, { hk: "1OwBXU" });
	}
	static homeGuildPattern(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("所属百业：{name}", [fbs._param("name", pv(p, "name"))], { hk: "3afQCt" });
	}
	static windowLine(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{day} {start}–{end}", [
			fbs._param("day", pv(p, "day")),
			fbs._param("start", pv(p, "start")),
			fbs._param("end", pv(p, "end"))
		], { hk: "1YCF59" });
	}
	static weekday0(fbs: FbsRuntime) {
		return fbs._("周日", null, { hk: "2VXzII" });
	}
	static weekday1(fbs: FbsRuntime) {
		return fbs._("周一", null, { hk: "12hPrI" });
	}
	static weekday2(fbs: FbsRuntime) {
		return fbs._("周二", null, { hk: "3cQ5id" });
	}
	static weekday3(fbs: FbsRuntime) {
		return fbs._("周三", null, { hk: "ejtP9" });
	}
	static weekday4(fbs: FbsRuntime) {
		return fbs._("周四", null, { hk: "3j6klw" });
	}
	static weekday5(fbs: FbsRuntime) {
		return fbs._("周五", null, { hk: "1O4c5u" });
	}
	static weekday6(fbs: FbsRuntime) {
		return fbs._("周六", null, { hk: "2tKKZ8" });
	}
	static inboxTitle(fbs: FbsRuntime) {
		return fbs._("收到的补位邀请", null, { hk: "fBxcR" });
	}
	static inboxEmpty(fbs: FbsRuntime) {
		return fbs._("暂无补位邀请。", null, { hk: "3oBbDA" });
	}
	static acceptButton(fbs: FbsRuntime) {
		return fbs._("接受邀请", null, { hk: "3P1is8" });
	}
	static declineButton(fbs: FbsRuntime) {
		return fbs._("婉拒", null, { hk: "2Gk7v6" });
	}
	static inviteStatusPending(fbs: FbsRuntime) {
		return fbs._("待确认", null, { hk: "1McO66" });
	}
	static inviteStatusAccepted(fbs: FbsRuntime) {
		return fbs._("已接受", null, { hk: "37I7kP" });
	}
	static inviteStatusDeclined(fbs: FbsRuntime) {
		return fbs._("已婉拒", null, { hk: "1qVABK" });
	}
	static inviteStatusExpired(fbs: FbsRuntime) {
		return fbs._("已失效", null, { hk: "UdOUN" });
	}
	static inviteFromPattern(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("来自 {guild} · {title}", [fbs._param("guild", pv(p, "guild")), fbs._param("title", pv(p, "title"))], { hk: "UOM31" });
	}
	static demandTitle(fbs: FbsRuntime) {
		return fbs._("补位需求", null, { hk: "votGm" });
	}
	static demandLockedTitle(fbs: FbsRuntime) {
		return fbs._("补位需求是盟主档功能", null, { hk: "3g7WH8" });
	}
	static demandLockedBody(fbs: FbsRuntime) {
		return fbs._("发布补位需求、浏览并邀请补位人选需要百业开通盟主档（T3）。发布补位供给与处理收到的邀请不受档位限制，所有成员免费可用。", null, { hk: "2pogcc" });
	}
	static demandNoManageHint(fbs: FbsRuntime) {
		return fbs._("只有本百业的车头与管理员可以发布需求与发出邀请。", null, { hk: "1yMt1G" });
	}
	static requestsTitle(fbs: FbsRuntime) {
		return fbs._("本百业的补位需求", null, { hk: "1d7JFB" });
	}
	static requestsEmpty(fbs: FbsRuntime) {
		return fbs._("暂无补位需求。在车队详情里针对缺口发布，或在这里新建。", null, { hk: "4s9USt" });
	}
	static createRequestTitle(fbs: FbsRuntime) {
		return fbs._("发布补位需求", null, { hk: "hG0kh" });
	}
	static groupingLabel(fbs: FbsRuntime) {
		return fbs._("缺人的车队", null, { hk: "3wmjHb" });
	}
	static neededRoleLabel(fbs: FbsRuntime) {
		return fbs._("缺的职责", null, { hk: "m9Ywm" });
	}
	static neededSchoolLabel(fbs: FbsRuntime) {
		return fbs._("指定流派（可选）", null, { hk: "AUxrr" });
	}
	static requestNoteLabel(fbs: FbsRuntime) {
		return fbs._("需求说明", null, { hk: "20BY0s" });
	}
	static createRequestButton(fbs: FbsRuntime) {
		return fbs._("发布需求", null, { hk: "479lEF" });
	}
	static closeRequestButton(fbs: FbsRuntime) {
		return fbs._("关闭需求", null, { hk: "1Mm6ZK" });
	}
	static requestStatusOpen(fbs: FbsRuntime) {
		return fbs._("招募中", null, { hk: "4D7xuS" });
	}
	static requestStatusMatched(fbs: FbsRuntime) {
		return fbs._("已撮合", null, { hk: "4sjLm7" });
	}
	static requestStatusClosed(fbs: FbsRuntime) {
		return fbs._("已关闭", null, { hk: "3jy3zK" });
	}
	static offersTitle(fbs: FbsRuntime) {
		return fbs._("可邀请的补位人选", null, { hk: "MD8BF" });
	}
	static offersEmpty(fbs: FbsRuntime) {
		return fbs._("市场里暂无补位供给。", null, { hk: "4cKv1R" });
	}
	static inviteButton(fbs: FbsRuntime) {
		return fbs._("发出邀请", null, { hk: "2Zq2AM" });
	}
	static invitedLabel(fbs: FbsRuntime) {
		return fbs._("已邀请", null, { hk: "akUtA" });
	}
	static seatButton(fbs: FbsRuntime) {
		return fbs._("落座到车队", null, { hk: "4AvgbA" });
	}
	static seatedLabel(fbs: FbsRuntime) {
		return fbs._("已落座", null, { hk: "4ioSPI" });
	}
	static roleHealer(fbs: FbsRuntime) {
		return fbs._("奶", null, { hk: "2imgi8" });
	}
	static roleDps(fbs: FbsRuntime) {
		return fbs._("输出", null, { hk: "Xi2D0" });
	}
	static backLabel(fbs: FbsRuntime) {
		return fbs._("‹ 返回百业", null, { hk: "uq5Er" });
	}
}
export abstract class AlliesFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("盟友百业", null, { hk: "2IqKi7" });
	}
	static body(fbs: FbsRuntime) {
		return fbs._("结盟后，双方车队可以互相开放：车头把车队标为盟友可见并设置访客名额，盟友成员就能在自己百业看到并报名访客位。解除结盟后，共享立即失效。", null, { hk: "1M5oel" });
	}
	static lockedTitle(fbs: FbsRuntime) {
		return fbs._("无法打开盟友百业", null, { hk: "1C6DhP" });
	}
	static lockedBody(fbs: FbsRuntime) {
		return fbs._("登录并成为本百业成员后，可以查看盟友与共享活动。", null, { hk: "2IYUIR" });
	}
	static tierLockedTitle(fbs: FbsRuntime) {
		return fbs._("盟友百业是盟主档功能", null, { hk: "2l5tBf" });
	}
	static tierLockedBody(fbs: FbsRuntime) {
		return fbs._("结盟、查看盟友与共享活动需要百业开通盟主档（T3）。解除既有结盟不受档位限制。", null, { hk: "3vbBRQ" });
	}
	static activeTitle(fbs: FbsRuntime) {
		return fbs._("已结盟百业", null, { hk: "srINm" });
	}
	static activeEmpty(fbs: FbsRuntime) {
		return fbs._("本百业暂无盟友。", null, { hk: "4A33WQ" });
	}
	static statusPending(fbs: FbsRuntime) {
		return fbs._("待对方确认", null, { hk: "40OLju" });
	}
	static statusActive(fbs: FbsRuntime) {
		return fbs._("已结盟", null, { hk: "2nPRCK" });
	}
	static adminTitle(fbs: FbsRuntime) {
		return fbs._("结盟管理", null, { hk: "2UsVZO" });
	}
	static inviteLabel(fbs: FbsRuntime) {
		return fbs._("对方百业", null, { hk: "INTDY" });
	}
	static inviteHint(fbs: FbsRuntime) {
		return fbs._("结盟邀请由对方百业管理员确认后生效；任一方管理员都可以单方解除结盟。", null, { hk: "1ZHNpq" });
	}
	static inviteButton(fbs: FbsRuntime) {
		return fbs._("发出结盟邀请", null, { hk: "EvaIp" });
	}
	static incomingTitle(fbs: FbsRuntime) {
		return fbs._("待处理的结盟邀请", null, { hk: "Viy23" });
	}
	static outgoingTitle(fbs: FbsRuntime) {
		return fbs._("已发出的结盟邀请", null, { hk: "1yR47" });
	}
	static acceptButton(fbs: FbsRuntime) {
		return fbs._("接受结盟", null, { hk: "4wd1nF" });
	}
	static rejectButton(fbs: FbsRuntime) {
		return fbs._("拒绝", null, { hk: "3BE9yW" });
	}
	static endButton(fbs: FbsRuntime) {
		return fbs._("解除结盟", null, { hk: "2Lt68A" });
	}
	static sharedTitle(fbs: FbsRuntime) {
		return fbs._("盟友共享活动", null, { hk: "19Z3dr" });
	}
	static sharedEmpty(fbs: FbsRuntime) {
		return fbs._("暂无盟友共享活动。", null, { hk: "1pjEEp" });
	}
	static hostPattern(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("主办：{name}", [fbs._param("name", pv(p, "name"))], { hk: "3xmGEZ" });
	}
	static visitorLeftPattern(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("访客位 {left} / {total}", [fbs._param("left", pv(p, "left")), fbs._param("total", pv(p, "total"))], { hk: "2jQFYi" });
	}
	static visitorJoinButton(fbs: FbsRuntime) {
		return fbs._("报名访客位", null, { hk: "3EcWpT" });
	}
	static visitorJoinedLabel(fbs: FbsRuntime) {
		return fbs._("已报名访客位", null, { hk: "38FyNR" });
	}
	static sharingTitle(fbs: FbsRuntime) {
		return fbs._("盟友共享设置", null, { hk: "vNGdu" });
	}
	static sharingHint(fbs: FbsRuntime) {
		return fbs._("开启后，盟友百业成员可以在他们的盟友页看到这辆车，并报名访客位（计入车队总名额）。访客名额为 0 时不开放报名。", null, { hk: "1OXB8p" });
	}
	static allyVisibleLabel(fbs: FbsRuntime) {
		return fbs._("对盟友可见", null, { hk: "40NsOC" });
	}
	static visitorSlotsLabel(fbs: FbsRuntime) {
		return fbs._("访客名额", null, { hk: "4gnmtg" });
	}
	static sharingSaveButton(fbs: FbsRuntime) {
		return fbs._("保存共享设置", null, { hk: "hkAcm" });
	}
	static backLabel(fbs: FbsRuntime) {
		return fbs._("‹ 返回百业", null, { hk: "2IhABW" });
	}
}
export abstract class GovernanceFbtUtils {
	static sectionLockedTitle(fbs: FbsRuntime) {
		return fbs._("此面未在你的授权内", null, { hk: "40BLd0" });
	}
	static sectionLockedBody(fbs: FbsRuntime) {
		return fbs._("这个管理面需要对应的军官能力，你的授权不包含它。请百业管理员在治理页调整你的授权。", null, { hk: "293dMP" });
	}
	static lockedTitle(fbs: FbsRuntime) {
		return fbs._("治理功能未开通", null, { hk: "1xnuYX" });
	}
	static lockedBody(fbs: FbsRuntime) {
		return fbs._("细粒度权限、军官私密区与百业审计日志是最高档位（T3）的治理功能。本百业尚未达到该档位，治理数据不会下发。", null, { hk: "k5e1a" });
	}
	static title(fbs: FbsRuntime) {
		return fbs._("治理与审计", null, { hk: "1hEl0W" });
	}
	static hint(fbs: FbsRuntime) {
		return fbs._("百业管理员可以把部分管理面授权给军官成员分工处理；管理员本人始终全权。授权与全部管理动作都会记入本百业的审计日志。", null, { hk: "2B2KE9" });
	}
	static officersTitle(fbs: FbsRuntime) {
		return fbs._("军官授权", null, { hk: "3oAfEQ" });
	}
	static officersHint(fbs: FbsRuntime) {
		return fbs._("被授权的军官只能进入被授予的管理面与动作；授权本身与付费结账始终只有百业管理员可以操作。", null, { hk: "4f84qH" });
	}
	static officersEmpty(fbs: FbsRuntime) {
		return fbs._("尚无被授权的军官。在下方选择名册成员并勾选能力即可授权。", null, { hk: "1hDxQl" });
	}
	static grantMemberLabel(fbs: FbsRuntime) {
		return fbs._("选择成员", null, { hk: "32W8Dm" });
	}
	static grantCapabilitiesLabel(fbs: FbsRuntime) {
		return fbs._("授予能力", null, { hk: "2yxjSt" });
	}
	static grantButton(fbs: FbsRuntime) {
		return fbs._("保存授权", null, { hk: "1KrYD8" });
	}
	static revokeButton(fbs: FbsRuntime) {
		return fbs._("撤销授权", null, { hk: "2uLfRS" });
	}
	static grantedByTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{name} 授予", [fbs._param("name", pv(p, "name"))], { hk: "Wcqf" });
	}
	static adminBadge(fbs: FbsRuntime) {
		return fbs._("百业管理员 · 全权", null, { hk: "1wH6tM" });
	}
	static boardTitle(fbs: FbsRuntime) {
		return fbs._("军官私密区", null, { hk: "3dhZAD" });
	}
	static boardHint(fbs: FbsRuntime) {
		return fbs._("只有军官（百业管理员与被授权成员）能看到这里的内容：内部留言、排班注记都可以写在这里，普通成员完全看不到这一区。", null, { hk: "zZByz" });
	}
	static boardEmpty(fbs: FbsRuntime) {
		return fbs._("私密区暂无留言。", null, { hk: "1OEr73" });
	}
	static boardPlaceholder(fbs: FbsRuntime) {
		return fbs._("写一条内部留言或排班注记…", null, { hk: "3na9ZO" });
	}
	static boardPostButton(fbs: FbsRuntime) {
		return fbs._("发布到私密区", null, { hk: "412W39" });
	}
	static boardDeleteButton(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "3FZyby" });
	}
	static boardAuthorTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{name} 留言", [fbs._param("name", pv(p, "name"))], { hk: "1RICMJ" });
	}
	static auditTitle(fbs: FbsRuntime) {
		return fbs._("百业审计日志", null, { hk: "1S5eyt" });
	}
	static auditHint(fbs: FbsRuntime) {
		return fbs._("本百业内的管理动作留痕：谁在何时对什么做了什么。日志只记动作与目标摘要，不含备注正文等敏感内容。", null, { hk: "JBT9e" });
	}
	static auditEmpty(fbs: FbsRuntime) {
		return fbs._("暂无审计记录。", null, { hk: "6LyyN" });
	}
	static auditLoadMoreButton(fbs: FbsRuntime) {
		return fbs._("加载更多", null, { hk: "25PqqE" });
	}
	static auditActorFallback(fbs: FbsRuntime) {
		return fbs._("系统", null, { hk: "3qjQdc" });
	}
	static capProfile(fbs: FbsRuntime) {
		return fbs._("资料设置", null, { hk: "bEBFj" });
	}
	static capDiscord(fbs: FbsRuntime) {
		return fbs._("Discord 与提醒", null, { hk: "2pRiK1" });
	}
	static capEvents(fbs: FbsRuntime) {
		return fbs._("车队管理", null, { hk: "3YbOia" });
	}
	static capGuides(fbs: FbsRuntime) {
		return fbs._("攻略数据", null, { hk: "2OG0a" });
	}
	static capAnnounce(fbs: FbsRuntime) {
		return fbs._("公告发布", null, { hk: "3CGBiC" });
	}
	static capStats(fbs: FbsRuntime) {
		return fbs._("数据查看", null, { hk: "2mwnmZ" });
	}
	static capTools(fbs: FbsRuntime) {
		return fbs._("活动工具", null, { hk: "3oXegV" });
	}
	static capSeason(fbs: FbsRuntime) {
		return fbs._("赛季管理", null, { hk: "3ZaDFR" });
	}
	static capRecruit(fbs: FbsRuntime) {
		return fbs._("招新审核", null, { hk: "2AsWsi" });
	}
	static capOfficer(fbs: FbsRuntime) {
		return fbs._("成员备注", null, { hk: "eKnA2" });
	}
	static actionProfileUpdate(fbs: FbsRuntime) {
		return fbs._("修改百业资料", null, { hk: "2WEKTg" });
	}
	static actionAvatarSet(fbs: FbsRuntime) {
		return fbs._("设置百业头像", null, { hk: "3oPqid" });
	}
	static actionAvatarDelete(fbs: FbsRuntime) {
		return fbs._("删除百业头像", null, { hk: "37TQxg" });
	}
	static actionDiscordUpdate(fbs: FbsRuntime) {
		return fbs._("修改 Discord 集成", null, { hk: "4m2fez" });
	}
	static actionReminderUpdate(fbs: FbsRuntime) {
		return fbs._("修改提醒设置", null, { hk: "38onKg" });
	}
	static actionWhitelabelUpdate(fbs: FbsRuntime) {
		return fbs._("修改白标设置", null, { hk: "4hz0It" });
	}
	static actionVisibilityUpdate(fbs: FbsRuntime) {
		return fbs._("修改可见性", null, { hk: "2QzGYC" });
	}
	static actionRecruitOpen(fbs: FbsRuntime) {
		return fbs._("切换招新开关", null, { hk: "xsmH9" });
	}
	static actionEventCreate(fbs: FbsRuntime) {
		return fbs._("创建活动", null, { hk: "1UKtHu" });
	}
	static actionEventUpdate(fbs: FbsRuntime) {
		return fbs._("修改活动", null, { hk: "1ARfVJ" });
	}
	static actionEventDelete(fbs: FbsRuntime) {
		return fbs._("删除活动", null, { hk: "1hiiau" });
	}
	static actionEventMerge(fbs: FbsRuntime) {
		return fbs._("合并车队", null, { hk: "12Z1VP" });
	}
	static actionAgentJoin(fbs: FbsRuntime) {
		return fbs._("经 Agent 报名", null, { hk: "2GbMtA" });
	}
	static actionAgentLeave(fbs: FbsRuntime) {
		return fbs._("经 Agent 退报", null, { hk: "4o19gm" });
	}
	static actionAgentReady(fbs: FbsRuntime) {
		return fbs._("经 Agent 调整就位", null, { hk: "YFaGD" });
	}
	static actionAgentCreate(fbs: FbsRuntime) {
		return fbs._("经 Agent 建车", null, { hk: "xawA1" });
	}
	static actionSignupRemove(fbs: FbsRuntime) {
		return fbs._("移除报名", null, { hk: "1mLK3J" });
	}
	static actionResultAdd(fbs: FbsRuntime) {
		return fbs._("登记竞速成绩", null, { hk: "9ZrB2" });
	}
	static actionResultDelete(fbs: FbsRuntime) {
		return fbs._("删除竞速成绩", null, { hk: "cZXiY" });
	}
	static actionLotteryCreate(fbs: FbsRuntime) {
		return fbs._("创建抽奖", null, { hk: "QJXVX" });
	}
	static actionLotteryDraw(fbs: FbsRuntime) {
		return fbs._("抽奖开奖", null, { hk: "1JZkpB" });
	}
	static actionGuideUpdate(fbs: FbsRuntime) {
		return fbs._("修改攻略数据", null, { hk: "3FTAHd" });
	}
	static actionAnnouncementPost(fbs: FbsRuntime) {
		return fbs._("发布公告", null, { hk: "1SKRu3" });
	}
	static actionAnnouncementDelete(fbs: FbsRuntime) {
		return fbs._("删除公告", null, { hk: "rYpmp" });
	}
	static actionApplicationApprove(fbs: FbsRuntime) {
		return fbs._("通过入业申请", null, { hk: "28tEEU" });
	}
	static actionApplicationReject(fbs: FbsRuntime) {
		return fbs._("拒绝入业申请", null, { hk: "2QNVRh" });
	}
	static actionMentorSet(fbs: FbsRuntime) {
		return fbs._("设为导师", null, { hk: "4aoOTO" });
	}
	static actionMentorUnset(fbs: FbsRuntime) {
		return fbs._("取消导师", null, { hk: "M3A2M" });
	}
	static actionPairingCreate(fbs: FbsRuntime) {
		return fbs._("建立导师配对", null, { hk: "4DVuaj" });
	}
	static actionPairingEnd(fbs: FbsRuntime) {
		return fbs._("结束导师配对", null, { hk: "gPUwZ" });
	}
	static actionNoteAdd(fbs: FbsRuntime) {
		return fbs._("添加成员备注", null, { hk: "4iKG04" });
	}
	static actionNoteUpdate(fbs: FbsRuntime) {
		return fbs._("修改成员备注", null, { hk: "1Eb8qo" });
	}
	static actionNoteDelete(fbs: FbsRuntime) {
		return fbs._("删除成员备注", null, { hk: "26b1YG" });
	}
	static actionExportPackage(fbs: FbsRuntime) {
		return fbs._("导出百业数据包", null, { hk: "2a8ZNL" });
	}
	static actionSeasonChecklist(fbs: FbsRuntime) {
		return fbs._("勾选赛季清单", null, { hk: "3FrliC" });
	}
	static actionRosterImport(fbs: FbsRuntime) {
		return fbs._("导入名册", null, { hk: "1T7mpN" });
	}
	static actionRosterEntryDelete(fbs: FbsRuntime) {
		return fbs._("删除名册记录", null, { hk: "1wuk9M" });
	}
	static actionOfficerGrant(fbs: FbsRuntime) {
		return fbs._("授予军官能力", null, { hk: "6LCKL" });
	}
	static actionOfficerRevoke(fbs: FbsRuntime) {
		return fbs._("撤销军官授权", null, { hk: "4sY8q9" });
	}
	static actionBoardPost(fbs: FbsRuntime) {
		return fbs._("私密区留言", null, { hk: "4gwgfk" });
	}
	static actionBoardDelete(fbs: FbsRuntime) {
		return fbs._("删除私密区留言", null, { hk: "4kFZL0" });
	}
}
export abstract class PlatformAdminFbtUtils {
	static entryLabel(fbs: FbsRuntime) {
		return fbs._("平台管理", null, { hk: "1AfRLr" });
	}
	static title(fbs: FbsRuntime) {
		return fbs._("平台管理", null, { hk: "41lTLE" });
	}
	static subtitle(fbs: FbsRuntime) {
		return fbs._("平台运营面：百业、计费、图鉴、配置与审计。原 hub 门户已并入主站，超管判定由平台 gate 在服务端求值。", null, { hk: "2PUUrz" });
	}
	static lockedTitle(fbs: FbsRuntime) {
		return fbs._("需要平台超管权限", null, { hk: "3xCJ8d" });
	}
	static lockedBody(fbs: FbsRuntime) {
		return fbs._("这个页面只对平台超管开放。超管名单由平台 gate 在服务端求值，你的账号不在名单内，所以这里不会下发任何管理数据。", null, { hk: "21cE7V" });
	}
	static tenantsTitle(fbs: FbsRuntime) {
		return fbs._("百业列表", null, { hk: "27JuB3" });
	}
	static tenantsEmpty(fbs: FbsRuntime) {
		return fbs._("暂无百业", null, { hk: "1NlS1R" });
	}
	static billingTitle(fbs: FbsRuntime) {
		return fbs._("计费与权益", null, { hk: "4mSA7V" });
	}
	static paygateLabel(fbs: FbsRuntime) {
		return fbs._("付费总闸 (paygate)", null, { hk: "1g9iLg" });
	}
	static paygateOnText(fbs: FbsRuntime) {
		return fbs._("已开启", null, { hk: "4CSzoa" });
	}
	static paygateOffText(fbs: FbsRuntime) {
		return fbs._("已关闭", null, { hk: "1iFefc" });
	}
	static stripeLabel(fbs: FbsRuntime) {
		return fbs._("Stripe", null, { hk: "1KjNkv" });
	}
	static stripeConfiguredText(fbs: FbsRuntime) {
		return fbs._("已配置", null, { hk: "4sTLhQ" });
	}
	static stripeMissingText(fbs: FbsRuntime) {
		return fbs._("未配置（密钥或价格缺失）", null, { hk: "2QvE8q" });
	}
	static saasLabel(fbs: FbsRuntime) {
		return fbs._("自定义域名 SaaS", null, { hk: "1z1kqE" });
	}
	static saasConfiguredText(fbs: FbsRuntime) {
		return fbs._("已接入", null, { hk: "2VLQVq" });
	}
	static saasMissingText(fbs: FbsRuntime) {
		return fbs._("未接入", null, { hk: "1vPExF" });
	}
	static plansTitle(fbs: FbsRuntime) {
		return fbs._("价格档位", null, { hk: "wgf1K" });
	}
	static billingTenantsTitle(fbs: FbsRuntime) {
		return fbs._("各百业权益", null, { hk: "3ELoZx" });
	}
	static errorsTitle(fbs: FbsRuntime) {
		return fbs._("错误日志", null, { hk: "1WL5QV" });
	}
	static errorsEmpty(fbs: FbsRuntime) {
		return fbs._("暂无错误记录", null, { hk: "3Ujyqo" });
	}
	static auditTitle(fbs: FbsRuntime) {
		return fbs._("操作审计", null, { hk: "49a50l" });
	}
	static auditEmpty(fbs: FbsRuntime) {
		return fbs._("暂无审计记录", null, { hk: "2Rh0jo" });
	}
	static feedbackTitle(fbs: FbsRuntime) {
		return fbs._("用户反馈", null, { hk: "LrZCY" });
	}
	static feedbackEmpty(fbs: FbsRuntime) {
		return fbs._("暂无反馈", null, { hk: "3pDJLh" });
	}
	static settingsTitle(fbs: FbsRuntime) {
		return fbs._("平台设置", null, { hk: "1VdUKm" });
	}
	static gameVersionLabel(fbs: FbsRuntime) {
		return fbs._("游戏版本", null, { hk: "22IQd0" });
	}
	static gameNoticeLabel(fbs: FbsRuntime) {
		return fbs._("游戏公告", null, { hk: "381uwb" });
	}
	static gameVersionCodeLabel(fbs: FbsRuntime) {
		return fbs._("版本号 (version code)", null, { hk: "3fNqNY" });
	}
	static bossesTitle(fbs: FbsRuntime) {
		return fbs._("首领图鉴", null, { hk: "2MGNoK" });
	}
	static bossesEmpty(fbs: FbsRuntime) {
		return fbs._("暂无首领", null, { hk: "35Y6Y8" });
	}
	static dungeonsTitle(fbs: FbsRuntime) {
		return fbs._("副本图鉴", null, { hk: "37nPWi" });
	}
	static dungeonsEmpty(fbs: FbsRuntime) {
		return fbs._("暂无副本", null, { hk: "4t6jud" });
	}
	static remindersTitle(fbs: FbsRuntime) {
		return fbs._("开车提醒配置", null, { hk: "xOKn6" });
	}
	static remindersEmpty(fbs: FbsRuntime) {
		return fbs._("暂无百业", null, { hk: "DuJlh" });
	}
	static heirloomsTitle(fbs: FbsRuntime) {
		return fbs._("传家宝推送配置", null, { hk: "Zequy" });
	}
	static heirloomsEmpty(fbs: FbsRuntime) {
		return fbs._("暂无百业", null, { hk: "3pnlJV" });
	}
	static backupsTitle(fbs: FbsRuntime) {
		return fbs._("数据备份", null, { hk: "3Ip68R" });
	}
	static backupsEmpty(fbs: FbsRuntime) {
		return fbs._("暂无备份文件", null, { hk: "1lfVZL" });
	}
	static backupsUnavailableText(fbs: FbsRuntime) {
		return fbs._("备份存储（R2 BACKUPS 绑定）未配置", null, { hk: "2eZ3F8" });
	}
	static rosterTitle(fbs: FbsRuntime) {
		return fbs._("平台超管名单", null, { hk: "LdNtG" });
	}
	static rosterNote(fbs: FbsRuntime) {
		return fbs._("名单按 Discord 用户 ID 在 gate 层求值；环境变量 PLATFORM_ADMIN_DISCORD_IDS 的引导名单始终有效，不在此列出。修改即时生效并写入审计。", null, { hk: "3b2cw8" });
	}
	static backfillsTitle(fbs: FbsRuntime) {
		return fbs._("一次性回填工具", null, { hk: "2fv24C" });
	}
	static saveLabel(fbs: FbsRuntime) {
		return fbs._("保存", null, { hk: "NXlGa" });
	}
	static testLabel(fbs: FbsRuntime) {
		return fbs._("发送测试", null, { hk: "MZKcu" });
	}
	static runLabel(fbs: FbsRuntime) {
		return fbs._("执行", null, { hk: "3RPVbx" });
	}
	static dryRunLabel(fbs: FbsRuntime) {
		return fbs._("仅试运行（不写库）", null, { hk: "xFezy" });
	}
	static deleteTenantLabel(fbs: FbsRuntime) {
		return fbs._("删除百业", null, { hk: "hMoir" });
	}
	static grantLabel(fbs: FbsRuntime) {
		return fbs._("授予", null, { hk: "2s1eys" });
	}
	static revokeLabel(fbs: FbsRuntime) {
		return fbs._("撤销", null, { hk: "TgqG" });
	}
	static subdomainLabel(fbs: FbsRuntime) {
		return fbs._("平台子域名", null, { hk: "3gj41B" });
	}
	static customDomainLabel(fbs: FbsRuntime) {
		return fbs._("自定义域名", null, { hk: "3591nL" });
	}
	static enabledText(fbs: FbsRuntime) {
		return fbs._("已启用", null, { hk: "40YaQL" });
	}
	static disabledText(fbs: FbsRuntime) {
		return fbs._("已禁用", null, { hk: "3QAYEj" });
	}
	static webhookSetText(fbs: FbsRuntime) {
		return fbs._("Webhook 已配置", null, { hk: "3a3DkZ" });
	}
	static webhookUnsetText(fbs: FbsRuntime) {
		return fbs._("Webhook 未配置", null, { hk: "3DoRYz" });
	}
	static webhookCustomAddressText(fbs: FbsRuntime) {
		return fbs._("已配置（自定义地址）", null, { hk: "4tvExS" });
	}
	static runBackupLabel(fbs: FbsRuntime) {
		return fbs._("立即备份", null, { hk: "2BM5nK" });
	}
	static downloadLabel(fbs: FbsRuntime) {
		return fbs._("下载", null, { hk: "3IQ8Uy" });
	}
	static exportLabel(fbs: FbsRuntime) {
		return fbs._("导出备份 JSON", null, { hk: "3Wrieg" });
	}
	static backfillReminderIdentityLabel(fbs: FbsRuntime) {
		return fbs._("回填提醒身份（名册+座位戳）", null, { hk: "iEafa" });
	}
	static backfillCreatorsLabel(fbs: FbsRuntime) {
		return fbs._("回填车头身份戳", null, { hk: "2YMa7q" });
	}
	static backfillKunpengDexLabel(fbs: FbsRuntime) {
		return fbs._("回填鲲鹏图千山图鉴（副本+双首领）", null, { hk: "4f8rY2" });
	}
	static migrateBossGuidesLabel(fbs: FbsRuntime) {
		return fbs._("结构化首领攻略（从攻略文本生成）", null, { hk: "4vzyyE" });
	}
	static statusOpenText(fbs: FbsRuntime) {
		return fbs._("待处理", null, { hk: "xjuqt" });
	}
	static statusResolvedText(fbs: FbsRuntime) {
		return fbs._("已解决", null, { hk: "37VE05" });
	}
	static lastStatusLabel(fbs: FbsRuntime) {
		return fbs._("最近状态", null, { hk: "1jqtPk" });
	}
	static nextAlarmLabel(fbs: FbsRuntime) {
		return fbs._("下次提醒", null, { hk: "1ifqdt" });
	}
	static reminderErrorSendFailed(fbs: FbsRuntime) {
		return fbs._("发送失败", null, { hk: "4abDsY" });
	}
	static reminderErrorRateLimited(fbs: FbsRuntime) {
		return fbs._("Discord 限流 (429)", null, { hk: "12ZleY" });
	}
	static reminderErrorRateLimitedDetail(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("Discord 限流 (429): {detail}", [fbs._param("detail", pv(p, "detail"))], { hk: "eCfPj" });
	}
	static reminderErrorWebhookStatus(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("Webhook 返回 {status}", [fbs._param("status", pv(p, "status"))], { hk: "2acPH5" });
	}
	static reminderErrorWebhookStatusDetail(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("Webhook 返回 {status}: {detail}", [fbs._param("status", pv(p, "status")), fbs._param("detail", pv(p, "detail"))], { hk: "1S23wU" });
	}
	static reminderErrorRequestFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("Webhook 请求失败: {detail}", [fbs._param("detail", pv(p, "detail"))], { hk: "3Am6ux" });
	}
	static periodEndLabel(fbs: FbsRuntime) {
		return fbs._("周期结束", null, { hk: "1oygv2" });
	}
	static sourceLabel(fbs: FbsRuntime) {
		return fbs._("来源", null, { hk: "Hrlwu" });
	}
	static tierLabel(fbs: FbsRuntime) {
		return fbs._("档位", null, { hk: "2FzMRi" });
	}
	static planLabel(fbs: FbsRuntime) {
		return fbs._("方案", null, { hk: "ZEG8D" });
	}
	static hasCardText(fbs: FbsRuntime) {
		return fbs._("已绑卡", null, { hk: "3FKS52" });
	}
	static noCardText(fbs: FbsRuntime) {
		return fbs._("未绑卡", null, { hk: "1IqgW" });
	}
	static trialUsedText(fbs: FbsRuntime) {
		return fbs._("已用试用", null, { hk: "K0Ol2" });
	}
}
export abstract class CarshareFbtUtils {
	static kicker(fbs: FbsRuntime) {
		return fbs._("车队招募 · 公开分享", null, { hk: "1Ek8Xd" });
	}
	static loginLabel(fbs: FbsRuntime) {
		return fbs._("登录并报名", null, { hk: "4EWe6k" });
	}
	static openLabel(fbs: FbsRuntime) {
		return fbs._("打开车队页", null, { hk: "Q81zc" });
	}
	static notFoundTitle(fbs: FbsRuntime) {
		return fbs._("链接已失效", null, { hk: "2PCNW4" });
	}
	static notFoundBody(fbs: FbsRuntime) {
		return fbs._("这条分享链接不存在，或对应的车队已经解散。", null, { hk: "1vd9DL" });
	}
	static readonlyHint(fbs: FbsRuntime) {
		return fbs._("这是只读的分享视图：只能查看车队信息，报名要登录后在车队页里操作。", null, { hk: "3EOaWM" });
	}
	static statusClosed(fbs: FbsRuntime) {
		return fbs._("已截止", null, { hk: "NL0rS" });
	}
	static seatsTitle(fbs: FbsRuntime) {
		return fbs._("座位", null, { hk: "flkBq" });
	}
}
export abstract class SchedulingAdviceFbtUtils {
	static lockedTitle(fbs: FbsRuntime) {
		return fbs._("智能调度建议", null, { hk: "19hHvf" });
	}
	static lockedBody(fbs: FbsRuntime) {
		return fbs._("智能配队、替补推荐、名额轮换、最优档期与跨车调度建议属于执事档（T2）权益，升级后即可使用。", null, { hk: "r7x1a" });
	}
	static title(fbs: FbsRuntime) {
		return fbs._("调度建议", null, { hk: "3sL0o1" });
	}
	static hint(fbs: FbsRuntime) {
		return fbs._("建议仅供参考，最终人选由车头点选决定，系统不会自动落座或递补。", null, { hk: "1eXIY8" });
	}
	static draftTitle(fbs: FbsRuntime) {
		return fbs._("智能配队草案", null, { hk: "446OKW" });
	}
	static draftApplyLabel(fbs: FbsRuntime) {
		return fbs._("套用草案", null, { hk: "3ujuDt" });
	}
	static substitutesTitle(fbs: FbsRuntime) {
		return fbs._("替补推荐", null, { hk: "2Z6Zqm" });
	}
	static rotationTitle(fbs: FbsRuntime) {
		return fbs._("名额轮换建议", null, { hk: "1fxfoD" });
	}
	static rotationSaveLabel(fbs: FbsRuntime) {
		return fbs._("保存本次轮换依据", null, { hk: "1t3zQo" });
	}
	static rotationSavedText(fbs: FbsRuntime) {
		return fbs._("轮换依据已留痕保存", null, { hk: "46K2Mv" });
	}
	static bestSlotsTitle(fbs: FbsRuntime) {
		return fbs._("最优档期推荐", null, { hk: "3HZZH0" });
	}
	static bestSlotsEmptyText(fbs: FbsRuntime) {
		return fbs._("还没有成员填写可用时间，暂无法推荐档期。", null, { hk: "nGaox" });
	}
	static bestSlotCoverTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{count} 人有空", [fbs._param("count", pv(p, "count"))], { hk: "1WeV6" });
	}
	static bestSlotUseLabel(fbs: FbsRuntime) {
		return fbs._("以此时段发车", null, { hk: "3xEpPL" });
	}
	static crossTitle(fbs: FbsRuntime) {
		return fbs._("跨车调度建议", null, { hk: "rUpPE" });
	}
	static conflictTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{name} 同时出现在时段重叠的多辆车中", [fbs._param("name", pv(p, "name"))], { hk: "2izoLi" });
	}
	static moveTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("可考虑邀请 {name} 补入本车", [fbs._param("name", pv(p, "name"))], { hk: "2woXyi" });
	}
	static reasonRoleNeeded(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("补齐所缺职责：{role}", [fbs._param("role", pv(p, "role"))], { hk: "3MdDwg" });
	}
	static reasonRoleCovered(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("职责 {role} 已有覆盖", [fbs._param("role", pv(p, "role"))], { hk: "336qoy" });
	}
	static reasonRoleFlex(fbs: FbsRuntime) {
		return fbs._("职责灵活，可补任意位置", null, { hk: "VwhVH" });
	}
	static reasonRoleMatch(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("职责与空缺一致：{role}", [fbs._param("role", pv(p, "role"))], { hk: "2Mil9E" });
	}
	static reasonRoleOther(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("职责为 {role}，与空缺不同", [fbs._param("role", pv(p, "role"))], { hk: "3A4UEb" });
	}
	static reasonRoleUnknown(fbs: FbsRuntime) {
		return fbs._("暂无职责记录", null, { hk: "4xpCSQ" });
	}
	static reasonGearReady(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("装备库已有 {count} 件装备", [fbs._param("count", pv(p, "count"))], { hk: "TiVZs" });
	}
	static reasonGearUnknown(fbs: FbsRuntime) {
		return fbs._("装备库暂无记录", null, { hk: "oE7pj" });
	}
	static reasonReliable(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("历史就位率 {rate}%（参加 {count} 次）", [fbs._param("rate", pv(p, "rate")), fbs._param("count", pv(p, "count"))], { hk: "2ogJTY" });
	}
	static reasonNoHistory(fbs: FbsRuntime) {
		return fbs._("暂无历史参与记录，按中性评估", null, { hk: "4qkPDf" });
	}
	static reasonAvailable(fbs: FbsRuntime) {
		return fbs._("该时段在其可用时间内", null, { hk: "2e6aHT" });
	}
	static reasonUnavailable(fbs: FbsRuntime) {
		return fbs._("该时段不在其可用时间内", null, { hk: "3EotBB" });
	}
	static reasonAvailabilityUnknown(fbs: FbsRuntime) {
		return fbs._("未填写可用时间", null, { hk: "3B8zj3" });
	}
	static reasonLongestWaiting(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("距上次参与已 {days} 天", [fbs._param("days", pv(p, "days"))], { hk: "3S4R1H" });
	}
	static reasonFewRecent(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("近期参与 {count} 次", [fbs._param("count", pv(p, "count"))], { hk: "1sycAb" });
	}
	static reasonNoConflict(fbs: FbsRuntime) {
		return fbs._("同时段没有其他车冲突", null, { hk: "1ZXNcV" });
	}
}
export abstract class RecapFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("AI 活动复盘", null, { hk: "2LbLN6" });
	}
	static lockedTitle(fbs: FbsRuntime) {
		return fbs._("AI 复盘 · 高阶档专属", null, { hk: "1SxbNI" });
	}
	static lockedBody(fbs: FbsRuntime) {
		return fbs._("AI 活动复盘是高阶订阅档功能：为每场完成的车队生成出席、就位与成绩小结，帮车头与军官快速回顾这一场。", null, { hk: "1TXDcb" });
	}
	static notEnabledTitle(fbs: FbsRuntime) {
		return fbs._("AI 复盘尚未开启", null, { hk: "xcXfB" });
	}
	static notEnabledBody(fbs: FbsRuntime) {
		return fbs._("平台尚未开启 AI 复盘服务，功能上线后，完成的车队可在此生成复盘。", null, { hk: "l5cem" });
	}
	static emptyNotCompletedBody(fbs: FbsRuntime) {
		return fbs._("车队完成后，车头或百业管理员可在此生成 AI 复盘。", null, { hk: "XbYR7" });
	}
	static emptyNoRecapBody(fbs: FbsRuntime) {
		return fbs._("本场车队还没有复盘。生成后，复盘将展示在这里，全车队成员可见。", null, { hk: "2Iqcmz" });
	}
	static generateLabel(fbs: FbsRuntime) {
		return fbs._("生成复盘", null, { hk: "3LSh2E" });
	}
	static regenerateLabel(fbs: FbsRuntime) {
		return fbs._("重新生成", null, { hk: "3L4e2r" });
	}
	static generatingLabel(fbs: FbsRuntime) {
		return fbs._("生成中…", null, { hk: "3Sivnf" });
	}
	static generateConfirmTitle(fbs: FbsRuntime) {
		return fbs._("生成 AI 复盘？", null, { hk: "3wUwks" });
	}
	static generateConfirmMessage(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("将为「{title}」生成 AI 复盘，内容基于本场车的报名、就位与成绩数据。", [fbs._param("title", pv(p, "title"))], { hk: "yAvv1" });
	}
	static toastGenerated(fbs: FbsRuntime) {
		return fbs._("复盘已生成", null, { hk: "17z5j6" });
	}
	static toastGenerateFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("复盘生成失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "3BDFCl" });
	}
	static generatedAt(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("生成于 {time}", [fbs._param("time", pv(p, "time"))], { hk: "2nhnLa" });
	}
	static providerText(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("由 {provider} 生成", [fbs._param("provider", pv(p, "provider"))], { hk: "To7kF" });
	}
	static versionText(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("第 {version} 版", [fbs._param("version", pv(p, "version"))], { hk: "Bg9tL" });
	}
	static failedHint(fbs: FbsRuntime) {
		return fbs._("上次生成失败，可重试；下方仍是此前生成的复盘。", null, { hk: "CwHhs" });
	}
	static failedHintEmpty(fbs: FbsRuntime) {
		return fbs._("上次生成失败，可重试。", null, { hk: "1SCJES" });
	}
	static summaryAttendance(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("出席 {seated}/{capacity} 人", [fbs._param("seated", pv(p, "seated")), fbs._param("capacity", pv(p, "capacity"))], { hk: "2uNBPn" });
	}
	static summaryReady(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("就位 {ready}/{seated} 人", [fbs._param("ready", pv(p, "ready")), fbs._param("seated", pv(p, "seated"))], { hk: "17v3Fe" });
	}
	static summaryResults(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("竞速成绩 {count} 条 · 最佳 {best}", [fbs._param("count", pv(p, "count")), fbs._param("best", pv(p, "best"))], { hk: "2XuMwQ" });
	}
	static adminTabLabel(fbs: FbsRuntime) {
		return fbs._("复盘", null, { hk: "3J9wFJ" });
	}
	static adminTitle(fbs: FbsRuntime) {
		return fbs._("AI 复盘记录", null, { hk: "1brAVk" });
	}
	static adminEmptyText(fbs: FbsRuntime) {
		return fbs._("暂无复盘记录。在已完成车队的详情页生成复盘后，会在这里汇总。", null, { hk: "3GKag4" });
	}
	static adminStatusReadyText(fbs: FbsRuntime) {
		return fbs._("已生成", null, { hk: "kUUwn" });
	}
	static adminStatusFailedText(fbs: FbsRuntime) {
		return fbs._("生成失败", null, { hk: "4xpD5C" });
	}
	static adminParagraphCount(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{count} 段", [fbs._param("count", pv(p, "count"))], { hk: "41Gi64" });
	}
}
export abstract class CombatReportFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("战斗报告", null, { hk: "4vbcmj" });
	}
	static lockedTitle(fbs: FbsRuntime) {
		return fbs._("战斗报告 · 订阅专属", null, { hk: "hczwK" });
	}
	static lockedBody(fbs: FbsRuntime) {
		return fbs._("战斗报告是进阶订阅档（执事起）功能：导入一场的战斗事件文件后，生成技能构成、增益覆盖时间轴与 rDPS 归因表，帮全车看清每一份伤害的来历。", null, { hk: "23SyAC" });
	}
	static emptyBody(fbs: FbsRuntime) {
		return fbs._("本场车队还没有战斗报告。车队成员导入一场战斗的事件文件后，报告将展示在这里，全车队成员可见。", null, { hk: "3xJ4FC" });
	}
	static failedHint(fbs: FbsRuntime) {
		return fbs._("上次导入处理失败，可重新导入；已经生成的报告不受影响。", null, { hk: "1Lc8gQ" });
	}
	static encountersTitle(fbs: FbsRuntime) {
		return fbs._("场次", null, { hk: "4rwHWD" });
	}
	static viewReportLabel(fbs: FbsRuntime) {
		return fbs._("查看完整报告", null, { hk: "3oIhJd" });
	}
	static resultKill(fbs: FbsRuntime) {
		return fbs._("击杀", null, { hk: "2SYMmW" });
	}
	static resultWipe(fbs: FbsRuntime) {
		return fbs._("团灭", null, { hk: "1pelcm" });
	}
	static resultUnknown(fbs: FbsRuntime) {
		return fbs._("结果未记录", null, { hk: "a3U4I" });
	}
	static bossFallback(fbs: FbsRuntime) {
		return fbs._("未知目标", null, { hk: "84B4L" });
	}
	static summaryTeam(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("全队总伤 {total} · 秒伤 {dps}", [fbs._param("total", pv(p, "total")), fbs._param("dps", pv(p, "dps"))], { hk: "2iDUV5" });
	}
	static summaryDuration(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("战斗时长 {duration}", [fbs._param("duration", pv(p, "duration"))], { hk: "2KzORg" });
	}
	static summaryPlayers(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("参战 {count} 人", [fbs._param("count", pv(p, "count"))], { hk: "4y9EEo" });
	}
	static summarySourceEvents(fbs: FbsRuntime) {
		return fbs._("数据来源：战斗事件文件", null, { hk: "5UQVx" });
	}
	static summarySourceOverlay(fbs: FbsRuntime) {
		return fbs._("数据来源：屏幕视觉记录（官方团队面板口径）", null, { hk: "3CcCkM" });
	}
	static qualityUnclosed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("数据提示：{count} 处增益区间未正常关闭，已按战斗结束时刻收口", [fbs._param("count", pv(p, "count"))], { hk: "3icT0x" });
	}
	static modelVersionText(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("归因模型 v{version}", [fbs._param("version", pv(p, "version"))], { hk: "2ZAy9q" });
	}
	static startedAtText(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("开场于 {time}", [fbs._param("time", pv(p, "time"))], { hk: "1bssDz" });
	}
	static importedAtText(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("导入于 {time}", [fbs._param("time", pv(p, "time"))], { hk: "1wMU72" });
	}
	static uploaderText(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("由 {name} 导入", [fbs._param("name", pv(p, "name"))], { hk: "eMSoe" });
	}
	static guestTag(fbs: FbsRuntime) {
		return fbs._("访客", null, { hk: "4kR7ro" });
	}
	static multiplierUndetermined(fbs: FbsRuntime) {
		return fbs._("倍率未定", null, { hk: "4dXI0S" });
	}
	static applierSystem(fbs: FbsRuntime) {
		return fbs._("系统", null, { hk: "2sfSop" });
	}
	static panelSkillLabel(fbs: FbsRuntime) {
		return fbs._("面板伤害", null, { hk: "3oPTU" });
	}
	static unnamedCast(fbs: FbsRuntime) {
		return fbs._("未命名技能", null, { hk: "HJFGo" });
	}
	static importLabel(fbs: FbsRuntime) {
		return fbs._("导入战斗报告", null, { hk: "pNl1K" });
	}
	static importingLabel(fbs: FbsRuntime) {
		return fbs._("导入中…", null, { hk: "4oIZwR" });
	}
	static importHint(fbs: FbsRuntime) {
		return fbs._("选择一场战斗的事件文件（JSON）或 overlay 会话导出，导入后全车队可见。", null, { hk: "1x7QYt" });
	}
	static toastImported(fbs: FbsRuntime) {
		return fbs._("战斗报告已导入", null, { hk: "4cgNKv" });
	}
	static toastImportFailedTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("导入失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "2h23Tu" });
	}
	static importErrorFormat(fbs: FbsRuntime) {
		return fbs._("文件格式版本不受支持", null, { hk: "1SC8YS" });
	}
	static importErrorValidation(fbs: FbsRuntime) {
		return fbs._("文件内容校验未通过", null, { hk: "4BfqBj" });
	}
	static importErrorLimit(fbs: FbsRuntime) {
		return fbs._("今日导入次数已达上限", null, { hk: "2gtfpW" });
	}
	static importErrorForbidden(fbs: FbsRuntime) {
		return fbs._("没有导入权限", null, { hk: "w5eV8" });
	}
	static importErrorNotFound(fbs: FbsRuntime) {
		return fbs._("车队不存在", null, { hk: "3wxcWX" });
	}
	static importErrorTier(fbs: FbsRuntime) {
		return fbs._("本百业尚未开通战斗报告", null, { hk: "w3F2s" });
	}
	static deleteLabel(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "1DPDde" });
	}
	static deleteConfirmTitle(fbs: FbsRuntime) {
		return fbs._("删除这场战斗报告？", null, { hk: "4dbJyv" });
	}
	static deleteConfirmMessageTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("将删除「{boss}」的这场战斗报告，删除后不可恢复。", [fbs._param("boss", pv(p, "boss"))], { hk: "1Zr1qI" });
	}
	static toastDeleted(fbs: FbsRuntime) {
		return fbs._("已删除", null, { hk: "uippr" });
	}
	static toastDeleteFailedTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("删除失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "2b4wGl" });
	}
	static tabOverviewLabel(fbs: FbsRuntime) {
		return fbs._("总览", null, { hk: "1AvtSc" });
	}
	static tabDamageLabel(fbs: FbsRuntime) {
		return fbs._("伤害", null, { hk: "MJgw8" });
	}
	static tabBuffsLabel(fbs: FbsRuntime) {
		return fbs._("增益", null, { hk: "1rtgl2" });
	}
	static tabCastsLabel(fbs: FbsRuntime) {
		return fbs._("施法", null, { hk: "1CG1Vt" });
	}
	static tabTimelineLabel(fbs: FbsRuntime) {
		return fbs._("时间线", null, { hk: "3PlFMP" });
	}
	static backLabel(fbs: FbsRuntime) {
		return fbs._("返回车队", null, { hk: "3LqirH" });
	}
	static colPlayer(fbs: FbsRuntime) {
		return fbs._("玩家", null, { hk: "3pE1Es" });
	}
	static colTotal(fbs: FbsRuntime) {
		return fbs._("总量", null, { hk: "3jhATH" });
	}
	static colActivity(fbs: FbsRuntime) {
		return fbs._("活跃", null, { hk: "186Mos" });
	}
	static colDps(fbs: FbsRuntime) {
		return fbs._("秒伤", null, { hk: "3gUvAy" });
	}
	static colRdps(fbs: FbsRuntime) {
		return fbs._("rDPS", null, { hk: "2eiDbs" });
	}
	static colRShare(fbs: FbsRuntime) {
		return fbs._("rDPS 占比", null, { hk: "4qTEi8" });
	}
	static colSkill(fbs: FbsRuntime) {
		return fbs._("技能", null, { hk: "MREHM" });
	}
	static colCasts(fbs: FbsRuntime) {
		return fbs._("次数", null, { hk: "3SwWrX" });
	}
	static colHits(fbs: FbsRuntime) {
		return fbs._("命中", null, { hk: "m4R6k" });
	}
	static colAvg(fbs: FbsRuntime) {
		return fbs._("平均", null, { hk: "2P7Vbd" });
	}
	static colCrit(fbs: FbsRuntime) {
		return fbs._("会心", null, { hk: "1erFAJ" });
	}
	static colSpec(fbs: FbsRuntime) {
		return fbs._("会意", null, { hk: "3T74YN" });
	}
	static colMax(fbs: FbsRuntime) {
		return fbs._("最高", null, { hk: "sv94Q" });
	}
	static colShare(fbs: FbsRuntime) {
		return fbs._("占比", null, { hk: "2WwQGX" });
	}
	static colBuff(fbs: FbsRuntime) {
		return fbs._("增益", null, { hk: "21OxrN" });
	}
	static colApplier(fbs: FbsRuntime) {
		return fbs._("施加者", null, { hk: "34j9Kw" });
	}
	static colTarget(fbs: FbsRuntime) {
		return fbs._("目标", null, { hk: "3zatpm" });
	}
	static colUptime(fbs: FbsRuntime) {
		return fbs._("覆盖率", null, { hk: "368sUu" });
	}
	static colTime(fbs: FbsRuntime) {
		return fbs._("时刻", null, { hk: "4rJXvV" });
	}
	static activityNote(fbs: FbsRuntime) {
		return fbs._("活跃口径：以 1 秒为格，玩家在格内有施法、命中或施加增益事件即记为活跃。", null, { hk: "4p3KL8" });
	}
	static rdpsNote(fbs: FbsRuntime) {
		return fbs._("rDPS 口径：增益带来的额外伤害按各增益倍率的对数权重归还施加者；系统增益留在受益者名下，全队 rDPS 与总伤守恒。", null, { hk: "36TmqP" });
	}
	static castsLocalTitle(fbs: FbsRuntime) {
		return fbs._("本地施法记录", null, { hk: "2qV5v0" });
	}
	static timelineTitle(fbs: FbsRuntime) {
		return fbs._("每秒全队伤害", null, { hk: "1m3nwh" });
	}
	static adminTabLabel(fbs: FbsRuntime) {
		return fbs._("战斗报告", null, { hk: "477lHT" });
	}
	static adminTitle(fbs: FbsRuntime) {
		return fbs._("战斗报告记录", null, { hk: "3QlgEO" });
	}
	static adminEmptyText(fbs: FbsRuntime) {
		return fbs._("暂无战斗报告记录。车队成员导入战斗报告后，会在这里汇总。", null, { hk: "1he6sk" });
	}
	static adminStatusParsedText(fbs: FbsRuntime) {
		return fbs._("已生成", null, { hk: "15LNI0" });
	}
	static adminStatusFailedText(fbs: FbsRuntime) {
		return fbs._("处理失败", null, { hk: "x42Ne" });
	}
}
export abstract class AgentFbtUtils {
	static consentTitle(fbs: FbsRuntime) {
		return fbs._("授权 Agent 访问", null, { hk: "2CyHNh" });
	}
	static consentIntro(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{clientName} 希望以你的身份连接燕云百业。", [fbs._param("clientName", pv(p, "clientName"))], { hk: "1ddfJt" });
	}
	static consentIdentity(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("授权将绑定到你的 Discord 账号：{name}", [fbs._param("name", pv(p, "name"))], { hk: "XbliS" });
	}
	static consentScopeTitle(fbs: FbsRuntime) {
		return fbs._("同意后，该 Agent 将能够：", null, { hk: "1tdkpY" });
	}
	static consentScopeRead(fbs: FbsRuntime) {
		return fbs._("查看你能看到的百业车队、名册与图鉴，并使用调律、毕业率计算", null, { hk: "1b5tBb" });
	}
	static consentScopeSignup(fbs: FbsRuntime) {
		return fbs._("以你的身份报名、退报、调整就位状态——只能操作你自己的座位，不能代他人报名，也不能管理车队", null, { hk: "2FRWAm" });
	}
	static consentScopeCreate(fbs: FbsRuntime) {
		return fbs._("以你的身份创建由你带队的车队——只能新建你自己的车，不能编辑、合并、解散或完成他人的车队", null, { hk: "1AYDHH" });
	}
	static consentApprove(fbs: FbsRuntime) {
		return fbs._("同意授权", null, { hk: "1RlFsD" });
	}
	static consentDeny(fbs: FbsRuntime) {
		return fbs._("拒绝", null, { hk: "3fXEof" });
	}
	static consentErrorTitle(fbs: FbsRuntime) {
		return fbs._("授权请求无效", null, { hk: "4mz133" });
	}
	static consentErrorBody(fbs: FbsRuntime) {
		return fbs._("这个授权请求缺少必要参数或已失效，请回到你的 Agent 重新发起。", null, { hk: "24SXkc" });
	}
	static sectionTitle(fbs: FbsRuntime) {
		return fbs._("我的 Agent 授权", null, { hk: "4hl3sZ" });
	}
	static hint(fbs: FbsRuntime) {
		return fbs._("通过 OAuth 授权给 Agent（如 Muse）的访问权会列在这里。吊销后，该 Agent 的访问与刷新令牌立即失效。", null, { hk: "4tr8CE" });
	}
	static emptyText(fbs: FbsRuntime) {
		return fbs._("还没有授权任何 Agent。", null, { hk: "unELY" });
	}
	static scopesReadLabel(fbs: FbsRuntime) {
		return fbs._("只读", null, { hk: "4kpnLD" });
	}
	static scopesSignupLabel(fbs: FbsRuntime) {
		return fbs._("只读 + 报名", null, { hk: "4fsQ0e" });
	}
	static scopesCreateLabel(fbs: FbsRuntime) {
		return fbs._("只读 + 建车", null, { hk: "4q0c5Q" });
	}
	static scopesSignupCreateLabel(fbs: FbsRuntime) {
		return fbs._("只读 + 报名 + 建车", null, { hk: "CbqCG" });
	}
	static sourceOauthLabel(fbs: FbsRuntime) {
		return fbs._("OAuth 授权", null, { hk: "30nA5N" });
	}
	static createdTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("授权于 {date}", [fbs._param("date", pv(p, "date"))], { hk: "4ry54k" });
	}
	static lastUsedTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("最近使用：{date}", [fbs._param("date", pv(p, "date"))], { hk: "46GPdI" });
	}
	static neverUsedText(fbs: FbsRuntime) {
		return fbs._("尚未使用", null, { hk: "2s1AtK" });
	}
	static revokeLabel(fbs: FbsRuntime) {
		return fbs._("吊销", null, { hk: "1KnVQO" });
	}
	static revokeDoneText(fbs: FbsRuntime) {
		return fbs._("已吊销。", null, { hk: "2uV6a5" });
	}
}
export const STRING_FNS: Record<string, StringFn> = {
	"common_cancel": CommonFbtUtils.cancel,
	"common_confirm": CommonFbtUtils.confirm,
	"common_unknownError": CommonFbtUtils.unknownError,
	"common_renderError": CommonFbtUtils.renderError,
	"common_renderErrorHint": CommonFbtUtils.renderErrorHint,
	"common_backToHub": CommonFbtUtils.backToHub,
	"common_loadingGuild": CommonFbtUtils.loadingGuild,
	"common_close": CommonFbtUtils.close,
	"site_title": SiteFbtUtils.title,
	"site_subtitle": SiteFbtUtils.subtitle,
	"site_heroAlt": SiteFbtUtils.heroAlt,
	"site_seal": SiteFbtUtils.seal,
	"login_cardTitle": LoginFbtUtils.cardTitle,
	"login_cardBody1": LoginFbtUtils.cardBody1,
	"login_cardBody2": LoginFbtUtils.cardBody2,
	"login_button": LoginFbtUtils.button,
	"login_privacy": LoginFbtUtils.privacy,
	"userBar_logout": UserBarFbtUtils.logout,
	"userBar_loggingOut": UserBarFbtUtils.loggingOut,
	"userBar_settings": UserBarFbtUtils.settings,
	"settings_title": SettingsFbtUtils.title,
	"settings_discordLabel": SettingsFbtUtils.discordLabel,
	"settings_languageLabel": SettingsFbtUtils.languageLabel,
	"settings_languageHint": SettingsFbtUtils.languageHint,
	"settings_autoLabel": SettingsFbtUtils.autoLabel,
	"settings_langZhCn": SettingsFbtUtils.langZhCn,
	"settings_langZhTw": SettingsFbtUtils.langZhTw,
	"settings_langEn": SettingsFbtUtils.langEn,
	"settings_langEs": SettingsFbtUtils.langEs,
	"settings_langFr": SettingsFbtUtils.langFr,
	"settings_savedText": SettingsFbtUtils.savedText,
	"settings_calendarSectionTitle": SettingsFbtUtils.calendarSectionTitle,
	"settings_calendarHint": SettingsFbtUtils.calendarHint,
	"settings_calendarCopyLabel": SettingsFbtUtils.calendarCopyLabel,
	"settings_calendarCopiedText": SettingsFbtUtils.calendarCopiedText,
	"settings_calendarResetLabel": SettingsFbtUtils.calendarResetLabel,
	"settings_calendarResetDoneText": SettingsFbtUtils.calendarResetDoneText,
	"settings_calendarName": SettingsFbtUtils.calendarName,
	"settings_calendarDurationNote": SettingsFbtUtils.calendarDurationNote,
	"picker_myGuilds": PickerFbtUtils.myGuilds,
	"picker_myGuildsEn": PickerFbtUtils.myGuildsEn,
	"picker_emptyTitle": PickerFbtUtils.emptyTitle,
	"picker_emptyBody": PickerFbtUtils.emptyBody,
	"picker_createGuild": PickerFbtUtils.createGuild,
	"picker_createGuildMore": PickerFbtUtils.createGuildMore,
	"create_backLink": CreateFbtUtils.backLink,
	"create_title": CreateFbtUtils.title,
	"create_subtitle": CreateFbtUtils.subtitle,
	"create_nameLabel": CreateFbtUtils.nameLabel,
	"create_namePlaceholder": CreateFbtUtils.namePlaceholder,
	"create_slugLabel": CreateFbtUtils.slugLabel,
	"create_slugPlaceholder": CreateFbtUtils.slugPlaceholder,
	"create_slugChecking": CreateFbtUtils.slugChecking,
	"create_slugAvailable": CreateFbtUtils.slugAvailable,
	"create_slugTaken": CreateFbtUtils.slugTaken,
	"create_slugNote": CreateFbtUtils.slugNote,
	"create_serverLabel": CreateFbtUtils.serverLabel,
	"create_noServers1": CreateFbtUtils.noServers1,
	"create_noServers2": CreateFbtUtils.noServers2,
	"create_submit": CreateFbtUtils.submit,
	"create_submitting": CreateFbtUtils.submitting,
	"create_toastNameShort": CreateFbtUtils.toastNameShort,
	"create_toastSlugRequired": CreateFbtUtils.toastSlugRequired,
	"create_toastSlugBad": CreateFbtUtils.toastSlugBad,
	"create_toastServerRequired": CreateFbtUtils.toastServerRequired,
	"create_toastCreated": CreateFbtUtils.toastCreated,
	"create_toastFailed": CreateFbtUtils.toastFailed,
	"guildHome_backToHub": GuildHomeFbtUtils.backToHub,
	"guildHome_backPlain": GuildHomeFbtUtils.backPlain,
	"guildHome_tabTeam": GuildHomeFbtUtils.tabTeam,
	"guildHome_tabDex": GuildHomeFbtUtils.tabDex,
	"guildHome_tabSect": GuildHomeFbtUtils.tabSect,
	"guildHome_tabAnnouncements": GuildHomeFbtUtils.tabAnnouncements,
	"guildHome_adminLink": GuildHomeFbtUtils.adminLink,
	"guildHome_tabSchedule": GuildHomeFbtUtils.tabSchedule,
	"guildHome_tabMarket": GuildHomeFbtUtils.tabMarket,
	"guildHome_tabAllies": GuildHomeFbtUtils.tabAllies,
	"groupingType_tabActivity": GroupingTypeFbtUtils.tabActivity,
	"groupingType_tabTalent": GroupingTypeFbtUtils.tabTalent,
	"groupingType_tabRace": GroupingTypeFbtUtils.tabRace,
	"groupingType_tabTower": GroupingTypeFbtUtils.tabTower,
	"groupingType_tabExplore": GroupingTypeFbtUtils.tabExplore,
	"groupingType_shortActivity": GroupingTypeFbtUtils.shortActivity,
	"groupingType_shortTalent": GroupingTypeFbtUtils.shortTalent,
	"groupingType_shortRace": GroupingTypeFbtUtils.shortRace,
	"groupingType_shortTower": GroupingTypeFbtUtils.shortTower,
	"groupingType_shortCoopExplore": GroupingTypeFbtUtils.shortCoopExplore,
	"groupingType_shortGather": GroupingTypeFbtUtils.shortGather,
	"groupingType_shortExplore": GroupingTypeFbtUtils.shortExplore,
	"groupingList_weekShareImageLabel": GroupingListFbtUtils.weekShareImageLabel,
	"groupingList_weekShareText": GroupingListFbtUtils.weekShareText,
	"groupingList_weekShareImageSaved": GroupingListFbtUtils.weekShareImageSaved,
	"groupingList_weekShareImageCopied": GroupingListFbtUtils.weekShareImageCopied,
	"groupingList_weekShareImageFailed": GroupingListFbtUtils.weekShareImageFailed,
	"groupingList_weekCopyFailedManual": GroupingListFbtUtils.weekCopyFailedManual,
	"groupingList_prevWeek": GroupingListFbtUtils.prevWeek,
	"groupingList_nextWeek": GroupingListFbtUtils.nextWeek,
	"groupingList_weekHeader": GroupingListFbtUtils.weekHeader,
	"groupingList_emptyInteractive": GroupingListFbtUtils.emptyInteractive,
	"groupingList_statusOpen": GroupingListFbtUtils.statusOpen,
	"groupingList_people": GroupingListFbtUtils.people,
	"groupingList_newCar": GroupingListFbtUtils.newCar,
	"groupingList_seal": GroupingListFbtUtils.seal,
	"groupingList_dayGroupHeader": GroupingListFbtUtils.dayGroupHeader,
	"groupingList_weekday0": GroupingListFbtUtils.weekday0,
	"groupingList_weekday1": GroupingListFbtUtils.weekday1,
	"groupingList_weekday2": GroupingListFbtUtils.weekday2,
	"groupingList_weekday3": GroupingListFbtUtils.weekday3,
	"groupingList_weekday4": GroupingListFbtUtils.weekday4,
	"groupingList_weekday5": GroupingListFbtUtils.weekday5,
	"groupingList_weekday6": GroupingListFbtUtils.weekday6,
	"groupingList_undatedGroup": GroupingListFbtUtils.undatedGroup,
	"groupingDetail_notFound": GroupingDetailFbtUtils.notFound,
	"groupingDetail_backToList": GroupingDetailFbtUtils.backToList,
	"groupingDetail_share": GroupingDetailFbtUtils.share,
	"groupingDetail_shareImage": GroupingDetailFbtUtils.shareImage,
	"groupingDetail_shareImageSaved": GroupingDetailFbtUtils.shareImageSaved,
	"groupingDetail_shareImageCopied": GroupingDetailFbtUtils.shareImageCopied,
	"groupingDetail_shareImageFailed": GroupingDetailFbtUtils.shareImageFailed,
	"groupingDetail_edit": GroupingDetailFbtUtils.edit,
	"groupingDetail_disband": GroupingDetailFbtUtils.disband,
	"groupingDetail_disbanding": GroupingDetailFbtUtils.disbanding,
	"groupingDetail_statusOpen": GroupingDetailFbtUtils.statusOpen,
	"groupingDetail_people": GroupingDetailFbtUtils.people,
	"groupingDetail_readyProgress": GroupingDetailFbtUtils.readyProgress,
	"groupingDetail_openHint": GroupingDetailFbtUtils.openHint,
	"groupingDetail_toastDisbanded": GroupingDetailFbtUtils.toastDisbanded,
	"groupingDetail_toastDisbandFailed": GroupingDetailFbtUtils.toastDisbandFailed,
	"groupingDetail_linkCopied": GroupingDetailFbtUtils.linkCopied,
	"groupingDetail_copyFailedManual": GroupingDetailFbtUtils.copyFailedManual,
	"groupingDetail_disbandConfirmTitle": GroupingDetailFbtUtils.disbandConfirmTitle,
	"groupingDetail_disbandConfirmMessage": GroupingDetailFbtUtils.disbandConfirmMessage,
	"groupingDetail_complete": GroupingDetailFbtUtils.complete,
	"groupingDetail_completing": GroupingDetailFbtUtils.completing,
	"groupingDetail_statusCompleted": GroupingDetailFbtUtils.statusCompleted,
	"groupingDetail_restore": GroupingDetailFbtUtils.restore,
	"groupingDetail_completeConfirmTitle": GroupingDetailFbtUtils.completeConfirmTitle,
	"groupingDetail_completeConfirmMessage": GroupingDetailFbtUtils.completeConfirmMessage,
	"groupingDetail_toastCompleted": GroupingDetailFbtUtils.toastCompleted,
	"groupingDetail_toastCompleteFailed": GroupingDetailFbtUtils.toastCompleteFailed,
	"groupingDetail_toastRestored": GroupingDetailFbtUtils.toastRestored,
	"groupingDetail_toastRestoreFailed": GroupingDetailFbtUtils.toastRestoreFailed,
	"groupingDetail_completedHint": GroupingDetailFbtUtils.completedHint,
	"groupingDetail_rosterAnswersTitle": GroupingDetailFbtUtils.rosterAnswersTitle,
	"groupingDetail_merge": GroupingDetailFbtUtils.merge,
	"groupingDetail_mergeDialogTitle": GroupingDetailFbtUtils.mergeDialogTitle,
	"groupingDetail_mergeEmpty": GroupingDetailFbtUtils.mergeEmpty,
	"groupingDetail_mergeConfirmTitle": GroupingDetailFbtUtils.mergeConfirmTitle,
	"groupingDetail_mergeConfirmMessage": GroupingDetailFbtUtils.mergeConfirmMessage,
	"groupingDetail_mergeConfirmSubmit": GroupingDetailFbtUtils.mergeConfirmSubmit,
	"groupingDetail_toastMerged": GroupingDetailFbtUtils.toastMerged,
	"groupingDetail_toastMergeFailed": GroupingDetailFbtUtils.toastMergeFailed,
	"groupingDetail_cloneButton": GroupingDetailFbtUtils.cloneButton,
	"groupingDetail_cloneDialogTitle": GroupingDetailFbtUtils.cloneDialogTitle,
	"groupingDetail_cloneToastCloned": GroupingDetailFbtUtils.cloneToastCloned,
	"groupingDetail_cloneToastFailed": GroupingDetailFbtUtils.cloneToastFailed,
	"groupingDetail_cloneToastSkipped": GroupingDetailFbtUtils.cloneToastSkipped,
	"groupingDetail_nudgeButton": GroupingDetailFbtUtils.nudgeButton,
	"groupingDetail_nudgeDialogTitle": GroupingDetailFbtUtils.nudgeDialogTitle,
	"groupingDetail_nudgeHintText": GroupingDetailFbtUtils.nudgeHintText,
	"groupingDetail_nudgeMessage": GroupingDetailFbtUtils.nudgeMessage,
	"groupingDetail_nudgeMessageNoTime": GroupingDetailFbtUtils.nudgeMessageNoTime,
	"groupingDetail_nudgeEmptyText": GroupingDetailFbtUtils.nudgeEmptyText,
	"groupingDetail_nudgeCopyLabel": GroupingDetailFbtUtils.nudgeCopyLabel,
	"groupingDetail_nudgeCopiedToast": GroupingDetailFbtUtils.nudgeCopiedToast,
	"groupingForm_createTitle": GroupingFormFbtUtils.createTitle,
	"groupingForm_editTitle": GroupingFormFbtUtils.editTitle,
	"groupingForm_typeLabel": GroupingFormFbtUtils.typeLabel,
	"groupingForm_capacity": GroupingFormFbtUtils.capacity,
	"groupingForm_hintActivity": GroupingFormFbtUtils.hintActivity,
	"groupingForm_hintDungeon": GroupingFormFbtUtils.hintDungeon,
	"groupingForm_hintTalent": GroupingFormFbtUtils.hintTalent,
	"groupingForm_hintRace": GroupingFormFbtUtils.hintRace,
	"groupingForm_hintTower": GroupingFormFbtUtils.hintTower,
	"groupingForm_hintExplore": GroupingFormFbtUtils.hintExplore,
	"groupingForm_sizeLabel": GroupingFormFbtUtils.sizeLabel,
	"groupingForm_sizeOption": GroupingFormFbtUtils.sizeOption,
	"groupingForm_titleLabel": GroupingFormFbtUtils.titleLabel,
	"groupingForm_titlePlaceholder": GroupingFormFbtUtils.titlePlaceholder,
	"groupingForm_startsLabel": GroupingFormFbtUtils.startsLabel,
	"groupingForm_monthOption": GroupingFormFbtUtils.monthOption,
	"groupingForm_dayOption": GroupingFormFbtUtils.dayOption,
	"groupingForm_hourOption": GroupingFormFbtUtils.hourOption,
	"groupingForm_minuteOption": GroupingFormFbtUtils.minuteOption,
	"groupingForm_tzEastLabel": GroupingFormFbtUtils.tzEastLabel,
	"groupingForm_tzWestLabel": GroupingFormFbtUtils.tzWestLabel,
	"groupingForm_tzEcho": GroupingFormFbtUtils.tzEcho,
	"groupingForm_dungeonLabel": GroupingFormFbtUtils.dungeonLabel,
	"groupingForm_dungeonNone": GroupingFormFbtUtils.dungeonNone,
	"groupingForm_nicknameLabel": GroupingFormFbtUtils.nicknameLabel,
	"groupingForm_nicknamePlaceholder": GroupingFormFbtUtils.nicknamePlaceholder,
	"groupingForm_sectLabel": GroupingFormFbtUtils.sectLabel,
	"groupingForm_submitCreate": GroupingFormFbtUtils.submitCreate,
	"groupingForm_submitEdit": GroupingFormFbtUtils.submitEdit,
	"groupingForm_submitting": GroupingFormFbtUtils.submitting,
	"groupingForm_toastSect": GroupingFormFbtUtils.toastSect,
	"groupingForm_toastSaved": GroupingFormFbtUtils.toastSaved,
	"groupingForm_toastSaveFailed": GroupingFormFbtUtils.toastSaveFailed,
	"groupingForm_toastPosted": GroupingFormFbtUtils.toastPosted,
	"groupingForm_toastCreateFailed": GroupingFormFbtUtils.toastCreateFailed,
	"groupingForm_titleTemplate": GroupingFormFbtUtils.titleTemplate,
	"groupingForm_customFieldsTitle": GroupingFormFbtUtils.customFieldsTitle,
	"groupingForm_customFieldAddLabel": GroupingFormFbtUtils.customFieldAddLabel,
	"groupingForm_customFieldLabelPlaceholder": GroupingFormFbtUtils.customFieldLabelPlaceholder,
	"groupingForm_customFieldTypeText": GroupingFormFbtUtils.customFieldTypeText,
	"groupingForm_customFieldTypeChoice": GroupingFormFbtUtils.customFieldTypeChoice,
	"groupingForm_customFieldOptionsPlaceholder": GroupingFormFbtUtils.customFieldOptionsPlaceholder,
	"groupingForm_customFieldRequiredLabel": GroupingFormFbtUtils.customFieldRequiredLabel,
	"groupingForm_customFieldRemoveLabel": GroupingFormFbtUtils.customFieldRemoveLabel,
	"groupingForm_customFieldEmptyText": GroupingFormFbtUtils.customFieldEmptyText,
	"seat_emptyJoin": SeatFbtUtils.emptyJoin,
	"seat_empty": SeatFbtUtils.empty,
	"seat_modalTitle": SeatFbtUtils.modalTitle,
	"seat_modalSubtitle": SeatFbtUtils.modalSubtitle,
	"seat_nameLabel": SeatFbtUtils.nameLabel,
	"seat_namePlaceholder": SeatFbtUtils.namePlaceholder,
	"seat_nameRequired": SeatFbtUtils.nameRequired,
	"seat_selfTab": SeatFbtUtils.selfTab,
	"seat_proxyTab": SeatFbtUtils.proxyTab,
	"seat_selfNameHint": SeatFbtUtils.selfNameHint,
	"seat_proxySearchPlaceholder": SeatFbtUtils.proxySearchPlaceholder,
	"seat_proxyPickRequired": SeatFbtUtils.proxyPickRequired,
	"seat_proxyEmpty": SeatFbtUtils.proxyEmpty,
	"seat_sectLabel": SeatFbtUtils.sectLabel,
	"seat_confirmJoin": SeatFbtUtils.confirmJoin,
	"seat_joining": SeatFbtUtils.joining,
	"seat_toastSect": SeatFbtUtils.toastSect,
	"seat_toastJoined": SeatFbtUtils.toastJoined,
	"seat_toastJoinFailed": SeatFbtUtils.toastJoinFailed,
	"seat_toastLeft": SeatFbtUtils.toastLeft,
	"seat_toastLeaveFailed": SeatFbtUtils.toastLeaveFailed,
	"seat_leaveConfirmTitle": SeatFbtUtils.leaveConfirmTitle,
	"seat_leaveConfirmMessage": SeatFbtUtils.leaveConfirmMessage,
	"seat_roleHealer": SeatFbtUtils.roleHealer,
	"seat_roleDps": SeatFbtUtils.roleDps,
	"seat_roleFlex": SeatFbtUtils.roleFlex,
	"seat_leader": SeatFbtUtils.leader,
	"seat_readyMark": SeatFbtUtils.readyMark,
	"seat_readyAction": SeatFbtUtils.readyAction,
	"seat_unreadyAction": SeatFbtUtils.unreadyAction,
	"seat_toastReady": SeatFbtUtils.toastReady,
	"seat_toastUnready": SeatFbtUtils.toastUnready,
	"seat_toastReadyFailed": SeatFbtUtils.toastReadyFailed,
	"appBlocks_rosterTitle": AppBlocksFbtUtils.rosterTitle,
	"appBlocks_closedStatus": AppBlocksFbtUtils.closedStatus,
	"appBlocks_completedStatus": AppBlocksFbtUtils.completedStatus,
	"appBlocks_unknownBlock": AppBlocksFbtUtils.unknownBlock,
	"dex_backToDex": DexFbtUtils.backToDex,
	"dex_bossesLine": DexFbtUtils.bossesLine,
	"dex_noBossData": DexFbtUtils.noBossData,
	"dex_empty": DexFbtUtils.empty,
	"dex_currentGuides": DexFbtUtils.currentGuides,
	"dex_catSub": DexFbtUtils.catSub,
	"dex_catSubCurrent": DexFbtUtils.catSubCurrent,
	"dex_size10": DexFbtUtils.size10,
	"dex_size5": DexFbtUtils.size5,
	"dex_sizeN": DexFbtUtils.sizeN,
	"dex_bossUnit": DexFbtUtils.bossUnit,
	"dex_partMechanics": DexFbtUtils.partMechanics,
	"dex_partShouts": DexFbtUtils.partShouts,
	"dex_partTalents": DexFbtUtils.partTalents,
	"dex_labelAll": DexFbtUtils.labelAll,
	"dex_labelParts": DexFbtUtils.labelParts,
	"dex_labelPending": DexFbtUtils.labelPending,
	"dex_labelNoBosses": DexFbtUtils.labelNoBosses,
	"dex_sealBoss": DexFbtUtils.sealBoss,
	"boss_back": BossFbtUtils.back,
	"boss_notFound": BossFbtUtils.notFound,
	"boss_tabMechanics": BossFbtUtils.tabMechanics,
	"boss_tabTalents": BossFbtUtils.tabTalents,
	"boss_shoutsTitle": BossFbtUtils.shoutsTitle,
	"boss_copy": BossFbtUtils.copy,
	"boss_shoutCopied": BossFbtUtils.shoutCopied,
	"boss_copyFailed": BossFbtUtils.copyFailed,
	"boss_copyManual": BossFbtUtils.copyManual,
	"boss_noMechanics": BossFbtUtils.noMechanics,
	"boss_noTalents": BossFbtUtils.noTalents,
	"boss_talentTitle": BossFbtUtils.talentTitle,
	"boss_talentPending": BossFbtUtils.talentPending,
	"sect_empty": SectFbtUtils.empty,
	"sect_back": SectFbtUtils.back,
	"sect_tabBis": SectFbtUtils.tabBis,
	"sect_tabRotation": SectFbtUtils.tabRotation,
	"sect_tabRates": SectFbtUtils.tabRates,
	"sect_tabTiaolv": SectFbtUtils.tabTiaolv,
	"sect_tabGrad": SectFbtUtils.tabGrad,
	"sect_noBis": SectFbtUtils.noBis,
	"sect_noRotation": SectFbtUtils.noRotation,
	"sect_noRates": SectFbtUtils.noRates,
	"sect_rotGreydust": SectFbtUtils.rotGreydust,
	"sect_rotOpener": SectFbtUtils.rotOpener,
	"sect_rotLoop": SectFbtUtils.rotLoop,
	"sect_rotKeyPoints": SectFbtUtils.rotKeyPoints,
	"sect_rotInnerSkills": SectFbtUtils.rotInnerSkills,
	"sect_rotVideo": SectFbtUtils.rotVideo,
	"sect_rateAccuracy": SectFbtUtils.rateAccuracy,
	"sect_rateCrit": SectFbtUtils.rateCrit,
	"sect_rateCritDamage": SectFbtUtils.rateCritDamage,
	"sect_bisMainWeapon": SectFbtUtils.bisMainWeapon,
	"sect_bisOffWeapon": SectFbtUtils.bisOffWeapon,
	"sect_bisAccessories": SectFbtUtils.bisAccessories,
	"sect_bisHeadBody": SectFbtUtils.bisHeadBody,
	"sect_bisLegsWrists": SectFbtUtils.bisLegsWrists,
	"sect_tabAffix": SectFbtUtils.tabAffix,
	"sect_affixEmpty": SectFbtUtils.affixEmpty,
	"sect_affixSetLabel": SectFbtUtils.affixSetLabel,
	"sect_affixBowLabel": SectFbtUtils.affixBowLabel,
	"sect_affixDingyinLabel": SectFbtUtils.affixDingyinLabel,
	"sect_affixColAffix": SectFbtUtils.affixColAffix,
	"sect_affixColCount": SectFbtUtils.affixColCount,
	"sect_affixColMax": SectFbtUtils.affixColMax,
	"sect_affixColCy": SectFbtUtils.affixColCy,
	"sect_affixSource": SectFbtUtils.affixSource,
	"tiaolv_intro": TiaolvFbtUtils.intro,
	"tiaolv_innerSkill": TiaolvFbtUtils.innerSkill,
	"tiaolv_innerSkillPlaceholder": TiaolvFbtUtils.innerSkillPlaceholder,
	"tiaolv_wuxue": TiaolvFbtUtils.wuxue,
	"tiaolv_wuku": TiaolvFbtUtils.wuku,
	"tiaolv_wukuSelf": TiaolvFbtUtils.wukuSelf,
	"tiaolv_wukuCommon": TiaolvFbtUtils.wukuCommon,
	"tiaolv_suit": TiaolvFbtUtils.suit,
	"tiaolv_bow": TiaolvFbtUtils.bow,
	"tiaolv_none": TiaolvFbtUtils.none,
	"tiaolv_tuneArea": TiaolvFbtUtils.tuneArea,
	"tiaolv_calc": TiaolvFbtUtils.calc,
	"tiaolv_calculating": TiaolvFbtUtils.calculating,
	"tiaolv_toastFailed": TiaolvFbtUtils.toastFailed,
	"tiaolv_toastFailedWith": TiaolvFbtUtils.toastFailedWith,
	"tiaolv_colAttr": TiaolvFbtUtils.colAttr,
	"tiaolv_colBase": TiaolvFbtUtils.colBase,
	"tiaolv_colPanel": TiaolvFbtUtils.colPanel,
	"tiaolv_colFinal": TiaolvFbtUtils.colFinal,
	"grad_entering": GradFbtUtils.entering,
	"grad_title": GradFbtUtils.title,
	"grad_subtitle": GradFbtUtils.subtitle,
	"grad_mingjinNote": GradFbtUtils.mingjinNote,
	"grad_buildBig": GradFbtUtils.buildBig,
	"grad_buildSmall": GradFbtUtils.buildSmall,
	"grad_ringLabel": GradFbtUtils.ringLabel,
	"grad_scoreCount": GradFbtUtils.scoreCount,
	"grad_scoreValue": GradFbtUtils.scoreValue,
	"grad_scoreRate": GradFbtUtils.scoreRate,
	"grad_tier1": GradFbtUtils.tier1,
	"grad_tier2": GradFbtUtils.tier2,
	"grad_tier3": GradFbtUtils.tier3,
	"grad_tier4": GradFbtUtils.tier4,
	"grad_tier5": GradFbtUtils.tier5,
	"grad_tier6": GradFbtUtils.tier6,
	"grad_tapHint": GradFbtUtils.tapHint,
	"grad_refTitle": GradFbtUtils.refTitle,
	"grad_maxTableTitle": GradFbtUtils.maxTableTitle,
	"grad_colAffix": GradFbtUtils.colAffix,
	"grad_colMax": GradFbtUtils.colMax,
	"grad_colResonance": GradFbtUtils.colResonance,
	"grad_slotTableTitle": GradFbtUtils.slotTableTitle,
	"grad_rateTitle": GradFbtUtils.rateTitle,
	"grad_rateOk": GradFbtUtils.rateOk,
	"grad_rateGap": GradFbtUtils.rateGap,
	"grad_rateOverflow": GradFbtUtils.rateOverflow,
	"grad_compareTitle": GradFbtUtils.compareTitle,
	"grad_saveScheme": GradFbtUtils.saveScheme,
	"grad_schemeName": GradFbtUtils.schemeName,
	"grad_noSchemes": GradFbtUtils.noSchemes,
	"grad_load": GradFbtUtils.load,
	"grad_deleteScheme": GradFbtUtils.deleteScheme,
	"grad_itemScore": GradFbtUtils.itemScore,
	"grad_rowMain": GradFbtUtils.rowMain,
	"grad_rowSub": GradFbtUtils.rowSub,
	"grad_rowResonance": GradFbtUtils.rowResonance,
	"grad_ratePrecision": GradFbtUtils.ratePrecision,
	"grad_rateCrit": GradFbtUtils.rateCrit,
	"grad_rateAffinity": GradFbtUtils.rateAffinity,
	"grad_affixPlaceholder": GradFbtUtils.affixPlaceholder,
	"grad_affixLoading": GradFbtUtils.affixLoading,
	"grad_valuePlaceholderMax": GradFbtUtils.valuePlaceholderMax,
	"grad_valuePlaceholder": GradFbtUtils.valuePlaceholder,
	"grad_resonance": GradFbtUtils.resonance,
	"grad_overMax": GradFbtUtils.overMax,
	"grad_toastSaved": GradFbtUtils.toastSaved,
	"grad_toastLoaded": GradFbtUtils.toastLoaded,
	"grad_toastOldScheme": GradFbtUtils.toastOldScheme,
	"gear_calcLabel": GearFbtUtils.calcLabel,
	"gear_benchTitle": GearFbtUtils.benchTitle,
	"gear_benchIntro": GearFbtUtils.benchIntro,
	"gear_targetLabel": GearFbtUtils.targetLabel,
	"gear_bowLabel": GearFbtUtils.bowLabel,
	"gear_bowNoneLabel": GearFbtUtils.bowNoneLabel,
	"gear_extrasTitle": GearFbtUtils.extrasTitle,
	"gear_resLabel": GearFbtUtils.resLabel,
	"gear_extraAccLabel": GearFbtUtils.extraAccLabel,
	"gear_extraCritLabel": GearFbtUtils.extraCritLabel,
	"gear_extraIntLabel": GearFbtUtils.extraIntLabel,
	"gear_baseTitle": GearFbtUtils.baseTitle,
	"gear_unlockLabel": GearFbtUtils.unlockLabel,
	"gear_lockLabel": GearFbtUtils.lockLabel,
	"gear_modifiedTag": GearFbtUtils.modifiedTag,
	"gear_baseResetLabel": GearFbtUtils.baseResetLabel,
	"gear_baseResetTitle": GearFbtUtils.baseResetTitle,
	"gear_baseResetBody": GearFbtUtils.baseResetBody,
	"gear_xinfaLabelTemplate": GearFbtUtils.xinfaLabelTemplate,
	"gear_xinfaNoneLabel": GearFbtUtils.xinfaNoneLabel,
	"gear_loginHint": GearFbtUtils.loginHint,
	"gear_libTitle": GearFbtUtils.libTitle,
	"gear_myLibTitle": GearFbtUtils.myLibTitle,
	"gear_myBuildsTitle": GearFbtUtils.myBuildsTitle,
	"gear_libCountTemplate": GearFbtUtils.libCountTemplate,
	"gear_usageTemplate": GearFbtUtils.usageTemplate,
	"gear_usageNearLimitText": GearFbtUtils.usageNearLimitText,
	"gear_formSlotLabel": GearFbtUtils.formSlotLabel,
	"gear_formNameLabel": GearFbtUtils.formNameLabel,
	"gear_formNamePlaceholder": GearFbtUtils.formNamePlaceholder,
	"gear_affixPlaceholder": GearFbtUtils.affixPlaceholder,
	"gear_valuePlaceholder": GearFbtUtils.valuePlaceholder,
	"gear_refTemplate": GearFbtUtils.refTemplate,
	"gear_fillMaxLabel": GearFbtUtils.fillMaxLabel,
	"gear_fillCyLabel": GearFbtUtils.fillCyLabel,
	"gear_delRowLabel": GearFbtUtils.delRowLabel,
	"gear_addRowLabel": GearFbtUtils.addRowLabel,
	"gear_dyNameLabel": GearFbtUtils.dyNameLabel,
	"gear_dyNamePlaceholder": GearFbtUtils.dyNamePlaceholder,
	"gear_dyValLabel": GearFbtUtils.dyValLabel,
	"gear_schoolsLabel": GearFbtUtils.schoolsLabel,
	"gear_addGearLabel": GearFbtUtils.addGearLabel,
	"gear_updateGearLabel": GearFbtUtils.updateGearLabel,
	"gear_cancelEditLabel": GearFbtUtils.cancelEditLabel,
	"gear_demoLabel": GearFbtUtils.demoLabel,
	"gear_clearLibLabel": GearFbtUtils.clearLibLabel,
	"gear_clearConfirmTitle": GearFbtUtils.clearConfirmTitle,
	"gear_clearConfirmBody": GearFbtUtils.clearConfirmBody,
	"gear_equipLabel": GearFbtUtils.equipLabel,
	"gear_unequipLabel": GearFbtUtils.unequipLabel,
	"gear_editLabel": GearFbtUtils.editLabel,
	"gear_deleteLabel": GearFbtUtils.deleteLabel,
	"gear_simLabel": GearFbtUtils.simLabel,
	"gear_simRealLabel": GearFbtUtils.simRealLabel,
	"gear_simCyLabel": GearFbtUtils.simCyLabel,
	"gear_simMaxLabel": GearFbtUtils.simMaxLabel,
	"gear_verdictHeirloom": GearFbtUtils.verdictHeirloom,
	"gear_verdictDud": GearFbtUtils.verdictDud,
	"gear_scoreTemplate": GearFbtUtils.scoreTemplate,
	"gear_qualityLabel": GearFbtUtils.qualityLabel,
	"gear_exportLabel": GearFbtUtils.exportLabel,
	"gear_exportFileName": GearFbtUtils.exportFileName,
	"gear_importNameTemplate": GearFbtUtils.importNameTemplate,
	"gear_importLabel": GearFbtUtils.importLabel,
	"gear_importFailedToast": GearFbtUtils.importFailedToast,
	"gear_importedToastTemplate": GearFbtUtils.importedToastTemplate,
	"gear_manualTitle": GearFbtUtils.manualTitle,
	"gear_pasteTitle": GearFbtUtils.pasteTitle,
	"gear_pastePlaceholder": GearFbtUtils.pastePlaceholder,
	"gear_pasteButtonLabel": GearFbtUtils.pasteButtonLabel,
	"gear_pasteDemoLabel": GearFbtUtils.pasteDemoLabel,
	"gear_pasteEmptyText": GearFbtUtils.pasteEmptyText,
	"gear_pasteOkTemplate": GearFbtUtils.pasteOkTemplate,
	"gear_pasteUnknownTemplate": GearFbtUtils.pasteUnknownTemplate,
	"gear_pasteFailText": GearFbtUtils.pasteFailText,
	"gear_pasteFullText": GearFbtUtils.pasteFullText,
	"gear_ocrTitle": GearFbtUtils.ocrTitle,
	"gear_ocrDropText": GearFbtUtils.ocrDropText,
	"gear_ocrPreparingText": GearFbtUtils.ocrPreparingText,
	"gear_ocrRunningText": GearFbtUtils.ocrRunningText,
	"gear_ocrSecondText": GearFbtUtils.ocrSecondText,
	"gear_ocrFailedText": GearFbtUtils.ocrFailedText,
	"gear_ocrBadTypeText": GearFbtUtils.ocrBadTypeText,
	"gear_ocrTooBigText": GearFbtUtils.ocrTooBigText,
	"gear_ocrNoEngineText": GearFbtUtils.ocrNoEngineText,
	"gear_ocrDoneTemplate": GearFbtUtils.ocrDoneTemplate,
	"gear_ocrSlotLabel": GearFbtUtils.ocrSlotLabel,
	"gear_ocrNameLabel": GearFbtUtils.ocrNameLabel,
	"gear_ocrEquipLabel": GearFbtUtils.ocrEquipLabel,
	"gear_ocrConfirmLabel": GearFbtUtils.ocrConfirmLabel,
	"gear_ocrCancelLabel": GearFbtUtils.ocrCancelLabel,
	"gear_ocrUnknownTitle": GearFbtUtils.ocrUnknownTitle,
	"gear_ocrSavedTemplate": GearFbtUtils.ocrSavedTemplate,
	"gear_ocrNeedLineToast": GearFbtUtils.ocrNeedLineToast,
	"gear_ocrLowConfTag": GearFbtUtils.ocrLowConfTag,
	"gear_ocrAddRowLabel": GearFbtUtils.ocrAddRowLabel,
	"gear_ocrImportSlotTemplate": GearFbtUtils.ocrImportSlotTemplate,
	"gear_ocrBatchTitle": GearFbtUtils.ocrBatchTitle,
	"gear_ocrBatchDropText": GearFbtUtils.ocrBatchDropText,
	"gear_ocrBatchQueuedText": GearFbtUtils.ocrBatchQueuedText,
	"gear_ocrBatchRunningText": GearFbtUtils.ocrBatchRunningText,
	"gear_ocrBatchReadyText": GearFbtUtils.ocrBatchReadyText,
	"gear_ocrBatchFailedText": GearFbtUtils.ocrBatchFailedText,
	"gear_ocrBatchImportedText": GearFbtUtils.ocrBatchImportedText,
	"gear_ocrBatchRetryLabel": GearFbtUtils.ocrBatchRetryLabel,
	"gear_ocrBatchRemoveLabel": GearFbtUtils.ocrBatchRemoveLabel,
	"gear_ocrBatchAdjustLabel": GearFbtUtils.ocrBatchAdjustLabel,
	"gear_ocrBatchApplyBoxLabel": GearFbtUtils.ocrBatchApplyBoxLabel,
	"gear_ocrBatchDetectedText": GearFbtUtils.ocrBatchDetectedText,
	"gear_ocrBatchFullImageText": GearFbtUtils.ocrBatchFullImageText,
	"gear_ocrBatchDupTag": GearFbtUtils.ocrBatchDupTag,
	"gear_ocrBatchDupLibText": GearFbtUtils.ocrBatchDupLibText,
	"gear_ocrBatchDupRowText": GearFbtUtils.ocrBatchDupRowText,
	"gear_ocrBatchIncludeLabel": GearFbtUtils.ocrBatchIncludeLabel,
	"gear_ocrBatchNoLinesText": GearFbtUtils.ocrBatchNoLinesText,
	"gear_ocrBatchImportTemplate": GearFbtUtils.ocrBatchImportTemplate,
	"gear_ocrBatchResultTemplate": GearFbtUtils.ocrBatchResultTemplate,
	"gear_libEmptyText": GearFbtUtils.libEmptyText,
	"gear_equippedTag": GearFbtUtils.equippedTag,
	"gear_loadoutTitle": GearFbtUtils.loadoutTitle,
	"gear_autoLabel": GearFbtUtils.autoLabel,
	"gear_autoDoneToast": GearFbtUtils.autoDoneToast,
	"gear_autoFallbackToast": GearFbtUtils.autoFallbackToast,
	"gear_unequipAllLabel": GearFbtUtils.unequipAllLabel,
	"gear_slotEmptyText": GearFbtUtils.slotEmptyText,
	"gear_panelTitle": GearFbtUtils.panelTitle,
	"gear_gradLabel": GearFbtUtils.gradLabel,
	"gear_gradCountLabel": GearFbtUtils.gradCountLabel,
	"gear_gradValueLabel": GearFbtUtils.gradValueLabel,
	"gear_gradDyLabel": GearFbtUtils.gradDyLabel,
	"gear_gradDyToggleLabel": GearFbtUtils.gradDyToggleLabel,
	"gear_loanLabel": GearFbtUtils.loanLabel,
	"gear_simActiveTag": GearFbtUtils.simActiveTag,
	"gear_copySummaryLabel": GearFbtUtils.copySummaryLabel,
	"gear_copiedToast": GearFbtUtils.copiedToast,
	"gear_copyFailedToast": GearFbtUtils.copyFailedToast,
	"gear_yAccLabel": GearFbtUtils.yAccLabel,
	"gear_yCritLabel": GearFbtUtils.yCritLabel,
	"gear_yIntLabel": GearFbtUtils.yIntLabel,
	"gear_finalCritLabel": GearFbtUtils.finalCritLabel,
	"gear_whiteLabel": GearFbtUtils.whiteLabel,
	"gear_dawaiLabel": GearFbtUtils.dawaiLabel,
	"gear_xiaowaiLabel": GearFbtUtils.xiaowaiLabel,
	"gear_dashuLabel": GearFbtUtils.dashuLabel,
	"gear_xiaoshuLabel": GearFbtUtils.xiaoshuLabel,
	"gear_hpLabel": GearFbtUtils.hpLabel,
	"gear_defLabel": GearFbtUtils.defLabel,
	"gear_talentLabel": GearFbtUtils.talentLabel,
	"gear_diffTitle": GearFbtUtils.diffTitle,
	"gear_diffLackTemplate": GearFbtUtils.diffLackTemplate,
	"gear_diffExactText": GearFbtUtils.diffExactText,
	"gear_diffOverTemplate": GearFbtUtils.diffOverTemplate,
	"gear_diffExtraTitle": GearFbtUtils.diffExtraTitle,
	"gear_diffLowTitle": GearFbtUtils.diffLowTitle,
	"gear_diffDoneText": GearFbtUtils.diffDoneText,
	"gear_diffEmptyText": GearFbtUtils.diffEmptyText,
	"gear_diffInvalidTemplate": GearFbtUtils.diffInvalidTemplate,
	"gear_suggestTitle": GearFbtUtils.suggestTitle,
	"gear_suggestSwapTemplate": GearFbtUtils.suggestSwapTemplate,
	"gear_suggestWashTemplate": GearFbtUtils.suggestWashTemplate,
	"gear_suggestNoneText": GearFbtUtils.suggestNoneText,
	"gear_suggestHeadTemplate": GearFbtUtils.suggestHeadTemplate,
	"gear_dySummaryTitle": GearFbtUtils.dySummaryTitle,
	"gear_dyCorrectText": GearFbtUtils.dyCorrectText,
	"gear_dyWrongText": GearFbtUtils.dyWrongText,
	"gear_schemeTitle": GearFbtUtils.schemeTitle,
	"gear_schemeSaveLabel": GearFbtUtils.schemeSaveLabel,
	"gear_schemeNameTemplate": GearFbtUtils.schemeNameTemplate,
	"gear_schemeLoadLabel": GearFbtUtils.schemeLoadLabel,
	"gear_schemeDeleteLabel": GearFbtUtils.schemeDeleteLabel,
	"gear_schemeEmptyText": GearFbtUtils.schemeEmptyText,
	"gear_schemeComposeFirstText": GearFbtUtils.schemeComposeFirstText,
	"gear_schemeSavedToastTemplate": GearFbtUtils.schemeSavedToastTemplate,
	"gear_schemeLoadedToastTemplate": GearFbtUtils.schemeLoadedToastTemplate,
	"gear_schemeGroupCountTemplate": GearFbtUtils.schemeGroupCountTemplate,
	"gear_shareLabel": GearFbtUtils.shareLabel,
	"gear_revokeShareLabel": GearFbtUtils.revokeShareLabel,
	"gear_copyLinkLabel": GearFbtUtils.copyLinkLabel,
	"gear_shareRevokedToast": GearFbtUtils.shareRevokedToast,
	"gear_quickTitle": GearFbtUtils.quickTitle,
	"gear_quickResLabel": GearFbtUtils.quickResLabel,
	"gear_quickSyncLabel": GearFbtUtils.quickSyncLabel,
	"gear_quickSyncedToast": GearFbtUtils.quickSyncedToast,
	"gear_quickOkText": GearFbtUtils.quickOkText,
	"gear_quickOverTemplate": GearFbtUtils.quickOverTemplate,
	"gear_quickGapTemplate": GearFbtUtils.quickGapTemplate,
	"gear_recipesTitle": GearFbtUtils.recipesTitle,
	"gear_recipeSearchPlaceholder": GearFbtUtils.recipeSearchPlaceholder,
	"gear_recipeAllLabel": GearFbtUtils.recipeAllLabel,
	"gear_recipeColCat": GearFbtUtils.recipeColCat,
	"gear_recipeColSchool": GearFbtUtils.recipeColSchool,
	"gear_recipeColSet": GearFbtUtils.recipeColSet,
	"gear_recipeColRecipe": GearFbtUtils.recipeColRecipe,
	"gear_recipeColBow": GearFbtUtils.recipeColBow,
	"gear_recipeSetTargetLabel": GearFbtUtils.recipeSetTargetLabel,
	"gear_recipeEmptyText": GearFbtUtils.recipeEmptyText,
	"gear_recipeTargetToastTemplate": GearFbtUtils.recipeTargetToastTemplate,
	"gear_sectRecipesTitle": GearFbtUtils.sectRecipesTitle,
	"gear_affixTableTitle": GearFbtUtils.affixTableTitle,
	"gear_colCyLabel": GearFbtUtils.colCyLabel,
	"gear_colCyPctLabel": GearFbtUtils.colCyPctLabel,
	"gear_colRecipeNamesLabel": GearFbtUtils.colRecipeNamesLabel,
	"gear_survivalNote": GearFbtUtils.survivalNote,
	"gear_slotTableTitle": GearFbtUtils.slotTableTitle,
	"gear_slotsBigTitle": GearFbtUtils.slotsBigTitle,
	"gear_slotsSmallTitle": GearFbtUtils.slotsSmallTitle,
	"gear_formulaTitle": GearFbtUtils.formulaTitle,
	"gear_formulaRatesTitle": GearFbtUtils.formulaRatesTitle,
	"gear_formulaDimsTitle": GearFbtUtils.formulaDimsTitle,
	"gear_formulaOrderTitle": GearFbtUtils.formulaOrderTitle,
	"gear_formulaAccTemplate": GearFbtUtils.formulaAccTemplate,
	"gear_formulaCritTemplate": GearFbtUtils.formulaCritTemplate,
	"gear_formulaIntTemplate": GearFbtUtils.formulaIntTemplate,
	"gear_formulaBarsTemplate": GearFbtUtils.formulaBarsTemplate,
	"gear_formulaBowTemplate": GearFbtUtils.formulaBowTemplate,
	"gear_formulaOrderText": GearFbtUtils.formulaOrderText,
	"gear_colDimLabel": GearFbtUtils.colDimLabel,
	"gear_colConvLabel": GearFbtUtils.colConvLabel,
	"gear_colFullBarTemplate": GearFbtUtils.colFullBarTemplate,
	"gear_calcFailedText": GearFbtUtils.calcFailedText,
	"gear_demoLoadedToast": GearFbtUtils.demoLoadedToast,
	"gear_savedToastTemplate": GearFbtUtils.savedToastTemplate,
	"gear_deletedToast": GearFbtUtils.deletedToast,
	"gear_clearedToast": GearFbtUtils.clearedToast,
	"legal_termsTitle": LegalFbtUtils.termsTitle,
	"legal_privacyTitle": LegalFbtUtils.privacyTitle,
	"legal_termsLink": LegalFbtUtils.termsLink,
	"legal_privacyLink": LegalFbtUtils.privacyLink,
	"legal_updatedText": LegalFbtUtils.updatedText,
	"legal_disclaimer": LegalFbtUtils.disclaimer,
	"termsBody_s1h": TermsBodyFbtUtils.s1h,
	"termsBody_s1b": TermsBodyFbtUtils.s1b,
	"termsBody_s2h": TermsBodyFbtUtils.s2h,
	"termsBody_s2b": TermsBodyFbtUtils.s2b,
	"termsBody_s3h": TermsBodyFbtUtils.s3h,
	"termsBody_s3b": TermsBodyFbtUtils.s3b,
	"termsBody_s4h": TermsBodyFbtUtils.s4h,
	"termsBody_s4b": TermsBodyFbtUtils.s4b,
	"termsBody_s5h": TermsBodyFbtUtils.s5h,
	"termsBody_s5b": TermsBodyFbtUtils.s5b,
	"termsBody_s6h": TermsBodyFbtUtils.s6h,
	"termsBody_s6b": TermsBodyFbtUtils.s6b,
	"privacyBody_s1h": PrivacyBodyFbtUtils.s1h,
	"privacyBody_s1b": PrivacyBodyFbtUtils.s1b,
	"privacyBody_s2h": PrivacyBodyFbtUtils.s2h,
	"privacyBody_s2b": PrivacyBodyFbtUtils.s2b,
	"privacyBody_s3h": PrivacyBodyFbtUtils.s3h,
	"privacyBody_s3b": PrivacyBodyFbtUtils.s3b,
	"privacyBody_s4h": PrivacyBodyFbtUtils.s4h,
	"privacyBody_s4b": PrivacyBodyFbtUtils.s4b,
	"privacyBody_s5h": PrivacyBodyFbtUtils.s5h,
	"privacyBody_s5b": PrivacyBodyFbtUtils.s5b,
	"privacyBody_s6h": PrivacyBodyFbtUtils.s6h,
	"privacyBody_s6b": PrivacyBodyFbtUtils.s6b,
	"errors_rateLimited": ErrorsFbtUtils.rateLimited,
	"errors_createRateLimited": ErrorsFbtUtils.createRateLimited,
	"errors_guildNotFound": ErrorsFbtUtils.guildNotFound,
	"errors_gearNotFound": ErrorsFbtUtils.gearNotFound,
	"errors_gearEmptyBuild": ErrorsFbtUtils.gearEmptyBuild,
	"errors_gearCapacityReached": ErrorsFbtUtils.gearCapacityReached,
	"errors_gearImportOverflow": ErrorsFbtUtils.gearImportOverflow,
	"errors_gearOcrBatchTooLarge": ErrorsFbtUtils.gearOcrBatchTooLarge,
	"errors_gearOcrDailyLimit": ErrorsFbtUtils.gearOcrDailyLimit,
	"errors_loginRequired": ErrorsFbtUtils.loginRequired,
	"errors_loginRequiredShort": ErrorsFbtUtils.loginRequiredShort,
	"errors_localeUnsupported": ErrorsFbtUtils.localeUnsupported,
	"errors_pushTokenInvalid": ErrorsFbtUtils.pushTokenInvalid,
	"errors_guildUnboundWrite": ErrorsFbtUtils.guildUnboundWrite,
	"errors_memberOnly": ErrorsFbtUtils.memberOnly,
	"errors_memberOnlyView": ErrorsFbtUtils.memberOnlyView,
	"errors_recruitClosed": ErrorsFbtUtils.recruitClosed,
	"errors_titleRequired": ErrorsFbtUtils.titleRequired,
	"errors_badStartTime": ErrorsFbtUtils.badStartTime,
	"errors_startTimeTooFar": ErrorsFbtUtils.startTimeTooFar,
	"errors_badMaxSlots": ErrorsFbtUtils.badMaxSlots,
	"errors_groupingNotFound": ErrorsFbtUtils.groupingNotFound,
	"errors_officialEvent": ErrorsFbtUtils.officialEvent,
	"errors_noCreatorRecorded": ErrorsFbtUtils.noCreatorRecorded,
	"errors_leaderOnlyDisband": ErrorsFbtUtils.leaderOnlyDisband,
	"errors_noCreatorRecordedEdit": ErrorsFbtUtils.noCreatorRecordedEdit,
	"errors_leaderOnlyEdit": ErrorsFbtUtils.leaderOnlyEdit,
	"errors_noCreatorRecordedComplete": ErrorsFbtUtils.noCreatorRecordedComplete,
	"errors_leaderOnlyComplete": ErrorsFbtUtils.leaderOnlyComplete,
	"errors_noCreatorRecordedReopen": ErrorsFbtUtils.noCreatorRecordedReopen,
	"errors_leaderOnlyReopen": ErrorsFbtUtils.leaderOnlyReopen,
	"errors_groupingAlreadyCompleted": ErrorsFbtUtils.groupingAlreadyCompleted,
	"errors_noCreatorRecordedMerge": ErrorsFbtUtils.noCreatorRecordedMerge,
	"errors_leaderOnlyMerge": ErrorsFbtUtils.leaderOnlyMerge,
	"errors_mergeSameGrouping": ErrorsFbtUtils.mergeSameGrouping,
	"errors_mergeGuildMismatch": ErrorsFbtUtils.mergeGuildMismatch,
	"errors_mergeTypeMismatch": ErrorsFbtUtils.mergeTypeMismatch,
	"errors_mergeRaceUnsupported": ErrorsFbtUtils.mergeRaceUnsupported,
	"errors_mergeNotOpen": ErrorsFbtUtils.mergeNotOpen,
	"errors_groupingNotCompleted": ErrorsFbtUtils.groupingNotCompleted,
	"errors_groupingClosed": ErrorsFbtUtils.groupingClosed,
	"errors_nicknameRequired": ErrorsFbtUtils.nicknameRequired,
	"errors_proxyTargetNotInRoster": ErrorsFbtUtils.proxyTargetNotInRoster,
	"errors_seatNamesNotInRoster": ErrorsFbtUtils.seatNamesNotInRoster,
	"errors_groupingFull": ErrorsFbtUtils.groupingFull,
	"errors_lastSeatHealer": ErrorsFbtUtils.lastSeatHealer,
	"errors_alreadyJoined": ErrorsFbtUtils.alreadyJoined,
	"errors_seatNotFound": ErrorsFbtUtils.seatNotFound,
	"errors_notSeated": ErrorsFbtUtils.notSeated,
	"errors_reminderOffsetsInvalid": ErrorsFbtUtils.reminderOffsetsInvalid,
	"errors_ogAccentInvalid": ErrorsFbtUtils.ogAccentInvalid,
	"errors_paramsIncomplete": ErrorsFbtUtils.paramsIncomplete,
	"errors_bossNotFound": ErrorsFbtUtils.bossNotFound,
	"errors_guildNameShort": ErrorsFbtUtils.guildNameShort,
	"errors_avatarTooLarge": ErrorsFbtUtils.avatarTooLarge,
	"errors_avatarBadType": ErrorsFbtUtils.avatarBadType,
	"errors_avatarEmpty": ErrorsFbtUtils.avatarEmpty,
	"errors_slugInvalid": ErrorsFbtUtils.slugInvalid,
	"errors_slugReserved": ErrorsFbtUtils.slugReserved,
	"errors_slugTaken": ErrorsFbtUtils.slugTaken,
	"errors_serverRequired": ErrorsFbtUtils.serverRequired,
	"errors_notInServer": ErrorsFbtUtils.notInServer,
	"errors_cannotManageServer": ErrorsFbtUtils.cannotManageServer,
	"errors_adminOnly": ErrorsFbtUtils.adminOnly,
	"errors_platformAdminRequired": ErrorsFbtUtils.platformAdminRequired,
	"errors_tierInvalid": ErrorsFbtUtils.tierInvalid,
	"errors_feedbackNotFound": ErrorsFbtUtils.feedbackNotFound,
	"errors_bossNameRequired": ErrorsFbtUtils.bossNameRequired,
	"errors_webhookFormatInvalid": ErrorsFbtUtils.webhookFormatInvalid,
	"errors_webhookNotConfigured": ErrorsFbtUtils.webhookNotConfigured,
	"errors_subdomainTrialCardRequired": ErrorsFbtUtils.subdomainTrialCardRequired,
	"errors_backupStorageMissing": ErrorsFbtUtils.backupStorageMissing,
	"errors_backupNotFound": ErrorsFbtUtils.backupNotFound,
	"errors_badParams": ErrorsFbtUtils.badParams,
	"errors_testSendFailed": ErrorsFbtUtils.testSendFailed,
	"errors_noCandidates": ErrorsFbtUtils.noCandidates,
	"errors_nudgeDailyLimit": ErrorsFbtUtils.nudgeDailyLimit,
	"errors_nudgeCooldown": ErrorsFbtUtils.nudgeCooldown,
	"errors_nudgeEventInvalid": ErrorsFbtUtils.nudgeEventInvalid,
	"errors_contributionRuleInvalid": ErrorsFbtUtils.contributionRuleInvalid,
	"errors_webhookInvalid": ErrorsFbtUtils.webhookInvalid,
	"errors_discordIdInvalid": ErrorsFbtUtils.discordIdInvalid,
	"errors_noFieldsToUpdate": ErrorsFbtUtils.noFieldsToUpdate,
	"errors_signupNotFound": ErrorsFbtUtils.signupNotFound,
	"errors_resultNotFound": ErrorsFbtUtils.resultNotFound,
	"errors_resultTeamRequired": ErrorsFbtUtils.resultTeamRequired,
	"errors_resultTimeInvalid": ErrorsFbtUtils.resultTimeInvalid,
	"errors_avatarDataInvalid": ErrorsFbtUtils.avatarDataInvalid,
	"errors_schoolRequired": ErrorsFbtUtils.schoolRequired,
	"errors_generic": ErrorsFbtUtils.generic,
	"errors_templateNotFound": ErrorsFbtUtils.templateNotFound,
	"errors_templateNameRequired": ErrorsFbtUtils.templateNameRequired,
	"errors_templateForbidden": ErrorsFbtUtils.templateForbidden,
	"errors_templateBadStart": ErrorsFbtUtils.templateBadStart,
	"errors_accountReauthRequired": ErrorsFbtUtils.accountReauthRequired,
	"errors_accountExportRateLimited": ErrorsFbtUtils.accountExportRateLimited,
	"errors_accountUsernameMismatch": ErrorsFbtUtils.accountUsernameMismatch,
	"errors_accountDeletionPending": ErrorsFbtUtils.accountDeletionPending,
	"errors_accountDeletionNotPending": ErrorsFbtUtils.accountDeletionNotPending,
	"errors_premiumRequired": ErrorsFbtUtils.premiumRequired,
	"errors_customDomainInvalid": ErrorsFbtUtils.customDomainInvalid,
	"errors_customDomainReserved": ErrorsFbtUtils.customDomainReserved,
	"errors_customDomainConflict": ErrorsFbtUtils.customDomainConflict,
	"errors_customDomainNotBound": ErrorsFbtUtils.customDomainNotBound,
	"errors_customDomainDisabled": ErrorsFbtUtils.customDomainDisabled,
	"errors_customDomainSeamPending": ErrorsFbtUtils.customDomainSeamPending,
	"errors_customDomainDnsPending": ErrorsFbtUtils.customDomainDnsPending,
	"errors_gearStandardInvalid": ErrorsFbtUtils.gearStandardInvalid,
	"errors_gearStandardNotFound": ErrorsFbtUtils.gearStandardNotFound,
	"errors_capabilityRequired": ErrorsFbtUtils.capabilityRequired,
	"errors_governanceTierRequired": ErrorsFbtUtils.governanceTierRequired,
	"errors_officerTargetNotFound": ErrorsFbtUtils.officerTargetNotFound,
	"errors_officerBoardBodyRequired": ErrorsFbtUtils.officerBoardBodyRequired,
	"errors_officerBoardBodyTooLong": ErrorsFbtUtils.officerBoardBodyTooLong,
	"errors_officerBoardPostNotFound": ErrorsFbtUtils.officerBoardPostNotFound,
	"errors_premiumComingSoon": ErrorsFbtUtils.premiumComingSoon,
	"errors_premiumActive": ErrorsFbtUtils.premiumActive,
	"errors_paygateDisabled": ErrorsFbtUtils.paygateDisabled,
	"errors_checkoutFailed": ErrorsFbtUtils.checkoutFailed,
	"errors_rosterImportEmpty": ErrorsFbtUtils.rosterImportEmpty,
	"errors_rosterBatchNotFound": ErrorsFbtUtils.rosterBatchNotFound,
	"errors_rosterBatchConfirmed": ErrorsFbtUtils.rosterBatchConfirmed,
	"errors_rosterNoImportableRows": ErrorsFbtUtils.rosterNoImportableRows,
	"errors_rosterEntryNotFound": ErrorsFbtUtils.rosterEntryNotFound,
	"errors_checklistItemUnknown": ErrorsFbtUtils.checklistItemUnknown,
	"errors_feedbackEmpty": ErrorsFbtUtils.feedbackEmpty,
	"errors_feedbackTooLong": ErrorsFbtUtils.feedbackTooLong,
	"errors_feedbackRateLimited": ErrorsFbtUtils.feedbackRateLimited,
	"errors_announcementTitleRequired": ErrorsFbtUtils.announcementTitleRequired,
	"errors_announcementTitleTooLong": ErrorsFbtUtils.announcementTitleTooLong,
	"errors_announcementBodyTooLong": ErrorsFbtUtils.announcementBodyTooLong,
	"errors_announcementNotFound": ErrorsFbtUtils.announcementNotFound,
	"errors_translationNotConfigured": ErrorsFbtUtils.translationNotConfigured,
	"errors_translationTierLocked": ErrorsFbtUtils.translationTierLocked,
	"errors_announcementDailyLimit": ErrorsFbtUtils.announcementDailyLimit,
	"errors_urgentCallDailyLimit": ErrorsFbtUtils.urgentCallDailyLimit,
	"errors_lotteryTitleRequired": ErrorsFbtUtils.lotteryTitleRequired,
	"errors_lotteryEntriesEmpty": ErrorsFbtUtils.lotteryEntriesEmpty,
	"errors_lotteryNotFound": ErrorsFbtUtils.lotteryNotFound,
	"errors_lotteryAlreadyDrawn": ErrorsFbtUtils.lotteryAlreadyDrawn,
	"errors_lotteryWinnerCountInvalid": ErrorsFbtUtils.lotteryWinnerCountInvalid,
	"errors_lotteryWeightInvalid": ErrorsFbtUtils.lotteryWeightInvalid,
	"errors_lotteryMemberNotInGuild": ErrorsFbtUtils.lotteryMemberNotInGuild,
	"errors_availabilitySlotInvalid": ErrorsFbtUtils.availabilitySlotInvalid,
	"errors_availabilityTooManySlots": ErrorsFbtUtils.availabilityTooManySlots,
	"errors_pollTitleRequired": ErrorsFbtUtils.pollTitleRequired,
	"errors_pollOptionsInvalid": ErrorsFbtUtils.pollOptionsInvalid,
	"errors_pollNotFound": ErrorsFbtUtils.pollNotFound,
	"errors_pollClosed": ErrorsFbtUtils.pollClosed,
	"errors_pollOptionInvalid": ErrorsFbtUtils.pollOptionInvalid,
	"errors_pollForbidden": ErrorsFbtUtils.pollForbidden,
	"errors_customFieldInvalid": ErrorsFbtUtils.customFieldInvalid,
	"errors_fillOfferExists": ErrorsFbtUtils.fillOfferExists,
	"errors_fillSchoolRequired": ErrorsFbtUtils.fillSchoolRequired,
	"errors_fillWindowsInvalid": ErrorsFbtUtils.fillWindowsInvalid,
	"errors_fillRequestNotFound": ErrorsFbtUtils.fillRequestNotFound,
	"errors_fillRequestNotOpen": ErrorsFbtUtils.fillRequestNotOpen,
	"errors_fillOfferNotOpen": ErrorsFbtUtils.fillOfferNotOpen,
	"errors_fillInviteExists": ErrorsFbtUtils.fillInviteExists,
	"errors_fillInviteNotFound": ErrorsFbtUtils.fillInviteNotFound,
	"errors_fillInviteNotPending": ErrorsFbtUtils.fillInviteNotPending,
	"errors_fillInviteNotAccepted": ErrorsFbtUtils.fillInviteNotAccepted,
	"errors_fillSelfInvite": ErrorsFbtUtils.fillSelfInvite,
	"errors_marketManageOnly": ErrorsFbtUtils.marketManageOnly,
	"errors_allianceSelf": ErrorsFbtUtils.allianceSelf,
	"errors_allianceExists": ErrorsFbtUtils.allianceExists,
	"errors_allianceNotFound": ErrorsFbtUtils.allianceNotFound,
	"errors_allianceNotPending": ErrorsFbtUtils.allianceNotPending,
	"errors_allianceNotActive": ErrorsFbtUtils.allianceNotActive,
	"errors_allyNotAllied": ErrorsFbtUtils.allyNotAllied,
	"errors_allyNotShared": ErrorsFbtUtils.allyNotShared,
	"errors_visitorSlotsFull": ErrorsFbtUtils.visitorSlotsFull,
	"errors_visitorSlotsInvalid": ErrorsFbtUtils.visitorSlotsInvalid,
	"errors_customFieldTooMany": ErrorsFbtUtils.customFieldTooMany,
	"errors_signupAnswerRequired": ErrorsFbtUtils.signupAnswerRequired,
	"errors_signupAnswerInvalid": ErrorsFbtUtils.signupAnswerInvalid,
	"errors_applicationPending": ErrorsFbtUtils.applicationPending,
	"errors_alreadyMember": ErrorsFbtUtils.alreadyMember,
	"errors_recruitUnavailable": ErrorsFbtUtils.recruitUnavailable,
	"errors_applicationNotFound": ErrorsFbtUtils.applicationNotFound,
	"errors_applicationNotPending": ErrorsFbtUtils.applicationNotPending,
	"errors_mentorNotDesignated": ErrorsFbtUtils.mentorNotDesignated,
	"errors_mentorNotInGuild": ErrorsFbtUtils.mentorNotInGuild,
	"errors_menteeNotInGuild": ErrorsFbtUtils.menteeNotInGuild,
	"errors_menteeAlreadyPaired": ErrorsFbtUtils.menteeAlreadyPaired,
	"errors_mentorSelfPairing": ErrorsFbtUtils.mentorSelfPairing,
	"errors_pairingNotFound": ErrorsFbtUtils.pairingNotFound,
	"errors_pairingAlreadyEnded": ErrorsFbtUtils.pairingAlreadyEnded,
	"errors_officerNoteBodyRequired": ErrorsFbtUtils.officerNoteBodyRequired,
	"errors_officerNoteBodyTooLong": ErrorsFbtUtils.officerNoteBodyTooLong,
	"errors_officerNoteNotFound": ErrorsFbtUtils.officerNoteNotFound,
	"errors_officerMemberNotFound": ErrorsFbtUtils.officerMemberNotFound,
	"errors_seasonGoalTitleRequired": ErrorsFbtUtils.seasonGoalTitleRequired,
	"errors_seasonGoalTitleTooLong": ErrorsFbtUtils.seasonGoalTitleTooLong,
	"errors_seasonGoalNoteTooLong": ErrorsFbtUtils.seasonGoalNoteTooLong,
	"errors_seasonGoalNotFound": ErrorsFbtUtils.seasonGoalNotFound,
	"errors_seasonGoalDungeonNotFound": ErrorsFbtUtils.seasonGoalDungeonNotFound,
	"errors_recapForbidden": ErrorsFbtUtils.recapForbidden,
	"errors_recapNotCompleted": ErrorsFbtUtils.recapNotCompleted,
	"errors_recapTierLocked": ErrorsFbtUtils.recapTierLocked,
	"errors_recapNotEnabled": ErrorsFbtUtils.recapNotEnabled,
	"errors_recapDailyLimit": ErrorsFbtUtils.recapDailyLimit,
	"errors_recapProviderFailed": ErrorsFbtUtils.recapProviderFailed,
	"errors_combatReportForbidden": ErrorsFbtUtils.combatReportForbidden,
	"errors_combatEncounterNotFound": ErrorsFbtUtils.combatEncounterNotFound,
	"errors_combatTierLocked": ErrorsFbtUtils.combatTierLocked,
	"guildAdmin_title": GuildAdminFbtUtils.title,
	"guildAdmin_lockedTitle": GuildAdminFbtUtils.lockedTitle,
	"guildAdmin_lockedBody": GuildAdminFbtUtils.lockedBody,
	"guildAdmin_backLink": GuildAdminFbtUtils.backLink,
	"guildAdmin_tabProfile": GuildAdminFbtUtils.tabProfile,
	"guildAdmin_tabDiscord": GuildAdminFbtUtils.tabDiscord,
	"guildAdmin_tabEvents": GuildAdminFbtUtils.tabEvents,
	"guildAdmin_tabGuides": GuildAdminFbtUtils.tabGuides,
	"guildAdmin_saveButton": GuildAdminFbtUtils.saveButton,
	"guildAdmin_savedText": GuildAdminFbtUtils.savedText,
	"guildAdmin_deleteButton": GuildAdminFbtUtils.deleteButton,
	"guildAdmin_editButton": GuildAdminFbtUtils.editButton,
	"guildAdmin_addButton": GuildAdminFbtUtils.addButton,
	"guildAdmin_profileTitle": GuildAdminFbtUtils.profileTitle,
	"guildAdmin_nameLabel": GuildAdminFbtUtils.nameLabel,
	"guildAdmin_announcementLabel": GuildAdminFbtUtils.announcementLabel,
	"guildAdmin_sloganLabel": GuildAdminFbtUtils.sloganLabel,
	"guildAdmin_masterNameLabel": GuildAdminFbtUtils.masterNameLabel,
	"guildAdmin_logoUrlLabel": GuildAdminFbtUtils.logoUrlLabel,
	"guildAdmin_bgImageUrlLabel": GuildAdminFbtUtils.bgImageUrlLabel,
	"guildAdmin_avatarTitle": GuildAdminFbtUtils.avatarTitle,
	"guildAdmin_avatarUpload": GuildAdminFbtUtils.avatarUpload,
	"guildAdmin_avatarReplace": GuildAdminFbtUtils.avatarReplace,
	"guildAdmin_avatarDelete": GuildAdminFbtUtils.avatarDelete,
	"guildAdmin_avatarNone": GuildAdminFbtUtils.avatarNone,
	"guildAdmin_avatarHint": GuildAdminFbtUtils.avatarHint,
	"guildAdmin_discordTitle": GuildAdminFbtUtils.discordTitle,
	"guildAdmin_webhookLabel": GuildAdminFbtUtils.webhookLabel,
	"guildAdmin_webhookSet": GuildAdminFbtUtils.webhookSet,
	"guildAdmin_webhookUnset": GuildAdminFbtUtils.webhookUnset,
	"guildAdmin_webhookHint": GuildAdminFbtUtils.webhookHint,
	"guildAdmin_webhookClear": GuildAdminFbtUtils.webhookClear,
	"guildAdmin_guildIdLabel": GuildAdminFbtUtils.guildIdLabel,
	"guildAdmin_guildIdUnbound": GuildAdminFbtUtils.guildIdUnbound,
	"guildAdmin_reminderTitle": GuildAdminFbtUtils.reminderTitle,
	"guildAdmin_reminderOffsetsLabel": GuildAdminFbtUtils.reminderOffsetsLabel,
	"guildAdmin_reminderOffsetOption": GuildAdminFbtUtils.reminderOffsetOption,
	"guildAdmin_reminderCustomTextLabel": GuildAdminFbtUtils.reminderCustomTextLabel,
	"guildAdmin_reminderCustomTextHint": GuildAdminFbtUtils.reminderCustomTextHint,
	"guildAdmin_visibilityTitle": GuildAdminFbtUtils.visibilityTitle,
	"guildAdmin_devOnlyLabel": GuildAdminFbtUtils.devOnlyLabel,
	"guildAdmin_eventsTitle": GuildAdminFbtUtils.eventsTitle,
	"guildAdmin_signupCsvSuffix": GuildAdminFbtUtils.signupCsvSuffix,
	"guildAdmin_eventEmpty": GuildAdminFbtUtils.eventEmpty,
	"guildAdmin_eventTitleLabel": GuildAdminFbtUtils.eventTitleLabel,
	"guildAdmin_eventTypeLabel": GuildAdminFbtUtils.eventTypeLabel,
	"guildAdmin_eventStatusLabel": GuildAdminFbtUtils.eventStatusLabel,
	"guildAdmin_eventTimeLabel": GuildAdminFbtUtils.eventTimeLabel,
	"guildAdmin_eventSlotsLabel": GuildAdminFbtUtils.eventSlotsLabel,
	"guildAdmin_eventMeetLabel": GuildAdminFbtUtils.eventMeetLabel,
	"guildAdmin_eventDescLabel": GuildAdminFbtUtils.eventDescLabel,
	"guildAdmin_eventDungeonLabel": GuildAdminFbtUtils.eventDungeonLabel,
	"guildAdmin_statusOpen": GuildAdminFbtUtils.statusOpen,
	"guildAdmin_statusClosed": GuildAdminFbtUtils.statusClosed,
	"guildAdmin_statusCompleted": GuildAdminFbtUtils.statusCompleted,
	"guildAdmin_statusDraft": GuildAdminFbtUtils.statusDraft,
	"guildAdmin_signupsTitle": GuildAdminFbtUtils.signupsTitle,
	"guildAdmin_signupEmpty": GuildAdminFbtUtils.signupEmpty,
	"guildAdmin_exportCsvButton": GuildAdminFbtUtils.exportCsvButton,
	"guildAdmin_removeSignupButton": GuildAdminFbtUtils.removeSignupButton,
	"guildAdmin_resultsTitle": GuildAdminFbtUtils.resultsTitle,
	"guildAdmin_resultTeamLabel": GuildAdminFbtUtils.resultTeamLabel,
	"guildAdmin_resultMembersLabel": GuildAdminFbtUtils.resultMembersLabel,
	"guildAdmin_resultTimeLabel": GuildAdminFbtUtils.resultTimeLabel,
	"guildAdmin_resultProofLabel": GuildAdminFbtUtils.resultProofLabel,
	"guildAdmin_resultNoteLabel": GuildAdminFbtUtils.resultNoteLabel,
	"guildAdmin_guidesTitle": GuildAdminFbtUtils.guidesTitle,
	"guildAdmin_guidesHint": GuildAdminFbtUtils.guidesHint,
	"guildAdmin_guideSchoolLabel": GuildAdminFbtUtils.guideSchoolLabel,
	"guildAdmin_guideBuildLabel": GuildAdminFbtUtils.guideBuildLabel,
	"guildAdmin_guideAttrLabel": GuildAdminFbtUtils.guideAttrLabel,
	"guildAdmin_guideRateLabel": GuildAdminFbtUtils.guideRateLabel,
	"guildAdmin_guideBisLabel": GuildAdminFbtUtils.guideBisLabel,
	"guildAdmin_guideRotationLabel": GuildAdminFbtUtils.guideRotationLabel,
	"guildAdmin_tabStats": GuildAdminFbtUtils.tabStats,
	"guildAdmin_tabSeason": GuildAdminFbtUtils.tabSeason,
	"guildAdmin_seasonTitle": GuildAdminFbtUtils.seasonTitle,
	"guildAdmin_seasonHint": GuildAdminFbtUtils.seasonHint,
	"guildAdmin_seasonProgress": GuildAdminFbtUtils.seasonProgress,
	"guildAdmin_seasonItemDungeonsTitle": GuildAdminFbtUtils.seasonItemDungeonsTitle,
	"guildAdmin_seasonItemDungeonsDetail": GuildAdminFbtUtils.seasonItemDungeonsDetail,
	"guildAdmin_seasonItemTemplatesTitle": GuildAdminFbtUtils.seasonItemTemplatesTitle,
	"guildAdmin_seasonItemTemplatesDetail": GuildAdminFbtUtils.seasonItemTemplatesDetail,
	"guildAdmin_seasonItemGuidesTitle": GuildAdminFbtUtils.seasonItemGuidesTitle,
	"guildAdmin_seasonItemGuidesDetail": GuildAdminFbtUtils.seasonItemGuidesDetail,
	"guildAdmin_seasonItemRosterTitle": GuildAdminFbtUtils.seasonItemRosterTitle,
	"guildAdmin_seasonItemRosterDetail": GuildAdminFbtUtils.seasonItemRosterDetail,
	"guildAdmin_rosterTitle": GuildAdminFbtUtils.rosterTitle,
	"guildAdmin_rosterHint": GuildAdminFbtUtils.rosterHint,
	"guildAdmin_rosterUpload": GuildAdminFbtUtils.rosterUpload,
	"guildAdmin_rosterOcrRunning": GuildAdminFbtUtils.rosterOcrRunning,
	"guildAdmin_rosterPreviewTitle": GuildAdminFbtUtils.rosterPreviewTitle,
	"guildAdmin_rosterConfirm": GuildAdminFbtUtils.rosterConfirm,
	"guildAdmin_rosterEmpty": GuildAdminFbtUtils.rosterEmpty,
	"guildAdmin_rosterSourceOcr": GuildAdminFbtUtils.rosterSourceOcr,
	"guildAdmin_rosterMatchedMember": GuildAdminFbtUtils.rosterMatchedMember,
	"guildAdmin_rosterStatusMatched": GuildAdminFbtUtils.rosterStatusMatched,
	"guildAdmin_rosterStatusNew": GuildAdminFbtUtils.rosterStatusNew,
	"guildAdmin_rosterStatusUnrecognized": GuildAdminFbtUtils.rosterStatusUnrecognized,
	"guildAdmin_rosterImported": GuildAdminFbtUtils.rosterImported,
	"guildAdmin_statsTitle": GuildAdminFbtUtils.statsTitle,
	"guildAdmin_statsCurrentWeek": GuildAdminFbtUtils.statsCurrentWeek,
	"guildAdmin_statsCars": GuildAdminFbtUtils.statsCars,
	"guildAdmin_statsCompleted": GuildAdminFbtUtils.statsCompleted,
	"guildAdmin_statsSeats": GuildAdminFbtUtils.statsSeats,
	"guildAdmin_statsFillRate": GuildAdminFbtUtils.statsFillRate,
	"guildAdmin_statsParticipants": GuildAdminFbtUtils.statsParticipants,
	"guildAdmin_statsPerCapita": GuildAdminFbtUtils.statsPerCapita,
	"guildAdmin_statsMembersTitle": GuildAdminFbtUtils.statsMembersTitle,
	"guildAdmin_statsLeadersTitle": GuildAdminFbtUtils.statsLeadersTitle,
	"guildAdmin_statsSeatCount": GuildAdminFbtUtils.statsSeatCount,
	"guildAdmin_statsCarCount": GuildAdminFbtUtils.statsCarCount,
	"guildAdmin_statsEmpty": GuildAdminFbtUtils.statsEmpty,
	"guildAdmin_tabInsights": GuildAdminFbtUtils.tabInsights,
	"guildAdmin_insightsReliabilityTitle": GuildAdminFbtUtils.insightsReliabilityTitle,
	"guildAdmin_insightsReliabilityHint": GuildAdminFbtUtils.insightsReliabilityHint,
	"guildAdmin_insightsSignupsLabel": GuildAdminFbtUtils.insightsSignupsLabel,
	"guildAdmin_insightsAttendedLabel": GuildAdminFbtUtils.insightsAttendedLabel,
	"guildAdmin_insightsNoShowLabel": GuildAdminFbtUtils.insightsNoShowLabel,
	"guildAdmin_insightsRateLabel": GuildAdminFbtUtils.insightsRateLabel,
	"guildAdmin_insightsReliabilityEmpty": GuildAdminFbtUtils.insightsReliabilityEmpty,
	"guildAdmin_insightsHeatmapTitle": GuildAdminFbtUtils.insightsHeatmapTitle,
	"guildAdmin_insightsHeatmapHint": GuildAdminFbtUtils.insightsHeatmapHint,
	"guildAdmin_insightsHeatmapEmpty": GuildAdminFbtUtils.insightsHeatmapEmpty,
	"guildAdmin_insightsHeatmapTotal": GuildAdminFbtUtils.insightsHeatmapTotal,
	"guildAdmin_insightsWeekdayMon": GuildAdminFbtUtils.insightsWeekdayMon,
	"guildAdmin_insightsWeekdayTue": GuildAdminFbtUtils.insightsWeekdayTue,
	"guildAdmin_insightsWeekdayWed": GuildAdminFbtUtils.insightsWeekdayWed,
	"guildAdmin_insightsWeekdayThu": GuildAdminFbtUtils.insightsWeekdayThu,
	"guildAdmin_insightsWeekdayFri": GuildAdminFbtUtils.insightsWeekdayFri,
	"guildAdmin_insightsWeekdaySat": GuildAdminFbtUtils.insightsWeekdaySat,
	"guildAdmin_insightsWeekdaySun": GuildAdminFbtUtils.insightsWeekdaySun,
	"guildAdmin_insightsGearTitle": GuildAdminFbtUtils.insightsGearTitle,
	"guildAdmin_insightsGearHint": GuildAdminFbtUtils.insightsGearHint,
	"guildAdmin_insightsGearEmpty": GuildAdminFbtUtils.insightsGearEmpty,
	"guildAdmin_insightsGearLabelLabel": GuildAdminFbtUtils.insightsGearLabelLabel,
	"guildAdmin_insightsGearMinScoreLabel": GuildAdminFbtUtils.insightsGearMinScoreLabel,
	"guildAdmin_insightsGearAddLabel": GuildAdminFbtUtils.insightsGearAddLabel,
	"guildAdmin_insightsGearMetLabel": GuildAdminFbtUtils.insightsGearMetLabel,
	"guildAdmin_insightsGearUnmetLabel": GuildAdminFbtUtils.insightsGearUnmetLabel,
	"guildAdmin_insightsGearNoBuildLabel": GuildAdminFbtUtils.insightsGearNoBuildLabel,
	"guildAdmin_insightsGearScoreLabel": GuildAdminFbtUtils.insightsGearScoreLabel,
	"guildAdmin_insightsGearGapLabel": GuildAdminFbtUtils.insightsGearGapLabel,
	"guildAdmin_insightsGearSummary": GuildAdminFbtUtils.insightsGearSummary,
	"guildAdmin_insightsRaceTitle": GuildAdminFbtUtils.insightsRaceTitle,
	"guildAdmin_insightsRaceEmpty": GuildAdminFbtUtils.insightsRaceEmpty,
	"guildAdmin_insightsRaceTeamLabel": GuildAdminFbtUtils.insightsRaceTeamLabel,
	"guildAdmin_insightsRaceRunsLabel": GuildAdminFbtUtils.insightsRaceRunsLabel,
	"guildAdmin_insightsRaceWinsLabel": GuildAdminFbtUtils.insightsRaceWinsLabel,
	"guildAdmin_insightsRaceBestLabel": GuildAdminFbtUtils.insightsRaceBestLabel,
	"guildAdmin_insightsRaceUnclassified": GuildAdminFbtUtils.insightsRaceUnclassified,
	"guildAdmin_insightsSelfGearTitle": GuildAdminFbtUtils.insightsSelfGearTitle,
	"guildAdmin_statsBoardEmpty": GuildAdminFbtUtils.statsBoardEmpty,
	"guildAdmin_whiteLabelTitle": GuildAdminFbtUtils.whiteLabelTitle,
	"guildAdmin_hideBrandingLabel": GuildAdminFbtUtils.hideBrandingLabel,
	"guildAdmin_hideBrandingHint": GuildAdminFbtUtils.hideBrandingHint,
	"guildAdmin_ogAccentLabel": GuildAdminFbtUtils.ogAccentLabel,
	"guildAdmin_ogTitleSuffixLabel": GuildAdminFbtUtils.ogTitleSuffixLabel,
	"guildAdmin_ogTitleSuffixHint": GuildAdminFbtUtils.ogTitleSuffixHint,
	"guildAdmin_ogAccentGold": GuildAdminFbtUtils.ogAccentGold,
	"guildAdmin_ogAccentJade": GuildAdminFbtUtils.ogAccentJade,
	"guildAdmin_ogAccentAzure": GuildAdminFbtUtils.ogAccentAzure,
	"guildAdmin_ogAccentCinnabar": GuildAdminFbtUtils.ogAccentCinnabar,
	"guildAdmin_ogAccentViolet": GuildAdminFbtUtils.ogAccentViolet,
	"guildAdmin_premiumLockedTitle": GuildAdminFbtUtils.premiumLockedTitle,
	"guildAdmin_premiumLockedBody": GuildAdminFbtUtils.premiumLockedBody,
	"guildAdmin_premiumCheckoutButton": GuildAdminFbtUtils.premiumCheckoutButton,
	"guildAdmin_premiumComingSoon": GuildAdminFbtUtils.premiumComingSoon,
	"guildAdmin_premiumActiveTitle": GuildAdminFbtUtils.premiumActiveTitle,
	"guildAdmin_premiumPlanName": GuildAdminFbtUtils.premiumPlanName,
	"guildAdmin_premiumSourceStripe": GuildAdminFbtUtils.premiumSourceStripe,
	"guildAdmin_premiumSourceManual": GuildAdminFbtUtils.premiumSourceManual,
	"guildAdmin_premiumPeriodEnd": GuildAdminFbtUtils.premiumPeriodEnd,
	"guildAdmin_premiumPriceMonth": GuildAdminFbtUtils.premiumPriceMonth,
	"guildAdmin_premiumTier1Name": GuildAdminFbtUtils.premiumTier1Name,
	"guildAdmin_premiumTier2Name": GuildAdminFbtUtils.premiumTier2Name,
	"guildAdmin_premiumTier3Name": GuildAdminFbtUtils.premiumTier3Name,
	"guildAdmin_premiumTier1Subtitle": GuildAdminFbtUtils.premiumTier1Subtitle,
	"guildAdmin_premiumTier2Subtitle": GuildAdminFbtUtils.premiumTier2Subtitle,
	"guildAdmin_premiumTier3Subtitle": GuildAdminFbtUtils.premiumTier3Subtitle,
	"guildAdmin_premiumSourceTrial": GuildAdminFbtUtils.premiumSourceTrial,
	"guildAdmin_premiumPastDueNotice": GuildAdminFbtUtils.premiumPastDueNotice,
	"guildAdmin_premiumPriceYear": GuildAdminFbtUtils.premiumPriceYear,
	"guildAdmin_customDomainTitle": GuildAdminFbtUtils.customDomainTitle,
	"guildAdmin_customDomainHint": GuildAdminFbtUtils.customDomainHint,
	"guildAdmin_customDomainHostnameLabel": GuildAdminFbtUtils.customDomainHostnameLabel,
	"guildAdmin_customDomainHostnamePlaceholder": GuildAdminFbtUtils.customDomainHostnamePlaceholder,
	"guildAdmin_customDomainBindButton": GuildAdminFbtUtils.customDomainBindButton,
	"guildAdmin_customDomainRebindButton": GuildAdminFbtUtils.customDomainRebindButton,
	"guildAdmin_customDomainVerifyButton": GuildAdminFbtUtils.customDomainVerifyButton,
	"guildAdmin_customDomainRemoveButton": GuildAdminFbtUtils.customDomainRemoveButton,
	"guildAdmin_customDomainStatusNone": GuildAdminFbtUtils.customDomainStatusNone,
	"guildAdmin_customDomainStatusPendingSeam": GuildAdminFbtUtils.customDomainStatusPendingSeam,
	"guildAdmin_customDomainStatusPendingDns": GuildAdminFbtUtils.customDomainStatusPendingDns,
	"guildAdmin_customDomainStatusActive": GuildAdminFbtUtils.customDomainStatusActive,
	"guildAdmin_customDomainStatusDisabled": GuildAdminFbtUtils.customDomainStatusDisabled,
	"guildAdmin_customDomainBoundAt": GuildAdminFbtUtils.customDomainBoundAt,
	"guildAdmin_customDomainDnsTitle": GuildAdminFbtUtils.customDomainDnsTitle,
	"guildAdmin_customDomainCnameLabel": GuildAdminFbtUtils.customDomainCnameLabel,
	"guildAdmin_customDomainTxtLabel": GuildAdminFbtUtils.customDomainTxtLabel,
	"guildAdmin_customDomainRecordNameLabel": GuildAdminFbtUtils.customDomainRecordNameLabel,
	"guildAdmin_customDomainRecordValueLabel": GuildAdminFbtUtils.customDomainRecordValueLabel,
	"guildAdmin_customDomainSeamNote": GuildAdminFbtUtils.customDomainSeamNote,
	"guildAdmin_customDomainDnsNote": GuildAdminFbtUtils.customDomainDnsNote,
	"guildAdmin_customDomainActiveNote": GuildAdminFbtUtils.customDomainActiveNote,
	"guildAdmin_customDomainDisabledNote": GuildAdminFbtUtils.customDomainDisabledNote,
	"guildAdmin_billingSuccess": GuildAdminFbtUtils.billingSuccess,
	"guildAdmin_billingCanceled": GuildAdminFbtUtils.billingCanceled,
	"guildAdmin_tabAnnouncements": GuildAdminFbtUtils.tabAnnouncements,
	"guildAdmin_tabTools": GuildAdminFbtUtils.tabTools,
	"guildAdmin_lotteryTitle": GuildAdminFbtUtils.lotteryTitle,
	"guildAdmin_lotteryHint": GuildAdminFbtUtils.lotteryHint,
	"guildAdmin_lotteryEmpty": GuildAdminFbtUtils.lotteryEmpty,
	"guildAdmin_lotteryNameLabel": GuildAdminFbtUtils.lotteryNameLabel,
	"guildAdmin_lotteryPrizeLabel": GuildAdminFbtUtils.lotteryPrizeLabel,
	"guildAdmin_lotterySourceLabel": GuildAdminFbtUtils.lotterySourceLabel,
	"guildAdmin_lotterySourceGrouping": GuildAdminFbtUtils.lotterySourceGrouping,
	"guildAdmin_lotterySourceMembers": GuildAdminFbtUtils.lotterySourceMembers,
	"guildAdmin_lotteryGroupingLabel": GuildAdminFbtUtils.lotteryGroupingLabel,
	"guildAdmin_lotteryWinnerCountLabel": GuildAdminFbtUtils.lotteryWinnerCountLabel,
	"guildAdmin_lotteryUniformWeightLabel": GuildAdminFbtUtils.lotteryUniformWeightLabel,
	"guildAdmin_lotteryWeightLabel": GuildAdminFbtUtils.lotteryWeightLabel,
	"guildAdmin_lotteryEntriesLabel": GuildAdminFbtUtils.lotteryEntriesLabel,
	"guildAdmin_lotteryWinnersLabel": GuildAdminFbtUtils.lotteryWinnersLabel,
	"guildAdmin_lotteryCreateButton": GuildAdminFbtUtils.lotteryCreateButton,
	"guildAdmin_lotteryDrawButton": GuildAdminFbtUtils.lotteryDrawButton,
	"guildAdmin_lotteryStatusOpen": GuildAdminFbtUtils.lotteryStatusOpen,
	"guildAdmin_lotteryStatusDrawn": GuildAdminFbtUtils.lotteryStatusDrawn,
	"guildAdmin_lotteryEntryCount": GuildAdminFbtUtils.lotteryEntryCount,
	"guildAdmin_tabRecruit": GuildAdminFbtUtils.tabRecruit,
	"guildAdmin_tabOfficer": GuildAdminFbtUtils.tabOfficer,
	"guildAdmin_tabGovernance": GuildAdminFbtUtils.tabGovernance,
	"groupingTemplate_sectionTitle": GroupingTemplateFbtUtils.sectionTitle,
	"groupingTemplate_nameLabel": GroupingTemplateFbtUtils.nameLabel,
	"groupingTemplate_namePlaceholder": GroupingTemplateFbtUtils.namePlaceholder,
	"groupingTemplate_saveFromForm": GroupingTemplateFbtUtils.saveFromForm,
	"groupingTemplate_updateSubmit": GroupingTemplateFbtUtils.updateSubmit,
	"groupingTemplate_editingNotice": GroupingTemplateFbtUtils.editingNotice,
	"groupingTemplate_cancelEdit": GroupingTemplateFbtUtils.cancelEdit,
	"groupingTemplate_empty": GroupingTemplateFbtUtils.empty,
	"groupingTemplate_whenToday": GroupingTemplateFbtUtils.whenToday,
	"groupingTemplate_whenTomorrow": GroupingTemplateFbtUtils.whenTomorrow,
	"groupingTemplate_whenDays": GroupingTemplateFbtUtils.whenDays,
	"groupingTemplate_toastSaved": GroupingTemplateFbtUtils.toastSaved,
	"groupingTemplate_toastSaveFailed": GroupingTemplateFbtUtils.toastSaveFailed,
	"groupingTemplate_toastDeleted": GroupingTemplateFbtUtils.toastDeleted,
	"groupingTemplate_toastDeleteFailed": GroupingTemplateFbtUtils.toastDeleteFailed,
	"groupingTemplate_edit": GroupingTemplateFbtUtils.edit,
	"groupingTemplate_delete": GroupingTemplateFbtUtils.delete,
	"groupingTemplate_deleteConfirmTitle": GroupingTemplateFbtUtils.deleteConfirmTitle,
	"groupingTemplate_deleteConfirmMessage": GroupingTemplateFbtUtils.deleteConfirmMessage,
	"groupingTemplate_saveButton": GroupingTemplateFbtUtils.saveButton,
	"groupingTemplate_saveDialogTitle": GroupingTemplateFbtUtils.saveDialogTitle,
	"groupingTemplate_saveSubmit": GroupingTemplateFbtUtils.saveSubmit,
	"groupingTemplate_toastSavedFromCar": GroupingTemplateFbtUtils.toastSavedFromCar,
	"groupingTemplate_metaTemplate": GroupingTemplateFbtUtils.metaTemplate,
	"account_sectionTitle": AccountFbtUtils.sectionTitle,
	"account_exportLabel": AccountFbtUtils.exportLabel,
	"account_exportHint": AccountFbtUtils.exportHint,
	"account_deleteLabel": AccountFbtUtils.deleteLabel,
	"account_deleteHint": AccountFbtUtils.deleteHint,
	"account_reauthLabel": AccountFbtUtils.reauthLabel,
	"account_reauthHint": AccountFbtUtils.reauthHint,
	"account_confirmTitle": AccountFbtUtils.confirmTitle,
	"account_confirmIntro": AccountFbtUtils.confirmIntro,
	"account_consequenceCars": AccountFbtUtils.consequenceCars,
	"account_consequenceData": AccountFbtUtils.consequenceData,
	"account_consequenceGuilds": AccountFbtUtils.consequenceGuilds,
	"account_consequenceResidual": AccountFbtUtils.consequenceResidual,
	"account_consequenceReregister": AccountFbtUtils.consequenceReregister,
	"account_exportFirstHint": AccountFbtUtils.exportFirstHint,
	"account_usernameLabel": AccountFbtUtils.usernameLabel,
	"account_submitLabel": AccountFbtUtils.submitLabel,
	"account_backLabel": AccountFbtUtils.backLabel,
	"account_pendingTitle": AccountFbtUtils.pendingTitle,
	"account_pendingBody": AccountFbtUtils.pendingBody,
	"account_cancelDeletionLabel": AccountFbtUtils.cancelDeletionLabel,
	"account_deletionRequestedText": AccountFbtUtils.deletionRequestedText,
	"account_deletionCancelledText": AccountFbtUtils.deletionCancelledText,
	"account_exportAbout": AccountFbtUtils.exportAbout,
	"account_deletedUser": AccountFbtUtils.deletedUser,
	"buildshare_kicker": BuildshareFbtUtils.kicker,
	"buildshare_loginLabel": BuildshareFbtUtils.loginLabel,
	"buildshare_notFoundTitle": BuildshareFbtUtils.notFoundTitle,
	"buildshare_notFoundBody": BuildshareFbtUtils.notFoundBody,
	"buildshare_xinfaLabel": BuildshareFbtUtils.xinfaLabel,
	"landing_featuresTitle": LandingFbtUtils.featuresTitle,
	"landing_groupingTitle": LandingFbtUtils.groupingTitle,
	"landing_groupingBody": LandingFbtUtils.groupingBody,
	"landing_reminderTitle": LandingFbtUtils.reminderTitle,
	"landing_reminderBody": LandingFbtUtils.reminderBody,
	"landing_dexTitle": LandingFbtUtils.dexTitle,
	"landing_dexBody": LandingFbtUtils.dexBody,
	"landing_gearTitle": LandingFbtUtils.gearTitle,
	"landing_gearBody": LandingFbtUtils.gearBody,
	"feedback_entryLabel": FeedbackFbtUtils.entryLabel,
	"feedback_title": FeedbackFbtUtils.title,
	"feedback_categoryLabel": FeedbackFbtUtils.categoryLabel,
	"feedback_catProblem": FeedbackFbtUtils.catProblem,
	"feedback_catSuggestion": FeedbackFbtUtils.catSuggestion,
	"feedback_catOther": FeedbackFbtUtils.catOther,
	"feedback_placeholder": FeedbackFbtUtils.placeholder,
	"feedback_submit": FeedbackFbtUtils.submit,
	"feedback_submitting": FeedbackFbtUtils.submitting,
	"feedback_success": FeedbackFbtUtils.success,
	"announcements_title": AnnouncementsFbtUtils.title,
	"announcements_emptyText": AnnouncementsFbtUtils.emptyText,
	"announcements_urgentLabel": AnnouncementsFbtUtils.urgentLabel,
	"announcements_standardLabel": AnnouncementsFbtUtils.standardLabel,
	"announcements_unreadLabel": AnnouncementsFbtUtils.unreadLabel,
	"announcements_readLabel": AnnouncementsFbtUtils.readLabel,
	"announcements_composeTitle": AnnouncementsFbtUtils.composeTitle,
	"announcements_kindLabel": AnnouncementsFbtUtils.kindLabel,
	"announcements_kindStandardLabel": AnnouncementsFbtUtils.kindStandardLabel,
	"announcements_kindUrgentLabel": AnnouncementsFbtUtils.kindUrgentLabel,
	"announcements_titleLabel": AnnouncementsFbtUtils.titleLabel,
	"announcements_titlePlaceholder": AnnouncementsFbtUtils.titlePlaceholder,
	"announcements_bodyLabel": AnnouncementsFbtUtils.bodyLabel,
	"announcements_bodyPlaceholder": AnnouncementsFbtUtils.bodyPlaceholder,
	"announcements_postLabel": AnnouncementsFbtUtils.postLabel,
	"announcements_postingLabel": AnnouncementsFbtUtils.postingLabel,
	"announcements_postedText": AnnouncementsFbtUtils.postedText,
	"announcements_deleteLabel": AnnouncementsFbtUtils.deleteLabel,
	"announcements_deleteConfirmTitle": AnnouncementsFbtUtils.deleteConfirmTitle,
	"announcements_deleteConfirmMessage": AnnouncementsFbtUtils.deleteConfirmMessage,
	"announcements_deletedText": AnnouncementsFbtUtils.deletedText,
	"announcements_receiptsTitle": AnnouncementsFbtUtils.receiptsTitle,
	"announcements_readCountTemplate": AnnouncementsFbtUtils.readCountTemplate,
	"announcements_readListLabel": AnnouncementsFbtUtils.readListLabel,
	"announcements_unreadListLabel": AnnouncementsFbtUtils.unreadListLabel,
	"announcements_authorTemplate": AnnouncementsFbtUtils.authorTemplate,
	"announcements_pushNote": AnnouncementsFbtUtils.pushNote,
	"announcements_urgentNote": AnnouncementsFbtUtils.urgentNote,
	"announcements_dailyLimitTemplate": AnnouncementsFbtUtils.dailyLimitTemplate,
	"announcements_translatedSourceLabel": AnnouncementsFbtUtils.translatedSourceLabel,
	"announcements_originalSourceLabel": AnnouncementsFbtUtils.originalSourceLabel,
	"announcements_generateTranslationsLabel": AnnouncementsFbtUtils.generateTranslationsLabel,
	"announcements_generatingTranslationsLabel": AnnouncementsFbtUtils.generatingTranslationsLabel,
	"announcements_translationsGeneratedText": AnnouncementsFbtUtils.translationsGeneratedText,
	"announcements_translationsPartialText": AnnouncementsFbtUtils.translationsPartialText,
	"announcements_translationUnavailableText": AnnouncementsFbtUtils.translationUnavailableText,
	"announcements_translationStatusNone": AnnouncementsFbtUtils.translationStatusNone,
	"announcements_translationStatusDoneTemplate": AnnouncementsFbtUtils.translationStatusDoneTemplate,
	"announcements_translationStatusFailed": AnnouncementsFbtUtils.translationStatusFailed,
	"announcements_translationLocaleDoneLabel": AnnouncementsFbtUtils.translationLocaleDoneLabel,
	"announcements_translationLocaleFailedLabel": AnnouncementsFbtUtils.translationLocaleFailedLabel,
	"announcements_translationLocalePendingLabel": AnnouncementsFbtUtils.translationLocalePendingLabel,
	"schedule_title": ScheduleFbtUtils.title,
	"schedule_myTitle": ScheduleFbtUtils.myTitle,
	"schedule_myHint": ScheduleFbtUtils.myHint,
	"schedule_slotRange": ScheduleFbtUtils.slotRange,
	"schedule_addSlotLabel": ScheduleFbtUtils.addSlotLabel,
	"schedule_removeLabel": ScheduleFbtUtils.removeLabel,
	"schedule_saveLabel": ScheduleFbtUtils.saveLabel,
	"schedule_savedText": ScheduleFbtUtils.savedText,
	"schedule_saveFailedTemplate": ScheduleFbtUtils.saveFailedTemplate,
	"schedule_emptyMineText": ScheduleFbtUtils.emptyMineText,
	"schedule_summaryTitle": ScheduleFbtUtils.summaryTitle,
	"schedule_summaryHint": ScheduleFbtUtils.summaryHint,
	"schedule_summaryEmptyText": ScheduleFbtUtils.summaryEmptyText,
	"schedule_pollsTitle": ScheduleFbtUtils.pollsTitle,
	"schedule_pollsHint": ScheduleFbtUtils.pollsHint,
	"schedule_pollEmptyText": ScheduleFbtUtils.pollEmptyText,
	"schedule_pollCreateLabel": ScheduleFbtUtils.pollCreateLabel,
	"schedule_pollTitleLabel": ScheduleFbtUtils.pollTitleLabel,
	"schedule_pollTitlePlaceholder": ScheduleFbtUtils.pollTitlePlaceholder,
	"schedule_pollCandidatesLabel": ScheduleFbtUtils.pollCandidatesLabel,
	"schedule_pollAddCandidateLabel": ScheduleFbtUtils.pollAddCandidateLabel,
	"schedule_pollSubmitLabel": ScheduleFbtUtils.pollSubmitLabel,
	"schedule_pollVoteLabel": ScheduleFbtUtils.pollVoteLabel,
	"schedule_pollVotedText": ScheduleFbtUtils.pollVotedText,
	"schedule_pollStatusOpenText": ScheduleFbtUtils.pollStatusOpenText,
	"schedule_pollStatusClosedText": ScheduleFbtUtils.pollStatusClosedText,
	"schedule_pollCloseLabel": ScheduleFbtUtils.pollCloseLabel,
	"schedule_pollVoteCountTemplate": ScheduleFbtUtils.pollVoteCountTemplate,
	"schedule_pollLaunchLabel": ScheduleFbtUtils.pollLaunchLabel,
	"schedule_pollCancelLabel": ScheduleFbtUtils.pollCancelLabel,
	"schedule_toastPollCreated": ScheduleFbtUtils.toastPollCreated,
	"schedule_toastVoted": ScheduleFbtUtils.toastVoted,
	"schedule_toastClosed": ScheduleFbtUtils.toastClosed,
	"schedule_toastFailedTemplate": ScheduleFbtUtils.toastFailedTemplate,
	"schedule_settingsLinkLabel": ScheduleFbtUtils.settingsLinkLabel,
	"schedule_noGuildsText": ScheduleFbtUtils.noGuildsText,
	"recruit_title": RecruitFbtUtils.title,
	"recruit_directoryTitle": RecruitFbtUtils.directoryTitle,
	"recruit_newcomerTitle": RecruitFbtUtils.newcomerTitle,
	"recruit_homeBody": RecruitFbtUtils.homeBody,
	"recruit_homeLoginHint": RecruitFbtUtils.homeLoginHint,
	"recruit_applySectionTitle": RecruitFbtUtils.applySectionTitle,
	"recruit_messageLabel": RecruitFbtUtils.messageLabel,
	"recruit_messagePlaceholder": RecruitFbtUtils.messagePlaceholder,
	"recruit_submitButton": RecruitFbtUtils.submitButton,
	"recruit_submittingButton": RecruitFbtUtils.submittingButton,
	"recruit_myApplicationTitle": RecruitFbtUtils.myApplicationTitle,
	"recruit_statusPending": RecruitFbtUtils.statusPending,
	"recruit_statusApproved": RecruitFbtUtils.statusApproved,
	"recruit_statusRejected": RecruitFbtUtils.statusRejected,
	"recruit_pendingHint": RecruitFbtUtils.pendingHint,
	"recruit_approvedNextStep": RecruitFbtUtils.approvedNextStep,
	"recruit_rejectedHint": RecruitFbtUtils.rejectedHint,
	"recruit_checklistTitle": RecruitFbtUtils.checklistTitle,
	"recruit_checklistProgress": RecruitFbtUtils.checklistProgress,
	"recruit_itemProfileLabel": RecruitFbtUtils.itemProfileLabel,
	"recruit_itemProfileHint": RecruitFbtUtils.itemProfileHint,
	"recruit_itemMentorLabel": RecruitFbtUtils.itemMentorLabel,
	"recruit_itemMentorHint": RecruitFbtUtils.itemMentorHint,
	"recruit_itemFirstRunLabel": RecruitFbtUtils.itemFirstRunLabel,
	"recruit_itemFirstRunHint": RecruitFbtUtils.itemFirstRunHint,
	"recruit_myPairingsTitle": RecruitFbtUtils.myPairingsTitle,
	"recruit_itemAvailabilityLabel": RecruitFbtUtils.itemAvailabilityLabel,
	"recruit_itemAvailabilityHint": RecruitFbtUtils.itemAvailabilityHint,
	"recruit_pairingStatusActive": RecruitFbtUtils.pairingStatusActive,
	"recruit_pairingStatusEnded": RecruitFbtUtils.pairingStatusEnded,
	"recruit_mentorRoleLabel": RecruitFbtUtils.mentorRoleLabel,
	"recruit_menteeRoleLabel": RecruitFbtUtils.menteeRoleLabel,
	"recruit_adminApplicationsTitle": RecruitFbtUtils.adminApplicationsTitle,
	"recruit_adminApplicationsEmpty": RecruitFbtUtils.adminApplicationsEmpty,
	"recruit_adminApproveButton": RecruitFbtUtils.adminApproveButton,
	"recruit_adminRejectButton": RecruitFbtUtils.adminRejectButton,
	"recruit_adminMentorPoolTitle": RecruitFbtUtils.adminMentorPoolTitle,
	"recruit_adminSetMentorButton": RecruitFbtUtils.adminSetMentorButton,
	"recruit_adminUnsetMentorButton": RecruitFbtUtils.adminUnsetMentorButton,
	"recruit_adminPairingsTitle": RecruitFbtUtils.adminPairingsTitle,
	"recruit_adminPairingsEmpty": RecruitFbtUtils.adminPairingsEmpty,
	"recruit_adminPairingCreateButton": RecruitFbtUtils.adminPairingCreateButton,
	"recruit_adminPairingEndButton": RecruitFbtUtils.adminPairingEndButton,
	"recruit_adminMentorSelectLabel": RecruitFbtUtils.adminMentorSelectLabel,
	"recruit_adminMenteeSelectLabel": RecruitFbtUtils.adminMenteeSelectLabel,
	"recruit_adminNewcomersTitle": RecruitFbtUtils.adminNewcomersTitle,
	"recruit_adminNewcomersEmpty": RecruitFbtUtils.adminNewcomersEmpty,
	"recruit_adminRecruitOpenLabel": RecruitFbtUtils.adminRecruitOpenLabel,
	"recruit_adminRecruitOpenHint": RecruitFbtUtils.adminRecruitOpenHint,
	"officer_notesTitle": OfficerFbtUtils.notesTitle,
	"officer_notesHint": OfficerFbtUtils.notesHint,
	"officer_notesEmpty": OfficerFbtUtils.notesEmpty,
	"officer_memberNoNotes": OfficerFbtUtils.memberNoNotes,
	"officer_notePlaceholder": OfficerFbtUtils.notePlaceholder,
	"officer_noteAddButton": OfficerFbtUtils.noteAddButton,
	"officer_noteEditButton": OfficerFbtUtils.noteEditButton,
	"officer_noteSaveButton": OfficerFbtUtils.noteSaveButton,
	"officer_noteDeleteButton": OfficerFbtUtils.noteDeleteButton,
	"officer_noteAuthorTemplate": OfficerFbtUtils.noteAuthorTemplate,
	"officer_exportTitle": OfficerFbtUtils.exportTitle,
	"officer_exportHint": OfficerFbtUtils.exportHint,
	"officer_exportButton": OfficerFbtUtils.exportButton,
	"officer_exportAbout": OfficerFbtUtils.exportAbout,
	"officer_exportDefaultCreatorName": OfficerFbtUtils.exportDefaultCreatorName,
	"officer_goalsTitle": OfficerFbtUtils.goalsTitle,
	"officer_goalsHint": OfficerFbtUtils.goalsHint,
	"officer_goalsEmpty": OfficerFbtUtils.goalsEmpty,
	"officer_statusActive": OfficerFbtUtils.statusActive,
	"officer_statusDone": OfficerFbtUtils.statusDone,
	"officer_statusDropped": OfficerFbtUtils.statusDropped,
	"officer_myEntryLabel": OfficerFbtUtils.myEntryLabel,
	"officer_myTitle": OfficerFbtUtils.myTitle,
	"officer_myHint": OfficerFbtUtils.myHint,
	"officer_myEmpty": OfficerFbtUtils.myEmpty,
	"officer_goalGuildLabel": OfficerFbtUtils.goalGuildLabel,
	"officer_goalTitleLabel": OfficerFbtUtils.goalTitleLabel,
	"officer_goalTitlePlaceholder": OfficerFbtUtils.goalTitlePlaceholder,
	"officer_goalNoteLabel": OfficerFbtUtils.goalNoteLabel,
	"officer_goalNotePlaceholder": OfficerFbtUtils.goalNotePlaceholder,
	"officer_goalDungeonLabel": OfficerFbtUtils.goalDungeonLabel,
	"officer_goalDungeonNone": OfficerFbtUtils.goalDungeonNone,
	"officer_goalStatusLabel": OfficerFbtUtils.goalStatusLabel,
	"officer_goalAddButton": OfficerFbtUtils.goalAddButton,
	"officer_goalSaveButton": OfficerFbtUtils.goalSaveButton,
	"officer_goalEditButton": OfficerFbtUtils.goalEditButton,
	"officer_goalDeleteButton": OfficerFbtUtils.goalDeleteButton,
	"ops_tabOps": OpsFbtUtils.tabOps,
	"ops_title": OpsFbtUtils.title,
	"ops_hint": OpsFbtUtils.hint,
	"ops_nudgeTitle": OpsFbtUtils.nudgeTitle,
	"ops_nudgeHint": OpsFbtUtils.nudgeHint,
	"ops_nudgeEventLabel": OpsFbtUtils.nudgeEventLabel,
	"ops_nudgeSegmentLabel": OpsFbtUtils.nudgeSegmentLabel,
	"ops_segmentAll": OpsFbtUtils.segmentAll,
	"ops_segmentSchool": OpsFbtUtils.segmentSchool,
	"ops_segmentRole": OpsFbtUtils.segmentRole,
	"ops_segmentLapsed": OpsFbtUtils.segmentLapsed,
	"ops_nudgeSegmentValueLabel": OpsFbtUtils.nudgeSegmentValueLabel,
	"ops_nudgePreviewButton": OpsFbtUtils.nudgePreviewButton,
	"ops_nudgeSendButton": OpsFbtUtils.nudgeSendButton,
	"ops_nudgeCandidateCount": OpsFbtUtils.nudgeCandidateCount,
	"ops_nudgeEmpty": OpsFbtUtils.nudgeEmpty,
	"ops_nudgeDailyRemaining": OpsFbtUtils.nudgeDailyRemaining,
	"ops_nudgeMessage": OpsFbtUtils.nudgeMessage,
	"ops_lastNever": OpsFbtUtils.lastNever,
	"ops_lastAt": OpsFbtUtils.lastAt,
	"ops_churnTitle": OpsFbtUtils.churnTitle,
	"ops_churnHint": OpsFbtUtils.churnHint,
	"ops_churnEmpty": OpsFbtUtils.churnEmpty,
	"ops_churnEvidence": OpsFbtUtils.churnEvidence,
	"ops_rolloverTitle": OpsFbtUtils.rolloverTitle,
	"ops_rolloverHint": OpsFbtUtils.rolloverHint,
	"ops_rolloverSeason": OpsFbtUtils.rolloverSeason,
	"ops_rolloverPreview": OpsFbtUtils.rolloverPreview,
	"ops_rolloverExecuteButton": OpsFbtUtils.rolloverExecuteButton,
	"ops_rolloverDone": OpsFbtUtils.rolloverDone,
	"ops_rolloverGearNote": OpsFbtUtils.rolloverGearNote,
	"ops_rolloverThresholdNote": OpsFbtUtils.rolloverThresholdNote,
	"ops_rolloverLast": OpsFbtUtils.rolloverLast,
	"ops_pointsTitle": OpsFbtUtils.pointsTitle,
	"ops_pointsHint": OpsFbtUtils.pointsHint,
	"ops_ruleAttendance": OpsFbtUtils.ruleAttendance,
	"ops_ruleLeading": OpsFbtUtils.ruleLeading,
	"ops_ruleMentoring": OpsFbtUtils.ruleMentoring,
	"ops_pointsValue": OpsFbtUtils.pointsValue,
	"ops_pointsBoardEmpty": OpsFbtUtils.pointsBoardEmpty,
	"ops_pointsTotalLabel": OpsFbtUtils.pointsTotalLabel,
	"ops_pointsEntriesLabel": OpsFbtUtils.pointsEntriesLabel,
	"ops_saveButton": OpsFbtUtils.saveButton,
	"ops_myPointsTitle": OpsFbtUtils.myPointsTitle,
	"ops_myPointsTotal": OpsFbtUtils.myPointsTotal,
	"market_title": MarketFbtUtils.title,
	"market_body": MarketFbtUtils.body,
	"market_lockedTitle": MarketFbtUtils.lockedTitle,
	"market_lockedBody": MarketFbtUtils.lockedBody,
	"market_supplyTitle": MarketFbtUtils.supplyTitle,
	"market_supplyHint": MarketFbtUtils.supplyHint,
	"market_supplyEmpty": MarketFbtUtils.supplyEmpty,
	"market_schoolLabel": MarketFbtUtils.schoolLabel,
	"market_windowsLabel": MarketFbtUtils.windowsLabel,
	"market_noteLabel": MarketFbtUtils.noteLabel,
	"market_notePlaceholder": MarketFbtUtils.notePlaceholder,
	"market_publishButton": MarketFbtUtils.publishButton,
	"market_withdrawButton": MarketFbtUtils.withdrawButton,
	"market_offerStatusOpen": MarketFbtUtils.offerStatusOpen,
	"market_homeGuildPattern": MarketFbtUtils.homeGuildPattern,
	"market_windowLine": MarketFbtUtils.windowLine,
	"market_weekday0": MarketFbtUtils.weekday0,
	"market_weekday1": MarketFbtUtils.weekday1,
	"market_weekday2": MarketFbtUtils.weekday2,
	"market_weekday3": MarketFbtUtils.weekday3,
	"market_weekday4": MarketFbtUtils.weekday4,
	"market_weekday5": MarketFbtUtils.weekday5,
	"market_weekday6": MarketFbtUtils.weekday6,
	"market_inboxTitle": MarketFbtUtils.inboxTitle,
	"market_inboxEmpty": MarketFbtUtils.inboxEmpty,
	"market_acceptButton": MarketFbtUtils.acceptButton,
	"market_declineButton": MarketFbtUtils.declineButton,
	"market_inviteStatusPending": MarketFbtUtils.inviteStatusPending,
	"market_inviteStatusAccepted": MarketFbtUtils.inviteStatusAccepted,
	"market_inviteStatusDeclined": MarketFbtUtils.inviteStatusDeclined,
	"market_inviteStatusExpired": MarketFbtUtils.inviteStatusExpired,
	"market_inviteFromPattern": MarketFbtUtils.inviteFromPattern,
	"market_demandTitle": MarketFbtUtils.demandTitle,
	"market_demandLockedTitle": MarketFbtUtils.demandLockedTitle,
	"market_demandLockedBody": MarketFbtUtils.demandLockedBody,
	"market_demandNoManageHint": MarketFbtUtils.demandNoManageHint,
	"market_requestsTitle": MarketFbtUtils.requestsTitle,
	"market_requestsEmpty": MarketFbtUtils.requestsEmpty,
	"market_createRequestTitle": MarketFbtUtils.createRequestTitle,
	"market_groupingLabel": MarketFbtUtils.groupingLabel,
	"market_neededRoleLabel": MarketFbtUtils.neededRoleLabel,
	"market_neededSchoolLabel": MarketFbtUtils.neededSchoolLabel,
	"market_requestNoteLabel": MarketFbtUtils.requestNoteLabel,
	"market_createRequestButton": MarketFbtUtils.createRequestButton,
	"market_closeRequestButton": MarketFbtUtils.closeRequestButton,
	"market_requestStatusOpen": MarketFbtUtils.requestStatusOpen,
	"market_requestStatusMatched": MarketFbtUtils.requestStatusMatched,
	"market_requestStatusClosed": MarketFbtUtils.requestStatusClosed,
	"market_offersTitle": MarketFbtUtils.offersTitle,
	"market_offersEmpty": MarketFbtUtils.offersEmpty,
	"market_inviteButton": MarketFbtUtils.inviteButton,
	"market_invitedLabel": MarketFbtUtils.invitedLabel,
	"market_seatButton": MarketFbtUtils.seatButton,
	"market_seatedLabel": MarketFbtUtils.seatedLabel,
	"market_roleHealer": MarketFbtUtils.roleHealer,
	"market_roleDps": MarketFbtUtils.roleDps,
	"market_backLabel": MarketFbtUtils.backLabel,
	"allies_title": AlliesFbtUtils.title,
	"allies_body": AlliesFbtUtils.body,
	"allies_lockedTitle": AlliesFbtUtils.lockedTitle,
	"allies_lockedBody": AlliesFbtUtils.lockedBody,
	"allies_tierLockedTitle": AlliesFbtUtils.tierLockedTitle,
	"allies_tierLockedBody": AlliesFbtUtils.tierLockedBody,
	"allies_activeTitle": AlliesFbtUtils.activeTitle,
	"allies_activeEmpty": AlliesFbtUtils.activeEmpty,
	"allies_statusPending": AlliesFbtUtils.statusPending,
	"allies_statusActive": AlliesFbtUtils.statusActive,
	"allies_adminTitle": AlliesFbtUtils.adminTitle,
	"allies_inviteLabel": AlliesFbtUtils.inviteLabel,
	"allies_inviteHint": AlliesFbtUtils.inviteHint,
	"allies_inviteButton": AlliesFbtUtils.inviteButton,
	"allies_incomingTitle": AlliesFbtUtils.incomingTitle,
	"allies_outgoingTitle": AlliesFbtUtils.outgoingTitle,
	"allies_acceptButton": AlliesFbtUtils.acceptButton,
	"allies_rejectButton": AlliesFbtUtils.rejectButton,
	"allies_endButton": AlliesFbtUtils.endButton,
	"allies_sharedTitle": AlliesFbtUtils.sharedTitle,
	"allies_sharedEmpty": AlliesFbtUtils.sharedEmpty,
	"allies_hostPattern": AlliesFbtUtils.hostPattern,
	"allies_visitorLeftPattern": AlliesFbtUtils.visitorLeftPattern,
	"allies_visitorJoinButton": AlliesFbtUtils.visitorJoinButton,
	"allies_visitorJoinedLabel": AlliesFbtUtils.visitorJoinedLabel,
	"allies_sharingTitle": AlliesFbtUtils.sharingTitle,
	"allies_sharingHint": AlliesFbtUtils.sharingHint,
	"allies_allyVisibleLabel": AlliesFbtUtils.allyVisibleLabel,
	"allies_visitorSlotsLabel": AlliesFbtUtils.visitorSlotsLabel,
	"allies_sharingSaveButton": AlliesFbtUtils.sharingSaveButton,
	"allies_backLabel": AlliesFbtUtils.backLabel,
	"governance_sectionLockedTitle": GovernanceFbtUtils.sectionLockedTitle,
	"governance_sectionLockedBody": GovernanceFbtUtils.sectionLockedBody,
	"governance_lockedTitle": GovernanceFbtUtils.lockedTitle,
	"governance_lockedBody": GovernanceFbtUtils.lockedBody,
	"governance_title": GovernanceFbtUtils.title,
	"governance_hint": GovernanceFbtUtils.hint,
	"governance_officersTitle": GovernanceFbtUtils.officersTitle,
	"governance_officersHint": GovernanceFbtUtils.officersHint,
	"governance_officersEmpty": GovernanceFbtUtils.officersEmpty,
	"governance_grantMemberLabel": GovernanceFbtUtils.grantMemberLabel,
	"governance_grantCapabilitiesLabel": GovernanceFbtUtils.grantCapabilitiesLabel,
	"governance_grantButton": GovernanceFbtUtils.grantButton,
	"governance_revokeButton": GovernanceFbtUtils.revokeButton,
	"governance_grantedByTemplate": GovernanceFbtUtils.grantedByTemplate,
	"governance_adminBadge": GovernanceFbtUtils.adminBadge,
	"governance_boardTitle": GovernanceFbtUtils.boardTitle,
	"governance_boardHint": GovernanceFbtUtils.boardHint,
	"governance_boardEmpty": GovernanceFbtUtils.boardEmpty,
	"governance_boardPlaceholder": GovernanceFbtUtils.boardPlaceholder,
	"governance_boardPostButton": GovernanceFbtUtils.boardPostButton,
	"governance_boardDeleteButton": GovernanceFbtUtils.boardDeleteButton,
	"governance_boardAuthorTemplate": GovernanceFbtUtils.boardAuthorTemplate,
	"governance_auditTitle": GovernanceFbtUtils.auditTitle,
	"governance_auditHint": GovernanceFbtUtils.auditHint,
	"governance_auditEmpty": GovernanceFbtUtils.auditEmpty,
	"governance_auditLoadMoreButton": GovernanceFbtUtils.auditLoadMoreButton,
	"governance_auditActorFallback": GovernanceFbtUtils.auditActorFallback,
	"governance_capProfile": GovernanceFbtUtils.capProfile,
	"governance_capDiscord": GovernanceFbtUtils.capDiscord,
	"governance_capEvents": GovernanceFbtUtils.capEvents,
	"governance_capGuides": GovernanceFbtUtils.capGuides,
	"governance_capAnnounce": GovernanceFbtUtils.capAnnounce,
	"governance_capStats": GovernanceFbtUtils.capStats,
	"governance_capTools": GovernanceFbtUtils.capTools,
	"governance_capSeason": GovernanceFbtUtils.capSeason,
	"governance_capRecruit": GovernanceFbtUtils.capRecruit,
	"governance_capOfficer": GovernanceFbtUtils.capOfficer,
	"governance_actionProfileUpdate": GovernanceFbtUtils.actionProfileUpdate,
	"governance_actionAvatarSet": GovernanceFbtUtils.actionAvatarSet,
	"governance_actionAvatarDelete": GovernanceFbtUtils.actionAvatarDelete,
	"governance_actionDiscordUpdate": GovernanceFbtUtils.actionDiscordUpdate,
	"governance_actionReminderUpdate": GovernanceFbtUtils.actionReminderUpdate,
	"governance_actionWhitelabelUpdate": GovernanceFbtUtils.actionWhitelabelUpdate,
	"governance_actionVisibilityUpdate": GovernanceFbtUtils.actionVisibilityUpdate,
	"governance_actionRecruitOpen": GovernanceFbtUtils.actionRecruitOpen,
	"governance_actionEventCreate": GovernanceFbtUtils.actionEventCreate,
	"governance_actionEventUpdate": GovernanceFbtUtils.actionEventUpdate,
	"governance_actionEventDelete": GovernanceFbtUtils.actionEventDelete,
	"governance_actionEventMerge": GovernanceFbtUtils.actionEventMerge,
	"governance_actionAgentJoin": GovernanceFbtUtils.actionAgentJoin,
	"governance_actionAgentLeave": GovernanceFbtUtils.actionAgentLeave,
	"governance_actionAgentReady": GovernanceFbtUtils.actionAgentReady,
	"governance_actionAgentCreate": GovernanceFbtUtils.actionAgentCreate,
	"governance_actionSignupRemove": GovernanceFbtUtils.actionSignupRemove,
	"governance_actionResultAdd": GovernanceFbtUtils.actionResultAdd,
	"governance_actionResultDelete": GovernanceFbtUtils.actionResultDelete,
	"governance_actionLotteryCreate": GovernanceFbtUtils.actionLotteryCreate,
	"governance_actionLotteryDraw": GovernanceFbtUtils.actionLotteryDraw,
	"governance_actionGuideUpdate": GovernanceFbtUtils.actionGuideUpdate,
	"governance_actionAnnouncementPost": GovernanceFbtUtils.actionAnnouncementPost,
	"governance_actionAnnouncementDelete": GovernanceFbtUtils.actionAnnouncementDelete,
	"governance_actionApplicationApprove": GovernanceFbtUtils.actionApplicationApprove,
	"governance_actionApplicationReject": GovernanceFbtUtils.actionApplicationReject,
	"governance_actionMentorSet": GovernanceFbtUtils.actionMentorSet,
	"governance_actionMentorUnset": GovernanceFbtUtils.actionMentorUnset,
	"governance_actionPairingCreate": GovernanceFbtUtils.actionPairingCreate,
	"governance_actionPairingEnd": GovernanceFbtUtils.actionPairingEnd,
	"governance_actionNoteAdd": GovernanceFbtUtils.actionNoteAdd,
	"governance_actionNoteUpdate": GovernanceFbtUtils.actionNoteUpdate,
	"governance_actionNoteDelete": GovernanceFbtUtils.actionNoteDelete,
	"governance_actionExportPackage": GovernanceFbtUtils.actionExportPackage,
	"governance_actionSeasonChecklist": GovernanceFbtUtils.actionSeasonChecklist,
	"governance_actionRosterImport": GovernanceFbtUtils.actionRosterImport,
	"governance_actionRosterEntryDelete": GovernanceFbtUtils.actionRosterEntryDelete,
	"governance_actionOfficerGrant": GovernanceFbtUtils.actionOfficerGrant,
	"governance_actionOfficerRevoke": GovernanceFbtUtils.actionOfficerRevoke,
	"governance_actionBoardPost": GovernanceFbtUtils.actionBoardPost,
	"governance_actionBoardDelete": GovernanceFbtUtils.actionBoardDelete,
	"platformAdmin_entryLabel": PlatformAdminFbtUtils.entryLabel,
	"platformAdmin_title": PlatformAdminFbtUtils.title,
	"platformAdmin_subtitle": PlatformAdminFbtUtils.subtitle,
	"platformAdmin_lockedTitle": PlatformAdminFbtUtils.lockedTitle,
	"platformAdmin_lockedBody": PlatformAdminFbtUtils.lockedBody,
	"platformAdmin_tenantsTitle": PlatformAdminFbtUtils.tenantsTitle,
	"platformAdmin_tenantsEmpty": PlatformAdminFbtUtils.tenantsEmpty,
	"platformAdmin_billingTitle": PlatformAdminFbtUtils.billingTitle,
	"platformAdmin_paygateLabel": PlatformAdminFbtUtils.paygateLabel,
	"platformAdmin_paygateOnText": PlatformAdminFbtUtils.paygateOnText,
	"platformAdmin_paygateOffText": PlatformAdminFbtUtils.paygateOffText,
	"platformAdmin_stripeLabel": PlatformAdminFbtUtils.stripeLabel,
	"platformAdmin_stripeConfiguredText": PlatformAdminFbtUtils.stripeConfiguredText,
	"platformAdmin_stripeMissingText": PlatformAdminFbtUtils.stripeMissingText,
	"platformAdmin_saasLabel": PlatformAdminFbtUtils.saasLabel,
	"platformAdmin_saasConfiguredText": PlatformAdminFbtUtils.saasConfiguredText,
	"platformAdmin_saasMissingText": PlatformAdminFbtUtils.saasMissingText,
	"platformAdmin_plansTitle": PlatformAdminFbtUtils.plansTitle,
	"platformAdmin_billingTenantsTitle": PlatformAdminFbtUtils.billingTenantsTitle,
	"platformAdmin_errorsTitle": PlatformAdminFbtUtils.errorsTitle,
	"platformAdmin_errorsEmpty": PlatformAdminFbtUtils.errorsEmpty,
	"platformAdmin_auditTitle": PlatformAdminFbtUtils.auditTitle,
	"platformAdmin_auditEmpty": PlatformAdminFbtUtils.auditEmpty,
	"platformAdmin_feedbackTitle": PlatformAdminFbtUtils.feedbackTitle,
	"platformAdmin_feedbackEmpty": PlatformAdminFbtUtils.feedbackEmpty,
	"platformAdmin_settingsTitle": PlatformAdminFbtUtils.settingsTitle,
	"platformAdmin_gameVersionLabel": PlatformAdminFbtUtils.gameVersionLabel,
	"platformAdmin_gameNoticeLabel": PlatformAdminFbtUtils.gameNoticeLabel,
	"platformAdmin_gameVersionCodeLabel": PlatformAdminFbtUtils.gameVersionCodeLabel,
	"platformAdmin_bossesTitle": PlatformAdminFbtUtils.bossesTitle,
	"platformAdmin_bossesEmpty": PlatformAdminFbtUtils.bossesEmpty,
	"platformAdmin_dungeonsTitle": PlatformAdminFbtUtils.dungeonsTitle,
	"platformAdmin_dungeonsEmpty": PlatformAdminFbtUtils.dungeonsEmpty,
	"platformAdmin_remindersTitle": PlatformAdminFbtUtils.remindersTitle,
	"platformAdmin_remindersEmpty": PlatformAdminFbtUtils.remindersEmpty,
	"platformAdmin_heirloomsTitle": PlatformAdminFbtUtils.heirloomsTitle,
	"platformAdmin_heirloomsEmpty": PlatformAdminFbtUtils.heirloomsEmpty,
	"platformAdmin_backupsTitle": PlatformAdminFbtUtils.backupsTitle,
	"platformAdmin_backupsEmpty": PlatformAdminFbtUtils.backupsEmpty,
	"platformAdmin_backupsUnavailableText": PlatformAdminFbtUtils.backupsUnavailableText,
	"platformAdmin_rosterTitle": PlatformAdminFbtUtils.rosterTitle,
	"platformAdmin_rosterNote": PlatformAdminFbtUtils.rosterNote,
	"platformAdmin_backfillsTitle": PlatformAdminFbtUtils.backfillsTitle,
	"platformAdmin_saveLabel": PlatformAdminFbtUtils.saveLabel,
	"platformAdmin_testLabel": PlatformAdminFbtUtils.testLabel,
	"platformAdmin_runLabel": PlatformAdminFbtUtils.runLabel,
	"platformAdmin_dryRunLabel": PlatformAdminFbtUtils.dryRunLabel,
	"platformAdmin_deleteTenantLabel": PlatformAdminFbtUtils.deleteTenantLabel,
	"platformAdmin_grantLabel": PlatformAdminFbtUtils.grantLabel,
	"platformAdmin_revokeLabel": PlatformAdminFbtUtils.revokeLabel,
	"platformAdmin_subdomainLabel": PlatformAdminFbtUtils.subdomainLabel,
	"platformAdmin_customDomainLabel": PlatformAdminFbtUtils.customDomainLabel,
	"platformAdmin_enabledText": PlatformAdminFbtUtils.enabledText,
	"platformAdmin_disabledText": PlatformAdminFbtUtils.disabledText,
	"platformAdmin_webhookSetText": PlatformAdminFbtUtils.webhookSetText,
	"platformAdmin_webhookUnsetText": PlatformAdminFbtUtils.webhookUnsetText,
	"platformAdmin_webhookCustomAddressText": PlatformAdminFbtUtils.webhookCustomAddressText,
	"platformAdmin_runBackupLabel": PlatformAdminFbtUtils.runBackupLabel,
	"platformAdmin_downloadLabel": PlatformAdminFbtUtils.downloadLabel,
	"platformAdmin_exportLabel": PlatformAdminFbtUtils.exportLabel,
	"platformAdmin_backfillReminderIdentityLabel": PlatformAdminFbtUtils.backfillReminderIdentityLabel,
	"platformAdmin_backfillCreatorsLabel": PlatformAdminFbtUtils.backfillCreatorsLabel,
	"platformAdmin_backfillKunpengDexLabel": PlatformAdminFbtUtils.backfillKunpengDexLabel,
	"platformAdmin_migrateBossGuidesLabel": PlatformAdminFbtUtils.migrateBossGuidesLabel,
	"platformAdmin_statusOpenText": PlatformAdminFbtUtils.statusOpenText,
	"platformAdmin_statusResolvedText": PlatformAdminFbtUtils.statusResolvedText,
	"platformAdmin_lastStatusLabel": PlatformAdminFbtUtils.lastStatusLabel,
	"platformAdmin_nextAlarmLabel": PlatformAdminFbtUtils.nextAlarmLabel,
	"platformAdmin_reminderErrorSendFailed": PlatformAdminFbtUtils.reminderErrorSendFailed,
	"platformAdmin_reminderErrorRateLimited": PlatformAdminFbtUtils.reminderErrorRateLimited,
	"platformAdmin_reminderErrorRateLimitedDetail": PlatformAdminFbtUtils.reminderErrorRateLimitedDetail,
	"platformAdmin_reminderErrorWebhookStatus": PlatformAdminFbtUtils.reminderErrorWebhookStatus,
	"platformAdmin_reminderErrorWebhookStatusDetail": PlatformAdminFbtUtils.reminderErrorWebhookStatusDetail,
	"platformAdmin_reminderErrorRequestFailed": PlatformAdminFbtUtils.reminderErrorRequestFailed,
	"platformAdmin_periodEndLabel": PlatformAdminFbtUtils.periodEndLabel,
	"platformAdmin_sourceLabel": PlatformAdminFbtUtils.sourceLabel,
	"platformAdmin_tierLabel": PlatformAdminFbtUtils.tierLabel,
	"platformAdmin_planLabel": PlatformAdminFbtUtils.planLabel,
	"platformAdmin_hasCardText": PlatformAdminFbtUtils.hasCardText,
	"platformAdmin_noCardText": PlatformAdminFbtUtils.noCardText,
	"platformAdmin_trialUsedText": PlatformAdminFbtUtils.trialUsedText,
	"carshare_kicker": CarshareFbtUtils.kicker,
	"carshare_loginLabel": CarshareFbtUtils.loginLabel,
	"carshare_openLabel": CarshareFbtUtils.openLabel,
	"carshare_notFoundTitle": CarshareFbtUtils.notFoundTitle,
	"carshare_notFoundBody": CarshareFbtUtils.notFoundBody,
	"carshare_readonlyHint": CarshareFbtUtils.readonlyHint,
	"carshare_statusClosed": CarshareFbtUtils.statusClosed,
	"carshare_seatsTitle": CarshareFbtUtils.seatsTitle,
	"schedulingAdvice_lockedTitle": SchedulingAdviceFbtUtils.lockedTitle,
	"schedulingAdvice_lockedBody": SchedulingAdviceFbtUtils.lockedBody,
	"schedulingAdvice_title": SchedulingAdviceFbtUtils.title,
	"schedulingAdvice_hint": SchedulingAdviceFbtUtils.hint,
	"schedulingAdvice_draftTitle": SchedulingAdviceFbtUtils.draftTitle,
	"schedulingAdvice_draftApplyLabel": SchedulingAdviceFbtUtils.draftApplyLabel,
	"schedulingAdvice_substitutesTitle": SchedulingAdviceFbtUtils.substitutesTitle,
	"schedulingAdvice_rotationTitle": SchedulingAdviceFbtUtils.rotationTitle,
	"schedulingAdvice_rotationSaveLabel": SchedulingAdviceFbtUtils.rotationSaveLabel,
	"schedulingAdvice_rotationSavedText": SchedulingAdviceFbtUtils.rotationSavedText,
	"schedulingAdvice_bestSlotsTitle": SchedulingAdviceFbtUtils.bestSlotsTitle,
	"schedulingAdvice_bestSlotsEmptyText": SchedulingAdviceFbtUtils.bestSlotsEmptyText,
	"schedulingAdvice_bestSlotCoverTemplate": SchedulingAdviceFbtUtils.bestSlotCoverTemplate,
	"schedulingAdvice_bestSlotUseLabel": SchedulingAdviceFbtUtils.bestSlotUseLabel,
	"schedulingAdvice_crossTitle": SchedulingAdviceFbtUtils.crossTitle,
	"schedulingAdvice_conflictTemplate": SchedulingAdviceFbtUtils.conflictTemplate,
	"schedulingAdvice_moveTemplate": SchedulingAdviceFbtUtils.moveTemplate,
	"schedulingAdvice_reasonRoleNeeded": SchedulingAdviceFbtUtils.reasonRoleNeeded,
	"schedulingAdvice_reasonRoleCovered": SchedulingAdviceFbtUtils.reasonRoleCovered,
	"schedulingAdvice_reasonRoleFlex": SchedulingAdviceFbtUtils.reasonRoleFlex,
	"schedulingAdvice_reasonRoleMatch": SchedulingAdviceFbtUtils.reasonRoleMatch,
	"schedulingAdvice_reasonRoleOther": SchedulingAdviceFbtUtils.reasonRoleOther,
	"schedulingAdvice_reasonRoleUnknown": SchedulingAdviceFbtUtils.reasonRoleUnknown,
	"schedulingAdvice_reasonGearReady": SchedulingAdviceFbtUtils.reasonGearReady,
	"schedulingAdvice_reasonGearUnknown": SchedulingAdviceFbtUtils.reasonGearUnknown,
	"schedulingAdvice_reasonReliable": SchedulingAdviceFbtUtils.reasonReliable,
	"schedulingAdvice_reasonNoHistory": SchedulingAdviceFbtUtils.reasonNoHistory,
	"schedulingAdvice_reasonAvailable": SchedulingAdviceFbtUtils.reasonAvailable,
	"schedulingAdvice_reasonUnavailable": SchedulingAdviceFbtUtils.reasonUnavailable,
	"schedulingAdvice_reasonAvailabilityUnknown": SchedulingAdviceFbtUtils.reasonAvailabilityUnknown,
	"schedulingAdvice_reasonLongestWaiting": SchedulingAdviceFbtUtils.reasonLongestWaiting,
	"schedulingAdvice_reasonFewRecent": SchedulingAdviceFbtUtils.reasonFewRecent,
	"schedulingAdvice_reasonNoConflict": SchedulingAdviceFbtUtils.reasonNoConflict,
	"recap_title": RecapFbtUtils.title,
	"recap_lockedTitle": RecapFbtUtils.lockedTitle,
	"recap_lockedBody": RecapFbtUtils.lockedBody,
	"recap_notEnabledTitle": RecapFbtUtils.notEnabledTitle,
	"recap_notEnabledBody": RecapFbtUtils.notEnabledBody,
	"recap_emptyNotCompletedBody": RecapFbtUtils.emptyNotCompletedBody,
	"recap_emptyNoRecapBody": RecapFbtUtils.emptyNoRecapBody,
	"recap_generateLabel": RecapFbtUtils.generateLabel,
	"recap_regenerateLabel": RecapFbtUtils.regenerateLabel,
	"recap_generatingLabel": RecapFbtUtils.generatingLabel,
	"recap_generateConfirmTitle": RecapFbtUtils.generateConfirmTitle,
	"recap_generateConfirmMessage": RecapFbtUtils.generateConfirmMessage,
	"recap_toastGenerated": RecapFbtUtils.toastGenerated,
	"recap_toastGenerateFailed": RecapFbtUtils.toastGenerateFailed,
	"recap_generatedAt": RecapFbtUtils.generatedAt,
	"recap_providerText": RecapFbtUtils.providerText,
	"recap_versionText": RecapFbtUtils.versionText,
	"recap_failedHint": RecapFbtUtils.failedHint,
	"recap_failedHintEmpty": RecapFbtUtils.failedHintEmpty,
	"recap_summaryAttendance": RecapFbtUtils.summaryAttendance,
	"recap_summaryReady": RecapFbtUtils.summaryReady,
	"recap_summaryResults": RecapFbtUtils.summaryResults,
	"recap_adminTabLabel": RecapFbtUtils.adminTabLabel,
	"recap_adminTitle": RecapFbtUtils.adminTitle,
	"recap_adminEmptyText": RecapFbtUtils.adminEmptyText,
	"recap_adminStatusReadyText": RecapFbtUtils.adminStatusReadyText,
	"recap_adminStatusFailedText": RecapFbtUtils.adminStatusFailedText,
	"recap_adminParagraphCount": RecapFbtUtils.adminParagraphCount,
	"combatReport_title": CombatReportFbtUtils.title,
	"combatReport_lockedTitle": CombatReportFbtUtils.lockedTitle,
	"combatReport_lockedBody": CombatReportFbtUtils.lockedBody,
	"combatReport_emptyBody": CombatReportFbtUtils.emptyBody,
	"combatReport_failedHint": CombatReportFbtUtils.failedHint,
	"combatReport_encountersTitle": CombatReportFbtUtils.encountersTitle,
	"combatReport_viewReportLabel": CombatReportFbtUtils.viewReportLabel,
	"combatReport_resultKill": CombatReportFbtUtils.resultKill,
	"combatReport_resultWipe": CombatReportFbtUtils.resultWipe,
	"combatReport_resultUnknown": CombatReportFbtUtils.resultUnknown,
	"combatReport_bossFallback": CombatReportFbtUtils.bossFallback,
	"combatReport_summaryTeam": CombatReportFbtUtils.summaryTeam,
	"combatReport_summaryDuration": CombatReportFbtUtils.summaryDuration,
	"combatReport_summaryPlayers": CombatReportFbtUtils.summaryPlayers,
	"combatReport_summarySourceEvents": CombatReportFbtUtils.summarySourceEvents,
	"combatReport_summarySourceOverlay": CombatReportFbtUtils.summarySourceOverlay,
	"combatReport_qualityUnclosed": CombatReportFbtUtils.qualityUnclosed,
	"combatReport_modelVersionText": CombatReportFbtUtils.modelVersionText,
	"combatReport_startedAtText": CombatReportFbtUtils.startedAtText,
	"combatReport_importedAtText": CombatReportFbtUtils.importedAtText,
	"combatReport_uploaderText": CombatReportFbtUtils.uploaderText,
	"combatReport_guestTag": CombatReportFbtUtils.guestTag,
	"combatReport_multiplierUndetermined": CombatReportFbtUtils.multiplierUndetermined,
	"combatReport_applierSystem": CombatReportFbtUtils.applierSystem,
	"combatReport_panelSkillLabel": CombatReportFbtUtils.panelSkillLabel,
	"combatReport_unnamedCast": CombatReportFbtUtils.unnamedCast,
	"combatReport_importLabel": CombatReportFbtUtils.importLabel,
	"combatReport_importingLabel": CombatReportFbtUtils.importingLabel,
	"combatReport_importHint": CombatReportFbtUtils.importHint,
	"combatReport_toastImported": CombatReportFbtUtils.toastImported,
	"combatReport_toastImportFailedTemplate": CombatReportFbtUtils.toastImportFailedTemplate,
	"combatReport_importErrorFormat": CombatReportFbtUtils.importErrorFormat,
	"combatReport_importErrorValidation": CombatReportFbtUtils.importErrorValidation,
	"combatReport_importErrorLimit": CombatReportFbtUtils.importErrorLimit,
	"combatReport_importErrorForbidden": CombatReportFbtUtils.importErrorForbidden,
	"combatReport_importErrorNotFound": CombatReportFbtUtils.importErrorNotFound,
	"combatReport_importErrorTier": CombatReportFbtUtils.importErrorTier,
	"combatReport_deleteLabel": CombatReportFbtUtils.deleteLabel,
	"combatReport_deleteConfirmTitle": CombatReportFbtUtils.deleteConfirmTitle,
	"combatReport_deleteConfirmMessageTemplate": CombatReportFbtUtils.deleteConfirmMessageTemplate,
	"combatReport_toastDeleted": CombatReportFbtUtils.toastDeleted,
	"combatReport_toastDeleteFailedTemplate": CombatReportFbtUtils.toastDeleteFailedTemplate,
	"combatReport_tabOverviewLabel": CombatReportFbtUtils.tabOverviewLabel,
	"combatReport_tabDamageLabel": CombatReportFbtUtils.tabDamageLabel,
	"combatReport_tabBuffsLabel": CombatReportFbtUtils.tabBuffsLabel,
	"combatReport_tabCastsLabel": CombatReportFbtUtils.tabCastsLabel,
	"combatReport_tabTimelineLabel": CombatReportFbtUtils.tabTimelineLabel,
	"combatReport_backLabel": CombatReportFbtUtils.backLabel,
	"combatReport_colPlayer": CombatReportFbtUtils.colPlayer,
	"combatReport_colTotal": CombatReportFbtUtils.colTotal,
	"combatReport_colActivity": CombatReportFbtUtils.colActivity,
	"combatReport_colDps": CombatReportFbtUtils.colDps,
	"combatReport_colRdps": CombatReportFbtUtils.colRdps,
	"combatReport_colRShare": CombatReportFbtUtils.colRShare,
	"combatReport_colSkill": CombatReportFbtUtils.colSkill,
	"combatReport_colCasts": CombatReportFbtUtils.colCasts,
	"combatReport_colHits": CombatReportFbtUtils.colHits,
	"combatReport_colAvg": CombatReportFbtUtils.colAvg,
	"combatReport_colCrit": CombatReportFbtUtils.colCrit,
	"combatReport_colSpec": CombatReportFbtUtils.colSpec,
	"combatReport_colMax": CombatReportFbtUtils.colMax,
	"combatReport_colShare": CombatReportFbtUtils.colShare,
	"combatReport_colBuff": CombatReportFbtUtils.colBuff,
	"combatReport_colApplier": CombatReportFbtUtils.colApplier,
	"combatReport_colTarget": CombatReportFbtUtils.colTarget,
	"combatReport_colUptime": CombatReportFbtUtils.colUptime,
	"combatReport_colTime": CombatReportFbtUtils.colTime,
	"combatReport_activityNote": CombatReportFbtUtils.activityNote,
	"combatReport_rdpsNote": CombatReportFbtUtils.rdpsNote,
	"combatReport_castsLocalTitle": CombatReportFbtUtils.castsLocalTitle,
	"combatReport_timelineTitle": CombatReportFbtUtils.timelineTitle,
	"combatReport_adminTabLabel": CombatReportFbtUtils.adminTabLabel,
	"combatReport_adminTitle": CombatReportFbtUtils.adminTitle,
	"combatReport_adminEmptyText": CombatReportFbtUtils.adminEmptyText,
	"combatReport_adminStatusParsedText": CombatReportFbtUtils.adminStatusParsedText,
	"combatReport_adminStatusFailedText": CombatReportFbtUtils.adminStatusFailedText,
	"agent_consentTitle": AgentFbtUtils.consentTitle,
	"agent_consentIntro": AgentFbtUtils.consentIntro,
	"agent_consentIdentity": AgentFbtUtils.consentIdentity,
	"agent_consentScopeTitle": AgentFbtUtils.consentScopeTitle,
	"agent_consentScopeRead": AgentFbtUtils.consentScopeRead,
	"agent_consentScopeSignup": AgentFbtUtils.consentScopeSignup,
	"agent_consentScopeCreate": AgentFbtUtils.consentScopeCreate,
	"agent_consentApprove": AgentFbtUtils.consentApprove,
	"agent_consentDeny": AgentFbtUtils.consentDeny,
	"agent_consentErrorTitle": AgentFbtUtils.consentErrorTitle,
	"agent_consentErrorBody": AgentFbtUtils.consentErrorBody,
	"agent_sectionTitle": AgentFbtUtils.sectionTitle,
	"agent_hint": AgentFbtUtils.hint,
	"agent_emptyText": AgentFbtUtils.emptyText,
	"agent_scopesReadLabel": AgentFbtUtils.scopesReadLabel,
	"agent_scopesSignupLabel": AgentFbtUtils.scopesSignupLabel,
	"agent_scopesCreateLabel": AgentFbtUtils.scopesCreateLabel,
	"agent_scopesSignupCreateLabel": AgentFbtUtils.scopesSignupCreateLabel,
	"agent_sourceOauthLabel": AgentFbtUtils.sourceOauthLabel,
	"agent_createdTemplate": AgentFbtUtils.createdTemplate,
	"agent_lastUsedTemplate": AgentFbtUtils.lastUsedTemplate,
	"agent_neverUsedText": AgentFbtUtils.neverUsedText,
	"agent_revokeLabel": AgentFbtUtils.revokeLabel,
	"agent_revokeDoneText": AgentFbtUtils.revokeDoneText
};
