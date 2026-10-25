import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
const DIST = '/home/hatch/workspace/yanyun-web/.harness-modal/dist';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  console.log('REQ', req.method, req.url.slice(0, 60));
  if (req.url === '/graphql') {
    const ch = []; req.on('data', (c) => ch.push(c));
    req.on('end', async () => {
      const r = await fetch('https://yanyun.tbdlab.workers.dev/graphql', { method: 'POST', headers: { 'content-type': 'application/json' }, body: Buffer.concat(ch) });
      res.writeHead(r.status, { 'content-type': 'application/json' }); res.end(Buffer.from(await r.arrayBuffer()));
    });
    return;
  }
  let p = req.url.split('?')[0]; if (p === '/') p = '/harness.html';
  const f = path.join(DIST, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const DBG = 19334;
const pageUrl = `http://localhost:${port}/harness.html`;
const chrome = spawn('/opt/meta-chromium/chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessChecks,BlockInsecurePrivateNetworkRequests', `--remote-debugging-port=${DBG}`, `--user-data-dir=/tmp/cdp-dbg-${Date.now()}`, '--window-size=1440,900', pageUrl], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 40; i++) { try { const r = await fetch(`http://127.0.0.1:${DBG}/json/version`); if (r.ok) break; } catch {} await sleep(250); }
const targets = await (await fetch(`http://127.0.0.1:${DBG}/json/list`)).json();
const target = targets.find((t) => t.type === 'page' && t.url.includes('harness.html')) || targets.find((t) => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 1; const pend = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  else if (m.method === 'Runtime.consoleAPICalled') console.log('CONSOLE', m.params.type, (m.params.args || []).map((a) => a.value || a.description || '').join(' ').slice(0, 300));
  else if (m.method === 'Runtime.exceptionThrown') console.log('EXC', JSON.stringify(m.params.exceptionDetails).slice(0, 500));
  else if (m.method === 'Log.entryAdded') console.log('LOG', m.params.entry.level, m.params.entry.text.slice(0, 300));
};
const send = (method, params = {}) => new Promise((resolve) => { const i = id++; pend.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await sleep(9000);
const r = await send('Runtime.evaluate', { expression: 'document.body.innerHTML.slice(0,600)', returnByValue: true });
console.log('BODY:', JSON.stringify(r.result?.result?.value || r.result));
chrome.kill('SIGKILL'); server.close(); process.exit(0);
