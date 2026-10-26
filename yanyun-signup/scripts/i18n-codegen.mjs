#!/usr/bin/env node
/* i18n codegen (fbtee): 从人工维护的两份源派生全部生成物。
 *
 * 源 (src/domains/platform/i18n/):
 *   strings.source.ts        fbtee 声明面 (fbs 调用, desc = 'section.field')
 *   translations/<locale>.json  fbtee 可编辑译文 (md5(pattern+desc) 为键)
 * 生成物 (同目录, 勿手改):
 *   strings.ts                 transformSync 编译产物 (+ FbsRuntime 类型后处理)
 *   catalogs/<locale>.json     translate 编译目录 { hk: pattern }
 *   catalog.ts                 CATALOG 兼容投影 (错误文案集合 / harness 消费)
 *
 * 用法: node scripts/i18n-codegen.mjs [--check]
 *   --check 只比对不落盘, 有漂移 exit 1 (CI 用)。
 * 依赖 @nkzw/fbtee-compiler 的 collect/transform 走编程 API; translate 一步
 * 走其官方 CLI (bin.mjs), 因为编程接口未暴露等价函数。
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

// ---------- strings.ts: 编译 + 类型后处理 ----------
function genStringsTs(sourceText) {
  const out = transformSync('strings.source.ts', sourceText);
  if (out.errors && out.errors.length) fail('transform errors: ' + JSON.stringify(out.errors).slice(0, 1000));
  let code = out.code;
  // 剥掉源文件的声明面头注释 (它描述的是源文件, 不是生成物)
  const importAt = code.indexOf('import type');
  if (importAt > 0 && code.slice(0, importAt).includes('fbtee 声明面')) code = code.slice(importAt);
  // fbs._ / fbs._param 是 fbtee 运行时内部口, 不在 FbsAPI 公开类型里:
  // 生成代码的参数注解统一放宽为本地 FbsRuntime, 使其过 tsc 严格模式。
  const typeBlock = `
/* fbtee 编译产物调用 fbs._ / fbs._param (运行时内部口, 不在 FbsAPI 公开
 * 类型内): 参数类型在此放宽为带内部口的 FbsRuntime。运行时对象本身即
 * fbtee 的 fbs, 本来就带这两个口, 此处只是把类型说实。 */
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
  const header = '/* 生成物, 勿手改: 源 = strings.source.ts, 重跑 node scripts/i18n-codegen.mjs */\n';
  return header + code;
}

// ---------- 从声明面解析: 条目顺序 + 首尾空白 pad ----------
function parseSourceMeta(sourceText) {
  // 条目顺序 = STRING_FNS 记录里的键序
  const recAt = sourceText.indexOf('export const STRING_FNS');
  if (recAt < 0) fail('STRING_FNS not found');
  const order = [...sourceText.slice(recAt).matchAll(/"([^"]+)":\s*[A-Za-z0-9_]+,/g)].map((m) => m[1]);
  if (!order.length) fail('STRING_FNS empty');
  // 每条 fn 的外层 pad: `=> " " + fbs(...)` / `fbs(...) + " "` 形态
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

// ---------- catalogs + catalog.ts: 走 CLI collect/translate ----------
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

  // catalogs/<locale>.json: { hk: pattern } (CLI 输出去掉外层 locale 键)
  const catalogs = {};
  const perLocaleText = new Map(); // locale -> Map(desc -> full text)
  for (const locale of LOCALES) {
    const raw = JSON.parse(readFileSync(join(outDir, locale + '.json'), 'utf8'));
    const inner = raw[locale];
    if (!inner) fail('translate output missing locale ' + locale);
    catalogs[locale] = JSON.stringify(inner, null, 2) + '\n';
    // desc 级文本 (供投影): 读可编辑译文, 校验哈希都属于源, 再补 pad
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

  // catalog.ts 投影: 结构与旧 CATALOG 完全一致 (section -> field -> locale -> text)
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
  const catalogTs = '/* 生成物, 勿手改: node scripts/i18n-codegen.mjs\n'
    + ' * CATALOG 兼容投影: 由 fbtee 声明面 + 译文机械导出, 供 src/graphql.ts 的\n'
    + ' * 业务错误文案集合与 i18n harness 的目录级断言消费。运行时文本路径不读它\n'
    + ' * (运行时走 strings.ts 编译产物 + catalogs/*.json 的 fbtee 目录)。 */\n'
    + 'export const CATALOG: Record<string, Record<string, Record<string, string>>> = '
    + JSON.stringify(catalog, null, 2) + ';\n';
  return { catalogs, catalogTs };
}

// ---------- 主流程 ----------
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
