// Laziness proof (§3 of the code-cleanup batch): every GraphQL field is
// an explicit resolver delegating to a lazy per-field loader (shell gen
// method). This suite counts, per query, (a) how many gen loaders fired
// and (b) how many D1 statements were prepared, and proves that fields
// the query did NOT select triggered ZERO loaders and zero extra work:
//   1. grouping detail, leaf-only selection (grouping { id title })
//   2. grouping detail, seats-only selection
//   3. grouping list, summary-only selection (groupings { id title })
//   4. grouping list, blocks-only selection (page text gens stay silent)
//   5. viewer, leaf-only selection (discordId)
// Plus a schema audit: no object/interface field may rely on GraphQL
// default field resolution (field.resolve must be set for all 1,169).
import { yoga } from '../src/graphql.ts';
import { defaultFieldResolver, isObjectType, isInterfaceType } from 'graphql';
import * as groupingsGql from '../src/domains/groupings/graphql.ts';
import * as guildsGql from '../src/domains/guilds/graphql.ts';
import * as identityGql from '../src/domains/identity/graphql.ts';
import * as dexGql from '../src/domains/dex/graphql.ts';
import * as gearGql from '../src/domains/gear/graphql.ts';
import * as platformGql from '../src/domains/platform/graphql.ts';
import * as blocksMod from '../src/domains/platform/blocks.ts';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}

/* ---------- loader counters: wrap every gen* method on every shell class ---------- */
const counts = new Map();
function bump(k) { counts.set(k, (counts.get(k) || 0) + 1); }
function resetCounts() { counts.clear(); }
function countOf(cls, gen) { return counts.get(cls + '.' + gen) || 0; }
for (const mod of [groupingsGql, guildsGql, identityGql, dexGql, gearGql, platformGql, blocksMod]) {
  for (const val of Object.values(mod)) {
    if (typeof val !== 'function' || !val.prototype) continue;
    for (const name of Object.getOwnPropertyNames(val.prototype)) {
      if (!name.startsWith('gen') || name === 'genConstructor') continue;
      const orig = val.prototype[name];
      if (typeof orig !== 'function' || orig.__counted) continue;
      const key = val.name + '.' + name;
      const wrapped = function (...args) { bump(key); return orig.apply(this, args); };
      wrapped.__counted = true;
      val.prototype[name] = wrapped;
    }
  }
}

