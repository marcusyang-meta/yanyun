/* ===================================================
 * Account self-service acceptance: data export + account deletion
 * (research_notes/account-deletion/DESIGN.md, all six recommendations
 * adopted). Runs the REAL account service and the REAL yoga GraphQL
 * surface against a REAL local D1 (Miniflare) bootstrapped from the
 * migration chain — the cascade's write paths are exactly the class
 * of code FakeDB cannot validate (the templates UPDATE bug class).
 *
 * Chain under test, on fixture accounts only:
 *   stale-auth export rejected -> fresh export with per-section
 *   reconciliation + credential red lines (seeded refresh/push token
 *   values and the seat contact never appear) -> 24h rate limit ->
 *   deletion request gates (fresh auth, typed display name) ->
 *   pending state composed by GraphQL (accountPendingDeletion) ->
 *   cancel via mutation AND via the fresh-login settlement -> sweep
 *   not-due no-op -> sweep due executes -> per-table disposition
 *   matrix (cars orphaned, seats anonymized in place incl. the
 *   double-seat uid uniqueness, personal data gone, the other user's
 *   rows untouched) -> sessions void (grant check false) -> executor
 *   idempotent -> re-registration starts from a clean slate.
 * =================================================== */
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log('PASS', name); }
  else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); console.log('FAIL', name, extra); }
}
function eq(name, got, want) {
  check(name, JSON.stringify(got) === JSON.stringify(want),
    `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
}

const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: { DB: 'harness-account' },
}));
const db = await mf.getD1Database('DB');

{ // Bootstrap from the migration chain, like the drift gate / verifier.
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { splitSqlStatements } = await import('../scripts/ci/schema-shape.mjs');
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    for (const stmt of splitSqlStatements(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      await db.prepare(stmt).run();
    }
  }
  console.log('[account] bootstrapped from migration chain:', files.join(', '));
}

const acct = await import('../src/domains/identity/account.ts');
const usersRepo = await import('../src/domains/identity/users.ts');
const { hasCompleteDiscordGrant } = await import('../src/domains/identity/auth.ts');
const { yoga } = await import('../src/graphql.ts');

const T0 = 1800000000; // fixed epoch for the deterministic service-level stage
const DAY = 86400;
const U1 = '9001', U2 = '9002';
const NAME1 = '导出测试员', NAME2 = '另一位成员';

/* ---------------- fixture ---------------- */
await db.batch([
  db.prepare(`INSERT INTO tenants (slug, guild_name, password_hash) VALUES ('accttest', '账号测试百业', 'x')`),
  db.prepare(`INSERT INTO users (discord_id, username, avatar, guilds_json, guilds_checked_at, locale_pref)
    VALUES ('${U1}', '${NAME1}', 'av1', '[{"id":"G1","name":"测试服务器","icon":"","owner":false}]', ${T0}, 'en')`),
  db.prepare(`INSERT INTO users (discord_id, username, avatar, guilds_json, guilds_checked_at)
    VALUES ('${U2}', '${NAME2}', 'av2', '[]', ${T0})`),
  db.prepare(`INSERT INTO user_oauth (discord_id, refresh_token, scope, refresh_state, last_refresh_at, updated_at)
    VALUES ('${U1}', 'SECRET-REFRESH-U1', 'identify guilds guilds.members.read', 'ok', ${T0}, ${T0})`),
  db.prepare(`INSERT INTO user_oauth (discord_id, refresh_token, scope, refresh_state, last_refresh_at, updated_at)
    VALUES ('${U2}', 'SECRET-REFRESH-U2', 'identify guilds guilds.members.read', 'ok', ${T0}, ${T0})`),
  // E1 led by U1; E2 led by U2.
  db.prepare(`INSERT INTO events (id, title, type, status, tenant, created_by, creator_discord_id, starts_at)
    VALUES (101, 'U1的领队车', 'activity', 'open', 'accttest', '${NAME1}', '${U1}', '2027-02-01 20:00')`),
  db.prepare(`INSERT INTO events (id, title, type, status, tenant, created_by, creator_discord_id, starts_at)
    VALUES (102, 'U2的领队车', 'activity', 'open', 'accttest', '${NAME2}', '${U2}', '2027-02-02 20:00')`),
  // U1 holds TWO seats in U2's car (double-seat uid case), one carrying
  // a private contact string; U2 holds one seat in U1's car.
  db.prepare(`INSERT INTO signups (event_id, nickname, uid, discord_id, contact, weapon)
    VALUES (102, '${NAME1}', 'uid-a', '${U1}', 'SECRET-CONTACT', '破竹·樽')`),
  db.prepare(`INSERT INTO signups (event_id, nickname, uid, discord_id, weapon)
    VALUES (102, '${NAME1}二号位', 'uid-b', '${U1}', '牵丝·玉')`),
  db.prepare(`INSERT INTO signups (event_id, nickname, uid, discord_id, weapon)
    VALUES (101, '${NAME2}', 'uid-c', '${U2}', '裂石·威')`),
  db.prepare(`INSERT INTO user_gear_items (discord_id, slot, name, payload) VALUES ('${U1}', 'weapon', '测试长剑', '{"score":91}')`),
  db.prepare(`INSERT INTO user_gear_items (discord_id, slot, name, payload) VALUES ('${U1}', 'armor', '测试铠甲', '{"score":87}')`),
  db.prepare(`INSERT INTO user_gear_items (discord_id, slot, name, payload) VALUES ('${U2}', 'weapon', 'U2的剑', '{}')`),
  db.prepare(`INSERT INTO user_gear_builds (discord_id, name, target_idx, payload) VALUES ('${U1}', '测试配装', 2, '{"slots":[]}')`),
  db.prepare(`INSERT INTO push_tokens (discord_id, token, platform) VALUES ('${U1}', 'SECRET-PUSH-1', 'ios')`),
  db.prepare(`INSERT INTO push_tokens (discord_id, token, platform) VALUES ('${U1}', 'SECRET-PUSH-2', 'android')`),
  db.prepare(`INSERT INTO push_tokens (discord_id, token, platform) VALUES ('${U2}', 'SECRET-PUSH-3', 'ios')`),
  db.prepare(`INSERT INTO user_guild_nicks (discord_id, guild_id, nick, updated_at) VALUES ('${U1}', 'G1', '服昵U1', ${T0})`),
  db.prepare(`INSERT INTO guild_members (tenant, discord_id, nick, global_name, updated_at) VALUES ('accttest', '${U1}', '服昵U1', '${NAME1}', ${T0})`),
  db.prepare(`INSERT INTO heirloom_item_pushes (tenant, discord_id, build_sig, item_hash, created_at) VALUES ('accttest', '${U1}', 'sig1', 'hash1', ${T0})`),
  db.prepare(`INSERT INTO heirloom_set_state (tenant, discord_id, build_sig, complete, updated_at) VALUES ('accttest', '${U1}', 'sig1', 1, ${T0})`),
  db.prepare(`INSERT INTO grouping_templates (tenant, name, creator_discord_id, created_at) VALUES ('accttest', 'U1的模板', '${U1}', ${T0})`),
  db.prepare(`INSERT INTO grouping_templates (tenant, name, creator_discord_id, created_at) VALUES ('accttest', 'U2的模板', '${U2}', ${T0})`),
  db.prepare(`INSERT INTO creator_backfill_log (event_id, tenant, seat_nickname, resolved_discord_id, outcome, created_at)
    VALUES (101, 'accttest', '服昵U1', '${U1}', 'resolved', ${T0})`),
]);
const q = async (sql, ...binds) => (await db.prepare(sql).bind(...binds).all()).results;
const q1 = async (sql, ...binds) => (await q(sql, ...binds))[0] ?? null;

/* ---------------- export: gates + content ---------------- */
console.log('== export gates ==');
await usersRepo.setFreshAuthAt(db, U1, T0 - 100000); // stale stamp
let r = await acct.exportMyData(db, U1, 'zh-CN', T0);
eq('stale-auth export rejected', r, { ok: false, errorCode: 'accountReauthRequired' });

await usersRepo.setFreshAuthAt(db, U1, T0);
r = await acct.exportMyData(db, U1, 'zh-CN', T0);
check('fresh export ok', r.ok === true, JSON.stringify(r).slice(0, 200));
eq('export counts', r.counts, { guilds: 1, serverNicks: 1, carsLed: 1, seats: 2, gearItems: 2, gearBuilds: 1 });
const doc = JSON.parse(r.json);
eq('export format tag', doc.format, 'user-export v1');
eq('export account identity', [doc.account.discordId, doc.account.username], [U1, NAME1]);
eq('export oauth meta (no credential)', [doc.account.oauth.connected, doc.account.oauth.scope], [true, 'identify guilds guilds.members.read']);
eq('export push token summary', { count: doc.account.pushTokens.count, platforms: [...doc.account.pushTokens.platforms].sort() },
  { count: 2, platforms: ['android', 'ios'] });
eq('export carsLed', doc.carsLed.map((c) => c.title), ['U1的领队车']);
eq('export gear item names', doc.gearItems.map((g) => g.name).sort(), ['测试铠甲', '测试长剑']);
eq('export heirloom rows', [doc.heirloom.pushes.length, doc.heirloom.setState.length], [1, 1]);
check('export JSON carries no refresh token value', !r.json.includes('SECRET-REFRESH'));
check('export JSON carries no push token values', !r.json.includes('SECRET-PUSH'));
check('export JSON carries no seat contact', !r.json.includes('SECRET-CONTACT'));
check('export JSON names no refresh_token field', !r.json.includes('refresh_token'));
check('export excludes the other user entirely', !r.json.includes(NAME2) && !r.json.includes('U2的剑'));

// The audit ledger stamps wall-clock time (platform auditHub design),
// so the 24h window is exercised at real now; the T0 fresh stamp reads
// as fresh there too (negative age), isolating the limit as the gate.
r = await acct.exportMyData(db, U1, 'zh-CN', Math.floor(Date.now() / 1000));
eq('second export within 24h rate-limited', r, { ok: false, errorCode: 'accountExportRateLimited' });
const exportAudit = await q1(`SELECT * FROM hub_audit_log WHERE action = 'account.export' AND actor = '${U1}'`);
check('export audit row written', !!exportAudit);
check('export audit summary holds counts only', !!exportAudit && exportAudit.summary.includes('"gearItems":2') && !exportAudit.summary.includes('SECRET'), exportAudit?.summary);

/* ---------------- deletion request gates ---------------- */
console.log('== deletion request / cancel (service, deterministic time) ==');
r = await acct.requestAccountDeletion(db, U1, '错名字', T0);
eq('typed name mismatch rejected', r, { ok: false, errorCode: 'accountUsernameMismatch' });
r = await acct.requestAccountDeletion(db, U1, NAME1, T0);
check('deletion request ok', r.ok === true, JSON.stringify(r));
eq('executesAt = request + 7d', r.executesAt, T0 + 7 * DAY);
eq('pending stamp stored', (await usersRepo.getAccountRow(db, U1)).deletion_requested_at, T0);
r = await acct.requestAccountDeletion(db, U1, NAME1, T0);
eq('second request while pending rejected', r, { ok: false, errorCode: 'accountDeletionPending' });
r = await acct.cancelAccountDeletion(db, U1);
check('self-service cancel ok', r.ok === true);
eq('pending stamp cleared by cancel', (await usersRepo.getAccountRow(db, U1)).deletion_requested_at, null);
r = await acct.cancelAccountDeletion(db, U1);
eq('cancel with nothing pending rejected', r, { ok: false, errorCode: 'accountDeletionNotPending' });

// Fresh-login settlement cancels a pending request before the deadline.
r = await acct.requestAccountDeletion(db, U1, NAME1, T0);
check('re-request ok', r.ok === true);
const settle = await acct.noteFreshAuthAndSettlePending(db, U1, T0 + 3600);
eq('fresh login before deadline cancels', settle, 'cancelled');
eq('pending cleared by login settlement', (await usersRepo.getAccountRow(db, U1)).deletion_requested_at, null);
const cancelAudits = await q(`SELECT summary FROM hub_audit_log WHERE action = 'account.delete.cancel' AND actor = '${U1}' ORDER BY id`);
eq('both cancel paths audited', cancelAudits.map((a) => JSON.parse(a.summary).via), ['self-service', 'fresh-login']);

/* ---------------- GraphQL surface (real yoga, real now) ---------------- */
console.log('== GraphQL surface ==');
const now = Math.floor(Date.now() / 1000);
await acct.noteFreshAuthAndSettlePending(db, U1, now); // stamp fresh at real now
// The deterministic-stage export audit row sits inside the real-now
// 24h window; clear export audits so the GraphQL export below tests
// the happy path (the limit itself is proven above).
await db.prepare(`DELETE FROM hub_audit_log WHERE action = 'account.export'`).run();

const userU1 = { discordId: U1, name: NAME1, guilds: ['G1'] };
async function gql(query, variables) {
  const ctx = {
    env: { DB: db }, request: new Request('http://local/graphql'), user: userU1,
    locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined,
  };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

let g = await gql(`{ settingsPage { accountSectionTitle freshAuthAt accountPendingDeletion { executesAt } } }`);
eq('GraphQL section title copy', g.data?.settingsPage?.accountSectionTitle, '我的数据');
eq('GraphQL freshAuthAt exposed', g.data?.settingsPage?.freshAuthAt, now);
eq('GraphQL no pending yet', g.data?.settingsPage?.accountPendingDeletion, null);

g = await gql(`mutation($n: String!) { requestAccountDeletion(typedUsername: $n) { ok errorCode executesAt } }`, { n: NAME1 });
check('GraphQL deletion request ok', g.data?.requestAccountDeletion?.ok === true, JSON.stringify(g).slice(0, 200));
g = await gql(`{ settingsPage { accountPendingDeletion { daysLeft accountPendingTitle accountPendingBody } } }`);
const pend = g.data?.settingsPage?.accountPendingDeletion;
check('GraphQL pending composed (object present)', !!pend, JSON.stringify(g).slice(0, 200));
eq('GraphQL pending daysLeft', pend?.daysLeft, 7);
eq('GraphQL pending title', pend?.accountPendingTitle, '账号删除已排期');
check('GraphQL pending body carries the execution date', typeof pend?.accountPendingBody === 'string' && pend.accountPendingBody.includes('执行删除'), pend?.accountPendingBody);

g = await gql(`mutation { cancelAccountDeletion { ok errorCode } }`);
check('GraphQL cancel ok', g.data?.cancelAccountDeletion?.ok === true, JSON.stringify(g).slice(0, 200));
g = await gql(`{ settingsPage { accountPendingDeletion { executesAt } } }`);
eq('GraphQL pending gone after cancel', g.data?.settingsPage?.accountPendingDeletion, null);

g = await gql(`mutation { exportMyData { ok errorCode filename json } }`);
check('GraphQL export ok', g.data?.exportMyData?.ok === true, JSON.stringify(g).slice(0, 200));
eq('GraphQL export filename', g.data?.exportMyData?.filename, 'yanyun-data-export.json');
check('GraphQL export json parses to the v1 document',
  (() => { try { return JSON.parse(g.data.exportMyData.json).format === 'user-export v1'; } catch { return false; } })());

/* ---------------- sweep: not due, then due ---------------- */
console.log('== sweep + disposition matrix ==');
r = await acct.requestAccountDeletion(db, U1, NAME1, now);
check('final request ok', r.ok === true);
eq('sweep before deadline executes nothing', await acct.runDueAccountDeletions(db, now + 3600), 0);
check('account survives the not-due sweep', !!(await usersRepo.getAccountRow(db, U1)));
eq('sweep after deadline executes one', await acct.runDueAccountDeletions(db, now + 8 * DAY), 1);

eq('users row deleted', await usersRepo.getAccountRow(db, U1), null);
eq('oauth row deleted (credentials first)', await q1(`SELECT * FROM user_oauth WHERE discord_id = '${U1}'`), null);
eq('session grant check fails after deletion', await hasCompleteDiscordGrant({ DB: db }, U1), false);
eq('gear items deleted', (await q(`SELECT * FROM user_gear_items WHERE discord_id = '${U1}'`)).length, 0);
eq('gear builds deleted', (await q(`SELECT * FROM user_gear_builds WHERE discord_id = '${U1}'`)).length, 0);
eq('push tokens deleted', (await q(`SELECT * FROM push_tokens WHERE discord_id = '${U1}'`)).length, 0);
eq('server nicks deleted', (await q(`SELECT * FROM user_guild_nicks WHERE discord_id = '${U1}'`)).length, 0);
eq('guild roster rows deleted', (await q(`SELECT * FROM guild_members WHERE discord_id = '${U1}'`)).length, 0);
eq('heirloom pushes deleted', (await q(`SELECT * FROM heirloom_item_pushes WHERE discord_id = '${U1}'`)).length, 0);
eq('heirloom set state deleted', (await q(`SELECT * FROM heirloom_set_state WHERE discord_id = '${U1}'`)).length, 0);

const car = await q1(`SELECT * FROM events WHERE id = 101`);
eq('led car orphaned + display name anonymized', [car.creator_discord_id, car.created_by, car.title], [null, '已注销用户', 'U1的领队车']);
const seats = await q(`SELECT * FROM signups WHERE event_id = 102 ORDER BY id`);
eq('both seats anonymized in place', seats.map((s) => [s.nickname, s.discord_id, s.contact]),
  [['已注销用户', null, ''], ['已注销用户', null, '']]);
check('seat tombstone uids unique per seat (double-seat safe)',
  seats.every((s) => s.uid === `__deleted__${s.id}`) && seats[0].uid !== seats[1].uid,
  seats.map((s) => s.uid).join(','));
const otherSeat = await q1(`SELECT * FROM signups WHERE event_id = 101`);
eq('other user seat untouched', [otherSeat.nickname, otherSeat.discord_id, otherSeat.uid], [NAME2, U2, 'uid-c']);
eq('template creator orphaned', (await q1(`SELECT creator_discord_id FROM grouping_templates WHERE name = 'U1的模板'`)).creator_discord_id, null);
eq('other user template untouched', (await q1(`SELECT creator_discord_id FROM grouping_templates WHERE name = 'U2的模板'`)).creator_discord_id, U2);
const backfill = await q1(`SELECT * FROM creator_backfill_log WHERE event_id = 101`);
eq('backfill log identity cut', [backfill.resolved_discord_id, backfill.seat_nickname], [null, null]);
eq('other user gear intact', (await q(`SELECT * FROM user_gear_items WHERE discord_id = '${U2}'`)).length, 1);
eq('other user push token intact', (await q(`SELECT * FROM push_tokens WHERE discord_id = '${U2}'`)).length, 1);
check('other user account intact', !!(await usersRepo.getAccountRow(db, U2)));

const deleteAudit = await q1(`SELECT * FROM hub_audit_log WHERE action = 'account.delete' AND actor = '${U1}'`);
check('execution audit row written', !!deleteAudit);
const summary = deleteAudit ? JSON.parse(deleteAudit.summary) : {};
eq('execution audit counts', [summary.userRows, summary.oauthRows, summary.seatsAnonymized, summary.carsOrphaned, summary.gearItems, summary.pushTokens],
  [1, 1, 2, 1, 2, 2]);
check('execution audit holds no content', !!deleteAudit && !deleteAudit.summary.includes('SECRET') && !deleteAudit.summary.includes(NAME1));

const again = await acct.executeAccountDeletion(db, U1);
eq('executor idempotent (second run changes nothing)', [again.userRows, again.seatsAnonymized, again.carsOrphaned], [0, 0, 0]);

/* ---------------- re-registration ---------------- */
console.log('== re-registration ==');
await usersRepo.upsertUserOnLogin(db, {
  discordId: U1, username: NAME1, avatar: 'av1',
  guildsJson: '[{"id":"G1","name":"测试服务器","icon":"","owner":false}]', checkedAtSec: now,
});
const reborn = await usersRepo.getAccountRow(db, U1);
check('re-registered account exists with no pending state',
  !!reborn && reborn.deletion_requested_at === null && reborn.fresh_auth_at === null,
  JSON.stringify(reborn));
const rebuilt = await acct.buildAccountExport(db, U1, 'zh-CN', now);
eq('re-registered export is a clean slate', rebuilt?.counts,
  { guilds: 0, serverNicks: 0, carsLed: 0, seats: 0, gearItems: 0, gearBuilds: 0 });

console.log(`\nHARNESS pass=${pass} fail=${fail}`);
if (fail) { console.log('FAILED:', fails.join(' | ')); process.exit(1); }
await mf.dispose();
