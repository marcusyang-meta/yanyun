import { StyleSheet } from 'react-native';
import { fonts, theme } from '../../theme';

// 积木叶子共享样式 (原 BlockRenderer.tsx 的整表逐项搬移, 拆 @module
// 后集中一处供各渲染组件取用; 视觉与拆分前一致)。
export const blockStyles = StyleSheet.create({
  // 区块标题照 Web .yy-section-head h2: 书法金字
  sectionTitle: { fontFamily: fonts.brush, color: theme.goldHi, fontSize: 22, letterSpacing: 2, marginTop: 20, marginBottom: 12 },
  sectionHeader: { fontFamily: fonts.serif, color: theme.gold, fontSize: 13, fontWeight: '700', letterSpacing: 2, marginTop: 20, marginBottom: 10 },
  // 详情头部照 Web h2/meta/hint: 标题 24 金亮 + 字距 2; 元信息 13 素行;
  // 提示 12 素行。
  bTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 24, fontWeight: '700', letterSpacing: 2, lineHeight: 34, marginBottom: 8 },
  bMeta: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  bMuted: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12.5, marginTop: 6, lineHeight: 19 },
  banner: { backgroundColor: 'rgba(201,163,92,.10)', borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 10, padding: 13, marginBottom: 12 },
  bannerText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 14, lineHeight: 21 },
  // 信息片照 Web .yy-fchip: 细金描边幽灵片
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2, marginBottom: 4 },
  chip: { borderWidth: 1, borderColor: theme.chipBorder, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  chipText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 12.5 },
  empty: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14, textAlign: 'center', paddingVertical: 36 },
  fallback: { borderWidth: 1, borderStyle: 'dashed', borderColor: theme.cardBorder, borderRadius: 10, padding: 12, marginVertical: 6 },
  fallbackText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, textAlign: 'center' },
  // 车队卡照 Web .yy-card 横行: padding 14/16, 元素 gap 12, 列内卡距 10
  card: {
    position: 'relative', overflow: 'hidden', backgroundColor: theme.ink2,
    borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardMain: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  cardTitle: { fontFamily: fonts.serif, color: theme.paper, fontSize: 15, flex: 1, lineHeight: 21 },
  // 类型小片照 Web 卡内 span: 11px 金亮字 + 1px 金描边 + radius 4
  typeChip: { borderWidth: 1, borderColor: theme.gold, borderRadius: 4, paddingVertical: 1, paddingHorizontal: 6, marginTop: 1 },
  typeChipText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 11 },
  cardMeta: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginTop: 4 },
  // 状态片照 Web: radius 4 方片; 报名中 = 绿 (#7fc97f) 描边字, 其余素描边
  statusPill: { borderWidth: 1, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 8 },
  statusOpen: { borderColor: '#7fc97f' },
  statusOpenText: { color: '#7fc97f' },
  statusClosed: { borderColor: theme.border },
  statusClosedText: { color: theme.muted },
  statusText: { fontFamily: fonts.serif, fontSize: 12 },
  cardChev: { color: theme.gold, fontSize: 18 },
  // 座位网格照 Web SeatGrid: 两列 gap 10; 占座 = 淡金底实边左对齐两行,
  // 空位 = 虚线边 (可落座 .4 / 只读 .25) 透明底居中单行, minHeight 62。
  grid: { gap: 10 },
  seatRowWrap: { flexDirection: 'row', gap: 10 },
  seatCellSpacer: { flex: 1 },
  seatCell: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 62, justifyContent: 'center' },
  seatTaken: { backgroundColor: 'rgba(201,163,92,.12)', borderColor: theme.border, alignItems: 'flex-start' },
  seatFreeJoin: { backgroundColor: 'transparent', borderColor: 'rgba(201,163,92,.4)', borderStyle: 'dashed', alignItems: 'center' },
  seatFree: { backgroundColor: 'transparent', borderColor: 'rgba(201,163,92,.25)', borderStyle: 'dashed', alignItems: 'center' },
  seatName: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 15, lineHeight: 21 },
  seatNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  seatLeaderTag: { borderWidth: 1, borderColor: 'rgba(201,163,92,.55)', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 0.5 },
  seatLeaderText: { fontFamily: fonts.serif, color: theme.gold, fontSize: 10.5, lineHeight: 15 },
  seatSub: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, lineHeight: 16, marginTop: 4 },
  seatEmptyText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14, lineHeight: 19, textAlign: 'center' },
  // 动作钮照 Web 详情按钮行的小钮 (.yy-btn sm): hug 宽, padding 6/16, 13px;
  // 位置仍由树序决定 (服务端把解散钮排在树尾), 客户端不重排积木。
  btnPrimary: {
    position: 'relative', overflow: 'hidden', borderRadius: 10, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(236,210,143,.5)',
    paddingVertical: 7, paddingHorizontal: 16, alignItems: 'center',
  },
  btnPrimaryText: { fontFamily: fonts.serif, color: theme.onGold, fontSize: 13.5, fontWeight: '700' },
  btnGhost: {
    borderWidth: 1, borderColor: theme.border, borderRadius: 10, alignSelf: 'flex-start',
    paddingVertical: 7, paddingHorizontal: 16, alignItems: 'center',
  },
  btnGhostText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 13.5 },
  btnDanger: {
    borderWidth: 1, borderColor: theme.seal, borderRadius: 10, alignSelf: 'flex-start',
    paddingVertical: 7, paddingHorizontal: 16, alignItems: 'center',
  },
  btnDangerText: { fontFamily: fonts.serif, color: '#e08080', fontSize: 13.5 },
});
