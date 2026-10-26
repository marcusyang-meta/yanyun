import { Platform } from 'react-native';
import {
  computePanelBox, mergeOcrParsed, parseOcrData,
  type OcrEngine, type OcrMaps, type OcrWordBox, type PanelBox,
} from './GearOcr';

// Recognition engine layer (mirrors the engine part of Web GearOcr.ts:
// locate pass -> crop -> two recognition passes (preprocessed original +
// enhanced image, PSM6) -> parseOcrData multi-path merge).
//
// The recognizer is pluggable because runtimes genuinely differ:
// - Expo Web: tesseract.js is a pure JS/WASM engine and recognition runs
//   entirely in the local browser (images never leave the device). The
//   package isn't installed yet (pending approval), so the same version
//   (5.1.1, matching Web's node_modules) is loaded from CDN via a script
//   tag as a stopgap; once installed, swap loadCdnTesseract for an import.
// - Native (iOS/Android): tesseract.js needs Web Worker + WASM and cannot
//   run on Hermes; the right answer is ML Kit on-device recognition (a
//   native module needing a dev build, not in Expo Go). Until wired, this
//   layer honestly throws NoEngine and the UI shows the backend
//   gearOcrNoEngineText copy -- it never fakes recognition or uploads images.
// - Verification stub: with EXPO_PUBLIC_OCR_STUB=1 a deterministic stub
//   recognizer (fixed raw OCR text + word boxes) lets the locate/parse/
//   review pipeline be exercised end-to-end in Expo Web (same technique as
//   Web's UI harness stub engine); off by default.

export class OcrNoEngineError extends Error {
  constructor() {
    super('ocr-engine-unavailable');
    this.name = 'OcrNoEngineError';
  }
}

type RawOcrData = {
  text?: string;
  words?: { text: string; confidence: number; bbox?: { x0: number; y0: number; x1: number; y1: number } }[];
};

export interface OcrSession {
  recognize(blob: Blob, opts: { psm6?: boolean }): Promise<RawOcrData>;
  terminate(): Promise<void>;
}
export interface OcrRecognizer {
  createSession(): Promise<OcrSession>;
}

/* CDN tesseract recognizer (Web only) */
const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
let tesseractPromise: Promise<any> | null = null;

function loadCdnTesseract(): Promise<any> {
  if (Platform.OS !== 'web') return Promise.reject(new OcrNoEngineError());
  const g = globalThis as any;
  if (g.Tesseract) return Promise.resolve(g.Tesseract);
  if (!tesseractPromise) {
    tesseractPromise = new Promise((resolve, reject) => {
      const doc = (globalThis as any).document;
      if (!doc) { reject(new OcrNoEngineError()); return; }
      const el = doc.createElement('script');
      el.src = TESSERACT_CDN;
      el.onload = () => {
        const T = (globalThis as any).Tesseract;
        if (T) resolve(T); else reject(new OcrNoEngineError());
      };
      el.onerror = () => reject(new OcrNoEngineError());
      doc.head.appendChild(el);
    });
  }
  return tesseractPromise;
}

const cdnTesseractRecognizer: OcrRecognizer = {
  async createSession() {
    const T = await loadCdnTesseract();
    const worker = await T.createWorker('chi_sim+eng');
    return {
      async recognize(blob, opts) {
        if (opts?.psm6) {
          await worker.setParameters({ tessedit_pageseg_mode: T.PSM.SINGLE_BLOCK });
        } else {
          await worker.setParameters({ tessedit_pageseg_mode: T.PSM.AUTO });
        }
        const r = await worker.recognize(blob, {}, { blocks: true });
        return r.data as RawOcrData;
      },
      async terminate() { await worker.terminate().catch(() => undefined); },
    };
  },
};

/* Stub recognizer for verification (off by default) */
// Fixed raw recognition output (realistic gear-panel text + word boxes):
// the stub replaces only the recognition step; locating, parsing, dedupe
// and review all run the real code paths.
const STUB_TEXT = [
  '环佩', '最大外攻 139.6', '会心 16.2%', '会意 8.1%', '精准 14.4%', '气血 5820',
  '定音: 外功穿透 12.5',
].join('\n');
const STUB_WORDS: OcrWordBox[] = (() => {
  const rows: [string, number][] = [
    ['环佩', 96], ['最大外攻', 94], ['139.6', 93], ['会心', 92], ['16.2%', 90],
    ['会意', 91], ['8.1%', 89], ['精准', 93], ['14.4%', 92], ['气血', 88], ['5820', 87],
    ['定音:', 90], ['外功穿透', 91], ['12.5', 90],
  ];
  const out: OcrWordBox[] = [];
  let y = 120;
  let x = 640;
  rows.forEach(([text, confidence], i) => {
    if (i > 0 && i % 2 === 0) { y += 44; x = 640; }
    const w = Math.max(34, text.length * 22);
    out.push({ text, confidence, bbox: { x0: x, y0: y, x1: x + w, y1: y + 26 } });
    x += w + 26;
  });
  return out;
})();

