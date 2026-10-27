/* ===================================================
 * Backup restore drill — the hard acceptance for the backup batch.
 *
 * Flow (all through the worker's own code paths, no raw SQL writes):
 *   1. Boot two isolated Miniflare D1 databases (source + target) and
 *      one R2 bucket. Table shapes mirror the entity definitions in
 *      src/db/schema.ts (same attestation style as
 *      verify-repositories-d1.mjs; production structure is untouched).
 *   2. Seed the source through the data layer (drizzle inserts via the
 *      schema barrel) with at least one row per covered entity,
 *      including a BLOB guild avatar and secret-bearing rows
 *      (user_oauth refresh token, tenant webhook).
 *   3. Run the real scheduled-backup path (runBackupToR2) into R2,
 *      fetch the object back, parse it, restore into the empty target
 *      with importBackup.
 *   4. Reconcile: source counts == backup manifest counts == restored
 *      counts for EVERY covered entity, plus byte-exact spot checks
 *      (avatar blob hash, OAuth token, webhook, a JSON payload).
 * Any mismatch exits non-zero.
 *
 * Usage: node scripts/restore-drill.mjs
 * =================================================== */
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log('  PASS', name); }
  else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); console.log('  FAIL', name, extra); }
}
function eq(name, got, want) {
  check(name, JSON.stringify(got) === JSON.stringify(want),
    `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
}

const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: { SRC: 'drill-src', DST: 'drill-dst' },
  r2Buckets: { BACKUPS: 'drill-backups' },
}));
const src = await mf.getD1Database('SRC');
const dst = await mf.getD1Database('DST');
const r2 = await mf.getR2Bucket('BACKUPS');

/* Table shapes mirror src/db/schema.ts entities (see header). */
const DDL = [
  `CREATE TABLE tenants (
     slug TEXT PRIMARY KEY, guild_name TEXT NOT NULL, password_hash TEXT NOT NULL,
     announcement TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (strftime('%s','now')),
     discord_webhook TEXT NOT NULL DEFAULT '', slogan TEXT, master_name TEXT,
     logo_url TEXT, bg_image_url TEXT)`,
  `CREATE TABLE settings (
     tenant TEXT NOT NULL DEFAULT '', key TEXT NOT NULL, value TEXT NOT NULL DEFAULT '',
     PRIMARY KEY (tenant, key))`,
  `CREATE TABLE users (
     discord_id TEXT PRIMARY KEY, username TEXT NOT NULL DEFAULT '',
     avatar TEXT NOT NULL DEFAULT '', guilds_json TEXT NOT NULL DEFAULT '[]',
     guilds_checked_at INTEGER NOT NULL DEFAULT 0,
     created_at TEXT NOT NULL DEFAULT (strftime('%s','now')),
     updated_at TEXT NOT NULL DEFAULT (strftime('%s','now')), locale_pref TEXT)`,
  `CREATE TABLE user_oauth (
     discord_id TEXT PRIMARY KEY, refresh_token TEXT NOT NULL DEFAULT '',
     scope TEXT NOT NULL DEFAULT '', refresh_state TEXT NOT NULL DEFAULT 'ok',
     last_refresh_at INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE user_guild_nicks (
     discord_id TEXT NOT NULL, guild_id TEXT NOT NULL,
     nick TEXT NOT NULL DEFAULT '', updated_at INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (discord_id, guild_id))`,
  `CREATE TABLE guild_members (
     tenant TEXT NOT NULL, discord_id TEXT NOT NULL,
     nick TEXT NOT NULL DEFAULT '', global_name TEXT NOT NULL DEFAULT '',
     updated_at INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (tenant, discord_id))`,
  `CREATE TABLE events (
     id INTEGER PRIMARY KEY AUTOINCREMENT, tenant TEXT NOT NULL DEFAULT '',
     title TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'activity',
     description TEXT NOT NULL DEFAULT '', starts_at TEXT,
     meet_info TEXT NOT NULL DEFAULT '', max_slots INTEGER NOT NULL DEFAULT 20,
     status TEXT NOT NULL DEFAULT 'open', starts_at_utc INTEGER,
     origin TEXT NOT NULL DEFAULT 'admin', created_by TEXT NOT NULL DEFAULT '',
     manage_code TEXT NOT NULL DEFAULT '', dungeon TEXT NOT NULL DEFAULT '',
     creator_discord_id TEXT, reminder_sent_at INTEGER, reminder_error TEXT)`,
  `CREATE TABLE signups (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
     nickname TEXT NOT NULL, uid TEXT NOT NULL, role TEXT NOT NULL DEFAULT '随意',
     weapon TEXT NOT NULL DEFAULT '', contact TEXT NOT NULL DEFAULT '',
     note TEXT NOT NULL DEFAULT '', team_name TEXT, members TEXT,
     created_at TEXT NOT NULL DEFAULT (strftime('%s','now')), discord_id TEXT)`,
  `CREATE TABLE results (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
     team_name TEXT NOT NULL, members TEXT NOT NULL DEFAULT '',
     time_ms INTEGER NOT NULL, proof_url TEXT NOT NULL DEFAULT '',
     note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (strftime('%s','now')))`,
  `CREATE TABLE guild_avatars (
     tenant TEXT PRIMARY KEY, content_type TEXT NOT NULL,
     bytes BLOB NOT NULL, hash TEXT NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE bosses (
     id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
     talent TEXT NOT NULL DEFAULT '', source TEXT NOT NULL DEFAULT '',
     note TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0,
     dungeon TEXT NOT NULL DEFAULT '', guide TEXT NOT NULL DEFAULT '',
     mechanics_json TEXT, talents_json TEXT, shouts_json TEXT)`,
  `CREATE TABLE dungeons (
     id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE,
     size INTEGER NOT NULL DEFAULT 10, is_current INTEGER NOT NULL DEFAULT 0,
     sort_order INTEGER NOT NULL DEFAULT 0,
     video_url TEXT NOT NULL DEFAULT '', video_title TEXT NOT NULL DEFAULT '',
     season TEXT, category TEXT, level INTEGER, version TEXT)`,
  `CREATE TABLE schools (
     name TEXT, slug TEXT PRIMARY KEY, short TEXT, family TEXT,
     color TEXT, attr TEXT, talent_desc TEXT)`,
  `CREATE TABLE school_bis (
     school TEXT NOT NULL, build TEXT NOT NULL DEFAULT '',
     attr TEXT, rate TEXT, bis_json TEXT NOT NULL,
     updated_at INTEGER DEFAULT (strftime('%s','now')),
     PRIMARY KEY (school, build))`,
  `CREATE TABLE school_rotations (
     school TEXT PRIMARY KEY, rotation_json TEXT NOT NULL,
     updated_at INTEGER DEFAULT (strftime('%s','now')))`,
  `CREATE TABLE slot_affix (
     build TEXT NOT NULL, slot TEXT NOT NULL, affix_key TEXT NOT NULL,
     PRIMARY KEY (build, slot, affix_key))`,
  `CREATE TABLE affix_max (
     affix_key TEXT PRIMARY KEY, name_cn TEXT NOT NULL,
     max_value REAL NOT NULL, unit TEXT DEFAULT '')`,
  `CREATE TABLE user_gear_items (
     id INTEGER PRIMARY KEY AUTOINCREMENT, discord_id TEXT NOT NULL,
     slot TEXT NOT NULL DEFAULT '', name TEXT NOT NULL DEFAULT '',
     payload TEXT NOT NULL DEFAULT '{}', created_at INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE user_gear_builds (
     id INTEGER PRIMARY KEY AUTOINCREMENT, discord_id TEXT NOT NULL,
     name TEXT NOT NULL DEFAULT '', target_idx INTEGER NOT NULL DEFAULT 0,
     payload TEXT NOT NULL DEFAULT '{}', created_at INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE heirloom_item_pushes (
     tenant TEXT NOT NULL, discord_id TEXT NOT NULL,
     build_sig TEXT NOT NULL, item_hash TEXT NOT NULL,
     created_at INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (tenant, discord_id, build_sig, item_hash))`,
  `CREATE TABLE heirloom_set_state (
     tenant TEXT NOT NULL, discord_id TEXT NOT NULL,
     build_sig TEXT NOT NULL, complete INTEGER NOT NULL DEFAULT 0,
     updated_at INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (tenant, discord_id, build_sig))`,
  `CREATE TABLE push_tokens (
     discord_id TEXT NOT NULL, token TEXT NOT NULL,
     platform TEXT NOT NULL DEFAULT '', updated_at INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (discord_id, token))`,
  `CREATE TABLE creator_backfill_log (
     id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL,
     tenant TEXT, seat_nickname TEXT, resolved_discord_id TEXT,
     outcome TEXT NOT NULL, reason TEXT,
     created_at INTEGER NOT NULL DEFAULT 0, detail TEXT)`,
  `CREATE TABLE hub_audit_log (
     id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL,
     actor TEXT NOT NULL DEFAULT '', action TEXT NOT NULL DEFAULT '',
     tenant TEXT NOT NULL DEFAULT '', summary TEXT NOT NULL DEFAULT '',
     ip TEXT NOT NULL DEFAULT '')`,
];
for (const d of [src, dst]) for (const ddl of DDL) await d.prepare(ddl).run();

/* ---------- seed the source through the data layer ---------- */
const { createDb } = await import('../src/db/client.ts');
const S = await import('../src/db/schema.ts');
const db = createDb(src);

await db.insert(S.tenants).values([
  { slug: 'alpha', guildName: '甲百业', passwordHash: 'hash-alpha', announcement: '公告', discordWebhook: 'https://discord.com/api/webhooks/111/aaa' },
  { slug: 'beta', guildName: '乙百业', passwordHash: 'hash-beta', announcement: '' },
]);
await db.insert(S.settings).values([
  { tenant: '', key: 'game_version', value: '国际服 V2.3' },
  { tenant: 'alpha', key: 'discord_guild_id', value: '999' },
  { tenant: 'alpha', key: 'heirloom_webhook', value: 'https://discord.com/api/webhooks/222/bbb' },
]);
await db.insert(S.users).values([
  { discordId: '1001', username: '甲用户', guildsJson: '[{"id":"999"}]', localePref: 'en' },
  { discordId: '1002', username: '乙用户', guildsJson: '[]' },
]);
await db.insert(S.userOauth).values([
  { discordId: '1001', refreshToken: 'REFRESH-TOKEN-DRILL-1', scope: 'identify guilds guilds.members.read', refreshState: 'ok' },
]);
await db.insert(S.userGuildNicks).values([
  { discordId: '1001', guildId: '999', nick: '甲服内名' },
]);
await db.insert(S.guildMembers).values([
  { tenant: 'alpha', discordId: '1001', nick: '甲服内名', globalName: '甲用户' },
]);
await db.insert(S.events).values([
  { id: 101, tenant: 'alpha', title: '演练车一', type: 'activity', startsAtUtc: 1800000000, status: 'open', createdBy: '甲用户', creatorDiscordId: '1001' },
  { id: 102, tenant: 'alpha', title: '演练车二', type: 'talent', startsAtUtc: 1800100000, status: 'completed', createdBy: '甲用户', creatorDiscordId: '1001' },
]);
await db.insert(S.signups).values([
  { id: 1001, eventId: 101, nickname: '甲服内名', uid: 'u1', discordId: '1001', weapon: '破竹·风' },
  { id: 1002, eventId: 101, nickname: '乙', uid: 'u2' },
]);
await db.insert(S.results).values([
  { id: 501, eventId: 101, teamName: '一队', members: '甲,乙', timeMs: 123456 },
]);

const avatarBytes = new Uint8Array(256);
for (let i = 0; i < 256; i++) avatarBytes[i] = (i * 7 + 13) % 256;
const avatarHash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', avatarBytes))]
  .map((b) => b.toString(16).padStart(2, '0')).join('');
await db.insert(S.guildAvatars).values([
  { tenant: 'alpha', contentType: 'image/png', bytes: avatarBytes, hash: avatarHash, updatedAt: 1700000000 },
]);
await db.insert(S.bosses).values([{ id: 401, name: '演练首领', dungeon: '演练副本', mechanicsJson: '[{"t":"机制"}]' }]);
await db.insert(S.dungeons).values([{ id: 402, name: '演练副本', size: 10, isCurrent: 1, season: 'S5', level: 100 }]);
await db.insert(S.schools).values([{ slug: 'mingjin-hong', name: '鸣金·虹', family: '鸣金' }]);
await db.insert(S.schoolBis).values([{ school: '鸣金·虹', build: '默认', bisJson: '{"a":1}' }]);
await db.insert(S.schoolRotations).values([{ school: '鸣金·虹', rotationJson: '["起手"]' }]);
await db.insert(S.slotAffix).values([{ build: '默认', slot: 'weapon', affixKey: 'atk' }]);
await db.insert(S.affixMax).values([{ affixKey: 'atk', nameCn: '攻击', maxValue: 123.5, unit: '' }]);
await db.insert(S.userGearItems).values([
  { id: 601, discordId: '1001', slot: 'weapon', name: '演练剑', payload: '{"lines":[1,2]}', createdAt: 1700000000 },
]);
await db.insert(S.userGearBuilds).values([
  { id: 602, discordId: '1001', name: '演练构筑', targetIdx: 1, payload: '{"x":true}', createdAt: 1700000000 },
]);
await db.insert(S.heirloomItemPushes).values([
  { tenant: 'alpha', discordId: '1001', buildSig: 'sig1', itemHash: 'ih1', createdAt: 1700000000 },
]);
await db.insert(S.heirloomSetState).values([
  { tenant: 'alpha', discordId: '1001', buildSig: 'sig1', complete: 1, updatedAt: 1700000000 },
]);
await db.insert(S.pushTokens).values([
  { discordId: '1001', token: 'ExponentPushToken[drill]', platform: 'ios', updatedAt: 1700000000 },
]);
await db.insert(S.creatorBackfillLog).values([
  { eventId: 101, tenant: 'alpha', seatNickname: '甲服内名', resolvedDiscordId: '1001', outcome: 'stamped', createdAt: 1700000000 },
]);
await db.insert(S.hubAuditLog).values([
  { at: 1700000000, actor: 'hub', action: 'reminder.update', tenant: 'alpha', summary: '{"webhook":"replaced"}', ip: '203.0.113.7' },
]);

/* ---------- backup via the production path, restore, reconcile ---------- */
const backup = await import('../src/domains/platform/backup.ts');
const svc = await import('../src/domains/platform/backup-service.ts');

const srcCounts = await backup.countEntities(src);
const run = await svc.runBackupToR2({ DB: src, BACKUPS: r2 }, 'manual');
check('backup run stored one object', !!run.key && run.key.startsWith('manual/'), run.key);
const obj = await r2.get(run.key);
check('stored object readable from R2', !!obj);
const file = backup.parseBackup(await obj.text());
eq('manifest total rows', backup.backupTotalRows(file), run.totalRows);

await backup.importBackup(dst, file);
const dstCounts = await backup.countEntities(dst);
const manifest = backup.backupCounts(file);

console.log('\n  entity                 src  file  dst');
let allEqual = true;
for (const [key] of backup.BACKUP_ENTITIES) {
  const a = srcCounts[key], b = manifest[key], c = dstCounts[key];
  console.log(`  ${key.padEnd(22)} ${String(a).padStart(3)} ${String(b).padStart(5)} ${String(c).padStart(4)}`);
  if (!(a === b && b === c)) allEqual = false;
  if (a < 1) { allEqual = false; console.log(`  FAIL seed coverage: ${key} has no rows`); fail++; fails.push('seed coverage ' + key); }
}
check('per-entity counts reconcile (source == file == restored)', allEqual);

/* Spot checks: the risky payloads must survive byte-exact. */
const dstDb = createDb(dst);
const av = await dstDb.select().from(S.guildAvatars);
eq('restored avatar row count', av.length, 1);
const avBytes = av[0].bytes instanceof Uint8Array ? av[0].bytes : new Uint8Array(av[0].bytes);
const avHash2 = [...new Uint8Array(await crypto.subtle.digest('SHA-256', avBytes))]
  .map((b) => b.toString(16).padStart(2, '0')).join('');
eq('avatar blob bytes hash roundtrip', avHash2, avatarHash);
const oauth = await dstDb.select().from(S.userOauth);
eq('oauth refresh token roundtrip', oauth[0].refreshToken, 'REFRESH-TOKEN-DRILL-1');
const tn = await dstDb.select().from(S.tenants);
eq('tenant webhook roundtrip', tn.find((t) => t.slug === 'alpha').discordWebhook, 'https://discord.com/api/webhooks/111/aaa');
const gear = await dstDb.select().from(S.userGearItems);
eq('gear payload roundtrip', gear[0].payload, '{"lines":[1,2]}');
const affix = await dstDb.select().from(S.affixMax);
eq('real column roundtrip', affix[0].maxValue, 123.5);

/* The exclusion contract: error_log is not part of the format. */
check('error_log excluded from backup entities', !('error_log' in file.entities));

await mf.dispose();
console.log(`\n== restore-drill: ${pass} passed, ${fail} failed ==`);
if (fail) { console.log('FAILS:', fails.join(' | ')); process.exit(1); }
