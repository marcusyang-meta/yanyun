/* ===================================================
 * Combat report import service (combat reports v1, premium T2).
 *
 * Pipeline (mirrors the recap pipeline's shape, minus the
 * provider — aggregation is a pure local computation):
 *   detect input kind (layer-1 event file | overlay session)
 *   -> validate (whole-file; a rejection imports nothing)
 *   -> meter (per-guild daily import ceiling, recorded BEFORE
 *      processing, like the recap meter-before-call rule)
 *   -> build the identity map (character name -> this guild's
 *      roster member, for THIS encounter only)
 *   -> aggregate (pure) -> store the encounter row.
 * A processing failure after metering lands as a 'failed' row
 * (the surface's failure hint reads it) and never touches the
 * grouping's parsed encounters.
 *
 * Identity mapping (v1 default): an actor whose name matches a
 * guild roster entry (normalized comparison, the roster module's
 * own normalization) or an accumulated guild member nick is a
 * member for this encounter; everyone else stays a guest actor
 * and renders under the file's name verbatim. The map is stored
 * on the encounter; it never writes back to member profiles.
 *
 * Raw document retention (v1 default): the imported document is
 * retained on the row (events_json) so a future attribution
 * model can recompute, capped at EVENTS_JSON_CAP_BYTES — an
 * oversized document still imports, with retention skipped and
 * the cap noted in the snapshot quality block's place (the row's
 * events_json is simply empty, which readers already treat as
 * "not retained").
 *
 * Tier gating is NOT this file's job: callers (the import route)
 * compose the write verdict from tierLocked exactly like the
 * recap mutation composes its own.
 * =================================================== */
import {
  getEffectiveLimits, getCombatImportsUsedToday, recordCombatImportUse,
} from '../platform/limits.ts';
import { listGuildRosterEntries, normalizeRosterName } from '../guilds/roster.ts';
import { listGuildMembers } from '../identity/guildMembers.ts';
import {
  validateCombatFile, overlaySessionToFile, aggregateCombat, countOverlayPanelResets,
  COMBAT_MODEL_VERSION,
} from './combat-aggregate.ts';
import type {
  CombatFileInput, CombatMemberMatch, CombatSnapshot,
} from './combat-aggregate.ts';
import { insertEncounter } from './combat-reports.ts';
import type { CombatEncounterRow } from './combat-reports.ts';
import type { EventRow } from './events.ts';

/** Retention cap for the raw import document (2 MiB). */
export const EVENTS_JSON_CAP_BYTES = 2 * 1024 * 1024;

export type ImportCombatResult =
  | { ok: true; row: CombatEncounterRow }
  | {
      ok: false;
      errorCode:
        | 'formatUnsupported' | 'validationFailed'
        | 'importDailyLimit' | 'combatProcessingFailed';
    };

/** Build this guild's character-name -> member map for one
 *  import: roster entries first (they carry the curated display
 *  name), then accumulated member nicks for names the roster
 *  does not know. */
export async function buildMemberMap(
  db: D1Database, tenant: number,
): Promise<Map<string, CombatMemberMatch>> {
  const map = new Map<string, CombatMemberMatch>();
  const [roster, members] = await Promise.all([
    listGuildRosterEntries(db, tenant).catch(() => []),
    listGuildMembers(db, tenant).catch(() => []),
  ]);
  for (const entry of roster) {
    const key = entry.name_norm || normalizeRosterName(entry.display_name);
    if (key && !map.has(key)) {
      map.set(key, { rosterEntryId: entry.id, displayName: entry.display_name });
    }
  }
  for (const member of members) {
    for (const candidate of [member.nick, member.global_name]) {
      const key = normalizeRosterName(candidate || '');
      if (key && !map.has(key)) {
        map.set(key, { rosterEntryId: null, displayName: candidate });
      }
    }
  }
  return map;
}

