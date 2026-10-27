import React from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { fonts, theme } from '../theme';
import { useSession } from '../session';

const HERO = require('../../assets/hero.jpg');

// RN counterpart of Web CSS gradients: an absolute fill layer inside a
// container with borderRadius + overflow:'hidden'.
// Gold gradient of .yy-btn-gold / .yy-chip.selected:
export function GoldFill() {
  return (
    <LinearGradient
      colors={theme.goldGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}

// Card gradient for --card-bg (160deg gold haze to black):
export function CardFill() {
  return (
    <LinearGradient
      colors={theme.cardGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}

// Translucent gold gradient of .yy-tab.active:
export function TabFill() {
  return (
    <LinearGradient
      colors={theme.tabGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}

// Page chrome mirroring Web (spec = Web's actual render at 390px):
// SiteBackdrop ambience / UserBar user cluster / SiteChrome header row /
// GuildHeader guild name + version / Seal stamp.

// Web SiteBackdrop: landscape image fixed as backdrop, heavily darkened,
// melting into ink at the bottom; a second copy anchors the bottom edge
// so short pages end on the mountain silhouette.
export function Backdrop() {
  const { height } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image source={HERO} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(12,11,9,.58)', 'rgba(12,11,9,.80)', 'rgba(12,11,9,.95)', theme.bg]}
        locations={[0, 0.3, 0.58, 0.8]}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: height * 0.34, overflow: 'hidden' }}>
        <Image
          source={HERO}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height, opacity: 0.55 }}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[theme.bg, 'rgba(12,11,9,0)']}
          locations={[0, 0.42]}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </View>
  );
}

// Seal: Web .yy-seal (48 brush text in the picker) / 36px seal inside .yy-card (serif bold).
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
          fontFamily: brush ? fonts.brush : fonts.serif,
          fontWeight: brush ? '400' : '700',
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
        borderWidth: 1, borderColor: 'rgba(201,163,92,.4)', borderRadius: 8,
        paddingVertical: 5, paddingHorizontal: 12,
      }}
    >
      <Text style={{ color: theme.muted, fontSize: 12.5, fontFamily: fonts.serif }}>{label}</Text>
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
          style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: theme.gold }}
        />
      ) : (
        <View
          style={{
            width: 30, height: 30, borderRadius: 15, backgroundColor: '#3a2c17',
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: theme.gold,
          }}
        >
          <Text style={{ color: theme.goldHi, fontSize: 13, fontFamily: fonts.serif }}>{name.slice(0, 1)}</Text>
        </View>
      )}
      <Text numberOfLines={1} style={{ color: theme.paper, fontSize: 14, fontFamily: fonts.serif, maxWidth: 110, flexShrink: 1 }}>
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
        borderWidth: 1, borderColor: 'rgba(201,163,92,.25)',
      }}
    >
      <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={{ backgroundColor: 'rgba(12,11,9,.5)', paddingVertical: 5, paddingLeft: 12, paddingRight: 10 }}>
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
        <Text numberOfLines={1} style={{ color: theme.muted, fontSize: 13, letterSpacing: 1, fontFamily: fonts.serif }}>
          {backLabel ?? `← ${text.siteTitle ?? '百业集结'}`}
        </Text>
      </Pressable>
      <UserBar displayName={displayName} />
    </View>
  );
}

// Web guild header: guild name (calligraphy 42, gold) + gameVersion row.
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
            borderWidth: 1, borderColor: 'rgba(201,163,92,.5)', backgroundColor: 'rgba(201,163,92,.08)',
          }}
        />
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: fonts.brush, fontSize: 42, color: theme.goldHi, letterSpacing: 3, marginTop: 12, marginBottom: 4 }}>
          {name}
        </Text>
        {version ? (
          <Text style={{ color: theme.muted, fontSize: 13, letterSpacing: 1, fontFamily: fonts.serif }}>{version}</Text>
        ) : null}
      </View>
    </View>
  );
}
