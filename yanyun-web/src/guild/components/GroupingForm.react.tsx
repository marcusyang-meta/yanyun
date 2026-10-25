import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { graphql, useMutation, useLazyLoadQuery } from 'react-relay';
import { theme, SECTS, parseStartsAt, fill } from '../../lib/format';
import { appendGroupingToList } from '../../lib/groupingStore';
import { toast } from './Toast.react.tsx';
import type { GroupingFormCreateMutation as GroupingFormCreateMutationType } from './__generated__/GroupingFormCreateMutation.graphql';
import type { GroupingFormUpdateMutation as GroupingFormUpdateMutationType } from './__generated__/GroupingFormUpdateMutation.graphql';
import type { GroupingFormDungeonsQuery as GroupingFormDungeonsQueryType } from './__generated__/GroupingFormDungeonsQuery.graphql';


const GroupingFormDungeonsQueryNode = graphql`
  query GroupingFormDungeonsQuery {
    dexPage {
      current {
        id
        name
        size
      }
    }
  }
`;

// grouping 选全列表/详情要渲染的字段: 规范化后记录即完整, 发车 updater
// 把它插进列表时卡片直接可渲染; 改车则靠规范化原地更新详情与列表卡。
const GroupingFormCreateMutationNode = graphql`
  mutation GroupingFormCreateMutation($input: CreateGroupingInput!) {
    createGrouping(input: $input) {
      ok
      error
      grouping {
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
`;

