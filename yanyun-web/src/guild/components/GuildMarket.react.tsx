import { useState } from 'react';
import { graphql, useLazyLoadQuery, useMutation, useRelayEnvironment } from 'react-relay';
import { fetchQuery } from 'relay-runtime';
import { theme } from '../../lib/format';
import { toast } from './Toast.react.tsx';
import { utcToLocal, localToUtc, type LocalSlot } from './AvailabilityEditor.react.tsx';

// Fill-in market tab (P19), member branch only. Per-edge pricing is
// composed by the server: the supply section (my offer + invitation
// inbox) is free for every member; the demand section composes as a
// locked variant with zero data below tier 3. Matching never seats
// anybody — the only seat action rendered is the demand side's
// explicit manual seat button on an accepted invite. All copy comes
// from the fillMarket page shell; this component holds no UI strings.

const MarketQueryNode = graphql`
  query GuildMarketQuery($slug: String!) {
    viewer {
      commonUnknownErrorText
      fillMarket(slug: $slug) {
        __typename
        ... on FillMarketLocked {
          lockedTitle
          lockedBody
        }
        ... on FillMarketPage {
          marketTitle
          marketBody
          weekdayNames
          supply {
            supplyTitle
            supplyHint
            supplyEmptyText
            schoolLabel
            windowsLabel
            noteLabel
            notePlaceholder
            publishLabel
            withdrawLabel
            inboxTitle
            inboxEmptyText
            acceptLabel
            declineLabel
            myOffer {
              id
              school
              roleLabel
              note
              windows { weekday startMinute endMinute }
            }
            myInvites {
              id
              status
              statusLabel
              sourcePattern
            }
          }
          demand {
            __typename
            ... on FillDemandLocked {
              lockedTitle
              lockedBody
            }
            ... on FillDemandSection {
              demandTitle
              requestsTitle
              requestsEmptyText
              offersTitle
              offersEmptyText
              noManageHint
              requests {
                id
                groupingId
                groupingTitle
                startsAtText
                neededRoleLabel
                neededSchool
                note
                statusLabel
                manageActions {
                  closeLabel
                  seatLabel
                  seatedLabel
                  inviteLabel
                  invitedLabel
                  invites {
                    id
                    requestId
                    offerId
                    status
                    statusLabel
                    toName
                    seatAction { seatLabel }
                  }
                }
              }
              offers {
                id
                displayName
                school
                roleLabel
                note
                homeGuildPattern
                windows { weekday startMinute endMinute }
              }
              manage {
                createTitle
                groupingLabel
                neededRoleLabel
                neededSchoolLabel
                noteLabel
                createLabel
                roleHealerLabel
                roleDpsLabel
                myGroupings { id title }
              }
            }
          }
        }
      }
    }
  }
`;

const PublishOfferMutationNode = graphql`
  mutation GuildMarketPublishOfferMutation($slug: String!, $school: String!, $windows: [AvailabilitySlotInput!]!, $note: String) {
    publishFillOffer(slug: $slug, school: $school, windows: $windows, note: $note) { ok error }
  }
`;
const WithdrawOfferMutationNode = graphql`
  mutation GuildMarketWithdrawOfferMutation {
    withdrawFillOffer { ok error }
  }
`;
const RespondInviteMutationNode = graphql`
  mutation GuildMarketRespondInviteMutation($inviteId: ID!, $accept: Boolean!) {
    respondFillInvite(inviteId: $inviteId, accept: $accept) { ok error }
  }
`;
const CreateRequestMutationNode = graphql`
  mutation GuildMarketCreateRequestMutation($slug: String!, $groupingId: ID!, $neededRole: String!, $neededSchool: String, $note: String) {
    createFillRequest(slug: $slug, groupingId: $groupingId, neededRole: $neededRole, neededSchool: $neededSchool, note: $note) { ok error }
  }
`;
const CloseRequestMutationNode = graphql`
  mutation GuildMarketCloseRequestMutation($slug: String!, $requestId: ID!) {
    closeFillRequest(slug: $slug, requestId: $requestId) { ok error }
  }
`;
const InviteSupplierMutationNode = graphql`
  mutation GuildMarketInviteSupplierMutation($slug: String!, $requestId: ID!, $offerId: ID!) {
    inviteFillSupplier(slug: $slug, requestId: $requestId, offerId: $offerId) { ok error }
  }
`;
const SeatSupplierMutationNode = graphql`
  mutation GuildMarketSeatSupplierMutation($slug: String!, $inviteId: ID!) {
    seatFillSupplier(slug: $slug, inviteId: $inviteId) { ok error }
  }
`;

