import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { graphql, usePreloadedQuery, loadQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import { relayEnvironment } from '../../lib/relay';
import { useGuildLive, executeQueryRefresh } from '../../lib/guildLive';
import type { ViewerGuildGroupingsQuery as GroupingListQueryType } from './__generated__/ViewerGuildGroupingsQuery.graphql';
import { fill, fmtDate, weekRangeLabel, getWeekRange, parseStartsAt, theme } from '../../lib/format';
import GroupingForm from './GroupingForm.react.tsx';

const TABS = [
  { key: 'ACTIVITY' },
  { key: 'TALENT' },
  { key: 'RACE' },
  { key: 'TOWER' },
] as const;

type TabKey = typeof TABS[number]['key'];

const GroupingListQueryNode = graphql`
  query ViewerGuildGroupingsQuery($slug: String!, $tab: GroupingTab!) {
    viewer {
      commonUnknownErrorText
      guild(slug: $slug) {
        __typename
        ... on Guild {
          groupings(tab: $tab) {
            currentVersion
            crossCarAdvice {
              __typename
              ... on SchedulingAdviceLocked { lockedTitle lockedBody }
              ... on SchedulingCrossCarAdvice { title conflicts { discordId text } moves { carId text entry { displayName } } }
            }
            tabActivityLabel
            tabTalentLabel
            tabRaceLabel
            tabTowerLabel
            typeShortActivity
            typeShortTalent
            typeShortRace
            typeShortTower
            typeShortGather
            typeShortExplore
            prevWeekLabel
            nextWeekLabel
            weekHeaderTemplate
            dayGroupHeaderTemplate
            weekdayNames
            undatedGroupLabel
            emptyInteractiveText
            statusOpenLabel
            peopleTemplate
            newCarLabel
            sealText
            formCreateTitle
            formEditTitle
            formTypeLabel
            formTypeActivityLabel
            formTypeTalentLabel
            formTypeRaceLabel
            formTypeTowerLabel
            formCapacityTemplate
            formHintActivity
            formHintDungeonTemplate
            formHintTalent
            formHintRace
            formHintTower
            formTitleLabel
            formTitlePlaceholder
            formStartsLabel
            formMonthTemplate
            formDayTemplate
            formHourTemplate
            formMinuteTemplate
            formDungeonLabel
            formDungeonNoneLabel
            formNicknameLabel
            formNicknamePlaceholder
            formSectLabel
            formCancelLabel
            formSubmitCreateLabel
            formSubmitEditLabel
            formSubmittingLabel
            formToastSect
            formToastSaved
            formToastSaveFailedTemplate
            formToastPosted
            formToastCreateFailedTemplate
            formTitleTemplate
            formCustomFieldsTitle
            formCustomFieldAddLabel
            formCustomFieldLabelPlaceholder
            formCustomFieldTypeText
            formCustomFieldTypeChoice
            formCustomFieldOptionsPlaceholder
            formCustomFieldRequiredLabel
            formCustomFieldRemoveLabel
            formCustomFieldEmptyText
            templateSectionTitle
            templateNameLabel
            templateNamePlaceholder
            templateSaveLabel
            templateUpdateLabel
            templateEditingNoticeTemplate
            templateCancelEditLabel
            templateEmptyText
            templateWhenTodayTemplate
            templateWhenTomorrowTemplate
            templateWhenDaysTemplate
            templateToastSaved
            templateToastSaveFailedTemplate
            templateToastDeleted
            templateToastDeleteFailedTemplate
            templateMetaTemplate
            groupingTemplates {
              id
              name
              type
              title
              dungeonName
              dungeonId
              maxSlots
              startDaysAhead
              startHour
              startMinute
              creatorName
              customFields {
                id
                label
                fieldType
                options
                required
              }
              manageActions {
                editLabel
                deleteLabel
                deleteConfirmTitle
                deleteConfirmMessageTemplate
              }
            }
            groupings {
              id
              title
              type
              startsAt
              dungeon {
                name
              }
              occupiedCount
              maxSlots
              status
            }
          }
        }
      }
    }
  }
`;

function GroupingList({ queryRef, tab, onTabChange, onSelect }: {
  queryRef: PreloadedQuery<GroupingListQueryType>;
  tab: TabKey;
  onTabChange: (t: TabKey) => void;
  onSelect: (id: string) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const data = usePreloadedQuery<GroupingListQueryType>(GroupingListQueryNode, queryRef);
  const page: any = (data as any)?.viewer?.guild?.groupings ?? {};
  const all: any[] = page?.groupings ?? [];
  const tabLabel: Record<string, string> = {
    ACTIVITY: page.tabActivityLabel, TALENT: page.tabTalentLabel, RACE: page.tabRaceLabel, TOWER: page.tabTowerLabel,
  };
  const typeShort: Record<string, string> = {
    ACTIVITY: page.typeShortActivity, TALENT: page.typeShortTalent, RACE: page.typeShortRace, TOWER: page.typeShortTower,
    GATHER: page.typeShortGather, EXPLORE: page.typeShortExplore,
  };
  const { start, end } = getWeekRange(weekOffset);
  const events = all.filter((e) => {
    // No start time: keep the legacy behavior — listed in every week.
    if (!e.startsAt) return true;
    const d = parseStartsAt(e.startsAt);
    // Has a time but it won't parse: exclude from every week view. This used
    // to return true on parse failure, and the old parser always failed on
    // epoch-seconds strings ("1792963800Z" is not a valid date), so epoch
    // groupings were poisoned into every week — the root cause of "the same
    // grouping shows up this week and next". Never fall back to "show it
    // everywhere" again.
    if (!d) return false;
    return d >= start && d < end;
  });

  // Within one screen (one week), group by natural day in the viewer's local
  // timezone (ruling, 2026-10-25): groups ascending by date, items ascending
  // by start time. Group headers come from the backend dayGroupHeaderTemplate
  // plus the backend weekdayNames table (indexes aligned with getDay) — the
  // client only fills in numbers, never assembles copy. Groupings without a
  // start time keep the legacy "listed every week" semantics and go into one
  // trailing "undated" group (undatedGroupLabel is also backend copy): dated
  // groupings present first, undated last.
  type ListSection = { key: string; header: string; items: any[] };
  const sections: ListSection[] = (() => {
    const dated: { e: any; d: Date }[] = [];
    const undated: any[] = [];
    for (const e of events) {
      if (!e.startsAt) { undated.push(e); continue; }
      const d = parseStartsAt(e.startsAt);
      if (d) dated.push({ e, d });
    }
    dated.sort((a, b) => a.d.getTime() - b.d.getTime());
    const out: ListSection[] = [];
    for (const { e, d } of dated) {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const last = out[out.length - 1];
      if (last && last.key === key) { last.items.push(e); continue; }
      out.push({
        key,
        header: fill(page.dayGroupHeaderTemplate ?? '', {
          month: d.getMonth() + 1,
          day: d.getDate(),
          weekday: (page.weekdayNames ?? [])[d.getDay()] ?? '',
        }),
        items: [e],
      });
    }
    if (undated.length) out.push({ key: 'undated', header: page.undatedGroupLabel ?? '', items: undated });
    return out;
  })();

  let cardIdx = 0;
  const renderCard = (e: any) => {
    const i = cardIdx++;
    return (
          <button
            key={e.id}
            onClick={() => onSelect(e.id)}
            className="yy-card yy-card-hover"
            style={{
              // @ts-ignore stagger
              '--i': i,
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              color: theme.paper, fontFamily: 'inherit', fontSize: 'inherit',
            }}
          >
            <span style={{
              width: 36, height: 36, borderRadius: 6, flexShrink: 0,
              background: theme.seal, color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700,
            }}>{page.sealText}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 15 }}>
                <span style={{
                  display: 'inline-block', fontSize: 11, color: theme.goldHi,
                  border: `1px solid ${theme.gold}`, borderRadius: 4, padding: '1px 6px', marginRight: 6,
                }}>{typeShort[e.type] ?? e.type}</span>
                {e.title}
              </span>
              <span style={{ display: 'block', fontSize: 12, color: theme.muted, marginTop: 4 }}>
                {fmtDate(e.startsAt)} · {fill(page.peopleTemplate ?? '', { occupied: e.occupiedCount, max: e.maxSlots })}
                {e.dungeon?.name ? ` · ${e.dungeon.name}` : ''}
              </span>
            </span>
            <span style={{
              fontSize: 12, color: e.status === 'open' ? '#7fc97f' : theme.muted,
              border: `1px solid ${e.status === 'open' ? '#7fc97f' : theme.muted}`,
              borderRadius: 4, padding: '2px 8px', flexShrink: 0,
            }}>{e.status === 'open' ? page.statusOpenLabel : e.status}</span>
            <span style={{ color: theme.gold, fontSize: 18 }}>›</span>
          </button>
    );
  };

  return (
    <div>
      {/* Type filter (secondary level): small outlined ghost chips, lower in the hierarchy than the primary tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`yy-fchip${tab === t.key ? ' active' : ''}`}
            onClick={() => { onTabChange(t.key); setWeekOffset(0); }}
          >{tabLabel[t.key]}</button>
        ))}
      </div>

      {/* Week navigation: weekRangeLabel shares getWeekRange with the filter
          above; the displayed end minus 1 minute reads as a closed interval,
          while the filter boundary stays start/end themselves */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
        <button onClick={() => setWeekOffset((w) => w - 1)} style={navBtn} aria-label={page.prevWeekLabel}>‹</button>
        <span style={{ color: theme.goldHi, fontSize: 13, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fill(page.weekHeaderTemplate ?? '', { range: weekRangeLabel(weekOffset), count: events.length })}
        </span>
        <button onClick={() => setWeekOffset((w) => w + 1)} style={navBtn} aria-label={page.nextWeekLabel}>›</button>
      </div>

      {/* P13 cross-car advice (Premium T2 advice layer; the list itself stays free) */}
      {page.crossCarAdvice && (
        <div style={{ marginBottom: 16 }}>
          {page.crossCarAdvice.__typename === 'SchedulingAdviceLocked' ? (
            <div style={{ border: theme.border, borderRadius: 8, padding: '10px 14px' }}>
              <span style={{ color: theme.goldHi, fontSize: 14 }}>{page.crossCarAdvice.lockedTitle}</span>
              <div style={{ color: theme.muted, fontSize: 13, marginTop: 4 }}>{page.crossCarAdvice.lockedBody}</div>
            </div>
          ) : (page.crossCarAdvice.conflicts.length > 0 || page.crossCarAdvice.moves.length > 0) ? (
            <div style={{ border: theme.border, borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ color: theme.goldHi, fontSize: 14, marginBottom: 6 }}>{page.crossCarAdvice.title}</div>
              {page.crossCarAdvice.conflicts.map((c: any) => (
                <div key={c.discordId} style={{ color: '#e0a080', fontSize: 13, marginBottom: 4 }}>{c.text}</div>
              ))}
              {page.crossCarAdvice.moves.map((m: any, i: number) => (
                <div key={i} style={{ color: theme.paper, fontSize: 13, marginBottom: 4 }}>{m.text}</div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* Grouping list, grouped by day (group header = date + a thin gold rule, same theme as the cards) */}
      <div className="yy-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!events.length && (
          <div style={{ color: theme.muted, textAlign: 'center', padding: 32 }}>{page.emptyInteractiveText}</div>
        )}
        {sections.map((sec, si) => (
          <div key={sec.key} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: si === 0 ? 2 : 10, padding: '0 2px' }}>
              <span style={{ color: theme.goldHi, fontSize: 13, letterSpacing: 1, whiteSpace: 'nowrap' }}>{sec.header}</span>
              <span style={{ flex: 1, height: 1, background: 'rgba(201,163,92,.18)' }} />
            </div>
            {sec.items.map((e) => renderCard(e))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function GroupingListRoute({ slug, defaultNickname }: { slug: string; defaultNickname?: string }) {
  const [tab, setTab] = useState<TabKey>('ACTIVITY');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const queryRef = useMemo(
    () => loadQuery<GroupingListQueryType>(
      relayEnvironment,
      GroupingListQueryNode,
      { slug, tab },
      { fetchPolicy: 'store-or-network' }
    ),
    [slug, tab]
  );

  // Live refresh: any grouping-changed event (including the push echo of own
  // actions) / reconnect resync -> run each tab's list query once to backfill
  // the store; mounted lists update in place. Do not rely on "refreshKey +
  // loadQuery(store-or-network)" for this: when the store already has the
  // data it issues no network request at all — the root cause of the earlier
  // "list doesn't refresh after posting a grouping". executeQueryRefresh
  // always hits the network and bypasses Suspense, so no suspend loop; the
  // backfill emits no new events, so no self-excitation. Burst events are
  // coalesced into one round.
  const liveState = useRef({ inFlight: false, dirty: false });
  const refreshAllTabs = useCallback(() => {
    const st = liveState.current;
    if (st.inFlight) { st.dirty = true; return; }
    st.inFlight = true;
    Promise.all(TABS.map((t) => executeQueryRefresh(GroupingListQueryNode, { slug, tab: t.key }).catch(() => {})))
      .finally(() => {
        st.inFlight = false;
        if (st.dirty) { st.dirty = false; refreshAllTabs(); }
      });
  }, [slug]);
  useGuildLive(slug, () => { refreshAllTabs(); });

  const routeData = usePreloadedQuery<GroupingListQueryType>(GroupingListQueryNode, queryRef);
  const pageText: any = (routeData as any)?.viewer?.guild?.groupings ?? {};
  const unknownErrorText: string = (routeData as any)?.viewer?.commonUnknownErrorText ?? '';
  const formText = { ...pageText, unknownErrorText };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={() => setShowForm(true)} className="yy-btn yy-btn-gold" style={{
          padding: '10px 24px', fontSize: 14,
        }}>{pageText.newCarLabel}</button>
      </div>
      <GroupingList
        queryRef={queryRef}
        tab={tab}
        onTabChange={setTab}
        onSelect={(id) => navigate(`/${slug}/car/${id}`)}
      />
      {showForm && (
        <GroupingForm
          slug={slug}
          mode="create"
          text={formText}
          defaultType={tab}
          defaultNickname={defaultNickname}
          templates={pageText.groupingTemplates ?? []}
          onTemplatesChanged={refreshAllTabs}
          onClose={() => setShowForm(false)}
          onDone={() => { setShowForm(false); /* the form's updater already inserted the new grouping into the list; the push echo refetch realigns ordering */ }}
        />
      )}
    </>
  );
}

const navBtn: React.CSSProperties = {
  padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 16, lineHeight: 1.2,
  flexShrink: 0,
  background: 'transparent', border: '1px solid rgba(201,163,92,.4)', color: '#c9a35c',
};
