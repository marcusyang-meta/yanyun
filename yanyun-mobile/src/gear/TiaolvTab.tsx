import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLazyLoadQuery, useMutation } from 'react-relay';
import { fonts, theme } from '../theme';
import { TiaolvCalcMutation, TiaolvTextQuery } from '../documents';
import { BtnGold, BtnMini, Lbl, SheetSelect, TextInp, fill, gearToast } from './bits';
import type { documentsTiaolvTextQuery } from '../__generated__/documentsTiaolvTextQuery.graphql';
import type { documentsTiaolvCalcMutation } from '../__generated__/documentsTiaolvCalcMutation.graphql';

// Tuning tab (mirrors Web TiaolvTab): DIY 0.10.2 rules, per-cell entry of
// the Excel K3:R24 tuning grid; backend calcTiaolv replicates the Excel
// formulas and returns base white / panel white / final panel columns.
// Game data constants (cells/sets/bow/martial mappings) share Web's source.

// Same constants as Web: sect name -> martial-art name (one sect has no martial slot; leave it empty)
const SCHOOL2WUXUE: Record<string, string> = {
  '鸣金·虹': '鸣金虹', '鸣金·影': '鸣金影', '裂石·威': '裂石威', '裂石·钧': '裂石钧',
  '牵丝·玉': '牵丝玉', '牵丝·翊': '牵丝翊',
  '破竹·樽': '破竹樽', '破竹·鸢': '破竹鸢', '破竹·尘': '破竹尘', '破竹·风': '破竹风',
};
const SUITS = ['无', '燕归', '撼天', '连星', '裁云', '断岳', '玉斗', '时雨', '烟柳', '浣花', '飞隼'];
const BOWS = ['无', '精准', '会心', '会意'];
const COLS = ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];
const TUNE_ROWS: [number, string][] = [
  [3, '劲'], [4, '敏'], [5, '势'], [6, '最小外攻'], [7, '最大外攻'], [8, '精准'],
  [9, '会心'], [10, '会意'], [11, '最小鸣金'], [12, '最大鸣金'], [13, '最小裂石'],
  [14, '最大裂石'], [15, '最小牵丝'], [16, '最大牵丝'], [17, '最小破竹'],
  [18, '最大破竹'], [19, '最小无相'], [20, '最大无相'], [21, '武学增伤'],
  [22, '奇术增伤'], [23, '首领增伤'], [24, '全武增伤'],
];

const fmt = (v: number | null | undefined) => (v == null ? '—' : String(Math.round(v * 10) / 10));

