import React from 'react';
import { Text } from 'react-native';
import { useFragment } from 'react-relay';
import { TextBlockFragment } from '../fragments';
import type { fragments_TextBlock$key } from '@yanyun/blocks-core';
import { blockStyles } from './styles';

// @module renderer: MatchContainer injects this node's data reference
// under a prop key named by the fragment suffix (TextBlock); handlers
// are passed through via props.
export default function TextBlockView(props: { TextBlock: fragments_TextBlock$key }) {
  const data = useFragment(TextBlockFragment, props.TextBlock);
  const st = data.variant === 'title' ? blockStyles.bTitle : data.variant === 'meta' ? blockStyles.bMeta : blockStyles.bMuted;
  return <Text style={st}>{data.text}</Text>;
}
