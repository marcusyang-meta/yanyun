import React, { Suspense, useEffect, useRef, useState } from 'react';
import {
  Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchQuery, useLazyLoadQuery } from 'react-relay';
import { relayEnvironment } from '../relay';
import { fonts, theme } from '../theme';
import { Backdrop, GoldFill } from '../components/ui';
import { LoadingView } from '../components/AsyncBoundary';
import { CreateGuildPageQuery, SlugAvailableQuery } from '../documents';
import { createGuild, fetchViewer } from '../api';
import { useSession } from '../session';
import type { documentsCreateGuildPageQuery } from '../__generated__/documentsCreateGuildPageQuery.graphql';
import type { documentsSlugAvailableQuery } from '../__generated__/documentsSlugAvailableQuery.graphql';

// Create guild (self-serve onboarding): mirrors Web CreateGuildPage and
// its contract -- name + slug + binding one Discord server I can manage.
// The server list is filtered by the backend (manageable only), slug
// availability is judged by a backend query, and creation re-validates
// server-side. All copy comes from the backend viewer's create* fields.
export default function CreateGuildScreen() {
  return (
    <Suspense fallback={<LoadingView />}>
      <CreateGuildForm />
    </Suspense>
  );
}

function CreateGuildForm() {
  const data = useLazyLoadQuery<documentsCreateGuildPageQuery>(
    CreateGuildPageQuery,
    {},
    { fetchPolicy: 'store-or-network' },
  );
  const viewer = data.viewer;
  const servers = viewer?.discordServers ?? [];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const session = useSession();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [serverId, setServerId] = useState('');
  const [slugState, setSlugState] = useState<'idle' | 'checking' | 'ok' | 'bad'>('idle');
  const [slugOkMessage, setSlugOkMessage] = useState('');
  const [committing, setCommitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Slug input: after normalization, debounce-ask the backend for
  // availability (judgment and copy are backend-side); the checking state
  // is set in the input handler, the effect only debounces and fills results.
  const onSlugChange = (t: string) => {
    const v = t.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(v);
    setSlugState(v ? 'checking' : 'idle');
  };
  useEffect(() => {
    const v = slug.trim().toLowerCase();
    if (!v) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetchQuery<documentsSlugAvailableQuery>(relayEnvironment, SlugAvailableQuery, { slug: v })
        .toPromise()
        .then((res) => {
          if (res?.slugAvailable) {
            setSlugOkMessage(res?.viewer?.slugAvailableMessage ?? '');
            setSlugState('ok');
          } else {
            setSlugState('bad');
          }
        })
        .catch(() => setSlugState('idle'));
    }, 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [slug]);

  const submit = async () => {
    const n = name.trim();
    const sl = slug.trim().toLowerCase();
    if (n.length < 2) { Alert.alert(viewer?.createToastNameShort ?? ''); return; }
    if (!sl) { Alert.alert(viewer?.createToastSlugRequired ?? ''); return; }
    if (slugState === 'bad') { Alert.alert(viewer?.createToastSlugBad ?? ''); return; }
    if (!serverId) { Alert.alert(viewer?.createToastServerRequired ?? ''); return; }
    setCommitting(true);
    try {
      const res = await createGuild({ name: n, slug: sl, discordGuildId: serverId });
      if (res.ok && res.guild?.slug) {
        const fresh = await fetchViewer().catch(() => null);
        await session.refresh().catch(() => {});
        const g = fresh?.guilds.find((x) => x.slug === res.guild?.slug);
        Alert.alert(viewer?.createToastCreated ?? '');
        router.replace({
          pathname: '/guild/[slug]',
          params: {
            slug: res.guild.slug,
            name: res.guild.name || g?.name || '',
            readOnly: '0',
            nick: g?.viewerNick || '',
            version: g?.gameVersion || '',
            avatar: g?.avatarUrl || '',
          },
        });
      } else {
        Alert.alert(res.error || viewer?.createToastFailed || '');
      }
    } catch {
      Alert.alert(viewer?.createToastFailed ?? '');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <View style={s.root}>
      <Backdrop />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16 + insets.top, paddingBottom: 40 + insets.bottom, paddingHorizontal: 20 }}
      >
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={s.back}>{viewer?.createBackLinkLabel}</Text>
        </Pressable>
        <Text style={s.title}>{viewer?.createTitle}</Text>
        <Text style={s.subtitle}>{viewer?.createSubtitle}</Text>

        <View style={s.card}>
          <Text style={s.label}>{viewer?.createNameLabel}</Text>
          <TextInput
            style={s.input}
            value={name}
            maxLength={20}
            onChangeText={setName}
            placeholder={viewer?.createNamePlaceholder ?? undefined}
            placeholderTextColor={theme.muted}
          />

          <Text style={s.label}>{viewer?.createSlugLabel}</Text>
          <TextInput
            style={s.input}
            value={slug}
            maxLength={40}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onSlugChange}
            placeholder={viewer?.createSlugPlaceholder ?? undefined}
            placeholderTextColor={theme.muted}
          />
          <Text style={[
            s.slugStatus,
            slugState === 'ok' ? s.slugOk : slugState === 'bad' ? s.slugBad : null,
          ]}>
            {slugState === 'checking' && viewer?.createSlugCheckingText}
            {slugState === 'ok' && slugOkMessage}
            {slugState === 'bad' && viewer?.createSlugTakenText}
            {slugState === 'idle' && viewer?.createSlugNote}
          </Text>

          <Text style={s.label}>{viewer?.createServerLabel}</Text>
          {servers.length === 0 ? (
            <View style={s.noServers}>
              <Text style={s.noServersText}>{viewer?.createNoServers1}{'\n'}{viewer?.createNoServers2}</Text>
            </View>
          ) : (
            <View style={s.serverList}>
              {servers.map((sv) => {
                const active = serverId === sv.id;
                return (
                  <Pressable
                    key={sv.id}
                    onPress={() => setServerId(sv.id)}
                    style={[s.serverRow, active ? s.serverRowOn : s.serverRowOff]}
                  >
                    {sv.icon ? (
                      <Image
                        source={{ uri: `https://cdn.discordapp.com/icons/${sv.id}/${sv.icon}.png` }}
                        style={s.serverIcon}
                      />
                    ) : (
                      <View style={s.serverLetter}>
                        <Text style={s.serverLetterText}>{(sv.name || '?').slice(0, 1)}</Text>
                      </View>
                    )}
                    <Text style={s.serverName}>{sv.name}</Text>
                    {active && <Text style={s.serverCheck}>✓</Text>}
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable
            style={[s.submit, (committing || servers.length === 0) && s.submitDisabled]}
            onPress={submit}
            disabled={committing || servers.length === 0}
          >
            <GoldFill />
            <Text style={s.submitText}>{committing ? viewer?.createSubmittingLabel : viewer?.createSubmitLabel}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  back: { fontFamily: fonts.body, color: theme.muted, fontSize: 14 },
  title: {
    fontFamily: fonts.display, fontWeight: '700', color: theme.paper, fontSize: 32,
    letterSpacing: 3, marginTop: 22,
  },
  subtitle: { fontFamily: fonts.body, color: theme.muted, fontSize: 13.5, marginTop: 6, marginBottom: 24 },
  card: {
    backgroundColor: theme.ink2, borderWidth: 1, borderColor: theme.cardBorder,
    borderRadius: 12, paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26,
  },
  label: {
    fontFamily: fonts.body, color: theme.accent, fontSize: 13.5,
    letterSpacing: 1, marginTop: 20, marginBottom: 8,
  },
  input: {
    backgroundColor: theme.inputFill, borderWidth: 1, borderColor: theme.border,
    borderRadius: 10, color: theme.paper, fontFamily: fonts.body, fontSize: 16,
    paddingHorizontal: 16, paddingVertical: 13,
  },
  slugStatus: { fontFamily: fonts.body, color: theme.muted, fontSize: 12.5, marginTop: 6 },
  slugOk: { color: '#9db87c' },
  slugBad: { color: '#d08a7a' },
  noServers: {
    borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(67,160,134,.3)',
    borderRadius: 10, paddingVertical: 14, paddingHorizontal: 16,
  },
  noServersText: { fontFamily: fonts.body, color: theme.muted, fontSize: 13.5, lineHeight: 24 },
  serverList: { gap: 8 },
  serverRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1,
  },
  serverRowOn: { backgroundColor: 'rgba(67,160,134,.14)', borderColor: theme.accent },
  serverRowOff: { backgroundColor: 'rgba(255,255,255,.02)', borderColor: 'rgba(67,160,134,.25)' },
  serverIcon: { width: 34, height: 34, borderRadius: 17 },
  serverLetter: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(67,160,134,.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  serverLetterText: { fontFamily: fonts.body, color: theme.accentHi, fontSize: 15 },
  serverName: { flex: 1, fontFamily: fonts.body, color: theme.paper, fontSize: 15 },
  serverCheck: { color: theme.accentHi, fontSize: 15 },
  submit: {
    position: 'relative', overflow: 'hidden', borderRadius: 10,
    marginTop: 28, paddingVertical: 13, alignItems: 'center',
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { fontFamily: fonts.body, color: theme.onAccent, fontSize: 16, fontWeight: '700' },
});
