// Premium scheduling advice acceptance (T2: P3/P4/P5/P6/P13):
//  - pure engine determinism: same input -> same output, factor
//    order verifiable (healer coverage first in drafts, exact role
//    match first for substitutes, longest-wait first for rotation,
//    coverage-desc for best slots, overlap conflicts + free-member
//    moves cross-car); empty availability yields an empty ranking;
//  - tier matrix over real D1 (Miniflare, migration chain):
//    paygate OFF locks nobody; paygate ON + free guild -> every
//    surface composes ONLY the Locked shell (no advice fields are
//    even queryable on it); paygate ON + manual grant (tier 2)
//    -> full shells with data; revoke re-locks;
//  - P5 audit: saveRotationAdvice writes one record readable back
//    on the detail page, and refuses with premiumRequired while
//    locked (no record written).
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { yoga } from '../src/graphql.ts';
import { OMNISCIENT_VIEWER } from '../src/domains/platform/context.ts';
import { insertTenant } from '../src/domains/guilds/tenants.ts';
import { setPaygateEnabled, grantPremiumManual, revokePremium, tierLocked, effectiveTier } from '../src/domains/platform/billing-service.ts';
import { insertEvent, insertSignup, upsertGuildMember, upsertMemberAvailability } from '../src/domains/groupings/index.ts';
import { insertGearItemRow } from '../src/domains/gear/index.ts';
import {
  buildTeamDraft, rankSubstitutes, rankRotation, rankBestSlots,
  crossCarConflicts, crossCarMoves, neededRoles,
} from '../src/domains/groupings/scheduling.ts';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}
function eq(name, got, want) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* ================= pure engine ================= */
const F = (discordId, over = {}) => ({
  discordId, displayName: 'M' + discordId, role: '输出', weapon: '剑',
  gearItemCount: 3, participations: 4, readyCount: 4, lastParticipatedAt: 1000,
  availableAtEvent: true, ...over,
});
{
  const pool = [F('a'), F('b', { role: '奶', weapon: '牵丝·霖' }), F('c', { gearItemCount: 0, participations: 0, readyCount: 0 })];
  const draft1 = buildTeamDraft(pool, 5);
  const draft2 = buildTeamDraft(pool, 5);
  eq('P3 draft deterministic (same input same output)', draft1, draft2);
  eq('P3 draft seat 0 fills the healer need first', draft1[0].facts.discordId, 'b');
  check('P3 draft reasons carry roleNeeded for the healer', draft1[0].reasons.some((r) => r.key === 'roleNeeded'));
  check('P3 every draft entry carries reasons', draft1.every((d) => d.reasons.length >= 3));
  eq('P3 neededRoles for 5 seats starts with healer', neededRoles(5)[0], '奶');
  eq('P3 neededRoles for 4 seats has no forced healer', neededRoles(4).includes('奶'), false);

  const subs = rankSubstitutes([F('x', { role: '输出' }), F('y', { role: '奶', weapon: '牵丝·霖' })], '奶');
  eq('P4 exact role match ranks first', subs[0].facts.discordId, 'y');
  check('P4 top substitute reason is roleMatch', subs[0].reasons.some((r) => r.key === 'roleMatch'));

  const now = 30 * 86400 + 5000;
  const rot = rankRotation([F('recent', { lastParticipatedAt: now - 86400, participations: 9, readyCount: 9 }), F('waiting', { lastParticipatedAt: 1000, participations: 1, readyCount: 1 })], now);
  eq('P5 longest-waiting applicant ranks first', rot[0].facts.discordId, 'waiting');
  check('P5 rotation reasons expose waiting days', rot[0].reasons.some((r) => r.key === 'longestWaiting' && Number(r.params.days) >= 29));

  eq('P6 empty availability -> empty ranking', rankBestSlots([]), []);
  const best = rankBestSlots([
    { displayName: '甲', slots: [{ weekday: 1, startMinute: 720, endMinute: 840 }] },
    { displayName: '乙', slots: [{ weekday: 1, startMinute: 720, endMinute: 780 }, { weekday: 2, startMinute: 720, endMinute: 780 }] },
  ]);
  eq('P6 top slot is the highest coverage bucket', [best[0].weekday, best[0].startMinute, best[0].coverCount], [1, 720, 2]);
  eq('P6 member names summary sorted', best[0].memberNames, ['乙', '甲'].sort());

  const cars = [
    { id: 1, title: 'A', startsAtUtc: 10000, maxSlots: 2, seats: [{ discordId: 'm1', displayName: '甲' }] },
    { id: 2, title: 'B', startsAtUtc: 11000, maxSlots: 2, seats: [{ discordId: 'm1', displayName: '甲' }, { discordId: 'm2', displayName: '乙' }] },
    { id: 3, title: 'C', startsAtUtc: 90000, maxSlots: 2, seats: [{ discordId: 'm2', displayName: '乙' }] },
  ];
  const conflicts = crossCarConflicts(cars);
  eq('P13 overlap conflict flags the double-booked member', conflicts.map((c) => c.discordId), ['m1']);
  const facts = new Map([['m1', F('m1')], ['m2', F('m2')], ['m3', F('m3')]]);
  const moves = crossCarMoves(cars, facts);
  const movesForA = moves.find((m) => m.carId === 1);
  check('P13 move suggestion offers the unconflicted member', !!movesForA && movesForA.candidates.some((c) => c.facts.discordId === 'm3'));
  check('P13 move suggestion never offers a conflicted member', !!movesForA && !movesForA.candidates.some((c) => c.facts.discordId === 'm1'));
}

