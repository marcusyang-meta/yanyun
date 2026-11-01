/* ===================================================
 * Combat report aggregation engine (combat reports v1).
 *
 * Pure functions over one imported encounter document: the same
 * input always yields the same snapshot, so imports can be
 * replayed offline and a future model version can recompute from
 * the retained raw document. The counting rules are the ones
 * DESIGN (yanyun-combat-proto/DESIGN.md sections 2-4) pins down,
 * ported from the verified Python prototype (its reconciliation
 * against the official panel sample is the golden fixture of
 * tests/combat.test.ts):
 *
 *   - hit events are the only damage source; cast events count
 *     casts; the two crit dimensions (huiXin / huiYi) never merge.
 *   - every "/s" denominator is the file-declared durationMs.
 *   - buff intervals key on (buffId, target): apply opens,
 *     refresh never re-opens nor changes the applier (a refresh
 *     with no open interval opens one and is quality-flagged),
 *     remove closes, unclosed intervals close at encounter end
 *     and are quality-flagged.
 *   - rDPS attribution: for one hit, the effective buff set is
 *     damageDealt buffs riding the hitter plus damageTaken buffs
 *     riding the target; multipliers compound (M), the implied
 *     unbuffed damage is d0 = d / M, the gain G = d - d0 is split
 *     by ln(multiplier) weights. A credit moves from beneficiary
 *     to applier ONLY when the applier is a different player
 *     actor: system-applied and non-player-applied gains stay
 *     with the beneficiary (DESIGN section 4), which keeps the
 *     team total conserved exactly: sum(rDamage) == sum(raw).
 *   - multipliers resolve, in order: the file's own buff
 *     dictionary block when present (files that carry one declare
 *     their truth), then the platform buff dictionary (by game
 *     buff id, then by buff name), then 1.0 with the buff row
 *     flagged multiplierKnown = false — the report renders the
 *     "multiplier undetermined" marker; a multiplier is never
 *     invented.
 * =================================================== */
import { COMBAT_BUFF_DICT_BY_ID, COMBAT_BUFF_DICT_BY_NAME } from './combat-buff-dict.gen.ts';

export const COMBAT_MODEL_VERSION = 1;
export const COMBAT_FORMAT_VERSION = 1;
/** Snapshot cast list cap: the casts tab needs points, not a
 *  second copy of the event stream. */
export const COMBAT_CASTS_CAP = 4000;
/** Event-count ceiling for one import (validation rejects above). */
export const COMBAT_EVENTS_CAP = 200_000;

export type CombatResult = 'kill' | 'wipe' | 'unknown';
export type CombatSource = 'events' | 'overlay';
export type CombatCrit = 'none' | 'huiXin' | 'huiYi' | 'both';
export type BuffKind = 'damageDealt' | 'damageTaken';

export interface CombatActorInput {
  id: string;
  name: string;
  kind: 'player' | 'boss';
}

export interface CombatEventInput {
  t: number;
  type: 'cast' | 'hit' | 'buffApply' | 'buffRefresh' | 'buffRemove' | 'death';
  source: string;
  target: string;
  skillId?: string;
  skillName?: string;
  amount?: number;
  crit?: CombatCrit;
  buffId?: string;
  buffName?: string;
  applier?: string;
}

export interface CombatBuffDictInput {
  name?: string;
  kind?: BuffKind;
  multiplier?: number;
}

export interface CombatFileInput {
  formatVersion: number;
  source: CombatSource;
  encounter: {
    bossName: string | null;
    startedAtMs: number;
    durationMs: number;
    result: CombatResult;
  };
  actors: CombatActorInput[];
  buffs?: Record<string, CombatBuffDictInput>;
  events: CombatEventInput[];
  /* Overlay-only extras: cast points that name no actor (the local
   * player's fused vision/input points) ride the snapshot as-is. */
  overlayCastPoints?: { tMs: number; name: string | null }[];
}

export interface CombatMemberMatch {
  /** Roster entry id when the match came from the guild roster;
   *  null when it came from the accumulated member list (which
   *  keys members by Discord identity, not roster rows). */
  rosterEntryId: number | null;
  displayName: string;
}

