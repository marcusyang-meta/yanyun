// @vitest-environment jsdom
import { act, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RelayEnvironmentProvider } from 'react-relay';
import { expect, it, vi } from 'vitest';
import { relayEnvironment } from '../../lib/relay';
import GradCalc from './GradCalc.react.tsx';
import GradCalcTextQuery from './__generated__/GradCalcTextQuery.graphql';

vi.mock('./GearBench.react.tsx', () => ({ default: () => null }));

const slots = [
  ['mainWeapon', '主武器'], ['offWeapon', '副武器'], ['head', '冠胄'], ['body', '胸甲'],
  ['legs', '胫甲'], ['wrist', '腕甲'], ['ring', '环'], ['pendant', '佩'],
].map(([id, label]) => ({ id, label, icon: '' }));

function graphqlData(query: string) {
  if (query.includes('GradCalcTextQuery')) {
    const page = GradCalcTextQuery.operation.selections.find((field) => field.kind === 'LinkedField' && field.name === 'gradPage');
    const copy = Object.fromEntries((page?.kind === 'LinkedField' ? page.selections : [])
      .flatMap((field) => field.kind === 'ScalarField' ? [[field.name, field.name]] : []));
    return { gradPage: {
      ...copy, gradCloseLabel: '关闭', gradPickFromLibraryLabel: '从装备库选择', gradSlots: slots, gradRates: [],
      gradGearItems: [{ id: '30000000001', name: '已存长剑', gradSlots: [slots[0].id], lines: [{ key: 'power', val: 18.5 }], dingyin: null, skipped: 0 }],
    } };
  }
  if (query.includes('GradCalcAffixQuery')) {
    return { affixMaxList: [{ key: 'power', name: '劲', maxValue: 57.4, unit: '' }] };
  }
  if (query.includes('GradCalcSlotAffixQuery')) {
    return { slotAffixList: slots.map(({ label }) => ({ slot: label, affixKey: 'power' })) };
  }
  if (query.includes('GradCalcMutation')) {
    return { calcGraduation: { total: 0, countScore: 0, valueScore: 0, rateScore: 0, items: [] } };
  }
  throw new Error(`Unexpected appraisal request: ${query}`);
}

it('opens every appraisal slot above the page and retains edited affixes when closed', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
    const { query } = JSON.parse(String(init.body));
    return { json: async () => ({ data: graphqlData(query) }) };
  });

  const page = document.createElement('main');
  page.style.transform = 'translateY(0)';
  document.body.appendChild(page);
  const root = createRoot(page);
  const findDialog = () => document.querySelector<HTMLElement>('.yy-modal-panel[role="dialog"]');

  try {
    await act(async () => root.render(
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <Suspense fallback={null}><GradCalc sectSlug="mingjin-hong" /></Suspense>
      </RelayEnvironmentProvider>,
    ));

    const buttons = [...page.querySelectorAll<HTMLButtonElement>('button[aria-haspopup="dialog"]')];
    expect(buttons.map((button) => button.textContent)).toEqual(slots.map(({ label }) => label));

    function openEditor(button: HTMLButtonElement, label: string): HTMLElement {
      button.focus();
      act(() => button.click());
      const dialog = findDialog();
      expect(dialog).not.toBeNull();
      expect(dialog?.parentElement?.matches('.yy-modal-overlay')).toBe(true);
      expect(dialog?.parentElement?.parentElement).toBe(document.body);
      expect(page.contains(dialog)).toBe(false);
      const titleId = dialog?.getAttribute('aria-labelledby');
      expect(titleId && document.getElementById(titleId)?.textContent).toBe(label);
      return dialog!;
    }

    const first = buttons[0];
    const dialog = openEditor(first, slots[0].label);
    const picker = [...dialog.querySelectorAll('button')].find((button) => button.textContent === '从装备库选择')!;
    act(() => picker.click());
    const savedItem = [...dialog.querySelectorAll('button')].find((button) => button.textContent?.includes('已存长剑'))!;
    act(() => savedItem.click());
    const affix = dialog.querySelector<HTMLSelectElement>('select')!;
    const value = dialog.querySelector<HTMLInputElement>('input[type="number"]')!;
    expect(affix.value).toBe('power');
    expect(value.value).toBe('18.5');
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(value, '12.5');
      value.dispatchEvent(new Event('input', { bubbles: true }));
    });
    act(() => dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(findDialog()).toBeNull();
    expect(document.activeElement).toBe(first);

    for (const [index, button] of buttons.entries()) {
      const editor = openEditor(button, slots[index].label);
      expect(editor.querySelector<HTMLSelectElement>('select')?.value).toBe(index === 0 ? 'power' : '');
      expect(editor.querySelector<HTMLInputElement>('input[type="number"]')?.value).toBe(index === 0 ? '12.5' : '');
      act(() => editor.parentElement!.click());
      expect(findDialog()).toBeNull();
      expect(document.activeElement).toBe(button);
    }
  } finally {
    await act(async () => root.unmount());
    page.remove();
    vi.unstubAllGlobals();
  }
});
