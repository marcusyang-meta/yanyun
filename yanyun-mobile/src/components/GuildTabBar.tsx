import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useChrome } from '../useChrome';
import { ChromeBackdrop, TabFill } from './ui';
import type { GuildTabEntry, GuildTabIcon } from '../guildTabEntries';

// Floating bottom capsule bar (IG-style main navigation for the guild
// home): the ONE glass surface of the glass theme on this screen —
// every other chrome row here (top bar, guide switch, filter chips)
// is opaque. The capsule floats above the safe area with 16px side
// margins and the screen's scroll views pad their content clear of it
// (TAB_BAR_CLEARANCE).
//
// Material: classic renders the opaque ink capsule (chrome barFill).
// Glass prefers the native iOS liquid glass (expo-glass-effect's
// GlassView over UIVisualEffectView) and falls back to the shared
// expo-blur backdrop (ChromeBackdrop) everywhere else — Android,
// older iOS, and binaries built before the native module landed (an
// OTA can reach those, so the native import is guarded: a missing
// module must degrade to blur, never crash). Reduce Transparency
// resolves to classic inside useChrome, so no glass layer renders
// then at all.
export const TAB_BAR_HEIGHT = 60;
// Bottom clearance a scroll view needs so its last card can scroll
// fully out from behind the capsule: float gap + capsule height + a
// breathing margin, on top of the safe-area inset the caller adds.
export const TAB_BAR_CLEARANCE = 8 + TAB_BAR_HEIGHT + 12;

let NativeGlassView: React.ComponentType<any> | null = null;
try {
  // Dynamic require on purpose: static import would throw at bundle
  // evaluation on binaries without the native module.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ge = require('expo-glass-effect');
  if (
    ge?.GlassView &&
    typeof ge.isGlassEffectAPIAvailable === 'function' && ge.isGlassEffectAPIAvailable() &&
    typeof ge.isLiquidGlassAvailable === 'function' && ge.isLiquidGlassAvailable()
  ) {
    NativeGlassView = ge.GlassView as React.ComponentType<unknown>;
  }
} catch { /* module absent (older binary): blur fallback below */ }

export function nativeGlassAvailable(): boolean {
  return NativeGlassView != null;
}

const ICONS: Record<GuildTabIcon, [string, string]> = {
  // [active (filled), inactive (outline)] Ionicons glyph names.
  team: ['people', 'people-outline'],
  dex: ['book', 'book-outline'],
  announcements: ['megaphone', 'megaphone-outline'],
  schedule: ['calendar', 'calendar-outline'],
  insights: ['trophy', 'trophy-outline'],
  profile: ['person', 'person-outline'],
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export function GuildTabBar({
  entries, onSelect,
}: {
  entries: GuildTabEntry[];
  onSelect: (entry: GuildTabEntry) => void;
}) {
  const insets = useSafeAreaInsets();
  const { chrome, isGlass } = useChrome();
  const Glass = NativeGlassView;
  return (
    <View pointerEvents="box-none" style={[s.wrap, { bottom: insets.bottom + 8 }]}>
      <View style={s.shadow}>
        <View style={[s.capsule, { borderColor: chrome.border, backgroundColor: isGlass ? 'transparent' : chrome.barFill }]}>
          {isGlass && (Glass ? (
            <Glass
              style={StyleSheet.absoluteFill}
              glassEffectStyle="regular"
              colorScheme="dark"
              tintColor={chrome.barFill}
              pointerEvents="none"
            />
          ) : (
            <ChromeBackdrop kind="bar" />
          ))}
          <View style={s.row}>
            {entries.map((entry) => {
              const [filled, outline] = ICONS[entry.icon];
              const iconName = (entry.active ? filled : outline) as IoniconName;
              return (
                <Pressable
                  key={entry.key}
                  onPress={() => onSelect(entry)}
                  style={s.entry}
                  accessibilityRole="button"
                  accessibilityState={{ selected: entry.active }}
                  accessibilityLabel={entry.label || undefined}
                  hitSlop={4}
                >
                  {entry.active && (
                    <View style={s.lens}>
                      {isGlass
                        ? <View style={[StyleSheet.absoluteFill, s.lensGlass]} />
                        : <TabFill />}
                    </View>
                  )}
                  {/* Every entry — profile included — renders its line
                      icon from the one icon system; the capsule never
                      shows the photo avatar. The guild home's top bar
                      carries no avatar either (SiteChrome hideAvatar),
                      so this icon is the screen's one personal entry. */}
                  <Ionicons
                    name={iconName}
                    size={24}
                    color={entry.active ? theme.goldHi : 'rgba(236,226,203,.55)'}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, zIndex: 20 },
  shadow: {
    borderRadius: 999,
    shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  capsule: { borderRadius: 999, borderWidth: 1, overflow: 'hidden', height: TAB_BAR_HEIGHT },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  entry: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' },
  // Selected-state lens (IG): a brighter glass pill behind the active
  // icon — in glass a pale-gold translucent fill with a hairline gold
  // edge; in classic the shared gold tab gradient (TabFill).
  lens: {
    position: 'absolute', width: 54, height: 38, borderRadius: 999, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(236,210,143,.38)',
  },
  lensGlass: { backgroundColor: 'rgba(236,210,143,.20)' },
});
