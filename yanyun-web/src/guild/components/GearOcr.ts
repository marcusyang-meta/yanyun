// 截图 OCR 导入 — 引擎与原站同一: tesseract.js 5.0.5 (chi_sim+eng, 两遍识别:
// 原图 + 增强图 PSM 6), 图像全程不出浏览器。文本解析流程逐段对照原站移植
// (ocrClean / 候选词条表 / ocrFindHits / 段匹配 / 定音解析 / 部位识别 /
// parseOcrData 多路合并 / ocrPrepare+ocrEnhance 预处理)。名称→键映射表由后端下发。
import Tesseract from 'tesseract.js';
import type { GearLine, GearDingyin } from './gearStore.ts';

export type OcrMaps = {
  pasteNames: Array<{ name: string; key: string }>;
  nameToClass: Array<{ name: string; cls: string }>;
  slotAliases: Array<{ name: string; key: string }>;
  ocrAliases: Array<{ name: string; key: string }>;
  dingyinLeft: Array<{ name: string; max: number }>;
  affixes: Array<{ key: string; name: string; max: number; cy: number }>;
  schoolTags: string[];
};

export type OcrParsed = {
  slot: string;
  lines: Array<{ key: string; val: number; conf?: number; seg?: string }>;
  dingyin: GearDingyin;
  unknowns: string[];
  schools: string[];
  name?: string;
  candidates?: number;
};

const OCR_CONF_MIN = 60;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function ocrClean(text: string): string {
  return String(text || '')
    .replace(/[|｜]/g, '1')
    .replace(/[Oo](?=\d)/g, '0')
    .replace(/％/g, '%')
    .replace(/[，,]/g, '.')
    .replace(/[：∶]/g, ':')
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ');
}

function ocrKeyVariants(maps: OcrMaps): Array<{ name: string; key: string; cls: string }> {
  const byKey = new Map<string, string>();
  maps.affixes.forEach((a) => byKey.set(a.key, a.name));
  const classOf = new Map(maps.nameToClass.map((r) => [r.name, r.cls]));
  const seen = new Map<string, { name: string; key: string; cls: string }>();
  const add = (name: string | null | undefined, key: string) => {
    if (!name || !key) return;
    const canon = byKey.get(key) || name;
    const cls = classOf.get(canon) || '';
    const variants = [name];
    if (canon !== name) variants.push(canon);
    const base = canon.replace(/^(最大|最小)/, '');
    if (base !== canon) variants.push(base);
    variants.forEach((v) => { if (v && !seen.has(v)) seen.set(v, { name: v, key, cls }); });
  };
  maps.pasteNames.forEach((r) => add(r.name, r.key));
  maps.ocrAliases.forEach((r) => add(r.name, r.key));
  maps.affixes.forEach((a) => add(a.name, a.key));
  return [...seen.values()].sort((a, b) => b.name.length - a.name.length);
}

/* 与原站一致的 OCR 文本归一化: ocrClean 后转小写并剔除全部空白
 * (tesseract 对中文常逐字加空格输出, 不剔除空白则词条名子串匹配全灭) */
function ocrNorm(raw: string): string {
  return ocrClean(raw).toLowerCase().replace(/\s+/g, '');
}

function ocrFindHits(txt: string, variants: Array<{ name: string; key: string; cls: string }>): Array<{ key: string; cls: string; idx: number; len: number; name: string }> {
  const hits: Array<{ key: string; cls: string; idx: number; len: number; name: string }> = [];
  for (const v of variants) {
    const nn = v.name.toLowerCase().replace(/\s+/g, '');
    if (!nn) continue;
    let from = 0;
    for (;;) {
      const i = txt.indexOf(nn, from);
      if (i < 0) break;
      const dup = hits.some((h) => (i >= h.idx && i < h.idx + h.len) || (h.idx >= i && h.idx < i + nn.length));
      if (!dup) hits.push({ key: v.key, cls: v.cls, idx: i, len: nn.length, name: v.name });
      from = i + nn.length;
    }
  }
  hits.sort((a, b) => a.idx - b.idx);
  return hits;
}

const OCR_NUM = '(\\d+(?:\\.\\d+)?)';

