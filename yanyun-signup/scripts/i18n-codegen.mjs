#!/usr/bin/env node
/* i18n codegen (fbtee): derive all generated files from the
 * hand-maintained sources.
 *
 * Sources:
 *   src/domains/<domain>/i18n/strings.source.ts  per-domain fbtee
 *     declaration surfaces (fbs calls, desc = 'section.field'); each
 *     section is owned by exactly one domain (SECTION_OWNER below) and
 *     a declaration filed under the wrong domain fails the build.
 *   src/domains/platform/i18n/translations/<locale>.json  editable
 *     fbtee translations (keyed by md5(pattern+desc))
 * Generated (do not hand-edit):
 *   platform/i18n/strings.ts    transformSync output (+ FbsRuntime post-processing)
 *   platform/i18n/catalogs/<locale>.json  translate-compiled catalogs { hk: pattern }
 *   platform/i18n/catalog.ts    CATALOG compatibility projection (error-copy set / harness use)
 *   <domain>/i18n/keys.gen.ts   per-domain string-key union types
 *
 * The per-domain declarations are merged back into one virtual source
 * (entries in SECTION_ORDER, the legacy catalog order) before compiling,
 * so the compiled outputs are identical to the pre-split pipeline.
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
const TRANSLATIONS_DIR = join(I18N_DIR, 'translations');
// Section ownership: every section is declared by exactly one domain.
// Shared copy (common / errors / legal / legal bodies / app blocks)
// belongs to platform; a domain never declares another domain's section.
const SECTION_OWNER = {
  common: 'platform', errors: 'platform', legal: 'platform',
  termsBody: 'platform', privacyBody: 'platform', appBlocks: 'platform',
  site: 'identity', login: 'identity', userBar: 'identity',
  settings: 'identity', picker: 'identity', create: 'identity',
  guildHome: 'guilds', locked: 'guilds', guildAdmin: 'guilds',
  groupingList: 'groupings', groupingDetail: 'groupings',
  groupingForm: 'groupings', groupingType: 'groupings', seat: 'groupings',
  groupingTemplate: 'groupings',
  account: 'identity',
  dex: 'dex', boss: 'dex', sect: 'dex',
  gear: 'gear', grad: 'gear', tiaolv: 'gear',
};
// Legacy catalog order (the pre-split declaration order). The merged
// virtual source emits sections in this order so compiled outputs stay
// byte-identical; new sections append at the end of this list.
const SECTION_ORDER = [
  'common', 'site', 'login', 'userBar', 'settings', 'picker', 'create',
  'locked', 'guildHome', 'groupingType', 'groupingList', 'groupingDetail',
  'groupingForm', 'seat', 'appBlocks', 'dex', 'boss', 'sect', 'tiaolv',
  'grad', 'gear', 'legal', 'termsBody', 'privacyBody', 'errors', 'guildAdmin',
  'groupingTemplate', 'account',
];
const DOMAINS = ['identity', 'guilds', 'groupings', 'dex', 'gear', 'platform'];
const domainSourcePath = (d) => join(APP, 'src', 'domains', d, 'i18n', 'strings.source.ts');
const domainKeysPath = (d) => join(APP, 'src', 'domains', d, 'i18n', 'keys.gen.ts');
const LOCALES = ['en', 'es', 'fr', 'zh-TW'];
const CHECK = process.argv.includes('--check');

const fail = (msg) => { console.error('[i18n-codegen] ' + msg); process.exit(1); };

// ---------- Multi-source collection: merge the per-domain declarations ----------
// The merged virtual source carries this prelude (identical in shape to
// the pre-split single file, so the compiled output is unchanged). The
// header comment is stripped back out of the generated strings.ts by
// genStringsTs, keyed on the 'fbtee declaration surface' marker.
const MERGED_PRELUDE = `/* fbtee declaration surface (hand-maintained): the source declarations of
 * all UI copy, one entry = one fbs call. Merged by scripts/i18n-codegen.mjs
 * from the per-domain files src/domains/<domain>/i18n/strings.source.ts.
 * - desc is 'section.field', matching the legacy hand-rolled catalog keys
 *   one-to-one (unique and stable; the anchor translations hang off).
 * - Source locale zh-CN; other locales' translations live in
 *   platform/i18n/translations/*.json (fbtee format).
 * - Parameterized entries use literal segments + fbs.param (required by the
 *   fbtee compiler); parameter packing is pv(): a missing param stays the
 *   literal '{name}' (the legacy translate placeholder-preserving behavior),
 *   anything else is String(v) (the legacy substitution rule, and it avoids
 *   fbtee's Intl number formatting).
 * - fbtee collection trims source whitespace: the one entry with outer
 *   whitespace (boss.talentPending) concatenates the space outside the fbs
 *   call, and its translations store the trimmed text too.
 * After editing copy, rerun: node scripts/i18n-codegen.mjs (regenerates
 * strings.ts / catalogs / catalog.ts); --check runs in CI. Never hand-edit
 * the generated files.
 */
