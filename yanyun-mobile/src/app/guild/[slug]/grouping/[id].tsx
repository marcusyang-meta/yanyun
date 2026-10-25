import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import GroupingDetailScreen from '../../../../screens/GroupingDetailScreen';

export default function GroupingDetail() {
  const p = useLocalSearchParams<{ slug: string; id: string; readOnly?: string; nick?: string; guildName?: string; version?: string }>();
  return (
    <GroupingDetailScreen
      slug={p.slug}
      id={p.id}
      readOnly={p.readOnly === '1'}
      nick={p.nick || ''}
      guildName={p.guildName || undefined}
      gameVersion={p.version || undefined}
    />
  );
}
