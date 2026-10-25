import React from 'react';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { blockStyles } from './styles';

// Section 容器外壳 (两层 Section @module 组件共用): 标题 + children 排版。
export default function SectionView({ title, children }: { title: string | null; children: ReactNode }) {
  return (
    <View>
      {title ? <Text style={blockStyles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}
