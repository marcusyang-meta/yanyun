import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery } from 'react-relay';
import { fonts, theme } from '../theme';
import { CardFill } from '../components/ui';
import { SectPageQuery } from '../documents';
import TiaolvTab from '../gear/TiaolvTab';
import GradCalc from '../gear/GradCalc';
import { GearSectRecipes } from '../gear/GearRefs';
import { GearToastHost } from '../gear/bits';
import { GoldDustHost } from '../gear/GearSeal';
import type { documentsSectPageQuery } from '../__generated__/documentsSectPageQuery.graphql';

// Sect guides: mirrors Web SectDetail -- sects are grouped by family
// (same grouping rule as Web: by name prefix); a sect's detail has BiS
// (per-slot cards + affix chips, with the tier-100 recipe section below)
// / graduation affixes (per-build affix composition tables) / rotation
// (dummy rotation/opener/loop/notes/mindset/video) / stat targets /
// tuning / graduation (incl. bench + library + builds, the gradPage
// surface) -- the same six tabs as Web. All copy comes from backend
// shell fields.

// Same MENPAI group order as Web SectDetail
const MENPAI = ['鸣金', '牵丝', '裂石', '破竹'];

type SectData = documentsSectPageQuery['response']['sectPage'];
type SectRow = SectData['sects'][number];

export default function SectView() {
  const insets = useSafeAreaInsets();
  const [sectSlug, setSectSlug] = useState<string | null>(null);
  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 + insets.bottom }}
      >
        <SectList sectSlug={sectSlug} setSectSlug={setSectSlug} />
      </ScrollView>
      <GearToastHost />
      <GoldDustHost />
    </>
  );
}

