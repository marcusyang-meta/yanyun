import { useState, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { graphql, useMutation, useLazyLoadQuery } from 'react-relay';
import type { SeatGridJoinMutation as SeatGridJoinMutationType } from './__generated__/SeatGridJoinMutation.graphql';
import type { SeatGridLeaveMutation as SeatGridLeaveMutationType } from './__generated__/SeatGridLeaveMutation.graphql';
import type { SeatGridRosterQuery as SeatGridRosterQueryType } from './__generated__/SeatGridRosterQuery.graphql';
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

// 代报名名册: 只在完整 Guild 面上有 memberRoster 字段 (响应类型即
// 权限); 只读/锁定面下该片段不命中, roster 恒为空 — 而只读面本就不
// 挂报名弹窗, 不会走到这里。
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

export default function SeatGrid({ groupingId, slug, seats, maxSlots, onChanged, interactive = true, defaultNickname, text }: {
  groupingId: string;
  slug: string;
  seats: SeatData[];
  maxSlots: number;
  text: SeatText;
  onChanged: () => void;
  // interactive=false: 只读形态 (未绑定百业的公开页挂载) — 座位不可点, 不挂任何写入口
  interactive?: boolean;
  // 本人落座展示名: 该百业服务器昵称 (无则全局名)。报名身份收口后名字
  // 由服务端定, 此值只作锁定展示, 不再可编辑。
  defaultNickname?: string;
}) {
  const [joinIdx, setJoinIdx] = useState<number | null>(null);
  const [leaveUid, setLeaveUid] = useState<{ uid: string; nickname: string } | null>(null);

  const [commitLeave, leaving] = useMutation<SeatGridLeaveMutationType>(SeatGridLeaveMutationNode);

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
            onClick={() => setJoinIdx(s.index)}
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

      {/* 落座弹窗（自定义，非系统 prompt）; 名册查询在弹窗组件内懒加载 */}
      {joinIdx !== null && (
        <Suspense fallback={null}>
          <JoinModal
            groupingId={groupingId}
            slug={slug}
            seatIndex={joinIdx}
            selfName={defaultNickname || ''}
            text={text}
            onClose={() => setJoinIdx(null)}
            onJoined={() => { setJoinIdx(null); onChanged(); }}
          />
        </Suspense>
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

/* 落座弹窗: 报名身份收口后是双模式 —
 *  自己报名: 名字锁定展示 (服务端以 Discord 服务器昵称回退全局名定名,
 *    前端传什么都不作数), 只选流派;
 *  代报名: 从本百业名册里选人 (可搜索), 落座名与身份戳都是被选者。
 * portal 到 body 逃离动画祖先包含块。 */
function JoinModal({ groupingId, slug, seatIndex, selfName, text, onClose, onJoined }: {
  groupingId: string;
  slug: string;
  seatIndex: number;
  selfName: string;
  text: SeatText;
  onClose: () => void;
  onJoined: () => void;
}) {
  const rosterData = useLazyLoadQuery<SeatGridRosterQueryType>(
    SeatGridRosterQueryNode, { slug }, { fetchPolicy: 'store-or-network' },
  );
  const roster: RosterMember[] = ((rosterData as any)?.viewer?.guild?.memberRoster ?? []) as RosterMember[];
  const [mode, setMode] = useState<'self' | 'proxy'>('self');
  const [selected, setSelected] = useState<RosterMember | null>(null);
  const [search, setSearch] = useState('');
  const [sect, setSect] = useState('');
  const [commitJoin, joining] = useMutation<SeatGridJoinMutationType>(SeatGridJoinMutationNode);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? roster.filter((m) => m.displayName.toLowerCase().includes(q) || (m.globalName || '').toLowerCase().includes(q))
    : roster;

  const submitJoin = () => {
    if (!sect) { toast(text.seatToastSect); return; }
    if (mode === 'proxy' && !selected) { toast(text.seatProxyPickRequired); return; }
    const input = mode === 'proxy'
      ? { groupingId, nickname: selected!.displayName, weapon: sect, seatIndex, forDiscordId: selected!.discordId }
      : { groupingId, nickname: selfName, weapon: sect, seatIndex };
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
