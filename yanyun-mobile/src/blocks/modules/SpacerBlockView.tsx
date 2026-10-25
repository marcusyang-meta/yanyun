import React from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { SpacerBlockFragment } from '../fragments';
import type { fragments_SpacerBlock$key } from '@yanyun/blocks-core';

export default function SpacerBlockView(props: { SpacerBlock: fragments_SpacerBlock$key }) {
  const data = useFragment(SpacerBlockFragment, props.SpacerBlock);
  return <View style={{ height: data.size ?? 12 }} />;
}
