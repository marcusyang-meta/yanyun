/* ===================================================
 * tenants 实体的数据层访问 (Repository)。
 *
 * 业务代码禁止直接拼 SQL 访问 tenants: 全部走本文件的函数。返回行
 * 沿用旧形态的 snake_case 键, 调用点零感知。单行读取未命中返回 null
 * (drizzle 模板模式的 .get() 未命中为 null/undefined, 在此归一)。
 * 错误容忍仍归调用方 (与一期口径一致: 调用点 .catch 照旧)。
 *
 * 写法沿用一期 settings 的 sql 模板惯用法, 且列引用一律用
 * sql.identifier 裸列名内插: 生成的 SQL 与被替代的旧语句同形
 * (大写关键字 + 裸列名), harness FakeDB 的按形路由因此无需感知
 * 数据层; 同时 INSERT 列名单 / SET 左值本就必须是裸列名 (一期
 * 表限定列名 bug 的教训)。
 *
 * deleteTenantCascade 是租户生命周期的组合操作: 在数据层内部
 * 组合 signups / results / events / tenants 四实体的删除 (results
 * 本期没有独立 repository, 其删除只作为级联的一环出现在这里),
 * 保持旧 batch 的顺序语义 (先报名/结果, 再车队, 最后租户本身)。
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../client.ts';

const { tenants, events, signups, results } = schema;
const col = (name: string) => sql.identifier(name);

export interface TenantRow {
  slug: string;
  guild_name: string;
  password_hash: string;
  announcement: string;
  created_at: string;
  discord_webhook: string | null;
  slogan: string | null;
  master_name: string | null;
  logo_url: string | null;
  bg_image_url: string | null;
  feature_fixed_teams: number | null;
}

/* 全行读取 (旧各处 SELECT 子集读取的超集; 消费方只读自己要的字段)。 */
export async function getTenantRow(d1: D1Database, slug: string): Promise<TenantRow | null> {
  const db = createDb(d1);
  const row = await db.get<TenantRow>(
    sql`SELECT * FROM ${tenants} WHERE ${col('slug')} = ${slug}`,
  );
  return row ?? null;
}

/* 仅存在性读取 (旧 SELECT slug FROM tenants)。 */
export async function getTenantSlug(d1: D1Database, slug: string): Promise<{ slug: string } | null> {
  const db = createDb(d1);
  const row = await db.get<{ slug: string }>(
    sql`SELECT ${col('slug')} FROM ${tenants} WHERE ${col('slug')} = ${slug}`,
  );
  return row ?? null;
}

/* 全部租户 slug, 按创建时间升序 (旧 SELECT slug ... ORDER BY created_at)。 */
export async function listTenantSlugs(d1: D1Database): Promise<{ slug: string }[]> {
  const db = createDb(d1);
  const rows = await db.all<{ slug: string }>(
    sql`SELECT ${col('slug')} FROM ${tenants} ORDER BY ${col('created_at')} ASC`,
  );
  return rows || [];
}

/* 租户目录行 (公开导航与门户百业列表共用同一旧形态)。 */
export async function listTenantsDirectory(d1: D1Database): Promise<{
  slug: string; guild_name: string; announcement: string;
  slogan: string | null; created_at: string;
}[]> {
  const db = createDb(d1);
  const rows = await db.all<{
    slug: string; guild_name: string; announcement: string;
    slogan: string | null; created_at: string;
  }>(
    sql`SELECT ${col('slug')}, ${col('guild_name')}, ${col('announcement')}, ${col('slogan')}, ${col('created_at')}
        FROM ${tenants} ORDER BY ${col('created_at')} ASC`,
  );
  return rows || [];
}

/* slug + 名称全表 (传家宝评估遍历用; 旧查询无排序, 保持无排序)。 */
export async function listTenantNames(d1: D1Database): Promise<{
  slug: string; guild_name: string;
}[]> {
  const db = createDb(d1);
  const rows = await db.all<{ slug: string; guild_name: string }>(
    sql`SELECT ${col('slug')}, ${col('guild_name')} FROM ${tenants}`,
  );
  return rows || [];
}

/* 超管门户租户列表: 带每租户车队数的组合读 (旧查询含 t/e 别名, 逐字保形)。 */
export async function listTenantsHubAdmin(d1: D1Database): Promise<{
  slug: string; guild_name: string; announcement: string;
  created_at: string; event_count: number;
}[]> {
  const db = createDb(d1);
  const rows = await db.all<{
    slug: string; guild_name: string; announcement: string;
    created_at: string; event_count: number;
  }>(
    sql`SELECT t.slug, t.guild_name, t.announcement, t.created_at,
      (SELECT COUNT(*) FROM ${events} e WHERE e.tenant = t.slug) AS event_count
     FROM ${tenants} t ORDER BY t.created_at ASC`,
  );
  return rows || [];
}

/* 建业 (唯一建业路径 GraphQL createGuild 用; 字段与旧 INSERT 一致)。 */
export async function insertTenant(
  d1: D1Database,
  row: { slug: string; guildName: string; passwordHash: string; announcement: string },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${tenants} (${col('slug')}, ${col('guild_name')}, ${col('password_hash')}, ${col('announcement')})
        VALUES (${row.slug}, ${row.guildName}, ${row.passwordHash}, ${row.announcement})`,
  );
}

/* 提醒/百业管理员共用的 webhook 更新 (旧 UPDATE ... SET discord_webhook)。 */
export async function updateTenantWebhook(d1: D1Database, slug: string, webhook: string): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${tenants} SET ${col('discord_webhook')} = ${webhook} WHERE ${col('slug')} = ${slug}`,
  );
}

/* 百业资料更新 (管理员 profile 端点; 六字段整组覆盖, 与旧 UPDATE 一致)。 */
export async function updateTenantProfile(
  d1: D1Database,
  slug: string,
  p: {
    guildName: string; announcement: string; slogan: string;
    masterName: string; logoUrl: string; bgImageUrl: string;
  },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${tenants} SET ${col('guild_name')} = ${p.guildName}, ${col('announcement')} = ${p.announcement},
        ${col('slogan')} = ${p.slogan}, ${col('master_name')} = ${p.masterName},
        ${col('logo_url')} = ${p.logoUrl}, ${col('bg_image_url')} = ${p.bgImageUrl}
        WHERE ${col('slug')} = ${slug}`,
  );
}

/* 固定队功能开关列 (旧 UPDATE ... SET feature_fixed_teams = ?; 值由调用方给 1/0)。 */
export async function updateTenantFixedTeams(d1: D1Database, slug: string, flag: number): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${tenants} SET ${col('feature_fixed_teams')} = ${flag} WHERE ${col('slug')} = ${slug}`,
  );
}

/* 删除租户级联 (旧 hub DELETE 的四语句 batch, 顺序保持, 逐条执行)。 */
export async function deleteTenantCascade(d1: D1Database, slug: string): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`DELETE FROM ${signups} WHERE ${col('event_id')} IN (SELECT ${col('id')} FROM ${events} WHERE ${col('tenant')} = ${slug})`,
  );
  await db.run(
    sql`DELETE FROM ${results} WHERE ${col('event_id')} IN (SELECT ${col('id')} FROM ${events} WHERE ${col('tenant')} = ${slug})`,
  );
  await db.run(
    sql`DELETE FROM ${events} WHERE ${col('tenant')} = ${slug}`,
  );
  await db.run(
    sql`DELETE FROM ${tenants} WHERE ${col('slug')} = ${slug}`,
  );
}
