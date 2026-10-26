/* ===================================================
 * 数据层 repository 真 D1 验证 (本地 Miniflare D1, 真 SQLite 语义)。
 *
 * 背景: harness 的 FakeDB 是按 SQL 形状路由的内存替身, 测不出真
 * SQLite 的语法/语义问题 (一期表限定列名 upsert bug 就是假库全绿、
 * 真 D1 首跑才暴露)。本脚本把各 repository 的写路径与关键读路径
 * 在真 D1 上逐条跑一遍并断言结果。表结构按 src/db/schema.ts 的
 * 实体定义镜像 (生产结构零变更, 这里只是本地验证夹具)。
 *
 * 用法: node scripts/verify-repositories-d1.mjs [section]
 *   section 省略 = 全部; 目前有 tenants / events / gear / users / members / results 六段,
 *   随数据层迁移进度增补。退出码非 0 = 有断言失败。
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
  d1Databases: { DB: 'verify-repositories' },
}));
const db = await mf.getD1Database('DB');

const DDL = [
  `CREATE TABLE tenants (
     slug TEXT PRIMARY KEY, guild_name TEXT NOT NULL, password_hash TEXT NOT NULL,
     announcement TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (strftime('%s','now')),
     discord_webhook TEXT NOT NULL DEFAULT '', slogan TEXT, master_name TEXT,
     logo_url TEXT, bg_image_url TEXT, feature_fixed_teams INTEGER)`,
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
  `CREATE UNIQUE INDEX signups_event_uid_unique ON signups(event_id, uid)`,
  `CREATE TABLE results (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
     team_name TEXT NOT NULL, members TEXT NOT NULL DEFAULT '',
     time_ms INTEGER NOT NULL, proof_url TEXT NOT NULL DEFAULT '',
     note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (strftime('%s','now')))`,
  `CREATE TABLE settings (
     tenant TEXT NOT NULL DEFAULT '', key TEXT NOT NULL, value TEXT NOT NULL DEFAULT '',
     PRIMARY KEY (tenant, key))`,
  `CREATE TABLE user_gear_items (
     id INTEGER PRIMARY KEY AUTOINCREMENT, discord_id TEXT NOT NULL,
     slot TEXT NOT NULL DEFAULT '', name TEXT NOT NULL DEFAULT '',
     payload TEXT NOT NULL DEFAULT '{}', created_at INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE user_gear_builds (
     id INTEGER PRIMARY KEY AUTOINCREMENT, discord_id TEXT NOT NULL,
     name TEXT NOT NULL DEFAULT '', target_idx INTEGER NOT NULL DEFAULT 0,
     payload TEXT NOT NULL DEFAULT '{}', created_at INTEGER NOT NULL DEFAULT 0)`,
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
];
for (const ddl of DDL) await db.prepare(ddl).run();

const section = process.argv[2] || 'all';
const want = (s) => section === 'all' || section === s;

/* ---------------- tenants ---------------- */
if (want('tenants')) {
  console.log('== tenants repository on real D1 ==');
  const repo = await import('../src/db/repositories/tenants.ts');

  await repo.insertTenant(db, { slug: 'alpha', guildName: '甲百业', passwordHash: 'h1', announcement: '' });
  await repo.insertTenant(db, { slug: 'beta', guildName: '乙百业', passwordHash: 'h2', announcement: '公告乙' });

  const row = await repo.getTenantRow(db, 'alpha');
  check('insert+getTenantRow roundtrip', !!row && row.slug === 'alpha' && row.guild_name === '甲百业' && row.password_hash === 'h1');
  check('created_at default filled by DB', !!row && typeof row.created_at === 'string' && row.created_at.length >= 9, JSON.stringify(row && row.created_at));
  eq('discord_webhook default empty', row && row.discord_webhook, '');
  eq('getTenantRow missing -> null', await repo.getTenantRow(db, 'nope'), null);
  eq('getTenantSlug hit', await repo.getTenantSlug(db, 'beta'), { slug: 'beta' });
  eq('getTenantSlug missing -> null', await repo.getTenantSlug(db, 'nope'), null);

  const slugs = await repo.listTenantSlugs(db);
  eq('listTenantSlugs both', slugs.map((r) => r.slug).sort(), ['alpha', 'beta']);
  const dir = await repo.listTenantsDirectory(db);
  check('listTenantsDirectory shape', dir.length === 2 && dir.every((r) => 'guild_name' in r && 'slogan' in r && 'created_at' in r));
  const names = await repo.listTenantNames(db);
  eq('listTenantNames', names.map((r) => r.slug).sort(), ['alpha', 'beta']);

  // events for the hub-admin composite count
  await db.prepare("INSERT INTO events (tenant, title) VALUES ('alpha', '车一'), ('alpha', '车二'), ('beta', '车三')").run();
  const hub = await repo.listTenantsHubAdmin(db);
  const alphaHub = hub.find((r) => r.slug === 'alpha');
  const betaHub = hub.find((r) => r.slug === 'beta');
  eq('hubAdmin event_count alpha', alphaHub && alphaHub.event_count, 2);
  eq('hubAdmin event_count beta', betaHub && betaHub.event_count, 1);

  await repo.updateTenantWebhook(db, 'alpha', 'https://discord.com/api/webhooks/1/x');
  eq('updateTenantWebhook', (await repo.getTenantRow(db, 'alpha'))?.discord_webhook, 'https://discord.com/api/webhooks/1/x');

  await repo.updateTenantProfile(db, 'alpha', {
    guildName: '甲改', announcement: '新公告', slogan: '口号', masterName: '掌门', logoUrl: 'http://l', bgImageUrl: 'http://b',
  });
  const prof = await repo.getTenantRow(db, 'alpha');
  check('updateTenantProfile all six', !!prof && prof.guild_name === '甲改' && prof.announcement === '新公告'
    && prof.slogan === '口号' && prof.master_name === '掌门' && prof.logo_url === 'http://l' && prof.bg_image_url === 'http://b');

  await repo.updateTenantFixedTeams(db, 'alpha', 1);
  eq('updateTenantFixedTeams 1', (await repo.getTenantRow(db, 'alpha'))?.feature_fixed_teams, 1);
  await repo.updateTenantFixedTeams(db, 'alpha', 0);
  eq('updateTenantFixedTeams 0', (await repo.getTenantRow(db, 'alpha'))?.feature_fixed_teams, 0);

  // cascade: seed signups + results under alpha's events and beta's event
  const evA = await db.prepare("SELECT id FROM events WHERE tenant='alpha' LIMIT 1").first();
  const evB = await db.prepare("SELECT id FROM events WHERE tenant='beta' LIMIT 1").first();
  await db.prepare('INSERT INTO signups (event_id, nickname, uid) VALUES (?, ?, ?), (?, ?, ?)')
    .bind(evA.id, '甲一', 'u1', evB.id, '乙一', 'u2').run();
  await db.prepare('INSERT INTO results (event_id, team_name, time_ms) VALUES (?, ?, ?), (?, ?, ?)')
    .bind(evA.id, '队甲', 1000, evB.id, '队乙', 2000).run();
  await repo.deleteTenantCascade(db, 'alpha');
  eq('cascade removes tenant', await repo.getTenantRow(db, 'alpha'), null);
  const leftEvents = await db.prepare("SELECT COUNT(*) AS c FROM events WHERE tenant='alpha'").first();
  const leftSignups = await db.prepare('SELECT COUNT(*) AS c FROM signups WHERE event_id = ?').bind(evA.id).first();
  const leftResults = await db.prepare('SELECT COUNT(*) AS c FROM results WHERE event_id = ?').bind(evA.id).first();
  eq('cascade removes events', leftEvents.c, 0);
  eq('cascade removes signups', leftSignups.c, 0);
  eq('cascade removes results', leftResults.c, 0);
  const betaAlive = await repo.getTenantRow(db, 'beta');
  const betaSignups = await db.prepare('SELECT COUNT(*) AS c FROM signups WHERE event_id = ?').bind(evB.id).first();
  check('cascade leaves other tenant intact', !!betaAlive && betaSignups.c === 1);
}

