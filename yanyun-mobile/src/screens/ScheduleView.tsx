import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchQuery, useLazyLoadQuery, useMutation, useRelayEnvironment } from 'react-relay';
import { fonts, theme } from '../theme';
import { GoldFill } from '../components/ui';
import { TAB_BAR_CLEARANCE } from '../components/GuildTabBar';
import { LoadingView } from '../components/AsyncBoundary';
import {
  CloseTimePollMutation, CreateTimePollMutation, SchedulePageQuery, VoteTimePollMutation,
} from '../documents';
import GroupingForm, { type GroupingFormText } from '../components/GroupingForm';
import { fill } from '../gear/bits';
import type { documentsSchedulePageQuery } from '../__generated__/documentsSchedulePageQuery.graphql';

// Guild schedule tab (F13 time polls + the F5 availability summary),
// mirroring Web GuildSchedule. The personal availability EDITOR lives
// under Profile (AvailabilityDialog) — this surface keeps the
// guild-level tools: the settings link row pointing at the editor's
// home, the member availability summary (the shell field itself is
// the verdict: non-null only for guild admins and members who lead a
// car in this guild), and the time polls. Polls are multi-select
// availability votes; a poll only advises — the launch action hands
// the picked candidate to the standard create form as a prefill and
// the human still reviews and posts the car. All copy comes from the
// guildSchedulePage shell; this file holds no UI strings.

interface UtcSlot { weekday: number; startMinute: number; endMinute: number }

function refSunday(): Date {
  const n = new Date();
  const d = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}
const hhmm = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