export interface CombatPlayerRow {
  actorId: string;
  name: string;
  member: CombatMemberMatch | null;
  total: number;
  dps: number;
  activityPct: number;
  rDamage: number;
  rDps: number;
  rShare: number;
}

export interface CombatSkillRow {
  skillId: string;
  skillName: string;
  total: number;
  casts: number;
  hits: number;
  avg: number;
  critPct: number;
  specPct: number;
  max: number;
  dps: number;
  share: number;
}

export interface CombatSkillTable {
  actorId: string;
  playerName: string;
  rows: CombatSkillRow[];
}

export interface CombatBuffRow {
  buffId: string;
  buffName: string;
  kind: BuffKind | null;
  multiplier: number;
  multiplierKnown: boolean;
  multiplierSource: 'file' | 'dict' | 'default';
  applierActorId: string;
  applierName: string;
  targetActorId: string;
  targetName: string;
  uptimeMs: number;
  uptimePct: number;
  intervals: { startMs: number; endMs: number }[];
}

export interface CombatCastPoint {
  tMs: number;
  actorId: string;
  playerName: string;
  skillName: string;
}

export interface CombatSnapshot {
  version: 1;
  modelVersion: number;
  source: CombatSource;
  bossName: string;
  startedAtMs: number;
  durationMs: number;
  result: CombatResult;
  teamTotal: number;
  teamDps: number;
  players: CombatPlayerRow[];
  skillTables: CombatSkillTable[];
  buffRows: CombatBuffRow[];
  casts: CombatCastPoint[];
  castsTruncated: boolean;
  overlayCastPoints: { tMs: number; name: string | null }[];
  dpsSeries: { second: number; damage: number }[];
  quality: {
    eventCount: number;
    unclosedIntervals: number;
    orphanRefreshes: number;
    orphanRemoves: number;
    reappliedIntervals: number;
    panelResets: number;
  };
}

export type CombatValidationError = 'formatUnsupported' | 'validationFailed';

const EVENT_TYPES = new Set(['cast', 'hit', 'buffApply', 'buffRefresh', 'buffRemove', 'death']);
const CRITS = new Set(['none', 'huiXin', 'huiYi', 'both']);
const RESULTS = new Set(['kill', 'wipe', 'unknown']);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

/** Validate one import document against the formatVersion 1
 *  contract (HANDOFF-layer1 + DESIGN section 2.3). The verdict is
 *  whole-file: a failed validation imports nothing at all. Event
 *  files are detected by their `events` array; overlay session
 *  exports (panel_series based, no event stream) convert through
 *  overlaySessionToFile first — this validator sees only the
 *  normalized event shape. */
