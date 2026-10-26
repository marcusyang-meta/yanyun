import React from 'react';
import type { ComponentType, ReactNode } from 'react';
import { useFragment } from 'react-relay';
import type { MatchContainerProps } from 'react-relay/relay-hooks/MatchContainer';

// MatchContainer is not exported from react-relay's main entry (types
// live in relay-hooks/MatchContainer.d.ts, the runtime only on the lib/
// path, module.exports = MatchContainer itself), so it is imported via
// the implementation path with types annotated from the official
// signature. Metro/Web bundler resolution of the lib deep path is verified.
const MatchContainer = require('react-relay/lib/relay-hooks/MatchContainer') as ComponentType<
  MatchContainerProps<Record<string, unknown>, ReactNode>
>;
import { BlockLeafMatchFragment, BlockNode1MatchFragment, BlockNode2MatchFragment } from './fragments';
import type { ActionHandlers } from './types';
import type { fragments_BlockLeafMatch$key } from './__generated__/fragments_BlockLeafMatch.graphql';
import type { fragments_BlockNode1Match$key } from './__generated__/fragments_BlockNode1Match.graphql';
import type { fragments_BlockNode2Match$key } from './__generated__/fragments_BlockNode2Match.graphql';

// Recursive walker (platform-neutral) -- Relay server 3D form: each
// layer's useFragment yields a match pointer (the __module_component
// reference returned via Block.js decides which @module arm matches);
// MatchContainer resolves the reference through the host loader to that
// concrete type's renderer, which receives its data reference under a
// prop named by the fragment suffix (e.g. TextBlock=..., SectionNode1=...)
// plus handlers via props. There is no type or permission judgment here
// -- whatever tree and references the server composes is rendered; a new
// type with no client arm (no __module_component) falls back via
// MatchContainer to the host Unknown placeholder while siblings render
// as usual. Never a blank screen.
//
// Container recursion is driven by Section arm components rendering
// their own children (children go through the next layer's match in
// their fragment), mirroring the three layers in fragments.ts: Node1
// (root) -> SectionNode1's children via Node2 -> SectionNode2's children
// via Leaf. Data masking is unchanged: fragment references/pointers are
// passed down, never raw objects.

export type BlockModuleLoader = (moduleRef: unknown) => ComponentType<any>;

export interface BlockRendererDeps {
  // Resolve a server-returned component reference (e.g. "TextBlock") to a renderer;
  // hosts implement this as a lazy-require registry; unknown references should return the Unknown component itself.
  loader: BlockModuleLoader;
  // Placeholder when no arm matches (host visuals).
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
