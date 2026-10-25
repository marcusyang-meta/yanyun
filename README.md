# 燕云十六声 · 百业工具 monorepo

五个可部署物 + 三个共享包，一个仓、一个 lockfile（npm workspaces）。
2026-10-25 由原先五棵散树（`~/workspace/yanyun-*`）合并而来。

```
yanyun/
├─ yanyun-signup/     后端: Hono + GraphQL Yoga on Cloudflare Workers + D1
│                     (含 GuildHub Durable Object 实时推送 / 发车提醒 / hub 管理台)
├─ yanyun-web/        Web 前端: Vite + React + Relay 21 (构建产物拷进 signup/public 部署)
├─ yanyun-mobile/     手机版: Expo SDK 58 + React Native + Relay (EAS Update 分发)
├─ yanyun-og/         OG 分享图 Worker (satori/resvg 渲染, Cron 预热)
├─ yanyun-overlay/    桌面 overlay (旧 Electron 只读攻略窗; Tauri 迁移规划见 BLOCKS-PLAN.md)
└─ packages/
   ├─ blocks-core/    @yanyun/blocks-core — Bloks-lite 平台中立核心
   ├─ theme/          @yanyun/theme — 设计令牌单一来源
   └─ schema/         @yanyun/schema — GraphQL SDL 契约单一来源
```

## 安装与日常

```bash
npm install            # 只在仓根跑; 单一根 lockfile, 子项目不再各自 install
npm run build:web      # web 构建 (sync-schema → relay → tsc → vite)
npm run mobile:typecheck
npm run relay          # Relay 多项目 codegen (根 relay.config.json, 见下)
```

根 `.npmrc` 设了 `legacy-peer-deps=true`：RN/Expo 生态 peer 范围普遍滞后，
`expo install` 本身也是这个策略，workspaces 下保持一致。

## 共享包

### @yanyun/blocks-core
Bloks-lite 的平台中立核心：Block/Action 类型、递归 fragment 集、树 walker
（`createBlockRenderer`）、`dispatchAction`。**禁止 import react-native / DOM**——
平台叶子（RN/Web/Tauri 渲染器）由宿主经 `BlockLeafRegistry` 注入。
- 消费者：yanyun-mobile（`src/blocks/` 是宿主垫片：RN 叶子 + 动作绑定）。overlay 的
  blocks 迁移（Tauri）将是第二个消费者。
- 不在本包的东西：Relay Environment 工厂留在 mobile `src/relay.ts`（绑了 App 的
  session/语言重查逻辑，非平台中立）；`BLOCKS_VERSION` 的**值**留在 mobile
  `src/config.ts`（每端协商），包里只持有版本契约（FallbackBlock 等）。

### @yanyun/theme
设计令牌单一来源：`src/tokens.json` 是数据，`scripts/gen.mjs` 生成 `tokens.ts`
（TS 常量）与 `tokens.css`（`:root` 变量片段）。改颜色改 tokens.json 后跑
`npm run gen --workspace=@yanyun/theme`。
- 消费者：mobile 已改为引用包内令牌（`src/theme.ts` 只做形状映射）。
- Web 本轮**未接**：`yanyun-web/src/index.css` 仍直用自带 `:root`（值与令牌同源），
  下一轮再把 `:root` 换成生成片段，避免本轮动 web 构建。

### @yanyun/schema
`schema.graphql` 是全仓唯一的 GraphQL SDL 契约源（canonical）。同步方向一律
**包 → 各端**，不许反向改各端副本当源头：
- `yanyun-signup/schema.graphql`：由 `yanyun-signup/scripts/sync-schema.mjs` 从包拷贝。
  后端运行时不读这个文件（typeDefs 在 `src/graphql-schema.js`），拷贝只为工具/文档对齐。
- Web / mobile 的编译用 schema 是**合并版**（`extend type` 必须先经
  buildASTSchema+printSchema 合并，否则 relay-compiler 把扩展字段当客户端字段）：
  两端各自的 `scripts/sync-schema.mjs` 已改为从包取源头生成；包内
  `scripts/merge-schema.mjs` 是同一算法的通用版（blocks-core 的 schema.graphql 由它生成）。

