import React from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { SeatGridBlockFragment } from '../fragments';
import type { ActionHandlers, fragments_SeatGridBlock$data, fragments_SeatGridBlock$key } from '@yanyun/blocks-core';
import ActionPressable from './ActionPressable';
import { blockStyles } from './styles';

type SeatEntryData = fragments_SeatGridBlock$data['seats'][number];

function SeatCell({ seat, handlers }: { seat: SeatEntryData; handlers: ActionHandlers }) {
  // 照 Web SeatGrid 的格子解剖: 占座 = 昵称 (15 金) + 「流派 · 角色」
  // (12 素行), 无序号无角色片; 空位 = 虚线格居中单行文案
  // (可落座 seatEmptyJoinLabel / 否则 seatEmptyLabel, 均由详情页 shell 下发)。
  const pt = handlers.pageText;
  const cellStyle = [
    blockStyles.seatCell,
    seat.occupied ? blockStyles.seatTaken : seat.action ? blockStyles.seatFreeJoin : blockStyles.seatFree,
  ];
  const body = seat.occupied ? (
    <>
      <Text style={blockStyles.seatName} numberOfLines={1}>{seat.nickname}</Text>
      {(seat.weapon || seat.role) ? (
        <Text style={blockStyles.seatSub} numberOfLines={1}>
          {seat.weapon ?? ''}{seat.role ? `${seat.weapon ? ' · ' : ''}${seat.role}` : ''}
        </Text>
      ) : null}
    </>
  ) : (
    <Text style={blockStyles.seatEmptyText}>
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

export default function SeatGridBlockView(props: {
  SeatGridBlock: fragments_SeatGridBlock$key;
  handlers: ActionHandlers;
}) {
  const data = useFragment(SeatGridBlockFragment, props.SeatGridBlock);
  const seats = data.seats ?? [];
  // 照 Web SeatGrid: 两列座位网格 (auto-fill minmax(150px,1fr) 在手机宽即两列),
  // 逐行成对排, 奇数尾行补一个等宽空占位保持列宽。
  const rows: SeatEntryData[][] = [];
  for (let i = 0; i < seats.length; i += 2) rows.push(seats.slice(i, i + 2));
  return (
    <View style={blockStyles.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={blockStyles.seatRowWrap}>
          {row.map((seat) => (
            <SeatCell key={seat.index} seat={seat} handlers={props.handlers} />
          ))}
          {row.length === 1 && <View style={blockStyles.seatCellSpacer} />}
        </View>
      ))}
    </View>
  );
}
