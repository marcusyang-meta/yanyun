// Fill assembly for the graduation calculator's slot editor: turns a
// stored gear-library item into the editor's six rows for one slot.
// Mirrors the Web module of the same name (gradGearFill.ts there).
//
// The backend serves the caller's library pre-translated into
// calculator affix keys (GradPage.gradGearItems; the GP -> canonical
// key bridge lives server-side in gradlink.ts), so this module only
// shapes rows: affix lines in stored order into rows 1-5 (main + four
// sub), the attunement line into row 6, everything else padded empty.
// Filled rows start unflagged for resonance — library lines carry no
// such flag, exactly like a fresh hand entry — and stay hand-editable.

export type GradGearLineLike = {
  readonly key: string;
  readonly val: number;
};

export type GradGearItemLike = {
  readonly id: string | number;
  readonly name: string;
  readonly gradSlots: ReadonlyArray<string>;
  readonly lines: ReadonlyArray<GradGearLineLike>;
  readonly dingyin: GradGearLineLike | null | undefined;
  readonly skipped: number;
};

export type GradFillRow = { key: string; value: string; res: boolean };

const AFFIX_ROWS = 5;

// Editor values are one-decimal strings (the calculator rounds to one
// decimal on submit as well).
const fmtVal = (v: number): string => String(Math.round(v * 10) / 10);

const emptyRow = (): GradFillRow => ({ key: '', value: '', res: false });

export function gradRowsFromGearItem(item: GradGearItemLike): GradFillRow[] {
  const rows: GradFillRow[] = item.lines
    .slice(0, AFFIX_ROWS)
    .map((l) => ({ key: l.key, value: fmtVal(l.val), res: false }));
  while (rows.length < AFFIX_ROWS) rows.push(emptyRow());
  rows.push(
    item.dingyin
      ? { key: item.dingyin.key, value: fmtVal(item.dingyin.val), res: false }
      : emptyRow()
  );
  return rows;
}

// Items that can fill a graduation slot: the backend tags every item
// with the slot ids it serves (weapon-pool items carry both weapon
// positions), so picking is a plain membership test.
export function gradGearItemsForSlot(
  items: ReadonlyArray<GradGearItemLike>,
  slotId: string
): GradGearItemLike[] {
  return items.filter((g) => g.gradSlots.includes(slotId));
}
