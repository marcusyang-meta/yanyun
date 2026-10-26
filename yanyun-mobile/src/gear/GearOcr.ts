// Screenshot OCR text parsing -- ported section-by-section from Web
// GearOcr.ts (ocrClean / candidate affix table / ocrFindHits / segment
// matching / dingyin parsing / slot detection / parseOcrData multi-path
// merge / computePanelBox panel location / gearContentKey fingerprint).
// The engine itself lives in GearOcrEngine.ts: this module handles only
// text and word boxes, decoupled from the engine. Name->key maps are
// supplied by the backend (OcrMaps); this file holds no game data tables.
import type { GearDingyin, GearLine } from './gearStore';

export type OcrMaps = {
  pasteNames: { name: string; key: string }[];
  nameToClass: { name: string; cls: string }[];
  slotAliases: { name: string; key: string }[];
  ocrAliases: { name: string; key: string }[];
  dingyinLeft: { name: string; max: number }[];
  affixes: { key: string; name: string; max: number; cy: number }[];
  schoolTags: string[];
};

export type OcrParsed = {
  slot: string;
  lines: { key: string; val: number; conf?: number; seg?: string }[];
  dingyin: GearDingyin;
  unknowns: string[];
  schools: string[];
  name?: string;
  candidates?: number;
};

const OCR_CONF_MIN = 60;

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

function ocrKeyVariants(maps: OcrMaps): { name: string; key: string; cls: string }[] {
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

/* OCR text normalization (same as Web): lowercase after ocrClean and strip all whitespace */
function ocrNorm(raw: string): string {
  return ocrClean(raw).toLowerCase().replace(/\s+/g, '');
}

function ocrFindHits(txt: string, variants: { name: string; key: string; cls: string }[]): { key: string; cls: string; idx: number; len: number; name: string }[] {
  const hits: { key: string; cls: string; idx: number; len: number; name: string }[] = [];
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
): { lines: { key: string; val: number; seg: string }[]; dingyin: GearDingyin } {
  const txt = ocrNorm(raw);
  const variants = ocrKeyVariants(maps);
  const hits = ocrFindHits(txt, variants);
  const lines: { key: string; val: number; seg: string }[] = [];
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

export type OcrWordIn = { text: string; confidence?: number; bbox?: { x0: number; y0: number; x1?: number; y1?: number } };

export function parseOcrData(data: { text?: string; words?: OcrWordIn[] } | null, maps: OcrMaps): OcrParsed {
  const raw = (data && data.text) || '';
  const words = (data && data.words) || [];
  const seg = matchOcrSegments(raw, maps);
  const lowConf: Record<string, string> = {};
  if (words.length) {
    const merged: { key: string; val: number; conf?: number; seg?: string }[] = [];
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
  parsed.lines.forEach((l) => {
    if (lowConf[l.key]) l.seg = (l.seg || '') + ' · lowConf';
  });
  parsed.unknowns = [];
  return parsed;
}

export function mergeOcrParsed(list: OcrParsed[]): OcrParsed {
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

/* Full-screen panel location (auto box; same algorithm as Web computePanelBox) */
export type PanelBox = { x: number; y: number; w: number; h: number };
export type OcrWordBox = {
  text: string; confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
};

function anchorVocabulary(maps: OcrMaps): { name: string; key: string }[] {
  const out: { name: string; key: string }[] = [];
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

function groupWordLines(words: WordIn[]): { text: string; words: WordIn[]; x0: number; y0: number; x1: number; y1: number }[] {
  const ws = words
    .filter((w) => w.bbox && ocrClean(w.text || '').trim())
    .sort((a, b) => (a.bbox!.y0 + a.bbox!.y1) - (b.bbox!.y0 + b.bbox!.y1));
  const lines: { words: WordIn[] }[] = [];
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
  const hits: { key: string; x0: number; y0: number; x1: number; y1: number }[] = [];
  for (const line of groupWordLines(words)) {
    let matched: { key: string; name: string; at: number } | null = null;
    for (const v of vocab) {
      const at = line.text.indexOf(v.name);
      if (at >= 0) { matched = { key: v.key, name: v.name, at }; break; }
    }
    if (!matched) continue;
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
  if (bw * bh > 0.92 * imgW * imgH) return null;
  return { x: bx, y: by, w: bw, h: bh };
}

/* Batch-recognition engine interface (same as Web; implementation in GearOcrEngine.ts) */
export type OcrEngineResult = {
  parsed: OcrParsed; text: string;
  box: PanelBox | null; width: number; height: number;
};
export interface OcrEngine {
  process(file: Blob, maps: OcrMaps, onStatus?: (s: string) => void): Promise<OcrEngineResult>;
  rerunBox(file: Blob, box: PanelBox, maps: OcrMaps, onStatus?: (s: string) => void): Promise<OcrEngineResult>;
}

/* Gear content fingerprint (slot + affix key/values + dingyin): used for batch dedupe (same as Web) */
export function gearContentKey(
  slot: string,
  lines: { key: string; val: number }[],
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

export type { GearLine };
