// 界面语言偏好的前端镜像与生效语言管道。
// 真相在服务端: users.locale_pref (账号级, null = 自动跟随浏览器), 经
// GraphQL viewer.myLocalePref / settingsPage.localePref 下发。localStorage
// 镜像只为让首屏请求 (登录前/对账前) 就带上尽量正确的 x-locale; 服务端
// 对登录请求以存储偏好为准 (压过请求头), 对账后镜像向服务端看齐。
const PREF_KEY = 'yy_locale_pref';
export const SUPPORTED_LOCALES = ['zh-CN', 'en', 'es', 'fr', 'zh-TW'];

export function readPrefMirror(): string | null {
  try {
    const v = window.localStorage.getItem(PREF_KEY);
    return v && SUPPORTED_LOCALES.includes(v) ? v : null;
  } catch { return null; }
}

export function writePrefMirror(v: string | null) {
  try {
    if (v) window.localStorage.setItem(PREF_KEY, v);
    else window.localStorage.removeItem(PREF_KEY);
  } catch { /* 隐私模式等场景写不进就算了, 服务端仍是真相 */ }
}

// 请求层最近一次实际发出的语言标记 (原始 tag, 如 'en-US' 或偏好 id),
// 供 AppRoot 对账: 服务端 effectiveLocale 与它协商出的 canonical 不一致
// 时, 说明界面语言需要切换 -> 触发整树重取。
let lastSentTag = '';
export function lastSentLocaleTag() { return lastSentTag; }

// 发请求时用的语言标记: 有账号偏好镜像用偏好, 否则浏览器语言 (与后端
// negotiateLocale 的输入约定一致)。
export function effectiveLocaleTag(): string {
  const tag = readPrefMirror() ?? (typeof navigator !== 'undefined' ? navigator.language : 'zh-CN');
  lastSentTag = tag;
  return tag;
}

// 语言切换事件: 设置页保存成功后发出, AppShell 订阅后重挂载整棵树,
// 所有查询按新 x-locale 重新取数, 界面即时切换 (无需手动刷新)。
const listeners = new Set<() => void>();
export function onLocaleChanged(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
export function emitLocaleChanged() { listeners.forEach((fn) => fn()); }
