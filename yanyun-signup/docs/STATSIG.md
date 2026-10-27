# Statsig 控制台配置清单（平台 gate 第一期 → 第二期切换）

平台 gate 的策略已从代码迁到 Statsig（封装在 `src/domains/platform/gates.ts`，
provider 实现只在 `gates-statsig.ts`）。第一期代码已上线：**未完成下面
控制台配置之前，生产行为与迁移前逐字一致**——封装在未配置 / 不可用 /
gate 未定义时一律回落到本地判定。本清单由平台运营者（marcus）本人在
Statsig 控制台完成；代码侧（我方）在清单完成后做第二期切换 PR。

不要做的事：不要把任何密钥粘贴进仓库、issue 或普通聊天；不要开
Metric Lifts（本期只接 gate 求值，不接实验）；不要改下面列出的
gate key 与属性名——代码按这些名字问，改名 = 封装弃权回落。

---

## 步骤 1 — 建账号与项目（Statsig 侧）

1. 打开 https://console.statsig.com 注册（Developer 免费档即可：
   gates 与检查次数 unlimited，足够本期与第二期）。
2. 新建 Project，名字自定（建议 `yanyun`）。
3. 记下 **Project ID**：Project Settings → Project Details 里可见。
   这个 ID 后面两处要用：Config Sync 的 KV key 是 `statsig-<Project ID>`，
   我方第二期 PR 会把 `STATSIG_PROJECT_ID` 以它落进 wrangler `[vars]`。

## 步骤 2 — 建两个 gate（Feature Gates → Create）

属性口径（代码求值时传入，控制台规则照此写）：

| 属性 | 位置 | 取值 | 含义 |
|---|---|---|---|
| （User ID） | unit id | 百业 slug | 分桶单位；ID Overrides 按 slug 强制开/关单个百业 |
| `paygate` | Private Attribute | `on` / `off` | 平台总闸的事实（hub 开关，我方数据） |
| `plan` | Private Attribute | `premium` / `free` | 生效权益的事实（读时过期已在我方判定） |

两个属性都是 Private Attribute：求值在本地完成，属性值不会随日志
离开平台（封装侧已关闭曝光日志，见 gates-statsig.ts）。

### Gate 1：`premium_access`

语义：该百业的 Premium 面「解锁」（premiumGate 的反面）。

规则按顺序建（命中即止，都是 Pass 100%）：

1. Rule 名 `paygate-off-parity`：条件 `paygate` **is any of** `off` → Pass
2. Rule 名 `premium-plan`：条件 `plan` **is any of** `premium` → Pass
3. Default（兜底）：Fail

### Gate 2：`premium_active`

语义：该百业正在以付费档生效（限额解析用）。

1. Rule 名 `paygate-on-and-premium`：条件 `paygate` **is any of** `on`
   **AND** `plan` **is any of** `premium` → Pass
2. Default（兜底）：Fail

两个 gate 都保持 Enabled。急停 = 在控制台把 gate 关掉（Disable），
或把规则改 Fail——不需要发版；传播延迟第二期实测后记入本文。

注记（求值时机）：平台总闸 OFF 时，代码内的主开关短路先行
（premiumGate / isPremiumActive 直接返回迁移前结论，不发生求值），
所以求值只在总闸 ON 时发生、paygate 属性恒为 `on`。上面
premium_access 的规则 1（paygate-off parity）是与短路同义的
镜像规则，为直接求值者保留，照建即可。

## 步骤 3 — 建 Cloudflare KV namespace（Cloudflare 侧）

部署 token 没有 KV 权限，这一步只能在 dashboard 做：

1. Cloudflare Dashboard → Storage & Databases → Workers KV → Create
   namespace，名字：`yanyun-statsig`
2. 记下它的 **Namespace ID**（下一步要用）。我方第二期 PR 会用这个 ID
   把 wrangler.toml 里注释掉的 `STATSIG_KV` binding 打开。

## 步骤 4 — 开 Config Sync（Statsig → Cloudflare KV）

1. 为 Statsig 单独建一个 **限定范围的 Cloudflare API token**
   （My Profile → API Tokens → Create Token → Custom token）：
   - Permissions：Account → **Workers KV Storage** → **Edit**
   - Account Resources：只选本账号
   - 名字建议 `statsig-config-sync`。这个 token 只交给 Statsig，
     不要与部署 token 混用。
2. Statsig 控制台：Project Settings → Integrations → **Cloudflare**，
   填入：Cloudflare Account ID、步骤 3 的 KV Namespace ID、
   上面的 API token，启用同步。
3. 验证：同步完成后（官方口径秒级到一分钟），在 Cloudflare 的
   KV namespace 里应出现 key `statsig-<Project ID>`。出现即同步通。

## 步骤 5 — Server Secret Key 交付（安全通道）

1. Statsig 控制台：Project Settings → API Keys → 取 **Server Secret
   Key**（`secret-...` 开头）。**不要**用 Client Key——代码只认
   server secret。
2. 经安全通道（密码管理器共享）交付，不要贴进聊天/仓库。
3. 收到后我方执行 `wrangler secret put STATSIG_SERVER_SECRET`
   落到生产 Worker，并随第二期 PR 一起：打开 `STATSIG_KV` binding、
   落 `STATSIG_PROJECT_ID` 到 `[vars]`。

## 第二期切换时我方做的事（清单完成后）

1. 第二期 PR：wrangler.toml 打开 KV binding + `[vars]` 项目 ID
   （secret 已由步骤 5 落好）。
2. 真规则回环验证：harness 等价套件 + 生产探针逐项对表。
3. **急停传播实测**：控制台 Disable `premium_access` → 计时到生产
   判定翻转（新 isolate 读新规则的实际延迟），数字记回本文。
4. 回滚预案：任一步异常，删 binding/vars 即回到第一期状态
   （全回落本地判定），不需要回滚代码。
