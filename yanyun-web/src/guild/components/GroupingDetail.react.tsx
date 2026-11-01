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
import { runShareImage, browserShareImageDeps, shareImageFileName} from '../../lib/shareImage';
import SeatGrid, { type SeatData} from './SeatGrid.react.tsx';
import GroupingForm from './GroupingForm.react.tsx';
import GuildRecapSection from './GuildRecapSection.react.tsx';
import GuildCombatReportSection from './GuildCombatReportSection.react.tsx';

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
      shareImageUrl
      detailShareImageLabel
      detailShareImageSaved
      detailShareImageFailed
      templateSave {
        buttonLabel
        dialogTitle
        nameLabel
        submitLabel
        toastSaved
        toastFailedTemplate
      }
      detailEditLabel
      detailDisbandLabel
      detailDisbandingLabel
      detailStatusOpenLabel
      detailPeopleTemplate
      detailOpenHint
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
      detailReadyProgressTemplate
      seatReadyLabel
      seatReadyActionLabel
      seatUnreadyActionLabel
      seatToastReady
      seatToastUnready
      seatToastReadyFailedTemplate
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
      rosterAnswersTitle
      recap {
        __typename
        ... on GroupingRecapLocked {
          title
          body
        }
        ... on GroupingRecapNotEnabled {
          title
          body
        }
        ... on GroupingRecapEmpty {
          title
          body
          failedHint
          actions {
            generateLabel
            regenerateLabel
            generatingLabel
            confirmTitle
            confirmMessageTemplate
            toastGenerated
            toastFailedTemplate
          }
        }
        ... on GroupingRecapReady {
          title
          paragraphs
          summaryLines
          generatedAtText
          providerText
          versionText
          failedHint
          actions {
            generateLabel
            regenerateLabel
            generatingLabel
            confirmTitle
            confirmMessageTemplate
            toastGenerated
            toastFailedTemplate
          }
        }
      }
      combatReport {
        __typename
        ... on GroupingCombatReportLocked {
          title
          body
        }
        ... on GroupingCombatReportEmpty {
          title
          body
          failedHint
          actions {
            importLabel
            importingLabel
            importHint
            toastImported
            toastImportFailedTemplate
            importErrorFormat
            importErrorValidation
            importErrorLimit
            importErrorForbidden
            importErrorNotFound
            importErrorTier
          }
        }
        ... on GroupingCombatReportReady {
          title
          encountersTitle
          viewReportLabel
          failedHint
          encounters {
            id
            bossName
            startedAtText
            durationText
            resultText
            teamDpsText
            uploaderText
            sourceText
            deleteAction {
              deleteLabel
              confirmTitle
              confirmMessageTemplate
              toastDeleted
              toastDeleteFailedTemplate
            }
          }
          actions {
            importLabel
            importingLabel
            importHint
            toastImported
            toastImportFailedTemplate
            importErrorFormat
            importErrorValidation
            importErrorLimit
            importErrorForbidden
            importErrorNotFound
            importErrorTier
          }
        }
      }
      rosterAnswers {
        uid
        nickname
        fieldId
        fieldLabel
        value
      }
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
      allySharing {
        allyVisible
        visitorSlots
        title
        hint
        allyVisibleLabel
        visitorSlotsLabel
        saveLabel
      }
      schedulingAdvice {
        __typename
        ... on SchedulingAdviceLocked { lockedTitle lockedBody }
        ... on GroupingSchedulingAdvice {
          title hint draftTitle draftApplyLabel substitutesTitle rotationTitle rotationSaveLabel rotationSavedText
          draft { seatIndex discordId displayName role weapon score reasons }
          substitutes { discordId displayName role weapon score reasons }
          rotation { discordId displayName role score reasons }
          rotationRecords { id createdAtText }
        }
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
        readyCount
        maxSlots
        status
        seats {
          index
          nickname
          weapon
          role
          uid
          occupied
          ready
          mine
        }
        customFields {
          id
          label
          fieldType
          options
          required
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

const GroupingDetailAllySharingMutationNode = graphql`
  mutation GroupingDetailAllySharingMutation($slug: String!, $groupingId: ID!, $allyVisible: Boolean!, $visitorSlots: Int!) {
    setGroupingAllySharing(slug: $slug, groupingId: $groupingId, allyVisible: $allyVisible, visitorSlots: $visitorSlots) {
      ok
      error
    }
  }
`;

// Save this grouping's configuration as a guild-shared template. The
// page's templateSave object exists only for members who may create
// groupings (server-composed), so its presence gates the button.
const GroupingDetailSaveTemplateMutationNode = graphql`
  mutation GroupingDetailSaveTemplateMutation($input: SaveGroupingTemplateInput!) {
    saveGroupingTemplate(input: $input) {
      ok
      error
      template {
        id
      }
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

const GroupingDetailApplyDraftMutationNode = graphql`
  mutation GroupingDetailApplyDraftMutation($input: JoinGroupingInput!) {
    joinGrouping(input: $input) { ok error }
  }
`;

const GroupingDetailSaveRotationMutationNode = graphql`
  mutation GroupingDetailSaveRotationMutation($input: SaveRotationAdviceInput!) {
    saveRotationAdvice(input: $input) { ok error savedText }
  }
`;

function GroupingDetail({ queryRef, slug, onBack, onChanged, defaultNickname}: {
queryRef: PreloadedQuery<GroupingDetailQueryType>;
slug: string;
onBack: () => void;
onChanged: () => void;
defaultNickname?: string;
}) {
const [confirmDelete, setConfirmDelete] = useState(false);
const [confirmComplete, setConfirmComplete] = useState(false);
const [showEdit, setShowEdit] = useState(false);
const [showTplSave, setShowTplSave] = useState(false);
const [tplName, setTplName] = useState('');
const [commitSaveTemplate, savingTemplate] = useMutation(GroupingDetailSaveTemplateMutationNode);
const doSaveTemplate = () => {
const ts = page.templateSave;
if (!ts || !g) return;
commitSaveTemplate({
variables: { input: { groupingId: g.id, name: tplName.trim() || g.title } },
onCompleted: (res: any) => {
if (res.saveGroupingTemplate?.ok) {
toast(ts.toastSaved);
setShowTplSave(false);
} else {
toast(fill(ts.toastFailedTemplate ?? '', { error: res.saveGroupingTemplate?.error || unknownErrorText }));
}
},
onError: (e: Error) => toast(fill(ts.toastFailedTemplate ?? '', { error: e.message })),
});
};
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

// Ally sharing control (P20): composed by the server only for viewers
// who manage this grouping; local edits save through the mutation and
// the server re-verifies. Null control = no UI at all.
const allyCtl = page?.allySharing ?? null;
const [allyEnabled, setAllyEnabled] = useState<boolean>(!!allyCtl?.allyVisible);
const [allySlots, setAllySlots] = useState<string>(String(allyCtl?.visitorSlots ?? 0));
const [commitAllySharing, allySaving] = useMutation(GroupingDetailAllySharingMutationNode);
const doSaveAllySharing = () => {
commitAllySharing({
variables: { slug, groupingId: g!.id, allyVisible: allyEnabled, visitorSlots: Math.max(0, parseInt(allySlots || '0', 10) || 0) },
onCompleted: (res: any) => {
if (res.setGroupingAllySharing?.ok) { onChanged(); }
else toast(res.setGroupingAllySharing?.error || unknownErrorText);
},
onError: (e: Error) => toast(e.message),
});
};

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

const [commitApplyDraft, applying] = useMutation(GroupingDetailApplyDraftMutationNode);
const [commitSaveRotation, savingRotation] = useMutation(GroupingDetailSaveRotationMutationNode);
const [rotationSaved, setRotationSaved] = useState(false);
// Apply the P3 draft through the EXISTING seat action (joinGrouping
// proxy join), one seat at a time into the currently empty seats.
// Advice never seats anyone by itself: this runs only on the
// leader's tap, and entries without a recorded weapon are skipped
// (the seat action requires a sect/weapon pick).
const applyDraft = async () => {
  const advice: any = page.schedulingAdvice;
  if (!advice || advice.__typename !== 'GroupingSchedulingAdvice' || !g) return;
  const emptyIdx = seats.filter((x) => !x.occupied).map((x) => x.index);
  const entries = (advice.draft as any[]).filter((d) => d.weapon);
  let seatPos = 0;
  for (const d of entries) {
    if (seatPos >= emptyIdx.length) break;
    const seatIndex = emptyIdx[seatPos++];
    await new Promise<void>((resolve) => {
      commitApplyDraft({
        variables: { input: { groupingId: g.id, nickname: d.displayName, weapon: d.weapon, seatIndex, forDiscordId: d.discordId } },
        onCompleted: () => resolve(), onError: () => resolve(),
      });
    });
  }
  onChanged();
};
const saveRotation = () => {
  if (!g) return;
  commitSaveRotation({
    variables: { input: { groupingId: g.id } },
    onCompleted: (res: any) => { if (res.saveRotationAdvice?.ok) { setRotationSaved(true); onChanged(); } },
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

// Share this grouping's card image: native file share when the
// browser supports it, otherwise download the PNG + copy the short
// link (chat groups like WeChat show no link preview, so the card
// travels as a picture with the link pasted under it).
const shareCardImage = async () => {
const imageUrl = page.shareImageUrl;
if (!imageUrl || !g) return;
const result = await runShareImage(browserShareImageDeps(), {
imageUrl,
fileName: shareImageFileName(imageUrl),
shareText: `${g.title} ${page.shareUrl}`,
linkUrl: page.shareUrl,
});
if (result.kind === 'fallback') {
toast(result.copied ? page.detailShareImageSaved : page.detailCopyFailedManual);
} else if (result.kind === 'failed') {
toast(page.detailShareImageFailed);
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
ready: s.ready,
mine: s.mine,
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
{g.occupiedCount > 0 ? ` · ${fill(page.detailReadyProgressTemplate ?? '', { ready: g.readyCount, occupied: g.occupiedCount })}` : ''}
{g.dungeon?.name? ` · ${g.dungeon.name}`: ''} · {g.status === 'open'? page.detailStatusOpenLabel: g.status === 'completed'? page.detailStatusCompletedLabel: g.status}
</div>
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap'}}>
<button onClick={share} className="yy-btn yy-btn-gold" style={{ padding: '6px 16px', fontSize: 13 }}>{page.detailShareLabel}</button>
{page.shareImageUrl && (
<button onClick={shareCardImage} style={smBtn}>{page.detailShareImageLabel}</button>
)}
{page.templateSave && (
<button onClick={() => { setTplName(g.title); setShowTplSave(true); }} style={smBtn}>{page.templateSave.buttonLabel}</button>
)}
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
</div>
{allyCtl && g.status !== 'completed' && (
<div style={{ marginTop: 12, padding: '10px 12px', border: '1px solid rgba(201,163,92,.25)', borderRadius: 8 }}>
<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
<span style={{ fontSize: 13, color: '#ecd28f' }}>{allyCtl.title}</span>
<label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: theme.muted }}>
<input type="checkbox" checked={allyEnabled} onChange={(e) => setAllyEnabled(e.target.checked)} />
{allyCtl.allyVisibleLabel}
</label>
<label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: theme.muted }}>
{allyCtl.visitorSlotsLabel}
<input type="number" min={0} value={allySlots} onChange={(e) => setAllySlots(e.target.value)} style={{ width: 64 }} />
</label>
<button onClick={doSaveAllySharing} disabled={allySaving} style={smBtn}>{allyCtl.saveLabel}</button>
</div>
<div style={{ fontSize: 12, color: theme.muted, marginTop: 6 }}>{allyCtl.hint}</div>
</div>
)}
{g.status === 'completed'
? <div style={{ color: theme.muted, fontSize: 12, marginTop: 8}}>{page.detailCompletedHint}</div>
: <div style={{ color: theme.muted, fontSize: 12, marginTop: 8}}>{page.detailOpenHint}</div>}
</div>

<SeatGrid groupingId={g.id} slug={slug} seats={seats} maxSlots={g.maxSlots} onChanged={onChanged} defaultNickname={defaultNickname} text={seatText} customFields={g.customFields ?? []} />

{page.schedulingAdvice && (
<div style={{ marginTop: 22 }}>
{page.schedulingAdvice.__typename === 'SchedulingAdviceLocked' ? (
<div style={{ border: theme.border, borderRadius: 8, padding: '12px 14px' }}>
<div style={{ fontSize: 15, color: theme.goldHi, letterSpacing: 2, marginBottom: 6 }}>{page.schedulingAdvice.lockedTitle}</div>
<div style={{ color: theme.muted, fontSize: 13.5 }}>{page.schedulingAdvice.lockedBody}</div>
</div>
) : (
<div>
<div style={{ fontSize: 15, color: theme.goldHi, letterSpacing: 2, marginBottom: 4 }}>{page.schedulingAdvice.title}</div>
<div style={{ color: theme.muted, fontSize: 12.5, marginBottom: 10 }}>{page.schedulingAdvice.hint}</div>
{page.schedulingAdvice.draft.length > 0 && (
<div style={{ marginBottom: 14 }}>
<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
<span style={{ color: theme.paper, fontSize: 14 }}>{page.schedulingAdvice.draftTitle}</span>
<button onClick={applyDraft} disabled={applying} style={smBtn}>{page.schedulingAdvice.draftApplyLabel}</button>
</div>
<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
{page.schedulingAdvice.draft.map((d: any) => (
<div key={d.discordId} style={{ border: theme.border, borderRadius: 8, padding: '7px 12px', fontSize: 13.5, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
<span style={{ color: theme.goldHi }}>{d.displayName}</span>
<span style={{ color: theme.muted }}>{d.role}</span>
<span style={{ color: theme.paper, flex: 1 }}>{d.reasons.join('；')}</span>
</div>
))}
</div>
</div>
)}
{page.schedulingAdvice.substitutes.length > 0 && (
<div style={{ marginBottom: 14 }}>
<div style={{ color: theme.paper, fontSize: 14, marginBottom: 8 }}>{page.schedulingAdvice.substitutesTitle}</div>
<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
{page.schedulingAdvice.substitutes.map((d: any) => (
<div key={d.discordId} style={{ border: theme.border, borderRadius: 8, padding: '7px 12px', fontSize: 13.5, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
<span style={{ color: theme.goldHi }}>{d.displayName}</span>
<span style={{ color: theme.muted }}>{d.role}</span>
<span style={{ color: theme.paper, flex: 1 }}>{d.reasons.join('；')}</span>
</div>
))}
</div>
</div>
)}
{page.schedulingAdvice.rotation.length > 0 && (
<div>
<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
<span style={{ color: theme.paper, fontSize: 14 }}>{page.schedulingAdvice.rotationTitle}</span>
<button onClick={saveRotation} disabled={savingRotation} style={smBtn}>{page.schedulingAdvice.rotationSaveLabel}</button>
{rotationSaved && <span style={{ color: theme.muted, fontSize: 12.5 }}>{page.schedulingAdvice.rotationSavedText}</span>}
</div>
<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
{page.schedulingAdvice.rotation.map((d: any, i: number) => (
<div key={d.discordId} style={{ border: theme.border, borderRadius: 8, padding: '7px 12px', fontSize: 13.5, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
<span style={{ color: theme.muted }}>{i + 1}</span>
<span style={{ color: theme.goldHi }}>{d.displayName}</span>
<span style={{ color: theme.paper, flex: 1 }}>{d.reasons.join('；')}</span>
</div>
))}
</div>
</div>
)}
</div>
)}
</div>
)}

<GuildRecapSection
recap={page.recap}
groupingId={g.id}
groupingTitle={g.title}
confirmOkLabel={page.confirmOkLabel}
confirmCancelLabel={page.confirmCancelLabel}
unknownErrorText={unknownErrorText}
onChanged={onChanged}
/>

<GuildCombatReportSection
combatReport={page.combatReport}
groupingId={g.id}
reportPathBase={slug ? `/${slug}/car/${g.id}/report` : `/car/${g.id}/report`}
confirmOkLabel={page.confirmOkLabel}
confirmCancelLabel={page.confirmCancelLabel}
unknownErrorText={unknownErrorText}
onChanged={onChanged}
/>

{page.rosterAnswers && page.rosterAnswers.length > 0 && (
<div style={{ marginTop: 22 }}>
<div style={{ fontSize: 15, color: theme.goldHi, letterSpacing: 2, marginBottom: 10 }}>{page.rosterAnswersTitle}</div>
<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
{page.rosterAnswers.map((a: any, i: number) => (
<div key={i} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', border: theme.border, borderRadius: 8, padding: '8px 12px', fontSize: 13.5 }}>
<span style={{ color: theme.goldHi }}>{a.nickname}</span>
<span style={{ color: theme.muted }}>{a.fieldLabel}</span>
<span style={{ color: theme.paper, flex: 1 }}>{a.value}</span>
</div>
))}
</div>
</div>
)}

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
{showTplSave && page.templateSave && (
<div style={{
position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 9997,
display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
}} onClick={() => setShowTplSave(false)}>
<div style={{
background: '#1a1814', border: `1px solid ${theme.gold}`, borderRadius: 12,
padding: 24, maxWidth: 360, width: '100%',
}} onClick={(e) => e.stopPropagation()}>
<div style={{ fontSize: 18, color: theme.goldHi, marginBottom: 16 }}>{page.templateSave.dialogTitle}</div>
<div style={{ fontSize: 13, color: theme.muted, marginBottom: 6 }}>{page.templateSave.nameLabel}</div>
<input value={tplName} onChange={(e) => setTplName(e.target.value)} style={{
width: '100%', background: '#1e1b15', border: '1px solid rgba(201,163,92,.3)',
color: theme.paper, borderRadius: 8, padding: '11px 10px', fontSize: 14, boxSizing: 'border-box', marginBottom: 20,
}} />
<div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
<button onClick={() => setShowTplSave(false)} style={{
padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
background: 'transparent', border: `1px solid ${theme.gold}`, color: theme.paper,
}}>{page.confirmCancelLabel}</button>
<button onClick={doSaveTemplate} disabled={savingTemplate} className="yy-btn yy-btn-gold" style={{ padding: '8px 20px', fontSize: 14 }}>
{page.templateSave.submitLabel}
</button>
</div>
</div>
</div>
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
export function GroupingDetailRoute({ slug, groupingId, onBack, defaultNickname, goneText, backText}: {
slug: string;
groupingId: string;
onBack: () => void;
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
defaultNickname={defaultNickname}
/>
</DetailErrBound>
);
}

const smBtn: React.CSSProperties = {
padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
background: 'transparent', border: '1px solid rgba(201,163,92,.4)', color: '#c9a35c',
};
