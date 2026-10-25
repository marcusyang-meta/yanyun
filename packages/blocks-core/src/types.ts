// ============================================================
// 平台中立核心 — 积木系统的可复用边界 (桌面 overlay 等其它端复用这里,
// 只需另写一套叶子渲染器; 本目录禁止 import react-native / DOM 等平台 API)。
//
// 属于核心的: GraphQL fragment 契约 (core/fragments.ts)、块/动作类型、
// 树遍历器 (core/renderer.tsx)、动作分发 (core/actions.ts)。
// 不属于核心的: 具体叶子长什么样 (各端自己的注册表实现)、确认弹窗的呈现
// (通过 ConfirmFn 注入)、导航与 mutation 的落地 (通过 ActionHandlers 注入)。
// ============================================================
import type { ComponentType, ReactNode } from 'react';
import type { fragments_TextBlock$key } from './__generated__/fragments_TextBlock.graphql';
import type { fragments_BannerBlock$key } from './__generated__/fragments_BannerBlock.graphql';
import type { fragments_SectionHeaderBlock$key } from './__generated__/fragments_SectionHeaderBlock.graphql';
import type { fragments_ChipRowBlock$key } from './__generated__/fragments_ChipRowBlock.graphql';
import type { fragments_EmptyStateBlock$key } from './__generated__/fragments_EmptyStateBlock.graphql';
import type { fragments_SpacerBlock$key } from './__generated__/fragments_SpacerBlock.graphql';
import type { fragments_FallbackBlock$key } from './__generated__/fragments_FallbackBlock.graphql';
import type { fragments_GroupingCardBlock$key } from './__generated__/fragments_GroupingCardBlock.graphql';
import type { fragments_SeatGridBlock$key } from './__generated__/fragments_SeatGridBlock.graphql';
import type { fragments_ActionButtonBlock$key } from './__generated__/fragments_ActionButtonBlock.graphql';

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

// 叶子渲染器注册表: 遍历器按具体块类型把 fragment ref 交给对应组件;
// 纯展示叶子不需要 handlers, 可交互叶子 (卡片/座位/按钮) 才收 handlers。
// Section 是容器外壳 (标题 + children 的排版), 同样归各端实现。
export interface BlockLeafRegistry {
  Section: ComponentType<{ title: string | null; children: ReactNode }>;
  TextBlock: ComponentType<{ block: fragments_TextBlock$key }>;
  BannerBlock: ComponentType<{ block: fragments_BannerBlock$key }>;
  SectionHeaderBlock: ComponentType<{ block: fragments_SectionHeaderBlock$key }>;
  ChipRowBlock: ComponentType<{ block: fragments_ChipRowBlock$key }>;
  EmptyStateBlock: ComponentType<{ block: fragments_EmptyStateBlock$key }>;
  SpacerBlock: ComponentType<{ block: fragments_SpacerBlock$key }>;
  FallbackBlock: ComponentType<{ block: fragments_FallbackBlock$key }>;
  GroupingCardBlock: ComponentType<{ block: fragments_GroupingCardBlock$key; handlers: ActionHandlers }>;
  SeatGridBlock: ComponentType<{ block: fragments_SeatGridBlock$key; handlers: ActionHandlers }>;
  ActionButtonBlock: ComponentType<{ block: fragments_ActionButtonBlock$key; handlers: ActionHandlers }>;
  Unknown: ComponentType;
}
