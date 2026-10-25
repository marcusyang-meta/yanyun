import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// 会话 JWT 的存放：原生走 SecureStore（钥匙串/Keystore），Web 走 localStorage。
const KEY = 'yy_session_token';

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return window.localStorage.getItem(KEY); } catch { return null; }
  }
  try { return await SecureStore.getItemAsync(KEY); } catch { return null; }
}

export async function setToken(token: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (token) window.localStorage.setItem(KEY, token);
      else window.localStorage.removeItem(KEY);
    } catch { /* 隐私模式等场景静默 */ }
    return;
  }
  try {
    if (token) await SecureStore.setItemAsync(KEY, token);
    else await SecureStore.deleteItemAsync(KEY);
  } catch { /* 同上 */ }
}
