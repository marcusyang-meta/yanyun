import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import resvgWasm from './resvg.wasm';
// 通用品牌图: 预渲染字节随包发布 (generic.png 由生产环境现渲染捕获,
// 与原 genericOgResponse 的 satori 树逐像素一致)。hub 保留 slug 与
// 一切失败兜底都直接发这份字节 — 不渲染、不拉字体、不打 GraphQL,
// 冷/热请求都是亚秒级 200。
import genericPng from './generic.png';
import genericSvg from './generic.svg';

const SITE_API = 'https://yanyun.tbdlab.workers.dev';
const GENERIC_MAX_AGE = 86400; // 通用图是静态资产: 长 TTL

function genericResponse(url, maxAge = GENERIC_MAX_AGE) {
  if (url && url.searchParams.get('format') === 'svg') {
    return new Response(genericSvg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': `public, max-age=${maxAge}` },
    });
  }
  return new Response(genericPng, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': `public, max-age=${maxAge}` },
  });
}

// WASM init (bundled) — 共享同一个 Promise。
// 旧实现用布尔旗标: 并发冷请求会同时进入 initWasm, 第二次初始化抛错;
// 且模块求值/首请求阶段一旦在 isolate 里炸掉, 请求根本到不了路由的
// try/catch, Cloudflare 直接回 503 (error 1101/1102, 17 字节 body)。
// 现在: 初始化只发生一次, 且顶层 fetch 兜底通用图 (见底部)。
let wasmReady = null;
function ensureWasm() {
  if (!wasmReady) {
    wasmReady = initWasm(resvgWasm).catch((e) => { wasmReady = null; throw e; });
  }
  return wasmReady;
}

/* ---------- 带超时 + 边缘缓存的字节拉取 (字体用) ----------
 * 字体是冷路径最大成本 (Noto Sans SC 全量 TTF 十几 MB, 每 isolate 内存
 * 缓存互相不通)。拉到的字节同时写入 caches.default, 同 colo 的新
 * isolate 可直接命中边缘缓存, 不再重复全量下载。 */
async function cachedFetchBytes(cache, url, { timeoutMs = 10000, headers = null, cacheMaxAge = 86400 } = {}) {
  const key = new Request(url, { method: 'GET' });
  try {
    const hit = await cache.match(key);
    if (hit) return await hit.arrayBuffer();
  } catch { /* 缓存读失败不致命 */ }
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    ...(headers ? { headers } : {}),
  });
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`);
  const buf = await res.arrayBuffer();
  try {
    await cache.put(key, new Response(buf.slice(0), {
      headers: { 'Content-Type': 'application/octet-stream', 'Cache-Control': `public, max-age=${cacheMaxAge}` },
    }));
  } catch { /* 缓存写失败不致命 */ }
  return buf;
}

// Font cache (in-memory per isolate + edge cache underneath)
let fontData = null;
const FONT_URL = 'https://fonts.gstatic.com/s/notosanssc/v41/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaGzjCnYw.ttf';

async function getFont(cache) {
  if (fontData) return fontData;
  fontData = await cachedFetchBytes(cache, FONT_URL);
  return fontData;
}

// Brush font (Ma Shan Zheng — same as the website's hero typography).
// Satori doesn't support woff2, so request the css2 API with an ancient
// User-Agent: Google then serves a plain TTF URL. Fall back to a pinned
// TTF URL if the CSS lookup fails.
let brushFontData = null;
const BRUSH_FONT_CSS = 'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap';
const BRUSH_FONT_FALLBACK = 'https://fonts.gstatic.com/s/mashanzheng/v18/NaPecZTRCLxvwo41b4gvzkXaRMQ.ttf';

async function getBrushFont(cache) {
  if (brushFontData) return brushFontData;
  let ttfUrl = BRUSH_FONT_FALLBACK;
  try {
    const cssBuf = await cachedFetchBytes(cache, BRUSH_FONT_CSS, { headers: { 'User-Agent': 'Mozilla/4.0' } });
    const css = new TextDecoder().decode(cssBuf);
    const m = css.match(/url\((https:[^)]+\.ttf)\)/);
    if (m) ttfUrl = m[1];
  } catch { /* keep fallback URL */ }
  brushFontData = await cachedFetchBytes(cache, ttfUrl);
  return brushFontData;
}

/* 百业自定义头像 (主站公开出图路径, 无头像 404): 取字节内嵌为 data
 * URI 给 satori 的 img。头像是 ≤400KB 小图, 边缘缓存 1 小时 (与百业
 * 图本身的缓存同口径); 任何失败 (404/超时/坏字节) 都当没头像 —
 * 返回 null, 卡面回退到无头像版式, 绝不拖垮整图。 */
function sniffImageMime(b) {
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 12 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  return null;
}
function bytesToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}
async function fetchGuildAvatar(cache, slug) {
  try {
    const buf = await cachedFetchBytes(
      cache,
      `${SITE_API}/guilds/${encodeURIComponent(slug)}/avatar`,
      { timeoutMs: 4000, cacheMaxAge: 3600 },
    );
    const mime = sniffImageMime(new Uint8Array(buf));
    if (!mime) return null;
    return `data:${mime};base64,${bytesToBase64(buf)}`;
  } catch {
    return null;
  }
}

async function fetchJson(url, init = {}, timeoutMs = 5000) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`);
  return res.json();
}

