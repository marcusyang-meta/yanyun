import { useState, useMemo, useRef, useCallback, useEffect, Component} from 'react';
import { graphql, usePreloadedQuery, useMutation, loadQuery} from 'react-relay';
import type { PreloadedQuery} from 'react-relay';
import { relayEnvironment} from '../../lib/relay';
import type { GroupingDetailQuery as GroupingDetailQueryType} from './__generated__/GroupingDetailQuery.graphql';
import type { GroupingDetailDeleteMutation as GroupingDetailDeleteMutationType} from './__generated__/GroupingDetailDeleteMutation.graphql';
import { fill, fmtDate, theme} from '../../lib/format';
import { removeGroupingFromLists} from '../../lib/groupingStore';
import { useGuildLive, executeQueryRefresh} from '../../lib/guildLive';
import { toast, ConfirmDialog} from './Toast.react.tsx';
import SeatGrid, { type SeatData} from './SeatGrid.react.tsx';
import GroupingForm from './GroupingForm.react.tsx';

const GroupingDetailQueryNode = graphql`
  query GroupingDetailQuery($slug: String, $id: ID!) {
    viewer {
      user {
        discordId
      }
      commonUnknownErrorText
    }
    groupingDetailPage(slug: $slug, id: $id) {
      detailNotFoundText
      detailBackToListLabel
      detailShareLabel
      shareUrl
      detailEditLabel
      detailDisbandLabel
      detailDisbandingLabel
      detailStatusOpenLabel
      detailPeopleTemplate
      detailOpenHint
      detailReadonlyHint
      detailToastDisbanded
      detailToastDisbandFailedTemplate
      detailLinkCopied
      detailCopyFailedManual
      detailDisbandConfirmTitle
      detailDisbandConfirmMessageTemplate
      detailCompleteLabel
      detailCompletingLabel
      detailStatusCompletedLabel
      detailRestoreLabel
      detailCompleteConfirmTitle
      detailCompleteConfirmMessageTemplate
      detailToastCompleted
      detailToastCompleteFailedTemplate
      detailToastRestored
      detailToastRestoreFailedTemplate
      detailCompletedHint
      confirmOkLabel
      confirmCancelLabel
      typeShortActivity
      typeShortTalent
      typeShortRace
      typeShortTower
      typeShortGather
      typeShortExplore
      seatEmptyJoinLabel
      seatEmptyLabel
      seatModalTitleTemplate
      seatModalSubtitle
      seatNameLabel
      seatNamePlaceholder
      seatNameRequired
      seatSelfTabLabel
      seatProxyTabLabel
      seatSelfNameHint
      seatProxySearchPlaceholder
      seatProxyPickRequired
      seatProxyEmptyText
      seatSectLabel
      seatCancelLabel
      seatConfirmJoinLabel
      seatJoiningLabel
      seatToastSect
      seatToastJoined
      seatToastJoinFailedTemplate
      seatToastLeft
      seatToastLeaveFailedTemplate
      seatLeaveConfirmTitle
      seatLeaveConfirmMessageTemplate
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
      manageActions {
        editLabel
        completeLabel
        completingLabel
        restoreLabel
        disbandLabel
        disbandingLabel
        disbandConfirmTitle
        disbandConfirmMessageTemplate
        completeConfirmTitle
        completeConfirmMessageTemplate
      }
      grouping {
        id
        title
        type
        creatorDiscordId
        startsAt
        dungeon {
          name
        }
        occupiedCount
        maxSlots
        status
        seats {
          index
          nickname
          weapon
          role
          uid
          occupied
        }
      }
    }
  }
`;

const GroupingDetailDeleteMutationNode = graphql`
  mutation GroupingDetailDeleteMutation($id: ID!) {
    disbandGrouping(id: $id) {
      ok
      error
    }
  }
`;

const GroupingDetailCompleteMutationNode = graphql`
  mutation GroupingDetailCompleteMutation($id: ID!) {
    completeGrouping(id: $id) {
      ok
      error
      grouping {
        id
        status
      }
    }
  }
`;

const GroupingDetailReopenMutationNode = graphql`
  mutation GroupingDetailReopenMutation($id: ID!) {
    reopenGrouping(id: $id) {
      ok
      error
      grouping {
        id
        status
      }
    }
  }
`;