/* ================= real D1 + GraphQL tier matrix ================= */
const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: { DB: 'harness-premiumscheduling' },
}));
const db = await mf.getD1Database('DB');
{
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { splitSqlStatements } = await import('../scripts/ci/schema-shape.mjs');
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) for (const stmt of splitSqlStatements(fs.readFileSync(path.join(dir, f), 'utf8'))) await db.prepare(stmt).run();
  check('migration chain incl. 0027 bootstraps', files.includes('0027_rotation_advice_records.sql'));
}

const SLUG = 'schedguild';
await insertTenant(db, { slug: SLUG, guildName: '调度测试百业', passwordHash: '', announcement: '' });
// Roster: leader L, healer H, dps D, newcomer N.
for (const [id, nick] of [['L', '车头'], ['H', '奶妈'], ['D', '输出'], ['N', '新人']]) {
  await upsertGuildMember(db, SLUG, id, nick, nick);
}
// Next Monday 12:30 UTC as the target car time.
const nowD = new Date(); let monday = Date.UTC(nowD.getUTCFullYear(), nowD.getUTCMonth(), nowD.getUTCDate(), 12, 30);
while (new Date(monday * 1000).getUTCDay() !== 1 || monday < Math.floor(Date.now() / 1000) + 86400) monday += 86400;
const pastMonday = monday - 7 * 86400;
// A past car: H healed (ready), D dps'd (ready), giving both history.
const past = await insertEvent(db, { tenant: SLUG, title: '上周车', type: 'activity', status: 'completed', max_slots: 10, starts_at_utc: pastMonday, creator_discord_id: 'L', origin: 'admin', created_by: 'L', dungeon: '' });
await insertSignup(db, { event_id: past.last_row_id, nickname: '奶妈', uid: 'uH', role: '奶', weapon: '牵丝·霖', discord_id: 'H', ready_at: pastMonday });
await insertSignup(db, { event_id: past.last_row_id, nickname: '输出', uid: 'uD', role: '输出', weapon: '剑', discord_id: 'D', ready_at: pastMonday });
// Target car led by L, one seat taken by D.
const car = await insertEvent(db, { tenant: SLUG, title: '本周车', type: 'activity', status: 'open', max_slots: 10, starts_at_utc: monday, creator_discord_id: 'L', origin: 'admin', created_by: 'L', dungeon: '' });
const carId = car.last_row_id;
await insertSignup(db, { event_id: carId, nickname: '输出', uid: 'uD2', role: '输出', weapon: '剑', discord_id: 'D' });
// Overlapping second car with D seated -> P13 conflict.
const car2 = await insertEvent(db, { tenant: SLUG, title: '重叠车', type: 'activity', status: 'open', max_slots: 10, starts_at_utc: monday + 1800, creator_discord_id: 'L', origin: 'admin', created_by: 'L', dungeon: '' });
await insertSignup(db, { event_id: car2.last_row_id, nickname: '输出', uid: 'uD3', role: '输出', weapon: '剑', discord_id: 'D' });
// Gear on file for H and D.
await insertGearItemRow(db, { discordId: 'H', slot: '武器', name: '牵丝', dataJson: '{}' }).catch(() => {});
await insertGearItemRow(db, { discordId: 'D', slot: '武器', name: '剑', dataJson: '{}' }).catch(() => {});
// Availability: H + D free Monday 12:00-14:00 UTC.
for (const id of ['H', 'D']) {
  await upsertMemberAvailability(db, { tenant: SLUG, discordId: id, displayName: id, slots: [{ weekday: 1, startMinute: 720, endMinute: 840 }], updatedAt: 1 });
}

const env = { DB: db, SITE_URL: 'http://local' };
async function gql(query) {
  const ctx = { env, request: new Request('http://local/graphql'), user: null, vc: OMNISCIENT_VIEWER, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query }) }), ctx);
  return res.json();
}
const detailQ = `{ groupingDetailPage(slug: "${SLUG}", id: "${carId}") { schedulingAdvice { __typename
  ... on SchedulingAdviceLocked { lockedTitle lockedBody }
  ... on GroupingSchedulingAdvice { title hint draft { discordId role reasons } substitutes { discordId reasons } rotation { discordId } rotationRecords { id } } } } }`;
const schedQ = `{ guildSchedulePage(slug: "${SLUG}") { bestSlotsAdvice { __typename
  ... on SchedulingAdviceLocked { lockedTitle }
  ... on SchedulingBestSlots { title emptyText slots { weekday startMinute coverCount memberNames } } } } }`;
