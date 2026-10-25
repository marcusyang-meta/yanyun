// 中央视觉主题 —— 令牌单一来源已迁入 @yanyun/theme (packages/theme,
// 数据源 tokens.json, 与 Web index.css 的 :root 同值)。本文件只把令牌
// 映射成 App 惯用形状 (theme/fonts/space/radius), 消费方无感。
// 字体经 _layout 的 useFonts 注册: MaShanZheng (书法展示) 与
// NotoSerifSC (正文衬线, 同族多权重 400/600/700/900, 用 fontWeight 选面)。
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
  // 渐变 (RN 无 CSS gradient, 由 expo-linear-gradient 消费)
  goldGradient: gradients.gold,
  cardGradient: gradients.card,
  tabGradient: gradients.tab,
  tabsBg: colors.tabsBg,
  chipBorder: colors.chipBorder,
  loginCardFill: colors.loginCardFill,
};

export { space, radius };

// 官方 11 流派（游戏词汇，与网站 format.ts 的 SECTS 同一份名单；报名 weapon 用）
// 注: 这是领域词汇不是设计令牌, 不进 @yanyun/theme; 抽取候选见仓根 README (packages/domain)。
export const SECTS = [
  '鸣金·虹', '鸣金·影', '牵丝·玉', '牵丝·霖', '牵丝·翊',
  '裂石·威', '裂石·钧', '破竹·樽', '破竹·鸢', '破竹·尘', '破竹·风',
];
export const HEALER_SECT = '牵丝·霖';