// UTC weekday/minutes -> the viewer's local weekday + HH:MM pair
// (same conversion as the availability editor and Web's schedule tab).
function utcToLocal(slot: UtcSlot): { weekday: number; start: string; end: string } {
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

// One poll candidate being composed: local date + time as text (the
// mobile time-entry pattern, same as the availability editor).
interface CandidateDraft { date: string; time: string }

const mdOf = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function defaultCandidates(): CandidateDraft[] {
  const out: CandidateDraft[] = [];
  for (const ahead of [1, 2]) {
    const d = new Date();
    d.setDate(d.getDate() + ahead);
    out.push({ date: mdOf(d), time: '20:00' });
  }
  return out;
}

// Local draft -> epoch seconds; a date that already passed rolls to
// next year (the backend re-validates the 2..8 / horizon rules and
// its verdict is what the user sees on failure).
function candidateEpoch(c: CandidateDraft): number | null {
  const [mo, da] = c.date.split('-').map((x) => parseInt(x, 10));
  const [h, mi] = c.time.split(':').map((x) => parseInt(x, 10));
  if (!mo || !da || Number.isNaN(h) || Number.isNaN(mi)) return null;
  const now = new Date();
  let dt = new Date(now.getFullYear(), mo - 1, da, h, mi, 0);
  if (dt.getTime() < Date.now() - 3600_000) {
    dt = new Date(now.getFullYear() + 1, mo - 1, da, h, mi, 0);
  }
  return Math.floor(dt.getTime() / 1000);
}

export default function ScheduleView({ slug, defaultNickname, refreshTick }: {
  slug: string;
  defaultNickname?: string;
  refreshTick: number;
}) {
  return (
    <Suspense fallback={<LoadingView />}>
      <ScheduleInner slug={slug} defaultNickname={defaultNickname} refreshTick={refreshTick} />
    </Suspense>
  );
}

function ScheduleInner({ slug, defaultNickname, refreshTick }: {
  slug: string;
  defaultNickname?: string;
  refreshTick: number;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const environment = useRelayEnvironment();
  const data = useLazyLoadQuery<documentsSchedulePageQuery>(
    SchedulePageQuery, { slug }, { fetchPolicy: 'store-or-network' },
  );
  const page: any = data?.guildSchedulePage ?? {};
  const unknownErrorText: string = data?.viewer?.commonUnknownErrorText ?? '';
  const weekdayNames: string[] = page.weekdayNames ?? [];
  const summary: any[] | null = page.availabilitySummary ?? null;
  const polls: any[] = page.polls ?? [];

  // A freshly created poll is a new record the list field does not
  // know about; refetch the page query to pull it in (vote payloads
  // normalize onto the listed poll records by id already; close is
  // refetched too so its action objects realign with the new status).
  const refetchPage = useCallback(() => {
    return fetchQuery(environment, SchedulePageQuery, { slug }, { fetchPolicy: 'network-only' }).toPromise().catch(() => {});
  }, [environment, slug]);

  const [refreshing, setRefreshing] = useState(false);
  const firstTick = useRef(true);
  useEffect(() => {
    if (firstTick.current) { firstTick.current = false; return; }
    refetchPage();
  }, [refreshTick, refetchPage]);

  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const fail = (serverError?: string | null) => {
    setNotice('');
    setError(fill(page.scheduleToastFailedTemplate ?? '', { error: serverError || unknownErrorText }));
  };
  const done = (text: string) => { setError(''); setNotice(text); };

  /* ---------- polls ---------- */
  const [picks, setPicks] = useState<Record<string, Set<string>>>({});
  const [commitVote, voting] = useMutation<any>(VoteTimePollMutation);
  const [commitClose, closing] = useMutation<any>(CloseTimePollMutation);
  const [commitCreate, creating] = useMutation<any>(CreateTimePollMutation);
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [pollTitle, setPollTitle] = useState('');
  const [candidates, setCandidates] = useState<CandidateDraft[]>(defaultCandidates);
  const [launch, setLaunch] = useState<{ pollTitle: string; startsAtUtc: number } | null>(null);

  const togglePick = (pollId: string, optionId: string, initial: string[]) => {
    setPicks((prev) => {
      const cur = new Set(prev[pollId] ?? initial);
      if (cur.has(optionId)) cur.delete(optionId); else cur.add(optionId);
      return { ...prev, [pollId]: cur };
    });
  };
  const submitVote = (poll: any) => {
    const optionIds = [...(picks[poll.id] ?? new Set<string>(poll.myOptionIds ?? []))];
    commitVote({
      variables: { input: { pollId: poll.id, optionIds } },
      onCompleted: (res: any) => {
        if (res.voteTimePoll?.ok) done(page.scheduleToastVoted ?? '');
        else fail(res.voteTimePoll?.error);
      },
      onError: (e: any) => fail(e.message),
    });
  };
  const closePoll = (poll: any) => {
    commitClose({
      variables: { id: poll.id },
      onCompleted: (res: any) => {
        if (res.closeTimePoll?.ok) { done(page.scheduleToastClosed ?? ''); refetchPage(); }
        else fail(res.closeTimePoll?.error);
      },
      onError: (e: any) => fail(e.message),
    });
  };
  const createPoll = () => {
    const times = candidates
      .map(candidateEpoch)
      .filter((x): x is number => x != null)
      .map((x) => String(x));
    commitCreate({
      variables: { input: { slug, title: pollTitle.trim(), candidateStartsAt: times } },
      onCompleted: (res: any) => {
        if (res.createTimePoll?.ok) {
          done(page.scheduleToastPollCreated ?? '');
          refetchPage();
          setCreatingPoll(false);
          setPollTitle('');
          setCandidates(defaultCandidates());
        } else fail(res.createTimePoll?.error);
      },
      onError: (e: any) => fail(e.message),
    });
  };

  return (
    <View style={s.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_BAR_CLEARANCE + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); void refetchPage().finally(() => setRefreshing(false)); }}
            tintColor={theme.gold}
          />
        }
      >
        {!!notice && <Text style={s.saved}>✓ {notice}</Text>}
        {!!error && <Text style={s.error}>{error}</Text>}

        {/* F5: the editor lives in personal settings (Profile); only
            a text link remains here, pointing at its home. */}
        <Text style={s.sectionTitle}>{page.scheduleMyTitle}</Text>
        <Pressable onPress={() => router.push('/profile')} hitSlop={6} style={{ alignSelf: 'flex-start' }}>
          <Text style={s.settingsLink}>{page.scheduleSettingsLinkLabel}</Text>
        </Pressable>

        {/* F5: summary (admins / car leaders only; the field itself is the verdict) */}
        {summary && (
          <View style={{ marginTop: 30 }}>
            <Text style={s.sectionTitle}>{page.scheduleSummaryTitle}</Text>
            <Text style={s.hint}>{page.scheduleSummaryHint}</Text>
            {!summary.length && <Text style={s.muted}>{page.scheduleSummaryEmptyText}</Text>}
            {summary.map((m: any) => (
              <View key={m.discordId} style={s.card}>
                <Text style={s.memberName}>{m.displayName}</Text>
                <View style={s.slotChips}>
                  {(m.slots ?? []).map((slot: UtcSlot, i: number) => {
                    const l = utcToLocal(slot);
                    return (
                      <Text key={i} style={s.slotChip}>
                        {weekdayNames[l.weekday] ?? ''} {fill(page.scheduleSlotRangeTemplate ?? '', { start: l.start, end: l.end })}
                      </Text>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* F13: time polls */}
        <View style={s.pollsHead}>
          <Text style={[s.sectionTitle, { flex: 1, marginBottom: 0 }]}>{page.schedulePollsTitle}</Text>
          {!creatingPoll && (
            <Pressable style={s.ghostBtn} onPress={() => setCreatingPoll(true)}>
              <Text style={s.ghostBtnText}>{page.schedulePollCreateLabel}</Text>
            </Pressable>
          )}
        </View>
        <Text style={s.hint}>{page.schedulePollsHint}</Text>

        {creatingPoll && (
          <View style={s.card}>
            <Text style={s.fieldLabel}>{page.schedulePollTitleLabel}</Text>
            <TextInput
              style={s.input}
              value={pollTitle}
              onChangeText={setPollTitle}
              placeholder={page.schedulePollTitlePlaceholder}
              placeholderTextColor={theme.muted}
            />
            <Text style={[s.fieldLabel, { marginTop: 12 }]}>{page.schedulePollCandidatesLabel}</Text>
            {candidates.map((c, i) => (
              <View key={i} style={s.candidateRow}>
                <TextInput
                  style={[s.input, s.dateInput]}
                  value={c.date}
                  onChangeText={(v) => setCandidates(candidates.map((x, xi) => (xi === i ? { ...x, date: v } : x)))}
                  placeholder="12-31"
                  placeholderTextColor={theme.muted}
                  autoCapitalize="none"
                  keyboardType="numbers-and-punctuation"
                />
                <TextInput
                  style={[s.input, s.timeInput]}
                  value={c.time}
                  onChangeText={(v) => setCandidates(candidates.map((x, xi) => (xi === i ? { ...x, time: v } : x)))}
                  placeholder="20:00"
                  placeholderTextColor={theme.muted}
                  autoCapitalize="none"
                  keyboardType="numbers-and-punctuation"
                />
                {candidates.length > 2 && (
                  <Pressable hitSlop={6} onPress={() => setCandidates(candidates.filter((_, xi) => xi !== i))}>
                    <Text style={s.ghostBtnText}>{page.scheduleRemoveLabel}</Text>
                  </Pressable>
                )}
              </View>
            ))}
            <View style={s.formBtnRow}>
              {candidates.length < 8 && (
                <Pressable style={s.ghostBtn} onPress={() => setCandidates([...candidates, { date: '', time: '20:00' }])}>
                  <Text style={s.ghostBtnText}>{page.schedulePollAddCandidateLabel}</Text>
                </Pressable>
              )}
              <View style={{ flex: 1 }} />
              <Pressable style={s.ghostBtn} onPress={() => setCreatingPoll(false)}>
                <Text style={s.ghostBtnText}>{page.schedulePollCancelLabel}</Text>
              </Pressable>
              <Pressable style={[s.goldBtn, creating && { opacity: 0.6 }]} onPress={createPoll} disabled={creating}>
                <GoldFill />
                <Text style={s.goldBtnText}>{page.schedulePollSubmitLabel}</Text>
              </Pressable>
            </View>
          </View>
        )}

        {!polls.length && <Text style={s.muted}>{page.schedulePollEmptyText}</Text>}
        {polls.map((poll: any) => {
          const myPicks = picks[poll.id] ?? new Set<string>(poll.myOptionIds ?? []);
          const open = poll.status === 'open';
          return (
            <View key={poll.id} style={s.card}>
              <View style={s.pollHead}>
                <Text style={s.pollTitle}>{poll.title}</Text>
                <Text style={[s.statusChip, open ? s.statusOpen : s.statusClosed]}>
                  {open ? page.schedulePollStatusOpenText : page.schedulePollStatusClosedText}
                </Text>
                {poll.closeActions && (
                  <Pressable
                    style={[s.ghostBtn, { paddingVertical: 5, paddingHorizontal: 12 }]}
                    onPress={() => closePoll(poll)}
                    disabled={closing}
                  >
                    <Text style={[s.ghostBtnText, { fontSize: 12 }]}>{poll.closeActions.closeLabel}</Text>
                  </Pressable>
                )}
              </View>
              <View style={{ marginTop: 10, gap: 8 }}>
                {(poll.options ?? []).map((o: any) => (
                  <View key={o.id} style={s.optionRow}>
                    <Pressable
                      style={s.optionMain}
                      disabled={!open}
                      onPress={() => togglePick(poll.id, o.id, poll.myOptionIds ?? [])}
                    >
                      <View style={[s.checkbox, myPicks.has(o.id) && s.checkboxOn]}>
                        {myPicks.has(o.id) && <Text style={s.checkboxMark}>✓</Text>}
                      </View>
                      <Text style={s.optionTime}>{o.startsAtText}</Text>
                    </Pressable>
                    <Text style={s.voteCount}>
                      {fill(page.schedulePollVoteCountTemplate ?? '', { count: o.voteCount })}
                    </Text>
                    {poll.launchActions && (
                      <Pressable
                        style={[s.ghostBtn, { paddingVertical: 5, paddingHorizontal: 12 }]}
                        onPress={() => setLaunch({ pollTitle: poll.title, startsAtUtc: o.startsAtUtc })}
                      >
                        <Text style={[s.ghostBtnText, { fontSize: 12 }]}>{poll.launchActions.launchLabel}</Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
              {(poll.options ?? []).some((o: any) => (o.voterNames ?? []).length) > 0 && (
                <Text style={s.voters}>
                  {(poll.options ?? []).filter((o: any) => (o.voterNames ?? []).length)
                    .map((o: any) => `${o.startsAtText}: ${(o.voterNames ?? []).join('、')}`).join('；')}
                </Text>
              )}
              {open && (
                <View style={s.voteRow}>
                  <Pressable style={[s.goldBtn, voting && { opacity: 0.6 }]} onPress={() => submitVote(poll)} disabled={voting}>
                    <GoldFill />
                    <Text style={s.goldBtnText}>{page.schedulePollVoteLabel}</Text>
                  </Pressable>
                  {(poll.myOptionIds ?? []).length > 0 && (
                    <Text style={s.muted}>{page.schedulePollVotedText}</Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Launch handoff: the standard create form, prefilled with the
          picked candidate — the human still reviews and posts the car. */}
      {launch && (
        <Suspense fallback={null}>
          <GroupingForm
            slug={slug}
            text={page as unknown as GroupingFormText}
            unknownErrorText={unknownErrorText}
            mode="create"
            defaultNickname={defaultNickname}
            initial={{ title: launch.pollTitle, type: 'ACTIVITY', startsAt: String(launch.startsAtUtc) }}
            onClose={() => setLaunch(null)}
            onDone={() => setLaunch(null)}
          />
        </Suspense>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  sectionTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 17, letterSpacing: 2, marginBottom: 6 },
  hint: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12.5, lineHeight: 20, marginBottom: 14 },
  muted: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13 },
  saved: { fontFamily: fonts.serif, color: '#7fb069', fontSize: 13, marginBottom: 12 },
  error: { fontFamily: fonts.serif, color: theme.danger, fontSize: 13, marginBottom: 12 },
  settingsLink: { fontFamily: fonts.serif, color: theme.gold, fontSize: 13.5, textDecorationLine: 'underline' },
  card: {
    borderWidth: 1, borderColor: theme.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12,
  },
  memberName: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 14 },
  slotChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  slotChip: {
    fontFamily: fonts.serif, fontSize: 12, color: theme.paper,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.35)', borderRadius: 6,
    paddingVertical: 2, paddingHorizontal: 8, overflow: 'hidden',
  },
  pollsHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 30 },
  ghostBtn: {
    borderWidth: 1, borderColor: theme.gold, borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center',
  },
  ghostBtnText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13 },
  goldBtn: {
    position: 'relative', overflow: 'hidden', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(236,210,143,.5)',
    paddingVertical: 8, paddingHorizontal: 22, alignItems: 'center',
  },
  goldBtnText: { fontFamily: fonts.serif, color: theme.onGold, fontSize: 13.5, fontWeight: '700' },
  fieldLabel: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: '#1e1b15', borderWidth: 1, borderColor: 'rgba(201,163,92,.3)',
    color: theme.paper, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 10,
    fontFamily: fonts.serif, fontSize: 14,
  },
  candidateRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 8 },
  dateInput: { width: 96 },
  timeInput: { width: 84 },
  formBtnRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 },
  pollHead: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  pollTitle: { flex: 1, minWidth: 120, fontFamily: fonts.serif, color: theme.goldHi, fontSize: 15 },
  statusChip: { fontFamily: fonts.serif, fontSize: 12, borderWidth: 1, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 8, overflow: 'hidden' },
  statusOpen: { color: '#7fc97f', borderColor: '#7fc97f' },
  statusClosed: { color: theme.muted, borderColor: theme.muted },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  optionMain: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 170 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: theme.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: 'rgba(201,163,92,.25)' },
  checkboxMark: { color: theme.goldHi, fontSize: 13, lineHeight: 15 },
  optionTime: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14 },
  voteCount: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 12.5 },
  voters: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, lineHeight: 20, marginTop: 8 },
  voteRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
});
