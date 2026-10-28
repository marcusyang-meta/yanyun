// Node loader: 把 worker.js 的资产导入 (./generic.png / ./generic.svg /
// ./resvg.wasm) 重定向到读真实文件的 stub 模块, 让 OG worker 能在
// 本地 Node 里原样跑 (资产字节与生产一致, 渲染管线全真)。
export async function resolve(specifier, context, next) {
  if (specifier.endsWith('.png') || specifier.endsWith('.svg') || specifier.endsWith('.wasm')) {
    const kind = specifier.endsWith('.png') ? 'png' : specifier.endsWith('.svg') ? 'svg' : 'wasm';
    return { url: new URL(`./stub-${kind}.mjs`, import.meta.url).href, shortCircuit: true };
  }
  return next(specifier, context);
}
