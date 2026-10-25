// @yanyun/blocks-core — Bloks-lite 平台中立核心 (原 yanyun-mobile/src/blocks/core)。
// 平台叶子 (RN / Web / Tauri 渲染) 不在这里: 宿主经 BlockLeafRegistry 注入。
export * from './types';
export * from './fragments';
export * from './actions';
export * from './renderer';

// fragment 工件类型转出 (宿主叶子渲染器需要 $key/$data 类型;
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
