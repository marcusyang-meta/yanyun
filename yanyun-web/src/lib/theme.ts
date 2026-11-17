// Frontend mirror of the account UI theme preference (chrome variant).
// The truth lives on the server: users.theme_pref (account-level,
// 'classic' | 'glass', NULL = classic), delivered via GraphQL
// viewer.myThemePref / settingsPage.themePref and written through
// updateMyTheme. Unlike the locale preference there is no "automatic"
// state: the effective theme is always one of the two values, and
// 'classic' is the default for anonymous viewers and members without a
// stored choice alike.
//
// The theme reaches the page as a single attribute on the root element:
// data-theme="glass" swaps the --chrome-* CSS variables to the Liquid
// Glass values (packages/theme tokens.css, mirrored in index.css);
// classic is the absence of the attribute, so the :root classic values
// apply. Only control-layer chrome consumes those variables — content
// surfaces never read them, so a theme switch cannot move content.
//
// The localStorage mirror exists only to avoid a first-frame flash: an
// inline script in index.html (and applyMirroredTheme in main.tsx)
// applies the mirrored theme before the first paint, and AppRoot then
// reconciles the mirror against the server value, which always wins.
//
// One exception to "the server value always wins": the
// session-confirmed anchor below. A Relay query response carries no
// version — it publishes whatever the server held when the request was
// PROCESSED, whenever it happens to arrive. The locale-change refetch
// (lib/relay.ts) re-fetches every executed query network-only, and a
// slow AppViewerQuery from before a theme save can land after the
// save's mutation and republish the pre-save myThemePref, regressing
// the store for the rest of the session; reconciliation trusting the
// store then re-applies the old theme (and rewrites the mirror to
// match, so even the next boot starts from the regressed value). The
// anchor is the effective theme of the most recent updateMyTheme the
// server confirmed during this page load: once set, a store value
// that contradicts it is a stale snapshot, not the truth, and
// reconciliation keeps the anchor. The anchor is module state, so a
// fresh page load clears it and the stored server value rules again —
// a change made on another device lands on the next load, as before.
export type ThemePref = 'classic' | 'glass';

export const SUPPORTED_THEMES: readonly ThemePref[] = ['classic', 'glass'];

const PREF_KEY = 'yy_theme_pref';

// Any value that is not exactly 'glass' resolves to 'classic': stored
// values can be dirty (older builds, manual edits) and the shipped
// default must win over an unknown string, never the other way round.
export function resolveThemePref(value: unknown): ThemePref {
  return value === 'glass' ? 'glass' : 'classic';
}

export function isThemePref(value: unknown): value is ThemePref {
  return value === 'classic' || value === 'glass';
}

// Minimal storage / root seams so the mirror and dataset logic can be
// unit-tested in plain Node without a DOM; production callers omit them
// and get window.localStorage / document.documentElement.
export interface ThemeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export interface ThemeRoot {
  dataset: Record<string, string | undefined>;
}

function defaultStorage(): ThemeStorage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch { return null; }
}

function defaultRoot(): ThemeRoot | null {
  return typeof document !== 'undefined' ? (document.documentElement as unknown as ThemeRoot) : null;
}

export function readThemeMirror(storage: ThemeStorage | null = defaultStorage()): ThemePref | null {
  try {
    const v = storage?.getItem(PREF_KEY) ?? null;
    return isThemePref(v) ? v : null;
  } catch { return null; }
}

export function writeThemeMirror(theme: ThemePref, storage: ThemeStorage | null = defaultStorage()) {
  try {
    storage?.setItem(PREF_KEY, theme);
  } catch { /* if the write fails (e.g. private mode), ignore it — the server is still the truth */ }
}

// Apply a theme to the root element: 'glass' sets data-theme="glass";
// 'classic' removes the attribute entirely so the classic :root values
// (and no glass override) apply. Returns the effective theme applied.
export function applyTheme(value: unknown, root: ThemeRoot | null = defaultRoot()): ThemePref {
  const theme = resolveThemePref(value);
  if (root) {
    if (theme === 'glass') root.dataset.theme = 'glass';
    else delete root.dataset.theme;
  }
  return theme;
}

