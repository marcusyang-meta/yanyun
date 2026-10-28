import React, { Suspense, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery } from 'react-relay';
import { fonts, theme } from '../theme';
import { CardFill, Seal } from '../components/ui';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import { BossPageQuery, DexPageQuery } from '../documents';
import type { documentsDexPageQuery } from '../__generated__/documentsDexPageQuery.graphql';
import type { documentsBossPageQuery } from '../__generated__/documentsBossPageQuery.graphql';

// Dex + boss guides: mirrors Web BossDex -- the dex groups by game
// category (server categories); a dungeon row shows seal + name + Lv/
// size chips + content badges + boss count. Tapping a dungeon: no boss
// -> hint copy; one boss -> straight to the guide; multiple -> boss list.
// Boss page: mechanics/talents tabs + shout card (copyable); all copy and
// body text are server-supplied, and guide body text is served verbatim
// (original Chinese, never translated or rewritten -- same source as Web).
// The Web toast is a bottom floating pill here (copy also server fields).

// Same SEAL_MAP as Web BossDex (dungeon name -> two seal characters); missing names fall back to the first two characters.
const SEAL_MAP: Record<string, string> = {
  '玉魄染青苍': '玉魄', '定极分更': '定极', '点雪断恩仇': '点雪', '俣俣神浒': '俣俣',
};

function fill(template: string, params: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(params)) out = out.split('{' + k + '}').join(String(v));
  return out;
}

type DexData = documentsDexPageQuery['response']['dexPage'];
type DungeonRow = DexData['categories'][number]['dungeons'][number];
type BossRow = DungeonRow['bosses'][number];
type Notify = (msg?: string | null) => void;

export default function DexView() {
  const insets = useSafeAreaInsets();
  const [dungeonId, setDungeonId] = useState<string | null>(null);
  const [bossId, setBossId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify: Notify = (msg) => {
    if (!msg) return;
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 + insets.bottom }}
      >
        {bossId ? (
          <AsyncBoundary onRetry={() => setBossId(null)}>
            <Suspense fallback={<LoadingView />}>
              <BossDetail bossId={bossId} onBack={() => setBossId(null)} notify={notify} />
            </Suspense>
          </AsyncBoundary>
        ) : (
          <DexList
            dungeonId={dungeonId}
            setDungeonId={setDungeonId}
            onBoss={setBossId}
            notify={notify}
          />
        )}
      </ScrollView>
      {toastMsg && (
        <View style={[s.toast, { bottom: 24 + insets.bottom }]}>
          <Text style={s.toastText}>{toastMsg}</Text>
        </View>
      )}
    </View>
  );
}