export default function TiaolvTab({ sectName }: { sectSlug: string; sectName: string }) {
  const data = useLazyLoadQuery<documentsTiaolvTextQuery>(TiaolvTextQuery, {}, { fetchPolicy: 'store-or-network' });
  const t = data.tiaolvPage;
  const [xinfa, setXinfa] = useState<string[]>(['', '', '', '']);
  const [wuxue, setWuxue] = useState(SCHOOL2WUXUE[sectName] || '');
  const [wuku, setWuku] = useState<'self' | 'common'>('self');
  const [suit, setSuit] = useState('撼天');
  const [bow, setBow] = useState('无');
  const [cells, setCells] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<documentsTiaolvCalcMutation['response']['calcTiaolv']['rows'] | null>(null);
  const [commit, committing] = useMutation<documentsTiaolvCalcMutation>(TiaolvCalcMutation);

  const suitOptions = useMemo(
    () => SUITS.map((su) => ({ value: su, label: su === '无' ? t.tlNoneLabel : su })),
    [t],
  );
  const bowOptions = useMemo(
    () => BOWS.map((b) => ({ value: b, label: b === '无' ? t.tlNoneLabel : b })),
    [t],
  );

  const calc = () => {
    const tunes = Object.entries(cells)
      .filter(([, raw]) => raw.trim() !== '')
      .map(([cell, raw]) => ({ cell, value: Number(raw) }))
      .filter((x) => Number.isFinite(x.value) && x.value !== 0);
    commit({
      variables: {
        input: {
          innerSkills: xinfa.map((x) => x.trim() || 'N/A'),
          wuxue: wuxue.trim() || null,
          wuku,
          attrRequire: 492,
          suit,
          bowSkill: bow === '无' ? null : bow,
          tunes,
        },
      },
      onCompleted: (resp) => {
        const r = resp.calcTiaolv?.rows;
        if (r) setRows(r);
      },
      onError: (e) => gearToast(fill(t.tlToastFailedWithTemplate, { error: e.message })),
    });
  };

  return (
    <View>
      <Text style={s.intro}>{t.tlIntroText}</Text>
      <View style={s.grid2}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={s.cell}>
            <Lbl>{fill(t.tlInnerSkillTemplate, { n: i + 1 })}</Lbl>
            <TextInp
              value={xinfa[i]}
              placeholder={t.tlInnerSkillPlaceholder}
              onChangeText={(v) => {
                const n = [...xinfa];
                n[i] = v;
                setXinfa(n);
              }}
            />
          </View>
        ))}
      </View>
      <View style={[s.grid2, { marginTop: 10 }]}>
        <View style={s.cell}>
          <Lbl>{t.tlWuxueLabel}</Lbl>
          <TextInp value={wuxue} onChangeText={setWuxue} />
        </View>
        <View style={s.cell}>
          <Lbl>{t.tlWukuLabel}</Lbl>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <BtnMini label={t.tlWukuSelfLabel} active={wuku === 'self'} onPress={() => setWuku('self')} />
            <BtnMini label={t.tlWukuCommonLabel} active={wuku === 'common'} onPress={() => setWuku('common')} />
          </View>
        </View>
        <View style={s.cell}>
          <Lbl>{t.tlSuitLabel}</Lbl>
          <SheetSelect value={suit} options={suitOptions} onChange={setSuit} />
        </View>
        <View style={s.cell}>
          <Lbl>{t.tlBowLabel}</Lbl>
          <SheetSelect value={bow} options={bowOptions} onChange={setBow} />
        </View>
      </View>

      <Text style={s.gridTitle}>{t.tlTuneAreaLabel}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={s.tr}>
            <Text style={[s.th, { width: 76 }]}> </Text>
            {COLS.map((c) => (
              <Text key={c} style={[s.th, { width: 46, textAlign: 'center' }]}>{c}</Text>
            ))}
          </View>
          {TUNE_ROWS.map(([row, label]) => (
            <View key={row} style={s.tr}>
              <Text style={[s.tdLabel, { width: 76 }]}>{label}</Text>
              {COLS.map((c) => {
                const cell = `${c}${row}`;
                return (
                  <TextInput
                    key={cell}
                    style={s.cellInput}
                    value={cells[cell] || ''}
                    placeholder="0"
                    placeholderTextColor={theme.muted}
                    keyboardType="decimal-pad"
                    onChangeText={(v) => setCells((prev) => ({ ...prev, [cell]: v }))}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{ marginTop: 14, alignItems: 'flex-start' }}>
        <BtnGold label={committing ? t.tlCalculatingLabel : t.tlCalcLabel} disabled={committing} onPress={calc} />
      </View>

      {rows && (
        <View style={{ marginTop: 16 }}>
          <View style={s.trHead}>
            <Text style={[s.th, { width: 96 }]}>{t.tlColAttrLabel}</Text>
            <Text style={[s.th, { width: 72, textAlign: 'right' }]}>{t.tlColBaseLabel}</Text>
            <Text style={[s.th, { width: 72, textAlign: 'right' }]}>{t.tlColPanelLabel}</Text>
            <Text style={[s.th, { width: 72, textAlign: 'right' }]}>{t.tlColFinalLabel}</Text>
          </View>
          {rows.map((r) => (
            <View key={r.key} style={s.tr}>
              <Text style={[s.td, { width: 96 }]}>{r.label}</Text>
              <Text style={[s.td, { width: 72, textAlign: 'right' }]}>{fmt(r.base)}</Text>
              <Text style={[s.td, { width: 72, textAlign: 'right' }]}>{fmt(r.panel)}</Text>
              <Text style={[s.td, { width: 72, textAlign: 'right', color: theme.goldHi, fontWeight: '700' }]}>{fmt(r.final)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  intro: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12.5, lineHeight: 21, marginBottom: 12 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { flexBasis: '47%', flexGrow: 1 },
  gridTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13.5, marginTop: 16, marginBottom: 8 },
  tr: {
    flexDirection: 'row', gap: 4, alignItems: 'center',
    paddingVertical: 2.5, borderBottomWidth: 1, borderBottomColor: 'rgba(201,163,92,.08)',
  },
  trHead: {
    flexDirection: 'row', gap: 4, alignItems: 'center',
    paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: 'rgba(201,163,92,.25)',
  },
  th: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11.5 },
  td: { fontFamily: fonts.serif, color: theme.paper, fontSize: 12.5 },
  tdLabel: { fontFamily: fonts.serif, color: theme.paper, fontSize: 12 },
  cellInput: {
    width: 46, height: 30, borderWidth: 1, borderColor: 'rgba(201,163,92,.3)',
    borderRadius: 6, backgroundColor: 'rgba(255,255,255,.05)',
    color: theme.paper, fontFamily: fonts.serif, fontSize: 12, textAlign: 'center', paddingVertical: 0,
  },
});
