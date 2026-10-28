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
		return fbs._("取消", null, { hk: "1T5Kf0" });
	}
	static confirm(fbs: FbsRuntime) {
		return fbs._("确定", null, { hk: "4qsCYN" });
	}
	static unknownError(fbs: FbsRuntime) {
		return fbs._("未知错误", null, { hk: "2Zug7R" });
	}
	static renderError(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("渲染出错: {message}", [fbs._param("message", pv(p, "message"))], { hk: "1xNsEz" });
	}
	static renderErrorHint(fbs: FbsRuntime) {
		return fbs._("这一页出了问题，其他页面不受影响。", null, { hk: "1Gn8la" });
	}
	static backToHub(fbs: FbsRuntime) {
		return fbs._("返回百业集结", null, { hk: "1yQB1" });
	}
	static loadingGuild(fbs: FbsRuntime) {
		return fbs._("正在展开百业…", null, { hk: "4nB2wr" });
	}
	static close(fbs: FbsRuntime) {
		return fbs._("关闭", null, { hk: "2XVutD" });
	}
}
export abstract class SiteFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("百业集结", null, { hk: "2jruiT" });
	}
	static subtitle(fbs: FbsRuntime) {
		return fbs._("燕云十六声 · 国际服百业车队与攻略集散地 —— 择一业而入，共赴双十。", null, { hk: "Ql8Gh" });
	}
	static heroAlt(fbs: FbsRuntime) {
		return fbs._("水墨山水", null, { hk: "YCzQi" });
	}
	static seal(fbs: FbsRuntime) {
		return fbs._("燕", null, { hk: "3GmS65" });
	}
}
export abstract class LoginFbtUtils {
	static cardTitle(fbs: FbsRuntime) {
		return fbs._("先登录，再入江湖", null, { hk: "1gT8hG" });
	}
	static cardBody1(fbs: FbsRuntime) {
		return fbs._("本站需用 Discord 账号认证后使用。", null, { hk: "2UE2ER" });
	}
	static cardBody2(fbs: FbsRuntime) {
		return fbs._("登录后将按你所在的 Discord 服务器，展示你有权限访问的百业。", null, { hk: "de4Ds" });
	}
	static button(fbs: FbsRuntime) {
		return fbs._("用 Discord 登录", null, { hk: "HacAA" });
	}
	static privacy(fbs: FbsRuntime) {
		return fbs._("我们会读取并保存你的 Discord 昵称、头像、服务器列表与登录授权，用于成员校验与提醒功能，详见隐私政策", null, { hk: "4kmvlL" });
	}
}
export abstract class UserBarFbtUtils {
	static logout(fbs: FbsRuntime) {
		return fbs._("退出登录", null, { hk: "24H2KM" });
	}
	static loggingOut(fbs: FbsRuntime) {
		return fbs._("退出中…", null, { hk: "4ajAun" });
	}
	static settings(fbs: FbsRuntime) {
		return fbs._("个人资料", null, { hk: "2vDUiU" });
	}
}
export abstract class SettingsFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("个人资料", null, { hk: "1FMLkq" });
	}
	static discordLabel(fbs: FbsRuntime) {
		return fbs._("Discord 账号", null, { hk: "jkPxs" });
	}
	static languageLabel(fbs: FbsRuntime) {
		return fbs._("语言", null, { hk: "3N6DA1" });
	}
	static languageHint(fbs: FbsRuntime) {
		return fbs._("界面语言。选择「自动」时跟随浏览器语言；手动选择后保存在你的账号里，压过浏览器语言。", null, { hk: "22QAB5" });
	}
	static autoLabel(fbs: FbsRuntime) {
		return fbs._("自动（跟随浏览器）", null, { hk: "1AC95K" });
	}
	static langZhCn(fbs: FbsRuntime) {
		return fbs._("简体中文", null, { hk: "1HYYwY" });
	}
	static langZhTw(fbs: FbsRuntime) {
		return fbs._("繁體中文", null, { hk: "19sXq3" });
	}
	static langEn(fbs: FbsRuntime) {
		return fbs._("English", null, { hk: "1e0zxu" });
	}
	static langEs(fbs: FbsRuntime) {
		return fbs._("Español", null, { hk: "1rJbZh" });
	}
	static langFr(fbs: FbsRuntime) {
		return fbs._("Français", null, { hk: "1hewJ7" });
	}
	static savedText(fbs: FbsRuntime) {
		return fbs._("已保存", null, { hk: "1C5hv6" });
	}
}
export abstract class PickerFbtUtils {
	static myGuilds(fbs: FbsRuntime) {
		return fbs._("我的百业", null, { hk: "3Wuwix" });
	}
	static myGuildsEn(fbs: FbsRuntime) {
		return fbs._("My Guilds", null, { hk: "3LVjVP" });
	}
	static publicGuilds(fbs: FbsRuntime) {
		return fbs._("公开百业", null, { hk: "WVDnJ" });
	}
	static publicGuildsEn(fbs: FbsRuntime) {
		return fbs._("Public · Read Only", null, { hk: "Wgh4O" });
	}
	static readOnlyBadge(fbs: FbsRuntime) {
		return fbs._("只读", null, { hk: "QbGBq" });
	}
	static emptyTitle(fbs: FbsRuntime) {
		return fbs._("你还没有可用的百业", null, { hk: "1bERbv" });
	}
	static emptyBody(fbs: FbsRuntime) {
		return fbs._("百业按 Discord 服务器划分：你所在的服务器若已绑定百业，它会出现在这里。若还没有，你可以把自己管理的服务器绑成一个新百业。", null, { hk: "3aFcAI" });
	}
	static createGuild(fbs: FbsRuntime) {
		return fbs._("创建百业", null, { hk: "2GnqPL" });
	}
	static createGuildMore(fbs: FbsRuntime) {
		return fbs._("+ 创建新百业", null, { hk: "41z6Vc" });
	}
}
export abstract class CreateFbtUtils {
	static backLink(fbs: FbsRuntime) {
		return fbs._("‹ 我的百业", null, { hk: "4cJd0j" });
	}
	static title(fbs: FbsRuntime) {
		return fbs._("创建百业", null, { hk: "33JcWe" });
	}
	static subtitle(fbs: FbsRuntime) {
		return fbs._("绑定一个你管理的 Discord 服务器 —— 之后只有该服务器的成员能看到并使用这个百业。", null, { hk: "3jafPb" });
	}
	static nameLabel(fbs: FbsRuntime) {
		return fbs._("百业名", null, { hk: "1Sg01X" });
	}
	static namePlaceholder(fbs: FbsRuntime) {
		return fbs._("如：叽哩呱啦", null, { hk: "3hXVh1" });
	}
	static slugLabel(fbs: FbsRuntime) {
		return fbs._("访问标识 slug（网址后缀，只能小写字母 / 数字 / 连字符）", null, { hk: "35gMQN" });
	}
	static slugPlaceholder(fbs: FbsRuntime) {
		return fbs._("如：my-guild", null, { hk: "3ermuW" });
	}
	static slugChecking(fbs: FbsRuntime) {
		return fbs._("检查中…", null, { hk: "O8SaV" });
	}
	static slugAvailable(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("✓ yanyun.app/{slug} 可用", [fbs._param("slug", pv(p, "slug"))], { hk: "4wf3F5" });
	}
	static slugTaken(fbs: FbsRuntime) {
		return fbs._("✗ 已被占用或不符合规则", null, { hk: "dPVdK" });
	}
	static slugNote(fbs: FbsRuntime) {
		return fbs._("创建后不可更改", null, { hk: "1joIo7" });
	}
	static serverLabel(fbs: FbsRuntime) {
		return fbs._("绑定 Discord 服务器（仅列出你有管理权限的）", null, { hk: "1iWgbr" });
	}
	static noServers1(fbs: FbsRuntime) {
		return fbs._("你还没有任何可管理的 Discord 服务器。", null, { hk: "1GVdMj" });
	}
	static noServers2(fbs: FbsRuntime) {
		return fbs._("先在 Discord 里建一个服务器（或拿到管理员权限），重新登录刷新列表后再来创建。", null, { hk: "4yOqEf" });
	}
	static submit(fbs: FbsRuntime) {
		return fbs._("创建百业", null, { hk: "3K2Nj9" });
	}
	static submitting(fbs: FbsRuntime) {
		return fbs._("创建中…", null, { hk: "37zW5R" });
	}
	static toastNameShort(fbs: FbsRuntime) {
		return fbs._("百业名至少 2 个字", null, { hk: "4oqDb" });
	}
	static toastSlugRequired(fbs: FbsRuntime) {
		return fbs._("请填写访问标识 slug", null, { hk: "1WRTtq" });
	}
	static toastSlugBad(fbs: FbsRuntime) {
		return fbs._("这个 slug 不可用，换一个", null, { hk: "RJyM9" });
	}
	static toastServerRequired(fbs: FbsRuntime) {
		return fbs._("请选择要绑定的 Discord 服务器", null, { hk: "3fgJkk" });
	}
	static toastCreated(fbs: FbsRuntime) {
		return fbs._("百业创建成功", null, { hk: "2kj0I6" });
	}
	static toastFailed(fbs: FbsRuntime) {
		return fbs._("创建失败，请稍后再试", null, { hk: "2MoCyd" });
	}
}
export abstract class LockedFbtUtils {
	static backLink(fbs: FbsRuntime) {
		return fbs._("‹ 我的百业", null, { hk: "2JUJhQ" });
	}
	static title(fbs: FbsRuntime) {
		return fbs._("无权访问这个百业", null, { hk: "3eeH3W" });
	}
	static body1(fbs: FbsRuntime) {
		return fbs._("该百业不存在，或仅对某个 Discord 服务器的成员开放。", null, { hk: "6kLub" });
	}
	static body2(fbs: FbsRuntime) {
		return fbs._("加入对应的 Discord 服务器后，用同一个账号登录即可访问。", null, { hk: "3Z18vd" });
	}
	static backButton(fbs: FbsRuntime) {
		return fbs._("回到我的百业", null, { hk: "3zSe3X" });
	}
}
export abstract class GuildHomeFbtUtils {
	static backToHub(fbs: FbsRuntime) {
		return fbs._("← 百业集结", null, { hk: "3QHsGc" });
	}
	static backPlain(fbs: FbsRuntime) {
		return fbs._("← 返回", null, { hk: "4G9PJQ" });
	}
	static tabTeam(fbs: FbsRuntime) {
		return fbs._("组队", null, { hk: "1J8jz4" });
	}
	static tabDex(fbs: FbsRuntime) {
		return fbs._("攻略", null, { hk: "2EY4Gq" });
	}
	static tabSect(fbs: FbsRuntime) {
		return fbs._("流派攻略", null, { hk: "37hCbH" });
	}
	static tabAnnouncements(fbs: FbsRuntime) {
		return fbs._("公告", null, { hk: "1AlrM9" });
	}
	static readOnlyBanner(fbs: FbsRuntime) {
		return fbs._("该百业尚未绑定 Discord 服务器 · 只读浏览", null, { hk: "1SB8uD" });
	}
	static adminLink(fbs: FbsRuntime) {
		return fbs._("管理", null, { hk: "24HBEg" });
	}
	static tabSchedule(fbs: FbsRuntime) {
		return fbs._("排期", null, { hk: "2Cvf6D" });
	}
}
export abstract class GroupingTypeFbtUtils {
	static tabActivity(fbs: FbsRuntime) {
		return fbs._("双十人本", null, { hk: "4iJ2on" });
	}
	static tabTalent(fbs: FbsRuntime) {
		return fbs._("天赋组队", null, { hk: "lcmft" });
	}
	static tabRace(fbs: FbsRuntime) {
		return fbs._("竞速报名", null, { hk: "3lugJ5" });
	}
	static tabTower(fbs: FbsRuntime) {
		return fbs._("爬塔", null, { hk: "32l5QT" });
	}
	static shortActivity(fbs: FbsRuntime) {
		return fbs._("双十", null, { hk: "eURez" });
	}
	static shortTalent(fbs: FbsRuntime) {
		return fbs._("天赋", null, { hk: "1nxJ9j" });
	}
	static shortRace(fbs: FbsRuntime) {
		return fbs._("竞速", null, { hk: "2sbUhY" });
	}
	static shortTower(fbs: FbsRuntime) {
		return fbs._("爬塔", null, { hk: "x5In2" });
	}
	static shortGather(fbs: FbsRuntime) {
		return fbs._("采集", null, { hk: "2mea0" });
	}
	static shortExplore(fbs: FbsRuntime) {
		return fbs._("探索", null, { hk: "M5BFH" });
	}
}
export abstract class GroupingListFbtUtils {
	static prevWeek(fbs: FbsRuntime) {
		return fbs._("上一周", null, { hk: "4niiyD" });
	}
	static nextWeek(fbs: FbsRuntime) {
		return fbs._("下一周", null, { hk: "TVC07" });
	}
	static weekHeader(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{range} · {count} 队", [fbs._param("range", pv(p, "range")), fbs._param("count", pv(p, "count"))], { hk: "1eEnhN" });
	}
	static emptyInteractive(fbs: FbsRuntime) {
		return fbs._("暂无车队，来发第一车吧", null, { hk: "1rU4o2" });
	}
	static emptyReadonly(fbs: FbsRuntime) {
		return fbs._("暂无车队", null, { hk: "31j3wi" });
	}
	static statusOpen(fbs: FbsRuntime) {
		return fbs._("报名中", null, { hk: "2GJkBY" });
	}
	static people(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{occupied}/{max} 人", [fbs._param("occupied", pv(p, "occupied")), fbs._param("max", pv(p, "max"))], { hk: "3ZhMZO" });
	}
	static newCar(fbs: FbsRuntime) {
		return fbs._("📯 张贴告示 · 发新车", null, { hk: "4BN2p0" });
	}
	static seal(fbs: FbsRuntime) {
		return fbs._("募", null, { hk: "1IVvkA" });
	}
	static dayGroupHeader(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{month}月{day}日 {weekday}", [
			fbs._param("month", pv(p, "month")),
			fbs._param("day", pv(p, "day")),
			fbs._param("weekday", pv(p, "weekday"))
		], { hk: "1BlfRw" });
	}
	static weekday0(fbs: FbsRuntime) {
		return fbs._("周日", null, { hk: "h0csq" });
	}
	static weekday1(fbs: FbsRuntime) {
		return fbs._("周一", null, { hk: "3WI7b8" });
	}
	static weekday2(fbs: FbsRuntime) {
		return fbs._("周二", null, { hk: "4ouSVz" });
	}
	static weekday3(fbs: FbsRuntime) {
		return fbs._("周三", null, { hk: "1qGP0c" });
	}
	static weekday4(fbs: FbsRuntime) {
		return fbs._("周四", null, { hk: "3Ojwo0" });
	}
	static weekday5(fbs: FbsRuntime) {
		return fbs._("周五", null, { hk: "3EHVYp" });
	}
	static weekday6(fbs: FbsRuntime) {
		return fbs._("周六", null, { hk: "3t7PZj" });
	}
	static undatedGroup(fbs: FbsRuntime) {
		return fbs._("未定时间", null, { hk: "4znqzn" });
	}
}
export abstract class GroupingDetailFbtUtils {
	static notFound(fbs: FbsRuntime) {
		return fbs._("车队不存在或已解散", null, { hk: "4irp9k" });
	}
	static backToList(fbs: FbsRuntime) {
		return fbs._("‹ 返回车队列表", null, { hk: "225y6i" });
	}
	static share(fbs: FbsRuntime) {
		return fbs._("🔗 分享车队", null, { hk: "uuLgS" });
	}
	static edit(fbs: FbsRuntime) {
		return fbs._("✏️ 编辑", null, { hk: "1cQtpw" });
	}
	static disband(fbs: FbsRuntime) {
		return fbs._("解散车队", null, { hk: "3ApWNM" });
	}
	static disbanding(fbs: FbsRuntime) {
		return fbs._("解散中…", null, { hk: "2xn0s" });
	}
	static statusOpen(fbs: FbsRuntime) {
		return fbs._("报名中", null, { hk: "4vPJaR" });
	}
	static people(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{occupied}/{max} 人", [fbs._param("occupied", pv(p, "occupied")), fbs._param("max", pv(p, "max"))], { hk: "2mGHU9" });
	}
	static readyProgress(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已就位 {ready}/{occupied}", [fbs._param("ready", pv(p, "ready")), fbs._param("occupied", pv(p, "occupied"))], { hk: "pfx4F" });
	}
	static openHint(fbs: FbsRuntime) {
		return fbs._("人人可管 · 无需管理码 — 点空位即可落座", null, { hk: "4nekNp" });
	}
	static readonlyHint(fbs: FbsRuntime) {
		return fbs._("只读浏览 · 该百业尚未绑定 Discord 服务器", null, { hk: "1zPQCZ" });
	}
	static toastDisbanded(fbs: FbsRuntime) {
		return fbs._("车队已解散", null, { hk: "U5kzB" });
	}
	static toastDisbandFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("解散失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "1ULKcf" });
	}
	static linkCopied(fbs: FbsRuntime) {
		return fbs._("链接已复制", null, { hk: "3dkbPe" });
	}
	static copyFailedManual(fbs: FbsRuntime) {
		return fbs._("复制失败，请手动复制地址栏链接", null, { hk: "ygDBg" });
	}
	static disbandConfirmTitle(fbs: FbsRuntime) {
		return fbs._("解散车队", null, { hk: "1viTsz" });
	}
	static disbandConfirmMessage(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("确定解散「{title}」吗？所有报名将被清空。", [fbs._param("title", pv(p, "title"))], { hk: "3bqGvz" });
	}
	static complete(fbs: FbsRuntime) {
		return fbs._("完成车队", null, { hk: "3uoQwL" });
	}
	static completing(fbs: FbsRuntime) {
		return fbs._("完成中…", null, { hk: "2pxWpJ" });
	}
	static statusCompleted(fbs: FbsRuntime) {
		return fbs._("已完成", null, { hk: "2ZpgUr" });
	}
	static restore(fbs: FbsRuntime) {
		return fbs._("恢复车队", null, { hk: "2GzueF" });
	}
	static completeConfirmTitle(fbs: FbsRuntime) {
		return fbs._("完成车队", null, { hk: "3Cxz4X" });
	}
	static completeConfirmMessage(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("确定完成「{title}」吗？完成后将从车队列表隐藏，也不再发送发车提醒；之后仍可在本页恢复。", [fbs._param("title", pv(p, "title"))], { hk: "3LzcLB" });
	}
	static toastCompleted(fbs: FbsRuntime) {
		return fbs._("车队已完成", null, { hk: "3RHtYh" });
	}
	static toastCompleteFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("完成失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "pOx3A" });
	}
	static toastRestored(fbs: FbsRuntime) {
		return fbs._("车队已恢复", null, { hk: "1vDQac" });
	}
	static toastRestoreFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("恢复失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "1HkMp8" });
	}
	static completedHint(fbs: FbsRuntime) {
		return fbs._("该车队已完成 · 已从列表隐藏，不再发送发车提醒", null, { hk: "2WmufQ" });
	}
	static rosterAnswersTitle(fbs: FbsRuntime) {
		return fbs._("报名表答案", null, { hk: "2ICCPM" });
	}
}
export abstract class GroupingFormFbtUtils {
	static createTitle(fbs: FbsRuntime) {
		return fbs._("张贴告示", null, { hk: "2if4Nm" });
	}
	static editTitle(fbs: FbsRuntime) {
		return fbs._("编辑告示", null, { hk: "2ZHjx1" });
	}
	static typeLabel(fbs: FbsRuntime) {
		return fbs._("类型", null, { hk: "3GuMNw" });
	}
	static capacity(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("人数上限 {max} 人（{hint}）", [fbs._param("max", pv(p, "max")), fbs._param("hint", pv(p, "hint"))], { hk: "3ZC0l6" });
	}
	static hintActivity(fbs: FbsRuntime) {
		return fbs._("双十固定 10 人，不选副本", null, { hk: "4wWMM" });
	}
	static hintDungeon(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("按所选副本「{name}」{max} 人", [fbs._param("name", pv(p, "name")), fbs._param("max", pv(p, "max"))], { hk: "3Ond6Y" });
	}
	static hintTalent(fbs: FbsRuntime) {
		return fbs._("天赋默认 5 人，选副本后按副本人数", null, { hk: "2UQGFu" });
	}
	static hintRace(fbs: FbsRuntime) {
		return fbs._("竞速默认 10 人，选副本后按副本人数", null, { hk: "Vetdf" });
	}
	static hintTower(fbs: FbsRuntime) {
		return fbs._("爬塔固定 10 人，不选副本", null, { hk: "3nAIwc" });
	}
	static titleLabel(fbs: FbsRuntime) {
		return fbs._("标题", null, { hk: "3FK2Yy" });
	}
	static titlePlaceholder(fbs: FbsRuntime) {
		return fbs._("如：周六晚双十来奶", null, { hk: "2KZJTY" });
	}
	static startsLabel(fbs: FbsRuntime) {
		return fbs._("出发时间", null, { hk: "1j8pbx" });
	}
	static monthOption(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{n}月", [fbs._param("n", pv(p, "n"))], { hk: "qKFsl" });
	}
	static dayOption(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{n}日", [fbs._param("n", pv(p, "n"))], { hk: "1U3cMZ" });
	}
	static hourOption(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{n}时", [fbs._param("n", pv(p, "n"))], { hk: "477MMe" });
	}
	static minuteOption(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{n}分", [fbs._param("n", pv(p, "n"))], { hk: "Fvsjq" });
	}
	static dungeonLabel(fbs: FbsRuntime) {
		return fbs._("副本（可选）", null, { hk: "1kITz0" });
	}
	static dungeonNone(fbs: FbsRuntime) {
		return fbs._("不指定", null, { hk: "1IAOtB" });
	}
	static nicknameLabel(fbs: FbsRuntime) {
		return fbs._("你的昵称（发车人自动落座 0 号位）", null, { hk: "3fBzGh" });
	}
	static nicknamePlaceholder(fbs: FbsRuntime) {
		return fbs._("游戏内昵称", null, { hk: "2iaKtP" });
	}
	static sectLabel(fbs: FbsRuntime) {
		return fbs._("你的流派", null, { hk: "25pXXR" });
	}
	static submitCreate(fbs: FbsRuntime) {
		return fbs._("发布", null, { hk: "4iXt77" });
	}
	static submitEdit(fbs: FbsRuntime) {
		return fbs._("保存", null, { hk: "1YzH3H" });
	}
	static submitting(fbs: FbsRuntime) {
		return fbs._("提交中…", null, { hk: "4g4R3h" });
	}
	static toastSect(fbs: FbsRuntime) {
		return fbs._("请选择你的流派", null, { hk: "3AfhYj" });
	}
	static toastSaved(fbs: FbsRuntime) {
		return fbs._("已保存", null, { hk: "3r1utC" });
	}
	static toastSaveFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("保存失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "X9H9D" });
	}
	static toastPosted(fbs: FbsRuntime) {
		return fbs._("告示已张贴", null, { hk: "3gNP8m" });
	}
	static toastCreateFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("创建失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "2Z4b2r" });
	}
	static titleTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{nickname}的{type}车队", [fbs._param("nickname", pv(p, "nickname")), fbs._param("type", pv(p, "type"))], { hk: "3I3lZm" });
	}
	static customFieldsTitle(fbs: FbsRuntime) {
		return fbs._("报名表自定义字段", null, { hk: "2DLDVn" });
	}
	static customFieldAddLabel(fbs: FbsRuntime) {
		return fbs._("添加字段", null, { hk: "IDN35" });
	}
	static customFieldLabelPlaceholder(fbs: FbsRuntime) {
		return fbs._("字段名（如：联系方式）", null, { hk: "xonoE" });
	}
	static customFieldTypeText(fbs: FbsRuntime) {
		return fbs._("单行文本", null, { hk: "J1GOA" });
	}
	static customFieldTypeChoice(fbs: FbsRuntime) {
		return fbs._("单选", null, { hk: "GKzKm" });
	}
	static customFieldOptionsPlaceholder(fbs: FbsRuntime) {
		return fbs._("选项，一行一个（2–6 个）", null, { hk: "1ZUQFl" });
	}
	static customFieldRequiredLabel(fbs: FbsRuntime) {
		return fbs._("必填", null, { hk: "1fvjhr" });
	}
	static customFieldRemoveLabel(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "1GalTE" });
	}
	static customFieldEmptyText(fbs: FbsRuntime) {
		return fbs._("未设置自定义字段时，成员报名只填固定信息。", null, { hk: "2o6Sjz" });
	}
}
export abstract class SeatFbtUtils {
	static emptyJoin(fbs: FbsRuntime) {
		return fbs._("空位 · 点击落座", null, { hk: "2gCqvY" });
	}
	static empty(fbs: FbsRuntime) {
		return fbs._("空位", null, { hk: "1YuSgX" });
	}
	static modalTitle(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("落座 · {n} 号位", [fbs._param("n", pv(p, "n"))], { hk: "1j2oAn" });
	}
	static modalSubtitle(fbs: FbsRuntime) {
		return fbs._("人人可管 · 无需管理码", null, { hk: "1mHXoH" });
	}
	static nameLabel(fbs: FbsRuntime) {
		return fbs._("名字", null, { hk: "V7imB" });
	}
	static namePlaceholder(fbs: FbsRuntime) {
		return fbs._("你的名字", null, { hk: "2LxN40" });
	}
	static nameRequired(fbs: FbsRuntime) {
		return fbs._("请填写名字", null, { hk: "b1hhN" });
	}
	static selfTab(fbs: FbsRuntime) {
		return fbs._("自己报名", null, { hk: "3cGlqv" });
	}
	static proxyTab(fbs: FbsRuntime) {
		return fbs._("代报名", null, { hk: "323xwD" });
	}
	static selfNameHint(fbs: FbsRuntime) {
		return fbs._("名字取自你的 Discord 昵称，不可修改", null, { hk: "1zrx54" });
	}
	static proxySearchPlaceholder(fbs: FbsRuntime) {
		return fbs._("搜索成员名字", null, { hk: "2Zfx1F" });
	}
	static proxyPickRequired(fbs: FbsRuntime) {
		return fbs._("请选择要代报的成员", null, { hk: "4h89Rs" });
	}
	static proxyEmpty(fbs: FbsRuntime) {
		return fbs._("名册里还没有成员", null, { hk: "1rYTOn" });
	}
	static sectLabel(fbs: FbsRuntime) {
		return fbs._("流派", null, { hk: "1zx56S" });
	}
	static confirmJoin(fbs: FbsRuntime) {
		return fbs._("确认落座", null, { hk: "9qXPZ" });
	}
	static joining(fbs: FbsRuntime) {
		return fbs._("落座中…", null, { hk: "1k5xDe" });
	}
	static toastSect(fbs: FbsRuntime) {
		return fbs._("请选择流派", null, { hk: "46LE9b" });
	}
	static toastJoined(fbs: FbsRuntime) {
		return fbs._("落座成功", null, { hk: "4y4FIW" });
	}
	static toastJoinFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("报名失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "4pwoLk" });
	}
	static toastLeft(fbs: FbsRuntime) {
		return fbs._("已取消报名", null, { hk: "eE9Cf" });
	}
	static toastLeaveFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("取消失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "3cOOqd" });
	}
	static leaveConfirmTitle(fbs: FbsRuntime) {
		return fbs._("取消报名", null, { hk: "2UTW6n" });
	}
	static leaveConfirmMessage(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("确定取消「{nickname}」的报名吗？", [fbs._param("nickname", pv(p, "nickname"))], { hk: "4eNe7M" });
	}
	static roleHealer(fbs: FbsRuntime) {
		return fbs._("奶", null, { hk: "21AMbF" });
	}
	static roleDps(fbs: FbsRuntime) {
		return fbs._("输出", null, { hk: "1hQI77" });
	}
	static leader(fbs: FbsRuntime) {
		return fbs._("车头", null, { hk: "3g1KD2" });
	}
	static readyMark(fbs: FbsRuntime) {
		return fbs._("已就位", null, { hk: "3gsY37" });
	}
	static readyAction(fbs: FbsRuntime) {
		return fbs._("我已就位", null, { hk: "4Far4z" });
	}
	static unreadyAction(fbs: FbsRuntime) {
		return fbs._("取消就位", null, { hk: "1zNvU0" });
	}
	static toastReady(fbs: FbsRuntime) {
		return fbs._("已标记就位", null, { hk: "2f6aOP" });
	}
	static toastUnready(fbs: FbsRuntime) {
		return fbs._("已取消就位", null, { hk: "2yeuHM" });
	}
	static toastReadyFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("操作失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "3dqRNR" });
	}
}
export abstract class AppBlocksFbtUtils {
	static rosterTitle(fbs: FbsRuntime) {
		return fbs._("队伍名册", null, { hk: "3DkQ89" });
	}
	static closedStatus(fbs: FbsRuntime) {
		return fbs._("已关闭", null, { hk: "2YGpco" });
	}
	static completedStatus(fbs: FbsRuntime) {
		return fbs._("已完成", null, { hk: "3Nonz2" });
	}
	static unknownBlock(fbs: FbsRuntime) {
		return fbs._("该内容需要更新 App 后显示", null, { hk: "1hwid8" });
	}
}
export abstract class DexFbtUtils {
	static backToDex(fbs: FbsRuntime) {
		return fbs._("‹ 返回攻略", null, { hk: "GP0PX" });
	}
	static bossesLine(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{count} 位首领", [fbs._param("count", pv(p, "count"))], { hk: "EhIYn" });
	}
	static noBossData(fbs: FbsRuntime) {
		return fbs._("暂无 Boss 数据", null, { hk: "rshdc" });
	}
	static empty(fbs: FbsRuntime) {
		return fbs._("暂无攻略", null, { hk: "1n8U5h" });
	}
	static currentGuides(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("当期攻略 · {category}", [fbs._param("category", pv(p, "category"))], { hk: "4w4Opf" });
	}
	static catSub(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{season} · {seasonName}", [fbs._param("season", pv(p, "season")), fbs._param("seasonName", pv(p, "seasonName"))], { hk: "uWuXy" });
	}
	static catSubCurrent(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{season} · {seasonName} · 版本 {version}", [
			fbs._param("season", pv(p, "season")),
			fbs._param("seasonName", pv(p, "seasonName")),
			fbs._param("version", pv(p, "version"))
		], { hk: "3cWHub" });
	}
	static size10(fbs: FbsRuntime) {
		return fbs._("十人本", null, { hk: "zKTRY" });
	}
	static size5(fbs: FbsRuntime) {
		return fbs._("五人本", null, { hk: "1sC8oB" });
	}
	static sizeN(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{n}人本", [fbs._param("n", pv(p, "n"))], { hk: "2oQXOb" });
	}
	static bossUnit(fbs: FbsRuntime) {
		return fbs._("首领", null, { hk: "3FD2eL" });
	}
	static partMechanics(fbs: FbsRuntime) {
		return fbs._("机制", null, { hk: "4160zn" });
	}
	static partShouts(fbs: FbsRuntime) {
		return fbs._("喊话", null, { hk: "CTS01" });
	}
	static partTalents(fbs: FbsRuntime) {
		return fbs._("天赋", null, { hk: "2ooolG" });
	}
	static labelAll(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{count}位首领 · {parts}俱全", [fbs._param("count", pv(p, "count")), fbs._param("parts", pv(p, "parts"))], { hk: "4A6V89" });
	}
	static labelParts(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{count}位首领 · {parts}", [fbs._param("count", pv(p, "count")), fbs._param("parts", pv(p, "parts"))], { hk: "1X0sPP" });
	}
	static labelPending(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{count}位首领 · 攻略待补", [fbs._param("count", pv(p, "count"))], { hk: "pJw7S" });
	}
	static labelNoBosses(fbs: FbsRuntime) {
		return fbs._("首领待补", null, { hk: "2alZvi" });
	}
	static sealBoss(fbs: FbsRuntime) {
		return fbs._("将", null, { hk: "4dcgwj" });
	}
}
export abstract class BossFbtUtils {
	static back(fbs: FbsRuntime) {
		return fbs._("‹ 返回", null, { hk: "48jekW" });
	}
	static notFound(fbs: FbsRuntime) {
		return fbs._("Boss 不存在", null, { hk: "2Bt5pu" });
	}
	static tabMechanics(fbs: FbsRuntime) {
		return fbs._("机制", null, { hk: "2BIvk9" });
	}
	static tabTalents(fbs: FbsRuntime) {
		return fbs._("天赋", null, { hk: "188RLy" });
	}
	static shoutsTitle(fbs: FbsRuntime) {
		return fbs._("📢 喊话宏", null, { hk: "3QoYl2" });
	}
	static copy(fbs: FbsRuntime) {
		return fbs._("复制", null, { hk: "3ReM89" });
	}
	static shoutCopied(fbs: FbsRuntime) {
		return fbs._("喊话已复制", null, { hk: "FIBAo" });
	}
	static copyFailed(fbs: FbsRuntime) {
		return fbs._("复制失败", null, { hk: "1IRlWh" });
	}
	static copyManual(fbs: FbsRuntime) {
		return fbs._("请手动复制", null, { hk: "2wAUs3" });
	}
	static noMechanics(fbs: FbsRuntime) {
		return fbs._("暂无机制", null, { hk: "1RbSsQ" });
	}
	static noTalents(fbs: FbsRuntime) {
		return fbs._("暂无天赋", null, { hk: "1QQloH" });
	}
	static talentTitle(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("天赋 {code}", [fbs._param("code", pv(p, "code"))], { hk: "1xEAHf" });
	}
	static talentPending(fbs: FbsRuntime) {
		return " " + fbs._("· 待确认", null, { hk: "1fHrxs" });
	}
}
export abstract class SectFbtUtils {
	static empty(fbs: FbsRuntime) {
		return fbs._("暂无流派", null, { hk: "1nn2V3" });
	}
	static back(fbs: FbsRuntime) {
		return fbs._("‹ 返回流派", null, { hk: "1HPJ9u" });
	}
	static tabBis(fbs: FbsRuntime) {
		return fbs._("毕业词条", null, { hk: "2VRpEl" });
	}
	static tabRotation(fbs: FbsRuntime) {
		return fbs._("输出轴", null, { hk: "26U8wO" });
	}
	static tabRates(fbs: FbsRuntime) {
		return fbs._("三率目标", null, { hk: "2xLfOo" });
	}
	static tabTiaolv(fbs: FbsRuntime) {
		return fbs._("调律推演", null, { hk: "XqxUl" });
	}
	static tabGrad(fbs: FbsRuntime) {
		return fbs._("武库鉴宝", null, { hk: "3BHuVO" });
	}
	static noBis(fbs: FbsRuntime) {
		return fbs._("暂无毕业词条", null, { hk: "2kzwDh" });
	}
	static noRotation(fbs: FbsRuntime) {
		return fbs._("暂无输出轴", null, { hk: "3C6iz4" });
	}
	static noRates(fbs: FbsRuntime) {
		return fbs._("暂无三率目标", null, { hk: "bd2DC" });
	}
	static rotGreydust(fbs: FbsRuntime) {
		return fbs._("一分钟木桩轴", null, { hk: "2aTWP7" });
	}
	static rotOpener(fbs: FbsRuntime) {
		return fbs._("起手", null, { hk: "2HglyR" });
	}
	static rotLoop(fbs: FbsRuntime) {
		return fbs._("循环", null, { hk: "mjtjZ" });
	}
	static rotKeyPoints(fbs: FbsRuntime) {
		return fbs._("要点", null, { hk: "4nrcZx" });
	}
	static rotInnerSkills(fbs: FbsRuntime) {
		return fbs._("心法", null, { hk: "3Rm4gP" });
	}
	static rotVideo(fbs: FbsRuntime) {
		return fbs._("视频攻略", null, { hk: "ZCgjO" });
	}
	static rateAccuracy(fbs: FbsRuntime) {
		return fbs._("精准", null, { hk: "2AeGqy" });
	}
	static rateCrit(fbs: FbsRuntime) {
		return fbs._("会心", null, { hk: "2HYy58" });
	}
	static rateCritDamage(fbs: FbsRuntime) {
		return fbs._("会意", null, { hk: "2NISlu" });
	}
	static bisMainWeapon(fbs: FbsRuntime) {
		return fbs._("主武器", null, { hk: "2xLZ0B" });
	}
	static bisOffWeapon(fbs: FbsRuntime) {
		return fbs._("副武器", null, { hk: "29LKLY" });
	}
	static bisAccessories(fbs: FbsRuntime) {
		return fbs._("环佩", null, { hk: "1xr2Xu" });
	}
	static bisHeadBody(fbs: FbsRuntime) {
		return fbs._("头衣", null, { hk: "5q234" });
	}
	static bisLegsWrists(fbs: FbsRuntime) {
		return fbs._("腿腕", null, { hk: "2V4vsW" });
	}
	static tabAffix(fbs: FbsRuntime) {
		return fbs._("毕业词缀", null, { hk: "3PpHTl" });
	}
	static affixEmpty(fbs: FbsRuntime) {
		return fbs._("暂无毕业词缀", null, { hk: "2VvGck" });
	}
	static affixSetLabel(fbs: FbsRuntime) {
		return fbs._("套装", null, { hk: "3Enl6Q" });
	}
	static affixBowLabel(fbs: FbsRuntime) {
		return fbs._("弓玦", null, { hk: "1AajFm" });
	}
	static affixDingyinLabel(fbs: FbsRuntime) {
		return fbs._("定音", null, { hk: "26KxhC" });
	}
	static affixColAffix(fbs: FbsRuntime) {
		return fbs._("词缀", null, { hk: "16EKBF" });
	}
	static affixColCount(fbs: FbsRuntime) {
		return fbs._("条数", null, { hk: "4mwXYi" });
	}
	static affixColMax(fbs: FbsRuntime) {
		return fbs._("满值", null, { hk: "eId1V" });
	}
	static affixColCy(fbs: FbsRuntime) {
		return fbs._("承音", null, { hk: "4FnHSO" });
	}
	static affixSource(fbs: FbsRuntime) {
		return fbs._("按 100 阶毕业配方整理，与配装台同一口径；满值、承音为单条词缀上限。", null, { hk: "1MY2sq" });
	}
}
export abstract class TiaolvFbtUtils {
	static intro(fbs: FbsRuntime) {
		return fbs._("调律推演 · 复刻 bilibili@片雲 DIY 0.10.2（100级）伤害计算器逻辑", null, { hk: "xKnus" });
	}
	static innerSkill(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("心法{n}", [fbs._param("n", pv(p, "n"))], { hk: "2jqPjk" });
	}
	static innerSkillPlaceholder(fbs: FbsRuntime) {
		return fbs._("心法名", null, { hk: "4Mj94" });
	}
	static wuxue(fbs: FbsRuntime) {
		return fbs._("武学", null, { hk: "3dhSON" });
	}
	static wuku(fbs: FbsRuntime) {
		return fbs._("武库", null, { hk: "XYxXn" });
	}
	static wukuSelf(fbs: FbsRuntime) {
		return fbs._("本系", null, { hk: "3w8iOp" });
	}
	static wukuCommon(fbs: FbsRuntime) {
		return fbs._("通用", null, { hk: "2xPWC9" });
	}
	static suit(fbs: FbsRuntime) {
		return fbs._("套装", null, { hk: "YjsNP" });
	}
	static bow(fbs: FbsRuntime) {
		return fbs._("弓决", null, { hk: "38Tf0A" });
	}
	static none(fbs: FbsRuntime) {
		return fbs._("无", null, { hk: "rH9It" });
	}
	static tuneArea(fbs: FbsRuntime) {
		return fbs._("调律区（K:R 列，对应 Excel K3:R5, K6:R24）", null, { hk: "p72sz" });
	}
	static calc(fbs: FbsRuntime) {
		return fbs._("开始推演", null, { hk: "4BLTKr" });
	}
	static calculating(fbs: FbsRuntime) {
		return fbs._("推演中…", null, { hk: "qGaJh" });
	}
	static toastFailed(fbs: FbsRuntime) {
		return fbs._("计算失败", null, { hk: "1BD4dr" });
	}
	static toastFailedWith(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("计算失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "2JHtzB" });
	}
	static colAttr(fbs: FbsRuntime) {
		return fbs._("属性", null, { hk: "SD6RS" });
	}
	static colBase(fbs: FbsRuntime) {
		return fbs._("基础白值", null, { hk: "30sYgQ" });
	}
	static colPanel(fbs: FbsRuntime) {
		return fbs._("面板白值", null, { hk: "315ddm" });
	}
	static colFinal(fbs: FbsRuntime) {
		return fbs._("最终面板", null, { hk: "14LkAK" });
	}
}
export abstract class GradFbtUtils {
	static entering(fbs: FbsRuntime) {
		return fbs._("正在进入武库…", null, { hk: "3ORrmk" });
	}
	static title(fbs: FbsRuntime) {
		return fbs._("武库鉴宝", null, { hk: "4x79Cr" });
	}
	static subtitle(fbs: FbsRuntime) {
		return fbs._("条数50% · 数值30% · 三率20%", null, { hk: "3XPjcv" });
	}
	static mingjinNote(fbs: FbsRuntime) {
		return fbs._("鸣金 · 大外会意流", null, { hk: "1l1zwq" });
	}
	static buildBig(fbs: FbsRuntime) {
		return fbs._("大外", null, { hk: "OsDVe" });
	}
	static buildSmall(fbs: FbsRuntime) {
		return fbs._("小外", null, { hk: "1P2b7v" });
	}
	static ringLabel(fbs: FbsRuntime) {
		return fbs._("毕业率", null, { hk: "4qywKu" });
	}
	static scoreCount(fbs: FbsRuntime) {
		return fbs._("条数匹配", null, { hk: "VlieX" });
	}
	static scoreValue(fbs: FbsRuntime) {
		return fbs._("数值达成", null, { hk: "kVEgR" });
	}
	static scoreRate(fbs: FbsRuntime) {
		return fbs._("三率达标", null, { hk: "40YIA1" });
	}
	static tier1(fbs: FbsRuntime) {
		return fbs._("天人合一", null, { hk: "2EeKpV" });
	}
	static tier2(fbs: FbsRuntime) {
		return fbs._("登峰造极", null, { hk: "36U3RW" });
	}
	static tier3(fbs: FbsRuntime) {
		return fbs._("炉火纯青", null, { hk: "2pnyqw" });
	}
	static tier4(fbs: FbsRuntime) {
		return fbs._("小有所成", null, { hk: "49EmwB" });
	}
	static tier5(fbs: FbsRuntime) {
		return fbs._("初窥门径", null, { hk: "1BzJ98" });
	}
	static tier6(fbs: FbsRuntime) {
		return fbs._("凡铁未炼", null, { hk: "3ojv4W" });
	}
	static tapHint(fbs: FbsRuntime) {
		return fbs._("轻触装备以镌刻词条", null, { hk: "3HeLov" });
	}
	static refTitle(fbs: FbsRuntime) {
		return fbs._("📖 参考数据 · 词条满值与版位", null, { hk: "2OEwck" });
	}
	static maxTableTitle(fbs: FbsRuntime) {
		return fbs._("词条满值表（100阶）", null, { hk: "4kYhuB" });
	}
	static colAffix(fbs: FbsRuntime) {
		return fbs._("词条", null, { hk: "3PpLky" });
	}
	static colMax(fbs: FbsRuntime) {
		return fbs._("满值", null, { hk: "VyZKd" });
	}
	static colResonance(fbs: FbsRuntime) {
		return fbs._("承音（95%)", null, { hk: "14RNqj" });
	}
	static slotTableTitle(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("部位版位表（{build}）", [fbs._param("build", pv(p, "build"))], { hk: "BpqwT" });
	}
	static rateTitle(fbs: FbsRuntime) {
		return fbs._("⚡ 三率速算", null, { hk: "h65pG" });
	}
	static rateOk(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{v} ✓", [fbs._param("v", pv(p, "v"))], { hk: "2yR10d" });
	}
	static rateGap(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{v} （差{gap}）", [fbs._param("v", pv(p, "v")), fbs._param("gap", pv(p, "gap"))], { hk: "sKEhV" });
	}
	static rateOverflow(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("⚠️ 会心+会意={sum}>100，会意挤占会心", [fbs._param("sum", pv(p, "sum"))], { hk: "ZWubl" });
	}
	static compareTitle(fbs: FbsRuntime) {
		return fbs._("⚔️ 方案对比", null, { hk: "2bDsft" });
	}
	static saveScheme(fbs: FbsRuntime) {
		return fbs._("💾 保存当前配装为方案", null, { hk: "1q6Dfu" });
	}
	static schemeName(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("方案{n}", [fbs._param("n", pv(p, "n"))], { hk: "iP58k" });
	}
	static noSchemes(fbs: FbsRuntime) {
		return fbs._("暂无方案，先填好装备再保存", null, { hk: "19NTg6" });
	}
	static load(fbs: FbsRuntime) {
		return fbs._("载入", null, { hk: "Ku4mt" });
	}
	static deleteScheme(fbs: FbsRuntime) {
		return fbs._("删除方案", null, { hk: "2p79rN" });
	}
	static itemScore(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("本件 {score}%", [fbs._param("score", pv(p, "score"))], { hk: "16GG9c" });
	}
	static rowMain(fbs: FbsRuntime) {
		return fbs._("主词条", null, { hk: "2jGdya" });
	}
	static rowSub(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("副词条{n}", [fbs._param("n", pv(p, "n"))], { hk: "vsfjK" });
	}
	static rowResonance(fbs: FbsRuntime) {
		return fbs._("定音", null, { hk: "2IoF6H" });
	}
	static ratePrecision(fbs: FbsRuntime) {
		return fbs._("精准", null, { hk: "2vSyyP" });
	}
	static rateCrit(fbs: FbsRuntime) {
		return fbs._("会心", null, { hk: "1IhDD7" });
	}
	static rateAffinity(fbs: FbsRuntime) {
		return fbs._("会意", null, { hk: "2pX9a2" });
	}
	static affixPlaceholder(fbs: FbsRuntime) {
		return fbs._("— 待镌刻 —", null, { hk: "3daHQR" });
	}
	static affixLoading(fbs: FbsRuntime) {
		return fbs._("词条数据加载中…", null, { hk: "2TUyPm" });
	}
	static valuePlaceholderMax(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("数值 / {max}", [fbs._param("max", pv(p, "max"))], { hk: "11leO4" });
	}
	static valuePlaceholder(fbs: FbsRuntime) {
		return fbs._("数值", null, { hk: "45srMh" });
	}
	static resonance(fbs: FbsRuntime) {
		return fbs._("承音", null, { hk: "3HpWKQ" });
	}
	static overMax(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("超过满值 {max}，将按满值计算", [fbs._param("max", pv(p, "max"))], { hk: "26Hpge" });
	}
	static toastSaved(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已保存方案「{name}」", [fbs._param("name", pv(p, "name"))], { hk: "FHZfc" });
	}
	static toastLoaded(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已载入方案「{name}」", [fbs._param("name", pv(p, "name"))], { hk: "1migJf" });
	}
	static toastOldScheme(fbs: FbsRuntime) {
		return fbs._("旧方案只保存了分数，无法载入配装", null, { hk: "2ZGG3u" });
	}
}
export abstract class GearFbtUtils {
	static calcLabel(fbs: FbsRuntime) {
		return fbs._("计算", null, { hk: "2kLCD4" });
	}
	static benchTitle(fbs: FbsRuntime) {
		return fbs._("配装台", null, { hk: "1K2f4q" });
	}
	static benchIntro(fbs: FbsRuntime) {
		return fbs._("100 阶配装：按流派配方拼装备、算面板与毕业度（口径：条数 40% + 数值 24% + 定音 20%，与上方毕业计算的口径不同）。装备库与方案保存在你的 Discord 账号下，换设备也能用。", null, { hk: "1wK3RF" });
	}
	static targetLabel(fbs: FbsRuntime) {
		return fbs._("目标流派", null, { hk: "1kdjnX" });
	}
	static bowLabel(fbs: FbsRuntime) {
		return fbs._("弓玦", null, { hk: "34xSPl" });
	}
	static bowNoneLabel(fbs: FbsRuntime) {
		return fbs._("无", null, { hk: "4avWGd" });
	}
	static extrasTitle(fbs: FbsRuntime) {
		return fbs._("其他来源加成", null, { hk: "4yvpq7" });
	}
	static resLabel(fbs: FbsRuntime) {
		return fbs._("抗性", null, { hk: "3g1w0Q" });
	}
	static extraAccLabel(fbs: FbsRuntime) {
		return fbs._("白字精准（手填）", null, { hk: "35QYtU" });
	}
	static extraCritLabel(fbs: FbsRuntime) {
		return fbs._("白字会心（手填）", null, { hk: "3ILVKb" });
	}
	static extraIntLabel(fbs: FbsRuntime) {
		return fbs._("白字会意（手填）", null, { hk: "1G95ny" });
	}
	static baseTitle(fbs: FbsRuntime) {
		return fbs._("角色基础", null, { hk: "HGR1O" });
	}
	static unlockLabel(fbs: FbsRuntime) {
		return fbs._("解锁", null, { hk: "34oqrL" });
	}
	static lockLabel(fbs: FbsRuntime) {
		return fbs._("锁定", null, { hk: "2kGaTl" });
	}
	static modifiedTag(fbs: FbsRuntime) {
		return fbs._("已改", null, { hk: "3sJauA" });
	}
	static baseResetLabel(fbs: FbsRuntime) {
		return fbs._("恢复预设", null, { hk: "1RNJ44" });
	}
	static baseResetTitle(fbs: FbsRuntime) {
		return fbs._("恢复预设？", null, { hk: "vc9fT" });
	}
	static baseResetBody(fbs: FbsRuntime) {
		return fbs._("角色基础将回到预设值，心法选择保留。", null, { hk: "1ptiAP" });
	}
	static xinfaLabelTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("心法 {n}", [fbs._param("n", pv(p, "n"))], { hk: "20ZwzO" });
	}
	static xinfaNoneLabel(fbs: FbsRuntime) {
		return fbs._("— 不选 —", null, { hk: "46K6vA" });
	}
	static loginHint(fbs: FbsRuntime) {
		return fbs._("装备库与方案按你的 Discord 账号保存，登录后可用（计算与参考数据无需登录）。", null, { hk: "3o4TzZ" });
	}
	static libTitle(fbs: FbsRuntime) {
		return fbs._("装备库", null, { hk: "29CS95" });
	}
	static myLibTitle(fbs: FbsRuntime) {
		return fbs._("我的装备库", null, { hk: "1pgRT0" });
	}
	static myBuildsTitle(fbs: FbsRuntime) {
		return fbs._("我的方案", null, { hk: "474ufs" });
	}
	static libCountTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("共 {n} 件", [fbs._param("n", pv(p, "n"))], { hk: "29Bsbl" });
	}
	static usageTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已存 {n} / {limit} 件", [fbs._param("n", pv(p, "n")), fbs._param("limit", pv(p, "limit"))], { hk: "uPN2o" });
	}
	static usageNearLimitText(fbs: FbsRuntime) {
		return fbs._("装备库快满了，导入新装备前先清理不用的装备", null, { hk: "1oHkuC" });
	}
	static formSlotLabel(fbs: FbsRuntime) {
		return fbs._("部位", null, { hk: "3SIgEj" });
	}
	static formNameLabel(fbs: FbsRuntime) {
		return fbs._("名称", null, { hk: "EyEyK" });
	}
	static formNamePlaceholder(fbs: FbsRuntime) {
		return fbs._("装备名（可空）", null, { hk: "1zpr6v" });
	}
	static affixPlaceholder(fbs: FbsRuntime) {
		return fbs._("选词条", null, { hk: "2FvZa9" });
	}
	static valuePlaceholder(fbs: FbsRuntime) {
		return fbs._("数值", null, { hk: "4k2wu0" });
	}
	static refTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("满值 {max} / 承音 {cy}", [fbs._param("max", pv(p, "max")), fbs._param("cy", pv(p, "cy"))], { hk: "JcCgj" });
	}
	static fillMaxLabel(fbs: FbsRuntime) {
		return fbs._("填满值", null, { hk: "e6Hwa" });
	}
	static fillCyLabel(fbs: FbsRuntime) {
		return fbs._("填承音", null, { hk: "qFM4n" });
	}
	static delRowLabel(fbs: FbsRuntime) {
		return fbs._("删此行", null, { hk: "18L69d" });
	}
	static addRowLabel(fbs: FbsRuntime) {
		return fbs._("加一行", null, { hk: "2MhrV1" });
	}
	static dyNameLabel(fbs: FbsRuntime) {
		return fbs._("定音名称", null, { hk: "1R819K" });
	}
	static dyNamePlaceholder(fbs: FbsRuntime) {
		return fbs._("如 外功穿透 / 无名剑法·蓄力技增伤", null, { hk: "36gPAs" });
	}
	static dyValLabel(fbs: FbsRuntime) {
		return fbs._("定音数值", null, { hk: "2sQLHA" });
	}
	static schoolsLabel(fbs: FbsRuntime) {
		return fbs._("流派标签（武器）", null, { hk: "2C9XYw" });
	}
	static addGearLabel(fbs: FbsRuntime) {
		return fbs._("存入装备库", null, { hk: "1FyM8n" });
	}
	static updateGearLabel(fbs: FbsRuntime) {
		return fbs._("保存修改", null, { hk: "3dWDoQ" });
	}
	static cancelEditLabel(fbs: FbsRuntime) {
		return fbs._("取消编辑", null, { hk: "yvQPZ" });
	}
	static demoLabel(fbs: FbsRuntime) {
		return fbs._("载入示例套", null, { hk: "29Zox3" });
	}
	static clearLibLabel(fbs: FbsRuntime) {
		return fbs._("清空装备库", null, { hk: "4u6XIj" });
	}
	static clearConfirmTitle(fbs: FbsRuntime) {
		return fbs._("清空装备库？", null, { hk: "4sK2X9" });
	}
	static clearConfirmBody(fbs: FbsRuntime) {
		return fbs._("你账号下的全部装备与方案都会删除，当前搭配也会清空，此操作不可恢复。", null, { hk: "38FtqH" });
	}
	static equipLabel(fbs: FbsRuntime) {
		return fbs._("选入", null, { hk: "33DB2v" });
	}
	static unequipLabel(fbs: FbsRuntime) {
		return fbs._("卸下", null, { hk: "4qcTjb" });
	}
	static editLabel(fbs: FbsRuntime) {
		return fbs._("编辑", null, { hk: "3sGW5y" });
	}
	static deleteLabel(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "2ybcd4" });
	}
	static simLabel(fbs: FbsRuntime) {
		return fbs._("模拟", null, { hk: "2kj8uB" });
	}
	static simRealLabel(fbs: FbsRuntime) {
		return fbs._("实际", null, { hk: "4CbeUi" });
	}
	static simCyLabel(fbs: FbsRuntime) {
		return fbs._("承音", null, { hk: "6ICcQ" });
	}
	static simMaxLabel(fbs: FbsRuntime) {
		return fbs._("满值", null, { hk: "NeQqC" });
	}
	static verdictHeirloom(fbs: FbsRuntime) {
		return fbs._("传家宝", null, { hk: "4wMZCA" });
	}
	static verdictDud(fbs: FbsRuntime) {
		return fbs._("拉完了", null, { hk: "1BVStm" });
	}
	static scoreTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("评分 {score}", [fbs._param("score", pv(p, "score"))], { hk: "2n0qfX" });
	}
	static qualityLabel(fbs: FbsRuntime) {
		return fbs._("数值达成", null, { hk: "2VZfM3" });
	}
	static exportLabel(fbs: FbsRuntime) {
		return fbs._("导出数据", null, { hk: "DPENA" });
	}
	static exportFileName(fbs: FbsRuntime) {
		return fbs._("100阶配装数据.json", null, { hk: "uPYjV" });
	}
	static importNameTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("导入 · {slot}", [fbs._param("slot", pv(p, "slot"))], { hk: "4bhbtM" });
	}
	static importLabel(fbs: FbsRuntime) {
		return fbs._("导入数据", null, { hk: "1puJ5B" });
	}
	static importFailedToast(fbs: FbsRuntime) {
		return fbs._("导入失败：文件无效", null, { hk: "2zTvFc" });
	}
	static importedToastTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已导入 {n} 件", [fbs._param("n", pv(p, "n"))], { hk: "2xdGoD" });
	}
	static manualTitle(fbs: FbsRuntime) {
		return fbs._("手动录入", null, { hk: "2E7B70" });
	}
	static pasteTitle(fbs: FbsRuntime) {
		return fbs._("粘贴代码导入", null, { hk: "Yp0xy" });
	}
	static pastePlaceholder(fbs: FbsRuntime) {
		return fbs._("把装备数据代码粘到这里（JSON / Base64 / 文本均可）", null, { hk: "27wtI6" });
	}
	static pasteButtonLabel(fbs: FbsRuntime) {
		return fbs._("解析并导入装备库", null, { hk: "2Xx6Fb" });
	}
	static pasteDemoLabel(fbs: FbsRuntime) {
		return fbs._("填入示例代码", null, { hk: "2KDdRA" });
	}
	static pasteEmptyText(fbs: FbsRuntime) {
		return fbs._("先把代码粘到上面的框里再点解析。", null, { hk: "3LqYU6" });
	}
	static pasteOkTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("✓ 已按「{mode}」解析，导入 {n} 件装备 / {lines} 条词条，已自动选入搭配。", [
			fbs._param("mode", pv(p, "mode")),
			fbs._param("n", pv(p, "n")),
			fbs._param("lines", pv(p, "lines"))
		], { hk: "34sVb" });
	}
	static pasteUnknownTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("另有 {n} 条没认出的字段被跳过（多半是气血、防御、外功穿透这类本站不计的词条）。", [fbs._param("n", pv(p, "n"))], { hk: "4kjkKf" });
	}
	static pasteFailText(fbs: FbsRuntime) {
		return fbs._("没能从这段代码里认出装备。常见原因：复制时漏了一头一尾、复制的是角色外观分享码（不含装备数值）、或这份数据的字段格式本站还没适配。", null, { hk: "3Rgv6z" });
	}
	static pasteFullText(fbs: FbsRuntime) {
		return fbs._("识别为本工具导出的数据，已按整库导入处理。", null, { hk: "3N27QR" });
	}
	static ocrTitle(fbs: FbsRuntime) {
		return fbs._("截图导入（本地识别，不上传）", null, { hk: "4CCfbj" });
	}
	static ocrDropText(fbs: FbsRuntime) {
		return fbs._("点这里选一张装备详情截图，或拖进来 / Ctrl+V 粘贴", null, { hk: "2W43tH" });
	}
	static ocrPreparingText(fbs: FbsRuntime) {
		return fbs._("正在准备图片…", null, { hk: "26RxjO" });
	}
	static ocrRunningText(fbs: FbsRuntime) {
		return fbs._("正在识别（首次会下载中文 + 英文识别包，可能要十几秒）…", null, { hk: "1TYlTe" });
	}
	static ocrSecondText(fbs: FbsRuntime) {
		return fbs._("正在增强识别（第二遍）…", null, { hk: "2Upo35" });
	}
	static ocrFailedText(fbs: FbsRuntime) {
		return fbs._("识别失败了。常见原因：网络不通下不到识别包、图片太模糊。可以换一张更清晰、完整的详情页截图再试。", null, { hk: "paBas" });
	}
	static ocrBadTypeText(fbs: FbsRuntime) {
		return fbs._("这张图格式不对，只支持 PNG / JPEG / WebP 截图。", null, { hk: "3vqEQa" });
	}
	static ocrTooBigText(fbs: FbsRuntime) {
		return fbs._("图片超过 15MB，换一张小一点的截图。", null, { hk: "1lKcJR" });
	}
	static ocrNoEngineText(fbs: FbsRuntime) {
		return fbs._("识别组件没能加载（OCR 引擎需要联网从 CDN 载入）。检查网络后刷新页面再试；粘贴代码导入不受影响。", null, { hk: "2q3N9Q" });
	}
	static ocrDoneTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("✓ 识别完成：认出 {n} 条词条{slotPart}{dyPart}。请逐行核对数值再确认存入。", [
			fbs._param("n", pv(p, "n")),
			fbs._param("slotPart", pv(p, "slotPart")),
			fbs._param("dyPart", pv(p, "dyPart"))
		], { hk: "oJviZ" });
	}
	static ocrSlotLabel(fbs: FbsRuntime) {
		return fbs._("部位", null, { hk: "2CiU41" });
	}
	static ocrNameLabel(fbs: FbsRuntime) {
		return fbs._("名称", null, { hk: "2umFBC" });
	}
	static ocrEquipLabel(fbs: FbsRuntime) {
		return fbs._("存入后直接选入搭配", null, { hk: "3J3VVR" });
	}
	static ocrConfirmLabel(fbs: FbsRuntime) {
		return fbs._("确认存入", null, { hk: "3r4Zg4" });
	}
	static ocrCancelLabel(fbs: FbsRuntime) {
		return fbs._("放弃", null, { hk: "QBedJ" });
	}
	static ocrUnknownTitle(fbs: FbsRuntime) {
		return fbs._("下面这些行没认出词条，已原样列出（不会丢行）：需要的话点「补一条词条行」手动加上；纯界面文字可忽略。", null, { hk: "1Ijdtk" });
	}
	static ocrSavedTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("✓ 已存入装备库：{slot}（{n} 条词条）", [fbs._param("slot", pv(p, "slot")), fbs._param("n", pv(p, "n"))], { hk: "8uNKY" });
	}
	static ocrNeedLineToast(fbs: FbsRuntime) {
		return fbs._("至少保留一条有效词条再确认", null, { hk: "3WGSLg" });
	}
	static ocrLowConfTag(fbs: FbsRuntime) {
		return fbs._("低置信，请核对", null, { hk: "1N2fGy" });
	}
	static ocrAddRowLabel(fbs: FbsRuntime) {
		return fbs._("补一条词条行", null, { hk: "2VJpfv" });
	}
	static ocrImportSlotTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("导入{slot}", [fbs._param("slot", pv(p, "slot"))], { hk: "1akSw1" });
	}
	static ocrBatchTitle(fbs: FbsRuntime) {
		return fbs._("批量截图识别（全屏截图自动框选 · 本地识别，不上传）", null, { hk: "1cOsFj" });
	}
	static ocrBatchDropText(fbs: FbsRuntime) {
		return fbs._("把多张截图拖到这里，或点选多张 / Ctrl+V 粘贴（全屏截图也可以，会自动找装备面板）", null, { hk: "1hhLhQ" });
	}
	static ocrBatchQueuedText(fbs: FbsRuntime) {
		return fbs._("排队中", null, { hk: "Nd17m" });
	}
	static ocrBatchRunningText(fbs: FbsRuntime) {
		return fbs._("识别中…", null, { hk: "3eorYj" });
	}
	static ocrBatchReadyText(fbs: FbsRuntime) {
		return fbs._("待核对", null, { hk: "2Uq8hS" });
	}
	static ocrBatchFailedText(fbs: FbsRuntime) {
		return fbs._("识别失败", null, { hk: "3PCxKB" });
	}
	static ocrBatchImportedText(fbs: FbsRuntime) {
		return fbs._("已导入", null, { hk: "4hyCeG" });
	}
	static ocrBatchRetryLabel(fbs: FbsRuntime) {
		return fbs._("重试", null, { hk: "hpwIZ" });
	}
	static ocrBatchRemoveLabel(fbs: FbsRuntime) {
		return fbs._("移除", null, { hk: "3EXgWk" });
	}
	static ocrBatchAdjustLabel(fbs: FbsRuntime) {
		return fbs._("调整框选", null, { hk: "2zEp4m" });
	}
	static ocrBatchApplyBoxLabel(fbs: FbsRuntime) {
		return fbs._("按此框重新识别", null, { hk: "1KSFKG" });
	}
	static ocrBatchDetectedText(fbs: FbsRuntime) {
		return fbs._("已自动框选面板", null, { hk: "1Zd71Q" });
	}
	static ocrBatchFullImageText(fbs: FbsRuntime) {
		return fbs._("未定位到面板，按整图识别", null, { hk: "zUdNB" });
	}
	static ocrBatchDupTag(fbs: FbsRuntime) {
		return fbs._("重复", null, { hk: "1P2q5L" });
	}
	static ocrBatchDupLibText(fbs: FbsRuntime) {
		return fbs._("与装备库已有装备相同，默认不导入", null, { hk: "C0m3T" });
	}
	static ocrBatchDupRowText(fbs: FbsRuntime) {
		return fbs._("与本批另一张相同，默认不导入", null, { hk: "LC6BT" });
	}
	static ocrBatchIncludeLabel(fbs: FbsRuntime) {
		return fbs._("导入这件", null, { hk: "2vvawT" });
	}
	static ocrBatchNoLinesText(fbs: FbsRuntime) {
		return fbs._("没认出词条：请核对部位、补词条行，或调整框选后重新识别（不会自动丢弃）", null, { hk: "4nCcYr" });
	}
	static ocrBatchImportTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("全部导入（{n} 件）", [fbs._param("n", pv(p, "n"))], { hk: "3wzPsN" });
	}
	static ocrBatchResultTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("✓ 批量导入完成：已导入 {n} 件，跳过 {m} 件。", [fbs._param("n", pv(p, "n")), fbs._param("m", pv(p, "m"))], { hk: "3MGNKr" });
	}
	static libEmptyText(fbs: FbsRuntime) {
		return fbs._("装备库是空的。手动录入、粘贴代码或截图识别都可以加装备。", null, { hk: "2LmP6i" });
	}
	static equippedTag(fbs: FbsRuntime) {
		return fbs._("已选入", null, { hk: "1n0CUW" });
	}
	static loadoutTitle(fbs: FbsRuntime) {
		return fbs._("组合搭配 · 8 个部位", null, { hk: "4eBhro" });
	}
	static autoLabel(fbs: FbsRuntime) {
		return fbs._("一键最优组合", null, { hk: "3Nmnt7" });
	}
	static autoDoneToast(fbs: FbsRuntime) {
		return fbs._("已拼好", null, { hk: "39nlZg" });
	}
	static autoFallbackToast(fbs: FbsRuntime) {
		return fbs._("已拼好（含兜底选装）", null, { hk: "fDSDV" });
	}
	static unequipAllLabel(fbs: FbsRuntime) {
		return fbs._("全部卸下", null, { hk: "1oBB3K" });
	}
	static slotEmptyText(fbs: FbsRuntime) {
		return fbs._("未选", null, { hk: "2dMnk2" });
	}
	static panelTitle(fbs: FbsRuntime) {
		return fbs._("面板与毕业度", null, { hk: "dKMoc" });
	}
	static gradLabel(fbs: FbsRuntime) {
		return fbs._("毕业度", null, { hk: "2PSuTH" });
	}
	static gradCountLabel(fbs: FbsRuntime) {
		return fbs._("条数", null, { hk: "9JeT5" });
	}
	static gradValueLabel(fbs: FbsRuntime) {
		return fbs._("数值", null, { hk: "2nrC3Y" });
	}
	static gradDyLabel(fbs: FbsRuntime) {
		return fbs._("定音", null, { hk: "UkPqT" });
	}
	static gradDyToggleLabel(fbs: FbsRuntime) {
		return fbs._("定音计入毕业度", null, { hk: "1Bs9cJ" });
	}
	static loanLabel(fbs: FbsRuntime) {
		return fbs._("满值模拟（全套满值时的毕业度）", null, { hk: "2jzqY8" });
	}
	static simActiveTag(fbs: FbsRuntime) {
		return fbs._("模拟中", null, { hk: "2UgeZN" });
	}
	static copySummaryLabel(fbs: FbsRuntime) {
		return fbs._("复制摘要", null, { hk: "30M19Y" });
	}
	static copiedToast(fbs: FbsRuntime) {
		return fbs._("已复制", null, { hk: "1hd4E9" });
	}
	static copyFailedToast(fbs: FbsRuntime) {
		return fbs._("复制失败，请手动记录", null, { hk: "2z8oFs" });
	}
	static yAccLabel(fbs: FbsRuntime) {
		return fbs._("黄字精准", null, { hk: "4miIvq" });
	}
	static yCritLabel(fbs: FbsRuntime) {
		return fbs._("黄字会心", null, { hk: "1ukzo5" });
	}
	static yIntLabel(fbs: FbsRuntime) {
		return fbs._("黄字会意", null, { hk: "1sVWx0" });
	}
	static finalCritLabel(fbs: FbsRuntime) {
		return fbs._("最终会心", null, { hk: "3VZKgq" });
	}
	static whiteLabel(fbs: FbsRuntime) {
		return fbs._("白字", null, { hk: "4zm2VF" });
	}
	static dawaiLabel(fbs: FbsRuntime) {
		return fbs._("大外", null, { hk: "28cDC6" });
	}
	static xiaowaiLabel(fbs: FbsRuntime) {
		return fbs._("小外", null, { hk: "xpxre" });
	}
	static dashuLabel(fbs: FbsRuntime) {
		return fbs._("大属", null, { hk: "4e7d2u" });
	}
	static xiaoshuLabel(fbs: FbsRuntime) {
		return fbs._("小属", null, { hk: "1YzVlC" });
	}
	static hpLabel(fbs: FbsRuntime) {
		return fbs._("气血", null, { hk: "1bqIkl" });
	}
	static defLabel(fbs: FbsRuntime) {
		return fbs._("防御", null, { hk: "4kHWSA" });
	}
	static talentLabel(fbs: FbsRuntime) {
		return fbs._("天赋", null, { hk: "2T0Q4d" });
	}
	static diffTitle(fbs: FbsRuntime) {
		return fbs._("差缺清单：离毕业还差什么", null, { hk: "2kQAAI" });
	}
	static diffLackTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("还差 {n}", [fbs._param("n", pv(p, "n"))], { hk: "4oUCd7" });
	}
	static diffExactText(fbs: FbsRuntime) {
		return fbs._("正好", null, { hk: "1XCcbg" });
	}
	static diffOverTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("多 {n}", [fbs._param("n", pv(p, "n"))], { hk: "SwjEJ" });
	}
	static diffExtraTitle(fbs: FbsRuntime) {
		return fbs._("配方外", null, { hk: "1EvvUu" });
	}
	static diffLowTitle(fbs: FbsRuntime) {
		return fbs._("未满承音的词条", null, { hk: "3JL0dH" });
	}
	static diffDoneText(fbs: FbsRuntime) {
		return fbs._("✓ 毕业。", null, { hk: "2KOp6i" });
	}
	static diffEmptyText(fbs: FbsRuntime) {
		return fbs._("还没选装备。", null, { hk: "3w3K5C" });
	}
	static diffInvalidTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("异常：{n} 条无相在非武器部位，未计入。", [fbs._param("n", pv(p, "n"))], { hk: "2k3PQ2" });
	}
	static suggestTitle(fbs: FbsRuntime) {
		return fbs._("建议", null, { hk: "JtH1A" });
	}
	static suggestSwapTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{slot}：换上「{name}」", [fbs._param("slot", pv(p, "slot")), fbs._param("name", pv(p, "name"))], { hk: "3RINgn" });
	}
	static suggestWashTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{slot}：把第 {line} 条 {from} 洗成 {to}", [
			fbs._param("slot", pv(p, "slot")),
			fbs._param("line", pv(p, "line")),
			fbs._param("from", pv(p, "from")),
			fbs._param("to", pv(p, "to"))
		], { hk: "3vjrF0" });
	}
	static suggestNoneText(fbs: FbsRuntime) {
		return fbs._("这套暂时挑不出毛病", null, { hk: "VI5lW" });
	}
	static suggestHeadTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("当前 {cur}% → 全做 {final}%", [fbs._param("cur", pv(p, "cur")), fbs._param("final", pv(p, "final"))], { hk: "2pSurh" });
	}
	static dySummaryTitle(fbs: FbsRuntime) {
		return fbs._("定音汇总", null, { hk: "4FAPsu" });
	}
	static dyCorrectText(fbs: FbsRuntime) {
		return fbs._("对", null, { hk: "3QSDTA" });
	}
	static dyWrongText(fbs: FbsRuntime) {
		return fbs._("类型不符", null, { hk: "1dsd3p" });
	}
	static schemeTitle(fbs: FbsRuntime) {
		return fbs._("配装方案对比", null, { hk: "GzWD9" });
	}
	static schemeSaveLabel(fbs: FbsRuntime) {
		return fbs._("存为方案", null, { hk: "48SHwL" });
	}
	static schemeNameTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("方案 {n}", [fbs._param("n", pv(p, "n"))], { hk: "3KZMLk" });
	}
	static schemeLoadLabel(fbs: FbsRuntime) {
		return fbs._("载入", null, { hk: "3cSr50" });
	}
	static schemeDeleteLabel(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "2uzrOO" });
	}
	static schemeEmptyText(fbs: FbsRuntime) {
		return fbs._("还没有保存的方案。", null, { hk: "13Qrl7" });
	}
	static schemeComposeFirstText(fbs: FbsRuntime) {
		return fbs._("先在配装台拼好一套搭配，才能存为方案。", null, { hk: "1hRS7o" });
	}
	static schemeSavedToastTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已存方案：{name}", [fbs._param("name", pv(p, "name"))], { hk: "18UCJp" });
	}
	static schemeLoadedToastTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已载入：{name}", [fbs._param("name", pv(p, "name"))], { hk: "jhqOF" });
	}
	static schemeGroupCountTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{n} 套", [fbs._param("n", pv(p, "n"))], { hk: "2IInPZ" });
	}
	static shareLabel(fbs: FbsRuntime) {
		return fbs._("分享", null, { hk: "2RwuEu" });
	}
	static revokeShareLabel(fbs: FbsRuntime) {
		return fbs._("取消分享", null, { hk: "2pIwAc" });
	}
	static copyLinkLabel(fbs: FbsRuntime) {
		return fbs._("复制链接", null, { hk: "24xTKv" });
	}
	static shareRevokedToast(fbs: FbsRuntime) {
		return fbs._("已取消分享，旧链接已失效", null, { hk: "1eg1bQ" });
	}
	static quickTitle(fbs: FbsRuntime) {
		return fbs._("三率速算器", null, { hk: "1nEC7h" });
	}
	static quickResLabel(fbs: FbsRuntime) {
		return fbs._("抗性", null, { hk: "2KKyUH" });
	}
	static quickSyncLabel(fbs: FbsRuntime) {
		return fbs._("从配装台同步", null, { hk: "1QQ9rx" });
	}
	static quickSyncedToast(fbs: FbsRuntime) {
		return fbs._("已同步", null, { hk: "3nSq5d" });
	}
	static quickOkText(fbs: FbsRuntime) {
		return fbs._("✓ 已满值", null, { hk: "1hwt0O" });
	}
	static quickOverTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("，溢出 {v}%", [fbs._param("v", pv(p, "v"))], { hk: "1xODvp" });
	}
	static quickGapTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("还差白字 {lack}%（满值 {need}%）≈ {bars} 条{barName}", [
			fbs._param("lack", pv(p, "lack")),
			fbs._param("need", pv(p, "need")),
			fbs._param("bars", pv(p, "bars")),
			fbs._param("barName", pv(p, "barName"))
		], { hk: "2EhVjX" });
	}
	static recipesTitle(fbs: FbsRuntime) {
		return fbs._("全流派配方表（100 阶 · 承音）", null, { hk: "1j76JG" });
	}
	static recipeSearchPlaceholder(fbs: FbsRuntime) {
		return fbs._("搜流派 / 套装 / 词条", null, { hk: "8Iu0u" });
	}
	static recipeAllLabel(fbs: FbsRuntime) {
		return fbs._("全部", null, { hk: "3STF5h" });
	}
	static recipeColCat(fbs: FbsRuntime) {
		return fbs._("类别", null, { hk: "1PSW6B" });
	}
	static recipeColSchool(fbs: FbsRuntime) {
		return fbs._("流派", null, { hk: "30osQ2" });
	}
	static recipeColSet(fbs: FbsRuntime) {
		return fbs._("套装", null, { hk: "1f8EHH" });
	}
	static recipeColRecipe(fbs: FbsRuntime) {
		return fbs._("词条搭配（承音）", null, { hk: "1QbkHD" });
	}
	static recipeColBow(fbs: FbsRuntime) {
		return fbs._("推荐弓", null, { hk: "15lpkw" });
	}
	static recipeSetTargetLabel(fbs: FbsRuntime) {
		return fbs._("设为目标", null, { hk: "6M1Ad" });
	}
	static recipeEmptyText(fbs: FbsRuntime) {
		return fbs._("没有符合的配方。", null, { hk: "23dIhx" });
	}
	static recipeTargetToastTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("目标已设为：{school} · {set}", [fbs._param("school", pv(p, "school")), fbs._param("set", pv(p, "set"))], { hk: "MwpSG" });
	}
	static sectRecipesTitle(fbs: FbsRuntime) {
		return fbs._("100 阶配方（配装台口径）", null, { hk: "1w0r1S" });
	}
	static affixTableTitle(fbs: FbsRuntime) {
		return fbs._("词条满值 / 承音对照表（配装台）", null, { hk: "uSC6s" });
	}
	static colCyLabel(fbs: FbsRuntime) {
		return fbs._("承音", null, { hk: "3l5J5X" });
	}
	static colCyPctLabel(fbs: FbsRuntime) {
		return fbs._("承音/满值", null, { hk: "1Ew3lL" });
	}
	static colRecipeNamesLabel(fbs: FbsRuntime) {
		return fbs._("配方叫法", null, { hk: "3agAXO" });
	}
	static survivalNote(fbs: FbsRuntime) {
		return fbs._("生存向，配方未列", null, { hk: "1rZukJ" });
	}
	static slotTableTitle(fbs: FbsRuntime) {
		return fbs._("部位版位表（配装台）", null, { hk: "3JjSZ0" });
	}
	static slotsBigTitle(fbs: FbsRuntime) {
		return fbs._("大外流派", null, { hk: "3IBUAh" });
	}
	static slotsSmallTitle(fbs: FbsRuntime) {
		return fbs._("小外流派", null, { hk: "2ZTbet" });
	}
	static formulaTitle(fbs: FbsRuntime) {
		return fbs._("公式与五维换算速查", null, { hk: "31wzz9" });
	}
	static formulaRatesTitle(fbs: FbsRuntime) {
		return fbs._("三率换算", null, { hk: "1wVoEL" });
	}
	static formulaDimsTitle(fbs: FbsRuntime) {
		return fbs._("五维换算（每 1 点）", null, { hk: "3YX8Dx" });
	}
	static formulaOrderTitle(fbs: FbsRuntime) {
		return fbs._("选装顺序", null, { hk: "ShpWL" });
	}
	static formulaAccTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("黄字精准 = 65% +（白字精准 − 65%）÷ 抗性，白字 {white}% 满值 100%。", [fbs._param("white", pv(p, "white"))], { hk: "40UKam" });
	}
	static formulaCritTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("黄字会心 = 白字会心 ÷ 抗性，白字 {white}% 满值 80%。", [fbs._param("white", pv(p, "white"))], { hk: "3UDngG" });
	}
	static formulaIntTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("黄字会意 = 白字会意 ÷ 抗性，白字 {white}% 满值 40%。", [fbs._param("white", pv(p, "white"))], { hk: "2bOd0Q" });
	}
	static formulaBarsTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("差几条估算（按承音每条）：精准 {acc} / 会心 {crit} / 会意 {int}；敏补会心 ≈ +{minCrit}% 白字 / 条，势补会意 ≈ +{shiInt}% 白字 / 条。", [
			fbs._param("acc", pv(p, "acc")),
			fbs._param("crit", pv(p, "crit")),
			fbs._param("int", pv(p, "int")),
			fbs._param("minCrit", pv(p, "minCrit")),
			fbs._param("shiInt", pv(p, "shiInt"))
		], { hk: "4zVvJw" });
	}
	static formulaBowTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("弓（弓玦）加成计入白字：精准弓 白字精准 +{acc} / 会心弓 白字会心 +{crit} / 会意弓 白字会意 +{int}，再按抗性换算黄字。抗性 {res}（当前版本）。", [
			fbs._param("acc", pv(p, "acc")),
			fbs._param("crit", pv(p, "crit")),
			fbs._param("int", pv(p, "int")),
			fbs._param("res", pv(p, "res"))
		], { hk: "1xLzR4" });
	}
	static formulaOrderText(fbs: FbsRuntime) {
		return fbs._("定流派 → 对配方 → 录装备。一键最优拼一版 → 看差缺清单补缺。精准先堆满 100%；会心 148% / 会意 74% 封顶，溢出换劲 / 势 / 增伤。两套拿不准，存方案比总分。", null, { hk: "2kac7u" });
	}
	static colDimLabel(fbs: FbsRuntime) {
		return fbs._("五维", null, { hk: "1qZt6N" });
	}
	static colConvLabel(fbs: FbsRuntime) {
		return fbs._("换算", null, { hk: "3nMzJn" });
	}
	static colFullBarTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("满条 {v} 折合", [fbs._param("v", pv(p, "v"))], { hk: "A0wwY" });
	}
	static calcFailedText(fbs: FbsRuntime) {
		return fbs._("计算失败，请稍后再试", null, { hk: "4EV81i" });
	}
	static demoLoadedToast(fbs: FbsRuntime) {
		return fbs._("示例已载入", null, { hk: "2OWtHa" });
	}
	static savedToastTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已存入：{name}", [fbs._param("name", pv(p, "name"))], { hk: "3P2eD5" });
	}
	static deletedToast(fbs: FbsRuntime) {
		return fbs._("已删除", null, { hk: "4hqOVh" });
	}
	static clearedToast(fbs: FbsRuntime) {
		return fbs._("已清空", null, { hk: "sNPSz" });
	}
}
export abstract class LegalFbtUtils {
	static termsTitle(fbs: FbsRuntime) {
		return fbs._("服务条款", null, { hk: "34DESW" });
	}
	static privacyTitle(fbs: FbsRuntime) {
		return fbs._("隐私政策", null, { hk: "LS3Ub" });
	}
	static termsLink(fbs: FbsRuntime) {
		return fbs._("服务条款", null, { hk: "kCpyF" });
	}
	static privacyLink(fbs: FbsRuntime) {
		return fbs._("隐私政策", null, { hk: "tIZGL" });
	}
	static updatedText(fbs: FbsRuntime) {
		return fbs._("最后更新：2026 年 10 月 25 日", null, { hk: "2QXCh8" });
	}
	static disclaimer(fbs: FbsRuntime) {
		return fbs._("本站为玩家自发维护的非官方工具，与《燕云十六声》及其开发、发行方无隶属或背书关系；游戏名称与相关素材的权利归其各自权利方所有。", null, { hk: "1LmOGD" });
	}
}
export abstract class TermsBodyFbtUtils {
	static s1h(fbs: FbsRuntime) {
		return fbs._("关于本站与非官方声明", null, { hk: "ojxr4" });
	}
	static s1b(fbs: FbsRuntime) {
		return fbs._("燕云百业（yanyun.app）是一个由玩家自发维护的非官方百业（公会）组队工具，与《燕云十六声》及其开发、发行方没有任何隶属或背书关系。本站中出现的游戏名称、副本、流派等资料，其权利归各自权利方所有。", null, { hk: "XSiit" });
	}
	static s2h(fbs: FbsRuntime) {
		return fbs._("账号与访问", null, { hk: "4kWL7n" });
	}
	static s2b(fbs: FbsRuntime) {
		return fbs._("本站通过 Discord OAuth 登录。使用本站即表示你同意本条款。你应妥善保管自己的 Discord 账号，通过你的账号进行的操作视为你本人行为。各百业内容的可见与可写范围，由你是否属于该百业绑定的 Discord 服务器决定。", null, { hk: "3gozWo" });
	}
	static s3h(fbs: FbsRuntime) {
		return fbs._("使用规范", null, { hk: "3GabVI" });
	}
	static s3b(fbs: FbsRuntime) {
		return fbs._("不得利用本站冒充他人或其它百业、抢注或占用与你无关的百业标识、发布违法或侵权内容、干扰本站运行，或绕过成员校验。车队标题、报名昵称等由用户发布的内容，由发布者自行负责。", null, { hk: "4dXIYD" });
	}
	static s4h(fbs: FbsRuntime) {
		return fbs._("服务现状", null, { hk: "4x0sgN" });
	}
	static s4b(fbs: FbsRuntime) {
		return fbs._("本站目前免费提供，并按现状（as is）运行。我们不承诺服务持续可用、功能保持不变，或数据永不丢失；功能可能被调整、中断或终止，原则上不另行通知。重要数据请自行留存备份。", null, { hk: "3ek0eT" });
	}
	static s5h(fbs: FbsRuntime) {
		return fbs._("责任限制", null, { hk: "1r7u2o" });
	}
	static s5b(fbs: FbsRuntime) {
		return fbs._("在适用法律允许的最大范围内，本站对因使用或无法使用本站而产生的间接、附带或后果性损失不承担责任。", null, { hk: "3tT9J5" });
	}
	static s6h(fbs: FbsRuntime) {
		return fbs._("条款变更", null, { hk: "2QKQhC" });
	}
	static s6b(fbs: FbsRuntime) {
		return fbs._("本条款可能不时更新，更新后的版本在本站公布即生效；你继续使用本站即视为接受更新后的条款。", null, { hk: "1cDdQ1" });
	}
}
export abstract class PrivacyBodyFbtUtils {
	static s1h(fbs: FbsRuntime) {
		return fbs._("我们收集的信息", null, { hk: "3DC5sT" });
	}
	static s1b(fbs: FbsRuntime) {
		return fbs._("当你使用 Discord 登录时，我们会读取并保存：你的 Discord 用户 ID、用户名与头像、你加入的 Discord 服务器列表、你在这些服务器中的昵称，以及用于保持登录状态的 OAuth 授权凭据（refresh token）。你在使用本站过程中产生的数据也会被保存，包括百业名册记录、车队与报名记录（包括座位上的身份标识）、装备库与配装方案、语言偏好，以及你在移动端开启通知后注册的推送令牌。", null, { hk: "QzffU" });
	}
	static s2h(fbs: FbsRuntime) {
		return fbs._("我们如何使用信息", null, { hk: "2xsvgr" });
	}
	static s2b(fbs: FbsRuntime) {
		return fbs._("上述信息仅用于：登录与身份识别；校验你是否为某百业所绑定 Discord 服务器的成员；组队报名；发车提醒与应用推送；传家宝达成推送；以及按你的偏好显示语言。我们不出售你的个人数据，也不将其用于广告投放。", null, { hk: "3PLd7Q" });
	}
	static s3h(fbs: FbsRuntime) {
		return fbs._("信息的共享与第三方", null, { hk: "2YIysf" });
	}
	static s3b(fbs: FbsRuntime) {
		return fbs._("本站运行在 Cloudflare 的基础设施上，数据存储于其数据库服务；登录与成员校验由 Discord 提供；移动端推送经 Expo 推送服务转发至 Apple 或 Google 的推送通道。发车提醒与传家宝消息会发送到对应百业管理员配置的 Discord 频道，消息中会包含你的游戏昵称。除上述功能所必需的情形外，我们不会向其他第三方提供你的个人数据（法律法规要求除外）。", null, { hk: "43OqWT" });
	}
	static s4h(fbs: FbsRuntime) {
		return fbs._("保存期限", null, { hk: "1U9Wy5" });
	}
	static s4b(fbs: FbsRuntime) {
		return fbs._("你的数据保存在本站数据库中，直至你申请删除，或相关数据对本站功能不再需要为止。报名、车队等历史记录目前会持续保留；如保存规则发生变化，我们会更新本政策。", null, { hk: "1abLW7" });
	}
	static s5h(fbs: FbsRuntime) {
		return fbs._("你的权利", null, { hk: "1FsOlT" });
	}
	static s5b(fbs: FbsRuntime) {
		return fbs._("你可以查询、导出或删除你的个人数据。在「个人资料」的「我的数据」中，你可以自助导出你的全部数据（需通过 Discord 重新验证身份，每 24 小时一次），也可以自助删除账号：提交删除后有 7 天冷静期，期间可随时撤销；到期后你的个人数据会被删除或匿名化——你创建的车队会转为无主车队、你在他人车队中的座位会被匿名化，备份中的副本最迟在 14 天内随每日备份轮换清除。你也可以随时在 Discord 的设置中断开本站的授权；授权失效后，你在本站的会话会自动作废。", null, { hk: "1uyGts" });
	}
	static s6h(fbs: FbsRuntime) {
		return fbs._("联系我们", null, { hk: "2c6z90" });
	}
	static s6b(fbs: FbsRuntime) {
		return fbs._("如对本政策有疑问，或需提出查询、更正、删除申请，请通过本站社区百业「叽哩呱啦」的 Discord 服务器联系管理员。我们会先核实你的 Discord 账号身份，再处理你的申请。", null, { hk: "3xquvS" });
	}
}
export abstract class ErrorsFbtUtils {
	static rateLimited(fbs: FbsRuntime) {
		return fbs._("操作过于频繁, 请稍后再试", null, { hk: "24gcAF" });
	}
	static createRateLimited(fbs: FbsRuntime) {
		return fbs._("创建太频繁, 请稍后再试", null, { hk: "2VXEs2" });
	}
	static guildNotFound(fbs: FbsRuntime) {
		return fbs._("百业不存在", null, { hk: "1sJVTz" });
	}
	static gearNotFound(fbs: FbsRuntime) {
		return fbs._("装备不存在或不属于你", null, { hk: "4Bqufd" });
	}
	static gearEmptyBuild(fbs: FbsRuntime) {
		return fbs._("搭配为空", null, { hk: "3P3YIH" });
	}
	static gearCapacityReached(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("装备库已满（上限 {limit} 件），删掉不用的装备后再添加", [fbs._param("limit", pv(p, "limit"))], { hk: "Rmyp7" });
	}
	static gearImportOverflow(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("本批 {n} 件会让装备库达到 {total} 件，超过上限 {limit} 件，整批未导入", [
			fbs._param("n", pv(p, "n")),
			fbs._param("total", pv(p, "total")),
			fbs._param("limit", pv(p, "limit"))
		], { hk: "i9Eg0" });
	}
	static gearOcrBatchTooLarge(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("单批最多识别 {limit} 张截图，本批有 {n} 张，请分批导入", [fbs._param("limit", pv(p, "limit")), fbs._param("n", pv(p, "n"))], { hk: "QzYA" });
	}
	static gearOcrDailyLimit(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("今天的批量识别次数已达上限（{limit} 批），明天再试", [fbs._param("limit", pv(p, "limit"))], { hk: "16O6RH" });
	}
	static loginRequired(fbs: FbsRuntime) {
		return fbs._("请先登录 Discord 后再操作", null, { hk: "1SEQ55" });
	}
	static loginRequiredShort(fbs: FbsRuntime) {
		return fbs._("请先登录 Discord", null, { hk: "pJJ75" });
	}
	static localeUnsupported(fbs: FbsRuntime) {
		return fbs._("不支持的语言", null, { hk: "j9YN8" });
	}
	static pushTokenInvalid(fbs: FbsRuntime) {
		return fbs._("推送令牌无效", null, { hk: "1LhKcu" });
	}
	static guildUnboundWrite(fbs: FbsRuntime) {
		return fbs._("该百业尚未绑定 Discord 服务器，写功能已锁定", null, { hk: "2fp9pu" });
	}
	static memberOnly(fbs: FbsRuntime) {
		return fbs._("只有该百业 Discord 服务器的成员可以操作", null, { hk: "2SEGVd" });
	}
	static memberOnlyView(fbs: FbsRuntime) {
		return fbs._("该百业仅对 Discord 服务器成员开放", null, { hk: "3Hv1KW" });
	}
	static titleRequired(fbs: FbsRuntime) {
		return fbs._("请填写标题", null, { hk: "1Jsgcg" });
	}
	static badStartTime(fbs: FbsRuntime) {
		return fbs._("请选择有效的出发时间", null, { hk: "3sAvLq" });
	}
	static startTimeTooFar(fbs: FbsRuntime) {
		return fbs._("出发时间不能超过 60 天后", null, { hk: "DMtM9" });
	}
	static groupingNotFound(fbs: FbsRuntime) {
		return fbs._("组队不存在", null, { hk: "UNb4g" });
	}
	static officialEvent(fbs: FbsRuntime) {
		return fbs._("官方活动请联系管理员", null, { hk: "43nkzu" });
	}
	static noCreatorRecorded(fbs: FbsRuntime) {
		return fbs._("该车队未记录车头，无法解散，请联系管理员处理", null, { hk: "LcMio" });
	}
	static leaderOnlyDisband(fbs: FbsRuntime) {
		return fbs._("只有车头可以解散车队", null, { hk: "3pk75u" });
	}
	static noCreatorRecordedEdit(fbs: FbsRuntime) {
		return fbs._("该车队未记录车头，无法编辑，请联系管理员处理", null, { hk: "3P84TA" });
	}
	static leaderOnlyEdit(fbs: FbsRuntime) {
		return fbs._("只有车头可以编辑车队", null, { hk: "yIOhs" });
	}
	static noCreatorRecordedComplete(fbs: FbsRuntime) {
		return fbs._("该车队未记录车头，无法完成，请联系管理员处理", null, { hk: "3fTeYQ" });
	}
	static leaderOnlyComplete(fbs: FbsRuntime) {
		return fbs._("只有车头可以完成车队", null, { hk: "3sKwKR" });
	}
	static noCreatorRecordedReopen(fbs: FbsRuntime) {
		return fbs._("该车队未记录车头，无法恢复，请联系管理员处理", null, { hk: "2hftHh" });
	}
	static leaderOnlyReopen(fbs: FbsRuntime) {
		return fbs._("只有车头可以恢复车队", null, { hk: "39coxw" });
	}
	static groupingAlreadyCompleted(fbs: FbsRuntime) {
		return fbs._("该车队已是完成状态", null, { hk: "25147t" });
	}
	static groupingNotCompleted(fbs: FbsRuntime) {
		return fbs._("该车队尚未完成", null, { hk: "4rkNE3" });
	}
	static groupingClosed(fbs: FbsRuntime) {
		return fbs._("该组队已截止报名", null, { hk: "2VgEG4" });
	}
	static nicknameRequired(fbs: FbsRuntime) {
		return fbs._("请填写游戏昵称", null, { hk: "dEulb" });
	}
	static proxyTargetNotInRoster(fbs: FbsRuntime) {
		return fbs._("所选成员不在本百业名册中", null, { hk: "a9Yz0" });
	}
	static groupingFull(fbs: FbsRuntime) {
		return fbs._("名额已满或报名已截止", null, { hk: "2oRCcW" });
	}
	static lastSeatHealer(fbs: FbsRuntime) {
		return fbs._("最后一个名额需要奶", null, { hk: "41E3Sj" });
	}
	static alreadyJoined(fbs: FbsRuntime) {
		return fbs._("已报过名", null, { hk: "3ITdhJ" });
	}
	static seatNotFound(fbs: FbsRuntime) {
		return fbs._("未找到该报名", null, { hk: "4qCeKk" });
	}
	static notSeated(fbs: FbsRuntime) {
		return fbs._("你还没有落座这辆车", null, { hk: "2XueBH" });
	}
	static reminderOffsetsInvalid(fbs: FbsRuntime) {
		return fbs._("提醒提前量不在可选范围内", null, { hk: "36SXgz" });
	}
	static ogAccentInvalid(fbs: FbsRuntime) {
		return fbs._("强调色不在可选范围内", null, { hk: "znj0W" });
	}
	static paramsIncomplete(fbs: FbsRuntime) {
		return fbs._("参数不完整", null, { hk: "fv2xj" });
	}
	static bossNotFound(fbs: FbsRuntime) {
		return fbs._("首领不存在", null, { hk: "hPhwR" });
	}
	static guildNameShort(fbs: FbsRuntime) {
		return fbs._("百业名称至少 2 个字", null, { hk: "3FgoBZ" });
	}
	static avatarTooLarge(fbs: FbsRuntime) {
		return fbs._("头像图片不能超过 400KB", null, { hk: "3bJhEG" });
	}
	static avatarBadType(fbs: FbsRuntime) {
		return fbs._("头像只支持 PNG、JPEG 或 WebP 图片", null, { hk: "4y3c4p" });
	}
	static avatarEmpty(fbs: FbsRuntime) {
		return fbs._("没有收到图片数据", null, { hk: "2ECMBn" });
	}
	static slugInvalid(fbs: FbsRuntime) {
		return fbs._("站点地址只能用小写字母/数字/连字符, 2-40 位", null, { hk: "2mgcnU" });
	}
	static slugReserved(fbs: FbsRuntime) {
		return fbs._("该地址为保留字, 请换一个", null, { hk: "2f5iTY" });
	}
	static slugTaken(fbs: FbsRuntime) {
		return fbs._("该地址已被占用, 请换一个", null, { hk: "1Hon8z" });
	}
	static serverRequired(fbs: FbsRuntime) {
		return fbs._("请选择要绑定的 Discord 服务器", null, { hk: "4C2p7o" });
	}
	static notInServer(fbs: FbsRuntime) {
		return fbs._("你不在这个 Discord 服务器中", null, { hk: "4mZrHl" });
	}
	static cannotManageServer(fbs: FbsRuntime) {
		return fbs._("你需要在该 Discord 服务器拥有管理员或「管理服务器」权限才能绑定它", null, { hk: "37PvZE" });
	}
	static adminOnly(fbs: FbsRuntime) {
		return fbs._("只有所绑服务器的管理员可以执行此操作", null, { hk: "13a8ee" });
	}
	static webhookInvalid(fbs: FbsRuntime) {
		return fbs._("Webhook 地址格式不正确", null, { hk: "3TamDe" });
	}
	static discordIdInvalid(fbs: FbsRuntime) {
		return fbs._("Discord 服务器 ID 格式不正确", null, { hk: "2WO0bx" });
	}
	static noFieldsToUpdate(fbs: FbsRuntime) {
		return fbs._("没有可更新的字段", null, { hk: "1BCEnK" });
	}
	static signupNotFound(fbs: FbsRuntime) {
		return fbs._("未找到该报名记录", null, { hk: "1CDqBx" });
	}
	static resultNotFound(fbs: FbsRuntime) {
		return fbs._("未找到该成绩", null, { hk: "V660K" });
	}
	static resultTeamRequired(fbs: FbsRuntime) {
		return fbs._("缺少队伍名", null, { hk: "1tmhSg" });
	}
	static resultTimeInvalid(fbs: FbsRuntime) {
		return fbs._("用时格式不正确（如 12:34.567）", null, { hk: "69rGE" });
	}
	static avatarDataInvalid(fbs: FbsRuntime) {
		return fbs._("图片数据无效", null, { hk: "3vzaSY" });
	}
	static schoolRequired(fbs: FbsRuntime) {
		return fbs._("缺少流派", null, { hk: "2EpNBU" });
	}
	static generic(fbs: FbsRuntime) {
		return fbs._("操作失败，请稍后再试", null, { hk: "2rYUtK" });
	}
	static templateNotFound(fbs: FbsRuntime) {
		return fbs._("模板不存在", null, { hk: "2GDkiI" });
	}
	static templateNameRequired(fbs: FbsRuntime) {
		return fbs._("请填写模板名", null, { hk: "2LkPVU" });
	}
	static templateForbidden(fbs: FbsRuntime) {
		return fbs._("只有模板创建者或百业管理员可以改删模板", null, { hk: "RvJFt" });
	}
	static templateBadStart(fbs: FbsRuntime) {
		return fbs._("发车时间设置无效", null, { hk: "20lZIE" });
	}
	static accountReauthRequired(fbs: FbsRuntime) {
		return fbs._("请先通过 Discord 重新验证身份", null, { hk: "2vPwx1" });
	}
	static accountExportRateLimited(fbs: FbsRuntime) {
		return fbs._("每 24 小时只能导出一次数据，请稍后再试", null, { hk: "2McU4D" });
	}
	static accountUsernameMismatch(fbs: FbsRuntime) {
		return fbs._("输入的显示名与你的账号不一致", null, { hk: "11ujee" });
	}
	static accountDeletionPending(fbs: FbsRuntime) {
		return fbs._("已有一份删除申请在冷静期中", null, { hk: "32JC0o" });
	}
	static accountDeletionNotPending(fbs: FbsRuntime) {
		return fbs._("当前没有待执行的删除申请", null, { hk: "1QUdHI" });
	}
	static premiumRequired(fbs: FbsRuntime) {
		return fbs._("该功能需要开通 Premium", null, { hk: "19jkus" });
	}
	static premiumComingSoon(fbs: FbsRuntime) {
		return fbs._("Premium 开通即将开放", null, { hk: "46IB9m" });
	}
	static premiumActive(fbs: FbsRuntime) {
		return fbs._("本百业已开通 Premium", null, { hk: "4ceZGD" });
	}
	static paygateDisabled(fbs: FbsRuntime) {
		return fbs._("收费功能尚未开启", null, { hk: "2u3Wa8" });
	}
	static checkoutFailed(fbs: FbsRuntime) {
		return fbs._("创建支付会话失败，请稍后再试", null, { hk: "2JSaBi" });
	}
	static rosterImportEmpty(fbs: FbsRuntime) {
		return fbs._("没有收到任何识别文本，请重新截图后再试", null, { hk: "4i5R8K" });
	}
	static rosterBatchNotFound(fbs: FbsRuntime) {
		return fbs._("导入预览不存在或已失效，请重新识别", null, { hk: "2QDDb1" });
	}
	static rosterBatchConfirmed(fbs: FbsRuntime) {
		return fbs._("这份预览已经确认导入过了", null, { hk: "1Gts0b" });
	}
	static rosterNoImportableRows(fbs: FbsRuntime) {
		return fbs._("没有勾选任何可导入的新名", null, { hk: "3ebrUb" });
	}
	static rosterEntryNotFound(fbs: FbsRuntime) {
		return fbs._("名册记录不存在", null, { hk: "4pVJDO" });
	}
	static checklistItemUnknown(fbs: FbsRuntime) {
		return fbs._("检查条目不存在", null, { hk: "2zs7yq" });
	}
	static feedbackEmpty(fbs: FbsRuntime) {
		return fbs._("反馈内容不能为空", null, { hk: "2fa2ne" });
	}
	static feedbackTooLong(fbs: FbsRuntime) {
		return fbs._("反馈内容太长，请精简到 2000 字以内", null, { hk: "3xgizG" });
	}
	static feedbackRateLimited(fbs: FbsRuntime) {
		return fbs._("今天提交的反馈已达上限，请明天再来", null, { hk: "4tzXEe" });
	}
	static announcementTitleRequired(fbs: FbsRuntime) {
		return fbs._("请填写公告标题", null, { hk: "W041z" });
	}
	static announcementTitleTooLong(fbs: FbsRuntime) {
		return fbs._("公告标题太长，请精简到 80 字以内", null, { hk: "2Ik1AD" });
	}
	static announcementBodyTooLong(fbs: FbsRuntime) {
		return fbs._("公告正文太长，请精简到 2000 字以内", null, { hk: "118qKc" });
	}
	static announcementNotFound(fbs: FbsRuntime) {
		return fbs._("公告不存在", null, { hk: "1Lw7VE" });
	}
	static announcementDailyLimit(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("今天的公告已达上限（每天 {limit} 条），明天再发", [fbs._param("limit", pv(p, "limit"))], { hk: "1xinu8" });
	}
	static urgentCallDailyLimit(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("今天的紧急集合呼叫已达上限（每天 {limit} 次），明天再试", [fbs._param("limit", pv(p, "limit"))], { hk: "3ElFFE" });
	}
	static lotteryTitleRequired(fbs: FbsRuntime) {
		return fbs._("请填写抽奖标题", null, { hk: "20oyyi" });
	}
	static lotteryEntriesEmpty(fbs: FbsRuntime) {
		return fbs._("参与名单为空，请先选择参与者", null, { hk: "keAMM" });
	}
	static lotteryNotFound(fbs: FbsRuntime) {
		return fbs._("抽奖不存在", null, { hk: "1Lg4Ze" });
	}
	static lotteryAlreadyDrawn(fbs: FbsRuntime) {
		return fbs._("该抽奖已经开过奖了", null, { hk: "4zGOSK" });
	}
	static lotteryWinnerCountInvalid(fbs: FbsRuntime) {
		return fbs._("中奖人数必须在 1 与参与人数之间", null, { hk: "3wDQQO" });
	}
	static lotteryWeightInvalid(fbs: FbsRuntime) {
		return fbs._("权重必须是 1 到 1000 之间的整数", null, { hk: "rU9E9" });
	}
	static lotteryMemberNotInGuild(fbs: FbsRuntime) {
		return fbs._("所选成员不在本百业名册中", null, { hk: "4sq9UB" });
	}
	static availabilitySlotInvalid(fbs: FbsRuntime) {
		return fbs._("可用时段不合法", null, { hk: "1PVvrL" });
	}
	static availabilityTooManySlots(fbs: FbsRuntime) {
		return fbs._("可用时段太多（最多 21 个）", null, { hk: "5cg7H" });
	}
	static pollTitleRequired(fbs: FbsRuntime) {
		return fbs._("请填写投票标题", null, { hk: "1ICL5j" });
	}
	static pollOptionsInvalid(fbs: FbsRuntime) {
		return fbs._("候选时间不合法（需 2–8 个不同的未来时间）", null, { hk: "4a76Lv" });
	}
	static pollNotFound(fbs: FbsRuntime) {
		return fbs._("投票不存在", null, { hk: "SEsAt" });
	}
	static pollClosed(fbs: FbsRuntime) {
		return fbs._("该投票已关闭", null, { hk: "2ThdE3" });
	}
	static pollOptionInvalid(fbs: FbsRuntime) {
		return fbs._("所选时间不属于该投票", null, { hk: "4csk84" });
	}
	static pollForbidden(fbs: FbsRuntime) {
		return fbs._("只有发起人或百业管理员可以关闭投票", null, { hk: "2XIBcy" });
	}
	static customFieldInvalid(fbs: FbsRuntime) {
		return fbs._("自定义字段不合法", null, { hk: "27PyP1" });
	}
	static customFieldTooMany(fbs: FbsRuntime) {
		return fbs._("自定义字段最多 5 个", null, { hk: "1Rti3z" });
	}
	static signupAnswerRequired(fbs: FbsRuntime) {
		return fbs._("请填写必填的报名信息", null, { hk: "4c3jjL" });
	}
	static signupAnswerInvalid(fbs: FbsRuntime) {
		return fbs._("报名信息不合法", null, { hk: "1s3HzU" });
	}
	static applicationPending(fbs: FbsRuntime) {
		return fbs._("你已有一份待审核的申请，请等待审核结果", null, { hk: "2Giyct" });
	}
	static alreadyMember(fbs: FbsRuntime) {
		return fbs._("你已经是这个百业的成员了", null, { hk: "4g3vga" });
	}
	static recruitUnavailable(fbs: FbsRuntime) {
		return fbs._("该百业尚未绑定 Discord 服务器，暂不开放招新申请", null, { hk: "48ddMS" });
	}
	static applicationNotFound(fbs: FbsRuntime) {
		return fbs._("申请不存在", null, { hk: "1MBYm8" });
	}
	static applicationNotPending(fbs: FbsRuntime) {
		return fbs._("该申请已经审核过了", null, { hk: "2ZFW5h" });
	}
	static mentorNotDesignated(fbs: FbsRuntime) {
		return fbs._("所选导师不在本百业导师人选中，请先设为导师", null, { hk: "3iSGns" });
	}
	static mentorNotInGuild(fbs: FbsRuntime) {
		return fbs._("所选导师不在本百业名册中", null, { hk: "3Ip8br" });
	}
	static menteeNotInGuild(fbs: FbsRuntime) {
		return fbs._("所选新人不在本百业名册中", null, { hk: "2ugrgv" });
	}
	static menteeAlreadyPaired(fbs: FbsRuntime) {
		return fbs._("该新人已有一段进行中的配对，请先结束它再改配", null, { hk: "2Z8vlr" });
	}
	static mentorSelfPairing(fbs: FbsRuntime) {
		return fbs._("导师和新人不能是同一个人", null, { hk: "h0eUX" });
	}
	static pairingNotFound(fbs: FbsRuntime) {
		return fbs._("配对不存在", null, { hk: "pRRzR" });
	}
	static pairingAlreadyEnded(fbs: FbsRuntime) {
		return fbs._("该配对已经结束了", null, { hk: "2EbjaL" });
	}
	static officerNoteBodyRequired(fbs: FbsRuntime) {
		return fbs._("请填写备注内容", null, { hk: "2SinE2" });
	}
	static officerNoteBodyTooLong(fbs: FbsRuntime) {
		return fbs._("备注太长，请精简到 500 字以内", null, { hk: "2UmXWp" });
	}
	static officerNoteNotFound(fbs: FbsRuntime) {
		return fbs._("备注不存在", null, { hk: "12m1fk" });
	}
	static officerMemberNotFound(fbs: FbsRuntime) {
		return fbs._("该成员不在本百业名册中", null, { hk: "1h5oBR" });
	}
	static seasonGoalTitleRequired(fbs: FbsRuntime) {
		return fbs._("请填写目标", null, { hk: "4hkl3C" });
	}
	static seasonGoalTitleTooLong(fbs: FbsRuntime) {
		return fbs._("目标太长，请精简到 80 字以内", null, { hk: "1G5w06" });
	}
	static seasonGoalNoteTooLong(fbs: FbsRuntime) {
		return fbs._("进度备注太长，请精简到 500 字以内", null, { hk: "1CggSQ" });
	}
	static seasonGoalNotFound(fbs: FbsRuntime) {
		return fbs._("目标不存在", null, { hk: "29dqqZ" });
	}
	static seasonGoalDungeonNotFound(fbs: FbsRuntime) {
		return fbs._("关联的副本不存在", null, { hk: "1EQ8a5" });
	}
}
export abstract class GuildAdminFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("管理百业", null, { hk: "4uAK0w" });
	}
	static lockedTitle(fbs: FbsRuntime) {
		return fbs._("无权管理这个百业", null, { hk: "2scxga" });
	}
	static lockedBody(fbs: FbsRuntime) {
		return fbs._("只有该百业所绑 Discord 服务器的管理员（服务器主或拥有管理权限）可以进入管理页。", null, { hk: "9JZbD" });
	}
	static backLink(fbs: FbsRuntime) {
		return fbs._("‹ 返回百业", null, { hk: "ZRhTA" });
	}
	static tabProfile(fbs: FbsRuntime) {
		return fbs._("资料", null, { hk: "2uIwip" });
	}
	static tabDiscord(fbs: FbsRuntime) {
		return fbs._("Discord", null, { hk: "45mhJu" });
	}
	static tabEvents(fbs: FbsRuntime) {
		return fbs._("活动", null, { hk: "4y5dH" });
	}
	static tabGuides(fbs: FbsRuntime) {
		return fbs._("攻略数据", null, { hk: "2mnh27" });
	}
	static saveButton(fbs: FbsRuntime) {
		return fbs._("保存", null, { hk: "3tEfi7" });
	}
	static savedText(fbs: FbsRuntime) {
		return fbs._("已保存", null, { hk: "1YXNnN" });
	}
	static deleteButton(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "1FjjIp" });
	}
	static editButton(fbs: FbsRuntime) {
		return fbs._("编辑", null, { hk: "2hBYX0" });
	}
	static addButton(fbs: FbsRuntime) {
		return fbs._("新增", null, { hk: "upio1" });
	}
	static profileTitle(fbs: FbsRuntime) {
		return fbs._("百业资料", null, { hk: "35e1aj" });
	}
	static nameLabel(fbs: FbsRuntime) {
		return fbs._("百业名称", null, { hk: "3VGhAA" });
	}
	static announcementLabel(fbs: FbsRuntime) {
		return fbs._("公告", null, { hk: "3MPdbH" });
	}
	static sloganLabel(fbs: FbsRuntime) {
		return fbs._("标语", null, { hk: "3g5s53" });
	}
	static masterNameLabel(fbs: FbsRuntime) {
		return fbs._("掌门", null, { hk: "1NFB6U" });
	}
	static logoUrlLabel(fbs: FbsRuntime) {
		return fbs._("标志图链接", null, { hk: "OzzkB" });
	}
	static bgImageUrlLabel(fbs: FbsRuntime) {
		return fbs._("背景图链接", null, { hk: "2d8wA9" });
	}
	static avatarTitle(fbs: FbsRuntime) {
		return fbs._("百业头像", null, { hk: "4boKYO" });
	}
	static avatarUpload(fbs: FbsRuntime) {
		return fbs._("上传头像", null, { hk: "LWhmg" });
	}
	static avatarReplace(fbs: FbsRuntime) {
		return fbs._("更换头像", null, { hk: "1rpgyJ" });
	}
	static avatarDelete(fbs: FbsRuntime) {
		return fbs._("删除头像", null, { hk: "GFBdo" });
	}
	static avatarNone(fbs: FbsRuntime) {
		return fbs._("尚未设置头像，当前显示默认印章。", null, { hk: "1pyVEl" });
	}
	static avatarHint(fbs: FbsRuntime) {
		return fbs._("正方形图片效果最佳，大小 ≤ 400KB（PNG / JPEG / WebP）。", null, { hk: "4Ekxwl" });
	}
	static discordTitle(fbs: FbsRuntime) {
		return fbs._("Discord 集成", null, { hk: "2hbHGk" });
	}
	static webhookLabel(fbs: FbsRuntime) {
		return fbs._("发车提醒 Webhook", null, { hk: "1BAh7o" });
	}
	static webhookSet(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已设置（Webhook 编号 {id}）", [fbs._param("id", pv(p, "id"))], { hk: "1ZdRAw" });
	}
	static webhookUnset(fbs: FbsRuntime) {
		return fbs._("未设置", null, { hk: "dDpeY" });
	}
	static webhookHint(fbs: FbsRuntime) {
		return fbs._("保存后不回显完整地址；留空并保存 = 保持不变，点「清除」移除。", null, { hk: "2P97lk" });
	}
	static webhookClear(fbs: FbsRuntime) {
		return fbs._("清除 Webhook", null, { hk: "2eQC6C" });
	}
	static guildIdLabel(fbs: FbsRuntime) {
		return fbs._("绑定的服务器 ID", null, { hk: "lQd0C" });
	}
	static guildIdUnbound(fbs: FbsRuntime) {
		return fbs._("未绑定", null, { hk: "10avrI" });
	}
	static reminderTitle(fbs: FbsRuntime) {
		return fbs._("发车提醒设置", null, { hk: "2jq1TS" });
	}
	static reminderOffsetsLabel(fbs: FbsRuntime) {
		return fbs._("提醒提前量（可多选）", null, { hk: "1OIui1" });
	}
	static reminderOffsetOption(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("提前 {minutes} 分钟", [fbs._param("minutes", pv(p, "minutes"))], { hk: "sAIKh" });
	}
	static reminderCustomTextLabel(fbs: FbsRuntime) {
		return fbs._("自定义提醒文案", null, { hk: "14aT54" });
	}
	static reminderCustomTextHint(fbs: FbsRuntime) {
		return fbs._("一行文字，会出现在提醒卡片里；最多 100 字，留空不显示。第一次提前提醒会通知所有人，之后的只催还没就位的人。", null, { hk: "BIh2B" });
	}
	static visibilityTitle(fbs: FbsRuntime) {
		return fbs._("可见性", null, { hk: "1w8r08" });
	}
	static devOnlyLabel(fbs: FbsRuntime) {
		return fbs._("仅开发环境可见", null, { hk: "1jjubx" });
	}
	static eventsTitle(fbs: FbsRuntime) {
		return fbs._("活动管理", null, { hk: "43Z9ae" });
	}
	static signupCsvSuffix(fbs: FbsRuntime) {
		return fbs._("报名表", null, { hk: "2nKUMV" });
	}
	static eventEmpty(fbs: FbsRuntime) {
		return fbs._("暂无活动。", null, { hk: "Pnib" });
	}
	static eventTitleLabel(fbs: FbsRuntime) {
		return fbs._("标题", null, { hk: "4mMdVp" });
	}
	static eventTypeLabel(fbs: FbsRuntime) {
		return fbs._("类型", null, { hk: "3rcy57" });
	}
	static eventStatusLabel(fbs: FbsRuntime) {
		return fbs._("状态", null, { hk: "3DODtd" });
	}
	static eventTimeLabel(fbs: FbsRuntime) {
		return fbs._("发车时间", null, { hk: "45yZmx" });
	}
	static eventSlotsLabel(fbs: FbsRuntime) {
		return fbs._("席位上限", null, { hk: "M1vcc" });
	}
	static eventMeetLabel(fbs: FbsRuntime) {
		return fbs._("集合信息", null, { hk: "47Q0k7" });
	}
	static eventDescLabel(fbs: FbsRuntime) {
		return fbs._("说明", null, { hk: "1lo3WX" });
	}
	static eventDungeonLabel(fbs: FbsRuntime) {
		return fbs._("副本", null, { hk: "1FAR1r" });
	}
	static statusOpen(fbs: FbsRuntime) {
		return fbs._("开放报名", null, { hk: "49jUMw" });
	}
	static statusClosed(fbs: FbsRuntime) {
		return fbs._("已截止", null, { hk: "1FI1Se" });
	}
	static statusCompleted(fbs: FbsRuntime) {
		return fbs._("已完成", null, { hk: "2SS8zB" });
	}
	static statusDraft(fbs: FbsRuntime) {
		return fbs._("草稿", null, { hk: "BswMc" });
	}
	static signupsTitle(fbs: FbsRuntime) {
		return fbs._("报名名单", null, { hk: "1WhBXM" });
	}
	static signupEmpty(fbs: FbsRuntime) {
		return fbs._("暂无报名。", null, { hk: "2xX0pW" });
	}
	static exportCsvButton(fbs: FbsRuntime) {
		return fbs._("导出 CSV", null, { hk: "Dg2q6" });
	}
	static removeSignupButton(fbs: FbsRuntime) {
		return fbs._("移除", null, { hk: "2ybZdT" });
	}
	static resultsTitle(fbs: FbsRuntime) {
		return fbs._("竞速成绩", null, { hk: "QIlMo" });
	}
	static resultTeamLabel(fbs: FbsRuntime) {
		return fbs._("队伍名", null, { hk: "3ZsqJ1" });
	}
	static resultMembersLabel(fbs: FbsRuntime) {
		return fbs._("队员（逗号分隔）", null, { hk: "2KAIPK" });
	}
	static resultTimeLabel(fbs: FbsRuntime) {
		return fbs._("用时（如 12:34.567）", null, { hk: "4niMVm" });
	}
	static resultProofLabel(fbs: FbsRuntime) {
		return fbs._("凭证链接", null, { hk: "20Lpgi" });
	}
	static resultNoteLabel(fbs: FbsRuntime) {
		return fbs._("备注", null, { hk: "1I3mrb" });
	}
	static guidesTitle(fbs: FbsRuntime) {
		return fbs._("流派攻略数据（BiS / 循环）", null, { hk: "NfNBl" });
	}
	static guidesHint(fbs: FbsRuntime) {
		return fbs._("按流派填写：build 名称、属性行、占比行、BiS（JSON）与循环（JSON）。保存后流派页即时生效。", null, { hk: "3fKKdw" });
	}
	static guideSchoolLabel(fbs: FbsRuntime) {
		return fbs._("流派", null, { hk: "31M4rS" });
	}
	static guideBuildLabel(fbs: FbsRuntime) {
		return fbs._("Build 名称", null, { hk: "4eWJd5" });
	}
	static guideAttrLabel(fbs: FbsRuntime) {
		return fbs._("属性行", null, { hk: "vQj17" });
	}
	static guideRateLabel(fbs: FbsRuntime) {
		return fbs._("占比行", null, { hk: "2yVL7z" });
	}
	static guideBisLabel(fbs: FbsRuntime) {
		return fbs._("BiS（JSON）", null, { hk: "3Vlq5G" });
	}
	static guideRotationLabel(fbs: FbsRuntime) {
		return fbs._("循环（JSON）", null, { hk: "485Lhi" });
	}
	static tabStats(fbs: FbsRuntime) {
		return fbs._("统计", null, { hk: "4gdHXs" });
	}
	static tabSeason(fbs: FbsRuntime) {
		return fbs._("赛季", null, { hk: "fqm56" });
	}
	static seasonTitle(fbs: FbsRuntime) {
		return fbs._("赛季前检查清单", null, { hk: "3HWK5z" });
	}
	static seasonHint(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("按当前版本 {version} 与赛季 {season} 自动生成；换季后清单自动重置，逐项复核后勾选。", [fbs._param("version", pv(p, "version")), fbs._param("season", pv(p, "season"))], { hk: "1e7TcX" });
	}
	static seasonProgress(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已完成 {done} / {total}", [fbs._param("done", pv(p, "done")), fbs._param("total", pv(p, "total"))], { hk: "495BtM" });
	}
	static seasonItemDungeonsTitle(fbs: FbsRuntime) {
		return fbs._("复核当前版本副本", null, { hk: "2R9yUh" });
	}
	static seasonItemDungeonsDetail(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("当前版本（{version}）共有 {count} 个副本，确认达标要求与攻略已按本赛季更新。", [fbs._param("version", pv(p, "version")), fbs._param("count", pv(p, "count"))], { hk: "enjun" });
	}
	static seasonItemTemplatesTitle(fbs: FbsRuntime) {
		return fbs._("复核组队模板", null, { hk: "3liaSF" });
	}
	static seasonItemTemplatesDetail(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("本百业现有 {count} 个组队模板，确认模板的副本与人数仍适用于本赛季。", [fbs._param("count", pv(p, "count"))], { hk: "YK3vP" });
	}
	static seasonItemGuidesTitle(fbs: FbsRuntime) {
		return fbs._("复核流派攻略数据", null, { hk: "4t8rLI" });
	}
	static seasonItemGuidesDetail(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("攻略数据现有 {builds} 份 BiS 与 {rotations} 份循环，确认已按本赛季数值更新。", [fbs._param("builds", pv(p, "builds")), fbs._param("rotations", pv(p, "rotations"))], { hk: "3drPJK" });
	}
	static seasonItemRosterTitle(fbs: FbsRuntime) {
		return fbs._("复核成员名册", null, { hk: "2milrJ" });
	}
	static seasonItemRosterDetail(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("Discord 名册 {members} 人，截图名册 {entries} 条；确认成员装备季标与名册均为本赛季最新。", [fbs._param("members", pv(p, "members")), fbs._param("entries", pv(p, "entries"))], { hk: "loIXD" });
	}
	static rosterTitle(fbs: FbsRuntime) {
		return fbs._("成员名册（截图导入）", null, { hk: "4odyJR" });
	}
	static rosterHint(fbs: FbsRuntime) {
		return fbs._("上传游戏内成员名单截图，识别出的名字先进入预览，确认后才写入名册。名册只记录游戏内名字，不会改变任何人的 Discord 成员资格。", null, { hk: "1tY3Tc" });
	}
	static rosterUpload(fbs: FbsRuntime) {
		return fbs._("上传名单截图", null, { hk: "4fA2Sc" });
	}
	static rosterOcrRunning(fbs: FbsRuntime) {
		return fbs._("识别中…", null, { hk: "3pewht" });
	}
	static rosterPreviewTitle(fbs: FbsRuntime) {
		return fbs._("导入预览", null, { hk: "VXLD3" });
	}
	static rosterConfirm(fbs: FbsRuntime) {
		return fbs._("确认导入", null, { hk: "2nVVvB" });
	}
	static rosterEmpty(fbs: FbsRuntime) {
		return fbs._("尚无名册记录，用上方按钮上传名单截图导入。", null, { hk: "2cZATc" });
	}
	static rosterSourceOcr(fbs: FbsRuntime) {
		return fbs._("截图识别", null, { hk: "4zaKkq" });
	}
	static rosterMatchedMember(fbs: FbsRuntime) {
		return fbs._("已匹配 Discord 成员", null, { hk: "UdOw4" });
	}
	static rosterStatusMatched(fbs: FbsRuntime) {
		return fbs._("已匹配", null, { hk: "34fWrG" });
	}
	static rosterStatusNew(fbs: FbsRuntime) {
		return fbs._("疑似新名", null, { hk: "CoCsv" });
	}
	static rosterStatusUnrecognized(fbs: FbsRuntime) {
		return fbs._("无法识别", null, { hk: "2S9DbJ" });
	}
	static rosterImported(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已导入 {count} 条名册记录", [fbs._param("count", pv(p, "count"))], { hk: "4xXpcv" });
	}
	static statsTitle(fbs: FbsRuntime) {
		return fbs._("出勤与活跃", null, { hk: "4idJiT" });
	}
	static statsCurrentWeek(fbs: FbsRuntime) {
		return fbs._("本周", null, { hk: "4np6l1" });
	}
	static statsCars(fbs: FbsRuntime) {
		return fbs._("开车", null, { hk: "2zyIkm" });
	}
	static statsCompleted(fbs: FbsRuntime) {
		return fbs._("完成", null, { hk: "3MgE3M" });
	}
	static statsSeats(fbs: FbsRuntime) {
		return fbs._("席位", null, { hk: "1FGaVr" });
	}
	static statsFillRate(fbs: FbsRuntime) {
		return fbs._("满员率", null, { hk: "2xV9Kf" });
	}
	static statsParticipants(fbs: FbsRuntime) {
		return fbs._("参与人数", null, { hk: "qwhmF" });
	}
	static statsPerCapita(fbs: FbsRuntime) {
		return fbs._("人均参与", null, { hk: "2pPXsv" });
	}
	static statsMembersTitle(fbs: FbsRuntime) {
		return fbs._("成员参与榜 · 近 4 周", null, { hk: "2ZOPoL" });
	}
	static statsLeadersTitle(fbs: FbsRuntime) {
		return fbs._("车头榜 · 近 4 周", null, { hk: "10yBQi" });
	}
	static statsSeatCount(fbs: FbsRuntime) {
		return fbs._("落座次数", null, { hk: "1RpL2x" });
	}
	static statsCarCount(fbs: FbsRuntime) {
		return fbs._("开车数", null, { hk: "2sLw8Q" });
	}
	static statsEmpty(fbs: FbsRuntime) {
		return fbs._("近 4 周暂无组队数据。", null, { hk: "4g8K6d" });
	}
	static statsBoardEmpty(fbs: FbsRuntime) {
		return fbs._("暂无记录。", null, { hk: "2kDDc8" });
	}
	static whiteLabelTitle(fbs: FbsRuntime) {
		return fbs._("品牌与分享卡", null, { hk: "3tBF8B" });
	}
	static hideBrandingLabel(fbs: FbsRuntime) {
		return fbs._("隐藏平台品牌", null, { hk: "B3gJ7" });
	}
	static hideBrandingHint(fbs: FbsRuntime) {
		return fbs._("开启后，本百业的页面上不再显示平台名称与页脚声明，只呈现百业自己的信息。", null, { hk: "2CFQCo" });
	}
	static ogAccentLabel(fbs: FbsRuntime) {
		return fbs._("分享卡强调色", null, { hk: "43xymh" });
	}
	static ogTitleSuffixLabel(fbs: FbsRuntime) {
		return fbs._("分享卡标题后缀", null, { hk: "1TtHpA" });
	}
	static ogTitleSuffixHint(fbs: FbsRuntime) {
		return fbs._("会接在分享卡的标题后面，如「· 招募中」；最多 30 字，留空不显示。", null, { hk: "3QJFGn" });
	}
	static ogAccentGold(fbs: FbsRuntime) {
		return fbs._("鎏金", null, { hk: "4crX3k" });
	}
	static ogAccentJade(fbs: FbsRuntime) {
		return fbs._("翡翠", null, { hk: "4gz8QP" });
	}
	static ogAccentAzure(fbs: FbsRuntime) {
		return fbs._("藏青", null, { hk: "31zoiU" });
	}
	static ogAccentCinnabar(fbs: FbsRuntime) {
		return fbs._("朱砂", null, { hk: "hHKO6" });
	}
	static ogAccentViolet(fbs: FbsRuntime) {
		return fbs._("紫檀", null, { hk: "xcFB8" });
	}
	static premiumLockedTitle(fbs: FbsRuntime) {
		return fbs._("开通百业 Premium", null, { hk: "1zTlqd" });
	}
	static premiumLockedBody(fbs: FbsRuntime) {
		return fbs._("高级发车提醒、出勤统计、品牌与分享卡定制均为 Premium 功能。开通后立即生效，可随时取消。", null, { hk: "2QMm7e" });
	}
	static premiumCheckoutButton(fbs: FbsRuntime) {
		return fbs._("立即开通", null, { hk: "3btQcg" });
	}
	static premiumComingSoon(fbs: FbsRuntime) {
		return fbs._("即将开放", null, { hk: "4nnoW" });
	}
	static premiumActiveTitle(fbs: FbsRuntime) {
		return fbs._("百业 Premium", null, { hk: "esBvK" });
	}
	static premiumPlanName(fbs: FbsRuntime) {
		return fbs._("Premium", null, { hk: "2NSkmp" });
	}
	static premiumSourceStripe(fbs: FbsRuntime) {
		return fbs._("通过 Stripe 订阅", null, { hk: "2kIc06" });
	}
	static premiumSourceManual(fbs: FbsRuntime) {
		return fbs._("由平台授予", null, { hk: "47VlRz" });
	}
	static premiumPeriodEnd(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("当前周期至 {date}", [fbs._param("date", pv(p, "date"))], { hk: "YJWyt" });
	}
	static premiumPriceMonth(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{amount} / 月", [fbs._param("amount", pv(p, "amount"))], { hk: "1WGP5w" });
	}
	static premiumPriceYear(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{amount} / 年", [fbs._param("amount", pv(p, "amount"))], { hk: "13GQbX" });
	}
	static billingSuccess(fbs: FbsRuntime) {
		return fbs._("开通成功，Premium 已生效。", null, { hk: "30ayWl" });
	}
	static billingCanceled(fbs: FbsRuntime) {
		return fbs._("已取消开通，未产生扣费。", null, { hk: "3I6hit" });
	}
	static tabAnnouncements(fbs: FbsRuntime) {
		return fbs._("公告广播", null, { hk: "1mwQts" });
	}
	static tabTools(fbs: FbsRuntime) {
		return fbs._("活动工具", null, { hk: "4xZo00" });
	}
	static lotteryTitle(fbs: FbsRuntime) {
		return fbs._("活动抽奖", null, { hk: "4tJDFB" });
	}
	static lotteryHint(fbs: FbsRuntime) {
		return fbs._("参与名单可来自某辆车的参与者，或手选本百业成员；名单与权重在创建时定格。开奖按权重随机抽取，同一抽奖内不会重复中奖；抽奖、名单、权重与结果全部留痕可查。", null, { hk: "1VRaXI" });
	}
	static lotteryEmpty(fbs: FbsRuntime) {
		return fbs._("还没有抽奖，先创建一个。", null, { hk: "1mIUhs" });
	}
	static lotteryNameLabel(fbs: FbsRuntime) {
		return fbs._("抽奖标题", null, { hk: "1FtwJ" });
	}
	static lotteryPrizeLabel(fbs: FbsRuntime) {
		return fbs._("奖品 / 奖池", null, { hk: "1rPO0u" });
	}
	static lotterySourceLabel(fbs: FbsRuntime) {
		return fbs._("参与名单来源", null, { hk: "3yFZMg" });
	}
	static lotterySourceGrouping(fbs: FbsRuntime) {
		return fbs._("某辆车的参与者", null, { hk: "2F5EyL" });
	}
	static lotterySourceMembers(fbs: FbsRuntime) {
		return fbs._("手选百业成员", null, { hk: "3Ujpnt" });
	}
	static lotteryGroupingLabel(fbs: FbsRuntime) {
		return fbs._("选择车队", null, { hk: "x4B3O" });
	}
	static lotteryWinnerCountLabel(fbs: FbsRuntime) {
		return fbs._("中奖人数", null, { hk: "2CH5eF" });
	}
	static lotteryUniformWeightLabel(fbs: FbsRuntime) {
		return fbs._("统一权重", null, { hk: "2fcJFz" });
	}
	static lotteryWeightLabel(fbs: FbsRuntime) {
		return fbs._("权重", null, { hk: "1AvaaD" });
	}
	static lotteryEntriesLabel(fbs: FbsRuntime) {
		return fbs._("参与名单", null, { hk: "1hfF9X" });
	}
	static lotteryWinnersLabel(fbs: FbsRuntime) {
		return fbs._("中奖名单", null, { hk: "1divNO" });
	}
	static lotteryCreateButton(fbs: FbsRuntime) {
		return fbs._("创建抽奖", null, { hk: "117nty" });
	}
	static lotteryDrawButton(fbs: FbsRuntime) {
		return fbs._("开奖", null, { hk: "1MxeN3" });
	}
	static lotteryStatusOpen(fbs: FbsRuntime) {
		return fbs._("待开奖", null, { hk: "13jw7h" });
	}
	static lotteryStatusDrawn(fbs: FbsRuntime) {
		return fbs._("已开奖", null, { hk: "YcXPM" });
	}
	static lotteryEntryCount(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{count} 人参与", [fbs._param("count", pv(p, "count"))], { hk: "28nwar" });
	}
	static tabRecruit(fbs: FbsRuntime) {
		return fbs._("招新与导师", null, { hk: "3UZ4d3" });
	}
	static tabOfficer(fbs: FbsRuntime) {
		return fbs._("军官工具", null, { hk: "2bm6Co" });
	}
}
export abstract class GroupingTemplateFbtUtils {
	static sectionTitle(fbs: FbsRuntime) {
		return fbs._("车队模板", null, { hk: "35g98E" });
	}
	static nameLabel(fbs: FbsRuntime) {
		return fbs._("模板名", null, { hk: "2tuPfR" });
	}
	static namePlaceholder(fbs: FbsRuntime) {
		return fbs._("给模板起个名字", null, { hk: "1ekuCO" });
	}
	static saveFromForm(fbs: FbsRuntime) {
		return fbs._("存为模板", null, { hk: "34Ujtw" });
	}
	static updateSubmit(fbs: FbsRuntime) {
		return fbs._("保存模板修改", null, { hk: "4dbCfT" });
	}
	static editingNotice(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("正在编辑模板「{name}」", [fbs._param("name", pv(p, "name"))], { hk: "3VIw1K" });
	}
	static cancelEdit(fbs: FbsRuntime) {
		return fbs._("取消编辑", null, { hk: "x9ZpB" });
	}
	static empty(fbs: FbsRuntime) {
		return fbs._("还没有模板，把常用配置存下来，下次一键预填", null, { hk: "4dGBVt" });
	}
	static whenToday(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("今天 {time} 发车", [fbs._param("time", pv(p, "time"))], { hk: "2qIdnB" });
	}
	static whenTomorrow(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("明天 {time} 发车", [fbs._param("time", pv(p, "time"))], { hk: "1N3ckF" });
	}
	static whenDays(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{days} 天后 {time} 发车", [fbs._param("days", pv(p, "days")), fbs._param("time", pv(p, "time"))], { hk: "3Ddy0K" });
	}
	static toastSaved(fbs: FbsRuntime) {
		return fbs._("模板已保存", null, { hk: "1BVsie" });
	}
	static toastSaveFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("模板保存失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "10GAbm" });
	}
	static toastDeleted(fbs: FbsRuntime) {
		return fbs._("模板已删除", null, { hk: "1DAJEz" });
	}
	static toastDeleteFailed(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("模板删除失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "2Sd7qc" });
	}
	static edit(fbs: FbsRuntime) {
		return fbs._("编辑", null, { hk: "15FuoF" });
	}
	static delete(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "17uB9L" });
	}
	static deleteConfirmTitle(fbs: FbsRuntime) {
		return fbs._("删除模板", null, { hk: "4n7M52" });
	}
	static deleteConfirmMessage(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("确定删除模板「{name}」吗？", [fbs._param("name", pv(p, "name"))], { hk: "1p5NmL" });
	}
	static saveButton(fbs: FbsRuntime) {
		return fbs._("📋 存为模板", null, { hk: "2uyg98" });
	}
	static saveDialogTitle(fbs: FbsRuntime) {
		return fbs._("存为车队模板", null, { hk: "3sxchw" });
	}
	static saveSubmit(fbs: FbsRuntime) {
		return fbs._("保存模板", null, { hk: "1RhWGo" });
	}
	static toastSavedFromCar(fbs: FbsRuntime) {
		return fbs._("已存为模板，可在发新车时一键预填", null, { hk: "C7G72" });
	}
	static metaTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{type}{dungeon} · {max} 人", [
			fbs._param("type", pv(p, "type")),
			fbs._param("dungeon", pv(p, "dungeon")),
			fbs._param("max", pv(p, "max"))
		], { hk: "28bnDJ" });
	}
}
export abstract class AccountFbtUtils {
	static sectionTitle(fbs: FbsRuntime) {
		return fbs._("我的数据", null, { hk: "OCui9" });
	}
	static exportLabel(fbs: FbsRuntime) {
		return fbs._("导出我的数据", null, { hk: "3O9t2L" });
	}
	static exportHint(fbs: FbsRuntime) {
		return fbs._("把你账号的全部数据下载为一个 JSON 文件：账号资料、百业名册、你创建的车队、你的报名座位、装备库与方案。登录凭据与推送令牌出于安全不会包含在内。", null, { hk: "1NMi3z" });
	}
	static deleteLabel(fbs: FbsRuntime) {
		return fbs._("删除账号", null, { hk: "1E1eYG" });
	}
	static deleteHint(fbs: FbsRuntime) {
		return fbs._("删除不可恢复。提交后有 7 天冷静期，期间可随时撤销；到期后你的个人数据会被删除或匿名化。", null, { hk: "witTx" });
	}
	static reauthLabel(fbs: FbsRuntime) {
		return fbs._("通过 Discord 重新验证", null, { hk: "2FLJo7" });
	}
	static reauthHint(fbs: FbsRuntime) {
		return fbs._("导出与删除属于敏感操作，继续前需要一次新鲜的 Discord 授权验证。", null, { hk: "1veUxg" });
	}
	static confirmTitle(fbs: FbsRuntime) {
		return fbs._("确认删除账号", null, { hk: "1IhRo9" });
	}
	static confirmIntro(fbs: FbsRuntime) {
		return fbs._("请仔细阅读删除后果。提交后进入 7 天冷静期，到期自动执行：", null, { hk: "19FbVN" });
	}
	static consequenceCars(fbs: FbsRuntime) {
		return fbs._("你创建的车队不会被删除：车头会解绑为无主车队，创建者显示名替换为「已注销用户」；你在他人车队里的座位会被原地匿名化。", null, { hk: "3R3D8w" });
	}
	static consequenceData(fbs: FbsRuntime) {
		return fbs._("你的装备库与方案、推送令牌、昵称快照、百业名册行会被彻底删除；执行后你在所有设备上的登录会立即失效。", null, { hk: "3C3jLk" });
	}
	static consequenceGuilds(fbs: FbsRuntime) {
		return fbs._("百业本身与百业管理密码不受影响：百业不属于任何个人账号，不会因你删除账号而解散或变更。", null, { hk: "QwtV4" });
	}
	static consequenceResidual(fbs: FbsRuntime) {
		return fbs._("少数记录无法按个人清除：已经发到 Discord 的消息、成绩榜里的自由文本名单会保留；备份中的副本最迟在 14 天内随每日备份轮换清除。", null, { hk: "4ym2I3" });
	}
	static consequenceReregister(fbs: FbsRuntime) {
		return fbs._("删除不是封禁：之后用同一个 Discord 账号重新登录，就会注册成一个全新的账号。", null, { hk: "4tutR4" });
	}
	static exportFirstHint(fbs: FbsRuntime) {
		return fbs._("建议先导出一份你的数据，再提交删除。", null, { hk: "4n50u1" });
	}
	static usernameLabel(fbs: FbsRuntime) {
		return fbs._("输入你的 Discord 显示名以确认", null, { hk: "47r3xJ" });
	}
	static submitLabel(fbs: FbsRuntime) {
		return fbs._("提交删除申请", null, { hk: "1sQhip" });
	}
	static backLabel(fbs: FbsRuntime) {
		return fbs._("返回", null, { hk: "4qWno6" });
	}
	static pendingTitle(fbs: FbsRuntime) {
		return fbs._("账号删除已排期", null, { hk: "3p15DP" });
	}
	static pendingBody(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("你的账号将于 {date} 执行删除。到期前你可以随时撤销；用新设备重新登录也会自动撤销（到期后除外）。", [fbs._param("date", pv(p, "date"))], { hk: "4r5pfd" });
	}
	static cancelDeletionLabel(fbs: FbsRuntime) {
		return fbs._("撤销删除", null, { hk: "3pylJe" });
	}
	static deletionRequestedText(fbs: FbsRuntime) {
		return fbs._("删除申请已提交，7 天冷静期开始。", null, { hk: "d0xuE" });
	}
	static deletionCancelledText(fbs: FbsRuntime) {
		return fbs._("删除申请已撤销，你的账号不会被删除。", null, { hk: "2aktzH" });
	}
	static exportAbout(fbs: FbsRuntime) {
		return fbs._("这是你账号数据的导出副本。account 是账号资料（oauth 只记录授权范围与最近刷新时间，凭据本身不导出）；guilds 是你在各百业的名册行；serverNicks 是你在各 Discord 服务器的昵称快照；carsLed 是你创建的车队；seats 是你的报名座位；gearItems 是装备库；gearBuilds 是已保存方案；heirloom 是传家宝推送的去重状态。推送令牌属于设备凭据，只记录数量与平台，令牌本身不导出。", null, { hk: "2jkr2d" });
	}
	static deletedUser(fbs: FbsRuntime) {
		return fbs._("已注销用户", null, { hk: "VSvGc" });
	}
}
export abstract class BuildshareFbtUtils {
	static kicker(fbs: FbsRuntime) {
		return fbs._("装备方案 · 公开分享", null, { hk: "2mR3Q6" });
	}
	static loginLabel(fbs: FbsRuntime) {
		return fbs._("打开燕云百业", null, { hk: "1VNDBE" });
	}
	static notFoundTitle(fbs: FbsRuntime) {
		return fbs._("链接已失效", null, { hk: "2d2xok" });
	}
	static notFoundBody(fbs: FbsRuntime) {
		return fbs._("这条分享链接不存在，或已被方案主人取消分享。", null, { hk: "4yzes1" });
	}
	static xinfaLabel(fbs: FbsRuntime) {
		return fbs._("心法", null, { hk: "2FvBYf" });
	}
}
export abstract class LandingFbtUtils {
	static featuresTitle(fbs: FbsRuntime) {
		return fbs._("为百业同道而备", null, { hk: "30fiRp" });
	}
	static groupingTitle(fbs: FbsRuntime) {
		return fbs._("组队报名", null, { hk: "3GcCE6" });
	}
	static groupingBody(fbs: FbsRuntime) {
		return fbs._("双十、天赋、竞速、爬塔四类车队一键成行，席位名册一目了然，短链分享直达车队页。", null, { hk: "TYPkk" });
	}
	static reminderTitle(fbs: FbsRuntime) {
		return fbs._("发车提醒", null, { hk: "1I57Xc" });
	}
	static reminderBody(fbs: FbsRuntime) {
		return fbs._("发车前自动提醒到 Discord 频道与手机 App，就位确认先行，只催还没到场的人。", null, { hk: "4yOrhR" });
	}
	static dexTitle(fbs: FbsRuntime) {
		return fbs._("图鉴与攻略", null, { hk: "2yRnb3" });
	}
	static dexBody(fbs: FbsRuntime) {
		return fbs._("副本、首领图鉴与机制攻略，十一流派毕业词缀与配装参考，随国际服版本更新。", null, { hk: "2sWNHM" });
	}
	static gearTitle(fbs: FbsRuntime) {
		return fbs._("装备规划", null, { hk: "1GYbKD" });
	}
	static gearBody(fbs: FbsRuntime) {
		return fbs._("个人装备库与搭配筹谋：粘贴、截图识别或手动录入，承音调律与毕业度测算，离毕业还差多少一眼看清。", null, { hk: "MUw86" });
	}
}
export abstract class FeedbackFbtUtils {
	static entryLabel(fbs: FbsRuntime) {
		return fbs._("意见反馈", null, { hk: "2EHi6W" });
	}
	static title(fbs: FbsRuntime) {
		return fbs._("意见反馈", null, { hk: "3jiyS5" });
	}
	static categoryLabel(fbs: FbsRuntime) {
		return fbs._("类别", null, { hk: "29BWdW" });
	}
	static catProblem(fbs: FbsRuntime) {
		return fbs._("问题", null, { hk: "41yRJv" });
	}
	static catSuggestion(fbs: FbsRuntime) {
		return fbs._("建议", null, { hk: "R3Ote" });
	}
	static catOther(fbs: FbsRuntime) {
		return fbs._("其他", null, { hk: "2Sijpr" });
	}
	static placeholder(fbs: FbsRuntime) {
		return fbs._("请描述遇到的问题，或写下你的建议…", null, { hk: "3hlL0j" });
	}
	static submit(fbs: FbsRuntime) {
		return fbs._("提交反馈", null, { hk: "3hPuq7" });
	}
	static submitting(fbs: FbsRuntime) {
		return fbs._("提交中…", null, { hk: "4zlo50" });
	}
	static success(fbs: FbsRuntime) {
		return fbs._("已收到，感谢你的反馈。", null, { hk: "R7XC9" });
	}
}
export abstract class AnnouncementsFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("百业公告", null, { hk: "MGb24" });
	}
	static emptyText(fbs: FbsRuntime) {
		return fbs._("暂无公告", null, { hk: "3M3Yf8" });
	}
	static urgentLabel(fbs: FbsRuntime) {
		return fbs._("紧急集合", null, { hk: "3VNREO" });
	}
	static standardLabel(fbs: FbsRuntime) {
		return fbs._("公告", null, { hk: "2ukk4" });
	}
	static unreadLabel(fbs: FbsRuntime) {
		return fbs._("未读", null, { hk: "1ZLfIs" });
	}
	static readLabel(fbs: FbsRuntime) {
		return fbs._("已读", null, { hk: "HoPYb" });
	}
	static composeTitle(fbs: FbsRuntime) {
		return fbs._("发布公告", null, { hk: "wlwhx" });
	}
	static kindLabel(fbs: FbsRuntime) {
		return fbs._("类型", null, { hk: "1sGP4D" });
	}
	static kindStandardLabel(fbs: FbsRuntime) {
		return fbs._("普通公告", null, { hk: "3dgvPU" });
	}
	static kindUrgentLabel(fbs: FbsRuntime) {
		return fbs._("紧急集合呼叫", null, { hk: "1xO5fU" });
	}
	static titleLabel(fbs: FbsRuntime) {
		return fbs._("标题", null, { hk: "1SYkdB" });
	}
	static titlePlaceholder(fbs: FbsRuntime) {
		return fbs._("公告标题", null, { hk: "4EHXbv" });
	}
	static bodyLabel(fbs: FbsRuntime) {
		return fbs._("正文", null, { hk: "2fGGLN" });
	}
	static bodyPlaceholder(fbs: FbsRuntime) {
		return fbs._("公告正文", null, { hk: "3BtnFr" });
	}
	static postLabel(fbs: FbsRuntime) {
		return fbs._("发布并推送", null, { hk: "157qYg" });
	}
	static postingLabel(fbs: FbsRuntime) {
		return fbs._("发布中…", null, { hk: "1xsGJe" });
	}
	static postedText(fbs: FbsRuntime) {
		return fbs._("公告已发布", null, { hk: "2coh5Z" });
	}
	static deleteLabel(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "1kSM6C" });
	}
	static deleteConfirmTitle(fbs: FbsRuntime) {
		return fbs._("删除这条公告？", null, { hk: "4ysWFd" });
	}
	static deleteConfirmMessage(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("确定要删除公告「{title}」吗？已读记录会一并删除。", [fbs._param("title", pv(p, "title"))], { hk: "2KIeBM" });
	}
	static deletedText(fbs: FbsRuntime) {
		return fbs._("公告已删除", null, { hk: "2EEtMN" });
	}
	static receiptsTitle(fbs: FbsRuntime) {
		return fbs._("阅读情况", null, { hk: "1ZFpZL" });
	}
	static readCountTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已读 {read} / {total}", [fbs._param("read", pv(p, "read")), fbs._param("total", pv(p, "total"))], { hk: "lnaew" });
	}
	static readListLabel(fbs: FbsRuntime) {
		return fbs._("已读成员", null, { hk: "2qaUIa" });
	}
	static unreadListLabel(fbs: FbsRuntime) {
		return fbs._("未读成员", null, { hk: "2Kpwzn" });
	}
	static authorTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{name} 发布", [fbs._param("name", pv(p, "name"))], { hk: "2KA9Ho" });
	}
	static pushNote(fbs: FbsRuntime) {
		return fbs._("发布后会向全体成员推送通知；没有开启推送的成员也能在这里看到。", null, { hk: "1f9zk3" });
	}
	static urgentNote(fbs: FbsRuntime) {
		return fbs._("紧急集合呼叫请只用于临时集合等紧急情况，每天最多 2 次。", null, { hk: "3hzPCL" });
	}
	static dailyLimitTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("今日还可发布 {remaining} 条", [fbs._param("remaining", pv(p, "remaining"))], { hk: "cJfJv" });
	}
}
export abstract class ScheduleFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("排期", null, { hk: "1kg7Hz" });
	}
	static myTitle(fbs: FbsRuntime) {
		return fbs._("我的可用时间", null, { hk: "37Skxo" });
	}
	static myHint(fbs: FbsRuntime) {
		return fbs._("填写你每周固定有空的时段，按你所在时区显示；管理员与车头据此定档期。", null, { hk: "11ksia" });
	}
	static slotRange(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{start}–{end}", [fbs._param("start", pv(p, "start")), fbs._param("end", pv(p, "end"))], { hk: "3uCLiw" });
	}
	static addSlotLabel(fbs: FbsRuntime) {
		return fbs._("添加时段", null, { hk: "49aLiX" });
	}
	static removeLabel(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "kzr6q" });
	}
	static saveLabel(fbs: FbsRuntime) {
		return fbs._("保存", null, { hk: "1da7CH" });
	}
	static savedText(fbs: FbsRuntime) {
		return fbs._("可用时间已保存", null, { hk: "2e2sB6" });
	}
	static saveFailedTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("保存失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "3oB9P5" });
	}
	static emptyMineText(fbs: FbsRuntime) {
		return fbs._("你还没有填写可用时间。", null, { hk: "oz2zF" });
	}
	static summaryTitle(fbs: FbsRuntime) {
		return fbs._("成员可用性汇总", null, { hk: "4rLG6c" });
	}
	static summaryHint(fbs: FbsRuntime) {
		return fbs._("汇总仅百业管理员与发过车的车头可见，用于定档期。", null, { hk: "qVAlc" });
	}
	static summaryEmptyText(fbs: FbsRuntime) {
		return fbs._("还没有成员填写可用时间。", null, { hk: "3hxXXz" });
	}
	static pollsTitle(fbs: FbsRuntime) {
		return fbs._("活动时间投票", null, { hk: "3y6XMv" });
	}
	static pollsHint(fbs: FbsRuntime) {
		return fbs._("给出几个候选时间，成员勾选所有能参加的时间；可参加人数最多的时段最适合定档。", null, { hk: "TPTvZ" });
	}
	static pollEmptyText(fbs: FbsRuntime) {
		return fbs._("还没有时间投票。", null, { hk: "4atD2M" });
	}
	static pollCreateLabel(fbs: FbsRuntime) {
		return fbs._("发起投票", null, { hk: "1EMF3" });
	}
	static pollTitleLabel(fbs: FbsRuntime) {
		return fbs._("投票标题", null, { hk: "2TJHm3" });
	}
	static pollTitlePlaceholder(fbs: FbsRuntime) {
		return fbs._("如：本周开荒时间", null, { hk: "4tBVc1" });
	}
	static pollCandidatesLabel(fbs: FbsRuntime) {
		return fbs._("候选时间", null, { hk: "2bb1k7" });
	}
	static pollAddCandidateLabel(fbs: FbsRuntime) {
		return fbs._("添加候选", null, { hk: "4tjT2I" });
	}
	static pollSubmitLabel(fbs: FbsRuntime) {
		return fbs._("发布投票", null, { hk: "PwjQA" });
	}
	static pollVoteLabel(fbs: FbsRuntime) {
		return fbs._("提交投票", null, { hk: "1QVvp8" });
	}
	static pollVotedText(fbs: FbsRuntime) {
		return fbs._("已投票，可修改后重新提交。", null, { hk: "4h7A52" });
	}
	static pollStatusOpenText(fbs: FbsRuntime) {
		return fbs._("进行中", null, { hk: "2spNSZ" });
	}
	static pollStatusClosedText(fbs: FbsRuntime) {
		return fbs._("已关闭", null, { hk: "3jbo32" });
	}
	static pollCloseLabel(fbs: FbsRuntime) {
		return fbs._("关闭投票", null, { hk: "SyIKu" });
	}
	static pollVoteCountTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{count} 人可参加", [fbs._param("count", pv(p, "count"))], { hk: "3YclRu" });
	}
	static pollLaunchLabel(fbs: FbsRuntime) {
		return fbs._("以此时间发车", null, { hk: "2uEZ9B" });
	}
	static pollCancelLabel(fbs: FbsRuntime) {
		return fbs._("取消", null, { hk: "2a0yi5" });
	}
	static toastPollCreated(fbs: FbsRuntime) {
		return fbs._("投票已发布", null, { hk: "4rKnD1" });
	}
	static toastVoted(fbs: FbsRuntime) {
		return fbs._("已提交", null, { hk: "10p0Jr" });
	}
	static toastClosed(fbs: FbsRuntime) {
		return fbs._("投票已关闭", null, { hk: "3aX8KY" });
	}
	static toastFailedTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("操作失败：{error}", [fbs._param("error", pv(p, "error"))], { hk: "1yF32T" });
	}
	static settingsLinkLabel(fbs: FbsRuntime) {
		return fbs._("在个人设置中填写", null, { hk: "2v8aPQ" });
	}
	static noGuildsText(fbs: FbsRuntime) {
		return fbs._("你还没有加入任何百业，加入后可在此填写可用时间。", null, { hk: "2L9e4n" });
	}
}
export abstract class RecruitFbtUtils {
	static title(fbs: FbsRuntime) {
		return fbs._("招新与新人", null, { hk: "2Kv5c8" });
	}
	static homeBody(fbs: FbsRuntime) {
		return fbs._("想加入一个百业？在下面挑一个开放招新的百业提交入业申请，百业管理员会在管理面审核。已经在业的新人可以在这里看自己的入业清单与导师配对。", null, { hk: "3aGDP8" });
	}
	static homeLoginHint(fbs: FbsRuntime) {
		return fbs._("登录后即可对心仪的百业提交入业申请，并在这里查看审核进度。", null, { hk: "wi0kU" });
	}
	static applySectionTitle(fbs: FbsRuntime) {
		return fbs._("入业申请", null, { hk: "1wGTaS" });
	}
	static messageLabel(fbs: FbsRuntime) {
		return fbs._("申请附言", null, { hk: "39x2FC" });
	}
	static messagePlaceholder(fbs: FbsRuntime) {
		return fbs._("一句自我介绍（可选）：常玩的流派、在线时间……", null, { hk: "1VplXa" });
	}
	static submitButton(fbs: FbsRuntime) {
		return fbs._("提交申请", null, { hk: "34YRGv" });
	}
	static submittingButton(fbs: FbsRuntime) {
		return fbs._("提交中…", null, { hk: "4aBpl4" });
	}
	static myApplicationTitle(fbs: FbsRuntime) {
		return fbs._("我的申请", null, { hk: "2yCLBb" });
	}
	static statusPending(fbs: FbsRuntime) {
		return fbs._("待审核", null, { hk: "37MjXN" });
	}
	static statusApproved(fbs: FbsRuntime) {
		return fbs._("已通过", null, { hk: "1WgveJ" });
	}
	static statusRejected(fbs: FbsRuntime) {
		return fbs._("未通过", null, { hk: "3oqA2g" });
	}
	static pendingHint(fbs: FbsRuntime) {
		return fbs._("管理员审核中，请耐心等待；审核结果会直接更新在这里。", null, { hk: "6u8tD" });
	}
	static approvedNextStep(fbs: FbsRuntime) {
		return fbs._("申请已通过，你已登记进百业名册。最后一步在 Discord 完成：加入本百业绑定的 Discord 服务器——成员资格由 Discord 服务器成员身份决定，平台没有 Discord 机器人权限，无法替你加入服务器或授予身份组；加入后用同一账号登录即可使用百业全部功能。", null, { hk: "2yVdgv" });
	}
	static rejectedHint(fbs: FbsRuntime) {
		return fbs._("本次申请未通过。可以修改附言后重新提交一份新申请。", null, { hk: "3EZtok" });
	}
	static checklistTitle(fbs: FbsRuntime) {
		return fbs._("新手入业清单", null, { hk: "SdChL" });
	}
	static checklistProgress(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("已完成 {done} / {total}", [fbs._param("done", pv(p, "done")), fbs._param("total", pv(p, "total"))], { hk: "43OtnH" });
	}
	static itemProfileLabel(fbs: FbsRuntime) {
		return fbs._("完善流派 / 时区", null, { hk: "2BseCa" });
	}
	static itemProfileHint(fbs: FbsRuntime) {
		return fbs._("在任意车队报名落座时填上你的流派即算完成；时区由你的客户端自动同步，无需手动填写。", null, { hk: "25XMMS" });
	}
	static itemMentorLabel(fbs: FbsRuntime) {
		return fbs._("认一位导师", null, { hk: "4m0bsF" });
	}
	static itemMentorHint(fbs: FbsRuntime) {
		return fbs._("由百业管理员为你配对一位导师后自动完成。", null, { hk: "2XT8L7" });
	}
	static itemFirstRunLabel(fbs: FbsRuntime) {
		return fbs._("打完第一场", null, { hk: "1C3tvD" });
	}
	static itemFirstRunHint(fbs: FbsRuntime) {
		return fbs._("在一辆已完成的车队里落座后自动完成。", null, { hk: "2SJLl3" });
	}
	static myPairingsTitle(fbs: FbsRuntime) {
		return fbs._("我的导师配对", null, { hk: "33EX47" });
	}
	static itemAvailabilityLabel(fbs: FbsRuntime) {
		return fbs._("填写可用时间", null, { hk: "1ccGNR" });
	}
	static itemAvailabilityHint(fbs: FbsRuntime) {
		return fbs._("在个人设置里填写你每周固定有空的时段，方便管理员与车头定档期；可以先跳过，之后随时补填。", null, { hk: "4y5PHe" });
	}
	static pairingStatusActive(fbs: FbsRuntime) {
		return fbs._("进行中", null, { hk: "24mBsd" });
	}
	static pairingStatusEnded(fbs: FbsRuntime) {
		return fbs._("已结束", null, { hk: "eBun0" });
	}
	static mentorRoleLabel(fbs: FbsRuntime) {
		return fbs._("导师", null, { hk: "22AZ4f" });
	}
	static menteeRoleLabel(fbs: FbsRuntime) {
		return fbs._("新人", null, { hk: "3kLesg" });
	}
	static adminApplicationsTitle(fbs: FbsRuntime) {
		return fbs._("入业申请审核", null, { hk: "3gB0cy" });
	}
	static adminApplicationsEmpty(fbs: FbsRuntime) {
		return fbs._("暂无申请记录。", null, { hk: "cXV3X" });
	}
	static adminApproveButton(fbs: FbsRuntime) {
		return fbs._("通过", null, { hk: "4efpOC" });
	}
	static adminRejectButton(fbs: FbsRuntime) {
		return fbs._("拒绝", null, { hk: "bqOYJ" });
	}
	static adminMentorPoolTitle(fbs: FbsRuntime) {
		return fbs._("导师人选", null, { hk: "22uvrk" });
	}
	static adminSetMentorButton(fbs: FbsRuntime) {
		return fbs._("设为导师", null, { hk: "3jzxHY" });
	}
	static adminUnsetMentorButton(fbs: FbsRuntime) {
		return fbs._("取消导师", null, { hk: "4i8mD4" });
	}
	static adminPairingsTitle(fbs: FbsRuntime) {
		return fbs._("导师配对", null, { hk: "39ltUF" });
	}
	static adminPairingsEmpty(fbs: FbsRuntime) {
		return fbs._("暂无配对记录。", null, { hk: "3Rkx0G" });
	}
	static adminPairingCreateButton(fbs: FbsRuntime) {
		return fbs._("建立配对", null, { hk: "1BZnGt" });
	}
	static adminPairingEndButton(fbs: FbsRuntime) {
		return fbs._("结束配对", null, { hk: "3xXyJj" });
	}
	static adminMentorSelectLabel(fbs: FbsRuntime) {
		return fbs._("选择导师", null, { hk: "33oCpc" });
	}
	static adminMenteeSelectLabel(fbs: FbsRuntime) {
		return fbs._("选择新人", null, { hk: "2xbYJV" });
	}
	static adminNewcomersTitle(fbs: FbsRuntime) {
		return fbs._("新人清单进度", null, { hk: "20h3yo" });
	}
	static adminNewcomersEmpty(fbs: FbsRuntime) {
		return fbs._("暂无未完成清单的新人。", null, { hk: "aqRS1" });
	}
}
export abstract class OfficerFbtUtils {
	static notesTitle(fbs: FbsRuntime) {
		return fbs._("成员备注", null, { hk: "2AROGK" });
	}
	static notesHint(fbs: FbsRuntime) {
		return fbs._("备注仅百业管理员可见，成员本人看不到关于自己的备注。", null, { hk: "3R2nV5" });
	}
	static notesEmpty(fbs: FbsRuntime) {
		return fbs._("本百业暂无成员名册。", null, { hk: "4t3SZG" });
	}
	static memberNoNotes(fbs: FbsRuntime) {
		return fbs._("暂无备注", null, { hk: "2rQTg8" });
	}
	static notePlaceholder(fbs: FbsRuntime) {
		return fbs._("写一条备注…", null, { hk: "1p5gjW" });
	}
	static noteAddButton(fbs: FbsRuntime) {
		return fbs._("添加备注", null, { hk: "4D1YhV" });
	}
	static noteEditButton(fbs: FbsRuntime) {
		return fbs._("编辑", null, { hk: "3EnOv0" });
	}
	static noteSaveButton(fbs: FbsRuntime) {
		return fbs._("保存", null, { hk: "rxrIq" });
	}
	static noteDeleteButton(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "1PU9oZ" });
	}
	static noteAuthorTemplate(fbs: FbsRuntime, p?: StringParams) {
		return fbs._("{name} 添加", [fbs._param("name", pv(p, "name"))], { hk: "3kP8Jz" });
	}
	static exportTitle(fbs: FbsRuntime) {
		return fbs._("百业数据包", null, { hk: "4qW6cR" });
	}
	static exportHint(fbs: FbsRuntime) {
		return fbs._("导出本百业的名册、组队历史与参与记录、成员赛季目标（JSON 文件）。导出动作会留痕记录。", null, { hk: "2T41m9" });
	}
	static exportButton(fbs: FbsRuntime) {
		return fbs._("导出数据包", null, { hk: "28tcf" });
	}
	static exportAbout(fbs: FbsRuntime) {
		return fbs._("百业数据包导出：包含本百业名册、组队历史与参与记录、成员赛季目标。军官备注为内部工作记录，不包含在本数据包内。", null, { hk: "9GX1a" });
	}
	static goalsTitle(fbs: FbsRuntime) {
		return fbs._("成员赛季目标", null, { hk: "1BxvGF" });
	}
	static goalsHint(fbs: FbsRuntime) {
		return fbs._("成员给自己设的赛季目标与进度，只读总览。", null, { hk: "3uKLY1" });
	}
	static goalsEmpty(fbs: FbsRuntime) {
		return fbs._("暂无成员设置赛季目标。", null, { hk: "50Gat" });
	}
	static statusActive(fbs: FbsRuntime) {
		return fbs._("进行中", null, { hk: "3UrRel" });
	}
	static statusDone(fbs: FbsRuntime) {
		return fbs._("已完成", null, { hk: "1awIDe" });
	}
	static statusDropped(fbs: FbsRuntime) {
		return fbs._("已放弃", null, { hk: "4dKtph" });
	}
	static myEntryLabel(fbs: FbsRuntime) {
		return fbs._("赛季目标", null, { hk: "1kLnPO" });
	}
	static myTitle(fbs: FbsRuntime) {
		return fbs._("我的赛季目标", null, { hk: "3lOtvC" });
	}
	static myHint(fbs: FbsRuntime) {
		return fbs._("在某个百业里给自己定一个本赛季目标，进度由你自己维护；该百业的管理员可以查看总览。", null, { hk: "uirzj" });
	}
	static myEmpty(fbs: FbsRuntime) {
		return fbs._("你还没有设置赛季目标。", null, { hk: "1FD0fY" });
	}
	static goalGuildLabel(fbs: FbsRuntime) {
		return fbs._("所属百业", null, { hk: "1Mf5w5" });
	}
	static goalTitleLabel(fbs: FbsRuntime) {
		return fbs._("目标", null, { hk: "3ry3Jp" });
	}
	static goalTitlePlaceholder(fbs: FbsRuntime) {
		return fbs._("例如：打通某个副本、集齐一套装备…", null, { hk: "4spG3F" });
	}
	static goalNoteLabel(fbs: FbsRuntime) {
		return fbs._("进度备注", null, { hk: "2Y90cT" });
	}
	static goalNotePlaceholder(fbs: FbsRuntime) {
		return fbs._("记录当前进度…", null, { hk: "3WuGTh" });
	}
	static goalDungeonLabel(fbs: FbsRuntime) {
		return fbs._("关联副本（可选）", null, { hk: "4q5yP7" });
	}
	static goalDungeonNone(fbs: FbsRuntime) {
		return fbs._("不关联副本", null, { hk: "2OWi4w" });
	}
	static goalStatusLabel(fbs: FbsRuntime) {
		return fbs._("状态", null, { hk: "441NsN" });
	}
	static goalAddButton(fbs: FbsRuntime) {
		return fbs._("添加目标", null, { hk: "40sX57" });
	}
	static goalSaveButton(fbs: FbsRuntime) {
		return fbs._("保存", null, { hk: "3vvb4n" });
	}
	static goalEditButton(fbs: FbsRuntime) {
		return fbs._("编辑", null, { hk: "1yqvac" });
	}
	static goalDeleteButton(fbs: FbsRuntime) {
		return fbs._("删除", null, { hk: "2StBfp" });
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
	"picker_myGuilds": PickerFbtUtils.myGuilds,
	"picker_myGuildsEn": PickerFbtUtils.myGuildsEn,
	"picker_publicGuilds": PickerFbtUtils.publicGuilds,
	"picker_publicGuildsEn": PickerFbtUtils.publicGuildsEn,
	"picker_readOnlyBadge": PickerFbtUtils.readOnlyBadge,
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
	"locked_backLink": LockedFbtUtils.backLink,
	"locked_title": LockedFbtUtils.title,
	"locked_body1": LockedFbtUtils.body1,
	"locked_body2": LockedFbtUtils.body2,
	"locked_backButton": LockedFbtUtils.backButton,
	"guildHome_backToHub": GuildHomeFbtUtils.backToHub,
	"guildHome_backPlain": GuildHomeFbtUtils.backPlain,
	"guildHome_tabTeam": GuildHomeFbtUtils.tabTeam,
	"guildHome_tabDex": GuildHomeFbtUtils.tabDex,
	"guildHome_tabSect": GuildHomeFbtUtils.tabSect,
	"guildHome_tabAnnouncements": GuildHomeFbtUtils.tabAnnouncements,
	"guildHome_readOnlyBanner": GuildHomeFbtUtils.readOnlyBanner,
	"guildHome_adminLink": GuildHomeFbtUtils.adminLink,
	"guildHome_tabSchedule": GuildHomeFbtUtils.tabSchedule,
	"groupingType_tabActivity": GroupingTypeFbtUtils.tabActivity,
	"groupingType_tabTalent": GroupingTypeFbtUtils.tabTalent,
	"groupingType_tabRace": GroupingTypeFbtUtils.tabRace,
	"groupingType_tabTower": GroupingTypeFbtUtils.tabTower,
	"groupingType_shortActivity": GroupingTypeFbtUtils.shortActivity,
	"groupingType_shortTalent": GroupingTypeFbtUtils.shortTalent,
	"groupingType_shortRace": GroupingTypeFbtUtils.shortRace,
	"groupingType_shortTower": GroupingTypeFbtUtils.shortTower,
	"groupingType_shortGather": GroupingTypeFbtUtils.shortGather,
	"groupingType_shortExplore": GroupingTypeFbtUtils.shortExplore,
	"groupingList_prevWeek": GroupingListFbtUtils.prevWeek,
	"groupingList_nextWeek": GroupingListFbtUtils.nextWeek,
	"groupingList_weekHeader": GroupingListFbtUtils.weekHeader,
	"groupingList_emptyInteractive": GroupingListFbtUtils.emptyInteractive,
	"groupingList_emptyReadonly": GroupingListFbtUtils.emptyReadonly,
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
	"groupingDetail_edit": GroupingDetailFbtUtils.edit,
	"groupingDetail_disband": GroupingDetailFbtUtils.disband,
	"groupingDetail_disbanding": GroupingDetailFbtUtils.disbanding,
	"groupingDetail_statusOpen": GroupingDetailFbtUtils.statusOpen,
	"groupingDetail_people": GroupingDetailFbtUtils.people,
	"groupingDetail_readyProgress": GroupingDetailFbtUtils.readyProgress,
	"groupingDetail_openHint": GroupingDetailFbtUtils.openHint,
	"groupingDetail_readonlyHint": GroupingDetailFbtUtils.readonlyHint,
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
	"groupingForm_createTitle": GroupingFormFbtUtils.createTitle,
	"groupingForm_editTitle": GroupingFormFbtUtils.editTitle,
	"groupingForm_typeLabel": GroupingFormFbtUtils.typeLabel,
	"groupingForm_capacity": GroupingFormFbtUtils.capacity,
	"groupingForm_hintActivity": GroupingFormFbtUtils.hintActivity,
	"groupingForm_hintDungeon": GroupingFormFbtUtils.hintDungeon,
	"groupingForm_hintTalent": GroupingFormFbtUtils.hintTalent,
	"groupingForm_hintRace": GroupingFormFbtUtils.hintRace,
	"groupingForm_hintTower": GroupingFormFbtUtils.hintTower,
	"groupingForm_titleLabel": GroupingFormFbtUtils.titleLabel,
	"groupingForm_titlePlaceholder": GroupingFormFbtUtils.titlePlaceholder,
	"groupingForm_startsLabel": GroupingFormFbtUtils.startsLabel,
	"groupingForm_monthOption": GroupingFormFbtUtils.monthOption,
	"groupingForm_dayOption": GroupingFormFbtUtils.dayOption,
	"groupingForm_hourOption": GroupingFormFbtUtils.hourOption,
	"groupingForm_minuteOption": GroupingFormFbtUtils.minuteOption,
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
	"errors_titleRequired": ErrorsFbtUtils.titleRequired,
	"errors_badStartTime": ErrorsFbtUtils.badStartTime,
	"errors_startTimeTooFar": ErrorsFbtUtils.startTimeTooFar,
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
	"errors_groupingNotCompleted": ErrorsFbtUtils.groupingNotCompleted,
	"errors_groupingClosed": ErrorsFbtUtils.groupingClosed,
	"errors_nicknameRequired": ErrorsFbtUtils.nicknameRequired,
	"errors_proxyTargetNotInRoster": ErrorsFbtUtils.proxyTargetNotInRoster,
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
	"guildAdmin_premiumPriceYear": GuildAdminFbtUtils.premiumPriceYear,
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
	"officer_goalDeleteButton": OfficerFbtUtils.goalDeleteButton
};
