# Overlay 接入 Bloks-lite 动态体系 — 审计与迁移计划

> 状态：只读审计 + 计划（2026-10-25）。未改任何代码。
> 背景裁决：overlay 与手机版同体系——同一后端、同一套 Relay 带类型 GraphQL Block
> 对象（Block 接口 + 具体类型、服务端组树、客户端递归渲染到 basic element），
> overlay 只做自己的薄渲染器；不另起协议、不抢跑手机版的协议定义。

---

## 一、现状审计

### 1.1 工程构成（极小，无构建链）

| 文件 | 作用 |
|---|---|
| `main.js`（57 行） | Electron 主进程：窗口与全局热键 |
| `preload.js`（5 行） | contextBridge 只暴露穿透开关 IPC |
| `index.html`（约 280 行） | 全部 UI：单文件、原生 DOM、内联 vanilla JS，**没有 React、没有构建步骤、没有测试、没有 git** |
| `package.json` | electron ^44.9.2 + electron-builder；产物在 `dist/`（2026-10-21 构建：portable exe / NSIS setup / AppImage） |

### 1.2 原生框架行为（main.js）

- 无边框、透明、置顶（`alwaysOnTop` + `'screen-saver'` 级别），380px 宽、屏高 85%，贴右边缘停靠
- 默认**鼠标穿透**（`setIgnoreMouseEvents(true, {forward:true})`）；`Ctrl+Shift+O` 切换穿透/操作，`Ctrl+Shift+X` 隐藏/显示
- IPC 面只有一条：穿透状态（preload 暴露 `overlay.setClickThrough / onClickThrough`）
- 没有托盘、没有自更新、没有窗口位置持久化

### 1.3 界面与数据流（index.html）

overlay 本质是一个**只读攻略悬浮窗**，两个模式：

**普通模式**
- 首领攻略：`GET /api/bosses` 拉全量，在客户端用正则把 legacy 散文攻略按切段（`parseGuide`），分「机制 / 天赋」两页签展示；天赋页签靠另一条正则从散文里抠段
- 流派页签：`GET /api/demo/school-guides`（注意：slug 硬编码 `demo`，实际是全站共用数据的兼容路由），展示毕业词条（BiS）与输出轴，纯客户端拼 HTML

**队长模式**
- 同一份首领列表 + 手动计时器（纯本地）+ 把机制散文按数字编号切成阶段喊话卡

**关键事实**
- 全部数据流只有上面两个 GET，**无鉴权、无 GraphQL、无 WebSocket、无任何分组/报名/写操作**。历史上提过的「REST manage 删车 401」与本构建无关——这份代码根本不发写请求。
- 后端地址硬编码生产域名；无 slug/租户概念（除硬编码的 `demo`）。

---

## 二、Loading 卡死问题定位（已实证，非推测）

**根因：后端接口契约漂移，overlay 从未跟上。**

- overlay `index.html:126`：`bosses = (d.bosses || []).filter((b) => b.guide)` —— 只保留带 `guide` 正文的首领。
- 后端 `GET /api/bosses`（`yanyun-signup/src/worker.js:274`）注释明示「首领列表（轻量，**不含攻略正文**）」，SQL 只查 `has_guide` 标志位，正文只走 `GET /api/bosses/:id`。
- 2026-10-25 生产实测：`/api/bosses` 返回 49 个首领，字段为 `dungeon/has_guide/id/name/note/sort_order/source/talent`——**没有任何一行带 `guide` 字段**（其中 8 个 `has_guide=1`，正文在详情接口里完好，如 id 31 柏楚玉）。

后果链：`filter` 恒得空数组 → 两个首领下拉被写成空 HTML（初始的「加载中…」选项被抹掉）→ `showGuide()/showPhases()` 永远提前返回 → **普通模式首领页签和队长模式阶段区永远空白**。这与用户报告的「overlay 卡在加载」完全吻合——不是网络问题，是数据契约问题。

**次因（同类症状的脆弱点，迁移时一并消除）**
- 两处 fetch 都没有超时（`index.html:124, 189`）：请求挂起（非 reject）时 `catch` 永不触发，「加载中…」可以无限期停留。
- `loadSchoolGuides` 只在 `d.ok` 为真时更新下拉，任何 `ok:false` 响应都会把流派下拉永久留在「加载中…」。（注：该接口今日生产实测正常返回数据，流派页签本身没坏；坏的只有默认首领页签 + 队长模式。）

