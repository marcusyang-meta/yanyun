import React, { Suspense, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery } from 'react-relay';
import { fonts, theme } from '../theme';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import { FeedbackPageQuery } from '../documents';
import { submitFeedback, type FeedbackCategoryInput } from '../api';
import type { documentsFeedbackPageQuery } from '../__generated__/documentsFeedbackPageQuery.graphql';

// Feedback (the mobile form of the Web Profile feedback view; a push
// page reached from Profile): category chips + free text, submitted
// through the submitFeedback mutation. The server validates, caps
// (rolling 24h per user) and stores the row for hub triage; its
// localized error returns on the payload and the success text is a
// settingsPage field — this file holds no UI copy.
export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const [epoch, setEpoch] = useState(0);
  return (
    <View style={s.root}>
      <AsyncBoundary key={epoch} onRetry={() => setEpoch((e) => e + 1)}>
        <Suspense fallback={<LoadingView />}>
          <FeedbackInner topInset={insets.top} bottomInset={insets.bottom} />
        </Suspense>
      </AsyncBoundary>
    </View>
  );
}

function FeedbackInner({ topInset, bottomInset }: { topInset: number; bottomInset: number }) {
  const router = useRouter();
  const data = useLazyLoadQuery<documentsFeedbackPageQuery>(
    FeedbackPageQuery, {}, { fetchPolicy: 'store-or-network' },
  );
  const page = data.settingsPage;
  const [category, setCategory] = useState<FeedbackCategoryInput>('PROBLEM');
  const [text, setText] = useState('');
  const [inFlight, setInFlight] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!page) return <LoadingView />;

  const categories: { value: FeedbackCategoryInput; label: string }[] = [
    { value: 'PROBLEM', label: page.feedbackCategoryProblemLabel },
    { value: 'SUGGESTION', label: page.feedbackCategorySuggestionLabel },
    { value: 'OTHER', label: page.feedbackCategoryOtherLabel },
  ];

  const submit = async () => {
    if (inFlight || !text.trim()) return;
    setInFlight(true);
    setError('');
    try {
      const payload = await submitFeedback(category, text);
      if (payload?.ok) {
        setDone(true);
        setText('');
      } else {
        setError(payload?.error || data.viewer?.commonUnknownErrorText || '');
      }
    } catch {
      setError(data.viewer?.commonUnknownErrorText || '');
    } finally { setInFlight(false); }
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
        <Text style={s.title}>{page.feedbackTitle}</Text>
        <View style={{ width: 22 }} />
      </View>

      {done ? (
        <Text style={s.success}>✓ {page.feedbackSuccessText}</Text>
      ) : (
        <>
          <Text style={s.label}>{page.feedbackCategoryLabel}</Text>
          <View style={s.chips}>
            {categories.map((cat) => {
              const active = cat.value === category;
              return (
                <Pressable
                  key={cat.value}
                  style={[s.chip, active && s.chipOn]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text style={[s.chipText, active && s.chipTextOn]}>{cat.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            style={s.input}
            value={text}
            onChangeText={setText}
            placeholder={page.feedbackPlaceholder}
            placeholderTextColor={theme.muted}
            multiline
            textAlignVertical="top"
          />
          {!!error && <Text style={s.error}>{error}</Text>}
          <Pressable
            style={[s.submitBtn, (inFlight || !text.trim()) && s.submitDisabled]}
            onPress={() => void submit()}
            disabled={inFlight || !text.trim()}
          >
            <Text style={s.submitText}>
              {inFlight ? page.feedbackSubmittingLabel : page.feedbackSubmitLabel}
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  back: { color: theme.accent, fontSize: 30, lineHeight: 32, width: 22 },
  title: { flex: 1, textAlign: 'center', fontFamily: fonts.display, fontWeight: '700', color: theme.paper, fontSize: 22, letterSpacing: 1 },
  label: { fontFamily: fonts.body, color: theme.paper, fontSize: 16, marginBottom: 10 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  chip: {
    paddingVertical: 9, paddingHorizontal: 18, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,.02)', borderWidth: 1, borderColor: 'rgba(67,160,134,.25)',
  },
  chipOn: { backgroundColor: 'rgba(67,160,134,.16)', borderColor: theme.accent },
  chipText: { fontFamily: fonts.body, color: theme.paper, fontSize: 14 },
  chipTextOn: { color: theme.accentHi },
  input: {
    minHeight: 130, borderWidth: 1, borderColor: 'rgba(67,160,134,.25)', borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,.03)', paddingHorizontal: 14, paddingVertical: 12,
    fontFamily: fonts.body, color: theme.paper, fontSize: 14.5, lineHeight: 22,
  },
  error: { fontFamily: fonts.body, color: theme.danger, fontSize: 13, marginTop: 12 },
  success: { fontFamily: fonts.body, color: '#7fb069', fontSize: 15, marginTop: 18 },
  submitBtn: {
    marginTop: 20, borderWidth: 1, borderColor: theme.accent, borderRadius: 10,
    backgroundColor: 'rgba(67,160,134,.16)', paddingVertical: 13, alignItems: 'center',
  },
  submitDisabled: { opacity: 0.45 },
  submitText: { fontFamily: fonts.body, color: theme.accentHi, fontSize: 15, letterSpacing: 1 },
});