// Red seal stamp — brush 燕, sized like a real seal next to the title,
// not a floating app icon.
function sealElement(size = 88) {
  return {
    type: 'div',
    props: {
      style: {
        width: `${size}px`, height: `${size}px`, flexShrink: 0,
        backgroundColor: '#a02c1a', borderRadius: '10px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', transform: 'rotate(6deg)',
        // 无 boxShadow: resvg 里模糊阴影约吃掉一半栅格化 CPU, 冷渲染会撞
        // 平台 CPU 上限被 1101/503 杀掉 (tail 实测 exceededCpu); 扁平印章
        // 在卡面尺寸下与带阴影版肉眼无差。
      },
      children: {
        type: 'span',
        props: {
          style: { color: '#ece2cb', fontSize: `${Math.round(size * 0.64)}px`, fontFamily: 'Ma Shan Zheng' },
          children: '燕',
        },
      },
    },
  };
}

/* 百业数据: 返回 { name, slogan } / null (不存在 -> 404) / throw (基础设施
 * 故障 -> 上层兜底通用图, 绝不误判 404)。
 * 数据通道 = GraphQL ogGuildCard (公开卡面窄口): 百业名/标语本就
 * 公开 (2026-10-25 分享卡口径), 已绑定百业同样可读; dev_only 百业
 * 从非 dev 来源视为不存在。旧双通道 (guildPage + /api/tenants) 已
 * 随产品 REST 关停迁走。 */
async function fetchGuildData(slug) {
  const json = await fetchJson(`${SITE_API}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query($slug: String!) {
          ogGuildCard(slug: $slug) { exists name slogan }
        }
      `,
      variables: { slug },
    }),
  });
  const card = json.data?.ogGuildCard;
  if (!card || !card.exists) return null;
  return { name: card.name || slug, slogan: card.slogan || '' };
}

// 本周窗口: 周一 05:00 (北京时间) 起 7 天 — 与主站周逻辑同界
function weekWindowUtc() {
  const now = Math.floor(Date.now() / 1000);
  const cst = now + 8 * 3600; // 平移到北京时间墙钟
  const d = new Date(cst * 1000);
  const dayStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000;
  let monday = dayStart - ((d.getUTCDay() + 6) % 7) * 86400 + 5 * 3600; // 本周一 05:00 (平移系)
  if (cst < monday) monday -= 7 * 86400;
  const startUtc = monday - 8 * 3600;
  return [startUtc, startUtc + 7 * 86400];
}

// 本周双十车队数: ogGuildCard.weekActivityCount (与旧 REST 周列表
// 同谓词的服务端计数)。失败只让计数归零 (卡面降级为品牌句), 不拖垮整图。
async function fetchTeamCount(slug) {
  try {
    const [from, to] = weekWindowUtc();
    const json = await fetchJson(`${SITE_API}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query($slug: String!, $from: Int!, $to: Int!) {
            ogGuildCard(slug: $slug) { weekActivityCount(fromUtc: $from, toUtc: $to) }
          }
        `,
        variables: { slug, from, to },
      }),
    });
    return json.data?.ogGuildCard?.weekActivityCount ?? 0;
  } catch {
    return 0;
  }
}

const CAR_TYPE_LABEL = { ACTIVITY: '双十人本', TALENT: '天赋组队', RACE: '竞速报名' };

