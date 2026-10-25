import React from 'react';
import { Text } from 'react-native';
import { useFragment } from 'react-relay';
import { EmptyStateBlockFragment } from '../fragments';
import type { fragments_EmptyStateBlock$key } from '@yanyun/blocks-core';
import { blockStyles } from './styles';

export default function EmptyStateBlockView(props: { EmptyStateBlock: fragments_EmptyStateBlock$key }) {
  const data = useFragment(EmptyStateBlockFragment, props.EmptyStateBlock);
  return <Text style={blockStyles.empty}>{data.text}</Text>;
}
