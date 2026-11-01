// Frontend mirror of the UI language preference and the effective-language
// pipeline. The truth lives on the server: users.locale_pref (account-level,
// null = follow the browser), delivered via GraphQL viewer.myLocalePref /
// settingsPage.localePref. The localStorage mirror exists only so first-screen
// requests (before login / reconciliation) carry a best-effort x-locale; for
// logged-in requests the server's stored preference wins over the header, and
// after reconciliation the mirror aligns to the server.
const PREF_KEY = 'yy_locale_pref';
export const SUPPORTED_LOCALES = ['zh-CN', 'en', 'es', 'fr', 'zh-TW'];

export function readPrefMirror(): string | null {
  try {
    const v = window.localStorage.getItem(PREF_KEY);
    return v && SUPPORTED_LOCALES.includes(v) ? v : null;
  } catch { return null; }
}

export function writePrefMirror(v: string | null) {
  try {
    if (v) window.localStorage.setItem(PREF_KEY, v);
    else window.localStorage.removeItem(PREF_KEY);
  } catch { /* if the write fails (e.g. private mode), ignore it — the server is still the truth */ }
}

// The raw language tag most recently sent by the request layer (e.g. 'en-US'
// or a preference id). AppRoot reconciles against it: if the server's
// effectiveLocale differs from the canonical form negotiated from this tag,
// the UI language must switch, triggering a whole-tree refetch.
let lastSentTag = '';
export function lastSentLocaleTag() { return lastSentTag; }

export function effectiveLocaleTag(): string {
  const tag = readPrefMirror() ?? (typeof navigator !== 'undefined' ? navigator.language : 'zh-CN');
  lastSentTag = tag;
  return tag;
}

// The browser's IANA timezone, sent as x-tz on every GraphQL request
// (the same header the mobile client sends). The backend renders time
// copy in it and captures it as the home timezone of any grouping
// this client creates or re-times. Undefined when the runtime cannot
// name its zone — the header is then simply omitted.
export function clientTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch { return undefined; }
}

// Locale-changed event: emitted after a settings save or a reconciliation
// mismatch. relay.ts subscribes and refetches all executed queries with the
// new x-locale (chromeText drops its cache), so the UI switches language in
// place without a manual reload.
const listeners = new Set<() => void>();
export function onLocaleChanged(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
export function emitLocaleChanged() { listeners.forEach((fn) => fn()); }
