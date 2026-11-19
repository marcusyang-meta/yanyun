// Union assembly for the graduation calculator's per-slot affix picker.
//
// The backend slot_affix reference splits rollable affixes by build
// layout (big-external vs small-external): e.g. the big layout lists
// max_atk for a slot but not min_atk, and the small layout the reverse.
// Real gear can roll both bounds regardless of the player's current
// layout, so the slot editor must offer the union of both builds' rows
// for a slot (the reference tool's entry form uses the full affix table
// the same way). The per-build reference tables keep using the
// un-merged rows; only the editor's selectable set is the union.

export type SlotAffixRow = {
  readonly slot: string;
  readonly affixKey: string;
};

// Union of two builds' slot_affix rows, de-duplicated by
// (slot, affixKey); first-seen order is preserved so the current
// build's rows keep their delivered order at the head of each slot.
export function mergeSlotAffixRows(
  first: ReadonlyArray<SlotAffixRow>,
  second: ReadonlyArray<SlotAffixRow>,
): SlotAffixRow[] {
  const seen = new Set<string>();
  const out: SlotAffixRow[] = [];
  for (const row of [...first, ...second]) {
    const id = JSON.stringify([row.slot, row.affixKey]);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ slot: row.slot, affixKey: row.affixKey });
  }
  return out;
}

// Selectable affix keys for one slot out of a (possibly merged) row set.
export function allowedAffixKeys(
  rows: ReadonlyArray<SlotAffixRow>,
  slot: string,
): string[] {
  return rows.filter((r) => r.slot === slot).map((r) => r.affixKey);
}
