import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, theme } from '../theme';
import { Backdrop, CardFill, Seal, UserBar } from '../components/ui';
import { useSession } from '../session';
import type { GuildItem } from '../api';

// 百业选择页与 Web GuildPicker 同构: hero 区 (品牌标题/副标题居中,
// UserBar 毛玻璃 pill 浮在右上角) → 分区头 (中文书法 + EN 小标) →
// 印章卡 (燕印 + 百业名 + 只读 badge + slogan)。文案全部走 viewer 字段。
function GuildCard({ g }: { g: GuildItem }) {
  const router = useRouter();
  const { text } = useSession();
  return (
    <Pressable
      style={s.card}
      onPress={() => router.push({
        pathname: '/guild/[slug]',
        params: {
          slug: g.slug,
          name: g.name || g.slug,
          readOnly: g.readOnly ? '1' : '0',
          nick: g.viewerNick || '',
          version: g.gameVersion || '',
          avatar: g.avatarUrl || '',
        },
      })}
    >
      <CardFill />
      {g.avatarUrl ? (
        <Image source={{ uri: g.avatarUrl }} style={s.avatar} />
      ) : (
        <Seal char="燕" size={48} />
      )}
      <View style={s.cardMain}>
        <View style={s.nameRow}>
          <Text style={s.gname}>{g.name || g.slug}</Text>
          {g.readOnly && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{text.pickerReadOnlyBadge ?? '只读'}</Text>
            </View>
          )}
        </View>
        {!!g.slogan && <Text style={s.slogan} numberOfLines={1}>{g.slogan}</Text>}
      </View>
      <Text style={s.arrow}>›</Text>
    </Pressable>
  );
}

function SectionHead({ zh, en, first = false }: { zh?: string | null; en?: string | null; first?: boolean }) {
  return (
    <View style={[s.sectionHead, first ? s.sectionFirst : s.sectionNext]}>
      <Text style={s.sectionZh}>{zh ?? ''}</Text>
      {!!en && <Text style={s.sectionEn}>{en}</Text>}
    </View>
  );
}

export default function GuildsScreen() {
  const { guilds, publicGuilds, text } = useSession();
  const insets = useSafeAreaInsets();
  return (
    <View style={s.root}>
      <Backdrop />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      >
        {/* .yy-hero: 山水带 + 品牌标题/副标题居中, 用户 pill 浮动右上 */}
        <View style={[s.hero, { paddingTop: 34 + insets.top }]}>
          <Image
            source={require('../../assets/hero.jpg')}
            style={[StyleSheet.absoluteFill, s.heroImg]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(12,11,9,.12)', 'rgba(12,11,9,.02)', 'rgba(12,11,9,.5)']}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={[s.pill, { top: 12 + insets.top }]}>
            <UserBar floating />
          </View>
          <Text style={s.heroTitle}>{text.siteTitle ?? '百业集结'}</Text>
          <Text style={s.heroSub}>{text.siteSubtitle ?? '燕云十六声 · 国际服百业车队与攻略集散地 —— 择一业而入，共赴双十。'}</Text>
        </View>

        <View style={s.body}>
          <SectionHead zh={text.pickerMyGuildsLabel ?? '我的百业'} en={text.pickerMyGuildsEnLabel} first />
          {guilds.length === 0
            ? (
              <View style={s.emptyCard}>
                <CardFill />
                <Text style={s.emptyTitle}>{text.pickerEmptyTitle ?? '还没有加入任何百业'}</Text>
                <Text style={s.emptyBody}>{text.pickerEmptyBody ?? '你所在的 Discord 服务器绑定百业后会出现在这里。'}</Text>
              </View>
            )
            : (
              <View style={s.cards}>
                {guilds.map((g) => <GuildCard key={g.slug} g={g} />)}
              </View>
            )}

          {publicGuilds.length > 0 && (
            <>
              <SectionHead zh={text.pickerPublicGuildsLabel ?? '公开百业'} en={text.pickerPublicGuildsEnLabel} />
              <View style={s.cards}>
                {publicGuilds.map((g) => <GuildCard key={g.slug} g={g} />)}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.45)', backgroundColor: 'rgba(201,163,92,.08)',
  },
  hero: {
    position: 'relative', overflow: 'hidden',
    alignItems: 'center', paddingHorizontal: 20, paddingBottom: 48,
  },
  heroImg: { top: '-30%' }, // 近似 Web object-position: center 32%
  pill: { position: 'absolute', right: 16, zIndex: 2 },
  heroTitle: {
    fontFamily: fonts.brush, color: theme.goldHi, fontSize: 56,
    letterSpacing: 10, textAlign: 'center',
    textShadowColor: 'rgba(201,163,92,.25)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 32,
  },
  heroSub: {
    fontFamily: fonts.serif, color: theme.paper, opacity: 0.85, fontSize: 15,
    letterSpacing: 2, marginTop: 18, textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,.85)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 14,
  },
  body: { paddingHorizontal: 20 },
  // .yy-section-head: 中文书法 28 + EN 11px 字距 .3em, baseline 对齐
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  sectionFirst: { marginTop: 40 },
  sectionNext: { marginTop: 34 },
  sectionZh: { fontFamily: fonts.brush, color: theme.goldHi, fontSize: 28, letterSpacing: 3 },
  // .yy-section-head .en 带 text-transform: uppercase, 服务端原文是 Title Case
  sectionEn: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11, letterSpacing: 3, marginLeft: 12, textTransform: 'uppercase' },
  cards: { gap: 14 },
  card: {
    position: 'relative', overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: theme.ink2,
    borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12,
    paddingVertical: 18, paddingHorizontal: 20,
  },
  cardMain: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  gname: { fontFamily: fonts.serif, fontWeight: '600', color: theme.goldHi, fontSize: 18 },
  badge: {
    borderWidth: 1, borderColor: 'rgba(201,163,92,.35)', borderRadius: 20,
    paddingVertical: 2, paddingHorizontal: 9, marginLeft: 10,
  },
  badgeText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11 },
  slogan: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, marginTop: 4 },
  arrow: { color: theme.gold, fontSize: 22 },
  emptyCard: {
    position: 'relative', overflow: 'hidden', alignItems: 'center',
    backgroundColor: theme.ink2, borderWidth: 1, borderColor: theme.cardBorder,
    borderRadius: 12, paddingVertical: 36, paddingHorizontal: 24,
  },
  emptyTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 18, textAlign: 'center' },
  emptyBody: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14, lineHeight: 27, textAlign: 'center', marginTop: 10 },
});