import type { FbsAPI } from 'fbtee/server';

export type StringParams = Record<string, unknown>;

function pv(p: StringParams | undefined, name: string): string {
  const v = p ? p[name] : undefined;
  return v === undefined ? '{' + name + '}' : String(v);
}

`;

// Extract the entry statements (`export const <name> = ...;`) of one
// domain declaration file, in file order: [{ name, desc, body }].
function parseDomainEntries(domain, text) {
  const out = [];
  const re = /export const ([A-Za-z0-9_]+) = /g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[1] === 'STRING_FNS') fail(domain + ': STRING_FNS is synthesized by codegen, not declared');
    const end = text.indexOf(';\n', m.index);
    if (end < 0) fail(domain + ': unterminated entry ' + m[1]);
    const body = text.slice(m.index, end + 2);
    const descs = [...body.matchAll(/"([a-zA-Z]+\.[a-zA-Z0-9]+)"/g)];
    if (!descs.length) fail(domain + ': no desc found in entry ' + m[1]);
    const desc = descs[descs.length - 1][1];
    const section = desc.slice(0, desc.indexOf('.'));
    if (SECTION_OWNER[section] !== domain) {
      fail(`${domain}: entry ${m[1]} declares section '${section}', owned by ${SECTION_OWNER[section] || '(unknown section)'}`);
    }
    out.push({ name: m[1], desc, body });
  }
  if (!out.length) fail(domain + ': no declaration entries found');
  return out;
}

// Read every domain file once; returns { byDomain, merged } where merged
// is the virtual single source the rest of the pipeline compiles.
function collectSources() {
  const byDomain = new Map();
  const bySection = new Map();
  const seen = new Set();
  for (const d of DOMAINS) {
    const entries = parseDomainEntries(d, readFileSync(domainSourcePath(d), 'utf8'));
    byDomain.set(d, entries);
    for (const e of entries) {
      if (seen.has(e.desc)) fail('duplicate desc ' + e.desc);
      seen.add(e.desc);
      const section = e.desc.slice(0, e.desc.indexOf('.'));
      if (!bySection.has(section)) bySection.set(section, []);
      bySection.get(section).push(e);
    }
  }
  for (const s of bySection.keys()) {
    if (!SECTION_ORDER.includes(s)) fail('section ' + s + ' missing from SECTION_ORDER');
  }
  const ordered = [];
  for (const s of SECTION_ORDER) for (const e of bySection.get(s) || []) ordered.push(e);
  const record = 'export const STRING_FNS: Record<string, (fbs: FbsAPI, p?: StringParams) => string> = {\n'
    + ordered.map((e) => `  "${e.desc}": ${e.name},\n`).join('') + '};\n';
  const merged = MERGED_PRELUDE + ordered.map((e) => e.body).join('') + '\n' + record;
  return { byDomain, merged };
}

// Per-domain key unions for the domains' text utils (typed accessors).
function genDomainKeys(domain, entries) {
  const cap = domain[0].toUpperCase() + domain.slice(1);
  const keys = entries.map((e) => e.desc);
  return '/* Generated by scripts/i18n-codegen.mjs from strings.source.ts in this\n'
    + ' * directory; do not hand-edit. Rerun the codegen after changing copy. */\n'
    + `export type ${cap}StringKey =\n`
    + keys.map((k) => `  | '${k}'`).join('\n') + ';\n\n'
    + `export const ${domain.toUpperCase()}_STRING_KEYS: readonly ${cap}StringKey[] = [\n`
    + keys.map((k) => `  '${k}',`).join('\n') + '\n];\n';
}

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
  // collect reads a source file: hand it the merged virtual source.
  const mergedPath = join(tmp, 'strings.source.ts');
  writeFileSync(mergedPath, sourceText);
  execFileSync(process.execPath, [bin, 'collect', '--include-default-strings=false', '--src', mergedPath, '--out', ssPath],
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
const { byDomain, merged: sourceText } = collectSources();
const outputs = new Map();
outputs.set(join(I18N_DIR, 'strings.ts'), genStringsTs(sourceText));
const { catalogs, catalogTs } = genCatalogsAndProjection(sourceText);
for (const locale of LOCALES) outputs.set(join(I18N_DIR, 'catalogs', locale + '.json'), catalogs[locale]);
outputs.set(join(I18N_DIR, 'catalog.ts'), catalogTs);
for (const d of DOMAINS) outputs.set(domainKeysPath(d), genDomainKeys(d, byDomain.get(d)));

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
