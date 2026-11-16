import { describe, expect, it } from 'vitest';
import {
  blurIntensityFor,
  chromeFor,
  chromeVariants,
  effectiveThemeVariant,
  isGlassChrome,
  resolveThemeVariant,
  type ChromeTokens,
} from './theme';

// The chrome variant pipeline: the account value (Viewer.myThemePref /
// SettingsPage.themePref / updateMyTheme payload) resolves through
// resolveThemeVariant, the system Reduce Transparency setting falls
// back through effectiveThemeVariant / chromeFor, and expo-blur's
// intensity derives from the token blur radius. Classic must keep the
// shipped chrome values byte-for-byte — it is the default theme, not
// a restyle.

describe('resolveThemeVariant', () => {
  it('accepts glass, everything else resolves to classic', () => {
    expect(resolveThemeVariant('glass')).toBe('glass');
    expect(resolveThemeVariant('classic')).toBe('classic');
    expect(resolveThemeVariant(null)).toBe('classic');
    expect(resolveThemeVariant(undefined)).toBe('classic');
    expect(resolveThemeVariant('')).toBe('classic');
    expect(resolveThemeVariant('GLASS')).toBe('classic');
    expect(resolveThemeVariant('dirty-stored-value')).toBe('classic');
    expect(resolveThemeVariant(42)).toBe('classic');
  });
});

describe('effectiveThemeVariant / chromeFor', () => {
  it('passes the chosen variant through when transparency is allowed', () => {
    expect(effectiveThemeVariant('glass', false)).toBe('glass');
    expect(effectiveThemeVariant('classic', false)).toBe('classic');
    expect(chromeFor('glass', false)).toBe(chromeVariants.glass);
    expect(chromeFor('classic', false)).toBe(chromeVariants.classic);
    expect(chromeFor('glass')).toBe(chromeVariants.glass);
  });

  it('falls back to opaque classic chrome under Reduce Transparency', () => {
    expect(effectiveThemeVariant('glass', true)).toBe('classic');
    expect(effectiveThemeVariant('classic', true)).toBe('classic');
    const chrome = chromeFor('glass', true);
    expect(chrome).toBe(chromeVariants.classic);
    // The fallback is fully opaque: no blur, solid sheet fill.
    expect(chrome.blur).toBe(0);
    expect(chrome.sheetFill).toBe('#14120e');
    expect(isGlassChrome(chrome)).toBe(false);
  });
});

describe('chrome token values', () => {
  it('classic carries the shipped chrome values unchanged', () => {
    const classic = chromeFor('classic');
    expect(classic.barFill).toBe('rgba(12,11,9,.94)');
    expect(classic.tabsFill).toBe('rgba(201,163,92,.06)');
    expect(classic.sheetFill).toBe('#14120e');
    expect(classic.border).toBe('rgba(201,163,92,.22)');
    expect(classic.sheetBorder).toBe('rgba(201,163,92,.4)');
    expect(classic.highlight).toBe('rgba(0,0,0,0)');
    expect(classic.blur).toBe(0);
    expect(classic.radius).toBe(12);
  });

  it('glass is translucent with a dark border, gold highlight and large radius', () => {
    const glass = chromeFor('glass');
    expect(glass.barFill).toBe('rgba(18,15,11,.55)');
    expect(glass.tabsFill).toBe('rgba(18,15,11,.45)');
    expect(glass.sheetFill).toBe('rgba(20,17,12,.68)');
    expect(glass.border).toBe('rgba(0,0,0,.55)');
    expect(glass.sheetBorder).toBe('rgba(0,0,0,.6)');
    expect(glass.highlight).toBe('rgba(236,210,143,.35)');
    expect(glass.blur).toBe(20);
    expect(glass.radius).toBe(22);
  });
});

describe('blurIntensityFor / isGlassChrome', () => {
  it('classic has no blur; glass maps the 20px radius onto the 1..100 scale', () => {
    expect(blurIntensityFor(chromeFor('classic'))).toBe(0);
    expect(isGlassChrome(chromeFor('classic'))).toBe(false);
    expect(blurIntensityFor(chromeFor('glass'))).toBe(60);
    expect(isGlassChrome(chromeFor('glass'))).toBe(true);
  });

  it('caps the intensity at 100 for oversized radii', () => {
    const oversized = { ...chromeVariants.glass, blur: 80 } as unknown as ChromeTokens;
    expect(blurIntensityFor(oversized)).toBe(100);
  });
});