export function validateCombatFile(
  doc: unknown,
): { ok: true; file: CombatFileInput } | { ok: false; errorCode: CombatValidationError } {
  const fail = { ok: false, errorCode: 'validationFailed' } as const;
  if (!isRecord(doc)) return fail;
  if (doc.formatVersion !== COMBAT_FORMAT_VERSION) {
    return { ok: false, errorCode: 'formatUnsupported' };
  }
  const enc = doc.encounter;
  if (!isRecord(enc)) return fail;
  const durationMs = enc.durationMs;
  if (typeof durationMs !== 'number' || !Number.isInteger(durationMs) || durationMs <= 0) return fail;
  const startedAtMs = enc.startedAtMs;
  if (typeof startedAtMs !== 'number' || !Number.isInteger(startedAtMs) || startedAtMs < 0) return fail;
  const result = str(enc.result) || 'unknown';
  if (!RESULTS.has(result)) return fail;
  if (!Array.isArray(doc.actors) || !doc.actors.length) return fail;
  const actors: CombatActorInput[] = [];
  const actorIds = new Set<string>();
  for (const raw of doc.actors) {
    if (!isRecord(raw)) return fail;
    const id = str(raw.id);
    const name = str(raw.name);
    const kind = str(raw.kind);
    if (!id || actorIds.has(id)) return fail;
    if (kind !== 'player' && kind !== 'boss') return fail;
    actorIds.add(id);
    actors.push({ id, name, kind });
  }
  if (!Array.isArray(doc.events) || doc.events.length > COMBAT_EVENTS_CAP) return fail;
  const events: CombatEventInput[] = [];
  let prevT = -1;
  for (const raw of doc.events) {
    if (!isRecord(raw)) return fail;
    const t = raw.t;
    if (typeof t !== 'number' || !Number.isInteger(t) || t < 0 || t > durationMs) return fail;
    if (t < prevT) return fail;
    prevT = t;
    const type = str(raw.type);
    if (!EVENT_TYPES.has(type)) return fail;
    const source = str(raw.source);
    if (!actorIds.has(source)) return fail;
    const target = str(raw.target);
    const ev: CombatEventInput = {
      t, type: type as CombatEventInput['type'], source, target,
    };
    if (type === 'cast' || type === 'hit') {
      if (!actorIds.has(target)) return fail;
      const skillId = str(raw.skillId);
      const skillName = str(raw.skillName);
      if (!skillId || !skillName) return fail;
      ev.skillId = skillId;
      ev.skillName = skillName;
    }
    if (type === 'hit') {
      const amount = raw.amount;
      if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) return fail;
      ev.amount = amount;
      const crit = str(raw.crit) || 'none';
      if (!CRITS.has(crit)) return fail;
      ev.crit = crit as CombatCrit;
    }
    if (type === 'buffApply' || type === 'buffRefresh' || type === 'buffRemove') {
      if (!actorIds.has(target)) return fail;
      const buffId = str(raw.buffId);
      const buffName = str(raw.buffName);
      if (!buffId || !buffName) return fail;
      ev.buffId = buffId;
      ev.buffName = buffName;
      if (type !== 'buffRemove') {
        const applier = str(raw.applier);
        if (!applier || (applier !== 'system' && !actorIds.has(applier))) return fail;
        ev.applier = applier;
      }
    }
    events.push(ev);
  }
  const buffs: Record<string, CombatBuffDictInput> = {};
  if (isRecord(doc.buffs)) {
    for (const [buffId, raw] of Object.entries(doc.buffs)) {
      if (!isRecord(raw)) continue;
      const kind = str(raw.kind);
      const entry: CombatBuffDictInput = {};
      if (str(raw.name)) entry.name = str(raw.name);
      if (kind === 'damageDealt' || kind === 'damageTaken') entry.kind = kind;
      if (typeof raw.multiplier === 'number' && Number.isFinite(raw.multiplier) && raw.multiplier >= 1) {
        entry.multiplier = raw.multiplier;
      }
      buffs[buffId] = entry;
    }
  }
  return {
    ok: true,
    file: {
      formatVersion: COMBAT_FORMAT_VERSION,
      source: 'events',
      encounter: {
        bossName: typeof enc.bossName === 'string' ? enc.bossName : null,
        startedAtMs,
        durationMs,
        result: result as CombatResult,
      },
      actors,
      buffs,
      events,
    },
  };
}

interface ResolvedBuff {
  name: string;
  kind: BuffKind | null;
  multiplier: number;
  known: boolean;
  source: 'file' | 'dict' | 'default';
}

/** Resolve kind + multiplier for one buff id, in the documented
 *  precedence: the file's dictionary block, the platform
 *  dictionary (by id, then by the name the file declares), then
 *  the 1.0 undetermined fallback. */
function resolveBuff(
  file: CombatFileInput,
  buffId: string,
  seenName: string,
): ResolvedBuff {
  const fromFile = file.buffs?.[buffId];
  const name = (fromFile?.name || seenName || buffId).trim();
  if (fromFile && fromFile.kind && typeof fromFile.multiplier === 'number') {
    return { name, kind: fromFile.kind, multiplier: fromFile.multiplier, known: true, source: 'file' };
  }
  const byId = COMBAT_BUFF_DICT_BY_ID[buffId];
  if (byId) return { name, kind: byId.kind, multiplier: byId.multiplier, known: true, source: 'dict' };
  const byName = COMBAT_BUFF_DICT_BY_NAME[name];
  if (byName) return { name, kind: byName.kind, multiplier: byName.multiplier, known: true, source: 'dict' };
  return { name, kind: fromFile?.kind ?? null, multiplier: 1, known: false, source: 'default' };
}

