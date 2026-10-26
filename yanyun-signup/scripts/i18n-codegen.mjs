#!/usr/bin/env node
/* i18n codegen (fbtee): derive all generated files from the two
 * hand-maintained sources.
 *
 * Sources (src/domains/platform/i18n/):
 *   strings.source.ts           fbtee declaration surface (fbs calls, desc = 'section.field')
 *   translations/<locale>.json  editable fbtee translations (keyed by md5(pattern+desc))
 * Generated (same directory, do not hand-edit):
 *   strings.ts                  transformSync output (+ FbsRuntime type post-processing)
 *   catalogs/<locale>.json      translate-compiled catalogs { hk: pattern }
 *   catalog.ts                  CATALOG compatibility projection (error-copy set / harness use)
 *
 * Usage: node scripts/i18n-codegen.mjs [--check]
 *   --check only compares, writes nothing; exits 1 on drift (for CI).
 * collect/transform use @nkzw/fbtee-compiler's programmatic API; the
 * translate step uses its official CLI (bin.mjs) because the
 * programmatic API exposes no equivalent function.
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@nkzw/fbtee-compiler';

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, '..');
const I18N_DIR = join(APP, 'src', 'domains', 'platform', 'i18n');
const SOURCE = join(I18N_DIR, 'strings.source.ts');
const TRANSLATIONS_DIR = join(I18N_DIR, 'translations');
const LOCALES = ['en', 'es', 'fr', 'zh-TW'];
const CHECK = process.argv.includes('--check');

const fail = (msg) => { console.error('[i18n-codegen] ' + msg); process.exit(1); };

// ---------- strings.ts: compile + type post-processing ----------
function genStringsTs(sourceText) {
  const out = transformSync('strings.source.ts', sourceText);
  if (out.errors && out.errors.length) fail('transform errors: ' + JSON.stringify(out.errors).slice(0, 1000));
  let code = out.code;
  // Strip the source file's declaration-surface header comment (it
  // describes the source file, not the generated output).
  const importAt = code.indexOf('import type');
  if (importAt > 0 && code.slice(0, importAt).includes('fbtee declaration surface')) code = code.slice(importAt);
  // fbs._ / fbs._param are fbtee runtime internals, absent from the
  // public FbsAPI types: widen generated parameter annotations to the
  // local FbsRuntime so they pass tsc strict mode.
  const typeBlock = `
/* Compiled fbtee output calls fbs._ / fbs._param (runtime internals, not
 * part of the public FbsAPI types): parameter annotations are widened to
 * the local FbsRuntime, which carries those internal entry points. The
 * runtime object is fbtee's fbs and has them natively; this only states
 * the type honestly. */
