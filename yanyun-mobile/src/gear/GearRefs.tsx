import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLazyLoadQuery } from 'react-relay';
import { fonts, theme } from '../theme';
import { GearRefsQuery, GearSectRecipesQuery } from '../documents';
import { BtnMini, TextInp, fill, gearToast } from './bits';
import { fmt1, requestGearTarget } from './gearStore';
import type { documentsGearRefsQuery } from '../__generated__/documentsGearRefsQuery.graphql';
import type { documentsGearSectRecipesQuery } from '../__generated__/documentsGearSectRecipesQuery.graphql';

// 参考数据 (与 Web GearRefs 同构): 全流派配方表 / 词条满值承音对照表 /
// 部位版位表 / 公式与五维速查。嵌在毕业计算的「参考数据」区。
export default function GearRefs() {
  const data = useLazyLoadQuery<documentsGearRefsQuery>(GearRefsQuery, {}, { fetchPolicy: 'store-or-network' });
  const t = data.gradPage;
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const cats = useMemo(() => [...new Set(t.gearBuilds.map((b) => b.cat))], [t.gearBuilds]);
  const rows = useMemo(() => {
    const kw = q.trim();
    return t.gearBuilds.filter((b) => {
      if (cat && b.cat !== cat) return false;
      if (!kw) return true;
      return b.school.includes(kw) || b.set.includes(kw) || b.targets.some((x) => x.label.includes(kw));
    });
  }, [t.gearBuilds, q, cat]);

  const slotTable = (title: string, list: readonly { slot: string; lines: readonly string[] }[]) => (
    <View style={{ marginTop: 6 }}>
      <Text style={s.slotTableTitle}>{title}</Text>
      {list.map((r) => (
        <View key={r.slot} style={s.tr}>
          <Text style={[s.td, { color: theme.goldHi, width: 74 }]}>{r.slot}</Text>
          <Text style={[s.td, { flex: 1 }]}>{r.lines.join('、')}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View>
      <Text style={[s.h3, { marginTop: 4 }]}>{t.gearRecipesTitle}</Text>
      <View style={s.filterRow}>
        <TextInp
          style={{ flex: 1, minWidth: 140 }}
          value={q}
          onChangeText={setQ}
          placeholder={t.gearRecipeSearchPlaceholder}
        />
        <BtnMini label={t.gearRecipeAllLabel} active={cat === ''} onPress={() => setCat('')} />
        {cats.map((c) => (
          <BtnMini key={c} label={c} active={cat === c} onPress={() => setCat(c)} />
        ))}
      </View>
      <View>
        <View style={s.trHead}>
          <Text style={[s.th, { width: 52 }]}>{t.gearRecipeColCat}</Text>
          <Text style={[s.th, { width: 74 }]}>{t.gearRecipeColSchool}</Text>
          <Text style={[s.th, { width: 58 }]}>{t.gearRecipeColSet}</Text>
          <Text style={[s.th, { flex: 1 }]}>{t.gearRecipeColRecipe}</Text>
          <Text style={[s.th, { width: 52 }]}>{t.gearRecipeColBow}</Text>
          <Text style={[s.th, { width: 64 }]}> </Text>
        </View>
        {rows.map((b) => (
          <View key={b.idx} style={s.tr}>
            <Text style={[s.td, { width: 52 }]}>{b.cat}</Text>
            <Text style={[s.td, { width: 74, color: theme.goldHi }]}>{b.school}</Text>
            <Text style={[s.td, { width: 58 }]}>{b.set}</Text>
            <Text style={[s.td, { flex: 1 }]}>{b.recipe}</Text>
            <Text style={[s.td, { width: 52 }]}>{b.bowLabel || '—'}</Text>
            <View style={{ width: 64 }}>
              <BtnMini
                label={t.gearRecipeSetTargetLabel}
                onPress={() => {
                  requestGearTarget(b.idx);
                  gearToast(fill(t.gearRecipeTargetToastTemplate, { school: b.school, set: b.set }));
                }}
              />
            </View>
          </View>
        ))}
        {rows.length === 0 && <Text style={s.td}>{t.gearRecipeEmptyText}</Text>}
      </View>

      <Text style={s.h3}>{t.gearAffixTableTitle}</Text>
      <View>
        <View style={s.trHead}>
          <Text style={[s.th, { width: 92 }]}>{t.gradColAffixLabel}</Text>
          <Text style={[s.th, { width: 48 }]}>{t.gradColMaxLabel}</Text>
          <Text style={[s.th, { width: 48 }]}>{t.gearColCyLabel}</Text>
          <Text style={[s.th, { width: 52 }]}>{t.gearColCyPctLabel}</Text>
          <Text style={[s.th, { flex: 1 }]}>{t.gearColRecipeNamesLabel}</Text>
        </View>
        {t.gearAffixes.map((a) => (
          <View key={a.key} style={s.tr}>
            <Text style={[s.td, { width: 92, color: theme.goldHi }]}>
              {a.label}
              {a.recipeNames.length === 0 && <Text style={{ color: theme.muted, fontSize: 11 }}> · {t.gearSurvivalNote}</Text>}
            </Text>
            <Text style={[s.td, { width: 48 }]}>{fmt1(a.max)}</Text>
            <Text style={[s.td, { width: 48 }]}>{fmt1(a.cy)}</Text>
            <Text style={[s.td, { width: 52 }]}>{Math.round(a.cyPct * 1000) / 10}%</Text>
            <Text style={[s.td, { flex: 1 }]}>{a.recipeNames.length ? a.recipeNames.join(' / ') : '—'}</Text>
          </View>
        ))}
      </View>

      <Text style={s.h3}>{t.gearSlotTableTitle}</Text>
      {slotTable(t.gearSlotsBigTitle, t.gearSlotsBig)}
      {slotTable(t.gearSlotsSmallTitle, t.gearSlotsSmall)}

      <Text style={s.h3}>{t.gearFormulaTitle}</Text>
      <View>
        <Text style={s.formulaHead}>{t.gearFormulaRatesTitle}</Text>
        <Text style={s.formulaLine}>· {fill(t.gearFormulaAccTemplate, { white: 130 })}</Text>
        <Text style={s.formulaLine}>· {fill(t.gearFormulaCritTemplate, { white: 148 })}</Text>
        <Text style={s.formulaLine}>· {fill(t.gearFormulaIntTemplate, { white: 74 })}</Text>
        <Text style={s.formulaLine}>· {fill(t.gearFormulaBarsTemplate, { acc: 8.8, crit: 9.8, int: 4.9, minCrit: 4.1, shiInt: 2.1 })}</Text>
        <Text style={s.formulaLine}>· {fill(t.gearFormulaBowTemplate, { acc: 4.7, crit: 5.2, int: 2.6, res: t.gearResDefault })}</Text>
        <Text style={[s.formulaHead, { marginTop: 6 }]}>{t.gearFormulaDimsTitle}</Text>
      </View>
      <View style={{ marginTop: 4 }}>
        <View style={s.trHead}>
          <Text style={[s.th, { width: 74 }]}>{t.gearColDimLabel}</Text>
          <Text style={[s.th, { flex: 1 }]}>{t.gearColConvLabel}</Text>
          <Text style={[s.th, { flex: 1 }]}> </Text>
        </View>
        {t.gearDimRows.map((d) => (
          <View key={d.name} style={s.tr}>
            <Text style={[s.td, { width: 74, color: theme.goldHi }]}>{d.name}</Text>
            <Text style={[s.td, { flex: 1 }]}>{d.conv}</Text>
            <Text style={[s.td, { flex: 1, color: theme.muted }]}>{d.full}</Text>
          </View>
        ))}
      </View>
      <Text style={s.formulaLine}>
        <Text style={{ color: theme.goldHi }}>{t.gearFormulaOrderTitle}：</Text>{t.gearFormulaOrderText}
      </Text>
    </View>
  );
}

// 流派页 BiS 区下方的 100 阶配方 (与 Web GearSectRecipes 同构): 「设为
// 目标」切到配装台口径并跳到毕业页签 (onPicked 由流派详情承接)。
export function GearSectRecipes({ sectName, onPicked }: { sectName: string; onPicked: () => void }) {
  const data = useLazyLoadQuery<documentsGearSectRecipesQuery>(GearSectRecipesQuery, {}, { fetchPolicy: 'store-or-network' });
  const t = data.gradPage;
  const rows = t.gearBuilds.filter((b) => b.sectName === sectName);
  if (!rows.length) return null;
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={s.sectRecipesTitle}>{t.gearSectRecipesTitle}</Text>
      <View style={{ gap: 8 }}>
        {rows.map((b) => (
          <View key={b.idx} style={s.recipeCard}>
            <Text style={s.recipeSchool}>{b.school} · {b.set}</Text>
            <Text style={s.recipeText}>
              {b.recipe}
              {b.bowLabel ? ` · ${b.bowLabel}` : ''}
            </Text>
            <BtnMini
              label={t.gearRecipeSetTargetLabel}
              onPress={() => {
                requestGearTarget(b.idx);
                gearToast(fill(t.gearRecipeTargetToastTemplate, { school: b.school, set: b.set }));
                onPicked();
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  h3: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 14.5, marginTop: 18, marginBottom: 8 },
  filterRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 },
  trHead: {
    flexDirection: 'row', gap: 4, paddingVertical: 5, paddingHorizontal: 2,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,163,92,.25)',
  },
  th: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11.5 },
  tr: {
    flexDirection: 'row', gap: 4, paddingVertical: 6, paddingHorizontal: 2,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,163,92,.1)', alignItems: 'flex-start',
  },
  td: { fontFamily: fonts.serif, paddingVertical: 0, fontSize: 12.5, color: theme.paper },
  slotTableTitle: { fontFamily: fonts.serif, color: theme.paper, fontSize: 13, marginBottom: 4 },
  formulaHead: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 12.5, lineHeight: 24 },
  formulaLine: { fontFamily: fonts.serif, fontSize: 12.5, color: theme.paper, lineHeight: 24 },
  sectRecipesTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 14, marginBottom: 8 },
  recipeCard: {
    flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap',
    borderWidth: 1, borderColor: 'rgba(201,163,92,.22)', borderRadius: 10,
    paddingVertical: 9, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,.25)',
  },
  recipeSchool: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13.5 },
  recipeText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 12.5, flex: 1, minWidth: 180 },
});
