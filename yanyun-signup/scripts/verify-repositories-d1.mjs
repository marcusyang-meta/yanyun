/* ============================================ * Data-layer repository verification against real D1 (local Miniflare
 * D1, real SQLite semantics).
 *
 * Background: the harness FakeDB is an in-memory double routed by SQL
 * shape; it cannot catch real SQLite syntax/semantics problems (the
 * phase-1 table-qualified-column upsert bug was all-green on the fake
 * DB and only surfaced on the first real-D1 run). This script runs
 * each repository's write paths and key read paths against real D1
 * one by one and asserts the results. The database is bootstrapped
 * from the migration chain in migrations/ — the same chain production
 * runs — so the shape under test is the production shape by
 * construction.
 *
 * Usage: node scripts/verify-repositories-d1.mjs [section]
 *   Omitting section = all; currently twenty-two sections: tenants /
 *   events / gear / users / members / results / dex / reference /
 *   state / ddl / guard / stamp / membercount / atomic / audit /
 *   shortlinks / beats / templates / usage / buildshares / billing /
 *   feedback / activitytools, extended as the data-layer migration
 *   progresses.
 *   Non-zero exit = an assertion failed.
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

// Bootstrap from the migration chain (migrations/*.sql in filename
// order), split into statements the same way the drift gate does.
{
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { splitSqlStatements } = await import('./ci/schema-shape.mjs');
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  if (!files.length) throw new Error('no migration files in ' + dir);
  for (const f of files) {
    for (const stmt of splitSqlStatements(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      await db.prepare(stmt).run();
    }
  }
  console.log('[verify] bootstrapped from migration chain:', files.join(', '));
}

const section = process.argv[2] || 'all';
const want = (s) => section === 'all' || section === s;

/* ---------------- tenants ---------------- */
if (want('tenants')) {
  console.log('== tenants repository on real D1 ==');
  const repo = await import('../src/domains/guilds/tenants.ts');

  await repo.insertTenant(db, { slug: 'alpha', guildName: '甲百业', passwordHash: 'h1', announcement: '' });
  await repo.insertTenant(db, { slug: 'beta', guildName: '乙百业', passwordHash: 'h2', announcement: '公告乙' });

  const row = await repo.getTenantRow(db, 'alpha');
  check('insert+getTenantRow roundtrip', !!row && row.slug === 'alpha' && row.guild_name === '甲百业' && row.password_hash === 'h1');
  check('created_at default filled by DB', !!row && typeof row.created_at === 'string' && row.created_at.length >= 9, JSON.stringify(row && row.created_at));
  eq('discord_webhook default empty', row && row.discord_webhook, '');
  eq('profile fields default empty on insert', row && [row.master_name, row.logo_url, row.bg_image_url], ['', '', '']);
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
  check('updateTenantProfile writes the real profile fields', !!prof && prof.guild_name === '甲改' && prof.announcement === '新公告'
    && prof.slogan === '口号');
  eq('updateTenantProfile writes master_name', prof && prof.master_name, '掌门');
  eq('updateTenantProfile writes logo_url', prof && prof.logo_url, 'http://l');
  eq('updateTenantProfile writes bg_image_url', prof && prof.bg_image_url, 'http://b');

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
  const evRepo = await import('../src/domains/groupings/events.ts');
  const suRepo = await import('../src/domains/groupings/signups.ts');
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
  // readiness roundtrip: set by (event, discord stamp), read back, clear
  const readyUpd = await suRepo.updateSignupReadyByEventDiscord(db, ins1.last_row_id, '222', NOW + 5);
  eq('updateSignupReady changes', readyUpd.changes, 1);
  const remSeats2 = await suRepo.listSignupSeatsForReminder(db, ins1.last_row_id);
  eq('reminder seats carry ready_at', remSeats2[1].ready_at, NOW + 5);
  const seatsReady = await suRepo.listSignupSeats(db, ins1.last_row_id);
  eq('listSignupSeats carries ready_at', seatsReady[1].ready_at, NOW + 5);
  const readyClear = await suRepo.updateSignupReadyByEventDiscord(db, ins1.last_row_id, '222', null);
  eq('updateSignupReady clear changes', readyClear.changes, 1);
  eq('ready_at cleared', (await suRepo.listSignupSeats(db, ins1.last_row_id))[1].ready_at, null);
  eq('updateSignupReady non-seated -> 0', (await suRepo.updateSignupReadyByEventDiscord(db, ins1.last_row_id, '404', NOW)).changes, 0);
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
  const repo = await import('../src/domains/gear/gear.ts');
  const store = await import('../src/domains/gear/gearstore.ts');

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
  const repo = await import('../src/domains/identity/users.ts');

  const userTables = await db.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('users', 'user_oauth', 'user_guild_nicks')").all();
  check('identity tables come from the migration chain', userTables.results.length === 3);

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
  const repo = await import('../src/domains/identity/guildMembers.ts');

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
  const repo = await import('../src/domains/groupings/results.ts');
  const evRepo = await import('../src/domains/groupings/events.ts');
  const tnRepo = await import('../src/domains/guilds/tenants.ts');

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

/* ---------------- dex: dungeons + bosses ---------------- */
if (want('dex')) {
  console.log('== dex repositories (dungeons/bosses) on real D1 ==');
  const dg = await import('../src/domains/dex/dungeons.ts');
  const bs = await import('../src/domains/dex/bosses.ts');


  const d1 = await dg.insertDungeonDex(db, { name: '甲副本', size: 10, season: 'S5', category: '传薪', level: 100 });
  const d2 = await dg.insertDungeonDex(db, { name: '乙副本', size: 5, season: 'S4', category: '铸矩', level: 96 });
  check('insertDungeonDex ids', d1.last_row_id > 0 && d2.last_row_id > d1.last_row_id);
  const dRow = await dg.getDungeonByName(db, '甲副本');
  check('getDungeonByName roundtrip', !!dRow && dRow.size === 10 && dRow.season === 'S5' && dRow.version === 'legacy');
  eq('getDungeonByName missing -> null', await dg.getDungeonByName(db, '不存在'), null);
  eq('getDungeonById', (await dg.getDungeonById(db, d2.last_row_id))?.name, '乙副本');
  eq('getDungeonNameSizeById', await dg.getDungeonNameSizeById(db, d1.last_row_id), { name: '甲副本', size: 10 });
  await dg.updateDungeonFields(db, d1.last_row_id, { version: 'intl-v2.3', is_current: 1 });
  eq('getLatestDungeonVersion picks non-legacy', await dg.getLatestDungeonVersion(db), 'intl-v2.3');
  eq('listDungeonsPublic columns', (await dg.listDungeonsPublic(db)).map((r) => r.name), ['甲副本', '乙副本']);
  eq('listDungeonsDex full rows', (await dg.listDungeonsDex(db)).length, 2);
  eq('countDungeons', await dg.countDungeons(db), 2);
  let threw = false;
  try { await dg.updateDungeonFields(db, d1.last_row_id, { nope: 1 }); } catch { threw = true; }
  check('updateDungeonFields rejects unknown column', threw);

  const b1 = await bs.insertBoss(db, { name: '首领甲', talent: 't', source: 's', note: 'n', sortOrder: 20 });
  const b2 = await bs.insertBoss(db, { name: '首领乙', dungeon: '甲副本', talent: '', source: '侠境·甲副本', note: '', sortOrder: 10 });
  check('insertBoss ids', b1.last_row_id > 0 && b2.last_row_id > b1.last_row_id);
  eq('getBossById', (await bs.getBossById(db, b2.last_row_id))?.dungeon, '甲副本');
  eq('listAllBosses ordered', (await bs.listAllBosses(db)).map((r) => r.name), ['首领乙', '首领甲']);
  const light = await bs.listBossesLight(db);
  check('listBossesLight has_guide flag', light.length === 2 && light.every((r) => 'has_guide' in r));
  eq('listBossesByDungeon', (await bs.listBossesByDungeon(db, '甲副本')).map((r) => r.name), ['首领乙']);
  eq('getBossIdByNameAndDungeon', (await bs.getBossIdByNameAndDungeon(db, '首领乙', '甲副本'))?.id, b2.last_row_id);
  eq('getOrphanBossIdByName', (await bs.getOrphanBossIdByName(db, '首领甲'))?.id, b1.last_row_id);
  eq('listOrphanBossesByName', (await bs.listOrphanBossesByName(db, '首领甲')).length, 1);
  await bs.updateBossFields(db, b1.last_row_id, { guide: '攻略正文', mechanics_json: '[]' });
  eq('listBossesWithGuide', (await bs.listBossesWithGuide(db)).map((r) => r.name), ['首领甲']);
  eq('countBosses', await bs.countBosses(db), 2);
  await dg.updateDungeonFields(db, d1.last_row_id, { name: '甲副本改' });
  await bs.renameBossesDungeon(db, '甲副本', '甲副本改');
  eq('renameBossesDungeon moves rows', (await bs.listBossesFullByDungeon(db, '甲副本改')).length, 1);
  eq('deleteBossById changes', (await bs.deleteBossById(db, b1.last_row_id)).changes, 1);
  eq('deleteDungeonById changes', (await dg.deleteDungeonById(db, d2.last_row_id)).changes, 1);
  eq('counts after deletes', [await bs.countBosses(db), await dg.countDungeons(db)], [1, 1]);
}

/* ---------------- dex reference data ---------------- */
if (want('reference')) {
  console.log('== dex reference repository on real D1 ==');
  const ref = await import('../src/domains/dex/reference.ts');

  await db.prepare('INSERT INTO schools (name, slug, short, family, color, attr, talent_desc) VALUES (?, ?, ?, ?, ?, ?, ?)').bind('鸣金·虹', 'mingjin-hong', '虹', '鸣金', '#c9a35c', '外功', 'td').run();
  await db.prepare('INSERT INTO schools (name, slug) VALUES (?, ?)').bind('牵丝·霖', 'qiansi-lin').run();
  eq('listSchoolsFull ordered', (await ref.listSchoolsFull(db)).map((r) => r.name), ['牵丝·霖', '鸣金·虹']);
  eq('listSchoolsNameSlug', (await ref.listSchoolsNameSlug(db)).map((r) => r.slug), ['qiansi-lin', 'mingjin-hong']);
  eq('getSchoolNameBySlug', (await ref.getSchoolNameBySlug(db, 'qiansi-lin'))?.name, '牵丝·霖');
  eq('getSchoolNameBySlug missing -> null', await ref.getSchoolNameBySlug(db, 'nope'), null);

  await ref.upsertSchoolBis(db, { school: '鸣金·虹', build: '大外流', attr: 'a1', rate: 'r1', bisJson: '{"x":1}' });
  await ref.upsertSchoolBis(db, { school: '鸣金·虹', build: '大外流', attr: 'a2', rate: 'r2', bisJson: '{"x":2}' });
  const bisRows = await ref.listSchoolBisBySchool(db, '鸣金·虹');
  check('upsertSchoolBis conflict updates in place', bisRows.length === 1 && bisRows[0].attr === 'a2' && bisRows[0].bis_json === '{"x":2}');
  eq('listSchoolBis all', (await ref.listSchoolBis(db)).length, 1);
  eq('getSchoolBisJsonBySchool', (await ref.getSchoolBisJsonBySchool(db, '鸣金·虹'))?.bis_json, '{"x":2}');

  await ref.upsertSchoolRotation(db, { school: '鸣金·虹', rotationJson: '["s1"]' });
  await ref.upsertSchoolRotation(db, { school: '鸣金·虹', rotationJson: '["s2"]' });
  eq('upsertSchoolRotation conflict updates', (await ref.getSchoolRotationBySchool(db, '鸣金·虹'))?.rotation_json, '["s2"]');
  eq('listSchoolRotations', (await ref.listSchoolRotations(db)).length, 1);

  await db.prepare('INSERT INTO slot_affix (build, slot, affix_key) VALUES (?, ?, ?)').bind('默认', '武器', 'max_atk').run();
  await db.prepare('INSERT INTO slot_affix (build, slot, affix_key) VALUES (?, ?, ?)').bind('默认', '头盔', 'crit_rate').run();
  eq('listSlotAffixByBuild ordered by slot', (await ref.listSlotAffixByBuild(db, '默认')).map((r) => r.affix_key), ['crit_rate', 'max_atk']);
  await db.prepare('INSERT INTO affix_max (affix_key, name_cn, max_value, unit) VALUES (?, ?, ?, ?)').bind('max_atk', '大外', 100, '').run();
  await db.prepare('INSERT INTO affix_max (affix_key, name_cn, max_value, unit) VALUES (?, ?, ?, ?)').bind('crit_rate', '会心', 50, '%').run();
  eq('listAffixMax ordered', (await ref.listAffixMax(db)).map((r) => r.affix_key), ['crit_rate', 'max_atk']);
  eq('listAffixMaxValues', (await ref.listAffixMaxValues(db)).length, 2);
}

/* ---------------- heirloom state ---------------- */
if (want('state')) {
  console.log('== heirloom state repositories on real D1 ==');
  const hl = await import('../src/domains/gear/heirloom.ts');

  await hl.insertHeirloomItemPush(db, { tenant: 'g1', discordId: 'U1', buildSig: '校|套', itemHash: 'h1', createdAt: 100 });
  await hl.insertHeirloomItemPush(db, { tenant: 'g1', discordId: 'U1', buildSig: '校|套', itemHash: 'h1', createdAt: 101 });
  await hl.insertHeirloomItemPush(db, { tenant: 'g1', discordId: 'U1', buildSig: '校|套', itemHash: 'h2', createdAt: 102 });
  eq('item pushes dedupe via OR IGNORE', (await hl.listPushedItemHashes(db, 'g1', 'U1', '校|套')).sort(), ['h1', 'h2']);
  eq('item pushes scoped by build sig', await hl.listPushedItemHashes(db, 'g1', 'U1', '别|套'), []);
  eq('set state missing -> null', await hl.getHeirloomSetState(db, 'g1', 'U1', '校|套'), null);
  await hl.upsertHeirloomSetState(db, { tenant: 'g1', discordId: 'U1', buildSig: '校|套', complete: 1, updatedAt: 200 });
  eq('set state upsert insert', (await hl.getHeirloomSetState(db, 'g1', 'U1', '校|套'))?.complete, 1);
  await hl.upsertHeirloomSetState(db, { tenant: 'g1', discordId: 'U1', buildSig: '校|套', complete: 0, updatedAt: 201 });
  eq('set state upsert conflict updates', (await hl.getHeirloomSetState(db, 'g1', 'U1', '校|套'))?.complete, 0);

}

/* ---------------- capacity guard (red-line [13/16]) ---------------- */
if (want('guard')) {
  console.log('== capacity guard on real D1 ==');
  const evRepo = await import('../src/domains/groupings/events.ts');
  const suRepo = await import('../src/domains/groupings/signups.ts');

  const race = await evRepo.insertEvent(db, {
    tenant: 'guard', title: '竞速车', type: 'activity', description: '', starts_at: '',
    starts_at_utc: 1800000000, max_slots: 1, status: 'open', origin: 'member', created_by: 'x',
  });
  const raceId = race.last_row_id;
  // 8 concurrent joins race for a single seat: exactly one may land.
  const outcomes = await Promise.all(Array.from({ length: 8 }, (_, i) =>
    suRepo.insertSignupWithCapacityGuard(db, {
      event_id: raceId, nickname: '竞速' + i, uid: 'race' + i, role: '奶', weapon: '牵丝·霖',
    })));
  eq('race: exactly one inserted', outcomes.filter((o) => o.outcome === 'inserted').length, 1);
  eq('race: seven rejected full', outcomes.filter((o) => o.outcome === 'full').length, 7);
  eq('race: final seat count is 1', await suRepo.countSignupsByEvent(db, raceId), 1);

  // Last seat with no healer in the car rolls back.
  const heal = await evRepo.insertEvent(db, {
    tenant: 'guard', title: '治疗校验车', type: 'activity', description: '', starts_at: '',
    starts_at_utc: 1800000000, max_slots: 1, status: 'open', origin: 'member', created_by: 'x',
  });
  const healId = heal.last_row_id;
  const dps = await suRepo.insertSignupWithCapacityGuard(db, {
    event_id: healId, nickname: '输出君', uid: 'dps1', role: '输出', weapon: '破竹·风',
  });
  eq('no-healer last seat -> needsHealer', dps.outcome, 'needsHealer');
  eq('rollback removed the row', await suRepo.countSignupsByEvent(db, healId), 0);
  const healerJoin = await suRepo.insertSignupWithCapacityGuard(db, {
    event_id: healId, nickname: '奶妈', uid: 'heal1', role: '奶', weapon: '牵丝·霖',
  });
  eq('healer takes the seat', healerJoin.outcome, 'inserted');

  // Closed events reject through the same guard.
  const closed = await evRepo.insertEvent(db, {
    tenant: 'guard', title: '已截止车', type: 'activity', description: '', starts_at: '',
    starts_at_utc: 1800000000, max_slots: 5, status: 'closed', origin: 'member', created_by: 'x',
  });
  const closedJoin = await suRepo.insertSignupWithCapacityGuard(db, {
    event_id: closed.last_row_id, nickname: '迟到', uid: 'late1', role: '奶', weapon: '牵丝·霖',
  });
  eq('closed event -> full', closedJoin.outcome, 'full');
}

/* ---------------- mention stamp unit (red-line [14/16]) ---------------- */
if (want('stamp')) {
  console.log('== mention stamp unit on real D1 ==');
  const evRepo = await import('../src/domains/groupings/events.ts');
  const suRepo = await import('../src/domains/groupings/signups.ts');
  const ev = await evRepo.insertEvent(db, {
    tenant: 'stamp', title: '盖戳车', type: 'activity', description: '', starts_at: '',
    starts_at_utc: 1800000000, max_slots: 10, status: 'open', origin: 'member', created_by: 'x',
  });
  const evId = ev.last_row_id;
  await suRepo.insertSignup(db, { event_id: evId, nickname: '旧座甲', uid: 'old1', role: '输出', weapon: '' });
  await suRepo.insertSignup(db, { event_id: evId, nickname: '旧座乙', uid: 'old2', role: '输出', weapon: '', discord_id: '' });
  await suRepo.insertSignup(db, { event_id: evId, nickname: '新座', uid: 'new1', role: '奶', weapon: '', discord_id: '999' });
  const unstamped = await suRepo.listUnstampedSeatsByTenant(db, 'stamp');
  eq('unstamped seats listed (NULL + empty)', unstamped.map((r) => r.nickname).sort(), ['旧座乙', '旧座甲']);
  eq('other tenant has none', await suRepo.listUnstampedSeatsByTenant(db, 'nope'), []);
  const target = unstamped.find((r) => r.nickname === '旧座甲');
  const st = await suRepo.stampSignupDiscordId(db, target.id, '424242');
  eq('stamp changes=1', st.changes, 1);
  const after = await suRepo.listUnstampedSeatsByTenant(db, 'stamp');
  eq('stamped seat leaves the list', after.map((r) => r.nickname), ['旧座乙']);
  const seats = await suRepo.listSignupSeats(db, evId);
  eq('stamp persisted on the seat', seats.find((r) => r.nickname === '旧座甲').discord_id, '424242');
}

/* ---------------- member count aggregation (red-line [15/16]) ---------------- */
if (want('membercount')) {
  console.log('== member count aggregation on real D1 ==');
  const evRepo = await import('../src/domains/groupings/events.ts');
  const suRepo = await import('../src/domains/groupings/signups.ts');
  const e1 = await evRepo.insertEvent(db, {
    tenant: 'count', title: '计数车一', type: 'activity', description: '', starts_at: '',
    starts_at_utc: 1800000000, max_slots: 10, status: 'open', origin: 'member', created_by: 'x',
  });
  const e2 = await evRepo.insertEvent(db, {
    tenant: 'count', title: '计数车二', type: 'activity', description: '', starts_at: '',
    starts_at_utc: 1800000000, max_slots: 10, status: 'open', origin: 'member', created_by: 'x',
  });
  await suRepo.insertSignup(db, { event_id: e1.last_row_id, nickname: '同名', uid: 'c1', role: '输出', weapon: '' });
  await suRepo.insertSignup(db, { event_id: e2.last_row_id, nickname: '同名', uid: 'c2', role: '输出', weapon: '' });
  await suRepo.insertSignup(db, { event_id: e2.last_row_id, nickname: '另一人', uid: 'c3', role: '奶', weapon: '' });
  eq('distinct nicknames across cars', await suRepo.countDistinctNicknamesByTenant(db, 'count'), 2);
  eq('empty tenant counts 0', await suRepo.countDistinctNicknamesByTenant(db, 'ghost'), 0);
}

/* ---------------- grouped-execution atomicity ([16/16]) ---------------- */
if (want('atomic')) {
  console.log('== grouped execution atomicity on real D1 ==');
  const evRepo = await import('../src/domains/groupings/events.ts');
  const suRepo = await import('../src/domains/groupings/signups.ts');
  const rsRepo = await import('../src/domains/groupings/results.ts');
  const tnRepo = await import('../src/domains/guilds/tenants.ts');

  // Batch seating: the second row violates the (event_id, uid) unique
  // index, so the whole batch must roll back — no half-seated rows.
  const seatEv = await evRepo.insertEvent(db, {
    tenant: 'atom', title: '原子车', type: 'activity', description: '', starts_at: '',
    starts_at_utc: 1800000000, max_slots: 10, status: 'open', origin: 'member', created_by: 'x',
  });
  let threw = false;
  try {
    await suRepo.insertSignups(db, [
      { event_id: seatEv.last_row_id, nickname: '一', uid: 'a1', role: '输出', weapon: '' },
      { event_id: seatEv.last_row_id, nickname: '二', uid: 'a1', role: '奶', weapon: '' },
    ]);
  } catch { threw = true; }
  check('batch seating mid-group failure throws', threw);
  eq('batch seating rolled back fully', await suRepo.countSignupsByEvent(db, seatEv.last_row_id), 0);
  await suRepo.insertSignups(db, [
    { event_id: seatEv.last_row_id, nickname: '一', uid: 'a1', role: '输出', weapon: '' },
    { event_id: seatEv.last_row_id, nickname: '二', uid: 'a2', role: '奶', weapon: '' },
  ]);
  eq('batch seating success lands all rows', await suRepo.countSignupsByEvent(db, seatEv.last_row_id), 2);

  // Disband cascade: inject a failure on the results delete (trigger
  // RAISE ABORT); the earlier signups delete must roll back with it.
  const disEv = await evRepo.insertEvent(db, {
    tenant: 'atom', title: '解散车', type: 'activity', description: '', starts_at: '',
    starts_at_utc: 1800000000, max_slots: 10, status: 'open', origin: 'member', created_by: 'x',
  });
  await suRepo.insertSignup(db, { event_id: disEv.last_row_id, nickname: '留守', uid: 'd1', role: '输出', weapon: '' });
  await rsRepo.insertResult(db, { eventId: disEv.last_row_id, teamName: '', members: '留守', timeMs: 12345, proofUrl: '', note: '' });
  await db.prepare("CREATE TRIGGER fail_res_del BEFORE DELETE ON results BEGIN SELECT RAISE(ABORT, 'injected'); END").run();
  threw = false;
  try { await evRepo.deleteEventCascade(db, disEv.last_row_id, 'atom'); } catch { threw = true; }
  check('disband with injected failure throws', threw);
  eq('disband rolled back: signups survive', await suRepo.countSignupsByEvent(db, disEv.last_row_id), 1);
  check('disband rolled back: event survives', !!(await evRepo.getEventRow(db, disEv.last_row_id)));
  await db.prepare('DROP TRIGGER fail_res_del').run();
  await evRepo.deleteEventCascade(db, disEv.last_row_id, 'atom');
  eq('disband success removes event', await evRepo.getEventRow(db, disEv.last_row_id), null);
  eq('disband success removes signups', await suRepo.countSignupsByEvent(db, disEv.last_row_id), 0);

  // Tenant cascade: inject a failure on the events delete; signups,
  // events and the tenant row must all survive.
  await tnRepo.insertTenant(db, { slug: 'atomguild', guildName: '原子百业', passwordHash: 'x', announcement: '' });
  const tEv = await evRepo.insertEvent(db, {
    tenant: 'atomguild', title: '租户车', type: 'activity', description: '', starts_at: '',
    starts_at_utc: 1800000000, max_slots: 10, status: 'open', origin: 'member', created_by: 'x',
  });
  await suRepo.insertSignup(db, { event_id: tEv.last_row_id, nickname: '成员', uid: 't1', role: '输出', weapon: '' });
  await db.prepare("CREATE TRIGGER fail_ev_del BEFORE DELETE ON events BEGIN SELECT RAISE(ABORT, 'injected'); END").run();
  threw = false;
  try { await tnRepo.deleteTenantCascade(db, 'atomguild'); } catch { threw = true; }
  check('tenant delete with injected failure throws', threw);
  check('tenant delete rolled back: tenant survives', !!(await tnRepo.getTenantRow(db, 'atomguild')));
  eq('tenant delete rolled back: signups survive', await suRepo.countSignupsByEvent(db, tEv.last_row_id), 1);
  await db.prepare('DROP TRIGGER fail_ev_del').run();
  await tnRepo.deleteTenantCascade(db, 'atomguild');
  eq('tenant delete success removes tenant', await tnRepo.getTenantRow(db, 'atomguild'), null);
  eq('tenant delete success removes events', await evRepo.getEventRow(db, tEv.last_row_id), null);
}

if (want('ddl')) {
  console.log('== migration chain shape on real D1 ==');
  const { shapeFromEntities } = await import('./ci/schema-shape.mjs');
  const expected = Object.keys((await shapeFromEntities()).tables).sort();
  const tables = await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
  const names = new Set(tables.results.map((r) => r.name));
  check('chain bootstrap created every entity table', expected.every((t) => names.has(t)),
    'missing: ' + expected.filter((t) => !names.has(t)).join(','));
  check('chain created the formerly-lazy tables', ['push_tokens', 'error_log', 'user_gear_items', 'user_gear_builds', 'guild_avatars', 'event_reminders'].every((t) => names.has(t)));
  const evCols = await db.prepare('PRAGMA table_info(events)').all();
  const colNames = new Set(evCols.results.map((r) => r.name));
  check('events carries creator + reminder columns', ['creator_discord_id', 'reminder_sent_at', 'reminder_error'].every((c) => colNames.has(c)));
  const suCols = await db.prepare('PRAGMA table_info(signups)').all();
  check('signups carries discord_id column', suCols.results.some((r) => r.name === 'discord_id'));
  check('signups carries ready_at column', suCols.results.some((r) => r.name === 'ready_at'));
}

/* ---------------- reminder beats (event_reminders) ---------------- */
if (want('beats')) {
  console.log('== reminder beats + pending queries on real D1 ==');
  const evRepo = await import('../src/domains/groupings/events.ts');
  const NOWB = 1_800_100_000;
  const bEv = await evRepo.insertEvent(db, {
    tenant: 'beats', title: '拍车', type: 'activity', description: '', starts_at: '', starts_at_utc: NOWB + 1800,
    max_slots: 10, status: 'open', origin: 'member', created_by: 'x', creator_discord_id: '111',
  });
  const bDone = await evRepo.insertEvent(db, {
    tenant: 'beats', title: '已结算车', type: 'activity', description: '', starts_at: '', starts_at_utc: NOWB + 1800,
    max_slots: 10, status: 'open', origin: 'member', created_by: 'x', creator_discord_id: null,
  });
  await evRepo.markReminderSent(db, bDone.last_row_id, NOWB); // legacy-settled -> leaves the pending set
  const bCompleted = await evRepo.insertEvent(db, {
    tenant: 'beats', title: '完成车', type: 'activity', description: '', starts_at: '', starts_at_utc: NOWB + 1800,
    max_slots: 10, status: 'completed', origin: 'member', created_by: 'x', creator_discord_id: null,
  });
  const bPast = await evRepo.insertEvent(db, {
    tenant: 'beats', title: '已发车', type: 'activity', description: '', starts_at: '', starts_at_utc: NOWB - 60,
    max_slots: 10, status: 'open', origin: 'member', created_by: 'x', creator_discord_id: null,
  });
  const pending = await evRepo.listPendingReminderEvents(db, 'beats', NOWB);
  eq('pending = unsettled open future cars only', pending.map((p) => p.id), [bEv.last_row_id]);
  eq('settled beats start empty', await evRepo.listSettledBeats(db, [bEv.last_row_id]), []);
  eq('settled beats empty ids -> []', await evRepo.listSettledBeats(db, []), []);
  await evRepo.markBeatSent(db, bEv.last_row_id, 30, NOWB + 1);
  await evRepo.markBeatError(db, bEv.last_row_id, 10, 'boom');
  const beats = await evRepo.listSettledBeats(db, [bEv.last_row_id]);
  check('beats roundtrip sent+error', beats.length === 2
    && beats.find((b) => b.offset_min === 30)?.sent_at === NOWB + 1
    && beats.find((b) => b.offset_min === 10)?.error === 'boom', JSON.stringify(beats));
  await evRepo.markBeatSent(db, bEv.last_row_id, 10, NOWB + 2);
  const beats2 = await evRepo.listSettledBeats(db, [bEv.last_row_id]);
  check('beat upsert error->sent clears error', beats2.find((b) => b.offset_min === 10)?.sent_at === NOWB + 2
    && beats2.find((b) => b.offset_min === 10)?.error == null, JSON.stringify(beats2));
  const rows = await evRepo.listPendingReminderEventRows(db, 'beats', [bEv.last_row_id, bDone.last_row_id]);
  eq('pending rows fetch by ids', rows.map((r) => r.id), [bEv.last_row_id, bDone.last_row_id]);
  eq('pending rows empty ids -> []', await evRepo.listPendingReminderEventRows(db, 'beats', []), []);
}

/* ---------------- hub audit ---------------- */
if (want('audit')) {
  console.log('== hub audit repository + service on real D1 ==');
  const repo = await import('../src/domains/platform/hubAudit.ts');
  const svc = await import('../src/domains/platform/hub-audit.ts');

  const okWrite = await svc.auditHub(db, { action: 'reminder.update', tenant: 'alpha', summary: { webhook: 'replaced', enabled: true }, ip: '203.0.113.7' });
  check('auditHub write ok', okWrite === true);
  await svc.auditHub(db, { action: 'settings.update', tenant: '', summary: { keys: ['game_version'] } });
  await svc.auditHub(db, { action: 'auth.login_failed', tenant: '', summary: { reason: 'bad_password' } });

  const page = await svc.listHubAuditPage(db, { limit: 50, offset: 0 });
  eq('audit page total', page.total, 3);
  eq('audit page newest first', page.entries[0].action, 'auth.login_failed');
  const row = page.entries.find((e) => e.action === 'reminder.update');
  check('audit row fields roundtrip', !!row && row.tenant === 'alpha' && row.actor === 'hub' && row.ip === '203.0.113.7'
    && JSON.parse(row.summary).webhook === 'replaced', JSON.stringify(row));

  const filtered = await svc.listHubAuditPage(db, { tenant: 'alpha' });
  eq('audit tenant filter total', filtered.total, 1);
  eq('audit tenant filter row', filtered.entries[0].action, 'reminder.update');

  const paged = await svc.listHubAuditPage(db, { limit: 2, offset: 2 });
  eq('audit pagination tail size', paged.entries.length, 1);
  eq('audit pagination tail row', paged.entries[0].action, 'reminder.update');

  // Prune: an old row dies by the age cutoff; the row cap keeps newest N.
  await repo.insertHubAudit(db, { at: 1000000, actor: 'hub', action: 'old.row', tenant: '', summary: '', ip: '' });
  await repo.pruneHubAudit(db, 2000000, 20000);
  const afterAge = await svc.listHubAuditPage(db, {});
  check('audit prune drops aged rows', afterAge.entries.every((e) => e.action !== 'old.row'));
  eq('audit prune keeps fresh rows', afterAge.total, 3);
  await repo.pruneHubAudit(db, 0, 2);
  const afterCap = await svc.listHubAuditPage(db, {});
  eq('audit prune enforces row cap', afterCap.total, 2);
  eq('audit prune cap keeps newest', afterCap.entries[0].action, 'auth.login_failed');

  // Service never throws on a broken DB handle.
  const broken = { prepare() { throw new Error('down'); } };
  eq('auditHub broken db -> false, no throw', await svc.auditHub(broken, { action: 'x' }), false);
  eq('listHubAuditPage broken db -> empty', (await svc.listHubAuditPage(broken, {})).total, 0);
}

/* ---------------- short_links ---------------- */
if (want('shortlinks')) {
  console.log('== short_links repository on real D1 ==');
  const repo = await import('../src/domains/groupings/shortlinks.ts');

  // The table is created by the repository's own lazy DDL on first use.
  const a = await repo.mintShortLink(db, 'alpha', 101);
  check('mint returns a 7-char base62 code', /^[0-9A-Za-z]{7}$/.test(a.code), a.code);
  eq('mint row target', [a.tenant, a.event_id], ['alpha', 101]);
  check('mint row created_at is epoch seconds', a.created_at > 1700000000, String(a.created_at));

  const again = await repo.mintShortLink(db, 'alpha', 101);
  eq('second mint for same target is stable (same code)', again.code, a.code);
  eq('getShortLinkByTarget roundtrip', (await repo.getShortLinkByTarget(db, 'alpha', 101))?.code, a.code);
  eq('getShortLinkByCode roundtrip', (await repo.getShortLinkByCode(db, a.code))?.event_id, 101);
  eq('getShortLinkByCode unknown -> null', await repo.getShortLinkByCode(db, 'ZZZZZZZ'), null);
  eq('getShortLinkByTarget unknown -> null', await repo.getShortLinkByTarget(db, 'alpha', 999), null);

  const b = await repo.mintShortLink(db, 'alpha', 102);
  check('different target mints a different code', b.code !== a.code, `${a.code} vs ${b.code}`);

  // Collision retry: the first candidate code is already taken by car
  // 101; the mint must skip it and land on the second candidate.
  const seq = [a.code, 'Fr3sh99'];
  const c = await repo.mintShortLink(db, 'beta', 201, () => seq.shift() || repo.generateShortCode());
  eq('code collision retries with a fresh code', c.code, 'Fr3sh99');
  eq('collided code still resolves to its original target', (await repo.getShortLinkByCode(db, a.code))?.event_id, 101);

  // Same-target race: a concurrent mint for the same target lands
  // first (simulated inside the code generator); the outer mint must
  // adopt the winner's code instead of failing or duplicating.
  let winner = null;
  const d = await repo.mintShortLink(db, 'beta', 202, () => {
    if (!winner) {
      winner = repo.mintShortLink(db, 'beta', 202);
      return 'Tak3n00';
    }
    return repo.generateShortCode();
  });
  eq('same-target race adopts the winner code', d.code, (await winner)?.code);
  eq('race leaves exactly one row for the target', (await repo.getShortLinkByTarget(db, 'beta', 202))?.code, d.code);

  eq('shortLinkUrl shape', repo.shortLinkUrl('Ab3dEf9'), 'https://yanyun.app/c/Ab3dEf9');
  eq('canonicalGroupingUrl shape', repo.canonicalGroupingUrl('alpha', 101), 'https://yanyun.app/alpha/car/101');
}

/* ---------------- grouping_templates ---------------- */
if (want('templates')) {
  console.log('== grouping_templates repository on real D1 ==');
  const repo = await import('../src/domains/groupings/templates.ts');

  // The table is created by the repository's own lazy DDL on first use.
  eq('list on empty tenant -> []', await repo.listGroupingTemplates(db, 'alpha'), []);

  const T0 = 1760000000;
  const base = {
    tenant: 'alpha', name: '周常天赋', type: 'talent', title: '周常天赋车',
    dungeon: '定极分更', max_slots: 5, start_days_ahead: 2, start_minutes: 1230,
    creator_discord_id: 'U1', created_at: T0, updated_at: T0,
  };
  const ins = await repo.insertGroupingTemplate(db, { ...base });
  check('insert returns last_row_id', ins.last_row_id > 0, String(ins.last_row_id));
  const row = await repo.getGroupingTemplate(db, ins.last_row_id);
  eq('insert roundtrip fields', row && [row.tenant, row.name, row.type, row.title, row.dungeon, row.max_slots, row.start_days_ahead, row.start_minutes, row.creator_discord_id, row.created_at],
    ['alpha', '周常天赋', 'talent', '周常天赋车', '定极分更', 5, 2, 1230, 'U1', T0]);
  eq('get unknown -> null', await repo.getGroupingTemplate(db, 99999), null);

  const ins2 = await repo.insertGroupingTemplate(db, { ...base, name: '双十老本', type: 'activity', dungeon: '', max_slots: 10 });
  const insB = await repo.insertGroupingTemplate(db, { ...base, tenant: 'beta', name: '乙百业模板' });
  const listA = await repo.listGroupingTemplates(db, 'alpha');
  eq('list is tenant-scoped, newest first', listA.map((r) => r.id), [ins2.last_row_id, ins.last_row_id]);
  eq('other tenant list separate', (await repo.listGroupingTemplates(db, 'beta')).map((r) => r.id), [insB.last_row_id]);

  const upd = await repo.updateGroupingTemplateFields(db, ins.last_row_id, { name: '改名模板', start_minutes: 1200, updated_at: T0 + 60 });
  eq('update changes one row', upd.changes, 1);
  const after = await repo.getGroupingTemplate(db, ins.last_row_id);
  eq('update read-back', after && [after.name, after.start_minutes, after.updated_at, after.title], ['改名模板', 1200, T0 + 60, '周常天赋车']);

  let threw = false;
  try { await repo.insertGroupingTemplate(db, { ...base, bogus_col: 1 }); } catch { threw = true; }
  check('unknown column is rejected', threw);

  const del = await repo.deleteGroupingTemplate(db, ins2.last_row_id);
  eq('delete changes one row', del.changes, 1);
  eq('deleted row reads null', await repo.getGroupingTemplate(db, ins2.last_row_id), null);
  eq('delete again changes nothing', (await repo.deleteGroupingTemplate(db, ins2.last_row_id)).changes, 0);

  // Departure offset: 2026-01-08 20:30 in Asia/Shanghai, "now" is
  // 2026-01-05 12:00 in the same zone -> 3 days ahead, 1230 minutes.
  const off = repo.templateOffsetFromStartsAt(Date.UTC(2026, 0, 8, 12, 30) / 1000, Date.UTC(2026, 0, 5, 4, 0) / 1000, 'Asia/Shanghai');
  eq('offset days/minutes (Asia/Shanghai)', [off.daysAhead, off.startMinutes], [3, 1230]);
  // A car in the past clamps to today, keeping its time of day.
  const past = repo.templateOffsetFromStartsAt(Date.UTC(2026, 0, 4, 12, 30) / 1000, Date.UTC(2026, 0, 5, 4, 0) / 1000, 'Asia/Shanghai');
  eq('offset past car clamps to today', [past.daysAhead, past.startMinutes], [0, 1230]);
  // Same instants read in Los Angeles: start is Jan 7 20:30 local,
  // now is Jan 5 12:00 local -> 2 days ahead.
  const la = repo.templateOffsetFromStartsAt(Date.UTC(2026, 0, 8, 4, 30) / 1000, Date.UTC(2026, 0, 5, 20, 0) / 1000, 'America/Los_Angeles');
  eq('offset days/minutes (America/Los_Angeles)', [la.daysAhead, la.startMinutes], [2, 1230]);
}

/* ---------------- usage counters + limits metering ---------------- */
if (want('usage')) {
  console.log('== usage_counters repository + limits service on real D1 ==');
  const usage = await import('../src/domains/platform/usageCounters.ts');
  const limits = await import('../src/domains/platform/limits.ts');
  const gearRepo = await import('../src/domains/gear/gear.ts');

  eq('fresh counter reads 0', await usage.getUsageCount(db, 'UQ', 'gear_ocr_batches', '2026-10-27'), 0);
  eq('first increment creates the row at 1', await usage.incrementUsage(db, 'UQ', 'gear_ocr_batches', '2026-10-27', 1, 111), 1);
  eq('second increment accumulates', await usage.incrementUsage(db, 'UQ', 'gear_ocr_batches', '2026-10-27', 1, 222), 2);
  eq('increment by more than one', await usage.incrementUsage(db, 'UQ', 'gear_ocr_batches', '2026-10-27', 3, 333), 5);
  eq('read-back matches', await usage.getUsageCount(db, 'UQ', 'gear_ocr_batches', '2026-10-27'), 5);
  eq('another day is a separate counter (rollover)', await usage.getUsageCount(db, 'UQ', 'gear_ocr_batches', '2026-10-28'), 0);
  eq('another metric is a separate counter', await usage.getUsageCount(db, 'UQ', 'other_metric', '2026-10-27'), 0);
  eq('another user is a separate counter', await usage.getUsageCount(db, 'UR', 'gear_ocr_batches', '2026-10-27'), 0);

  // Day key: Asia/Shanghai date of the instant (2026-10-26T16:30Z is
  // already 2026-10-27 00:30 in Beijing).
  eq('usageDayKey rolls at Beijing midnight', limits.usageDayKey(Date.UTC(2026, 9, 26, 16, 30)), '2026-10-27');
  eq('usageDayKey same-day morning UTC', limits.usageDayKey(Date.UTC(2026, 9, 26, 2, 0)), '2026-10-26');

  // Service seam: effective limits come back whole, free values today.
  const eff = await limits.getEffectiveLimits(db, { discordId: 'UQ' });
  eq('effective limits are the free values', [eff.gearItemCapacity, eff.ocrBatchImages, eff.ocrBatchesPerDay], [200, 20, 10]);

  // Metering helpers accumulate under today's key only.
  const nowMs = Date.UTC(2026, 9, 27, 3, 0);
  eq('ocr used starts at 0', await limits.getOcrBatchesUsedToday(db, 'UQ2', nowMs), 0);
  await limits.recordOcrBatch(db, 'UQ2', nowMs);
  eq('ocr used after one record', await limits.getOcrBatchesUsedToday(db, 'UQ2', nowMs), 1);
  eq('ocr used is keyed to the Beijing day', await usage.getUsageCount(db, 'UQ2', 'gear_ocr_batches', '2026-10-27'), 1);

  // Gear item count on real D1 (the capacity check's read path).
  eq('countGearItemRows empty', await gearRepo.countGearItemRows(db, 'UC'), 0);
  await gearRepo.insertGearItemRow(db, { discordId: 'UC', slot: '武器', name: '计数剑', payload: '{}', createdAt: 1 });
  await gearRepo.insertGearItemRow(db, { discordId: 'UC', slot: '环', name: '计数环', payload: '{}', createdAt: 2 });
  eq('countGearItemRows counts owner rows', await gearRepo.countGearItemRows(db, 'UC'), 2);
  eq('countGearItemRows is owner-scoped', await gearRepo.countGearItemRows(db, 'UD'), 0);
}

/* ---------------- build_share_links ---------------- */
if (want('buildshares')) {
  console.log('== build_share_links service on real D1 ==');
  const svc = await import('../src/domains/gear/buildshare.ts');
  const store = await import('../src/domains/gear/gearstore.ts');
  const repo = await import('../src/domains/gear/gear.ts');

  const item = await store.insertGearItem(db, 'share-a', {
    slot: '武器', name: '验剑', lines: [{ key: 'dawai', val: 85.2 }], dingyin: null, schools: [],
  });
  const mk = (name) => store.insertGearBuild(db, 'share-a', {
    name, targetIdx: 0, buildLabel: '鸣金·虹 · 飞隼', loadout: { '主武器': item.id },
    baseValues: {}, xinfa: [], extras: { res: 1.85, acc: 0, crit: 0, int: 0 },
    bowKind: '', gradDingyinOn: true,
    snapshot: { total: 87.3, a: 90.1, b: 85, d: 80, loan: 88.8, yAcc: 71.2, yCrit: 65.4, yInt: 60.9, dawai: 1, xiaowai: 2 },
  });
  const b1 = await mk('验方案一');
  const b2 = await mk('验方案二');

  eq('share for missing build -> null', await svc.shareGearBuild(db, 'share-a', 999999), null);
  eq('share for another owner -> null', await svc.shareGearBuild(db, 'share-b', b1.id), null);

  const l1 = await svc.shareGearBuild(db, 'share-a', b1.id);
  check('mint returns a 7-char base62 code', /^[0-9A-Za-z]{7}$/.test(l1.code), l1.code);
  eq('mint row target', [l1.buildId, l1.discordId], [b1.id, 'share-a']);
  eq('second share is stable (same code)', (await svc.shareGearBuild(db, 'share-a', b1.id)).code, l1.code);
  eq('getBuildShareLink roundtrip', (await svc.getBuildShareLink(db, 'share-a', b1.id))?.code, l1.code);
  eq('repository read by code roundtrip', (await repo.getBuildShareLinkRowByCode(db, l1.code))?.build_id, b1.id);
  eq('unknown code repository read -> null', await repo.getBuildShareLinkRowByCode(db, 'ZZZZZZZ'), null);

  const pub = await svc.resolveSharedBuild(db, l1.code);
  eq('resolve carries the build name', pub?.build.name, '验方案一');
  eq('resolve carries the loadout items', pub?.items.map((i) => i.name), ['验剑']);
  eq('resolve of unknown code -> null', await svc.resolveSharedBuild(db, 'ZZZZZZZ'), null);
  eq('resolve of malformed code -> null', await svc.resolveSharedBuild(db, 'bad-code'), null);

  // Collision retry against real UNIQUE constraints: the first
  // candidate is b1's live code; the mint for b2 must skip it.
  const seq = [l1.code, 'Re4lD1x'];
  const l2 = await svc.shareGearBuild(db, 'share-a', b2.id, () => seq.shift() || svc.generateBuildShareCode());
  eq('code collision retries with a fresh code', l2.code, 'Re4lD1x');
  eq('collided code still resolves to its original build', (await svc.resolveSharedBuild(db, l1.code))?.build.id, b1.id);

  eq('buildShareUrl shape', svc.buildShareUrl('Ab3dEf9'), 'https://yanyun.app/b/Ab3dEf9');

  eq('revoke by another owner changes nothing', await svc.revokeBuildShare(db, 'share-b', b1.id), false);
  eq('revoke by owner', await svc.revokeBuildShare(db, 'share-a', b1.id), true);
  eq('revoked code resolves -> null', await svc.resolveSharedBuild(db, l1.code), null);
  eq('revoke again -> false', await svc.revokeBuildShare(db, 'share-a', b1.id), false);
  const l1n = await svc.shareGearBuild(db, 'share-a', b1.id);
  check('re-share after revoke mints a fresh code', l1n.code !== l1.code, `${l1.code} -> ${l1n.code}`);

  // Deleting the build orphans the link: resolve must go dead even
  // though the link row still exists (the mutation layer also drops
  // the row; the service-level guard is the second line of defense).
  await repo.deleteGearBuildRow(db, 'share-a', b1.id);
  eq('deleted build resolves -> null (orphaned link)', await svc.resolveSharedBuild(db, l1n.code), null);

  // Account-deletion cascade: the bulk delete removes every link the
  // user owns — here the orphaned l1n row plus b2's still-live l2.
  check('second build link live before cascade', !!(await svc.resolveSharedBuild(db, l2.code)));
  eq('cascade deletes the owner links', await repo.deleteAllBuildShareLinksByUser(db, 'share-a'), 2);
  eq('cascaded code resolves -> null', await svc.resolveSharedBuild(db, l2.code), null);
  eq('cascade again -> 0 (idempotent)', await repo.deleteAllBuildShareLinksByUser(db, 'share-a'), 0);
}

/* ---------------- billing (guild_entitlements + stripe_events) ---------------- */
if (want('billing')) {
  console.log('== billing repositories on real D1 ==');
  const repo = await import('../src/domains/platform/billing.ts');
  const svc = await import('../src/domains/platform/billing-service.ts');

  eq('entitlement missing -> null', await repo.getEntitlementRow(db, 'alpha'), null);

  const row = {
    tenant: 'alpha', plan: 'premium', source: 'manual',
    currentPeriodEnd: 2000000000, stripeCustomerId: 'cus_1',
    stripeSubscriptionId: 'sub_1', updatedAt: 111,
  };
  await repo.upsertEntitlementRow(db, row);
  eq('upsert+get roundtrip', await repo.getEntitlementRow(db, 'alpha'), row);

  const row2 = { ...row, plan: 'free', source: '', currentPeriodEnd: null, stripeCustomerId: '', stripeSubscriptionId: '', updatedAt: 222 };
  await repo.upsertEntitlementRow(db, row2);
  eq('upsert conflict path overwrites', await repo.getEntitlementRow(db, 'alpha'), row2);

  await repo.upsertEntitlementRow(db, { ...row, tenant: 'beta' });
  eq('lookup by subscription', (await repo.getEntitlementBySubscription(db, 'sub_1'))?.tenant, 'beta');
  eq('lookup by customer', (await repo.getEntitlementByCustomer(db, 'cus_1'))?.tenant, 'beta');
  eq('lookup by unknown subscription -> null', await repo.getEntitlementBySubscription(db, 'sub_x'), null);
  eq('list rows ordered by tenant', (await repo.listEntitlementRows(db)).map((r) => r.tenant), ['alpha', 'beta']);

  // Read-time expiry: the stored row still says premium, the service
  // reads free once the period end has passed.
  const future = Math.floor(Date.now() / 1000) + 3600;
  await repo.upsertEntitlementRow(db, { ...row, tenant: 'gamma', currentPeriodEnd: future });
  eq('effective premium before period end', (await svc.getEffectiveEntitlement(db, 'gamma')).plan, 'premium');
  const past = Math.floor(Date.now() / 1000) - 3600;
  await repo.upsertEntitlementRow(db, { ...row, tenant: 'gamma', currentPeriodEnd: past });
  const lapsed = await svc.getEffectiveEntitlement(db, 'gamma');
  eq('effective free after period end', [lapsed.plan, lapsed.lapsed], ['free', true]);
  eq('stored row untouched by read-time expiry', (await repo.getEntitlementRow(db, 'gamma'))?.plan, 'premium');

  // Stripe event dedupe ledger.
  eq('first event marks fresh', await repo.markStripeEventProcessed(db, 'evt_1', 'checkout.session.completed', 100), true);
  eq('replay marks duplicate', await repo.markStripeEventProcessed(db, 'evt_1', 'checkout.session.completed', 101), false);
  eq('hasStripeEvent true', await repo.hasStripeEvent(db, 'evt_1'), true);
  eq('hasStripeEvent false', await repo.hasStripeEvent(db, 'evt_nope'), false);

  // Limits seam: the limits service resolves its premium table only
  // for a guild whose premium tier is in force (paygate on +
  // entitlement premium); every other context reads the free table.
  const limitsSvc = await import('../src/domains/platform/limits.ts');
  const settingsRepo = await import('../src/domains/guilds/settings.ts');
  await repo.upsertEntitlementRow(db, { ...row, tenant: 'alpha', plan: 'premium', currentPeriodEnd: future });
  const offLimits = await limitsSvc.getEffectiveLimits(db, { discordId: 'U', guildSlug: 'alpha' });
  eq('limits: switch off -> free despite premium row', [offLimits.gearItemCapacity, offLimits.ocrBatchImages, offLimits.ocrBatchesPerDay], [200, 20, 10]);
  await settingsRepo.setSettingValue(db, '', 'paygate_enabled', '1');
  const onLimits = await limitsSvc.getEffectiveLimits(db, { discordId: 'U', guildSlug: 'alpha' });
  eq('limits: premium in force -> premium table', [onLimits.gearItemCapacity, onLimits.ocrBatchImages, onLimits.ocrBatchesPerDay], [2000, 100, 50]);
  const noGuild = await limitsSvc.getEffectiveLimits(db, { discordId: 'U' });
  eq('limits: guild-less context stays free', noGuild.gearItemCapacity, 200);
  await settingsRepo.setSettingValue(db, '', 'paygate_enabled', '0');
}

/* ---------------- feedback ---------------- */
if (want('feedback')) {
  console.log('== feedback repository on real D1 ==');
  const repo = await import('../src/domains/platform/feedback.ts');

  eq('list on empty table -> []', await repo.listFeedback(db, { status: '', limit: 50, offset: 0 }), []);
  eq('count on empty table -> 0', await repo.countFeedback(db, ''), 0);
  eq('countSince on empty table -> 0', await repo.countFeedbackSince(db, 'U1', 0), 0);

  const T0 = 1760000000000; // epoch ms
  await repo.insertFeedback(db, { discordId: 'U1', userName: '反馈甲', category: 'problem', content: '报名页打不开', createdAt: T0 });
  await repo.insertFeedback(db, { discordId: 'U1', userName: '反馈甲', category: 'suggestion', content: '希望有夜间模式', createdAt: T0 + 1000 });
  await repo.insertFeedback(db, { discordId: 'U2', userName: '反馈乙', category: 'other', content: '路过', createdAt: T0 + 2000 });

  const all = await repo.listFeedback(db, { status: '', limit: 50, offset: 0 });
  eq('list returns all rows newest first', all.map((r) => r.content), ['路过', '希望有夜间模式', '报名页打不开']);
  eq('inserted row shape', all[2] && [all[2].discord_id, all[2].user_name, all[2].category, all[2].status, all[2].created_at, all[2].resolved_at],
    ['U1', '反馈甲', 'problem', 'open', T0, null]);
  eq('count all', await repo.countFeedback(db, ''), 3);
  eq('count open', await repo.countFeedback(db, 'open'), 3);
  eq('count resolved (none yet)', await repo.countFeedback(db, 'resolved'), 0);
  eq('countSince U1 since T0', await repo.countFeedbackSince(db, 'U1', T0), 2);
  eq('countSince U1 since T0+1500', await repo.countFeedbackSince(db, 'U1', T0 + 1500), 0);
  eq('countSince U2 since T0', await repo.countFeedbackSince(db, 'U2', T0), 1);

  const page = await repo.listFeedback(db, { status: '', limit: 2, offset: 2 });
  eq('pagination offset reaches the oldest row', page.map((r) => r.content), ['报名页打不开']);

  const target = all[2];
  eq('resolve flips a row', await repo.setFeedbackStatus(db, target.id, 'resolved', T0 + 5000), true);
  const resolved = await repo.listFeedback(db, { status: 'resolved', limit: 50, offset: 0 });
  eq('resolved list has the row with its stamp', resolved.map((r) => [r.content, r.resolved_at]), [['报名页打不开', T0 + 5000]]);
  eq('count resolved after flip', await repo.countFeedback(db, 'resolved'), 1);
  eq('open list shrinks', (await repo.listFeedback(db, { status: 'open', limit: 50, offset: 0 })).length, 2);
  eq('reopen flips back and clears the stamp', await repo.setFeedbackStatus(db, target.id, 'open', T0 + 6000), true);
  const reopened = (await repo.listFeedback(db, { status: '', limit: 50, offset: 0 })).find((r) => r.id === target.id);
  eq('reopened row state', reopened && [reopened.status, reopened.resolved_at], ['open', null]);
  eq('status flip on unknown id -> false', await repo.setFeedbackStatus(db, 99999, 'resolved', T0), false);
}

/* ---------------- guild announcements (F9/F10/F18) ---------------- */
if (want('announcements')) {
  console.log('== guild announcements repository on real D1 ==');
  const repo = await import('../src/domains/guilds/announcements.ts');

  eq('list on empty table -> []', await repo.listAnnouncements(db, 'alpha', 50), []);
  eq('get on empty table -> null', await repo.getAnnouncement(db, 'alpha', 1), null);

  const T0 = 1760000000; // epoch seconds
  const id1 = await repo.insertAnnouncement(db, { tenant: 'alpha', kind: 'standard', title: '周六活动安排', body: '晚八点集合', authorDiscordId: 'A1', authorName: '管理员甲', createdAt: T0 });
  const id2 = await repo.insertAnnouncement(db, { tenant: 'alpha', kind: 'urgent', title: '今晚集合', body: '看到请上线', authorDiscordId: 'A1', authorName: '管理员甲', createdAt: T0 + 60 });
  const idB = await repo.insertAnnouncement(db, { tenant: 'beta', kind: 'standard', title: '乙公告', body: '', authorDiscordId: 'B1', authorName: '乙管理员', createdAt: T0 + 120 });
  check('insert returns increasing ids', id1 > 0 && id2 > id1 && idB > id2, `${id1},${id2},${idB}`);

  const list = await repo.listAnnouncements(db, 'alpha', 50);
  eq('list returns guild rows newest first', list.map((r) => r.id), [id2, id1]);
  eq('row shape round-trips', list[1] && [list[1].tenant, list[1].kind, list[1].title, list[1].body, list[1].author_discord_id, list[1].author_name, list[1].created_at],
    ['alpha', 'standard', '周六活动安排', '晚八点集合', 'A1', '管理员甲', T0]);
  eq('list is guild-scoped', (await repo.listAnnouncements(db, 'beta', 50)).map((r) => r.id), [idB]);
  eq('get inside the guild', (await repo.getAnnouncement(db, 'alpha', id1))?.title, '周六活动安排');
  eq('get with a foreign guild -> null', await repo.getAnnouncement(db, 'beta', id1), null);

  eq('read ids on empty receipts -> []', await repo.listReadAnnouncementIds(db, 'alpha', 'M1'), []);
  await repo.markAnnouncementRead(db, { tenant: 'alpha', announcementId: id1, discordId: 'M1', readAt: T0 + 300 });
  await repo.markAnnouncementRead(db, { tenant: 'alpha', announcementId: id1, discordId: 'A1', readAt: T0 + 200 });
  eq('read ids after marks', (await repo.listReadAnnouncementIds(db, 'alpha', 'M1')).map(Number), [id1]);
  eq('receipts oldest-read first', (await repo.listAnnouncementReads(db, 'alpha', id1)).map((r) => r.discord_id), ['A1', 'M1']);
  await repo.markAnnouncementRead(db, { tenant: 'alpha', announcementId: id1, discordId: 'M1', readAt: T0 + 999 });
  eq('re-mark keeps the first read_at (DO NOTHING)', (await repo.listAnnouncementReads(db, 'alpha', id1)).find((r) => r.discord_id === 'M1')?.read_at, T0 + 300);
  eq('receipts are guild-scoped', await repo.listAnnouncementReads(db, 'beta', id1), []);

  eq('delete foreign-guild id -> false', await repo.deleteAnnouncement(db, 'beta', id1), false);
  eq('delete own announcement -> true', await repo.deleteAnnouncement(db, 'alpha', id1), true);
  eq('deleted row is gone', await repo.getAnnouncement(db, 'alpha', id1), null);
  eq('delete cascades the receipts', await repo.listAnnouncementReads(db, 'alpha', id1), []);
  eq('other announcements survive the delete', (await repo.listAnnouncements(db, 'alpha', 50)).map((r) => r.id), [id2]);
}

/* ---------------- lotteries (F21) ---------------- */
if (want('activitytools')) {
  console.log('== lotteries repositories on real D1 ==');
  const lot = await import('../src/domains/groupings/lotteries.ts');

  const created = await lot.insertLottery(db, {
    tenant: 'alpha', title: '周年抽奖', prize: '坐骑一只', source: 'members',
    source_event_id: null, winner_count: 2, status: 'open', created_by: 'U1', created_at: 1760000000,
  });
  const lid = created.last_row_id;
  check('insertLottery returns a row id', lid > 0, String(lid));
  await lot.insertLotteryEntry(db, { lotteryId: lid, discordId: 'U1', displayName: '甲', weight: 1 });
  await lot.insertLotteryEntry(db, { lotteryId: lid, discordId: 'U2', displayName: '乙', weight: 5 });
  await lot.insertLotteryEntry(db, { lotteryId: lid, discordId: 'U3', displayName: '丙', weight: 1 });
  eq('entries roundtrip in order', (await lot.listLotteryEntries(db, lid)).map((e) => e.discord_id), ['U1', 'U2', 'U3']);
  eq('lottery read is tenant-scoped', await lot.getLotteryByTenant(db, lid, 'beta'), null);
  eq('lottery row shape', (await lot.getLotteryByTenant(db, lid, 'alpha'))?.prize, '坐骑一只');
  eq('listLotteries is tenant-scoped', (await lot.listLotteries(db, 'beta')).length, 0);

  // Duplicate entry for the same member violates the unique index.
  let dupThrew = false;
  try { await lot.insertLotteryEntry(db, { lotteryId: lid, discordId: 'U1', displayName: '甲', weight: 1 }); }
  catch { dupThrew = true; }
  check('duplicate entry for one member is rejected by the schema', dupThrew);

  const entries = await lot.listLotteryEntries(db, lid);
  const winners = lot.drawWinners(entries, 2, () => 0);
  eq('draw with rand=0 picks by weight order deterministically', winners.map((w) => w.discord_id), ['U1', 'U2']);
  const many = lot.drawWinners(entries, 3, Math.random);
  eq('full draw returns every entrant exactly once', [...many.map((w) => w.discord_id)].sort(), ['U1', 'U2', 'U3']);

  for (const w of winners) {
    await lot.insertLotteryWinner(db, { lotteryId: lid, discordId: w.discord_id, displayName: w.display_name, drawnAt: 1760003600 });
  }
  await lot.markLotteryDrawn(db, lid, 1760003600);
  eq('winners roundtrip', (await lot.listLotteryWinners(db, lid)).map((w) => w.discord_id), ['U1', 'U2']);
  const drawn = await lot.getLotteryByTenant(db, lid, 'alpha');
  eq('drawn state persisted', drawn && [drawn.status, drawn.drawn_at], ['drawn', 1760003600]);
  let dupWinThrew = false;
  try { await lot.insertLotteryWinner(db, { lotteryId: lid, discordId: 'U1', displayName: '甲', drawnAt: 1760003600 }); }
  catch { dupWinThrew = true; }
  check('duplicate winner for one member is rejected by the schema', dupWinThrew);
}

/* ---------------- season checklist + roster (0022/0023) ---------------- */
if (want('season')) {
  console.log('== season checklist + roster repositories on real D1 ==');
  const checksRepo = await import('../src/domains/guilds/seasonChecklist.ts');
  const rosterRepo = await import('../src/domains/guilds/roster.ts');

  eq('checklist empty -> []', await checksRepo.listSeasonChecklistChecks(db, 'alpha', 'intl-v2.3:S5'), []);
  await checksRepo.setSeasonChecklistCheck(db, { tenant: 'alpha', seasonKey: 'intl-v2.3:S5', itemKey: 'current-dungeons', checked: true, checkedBy: 'U1', checkedByName: '甲军官', now: 1760000000 });
  await checksRepo.setSeasonChecklistCheck(db, { tenant: 'alpha', seasonKey: 'intl-v2.3:S5', itemKey: 'member-roster', checked: true, checkedBy: 'U1', checkedByName: '甲军官', now: 1760000001 });
  await checksRepo.setSeasonChecklistCheck(db, { tenant: 'beta', seasonKey: 'intl-v2.3:S5', itemKey: 'current-dungeons', checked: true, checkedBy: 'U2', checkedByName: '乙军官', now: 1760000002 });
  let rows = await checksRepo.listSeasonChecklistChecks(db, 'alpha', 'intl-v2.3:S5');
  eq('checklist rows per guild+season', rows.map((r) => [r.item_key, r.checked, r.checked_by_name]), [['current-dungeons', 1, '甲军官'], ['member-roster', 1, '甲军官']]);
  eq('checklist season isolation', await checksRepo.listSeasonChecklistChecks(db, 'alpha', 'intl-v9.9:S6'), []);
  await checksRepo.setSeasonChecklistCheck(db, { tenant: 'alpha', seasonKey: 'intl-v2.3:S5', itemKey: 'current-dungeons', checked: false, checkedBy: 'U1', checkedByName: '甲军官', now: 1760000003 });
  rows = await checksRepo.listSeasonChecklistChecks(db, 'alpha', 'intl-v2.3:S5');
  eq('uncheck upserts in place', rows.map((r) => [r.item_key, r.checked]), [['current-dungeons', 0], ['member-roster', 1]]);

  eq('normalize strips spaces + folds case', rosterRepo.normalizeRosterName(' 老 Mo '), '老mo');
  check('plausible: CJK name', rosterRepo.isPlausibleRosterName('新侠客'));
  check('implausible: digits only', !rosterRepo.isPlausibleRosterName('12345'));
  check('implausible: too short', !rosterRepo.isPlausibleRosterName('阿'));
  const memberByNorm = new Map([[rosterRepo.normalizeRosterName('阿青'), { discordId: 'D1', displayName: '阿青' }]]);
  eq('classify matched', rosterRepo.classifyRosterLine('阿 青', memberByNorm, new Map()).status, 'matched');
  eq('classify new', rosterRepo.classifyRosterLine('新侠客', memberByNorm, new Map()).status, 'new');
  eq('classify unrecognized', rosterRepo.classifyRosterLine('100', memberByNorm, new Map()).status, 'unrecognized');

  eq('roster count empty', await rosterRepo.countGuildRosterEntries(db, 'alpha'), 0);
  const ins1 = await rosterRepo.insertGuildRosterEntry(db, { tenant: 'alpha', displayName: '新侠客', source: 'ocr', matchedDiscordId: null, createdBy: 'U1', now: 1760000000 });
  eq('roster insert created', ins1.created, true);
  const ins2 = await rosterRepo.insertGuildRosterEntry(db, { tenant: 'alpha', displayName: '新 侠客', source: 'ocr', matchedDiscordId: null, createdBy: 'U1', now: 1760000001 });
  eq('roster insert dedupes by normalized name', [ins2.created, ins2.id === ins1.id], [false, true]);
  eq('roster count after dedupe', await rosterRepo.countGuildRosterEntries(db, 'alpha'), 1);
  eq('roster list shape', (await rosterRepo.listGuildRosterEntries(db, 'alpha')).map((r) => [r.display_name, r.name_norm, r.source, r.matched_discord_id]), [['新侠客', '新侠客', 'ocr', null]]);

  const batchId = await rosterRepo.createRosterImportBatch(db, { tenant: 'alpha', createdBy: 'U1', imageCount: 2, now: 1760000000 });
  check('batch id issued', batchId > 0);
  const rowId = await rosterRepo.insertRosterImportRow(db, batchId, 'alpha', rosterRepo.classifyRosterLine('某某', memberByNorm, new Map()));
  eq('batch tenant scoping', await rosterRepo.getRosterImportBatch(db, 'beta', batchId), null);
  eq('batch row readback', (await rosterRepo.listRosterImportRows(db, batchId)).map((r) => [r.raw_name, r.status]), [['某某', 'new']]);
  await rosterRepo.markRosterImportRowImported(db, rowId, ins1.id);
  eq('row marked imported', (await rosterRepo.listRosterImportRows(db, batchId))[0].created_entry_id, ins1.id);
  await rosterRepo.confirmRosterImportBatch(db, batchId, 1760000100);
  eq('batch confirmed', (await rosterRepo.getRosterImportBatch(db, 'alpha', batchId))?.status, 'confirmed');
  eq('delete entry cross-tenant refused', await rosterRepo.deleteGuildRosterEntry(db, 'beta', ins1.id), false);
  eq('delete entry own tenant', await rosterRepo.deleteGuildRosterEntry(db, 'alpha', ins1.id), true);
}

/* ---------------- availability + polls + custom fields (F5/F13/F7) ---------------- */
if (want('schedule')) {
  console.log('== availability + time_polls + custom fields repositories on real D1 ==');
  const av = await import('../src/domains/groupings/availability.ts');
  const pl = await import('../src/domains/groupings/polls.ts');
  const cf = await import('../src/domains/groupings/customfields.ts');

  await av.upsertMemberAvailability(db, { tenant: 'alpha', discordId: 'U1', displayName: '甲', slots: [{ weekday: 5, startMinute: 1140, endMinute: 1320 }], updatedAt: 1760000000 });
  await av.upsertMemberAvailability(db, { tenant: 'alpha', discordId: 'U1', displayName: '甲', slots: [{ weekday: 6, startMinute: 600, endMinute: 720 }], updatedAt: 1760000100 });
  const avRow = await av.getMemberAvailability(db, 'alpha', 'U1');
  eq('availability upsert replaces the whole set', av.parseAvailabilitySlots(avRow?.slots_json), [{ weekday: 6, startMinute: 600, endMinute: 720 }]);
  eq('availability is tenant-scoped', await av.getMemberAvailability(db, 'beta', 'U1'), null);
  eq('guild availability list', (await av.listGuildAvailability(db, 'alpha')).map((r) => r.discord_id), ['U1']);
  eq('guild availability list is tenant-scoped', (await av.listGuildAvailability(db, 'beta')).length, 0);

  const p = await pl.insertTimePoll(db, { tenant: 'alpha', title: '开荒时间', status: 'open', created_by: 'U1', created_at: 1760000000, closed_at: null });
  const pid = p.last_row_id;
  const po1 = await pl.insertTimePollOption(db, { pollId: pid, startsAtUtc: 1760100000 });
  const po2 = await pl.insertTimePollOption(db, { pollId: pid, startsAtUtc: 1760200000 });
  eq('poll options roundtrip sorted', (await pl.listTimePollOptions(db, pid)).map((o) => o.starts_at_utc), [1760100000, 1760200000]);
  eq('poll list is tenant-scoped', (await pl.listTimePolls(db, 'beta')).length, 0);
  await pl.replaceTimePollVotes(db, { pollId: pid, discordId: 'U2', displayName: '乙', optionIds: [po1.last_row_id, po2.last_row_id] });
  eq('multi-select votes stored', (await pl.listTimePollVotes(db, pid)).map((v) => v.option_id), [po1.last_row_id, po2.last_row_id]);
  await pl.replaceTimePollVotes(db, { pollId: pid, discordId: 'U2', displayName: '乙', optionIds: [po2.last_row_id] });
  eq('re-vote replaces the whole set', (await pl.listTimePollVotes(db, pid)).map((v) => v.option_id), [po2.last_row_id]);
  let dupVoteThrew = false;
  try {
    await db.prepare('INSERT INTO time_poll_votes (poll_id, option_id, discord_id, display_name) VALUES (?, ?, ?, ?)').bind(pid, po2.last_row_id, 'U2', '乙').run();
  } catch { dupVoteThrew = true; }
  check('duplicate vote for one option is rejected by the schema', dupVoteThrew);
  await pl.closeTimePoll(db, pid, 1760300000);
  const closedPoll = await pl.getTimePoll(db, pid);
  eq('close persists status + time', closedPoll && [closedPoll.status, closedPoll.closed_at], ['closed', 1760300000]);

  // Custom fields + answers against a real event row (FK target).
  const evRepo = await import('../src/domains/groupings/events.ts');
  const evIns = await evRepo.insertEvent(db, { tenant: 'alpha', title: '字段车', type: 'activity', starts_at_utc: 1760400000, max_slots: 10, status: 'open', origin: 'member', creator_discord_id: 'U1' });
  const evId = evIns.last_row_id;
  await cf.replaceCustomFields(db, 'event', evId, [
    { label: '联系方式', fieldType: 'text', options: [], required: true },
    { label: '吃辣', fieldType: 'choice', options: ['辣', '不辣'], required: false },
  ]);
  const fieldRows = await cf.listCustomFields(db, 'event', evId);
  eq('custom fields roundtrip', fieldRows.map((f) => f.label), ['联系方式', '吃辣']);
  eq('custom fields are owner-scoped', (await cf.listCustomFields(db, 'template', evId)).length, 0);
  await cf.insertSignupAnswer(db, { eventId: evId, signupUid: 'q1', fieldId: fieldRows[0].id, value: 'wx-1' });
  eq('answers roundtrip', (await cf.listSignupAnswersByEvent(db, evId)).map((a) => a.value), ['wx-1']);
  let dupAnsThrew = false;
  try { await cf.insertSignupAnswer(db, { eventId: evId, signupUid: 'q1', fieldId: fieldRows[0].id, value: 'wx-2' }); }
  catch { dupAnsThrew = true; }
  check('duplicate answer for one field is rejected by the schema', dupAnsThrew);
  await cf.deleteSignupAnswersByEventUid(db, evId, 'q1');
  eq('answers delete with the seat uid', (await cf.listSignupAnswersByEvent(db, evId)).length, 0);
  await cf.replaceCustomFields(db, 'event', evId, []);
  eq('replace with empty set clears fields', (await cf.listCustomFields(db, 'event', evId)).length, 0);
}

await mf.dispose();
console.log(`\n== verify-repositories-d1: ${pass} passed, ${fail} failed ==`);
if (fail) { console.log('FAILS:', fails.join(' | ')); process.exit(1); }
