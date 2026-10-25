import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';
const DIST = '/home/hatch/workspace/yanyun-web/.harness-dex/dist';
const server = http.createServer((req, res) => {
  console.log('REQ', req.method, req.url);
  let p = req.url.split('?')[0]; if (p === '/') p = '/harness-dex.html';
  const f = path.join(DIST, p);
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': p.endsWith('.js') ? 'text/javascript' : 'text/html' });
  res.end(fs.readFileSync(f));
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => console.log('JSDOMERR', e.message, e.detail && e.detail.stack || ''));
vc.on('error', (e) => console.log('CONSOLE-ERR', String(e)));
vc.on('log', (e) => console.log('CONSOLE-LOG', String(e)));
const html = fs.readFileSync(path.join(DIST, 'harness-dex.html'), 'utf8');
const dom = new JSDOM(html, { url: `http://localhost:${port}/harness-dex.html`, runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc });
dom.window.fetch = fetch;
await new Promise((r) => setTimeout(r, 12000));
console.log('ROOT HTML:', dom.window.document.getElementById('root')?.innerHTML?.slice(0, 300));
console.log('BODY TEXT:', (dom.window.document.body.textContent || '').slice(0, 300));
server.close(); process.exit(0);
