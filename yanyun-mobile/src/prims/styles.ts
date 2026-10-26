// ============================================================
// 原语面结构样式令牌注册表 (冻结, v1) — C 路线 (STUDY §4.3)。
//
// 服务端原语树只引用令牌名 (节点 s 字段), 具体数值只存在于这张表
// 里 (与 @yanyun/theme 基础令牌)。本表在「最后一次客户端更新」时
// 一次收编全部展示面在用的样式: 功能块 blockStyles 全集 + dex /
// 流派图鉴两屏的 StyleSheet 全集 (dexXxx / sectXxx 前缀) + 通用
// 组合 + 图片/标签页令牌。此后服务端新拼树的样式自由度 = 本表,
// 新增令牌 = 客户端发版事件, 与新词汇同级评审。
//
// chip 令牌是 {box, text} 对 (外框 + 文字样式分开); 容器令牌可带
// 渐变填充 (FILLS): card 系列走 CardFill、btnPrimary 走 GoldFill,
// 填充实现属于令牌的一部分, 服务端只提令牌名。
// ============================================================
import { StyleSheet } from 'react-native';
import { theme, fonts, space, radius } from '../theme';
import { blockStyles } from '../blocks/modules/styles';

// 间距刻度 (sp 节点与 col/row gap 的 s/gap 取值)。
export const spaceScale: Record<string, number> = {
  xs: space.xs, sm: space.sm, md: space.md, lg: space.lg, xl: space.xl,
};

// dex / 流派两屏收编 (第二批服务端化时直接引用; 数值与两屏现行
// StyleSheet 逐项一致)。
const dexStyles = StyleSheet.create({
  dexBack: { fontFamily: fonts.serif, color: theme.gold, fontSize: 15, marginBottom: 12 },
  dexH2: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 24, letterSpacing: 2, marginBottom: 4 },
  dexMeta: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, marginBottom: 16 },
  dexSecHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 20, marginBottom: 12 },
  dexSecTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 16, letterSpacing: 2 },
  dexSecSub: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11 },
  dexSecRule: { flex: 1, height: 1, backgroundColor: 'rgba(201,163,92,.25)' },
  dexRow: {
    position: 'relative', overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 10,
    backgroundColor: theme.ink2, paddingVertical: 14, paddingHorizontal: 16,
  },
  dexRowName: { flex: 1, fontFamily: fonts.serif, color: theme.paper, fontSize: 15 },
  dexRowNameLeft: { fontFamily: fonts.serif, color: theme.paper, fontSize: 15 },
  dexTag: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 4, paddingVertical: 1, paddingHorizontal: 6, marginTop: 4 },
  dexTagText: { fontFamily: fonts.serif, fontSize: 11 },
  dexLabel: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginTop: 4 },
  dexBossCount: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 14 },
  dexBossUnit: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11 },
  dexChev: { fontFamily: fonts.serif, color: theme.gold, fontSize: 18 },
  dexEmpty: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14, textAlign: 'center', padding: 32 },
  dexEmptySmall: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14, textAlign: 'center', padding: 24 },
  dexTabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  dexTabBtn: { borderWidth: 1, borderColor: theme.gold, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24 },
  dexTabBtnOn: { backgroundColor: theme.gold },
  dexTabText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14 },
  dexTabTextOn: { color: theme.onGold, fontWeight: '600' },
  dexCard: {
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 10,
    backgroundColor: theme.ink2, padding: 16,
  },
  dexCardTitle: { fontFamily: fonts.serif, color: theme.gold, fontSize: 15, fontWeight: '600', marginBottom: 8 },
  dexMechDesc: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14, lineHeight: 24 },
  dexTalentDesc: { fontFamily: fonts.serif, color: theme.paper, fontSize: 13, lineHeight: 22 },
  dexShoutRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8,
    backgroundColor: 'rgba(201,163,92,.08)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12,
  },
  dexShoutText: { flex: 1, fontFamily: fonts.serif, color: theme.paper, fontSize: 13 },
  dexCopyBtn: { backgroundColor: theme.gold, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 12 },
  dexCopyBtnText: { fontFamily: fonts.serif, color: theme.onGold, fontSize: 12 },
  dexTalentGrid: { flexDirection: 'row', gap: 12 },
  dexTalentCol: { flex: 1, gap: 12 },
  dexToast: {
    position: 'absolute', alignSelf: 'center', maxWidth: '86%',
    backgroundColor: 'rgba(20,18,14,.96)', borderWidth: 1, borderColor: 'rgba(201,163,92,.45)',
    borderRadius: 999, paddingVertical: 9, paddingHorizontal: 18,
  },
  dexToastText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13, textAlign: 'center' },
});

