/* fbtee declaration surface for the platform domain (hand-maintained): this
 * domain's UI-copy declarations, one section (area) = one
 * XxxFbtUtils abstract class, one string = one static method on it,
 * one method = one fbs call. A string's identity is the declaration
 * itself (domain + export name <section>_<method>); the desc
 * is a natural-language note FOR TRANSLATORS -- what the string is,
 * where it appears, what its parameters mean -- never a key.
 * Descriptions follow the role-first paradigm: '<Role> for
 * <surface>, used for <purpose>' — the copy's role first (Title
 * text, Button label, Hint text, Error message, ...), then the
 * feature surface it belongs to, then what it is used for,
 * written from the real call site; parameters are explained in
 * the used-for part. Source
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

export abstract class CommonFbtUtils {
  static cancel(fbs: FbsAPI) { return fbs("取消", "Button label for dialogs and forms across the app, used to dismiss the current action without applying changes."); }
  static confirm(fbs: FbsAPI) { return fbs("确定", "Button label for dialogs and confirmation prompts across the app, used to confirm the current action."); }
  static unknownError(fbs: FbsAPI) { return fbs("未知错误", "Error message for failed operations across the app, used as the fallback when no specific error code is available."); }
  static renderError(fbs: FbsAPI, p?: StringParams) { return fbs(["渲染出错: ", fbs.param("message", pv(p, "message"))], "Error heading for the render error boundary, used when a page section fails to render, where {message} is the caught error message."); }
  static renderErrorHint(fbs: FbsAPI) { return fbs("这一页出了问题，其他页面不受影响。", "Hint text for the render error boundary, used under the error heading to reassure the user that other pages are unaffected."); }
  static backToHub(fbs: FbsAPI) { return fbs("返回百业集结", "Link label for error and empty states, used to return the user to the guild hub."); }
  static loadingGuild(fbs: FbsAPI) { return fbs("正在展开百业…", "Loading text for guild pages, used as a placeholder while a guild page is being loaded."); }
  static close(fbs: FbsAPI) { return fbs("关闭", "Button label for dialogs and dismissible panels, used to close the current surface."); }
}

export abstract class AppBlocksFbtUtils {
  static rosterTitle(fbs: FbsAPI) { return fbs("队伍名册", "Title text for the roster block in server-composed grouping pages, used above the list of squad seats and members."); }
  static closedStatus(fbs: FbsAPI) { return fbs("已关闭", "Status label for server-composed blocks, used to mark a grouping that has been closed."); }
  static completedStatus(fbs: FbsAPI) { return fbs("已完成", "Status label for server-composed blocks, used to mark a grouping that has been completed."); }
  static unknownBlock(fbs: FbsAPI) { return fbs("该内容需要更新 App 后显示", "Fallback text for server-composed blocks, used by older app versions when a block type is not recognized and the app needs an update to display it."); }
}

export abstract class LegalFbtUtils {
  static termsTitle(fbs: FbsAPI) { return fbs("服务条款", "Title text for the terms of service page, used as the page heading."); }
  static privacyTitle(fbs: FbsAPI) { return fbs("隐私政策", "Title text for the privacy policy page, used as the page heading."); }
  static termsLink(fbs: FbsAPI) { return fbs("服务条款", "Link label for the site footer, used to navigate to the terms of service page."); }
  static privacyLink(fbs: FbsAPI) { return fbs("隐私政策", "Link label for the site footer, used to navigate to the privacy policy page."); }
  static updatedText(fbs: FbsAPI) { return fbs("最后更新：2026 年 10 月 25 日", "Date line for the legal pages, used at the top of the page to show when the text was last updated."); }
  static disclaimer(fbs: FbsAPI) { return fbs("本站为玩家自发维护的非官方工具，与《燕云十六声》及其开发、发行方无隶属或背书关系；游戏名称与相关素材的权利归其各自权利方所有。", "Disclaimer text for the legal pages and the site footer, used to state that the site is an unofficial fan-made tool with no affiliation to the game or its publisher."); }
}

export abstract class TermsBodyFbtUtils {
  static s1h(fbs: FbsAPI) { return fbs("关于本站与非官方声明", "Section heading for the terms of service page, used as the title of section 1 of the terms."); }
  static s1b(fbs: FbsAPI) { return fbs("燕云百业（yanyun.app）是一个由玩家自发维护的非官方百业（公会）组队工具，与《燕云十六声》及其开发、发行方没有任何隶属或背书关系。本站中出现的游戏名称、副本、流派等资料，其权利归各自权利方所有。", "Body text for the terms of service page, used as the content of section 1 of the terms."); }
  static s2h(fbs: FbsAPI) { return fbs("账号与访问", "Section heading for the terms of service page, used as the title of section 2 of the terms."); }
  static s2b(fbs: FbsAPI) { return fbs("本站通过 Discord OAuth 登录。使用本站即表示你同意本条款。你应妥善保管自己的 Discord 账号，通过你的账号进行的操作视为你本人行为。各百业内容的可见与可写范围，由你是否属于该百业绑定的 Discord 服务器决定。", "Body text for the terms of service page, used as the content of section 2 of the terms."); }
  static s3h(fbs: FbsAPI) { return fbs("使用规范", "Section heading for the terms of service page, used as the title of section 3 of the terms."); }
  static s3b(fbs: FbsAPI) { return fbs("不得利用本站冒充他人或其它百业、抢注或占用与你无关的百业标识、发布违法或侵权内容、干扰本站运行，或绕过成员校验。车队标题、报名昵称等由用户发布的内容，由发布者自行负责。", "Body text for the terms of service page, used as the content of section 3 of the terms."); }
  static s4h(fbs: FbsAPI) { return fbs("服务现状", "Section heading for the terms of service page, used as the title of section 4 of the terms."); }
  static s4b(fbs: FbsAPI) { return fbs("本站目前免费提供，并按现状（as is）运行。我们不承诺服务持续可用、功能保持不变，或数据永不丢失；功能可能被调整、中断或终止，原则上不另行通知。重要数据请自行留存备份。", "Body text for the terms of service page, used as the content of section 4 of the terms."); }
  static s5h(fbs: FbsAPI) { return fbs("责任限制", "Section heading for the terms of service page, used as the title of section 5 of the terms."); }
  static s5b(fbs: FbsAPI) { return fbs("在适用法律允许的最大范围内，本站对因使用或无法使用本站而产生的间接、附带或后果性损失不承担责任。", "Body text for the terms of service page, used as the content of section 5 of the terms."); }
  static s6h(fbs: FbsAPI) { return fbs("条款变更", "Section heading for the terms of service page, used as the title of section 6 of the terms."); }
  static s6b(fbs: FbsAPI) { return fbs("本条款可能不时更新，更新后的版本在本站公布即生效；你继续使用本站即视为接受更新后的条款。", "Body text for the terms of service page, used as the content of section 6 of the terms."); }
}

export abstract class PrivacyBodyFbtUtils {
  static s1h(fbs: FbsAPI) { return fbs("我们收集的信息", "Section heading for the privacy policy page, used as the title of section 1 of the policy."); }
  static s1b(fbs: FbsAPI) { return fbs("当你使用 Discord 登录时，我们会读取并保存：你的 Discord 用户 ID、用户名与头像、你加入的 Discord 服务器列表、你在这些服务器中的昵称，以及用于保持登录状态的 OAuth 授权凭据（refresh token）。你在使用本站过程中产生的数据也会被保存，包括百业名册记录、车队与报名记录（包括座位上的身份标识）、装备库与配装方案、语言偏好，以及你在移动端开启通知后注册的推送令牌。", "Body text for the privacy policy page, used as the content of section 1 of the policy."); }
  static s2h(fbs: FbsAPI) { return fbs("我们如何使用信息", "Section heading for the privacy policy page, used as the title of section 2 of the policy."); }
  static s2b(fbs: FbsAPI) { return fbs("上述信息仅用于：登录与身份识别；校验你是否为某百业所绑定 Discord 服务器的成员；组队报名；发车提醒与应用推送；传家宝达成推送；以及按你的偏好显示语言。我们不出售你的个人数据，也不将其用于广告投放。", "Body text for the privacy policy page, used as the content of section 2 of the policy."); }
  static s3h(fbs: FbsAPI) { return fbs("信息的共享与第三方", "Section heading for the privacy policy page, used as the title of section 3 of the policy."); }
  static s3b(fbs: FbsAPI) { return fbs("本站运行在 Cloudflare 的基础设施上，数据存储于其数据库服务；登录与成员校验由 Discord 提供；移动端推送经 Expo 推送服务转发至 Apple 或 Google 的推送通道。发车提醒与传家宝消息会发送到对应百业管理员配置的 Discord 频道，消息中会包含你的游戏昵称。除上述功能所必需的情形外，我们不会向其他第三方提供你的个人数据（法律法规要求除外）。", "Body text for the privacy policy page, used as the content of section 3 of the policy."); }
  static s4h(fbs: FbsAPI) { return fbs("保存期限", "Section heading for the privacy policy page, used as the title of section 4 of the policy."); }
  static s4b(fbs: FbsAPI) { return fbs("你的数据保存在本站数据库中，直至你申请删除，或相关数据对本站功能不再需要为止。报名、车队等历史记录目前会持续保留；如保存规则发生变化，我们会更新本政策。", "Body text for the privacy policy page, used as the content of section 4 of the policy."); }
  static s5h(fbs: FbsAPI) { return fbs("你的权利", "Section heading for the privacy policy page, used as the title of section 5 of the policy."); }
  static s5b(fbs: FbsAPI) { return fbs("你可以查询、导出或删除你的个人数据。在「个人资料」的「我的数据」中，你可以自助导出你的全部数据（需通过 Discord 重新验证身份，每 24 小时一次），也可以自助删除账号：提交删除后有 7 天冷静期，期间可随时撤销；到期后你的个人数据会被删除或匿名化——你创建的车队会转为无主车队、你在他人车队中的座位会被匿名化，备份中的副本最迟在 14 天内随每日备份轮换清除。你也可以随时在 Discord 的设置中断开本站的授权；授权失效后，你在本站的会话会自动作废。", "Body text for the privacy policy page, used as the content of section 5 of the policy."); }
  static s6h(fbs: FbsAPI) { return fbs("联系我们", "Section heading for the privacy policy page, used as the title of section 6 of the policy."); }
  static s6b(fbs: FbsAPI) { return fbs("如对本政策有疑问，或需提出查询、更正、删除申请，请通过本站社区百业「叽哩呱啦」的 Discord 服务器联系管理员。我们会先核实你的 Discord 账号身份，再处理你的申请。", "Body text for the privacy policy page, used as the content of section 6 of the policy."); }
}

export abstract class ErrorsFbtUtils {
  static rateLimited(fbs: FbsAPI) { return fbs("操作过于频繁, 请稍后再试", "Error message for rate limiting, used when a user performs an operation too frequently."); }
  static createRateLimited(fbs: FbsAPI) { return fbs("创建太频繁, 请稍后再试", "Error message for creation rate limiting, used when guild or squad creation is attempted too frequently."); }
  static guildNotFound(fbs: FbsAPI) { return fbs("百业不存在", "Error message for missing guilds, used when an operation references a guild that does not exist."); }
  static gearNotFound(fbs: FbsAPI) { return fbs("装备不存在或不属于你", "Error message for missing gear, used when a gear item does not exist or does not belong to the requesting user."); }
  static gearEmptyBuild(fbs: FbsAPI) { return fbs("搭配为空", "Error message for empty gear builds, used when saving or sharing a build that contains no gear."); }
  static gearCapacityReached(fbs: FbsAPI, p?: StringParams) { return fbs(["装备库已满（上限 ", fbs.param("limit", pv(p, "limit")), " 件），删掉不用的装备后再添加"], "Error message for a full gear library, used when the library has reached its capacity, where {limit} is the maximum number of items."); }
  static gearImportOverflow(fbs: FbsAPI, p?: StringParams) { return fbs(["本批 ", fbs.param("n", pv(p, "n")), " 件会让装备库达到 ", fbs.param("total", pv(p, "total")), " 件，超过上限 ", fbs.param("limit", pv(p, "limit")), " 件，整批未导入"], "Error message for oversized gear imports, used when a batch would exceed the library capacity and the whole batch is rejected, where {n} is the batch size, {total} the resulting count and {limit} the capacity."); }
  static gearOcrBatchTooLarge(fbs: FbsAPI, p?: StringParams) { return fbs(["单批最多识别 ", fbs.param("limit", pv(p, "limit")), " 张截图，本批有 ", fbs.param("n", pv(p, "n")), " 张，请分批导入"], "Error message for oversized OCR batches, used when one recognition batch holds too many screenshots, where {limit} is the per-batch maximum and {n} the submitted count."); }
  static gearOcrDailyLimit(fbs: FbsAPI, p?: StringParams) { return fbs(["今天的批量识别次数已达上限（", fbs.param("limit", pv(p, "limit")), " 批），明天再试"], "Error message for the OCR daily quota, used when the daily batch recognition quota is exhausted, where {limit} is the number of batches allowed per day."); }
  static loginRequired(fbs: FbsAPI) { return fbs("请先登录 Discord 后再操作", "Error message for signed-out users, used when an operation requires a signed-in Discord account."); }
  static loginRequiredShort(fbs: FbsAPI) { return fbs("请先登录 Discord", "Error message for signed-out users, used as the short variant of the login-required error where space is tight."); }
  static localeUnsupported(fbs: FbsAPI) { return fbs("不支持的语言", "Error message for language settings, used when an unsupported interface language is submitted."); }
  static pushTokenInvalid(fbs: FbsAPI) { return fbs("推送令牌无效", "Error message for push registration, used when a submitted push token is invalid."); }
  static guildUnboundWrite(fbs: FbsAPI) { return fbs("该百业尚未绑定 Discord 服务器，写功能已锁定", "Error message for unbound guilds, used on a write to a guild that has not bound a Discord server yet, where writes stay locked until binding."); }
  static memberOnly(fbs: FbsAPI) { return fbs("只有该百业 Discord 服务器的成员可以操作", "Error message for member-only writes, used when a non-member of the guild's Discord server attempts a member-only operation."); }
  static memberOnlyView(fbs: FbsAPI) { return fbs("该百业仅对 Discord 服务器成员开放", "Error message for member-only content, used when a non-member of the guild's Discord server attempts to view restricted guild content."); }
  static recruitClosed(fbs: FbsAPI) { return fbs("该百业尚未开放招新，暂时不能提交申请", "Error message for a join application submitted to a guild whose recruitment switch is off, used for telling the applicant the guild is not open for recruitment yet."); }
  static titleRequired(fbs: FbsAPI) { return fbs("请填写标题", "Error message for squad forms, used when a squad is submitted without a title."); }
  static badStartTime(fbs: FbsAPI) { return fbs("请选择有效的出发时间", "Error message for squad forms, used when the chosen departure time is invalid or in the past."); }
  static startTimeTooFar(fbs: FbsAPI) { return fbs("出发时间不能超过 60 天后", "Error message for squad forms, used when the departure time is more than sixty days ahead."); }
  static groupingNotFound(fbs: FbsAPI) { return fbs("组队不存在", "Error message for missing squads, used when an operation references a squad that does not exist."); }
  static officialEvent(fbs: FbsAPI) { return fbs("官方活动请联系管理员", "Error message for official events, used when a user tries to act on an official event squad that only admins may manage."); }
  static noCreatorRecorded(fbs: FbsAPI) { return fbs("该车队未记录车头，无法解散，请联系管理员处理", "Error message for legacy squads, used when disbanding a squad that has no recorded leader."); }
  static leaderOnlyDisband(fbs: FbsAPI) { return fbs("只有车头可以解散车队", "Error message for squad disbanding, used when someone other than the squad leader or a guild admin tries to disband the squad."); }
  static noCreatorRecordedEdit(fbs: FbsAPI) { return fbs("该车队未记录车头，无法编辑，请联系管理员处理", "Error message for legacy squads, used when editing a squad that has no recorded leader."); }
  static leaderOnlyEdit(fbs: FbsAPI) { return fbs("只有车头可以编辑车队", "Error message for squad editing, used when someone other than the squad leader or a guild admin tries to edit the squad."); }
  static noCreatorRecordedComplete(fbs: FbsAPI) { return fbs("该车队未记录车头，无法完成，请联系管理员处理", "Error message for legacy squads, used when completing a squad that has no recorded leader."); }
  static leaderOnlyComplete(fbs: FbsAPI) { return fbs("只有车头可以完成车队", "Error message for squad completion, used when someone other than the squad leader or a guild admin tries to complete the squad."); }
  static noCreatorRecordedReopen(fbs: FbsAPI) { return fbs("该车队未记录车头，无法恢复，请联系管理员处理", "Error message for legacy squads, used when restoring a squad that has no recorded leader."); }
  static leaderOnlyReopen(fbs: FbsAPI) { return fbs("只有车头可以恢复车队", "Error message for squad restoring, used when someone other than the squad leader or a guild admin tries to restore a completed squad."); }
  static groupingAlreadyCompleted(fbs: FbsAPI) { return fbs("该车队已是完成状态", "Error message for squad completion, used when completing a squad that is already in the completed state."); }
  static groupingNotCompleted(fbs: FbsAPI) { return fbs("该车队尚未完成", "Error message for squad restoring, used when restoring a squad that is not in the completed state."); }
  static groupingClosed(fbs: FbsAPI) { return fbs("该组队已截止报名", "Error message for squad signup, used when signing up for a squad whose signup deadline has passed."); }
  static nicknameRequired(fbs: FbsAPI) { return fbs("请填写游戏昵称", "Error message for signups, used when a signup or squad is submitted without a game nickname."); }
  static proxyTargetNotInRoster(fbs: FbsAPI) { return fbs("所选成员不在本百业名册中", "Error message for proxy signups, used when the picked member is not on the guild roster."); }
  static groupingFull(fbs: FbsAPI) { return fbs("名额已满或报名已截止", "Error message for squad signup, used when the squad is full or its signup has closed."); }
  static lastSeatHealer(fbs: FbsAPI) { return fbs("最后一个名额需要奶", "Error message for squad signup, used when the last remaining seat must be filled by a healer and the signup is not one."); }
  static alreadyJoined(fbs: FbsAPI) { return fbs("已报过名", "Error message for squad signup, used when a member signs up for a squad they already sit in."); }
  static seatNotFound(fbs: FbsAPI) { return fbs("未找到该报名", "Error message for seat operations, used when the referenced signup seat does not exist."); }
  static notSeated(fbs: FbsAPI) { return fbs("你还没有落座这辆车", "Error message for seat operations, used when a member acts on a squad they have not signed up for, such as toggling the ready state."); }
  static reminderOffsetsInvalid(fbs: FbsAPI) { return fbs("提醒提前量不在可选范围内", "Error message for reminder settings, used when submitted reminder lead times fall outside the allowed set."); }
  static ogAccentInvalid(fbs: FbsAPI) { return fbs("强调色不在可选范围内", "Error message for share card settings, used when a submitted OG accent color falls outside the allowed palette."); }
  static paramsIncomplete(fbs: FbsAPI) { return fbs("参数不完整", "Error message for malformed requests, used when a request is missing required parameters."); }
  static bossNotFound(fbs: FbsAPI) { return fbs("首领不存在", "Error message for missing bosses, used when an operation references a boss that does not exist."); }
  static guildNameShort(fbs: FbsAPI) { return fbs("百业名称至少 2 个字", "Error message for guild creation, used when a guild name is shorter than two characters."); }
  static avatarTooLarge(fbs: FbsAPI) { return fbs("头像图片不能超过 400KB", "Error message for guild avatar uploads, used when the uploaded image exceeds 400 KB."); }
  static avatarBadType(fbs: FbsAPI) { return fbs("头像只支持 PNG、JPEG 或 WebP 图片", "Error message for guild avatar uploads, used when the uploaded image is not a PNG, JPEG or WebP file."); }
  static avatarEmpty(fbs: FbsAPI) { return fbs("没有收到图片数据", "Error message for guild avatar uploads, used when the upload carries no image data."); }
  static slugInvalid(fbs: FbsAPI) { return fbs("站点地址只能用小写字母/数字/连字符, 2-40 位", "Error message for guild slugs, used when a slug violates the format rules for lowercase letters, digits and hyphens at two to forty characters."); }
  static slugReserved(fbs: FbsAPI) { return fbs("该地址为保留字, 请换一个", "Error message for guild slugs, used when the submitted slug is a reserved word."); }
  static slugTaken(fbs: FbsAPI) { return fbs("该地址已被占用, 请换一个", "Error message for guild slugs, used when the submitted slug is already in use."); }
  static serverRequired(fbs: FbsAPI) { return fbs("请选择要绑定的 Discord 服务器", "Error message for guild binding, used when creating or binding a guild without choosing a Discord server."); }
  static notInServer(fbs: FbsAPI) { return fbs("你不在这个 Discord 服务器中", "Error message for server membership, used when the user is not a member of the Discord server involved in the operation."); }
  static cannotManageServer(fbs: FbsAPI) { return fbs("你需要在该 Discord 服务器拥有管理员或「管理服务器」权限才能绑定它", "Error message for server binding, used when the user lacks administrator or Manage Server permission in the Discord server being bound."); }
  static adminOnly(fbs: FbsAPI) { return fbs("只有所绑服务器的管理员可以执行此操作", "Error message for guild admin operations, used when a non-admin of the bound Discord server attempts an admin-only operation."); }
  static platformAdminRequired(fbs: FbsAPI) { return fbs("需要平台超管权限", "Error message for platform admin operations, used when a viewer who does not pass the platform-admin gate attempts an admin mutation."); }
  static tierInvalid(fbs: FbsAPI) { return fbs("档位无效", "Error message for premium grants, used when a grant names a tier that is not one of the known plan tiers."); }
  static feedbackNotFound(fbs: FbsAPI) { return fbs("反馈不存在", "Error message for feedback triage, used when an operation references a feedback submission that does not exist."); }
  static bossNameRequired(fbs: FbsAPI) { return fbs("首领名不能为空", "Error message for boss compendium editing, used when a boss is created without a name."); }
  static webhookFormatInvalid(fbs: FbsAPI) { return fbs("Webhook URL 格式不对（应为 https://discord.com/api/webhooks/...）", "Error message for webhook configuration, used when a submitted Discord webhook URL does not match the official format."); }
  static webhookNotConfigured(fbs: FbsAPI) { return fbs("尚未配置 Webhook URL", "Error message for webhook test sends, used when a test is attempted for a guild that has no webhook configured."); }
  static subdomainTrialCardRequired(fbs: FbsAPI) { return fbs("该百业处于试用期且未登记支付方式：启用平台子域名前需先登记卡（试用期启用持久化功能需绑卡）", "Error message for the platform subdomain switch, used when enabling the subdomain for a trialing guild with no payment method on file."); }
  static backupStorageMissing(fbs: FbsAPI) { return fbs("备份存储（R2 BACKUPS 绑定）未配置", "Error message for backup operations, used when the R2 BACKUPS binding is not configured on the Worker."); }
  static backupNotFound(fbs: FbsAPI) { return fbs("备份不存在", "Error message for backup downloads, used when the requested backup object does not exist in the bucket."); }
  static badParams(fbs: FbsAPI) { return fbs("参数不正确", "Error message for malformed admin requests, used when submitted parameters fail validation."); }
  static testSendFailed(fbs: FbsAPI) { return fbs("测试发送失败", "Error message prefix for webhook test sends on the platform admin surface, used when a test message could not be delivered, followed by the delivery error detail."); }
  static noCandidates(fbs: FbsAPI) { return fbs("没有符合条件的成员可发送", "Error message for targeted nudges, used when a nudge segment matches no unsigned guild member."); }
  static nudgeDailyLimit(fbs: FbsAPI, p?: StringParams) { return fbs(["今天的定向催报已达上限（每天 ", fbs.param("limit", pv(p, "limit")), " 次），明天再发"], "Error message for targeted nudges, used when the guild reaches its daily nudge quota, where {limit} is the number of nudges allowed per day."); }
  static nudgeCooldown(fbs: FbsAPI) { return fbs("这辆车刚催报过，24 小时内不能重复催报", "Error message for targeted nudges, used when the same grouping was already nudged within the per-event cooldown window."); }
  static nudgeEventInvalid(fbs: FbsAPI) { return fbs("要催报的车队不存在或不属于本百业", "Error message for targeted nudges, used when the target grouping does not exist in this guild."); }
  static contributionRuleInvalid(fbs: FbsAPI) { return fbs("积分规则不合法", "Error message for contribution points, used when a rule update names an unknown action or an out-of-range point value."); }
  static webhookInvalid(fbs: FbsAPI) { return fbs("Webhook 地址格式不正确", "Error message for webhook settings, used when a submitted Discord webhook URL is malformed."); }
  static discordIdInvalid(fbs: FbsAPI) { return fbs("Discord 服务器 ID 格式不正确", "Error message for Discord settings, used when a submitted Discord server ID is malformed."); }
  static noFieldsToUpdate(fbs: FbsAPI) { return fbs("没有可更新的字段", "Error message for update requests, used when the request contains no fields to change."); }
  static signupNotFound(fbs: FbsAPI) { return fbs("未找到该报名记录", "Error message for signup records, used when an operation references a signup that does not exist."); }
  static resultNotFound(fbs: FbsAPI) { return fbs("未找到该成绩", "Error message for racing results, used when an operation references a result record that does not exist."); }
  static resultTeamRequired(fbs: FbsAPI) { return fbs("缺少队伍名", "Error message for racing results, used when a result is submitted without a team name."); }
  static resultTimeInvalid(fbs: FbsAPI) { return fbs("用时格式不正确（如 12:34.567）", "Error message for racing results, used when a submitted clear time does not match the minutes, seconds and milliseconds format."); }
  static avatarDataInvalid(fbs: FbsAPI) { return fbs("图片数据无效", "Error message for avatar uploads, used when the uploaded image data cannot be decoded."); }
  static schoolRequired(fbs: FbsAPI) { return fbs("缺少流派", "Error message for sect selection, used when a signup or gear entry is submitted without a sect."); }
  static generic(fbs: FbsAPI) { return fbs("操作失败，请稍后再试", "Error message for failed operations, used as the fallback when an operation fails without a more specific cause."); }
  static templateNotFound(fbs: FbsAPI) { return fbs("模板不存在", "Error message for missing templates, used when an operation references a squad template that does not exist."); }
  static templateNameRequired(fbs: FbsAPI) { return fbs("请填写模板名", "Error message for squad templates, used when a template is saved without a name."); }
  static templateForbidden(fbs: FbsAPI) { return fbs("只有模板创建者或百业管理员可以改删模板", "Error message for squad templates, used when someone other than the template creator or a guild admin tries to modify or delete the template."); }
  static templateBadStart(fbs: FbsAPI) { return fbs("发车时间设置无效", "Error message for squad templates, used when a template's departure time setting is invalid."); }
  static accountReauthRequired(fbs: FbsAPI) { return fbs("请先通过 Discord 重新验证身份", "Error message for sensitive account operations, used when export or deletion is attempted without a fresh Discord re-verification."); }
  static accountExportRateLimited(fbs: FbsAPI) { return fbs("每 24 小时只能导出一次数据，请稍后再试", "Error message for data export, used when the user exports their data more than once within twenty-four hours."); }
  static accountUsernameMismatch(fbs: FbsAPI) { return fbs("输入的显示名与你的账号不一致", "Error message for account deletion confirmation, used when the typed display name does not match the account."); }
  static accountDeletionPending(fbs: FbsAPI) { return fbs("已有一份删除申请在冷静期中", "Error message for account deletion, used when a deletion request is already in its cooling-off period."); }
  static accountDeletionNotPending(fbs: FbsAPI) { return fbs("当前没有待执行的删除申请", "Error message for account deletion cancellation, used when no pending deletion request exists to cancel."); }
  static premiumRequired(fbs: FbsAPI) { return fbs("该功能需要开通 Premium", "Error message for premium features, used when a guild without an active premium plan attempts a premium-only operation."); }
  static customDomainInvalid(fbs: FbsAPI) { return fbs("域名格式不正确，请填写裸域名（如 www.example.com）", "Error message for custom domain binding, used when the submitted hostname is not a valid bare domain name."); }
  static customDomainReserved(fbs: FbsAPI) { return fbs("该域名为平台保留域名，不能绑定", "Error message for custom domain binding, used when the submitted hostname belongs to the platform or a reserved suffix."); }
  static customDomainConflict(fbs: FbsAPI) { return fbs("该域名已被其他百业绑定", "Error message for custom domain binding, used when the submitted hostname is already bound by another guild."); }
  static customDomainNotBound(fbs: FbsAPI) { return fbs("本百业尚未绑定域名", "Error message for custom domain operations, used when an operation needs an existing binding but the guild has none."); }
  static customDomainDisabled(fbs: FbsAPI) { return fbs("该域名已被平台停用", "Error message for custom domain verification, used when the binding has been switched off by the platform."); }
  static customDomainSeamPending(fbs: FbsAPI) { return fbs("平台域名服务尚在接通中，暂不能验证", "Error message for custom domain verification, used while the platform domain service is not connected yet."); }
  static customDomainDnsPending(fbs: FbsAPI) { return fbs("DNS 记录尚未生效或不完整，请确认两条记录后稍后再试", "Error message for custom domain verification, used when the CNAME or ownership TXT record does not check out yet."); }
  static gearStandardInvalid(fbs: FbsAPI) { return fbs("达标线参数不合法", "Error message for gear readiness lines, used when a readiness line is saved with an empty scene label or a score outside the allowed range."); }
  static gearStandardNotFound(fbs: FbsAPI) { return fbs("达标线不存在", "Error message for gear readiness lines, used when an update or delete references a line that does not exist in this guild."); }
  static capabilityRequired(fbs: FbsAPI) { return fbs("你没有这项管理权限（需要百业管理员授予对应的军官能力）", "Error message for capability-gated admin operations, used when a delegated officer attempts an operation outside their granted capability set."); }
  static governanceTierRequired(fbs: FbsAPI) { return fbs("治理功能需要百业达到最高档位（T3）", "Error message for governance operations, used when a guild below tier 3 attempts to grant officer capabilities or use the officer board."); }
  static officerTargetNotFound(fbs: FbsAPI) { return fbs("目标成员不在本百业名册中", "Error message for officer grants, used when a grant targets someone who is not on the guild roster."); }
  static officerBoardBodyRequired(fbs: FbsAPI) { return fbs("私密区留言不能为空", "Error message for the officer private board, used when a board post is submitted with an empty body."); }
  static officerBoardBodyTooLong(fbs: FbsAPI) { return fbs("私密区留言过长", "Error message for the officer private board, used when a board post exceeds the body length limit."); }
  static officerBoardPostNotFound(fbs: FbsAPI) { return fbs("私密区留言不存在", "Error message for the officer private board, used when an operation references a board post that does not exist in this guild."); }
  static premiumComingSoon(fbs: FbsAPI) { return fbs("Premium 开通即将开放", "Error message for premium activation, used while premium checkout is not open yet."); }
  static premiumActive(fbs: FbsAPI) { return fbs("本百业已开通 Premium", "Error message for premium activation, used when activating premium for a guild that already has it."); }
  static paygateDisabled(fbs: FbsAPI) { return fbs("收费功能尚未开启", "Error message for paid features, used while the platform paygate is switched off."); }
  static checkoutFailed(fbs: FbsAPI) { return fbs("创建支付会话失败，请稍后再试", "Error message for premium checkout, used when creating a payment session fails."); }
  static rosterImportEmpty(fbs: FbsAPI) { return fbs("没有收到任何识别文本，请重新截图后再试", "Error message for roster OCR import, used when no recognized text is received and the user must retake the screenshot."); }
  static rosterBatchNotFound(fbs: FbsAPI) { return fbs("导入预览不存在或已失效，请重新识别", "Error message for roster OCR import, used when the import preview batch no longer exists or has expired."); }
  static rosterBatchConfirmed(fbs: FbsAPI) { return fbs("这份预览已经确认导入过了", "Error message for roster OCR import, used when confirming a preview batch that was already imported."); }
  static rosterNoImportableRows(fbs: FbsAPI) { return fbs("没有勾选任何可导入的新名", "Error message for roster OCR import, used when no importable new names are selected in the preview."); }
  static rosterEntryNotFound(fbs: FbsAPI) { return fbs("名册记录不存在", "Error message for roster operations, used when the referenced roster entry does not exist."); }
  static checklistItemUnknown(fbs: FbsAPI) { return fbs("检查条目不存在", "Error message for onboarding checklists, used when toggling a checklist item key the server does not know."); }
  static feedbackEmpty(fbs: FbsAPI) { return fbs("反馈内容不能为空", "Error message for feedback submission, used when the feedback body is empty."); }
  static feedbackTooLong(fbs: FbsAPI) { return fbs("反馈内容太长，请精简到 2000 字以内", "Error message for feedback submission, used when the feedback body exceeds two thousand characters."); }
  static feedbackRateLimited(fbs: FbsAPI) { return fbs("今天提交的反馈已达上限，请明天再来", "Error message for feedback submission, used when the user reaches the daily feedback quota."); }
  static announcementTitleRequired(fbs: FbsAPI) { return fbs("请填写公告标题", "Error message for announcements, used when an announcement is submitted without a title."); }
  static announcementTitleTooLong(fbs: FbsAPI) { return fbs("公告标题太长，请精简到 80 字以内", "Error message for announcements, used when an announcement title exceeds eighty characters."); }
  static announcementBodyTooLong(fbs: FbsAPI) { return fbs("公告正文太长，请精简到 2000 字以内", "Error message for announcements, used when an announcement body exceeds two thousand characters."); }
  static announcementNotFound(fbs: FbsAPI) { return fbs("公告不存在", "Error message for announcements, used when an operation references an announcement that does not exist."); }
  static translationNotConfigured(fbs: FbsAPI) { return fbs("多语翻译尚未配置", "Error message for multilingual announcements, used when generating translations before the translation provider is configured."); }
  static translationTierLocked(fbs: FbsAPI) { return fbs("多语公告需要更高的百业档位", "Error message for multilingual announcements, used when the guild's tier does not include multilingual announcements."); }
  static announcementDailyLimit(fbs: FbsAPI, p?: StringParams) { return fbs(["今天的公告已达上限（每天 ", fbs.param("limit", pv(p, "limit")), " 条），明天再发"], "Error message for announcements, used when the guild reaches its daily announcement quota, where {limit} is the number of announcements allowed per day."); }
  static urgentCallDailyLimit(fbs: FbsAPI, p?: StringParams) { return fbs(["今天的紧急集合呼叫已达上限（每天 ", fbs.param("limit", pv(p, "limit")), " 次），明天再试"], "Error message for urgent calls, used when the guild reaches its daily urgent-call quota, where {limit} is the number of calls allowed per day."); }
  static lotteryTitleRequired(fbs: FbsAPI) { return fbs("请填写抽奖标题", "Error message for lotteries, used when a lottery is created without a title."); }
  static lotteryEntriesEmpty(fbs: FbsAPI) { return fbs("参与名单为空，请先选择参与者", "Error message for lotteries, used when a lottery is created with no participants selected."); }
  static lotteryNotFound(fbs: FbsAPI) { return fbs("抽奖不存在", "Error message for lotteries, used when an operation references a lottery that does not exist."); }
  static lotteryAlreadyDrawn(fbs: FbsAPI) { return fbs("该抽奖已经开过奖了", "Error message for lotteries, used when drawing a lottery that has already been drawn."); }
  static lotteryWinnerCountInvalid(fbs: FbsAPI) { return fbs("中奖人数必须在 1 与参与人数之间", "Error message for lotteries, used when the winner count falls outside the range from one to the participant count."); }
  static lotteryWeightInvalid(fbs: FbsAPI) { return fbs("权重必须是 1 到 1000 之间的整数", "Error message for lotteries, used when a participant weight is not an integer between one and one thousand."); }
  static lotteryMemberNotInGuild(fbs: FbsAPI) { return fbs("所选成员不在本百业名册中", "Error message for lotteries, used when a selected participant is not on the guild roster."); }
  static availabilitySlotInvalid(fbs: FbsAPI) { return fbs("可用时段不合法", "Error message for availability settings, used when a submitted availability slot is invalid, such as a reversed or out-of-range window."); }
  static availabilityTooManySlots(fbs: FbsAPI) { return fbs("可用时段太多（最多 21 个）", "Error message for availability settings, used when more than twenty-one availability slots are submitted."); }
  static pollTitleRequired(fbs: FbsAPI) { return fbs("请填写投票标题", "Error message for time polls, used when a poll is created without a title."); }
  static pollOptionsInvalid(fbs: FbsAPI) { return fbs("候选时间不合法（需 2–8 个不同的未来时间）", "Error message for time polls, used when the candidate times are not two to eight distinct future times."); }
  static pollNotFound(fbs: FbsAPI) { return fbs("投票不存在", "Error message for time polls, used when an operation references a poll that does not exist."); }
  static pollClosed(fbs: FbsAPI) { return fbs("该投票已关闭", "Error message for time polls, used when voting on or closing a poll that is already closed."); }
  static pollOptionInvalid(fbs: FbsAPI) { return fbs("所选时间不属于该投票", "Error message for time polls, used when a vote targets a candidate time that is not part of the poll."); }
  static pollForbidden(fbs: FbsAPI) { return fbs("只有发起人或百业管理员可以关闭投票", "Error message for time polls, used when someone other than the poll creator or a guild admin tries to close the poll."); }
  static customFieldInvalid(fbs: FbsAPI) { return fbs("自定义字段不合法", "Error message for signup form fields, used when a custom field definition is invalid."); }
  static fillOfferExists(fbs: FbsAPI) { return fbs("你已有一份发布中的补位供给，请先撤下再重新发布", "Error message for fill-in offers, used when a member publishes while an earlier offer is still open."); }
  static fillSchoolRequired(fbs: FbsAPI) { return fbs("请填写流派", "Error message for fill-in offers, used when an offer or request is submitted without a school."); }
  static fillWindowsInvalid(fbs: FbsAPI) { return fbs("可补位时段不合法", "Error message for fill-in offers, used when a submitted availability window is invalid, such as a reversed or out-of-range window."); }
  static fillRequestNotFound(fbs: FbsAPI) { return fbs("补位需求不存在", "Error message for fill requests, used when an operation references a request that does not exist in this guild."); }
  static fillRequestNotOpen(fbs: FbsAPI) { return fbs("该补位需求已撮合或已关闭", "Error message for fill requests, used when acting on a request that is no longer open."); }
  static fillOfferNotOpen(fbs: FbsAPI) { return fbs("该补位供给已撤下", "Error message for fill invitations, used when inviting a supplier whose offer is no longer open."); }
  static fillInviteExists(fbs: FbsAPI) { return fbs("已经邀请过这位补位人选了", "Error message for fill invitations, used when a live invitation already exists for this request and supplier."); }
  static fillInviteNotFound(fbs: FbsAPI) { return fbs("补位邀请不存在", "Error message for fill invitations, used when an operation references an invitation that does not exist."); }
  static fillInviteNotPending(fbs: FbsAPI) { return fbs("该邀请已经处理过了", "Error message for fill invitations, used when answering an invitation that was already accepted, declined or expired."); }
  static fillInviteNotAccepted(fbs: FbsAPI) { return fbs("对方尚未接受邀请，不能落座", "Error message for fill seating, used when seating a supplier whose invitation is not in the accepted state."); }
  static fillSelfInvite(fbs: FbsAPI) { return fbs("不能邀请自己补位", "Error message for fill invitations, used when a leader tries to invite their own offer."); }
  static marketManageOnly(fbs: FbsAPI) { return fbs("只有该车队的车头或本百业管理员可以操作补位需求", "Error message for fill requests, used when someone other than the squad leader or a guild admin tries to post, invite or seat for that squad."); }
  static allianceSelf(fbs: FbsAPI) { return fbs("不能和自己的百业结盟", "Error message for alliances, used when a guild tries to ally with itself."); }
  static allianceExists(fbs: FbsAPI) { return fbs("与该百业已有待确认或生效中的结盟关系", "Error message for alliances, used when a live relation already exists between the two guilds."); }
  static allianceNotFound(fbs: FbsAPI) { return fbs("结盟关系不存在", "Error message for alliances, used when an operation references an alliance that does not exist for this guild."); }
  static allianceNotPending(fbs: FbsAPI) { return fbs("该结盟邀请已经处理过了", "Error message for alliances, used when answering an alliance invitation that is no longer pending."); }
  static allianceNotActive(fbs: FbsAPI) { return fbs("该结盟已不在生效中", "Error message for alliances, used when dissolving an alliance that already ended or was rejected."); }
  static allyNotAllied(fbs: FbsAPI) { return fbs("与主办百业尚未结盟（或结盟已解除）", "Error message for visitor seats, used when claiming a visitor seat in a squad whose guild is not a current ally."); }
  static allyNotShared(fbs: FbsAPI) { return fbs("该车队未向盟友开放访客位", "Error message for visitor seats, used when a squad is not flagged ally-visible or its visitor quota is zero."); }
  static visitorSlotsFull(fbs: FbsAPI) { return fbs("访客位已满", "Error message for visitor seats, used when all visitor seats of a squad are taken."); }
  static visitorSlotsInvalid(fbs: FbsAPI) { return fbs("访客名额必须在 0 与车队总名额之间", "Error message for squad sharing settings, used when the visitor quota falls outside zero and the squad capacity."); }
  static customFieldTooMany(fbs: FbsAPI) { return fbs("自定义字段最多 5 个", "Error message for signup form fields, used when more than five custom fields are defined for a squad."); }
  static signupAnswerRequired(fbs: FbsAPI) { return fbs("请填写必填的报名信息", "Error message for squad signup, used when a required custom signup question is left unanswered."); }
  static signupAnswerInvalid(fbs: FbsAPI) { return fbs("报名信息不合法", "Error message for squad signup, used when a custom signup answer is invalid, such as an over-length text or an unknown option."); }
  static applicationPending(fbs: FbsAPI) { return fbs("你已有一份待审核的申请，请等待审核结果", "Error message for join applications, used when the applicant already has an application awaiting review."); }
  static alreadyMember(fbs: FbsAPI) { return fbs("你已经是这个百业的成员了", "Error message for join applications, used when a current guild member tries to apply to the same guild again."); }
  static recruitUnavailable(fbs: FbsAPI) { return fbs("该百业尚未绑定 Discord 服务器，暂不开放招新申请", "Error message for join applications, used when applying to a guild that has not bound a Discord server and is not open for recruiting."); }
  static applicationNotFound(fbs: FbsAPI) { return fbs("申请不存在", "Error message for join applications, used when an operation references an application that does not exist."); }
  static applicationNotPending(fbs: FbsAPI) { return fbs("该申请已经审核过了", "Error message for join applications, used when reviewing an application that has already been decided."); }
  static mentorNotDesignated(fbs: FbsAPI) { return fbs("所选导师不在本百业导师人选中，请先设为导师", "Error message for mentor pairing, used when the chosen mentor has not been designated as a mentor in the guild."); }
  static mentorNotInGuild(fbs: FbsAPI) { return fbs("所选导师不在本百业名册中", "Error message for mentor pairing, used when the chosen mentor is not on the guild roster."); }
  static menteeNotInGuild(fbs: FbsAPI) { return fbs("所选新人不在本百业名册中", "Error message for mentor pairing, used when the chosen newcomer is not on the guild roster."); }
  static menteeAlreadyPaired(fbs: FbsAPI) { return fbs("该新人已有一段进行中的配对，请先结束它再改配", "Error message for mentor pairing, used when the newcomer already has an active pairing that must be ended first."); }
  static mentorSelfPairing(fbs: FbsAPI) { return fbs("导师和新人不能是同一个人", "Error message for mentor pairing, used when the mentor and the newcomer are the same person."); }
  static pairingNotFound(fbs: FbsAPI) { return fbs("配对不存在", "Error message for mentor pairing, used when an operation references a pairing that does not exist."); }
  static pairingAlreadyEnded(fbs: FbsAPI) { return fbs("该配对已经结束了", "Error message for mentor pairing, used when ending a pairing that has already ended."); }
  static officerNoteBodyRequired(fbs: FbsAPI) { return fbs("请填写备注内容", "Error message for officer notes, used when a note is saved without body text."); }
  static officerNoteBodyTooLong(fbs: FbsAPI) { return fbs("备注太长，请精简到 500 字以内", "Error message for officer notes, used when a note body exceeds five hundred characters."); }
  static officerNoteNotFound(fbs: FbsAPI) { return fbs("备注不存在", "Error message for officer notes, used when an operation references a note that does not exist."); }
  static officerMemberNotFound(fbs: FbsAPI) { return fbs("该成员不在本百业名册中", "Error message for officer tools, used when the referenced member is not on the guild roster."); }
  static seasonGoalTitleRequired(fbs: FbsAPI) { return fbs("请填写目标", "Error message for season goals, used when a goal is saved without a title."); }
  static seasonGoalTitleTooLong(fbs: FbsAPI) { return fbs("目标太长，请精简到 80 字以内", "Error message for season goals, used when a goal title exceeds eighty characters."); }
  static seasonGoalNoteTooLong(fbs: FbsAPI) { return fbs("进度备注太长，请精简到 500 字以内", "Error message for season goals, used when a goal progress note exceeds five hundred characters."); }
  static seasonGoalNotFound(fbs: FbsAPI) { return fbs("目标不存在", "Error message for season goals, used when an operation references a goal that does not exist."); }
  static seasonGoalDungeonNotFound(fbs: FbsAPI) { return fbs("关联的副本不存在", "Error message for season goals, used when a goal references a dungeon that does not exist."); }
  static recapForbidden(fbs: FbsAPI) { return fbs("只有车头或本百业管理员可以生成复盘", "Error message for AI recap generation, used when someone other than the squad leader or a guild admin tries to generate a recap."); }
  static recapNotCompleted(fbs: FbsAPI) { return fbs("车队完成后才能生成复盘", "Error message for AI recap generation, used when generating a recap for a squad that has not been completed yet."); }
  static recapTierLocked(fbs: FbsAPI) { return fbs("该百业尚未开通 AI 复盘（盟主版功能）", "Error message for AI recap generation, used when the guild is below the premium tier that includes AI recaps."); }
  static recapNotEnabled(fbs: FbsAPI) { return fbs("AI 复盘尚未开启", "Error message for AI recap generation, used when the platform has not configured an AI recap provider yet."); }
  static recapDailyLimit(fbs: FbsAPI) { return fbs("今日复盘生成次数已达上限，明天再试", "Error message for AI recap generation, used when the guild has used up its daily recap generation quota."); }
  static recapProviderFailed(fbs: FbsAPI) { return fbs("复盘生成失败，请稍后重试", "Error message for AI recap generation, used when the AI provider call fails or returns no usable recap text."); }
}


export abstract class PlatformAdminFbtUtils {
  static entryLabel(fbs: FbsAPI) { return fbs("平台管理", "Link label for the platform admin entry on the home page, used only when the viewer's response composes the platform admin type (platform admins only)."); }
  static title(fbs: FbsAPI) { return fbs("平台管理", "Title text for the platform admin page, used as the page heading for the super-admin surface inside the main site."); }
  static subtitle(fbs: FbsAPI) { return fbs("平台运营面：百业、计费、图鉴、配置与审计。原 hub 门户已并入主站，超管判定由平台 gate 在服务端求值。", "Body text for the platform admin page, used under the page title to explain what the surface covers and that the old hub portal moved here."); }
  static lockedTitle(fbs: FbsAPI) { return fbs("需要平台超管权限", "Title text for the platform admin locked state, used when a viewer who is not a platform admin opens the platform admin page."); }
  static lockedBody(fbs: FbsAPI) { return fbs("这个页面只对平台超管开放。超管名单由平台 gate 在服务端求值，你的账号不在名单内，所以这里不会下发任何管理数据。", "Body text for the platform admin locked state, used to explain that the gate verdict happens server-side and no admin data is sent to non-admins."); }
  static tenantsTitle(fbs: FbsAPI) { return fbs("百业列表", "Section title for the tenant list on the platform admin page, used above the table of all guilds on the platform."); }
  static tenantsEmpty(fbs: FbsAPI) { return fbs("暂无百业", "Empty-state text for the tenant list on the platform admin page, used when the platform has no guilds yet."); }
  static billingTitle(fbs: FbsAPI) { return fbs("计费与权益", "Section title for billing on the platform admin page, used above the paygate switch and per-guild entitlement controls."); }
  static paygateLabel(fbs: FbsAPI) { return fbs("付费总闸 (paygate)", "Label text for the paygate master switch on the platform admin page, used beside the switch that turns the whole Premium gate on or off."); }
  static paygateOnText(fbs: FbsAPI) { return fbs("已开启", "Status text for the paygate switch on the platform admin page, used when the Premium gate master switch is on."); }
  static paygateOffText(fbs: FbsAPI) { return fbs("已关闭", "Status text for the paygate switch on the platform admin page, used when the Premium gate master switch is off."); }
  static stripeLabel(fbs: FbsAPI) { return fbs("Stripe", "Label text for the Stripe status row on the platform admin page, used beside the indicator of whether Stripe keys and prices are configured."); }
  static stripeConfiguredText(fbs: FbsAPI) { return fbs("已配置", "Status text for Stripe on the platform admin page, used when the Stripe secret, webhook secret and at least one price are all configured."); }
  static stripeMissingText(fbs: FbsAPI) { return fbs("未配置（密钥或价格缺失）", "Status text for Stripe on the platform admin page, used when Stripe keys or prices are missing so checkout cannot run."); }
  static saasLabel(fbs: FbsAPI) { return fbs("自定义域名 SaaS", "Label text for the custom-domain SaaS status row on the platform admin page, used beside the indicator of whether the zone-level Cloudflare for SaaS seam is connected."); }
  static saasConfiguredText(fbs: FbsAPI) { return fbs("已接入", "Status text for the custom-domain SaaS seam on the platform admin page, used when the zone-level setup is recorded in the Worker env."); }
  static saasMissingText(fbs: FbsAPI) { return fbs("未接入", "Status text for the custom-domain SaaS seam on the platform admin page, used when the zone-level setup has not been done yet."); }
  static plansTitle(fbs: FbsAPI) { return fbs("价格档位", "Section title for the pricing catalog on the platform admin page, used above the list of Premium tiers and monthly prices."); }
  static billingTenantsTitle(fbs: FbsAPI) { return fbs("各百业权益", "Section title for the per-guild entitlement table on the platform admin page, used above the rows carrying grant, revoke, subdomain and custom-domain controls."); }
  static errorsTitle(fbs: FbsAPI) { return fbs("错误日志", "Section title for the error log on the platform admin page, used above the recent platform errors table."); }
  static errorsEmpty(fbs: FbsAPI) { return fbs("暂无错误记录", "Empty-state text for the error log on the platform admin page, used when no recent errors are recorded."); }
  static auditTitle(fbs: FbsAPI) { return fbs("操作审计", "Section title for the audit trail on the platform admin page, used above the operator action log."); }
  static auditEmpty(fbs: FbsAPI) { return fbs("暂无审计记录", "Empty-state text for the audit trail on the platform admin page, used when no operator actions are recorded in range."); }
  static feedbackTitle(fbs: FbsAPI) { return fbs("用户反馈", "Section title for user feedback triage on the platform admin page, used above the in-app feedback submissions list."); }
  static feedbackEmpty(fbs: FbsAPI) { return fbs("暂无反馈", "Empty-state text for user feedback on the platform admin page, used when no feedback submissions match."); }
  static settingsTitle(fbs: FbsAPI) { return fbs("平台设置", "Section title for platform settings on the platform admin page, used above the global game version and notice fields."); }
  static gameVersionLabel(fbs: FbsAPI) { return fbs("游戏版本", "Label text for the game version field in platform settings, used beside the input carrying the current game version string."); }
  static gameNoticeLabel(fbs: FbsAPI) { return fbs("游戏公告", "Label text for the game notice field in platform settings, used beside the input carrying the platform-wide game notice."); }
  static gameVersionCodeLabel(fbs: FbsAPI) { return fbs("版本号 (version code)", "Label text for the game version code field in platform settings, used beside the input carrying the numeric version code."); }
  static bossesTitle(fbs: FbsAPI) { return fbs("首领图鉴", "Section title for the boss compendium editor on the platform admin page, used above the boss list."); }
  static bossesEmpty(fbs: FbsAPI) { return fbs("暂无首领", "Empty-state text for the boss compendium editor on the platform admin page, used when no bosses exist yet."); }
  static dungeonsTitle(fbs: FbsAPI) { return fbs("副本图鉴", "Section title for the dungeon compendium editor on the platform admin page, used above the dungeon list."); }
  static dungeonsEmpty(fbs: FbsAPI) { return fbs("暂无副本", "Empty-state text for the dungeon compendium editor on the platform admin page, used when no dungeons exist yet."); }
  static remindersTitle(fbs: FbsAPI) { return fbs("开车提醒配置", "Section title for departure-reminder configs on the platform admin page, used above the per-guild reminder webhook table."); }
  static remindersEmpty(fbs: FbsAPI) { return fbs("暂无百业", "Empty-state text for the reminder configs on the platform admin page, used when no guild has a reminder config."); }
  static heirloomsTitle(fbs: FbsAPI) { return fbs("传家宝推送配置", "Section title for heirloom push configs on the platform admin page, used above the per-guild heirloom webhook table."); }
  static heirloomsEmpty(fbs: FbsAPI) { return fbs("暂无百业", "Empty-state text for the heirloom push configs on the platform admin page, used when no guild has an heirloom config."); }
  static backupsTitle(fbs: FbsAPI) { return fbs("数据备份", "Section title for backups on the platform admin page, used above the snapshot list and the export and run actions."); }
  static backupsEmpty(fbs: FbsAPI) { return fbs("暂无备份文件", "Empty-state text for the backup list on the platform admin page, used when the backup bucket holds no snapshots yet."); }
  static backupsUnavailableText(fbs: FbsAPI) { return fbs("备份存储（R2 BACKUPS 绑定）未配置", "Status text for backups on the platform admin page, used when the R2 BACKUPS binding is not configured on the Worker."); }
  static rosterTitle(fbs: FbsAPI) { return fbs("平台超管名单", "Section title for the platform admin roster on the platform admin page, used above the editor for the settings-side admin list."); }
  static rosterNote(fbs: FbsAPI) { return fbs("名单按 Discord 用户 ID 在 gate 层求值；环境变量 PLATFORM_ADMIN_DISCORD_IDS 的引导名单始终有效，不在此列出。修改即时生效并写入审计。", "Hint text for the platform admin roster editor, used to explain that the env bootstrap floor always applies and that roster edits take effect immediately and are audited."); }
  static backfillsTitle(fbs: FbsAPI) { return fbs("一次性回填工具", "Section title for the one-off backfill tools on the platform admin page, used above the reminder-identity, creator-stamp and guide-migration actions."); }
  static saveLabel(fbs: FbsAPI) { return fbs("保存", "Button label for saving on the platform admin page, used on the settings, reminder, heirloom and roster save actions."); }
  static testLabel(fbs: FbsAPI) { return fbs("发送测试", "Button label for webhook test sends on the platform admin page, used on the reminder and heirloom test actions."); }
  static runLabel(fbs: FbsAPI) { return fbs("执行", "Button label for running a backfill on the platform admin page, used on the one-off tool actions."); }
  static dryRunLabel(fbs: FbsAPI) { return fbs("仅试运行（不写库）", "Checkbox label for dry-run mode on the platform admin page, used beside backfill actions to report without writing."); }
  static deleteTenantLabel(fbs: FbsAPI) { return fbs("删除百业", "Button label for deleting a guild on the platform admin page, used on the destructive per-tenant action."); }
  static grantLabel(fbs: FbsAPI) { return fbs("授予", "Button label for granting Premium on the platform admin page, used on the per-guild manual entitlement grant action."); }
  static revokeLabel(fbs: FbsAPI) { return fbs("撤销", "Button label for revoking Premium on the platform admin page, used on the per-guild manual entitlement revoke action."); }
  static subdomainLabel(fbs: FbsAPI) { return fbs("平台子域名", "Label text for the platform subdomain switch on the platform admin page, used beside the per-guild subdomain enable toggle."); }
  static customDomainLabel(fbs: FbsAPI) { return fbs("自定义域名", "Label text for the custom domain row on the platform admin page, used beside the bound hostname and its disable switch."); }
  static enabledText(fbs: FbsAPI) { return fbs("已启用", "Status text for an enabled switch on the platform admin page, used for reminder, heirloom and subdomain states."); }
  static disabledText(fbs: FbsAPI) { return fbs("已禁用", "Status text for a disabled switch on the platform admin page, used for reminder, heirloom, subdomain and custom-domain states."); }
  static webhookSetText(fbs: FbsAPI) { return fbs("Webhook 已配置", "Status text for webhook state on the platform admin page, used when a guild has a reminder or heirloom webhook on file (the full URL is never shown)."); }
  static webhookUnsetText(fbs: FbsAPI) { return fbs("Webhook 未配置", "Status text for webhook state on the platform admin page, used when a guild has no reminder or heirloom webhook on file."); }
  static runBackupLabel(fbs: FbsAPI) { return fbs("立即备份", "Button label for running a backup now on the platform admin page, used on the manual snapshot action."); }
  static downloadLabel(fbs: FbsAPI) { return fbs("下载", "Button label for downloading a backup file on the platform admin page, used beside each snapshot row."); }
  static exportLabel(fbs: FbsAPI) { return fbs("导出备份 JSON", "Button label for the streaming backup export on the platform admin page, used on the action that downloads a full JSON snapshot of the database."); }
  static backfillReminderIdentityLabel(fbs: FbsAPI) { return fbs("回填提醒身份（名册+座位戳）", "Button label for the reminder identity backfill on the platform admin page, used on the tool that seeds rosters and stamps signup seats with Discord IDs."); }
  static backfillCreatorsLabel(fbs: FbsAPI) { return fbs("回填车头身份戳", "Button label for the creator stamp backfill on the platform admin page, used on the tool that backfills creator Discord IDs for legacy squads."); }
  static migrateBossGuidesLabel(fbs: FbsAPI) { return fbs("结构化首领攻略（从攻略文本生成）", "Button label for the boss guide structured migration on the platform admin page, used on the tool that parses guide text into structured mechanics, talents and shouts."); }
  static statusOpenText(fbs: FbsAPI) { return fbs("待处理", "Status text for an open feedback item on the platform admin page, used in the feedback triage list."); }
  static statusResolvedText(fbs: FbsAPI) { return fbs("已解决", "Status text for a resolved feedback item on the platform admin page, used in the feedback triage list."); }
  static lastStatusLabel(fbs: FbsAPI) { return fbs("最近状态", "Label text for the last push status on the platform admin page, used in the reminder and heirloom config rows."); }
  static nextAlarmLabel(fbs: FbsAPI) { return fbs("下次提醒", "Label text for the next reminder alarm on the platform admin page, used in the reminder config rows."); }
  static periodEndLabel(fbs: FbsAPI) { return fbs("周期结束", "Label text for the entitlement period end on the platform admin page, used in the per-guild billing rows."); }
  static sourceLabel(fbs: FbsAPI) { return fbs("来源", "Label text for the entitlement source on the platform admin page, used in the per-guild billing rows to show whether the grant came from Stripe, a manual grant or a trial."); }
  static tierLabel(fbs: FbsAPI) { return fbs("档位", "Label text for the Premium tier on the platform admin page, used in the pricing catalog and the per-guild billing rows."); }
  static planLabel(fbs: FbsAPI) { return fbs("方案", "Label text for the Premium plan on the platform admin page, used in the per-guild billing rows."); }
  static hasCardText(fbs: FbsAPI) { return fbs("已绑卡", "Status text for the payment method state on the platform admin page, used when a guild has a card on file."); }
  static noCardText(fbs: FbsAPI) { return fbs("未绑卡", "Status text for the payment method state on the platform admin page, used when a guild has no card on file."); }
  static trialUsedText(fbs: FbsAPI) { return fbs("已用试用", "Status text for the trial state on the platform admin page, used when a guild has consumed its free trial."); }
}
