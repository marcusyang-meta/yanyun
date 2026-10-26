import React from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { FallbackBlockFragment } from '../fragments';
import type { fragments_FallbackBlock$key } from '@yanyun/blocks-core';
import { blockStyles } from './styles';

// Server version fallback: when the client's blocksVersion is below a
// block's required version, the server sends FallbackBlock instead and
// old clients render it as an upgrade prompt.
export default function FallbackBlockView(props: { FallbackBlock: fragments_FallbackBlock$key }) {
  const data = useFragment(FallbackBlockFragment, props.FallbackBlock);
  return (
    <View style={blockStyles.fallback}>
      <Text style={blockStyles.fallbackText}>{data.text}</Text>
    </View>
  );
}
