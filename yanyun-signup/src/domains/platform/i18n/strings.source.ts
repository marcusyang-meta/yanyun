/* fbtee declaration surface for the platform domain (hand-maintained): this
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

export const common_cancel = (fbs: FbsAPI) =>fbs("取消", "common.cancel");
export const common_confirm = (fbs: FbsAPI) =>fbs("确定", "common.confirm");
export const common_unknownError = (fbs: FbsAPI) =>fbs("未知错误", "common.unknownError");
export const common_renderError = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["渲染出错: ", fbs.param("message", pv(p, "message"))], "common.renderError");
export const common_renderErrorHint = (fbs: FbsAPI) =>fbs("这一页出了问题，其他页面不受影响。", "common.renderErrorHint");
export const common_backToHub = (fbs: FbsAPI) =>fbs("返回百业集结", "common.backToHub");
export const common_loadingGuild = (fbs: FbsAPI) =>fbs("正在展开百业…", "common.loadingGuild");
export const common_close = (fbs: FbsAPI) =>fbs("关闭", "common.close");
export const appBlocks_rosterTitle = (fbs: FbsAPI) =>fbs("队伍名册", "appBlocks.rosterTitle");
export const appBlocks_closedStatus = (fbs: FbsAPI) =>fbs("已关闭", "appBlocks.closedStatus");
export const appBlocks_completedStatus = (fbs: FbsAPI) =>fbs("已完成", "appBlocks.completedStatus");
export const appBlocks_unknownBlock = (fbs: FbsAPI) =>fbs("该内容需要更新 App 后显示", "appBlocks.unknownBlock");
export const legal_termsTitle = (fbs: FbsAPI) =>fbs("服务条款", "legal.termsTitle");
export const legal_privacyTitle = (fbs: FbsAPI) =>fbs("隐私政策", "legal.privacyTitle");
export const legal_termsLink = (fbs: FbsAPI) =>fbs("服务条款", "legal.termsLink");
export const legal_privacyLink = (fbs: FbsAPI) =>fbs("隐私政策", "legal.privacyLink");
export const legal_updatedText = (fbs: FbsAPI) =>fbs("最后更新：2026 年 10 月 25 日", "legal.updatedText");
export const legal_disclaimer = (fbs: FbsAPI) =>fbs("本站为玩家自发维护的非官方工具，与《燕云十六声》及其开发、发行方无隶属或背书关系；游戏名称与相关素材的权利归其各自权利方所有。", "legal.disclaimer");
export const termsBody_s1h = (fbs: FbsAPI) =>fbs("关于本站与非官方声明", "termsBody.s1h");
export const termsBody_s1b = (fbs: FbsAPI) =>fbs("燕云百业（yanyun.app）是一个由玩家自发维护的非官方百业（公会）组队工具，与《燕云十六声》及其开发、发行方没有任何隶属或背书关系。本站中出现的游戏名称、副本、流派等资料，其权利归各自权利方所有。", "termsBody.s1b");
export const termsBody_s2h = (fbs: FbsAPI) =>fbs("账号与访问", "termsBody.s2h");
export const termsBody_s2b = (fbs: FbsAPI) =>fbs("本站通过 Discord OAuth 登录。使用本站即表示你同意本条款。你应妥善保管自己的 Discord 账号，通过你的账号进行的操作视为你本人行为。各百业内容的可见与可写范围，由你是否属于该百业绑定的 Discord 服务器决定。", "termsBody.s2b");
export const termsBody_s3h = (fbs: FbsAPI) =>fbs("使用规范", "termsBody.s3h");
export const termsBody_s3b = (fbs: FbsAPI) =>fbs("不得利用本站冒充他人或其它百业、抢注或占用与你无关的百业标识、发布违法或侵权内容、干扰本站运行，或绕过成员校验。车队标题、报名昵称等由用户发布的内容，由发布者自行负责。", "termsBody.s3b");
export const termsBody_s4h = (fbs: FbsAPI) =>fbs("服务现状", "termsBody.s4h");
export const termsBody_s4b = (fbs: FbsAPI) =>fbs("本站目前免费提供，并按现状（as is）运行。我们不承诺服务持续可用、功能保持不变，或数据永不丢失；功能可能被调整、中断或终止，原则上不另行通知。重要数据请自行留存备份。", "termsBody.s4b");
export const termsBody_s5h = (fbs: FbsAPI) =>fbs("责任限制", "termsBody.s5h");
export const termsBody_s5b = (fbs: FbsAPI) =>fbs("在适用法律允许的最大范围内，本站对因使用或无法使用本站而产生的间接、附带或后果性损失不承担责任。", "termsBody.s5b");
export const termsBody_s6h = (fbs: FbsAPI) =>fbs("条款变更", "termsBody.s6h");
export const termsBody_s6b = (fbs: FbsAPI) =>fbs("本条款可能不时更新，更新后的版本在本站公布即生效；你继续使用本站即视为接受更新后的条款。", "termsBody.s6b");
export const privacyBody_s1h = (fbs: FbsAPI) =>fbs("我们收集的信息", "privacyBody.s1h");
export const privacyBody_s1b = (fbs: FbsAPI) =>fbs("当你使用 Discord 登录时，我们会读取并保存：你的 Discord 用户 ID、用户名与头像、你加入的 Discord 服务器列表、你在这些服务器中的昵称，以及用于保持登录状态的 OAuth 授权凭据（refresh token）。你在使用本站过程中产生的数据也会被保存，包括百业名册记录、车队与报名记录（包括座位上的身份标识）、装备库与配装方案、语言偏好，以及你在移动端开启通知后注册的推送令牌。", "privacyBody.s1b");
export const privacyBody_s2h = (fbs: FbsAPI) =>fbs("我们如何使用信息", "privacyBody.s2h");
export const privacyBody_s2b = (fbs: FbsAPI) =>fbs("上述信息仅用于：登录与身份识别；校验你是否为某百业所绑定 Discord 服务器的成员；组队报名；发车提醒与应用推送；传家宝达成推送；以及按你的偏好显示语言。我们不出售你的个人数据，也不将其用于广告投放。", "privacyBody.s2b");
export const privacyBody_s3h = (fbs: FbsAPI) =>fbs("信息的共享与第三方", "privacyBody.s3h");
export const privacyBody_s3b = (fbs: FbsAPI) =>fbs("本站运行在 Cloudflare 的基础设施上，数据存储于其数据库服务；登录与成员校验由 Discord 提供；移动端推送经 Expo 推送服务转发至 Apple 或 Google 的推送通道。发车提醒与传家宝消息会发送到对应百业管理员配置的 Discord 频道，消息中会包含你的游戏昵称。除上述功能所必需的情形外，我们不会向其他第三方提供你的个人数据（法律法规要求除外）。", "privacyBody.s3b");
export const privacyBody_s4h = (fbs: FbsAPI) =>fbs("保存期限", "privacyBody.s4h");
export const privacyBody_s4b = (fbs: FbsAPI) =>fbs("你的数据保存在本站数据库中，直至你申请删除，或相关数据对本站功能不再需要为止。报名、车队等历史记录目前会持续保留；如保存规则发生变化，我们会更新本政策。", "privacyBody.s4b");
export const privacyBody_s5h = (fbs: FbsAPI) =>fbs("你的权利", "privacyBody.s5h");
export const privacyBody_s5b = (fbs: FbsAPI) =>fbs("你可以查询、导出或删除你的个人数据。在「个人资料」的「我的数据」中，你可以自助导出你的全部数据（需通过 Discord 重新验证身份，每 24 小时一次），也可以自助删除账号：提交删除后有 7 天冷静期，期间可随时撤销；到期后你的个人数据会被删除或匿名化——你创建的车队会转为无主车队、你在他人车队中的座位会被匿名化，备份中的副本最迟在 14 天内随每日备份轮换清除。你也可以随时在 Discord 的设置中断开本站的授权；授权失效后，你在本站的会话会自动作废。", "privacyBody.s5b");
export const privacyBody_s6h = (fbs: FbsAPI) =>fbs("联系我们", "privacyBody.s6h");
export const privacyBody_s6b = (fbs: FbsAPI) =>fbs("如对本政策有疑问，或需提出查询、更正、删除申请，请通过本站社区百业「叽哩呱啦」的 Discord 服务器联系管理员。我们会先核实你的 Discord 账号身份，再处理你的申请。", "privacyBody.s6b");
export const errors_rateLimited = (fbs: FbsAPI) =>fbs("操作过于频繁, 请稍后再试", "errors.rateLimited");
export const errors_createRateLimited = (fbs: FbsAPI) =>fbs("创建太频繁, 请稍后再试", "errors.createRateLimited");
export const errors_guildNotFound = (fbs: FbsAPI) =>fbs("百业不存在", "errors.guildNotFound");
export const errors_gearNotFound = (fbs: FbsAPI) =>fbs("装备不存在或不属于你", "errors.gearNotFound");
export const errors_gearEmptyBuild = (fbs: FbsAPI) =>fbs("搭配为空", "errors.gearEmptyBuild");
export const errors_gearCapacityReached = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["装备库已满（上限 ", fbs.param("limit", pv(p, "limit")), " 件），删掉不用的装备后再添加"], "errors.gearCapacityReached");
export const errors_gearImportOverflow = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["本批 ", fbs.param("n", pv(p, "n")), " 件会让装备库达到 ", fbs.param("total", pv(p, "total")), " 件，超过上限 ", fbs.param("limit", pv(p, "limit")), " 件，整批未导入"], "errors.gearImportOverflow");
export const errors_gearOcrBatchTooLarge = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["单批最多识别 ", fbs.param("limit", pv(p, "limit")), " 张截图，本批有 ", fbs.param("n", pv(p, "n")), " 张，请分批导入"], "errors.gearOcrBatchTooLarge");
export const errors_gearOcrDailyLimit = (fbs: FbsAPI, p?: StringParams) =>
  fbs(["今天的批量识别次数已达上限（", fbs.param("limit", pv(p, "limit")), " 批），明天再试"], "errors.gearOcrDailyLimit");
export const errors_loginRequired = (fbs: FbsAPI) =>fbs("请先登录 Discord 后再操作", "errors.loginRequired");
export const errors_loginRequiredShort = (fbs: FbsAPI) =>fbs("请先登录 Discord", "errors.loginRequiredShort");
export const errors_localeUnsupported = (fbs: FbsAPI) =>fbs("不支持的语言", "errors.localeUnsupported");
export const errors_pushTokenInvalid = (fbs: FbsAPI) =>fbs("推送令牌无效", "errors.pushTokenInvalid");
export const errors_guildUnboundWrite = (fbs: FbsAPI) =>fbs("该百业尚未绑定 Discord 服务器，写功能已锁定", "errors.guildUnboundWrite");
export const errors_memberOnly = (fbs: FbsAPI) =>fbs("只有该百业 Discord 服务器的成员可以操作", "errors.memberOnly");
export const errors_memberOnlyView = (fbs: FbsAPI) =>fbs("该百业仅对 Discord 服务器成员开放", "errors.memberOnlyView");
export const errors_titleRequired = (fbs: FbsAPI) =>fbs("请填写标题", "errors.titleRequired");
export const errors_badStartTime = (fbs: FbsAPI) =>fbs("请选择有效的出发时间", "errors.badStartTime");
export const errors_startTimeTooFar = (fbs: FbsAPI) =>fbs("出发时间不能超过 60 天后", "errors.startTimeTooFar");
export const errors_groupingNotFound = (fbs: FbsAPI) =>fbs("组队不存在", "errors.groupingNotFound");
export const errors_officialEvent = (fbs: FbsAPI) =>fbs("官方活动请联系管理员", "errors.officialEvent");
export const errors_noCreatorRecorded = (fbs: FbsAPI) =>fbs("该车队未记录车头，无法解散，请联系管理员处理", "errors.noCreatorRecorded");
export const errors_leaderOnlyDisband = (fbs: FbsAPI) =>fbs("只有车头可以解散车队", "errors.leaderOnlyDisband");
export const errors_noCreatorRecordedEdit = (fbs: FbsAPI) =>fbs("该车队未记录车头，无法编辑，请联系管理员处理", "errors.noCreatorRecordedEdit");
export const errors_leaderOnlyEdit = (fbs: FbsAPI) =>fbs("只有车头可以编辑车队", "errors.leaderOnlyEdit");
export const errors_noCreatorRecordedComplete = (fbs: FbsAPI) =>fbs("该车队未记录车头，无法完成，请联系管理员处理", "errors.noCreatorRecordedComplete");
export const errors_leaderOnlyComplete = (fbs: FbsAPI) =>fbs("只有车头可以完成车队", "errors.leaderOnlyComplete");
export const errors_noCreatorRecordedReopen = (fbs: FbsAPI) =>fbs("该车队未记录车头，无法恢复，请联系管理员处理", "errors.noCreatorRecordedReopen");
export const errors_leaderOnlyReopen = (fbs: FbsAPI) =>fbs("只有车头可以恢复车队", "errors.leaderOnlyReopen");
export const errors_groupingAlreadyCompleted = (fbs: FbsAPI) =>fbs("该车队已是完成状态", "errors.groupingAlreadyCompleted");
export const errors_groupingNotCompleted = (fbs: FbsAPI) =>fbs("该车队尚未完成", "errors.groupingNotCompleted");
export const errors_groupingClosed = (fbs: FbsAPI) =>fbs("该组队已截止报名", "errors.groupingClosed");
export const errors_nicknameRequired = (fbs: FbsAPI) =>fbs("请填写游戏昵称", "errors.nicknameRequired");
export const errors_proxyTargetNotInRoster = (fbs: FbsAPI) =>fbs("所选成员不在本百业名册中", "errors.proxyTargetNotInRoster");
export const errors_groupingFull = (fbs: FbsAPI) =>fbs("名额已满或报名已截止", "errors.groupingFull");
export const errors_lastSeatHealer = (fbs: FbsAPI) =>fbs("最后一个名额需要奶", "errors.lastSeatHealer");
export const errors_alreadyJoined = (fbs: FbsAPI) =>fbs("已报过名", "errors.alreadyJoined");
export const errors_seatNotFound = (fbs: FbsAPI) =>fbs("未找到该报名", "errors.seatNotFound");
export const errors_notSeated = (fbs: FbsAPI) =>fbs("你还没有落座这辆车", "errors.notSeated");
export const errors_reminderOffsetsInvalid = (fbs: FbsAPI) =>fbs("提醒提前量不在可选范围内", "errors.reminderOffsetsInvalid");
export const errors_ogAccentInvalid = (fbs: FbsAPI) =>fbs("强调色不在可选范围内", "errors.ogAccentInvalid");
export const errors_paramsIncomplete = (fbs: FbsAPI) =>fbs("参数不完整", "errors.paramsIncomplete");
export const errors_bossNotFound = (fbs: FbsAPI) =>fbs("首领不存在", "errors.bossNotFound");
export const errors_guildNameShort = (fbs: FbsAPI) =>fbs("百业名称至少 2 个字", "errors.guildNameShort");
export const errors_avatarTooLarge = (fbs: FbsAPI) =>fbs("头像图片不能超过 400KB", "errors.avatarTooLarge");
export const errors_avatarBadType = (fbs: FbsAPI) =>fbs("头像只支持 PNG、JPEG 或 WebP 图片", "errors.avatarBadType");
export const errors_avatarEmpty = (fbs: FbsAPI) =>fbs("没有收到图片数据", "errors.avatarEmpty");
export const errors_slugInvalid = (fbs: FbsAPI) =>fbs("站点地址只能用小写字母/数字/连字符, 2-40 位", "errors.slugInvalid");
export const errors_slugReserved = (fbs: FbsAPI) =>fbs("该地址为保留字, 请换一个", "errors.slugReserved");
export const errors_slugTaken = (fbs: FbsAPI) =>fbs("该地址已被占用, 请换一个", "errors.slugTaken");
export const errors_serverRequired = (fbs: FbsAPI) =>fbs("请选择要绑定的 Discord 服务器", "errors.serverRequired");
export const errors_notInServer = (fbs: FbsAPI) =>fbs("你不在这个 Discord 服务器中", "errors.notInServer");
export const errors_cannotManageServer = (fbs: FbsAPI) =>fbs("你需要在该 Discord 服务器拥有管理员或「管理服务器」权限才能绑定它", "errors.cannotManageServer");
export const errors_adminOnly = (fbs: FbsAPI) =>fbs("只有所绑服务器的管理员可以执行此操作", "errors.adminOnly");
export const errors_webhookInvalid = (fbs: FbsAPI) =>fbs("Webhook 地址格式不正确", "errors.webhookInvalid");
export const errors_discordIdInvalid = (fbs: FbsAPI) =>fbs("Discord 服务器 ID 格式不正确", "errors.discordIdInvalid");
export const errors_noFieldsToUpdate = (fbs: FbsAPI) =>fbs("没有可更新的字段", "errors.noFieldsToUpdate");
export const errors_signupNotFound = (fbs: FbsAPI) =>fbs("未找到该报名记录", "errors.signupNotFound");
export const errors_resultNotFound = (fbs: FbsAPI) =>fbs("未找到该成绩", "errors.resultNotFound");
export const errors_resultTeamRequired = (fbs: FbsAPI) =>fbs("缺少队伍名", "errors.resultTeamRequired");
export const errors_resultTimeInvalid = (fbs: FbsAPI) =>fbs("用时格式不正确（如 12:34.567）", "errors.resultTimeInvalid");
export const errors_avatarDataInvalid = (fbs: FbsAPI) =>fbs("图片数据无效", "errors.avatarDataInvalid");
export const errors_schoolRequired = (fbs: FbsAPI) =>fbs("缺少流派", "errors.schoolRequired");
export const errors_generic = (fbs: FbsAPI) =>fbs("操作失败，请稍后再试", "errors.generic");
export const errors_templateNotFound = (fbs: FbsAPI) =>fbs("模板不存在", "errors.templateNotFound");
export const errors_templateNameRequired = (fbs: FbsAPI) =>fbs("请填写模板名", "errors.templateNameRequired");
export const errors_templateForbidden = (fbs: FbsAPI) =>fbs("只有模板创建者或百业管理员可以改删模板", "errors.templateForbidden");
export const errors_templateBadStart = (fbs: FbsAPI) =>fbs("发车时间设置无效", "errors.templateBadStart");
export const errors_accountReauthRequired = (fbs: FbsAPI) =>fbs("请先通过 Discord 重新验证身份", "errors.accountReauthRequired");
export const errors_accountExportRateLimited = (fbs: FbsAPI) =>fbs("每 24 小时只能导出一次数据，请稍后再试", "errors.accountExportRateLimited");
export const errors_accountUsernameMismatch = (fbs: FbsAPI) =>fbs("输入的显示名与你的账号不一致", "errors.accountUsernameMismatch");
export const errors_accountDeletionPending = (fbs: FbsAPI) =>fbs("已有一份删除申请在冷静期中", "errors.accountDeletionPending");
export const errors_accountDeletionNotPending = (fbs: FbsAPI) =>fbs("当前没有待执行的删除申请", "errors.accountDeletionNotPending");
