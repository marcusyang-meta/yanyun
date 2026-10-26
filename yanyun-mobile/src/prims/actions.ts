// 原语动作 → RN 宿主绑定: 与功能块的 src/blocks/actions.ts 同一个
// ConfirmFn 口径 (Alert.alert 三键确认), 分发走 blocks-core 的
// dispatchPrimAction。copyText / openUrl 处理器由屏幕在 handlers 里
// 注入 (见 GroupingListScreen / GroupingDetailScreen), 这里只负责
// 确认弹窗与分发。
import { Alert } from 'react-native';
import { dispatchPrimAction, type ActionHandlers, type ConfirmFn, type PrimAction } from '@yanyun/blocks-core';

const primConfirm: ConfirmFn = ({ title, message, okLabel, cancelLabel, destructive, onConfirm }) => {
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    { text: okLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
};

export function dispatchPrim(action: PrimAction | null | undefined, handlers: ActionHandlers): void {
  dispatchPrimAction(action, handlers, primConfirm);
}
