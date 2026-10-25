import React from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { BannerBlockFragment } from '../fragments';
import type { fragments_BannerBlock$key } from '@yanyun/blocks-core';
import { blockStyles } from './styles';

export default function BannerBlockView(props: { BannerBlock: fragments_BannerBlock$key }) {
  const data = useFragment(BannerBlockFragment, props.BannerBlock);
  return (
    <View style={blockStyles.banner}>
      <Text style={blockStyles.bannerText}>📣 {data.text}</Text>
    </View>
  );
}