### Relay 多项目 codegen
根 `relay.config.json` 是多项目配置：`mobile`（base = `blocks`）+ `blocks` 两项目，
sources 分别映射 `yanyun-mobile/src` 与 `packages/blocks-core/src`，产物各回各家
（`*/src/__generated__`）。只在仓根跑：`npm run relay`。子项目里的 `relay` script
只是转发到根配置，不要再在子目录单独建 relay.config.json。

### Expo / Metro
`yanyun-mobile/metro.config.js` 按 Expo 官方 monorepos 指南显式配置：
`watchFolders = [仓根]`、`resolver.nodeModulesPaths = [项目 node_modules, 仓根 node_modules]`。
注：SDK 52+ 的指南同时提供了自动探测形态（getDefaultConfig 默认行为）；本仓保留
显式配置（与指南的手动形态一致且已实测 export 通过），切自动探测前先跑一次 export 对比。

### 候选（本轮不抽）
`packages/domain`：流派词汇（SECTS 名单）、周边界逻辑（周一 05:00 北京时间）在
web `format.ts` 与 mobile 各有一份实现，抽取需单独一轮改造，先在此登记。

**边界**：共享包只放契约 / 令牌 / 逻辑。游戏数据一律后端下发，不进前端包。

## 部署（以 CI 为准）

GitHub 仓库建好后（远程待 marcus 提供），部署全走 Actions，本地不再手动部署：

| workflow | 触发 | 做什么 |
|---|---|---|
| `backend-deploy.yml` | push 到 `yanyun-signup/**`、`yanyun-web/**` | build web → `cp -r dist/.` 进 `yanyun-signup/public/`（cp 不删文件，admin 源文件天然保留）→ wrangler deploy |
| `og-deploy.yml` | push 到 `yanyun-og/**` | wrangler deploy（yanyun-og） |
| `mobile-update.yml` | push 到 `yanyun-mobile/**`、`packages/{blocks-core,theme,schema}/**` 或手动 | `eas update --channel preview`（稳定链接） |
| `web-check.yml` | push 到 `yanyun-web/**` | 只构建验证，不部署 |

需要的 GitHub Secrets（值由 marcus 在仓库 Settings 里加）：`EXPO_TOKEN`、
`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。

本地手动部署（CI 未就绪时的兜底，流程不变）：
```bash
source ~/.bashrc   # CLOUDFLARE_API_TOKEN
npm run build:web
cp -r yanyun-web/dist/. yanyun-signup/public/
cd yanyun-signup && npx wrangler deploy   # 看完整输出, 有 ERROR 就是没上
```

`yanyun-signup/public/` 里混着源码与构建产物：`hub-admin.*`、`gadmin.*`、
`style.css`、`favicon.svg`、`icons.svg` 是手写源码（进仓）；`index.html` 与
`assets/` 是 web 构建的拷贝（.gitignore 已挡，不进仓）。

## 密钥规矩（硬规矩）

- 绝不入库：`.dev.vars*`、`credentials.json`、`android-credentials/`、
  `*.keystore/*.p8/*.p12/*.pem`、`.eas-run/`。根 .gitignore 已全覆盖，
  提交前用 `git check-ignore` 复核、扫一遍 `git status` 清单。
- Discord webhook URL、Cloudflare token、Expo token 只许存在于：服务器配置
  （wrangler secret / D1 settings）、GitHub Secrets、本机 `~/.bashrc` 与
  `.eas-run/` 本地脚本。不许写进源码、README、memory 或聊天记录回显。
- `yanyun-mobile/.eas-run/` 是本机发布重试工具（本地专用，不进仓）；CI
  就绪后由 `mobile-update.yml` 取代。

## 其他

- Node 版本见 `.nvmrc`（24）。
- overlay 的 blocks 迁移计划：`yanyun-overlay/BLOCKS-PLAN.md`。
