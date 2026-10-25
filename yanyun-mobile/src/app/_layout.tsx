import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { RelayEnvironmentProvider } from 'react-relay';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from '../session';
import { relayEnvironment } from '../relay';
import { theme } from '../theme';
import { useNotificationObserver } from '../push';

export default function RootLayout() {
  // 推送通知点击 (含冷启动被点开) -> 直达对应车队详情页
  useNotificationObserver();
  // 与 Web 同一套字体: Ma Shan Zheng 只做展示 (标题/印章),
  // Noto Serif SC 做正文 (同族四权重, 样式里以 fontWeight 选面)。
  const [fontsLoaded, fontError] = useFonts([
    {
      fontFamily: 'MaShanZheng',
      fontDefinitions: [
        { path: require('../../assets/fonts/MaShanZheng-Regular.ttf') },
      ],
    },
    {
      fontFamily: 'NotoSerifSC',
      fontDefinitions: [
        { path: require('../../assets/fonts/NotoSerifSC-Regular.ttf'), weight: 400 },
        { path: require('../../assets/fonts/NotoSerifSC-SemiBold.ttf'), weight: 600 },
        { path: require('../../assets/fonts/NotoSerifSC-Bold.ttf'), weight: 700 },
        { path: require('../../assets/fonts/NotoSerifSC-Black.ttf'), weight: 900 },
      ],
    },
  ]);
  if (!fontsLoaded && !fontError) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: theme.bg }} />
      </SafeAreaProvider>
    );
  }
  return (
    <SafeAreaProvider>
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <SessionProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.bg },
            }}
          />
        </SessionProvider>
      </RelayEnvironmentProvider>
    </SafeAreaProvider>
  );
}
