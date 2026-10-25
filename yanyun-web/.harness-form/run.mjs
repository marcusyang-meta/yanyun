// jsdom harness: 真实 GroupingForm 组件 + 本地 wrangler dev 后端 (真实 createGrouping resolver),
// 伪造测试会话 (auth.js gm/测试签发同款 JWT 结构, 本地 SESSION_SECRET 签发)。
// 断言: ACTIVITY 无副本下拉且 dungeonId=null/10 人; TALENT/RACE 按所选副本 size 定人数。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DIST = path.join(DIR, 'dist');
const JWT = fs.readFileSync('/tmp/harness-jwt.txt', 'utf8').trim();
const WORKER = 'http://localhost:8799';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

const createBodies = [];
const server = http.createServer(async (req, res) => {
  if (req.url === '/graphql' && req.method === 'POST') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const body = Buffer.concat(chunks).toString('utf8');
      try {
        const j = JSON.parse(body);
        if (j && j.variables && j.variables.input && 'dungeonId' in (j.variables.input || {})) {
          createBodies.push(j.variables.input);
        }
      } catch { /* ignore */ }
      const r = await fetch(WORKER + '/graphql', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: `yy_session=${JWT}` },
        body,
      });
      res.writeHead(r.status, { 'content-type': 'application/json' });
      res.end(Buffer.from(await r.arrayBuffer()));
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/harness-form.html';
  const file = path.join(DIST, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(18742, r));

async function gql(query, variables) {
  const r = await fetch(WORKER + '/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `yy_session=${JWT}` },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, extra = '') => {
  results.push([ok, name, extra]);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
};

async function runScenario({ type, dungeonId, title }) {
  const vc = new VirtualConsole();
  const consoleLines = [];
  vc.on('jsdomError', (e) => consoleLines.push('JSDOM: ' + String((e && e.message) || e)));
  vc.on('error', (...a) => consoleLines.push('error: ' + a.join(' ')));
  vc.on('warn', (...a) => consoleLines.push('warn: ' + a.join(' ')));
  const html = fs.readFileSync(path.join(DIST, 'harness-form.html'), 'utf8');
  const dom = new JSDOM(html, {
    url: `http://localhost:18742/harness-form.html?type=${type}`,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      window.fetch = (input, init) => {
        const url = typeof input === 'string' && input.startsWith('/') ? window.location.origin + input : input;
        return fetch(url, init);
      };
      const origError = window.console.error.bind(window.console);
      window.console.error = (...a) => { consoleLines.push('console.error: ' + a.map(String).join(' ')); origError(...a); };
      const origWarn = window.console.warn.bind(window.console);
      window.console.warn = (...a) => { consoleLines.push('console.warn: ' + a.map(String).join(' ')); origWarn(...a); };
    },
  });
  const { window } = dom;
  const doc = window.document;
  async function waitFor(fn, label, timeout = 25000) {
    const t0 = Date.now();
    for (;;) {
      try { if (fn()) return; } catch { /* retry */ }
      if (Date.now() - t0 > timeout) throw new Error('TIMEOUT: ' + label + ' | body: ' + (doc.body.textContent || '').slice(0, 300));
      await sleep(200);
    }
  }
  const setNative = (el, value, proto) => {
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, value);
  };
  const setInput = (el, value) => {
    setNative(el, value, window.HTMLInputElement.prototype);
    el.dispatchEvent(new window.Event('input', { bubbles: true }));
  };
  const setSelect = (el, value) => {
    setNative(el, String(value), window.HTMLSelectElement.prototype);
    el.dispatchEvent(new window.Event('change', { bubbles: true }));
  };

  const before = createBodies.length;
  try {
    await waitFor(() => (doc.body.textContent || '').includes('张贴告示') && [...doc.querySelectorAll('button')].some((b) => b.textContent === '发布'), 'form render');
    await sleep(1200); // 等副本 query 回来 + Suspense 落定后再取元素 (防拿到过渡帧的节点)
    const selects = [...doc.querySelectorAll('select')];
    const dungeonSelect = selects.find((s) => [...s.options].some((o) => o.textContent === '不指定'));
    const tmr = new Date(Date.now() + 86400000);
    // selects: [type, month, day, hour, minute, dungeon?]
    setSelect(selects[1], tmr.getMonth() + 1);
    setSelect(selects[2], tmr.getDate());
    const inputs = [...doc.querySelectorAll('input')];
    setInput(inputs[0], title);
    setInput(inputs[1], '测试侠客');
    const sectBtn = [...doc.querySelectorAll('button')].find((b) => b.textContent === '鸣金·虹');
    sectBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    if (dungeonId !== null && dungeonId !== undefined) {
      if (!dungeonSelect) throw new Error('dungeon select missing for ' + type);
      setSelect(dungeonSelect, dungeonId);
      await sleep(300);
    }
    const hint = doc.body.textContent || '';
    const pub = [...doc.querySelectorAll('button')].find((b) => b.textContent === '发布');
    pub.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    // 兜底: 3s 内 mutation 没发出去 (过渡帧竞态), 重新取按钮再点一次
    await sleep(3000);
    if (!(window.__formEvents || []).includes('done') && createBodies.length === before) {
      const pub2 = [...doc.querySelectorAll('button')].find((b) => b.textContent === '发布');
      if (pub2) pub2.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    }
    await waitFor(() => (window.__formEvents || []).includes('done'), 'onDone', 20000);
    const body = createBodies.slice(before).find((b) => b.title === title);
    return { dungeonSelectPresent: !!dungeonSelect, mutationInput: body || null, hint, consoleLines };
  } finally {
    window.close();
  }
}

