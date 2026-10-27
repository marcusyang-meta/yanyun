// Schema-readiness wait for the PR preview gate.
//
// Why this exists (learned twice: PR #26, then PR #41): after
// `wrangler preview` publishes a new version, Cloudflare takes several
// minutes to activate it everywhere. During that window some isolates
// still serve the PREVIOUS schema, so a field the PR just added briefly
// answers `Cannot query field "X" on type "Y"` (GRAPHQL_VALIDATION_FAILED)
// and then heals. The render smoke runs ~2 minutes after the deploy,
// lands squarely in the window, and reports a false red that no amount
// of product-code fixing can cure; rerunning only resets the clock by
// uploading yet another version.
//
// Mechanism (generic — no field names are hardcoded anywhere):
//   1. Parse the canonical SDL of the PR head and of the PR base and
//      compute the schema delta: fields added on object/interface
//      types, whole new types, and fields whose signature changed.
//   2. Poll the preview's /graphql with synthetic probe documents that
//      reference every delta field inside an inline fragment on its
//      own type, spread from the OPPOSITE operation root (Query fields
//      ride in a mutation document, Mutation fields in a query
//      document, everything else in both). Those spreads can never
//      execute — graphql-js still validates the fields against the
//      fragment's type condition, which is exactly the signal needed:
//      a delta field is "served" once its `Cannot query field` error
//      disappears. (Introspection would be the obvious probe, but this
//      API disables it on purpose — do not re-enable it for CI.)
//   3. Ready = the delta error set is empty on N consecutive polls.
//      Bounded: after --timeout-ms the step FAILS, listing the fields
//      that never propagated — a genuine schema mismatch stays red,
//      nothing is silently waved through.
//
// Scope boundaries (deliberate):
//   - Signature-changed fields are probed by name only (presence);
//     argument-level skew on an existing field is not this failure
//     class and remains guarded by the render smoke itself.
//   - Fields added to input objects are not probed: they cannot
//     produce the `Cannot query field` signature in the app queries
//     the smoke drives.
//   - No schema delta -> exits immediately (most PRs pay nothing).
//
// Usage:
//   node scripts/ci/schema-readiness.mjs --base <preview-url> \
//     --schema packages/schema/schema.graphql \
//     --base-schema /tmp/base-schema.graphql \
//     [--timeout-ms 600000] [--interval-ms 20000] [--consecutive 3]
// A missing --base-schema file means "no baseline available": the wait
// is skipped with a loud note (the smoke remains the backstop, as
// before this step existed). A missing --schema file is a config error.
import fs from 'node:fs';
import process from 'node:process';

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const k = process.argv[i];
  if (k.startsWith('--')) { args[k.slice(2)] = process.argv[i + 1]; i++; }
}
const BASE = (args.base || '').replace(/\/$/, '');
const SCHEMA_PATH = args.schema || '';
const BASE_SCHEMA_PATH = args['base-schema'] || '';
const TIMEOUT_MS = Number(args['timeout-ms'] || process.env.SCHEMA_READY_TIMEOUT_MS || 600000);
const INTERVAL_MS = Number(args['interval-ms'] || process.env.SCHEMA_READY_INTERVAL_MS || 20000);
const CONSECUTIVE = Number(args.consecutive || process.env.SCHEMA_READY_CONSECUTIVE || 3);
if (!BASE || !SCHEMA_PATH) {
  console.error('usage: schema-readiness.mjs --base <url> --schema <sdl> [--base-schema <sdl>]');
  process.exit(2);
}
if (!fs.existsSync(SCHEMA_PATH)) { console.error(`schema file not found: ${SCHEMA_PATH}`); process.exit(2); }
if (BASE_SCHEMA_PATH && !fs.existsSync(BASE_SCHEMA_PATH)) {
  console.log(`NOTE  no base schema at ${BASE_SCHEMA_PATH} — skipping the readiness wait (render smoke remains the backstop)`);
  process.exit(0);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- minimal SDL field-map parsing (names + signatures) --- */
function stripSdl(text) {
  return text
    .replace(/"""[\s\S]*?"""/g, ' ')
    .replace(/"(?:\\.|[^"\\])*"/g, ' ')
    .replace(/#[^\n]*/g, ' ');
}

function parseFields(body) {
  const starts = [];
  let pDepth = 0, bDepth = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '(') pDepth++;
    else if (c === ')') pDepth--;
    else if (c === '{') bDepth++;
    else if (c === '}') bDepth--;
    else if (pDepth === 0 && bDepth === 0 && /[A-Za-z_]/.test(c) && (i === 0 || !/[A-Za-z0-9_]/.test(body[i - 1]))) {
      let j = i;
      while (j < body.length && /[A-Za-z0-9_]/.test(body[j])) j++;
      let k = j;
      while (k < body.length && /\s/.test(body[k])) k++;
      if (body[k] === '(' || body[k] === ':') starts.push({ name: body.slice(i, j), at: i });
      i = j - 1;
    }
  }
  return starts.map((s, idx) => ({
    name: s.name,
    sig: body.slice(s.at, idx + 1 < starts.length ? starts[idx + 1].at : body.length).replace(/\s+/g, ' ').trim(),
  }));
}