// 车时间格式化：与前端 fmtDate 同源（UTC 时间戳），OG 图用 UTC 墙钟时间，如“周六 20:00”
function formatCarTime(startsAt) {
  if (!startsAt) return '';
  const t = String(startsAt).trim();
  let d;
  if (/^\d+$/.test(t)) d = new Date(parseInt(t, 10) * 1000);
  else d = new Date(t.replace(' ', 'T') + 'Z');
  if (isNaN(d.getTime())) return t;
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${week[d.getUTCDay()]} ${hh}:${mm}`;
}

/* 取车数据: 走 GraphQL ogCarCard (公开卡面窄口) — 服务端按 tenant
 * 隔离取行, 跨会/不存在 -> null, 不泄露。只取卡面字段 (标题/类型/
 * 时间/副本/人数), 绝不取成员昵称上卡。
 * 返回 grouping 对象 / null (车不存在) / throw (基础设施故障)。 */
async function fetchGroupingData(slug, id) {
  const json = await fetchJson(`${SITE_API}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query($slug: String!, $id: ID!) {
          ogCarCard(slug: $slug, id: $id) {
            title type startsAtUtc dungeonName occupiedCount maxSlots status
          }
        }
      `,
      variables: { slug, id: String(id) },
    }),
  });
  const ev = json.data?.ogCarCard;
  if (!ev) return null;
  return {
    title: ev.title || '',
    type: String(ev.type || '').toUpperCase(),
    startsAt: ev.startsAtUtc != null ? String(ev.startsAtUtc) : '',
    dungeon: ev.dungeonName ? { name: ev.dungeonName } : null,
    occupiedCount: ev.occupiedCount || 0,
    maxSlots: ev.maxSlots || 0,
    status: ev.status || '',
  };
}

/* 渲染并发闸: satori+resvg + 十几 MB 字体是重活, 同一 isolate 里多个
 * 冷渲染并发会把内存/CPU 顶爆, 平台在 handler 来不及 catch 时就以
 * 1101/1102 (503, 17 字节) 杀掉个别请求 — 实测并发冷压测约 1/10 中招。
 * 每 isolate 最多 2 个渲染同时跑, 其余排队 (等候只耗墙钟不耗 CPU);
 * 缓存命中的请求不进闸。 */
let renderSlots = 2;
const renderWaiters = [];
function acquireRenderSlot() {
  if (renderSlots > 0) { renderSlots--; return Promise.resolve(); }
  return new Promise((resolve) => renderWaiters.push(resolve));
}
function releaseRenderSlot() {
  const next = renderWaiters.shift();
  if (next) next();
  else renderSlots++;
}
async function withRenderSlot(fn) {
  await acquireRenderSlot();
  try { return await fn(); } finally { releaseRenderSlot(); }
}

async function svgToPngResponse(svg, url, maxAge) {
  const format = url.searchParams.get('format');
  if (format === 'svg') {
    return new Response(svg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': `public, max-age=${maxAge}` },
    });
  }
  await ensureWasm();
  // resvg 单次渲染偶发抛错时换新实例重试一次, 再失败才由上层兜底
  let lastErr = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
      const pngBuffer = resvg.render().asPng();
      return new Response(pngBuffer, {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': `public, max-age=${maxAge}` },
      });
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

async function handleCarImage(request, url, slug, id) {
  // Cache 10 分钟（座位数变化比百业信息快）
  const cache = caches.default;
  const cacheKey = new Request(url.toString(), request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  // 百业不存在 -> 404; 基础设施故障 -> throw, 由顶层兜底通用图
  const guild = await fetchGuildData(slug);
  if (!guild) return new Response('Guild not found', { status: 404 });

  const g = await fetchGroupingData(slug, id);
  if (!g) return new Response('Grouping not found', { status: 404 });
  const guildName = guild.name || slug;
  await acquireRenderSlot();
  try {
  const font = await getFont(cache);
  const brushFont = await getBrushFont(cache);
  const title = g.title || '车队招募';
  const typeLabel = CAR_TYPE_LABEL[g.type] || g.type || '';
  const timeLabel = formatCarTime(g.startsAt);
  const meta = [typeLabel, timeLabel, g.dungeon?.name].filter(Boolean).join(' · ');
  const pct = g.maxSlots > 0 ? Math.min(1, g.occupiedCount / g.maxSlots) : 0;
  const barW = Math.round(640 * pct);
  // Brush font renders narrower than sans — scale by title length so
  // long titles still fit next to the seal.
  const titleSize = title.length <= 6 ? 100 : title.length <= 10 ? 88 : title.length <= 14 ? 72 : title.length <= 20 ? 60 : 50;

  const element = {
    type: 'div',
    props: {
      style: {
        width: '1200px', height: '630px', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#0c0b09', position: 'relative', fontFamily: 'Noto Sans SC',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'radial-gradient(ellipse at 30% 20%, rgba(201,163,92,0.09) 0%, transparent 60%)',
            },
          },
        },
        // 百业名（小，金）
        {
          type: 'div',
          props: {
            style: { color: '#c9a35c', fontSize: '32px', letterSpacing: '6px', marginBottom: '20px' },
            children: guildName,
          },
        },
        // 车标题（毛笔体大金字）+ 印章贴在标题右侧
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', flexDirection: 'row', alignItems: 'flex-end',
              justifyContent: 'center', marginBottom: '24px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    color: '#ecd28f', fontSize: `${titleSize}px`, fontFamily: 'Ma Shan Zheng',
                    letterSpacing: '2px', textAlign: 'center', maxWidth: '880px',
                  },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: { marginLeft: '20px', marginBottom: '10px', display: 'flex' },
                  children: sealElement(84),
                },
              },
            ],
          },
        },
        // 类型 · 时间 · 副本
        {
          type: 'div',
          props: {
            style: { color: '#ece2cb', fontSize: '34px', letterSpacing: '2px', marginBottom: '28px' },
            children: meta,
          },
        },
        // 已报名 X/Y + 进度条
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
            children: [
              {
                type: 'div',
                props: {
                  style: { color: '#ece2cb', fontSize: '32px', letterSpacing: '2px', marginBottom: '14px' },
                  children: `已报名 ${g.occupiedCount}/${g.maxSlots}${g.status === 'open' ? ' · 报名中' : ''}`,
                },
              },
              {
                type: 'div',
                props: {
                  style: { width: '640px', height: '16px', borderRadius: '999px', backgroundColor: 'rgba(201,163,92,0.25)', display: 'flex' },
                  children: {
                    type: 'div',
                    props: {
                      style: { width: `${barW}px`, height: '16px', borderRadius: '999px', backgroundColor: '#c9a35c' },
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(element, {
    width: 1200, height: 630,
    fonts: [
      { name: 'Noto Sans SC', data: font, weight: 700, style: 'normal' },
      { name: 'Ma Shan Zheng', data: brushFont, weight: 400, style: 'normal' },
    ],
  });
  const response = await svgToPngResponse(svg, url, 600);
  await cache.put(cacheKey, response.clone());
  return response;
  } finally { releaseRenderSlot(); }
}

async function handleGuildImage(request, url, slug) {
  // Check cache (1 hour)
  const cache = caches.default;
  const cacheKey = new Request(url.toString(), request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  // 'hub' 是主站导航的保留图位: 直接发预渲染通用品牌图 (不对应任何百业)
  if (slug === 'hub') return genericResponse(url);

  // 百业不存在 -> 404; 基础设施故障 -> throw, 由顶层兜底通用图
  const guild = await fetchGuildData(slug);
  if (!guild) return new Response('Guild not found', { status: 404 });

  const teamCount = await fetchTeamCount(slug);
  const guildName = guild.name || slug;
  // 头像在进渲染闸之前取 (网络等待不占渲染槽); 无头像/取失败 -> null,
  // 卡面与从前逐字节一致。
  const avatarDataUri = await fetchGuildAvatar(cache, slug);

  await acquireRenderSlot();
  try {
  // Get fonts
  const font = await getFont(cache);
  const brushFont = await getBrushFont(cache);
  // Brush font scales down for longer guild names so name + seal fit.
  const nameSize = guildName.length <= 4 ? 136 : guildName.length <= 5 ? 118 : guildName.length <= 6 ? 104 : guildName.length <= 8 ? 88 : 72;

  const guildChildren = [
    // Background gradient overlay (softened — dark paper, not a spotlight)
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(201,163,92,0.09) 0%, transparent 60%)',
        },
      },
    },
    // Top badge
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px',
          border: '2px solid #c9a35c',
          borderRadius: '999px',
          padding: '8px 28px',
        },
        children: {
          type: 'span',
          props: {
            style: { color: '#c9a35c', fontSize: '28px', letterSpacing: '4px' },
            children: '燕云十六声 · 国际服',
          },
        },
      },
    },
    // Guild name (brush calligraphy, like the site hero) + seal beside it
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'center',
          marginBottom: '20px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                color: '#ecd28f',
                fontSize: `${nameSize}px`,
                fontFamily: 'Ma Shan Zheng',
                letterSpacing: '4px',
                // 无 textShadow: 同 sealElement 注释 — 省 resvg 模糊 CPU。
              },
              children: guildName,
            },
          },
          {
            type: 'div',
            props: {
              style: { marginLeft: '22px', marginBottom: '12px', display: 'flex' },
              children: sealElement(88),
            },
          },
        ],
      },
    },
    // Team count
    {
      type: 'div',
      props: {
        style: {
          color: '#ece2cb',
          fontSize: '36px',
          letterSpacing: '2px',
        },
        children: teamCount > 0
          ? `本周 ${teamCount} 个车队招募中`
          : '百业集结 · 择一业而入',
      },
    },
  ];
  // Footer: the guild's own slogan if it has one, otherwise clean space.
  if (guild.slogan) {
    guildChildren.push({
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          bottom: '48px',
          color: '#c9a35c',
          fontSize: '26px',
          letterSpacing: '4px',
          opacity: 0.85,
        },
        children: guild.slogan,
      },
    });
  }

  // 百业自定义头像: 绘在徽章与百业名之间 (居中圆图 + 金边)。记住下标,
  // 带头像渲染万一失败时剔除它、按无头像版式重渲 (不直接掉通用图)。
  let avatarIdx = -1;
  if (avatarDataUri) {
    avatarIdx = 2;
    guildChildren.splice(2, 0, {
      type: 'img',
      props: {
        src: avatarDataUri,
        style: {
          width: '120px', height: '120px', borderRadius: '60px', objectFit: 'cover',
          border: '3px solid #c9a35c', marginBottom: '22px', backgroundColor: 'rgba(201,163,92,0.08)',
        },
      },
    });
  }

  // Satori element tree (React-like objects)
  const buildElement = () => ({
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0c0b09',
        position: 'relative',
        fontFamily: 'Noto Sans SC',
      },
      children: guildChildren,
    },
  });
  const SATORI_OPTS = {
    width: 1200, height: 630,
    fonts: [
      { name: 'Noto Sans SC', data: font, weight: 700, style: 'normal' },
      { name: 'Ma Shan Zheng', data: brushFont, weight: 400, style: 'normal' },
    ],
  };

  // Render with Satori (SVG output)
  let svg;
  try {
    svg = await satori(buildElement(), SATORI_OPTS);
  } catch (e) {
    if (avatarIdx < 0) throw e;
    guildChildren.splice(avatarIdx, 1);
    svg = await satori(buildElement(), SATORI_OPTS);
  }

  const response = await svgToPngResponse(svg, url, 3600);
  await cache.put(cacheKey, response.clone());
  return response;
  } finally { releaseRenderSlot(); }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      // Route: /og/:slug/car/:id.png
      const carMatch = path.match(/^\/og\/([^\/]+)\/car\/(\d+)\.png$/);
      if (carMatch) {
        return await handleCarImage(request, url, carMatch[1], carMatch[2]);
      }
      // Route: /og/:slug.png
      const match = path.match(/^\/og\/([^\/]+)\.png$/);
      if (!match) {
        return new Response('Not found. Use /og/:slug.png or /og/:slug/car/:id.png', { status: 404 });
      }
      return await handleGuildImage(request, url, match[1]);
    } catch (e) {
      // 图片路由永不 5xx: 任何渲染/数据/字体/WASM 故障一律降级为预渲染
      // 通用品牌图 (200 image/png), 只有明确判定「不存在」的 404 在
      // handler 内先行返回, 不经过这里。
      console.error('og render failed, serving generic fallback:', path, (e && e.message) || String(e));
      if (/^\/og\/.+\.png$/.test(path)) return genericResponse(url);
      return new Response('Not found', { status: 404 });
    }
  },

  // Cron 预热 (wrangler.toml triggers, 每 20 分钟): 把每个百业的 canonical
  // 百业图 URL 请求一遍。命中缓存 = 零渲染直接返回; 已过期 = 这次请求顺带
  // 重新渲染并回填缓存。目的: 微信爬虫来抓图时基本总是命中现成缓存 —
  // 纯静态读, 不吃渲染 CPU, 不受平台 exceededCpu 影响。预热失败无害:
  // 下个 tick 再试, 爬虫仍可按需渲染 (单发冷渲染实测稳定)。
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      try {
        const res = await fetch(`${SITE_API}/graphql`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: `{ ogGuildSlugs }` }),
        });
        if (!res.ok) return;
        const json = await res.json();
        for (const slug of json.data?.ogGuildSlugs || []) {
          try {
            await fetch(`https://yanyun-og.tbdlab.workers.dev/og/${encodeURIComponent(slug)}.png`);
          } catch { /* 单个百业预热失败不影响其他 */ }
        }
      } catch (e) {
        console.error('og warmer failed:', (e && e.message) || String(e));
      }
    })());
  },
};
