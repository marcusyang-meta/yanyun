// Gear bench work state (current build / fixed-source fields and other
// session state). The gear library and builds live server-side in D1 (per
// ruling); only the bench's current selections are stored here, device-local.
// The export/import file format matches the original gear-planner-100.

export type GearLine = { key: string; val: number };
export type GearDingyin = { name: string; val: number } | null;
export type GearItem = {
  id: number;
  slot: string;
  name: string;
  lines: GearLine[];
  dingyin: GearDingyin;
  schools: string[];
  warnings: string[];
};
export type GearWorkState = {
  targetIdx: number;
  baseValues: Record<string, number | null>;
  xinfa: string[];
  res: number;
  extraAcc: number;
  extraCrit: number;
  extraInt: number;
  bowBySchool: Record<string, string>;
  sim: Record<string, string>;
  gradDy: boolean;
  loadout: Record<string, number>;
};

const KEY = 'yy-gear-planner-v1';

export function defaultWorkState(): GearWorkState {
  return {
    targetIdx: 0, baseValues: {}, xinfa: [], res: 1.85,
    extraAcc: 0, extraCrit: 0, extraInt: 0, bowBySchool: {},
    sim: {}, gradDy: true, loadout: {},
  };
}

export function loadWorkState(): GearWorkState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultWorkState();
    const p = JSON.parse(raw);
    if (!p || typeof p !== 'object') return defaultWorkState();
    const d = defaultWorkState();
    return {
      targetIdx: Number.isInteger(p.targetIdx) ? p.targetIdx : 0,
      baseValues: p.baseValues && typeof p.baseValues === 'object' ? p.baseValues : {},
      xinfa: Array.isArray(p.xinfa) ? p.xinfa.filter((x: unknown) => typeof x === 'string') : [],
      res: typeof p.res === 'number' && p.res >= 0.5 ? p.res : 1.85,
      extraAcc: typeof p.extraAcc === 'number' ? p.extraAcc : 0,
      extraCrit: typeof p.extraCrit === 'number' ? p.extraCrit : 0,
      extraInt: typeof p.extraInt === 'number' ? p.extraInt : 0,
      bowBySchool: p.bowBySchool && typeof p.bowBySchool === 'object' ? p.bowBySchool : {},
      sim: p.sim && typeof p.sim === 'object' ? p.sim : {},
      gradDy: p.gradDy !== false,
      loadout: p.loadout && typeof p.loadout === 'object' ? p.loadout : d.loadout,
    };
  } catch {
    return defaultWorkState();
  }
}

export function hasWorkState(): boolean {
  try { return localStorage.getItem(KEY) != null; } catch { return false; }
}

export function saveWorkState(w: GearWorkState): void {
  try { localStorage.setItem(KEY, JSON.stringify(w)); } catch { /* stay silent on quota-full etc. */ }
}

// Export file (same shape as the original: app/version/lib/loadout…; the importer only takes `lib` and appends it to the DB library)
export function buildExportFile(args: {
  lib: GearItem[];
  work: GearWorkState;
  bowKind: string;
}): string {
  const { lib, work, bowKind } = args;
  return JSON.stringify({
    app: 'gear-planner-100', version: 5,
    targetIdx: work.targetIdx,
    extras: { res: work.res, acc: work.extraAcc, crit: work.extraCrit, int: work.extraInt },
    base: { v: 2, values: work.baseValues, xf: work.xinfa },
    bowJue: { kind: bowKind, bySchool: work.bowBySchool, confirmed: {} },
    schoolConfirmed: true,
    sim: work.sim, gradDy: work.gradDy, lib, loadout: work.loadout, schemes: [],
  }, null, 1);
}

export type ImportFileResult =
  | { ok: true; items: Array<{ slot: string; name: string; lines: GearLine[]; dingyin: GearDingyin; schools: string[] }> }
  | { ok: false };

// Parse an import file: take the lib array (affix-key/alias normalization is done by server-side sanitize)
export function parseImportFile(text: string): ImportFileResult {
  let data: unknown;
  try { data = JSON.parse(text); } catch { return { ok: false }; }
  if (!data || typeof data !== 'object') return { ok: false };
  const lib = (data as { lib?: unknown }).lib;
  if (!Array.isArray(lib)) return { ok: false };
  const items = lib
    .filter((g): g is Record<string, unknown> => !!g && typeof g === 'object')
    .map((g) => ({
      slot: typeof g.slot === 'string' ? g.slot : '',
      name: typeof g.name === 'string' ? g.name : '',
      lines: Array.isArray(g.lines)
        ? g.lines.filter((l): l is GearLine => !!l && typeof l === 'object' && typeof (l as GearLine).key === 'string')
          .map((l) => ({ key: l.key, val: Number(l.val) || 0 }))
        : [],
      dingyin: g.dingyin && typeof g.dingyin === 'object'
        ? { name: String((g.dingyin as { name?: unknown }).name || ''), val: Number((g.dingyin as { val?: unknown }).val) || 0 }
        : null,
      schools: Array.isArray(g.schools) ? g.schools.filter((s): s is string => typeof s === 'string') : [],
    }));
  return { ok: true, items };
}

