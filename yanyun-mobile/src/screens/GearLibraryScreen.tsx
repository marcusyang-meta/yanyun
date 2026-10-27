import React, { Suspense, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery } from 'react-relay';
import { fonts, theme } from '../theme';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import { GearPageQuery } from '../documents';
import GearLibrary from '../gear/GearLibrary';
import { GearToastHost } from '../gear/bits';
import { GoldDustHost } from '../gear/GearSeal';
import type { documentsGearPageQuery } from '../__generated__/documentsGearPageQuery.graphql';

// Standalone gear library screen (push page; mirrors Web /gear). The
// library used to be embedded at the bottom of Profile, below the
// language list — it read as an appendix, not a library (marcus,
// 2026-10-27). It now owns a full screen: back + library title header,
// then the GearLibrary component (profile mode: its own header with
// count / add-gear panel / management row / slot filter, the item grid
// as the first content, my builds below). Profile keeps only an entry
// row that pushes here. Same GearLibrary implementation and per-account
// backend storage the bench uses — no second implementation.
export default function GearLibraryScreen() {
  const insets = useSafeAreaInsets();
  const [epoch, setEpoch] = useState(0);
  return (
    <View style={s.root}>
      <AsyncBoundary key={epoch} onRetry={() => setEpoch((e) => e + 1)}>
        <Suspense fallback={<LoadingView />}>
          <GearInner topInset={insets.top} bottomInset={insets.bottom} />
        </Suspense>
      </AsyncBoundary>
      <GearToastHost />
      <GoldDustHost />
    </View>
  );
}

function GearInner({ topInset, bottomInset }: { topInset: number; bottomInset: number }) {
  const router = useRouter();
  const data = useLazyLoadQuery<documentsGearPageQuery>(
    GearPageQuery, {}, { fetchPolicy: 'store-or-network' },
  );
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
        <Text style={s.title}>{data.gradPage?.gearMyLibTitle}</Text>
        <View style={{ width: 22 }} />
      </View>
      <Suspense fallback={<LoadingView />}>
        <GearLibrary mode="profile" />
      </Suspense>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  back: { color: theme.gold, fontSize: 30, lineHeight: 32, width: 22 },
  title: { flex: 1, textAlign: 'center', fontFamily: fonts.brush, color: theme.goldHi, fontSize: 22, letterSpacing: 3 },
});
