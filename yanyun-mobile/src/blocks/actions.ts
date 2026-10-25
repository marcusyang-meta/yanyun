import { Alert } from 'react-native';
import { dispatchAction as dispatchActionCore, useActionData } from '@yanyun/blocks-core';
import type { ActionHandlers, ConfirmFn } from '@yanyun/blocks-core';
import type { BlockActionData } from '@yanyun/blocks-core';

// RN 侧绑定: 核心分发逻辑在 core/actions (平台中立), 这里只注入 RN 的
// 确认呈现 (Alert)。类型与 hook 直接转发核心定义, 保持单一事实来源。
export type { ActionHandlers } from '@yanyun/blocks-core';
export type { BlockActionData } from '@yanyun/blocks-core';
export { useActionData };

const alertConfirm: ConfirmFn = ({ title, message, okLabel, cancelLabel, destructive, onConfirm }) => {
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    { text: okLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
};

export function dispatchAction(action: BlockActionData | null | undefined, handlers: ActionHandlers): void {
  dispatchActionCore(action, handlers, alertConfirm);
}
