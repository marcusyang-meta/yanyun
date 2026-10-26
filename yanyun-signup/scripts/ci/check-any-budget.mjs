// any budget gate (§4 of the code-cleanup batch): the context layer is
// fully typed (ViewerContext / Context / RequestContext — ctx: any is
// banned outright), and the remaining `any` occurrences under
// src/domains/ are capped per file by scripts/ci/any-budget.json. Any
// NEW any — a count above budget, a file missing from the budget, or a
// `ctx: any` anywhere — fails CI. Lowering a count? Lower the budget in
// the same PR. Raising one needs a stated reason in the budget entry.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const budget = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/ci/any-budget.json'), 'utf8'));
let failures = 0;
const seen = new Set();
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.ts')) {
      const rel = path.relative(ROOT, p);
      const text = fs.readFileSync(p, 'utf8');
      if (/ctx:\s*any\b/.test(text)) { console.log(`FAIL ${rel}: ctx: any is banned (use Context / ViewerContext / RequestContext)`); failures++; }
      const n = (text.match(/\bany\b/g) || []).length;
      if (n === 0) continue;
      seen.add(rel);
      const b = budget[rel];
      if (!b) { console.log(`FAIL ${rel}: ${n} any occurrences but no budget entry`); failures++; }
      else if (n > b.max) { console.log(`FAIL ${rel}: ${n} any occurrences > budget ${b.max} (${b.reason})`); failures++; }
    }
  }
}
walk(path.join(ROOT, 'src/domains'));
for (const rel of Object.keys(budget)) if (!seen.has(rel)) console.log(`note: ${rel} is under budget (0 any) — consider removing its entry`);
console.log(failures ? `any-budget: RED (${failures} failures)` : 'any-budget: GREEN');
process.exit(failures ? 1 : 0);
