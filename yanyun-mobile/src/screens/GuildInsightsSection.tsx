import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLazyLoadQuery } from 'react-relay';
import { fonts, theme } from '../theme';
import { GuildInsightsBoardQuery } from '../documents';
import type { documentsGuildInsightsBoardQuery } from '../__generated__/documentsGuildInsightsBoardQuery.graphql';

// Guild home insights section (mobile member surface, Premium T1):
// the P15 race season board plus the viewer's own P9 gear readiness
// status. Mounted only when the session payload's board variant is
// the full RaceSeasonBoard — this component never renders a locked
// state, because a locked guild's home has no insights tab at all.
// All copy arrives on the guild shell; numbers are data.
export default function GuildInsightsSection({ slug }: { slug: string }) {
  const data = useLazyLoadQuery<documentsGuildInsightsBoardQuery>(
    GuildInsightsBoardQuery,
    { slug },
    { fetchPolicy: 'store-or-network' },
  );
  const g: any = (data as any)?.viewer?.guild;
  const board = g?.raceSeasonBoard?.__typename === 'RaceSeasonBoard' ? g.raceSeasonBoard : null;
  const selfEntries = g?.gearSelfStatus?.__typename === 'GuildGearSelfStatus'
    ? (g.gearSelfStatus.entries ?? [])
    : [];
  if (!board) return null;
  const seasons = board.seasons ?? [];
  return (
    <View style={s.wrap}>
      <Text style={s.title}>{g.homeInsightsRaceTitle}</Text>
      {seasons.length === 0 ? (
        <Text style={s.muted}>{g.homeInsightsRaceEmptyText}</Text>
      ) : seasons.map((season: any) => (
        <View key={season.season || 'none'}>
          <Text style={s.seasonLabel}>{season.seasonLabel}</Text>
          {(season.entries ?? []).map((e: any, i: number) => (
            <View key={e.teamName} style={[s.row, i > 0 && s.rowDiv]}>
              <Text style={s.rank}>{i + 1}</Text>
              <Text style={[s.name, { flex: 1 }]} numberOfLines={1}>{e.teamName}</Text>
              <Text style={s.muted}>{g.homeInsightsRaceRunsLabel} {e.runCount}</Text>
              <Text style={s.muted}>{g.homeInsightsRaceWinsLabel} {e.winCount}</Text>
              <Text style={s.best}>{e.bestTimeText}</Text>
            </View>
          ))}
        </View>
      ))}
      {selfEntries.length > 0 && (
        <>
          <Text style={s.title}>{g.homeInsightsSelfGearTitle}</Text>
          {selfEntries.map((e: any, i: number) => (
            <View key={e.standardId} style={[s.row, i > 0 && s.rowDiv]}>
              <Text style={[s.name, { flex: 1 }]} numberOfLines={1}>{e.label}</Text>
              <Text style={[s.muted, { color: e.met ? '#9dc08b' : '#e08a7a' }]}>{e.statusText}</Text>
              <Text style={s.muted}>{g.homeInsightsGearScoreLabel} {e.myScore ?? '—'}</Text>
              <Text style={s.muted}>{g.homeInsightsGearMinScoreLabel} {e.minScore}</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingBottom: 48 },
  title: { fontFamily: fonts.brush, color: theme.gold, fontSize: 16, letterSpacing: 2, marginTop: 20, marginBottom: 10 },
  seasonLabel: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 12.5, marginTop: 6, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  rowDiv: { borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.10)' },
  rank: { width: 22, fontFamily: fonts.serif, color: theme.muted, fontSize: 13 },
  name: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14 },
  muted: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12.5 },
  best: { width: 64, textAlign: 'right', fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13 },
});
