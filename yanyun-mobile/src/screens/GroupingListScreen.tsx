import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchQuery, useLazyLoadQuery, useRelayEnvironment } from 'react-relay';
import { fonts, theme } from '../theme';
import { Backdrop, GoldFill, GuildHeader, SiteChrome, TabFill } from '../components/ui';
import { GuildTabBar, TAB_BAR_CLEARANCE } from '../components/GuildTabBar';
import { buildGuildTabEntries } from '../guildTabEntries';
import { BLOCKS_VERSION } from '../config';
import { GroupingListBlocksQuery, ListPageTextQuery } from '../documents';
import { CreateGroupingFormMount } from '../components/GroupingForm';
import DexView from './DexView';
import SectView from './SectView';
import AnnouncementsView from './AnnouncementsView';
import ScheduleView from './ScheduleView';
import GuildInsightsSection from './GuildInsightsSection';
import { useSession } from '../session';
import type { documentsListPageTextQuery } from '../__generated__/documentsListPageTextQuery.graphql';
import { BlockNode1View } from '../blocks/BlockRenderer';
import type { ActionHandlers } from '../blocks/actions';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import { getWeekRange, weekRangeLabel } from '../week';
import { deliverShareImage, type ShareImageDeps } from '../shareImage';
import { useGuildLive } from '../live';
import type { documentsGroupingListBlocksQuery } from '../__generated__/documentsGroupingListBlocksQuery.graphql';

// Page skeleton mirrors Web GuildHome: header row (back link only —
// no page renders a top-right avatar; the capsule's profile line
// icon is this screen's one personal entry) -> guild name
// (calligraphy 42) + version row -> the active
// section panel. Section switching lives in the floating bottom
// capsule (GuildTabBar, IG-style): 组队/攻略/公告/排期/我的, built
// from the Guild shell's homeTab*Label fields (same source as Web);
// 攻略 covers both guide sections, with an opaque in-section switch
// between DexView and SectView. Grouping panel = new-grouping gold
// button (right-aligned) -> type ghost chips -> week nav row -> the
// server-supplied typed block tree (GroupingListPage.blocks). The
// surfaces switch in-page (like Web's in-page tabs), not via routing,
// so session and current guild persist.
// Refresh (WS ping / pull) refetches over the network into the store via
// the same imperative path; mounted queries re-render from store
// updates without flashing the Suspense fallback.
const TAB_KEYS = ['ALL', 'ACTIVITY', 'TALENT', 'RACE', 'TOWER', 'EXPLORE'] as const;
const TAB_FALLBACK_LABELS = ['全部', '双十人本', '天赋组队', '竞速报名', '爬塔', '联机探索'];

type TabKey = (typeof TAB_KEYS)[number];
type Props = { slug: string; name: string; nick: string; gameVersion?: string; avatarUrl?: string };

function fill(template: string, params: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(params)) out = out.split('{' + k + '}').join(String(v));
  return out;
}

type SectionKey = 'team' | 'dex' | 'sect' | 'announcements' | 'schedule' | 'insights';

