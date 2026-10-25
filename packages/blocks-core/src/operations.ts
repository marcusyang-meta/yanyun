// server 3D 的操作侧注册表: 每个 @module 臂 fragment 都有一份编译器
// 生成的拆分操作工件 (<Fragment>$normalization)。服务端经 Block.js
// 回传的 __module_operation 引用就是 "<Fragment>$normalization.graphql"
// 这串名字; 宿主把它注册进 Relay Environment 的 operationLoader,
// 运行时据此把命中臂的 GraphQL 数据从同一份响应里归一化进 store
// (未命中的臂不产生操作, 其数据字段根本不在响应里)。
import type { NormalizationSplitOperation, OperationLoader } from 'relay-runtime';
import TextBlockOp from './__generated__/fragments_TextBlock$normalization.graphql';
import BannerBlockOp from './__generated__/fragments_BannerBlock$normalization.graphql';
import SectionHeaderBlockOp from './__generated__/fragments_SectionHeaderBlock$normalization.graphql';
import ChipRowBlockOp from './__generated__/fragments_ChipRowBlock$normalization.graphql';
import GroupingCardBlockOp from './__generated__/fragments_GroupingCardBlock$normalization.graphql';
import SeatGridBlockOp from './__generated__/fragments_SeatGridBlock$normalization.graphql';
import ActionButtonBlockOp from './__generated__/fragments_ActionButtonBlock$normalization.graphql';
import EmptyStateBlockOp from './__generated__/fragments_EmptyStateBlock$normalization.graphql';
import SpacerBlockOp from './__generated__/fragments_SpacerBlock$normalization.graphql';
import FallbackBlockOp from './__generated__/fragments_FallbackBlock$normalization.graphql';
import SectionNode1Op from './__generated__/fragments_SectionNode1$normalization.graphql';
import SectionNode2Op from './__generated__/fragments_SectionNode2$normalization.graphql';

const SPLIT_OPERATIONS: Record<string, NormalizationSplitOperation> = {
  'fragments_TextBlock$normalization.graphql': TextBlockOp,
  'fragments_BannerBlock$normalization.graphql': BannerBlockOp,
  'fragments_SectionHeaderBlock$normalization.graphql': SectionHeaderBlockOp,
  'fragments_ChipRowBlock$normalization.graphql': ChipRowBlockOp,
  'fragments_GroupingCardBlock$normalization.graphql': GroupingCardBlockOp,
  'fragments_SeatGridBlock$normalization.graphql': SeatGridBlockOp,
  'fragments_ActionButtonBlock$normalization.graphql': ActionButtonBlockOp,
  'fragments_EmptyStateBlock$normalization.graphql': EmptyStateBlockOp,
  'fragments_SpacerBlock$normalization.graphql': SpacerBlockOp,
  'fragments_FallbackBlock$normalization.graphql': FallbackBlockOp,
  'fragments_SectionNode1$normalization.graphql': SectionNode1Op,
  'fragments_SectionNode2$normalization.graphql': SectionNode2Op,
};

function lookupSplitOperation(ref: unknown): NormalizationSplitOperation | null {
  if (typeof ref !== 'string') return null;
  return SPLIT_OPERATIONS[ref] ?? SPLIT_OPERATIONS[`${ref}.graphql`] ?? null;
}

// Relay Environment 的 operationLoader: 工件都在本地包内, get 恒可
// 同步命中 (load 仅作契约兜底)。
export const blockOperationLoader: OperationLoader = {
  get: (ref) => lookupSplitOperation(ref),
  load: (ref) => Promise.resolve(lookupSplitOperation(ref)),
};
