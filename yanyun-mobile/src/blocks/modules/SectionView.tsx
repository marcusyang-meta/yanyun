import React from 'react';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { blockStyles } from './styles';

// Section container shell (shared by both Section @module layers): title + children layout.
export default function SectionView({ title, children }: { title: string | null; children: ReactNode }) {
  return (
    <View>
      {title ? <Text style={blockStyles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}
