/* fbtee declaration surface for the identity domain (hand-maintained): this
 * domain's UI-copy declarations, one section (area) = one
 * XxxFbtUtils abstract class, one string = one static method on it,
 * one method = one fbs call. A string's identity is the declaration
 * itself (domain + export name <section>_<method>); the desc
 * is a natural-language note FOR TRANSLATORS -- what the string is,
 * where it appears, what its parameters mean -- never a key. Source
 * locale zh-CN; translations live in platform/i18n/translations/*.json
 * and hang off the id codegen stamps into each of their entries.
 * scripts/i18n-codegen.mjs collects the per-domain declaration files
 * into the compiled strings.ts / catalogs / CATALOG projection; after
 * editing copy, rerun it (--check runs in CI). Shared copy (common,
 * errors, legal, ...) is declared by the platform domain and reached
 * through its text util, never duplicated here. The StringParams/pv
 * prelude is repeated per file so each file typechecks standalone;
 * codegen extracts the class blocks only.
 */
import type { FbsAPI } from 'fbtee/server';

export type StringParams = Record<string, unknown>;

function pv(p: StringParams | undefined, name: string): string {
  const v = p ? p[name] : undefined;
  return v === undefined ? '{' + name + '}' : String(v);
}

export abstract class SiteFbtUtils {
  static title(fbs: FbsAPI) { return fbs("百业集结", "The site name shown in the page header and browser title across the whole app."); }
  static subtitle(fbs: FbsAPI) { return fbs("燕云十六声 · 国际服百业车队与攻略集散地 —— 择一业而入，共赴双十。", "The tagline under the site name on the landing page, describing the site as a guild squad and strategy hub for the global server of Where Winds Meet."); }
  static heroAlt(fbs: FbsAPI) { return fbs("水墨山水", "Alt text for the ink-wash mountain hero illustration on the landing page."); }
  static seal(fbs: FbsAPI) { return fbs("燕", "The single-character seal stamp graphic used as the site logo mark."); }
}

export abstract class LoginFbtUtils {
  static cardTitle(fbs: FbsAPI) { return fbs("先登录，再入江湖", "Heading on the login card shown to signed-out visitors."); }
  static cardBody1(fbs: FbsAPI) { return fbs("本站需用 Discord 账号认证后使用。", "First line on the login card, stating the site requires Discord account authentication."); }
  static cardBody2(fbs: FbsAPI) { return fbs("登录后将按你所在的 Discord 服务器，展示你有权限访问的百业。", "Second line on the login card, explaining that after login the visible guilds are determined by the Discord servers the user belongs to."); }
  static button(fbs: FbsAPI) { return fbs("用 Discord 登录", "Label of the button that starts the Discord OAuth login flow."); }
  static privacy(fbs: FbsAPI) { return fbs("我们会读取并保存你的 Discord 昵称、头像、服务器列表与登录授权，用于成员校验与提醒功能，详见隐私政策", "Privacy notice under the login button, summarizing which Discord data is read and stored and pointing to the privacy policy."); }
}

export abstract class UserBarFbtUtils {
  static logout(fbs: FbsAPI) { return fbs("退出登录", "Sign-out button label in the top user bar."); }
  static loggingOut(fbs: FbsAPI) { return fbs("退出中…", "Sign-out button label while the sign-out request is in progress."); }
  static settings(fbs: FbsAPI) { return fbs("个人资料", "Button label in the top user bar that opens the personal profile settings dialog."); }
}