/** Detect and normalize the two accepted input kinds. An
 *  overlay session export is recognized by its panel_series
 *  block; everything else must validate as an event file. */
export function normalizeCombatInput(
  doc: unknown,
): { ok: true; file: CombatFileInput; panelResets: number }
  | { ok: false; errorCode: 'formatUnsupported' | 'validationFailed' } {
  if (typeof doc === 'object' && doc !== null && 'panel_series' in doc) {
    const file = overlaySessionToFile(doc);
    if (!file) return { ok: false, errorCode: 'validationFailed' };
    return { ok: true, file, panelResets: countOverlayPanelResets(doc) };
  }
  const validated = validateCombatFile(doc);
  if (!validated.ok) return validated;
  return { ok: true, file: validated.file, panelResets: 0 };
}

/** Run the import pipeline for one grouping. `rawText` is the
 *  request body verbatim (retained under the cap); `doc` is its
 *  parsed JSON. Callers have already established the session,
 *  the grouping, and the tier write verdict. */
export async function importCombatReport(
  db: D1Database,
  ev: EventRow,
  uploaderUserId: number,
  doc: unknown,
  rawText: string,
): Promise<ImportCombatResult> {
  const normalized = normalizeCombatInput(doc);
  if (!normalized.ok) return normalized;
  const { file, panelResets } = normalized;
  const nowMs = Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  const limits = await getEffectiveLimits(db, { userId: uploaderUserId, guildId: ev.tenant });
  const used = await getCombatImportsUsedToday(db, ev.tenant, nowMs);
  if (used >= limits.combatImportsPerDay) return { ok: false, errorCode: 'importDailyLimit' };
  // Meter BEFORE processing: the stored document (parsed or
  // failed) is the cost, mirroring the recap meter-before-call.
  await recordCombatImportUse(db, ev.tenant, nowMs);
  const retained = rawText.length <= EVENTS_JSON_CAP_BYTES ? rawText : '';
  const base = {
    tenant: ev.tenant,
    eventId: ev.id,
    uploaderUserId,
    bossName: file.encounter.bossName ?? '',
    startedAtMs: file.encounter.startedAtMs,
    durationMs: file.encounter.durationMs,
    result: file.encounter.result,
    source: file.source,
    formatVersion: file.formatVersion,
    modelVersion: COMBAT_MODEL_VERSION,
    atSec: nowSec,
  };
  try {
    const memberMap = await buildMemberMap(db, ev.tenant);
    const snapshot: CombatSnapshot = aggregateCombat(file, memberMap, normalizeRosterName);
    const stamped = panelResets > 0
      ? { ...snapshot, quality: { ...snapshot.quality, panelResets } }
      : snapshot;
    const actorMap = stamped.players.map((p) => ({
      actorId: p.actorId,
      name: p.name,
      member: p.member,
    }));
    const row = await insertEncounter(db, {
      ...base,
      status: 'parsed',
      lastError: '',
      snapshotJson: JSON.stringify(stamped),
      actorMapJson: JSON.stringify(actorMap),
      eventsJson: retained,
    });
    return { ok: true, row };
  } catch (e) {
    const message = (e instanceof Error ? e.message : String(e)).slice(0, 200);
    await insertEncounter(db, {
      ...base,
      status: 'failed',
      lastError: message,
      snapshotJson: '{}',
      actorMapJson: '[]',
      eventsJson: retained,
    }).catch(() => {});
    return { ok: false, errorCode: 'combatProcessingFailed' };
  }
}

/** Parsed snapshot of a stored encounter row (null when the row
 *  holds none — failed rows and unparseable documents). */
export function encounterSnapshot(row: CombatEncounterRow): CombatSnapshot | null {
  if (row.status !== 'parsed') return null;
  try {
    const v = JSON.parse(row.snapshot_json) as CombatSnapshot;
    return v && typeof v === 'object' && Array.isArray(v.players) ? v : null;
  } catch { return null; }
}
