import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, theme } from '../theme';
import { CardFill } from '../components/ui';
import { useSession } from '../session';
import { ApplicationBlock, NewcomerCard } from './HomeRecruitSection';

// Home recruit detail page (pushed from the platform home's recruit
// summary rows, ruling 2026-10-27): the home shows summaries only;
// the detail — a directory guild's application section (apply form
// / my application) or a newcomer entry's checklist + pairings —
// renders here, from the same session-carried Viewer.homeRecruit
// composition the home summarized. No new fetch and no new
// permission logic: an entry that is not in the composition (the
// guild closed recruitment, the viewer is not its audience) simply
// renders nothing under the header.
export default function HomeRecruitDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ slug?: string; kind?: string }>();
  const { homeRecruit } = useSession();
  const section = homeRecruit;
  const slug = String(params.slug || '');
  const isNewcomer = params.kind === 'newcomer';
  const guild = !isNewcomer
    ? section?.guilds.find((g) => g.slug === slug) ?? null
    : null;
  const entry = isNewcomer
    ? section?.myNewcomer.find((e) => e.slug === slug) ?? null
    : null;
  const title = guild?.name ?? entry?.guildName
    ?? (isNewcomer ? section?.newcomerTitle : section?.directoryTitle) ?? '';
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 12 + insets.top,
        paddingBottom: 32 + insets.bottom,
      }}
    >
      <View style={s.head}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={s.back}>‹</Text>
        </Pressable>
        <Text style={s.title}>{title}</Text>
        <View style={{ width: 22 }} />
      </View>
      {!!section && !!guild && !!guild.myApplicationSection && (
        <View style={s.card}>
          <CardFill />
          <ApplicationBlock
            section={section}
            slug={guild.slug}
            application={guild.myApplicationSection.application}
          />
        </View>
      )}
      {!!section && !!entry && (
        <NewcomerCard section={section} entry={entry} />
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  back: { fontFamily: fonts.serif, color: theme.gold, fontSize: 26, lineHeight: 30, width: 22 },
  title: {
    flex: 1, textAlign: 'center',
    fontFamily: fonts.brush, color: theme.goldHi, fontSize: 20, letterSpacing: 3,
  },
  card: {
    marginTop: 14, padding: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden',
    borderColor: 'rgba(201,163,92,.22)', backgroundColor: 'rgba(236,226,203,.03)',
  },
});