export type FbsRuntime = FbsAPI & {
  _: (pattern: string, args: ReadonlyArray<unknown> | null, opts: { hk: string }) => string;
  _param: (name: string, value: unknown) => unknown;
};
export type StringFn = (fbs: FbsRuntime, p?: StringParams) => string;
`;
  code = code.replace(/(import type \{ FbsAPI \} from "fbtee\/server";)/, '$1' + typeBlock);
  code = code.replaceAll('(fbs: FbsAPI, p?: StringParams)', '(fbs: FbsRuntime, p?: StringParams)');
  code = code.replaceAll('(fbs: FbsAPI)', '(fbs: FbsRuntime)');
  code = code.replace(
    'Record<string, (fbs: FbsRuntime, p?: StringParams) => string>',
    'Record<string, StringFn>',
  );
  if (code.includes('(fbs: FbsAPI')) fail('annotation rewrite incomplete');
  if (!code.includes('fbs._(')) fail('transform produced no compiled fbs._ calls');
  const header = '/* Generated, do not hand-edit: source = strings.source.ts; rerun node scripts/i18n-codegen.mjs */\n';
  return header + code;
}

// ---------- Parse the declaration surface: entry order + lead/trail padding ----------
function parseSourceMeta(sourceText) {
  // Entry order = key order in the STRING_FNS record.
  const recAt = sourceText.indexOf('export const STRING_FNS');
  if (recAt < 0) fail('STRING_FNS not found');
  const order = [...sourceText.slice(recAt).matchAll(/"([^"]+)":\s*[A-Za-z0-9_]+,/g)].map((m) => m[1]);
  if (!order.length) fail('STRING_FNS empty');
  // Each fn's outer padding, in the `=> " " + fbs(...)` / `fbs(...) + " "` shape.
  const pads = new Map();
  const fnRe = /export const ([A-Za-z0-9_]+) = \(fbs: FbsAPI(?:, p\?: StringParams)?\) =>\s*([\s\S]*?);\n/g;
  for (const m of sourceText.matchAll(fnRe)) {
    let rest = m[2].trim();
    let lead = '', trail = '';
    const leadM = rest.match(/^("(?:[^"\\]|\\.)*") \+ /);
    if (leadM) { lead = JSON.parse(leadM[1]); rest = rest.slice(leadM[0].length); }
    const trailM = rest.match(/ \+ ("(?:[^"\\]|\\.)*")$/);
    if (trailM) { trail = JSON.parse(trailM[1]); rest = rest.slice(0, rest.length - trailM[0].length); }
    if (!rest.startsWith('fbs(')) fail('unparsable fn body for ' + m[1]);
    const descM = rest.match(/,\s*"([^"]+)"\)$/);
    if (!descM) fail('desc not found for ' + m[1]);
    if (lead || trail) pads.set(descM[1], { lead, trail });
  }
  return { order, pads };
}

// ---------- catalogs + catalog.ts: CLI collect/translate ----------
function genCatalogsAndProjection(sourceText) {
  const bin = join(dirname(require.resolve('@nkzw/fbtee-compiler')), 'bin.mjs');
  const tmp = mkdtempSync(join(tmpdir(), 'i18n-codegen-'));
  const ssPath = join(tmp, 'source_strings.json');
  execFileSync(process.execPath, [bin, 'collect', '--include-default-strings=false', '--src', SOURCE, '--out', ssPath],
    { stdio: ['ignore', 'ignore', 'inherit'] });
  const outDir = join(tmp, 'out');
  execFileSync(process.execPath, [bin, 'translate', '--source-strings', ssPath, '--translations', join(TRANSLATIONS_DIR, '*.json'), '--output-dir', outDir],
    { stdio: ['ignore', 'ignore', 'inherit'] });

  const ss = JSON.parse(readFileSync(ssPath, 'utf8'));
  const byDesc = new Map(); // desc -> {hash, text}
  for (const phrase of ss.phrases) {
    for (const [hash, leaf] of Object.entries(phrase.hashToLeaf)) byDesc.set(leaf.desc, { hash, text: leaf.text });
  }
  const { order, pads } = parseSourceMeta(sourceText);
  const pad = (desc, txt) => { const p = pads.get(desc); return p ? p.lead + txt + p.trail : txt; };

  // catalogs/<locale>.json: { hk: pattern } (CLI output with the outer locale key removed).
  const catalogs = {};
  const perLocaleText = new Map(); // locale -> Map(desc -> full text)
  for (const locale of LOCALES) {
    const raw = JSON.parse(readFileSync(join(outDir, locale + '.json'), 'utf8'));
    const inner = raw[locale];
    if (!inner) fail('translate output missing locale ' + locale);
    catalogs[locale] = JSON.stringify(inner, null, 2) + '\n';
    // Per-desc text (for the projection): read the editable translations,
    // verify every hash belongs to the source, then apply padding.
    const editable = JSON.parse(readFileSync(join(TRANSLATIONS_DIR, locale + '.json'), 'utf8'));
    const byHash = new Map();
    for (const [desc, v] of byDesc) byHash.set(v.hash, desc);
    const m = new Map();
    for (const [hash, e] of Object.entries(editable.translations)) {
      const desc = byHash.get(hash);
      if (!desc) fail(`translations/${locale}.json has unknown hash ${hash} (${e.description})`);
      if (e.description !== desc) fail(`translations/${locale}.json desc mismatch for ${hash}`);
      m.set(desc, pad(desc, e.translations[0].translation));
    }
    perLocaleText.set(locale, m);
  }

  // catalog.ts projection: structure identical to the old CATALOG (section -> field -> locale -> text).
  const catalog = {};
  for (const key of order) {
    const dot = key.indexOf('.');
    const section = key.slice(0, dot), field = key.slice(dot + 1);
    const src = byDesc.get(key);
    if (!src) fail('no collected phrase for ' + key);
    const cell = { 'zh-CN': pad(key, src.text) };
    for (const locale of LOCALES) {
      const t = perLocaleText.get(locale).get(key);
      if (t !== undefined) cell[locale] = t;
    }
    (catalog[section] ??= {})[field] = cell;
  }
  const catalogTs = '/* Generated, do not hand-edit: node scripts/i18n-codegen.mjs\n'
    + ' * CATALOG compatibility projection: mechanically derived from the fbtee\n'
    + ' * declarations + translations, for the business-error text set of\n'
    + ' * src/graphql.ts and the catalog-level assertions of the i18n harness.\n'
    + ' * The runtime text path\n'
    + ' * never reads it (runtime uses the compiled strings.ts + catalogs/*.json). */\n'
    + 'export const CATALOG: Record<string, Record<string, Record<string, string>>> = '
    + JSON.stringify(catalog, null, 2) + ';\n';
  return { catalogs, catalogTs };
}

// ---------- Main flow ----------
const sourceText = readFileSync(SOURCE, 'utf8');
const outputs = new Map();
outputs.set(join(I18N_DIR, 'strings.ts'), genStringsTs(sourceText));
const { catalogs, catalogTs } = genCatalogsAndProjection(sourceText);
for (const locale of LOCALES) outputs.set(join(I18N_DIR, 'catalogs', locale + '.json'), catalogs[locale]);
outputs.set(join(I18N_DIR, 'catalog.ts'), catalogTs);

let drift = 0;
for (const [path, content] of outputs) {
  if (CHECK) {
    const cur = existsSync(path) ? readFileSync(path, 'utf8') : null;
    if (cur !== content) { console.error('[i18n-codegen] DRIFT: ' + path); drift++; }
  } else {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    console.log('[i18n-codegen] wrote ' + path.replace(APP, '.'));
  }
}
if (CHECK) {
  if (drift) fail(drift + ' generated file(s) drifted; rerun node scripts/i18n-codegen.mjs');
  console.log('[i18n-codegen] all generated files up to date');
}
