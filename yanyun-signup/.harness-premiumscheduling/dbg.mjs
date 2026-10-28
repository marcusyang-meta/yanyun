import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { yoga } from '../src/graphql.ts';
import { OMNISCIENT_VIEWER } from '../src/domains/platform/context.ts';
import { insertTenant } from '../src/domains/guilds/tenants.ts';
const mf = new Miniflare(convertV4MiniflareOptions({ modules: true, script: 'export default { fetch() { return new Response("ok"); } }', d1Databases: { DB: 'dbg1' } }));
const db = await mf.getD1Database('DB');
const fs = await import('node:fs'); const path = await import('node:path');
const { splitSqlStatements } = await import('../scripts/ci/schema-shape.mjs');
const dir = path.resolve('migrations');
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) for (const stmt of splitSqlStatements(fs.readFileSync(path.join(dir, f), 'utf8'))) await db.prepare(stmt).run();
await insertTenant(db, { slug: 'g1', guildName: 'G', passwordHash: '', announcement: '' });
const env = { DB: db, SITE_URL: 'http://local' };
const ctx = { env, request: new Request('http://local/graphql'), user: null, vc: OMNISCIENT_VIEWER, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
for (const q of [`{ guildSchedulePage(slug: "g1") { bestSlotsAdvice { __typename } } }`, `{ groupingListPage(slug: "g1", tab: ACTIVITY) { crossCarAdvice { __typename } } }`]) {
  const res = await yoga.fetch(new Request('http://local/graphql', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: q }) }), ctx);
  console.log(JSON.stringify(await res.json()).slice(0, 600));
}