function matchOcrSegments(
  raw: string,
  maps: OcrMaps,
): { lines: Array<{ key: string; val: number; seg: string }>; dingyin: GearDingyin } {
  const txt = ocrNorm(raw);
  const variants = ocrKeyVariants(maps);
  const hits = ocrFindHits(txt, variants);
  const lines: Array<{ key: string; val: number; seg: string }> = [];
  hits.forEach((h, i) => {
    const segEnd = i + 1 < hits.length ? hits[i + 1].idx : txt.length;
    const seg = txt.slice(h.idx + h.len, Math.min(segEnd, h.idx + h.len + 30));
    const nums = [...seg.matchAll(new RegExp(OCR_NUM, 'g'))].map((m) => parseFloat(m[1]));
    if (!nums.length) return;
    const maxRef = maps.affixes.find((a) => a.key === h.key)?.max || 0;
    const sane = nums.filter((n) => n > 0 && (maxRef ? n <= maxRef * 1.6 : n <= 10000));
    if (!sane.length) return;
    const val = maxRef ? Math.min(sane[0], maxRef) : sane[0];
    const dup = lines.find((l) => l.key === h.key);
    if (dup) { if (val > dup.val) { dup.val = val; dup.seg = seg; } return; }
    lines.push({ key: h.key, val, seg });
  });
  return { lines: lines.slice(0, 8), dingyin: parseDingyinText(raw, maps) };
}

function parseDingyinText(raw: string, maps: OcrMaps): GearDingyin {
  const leftMax = new Map(maps.dingyinLeft.map((r) => [r.name, r.max]));
  const canonOf = (name: string): string | null => {
    if (leftMax.has(name)) return name;
    for (const [k] of leftMax) if (name.includes(k) || k.includes(name)) return k;
    if (/穿透/.test(name)) return '外功穿透';
    if (/抗性/.test(name)) return '外功抗性';
    return null;
  };
  const stripped = ocrClean(String(raw || '')).replace(/\s+/g, '');
  let m = stripped.match(/定音[:：]?(.{2,14})/);
  if (m) {
    const nameM = m[1].match(/^[\u4e00-\u9fa5A-Za-z·]+/);
    const valM = m[1].match(new RegExp(OCR_NUM));
    if (nameM) {
      const canon = canonOf(nameM[0]);
      if (canon) {
        const mx = leftMax.get(canon) || 0;
        return { name: canon, val: Math.min(valM ? parseFloat(valM[1]) : mx, mx) || mx };
      }
    }
  }
  m = stripped.match(/([\u4e00-\u9fa5]{2,6}(?:穿透|抗性))[^0-9]{0,6}(\d+(?:\.\d+)?)/);
  if (m) {
    const canon = canonOf(m[1]);
    if (canon) {
      const mx = leftMax.get(canon) || 0;
      return { name: canon, val: Math.min(parseFloat(m[2]), mx) || mx };
    }
  }
  return null;
}

function ocrDetectSlot(raw: string, maps: OcrMaps): string {
  const t = ocrNorm(raw);
  for (const a of maps.slotAliases) {
    if (t.includes(a.name.toLowerCase().replace(/\s+/g, ''))) return a.key;
  }
  return '';
}

export function parseOcrData(data: { text?: string; words?: Array<{ text: string; confidence: number; bbox?: { x0: number; y0: number } }> } | null, maps: OcrMaps): OcrParsed {
  const raw = (data && data.text) || '';
  const words = (data && data.words) || [];
  const seg = matchOcrSegments(raw, maps);
  const lowConf: Record<string, string> = {};
  if (words.length) {
    // 置信度按词条键收集 (finalizeOcr 据此打低置信标记)
    const merged: Array<{ key: string; val: number; conf?: number; seg?: string }> = [];
    const norm = ocrNorm(raw);
    for (const l of seg.lines) {
      let conf: number | undefined;
      const hits = ocrFindHits(norm, ocrKeyVariants(maps)).filter((h) => h.key === l.key);
      if (hits.length) {
        const hitTxt = norm.slice(hits[0].idx, hits[0].idx + hits[0].len);
        const w = words.find((x) => {
          const wt = ocrClean(x.text).toLowerCase().replace(/\s+/g, '');
          return wt && (wt.includes(hitTxt) || hitTxt.includes(wt));
        });
        if (w && typeof w.confidence === 'number') conf = Math.round(w.confidence);
      }
      merged.push({ ...l, conf });
    }
    merged.forEach((l) => { if (l.conf != null && l.conf < OCR_CONF_MIN) lowConf[l.key] = 'lowConf'; });
    return finalizeOcr({ slot: ocrDetectSlot(raw, maps), lines: merged, dingyin: seg.dingyin, unknowns: [], schools: [] }, raw, maps, lowConf);
  }
  return finalizeOcr({ slot: ocrDetectSlot(raw, maps), lines: seg.lines, dingyin: seg.dingyin, unknowns: [], schools: [] }, raw, maps, lowConf);
}