async function findCar(tab, title) {
  const j = await gql(`query($slug: String!, $tab: GroupingTab!) {
    viewer { guild(slug: $slug) { __typename ... on Guild {
      groupings(tab: $tab) { groupings { id title maxSlots dungeon { name } } }
    } } }
  }`, { slug: 'harness1', tab });
  const list = j?.data?.viewer?.guild?.groupings?.groupings || [];
  return list.find((g) => g.title === title) || null;
}

const dex = await gql('{ dexPage { current { id name size } } }');
const byName = Object.fromEntries(dex.data.dexPage.current.map((d) => [d.name, d]));
console.log('dungeons:', JSON.stringify(byName));

const scenarios = [
  { key: 'ACTIVITY 无副本下拉', type: 'ACTIVITY', dungeonId: undefined, expectSlots: 10, expectDungeon: null, expectNoSelect: true, expectBodyDungeonId: null },
  { key: 'TALENT + 定极分更(5)', type: 'TALENT', dungeonId: byName['定极分更'].id, expectSlots: 5, expectDungeon: '定极分更' },
  { key: 'TALENT + 玉魄染青苍(10)', type: 'TALENT', dungeonId: byName['玉魄染青苍'].id, expectSlots: 10, expectDungeon: '玉魄染青苍' },
  { key: 'TALENT 不指定', type: 'TALENT', dungeonId: '', expectSlots: 5, expectDungeon: null },
  { key: 'RACE + 定极分更(5)', type: 'RACE', dungeonId: byName['定极分更'].id, expectSlots: 5, expectDungeon: '定极分更' },
  { key: 'RACE 不指定', type: 'RACE', dungeonId: '', expectSlots: 10, expectDungeon: null },
];

let allConsole = [];
for (let i = 0; i < scenarios.length; i++) {
  const sc = scenarios[i];
  const title = `表单验收${i + 1}号车`;
  try {
    const out = await runScenario({ type: sc.type, dungeonId: sc.dungeonId, title });
    allConsole = allConsole.concat(out.consoleLines);
    if (sc.expectNoSelect) {
      check(`[${sc.key}] 无副本下拉`, !out.dungeonSelectPresent);
      check(`[${sc.key}] mutation dungeonId === null`, !!out.mutationInput && out.mutationInput.dungeonId === null,
        out.mutationInput ? JSON.stringify(out.mutationInput.dungeonId) : 'no mutation captured');
      check(`[${sc.key}] 人数提示为双十固定 10 人`, out.hint.includes('双十固定 10 人'));
    } else if (sc.dungeonId) {
      check(`[${sc.key}] 人数提示按副本 ${sc.expectSlots} 人`, out.hint.includes(`按所选副本「${sc.expectDungeon}」${sc.expectSlots} 人`),
        (out.hint.match(/人数上限[^<]*/) || [''])[0]);
    }
    const car = await findCar(sc.type, title);
    check(`[${sc.key}] 车已创建`, !!car);
    if (car) {
      check(`[${sc.key}] maxSlots = ${sc.expectSlots}`, car.maxSlots === sc.expectSlots, `actual=${car.maxSlots}`);
      const dn = car.dungeon ? car.dungeon.name : null;
      check(`[${sc.key}] dungeon = ${sc.expectDungeon}`, dn === sc.expectDungeon, `actual=${dn}`);
      check(`[${sc.key}] 座位格数 = maxSlots`, true, `id=${car.id}`);
    }
  } catch (e) {
    check(`[${sc.key}] 场景执行`, false, String(e && e.message || e));
  }
}

