import { describe, expect, it, vi } from 'vitest';
import {
  applyMirroredTheme,
  applyTheme,
  clearSessionConfirmedTheme,
  confirmThemePref,
  getSessionConfirmedTheme,
  readThemeMirror,
  resolveThemePref,
  syncThemeFromServer,
  writeThemeMirror,
  type ThemeRoot,
  type ThemeStorage,
} from './theme';

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  const storage: ThemeStorage = {
    getItem: vi.fn((key: string) => map.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { map.set(key, value); }),
    removeItem: vi.fn((key: string) => { map.delete(key); }),
  };
  return { storage, map };
}

function fakeRoot(): ThemeRoot {
  return { dataset: {} };
}

describe('resolveThemePref', () => {
  it('keeps glass, resolves everything else to classic', () => {
    expect(resolveThemePref('glass')).toBe('glass');
    expect(resolveThemePref('classic')).toBe('classic');
    expect(resolveThemePref(null)).toBe('classic');
    expect(resolveThemePref(undefined)).toBe('classic');
    expect(resolveThemePref('')).toBe('classic');
    expect(resolveThemePref('GLASS')).toBe('classic');
    expect(resolveThemePref('neon')).toBe('classic');
    expect(resolveThemePref(42)).toBe('classic');
  });
});

describe('theme mirror', () => {
  it('reads back a stored valid theme', () => {
    const { storage } = fakeStorage({ yy_theme_pref: 'glass' });
    expect(readThemeMirror(storage)).toBe('glass');
    const classic = fakeStorage({ yy_theme_pref: 'classic' });
    expect(readThemeMirror(classic.storage)).toBe('classic');
  });

  it('treats a missing or dirty mirror value as no mirror', () => {
    expect(readThemeMirror(fakeStorage().storage)).toBeNull();
    expect(readThemeMirror(fakeStorage({ yy_theme_pref: 'neon' }).storage)).toBeNull();
  });

  it('survives a throwing storage (private mode) as no mirror', () => {
    const throwing: ThemeStorage = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    };
    expect(readThemeMirror(throwing)).toBeNull();
    expect(() => writeThemeMirror('glass', throwing)).not.toThrow();
  });

  it('writes the theme under the mirror key', () => {
    const { storage, map } = fakeStorage();
    writeThemeMirror('glass', storage);
    expect(map.get('yy_theme_pref')).toBe('glass');
    writeThemeMirror('classic', storage);
    expect(map.get('yy_theme_pref')).toBe('classic');
  });
});

describe('applyTheme', () => {
  it('sets data-theme="glass" for glass', () => {
    const root = fakeRoot();
    expect(applyTheme('glass', root)).toBe('glass');
    expect(root.dataset.theme).toBe('glass');
  });

  it('removes the attribute for classic, clearing a stale glass value', () => {
    const root = fakeRoot();
    root.dataset.theme = 'glass';
    expect(applyTheme('classic', root)).toBe('classic');
    expect('theme' in root.dataset).toBe(false);
    expect(root.dataset.theme).toBeUndefined();
  });

  it('resolves dirty values to classic before applying', () => {
    const root = fakeRoot();
    root.dataset.theme = 'glass';
    expect(applyTheme('neon', root)).toBe('classic');
    expect(root.dataset.theme).toBeUndefined();
  });

  it('is a no-op without a root but still resolves the theme', () => {
    expect(applyTheme('glass', null)).toBe('glass');
    expect(applyTheme(null, null)).toBe('classic');
  });
});

describe('applyMirroredTheme (first frame)', () => {
  it('applies the mirrored glass theme before reconciliation', () => {
    const root = fakeRoot();
    const { storage } = fakeStorage({ yy_theme_pref: 'glass' });
    expect(applyMirroredTheme(root, storage)).toBe('glass');
    expect(root.dataset.theme).toBe('glass');
  });

  it('defaults to classic and clears a stale attribute when no mirror exists', () => {
    const root = fakeRoot();
    root.dataset.theme = 'glass';
    const { storage } = fakeStorage();
    expect(applyMirroredTheme(root, storage)).toBe('classic');
    expect(root.dataset.theme).toBeUndefined();
  });
});

