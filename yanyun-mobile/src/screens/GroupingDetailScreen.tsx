import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Modal, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchQuery, useLazyLoadQuery, useRelayEnvironment } from 'react-relay';
import { fonts, theme, SECTS } from '../theme';
import { Backdrop, ChromeBackdrop, ChromeSurface, GoldFill, GuildHeader, SiteChrome } from '../components/ui';
import { useChrome } from '../useChrome';
import { BLOCKS_VERSION } from '../config';
import { DetailPageTextQuery, GroupingDetailBlocksQuery, GuildRosterQuery } from '../documents';
import { EditGroupingFormMount, WheelColumn } from '../components/GroupingForm';
import {
  ECHO_TZ_EAST, ECHO_TZ_WEST, dateStripDays, dateStripIndex, minuteWheelValues, startOfLocalDay, zonedEchoParts,
} from '../groupingTime';
import { parseStartsAt } from '../week';
import { effectiveLocaleTag } from '../locale';
import { BlockNode1View } from '../blocks/BlockRenderer';
import type { ActionHandlers } from '../blocks/actions';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import * as Clipboard from 'expo-clipboard';
import { cloneGrouping, completeGrouping, disbandGrouping, joinGrouping, leaveGrouping, mergeGrouping, reopenGrouping, saveGroupingTemplate, setSeatReady } from '../api';
import { deliverShareImage, type ShareImageDeps } from '../shareImage';
import { useGuildLive } from '../live';
import { useSession } from '../session';
import type { documentsGroupingDetailBlocksQuery } from '../__generated__/documentsGroupingDetailBlocksQuery.graphql';
import type { documentsDetailPageTextQuery } from '../__generated__/documentsDetailPageTextQuery.graphql';
import type { documentsGuildRosterQuery } from '../__generated__/documentsGuildRosterQuery.graphql';

// Page skeleton mirrors the Web detail page: header row (back link +
// the UserBar slot, empty while signed in) -> guild name + version
// row -> back-to-list gold link -> block
// tree (title/meta/hint/roster/action buttons). The content area is the
// server-supplied typed block tree (GroupingDetailPage.blocks).
// Permissions are not rebuilt client-side: only the leader receives the
// disband ActionButtonBlock+DisbandAction; only your own seat carries
// LeaveAction; empty seats carry JoinAction only when writable and the
// grouping is open. The client only dispatches Action objects by type to
// known handlers (confirm copy also comes from the action object).
type Props = { slug: string; id: string; nick: string; guildName?: string; gameVersion?: string };

function fill(template: string, params: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(params)) out = out.split('{' + k + '}').join(String(v));
  return out;
}

