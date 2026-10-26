import React from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { fonts, theme } from '../theme';
import { useSession } from '../session';

const HERO = require('../../assets/hero.jpg');

// Web 的 CSS 渐变在 RN 侧的对应物: 作为绝对填充层铺在带
// borderRadius + overflow:'hidden' 的容器里。
// .yy-btn-gold / .yy-chip.selected 的金渐变:
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

// --card-bg 的卡片渐变 (160deg 金雾 → 黑):
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

// .yy-tab.active 的半透金渐变:
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

// ============================================================
// 与 Web 同构的页面 chrome (规格 = Web 在 390px 下的实际渲染):
// SiteBackdrop 氛围底 / UserBar 用户簇 / SiteChrome 页眉行 /
// GuildHeader 百业名+版本 / Seal 印章。
// ============================================================

// Web SiteBackdrop: 山水图固定铺底, 重压暗向下融进墨色;
// 底部再锚一层同图 (底缘山影), 短页收尾落在山上。
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

// 印章: Web .yy-seal (选择器 48 刷字) / .yy-card 内 36 方印 (衬线粗字)。
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

// Web UserBar: 头像 30 圆金边 (或首字圆) + 名 + 个人资料描边钮 + 退出登录描边钮。
// floating=true 时是选择器 hero 右上角的毛玻璃 pill 形态。
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

// Web 百业页眉行: 左「← {站点名}」回百业集结, 右 UserBar。
export function SiteChrome({ displayName }: { displayName?: string | null }) {
  const { text } = useSession();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <Pressable onPress={() => router.navigate('/')} hitSlop={8} style={{ flexShrink: 1 }}>
        <Text numberOfLines={1} style={{ color: theme.muted, fontSize: 13, letterSpacing: 1, fontFamily: fonts.serif }}>
          {`← ${text.siteTitle ?? '百业集结'}`}
        </Text>
      </Pressable>
      <UserBar displayName={displayName} />
    </View>
  );
}

// Web 百业头部: 百业名 (书法 42 金) + gameVersion 行。有百业自定义
// 头像 (avatarUrl, 后端字段经选择页路由参数带入) 时在名左侧出圆图。
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
