/* eslint-disable @typescript-eslint/no-require-imports --
   Lazy loading itself: render modules must be evaluated lazily by name
   via require thunks; a static import would load every leaf at startup,
   contradicting @module semantics. */
import type { ComponentType } from 'react';
import UnknownBlockView from './modules/UnknownBlockView';

// Server-3D component resolution (the RN/Expo form of JSResource): the
// __module_component reference returned via Block.js is the @module(name:)
// name (e.g. "TextBlock"). Only when MatchContainer's loader receives it
// does this code require() and cache the render module -- registrations
// are lazy thunks, so no leaf loads at app startup; references this client
// lacks (new server types) resolve to the Unknown placeholder. Metro
// bundles static require paths normally, and the path is identical on
// Expo Go / native / Web (require is synchronous, which natively
// satisfies MatchContainer's synchronous loader contract).
const MODULE_LOADERS: Record<string, () => ComponentType<any>> = {
  TextBlock: () => require('./modules/TextBlockView').default,
  BannerBlock: () => require('./modules/BannerBlockView').default,
  SectionHeaderBlock: () => require('./modules/SectionHeaderBlockView').default,
  ChipRowBlock: () => require('./modules/ChipRowBlockView').default,
  GroupingCardBlock: () => require('./modules/GroupingCardBlockView').default,
  SeatGridBlock: () => require('./modules/SeatGridBlockView').default,
  ActionButtonBlock: () => require('./modules/ActionButtonBlockView').default,
  EmptyStateBlock: () => require('./modules/EmptyStateBlockView').default,
  SpacerBlock: () => require('./modules/SpacerBlockView').default,
  FallbackBlock: () => require('./modules/FallbackBlockView').default,
  SectionNode1: () => require('./modules/SectionNode1View').default,
  SectionNode2: () => require('./modules/SectionNode2View').default,
};

const moduleCache = new Map<string, ComponentType<any>>();

export function blockModuleLoader(moduleRef: unknown): ComponentType<any> {
  const name = typeof moduleRef === 'string' ? moduleRef : '';
  const cached = moduleCache.get(name);
  if (cached) return cached;
  const load = MODULE_LOADERS[name];
  const component = load ? load() : UnknownBlockView;
  moduleCache.set(name, component);
  return component;
}
