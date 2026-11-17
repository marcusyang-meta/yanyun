import { createContext, useContext } from 'react';

// Shell slot for the grouping list's type-filter capsule. The guild
// home's floating bar row (GuildHome) renders the section-tab capsule
// plus an empty slot element; the grouping list — the only surface
// with a type filter — portals its filter capsule into that slot so
// tabs and filters sit on ONE row as two adjacent capsules (IG-style
// floating bar), while the filter state and its query stay inside the
// list where they belong. When no slot is provided (any other mount
// of the list), the list renders the capsule inline in its old
// position instead.
export const FilterSlotContext = createContext<HTMLElement | null>(null);

export function useFilterSlot(): HTMLElement | null {
  return useContext(FilterSlotContext);
}
