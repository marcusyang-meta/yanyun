// Server-3D operation registry: every @module arm fragment has a
// compiler-generated split operation artifact (<Fragment>$normalization).
// The __module_operation reference the server returns via Block.js is
// that "<Fragment>$normalization.graphql" name; the host registers it
// with the Relay Environment's operationLoader, and at runtime the
// matched arm's GraphQL data is normalized into the store from the same
// response (unmatched arms produce no operation, so their fields are
// not in the response at all).
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

// Relay Environment operationLoader: all artifacts are local to this
// package, so get always hits synchronously (load is only a contract fallback).
export const blockOperationLoader: OperationLoader = {
  get: (ref) => lookupSplitOperation(ref),
  load: (ref) => Promise.resolve(lookupSplitOperation(ref)),
};
