// bogus 注入代理: 转发到本地后端, 对含 groupingDetailPage.blocks 的
// GraphQL 响应追加两个节点 —— 一个客户端词表里不存在的类型
// (BogusBlock, 无任何 @module 臂可命中) 与一个 FallbackBlock 节点
// (带完整的 Node1 层 js 引用, 与服务端真实替代下发的形状一致)。
// 用法: node proxy-mutate.mjs [port=8788] [target=8787]
import http from 'node:http';

const PORT = Number(process.argv[2] || 8788);
const TARGET = Number(process.argv[3] || 8787);
let mutated = 0;

const server = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    const fwdHeaders = { ...req.headers, host: `127.0.0.1:${TARGET}` };
    delete fwdHeaders['accept-encoding']; // 强制 identity, 否则上游 gzip 后 JSON 解析不了
    const fwd = http.request(
      { host: '127.0.0.1', port: TARGET, path: req.url, method: req.method, headers: fwdHeaders },
      (up) => {
        const uchunks = [];
        up.on('data', (c) => uchunks.push(c));
        up.on('end', () => {
          let ubody = Buffer.concat(uchunks);
          const ctype = String(up.headers['content-type'] || '');
          if (ctype.includes('application/json')) {
            try {
              const parsed = JSON.parse(ubody.toString('utf8'));
              const blocks = parsed?.data?.groupingDetailPage?.blocks;
              if (Array.isArray(blocks)) {
                blocks.push({ __typename: 'BogusBlock', __isBlock: 'BogusBlock' });
                blocks.push({
                  __typename: 'FallbackBlock', __isBlock: 'FallbackBlock', text: '该内容需要更新 App 后显示',
                  __module_operation_fragments_BlockNode1Match: 'fragments_FallbackBlock$normalization.graphql',
                  __module_component_fragments_BlockNode1Match: 'FallbackBlock',
                });
                ubody = Buffer.from(JSON.stringify(parsed), 'utf8');
                mutated++;
                console.log(`[proxy] mutated detail response #${mutated} (blocks=${blocks.length})`);
              }
            } catch { /* 非 JSON 响应原样透传 */ }
          }
          const headers = { ...up.headers };
          delete headers['content-length'];
          delete headers['transfer-encoding'];
          res.writeHead(up.statusCode || 200, headers);
          res.end(ubody);
        });
      },
    );
    fwd.on('error', (e) => { res.writeHead(502); res.end('proxy error: ' + e.message); });
    fwd.end(body);
  });
});
server.listen(PORT, '127.0.0.1', () => console.log(`proxy-mutate on ${PORT} -> ${TARGET}`));
