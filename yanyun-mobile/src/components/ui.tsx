import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { fonts, theme } from '../theme';
import { useSession } from '../session';

// Flat fill layers inside containers with borderRadius + overflow:'hidden'
// (RN counterparts of Web's flat surfaces -- no gradients anywhere).
// Solid accent of .yy-btn-primary / .yy-chip.selected:
export function GoldFill() {
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.accent }]} pointerEvents="none" />;
}

// Flat card surface for --card-bg:
export function CardFill() {
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.cardBg }]} pointerEvents="none" />;
}

// Translucent accent tint of .yy-tab.active:
export function TabFill() {
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.accentTint }]} pointerEvents="none" />;
}

// Page chrome mirroring Web (spec = Web's actual render at 390px):
// flat page backdrop / UserBar user cluster / SiteChrome header row /
// GuildHeader guild name + version / Seal stamp.

// Web has no backdrop layer anymore: pages sit directly on the flat
// neutral background. Kept as a component so call sites are unchanged.
export function Backdrop() {
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg }]} />;
}

// Seal: Web .yy-seal (bold sans char in the picker) / 36px seal inside .yy-card.
export function Seal({ char, size, brush = true }: { char: string; size: number; brush?: boolean }) {
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size >= 44 ? 8 : 6,
        backgroundColor: theme.seal, alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
      }}
    >
      <Text
        style={{
          color: theme.paper, fontSize: size * 0.5,
          fontFamily: brush ? fonts.display : fonts.body,
          fontWeight: '700',
          lineHeight: size * 0.58,
        }}
      >
        {char}
      </Text>
    </View>
  );
}

function GhostBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1, borderColor: theme.chipBorder, borderRadius: 8,
        paddingVertical: 5, paddingHorizontal: 12,
      }}
    >
      <Text style={{ color: theme.muted, fontSize: 12.5, fontFamily: fonts.body }}>{label}</Text>
    </Pressable>
  );
}

// Web UserBar: 30px round gold-bordered avatar (or initial circle) + name + outlined profile and sign-out buttons.
// With floating=true it is the frosted-glass pill at the picker hero's top-right.
export function UserBar({ displayName, floating = false }: { displayName?: string | null; floating?: boolean }) {
  const { user, text, signOut } = useSession();
  if (!user) return null;
  const name = displayName ?? user.name;
  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
      {user.avatar ? (
        <Image
          source={{ uri: user.avatar }}
          style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: theme.accent }}
        />
      ) : (
        <View
          style={{
            width: 30, height: 30, borderRadius: 15, backgroundColor: '#26292f',
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: theme.accent,
          }}
        >
          <Text style={{ color: theme.accentHi, fontSize: 13, fontFamily: fonts.body }}>{name.slice(0, 1)}</Text>
        </View>
      )}
      <Text numberOfLines={1} style={{ color: theme.paper, fontSize: 14, fontFamily: fonts.body, maxWidth: 110, flexShrink: 1 }}>
        {name}
      </Text>
      <GhostBtn label={text.userBarSettingsLabel ?? '个人资料'} onPress={() => router.push('/profile')} />
      <GhostBtn
        label={text.userBarLogoutLabel ?? '退出登录'}
        onPress={() => { void signOut().then(() => router.replace('/')); }}
      />
    </View>
  );
  if (!floating) return inner;
  return (
    <View
      style={{
        borderRadius: 999, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(67,160,134,.25)',
      }}
    >
      <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={{ backgroundColor: 'rgba(21,23,27,.5)', paddingVertical: 5, paddingLeft: 12, paddingRight: 10 }}>
        {inner}
      </View>
    </View>
  );
}

// Web guild header row: left back link to the guild picker, right UserBar.
// The back label is the guild's server-composed chrome copy (pageBackLabel:
// platform-named only while the guild shows platform branding); without one
// it falls back to the platform label, as before.
export function SiteChrome({ displayName, backLabel }: { displayName?: string | null; backLabel?: string | null }) {
  const { text } = useSession();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <Pressable onPress={() => router.navigate('/')} hitSlop={8} style={{ flexShrink: 1 }}>
        <Text numberOfLines={1} style={{ color: theme.muted, fontSize: 13, letterSpacing: 1, fontFamily: fonts.body }}>
          {backLabel ?? `← ${text.siteTitle ?? '百业集结'}`}
        </Text>
      </Pressable>
      <UserBar displayName={displayName} />
    </View>
  );
}

// Web guild header: guild name (sans bold, paper) + gameVersion row.
// When the guild has a custom avatar (avatarUrl, passed in as a route
// param from the picker), a round image sits left of the name.
export function GuildHeader({ name, version, avatarUrl }: { name: string; version?: string | null; avatarUrl?: string | null }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{
            width: 56, height: 56, borderRadius: 28, marginTop: 12,
            borderWidth: 1, borderColor: theme.border, backgroundColor: 'rgba(255,255,255,.04)',
          }}
        />
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: fonts.display, fontWeight: '700', fontSize: 30, color: theme.paper, letterSpacing: 1, marginTop: 12, marginBottom: 4 }}>
          {name}
        </Text>
        {version ? (
          <Text style={{ color: theme.muted, fontSize: 13, letterSpacing: 1, fontFamily: fonts.body }}>{version}</Text>
        ) : null}
      </View>
    </View>
  );
}
