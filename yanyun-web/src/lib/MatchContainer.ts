// MatchContainer ships inside react-relay (lib/relay-hooks/MatchContainer.js)
// but in v21 it is neither re-exported from the package index nor declared in
// the published .d.ts. Import the genuine implementation via its deep path
// (the package has no exports map, so the subpath resolves) and type the
// props this app uses.
// @ts-ignore - no declaration file exists for this deep path in the package
import MatchContainerImpl from 'react-relay/lib/relay-hooks/MatchContainer';
import type { ComponentType, ReactNode } from 'react';

export interface MatchContainerProps {
  /** The value of the field carrying the @match fragment (has __module_component). */
  match?: unknown;
  /** Maps the matched module provider to a component (see JSResource.matchLoader). */
  loader: (moduleProvider: unknown) => ComponentType<any> | null;
  /** Extra props forwarded to the matched component alongside the fragment ref. */
  props?: Record<string, unknown>;
  fallback?: ReactNode;
}

const MatchContainer = MatchContainerImpl as ComponentType<MatchContainerProps>;
export default MatchContainer;
