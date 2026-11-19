import { describe, expect, it } from 'vitest';

import { allowedAffixKeys, mergeSlotAffixRows, type SlotAffixRow } from './gradSlotAffix';

// Fixture rows mirror the production slot_affix shape: for a given slot
// the big-external layout lists max_atk but not min_atk, the
// small-external layout lists min_atk (and class_atk_max) but not
// max_atk. Real gear can roll both bounds, so the editor's selectable
// set must be the union of the two layouts.
const bigRows: SlotAffixRow[] = [
  { slot: '主武器', affixKey: 'max_atk' },
  { slot: '主武器', affixKey: 'precision' },
  { slot: '冠胄', affixKey: 'max_atk' },
];

const smallRows: SlotAffixRow[] = [
  { slot: '主武器', affixKey: 'min_atk' },
  { slot: '主武器', affixKey: 'class_atk_max' },
  { slot: '主武器', affixKey: 'precision' },
  { slot: '冠胄', affixKey: 'min_atk' },
];

describe('mergeSlotAffixRows / allowedAffixKeys (grad affix union)', () => {
  it('big view: allowed for a slot contains both min_atk and max_atk', () => {
    // Current build first (big), other build second — the component's order.
    const allowed = allowedAffixKeys(mergeSlotAffixRows(bigRows, smallRows), '主武器');
    expect(allowed).toContain('min_atk');
    expect(allowed).toContain('max_atk');
  });

  it('small view: allowed for a slot contains both min_atk and max_atk', () => {
    const allowed = allowedAffixKeys(mergeSlotAffixRows(smallRows, bigRows), '主武器');
    expect(allowed).toContain('min_atk');
    expect(allowed).toContain('max_atk');
  });

  it('an affix that only exists in the other build is selectable', () => {
    // class_atk_max only ships in the small layout's rows; a big-layout
    // player must still be able to pick it.
    const allowed = allowedAffixKeys(mergeSlotAffixRows(bigRows, smallRows), '主武器');
    expect(allowed).toContain('class_atk_max');
  });

  it('de-duplicates keys shared by both builds and keeps current-build order first', () => {
    const allowed = allowedAffixKeys(mergeSlotAffixRows(bigRows, smallRows), '主武器');
    expect(allowed.filter((k) => k === 'precision')).toHaveLength(1);
    expect(allowed[0]).toBe('max_atk');
  });

  it('does not leak affixes across slots', () => {
    const allowed = allowedAffixKeys(mergeSlotAffixRows(bigRows, smallRows), '冠胄');
    expect(allowed).toEqual(['max_atk', 'min_atk']);
    expect(allowed).not.toContain('class_atk_max');
  });
});