function GroupingDetail({ queryRef, slug, onBack, onChanged, interactive = true, defaultNickname}: {
queryRef: PreloadedQuery<GroupingDetailQueryType>;
slug: string;
onBack: () => void;
onChanged: () => void;
// interactive=false: read-only form — no edit/disband rendering, seats not clickable
interactive?: boolean;
defaultNickname?: string;
}) {
const [confirmDelete, setConfirmDelete] = useState(false);
const [confirmComplete, setConfirmComplete] = useState(false);
const [showEdit, setShowEdit] = useState(false);
const data = usePreloadedQuery<GroupingDetailQueryType>(GroupingDetailQueryNode, queryRef);
const page: any = (data as any)?.groupingDetailPage ?? {};
const g = page?.grouping;
const unknownErrorText: string = (data as any)?.viewer?.commonUnknownErrorText ?? '';
const typeShort: Record<string, string> = {
ACTIVITY: page.typeShortActivity, TALENT: page.typeShortTalent, RACE: page.typeShortRace, TOWER: page.typeShortTower,
GATHER: page.typeShortGather, EXPLORE: page.typeShortExplore,
};
const seatText = { ...page, unknownErrorText };
const formText = { ...page, unknownErrorText };
// Manage actions (edit / complete / restore / disband) are composed
// by the server: page.manageActions exists only when the viewer may
// manage this grouping — the leader, or an admin of this guild
// (ruling 2026-10-26: guild admins manage every grouping in their
// guild with the leader's rights). The client renders what it is
// given and holds no permission logic of its own; the server
// re-verifies independently in the four mutations, so the buttons'
// presence here is composition, not a security boundary.
const ma = page?.manageActions ?? null;
const canManage = !!ma;

const [commitDelete, deleting] = useMutation<GroupingDetailDeleteMutationType>(GroupingDetailDeleteMutationNode);

const doDelete = () => {
commitDelete({
variables: { id: g!.id},
// Own disband takes effect immediately: remove this grouping from every
// tab's cached list first, so returning to the list (store-or-network reads
// the store) doesn't flash the disbanded grouping again.
updater: (store) => { removeGroupingFromLists(store, slug, g!.id); },
onCompleted: (res) => {
if (res.disbandGrouping?.ok) {
toast(page.detailToastDisbanded);
onBack();
} else {
toast(fill(page.detailToastDisbandFailedTemplate ?? '', { error: res.disbandGrouping?.error || unknownErrorText }));
}
},
onError: (e: Error) => toast(fill(page.detailToastDisbandFailedTemplate ?? '', { error: e.message })),
});
};

// Complete the grouping (leader or guild admin; the server re-verifies in
// completeGrouping): on success this page switches in place to the completed
// state (onChanged refetch) and the grouping is removed from cached lists —
// completed groupings don't appear in lists and must not flash on return.
const [commitComplete, completing] = useMutation(GroupingDetailCompleteMutationNode);
const doComplete = () => {
commitComplete({
variables: { id: g!.id},
updater: (store) => { removeGroupingFromLists(store, slug, g!.id); },
onCompleted: (res: any) => {
if (res.completeGrouping?.ok) {
toast(page.detailToastCompleted);
onChanged();
} else {
toast(fill(page.detailToastCompleteFailedTemplate ?? '', { error: res.completeGrouping?.error || unknownErrorText }));
}
},
onError: (e: Error) => toast(fill(page.detailToastCompleteFailedTemplate ?? '', { error: e.message })),
});
};

// Restore the grouping (undo completion; leader or guild admin, server re-verifies in
// reopenGrouping): no confirmation; on success, refetch.
const [commitReopen, restoring] = useMutation(GroupingDetailReopenMutationNode);
const doRestore = () => {
commitReopen({
variables: { id: g!.id},
onCompleted: (res: any) => {
if (res.reopenGrouping?.ok) {
toast(page.detailToastRestored);
onChanged();
} else {
toast(fill(page.detailToastRestoreFailedTemplate ?? '', { error: res.reopenGrouping?.error || unknownErrorText }));
}
},
onError: (e: Error) => toast(fill(page.detailToastRestoreFailedTemplate ?? '', { error: e.message })),
});
};

const share = async () => {
const shareUrl = page.shareUrl;
try {
if (navigator.clipboard) {
await navigator.clipboard.writeText(shareUrl);
toast(page.detailLinkCopied);
return;
}
throw new Error('no clipboard');
} catch {
// Legacy-browser fallback: hidden textarea + execCommand
try {
const ta = document.createElement('textarea');
ta.value = shareUrl;
ta.style.position = 'fixed';
ta.style.opacity = '0';
document.body.appendChild(ta);
ta.select();
document.execCommand('copy');
document.body.removeChild(ta);
toast(page.detailLinkCopied);
} catch {
toast(page.detailCopyFailedManual);
}
}
};

if (!g) return (
<div style={{ color: theme.muted, padding: 32, textAlign: 'center'}}>
{page.detailNotFoundText}
<div style={{ marginTop: 16 }}>
<button onClick={onBack} style={{ background: 'none', border: 'none', color: theme.gold, cursor: 'pointer', fontSize: 15 }}>{page.detailBackToListLabel}</button>
</div>
</div>
);

const seats: SeatData[] = ((g.seats ?? []) as any[]).map((s: any) => ({
index: s.index,
nickname: s.nickname,
weapon: s.weapon,
role: s.role,
uid: s.uid,
occupied: s.occupied,
}));

return (
<div>
<div style={{ marginBottom: 20}}>
<button onClick={onBack} style={{
background: 'none', border: 'none', color: theme.gold, cursor: 'pointer',
fontSize: 15, padding: 0, marginBottom: 12,
}}>{page.detailBackToListLabel}</button>
<h2 style={{ color: theme.goldHi, fontSize: 24, margin: '0 0 8px', letterSpacing: 2}}>
<span style={{
display: 'inline-block', fontSize: 12, color: theme.goldHi,
border: `1px solid ${theme.gold}`, borderRadius: 4, padding: '2px 8px', marginRight: 8,
verticalAlign: 'middle',
}}>{typeShort[g.type] ?? g.type}</span>
{g.title}
</h2>
<div style={{ color: theme.muted, fontSize: 13, marginBottom: 12}}>
{fmtDate(g.startsAt)} · {fill(page.detailPeopleTemplate ?? '', { occupied: g.occupiedCount, max: g.maxSlots })}
{g.dungeon?.name? ` · ${g.dungeon.name}`: ''} · {g.status === 'open'? page.detailStatusOpenLabel: g.status === 'completed'? page.detailStatusCompletedLabel: g.status}
</div>
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap'}}>
<button onClick={share} className="yy-btn yy-btn-gold" style={{ padding: '6px 16px', fontSize: 13 }}>{page.detailShareLabel}</button>
{interactive && (
<>
{canManage && g.status !== 'completed' && (
<button onClick={() => setShowEdit(true)} style={smBtn}>{ma.editLabel}</button>
)}
{canManage && g.status !== 'completed' && (
<button onClick={() => setConfirmComplete(true)} disabled={completing} style={smBtn}>
{completing? ma.completingLabel: ma.completeLabel}
</button>
)}
{canManage && g.status === 'completed' && (
<button onClick={doRestore} disabled={restoring} style={smBtn}>{ma.restoreLabel}</button>
)}
{canManage && g.status !== 'completed' && (
<button onClick={() => setConfirmDelete(true)} disabled={deleting} style={{...smBtn, color: '#e08080', borderColor: '#a02c1a'}}>
{deleting? ma.disbandingLabel: ma.disbandLabel}
</button>
)}
</>
)}
</div>
{g.status === 'completed'
? <div style={{ color: theme.muted, fontSize: 12, marginTop: 8}}>{page.detailCompletedHint}</div>
: interactive
? <div style={{ color: theme.muted, fontSize: 12, marginTop: 8}}>{page.detailOpenHint}</div>
: <div style={{ color: theme.muted, fontSize: 12, marginTop: 8}}>{page.detailReadonlyHint}</div>}
</div>

<SeatGrid groupingId={g.id} slug={slug} seats={seats} maxSlots={g.maxSlots} onChanged={onChanged} interactive={interactive} defaultNickname={defaultNickname} text={seatText} />

{confirmDelete && ma && (
<ConfirmDialog
title={ma.disbandConfirmTitle}
message={fill(ma.disbandConfirmMessageTemplate ?? '', { title: g.title })}
onOk={() => { setConfirmDelete(false); doDelete();}}
onCancel={() => setConfirmDelete(false)}
okLabel={page.confirmOkLabel}
cancelLabel={page.confirmCancelLabel}
/>
)}
{confirmComplete && ma && (
<ConfirmDialog
title={ma.completeConfirmTitle}
message={fill(ma.completeConfirmMessageTemplate ?? '', { title: g.title })}
onOk={() => { setConfirmComplete(false); doComplete();}}
onCancel={() => setConfirmComplete(false)}
okLabel={page.confirmOkLabel}
cancelLabel={page.confirmCancelLabel}
/>
)}
{showEdit && g && canManage && (
<GroupingForm
slug=""
text={formText}
mode="edit"
groupingId={g.id}
initial={{ title: g.title ?? '', type: g.type, startsAt: g.startsAt ?? '' }}
onClose={() => setShowEdit(false)}
onDone={() => { setShowEdit(false); onChanged(); }}
/>
)}
</div>
);
}

