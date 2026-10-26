import { useFragment } from 'react-relay';
import { BlockActionFragment } from './fragments';
import type { ActionHandlers, ConfirmFn } from './types';
import type { fragments_BlockAction$data, fragments_BlockAction$key } from './__generated__/fragments_BlockAction.graphql';

// Action dispatch (platform-neutral): the server supplies only typed
// Action objects; the client maps each type to a host-injected handler.
// Confirmation goes through the injected ConfirmFn -- copy comes from
// the action object itself, presentation (Alert / modal / ...) is per-platform.
export type BlockActionData = fragments_BlockAction$data;

// Call only inside a child mounted when the confirm action ref exists (hooks run unconditionally).
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
    case 'CompleteAction':
      confirm({
        title: action.confirmTitle ?? '',
        message: action.confirmMessage ?? '',
        okLabel: action.okLabel ?? '确定',
        cancelLabel: action.cancelLabel ?? '取消',
        destructive: false,
        onConfirm: () => handlers.complete({ groupingId: action.groupingId ?? '' }),
      });
      break;
    case 'UncompleteAction':
      handlers.uncomplete({ groupingId: action.groupingId ?? '' });
      break;
    default:
      // Unknown action type: ignore safely (version negotiation is server-side; this is only a fallback)
      break;
  }
}
