import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLazyLoadQuery, useMutation } from 'react-relay';
import { fonts, theme } from '../theme';
import { GearQuickCalcMutation, GearQuickQuery } from '../documents';
import { BtnGold, BtnMini, Lbl, NumInput, fill, gearToast } from './bits';
import { fmt1 } from './gearStore';
import type { documentsGearQuickQuery } from '../__generated__/documentsGearQuickQuery.graphql';
import type { documentsGearQuickCalcMutation } from '../__generated__/documentsGearQuickCalcMutation.graphql';

// Stat-ratio quick calculator (mirrors Web GearQuick, embedded in the
// graduation view's ratio section, bench semantics): white->yellow
// conversion + gap estimates run on the backend gearQuickCalc; can sync
// the current loadout's white ratios from the bench.

type Whites = { acc: number; crit: number; int: number; res: number } | null;
type Status = { yellow: number; capped: boolean; over: number; lack: number; needWhite: number; bars: number };

export default function GearQuick({ whites }: { whites: Whites }) {
  const data = useLazyLoadQuery<documentsGearQuickQuery>(GearQuickQuery, {}, { fetchPolicy: 'store-or-network' });
  const t = data.gradPage;
  const [acc, setAcc] = useState('65');
  const [crit, setCrit] = useState('0');
  const [intR, setIntR] = useState('0');
  const [res, setRes] = useState(String(t.gearResDefault || 1.85));
  const [result, setResult] = useState<{ acc: Status; crit: Status; int: Status } | null>(null);
  const [commit, committing] = useMutation<documentsGearQuickCalcMutation>(GearQuickCalcMutation);

  const num = (x: string) => { const n = parseFloat(x); return Number.isFinite(n) ? n : 0; };

  const run = () => {
    commit({
      variables: { input: { whiteAcc: num(acc), whiteCrit: num(crit), whiteInt: num(intR), res: num(res) || 1.85 } },
      onCompleted: (resp) => setResult(resp.gearQuickCalc),
      onError: () => gearToast(t.gearCalcFailedText),
    });
  };

  const sync = () => {
    if (!whites) return;
    setAcc(String(whites.acc)); setCrit(String(whites.crit)); setIntR(String(whites.int));
    setRes(String(whites.res));
    gearToast(t.gearQuickSyncedToast);
  };

  const line = (label: string, st: Status, barName: string) => (
    <View style={s.line}>
      <Text style={s.lineLabel}>
        {label} <Text style={{ color: theme.accentHi, fontWeight: '700' }}>{fmt1(st.yellow)}%</Text>
      </Text>
      <Text style={[s.lineStatus, { color: st.capped ? '#9dc08b' : theme.muted }]}>
        {st.capped
          ? t.gearQuickOkText + (st.over > 0.05 ? fill(t.gearQuickOverTemplate, { v: fmt1(st.over) }) : '')
          : fill(t.gearQuickGapTemplate, { lack: fmt1(st.lack), need: fmt1(st.needWhite), bars: st.bars, barName })}
      </Text>
    </View>
  );

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={s.title}>{t.gearQuickTitle}</Text>
        <View style={{ flex: 1 }} />
        <BtnMini label={t.gearQuickSyncLabel} disabled={!whites} onPress={sync} />
      </View>
      <View style={s.grid}>
        <View style={s.cell}>
          <Lbl>{t.gearWhiteLabel} · {t.gearYAccLabel}</Lbl>
          <NumInput value={acc} onChangeText={setAcc} />
        </View>
        <View style={s.cell}>
          <Lbl>{t.gearWhiteLabel} · {t.gearYCritLabel}</Lbl>
          <NumInput value={crit} onChangeText={setCrit} />
        </View>
        <View style={s.cell}>
          <Lbl>{t.gearWhiteLabel} · {t.gearYIntLabel}</Lbl>
          <NumInput value={intR} onChangeText={setIntR} />
        </View>
        <View style={s.cell}>
          <Lbl>{t.gearQuickResLabel}</Lbl>
          <NumInput value={res} onChangeText={setRes} />
        </View>
      </View>
      <View style={{ marginTop: 10, alignItems: 'flex-start' }}>
        <BtnGold label={t.gearCalcLabel} disabled={committing} onPress={run} />
      </View>
      {result && (
        <View style={{ marginTop: 6 }}>
          {line(t.gearYAccLabel, result.acc, t.gearQuickBarNames[0] || '')}
          {line(t.gearYCritLabel, result.crit, t.gearQuickBarNames[1] || '')}
          {line(t.gearYIntLabel, result.int, t.gearQuickBarNames[2] || '')}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(67,160,134,.2)', paddingTop: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontFamily: fonts.body, color: theme.accentHi, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  cell: { flexBasis: '47%', flexGrow: 1 },
  line: {
    flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
    paddingVertical: 5, borderTopWidth: 1, borderTopColor: 'rgba(67,160,134,.15)',
  },
  lineLabel: { fontFamily: fonts.body, color: theme.paper, fontSize: 13 },
  lineStatus: { fontFamily: fonts.body, fontSize: 13 },
});
