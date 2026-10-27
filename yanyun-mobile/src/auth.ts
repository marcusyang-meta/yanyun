import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { API_URL, APP_AUTH_REDIRECT } from './config';
import { setToken } from './storage';

// Web auth-session return cleanup (not needed on native; calling it is a no-op)
WebBrowser.maybeCompleteAuthSession();

export function extractToken(url: string): string | null {
  const { queryParams } = Linking.parse(url);
  const t = queryParams?.token;
  return typeof t === 'string' && t ? t : null;
}

// Opens the backend login entry in the system secure browser (iOS
// ASWebAuthenticationSession / Android Custom Tab) with the app handoff
// params; on success the backend 302-redirects to
// yanyun://auth-callback?token=<JWT>, and this function stores the token.
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

// Fresh re-authentication for sensitive self-service actions (account
// export / deletion): the same Discord round trip as login — the
// backend stamps users.fresh_auth_at at the OAuth callback, and that
// stamp is what the account mutations gate on. The fresh session token
// replaces the stored one, exactly like a normal login. Resolves true
// when the round trip completed with a token.
export async function reauthWithDiscord(): Promise<boolean> {
  try {
    await loginWithDiscord();
    return true;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  await setToken(null);
  // Server sessions are stateless JWTs: clearing locally is sign-out (same
  // as Web; the server does not revoke separately before expiry, and Web
  // sign-out only clears the cookie).
  try { await fetch(`${API_URL}/auth/logout`, { method: 'POST' }); } catch { /* Don't block sign-out */ }
}
