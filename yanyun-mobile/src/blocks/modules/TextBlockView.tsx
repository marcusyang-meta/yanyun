import React from 'react';
import { Text } from 'react-native';
import { useFragment } from 'react-relay';
import { TextBlockFragment } from '../fragments';
import type { fragments_TextBlock$key } from '@yanyun/blocks-core';
import { blockStyles } from './styles';

// @module 渲染组件: MatchContainer 以 fragment 名后缀为 prop 键
// (TextBlock) 注入本节点的数据引用, handlers 经 props 透传。
export default function TextBlockView(props: { TextBlock: fragments_TextBlock$key }) {
  const data = useFragment(TextBlockFragment, props.TextBlock);
  const st = data.variant === 'title' ? blockStyles.bTitle : data.variant === 'meta' ? blockStyles.bMeta : blockStyles.bMuted;
  return <Text style={st}>{data.text}</Text>;
}
