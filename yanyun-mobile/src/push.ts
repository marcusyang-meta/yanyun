import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { registerPushTokenRemote, unregisterPushTokenRemote } from './api';

// App push (Expo channel for grouping reminders): after sign-in/session
// restore, silently register the token with the backend
// (registerPushToken) and unregister on sign-out. Denied permission or
// unsupported platforms are skipped silently and retried next launch --
// never nag the user. The backend sends 10 minutes before start, in
// parallel with the Discord reminder; notification data is
// { slug, groupingId } and taps deep-link to the grouping detail.

// Foreground notification presentation: show banner and notification list, no sound, no badge (simple policy).
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch { /* No notification environment (e.g. Web runtime): ignore */ }

let registeredToken: string | null = null;
let syncing = false;
let tokenListenerBound = false;

async function obtainExpoPushToken(): Promise<string | null> {
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return null;
  if (Platform.OS === 'android') {
    // Android 13+: a notification channel must exist before a token can be obtained (official docs requirement)
    await Notifications.setNotificationChannelAsync('default', {
      name: '发车提醒',
      importance: AndroidImportance.DEFAULT,
    }).catch(() => {});
  }
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const res = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  return res && typeof res.data === 'string' && res.data ? res.data : null;
}

// Call when the session is valid (session.tsx triggers it once the viewer yields a user): fetch and register the token.
// Each token registers once per process; token rotation is handled by the listener re-running this flow.
export async function ensurePushRegistration(): Promise<void> {
  if (Platform.OS === 'web') return; // Web has no Expo push channel; degrade gracefully
  if (syncing) return;
  syncing = true;
  try {
    const token = await obtainExpoPushToken();
    if (!token) return;
    if (token !== registeredToken) {
      const r = await registerPushTokenRemote(token, Platform.OS);
      if (r && r.ok) registeredToken = token;
    }
    if (!tokenListenerBound) {
      tokenListenerBound = true;
      try {
        Notifications.addPushTokenListener(() => {
          // Underlying device token changed -> the Expo token may change too; re-run registration
          registeredToken = null;
          void ensurePushRegistration();
        });
      } catch { /* Ignore in unsupported environments */ }
    }
  } catch {
    // Denied permission / unsupported Expo Go environment / network failure: all silent
  } finally {
    syncing = false;
  }
}

// Call on sign-out (must run before the local session token is cleared; the mutation needs it for auth).
export async function unregisterCurrentPushToken(): Promise<void> {
  const token = registeredToken;
  registeredToken = null;
  if (!token || Platform.OS === 'web') return;
  try { await unregisterPushTokenRemote(token); } catch { /* Silent */ }
}


function routeFromResponse(response: Notifications.NotificationResponse | null | undefined) {
  try {
    const data = response?.notification?.request?.content?.data || {};
    const slug = (data as Record<string, unknown>).slug;
    const groupingId = (data as Record<string, unknown>).groupingId;
    if (typeof slug === 'string' && slug && groupingId != null && String(groupingId)) {
      router.push(`/guild/${slug}/grouping/${String(groupingId)}`);
      Notifications.clearLastNotificationResponse();
    }
  } catch { /* Unexpected payload: stay on the current page */ }
}

// Mounted in the root layout: cold-start notification opens
// (getLastNotificationResponse) and runtime taps (response listener)
// both land on the grouping detail page. Skipped on the Web runtime.
export function useNotificationObserver() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let sub: { remove(): void } | null = null;
    try {
      routeFromResponse(Notifications.getLastNotificationResponse());
      sub = Notifications.addNotificationResponseReceivedListener(routeFromResponse);
    } catch { /* Ignore when no notification environment */ }
    return () => { try { sub?.remove(); } catch { /* */ } };
  }, []);
}
