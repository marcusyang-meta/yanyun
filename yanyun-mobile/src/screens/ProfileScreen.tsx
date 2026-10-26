import React, { Suspense, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery } from 'react-relay';
import { fonts, theme } from '../theme';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import { ProfilePageQuery } from '../documents';
import GearLibrary from '../gear/GearLibrary';
import { GearToastHost } from '../gear/bits';
import { GoldDustHost } from '../gear/GearSeal';
import { updateMyLocale } from '../api';
import { emitLocaleChanged, writePrefMirror } from '../locale';
import { useSession } from '../session';
import type { documentsProfilePageQuery } from '../__generated__/documentsProfilePageQuery.graphql';

// Profile (same content and switch semantics as Web Profile; a push page
// on mobile): identity (avatar + nickname + Discord account) + locale
// preference (stored per account in users.locale_pref; follow-device +
// five languages) + sign-out. All copy on this page comes from
// settingsPage / viewer shell fields per locale; this file holds no UI
// copy (language option labels are also backend settingsLang* fields).
// Switch flow mirrors Web: tapping first applies a local override (the
// control reflects it immediately) -> updateMyLocale -> on success,
// write the preference mirror, then fire the switch event; the relay
// layer refetches all registered queries with the new x-locale (incl.
// this page) and the UI switches language in place; once the server
// value catches up the override is dropped; on failure the override is
// dropped and the server error is shown.
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [epoch, setEpoch] = useState(0);
  return (
    <View style={s.root}>
      <AsyncBoundary key={epoch} onRetry={() => setEpoch((e) => e + 1)}>
        <Suspense fallback={<LoadingView />}>
          <ProfileInner topInset={insets.top} bottomInset={insets.bottom} />
        </Suspense>
      </AsyncBoundary>
      <GearToastHost />
      <GoldDustHost />
    </View>
  );
}