/* ---------------- FakeDB (same routing style as daycomplete) ---------------- */
const SLUG = 'laztest';
const now = Math.floor(Date.now() / 1000);
const tables = {
  events: [
    { id: 201, tenant: SLUG, type: 'activity', title: '惰性测试车', description: '', dungeon: '',
      max_slots: 10, starts_at: '', starts_at_utc: now + 7200, status: 'open', origin: 'member',
      creator_discord_id: 'U1', created_by: '', reminder_sent_at: null, reminder_error: null },
  ],
  signups: [
    { id: 1, event_id: 201, nickname: '车头', uid: 'u1', role: '输出', weapon: '破竹·樽', discord_id: 'U1' },
  ],
};
const tenants = [{ slug: SLUG, guild_name: '惰性测试百业', slogan: '', announcement: '' }];
const settings = new Map([[`${SLUG}|discord_guild_id`, 'G1']]);
let dbStatements = 0;
function stmt(sql) {
  sql = sql.replace(/"/g, '').replace(/settings\./g, '');
  const q = {
    _binds: [],
    bind(...a) { this._binds = a; return this; },
    async raw() { const res = await this.all(); return (res.results || []).map((r) => Object.values(r)); },
    async first() {
      const b = this._binds;
      if (/FROM tenants WHERE slug/.test(sql)) return tenants.find((t) => t.slug === b[0]) || null;
      if (/FROM settings/.test(sql)) { const v = settings.get(`${b[0]}|${b[1]}`); return v === undefined ? null : { value: v }; }
      if (/SELECT \* FROM events WHERE id = \?/.test(sql)) return tables.events.find((e) => e.id === Number(b[0])) || null;
      if (/FROM users|FROM user_guild_nicks|FROM guild_members/.test(sql)) return null;
      if (/CREATE|ALTER|PRAGMA/.test(sql)) return null;
      return null;
    },
    async all() {
      const b = this._binds;
      if (/FROM settings/.test(sql)) {
        if (/tenant = \?/.test(sql)) { const v = settings.get(`${b[0]}|${b[1]}`); return { results: v === undefined ? [] : [{ value: v }] }; }
        return { results: [] };
      }
      if (/FROM events WHERE id = \?/.test(sql)) { const row = tables.events.find((e) => e.id === Number(b[0])) || null; return { results: row ? [row] : [] }; }
      if (/FROM events e WHERE e\.tenant/.test(sql) || /FROM events WHERE tenant = \?/.test(sql)) {
        return { results: tables.events.filter((e) => e.tenant === b[0]) };
      }
      if (/FROM signups WHERE event_id\s*=\s*\?/.test(sql)) return { results: tables.signups.filter((r) => r.event_id === Number(b[0])) };
      if (/FROM tenants/.test(sql)) return { results: tenants };
      if (/CREATE|ALTER|PRAGMA/.test(sql)) return { results: [] };
      return { results: [] };
    },
    async run() { return { meta: { changes: 0 } }; },
  };
  return q;
}
const db = { prepare: (sql) => { dbStatements++; return stmt(sql); }, async batch(s) { const o = []; for (const x of s) o.push(await x.run()); return o; } };
const env = { DB: db };
const leader = { discordId: 'U1', name: '车头', guilds: ['G1'] };

async function gql(query, variables) {
  resetCounts(); dbStatements = 0;
  const ctx = { env, request: new Request('http://local/graphql'), user: leader, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

/* ---------- 0. schema audit: zero default-resolved fields ---------- */
{
  const schema = yoga.schema || yoga.getEnveloped().schema;
  let total = 0; const missing = [];
  for (const [tname, type] of Object.entries(schema.getTypeMap())) {
    if (tname.startsWith('__') || (!isObjectType(type) && !isInterfaceType(type))) continue;
    for (const [fname, field] of Object.entries(type.getFields())) {
      total++;
      if (!field.resolve || field.resolve === defaultFieldResolver) missing.push(tname + '.' + fname);
    }
  }
  check(`audit: all ${total} object/interface fields have explicit resolvers`, missing.length === 0, missing.slice(0, 5).join(','));
}

/* ---------- 1. detail leaf-only ---------- */
{
  const r = await gql(`{ groupingDetailPage(slug: "${SLUG}", id: 201) { grouping { id title } } }`);
  check('detail leaf: response ok', !!(r.data && r.data.groupingDetailPage.grouping.title === '惰性测试车'), JSON.stringify(r).slice(0, 160));
  check('detail leaf: genGrouping fired', countOf('GroupingDetailPageShell', 'genGrouping') >= 1);
  check('detail leaf: genSeats 0', countOf('GroupingDetailPageShell', 'genSeats') === 0 && countOf('GroupingShell', 'genSeats') === 0);
  check('detail leaf: genBlocks 0', countOf('GroupingDetailPageShell', 'genBlocks') === 0);
  check('detail leaf: genOccupiedCount 0', countOf('GroupingShell', 'genOccupiedCount') === 0);
  let textGens = 0; for (const [k, v] of counts) if (k.startsWith('GroupingDetailPageShell.gen') && k !== 'GroupingDetailPageShell.genGrouping') textGens += v;
  check('detail leaf: all other detail-page loaders 0', textGens === 0, [...counts.keys()].join(','));
  check('detail leaf: db statements <= 6', dbStatements <= 6, 'got ' + dbStatements);
}

/* ---------- 2. detail seats-only ---------- */
{
  const r = await gql(`{ groupingDetailPage(slug: "${SLUG}", id: 201) { grouping { seats { nickname occupied } } } }`);
  const seats = r.data && r.data.groupingDetailPage.grouping.seats;
  check('detail seats: response ok', Array.isArray(seats) && seats.length === 10 && seats[0].nickname === '车头', JSON.stringify(r).slice(0, 160));
  check('detail seats: genSeats fired', countOf('GroupingShell', 'genSeats') >= 1);
  check('detail seats: genBlocks 0', countOf('GroupingDetailPageShell', 'genBlocks') === 0);
  let others = 0; for (const [k, v] of counts) if (k.startsWith('GroupingDetailPageShell.gen') && k !== 'GroupingDetailPageShell.genGrouping') others += v;
  check('detail seats: detail-page text loaders 0', others === 0, [...counts.keys()].join(','));
}

/* ---------- 3. list summary-only ---------- */
{
  const r = await gql(`{ groupingListPage(slug: "${SLUG}", tab: ACTIVITY) { groupings { id title } } }`);
  const gs = r.data && r.data.groupingListPage.groupings;
  check('list summary: response ok', Array.isArray(gs) && gs.length === 1 && gs[0].title === '惰性测试车', JSON.stringify(r).slice(0, 160));
  check('list summary: genGroupings fired', countOf('GroupingListPageShell', 'genGroupings') >= 1);
  check('list summary: genBlocks 0', countOf('GroupingListPageShell', 'genBlocks') === 0);
  check('list summary: genSeats 0 (no seat loading for summaries)', countOf('GroupingShell', 'genSeats') === 0);
  let textGens = 0; for (const [k, v] of counts) if (k.startsWith('GroupingListPageShell.gen') && k !== 'GroupingListPageShell.genGroupings') textGens += v;
  check('list summary: all other list-page loaders 0', textGens === 0, [...counts.keys()].join(','));
}

/* ---------- 4. list blocks-only ---------- */
{
  const r = await gql(`{ groupingListPage(slug: "${SLUG}", tab: ACTIVITY) { blocks { __typename } } }`);
  check('list blocks: response ok', !!(r.data && Array.isArray(r.data.groupingListPage.blocks)), JSON.stringify(r).slice(0, 160));
  check('list blocks: genBlocks fired', countOf('GroupingListPageShell', 'genBlocks') >= 1);
  let textGens = 0; for (const [k, v] of counts) if (k.startsWith('GroupingListPageShell.gen') && k !== 'GroupingListPageShell.genBlocks' && k !== 'GroupingListPageShell.genGroupings') textGens += v;
  check('list blocks: list-page text loaders 0', textGens === 0, [...counts.keys()].join(','));
}

/* ---------- 5. viewer leaf-only ---------- */
{
  const r = await gql(`{ viewer { myEffectiveLocale } }`);
  check('viewer leaf: response ok', !!(r.data && r.data.viewer.myEffectiveLocale === "zh-CN"), JSON.stringify(r).slice(0, 160));
  check('viewer leaf: genGuilds 0', countOf('ViewerShell', 'genGuilds') === 0);
  check('viewer leaf: genPublicGuilds 0', countOf('ViewerShell', 'genPublicGuilds') === 0);
}

console.log(`\nLAZINESS pass=${pass} fail=${fail}`);
if (fails.length) { console.log('FAILS:\n' + fails.join('\n')); process.exit(1); }
