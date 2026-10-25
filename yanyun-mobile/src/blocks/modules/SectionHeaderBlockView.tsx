import React from 'react';
import { Text } from 'react-native';
import { useFragment } from 'react-relay';
import { SectionHeaderBlockFragment } from '../fragments';
import type { fragments_SectionHeaderBlock$key } from '@yanyun/blocks-core';
import { blockStyles } from './styles';

export default function SectionHeaderBlockView(props: { SectionHeaderBlock: fragments_SectionHeaderBlock$key }) {
  const data = useFragment(SectionHeaderBlockFragment, props.SectionHeaderBlock);
  return <Text style={blockStyles.sectionHeader}>{data.text}</Text>;
}
