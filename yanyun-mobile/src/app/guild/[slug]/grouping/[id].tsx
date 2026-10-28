import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import GroupingDetailScreen from '../../../../screens/GroupingDetailScreen';

export default function GroupingDetail() {
  const p = useLocalSearchParams<{ slug: string; id: string; nick?: string; guildName?: string; version?: string }>();
  return (
    <GroupingDetailScreen
      slug={p.slug}
      id={p.id}
      nick={p.nick || ''}
      guildName={p.guildName || undefined}
      gameVersion={p.version || undefined}
    />
  );
}
