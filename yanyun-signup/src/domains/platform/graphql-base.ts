/* GraphQL 框架基座 (三期域拆分, platform 域): shell 基类与文案生成器、
 * 访问判定 (getGuildAccess) 与发布/闸门helper、payload 基类。域 GraphQL
 * 模块直接引本文件 (框架内引用, 不经 barrel), 域间服务仍走 barrel。 */
import { translate, negotiateLocale, SUPPORTED_LOCALES, CATALOG } from './i18n.ts';
import { getSettingValue, setSettingValue, listSettingsByKey } from '../guilds/settings.ts';
import { getTenantRow, getTenantSlug, listTenantSlugs, listTenantsDirectory } from '../guilds/tenants.ts';
import { listGuildMembers, getGuildMember } from '../identity/guildMembers.ts';
import { getUsernameRow, getUserLocalePref } from '../identity/users.ts';
import { getLatestDungeonVersion } from '../dex/dungeons.ts';
import { getUserServers, getGuildNick, maybeRefreshGuildNicks } from '../../auth.js';

export { negotiateLocale };
/* ================= Shell 架构 (2026-10-24 用户定型) =================
 * 每个 GraphQL shell 都是 class: 实例只携带 ctx (env/请求/用户/locale/
 * 请求级 memo) + 自身源数据 (id/行/access 结论)。每个字段由该 class
 * 自己的 gen 方法按需生成 — resolver 仅在字段被选中时调对应 gen 方法,
 * 未选中字段零成本 (不查库、不查文案目录、不做插值)。同请求内重复
 * 访问走实例 memo。UI 文案字段直接长在 shell 类型上 (schema 里没有
 * 任何 Strings 类型), gen 方法从 src/i18n.js 目录按 locale 取文案。
 * ctx.locale 由 worker.js 按 x-locale 请求头协商后注入。 */
export class ShellBase {
  ctx: any;
  data: any;
  _memo: Map<string, any>;
  constructor(ctx: any, data: any){
    this.ctx = ctx;
    this.data = data || {};
    this._memo = new Map();
  }
  get db() { return this.ctx.env.DB; }
  get locale() { return this.ctx.locale || 'zh-CN'; }
  t(...args: any[]){ return translate(args[0], args[1], this.locale, args[2]); }
  memo(key: any, producer: any){
    if (!this._memo.has(key)) this._memo.set(key, producer());
    return this._memo.get(key);
  }
  // 请求级 memo (跨 shell 共享, 如 gameVersion 查询): 挂在 ctx 上
  ctxMemo(key: any, producer: any){
    const store = this.ctx._memo || (this.ctx._memo = new Map());
    if (!store.has(key)) store.set(key, producer());
    return store.get(key);
  }
}

/* 文案 gen 方法批量定义: spec = [字段名, 目录 section, 目录 field, 参数函数?]
 * 在类原型上生成 gen<字段名> 方法 (实例 memo: 同请求同参数只生成一次),
 * 并返回该类型的字段 resolver 表 — 字段未被选中时 resolver 不跑、gen
 * 方法不调、文案不生成。 */
export function defineTextGens(Class: any, spec: any) {
  const resolvers: Record<string, any> = {};
  for (const [field, section, catField, paramsFn] of spec) {
    const genName = 'gen' + field[0].toUpperCase() + field.slice(1);
    Class.prototype[genName] = function (args: any) {
      const key = genName + ':' + JSON.stringify(args || {});
      return this.memo(key, () => this.t(section, catField, paramsFn ? paramsFn(args || {}) : undefined));
    };
    resolvers[field] = (p: any, args: any) => p[genName](args);
  }
  return resolvers;
}


// 账号级语言偏好 (请求内 memo, 多个 shell 共用一次查询): users.locale_pref,
// null = 自动 (跟随浏览器); worker 已据此算出 ctx.locale (偏好压过请求头)。
export function loadMyLocalePref(ctx: any) {
  const store = ctx._memo || (ctx._memo = new Map());
  if (!store.has('myLocalePref')) {
    store.set('myLocalePref', (async () => {
      if (!ctx.user) return null;
      return getUserLocalePref(ctx.env.DB, ctx.user.discordId).catch(() => null);
    })());
  }
  return store.get('myLocalePref');
}

// 服务端错误文案: 按稳定 code + 请求 locale 从目录生成 (payload.error 的内容)
export function errText(ctx: any, code: any) {
  return translate('errors', code, (ctx && ctx.locale) || 'zh-CN');
}