**附带记录（不在本次动手范围）**：legacy 最小修复路径存在——按 `has_guide` 过滤并逐个拉 `/api/bosses/:id`，或选中时懒拉详情；但 blocks 迁移会用结构化 bossPage 数据（Mechanic/Shout/Talent）整体替代散文解析（`parseGuide` 的正则与天赋抠取正则都将消失），不值得先修一遍 legacy。

---

## 三、协议现状（跟随对象，已落地大半）

手机版正在落地的协议已进入后端 `schema.graphql`（2026-10-25 实测在树）：

- `interface Block { children: [Block!]!}`，具体类型：SectionBlock / SectionHeaderBlock / TextBlock / BannerBlock / ChipRowBlock / GroupingCardBlock / SeatGridBlock / ActionButtonBlock / EmptyStateBlock / SpacerBlock / **FallbackBlock**（`schema.graphql:116-197`）
- 动作同为带类型对象：`interface Action` + NavigateAction / JoinAction / LeaveAction / DisbandAction
- 入口：`GroupingListPage.blocks(blocksVersion, weekOffset)`、`GroupingDetailPage.blocks(blocksVersion)`——shell 逐字段懒生成、文案走 i18n 目录、**组合即权限**（车头的树才含解散动作对象，客户端零权限分支）
- 移动端渲染器三件：`src/blocks/fragments.ts`（分层递归 fragment）、`src/blocks/actions.ts`（`ActionHandlers` 宿主注入接口 + `dispatchAction`）、`src/blocks/BlockRenderer.tsx`（递归 walker + 叶子视图）；Relay 环境在 `src/relay.ts`（Bearer + `x-locale` 头注入）

**overlay 的迁移 = 复用这套协议与渲染核心，只换叶子与宿主。** 不新造接口、不新造版本协商。

---

## 四、迁移映射

### 4.1 保持原生（Electron frame，不动或小动）

- 全部窗口行为：无边框/透明/置顶级别/穿透+forwarding/热键（`main.js` 原样）
- 顶部拖拽条与「队长/穿透」开关 chrome、队长模式的**计时器控件**（纯本地状态）
- 首领/流派**选择器控件本体**（下拉是 frame 控件；其选项数据可由 shell 普通字段供给——不必积木化选择器本身）

### 4.2 改为 block 驱动的内容区

| 现表面 | 数据来源（今） | 迁移动作 |
|---|---|---|
| 首领机制/天赋展示 | REST 列表 + 客户端散文正则 | bossPage shell 增加 `blocks` 字段，服务端把结构化 Mechanic/Shout/Talent 组树下发 |
| 流派毕业词条/输出轴 | REST `/api/demo/school-guides` 拼 HTML | 流派/毕业 shell 增加 `blocks` 字段（顺带去掉硬编码 `demo` slug 的兼容路由依赖） |
| 队长模式阶段喊话 | 客户端切散文 | 阶段内容走同一棵 boss 树（或队长专用组树）；计时仍原生 |

现有词表大半可直接复用：SectionBlock（阶段/分区）、SectionHeaderBlock、TextBlock（body/muted 变体）、BannerBlock、ChipRowBlock、EmptyStateBlock、SpacerBlock、FallbackBlock。

**可能需要扩的词表**（走同一 blocksVersion 协商机制，不私自加）：
- 喊话宏块：带「复制」意图的 callout（复制是宿主能力——Electron 剪贴板 trivial、RN 亦可；可能需要新增 `CopyTextAction` 动作类型）
- 词条表块：BiS 是「部位 → 词条」行表，用 Section+Text 硬拼可读性差，一个 DefinitionList/AffixTable 类积木更干净
- 阶段块：队长模式需要「当前阶段」高亮——高亮是客户端本地状态，积木只供内容，勿把瞬时状态塞进树

### 4.3 迁移前置（最大的一块）

overlay 渲染层目前是 **vanilla JS 单文件、零构建**。接 Relay blocks 的前提是先工程化：引入 Vite（或 electron-vite）+ React + Relay compiler，`main.js/preload.js` 保持不动。工程化后 DOM 叶子与网站同为 Chromium 渲染——**overlay 的叶子实现将来可与 web 复用**（web 是否吃 blocks 是另一个待拍板项，见 §六-5；overlay 不替 web 抢跑，但叶子按可复用方式组织）。

