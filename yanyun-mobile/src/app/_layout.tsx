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
  // Push notification taps (incl. cold-start opens) deep-link to the grouping detail page
  useNotificationObserver();
  // Same fonts as Web: Ma Shan Zheng is display-only (titles/seals);
  // Noto Serif SC is body text (four weights in one family, picked via fontWeight).
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
