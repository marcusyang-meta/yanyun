import React, { Suspense, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery } from 'react-relay';
import { fonts, theme } from '../theme';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import { GearPageQuery } from '../documents';
import GearLibrary from '../gear/GearLibrary';
import { GearToastHost } from '../gear/bits';
import { GoldDustHost } from '../gear/GearSeal';
import type { documentsGearPageQuery } from '../__generated__/documentsGearPageQuery.graphql';

// Gear library as a dialog PAGE (marcus, 2026-10-27), replacing the /gear
// push route: a single page-level Modal that Profile opens in place.
// Profile is a route page (not a dialog), so this Modal is the only
// layer — nothing stacks it on another dialog. Slide-up presentation,
// full-screen sheet in the form language of the gear sheets (GradCalc /
// SheetSelect): header (back chevron + library title), then the complete
// GearLibrary in profile mode (its own header with count / add-gear
// panel / management row / slot filter, the item grid, my builds below).
// Same GearLibrary implementation and per-account backend storage the
// bench uses — no second implementation. Toast and gold-dust hosts live
// inside the Modal so library feedback renders within this layer.
export default function GearLibraryDialog({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [epoch, setEpoch] = useState(0);
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.root}>
        <AsyncBoundary key={epoch} onRetry={() => setEpoch((e) => e + 1)}>
          <Suspense fallback={<LoadingView />}>
            <GearInner topInset={insets.top} bottomInset={insets.bottom} onClose={onClose} />
          </Suspense>
        </AsyncBoundary>
        <GearToastHost />
        <GoldDustHost />
      </View>
    </Modal>
  );
}

function GearInner({ topInset, bottomInset, onClose }: {
  topInset: number;
  bottomInset: number;
  onClose: () => void;
}) {
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
        <Pressable onPress={onClose} hitSlop={10}>
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
