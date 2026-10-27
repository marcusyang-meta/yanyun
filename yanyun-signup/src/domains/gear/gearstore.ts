// Gear-library storage (owned per Discord account; user ruling
// 2026-10-24: no localStorage). Row-level reads/writes go through the
// data layer (src/domains/gear/gear.ts); this file keeps only the
// payload JSON serialization and row->domain mapping.
// user_gear_items: single items (affixes/attunement/school tags live in
// the payload JSON, already sanitized by gearplanner).
// user_gear_builds: saved builds (an item-id loadout + fixed-source
// field state + a server-computed snapshot).
// Every read/write is scoped by discord_id: a miss means "does not
// exist" — another user's row is indistinguishable from no row.
import { listGearItemRows, insertGearItemRow, updateGearItemRow as updateGearItemRowData, deleteGearItemRow as deleteGearItemRowData, listGearBuildRows, insertGearBuildRow, deleteGearBuildRow as deleteGearBuildRowData } from './gear.ts';

function itemRowToGear(row: any) {
  let p: any = {};
  try { p = JSON.parse(row.payload || '{}'); } catch { p = {}; }
  return {
    id: row.id,
    slot: row.slot || '',
    name: row.name || '',
    lines: Array.isArray(p.lines) ? p.lines : [],
    dingyin: p.dingyin || null,
    schools: Array.isArray(p.schools) ? p.schools : [],
    warnings: Array.isArray(p.warnings) ? p.warnings : [],
  };
}
function gearPayload(gear: any) {
  return JSON.stringify({
    lines: gear.lines || [],
    dingyin: gear.dingyin || null,
    schools: gear.schools || [],
    warnings: gear.warnings || [],
  });
}

export async function listGearItems(db: any, discordId: string) {
  const rows = await listGearItemRows(db, discordId);
  return rows.map(itemRowToGear);
}

export async function insertGearItem(db: any, discordId: string, gear: any) {
  const meta = await insertGearItemRow(db, {
    discordId, slot: gear.slot || '', name: gear.name || '',
    payload: gearPayload(gear), createdAt: Date.now(),
  });
  const id = meta.last_row_id || null;
  return { ...gear, id };
}

export async function updateGearItemRow(db: any, discordId: string, id: number, gear: any) {
  const meta = await updateGearItemRowData(db, discordId, id, {
    slot: gear.slot || '', name: gear.name || '', payload: gearPayload(gear),
  });
  return meta.changes > 0 ? { ...gear, id } : null;
}

export async function deleteGearItemRow(db: any, discordId: string, id: number) {
  const meta = await deleteGearItemRowData(db, discordId, id);
  return meta.changes > 0;
}

function buildRowToSaved(row: any) {
  let p: any = {};
  try { p = JSON.parse(row.payload || '{}'); } catch { p = {}; }
  return {
    id: row.id,
    name: row.name || '',
    targetIdx: row.target_idx || 0,
    buildLabel: p.buildLabel || '',
    loadout: p.loadout || {},
    baseValues: p.baseValues || {},
    xinfa: Array.isArray(p.xinfa) ? p.xinfa : [],
    extras: p.extras || { res: 1.85, acc: 0, crit: 0, int: 0 },
    bowKind: p.bowKind || '',
    gradDingyinOn: p.gradDingyinOn !== false,
    snapshot: p.snapshot || null,
    createdAt: row.created_at || 0,
  };
}

export async function listGearBuilds(db: any, discordId: string) {
  const rows = await listGearBuildRows(db, discordId);
  return rows.map(buildRowToSaved);
}

export async function insertGearBuild(db: any, discordId: string, build: any) {
  const payload = JSON.stringify({
    buildLabel: build.buildLabel || '',
    loadout: build.loadout || {},
    baseValues: build.baseValues || {},
    xinfa: build.xinfa || [],
    extras: build.extras || { res: 1.85, acc: 0, crit: 0, int: 0 },
    bowKind: build.bowKind || '',
    gradDingyinOn: build.gradDingyinOn !== false,
    snapshot: build.snapshot || null,
  });
  const now = Date.now();
  const meta = await insertGearBuildRow(db, {
    discordId, name: build.name || '', targetIdx: build.targetIdx || 0, payload, createdAt: now,
  });
  const id = meta.last_row_id || null;
  return { ...build, id, createdAt: now };
}

export async function deleteGearBuildRow(db: any, discordId: string, id: number) {
  const meta = await deleteGearBuildRowData(db, discordId, id);
  return meta.changes > 0;
}
