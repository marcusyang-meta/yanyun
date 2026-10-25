# 燕云百业 · 手机版（Expo / React Native + Relay）

网站（yanyun-web）的移动端伴侣 App。后端同一个 GraphQL 契约、同一个 Discord 登录、
同一条 GuildHub 实时通道。MVP 闭环：Discord 登录 → 选百业 → 车队周列表 → 车队详情
（报名/离队）→ WebSocket 实时刷新。推送与装备库是二期，本仓库尚未实现。

## 架构：Bloks-lite（服务端下发带类型积木对象）

按产品裁决实现，不是写死的原生界面，也不是 JSON blob：

- **原生框归 App**：导航壳、Discord 登录流、选百业、三页签与周前后控件的机制、
  WebSocket 生命周期、安全存储。
- **内容区归服务端**：车队列表与车队详情的内容区是 GraphQL 里带类型的对象树——
  `GroupingListPage.blocks` / `GroupingDetailPage.blocks` 返回 `Block` 接口对象
  （`SectionBlock` 用 `children: [Block!]` 递归，其余为叶子：`TextBlock`、`BannerBlock`、
  `ChipRowBlock`、`GroupingCardBlock`、`SeatGridBlock`、`ActionButtonBlock`、
  `EmptyStateBlock`、`SpacerBlock`、`SectionHeaderBlock`、`FallbackBlock`）。
  App 用 Relay fragment 按具体类型递归渲染到原生基础元素（View/Text/Pressable）。
- **动作也是带类型对象**：`Action` 接口（`NavigateAction` / `JoinAction` /
  `LeaveAction` / `DisbandAction`，带类型化参数与确认文案），服务端从不下发原始
  GraphQL；客户端只把动作对象类型分发到已知的导航/mutation 处理器。
- **权限由组树表达**：树按观看者生成——车头的树里有解散 `ActionButtonBlock`，
  非车头的树里没有；空位有 `JoinAction`、本人座位有 `LeaveAction`。客户端零权限判断。
- **版本协商**：查询带 `blocksVersion` 参数（当前 App = 2）。客户端版本低于某个
  对象所需版本时，服务端在原位换成 `FallbackBlock`（最老客户端也能渲染的提示叶子）；
  客户端遇到不认识的 `__typename` 渲染安全占位、其余照常，永不白屏。
  blocks 字段出错 → 原生重试态。
- **文案**：积木文本全部由后端生成（现有 i18n 目录 + x-locale 协商）；App 只保留
  自己的框体文案（页签、周控件等），语言固定 zh-CN。

数据层 = Relay 21（react-relay / relay-runtime / relay-compiler，与网站同版本口径）。
刷新不闪屏：WS ping 与下拉刷新都走命令式 network 重查写回 store 的同一路径。

### 核心/平台边界（为桌面 overlay 复用而设）

积木系统已按平台拆分，**桌面 overlay 后续只写一套 DOM 叶子即可接入，不碰核心**：

- **平台中立核心 `src/blocks/core/`**（禁止 import react-native / DOM 等平台 API）：
  - `core/fragments.ts` — 全部 Block/Action 的 GraphQL fragment 契约；
  - `core/types.ts` — 块/动作类型、`ActionHandlers`、确认注入点 `ConfirmFn`、
    叶子注册表类型 `BlockLeafRegistry`（含 Section 容器外壳）；
  - `core/renderer.tsx` — 递归遍历器 `createBlockRenderer(registry)`：层级
    fragment 递归、按 `__typename` 分发到注册表、未知类型落 Unknown 占位；
  - `core/actions.ts` — 动作分发 `dispatchAction(action, handlers, confirm)`
    与 `useActionData`：动作→处理器的映射在核心；确认弹窗只是注入的函数
    （文案来自动作对象，呈现机制归各端）；导航/mutation 的落地由
    `ActionHandlers` 注入，核心不关心宿主是路由器还是窗口 IPC。
- **平台层（本仓库为 RN）**：`src/blocks/BlockRenderer.tsx` 只提供 RN 叶子
  组件 + 注册表并实例化遍历器；`src/blocks/actions.ts` 只把 `Alert` 绑成
  `ConfirmFn` 转发核心分发；`src/blocks/fragments.ts` 是指向核心的兼容垫片。
- overlay 接入方式（将来）：依赖 `core/` + `src/documents.ts` 的查询文档与
  `src/__generated__` 产物，实现 DOM 版 `BlockLeafRegistry`（叶子映射到
  DOM 元素）与 DOM 版 `ConfirmFn`、`ActionHandlers`，外加自己的 Relay
  Environment（端点/鉴权头按 overlay 的会话方式注入）。

## 会话

- 登录：`expo-web-browser` 打开后端 `/auth/discord/login?app=yanyun://auth-callback`
  → Discord 回调后后端 302 深链回 `yanyun://auth-callback?token=<会话JWT>`
  → JWT 存 expo-secure-store（Web 预览运行时用 localStorage）。
- 之后 GraphQL 与 WS 一律 `Authorization: Bearer <JWT>`。后端 `getSessionUser`
  在无 cookie 时回退读 Bearer，与 cookie 同一条校验路径（含 Discord 授权完整性/
  吊销检查）：会话被后端作废时 viewer 返回 `user=null`，App 同步清令牌回登录页。
- 登出清本地令牌。

## 实时（前台/后台纪律）

