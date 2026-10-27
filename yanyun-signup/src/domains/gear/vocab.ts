/* Game-vocabulary single source of truth for the gear pages.
 *
 * Ruling (2026-10-27): the frontend holds NO display strings — UI copy
 * and game vocabulary alike are composed and delivered by the backend.
 * The closed vocabularies the gear/tiaolv pages used to hardcode
 * (tiaolv suit / bow / wuku choices, the Excel tuning-grid row labels,
 * the graduation slot and rate tables, the OCR recognition rules, the
 * weapon-slot pool rule) live here exactly once, are delivered through
 * the page shells as structured {id, label} data, and the frontend
 * works with the stable ids only.
 *
 * Key/label separation: the Chinese names remain the canonical data
 * values — they are what the tiaolv engine's tables are keyed by, what
 * stored gear rows carry, and what the game itself prints (OCR input).
 * Clients send ids; the calc resolvers translate id -> canonical name
 * at the boundary (legacy canonical names are still accepted, so older
 * clients keep working) and the engine itself is untouched, which
 * keeps every computed result bit-identical.
 */
import { GP_SLOTS, GP_GEAR_SLOTS, GP_SLOT_ALIAS, GP_DINGYIN_LEFT } from './gearplanner.ts';

export interface VocabOption { id: string; name: string; isDefault: boolean }

/* ---- Tiaolv （调律） closed vocabularies (Excel T2 / S2 / G9) ---- */

/* Excel suit names; the first entry is the "no suit" choice, whose
 * label is UI copy (tiaolv.none) and is composed by the shell. */
export const TL_SUIT_OPTIONS: VocabOption[] = [
  { id: 'none', name: '无', isDefault: false },
  { id: 'yuangui', name: '燕归', isDefault: false },
  { id: 'hantian', name: '撼天', isDefault: true },
  { id: 'lianxing', name: '连星', isDefault: false },
  { id: 'caiyun', name: '裁云', isDefault: false },
  { id: 'duanyue', name: '断岳', isDefault: false },
  { id: 'yudou', name: '玉斗', isDefault: false },
  { id: 'shiyu', name: '时雨', isDefault: false },
  { id: 'yanliu', name: '烟柳', isDefault: false },
  { id: 'huanhua', name: '浣花', isDefault: false },
  { id: 'feixun', name: '飞隼', isDefault: false },
];

/* Excel bow-skill names; 'none' = no bow skill (clients send null). */
export const TL_BOW_OPTIONS: VocabOption[] = [
  { id: 'none', name: '无', isDefault: true },
  { id: 'jingzhun', name: '精准', isDefault: false },
  { id: 'huixin', name: '会心', isDefault: false },
  { id: 'huiyi', name: '会意', isDefault: false },
];

/* Arsenal （武库） kinds; labels are UI copy (tiaolv.wukuSelf /
 * tiaolv.wukuCommon) composed by the shell. */
export const TL_WUKU_OPTIONS: VocabOption[] = [
  { id: 'self', name: '本系', isDefault: true },
  { id: 'common', name: '通用', isDefault: false },
];

/* Sect slug -> default martial-art name (Excel F14), used to prefill
 * the tiaolv tab when a sect page opens it. Mirrors the wuxue table in
 * tiaolv.ts; qiansi-lin has no entry (the old frontend map had none —
 * its wuxue field simply starts empty). */
export const TL_SECT_WUXUE: Array<{ sectSlug: string; wuxue: string }> = [
  { sectSlug: 'mingjin-hong', wuxue: '鸣金虹' },
  { sectSlug: 'mingjin-ying', wuxue: '鸣金影' },
  { sectSlug: 'lieshi-wei', wuxue: '裂石威' },
  { sectSlug: 'lieshi-jun', wuxue: '裂石钧' },
  { sectSlug: 'qiansi-yu', wuxue: '牵丝玉' },
  { sectSlug: 'qiansi-yi', wuxue: '牵丝翊' },
  { sectSlug: 'pozhu-zun', wuxue: '破竹樽' },
  { sectSlug: 'pozhu-yuan', wuxue: '破竹鸢' },
  { sectSlug: 'pozhu-chen', wuxue: '破竹尘' },
  { sectSlug: 'pozhu-feng', wuxue: '破竹风' },
];

/* Tuning-grid row labels: Excel row number -> attribute label
 * (K3:R5 main attributes, K6:R24 the rest). */
export const TL_TUNE_ROWS: Array<{ row: number; label: string }> = [
  { row: 3, label: '劲' }, { row: 4, label: '敏' }, { row: 5, label: '势' },
  { row: 6, label: '最小外攻' }, { row: 7, label: '最大外攻' }, { row: 8, label: '精准' },
  { row: 9, label: '会心' }, { row: 10, label: '会意' },
  { row: 11, label: '最小鸣金' }, { row: 12, label: '最大鸣金' },
  { row: 13, label: '最小裂石' }, { row: 14, label: '最大裂石' },
  { row: 15, label: '最小牵丝' }, { row: 16, label: '最大牵丝' },
  { row: 17, label: '最小破竹' }, { row: 18, label: '最大破竹' },
  { row: 19, label: '最小无相' }, { row: 20, label: '最大无相' },
  { row: 21, label: '武学增伤' }, { row: 22, label: '奇术增伤' },
  { row: 23, label: '首领增伤' }, { row: 24, label: '全武增伤' },
];

