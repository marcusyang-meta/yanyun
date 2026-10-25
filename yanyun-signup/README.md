# 燕云十六声 · 百业报名小工具

百业(双十)的活动报名站: **百业活动报名 / 天赋组队报名 / 竞速报名 + 成绩榜**，
附带管理后台(活动增删改、报名名单、CSV 导出、成绩登记、站点设置)。

## 技术栈(全部 Cloudflare 免费套餐)

| 组件 | 免费额度 | 用途 |
|---|---|---|
| Cloudflare Workers | 每天 10 万次请求 | API + 托管前端 |
| Cloudflare D1 | 5GB 存储 / 每天 500 万行读 / 10 万行写 | 存活动、报名、成绩 |
| Workers 静态资源 | 免费 | 前端页面托管 |

一个百业几百人规模的报名站, 免费额度绰绰有余。**不花一分钱**。

## 本地开发

```bash
cd yanyun-signup
npm install
# 初始化本地 D1(只需一次)
npx wrangler d1 execute yanyun-signup --local --file=./schema.sql
# 启动(ADMIN_PASSWORD 换成你自己的管理密码)
npx wrangler dev --local --var ADMIN_PASSWORD:你的密码
```

打开 http://127.0.0.1:8787 , 管理后台在 `/admin.html`。

## 上线步骤(约 5 分钟)

1. 注册 Cloudflare 账号(免费): https://dash.cloudflare.com/sign-up
2. 本机登录: `npx wrangler login`
3. 创建线上数据库:
   ```bash
   npx wrangler d1 create yanyun-signup
   ```
   把输出里的 `database_id` 填到 `wrangler.toml` 里替换 `REPLACE_WITH_YOUR_D1_DATABASE_ID`。
4. 建表:
   ```bash
   npx wrangler d1 execute yanyun-signup --remote --file=./schema.sql
   ```
5. 设置管理员密码(存在 Cloudflare 加密存储, 不会进代码):
   ```bash
   npx wrangler secret put ADMIN_PASSWORD
   ```
6. 部署:
   ```bash
   npx wrangler deploy
   ```

部署成功后会给一个地址, 如 `https://yanyun-signup.你的账号.workers.dev`,
直接发到百业群里就能用。管理后台: 网址 + `/admin.html`, 用第 5 步设的密码登录。

可选: 在 Cloudflare 面板里给 Worker 绑定自己的域名, 也是免费的。

## 功能说明

**前台(所有人)**
- 三个页签: 百业活动 / 天赋组队 / 竞速报名
- 活动卡片: 时间、名额 x/y、报名中/已满/已截止状态
- 报名表单: 昵称、UID、职责(输出/承伤/治疗/随意)、流派/武器、联系方式(仅管理员可见)、备注; 竞速类多队伍名+队员名单
- 同一 UID 在同一活动只能报一次; 本人可用昵称+UID 取消报名
- 竞速活动有成绩榜(按用时自动排序), 支持录像链接

**后台(管理员)**
- 新建/编辑/删除活动, 一键截止或重开报名
- 查看完整报名名单(含联系方式)、移除报名、导出 CSV(Excel 可直接打开)
- 竞速成绩登记(支持 `3:42.15` / `1:02:03` / `225.5` 等格式)
- 站点设置: 百业名称、首页公告

## 安全与防刷

- 管理员密码用 HMAC 签名 Token(24 小时有效), 无需 KV
- 报名/登录接口按 IP 限流; 表单带蜜罐字段防机器人
- 所有输入长度截断、SQL 全部参数化

## 文件结构

```
yanyun-signup/
├── wrangler.toml      # Cloudflare 配置
├── schema.sql         # D1 建表语句
├── src/worker.js      # 后端 API
├── public/
│   ├── index.html     # 前台报名页
│   ├── admin.html     # 管理后台
│   ├── app.js         # 前台逻辑
│   ├── admin.js       # 后台逻辑
│   └── style.css      # 样式
└── README.md
```