export default function GroupingListScreen({ slug, name, nick, gameVersion, avatarUrl }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { guilds, text } = useSession();
  const [section, setSection] = useState<SectionKey>('team');
  const [tab, setTab] = useState<TabKey>('ALL');
  const [weekOffset, setWeekOffset] = useState(0);
  const [refreshTick, setRefreshTick] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const refresh = useCallback(() => setRefreshTick((k) => k + 1), []);
  const retry = useCallback(() => { setEpoch((e) => e + 1); setRefreshTick((k) => k + 1); }, []);

  // WS live: grouping-changed ping -> same refetch path as pull-to-refresh
  useGuildLive(slug, refresh);

  const handlers: ActionHandlers = {
    navigate: (a) => router.push({
      pathname: '/guild/[slug]/grouping/[id]',
      params: {
        slug: a.slug,
        id: a.groupingId,
        name: a.name,
        nick: a.nick,
        version: gameVersion ?? '',
        guildName: name,
      },
    }),
    // The list tree only ever supplies NavigateAction; other actions appear on the detail surface
    join: () => {},
    leave: () => {},
    disband: () => {},
    edit: () => {},
    complete: () => {},
    uncomplete: () => {},
    setReady: () => {},
  };

  // Section pill labels: the shell labels for this guild in the session
  // (same fields as Web GuildHome); tabs render only when all three are
  // present (never fake them) -- otherwise only the grouping surface shows.
  const guildItem = guilds.find((g) => g.slug === slug);
  const sectionLabels: [SectionKey, string][] | null =
    guildItem?.homeTabTeamLabel && guildItem?.homeTabDexLabel && guildItem?.homeTabSectLabel
      ? [
        ['team', guildItem.homeTabTeamLabel],
        ['dex', guildItem.homeTabDexLabel],
        ['sect', guildItem.homeTabSectLabel],
        // Announcements tab: label is backend-supplied like the other
        // three; a guild payload without it simply omits the tab.
        ...(guildItem.homeTabAnnouncementsLabel
          ? [['announcements', guildItem.homeTabAnnouncementsLabel] as [SectionKey, string]]
          : []),
        // Schedule tab (F5 summary + F13 polls): the label is carried
        // only by the member shell, so its presence is the gate.
        ...(guildItem.homeTabScheduleLabel
          ? [['schedule', guildItem.homeTabScheduleLabel] as [SectionKey, string]]
          : []),
        // Insights tab (P15 board + own P9 status): exists only when
        // the session payload's board composed the full variant —
        // the tier verdict is the type, exactly like Web's home tab.
        ...(guildItem.raceSeasonBoard?.__typename === 'RaceSeasonBoard' && guildItem.homeInsightsRaceTitle
          ? [['insights', guildItem.homeInsightsRaceTitle] as [SectionKey, string]]
          : []),
      ]
      : null;

  // Floating capsule entries (IG-style main navigation): built from
  // the same shell labels the section pills used; null when the shell
  // composed no section set, in which case no capsule renders.
  const tabEntries = buildGuildTabEntries({
    sectionLabels,
    section,
    profileLabel: text.userBarSettingsLabel,
  });
  const onTabSelect = (entry: { key: string }) => {
    if (entry.key === 'profile') {
      router.push('/profile');
    } else {
      setSection(entry.key as SectionKey);
    }
  };
  const dexLabel = sectionLabels?.find(([k]) => k === 'dex')?.[1];
  const sectLabel = sectionLabels?.find(([k]) => k === 'sect')?.[1];

  return (
    <View style={s.root}>
      <Backdrop />
      <View style={[s.headZone, { paddingTop: 12 + insets.top }]}>
        <SiteChrome solid backLabel={guildItem?.pageBackLabel} />
        <Suspense fallback={<GuildHeader name={name} version={gameVersion} avatarUrl={avatarUrl} />}>
          <GuildHeaderLive slug={slug} name={name} fallbackVersion={gameVersion} avatarUrl={avatarUrl} />
        </Suspense>
      </View>

      {(section === 'dex' || section === 'sect') && dexLabel && sectLabel && (
        // The 攻略 capsule entry covers both guide sections; switching
        // between them is this in-section control — an opaque row in
        // both themes (the capsule is the screen's only glass surface).
        <View style={s.tabsZone}>
          <View style={s.guideSwitch}>
            {([['dex', dexLabel], ['sect', sectLabel]] as [SectionKey, string][]).map(([key, label]) => {
              const on = section === key;
              return (
                <Pressable key={key} onPress={() => setSection(key)} style={[s.tab, on && s.tabOn]}>
                  {on && <TabFill />}
                  <Text style={[s.tabText, on && s.tabTextOn]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {section === 'team' && (
        <>
          <View style={s.createRow}>
            <Suspense fallback={null}>
              <WeekShareButton slug={slug} weekOffset={weekOffset} />
            </Suspense>
            <Suspense fallback={null}>
              <CreateCarButton slug={slug} onPress={() => setShowCreate(true)} />
            </Suspense>
            <Suspense fallback={null}>
              <AdminEntryButton slug={slug} />
            </Suspense>
          </View>

          <View style={s.chipsZone}>
            <Suspense fallback={<ChipsRow labels={TAB_FALLBACK_LABELS} tab={tab} onChange={setTab} />}>
              <TypeChips slug={slug} tab={tab} onChange={setTab} />
            </Suspense>
          </View>

          <AsyncBoundary key={`${tab}:${weekOffset}:${epoch}`} onRetry={retry}>
            <Suspense fallback={<LoadingView />}>
              <ListBlocks
                slug={slug}
                tab={tab}
                weekOffset={weekOffset}
                onWeekChange={setWeekOffset}
                refreshTick={refreshTick}
                refresh={refresh}
                handlers={handlers}
              />
            </Suspense>
          </AsyncBoundary>
        </>
      )}

      {section === 'dex' && (
        <AsyncBoundary key={`dex:${epoch}`} onRetry={retry}>
          <Suspense fallback={<LoadingView />}>
            <DexView />
          </Suspense>
        </AsyncBoundary>
      )}

      {section === 'sect' && (
        <AsyncBoundary key={`sect:${epoch}`} onRetry={retry}>
          <Suspense fallback={<LoadingView />}>
            <SectView />
          </Suspense>
        </AsyncBoundary>
      )}

      {section === 'announcements' && (
        <AnnouncementsView key={`announcements:${epoch}`} slug={slug} />
      )}

      {section === 'schedule' && (
        <AsyncBoundary key={`schedule:${epoch}`} onRetry={retry}>
          <ScheduleView slug={slug} defaultNickname={nick} refreshTick={refreshTick} />
        </AsyncBoundary>
      )}

      {section === 'insights' && (
        <AsyncBoundary key={`insights:${epoch}`} onRetry={retry}>
          <Suspense fallback={<LoadingView />}>
            <GuildInsightsSection slug={slug} />
          </Suspense>
        </AsyncBoundary>
      )}

      {tabEntries && (
        <GuildTabBar entries={tabEntries} onSelect={onTabSelect} />
      )}

      {showCreate && (
        <CreateGroupingFormMount
          slug={slug}
          // ALL is a list view, not a grouping type: creating from it
          // keeps the historical default type (ACTIVITY).
          tab={tab === 'ALL' ? 'ACTIVITY' : tab}
          defaultNickname={nick}
          onClose={() => setShowCreate(false)}
          onDone={() => { setShowCreate(false); refresh(); }}
        />
      )}
    </View>
  );
}

// Guild name + version row: version prefers the list shell's
// currentVersion (same source as Web GuildHome); route params are only
// a first-frame fallback.
function GuildHeaderLive({ slug, name, fallbackVersion, avatarUrl }: { slug: string; name: string; fallbackVersion?: string; avatarUrl?: string }) {
  const data = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery,
    { slug, tab: 'ACTIVITY' },
    { fetchPolicy: 'store-or-network' },
  );
  return <GuildHeader name={name} version={data.groupingListPage?.currentVersion ?? fallbackVersion} avatarUrl={avatarUrl} />;
}

// Production wiring for the share-image action (same shape as the
// detail screen's: download into the cache directory via
// expo-file-system, hand the local file to expo-sharing; the link
// fallback is the plain RN Share call).
const nativeShareImageDeps: ShareImageDeps = {
  download: async (url, fileName) => {
    const file = await File.downloadFileAsync(url, new File(Paths.cache, fileName), { idempotent: true });
    return file.uri;
  },
  isSharingAvailable: () => Sharing.isAvailableAsync(),
  shareFile: (uri, options) => Sharing.shareAsync(uri, options),
  shareLink: async (url) => { await Share.share({ url, message: url }); },
};

// Weekly squad image entry: beside the create button, mirroring
// Web's list page. Runs the same deliverShareImage flow as the
// detail page's share-image action with the list shell's composed
// URL / text / guild link; only failure is surfaced (the share
// sheet itself is the success feedback), like the detail action.
function WeekShareButton({ slug, weekOffset }: { slug: string; weekOffset: number }) {
  const data = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery,
    { slug, tab: 'ACTIVITY' },
    { fetchPolicy: 'store-or-network' },
  );
  const page = data.groupingListPage;
  const [busy, setBusy] = useState(false);
  if (!page?.weekShareImageLabel || !page?.weekShareImageUrl) return null;
  const onShare = () => {
    if (busy) return;
    setBusy(true);
    void (async () => {
      try {
        // The image follows the week on screen: carry the exact
        // window this list is showing (getWeekRange on the current
        // weekOffset) — the OG route validates it and falls back to
        // the current week if the params are ever off.
        const { start, end } = getWeekRange(weekOffset);
        const baseUrl = page.weekShareImageUrl;
        const sep = baseUrl.includes('?') ? '&' : '?';
        const imageUrl = `${baseUrl}${sep}from=${Math.floor(start.getTime() / 1000)}&to=${Math.floor(end.getTime() / 1000)}`;
        const outcome = await deliverShareImage(nativeShareImageDeps, {
          imageUrl,
          linkUrl: page.weekShareUrl ?? null,
          dialogTitle: page.weekShareText ?? '',
        });
        if (outcome === 'failed') {
          Alert.alert(page.weekShareImageFailed ?? '');
        }
      } finally {
        setBusy(false);
      }
    })();
  };
  return (
    <Pressable style={[s.weekShareBtn, busy && { opacity: 0.5 }]} onPress={onShare} disabled={busy}>
      <Text style={s.weekShareBtnText}>{page.weekShareImageLabel}</Text>
    </Pressable>
  );
}

// New-grouping entry: same position as Web's list page (gold button,
// right-aligned above the list); newCarLabel is supplied by the list
// shell per locale; shown only for writable guilds.
function CreateCarButton({ slug, onPress }: { slug: string; onPress: () => void }) {
  const data = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery,
    { slug, tab: 'ACTIVITY' },
    { fetchPolicy: 'store-or-network' },
  );
  const label = data.groupingListPage?.newCarLabel;
  if (!label) return null;
  return (
    <Pressable style={s.createBtn} onPress={onPress}>
      <GoldFill />
      <Text style={s.createBtnText}>{label}</Text>
    </Pressable>
  );
}

function AdminEntryButton({ slug }: { slug: string }) {
  const router = useRouter();
  const data = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery,
    { slug, tab: 'ACTIVITY' },
    { fetchPolicy: 'store-or-network' },
  );
  const g: any = (data as any)?.viewer?.guild;
  // The label itself is the variant signal: the shell emits it only on the
  // admin-verdict Guild (null for plain members, absent when guild is null).
  // (No __typename check: the reader AST does not surface it on this field.)
  const label = g?.homeAdminLabel ?? null;
  if (!label) return null;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/guild/[slug]/admin', params: { slug } })}
      style={{ marginLeft: 10, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(201,163,92,.45)' }}
    >
      <Text style={{ fontFamily: fonts.serif, color: theme.gold, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

// Type filter: Web's .yy-fchip ghost-chip row (not a full-width segmented control);
// labels tabAllLabel/tabActivityLabel/tabTalentLabel/tabRaceLabel/tabTowerLabel/tabExploreLabel come from the list shell.
function ChipsRow({ labels, tab, onChange }: { labels: string[]; tab: TabKey; onChange: (t: TabKey) => void }) {
  // Plain opaque row in both themes (IG-style layout: the floating
  // capsule is the screen's only glass surface; the type filter is a
  // content-level control, not chrome).
  return (
    <View style={s.chips}>
      {TAB_KEYS.map((key, i) => {
        const on = tab === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[s.fchip, on && s.fchipOn]}
          >
            <Text style={[s.fchipText, on && s.fchipTextOn]}>{labels[i]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TypeChips({ slug, tab, onChange }: { slug: string; tab: TabKey; onChange: (t: TabKey) => void }) {
  const data = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery,
    { slug, tab: 'ACTIVITY' },
    { fetchPolicy: 'store-or-network' },
  );
  const page = data.groupingListPage;
  const labels = [
    page?.tabAllLabel ?? TAB_FALLBACK_LABELS[0],
    page?.tabActivityLabel ?? TAB_FALLBACK_LABELS[1],
    page?.tabTalentLabel ?? TAB_FALLBACK_LABELS[2],
    page?.tabRaceLabel ?? TAB_FALLBACK_LABELS[3],
    page?.tabTowerLabel ?? TAB_FALLBACK_LABELS[4],
    page?.tabExploreLabel ?? TAB_FALLBACK_LABELS[5],
  ];
  return <ChipsRow labels={labels} tab={tab} onChange={onChange} />;
}

function ListBlocks({
  slug, tab, weekOffset, onWeekChange, refreshTick, refresh, handlers,
}: {
  slug: string;
  tab: TabKey;
  weekOffset: number;
  onWeekChange: (n: number) => void;
  refreshTick: number;
  refresh: () => void;
  handlers: ActionHandlers;
}) {
  const environment = useRelayEnvironment();
  const insets = useSafeAreaInsets();
  const variables = { slug, tab, weekOffset, blocksVersion: BLOCKS_VERSION };
  const data = useLazyLoadQuery<documentsGroupingListBlocksQuery>(
    GroupingListBlocksQuery,
    variables,
    { fetchPolicy: 'store-or-network' },
  );
  const pageText = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery,
    { slug, tab },
    { fetchPolicy: 'store-or-network' },
  );
  const page = pageText.groupingListPage;
  const blocks = data.groupingListPage?.blocks ?? [];
  const cardCount = blocks.filter((b) => b.__typename === 'GroupingCardBlock').length;
  const [refreshing, setRefreshing] = useState(false);

  const firstTick = useRef(true);
  useEffect(() => {
    if (firstTick.current) { firstTick.current = false; return; }
    let live = true;
    fetchQuery(environment, GroupingListBlocksQuery, variables, { fetchPolicy: 'network-only' }).toPromise()
      .catch(() => { /* On refresh failure, keep current content */ })
      .finally(() => { if (live) setRefreshing(false); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick]);

  const leafHandlers: ActionHandlers = {
    ...handlers,
    pageText: { sealText: page?.sealText ?? undefined, statusOpenLabel: page?.statusOpenLabel ?? undefined },
  };
  // When the template is unavailable (data not yet loaded), show only the
  // date range itself -- no shell field backs a count unit, so the client
  // never fabricates one (see the missing-fields list in the report).
  const weekLabel = page?.weekHeaderTemplate
    ? fill(page.weekHeaderTemplate, { range: weekRangeLabel(weekOffset), count: cardCount })
    : weekRangeLabel(weekOffset);

  return (
    <>
      <View style={s.weekBar}>
        <Pressable onPress={() => onWeekChange(weekOffset - 1)} hitSlop={6} style={s.weekBtn}>
          <Text style={s.weekArrow}>‹</Text>
        </Pressable>
        <Text style={s.weekLabel} numberOfLines={1}>{weekLabel}</Text>
        <Pressable onPress={() => onWeekChange(weekOffset + 1)} hitSlop={6} style={s.weekBtn}>
          <Text style={s.weekArrow}>›</Text>
        </Pressable>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_BAR_CLEARANCE + insets.bottom }}
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
    </>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  headZone: { paddingHorizontal: 20 },
  // Guide switch (dex/sect inside 攻略): same geometry as the old
  // section pills (padding 4/gap 4, tabs 9/16 at 15px, active = gold
  // gradient + bright gold text 600 + inner border) but an opaque
  // ink surface in both themes — never glass.
  tabsZone: { paddingHorizontal: 20, marginTop: 20, flexDirection: 'row' },
  guideSwitch: {
    flexDirection: 'row', gap: 4, padding: 4,
    backgroundColor: theme.ink2, borderWidth: 1, borderColor: theme.border, borderRadius: 999,
  },
  tab: { position: 'relative', overflow: 'hidden', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16 },
  tabOn: { borderWidth: 1, borderColor: 'rgba(60,42,12,.55)' },
  tabText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 15 },
  tabTextOn: { color: theme.goldHi, fontWeight: '600' },
  createRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, marginTop: 14, marginBottom: 12 },
  createBtn: {
    position: 'relative', overflow: 'hidden', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(236,210,143,.5)',
    paddingHorizontal: 22, paddingVertical: 10,
  },
  createBtnText: { fontFamily: fonts.serif, color: theme.onGold, fontSize: 14, fontWeight: '700' },
  weekShareBtn: {
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(201,163,92,.45)',
    paddingHorizontal: 18, paddingVertical: 10, marginRight: 10,
  },
  weekShareBtnText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 14 },
  // .yy-fchip row: left-aligned ghost chips; active = gold text + gold border + pale gold fill + 600
  chipsZone: { paddingHorizontal: 20, marginBottom: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fchip: {
    borderWidth: 1, borderColor: theme.chipBorder, borderRadius: 999,
    paddingVertical: 6, paddingHorizontal: 16,
  },
  fchipOn: { borderColor: theme.gold, backgroundColor: 'rgba(201,163,92,.10)' },
  fchipText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13 },
  fchipTextOn: { color: theme.goldHi, fontWeight: '600' },
  // Week nav: outlined square buttons at both ends (navBtn), centered title copy at 13px gold
  weekBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 20, gap: 10 },
  weekBtn: {
    borderWidth: 1, borderColor: 'rgba(201,163,92,.4)', borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 16,
  },
  weekArrow: { color: theme.gold, fontSize: 16, lineHeight: 19 },
  weekLabel: { flex: 1, textAlign: 'center', fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13 },
});
