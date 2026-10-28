import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSession } from '../session';
import { theme } from '../theme';
import LoginScreen from '../screens/LoginScreen';
import GuildsScreen from '../screens/GuildsScreen';

// Entry gate: with a session -> guild list; without -> Discord login.
// (SessionProvider re-validates the session against the backend viewer; an invalid session is cleared automatically.)
export default function Home() {
  const { ready, user } = useSession();
  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }
  return user ? <GuildsScreen /> : <LoginScreen />;
}