function finalizeOcr(parsed: OcrParsed, raw: string, maps: OcrMaps, lowConf: Record<string, string>): OcrParsed {
  const txt = ocrNorm(raw);
  parsed.schools = (maps.schoolTags || []).filter((tag) => tag && txt.includes(tag));
  const classOf = new Map(maps.nameToClass.map((r) => [r.name, r.cls]));
  const affixByKey = new Map(maps.affixes.map((a) => [a.key, a]));
  parsed.lines.forEach((l) => {
    const a = affixByKey.get(l.key);
    if (a && classOf.get(a.name) === 'shu') {
      const rest = txt.replace(new RegExp(escapeRegExp(a.name), 'g'), ' ');
      const nearShu = /无相|鸣金|牵丝|裂石|破竹/.test(rest) ? rest.match(/(无相|鸣金|牵丝|裂石|破竹)/)?.[1] : null;
      // 属攻行备注: 保留原键 (无相/本系由服务端面板计算处理)
      void nearShu;
    }
    if (lowConf[l.key]) l.seg = (l.seg || '') + ' · lowConf';
  });
  parsed.unknowns = [];
  return parsed;
}

function mergeOcrParsed(list: OcrParsed[]): OcrParsed {
  const best = new Map<string, { key: string; val: number; conf?: number; seg?: string }>();
  let slot = '', dingyin: GearDingyin = null, name: string | undefined;
  const unknowns = new Set<string>();
  for (const p of list) {
    if (!slot && p.slot) slot = p.slot;
    if (!dingyin && p.dingyin) dingyin = p.dingyin;
    if (!name && p.name) name = p.name;
    (p.unknowns || []).forEach((u) => unknowns.add(u));
    (p.lines || []).forEach((l) => {
      const cur = best.get(l.key);
      if (!cur || (l.conf ?? 0) > (cur.conf ?? 0) || l.val > cur.val) best.set(l.key, l);
    });
  }
  return {
    slot, lines: [...best.values()].slice(0, 8), dingyin,
    unknowns: [...unknowns], schools: [], name, candidates: list.length,
  };
}

/* ---------------- 图像预处理 + 识别 ---------------- */

async function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export function ocrPrepare(file: Blob): Promise<Blob> {
  return (async () => {
    const img = await blobToImage(file);
    const scale = Math.min(2, Math.max(1, 1600 / Math.max(1, img.naturalWidth)));
    const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const cx = cv.getContext('2d')!;
    cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h);
    cx.drawImage(img, 0, 0, w, h);
    return new Promise<Blob>((resolve, reject) => cv.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas'))), 'image/png'));
  })();
}

export function ocrEnhance(file: Blob): Promise<Blob> {
  return (async () => {
    const img = await blobToImage(file);
    const scale = Math.min(2.5, Math.max(1.4, 2000 / Math.max(1, img.naturalWidth)));
    const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const cx = cv.getContext('2d')!;
    cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h);
    cx.drawImage(img, 0, 0, w, h);
    const id = cx.getImageData(0, 0, w, h), d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      let v = (g - 128) * 1.6 + 128;
      v = v < 110 ? 0 : v > 190 ? 255 : v;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    cx.putImageData(id, 0, 0);
    return new Promise<Blob>((resolve, reject) => cv.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas'))), 'image/png'));
  })();
}

export type OcrRunResult = { parsed: OcrParsed; text: string };

