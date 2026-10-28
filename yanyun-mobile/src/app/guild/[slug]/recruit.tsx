import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import GuildRecruitScreen from '../../../screens/GuildRecruitScreen';

export default function GuildRecruit() {
  const p = useLocalSearchParams<{ slug: string }>();
  return <GuildRecruitScreen slug={p.slug} />;
}
