// Central visual theme -- the token single source moved to @yanyun/theme
// (packages/theme, data source tokens.json, same values as Web
// index.css :root). This file only maps tokens into the app's usual
// shapes (theme/fonts/space/radius); consumers are unaffected. Fonts are
// registered via useFonts in _layout: MaShanZheng (calligraphy display)
// and NotoSerifSC (serif body, weights 400/600/700/900 in one family,
// picked via fontWeight).
import { colors, fonts as tokenFonts, gradients, radius, space } from '@yanyun/theme';

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

// The official 11 sects (game vocabulary; same list as SECTS in Web format.ts; used as signup weapons)
// Note: this is domain vocabulary, not a design token, so it stays out of @yanyun/theme; extraction candidate: see repo-root README (packages/domain).
export const SECTS = [
  '鸣金·虹', '鸣金·影', '牵丝·玉', '牵丝·霖', '牵丝·翊',
  '裂石·威', '裂石·钧', '破竹·樽', '破竹·鸢', '破竹·尘', '破竹·风',
];
export const HEALER_SECT = '牵丝·霖';
