import { useState, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { graphql, useMutation, useLazyLoadQuery } from 'react-relay';
import type { SeatGridJoinMutation as SeatGridJoinMutationType } from './__generated__/SeatGridJoinMutation.graphql';
import type { SeatGridLeaveMutation as SeatGridLeaveMutationType } from './__generated__/SeatGridLeaveMutation.graphql';
import type { SeatGridReadyMutation as SeatGridReadyMutationType } from './__generated__/SeatGridReadyMutation.graphql';
import type { SeatGridRosterQuery as SeatGridRosterQueryType } from './__generated__/SeatGridRosterQuery.graphql';
import { theme, fill } from '../../lib/format';
import { applySeatsToGrouping } from '../../lib/groupingStore';
import { toast, ConfirmDialog } from './Toast.react.tsx';


// The mutations select the full seats set: on completion of an own
// join/leave, the updater writes them back onto the grouping record (see
// groupingStore.applySeatsToGrouping) instead of waiting for the push echo
// or a detail-page refetch.
const SeatGridSectOptionsQueryNode = graphql`
  query SeatGridSectOptionsQuery {
    dexPage {
      sectOptions { slug name }
    }
  }
`;

const SeatGridJoinMutationNode = graphql`
  mutation SeatGridJoinMutation($input: JoinGroupingInput!) {
    joinGrouping(input: $input) {
      ok
      error
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
    }
  }
`;

const SeatGridLeaveMutationNode = graphql`
  mutation SeatGridLeaveMutation($input: LeaveGroupingInput!) {
    leaveGrouping(input: $input) {
      ok
      error
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
    }
  }
`;

const SeatGridReadyMutationNode = graphql`
  mutation SeatGridReadyMutation($input: SetSeatReadyInput!) {
    setSeatReady(input: $input) {
      ok
      error
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
    }
  }
`;

// Proxy-signup roster: only the full Guild surface has the memberRoster
// field (the response type is the permission). On read-only/locked surfaces
// the fragment doesn't match and the roster is always empty — and those
// surfaces never mount the signup modal anyway, so this is never reached.
const SeatGridRosterQueryNode = graphql`
  query SeatGridRosterQuery($slug: String!) {
    viewer {
      guild(slug: $slug) {
        ... on Guild {
          memberRoster {
            discordId
            displayName
            globalName
          }
        }
      }
    }
  }
`;

export interface RosterMember {
  discordId: string;
  displayName: string;
  globalName?: string | null;
}

// Seat copy bundle, delivered by the detail page shell (seat* fields +
// confirm-dialog buttons + the generic unknown-error text); this component
// holds no UI copy.
export interface SeatText {
  seatEmptyJoinLabel: string;
  seatEmptyLabel: string;
  seatModalTitleTemplate: string;
  seatModalSubtitle: string;
  seatNameLabel: string;
  seatNamePlaceholder: string;
  seatNameRequired: string;
  seatSelfTabLabel: string;
  seatProxyTabLabel: string;
  seatSelfNameHint: string;
  seatProxySearchPlaceholder: string;
  seatProxyPickRequired: string;
  seatProxyEmptyText: string;
  seatSectLabel: string;
  seatCancelLabel: string;
  seatConfirmJoinLabel: string;
  seatJoiningLabel: string;
  seatToastSect: string;
  seatToastJoined: string;
  seatToastJoinFailedTemplate: string;
  seatToastLeft: string;
  seatToastLeaveFailedTemplate: string;
  seatLeaveConfirmTitle: string;
  seatLeaveConfirmMessageTemplate: string;
  seatReadyLabel: string;
  seatReadyActionLabel: string;
  seatUnreadyActionLabel: string;
  seatToastReady: string;
  seatToastUnready: string;
  seatToastReadyFailedTemplate: string;
  confirmOkLabel: string;
  confirmCancelLabel: string;
  unknownErrorText: string;
}

export interface SeatData {
  index: number;
  nickname?: string | null;
  weapon?: string | null;
  role?: string | null;
  uid?: string | null;
  occupied: boolean;
  ready?: boolean;
  mine?: boolean;
}

export interface SignupFieldData {
  id: string;
  label: string;
  fieldType: string; // TEXT | CHOICE
  options?: string[] | null;
  required?: boolean | null;
}

export default function SeatGrid({ groupingId, slug, seats, maxSlots, onChanged, defaultNickname, text, customFields }: {
  groupingId: string;
  slug: string;
  seats: SeatData[];
  maxSlots: number;
  text: SeatText;
  customFields?: SignupFieldData[];
  onChanged: () => void;
  // Display name for own seat: the guild server nickname (else the global
  // name). Since signup identity was locked down, the name is decided by the
  // server; this value is locked display only, no longer editable.
  defaultNickname?: string;
}) {
  const [joinIdx, setJoinIdx] = useState<number | null>(null);
  const [leaveUid, setLeaveUid] = useState<{ uid: string; nickname: string } | null>(null);

  const [commitLeave, leaving] = useMutation<SeatGridLeaveMutationType>(SeatGridLeaveMutationNode);
  const [commitReady] = useMutation<SeatGridReadyMutationType>(SeatGridReadyMutationNode);

  // Readiness toggle for the departure reminders: only rendered on the
  // viewer's own seat (the server marks it `mine`); the mutation flips
  // the target state and the payload seats rewrite the store in place.
  const toggleReady = (s: SeatData) => {
    commitReady({
      variables: { input: { groupingId, ready: !s.ready } },
      updater: (store) => { applySeatsToGrouping(store, 'setSeatReady', groupingId); },
      onCompleted: (res) => {
        if (res.setSeatReady?.ok) {
          toast(s.ready ? text.seatToastUnready : text.seatToastReady);
          onChanged();
        } else {
          toast(fill(text.seatToastReadyFailedTemplate, { error: res.setSeatReady?.error || text.unknownErrorText }));
        }
      },
      onError: (e) => toast(fill(text.seatToastReadyFailedTemplate, { error: e.message })),
    });
  };

  const confirmLeave = () => {
    if (!leaveUid) return;
    commitLeave({
      variables: { input: { groupingId, uid: leaveUid.uid } },
      updater: (store) => { applySeatsToGrouping(store, 'leaveGrouping', groupingId); },
      onCompleted: (res) => {
        if (res.leaveGrouping?.ok) {
          toast(text.seatToastLeft);
          setLeaveUid(null);
          onChanged();
        } else {
          toast(fill(text.seatToastLeaveFailedTemplate, { error: res.leaveGrouping?.error || text.unknownErrorText }));
        }
      },
      onError: (e) => toast(fill(text.seatToastLeaveFailedTemplate, { error: e.message })),
    });
  };

  const seatMap = new Map(seats.map((s) => [s.index, s]));
  const cells = [];
  for (let i = 0; i < maxSlots; i++) {
    const s = seatMap.get(i);
    cells.push(s ?? { index: i, occupied: false });
  }

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 10,
      }}>
        {cells.map((s) => s.occupied ? (
          <button
            key={s.index}
            onClick={() => setLeaveUid({ uid: s.uid!, nickname: s.nickname ?? '' })}
            disabled={leaving}
            style={{
              padding: 12, borderRadius: 10, cursor: 'pointer', textAlign: 'left',
              border: theme.border, background: 'rgba(201,163,92,.12)', color: theme.paper,
            }}
          >
            <SeatCellBody s={s} text={text} onToggleReady={toggleReady} />
          </button>
        ) : (
          <button
            key={s.index}
            onClick={() => setJoinIdx(s.index)}
            style={{
              padding: 12, borderRadius: 10, cursor: 'pointer',
              border: '1px dashed rgba(201,163,92,.4)', background: 'transparent', color: theme.muted,
              fontSize: 14, minHeight: 62,
            }}
          >{text.seatEmptyJoinLabel}</button>
        ))}
      </div>

      {/* Seat picker dialog (custom, never the system prompt); the roster query lazy-loads inside the dialog */}
      {joinIdx !== null && (
        <Suspense fallback={null}>
          <JoinModal
            groupingId={groupingId}
            slug={slug}
            seatIndex={joinIdx}
            selfName={defaultNickname || ''}
            text={text}
            customFields={customFields ?? []}
            onClose={() => setJoinIdx(null)}
            onJoined={() => { setJoinIdx(null); onChanged(); }}
          />
        </Suspense>
      )}

      {/* Cancel-signup confirmation (custom, never the system confirm) */}
      {leaveUid && (
        <ConfirmDialog
          title={text.seatLeaveConfirmTitle}
          message={fill(text.seatLeaveConfirmMessageTemplate, { nickname: leaveUid.nickname })}
          onOk={confirmLeave}
          onCancel={() => setLeaveUid(null)}
          okLabel={text.confirmOkLabel}
          cancelLabel={text.confirmCancelLabel}
        />
      )}
    </div>
  );
}

