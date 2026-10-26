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
- 消费者：yanyun-mobile（`src/blocks/` 是宿主垫片：RN 叶子 + 动作绑定）。
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

生产入口：主站/API `https://yanyun.app`，OG 图片 `https://og.yanyun.app`（Custom Domain 分别绑 Worker `yanyun` / `yanyun-og`，绑定写在各自 wrangler.toml）。旧 `yanyun.tbdlab.workers.dev` / `yanyun-og.tbdlab.workers.dev` 迁移期双绑保留、不跳转。

部署全走 GitHub Actions。后端/OG 实行两段式发布（marcus 裁决 2026-10-25）：
**先上 preview 真渲染验收，人工 promote 才进 prod**，push 永远不直达 prod。

| workflow | 触发 | 做什么 |
|---|---|---|
| `backend-deploy.yml` | push（master）到 `yanyun-signup/**`、`yanyun-web/**`、`packages/schema/**` | build web 一次 → 同步 dist 进 `public/` → `wrangler preview` 发到稳定 Preview `release`（https://release-yanyun.tbdlab.workers.dev），并把产物存为 artifact `backend-public`（含源 commit 的 manifest） |
| `backend-promote.yml` | 手动，填 backend-deploy 的 run ID | 按 run ID 取回**同一批 artifact**，在 manifest 记录的源 commit 上 `wrangler deploy` 进 prod（不重新构建） |
| `og-deploy.yml` / `og-promote.yml` | push（master）到 `yanyun-og/**` / 手动填 version_id | versions upload → 手动 versions deploy 晋级，promote 同 job 内接着 `wrangler triggers deploy` 应用 routes/自定义域名/cron（versions deploy 不应用 triggers，平台行为）。OG 无 Durable Object，Version 机制可用，故不走 Preview 式 |
| `mobile-update.yml` | push 到 `yanyun-mobile/**`、`packages/{blocks-core,theme,schema}/**` 或手动 | `eas update --channel preview`（稳定链接） |
| `web-check.yml` | push（master）到 `yanyun-web/**` | 只构建验证，不部署 |

后端为什么不用 Version URL 验收：本 Worker 实现了 Durable Object
（SeatHub/GuildHub），Cloudflare 不为 DO Worker 生成 Version URL。Preview
（`wrangler preview`）是官方的 DO 预览路线：DO 按 Preview 自动隔离、Cron
不在 Preview 运行；但 D1 按 database_id 与生产共享（账号建不了隔离库，
见 `yanyun-signup/wrangler.toml` 的 `[previews]` 块），所以 preview 验收
纪律是**匿名只读浏览**，不登录、不发 mutation。

需要的 GitHub Secrets（已配）：`EXPO_TOKEN`、`CLOUDFLARE_API_TOKEN`、
`CLOUDFLARE_ACCOUNT_ID`。

**生产变更只走 CI（marcus 规矩，2026-10-25）**：所有生产变更只经
GitHub Actions（`backend-deploy` → `backend-promote`、`og-deploy` →
`og-promote`、`mobile-update`）。**禁止在本地用 `wrangler deploy` /
`wrangler triggers deploy` / `wrangler versions *` 等命令直接作用于
生产**——CI 故障时先修 CI，不得本地直部署兜底。promote 的人工
dispatch 是审批闸（人做决定、CI 执行），不算手动部署。例外只有
secret 类配置（`wrangler secret`）：仍由人工经安全通道处理，不进 CI。
本地 wrangler 只许用于 dev / preview 等非生产用途。

`yanyun-signup/public/` 里混着源码与构建产物：`hub-admin.*`、`gadmin.*`、
`style.css`、`favicon.svg`、`icons.svg` 是手写源码（进仓）；`index.html` 与
`assets/` 是 web 构建产物（.gitignore 已挡，不进仓），由
`yanyun-signup/scripts/sync-public.mjs` 同步——以 dist 为准对齐，旧哈希
文件会被删除，admin 源文件不碰（旧 `cp -r` 只叠不删的做法已废弃）。

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
