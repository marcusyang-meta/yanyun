import { StyleSheet } from 'react-native';
import { fonts, theme } from '../../theme';

// Shared styles for block leaves (moved item-by-item from
// BlockRenderer.tsx when @module was split out; one place for all
// renderers; visuals unchanged).
export const blockStyles = StyleSheet.create({
  // Section heading mirrors Web .yy-section-head h2: calligraphy gold text
  sectionTitle: { fontFamily: fonts.brush, color: theme.goldHi, fontSize: 22, letterSpacing: 2, marginTop: 20, marginBottom: 12 },
  sectionHeader: { fontFamily: fonts.serif, color: theme.gold, fontSize: 13, fontWeight: '700', letterSpacing: 2, marginTop: 20, marginBottom: 10 },
  // Detail header mirrors Web h2/meta/hint: title 24 bright gold, tracking 2; meta 13 plain; hint 12 plain.
  bTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 24, fontWeight: '700', letterSpacing: 2, lineHeight: 34, marginBottom: 8 },
  bMeta: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  bMuted: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12.5, marginTop: 6, lineHeight: 19 },
  banner: { backgroundColor: 'rgba(201,163,92,.10)', borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 10, padding: 13, marginBottom: 12 },
  bannerText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 14, lineHeight: 21 },
  // Info chip mirrors Web .yy-fchip: thin gold outline ghost chip
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2, marginBottom: 4 },
  chip: { borderWidth: 1, borderColor: theme.chipBorder, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  chipText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 12.5 },
  empty: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14, textAlign: 'center', paddingVertical: 36 },
  fallback: { borderWidth: 1, borderStyle: 'dashed', borderColor: theme.cardBorder, borderRadius: 10, padding: 12, marginVertical: 6 },
  fallbackText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, textAlign: 'center' },
  // Grouping card mirrors Web .yy-card row: padding 14/16, gaps 12, card spacing 10 in column
  card: {
    position: 'relative', overflow: 'hidden', backgroundColor: theme.ink2,
    borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardMain: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  cardTitle: { fontFamily: fonts.serif, color: theme.paper, fontSize: 15, flex: 1, lineHeight: 21 },
  // Type chip mirrors the Web in-card span: 11px bright gold text, 1px gold outline, radius 4
  typeChip: { borderWidth: 1, borderColor: theme.gold, borderRadius: 4, paddingVertical: 1, paddingHorizontal: 6, marginTop: 1 },
  typeChipText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 11 },
  cardMeta: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginTop: 4 },
  // Status chip mirrors Web: radius 4; open = green (#7fc97f) outline/text, otherwise plain outline
  statusPill: { borderWidth: 1, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 8 },
  statusOpen: { borderColor: '#7fc97f' },
  statusOpenText: { color: '#7fc97f' },
  statusClosed: { borderColor: theme.border },
  statusClosedText: { color: theme.muted },
  statusText: { fontFamily: fonts.serif, fontSize: 12 },
  cardChev: { color: theme.gold, fontSize: 18 },
  // Seat grid mirrors Web SeatGrid: two columns, gap 10; taken = pale-gold fill, solid edge, left-aligned two lines;
  // empty = dashed edge (joinable .4 / read-only .25), transparent, centered single line, minHeight 62.
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
  // Action button mirrors the Web detail button row small button (.yy-btn sm): hug width, padding 6/16, 13px;
  // position is still set by tree order (the server puts the disband button last); the client never reorders blocks.
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
