// @vitest-environment jsdom
import { act, type ComponentProps } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import GearOcrBatch from './GearOcrBatch.react.tsx';
import type { OcrEngine } from './GearOcr.ts';

vi.mock('./Toast.react.tsx', () => ({ toast: vi.fn() }));

type BatchProps = ComponentProps<typeof GearOcrBatch>;

it('counts each successful OCR batch separately and keeps failed imports retryable', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const container = document.createElement('div');
  const root = createRoot(container);
  const pending: Array<() => void> = [];
  let failedOnce = false;
  const gear = (value: number) => ({
    name: `Gear ${value}`, slot: '冠胄', lines: [{ key: 'jin', val: value }],
    dingyin: null, unknowns: [], schools: [],
  });
  const engine: OcrEngine = {
    process: (file) => new Promise((resolve, reject) => {
      pending.push(() => {
        const value = Number((file as File).name);
        if (value === -1 && !failedOnce) {
          failedOnce = true;
          reject(new Error('Unrecognized screenshot'));
          return;
        }
        resolve({ parsed: gear(value === -1 ? 30 : value), text: '', box: null, width: 1, height: 1 });
      });
    }),
    rerunBox: vi.fn(),
  };
  const t: Partial<BatchProps['t']> = {
    gearGearSlots: ['冠胄'], gearDingyinGroups: [], gearAffixes: [],
    gearOcrBatchImportTemplate: 'Import {n}', gearOcrBatchResultTemplate: 'Imported {n}, skipped {m}',
    gearOcrBatchRetryLabel: 'Retry recognition',
  };
  const maps: BatchProps['maps'] = {
    pasteNames: [], nameToClass: [], slotAliases: [], ocrAliases: [], dingyinLeft: [], affixes: [], schoolTags: [],
    rules: { weaponSlot: '武器', weaponPositions: [], ocrStripPrefixes: [], ocrDingyinMarker: '', ocrDingyinFallbacks: [] },
  };
  let enqueue: Parameters<BatchProps['registerEnqueue']>[0] = null;
  const importItems = vi.fn<BatchProps['onImport']>();
  const finishRecognition = async () => {
    for (let finish = pending.shift(); finish; finish = pending.shift()) {
      await act(async () => finish());
    }
  };
  const addImages = async (values: number[]) => {
    const files = values.map((value) => new File([], String(value), { type: 'image/png' }));
    await act(async () => enqueue?.(files));
    await finishRecognition();
  };
  const click = async (label: string) => {
    const button = [...container.querySelectorAll('button')].find((node) => node.textContent === label);
    expect(button?.disabled).toBe(false);
    await act(async () => button?.click());
  };

  try {
    await act(async () => root.render(
      <GearOcrBatch t={t as BatchProps['t']} maps={maps} items={[{ ...gear(0), id: 1, warnings: [] }]}
        engine={engine} loggedIn onImport={importItems} registerEnqueue={(fn) => { enqueue = fn; }} />,
    ));
    await addImages([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, -1]);
    await click('Import 10');
    const first = importItems.mock.calls[0];
    expect(first[2].imageCount).toBe(12);

    await addImages([11, 12, 13, 14, 15, 16, 17, 18, 19]);
    await act(async () => first[1](10));
    await click('Import 9');
    const second = importItems.mock.calls[1];
    expect(second[2].imageCount).toBe(9);

    await act(async () => second[2].onFailed());
    await click('Import 9');
    const retry = importItems.mock.calls[2];
    expect(retry[2].imageCount).toBe(9);
    await act(async () => retry[1](9));

    await click('Retry recognition');
    await finishRecognition();
    await click('Import 1');
    expect(importItems.mock.calls[3][2].imageCount).toBe(1);
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});