interface Interval {
  startMs: number;
  endMs: number;
  applier: string;
}

/** Aggregate one validated file into the stored snapshot.
 *  `memberByNormName` maps a normalized character name to the
 *  roster member it matched at import time; unmatched actors stay
 *  guests and render under their file name verbatim. */
export function aggregateCombat(
  file: CombatFileInput,
  memberByNormName: Map<string, CombatMemberMatch>,
  normalizeName: (name: string) => string,
): CombatSnapshot {
  const durationMs = file.encounter.durationMs;
  const durationS = durationMs / 1000;
  const actorById = new Map(file.actors.map((a) => [a.id, a]));
  const actorName = (id: string): string => (id === 'system' ? 'system' : actorById.get(id)?.name ?? id);

  /* ---- buff intervals, keyed by (buffId, target) ---- */
  const quality = {
    eventCount: file.events.length,
    unclosedIntervals: 0,
    orphanRefreshes: 0,
    orphanRemoves: 0,
    reappliedIntervals: 0,
    panelResets: 0,
  };
  const open = new Map<string, { startMs: number; applier: string }>();
  const intervals = new Map<string, Interval[]>();
  const buffSeenName = new Map<string, string>();
  const keyOf = (buffId: string, target: string) => `${buffId}\0${target}`;
  const closeInterval = (key: string, endMs: number) => {
    const cur = open.get(key);
    if (!cur) return false;
    open.delete(key);
    const list = intervals.get(key) ?? [];
    list.push({ startMs: cur.startMs, endMs, applier: cur.applier });
    intervals.set(key, list);
    return true;
  };
  for (const ev of file.events) {
    if (ev.type !== 'buffApply' && ev.type !== 'buffRefresh' && ev.type !== 'buffRemove') continue;
    const buffId = ev.buffId ?? '';
    if (ev.buffName) buffSeenName.set(buffId, ev.buffName);
    const key = keyOf(buffId, ev.target);
    if (ev.type === 'buffApply') {
      if (open.has(key)) {
        quality.reappliedIntervals++;
        closeInterval(key, ev.t);
      }
      open.set(key, { startMs: ev.t, applier: ev.applier ?? 'system' });
    } else if (ev.type === 'buffRefresh') {
      if (!open.has(key)) {
        quality.orphanRefreshes++;
        open.set(key, { startMs: ev.t, applier: ev.applier ?? 'system' });
      }
    } else if (!closeInterval(key, ev.t)) {
      quality.orphanRemoves++;
    }
  }
  for (const key of [...open.keys()]) {
    quality.unclosedIntervals++;
    closeInterval(key, durationMs);
  }

  /* ---- resolved buff table ---- */
  const resolved = new Map<string, ResolvedBuff>();
  const resolve = (buffId: string): ResolvedBuff => {
    const hit = resolved.get(buffId);
    if (hit) return hit;
    const r = resolveBuff(file, buffId, buffSeenName.get(buffId) ?? '');
    resolved.set(buffId, r);
    return r;
  };

  /* ---- per-hit effective buff set ---- */
  const activeBuffs = (t: number, source: string, target: string) => {
    const out: { multiplier: number; applier: string }[] = [];
    for (const [key, list] of intervals) {
      const sep = key.indexOf('\0');
      const buffId = key.slice(0, sep);
      const ivTarget = key.slice(sep + 1);
      const buff = resolve(buffId);
      if (buff.kind === 'damageDealt' && ivTarget !== source) continue;
      if (buff.kind === 'damageTaken' && ivTarget !== target) continue;
      if (!buff.kind) continue;
      for (const iv of list) {
        if (iv.startMs <= t && t < iv.endMs) out.push({ multiplier: buff.multiplier, applier: iv.applier });
      }
    }
    return out;
  };

  /* ---- skill tables, activity, attribution ---- */
  const casts = new Map<string, number>();
  const hitsBySkill = new Map<string, CombatEventInput[]>();
  const skillNameById = new Map<string, string>();
  const playerTotal = new Map<string, number>();
  const activityBins = new Map<string, Set<number>>();
  const castPoints: CombatCastPoint[] = [];
  const dpsBySecond = new Map<number, number>();
  const markActive = (actorId: string, t: number) => {
    const set = activityBins.get(actorId) ?? new Set<number>();
    set.add(Math.floor(t / 1000));
    activityBins.set(actorId, set);
  };
  for (const ev of file.events) {
    if (ev.type === 'cast') {
      const k = `${ev.source}\0${ev.skillId ?? ''}`;
      casts.set(k, (casts.get(k) ?? 0) + 1);
      if (ev.skillName) skillNameById.set(ev.skillId ?? '', ev.skillName);
      markActive(ev.source, ev.t);
      if (castPoints.length < COMBAT_CASTS_CAP) {
        castPoints.push({
          tMs: ev.t, actorId: ev.source,
          playerName: actorName(ev.source), skillName: ev.skillName ?? '',
        });
      }
    } else if (ev.type === 'hit') {
      const k = `${ev.source}\0${ev.skillId ?? ''}`;
      const list = hitsBySkill.get(k) ?? [];
      list.push(ev);
      hitsBySkill.set(k, list);
      if (ev.skillName) skillNameById.set(ev.skillId ?? '', ev.skillName);
      playerTotal.set(ev.source, (playerTotal.get(ev.source) ?? 0) + (ev.amount ?? 0));
      markActive(ev.source, ev.t);
      const sec = Math.floor(ev.t / 1000);
      dpsBySecond.set(sec, (dpsBySecond.get(sec) ?? 0) + (ev.amount ?? 0));
    } else if (ev.type === 'buffApply') {
      markActive(ev.source, ev.t);
    }
  }

  const gainReceived = new Map<string, number>();
  const gainProvided = new Map<string, number>();
  for (const evs of hitsBySkill.values()) {
    for (const ev of evs) {
      const act = activeBuffs(ev.t, ev.source, ev.target);
      if (!act.length) continue;
      let mult = 1;
      let lnSum = 0;
      for (const b of act) {
        mult *= b.multiplier;
        lnSum += Math.log(b.multiplier);
      }
      if (mult <= 1 || lnSum <= 0) continue;
      const gain = (ev.amount ?? 0) - (ev.amount ?? 0) / mult;
      for (const b of act) {
        if (b.multiplier <= 1) continue;
        const credit = (gain * Math.log(b.multiplier)) / lnSum;
        const applier = b.applier;
        // The credit moves only between two distinct player
        // actors; system and non-player appliers leave the gain
        // with the beneficiary (the conservation rule above).
        if (applier === ev.source) continue;
        const applierActor = actorById.get(applier);
        if (!applierActor || applierActor.kind !== 'player') continue;
        gainReceived.set(ev.source, (gainReceived.get(ev.source) ?? 0) + credit);
        gainProvided.set(applier, (gainProvided.get(applier) ?? 0) + credit);
      }
    }
  }

  const skillTables: CombatSkillTable[] = [];
  for (const actor of file.actors) {
    if (actor.kind !== 'player') continue;
    const rows: CombatSkillRow[] = [];
    for (const [k, evs] of hitsBySkill) {
      const sep = k.indexOf('\0');
      if (k.slice(0, sep) !== actor.id) continue;
      const skillId = k.slice(sep + 1);
      let total = 0;
      let max = 0;
      let critHits = 0;
      let specHits = 0;
      for (const ev of evs) {
        const amount = ev.amount ?? 0;
        total += amount;
        if (amount > max) max = amount;
        if (ev.crit === 'huiXin' || ev.crit === 'both') critHits++;
        if (ev.crit === 'huiYi' || ev.crit === 'both') specHits++;
      }
      const total0 = playerTotal.get(actor.id) ?? 0;
      rows.push({
        skillId,
        skillName: skillNameById.get(skillId) ?? '',
        total,
        casts: casts.get(k) ?? 0,
        hits: evs.length,
        avg: total / evs.length,
        critPct: (100 * critHits) / evs.length,
        specPct: (100 * specHits) / evs.length,
        max,
        dps: total / durationS,
        share: total0 > 0 ? (100 * total) / total0 : 0,
      });
    }
    rows.sort((a, b) => b.total - a.total);
    if (rows.length) skillTables.push({ actorId: actor.id, playerName: actor.name, rows });
  }

  /* ---- buff rows (sorted by (buffId, target), prototype order) ---- */
  const buffRows: CombatBuffRow[] = [];
  for (const key of [...intervals.keys()].sort()) {
    const sep = key.indexOf('\0');
    const buffId = key.slice(0, sep);
    const target = key.slice(sep + 1);
    const list = intervals.get(key) ?? [];
    const buff = resolve(buffId);
    const uptimeMs = list.reduce((sum, iv) => sum + (iv.endMs - iv.startMs), 0);
    buffRows.push({
      buffId,
      buffName: buff.name,
      kind: buff.kind,
      multiplier: buff.multiplier,
      multiplierKnown: buff.known,
      multiplierSource: buff.source,
      applierActorId: list[0]?.applier ?? 'system',
      applierName: actorName(list[0]?.applier ?? 'system'),
      targetActorId: target,
      targetName: actorName(target),
      uptimeMs,
      uptimePct: (100 * uptimeMs) / durationMs,
      intervals: list.map((iv) => ({ startMs: iv.startMs, endMs: iv.endMs })),
    });
  }

  /* ---- party rows ---- */
  const totalBins = Math.ceil(durationS);
  const teamTotal = file.actors
    .filter((a) => a.kind === 'player')
    .reduce((sum, a) => sum + (playerTotal.get(a.id) ?? 0), 0);
  const players: CombatPlayerRow[] = [];
  for (const actor of file.actors) {
    if (actor.kind !== 'player') continue;
    const raw = playerTotal.get(actor.id) ?? 0;
    const rDamage = raw - (gainReceived.get(actor.id) ?? 0) + (gainProvided.get(actor.id) ?? 0);
    players.push({
      actorId: actor.id,
      name: actor.name,
      member: memberByNormName.get(normalizeName(actor.name)) ?? null,
      total: raw,
      dps: raw / durationS,
      activityPct: (100 * (activityBins.get(actor.id)?.size ?? 0)) / totalBins,
      rDamage,
      rDps: rDamage / durationS,
      rShare: teamTotal > 0 ? (100 * rDamage) / teamTotal : 0,
    });
  }
  players.sort((a, b) => b.rDps - a.rDps);

  const dpsSeries = [...dpsBySecond.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([second, damage]) => ({ second, damage }));

  return {
    version: 1,
    modelVersion: COMBAT_MODEL_VERSION,
    source: file.source,
    bossName: file.encounter.bossName ?? '',
    startedAtMs: file.encounter.startedAtMs,
    durationMs,
    result: file.encounter.result,
    teamTotal,
    teamDps: teamTotal / durationS,
    players,
    skillTables,
    buffRows,
    casts: castPoints,
    castsTruncated: file.events.filter((e) => e.type === 'cast').length > castPoints.length,
    overlayCastPoints: file.overlayCastPoints ?? [],
    dpsSeries,
    quality,
  };
}

