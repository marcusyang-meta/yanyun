import { useState } from 'react';
import { graphql, useMutation, useLazyLoadQuery } from 'react-relay';
import { theme, fill } from '../../lib/format';
import { toast } from './Toast.react.tsx';
import type { TiaolvTabCalcMutation as TiaolvTabCalcMutationType } from './__generated__/TiaolvTabCalcMutation.graphql';

const SCHOOL2WUXUE: Record<string, string> = {
  '鸣金·虹': '鸣金虹', '鸣金·影': '鸣金影',
  '裂石·威': '裂石威', '裂石·钧': '裂石钧',
  '牵丝·玉': '牵丝玉', '牵丝·翊': '牵丝翊',
  '破竹·樽': '破竹樽', '破竹·鸢': '破竹鸢', '破竹·尘': '破竹尘', '破竹·风': '破竹风',
};
const SUITS = ['无', '燕归', '撼天', '连星', '裁云', '断岳', '玉斗', '时雨', '烟柳', '浣花', '飞隼'];
const BOWS = ['无', '精准', '会心', '会意'];
const COLS = ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];
// 调律行：Excel 行号 -> 标签（K3:R5, K6:R24）
const TUNE_ROWS: [number, string][] = [
  [3, '劲'], [4, '敏'], [5, '势'],
  [6, '最小外攻'], [7, '最大外攻'], [8, '精准'], [9, '会心'], [10, '会意'],
  [11, '最小鸣金'], [12, '最大鸣金'], [13, '最小裂石'], [14, '最大裂石'],
  [15, '最小牵丝'], [16, '最大牵丝'], [17, '最小破竹'], [18, '最大破竹'],
  [19, '最小无相'], [20, '最大无相'],
  [21, '武学增伤'], [22, '奇术增伤'], [23, '首领增伤'], [24, '全武增伤'],
];

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#1e1b15', border: '1px solid rgba(201,163,92,.3)',
  color: theme.paper, borderRadius: 8, padding: '10px', fontSize: 14, boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, color: theme.muted, marginBottom: 6, letterSpacing: 1,
};
const cellInput: React.CSSProperties = {
  width: '100%', background: '#1e1b15', border: '1px solid rgba(201,163,92,.2)',
  color: theme.goldHi, borderRadius: 6, padding: '8px 2px', fontSize: 13, textAlign: 'center',
};


const TiaolvTextQueryNode = graphql`
  query TiaolvTabTextQuery {
    tiaolvPage {
      tlIntroText
      tlInnerSkillTemplate
      tlInnerSkillPlaceholder
      tlWuxueLabel
      tlWukuLabel
      tlWukuSelfLabel
      tlWukuCommonLabel
      tlSuitLabel
      tlBowLabel
      tlNoneLabel
      tlTuneAreaLabel
      tlCalcLabel
      tlCalculatingLabel
      tlToastFailedText
      tlToastFailedWithTemplate
      tlColAttrLabel
      tlColBaseLabel
      tlColPanelLabel
      tlColFinalLabel
    }
  }
`;

const TiaolvTabCalcMutationNode = graphql`
  mutation TiaolvTabCalcMutation($input: TiaolvInput!) {
    calcTiaolv(input: $input) {
      rows {
        key
        label
        base
        panel
        final
      }
    }
  }
`;

