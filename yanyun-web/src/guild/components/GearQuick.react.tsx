import { useState } from 'react';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { theme, fill } from '../../lib/format.ts';
import { fmt1 } from './gearStore.ts';
import { toast } from './Toast.react.tsx';
import type { GearQuickQuery as GearQuickQueryType } from './__generated__/GearQuickQuery.graphql.ts';
import type { GearQuickCalcMutation as GearQuickCalcMutationType } from './__generated__/GearQuickCalcMutation.graphql.ts';

const quickQuery = graphql`
  query GearQuickQuery {
    gradPage {
      gearQuickTitle
      gearQuickResLabel
      gearQuickSyncLabel
      gearQuickSyncedToast
      gearQuickOkText
      gearQuickOverTemplate
      gearQuickGapTemplate
      gearCalcLabel
      gearCalcFailedText
      gearYAccLabel
      gearYCritLabel
      gearYIntLabel
      gearWhiteLabel
      gearQuickBarNames
      gearResDefault
    }
  }
`;

const quickMutation = graphql`
  mutation GearQuickCalcMutation($input: GearQuickInput!) {
    gearQuickCalc(input: $input) {
      acc { yellow capped over lack needWhite bars }
      crit { yellow capped over lack needWhite bars }
      int { yellow capped over lack needWhite bars }
    }
  }
`;

type Whites = { acc: number; crit: number; int: number; res: number } | null;
type Status = { yellow: number; capped: boolean; over: number; lack: number; needWhite: number; bars: number };

// Three-rate quick calculator (embedded in the graduation calculator's
// "three rates" section, gear-bench caliber): white-stat -> yellow-stat
// conversion + missing-affix estimation; can sync the current build's white
// three rates from the gear bench.
export default function GearQuick({ whites }: { whites: Whites }) {
  const data = useLazyLoadQuery<GearQuickQueryType>(quickQuery, {});
  const t = data.gradPage;
  const [acc, setAcc] = useState('65');
  const [crit, setCrit] = useState('0');
  const [intR, setIntR] = useState('0');
  const [res, setRes] = useState(String(t.gearResDefault || 1.85));
  const [result, setResult] = useState<{ acc: Status; crit: Status; int: Status } | null>(null);
  const [commit, committing] = useMutation<GearQuickCalcMutationType>(quickMutation);

  const num = (s: string) => { const n = parseFloat(s); return Number.isFinite(n) ? n : 0; };

  const run = () => {
    commit({
      variables: { input: { whiteAcc: num(acc), whiteCrit: num(crit), whiteInt: num(intR), res: num(res) || 1.85 } },
      onCompleted: (resp) => setResult(resp.gearQuickCalc),
      onError: () => toast(t.gearCalcFailedText),
    });
  };

  const sync = () => {
    if (!whites) return;
    setAcc(String(whites.acc)); setCrit(String(whites.crit)); setIntR(String(whites.int));
    setRes(String(whites.res));
    toast(t.gearQuickSyncedToast);
  };

  const line = (label: string, s: Status, barName: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '5px 0', borderTop: '1px dashed rgba(67,160,134,.15)', fontSize: 13, flexWrap: 'wrap' }}>
      <span style={{ color: theme.paper }}>{label} <b style={{ color: theme.accentHi }}>{fmt1(s.yellow)}%</b></span>
      <span style={{ color: s.capped ? '#9dc08b' : theme.muted }}>
        {s.capped
          ? t.gearQuickOkText + (s.over > 0.05 ? fill(t.gearQuickOverTemplate, { v: fmt1(s.over) }) : '')
          : fill(t.gearQuickGapTemplate, { lack: fmt1(s.lack), need: fmt1(s.needWhite), bars: s.bars, barName })}
      </span>
    </div>
  );

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,.35)', color: theme.paper,
    border: '1px solid rgba(67,160,134,.35)', borderRadius: 6, padding: '6px 8px', fontSize: 13,
  };
  const lbl: React.CSSProperties = { display: 'block', color: theme.muted, fontSize: 11, marginBottom: 3 };

  return (
    <div style={{ marginTop: 14, borderTop: '1px solid rgba(67,160,134,.2)', paddingTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ color: theme.accentHi, fontSize: 14 }}>{t.gearQuickTitle}</span>
        <span style={{ flex: 1 }} />
        <button disabled={!whites} onClick={sync} style={{
          fontSize: 12, padding: '4px 12px', borderRadius: 999, cursor: whites ? 'pointer' : 'not-allowed',
          background: 'transparent', border: `1px solid ${theme.accent}`, color: theme.accentHi, opacity: whites ? 1 : 0.45,
        }}>{t.gearQuickSyncLabel}</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(90px,1fr))', gap: 8, marginTop: 10 }}>
        <label><span style={lbl}>{t.gearWhiteLabel} · {t.gearYAccLabel}</span><input style={inp} inputMode="decimal" value={acc} onChange={(e) => setAcc(e.target.value)} /></label>
        <label><span style={lbl}>{t.gearWhiteLabel} · {t.gearYCritLabel}</span><input style={inp} inputMode="decimal" value={crit} onChange={(e) => setCrit(e.target.value)} /></label>
        <label><span style={lbl}>{t.gearWhiteLabel} · {t.gearYIntLabel}</span><input style={inp} inputMode="decimal" value={intR} onChange={(e) => setIntR(e.target.value)} /></label>
        <label><span style={lbl}>{t.gearQuickResLabel}</span><input style={inp} inputMode="decimal" value={res} onChange={(e) => setRes(e.target.value)} /></label>
      </div>
      <button disabled={committing} onClick={run} style={{
        marginTop: 10, padding: '7px 18px', borderRadius: 8, cursor: 'pointer',
        background: theme.accent, border: 'none', color: '#0a120e', fontWeight: 600, fontSize: 13,
      }}>{t.gearCalcLabel}</button>
      {result && (
        <div style={{ marginTop: 6 }}>
          {line(t.gearYAccLabel, result.acc, t.gearQuickBarNames[0] || '')}
          {line(t.gearYCritLabel, result.crit, t.gearQuickBarNames[1] || '')}
          {line(t.gearYIntLabel, result.int, t.gearQuickBarNames[2] || '')}
        </div>
      )}
    </div>
  );
}