/* ---------------- events + signups ---------------- */
if (want('events')) {
  console.log('== events/signups repositories on real D1 ==');
  const evRepo = await import('../src/db/repositories/events.ts');
  const suRepo = await import('../src/db/repositories/signups.ts');
  const NOW = 1_800_000_000;

  const ins1 = await evRepo.insertEvent(db, {
    tenant: 'gamma', title: '草稿车', type: 'talent', description: '', starts_at: '', starts_at_utc: NOW + 3600,
    max_slots: 5, status: 'draft', origin: 'member', created_by: '热心车友', creator_discord_id: '111',
  });
  check('insertEvent returns last_row_id', ins1.last_row_id > 0, JSON.stringify(ins1));
  const ev1 = await evRepo.getEventRow(db, ins1.last_row_id);
  check('getEventRow roundtrip', !!ev1 && ev1.title === '草稿车' && ev1.status === 'draft' && ev1.creator_discord_id === '111');
  eq('getEventRow missing -> null', await evRepo.getEventRow(db, 99999), null);
  check('getEventRowByTenant hit', !!(await evRepo.getEventRowByTenant(db, ins1.last_row_id, 'gamma')));
  eq('getEventRowByTenant wrong tenant -> null', await evRepo.getEventRowByTenant(db, ins1.last_row_id, 'alpha'), null);
  eq('getEventIdByTenant', await evRepo.getEventIdByTenant(db, ins1.last_row_id, 'gamma'), { id: ins1.last_row_id });
  eq('getEventIdStatusByTenant', await evRepo.getEventIdStatusByTenant(db, ins1.last_row_id, 'gamma'),
    { id: ins1.last_row_id, status: 'draft' });
  eq('getEventTenantCreator', await evRepo.getEventTenantCreator(db, ins1.last_row_id),
    { id: ins1.last_row_id, tenant: 'gamma', creator_discord_id: '111' });
  eq('getEventTenant', await evRepo.getEventTenant(db, ins1.last_row_id), { id: ins1.last_row_id, tenant: 'gamma' });

  let threw = false;
  try { await evRepo.insertEvent(db, { tenant: 'x', bogus_col: 1 }); } catch { threw = true; }
  check('insertEvent unknown column throws', threw);
  threw = false;
  try { await suRepo.insertSignup(db, { event_id: 1, bogus: 2 }); } catch { threw = true; }
  check('insertSignup unknown column throws', threw);

  // publish the draft via generic field update (tenant-scoped)
  const upd = await evRepo.updateEventFields(db, ins1.last_row_id, 'gamma', { status: 'open', title: '正式车' });
  eq('updateEventFields changes', upd.changes, 1);
  const ev1b = await evRepo.getEventRow(db, ins1.last_row_id);
  check('updateEventFields applied', !!ev1b && ev1b.status === 'open' && ev1b.title === '正式车');
  const updBad = await evRepo.updateEventFields(db, ins1.last_row_id, 'alpha', { title: '不该改' });
  eq('updateEventFields wrong tenant changes=0', updBad.changes, 0);

  // more events for list windows
  const ins2 = await evRepo.insertEvent(db, {
    tenant: 'gamma', title: '已完成车', type: 'activity', description: '', starts_at: '', starts_at_utc: NOW + 7200,
    max_slots: 10, status: 'completed', origin: 'member', created_by: 'x', dungeon: '', creator_discord_id: null,
  });
  const ins3 = await evRepo.insertEvent(db, {
    tenant: 'gamma', title: '活动车', type: 'activity', description: '', starts_at: '', starts_at_utc: NOW + 1800,
    max_slots: 10, status: 'open', origin: 'admin', created_by: '', dungeon: '定极分更', creator_discord_id: null,
  });

  // signups on ev1 (2 seats, one healer) and ev3 (1 seat)
  const s1 = await suRepo.insertSignup(db, { event_id: ins1.last_row_id, nickname: '甲', uid: 'u1', role: '输出', weapon: '破竹·风' });
  check('insertSignup last_row_id', s1.last_row_id > 0);
  await suRepo.insertSignups(db, [
    { event_id: ins1.last_row_id, nickname: '乙', uid: 'u2', role: '奶', weapon: '牵丝·霖', discord_id: '222' },
    { event_id: ins3.last_row_id, nickname: '丙', uid: 'u3', role: '输出', weapon: '鸣金·虹' },
  ]);
  eq('countSignupsByEvent', await suRepo.countSignupsByEvent(db, ins1.last_row_id), 2);
  const seats = await suRepo.listSignupsByEvent(db, ins1.last_row_id);
  check('listSignupsByEvent order+rows', seats.length === 2 && seats[0].nickname === '甲' && seats[1].discord_id === '222');
  const detail = await suRepo.listSignupDetailRows(db, ins1.last_row_id);
  check('listSignupDetailRows shape', detail.length === 2 && 'team_name' in detail[0] && 'created_at' in detail[0]);
  const seatsG = await suRepo.listSignupSeats(db, ins1.last_row_id);
  check('listSignupSeats shape', seatsG.length === 2 && seatsG[1].discord_id === '222' && seatsG[0].uid === 'u1');
  const seatsB = await suRepo.listSignupSeatsBasic(db, ins1.last_row_id);
  check('listSignupSeatsBasic shape', seatsB.length === 2 && !('discord_id' in seatsB[0]));
  const stamps = await suRepo.listSignupNamesStamps(db, ins1.last_row_id);
  check('listSignupNamesStamps', stamps.length === 2 && stamps.some((r) => r.nickname === '乙' && r.discord_id === '222'));
  const remSeats = await suRepo.listSignupSeatsForReminder(db, ins1.last_row_id);
  check('listSignupSeatsForReminder', remSeats.length === 2 && remSeats[0].weapon === '破竹·风');
  const stats = await suRepo.getSignupCapacityStats(db, ins1.last_row_id);
  eq('capacity stats c/h/m', stats, { c: 2, h: 1, m: 5 });
  check('getSignupTenant hit', !!(await suRepo.getSignupTenant(db, s1.last_row_id, 'gamma')));
  eq('getSignupTenant wrong tenant -> null', await suRepo.getSignupTenant(db, s1.last_row_id, 'alpha'), null);

  // week view: draft excluded, completed excluded, signup_count present
  const week = await evRepo.listEventsWeekView(db, { tenant: 'gamma' });
  check('weekView excludes completed', week.every((e) => e.status !== 'completed' && e.status !== 'draft'));
  check('weekView has open cars', week.some((e) => e.id === ins1.last_row_id) && week.some((e) => e.id === ins3.last_row_id));
  const wv1 = week.find((e) => e.id === ins1.last_row_id);
  eq('weekView signup_count', wv1 && wv1.signup_count, 2);
  const weekTyped = await evRepo.listEventsWeekView(db, { tenant: 'gamma', type: 'activity' });
  check('weekView type filter', weekTyped.length === 1 && weekTyped[0].id === ins3.last_row_id);
  const weekWin = await evRepo.listEventsWeekView(db, { tenant: 'gamma', from: NOW + 3000, to: NOW + 4000 });
  check('weekView window filter', weekWin.length === 1 && weekWin[0].id === ins1.last_row_id);
  const admin = await evRepo.listEventsAdmin(db, 'gamma');
  check('listEventsAdmin all statuses + desc', admin.length === 3 && admin[0].id === ins3.last_row_id
    && admin.some((e) => e.status === 'completed'));
  eq('countActivityEventsInWindow', await evRepo.countActivityEventsInWindow(db, 'gamma', NOW, NOW + 86400), 1);

  // status flow
  await evRepo.setEventStatus(db, ins2.last_row_id, 'open');
  eq('setEventStatus', (await evRepo.getEventRow(db, ins2.last_row_id))?.status, 'open');
  await evRepo.setEventStatus(db, ins2.last_row_id, 'completed');

  // reminder scheduling: ev1 open at NOW+3600 unsettled; ev3 open at NOW+1800 unsettled
  eq('nextPendingReminderStart = earliest', await evRepo.nextPendingReminderStart(db, 'gamma', NOW), NOW + 1800);
  const due0 = await evRepo.listDueReminderEvents(db, 'gamma', NOW, 600);
  eq('dueReminders none before lead window', due0.length, 0);
  const due1 = await evRepo.listDueReminderEvents(db, 'gamma', NOW + 1500, 600);
  check('dueReminders hits ev3 in window', due1.length === 1 && due1[0].id === ins3.last_row_id);
  await evRepo.markReminderSent(db, ins3.last_row_id, NOW + 1500);
  eq('markReminderSent settles', (await evRepo.getEventRow(db, ins3.last_row_id))?.reminder_sent_at, NOW + 1500);
  eq('nextPending after settle', await evRepo.nextPendingReminderStart(db, 'gamma', NOW), NOW + 3600);
  await evRepo.markReminderError(db, ins1.last_row_id, 'Webhook 返回 404');
  eq('markReminderError settles', (await evRepo.getEventRow(db, ins1.last_row_id))?.reminder_error, 'Webhook 返回 404');
  eq('nextPending none left', await evRepo.nextPendingReminderStart(db, 'gamma', NOW), null);

  // signup updates/deletes with changes semantics
  const wUpd = await suRepo.updateSignupWeaponRoleById(db, s1.last_row_id, ins1.last_row_id, '牵丝·霖', '奶');
  eq('updateSignupWeaponRoleById changes', wUpd.changes, 1);
  const stats2 = await suRepo.getSignupCapacityStats(db, ins1.last_row_id);
  eq('capacity stats after role change h=2', stats2 && stats2.h, 2);
  const seat3 = await suRepo.listSignupsByEvent(db, ins3.last_row_id);
  const wUpd2 = await suRepo.updateSignupWeaponRoleByUid(db, ins3.last_row_id, 'u3', '裂石·威', '输出');
  eq('updateSignupWeaponRoleByUid changes', wUpd2.changes, 1);
  const delUid = await suRepo.deleteSignupByEventUid(db, ins3.last_row_id, 'u3');
  eq('deleteSignupByEventUid changes', delUid.changes, 1);
  eq('countSignupsByEvent after uid delete', await suRepo.countSignupsByEvent(db, ins3.last_row_id), 0);
  const delEvt = await suRepo.deleteSignupByIdAndEvent(db, s1.last_row_id, ins1.last_row_id);
  eq('deleteSignupByIdAndEvent changes', delEvt.changes, 1);
  const rest = await suRepo.listSignupsByEvent(db, ins1.last_row_id);
  const delNick = await suRepo.deleteSignupByEventNickUid(db, ins1.last_row_id, rest[0].nickname, rest[0].uid);
  eq('deleteSignupByEventNickUid changes', delNick.changes, 1);
  const solo = await suRepo.insertSignup(db, { event_id: ins2.last_row_id, nickname: '丁', uid: 'u9', role: '输出', weapon: '' });
  const delId = await suRepo.deleteSignupById(db, solo.last_row_id);
  eq('deleteSignupById changes', delId.changes, 1);
  await suRepo.insertSignup(db, { event_id: ins2.last_row_id, nickname: '戊', uid: 'u10', role: '输出', weapon: '' });
  const delAll = await suRepo.deleteSignupsByEvent(db, ins2.last_row_id);
  eq('deleteSignupsByEvent changes', delAll.changes, 1);

  // cascade delete (no tenant condition + tenant condition)
  await suRepo.insertSignup(db, { event_id: ins3.last_row_id, nickname: '己', uid: 'u11', role: '输出', weapon: '' });
  await db.prepare('INSERT INTO results (event_id, team_name, time_ms) VALUES (?, ?, ?)').bind(ins3.last_row_id, '队', 123).run();
  await evRepo.deleteEventCascade(db, ins3.last_row_id, null);
  eq('cascade removes event', await evRepo.getEventRow(db, ins3.last_row_id), null);
  eq('cascade removes its signups', await suRepo.countSignupsByEvent(db, ins3.last_row_id), 0);
  const resLeft = await db.prepare('SELECT COUNT(*) AS c FROM results WHERE event_id = ?').bind(ins3.last_row_id).first();
  eq('cascade removes its results', resLeft.c, 0);
  await evRepo.deleteEventCascade(db, ins2.last_row_id, 'gamma');
  eq('cascade with tenant removes event', await evRepo.getEventRow(db, ins2.last_row_id), null);
  check('cascade leaves ev1', !!(await evRepo.getEventRow(db, ins1.last_row_id)));
}

