import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// 界面语言偏好管道 (照 Web src/lib/locale 的同一套语义搬到 RN):
// 真相在服务端 users.locale_pref (账号级, null = 自动跟随设备), 经
// GraphQL viewer.myLocalePref / settingsPage.localePref 下发; 本地镜像
// 只为让首屏请求就带上尽量正确的 x-locale。服务端对已登录请求以存储
// 偏好为准 (压过请求头), 对账后镜像向服务端看齐。
const PREF_KEY = 'yy_locale_pref';
export const SUPPORTED_LOCALES = ['zh-CN', 'zh-TW', 'en', 'es', 'fr'];

let prefMirror: string | null = null;
let mirrorLoaded = false;

export function readPrefMirror(): string | null {
  return prefMirror;
}

export async function initLocaleMirror(): Promise<void> {
  if (mirrorLoaded) return;
  mirrorLoaded = true;
  try {
    let v: string | null = null;
    if (Platform.OS === 'web') {
      try { v = window.localStorage.getItem(PREF_KEY); } catch { v = null; }
    } else {
      v = await SecureStore.getItemAsync(PREF_KEY);
    }
    if (v && SUPPORTED_LOCALES.includes(v)) prefMirror = v;
  } catch { /* 读不到就按自动处理 */ }
}

export function writePrefMirror(v: string | null) {
  prefMirror = v && SUPPORTED_LOCALES.includes(v) ? v : null;
  void (async () => {
    try {
      if (Platform.OS === 'web') {
        try {
          if (prefMirror) window.localStorage.setItem(PREF_KEY, prefMirror);
          else window.localStorage.removeItem(PREF_KEY);
        } catch { /* 静默 */ }
        return;
      }
      if (prefMirror) await SecureStore.setItemAsync(PREF_KEY, prefMirror);
      else await SecureStore.deleteItemAsync(PREF_KEY);
    } catch { /* 静默 */ }
  })();
}

// 设备语言 → 生效标记: 与后端 negotiateLocale 的映射口径一致
// (zh-TW 独立, en/es/fr 直达, 其余回退 zh-CN)。偏好镜像优先。
export function effectiveLocaleTag(): string {
  if (prefMirror) return prefMirror;
  let tag = 'zh-CN';
  try {
    tag = Intl.DateTimeFormat().resolvedOptions().locale || 'zh-CN';
  } catch { /* 保持 zh-CN */ }
  const lower = tag.toLowerCase();
  if (lower.startsWith('zh')) return /tw|hk|mo|hant/.test(lower) ? 'zh-TW' : 'zh-CN';
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('fr')) return 'fr';
  return 'zh-CN';
}

// 语言切换事件: Profile 保存成功后发出。relay.ts 订阅后以新 x-locale
// 命令式重取全部已登记查询 (新文案写回同一批 store 记录, 挂载组件随
// 订阅自动重渲染); session 订阅后重拉 viewer 对齐账号状态。
const listeners = new Set<() => void>();
export function onLocaleChanged(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
export function emitLocaleChanged() { listeners.forEach((fn) => fn()); }
