import React from 'react';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { fragments_BlockAction$key } from '@yanyun/blocks-core';
import { dispatchAction, useActionData, type ActionHandlers } from '../actions';

// Tappable shell shared by action-bearing leaves: callers use it only
// when the server supplied an action object (no action = plain display
// View; permissions live on the server, the client does not check).
export default function ActionPressable({
  actionRef,
  handlers,
  style,
  children,
}: {
  actionRef: fragments_BlockAction$key;
  handlers: ActionHandlers;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const action = useActionData(actionRef);
  return (
    <Pressable style={style} onPress={() => dispatchAction(action, handlers)}>
      {children}
    </Pressable>
  );
}
