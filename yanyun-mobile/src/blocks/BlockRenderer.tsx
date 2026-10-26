// RN block wiring (server 3D): traversal/match logic lives in
// @yanyun/blocks-core (MatchContainer dispatches per node by the @module
// reference returned by the server); this file only injects the host's
// component loader and Unknown placeholder into the core walker. Each
// block's renderer is one module under ./modules/, lazily required by
// reference name via moduleLoader; there is no __typename dispatch table.
// Leaves only render and fire action objects -- no permission checks
// (the server composes the tree per viewer).
import { createBlockRenderer } from '@yanyun/blocks-core';
import { blockModuleLoader } from './moduleLoader';
import UnknownBlockView from './modules/UnknownBlockView';

export const { BlockNode1View, BlockNode2View, BlockLeafView } = createBlockRenderer({
  loader: blockModuleLoader,
  Unknown: UnknownBlockView,
});
