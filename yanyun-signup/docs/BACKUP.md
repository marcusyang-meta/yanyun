# 数据备份与恢复 Runbook

## 备份是什么

- **格式** `yanyun-backup` v1（JSON）：按实体分组的行数据，键为 SQL 列名；
  BLOB 列编码为 `{ "$blob": "<base64>" }`（目前只有 `guild_avatars.bytes`）。
  实现在数据层 `src/domains/platform/backup.ts`，全程只走 repository/drizzle，
  不裸读库。
- **覆盖范围**：全部 27 个实体中的 26 个。唯一排除的是 `error_log`——它本身
  就是 30 天保留的临时监控数据，恢复陈旧错误行没有意义。
- **⚠️ 机密性**：备份文件含 `user_oauth` 的 refresh token、租户密码哈希、
  Discord webhook 全文。备份文件与 R2 桶按机密材料对待：桶不公开、只经
  hub 超管鉴权下载、本地副本不得外传或放公开网盘。

## 自动备份

- Worker cron `23 18 * * *`（每日 UTC 18:23 = 北京 02:23）触发
  `runScheduledBackup`：导出 → 写入 R2 桶 `yanyun-backups`
  （绑定 `BACKUPS`，2026-10-26 经 API 创建，R2 在本账户已开通，免费额度内）
  的 `daily/<YYYY-MM-DD>.json` → 在 `hub_audit_log` 留一条
  `actor=system, action=backup.scheduled`；失败进 `error_log`（source=backup）
  并让 cron 运行显形失败。
- **保留**：daily 最近 **14** 份（写入时自动修剪）；manual 快照不自动修剪。

## 手动操作（hub 门户「💾 数据备份」卡）

- **立即备份到 R2**：写 `manual/<时间戳>.json`，审计动作 `backup.run`。
- **导出下载**：流式导出当前数据为 JSON 附件（不落 R2），审计 `backup.export`。
- **快照列表/下载**：列出 daily+manual 快照并逐个下载，审计 `backup.download`。
- 对应 API（均需 hub token）：`POST /api/hub/backup/run`、
  `GET /api/hub/backup/export`、`GET /api/hub/backup/list`、
  `GET /api/hub/backup/download?key=<daily|manual/...>`（key 有白名单校验，
  路径穿越直接 404）。

## 恢复演练（已自动化，必须定期重跑）

```bash
cd yanyun-signup
node scripts/restore-drill.mjs
```

在隔离的 Miniflare 双 D1 + R2 上：种子源库（每实体 ≥1 行，含头像 BLOB 与
OAuth token）→ 走生产同路径 `runBackupToR2` 存入 R2 → 取回解析 →
`importBackup` 恢复进空目标库 → **逐实体三方对账（源数 == 文件数 == 恢复数）**
+ 头像字节哈希、refresh token、webhook、JSON 载荷、REAL 列抽查。
全等才 exit 0。2026-10-26 首次演练：26 个实体计数全等，11/11 检查通过。

## 真灾难恢复步骤

前提：目标必须是一个**空库**（恢复是整库重建，不是合并）。

1. **拿到备份文件**：hub 门户下载最新 daily 快照；或门户不可用时用有 R2
   权限的通道从 `yanyun-backups` 桶直接取对象。
2. **准备空库**：
   - 本地/演练：Miniflare D1，按 `scripts/restore-drill.mjs` 的 DDL 建表。
   - 新建生产 D1：本机 API token **无 D1 权限**，需在 Cloudflare 控制台
     手工建库（或换有权限的 token），再把新 `database_id` 写回
     `wrangler.toml` 走正常 PR 部署；建表用 `schema.sql` + `migrate-v2..v8`
     + 让 Worker 对空库跑一次（各 repository 的 lazy DDL 会补齐其余表）。
3. **灌数据**（二选一）：
   - 数据层路径（推荐）：仿 `restore-drill.mjs` 第 3–4 步，用
     `parseBackup` + `importBackup` 对目标库执行。
   - 纯 SQL 路径：`node scripts/backup-to-sql.mjs <backup.json> out.sql`
     生成 INSERT 转储，再用 `wrangler d1 execute <db> --file out.sql`
     （需要 D1 权限的凭据）灌入。
4. **对账**：对恢复后的库跑 `countEntities`（backup.ts）并与备份文件的
   `backupCounts` 逐实体比对，全等才切换流量；另抽查一个百业页、一次
   登录、一张头像图。
5. **善后**：在 `hub_audit_log` 之外另行记录事故与恢复所用快照 key
   （恢复进空库时旧审计表不在备份内则以备份文件中的为准）。

## 已知边界

- 同一 D1 库的逻辑损坏（误删行/写坏数据）可由快照恢复；账户级丢失靠
  R2 桶的独立存储兜底（桶与 D1 不同系统）。
- 快照是每日粒度：最坏丢失最近 24 小时内的写入。重要操作前可先在门户
  点「立即备份」。
- Durable Object（GuildHub/SeatHub）的内部状态不在备份内——它们只是
  实时通知与闹钟调度，真相源是 D1，DO 状态会按 D1 数据自愈重建。