const listQ = `{ groupingListPage(slug: "${SLUG}", tab: ACTIVITY) { crossCarAdvice { __typename
  ... on SchedulingAdviceLocked { lockedTitle }
  ... on SchedulingCrossCarAdvice { title conflicts { discordId } moves { carId entry { discordId } } } } } }`;

// --- tierLocked unit matrix ---
eq('tierLocked: paygate OFF locks nobody', await tierLocked(db, SLUG, 2), false);
await setPaygateEnabled(db, true);
eq('tierLocked: paygate ON + free guild locked at T2', await tierLocked(db, SLUG, 2), true);
eq('effectiveTier: free guild is 0', await effectiveTier(db, SLUG), 0);
await grantPremiumManual(db, SLUG, 30);
eq('tierLocked: manual premium grant unlocks T2', await tierLocked(db, SLUG, 2), false);
eq('effectiveTier: legacy premium maps to tier 2', await effectiveTier(db, SLUG), 2);
await revokePremium(db, SLUG);
eq('tierLocked: revoke re-locks T2', await tierLocked(db, SLUG, 2), true);
await setPaygateEnabled(db, false);

// --- paygate OFF: full shells (launch parity) ---
let r = await gql(detailQ);
eq('OFF detail: full advice shell', r.data?.groupingDetailPage?.schedulingAdvice?.__typename, 'GroupingSchedulingAdvice');
check('OFF detail: draft seats the healer candidate', (r.data?.groupingDetailPage?.schedulingAdvice?.draft || []).some((d) => d.discordId === 'H'), JSON.stringify(r).slice(0, 300));
check('OFF detail: draft reasons rendered server-side', (r.data?.groupingDetailPage?.schedulingAdvice?.draft || []).every((d) => Array.isArray(d.reasons) && d.reasons.length > 0));
check('OFF detail: substitutes offered while seats are vacant', (r.data?.groupingDetailPage?.schedulingAdvice?.substitutes || []).length > 0);
r = await gql(schedQ);
eq('OFF schedule: full best-slots shell', r.data?.guildSchedulePage?.bestSlotsAdvice?.__typename, 'SchedulingBestSlots');
eq('OFF schedule: top slot Monday 12:00 covering 2', (() => { const s0 = r.data?.guildSchedulePage?.bestSlotsAdvice?.slots?.[0]; return s0 ? [s0.weekday, s0.startMinute, s0.coverCount] : null; })(), [1, 720, 2]);
r = await gql(listQ);
eq('OFF list: full cross-car shell', r.data?.groupingListPage?.crossCarAdvice?.__typename, 'SchedulingCrossCarAdvice');
check('OFF list: conflict flags member D in overlapping cars', (r.data?.groupingListPage?.crossCarAdvice?.conflicts || []).some((c) => c.discordId === 'D'));

// --- paygate ON + free: Locked everywhere, zero advice data ---
await setPaygateEnabled(db, true);
r = await gql(detailQ);
eq('ON free detail: Locked shell only', r.data?.groupingDetailPage?.schedulingAdvice?.__typename, 'SchedulingAdviceLocked');
check('ON free detail: locked copy present, no draft key', !!r.data?.groupingDetailPage?.schedulingAdvice?.lockedTitle && !('draft' in (r.data?.groupingDetailPage?.schedulingAdvice || {})));
r = await gql(schedQ);
eq('ON free schedule: Locked shell only', r.data?.guildSchedulePage?.bestSlotsAdvice?.__typename, 'SchedulingAdviceLocked');
r = await gql(listQ);
eq('ON free list: Locked shell only', r.data?.groupingListPage?.crossCarAdvice?.__typename, 'SchedulingAdviceLocked');
r = await gql(`mutation { saveRotationAdvice(input: { groupingId: "${carId}" }) { ok errorCode } }`);
eq('ON free: saveRotationAdvice refuses premiumRequired', [r.data?.saveRotationAdvice?.ok, r.data?.saveRotationAdvice?.errorCode], [false, 'premiumRequired']);

// --- paygate ON + grant: full again + P5 audit write ---
await grantPremiumManual(db, SLUG, 30);
r = await gql(detailQ);
eq('ON granted detail: full advice shell', r.data?.groupingDetailPage?.schedulingAdvice?.__typename, 'GroupingSchedulingAdvice');
r = await gql(`mutation { saveRotationAdvice(input: { groupingId: "${carId}" }) { ok errorCode savedText } }`);
eq('ON granted: saveRotationAdvice ok', [r.data?.saveRotationAdvice?.ok, r.data?.saveRotationAdvice?.errorCode], [true, null]);
r = await gql(detailQ);
eq('P5 record readable back on detail page', (r.data?.groupingDetailPage?.schedulingAdvice?.rotationRecords || []).length, 1);
await revokePremium(db, SLUG);
await setPaygateEnabled(db, false);

console.log(`\n[premiumscheduling] ${pass} passed, ${fail} failed`);
if (fails.length) { console.log('FAILURES:\n - ' + fails.join('\n - ')); process.exit(1); }
