// @yanyun/blocks-core — Bloks-lite 平台中立核心 (原 yanyun-mobile/src/blocks/core)。
// 平台叶子 (RN / Web / Tauri 渲染) 不在这里: 宿主经 loader 按服务端
// 回传的 @module 引用名解析自己的渲染组件 (见 renderer.tsx)。
export * from './types';
export * from './fragments';
export * from './actions';
export * from './renderer';
export * from './operations';

// fragment 工件类型转出 (宿主叶子渲染组件需要 $key/$data 类型;
// 工件本体由包内 relay 项目生成, 见仓根 relay.config.json)
export type { fragments_TextBlock$key } from './__generated__/fragments_TextBlock.graphql';
export type { fragments_BannerBlock$key } from './__generated__/fragments_BannerBlock.graphql';
export type { fragments_SectionHeaderBlock$key } from './__generated__/fragments_SectionHeaderBlock.graphql';
export type { fragments_ChipRowBlock$key } from './__generated__/fragments_ChipRowBlock.graphql';
export type { fragments_EmptyStateBlock$key } from './__generated__/fragments_EmptyStateBlock.graphql';
export type { fragments_SpacerBlock$key } from './__generated__/fragments_SpacerBlock.graphql';
export type { fragments_FallbackBlock$key } from './__generated__/fragments_FallbackBlock.graphql';
export type { fragments_GroupingCardBlock$key } from './__generated__/fragments_GroupingCardBlock.graphql';
export type { fragments_SeatGridBlock$key, fragments_SeatGridBlock$data } from './__generated__/fragments_SeatGridBlock.graphql';
export type { fragments_ActionButtonBlock$key } from './__generated__/fragments_ActionButtonBlock.graphql';
export type { fragments_BlockAction$key } from './__generated__/fragments_BlockAction.graphql';
export type { fragments_SectionNode1$key } from './__generated__/fragments_SectionNode1.graphql';
export type { fragments_SectionNode2$key } from './__generated__/fragments_SectionNode2.graphql';
export type { fragments_BlockLeafMatch$key } from './__generated__/fragments_BlockLeafMatch.graphql';
export type { fragments_BlockNode1Match$key } from './__generated__/fragments_BlockNode1Match.graphql';
export type { fragments_BlockNode2Match$key } from './__generated__/fragments_BlockNode2Match.graphql';
