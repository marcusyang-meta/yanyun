import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { API_URL, APP_AUTH_REDIRECT } from './config';
import { setToken } from './storage';

// Web 端 auth session 的回跳收尾（原生无此需求，调用无副作用）
WebBrowser.maybeCompleteAuthSession();

export function extractToken(url: string): string | null {
  const { queryParams } = Linking.parse(url);
  const t = queryParams?.token;
  return typeof t === 'string' && t ? t : null;
}

// 用系统安全浏览器（iOS ASWebAuthenticationSession / Android Custom Tab）
// 打开后端登录入口并带上 app 交接参数；后端回调成功后 302 跳回
// yanyun://auth-callback?token=<JWT>，本函数取下令牌存好即完成登录。
export async function loginWithDiscord(): Promise<void> {
  const loginUrl = `${API_URL}/auth/discord/login?app=${encodeURIComponent(APP_AUTH_REDIRECT)}`;
  const result = await WebBrowser.openAuthSessionAsync(loginUrl, APP_AUTH_REDIRECT);
  if (result.type === 'success' && result.url) {
    const token = extractToken(result.url);
    if (token) {
      await setToken(token);
      return;
    }
    throw new Error('登录回调没有带回令牌，请重试');
  }
  throw new Error('已取消登录');
}

export async function logout(): Promise<void> {
  await setToken(null);
  // 服务端会话是无状态 JWT：本地清掉即退出（与网站同口径，令牌到期前
  // 服务端不单独吊销；网站退出也只是清 cookie）。
  try { await fetch(`${API_URL}/auth/logout`, { method: 'POST' }); } catch { /* 不阻塞退出 */ }
}
