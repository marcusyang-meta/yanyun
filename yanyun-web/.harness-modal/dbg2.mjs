import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
const DIST = '/home/hatch/workspace/yanyun-web/.harness-modal/dist';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
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
const DBG = 19335;
const chrome = spawn('/opt/meta-chromium/chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', `--remote-debugging-port=${DBG}`, `--user-data-dir=/tmp/cdp-dbg2-${Date.now()}`, '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let version = null;
for (let i = 0; i < 40; i++) { try { const r = await fetch(`http://127.0.0.1:${DBG}/json/version`); if (r.ok) { version = await r.json(); break; } } catch {} await sleep(250); }
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 1; const pend = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  else if (m.method === 'Runtime.exceptionThrown') console.log('EXC', JSON.stringify(m.params.exceptionDetails).slice(0, 400));
};
const send = (method, params = {}, sessionId) => new Promise((resolve) => { const i = id++; pend.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) })); });
const t = await send('Target.createTarget', { url: 'about:blank' });
const targetId = t.result.targetId;
const att = await send('Target.attachToTarget', { targetId, flatten: true });
const sid = att.result.sessionId;
await send('Page.enable', {}, sid);
await send('Runtime.enable', {}, sid);
await send('Page.navigate', { url: `http://localhost:${port}/harness.html` }, sid);
await sleep(9000);
const r = await send('Runtime.evaluate', { expression: 'document.body.innerHTML.slice(0,400)', returnByValue: true }, sid);
console.log('BODY:', JSON.stringify(r.result?.result?.value || r.result));
chrome.kill('SIGKILL'); server.close(); process.exit(0);
