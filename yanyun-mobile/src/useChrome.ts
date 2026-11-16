import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useSession } from './session';
import { blurIntensityFor, chromeFor, isGlassChrome, type ChromeTokens, type ThemeVariant } from './theme';

// Chrome theme hook: the single place where the account theme variant
// (session state, synced from Viewer.myThemePref) and the system
// Reduce Transparency setting combine into the effective chrome
// tokens. Components consume the returned tokens / flags only — no
// variant branching lives in them. When Reduce Transparency is on,
// chromeFor resolves to the opaque classic tokens and isGlass is
// false, so every glass surface renders its classic form.

export function useReduceTransparency(): boolean {
  const [reduceTransparency, setReduceTransparency] = useState(false);
  useEffect(() => {
    let live = true;
    try {
      if (typeof AccessibilityInfo.isReduceTransparencyEnabled === 'function') {
        AccessibilityInfo.isReduceTransparencyEnabled()
          .then((v) => { if (live) setReduceTransparency(!!v); })
          .catch(() => { /* Unsupported platform: keep transparency */ });
      }
    } catch { /* Unsupported platform: keep transparency */ }
    let sub: { remove: () => void } | undefined;
    try {
      // The change event is iOS-only; elsewhere this simply never fires.
      sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', (v: boolean) => {
        setReduceTransparency(!!v);
      });
    } catch { /* No listener support: the one-shot read above stands */ }
    return () => { live = false; sub?.remove(); };
  }, []);
  return reduceTransparency;
}

export type ChromeState = {
  // The account's chosen variant (before the accessibility fallback).
  themePref: ThemeVariant;
  reduceTransparency: boolean;
  chrome: ChromeTokens;
  // expo-blur intensity for the effective chrome (0 = no blur).
  blurIntensity: number;
  isGlass: boolean;
};

export function useChrome(): ChromeState {
  const { themePref } = useSession();
  const reduceTransparency = useReduceTransparency();
  const chrome = chromeFor(themePref, reduceTransparency);
  return {
    themePref,
    reduceTransparency,
    chrome,
    blurIntensity: blurIntensityFor(chrome),
    isGlass: isGlassChrome(chrome),
  };
}