export async function runOcr(file: File | Blob, maps: OcrMaps, onStatus?: (s: string) => void): Promise<OcrRunResult> {
  const worker = await Tesseract.createWorker('chi_sim+eng');
  try {
    const results: Array<{ data: { text?: string; words?: Array<{ text: string; confidence: number }> } }> = [];
    const raws: string[] = [];
    const feeds: Array<{ blob: Blob; psm: string | null }> = [
      { blob: await ocrPrepare(file), psm: null },
      { blob: await ocrEnhance(file), psm: '6' },
    ];
    for (let i = 0; i < feeds.length; i++) {
      onStatus?.(String(i + 1));
      if (feeds[i].psm) await worker.setParameters({ tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK });
      const r = await worker.recognize(feeds[i].blob, {}, { blocks: true } as never);
      results.push(r as never);
      raws.push((r.data && r.data.text) || '');
    }
    const parsedList = results.map((r) => parseOcrData(r.data as never, maps));
    const parsed = mergeOcrParsed(parsedList);
    return { parsed, text: raws.join('\n') };
  } finally {
    await worker.terminate().catch(() => undefined);
  }
}

export type { GearLine };

/* ---------------- 全屏截图面板定位 (自动框选) ----------------
 * 快定位遍: 图缩到长边 <=1200 后跑一遍 tesseract 取词框, 用词条名/部位名/
 * 定音等锚点词找文本簇, 按行高启发式外扩成面板框 (原图坐标)。锚点不足
 * 或框几乎覆盖整图时返回 null — 调用方按整图走原有两遍识别, 与旧行为
 * 完全一致 (预裁好的面板图不受影响)。computePanelBox 是纯函数 (词框进、
 * 面板框出), 与引擎解耦可单测。 */
export type PanelBox = { x: number; y: number; w: number; h: number };
export type OcrWordBox = {
  text: string; confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
};

function anchorVocabulary(maps: OcrMaps): Array<{ name: string; key: string }> {
  const out: Array<{ name: string; key: string }> = [];
  const seen = new Set<string>();
  const add = (name: string, key: string) => {
    const n = (name || '').replace(/\s+/g, '');
    if (n.length < 2 || seen.has(n + '|' + key)) return;
    seen.add(n + '|' + key);
    out.push({ name: n, key });
  };
  ocrKeyVariants(maps).forEach((v) => add(v.name, v.key));
  maps.slotAliases.forEach((a) => add(a.name, 'slot:' + a.key));
  add('定音', 'dingyin');
  return out.sort((a, b) => b.name.length - a.name.length);
}

type WordIn = { text: string; bbox?: { x0: number; y0: number; x1: number; y1: number } };

/* 词框按行分组: tesseract 对中文常逐字/逐词组切分, 单词框里没有完整词条名,
 * 必须先按 y 聚成文本行、拼出行文本再匹配锚点。命中行的框只取锚点词附近的
 * 连续词段 (词间距 < 2.2 倍行高), 避免同行远处 HUD 文字把框拉长。 */
function groupWordLines(words: WordIn[]): Array<{ text: string; words: WordIn[]; x0: number; y0: number; x1: number; y1: number }> {
  const ws = words
    .filter((w) => w.bbox && ocrClean(w.text || '').trim())
    .sort((a, b) => (a.bbox!.y0 + a.bbox!.y1) - (b.bbox!.y0 + b.bbox!.y1));
  const lines: Array<{ words: WordIn[] }> = [];
  for (const w of ws) {
    const cy = (w.bbox!.y0 + w.bbox!.y1) / 2;
    const wh = Math.max(6, w.bbox!.y1 - w.bbox!.y0);
    const cur = lines[lines.length - 1];
    if (cur) {
      const f = cur.words[0].bbox!;
      const lcy = (f.y0 + f.y1) / 2, lh = Math.max(6, f.y1 - f.y0);
      if (Math.abs(cy - lcy) <= 0.55 * Math.max(wh, lh)) { cur.words.push(w); continue; }
    }
    lines.push({ words: [w] });
  }
  return lines.map((l) => {
    const sorted = [...l.words].sort((a, b) => a.bbox!.x0 - b.bbox!.x0);
    return {
      text: sorted.map((w) => ocrClean(w.text || '').replace(/\s+/g, '')).join(''),
      words: sorted,
      x0: Math.min(...sorted.map((w) => w.bbox!.x0)),
      y0: Math.min(...sorted.map((w) => w.bbox!.y0)),
      x1: Math.max(...sorted.map((w) => w.bbox!.x1)),
      y1: Math.max(...sorted.map((w) => w.bbox!.y1)),
    };
  });
}

