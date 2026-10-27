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
export const site_seal = (fbs: FbsAPI) =>fbs("燕", "site.seal");
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
export const account_sectionTitle = (fbs: FbsAPI) =>fbs("我的数据", "account.sectionTitle");
export const account_exportLabel = (fbs: FbsAPI) =>fbs("导出我的数据", "account.exportLabel");
export const account_exportHint = (fbs: FbsAPI) =>fbs("把你账号的全部数据下载为一个 JSON 文件：账号资料、百业名册、你创建的车队、你的报名座位、装备库与方案。登录凭据与推送令牌出于安全不会包含在内。", "account.exportHint");
export const account_deleteLabel = (fbs: FbsAPI) =>fbs("删除账号", "account.deleteLabel");
export const account_deleteHint = (fbs: FbsAPI) =>fbs("删除不可恢复。提交后有 7 天冷静期，期间可随时撤销；到期后你的个人数据会被删除或匿名化。", "account.deleteHint");
export const account_reauthLabel = (fbs: FbsAPI) =>fbs("通过 Discord 重新验证", "account.reauthLabel");
export const account_reauthHint = (fbs: FbsAPI) =>fbs("导出与删除属于敏感操作，继续前需要一次新鲜的 Discord 授权验证。", "account.reauthHint");
export const account_confirmTitle = (fbs: FbsAPI) =>fbs("确认删除账号", "account.confirmTitle");
export const account_confirmIntro = (fbs: FbsAPI) =>fbs("请仔细阅读删除后果。提交后进入 7 天冷静期，到期自动执行：", "account.confirmIntro");
export const account_consequenceCars = (fbs: FbsAPI) =>fbs("你创建的车队不会被删除：车头会解绑为无主车队，创建者显示名替换为「已注销用户」；你在他人车队里的座位会被原地匿名化。", "account.consequenceCars");
export const account_consequenceData = (fbs: FbsAPI) =>fbs("你的装备库与方案、推送令牌、昵称快照、百业名册行会被彻底删除；执行后你在所有设备上的登录会立即失效。", "account.consequenceData");
export const account_consequenceGuilds = (fbs: FbsAPI) =>fbs("百业本身与百业管理密码不受影响：百业不属于任何个人账号，不会因你删除账号而解散或变更。", "account.consequenceGuilds");
export const account_consequenceResidual = (fbs: FbsAPI) =>fbs("少数记录无法按个人清除：已经发到 Discord 的消息、成绩榜里的自由文本名单会保留；备份中的副本最迟在 14 天内随每日备份轮换清除。", "account.consequenceResidual");
export const account_consequenceReregister = (fbs: FbsAPI) =>fbs("删除不是封禁：之后用同一个 Discord 账号重新登录，就会注册成一个全新的账号。", "account.consequenceReregister");
export const account_exportFirstHint = (fbs: FbsAPI) =>fbs("建议先导出一份你的数据，再提交删除。", "account.exportFirstHint");
export const account_usernameLabel = (fbs: FbsAPI) =>fbs("输入你的 Discord 显示名以确认", "account.usernameLabel");
export const account_submitLabel = (fbs: FbsAPI) =>fbs("提交删除申请", "account.submitLabel");
export const account_backLabel = (fbs: FbsAPI) =>fbs("返回", "account.backLabel");
export const account_pendingTitle = (fbs: FbsAPI) =>fbs("账号删除已排期", "account.pendingTitle");
export const account_pendingBody = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["你的账号将于 ", fbs.param("date", pv(p, "date")), " 执行删除。到期前你可以随时撤销；用新设备重新登录也会自动撤销（到期后除外）。"], "account.pendingBody");
export const account_cancelDeletionLabel = (fbs: FbsAPI) =>fbs("撤销删除", "account.cancelDeletionLabel");
export const account_deletionRequestedText = (fbs: FbsAPI) =>fbs("删除申请已提交，7 天冷静期开始。", "account.deletionRequestedText");
export const account_deletionCancelledText = (fbs: FbsAPI) =>fbs("删除申请已撤销，你的账号不会被删除。", "account.deletionCancelledText");
export const account_exportAbout = (fbs: FbsAPI) =>fbs("这是你账号数据的导出副本。account 是账号资料（oauth 只记录授权范围与最近刷新时间，凭据本身不导出）；guilds 是你在各百业的名册行；serverNicks 是你在各 Discord 服务器的昵称快照；carsLed 是你创建的车队；seats 是你的报名座位；gearItems 是装备库；gearBuilds 是已保存方案；heirloom 是传家宝推送的去重状态。推送令牌属于设备凭据，只记录数量与平台，令牌本身不导出。", "account.exportAbout");
export const account_deletedUser = (fbs: FbsAPI) =>fbs("已注销用户", "account.deletedUser");
export const landing_featuresTitle = (fbs: FbsAPI) =>fbs("为百业同道而备", "landing.featuresTitle");
export const landing_groupingTitle = (fbs: FbsAPI) =>fbs("组队报名", "landing.groupingTitle");
export const landing_groupingBody = (fbs: FbsAPI) =>fbs("双十、天赋、竞速、爬塔四类车队一键成行，席位名册一目了然，短链分享直达车队页。", "landing.groupingBody");
export const landing_reminderTitle = (fbs: FbsAPI) =>fbs("发车提醒", "landing.reminderTitle");
export const landing_reminderBody = (fbs: FbsAPI) =>fbs("发车前自动提醒到 Discord 频道与手机 App，就位确认先行，只催还没到场的人。", "landing.reminderBody");
export const landing_dexTitle = (fbs: FbsAPI) =>fbs("图鉴与攻略", "landing.dexTitle");
export const landing_dexBody = (fbs: FbsAPI) =>fbs("副本、首领图鉴与机制攻略，十一流派毕业词缀与配装参考，随国际服版本更新。", "landing.dexBody");
export const landing_gearTitle = (fbs: FbsAPI) =>fbs("装备规划", "landing.gearTitle");
export const landing_gearBody = (fbs: FbsAPI) =>fbs("个人装备库与搭配筹谋：粘贴、截图识别或手动录入，承音调律与毕业度测算，离毕业还差多少一眼看清。", "landing.gearBody");
export const feedback_entryLabel = (fbs: FbsAPI) =>fbs("意见反馈", "feedback.entryLabel");
export const feedback_title = (fbs: FbsAPI) =>fbs("意见反馈", "feedback.title");
export const feedback_categoryLabel = (fbs: FbsAPI) =>fbs("类别", "feedback.categoryLabel");
export const feedback_catProblem = (fbs: FbsAPI) =>fbs("问题", "feedback.catProblem");
export const feedback_catSuggestion = (fbs: FbsAPI) =>fbs("建议", "feedback.catSuggestion");
export const feedback_catOther = (fbs: FbsAPI) =>fbs("其他", "feedback.catOther");
export const feedback_placeholder = (fbs: FbsAPI) =>fbs("请描述遇到的问题，或写下你的建议…", "feedback.placeholder");
export const feedback_submit = (fbs: FbsAPI) =>fbs("提交反馈", "feedback.submit");
export const feedback_submitting = (fbs: FbsAPI) =>fbs("提交中…", "feedback.submitting");
export const feedback_success = (fbs: FbsAPI) =>fbs("已收到，感谢你的反馈。", "feedback.success");
