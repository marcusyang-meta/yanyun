import { Platform } from 'react-native';
import {
  computePanelBox, mergeOcrParsed, parseOcrData,
  type OcrEngine, type OcrMaps, type OcrWordBox, type PanelBox,
} from './GearOcr';

// 识别引擎层 (与 Web GearOcr.ts 的引擎部分同构: 定位遍 → 裁剪 → 两遍
// 识别 (原图预处理 + 增强图 PSM6) → parseOcrData 多路合并)。
//
// 识别器 (recognizer) 可插拔, 因为运行环境差异真实存在:
// - Expo Web: tesseract.js 是纯 JS/WASM 引擎, 识别全程在本机浏览器内
//   (图片不出设备)。本包未装 tesseract.js 依赖 (待批准), 现以脚本标签
//   从 CDN 载入同一版本 (5.1.1, 与 Web 端 node_modules 内一致) 作为
//   过渡识别器; 装上包后把 loadCdnTesseract 换成 import 即可, 其余不动。
// - 原生 (iOS/Android): tesseract.js 依赖 Web Worker + WASM, 在 Hermes
//   里跑不了; 原生侧正解是 ML Kit on-device 文本识别 (原生模块, 需
//   dev build, 不在 Expo Go 内)。未接入前本层如实抛 NoEngine, UI 显示
//   后端 gearOcrNoEngineText 文案, 不假装能识别、更不把图片发云端。
// - 验收桩: EXPO_PUBLIC_OCR_STUB=1 时用确定性桩识别器 (返回固定的原始
//   OCR 文本+词框), 让定位/解析/批量核对全链路可在 Expo Web 里实拍
//   验证 (与 Web 端 UI harness 注入替身引擎同一手法); 默认关闭。

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

/* ---------------- CDN tesseract 识别器 (仅 Web) ---------------- */
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

/* ---------------- 验收桩识别器 (默认关闭) ---------------- */
// 固定的原始识别输出 (一段真实形态的装备面板文本 + 对应词框): 桩只
// 替代「识别」这一步, 定位/解析/判重/核对全走真实代码路径。
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
      async terminate() { /* 无资源 */ },
    };
  },
};

export function activeRecognizer(): OcrRecognizer {
  if (process.env.EXPO_PUBLIC_OCR_STUB === '1') return stubRecognizer;
  return cdnTesseractRecognizer;
}

/* ---------------- 图像工具 (Web canvas; 与 Web GearOcr 同算法) ---------------- */
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

/* ---------------- 两遍识别 (Web runOcr 同流程) ---------------- */
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

/* 单图识别 (Web GearLibrary 单图 OCR 的 runOcr 入口同义: 两遍识别不定位) */
export async function runOcrFile(
  file: Blob, maps: OcrMaps, onStatus?: (s: string) => void,
): Promise<{ parsed: ReturnType<typeof parseOcrData>; text: string }> {
  return runOcr(activeRecognizer(), file, maps, onStatus);
}

/* ---------------- 默认引擎 (定位 + 两遍识别; 与 Web defaultOcrEngine 同构) -------- */
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

/* ---------------- 文件选择 / 导出 (平台适配) ---------------- */
// 图片选择: Web 走 DOM 文件框 (多选); 原生需 expo-image-picker (原生
// 模块, 未装) —— 返回 null, 调用方据此提示无引擎/不可用, 不假装。
export function pickImageFiles(multiple: boolean): Promise<File[] | null> {
  if (!isWeb) return Promise.resolve(null);
  return pickFilesViaDom({ accept: 'image/*', multiple });
}

// 文本/JSON 文件选择 (装备库导入): Web 走 DOM; 原生同上返回 null。
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
    // 用户取消时 change 不触发: 用窗口重新聚焦兜底判空 (延迟一拍让 change 先行)
    const onFocus = () => {
      setTimeout(() => { if (!input.files || !input.files.length) done(null); }, 400);
      (globalThis as any).removeEventListener?.('focus', onFocus);
    };
    (globalThis as any).addEventListener?.('focus', onFocus);
    doc.body.appendChild(input);
    input.click();
  });
}

// 导出: Web 走 Blob 下载 (与 Web 版同); 原生走系统分享文本 (RN Share)。
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
