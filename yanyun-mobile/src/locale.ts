import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// UI locale preference pipeline (same semantics as Web src/lib/locale,
// ported to RN): the truth is server-side users.locale_pref (per account,
// null = follow device), supplied via GraphQL viewer.myLocalePref /
// settingsPage.localePref; the local mirror exists only so the first
// request already carries a near-correct x-locale. For signed-in requests
// the stored preference wins (over the header); after reconciliation the
// mirror aligns to the server.
const PREF_KEY = 'yy_locale_pref';
export const SUPPORTED_LOCALES = ['zh-CN', 'zh-TW', 'en', 'es', 'fr'];

let prefMirror: string | null = null;
let mirrorLoaded = false;

export function readPrefMirror(): string | null {
  return prefMirror;
}

export async function initLocaleMirror(): Promise<void> {
  if (mirrorLoaded) return;
  mirrorLoaded = true;
  try {
    let v: string | null = null;
    if (Platform.OS === 'web') {
      try { v = window.localStorage.getItem(PREF_KEY); } catch { v = null; }
    } else {
      v = await SecureStore.getItemAsync(PREF_KEY);
    }
    if (v && SUPPORTED_LOCALES.includes(v)) prefMirror = v;
  } catch { /* Unreadable: treat as auto */ }
}

export function writePrefMirror(v: string | null) {
  prefMirror = v && SUPPORTED_LOCALES.includes(v) ? v : null;
  void (async () => {
    try {
      if (Platform.OS === 'web') {
        try {
          if (prefMirror) window.localStorage.setItem(PREF_KEY, prefMirror);
          else window.localStorage.removeItem(PREF_KEY);
        } catch { /* Silent */ }
        return;
      }
      if (prefMirror) await SecureStore.setItemAsync(PREF_KEY, prefMirror);
      else await SecureStore.deleteItemAsync(PREF_KEY);
    } catch { /* Silent */ }
  })();
}

// Device language -> effective tag: same mapping as backend
// negotiateLocale (zh-TW distinct, en/es/fr direct, everything else
// falls back to zh-CN). The preference mirror takes priority.
export function effectiveLocaleTag(): string {
  if (prefMirror) return prefMirror;
  let tag = 'zh-CN';
  try {
    tag = Intl.DateTimeFormat().resolvedOptions().locale || 'zh-CN';
  } catch { /* Keep zh-CN */ }
  const lower = tag.toLowerCase();
  if (lower.startsWith('zh')) return /tw|hk|mo|hant/.test(lower) ? 'zh-TW' : 'zh-CN';
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('fr')) return 'fr';
  return 'zh-CN';
}

// Locale-switch event: fired after Profile saves successfully. relay.ts
// subscribes and imperatively refetches all registered queries with the
// new x-locale (new copy writes back into the same store records, so
// mounted components re-render via subscriptions); session subscribes
// and refetches the viewer to align account state.
const listeners = new Set<() => void>();
export function onLocaleChanged(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
export function emitLocaleChanged() { listeners.forEach((fn) => fn()); }
