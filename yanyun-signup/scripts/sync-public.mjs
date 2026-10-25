#!/usr/bin/env node
// sync-public.mjs — 把 web 构建产物同步进 yanyun-signup/public/（同步式）。
//
// 仓库约定（见根 .gitignore 与 README「部署」节）：
//   - public/ 里只有 index.html 与 assets/ 是构建产物（不进仓）；
//   - 其余文件（hub-admin.*、gadmin.*、style.css、favicon.svg、icons.svg）
//     都是进仓的手写源码，本脚本绝不碰。
// 同步语义：以 dist 为准——index.html 直接覆盖；assets/ 全量对齐，
// dist 里没有的旧哈希文件从 public/assets 删除（旧 cp -r 只叠不删，
// 曾累积到 3 代 110 个文件）。
//
// 用法：
//   node scripts/sync-public.mjs [--dist <dir>] [--public <dir>]
// 默认 --dist = ../../yanyun-web/dist（相对 signup 目录），
//      --public = ../public（相对 scripts/）。CI promote 时用 --dist
// 指向从 artifact 解出的目录（内含 index.html + assets/）即可复用同一逻辑。

import { existsSync, readdirSync, readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const signupDir = join(scriptsDir, '..');

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : null;
}

const distDir = argValue('--dist') ?? join(signupDir, '..', 'yanyun-web', 'dist');
const publicDir = argValue('--public') ?? join(signupDir, 'public');
const distAssets = join(distDir, 'assets');
const publicAssets = join(publicDir, 'assets');

function die(msg) {
  console.error(`sync-public: error: ${msg}`);
  process.exit(1);
}

if (!existsSync(join(distDir, 'index.html'))) die(`dist index.html not found: ${distDir}`);
if (!existsSync(distAssets) || !statSync(distAssets).isDirectory()) die(`dist assets/ not found: ${distAssets}`);
if (!existsSync(publicDir)) die(`public dir not found: ${publicDir}`);

function walkFiles(root) {
  const out = [];
  (function walk(dir) {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else out.push(relative(root, p));
    }
  })(root);
  return out;
}

// 1) index.html 覆盖
writeFileSync(join(publicDir, 'index.html'), readFileSync(join(distDir, 'index.html')));
console.log('index.html: copied from dist');

// 2) assets/ 对齐：复制 dist 全部文件，删除 public 里多余的
mkdirSync(publicAssets, { recursive: true });
const distFiles = new Set(walkFiles(distAssets));
const publicFiles = walkFiles(publicAssets);
let deleted = 0;
for (const rel of publicFiles) {
  if (!distFiles.has(rel)) {
    rmSync(join(publicAssets, rel));
    deleted++;
    console.log(`assets: deleted stale ${rel}`);
  }
}
// 删完文件后清掉空目录（dist 里没有对应目录的）
(function pruneEmptyDirs(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      pruneEmptyDirs(p);
      if (readdirSync(p).length === 0) rmSync(p, { recursive: true });
    }
  }
})(publicAssets);
let copied = 0;
for (const rel of distFiles) {
  const src = join(distAssets, rel);
  const dst = join(publicAssets, rel);
  mkdirSync(dirname(dst), { recursive: true });
  copyFileSync(src, dst);
  copied++;
}
console.log(`assets: ${copied} files in sync, ${deleted} stale deleted`);

// 3) 摘要：新 index.html 引用的入口，供 CI/本地核对
const html = readFileSync(join(publicDir, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
console.log(`index.html asset refs: ${refs.join(', ')}`);
