import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, Modal, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchQuery, useLazyLoadQuery, useRelayEnvironment } from 'react-relay';
import { fonts, theme, SECTS } from '../theme';
import { Backdrop, GoldFill, GuildHeader, SiteChrome } from '../components/ui';
import { BLOCKS_VERSION } from '../config';
import { DetailPageTextQuery, GroupingDetailBlocksQuery, GuildRosterQuery } from '../documents';
import { EditGroupingFormMount } from '../components/GroupingForm';
import { BlockNode1View } from '../blocks/BlockRenderer';
import type { ActionHandlers } from '../blocks/actions';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import { completeGrouping, disbandGrouping, joinGrouping, leaveGrouping, reopenGrouping, saveGroupingTemplate, setSeatReady } from '../api';
import { useGuildLive } from '../live';
import { useSession } from '../session';
import type { documentsGroupingDetailBlocksQuery } from '../__generated__/documentsGroupingDetailBlocksQuery.graphql';
import type { documentsDetailPageTextQuery } from '../__generated__/documentsDetailPageTextQuery.graphql';
import type { documentsGuildRosterQuery } from '../__generated__/documentsGuildRosterQuery.graphql';

// Page skeleton mirrors the Web detail page: header row (back link +
// UserBar) -> guild name + version row -> back-to-list gold link -> block
// tree (title/meta/hint/roster/action buttons). The content area is the
// server-supplied typed block tree (GroupingDetailPage.blocks).
// Permissions are not rebuilt client-side: only the leader receives the
// disband ActionButtonBlock+DisbandAction; only your own seat carries
// LeaveAction; empty seats carry JoinAction only when writable and the
// grouping is open. The client only dispatches Action objects by type to
// known handlers (confirm copy also comes from the action object).
type Props = { slug: string; id: string; readOnly: boolean; nick: string; guildName?: string; gameVersion?: string };

function fill(template: string, params: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(params)) out = out.split('{' + k + '}').join(String(v));
  return out;
}

