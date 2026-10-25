import React from 'react';
import { useFragment } from 'react-relay';
import { BlockLeafFragment, BlockNode1Fragment, BlockNode2Fragment } from './fragments';
import type { ActionHandlers, BlockLeafRegistry } from './types';
import type { fragments_BlockNode1$key } from './__generated__/fragments_BlockNode1.graphql';
import type { fragments_BlockNode2$key } from './__generated__/fragments_BlockNode2.graphql';
import type { fragments_BlockLeaf$key } from './__generated__/fragments_BlockLeaf.graphql';

// 递归遍历器 (平台中立): 拿到带类型的 Block 对象, 递归 children 直到叶子,
// 叶子交给宿主注册表里的组件渲染。这里没有任何权限判断 —— 树里有什么就
// 渲染什么, 权限由服务端组树时决定。未知 __typename → 注册表的 Unknown
// 占位, 其余兄弟节点照常渲染, 永不白屏。
//
// 容器递归用“层级 fragment”实现 (GraphQL 不允许 fragment 循环引用):
// Node1 (根) → SectionBlock 的 children 走 Node2 → 再下一层走 Leaf。
// 服务端真实树深 ≤ 3 层, 三层足够; 更深的 SectionBlock 落到 Unknown 占位。
//
// 数据掩码纪律: 往下传的必须是本层 useFragment 的返回值 (它才携带本层
// fragment 内 spread 的下层引用), 不能传原始 prop, 否则 Relay 找不到引用报错。
export function createBlockRenderer(leaves: BlockLeafRegistry) {
  function LeafView({ block, handlers }: { block: fragments_BlockLeaf$key; handlers: ActionHandlers }) {
    const data = useFragment(BlockLeafFragment, block);
    // 按对象类型分发到注册表组件 —— 这是渲染分发, 不是权限/含义判断。
    switch (data.__typename) {
      case 'TextBlock':
        return data.textBlock ? <leaves.TextBlock block={data.textBlock} /> : <leaves.Unknown />;
      case 'BannerBlock':
        return data.bannerBlock ? <leaves.BannerBlock block={data.bannerBlock} /> : <leaves.Unknown />;
      case 'SectionHeaderBlock':
        return data.sectionHeaderBlock ? <leaves.SectionHeaderBlock block={data.sectionHeaderBlock} /> : <leaves.Unknown />;
      case 'ChipRowBlock':
        return data.chipRowBlock ? <leaves.ChipRowBlock block={data.chipRowBlock} /> : <leaves.Unknown />;
      case 'GroupingCardBlock':
        return data.groupingCardBlock ? <leaves.GroupingCardBlock block={data.groupingCardBlock} handlers={handlers} /> : <leaves.Unknown />;
      case 'SeatGridBlock':
        return data.seatGridBlock ? <leaves.SeatGridBlock block={data.seatGridBlock} handlers={handlers} /> : <leaves.Unknown />;
      case 'ActionButtonBlock':
        return data.actionButtonBlock ? <leaves.ActionButtonBlock block={data.actionButtonBlock} handlers={handlers} /> : <leaves.Unknown />;
      case 'EmptyStateBlock':
        return data.emptyStateBlock ? <leaves.EmptyStateBlock block={data.emptyStateBlock} /> : <leaves.Unknown />;
      case 'SpacerBlock':
        return data.spacerBlock ? <leaves.SpacerBlock block={data.spacerBlock} /> : <leaves.Unknown />;
      case 'FallbackBlock':
        return data.fallbackBlock ? <leaves.FallbackBlock block={data.fallbackBlock} /> : <leaves.Unknown />;
      default:
        return <leaves.Unknown />;
    }
  }

  function BlockNode2View({ block, handlers }: { block: fragments_BlockNode2$key; handlers: ActionHandlers }) {
    const data = useFragment(BlockNode2Fragment, block);
    if (data.__typename === 'SectionBlock') {
      return (
        <leaves.Section title={data.title ?? null}>
          {(data.children ?? []).map((child, i) => (
            <LeafView key={i} block={child as unknown as fragments_BlockLeaf$key} handlers={handlers} />
          ))}
        </leaves.Section>
      );
    }
    return <LeafView block={data as unknown as fragments_BlockLeaf$key} handlers={handlers} />;
  }

  function BlockNode1View({ block, handlers }: { block: fragments_BlockNode1$key; handlers: ActionHandlers }) {
    const data = useFragment(BlockNode1Fragment, block);
    if (data.__typename === 'SectionBlock') {
      return (
        <leaves.Section title={data.title ?? null}>
          {(data.children ?? []).map((child, i) => (
            <BlockNode2View key={i} block={child} handlers={handlers} />
          ))}
        </leaves.Section>
      );
    }
    return <LeafView block={data as unknown as fragments_BlockLeaf$key} handlers={handlers} />;
  }

  return { BlockNode1View, BlockNode2View };
}