/* ---------------- overlay session conversion ------------------- */

interface OverlayCluster {
  intervals?: [number, number][];
}

/** Convert one overlay session export (route-2 product: panel
 *  series + buff cluster timelines + fused cast points, no event
 *  stream) into the normalized event shape. Fidelity is honestly
 *  lower than a layer-1 file and the snapshot says so through its
 *  source: per-player damage comes from the official panel's
 *  cumulative totals (each positive step becomes one hit at that
 *  sample instant, skill-attributed to the panel bucket), boss
 *  debuff clusters become system-applied intervals, self-buff
 *  clusters are skipped (their target, the local player, is not
 *  identified in the export), and cast points ride along
 *  unattributed for the casts tab. Returns null when the document
 *  is not a recognizable overlay session. */
export function overlaySessionToFile(doc: unknown): CombatFileInput | null {
  if (!isRecord(doc)) return null;
  const panel = doc.panel_series;
  if (!isRecord(panel) || !isRecord(panel.players)) return null;
  const playerNames = Object.keys(panel.players);
  if (!playerNames.length) return null;
  const actors: CombatActorInput[] = playerNames.map((name, i) => ({
    id: `p${i + 1}`, name, kind: 'player' as const,
  }));
  actors.push({ id: 'boss', name: '', kind: 'boss' });
  const actorIdByName = new Map(actors.map((a) => [a.name, a.id]));

  const events: CombatEventInput[] = [];
  let maxT = 0;
  let panelResets = 0;
  for (const name of playerNames) {
    const series = panel.players[name];
    if (!isRecord(series)) continue;
    const points = Object.entries(series)
      .map(([t, v]) => ({ t: Number(t), v: typeof v === 'number' ? v : 0 }))
      .filter((p) => Number.isFinite(p.t))
      .sort((a, b) => a.t - b.t);
    let prev = 0;
    for (const p of points) {
      const tMs = Math.round(p.t * 1000);
      if (tMs > maxT) maxT = tMs;
      const delta = p.v - prev;
      prev = p.v;
      if (delta < 0) { panelResets++; continue; }
      if (delta === 0) continue;
      events.push({
        t: tMs, type: 'hit', source: actorIdByName.get(name) ?? 'p1', target: 'boss',
        skillId: 'panel', skillName: '', amount: Math.round(delta), crit: 'none',
      });
    }
  }
  if (!maxT) return null;

  const identities = isRecord(doc.buff_identities) ? doc.buff_identities : {};
  const bossIdent = isRecord(identities.boss_debuff) ? identities.boss_debuff : {};
  const timeline = isRecord(doc.buff_timeline) ? doc.buff_timeline : {};
  const bossClusters = isRecord(timeline.boss_debuff) ? timeline.boss_debuff : {};
  for (const [clusterId, rawCluster] of Object.entries(bossClusters)) {
    const cluster = rawCluster as OverlayCluster;
    const ident = isRecord(bossIdent[clusterId]) ? bossIdent[clusterId] : {};
    const buffName = typeof ident.name === 'string' && ident.name ? ident.name : clusterId;
    for (const [startS, endS] of cluster.intervals ?? []) {
      const startMs = Math.max(0, Math.round(startS * 1000));
      const endMs = Math.min(maxT, Math.round(endS * 1000));
      if (endMs <= startMs) continue;
      events.push({
        t: startMs, type: 'buffApply', source: 'boss', target: 'boss',
        buffId: clusterId, buffName, applier: 'system',
      });
      events.push({
        t: endMs, type: 'buffRemove', source: 'boss', target: 'boss',
        buffId: clusterId, buffName,
      });
    }
  }
  events.sort((a, b) => a.t - b.t);

  const castPoints: { tMs: number; name: string | null }[] = [];
  const castsRaw = isRecord(doc.casts) && Array.isArray(doc.casts.points) ? doc.casts.points : [];
  for (const raw of castsRaw) {
    if (!isRecord(raw) || typeof raw.t !== 'number') continue;
    castPoints.push({
      tMs: Math.round(raw.t * 1000),
      name: typeof raw.name === 'string' && raw.name ? raw.name : null,
    });
  }

  const file: CombatFileInput = {
    formatVersion: COMBAT_FORMAT_VERSION,
    source: 'overlay',
    encounter: { bossName: null, startedAtMs: 0, durationMs: maxT, result: 'unknown' },
    actors,
    events,
    overlayCastPoints: castPoints,
  };
  return file;
}

/** Count negative panel steps in one overlay session document
 *  (boss switches reset the official panel mid-file). */
export function countOverlayPanelResets(doc: unknown): number {
  if (!isRecord(doc) || !isRecord(doc.panel_series) || !isRecord(doc.panel_series.players)) return 0;
  let resets = 0;
  for (const series of Object.values(doc.panel_series.players)) {
    if (!isRecord(series)) continue;
    const points = Object.entries(series)
      .map(([t, v]) => ({ t: Number(t), v: typeof v === 'number' ? v : 0 }))
      .sort((a, b) => a.t - b.t);
    let prev = 0;
    for (const p of points) {
      if (p.v - prev < 0) resets++;
      prev = p.v;
    }
  }
  return resets;
}
