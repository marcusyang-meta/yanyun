// 全站错误汇聚 · 自建最小监控 (2026-10-25 商业化审计 A7)
// 此前全站零可观测性: 提醒发送失败、DO 闹钟异常、GraphQL 未捕获异常
// 只能等用户报告。本模块把结构化错误落 D1 error_log 表, hub 超管门户
// 有只读「最近错误」区 (GET /api/hub/errors)。
//
// 捕获面 (各调用点显式接入):
//  - worker fetch 兜底与 Hono onError (未捕获异常) — worker.js
//  - GraphQL 执行错误 (业务文案错误除外) — graphql.js yoga 插件
//  - GuildHub alarm 逐车发送异常 — guildhub.js
//  - 发车提醒 webhook 失败 (与 events.reminder_error 并存) — reminder.js
//  - Expo 推送失败 — push.js
//
// 铁律: 记日志本身失败绝不影响主请求 — 本模块所有导出函数内部吞掉
// 一切异常; 调用点也不需要再包 try/catch (包了也无妨)。
// 留存封顶: 30 天 + 总行数上限, 写入时按计数节流触发懒清理, 不设 cron。
import {
  insertErrorLog, pruneErrorLog, listRecentErrors, countErrorsSince,
} from './db/repositories/errorLog.ts';

const KEEP_DAYS = 30;
const MAX_ROWS = 5000;
const PRUNE_EVERY = 50; // 每 50 次写入顺手清理一次 (单 isolate 计数)

let tableReady = null;
let writeCount = 0;

export function ensureErrorLogTable(db) {
  if (!tableReady) {
    tableReady = (async () => {
      try {
        await db.prepare(`CREATE TABLE IF NOT EXISTS error_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          at INTEGER NOT NULL,
          source TEXT NOT NULL DEFAULT '',
          name TEXT NOT NULL DEFAULT '',
          message TEXT NOT NULL DEFAULT '',
          tenant TEXT NOT NULL DEFAULT '',
          context TEXT NOT NULL DEFAULT '',
          stack TEXT NOT NULL DEFAULT ''
        )`).run();
        await db.prepare('CREATE INDEX IF NOT EXISTS idx_error_log_at ON error_log(at)').run();
      } catch { /* 建表失败静默: 监控不可用不能拖垮业务 */ }
    })();
  }
  return tableReady;
}

async function prune(db) {
  try {
    const cutoff = Math.floor(Date.now() / 1000) - KEEP_DAYS * 86400;
    await pruneErrorLog(db, cutoff, MAX_ROWS);
  } catch { /* 清理失败静默, 下次写入再试 */ }
}

const clip = (v, n) => String(v ?? '').slice(0, n);

/* logError(db, { source, error?, name?, message?, tenant?, context? })
 * error 传 Error 对象时自动取 name/message/stack; context 可传对象
 * (JSON 序列化, 截断) 或字符串。永不抛错, 返回是否写入成功。 */
export async function logError(db, entry = {}) {
  try {
    if (!db || typeof db.prepare !== 'function') return false;
    await ensureErrorLogTable(db);
    const e = entry.error;
    const name = clip(entry.name || (e && e.name) || '', 80);
    const message = clip(entry.message || (e && e.message) || (e ? String(e) : ''), 500);
    const stack = clip(e && e.stack ? e.stack : '', 1500);
    let context = '';
    if (entry.context != null) {
      context = typeof entry.context === 'string'
        ? clip(entry.context, 500)
        : clip(JSON.stringify(entry.context), 500);
    }
    await insertErrorLog(db, {
      at: Math.floor(Date.now() / 1000),
      source: clip(entry.source, 40), name, message,
      tenant: clip(entry.tenant, 40), context, stack,
    });
    writeCount++;
    if (writeCount % PRUNE_EVERY === 0) await prune(db);
    return true;
  } catch { return false; }
}

/* 门户只读: 最近 N 条 + 近 24h 总数。表不存在/查询失败 -> 空结果。 */
export async function recentErrors(db, limit = 50) {
  try {
    await ensureErrorLogTable(db);
    const errors = await listRecentErrors(db, limit);
    const dayAgo = Math.floor(Date.now() / 1000) - 86400;
    const last24h = await countErrorsSince(db, dayAgo);
    return { errors, last24h };
  } catch {
    return { errors: [], last24h: 0 };
  }
}
