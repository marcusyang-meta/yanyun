import { useFragment } from 'react-relay';
import { BlockActionFragment } from './fragments';
import type { ActionHandlers, ConfirmFn } from './types';
import type { fragments_BlockAction$data, fragments_BlockAction$key } from './__generated__/fragments_BlockAction.graphql';

// 动作分发 (平台中立): 服务端只下发带类型的 Action 对象, 客户端按对象
// 类型映射到宿主注入的处理器; 确认流程走注入的 ConfirmFn —— 文案来自
// 动作对象本身, 呈现机制 (Alert / modal / …) 由各端决定。
export type BlockActionData = fragments_BlockAction$data;

// 只在确认 action ref 存在时挂载的子组件里调用 (hook 无条件执行)。
export function useActionData(ref: fragments_BlockAction$key): BlockActionData {
  return useFragment(BlockActionFragment, ref);
}

export function dispatchAction(
  action: BlockActionData | null | undefined,
  handlers: ActionHandlers,
  confirm: ConfirmFn,
): void {
  if (!action) return;
  switch (action.__typename) {
    case 'NavigateAction':
      handlers.navigate({
        slug: action.slug ?? '',
        groupingId: action.groupingId ?? '',
        name: action.name ?? '',
        readOnly: !!action.readOnly,
        nick: action.nick ?? '',
      });
      break;
    case 'JoinAction':
      handlers.join({ groupingId: action.groupingId ?? '', seatIndex: action.seatIndex ?? 0 });
      break;
    case 'LeaveAction':
      confirm({
        title: action.confirmTitle ?? '',
        message: action.confirmMessage ?? '',
        okLabel: action.okLabel ?? '确定',
        cancelLabel: action.cancelLabel ?? '取消',
        destructive: true,
        onConfirm: () => handlers.leave({ groupingId: action.groupingId ?? '', uid: action.uid ?? '' }),
      });
      break;
    case 'DisbandAction':
      confirm({
        title: action.confirmTitle ?? '',
        message: action.confirmMessage ?? '',
        okLabel: action.okLabel ?? '确定',
        cancelLabel: action.cancelLabel ?? '取消',
        destructive: true,
        onConfirm: () => handlers.disband({ groupingId: action.groupingId ?? '' }),
      });
      break;
    case 'EditAction':
      handlers.edit({ groupingId: action.groupingId ?? '' });
      break;
    default:
      // 未知动作类型: 安全忽略 (版本协商在服务端, 这里只是兜底)
      break;
  }
}
