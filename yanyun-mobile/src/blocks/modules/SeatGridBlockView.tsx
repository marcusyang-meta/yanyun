import React from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { SeatGridBlockFragment } from '../fragments';
import type { ActionHandlers, fragments_SeatGridBlock$data, fragments_SeatGridBlock$key } from '@yanyun/blocks-core';
import ActionPressable from './ActionPressable';
import { blockStyles } from './styles';

type SeatEntryData = fragments_SeatGridBlock$data['seats'][number];

function SeatCell({ seat, handlers }: { seat: SeatEntryData; handlers: ActionHandlers }) {
  // Mirrors Web SeatGrid cell anatomy: taken seat = nickname (15, gold) +
  // sect/role line (12, plain), no index or role chip; empty seat = dashed
  // cell with centered single-line copy (seatEmptyJoinLabel if joinable,
  // else seatEmptyLabel; both supplied by the detail page shell).
  const pt = handlers.pageText;
  const cellStyle = [
    blockStyles.seatCell,
    seat.occupied ? blockStyles.seatTaken : seat.action ? blockStyles.seatFreeJoin : blockStyles.seatFree,
  ];
  const body = seat.occupied ? (
    <>
      <View style={blockStyles.seatNameRow}>
        <Text style={blockStyles.seatName} numberOfLines={1}>{seat.nickname}</Text>
        {seat.isLeader && pt?.seatLeaderLabel ? (
          <View style={blockStyles.seatLeaderTag}>
            <Text style={blockStyles.seatLeaderText}>{pt.seatLeaderLabel}</Text>
          </View>
        ) : null}
      </View>
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
  // Mirrors Web SeatGrid: two-column seat grid (auto-fill minmax(150px,1fr)
  // is two columns at phone width), filled pairwise by row; an odd tail row
  // gets an equal-width spacer to keep column widths.
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
