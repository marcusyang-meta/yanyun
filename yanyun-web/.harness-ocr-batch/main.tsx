import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import '../src/index.css';
import { relayEnvironment } from '../src/lib/relay';
import GearLibrary from '../src/guild/components/GearLibrary.react.tsx';
import { ToastHost } from '../src/guild/components/Toast.react.tsx';
import type { OcrEngine } from '../src/guild/components/GearOcr.ts';

// 批量 OCR 验收页: 真实 GearLibrary (bench 模式, 内含 GearOcrBatch),
// OCR 引擎在边界注入桩夹具 (window.__OCR_FIXTURES 以文件名索引解析结果),
// 队列/核对/判重/导入/落库全走真实组件与真实后端。
const stubEngine: OcrEngine = {
  async process(file: File) {
    const f = (window as any).__OCR_FIXTURES?.[file.name];
    if (!f) throw new Error('no fixture for ' + file.name);
    await new Promise((r) => setTimeout(r, 40));
    return f;
  },
  async rerunBox(file: File, box: any) {
    const f = (window as any).__OCR_FIXTURES?.[file.name];
    if (!f) throw new Error('no fixture for ' + file.name);
    return { ...f, box };
  },
};

function Root() {
  return (
    <div style={{ padding: 20, maxWidth: 980, margin: '0 auto' }}>
      <Suspense fallback={<div>LOADING</div>}>
        <GearLibrary mode="bench" ocrEngine={stubEngine} />
      </Suspense>
      <ToastHost />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <RelayEnvironmentProvider environment={relayEnvironment}>
    <Root />
  </RelayEnvironmentProvider>,
);

// 截图模式 (?shot=1): 真实浏览器里自动把三张夹具图塞进批量入口,
// 待三行全部待核对后置 __SHOT_READY, 供无头 Chromium 截圖。
if (new URLSearchParams(location.search).has('shot')) {
  (async () => {
    const wait = async (fn: () => boolean, label: string) => {
      const t0 = Date.now();
      while (!fn()) {
        if (Date.now() - t0 > 25000) throw new Error('shot timeout: ' + label);
        await new Promise((r) => setTimeout(r, 120));
      }
    };
    await wait(() => !!document.querySelector('[data-testid="ocr-batch-file"]'), 'batch input');
    const mk = async (url: string, name: string) => {
      const blob = await (await fetch(url)).blob();
      return new File([blob], name, { type: 'image/png' });
    };
    const files = [
      await mk('./fixtures/full.png', 'full-a.png'),
      await mk('./fixtures/full.png', 'full-b.png'),
      await mk('./fixtures/crop.png', 'crop-a.png'),
    ];
    const input = document.querySelector('[data-testid="ocr-batch-file"]') as HTMLInputElement;
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    Object.defineProperty(input, 'files', { value: dt.files, configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(() => document.querySelectorAll('[data-testid="ocr-batch-row"]').length === 3, 'three rows');
    await wait(() => [...document.querySelectorAll('[data-testid="ocr-batch-row"]')]
      .every((r) => (r.textContent || '').includes((window as any).__READY_TEXT || '##ready##')), 'rows ready');
    (window as any).__SHOT_READY = true;
  })().catch((e) => { (window as any).__SHOT_ERROR = String(e && e.message || e); });
}
