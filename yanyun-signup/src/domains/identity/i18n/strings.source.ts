/* fbtee declaration surface for the identity domain (hand-maintained): this
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