const sectStyles = StyleSheet.create({
  sectEmpty: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14, textAlign: 'center', padding: 32 },
  sectEmptySmall: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14, textAlign: 'center', padding: 24 },
  sectSecHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 20, marginBottom: 12 },
  sectSecTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 16, letterSpacing: 4 },
  sectSecRule: { flex: 1, height: 1, backgroundColor: 'rgba(201,163,92,.25)' },
  sectCardWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sectSectCard: {
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 10,
    backgroundColor: theme.ink2, paddingVertical: 12, paddingHorizontal: 20,
  },
  sectName: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 15 },
  sectType: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11, marginTop: 4 },
  sectBack: { fontFamily: fonts.serif, color: theme.gold, fontSize: 15, marginBottom: 12 },
  sectH2: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 24, letterSpacing: 2, marginBottom: 4 },
  sectMeta: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, marginBottom: 16 },
  sectTabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  sectTabBtn: { borderWidth: 1, borderColor: theme.gold, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 20 },
  sectTabBtnOn: { backgroundColor: theme.gold },
  sectTabText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14 },
  sectTabTextOn: { color: theme.onGold, fontWeight: '600' },
  sectCard: {
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 10,
    backgroundColor: theme.ink2, padding: 16,
  },
  sectCardTitle: { fontFamily: fonts.serif, color: theme.gold, fontSize: 15, fontWeight: '600', marginBottom: 10 },
  sectChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  sectAffixChip: {
    backgroundColor: 'rgba(201,163,92,.12)', borderWidth: 1, borderColor: 'rgba(201,163,92,.3)',
    borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10,
  },
  sectAffixText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 12 },
  sectRotText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14, lineHeight: 25 },
  sectVideoText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 13 },
  sectRateRow: { flexDirection: 'row', gap: 12 },
  sectRateLabel: { fontFamily: fonts.serif, color: theme.gold, fontSize: 14, fontWeight: '600', minWidth: 40 },
  sectRateValue: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14 },
  sectRateNote: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, lineHeight: 22, marginTop: 4 },
});

// 本期新增令牌: 印章 (列表卡)、通用组合、标签页、图片、纯容器。
const extraStyles = StyleSheet.create({
  seal: {
    width: 36, height: 36, borderRadius: 6, backgroundColor: theme.seal,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  sealChar: { color: theme.paper, fontFamily: fonts.serif, fontSize: 18, fontWeight: '700', lineHeight: 21, textAlign: 'center' },
  chev: { color: theme.gold, fontSize: 18 },
  section: {},
  cardList: {},
  grid2: { gap: space.sm },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  colCenter: { alignItems: 'center', justifyContent: 'center' },
  flex1: { flex: 1 },
  padCard: { padding: 16 },
  divider: { height: 1, backgroundColor: 'rgba(201,163,92,.25)' },
  primTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  primTab: { borderWidth: 1, borderColor: theme.gold, borderRadius: radius.sm, paddingVertical: 8, paddingHorizontal: 20 },
  primTabOn: { backgroundColor: theme.gold },
  primTabText: { color: theme.paper, fontFamily: fonts.serif, fontSize: 14 },
  primTabTextOn: { color: theme.onGold, fontWeight: '600' },
  imgIcon: { width: 20, height: 20 },
  imgAvatar: { width: 40, height: 40, borderRadius: 999 },
  imgCover: { width: '100%', aspectRatio: 16 / 9, borderRadius: radius.md },
  imgThumb: { width: 64, height: 64, borderRadius: 10 },
  unknownText: { color: theme.muted, fontFamily: fonts.serif, fontSize: 13 },
});

// 全集: 容器/文本令牌按名查 (未知名 → undefined, 解释器走 Fallback)。
export const primStyles: Record<string, object> = {
  ...(blockStyles as unknown as Record<string, object>),
  ...(dexStyles as unknown as Record<string, object>),
  ...(sectStyles as unknown as Record<string, object>),
  ...(extraStyles as unknown as Record<string, object>),
};

// 座位格令牌是合成令牌: 与积木版 SeatCell 同构 = [seatCell 基底
// (flex/边框/内距), 状态变体 (底色/虚线/对齐)]。线上仍是单个令牌
// 名, 合成关系属于令牌实现 (同 fillFor 的填充约定)。
primStyles.seatTaken = [blockStyles.seatCell, blockStyles.seatTaken] as unknown as object;
primStyles.seatFreeJoin = [blockStyles.seatCell, blockStyles.seatFreeJoin] as unknown as object;
primStyles.seatFree = [blockStyles.seatCell, blockStyles.seatFree] as unknown as object;

// chip 令牌对: {外框样式, 文字样式} (样式数组 = 与现渲染同构的合成)。
export const chipTokens: Record<string, { box: object; text: object }> = {
  chip: { box: primStyles.chip, text: primStyles.chipText },
  typeChip: { box: primStyles.typeChip, text: primStyles.typeChipText },
  statusOpen: {
    box: [primStyles.statusPill, primStyles.statusOpen],
    text: [primStyles.statusText, primStyles.statusOpenText],
  },
  statusClosed: {
    box: [primStyles.statusPill, primStyles.statusClosed],
    text: [primStyles.statusText, primStyles.statusClosedText],
  },
  affixChip: { box: primStyles.sectAffixChip, text: primStyles.sectAffixText },
};

// 容器令牌的渐变填充 (解释器渲染为首个子层, 与现屏同构)。
export const fillFor = (token: string | undefined): 'card' | 'gold' | null => {
  if (token === 'btnPrimary') return 'gold';
  if (token === 'card' || token === 'dexRow' || token === 'dexCard' || token === 'sectCard' || token === 'sectSectCard') return 'card';
  return null;
};
