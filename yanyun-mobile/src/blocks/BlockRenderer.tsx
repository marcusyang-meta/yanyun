import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { fonts, theme } from '../theme';
import { CardFill, GoldFill, Seal } from '../components/ui';
import {
  ActionButtonBlockFragment,
  BannerBlockFragment,
  ChipRowBlockFragment,
  EmptyStateBlockFragment,
  FallbackBlockFragment,
  GroupingCardBlockFragment,
  SeatGridBlockFragment,
  SectionHeaderBlockFragment,
  SpacerBlockFragment,
  TextBlockFragment,
} from '@yanyun/blocks-core';
import { createBlockRenderer } from '@yanyun/blocks-core';
import type { BlockLeafRegistry } from '@yanyun/blocks-core';
import type {
  fragments_ActionButtonBlock$key,
  fragments_BannerBlock$key,
  fragments_BlockAction$key,
  fragments_ChipRowBlock$key,
  fragments_EmptyStateBlock$key,
  fragments_FallbackBlock$key,
  fragments_GroupingCardBlock$key,
  fragments_SeatGridBlock$data,
  fragments_SeatGridBlock$key,
  fragments_SectionHeaderBlock$key,
  fragments_SpacerBlock$key,
  fragments_TextBlock$key,
} from '@yanyun/blocks-core';
import { dispatchAction, useActionData, type ActionHandlers } from './actions';

// RN 叶子渲染器: 平台中立的遍历/分发在 core/, 这里只提供每个具体块类型
// 在 React Native 下长什么样, 注册进核心遍历器。桌面 overlay 复用 core 时
// 另写一套 DOM 叶子注册表即可, 不碰核心。
// 叶子只负责呈现与触发动作对象, 不做任何权限判断 (树由服务端按观看者组好)。

function SectionView({ title, children }: { title: string | null; children: React.ReactNode }) {
  return (
    <View>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

function TextBlockView({ block }: { block: fragments_TextBlock$key }) {
  const data = useFragment(TextBlockFragment, block);
  const st = data.variant === 'title' ? styles.bTitle : data.variant === 'meta' ? styles.bMeta : styles.bMuted;
  return <Text style={st}>{data.text}</Text>;
}

function BannerBlockView({ block }: { block: fragments_BannerBlock$key }) {
  const data = useFragment(BannerBlockFragment, block);
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>📣 {data.text}</Text>
    </View>
  );
}

function SectionHeaderBlockView({ block }: { block: fragments_SectionHeaderBlock$key }) {
  const data = useFragment(SectionHeaderBlockFragment, block);
  return <Text style={styles.sectionHeader}>{data.text}</Text>;
}

function ChipRowBlockView({ block }: { block: fragments_ChipRowBlock$key }) {
  const data = useFragment(ChipRowBlockFragment, block);
  return (
    <View style={styles.chipRow}>
      {(data.chips ?? []).map((c, i) => (
        <View key={i} style={styles.chip}>
          <Text style={styles.chipText}>{c}</Text>
        </View>
      ))}
    </View>
  );
}

function EmptyStateBlockView({ block }: { block: fragments_EmptyStateBlock$key }) {
  const data = useFragment(EmptyStateBlockFragment, block);
  return <Text style={styles.empty}>{data.text}</Text>;
}

function SpacerBlockView({ block }: { block: fragments_SpacerBlock$key }) {
  const data = useFragment(SpacerBlockFragment, block);
  return <View style={{ height: data.size ?? 12 }} />;
}

function FallbackBlockView({ block }: { block: fragments_FallbackBlock$key }) {
  const data = useFragment(FallbackBlockFragment, block);
  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackText}>{data.text}</Text>
    </View>
  );
}

function UnknownBlockView() {
  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackText}>该内容需要更新 App 后显示</Text>
    </View>
  );
}

/* ---------------- 带动作的叶子 ---------------- */

function ActionPressable({
  actionRef,
  handlers,
  style,
  children,
}: {
  actionRef: fragments_BlockAction$key;
  handlers: ActionHandlers;
  style?: object;
  children: React.ReactNode;
}) {
  const action = useActionData(actionRef);
  return (
    <Pressable style={style} onPress={() => dispatchAction(action, handlers)}>
      {children}
    </Pressable>
  );
}

function GroupingCardBlockView({ block, handlers }: { block: fragments_GroupingCardBlock$key; handlers: ActionHandlers }) {
  const data = useFragment(GroupingCardBlockFragment, block);
  // 照 Web .yy-card 的横行结构: [36 方印 sealText] [中列: 类型描边小片 +
  // 标题 (可换行) / 元信息行 时间·人数·副本] [状态片: 报名中=绿描边绿字,
  // 否则素描边] [›]。状态开/关只比对服务端文案 (statusOpenLabel 同源)。
  const sealText = handlers.pageText?.sealText;
  const open = !!data.statusText && !!handlers.pageText?.statusOpenLabel
    && data.statusText === handlers.pageText.statusOpenLabel;
  const inner = (
    <>
      <CardFill />
      <View style={styles.cardRow}>
        {sealText ? <Seal char={sealText} size={36} brush={false} /> : null}
        <View style={styles.cardMain}>
          <View style={styles.cardTitleRow}>
            {data.badgeText ? (
              <View style={styles.typeChip}><Text style={styles.typeChipText}>{data.badgeText}</Text></View>
            ) : null}
            <Text style={styles.cardTitle}>{data.cardTitle}</Text>
          </View>
          <Text style={styles.cardMeta}>
            {[data.timeText, data.peopleText, data.dungeonName].filter(Boolean).join(' · ')}
          </Text>
        </View>
        {data.statusText ? (
          <View style={[styles.statusPill, open ? styles.statusOpen : styles.statusClosed]}>
            <Text style={[styles.statusText, open ? styles.statusOpenText : styles.statusClosedText]}>{data.statusText}</Text>
          </View>
        ) : null}
        <Text style={styles.cardChev}>›</Text>
      </View>
    </>
  );
  if (data.action) {
    return (
      <ActionPressable actionRef={data.action} handlers={handlers} style={styles.card}>
        {inner}
      </ActionPressable>
    );
  }
  return <View style={styles.card}>{inner}</View>;
}

