import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { setToken } from '../storage';
import { useSession } from '../session';
import { theme } from '../theme';

// OAuth 深链回跳的兜底落点：正常路径下 openAuthSessionAsync 会在浏览器
// 会话内截获 yanyun://auth-callback 并把 URL 交回 loginWithDiscord；
// 若 App 是被深链冷启动的，则由这个路由接住 token 存好再回首页。
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
