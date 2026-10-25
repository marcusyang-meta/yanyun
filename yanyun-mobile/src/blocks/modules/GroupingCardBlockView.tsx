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
  // 照 Web .yy-card 的横行结构: [36 方印 sealText] [中列: 类型描边小片 +
  // 标题 (可换行) / 元信息行 时间·人数·副本] [状态片: 报名中=绿描边绿字,
  // 否则素描边] [›]。状态开/关只比对服务端文案 (statusOpenLabel 同源)。
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
