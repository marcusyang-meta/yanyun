import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import GuildAdminScreen from '../../../screens/GuildAdminScreen';

export default function GuildAdmin() {
  const p = useLocalSearchParams<{ slug: string }>();
  return <GuildAdminScreen slug={p.slug} />;
}
