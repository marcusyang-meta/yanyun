// 本地验收用 Discord API 打桩: 只实现 auth.js 实际调用的端点。
// 后端以 DISCORD_API_BASE=http://127.0.0.1:8898 启动时, OAuth 换令牌 /
// @me / @me/guilds / member 昵称都打到这里。夹具用户 111222333 (与本地
// D1 夹具行一致), 其 Discord 服务器列表含 mobiletest 绑定的 555666777。
import http from 'node:http';

const ME = { id: '111222333', username: 'fixturehero', global_name: '夹具侠客', avatar: null };
const GUILDS = [{ id: '555666777', name: '移动验收服务器', icon: null, owner: false, permissions: '0' }];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://stub');
  const json = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
  if (req.method === 'POST' && url.pathname === '/api/oauth2/token') {
    return json(200, {
      access_token: 'stub-access-token',
      token_type: 'Bearer',
      expires_in: 604800,
      refresh_token: 'stub-refresh-token',
      scope: 'identify guilds guilds.members.read',
    });
  }
  if (req.method === 'GET' && url.pathname === '/api/v10/users/@me') return json(200, ME);
  if (req.method === 'GET' && url.pathname === '/api/v10/users/@me/guilds') return json(200, GUILDS);
  const member = url.pathname.match(/^\/api\/v10\/users\/@me\/guilds\/(\d+)\/member$/);
  if (req.method === 'GET' && member) {
    return json(200, { user: ME, nick: '夹具侠客', roles: [], joined_at: '2026-01-01T00:00:00.000Z' });
  }
  return json(404, { message: 'stub: not found', path: url.pathname });
});

server.listen(8898, '127.0.0.1', () => console.log('mock-discord on http://127.0.0.1:8898'));
