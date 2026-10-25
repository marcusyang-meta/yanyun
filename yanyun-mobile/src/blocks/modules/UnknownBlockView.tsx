import React from 'react';
import { Text, View } from 'react-native';
import { blockStyles } from './styles';

// 无 @module 臂命中时的占位 (MatchContainer fallback / loader 未知引用):
// 服务端下发了本客户端不认识的积木类型 —— 只占位这一格, 不影响其余
// 内容。文案是宿主本地兜底, 与服务端 FallbackBlock 的后端文案区分。
export default function UnknownBlockView() {
  return (
    <View style={blockStyles.fallback}>
      <Text style={blockStyles.fallbackText}>该内容需要更新 App 后显示</Text>
    </View>
  );
}
