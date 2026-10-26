// 燕云百业 GraphQL 层 (新增, 不影响现有 REST API)
// Hono 挂载: app.use('/graphql', ...) + default fetch 路由 /graphql -> app
import { createSchema, createYoga } from 'graphql-yoga';
import { typeDefs } from './graphql-schema.js';
import {
  clampBlocksVersion, substituteForVersion, weekWindowUtc, startsAtEpoch,
  fmtStartsAt, groupByLocalDay, TYPE_SHORT_KEY, HEALER_SECT,
} from './blocks.js';
import {
  clampPrimitivesVersion, primEnabled, primNav, primJoin, primEdit,
  primUncomplete, primLeave, primDisband, primComplete,
} from './prim.js';
import { tlCalculateExcel } from './tiaolv.js';
import { getUserServers, getGuildNick, maybeRefreshGuildNicks, getUserLocalePref, setUserLocalePref } from './auth.js';
import { ensureSignupDiscordColumn, ensureGuildMembersTable, upsertGuildMember } from './reminder.ts';
import { ensurePushTokensTable, isValidPushToken, savePushToken, deletePushToken } from './push.js';
import { evaluateHeirloomPushes } from './heirloompush.js';
import { translate, negotiateLocale, SUPPORTED_LOCALES, CATALOG } from './i18n.js';
import { logError } from './errorlog.js';
import { getGuildAvatarMeta, avatarPath } from './guildavatar.ts';
import { getSettingValue, setSettingValue, listSettingsByKey } from './db/repositories/settings.ts';
import {
  getTenantRow, getTenantSlug, listTenantSlugs, listTenantsDirectory, insertTenant,
} from './db/repositories/tenants.ts';
import {
  getEventRow, getEventTenant, getEventTenantCreator, listEventsByTenantType,
  insertEvent, updateEventFields, setEventStatus, deleteEventCascade,
} from './db/repositories/events.ts';
import {
  listSignupSeats, listSignupSeatsBasic, listSignupNamesStamps, getSignupCapacityStats,
  insertSignups, deleteSignupById, deleteSignupByEventUid, deleteSignupsByEvent,
  updateSignupWeaponRoleByUid,
} from './db/repositories/signups.ts';
import {
  listGearItems, insertGearItem, updateGearItemRow, deleteGearItemRow,
  listGearBuilds, insertGearBuild, deleteGearBuildRow,
} from './gearstore.ts';
import {
  GP_SLOTS, GP_GEAR_SLOTS, GP_AFFIX, GP_BUILDS, GP_SLOTS_BIG, GP_SLOTS_SMALL,
  GP_BASE_FIELDS, GP_BASE_PRESET, GP_BASE_FIELD_LABELS, GP_XINFA, GP_TALENT_ROWS,
  GP_BUILD_DINGYIN, GP_DINGYIN_LEFT, GP_DINGYIN_RIGHT_MAX, GP_BOW_JUE_VALUES,
  GP_BOW_RECOMMEND, GP_PASTE_NAME_TO_KEY, GP_NAME_TO_CLASS, GP_CLASS_LABEL,
  GP_SLOT_ALIAS, GP_OCR_EXTRA_ALIAS, GP_LEGACY_KEY, GP_SCHOOL_TAG_LIST,
  GP_DEMO_KIT, GP_DIM_ROWS, GP_QUICK_BAR_NAMES, GP_BUILD_SECT, GP_WUXUE_NAMES,
  gpTalentText, gpClassOf, gpSanitizeGearData, gpPlan, gpAutoCombine,
  gpParsePaste, gpQuickCalc,
} from './gearplanner.js';
import {
  enDungeonName, enBossName, enSectName, enBuildSchool, enAffixName,
  enAffixSys, enMartialArtName, enClassLabel, enGearSetName,
} from './en-names.js';

export { negotiateLocale };

/* ================= Shell 架构 (2026-10-24 用户定型) =================
 * 每个 GraphQL shell 都是 class: 实例只携带 ctx (env/请求/用户/locale/
 * 请求级 memo) + 自身源数据 (id/行/access 结论)。每个字段由该 class
 * 自己的 gen 方法按需生成 — resolver 仅在字段被选中时调对应 gen 方法,
 * 未选中字段零成本 (不查库、不查文案目录、不做插值)。同请求内重复
 * 访问走实例 memo。UI 文案字段直接长在 shell 类型上 (schema 里没有
 * 任何 Strings 类型), gen 方法从 src/i18n.js 目录按 locale 取文案。
 * ctx.locale 由 worker.js 按 x-locale 请求头协商后注入。 */
class ShellBase {
  constructor(ctx, data) {
    this.ctx = ctx;
    this.data = data || {};
    this._memo = new Map();
  }
  get db() { return this.ctx.env.DB; }
  get locale() { return this.ctx.locale || 'zh-CN'; }
  t(section, field, params) { return translate(section, field, this.locale, params); }
  memo(key, producer) {
    if (!this._memo.has(key)) this._memo.set(key, producer());
    return this._memo.get(key);
  }
  // 请求级 memo (跨 shell 共享, 如 gameVersion 查询): 挂在 ctx 上
  ctxMemo(key, producer) {
    const store = this.ctx._memo || (this.ctx._memo = new Map());
    if (!store.has(key)) store.set(key, producer());
    return store.get(key);
  }
}

/* 文案 gen 方法批量定义: spec = [字段名, 目录 section, 目录 field, 参数函数?]
 * 在类原型上生成 gen<字段名> 方法 (实例 memo: 同请求同参数只生成一次),
 * 并返回该类型的字段 resolver 表 — 字段未被选中时 resolver 不跑、gen
 * 方法不调、文案不生成。 */
function defineTextGens(Class, spec) {
  const resolvers = {};
  for (const [field, section, catField, paramsFn] of spec) {
    const genName = 'gen' + field[0].toUpperCase() + field.slice(1);
    Class.prototype[genName] = function (args) {
      const key = genName + ':' + JSON.stringify(args || {});
      return this.memo(key, () => this.t(section, catField, paramsFn ? paramsFn(args || {}) : undefined));
    };
    resolvers[field] = (p, args) => p[genName](args);
  }
  return resolvers;
}


// 账号级语言偏好 (请求内 memo, 多个 shell 共用一次查询): users.locale_pref,
// null = 自动 (跟随浏览器); worker 已据此算出 ctx.locale (偏好压过请求头)。
function loadMyLocalePref(ctx) {
  const store = ctx._memo || (ctx._memo = new Map());
  if (!store.has('myLocalePref')) {
    store.set('myLocalePref', (async () => {
      if (!ctx.user) return null;
      return getUserLocalePref(ctx.env, ctx.user.discordId).catch(() => null);
    })());
  }
  return store.get('myLocalePref');
}

