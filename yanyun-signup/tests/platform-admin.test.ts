// Platform-admin acceptance (hub overhaul, 2026-10-28 ruling): the
// retired hub portal's capabilities re-proven against their new home
// — the main site's GraphQL surface guarded by the gating-layer
// platform-admin gate.
//   - SDL pins: Viewer.platformAdmin + the result union + all admin
//     mutations exist in the served schema.
//   - Gate composition: the env-floor admin and roster admins compose
//     PlatformAdmin with full data; a plain signed-in user and an
//     anonymous viewer compose PlatformAdminLocked and receive ZERO
//     admin data (a seeded guild name never appears in the payload).
//   - Mutations re-evaluate the gate: a non-admin's writes answer
//     platformAdminRequired and change nothing.
//   - Parity of effect: paygate flips read back through the billing
//     service; grant (tier + legacy) moves the effective entitlement
//     verdict and revoke restores it; roster edits open and close the
//     surface for another admin (gate rollback proof); settings,
//     bosses, dungeons, feedback, reminders, heirlooms, backfills and
//     tenant deletion all land like the portal's did.
//   - Audit: every action lands in hub_audit_log with the acting
//     admin's REAL Discord ID as actor — never the generic 'hub'.
// Real D1 (Miniflare, migration-chain bootstrap), real yoga + real
// resolvers (billing.test.ts pattern).
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { describe, it, expect, afterAll } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { typeDefs } from '../src/graphql-schema.ts';
import { insertTenant } from '../src/domains/guilds/tenants.ts';
import { setSettingValue } from '../src/domains/guilds/settings.ts';
import { insertFeedback } from '../src/domains/platform/feedback.ts';
import { listHubAuditPage } from '../src/domains/platform/hub-audit.ts';
import {
  isPaygateEnabled, getEffectiveEntitlement,
} from '../src/domains/platform/billing-service.ts';
import { insertBoss, updateBossFields, listAllBosses } from '../src/domains/dex/index.ts';
import { insertDungeonDex } from '../src/domains/dex/index.ts';
import { getEventTenantCreator } from '../src/domains/groupings/index.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: unknown, want: unknown) {
  check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
}

const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: { DB: 'harness-platform-admin' },
}));
const db = await mf.getD1Database('DB');
{
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
  console.log('[platform-admin] bootstrapped from migration chain:', files.join(', '));
}

/* ---------- fixtures ---------- */
await insertTenant(db, { slug: 'alpha', guildName: '甲百业', passwordHash: 'x', announcement: '甲公告' });
await insertTenant(db, { slug: 'beta', guildName: '乙百业', passwordHash: 'x', announcement: '' });
await setSettingValue(db, '', 'game_version', 'intl-v2.3');
await insertFeedback(db, { discordId: 'USER9', userName: '反馈者', category: 'bug', content: '反馈内容甲', createdAt: 1760000000000 });
const bossFixture = await insertBoss(db, { name: '测试首领', talent: '', source: '', note: '', sortOrder: 10 });
const BOSS_ID = (bossFixture as any).last_row_id as number;
await updateBossFields(db, BOSS_ID, { guide: '第一阶段\n机制说明若干', dungeon: '云梦金明池' });
const dungeonFixture = await insertDungeonDex(db, { name: '测试副本', size: 10, season: 'S5', category: '传薪', level: 100 });
const DUNGEON_ID = (dungeonFixture as any).last_row_id as number;
// Creator-backfill fixtures: one legacy car whose created_by matches
// exactly one user's global name.
await db.prepare('INSERT INTO users (discord_id, username, guilds_json) VALUES (?, ?, ?)')
  .bind('U100', '车头甲', '[]').run();
await db.prepare('INSERT INTO events (tenant, title, created_by, creator_discord_id) VALUES (?, ?, ?, ?)')
  .bind('alpha', '旧车一辆', '车头甲', '').run();
const legacyCar = await db.prepare('SELECT id FROM events WHERE tenant = ? ORDER BY id DESC LIMIT 1')
  .bind('alpha').first<{ id: number }>();
const LEGACY_CAR_ID = legacyCar!.id;