---

## 五、共享渲染核心的边界

建议抽一个平台无关的 block 核心（移动端现有三件为雏形），三端共用：

**进共享核心（纯 TS/GraphQL，零平台 API）**
- 递归 fragment 集（BlockNode 分层 fragment + 每种积木的 fragment + Action fragment）与 relay-compiler 生成类型——同一 schema 下逐字复用
- 树 walker 骨架：递归结构 + 「typename → 叶子视图」的**注册表接口**（移动端现在是 `LeafView` 内的 switch；抽成注册表后宿主各自登记叶子实现）
- 动作分发：`ActionHandlers` 接口 + `dispatchAction`（移动端已是宿主注入形态，可直接升为共享件）
- Relay environment 工厂：`Network.create` 的 fetchFn 形态（endpoint、Bearer token provider、`x-locale` 以注入参数传入）
- `blocksVersion` 常量与 FallbackBlock 的渲染契约

**留在宿主（平台特有）**
- 叶子视图实现：RN 用 View/Text/Pressable；overlay/web 用 DOM 元素 + 各自样式（overlay 是紧凑悬浮窗样式，与 web 也不完全同款）
- 动作 handler 实现：导航（RN 路由 / overlay 本地状态切换 / web 路由）、确认弹窗、剪贴板、宿主能力（overlay 的穿透开关经 preload IPC 暴露给渲染层）
- token 存储：RN SecureStore；Electron 用 `safeStorage`（OS 钥匙串加密）——若 overlay 上鉴权（见 §六-1）
- 实时连接：guide 内容不需要 WS；若 overlay 将来接车队树，再各自接 GuildHub（移动端 `live.ts` 的前台纪律可参考，代码不直接共用）

---

## 六、待用户拍板（按依赖顺序）

1. **overlay 要不要鉴权 / 要不要接车队面**（决定范围的总开关）
- 现状：完全匿名、纯公开攻略数据。攻略在后端本就是公开可读，**只迁攻略面不需要任何登录**，匿名树即完整树。
- 一旦要显示「我百业的车 / 我的报名」或在 overlay 里报名/离队（写动作对象只会出现在本人的树里），就必须登录。移动端交接已存在（`auth.js` 的 `?app=` 精确白名单 → 深链回跳带 JWT）；Electron 等价方案需新增一条白名单回调（自定义协议 `yanyun-overlay://` 或本地回环），且**要在 Discord 开发者后台登记新的 redirect URI（只有账号持有人能做）**，token 落盘需 `safeStorage` 加密。
- 请拍板：(a) 先只做匿名攻略面（推荐作第一期）；(b) 一步到位带登录 + 车队面。

2. **Electron 还是 Tauri，先迁 blocks 还是先换壳**
- 此前倾向 Tauri 但从未落地。留 Electron：窗口行为代码现成、渲染层与 web 同 Chromium、叶子/Relay 生态复用最大；代价是包体积（现有 portable exe 已是百 MB 级）与内存。
- 换 Tauri：体积/内存小一个量级；代价是穿透 forwarding、`screen-saver` 级置顶等窗口行为要在 Rust 壳里逐项重验，且「换壳」与「迁 blocks」两件大事叠加。
- 本计划建议的顺序：**先在 Electron 上完成 blocks 迁移**——渲染层按宿主无关方式组织后，换壳只剩主进程等价物重写，可独立成第二步。但顺序最终由用户定。

3. **攻略词表扩展的时机**
- 喊话复制、词条表、阶段块是否进 v1 词表，还是先用现有通用积木拼出第一版、扩展跟 blocksVersion 迭代。建议等手机版协议 v1 验收冻结后再扩，避免两边同时动词表。

4. **队长模式与提醒系统的关系**
- 队长模式现在是手动计时 + 静态阶段卡。若接车队面（拍板 1 选 b），阶段喊话可与发车提醒（T−10 DO alarm）联动；若只做攻略面，队长模式维持纯本地计时。随拍板 1 一并定。

5. **web 是否也吃 blocks**
- 此前已向用户提出、尚未拍板。overlay 的 DOM 叶子若按可复用组织，将来 web 迁
...[truncated 15597 chars]