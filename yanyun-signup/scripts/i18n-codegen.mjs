#!/usr/bin/env node
/* i18n codegen (fbtee): derive all generated files from the
 * hand-maintained sources.
 *
 * Sources:
 *   src/domains/<domain>/i18n/strings.source.ts  per-domain fbtee
 *     declaration surfaces (fbs calls). A string's identity is its
 *     declaration, <domain>/<export name> (guilds/guildAdmin_tabTeam);
 *     desc is a natural-language description for translators, never a
 *     key. Each section (the export name's prefix) is owned by exactly
 *     one domain (SECTION_OWNER below) and a declaration filed under
 *     the wrong domain fails the build.
 *   src/domains/platform/i18n/translations/<locale>.json  editable
 *     fbtee translations (keyed by md5(pattern+desc), fbtee's internal
 *     join; every entry also carries the declaration identity in its
 *     `id` field, and codegen verifies id + description against the
 *     declaration, so translations hang off the identity)
 * Generated (do not hand-edit):
 *   platform/i18n/strings.ts    transformSync output (+ FbsRuntime post-processing)
 *   platform/i18n/catalogs/<locale>.json  translate-compiled catalogs { hk: pattern }
 *   platform/i18n/catalog.ts    CATALOG compatibility projection (error-copy set / harness use)
 *   <domain>/i18n/keys.gen.ts   per-domain export-name union types
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
  landing: 'identity', feedback: 'identity',
  guildHome: 'guilds', locked: 'guilds', guildAdmin: 'guilds',
  announcements: 'guilds',
  recruit: 'guilds',
  announcements: 'guilds', officer: 'guilds',
  market: 'guilds', allies: 'guilds', governance: 'guilds',
  groupingList: 'groupings', groupingDetail: 'groupings',
  groupingForm: 'groupings', groupingType: 'groupings', seat: 'groupings',
  groupingTemplate: 'groupings', schedule: 'groupings',
  account: 'identity',
  dex: 'dex', boss: 'dex', sect: 'dex',
  gear: 'gear', grad: 'gear', tiaolv: 'gear', buildshare: 'gear',
  ops: 'guilds',
};
// Legacy catalog order (the pre-split declaration order). The merged
// virtual source emits sections in this order so compiled outputs stay
// byte-identical; new sections append at the end of this list.
const SECTION_ORDER = [
  'common', 'site', 'login', 'userBar', 'settings', 'picker', 'create',
  'locked', 'guildHome', 'groupingType', 'groupingList', 'groupingDetail',
  'groupingForm', 'seat', 'appBlocks', 'dex', 'boss', 'sect', 'tiaolv',
  'grad', 'gear', 'legal', 'termsBody', 'privacyBody', 'errors', 'guildAdmin',
  'groupingTemplate', 'account', 'buildshare', 'landing', 'feedback',
  'announcements', 'schedule', 'recruit', 'officer', 'ops', 'market', 'allies',
  'governance',
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
 * all UI copy: one section (area) = one XxxFbtUtils abstract class,
 * one string = one static method on it, one method = one fbs call.
 * Merged by scripts/i18n-codegen.mjs
 * from the per-domain files src/domains/<domain>/i18n/strings.source.ts.
 * - A string's identity is its declaration: <domain>/<export name>.
 *   STRING_FNS, the per-domain key unions and every call site reference
 *   the export name; translations hang off the identity via the id
 *   field of each entry in translations/*.json. desc is a
 *   natural-language description for translators — what the string is,
 *   where it appears, what its parameters mean — never a key, label or
 *   identifier; editing a desc must not move any reference (codegen
 *   re-derives fbtee's internal hashes from the declaration).
 * - Descriptions follow the role-first paradigm: '<Role> for
 *   <surface>, used for <purpose>' — role first (Title text,
 *   Button label, Hint text, Error message, ...), then the
 *   feature surface, then the use, written from the real call
 *   site; parameters are explained in the used-for part.
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

// Scan the fbs(...) call that starts at `at` in an entry body (index of
// 'fbs('): returns { pattern, desc } where pattern is the reconstructed
// source pattern (literal segments joined, fbs.param spans replaced by
// '{name}') and desc is the call's final string argument. String-aware
// paren matching; literals inside a param span (pv(p, "name")) are
// consumed as part of the span, never read as pattern segments.
function scanFbsCall(body, at) {
  let i = at + 4, depth = 1, call = '';
  while (i < body.length) {
    const c = body[i];
    if (c === '"') {
      let j = i + 1;
      while (j < body.length) { if (body[j] === '\\') { j += 2; continue; } if (body[j] === '"') break; j++; }
      call += body.slice(i, j + 1); i = j + 1; continue;
    }
    if (c === '(') depth++;
    else if (c === ')') { depth--; if (depth === 0) break; }
    call += c; i++;
  }
  const segs = [];
  let k = 0, lastLit = null;
  while (k < call.length) {
    if (call.startsWith('fbs.param(', k)) {
      const j = call.indexOf('"', k), e = call.indexOf('"', j + 1);
      segs.push('{' + call.slice(j + 1, e) + '}');
      let d = 1; k += 'fbs.param('.length;
      while (k < call.length && d) {
        if (call[k] === '"') { k = call.indexOf('"', k + 1) + 1; continue; }
        if (call[k] === '(') d++; else if (call[k] === ')') d--;
        k++;
      }
      continue;
    }
    if (call[k] === '"') {
      let j = k + 1;
      while (call[j] !== '"') { if (call[j] === '\\') j++; j++; }
      lastLit = JSON.parse(call.slice(k, j + 1));
      segs.push(lastLit);
      k = j + 1; continue;
    }
    k++;
  }
  return { pattern: segs.slice(0, -1).join(''), desc: lastLit };
}

// Regression gate for the fbt desc contract: desc is a natural-language
// description for translators, never an identity. Reject the historical
// misuse shapes — a key-shaped 'section.field' string, or any spaceless
// token that reads as an identifier rather than a sentence — so the old
// style cannot re-enter the repo (runs in both normal and --check mode,
// since every path parses the declarations through parseDomainEntries).
function validateDesc(domain, name, desc) {
  if (/^[a-z][a-zA-Z0-9]*\.[a-zA-Z0-9]+$/.test(desc)) {
    fail(`${domain}: entry ${name} has a key-shaped desc '${desc}'; desc must be a natural-language description for translators, not 'section.field'`);
  }
  if (!desc.includes(' ')) {
    fail(`${domain}: entry ${name} has a spaceless desc '${desc}'; desc must be a natural-language description sentence for translators`);
  }
}

// Scan a declaration text (one domain file, or the merged source) into
// its XxxFbtUtils class blocks:
// [{ className, section, body, methods: [{ field, sig, body }] }].
// Declarations live ONLY in this form: one section (area) = one
// abstract class named <Section>FbtUtils, one string = one static
// method on it. Scanning is string-aware throughout: pattern and desc
// literals may contain braces, parens and semicolons.
function scanClasses(text) {
  const classes = [];
  const re = /export abstract class ([A-Za-z0-9_]+) \{/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const className = m[1];
    if (!className.endsWith('FbtUtils')) fail('declaration class ' + className + ' does not follow the <Section>FbtUtils naming');
    const rawSection = className.slice(0, -'FbtUtils'.length);
    const section = rawSection[0].toLowerCase() + rawSection.slice(1);
    // String-aware brace matching from the opening brace.
    let i = m.index + m[0].length, depth = 1;
    while (i < text.length && depth > 0) {
      const c = text[i];
      if (c === '"') { i++; while (i < text.length) { if (text[i] === '\\') { i += 2; continue; } if (text[i] === '"') break; i++; } i++; continue; }
      if (c === '{') depth++;
      else if (c === '}') depth--;
      i++;
    }
    if (depth !== 0) fail('unterminated class ' + className);
    const body = text.slice(m.index, i);
    const methods = [];
    const mre = /static ([A-Za-z0-9_]+)\((fbs: FbsAPI(?:, p\?: StringParams)?)\) \{ return /g;
    let mm;
    while ((mm = mre.exec(body)) !== null) {
      // Method statement: from after 'return ' to the first ';' outside
      // string literals at paren depth 0.
      let j = mm.index + mm[0].length, d = 0;
      while (j < body.length) {
        const c = body[j];
        if (c === '"') { j++; while (j < body.length) { if (body[j] === '\\') { j += 2; continue; } if (body[j] === '"') break; j++; } j++; continue; }
        if (c === '(') d++;
        else if (c === ')') d--;
        else if (c === ';' && d === 0) break;
        j++;
      }
      if (j >= body.length) fail('unterminated method ' + className + '.' + mm[1]);
      methods.push({ field: mm[1], sig: mm[2], body: body.slice(mm.index + mm[0].length, j + 1) });
    }
    if (!methods.length) fail('class ' + className + ' declares no static fbs methods');
    classes.push({ className, section, body, methods });
  }
  return classes;
}

// Extract the declarations of one domain file, in file order:
// [{ domain, name, section, desc, pattern, className, classBody }].
// The export name <section>_<method> is the identity anchor; desc is
// free translator-facing text (validated by validateDesc). Flat
// `export const x = (fbs) => ...` declarations are banned outright.
function parseDomainEntries(domain, text) {
  if (/export const [A-Za-z0-9_]+ = \(fbs/.test(text)) {
    fail(domain + ': flat fbs declarations are banned; declare strings as static methods on the section XxxFbtUtils abstract class');
  }
  if (text.includes('STRING_FNS')) fail(domain + ': STRING_FNS is synthesized by codegen, not declared');
  const out = [];
  for (const cls of scanClasses(text)) {
    if (SECTION_OWNER[cls.section] !== domain) {
      fail(`${domain}: class ${cls.className} declares section '${cls.section}', owned by ${SECTION_OWNER[cls.section] || '(unknown section)'}`);
    }
    for (const mth of cls.methods) {
      const name = cls.section + '_' + mth.field;
      const at = mth.body.indexOf('fbs(');
      if (at < 0) fail(domain + ': no fbs call in method ' + cls.className + '.' + mth.field);
      const { pattern, desc } = scanFbsCall(mth.body, at);
      if (!desc) fail(domain + ': no desc found in method ' + cls.className + '.' + mth.field);
      validateDesc(domain, name, desc);
      out.push({ domain, name, section: cls.section, desc, pattern, className: cls.className, classBody: cls.body });
    }
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
      if (seen.has(e.name)) fail('duplicate export name ' + e.name);
      seen.add(e.name);
      if (!bySection.has(e.section)) bySection.set(e.section, []);
      bySection.get(e.section).push(e);
    }
  }
  for (const s of bySection.keys()) {
    if (!SECTION_ORDER.includes(s)) fail('section ' + s + ' missing from SECTION_ORDER');
  }
  const ordered = [];
  for (const s of SECTION_ORDER) for (const e of bySection.get(s) || []) ordered.push(e);
  // The merged source carries each section's class block once (in
  // SECTION_ORDER), then the STRING_FNS record mapping every export
  // name to its class's static method.
  const classByName = new Map();
  for (const e of ordered) {
    const prev = classByName.get(e.className);
    if (prev && prev !== e.classBody) fail('conflicting class bodies for ' + e.className);
    classByName.set(e.className, e.classBody);
  }
  const classBodies = [];
  for (const s of SECTION_ORDER) {
    for (const e of bySection.get(s) || []) {
      if (classBodies.includes(e.classBody)) continue;
      classBodies.push(e.classBody);
    }
  }
  const record = 'export const STRING_FNS: Record<string, (fbs: FbsAPI, p?: StringParams) => string> = {\n'
    + ordered.map((e) => `  "${e.name}": ${e.className}.${e.name.slice(e.section.length + 1)},\n`).join('') + '};\n';
  const merged = MERGED_PRELUDE + classBodies.join('\n') + '\n' + record;
  return { byDomain, merged, ordered };
}

// Per-domain key unions for the domains' text utils (typed accessors):
// the union is the domain's export names.
function genDomainKeys(domain, entries) {
  const cap = domain[0].toUpperCase() + domain.slice(1);
  const keys = entries.map((e) => e.name);
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
  const order = [...sourceText.slice(recAt).matchAll(/"([^"]+)":\s*[A-Za-z0-9_.]+,/g)].map((m) => m[1]);
  if (!order.length) fail('STRING_FNS empty');
  // Each method's outer padding, in the `" " + fbs(...)` /
  // `fbs(...) + " "` shape (a literal concatenated outside the call).
  const pads = new Map();
  for (const cls of scanClasses(sourceText)) {
    for (const mth of cls.methods) {
      const name = cls.section + '_' + mth.field;
      let rest = mth.body.trim().replace(/;$/, '');
      let lead = '', trail = '';
      const leadM = rest.match(/^("(?:[^"\\]|\\.)*") \+ /);
      if (leadM) { lead = JSON.parse(leadM[1]); rest = rest.slice(leadM[0].length); }
      const trailM = rest.match(/ \+ ("(?:[^"\\]|\\.)*")$/);
      if (trailM) { trail = JSON.parse(trailM[1]); rest = rest.slice(0, rest.length - trailM[0].length); }
      if (!rest.startsWith('fbs(')) fail('unparsable method body for ' + name);
      if (lead || trail) pads.set(name, { lead, trail });
    }
  }
  return { order, pads };
}

// ---------- catalogs + catalog.ts: CLI collect/translate ----------
function genCatalogsAndProjection(sourceText, orderedDecls) {
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
  // Join collected phrases to declarations by (pattern, desc): the leaf
  // carries both verbatim, so identity never enters fbtee's hash join.
  // fbtee trims the pattern on collection; declarations join trimmed.
  const leafByKey = new Map(); // (text \n desc) -> { hash, text }
  for (const phrase of ss.phrases) {
    for (const [hash, leaf] of Object.entries(phrase.hashToLeaf)) {
      const key = leaf.text + '\n' + leaf.desc;
      const prev = leafByKey.get(key);
      if (prev && prev.hash !== hash) fail('conflicting hashes for one (text, desc) pair');
      leafByKey.set(key, { hash, text: leaf.text });
    }
  }
  const { order, pads } = parseSourceMeta(sourceText);
  const pad = (name, txt) => { const p = pads.get(name); return p ? p.lead + txt + p.trail : txt; };
  // Declaration resolution: name -> { decl, hash, srcText }; a hash may
  // serve exactly one declaration (identical pattern+desc declared twice
  // would share translations ambiguously — differentiate the desc).
  const declOf = new Map();
  const hashToName = new Map();
  for (const e of orderedDecls) {
    const leaf = leafByKey.get(e.pattern.trim() + '\n' + e.desc);
    if (!leaf) fail('no collected phrase for ' + e.domain + '/' + e.name);
    if (hashToName.has(leaf.hash)) {
      fail(`declarations ${hashToName.get(leaf.hash)} and ${e.domain}/${e.name} share one phrase hash (identical pattern + desc); differentiate the description`);
    }
    hashToName.set(leaf.hash, e.name);
    declOf.set(e.name, { decl: e, hash: leaf.hash, srcText: leaf.text });
  }

  // catalogs/<locale>.json: { hk: pattern } (CLI output with the outer locale key removed).
  const catalogs = {};
  const perLocaleText = new Map(); // locale -> Map(name -> full text)
  for (const locale of LOCALES) {
    const raw = JSON.parse(readFileSync(join(outDir, locale + '.json'), 'utf8'));
    const inner = raw[locale];
    if (!inner) fail('translate output missing locale ' + locale);
    catalogs[locale] = JSON.stringify(inner, null, 2) + '\n';
    // Per-name text (for the projection): read the editable translations,
    // verify every entry against its declaration (hash known, id and
    // description matching the declaration), then apply padding.
    const editable = JSON.parse(readFileSync(join(TRANSLATIONS_DIR, locale + '.json'), 'utf8'));
    const m = new Map();
    for (const [hash, e] of Object.entries(editable.translations)) {
      const name = hashToName.get(hash);
      if (!name) fail(`translations/${locale}.json has unknown hash ${hash} (${e.description})`);
      const { decl } = declOf.get(name);
      if (e.id !== decl.domain + '/' + name) fail(`translations/${locale}.json id mismatch for ${hash}: '${e.id}' vs declaration '${decl.domain}/${name}'`);
      if (e.description !== decl.desc) fail(`translations/${locale}.json desc mismatch for ${decl.domain}/${name}`);
      m.set(name, pad(name, e.translations[0].translation));
    }
    perLocaleText.set(locale, m);
  }

  // catalog.ts projection: a derived compat view (section -> field ->
  // locale -> text), split from the export name; not an identity.
  const catalog = {};
  for (const name of order) {
    const { decl, srcText } = declOf.get(name);
    const section = decl.section, field = name.slice(section.length + 1);
    const cell = { 'zh-CN': pad(name, srcText) };
    for (const locale of LOCALES) {
      const t = perLocaleText.get(locale).get(name);
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
const { byDomain, merged: sourceText, ordered } = collectSources();
const outputs = new Map();
outputs.set(join(I18N_DIR, 'strings.ts'), genStringsTs(sourceText));
const { catalogs, catalogTs } = genCatalogsAndProjection(sourceText, ordered);
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
