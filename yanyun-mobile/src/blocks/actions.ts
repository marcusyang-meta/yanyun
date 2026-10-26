import { Alert } from 'react-native';
import { dispatchAction as dispatchActionCore, useActionData } from '@yanyun/blocks-core';
import type { ActionHandlers, ConfirmFn } from '@yanyun/blocks-core';
import type { BlockActionData } from '@yanyun/blocks-core';

// RN binding: core dispatch logic is in core/actions (platform-neutral);
// this file only injects RN's confirm presentation (Alert). Types and
// the hook re-export the core definitions (single source of truth).
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