export default function GroupingDetailScreen({ slug, id, nick, guildName, gameVersion }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const env = useRelayEnvironment();
  const { user, guilds } = useSession();
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
        <SiteChrome backLabel={guilds.find((g) => g.slug === slug)?.pageBackLabel} />
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

// Production wiring for the share-image action (see src/shareImage.ts
// for the branch logic): the card PNG lands in the cache directory via
// expo-file-system's download (idempotent — re-tapping overwrites the
// cached card instead of failing on the existing file), then
// expo-sharing opens the system sheet on the local file. The link
// fallback is the same RN Share call the plain share entry makes.
const nativeShareImageDeps: ShareImageDeps = {
  download: async (url, fileName) => {
    const file = await File.downloadFileAsync(url, new File(Paths.cache, fileName), { idempotent: true });
    return file.uri;
  },
  isSharingAvailable: () => Sharing.isAvailableAsync(),
  shareFile: (uri, options) => Sharing.shareAsync(uri, options),
  shareLink: async (url) => { await Share.share({ url, message: url }); },
};

// Header row: left back-to-list, right share (both labels supplied by the
// detail page shell). Sharing uses the system sheet with the share URL
// supplied by the detail page shell (the car's stable short link). The
// save-as-template entry sits beside share: the shell's templateSave
// object exists only for members who may create groupings in a writable
// context (server-composed), so its presence gates the button. The
// share-image entry sits beside share too, gated on the shell's
// shareImageUrl: it downloads the car's OG card PNG into the cache and
// hands the local file to the system share sheet, so chat apps that
// render no link preview still receive the card as a picture.
function BackLinkLive({ slug, id }: { slug: string; id: string }) {
  const data = useLazyLoadQuery<documentsDetailPageTextQuery>(
    DetailPageTextQuery,
    { slug, id },
    { fetchPolicy: 'store-or-network' },
  );
  const page = data.groupingDetailPage;
  const shareLabel = page?.detailShareLabel;
  const shareUrl = page?.shareUrl;
  const shareImageLabel = page?.detailShareImageLabel;
  const shareImageUrl = page?.shareImageUrl;
  const [showTplSave, setShowTplSave] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [shareImageBusy, setShareImageBusy] = useState(false);
  const onShare = useCallback(() => {
    if (!shareUrl) return;
    Share.share({ url: shareUrl, message: shareUrl }).catch(() => {});
  }, [shareUrl]);
  const onShareImage = useCallback(() => {
    if (!shareImageUrl || shareImageBusy) return;
    setShareImageBusy(true);
    void (async () => {
      try {
        const outcome = await deliverShareImage(nativeShareImageDeps, {
          imageUrl: shareImageUrl,
          linkUrl: shareUrl ?? null,
          dialogTitle: shareImageLabel ?? '',
        });
        if (outcome === 'failed') {
          Alert.alert(page?.detailShareImageFailed ?? data.viewer?.commonUnknownErrorText ?? '');
        }
      } finally {
        setShareImageBusy(false);
      }
    })();
  }, [shareImageUrl, shareImageBusy, shareUrl, shareImageLabel, page, data.viewer]);
  return (
    <>
    <ChromeSurface kind="bar" bareClassic radius={22} glassPadding={10} contentStyle={s.headerRow}>
      <BackLink label={page?.detailBackToListLabel ?? '‹ 返回车队列表'} />
      {/* Action entries wrap onto extra lines instead of running off
          the right edge: this row used to be a single no-wrap row next
          to the back link, so once merge / clone / nudge joined the
          older entries, the trailing ones (share, share image) were
          clipped off-screen and unreachable on phone widths. */}
      <View style={s.headLinks}>
        {page?.templateSave ? (
          <Pressable onPress={() => setShowTplSave(true)} hitSlop={10} style={s.headLink}>
            <Text style={s.back}>{page.templateSave.buttonLabel}</Text>
          </Pressable>
        ) : null}
        {page?.merge ? (
          <Pressable onPress={() => setShowMerge(true)} hitSlop={10} style={s.headLink}>
            <Text style={s.back}>{page.merge.buttonLabel}</Text>
          </Pressable>
        ) : null}
        {page?.cloneAction ? (
          <Pressable onPress={() => setShowClone(true)} hitSlop={10} style={s.headLink}>
            <Text style={s.back}>{page.cloneAction.buttonLabel}</Text>
          </Pressable>
        ) : null}
        {page?.nudgeCopy ? (
          <Pressable onPress={() => setShowNudge(true)} hitSlop={10} style={s.headLink}>
            <Text style={s.back}>{page.nudgeCopy.buttonLabel}</Text>
          </Pressable>
        ) : null}
        {shareLabel ? (
          <Pressable onPress={onShare} hitSlop={10} style={s.headLink}>
            <Text style={s.back}>{shareLabel}</Text>
          </Pressable>
        ) : null}
        {shareImageLabel && shareImageUrl ? (
          <Pressable onPress={onShareImage} hitSlop={10} style={s.headLink} disabled={shareImageBusy}>
            <Text style={[s.back, shareImageBusy && { opacity: 0.5 }]}>{shareImageLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </ChromeSurface>
      {showTplSave && page?.templateSave && (
        <SaveTemplateModal
          page={page}
          groupingId={id}
          unknownErrorText={data.viewer?.commonUnknownErrorText ?? ''}
          onClose={() => setShowTplSave(false)}
        />
      )}
      {showMerge && page?.merge && (
        <MergeModal
          page={page}
          groupingId={id}
          unknownErrorText={data.viewer?.commonUnknownErrorText ?? ''}
          onClose={() => setShowMerge(false)}
        />
      )}
      {showClone && page?.cloneAction && (
        <CloneGroupingModal
          page={page}
          slug={slug}
          groupingId={id}
          unknownErrorText={data.viewer?.commonUnknownErrorText ?? ''}
          onClose={() => setShowClone(false)}
        />
      )}
      {showNudge && page?.nudgeCopy && (
        <NudgeModal page={page} onClose={() => setShowNudge(false)} />
      )}
    </>
  );
}

// Sheet shell shared by every dialog on this screen (save-template /
// merge / nudge / clone / join): the panel's fill, border and radius
// come from the chrome tokens — classic keeps the shipped panel
// values exactly (ink-2 fill, .4 gold border, 2px gold top edge,
// radius 14); glass swaps in the translucent sheet fill over a real
// BlurView (ChromeBackdrop), the dark sheet border and the larger
// glass radius, with the gold top edge replaced by the backdrop's
// inset highlight.
function SheetPanel({ children }: { children: React.ReactNode }) {
  const { chrome, isGlass } = useChrome();
  return (
    <Pressable
      style={[
        s.panel,
        {
          backgroundColor: chrome.sheetFill,
          borderColor: chrome.sheetBorder,
          borderRadius: Math.max(14, chrome.radius),
          ...(isGlass
            ? { overflow: 'hidden' as const, borderTopWidth: 1 }
            : { borderTopWidth: 2, borderTopColor: theme.gold }),
        },
      ]}
      onPress={() => {}}
    >
      <ChromeBackdrop kind="sheet" />
      {children}
    </Pressable>
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
        <SheetPanel>
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
        </SheetPanel>
      </Pressable>
    </Modal>
  );
}

// Merge dialog (free feature): two steps in the save-template
// modal's shape -- pick a source car from the shell's candidate
// list (server-composed: same guild, same type, open, and managed
// by the viewer; this car is the surviving target), then confirm
// with the consequence copy. The shell's merge object exists only
// when this car can take a merge and the viewer may run it, so its
// presence gates the entry; mergeGrouping re-verifies everything.
// On success the screen refreshes through the live channel (the
// server publishes a seats event for the target), like any other
// seat change.
type MergeCandidate = { id: string; title: string; metaText: string };

function MergeModal({
  page, groupingId, unknownErrorText, onClose,
}: {
  page: DetailPageData;
  groupingId: string;
  unknownErrorText: string;
  onClose: () => void;
}) {
  const mg = page.merge;
  const [pick, setPick] = useState<MergeCandidate | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  if (!mg) return null;
  const candidates = (mg.candidates ?? []) as MergeCandidate[];
  const doMerge = async () => {
    if (!pick) return;
    setBusy(true); setNotice('');
    try {
      const r = await mergeGrouping(groupingId, pick.id);
      if (!r.ok) {
        setNotice(fill(mg.toastFailedTemplate ?? '', { error: r.error || unknownErrorText }));
        return;
      }
      onClose();
      Alert.alert(mg.toastMerged);
    } catch (e) {
      setNotice(fill(mg.toastFailedTemplate ?? '', {
        error: e instanceof Error ? e.message : unknownErrorText,
      }));
    } finally { setBusy(false); }
  };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <SheetPanel>
          {!pick ? (
            <>
              <Text style={s.formTitle}>{mg.dialogTitle}</Text>
              {candidates.length === 0 ? (
                <Text style={s.label}>{mg.emptyText}</Text>
              ) : (
                <ScrollView style={{ maxHeight: 300, marginTop: 10 }}>
                  {candidates.map((c) => (
                    <Pressable key={c.id} style={s.memberRow} onPress={() => { setPick(c); setNotice(''); }}>
                      <Text style={s.memberName}>{c.title}</Text>
                      <Text style={s.memberSub}>{c.metaText}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
              <View style={[s.formBtns, { marginTop: 16 }]}>
                <Pressable style={s.cancelBtn} onPress={onClose}>
                  <Text style={s.cancelText}>{page.formCancelLabel ?? ''}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={s.formTitle}>{mg.confirmTitle}</Text>
              <Text style={s.label}>{fill(mg.confirmMessageTemplate ?? '', { title: pick.title })}</Text>
              {!!notice && <Text style={s.formNotice}>{notice}</Text>}
              <View style={[s.formBtns, { marginTop: 16 }]}>
                <Pressable style={s.cancelBtn} onPress={() => setPick(null)}>
                  <Text style={s.cancelText}>{page.formCancelLabel ?? ''}</Text>
                </Pressable>
                <Pressable style={[s.submitBtn, busy && { opacity: 0.6 }]} onPress={doMerge} disabled={busy}>
                  <GoldFill />
                  <Text style={s.submitText}>{mg.confirmSubmitLabel}</Text>
                </Pressable>
              </View>
            </>
          )}
        </SheetPanel>
      </Pressable>
    </Modal>
  );
}

// Sign-up nudge dialog: the text is fully composed by the server
// (roster members who have not signed up, as real Discord
// mentions); this dialog only shows it and copies it to the
// clipboard for the leader to paste into Discord. The platform
// sends nothing itself. When everyone has signed up the shell
// ships the empty text instead of a message.
function NudgeModal({
  page, onClose,
}: {
  page: DetailPageData;
  onClose: () => void;
}) {
  const nc = page.nudgeCopy;
  const [notice, setNotice] = useState('');
  if (!nc) return null;
  const doCopy = async () => {
    if (!nc.text) return;
    await Clipboard.setStringAsync(nc.text);
    setNotice(nc.copiedToast);
  };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <SheetPanel>
          <Text style={s.formTitle}>{nc.dialogTitle}</Text>
          <Text style={s.label}>{nc.hintText}</Text>
          {nc.text ? (
            <ScrollView style={{ maxHeight: 260, marginTop: 10 }}>
              <Text selectable style={[s.label, { lineHeight: 22 }]}>{nc.text}</Text>
            </ScrollView>
          ) : (
            <Text style={[s.label, { marginTop: 10 }]}>{nc.emptyText}</Text>
          )}
          {!!notice && <Text style={s.formNotice}>{notice}</Text>}
          <View style={[s.formBtns, { marginTop: 16 }]}>
            <Pressable style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelText}>{page.formCancelLabel ?? ''}</Text>
            </Pressable>
            {nc.text ? (
              <Pressable style={s.submitBtn} onPress={doCopy}>
                <GoldFill />
                <Text style={s.submitText}>{nc.copyLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        </SheetPanel>
      </Pressable>
    </Modal>
  );
}

// Clone ("run it again") dialog: a title field plus the create
// form's start picker (date strip + hour/minute wheels + dual-zone
// echo), seeded from the shell's cloneAction default start — the
// source car's weekday and time-of-day on the nearest future week,
// computed server-side in the viewer's timezone. On success the app
// lands on the new squad; seats the server could not resolve are
// named in the confirmation alert (the clone still succeeds).
const CLONE_CELL_W = 54;
const CLONE_CELL_GAP = 8;
const CLONE_HOURS: readonly number[] = Array.from({ length: 24 }, (_, i) => i);

function CloneGroupingModal({
  page, slug, groupingId, unknownErrorText, onClose,
}: {
  page: DetailPageData;
  slug: string;
  groupingId: string;
  unknownErrorText: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const ca = page.cloneAction;
  const initDate = useMemo(
    () => parseStartsAt(ca?.defaultStartsAt) ?? new Date(),
    [ca?.defaultStartsAt],
  );
  const [title, setTitle] = useState(page.grouping?.title ?? '');
  const [pickedDay, setPickedDay] = useState(() => startOfLocalDay(initDate));
  const [hour, setHour] = useState(initDate.getHours());
  const [minute, setMinute] = useState(initDate.getMinutes());
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const locale = effectiveLocaleTag();
  const weekdayFmt = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: 'short' }), [locale]);
  const now = useMemo(() => new Date(), []);
  const stripDays = useMemo(() => dateStripDays(now, pickedDay), [now, pickedDay]);
  const selectedStripIndex = dateStripIndex(stripDays, pickedDay);
  const stripRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const stripLaidOut = useRef(false);
  const stripScrollX = Math.max(0, selectedStripIndex * (CLONE_CELL_W + CLONE_CELL_GAP) - CLONE_CELL_GAP);
  useEffect(() => {
    if (!stripLaidOut.current) return;
    stripRef.current?.scrollTo({ x: stripScrollX, animated: true });
  }, [stripScrollX]);
  if (!ca) return null;
  const echoInstant = new Date(pickedDay.getFullYear(), pickedDay.getMonth(), pickedDay.getDate(), hour, minute, 0);
  const echoEast = zonedEchoParts(echoInstant, ECHO_TZ_EAST, locale);
  const echoWest = zonedEchoParts(echoInstant, ECHO_TZ_WEST, locale);
  const doClone = async () => {
    setBusy(true); setNotice('');
    try {
      const r = await cloneGrouping({
        groupingId,
        title: title.trim() || (page.grouping?.title ?? ''),
        startsAt: String(Math.floor(echoInstant.getTime() / 1000)),
      });
      if (!r.ok) {
        setNotice(fill(ca.toastFailedTemplate ?? '', { error: r.error || unknownErrorText }));
        return;
      }
      const newId = r.grouping?.id;
      const skipped = r.skippedNames ?? [];
      onClose();
      if (newId) {
        router.replace({ pathname: '/guild/[slug]/grouping/[id]', params: { slug, id: newId } });
      }
      Alert.alert(
        ca.toastCloned,
        skipped.length ? fill(ca.toastSkippedTemplate ?? '', { names: skipped.join('、') }) : undefined,
      );
    } catch (e) {
      setNotice(fill(ca.toastFailedTemplate ?? '', {
        error: e instanceof Error ? e.message : unknownErrorText,
      }));
    } finally { setBusy(false); }
  };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <SheetPanel>
          <Text style={s.formTitle}>{ca.dialogTitle}</Text>
          <Text style={s.label}>{page.formTitleLabel ?? ''}</Text>
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            placeholder={page.formTitlePlaceholder ?? ''}
            placeholderTextColor={theme.muted}
          />
          <Text style={s.label}>{page.formStartsLabel ?? ''}</Text>
          <ScrollView
            ref={stripRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.cloneStripRow}
            onLayout={() => {
              stripLaidOut.current = true;
              stripRef.current?.scrollTo({ x: stripScrollX, animated: false });
            }}
          >
            {stripDays.map((d, i) => {
              const on = i === selectedStripIndex;
              return (
                <Pressable key={d.getTime()} style={[s.cloneDayCell, on && s.cloneDayCellOn]} onPress={() => setPickedDay(d)}>
                  {on && <GoldFill />}
                  <Text style={[s.cloneDayCellDate, on && s.cloneCellTextOn]}>{`${d.getMonth() + 1}/${d.getDate()}`}</Text>
                  <Text style={[s.cloneDayCellWeekday, on && s.cloneCellTextOn]}>{weekdayFmt.format(d)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={s.cloneWheelsRow}>
            <WheelColumn
              values={CLONE_HOURS}
              value={hour}
              onChange={setHour}
              format={(n) => fill(page.formHourTemplate ?? '', { n })}
            />
            <WheelColumn
              values={minuteWheelValues(minute)}
              value={minute}
              onChange={setMinute}
              format={(n) => fill(page.formMinuteTemplate ?? '', { n })}
            />
          </View>
          <Text style={s.cloneEchoText}>
            {fill(page.formTzEchoTemplate ?? '', {
              eastLabel: page.formTzEastLabel ?? '', eastWeekday: echoEast.weekday, eastTime: echoEast.time,
              westLabel: page.formTzWestLabel ?? '', westWeekday: echoWest.weekday, westTime: echoWest.time,
            })}
          </Text>
          {!!notice && <Text style={s.formNotice}>{notice}</Text>}
          <View style={s.formBtns}>
            <Pressable style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelText}>{page.formCancelLabel ?? ''}</Text>
            </Pressable>
            <Pressable style={[s.submitBtn, busy && { opacity: 0.6 }]} onPress={doClone} disabled={busy}>
              <GoldFill />
              <Text style={s.submitText}>{page.formSubmitCreateLabel ?? ''}</Text>
            </Pressable>
          </View>
        </SheetPanel>
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
  // F7 answers, keyed by field id; labels/options are the car's own
  // field data (creator-written), rendered verbatim.
  const customFields = page?.grouping?.customFields ?? [];
  const [answers, setAnswers] = useState<Record<string, string>>({});

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
      const answerInputs = customFields
        .filter((f) => (answers[f.id] ?? '').trim())
        .map((f) => ({ fieldId: f.id, value: answers[f.id].trim() }));
      const r = mode === 'proxy'
        ? await joinGrouping(id, selected!.displayName, sect, seat, selected!.discordId, answerInputs)
        : await joinGrouping(id, defaultNickname, sect, seat, undefined, answerInputs);
      if (!r.ok) { setNotice(joinFailText(r.error)); return; }
      onDone();
    } catch {
      setNotice(joinFailText());
    } finally { setJoining(false); }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <SheetPanel>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
          {customFields.map((f) => (
            <View key={f.id}>
              <Text style={s.label}>{f.label}{f.required ? ' *' : ''}</Text>
              {f.fieldType === 'CHOICE' ? (
                <View style={s.chips}>
                  {(f.options ?? []).map((o) => (
                    <Pressable
                      key={o}
                      style={[s.chip, answers[f.id] === o && s.chipOn]}
                      onPress={() => setAnswers({ ...answers, [f.id]: o })}
                    >
                      {answers[f.id] === o && <GoldFill />}
                      <Text style={[s.chipText, answers[f.id] === o && s.chipTextOn]}>{o}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={s.input}
                  value={answers[f.id] ?? ''}
                  onChangeText={(v) => setAnswers({ ...answers, [f.id]: v })}
                />
              )}
            </View>
          ))}
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
          </ScrollView>
        </SheetPanel>
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
      {/* F7 roster answers: the shell field is non-null only for
          viewers who may manage this car (leader / guild admin) —
          everyone else receives null and the section never renders. */}
      {!!page?.rosterAnswers?.length && (
        <View style={s.rosterWrap}>
          <Text style={s.rosterTitle}>{page.rosterAnswersTitle}</Text>
          {page.rosterAnswers.map((a, i) => (
            <View key={i} style={s.rosterRow}>
              <Text style={s.rosterName}>{a.nickname}</Text>
              <Text style={s.rosterField}>{a.fieldLabel}</Text>
              <Text style={s.rosterValue}>{a.value}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  headZone: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'column' },
  headLinks: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 2, marginBottom: 12 },
  headLink: { paddingVertical: 4 },
  backWrap: { marginTop: 14, marginBottom: 12 },
  back: { fontFamily: fonts.serif, color: theme.gold, fontSize: 15 },
  // Seat dialog mirrors the Web modal: centered over a dark scrim; panel with ink-2 background, gold border and 2px gold top edge
  overlay: {
    flex: 1, backgroundColor: 'rgba(6,5,4,.72)',
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  // Fill / border / top edge / radius are supplied by SheetPanel from
  // the chrome tokens (classic values are exactly the ones removed here).
  panel: {
    width: '100%', maxWidth: 420, maxHeight: '88%',
    borderWidth: 1, borderRadius: 14, padding: 24,
  },
  formTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 18, marginBottom: 4 },
  formSub: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginBottom: 16 },
  formNotice: { fontFamily: fonts.serif, color: theme.danger, fontSize: 12.5, marginTop: 4 },
  // Clone dialog start picker: same values as the create form's
  // date strip + echo line (GroupingForm styles).
  cloneStripRow: { flexDirection: 'row', gap: CLONE_CELL_GAP, paddingVertical: 2 },
  cloneDayCell: {
    position: 'relative', overflow: 'hidden', width: CLONE_CELL_W,
    borderWidth: 1, borderColor: theme.border, borderRadius: 10,
    paddingVertical: 8, alignItems: 'center',
  },
  cloneDayCellOn: { borderColor: 'rgba(236,210,143,.5)' },
  cloneDayCellDate: { fontFamily: fonts.serif, color: theme.paper, fontSize: 15.5 },
  cloneDayCellWeekday: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11.5, marginTop: 2 },
  cloneCellTextOn: { color: theme.onGold, fontWeight: '700' },
  cloneWheelsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cloneEchoText: { fontFamily: fonts.serif, color: theme.gold, fontSize: 13.5, textAlign: 'center', marginTop: 12 },
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
  rosterWrap: { marginTop: 22 },
  rosterTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 15, letterSpacing: 2, marginBottom: 10 },
  rosterRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'baseline',
    borderWidth: 1, borderColor: theme.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8,
  },
  rosterName: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13.5 },
  rosterField: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13.5 },
  rosterValue: { flex: 1, fontFamily: fonts.serif, color: theme.paper, fontSize: 13.5 },
});