/* ================= 租户隔离 & 访问控制 =================
 * 公共游戏数据 (无需鉴权, 只读): dexPage, bossPage, sectPage, tiaolvPage,
 *   slotAffixList, affixMaxList, calcTiaolv, calcGraduation
 * 百业数据 (viewer 层级 + 扁平兼容查询同规则):
 *   - 未绑定 Discord 服务器的百业: 内容公开可读, 写功能锁死
 *   - 已绑定百业: 仅绑定服务器成员可见 (canView), 非成员在 resolver 层拦截
 *   - 写操作 (create/update/delete/join/leave/updateSeatWeapon):
 *     requireWrite = 登录 (Discord 会话) + 已绑定 + 成员, 人人可管 (不分车主)
 * ctx.user 由 worker.js 从 yy_session cookie 解析注入 (src/auth.js)
 * =================================================== */

/* ---------- 租户校验 ---------- */
export async function assertTenant(db: any, slug: any) {
  const sslug = s(slug, 30);
  const t = await getTenantRow(db, sslug);
  if (!t) throw new Error('百业不存在');
  return t;
}

/* ---------- Discord 绑定 & 访问控制 (登录/成员 gate) ----------
 * 规则 (2026-10-24 用户定型):
 * - 百业未绑定 Discord 服务器: 写功能全部锁死 (canWrite=false), 内容公开可读
 * - 百业已绑定: 仅该服务器成员可见 (canView), 写 = 登录 + 绑定 + 成员
 * - ctx.user 来自 yy_session 会话 (worker.js 解析后注入), 未登录为 null */
export async function getTenantSetting(db: any, slug: any, key: any) {
  return getSettingValue(db, slug, key);
}

export async function setTenantSetting(db: any, slug: any, key: any, value: any) {
  await setSettingValue(db, slug, key, value);
}

/* ---------- dev 表面识别 (dev_only 百业可见性例外) ----------
 * dev_only 百业 (如 demo) 在生产来源一律视为不存在; 只有来自 dev 表面的
 * 请求能照常看到它: 预览站 (yanyun-web-preview) 与本地开发 (localhost/127.0.0.1)。
 * 依据请求 Origin (跨源 fetch 必带) / Referer 的 hostname 判断 —— 这是
 * 展示层 gate, 不是安全边界 (demo 本就不含真实数据)。 */
const DEV_HOSTS = new Set(['yanyun-web-preview.tbdlab.workers.dev', 'release-yanyun.tbdlab.workers.dev', 'localhost', '127.0.0.1']);
export function isDevRequest(request: any) {
  try {
    const h = (request && request.headers && (request.headers.get('origin') || request.headers.get('referer'))) || '';
    if (!h) return false;
    return DEV_HOSTS.has(new URL(h).hostname);
  } catch { return false; }
}

// user 的服务器明细 (含权限位): 优先 users 表 (登录时落库), 缺行时回退会话 gm (仅测试签发)
export async function getServersForUser(db: any, user: any) {
  if (!user) return [];
  const rows = await getUserServers(db, user.discordId);
  if (rows) return rows;
  if (Array.isArray(user.guildsMeta)) {
    return user.guildsMeta.map((g: any) => ({
      id: String(g.i), name: String(g.i), icon: '', permissions: String(g.p ?? '0'), owner: false,
    }));
  }
  return (user.guilds || []).map((id: any) => ({ id: String(id), name: String(id), icon: '', permissions: '0', owner: false }));
}

export function serverCanManage(sv: any) {
  if (!sv) return false;
  if (sv.owner) return true;
  try {
    const p = BigInt(String(sv.permissions || '0'));
    return (p & 0x8n) !== 0n || (p & 0x20n) !== 0n; // Administrator | ManageGuild
  } catch { return false; }
}

// export: worker.js 的 /ws/guild/:slug 订阅路由复用同一份访问判定,
// 不许另抄一份成员规则 (权限单点真相)。
export async function getGuildAccess(db: any, user: any, slug: any, request: any): Promise<any> {
  const t = await getTenantRow(db, s(slug, 40));
  if (!t) return { exists: false, slug, bound: false, isMember: false, canView: false, canWrite: false, tenant: null, discordGuildId: '' };
  // dev_only 百业: 非 dev 表面来源一律按不存在处理 (列表自然过滤, 直达走 Locked/不存在)
  const devOnly = (await getTenantSetting(db, t.slug, 'dev_only')) === '1';
  if (devOnly && !isDevRequest(request)) {
    return { exists: false, slug, bound: false, isMember: false, canView: false, canWrite: false, tenant: null, discordGuildId: '', devOnly: true };
  }
  const dgid = await getTenantSetting(db, t.slug, 'discord_guild_id');
  const bound = !!dgid;
  const isMember = !!(user && bound && (user.guilds || []).includes(dgid));
  return {
    exists: true,
    slug: t.slug,
    tenant: t,
    discordGuildId: dgid,
    bound,
    isMember,
    devOnly,
    canView: !bound || isMember,
    canWrite: !!(user && bound && isMember),
  };
}

