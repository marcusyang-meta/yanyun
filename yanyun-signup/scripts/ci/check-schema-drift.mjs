/* ===================================================
 * Schema drift gate — migration governance (Route A).
 *
 * Default mode (runs in the pr-backend gate):
 *   bootstrap a fresh local D1 from the wrangler migration chain
 *   (migrations/*.sql, filename order — nothing else), introspect
 *   it, and diff against the Drizzle entity model. Any drift fails
 *   the build: a shape change must land as a new migration file in
 *   the same PR that changes the entity, and merged migration files
 *   are immutable.
 *
 * Manual modes (never wired into CI; production is read-only here):
 *   --prod           also introspect production through wrangler and
 *                    diff it against the chain bootstrap. This is
 *                    the takeover/stamping comparison: it must print
 *                    ZERO diffs before baseline ledger entries may
 *                    be recorded in production.
 *   --dump <file>    write the canonical shape JSON (of the chain
 *                    bootstrap, or of production with --prod).
 *
 * Usage: node scripts/ci/check-schema-drift.mjs [--prod] [--dump f]
 * =================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import {
  SIGNUP_ROOT, introspectD1, introspectRemote, shapeFromEntities,
  diffShapes, shapeStats,
} from './schema-shape.mjs';

const args = process.argv.slice(2);
const wantProd = args.includes('--prod');
const dumpPath = (() => {
  const i = args.indexOf('--dump');
  return i >= 0 ? args[i + 1] : null;
})();

/** Split a SQL script into statements: strips -- and block comments,
 * respects single-quoted string literals ('' is an escaped quote). */
function splitSql(text) {
  const out = [];
  let cur = '', inStr = false;
  const lines = text.split('\n');
  for (const rawLine of lines) {
    let line = rawLine;
    if (!inStr) {
      const c = line.indexOf('--');
      if (c >= 0) line = line.slice(0, c);
    }
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inStr) {
        cur += ch;
        if (ch === "'") {
          if (line[i + 1] === "'") { cur += line[++i]; }
          else inStr = false;
        }
      } else if (ch === "'") { inStr = true; cur += ch; }
      else if (ch === ';') { if (cur.trim()) out.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cur += '\n';
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

async function bootstrapFromChain() {
  const dir = path.join(SIGNUP_ROOT, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  if (!files.length) throw new Error(`no migration files in ${dir}`);
  const mf = new Miniflare(convertV4MiniflareOptions({
    modules: true,
    script: 'export default { fetch() { return new Response("ok"); } }',
    d1Databases: { DB: 'schema-drift-check' },
  }));
  const db = await mf.getD1Database('DB');
  for (const f of files) {
    // D1 exec() rejects comment-only chunks; split into statements
    // (string-literal aware) and run them one by one instead.
    for (const stmt of splitSql(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      await db.prepare(stmt).run();
    }
  }
  const shape = await introspectD1(db);
  await mf.dispose();
  return { shape, files };
}

let failed = false;
function report(title, diffs) {
  if (diffs.length) {
    failed = true;
    console.log(`\nDRIFT — ${title}: ${diffs.length} difference(s)`);
    for (const d of diffs) console.log('  -', d);
  } else {
    console.log(`\nOK — ${title}: zero differences`);
  }
}

const { shape: chainShape, files } = await bootstrapFromChain();
const cs = shapeStats(chainShape);
console.log(`chain bootstrap (${files.join(', ')}): ${cs.tables} tables, ${cs.columns} columns, ${cs.indexes} indexes`);

const entityShape = await shapeFromEntities();
report('migration chain vs Drizzle entities', diffShapes(chainShape, entityShape, 'chain', 'entities'));

if (wantProd) {
  const prodShape = await introspectRemote();
  const ps = shapeStats(prodShape);
  console.log(`production introspection: ${ps.tables} tables, ${ps.columns} columns, ${ps.indexes} indexes`);
  report('production vs migration chain', diffShapes(prodShape, chainShape, 'production', 'chain'));
  if (dumpPath) fs.writeFileSync(dumpPath, JSON.stringify(prodShape, null, 1));
} else if (dumpPath) {
  fs.writeFileSync(dumpPath, JSON.stringify(chainShape, null, 1));
}
if (dumpPath) console.log(`shape dumped to ${dumpPath}`);

process.exit(failed ? 1 : 0);
