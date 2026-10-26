// 百业自定义头像 (2026-10-25 用户裁决: 管理员可直接上传, 平台无
// 正式 logo 前各百业先用自己的)。图片 blob 存 D1 新表 guild_avatars
// (不上 R2: 账户侧开通需要面板动作, 本面上线不依赖它), 主 Worker
// 公开读路径 /api/guilds/:slug/avatar 出图 (头像是公开品牌图, 与 OG
// 分享图同性质, 可匿名读)。GraphQL avatarUrl / Webhook 发送身份 /
// OG 卡面绘入都以本表为准: 有头像才有 URL, 没有一律 null/回退默认。

import {
  getGuildAvatarMetaRow, getGuildAvatarRow, putGuildAvatarRow, deleteGuildAvatarRow,
} from './db/repositories/guildAvatars.ts';
import { getTenantRow } from './db/repositories/tenants.ts';

export const AVATAR_MAX_BYTES = 400 * 1024; // 存入 blob 上限 (前端已裁方缩到 ≤512)
export const AVATAR_CONTENT_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const SITE_ORIGIN = 'https://yanyun.app'; // 与 worker.js 的 SITE_URL 同口径 (规范域名)

/* ---------- 懒 DDL (与 error_log / push_tokens 同套路) ---------- */
let tableReady: Promise<void> | null = null;
export function ensureGuildAvatarsTable(db: any) {
  if (!tableReady) {
    tableReady = (async () => {
      try {
        await db.prepare(`CREATE TABLE IF NOT EXISTS guild_avatars (
          tenant TEXT PRIMARY KEY,
          content_type TEXT NOT NULL,
          bytes BLOB NOT NULL,
          hash TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        )`).run();
      } catch { /* 建表失败静默: 头像面不可用不能拖垮业务 */ }
    })();
  }
  return tableReady;
}

/* ---------- 类型嗅探: 只认魔数, 不信客户端声明的 content-type ---------- */
export function sniffAvatarType(buf: any): string | null {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return 'image/png';
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  return null;
}

export async function sha256hex(bytes: any): Promise<string> {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const d = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/* 版本化路径: ?v= 为内容 hash 前 8 位 — 头像一换 URL 就变, 配合长缓存
 * 不会读到旧图; 无头像返回 null (调用方据此回退默认品牌面)。 */
export function avatarPath(slug: string, hash: string | null | undefined): string | null {
  if (!hash) return null;
  return `/api/guilds/${encodeURIComponent(slug)}/avatar?v=${String(hash).slice(0, 8)}`;
}
export function avatarPublicUrl(slug: string, hash: string | null | undefined): string | null {
  const p = avatarPath(slug, hash);
  return p ? SITE_ORIGIN + p : null;
}

/* 元信息 (不取 blob): GraphQL 字段 / webhook 身份的廉价查询 */
export async function getGuildAvatarMeta(db: any, tenant: string) {
  await ensureGuildAvatarsTable(db);
  return getGuildAvatarMetaRow(db, tenant).catch(() => null);
}

/* 全行 (含 blob 字节): 公开出图路径用。D1 BLOB 回读为 ArrayBuffer。 */
export async function getGuildAvatar(db: any, tenant: string) {
  await ensureGuildAvatarsTable(db);
  return getGuildAvatarRow(db, tenant).catch(() => null);
}

export async function putGuildAvatar(db: any, tenant: string, contentType: string, bytes: any) {
  await ensureGuildAvatarsTable(db);
  const hash = await sha256hex(bytes);
  const nowSec = Math.floor(Date.now() / 1000);
  await putGuildAvatarRow(db, tenant, contentType, bytes, hash, nowSec);
  return { hash, updatedAt: nowSec };
}

export async function deleteGuildAvatar(db: any, tenant: string) {
  await ensureGuildAvatarsTable(db);
  await deleteGuildAvatarRow(db, tenant);
}

/* Webhook 发送身份 (提醒 + 传家宝共用 postWebhook): 该百业有头像 ->
 * username = 百业显示名, avatar_url = 头像公开 URL; 没头像 -> null,
 * 调用方回退平台默认身份 (燕云百业 + OG hub 图)。 */
export async function webhookIdentity(db: any, slug: string) {
  const meta = await getGuildAvatarMeta(db, slug).catch(() => null);
  if (!meta) return null;
  const t = await getTenantRow(db, slug).catch(() => null);
  const name = t && String(t.guild_name || '').trim();
  return {
    username: name || undefined,
    avatarUrl: avatarPublicUrl(slug, meta.hash),
  };
}