function DexList({ dungeonId, setDungeonId, onBoss, notify }: {
  dungeonId: string | null;
  setDungeonId: (id: string | null) => void;
  onBoss: (id: string) => void;
  notify: Notify;
}) {
  const data = useLazyLoadQuery<documentsDexPageQuery>(DexPageQuery, {}, { fetchPolicy: 'store-or-network' });
  const dex = data.dexPage;
  const categories = dex?.categories ?? [];
  const allDungeons: DungeonRow[] = categories.flatMap((c) => c.dungeons);

  const openDungeon = (d: DungeonRow) => {
    if (d.bosses.length === 0) { notify(dex?.dexNoBossDataText); return; }
    if (d.bosses.length === 1) { onBoss(d.bosses[0].id); return; }
    setDungeonId(d.id);
  };

  if (dungeonId) {
    const d = allDungeons.find((x) => x.id === dungeonId);
    if (d) {
      return (
        <View>
          <Pressable onPress={() => setDungeonId(null)} hitSlop={8}>
            <Text style={s.back}>{dex?.dexBackLabel}</Text>
          </Pressable>
          <Text style={s.h2}>{d.name}</Text>
          <Text style={s.meta}>
            {d.level ? `Lv.${d.level} · ` : ''}{d.category ?? ''} · {fill(dex?.dexBossesLineTemplate ?? '', { count: d.bosses.length })}
          </Text>
          <View style={{ gap: 10 }}>
            {d.bosses.map((b) => (
              <Pressable key={b.id} style={s.row} onPress={() => onBoss(b.id)}>
                <CardFill />
                <Seal char={dex?.dexSealBossText ?? ''} size={32} brush={false} />
                <Text style={s.rowName}>{b.name}</Text>
                <Text style={s.chev}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>
      );
    }
  }

  const renderRow = (d: DungeonRow, inCurrent: boolean) => {
    const bossCount = d.bosses.length;
    const sizeTag = d.playerCount === 10 ? dex?.dexSize10Label : d.playerCount === 5 ? dex?.dexSize5Label : fill(dex?.dexSizeNTemplate ?? '', { n: d.playerCount });
    const levelTag = d.level ? `Lv.${d.level} · ` : '';
    // Content badges follow Web's derivation: a category is listed only if every boss in the dungeon has it; all three present = complete
    const partDefs: [string | null | undefined, (b: BossRow) => number][] = [
      [dex?.dexPartMechanicsLabel, (b) => b.mechanics.length],
      [dex?.dexPartShoutsLabel, (b) => b.shouts.length],
      [dex?.dexPartTalentsLabel, (b) => b.talents.length],
    ];
    const presentParts = partDefs
      .filter(([, count]) => d.bosses.length > 0 && d.bosses.every((b) => count(b) > 0))
      .map(([label]) => label);
    const dexLabel = bossCount === 0
      ? dex?.dexLabelNoBossesText
      : presentParts.length === 3
        ? fill(dex?.dexLabelAllTemplate ?? '', { count: bossCount, parts: presentParts.join(' / ') })
        : presentParts.length > 0
          ? fill(dex?.dexLabelPartsTemplate ?? '', { count: bossCount, parts: presentParts.join(' / ') })
          : fill(dex?.dexLabelPendingTemplate ?? '', { count: bossCount });
    return (
      <Pressable key={d.id} style={s.row} onPress={() => openDungeon(d)}>
        <CardFill />
        <Seal char={SEAL_MAP[d.name] ?? d.name.slice(0, 2)} size={44} brush={false} />
        <View style={{ flex: 1 }}>
          <Text style={s.rowNameLeft}>{d.name}</Text>
          <View style={[s.tag, { borderColor: inCurrent ? theme.gold : theme.muted }]}>
            <Text style={[s.tagText, { color: inCurrent ? theme.goldHi : theme.muted }]}>{levelTag}{sizeTag}</Text>
          </View>
          <Text style={s.dexLabel}>{dexLabel}</Text>
        </View>
        <Text style={s.bossCount}>
          {bossCount}
          <Text style={s.bossUnit}> {dex?.dexBossUnit}</Text>
        </Text>
        <Text style={s.chev}>›</Text>
      </Pressable>
    );
  };

  return (
    <View>
      {categories.map((cat) => (
        <View key={cat.category} style={{ marginBottom: 8 }}>
          <View style={s.secHead}>
            <Text style={s.secTitle}>
              {cat.isCurrent ? fill(dex?.dexCurrentGuidesTemplate ?? '', { category: cat.category }) : cat.category}
            </Text>
            <Text style={s.secSub}>
              {fill((cat.isCurrent ? dex?.dexCatSubCurrentTemplate : dex?.dexCatSubTemplate) ?? '', {
                season: cat.season, seasonName: cat.seasonName, version: dex?.currentVersion ?? '',
              })}
            </Text>
            <View style={s.secRule} />
          </View>
          <View style={{ gap: 10 }}>
            {cat.dungeons.map((d) => renderRow(d, cat.isCurrent))}
          </View>
        </View>
      ))}
      {!categories.length && <Text style={s.empty}>{dex?.dexEmptyText}</Text>}
    </View>
  );
}

/* Boss guide detail (mirrors Web BossDetail) */

function BossDetail({ bossId, onBack, notify }: { bossId: string; onBack: () => void; notify: Notify }) {
  const [btab, setBtab] = useState<'mech' | 'talent'>('mech');
  const data = useLazyLoadQuery<documentsBossPageQuery>(BossPageQuery, { bossId }, { fetchPolicy: 'store-or-network' });
  const page = data.bossPage;
  const b = page?.boss;

  if (!b) return <Text style={s.empty}>{page?.bossNotFoundText}</Text>;

  const copyShout = (text: string) => {
    const clip = (globalThis as { navigator?: { clipboard?: { writeText: (t: string) => Promise<void> } } }).navigator?.clipboard;
    if (clip?.writeText) {
      clip.writeText(text)
        .then(() => notify(page?.bossShoutCopiedText))
        .catch(() => notify(page?.bossCopyFailedText));
    } else {
      // Native has no clipboard API (expo-clipboard not imported): use the
      // server's manual-copy copy instead; the shout text itself is selectable
      // for long-press copying (same fallback meaning as Web without clipboard).
      notify(page?.bossCopyManualText);
    }
  };

  const t1 = b.talents.filter((t) => t.code.startsWith('1-'));
  const t2 = b.talents.filter((t) => t.code.startsWith('2-'));

  const talentCard = (t: (typeof b.talents)[number]) => (
    <View key={t.code} style={s.card}>
      <CardFill />
      <Text style={s.cardTitle}>
        {fill(page?.bossTalentTitleTemplate ?? '', { code: t.code })}{t.verified ? '' : page?.bossTalentPendingSuffix}
      </Text>
      <Text style={s.talentDesc}>{t.description}</Text>
    </View>
  );

  return (
    <View>
      <Pressable onPress={onBack} hitSlop={8}>
        <Text style={s.back}>{page?.bossBackLabel}</Text>
      </Pressable>
      <Text style={s.h2}>{b.name}</Text>
      <Text style={s.meta}>
        {b.dungeon.name}{b.dungeon.level ? ` · Lv.${b.dungeon.level}` : ''}{b.dungeon.category ? ` · ${b.dungeon.category}` : ''}
      </Text>

      <View style={s.tabRow}>
        {(['mech', 'talent'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setBtab(t)}
            style={[s.tabBtn, btab === t && s.tabBtnOn]}
          >
            <Text style={[s.tabBtnText, btab === t && s.tabBtnTextOn]}>
              {t === 'mech' ? page?.bossTabMechanicsLabel : page?.bossTabTalentsLabel}
            </Text>
          </Pressable>
        ))}
      </View>

      {btab === 'mech' && (
        <View style={{ gap: 12 }}>
          {!b.mechanics.length && <Text style={s.emptySmall}>{page?.bossNoMechanicsText}</Text>}
          {b.mechanics.map((m, i) => (
            <View key={i} style={s.card}>
              <CardFill />
              <Text style={s.cardTitle}>{m.phase ? `${m.phase} · ` : ''}{m.title}</Text>
              <Text style={s.mechDesc}>{m.description}</Text>
            </View>
          ))}
          {b.shouts.length > 0 && (
            <View style={s.card}>
              <CardFill />
              <Text style={s.cardTitle}>{page?.bossShoutsTitle}</Text>
              {b.shouts.map((sh, i) => (
                <View key={i} style={s.shoutRow}>
                  <Text selectable style={s.shoutText}>{sh.text}</Text>
                  {sh.copyable && (
                    <Pressable style={s.copyBtn} onPress={() => copyShout(sh.text)}>
                      <Text style={s.copyBtnText}>{page?.bossCopyLabel}</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {btab === 'talent' && (
        <View style={s.talentGrid}>
          <View style={s.talentCol}>{t1.map(talentCard)}</View>
          <View style={s.talentCol}>{t2.map(talentCard)}</View>
          {!t1.length && !t2.length && <Text style={[s.emptySmall, { flex: 1 }]}>{page?.bossNoTalentsText}</Text>}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  back: { fontFamily: fonts.serif, color: theme.gold, fontSize: 15, marginBottom: 12 },
  h2: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 24, letterSpacing: 2, marginBottom: 4 },
  meta: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, marginBottom: 16 },
  // Section header mirrors Web SecHead: 16px bright gold + 11px sub + 1px gold rule
  secHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 20, marginBottom: 12 },
  secTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 16, letterSpacing: 2 },
  secSub: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11 },
  secRule: { flex: 1, height: 1, backgroundColor: 'rgba(201,163,92,.25)' },
  // Dungeon/boss row mirrors Web rowBtn: row gap 12, padding 14/16, radius 10, card gradient
  row: {
    position: 'relative', overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 10,
    backgroundColor: theme.ink2, paddingVertical: 14, paddingHorizontal: 16,
  },
  rowName: { flex: 1, fontFamily: fonts.serif, color: theme.paper, fontSize: 15 },
  rowNameLeft: { fontFamily: fonts.serif, color: theme.paper, fontSize: 15 },
  tag: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 4, paddingVertical: 1, paddingHorizontal: 6, marginTop: 4 },
  tagText: { fontFamily: fonts.serif, fontSize: 11 },
  dexLabel: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginTop: 4 },
  bossCount: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 14 },
  bossUnit: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11 },
  chev: { fontFamily: fonts.serif, color: theme.gold, fontSize: 18 },
  empty: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14, textAlign: 'center', padding: 32 },
  emptySmall: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14, textAlign: 'center', padding: 24 },
  // Tabs mirror Web BossDetail: gold-outline buttons; active = solid gold fill + ink text 600
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: { borderWidth: 1, borderColor: theme.gold, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24 },
  tabBtnOn: { backgroundColor: theme.gold },
  tabBtnText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14 },
  tabBtnTextOn: { color: theme.onGold, fontWeight: '600' },
  // Content card mirrors Web card: padding 16, radius 10, border + card gradient
  card: {
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 10,
    backgroundColor: theme.ink2, padding: 16,
  },
  cardTitle: { fontFamily: fonts.serif, color: theme.gold, fontSize: 15, fontWeight: '600', marginBottom: 8 },
  mechDesc: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14, lineHeight: 24 },
  talentDesc: { fontFamily: fonts.serif, color: theme.paper, fontSize: 13, lineHeight: 22 },
  shoutRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8,
    backgroundColor: 'rgba(201,163,92,.08)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12,
  },
  shoutText: { flex: 1, fontFamily: fonts.serif, color: theme.paper, fontSize: 13 },
  copyBtn: { backgroundColor: theme.gold, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 12 },
  copyBtnText: { fontFamily: fonts.serif, color: theme.onGold, fontSize: 12 },
  // Talent grid stays two columns (Web grid 1fr 1fr), even on narrow screens
  talentGrid: { flexDirection: 'row', gap: 12 },
  talentCol: { flex: 1, gap: 12 },
  // Toast overlay (the app counterpart of Web .yy-toast)
  toast: {
    position: 'absolute', alignSelf: 'center', maxWidth: '86%',
    backgroundColor: 'rgba(20,18,14,.96)', borderWidth: 1, borderColor: 'rgba(201,163,92,.45)',
    borderRadius: 999, paddingVertical: 9, paddingHorizontal: 18,
  },
  toastText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13, textAlign: 'center' },
});