type SeatEntryData = fragments_SeatGridBlock$data['seats'][number];

function SeatGridBlockView({ block, handlers }: { block: fragments_SeatGridBlock$key; handlers: ActionHandlers }) {
  const data = useFragment(SeatGridBlockFragment, block);
  const seats = data.seats ?? [];
  // 照 Web SeatGrid: 两列座位网格 (auto-fill minmax(150px,1fr) 在手机宽即两列),
  // 逐行成对排, 奇数尾行补一个等宽空占位保持列宽。
  const rows: SeatEntryData[][] = [];
  for (let i = 0; i < seats.length; i += 2) rows.push(seats.slice(i, i + 2));
  return (
    <View style={styles.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.seatRowWrap}>
          {row.map((seat) => (
            <SeatCell key={seat.index} seat={seat} handlers={handlers} />
          ))}
          {row.length === 1 && <View style={styles.seatCellSpacer} />}
        </View>
      ))}
    </View>
  );
}

function SeatCell({ seat, handlers }: { seat: SeatEntryData; handlers: ActionHandlers }) {
  // 照 Web SeatGrid 的格子解剖: 占座 = 昵称 (15 金) + 「流派 · 角色」
  // (12 素行), 无序号无角色片; 空位 = 虚线格居中单行文案
  // (可落座 seatEmptyJoinLabel / 否则 seatEmptyLabel, 均由详情页 shell 下发)。
  const pt = handlers.pageText;
  const cellStyle = [
    styles.seatCell,
    seat.occupied ? styles.seatTaken : seat.action ? styles.seatFreeJoin : styles.seatFree,
  ];
  const body = seat.occupied ? (
    <>
      <Text style={styles.seatName} numberOfLines={1}>{seat.nickname}</Text>
      {(seat.weapon || seat.role) ? (
        <Text style={styles.seatSub} numberOfLines={1}>
          {seat.weapon ?? ''}{seat.role ? `${seat.weapon ? ' · ' : ''}${seat.role}` : ''}
        </Text>
      ) : null}
    </>
  ) : (
    <Text style={styles.seatEmptyText}>
      {seat.action ? (pt?.seatEmptyJoinLabel ?? '空位 · 点击落座') : (pt?.seatEmptyLabel ?? '空位')}
    </Text>
  );
  if (seat.action) {
    return (
      <ActionPressable actionRef={seat.action} handlers={handlers} style={cellStyle}>
        {body}
      </ActionPressable>
    );
  }
  return <View style={cellStyle}>{body}</View>;
}

function ActionButtonBlockView({ block, handlers }: { block: fragments_ActionButtonBlock$key; handlers: ActionHandlers }) {
  const data = useFragment(ActionButtonBlockFragment, block);
  const btnStyle = data.style === 'danger' ? styles.btnDanger : data.style === 'ghost' ? styles.btnGhost : styles.btnPrimary;
  const txtStyle = data.style === 'danger' ? styles.btnDangerText : data.style === 'ghost' ? styles.btnGhostText : styles.btnPrimaryText;
  const label = (
    <>
      {data.style !== 'danger' && data.style !== 'ghost' ? <GoldFill /> : null}
      <Text style={txtStyle}>{data.label}</Text>
    </>
  );
  if (data.action) {
    return (
      <ActionPressable actionRef={data.action} handlers={handlers} style={btnStyle}>
        {label}
      </ActionPressable>
    );
  }
  return <View style={btnStyle}>{label}</View>;
}

/* ---------------- 注册表 + 遍历器实例 ---------------- */

const rnLeaves: BlockLeafRegistry = {
  Section: SectionView,
  TextBlock: TextBlockView,
  BannerBlock: BannerBlockView,
  SectionHeaderBlock: SectionHeaderBlockView,
  ChipRowBlock: ChipRowBlockView,
  EmptyStateBlock: EmptyStateBlockView,
  SpacerBlock: SpacerBlockView,
  FallbackBlock: FallbackBlockView,
  GroupingCardBlock: GroupingCardBlockView,
  SeatGridBlock: SeatGridBlockView,
  ActionButtonBlock: ActionButtonBlockView,
  Unknown: UnknownBlockView,
};

export const { BlockNode1View, BlockNode2View } = createBlockRenderer(rnLeaves);

const styles = StyleSheet.create({
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
