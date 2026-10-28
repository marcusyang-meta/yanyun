import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { RelayEnvironmentProvider } from 'react-relay';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from '../session';
import { relayEnvironment } from '../relay';
import { theme } from '../theme';
import { useNotificationObserver } from '../push';

export default function RootLayout() {
  // Push notification taps (incl. cold-start opens) deep-link to the grouping detail page
  useNotificationObserver();
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