const env = { DB: db, PLATFORM_ADMIN_DISCORD_IDS: 'ADMIN1' };
const envNoFloor = { DB: db };
const adminUser = { discordId: 'ADMIN1', name: '超管甲', guilds: [] as string[] };
const rosterUser = { discordId: 'ADMIN2', name: '超管乙', guilds: [] as string[] };
const plainUser = { discordId: 'USER1', name: '路人', guilds: [] as string[] };

async function gql(query: string, { user = adminUser, variables, env: useEnv = env }: any = {}) {
  const ctx = {
    env: useEnv, request: new Request('http://local/graphql'), user,
    locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai',
    executionCtx: { waitUntil() {} },
  };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

const ADMIN_Q = `query {
  viewer { platformAdmin {
    __typename
    ... on PlatformAdmin {
      entryLabel title
      tenants { slug guildName eventCount }
      billing { paygateEnabled stripeConfigured plans { tier name priceMonthlyCents }
                tenants { slug plan tier tierName subdomainEnabled } }
      errors { id } errorCount24h
      settings { gameVersion gameVersionCode }
      bosses { id name dungeon }
      dungeons { id name isCurrent }
      reminders { slug webhookSet enabled }
      heirlooms { slug webhookSet enabled }
      backups { available entries { key } }
      adminRoster
    }
    ... on PlatformAdminLocked { lockedTitle lockedBody }
  } }
}`;

describe('platform-admin surface', () => {
  it('SDL pins: field, union and mutations are served', () => {
    check('Viewer.platformAdmin field', /platformAdmin: PlatformAdminResult!/.test(typeDefs));
    check('result union', /union PlatformAdminResult = PlatformAdmin \| PlatformAdminLocked/.test(typeDefs));
    for (const m of [
      'platformAdminSetPaygate', 'platformAdminGrantPremium', 'platformAdminRevokePremium',
      'platformAdminSetSubdomain', 'platformAdminSetCustomDomainDisabled', 'platformAdminDeleteTenant',
      'platformAdminSetFeedbackStatus', 'platformAdminUpdateSettings', 'platformAdminCreateBoss',
      'platformAdminUpdateBoss', 'platformAdminDeleteBoss', 'platformAdminUpdateDungeon',
      'platformAdminUpdateReminder', 'platformAdminTestReminder', 'platformAdminUpdateHeirloom',
      'platformAdminTestHeirloom', 'platformAdminRunBackup', 'platformAdminSetRoster',
      'platformAdminBackfillReminderIdentity', 'platformAdminBackfillCreators',
      'platformAdminMigrateBossGuides',
    ]) {
      check(`mutation ${m}`, typeDefs.includes(m + '(') || typeDefs.includes(m + ':'));
    }
    check('Locked carries no data fields', !/type PlatformAdminLocked \{[^}]*tenants/.test(typeDefs));
  });

  it('anonymous and plain users compose Locked with zero admin data', async () => {
    for (const [label, user] of [['anonymous', null], ['plain user', plainUser]] as const) {
      const res = await gql(ADMIN_Q, { user });
      const pa = res.data.viewer.platformAdmin;
      eq(`${label}: typename`, pa.__typename, 'PlatformAdminLocked');
      eq(`${label}: locked title`, pa.lockedTitle, '需要平台超管权限');
      const raw = JSON.stringify(res);
      check(`${label}: no guild data leaks`, !raw.includes('甲百业') && !raw.includes('乙百业'));
      check(`${label}: no roster leaks`, !raw.includes('ADMIN1'));
      check(`${label}: no GraphQL errors`, !res.errors, JSON.stringify(res.errors || {}));
    }
  });

  it('env-floor admin composes the full surface', async () => {
    const res = await gql(ADMIN_Q);
    check('no GraphQL errors', !res.errors, JSON.stringify(res.errors || {}));
    const pa = res.data.viewer.platformAdmin;
    eq('typename', pa.__typename, 'PlatformAdmin');
    eq('entry label', pa.entryLabel, '平台管理');
    eq('tenants', pa.tenants.map((t: any) => t.slug), ['alpha', 'beta']);
    eq('paygate off by default', pa.billing.paygateEnabled, false);
    eq('stripe unconfigured', pa.billing.stripeConfigured, false);
    eq('plans are the settled catalog', pa.billing.plans.map((p: any) => [p.tier, p.name, p.priceMonthlyCents]),
      [[1, '同道', 399], [2, '执事', 599], [3, '盟主', 799]]);
    eq('settings read', pa.settings.gameVersion, 'intl-v2.3');
    eq('roster = env floor', pa.adminRoster, ['ADMIN1']);
    eq('backups unavailable without R2', pa.backups.available, false);
    check('boss fixture listed', pa.bosses.some((b: any) => b.id === BOSS_ID));
    check('dungeon fixture listed', pa.dungeons.some((d: any) => d.id === DUNGEON_ID));
    check('reminder state listed for alpha', pa.reminders.some((r: any) => r.slug === 'alpha' && r.webhookSet === false));
  });

  it('non-admin mutations are refused and change nothing', async () => {
    const res = await gql(`mutation { platformAdminSetPaygate(enabled: true) { ok errorCode } }`, { user: plainUser });
    eq('errorCode', res.data.platformAdminSetPaygate.errorCode, 'platformAdminRequired');
    eq('ok', res.data.platformAdminSetPaygate.ok, false);
    check('paygate still off', !(await isPaygateEnabled(db)));
    const anon = await gql(`mutation { platformAdminDeleteTenant(slug: "alpha") { ok errorCode } }`, { user: null });
    eq('anonymous delete refused', anon.data.platformAdminDeleteTenant.errorCode, 'platformAdminRequired');
  });

  it('paygate flips through the new surface and audits the real actor', async () => {
    const on = await gql(`mutation { platformAdminSetPaygate(enabled: true) { ok billing { paygateEnabled } } }`);
    eq('payload ok', on.data.platformAdminSetPaygate.ok, true);
    eq('payload billing reflects the flip', on.data.platformAdminSetPaygate.billing.paygateEnabled, true);
    check('service verdict flipped', await isPaygateEnabled(db));
    const off = await gql(`mutation { platformAdminSetPaygate(enabled: false) { ok billing { paygateEnabled } } }`);
    eq('flip back', off.data.platformAdminSetPaygate.billing.paygateEnabled, false);
    const page = await listHubAuditPage(db, { limit: 200 });
    const flips = page.entries.filter((e) => e.action === 'billing.paygate');
    eq('two flips audited', flips.length, 2);
    check('actor is the real admin id', flips.every((e) => e.actor === 'ADMIN1'));
  });

  it('grant (tier + legacy) moves entitlement verdicts; revoke restores', async () => {
    const g = await gql(`mutation { platformAdminGrantPremium(slug: "alpha", days: 30, tier: "t2") {
      ok billing { tenants { slug tier tierName plan } } } }`);
    eq('grant ok', g.data.platformAdminGrantPremium.ok, true);
    const alphaRow = g.data.platformAdminGrantPremium.billing.tenants.find((t: any) => t.slug === 'alpha');
    eq('alpha tier after grant', [alphaRow.tier, alphaRow.tierName], [2, '执事']);
    eq('effective entitlement verdict', (await getEffectiveEntitlement(db, 'alpha')).tier, 2);

    const badTier = await gql(`mutation { platformAdminGrantPremium(slug: "alpha", days: 30, tier: "t9") { ok errorCode } }`);
    eq('unknown tier refused', badTier.data.platformAdminGrantPremium.errorCode, 'tierInvalid');
    eq('verdict unchanged after refused grant', (await getEffectiveEntitlement(db, 'alpha')).tier, 2);

    const legacy = await gql(`mutation { platformAdminGrantPremium(slug: "beta", days: 30) {
      ok billing { tenants { slug plan tier } } } }`);
    const betaRow = legacy.data.platformAdminGrantPremium.billing.tenants.find((t: any) => t.slug === 'beta');
    eq('legacy grant = premium plan', betaRow.plan, 'premium');
    eq('legacy premium reads as tier 3', (await getEffectiveEntitlement(db, 'beta')).tier, 3);

    const r = await gql(`mutation { platformAdminRevokePremium(slug: "alpha") { ok } }`);
    eq('revoke ok', r.data.platformAdminRevokePremium.ok, true);
    eq('alpha back to free', (await getEffectiveEntitlement(db, 'alpha')).tier, 0);

    const missing = await gql(`mutation { platformAdminGrantPremium(slug: "ghost", days: 30) { ok errorCode } }`);
    eq('unknown guild refused', missing.data.platformAdminGrantPremium.errorCode, 'guildNotFound');

    const page = await listHubAuditPage(db, { limit: 200 });
    const grants = page.entries.filter((e) => e.action === 'billing.grant');
    check('grants audited with real actor', grants.length >= 2 && grants.every((e) => e.actor === 'ADMIN1'));
  });

  it('roster edits open and close the surface (gate rollback proof)', async () => {
    const before = await gql(ADMIN_Q, { user: rosterUser });
    eq('roster candidate starts locked', before.data.viewer.platformAdmin.__typename, 'PlatformAdminLocked');

    const set = await gql(`mutation { platformAdminSetRoster(discordIds: ["ADMIN2"]) { ok adminRoster } }`);
    eq('roster write ok', set.data.platformAdminSetRoster.ok, true);
    eq('effective roster = floor + roster', set.data.platformAdminSetRoster.adminRoster, ['ADMIN1', 'ADMIN2']);

    const opened = await gql(ADMIN_Q, { user: rosterUser });
    eq('roster admin now composes the surface', opened.data.viewer.platformAdmin.__typename, 'PlatformAdmin');

    const wipe = await gql(`mutation { platformAdminSetRoster(discordIds: []) { ok adminRoster } }`, { user: rosterUser });
    eq('roster admin can wipe (incl. itself)', wipe.data.platformAdminSetRoster.ok, true);
    const closed = await gql(ADMIN_Q, { user: rosterUser });
    eq('wiped roster closes the surface again', closed.data.viewer.platformAdmin.__typename, 'PlatformAdminLocked');
    const deniedWrite = await gql(`mutation { platformAdminSetPaygate(enabled: true) { ok errorCode } }`, { user: rosterUser });
    eq('closed gate refuses writes', deniedWrite.data.platformAdminSetPaygate.errorCode, 'platformAdminRequired');

    // Total rollback: no env floor and an empty roster locks out even
    // the bootstrap admin — the gate has no back door.
    const bare = await gql(ADMIN_Q, { env: envNoFloor });
    eq('no floor + empty roster = locked for everyone', bare.data.viewer.platformAdmin.__typename, 'PlatformAdminLocked');
  });

  it('settings, feedback, boss and dungeon writes land', async () => {
    const s = await gql(`mutation { platformAdminUpdateSettings(gameVersion: "intl-v9.9") { ok } }`);
    eq('settings write ok', s.data.platformAdminUpdateSettings.ok, true);
    const after = await gql(ADMIN_Q);
    eq('settings read back', after.data.viewer.platformAdmin.settings.gameVersion, 'intl-v9.9');

    const fb = await gql(`query { viewer { platformAdmin { ... on PlatformAdmin {
      feedbackEntries { total entries { id status content } } } } } }`);
    const page = fb.data.viewer.platformAdmin.feedbackEntries;
    eq('feedback listed', page.total, 1);
    const fid = page.entries[0].id;
    const rs = await gql(`mutation($id: Int!) { platformAdminSetFeedbackStatus(id: $id, status: "resolved") { ok } }`,
      { variables: { id: fid } });
    eq('feedback resolve ok', rs.data.platformAdminSetFeedbackStatus.ok, true);
    const fb2 = await gql(`query { viewer { platformAdmin { ... on PlatformAdmin {
      feedbackEntries(status: "resolved") { total entries { status } } } } } }`);
    eq('resolved filter sees it', fb2.data.viewer.platformAdmin.feedbackEntries.total, 1);
    const nf = await gql(`mutation { platformAdminSetFeedbackStatus(id: 99999, status: "resolved") { ok errorCode } }`);
    eq('missing feedback refused', nf.data.platformAdminSetFeedbackStatus.errorCode, 'feedbackNotFound');

    const cb = await gql(`mutation { platformAdminCreateBoss(name: "新首领", sortOrder: 5) { ok bossId } }`);
    eq('boss create ok', cb.data.platformAdminCreateBoss.ok, true);
    const newBossId = cb.data.platformAdminCreateBoss.bossId;
    check('boss id assigned', typeof newBossId === 'number' && newBossId > 0);
    const ub = await gql(`mutation($id: Int!) { platformAdminUpdateBoss(id: $id, note: "备注甲") { ok } }`,
      { variables: { id: newBossId } });
    eq('boss update ok', ub.data.platformAdminUpdateBoss.ok, true);
    const empty = await gql(`mutation($id: Int!) { platformAdminUpdateBoss(id: $id) { ok errorCode } }`,
      { variables: { id: newBossId } });
    eq('empty boss update refused', empty.data.platformAdminUpdateBoss.errorCode, 'noFieldsToUpdate');
    const del = await gql(`mutation($id: Int!) { platformAdminDeleteBoss(id: $id) { ok } }`,
      { variables: { id: newBossId } });
    eq('boss delete ok', del.data.platformAdminDeleteBoss.ok, true);
    check('boss gone from the repository', !(await listAllBosses(db)).some((b) => b.id === newBossId));

    const du = await gql(`mutation($id: Int!) { platformAdminUpdateDungeon(id: $id, isCurrent: true, videoTitle: "视频甲") { ok } }`,
      { variables: { id: DUNGEON_ID } });
    eq('dungeon update ok', du.data.platformAdminUpdateDungeon.ok, true);
    const afterD = await gql(ADMIN_Q);
    const dRow = afterD.data.viewer.platformAdmin.dungeons.find((d: any) => d.id === DUNGEON_ID);
    eq('dungeon now current', dRow.isCurrent, true);
  });

  it('reminder + heirloom config writes behave like the portal', async () => {
    const bad = await gql(`mutation { platformAdminUpdateReminder(slug: "alpha", webhook: "https://evil.example/hook") { ok errorCode } }`);
    eq('bad webhook refused', bad.data.platformAdminUpdateReminder.errorCode, 'webhookFormatInvalid');

    const set = await gql(`mutation { platformAdminUpdateReminder(slug: "alpha",
      webhook: "https://discord.com/api/webhooks/123456/abcdefSECRET", enabled: true) {
      ok reminder { slug webhookSet webhookMasked enabled } } }`);
    eq('reminder write ok', set.data.platformAdminUpdateReminder.ok, true);
    const rem = set.data.platformAdminUpdateReminder.reminder;
    eq('webhook set', rem.webhookSet, true);
    eq('enabled', rem.enabled, true);
    check('full webhook never leaves the server', !String(rem.webhookMasked).includes('abcdefSECRET'));

    const hs = await gql(`mutation { platformAdminUpdateHeirloom(slug: "alpha",
      webhook: "https://discord.com/api/webhooks/999999/zzzzzz", enabled: true) {
      ok heirloom { webhookSet enabled } } }`);
    eq('heirloom write ok', hs.data.platformAdminUpdateHeirloom.ok, true);
    eq('heirloom webhook set', hs.data.platformAdminUpdateHeirloom.heirloom.webhookSet, true);
    // The heirloom write must not touch the reminder webhook.
    const afterQ = await gql(ADMIN_Q);
    const remAfter = afterQ.data.viewer.platformAdmin.reminders.find((r: any) => r.slug === 'alpha');
    eq('reminder config untouched by heirloom write', remAfter.webhookSet, true);

    const clear = await gql(`mutation { platformAdminUpdateReminder(slug: "alpha", webhook: "") {
      ok reminder { webhookSet } } }`);
    eq('webhook clear ok', clear.data.platformAdminUpdateReminder.ok, true);
    eq('webhook cleared', clear.data.platformAdminUpdateReminder.reminder.webhookSet, false);

    const ghost = await gql(`mutation { platformAdminUpdateReminder(slug: "ghost", enabled: true) { ok errorCode } }`);
    eq('unknown guild refused', ghost.data.platformAdminUpdateReminder.errorCode, 'guildNotFound');
  });

  it('backfills run through the new mutations', async () => {
    const dry = await gql(`mutation { platformAdminBackfillCreators(dryRun: true) {
      ok dryRun considered backfilled alreadyStamped } }`);
    eq('creator dry-run ok', dry.data.platformAdminBackfillCreators.ok, true);
    eq('one legacy car considered', dry.data.platformAdminBackfillCreators.considered, 1);
    eq('one unique match found', dry.data.platformAdminBackfillCreators.backfilled, 1);
    eq('dry run stamps nothing', (await getEventTenantCreator(db, LEGACY_CAR_ID))?.creator_discord_id ?? '', '');

    const real = await gql(`mutation { platformAdminBackfillCreators(dryRun: false) {
      ok considered backfilled } }`);
    eq('real run backfills', real.data.platformAdminBackfillCreators.backfilled, 1);
    eq('creator stamped from the unique match', (await getEventTenantCreator(db, LEGACY_CAR_ID))?.creator_discord_id, 'U100');

    const again = await gql(`mutation { platformAdminBackfillCreators(dryRun: false) {
      ok considered alreadyStamped } }`);
    eq('idempotent: stamped cars are skipped', again.data.platformAdminBackfillCreators.alreadyStamped, 1);
    eq('idempotent: nothing left to consider', again.data.platformAdminBackfillCreators.considered, 0);

    const ri = await gql(`mutation { platformAdminBackfillReminderIdentity(dryRun: true) {
      ok dryRun rosterSeeded seatsTotal stamped } }`);
    eq('reminder-identity dry run ok (no bound guilds)', ri.data.platformAdminBackfillReminderIdentity.ok, true);
    eq('no bound guilds -> no work', ri.data.platformAdminBackfillReminderIdentity.seatsTotal, 0);

    const mig = await gql(`mutation { platformAdminMigrateBossGuides { ok migrated { id name } } }`);
    eq('guide migration ok', mig.data.platformAdminMigrateBossGuides.ok, true);
    check('fixture boss materialized', mig.data.platformAdminMigrateBossGuides.migrated.some((m: any) => m.id === BOSS_ID));
    const bossRow = (await listAllBosses(db)).find((b) => b.id === BOSS_ID);
    check('structured columns written', bossRow != null && bossRow.mechanics_json !== null);
  });

  it('backup run without R2 refuses with the catalog error; tenant delete lands', async () => {
    const bk = await gql(`mutation { platformAdminRunBackup { ok errorCode } }`);
    eq('backup run refused without binding', bk.data.platformAdminRunBackup.errorCode, 'backupStorageMissing');

    const del = await gql(`mutation { platformAdminDeleteTenant(slug: "beta") { ok } }`);
    eq('tenant delete ok', del.data.platformAdminDeleteTenant.ok, true);
    const after = await gql(ADMIN_Q);
    eq('beta gone from the tenant list', after.data.viewer.platformAdmin.tenants.map((t: any) => t.slug), ['alpha']);
  });

  it('every audit row carries the real actor, never the generic hub', async () => {
    const res = await gql(`query { viewer { platformAdmin { ... on PlatformAdmin {
      auditEntries(limit: 5) { total entries { actor action } } } } } }`);
    const page = res.data.viewer.platformAdmin.auditEntries;
    check('audit page has entries', page.total > 5, `total=${page.total}`);
    check('page actors are the admin', page.entries.every((e: any) => e.actor === 'ADMIN1'));
    const all = await listHubAuditPage(db, { limit: 200 });
    check('audit rows exist', all.entries.length > 10, `rows=${all.entries.length}`);
    check('no generic hub actor anywhere', all.entries.every((e) => e.actor !== 'hub'),
      JSON.stringify(all.entries.filter((e) => e.actor === 'hub').map((e) => e.action)));
    const actions = new Set(all.entries.map((e) => e.action));
    for (const a of ['billing.paygate', 'billing.grant', 'billing.revoke', 'tenant.delete',
      'settings.update', 'boss.create', 'dungeon.update', 'reminder.update', 'heirloom.update',
      'feedback.status', 'backfill.creator_stamps', 'boss.migrate_structured', 'platform_admin.roster']) {
      check(`audit action ${a}`, actions.has(a));
    }
  });

  afterAll(async () => { await mf.dispose(); });
});