// On query failure (grouping doesn't exist / cross-guild access blocked by
// the backend), show a friendly state instead of a full-page red error
class DetailErrBound extends Component<{ onBack: () => void; goneText: string; backText: string; children: any }, { err: any }> {
state = { err: null as any };
static getDerivedStateFromError(err: any) { return { err }; }
render() {
if (this.state.err) {
return (
<div style={{ color: theme.muted, padding: 32, textAlign: 'center' }}>
{this.props.goneText}
<div style={{ marginTop: 16 }}>
<button onClick={this.props.onBack} style={{ background: 'none', border: 'none', color: theme.gold, cursor: 'pointer', fontSize: 15 }}>{this.props.backText}</button>
</div>
</div>
);
}
return this.props.children;
}
}

// Route entrypoint: after signup/cancel, refreshKey+1 re-preloads.
// Do NOT use network-only here: when React retries a Suspense subtree it
// discards this component's useMemo, loadQuery re-executes, and network-only
// would force a new request + re-suspend every time — an infinite loop (the
// detail page spins forever). store-and-network renders from cache first and
// backfills from a background network refresh.
export function GroupingDetailRoute({ slug, groupingId, onBack, interactive = true, defaultNickname, goneText, backText}: {
slug: string;
groupingId: string;
onBack: () => void;
interactive?: boolean;
defaultNickname?: string;
// Fallback copy for when the detail query itself fails / the grouping was
// disbanded: passed in via GuildHome from the guild home shell's same-named
// fields (used when the detail page's own data is unavailable; same backend
// copy source)
goneText: string;
backText: string;
}) {
const [refreshKey, setRefreshKey] = useState(0);
const queryRef = useMemo(
() => loadQuery<GroupingDetailQueryType>(
relayEnvironment,
GroupingDetailQueryNode,
{ slug, id: groupingId},
{ fetchPolicy: 'store-and-network' }
),
[groupingId, refreshKey]
);

// Live push: someone else changed this grouping (seat/leave/edit) -> run the
// detail query once to backfill the store and update the page in place.
// Someone else disbanded it -> switch straight to the "grouping doesn't
// exist" view: a refetch error cannot be relied on for this — with warm data
// in the store, store-and-network renders from cache first and the background
// refetch's error won't unmount the already-rendered grouping. The event
// comes over the members channel the server sends on after the delete is
// persisted, so it is trustworthy. A reconnect-resync refetch that reports
// "grouping doesn't exist" switches the same way. Burst events are coalesced:
// while one refresh is in flight, only mark dirty and run one more after.
const [gone, setGone] = useState(false);
useEffect(() => { setGone(false); }, [groupingId]);
const liveState = useRef({ inFlight: false, dirty: false });
const refreshDetail = useCallback(() => {
const st = liveState.current;
if (st.inFlight) { st.dirty = true; return; }
st.inFlight = true;
executeQueryRefresh(GroupingDetailQueryNode, { slug, id: groupingId })
.catch(() => {
// No longer judge "grouping doesn't exist" by error text (copy varies by
// locale, so matching is unreliable): always remount the query — if the
// grouping is truly gone the new query throws and DetailErrBound switches to
// the not-found view; a transient network error recovers from cache.
setRefreshKey((k) => k + 1);
})
.finally(() => {
st.inFlight = false;
if (st.dirty) { st.dirty = false; refreshDetail(); }
});
}, [slug, groupingId]);
useGuildLive(slug, (ev) => {
if (ev.resync) { refreshDetail(); return; }
if (ev.groupingId !== groupingId) return;
if (ev.kind === 'deleted') { setGone(true); return; }
refreshDetail();
});

if (gone) {
return (
<div style={{ color: theme.muted, padding: 32, textAlign: 'center' }}>
{goneText}
<div style={{ marginTop: 16 }}>
<button onClick={onBack} style={{ background: 'none', border: 'none', color: theme.gold, cursor: 'pointer', fontSize: 15 }}>{backText}</button>
</div>
</div>
);
}
return (
<DetailErrBound onBack={onBack} goneText={goneText} backText={backText}>
<GroupingDetail
queryRef={queryRef}
slug={slug}
onBack={onBack}
onChanged={() => setRefreshKey((k) => k + 1)}
interactive={interactive}
defaultNickname={defaultNickname}
/>
</DetailErrBound>
);
}

const smBtn: React.CSSProperties = {
padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
background: 'transparent', border: '1px solid rgba(201,163,92,.4)', color: '#c9a35c',
};
