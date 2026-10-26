import Constants from 'expo-constants';

// 后端地址：默认生产；本地联调可用 EXPO_PUBLIC_API_URL 覆盖（如 http://127.0.0.1:8787）。
export const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'https://yanyun.tbdlab.workers.dev';

// 移动端 OAuth 交接回调（后端白名单精确匹配这个值，才会把 JWT 深链回 App）
export const APP_AUTH_REDIRECT = 'yanyun://auth-callback';

// 语言协商不在这里写死: relay.ts 每请求取 locale.ts 的
// effectiveLocaleTag() (账号偏好镜像 ?? 设备语言, 与网站同口径)。

// 积木词表版本: 本 App 认识的 Block/Action 对象版本 (服务端据此做
// FallbackBlock 替代, 见后端 BLOCK_TYPE_SINCE)。新词表上线时 +1。
// v3: EditAction (编辑车队, 仅车头的详情树下发)。
// v4: CompleteAction / UncompleteAction (完成/恢复车队, 仅车头的详情树下发)。
export const BLOCKS_VERSION = 4;

// 原语词表版本 (C 路线): 本 App 解释器认识的原语词汇/动作集版本。
// 协商语义: 带上这个参数且服务端该百业 × 页面的原语开关开着时,
// primTree 返回原语树; 否则为 null, 屏幕回落积木树渲染。v1 已冻结
// (10 原语 + Fallback、7 动作、全集样式令牌), 扩词汇 = 发版事件。
export const PRIMITIVES_VERSION = 1;
