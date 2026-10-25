import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { fonts, theme } from '../theme';

// 传家宝印章系统 (Web GearSeal 的 RN 等价呈现):
// - 判定在服务端 gearplanner, 经 gearEvals[].verdict 下发; 本模块只管视觉:
//   金漆印 (深红漆底+金边金字+角金菱, -3°) / 灰素印 (+2.5°) / 玉佩挂穗 /
//   金粉粒子 (点击撒粉 + 集齐 8 件庆祝) 与庆祝状态机。
// - 文案 (传家宝/拉完了) 走后端 gearVerdictHeirloom/gearVerdictDud, 调用方传入。

export function VerdictSeal({ verdict, heirloomLabel, dudLabel }: {
  verdict?: string | null;
  heirloomLabel: string;
  dudLabel: string;
}) {
  if (verdict === 'heirloom') {
    return (
      <View style={s.heirloom}>
        <View style={[s.diamond, { top: -3, left: -3 }]} />
        <View style={[s.diamond, { bottom: -3, right: -3 }]} />
        <Text style={s.heirloomText}>{heirloomLabel}</Text>
      </View>
    );
  }
  if (verdict === 'dud') {
    return (
      <View style={s.dud}>
        <Text style={s.dudText}>{dudLabel}</Text>
      </View>
    );
  }
  return null;
}

/* 玉佩挂穗 (Web SVG 的 View 等价: 金环 + 红绳 + 绿璧 + 红穗), 带轻摆动画 */
export function JadePendant() {
  const [sway] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sway, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [sway]);
  const rotate = sway.interpolate({ inputRange: [0, 1], outputRange: ['2.6deg', '-2.6deg'] });
  return (
    <Animated.View pointerEvents="none" style={[s.pendant, { transform: [{ rotate }] }]}>
      <View style={s.pendantRing} />
      <View style={s.pendantCord} />
      <View style={s.pendantJade}>
        <View style={s.pendantJadeHole} />
      </View>
      <View style={s.pendantKnot} />
      <View style={s.pendantTassels}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[s.pendantTassel, { height: 17 + (i === 2 ? 2 : 0) - Math.abs(i - 2) }]} />
        ))}
      </View>
    </Animated.View>
  );
}

/* ---------------- 金粉粒子 ---------------- */
export const GOLD_DUST_COLORS = ['#F6DEA0', '#EFC96E', '#C9A24B', '#FFE9B0', '#D9A441'];

type Particle = {
  dx: number; dy: number; size: number; color: string; rot: number; dur: number;
};
type Burst = { id: number; cx: number; cy: number; parts: Particle[] };

const burstListeners = new Set<(b: Burst) => void>();
let burstId = 1;

export function goldDustBurst(cx: number, cy: number, count = 24, spread = 90): void {
  const parts: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const dist = (0.3 + Math.random() * 0.7) * spread;
    parts.push({
      dx: Math.cos(ang) * dist,
      dy: Math.sin(ang) * dist * 0.7 + spread * 0.55,
      size: 2 + Math.random() * 3.6,
      color: GOLD_DUST_COLORS[i % GOLD_DUST_COLORS.length],
      rot: Math.round(Math.random() * 260 - 130),
      dur: Math.round(560 + Math.random() * 300),
    });
  }
  const b: Burst = { id: burstId++, cx, cy, parts };
  burstListeners.forEach((f) => f(b));
}