function nameOf(options: VocabOption[], idOrName: string | null | undefined): string {
  if (!idOrName) return '';
  const hit = options.find((o) => o.id === idOrName);
  return hit ? hit.name : String(idOrName);
}

/* Boundary translators: a vocab id becomes the canonical name the
 * engine is keyed by; anything else passes through untouched (legacy
 * clients send canonical names directly). */
export const tlSuitName = (v: string | null | undefined): string => nameOf(TL_SUIT_OPTIONS, v);
export const tlBowName = (v: string | null | undefined): string => nameOf(TL_BOW_OPTIONS, v);
export const tlWukuName = (v: string | null | undefined): string => nameOf(TL_WUKU_OPTIONS, v);

/* ---- Graduation calculator slot / rate tables ---- */

/* The 8 equipment positions of the graduation calculator, in UI order
 * (the order saved client builds align their per-slot rows to). The
 * label is the canonical slot name — the same string the slot_affix
 * data is keyed by and the value calcGraduation echoes back; the id
 * is what the web client keys its state by and sends on the wire
 * (the resolver echoes the slot back verbatim, so ids round-trip). */
export const GRAD_SLOTS: Array<{ id: string; label: string; icon: string }> = [
  { id: 'mainWeapon', label: '主武器', icon: '⚔' },
  { id: 'offWeapon', label: '副武器', icon: '🗡' },
  { id: 'head', label: '冠胄', icon: '👑' },
  { id: 'body', label: '胸甲', icon: '🥋' },
  { id: 'legs', label: '胫甲', icon: '🦵' },
  { id: 'wrist', label: '腕甲', icon: '🧤' },
  { id: 'ring', label: '环', icon: '💍' },
  { id: 'pendant', label: '佩', icon: '📿' },
];

export const gradSlotIdOf = (labelOrId: string): string => {
  const hit = GRAD_SLOTS.find((s) => s.label === labelOrId || s.id === labelOrId);
  return hit ? hit.id : labelOrId;
};
export const gradSlotLabelOf = (idOrLabel: string): string => {
  const hit = GRAD_SLOTS.find((s) => s.id === idOrLabel || s.label === idOrLabel);
  return hit ? hit.label : idOrLabel;
};

/* Three-rate rows: key = GraduationInput field name; cap = the 100%
 * attainment value (mirrors the calcGraduation yardstick); the label
 * is UI copy (grad.ratePrecision / grad.rateCrit / grad.rateAffinity)
 * composed by the shell. */
export const GRAD_RATES: Array<{ key: string; cap: number }> = [
  { key: 'precision', cap: 100 },
  { key: 'crit', cap: 80 },
  { key: 'affinity', cap: 40 },
];

/* ---- Gear library / OCR rules ---- */

/* The canonical item slot that covers the two weapon positions. */
export const GEAR_WEAPON_SLOT: string = GP_GEAR_SLOTS[0];
/* Equip positions a weapon-slot item can occupy (the gear pool rule):
 * the position list filtered to positions whose canonical item slot
 * (per the slot-alias table) is the weapon slot. */
export const GEAR_WEAPON_POSITIONS: string[] =
  (GP_SLOTS as string[]).filter((p) => GP_SLOT_ALIAS[p] === GEAR_WEAPON_SLOT);

/* OCR recognition rules the client engine needs beyond the delivered
 * name tables: affix-name size prefixes the variant builder strips,
 * the dingyin section marker the parser anchors on, and the fallback
 * canonicalizations for partially-read dingyin names (the canonical
 * names are keys of the delivered dingyin-left table). */
export const GEAR_OCR_STRIP_PREFIXES: string[] = ['最大', '最小'];
export const GEAR_OCR_DINGYIN_MARKER = '定音';
export const GEAR_OCR_DINGYIN_FALLBACKS: Array<{ needle: string; name: string }> = [
  { needle: '穿透', name: '外功穿透' },
  { needle: '抗性', name: '外功抗性' },
];

export function gearVocabRules() {
  return {
    weaponSlot: GEAR_WEAPON_SLOT,
    weaponPositions: GEAR_WEAPON_POSITIONS,
    ocrStripPrefixes: GEAR_OCR_STRIP_PREFIXES,
    ocrDingyinMarker: GEAR_OCR_DINGYIN_MARKER,
    ocrDingyinFallbacks: GEAR_OCR_DINGYIN_FALLBACKS,
  };
}

/* Load-time consistency guard: the fallback canonical names must be
 * real dingyin-left entries, and every grad slot label must be a real
 * equip position — a vocab edit that breaks either invariant fails
 * loudly here instead of silently degrading OCR / the calculator. */
for (const f of GEAR_OCR_DINGYIN_FALLBACKS) {
  if (GP_DINGYIN_LEFT[f.name] == null) throw new Error(`vocab: dingyin fallback '${f.name}' not in GP_DINGYIN_LEFT`);
}
for (const s of GRAD_SLOTS) {
  if (!(GP_SLOTS as string[]).includes(s.label)) throw new Error(`vocab: grad slot '${s.label}' not in GP_SLOTS`);
}
