/* Gear-library -> graduation-calculator (GradCalc) bridge.
 *
 * The library and the planner engine speak GP affix keys (gearplanner
 * vocabulary: dawai / xiaowai / shu_*_da ...), while the graduation
 * calculator speaks the canonical affix keys of the affix_max /
 * slot_affix reference tables (max_atk / min_atk / class_atk_max ...).
 * This module is the single translation point between the two: the
 * GradPage shell serves the caller's library items pre-translated
 * through here, so neither client ever maps keys itself.
 *
 * Coverage, by the two vocabularies' own facts:
 * - 22 of the 25 GP affix keys have a canonical counterpart (the five
 *   elemental systems collapse into the calculator's single class_atk
 *   pair, exactly as its recipe table already treats them).
 * - wuqizeng / wanjia / quanqi have NO canonical counterpart (the
 *   calculator's vocabulary has no weapon-boost / player-damage /
 *   mystic-damage affix), and of the attunement names only the two
 *   penetration names correspond to canonical affixes (phys_pen /
 *   class_pen — their maxima in affix_max equal the GP attunement
 *   maxima); martial attunement names and 外功抗性 have none.
 * Unmappable lines are skipped and counted in `skipped`, never dropped
 * silently: the clients surface the count after a fill.
 *
 * The editor has five affix rows (main + four sub) plus the attunement
 * row, so translated affix lines cap at five; overflow lines count as
 * skipped too. Library lines carry no per-line resonance flag (they
 * are plain {key, val}), so the fill starts every row unflagged,
 * identical to a fresh hand entry.
 */
import { GP_LEGACY_KEY, GP_DINGYIN_LEFT, gpGearSlotOf } from './gearplanner.ts';
import { GRAD_SLOTS, GEAR_WEAPON_SLOT, GEAR_WEAPON_POSITIONS, gradSlotIdOf } from './vocab.ts';

export const GP_TO_GRAD_AFFIX_KEY: Record<string, string> = {
  dawai: 'max_atk',
  xiaowai: 'min_atk',
  shu_mj_da: 'class_atk_max',
  shu_ls_da: 'class_atk_max',
  shu_pz_da: 'class_atk_max',
  shu_qs_da: 'class_atk_max',
  shu_wx_da: 'class_atk_max',
  shu_mj_xiao: 'class_atk_min',
  shu_ls_xiao: 'class_atk_min',
  shu_pz_xiao: 'class_atk_min',
  shu_qs_xiao: 'class_atk_min',
  shu_wx_xiao: 'class_atk_min',
  ti: 'constitution',
  jin: 'power',
  yu: 'defense',
  min: 'agility',
  shi: 'spirit',
  jingzhun: 'precision',
  huixin: 'crit_rate',
  huiyi: 'affinity',
  quanwu: 'all_weapon',
  shouling: 'boss_dmg',
};

/* Attunement (dingyin) names with a canonical affix counterpart. */
export const GRAD_DINGYIN_KEY_BY_NAME: Record<string, string> = {
  '外功穿透': 'phys_pen',
  '无相穿透': 'class_pen',
};

/* Affix rows in the calculator's slot editor (main + four sub); the
 * attunement occupies its own sixth row. */
export const GRAD_AFFIX_ROW_COUNT = 5;

export interface GradGearLine {
  key: string;
  val: number;
}

export interface GradGearTranslation {
  lines: GradGearLine[];
  dingyin: GradGearLine | null;
  skipped: number;
}

export interface GearItemLike {
  lines?: ReadonlyArray<{ key?: unknown; val?: unknown }> | null;
  dingyin?: { name?: unknown; val?: unknown } | null;
}

function finiteVal(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/* Translate one stored library item into calculator rows: affix lines
 * keep their stored order (line one is the main affix), duplicate keys
 * are kept (the calculator tallies rows independently, same as hand
 * entry), legacy GP keys normalize first (mirroring gpSanitizeGearData). */
export function gradRowsForGearItem(item: GearItemLike): GradGearTranslation {
  let skipped = 0;
  const lines: GradGearLine[] = [];
  for (const raw of item.lines ?? []) {
    const rawKey = typeof raw?.key === 'string' ? raw.key : '';
    const key = GP_TO_GRAD_AFFIX_KEY[GP_LEGACY_KEY[rawKey] || rawKey];
    const val = finiteVal(raw?.val);
    if (!key || val === null || lines.length >= GRAD_AFFIX_ROW_COUNT) {
      skipped++;
      continue;
    }
    lines.push({ key, val });
  }
  let dingyin: GradGearLine | null = null;
  const dy = item.dingyin;
  if (dy && typeof dy.name === 'string' && dy.name.trim()) {
    const key = GRAD_DINGYIN_KEY_BY_NAME[dy.name.trim()];
    const val = finiteVal(dy.val);
    if (key && val !== null) dingyin = { key, val };
    else skipped++;
  }
  return { lines, dingyin, skipped };
}

/* Graduation slot ids a library item can fill: weapon-pool items serve
 * both weapon positions (the pool rule in vocab.ts), every other
 * library slot maps to the graduation slot of the same canonical name. */
export function gradSlotIdsForGearSlot(slot: string): string[] {
  const gearSlot = gpGearSlotOf(slot) ?? slot;
  if (gearSlot === GEAR_WEAPON_SLOT) return GEAR_WEAPON_POSITIONS.map((p) => gradSlotIdOf(p));
  return GRAD_SLOTS.some((s) => s.label === gearSlot) ? [gradSlotIdOf(gearSlot)] : [];
}

/* Load-time consistency guard: every attunement name translated here
 * must be a real GP attunement-left entry (mirrors the vocab.ts guard
 * style) — a rename in the GP table fails loudly instead of silently
 * unmapping stored items. */
for (const name of Object.keys(GRAD_DINGYIN_KEY_BY_NAME)) {
  if (GP_DINGYIN_LEFT[name] == null) throw new Error(`gradlink: dingyin name '${name}' not in GP_DINGYIN_LEFT`);
}