`src/live.ts`：只在 App 前台（AppState = active）且停留在百业界面时连接
`/ws/guild/:slug`（Bearer 头，RN WebSocket 支持 headers）；收到
`grouping-changed` 只当信号，走上面的重查路径。切后台立即关 socket
（移动系统本来也会杀后台 socket），回前台重连并立即全量对齐一次。
注：Web 预览运行时浏览器 WebSocket 不能带 Authorization 头，实时不生效，
靠下拉刷新兜底；原生端不受影响。

## 目录

- `src/app/` — expo-router 路由壳；`src/screens/` — 原生框界面（内容区交给积木渲染器）
- `src/blocks/` — fragment 定义（每类型一个）、递归渲染器、动作分发
- `src/documents.ts` — 全部 GraphQL 文档（Relay 操作）；`src/__generated__/` — 编译产物
- `src/relay.ts` — Relay Environment（Bearer + x-locale + x-tz）
- `src/api.ts` — viewer 拉取与 join/leave/disband mutation 封装
- `src/session.tsx`、`src/live.ts`、`src/week.ts`（周界：周一 05:00 北京时间；
  startsAt 为 epoch 秒字符串，口径与网站一致）
- `schema.graphql` — **生成文件勿手改**：由 `node scripts/sync-schema.mjs` 从后端
  SDL 合并扩展生成（与网站同一脚本口径）；后端 schema 变更后重跑它 + `npm run relay`

## 在手机上跑（开发流）

前置：本机或局域网能访问后端（生产 `https://yanyun.tbdlab.workers.dev` 为默认；
本地联调用 wrangler dev 起 yanyun-signup）。

```bash
cd ~/workspace/yanyun-mobile
npm install                 # 首次
# 可选：指向本地后端（手机需用局域网 IP，不要用 127.0.0.1）
EXPO_PUBLIC_API_URL=http://<局域网IP>:8787 npx expo start
# 默认（生产后端）直接：
npx expo start
```

手机装 **Expo Go** 扫码即可（依赖全部为 Expo Go 兼容的纯 JS + 官方模块，
无需 dev client）。登录时系统浏览器打开 Discord，授权后深链回 App。

改 GraphQL 文档后：`npm run relay` 重新生成 `src/__generated__` 并提交。
完成前自检：`npx tsc --noEmit`、`npx expo lint`、`npx relay-compiler` 三者全绿。

## Android APK

- 云构建（推荐，无需本地 Android SDK）：`npx eas build -p android --profile preview`
  （`eas.json` 的 preview 档 = apk、内部发行）。构建在 Expo 云端完成，产物是可直接
  侧载安装的 `.apk`（包名 `dev.tbdlab.yanyun`）；首次构建会要求登录 Expo 账号，
  并在云端生成/托管签名密钥。把 apk 链接发给成员即可安装（需允许"安装未知应用"）。
- 本机构建（可选）：装好 Android SDK 后 `npx expo run:android --variant release`
  生成原生工程并本地打包；日常迭代不必走这条路。
- 上架档：`npx eas build -p android --profile production` 出 AAB（Google Play 用），
  MVP 阶段不需要。

## iOS（还差什么）

当前状态：代码与配置（bundle id `dev.tbdlab.yanyun`）已就绪，但**还没有
Apple Developer 账号**，所以暂时出不了可装到成员 iPhone 的包。开发流不受影响：
iPhone 装 Expo Go 扫 `npx expo start` 的二维码即可跑（依赖均为 Expo Go 兼容）。

账号到位后只剩三步，全在 EAS 云端完成，不需要本地 Mac/Xcode：

1. 加入 Apple Developer Program（$99/年，个人或组织均可）。
2. `npx eas build -p ios --profile preview` — 首次会让登录 Apple 账号，EAS 自动
   生成证书与描述文件（内部发行走 ad hoc，需先用 `eas device:create` 登记成员
   设备 UDID）；正式分发则用 production 档。
3. TestFlight 分发：`npx eas submit -p ios` 上传到 App Store Connect，在
   TestFlight 里加内部测试员（免审核）或外部测试员（需一次 Beta 审核），
   成员装 TestFlight App 点链接即可安装与自动更新。

注：Discord 登录交接的回调 `yanyun://auth-callback` 用的是 app.json 的
`scheme: "yanyun"`，EAS 构建会自动带上，TestFlight 版与 Expo Go 版行为一致。

## 验收证据（MVP，2026-10-25）

- 本地联调栈：wrangler dev（yanyun-signup）+ Discord 打桩（夹具用户/服务器），
  App 以 Expo Web 运行时经 CDP 驱动验收（原生端同一代码路径，WS 在 Web 端以
  cookie 通道验证——浏览器 WS 不能带 Bearer 头，后端 cookie/Bearer 同一校验路径）。
- 截图（`screenshots/`）：`01-login` 登录页、`02-guilds` 选百业、`03-list` 车队
  列表、`04-detail` 车头详情（含解散按钮对象）、`05-detail-joined` UI 报名往返
  后名册、`06-list-banner` 服务端公告 → App 零改动出现 BannerBlock、
  `07-detail-bogus` 未知积木占位、`08-detail-ws-live` WS 推送后名册自动更新。
- 积木树倾倒与版本替代/权限差异在 API 层另有专项探针（车头树含 DisbandAction
  对象、非车头树无；blocksVersion=1 时 ChipRowBlock 被 FallbackBlock 替代）。
...[truncated 2855 chars]