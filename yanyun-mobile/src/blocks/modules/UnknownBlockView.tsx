import React from 'react';
import { Text, View } from 'react-native';
import { blockStyles } from './styles';

// Placeholder when no @module arm matches (MatchContainer fallback /
// unknown loader reference): the server sent a block type this client
// doesn't know -- only this cell is stubbed, the rest is unaffected.
// Copy is a local host fallback, distinct from the backend copy of the
// server-sent FallbackBlock.
export default function UnknownBlockView() {
  return (
    <View style={blockStyles.fallback}>
      <Text style={blockStyles.fallbackText}>该内容需要更新 App 后显示</Text>
    </View>
  );
}
