import React from 'react';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { fragments_BlockAction$key } from '@yanyun/blocks-core';
import { dispatchAction, useActionData, type ActionHandlers } from '../actions';

// 带动作的叶子共用的可点外壳: 调用方只在服务端下发了动作对象时才用它
// (无动作 = 纯展示 View, 权限在服务端, 客户端不判断)。
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
