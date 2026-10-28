import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, theme } from '../theme';
import { Backdrop, CardFill, GoldFill, Seal, UserBar } from '../components/ui';
import { useSession } from '../session';
import type { GuildItem } from '../api';
import HomeRecruitSection from './HomeRecruitSection';

// Guild picker mirrors Web GuildPicker: hero (centered brand title/
// subtitle, avatar circle floating top-right) -> section head
// (Chinese calligraphy + EN small label) -> seal cards (seal + guild
// name + slogan). All copy comes from viewer fields.
function GuildCard({ g }: { g: GuildItem }) {
  const router = useRouter();
  return (
    <Pressable
      style={s.card}
      onPress={() => router.push({
        pathname: '/guild/[slug]',
        params: {
          slug: g.slug,
          name: g.name || g.slug,
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
  const { guilds, homeRecruit, text } = useSession();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={s.root}>
      <Backdrop />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      >
        {/* .yy-hero: landscape band + centered brand title/subtitle, avatar circle floating top-right */}
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
          <View style={[s.avatarSlot, { top: 12 + insets.top }]}>
            <UserBar />
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
                {/* Same spot as the Web picker: gold button inside the empty-state card -> create guild */}
                <Pressable style={s.createBtn} onPress={() => router.push('/create')}>
                  <GoldFill />
                  <Text style={s.createBtnText}>{text.pickerCreateGuildLabel ?? '创建百业'}</Text>
                </Pressable>
              </View>
            )
            : (
              <>
                <View style={s.cards}>
                  {guilds.map((g) => <GuildCard key={g.slug} g={g} />)}
                </View>
                {/* Same spot as the Web picker: centered weak link below the cards when guilds exist */}
                <Pressable style={s.moreWrap} onPress={() => router.push('/create')}>
                  <Text style={s.moreText}>{text.pickerCreateGuildMoreLabel ?? '+ 创建新百业'}</Text>
                </Pressable>
              </>
            )}


          {/* Recruit section (Viewer.homeRecruit via session): my
              newcomer checklist / pairings + the directory of guilds
              I can apply to — the dissolved recruit page's content,
              carried by the app home screen. */}
          <HomeRecruitSection section={homeRecruit} />
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
  heroImg: { top: '-30%' }, // Approximates Web object-position: center 32%
  avatarSlot: { position: 'absolute', right: 16, zIndex: 2 },
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
  // .yy-section-head: Chinese calligraphy 28 + EN 11px with .3em tracking, baseline aligned
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  sectionFirst: { marginTop: 40 },
  sectionNext: { marginTop: 34 },
  sectionZh: { fontFamily: fonts.brush, color: theme.goldHi, fontSize: 28, letterSpacing: 3 },
  // .yy-section-head .en uses text-transform: uppercase; the server text is Title Case
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
  slogan: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, marginTop: 4 },
  arrow: { color: theme.gold, fontSize: 22 },
  emptyCard: {
    position: 'relative', overflow: 'hidden', alignItems: 'center',
    backgroundColor: theme.ink2, borderWidth: 1, borderColor: theme.cardBorder,
    borderRadius: 12, paddingVertical: 36, paddingHorizontal: 24,
  },
  emptyTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 18, textAlign: 'center' },
  emptyBody: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14, lineHeight: 27, textAlign: 'center', marginTop: 10 },
  createBtn: {
    position: 'relative', overflow: 'hidden', borderRadius: 10,
    marginTop: 22, paddingVertical: 12, paddingHorizontal: 32, alignItems: 'center',
  },
  createBtnText: { fontFamily: fonts.serif, color: theme.onGold, fontSize: 15, fontWeight: '700' },
  moreWrap: { alignItems: 'center', marginTop: 16, paddingVertical: 4 },
  moreText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13.5 },
});