// 成员限定页面的拦截文案走目录 (errors.memberOnlyView), 按请求 locale 生成

/* ---------- 实时推送 (GuildHub DO) ----------
 * mutation 在 D1 落库成功后调用: 把最小事件 {slug, groupingId, kind} 发给
 * 该百业的 GuildHub 实例广播。事件不带业务数据, 客户端收到后走 GraphQL
 * 重查 (权限仍以 resolver 为准)。推送是尽力而为: 失败静默, 绝不影响
 * mutation 本身的结果; 客户端还有重连 resync 兜底, 不会因丢事件分叉。 */
export function publishGroupingEvent(ctx: any, slug: any, groupingId: any, kind: any) {
  try {
    const hub = ctx && ctx.env && ctx.env.GUILD_HUB;
    if (!hub || !slug) return;
    const stub = hub.get(hub.idFromName('guild:' + slug));
    const p = stub.fetch('https://guild-hub/publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, groupingId: String(groupingId), kind }),
    }).then(() => {}).catch(() => {});
    // 开车提醒重排: 增删改都可能改变下一提醒时刻, 催促 GuildHub 现查 D1
    // 重排 alarm (seats 不影响时刻, 不催)。同样尽力而为, 失败静默。
    if (kind === 'created' || kind === 'updated' || kind === 'deleted') {
      const p2 = stub.fetch('https://guild-hub/nudge', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      }).then(() => {}).catch(() => {});
      if (ctx.executionCtx && typeof ctx.executionCtx.waitUntil === 'function') {
        ctx.executionCtx.waitUntil(p2);
      }
    }
    if (ctx.executionCtx && typeof ctx.executionCtx.waitUntil === 'function') {
      ctx.executionCtx.waitUntil(p);
    }
  } catch { /* 推送故障不影响写操作 */ }
}

// 写操作 gate: 通过返回 null, 拒绝返回稳定错误码 (文案由 payload
// shell 的 genError 按 locale 从目录生成, 不在此处写死任何语言)
export async function requireWrite(db: any, user: any, slug: any, request: any) {
  const a = await getGuildAccess(db, user, slug, request);
  if (!a.exists) return 'guildNotFound';
  if (!user) return 'loginRequired';
  if (!a.bound) return 'guildUnboundWrite';
  if (!a.isMember) return 'memberOnly';
  return null;
}

// 百业结果: __typename 即权限结论 (Guild=成员完整 / GuildReadOnly=未绑只读 /
// GuildLocked=非成员或不存在, 不带任何内容数据)。GuildShell 实例携带
// access 结论, 字段由其 gen 方法按需解析 (见下方类定义)。
export async function sha256hexLocal(str: any) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(d)].map((b: any) => b.toString(16).padStart(2, '0')).join('');
}

