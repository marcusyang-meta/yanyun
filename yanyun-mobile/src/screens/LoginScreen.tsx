import React, { useState } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, theme } from '../theme';
import { GoldFill } from '../components/ui';
import { loginWithDiscord } from '../auth';
import { useSession } from '../session';

// 登录页与 Web 同构 (.yy-hero-full): 全屏山水为底, 书法大标题与
// 说明浮于画上, 登录卡是浮在画上的毛玻璃卡 (.yy-login-card)。
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
    <ImageBackground
      source={require('../../assets/hero.jpg')}
      style={s.root}
      imageStyle={s.heroImg}
      resizeMode="cover"
    >
      {/* .yy-hero::after 的渐暗罩: 上透下沉入墨色 */}
      <LinearGradient
        colors={['rgba(12,11,9,.34)', 'rgba(12,11,9,.05)', 'rgba(12,11,9,.10)', 'rgba(12,11,9,.78)', '#0c0b09']}
        locations={[0, 0.34, 0.62, 0.88, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
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
                ? <ActivityIndicator color={theme.onGold} />
                : <Text style={s.btnText}>{text.loginButtonLabel ?? '使用 Discord 登录'}</Text>}
            </Pressable>
            {!!error && <Text style={s.error}>{error}</Text>}
            <Text style={s.foot}>{text.loginPrivacyText ?? '本站使用 Discord 登录。我们只读取你的昵称、头像和已加入的服务器列表，用于匹配百业成员身份，不会获取你的密码。'}</Text>
          </BlurView>
        </View>
      </View>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  heroImg: { top: '-18%' }, // 近似 Web object-position: center 32%
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: fonts.brush, color: theme.goldHi, fontSize: 56,
    letterSpacing: 10, textAlign: 'center',
    textShadowColor: 'rgba(201,163,92,.25)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 32,
  },
  sub: {
    fontFamily: fonts.serif, color: theme.paper, opacity: 0.85, fontSize: 15,
    letterSpacing: 2, marginTop: 18, textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,.85)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 14,
  },
  cardWrap: {
    width: '100%', maxWidth: 520, marginTop: 40, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.30)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.5, shadowRadius: 30,
    overflow: 'hidden',
  },
  card: { paddingVertical: 32, paddingHorizontal: 24, alignItems: 'center' },
  cardTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.loginCardFill },
  cardTitle: {
    fontFamily: fonts.serif, fontWeight: '600', color: theme.goldHi,
    fontSize: 17, letterSpacing: 2, marginBottom: 10,
  },
  cardBody: {
    fontFamily: fonts.serif, color: theme.muted, fontSize: 14,
    lineHeight: 25, textAlign: 'center', marginBottom: 24,
  },
  btn: {
    position: 'relative', overflow: 'hidden', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(236,210,143,.5)',
    paddingVertical: 13, paddingHorizontal: 34, minWidth: 240, alignItems: 'center',
  },
  btnBusy: { opacity: 0.7 },
  btnText: {
    fontFamily: fonts.serif, fontWeight: '700', color: theme.onGold,
    fontSize: 16, letterSpacing: 1,
  },
  error: { fontFamily: fonts.serif, color: theme.danger, marginTop: 16, fontSize: 14 },
  foot: {
    fontFamily: fonts.serif, color: theme.muted, fontSize: 12,
    lineHeight: 18, textAlign: 'center', marginTop: 18, maxWidth: 320,
  },
});
