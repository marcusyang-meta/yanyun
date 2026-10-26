// 类 Bloks 原语面 (C 路线, 2026-10-25 用户裁决「走 C 路线先做核心面」):
// 组队列表 + 车队详情的展示面改由服务端拼「原语树」(极简 JSON, 短键),
// 客户端用一个冻结的解释器渲染 — 显示类新功能只改服务端拼树即可上线,
// 不再需要推 app 更新。研究与实测依据: research_notes/bloks-primitives/
// STUDY.md (信封占现状详情响应 57%; 原语走极简 JSON 后 raw 0.55–0.99×)。
//
// 本模块只放无状态工具: 词汇版本注册表与协商、页面×百业开关 (settings)、
// 动作的短键编码。拼树逻辑在 graphql.js 的页面 shell 上 (genPrimTree),
// 与功能块拼树 (genBlocks) 同源同数据 — 权限仍由「服务端给谁什么树」
// 决定, 解释器只画树, 不做任何表面/权限选择。
//
import { getSettingValue } from './db/repositories/settings.ts';

// 线格式 (冻结词汇 v1, 节点短键 t/s/c/x/a):
//   col  {t,s?,gap?,c}      纵向 flex 容器 (带样式的单子容器也是它)
//   row  {t,s?,gap?,wrap?,c} 横向 flex 容器
//   txt  {t,s,x,lines?}     文本; x 由服务端按 locale 生成
//   img  {t,s,uri}          图片 (本期表面未用, 词汇预埋冻结)
//   chip {t,s,x}            片 (容器+文本融合, 避免双节点开销)
//   press{t,a,c:[子]}       可点外壳, 恰好包裹一个子节点; a 为类型化动作
//   list {t,s,tpl,items}    Collection: 模板子树 + 数据行; 模板叶子 props
//                           可为 "$字段" 绑定 (x/s/a 均可); 绑定 null 规则:
//                           txt 不渲染、press 的 a 为 null 时退化为普通容器
//   sp   {t,s}              间隔; s 为间距标度令牌 (xs/sm/md/lg/xl)
//   div  {t,s}              分隔线
//   tabs {t,s?,tabs:[{label,c}]} 页内分段; 选中态纯客户端 (本期未用, 预埋)
//   island {t,id,params?}   原生岛逃生口: 客户端按 id 映射已注册原生组件
//   fallback {t,x}          未知/超版本节点的统一替身 (文案服务端下发)
// 样式纪律: 服务端只写令牌名 (s) 与标度枚举 (gap), 绝不下发颜色/px/字号
// 裸值; 令牌实现全集在客户端注册表 (冻结, 新增令牌 = 发版事件)。

/* ---------- 词汇版本协商 ----------
 * 客户端经 primTree(primitivesVersion:) 声明自己认识的原语词汇版本。
 * 服务端只在版本命中自己会拼的版本时下发原语树; 未声明/版本为 0/无法
 * 解析一律返回 null — 老客户端 (只查 blocks 字段) 与未协商者永远拿不到
 * 原语树, 行为零变化。 */
export const PRIMITIVES_VOCAB_MAX = 1;
export const PRIM_NODE_TYPES = [
  'col', 'row', 'txt', 'img', 'chip', 'press', 'list', 'sp', 'div', 'tabs', 'island', 'fallback',
];
export const PRIM_ACTION_TYPES = [
  'nav', 'join', 'leave', 'disband', 'edit', 'complete', 'uncomplete', 'copy', 'url',
];

export function clampPrimitivesVersion(v) {
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) return 0;
  return Math.min(n, PRIMITIVES_VOCAB_MAX);
}

/* ---------- 页面 × 百业开关 (settings 表) ----------
 * key 口径: tenant=百业 slug, key='primitives_list' | 'primitives_detail',
 * value='1' 才开; 缺省 = 关 (默认 OFF)。另有全局急停: tenant='',
 * key='primitives_global_off'='1' 时全部百业强制关 (回滚免发版)。
 * 开关经超管 portal 的 /api/hub/primitives 端点翻动。 */
async function getSetting(db, tenant, key) {
  return getSettingValue(db, tenant, key);
}

export async function primEnabled(db, slug, page) {
  if ((await getSetting(db, '', 'primitives_global_off')) === '1') return false;
  return (await getSetting(db, slug, page === 'detail' ? 'primitives_detail' : 'primitives_list')) === '1';
}

export async function primSwitchState(db, slug) {
  return {
    list: (await getSetting(db, slug, 'primitives_list')) === '1',
    detail: (await getSetting(db, slug, 'primitives_detail')) === '1',
  };
}

/* ---------- 动作短键编码 ----------
 * 与功能块的带类型 Action 对象一一对应 (同一套语义、同一批确认文案):
 * nav/join/edit/uncomplete 直达; leave/disband/complete 先确认 (文案四件套
 * 随动作下发, 与 LeaveAction 等对象同源); copy/url 为展示面扩展的两个
 * 通用动作 (喊话复制 / 外链打开), 本期核心面未用, 词汇先行冻结。 */
export const primNav = (d) => ({
  t: 'nav', slug: d.slug, groupingId: d.groupingId, name: d.name,
  readOnly: !!d.readOnly, nick: d.nick || '',
});
export const primJoin = (d) => ({ t: 'join', groupingId: d.groupingId, seatIndex: d.seatIndex });
export const primEdit = (d) => ({ t: 'edit', groupingId: d.groupingId });
export const primUncomplete = (d) => ({ t: 'uncomplete', groupingId: d.groupingId });
const withConfirm = (t, d) => ({
  t, groupingId: d.groupingId,
  confirmTitle: d.confirmTitle, confirmMessage: d.confirmMessage,
  okLabel: d.okLabel, cancelLabel: d.cancelLabel,
});
export const primLeave = (d) => ({ ...withConfirm('leave', d), uid: d.uid });
export const primDisband = (d) => withConfirm('disband', d);
export const primComplete = (d) => withConfirm('complete', d);
export const primCopy = (d) => ({ t: 'copy', text: d.text });
export const primUrl = (d) => ({ t: 'url', url: d.url });