/* Occupied-seat cell body: name, sect/role, the ready marker, and —
 * on the viewer's own seat — the readiness toggle (a span-button: the
 * cell itself is the leave button, so the toggle must not nest one). */
function SeatCellBody({ s, text, onToggleReady }: {
  s: SeatData;
  text: SeatText;
  onToggleReady?: (s: SeatData) => void;
}) {
  return (
    <>
      <div style={{ fontSize: 15, color: theme.goldHi, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {s.nickname}
      </div>
      <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>
        {s.weapon}{s.role ? ` · ${s.role}` : ''}
      </div>
      {s.ready && (
        <div style={{ fontSize: 12, color: theme.gold, marginTop: 4 }}>✓ {text.seatReadyLabel}</div>
      )}
      {s.mine && onToggleReady && (
        <span
          role="button"
          onClick={(e) => { e.stopPropagation(); onToggleReady(s); }}
          style={{
            display: 'inline-block', marginTop: 6, fontSize: 12, color: theme.gold,
            border: `1px solid ${theme.gold}`, borderRadius: 6, padding: '2px 8px', cursor: 'pointer',
          }}
        >{s.ready ? text.seatUnreadyActionLabel : text.seatReadyActionLabel}</span>
      )}
    </>
  );
}

/* Seat-join modal: since signup identity was locked down it has two modes —
 *  Self signup: the name is shown locked (the server names by Discord server
 *    nickname, falling back to the global name; whatever the frontend sends
 *    doesn't count) — only the sect is chosen;
 *  Proxy signup: pick a person from this guild's roster (searchable); the
 *    seat name and identity stamp are both the picked person's.
 * Portaled to body to escape animated ancestors' containing blocks. */
function JoinModal({ groupingId, slug, seatIndex, selfName, text, customFields, onClose, onJoined }: {
  groupingId: string;
  slug: string;
  seatIndex: number;
  selfName: string;
  text: SeatText;
  customFields: SignupFieldData[];
  onClose: () => void;
  onJoined: () => void;
}) {
  const rosterData = useLazyLoadQuery<SeatGridRosterQueryType>(
    SeatGridRosterQueryNode, { slug }, { fetchPolicy: 'store-or-network' },
  );
  // Sect choices come from the backend vocabulary (canonical names —
  // the chosen name is stored on the seat).
  const sectData = useLazyLoadQuery(
    SeatGridSectOptionsQueryNode, {}, { fetchPolicy: 'store-or-network' },
  );
  const sectOptions: ReadonlyArray<{ slug: string; name: string }> =
    ((sectData as any)?.dexPage?.sectOptions ?? []) as ReadonlyArray<{ slug: string; name: string }>;
  const roster: RosterMember[] = ((rosterData as any)?.viewer?.guild?.memberRoster ?? []) as RosterMember[];
  const [mode, setMode] = useState<'self' | 'proxy'>('self');
  const [selected, setSelected] = useState<RosterMember | null>(null);
  const [search, setSearch] = useState('');
  const [sect, setSect] = useState('');
  // F7 answers, keyed by field id; labels/options are the car's own
  // field data (creator-written), rendered verbatim.
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [commitJoin, joining] = useMutation<SeatGridJoinMutationType>(SeatGridJoinMutationNode);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? roster.filter((m) => m.displayName.toLowerCase().includes(q) || (m.globalName || '').toLowerCase().includes(q))
    : roster;

  const submitJoin = () => {
    if (!sect) { toast(text.seatToastSect); return; }
    if (mode === 'proxy' && !selected) { toast(text.seatProxyPickRequired); return; }
    const answerInputs = customFields
      .filter((f) => (answers[f.id] ?? '').trim())
      .map((f) => ({ fieldId: f.id, value: answers[f.id].trim() }));
    const input = mode === 'proxy'
      ? { groupingId, nickname: selected!.displayName, weapon: sect, seatIndex, forDiscordId: selected!.discordId, answers: answerInputs }
      : { groupingId, nickname: selfName, weapon: sect, seatIndex, answers: answerInputs };
    commitJoin({
      variables: { input },
      updater: (store) => { applySeatsToGrouping(store, 'joinGrouping', groupingId); },
      onCompleted: (res) => {
        if (res.joinGrouping?.ok) {
          toast(text.seatToastJoined);
          onJoined();
        } else {
          toast(fill(text.seatToastJoinFailedTemplate, { error: res.joinGrouping?.error || text.unknownErrorText }));
        }
      },
      onError: (e) => toast(fill(text.seatToastJoinFailedTemplate, { error: e.message })),
    });
  };

  return createPortal(
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 18, color: theme.goldHi, marginBottom: 4 }}>{fill(text.seatModalTitleTemplate, { n: seatIndex + 1 })}</div>
        <div style={{ fontSize: 12, color: theme.muted, marginBottom: 16 }}>{text.seatModalSubtitle}</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['self', 'proxy'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                border: `1px solid ${theme.gold}`,
                background: mode === m ? theme.gold : 'transparent',
                color: mode === m ? '#1a1814' : theme.paper,
              }}
            >{m === 'self' ? text.seatSelfTabLabel : text.seatProxyTabLabel}</button>
          ))}
        </div>

        <div style={{ fontSize: 13, color: theme.paper, marginBottom: 6 }}>{text.seatNameLabel}</div>
        {mode === 'self' ? (
          <div style={{ marginBottom: 12 }}>
            <div style={{
              padding: '10px 12px', borderRadius: 8, fontSize: 15, boxSizing: 'border-box',
              background: 'rgba(201,163,92,.08)', color: theme.goldHi, border: theme.border,
            }}>{selfName || text.seatNamePlaceholder}</div>
            <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>{text.seatSelfNameHint}</div>
          </div>
        ) : (
          <div style={{ marginBottom: 12 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={text.seatProxySearchPlaceholder}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
                background: '#0c0b09', color: theme.paper, border: theme.border, marginBottom: 8,
              }}
            />
            {filtered.length === 0 ? (
              <div style={{ fontSize: 13, color: theme.muted, padding: '6px 2px' }}>{text.seatProxyEmptyText}</div>
            ) : (
              <div style={{ maxHeight: 176, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filtered.map((m) => (
                  <button
                    key={m.discordId}
                    onClick={() => setSelected(m)}
                    style={{
                      padding: '8px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                      border: `1px solid ${theme.gold}`,
                      background: selected?.discordId === m.discordId ? theme.gold : 'transparent',
                      color: selected?.discordId === m.discordId ? '#1a1814' : theme.paper,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{m.displayName}</span>
                    {m.globalName && m.globalName !== m.displayName && (
                      <span style={{ fontSize: 12, opacity: 0.75, marginLeft: 8 }}>{m.globalName}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {customFields.map((f) => (
          <div key={f.id} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: theme.paper, marginBottom: 6 }}>
              {f.label}{f.required ? ' *' : ''}
            </div>
            {f.fieldType === 'CHOICE' ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(f.options ?? []).map((o) => (
                  <button
                    key={o}
                    data-answer-choice={f.id}
                    onClick={() => setAnswers({ ...answers, [f.id]: o })}
                    style={{
                      padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                      border: `1px solid ${theme.gold}`,
                      background: answers[f.id] === o ? theme.gold : 'transparent',
                      color: answers[f.id] === o ? '#1a1814' : theme.paper,
                    }}
                  >{o}</button>
                ))}
              </div>
            ) : (
              <input
                value={answers[f.id] ?? ''}
                data-answer-text={f.id}
                onChange={(e) => setAnswers({ ...answers, [f.id]: e.target.value })}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
                  background: '#0c0b09', color: theme.paper, border: theme.border,
                }}
              />
            )}
          </div>
        ))}

        <div style={{ fontSize: 13, color: theme.paper, marginBottom: 6 }}>{text.seatSectLabel}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {sectOptions.map((s) => (
            <button
              key={s.slug}
              onClick={() => setSect(s.name)}
              style={{
                padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                border: `1px solid ${theme.gold}`,
                background: sect === s.name ? theme.gold : 'transparent',
                color: sect === s.name ? '#1a1814' : theme.paper,
              }}
            >{s.name}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={cancelBtn}>{text.seatCancelLabel}</button>
          <button onClick={submitJoin} disabled={joining} style={okBtn}>
            {joining ? text.seatJoiningLabel : text.seatConfirmJoinLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const modalOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 9997,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
};
const modalBox: React.CSSProperties = {
  background: '#1a1814', border: '1px solid #c9a35c', borderRadius: 12,
  padding: 24, maxWidth: 420, width: '100%', maxHeight: '85vh', overflowY: 'auto',
};
const cancelBtn: React.CSSProperties = {
  padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
  background: 'transparent', border: '1px solid #c9a35c', color: '#ece2cb',
};
const okBtn: React.CSSProperties = {
  padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
  background: '#c9a35c', border: 'none', color: '#1a1814', fontWeight: 600,
};
