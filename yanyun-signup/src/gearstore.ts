// 配装台装备库存储 (按 Discord 账号归属; 2026-10-24 用户裁决: 不用 localStorage)
// 行级读写走数据层 (src/domains/gear/gear.ts); 本文件只剩懒 DDL、
// payload JSON 序列化与行->领域对象映射。
// user_gear_items: 单件装备 (词条/定音/流派标签存 payload JSON, 已经过 gearplanner sanitize)
// user_gear_builds: 保存的方案 (搭配 item-id 组合 + 固定源字段状态 + 服务端算出的快照)
// 所有读写一律以 discord_id 限定: 查不到即不存在, 不区分「他人的」与「没有」。
import {
  listGearItemRows, insertGearItemRow, updateGearItemRow as updateGearItemRowData,
  deleteGearItemRow as deleteGearItemRowData, listGearBuildRows, insertGearBuildRow,
  deleteGearBuildRow as deleteGearBuildRowData,
  ensureGearTables as ensureGearTablesRepo,
} from './domains/gear/index.ts';

// 懒 DDL 已归 gear 域 gear 仓库 (三期); 此处保留旧名导出作委托。
export function ensureGearTables(db: any) {
  return ensureGearTablesRepo(db);
}

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
  await ensureGearTables(db);
  const rows = await listGearItemRows(db, discordId);
  return rows.map(itemRowToGear);
}

export async function insertGearItem(db: any, discordId: string, gear: any) {
  await ensureGearTables(db);
  const meta = await insertGearItemRow(db, {
    discordId, slot: gear.slot || '', name: gear.name || '',
    payload: gearPayload(gear), createdAt: Date.now(),
  });
  const id = meta.last_row_id || null;
  return { ...gear, id };
}

export async function updateGearItemRow(db: any, discordId: string, id: number, gear: any) {
  await ensureGearTables(db);
  const meta = await updateGearItemRowData(db, discordId, id, {
    slot: gear.slot || '', name: gear.name || '', payload: gearPayload(gear),
  });
  return meta.changes > 0 ? { ...gear, id } : null;
}

export async function deleteGearItemRow(db: any, discordId: string, id: number) {
  await ensureGearTables(db);
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
  await ensureGearTables(db);
  const rows = await listGearBuildRows(db, discordId);
  return rows.map(buildRowToSaved);
}

export async function insertGearBuild(db: any, discordId: string, build: any) {
  await ensureGearTables(db);
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
  await ensureGearTables(db);
  const meta = await deleteGearBuildRowData(db, discordId, id);
  return meta.changes > 0;
}