/* ---------------- gear ---------------- */
if (want('gear')) {
  console.log('== gear repository + gearstore on real D1 ==');
  const repo = await import('../src/db/repositories/gear.ts');
  const store = await import('../src/gearstore.ts');

  const ins = await repo.insertGearItemRow(db, {
    discordId: 'U1', slot: 'weapon', name: '测试剑', payload: '{"lines":[1]}', createdAt: 1000,
  });
  check('insertGearItemRow last_row_id', ins.last_row_id > 0);
  await repo.insertGearItemRow(db, {
    discordId: 'U2', slot: 'armor', name: '他人甲', payload: '{}', createdAt: 1001,
  });
  const rows = await repo.listGearItemRows(db, 'U1');
  check('listGearItemRows owner-scoped', rows.length === 1 && rows[0].name === '测试剑' && rows[0].payload === '{"lines":[1]}');
  const upd = await repo.updateGearItemRow(db, 'U1', ins.last_row_id, { slot: 'weapon2', name: '改名剑', payload: '{"lines":[2]}' });
  eq('updateGearItemRow changes', upd.changes, 1);
  const updOther = await repo.updateGearItemRow(db, 'U2', ins.last_row_id, { slot: 'x', name: 'x', payload: '{}' });
  eq('updateGearItemRow wrong owner changes=0', updOther.changes, 0);
  const rows2 = await repo.listGearItemRows(db, 'U1');
  check('updateGearItemRow applied', rows2.length === 1 && rows2[0].name === '改名剑' && rows2[0].slot === 'weapon2');

  const bIns = await repo.insertGearBuildRow(db, {
    discordId: 'U1', name: '方案一', targetIdx: 3, payload: '{"buildLabel":"L"}', createdAt: 2000,
  });
  check('insertGearBuildRow last_row_id', bIns.last_row_id > 0);
  const builds = await repo.listGearBuildRows(db, 'U1');
  check('listGearBuildRows', builds.length === 1 && builds[0].target_idx === 3 && builds[0].created_at === 2000);
  const bDelOther = await repo.deleteGearBuildRow(db, 'U2', bIns.last_row_id);
  eq('deleteGearBuildRow wrong owner changes=0', bDelOther.changes, 0);
  const bDel = await repo.deleteGearBuildRow(db, 'U1', bIns.last_row_id);
  eq('deleteGearBuildRow changes', bDel.changes, 1);
  const del = await repo.deleteGearItemRow(db, 'U1', ins.last_row_id);
  eq('deleteGearItemRow changes', del.changes, 1);
  eq('listGearItemRows empty after delete', (await repo.listGearItemRows(db, 'U1')).length, 0);

  // gearstore domain mapping over the same real D1
  const g1 = await store.insertGearItem(db, 'U9', {
    slot: 'helm', name: '盔', lines: [{ k: 'a' }], dingyin: { t: 1 }, schools: ['鸣金·虹'], warnings: [],
  });
  check('gearstore insertGearItem returns id', !!g1.id);
  const gList = await store.listGearItems(db, 'U9');
  check('gearstore listGearItems maps payload', gList.length === 1 && gList[0].name === '盔'
    && Array.isArray(gList[0].lines) && gList[0].lines.length === 1 && gList[0].schools[0] === '鸣金·虹');
  const gUpd = await store.updateGearItemRow(db, 'U9', g1.id, { slot: 'helm', name: '盔2', lines: [], dingyin: null, schools: [], warnings: [] });
  check('gearstore updateGearItemRow hit', !!gUpd && gUpd.name === '盔2');
  const gUpdMiss = await store.updateGearItemRow(db, 'U8', g1.id, { slot: 'helm', name: 'x', lines: [] });
  eq('gearstore updateGearItemRow wrong owner -> null', gUpdMiss, null);
  eq('gearstore deleteGearItemRow', await store.deleteGearItemRow(db, 'U9', g1.id), true);
  eq('gearstore deleteGearItemRow again -> false', await store.deleteGearItemRow(db, 'U9', g1.id), false);

  const gb = await store.insertGearBuild(db, 'U9', {
    name: '毕业配装', targetIdx: 1, buildLabel: '裂石钧', loadout: { a: 1 }, baseValues: {},
    xinfa: [], extras: { res: 1.85, acc: 0, crit: 0, int: 0 }, bowKind: '', gradDingyinOn: true, snapshot: null,
  });
  check('gearstore insertGearBuild returns id+createdAt', !!gb.id && gb.createdAt > 0);
  const gbList = await store.listGearBuilds(db, 'U9');
  check('gearstore listGearBuilds maps payload', gbList.length === 1 && gbList[0].buildLabel === '裂石钧'
    && gbList[0].targetIdx === 1 && gbList[0].gradDingyinOn === true);
  eq('gearstore deleteGearBuildRow', await store.deleteGearBuildRow(db, 'U9', gb.id), true);
}

