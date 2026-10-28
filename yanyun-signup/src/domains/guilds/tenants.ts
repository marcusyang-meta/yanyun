/* ===================================================
 * Data-layer access (Repository) for the tenants entity.
 *
 * Business code must not hand-roll SQL against tenants;
 * everything goes through this file. Rows keep the legacy
 * snake_case keys; a single-row read miss returns null (.get()
 * misses are null/undefined in the drizzle template pattern and
 * are normalized here). Error tolerance stays with the caller
 * (call sites keep their .catch, as before).
 *
 * Column references are all interpolated as bare names via
 * sql.identifier: the generated SQL keeps the shape of the
 * statements it replaced (uppercase keywords + bare column
 * names), so the harness FakeDB's shape routing needs no
 * awareness of the data layer; INSERT column lists / SET
 * left-hand sides must be bare names anyway (the lesson of the
 * table-qualified-column bug).
 *
 * deleteTenantCascade is the tenant lifecycle's composite
 * operation: it composes the signups / results / events /
 * tenants deletes inside the data layer (results has no
 * standalone repository; its delete appears only as part of this
 * cascade), preserving the old batch order (signups/results
 * first, then groupings, then the tenant itself).
 * =================================================== */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

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
  recruit_open: number;
}

/* Full-row read (a superset of the legacy per-site SELECT subsets; consumers read only the fields they need). */
export async function getTenantRow(d1: D1Database, slug: string): Promise<TenantRow | null> {
  const db = createDb(d1);
  const row = await db.get<TenantRow>(
    sql`SELECT * FROM ${tenants} WHERE ${col('slug')} = ${slug}`,
  );
  return row ?? null;
}

export async function getTenantSlug(d1: D1Database, slug: string): Promise<{ slug: string } | null> {
  const db = createDb(d1);
  const row = await db.get<{ slug: string }>(
    sql`SELECT ${col('slug')} FROM ${tenants} WHERE ${col('slug')} = ${slug}`,
  );
  return row ?? null;
}

/* All tenant slugs, ascending by creation time. */
export async function listTenantSlugs(d1: D1Database): Promise<{ slug: string }[]> {
  const db = createDb(d1);
  const rows = await db.all<{ slug: string }>(
    sql`SELECT ${col('slug')} FROM ${tenants} ORDER BY ${col('created_at')} ASC`,
  );
  return rows || [];
}

/* Tenant directory rows (shared by public navigation and the portal guild list, same legacy shape).
 * recruit_open rides along: the platform-home recruit directory
 * filters on it (open guilds only) while the other directory
 * consumers simply ignore the extra field. */
export async function listTenantsDirectory(d1: D1Database): Promise<{
  slug: string; guild_name: string; announcement: string;
  slogan: string | null; created_at: string; recruit_open: number;
}[]> {
  const db = createDb(d1);
  const rows = await db.all<{
    slug: string; guild_name: string; announcement: string;
    slogan: string | null; created_at: string; recruit_open: number;
  }>(
    sql`SELECT ${col('slug')}, ${col('guild_name')}, ${col('announcement')}, ${col('slogan')}, ${col('created_at')}, ${col('recruit_open')}
        FROM ${tenants} ORDER BY ${col('created_at')} ASC`,
  );
  return rows || [];
}

/* The recruitment switch (admin recruit tab write path): 1 = open
 * (listed in the home recruit directory, applications accepted),
 * 0 = closed (the default for every guild). */
export async function updateTenantRecruitOpen(d1: D1Database, slug: string, open: boolean): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${tenants} SET ${col('recruit_open')} = ${open ? 1 : 0} WHERE ${col('slug')} = ${slug}`,
  );
}

/* slug + name across the table (heirloom evaluation traversal; the legacy query had no ordering — keep it unordered). */
export async function listTenantNames(d1: D1Database): Promise<{
  slug: string; guild_name: string;
}[]> {
  const db = createDb(d1);
  const rows = await db.all<{ slug: string; guild_name: string }>(
    sql`SELECT ${col('slug')}, ${col('guild_name')} FROM ${tenants}`,
  );
  return rows || [];
}

/* Super-admin portal tenant list: combined read with per-tenant grouping counts (legacy query with t/e aliases, shape preserved). */
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

/* Create a guild (used by the only creation path, GraphQL createGuild; fields match the legacy INSERT). */
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

export async function updateTenantWebhook(d1: D1Database, slug: string, webhook: string): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${tenants} SET ${col('discord_webhook')} = ${webhook} WHERE ${col('slug')} = ${slug}`,
  );
}

/* Guild profile update (admin profile endpoint; six fields overwritten as a group, matching the legacy UPDATE). */
export async function updateTenantProfile(
  d1: D1Database,
  slug: string,
  p: {
    guildName: string; announcement: string; slogan: string;
    masterName: string; logoUrl: string; bgImageUrl: string;
  },
): Promise<void> {
  // All six fields are written, matching the legacy UPDATE. The three
  // profile columns (master_name / logo_url / bg_image_url) were
  // phantom entity fields for a long time — named here before DDL
  // created them, so this UPDATE threw against production and guild
  // profile saves were broken until PR #35 narrowed the write as a
  // stopgap. migrations/0002_tenant_profile_fields.sql adds the real
  // columns, so the full write is safe again.
  const db = createDb(d1);
  await db.run(
    sql`UPDATE ${tenants} SET ${col('guild_name')} = ${p.guildName}, ${col('announcement')} = ${p.announcement},
        ${col('slogan')} = ${p.slogan}, ${col('master_name')} = ${p.masterName},
        ${col('logo_url')} = ${p.logoUrl}, ${col('bg_image_url')} = ${p.bgImageUrl}
        WHERE ${col('slug')} = ${slug}`,
  );
}

/* Delete-tenant cascade: one D1 batch inside the repository
 * (restores the group atomicity lost when run
 * statement-by-statement: any failure rolls back the whole
 * batch). */
export async function deleteTenantCascade(d1: D1Database, slug: string): Promise<void> {
  await d1.batch([
    d1.prepare('DELETE FROM signups WHERE event_id IN (SELECT id FROM events WHERE tenant = ?)').bind(slug),
    d1.prepare('DELETE FROM results WHERE event_id IN (SELECT id FROM events WHERE tenant = ?)').bind(slug),
    d1.prepare('DELETE FROM events WHERE tenant = ?').bind(slug),
    d1.prepare('DELETE FROM tenants WHERE slug = ?').bind(slug),
  ]);
}