function ProfileInner({ topInset, bottomInset }: { topInset: number; bottomInset: number }) {
  const router = useRouter();
  const { user, signOut } = useSession();
  const data = useLazyLoadQuery<documentsProfilePageQuery>(
    ProfilePageQuery, {}, { fetchPolicy: 'store-or-network' },
  );
  const page = data.settingsPage;
  const viewer = data.viewer;
  const [picked, setPicked] = useState<string | null>(null);
  const [inFlight, setInFlight] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const serverCurrent: string = page?.localePref ?? 'AUTO';
  // The local override applies only while it differs from the server value;
  // once the server catches up it yields automatically (render-phase
  // derivation, no effect writing state back).
  const current = picked !== null && picked !== serverCurrent ? picked : serverCurrent;

  if (!page) return <LoadingView />;

  const options: { value: string; label: string }[] = [
    { value: 'AUTO', label: page.settingsAutoLabel },
    { value: 'zh-CN', label: page.settingsLangZhCnLabel },
    { value: 'zh-TW', label: page.settingsLangZhTwLabel },
    { value: 'en', label: page.settingsLangEnLabel },
    { value: 'es', label: page.settingsLangEsLabel },
    { value: 'fr', label: page.settingsLangFrLabel },
  ];

  const choose = async (value: string) => {
    if (inFlight || value === current) return;
    setPicked(value);
    setError('');
    setSaved(false);
    setInFlight(true);
    try {
      const payload = await updateMyLocale(value === 'AUTO' ? null : value);
      if (payload?.ok) {
        writePrefMirror(payload.localePref ?? null);
        emitLocaleChanged();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setPicked(null);
        setError(payload?.error || viewer?.commonUnknownErrorText || '');
      }
    } catch {
      setPicked(null);
      setError(viewer?.commonUnknownErrorText || '');
    } finally { setInFlight(false); }
  };

  const doSignOut = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await signOut();
    router.replace('/');
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 12 + topInset,
        paddingBottom: 32 + bottomInset,
      }}
    >
      <View style={s.head}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={s.back}>‹</Text>
        </Pressable>
        <Text style={s.title}>{page.settingsTitle}</Text>
        <View style={{ width: 22 }} />
      </View>

      {!!user && (
        <View style={s.identity}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarFallback]}>
              <Text style={s.avatarInitial}>{(user.name || '?').slice(0, 1)}</Text>
            </View>
          )}
          <View>
            <Text style={s.userName}>{user.name}</Text>
            <Text style={s.userMeta}>{page.settingsDiscordLabel} · {user.discordId}</Text>
          </View>
        </View>
      )}

      <Text style={s.langLabel}>{page.settingsLanguageLabel}</Text>
      <Text style={s.langHint}>{page.settingsLanguageHint}</Text>
      <View style={s.options}>
        {options.map((opt) => {
          const active = opt.value === current;
          return (
            <Pressable
              key={opt.value}
              style={[s.option, active && s.optionOn]}
              onPress={() => void choose(opt.value)}
              disabled={inFlight}
            >
              <Text style={[s.optionText, active && s.optionTextOn]}>{opt.label}</Text>
              {active && <Text style={s.optionDot}>●</Text>}
            </Pressable>
          );
        })}
      </View>
      {saved && <Text style={s.saved}>✓ {page.settingsSavedText}</Text>}
      {!!error && <Text style={s.error}>{error}</Text>}

      {/* My gear library / my builds: shares the GearLibrary implementation and
          per-account backend storage with the bench (profile mode); not a
          second implementation. */}
      <View style={s.gearZone}>
        <Suspense fallback={<LoadingView />}>
          <GearLibrary mode="profile" />
        </Suspense>
      </View>

      <View style={s.logoutZone}>
        <Pressable style={s.logoutBtn} onPress={() => void doSignOut()} disabled={loggingOut}>
          <Text style={s.logoutText}>
            {loggingOut ? viewer?.userBarLoggingOutLabel : viewer?.userBarLogoutLabel}
          </Text>
        </Pressable>
      </View>

      {/* Footer: unofficial disclaimer + terms/privacy links (copy from the
          backend; links open the site's legal pages, text is not bundled) */}
      <View style={s.footer}>
        {!!viewer?.footerDisclaimerText && <Text style={s.footerText}>{viewer.footerDisclaimerText}</Text>}
        <View style={s.footerLinks}>
          {!!viewer?.footerTermsLabel && (
            <Pressable onPress={() => void Linking.openURL('https://yanyun.app/terms')}>
              <Text style={s.footerLink}>{viewer.footerTermsLabel}</Text>
            </Pressable>
          )}
          {!!viewer?.footerPrivacyLabel && (
            <Pressable onPress={() => void Linking.openURL('https://yanyun.app/privacy')}>
              <Text style={s.footerLink}>{viewer.footerPrivacyLabel}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  back: { color: theme.gold, fontSize: 30, lineHeight: 32, width: 22 },
  title: { flex: 1, textAlign: 'center', fontFamily: fonts.brush, color: theme.goldHi, fontSize: 22, letterSpacing: 3 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: theme.gold },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(201,163,92,.12)' },
  avatarInitial: { color: theme.goldHi, fontSize: 19, fontFamily: fonts.serif },
  userName: { fontFamily: fonts.serif, color: theme.paper, fontSize: 16.5 },
  userMeta: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginTop: 2 },
  langLabel: { fontFamily: fonts.serif, color: theme.paper, fontSize: 16, marginBottom: 6 },
  langHint: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, lineHeight: 22, marginBottom: 16 },
  options: { gap: 8 },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,.02)', borderWidth: 1, borderColor: 'rgba(201,163,92,.25)',
  },
  optionOn: { backgroundColor: 'rgba(201,163,92,.14)', borderColor: theme.gold },
  optionText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14.5 },
  optionTextOn: { color: theme.goldHi },
  optionDot: { color: theme.gold, fontSize: 13 },
  saved: { fontFamily: fonts.serif, color: '#7fb069', fontSize: 13, marginTop: 14 },
  error: { fontFamily: fonts.serif, color: theme.danger, fontSize: 13, marginTop: 14 },
  gearZone: { borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.22)', marginTop: 26, paddingTop: 18 },
  logoutZone: { borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.22)', marginTop: 26, paddingTop: 18 },
  logoutBtn: {
    borderWidth: 1, borderColor: 'rgba(201,163,92,.4)', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  logoutText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 15 },
  footer: { marginTop: 30 },
  footerText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', gap: 22, marginTop: 10 },
  footerLink: { fontFamily: fonts.serif, color: theme.gold, fontSize: 13 },
});
