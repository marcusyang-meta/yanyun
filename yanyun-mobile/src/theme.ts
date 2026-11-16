// Central visual theme -- the token single source moved to @yanyun/theme
// (packages/theme, data source tokens.json, same values as Web
// index.css :root). This file only maps tokens into the app's usual
// shapes (theme/fonts/space/radius); consumers are unaffected. Fonts are
// registered via useFonts in _layout: MaShanZheng (calligraphy display)
// and NotoSerifSC (serif body, weights 400/600/700/900 in one family,
// picked via fontWeight).
import { chrome as chromeTokens, colors, fonts as tokenFonts, gradients, radius, space } from '@yanyun/theme';

export const fonts = {
  brush: tokenFonts.brushFamily,
  serif: tokenFonts.serifFamily,
} as const;

export const theme = {
  bg: colors.ink,
  ink2: colors.ink2,
  cardBg: colors.ink2,
  paper: colors.paper,
  gold: colors.gold,
  goldHi: colors.goldHi,
  goldLight: colors.goldLight,
  goldDeep: colors.goldDeep,
  onGold: colors.onGold,
  muted: colors.muted,
  seal: colors.seal,
  danger: colors.danger,
  border: colors.border,
  cardBorder: colors.border,
  inputBg: colors.inputBg,
  inputFill: colors.inputFill,
  // Gradients (RN has no CSS gradients; consumed by expo-linear-gradient)
  goldGradient: gradients.gold,
  cardGradient: gradients.card,
  tabGradient: gradients.tab,
  tabsBg: colors.tabsBg,
  chipBorder: colors.chipBorder,
  loginCardFill: colors.loginCardFill,
};

export { space, radius };

// User-selectable chrome theme (marcus ruling 2026-11-16: the iOS 27
// glass look is an optional theme, never a replacement; classic is the
// default). Only control-layer chrome (bars / tab rows / sheets) reads
// the variant; content surfaces keep the shared tokens above in both
// variants. The account preference arrives as Viewer.myThemePref /
// SettingsPage.themePref ('classic' | 'glass'); anything else — unset,
// anonymous, or a dirty stored value — resolves to classic, mirroring
// the backend's resolveThemePref.
export type ThemeVariant = 'classic' | 'glass';
export type ChromeTokens = (typeof chromeTokens)[ThemeVariant];
export const chromeVariants = chromeTokens;

export function resolveThemeVariant(value: unknown): ThemeVariant {
  return value === 'glass' ? 'glass' : 'classic';
}

// Reduce Transparency (system accessibility setting): glass chrome
// falls back to the opaque classic chrome, same intent as the Web
// tokens' prefers-reduced-transparency fallback.
export function effectiveThemeVariant(variant: ThemeVariant, reduceTransparency: boolean): ThemeVariant {
  return reduceTransparency ? 'classic' : variant;
}

export function chromeFor(variant: ThemeVariant, reduceTransparency = false): ChromeTokens {
  return chromeTokens[effectiveThemeVariant(variant, reduceTransparency)];
}

// The token blur is a CSS-style blur radius (glass: 20); expo-blur's
// intensity is a 1..100 scale, so the radius maps linearly (x3, capped)
// onto it: glass 20 -> 60. Classic carries blur 0 -> no BlurView at all.
export function blurIntensityFor(chrome: ChromeTokens): number {
  if (!chrome.blur) return 0;
  return Math.min(100, Math.max(1, chrome.blur * 3));
}

export function isGlassChrome(chrome: ChromeTokens): boolean {
  return blurIntensityFor(chrome) > 0;
}

// The official 11 sects (game vocabulary; same list as SECTS in Web format.ts; used as signup weapons)
// Note: this is domain vocabulary, not a design token, so it stays out of @yanyun/theme; extraction candidate: see repo-root README (packages/domain).
export const SECTS = [
  '鸣金·虹', '鸣金·影', '牵丝·玉', '牵丝·霖', '牵丝·翊',
  '裂石·威', '裂石·钧', '破竹·樽', '破竹·鸢', '破竹·尘', '破竹·风',
];
export const HEALER_SECT = '牵丝·霖';