/* ---------- 简单限流 (内存, 按 IP+操作) ---------- */
// 目标: 防刷 mutations, 非精确限流. Worker 实例内有效.
const _rl = new Map(); // key -> { count, resetAt }
export function rateLimitGql(key: any, max: any = 20, windowMs: any = 60000) {
  const now = Date.now();
  const e = _rl.get(key);
  if (!e || now > e.resetAt) {
    _rl.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  e.count++;
  // 防止内存无限增长, 定期清理
  if (_rl.size > 10000) {
    for (const [k, v] of _rl) { if (now > v.resetAt) _rl.delete(k); }
  }
  return e.count <= max;
}
export function getClientIp(request: any) {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

/* ---------- 禁用 introspection 插件 ---------- */
// 用户要求: 不在前端暴露太多 API 结构. 生产环境默认禁用 __schema/__type.
const DISABLE_INTROSPECTION = true; // 设为 false 可在开发时启用
export const noIntrospectionPlugin = {
  onParse({ params }: any){
    if (!DISABLE_INTROSPECTION) return;
    const src = params.source?.toString() || params.query || '';
    // 注意: 不能简单 includes('__type') — '__typename' 以 '__type' 开头会被误杀,
    // 而 Relay 对 union/interface 分发必须用 __typename (它只暴露类型名, 非结构信息)。
    if (/__(schema|type)(?![a-zA-Z0-9_])/.test(src)) {
      throw new Error('Introspection 已禁用');
    }
  },
};

/* ---------- 小工具 (与 worker.js 保持一致, 不复用其内部函数) ---------- */
export const s = (v: any, max: any = 200) => String(v ?? '').trim().slice(0, max);
export const roleOf = (weapon: any) => (s(weapon, 40) === '牵丝·霖' ? '奶' : '输出');
export const newUid = () => 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const TAB_TO_TYPE: Record<string, string> = { ACTIVITY: 'activity', TALENT: 'talent', RACE: 'race', TOWER: 'tower' };
export const TYPE_TO_ENUM: Record<string, string> = { activity: 'ACTIVITY', talent: 'TALENT', race: 'RACE', tower: 'TOWER' };
export const GUILD_TABS = ['双十人本', '天赋组队', '竞速报名', '攻略', '流派攻略'];

// 调律满值常量 (与 Excel/记忆一致, 服务端下发)
export async function getGameVersion(db: any) {
  return (await getSettingValue(db, '', 'game_version')) || 'intl-v2.3';
}

// 当期版本码 (如 intl-v2.3): 与 dungeons.version 同一命名空间, 供当期/往期分类比较。
// 注意与 game_version 区分: 后者是展示串 (如「国际服 V2.3「青州」(10月15日上线)」, 用于页头),
// 不能拿来和 dungeons.version 做相等比较 (2026-10-24 踩过: dexPage 因此恒为空)。
// 取值顺序: settings.game_version_code 显式配置 > 从 dungeons 推导 > 默认 intl-v2.3。
// 推导规则: 当期 tier 是唯一的非 legacy 版本码 (新副本监控 cron 轮换时新 tier 打新码、
// 旧 tier 降为 legacy), 取含最新 dungeon 的那个码, 轮换后自动跟随、无需改 settings。
export async function getCurrentVersionCode(db: any) {
  const configured = await getSettingValue(db, '', 'game_version_code');
  if (configured) return configured;
  try {
    const derived = await getLatestDungeonVersion(db);
    if (derived) return derived;
  } catch { /* 用默认值 */ }
  return 'intl-v2.3';
}

/* ---------- 实体 shell: Grouping / Dungeon / Boss ----------
 * 标量字段直接读行数据 (零成本), 关联字段 (seats/dungeon/bosses/结构化
 * 攻略) 在 gen 方法里惰性查库并 memo — 未选中的关联永不查询。Seat 的
 * role 展示串在此按 locale 生成 (DB 里的 奶/输出 是数据口径值, join 的
 * 奶位校验读 DB 列, 不受展示本地化影响)。 */
export class PayloadBase extends ShellBase {
  genOk(){ return !!this.data.ok; }
  genError(){ return this.data.errorCode ? errText(this.ctx, this.data.errorCode) : null; }
  genErrorCode(){ return this.data.errorCode || null; }
}
export class GroupingPayloadShell extends PayloadBase {
  genGrouping(){ return this.data.grouping || null; }
}
export class SeatPayloadShell extends PayloadBase {
  genSeats(){ return this.data.seats || null; }
}
export class DeletePayloadShell extends PayloadBase {}
export class CreateGuildPayloadShell extends PayloadBase {
  genGuild(){ return this.data.guild || null; }
}
export class UpdateLocalePayloadShell extends PayloadBase {
  genLocalePref(){ return this.data.localePref ?? null; }
  genEffectiveLocale(){ return this.data.effectiveLocale || 'zh-CN'; }
}
export const uFail = (ctx: any, code: any, effectiveLocale: any) => new UpdateLocalePayloadShell(ctx, {
  ok: false, errorCode: code, localePref: undefined, effectiveLocale,
});
export const gFail = (ctx: any, code: any) => new GroupingPayloadShell(ctx, { ok: false, errorCode: code });
export const sFail = (ctx: any, code: any) => new SeatPayloadShell(ctx, { ok: false, errorCode: code });
export const dFail = (ctx: any, code: any) => new DeletePayloadShell(ctx, { ok: false, errorCode: code });
export const cFail = (ctx: any, code: any) => new CreateGuildPayloadShell(ctx, { ok: false, errorCode: code });

/* ================= Resolvers ================= */
