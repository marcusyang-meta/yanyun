/* fbtee declaration surface for the platform domain (hand-maintained): this
 * domain's UI-copy declarations, one entry = one fbs call. A string's
 * identity is the declaration itself (domain + export name); the desc
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
 * codegen extracts the entry statements only.
 */
import type { FbsAPI } from 'fbtee/server';

export type StringParams = Record<string, unknown>;

function pv(p: StringParams | undefined, name: string): string {
  const v = p ? p[name] : undefined;
  return v === undefined ? '{' + name + '}' : String(v);
}

export const common_cancel = (fbs: FbsAPI) =>fbs("取消", "Cancel button label used in dialogs and forms across the app.");
export const common_confirm = (fbs: FbsAPI) =>fbs("确定", "Confirm button label used in dialogs and confirmation prompts across the app.");
export const common_unknownError = (fbs: FbsAPI) =>fbs("未知错误", "Fallback error message shown when an operation fails without a specific error code.");
export const common_renderError = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["渲染出错: ", fbs.param("message", pv(p, "message"))], "Error boundary heading shown when a page section fails to render; {message} is the caught error message.");
export const common_renderErrorHint = (fbs: FbsAPI) =>fbs("这一页出了问题，其他页面不受影响。", "Reassurance line under the render-error heading, telling the user other pages are unaffected.");
export const common_backToHub = (fbs: FbsAPI) =>fbs("返回百业集结", "Link label that returns the user to the guild hub (the guild picker home).");
export const common_loadingGuild = (fbs: FbsAPI) =>fbs("正在展开百业…", "Loading placeholder text shown while a guild page is being loaded.");
export const common_close = (fbs: FbsAPI) =>fbs("关闭", "Close button label for dialogs and dismissible panels.");
export const appBlocks_rosterTitle = (fbs: FbsAPI) =>fbs("队伍名册", "Title of the roster block in a server-composed grouping page, listing the squad seats and members.");
export const appBlocks_closedStatus = (fbs: FbsAPI) =>fbs("已关闭", "Status label in server-composed blocks for a grouping that has been closed.");
export const appBlocks_completedStatus = (fbs: FbsAPI) =>fbs("已完成", "Status label in server-composed blocks for a grouping that has been completed.");
export const appBlocks_unknownBlock = (fbs: FbsAPI) =>fbs("该内容需要更新 App 后显示", "Fallback text shown by older app versions when a server-composed block type is not recognized.");
export const legal_termsTitle = (fbs: FbsAPI) =>fbs("服务条款", "Title of the terms of service page.");
export const legal_privacyTitle = (fbs: FbsAPI) =>fbs("隐私政策", "Title of the privacy policy page.");
export const legal_termsLink = (fbs: FbsAPI) =>fbs("服务条款", "Footer link label leading to the terms of service page.");
export const legal_privacyLink = (fbs: FbsAPI) =>fbs("隐私政策", "Footer link label leading to the privacy policy page.");
export const legal_updatedText = (fbs: FbsAPI) =>fbs("最后更新：2026 年 10 月 25 日", "Last-updated date line shown at the top of the legal pages.");
export const legal_disclaimer = (fbs: FbsAPI) =>fbs("本站为玩家自发维护的非官方工具，与《燕云十六声》及其开发、发行方无隶属或背书关系；游戏名称与相关素材的权利归其各自权利方所有。", "Disclaimer shown on legal pages and the site footer: the site is an unofficial fan-made tool with no affiliation to the game or its publisher.");
export const termsBody_s1h = (fbs: FbsAPI) =>fbs("关于本站与非官方声明", "Heading of section 1 of the terms of service page.");
export const termsBody_s1b = (fbs: FbsAPI) =>fbs("燕云百业（yanyun.app）是一个由玩家自发维护的非官方百业（公会）组队工具，与《燕云十六声》及其开发、发行方没有任何隶属或背书关系。本站中出现的游戏名称、副本、流派等资料，其权利归各自权利方所有。", "Body text of section 1 of the terms of service page.");
export const termsBody_s2h = (fbs: FbsAPI) =>fbs("账号与访问", "Heading of section 2 of the terms of service page.");
export const termsBody_s2b = (fbs: FbsAPI) =>fbs("本站通过 Discord OAuth 登录。使用本站即表示你同意本条款。你应妥善保管自己的 Discord 账号，通过你的账号进行的操作视为你本人行为。各百业内容的可见与可写范围，由你是否属于该百业绑定的 Discord 服务器决定。", "Body text of section 2 of the terms of service page.");
export const termsBody_s3h = (fbs: FbsAPI) =>fbs("使用规范", "Heading of section 3 of the terms of service page.");
export const termsBody_s3b = (fbs: FbsAPI) =>fbs("不得利用本站冒充他人或其它百业、抢注或占用与你无关的百业标识、发布违法或侵权内容、干扰本站运行，或绕过成员校验。车队标题、报名昵称等由用户发布的内容，由发布者自行负责。", "Body text of section 3 of the terms of service page.");
export const termsBody_s4h = (fbs: FbsAPI) =>fbs("服务现状", "Heading of section 4 of the terms of service page.");
export const termsBody_s4b = (fbs: FbsAPI) =>fbs("本站目前免费提供，并按现状（as is）运行。我们不承诺服务持续可用、功能保持不变，或数据永不丢失；功能可能被调整、中断或终止，原则上不另行通知。重要数据请自行留存备份。", "Body text of section 4 of the terms of service page.");
export const termsBody_s5h = (fbs: FbsAPI) =>fbs("责任限制", "Heading of section 5 of the terms of service page.");
export const termsBody_s5b = (fbs: FbsAPI) =>fbs("在适用法律允许的最大范围内，本站对因使用或无法使用本站而产生的间接、附带或后果性损失不承担责任。", "Body text of section 5 of the terms of service page.");
export const termsBody_s6h = (fbs: FbsAPI) =>fbs("条款变更", "Heading of section 6 of the terms of service page.");
export const termsBody_s6b = (fbs: FbsAPI) =>fbs("本条款可能不时更新，更新后的版本在本站公布即生效；你继续使用本站即视为接受更新后的条款。", "Body text of section 6 of the terms of service page.");
export const privacyBody_s1h = (fbs: FbsAPI) =>fbs("我们收集的信息", "Heading of section 1 of the privacy policy page.");
export const privacyBody_s1b = (fbs: FbsAPI) =>fbs("当你使用 Discord 登录时，我们会读取并保存：你的 Discord 用户 ID、用户名与头像、你加入的 Discord 服务器列表、你在这些服务器中的昵称，以及用于保持登录状态的 OAuth 授权凭据（refresh token）。你在使用本站过程中产生的数据也会被保存，包括百业名册记录、车队与报名记录（包括座位上的身份标识）、装备库与配装方案、语言偏好，以及你在移动端开启通知后注册的推送令牌。", "Body text of section 1 of the privacy policy page.");
export const privacyBody_s2h = (fbs: FbsAPI) =>fbs("我们如何使用信息", "Heading of section 2 of the privacy policy page.");
export const privacyBody_s2b = (fbs: FbsAPI) =>fbs("上述信息仅用于：登录与身份识别；校验你是否为某百业所绑定 Discord 服务器的成员；组队报名；发车提醒与应用推送；传家宝达成推送；以及按你的偏好显示语言。我们不出售你的个人数据，也不将其用于广告投放。", "Body text of section 2 of the privacy policy page.");
export const privacyBody_s3h = (fbs: FbsAPI) =>fbs("信息的共享与第三方", "Heading of section 3 of the privacy policy page.");
export const privacyBody_s3b = (fbs: FbsAPI) =>fbs("本站运行在 Cloudflare 的基础设施上，数据存储于其数据库服务；登录与成员校验由 Discord 提供；移动端推送经 Expo 推送服务转发至 Apple 或 Google 的推送通道。发车提醒与传家宝消息会发送到对应百业管理员配置的 Discord 频道，消息中会包含你的游戏昵称。除上述功能所必需的情形外，我们不会向其他第三方提供你的个人数据（法律法规要求除外）。", "Body text of section 3 of the privacy policy page.");
export const privacyBody_s4h = (fbs: FbsAPI) =>fbs("保存期限", "Heading of section 4 of the privacy policy page.");
export const privacyBody_s4b = (fbs: FbsAPI) =>fbs("你的数据保存在本站数据库中，直至你申请删除，或相关数据对本站功能不再需要为止。报名、车队等历史记录目前会持续保留；如保存规则发生变化，我们会更新本政策。", "Body text of section 4 of the privacy policy page.");
export const privacyBody_s5h = (fbs: FbsAPI) =>fbs("你的权利", "Heading of section 5 of the privacy policy page.");
export const privacyBody_s5b = (fbs: FbsAPI) =>fbs("你可以查询、导出或删除你的个人数据。在「个人资料」的「我的数据」中，你可以自助导出你的全部数据（需通过 Discord 重新验证身份，每 24 小时一次），也可以自助删除账号：提交删除后有 7 天冷静期，期间可随时撤销；到期后你的个人数据会被删除或匿名化——你创建的车队会转为无主车队、你在他人车队中的座位会被匿名化，备份中的副本最迟在 14 天内随每日备份轮换清除。你也可以随时在 Discord 的设置中断开本站的授权；授权失效后，你在本站的会话会自动作废。", "Body text of section 5 of the privacy policy page.");
export const privacyBody_s6h = (fbs: FbsAPI) =>fbs("联系我们", "Heading of section 6 of the privacy policy page.");
export const privacyBody_s6b = (fbs: FbsAPI) =>fbs("如对本政策有疑问，或需提出查询、更正、删除申请，请通过本站社区百业「叽哩呱啦」的 Discord 服务器联系管理员。我们会先核实你的 Discord 账号身份，再处理你的申请。", "Body text of section 6 of the privacy policy page.");
export const errors_rateLimited = (fbs: FbsAPI) =>fbs("操作过于频繁, 请稍后再试", "Error returned when a user performs an operation too frequently and hits the general rate limit.");
export const errors_createRateLimited = (fbs: FbsAPI) =>fbs("创建太频繁, 请稍后再试", "Error returned when guild or squad creation is attempted too frequently.");
export const errors_guildNotFound = (fbs: FbsAPI) =>fbs("百业不存在", "Error returned when an operation references a guild that does not exist.");
export const errors_gearNotFound = (fbs: FbsAPI) =>fbs("装备不存在或不属于你", "Error returned when a gear item does not exist or does not belong to the requesting user.");
export const errors_gearEmptyBuild = (fbs: FbsAPI) =>fbs("搭配为空", "Error returned when saving or sharing a gear build that contains no gear.");
export const errors_gearCapacityReached = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["装备库已满（上限 ", fbs.param("limit", pv(p, "limit")), " 件），删掉不用的装备后再添加"], "Error returned when the gear library is full; {limit} is the maximum number of items.");
export const errors_gearImportOverflow = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["本批 ", fbs.param("n", pv(p, "n")), " 件会让装备库达到 ", fbs.param("total", pv(p, "total")), " 件，超过上限 ", fbs.param("limit", pv(p, "limit")), " 件，整批未导入"], "Error returned when a batch import would exceed the gear library capacity, rejecting the whole batch; {n} is the batch size, {total} the resulting count and {limit} the capacity.");
export const errors_gearOcrBatchTooLarge = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["单批最多识别 ", fbs.param("limit", pv(p, "limit")), " 张截图，本批有 ", fbs.param("n", pv(p, "n")), " 张，请分批导入"], "Error returned when one OCR import batch contains too many screenshots; {limit} is the per-batch maximum and {n} the actual count.");
export const errors_gearOcrDailyLimit = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["今天的批量识别次数已达上限（", fbs.param("limit", pv(p, "limit")), " 批），明天再试"], "Error returned when the daily OCR batch quota is exhausted; {limit} is the number of batches allowed per day.");
export const errors_loginRequired = (fbs: FbsAPI) =>fbs("请先登录 Discord 后再操作", "Error returned when an operation requires a signed-in Discord account.");
export const errors_loginRequiredShort = (fbs: FbsAPI) =>fbs("请先登录 Discord", "Short variant of the login-required error, used where space is tight.");
export const errors_localeUnsupported = (fbs: FbsAPI) =>fbs("不支持的语言", "Error returned when an unsupported interface language is submitted.");
export const errors_pushTokenInvalid = (fbs: FbsAPI) =>fbs("推送令牌无效", "Error returned when a push token submitted for registration is invalid.");
export const errors_guildUnboundWrite = (fbs: FbsAPI) =>fbs("该百业尚未绑定 Discord 服务器，写功能已锁定", "Error returned on a write to a guild that has not bound a Discord server yet; writes are locked until binding.");
export const errors_memberOnly = (fbs: FbsAPI) =>fbs("只有该百业 Discord 服务器的成员可以操作", "Error returned when a non-member of the guild's Discord server attempts a member-only write.");
export const errors_memberOnlyView = (fbs: FbsAPI) =>fbs("该百业仅对 Discord 服务器成员开放", "Error returned when a non-member of the guild's Discord server attempts to view member-only guild content.");
export const errors_titleRequired = (fbs: FbsAPI) =>fbs("请填写标题", "Error returned when a squad is submitted without a title.");
export const errors_badStartTime = (fbs: FbsAPI) =>fbs("请选择有效的出发时间", "Error returned when a squad's departure time is invalid or in the past.");
export const errors_startTimeTooFar = (fbs: FbsAPI) =>fbs("出发时间不能超过 60 天后", "Error returned when a squad's departure time is more than sixty days ahead.");
export const errors_groupingNotFound = (fbs: FbsAPI) =>fbs("组队不存在", "Error returned when an operation references a squad that does not exist.");
export const errors_officialEvent = (fbs: FbsAPI) =>fbs("官方活动请联系管理员", "Error returned when a user tries to act on an official event squad, which only admins may manage.");
export const errors_noCreatorRecorded = (fbs: FbsAPI) =>fbs("该车队未记录车头，无法解散，请联系管理员处理", "Error returned when disbanding a legacy squad that has no recorded leader.");
export const errors_leaderOnlyDisband = (fbs: FbsAPI) =>fbs("只有车头可以解散车队", "Error returned when someone other than the squad leader or a guild admin tries to disband a squad.");
export const errors_noCreatorRecordedEdit = (fbs: FbsAPI) =>fbs("该车队未记录车头，无法编辑，请联系管理员处理", "Error returned when editing a legacy squad that has no recorded leader.");
export const errors_leaderOnlyEdit = (fbs: FbsAPI) =>fbs("只有车头可以编辑车队", "Error returned when someone other than the squad leader or a guild admin tries to edit a squad.");
export const errors_noCreatorRecordedComplete = (fbs: FbsAPI) =>fbs("该车队未记录车头，无法完成，请联系管理员处理", "Error returned when completing a legacy squad that has no recorded leader.");
export const errors_leaderOnlyComplete = (fbs: FbsAPI) =>fbs("只有车头可以完成车队", "Error returned when someone other than the squad leader or a guild admin tries to complete a squad.");
export const errors_noCreatorRecordedReopen = (fbs: FbsAPI) =>fbs("该车队未记录车头，无法恢复，请联系管理员处理", "Error returned when restoring a legacy squad that has no recorded leader.");
export const errors_leaderOnlyReopen = (fbs: FbsAPI) =>fbs("只有车头可以恢复车队", "Error returned when someone other than the squad leader or a guild admin tries to restore a completed squad.");
export const errors_groupingAlreadyCompleted = (fbs: FbsAPI) =>fbs("该车队已是完成状态", "Error returned when completing a squad that is already completed.");
export const errors_groupingNotCompleted = (fbs: FbsAPI) =>fbs("该车队尚未完成", "Error returned when restoring a squad that is not in the completed state.");
export const errors_groupingClosed = (fbs: FbsAPI) =>fbs("该组队已截止报名", "Error returned when signing up for a squad whose signup deadline has passed.");
export const errors_nicknameRequired = (fbs: FbsAPI) =>fbs("请填写游戏昵称", "Error returned when a signup or squad is submitted without a game nickname.");
export const errors_proxyTargetNotInRoster = (fbs: FbsAPI) =>fbs("所选成员不在本百业名册中", "Error returned when a proxy signup picks a member who is not on the guild roster.");
export const errors_groupingFull = (fbs: FbsAPI) =>fbs("名额已满或报名已截止", "Error returned when signing up for a squad that is full or whose signup has closed.");
export const errors_lastSeatHealer = (fbs: FbsAPI) =>fbs("最后一个名额需要奶", "Error returned when the last remaining seat of a squad must be filled by a healer and the signup is not one.");
export const errors_alreadyJoined = (fbs: FbsAPI) =>fbs("已报过名", "Error returned when a member signs up for a squad they already sit in.");
export const errors_seatNotFound = (fbs: FbsAPI) =>fbs("未找到该报名", "Error returned when an operation references a signup seat that does not exist.");
export const errors_notSeated = (fbs: FbsAPI) =>fbs("你还没有落座这辆车", "Error returned when a member acts on a squad they have not signed up for, such as toggling ready state.");
export const errors_reminderOffsetsInvalid = (fbs: FbsAPI) =>fbs("提醒提前量不在可选范围内", "Error returned when reminder lead times submitted in guild settings are outside the allowed set.");
export const errors_ogAccentInvalid = (fbs: FbsAPI) =>fbs("强调色不在可选范围内", "Error returned when an OG image accent color outside the allowed palette is submitted in guild settings.");
export const errors_paramsIncomplete = (fbs: FbsAPI) =>fbs("参数不完整", "Generic error returned when a request is missing required parameters.");
export const errors_bossNotFound = (fbs: FbsAPI) =>fbs("首领不存在", "Error returned when an operation references a boss that does not exist.");
export const errors_guildNameShort = (fbs: FbsAPI) =>fbs("百业名称至少 2 个字", "Error returned when a guild name is shorter than two characters.");
export const errors_avatarTooLarge = (fbs: FbsAPI) =>fbs("头像图片不能超过 400KB", "Error returned when an uploaded guild avatar image exceeds 400 KB.");
export const errors_avatarBadType = (fbs: FbsAPI) =>fbs("头像只支持 PNG、JPEG 或 WebP 图片", "Error returned when an uploaded guild avatar is not a PNG, JPEG or WebP image.");
export const errors_avatarEmpty = (fbs: FbsAPI) =>fbs("没有收到图片数据", "Error returned when a guild avatar upload carries no image data.");
export const errors_slugInvalid = (fbs: FbsAPI) =>fbs("站点地址只能用小写字母/数字/连字符, 2-40 位", "Error returned when a guild slug violates the format rules: lowercase letters, digits and hyphens, two to forty characters.");
export const errors_slugReserved = (fbs: FbsAPI) =>fbs("该地址为保留字, 请换一个", "Error returned when a guild slug is a reserved word.");
export const errors_slugTaken = (fbs: FbsAPI) =>fbs("该地址已被占用, 请换一个", "Error returned when a guild slug is already in use.");
export const errors_serverRequired = (fbs: FbsAPI) =>fbs("请选择要绑定的 Discord 服务器", "Error returned when creating or binding a guild without choosing a Discord server.");
export const errors_notInServer = (fbs: FbsAPI) =>fbs("你不在这个 Discord 服务器中", "Error returned when the user is not a member of the Discord server involved in the operation.");
export const errors_cannotManageServer = (fbs: FbsAPI) =>fbs("你需要在该 Discord 服务器拥有管理员或「管理服务器」权限才能绑定它", "Error returned when binding a Discord server the user cannot manage: administrator or Manage Server permission is required.");
export const errors_adminOnly = (fbs: FbsAPI) =>fbs("只有所绑服务器的管理员可以执行此操作", "Error returned when a non-admin of the bound Discord server attempts a guild admin operation.");
export const errors_webhookInvalid = (fbs: FbsAPI) =>fbs("Webhook 地址格式不正确", "Error returned when a Discord webhook URL submitted in guild settings is malformed.");
export const errors_discordIdInvalid = (fbs: FbsAPI) =>fbs("Discord 服务器 ID 格式不正确", "Error returned when a Discord server ID submitted in guild settings is malformed.");
export const errors_noFieldsToUpdate = (fbs: FbsAPI) =>fbs("没有可更新的字段", "Error returned when an update request contains no fields to change.");
export const errors_signupNotFound = (fbs: FbsAPI) =>fbs("未找到该报名记录", "Error returned when an operation references a signup record that does not exist.");
export const errors_resultNotFound = (fbs: FbsAPI) =>fbs("未找到该成绩", "Error returned when an operation references a racing result record that does not exist.");
export const errors_resultTeamRequired = (fbs: FbsAPI) =>fbs("缺少队伍名", "Error returned when a racing result is submitted without a team name.");
export const errors_resultTimeInvalid = (fbs: FbsAPI) =>fbs("用时格式不正确（如 12:34.567）", "Error returned when a racing result time does not match the expected minutes, seconds and milliseconds format.");
export const errors_avatarDataInvalid = (fbs: FbsAPI) =>fbs("图片数据无效", "Error returned when uploaded avatar image data cannot be decoded.");
export const errors_schoolRequired = (fbs: FbsAPI) =>fbs("缺少流派", "Error returned when a signup or gear entry is submitted without a sect (school).");
export const errors_generic = (fbs: FbsAPI) =>fbs("操作失败，请稍后再试", "Generic fallback error returned when an operation fails without a more specific cause.");
export const errors_templateNotFound = (fbs: FbsAPI) =>fbs("模板不存在", "Error returned when an operation references a squad template that does not exist.");
export const errors_templateNameRequired = (fbs: FbsAPI) =>fbs("请填写模板名", "Error returned when a squad template is saved without a name.");
export const errors_templateForbidden = (fbs: FbsAPI) =>fbs("只有模板创建者或百业管理员可以改删模板", "Error returned when someone other than the template creator or a guild admin tries to modify or delete a template.");
export const errors_templateBadStart = (fbs: FbsAPI) =>fbs("发车时间设置无效", "Error returned when a squad template's departure time setting is invalid.");
export const errors_accountReauthRequired = (fbs: FbsAPI) =>fbs("请先通过 Discord 重新验证身份", "Error returned when a sensitive account operation is attempted without a fresh Discord re-verification.");
export const errors_accountExportRateLimited = (fbs: FbsAPI) =>fbs("每 24 小时只能导出一次数据，请稍后再试", "Error returned when account data export is requested more than once in twenty-four hours.");
export const errors_accountUsernameMismatch = (fbs: FbsAPI) =>fbs("输入的显示名与你的账号不一致", "Error returned when the Discord display name typed to confirm account deletion does not match the account.");
export const errors_accountDeletionPending = (fbs: FbsAPI) =>fbs("已有一份删除申请在冷静期中", "Error returned when submitting an account deletion while another deletion is already in its cooling-off period.");
export const errors_accountDeletionNotPending = (fbs: FbsAPI) =>fbs("当前没有待执行的删除申请", "Error returned when cancelling an account deletion while none is pending.");
export const errors_premiumRequired = (fbs: FbsAPI) =>fbs("该功能需要开通 Premium", "Error returned when a guild without an active premium tier uses a premium feature.");
export const errors_premiumComingSoon = (fbs: FbsAPI) =>fbs("Premium 开通即将开放", "Error returned when premium checkout is attempted before premium signups open.");
export const errors_premiumActive = (fbs: FbsAPI) =>fbs("本百业已开通 Premium", "Error returned when starting a premium checkout for a guild that already has premium.");
export const errors_paygateDisabled = (fbs: FbsAPI) =>fbs("收费功能尚未开启", "Error returned when a paid feature is used while the platform-wide paygate switch is off.");
export const errors_checkoutFailed = (fbs: FbsAPI) =>fbs("创建支付会话失败，请稍后再试", "Error returned when creating a payment checkout session fails.");
export const errors_rosterImportEmpty = (fbs: FbsAPI) =>fbs("没有收到任何识别文本，请重新截图后再试", "Error returned when roster OCR import receives no recognized text, asking the user to retake the screenshot.");
export const errors_rosterBatchNotFound = (fbs: FbsAPI) =>fbs("导入预览不存在或已失效，请重新识别", "Error returned when confirming a roster import preview that does not exist or has expired.");
export const errors_rosterBatchConfirmed = (fbs: FbsAPI) =>fbs("这份预览已经确认导入过了", "Error returned when confirming a roster import preview that was already confirmed.");
export const errors_rosterNoImportableRows = (fbs: FbsAPI) =>fbs("没有勾选任何可导入的新名", "Error returned when confirming a roster import with no new importable rows selected.");
export const errors_rosterEntryNotFound = (fbs: FbsAPI) =>fbs("名册记录不存在", "Error returned when an operation references a roster entry that does not exist.");
export const errors_checklistItemUnknown = (fbs: FbsAPI) =>fbs("检查条目不存在", "Error returned when an operation references an onboarding checklist item that does not exist.");
export const errors_feedbackEmpty = (fbs: FbsAPI) =>fbs("反馈内容不能为空", "Error returned when feedback is submitted with an empty body.");
export const errors_feedbackTooLong = (fbs: FbsAPI) =>fbs("反馈内容太长，请精简到 2000 字以内", "Error returned when feedback exceeds the two-thousand character limit.");
export const errors_feedbackRateLimited = (fbs: FbsAPI) =>fbs("今天提交的反馈已达上限，请明天再来", "Error returned when the daily feedback submission quota is exhausted.");
export const errors_announcementTitleRequired = (fbs: FbsAPI) =>fbs("请填写公告标题", "Error returned when an announcement is posted without a title.");
export const errors_announcementTitleTooLong = (fbs: FbsAPI) =>fbs("公告标题太长，请精简到 80 字以内", "Error returned when an announcement title exceeds eighty characters.");
export const errors_announcementBodyTooLong = (fbs: FbsAPI) =>fbs("公告正文太长，请精简到 2000 字以内", "Error returned when an announcement body exceeds two thousand characters.");
export const errors_announcementNotFound = (fbs: FbsAPI) =>fbs("公告不存在", "Error returned when an operation references an announcement that does not exist.");
export const errors_announcementDailyLimit = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["今天的公告已达上限（每天 ", fbs.param("limit", pv(p, "limit")), " 条），明天再发"], "Error returned when the daily announcement quota is exhausted; {limit} is the number allowed per day.");
export const errors_urgentCallDailyLimit = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["今天的紧急集合呼叫已达上限（每天 ", fbs.param("limit", pv(p, "limit")), " 次），明天再试"], "Error returned when the daily urgent muster call quota is exhausted; {limit} is the number allowed per day.");
export const errors_lotteryTitleRequired = (fbs: FbsAPI) =>fbs("请填写抽奖标题", "Error returned when a lottery is created without a title.");
export const errors_lotteryEntriesEmpty = (fbs: FbsAPI) =>fbs("参与名单为空，请先选择参与者", "Error returned when a lottery is created with no participants chosen.");
export const errors_lotteryNotFound = (fbs: FbsAPI) =>fbs("抽奖不存在", "Error returned when an operation references a lottery that does not exist.");
export const errors_lotteryAlreadyDrawn = (fbs: FbsAPI) =>fbs("该抽奖已经开过奖了", "Error returned when drawing a lottery that has already been drawn.");
export const errors_lotteryWinnerCountInvalid = (fbs: FbsAPI) =>fbs("中奖人数必须在 1 与参与人数之间", "Error returned when a lottery's winner count is not between one and the participant count.");
export const errors_lotteryWeightInvalid = (fbs: FbsAPI) =>fbs("权重必须是 1 到 1000 之间的整数", "Error returned when a lottery participant weight is not an integer between 1 and 1000.");
export const errors_lotteryMemberNotInGuild = (fbs: FbsAPI) =>fbs("所选成员不在本百业名册中", "Error returned when a lottery participant is not on the guild roster.");
export const errors_availabilitySlotInvalid = (fbs: FbsAPI) =>fbs("可用时段不合法", "Error returned when a member availability slot is malformed, such as overlapping or out-of-range times.");
export const errors_availabilityTooManySlots = (fbs: FbsAPI) =>fbs("可用时段太多（最多 21 个）", "Error returned when a member submits more than twenty-one availability slots.");
export const errors_pollTitleRequired = (fbs: FbsAPI) =>fbs("请填写投票标题", "Error returned when a time poll is created without a title.");
export const errors_pollOptionsInvalid = (fbs: FbsAPI) =>fbs("候选时间不合法（需 2–8 个不同的未来时间）", "Error returned when a time poll's candidate times are invalid: two to eight distinct future times are required.");
export const errors_pollNotFound = (fbs: FbsAPI) =>fbs("投票不存在", "Error returned when an operation references a time poll that does not exist.");
export const errors_pollClosed = (fbs: FbsAPI) =>fbs("该投票已关闭", "Error returned when voting in a time poll that is already closed.");
export const errors_pollOptionInvalid = (fbs: FbsAPI) =>fbs("所选时间不属于该投票", "Error returned when a vote selects a time that is not one of the poll's candidates.");
export const errors_pollForbidden = (fbs: FbsAPI) =>fbs("只有发起人或百业管理员可以关闭投票", "Error returned when someone other than the poll creator or a guild admin tries to close a time poll.");
export const errors_customFieldInvalid = (fbs: FbsAPI) =>fbs("自定义字段不合法", "Error returned when a custom signup field definition on a squad is malformed.");
export const errors_customFieldTooMany = (fbs: FbsAPI) =>fbs("自定义字段最多 5 个", "Error returned when a squad defines more than five custom signup fields.");
export const errors_signupAnswerRequired = (fbs: FbsAPI) =>fbs("请填写必填的报名信息", "Error returned when a signup omits a required custom signup field answer.");
export const errors_signupAnswerInvalid = (fbs: FbsAPI) =>fbs("报名信息不合法", "Error returned when a custom signup field answer is invalid, such as a choice outside the field's options.");
export const errors_applicationPending = (fbs: FbsAPI) =>fbs("你已有一份待审核的申请，请等待审核结果", "Error returned when a user submits a join application while another one is still pending review.");
export const errors_alreadyMember = (fbs: FbsAPI) =>fbs("你已经是这个百业的成员了", "Error returned when a guild member tries to submit a join application to their own guild.");
export const errors_recruitUnavailable = (fbs: FbsAPI) =>fbs("该百业尚未绑定 Discord 服务器，暂不开放招新申请", "Error returned when applying to a guild that has not bound a Discord server yet, where applications are closed.");
export const errors_applicationNotFound = (fbs: FbsAPI) =>fbs("申请不存在", "Error returned when an operation references a join application that does not exist.");
export const errors_applicationNotPending = (fbs: FbsAPI) =>fbs("该申请已经审核过了", "Error returned when reviewing a join application that has already been decided.");
export const errors_mentorNotDesignated = (fbs: FbsAPI) =>fbs("所选导师不在本百业导师人选中，请先设为导师", "Error returned when creating a pairing with a mentor who is not in the guild's mentor pool.");
export const errors_mentorNotInGuild = (fbs: FbsAPI) =>fbs("所选导师不在本百业名册中", "Error returned when creating a pairing with a mentor who is not on the guild roster.");
export const errors_menteeNotInGuild = (fbs: FbsAPI) =>fbs("所选新人不在本百业名册中", "Error returned when creating a pairing with a newcomer who is not on the guild roster.");
export const errors_menteeAlreadyPaired = (fbs: FbsAPI) =>fbs("该新人已有一段进行中的配对，请先结束它再改配", "Error returned when creating a pairing for a newcomer who already has an active pairing.");
export const errors_mentorSelfPairing = (fbs: FbsAPI) =>fbs("导师和新人不能是同一个人", "Error returned when creating a pairing where mentor and newcomer are the same person.");
export const errors_pairingNotFound = (fbs: FbsAPI) =>fbs("配对不存在", "Error returned when an operation references a mentor pairing that does not exist.");
export const errors_pairingAlreadyEnded = (fbs: FbsAPI) =>fbs("该配对已经结束了", "Error returned when ending a mentor pairing that has already ended.");
export const errors_officerNoteBodyRequired = (fbs: FbsAPI) =>fbs("请填写备注内容", "Error returned when an officer note is saved with an empty body.");
export const errors_officerNoteBodyTooLong = (fbs: FbsAPI) =>fbs("备注太长，请精简到 500 字以内", "Error returned when an officer note exceeds five hundred characters.");
export const errors_officerNoteNotFound = (fbs: FbsAPI) =>fbs("备注不存在", "Error returned when an operation references an officer note that does not exist.");
export const errors_officerMemberNotFound = (fbs: FbsAPI) =>fbs("该成员不在本百业名册中", "Error returned when an officer note targets a member who is not on the guild roster.");
export const errors_seasonGoalTitleRequired = (fbs: FbsAPI) =>fbs("请填写目标", "Error returned when a season goal is saved without a title.");
export const errors_seasonGoalTitleTooLong = (fbs: FbsAPI) =>fbs("目标太长，请精简到 80 字以内", "Error returned when a season goal title exceeds eighty characters.");
export const errors_seasonGoalNoteTooLong = (fbs: FbsAPI) =>fbs("进度备注太长，请精简到 500 字以内", "Error returned when a season goal progress note exceeds five hundred characters.");
export const errors_seasonGoalNotFound = (fbs: FbsAPI) =>fbs("目标不存在", "Error returned when an operation references a season goal that does not exist.");
export const errors_seasonGoalDungeonNotFound = (fbs: FbsAPI) =>fbs("关联的副本不存在", "Error returned when a season goal links a dungeon that does not exist.");
