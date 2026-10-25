import React from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { FallbackBlockFragment } from '../fragments';
import type { fragments_FallbackBlock$key } from '@yanyun/blocks-core';
import { blockStyles } from './styles';

// 服务端版本兜底对象: 客户端 blocksVersion 低于某积木所需版本时,
// 服务端以 FallbackBlock 替代下发, 老客户端渲染成一条升级提示。
export default function FallbackBlockView(props: { FallbackBlock: fragments_FallbackBlock$key }) {
  const data = useFragment(FallbackBlockFragment, props.FallbackBlock);
  return (
    <View style={blockStyles.fallback}>
      <Text style={blockStyles.fallbackText}>{data.text}</Text>
    </View>
  );
}
