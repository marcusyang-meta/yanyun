// ============================================================
// 原语面 (C 路线) 平台中立契约: 服务端拼好的极简 JSON 原语树
// (GroupingListPage/GroupingDetailPage.primTree) 的节点/动作类型与
// 动作分发。渲染 (节点 → 宿主组件 + 样式令牌表) 在各端自己的解释器
// 里; 这里只有线格式类型与分发逻辑, 不 import 任何平台 API。
//
// 词汇 v1 已冻结 (与后端 src/prim.js 的注册表同口径):
//   节点 col/row/txt/img/chip/press/list/sp/div/tabs/island/fallback
//   动作 nav/join/leave/disband/edit/complete/uncomplete/copy/url
// 新增节点/动作类型 = 客户端发版事件, 与新增功能块同级评审。
// ============================================================

export type PrimAction =
  | { t: 'nav'; slug: string; groupingId: string; name: string; readOnly: boolean; nick: string }
  | { t: 'join'; groupingId: string; seatIndex: number }
  | {
      t: 'leave'; groupingId: string; uid: string;
      confirmTitle: string; confirmMessage: string; okLabel: string; cancelLabel: string;
    }
  | {
      t: 'disband' | 'complete'; groupingId: string;
      confirmTitle: string; confirmMessage: string; okLabel: string; cancelLabel: string;
    }
  | { t: 'edit' | 'uncomplete'; groupingId: string }
  | { t: 'copy'; text: string }
  | { t: 'url'; url: string };

// 数据行: Collection 的 items 元素 — 字段由模板的 $绑定决定, 值是
// 文本/令牌名/动作对象/null 的平坦记录 (服务端的拼树结论)。
export type PrimItem = Record<string, string | number | boolean | PrimAction | null>;

export interface PrimNode {
  t: string;
  s?: string;
  x?: string;
  uri?: string;
  lines?: number;
  gap?: string;
  wrap?: number;
  a?: PrimAction | string | null;
  c?: PrimNode[];
  tpl?: PrimNode;
  items?: PrimItem[];
  tabs?: { label: string; c: PrimNode[] }[];
  id?: string;
  params?: Record<string, string | number>;
  // 模板绑定允许任意 props 出现 $字段占位, 索引签名兜底
  [key: string]: unknown;
}

export const PRIM_VOCAB_VERSION = 1;

// 原语动作分发: 与功能块的 dispatchAction (actions.ts) 同语义 —
// leave/disband/complete 先经宿主注入的 ConfirmFn 确认 (文案来自动作
// 对象本身, 服务端按 locale 生成), 其余直达; copy/url 是展示面通用
// 动作 (宿主未提供处理器时安全忽略)。未知动作同样安全忽略 (版本
// 协商在服务端, 这里只是兜底)。
import type { ActionHandlers, ConfirmFn } from './types';

export function dispatchPrimAction(
  action: PrimAction | null | undefined,
  handlers: ActionHandlers,
  confirm: ConfirmFn,
): void {
  if (!action) return;
  switch (action.t) {
    case 'nav':
      handlers.navigate({
        slug: action.slug ?? '', groupingId: action.groupingId ?? '',
        name: action.name ?? '', readOnly: !!action.readOnly, nick: action.nick ?? '',
      });
      break;
    case 'join':
      handlers.join({ groupingId: action.groupingId ?? '', seatIndex: action.seatIndex ?? 0 });
      break;
    case 'leave':
      confirm({
        title: action.confirmTitle ?? '', message: action.confirmMessage ?? '',
        okLabel: action.okLabel ?? '确定', cancelLabel: action.cancelLabel ?? '取消',
        destructive: true,
        onConfirm: () => handlers.leave({ groupingId: action.groupingId ?? '', uid: action.uid ?? '' }),
      });
      break;
    case 'disband':
      confirm({
        title: action.confirmTitle ?? '', message: action.confirmMessage ?? '',
        okLabel: action.okLabel ?? '确定', cancelLabel: action.cancelLabel ?? '取消',
        destructive: true,
        onConfirm: () => handlers.disband({ groupingId: action.groupingId ?? '' }),
      });
      break;
    case 'complete':
      confirm({
        title: action.confirmTitle ?? '', message: action.confirmMessage ?? '',
        okLabel: action.okLabel ?? '确定', cancelLabel: action.cancelLabel ?? '取消',
        destructive: false,
        onConfirm: () => handlers.complete({ groupingId: action.groupingId ?? '' }),
      });
      break;
    case 'edit':
      handlers.edit({ groupingId: action.groupingId ?? '' });
      break;
    case 'uncomplete':
      handlers.uncomplete({ groupingId: action.groupingId ?? '' });
      break;
    case 'copy':
      handlers.copyText?.({ text: action.text ?? '' });
      break;
    case 'url':
      handlers.openUrl?.({ url: action.url ?? '' });
      break;
    default:
      break;
  }
}