export abstract class SettingsFbtUtils {
  static title(fbs: FbsAPI) { return fbs("个人资料", "Title of the personal profile settings dialog."); }
  static discordLabel(fbs: FbsAPI) { return fbs("Discord 账号", "Label of the read-only row in profile settings showing the signed-in Discord account."); }
  static languageLabel(fbs: FbsAPI) { return fbs("语言", "Label of the interface language selector in profile settings."); }
  static languageHint(fbs: FbsAPI) { return fbs("界面语言。选择「自动」时跟随浏览器语言；手动选择后保存在你的账号里，压过浏览器语言。", "Hint under the language selector in profile settings: automatic follows the browser language, a manual choice is stored on the account and overrides the browser."); }
  static autoLabel(fbs: FbsAPI) { return fbs("自动（跟随浏览器）", "Option in the language selector meaning the interface language follows the browser automatically."); }
  static langZhCn(fbs: FbsAPI) { return fbs("简体中文", "Language option label for Simplified Chinese in the language selector."); }
  static langZhTw(fbs: FbsAPI) { return fbs("繁體中文", "Language option label for Traditional Chinese in the language selector."); }
  static langEn(fbs: FbsAPI) { return fbs("English", "Language option label for English in the language selector."); }
  static langEs(fbs: FbsAPI) { return fbs("Español", "Language option label for Spanish in the language selector."); }
  static langFr(fbs: FbsAPI) { return fbs("Français", "Language option label for French in the language selector."); }
  static savedText(fbs: FbsAPI) { return fbs("已保存", "Transient confirmation shown in profile settings after a change is saved."); }
}

export abstract class PickerFbtUtils {
  static myGuilds(fbs: FbsAPI) { return fbs("我的百业", "Section heading in the guild picker listing the guilds the signed-in user can access."); }
  static myGuildsEn(fbs: FbsAPI) { return fbs("My Guilds", "English companion text shown next to the my-guilds section heading in the guild picker."); }
  static publicGuilds(fbs: FbsAPI) { return fbs("公开百业", "Section heading in the guild picker listing publicly readable guilds."); }
  static publicGuildsEn(fbs: FbsAPI) { return fbs("Public · Read Only", "English companion text next to the public-guilds heading, noting those guilds are read-only."); }
  static readOnlyBadge(fbs: FbsAPI) { return fbs("只读", "Badge shown on a guild card in the picker when the guild is only readable, not joinable or editable by the viewer."); }
  static emptyTitle(fbs: FbsAPI) { return fbs("你还没有可用的百业", "Heading of the empty state shown in the guild picker when the user has no guilds available."); }
  static emptyBody(fbs: FbsAPI) { return fbs("百业按 Discord 服务器划分：你所在的服务器若已绑定百业，它会出现在这里。若还没有，你可以把自己管理的服务器绑成一个新百业。", "Empty-state explanation in the guild picker: guilds are scoped to Discord servers, bound guilds of the user's servers appear here, and the user can bind a server they manage as a new guild."); }
  static createGuild(fbs: FbsAPI) { return fbs("创建百业", "Button label in the guild picker that starts creating a new guild."); }
  static createGuildMore(fbs: FbsAPI) { return fbs("+ 创建新百业", "Button label in the guild picker for creating another new guild when the user already has guilds."); }
}