function DustParticle({ cx, cy, p }: { cx: number; cy: number; p: Particle }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1, duration: p.dur, easing: Easing.bezier(0.17, 0.67, 0.35, 1), useNativeDriver: true,
    }).start();
  }, [t, p.dur]);
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, p.dy] });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rot}deg`] });
  const opacity = t.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: cx - p.size / 2, top: cy - p.size / 2,
        width: p.size, height: p.size, borderRadius: p.size / 2,
        backgroundColor: p.color, opacity,
        shadowColor: '#EFC96E', shadowOpacity: 0.8, shadowRadius: 3, shadowOffset: { width: 0, height: 0 },
        transform: [{ translateX }, { translateY }, { rotate }],
      }}
    />
  );
}

// 金粉宿主: 挂在使用印章的画面根部 (position absolute 全屏, 不拦触摸)。
export function GoldDustHost() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  useEffect(() => {
    const fn = (b: Burst) => {
      setBursts((prev) => [...prev.slice(-5), b]);
      setTimeout(() => setBursts((prev) => prev.filter((x) => x.id !== b.id)), 1100);
    };
    burstListeners.add(fn);
    return () => { burstListeners.delete(fn); };
  }, []);
  if (!bursts.length) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {bursts.map((b) => (
        <View key={b.id} pointerEvents="none" style={StyleSheet.absoluteFill}>
          {b.parts.map((p, i) => (
            <DustParticle key={i} cx={b.cx} cy={b.cy} p={p} />
          ))}
        </View>
      ))}
    </View>
  );
}

/* 庆祝撒粉 (Web fireHeirloomCelebration 等价): 从分数处撒 110 + 50 粒 */
export function fireHeirloomCelebrationAt(cx: number, cy: number): void {
  goldDustBurst(cx, cy, 110, 300);
  goldDustBurst(cx, cy, 50, 170);
}

/* ---------------- 集齐庆祝状态机 (与 Web createHeirloomParty 同语义) ---------------- */
export type HeirloomParty = {
  readonly complete: boolean;
  readonly fires: number;
  check: (completeNow: boolean, fire: () => void) => boolean;
};

export function createHeirloomParty(): HeirloomParty {
  const st = { complete: false, fires: 0 };
  return {
    get complete() { return st.complete; },
    get fires() { return st.fires; },
    check(completeNow: boolean, fire: () => void) {
      const shouldFire = completeNow && !st.complete;
      st.complete = completeNow;
      if (shouldFire) {
        st.fires++;
        setTimeout(fire, 400);
      }
      return shouldFire;
    },
  };
}

const s = StyleSheet.create({
  heirloom: {
    position: 'relative',
    backgroundColor: '#7d1c10',
    borderWidth: 1, borderColor: '#C9A24B', borderRadius: 4,
    paddingVertical: 2, paddingHorizontal: 9,
    transform: [{ rotate: '-3deg' }],
    shadowColor: '#C9A35C', shadowOpacity: 0.45, shadowRadius: 5, shadowOffset: { width: 0, height: 0 },
  },
  heirloomText: {
    fontFamily: fonts.serif, fontWeight: '900', fontSize: 13,
    letterSpacing: 3, color: '#EFC96E',
    textShadowColor: 'rgba(239,201,110,.65)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 },
  },
  diamond: {
    position: 'absolute', width: 5, height: 5, backgroundColor: '#C9A24B',
    transform: [{ rotate: '45deg' }],
  },
  dud: {
    backgroundColor: '#2B2B30',
    borderWidth: 1.5, borderColor: theme.muted, borderRadius: 4,
    paddingVertical: 2, paddingHorizontal: 8, opacity: 0.82,
    transform: [{ rotate: '2.5deg' }],
  },
  dudText: {
    fontFamily: fonts.serif, fontWeight: '700', fontSize: 12.5,
    letterSpacing: 2, color: theme.muted,
  },
  pendant: {
    position: 'absolute', top: -13, right: -3, width: 26, height: 54,
    alignItems: 'center', zIndex: 4,
  },
  pendantRing: {
    width: 7, height: 7, borderRadius: 3.5, borderWidth: 1.8, borderColor: '#C9A24B',
  },
  pendantCord: { width: 2, height: 3, backgroundColor: '#B02A20' },
  pendantJade: {
    width: 19, height: 19, borderRadius: 9.5,
    borderWidth: 4.5, borderColor: '#57A773',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  pendantJadeHole: {
    width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: '#2E6B4A',
    backgroundColor: theme.ink2,
  },
  pendantKnot: { width: 7, height: 5, borderRadius: 1.6, backgroundColor: '#B02A20', marginTop: 0.5 },
  pendantTassels: { flexDirection: 'row', gap: 1.6, alignItems: 'flex-start', marginTop: 0.5 },
  pendantTassel: { width: 1.8, backgroundColor: '#C23A2A', borderRadius: 1 },
});
