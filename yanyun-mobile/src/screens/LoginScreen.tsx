import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, theme } from '../theme';
import { GoldFill } from '../components/ui';
import { loginWithDiscord } from '../auth';
import { useSession } from '../session';

// Login page mirrors Web (.yy-hero-full): brand title and login card
// centered on the flat page background (.yy-login-card).
export default function LoginScreen() {
  const { refresh, text } = useSession();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onLogin = async () => {
    setBusy(true); setError('');
    try {
      await loginWithDiscord();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '登录失败，请重试');
    } finally { setBusy(false); }
  };

  return (
    <View style={s.root}>
      <View style={[s.content, { paddingTop: 56 + insets.top, paddingBottom: 26 + insets.bottom }]}>
        <Text style={s.title}>{text.siteTitle ?? '百业集结'}</Text>
        <Text style={s.sub}>{text.siteSubtitle ?? '燕云十六声 · 国际服百业车队与攻略集散地 —— 择一业而入，共赴双十。'}</Text>

        <View style={s.cardWrap}>
          <BlurView intensity={30} tint="dark" style={s.card}>
            <View style={s.cardTint} pointerEvents="none" />
            <Text style={s.cardTitle}>{text.loginCardTitle ?? '先登录，再入江湖'}</Text>
            <Text style={s.cardBody}>
              {`${text.loginCardBody1 ?? '使用 Discord 账号登录。'}\n${text.loginCardBody2 ?? '登录后可查看所在服务器百业的车队并报名。'}`}
            </Text>
            <Pressable
              style={[s.btn, busy && s.btnBusy]}
              onPress={onLogin}
              disabled={busy}
            >
              <GoldFill />
              {busy
                ? <ActivityIndicator color={theme.onAccent} />
                : <Text style={s.btnText}>{text.loginButtonLabel ?? '使用 Discord 登录'}</Text>}
            </Pressable>
            {!!error && <Text style={s.error}>{error}</Text>}
            <Text style={s.foot}>{text.loginPrivacyText ?? '我们会读取并保存你的 Discord 昵称、头像、服务器列表与登录授权，用于成员校验与提醒功能，详见隐私政策'}</Text>
            {!!text.footerDisclaimerText && <Text style={s.disclaimer}>{text.footerDisclaimerText}</Text>}
          </BlurView>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: fonts.display, fontWeight: '700', color: theme.paper, fontSize: 38,
    letterSpacing: 2, textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.body, color: theme.muted, fontSize: 15,
    letterSpacing: 0.5, marginTop: 14, textAlign: 'center',
  },
  cardWrap: {
    width: '100%', maxWidth: 520, marginTop: 40, borderRadius: 12,
    borderWidth: 1, borderColor: theme.cardBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.5, shadowRadius: 30,
    overflow: 'hidden',
  },
  card: { paddingVertical: 32, paddingHorizontal: 24, alignItems: 'center' },
  cardTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.loginCardFill },
  cardTitle: {
    fontFamily: fonts.body, fontWeight: '600', color: theme.accentHi,
    fontSize: 17, letterSpacing: 2, marginBottom: 10,
  },
  cardBody: {
    fontFamily: fonts.body, color: theme.muted, fontSize: 14,
    lineHeight: 25, textAlign: 'center', marginBottom: 24,
  },
  btn: {
    position: 'relative', overflow: 'hidden', borderRadius: 10,
    borderWidth: 1, borderColor: 'transparent',
    paddingVertical: 13, paddingHorizontal: 34, minWidth: 240, alignItems: 'center',
  },
  btnBusy: { opacity: 0.7 },
  btnText: {
    fontFamily: fonts.body, fontWeight: '700', color: theme.onAccent,
    fontSize: 16, letterSpacing: 1,
  },
  error: { fontFamily: fonts.body, color: theme.danger, marginTop: 16, fontSize: 14 },
  foot: {
    fontFamily: fonts.body, color: theme.muted, fontSize: 12,
    lineHeight: 18, textAlign: 'center', marginTop: 18, maxWidth: 320,
  },
  disclaimer: {
    fontFamily: fonts.body, color: theme.muted, fontSize: 11, opacity: 0.75,
    lineHeight: 16, textAlign: 'center', marginTop: 10, maxWidth: 320,
  },
});