// First-frame entry: apply the mirrored theme (classic when no mirror
// exists, which also clears any stale attribute). Called from main.tsx
// before the app renders; index.html runs the same logic inline even
// earlier, before the stylesheet paints.
export function applyMirroredTheme(
  root: ThemeRoot | null = defaultRoot(),
  storage: ThemeStorage | null = defaultStorage(),
): ThemePref {
  return applyTheme(readThemeMirror(storage) ?? 'classic', root);
}

// Minimal structural seams over Relay's RecordSourceSelectorProxy /
// RecordProxy, so the store write-back below can be unit-tested with a
// fake store in plain Node; production passes the real proxies.
export interface ThemeStoreRecord {
  getLinkedRecord(field: string): ThemeStoreRecord | null | undefined;
  setValue(value: unknown, field: string): unknown;
}
export interface ThemeStore {
  getRoot(): ThemeStoreRecord;
}

// Store write-back for a committed updateMyTheme mutation (the Relay
// updater SettingsDialog passes alongside the mutation). The payload is
// the server's CONFIRMED effective theme; both read paths must move to
// it in the same store publish:
//   - Viewer.myThemePref — AppRoot's reconciliation source;
//   - SettingsPage.themePref — the settings dialog's own server value.
// Without this, their records keep the pre-mutation snapshot for the
// rest of the session (the mutation's payload is a different record
// type and normalizes nowhere near them): a dialog reopen is served
// the stale value store-or-network, and the next AppRoot
// reconciliation pass reimposes it over the member's pick — dataset
// and mirror included. That was the shipped defect: the server had
// persisted the pick all along, the client kept voting it down.
// A non-ok payload writes nothing (the pick rolls back instead).
// Returns the effective theme written, or null when nothing was.
export function writeThemeBackToStore(store: ThemeStore, data: unknown): ThemePref | null {
  const payload = (data as { updateMyTheme?: { ok?: unknown; themePref?: unknown } } | null | undefined)?.updateMyTheme;
  if (!payload || payload.ok !== true) return null;
  const theme = resolveThemePref(payload.themePref);
  const root = store.getRoot();
  const viewerRec = root.getLinkedRecord('viewer');
  if (viewerRec) viewerRec.setValue(theme, 'myThemePref');
  const pageRec = root.getLinkedRecord('settingsPage');
  if (pageRec) pageRec.setValue(theme, 'themePref');
  return theme;
}

// Session-confirmed anchor (see the file header): the effective theme
// of the most recent updateMyTheme the server confirmed in this page
// load, or null when this session has not saved a theme. Set only from
// the settings save's completion path — never from a query response,
// whose snapshot may predate the save it would contradict.
let sessionConfirmedTheme: ThemePref | null = null;

export function confirmThemePref(value: unknown): ThemePref {
  sessionConfirmedTheme = resolveThemePref(value);
  return sessionConfirmedTheme;
}

export function getSessionConfirmedTheme(): ThemePref | null {
  return sessionConfirmedTheme;
}

// Test seam (the storage / root seams above exist for the same
// reason): module state otherwise outlives a single test case.
export function clearSessionConfirmedTheme() {
  sessionConfirmedTheme = null;
}

// Reconciliation / settings-save entry: the server's effective theme is
// the truth, so apply it and align the local mirror to it in one step.
// While a session-confirmed anchor exists, an incoming value that
// contradicts it is a stale snapshot (a pre-save query response that
// landed late — see the file header): the anchor is applied instead,
// so a late publish can never talk the page out of a confirmed save.
export function syncThemeFromServer(
  value: unknown,
  root: ThemeRoot | null = defaultRoot(),
  storage: ThemeStorage | null = defaultStorage(),
): ThemePref {
  const incoming = resolveThemePref(value);
  const theme = sessionConfirmedTheme !== null && incoming !== sessionConfirmedTheme
    ? sessionConfirmedTheme
    : incoming;
  const applied = applyTheme(theme, root);
  writeThemeMirror(applied, storage);
  return applied;
}