const card: React.CSSProperties = {
  border: '1px solid rgba(201,163,92,.25)', borderRadius: 10, padding: '14px 16px', marginBottom: 12,
};
const rowBtn: React.CSSProperties = {
  padding: '5px 14px', fontSize: 13, borderRadius: 6, cursor: 'pointer',
  background: 'transparent', color: '#ecd28f', border: '1px solid rgba(201,163,92,.45)',
};
const input: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,163,92,.3)', borderRadius: 6,
  color: '#eee', padding: '6px 8px', fontSize: 13, minWidth: 0,
};

function WindowsText({ windows, weekdayNames }: { windows: any[]; weekdayNames: string[] }) {
  if (!windows?.length) return null;
  return (
    <span style={{ color: theme.muted, fontSize: 12 }}>
      {windows.map((w, i) => {
        const l = utcToLocal(w);
        return <span key={i}>{i > 0 ? ' · ' : ''}{weekdayNames[l.weekday] ?? ''} {l.start}–{l.end}</span>;
      })}
    </span>
  );
}

export function GuildMarketRoute({ slug }: { slug: string }) {
  const environment = useRelayEnvironment();
  const data = useLazyLoadQuery<any>(MarketQueryNode, { slug }, { fetchPolicy: 'store-or-network' });
  const refetchPage = () => { fetchQuery(environment, MarketQueryNode, { slug }).toPromise().catch(() => {}); };
  const unknownErrorText: string = data?.viewer?.commonUnknownErrorText ?? '';
  const page: any = data?.viewer?.fillMarket ?? {};

  const [commitPublish] = useMutation<any>(PublishOfferMutationNode);
  const [commitWithdraw] = useMutation<any>(WithdrawOfferMutationNode);
  const [commitRespond] = useMutation<any>(RespondInviteMutationNode);
  const [commitCreate] = useMutation<any>(CreateRequestMutationNode);
  const [commitClose] = useMutation<any>(CloseRequestMutationNode);
  const [commitInvite] = useMutation<any>(InviteSupplierMutationNode);
  const [commitSeat] = useMutation<any>(SeatSupplierMutationNode);

  const [school, setSchool] = useState('');
  const [note, setNote] = useState('');
  const [rows, setRows] = useState<LocalSlot[]>([{ weekday: 5, start: '19:00', end: '23:00' }]);
  const [reqGroupingId, setReqGroupingId] = useState('');
  const [reqRole, setReqRole] = useState('HEALER');
  const [reqSchool, setReqSchool] = useState('');
  const [reqNote, setReqNote] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('');

  if (page.__typename === 'FillMarketLocked' || !page.marketTitle) {
    return (
      <div style={card}>
        <h3 style={{ color: '#ecd28f', margin: '4px 0 8px' }}>{page.lockedTitle ?? ''}</h3>
        <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{page.lockedBody ?? ''}</p>
      </div>
    );
  }

  const supply = page.supply ?? {};
  const demand = page.demand ?? {};
  const weekdayNames: string[] = page.weekdayNames ?? [];
  const isDemand = demand.__typename === 'FillDemandSection';
  const manage = isDemand ? demand.manage : null;
  const managedRequests = isDemand ? (demand.requests ?? []).filter((r: any) => r.manageActions) : [];
  const activeRequestId = selectedRequestId || managedRequests[0]?.id || '';
  const activeRequest = managedRequests.find((r: any) => r.id === activeRequestId);
  const fail = (error?: string | null) => toast(error || unknownErrorText);
  const settle = (payload: any, key: string) => {
    if (payload?.[key]?.ok) refetchPage();
    else fail(payload?.[key]?.error);
  };

  const doPublish = () => {
    commitPublish({
      variables: { slug, school, note, windows: rows.filter((r) => r.start && r.end).map((r) => localToUtc(r)) },
      onCompleted: (res: any) => settle(res, 'publishFillOffer'),
      onError: (e: Error) => fail(e.message),
    });
  };
  const doWithdraw = () => {
    commitWithdraw({
      variables: {},
      onCompleted: (res: any) => settle(res, 'withdrawFillOffer'),
      onError: (e: Error) => fail(e.message),
    });
  };
  const doRespond = (inviteId: string, accept: boolean) => {
    commitRespond({
      variables: { inviteId, accept },
      onCompleted: (res: any) => settle(res, 'respondFillInvite'),
      onError: (e: Error) => fail(e.message),
    });
  };
  const doCreate = () => {
    if (!reqGroupingId) return;
    commitCreate({
      variables: { slug, groupingId: reqGroupingId, neededRole: reqRole, neededSchool: reqSchool || null, note: reqNote },
      onCompleted: (res: any) => { if (res.createFillRequest?.ok) { setReqNote(''); setReqSchool(''); } settle(res, 'createFillRequest'); },
      onError: (e: Error) => fail(e.message),
    });
  };
  const doClose = (requestId: string) => {
    commitClose({
      variables: { slug, requestId },
      onCompleted: (res: any) => settle(res, 'closeFillRequest'),
      onError: (e: Error) => fail(e.message),
    });
  };
  const doInvite = (offerId: string) => {
    if (!activeRequestId) return;
    commitInvite({
      variables: { slug, requestId: activeRequestId, offerId },
      onCompleted: (res: any) => settle(res, 'inviteFillSupplier'),
      onError: (e: Error) => fail(e.message),
    });
  };
  const doSeat = (inviteId: string) => {
    commitSeat({
      variables: { slug, inviteId },
      onCompleted: (res: any) => settle(res, 'seatFillSupplier'),
      onError: (e: Error) => fail(e.message),
    });
  };
  const inviteFor = (offerId: string) =>
    (activeRequest?.manageActions?.invites ?? []).find((iv: any) => iv.offerId === offerId);

  return (
    <div>
      <h3 style={{ color: '#ecd28f', margin: '8px 0 4px' }}>{page.marketTitle}</h3>
      <p style={{ color: theme.muted, fontSize: 13, marginTop: 0 }}>{page.marketBody}</p>

      {/* ---- supply (free for every member) ---- */}
      <div style={card}>
        <h4 style={{ color: '#ecd28f', margin: '0 0 6px' }}>{supply.supplyTitle}</h4>
        <p style={{ color: theme.muted, fontSize: 12, marginTop: 0 }}>{supply.supplyHint}</p>
        {supply.myOffer ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <strong style={{ fontSize: 14 }}>{supply.myOffer.school}</strong>
            <span style={{ fontSize: 12, color: theme.gold }}>{supply.myOffer.roleLabel}</span>
            <WindowsText windows={supply.myOffer.windows} weekdayNames={weekdayNames} />
            {supply.myOffer.note ? <span style={{ fontSize: 13 }}>{supply.myOffer.note}</span> : null}
            <button style={rowBtn} onClick={doWithdraw}>{supply.withdrawLabel}</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{supply.supplyEmptyText}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: theme.muted, flex: '1 1 180px' }}>
                {supply.schoolLabel}
                <input style={{ ...input, flex: 1 }} value={school} onChange={(e) => setSchool(e.target.value)} />
              </label>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: theme.muted, flex: '2 1 240px' }}>
                {supply.noteLabel}
                <input style={{ ...input, flex: 1 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder={supply.notePlaceholder} />
              </label>
            </div>
            <div style={{ fontSize: 13, color: theme.muted }}>{supply.windowsLabel}</div>
            {rows.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <select style={input} value={r.weekday} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, weekday: Number(e.target.value) } : x))}>
                  {weekdayNames.map((n, d) => <option key={d} value={d}>{n}</option>)}
                </select>
                <input type="time" style={input} value={r.start} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, start: e.target.value } : x))} />
                <input type="time" style={input} value={r.end} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, end: e.target.value } : x))} />
                <button style={rowBtn} onClick={() => setRows(rows.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button style={rowBtn} onClick={() => setRows([...rows, { weekday: 6, start: '19:00', end: '23:00' }])}>+</button>
              <button className="yy-btn yy-btn-gold" style={{ padding: '6px 18px', fontSize: 13 }} onClick={doPublish}>{supply.publishLabel}</button>
            </div>
          </div>
        )}
        <h4 style={{ color: '#ecd28f', margin: '16px 0 8px' }}>{supply.inboxTitle}</h4>
        {(supply.myInvites ?? []).length === 0
          ? <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{supply.inboxEmptyText}</p>
          : supply.myInvites.map((iv: any) => (
            <div key={iv.id} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '6px 0' }}>
              <span style={{ fontSize: 13 }}>{iv.sourcePattern}</span>
              <span style={{ fontSize: 12, color: theme.gold }}>{iv.statusLabel}</span>
              {iv.status === 'PENDING' && (
                <>
                  <button style={rowBtn} onClick={() => doRespond(iv.id, true)}>{supply.acceptLabel}</button>
                  <button style={rowBtn} onClick={() => doRespond(iv.id, false)}>{supply.declineLabel}</button>
                </>
              )}
            </div>
          ))}
      </div>

      {/* ---- demand (tier 3) ---- */}
      {demand.__typename === 'FillDemandLocked' && (
        <div style={card}>
          <p style={{ color: '#ecd28f', fontSize: 14, margin: '0 0 6px' }}>{demand.lockedTitle}</p>
          <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{demand.lockedBody}</p>
        </div>
      )}
      {isDemand && (
        <div style={card}>
          <h4 style={{ color: '#ecd28f', margin: '0 0 10px' }}>{demand.demandTitle}</h4>
          {!manage && <p style={{ color: theme.muted, fontSize: 13 }}>{demand.noManageHint}</p>}
          {manage && (
            <>
              <div style={{ fontSize: 13, color: theme.muted, marginBottom: 6 }}>{manage.createTitle}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: theme.muted }}>
                  {manage.groupingLabel}
                  <select style={input} value={reqGroupingId} onChange={(e) => setReqGroupingId(e.target.value)}>
                    <option value="" />
                    {(manage.myGroupings ?? []).map((g: any) => <option key={g.id} value={g.id}>{g.title}</option>)}
                  </select>
                </label>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: theme.muted }}>
                  {manage.neededRoleLabel}
                  <select style={input} value={reqRole} onChange={(e) => setReqRole(e.target.value)}>
                    <option value="HEALER">{manage.roleHealerLabel}</option>
                    <option value="DPS">{manage.roleDpsLabel}</option>
                  </select>
                </label>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: theme.muted }}>
                  {manage.neededSchoolLabel}
                  <input style={input} value={reqSchool} onChange={(e) => setReqSchool(e.target.value)} />
                </label>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: theme.muted, flex: '1 1 160px' }}>
                  {manage.noteLabel}
                  <input style={{ ...input, flex: 1 }} value={reqNote} onChange={(e) => setReqNote(e.target.value)} />
                </label>
                <button className="yy-btn yy-btn-gold" style={{ padding: '6px 18px', fontSize: 13 }} onClick={doCreate}>{manage.createLabel}</button>
              </div>
            </>
          )}
          <div style={{ fontSize: 13, color: theme.muted, marginBottom: 4 }}>{demand.requestsTitle}</div>
          {(demand.requests ?? []).length === 0
            ? <p style={{ color: theme.muted, fontSize: 13 }}>{demand.requestsEmptyText}</p>
            : demand.requests.map((r: any) => (
              <div key={r.id} style={{ padding: '8px 0', borderTop: '1px solid rgba(201,163,92,.12)' }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <strong style={{ fontSize: 14 }}>{r.groupingTitle}</strong>
                  {r.startsAtText ? <span style={{ fontSize: 12, color: theme.muted }}>{r.startsAtText}</span> : null}
                  <span style={{ fontSize: 12, color: theme.gold }}>{r.neededRoleLabel}</span>
                  {r.neededSchool ? <span style={{ fontSize: 13 }}>{r.neededSchool}</span> : null}
                  {r.note ? <span style={{ fontSize: 13 }}>{r.note}</span> : null}
                  <span style={{ fontSize: 12, color: theme.muted }}>{r.statusLabel}</span>
                  {r.manageActions && <button style={rowBtn} onClick={() => doClose(r.id)}>{r.manageActions.closeLabel}</button>}
                </div>
                {(r.manageActions?.invites ?? []).map((iv: any) => (
                  <div key={iv.id} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '4px 0 0 12px' }}>
                    <span style={{ fontSize: 13 }}>{iv.toName}</span>
                    <span style={{ fontSize: 12, color: theme.gold }}>{iv.statusLabel}</span>
                    {iv.seatAction
                      ? <button style={rowBtn} onClick={() => doSeat(iv.id)}>{iv.seatAction.seatLabel}</button>
                      : iv.status === 'ACCEPTED' ? <span style={{ fontSize: 12, color: theme.muted }}>{r.manageActions.seatedLabel}</span> : null}
                  </div>
                ))}
              </div>
            ))}
          <div style={{ fontSize: 13, color: theme.muted, margin: '14px 0 4px' }}>{demand.offersTitle}</div>
          {managedRequests.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 }}>
              <select style={input} value={activeRequestId} onChange={(e) => setSelectedRequestId(e.target.value)}>
                {managedRequests.map((r: any) => <option key={r.id} value={r.id}>{r.groupingTitle}</option>)}
              </select>
            </div>
          )}
          {(demand.offers ?? []).length === 0
            ? <p style={{ color: theme.muted, fontSize: 13 }}>{demand.offersEmptyText}</p>
            : demand.offers.map((o: any) => {
              const existing = inviteFor(o.id);
              return (
                <div key={o.id} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '8px 0', borderTop: '1px solid rgba(201,163,92,.12)' }}>
                  <strong style={{ fontSize: 14 }}>{o.school}</strong>
                  <span style={{ fontSize: 12, color: theme.gold }}>{o.roleLabel}</span>
                  <span style={{ fontSize: 13 }}>{o.displayName}</span>
                  <span style={{ fontSize: 12, color: theme.muted }}>{o.homeGuildPattern}</span>
                  <WindowsText windows={o.windows} weekdayNames={weekdayNames} />
                  {o.note ? <span style={{ fontSize: 13 }}>{o.note}</span> : null}
                  {activeRequest?.manageActions
                    ? existing
                      ? <span style={{ fontSize: 12, color: theme.gold }}>{activeRequest.manageActions.invitedLabel} · {existing.statusLabel}</span>
                      : <button style={rowBtn} onClick={() => doInvite(o.id)}>{activeRequest.manageActions.inviteLabel}</button>
                    : null}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