export abstract class CreateFbtUtils {
  static backLink(fbs: FbsAPI) { return fbs("‹ 我的百业", "Back link at the top of the create-guild page, returning to the user's guild list."); }
  static title(fbs: FbsAPI) { return fbs("创建百业", "Heading of the create-guild page."); }
  static subtitle(fbs: FbsAPI) { return fbs("绑定一个你管理的 Discord 服务器 —— 之后只有该服务器的成员能看到并使用这个百业。", "Subtitle on the create-guild page explaining that a managed Discord server is bound and only its members can see and use the guild."); }
  static nameLabel(fbs: FbsAPI) { return fbs("百业名", "Label of the guild name field on the create-guild form."); }
  static namePlaceholder(fbs: FbsAPI) { return fbs("如：叽哩呱啦", "Placeholder example text in the guild name field on the create-guild form."); }
  static slugLabel(fbs: FbsAPI) { return fbs("访问标识 slug（网址后缀，只能小写字母 / 数字 / 连字符）", "Label of the slug field on the create-guild form, stating the allowed characters for the URL suffix."); }
  static slugPlaceholder(fbs: FbsAPI) { return fbs("如：my-guild", "Placeholder example text in the slug field on the create-guild form."); }
  static slugChecking(fbs: FbsAPI) { return fbs("检查中…", "Status text next to the slug field while the slug availability check is running."); }
  static slugAvailable(fbs: FbsAPI, p?: StringParams) { return fbs(["✓ yanyun.app/", fbs.param("slug", pv(p, "slug")), " 可用"], "Status text confirming the slug can be used; {slug} is the full public URL of the new guild."); }
  static slugTaken(fbs: FbsAPI) { return fbs("✗ 已被占用或不符合规则", "Status text next to the slug field when the slug is taken or invalid."); }
  static slugNote(fbs: FbsAPI) { return fbs("创建后不可更改", "Note under the slug field on the create-guild form: the slug cannot be changed after creation."); }
  static serverLabel(fbs: FbsAPI) { return fbs("绑定 Discord 服务器（仅列出你有管理权限的）", "Label of the Discord server selector on the create-guild form; only servers the user can manage are listed."); }
  static noServers1(fbs: FbsAPI) { return fbs("你还没有任何可管理的 Discord 服务器。", "First line of the empty state on the create-guild form when the user manages no Discord servers."); }
  static noServers2(fbs: FbsAPI) { return fbs("先在 Discord 里建一个服务器（或拿到管理员权限），重新登录刷新列表后再来创建。", "Second line of the empty state on the create-guild form, telling the user to create a server or get admin rights in Discord, then sign in again to refresh the list."); }
  static submit(fbs: FbsAPI) { return fbs("创建百业", "Submit button label on the create-guild form."); }
  static submitting(fbs: FbsAPI) { return fbs("创建中…", "Submit button label on the create-guild form while creation is in progress."); }
  static toastNameShort(fbs: FbsAPI) { return fbs("百业名至少 2 个字", "Toast shown when the guild name entered on the create-guild form is shorter than two characters."); }
  static toastSlugRequired(fbs: FbsAPI) { return fbs("请填写访问标识 slug", "Toast shown when the create-guild form is submitted without a slug."); }
  static toastSlugBad(fbs: FbsAPI) { return fbs("这个 slug 不可用，换一个", "Toast shown when the slug on the create-guild form is unavailable and another must be chosen."); }
  static toastServerRequired(fbs: FbsAPI) { return fbs("请选择要绑定的 Discord 服务器", "Toast shown when the create-guild form is submitted without choosing a Discord server to bind."); }
  static toastCreated(fbs: FbsAPI) { return fbs("百业创建成功", "Toast shown after a guild is created successfully."); }
  static toastFailed(fbs: FbsAPI) { return fbs("创建失败，请稍后再试", "Toast shown when guild creation fails."); }
}

