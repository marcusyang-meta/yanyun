import { useState } from 'react';
import { createPortal } from 'react-dom';
import { graphql, useMutation } from 'react-relay';
import type { SeatGridJoinMutation as SeatGridJoinMutationType } from './__generated__/SeatGridJoinMutation.graphql';
import type { SeatGridLeaveMutation as SeatGridLeaveMutationType } from './__generated__/SeatGridLeaveMutation.graphql';
import { SECTS, theme, fill } from '../../lib/format';
import { applySeatsToGrouping } from '../../lib/groupingStore';
import { toast, ConfirmDialog } from './Toast.react.tsx';


// seats 选全: 本人落座/取消完成瞬间由 updater 写回车记录 (见
// groupingStore.applySeatsToGrouping), 不等推送回声与详情页重查。
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
      }
    }
  }
`;

// 座位文案包: 由详情页 shell 下发 (seat* 字段 + 确认框按钮 + 通用未知
// 错误文案), 本组件不持有任何 UI 文案。
export interface SeatText {
  seatEmptyJoinLabel: string;
  seatEmptyLabel: string;
  seatModalTitleTemplate: string;
  seatModalSubtitle: string;
  seatNameLabel: string;
  seatNamePlaceholder: string;
  seatNameRequired: string;
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
}

export default function SeatGrid({ groupingId, seats, maxSlots, onChanged, interactive = true, defaultNickname, text }: {
  groupingId: string;
  seats: SeatData[];
  maxSlots: number;
  text: SeatText;
  onChanged: () => void;
  // interactive=false: 只读形态 (未绑定百业的公开页挂载) — 座位不可点, 不挂任何写入口
  interactive?: boolean;
  // 落座昵称预填: 该百业服务器昵称 (无则全局名), 仅作初始值, 用户可改
  defaultNickname?: string;
}) {
  const [joinIdx, setJoinIdx] = useState<number | null>(null);
  const [leaveUid, setLeaveUid] = useState<{ uid: string; nickname: string } | null>(null);
  const [nickname, setNickname] = useState(defaultNickname || '');
  const [sect, setSect] = useState('');
  const [nickErr, setNickErr] = useState(false);

  const [commitJoin, joining] = useMutation<SeatGridJoinMutationType>(SeatGridJoinMutationNode);

  const [commitLeave, leaving] = useMutation<SeatGridLeaveMutationType>(SeatGridLeaveMutationNode);

  const submitJoin = () => {
    const name = nickname.trim();
    if (!name) { setNickErr(true); return; }
    if (!sect) { toast(text.seatToastSect); return; }
    commitJoin({
      variables: { input: { groupingId, nickname: name, weapon: sect, seatIndex: joinIdx! } },
      updater: (store) => { applySeatsToGrouping(store, 'joinGrouping', groupingId); },
      onCompleted: (res) => {
        if (res.joinGrouping?.ok) {
          toast(text.seatToastJoined);
          setJoinIdx(null); setNickname(''); setSect('');
          onChanged();
        } else {
          toast(fill(text.seatToastJoinFailedTemplate, { error: res.joinGrouping?.error || text.unknownErrorText }));
        }
      },
      onError: (e) => toast(fill(text.seatToastJoinFailedTemplate, { error: e.message })),
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
          interactive ? (
          <button
            key={s.index}
            onClick={() => setLeaveUid({ uid: s.uid!, nickname: s.nickname ?? '' })}
            disabled={leaving}
            style={{
              padding: 12, borderRadius: 10, cursor: 'pointer', textAlign: 'left',
              border: theme.border, background: 'rgba(201,163,92,.12)', color: theme.paper,
            }}
          >
            <div style={{ fontSize: 15, color: theme.goldHi, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.nickname}
            </div>
            <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>
              {s.weapon}{s.role ? ` · ${s.role}` : ''}
            </div>
          </button>
          ) : (
          <div
            key={s.index}
            style={{
              padding: 12, borderRadius: 10, textAlign: 'left',
              border: theme.border, background: 'rgba(201,163,92,.12)', color: theme.paper,
            }}
          >
            <div style={{ fontSize: 15, color: theme.goldHi, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.nickname}
            </div>
            <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>
              {s.weapon}{s.role ? ` · ${s.role}` : ''}
            </div>
          </div>
          )
        ) : (
          interactive ? (
          <button
            key={s.index}
            onClick={() => { setJoinIdx(s.index); setNickErr(false); }}
            style={{
              padding: 12, borderRadius: 10, cursor: 'pointer',
              border: '1px dashed rgba(201,163,92,.4)', background: 'transparent', color: theme.muted,
              fontSize: 14, minHeight: 62,
            }}
          >{text.seatEmptyJoinLabel}</button>
          ) : (
          <div
            key={s.index}
            style={{
              padding: 12, borderRadius: 10,
              border: '1px dashed rgba(201,163,92,.25)', background: 'transparent', color: theme.muted,
              fontSize: 14, minHeight: 62, boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >{text.seatEmptyLabel}</div>
          )
        ))}
      </div>

      {/* 落座弹窗（自定义，非系统 prompt）; portal 到 body 逃离动画祖先包含块 */}
      {joinIdx !== null && createPortal(
        <div style={modalOverlay} onClick={() => setJoinIdx(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 18, color: theme.goldHi, marginBottom: 4 }}>{fill(text.seatModalTitleTemplate, { n: joinIdx + 1 })}</div>
            <div style={{ fontSize: 12, color: theme.muted, marginBottom: 16 }}>{text.seatModalSubtitle}</div>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: theme.paper, marginBottom: 6 }}>{text.seatNameLabel}</div>
              <input
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); setNickErr(false); }}
                placeholder={text.seatNamePlaceholder}
                autoFocus
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 15, boxSizing: 'border-box',
                  background: '#0c0b09', color: theme.paper,
                  border: nickErr ? '1px solid #a02c1a' : theme.border,
                }}
              />
              {nickErr && <div style={{ color: '#e08080', fontSize: 12, marginTop: 4 }}>{text.seatNameRequired}</div>}
            </label>
            <div style={{ fontSize: 13, color: theme.paper, marginBottom: 6 }}>{text.seatSectLabel}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {SECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSect(s)}
                  style={{
                    padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                    border: `1px solid ${theme.gold}`,
                    background: sect === s ? theme.gold : 'transparent',
                    color: sect === s ? '#1a1814' : theme.paper,
                  }}
                >{s}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setJoinIdx(null)} style={cancelBtn}>{text.seatCancelLabel}</button>
              <button onClick={submitJoin} disabled={joining} style={okBtn}>
                {joining ? text.seatJoiningLabel : text.seatConfirmJoinLabel}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 取消报名确认（自定义，非系统 confirm） */}
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
