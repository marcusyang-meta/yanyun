import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Session JWT storage: SecureStore (keychain/Keystore) on native, localStorage on Web.
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
    } catch { /* Silent (e.g. private browsing) */ }
    return;
  }
  try {
    if (token) await SecureStore.setItemAsync(KEY, token);
    else await SecureStore.deleteItemAsync(KEY);
  } catch { }
}
