import React, { Suspense, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery, useMutation } from 'react-relay';
import { fonts, theme } from '../theme';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import { AvailabilityPageQuery, SetMyAvailabilityMutation } from '../documents';
import { fill } from '../gear/bits';
import type { documentsAvailabilityPageQuery } from '../__generated__/documentsAvailabilityPageQuery.graphql';

// Availability editor as a dialog PAGE under Profile (marcus,
// 2026-10-27: availability is personal data; its editor lives in
// personal settings, not on the guild schedule tab) — the same
// single-layer Modal form as GearLibraryDialog: Profile is a route
// page, so this Modal is the only layer. It is also opened from the
// newcomer checklist's availability step (GuildRecruitScreen) — one
// editor, one data path: the settingsPage shell composes per-guild
// slot sets and writes go through setMyAvailability, exactly like
// the web SettingsDialog availability page.
// Slots travel as UTC weekday/minutes and are edited as local HH:MM
// text (the mobile time-entry pattern): conversion anchors on the
// current week's Sunday, same rules as web; a window crossing a UTC
// day boundary clamps to that day's 24:00.

interface UtcSlot { weekday: number; startMinute: number; endMinute: number }
interface LocalSlot { weekday: number; start: string; end: string }

function refSunday(): Date {
  const n = new Date();
  const d = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}
const hhmm = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
const parseHhmm = (v: string) => {
  const [h, m] = String(v || '').split(':').map((x) => parseInt(x, 10) || 0);
  return (h || 0) * 60 + (m || 0);
};

function utcToLocal(slot: UtcSlot): LocalSlot {
  const base = refSunday();
  const y = base.getFullYear(), m = base.getMonth(), d = base.getDate();
  const start = new Date(Date.UTC(y, m, d + slot.weekday, 0, slot.startMinute));
  const end = new Date(Date.UTC(y, m, d + slot.weekday, 0, slot.endMinute));
  return {
    weekday: start.getDay(),
    start: hhmm(start.getHours() * 60 + start.getMinutes()),
    end: hhmm(end.getHours() * 60 + end.getMinutes()),
  };
}

function localToUtc(slot: LocalSlot): UtcSlot {
  const base = refSunday();
  const start = new Date(base);
  start.setDate(base.getDate() + slot.weekday);
  start.setMinutes(parseHhmm(slot.start), 0, 0);
  const end = new Date(base);
  end.setDate(base.getDate() + slot.weekday);
  end.setMinutes(parseHhmm(slot.end), 0, 0);
  if (end <= start) end.setDate(end.getDate() + 1);
  const startUtcMin = start.getUTCHours() * 60 + start.getUTCMinutes();
  const endUtcMinRaw = end.getUTCHours() * 60 + end.getUTCMinutes();
  const endUtcDay = end.getUTCDay();
  const startUtcDay = start.getUTCDay();
  const endMinute = endUtcDay === startUtcDay && endUtcMinRaw > startUtcMin
    ? endUtcMinRaw
    : 1440;
  return { weekday: startUtcDay, startMinute: startUtcMin, endMinute };
}

export default function AvailabilityDialog({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [epoch, setEpoch] = useState(0);
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.root}>
        <AsyncBoundary key={epoch} onRetry={() => setEpoch((e) => e + 1)}>
          <Suspense fallback={<LoadingView />}>
            <AvailabilityInner topInset={insets.top} bottomInset={insets.bottom} onClose={onClose} />
          </Suspense>
        </AsyncBoundary>
      </View>
    </Modal>
  );
}

function AvailabilityInner({ topInset, bottomInset, onClose }: {
  topInset: number;
  bottomInset: number;
  onClose: () => void;
}) {
  const data = useLazyLoadQuery<documentsAvailabilityPageQuery>(
    AvailabilityPageQuery, {}, { fetchPolicy: 'store-or-network' },
  );
  const page: any = data.settingsPage;
  const unknownError: string = (data as any)?.viewer?.commonUnknownErrorText ?? '';
  const guilds: any[] = page?.availabilityGuilds ?? [];
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
        <Text style={s.title}>{page?.availabilityTitle}</Text>
        <View style={{ width: 22 }} />
      </View>
      <Text style={s.hint}>{page?.availabilityHint}</Text>
      {!guilds.length && <Text style={s.muted}>{page?.availabilityNoGuildsText}</Text>}
      {guilds.map((g: any) => (
        <GuildAvailabilityEditor key={g.slug} guild={g} page={page} unknownError={unknownError} />
      ))}
    </ScrollView>
  );
}

