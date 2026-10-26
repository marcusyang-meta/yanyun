// 原语岛注册表 (冻结词汇 island 节点的宿主实现)。
// 岛 = 状态型原生复合体: 报名 modal、发车/编辑表单、OCR、配装台。
// 这些交互本期仍由屏幕级原生代码承载 (经动作处理器触发), 树里不
// 出现 island 节点; 第二批若有展示面需要把岛嵌进树里, 在这里登记
// id → 组件即可, 无需改解释器。未登记的 island 一律渲染占位
// (与 Fallback 同构: 只占这一格, 不炸整页)。
import React from 'react';
import { Text, View } from 'react-native';
import type { PrimNode } from '@yanyun/blocks-core';
import { primStyles } from './styles';

export type IslandComponent = (props: { node: PrimNode }) => React.ReactElement | null;

export const ISLANDS: Record<string, IslandComponent> = {};

export function IslandNode({ node }: { node: PrimNode }) {
  const Cmp = node.id ? ISLANDS[node.id] : undefined;
  if (Cmp) return <Cmp node={node} />;
  return (
    <View style={primStyles.fallback}>
      <Text style={primStyles.unknownText}>该内容需要更新 App 后显示</Text>
    </View>
  );
}