function parseFieldMap(text) {
  const clean = stripSdl(text);
  const types = new Map();
  const blockRe = /(?:extend\s+)?(?:type|interface)\s+([A-Za-z_][A-Za-z0-9_]*)[^{]*\{/g;
  let m;
  while ((m = blockRe.exec(clean))) {
    const name = m[1];
    let depth = 0;
    let i = blockRe.lastIndex - 1;
    const start = i;
    for (; i < clean.length; i++) {
      if (clean[i] === '{') depth++;
      else if (clean[i] === '}') { depth--; if (depth === 0) break; }
    }
    const body = clean.slice(start + 1, i);
    blockRe.lastIndex = i + 1;
    if (!types.has(name)) types.set(name, new Map());
    const fields = types.get(name);
    for (const f of parseFields(body)) fields.set(f.name, f.sig);
  }
  return types;
}

/* ---------- delta ------------------------------------------------ */
const head = parseFieldMap(fs.readFileSync(SCHEMA_PATH, 'utf8'));
const base = BASE_SCHEMA_PATH ? parseFieldMap(fs.readFileSync(BASE_SCHEMA_PATH, 'utf8')) : new Map();

const delta = new Map(); // type -> [{ name, changed }]
const newTypes = new Set();
let deltaCount = 0;
for (const [t, fields] of head) {
  if (!base.has(t)) {
    newTypes.add(t);
    delta.set(t, [...fields.keys()].map((name) => ({ name, changed: false })));
    deltaCount += fields.size;
    continue;
  }
  const bf = base.get(t);
  const list = [];
  for (const [f, sig] of fields) {
    if (!bf.has(f)) list.push({ name: f, changed: false });
    else if (bf.get(f) !== sig) list.push({ name: f, changed: true });
  }
  if (list.length) { delta.set(t, list); deltaCount += list.length; }
}
if (deltaCount === 0) {
  console.log('schema-readiness: no schema delta vs base — nothing to wait for');
  process.exit(0);
}
const deltaSummary = [...delta.entries()]
  .map(([t, fs]) => `${t}(${fs.map((f) => f.name + (f.changed ? '~' : '')).join(',')})`)
  .join(' ');
console.log(`schema-readiness: waiting for the preview to serve ${deltaCount} delta field(s): ${deltaSummary}`);

/* ---------- probe documents -------------------------------------- */
// Every delta field is referenced ONLY inside an inline fragment whose
// spread is impossible from the document's operation root, so probes
// validate but never execute. Query-type fields ride the mutation
// document; Mutation-type fields ride the query document; all other
// types ride both.
function fragmentsFor(excludeType) {
  const parts = [];
  for (const [t, fields] of delta) {
    if (t === excludeType) continue;
    parts.push(`... on ${t} { ${fields.map((f) => f.name).join(' ')} }`);
  }
  return parts.join(' ');
}
const probeDocs = [
  `query SchemaReadiness { __typename ${fragmentsFor('Query')} }`,
  `mutation SchemaReadiness { __typename ${fragmentsFor('Mutation')} }`,
].filter((d) => d.includes('... on'));

async function gql(query) {
  const r = await fetch(`${BASE}/graphql`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: BASE },
    body: JSON.stringify({ query }),
  });
  if (r.status >= 500) throw new Error(`HTTP ${r.status}`);
  return r.json().catch(() => null);
}

async function missingFields() {
  const messages = [];
  for (const doc of probeDocs) {
    const body = await gql(doc);
    if (!body || (!body.data && !body.errors)) throw new Error('unparseable GraphQL response');
    for (const e of body.errors || []) messages.push(String(e.message || ''));
  }
  const missing = [];
  for (const [t, fields] of delta) {
    if (newTypes.has(t) && messages.some((msg) => msg.includes(`Unknown type "${t}"`))) {
      for (const f of fields) missing.push(`${t}.${f.name}`);
      continue;
    }
    for (const f of fields) {
      if (messages.some((msg) => msg.includes(`Cannot query field "${f.name}" on type "${t}"`))) {
        missing.push(`${t}.${f.name}`);
      }
    }
  }
  return missing;
}

/* ---------- bounded poll ------------------------------------------ */
const started = Date.now();
let streak = 0;
let poll = 0;
let lastMissing = [];
while (Date.now() - started < TIMEOUT_MS) {
  poll++;
  try {
    lastMissing = await missingFields();
  } catch (e) {
    lastMissing = [`<endpoint not answering cleanly: ${e.message}>`];
  }
  const elapsed = Math.round((Date.now() - started) / 1000);
  if (lastMissing.length === 0) {
    streak++;
    console.log(`poll ${poll} (${elapsed}s): delta fully served — streak ${streak}/${CONSECUTIVE}`);
    if (streak >= CONSECUTIVE) {
      console.log(`schema-readiness: PASS — preview serves the PR schema after ~${elapsed}s`);
      process.exit(0);
    }
  } else {
    streak = 0;
    console.log(`poll ${poll} (${elapsed}s): still missing ${lastMissing.join(', ')}`);
  }
  const remaining = TIMEOUT_MS - (Date.now() - started);
  if (remaining <= 0) break;
  await sleep(Math.min(INTERVAL_MS, remaining));
}
console.error(`schema-readiness: FAIL — after ${TIMEOUT_MS}ms the preview still does not serve: ${lastMissing.join(', ')}`);
console.error('This is the bounded failure path: the schema genuinely has not propagated (or the delta is wrong). Do not merge on this red.');
process.exit(1);