// "Set as target" cross-component channel: clicking set-as-target in a
// recipe table (GradCalc reference section / sect page BiS section) switches
// the gear bench's target. If the bench isn't mounted, the request is stashed
// and consumed on mount.
let pendingTarget: number | null = null;
const targetListeners = new Set<(idx: number) => void>();
export function requestGearTarget(idx: number): void {
  pendingTarget = idx;
  targetListeners.forEach((f) => f(idx));
}
export function consumePendingGearTarget(): number | null {
  const v = pendingTarget;
  pendingTarget = null;
  return v;
}
export function onGearTarget(f: (idx: number) => void): () => void {
  targetListeners.add(f);
  return () => { targetListeners.delete(f); };
}

/* A saved build (client shape of the server D1 user_gear_builds; shared by the gear bench and Profile) */
export type SavedBuild = {
  id: number; name: string; targetIdx: number; buildLabel: string; school: string;
  loadout: Record<string, number>; baseValues: Record<string, number | null>;
  xinfa: string[]; res: number; extraAcc: number; extraCrit: number; extraInt: number;
  bowKind: string; gradDingyinOn: boolean;
  snapTotal: number; snapA: number; snapB: number; snapD: number; snapLoan: number;
  snapYAcc: number; snapYCrit: number; snapYInt: number; snapDawai: number; snapXiaowai: number;
  shareUrl: string | null;
};

/* The gear pool for a slot: the weapon pool covers the main/offhand weapon positions */
export const poolOf = (slot: string): string[] => (slot === '武器' ? ['主武器', '副武器'] : [slot]);

/* ---- Profile-surface operations on the saved work state (used while the
 * gear bench is unmounted: load/equip lands in the local work state and the
 * bench reads it on its next mount; semantics match the bench's live
 * operations) ---- */
export function applyEquipToSavedWork(gear: { id: number; slot: string }, pos?: string): void {
  const w = loadWorkState();
  const lo = { ...w.loadout };
  for (const k of Object.keys(lo)) if (lo[k] === gear.id) delete lo[k];
  let target = pos;
  if (!target) {
    const pool = poolOf(gear.slot);
    target = pool.find((p) => !lo[p]) || pool[0];
  }
  if (target) lo[target] = gear.id;
  w.loadout = lo;
  saveWorkState(w);
}

export function mergeAutoSelectIntoSavedWork(entries: Array<{ slot: string; gearId: number }>): void {
  if (!entries.length) return;
  const w = loadWorkState();
  const lo = { ...w.loadout };
  entries.forEach((e) => { lo[e.slot] = e.gearId; });
  w.loadout = lo;
  saveWorkState(w);
}

export function applyBuildToSavedWork(
  b: SavedBuild,
  validIds: ReadonlySet<number>,
  schoolOf: (targetIdx: number) => string,
): void {
  const w = loadWorkState();
  const lo: Record<string, number> = {};
  Object.entries(b.loadout).forEach(([pos, gid]) => { if (validIds.has(gid)) lo[pos] = gid; });
  const school = schoolOf(b.targetIdx);
  saveWorkState({
    ...w,
    targetIdx: b.targetIdx,
    baseValues: { ...b.baseValues },
    xinfa: [...b.xinfa],
    res: b.res, extraAcc: b.extraAcc, extraCrit: b.extraCrit, extraInt: b.extraInt,
    bowBySchool: school ? { ...w.bowBySchool, [school]: b.bowKind } : w.bowBySchool,
    gradDy: b.gradDingyinOn,
    loadout: lo,
  });
}

export function clearSavedWorkLoadout(): void {
  const w = loadWorkState();
  w.loadout = {};
  w.sim = {};
  saveWorkState(w);
}

/* "OCR import by slot" cross-component channel: a button in a gear-bench
 * build cell requests it; the mounted GearLibrary (bench mode) handles it
 * (opens its own OCR section and file picker). */
const ocrSlotListeners = new Set<(pos: string) => void>();
export function requestOcrSlot(pos: string): void {
  ocrSlotListeners.forEach((f) => f(pos));
}
export function onOcrSlotRequest(f: (pos: string) => void): () => void {
  ocrSlotListeners.add(f);
  return () => { ocrSlotListeners.delete(f); };
}

export const fmt1 = (n: number): string => (Math.round(n * 10) / 10).toFixed(1);
export const pct1 = (n: number): string => (Math.round(n * 10) / 10).toFixed(1) + '%';
