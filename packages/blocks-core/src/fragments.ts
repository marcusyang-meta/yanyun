import { graphql } from 'react-relay';

// Bloks-lite 契约 (用户裁决: 必须是带类型的 GraphQL 对象, 不许 JSON blob):
// Block 接口 + 每种积木一个具体类型 + 一个数据 fragment; Action 同理。
//
// 渲染分发 = Relay server 3D (用户裁决, 取代旧的 inline fragment +
// __typename 运行时分发): 每层是一个 match fragment (在 Block 接口上),
// 每种具体类型是一个 @module 臂 —— 服务端经 Block.js 字段回传命中的
// 组件名 (__module_component_*) 与拆分操作名 (__module_operation_*),
// 客户端用 MatchContainer + loader 按引用懒加载对应渲染器, 不再内置
// 全量分发表。服务端新增客户端没有臂的具体类型时, 该节点无 module
// 命中 → MatchContainer 走 fallback (宿主 Unknown 占位), 兄弟节点照常。
//
// 容器递归用“层级 match”实现 (GraphQL 不允许 fragment 循环引用):
// Node1 (页面根) → SectionBlock 臂的 children 走 Node2 → 再下一层走 Leaf。
// 服务端真实树深 ≤ 3 层, 三层足够; 更深的 SectionBlock 在 Leaf 层无臂
// → fallback 占位, 不崩。

export const BlockActionFragment = graphql`
  fragment fragments_BlockAction on Action {
    __typename
    ... on NavigateAction {
      slug
      groupingId
      name
      readOnly
      nick
    }
    ... on JoinAction {
      groupingId
      seatIndex
    }
    ... on LeaveAction {
      groupingId
      uid
      confirmTitle
      confirmMessage
      okLabel
      cancelLabel
    }
    ... on DisbandAction {
      groupingId
      confirmTitle
      confirmMessage
      okLabel
      cancelLabel
    }
    ... on EditAction {
      groupingId
    }
  }
`;

export const TextBlockFragment = graphql`
  fragment fragments_TextBlock on TextBlock {
    text
    variant
  }
`;

export const BannerBlockFragment = graphql`
  fragment fragments_BannerBlock on BannerBlock {
    text
  }
`;

export const SectionHeaderBlockFragment = graphql`
  fragment fragments_SectionHeaderBlock on SectionHeaderBlock {
    text
  }
`;

export const ChipRowBlockFragment = graphql`
  fragment fragments_ChipRowBlock on ChipRowBlock {
    chips
  }
`;

export const EmptyStateBlockFragment = graphql`
  fragment fragments_EmptyStateBlock on EmptyStateBlock {
    text
  }
`;

export const SpacerBlockFragment = graphql`
  fragment fragments_SpacerBlock on SpacerBlock {
    size
  }
`;

export const FallbackBlockFragment = graphql`
  fragment fragments_FallbackBlock on FallbackBlock {
    text
  }
`;

export const GroupingCardBlockFragment = graphql`
  fragment fragments_GroupingCardBlock on GroupingCardBlock {
    groupingId
    cardTitle: title
    badgeText
    timeText
    dungeonName
    peopleText
    statusText
    action {
      ...fragments_BlockAction
    }
  }
`;

export const SeatGridBlockFragment = graphql`
  fragment fragments_SeatGridBlock on SeatGridBlock {
    seats {
      index
      occupied
      nickname
      weapon
      role
      healer
      action {
        ...fragments_BlockAction
      }
    }
  }
`;

export const ActionButtonBlockFragment = graphql`
  fragment fragments_ActionButtonBlock on ActionButtonBlock {
    label
    style
    action {
      ...fragments_BlockAction
    }
  }
`;

// Section 臂 fragment (两层): 自身字段 + children 走下一层 match。
// fragmentPropName 分别为 SectionNode1 / SectionNode2 —— 命中的组件以
// 同名 prop 收到本 fragment 的引用 (MatchContainer 契约)。
export const SectionNode2Fragment = graphql`
  fragment fragments_SectionNode2 on SectionBlock {
    title
    children {
      ...fragments_BlockLeafMatch
    }
  }
`;

export const SectionNode1Fragment = graphql`
  fragment fragments_SectionNode1 on SectionBlock {
    title
    children {
      ...fragments_BlockNode2Match
    }
  }
`;

// 叶子层 match: 除 SectionBlock 外的全部具体类型各一个 @module 臂。
// @module(name:) 即服务端回传的组件引用名, 与宿主 loader 注册表键一致。
export const BlockLeafMatchFragment = graphql`
  fragment fragments_BlockLeafMatch on Block {
    ...fragments_TextBlock @module(name: "TextBlock")
    ...fragments_BannerBlock @module(name: "BannerBlock")
    ...fragments_SectionHeaderBlock @module(name: "SectionHeaderBlock")
    ...fragments_ChipRowBlock @module(name: "ChipRowBlock")
    ...fragments_GroupingCardBlock @module(name: "GroupingCardBlock")
    ...fragments_SeatGridBlock @module(name: "SeatGridBlock")
    ...fragments_ActionButtonBlock @module(name: "ActionButtonBlock")
    ...fragments_EmptyStateBlock @module(name: "EmptyStateBlock")
    ...fragments_SpacerBlock @module(name: "SpacerBlock")
    ...fragments_FallbackBlock @module(name: "FallbackBlock")
  }
`;

// 第 2 层 match: 叶子臂 + SectionBlock 臂 (children 走 Leaf 层)。
export const BlockNode2MatchFragment = graphql`
  fragment fragments_BlockNode2Match on Block {
    ...fragments_TextBlock @module(name: "TextBlock")
    ...fragments_BannerBlock @module(name: "BannerBlock")
    ...fragments_SectionHeaderBlock @module(name: "SectionHeaderBlock")
    ...fragments_ChipRowBlock @module(name: "ChipRowBlock")
    ...fragments_GroupingCardBlock @module(name: "GroupingCardBlock")
    ...fragments_SeatGridBlock @module(name: "SeatGridBlock")
    ...fragments_ActionButtonBlock @module(name: "ActionButtonBlock")
    ...fragments_EmptyStateBlock @module(name: "EmptyStateBlock")
    ...fragments_SpacerBlock @module(name: "SpacerBlock")
    ...fragments_FallbackBlock @module(name: "FallbackBlock")
    ...fragments_SectionNode2 @module(name: "SectionNode2")
  }
`;

// 第 1 层 (根) match: 叶子臂 + SectionBlock 臂 (children 走 Node2 层)。
export const BlockNode1MatchFragment = graphql`
  fragment fragments_BlockNode1Match on Block {
    ...fragments_TextBlock @module(name: "TextBlock")
    ...fragments_BannerBlock @module(name: "BannerBlock")
    ...fragments_SectionHeaderBlock @module(name: "SectionHeaderBlock")
    ...fragments_ChipRowBlock @module(name: "ChipRowBlock")
    ...fragments_GroupingCardBlock @module(name: "GroupingCardBlock")
    ...fragments_SeatGridBlock @module(name: "SeatGridBlock")
    ...fragments_ActionButtonBlock @module(name: "ActionButtonBlock")
    ...fragments_EmptyStateBlock @module(name: "EmptyStateBlock")
    ...fragments_SpacerBlock @module(name: "SpacerBlock")
    ...fragments_FallbackBlock @module(name: "FallbackBlock")
    ...fragments_SectionNode1 @module(name: "SectionNode1")
  }
`;