// 服务端错误文案: 按稳定 code + 请求 locale 从目录生成 (payload.error 的内容)
function errText(ctx, code) {
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
async function assertTenant(db, slug) {
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
const CREATE_RESERVED = new Set([
  'admin', 'api', 'auth', 'hub', 'login', 'logout', 'og', 'graphql', 'create',
  'hub-admin', 'gadmin', 'index', 'bosses', 'tenants', 'onboard', 'settings',
  'events', 'static', 'assets', 'app', 'style', 'favicon', 'robots', 'www',
]);

// Settings access goes through the data layer (src/db/repositories/
// settings.ts); these local names remain for the many call sites below.
async function getTenantSetting(db, slug, key) {
  return getSettingValue(db, slug, key);
}

async function setTenantSetting(db, slug, key, value) {
  await setSettingValue(db, slug, key, value);
}

/* ---------- dev 表面识别 (dev_only 百业可见性例外) ----------
 * dev_only 百业 (如 demo) 在生产来源一律视为不存在; 只有来自 dev 表面的
 * 请求能照常看到它: 预览站 (yanyun-web-preview) 与本地开发 (localhost/127.0.0.1)。
 * 依据请求 Origin (跨源 fetch 必带) / Referer 的 hostname 判断 —— 这是
 * 展示层 gate, 不是安全边界 (demo 本就不含真实数据)。 */
const DEV_HOSTS = new Set(['yanyun-web-preview.tbdlab.workers.dev', 'release-yanyun.tbdlab.workers.dev', 'localhost', '127.0.0.1']);
function isDevRequest(request) {
  try {
    const h = (request && request.headers && (request.headers.get('origin') || request.headers.get('referer'))) || '';
    if (!h) return false;
    return DEV_HOSTS.has(new URL(h).hostname);
  } catch { return false; }
}

// user 的服务器明细 (含权限位): 优先 users 表 (登录时落库), 缺行时回退会话 gm (仅测试签发)
async function getServersForUser(db, user) {
  if (!user) return [];
  const rows = await getUserServers(db, user.discordId);
  if (rows) return rows;
  if (Array.isArray(user.guildsMeta)) {
    return user.guildsMeta.map((g) => ({
      id: String(g.i), name: String(g.i), icon: '', permissions: String(g.p ?? '0'), owner: false,
    }));
  }
  return (user.guilds || []).map((id) => ({ id: String(id), name: String(id), icon: '', permissions: '0', owner: false }));
}

function serverCanManage(sv) {
  if (!sv) return false;
  if (sv.owner) return true;
  try {
    const p = BigInt(String(sv.permissions || '0'));
    return (p & 0x8n) !== 0n || (p & 0x20n) !== 0n; // Administrator | ManageGuild
  } catch { return false; }
}

// export: worker.js 的 /ws/guild/:slug 订阅路由复用同一份访问判定,
// 不许另抄一份成员规则 (权限单点真相)。
export async function getGuildAccess(db, user, slug, request) {
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
function publishGroupingEvent(ctx, slug, groupingId, kind) {
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
async function requireWrite(db, user, slug, request) {
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
function guildResult(ctx, access) {
  return new GuildShell(ctx, access);
}

async function sha256hexLocal(str) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ---------- 简单限流 (内存, 按 IP+操作) ---------- */
// 目标: 防刷 mutations, 非精确限流. Worker 实例内有效.
const _rl = new Map(); // key -> { count, resetAt }
function rateLimit(key, max = 20, windowMs = 60000) {
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
function getClientIp(request) {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

/* ---------- 禁用 introspection 插件 ---------- */
// 用户要求: 不在前端暴露太多 API 结构. 生产环境默认禁用 __schema/__type.
const DISABLE_INTROSPECTION = true; // 设为 false 可在开发时启用
const noIntrospectionPlugin = {
  onParse({ params }) {
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
const s = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const roleOf = (weapon) => (s(weapon, 40) === '牵丝·霖' ? '奶' : '输出');
const newUid = () => 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const TAB_TO_TYPE = { ACTIVITY: 'activity', TALENT: 'talent', RACE: 'race', TOWER: 'tower' };
const TYPE_TO_ENUM = { activity: 'ACTIVITY', talent: 'TALENT', race: 'RACE', tower: 'TOWER' };
const GUILD_TABS = ['双十人本', '天赋组队', '竞速报名', '攻略', '流派攻略'];

// 调律满值常量 (与 Excel/记忆一致, 服务端下发)
const TIAOLV_MAX = { mainAttr: 88.4, outerAtk: 139.6, accuracy: 0.144, crit: 0.162, critDamage: 0.081, sectAttr: 79.2 };
// 流派权重口径 (用户亲口规则): 鸣金系会意x3, 会心流会心x3, 裂石·威无加成, 牵丝·霖治疗向
const SECT_WEIGHTS = [
  { sectSlug: 'mingjin-hong', critWeight: 1, critDamageWeight: 3 },
  { sectSlug: 'mingjin-ying', critWeight: 1, critDamageWeight: 3 },
  { sectSlug: 'lieshi-wei', critWeight: 1, critDamageWeight: 1 },
  { sectSlug: 'lieshi-jun', critWeight: 3, critDamageWeight: 1 },
  { sectSlug: 'qiansi-yu', critWeight: 3, critDamageWeight: 1 },
  { sectSlug: 'qiansi-yi', critWeight: 3, critDamageWeight: 1 },
  { sectSlug: 'pozhu-zun', critWeight: 3, critDamageWeight: 1 },
  { sectSlug: 'pozhu-yuan', critWeight: 3, critDamageWeight: 1 },
  { sectSlug: 'pozhu-chen', critWeight: 3, critDamageWeight: 1 },
  { sectSlug: 'pozhu-feng', critWeight: 3, critDamageWeight: 1 },
  { sectSlug: 'qiansi-lin', critWeight: 1, critDamageWeight: 1 },
];
const SUITS = ['飞隼', '白虹', '青衿', '素问'];

async function getGameVersion(db) {
  return (await getSettingValue(db, '', 'game_version')) || 'intl-v2.3';
}

// 当期版本码 (如 intl-v2.3): 与 dungeons.version 同一命名空间, 供当期/往期分类比较。
// 注意与 game_version 区分: 后者是展示串 (如「国际服 V2.3「青州」(10月15日上线)」, 用于页头),
// 不能拿来和 dungeons.version 做相等比较 (2026-10-24 踩过: dexPage 因此恒为空)。
// 取值顺序: settings.game_version_code 显式配置 > 从 dungeons 推导 > 默认 intl-v2.3。
// 推导规则: 当期 tier 是唯一的非 legacy 版本码 (新副本监控 cron 轮换时新 tier 打新码、
// 旧 tier 降为 legacy), 取含最新 dungeon 的那个码, 轮换后自动跟随、无需改 settings。
async function getCurrentVersionCode(db) {
  const configured = await getSettingValue(db, '', 'game_version_code');
  if (configured) return configured;
  try {
    const row = await db.prepare(
      "SELECT version FROM dungeons WHERE version IS NOT NULL AND version != '' AND version != 'legacy' GROUP BY version ORDER BY MAX(id) DESC LIMIT 1"
    ).first();
    if (row && row.version) return row.version;
  } catch { /* 用默认值 */ }
  return 'intl-v2.3';
}

/* ---------- 实体 shell: Grouping / Dungeon / Boss ----------
 * 标量字段直接读行数据 (零成本), 关联字段 (seats/dungeon/bosses/结构化
 * 攻略) 在 gen 方法里惰性查库并 memo — 未选中的关联永不查询。Seat 的
 * role 展示串在此按 locale 生成 (DB 里的 奶/输出 是数据口径值, join 的
 * 奶位校验读 DB 列, 不受展示本地化影响)。 */
class GroupingShell extends ShellBase {
  constructor(ctx, ev) { super(ctx, ev); }
  get ev() { return this.data; }
  genId() { return String(this.ev.id); }
  genTitle() { return this.ev.title; }
  genType() { return TYPE_TO_ENUM[this.ev.type] || 'ACTIVITY'; }
  genStartsAt() { return this.ev.starts_at_utc ? String(this.ev.starts_at_utc) : (this.ev.starts_at || ''); }
  genStatus() { return this.ev.status || 'open'; }
  genMaxSlots() { return this.ev.max_slots; }
  genCreatorDiscordId() { return this.ev.creator_discord_id ? String(this.ev.creator_discord_id) : null; }
  genSeatRows() {
    return this.memo('seatRows', async () => {
      return listSignupSeatsBasic(this.db, this.ev.id);
    });
  }
  genSeats() {
    return this.memo('seats', async () => {
      const rows = await this.genSeatRows();
      const seats = [];
      for (let i = 0; i < this.ev.max_slots; i++) {
        const r = rows[i];
        seats.push(r ? {
          index: i, nickname: r.nickname, weapon: enSectName(this.locale, r.weapon),
          role: r.role === '奶' || r.role === '治疗' ? this.t('seat', 'roleHealer') : this.t('seat', 'roleDps'),
          uid: r.uid, occupied: true,
        } : { index: i, nickname: null, weapon: null, role: null, uid: null, occupied: false });
      }
      return seats;
    });
  }
  genOccupiedCount() {
    return this.memo('occupiedCount', async () => (await this.genSeatRows()).length);
  }
  genDungeon() {
    return this.memo('dungeon', async () => {
      if (!this.ev.dungeon) return null;
      await ensureDungeonDexColumns(this.db);
      const d = await this.db.prepare('SELECT * FROM dungeons WHERE name = ?').bind(this.ev.dungeon).first();
      return d ? new DungeonShell(this.ctx, d) : null;
    });
  }
}

class DungeonShell extends ShellBase {
  constructor(ctx, row) { super(ctx, row); }
  get row() { return this.data; }
  genId() { return String(this.row.id); }
  genName() { return enDungeonName(this.locale, this.row.name); }
  genVersion() { return this.row.version || 'legacy'; }
  genPlayerCount() { return this.row.size; }
  genSize() { return this.row.size; }
  genSeason() { return this.row.season || null; }
  genSeasonName() { return this.row.season ? (SEASON_NAMES[this.row.season] || null) : null; }
  genCategory() { return this.row.category || null; }
  genLevel() { return (this.row.level === null || this.row.level === undefined) ? null : Number(this.row.level); }
  genBosses() {
    return this.memo('bosses', async () => {
      const { results } = await this.db.prepare(
        'SELECT id, name FROM bosses WHERE dungeon = ? ORDER BY sort_order ASC, id ASC'
      ).bind(this.row.name).all();
      return (results || []).map((b) => new BossShell(this.ctx, { id: b.id, name: b.name, dungeonShell: this }));
    });
  }
}

class BossShell extends ShellBase {
  // data: { id, name, row?(bosses 全行), dungeonShell?, dungeonName? }
  genId() { return String(this.data.id); }
  genName() { return enBossName(this.locale, this.data.name); }
  genDungeon() {
    return this.memo('dungeon', async () => {
      if (this.data.dungeonShell) return this.data.dungeonShell;
      const name = (this.data.row && this.data.row.dungeon) || this.data.dungeonName || null;
      if (!name) return null;
      await ensureDungeonDexColumns(this.db);
      const d = await this.db.prepare('SELECT * FROM dungeons WHERE name = ?').bind(name).first();
      return d ? new DungeonShell(this.ctx, d) : null;
    });
  }
  genStructured() {
    return this.memo('structured', async () => {
      let row = this.data.row || null;
      if (!row) {
        row = await this.db.prepare('SELECT * FROM bosses WHERE id = ?').bind(parseInt(this.data.id, 10) || 0).first();
      }
      return bossStructured(this.db, row);
    });
  }
  async genMechanics() { return (await this.genStructured()).mechanics; }
  async genTalents() { return (await this.genStructured()).talents; }
  async genShouts() { return (await this.genStructured()).shouts; }
}

// events 行 -> GroupingShell (mutation 返回新车时用; 字段仍惰性解析)
function toGrouping(ctx, ev) {
  return new GroupingShell(ctx, ev);
}

// 从 guide 文本解析 1-x/2-x 天赋行 (兼容真实换行与字面 \n 序列)
function parseTalents(guide) {
  const out = [];
  if (!guide) return out;
  const text = String(guide).replace(/\\n/g, '\n');
  const lines = text.split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*([12]-\d)\s+(.+?)\s*$/);
    if (m) out.push({ code: m[1], description: m[2], verified: /视频确认/.test(m[2]) });
  }
  return out;
}

// 旧前端 (public-legacy-backup/guild-app.js openBoss) 的 guide 文本拆分规则, 结构化复刻:
// - 【...】为章节头; 含"天赋"的章节不进机制视图
// - 【机制】章节内 "N.标题" 行开启一个机制条目, 后续行 (看到什么/怎么做/注意/列表) 为描述
// - 📢 行抽为喊话 (去掉 📢 与 喊话： 前缀), 不进机制描述 (旧前端也是单独渲染喊话框)
// - 【机制】之前的章节 (战前分工/核心规则/说明等) 连同其散行合并为一个条目 (标题=章节名), 不丢文本
// - 【天赋·逐条说明】内 "X-Y：..." 行为天赋; (视频确认) 标记 -> verified=true 并从文本摘除
// - 机制描述沿用旧前端清理: 去掉行内的天赋引用 (=天赋1-1 / (天赋2-1) / 天赋1-1)
export function parseGuideStructured(guide) {
  const empty = { mechanics: [], talents: [], shouts: [] };
  if (!guide) return empty;
  const text = String(guide).replace(/\\n/g, '\n');
  const lines = text.split('\n');

  // ---- 天赋: 只取 【...天赋...】且含"逐条说明"的章节 (同旧前端) ----
  const talentMap = {};
  let inTalentDetail = false;
  for (const raw of lines) {
    const t = raw.trim();
    if (/^【.*天赋.*】$/.test(t)) { inTalentDetail = t.includes('逐条说明'); continue; }
    if (inTalentDetail) {
      const m = t.match(/^([12]-[123])[：:](.+)$/);
      if (m) talentMap[m[1]] = m[2].trim();
      else if (t === '' || /^【.*】$/.test(t)) inTalentDetail = false;
    }
  }
  const talents = ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3']
    .filter((c) => talentMap[c])
    .map((c) => {
      const rawDesc = talentMap[c];
      return {
        code: c,
        description: rawDesc.replace(/[（(]\s*视频确认\s*[)）]/g, '').trim(),
        verified: /视频确认/.test(rawDesc),
      };
    });

  // ---- 机制 + 喊话 ----
  const mechanics = [];
  const shouts = [];
  const cleanLine = (l) => l.replace(/[=（(]天赋[12]-[123][)）]/g, '').replace(/天赋[12]-[123]/g, '');
  let inTalentSection = false;
  let pendingHeader = null; // 【机制】之前的章节名
  let pendingLines = [];    // 该章节的散行
  let cur = null;           // 当前机制条目 {title, lines[]}
  const flushPending = () => {
    if (pendingHeader !== null) {
      const desc = pendingLines.join('\n').trim();
      if (desc) mechanics.push({ phase: '', title: pendingHeader, description: desc });
      pendingHeader = null; pendingLines = [];
    }
  };
  const flushCur = () => {
    if (cur) {
      mechanics.push({ phase: '', title: cur.title, description: cur.lines.join('\n').trim() });
      cur = null;
    }
  };
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) continue;
    if (/^【.*】$/.test(t)) {
      if (t.includes('天赋')) { inTalentSection = true; flushCur(); continue; }
      inTalentSection = false;
      flushCur();
      if (t === '【机制】') { flushPending(); pendingHeader = null; pendingLines = []; }
      else { flushPending(); pendingHeader = t.replace(/^【|】$/g, ''); pendingLines = []; }
      continue;
    }
    if (inTalentSection) continue;
    if (t.startsWith('📢')) {
      const shout = t.replace(/^📢\s*/, '').replace(/^喊话[：:]\s*/, '');
      if (shout) shouts.push({ text: shout, copyable: true });
      continue;
    }
    if (/^\d+[.、．]/.test(t)) {
      flushPending();
      flushCur();
      cur = { title: t.replace(/^\d+[.、．]\s*/, ''), lines: [] };
      continue;
    }
    if (cur) cur.lines.push(cleanLine(t));
    else pendingLines.push(t);
  }
  flushPending();
  flushCur();
  return { mechanics, talents, shouts };
}

// bosses 结构化列 (mechanics_json/talents_json/shouts_json) 惰性补齐:
// API token 无 D1 写权限, DDL 只能由 Worker 经 binding 执行 (与 users 表同套路)
let bossColsReady = null;
export function ensureBossStructuredColumns(db) {
  if (!bossColsReady) {
    bossColsReady = (async () => {
      try {
        const { results } = await db.prepare('PRAGMA table_info(bosses)').all();
        const cols = new Set(results.map((r) => r.name));
        for (const col of ['mechanics_json', 'talents_json', 'shouts_json']) {
          if (!cols.has(col)) await db.prepare(`ALTER TABLE bosses ADD COLUMN ${col} TEXT`).run();
        }
      } catch { /* 列已存在等情况静默: 读取侧有 guide 解析兜底 */ }
    })();
  }
  return bossColsReady;
}

/* ---------- 攻略赛季/分类 (2026-10-24 用户定型) ----------
 * 游戏内分类与赛季等级档一一对应: 试锋=S1(51/56/61/66/71) 梦洄=S2(81/86)
 * 鉴心=S3(91) 铸矩=S4(96) 传薪=S5(100, 当期)。赛季展示名只有 S1 有官方
 * 中文名「出鞘之刃」(PS Blog), S2–S5 官方从未发布中文名, 用英文名;
 * 禁用国服赛季名 (节奏不同)。分类/赛季/等级全部后端下发, 前端不写死。 */
export const SEASON_NAMES = {
  S1: '出鞘之刃', S2: 'Rewind', S3: 'Seek Within', S4: 'Forge Ahead', S5: 'Ever Aflame',
};
export const DEX_CATEGORY_ORDER = ['传薪', '铸矩', '鉴心', '梦洄', '试锋'];
export const DEX_CATEGORY_SEASON = { '传薪': 'S5', '铸矩': 'S4', '鉴心': 'S3', '梦洄': 'S2', '试锋': 'S1' };

// dungeons 赛季/分类/等级列惰性补齐 (同 bosses 结构化列套路: DDL 只能由 Worker 执行)
let dungeonDexColsReady = null;
export function ensureDungeonDexColumns(db) {
  if (!dungeonDexColsReady) {
    dungeonDexColsReady = (async () => {
      try {
        const { results } = await db.prepare('PRAGMA table_info(dungeons)').all();
        const cols = new Set(results.map((r) => r.name));
        if (!cols.has('season')) await db.prepare('ALTER TABLE dungeons ADD COLUMN season TEXT').run();
        if (!cols.has('category')) await db.prepare('ALTER TABLE dungeons ADD COLUMN category TEXT').run();
        if (!cols.has('level')) await db.prepare('ALTER TABLE dungeons ADD COLUMN level INTEGER').run();
      } catch { /* 列已存在等情况静默 */ }
    })();
  }
  return dungeonDexColsReady;
}

/* ---------- 车头 (创建者) 身份列 (2026-10-24 用户裁决: 解散仅车头可为) ----------
 * events.creator_discord_id: GraphQL 发车时由会话 discord_id 写入 (权威身份)。
 * 旧车与 REST/overlay 建的车此列为空 = 未记录车头: 解散一律拒绝, 不回退
 * created_by/昵称匹配 (昵称是用户手填文本, 可冒名)。 */
let eventCreatorColReady = null;
export function ensureEventCreatorColumn(db) {
  if (!eventCreatorColReady) {
    eventCreatorColReady = (async () => {
      try {
        const { results } = await db.prepare('PRAGMA table_info(events)').all();
        const cols = new Set(results.map((r) => r.name));
        if (!cols.has('creator_discord_id')) {
          await db.prepare('ALTER TABLE events ADD COLUMN creator_discord_id TEXT').run();
        }
      } catch { /* 列已存在等情况静默 */ }
    })();
  }
  return eventCreatorColReady;
}

/* ---------- 落座身份戳 (signups.discord_id, 2026-10-24 用户裁决) ----------
 * 本人登录报名且提交昵称与本人身份一致 (表单预填值: 该百业绑定服务器的
 * 昵称快照, 或全局名) 才盖戳 = 这是本人落座, 开车提醒可精确 @。替别人
 * 报名 (昵称是别人的名字) 绝不盖戳 — 盖了会 @ 错人。拿不准就不盖,
 * 发送时还有名册/昵称唯一匹配兜底。 */
// 某 discord 用户在某服务器语境下的身份名集合 (全局名 + 该服昵称)
async function identityNamesFor(db, discordId, dgid) {
  const names = new Set();
  const u = await db.prepare('SELECT username FROM users WHERE discord_id = ?')
    .bind(String(discordId)).first().catch(() => null);
  if (u && String(u.username || '').trim()) names.add(String(u.username).trim());
  if (dgid) {
    const nick = await getGuildNick(db, String(discordId), dgid).catch(() => null);
    if (nick && String(nick).trim()) names.add(String(nick).trim());
  }
  return names;
}

// 本人落座判定: 昵称命中会话用户自己的身份名 -> 返回其 discord_id, 否则 null
async function selfStampFor(db, user, slug, nickname) {
  if (!user || !user.discordId || !nickname) return null;
  const dgid = await getTenantSetting(db, slug, 'discord_guild_id');
  const names = await identityNamesFor(db, user.discordId, dgid);
  if (user.name && String(user.name).trim()) names.add(String(user.name).trim());
  return names.has(nickname) ? String(user.discordId) : null;
}

/* ---------- 报名身份收口 (2026-10-25 用户裁决) ----------
 * 自报名落座名由服务端定: 报名者在该百业绑定服务器的 Discord 昵称
 * (user_guild_nicks 快照), 回退全局名 (users.username, 再回退会话名)。
 * 前端不再能改名, 客户端传来的昵称一律不作数 (覆盖, 不报错); 座位
 * 无条件落本人 discord_id 戳 — 旧「昵称恰等于身份名集合才盖戳」的
 * 条件盖戳就此废除 (那套只剩发车预排座位与整表编辑的保守沿用在用)。 */
async function canonicalSignupName(db, user, slug) {
  if (!user || !user.discordId) return '';
  const dgid = await getTenantSetting(db, slug, 'discord_guild_id');
  if (dgid) {
    const nick = await getGuildNick(db, String(user.discordId), dgid).catch(() => null);
    if (nick && String(nick).trim()) return String(nick).trim();
  }
  const u = await db.prepare('SELECT username FROM users WHERE discord_id = ?')
    .bind(String(user.discordId)).first().catch(() => null);
  if (u && String(u.username || '').trim()) return String(u.username).trim();
  return String(user.name || '').trim();
}

/* ---------- 百业成员名册记录 (用户进入百业时) ----------
 * 读取路径在确认可读 (canView) 后顺手把当前用户记进该百业名册
 * (guild_members): 只用登录已拿到的数据 (全局名 + 该服昵称快照), 不新增
 * 抓取。全程容错且走 waitUntil, 记录失败绝不影响页面读取; 匿名/被锁
 * (GuildLocked) 不记录。 */
function touchGuildRoster(ctx, access) {
  const run = (async () => {
    try {
      const user = ctx.user;
      if (!user || !user.discordId || !access || !access.exists || !access.canView) return;
      const db = ctx.env.DB;
      const slug = access.tenant.slug;
      const dgid = access.discordGuildId || '';
      let nick = '';
      if (dgid) {
        const n = await getGuildNick(db, user.discordId, dgid).catch(() => null);
        if (n) nick = String(n).trim();
      }
      let globalName = String(user.name || '').trim();
      const u = await db.prepare('SELECT username FROM users WHERE discord_id = ?')
        .bind(String(user.discordId)).first().catch(() => null);
      if (u && String(u.username || '').trim()) globalName = String(u.username).trim();
      await ensureGuildMembersTable(db);
      await upsertGuildMember(db, slug, user.discordId, nick, globalName);
    } catch { /* 名册记录失败静默 */ }
  })();
  if (ctx.executionCtx && typeof ctx.executionCtx.waitUntil === 'function') {
    ctx.executionCtx.waitUntil(run);
  }
  return run;
}

function parseStoredArray(text, fallback) {
  if (!text) return fallback;
  const v = parseJsonSafe(text, null);
  return Array.isArray(v) ? v : fallback;
}

// Boss 结构化数据: 优先读存储列 (由 /api/hub/bosses/migrate-structured 物化),
// 列为空时回退到对 guide 文本的同规则解析 — 两条路径输出一致
async function bossStructured(db, row) {
  if (!row) return { mechanics: [], talents: [], shouts: [] };
  await ensureBossStructuredColumns(db);
  const parsed = parseGuideStructured(row.guide);
  return {
    mechanics: parseStoredArray(row.mechanics_json, parsed.mechanics),
    talents: parseStoredArray(row.talents_json, parsed.talents),
    shouts: parseStoredArray(row.shouts_json, parsed.shouts),
  };
}

function parseJsonSafe(text, fallback) {
  try { return JSON.parse(text); } catch { return fallback; }
}

// bis_json -> BisTable (防御式映射)
// bis_json -> BisTable
// D1 格式: [["主武器（剑）","大外（初始）、大外、劲、势、剑增伤"], ["副武器（枪）","..."], ...]
// 也兼容对象格式
function toBisTable(bisJson) {
  const raw = parseJsonSafe(bisJson, null);
  const split = (v) => (v == null ? [] : String(v).split('、').map((x) => x.trim()).filter(Boolean));
  if (Array.isArray(raw)) {
    const find = (re) => {
      for (const p of raw) {
        if (Array.isArray(p) && p.length >= 2 && re.test(String(p[0]))) return split(p[1]);
      }
      return [];
    };
    return {
      mainWeapon: find(/主武器/),
      offWeapon: find(/副武器/),
      accessories: find(/环|佩/),
      headBody: find(/头|衣/),
      legsWrists: find(/腿|腕/),
    };
  }
  const b = raw && typeof raw === 'object' ? raw : {};
  const arr = (v) => (Array.isArray(v) ? v.map(String) : []);
  const pick = (...keys) => {
    for (const k of keys) if (b[k] !== undefined) return arr(b[k]);
    return [];
  };
  return {
    mainWeapon: pick('mainWeapon', '主武器', 'main'),
    offWeapon: pick('offWeapon', '副武器', 'off'),
    accessories: pick('accessories', '环佩', 'acc'),
    headBody: pick('headBody', '头衣', 'head'),
    legsWrists: pick('legsWrists', '腿腕', 'legs'),
  };
}

// rotation_json -> Rotation
// D1 格式: [["1分钟木桩轴","..."],["核心机制","..."],["循环","..."],["流派","..."],["视频","..."]]
// 也兼容 {greydust, opener, loop, keyPoints, innerSkills, videoUrl} 对象格式
function toRotation(rotJson) {
  const raw = parseJsonSafe(rotJson, null);
  const str = (v) => (v == null ? null : String(v));
  let pairs = {};
  if (Array.isArray(raw)) {
    for (const p of raw) {
      if (Array.isArray(p) && p.length >= 2) pairs[String(p[0])] = String(p[1]);
    }
  } else if (raw && typeof raw === 'object') {
    pairs = raw;
  }
  const get = (...keys) => {
    for (const k of keys) if (pairs[k] != null) return str(pairs[k]);
    return null;
  };
  return {
    greydust: get('1分钟木桩轴', 'greydust', '1分钟轴', 'axis'),
    opener: get('起手', 'opener'),
    loop: get('循环', 'loop'),
    keyPoints: get('核心机制', '要点', 'keyPoints'),
    innerSkills: get('心法', 'innerSkills'),
    videoUrl: get('视频', 'videoUrl', 'video'),
  };
}

/* ---------- Bloks-lite 积木/动作 shell (移动端内容区) ----------
 * 每个积木/动作都是 shell 类: 只携 ctx + 源数据, 字段由各自 gen 方法
 * 惰性生成 (文案经 i18n 目录按 locale; 时间经 blocks.js 同口径格式器)。
 * 组合发生在页面 shell 的 genBlocks: 服务端组合什么对象就是权限与
 * 分发决定 — 车头的树才有解散 ActionButtonBlock, 本人座位才有
 * LeaveAction; 客户端只按 __typename 分发渲染, 零权限分支。 */
class BlockShell extends ShellBase {
  constructor(ctx, typename, data) {
    super(ctx, data);
    this.__typename = typename;
    this._children = (data && data.children) || [];
    this._action = (data && data.action) || null;
  }
  genChildren() { return this._children; }
  genAction() { return this._action; }
}

class SectionBlockShell extends BlockShell {
  constructor(ctx, data) { super(ctx, 'SectionBlock', data); }
  genTitle() { return this.data.titleRef ? this.t(...this.data.titleRef) : (this.data.title ?? null); }
}
class SectionHeaderBlockShell extends BlockShell {
  constructor(ctx, data) { super(ctx, 'SectionHeaderBlock', data); }
  genText() { return this.data.textRef ? this.t(...this.data.textRef) : this.data.text; }
}
class TextBlockShell extends BlockShell {
  constructor(ctx, data) { super(ctx, 'TextBlock', data); }
  genText() {
    if (this.data.textRef) return this.t(...this.data.textRef);
    if (this.data.variant === 'meta') {
      const parts = [];
      if (this.data.epoch != null) parts.push(fmtStartsAt(this.data.epoch, this.locale, this.ctx.tz));
      parts.push(this.t('groupingDetail', 'people', { occupied: this.data.occupied, max: this.data.max }));
      return parts.join(' · ');
    }
    return this.data.text;
  }
  genVariant() { return this.data.variant || 'body'; }
}
class BannerBlockShell extends BlockShell {
  constructor(ctx, data) { super(ctx, 'BannerBlock', data); }
  genText() { return this.data.text; }
}
class ChipRowBlockShell extends BlockShell {
  constructor(ctx, data) { super(ctx, 'ChipRowBlock', data); }
  genChips() {
    const chips = [this.t('groupingType', TYPE_SHORT_KEY[this.data.evType] || 'shortActivity')];
    if (this.data.dungeonName) chips.push(enDungeonName(this.locale, this.data.dungeonName));
    chips.push(this.data.status === 'open' ? this.t('groupingDetail', 'statusOpen')
      : this.data.status === 'completed' ? this.t('appBlocks', 'completedStatus')
      : this.t('appBlocks', 'closedStatus'));
    return chips;
  }
}
class GroupingCardBlockShell extends BlockShell {
  constructor(ctx, data) { super(ctx, 'GroupingCardBlock', data); }
  get g() { return this.data.g; }
  genGroupingId() { return this.g.genId(); }
  genTitle() { return this.g.genTitle(); }
  genBadgeText() { return this.t('groupingType', TYPE_SHORT_KEY[this.g.ev.type] || 'shortActivity'); }
  genTimeText() {
    const ts = startsAtEpoch(this.g.ev);
    return ts != null ? fmtStartsAt(ts, this.locale, this.ctx.tz) : '';
  }
  genDungeonName() { return enDungeonName(this.locale, this.g.ev.dungeon || null); }
  genPeopleText() { return this.t('groupingList', 'people', { occupied: this.data.occupied, max: this.g.ev.max_slots }); }
  genStatusText() {
    return this.g.ev.status === 'open' ? this.t('groupingList', 'statusOpen')
      : this.g.ev.status === 'completed' ? this.t('appBlocks', 'completedStatus')
      : this.t('appBlocks', 'closedStatus');
  }
}
class SeatEntryShell extends ShellBase {
  // data: { row|null, index, ev, access } — 动作按观看者在此生成
  genIndex() { return this.data.index; }
  genOccupied() { return !!this.data.row; }
  genNickname() { return this.data.row ? this.data.row.nickname : null; }
  genWeapon() { return this.data.row ? enSectName(this.locale, this.data.row.weapon) : null; }
  genRole() {
    const r = this.data.row;
    if (!r) return null;
    return r.role === '奶' || r.role === '治疗' ? this.t('seat', 'roleHealer') : this.t('seat', 'roleDps');
  }
  genHealer() { return !!this.data.row && this.data.row.weapon === HEALER_SECT; }
  genAction() {
    return this.memo('action', () => {
      const { row, ev, access } = this.data;
      const user = this.ctx.user;
      if (row) {
        if (user && row.discord_id && String(row.discord_id) === String(user.discordId)) {
          return new LeaveActionShell(this.ctx, { groupingId: String(ev.id), uid: row.uid, nickname: row.nickname });
        }
        return null;
      }
      if (access && access.canWrite && ev.status === 'open') {
        return new JoinActionShell(this.ctx, { groupingId: String(ev.id), seatIndex: this.data.index });
      }
      return null;
    });
  }
}
class SeatGridBlockShell extends BlockShell {
  constructor(ctx, data) { super(ctx, 'SeatGridBlock', data); }
  genSeats() { return this.data.entries; }
}
class ActionButtonBlockShell extends BlockShell {
  constructor(ctx, data) { super(ctx, 'ActionButtonBlock', data); }
  genLabel() { return this.t(...this.data.labelRef); }
  genStyle() { return this.data.style; }
}
class EmptyStateBlockShell extends BlockShell {
  constructor(ctx, data) { super(ctx, 'EmptyStateBlock', data); }
  genText() { return this.t(...this.data.textRef); }
}
class SpacerBlockShell extends BlockShell {
  constructor(ctx, data) { super(ctx, 'SpacerBlock', data); }
  genSize() { return this.data.size; }
}
class FallbackBlockShell extends BlockShell {
  constructor(ctx) { super(ctx, 'FallbackBlock', {}); }
  genText() { return this.t('appBlocks', 'unknownBlock'); }
}

/* ---------- Bloks-lite 动作 shell ---------- */
class ActionShell extends ShellBase {
  constructor(ctx, typename, data) { super(ctx, data); this.__typename = typename; }
  genActionType() { return this.__typename; }
}
class NavigateActionShell extends ActionShell {
  constructor(ctx, data) { super(ctx, 'NavigateAction', data); }
  genSlug() { return this.data.slug; }
  genGroupingId() { return this.data.groupingId; }
  genName() { return this.data.name; }
  genReadOnly() { return !!this.data.readOnly; }
  genNick() { return this.data.nick || ''; }
}
class JoinActionShell extends ActionShell {
  constructor(ctx, data) { super(ctx, 'JoinAction', data); }
  genGroupingId() { return this.data.groupingId; }
  genSeatIndex() { return this.data.seatIndex; }
}
class LeaveActionShell extends ActionShell {
  constructor(ctx, data) { super(ctx, 'LeaveAction', data); }
  genGroupingId() { return this.data.groupingId; }
  genUid() { return this.data.uid; }
  genConfirmTitle() { return this.t('seat', 'leaveConfirmTitle'); }
  genConfirmMessage() { return this.t('seat', 'leaveConfirmMessage', { nickname: this.data.nickname }); }
  genOkLabel() { return this.t('common', 'confirm'); }
  genCancelLabel() { return this.t('common', 'cancel'); }
}
class DisbandActionShell extends ActionShell {
  constructor(ctx, data) { super(ctx, 'DisbandAction', data); }
  genGroupingId() { return this.data.groupingId; }
  genConfirmTitle() { return this.t('groupingDetail', 'disbandConfirmTitle'); }
  genConfirmMessage() { return this.t('groupingDetail', 'disbandConfirmMessage', { title: this.data.title }); }
  genOkLabel() { return this.t('common', 'confirm'); }
  genCancelLabel() { return this.t('common', 'cancel'); }
}
class EditActionShell extends ActionShell {
  constructor(ctx, data) { super(ctx, 'EditAction', data); }
  genGroupingId() { return this.data.groupingId; }
}
// 完成车队动作 (词汇 v4): 与 DisbandAction 同形 (确认文案走动作对象),
// 只有车头且车未完成时详情树才下发。
class CompleteActionShell extends ActionShell {
  constructor(ctx, data) { super(ctx, 'CompleteAction', data); }
  genGroupingId() { return this.data.groupingId; }
  genConfirmTitle() { return this.t('groupingDetail', 'completeConfirmTitle'); }
  genConfirmMessage() { return this.t('groupingDetail', 'completeConfirmMessage', { title: this.data.title }); }
  genOkLabel() { return this.t('common', 'confirm'); }
  genCancelLabel() { return this.t('common', 'cancel'); }
}
// 恢复车队动作 (词汇 v4): 撤销完成, 无确认 (恢复本身可逆且低风险),
// 只有车头且车已完成时详情树才下发。
class UncompleteActionShell extends ActionShell {
  constructor(ctx, data) { super(ctx, 'UncompleteAction', data); }
  genGroupingId() { return this.data.groupingId; }
}

/* ---------- 原语面: 动作 shell → 短键动作 ----------
 * 原语树 (C 路线, src/prim.js) 的动作与功能块的带类型 Action 对象同源:
 * 同一 shell 的 gen 方法产出确认文案, 编码只是换一套短键线格式。拼树侧
 * 永远先构造 Action shell (与 genBlocks 完全相同的权限结论), 需要原语
 * 形态时经此函数转码, 保证两棵树动作集合逐项等价。 */
function encodePrimAction(shell) {
  if (!shell) return null;
  switch (shell.__typename) {
    case 'NavigateAction':
      return primNav({
        slug: shell.genSlug(), groupingId: shell.genGroupingId(), name: shell.genName(),
        readOnly: shell.genReadOnly(), nick: shell.genNick(),
      });
    case 'JoinAction':
      return primJoin({ groupingId: shell.genGroupingId(), seatIndex: shell.genSeatIndex() });
    case 'LeaveAction':
      return primLeave({
        groupingId: shell.genGroupingId(), uid: shell.genUid(),
        confirmTitle: shell.genConfirmTitle(), confirmMessage: shell.genConfirmMessage(),
        okLabel: shell.genOkLabel(), cancelLabel: shell.genCancelLabel(),
      });
    case 'DisbandAction':
      return primDisband({
        groupingId: shell.genGroupingId(),
        confirmTitle: shell.genConfirmTitle(), confirmMessage: shell.genConfirmMessage(),
        okLabel: shell.genOkLabel(), cancelLabel: shell.genCancelLabel(),
      });
    case 'EditAction':
      return primEdit({ groupingId: shell.genGroupingId() });
    case 'CompleteAction':
      return primComplete({
        groupingId: shell.genGroupingId(),
        confirmTitle: shell.genConfirmTitle(), confirmMessage: shell.genConfirmMessage(),
        okLabel: shell.genOkLabel(), cancelLabel: shell.genCancelLabel(),
      });
    case 'UncompleteAction':
      return primUncomplete({ groupingId: shell.genGroupingId() });
    default:
      return null;
  }
}

/* ---------- 页面 shell: 组队列表 ----------
 * groupings/currentVersion 是数据字段 (惰性查库+memo), 其余全是文案
 * 字段 — 由下方 GROUPING_LIST_TEXT / DETAIL / FORM 三组 spec 定义的
 * gen 方法按 locale 生成 (列表页与详情页共用 FORM spec)。 */
class GroupingListPageShell extends ShellBase {
  constructor(ctx, slug, tab) { super(ctx, { slug, tab }); }
  // 移动端 Bloks-lite: 本页内容区的积木对象树。按观看者组合 (导航参数/
  // 空态口径都由 access 决定), 再按客户端 blocksVersion 做版本替代。
  async genBlocks({ blocksVersion, weekOffset } = {}) {
    const v = clampBlocksVersion(blocksVersion);
    const wo = Number.isFinite(weekOffset) ? weekOffset | 0 : 0;
    return this.memo(`blocks:${v}:${wo}`, async () => {
      const access = await getGuildAccess(this.db, this.ctx.user, this.data.slug, this.ctx.request);
      const tRow = await getTenantRow(this.db, access.slug).catch(() => null);
      let viewerNick = null;
      if (this.ctx.user && access.bound && access.discordGuildId) {
        viewerNick = await getGuildNick(this.db, this.ctx.user.discordId, access.discordGuildId).catch(() => null);
      }
      const [ws, we] = weekWindowUtc(wo);
      const shells = await this.genGroupings();
      const blocks = [];
      if (tRow && tRow.announcement) blocks.push(new BannerBlockShell(this.ctx, { text: tRow.announcement }));
      const inWeek = shells.filter((g) => {
        const ts = startsAtEpoch(g.ev);
        return ts != null && ts >= ws && ts < we;
      });
      if (!inWeek.length) {
        blocks.push(new EmptyStateBlockShell(this.ctx, {
          textRef: access.canWrite ? ['groupingList', 'emptyInteractive'] : ['groupingList', 'emptyReadonly'],
        }));
      } else {
        // 一屏 (一周) 之内按查看者本地时区的自然日分组呈现 (2026-10-25
        // 裁决): 组头 = SectionHeaderBlock (v1 既有积木), 文案由目录模板
        // 在此拼好整句下发, 客户端不重排不拼文案; 组按日期升序, 组内按
        // 出发时刻升序。无时间的车在移动端口径里本就不入周 (ts!=null),
        // 不存在未定时间组。
        const items = inWeek.map((g) => ({ g, ts: startsAtEpoch(g.ev) }));
        for (const group of groupByLocalDay(items, this.ctx.tz)) {
          const p = group.parts;
          blocks.push(new SectionHeaderBlockShell(this.ctx, {
            text: this.t('groupingList', 'dayGroupHeader', {
              month: p.month, day: p.day, weekday: this.t('groupingList', 'weekday' + p.weekday),
            }),
          }));
          for (const { g } of group.items) {
            const nav = new NavigateActionShell(this.ctx, {
              slug: access.slug, groupingId: g.genId(), name: tRow ? tRow.guild_name : access.slug,
              readOnly: !access.canWrite, nick: viewerNick || '',
            });
            blocks.push(new GroupingCardBlockShell(this.ctx, { g, occupied: await g.genOccupiedCount(), action: nav }));
          }
        }
      }
      return substituteForVersion(blocks, v, () => new FallbackBlockShell(this.ctx));
    });
  }
  // 移动端原语面 (C 路线): 与 genBlocks 同源同数据的原语树。协商
  // (primitivesVersion) 与开关 (百业 × 列表页, 默认 OFF) 任一不满足返回
  // null — 客户端据此回落功能块树。组合顺序与 genBlocks 一一对应:
  // 公告横幅 → 空态 / 按日分组 (组头 + 卡片 Collection)。
  async genPrimTree({ primitivesVersion, weekOffset } = {}) {
    const v = clampPrimitivesVersion(primitivesVersion);
    if (!v) return null;
    const wo = Number.isFinite(weekOffset) ? weekOffset | 0 : 0;
    return this.memo(`primTree:${v}:${wo}`, async () => {
      const access = await getGuildAccess(this.db, this.ctx.user, this.data.slug, this.ctx.request);
      if (!(await primEnabled(this.db, access.slug, 'list'))) return null;
      const tRow = await getTenantRow(this.db, access.slug).catch(() => null);
      let viewerNick = null;
      if (this.ctx.user && access.bound && access.discordGuildId) {
        viewerNick = await getGuildNick(this.db, this.ctx.user.discordId, access.discordGuildId).catch(() => null);
      }
      const [ws, we] = weekWindowUtc(wo);
      const shells = await this.genGroupings();
      const nodes = [];
      if (tRow && tRow.announcement) {
        nodes.push({ t: 'col', s: 'banner', c: [{ t: 'txt', s: 'bannerText', x: '📣 ' + tRow.announcement }] });
      }
      const inWeek = shells.filter((g) => {
        const ts = startsAtEpoch(g.ev);
        return ts != null && ts >= ws && ts < we;
      });
      if (!inWeek.length) {
        nodes.push({
          t: 'txt', s: 'empty',
          x: this.t('groupingList', access.canWrite ? 'emptyInteractive' : 'emptyReadonly'),
        });
        return nodes;
      }
      // 卡片模板 (Collection): 印章列仅当印章字非空时进模板 (与功能块
      // 渲染的 sealText 有无同口径); 模板每组只下发一次, 每卡只付数据行。
      // meta 行 / 状态片令牌 / 印章字都在服务端预拼 (现状在客户端做的组合,
      // 原语面归服务端 — 这正是「服务端拼好即上线」的含义)。
      const seal = this.t('groupingList', 'seal');
      const cardTpl = {
        t: 'press', a: '$action',
        c: [{
          t: 'col', s: 'card',
          c: [{
            t: 'row', s: 'cardRow',
            c: [
              ...(seal ? [{ t: 'col', s: 'seal', c: [{ t: 'txt', s: 'sealChar', x: '$seal' }] }] : []),
              {
                t: 'col', s: 'cardMain',
                c: [
                  {
                    t: 'row', s: 'cardTitleRow',
                    c: [
                      { t: 'chip', s: 'typeChip', x: '$badge' },
                      { t: 'txt', s: 'cardTitle', x: '$title' },
                    ],
                  },
                  { t: 'txt', s: 'cardMeta', x: '$meta' },
                ],
              },
              { t: 'chip', s: '$statusStyle', x: '$status' },
              { t: 'txt', s: 'chev', x: '›' },
            ],
          }],
        }],
      };
      const items = inWeek.map((g) => ({ g, ts: startsAtEpoch(g.ev) }));
      for (const group of groupByLocalDay(items, this.ctx.tz)) {
        const p = group.parts;
        nodes.push({
          t: 'txt', s: 'sectionHeader',
          x: this.t('groupingList', 'dayGroupHeader', {
            month: p.month, day: p.day, weekday: this.t('groupingList', 'weekday' + p.weekday),
          }),
        });
        const rows = [];
        for (const { g } of group.items) {
          const nav = new NavigateActionShell(this.ctx, {
            slug: access.slug, groupingId: g.genId(), name: tRow ? tRow.guild_name : access.slug,
            readOnly: !access.canWrite, nick: viewerNick || '',
          });
          const ev = g.ev;
          const ts = startsAtEpoch(ev);
          const meta = [
            ts != null ? fmtStartsAt(ts, this.locale, this.ctx.tz) : '',
            this.t('groupingList', 'people', { occupied: await g.genOccupiedCount(), max: ev.max_slots }),
            enDungeonName(this.locale, ev.dungeon || null),
          ].filter(Boolean).join(' · ');
          rows.push({
            ...(seal ? { seal } : {}),
            badge: this.t('groupingType', TYPE_SHORT_KEY[ev.type] || 'shortActivity'),
            title: g.genTitle(),
            meta,
            status: ev.status === 'open' ? this.t('groupingList', 'statusOpen')
              : ev.status === 'completed' ? this.t('appBlocks', 'completedStatus')
              : this.t('appBlocks', 'closedStatus'),
            statusStyle: ev.status === 'open' ? 'statusOpen' : 'statusClosed',
            action: encodePrimAction(nav),
          });
        }
        nodes.push({ t: 'list', s: 'cardList', tpl: cardTpl, items: rows });
      }
      return nodes;
    });
  }
  async genGroupings() {
    return this.memo('groupings', async () => {
      const type = TAB_TO_TYPE[this.data.tab] || 'activity';
      // completed (已完成) 与 draft 一样不进任何列表 (2026-10-25): 完成车只
      // 经详情直达打开。closed 仍在列表 (只是截止报名), 与完成态分开。
      const results = await listEventsByTenantType(this.db, s(this.data.slug, 40), type);
      return results.map((ev) => new GroupingShell(this.ctx, ev));
    });
  }
  // 星期短名表 (下标 0=周日, 与 JS getDay / 服务端 localDayParts 对齐):
  // Web 组头模板的 {weekday} 填充料, 整表由目录按 locale 生成。
  genWeekdayNames() {
    return this.memo('weekdayNames', () => [0, 1, 2, 3, 4, 5, 6].map((i) => this.t('groupingList', 'weekday' + i)));
  }
  genCurrentVersion() {
    return this.ctxMemo('gameVersion', () => getGameVersion(this.db));
  }
}

// 组队列表数据入口 (groupingListPage 与 Guild.groupings 共用; gate 由调用方负责)
function groupingListPage(ctx, slug, tab) {
  return new GroupingListPageShell(ctx, slug, tab);
}

// 发车/编辑表单文案 spec (列表页 shell 与详情页 shell 共用, 同名同口径)
const FORM_TEXT_SPEC = [
  ['formCreateTitle', 'groupingForm', 'createTitle'],
  ['formEditTitle', 'groupingForm', 'editTitle'],
  ['formTypeLabel', 'groupingForm', 'typeLabel'],
  ['formTypeActivityLabel', 'groupingType', 'tabActivity'],
  ['formTypeTalentLabel', 'groupingType', 'tabTalent'],
  ['formTypeRaceLabel', 'groupingType', 'tabRace'],
  ['formTypeTowerLabel', 'groupingType', 'tabTower'],
  ['formCapacityTemplate', 'groupingForm', 'capacity'],
  ['formHintActivity', 'groupingForm', 'hintActivity'],
  ['formHintDungeonTemplate', 'groupingForm', 'hintDungeon'],
  ['formHintTalent', 'groupingForm', 'hintTalent'],
  ['formHintRace', 'groupingForm', 'hintRace'],
  ['formHintTower', 'groupingForm', 'hintTower'],
  ['formTitleLabel', 'groupingForm', 'titleLabel'],
  ['formTitlePlaceholder', 'groupingForm', 'titlePlaceholder'],
  ['formStartsLabel', 'groupingForm', 'startsLabel'],
  ['formMonthTemplate', 'groupingForm', 'monthOption'],
  ['formDayTemplate', 'groupingForm', 'dayOption'],
  ['formHourTemplate', 'groupingForm', 'hourOption'],
  ['formMinuteTemplate', 'groupingForm', 'minuteOption'],
  ['formDungeonLabel', 'groupingForm', 'dungeonLabel'],
  ['formDungeonNoneLabel', 'groupingForm', 'dungeonNone'],
  ['formNicknameLabel', 'groupingForm', 'nicknameLabel'],
  ['formNicknamePlaceholder', 'groupingForm', 'nicknamePlaceholder'],
  ['formSectLabel', 'groupingForm', 'sectLabel'],
  ['formCancelLabel', 'common', 'cancel'],
  ['formSubmitCreateLabel', 'groupingForm', 'submitCreate'],
  ['formSubmitEditLabel', 'groupingForm', 'submitEdit'],
  ['formSubmittingLabel', 'groupingForm', 'submitting'],
  ['formToastSect', 'groupingForm', 'toastSect'],
  ['formToastSaved', 'groupingForm', 'toastSaved'],
  ['formToastSaveFailedTemplate', 'groupingForm', 'toastSaveFailed'],
  ['formToastPosted', 'groupingForm', 'toastPosted'],
  ['formToastCreateFailedTemplate', 'groupingForm', 'toastCreateFailed'],
  ['formTitleTemplate', 'groupingForm', 'titleTemplate'],
];
const TYPE_SHORT_SPEC = [
  ['typeShortActivity', 'groupingType', 'shortActivity'],
  ['typeShortTalent', 'groupingType', 'shortTalent'],
  ['typeShortRace', 'groupingType', 'shortRace'],
  ['typeShortTower', 'groupingType', 'shortTower'],
  ['typeShortGather', 'groupingType', 'shortGather'],
  ['typeShortExplore', 'groupingType', 'shortExplore'],
];
const LIST_TEXT_RESOLVERS = {
  ...defineTextGens(GroupingListPageShell, [
    ['tabActivityLabel', 'groupingType', 'tabActivity'],
    ['tabTalentLabel', 'groupingType', 'tabTalent'],
    ['tabRaceLabel', 'groupingType', 'tabRace'],
    ['tabTowerLabel', 'groupingType', 'tabTower'],
    ...TYPE_SHORT_SPEC,
    ['prevWeekLabel', 'groupingList', 'prevWeek'],
    ['nextWeekLabel', 'groupingList', 'nextWeek'],
    ['weekHeaderTemplate', 'groupingList', 'weekHeader'],
    ['dayGroupHeaderTemplate', 'groupingList', 'dayGroupHeader'],
    ['undatedGroupLabel', 'groupingList', 'undatedGroup'],
    ['emptyInteractiveText', 'groupingList', 'emptyInteractive'],
    ['emptyReadonlyText', 'groupingList', 'emptyReadonly'],
    ['statusOpenLabel', 'groupingList', 'statusOpen'],
    ['peopleTemplate', 'groupingList', 'people'],
    ['newCarLabel', 'groupingList', 'newCar'],
    ['sealText', 'groupingList', 'seal'],
    ...FORM_TEXT_SPEC,
  ]),
  // 数组字段不走 defineTextGens (目录条目恒为字符串): 整表生成在此
  weekdayNames: (p) => p.genWeekdayNames(),
};

/* ---------- 百业成员名册条目 (代报名选人) ----------
 * 名册 = guild_members (用户进入百业时由读取路径记录)。条目只经完整
 * Guild 面的 memberRoster 字段下发; displayName 口径与服务端落座名
 * 一致 (名册昵称, 回退全局名), 选择器选中的就是将落座的名字。 */
class GuildRosterMemberShell extends ShellBase {
  genDiscordId() { return String(this.data.discordId); }
  genDisplayName() { return this.data.displayName; }
  genGlobalName() { return this.data.globalName || null; }
}

/* ---------- 实体 shell: Guild (Guild / GuildReadOnly / GuildLocked) ----------
 * 一个 class, 三个 __typename (权限结论由类型表达, 与从前一致): 实例
 * 携带 getGuildAccess 的结论, 字段 gen 方法按需解析 — 内容字段仅在
 * 对应类型上声明, Locked 实例永远不会被问到内容。文案字段 (主页
 * 外壳/详情页缺失提示/锁定页) 直接长在本类上, 按类型分发 resolver。 */
class GuildShell extends ShellBase {
  constructor(ctx, access) {
    super(ctx, access);
    this.__typename = !access.exists || !access.canView ? 'GuildLocked'
      : access.canWrite ? 'Guild' : 'GuildReadOnly';
  }
  get access() { return this.data; }
  genSlug() { return this.access.tenant ? this.access.tenant.slug : this.access.slug; }
  genName() { return this.access.tenant.guild_name; }
  // 百业自定义头像: 有头像才给带 hash 的版本化 URL (相对本站 origin),
  // 没有给 null — 客户端照字段渲染, 不许自己拼 URL。
  genAvatarUrl() {
    return this.memo('avatarUrl', async () => {
      const meta = await getGuildAvatarMeta(this.db, this.genSlug()).catch(() => null);
      if (!meta) return null;
      let origin = '';
      try { origin = new URL(this.ctx.request.url).origin; } catch { /* 无 request 时退相对路径 */ }
      return origin + avatarPath(this.genSlug(), meta.hash);
    });
  }
  genSlogan() { return this.access.tenant.slogan || ''; }
  genGameVersion() { return this.ctxMemo('gameVersion', () => getGameVersion(this.db)); }
  genMemberCount() {
    return this.memo('memberCount', async () => {
      const mc = await this.db.prepare(
        'SELECT COUNT(DISTINCT s.nickname) AS c FROM signups s JOIN events e ON s.event_id = e.id WHERE e.tenant = ?'
      ).bind(this.genSlug()).first().catch(() => ({ c: 0 }));
      return mc ? mc.c : 0;
    });
  }
  genGroupings({ tab }) {
    return groupingListPage(this.ctx, this.genSlug(), tab);
  }
  // 本百业成员名册 (代报名选人面): 只挂在完整 Guild 类型上
  // (GuildReadOnly / GuildLocked 的 schema 里没有这个字段)。按展示名
  // 排序下发; 展示名为空 (昵称与全局名都缺) 的行不下发 — 选了也落不了座。
  genMemberRoster() {
    return this.memo('memberRoster', async () => {
      await ensureGuildMembersTable(this.db);
      const { results } = await this.db.prepare(
        'SELECT discord_id, nick, global_name FROM guild_members WHERE tenant = ?'
      ).bind(this.genSlug()).all().catch(() => ({ results: [] }));
      const out = [];
      for (const r of results || []) {
        const displayName = String(r.nick || '').trim() || String(r.global_name || '').trim();
        if (!displayName) continue;
        out.push(new GuildRosterMemberShell(this.ctx, {
          discordId: String(r.discord_id),
          displayName,
          globalName: String(r.global_name || '').trim(),
        }));
      }
      out.sort((a, b) => a.data.displayName.localeCompare(b.data.displayName, 'zh-Hans-CN'));
      return out;
    });
  }
  // 当前用户在该百业绑定服务器的 Discord 昵称 (数据, 非权限标记);
  // 未登录/未绑定/无绑定服务器 -> null; 昵称为空 -> null (前端回退全局名)
  genViewerNick() {
    return this.memo('viewerNick', async () => {
      if (!this.ctx.user || !this.access.bound || !this.access.discordGuildId) return null;
      const nick = await getGuildNick(this.db, this.ctx.user.discordId, this.access.discordGuildId).catch(() => null);
      return nick || null;
    });
  }
}

const GUILD_HOME_TEXT_SPEC = [
  ['homeBackToHubLabel', 'guildHome', 'backToHub'],
  ['homeTabTeamLabel', 'guildHome', 'tabTeam'],
  ['homeTabDexLabel', 'guildHome', 'tabDex'],
  ['homeTabSectLabel', 'guildHome', 'tabSect'],
  ['detailNotFoundText', 'groupingDetail', 'notFound'],
  ['detailBackToListLabel', 'groupingDetail', 'backToList'],
];
const GUILD_TEXT_RESOLVERS = defineTextGens(GuildShell, GUILD_HOME_TEXT_SPEC);
const GUILD_READONLY_TEXT_RESOLVERS = defineTextGens(GuildShell, [
  ['homeReadOnlyBanner', 'guildHome', 'readOnlyBanner'],
]);
const GUILD_LOCKED_TEXT_RESOLVERS = defineTextGens(GuildShell, [
  ['lockedBackLinkLabel', 'locked', 'backLink'],
  ['lockedTitle', 'locked', 'title'],
  ['lockedBody1', 'locked', 'body1'],
  ['lockedBody2', 'locked', 'body2'],
  ['lockedBackButtonLabel', 'locked', 'backButton'],
]);

// Guild / GuildReadOnly 的内容字段 (两者数据面相同; 区别只在类型与前端挂载的组件)
function guildContentResolvers() {
  return {
    slug: (p) => p.genSlug(),
    name: (p) => p.genName(),
    slogan: (p) => p.genSlogan(),
    gameVersion: (p) => p.genGameVersion(),
    memberCount: (p) => p.genMemberCount(),
    avatarUrl: (p) => p.genAvatarUrl(),
    groupings: (p, { tab }) => p.genGroupings({ tab }),
    viewerNick: (p) => p.genViewerNick(),
    ...GUILD_TEXT_RESOLVERS,
  };
}



/* ================= 页面 shell ================= */

/* ---------- Viewer (站点/登录/用户栏/选择页/创建页/通用文案 + 用户层级) ---------- */
class DiscordUserShell extends ShellBase {
  genDiscordId() { return String(this.data.discordId); }
  genName() { return this.data.name; }
  genAvatar() { return this.data.avatar || null; }
}

class DiscordServerShell extends ShellBase {
  genId() { return String(this.data.id); }
  genName() { return this.data.name || this.data.id; }
  genIcon() { return this.data.icon || null; }
}

class ViewerShell extends ShellBase {
  genUser() {
    return this.ctx.user
      ? new DiscordUserShell(this.ctx, this.ctx.user)
      : null;
  }
  async genGuilds() {
    if (!this.ctx.user) return [];
    return this.memo('guilds', async () => {
      const results = await listTenantSlugs(this.db);
      const out = [];
      for (const t of results || []) {
        const a = await getGuildAccess(this.db, this.ctx.user, t.slug, this.ctx.request);
        // 可用百业 = 已绑定 Discord 服务器且我是其成员 (服务端过滤)
        if (a.bound && a.isMember) out.push(guildResult(this.ctx, a));
      }
      return out;
    });
  }
  async genPublicGuilds() {
    return this.memo('publicGuilds', async () => {
      const results = await listTenantSlugs(this.db);
      const out = [];
      for (const t of results || []) {
        const a = await getGuildAccess(this.db, this.ctx.user, t.slug, this.ctx.request);
        // 未绑定服务器的百业: 公开只读类型下发
        if (a.exists && !a.bound) out.push(guildResult(this.ctx, a));
      }
      return out;
    });
  }
  async genGuild({ slug }) {
    const a = await getGuildAccess(this.db, this.ctx.user, slug, this.ctx.request);
    touchGuildRoster(this.ctx, a); // 进入百业 -> 名册记录 (被锁/匿名在 helper 内过滤)
    // 不存在也返回 GuildLocked (类型即结论, 不下发内容)
    return guildResult(this.ctx, a);
  }
  async genDiscordServers() {
    if (!this.ctx.user) return [];
    return this.memo('discordServers', async () => {
      const servers = await getServersForUser(this.db, this.ctx.user);
      // 服务端过滤: 只下发我有管理权限的服务器 (不下发权限位给前端判断)
      return servers.filter(serverCanManage).map((sv) => new DiscordServerShell(this.ctx, sv));
    });
  }
  // 账号级语言偏好 (null = 自动) 与本请求实际生效 locale (ctx.locale 已由
  // worker 按 偏好 > 浏览器语言 > zh-CN 解析完毕)
  genMyLocalePref() { return loadMyLocalePref(this.ctx); }
  genMyEffectiveLocale() { return this.locale; }
}

const VIEWER_TEXT_RESOLVERS = defineTextGens(ViewerShell, [
  ['siteTitle', 'site', 'title'],
  ['siteSubtitle', 'site', 'subtitle'],
  ['siteHeroAlt', 'site', 'heroAlt'],
  ['loginCardTitle', 'login', 'cardTitle'],
  ['loginCardBody1', 'login', 'cardBody1'],
  ['loginCardBody2', 'login', 'cardBody2'],
  ['loginButtonLabel', 'login', 'button'],
  ['loginPrivacyText', 'login', 'privacy'],
  ['userBarLogoutLabel', 'userBar', 'logout'],
  ['userBarLoggingOutLabel', 'userBar', 'loggingOut'],
  ['userBarSettingsLabel', 'userBar', 'settings'],
  ['pickerMyGuildsLabel', 'picker', 'myGuilds'],
  ['pickerMyGuildsEnLabel', 'picker', 'myGuildsEn'],
  ['pickerPublicGuildsLabel', 'picker', 'publicGuilds'],
  ['pickerPublicGuildsEnLabel', 'picker', 'publicGuildsEn'],
  ['pickerReadOnlyBadge', 'picker', 'readOnlyBadge'],
  ['pickerEmptyTitle', 'picker', 'emptyTitle'],
  ['pickerEmptyBody', 'picker', 'emptyBody'],
  ['pickerCreateGuildLabel', 'picker', 'createGuild'],
  ['pickerCreateGuildMoreLabel', 'picker', 'createGuildMore'],
  ['createBackLinkLabel', 'create', 'backLink'],
  ['createTitle', 'create', 'title'],
  ['createSubtitle', 'create', 'subtitle'],
  ['createNameLabel', 'create', 'nameLabel'],
  ['createNamePlaceholder', 'create', 'namePlaceholder'],
  ['createSlugLabel', 'create', 'slugLabel'],
  ['createSlugPlaceholder', 'create', 'slugPlaceholder'],
  ['createSlugCheckingText', 'create', 'slugChecking'],
  ['createSlugTakenText', 'create', 'slugTaken'],
  ['createSlugNote', 'create', 'slugNote'],
  ['createServerLabel', 'create', 'serverLabel'],
  ['createNoServers1', 'create', 'noServers1'],
  ['createNoServers2', 'create', 'noServers2'],
  ['createSubmitLabel', 'create', 'submit'],
  ['createSubmittingLabel', 'create', 'submitting'],
  ['createToastNameShort', 'create', 'toastNameShort'],
  ['createToastSlugRequired', 'create', 'toastSlugRequired'],
  ['createToastSlugBad', 'create', 'toastSlugBad'],
  ['createToastServerRequired', 'create', 'toastServerRequired'],
  ['createToastCreated', 'create', 'toastCreated'],
  ['createToastFailed', 'create', 'toastFailed'],
  ['slugAvailableMessage', 'create', 'slugAvailable', (args) => ({ slug: args.slug })],
  ['commonCancelLabel', 'common', 'cancel'],
  ['commonConfirmLabel', 'common', 'confirm'],
  ['commonUnknownErrorText', 'common', 'unknownError'],
  ['commonRenderErrorTemplate', 'common', 'renderError'],
  ['commonRenderErrorHint', 'common', 'renderErrorHint'],
  ['commonBackToHubLabel', 'common', 'backToHub'],
  ['commonLoadingGuildText', 'common', 'loadingGuild'],
  // 全站页脚: 非官方声明 (审计 A3) + 条款/隐私入口文案 (审计 A2)
  ['footerDisclaimerText', 'legal', 'disclaimer'],
  ['footerTermsLabel', 'legal', 'termsLink'],
  ['footerPrivacyLabel', 'legal', 'privacyLink'],
]);

/* ---------- Hub 页 (导航) ---------- */
class GuildCardShell extends ShellBase {
  genSlug() { return this.data.slug; }
  genName() { return this.data.name; }
  genSlogan() { return this.data.slogan || ''; }
  genGameVersion() { return this.data.gameVersion; }
  genMemberCount() { return this.data.memberCount; }
  genAvatarUrl() {
    return this.memo('avatarUrl', async () => {
      const meta = await getGuildAvatarMeta(this.db, this.genSlug()).catch(() => null);
      if (!meta) return null;
      let origin = '';
      try { origin = new URL(this.ctx.request.url).origin; } catch { /* 同 GuildShell */ }
      return origin + avatarPath(this.genSlug(), meta.hash);
    });
  }
}

class HubPageShell extends ShellBase {
  async genGuilds() {
    return this.memo('guilds', async () => {
      const db = this.db;
      const results = await listTenantsDirectory(db);
      // 已绑定百业仅对其 Discord 服务器成员可见: 匿名/非成员在此层就过滤掉
      const bindRows = await listSettingsByKey(db, 'discord_guild_id').catch(() => []);
      const bindMap = {};
      for (const r of bindRows || []) if (r.value) bindMap[r.tenant] = String(r.value);
      // dev_only 百业: 非 dev 表面来源不出现在导航里
      const devRows = await listSettingsByKey(db, 'dev_only').catch(() => []);
      const devSet = new Set((devRows || []).filter((r) => String(r.value) === '1').map((r) => r.tenant));
      const devVisible = isDevRequest(this.ctx.request);
      const gameVersion = await this.ctxMemo('gameVersion', () => getGameVersion(db));
      const guilds = [];
      for (const t of results || []) {
        if (devSet.has(t.slug) && !devVisible) continue;
        const dgid = bindMap[t.slug];
        if (dgid && !(this.ctx.user && (this.ctx.user.guilds || []).includes(dgid))) continue;
        const mc = await db.prepare(
          'SELECT COUNT(DISTINCT s.nickname) AS c FROM signups s JOIN events e ON s.event_id = e.id WHERE e.tenant = ?'
        ).bind(t.slug).first().catch(() => ({ c: 0 }));
        guilds.push(new GuildCardShell(this.ctx, {
          slug: t.slug, name: t.guild_name, slogan: t.slogan || '', gameVersion, memberCount: mc ? mc.c : 0,
        }));
      }
      return guilds;
    });
  }
}

/* ---------- 法律页 (服务条款 / 隐私政策, 2026-10-25 审计 A2) ----------
 * 正文按实际数据处理写 (见 i18n.js 的 termsBody/privacyBody 段):
 * zh-CN 源文 + en 全译, es/fr/zh-TW 经 translate() 逐字段回退源文。
 * 页面公开可达 (未登录访客从登录页页脚进入), resolver 不做登录校验。 */
const LEGAL_SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'];
class LegalSectionShell extends ShellBase {
  genHeading() { return this.t(this.data.section, this.data.key + 'h'); }
  genBody() { return this.t(this.data.section, this.data.key + 'b'); }
}
class LegalPageShell extends ShellBase {
  get isTerms() { return this.data.kind === 'TERMS'; }
  genKind() { return this.data.kind; }
  genTitle() { return this.t('legal', this.isTerms ? 'termsTitle' : 'privacyTitle'); }
  genUpdatedText() { return this.t('legal', 'updatedText'); }
  genBackLabel() { return this.t('common', 'backToHub'); }
  genSections() {
    const section = this.isTerms ? 'termsBody' : 'privacyBody';
    return LEGAL_SECTION_KEYS.map((key) => new LegalSectionShell(this.ctx, { section, key }));
  }
}

/* ---------- 百业页 (扁平兼容查询) ---------- */
class GuildPageShell extends ShellBase {
  genSlug() { return this.data.slug; }
  genName() { return this.data.name; }
  genGameVersion() { return this.data.gameVersion; }
  genCurrentVersion() { return this.data.currentVersion; }
  genTabs() { return this.data.tabs; }
}

/* ---------- 组队详情页 ---------- */
class GroupingDetailPageShell extends ShellBase {
  constructor(ctx, ev) { super(ctx, ev); }
  genGrouping() {
    return this.memo('grouping', () => new GroupingShell(this.ctx, this.data));
  }
  // 移动端 Bloks-lite: 本页内容区的积木对象树。逐座动作与解散按钮按
  // 观看者组合 (身份戳/车头比对都在服务端), 再按 blocksVersion 替代。
  async genBlocks({ blocksVersion } = {}) {
    const v = clampBlocksVersion(blocksVersion);
    return this.memo(`blocks:${v}`, async () => {
      const ev = this.data;
      const access = await getGuildAccess(this.db, this.ctx.user, ev.tenant, this.ctx.request);
      const tRow = await getTenantRow(this.db, ev.tenant).catch(() => null);
      await ensureSignupDiscordColumn(this.db);
      const rows = await listSignupSeats(this.db, ev.id);
      const entries = [];
      for (let i = 0; i < ev.max_slots; i++) {
        entries.push(new SeatEntryShell(this.ctx, { row: rows[i] || null, index: i, ev, access }));
      }
      const blocks = [];
      if (tRow && tRow.announcement) blocks.push(new BannerBlockShell(this.ctx, { text: tRow.announcement }));
      blocks.push(new TextBlockShell(this.ctx, { text: ev.title, variant: 'title' }));
      blocks.push(new ChipRowBlockShell(this.ctx, { evType: ev.type, dungeonName: ev.dungeon || null, status: ev.status }));
      blocks.push(new TextBlockShell(this.ctx, {
        variant: 'meta', epoch: startsAtEpoch(ev), occupied: rows.length, max: ev.max_slots,
      }));
      blocks.push(new TextBlockShell(this.ctx, {
        variant: 'muted',
        textRef: ev.status === 'completed' ? ['groupingDetail', 'completedHint']
          : access.canWrite ? ['groupingDetail', 'openHint'] : ['groupingDetail', 'readonlyHint'],
      }));
      blocks.push(new SectionBlockShell(this.ctx, {
        title: null,
        children: [
          new SectionHeaderBlockShell(this.ctx, { textRef: ['appBlocks', 'rosterTitle'] }),
          new SeatGridBlockShell(this.ctx, { entries }),
        ],
      }));
      const isLeader = !!(this.ctx.user && ev.creator_discord_id
        && String(ev.creator_discord_id) === String(this.ctx.user.discordId));
      if (isLeader && access.canWrite) {
        blocks.push(new SpacerBlockShell(this.ctx, { size: 18 }));
        if (ev.status === 'completed') {
          // 已完成: 只给恢复入口 (编辑/解散/完成都不再下发)
          blocks.push(new ActionButtonBlockShell(this.ctx, {
            labelRef: ['groupingDetail', 'restore'], style: 'ghost',
            action: new UncompleteActionShell(this.ctx, { groupingId: String(ev.id) }),
          }));
        } else {
          blocks.push(new ActionButtonBlockShell(this.ctx, {
            labelRef: ['groupingDetail', 'edit'], style: 'ghost',
            action: new EditActionShell(this.ctx, { groupingId: String(ev.id) }),
          }));
          blocks.push(new SpacerBlockShell(this.ctx, { size: 10 }));
          blocks.push(new ActionButtonBlockShell(this.ctx, {
            labelRef: ['groupingDetail', 'complete'], style: 'ghost',
            action: new CompleteActionShell(this.ctx, { groupingId: String(ev.id), title: ev.title }),
          }));
          blocks.push(new SpacerBlockShell(this.ctx, { size: 10 }));
          blocks.push(new ActionButtonBlockShell(this.ctx, {
            labelRef: ['groupingDetail', 'disband'], style: 'danger',
            action: new DisbandActionShell(this.ctx, { groupingId: String(ev.id), title: ev.title }),
          }));
        }
      }
      return substituteForVersion(blocks, v, () => new FallbackBlockShell(this.ctx));
    });
  }
  // 移动端原语面 (C 路线): 与 genBlocks 同源同数据的原语树 (协商 + 开关
  // 不满足返回 null)。结构对应: 公告横幅 → 标题 → 类型/状态片行 → meta
  // → 提示 → 名册区 (区头 + 座位 Collection) → 车头动作钮组 (完成态只给
  // 恢复)。座位格的占/空差异在服务端预消化成数据行的 line1/line2/
  // cellStyle/line1Style 四字段, 模板结构恒定; 逐座动作与车头闸门走与
  // genBlocks 完全相同的 SeatEntryShell / isLeader 结论, 再经
  // encodePrimAction 转短键。Spacer 尺寸量化到间距标度: 18 → md(16)、
  // 10 → sm(10) (STUDY §4.3 的毫米级取舍)。
  async genPrimTree({ primitivesVersion } = {}) {
    const v = clampPrimitivesVersion(primitivesVersion);
    if (!v) return null;
    return this.memo(`primTree:${v}`, async () => {
      const ev = this.data;
      const access = await getGuildAccess(this.db, this.ctx.user, ev.tenant, this.ctx.request);
      if (!(await primEnabled(this.db, access.slug, 'detail'))) return null;
      const tRow = await getTenantRow(this.db, ev.tenant).catch(() => null);
      await ensureSignupDiscordColumn(this.db);
      const rows = await listSignupSeats(this.db, ev.id);
      const entries = [];
      for (let i = 0; i < ev.max_slots; i++) {
        entries.push(new SeatEntryShell(this.ctx, { row: rows[i] || null, index: i, ev, access }));
      }
      const nodes = [];
      if (tRow && tRow.announcement) {
        nodes.push({ t: 'col', s: 'banner', c: [{ t: 'txt', s: 'bannerText', x: '📣 ' + tRow.announcement }] });
      }
      nodes.push({ t: 'txt', s: 'bTitle', x: ev.title });
      // 片行与 ChipRowBlockShell.genChips 同源: [类型短名, 副本?, 状态]
      const chipTexts = [this.t('groupingType', TYPE_SHORT_KEY[ev.type] || 'shortActivity')];
      if (ev.dungeon) chipTexts.push(enDungeonName(this.locale, ev.dungeon));
      chipTexts.push(ev.status === 'open' ? this.t('groupingDetail', 'statusOpen')
        : ev.status === 'completed' ? this.t('appBlocks', 'completedStatus')
        : this.t('appBlocks', 'closedStatus'));
      nodes.push({ t: 'row', s: 'chipRow', c: chipTexts.map((x) => ({ t: 'chip', s: 'chip', x })) });
      const metaParts = [];
      const ts = startsAtEpoch(ev);
      if (ts != null) metaParts.push(fmtStartsAt(ts, this.locale, this.ctx.tz));
      metaParts.push(this.t('groupingDetail', 'people', { occupied: rows.length, max: ev.max_slots }));
      nodes.push({ t: 'txt', s: 'bMeta', x: metaParts.join(' · ') });
      nodes.push({
        t: 'txt', s: 'bMuted',
        x: this.t('groupingDetail', ev.status === 'completed' ? 'completedHint' : access.canWrite ? 'openHint' : 'readonlyHint'),
      });
      // 名册: 座位 Collection (grid2)。空位文案按动作有无选
      // emptyJoin/empty, 与功能块客户端的 pageText 口径一致 (改由服务端定)。
      const seatItems = entries.map((e) => {
        const action = encodePrimAction(e.genAction());
        if (e.genOccupied()) {
          const weapon = e.genWeapon();
          const role = e.genRole();
          const line2 = weapon || role
            ? `${weapon ?? ''}${role ? `${weapon ? ' · ' : ''}${role}` : ''}` : null;
          // line1Lines: 与积木版 SeatCell 同构 — 昵称/副行截断 1 行,
          // 空位文案不截断 (格内居中换行)。
          return { line1: e.genNickname(), line2, line1Lines: 1, cellStyle: 'seatTaken', line1Style: 'seatName', action };
        }
        return {
          line1: action ? this.t('seat', 'emptyJoin') : this.t('seat', 'empty'),
          line2: null,
          line1Lines: null,
          cellStyle: action ? 'seatFreeJoin' : 'seatFree',
          line1Style: 'seatEmptyText',
          action,
        };
      });
      const seatTpl = {
        t: 'press', a: '$action',
        c: [{
          t: 'col', s: '$cellStyle',
          c: [
            { t: 'txt', s: '$line1Style', x: '$line1', lines: '$line1Lines' },
            { t: 'txt', s: 'seatSub', x: '$line2', lines: 1 },
          ],
        }],
      };
      nodes.push({
        t: 'col', s: 'section',
        c: [
          { t: 'txt', s: 'sectionHeader', x: this.t('appBlocks', 'rosterTitle') },
          { t: 'list', s: 'grid2', tpl: seatTpl, items: seatItems },
        ],
      });
      const isLeader = !!(this.ctx.user && ev.creator_discord_id
        && String(ev.creator_discord_id) === String(this.ctx.user.discordId));
      if (isLeader && access.canWrite) {
        const btn = (labelRef, styleToken, actionShell) => ({
          t: 'press', a: encodePrimAction(actionShell),
          c: [{
            t: 'col', s: styleToken,
            c: [{ t: 'txt', s: styleToken + 'Text', x: this.t(...labelRef) }],
          }],
        });
        nodes.push({ t: 'sp', s: 'md' });
        if (ev.status === 'completed') {
          // 已完成: 只给恢复入口 (与 genBlocks 同口径)
          nodes.push(btn(['groupingDetail', 'restore'], 'btnGhost',
            new UncompleteActionShell(this.ctx, { groupingId: String(ev.id) })));
        } else {
          nodes.push(btn(['groupingDetail', 'edit'], 'btnGhost',
            new EditActionShell(this.ctx, { groupingId: String(ev.id) })));
          nodes.push({ t: 'sp', s: 'sm' });
          nodes.push(btn(['groupingDetail', 'complete'], 'btnGhost',
            new CompleteActionShell(this.ctx, { groupingId: String(ev.id), title: ev.title })));
          nodes.push({ t: 'sp', s: 'sm' });
          nodes.push(btn(['groupingDetail', 'disband'], 'btnDanger',
            new DisbandActionShell(this.ctx, { groupingId: String(ev.id), title: ev.title })));
        }
      }
      return nodes;
    });
  }
}

const DETAIL_TEXT_RESOLVERS = {
  ...defineTextGens(GroupingDetailPageShell, [
    ['detailNotFoundText', 'groupingDetail', 'notFound'],
    ['detailBackToListLabel', 'groupingDetail', 'backToList'],
    ['detailShareLabel', 'groupingDetail', 'share'],
    ['detailEditLabel', 'groupingDetail', 'edit'],
    ['detailDisbandLabel', 'groupingDetail', 'disband'],
    ['detailDisbandingLabel', 'groupingDetail', 'disbanding'],
    ['detailStatusOpenLabel', 'groupingDetail', 'statusOpen'],
    ['detailPeopleTemplate', 'groupingDetail', 'people'],
    ['detailOpenHint', 'groupingDetail', 'openHint'],
    ['detailReadonlyHint', 'groupingDetail', 'readonlyHint'],
    ['detailToastDisbanded', 'groupingDetail', 'toastDisbanded'],
    ['detailToastDisbandFailedTemplate', 'groupingDetail', 'toastDisbandFailed'],
    ['detailCompleteLabel', 'groupingDetail', 'complete'],
    ['detailCompletingLabel', 'groupingDetail', 'completing'],
    ['detailStatusCompletedLabel', 'groupingDetail', 'statusCompleted'],
    ['detailRestoreLabel', 'groupingDetail', 'restore'],
    ['detailCompleteConfirmTitle', 'groupingDetail', 'completeConfirmTitle'],
    ['detailCompleteConfirmMessageTemplate', 'groupingDetail', 'completeConfirmMessage'],
    ['detailToastCompleted', 'groupingDetail', 'toastCompleted'],
    ['detailToastCompleteFailedTemplate', 'groupingDetail', 'toastCompleteFailed'],
    ['detailToastRestored', 'groupingDetail', 'toastRestored'],
    ['detailToastRestoreFailedTemplate', 'groupingDetail', 'toastRestoreFailed'],
    ['detailCompletedHint', 'groupingDetail', 'completedHint'],
    ['detailLinkCopied', 'groupingDetail', 'linkCopied'],
    ['detailCopyFailedManual', 'groupingDetail', 'copyFailedManual'],
    ['detailDisbandConfirmTitle', 'groupingDetail', 'disbandConfirmTitle'],
    ['detailDisbandConfirmMessageTemplate', 'groupingDetail', 'disbandConfirmMessage'],
    ['confirmOkLabel', 'common', 'confirm'],
    ['confirmCancelLabel', 'common', 'cancel'],
    ...TYPE_SHORT_SPEC,
    ['seatEmptyJoinLabel', 'seat', 'emptyJoin'],
    ['seatEmptyLabel', 'seat', 'empty'],
    ['seatModalTitleTemplate', 'seat', 'modalTitle'],
    ['seatModalSubtitle', 'seat', 'modalSubtitle'],
    ['seatNameLabel', 'seat', 'nameLabel'],
    ['seatNamePlaceholder', 'seat', 'namePlaceholder'],
    ['seatNameRequired', 'seat', 'nameRequired'],
    ['seatSelfTabLabel', 'seat', 'selfTab'],
    ['seatProxyTabLabel', 'seat', 'proxyTab'],
    ['seatSelfNameHint', 'seat', 'selfNameHint'],
    ['seatProxySearchPlaceholder', 'seat', 'proxySearchPlaceholder'],
    ['seatProxyPickRequired', 'seat', 'proxyPickRequired'],
    ['seatProxyEmptyText', 'seat', 'proxyEmpty'],
    ['seatSectLabel', 'seat', 'sectLabel'],
    ['seatCancelLabel', 'common', 'cancel'],
    ['seatConfirmJoinLabel', 'seat', 'confirmJoin'],
    ['seatJoiningLabel', 'seat', 'joining'],
    ['seatToastSect', 'seat', 'toastSect'],
    ['seatToastJoined', 'seat', 'toastJoined'],
    ['seatToastJoinFailedTemplate', 'seat', 'toastJoinFailed'],
    ['seatToastLeft', 'seat', 'toastLeft'],
    ['seatToastLeaveFailedTemplate', 'seat', 'toastLeaveFailed'],
    ['seatLeaveConfirmTitle', 'seat', 'leaveConfirmTitle'],
    ['seatLeaveConfirmMessageTemplate', 'seat', 'leaveConfirmMessage'],
    ...FORM_TEXT_SPEC,
  ]),
};

/* ---------- 图鉴页 (dex) ---------- */
class DexCategoryShell extends ShellBase {
  genCategory() { return this.data.category; }
  genSeason() { return this.data.season; }
  genSeasonName() { return this.data.seasonName; }
  genIsCurrent() { return this.data.isCurrent; }
  genDungeons() { return this.data.dungeons; }
}

class DexPageShell extends ShellBase {
  genAll() {
    return this.memo('all', async () => {
      const db = this.db;
      await ensureDungeonDexColumns(db);
      const versionCode = await this.ctxMemo('versionCode', () => getCurrentVersionCode(db));
      const { results } = await db.prepare(
        'SELECT * FROM dungeons ORDER BY size DESC, sort_order DESC, id ASC'
      ).all();
      const current = [], past = [];
      const all = [];
      for (const d of results || []) {
        const dd = new DungeonShell(this.ctx, d);
        all.push(dd);
        // 按 version 码判断当期 (与 game_version_code 比较, 非展示串), 无 is_current 布尔值
        (d.version === versionCode ? current : past).push(dd);
      }
      // 游戏内分类分组: 传薪(当期)→铸矩→鉴心→梦洄→试锋; 组内等级降序, 同级十人本优先
      const categories = [];
      for (const cat of DEX_CATEGORY_ORDER) {
        const season = DEX_CATEGORY_SEASON[cat];
        const ds = all
          .filter((x) => x.genCategory() === cat)
          .sort((a, b) => ((b.genLevel() ?? -1) - (a.genLevel() ?? -1)) || (b.genPlayerCount() - a.genPlayerCount()) || (Number(a.genId()) - Number(b.genId())));
        if (ds.length) {
          categories.push(new DexCategoryShell(this.ctx, {
            category: cat, season, seasonName: SEASON_NAMES[season],
            isCurrent: cat === '传薪', dungeons: ds,
          }));
        }
      }
      return { current, past, categories };
    });
  }
  async genCurrent() { return (await this.genAll()).current; }
  async genPast() { return (await this.genAll()).past; }
  async genCategories() { return (await this.genAll()).categories; }
  genCurrentVersion() { return this.ctxMemo('gameVersion', () => getGameVersion(this.db)); }
}

const DEX_TEXT_RESOLVERS = defineTextGens(DexPageShell, [
  ['dexBackLabel', 'dex', 'backToDex'],
  ['dexBossesLineTemplate', 'dex', 'bossesLine'],
  ['dexNoBossDataText', 'dex', 'noBossData'],
  ['dexEmptyText', 'dex', 'empty'],
  ['dexCurrentGuidesTemplate', 'dex', 'currentGuides'],
  ['dexCatSubTemplate', 'dex', 'catSub'],
  ['dexCatSubCurrentTemplate', 'dex', 'catSubCurrent'],
  ['dexSize10Label', 'dex', 'size10'],
  ['dexSize5Label', 'dex', 'size5'],
  ['dexSizeNTemplate', 'dex', 'sizeN'],
  ['dexBossUnit', 'dex', 'bossUnit'],
  ['dexPartMechanicsLabel', 'dex', 'partMechanics'],
  ['dexPartShoutsLabel', 'dex', 'partShouts'],
  ['dexPartTalentsLabel', 'dex', 'partTalents'],
  ['dexLabelAllTemplate', 'dex', 'labelAll'],
  ['dexLabelPartsTemplate', 'dex', 'labelParts'],
  ['dexLabelPendingTemplate', 'dex', 'labelPending'],
  ['dexLabelNoBossesText', 'dex', 'labelNoBosses'],
  ['dexSealBossText', 'dex', 'sealBoss'],
]);

/* ---------- Boss 页 ---------- */
class BossPageShell extends ShellBase {
  genBoss() { return this.data.bossShell; }
  genDefaultTab() { return 'MECHANICS'; }
}

const BOSS_TEXT_RESOLVERS = defineTextGens(BossPageShell, [
  ['bossBackLabel', 'boss', 'back'],
  ['bossNotFoundText', 'boss', 'notFound'],
  ['bossTabMechanicsLabel', 'boss', 'tabMechanics'],
  ['bossTabTalentsLabel', 'boss', 'tabTalents'],
  ['bossShoutsTitle', 'boss', 'shoutsTitle'],
  ['bossCopyLabel', 'boss', 'copy'],
  ['bossShoutCopiedText', 'boss', 'shoutCopied'],
  ['bossCopyFailedText', 'boss', 'copyFailed'],
  ['bossCopyManualText', 'boss', 'copyManual'],
  ['bossNoMechanicsText', 'boss', 'noMechanics'],
  ['bossNoTalentsText', 'boss', 'noTalents'],
  ['bossTalentTitleTemplate', 'boss', 'talentTitle'],
  ['bossTalentPendingSuffix', 'boss', 'talentPending'],
]);

/* ---------- 流派页 ---------- */
// Sect 的 bis/rotation/rateTargets 是存储数据的叶子记录 (toBisTable/
// toRotation 的输出), 无文案、无惰性查库需求, 由 gen 方法直接返回。
class SectShell extends ShellBase {
  genSlug() { return this.data.slug; }
  genName() { return enSectName(this.locale, this.data.name); }
  genWeapons() { return this.data.weapons; }
  genBuildType() { return this.data.buildType; }
  genBis() { return this.data.bis; }
  genRotation() { return this.data.rotation; }
  genRateTargets() { return this.data.rateTargets; }
}

class SectPageShell extends ShellBase {
  async genSects() {
    return this.memo('sects', async () => {
      const db = this.db;
      const { results: schools } = await db.prepare(
        'SELECT name, slug, short, family, color, attr, talent_desc FROM schools ORDER BY name ASC'
      ).all().catch(() => ({ results: [] }));
      const { results: bisRows } = await db.prepare('SELECT school, build, attr, rate, bis_json FROM school_bis').all().catch(() => ({ results: [] }));
      const { results: rotRows } = await db.prepare('SELECT school, rotation_json FROM school_rotations').all().catch(() => ({ results: [] }));
      const rotMap = {};
      for (const r of rotRows || []) rotMap[r.school] = r.rotation_json;
      // 每个流派取第一个 build 的 bis (与 REST /bis 默认一致取全量, 这里取首个)
      const bisMap = {};
      for (const r of bisRows || []) if (!bisMap[r.school]) bisMap[r.school] = r;
      return (schools || []).map((sc) => {
        const bis = bisMap[sc.name];
        return new SectShell(this.ctx, {
          slug: sc.slug,
          name: sc.name,
          weapons: sc.short || sc.family || '',
          buildType: sc.attr || '',
          bis: bis ? toBisTable(bis.bis_json) : null,
          rotation: rotMap[sc.name] ? toRotation(rotMap[sc.name]) : null,
          rateTargets: bis ? { accuracy: null, crit: null, critDamage: null, note: bis.rate || null } : null,
        });
      });
    });
  }
}

const SECT_TEXT_RESOLVERS = defineTextGens(SectPageShell, [
  ['sectEmptyText', 'sect', 'empty'],
  ['sectBackLabel', 'sect', 'back'],
  ['sectTabBisLabel', 'sect', 'tabBis'],
  ['sectTabRotationLabel', 'sect', 'tabRotation'],
  ['sectTabRatesLabel', 'sect', 'tabRates'],
  ['sectTabTiaolvLabel', 'sect', 'tabTiaolv'],
  ['sectTabGradLabel', 'sect', 'tabGrad'],
  ['sectNoBisText', 'sect', 'noBis'],
  ['sectNoRotationText', 'sect', 'noRotation'],
  ['sectNoRatesText', 'sect', 'noRates'],
  ['sectRotGreydustLabel', 'sect', 'rotGreydust'],
  ['sectRotOpenerLabel', 'sect', 'rotOpener'],
  ['sectRotLoopLabel', 'sect', 'rotLoop'],
  ['sectRotKeyPointsLabel', 'sect', 'rotKeyPoints'],
  ['sectRotInnerSkillsLabel', 'sect', 'rotInnerSkills'],
  ['sectRotVideoLabel', 'sect', 'rotVideo'],
  ['sectRateAccuracyLabel', 'sect', 'rateAccuracy'],
  ['sectRateCritLabel', 'sect', 'rateCrit'],
  ['sectRateCritDamageLabel', 'sect', 'rateCritDamage'],
  ['sectBisMainWeaponLabel', 'sect', 'bisMainWeapon'],
  ['sectBisOffWeaponLabel', 'sect', 'bisOffWeapon'],
  ['sectBisAccessoriesLabel', 'sect', 'bisAccessories'],
  ['sectBisHeadBodyLabel', 'sect', 'bisHeadBody'],
  ['sectBisLegsWristsLabel', 'sect', 'bisLegsWrists'],
]);

/* ---------- 调律页 ---------- */
// sects/innerSkills/suits/maxValues/sectWeights 是游戏数据与服务端常量
// (叶子记录), 文案字段单独走 gen 方法。
class TiaolvPageShell extends ShellBase {
  async genSects() {
    return this.memo('sects', async () => {
      const { results: schools } = await this.db.prepare(
        'SELECT name, slug FROM schools ORDER BY name ASC'
      ).all().catch(() => ({ results: [] }));
      return (schools || []).map((sc) => ({ slug: sc.slug, name: enSectName(this.locale, sc.name) }));
    });
  }
  genInnerSkills() {
    // 心法名集合 (与 xinfa.json 对应, 避免 Worker 读静态文件) — 游戏数据
    return ['千营一呼', '易水歌', '征人归', '断石之构', '大唐歌', '极乐泣血', '忘川绝响', '花上月令', '剑气纵横'];
  }
  genSuits() { return SUITS; }
  genMaxValues() { return TIAOLV_MAX; }
  genSectWeights() { return SECT_WEIGHTS; }
}

const TIAOLV_TEXT_RESOLVERS = defineTextGens(TiaolvPageShell, [
  ['tlIntroText', 'tiaolv', 'intro'],
  ['tlInnerSkillTemplate', 'tiaolv', 'innerSkill'],
  ['tlInnerSkillPlaceholder', 'tiaolv', 'innerSkillPlaceholder'],
  ['tlWuxueLabel', 'tiaolv', 'wuxue'],
  ['tlWukuLabel', 'tiaolv', 'wuku'],
  ['tlWukuSelfLabel', 'tiaolv', 'wukuSelf'],
  ['tlWukuCommonLabel', 'tiaolv', 'wukuCommon'],
  ['tlSuitLabel', 'tiaolv', 'suit'],
  ['tlBowLabel', 'tiaolv', 'bow'],
  ['tlNoneLabel', 'tiaolv', 'none'],
  ['tlTuneAreaLabel', 'tiaolv', 'tuneArea'],
  ['tlCalcLabel', 'tiaolv', 'calc'],
  ['tlCalculatingLabel', 'tiaolv', 'calculating'],
  ['tlToastFailedText', 'tiaolv', 'toastFailed'],
  ['tlToastFailedWithTemplate', 'tiaolv', 'toastFailedWith'],
  ['tlColAttrLabel', 'tiaolv', 'colAttr'],
  ['tlColBaseLabel', 'tiaolv', 'colBase'],
  ['tlColPanelLabel', 'tiaolv', 'colPanel'],
  ['tlColFinalLabel', 'tiaolv', 'colFinal'],
]);

/* ---------- 武库鉴宝页 (毕业率): 纯文案 shell, 数据走独立查询 ---------- */
/* 配装台 (gear-planner 移植) 并入本页: 参考数据经本 shell 的 gen 方法下发,
 * 计算走 gearPlan / gearAutoCombine / gearParsePaste / gearQuickCalc mutation。 */
class GradPageShell extends ShellBase {
  genGearSlots() { return GP_SLOTS; }
  genGearGearSlots() { return GP_GEAR_SLOTS; }
  genGearAffixes() {
    return this.memo('gearAffixes', () => GP_AFFIX.map((a) => {
      // 英文名覆盖层: label 本地化; short 仅展示, 本地化时用官方全名;
      // key / recipeNames 是规范匹配词, 不动。
      const lab = enAffixName(this.locale, a.label);
      return {
        key: a.key, label: lab, short: lab !== a.label ? lab : a.short, max: a.max, cy: a.cy,
        unit: a.unit || '', sys: a.sys ? enAffixSys(this.locale, a.sys) : null, size: a.size || null,
        cyPct: a.cy / a.max * 100,
        recipeNames: Object.keys(GP_NAME_TO_CLASS).filter((n) => GP_NAME_TO_CLASS[n] === gpClassOf(a.key)),
      };
    }));
  }
  genGearBuilds() {
    return this.memo('gearBuilds', () => GP_BUILDS.map((b, i) => {
      const bowKind = GP_BOW_RECOMMEND[b.bow] || '';
      return {
        idx: i, cat: b.cat, school: enBuildSchool(this.locale, b.school), set: enGearSetName(this.locale, b.set), bow: b.bow,
        bowKind, bowLabel: bowKind ? (GP_BOW_JUE_VALUES[bowKind].label || '') : '',
        note: b.note || null, recipe: b.recipe, sectName: enSectName(this.locale, GP_BUILD_SECT[i] || ''),
        totalBars: b.total,
        targets: b.targets.map((t) => ({ cls: t.cls, label: enClassLabel(this.locale, t.label), n: t.n, flex: t.flex || null })),
      };
    }));
  }
  genGearSlotsBig() { return GP_SLOTS_BIG; }
  genGearSlotsSmall() { return GP_SLOTS_SMALL; }
  genGearBaseFields() {
    return GP_BASE_FIELDS.map((f) => ({ key: f, label: GP_BASE_FIELD_LABELS[f] || f, preset: GP_BASE_PRESET[f] ?? 0 }));
  }
  genGearXinfa() {
    return GP_XINFA.map((x) => ({
      name: x.n, xiao: x.xiao ?? null, da: x.da ?? null, acc: x.acc ?? null,
      crit: x.crit ?? null, int: x.int ?? null, dcrit: x.dcrit ?? null, dint: x.dint ?? null,
      dmg: x.dmg ?? null, pierce: x.pierce ?? null, critDmg: x.critDmg ?? null, intDmg: x.intDmg ?? null,
      shuSys: x.shu ? x.shu.sys : null, shuXiao: x.shu ? (x.shu.xiao ?? null) : null, shuDa: x.shu ? (x.shu.da ?? null) : null,
      sysPierceSys: x.sysPierce ? x.sysPierce.sys : null, sysPierceVal: x.sysPierce ? x.sysPierce.v : null,
      shuBonusSys: x.shuBonus ? x.shuBonus.sys : null, shuBonusVal: x.shuBonus ? x.shuBonus.v : null,
    }));
  }
  genGearTalentRows() {
    return Object.keys(GP_TALENT_ROWS).map((name) => {
      const t = GP_TALENT_ROWS[name];
      return { name, text: gpTalentText(name), xiao: t.xiao || 0, da: t.da || 0, acc: t.acc || 0, crit: t.crit || 0, int: t.int || 0 };
    });
  }
  genGearDingyinRows() {
    return Object.keys(GP_BUILD_DINGYIN).map((school) => {
      const o = GP_BUILD_DINGYIN[school];
      return { school: enBuildSchool(this.locale, school), name: o.name ? enAffixName(this.locale, o.name) : null, wuxue: o.wuxue ? enMartialArtName(this.locale, o.wuxue) : null, verified: !!o.verified, category: o.category || null };
    });
  }
  genGearDingyinLeft() { return Object.keys(GP_DINGYIN_LEFT).map((name) => ({ name: enAffixName(this.locale, name), max: GP_DINGYIN_LEFT[name] })); }
  genGearDingyinRightMax() { return GP_DINGYIN_RIGHT_MAX; }
  genGearWuxueNames() { return [...GP_WUXUE_NAMES]; }
  genGearBows() {
    return Object.keys(GP_BOW_JUE_VALUES).map((kind) => {
      const v = GP_BOW_JUE_VALUES[kind];
      return { kind, label: v.label, acc: v.acc || 0, crit: v.crit || 0, int: v.int || 0 };
    });
  }
  genGearPasteNames() { return Object.keys(GP_PASTE_NAME_TO_KEY).map((name) => ({ name, key: GP_PASTE_NAME_TO_KEY[name] })); }
  genGearNameToClass() { return Object.keys(GP_NAME_TO_CLASS).map((name) => ({ name, cls: GP_NAME_TO_CLASS[name] })); }
  genGearSlotAliases() { return Object.keys(GP_SLOT_ALIAS).map((name) => ({ name, key: GP_SLOT_ALIAS[name] })); }
  genGearOcrAliases() { return Object.keys(GP_OCR_EXTRA_ALIAS).map((name) => ({ name, key: GP_OCR_EXTRA_ALIAS[name] })); }
  genGearLegacyKeys() { return Object.keys(GP_LEGACY_KEY).map((name) => ({ name, key: GP_LEGACY_KEY[name] })); }
  genGearClassLabels() { return Object.keys(GP_CLASS_LABEL).map((name) => ({ name, cls: enClassLabel(this.locale, GP_CLASS_LABEL[name]) })); }
  genGearSchoolTags() { return GP_SCHOOL_TAG_LIST; }
  genGearDemoKit() {
    return GP_DEMO_KIT.map((d) => ({ slot: d.slot, name: d.name, keys: d.keys, dingyinName: d.dingyin.name, dingyinVal: d.dingyin.val }));
  }
  genGearDimRows() { return GP_DIM_ROWS; }
  genGearQuickBarNames() { return GP_QUICK_BAR_NAMES; }
  genGearResDefault() { return 1.85; }
}

const GEAR_DATA_RESOLVERS = {};
for (const f of ['gearSlots', 'gearGearSlots', 'gearAffixes', 'gearBuilds', 'gearSlotsBig', 'gearSlotsSmall',
  'gearBaseFields', 'gearXinfa', 'gearTalentRows', 'gearDingyinRows', 'gearDingyinLeft', 'gearDingyinRightMax', 'gearWuxueNames',
  'gearBows', 'gearPasteNames', 'gearNameToClass', 'gearSlotAliases', 'gearOcrAliases', 'gearLegacyKeys',
  'gearClassLabels', 'gearSchoolTags', 'gearDemoKit', 'gearDimRows', 'gearQuickBarNames', 'gearResDefault']) {
  const genName = 'gen' + f[0].toUpperCase() + f.slice(1);
  GEAR_DATA_RESOLVERS[f] = (p) => p[genName]();
}

const GRAD_TEXT_RESOLVERS = defineTextGens(GradPageShell, [
  ['gradEnteringText', 'grad', 'entering'],
  ['gradTitle', 'grad', 'title'],
  ['gradSubtitle', 'grad', 'subtitle'],
  ['gradMingjinNote', 'grad', 'mingjinNote'],
  ['gradBuildBigLabel', 'grad', 'buildBig'],
  ['gradBuildSmallLabel', 'grad', 'buildSmall'],
  ['gradRingLabel', 'grad', 'ringLabel'],
  ['gradScoreCountLabel', 'grad', 'scoreCount'],
  ['gradScoreValueLabel', 'grad', 'scoreValue'],
  ['gradScoreRateLabel', 'grad', 'scoreRate'],
  ['gradTier1', 'grad', 'tier1'],
  ['gradTier2', 'grad', 'tier2'],
  ['gradTier3', 'grad', 'tier3'],
  ['gradTier4', 'grad', 'tier4'],
  ['gradTier5', 'grad', 'tier5'],
  ['gradTier6', 'grad', 'tier6'],
  ['gradTapHint', 'grad', 'tapHint'],
  ['gradRefTitle', 'grad', 'refTitle'],
  ['gradMaxTableTitle', 'grad', 'maxTableTitle'],
  ['gradColAffixLabel', 'grad', 'colAffix'],
  ['gradColMaxLabel', 'grad', 'colMax'],
  ['gradColResonanceLabel', 'grad', 'colResonance'],
  ['gradSlotTableTitleTemplate', 'grad', 'slotTableTitle'],
  ['gradRateTitle', 'grad', 'rateTitle'],
  ['gradRateOkTemplate', 'grad', 'rateOk'],
  ['gradRateGapTemplate', 'grad', 'rateGap'],
  ['gradRateOverflowTemplate', 'grad', 'rateOverflow'],
  ['gradCompareTitle', 'grad', 'compareTitle'],
  ['gradSaveSchemeLabel', 'grad', 'saveScheme'],
  ['gradSchemeNameTemplate', 'grad', 'schemeName'],
  ['gradNoSchemesText', 'grad', 'noSchemes'],
  ['gradLoadLabel', 'grad', 'load'],
  ['gradDeleteSchemeLabel', 'grad', 'deleteScheme'],
  ['gradCloseLabel', 'common', 'close'],
  ['gradItemScoreTemplate', 'grad', 'itemScore'],
  ['gradRowMainLabel', 'grad', 'rowMain'],
  ['gradRowSubTemplate', 'grad', 'rowSub'],
  ['gradRowResonanceLabel', 'grad', 'rowResonance'],
  ['gradAffixPlaceholder', 'grad', 'affixPlaceholder'],
  ['gradAffixLoadingText', 'grad', 'affixLoading'],
  ['gradValuePlaceholderMaxTemplate', 'grad', 'valuePlaceholderMax'],
  ['gradValuePlaceholder', 'grad', 'valuePlaceholder'],
  ['gradResonanceLabel', 'grad', 'resonance'],
  ['gradOverMaxTemplate', 'grad', 'overMax'],
  ['gradToastSavedTemplate', 'grad', 'toastSaved'],
  ['gradToastLoadedTemplate', 'grad', 'toastLoaded'],
  ['gradToastOldSchemeText', 'grad', 'toastOldScheme'],
  ['gradConfirmLabel', 'common', 'confirm'],
  ['gradCancelLabel', 'common', 'cancel'],
]);

const GEAR_TEXT_RESOLVERS = defineTextGens(GradPageShell, [
  ['gearBenchTitle', 'gear', 'benchTitle'],
  ['gearCalcLabel', 'gear', 'calcLabel'],
  ['gearBenchIntro', 'gear', 'benchIntro'],
  ['gearTargetLabel', 'gear', 'targetLabel'],
  ['gearBowLabel', 'gear', 'bowLabel'],
  ['gearBowNoneLabel', 'gear', 'bowNoneLabel'],
  ['gearExtrasTitle', 'gear', 'extrasTitle'],
  ['gearResLabel', 'gear', 'resLabel'],
  ['gearExtraAccLabel', 'gear', 'extraAccLabel'],
  ['gearExtraCritLabel', 'gear', 'extraCritLabel'],
  ['gearExtraIntLabel', 'gear', 'extraIntLabel'],
  ['gearBaseTitle', 'gear', 'baseTitle'],
  ['gearUnlockLabel', 'gear', 'unlockLabel'],
  ['gearLockLabel', 'gear', 'lockLabel'],
  ['gearModifiedTag', 'gear', 'modifiedTag'],
  ['gearBaseResetLabel', 'gear', 'baseResetLabel'],
  ['gearBaseResetTitle', 'gear', 'baseResetTitle'],
  ['gearBaseResetBody', 'gear', 'baseResetBody'],
  ['gearXinfaLabelTemplate', 'gear', 'xinfaLabelTemplate'],
  ['gearXinfaNoneLabel', 'gear', 'xinfaNoneLabel'],
  ['gearLibTitle', 'gear', 'libTitle'],
 ['gearMyLibTitle', 'gear', 'myLibTitle'],
 ['gearMyBuildsTitle', 'gear', 'myBuildsTitle'],
  ['gearLoginHint', 'gear', 'loginHint'],
  ['gearLibCountTemplate', 'gear', 'libCountTemplate'],
  ['gearFormSlotLabel', 'gear', 'formSlotLabel'],
  ['gearFormNameLabel', 'gear', 'formNameLabel'],
  ['gearFormNamePlaceholder', 'gear', 'formNamePlaceholder'],
  ['gearAffixPlaceholder', 'gear', 'affixPlaceholder'],
  ['gearValuePlaceholder', 'gear', 'valuePlaceholder'],
  ['gearRefTemplate', 'gear', 'refTemplate'],
  ['gearFillMaxLabel', 'gear', 'fillMaxLabel'],
  ['gearFillCyLabel', 'gear', 'fillCyLabel'],
  ['gearDelRowLabel', 'gear', 'delRowLabel'],
  ['gearAddRowLabel', 'gear', 'addRowLabel'],
  ['gearDyNameLabel', 'gear', 'dyNameLabel'],
  ['gearDyNamePlaceholder', 'gear', 'dyNamePlaceholder'],
  ['gearDyValLabel', 'gear', 'dyValLabel'],
  ['gearSchoolsLabel', 'gear', 'schoolsLabel'],
  ['gearAddGearLabel', 'gear', 'addGearLabel'],
  ['gearUpdateGearLabel', 'gear', 'updateGearLabel'],
  ['gearCancelEditLabel', 'gear', 'cancelEditLabel'],
  ['gearDemoLabel', 'gear', 'demoLabel'],
  ['gearClearLibLabel', 'gear', 'clearLibLabel'],
  ['gearClearConfirmTitle', 'gear', 'clearConfirmTitle'],
  ['gearClearConfirmBody', 'gear', 'clearConfirmBody'],
  ['gearEquipLabel', 'gear', 'equipLabel'],
  ['gearUnequipLabel', 'gear', 'unequipLabel'],
  ['gearEditLabel', 'gear', 'editLabel'],
  ['gearDeleteLabel', 'gear', 'deleteLabel'],
  ['gearSimLabel', 'gear', 'simLabel'],
  ['gearSimRealLabel', 'gear', 'simRealLabel'],
  ['gearSimCyLabel', 'gear', 'simCyLabel'],
  ['gearSimMaxLabel', 'gear', 'simMaxLabel'],
  ['gearVerdictHeirloom', 'gear', 'verdictHeirloom'],
  ['gearVerdictDud', 'gear', 'verdictDud'],
  ['gearScoreTemplate', 'gear', 'scoreTemplate'],
  ['gearQualityLabel', 'gear', 'qualityLabel'],
  ['gearExportLabel', 'gear', 'exportLabel'],
  ['gearImportLabel', 'gear', 'importLabel'],
  ['gearImportFailedToast', 'gear', 'importFailedToast'],
  ['gearImportedToastTemplate', 'gear', 'importedToastTemplate'],
  ['gearPasteTitle', 'gear', 'pasteTitle'],
  ['gearPastePlaceholder', 'gear', 'pastePlaceholder'],
  ['gearPasteButtonLabel', 'gear', 'pasteButtonLabel'],
  ['gearPasteDemoLabel', 'gear', 'pasteDemoLabel'],
  ['gearPasteEmptyText', 'gear', 'pasteEmptyText'],
  ['gearPasteOkTemplate', 'gear', 'pasteOkTemplate'],
  ['gearPasteUnknownTemplate', 'gear', 'pasteUnknownTemplate'],
  ['gearPasteFailText', 'gear', 'pasteFailText'],
  ['gearPasteFullText', 'gear', 'pasteFullText'],
  ['gearOcrTitle', 'gear', 'ocrTitle'],
  ['gearOcrDropText', 'gear', 'ocrDropText'],
  ['gearOcrPreparingText', 'gear', 'ocrPreparingText'],
  ['gearOcrRunningText', 'gear', 'ocrRunningText'],
  ['gearOcrSecondText', 'gear', 'ocrSecondText'],
  ['gearOcrFailedText', 'gear', 'ocrFailedText'],
  ['gearOcrBadTypeText', 'gear', 'ocrBadTypeText'],
  ['gearOcrTooBigText', 'gear', 'ocrTooBigText'],
  ['gearOcrNoEngineText', 'gear', 'ocrNoEngineText'],
  ['gearOcrDoneTemplate', 'gear', 'ocrDoneTemplate'],
  ['gearOcrSlotLabel', 'gear', 'ocrSlotLabel'],
  ['gearOcrNameLabel', 'gear', 'ocrNameLabel'],
  ['gearOcrEquipLabel', 'gear', 'ocrEquipLabel'],
  ['gearOcrConfirmLabel', 'gear', 'ocrConfirmLabel'],
  ['gearOcrCancelLabel', 'gear', 'ocrCancelLabel'],
  ['gearOcrUnknownTitle', 'gear', 'ocrUnknownTitle'],
  ['gearOcrSavedTemplate', 'gear', 'ocrSavedTemplate'],
  ['gearOcrNeedLineToast', 'gear', 'ocrNeedLineToast'],
  ['gearOcrLowConfTag', 'gear', 'ocrLowConfTag'],
  ['gearOcrAddRowLabel', 'gear', 'ocrAddRowLabel'],
  ['gearOcrImportSlotTemplate', 'gear', 'ocrImportSlotTemplate'],
  ['gearOcrBatchTitle', 'gear', 'ocrBatchTitle'],
  ['gearOcrBatchDropText', 'gear', 'ocrBatchDropText'],
  ['gearOcrBatchQueuedText', 'gear', 'ocrBatchQueuedText'],
  ['gearOcrBatchRunningText', 'gear', 'ocrBatchRunningText'],
  ['gearOcrBatchReadyText', 'gear', 'ocrBatchReadyText'],
  ['gearOcrBatchFailedText', 'gear', 'ocrBatchFailedText'],
  ['gearOcrBatchImportedText', 'gear', 'ocrBatchImportedText'],
  ['gearOcrBatchRetryLabel', 'gear', 'ocrBatchRetryLabel'],
  ['gearOcrBatchRemoveLabel', 'gear', 'ocrBatchRemoveLabel'],
  ['gearOcrBatchAdjustLabel', 'gear', 'ocrBatchAdjustLabel'],
  ['gearOcrBatchApplyBoxLabel', 'gear', 'ocrBatchApplyBoxLabel'],
  ['gearOcrBatchDetectedText', 'gear', 'ocrBatchDetectedText'],
  ['gearOcrBatchFullImageText', 'gear', 'ocrBatchFullImageText'],
  ['gearOcrBatchDupTag', 'gear', 'ocrBatchDupTag'],
  ['gearOcrBatchDupLibText', 'gear', 'ocrBatchDupLibText'],
  ['gearOcrBatchDupRowText', 'gear', 'ocrBatchDupRowText'],
  ['gearOcrBatchIncludeLabel', 'gear', 'ocrBatchIncludeLabel'],
  ['gearOcrBatchNoLinesText', 'gear', 'ocrBatchNoLinesText'],
  ['gearOcrBatchImportTemplate', 'gear', 'ocrBatchImportTemplate'],
  ['gearOcrBatchResultTemplate', 'gear', 'ocrBatchResultTemplate'],
  ['gearLibEmptyText', 'gear', 'libEmptyText'],
  ['gearEquippedTag', 'gear', 'equippedTag'],
  ['gearLoadoutTitle', 'gear', 'loadoutTitle'],
  ['gearAutoLabel', 'gear', 'autoLabel'],
  ['gearAutoDoneToast', 'gear', 'autoDoneToast'],
  ['gearAutoFallbackToast', 'gear', 'autoFallbackToast'],
  ['gearUnequipAllLabel', 'gear', 'unequipAllLabel'],
  ['gearSlotEmptyText', 'gear', 'slotEmptyText'],
  ['gearPanelTitle', 'gear', 'panelTitle'],
  ['gearGradLabel', 'gear', 'gradLabel'],
  ['gearGradCountLabel', 'gear', 'gradCountLabel'],
  ['gearGradValueLabel', 'gear', 'gradValueLabel'],
  ['gearGradDyLabel', 'gear', 'gradDyLabel'],
  ['gearGradDyToggleLabel', 'gear', 'gradDyToggleLabel'],
  ['gearLoanLabel', 'gear', 'loanLabel'],
  ['gearSimActiveTag', 'gear', 'simActiveTag'],
  ['gearCopySummaryLabel', 'gear', 'copySummaryLabel'],
  ['gearCopiedToast', 'gear', 'copiedToast'],
  ['gearCopyFailedToast', 'gear', 'copyFailedToast'],
  ['gearYAccLabel', 'gear', 'yAccLabel'],
  ['gearYCritLabel', 'gear', 'yCritLabel'],
  ['gearYIntLabel', 'gear', 'yIntLabel'],
  ['gearFinalCritLabel', 'gear', 'finalCritLabel'],
  ['gearWhiteLabel', 'gear', 'whiteLabel'],
  ['gearDawaiLabel', 'gear', 'dawaiLabel'],
  ['gearXiaowaiLabel', 'gear', 'xiaowaiLabel'],
  ['gearDashuLabel', 'gear', 'dashuLabel'],
  ['gearXiaoshuLabel', 'gear', 'xiaoshuLabel'],
  ['gearHpLabel', 'gear', 'hpLabel'],
  ['gearDefLabel', 'gear', 'defLabel'],
  ['gearTalentLabel', 'gear', 'talentLabel'],
  ['gearDiffTitle', 'gear', 'diffTitle'],
  ['gearDiffLackTemplate', 'gear', 'diffLackTemplate'],
  ['gearDiffExactText', 'gear', 'diffExactText'],
  ['gearDiffOverTemplate', 'gear', 'diffOverTemplate'],
  ['gearDiffExtraTitle', 'gear', 'diffExtraTitle'],
  ['gearDiffLowTitle', 'gear', 'diffLowTitle'],
  ['gearDiffDoneText', 'gear', 'diffDoneText'],
  ['gearDiffEmptyText', 'gear', 'diffEmptyText'],
  ['gearDiffInvalidTemplate', 'gear', 'diffInvalidTemplate'],
  ['gearSuggestTitle', 'gear', 'suggestTitle'],
  ['gearSuggestSwapTemplate', 'gear', 'suggestSwapTemplate'],
  ['gearSuggestWashTemplate', 'gear', 'suggestWashTemplate'],
  ['gearSuggestNoneText', 'gear', 'suggestNoneText'],
  ['gearSuggestHeadTemplate', 'gear', 'suggestHeadTemplate'],
  ['gearDySummaryTitle', 'gear', 'dySummaryTitle'],
  ['gearDyCorrectText', 'gear', 'dyCorrectText'],
  ['gearDyWrongText', 'gear', 'dyWrongText'],
  ['gearSchemeTitle', 'gear', 'schemeTitle'],
  ['gearSchemeSaveLabel', 'gear', 'schemeSaveLabel'],
  ['gearSchemeNameTemplate', 'gear', 'schemeNameTemplate'],
  ['gearSchemeLoadLabel', 'gear', 'schemeLoadLabel'],
  ['gearSchemeDeleteLabel', 'gear', 'schemeDeleteLabel'],
  ['gearSchemeEmptyText', 'gear', 'schemeEmptyText'],
  ['gearSchemeComposeFirstText', 'gear', 'schemeComposeFirstText'],
  ['gearSchemeSavedToastTemplate', 'gear', 'schemeSavedToastTemplate'],
  ['gearSchemeLoadedToastTemplate', 'gear', 'schemeLoadedToastTemplate'],
  ['gearSchemeGroupCountTemplate', 'gear', 'schemeGroupCountTemplate'],
  ['gearQuickTitle', 'gear', 'quickTitle'],
  ['gearQuickResLabel', 'gear', 'quickResLabel'],
  ['gearQuickSyncLabel', 'gear', 'quickSyncLabel'],
  ['gearQuickSyncedToast', 'gear', 'quickSyncedToast'],
  ['gearQuickOkText', 'gear', 'quickOkText'],
  ['gearQuickOverTemplate', 'gear', 'quickOverTemplate'],
  ['gearQuickGapTemplate', 'gear', 'quickGapTemplate'],
  ['gearRecipesTitle', 'gear', 'recipesTitle'],
  ['gearRecipeSearchPlaceholder', 'gear', 'recipeSearchPlaceholder'],
  ['gearRecipeAllLabel', 'gear', 'recipeAllLabel'],
  ['gearRecipeColCat', 'gear', 'recipeColCat'],
  ['gearRecipeColSchool', 'gear', 'recipeColSchool'],
  ['gearRecipeColSet', 'gear', 'recipeColSet'],
  ['gearRecipeColRecipe', 'gear', 'recipeColRecipe'],
  ['gearRecipeColBow', 'gear', 'recipeColBow'],
  ['gearRecipeSetTargetLabel', 'gear', 'recipeSetTargetLabel'],
  ['gearRecipeEmptyText', 'gear', 'recipeEmptyText'],
  ['gearRecipeTargetToastTemplate', 'gear', 'recipeTargetToastTemplate'],
  ['gearSectRecipesTitle', 'gear', 'sectRecipesTitle'],
  ['gearAffixTableTitle', 'gear', 'affixTableTitle'],
  ['gearColCyLabel', 'gear', 'colCyLabel'],
  ['gearColCyPctLabel', 'gear', 'colCyPctLabel'],
  ['gearColRecipeNamesLabel', 'gear', 'colRecipeNamesLabel'],
  ['gearSurvivalNote', 'gear', 'survivalNote'],
  ['gearSlotTableTitle', 'gear', 'slotTableTitle'],
  ['gearSlotsBigTitle', 'gear', 'slotsBigTitle'],
  ['gearSlotsSmallTitle', 'gear', 'slotsSmallTitle'],
  ['gearFormulaTitle', 'gear', 'formulaTitle'],
  ['gearFormulaRatesTitle', 'gear', 'formulaRatesTitle'],
  ['gearFormulaDimsTitle', 'gear', 'formulaDimsTitle'],
  ['gearFormulaOrderTitle', 'gear', 'formulaOrderTitle'],
  ['gearFormulaAccTemplate', 'gear', 'formulaAccTemplate'],
  ['gearFormulaCritTemplate', 'gear', 'formulaCritTemplate'],
  ['gearFormulaIntTemplate', 'gear', 'formulaIntTemplate'],
  ['gearFormulaBarsTemplate', 'gear', 'formulaBarsTemplate'],
  ['gearFormulaBowTemplate', 'gear', 'formulaBowTemplate'],
  ['gearFormulaOrderText', 'gear', 'formulaOrderText'],
  ['gearColDimLabel', 'gear', 'colDimLabel'],
  ['gearColConvLabel', 'gear', 'colConvLabel'],
  ['gearColFullBarTemplate', 'gear', 'colFullBarTemplate'],
  ['gearCalcFailedText', 'gear', 'calcFailedText'],
  ['gearDemoLoadedToast', 'gear', 'demoLoadedToast'],
  ['gearSavedToastTemplate', 'gear', 'savedToastTemplate'],
  ['gearDeletedToast', 'gear', 'deletedToast'],
  ['gearClearedToast', 'gear', 'clearedToast'],
]);

/* ---------- 设置页 shell (语言偏好) ----------
 * 文案字段由 gen 方法按 locale 从 settings 节生成; localePref 是账号存储
 * 的偏好 (null = 自动), effectiveLocale 是本请求实际生效的 locale。 */
class SettingsPageShell extends ShellBase {
  genLocalePref() { return loadMyLocalePref(this.ctx); }
  genEffectiveLocale() { return this.locale; }
}
const SETTINGS_TEXT_RESOLVERS = defineTextGens(SettingsPageShell, [
  ['settingsTitle', 'settings', 'title'],
  ['settingsDiscordLabel', 'settings', 'discordLabel'],
  ['settingsLanguageLabel', 'settings', 'languageLabel'],
  ['settingsLanguageHint', 'settings', 'languageHint'],
  ['settingsAutoLabel', 'settings', 'autoLabel'],
  ['settingsLangZhCnLabel', 'settings', 'langZhCn'],
  ['settingsLangZhTwLabel', 'settings', 'langZhTw'],
  ['settingsLangEnLabel', 'settings', 'langEn'],
  ['settingsLangEsLabel', 'settings', 'langEs'],
  ['settingsLangFrLabel', 'settings', 'langFr'],
  ['settingsSavedText', 'settings', 'savedText'],
]);

/* ---------- Mutation payload shell ----------
 * ok/grouping/seats/guild 是数据; error 文案由 genError 按 errorCode +
 * 请求 locale 生成 (码稳定, 文案可变); 无码时 error 为 null。 */
class PayloadBase extends ShellBase {
  genOk() { return !!this.data.ok; }
  genError() { return this.data.errorCode ? errText(this.ctx, this.data.errorCode) : null; }
  genErrorCode() { return this.data.errorCode || null; }
}
class GroupingPayloadShell extends PayloadBase {
  genGrouping() { return this.data.grouping || null; }
}
class SeatPayloadShell extends PayloadBase {
  genSeats() { return this.data.seats || null; }
}
class DeletePayloadShell extends PayloadBase {}
class CreateGuildPayloadShell extends PayloadBase {
  genGuild() { return this.data.guild || null; }
}
class UpdateLocalePayloadShell extends PayloadBase {
  genLocalePref() { return this.data.localePref ?? null; }
  genEffectiveLocale() { return this.data.effectiveLocale || 'zh-CN'; }
}
const uFail = (ctx, code, effectiveLocale) => new UpdateLocalePayloadShell(ctx, {
  ok: false, errorCode: code, localePref: undefined, effectiveLocale,
});
const gFail = (ctx, code) => new GroupingPayloadShell(ctx, { ok: false, errorCode: code });
const sFail = (ctx, code) => new SeatPayloadShell(ctx, { ok: false, errorCode: code });
const dFail = (ctx, code) => new DeletePayloadShell(ctx, { ok: false, errorCode: code });
const cFail = (ctx, code) => new CreateGuildPayloadShell(ctx, { ok: false, errorCode: code });

/* ================= Resolvers ================= */
const resolvers = {
  Query: {
    slotAffixList: async (_, { build }, ctx) => {
      const db = ctx.env.DB;
      const { results } = await db.prepare(
        'SELECT slot, affix_key FROM slot_affix WHERE build = ? ORDER BY slot'
      ).bind(build).all();
      return results.map(r => ({ slot: r.slot, affixKey: r.affix_key }));
    },
    affixMaxList: async (_, __, ctx) => {
      const db = ctx.env.DB;
      const { results } = await db.prepare(
        'SELECT affix_key, name_cn, max_value, unit FROM affix_max ORDER BY affix_key'
      ).all();
      return results.map(r => ({
        key: r.affix_key,
        name: r.name_cn,
        maxValue: r.max_value,
        unit: r.unit || ''
      }));
    },
    hubPage: (_, __, ctx) => new HubPageShell(ctx, {}),

    // 法律页 (服务条款/隐私政策): 公开页面, 匿名可达 (登录页页脚入口)
    legalPage: (_, { kind }, ctx) => new LegalPageShell(ctx, { kind }),

    guildPage: async (_, { slug }, ctx) => {
      const db = ctx.env.DB;
      const a = await getGuildAccess(db, ctx.user, slug, ctx.request);
      if (!a.exists) throw new Error(errText(ctx, 'guildNotFound'));
      if (!a.canView) throw new Error(errText(ctx, 'memberOnlyView'));
      touchGuildRoster(ctx, a);
      const gameVersion = await getGameVersion(db);
      return new GuildPageShell(ctx, {
        slug: a.tenant.slug, name: a.tenant.guild_name, gameVersion, currentVersion: gameVersion, tabs: GUILD_TABS,
      });
    },

    groupingListPage: async (_, { slug, tab }, ctx) => {
      const db = ctx.env.DB;
      // 校验租户存在 + 已绑定百业仅成员可见 (服务端拦截, 非成员拿不到数据)
      const a = await getGuildAccess(db, ctx.user, slug, ctx.request);
      if (!a.exists) throw new Error(errText(ctx, 'guildNotFound'));
      if (!a.canView) throw new Error(errText(ctx, 'memberOnlyView'));
      touchGuildRoster(ctx, a);
      return groupingListPage(ctx, a.tenant.slug, tab);
    },

    groupingDetailPage: async (_, { slug, id }, ctx) => {
      const db = ctx.env.DB;
      const ev = await getEventRow(db, parseInt(id, 10) || 0);
      if (!ev) throw new Error(errText(ctx, 'groupingNotFound'));
      // 租户隔离: 传入 slug 时必须与车队所属百业一致, 否则视为不存在 (不泄露他会数据)
      if (slug != null && s(slug, 40) !== ev.tenant) throw new Error(errText(ctx, 'groupingNotFound'));
      // 已绑定百业: 非成员视为不存在, 不泄露车队内容
      const a = await getGuildAccess(db, ctx.user, ev.tenant, ctx.request);
      if (!a.canView) throw new Error(errText(ctx, 'groupingNotFound'));
      touchGuildRoster(ctx, a);
      return new GroupingDetailPageShell(ctx, ev);
    },

    // ===== Viewer 层级 (root = user) =====
    viewer: async (_, __, ctx) => {
      // 懒刷新: 用户打开应用走 viewer 校验时, 顺带把缺失/超 24h 的服务器昵称
      // 快照用 refresh token 现拉 (本次请求内完成); 失败静默, 用旧快照继续。
      if (ctx.user) { try { await maybeRefreshGuildNicks(ctx.env, ctx.user); } catch { /* 忽略 */ } }
      return new ViewerShell(ctx, {});
    },

    gradPage: (_, __, ctx) => new GradPageShell(ctx, {}),

    // 配装台装备库: 只回调用者自己的 (匿名无库, 返回空)
    myGearItems: async (_, __, ctx) => {
      if (!ctx.user) return [];
      return listGearItems(ctx.env.DB, ctx.user.discordId);
    },
    myGearBuilds: async (_, __, ctx) => {
      if (!ctx.user) return [];
      return listGearBuilds(ctx.env.DB, ctx.user.discordId);
    },

    settingsPage: (_, __, ctx) => new SettingsPageShell(ctx, {}),

    slugAvailable: async (_, { slug }, ctx) => {
      const db = ctx.env.DB;
      const v = String(slug || '').trim().toLowerCase();
      if (!/^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/.test(v) || v.length < 2 || v.length > 40) return false;
      if (CREATE_RESERVED.has(v)) return false;
      const t = await getTenantSlug(db, v);
      return !t;
    },

    dexPage: (_, __, ctx) => new DexPageShell(ctx, {}),

    bossPage: async (_, { bossId }, ctx) => {
      const db = ctx.env.DB;
      const b = await db.prepare('SELECT * FROM bosses WHERE id = ?').bind(parseInt(bossId, 10) || 0).first();
      if (!b) throw new Error(errText(ctx, 'bossNotFound'));
      return new BossPageShell(ctx, {
        bossShell: new BossShell(ctx, { id: b.id, name: b.name, row: b, dungeonName: b.dungeon || null }),
      });
    },

    sectPage: (_, __, ctx) => new SectPageShell(ctx, {}),

    tiaolvPage: (_, __, ctx) => new TiaolvPageShell(ctx, {}),
  },

  Mutation: {
    // ---- 配装台计算 (src/gearplanner.js; 与 calcGraduation 口径不同, 并存) ----
    gearPlan: async (_, { input }, ctx) => {
      if (!rateLimit('mut:gearplan:' + getClientIp(ctx.request), 20)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      const lib = (input.lib || []).map((g) => gpSanitizeGearData({
        id: g.id, slot: g.slot, name: g.name || '', lines: g.lines || [],
        dingyin: g.dingyin || null, schools: g.schools || [],
      }).gear);
      const loadout = {};
      (input.loadout || []).forEach((e) => { loadout[e.slot] = e.gearId; });
      const baseValues = {};
      (input.baseValues || []).forEach((v) => { baseValues[v.key] = v.val; });
      const sim = {};
      (input.sim || []).forEach((s) => { if (s.tier === 'cy' || s.tier === 'max') sim[s.id] = s.tier; });
      const state = {
        targetIdx: input.targetIdx || 0, baseValues, xinfa: input.xinfa || [],
        extras: { res: input.res, acc: input.extraAcc, crit: input.extraCrit, int: input.extraInt, bowKind: input.bowKind || '' },
        sim, gradDingyinOn: input.gradDingyinOn !== false,
      };
      const r = gpPlan(lib, loadout, state);
      // 传家宝推送评估 (服务端, waitUntil 异步; 未登录/失败静默, 不影响计算)
      if (ctx.user && ctx.user.discordId && ctx.env && ctx.env.DB) {
        const run = evaluateHeirloomPushes(ctx.env.DB, {
          discordId: String(ctx.user.discordId),
          userName: String(ctx.user.name || ''),
          userGuilds: Array.isArray(ctx.user.guilds) ? ctx.user.guilds.map(String) : [],
          lib, loadout, targetIdx: state.targetIdx,
          evals: r.gearEvals, gradTotal: r.grad.total,
        }).catch(() => { /* 推送评估失败绝不影响配装计算 */ });
        if (ctx.executionCtx && typeof ctx.executionCtx.waitUntil === 'function') {
          ctx.executionCtx.waitUntil(run);
        }
      }
      return {
        panel: r.panel, grad: r.grad, realPanel: r.realPanel, realGrad: r.realGrad,
        loanGrad: r.loanGrad, suggestions: r.suggestions, extraClasses: r.extraClasses,
        gearEvals: r.gearEvals,
        baseNotes: r.baseSummary.xinfaNotes, xinfaPicked: r.baseSummary.xinfaPicked,
        xinfaDuplicates: r.baseSummary.xinfaDuplicates,
      };
    },

    gearAutoCombine: async (_, { targetIdx, lib }, ctx) => {
      if (!rateLimit('mut:gearauto:' + getClientIp(ctx.request), 20)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      const clean = (lib || []).map((g) => gpSanitizeGearData({
        id: g.id, slot: g.slot, name: g.name || '', lines: g.lines || [],
        dingyin: g.dingyin || null, schools: g.schools || [],
      }).gear);
      const r = gpAutoCombine(clean, targetIdx || 0);
      return {
        loadout: Object.keys(r.loadout).map((slot) => ({ slot, gearId: r.loadout[slot] })),
        fallbackUsed: r.fallbackUsed,
      };
    },

    gearParsePaste: async (_, { text }, ctx) => {
      if (!rateLimit('mut:gearpaste:' + getClientIp(ctx.request), 20)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      const r = gpParsePaste(String(text || '').slice(0, 200000));
      return {
        mode: r.mode, unknown: r.unknown, gears: r.gears,
        fullExportJson: r.fullExport ? JSON.stringify(r.fullExport) : null,
      };
    },

    gearQuickCalc: async (_, { input }, ctx) => {
      if (!rateLimit('mut:gearquick:' + getClientIp(ctx.request), 30)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      return gpQuickCalc(input.whiteAcc, input.whiteCrit, input.whiteInt, input.res);
    },

    // ---- 配装台装备库写操作 (会话复验 + discord_id 限定; 他人行视为不存在) ----
    addGearItem: async (_, { input }, ctx) => {
      if (!ctx.user) return { ok: false, item: null, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      if (!rateLimit('mut:gearitem:' + getClientIp(ctx.request), 60)) {
        return { ok: false, item: null, error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited' };
      }
      const gear = gpSanitizeGearData({
        slot: input.slot, name: input.name || '', lines: input.lines || [],
        dingyin: input.dingyin || null, schools: input.schools || [],
      }).gear;
      const saved = await insertGearItem(ctx.env.DB, ctx.user.discordId, gear);
      return { ok: true, item: saved, error: null, errorCode: null };
    },

    updateGearItem: async (_, { id, input }, ctx) => {
      if (!ctx.user) return { ok: false, item: null, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      if (!rateLimit('mut:gearitem:' + getClientIp(ctx.request), 60)) {
        return { ok: false, item: null, error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited' };
      }
      const db = ctx.env.DB, did = ctx.user.discordId;
      let schools = input.schools;
      if (schools == null) {
        const mine = await listGearItems(db, did);
        const old = mine.find((g) => g.id === id);
        if (!old) return { ok: false, item: null, error: errText(ctx, 'gearNotFound'), errorCode: 'gearNotFound' };
        schools = old.schools || [];
      }
      const gear = gpSanitizeGearData({
        slot: input.slot, name: input.name || '', lines: input.lines || [],
        dingyin: input.dingyin || null, schools,
      }).gear;
      const saved = await updateGearItemRow(db, did, id, gear);
      if (!saved) return { ok: false, item: null, error: errText(ctx, 'gearNotFound'), errorCode: 'gearNotFound' };
      return { ok: true, item: saved, error: null, errorCode: null };
    },

    deleteGearItem: async (_, { id }, ctx) => {
      if (!ctx.user) return { ok: false, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      const done = await deleteGearItemRow(ctx.env.DB, ctx.user.discordId, id);
      if (!done) return { ok: false, error: errText(ctx, 'gearNotFound'), errorCode: 'gearNotFound' };
      return { ok: true, error: null, errorCode: null };
    },

    importGearItems: async (_, { items, loadout }, ctx) => {
      if (!ctx.user) return { ok: false, items: [], autoSelect: [], error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      if (!rateLimit('mut:gearimport:' + getClientIp(ctx.request), 20)) {
        return { ok: false, items: [], autoSelect: [], error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited' };
      }
      const db = ctx.env.DB, did = ctx.user.discordId;
      const saved = [];
      for (const input of (items || []).slice(0, 200)) {
        const gear = gpSanitizeGearData({
          slot: input.slot, name: input.name || '', lines: input.lines || [],
          dingyin: input.dingyin || null, schools: input.schools || [],
        }).gear;
        saved.push(await insertGearItem(db, did, gear));
      }
      // 自动选入 (对照原站 importParsedGears): 武器先主后副, 其余取空位
      const lo = {};
      (loadout || []).forEach((e) => { lo[e.slot] = e.gearId; });
      const autoSelect = [];
      for (const it of saved) {
        if (it.slot === '武器') {
          if (!lo['主武器']) { lo['主武器'] = it.id; autoSelect.push({ slot: '主武器', gearId: it.id }); }
          else if (!lo['副武器']) { lo['副武器'] = it.id; autoSelect.push({ slot: '副武器', gearId: it.id }); }
        } else if (!lo[it.slot]) { lo[it.slot] = it.id; autoSelect.push({ slot: it.slot, gearId: it.id }); }
      }
      return { ok: true, items: saved, autoSelect, error: null, errorCode: null };
    },

    saveGearBuild: async (_, { input }, ctx) => {
      if (!ctx.user) return { ok: false, build: null, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      if (!rateLimit('mut:gearbuild:' + getClientIp(ctx.request), 30)) {
        return { ok: false, build: null, error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited' };
      }
      const db = ctx.env.DB, did = ctx.user.discordId;
      const items = await listGearItems(db, did);
      const owned = new Set(items.map((g) => g.id));
      const lo = {};
      (input.loadout || []).forEach((e) => { if (owned.has(e.gearId)) lo[e.slot] = e.gearId; });
      if (!Object.keys(lo).length) {
        return { ok: false, build: null, error: errText(ctx, 'gearEmptyBuild'), errorCode: 'gearEmptyBuild' };
      }
      const baseValues = {};
      (input.baseValues || []).forEach((v) => { baseValues[v.key] = v.val; });
      const state = {
        targetIdx: input.targetIdx || 0, baseValues, xinfa: input.xinfa || [],
        extras: { res: input.res, acc: input.extraAcc, crit: input.extraCrit, int: input.extraInt, bowKind: input.bowKind || '' },
        sim: {}, gradDingyinOn: input.gradDingyinOn !== false,
      };
      const r = gpPlan(items, lo, state);
      const b = GP_BUILDS[state.targetIdx] || GP_BUILDS[0];
      const snapshot = {
        total: r.realGrad.total, a: r.realGrad.A, b: r.realGrad.B, d: r.realGrad.D,
        loan: r.loanGrad.total, yAcc: r.realPanel.yAcc, yCrit: r.realPanel.yCrit,
        yInt: r.realPanel.yInt, dawai: r.realPanel.dawai, xiaowai: r.realPanel.xiaowai,
      };
      const saved = await insertGearBuild(db, did, {
        name: input.name || '', targetIdx: state.targetIdx,
        buildLabel: b.school + ' · ' + b.set, loadout: lo, baseValues,
        xinfa: state.xinfa, extras: { res: state.extras.res ?? 1.85, acc: state.extras.acc || 0, crit: state.extras.crit || 0, int: state.extras.int || 0 },
        bowKind: state.extras.bowKind, gradDingyinOn: state.gradDingyinOn, snapshot,
      });
      return { ok: true, build: saved, error: null, errorCode: null };
    },

    deleteGearBuild: async (_, { id }, ctx) => {
      if (!ctx.user) return { ok: false, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      const done = await deleteGearBuildRow(ctx.env.DB, ctx.user.discordId, id);
      if (!done) return { ok: false, error: errText(ctx, 'gearNotFound'), errorCode: 'gearNotFound' };
      return { ok: true, error: null, errorCode: null };
    },

    // 账号级语言偏好: locale=null 清除 (回自动); 有值必须在受支持集合内。
    // 生效 locale 的解析在 worker 层完成 (偏好压过浏览器语言), 这里只落库
    // 并回带变更后的 pref 与即时生效值 (清除时回退到浏览器协商值)。
    updateMyLocale: async (_, { locale }, ctx) => {
      const browser = ctx.browserLocale || ctx.locale || 'zh-CN';
      if (!ctx.user) return uFail(ctx, 'loginRequired', browser);
      if (locale !== null && locale !== undefined && !SUPPORTED_LOCALES.includes(locale)) {
        return uFail(ctx, 'localeUnsupported', ctx.locale || browser);
      }
      const pref = locale || null;
      await setUserLocalePref(ctx.env, ctx.user.discordId, pref);
      return new UpdateLocalePayloadShell(ctx, {
        ok: true, errorCode: null, localePref: pref, effectiveLocale: pref || browser,
      });
    },

    // App 推送令牌注册/注销 (发车提醒的 Expo 通道): 身份只认会话
    // ctx.user, 客户端传什么都不信; 令牌格式不合直接拒。
    registerPushToken: async (_, { token, platform }, ctx) => {
      if (!ctx.user) return { ok: false, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      const t = String(token || '').trim();
      if (!isValidPushToken(t)) {
        return { ok: false, error: errText(ctx, 'pushTokenInvalid'), errorCode: 'pushTokenInvalid' };
      }
      await ensurePushTokensTable(ctx.env.DB);
      await savePushToken(ctx.env.DB, ctx.user.discordId, t, platform || '');
      return { ok: true, error: null, errorCode: null };
    },

    unregisterPushToken: async (_, { token }, ctx) => {
      if (!ctx.user) return { ok: false, error: errText(ctx, 'loginRequired'), errorCode: 'loginRequired' };
      await ensurePushTokensTable(ctx.env.DB);
      await deletePushToken(ctx.env.DB, ctx.user.discordId, String(token || '').trim());
      return { ok: true, error: null, errorCode: null };
    },

    // 自助创建百业: 登录 + 必须是所绑 Discord 服务器的管理员/服主
    createGuild: async (_, { input }, ctx) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:createGuild:' + getClientIp(ctx.request), 5, 3600000)) {
        return cFail(ctx, 'createRateLimited');
      }
      const user = ctx.user;
      if (!user) return cFail(ctx, 'loginRequiredShort');
      const name = s(input.name, 20);
      if (name.length < 2) return cFail(ctx, 'guildNameShort');
      const slug = String(input.slug || '').trim().toLowerCase();
      if (!/^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/.test(slug) || slug.length < 2 || slug.length > 40) {
        return cFail(ctx, 'slugInvalid');
      }
      if (CREATE_RESERVED.has(slug)) return cFail(ctx, 'slugReserved');
      const exists = await getTenantSlug(db, slug);
      if (exists) return cFail(ctx, 'slugTaken');
      const dgid = String(input.discordGuildId || '');
      if (!/^\d{5,25}$/.test(dgid)) return cFail(ctx, 'serverRequired');
      const servers = await getServersForUser(db, user);
      const sv = servers.find((x) => x.id === dgid);
      if (!sv) return cFail(ctx, 'notInServer');
      if (!serverCanManage(sv)) {
        return cFail(ctx, 'cannotManageServer');
      }
      // 租户结构与 tenants 表一致; password_hash 随机生成 (Discord 建的业暂不走密码登录)。
      // 注: REST /api/onboard 匿名建业已于 2026-10-25 下线 (审计 A4), 本 mutation 是唯一建业路径。
      const hash = await sha256hexLocal(crypto.randomUUID() + ':' + user.discordId + ':' + Date.now());
      await insertTenant(db, { slug, guildName: name, passwordHash: hash, announcement: '' });
      await setTenantSetting(db, slug, 'discord_guild_id', dgid);
      const a = await getGuildAccess(db, user, slug, ctx.request);
      return new CreateGuildPayloadShell(ctx, { ok: true, guild: guildResult(ctx, a) });
    },

    // 写操作 gate (requireWrite): 登录 + 已绑定 + 成员; 未绑定百业写功能锁死
    createGrouping: async (_, { input }, ctx) => {
      const db = ctx.env.DB;
      // 限流: 每 IP 每分钟最多 10 次发车
      if (!rateLimit('mut:create:' + getClientIp(ctx.request), 10)) {
        return gFail(ctx, 'rateLimited');
      }
      const slug = s(input.slug, 40);
      const gate = await requireWrite(db, ctx.user, slug, ctx.request);
      if (gate) return gFail(ctx, gate);
      const title = s(input.title, 40);
      if (!title) return gFail(ctx, 'titleRequired');
      const type = TAB_TO_TYPE[input.type] || 'activity';
      let utc = parseInt(input.startsAt, 10) || 0;
      if (!utc && input.startsAt) {
        const ms = Date.parse(input.startsAt);
        if (!Number.isNaN(ms)) utc = Math.floor(ms / 1000);
      }
      const now = Math.floor(Date.now() / 1000);
      if (!utc || utc < now - 3600) return gFail(ctx, 'badStartTime');
      if (utc > now + 60 * 86400) return gFail(ctx, 'startTimeTooFar');
      // 人数规则 (用户裁决): 双十不写副本名、恒 10 人 (带 dungeonId 也忽略);
      // 爬塔镜像双十: 同样不写副本名、恒 10 人 (带 dungeonId 也忽略);
      // 天赋/竞速选了副本按副本 size 定人数, 不指定走默认 (天赋 5 / 竞速 10)。
      let maxSlots = type === 'talent' ? 5 : 10;
      let dungeonName = '';
      if (type !== 'activity' && type !== 'tower' && input.dungeonId) {
        const d = await db.prepare('SELECT name, size FROM dungeons WHERE id = ?').bind(parseInt(input.dungeonId, 10) || 0).first();
        if (d) {
          dungeonName = d.name;
          const sz = Number(d.size);
          if (sz === 5 || sz === 10) maxSlots = sz;
        }
      }
      // 车头身份落库: 取会话 discord_id (requireWrite 已保证登录), 解散时复验
      await ensureEventCreatorColumn(db);
      const r = await insertEvent(db, {
        tenant: slug, title, type, description: '', starts_at: '', starts_at_utc: utc,
        max_slots: maxSlots, status: 'open', origin: 'member', created_by: '热心侠客',
        dungeon: dungeonName, creator_discord_id: String(ctx.user.discordId),
      });
      const eventId = r.last_row_id;
      if (Array.isArray(input.seats)) {
        await ensureSignupDiscordColumn(db);
        const seatRows = [];
        for (const st of input.seats.slice(0, maxSlots)) {
          const nm = s(st.nickname, 30), wp = s(st.weapon, 20);
          if (!nm || !wp) continue;
          // 发车预排座位同 join 口径: 昵称是发车人本人身份才盖他的戳
          const stamp = await selfStampFor(db, ctx.user, slug, nm);
          seatRows.push({ event_id: eventId, nickname: nm, uid: newUid(), role: roleOf(wp), weapon: wp, discord_id: stamp });
        }
        if (seatRows.length) await insertSignups(db, seatRows);
      }
      const ev = await getEventRow(db, eventId);
      publishGroupingEvent(ctx, slug, eventId, 'created');
      return new GroupingPayloadShell(ctx, { ok: true, grouping: toGrouping(ctx, ev) });
    },

    updateGrouping: async (_, { id, input }, ctx) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:update:' + getClientIp(ctx.request), 20)) {
        return gFail(ctx, 'rateLimited');
      }
      await ensureEventCreatorColumn(db);
      const gid = parseInt(id, 10) || 0;
      const ev = await getEventRow(db, gid);
      if (!ev) return gFail(ctx, 'groupingNotFound');
      const gate = await requireWrite(db, ctx.user, ev.tenant, ctx.request);
      if (gate) return gFail(ctx, gate);
      if (ev.origin !== 'member') return gFail(ctx, 'officialEvent');
      // 编辑收口 (2026-10-25 用户裁决: 编辑车队也只有车头可以): 与
      // disbandGrouping 同一条规则 — 身份只认 creator_discord_id 与会话
      // discord_id 的比对; 座位名单编辑同走本 mutation, 一并收口。
      // 未记录车头的旧车谁都不能编辑, 只能走管理员通道。
      if (!ev.creator_discord_id) {
        return gFail(ctx, 'noCreatorRecordedEdit');
      }
      if (String(ev.creator_discord_id) !== String(ctx.user.discordId)) {
        return gFail(ctx, 'leaderOnlyEdit');
      }
      const patch = {};
      const set = (col, val) => { patch[col] = val; };
      if (input.title !== undefined && input.title !== null) set('title', s(input.title, 40));
      if (input.startsAt !== undefined && input.startsAt !== null) {
        let u = parseInt(input.startsAt, 10) || 0;
        if (!u) { const ms = Date.parse(input.startsAt); if (!Number.isNaN(ms)) u = Math.floor(ms / 1000); }
        if (u > 0) set('starts_at_utc', u);
      }
      if (ev.status === 'draft') set('status', 'open');
      if (Object.keys(patch).length) {
        await updateEventFields(db, gid, null, patch);
      }
      if (Array.isArray(input.seats)) {
        await ensureSignupDiscordColumn(db);
        // 身份戳在整表重写时的去留 (保守口径): 旧座位里该昵称有且仅有一个
        // 戳, 且戳主的当前身份名仍与该昵称一致 -> 沿用; 昵称被改成别人、
        // 旧戳有歧义、或戳主已改名 -> 一律不带戳。编辑动作本身不新盖戳
        // (点保存的人不是在落座)。
        const oldSeats = await listSignupNamesStamps(db, gid);
        const stampByNick = new Map();
        for (const os of oldSeats || []) {
          if (!os.discord_id) continue;
          const key = String(os.nickname || '').trim();
          if (!stampByNick.has(key)) stampByNick.set(key, new Set());
          stampByNick.get(key).add(String(os.discord_id));
        }
        const dgidU = await getTenantSetting(db, ev.tenant, 'discord_guild_id');
        const carryCache = new Map();
        const carryStamp = async (nm) => {
          const set = stampByNick.get(nm);
          if (!set || set.size !== 1) return null;
          const d = [...set][0];
          if (!carryCache.has(d)) carryCache.set(d, await identityNamesFor(db, d, dgidU));
          return carryCache.get(d).has(nm) ? d : null;
        };
        await deleteSignupsByEvent(db, gid);
        const seatRows = [];
        for (const st of input.seats.slice(0, ev.max_slots)) {
          const nm = s(st.nickname, 30), wp = s(st.weapon, 20);
          if (!nm || !wp) continue;
          const stamp = await carryStamp(nm);
          seatRows.push({ event_id: gid, nickname: nm, uid: newUid(), role: roleOf(wp), weapon: wp, discord_id: stamp });
        }
        if (seatRows.length) await insertSignups(db, seatRows);
      }
      const nev = await getEventRow(db, gid);
      publishGroupingEvent(ctx, ev.tenant, gid, 'updated');
      return new GroupingPayloadShell(ctx, { ok: true, grouping: toGrouping(ctx, nev) });
    },

    // 解散车队 (2026-10-24 用户裁决): "人人可管" 的唯一例外 — 仅车头可为。
    // 身份只认 events.creator_discord_id 与会话 discord_id 的比对 (服务端
    // 复验, 与前端是否显示按钮无关); 未记录车头的旧车谁都无法解散,
    // 只能走管理员通道 (REST admin 删除保持不变)。
    disbandGrouping: async (_, { id }, ctx) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:disband:' + getClientIp(ctx.request), 10)) {
        return dFail(ctx, 'rateLimited');
      }
      await ensureEventCreatorColumn(db);
      const gid = parseInt(id, 10) || 0;
      const ev = await getEventTenantCreator(db, gid);
      if (!ev) return dFail(ctx, 'groupingNotFound');
      const gate = await requireWrite(db, ctx.user, ev.tenant, ctx.request);
      if (gate) return dFail(ctx, gate);
      if (!ev.creator_discord_id) {
        return dFail(ctx, 'noCreatorRecorded');
      }
      if (String(ev.creator_discord_id) !== String(ctx.user.discordId)) {
        return dFail(ctx, 'leaderOnlyDisband');
      }
      await deleteEventCascade(db, gid, null);
      publishGroupingEvent(ctx, ev.tenant, gid, 'deleted');
      return new DeletePayloadShell(ctx, { ok: true });
    },

    // 完成车队 (2026-10-25): 开完的车标记 completed — 与 closed 语义不同:
    // closed 只是截止报名, 仍在列表且仍发提醒; completed 从所有列表消失,
    // 且提醒/推送口径 (reminder PENDING_WHERE 只认 open/closed) 自动不再
    // 触发 — 即使闹钟已排队, GuildHub 到点重查 D1 时也会被过滤掉。
    // 权限与编辑/解散同门: 仅车头 (creator_discord_id); 无车头记录的存量
    // 车谁都不能完成, 走管理员通道。从 open / closed 都可完成。
    completeGrouping: async (_, { id }, ctx) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:complete:' + getClientIp(ctx.request), 10)) {
        return gFail(ctx, 'rateLimited');
      }
      await ensureEventCreatorColumn(db);
      const gid = parseInt(id, 10) || 0;
      const ev = await getEventRow(db, gid);
      if (!ev) return gFail(ctx, 'groupingNotFound');
      const gate = await requireWrite(db, ctx.user, ev.tenant, ctx.request);
      if (gate) return gFail(ctx, gate);
      if (ev.origin !== 'member') return gFail(ctx, 'officialEvent');
      if (!ev.creator_discord_id) {
        return gFail(ctx, 'noCreatorRecordedComplete');
      }
      if (String(ev.creator_discord_id) !== String(ctx.user.discordId)) {
        return gFail(ctx, 'leaderOnlyComplete');
      }
      if (ev.status === 'completed') return gFail(ctx, 'groupingAlreadyCompleted');
      // draft 在 GraphQL 表面处处不可见 (列表已过滤), 按不存在处理
      if (ev.status !== 'open' && ev.status !== 'closed') return gFail(ctx, 'groupingNotFound');
      await setEventStatus(db, gid, 'completed');
      const nev = await getEventRow(db, gid);
      // kind=updated: 列表实时摘除 + GuildHub 重排闹钟 (完成车不再是待提醒)
      publishGroupingEvent(ctx, ev.tenant, gid, 'updated');
      return new GroupingPayloadShell(ctx, { ok: true, grouping: toGrouping(ctx, nev) });
    },

    // 恢复车队 (撤销完成): 与 completeGrouping 成对, 同门校验。恢复一律
    // 回到 open (不还原完成前的 closed 态 — 保持简单, 车头可再手动关闭
    // 报名口径由 REST close / 状态机承担)。
    reopenGrouping: async (_, { id }, ctx) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:reopen:' + getClientIp(ctx.request), 10)) {
        return gFail(ctx, 'rateLimited');
      }
      await ensureEventCreatorColumn(db);
      const gid = parseInt(id, 10) || 0;
      const ev = await getEventRow(db, gid);
      if (!ev) return gFail(ctx, 'groupingNotFound');
      const gate = await requireWrite(db, ctx.user, ev.tenant, ctx.request);
      if (gate) return gFail(ctx, gate);
      if (ev.origin !== 'member') return gFail(ctx, 'officialEvent');
      if (!ev.creator_discord_id) {
        return gFail(ctx, 'noCreatorRecordedReopen');
      }
      if (String(ev.creator_discord_id) !== String(ctx.user.discordId)) {
        return gFail(ctx, 'leaderOnlyReopen');
      }
      if (ev.status !== 'completed') return gFail(ctx, 'groupingNotCompleted');
      await setEventStatus(db, gid, 'open');
      const nev = await getEventRow(db, gid);
      publishGroupingEvent(ctx, ev.tenant, gid, 'updated');
      return new GroupingPayloadShell(ctx, { ok: true, grouping: toGrouping(ctx, nev) });
    },

    joinGrouping: async (_, { input }, ctx) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:join:' + getClientIp(ctx.request), 30)) {
        return sFail(ctx, 'rateLimited');
      }
      const gid = parseInt(input.groupingId, 10) || 0;
      const ev = await getEventRow(db, gid);
      if (!ev) return sFail(ctx, 'groupingNotFound');
      if (ev.status !== 'open') return sFail(ctx, 'groupingClosed');
      const gate = await requireWrite(db, ctx.user, ev.tenant, ctx.request);
      if (gate) return sFail(ctx, gate);
      const weapon = s(input.weapon, 40);
      const uid = newUid();
      await ensureSignupDiscordColumn(db);
      // 报名身份收口 (2026-10-25 用户裁决): 落座名与身份戳都由服务端定,
      // 客户端传来的 nickname 不作数 (覆盖, 不报错)。
      //  - 自己报名: 名 = 本人 Discord 服务器昵称 (回退全局名), 戳 = 本人。
      //  - 代报名 (forDiscordId): 目标必须在本百业名册 (guild_members)
      //    内, 服务端复验; 名 = 名册昵称 (回退全局名), 戳 = 被代报者 —
      //    这样提醒 @ 与推送都能精确找到本人。
      let nickname = '';
      let stamp = null;
      const forId = input.forDiscordId ? String(input.forDiscordId).trim() : '';
      if (forId) {
        await ensureGuildMembersTable(db);
        const m = await db.prepare(
          'SELECT nick, global_name FROM guild_members WHERE tenant = ? AND discord_id = ?'
        ).bind(ev.tenant, forId).first().catch(() => null);
        if (!m) return sFail(ctx, 'proxyTargetNotInRoster');
        nickname = String(m.nick || '').trim() || String(m.global_name || '').trim();
        if (!nickname) return sFail(ctx, 'nicknameRequired');
        nickname = nickname.slice(0, 30);
        stamp = forId;
      } else {
        nickname = (await canonicalSignupName(db, ctx.user, ev.tenant)).slice(0, 30);
        if (!nickname) return sFail(ctx, 'nicknameRequired');
        stamp = String(ctx.user.discordId);
      }
      try {
        const r = await db.prepare(
          `INSERT INTO signups (event_id, nickname, uid, role, weapon, discord_id)
           SELECT ?, ?, ?, ?, ?, ?
           WHERE (SELECT COUNT(*) FROM signups WHERE event_id = ?)
               < (SELECT max_slots FROM events WHERE id = ? AND status = 'open')`
        ).bind(gid, nickname, uid, roleOf(weapon), weapon, stamp, gid, gid).run();
        if (!r.meta.changes) return sFail(ctx, 'groupingFull');
        const full = await getSignupCapacityStats(db, gid);
        if (full && full.c >= full.m && full.h === 0) {
          await deleteSignupById(db, r.meta.last_row_id);
          return sFail(ctx, 'lastSeatHealer');
        }
      } catch (e) {
        if (String(e.message).includes('UNIQUE')) return sFail(ctx, 'alreadyJoined');
        throw e;
      }
      const g = toGrouping(ctx, ev);
      publishGroupingEvent(ctx, ev.tenant, gid, 'seats');
      return new SeatPayloadShell(ctx, { ok: true, seats: await g.genSeats() });
    },

    leaveGrouping: async (_, { input }, ctx) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:leave:' + getClientIp(ctx.request), 30)) {
        return sFail(ctx, 'rateLimited');
      }
      const gid = parseInt(input.groupingId, 10) || 0;
      const ev0 = await getEventTenant(db, gid);
      if (!ev0) return sFail(ctx, 'groupingNotFound');
      const gate = await requireWrite(db, ctx.user, ev0.tenant, ctx.request);
      if (gate) return sFail(ctx, gate);
      const r = await deleteSignupByEventUid(db, gid, s(input.uid, 30));
      if (!r.changes) return sFail(ctx, 'seatNotFound');
      const ev = await getEventRow(db, gid);
      const g = ev ? toGrouping(ctx, ev) : null;
      publishGroupingEvent(ctx, ev0.tenant, gid, 'seats');
      return new SeatPayloadShell(ctx, { ok: true, seats: g ? await g.genSeats() : null });
    },

    updateSeatWeapon: async (_, { input }, ctx) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:seat:' + getClientIp(ctx.request), 30)) {
        return sFail(ctx, 'rateLimited');
      }
      const gid = parseInt(input.groupingId, 10) || 0;
      const weapon = s(input.weapon, 40);
      if (!weapon) return sFail(ctx, 'paramsIncomplete');
      const ev0 = await getEventTenant(db, gid);
      if (!ev0) return sFail(ctx, 'groupingNotFound');
      const gate = await requireWrite(db, ctx.user, ev0.tenant, ctx.request);
      if (gate) return sFail(ctx, gate);
      const r = await updateSignupWeaponRoleByUid(db, gid, s(input.uid, 30), weapon, roleOf(weapon));
      if (!r.changes) return sFail(ctx, 'seatNotFound');
      const ev = await getEventRow(db, gid);
      const g = ev ? toGrouping(ctx, ev) : null;
      publishGroupingEvent(ctx, ev0.tenant, gid, 'seats');
      return new SeatPayloadShell(ctx, { ok: true, seats: g ? await g.genSeats() : null });
    },

    calcTiaolv: async (_, { input }, ctx) => {
      // 限流: 计算密集型, 每 IP 每分钟 30 次
      if (!rateLimit('mut:tiaolv:' + getClientIp(ctx.request), 30)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      // 严格复刻 片雲 DIY 0.10.2 Excel 公式 (src/tiaolv.js)
      // 术语: 基础白值(B列) / 面板白值(C列) / 最终面板(D列)
      const tunes = {};
      for (const t of (input.tunes || [])) {
        if (!t || t.cell == null) continue;
        const n = Number(t.value);
        tunes[String(t.cell)] = Number.isFinite(n) ? n : 0;
      }
      const rows = tlCalculateExcel({
        innerSkills: input.innerSkills || [],
        wuxue: input.wuxue || undefined,
        wuku: input.wuku || undefined,
        attrRequire: typeof input.attrRequire === 'number' ? input.attrRequire : undefined,
        suit: input.suit || '',
        bowSkill: input.bowSkill || '',
        tunes,
      });
      return { rows };
    },

    calcGraduation: async (_, { input }, ctx) => {
      if (!rateLimit('mut:grad:' + getClientIp(ctx.request), 30)) {
        throw new Error(errText(ctx, 'rateLimited'));
      }
      // 口径：50%条数匹配 + 30%数值达成 + 20%三率达标（参考 gear-planner）
      const db = ctx.env.DB;
      const { results: maxRows } = await db.prepare(
        'SELECT affix_key, max_value FROM affix_max'
      ).all();
      const maxMap = {};
      for (const r of maxRows) maxMap[r.affix_key] = r.max_value;

      // slug -> 中文名
      let schoolName = input.sectSlug;
      const { results: schoolRows } = await db.prepare(
        'SELECT name FROM schools WHERE slug = ? LIMIT 1'
      ).bind(input.sectSlug).all().catch(() => ({ results: [] }));
      if (schoolRows.length) schoolName = schoolRows[0].name;

      // 获取目标配方的词条类别（从 school_bis）
      const { results: bisRows } = await db.prepare(
        'SELECT bis_json FROM school_bis WHERE school = ? LIMIT 1'
      ).bind(schoolName).all().catch(() => ({ results: [] }));
      let targetCats = {};
      if (bisRows.length && bisRows[0].bis_json) {
        try {
          const bis = JSON.parse(bisRows[0].bis_json);
          // 中文名 -> key 映射
          const nameToKey = {
            '大外': 'max_atk', '小外': 'min_atk',
            '劲': 'power', '敏': 'agility', '体': 'constitution', '御': 'defense', '势': 'spirit',
            '会心': 'crit_rate', '会心率': 'crit_rate',
            '精准': 'precision', '精准率': 'precision',
            '会意': 'affinity', '会意率': 'affinity',
            '大属攻': 'class_atk_max', '小属攻': 'class_atk_min',
            '外穿': 'phys_pen', '属穿': 'class_pen',
            '全武学增伤': 'all_weapon', '首领增伤': 'boss_dmg', '调律增伤': 'tuning'
          };
          // bis 格式：[["部位", "大外（初始）、大外、劲、势"], ...]
          if (Array.isArray(bis)) {
            bis.forEach(([slot, affixStr]) => {
              if (!affixStr) return;
              // 按顿号分割，清理括号内容
              affixStr.split('、').forEach(a => {
                const clean = a.replace(/（[^）]*）/g, '').trim();
                const key = nameToKey[clean];
                if (key) targetCats[key] = (targetCats[key] || 0) + 1;
              });
            });
          }
        } catch(e) {}
      }

      // 统计用户词条
      const userCats = {};
      let valueSum = 0, valueCount = 0;
      const items = [];
      for (const item of (input.items || [])) {
        let itemValueSum = 0, itemValueCount = 0;
        for (const affix of (item.affixes || [])) {
          if (!affix.key || !affix.value) continue;
          // 条数统计（按key归类）
          userCats[affix.key] = (userCats[affix.key] || 0) + 1;
          // 数值达成：value ÷ 承音值(95% max)
          const max = maxMap[affix.key];
          if (max) {
            const cy = max * 0.95;
            const score = Math.min(Math.max(0, affix.value) / cy, 1);
            valueSum += score;
            valueCount++;
            itemValueSum += score;
            itemValueCount++;
          }
        }
        // 单件分数 = 该件数值达成度
        const itemScore = itemValueCount ? Math.round((itemValueSum / itemValueCount) * 100) : 0;
        items.push({ slot: item.slot, score: itemScore });
      }

      // A: 条数匹配度（50%）- 用户词条类别中，有多少在目标里
      let matchSum = 0, catCount = 0;
      for (const [key, count] of Object.entries(userCats)) {
        // 如果目标有这个类别，按 min(实际,目标)/目标 算；目标没有则按0
        // 简化：如果目标为空（没配配方），则按1算（不扣分）
        const target = targetCats[key];
        if (Object.keys(targetCats).length === 0) {
          matchSum += 1; // 无目标时不扣分
        } else if (target) {
          matchSum += Math.min(count / target, 1);
        } else {
          matchSum += 0; // 目标没有这个词条，0分
        }
        catCount++;
      }
      const A = catCount ? matchSum / catCount : 0;

      // B: 数值达成度（30%）
      const B = valueCount ? valueSum / valueCount : 0;

      // C: 三率达标度（20%）
      const p = Math.min((input.precision || 0) / 100, 1);
      const c = Math.min((input.crit || 0) / 80, 1);
      const a = Math.min((input.affinity || 0) / 40, 1);
      const C = (p + c + a) / 3;

      const total = 0.5 * A + 0.3 * B + 0.2 * C;
      return {
        total: Math.round(total * 100),
        countScore: Math.round(A * 100),
        valueScore: Math.round(B * 100),
        rateScore: Math.round(C * 100),
        items
      };
    },
  },

  // ===== 实体 shell 字段分发 =====
  Grouping: {
    id: (p) => p.genId(),
    title: (p) => p.genTitle(),
    type: (p) => p.genType(),
    startsAt: (p) => p.genStartsAt(),
    dungeon: (p) => p.genDungeon(),
    seats: (p) => p.genSeats(),
    occupiedCount: (p) => p.genOccupiedCount(),
    maxSlots: (p) => p.genMaxSlots(),
    status: (p) => p.genStatus(),
    creatorDiscordId: (p) => p.genCreatorDiscordId(),
  },
  Dungeon: {
    id: (p) => p.genId(),
    name: (p) => p.genName(),
    version: (p) => p.genVersion(),
    playerCount: (p) => p.genPlayerCount(),
    size: (p) => p.genSize(),
    season: (p) => p.genSeason(),
    seasonName: (p) => p.genSeasonName(),
    category: (p) => p.genCategory(),
    level: (p) => p.genLevel(),
    bosses: (p) => p.genBosses(),
  },
  Boss: {
    id: (p) => p.genId(),
    name: (p) => p.genName(),
    dungeon: (p) => p.genDungeon(),
    mechanics: (p) => p.genMechanics(),
    talents: (p) => p.genTalents(),
    shouts: (p) => p.genShouts(),
  },
  GroupingListPage: {
    groupings: (p) => p.genGroupings(),
    currentVersion: (p) => p.genCurrentVersion(),
    blocks: (p, args) => p.genBlocks(args),
    primTree: (p, args) => p.genPrimTree(args),
    ...LIST_TEXT_RESOLVERS,
  },
  GroupingDetailPage: {
    grouping: (p) => p.genGrouping(),
    blocks: (p, args) => p.genBlocks(args),
    primTree: (p, args) => p.genPrimTree(args),
    ...DETAIL_TEXT_RESOLVERS,
  },
  // ===== Bloks-lite 积木/动作 (类型即分发; shell 自带 __typename) =====
  Block: { __resolveType: (p) => p.__typename },
  Action: { __resolveType: (p) => p.__typename },
  SectionBlock: { js: (p, a) => a.module, title: (p) => p.genTitle(), children: (p) => p.genChildren() },
  SectionHeaderBlock: { js: (p, a) => a.module, text: (p) => p.genText(), children: (p) => p.genChildren() },
  TextBlock: { js: (p, a) => a.module, text: (p) => p.genText(), variant: (p) => p.genVariant(), children: (p) => p.genChildren() },
  BannerBlock: { js: (p, a) => a.module, text: (p) => p.genText(), children: (p) => p.genChildren() },
  ChipRowBlock: { js: (p, a) => a.module, chips: (p) => p.genChips(), children: (p) => p.genChildren() },
  GroupingCardBlock: { js: (p, a) => a.module,
    groupingId: (p) => p.genGroupingId(), title: (p) => p.genTitle(),
    badgeText: (p) => p.genBadgeText(), timeText: (p) => p.genTimeText(),
    dungeonName: (p) => p.genDungeonName(), peopleText: (p) => p.genPeopleText(),
    statusText: (p) => p.genStatusText(), action: (p) => p.genAction(),
    children: (p) => p.genChildren(),
  },
  SeatGridBlock: { js: (p, a) => a.module, seats: (p) => p.genSeats(), children: (p) => p.genChildren() },
  SeatEntry: {
    index: (p) => p.genIndex(), occupied: (p) => p.genOccupied(),
    nickname: (p) => p.genNickname(), weapon: (p) => p.genWeapon(),
    role: (p) => p.genRole(), healer: (p) => p.genHealer(),
    action: (p) => p.genAction(),
  },
  ActionButtonBlock: { js: (p, a) => a.module,
    label: (p) => p.genLabel(), style: (p) => p.genStyle(),
    action: (p) => p.genAction(), children: (p) => p.genChildren(),
  },
  EmptyStateBlock: { js: (p, a) => a.module, text: (p) => p.genText(), children: (p) => p.genChildren() },
  SpacerBlock: { js: (p, a) => a.module, size: (p) => p.genSize(), children: (p) => p.genChildren() },
  FallbackBlock: { js: (p, a) => a.module, text: (p) => p.genText(), children: (p) => p.genChildren() },
  NavigateAction: {
    actionType: (p) => p.genActionType(), slug: (p) => p.genSlug(),
    groupingId: (p) => p.genGroupingId(), name: (p) => p.genName(),
    readOnly: (p) => p.genReadOnly(), nick: (p) => p.genNick(),
  },
  JoinAction: {
    actionType: (p) => p.genActionType(), groupingId: (p) => p.genGroupingId(),
    seatIndex: (p) => p.genSeatIndex(),
  },
  LeaveAction: {
    actionType: (p) => p.genActionType(), groupingId: (p) => p.genGroupingId(),
    uid: (p) => p.genUid(), confirmTitle: (p) => p.genConfirmTitle(),
    confirmMessage: (p) => p.genConfirmMessage(), okLabel: (p) => p.genOkLabel(),
    cancelLabel: (p) => p.genCancelLabel(),
  },
  DisbandAction: {
    actionType: (p) => p.genActionType(), groupingId: (p) => p.genGroupingId(),
    confirmTitle: (p) => p.genConfirmTitle(), confirmMessage: (p) => p.genConfirmMessage(),
    okLabel: (p) => p.genOkLabel(), cancelLabel: (p) => p.genCancelLabel(),
  },
  EditAction: {
    actionType: (p) => p.genActionType(), groupingId: (p) => p.genGroupingId(),
  },
  CompleteAction: {
    actionType: (p) => p.genActionType(), groupingId: (p) => p.genGroupingId(),
    confirmTitle: (p) => p.genConfirmTitle(), confirmMessage: (p) => p.genConfirmMessage(),
    okLabel: (p) => p.genOkLabel(), cancelLabel: (p) => p.genCancelLabel(),
  },
  UncompleteAction: {
    actionType: (p) => p.genActionType(), groupingId: (p) => p.genGroupingId(),
  },
  HubPage: {
    guilds: (p) => p.genGuilds(),
  },
  LegalPage: {
    kind: (p) => p.genKind(),
    title: (p) => p.genTitle(),
    updatedText: (p) => p.genUpdatedText(),
    backLabel: (p) => p.genBackLabel(),
    sections: (p) => p.genSections(),
  },
  LegalSection: {
    heading: (p) => p.genHeading(),
    body: (p) => p.genBody(),
  },
  GuildCard: {
    slug: (p) => p.genSlug(),
    name: (p) => p.genName(),
    slogan: (p) => p.genSlogan(),
    gameVersion: (p) => p.genGameVersion(),
    memberCount: (p) => p.genMemberCount(),
    avatarUrl: (p) => p.genAvatarUrl(),
  },
  GuildPage: {
    slug: (p) => p.genSlug(),
    name: (p) => p.genName(),
    gameVersion: (p) => p.genGameVersion(),
    currentVersion: (p) => p.genCurrentVersion(),
    tabs: (p) => p.genTabs(),
  },
  DexPage: {
    current: (p) => p.genCurrent(),
    past: (p) => p.genPast(),
    currentVersion: (p) => p.genCurrentVersion(),
    categories: (p) => p.genCategories(),
    ...DEX_TEXT_RESOLVERS,
  },
  DexCategory: {
    category: (p) => p.genCategory(),
    season: (p) => p.genSeason(),
    seasonName: (p) => p.genSeasonName(),
    isCurrent: (p) => p.genIsCurrent(),
    dungeons: (p) => p.genDungeons(),
  },
  BossPage: {
    boss: (p) => p.genBoss(),
    defaultTab: (p) => p.genDefaultTab(),
    ...BOSS_TEXT_RESOLVERS,
  },
  SectPage: {
    sects: (p) => p.genSects(),
    ...SECT_TEXT_RESOLVERS,
  },
  Sect: {
    slug: (p) => p.genSlug(),
    name: (p) => p.genName(),
    weapons: (p) => p.genWeapons(),
    buildType: (p) => p.genBuildType(),
    bis: (p) => p.genBis(),
    rotation: (p) => p.genRotation(),
    rateTargets: (p) => p.genRateTargets(),
  },
  TiaolvPage: {
    sects: (p) => p.genSects(),
    innerSkills: (p) => p.genInnerSkills(),
    suits: (p) => p.genSuits(),
    maxValues: (p) => p.genMaxValues(),
    sectWeights: (p) => p.genSectWeights(),
    ...TIAOLV_TEXT_RESOLVERS,
  },
  GradPage: { ...GRAD_TEXT_RESOLVERS, ...GEAR_TEXT_RESOLVERS, ...GEAR_DATA_RESOLVERS },
  GearPanel: {
    sums: (p) => Object.entries(p.sums || {}).map(([key, val]) => ({ key, val })),
    classCounts: (p) => Object.entries(p.classCounts || {}).map(([key, val]) => ({ key, val })),
    dingyinTotals: (p) => Object.entries(p.dingyinTotals || {}).map(([key, val]) => ({ key, val })),
  },
  GearGrad: { a: (p) => p.A, b: (p) => p.B, d: (p) => p.D },
  GearSavedBuild: {
    // 显示覆盖层: school / buildLabel 按请求 locale 本地化 (存储的
    // buildLabel 保持规范中文; 非覆盖 locale 下重组结果与存储值逐字一致)。
    school: (p, _a, ctx) => enBuildSchool(ctx.locale, (GP_BUILDS[p.targetIdx] || GP_BUILDS[0]).school),
    buildLabel: (p, _a, ctx) => {
      const b = GP_BUILDS[p.targetIdx] || GP_BUILDS[0];
      return enBuildSchool(ctx.locale, b.school) + ' · ' + enGearSetName(ctx.locale, b.set);
    },
    loadout: (p) => Object.entries(p.loadout || {}).map(([slot, gearId]) => ({ slot, gearId })),
    baseValues: (p) => Object.entries(p.baseValues || {}).map(([key, val]) => ({ key, val })),
    res: (p) => (p.extras && typeof p.extras.res === 'number') ? p.extras.res : 1.85,
    extraAcc: (p) => (p.extras && p.extras.acc) || 0,
    extraCrit: (p) => (p.extras && p.extras.crit) || 0,
    extraInt: (p) => (p.extras && p.extras.int) || 0,
    bowKind: (p) => p.bowKind || '',
    snapTotal: (p) => (p.snapshot && p.snapshot.total) || 0,
    snapA: (p) => (p.snapshot && p.snapshot.a) || 0,
    snapB: (p) => (p.snapshot && p.snapshot.b) || 0,
    snapD: (p) => (p.snapshot && p.snapshot.d) || 0,
    snapLoan: (p) => (p.snapshot && p.snapshot.loan) || 0,
    snapYAcc: (p) => (p.snapshot && p.snapshot.yAcc) || 0,
    snapYCrit: (p) => (p.snapshot && p.snapshot.yCrit) || 0,
    snapYInt: (p) => (p.snapshot && p.snapshot.yInt) || 0,
    snapDawai: (p) => (p.snapshot && p.snapshot.dawai) || 0,
    snapXiaowai: (p) => (p.snapshot && p.snapshot.xiaowai) || 0,
    createdAt: (p) => p.createdAt || 0,
  },
  GroupingPayload: {
    ok: (p) => p.genOk(),
    grouping: (p) => p.genGrouping(),
    error: (p) => p.genError(),
    errorCode: (p) => p.genErrorCode(),
  },
  SeatPayload: {
    ok: (p) => p.genOk(),
    seats: (p) => p.genSeats(),
    error: (p) => p.genError(),
    errorCode: (p) => p.genErrorCode(),
  },
  DeletePayload: {
    ok: (p) => p.genOk(),
    error: (p) => p.genError(),
    errorCode: (p) => p.genErrorCode(),
  },
  CreateGuildPayload: {
    ok: (p) => p.genOk(),
    error: (p) => p.genError(),
    errorCode: (p) => p.genErrorCode(),
    guild: (p) => p.genGuild(),
  },
  SettingsPage: {
    localePref: (p) => p.genLocalePref(),
    effectiveLocale: (p) => p.genEffectiveLocale(),
    ...SETTINGS_TEXT_RESOLVERS,
  },
  UpdateLocalePayload: {
    ok: (p) => p.genOk(),
    error: (p) => p.genError(),
    errorCode: (p) => p.genErrorCode(),
    localePref: (p) => p.genLocalePref(),
    effectiveLocale: (p) => p.genEffectiveLocale(),
  },

  // ===== Viewer 层级字段 =====
  Viewer: {
    myLocalePref: (p) => p.genMyLocalePref(),
    myEffectiveLocale: (p) => p.genMyEffectiveLocale(),
    user: (p) => p.genUser(),
    guilds: (p) => p.genGuilds(),
    publicGuilds: (p) => p.genPublicGuilds(),
    guild: (p, { slug }) => p.genGuild({ slug }),
    discordServers: (p) => p.genDiscordServers(),
    ...VIEWER_TEXT_RESOLVERS,
  },
  DiscordUser: {
    discordId: (p) => p.genDiscordId(),
    name: (p) => p.genName(),
    avatar: (p) => p.genAvatar(),
  },
  DiscordServer: {
    id: (p) => p.genId(),
    name: (p) => p.genName(),
    icon: (p) => p.genIcon(),
  },

  // Guild / GuildReadOnly 字段实现相同 (只读类型只是不挂写入口组件, 数据本就公开);
  // GuildLocked 只有 slug 与锁定页文案, 不解析任何内容字段。
  // memberRoster 只注册在完整 Guild 上: schema 里 GuildReadOnly /
  // GuildLocked 没有这个字段, 名册权限由响应类型表达。
  Guild: {
    ...guildContentResolvers(),
    memberRoster: (p) => p.genMemberRoster(),
  },
  GuildRosterMember: {
    discordId: (p) => p.genDiscordId(),
    displayName: (p) => p.genDisplayName(),
    globalName: (p) => p.genGlobalName(),
  },
  GuildReadOnly: { ...guildContentResolvers(), ...GUILD_READONLY_TEXT_RESOLVERS },
  GuildLocked: {
    slug: (p) => p.genSlug(),
    ...GUILD_LOCKED_TEXT_RESOLVERS,
  },
};

const schema = createSchema({ typeDefs, resolvers });

/* GraphQL 错误汇聚插件 (商业化审计 A7): 执行结果里的错误落 error_log。
 * 本 API 的业务失败都经 payload error 字段或目录文案 throw 表达 —— 后者
 * 的消息必是 i18n errors 段某语言的文案 (或下面两个历史硬编码字面量),
 * 属预期控制流, 不记; 其余 (TypeError / D1 错误 / 空指针等) 才是要汇聚
 * 的未捕获异常。logError 永不抛错; 在此不 await, 不拖慢响应。 */
const BUSINESS_ERROR_TEXTS = new Set(['百业不存在', 'Introspection 已禁用']);
for (const entry of Object.values(CATALOG.errors || {})) {
  for (const v of Object.values(entry)) BUSINESS_ERROR_TEXTS.add(v);
}
const errorLogPlugin = {
  onExecute({ args }) {
    const ctx = args && args.contextValue;
    return {
      onExecuteDone({ result }) {
        try {
          const errs = result && result.errors;
          if (!errs || !errs.length) return;
          const db = ctx && ctx.env && ctx.env.DB;
          if (!db) return;
          for (const e of errs) {
            const orig = e.originalError || e;
            const msg = String((orig && orig.message) || e.message || '');
            if (BUSINESS_ERROR_TEXTS.has(msg)) continue;
            void logError(db, {
              source: 'graphql',
              error: orig instanceof Error ? orig : e,
              context: { path: e.path ? e.path.join('.') : '' },
            });
          }
        } catch { /* 汇聚失败静默 */ }
      },
    };
  },
};

export const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  // 生产环境隐藏错误细节
  maskedErrors: true,
  // 禁用 introspection (防 API 结构暴露)
  // 开发时可将 graphql.js 顶部的 DISABLE_INTROSPECTION 设为 false
  plugins: [noIntrospectionPlugin, errorLogPlugin],
  // 禁用 GraphiQL (生产环境不需要)
  graphiql: false,
});
