type DingyinGroup = {
  readonly slots: readonly string[];
  readonly options: readonly { name: string; label: string; max: number }[];
};

type DingyinFields = { slot: string; dyName: string; dyVal: string };

function groupForSlot(groups: readonly DingyinGroup[], slot: string) {
  return groups.find((group) => group.slots.includes(slot));
}

export function dingyinOptions(groups: readonly DingyinGroup[], slot: string, currentName: string) {
  const options = (groupForSlot(groups, slot)?.options ?? []).map(({ name, label }) => ({ value: name, label }));
  if (currentName && !options.some((option) => option.value === currentName)) {
    // Keep an existing custom name selectable while editing that item.
    options.push({ value: currentName, label: currentName });
  }
  return [{ value: '', label: '—' }, ...options];
}

export function dingyinMax(groups: readonly DingyinGroup[], slot: string, name: string) {
  return groupForSlot(groups, slot)?.options.find((option) => option.name === name)?.max;
}

export function dingyinSlotChange(groups: readonly DingyinGroup[], current: DingyinFields, slot: string): DingyinFields {
  const sameGroup = groupForSlot(groups, current.slot)?.slots.includes(slot);
  return { slot, dyName: sameGroup ? current.dyName : '', dyVal: sameGroup ? current.dyVal : '' };
}