describe('syncThemeFromServer (reconciliation)', () => {
  it('applies the server theme and aligns the mirror to it', () => {
    const root = fakeRoot();
    const { storage, map } = fakeStorage({ yy_theme_pref: 'classic' });
    expect(syncThemeFromServer('glass', root, storage)).toBe('glass');
    expect(root.dataset.theme).toBe('glass');
    expect(map.get('yy_theme_pref')).toBe('glass');
  });

  it('a dirty or unset server value lands on classic everywhere', () => {
    const root = fakeRoot();
    root.dataset.theme = 'glass';
    const { storage, map } = fakeStorage({ yy_theme_pref: 'glass' });
    expect(syncThemeFromServer(null, root, storage)).toBe('classic');
    expect(root.dataset.theme).toBeUndefined();
    expect(map.get('yy_theme_pref')).toBe('classic');
  });
});

describe('session-confirmed anchor (stale-response guard)', () => {
  it('a store value contradicting the confirmed save is ignored as stale', () => {
    clearSessionConfirmedTheme();
    confirmThemePref('glass');
    const root = fakeRoot();
    const { storage, map } = fakeStorage({ yy_theme_pref: 'glass' });
    // The late pre-save snapshot: the store regressed to classic, the
    // server (and the confirmed save) hold glass.
    expect(syncThemeFromServer('classic', root, storage)).toBe('glass');
    expect(root.dataset.theme).toBe('glass');
    expect(map.get('yy_theme_pref')).toBe('glass');
    clearSessionConfirmedTheme();
  });

  it('the guard is symmetric: a stale glass snapshot cannot undo a confirmed classic save', () => {
    clearSessionConfirmedTheme();
    confirmThemePref('classic');
    const root = fakeRoot();
    root.dataset.theme = 'glass';
    const { storage, map } = fakeStorage({ yy_theme_pref: 'glass' });
    expect(syncThemeFromServer('glass', root, storage)).toBe('classic');
    expect(root.dataset.theme).toBeUndefined();
    expect(map.get('yy_theme_pref')).toBe('classic');
    clearSessionConfirmedTheme();
  });

  it('a value matching the anchor passes through, and a newer save supersedes the anchor', () => {
    clearSessionConfirmedTheme();
    confirmThemePref('glass');
    expect(getSessionConfirmedTheme()).toBe('glass');
    const root = fakeRoot();
    const { storage } = fakeStorage();
    expect(syncThemeFromServer('glass', root, storage)).toBe('glass');
    confirmThemePref('classic');
    expect(getSessionConfirmedTheme()).toBe('classic');
    expect(syncThemeFromServer('classic', root, storage)).toBe('classic');
    expect(root.dataset.theme).toBeUndefined();
    clearSessionConfirmedTheme();
  });

  it('clearing the anchor restores plain server-truth reconciliation', () => {
    confirmThemePref('glass');
    clearSessionConfirmedTheme();
    expect(getSessionConfirmedTheme()).toBeNull();
    const root = fakeRoot();
    root.dataset.theme = 'glass';
    const { storage, map } = fakeStorage({ yy_theme_pref: 'glass' });
    expect(syncThemeFromServer('classic', root, storage)).toBe('classic');
    expect(root.dataset.theme).toBeUndefined();
    expect(map.get('yy_theme_pref')).toBe('classic');
  });

  it('confirming resolves dirty values before anchoring', () => {
    clearSessionConfirmedTheme();
    expect(confirmThemePref('neon')).toBe('classic');
    expect(getSessionConfirmedTheme()).toBe('classic');
    clearSessionConfirmedTheme();
  });
});
