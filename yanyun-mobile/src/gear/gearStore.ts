import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Bench work state (same shape and semantics as Web gearStore): the
// library and builds live server-side in D1 (per account); only the
// bench's current selection is kept here, on-device. Web uses the same
// key and format as the site (localStorage 'yy-gear-planner-v1'); native
// uses two SecureStore keys (per-value size cap), with a synchronous
// in-memory cache and async writes -- mount surfaces must call
// hydrateGearWorkState() before reading.

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
const KEY_A = 'yy-gear-work-a';
const KEY_B = 'yy-gear-work-b';

export function defaultWorkState(): GearWorkState {
  return {
    targetIdx: 0, baseValues: {}, xinfa: [], res: 1.85,
    extraAcc: 0, extraCrit: 0, extraInt: 0, bowBySchool: {},
    sim: {}, gradDy: true, loadout: {},
  };
}

function sanitizeWorkState(p: unknown): GearWorkState {
  const d = defaultWorkState();
  if (!p || typeof p !== 'object') return d;
  const o = p as Record<string, unknown>;
  return {
    targetIdx: Number.isInteger(o.targetIdx) ? (o.targetIdx as number) : 0,
    baseValues: o.baseValues && typeof o.baseValues === 'object' ? (o.baseValues as Record<string, number | null>) : {},
    xinfa: Array.isArray(o.xinfa) ? o.xinfa.filter((x): x is string => typeof x === 'string') : [],
    res: typeof o.res === 'number' && o.res >= 0.5 ? o.res : 1.85,
    extraAcc: typeof o.extraAcc === 'number' ? o.extraAcc : 0,
    extraCrit: typeof o.extraCrit === 'number' ? o.extraCrit : 0,
    extraInt: typeof o.extraInt === 'number' ? o.extraInt : 0,
    bowBySchool: o.bowBySchool && typeof o.bowBySchool === 'object' ? (o.bowBySchool as Record<string, string>) : {},
    sim: o.sim && typeof o.sim === 'object' ? (o.sim as Record<string, string>) : {},
    gradDy: o.gradDy !== false,
    loadout: o.loadout && typeof o.loadout === 'object' ? (o.loadout as Record<string, number>) : d.loadout,
  };
}

let cache: GearWorkState | null = null;
let hydrated = false;

function readWebRaw(): string | null {
  try { return window.localStorage.getItem(KEY); } catch { return null; }
}

export async function hydrateGearWorkState(): Promise<GearWorkState> {
  if (hydrated && cache) return cache;
  if (Platform.OS === 'web') {
    const raw = readWebRaw();
    cache = raw ? sanitizeWorkState(safeParse(raw)) : defaultWorkState();
  } else {
    try {
      const [a, b] = await Promise.all([
        SecureStore.getItemAsync(KEY_A),
        SecureStore.getItemAsync(KEY_B),
      ]);
      nativeRawExisted = a != null || b != null;
      const pa = a ? (safeParse(a) as Record<string, unknown> | null) : null;
      const pb = b ? (safeParse(b) as Record<string, unknown> | null) : null;
      cache = sanitizeWorkState({ ...(pa ?? {}), ...(pb ?? {}) });
    } catch {
      cache = defaultWorkState();
    }
  }
  hydrated = true;
  return cache;
}

function safeParse(s: string): unknown {
  try { return JSON.parse(s); } catch { return null; }
}

export function loadWorkState(): GearWorkState {
  if (cache) return cache;
  if (Platform.OS === 'web') {
    const raw = readWebRaw();
    cache = raw ? sanitizeWorkState(safeParse(raw)) : defaultWorkState();
    hydrated = true;
    return cache;
  }
  // Before native hydration, serve defaults; mount surfaces should re-read after hydration (see useGearWorkState)
  return defaultWorkState();
}

export function hasWorkState(): boolean {
  if (Platform.OS === 'web') {
    try { return window.localStorage.getItem(KEY) != null; } catch { return false; }
  }
  return hydrated && cache != null && nativeRawExisted;
}
let nativeRawExisted = false;

export function saveWorkState(w: GearWorkState): void {
  cache = w;
  hydrated = true;
  if (Platform.OS === 'web') {
    try { window.localStorage.setItem(KEY, JSON.stringify(w)); } catch { /* Silent */ }
    return;
  }
  nativeRawExisted = true;
  const { loadout, sim, ...rest } = w;
  void SecureStore.setItemAsync(KEY_A, JSON.stringify(rest)).catch(() => undefined);
  void SecureStore.setItemAsync(KEY_B, JSON.stringify({ loadout, sim })).catch(() => undefined);
}

// Export file (same shape as Web / the original gear-planner-100; importers only take lib and append it to the DB library)
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
  | { ok: true; items: { slot: string; name: string; lines: GearLine[]; dingyin: GearDingyin; schools: string[] }[] }
  | { ok: false };

// Parse an import file: take the lib array (affix key/alias normalization happens in server-side sanitize)
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

/* "Set as target" cross-component channel (same semantics as Web):
 * tapping set-as-target in the recipe table / sect-page BiS area switches
 * the bench target. Stashed while the bench is unmounted, consumed on mount. */
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

/* Saved builds (client shape of server D1 user_gear_builds; same as Web) */
export type SavedBuild = {
  id: number; name: string; targetIdx: number; buildLabel: string; school: string;
  loadout: Record<string, number>; baseValues: Record<string, number | null>;
  xinfa: string[]; res: number; extraAcc: number; extraCrit: number; extraInt: number;
  bowKind: string; gradDingyinOn: boolean;
  snapTotal: number; snapA: number; snapB: number; snapD: number; snapLoan: number;
  snapYAcc: number; snapYCrit: number; snapYInt: number; snapDawai: number; snapXiaowai: number;
};

/* Per-slot gear pool: the weapon pool includes main and off-hand weapon slots (same as Web) */
export const poolOf = (slot: string): string[] => (slot === '武器' ? ['主武器', '副武器'] : [slot]);

/* Profile-surface operations on the saved work state (same semantics as Web; here: memory cache + persistence) */
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

export function mergeAutoSelectIntoSavedWork(entries: { slot: string; gearId: number }[]): void {
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

/* Per-slot OCR import channel (same as Web): requested by a bench
 * loadout-cell button and handled by the mounted GearLibrary (bench mode). */
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