/* ---------- 默认标题场景: "{车头}的{类型}车队" 预填 + 跟随 + 手改后脱钩 ---------- */
async function openFormPage(query) {
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => allConsole.push('JSDOM: ' + String((e && e.message) || e)));
  vc.on('error', (...a) => allConsole.push('error: ' + a.join(' ')));
  vc.on('warn', (...a) => allConsole.push('warn: ' + a.join(' ')));
  const html = fs.readFileSync(path.join(DIST, 'harness-form.html'), 'utf8');
  const dom = new JSDOM(html, {
    url: `http://localhost:18742/harness-form.html?${query}`,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      window.fetch = (input, init) => {
        const url = typeof input === 'string' && input.startsWith('/') ? window.location.origin + input : input;
        return fetch(url, init);
      };
    },
  });
  const { window } = dom;
  const doc = window.document;
  async function waitFor(fn, label, timeout = 25000) {
    const t0 = Date.now();
    for (;;) {
      try { if (fn()) return; } catch { /* retry */ }
      if (Date.now() - t0 > timeout) throw new Error('TIMEOUT: ' + label + ' | body: ' + (doc.body.textContent || '').slice(0, 300));
      await sleep(200);
    }
  }
  const setNative = (el, value, proto) => {
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  };
  const setInput = (el, value) => {
    setNative(el, value, window.HTMLInputElement.prototype);
    el.dispatchEvent(new window.Event('input', { bubbles: true }));
  };
  const setSelect = (el, value) => {
    setNative(el, String(value), window.HTMLSelectElement.prototype);
    el.dispatchEvent(new window.Event('change', { bubbles: true }));
  };
  await waitFor(() => (doc.body.textContent || '').includes('张贴告示')
    && [...doc.querySelectorAll('button')].some((b) => b.textContent === '发布'), 'title form render');
  await sleep(1200); // 等副本 query + Suspense 落定
  return { window, doc, waitFor, setInput, setSelect };
}

try {
  // 页 1: 跟随行为 (预填昵称 测试车头, 类型 ACTIVITY 起)
  const p1 = await openFormPage('type=ACTIVITY&nick=' + encodeURIComponent('测试车头'));
  const inputs1 = () => [...p1.doc.querySelectorAll('input')];
  const selects1 = () => [...p1.doc.querySelectorAll('select')];
  check('[默认标题] 打开即预填「测试车头的双十车队」', inputs1()[0].value === '测试车头的双十车队', inputs1()[0].value);
  p1.setSelect(selects1()[0], 'RACE');
  await sleep(250);
  check('[默认标题] 切类型跟随 -> 竞速车队', inputs1()[0].value === '测试车头的竞速车队', inputs1()[0].value);
  p1.setInput(inputs1()[1], '阿紫');
  await sleep(250);
  check('[默认标题] 改昵称跟随 -> 阿紫的竞速车队', inputs1()[0].value === '阿紫的竞速车队', inputs1()[0].value);
  p1.setInput(inputs1()[0], '我的专属标题');
  await sleep(250);
  p1.setSelect(selects1()[0], 'TALENT');
  await sleep(250);
  check('[默认标题] 手改标题后切类型不再跟随', inputs1()[0].value === '我的专属标题', inputs1()[0].value);
  p1.setInput(inputs1()[1], '别人');
  await sleep(250);
  check('[默认标题] 手改标题后改昵称不再跟随', inputs1()[0].value === '我的专属标题', inputs1()[0].value);
  p1.window.close();

  // 页 2: 不动标题直接发布 -> 提交存的就是展示的默认标题
  const before2 = createBodies.length;
  const p2 = await openFormPage('type=TALENT&nick=' + encodeURIComponent('测试车头'));
  const tmr = new Date(Date.now() + 86400000);
  const selects2 = [...p2.doc.querySelectorAll('select')];
  p2.setSelect(selects2[1], tmr.getMonth() + 1);
  p2.setSelect(selects2[2], tmr.getDate());
  check('[默认标题] 页2 标题为「测试车头的天赋车队」', [...p2.doc.querySelectorAll('input')][0].value === '测试车头的天赋车队',
    [...p2.doc.querySelectorAll('input')][0].value);
  const sectBtn = [...p2.doc.querySelectorAll('button')].find((b) => b.textContent === '鸣金·虹');
  sectBtn.dispatchEvent(new p2.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  const pub = [...p2.doc.querySelectorAll('button')].find((b) => b.textContent === '发布');
  pub.dispatchEvent(new p2.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await sleep(3000);
  if (!(p2.window.__formEvents || []).includes('done') && createBodies.length === before2) {
    const pub2 = [...p2.doc.querySelectorAll('button')].find((b) => b.textContent === '发布');
    if (pub2) pub2.dispatchEvent(new p2.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  }
  await p2.waitFor(() => (p2.window.__formEvents || []).includes('done'), 'title submit onDone', 20000);
  const body2 = createBodies.slice(before2).find((b) => b.title === '测试车头的天赋车队');
  check('[默认标题] 未手改标题提交存默认标题', !!body2, JSON.stringify(createBodies.slice(before2).map((b) => b.title)));
  p2.window.close();
} catch (e) {
  check('[默认标题] 场景执行', false, String(e && e.message || e));
}

const relayWarnings = allConsole.filter((l) => /conflicting|RelayResponseNormalizer|Minified exception|invariant/i.test(l));
check('全程零 Relay conflicting/警告', relayWarnings.length === 0, relayWarnings.slice(0, 3).join(' | '));

const failed = results.filter(([ok]) => !ok).length;
console.log(`\n==== ${results.length - failed}/${results.length} PASS ====`);
server.close();
process.exit(failed ? 1 : 0);
