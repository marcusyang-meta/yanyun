import { useState } from 'react';
import { graphql, useMutation, useLazyLoadQuery } from 'react-relay';
import { theme, fill } from '../../lib/format';
import { toast } from './Toast.react.tsx';
import type { TiaolvTabCalcMutation as TiaolvTabCalcMutationType } from './__generated__/TiaolvTabCalcMutation.graphql';

const COLS = ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];

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
      tlSuitLabel
      tlBowLabel
      tlSuitOptions { id label isDefault }
      tlBowOptions { id label isDefault }
      tlWukuOptions { id label isDefault }
      tlTuneRows { row label }
      tlSectWuxue { sectSlug wuxue }
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

export default function TiaolvTab({ sectSlug }: { sectSlug: string; sectName: string }) {
  const tl: any = (useLazyLoadQuery(TiaolvTextQueryNode, {}, { fetchPolicy: 'store-or-network' }) as any)?.tiaolvPage ?? {};
  // Closed vocabularies arrive as {id, label} options from the backend
  // (the single vocabulary source); state and mutation input carry ids.
  const suitOptions: any[] = tl.tlSuitOptions ?? [];
  const bowOptions: any[] = tl.tlBowOptions ?? [];
  const wukuOptions: any[] = tl.tlWukuOptions ?? [];
  const tuneRows: any[] = tl.tlTuneRows ?? [];
  const defaultOf = (opts: any[]) => opts.find((o) => o.isDefault)?.id ?? opts[0]?.id ?? '';
  const [xinfa, setXinfa] = useState<string[]>(['', '', '', '']);
  const [wuxue, setWuxue] = useState(
    () => (tl.tlSectWuxue ?? []).find((s: any) => s.sectSlug === sectSlug)?.wuxue || '',
  );
  const [wuku, setWuku] = useState(() => defaultOf(wukuOptions));
  const [suit, setSuit] = useState(() => defaultOf(suitOptions));
  const [bow, setBow] = useState(() => defaultOf(bowOptions));
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
          wuku: wuku || null,
          attrRequire: 492,
          suit,
          bowSkill: bow === 'none' ? null : bow,
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
            {wukuOptions.map((w: any) => (
              <button key={w.id} onClick={() => setWuku(w.id)} style={{
                flex: 1, padding: 10, borderRadius: 8, cursor: 'pointer', fontSize: 14,
                border: `1px solid ${theme.gold}`,
                background: wuku === w.id ? theme.gold : 'transparent',
                color: wuku === w.id ? '#1a1814' : theme.paper,
              }}>{w.label}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>{tl.tlSuitLabel}</label>
          <select value={suit} onChange={(e) => setSuit(e.target.value)} style={inputStyle}>
            {suitOptions.map((s: any) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>{tl.tlBowLabel}</label>
          <select value={bow} onChange={(e) => setBow(e.target.value)} style={inputStyle}>
            {bowOptions.map((b: any) => <option key={b.id} value={b.id}>{b.label}</option>)}
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
              {tuneRows.map(({ row, label }: any) => (
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
