// Bloks-lite 服务端组合层 · 纯工具 (移动端内容区积木对象树, 2026-10-25
// 用户裁决): 积木是带类型的 GraphQL object (Block 接口 + 具体类型),
// 组合逻辑在 graphql.js 的 shell 类上 (每个积木/动作都是 shell, 字段由
// 各自 gen 方法按 locale 经 i18n 目录惰性生成)。本模块只放无状态工具:
// 词汇版本注册表、版本替代、周界与时间格式 (与网站同口径)。

/* ---------- 词汇版本注册表 ----------
 * 每个具体积木/动作类型标注引入版本。客户端经 blocks(blocksVersion:)
 * 声明自己支持的版本; 高于该版本的积木不下发原对象 — 由服务端替代为
 * FallbackBlock (最老客户端可渲染的提示叶子); 高于版本的动作置空
 * (积木保留、不可点)。GraphQL schema 是契约本体, 此注册表只负责
 * "老客户端安全降级"这一件事。 */
export const BLOCK_VOCAB_MAX = 3;
export const BLOCK_TYPE_SINCE = {
  FallbackBlock: 0,
  SectionBlock: 1, SectionHeaderBlock: 1, TextBlock: 1, GroupingCardBlock: 1,
  SeatGridBlock: 1, ActionButtonBlock: 1, EmptyStateBlock: 1, SpacerBlock: 1,
  BannerBlock: 2, ChipRowBlock: 2,
};
export const ACTION_TYPE_SINCE = {
  NavigateAction: 1, JoinAction: 1, LeaveAction: 1, DisbandAction: 1,
  EditAction: 3,
};

export function clampBlocksVersion(v) {
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, BLOCK_VOCAB_MAX);
}

// 对已组合的积木 shell 数组做版本替代 (递归进 children)。shell 鸭子
// 类型: { __typename, _children: [], _action: shell|null }。座位条目里的
// 动作 (SeatEntry.action) 按构造恒为 v1 动作, 不在本走查范围内。
export function substituteForVersion(blocks, version, makeFallback) {
  const out = [];
  for (const b of blocks || []) {
    const since = BLOCK_TYPE_SINCE[b.__typename];
    if (since != null && since > version) { out.push(makeFallback()); continue; }
    if (b._action) {
      const aSince = ACTION_TYPE_SINCE[b._action.__typename];
      if (aSince != null && aSince > version) b._action = null;
    }
    if (Array.isArray(b._children) && b._children.length) {
      b._children = substituteForVersion(b._children, version, makeFallback);
    }
    out.push(b);
  }
  return out;
}

/* ---------- 时间/周界 (与网站同口径) ---------- */
// 周窗: 周一 05:00 (北京时间) 起, 左闭右开 [start, start+7d) — 与
// worker.js ogWeekWindowUtc 同一算法, weekOffset 平移整周。
export function weekWindowUtc(weekOffset = 0) {
  const now = Math.floor(Date.now() / 1000);
  const cst = now + 8 * 3600;
  const d = new Date(cst * 1000);
  const dayStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000;
  let monday = dayStart - ((d.getUTCDay() + 6) % 7) * 86400 + 5 * 3600;
  if (cst < monday) monday -= 7 * 86400;
  const startUtc = monday - 8 * 3600 + (weekOffset | 0) * 7 * 86400;
  return [startUtc, startUtc + 7 * 86400];
}

// events 行 -> epoch 秒 (starts_at_utc 优先; 文本按网站 parseStartsAt 语义)
export function startsAtEpoch(ev) {
  if (ev.starts_at_utc != null && ev.starts_at_utc !== '') {
    const n = Number(ev.starts_at_utc);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const s = String(ev.starts_at || '').trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  let c = s;
  if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(s) && /[\sT]\d/.test(s)) c = s.replace(' ', 'T') + 'Z';
  const ms = Date.parse(c);
  return Number.isNaN(ms) ? null : Math.floor(ms / 1000);
}

const _fmtCache = new Map();
export function fmtStartsAt(epochSec, locale, tz) {
  const zone = tz || 'Asia/Shanghai';
  const key = `${locale}|${zone}`;
  let fmt = _fmtCache.get(key);
  if (!fmt) {
    const opts = {
      month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
      hourCycle: 'h23', weekday: 'short', timeZone: zone,
    };
    try { fmt = new Intl.DateTimeFormat(locale || 'zh-CN', opts); }
    catch { fmt = new Intl.DateTimeFormat('zh-CN', { ...opts, timeZone: 'Asia/Shanghai' }); }
    _fmtCache.set(key, fmt);
  }
  return fmt.format(new Date(epochSec * 1000));
}

// events.type -> groupingType 目录短名 key
export const TYPE_SHORT_KEY = {
  activity: 'shortActivity', talent: 'shortTalent', race: 'shortRace', tower: 'shortTower',
  gather: 'shortGather', explore: 'shortExplore',
};
export const HEALER_SECT = '牵丝·霖';