const stubRecognizer: OcrRecognizer = {
  async createSession() {
    return {
      async recognize() { return { text: STUB_TEXT, words: STUB_WORDS }; },
      async terminate() { /* Nothing to release */ },
    };
  },
};

export function activeRecognizer(): OcrRecognizer {
  if (process.env.EXPO_PUBLIC_OCR_STUB === '1') return stubRecognizer;
  return cdnTesseractRecognizer;
}

/* Image helpers (Web canvas; same algorithms as Web GearOcr) */
const isWeb = Platform.OS === 'web';

async function blobToImage(blob: Blob): Promise<any> {
  const g = globalThis as any;
  const url = g.URL.createObjectURL(blob);
  try {
    return await new Promise((resolve, reject) => {
      const img = new g.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  } finally {
    setTimeout(() => g.URL.revokeObjectURL(url), 5000);
  }
}

async function canvasBlob(draw: (cv: any, cx: any) => void, w: number, h: number): Promise<Blob> {
  const g = globalThis as any;
  const cv = g.document.createElement('canvas');
  cv.width = w; cv.height = h;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h);
  draw(cv, cx);
  return new Promise<Blob>((resolve, reject) => cv.toBlob((b: Blob | null) => (b ? resolve(b) : reject(new Error('canvas'))), 'image/png'));
}

export function ocrPrepare(file: Blob): Promise<Blob> {
  return (async () => {
    const img = await blobToImage(file);
    const scale = Math.min(2, Math.max(1, 1600 / Math.max(1, img.naturalWidth)));
    const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
    return canvasBlob((_cv, cx) => { cx.drawImage(img, 0, 0, w, h); }, w, h);
  })();
}

export function ocrEnhance(file: Blob): Promise<Blob> {
  return (async () => {
    const img = await blobToImage(file);
    const scale = Math.min(2.5, Math.max(1.4, 2000 / Math.max(1, img.naturalWidth)));
    const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
    return canvasBlob((_cv, cx) => {
      cx.drawImage(img, 0, 0, w, h);
      const id = cx.getImageData(0, 0, w, h), d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        let v = (gray - 128) * 1.6 + 128;
        v = v < 110 ? 0 : v > 190 ? 255 : v;
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
      }
      cx.putImageData(id, 0, 0);
    }, w, h);
  })();
}

export async function cropImageBlob(file: Blob, box: PanelBox): Promise<Blob> {
  const img = await blobToImage(file);
  const w = Math.max(1, Math.round(box.w)), h = Math.max(1, Math.round(box.h));
  return canvasBlob((_cv, cx) => {
    cx.drawImage(img, box.x, box.y, box.w, box.h, 0, 0, w, h);
  }, w, h);
}

