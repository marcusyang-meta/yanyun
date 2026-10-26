import React from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { GroupingCardBlockFragment } from '../fragments';
import { CardFill, Seal } from '../../components/ui';
import type { ActionHandlers, fragments_GroupingCardBlock$key } from '@yanyun/blocks-core';
import ActionPressable from './ActionPressable';
import { blockStyles } from './styles';

export default function GroupingCardBlockView(props: {
  GroupingCardBlock: fragments_GroupingCardBlock$key;
  handlers: ActionHandlers;
}) {
  const { handlers } = props;
  const data = useFragment(GroupingCardBlockFragment, props.GroupingCardBlock);
  // Mirrors the Web .yy-card row: [36px seal sealText] [middle: type chip +
  // title (wrappable) / meta row time-count-dungeon] [status chip: open =
  // green outline and text, otherwise plain] [>]. Open state compares only
  // the server copy (same source as statusOpenLabel).
  const sealText = handlers.pageText?.sealText;
  const open = !!data.statusText && !!handlers.pageText?.statusOpenLabel
    && data.statusText === handlers.pageText.statusOpenLabel;
  const inner = (
    <>
      <CardFill />
      <View style={blockStyles.cardRow}>
        {sealText ? <Seal char={sealText} size={36} brush={false} /> : null}
        <View style={blockStyles.cardMain}>
          <View style={blockStyles.cardTitleRow}>
            {data.badgeText ? (
              <View style={blockStyles.typeChip}><Text style={blockStyles.typeChipText}>{data.badgeText}</Text></View>
            ) : null}
            <Text style={blockStyles.cardTitle}>{data.cardTitle}</Text>
          </View>
          <Text style={blockStyles.cardMeta}>
            {[data.timeText, data.peopleText, data.dungeonName].filter(Boolean).join(' · ')}
          </Text>
        </View>
        {data.statusText ? (
          <View style={[blockStyles.statusPill, open ? blockStyles.statusOpen : blockStyles.statusClosed]}>
            <Text style={[blockStyles.statusText, open ? blockStyles.statusOpenText : blockStyles.statusClosedText]}>{data.statusText}</Text>
          </View>
        ) : null}
        <Text style={blockStyles.cardChev}>›</Text>
      </View>
    </>
  );
  if (data.action) {
    return (
      <ActionPressable actionRef={data.action} handlers={handlers} style={blockStyles.card}>
        {inner}
      </ActionPressable>
    );
  }
  return <View style={blockStyles.card}>{inner}</View>;
}