function SectList({ sectSlug, setSectSlug }: { sectSlug: string | null; setSectSlug: (s: string | null) => void }) {
  const data = useLazyLoadQuery<documentsSectPageQuery>(SectPageQuery, {}, { fetchPolicy: 'store-or-network' });
  const page = data.sectPage;
  const sects: readonly SectRow[] = page?.sects ?? [];
  const text = page;

  if (sectSlug) {
    const sect = sects.find((x) => x.slug === sectSlug);
    if (sect) return <SectDetail sect={sect} text={text} onBack={() => setSectSlug(null)} />;
  }

  const groups = MENPAI
    .map((m) => ({ menpai: m, list: sects.filter((x) => x.name.split('·')[0] === m) }))
    .filter((g) => g.list.length > 0);

  return (
    <View>
      {!groups.length && <Text style={s.empty}>{text?.sectEmptyText}</Text>}
      {groups.map((g) => (
        <View key={g.menpai} style={{ marginTop: 8 }}>
          <View style={s.secHead}>
            <Text style={s.secTitle}>{g.menpai}</Text>
            <View style={s.secRule} />
          </View>
          <View style={s.cardWrap}>
            {g.list.map((sect) => (
              <Pressable key={sect.slug} style={s.sectCard} onPress={() => setSectSlug(sect.slug)}>
                <CardFill />
                <Text style={s.sectName}>{sect.name}</Text>
                <Text style={s.sectType}>{sect.buildType}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function SectDetail({ sect, text, onBack }: { sect: SectRow; text: SectData; onBack: () => void }) {
  const [stab, setStab] = useState<'bis' | 'affix' | 'rot' | 'rate' | 'tiaolv' | 'grad'>('bis');

  const bisSlots: [string | null | undefined, readonly string[]][] = sect.bis ? [
    [text?.sectBisMainWeaponLabel, sect.bis.mainWeapon],
    [text?.sectBisOffWeaponLabel, sect.bis.offWeapon],
    [text?.sectBisAccessoriesLabel, sect.bis.accessories],
    [text?.sectBisHeadBodyLabel, sect.bis.headBody],
    [text?.sectBisLegsWristsLabel, sect.bis.legsWrists],
  ] : [];

  const rotItems: [string | null | undefined, string | null | undefined][] = sect.rotation ? [
    [text?.sectRotGreydustLabel, sect.rotation.greydust],
    [text?.sectRotOpenerLabel, sect.rotation.opener],
    [text?.sectRotLoopLabel, sect.rotation.loop],
    [text?.sectRotKeyPointsLabel, sect.rotation.keyPoints],
    [text?.sectRotInnerSkillsLabel, sect.rotation.innerSkills],
  ] : [];

  const tabs: ['bis' | 'affix' | 'rot' | 'rate' | 'tiaolv' | 'grad', string | null | undefined][] = [
    ['bis', text?.sectTabBisLabel],
    ['affix', text?.sectTabAffixLabel],
    ['rot', text?.sectTabRotationLabel],
    ['rate', text?.sectTabRatesLabel],
    ['tiaolv', text?.sectTabTiaolvLabel],
    ['grad', text?.sectTabGradLabel],
  ];

  return (
    <View>
      <Pressable onPress={onBack} hitSlop={8}>
        <Text style={s.back}>{text?.sectBackLabel}</Text>
      </Pressable>
      <Text style={s.h2}>{sect.name}</Text>
      <Text style={s.meta}>{sect.buildType} · {sect.weapons}</Text>

      <View style={s.tabRow}>
        {tabs.map(([key, label]) => (
          <Pressable key={key} onPress={() => setStab(key)} style={[s.tabBtn, stab === key && s.tabBtnOn]}>
            <Text style={[s.tabBtnText, stab === key && s.tabBtnTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {stab === 'bis' && (
        <View style={{ gap: 12 }}>
          {!bisSlots.length && <Text style={s.emptySmall}>{text?.sectNoBisText}</Text>}
          {bisSlots.map(([slot, affixes]) => (
            <View key={slot ?? ''} style={s.card}>
              <CardFill />
              <Text style={s.cardTitle}>{slot}</Text>
              <View style={s.chipWrap}>
                {affixes.map((a, i) => (
                  <View key={i} style={s.affixChip}>
                    <Text style={s.affixText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
          <React.Suspense fallback={null}>
            <GearSectRecipes sectName={sect.name} onPicked={() => setStab('grad')} />
          </React.Suspense>
        </View>
      )}

      {stab === 'affix' && (
        <View style={{ gap: 12 }}>
          {!sect.gradBuilds.length && <Text style={s.emptySmall}>{text?.sectAffixEmptyText}</Text>}
          {sect.gradBuilds.map((b) => (
            <View key={b.name + '|' + b.setName} style={s.card}>
              <CardFill />
              <View style={s.affixHead}>
                <Text style={s.affixBuildName}>{b.name}</Text>
                <View style={s.catChip}>
                  <Text style={s.catChipText}>{b.cat}</Text>
                </View>
              </View>
              <Text style={s.affixMeta}>
                <Text style={s.affixMetaLabel}>{text?.sectAffixSetLabel} </Text>{b.setName}
                {b.bowLabel ? <><Text style={s.affixMetaLabel}>{' · '}{text?.sectAffixBowLabel} </Text>{b.bowLabel}</> : null}
                {b.dingyinName ? <><Text style={s.affixMetaLabel}>{' · '}{text?.sectAffixDingyinLabel} </Text>{b.dingyinName}</> : null}
              </Text>
              <Text style={s.affixRecipe}>{b.recipe}</Text>
              <View style={[s.affixRow, s.affixRowHead]}>
                <Text style={[s.affixCellLabel, s.affixHeadText]}>{text?.sectAffixColAffixLabel}</Text>
                <Text style={[s.affixCellNum, s.affixHeadText]}>{text?.sectAffixColCountLabel}</Text>
                <Text style={[s.affixCellNum, s.affixHeadText]}>{text?.sectAffixColMaxLabel}</Text>
                <Text style={[s.affixCellNum, s.affixHeadText]}>{text?.sectAffixColCyLabel}</Text>
              </View>
              {b.targets.map((t) => (
                <View key={t.label} style={s.affixRow}>
                  <Text style={s.affixCellLabel}>
                    <Text style={s.affixName}>{t.label}</Text>
                    {t.flexLabels.length > 0 && <Text style={s.affixFlex}>（{t.flexLabels.join(' / ')}）</Text>}
                  </Text>
                  <Text style={s.affixCellNum}>{t.count}</Text>
                  <Text style={s.affixCellNum}>{t.maxValue != null ? fmtVal(t.maxValue) + t.unit : '—'}</Text>
                  <Text style={s.affixCellNum}>{t.cyValue != null ? fmtVal(t.cyValue) + t.unit : '—'}</Text>
                </View>
              ))}
              {b.note && <Text style={s.affixNote}>{b.note}</Text>}
            </View>
          ))}
          {sect.gradBuilds.length > 0 && <Text style={s.affixSource}>{text?.sectAffixSourceText}</Text>}
        </View>
      )}

      {stab === 'rot' && (
        <View style={{ gap: 12 }}>
          {!rotItems.some(([, c]) => c) && !sect.rotation?.videoUrl && (
            <Text style={s.emptySmall}>{text?.sectNoRotationText}</Text>
          )}
          {rotItems.filter(([, c]) => c).map(([title, content]) => (
            <View key={title ?? ''} style={s.card}>
              <CardFill />
              <Text style={s.cardTitle}>{title}</Text>
              <Text style={s.rotText}>{content}</Text>
            </View>
          ))}
          {sect.rotation?.videoUrl && (
            <View style={s.card}>
              <CardFill />
              <Text style={s.cardTitle}>{text?.sectRotVideoLabel}</Text>
              <Text selectable style={s.videoText}>{sect.rotation.videoUrl}</Text>
            </View>
          )}
        </View>
      )}

      {stab === 'rate' && (
        <View style={s.card}>
          <CardFill />
          {!sect.rateTargets ? (
            <Text style={s.emptySmall}>{text?.sectNoRatesText}</Text>
          ) : (
            <View style={{ gap: 10 }}>
              {sect.rateTargets.accuracy && (
                <View style={s.rateRow}>
                  <Text style={s.rateLabel}>{text?.sectRateAccuracyLabel}</Text>
                  <Text style={s.rateValue}>{sect.rateTargets.accuracy}</Text>
                </View>
              )}
              {sect.rateTargets.crit && (
                <View style={s.rateRow}>
                  <Text style={s.rateLabel}>{text?.sectRateCritLabel}</Text>
                  <Text style={s.rateValue}>{sect.rateTargets.crit}</Text>
                </View>
              )}
              {sect.rateTargets.critDamage && (
                <View style={s.rateRow}>
                  <Text style={s.rateLabel}>{text?.sectRateCritDamageLabel}</Text>
                  <Text style={s.rateValue}>{sect.rateTargets.critDamage}</Text>
                </View>
              )}
              {sect.rateTargets.note && <Text style={s.rateNote}>{sect.rateTargets.note}</Text>}
            </View>
          )}
        </View>
      )}

      {stab === 'tiaolv' && (
        <React.Suspense fallback={null}>
          <TiaolvTab sectSlug={sect.slug} sectName={sect.name} />
        </React.Suspense>
      )}

      {stab === 'grad' && (
        <React.Suspense fallback={null}>
          <GradCalc sectSlug={sect.slug} sectName={sect.name} />
        </React.Suspense>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  empty: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14, textAlign: 'center', padding: 32 },
  emptySmall: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14, textAlign: 'center', padding: 24 },
  // Family section header mirrors Web: 16px bright gold, tracking 4, + gold rule
  secHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 20, marginBottom: 12 },
  secTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 16, letterSpacing: 4 },
  secRule: { flex: 1, height: 1, backgroundColor: 'rgba(201,163,92,.25)' },
  // Sect card mirrors Web: hug-width card, padding 12/20, name in bright gold + build type at 11 plain
  cardWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sectCard: {
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 10,
    backgroundColor: theme.ink2, paddingVertical: 12, paddingHorizontal: 20,
  },
  sectName: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 15 },
  sectType: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11, marginTop: 4 },
  back: { fontFamily: fonts.serif, color: theme.gold, fontSize: 15, marginBottom: 12 },
  h2: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 24, letterSpacing: 2, marginBottom: 4 },
  meta: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, marginBottom: 16 },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tabBtn: { borderWidth: 1, borderColor: theme.gold, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 20 },
  tabBtnOn: { backgroundColor: theme.gold },
  tabBtnText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14 },
  tabBtnTextOn: { color: theme.onGold, fontWeight: '600' },
  card: {
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 10,
    backgroundColor: theme.ink2, padding: 16,
  },
  cardTitle: { fontFamily: fonts.serif, color: theme.gold, fontSize: 15, fontWeight: '600', marginBottom: 10 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  affixChip: {
    backgroundColor: 'rgba(201,163,92,.12)', borderWidth: 1, borderColor: 'rgba(201,163,92,.3)',
    borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10,
  },
  affixText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 12 },
  rotText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14, lineHeight: 25 },
  videoText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 13 },
  rateRow: { flexDirection: 'row', gap: 12 },
  rateLabel: { fontFamily: fonts.serif, color: theme.gold, fontSize: 14, fontWeight: '600', minWidth: 40 },
  rateValue: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14 },
  rateNote: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, lineHeight: 22, marginTop: 4 },
  // Graduation-affix tab mirrors Web: build card + composition table
  affixHead: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  affixBuildName: { fontFamily: fonts.serif, color: theme.gold, fontSize: 15, fontWeight: '600' },
  catChip: { borderWidth: 1, borderColor: 'rgba(201,163,92,.4)', borderRadius: 999, paddingVertical: 2, paddingHorizontal: 9 },
  catChipText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 11 },
  affixMeta: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12.5, lineHeight: 24 },
  affixMetaLabel: { color: theme.goldHi },
  affixRecipe: { fontFamily: fonts.serif, color: theme.paper, fontSize: 12.5, lineHeight: 22, marginTop: 2, marginBottom: 8 },
  affixRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(201,163,92,.1)' },
  affixRowHead: { borderBottomColor: 'rgba(201,163,92,.25)' },
  affixHeadText: { color: theme.muted, fontSize: 11.5 },
  affixCellLabel: { flex: 1, fontFamily: fonts.serif, color: theme.paper, fontSize: 12.5 },
  affixCellNum: { width: 52, textAlign: 'right', fontFamily: fonts.serif, color: theme.paper, fontSize: 12.5 },
  affixName: { color: theme.goldHi },
  affixFlex: { color: theme.muted, fontSize: 11.5 },
  affixNote: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, lineHeight: 20, marginTop: 8 },
  affixSource: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, lineHeight: 20 },
});

function fmtVal(v: number): string {
  return String(Math.round(v * 10) / 10);
}