/* ---------------- users / oauth / nicks ---------------- */
if (want('users')) {
  console.log('== users repository on real D1 ==');
  const repo = await import('../src/db/repositories/users.ts');

  // 懒 DDL 本体在真 D1 上可执行 (表已由夹具建好, IF NOT EXISTS 幂等)
  await repo.ensureUsersTable(db);
  await repo.ensureUsersLocaleColumn(db);
  await repo.ensureNickStoreTables(db);
  check('lazy DDL ensures execute on real D1', true);

  await repo.upsertUserOnLogin(db, {
    discordId: 'U1', username: '全局甲', avatar: 'a.png',
    guildsJson: '[{"id":"G1","name":"服一"}]', checkedAtSec: 111,
  });
  await repo.upsertUserOnLogin(db, {
    discordId: 'U1', username: '全局甲改', avatar: 'b.png',
    guildsJson: '[{"id":"G1"},{"id":"G2"}]', checkedAtSec: 222,
  });
  await repo.upsertUserOnLogin(db, {
    discordId: 'U2', username: '全局乙', avatar: '', guildsJson: '[]', checkedAtSec: 100,
  });
  const nameRow = await repo.getUsernameRow(db, 'U1');
  eq('upsertUserOnLogin conflict updates username', nameRow && nameRow.username, '全局甲改');
  eq('getUsernameRow missing -> null', await repo.getUsernameRow(db, 'nope'), null);
  eq('getUserGuildsJson updated', await repo.getUserGuildsJson(db, 'U1'), '[{"id":"G1"},{"id":"G2"}]');
  eq('getUserGuildsJson missing -> null', await repo.getUserGuildsJson(db, 'nope'), null);
  const dir = await repo.listUsersDirectory(db);
  eq('listUsersDirectory both users', dir.map((r) => r.discord_id).sort(), ['U1', 'U2']);
  check('listUsersDirectory shape', dir.every((r) => 'username' in r && 'guilds_json' in r));

  eq('locale pref default null', await repo.getUserLocalePref(db, 'U1'), null);
  await repo.setUserLocalePref(db, 'U1', 'en');
  eq('setUserLocalePref roundtrip', await repo.getUserLocalePref(db, 'U1'), 'en');
  await repo.setUserLocalePref(db, 'U1', null);
  eq('setUserLocalePref back to null', await repo.getUserLocalePref(db, 'U1'), null);

  await repo.upsertOAuthOnLogin(db, { discordId: 'U1', refreshToken: 'rt1', scope: 'identify guilds', nowSec: 1000 });
  let grant = await repo.getOAuthGrant(db, 'U1');
  check('upsertOAuthOnLogin state ok', !!grant && grant.refresh_token === 'rt1' && grant.refresh_state === 'ok');
  await repo.markOAuthNeedsRelogin(db, 'U1', 1001);
  grant = await repo.getOAuthGrant(db, 'U1');
  eq('markOAuthNeedsRelogin', grant && grant.refresh_state, 'needs_relogin');
  await repo.updateOAuthAfterRefresh(db, 'U1', { refreshToken: 'rt2', scope: 'identify guilds guilds.members.read', nowSec: 1002 });
  const refresh = await repo.getOAuthRefresh(db, 'U1');
  check('updateOAuthAfterRefresh rotates token + resets state',
    !!refresh && refresh.refresh_token === 'rt2' && refresh.refresh_state === 'ok');
  eq('getOAuthGrant missing -> null', await repo.getOAuthGrant(db, 'nope'), null);

  await repo.upsertNick(db, 'U1', 'G1', '服内甲', 500);
  await repo.upsertNick(db, 'U1', 'G1', '服内甲二', 600);
  await repo.upsertNick(db, 'U1', 'G2', '另一服', 500);
  await repo.upsertNick(db, 'U2', 'G1', '服内乙', 500);
  const nick = await repo.getNickRow(db, 'U1', 'G1');
  eq('upsertNick conflict updates nick', nick && nick.nick, '服内甲二');
  eq('getNickRow missing -> null', await repo.getNickRow(db, 'U1', 'GX'), null);
  await repo.touchNick(db, 'U1', 'G1', 700);
  const nick2 = await repo.getNickRow(db, 'U1', 'G1');
  eq('touchNick keeps nick', nick2 && nick2.nick, '服内甲二');
  await repo.touchNick(db, 'U3', 'G1', 700);
  const nick3 = await repo.getNickRow(db, 'U3', 'G1');
  eq('touchNick inserts empty snapshot', nick3 && nick3.nick, '');
  const byUser = await repo.listNickRowsByUser(db, 'U1');
  eq('listNickRowsByUser', byUser.map((r) => r.guild_id).sort(), ['G1', 'G2']);
  const byGuild = await repo.listNicksByGuild(db, 'G1');
  eq('listNicksByGuild', byGuild.map((r) => r.discord_id).sort(), ['U1', 'U2', 'U3']);
  const allNicks = await repo.listAllNicks(db);
  eq('listAllNicks count', allNicks.length, 4);
}

