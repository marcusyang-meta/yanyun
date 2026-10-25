import React from 'react';
import type { ComponentType, ReactNode } from 'react';
import { useFragment } from 'react-relay';
import type { MatchContainerProps } from 'react-relay/relay-hooks/MatchContainer';

// MatchContainer 未从 react-relay 主入口导出 (npm 包的类型放在
// relay-hooks/MatchContainer.d.ts, 运行时实现只在 lib/ 路径,
// module.exports = MatchContainer 本人), 故经实现路径引入, 类型按
// 官方签名标注。Metro/Web 打包器对 lib 深路径的解析已实测可达。
const MatchContainer = require('react-relay/lib/relay-hooks/MatchContainer') as ComponentType<
  MatchContainerProps<Record<string, unknown>, ReactNode>
>;
import { BlockLeafMatchFragment, BlockNode1MatchFragment, BlockNode2MatchFragment } from './fragments';
import type { ActionHandlers } from './types';
import type { fragments_BlockLeafMatch$key } from './__generated__/fragments_BlockLeafMatch.graphql';
import type { fragments_BlockNode1Match$key } from './__generated__/fragments_BlockNode1Match.graphql';
import type { fragments_BlockNode2Match$key } from './__generated__/fragments_BlockNode2Match.graphql';

// 递归遍历器 (平台中立) — Relay server 3D 形态:
// 每层 useFragment 读出的是 match 指针 (服务端经 Block.js 回传的
// __module_component 引用决定命中哪个 @module 臂), MatchContainer 经
// 宿主 loader 把引用解析为该具体类型的渲染组件, 组件以 fragment 名
// 后缀为 prop 名收到自己的数据引用 (如 TextBlock=..., SectionNode1=...),
// 并经 props 收到 handlers。这里没有任何类型判断与权限判断 —— 服务端
// 组什么树、回传什么引用, 就渲染什么; 客户端没有臂可命中的新类型
// (无 __module_component) 由 MatchContainer 走 fallback = 宿主 Unknown
// 占位, 其余兄弟节点照常渲染, 永不白屏。
//
// 容器递归靠 Section 臂组件自己继续渲染 children (children 在其
// fragment 里走下一层 match), 层级与 fragments.ts 的三层结构对应:
// Node1 (根) → SectionNode1 的 children 走 Node2 → SectionNode2 的
// children 走 Leaf。数据掩码纪律不变: 向下传的是 fragment 读出的
// 引用/指针, 不传原始对象。

export type BlockModuleLoader = (moduleRef: unknown) => ComponentType<any>;

export interface BlockRendererDeps {
  // 把服务端回传的组件引用 (如 "TextBlock") 解析为渲染组件;
  // 宿主以懒 require 注册表实现, 未知引用应返回 Unknown 组件本身。
  loader: BlockModuleLoader;
  // 无臂命中时的占位 (宿主视觉)。
  Unknown: ComponentType;
}

export function createBlockRenderer({ loader, Unknown }: BlockRendererDeps) {
  function BlockLeafView({ block, handlers }: { block: fragments_BlockLeafMatch$key; handlers: ActionHandlers }) {
    const match = useFragment(BlockLeafMatchFragment, block);
    return <MatchContainer match={match} loader={loader} props={{ handlers }} fallback={<Unknown />} />;
  }

  function BlockNode2View({ block, handlers }: { block: fragments_BlockNode2Match$key; handlers: ActionHandlers }) {
    const match = useFragment(BlockNode2MatchFragment, block);
    return <MatchContainer match={match} loader={loader} props={{ handlers }} fallback={<Unknown />} />;
  }

  function BlockNode1View({ block, handlers }: { block: fragments_BlockNode1Match$key; handlers: ActionHandlers }) {
    const match = useFragment(BlockNode1MatchFragment, block);
    return <MatchContainer match={match} loader={loader} props={{ handlers }} fallback={<Unknown />} />;
  }

  return { BlockNode1View, BlockNode2View, BlockLeafView };
}
