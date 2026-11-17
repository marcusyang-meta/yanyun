import { createContext, useContext } from 'react';

// Shell slot for the grouping list's type-filter capsule. The guild
// home's floating control row (GuildHome) renders an empty slot
// element on the title row; the grouping list — the only surface
// with a type filter — portals its filter capsule into that slot so
// the filter joins the title row's control group (IG-style floating
// bar), while the filter state and its query stay inside the list
// where they belong. Section navigation is NOT part of this row: it
// lives only in the left rail. When no slot is provided (any other
// mount of the list), the list renders the capsule inline in its old
// position instead.
export const FilterSlotContext = createContext<HTMLElement | null>(null);

export function useFilterSlot(): HTMLElement | null {
  return useContext(FilterSlotContext);
}

// Second shell slot on the same floating row, at its right end: the
// grouping list's action buttons (week image / new car) portal here
// so they belong to the title row's visual group instead of floating
// on a separate row under the capsules. The buttons' state and
// handlers stay in the list route; only their DOM lands in the row.
// When no slot is provided, the route renders the buttons inline in
// their old position instead.
export const ActionsSlotContext = createContext<HTMLElement | null>(null);

export function useActionsSlot(): HTMLElement | null {
  return useContext(ActionsSlotContext);
}
