// ============================================================
// 原语树解释器 (C 路线客户端半): 服务端下发的极简 JSON 原语树 →
// React Native 组件。解释器只认冻结词汇 + 冻结令牌表 (styles.ts),
// 不认识的节点类型/令牌一律走 Fallback 占位 (只占一格, 不炸整页)。
// 客户端不拼文案: 文本与动作确认文案全部来自服务端节点本身。
//
// Collection 展开: list 节点的 tpl 里 "$字段" 占位在渲染时按数据行
// 逐项替换 (x/s/a 三类 props 都可绑定)。绑定为 null 的语义与服务
// 端约定一致: txt 不渲染、press 无动作退化为普通容器、chip 不
// 渲染 —— 权限与可点性仍由「服务端给不给动作」表达。
// ============================================================
import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import type { ActionHandlers, PrimAction, PrimItem, PrimNode } from '@yanyun/blocks-core';
import { chipTokens, fillFor, primStyles, spaceScale } from './styles';
import { dispatchPrim } from './actions';
import { IslandNode } from './islands';
import { CardFill, GoldFill } from '../components/ui';

interface Ctx {
  handlers: ActionHandlers;
}

function FallbackBox({ text }: { text?: string }) {
  return (
    <View style={primStyles.fallback as object}>
      <Text style={primStyles.unknownText as object}>{text ?? '该内容需要更新 App 后显示'}</Text>
    </View>
  );
}

// 模板绑定: 把节点 props 里的 "$字段" 换成数据行同名字段值;
// c (子节点) 递归。非模板节点不经过这里。
function bindNode(node: PrimNode, item: PrimItem): PrimNode {
  const out: PrimNode = { ...node };
  for (const k of Object.keys(out)) {
    const v = out[k];
    if (typeof v === 'string' && v.charAt(0) === '$') {
      out[k] = item[v.slice(1)] as never;
    }
  }
  if (Array.isArray(node.c)) out.c = node.c.map((ch) => bindNode(ch, item));
  return out;
}

function styleOf(node: PrimNode): object | undefined {
  return node.s ? primStyles[node.s] : undefined;
}

function Children({ node, ctx }: { node: PrimNode; ctx: Ctx }) {
  return (
    <>
      {(node.c ?? []).map((ch, i) => (
        <PrimNodeView key={i} node={ch} ctx={ctx} />
      ))}
    </>
  );
}

