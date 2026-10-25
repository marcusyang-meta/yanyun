import React from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { ActionButtonBlockFragment } from '../fragments';
import { GoldFill } from '../../components/ui';
import type { ActionHandlers, fragments_ActionButtonBlock$key } from '@yanyun/blocks-core';
import ActionPressable from './ActionPressable';
import { blockStyles } from './styles';

export default function ActionButtonBlockView(props: {
  ActionButtonBlock: fragments_ActionButtonBlock$key;
  handlers: ActionHandlers;
}) {
  const { handlers } = props;
  const data = useFragment(ActionButtonBlockFragment, props.ActionButtonBlock);
  const btnStyle = data.style === 'danger' ? blockStyles.btnDanger : data.style === 'ghost' ? blockStyles.btnGhost : blockStyles.btnPrimary;
  const txtStyle = data.style === 'danger' ? blockStyles.btnDangerText : data.style === 'ghost' ? blockStyles.btnGhostText : blockStyles.btnPrimaryText;
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
