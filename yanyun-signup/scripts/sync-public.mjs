#!/usr/bin/env node
// sync-public.mjs — sync the web build output into yanyun-signup/public/
// (synchronous).
//
// Repo convention (see root .gitignore and the README deploy section):
//   - In public/, only index.html and assets/ are build output (not committed);
//   - everything else (hub-admin.*, gadmin.*, style.css, favicon.svg,
//     icons.svg) is committed hand-written source this script never touches.
// Sync semantics: dist wins — index.html is overwritten outright;
// assets/ is fully aligned, and stale hashed files absent from dist are
// deleted from public/assets (the old `cp -r` only layered files on and
// once accumulated 3 generations / 110 files).
//
// Usage:
//   node scripts/sync-public.mjs [--dist <dir>] [--public <dir>]
// Defaults: --dist = ../../yanyun-web/dist (relative to the signup dir),
// --public = ../public (relative to scripts/). In CI promote, point
// --dist at the directory unpacked from the artifact (containing
// index.html + assets/) to reuse the same logic.

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

// 1) Overwrite index.html.
writeFileSync(join(publicDir, 'index.html'), readFileSync(join(distDir, 'index.html')));
console.log('index.html: copied from dist');

// 2) Align assets/: copy everything from dist, delete extras in public.
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
// After deleting files, prune now-empty directories.
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

// 3) Summary: the entry refs of the new index.html, for CI/local verification.
const html = readFileSync(join(publicDir, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
console.log(`index.html asset refs: ${refs.join(', ')}`);
