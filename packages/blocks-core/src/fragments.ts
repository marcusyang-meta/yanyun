import { graphql } from 'react-relay';

// Bloks-lite 契约 (用户裁决: 必须是带类型的 GraphQL 对象, 不许 JSON blob):
// Block 接口 + 每种积木一个具体类型 + 一个 fragment; Action 同理。
// 容器递归用“层级 fragment”实现 (GraphQL 不允许 fragment 循环引用):
// Node1 (页面根) → SectionBlock 的 children 走 Node2 → 再下一层走 Leaf。
// 服务端真实树深 ≤ 3 层, 三层足够; 更深的对象落到 Leaf 的未知类型占位, 不崩。

export const BlockKindFragment = graphql`
  fragment fragments_BlockKind on Block {
    __typename
  }
`;

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

// 叶子层: 除 SectionBlock 外的全部具体类型。
// 具体类型 fragment 在接口上 spread 需 @alias (Relay 21): 生成数据是
// 以类型命名的可空 ref 属性, 渲染器按哪个 ref 非空分发 —— 无需强转。
export const BlockLeafFragment = graphql`
  fragment fragments_BlockLeaf on Block {
    __typename
    ... on TextBlock {
      ...fragments_TextBlock @alias(as: "textBlock")
    }
    ... on BannerBlock {
      ...fragments_BannerBlock @alias(as: "bannerBlock")
    }
    ... on SectionHeaderBlock {
      ...fragments_SectionHeaderBlock @alias(as: "sectionHeaderBlock")
    }
    ... on ChipRowBlock {
      ...fragments_ChipRowBlock @alias(as: "chipRowBlock")
    }
    ... on GroupingCardBlock {
      ...fragments_GroupingCardBlock @alias(as: "groupingCardBlock")
    }
    ... on SeatGridBlock {
      ...fragments_SeatGridBlock @alias(as: "seatGridBlock")
    }
    ... on ActionButtonBlock {
      ...fragments_ActionButtonBlock @alias(as: "actionButtonBlock")
    }
    ... on EmptyStateBlock {
      ...fragments_EmptyStateBlock @alias(as: "emptyStateBlock")
    }
    ... on SpacerBlock {
      ...fragments_SpacerBlock @alias(as: "spacerBlock")
    }
    ... on FallbackBlock {
      ...fragments_FallbackBlock @alias(as: "fallbackBlock")
    }
  }
`;

// 第 2 层: SectionBlock 的 children
export const BlockNode2Fragment = graphql`
  fragment fragments_BlockNode2 on Block {
    __typename
    ...fragments_BlockLeaf
    ... on SectionBlock {
      title
      children {
        ...fragments_BlockLeaf
      }
    }
  }
`;

// 第 1 层 (根): SectionBlock 的 children 走 Node2
export const BlockNode1Fragment = graphql`
  fragment fragments_BlockNode1 on Block {
    __typename
    ...fragments_BlockLeaf
    ... on SectionBlock {
      title
      children {
        ...fragments_BlockNode2
      }
    }
  }
`;
