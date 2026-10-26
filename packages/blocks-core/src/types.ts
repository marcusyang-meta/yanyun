// Platform-neutral core -- the reusable boundary of the block system
// (other surfaces such as a desktop overlay reuse this and only write
// their own leaf renderers; no platform APIs like react-native / DOM
// may be imported in this directory).
//
// In the core: the GraphQL fragment contract (fragments.ts, incl. server
// 3D's three-layer match fragments), the tree walker (renderer.tsx,
// MatchContainer), the split-operation registry (operations.ts) and
// action dispatch (actions.ts).
// Not in the core: what concrete leaves look like (each platform's own
// @module renderers, resolved by the loader from server-returned
// reference names), confirm-dialog presentation (injected via
// ConfirmFn), and navigation/mutation landing (injected via ActionHandlers).

// Page-level copy (injected by the host from page shell queries; leaves
// only consume, never invent): seal text and open/closed status labels
// live in the list page shell; empty-seat copy lives in the detail shell.
export interface LeafPageText {
  sealText?: string;
  statusOpenLabel?: string;
  seatEmptyJoinLabel?: string;
  seatEmptyLabel?: string;
  seatLeaderLabel?: string;
}

// Action handlers: implemented by the host (navigation targets and mutation landing are per-platform).
export interface ActionHandlers {
  pageText?: LeafPageText;
  navigate: (a: { slug: string; groupingId: string; name: string; readOnly: boolean; nick: string }) => void;
  join: (a: { groupingId: string; seatIndex: number }) => void;
  leave: (a: { groupingId: string; uid: string }) => void;
  disband: (a: { groupingId: string }) => void;
  edit: (a: { groupingId: string }) => void;
  complete: (a: { groupingId: string }) => void;
  uncomplete: (a: { groupingId: string }) => void;
}

// Confirm presentation injection point: all copy comes from the Action object (server i18n);
// each platform implements this function with its own dialog mechanism (RN: Alert; DOM: own modal, etc.).
export interface ConfirmRequest {
  title: string;
  message: string;
  okLabel: string;
  cancelLabel: string;
  destructive: boolean;
  onConfirm: () => void;
}
export type ConfirmFn = (req: ConfirmRequest) => void;

// Uniform props shape for host renderers (loaded by the loader after an
// @module match): the data reference keyed by fragment suffix (e.g.
// TextBlock / SectionNode1) is injected by MatchContainer, and handlers
// are passed through via MatchContainer props. Display-only leaves may
// declare just their own slice; interactive leaves (cards/seats/buttons)
// also receive handlers. Each platform's module components define their
// own props types in this shape.
