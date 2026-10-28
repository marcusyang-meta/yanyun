import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { setToken } from '../storage';
import { useSession } from '../session';
import { theme } from '../theme';

// Fallback landing for OAuth deep links: normally openAuthSessionAsync
// intercepts yanyun://auth-callback inside the browser session and hands
// the URL back to loginWithDiscord; if a deep link cold-starts the app,
// this route stores the token and returns home.
export default function AuthCallback() {
  const params = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const { refresh } = useSession();

  useEffect(() => {
    (async () => {
      if (params.token) {
        await setToken(params.token);
        await refresh();
      }
      router.replace('/');
    })();
  }, [params.token, refresh, router]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={theme.gold} />
    </View>
  );
}