export abstract class AccountFbtUtils {
  static sectionTitle(fbs: FbsAPI) { return fbs("我的数据", "Heading of the my-data section in profile settings, containing data export and account deletion."); }
  static exportLabel(fbs: FbsAPI) { return fbs("导出我的数据", "Label of the data export action in the my-data section of profile settings."); }
  static exportHint(fbs: FbsAPI) { return fbs("把你账号的全部数据下载为一个 JSON 文件：账号资料、百业名册、你创建的车队、你的报名座位、装备库与方案。登录凭据与推送令牌出于安全不会包含在内。", "Explanation next to the data export action: the download is a JSON file with account data, rosters, created squads, signups, gear library and builds, excluding credentials and push tokens."); }
  static deleteLabel(fbs: FbsAPI) { return fbs("删除账号", "Label of the account deletion action in the my-data section of profile settings."); }
  static deleteHint(fbs: FbsAPI) { return fbs("删除不可恢复。提交后有 7 天冷静期，期间可随时撤销；到期后你的个人数据会被删除或匿名化。", "Warning next to the account deletion action: deletion is irreversible, with a seven-day cooling-off period before it executes."); }
  static reauthLabel(fbs: FbsAPI) { return fbs("通过 Discord 重新验证", "Label of the Discord re-verification step required before sensitive account operations."); }
  static reauthHint(fbs: FbsAPI) { return fbs("导出与删除属于敏感操作，继续前需要一次新鲜的 Discord 授权验证。", "Explanation that export and deletion are sensitive operations requiring a fresh Discord authorization first."); }
  static confirmTitle(fbs: FbsAPI) { return fbs("确认删除账号", "Title of the account deletion confirmation page."); }
  static confirmIntro(fbs: FbsAPI) { return fbs("请仔细阅读删除后果。提交后进入 7 天冷静期，到期自动执行：", "Intro line on the account deletion confirmation page, asking the user to read the consequences and noting the seven-day cooling-off period."); }
  static consequenceCars(fbs: FbsAPI) { return fbs("你创建的车队不会被删除：车头会解绑为无主车队，创建者显示名替换为「已注销用户」；你在他人车队里的座位会被原地匿名化。", "Deletion consequence listed on the confirmation page: created squads are kept as ownerless, the creator name is replaced, and the user's seats in other squads are anonymized in place."); }
  static consequenceData(fbs: FbsAPI) { return fbs("你的装备库与方案、推送令牌、昵称快照、百业名册行会被彻底删除；执行后你在所有设备上的登录会立即失效。", "Deletion consequence listed on the confirmation page: gear library, builds, push tokens, nickname snapshots and roster rows are permanently deleted and all sessions are invalidated."); }
  static consequenceGuilds(fbs: FbsAPI) { return fbs("百业本身与百业管理密码不受影响：百业不属于任何个人账号，不会因你删除账号而解散或变更。", "Deletion consequence listed on the confirmation page: guilds themselves and their admin passwords are unaffected because a guild does not belong to a personal account."); }
  static consequenceResidual(fbs: FbsAPI) { return fbs("少数记录无法按个人清除：已经发到 Discord 的消息、成绩榜里的自由文本名单会保留；备份中的副本最迟在 14 天内随每日备份轮换清除。", "Deletion consequence listed on the confirmation page: Discord messages already sent and free-text leaderboard names cannot be scrubbed per person, and backup copies rotate out within fourteen days."); }
  static consequenceReregister(fbs: FbsAPI) { return fbs("删除不是封禁：之后用同一个 Discord 账号重新登录，就会注册成一个全新的账号。", "Deletion consequence listed on the confirmation page: deletion is not a ban; signing in again with the same Discord account registers a fresh account."); }
  static exportFirstHint(fbs: FbsAPI) { return fbs("建议先导出一份你的数据，再提交删除。", "Advice on the account deletion confirmation page to export a copy of the data before submitting the deletion."); }
  static usernameLabel(fbs: FbsAPI) { return fbs("输入你的 Discord 显示名以确认", "Label of the confirmation field on the account deletion page where the user types their Discord display name to confirm."); }
  static submitLabel(fbs: FbsAPI) { return fbs("提交删除申请", "Submit button label on the account deletion confirmation page."); }
  static backLabel(fbs: FbsAPI) { return fbs("返回", "Back button label on the account deletion pages, returning to profile settings."); }
  static pendingTitle(fbs: FbsAPI) { return fbs("账号删除已排期", "Heading shown when an account deletion is scheduled and pending execution."); }
  static pendingBody(fbs: FbsAPI, p?: StringParams) { return fbs(["你的账号将于 ", fbs.param("date", pv(p, "date")), " 执行删除。到期前你可以随时撤销；用新设备重新登录也会自动撤销（到期后除外）。"], "Body text of the pending-deletion state; {date} is the date the deletion will execute, and the text explains how to cancel it before then."); }
  static cancelDeletionLabel(fbs: FbsAPI) { return fbs("撤销删除", "Button label that cancels a scheduled account deletion."); }
  static deletionRequestedText(fbs: FbsAPI) { return fbs("删除申请已提交，7 天冷静期开始。", "Confirmation text shown after a deletion request is submitted and the cooling-off period starts."); }
  static deletionCancelledText(fbs: FbsAPI) { return fbs("删除申请已撤销，你的账号不会被删除。", "Confirmation text shown after a scheduled deletion is cancelled."); }
  static exportAbout(fbs: FbsAPI) { return fbs("这是你账号数据的导出副本。account 是账号资料（oauth 只记录授权范围与最近刷新时间，凭据本身不导出）；guilds 是你在各百业的名册行；serverNicks 是你在各 Discord 服务器的昵称快照；carsLed 是你创建的车队；seats 是你的报名座位；gearItems 是装备库；gearBuilds 是已保存方案；heirloom 是传家宝推送的去重状态。推送令牌属于设备凭据，只记录数量与平台，令牌本身不导出。", "README text embedded at the top of the exported account data file, explaining each top-level section of the export and what is deliberately not exported."); }
  static deletedUser(fbs: FbsAPI) { return fbs("已注销用户", "Replacement display name shown wherever a deleted account's name used to appear, such as on ownerless squads."); }
}

