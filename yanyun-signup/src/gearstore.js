// 配装台装备库存储 (D1, 按 Discord 账号归属; 2026-10-24 用户裁决: 不用 localStorage)
// user_gear_items: 单件装备 (词条/定音/流派标签存 payload JSON, 已经过 gearplanner sanitize)
// user_gear_builds: 保存的方案 (搭配 item-id 组合 + 固定源字段状态 + 服务端算出的快照)
// 所有读写一律以 discord_id 限定: 查不到即不存在, 不区分「他人的」与「没有」。
let gearTablesReady = null;
export function ensureGearTables(db) {
  if (!gearTablesReady) {
    gearTablesReady = (async () => {
      try {
        await db.prepare(`CREATE TABLE IF NOT EXISTS user_gear_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          discord_id TEXT NOT NULL,
          slot TEXT NOT NULL DEFAULT '',
          name TEXT NOT NULL DEFAULT '',
          payload TEXT NOT NULL DEFAULT '{}',
          created_at INTEGER NOT NULL DEFAULT 0
        )`).run();
        await db.prepare('CREATE INDEX IF NOT EXISTS idx_user_gear_items_owner ON user_gear_items (discord_id)').run();
        await db.prepare(`CREATE TABLE IF NOT EXISTS user_gear_builds (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          discord_id TEXT NOT NULL,
          name TEXT NOT NULL DEFAULT '',
          target_idx INTEGER NOT NULL DEFAULT 0,
          payload TEXT NOT NULL DEFAULT '{}',
          created_at INTEGER NOT NULL DEFAULT 0
        )`).run();
        await db.prepare('CREATE INDEX IF NOT EXISTS idx_user_gear_builds_owner ON user_gear_builds (discord_id)').run();
      } catch { /* 表已存在等情况静默 */ }
    })();
  }
  return gearTablesReady;
}

function itemRowToGear(row) {
  let p = {};
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
function gearPayload(gear) {
  return JSON.stringify({
    lines: gear.lines || [],
    dingyin: gear.dingyin || null,
    schools: gear.schools || [],
    warnings: gear.warnings || [],
  });
}

export async function listGearItems(db, discordId) {
  await ensureGearTables(db);
  const { results } = await db.prepare(
    'SELECT id, slot, name, payload FROM user_gear_items WHERE discord_id = ? ORDER BY id ASC'
  ).bind(discordId).all();
  return (results || []).map(itemRowToGear);
}

export async function insertGearItem(db, discordId, gear) {
  await ensureGearTables(db);
  const r = await db.prepare(
    'INSERT INTO user_gear_items (discord_id, slot, name, payload, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(discordId, gear.slot || '', gear.name || '', gearPayload(gear), Date.now()).run();
  const id = r && r.meta ? (r.meta.last_row_id ?? null) : null;
  return { ...gear, id };
}

export async function updateGearItemRow(db, discordId, id, gear) {
  await ensureGearTables(db);
  const r = await db.prepare(
    'UPDATE user_gear_items SET slot = ?, name = ?, payload = ? WHERE id = ? AND discord_id = ?'
  ).bind(gear.slot || '', gear.name || '', gearPayload(gear), id, discordId).run();
  const changed = r && r.meta ? (r.meta.changes ?? 0) : 0;
  return changed > 0 ? { ...gear, id } : null;
}

export async function deleteGearItemRow(db, discordId, id) {
  await ensureGearTables(db);
  const r = await db.prepare(
    'DELETE FROM user_gear_items WHERE id = ? AND discord_id = ?'
  ).bind(id, discordId).run();
  return r && r.meta ? (r.meta.changes ?? 0) > 0 : false;
}

function buildRowToSaved(row) {
  let p = {};
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

export async function listGearBuilds(db, discordId) {
  await ensureGearTables(db);
  const { results } = await db.prepare(
    'SELECT id, name, target_idx, payload, created_at FROM user_gear_builds WHERE discord_id = ? ORDER BY id ASC'
  ).bind(discordId).all();
  return (results || []).map(buildRowToSaved);
}

export async function insertGearBuild(db, discordId, build) {
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
  const r = await db.prepare(
    'INSERT INTO user_gear_builds (discord_id, name, target_idx, payload, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(discordId, build.name || '', build.targetIdx || 0, payload, Date.now()).run();
  const id = r && r.meta ? (r.meta.last_row_id ?? null) : null;
  return { ...build, id, createdAt: Date.now() };
}

export async function deleteGearBuildRow(db, discordId, id) {
  await ensureGearTables(db);
  const r = await db.prepare(
    'DELETE FROM user_gear_builds WHERE id = ? AND discord_id = ?'
  ).bind(id, discordId).run();
  return r && r.meta ? (r.meta.changes ?? 0) > 0 : false;
}