/* ---------------- guild_members ---------------- */
if (want('members')) {
  console.log('== guild_members repository on real D1 ==');
  const repo = await import('../src/db/repositories/guildMembers.ts');

  await repo.ensureGuildMembersTable(db);
  await repo.upsertGuildMember(db, 'alpha', 'U1', '服内甲', '全局甲');
  await repo.upsertGuildMember(db, 'alpha', 'U1', '服内甲改', '全局甲改');
  await repo.upsertGuildMember(db, 'alpha', 'U2', '', '全局乙');
  await repo.upsertGuildMember(db, 'beta', 'U1', '乙服甲', '全局甲');

  const m = await repo.getGuildMember(db, 'alpha', 'U1');
  check('upsertGuildMember conflict updates nick/global', !!m && m.nick === '服内甲改' && m.global_name === '全局甲改');
  eq('getGuildMember missing -> null', await repo.getGuildMember(db, 'alpha', 'nope'), null);
  eq('getGuildMember tenant isolation', await repo.getGuildMember(db, 'beta', 'U2'), null);
  const list = await repo.listGuildMembers(db, 'alpha');
  eq('listGuildMembers tenant-scoped', list.map((r) => r.discord_id).sort(), ['U1', 'U2']);
  const betaList = await repo.listGuildMembers(db, 'beta');
  check('listGuildMembers other tenant separate', betaList.length === 1 && betaList[0].nick === '乙服甲');
  eq('hasGuildMember true', await repo.hasGuildMember(db, 'alpha', 'U2'), true);
  eq('hasGuildMember false', await repo.hasGuildMember(db, 'beta', 'U2'), false);
}

