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
// interactive=false: 只读形态 — 不渲染编辑/解散, 座位不可点
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
// 编辑与解散同为仅车头可见 (2026-10-25 裁决: 编辑车队也只有车头可以):
// 用身份数据比对 (车头 discord id vs 当前 viewer 的 discord id), 不下发
// 权限标志; 服务端在 updateGrouping / disbandGrouping 里独立复验, 这里
// 藏按钮只是界面干净, 不是安全边界。旧车无 creatorDiscordId 时谁都不
// 显示 (与服务端"未记录车头不可编辑/解散"一致)。
const viewerDiscordId = (data as any)?.viewer?.user?.discordId;
const isLeader = !!(g?.creatorDiscordId && viewerDiscordId
&& String(g.creatorDiscordId) === String(viewerDiscordId));

const [commitDelete, deleting] = useMutation<GroupingDetailDeleteMutationType>(GroupingDetailDeleteMutationNode);

const doDelete = () => {
commitDelete({
variables: { id: g!.id},
// 本人删车即时生效: 先把这辆车从全部 tab 的已缓存列表摘掉,
// 返回列表时 (store-or-network 读 store) 就不会再闪现已解散的车。
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

// 完成车队 (仅车头; 服务端 completeGrouping 复验): 成功后本页原地切到
// 已完成态 (onChanged 重查), 并把这辆车从已缓存列表摘掉 — 完成车不进
// 列表, 返回列表时不该再闪现。
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

// 恢复车队 (撤销完成, 仅车头; 服务端 reopenGrouping 复验): 无确认,
// 成功后重查 — 车回到 open 并重新出现在列表里。
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
const shareUrl = `${window.location.origin}/${slug}/car/${g!.id}`;
try {
if (navigator.clipboard) {
await navigator.clipboard.writeText(shareUrl);
toast(page.detailLinkCopied);
return;
}
throw new Error('no clipboard');
} catch {
// 旧浏览器 fallback：隐藏 textarea + execCommand
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
{isLeader && g.status !== 'completed' && (
<button onClick={() => setShowEdit(true)} style={smBtn}>{page.detailEditLabel}</button>
)}
{isLeader && g.status !== 'completed' && (
<button onClick={() => setConfirmComplete(true)} disabled={completing} style={smBtn}>
{completing? page.detailCompletingLabel: page.detailCompleteLabel}
</button>
)}
{isLeader && g.status === 'completed' && (
<button onClick={doRestore} disabled={restoring} style={smBtn}>{page.detailRestoreLabel}</button>
)}
{isLeader && g.status !== 'completed' && (
<button onClick={() => setConfirmDelete(true)} disabled={deleting} style={{...smBtn, color: '#e08080', borderColor: '#a02c1a'}}>
{deleting? page.detailDisbandingLabel: page.detailDisbandLabel}
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

<SeatGrid groupingId={g.id} seats={seats} maxSlots={g.maxSlots} onChanged={onChanged} interactive={interactive} defaultNickname={defaultNickname} text={seatText} />

{confirmDelete && (
<ConfirmDialog
title={page.detailDisbandConfirmTitle}
message={fill(page.detailDisbandConfirmMessageTemplate ?? '', { title: g.title })}
onOk={() => { setConfirmDelete(false); doDelete();}}
onCancel={() => setConfirmDelete(false)}
okLabel={page.confirmOkLabel}
cancelLabel={page.confirmCancelLabel}
/>
)}
{confirmComplete && (
<ConfirmDialog
title={page.detailCompleteConfirmTitle}
message={fill(page.detailCompleteConfirmMessageTemplate ?? '', { title: g.title })}
onOk={() => { setConfirmComplete(false); doComplete();}}
onCancel={() => setConfirmComplete(false)}
okLabel={page.confirmOkLabel}
cancelLabel={page.confirmCancelLabel}
/>
)}
{showEdit && g && isLeader && (
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

// 查询失败（车不存在 / 跨会访问被后端拦截）时显示友好状态，而非整页红字报错
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

// 路由 Entrypoint：报名/取消后 refreshKey+1 重新 preload
// 注意：不能用 network-only —— React 重试 Suspense 子树时会丢弃本组件的 useMemo，
// loadQuery 被重新执行，network-only 每次都强制新请求+重新挂起，形成无限循环（详情页永远转圈）。
// store-and-network：先用缓存渲染，后台网络刷新回填，兼顾刷新语义。
export function GroupingDetailRoute({ slug, groupingId, onBack, interactive = true, defaultNickname, goneText, backText}: {
slug: string;
groupingId: string;
onBack: () => void;
interactive?: boolean;
defaultNickname?: string;
// 详情查询本身失败/车已解散时的兜底文案: 由百业主页 shell 的同名字段
// 经 GuildHome 传入 (详情页数据拿不到时用它兜底, 同一后端文案来源)
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

// 实时推送: 别人改了这辆车 (落座/取消/编辑) -> 直接执行一次详情查询回填
// store, 页面原地更新。别人解散了这辆车 -> 直接切到"车队不存在"视图:
// 不能指望重查报错来切换 —— store 里有热数据时 store-and-network 会先用
// 缓存渲染, 后台重查的错误不会把已渲染的车撤下来。事件来自服务端在
// 删除落库后发的成员通道, 可信。重连 resync 的重查若回"组队不存在"
// 同样切过去。合并短时多次事件: 在途时只记 dirty, 完成后补查一次。
const [gone, setGone] = useState(false);
useEffect(() => { setGone(false); }, [groupingId]);
const liveState = useRef({ inFlight: false, dirty: false });
const refreshDetail = useCallback(() => {
const st = liveState.current;
if (st.inFlight) { st.dirty = true; return; }
st.inFlight = true;
executeQueryRefresh(GroupingDetailQueryNode, { slug, id: groupingId })
.catch(() => {
// 不再按错误文案判断"车不存在" (文案随 locale 变, 匹配不可靠):
// 一律重挂查询 — 车真没了时新查询会抛错, 由 DetailErrBound 切到
// 不存在视图; 瞬时网络错误则从缓存恢复渲染。
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
