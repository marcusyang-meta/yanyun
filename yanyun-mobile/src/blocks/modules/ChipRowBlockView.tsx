import React from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { ChipRowBlockFragment } from '../fragments';
import type { fragments_ChipRowBlock$key } from '@yanyun/blocks-core';
import { blockStyles } from './styles';

export default function ChipRowBlockView(props: { ChipRowBlock: fragments_ChipRowBlock$key }) {
  const data = useFragment(ChipRowBlockFragment, props.ChipRowBlock);
  return (
    <View style={blockStyles.chipRow}>
      {(data.chips ?? []).map((c, i) => (
        <View key={i} style={blockStyles.chip}>
          <Text style={blockStyles.chipText}>{c}</Text>
        </View>
      ))}
    </View>
  );
}