const GroupingFormUpdateMutationNode = graphql`
  mutation GroupingFormUpdateMutation($id: ID!, $input: UpdateGroupingInput!) {
    updateGrouping(id: $id, input: $input) {
      ok
      error
      grouping {
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


export interface GroupingFormInitial {
  title: string;
  type: string;
  startsAt: string; // 后端返回的 startsAt 文本
}

// 表单文案包: 由打开它的页面 shell 下发 (列表页/详情页的 form* 字段 +
// typeShort* 短标签 + 通用未知错误文案), 本组件不持有任何 UI 文案。
export interface GroupingFormText {
  formCreateTitle: string;
  formEditTitle: string;
  formTypeLabel: string;
  formTypeActivityLabel: string;
  formTypeTalentLabel: string;
  formTypeRaceLabel: string;
  formTypeTowerLabel: string;
  formCapacityTemplate: string;
  formHintActivity: string;
  formHintDungeonTemplate: string;
  formHintTalent: string;
  formHintRace: string;
  formHintTower: string;
  formTitleLabel: string;
  formTitlePlaceholder: string;
  formStartsLabel: string;
  formMonthTemplate: string;
  formDayTemplate: string;
  formHourTemplate: string;
  formMinuteTemplate: string;
  formDungeonLabel: string;
  formDungeonNoneLabel: string;
  formNicknameLabel: string;
  formNicknamePlaceholder: string;
  formSectLabel: string;
  formCancelLabel: string;
  formSubmitCreateLabel: string;
  formSubmitEditLabel: string;
  formSubmittingLabel: string;
  formToastSect: string;
  formToastSaved: string;
  formToastSaveFailedTemplate: string;
  formToastPosted: string;
  formToastCreateFailedTemplate: string;
  formTitleTemplate: string;
  typeShortActivity: string;
  typeShortTalent: string;
  typeShortRace: string;
  typeShortTower: string;
  unknownErrorText: string;
}

interface Props {
  slug: string;
  text: GroupingFormText;
  mode: 'create' | 'edit';
  groupingId?: string;
  initial?: GroupingFormInitial;
  defaultType?: string;
  // 昵称预填: 该百业服务器昵称 (无则全局名), 仅作初始值, 用户可改
  defaultNickname?: string;
  onClose: () => void;
  onDone: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#1e1b15', border: `1px solid rgba(201,163,92,.3)`,
  color: theme.paper, borderRadius: 8, padding: '11px 10px', fontSize: 14, boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, color: theme.muted, marginBottom: 6, letterSpacing: 1,
};
const errStyle: React.CSSProperties = { borderColor: '#a02c1a' };

export default function GroupingForm({ slug, text, mode, groupingId, initial, defaultType, defaultNickname, onClose, onDone }: Props) {
  const isEdit = mode === 'edit';
  const now = useMemo(() => new Date(), []);
  const initDate = useMemo(() => {
    // 走共享 parseStartsAt: 旧写法 replace(' ','T') 不带 Z 会按本地时区误读
    // UTC 文本, 且 epoch 秒字符串解析必失败 -> 编辑 epoch 车时日期被静默
    // 重置成今天, 一保存就把出发时间改掉。
    if (initial?.startsAt) {
      const d = parseStartsAt(initial.startsAt);
      if (d) return d;
    }
    return now;
  }, [initial, now]);

  const [title, setTitle] = useState(initial?.title || '');
  // 默认标题 (用户裁决): "{车头}的{双十/竞速/天赋/爬塔}车队" — 仅预填, 跟随
  // 昵称/类型实时变; 用户手动改过标题后 (titleTouched) 不再自动跟随。
  const [titleTouched, setTitleTouched] = useState(isEdit);
  const [type, setType] = useState(initial?.type || defaultType || 'ACTIVITY');
  const [month, setMonth] = useState(initDate.getMonth() + 1);
  const [day, setDay] = useState(initDate.getDate());
  const [hour, setHour] = useState(isEdit ? initDate.getHours() : 20);
  const [minute, setMinute] = useState(0);
  const [dungeonId, setDungeonId] = useState('');
  const [nickname, setNickname] = useState(defaultNickname || '');
  const [sect, setSect] = useState('');
  // 类型短标签走后端 typeShort* 字段; 编辑模式恒用车队原标题, 不套默认。
  const typeShorts: Record<string, string> = {
    ACTIVITY: text.typeShortActivity, TALENT: text.typeShortTalent, RACE: text.typeShortRace, TOWER: text.typeShortTower,
  };
  const TYPE_OPTS = [
    { key: 'ACTIVITY', label: text.formTypeActivityLabel },
    { key: 'TALENT', label: text.formTypeTalentLabel },
    { key: 'RACE', label: text.formTypeRaceLabel },
    { key: 'TOWER', label: text.formTypeTowerLabel },
  ];
  const autoTitle = fill(text.formTitleTemplate, { nickname: nickname.trim(), type: typeShorts[type] ?? '' });
  const shownTitle = isEdit || titleTouched ? title : autoTitle;
  const [titleErr, setTitleErr] = useState(false);
  const [nickErr, setNickErr] = useState(false);

  // 副本下拉
  const dexData = useLazyLoadQuery<GroupingFormDungeonsQueryType>(
    GroupingFormDungeonsQueryNode,
    {},
    { fetchPolicy: 'store-or-network' }
  );
  const dungeons = dexData?.dexPage?.current ?? [];

  const [commitCreate, creating] = useMutation<GroupingFormCreateMutationType>(GroupingFormCreateMutationNode);
  const [commitUpdate, updating] = useMutation<GroupingFormUpdateMutationType>(GroupingFormUpdateMutationNode);

  // 人数规则与后端 createGrouping 一致: 双十/爬塔恒 10 人且不挂副本; 天赋/竞速
  // 选了副本按副本 size, 不指定走默认 (天赋 5 / 竞速 10)。编辑模式不提交
  // 人数, 此值仅作提示展示。
  const selectedDungeon = (dungeons as any[]).find((d) => String(d.id) === String(dungeonId));
  const maxSlots = type === 'ACTIVITY' || type === 'TOWER' ? 10
    : selectedDungeon && (Number(selectedDungeon.size) === 5 || Number(selectedDungeon.size) === 10)
      ? Number(selectedDungeon.size)
      : type === 'TALENT' ? 5 : 10;
  const slotsHint = type === 'ACTIVITY' ? text.formHintActivity
    : type === 'TOWER' ? text.formHintTower
    : selectedDungeon ? fill(text.formHintDungeonTemplate, { name: selectedDungeon.name, max: maxSlots })
    : type === 'TALENT' ? text.formHintTalent
    : text.formHintRace;

  const submit = () => {
    const t = shownTitle.trim();
    if (!t) { setTitleErr(true); return; }
    setTitleErr(false);
    if (!isEdit) {
      if (!nickname.trim()) { setNickErr(true); return; }
      setNickErr(false);
      if (!sect) { toast(text.formToastSect); return; }
    }
    const dt = new Date(now.getFullYear(), month - 1, day, hour, minute, 0);
    const startsAt = String(Math.floor(dt.getTime() / 1000));
    if (isEdit) {
      commitUpdate({
        variables: { id: groupingId!, input: { title: t, startsAt } },
        onCompleted: (res) => {
          if (res.updateGrouping?.ok) { toast(text.formToastSaved); onDone(); }
          else toast(fill(text.formToastSaveFailedTemplate, { error: res.updateGrouping?.error || text.unknownErrorText }));
        },
        onError: (e) => toast(fill(text.formToastSaveFailedTemplate, { error: e.message })),
      });
    } else {
      const submittedType = type;
      commitCreate({
        variables: {
          input: {
            slug, title: t, type: type as any, startsAt,
            dungeonId: type === 'ACTIVITY' || type === 'TOWER' ? null : (dungeonId || null),
            seats: [{ nickname: nickname.trim(), weapon: sect }],
          },
        },
        // 本人发车即时上列表: 把新车记录插进已缓存的对应 tab 列表,
        // 不等推送回声 (断线时也成立); 回声到达后重查再对齐排序。
        updater: (store) => {
          const payload = store.getRootField('createGrouping');
          const g = payload && payload.getLinkedRecord('grouping');
          if (g) appendGroupingToList(store, slug, submittedType, g);
        },
        onCompleted: (res) => {
          if (res.createGrouping?.ok) { toast(text.formToastPosted); onDone(); }
          else toast(fill(text.formToastCreateFailedTemplate, { error: res.createGrouping?.error || text.unknownErrorText }));
        },
        onError: (e) => toast(fill(text.formToastCreateFailedTemplate, { error: e.message })),
      });
    }
  };

  const busy = creating || updating;

  // portal 到 body: 页面容器的入场动画 transform 会把 position:fixed 困在
  // 容器盒内 (面板偏左/遮罩盖不满); 布局走 .yy-modal-* 类 (桌面居中 85vh,
  // 移动贴底), 见 index.css。
  return createPortal(
    <div className="yy-modal-overlay" onClick={onClose}>
      <div className="yy-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ flex: 1, fontSize: 20, color: theme.goldHi, letterSpacing: 4 }}>
            {isEdit ? text.formEditTitle : text.formCreateTitle}
          </div>
          <div onClick={onClose} style={{ color: theme.muted, fontSize: 24, cursor: 'pointer', padding: 8 }}>✕</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{text.formTypeLabel}</label>
          <select value={type} onChange={(e) => setType(e.target.value)} disabled={isEdit}
            style={{ ...inputStyle, opacity: isEdit ? .5 : 1 }}>
            {TYPE_OPTS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>{fill(text.formCapacityTemplate, { max: maxSlots, hint: slotsHint })}</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{text.formTitleLabel}</label>
          <input value={shownTitle} onChange={(e) => { setTitle(e.target.value); setTitleTouched(true); setTitleErr(false); }}
            placeholder={text.formTitlePlaceholder} style={{ ...inputStyle, ...(titleErr ? errStyle : {}) }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{text.formStartsLabel}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={month} onChange={(e) => setMonth(+e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{fill(text.formMonthTemplate, { n: i + 1 })}</option>)}
            </select>
            <select value={day} onChange={(e) => setDay(+e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              {Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1}>{fill(text.formDayTemplate, { n: i + 1 })}</option>)}
            </select>
            <select value={hour} onChange={(e) => setHour(+e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{fill(text.formHourTemplate, { n: i })}</option>)}
            </select>
            <select value={minute} onChange={(e) => setMinute(+e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              {[0, 15, 30, 45].map((m) => <option key={m} value={m}>{fill(text.formMinuteTemplate, { n: m })}</option>)}
            </select>
          </div>
        </div>

        {!isEdit && type !== 'ACTIVITY' && type !== 'TOWER' && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{text.formDungeonLabel}</label>
            <select value={dungeonId} onChange={(e) => setDungeonId(e.target.value)} style={inputStyle}>
              <option value="">{text.formDungeonNoneLabel}</option>
              {dungeons.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}

        {!isEdit && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{text.formNicknameLabel}</label>
              <input value={nickname} onChange={(e) => { setNickname(e.target.value); setNickErr(false); }}
                placeholder={text.formNicknamePlaceholder} style={{ ...inputStyle, ...(nickErr ? errStyle : {}) }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>{text.formSectLabel}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {SECTS.map((s) => (
                  <button key={s} onClick={() => setSect(s)} style={{
                    padding: '10px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                    border: `1px solid ${sect === s ? theme.gold : 'rgba(201,163,92,.25)'}`,
                    background: sect === s ? 'rgba(201,163,92,.25)' : 'transparent',
                    color: sect === s ? theme.goldHi : theme.paper,
                  }}>{s}</button>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 14, borderRadius: 10, cursor: 'pointer',
            background: 'transparent', border: `1px solid ${theme.gold}`, color: theme.paper, fontSize: 15,
          }}>{text.formCancelLabel}</button>
          <button onClick={submit} disabled={busy} style={{
            flex: 2, padding: 14, borderRadius: 10, cursor: busy ? 'wait' : 'pointer',
            background: theme.gold, border: 'none', color: '#1a1814', fontWeight: 700, fontSize: 15,
            opacity: busy ? .6 : 1,
          }}>{busy ? text.formSubmittingLabel : isEdit ? text.formSubmitEditLabel : text.formSubmitCreateLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