export default function GroupingDetailScreen({ slug, id, nick, guildName, gameVersion }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const env = useRelayEnvironment();
  const { user, guilds, publicGuilds } = useSession();
  const [refreshTick, setRefreshTick] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const refresh = useCallback(() => setRefreshTick((k) => k + 1), []);
  const retry = useCallback(() => { setEpoch((e) => e + 1); setRefreshTick((k) => k + 1); }, []);

  useGuildLive(slug, refresh);

  // Edit form (opened by the server-supplied EditAction; trees for
  // non-leaders contain no such action, so the entry simply doesn't exist
  // -- the client makes no leader check)
  const [editId, setEditId] = useState<string | null>(null);

  // Signup dialog (mirrors the Web SeatGrid seat modal; opened by JoinAction, seatIndex comes from the action object)
  const [joinSeat, setJoinSeat] = useState<number | null>(null);

  // Failure hints use the detail shell's toast template (same field as the
  // Web toast): the template sentence is the message, {error} is filled
  // with the server error, or commonUnknownErrorText when there is none;
  // if the template itself is unavailable, fall back to the raw server error.
  const failText = async (which: 'leave' | 'disband' | 'complete' | 'uncomplete' | 'ready', serverError?: string | null): Promise<string> => {
    try {
      const d = await fetchQuery<documentsDetailPageTextQuery>(env, DetailPageTextQuery, { slug, id }, { fetchPolicy: 'store-or-network' }).toPromise();
      const tpl = which === 'leave'
        ? d?.groupingDetailPage?.seatToastLeaveFailedTemplate
        : which === 'complete'
          ? d?.groupingDetailPage?.detailToastCompleteFailedTemplate
          : which === 'uncomplete'
            ? d?.groupingDetailPage?.detailToastRestoreFailedTemplate
            : which === 'ready'
              ? d?.groupingDetailPage?.seatToastReadyFailedTemplate
              : d?.groupingDetailPage?.detailToastDisbandFailedTemplate;
      const unknown = d?.viewer?.commonUnknownErrorText;
      if (tpl) return fill(tpl, { error: serverError || unknown || '' });
      return serverError || unknown || '';
    } catch {
      return serverError || '';
    }
  };

  const handlers: ActionHandlers = {
    navigate: () => {},
    join: (a) => setJoinSeat(a.seatIndex),
    leave: (a) => {
      void (async () => {
        try {
          const r = await leaveGrouping(a.groupingId, a.uid);
          if (!r.ok) { Alert.alert(await failText('leave', r.error)); return; }
          refresh();
        } catch { Alert.alert(await failText('leave')); }
      })();
    },
    disband: (a) => {
      void (async () => {
        try {
          const r = await disbandGrouping(a.groupingId);
          if (!r.ok) { Alert.alert(await failText('disband', r.error)); return; }
          router.back();
        } catch { Alert.alert(await failText('disband')); }
      })();
    },
    edit: (a) => setEditId(a.groupingId),
    // Complete: refresh in place on success -- the tree switches to the
    // completed state (status chip + restore button) and the grouping is
    // already gone from lists (server-filtered); no success toast needed.
    complete: (a) => {
      void (async () => {
        try {
          const r = await completeGrouping(a.groupingId);
          if (!r.ok) { Alert.alert(await failText('complete', r.error)); return; }
          refresh();
        } catch { Alert.alert(await failText('complete')); }
      })();
    },
    uncomplete: (a) => {
      void (async () => {
        try {
          const r = await reopenGrouping(a.groupingId);
          if (!r.ok) { Alert.alert(await failText('uncomplete', r.error)); return; }
          refresh();
        } catch { Alert.alert(await failText('uncomplete')); }
      })();
    },
    // Readiness toggle (departure reminders): quiet success — the tree
    // refresh shows the new state; failures surface via the toast template.
    setReady: (a) => {
      void (async () => {
        try {
          const r = await setSeatReady(a.groupingId, a.ready);
          if (!r.ok) { Alert.alert(await failText('ready', r.error)); return; }
          refresh();
        } catch { Alert.alert(await failText('ready')); }
      })();
    },
  };

  return (
    <View style={s.root}>
      <Backdrop />
      <View style={[s.headZone, { paddingTop: 12 + insets.top }]}>
        <SiteChrome displayName={nick || undefined} backLabel={[...guilds, ...publicGuilds].find((g) => g.slug === slug)?.pageBackLabel} />
        {!!guildName && <GuildHeader name={guildName} version={gameVersion} />}
        <Suspense fallback={<BackLink label="‹ 返回车队列表" />}>
          <BackLinkLive slug={slug} id={id} />
        </Suspense>
      </View>
      <AsyncBoundary key={`${id}:${epoch}`} onRetry={retry}>
        <Suspense fallback={<LoadingView />}>
          <DetailBlocks slug={slug} id={id} refreshTick={refreshTick} refresh={refresh} handlers={handlers} />
        </Suspense>
      </AsyncBoundary>

      {editId != null && (
        <EditGroupingFormMount
          slug={slug}
          id={editId}
          onClose={() => setEditId(null)}
          onDone={() => { setEditId(null); refresh(); }}
        />
      )}

      {joinSeat != null && (
        <Suspense fallback={null}>
          <JoinModal
            slug={slug}
            id={id}
            seat={joinSeat}
            defaultNickname={nick || user?.name || ''}
            onClose={() => setJoinSeat(null)}
            onDone={() => { setJoinSeat(null); refresh(); }}
          />
        </Suspense>
      )}
    </View>
  );
}

// Back-to-list label (detailBackToListLabel) is supplied by the detail page shell.
function BackLink({ label }: { label: string }) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} hitSlop={10} style={s.backWrap}>
      <Text style={s.back}>{label}</Text>
    </Pressable>
  );
}

