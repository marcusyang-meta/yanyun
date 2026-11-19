import { describe, expect, it } from 'vitest';

import {
  gradGearItemsForSlot, gradRowsFromGearItem, type GradGearItemLike,
} from './gradGearFill';

// Fixture mirrors a backend-translated library item (gradGearItems):
// canonical affix keys, stored line order, attunement already mapped.
const fullItem: GradGearItemLike = {
  id: '300001',
  name: '示例剑',
  gradSlots: ['mainWeapon', 'offWeapon'],
  lines: [
    { key: 'min_atk', val: 85.2 },
    { key: 'min_atk', val: 85.2 },
    { key: 'class_atk_min', val: 48.3 },
    { key: 'agility', val: 54 },
    { key: 'crit_rate', val: 9.8 },
  ],
  dingyin: { key: 'phys_pen', val: 12.8 },
  skipped: 1,
};

describe('gradRowsFromGearItem (library fill assembly)', () => {
  it('fills all six rows: five affix lines in order, then the attunement row', () => {
    expect(gradRowsFromGearItem(fullItem)).toEqual([
      { key: 'min_atk', value: '85.2', res: false },
      { key: 'min_atk', value: '85.2', res: false },
      { key: 'class_atk_min', value: '48.3', res: false },
      { key: 'agility', value: '54', res: false },
      { key: 'crit_rate', value: '9.8', res: false },
      { key: 'phys_pen', value: '12.8', res: false },
    ]);
  });

  it('leaves the attunement row empty when the item has no mappable attunement', () => {
    const rows = gradRowsFromGearItem({ ...fullItem, dingyin: null });
    expect(rows).toHaveLength(6);
    expect(rows[5]).toEqual({ key: '', value: '', res: false });
  });

  it('pads short line lists with empty rows', () => {
    const rows = gradRowsFromGearItem({
      ...fullItem,
      lines: [{ key: 'max_atk', val: 90.6 }],
      dingyin: null,
    });
    expect(rows[0]).toEqual({ key: 'max_atk', value: '90.6', res: false });
    expect(rows.slice(1)).toEqual([
      { key: '', value: '', res: false },
      { key: '', value: '', res: false },
      { key: '', value: '', res: false },
      { key: '', value: '', res: false },
      { key: '', value: '', res: false },
    ]);
  });
});

describe('gradGearItemsForSlot (weapon pool serves both positions)', () => {
  const armor: GradGearItemLike = {
    id: '300002', name: '', gradSlots: ['head'],
    lines: [{ key: 'max_atk', val: 85.2 }], dingyin: null, skipped: 0,
  };
  const items = [fullItem, armor];

  it('a weapon item is offered for both the main and the off weapon slot', () => {
    expect(gradGearItemsForSlot(items, 'mainWeapon')).toEqual([fullItem]);
    expect(gradGearItemsForSlot(items, 'offWeapon')).toEqual([fullItem]);
  });

  it('non-weapon items stay in their own slot', () => {
    expect(gradGearItemsForSlot(items, 'head')).toEqual([armor]);
    expect(gradGearItemsForSlot(items, 'ring')).toEqual([]);
  });

  it('filling both weapon slots from one item yields independent rows', () => {
    const main = gradRowsFromGearItem(fullItem);
    const off = gradRowsFromGearItem(fullItem);
    main[0].value = '1';
    expect(off[0].value).toBe('85.2');
  });
});
