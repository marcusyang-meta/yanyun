import React, { Suspense, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery } from 'react-relay';
import { fonts, theme } from '../theme';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import { GuildRecruitQuery } from '../documents';
import { applyToGuildRemote } from '../api';
import AvailabilityDialog from './AvailabilityDialog';
import type { documentsGuildRecruitQuery } from '../__generated__/documentsGuildRecruitQuery.graphql';

// Recruit page (mobile form of the Web /:slug/recruit page): F16 join
// applications (own status + the apply form for non-members), the
// F24 newcomer checklist for members, and the viewer's F17 pairings.
// The response type is the verdict — GuildRecruitLocked renders the
// locked card; every label is a backend copy field.
export default function GuildRecruitScreen({ slug }: { slug: string }) {
  const insets = useSafeAreaInsets();
  const [epoch, setEpoch] = useState(0);
  return (
    <View style={s.root}>
      <AsyncBoundary key={epoch} onRetry={() => setEpoch((e) => e + 1)}>
        <Suspense fallback={<LoadingView />}>
          <RecruitInner slug={slug} topInset={insets.top} bottomInset={insets.bottom} refresh={() => setEpoch((e) => e + 1)} />
        </Suspense>
      </AsyncBoundary>
    </View>
  );
}

function RecruitInner({ slug, topInset, bottomInset, refresh }: {
  slug: string; topInset: number; bottomInset: number; refresh: () => void;
}) {
  const router = useRouter();
  const data = useLazyLoadQuery<documentsGuildRecruitQuery>(
    GuildRecruitQuery, { slug }, { fetchPolicy: 'store-or-network' },
  );
  const page: any = (data as any)?.viewer?.guildRecruit;
  const unknownError = (data as any)?.viewer?.commonUnknownErrorText ?? '';
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [availOpen, setAvailOpen] = useState(false);

  if (!page) return <LoadingView />;

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const payload = await applyToGuildRemote(slug, message || undefined);
      if (payload?.ok) {
        setMessage('');
        refresh();
      } else {
        setError(payload?.error || unknownError);
      }
    } catch {
      setError(unknownError);
    } finally { setBusy(false); }
  };

  const head = (
    <View style={s.head}>
      <Pressable onPress={() => router.back()} hitSlop={10}>
        <Text style={s.back}>‹</Text>
      </Pressable>
      <Text style={s.headBack}>{page.backLabel}</Text>
    </View>
  );

  if (page.__typename === 'GuildRecruitLocked') {
    return (
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12 + topInset, paddingBottom: 32 + bottomInset }}>
        {head}
        <View style={s.card}>
          <Text style={{ fontSize: 34, textAlign: 'center', marginBottom: 10 }}>🔒</Text>
          <Text style={s.lockedTitle}>{page.lockedTitle}</Text>
          <Text style={s.body}>{page.lockedBody}</Text>
        </View>
      </ScrollView>
    );
  }

  const app = page.myApplication;
  const showApplyForm = !app || app.status === 'REJECTED';
  return (
    <>
    <ScrollView showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12 + topInset, paddingBottom: 32 + bottomInset }}>
      {head}
      <Text style={s.title}>{page.recruitTitle}</Text>
      <Text style={s.muted}>{page.guildName}</Text>
      <Text style={[s.body, { marginTop: 8 }]}>{page.recruitBody}</Text>

      {!!app && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>{page.myApplicationTitle}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={s.memberName}>{app.applicantName}</Text>
            <Text style={s.statusChip}>{app.statusLabel}</Text>
            <Text style={s.muted}>{app.createdAtText}</Text>
            {!!app.reviewedAtText && <Text style={s.muted}>{app.reviewedByName} · {app.reviewedAtText}</Text>}
          </View>
          {!!app.message && <Text style={[s.memberName, { marginTop: 6 }]}>{app.message}</Text>}
          {app.status === 'PENDING' && <Text style={[s.body, { marginTop: 8 }]}>{page.pendingHint}</Text>}
          {app.status === 'APPROVED' && <Text style={[s.memberName, { marginTop: 8, lineHeight: 22 }]}>{page.approvedNextStepText}</Text>}
          {app.status === 'REJECTED' && <Text style={[s.body, { marginTop: 8 }]}>{page.rejectedHint}</Text>}
        </View>
      )}

      {showApplyForm && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>{page.applySectionTitle}</Text>
          <Text style={s.label}>{page.messageLabel}</Text>
          <TextInput
            style={s.input}
            value={message}
            maxLength={200}
            multiline
            placeholder={page.messagePlaceholder}
            placeholderTextColor={theme.muted}
            onChangeText={setMessage}
          />
          {!!error && <Text style={s.error}>{error}</Text>}
          <Pressable style={[s.goldBtn, busy && { opacity: 0.6 }]} disabled={busy} onPress={() => { void submit(); }}>
            <Text style={s.goldBtnText}>{busy ? page.submittingLabel : page.submitLabel}</Text>
          </Pressable>
        </View>
      )}

      {!!page.checklist && (
        <View style={s.card}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
            <Text style={s.sectionTitle}>{page.checklistTitle}</Text>
            <Text style={s.muted}>{page.checklist.progressText}</Text>
          </View>
          {page.checklist.items.map((item: any) => {
            // The availability step is actionable until done: it opens
            // the same availability editor that lives under Profile
            // (one editor, one data path). The checklist never
            // blocks — skipping is simply not tapping it.
            const actionable = item.key === 'availability' && !item.done;
            const row = (
              <>
                <View style={{
                  width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderColor: item.done ? theme.accent : 'rgba(67,160,134,.3)',
                  backgroundColor: item.done ? 'rgba(67,160,134,.16)' : 'transparent',
                }}>
                  <Text style={{ fontSize: 12, color: item.done ? theme.accentHi : theme.muted }}>{item.done ? '✓' : ''}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{item.label}</Text>
                  <Text style={s.muted}>{item.hint}</Text>
                </View>
                {actionable && <Text style={{ color: theme.accent, fontSize: 19 }}>›</Text>}
              </>
            );
            return actionable ? (
              <Pressable key={item.key} onPress={() => setAvailOpen(true)} style={{ flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'flex-start' }}>
                {row}
              </Pressable>
            ) : (
              <View key={item.key} style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                {row}
              </View>
            );
          })}
        </View>
      )}

      {!!page.myPairings && page.myPairings.length > 0 && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>{page.myPairingsTitle}</Text>
          {page.myPairings.map((p: any) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              <Text style={s.muted}>{page.pairingMentorRoleLabel}</Text>
              <Text style={s.memberName}>{p.mentorName}</Text>
              <Text style={s.muted}>{page.pairingMenteeRoleLabel}</Text>
              <Text style={s.memberName}>{p.menteeName}</Text>
              <Text style={s.statusChip}>{p.statusLabel}</Text>
              <Text style={s.muted}>{p.createdAtText}</Text>
              {!!p.endedAtText && <Text style={s.muted}>{p.endedAtText}</Text>}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
    {availOpen && <AvailabilityDialog onClose={() => setAvailOpen(false)} />}
    </>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  back: { color: theme.accent, fontSize: 30, lineHeight: 32, width: 22 },
  headBack: { fontFamily: fonts.body, color: theme.muted, fontSize: 14 },
  title: { fontFamily: fonts.display, fontWeight: '700', color: theme.paper, fontSize: 26, letterSpacing: 1, marginBottom: 4 },
  lockedTitle: { fontFamily: fonts.body, color: theme.accentHi, fontSize: 17, textAlign: 'center', marginBottom: 10 },
  sectionTitle: { fontFamily: fonts.display, color: theme.accent, fontSize: 15, letterSpacing: 1, marginBottom: 10 },
  card: {
    marginTop: 16, padding: 16, borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(67,160,134,.22)', backgroundColor: 'rgba(236,226,203,.03)',
  },
  body: { fontFamily: fonts.body, color: theme.muted, fontSize: 13, lineHeight: 20 },
  muted: { fontFamily: fonts.body, color: theme.muted, fontSize: 12.5 },
  memberName: { fontFamily: fonts.body, color: theme.paper, fontSize: 14 },
  label: { fontFamily: fonts.body, color: theme.muted, fontSize: 12, marginBottom: 6 },
  input: {
    fontFamily: fonts.body, color: theme.paper, fontSize: 14, minHeight: 64,
    borderWidth: 1, borderColor: 'rgba(67,160,134,.3)', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9, textAlignVertical: 'top',
  },
  statusChip: {
    fontFamily: fonts.body, fontSize: 11, color: theme.muted,
    borderWidth: 1, borderColor: 'rgba(67,160,134,.3)', borderRadius: 999,
    paddingVertical: 1, paddingHorizontal: 8, overflow: 'hidden',
  },
  error: { fontFamily: fonts.body, color: '#e8a09a', fontSize: 13, marginTop: 8 },
  goldBtn: {
    marginTop: 12, alignSelf: 'flex-start', borderRadius: 10,
    backgroundColor: 'rgba(67,160,134,.18)', borderWidth: 1, borderColor: theme.accent,
    paddingVertical: 9, paddingHorizontal: 24,
  },
  goldBtnText: { fontFamily: fonts.body, color: theme.accentHi, fontSize: 14 },
});
