import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import GroupingListScreen from '../../../screens/GroupingListScreen';

export default function GuildGroupings() {
  const p = useLocalSearchParams<{ slug: string; name?: string; readOnly?: string; nick?: string; version?: string }>();
  return (
    <GroupingListScreen
      slug={p.slug}
      name={p.name || p.slug}
      readOnly={p.readOnly === '1'}
      nick={p.nick || ''}
      gameVersion={p.version || undefined}
    />
  );
}
