// ============================================================
// 平台中立核心 — 积木系统的可复用边界 (桌面 overlay 等其它端复用这里,
// 只需另写一套叶子渲染器模块; 本目录禁止 import react-native / DOM 等平台 API)。
//
// 属于核心的: GraphQL fragment 契约 (fragments.ts, 含 server 3D 的三层
// match fragment)、树遍历器 (renderer.tsx, MatchContainer)、拆分操作
// 注册表 (operations.ts)、动作分发 (actions.ts)。
// 不属于核心的: 具体叶子长什么样 (各端自己的 @module 渲染组件, 经
// loader 按服务端回传的引用名解析)、确认弹窗的呈现 (通过 ConfirmFn
// 注入)、导航与 mutation 的落地 (通过 ActionHandlers 注入)。
// ============================================================

// 页面级文案 (宿主从页面 shell 查询后注入, 叶子只消费不自造):
// 印章字与状态开/关判定文案在列表页 shell, 空位文案在详情页 shell。
export interface LeafPageText {
  sealText?: string;
  statusOpenLabel?: string;
  seatEmptyJoinLabel?: string;
  seatEmptyLabel?: string;
}

// 动作处理器: 由宿主端实现 (导航去向、mutation 落地各端自理)。
export interface ActionHandlers {
  pageText?: LeafPageText;
  navigate: (a: { slug: string; groupingId: string; name: string; readOnly: boolean; nick: string }) => void;
  join: (a: { groupingId: string; seatIndex: number }) => void;
  leave: (a: { groupingId: string; uid: string }) => void;
  disband: (a: { groupingId: string }) => void;
  edit: (a: { groupingId: string }) => void;
}

// 确认呈现注入点: 文案全部来自 Action 对象 (服务端 i18n),
// 各端用自己的弹窗机制实现这个函数 (RN: Alert; DOM: 自有 modal 等)。
export interface ConfirmRequest {
  title: string;
  message: string;
  okLabel: string;
  cancelLabel: string;
  destructive: boolean;
  onConfirm: () => void;
}
export type ConfirmFn = (req: ConfirmRequest) => void;

// 宿主渲染组件 (@module 命中后由 loader 载入) 的统一 props 形状:
// 以 fragment 名后缀为键的数据引用 (如 TextBlock / SectionNode1) 由
// MatchContainer 注入, handlers 经 MatchContainer 的 props 透传。
// 纯展示叶子可以只声明自己那一份, 可交互叶子 (卡片/座位/按钮) 另收
// handlers。各端模块组件按此形状各自定义 props 类型即可。
