import { graphql } from 'react-relay';

// Bloks-lite contract (decided: must be typed GraphQL objects, never a
// JSON blob): a Block interface + one concrete type and one data
// fragment per block; same for Action.
//
// Rendering dispatch = Relay server 3D (decided; replaces the old inline
// fragments + __typename runtime dispatch): each layer is a match
// fragment on the Block interface and each concrete type is an @module
// arm -- the server returns the matched component name
// (__module_component_*) and split operation name (__module_operation_*)
// via Block.js fields, and the client lazily loads renderers by reference
// with MatchContainer + loader instead of a built-in dispatch table.
// When the server adds a type the client has no arm for, that node gets
// no module match -> MatchContainer falls back (host Unknown placeholder)
// and siblings render as usual.
//
// Container recursion uses layered matches (GraphQL forbids cyclic
// fragments): Node1 (page root) -> SectionBlock arm's children via Node2
// -> the next level via Leaf. Real server trees are at most 3 levels, so
// three layers suffice; a deeper SectionBlock has no arm at the Leaf
// layer -> fallback placeholder, never a crash.

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
    ... on CompleteAction {
      groupingId
      confirmTitle
      confirmMessage
      okLabel
      cancelLabel
    }
    ... on UncompleteAction {
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
      isLeader
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

// Section arm fragments (two layers): own fields + children via the next
// layer's match. fragmentPropName is SectionNode1 / SectionNode2 -- the
// matched component receives this fragment's reference under the same
// prop name (MatchContainer contract).
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

// Leaf-layer match: every concrete type except SectionBlock gets an @module arm.
// @module(name:) is the component reference the server returns, matching the host loader registry keys.
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

// Layer-2 match: leaf arms + SectionBlock arm (children via the Leaf layer).
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

// Layer-1 (root) match: leaf arms + SectionBlock arm (children via the Node2 layer).
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