export abstract class LandingFbtUtils {
  static featuresTitle(fbs: FbsAPI) { return fbs("为百业同道而备", "Heading of the feature overview section on the public landing page."); }
  static groupingTitle(fbs: FbsAPI) { return fbs("组队报名", "Title of the grouping feature card on the landing page."); }
  static groupingBody(fbs: FbsAPI) { return fbs("双十、天赋、竞速、爬塔四类车队一键成行，席位名册一目了然，短链分享直达车队页。", "Description on the landing page of the grouping feature: four squad types, one-tap forming, a visible seat roster and short-link sharing."); }
  static reminderTitle(fbs: FbsAPI) { return fbs("发车提醒", "Title of the reminder feature card on the landing page."); }
  static reminderBody(fbs: FbsAPI) { return fbs("发车前自动提醒到 Discord 频道与手机 App，就位确认先行，只催还没到场的人。", "Description on the landing page of departure reminders sent to Discord and the mobile app, with ready checks that only nudge people who have not arrived."); }
  static dexTitle(fbs: FbsAPI) { return fbs("图鉴与攻略", "Title of the compendium and guides feature card on the landing page."); }
  static dexBody(fbs: FbsAPI) { return fbs("副本、首领图鉴与机制攻略，十一流派毕业词缀与配装参考，随国际服版本更新。", "Description on the landing page of the dungeon and boss compendium, mechanics guides and graduation affix references that track the global server version."); }
  static gearTitle(fbs: FbsAPI) { return fbs("装备规划", "Title of the gear planning feature card on the landing page."); }
  static gearBody(fbs: FbsAPI) { return fbs("个人装备库与搭配筹谋：粘贴、截图识别或手动录入，承音调律与毕业度测算，离毕业还差多少一眼看清。", "Description on the landing page of the personal gear library and planner: paste, screenshot recognition or manual entry, tuning and graduation calculations."); }
}

export abstract class FeedbackFbtUtils {
  static entryLabel(fbs: FbsAPI) { return fbs("意见反馈", "Label of the entry point (button or menu item) that opens the feedback dialog."); }
  static title(fbs: FbsAPI) { return fbs("意见反馈", "Title of the in-site feedback dialog."); }
  static categoryLabel(fbs: FbsAPI) { return fbs("类别", "Label of the category selector in the feedback dialog."); }
  static catProblem(fbs: FbsAPI) { return fbs("问题", "Category option in the feedback dialog for reporting a problem."); }
  static catSuggestion(fbs: FbsAPI) { return fbs("建议", "Category option in the feedback dialog for making a suggestion."); }
  static catOther(fbs: FbsAPI) { return fbs("其他", "Category option in the feedback dialog for anything that is neither a problem nor a suggestion."); }
  static placeholder(fbs: FbsAPI) { return fbs("请描述遇到的问题，或写下你的建议…", "Placeholder text of the feedback body textarea in the feedback dialog."); }
  static submit(fbs: FbsAPI) { return fbs("提交反馈", "Submit button label in the feedback dialog."); }
  static submitting(fbs: FbsAPI) { return fbs("提交中…", "Submit button label in the feedback dialog while the feedback is being sent."); }
  static success(fbs: FbsAPI) { return fbs("已收到，感谢你的反馈。", "Confirmation message shown after feedback is submitted successfully."); }
}

