// 夹具用户 2001 的本地会话 JWT (SESSION_SECRET 只读本地 .dev.vars, 不落盘记录)
import fs from 'node:fs';
const dev = fs.readFileSync('/home/hatch/workspace/yanyun-signup/.dev.vars', 'utf8');
const secret = (dev.match(/SESSION_SECRET\s*=\s*"?([^"\n]+)"?/) || [])[1];
if (!secret) { console.error('no SESSION_SECRET'); process.exit(1); }
const { signJwt } = await import('/home/hatch/workspace/yanyun-signup/src/auth.js');
const jwt = await signJwt(secret, { sub: '2001', name: '车头甲', avatar: '', guilds: ['424242424242424242'] });
fs.writeFileSync('/tmp/jwt-a.txt', jwt);
console.log('minted len', jwt.length);
