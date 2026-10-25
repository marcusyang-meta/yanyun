import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSession } from '../session';
import { theme } from '../theme';
import LoginScreen from '../screens/LoginScreen';
import GuildsScreen from '../screens/GuildsScreen';

// 入口闸口：有会话 → 百业列表；没有 → Discord 登录页。
// （会话有效性由 SessionProvider 向后端 viewer 复核，失效会自动清掉。）
export default function Home() {
  const { ready, user } = useSession();
  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.gold} />
      </View>
    );
  }
  return user ? <GuildsScreen /> : <LoginScreen />;
}