export function computePanelBox(
  words: WordIn[],
  imgW: number, imgH: number, maps: OcrMaps,
): PanelBox | null {
  if (!words.length || imgW <= 0 || imgH <= 0) return null;
  const vocab = anchorVocabulary(maps);
  const hits: Array<{ key: string; x0: number; y0: number; x1: number; y1: number }> = [];
  for (const line of groupWordLines(words)) {
    let matched: { key: string; name: string; at: number } | null = null;
    for (const v of vocab) {
      const at = line.text.indexOf(v.name);
      if (at >= 0) { matched = { key: v.key, name: v.name, at }; break; }
    }
    if (!matched) continue;
    // 命中段: 锚点名在行文本中的字符区间对应的词为核心, 再向两侧吞并
    // 间距不大的相邻词 (同行的数值等); 远处同行词 (HUD) 间距大, 不并入。
    const lineH = Math.max(6, line.y1 - line.y0);
    const end = matched.at + matched.name.length;
    let lo = -1, hi = -1, pos = 0;
    line.words.forEach((w, i) => {
      const len = ocrClean(w.text || '').replace(/\s+/g, '').length;
      if (pos + len > matched!.at && pos < end) { if (lo < 0) lo = i; hi = i; }
      pos += len;
    });
    if (lo < 0) { lo = 0; hi = line.words.length - 1; }
    while (lo > 0) {
      const gap = line.words[lo].bbox!.x0 - line.words[lo - 1].bbox!.x1;
      if (gap < lineH * 2.2) lo--; else break;
    }
    while (hi < line.words.length - 1) {
      const gap = line.words[hi + 1].bbox!.x0 - line.words[hi].bbox!.x1;
      if (gap < lineH * 2.2) hi++; else break;
    }
    // 数值词无条件吞并: 面板数值右对齐, 与词条名间距远大于字距,
    // 但同行尾部的纯数值词几乎必然是该行的值 (行尾定音数值同理)。
    while (hi < line.words.length - 1) {
      const nt = ocrClean(line.words[hi + 1].text || '').replace(/\s+/g, '');
      if (/^[\d.,:%‰+-]+$/.test(nt)) hi++; else break;
    }
    while (lo > 0) {
      const pt = ocrClean(line.words[lo - 1].text || '').replace(/\s+/g, '');
      if (/^[\d.,:%‰+-]+$/.test(pt)) lo--; else break;
    }
    const seg = line.words.slice(lo, hi + 1);
    hits.push({
      key: matched.key,
      x0: Math.min(...seg.map((w) => w.bbox!.x0)),
      y0: line.y0,
      x1: Math.max(...seg.map((w) => w.bbox!.x1)),
      y1: line.y1,
    });
  }
  const affixKeys = new Set(hits.filter((h) => !h.key.startsWith('slot:') && h.key !== 'dingyin').map((h) => h.key));
  const hasSlot = hits.some((h) => h.key.startsWith('slot:'));
  if (affixKeys.size < 3 && !(affixKeys.size >= 2 && hasSlot)) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const heights: number[] = [];
  for (const h of hits) {
    x0 = Math.min(x0, h.x0); y0 = Math.min(y0, h.y0);
    x1 = Math.max(x1, h.x1); y1 = Math.max(y1, h.y1);
    heights.push(Math.max(6, h.y1 - h.y0));
  }
  heights.sort((a, b) => a - b);
  const mh = heights[Math.floor(heights.length / 2)] || 20;
  const bx = Math.max(0, Math.round(x0 - (mh * 1.4 + 10)));
  const by = Math.max(0, Math.round(y0 - mh * 3.4));
  const bx1 = Math.min(imgW, Math.round(x1 + (mh * 1.4 + 10)));
  const by1 = Math.min(imgH, Math.round(y1 + mh * 2.6));
  const bw = bx1 - bx, bh = by1 - by;
  if (bw < 60 || bh < 60) return null;
  if (bw * bh > 0.92 * imgW * imgH) return null; // 锚点铺满整图 = 没有可定位的局部面板
  return { x: bx, y: by, w: bw, h: bh };
}

