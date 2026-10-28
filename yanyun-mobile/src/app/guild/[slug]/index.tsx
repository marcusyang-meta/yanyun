import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import GroupingListScreen from '../../../screens/GroupingListScreen';

export default function GuildGroupings() {
  const p = useLocalSearchParams<{ slug: string; name?: string; nick?: string; version?: string; avatar?: string }>();
  return (
    <GroupingListScreen
      slug={p.slug}
      name={p.name || p.slug}
      nick={p.nick || ''}
      gameVersion={p.version || undefined}
      avatarUrl={p.avatar || undefined}
    />
  );
}
