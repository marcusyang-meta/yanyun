import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// 配装台工作状态 (与 Web gearStore 同一份形状与语义): 装备库与方案存
// 服务端 D1 (按账号), 这里只存工作台的当前选择, 设备本地。
// Web 端与网站同键同格式 (localStorage 'yy-gear-planner-v1');
// 原生端 SecureStore 分两键存放 (单值大小上限), 内存缓存同步读、
// 写入异步落盘 —— 挂载面先调用 hydrateGearWorkState() 再读。

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
  // 原生未水合时先给默认态; 水合完成后挂载面应重读 (见 useGearWorkState)
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
    try { window.localStorage.setItem(KEY, JSON.stringify(w)); } catch { /* 静默 */ }
    return;
  }
  nativeRawExisted = true;
  const { loadout, sim, ...rest } = w;
  void SecureStore.setItemAsync(KEY_A, JSON.stringify(rest)).catch(() => undefined);
  void SecureStore.setItemAsync(KEY_B, JSON.stringify({ loadout, sim })).catch(() => undefined);
}

// 导出文件 (与 Web/原站 gear-planner-100 同构; 导入端只取 lib 追加进 DB 库)
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

// 解析导入文件: 取 lib 数组 (词条键/别名归一化在服务端 sanitize 完成)
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

/* 「设为目标」跨组件通道 (与 Web 同语义): 配方表/流派页 BiS 区点设为目标 →
 * 配装台切目标。配装台未挂载时暂存, 挂载时消费。 */
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

/* 已保存方案 (服务端 D1 user_gear_builds 的客户端形状; 与 Web 同) */
export type SavedBuild = {
  id: number; name: string; targetIdx: number; buildLabel: string; school: string;
  loadout: Record<string, number>; baseValues: Record<string, number | null>;
  xinfa: string[]; res: number; extraAcc: number; extraCrit: number; extraInt: number;
  bowKind: string; gradDingyinOn: boolean;
  snapTotal: number; snapA: number; snapB: number; snapD: number; snapLoan: number;
  snapYAcc: number; snapYCrit: number; snapYInt: number; snapDawai: number; snapXiaowai: number;
};

/* 部位的装备池: 武器池含主/副武器位 (与 Web 同) */
export const poolOf = (slot: string): string[] => (slot === '武器' ? ['主武器', '副武器'] : [slot]);

/* ---- Profile 表面对已存工作态的操作 (与 Web 同语义; 本端为内存缓存+落盘) ---- */
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

/* 「按部位 OCR 导入」跨组件通道 (与 Web 同): 配装台搭配格按钮点下后,
 * 由已挂载的 GearLibrary (bench 模式) 承接。 */
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
