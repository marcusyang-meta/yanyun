// Real-render smoke for the PR preview gate.
// Rationale (2026-10-25 incident): duplicate React made every page crash in
// a real browser while curl returned 200 everywhere. HTTP probes cannot see
// that class of failure, so the pipeline renders key pages in headless
// Chromium over CDP and asserts rendered text + zero JS exceptions.
//
// Usage:
//   node scripts/ci/render-smoke.mjs --base https://release-yanyun.tbdlab.workers.dev \
//     [--page /:Discord] [--page /demo:演示百业]
// Each --page is path:expected-substring (repeatable). Chrome binary comes
// from $CHROME_PATH, the Playwright cache, or a system chrome/chromium.
// Local debugging only (never set in CI): SMOKE_PROXY=http://host:port adds
// --proxy-server; SMOKE_INSECURE=1 ignores certificate errors.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import WebSocket from 'ws';

const argv = process.argv.slice(2);
let BASE = '';
const pages = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--base') BASE = argv[++i].replace(/\/$/, '');
  else if (argv[i] === '--page') { const v = argv[++i]; const c = v.indexOf(':'); pages.push({ path: v.slice(0, c), marker: v.slice(c + 1) }); }
}
if (!BASE || !pages.length) { console.error('usage: render-smoke.mjs --base <url> --page <path:marker>...'); process.exit(2); }

function findChrome() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const candidates = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  const cache = path.join(os.homedir(), '.cache/ms-playwright');
  if (fs.existsSync(cache)) {
    for (const dir of fs.readdirSync(cache).sort().reverse()) {
      candidates.push(
        path.join(cache, dir, 'chrome-linux64/chrome'),
        path.join(cache, dir, 'chrome-linux/chrome'),
        path.join(cache, dir, 'chrome-headless-shell-linux64/chrome-headless-shell'),
        path.join(cache, dir, 'chrome-mac/Chromium.app/Contents/MacOS/Chromium'),
      );
    }
  }
  return candidates.find((p) => fs.existsSync(p)) || null;
}
const CHROME = findChrome();
if (!CHROME) { console.error('no Chromium binary found (set CHROME_PATH or install via playwright)'); process.exit(2); }

let pass = 0, fail = 0;
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; console.log(`FAIL  ${name}${extra ? ' — ' + String(extra).slice(0, 240) : ''}`); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PORT = 9300 + (process.pid % 400);
const chromeArgs = [
  '--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
  `--remote-debugging-port=${PORT}`, '--window-size=1280,900',
  `--user-data-dir=${fs.mkdtempSync(path.join(os.tmpdir(), 'smoke-profile-'))}`,
  'about:blank',
];
if (process.env.SMOKE_PROXY) chromeArgs.push(`--proxy-server=${process.env.SMOKE_PROXY}`);
const chrome = spawn(CHROME, chromeArgs, { stdio: ['ignore', 'ignore', 'pipe'] });
chrome.stderr.on('data', () => { /* drain */ });

let wsUrl = '';
for (let i = 0; i < 60 && !wsUrl; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    const j = await r.json();
    wsUrl = j.webSocketDebuggerUrl || '';
  } catch { await sleep(500); }
}
if (!wsUrl) { console.error('chrome DevTools endpoint never came up'); chrome.kill('SIGKILL'); process.exit(2); }

const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.on('open', r); ws.on('error', j); });
let seq = 0;
const pending = new Map();
const listeners = [];
ws.on('message', (raw) => {
  const msg = JSON.parse(raw);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result ?? msg.error); pending.delete(msg.id); }
  else if (msg.method) for (const fn of listeners) fn(msg);
});
function send(method, params = {}, sessionId) {
  const id = ++seq;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

async function renderPageOnce(p, marker) {
  // Always drive a fresh target per page. Reusing the browser's initial
  // page target races with the previous page's Target.closeTarget: the
  // target list can still carry the dying id and attach then fails with
  // -32602 "No target with given id found" (seen on CI for the second
  // page). One retry on a second fresh target covers transient churn.
  let targetId = '';
  let sessionId = '';
  let lastAttach = null;
  for (let attempt = 0; attempt < 2 && !sessionId; attempt++) {
    targetId = (await send('Target.createTarget', { url: 'about:blank' }))?.targetId || '';
    if (!targetId) break;
    lastAttach = await send('Target.attachToTarget', { targetId, flatten: true });
    sessionId = lastAttach?.sessionId || '';
    if (!sessionId) await send('Target.closeTarget', { targetId });
  }
  if (!sessionId) { check(`render ${p} attaches to a CDP session`, false, JSON.stringify(lastAttach)); return; }
  if (process.env.SMOKE_INSECURE === '1') await send('Security.setIgnoreCertificateErrors', { ignore: true }, sessionId);
  const exceptions = [];
  const consoleErrors = [];
  const onEvent = (msg) => {
    if (msg.sessionId !== sessionId) return;
    if (msg.method === 'Runtime.exceptionThrown') {
      exceptions.push(msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text || 'exception');
    }
    if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'assert'].includes(msg.params.type)) {
      consoleErrors.push((msg.params.args || []).map((a) => a.value || a.description || '').join(' ').slice(0, 200));
    }
  };
  listeners.push(onEvent);
  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send('Network.enable', {}, sessionId);
  await send('Network.setExtraHTTPHeaders', { headers: { 'Accept-Language': 'zh-CN,zh;q=0.9', 'x-locale': 'zh-CN' } }, sessionId);
  await send('Page.navigate', { url: BASE + p }, sessionId);

  let text = '';
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    const r = await send('Runtime.evaluate', { expression: 'document.body ? document.body.innerText : ""', returnByValue: true }, sessionId);
    text = r?.result?.value || '';
    if (text.includes(marker)) break;
    await sleep(750);
  }
  await send('Target.closeTarget', { targetId });
  listeners.splice(listeners.indexOf(onEvent), 1);
  return { text, exceptions, consoleErrors };
}

async function renderPage({ path: p, marker }) {
  let r = await renderPageOnce(p, marker);
  // Cold-start flake signature: completely empty body with zero JS
  // exceptions and zero console errors — the bundle never got a chance
  // to run (isolate/asset cold start in the preview environment). A real
  // rendering regression (the 2026-10-25 double-React class) throws on
  // every attempt, so retry exactly once in a fresh target; the text,
  // exception and console-error assertions are NOT relaxed.
  if (!r.text.includes(marker) && r.text === '' && r.exceptions.length === 0 && r.consoleErrors.length === 0) {
    console.log(`NOTE  render ${p}: empty body with no errors — retrying once (cold-start flake signature)`);
    r = await renderPageOnce(p, marker);
  }
  check(`render ${p} shows "${marker}"`, r.text.includes(marker), 'body starts: ' + r.text.slice(0, 160).replace(/\s+/g, ' '));
  check(`render ${p} has no JS exceptions`, r.exceptions.length === 0, r.exceptions.join(' | '));
  check(`render ${p} has no console errors`, r.consoleErrors.length === 0, r.consoleErrors.join(' | '));
}

try {
  for (const pg of pages) await renderPage(pg);
} finally {
  try { ws.close(); } catch { /* */ }
  chrome.kill('SIGKILL');
}
console.log(`\nrender-smoke: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
