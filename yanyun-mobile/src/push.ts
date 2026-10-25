import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { registerPushTokenRemote, unregisterPushTokenRemote } from './api';

// App 推送 (发车提醒的 Expo 通道): 登录/会话恢复后静默注册令牌到后端
// (registerPushToken), 登出时注销。权限被拒/平台不支持一律静默跳过,
// 下次启动再试, 绝不打扰用户。后端在发车前 10 分钟与 Discord 提醒并行
// 发送, 通知 data = { slug, groupingId }, 点击直达车队详情。

// 前台收到通知的呈现: 显示横幅与通知列表, 不响铃不加角标 (简单策略)。
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch { /* Web 运行时等无通知环境: 忽略 */ }

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
    // Android 13+: 必须先建通知渠道才能拿令牌 (官方文档要求)
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

// 会话有效时调用 (session.tsx 在 viewer 拉到 user 后触发): 拿令牌并注册。
// 同一令牌本进程内只注册一次; 令牌变化 (系统轮换) 由监听器重跑本流程。
export async function ensurePushRegistration(): Promise<void> {
  if (Platform.OS === 'web') return; // Web 无 Expo 推送通道, 优雅降级
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
          // 底层设备令牌变化 -> Expo 令牌可能随之变化, 重跑注册流程
          registeredToken = null;
          void ensurePushRegistration();
        });
      } catch { /* 不支持的环境忽略 */ }
    }
  } catch {
    // 权限被拒 / Expo Go 不支持的环境 / 网络失败: 全部静默
  } finally {
    syncing = false;
  }
}

// 登出时调用 (必须在本地会话令牌清掉之前, mutation 要靠它鉴权)。
export async function unregisterCurrentPushToken(): Promise<void> {
  const token = registeredToken;
  registeredToken = null;
  if (!token || Platform.OS === 'web') return;
  try { await unregisterPushTokenRemote(token); } catch { /* 静默 */ }
}

/* ---------- 通知点击跳转 ---------- */

function routeFromResponse(response: Notifications.NotificationResponse | null | undefined) {
  try {
    const data = response?.notification?.request?.content?.data || {};
    const slug = (data as Record<string, unknown>).slug;
    const groupingId = (data as Record<string, unknown>).groupingId;
    if (typeof slug === 'string' && slug && groupingId != null && String(groupingId)) {
      router.push(`/guild/${slug}/grouping/${String(groupingId)}`);
      Notifications.clearLastNotificationResponse();
    }
  } catch { /* 数据不合预期就留在当前页 */ }
}

// 根布局挂载: 冷启动被通知点开 (getLastNotificationResponse) 与运行中
// 点击 (response 监听) 都落到车队详情页。Web 运行时直接跳过。
export function useNotificationObserver() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let sub: { remove(): void } | null = null;
    try {
      routeFromResponse(Notifications.getLastNotificationResponse());
      sub = Notifications.addNotificationResponseReceivedListener(routeFromResponse);
    } catch { /* 无通知环境忽略 */ }
    return () => { try { sub?.remove(); } catch { /* */ } };
  }, []);
}