export default function TiaolvTab({ sectSlug, sectName }: { sectSlug: string; sectName: string }) {
  const tl: any = (useLazyLoadQuery(TiaolvTextQueryNode, {}, { fetchPolicy: 'store-or-network' }) as any)?.tiaolvPage ?? {};
  const [xinfa, setXinfa] = useState<string[]>(['', '', '', '']);
  const [wuxue, setWuxue] = useState(SCHOOL2WUXUE[sectName] || '');
  const [wuku, setWuku] = useState<'本系' | '通用'>('本系');
  const [suit, setSuit] = useState('撼天');
  const [bow, setBow] = useState('无');
  const [tunes, setTunes] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any[] | null>(null);

  const [commit, calculating] = useMutation<TiaolvTabCalcMutationType>(TiaolvTabCalcMutationNode);

  const setTune = (cell: string, v: string) => {
    setTunes((p) => ({ ...p, [cell]: v }));
  };

  const calc = () => {
    const tuneList = Object.entries(tunes)
      .filter(([, v]) => v !== '' && !isNaN(parseFloat(v)))
      .map(([cell, v]) => ({ cell, value: parseFloat(v) }));
    commit({
      variables: {
        input: {
          innerSkills: xinfa.map((x) => x.trim() || 'N/A'),
          wuxue: wuxue.trim() || null,
          wuku,
          attrRequire: 492,
          suit,
          bowSkill: bow === '无' ? null : bow,
          tunes: tuneList,
        },
      },
      onCompleted: (res) => {
        const rows = res.calcTiaolv?.rows;
        if (rows) setResult(rows as any[]);
        else toast(tl.tlToastFailedText);
      },
      onError: (e) => toast(fill(tl.tlToastFailedWithTemplate ?? '', { error: e.message })),
    });
  };

  const fmt = (v: number | null | undefined) =>
    v == null ? '—' : (Math.round(v * 10) / 10).toString();

  return (
    <div>
      <div style={{ fontSize: 13, color: theme.muted, marginBottom: 16, lineHeight: 1.7 }}>
        {tl.tlIntroText}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <label style={labelStyle}>{fill(tl.tlInnerSkillTemplate ?? '', { n: i + 1 })}</label>
            <input value={xinfa[i]} onChange={(e) => {
              const n = [...xinfa]; n[i] = e.target.value; setXinfa(n);
            }} placeholder={tl.tlInnerSkillPlaceholder} style={inputStyle} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>{tl.tlWuxueLabel}</label>
          <input value={wuxue} onChange={(e) => setWuxue(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{tl.tlWukuLabel}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['本系', '通用'] as const).map((w) => (
              <button key={w} onClick={() => setWuku(w)} style={{
                flex: 1, padding: 10, borderRadius: 8, cursor: 'pointer', fontSize: 14,
                border: `1px solid ${theme.gold}`,
                background: wuku === w ? theme.gold : 'transparent',
                color: wuku === w ? '#1a1814' : theme.paper,
              }}>{w === '本系' ? tl.tlWukuSelfLabel : tl.tlWukuCommonLabel}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>{tl.tlSuitLabel}</label>
          <select value={suit} onChange={(e) => setSuit(e.target.value)} style={inputStyle}>
            {SUITS.map((s) => <option key={s} value={s}>{s === '无' ? tl.tlNoneLabel : s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>{tl.tlBowLabel}</label>
          <select value={bow} onChange={(e) => setBow(e.target.value)} style={inputStyle}>
            {BOWS.map((b) => <option key={b} value={b}>{b === '无' ? tl.tlNoneLabel : b}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>{tl.tlTuneAreaLabel}</label>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 560 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontSize: 12, color: theme.muted, padding: '6px 4px' }}></th>
                {COLS.map((c) => (
                  <th key={c} style={{ fontSize: 12, color: theme.muted, padding: '6px 4px' }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TUNE_ROWS.map(([row, label]) => (
                <tr key={row}>
                  <td style={{ fontSize: 12, color: theme.gold, padding: '4px', whiteSpace: 'nowrap' }}>{label}</td>
                  {COLS.map((c) => {
                    const cell = `${c}${row}`;
                    return (
                      <td key={cell} style={{ padding: 2 }}>
                        <input type="number" step="any" value={tunes[cell] || ''}
                          onChange={(e) => setTune(cell, e.target.value)}
                          placeholder="0" style={cellInput} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button onClick={calc} disabled={calculating} style={{
        width: '100%', padding: 14, borderRadius: 10, cursor: calculating ? 'wait' : 'pointer',
        background: theme.gold, border: 'none', color: '#1a1814', fontWeight: 700, fontSize: 15,
        opacity: calculating ? .6 : 1, marginBottom: 16,
      }}>{calculating ? tl.tlCalculatingLabel : tl.tlCalcLabel}</button>

      {result && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
            <thead>
              <tr style={{ color: theme.muted, fontSize: 12 }}>
                <th style={{ textAlign: 'left', padding: '8px 4px', borderBottom: `1px solid rgba(201,163,92,.3)` }}>{tl.tlColAttrLabel}</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: `1px solid rgba(201,163,92,.3)` }}>{tl.tlColBaseLabel}</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: `1px solid rgba(201,163,92,.3)` }}>{tl.tlColPanelLabel}</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', borderBottom: `1px solid rgba(201,163,92,.3)` }}>{tl.tlColFinalLabel}</th>
              </tr>
            </thead>
            <tbody>
              {result.map((r: any) => (
                <tr key={r.key}>
                  <td style={{ padding: '8px 4px', color: theme.gold, borderBottom: '1px solid rgba(201,163,92,.1)' }}>{r.label}</td>
                  <td style={{ textAlign: 'right', padding: '8px 4px', color: theme.paper, borderBottom: '1px solid rgba(201,163,92,.1)' }}>{fmt(r.base)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 4px', color: theme.paper, borderBottom: '1px solid rgba(201,163,92,.1)' }}>{fmt(r.panel)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 4px', color: theme.goldHi, fontWeight: 700, borderBottom: '1px solid rgba(201,163,92,.1)' }}>{fmt(r.final)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ display: 'none' }}>{sectSlug}</div>
    </div>
  );
}