/* ---------------- results ---------------- */
if (want('results')) {
  console.log('== results repository on real D1 ==');
  const repo = await import('../src/db/repositories/results.ts');
  const evRepo = await import('../src/db/repositories/events.ts');
  const tnRepo = await import('../src/db/repositories/tenants.ts');

  await tnRepo.insertTenant(db, { slug: 'r-one', guildName: '丙百业', passwordHash: 'h3', announcement: '' });
  await tnRepo.insertTenant(db, { slug: 'r-two', guildName: '丁百业', passwordHash: 'h4', announcement: '' });
  const ev1 = await evRepo.insertEvent(db, {
    tenant: 'r-one', title: '丙车', type: 'race', description: '', starts_at: '', starts_at_utc: 1700000000,
    max_slots: 5, status: 'open', origin: 'admin', created_by: 't', creator_discord_id: null,
  });
  const ev2 = await evRepo.insertEvent(db, {
    tenant: 'r-two', title: '丁车', type: 'race', description: '', starts_at: '', starts_at_utc: 1700000000,
    max_slots: 5, status: 'open', origin: 'admin', created_by: 't', creator_discord_id: null,
  });

  const rSlow = await repo.insertResult(db, { eventId: ev1.last_row_id, teamName: '慢队', members: 'a,b', timeMs: 300000, proofUrl: '', note: '' });
  const rFast = await repo.insertResult(db, { eventId: ev1.last_row_id, teamName: '快队', members: 'c,d', timeMs: 200000, proofUrl: 'p', note: 'n' });
  check('insertResult last_row_id', rSlow.last_row_id > 0 && rFast.last_row_id > rSlow.last_row_id);
  const list = await repo.listResultsByEvent(db, ev1.last_row_id);
  eq('listResultsByEvent ordered by time_ms', list.map((r) => r.team_name), ['快队', '慢队']);
  eq('listResultsByEvent empty for other event', await repo.listResultsByEvent(db, ev2.last_row_id), []);

  eq('ownership check wrong tenant -> null', await repo.getResultIdOwnedByTenant(db, rFast.last_row_id, 'r-two'), null);
  const own = await repo.getResultIdOwnedByTenant(db, rFast.last_row_id, 'r-one');
  check('ownership check right tenant', !!own && own.id === rFast.last_row_id);
  const del = await repo.deleteResultById(db, rFast.last_row_id);
  eq('deleteResultById changes', del.changes, 1);
  eq('deleteResultById again changes=0', (await repo.deleteResultById(db, rFast.last_row_id)).changes, 0);
  eq('list after delete', (await repo.listResultsByEvent(db, ev1.last_row_id)).map((r) => r.team_name), ['慢队']);
}

await mf.dispose();
console.log(`\n== verify-repositories-d1: ${pass} passed, ${fail} failed ==`);
if (fail) { console.log('FAILS:', fails.join(' | ')); process.exit(1); }