async function imageSize(file: Blob): Promise<{ width: number; height: number }> {
  const img = await blobToImage(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

/* Two-pass recognition (same flow as Web runOcr) */
async function runOcr(
  recognizer: OcrRecognizer,
  file: Blob, maps: OcrMaps, onStatus?: (s: string) => void,
): Promise<{ parsed: ReturnType<typeof parseOcrData>; text: string }> {
  const session = await recognizer.createSession();
  try {
    const results: RawOcrData[] = [];
    const raws: string[] = [];
    const feeds: { blob: Blob; psm6: boolean }[] = isWeb
      ? [
        { blob: await ocrPrepare(file), psm6: false },
        { blob: await ocrEnhance(file), psm6: true },
      ]
      : [{ blob: file, psm6: false }, { blob: file, psm6: true }];
    for (let i = 0; i < feeds.length; i++) {
      onStatus?.(String(i + 1));
      const r = await session.recognize(feeds[i].blob, { psm6: feeds[i].psm6 });
      results.push(r);
      raws.push(r.text || '');
    }
    const parsedList = results.map((r) => parseOcrData(r as any, maps));
    const parsed = mergeOcrParsed(parsedList);
    return { parsed, text: raws.join('\n') };
  } finally {
    await session.terminate().catch(() => undefined);
  }
}

async function locatePanelImage(
  recognizer: OcrRecognizer,
  file: Blob, maps: OcrMaps,
): Promise<{ box: PanelBox | null; width: number; height: number }> {
  if (!isWeb) {
    const size = await imageSize(file).catch(() => ({ width: 0, height: 0 }));
    return { box: null, width: size.width, height: size.height };
  }
  const img = await blobToImage(file);
  const ow = img.naturalWidth, oh = img.naturalHeight;
  if (!ow || !oh) return { box: null, width: 0, height: 0 };
  const scale = Math.min(1, 1200 / Math.max(ow, oh));
  const sw = Math.max(1, Math.round(ow * scale)), sh = Math.max(1, Math.round(oh * scale));
  const small = await canvasBlob((_cv, cx) => { cx.drawImage(img, 0, 0, sw, sh); }, sw, sh);
  const session = await recognizer.createSession();
  try {
    const r = await session.recognize(small, {});
    const words = (r.words || []) as OcrWordBox[];
    const small0 = computePanelBox(words, sw, sh, maps);
    if (!small0) return { box: null, width: ow, height: oh };
    const inv = 1 / scale;
    const box: PanelBox = {
      x: Math.max(0, Math.round(small0.x * inv)),
      y: Math.max(0, Math.round(small0.y * inv)),
      w: Math.round(small0.w * inv),
      h: Math.round(small0.h * inv),
    };
    box.w = Math.min(box.w, ow - box.x); box.h = Math.min(box.h, oh - box.y);
    return { box, width: ow, height: oh };
  } finally {
    await session.terminate().catch(() => undefined);
  }
}

/* Single-image recognition (counterpart of the runOcr entry in Web GearLibrary: two passes, no locating) */
export async function runOcrFile(
  file: Blob, maps: OcrMaps, onStatus?: (s: string) => void,
): Promise<{ parsed: ReturnType<typeof parseOcrData>; text: string }> {
  return runOcr(activeRecognizer(), file, maps, onStatus);
}

/* Default engine (locate + two-pass; mirrors Web defaultOcrEngine) */
export function createDefaultOcrEngine(recognizer: OcrRecognizer = activeRecognizer()): OcrEngine {
  return {
    async process(file, maps, onStatus) {
      const loc = await locatePanelImage(recognizer, file, maps);
      if (loc.box && isWeb) {
        const crop = await cropImageBlob(file, loc.box);
        const r = await runOcr(recognizer, crop, maps, onStatus);
        return { ...r, box: loc.box, width: loc.width, height: loc.height };
      }
      const r = await runOcr(recognizer, file, maps, onStatus);
      return { ...r, box: null, width: loc.width, height: loc.height };
    },
    async rerunBox(file, box, maps, onStatus) {
      const size = isWeb ? await imageSize(file) : { width: 0, height: 0 };
      const crop = isWeb ? await cropImageBlob(file, box) : file;
      const r = await runOcr(recognizer, crop, maps, onStatus);
      return { ...r, box, width: size.width, height: size.height };
    },
  };
}

export const defaultOcrEngine: OcrEngine = createDefaultOcrEngine();

/* File picking / export (platform adaptation) */
// Image picking: Web uses a DOM file dialog (multi-select); native needs
// expo-image-picker (a native module, not installed) -- returns null and
// callers report no-engine/unavailable accordingly; never fake it.
export function pickImageFiles(multiple: boolean): Promise<File[] | null> {
  if (!isWeb) return Promise.resolve(null);
  return pickFilesViaDom({ accept: 'image/*', multiple });
}

// Text/JSON file picking (library import): Web uses DOM; native returns null as above.
export function pickTextFile(): Promise<{ name: string; text: string } | null> {
  if (!isWeb) return Promise.resolve(null);
  return pickFilesViaDom({ accept: '.json,application/json', multiple: false }).then(async (files) => {
    const f = files?.[0];
    if (!f) return null;
    return { name: f.name, text: await f.text() };
  });
}

function pickFilesViaDom(opts: { accept: string; multiple: boolean }): Promise<File[] | null> {
  return new Promise((resolve) => {
    const doc = (globalThis as any).document;
    if (!doc) { resolve(null); return; }
    const input = doc.createElement('input');
    input.type = 'file';
    input.accept = opts.accept;
    input.multiple = opts.multiple;
    input.style.display = 'none';
    let settled = false;
    const done = (v: File[] | null) => {
      if (settled) return;
      settled = true;
      try { input.remove(); } catch { /* noop */ }
      resolve(v);
    };
    input.onchange = () => {
      const files = input.files ? [...input.files] : [];
      done(files.length ? files : null);
    };
    // On cancel, change never fires: use window refocus as the fallback empty check (delayed one tick so change wins)
    const onFocus = () => {
      setTimeout(() => { if (!input.files || !input.files.length) done(null); }, 400);
      (globalThis as any).removeEventListener?.('focus', onFocus);
    };
    (globalThis as any).addEventListener?.('focus', onFocus);
    doc.body.appendChild(input);
    input.click();
  });
}

// Export: Web downloads a Blob (same as Web); native shares text via the system sheet (RN Share).
export async function exportTextFile(filename: string, text: string): Promise<boolean> {
  if (isWeb) {
    const g = globalThis as any;
    const blob = new Blob([text], { type: 'application/json' });
    const a = g.document.createElement('a');
    a.href = g.URL.createObjectURL(blob);
    a.download = filename;
    g.document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => g.URL.revokeObjectURL(a.href), 4000);
    return true;
  }
  try {
    const { Share } = await import('react-native');
    await Share.share({ message: text, title: filename });
    return true;
  } catch {
    return false;
  }
}

export function objectUrlForBlob(f: Blob): string {
  if (!isWeb) return '';
  try { return (globalThis as any).URL.createObjectURL(f); } catch { return ''; }
}

export function revokeObjectUrl(u: string): void {
  if (!isWeb || !u) return;
  try { (globalThis as any).URL.revokeObjectURL(u); } catch { /* noop */ }
}