async function locatePanelImage(
  file: Blob, maps: OcrMaps,
): Promise<{ box: PanelBox | null; width: number; height: number }> {
  const img = await blobToImage(file);
  const ow = img.naturalWidth, oh = img.naturalHeight;
  if (!ow || !oh) return { box: null, width: 0, height: 0 };
  const scale = Math.min(1, 1200 / Math.max(ow, oh));
  const sw = Math.max(1, Math.round(ow * scale)), sh = Math.max(1, Math.round(oh * scale));
  const cv = document.createElement('canvas'); cv.width = sw; cv.height = sh;
  const cx = cv.getContext('2d')!;
  cx.fillStyle = '#fff'; cx.fillRect(0, 0, sw, sh);
  cx.drawImage(img, 0, 0, sw, sh);
  const small = await new Promise<Blob>((resolve, reject) => cv.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas'))), 'image/png'));
  const worker = await Tesseract.createWorker('chi_sim+eng');
  try {
    const r = await worker.recognize(small, {}, { blocks: true } as never);
    const words = ((r.data as { words?: OcrWordBox[] }).words || []) as OcrWordBox[];
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
    await worker.terminate().catch(() => undefined);
  }
}

export async function cropImageBlob(file: Blob, box: PanelBox): Promise<Blob> {
  const img = await blobToImage(file);
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.round(box.w)); cv.height = Math.max(1, Math.round(box.h));
  const cx = cv.getContext('2d')!;
  cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
  cx.drawImage(img, box.x, box.y, box.w, box.h, 0, 0, cv.width, cv.height);
  return new Promise<Blob>((resolve, reject) => cv.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas'))), 'image/png'));
}

async function imageSize(file: Blob): Promise<{ width: number; height: number }> {
  const img = await blobToImage(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

/* ---------------- 批量识别引擎 (定位 + 两遍识别; 可注入替身供验收) -------- */
export type OcrEngineResult = {
  parsed: OcrParsed; text: string;
  box: PanelBox | null; width: number; height: number;
};
export interface OcrEngine {
  process(file: Blob, maps: OcrMaps, onStatus?: (s: string) => void): Promise<OcrEngineResult>;
  rerunBox(file: Blob, box: PanelBox, maps: OcrMaps, onStatus?: (s: string) => void): Promise<OcrEngineResult>;
}

export const defaultOcrEngine: OcrEngine = {
  async process(file, maps, onStatus) {
    const loc = await locatePanelImage(file, maps);
    if (loc.box) {
      const crop = await cropImageBlob(file, loc.box);
      const r = await runOcr(crop, maps, onStatus);
      return { ...r, box: loc.box, width: loc.width, height: loc.height };
    }
    const r = await runOcr(file, maps, onStatus);
    return { ...r, box: null, width: loc.width, height: loc.height };
  },
  async rerunBox(file, box, maps, onStatus) {
    const size = await imageSize(file);
    const crop = await cropImageBlob(file, box);
    const r = await runOcr(crop, maps, onStatus);
    return { ...r, box, width: size.width, height: size.height };
  },
};

/* 装备内容指纹 (部位 + 词条键值 + 定音): 批量核对判重用 —
 * 与库内已有装备或本批其他行同指纹即判重复。 */
export function gearContentKey(
  slot: string,
  lines: Array<{ key: string; val: number }>,
  dingyin: { name: string; val: number } | null,
): string {
  const s = slot === '主武器' || slot === '副武器' ? '武器' : slot;
  const ls = lines
    .filter((l) => l.key && Number.isFinite(l.val))
    .map((l) => `${l.key}=${Math.round(l.val * 10) / 10}`)
    .sort().join(',');
  const dy = dingyin && dingyin.name ? `${dingyin.name}=${Math.round(dingyin.val * 10) / 10}` : '';
  return `${s}|${ls}|${dy}`;
}
