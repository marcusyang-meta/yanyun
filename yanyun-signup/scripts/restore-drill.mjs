/* ===================================================
 * Backup restore drill — the hard acceptance for the backup batch.
 *
 * Flow (all through the worker's own code paths, no raw SQL writes):
 *   1. Boot two isolated Miniflare D1 databases (source + target) and
 *      one R2 bucket. Both databases are bootstrapped from the
 *      migration chain in migrations/ — the same chain production
 *      runs — so the shapes under test are the production shapes.
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

/* Bootstrap both databases from the migration chain (migrations/*.sql
 * in filename order), split into statements the same way the drift
 * gate does. The legacy inline fixture DDL drifted from production
 * (it lacked signups.ready_at, added by PR #22, and carried phantom
 * tenants columns) — the chain is now the single shape source. */
{
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { splitSqlStatements } = await import('./ci/schema-shape.mjs');
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  if (!files.length) throw new Error('no migration files in ' + dir);
  for (const f of files) {
    const stmts = splitSqlStatements(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const d of [src, dst]) for (const stmt of stmts) await d.prepare(stmt).run();
  }
  console.log('[drill] bootstrapped src+dst from migration chain:', files.join(', '));
}

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
await db.insert(S.usageCounters).values([
  { discordId: '1001', metric: 'gear_ocr_batches', day: '2026-10-27', count: 3, updatedAt: 1700000000 },
]);
await db.insert(S.creatorBackfillLog).values([
  { eventId: 101, tenant: 'alpha', seatNickname: '甲服内名', resolvedDiscordId: '1001', outcome: 'stamped', createdAt: 1700000000 },
]);
await db.insert(S.hubAuditLog).values([
  { at: 1700000000, actor: 'hub', action: 'reminder.update', tenant: 'alpha', summary: '{"webhook":"replaced"}', ip: '203.0.113.7' },
]);
await db.insert(S.shortLinks).values([
  { code: 'drill01', tenant: 'alpha', eventId: 101, createdAt: 1700000000 },
]);
await db.insert(S.groupingTemplates).values([
  { id: 701, tenant: 'alpha', name: '演练模板', type: 'activity', title: '演练车', dungeon: '', maxSlots: 10, startDaysAhead: 1, startMinutes: 1200, creatorDiscordId: '1001', createdAt: 1700000000, updatedAt: 1700000000 },
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