function PrimList({ node, ctx }: { node: PrimNode; ctx: Ctx }) {
  const tpl = node.tpl;
  const items = node.items ?? [];
  if (!tpl) return null;
  if (node.s === 'grid2') {
    // 座位网格: 与功能块 SeatGridBlock 同构 — 两列一行, 奇数尾行
    // 补等宽空占位保持格宽。
    const rows: PrimItem[][] = [];
    for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
    return (
      <View style={styleOf(node)}>
        {rows.map((row, ri) => (
          <View key={ri} style={primStyles.seatRowWrap as object}>
            {row.map((item, ci) => (
              <PrimNodeView key={ci} node={bindNode(tpl, item)} ctx={ctx} />
            ))}
            {row.length === 1 ? <View style={primStyles.seatCellSpacer as object} /> : null}
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={styleOf(node)}>
      {items.map((item, i) => (
        <PrimNodeView key={i} node={bindNode(tpl, item)} ctx={ctx} />
      ))}
    </View>
  );
}

function PrimTabs({ node, ctx }: { node: PrimNode; ctx: Ctx }) {
  const [idx, setIdx] = useState(0);
  const tabs = node.tabs ?? [];
  if (!tabs.length) return null;
  const cur = Math.min(idx, tabs.length - 1);
  return (
    <View style={styleOf(node)}>
      <View style={primStyles.primTabs as object}>
        {tabs.map((tb, i) => (
          <Pressable
            key={i}
            onPress={() => setIdx(i)}
            style={[primStyles.primTab, i === cur ? primStyles.primTabOn : null] as object}
          >
            <Text style={[primStyles.primTabText, i === cur ? primStyles.primTabTextOn : null] as object}>
              {tb.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {(tabs[cur]?.c ?? []).map((n, i) => (
        <PrimNodeView key={i} node={n} ctx={ctx} />
      ))}
    </View>
  );
}

function PrimNodeView({ node, ctx }: { node: PrimNode; ctx: Ctx }): React.ReactElement | null {
  switch (node.t) {
    case 'txt': {
      if (node.x == null) return null;
      const st = styleOf(node);
      if (!st) return <FallbackBox />;
      return (
        <Text style={st} numberOfLines={node.lines ?? undefined}>
          {node.x}
        </Text>
      );
    }
    case 'chip': {
      if (node.x == null) return null;
      const tok = chipTokens[node.s ?? 'chip'] ?? chipTokens.chip;
      if (!tok) return <FallbackBox />;
      return (
        <View style={tok.box}>
          <Text style={tok.text}>{node.x}</Text>
        </View>
      );
    }
    case 'col':
    case 'row': {
      // s 缺省 = 无样式纯容器 (press 收编样式后的内层); s 未知 → Fallback。
      if (node.s && !primStyles[node.s]) return <FallbackBox />;
      const style: object[] = [];
      if (node.s) style.push(primStyles[node.s]);
      if (node.gap) style.push({ gap: spaceScale[node.gap] ?? spaceScale.md });
      if (node.wrap) style.push({ flexWrap: 'wrap' });
      const fill = fillFor(node.s);
      return (
        <View style={style.length ? style : undefined}>
          {fill === 'card' ? <CardFill /> : fill === 'gold' ? <GoldFill /> : null}
          <Children node={node} ctx={ctx} />
        </View>
      );
    }
    case 'press': {
      const child = node.c?.[0];
      if (!child) return null;
      const action = typeof node.a === 'object' ? (node.a as PrimAction) : null;
      if (!action) {
        // 无动作 (绑定为 null / 服务端置空): 退化为普通容器, 子节点
        // 自带样式直接参与布局 — 与座位格不可点态同构。
        return <PrimNodeView node={child} ctx={ctx} />;
      }
      if (child.t !== 'col' && child.t !== 'row') {
        // 非容器子节点 (文本钮等): Pressable 不收编样式, 自然内容宽。
        return (
          <Pressable onPress={() => dispatchPrim(action, ctx.handlers)}>
            <PrimNodeView node={child} ctx={ctx} />
          </Pressable>
        );
      }
      // 容器子节点: Pressable 收编子容器的样式令牌 (与积木版
      // ActionPressable 单元素带样式同构 — flex/边框/内距只落一层,
      // 被点区域与视觉区域同形), 子容器以无样式形态渲染其内容
      // (gap/wrap 等节点级布局 props 保留, 填充层随之进 Pressable)。
      if (child.s && !primStyles[child.s]) return <FallbackBox />;
      const fill = fillFor(child.s);
      return (
        <Pressable style={child.s ? (primStyles[child.s] as object) : undefined} onPress={() => dispatchPrim(action, ctx.handlers)}>
          {fill === 'card' ? <CardFill /> : fill === 'gold' ? <GoldFill /> : null}
          <PrimNodeView node={{ ...child, s: undefined }} ctx={ctx} />
        </Pressable>
      );
    }
    case 'list':
      return <PrimList node={node} ctx={ctx} />;
    case 'sp': {
      const h = spaceScale[node.s ?? 'md'];
      if (h === undefined) return <FallbackBox />;
      return <View style={{ height: h }} />;
    }
    case 'div': {
      const st = styleOf(node) ?? primStyles.divider;
      return <View style={st as object} />;
    }
    case 'img': {
      if (!node.uri) return null;
      const st = styleOf(node);
      if (!st) return <FallbackBox />;
      return <Image source={{ uri: node.uri }} style={st as object} />;
    }
    case 'tabs':
      return <PrimTabs node={node} ctx={ctx} />;
    case 'island':
      return <IslandNode node={node} />;
    case 'fallback':
      return <FallbackBox text={node.x ?? undefined} />;
    default:
      return <FallbackBox />;
  }
}

export function PrimTreeView({ nodes, handlers }: { nodes: PrimNode[]; handlers: ActionHandlers }) {
  const ctx: Ctx = { handlers };
  return (
    <>
      {nodes.map((n, i) => (
        <PrimNodeView key={i} node={n} ctx={ctx} />
      ))}
    </>
  );
}