function GuildAvailabilityEditor({ guild, page, unknownError }: {
  guild: any;
  page: any;
  unknownError: string;
}) {
  const weekdayNames: string[] = page?.availabilityWeekdayNames ?? [];
  const [mySlots, setMySlots] = useState<LocalSlot[] | null>(null);
  const slots: LocalSlot[] = mySlots ?? (guild.slots ?? []).map((x: UtcSlot) => utcToLocal(x));
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [commit, inFlight] = useMutation<any>(SetMyAvailabilityMutation);

  const save = () => {
    const utc = slots
      .filter((x) => parseHhmm(x.end) > parseHhmm(x.start))
      .map((x) => localToUtc(x));
    setNotice('');
    setError('');
    commit({
      variables: { input: { slug: guild.slug, slots: utc } },
      onCompleted: (res: any) => {
        if (res.setMyAvailability?.ok) {
          setNotice(page?.availabilitySavedText ?? '');
          // Mirror the server's normalized (sorted, UTC) set back
          // into local time, like the web editor.
          setMySlots((res.setMyAvailability.slots ?? []).map((x: UtcSlot) => utcToLocal(x)));
        } else {
          setError(fill(page?.availabilitySaveFailedTemplate ?? '', { error: res.setMyAvailability?.error || unknownError }));
        }
      },
      onError: (e: any) => setError(fill(page?.availabilitySaveFailedTemplate ?? '', { error: e.message })),
    });
  };

  return (
    <View style={{ marginBottom: 26 }}>
      <Text style={s.guildName}>{guild.guildName}</Text>
      {[0, 1, 2, 3, 4, 5, 6].map((wd) => (
        <View key={wd} style={s.dayRow}>
          <Text style={s.dayName}>{weekdayNames[wd] ?? ''}</Text>
          <View style={{ flex: 1, gap: 6 }}>
            {slots.map((slot, i) => (slot.weekday === wd ? (
              <View key={i} style={s.slotRow}>
                <TextInput
                  style={s.timeInput}
                  value={slot.start}
                  onChangeText={(v) => setMySlots(slots.map((x, xi) => (xi === i ? { ...x, start: v } : x)))}
                  placeholder="19:00"
                  autoCapitalize="none"
                  keyboardType="numbers-and-punctuation"
                />
                <Text style={s.muted}>–</Text>
                <TextInput
                  style={s.timeInput}
                  value={slot.end}
                  onChangeText={(v) => setMySlots(slots.map((x, xi) => (xi === i ? { ...x, end: v } : x)))}
                  placeholder="22:00"
                  autoCapitalize="none"
                  keyboardType="numbers-and-punctuation"
                />
                <Pressable onPress={() => setMySlots(slots.filter((_, xi) => xi !== i))} hitSlop={6}>
                  <Text style={s.removeText}>{page?.availabilityRemoveLabel}</Text>
                </Pressable>
              </View>
            ) : null))}
          </View>
          <Pressable
            onPress={() => setMySlots([...slots, { weekday: wd, start: '19:00', end: '22:00' }])}
            hitSlop={6}
          >
            <Text style={s.addText}>{page?.availabilityAddSlotLabel}</Text>
          </Pressable>
        </View>
      ))}
      {!slots.length && <Text style={s.muted}>{page?.availabilityEmptyText}</Text>}
      {!!notice && <Text style={s.saved}>✓ {notice}</Text>}
      {!!error && <Text style={s.error}>{error}</Text>}
      <Pressable style={[s.goldBtn, inFlight && { opacity: 0.6 }]} disabled={inFlight} onPress={save}>
        <Text style={s.goldBtnText}>{page?.availabilitySaveLabel}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  back: { color: theme.gold, fontSize: 30, lineHeight: 32, width: 22 },
  title: { flex: 1, textAlign: 'center', fontFamily: fonts.brush, color: theme.goldHi, fontSize: 22, letterSpacing: 2 },
  hint: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, lineHeight: 22, marginBottom: 18 },
  muted: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13 },
  guildName: { fontFamily: fonts.serif, color: theme.paper, fontSize: 15.5, marginBottom: 12 },
  dayRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 8 },
  dayName: { width: 40, fontFamily: fonts.serif, fontSize: 13.5, color: theme.paper, paddingTop: 9 },
  slotRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  timeInput: {
    width: 84, backgroundColor: '#1e1b15', borderWidth: 1, borderColor: 'rgba(201,163,92,.3)',
    color: theme.paper, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10,
    fontFamily: fonts.serif, fontSize: 14,
  },
  removeText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 12, borderWidth: 1, borderColor: theme.gold, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 9 },
  addText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 12, borderWidth: 1, borderColor: theme.gold, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 9 },
  saved: { fontFamily: fonts.serif, color: '#7fb069', fontSize: 13, marginTop: 10 },
  error: { fontFamily: fonts.serif, color: theme.danger, fontSize: 13, marginTop: 10 },
  goldBtn: {
    marginTop: 14, alignSelf: 'flex-start', borderRadius: 10,
    backgroundColor: 'rgba(201,163,92,.18)', borderWidth: 1, borderColor: theme.gold,
    paddingVertical: 9, paddingHorizontal: 26,
  },
  goldBtnText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 14 },
});