// Header row: left back-to-list, right share (both labels supplied by the
// detail page shell). Sharing uses the system sheet with the share URL
// supplied by the detail page shell (the car's stable short link). The
// save-as-template entry sits beside share: the shell's templateSave
// object exists only for members who may create groupings in a writable
// context (server-composed), so its presence gates the button.
function BackLinkLive({ slug, id }: { slug: string; id: string }) {
  const data = useLazyLoadQuery<documentsDetailPageTextQuery>(
    DetailPageTextQuery,
    { slug, id },
    { fetchPolicy: 'store-or-network' },
  );
  const page = data.groupingDetailPage;
  const shareLabel = page?.detailShareLabel;
  const shareUrl = page?.shareUrl;
  const [showTplSave, setShowTplSave] = useState(false);
  const onShare = useCallback(() => {
    if (!shareUrl) return;
    Share.share({ url: shareUrl, message: shareUrl }).catch(() => {});
  }, [shareUrl]);
  return (
    <View style={s.headerRow}>
      <BackLink label={page?.detailBackToListLabel ?? '‹ 返回车队列表'} />
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {page?.templateSave ? (
          <Pressable onPress={() => setShowTplSave(true)} hitSlop={10} style={s.backWrap}>
            <Text style={s.back}>{page.templateSave.buttonLabel}</Text>
          </Pressable>
        ) : null}
        {shareLabel ? (
          <Pressable onPress={onShare} hitSlop={10} style={s.backWrap}>
            <Text style={s.back}>{shareLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {showTplSave && page?.templateSave && (
        <SaveTemplateModal
          page={page}
          groupingId={id}
          unknownErrorText={data.viewer?.commonUnknownErrorText ?? ''}
          onClose={() => setShowTplSave(false)}
        />
      )}
    </View>
  );
}

// Save-as-template dialog: one name field (prefilled with the car's
// title); the server snapshots the car's configuration. Copy comes from
// the shell's templateSave object.
type DetailPageData = NonNullable<documentsDetailPageTextQuery['response']['groupingDetailPage']>;

function SaveTemplateModal({
  page, groupingId, unknownErrorText, onClose,
}: {
  page: DetailPageData;
  groupingId: string;
  unknownErrorText: string;
  onClose: () => void;
}) {
  const ts = page.templateSave;
  const [name, setName] = useState(page.grouping?.title ?? '');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  if (!ts) return null;
  const doSave = async () => {
    setBusy(true); setNotice('');
    try {
      const r = await saveGroupingTemplate({ groupingId, name: name.trim() || (page.grouping?.title ?? '') });
      if (!r.ok) {
        setNotice(fill(ts.toastFailedTemplate ?? '', { error: r.error || unknownErrorText }));
        return;
      }
      onClose();
      Alert.alert(ts.toastSaved);
    } catch (e) {
      setNotice(fill(ts.toastFailedTemplate ?? '', {
        error: e instanceof Error ? e.message : unknownErrorText,
      }));
    } finally { setBusy(false); }
  };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.panel} onPress={() => {}}>
          <Text style={s.formTitle}>{ts.dialogTitle}</Text>
          <Text style={s.label}>{ts.nameLabel}</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor={theme.muted}
          />
          {!!notice && <Text style={s.formNotice}>{notice}</Text>}
          <View style={s.formBtns}>
            <Pressable style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelText}>{page.formCancelLabel ?? ''}</Text>
            </Pressable>
            <Pressable style={[s.submitBtn, busy && { opacity: 0.6 }]} onPress={doSave} disabled={busy}>
              <GoldFill />
              <Text style={s.submitText}>{ts.submitLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Seat dialog: same structure as the Web SeatGrid modal -- title (seat
// template) / subtitle / two modes (self / proxy signup) / sect chips /
// right-aligned button row (ghost cancel + gold confirm). Signup identity
// is pinned: self signup shows a locked name (server-assigned, not
// editable); proxy signup picks from this guild's roster (searchable),
// and both the seat name and identity stamp are the picked member's.
// All copy comes from the detail shell's seat* fields.
type RosterMember = { discordId: string; displayName: string; globalName?: string | null };

function JoinModal({
  slug, id, seat, defaultNickname, onClose, onDone,
}: {
  slug: string;
  id: string;
  seat: number;
  defaultNickname: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const data = useLazyLoadQuery<documentsDetailPageTextQuery>(
    DetailPageTextQuery,
    { slug, id },
    { fetchPolicy: 'store-or-network' },
  );
  const page = data.groupingDetailPage;
  const rosterData = useLazyLoadQuery<documentsGuildRosterQuery>(
    GuildRosterQuery,
    { slug },
    { fetchPolicy: 'store-or-network' },
  );
  const roster: RosterMember[] = ((rosterData as any)?.viewer?.guild?.memberRoster ?? []) as RosterMember[];
  const [mode, setMode] = useState<'self' | 'proxy'>('self');
  const [selected, setSelected] = useState<RosterMember | null>(null);
  const [search, setSearch] = useState('');
  const [sect, setSect] = useState('');
  const [joining, setJoining] = useState(false);
  const [notice, setNotice] = useState('');

  // Signup failure hints use the shell's seatToastJoinFailedTemplate (same
  // source as the Web toast): {error} is the server error, or
  // commonUnknownErrorText on network failure.
  const joinFailText = (serverError?: string | null) => {
    const unknown = data.viewer?.commonUnknownErrorText;
    const tpl = page?.seatToastJoinFailedTemplate;
    if (tpl) return fill(tpl, { error: serverError || unknown || '' });
    return serverError || unknown || '';
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? roster.filter((m) => m.displayName.toLowerCase().includes(q) || (m.globalName || '').toLowerCase().includes(q))
    : roster;

  const doJoin = async () => {
    if (!sect) { setNotice(page?.seatToastSect ?? ''); return; }
    if (mode === 'proxy' && !selected) { setNotice(page?.seatProxyPickRequired ?? ''); return; }
    setJoining(true); setNotice('');
    try {
      const r = mode === 'proxy'
        ? await joinGrouping(id, selected!.displayName, sect, seat, selected!.discordId)
        : await joinGrouping(id, defaultNickname, sect, seat);
      if (!r.ok) { setNotice(joinFailText(r.error)); return; }
      onDone();
    } catch {
      setNotice(joinFailText());
    } finally { setJoining(false); }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.panel} onPress={() => {}}>
          <Text style={s.formTitle}>
            {page?.seatModalTitleTemplate ? fill(page.seatModalTitleTemplate, { n: seat + 1 }) : `报名 · ${seat + 1} 号位`}
          </Text>
          {!!page?.seatModalSubtitle && <Text style={s.formSub}>{page.seatModalSubtitle}</Text>}
          <View style={[s.chips, { marginBottom: 2 }]}>
            {(['self', 'proxy'] as const).map((m) => (
              <Pressable
                key={m}
                style={[s.chip, mode === m && s.chipOn]}
                onPress={() => setMode(m)}
              >
                {mode === m && <GoldFill />}
                <Text style={[s.chipText, mode === m && s.chipTextOn]}>
                  {m === 'self' ? (page?.seatSelfTabLabel ?? '') : (page?.seatProxyTabLabel ?? '')}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.label}>{page?.seatNameLabel ?? '昵称'}</Text>
          {mode === 'self' ? (
            <View>
              <View style={s.lockedNameBox}>
                <Text style={s.lockedName}>{defaultNickname || (page?.seatNamePlaceholder ?? '')}</Text>
              </View>
              {!!page?.seatSelfNameHint && <Text style={s.hint}>{page.seatSelfNameHint}</Text>}
            </View>
          ) : (
            <View>
              <TextInput
                style={s.input}
                value={search}
                onChangeText={setSearch}
                placeholder={page?.seatProxySearchPlaceholder ?? ''}
                placeholderTextColor={theme.muted}
              />
              {filtered.length === 0 ? (
                <Text style={s.hint}>{page?.seatProxyEmptyText ?? ''}</Text>
              ) : (
                <ScrollView style={s.rosterList} nestedScrollEnabled>
                  {filtered.map((m) => (
                    <Pressable
                      key={m.discordId}
                      style={[s.memberRow, selected?.discordId === m.discordId && s.memberRowOn]}
                      onPress={() => setSelected(m)}
                    >
                      {selected?.discordId === m.discordId && <GoldFill />}
                      <Text style={[s.memberName, selected?.discordId === m.discordId && s.chipTextOn]}>
                        {m.displayName}
                        {m.globalName && m.globalName !== m.displayName ? (
                          <Text style={s.memberSub}>{'  '}{m.globalName}</Text>
                        ) : null}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
          <Text style={s.label}>{page?.seatSectLabel ?? '流派'}</Text>
          <View style={s.chips}>
            {SECTS.map((x) => (
              <Pressable
                key={x}
                style={[s.chip, sect === x && s.chipOn]}
                onPress={() => setSect(x)}
              >
                {sect === x && <GoldFill />}
                <Text style={[s.chipText, sect === x && s.chipTextOn]}>{x}</Text>
              </Pressable>
            ))}
          </View>
          {!!notice && <Text style={s.formNotice}>{notice}</Text>}
          <View style={s.formBtns}>
            <Pressable style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelText}>{page?.seatCancelLabel ?? '取消'}</Text>
            </Pressable>
            <Pressable style={[s.submitBtn, joining && { opacity: 0.6 }]} onPress={doJoin} disabled={joining}>
              <GoldFill />
              <Text style={s.submitText}>
                {joining ? (page?.seatJoiningLabel ?? '报名中…') : (page?.seatConfirmJoinLabel ?? '确认报名')}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DetailBlocks({
  slug, id, refreshTick, refresh, handlers,
}: {
  slug: string;
  id: string;
  refreshTick: number;
  refresh: () => void;
  handlers: ActionHandlers;
}) {
  const environment = useRelayEnvironment();
  const insets = useSafeAreaInsets();
  const variables = { slug, id, blocksVersion: BLOCKS_VERSION };
  const data = useLazyLoadQuery<documentsGroupingDetailBlocksQuery>(
    GroupingDetailBlocksQuery,
    variables,
    { fetchPolicy: 'store-or-network' },
  );
  const pageText = useLazyLoadQuery<documentsDetailPageTextQuery>(
    DetailPageTextQuery,
    { slug, id },
    { fetchPolicy: 'store-or-network' },
  );
  const page = pageText.groupingDetailPage;
  const blocks = data.groupingDetailPage?.blocks ?? [];
  const [refreshing, setRefreshing] = useState(false);

  const firstTick = useRef(true);
  useEffect(() => {
    if (firstTick.current) { firstTick.current = false; return; }
    let live = true;
    fetchQuery(environment, GroupingDetailBlocksQuery, variables, { fetchPolicy: 'network-only' }).toPromise()
      .catch(() => { /* On refresh failure, keep current content */ })
      .finally(() => { if (live) setRefreshing(false); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick]);

  const leafHandlers: ActionHandlers = {
    ...handlers,
    pageText: {
      seatEmptyJoinLabel: page?.seatEmptyJoinLabel ?? undefined,
      seatEmptyLabel: page?.seatEmptyLabel ?? undefined,
      seatLeaderLabel: page?.seatLeaderLabel ?? undefined,
      seatReadyLabel: page?.seatReadyLabel ?? undefined,
      seatReadyActionLabel: page?.seatReadyActionLabel ?? undefined,
      seatUnreadyActionLabel: page?.seatUnreadyActionLabel ?? undefined,
    },
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 + insets.bottom }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); refresh(); }}
          tintColor={theme.gold}
        />
      }
    >
      {blocks.map((b, i) => (
        <BlockNode1View key={i} block={b} handlers={leafHandlers} />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  headZone: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backWrap: { marginTop: 14, marginBottom: 12 },
  back: { fontFamily: fonts.serif, color: theme.gold, fontSize: 15 },
  // Seat dialog mirrors the Web modal: centered over a dark scrim; panel with ink-2 background, gold border and 2px gold top edge
  overlay: {
    flex: 1, backgroundColor: 'rgba(6,5,4,.72)',
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  panel: {
    width: '100%', maxWidth: 420, backgroundColor: theme.ink2,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.4)',
    borderTopWidth: 2, borderTopColor: theme.gold,
    borderRadius: 14, padding: 24,
  },
  formTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 18, marginBottom: 4 },
  formSub: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginBottom: 16 },
  formNotice: { fontFamily: fonts.serif, color: theme.danger, fontSize: 12.5, marginTop: 4 },
  nameErr: { fontFamily: fonts.serif, color: '#e08080', fontSize: 12, marginTop: 4 },
  label: { fontFamily: fonts.serif, color: theme.paper, fontSize: 13, marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: theme.inputFill, borderWidth: 1, borderColor: theme.border,
    borderRadius: 8, color: theme.paper, fontFamily: fonts.serif, fontSize: 15,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  // Sect chips inside the modal: Web uses radius-8 squares; selected = gold gradient + ink bold text
  chip: {
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: theme.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  chipOn: { borderColor: 'rgba(236,210,143,.5)' },
  chipText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 13 },
  chipTextOn: { color: theme.onGold, fontWeight: '700' },
  formBtns: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  cancelBtn: {
    borderWidth: 1, borderColor: theme.border, borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 20, alignItems: 'center',
  },
  cancelText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14 },
  submitBtn: {
    position: 'relative', overflow: 'hidden', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(236,210,143,.5)',
    paddingVertical: 8, paddingHorizontal: 20, alignItems: 'center',
  },
  submitText: { fontFamily: fonts.serif, color: theme.onGold, fontSize: 14, fontWeight: '700' },
  // Signup identity: locked-name box for self signup / hint row / roster list for proxy signup
  lockedNameBox: {
    backgroundColor: 'rgba(201,163,92,.08)', borderWidth: 1, borderColor: theme.border,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
  },
  lockedName: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 15 },
  hint: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginTop: 4 },
  rosterList: { maxHeight: 176, marginTop: 8 },
  memberRow: {
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: theme.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 6,
  },
  memberRowOn: { borderColor: 'rgba(236,210,143,.5)' },
  memberName: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14 },
  memberSub: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12 },
});
