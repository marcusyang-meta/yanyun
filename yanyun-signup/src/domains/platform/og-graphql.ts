/* Platform GraphQL: the OG card data channel — the narrow public
 * read surface the OG worker uses instead of the retired REST reads
 * (/api/tenants, /api/:slug/events, /api/:slug/events/:id). Only the
 * fields the cards already print are exposed: guild name/slogan are
 * public by product ruling (2026-10-25); the car card carries no
 * signup details (never nicknames). dev_only guilds do not exist from
 * non-dev origins, exactly as everywhere else. */
import type { Context } from './context.ts';
import { ShellBase, getTenantSetting, isDevRequest, s } from './graphql-base.ts';
import { getTenantRow } from '../guilds/index.ts';
import { listTenantsDirectory } from '../guilds/tenants.ts';
import { getDevOnlySlugs } from './http.ts';
import {
  listEventsWeekView, getEventRowByTenant, countSignupsByEvent,
} from '../groupings/index.ts';

async function ogTenant(ctx: Context, slug: string) {
  const t = await getTenantRow(ctx.env.DB, s(slug, 40));
  if (!t) return null;
  const devOnly = (await getTenantSetting(ctx.env.DB, t.slug, 'dev_only')) === '1';
  if (devOnly && !isDevRequest(ctx.request)) return null;
  return t;
}

export class OgGuildCardShell extends ShellBase {
  genExists(){ return !!this.data.tenant; }
  genName(){ return this.data.tenant ? this.data.tenant.guild_name || '' : ''; }
  genSlogan(){ return this.data.tenant ? this.data.tenant.slogan || '' : ''; }
  /* Same rows the retired REST week list returned (status NOT IN
   * draft/completed, type filter applied in the repository), counted —
   * byte-parity with the old OG fetchTeamCount. */
  async genWeekActivityCount({ fromUtc, toUtc }: any){
    if (!this.data.tenant) return 0;
    const rows = await listEventsWeekView(this.db, {
      tenant: this.data.tenant.slug, type: 'activity', from: fromUtc, to: toUtc,
    });
    return rows.length;
  }
}

export class OgCarCardShell extends ShellBase {
  genTitle(){ return this.data.title || ''; }
  genType(){ return this.data.type || ''; }
  genStartsAtUtc(){ return this.data.starts_at_utc ?? null; }
  genStartsAtText(){ return this.data.starts_at || ''; }
  genDungeonName(){ return this.data.dungeon || ''; }
  genOccupiedCount(){ return this.data.occupiedCount || 0; }
  genMaxSlots(){ return this.data.max_slots || 0; }
  genStatus(){ return this.data.status || ''; }
}

export const ogCardResolvers = {
  Query: {
    /* Slug enumeration for the OG cache warmer — the retired
     * /api/tenants list's exact visibility rule (dev_only guilds
     * only from dev origins), narrowed to slugs only. */
    ogGuildSlugs: async (_: any, _a: any, ctx: Context) => {
      const rows = await listTenantsDirectory(ctx.env.DB);
      if (isDevRequest(ctx.request)) return rows.map((r: any) => r.slug);
      const devSet = await getDevOnlySlugs(ctx.env.DB);
      return rows.filter((r: any) => !devSet.has(r.slug)).map((r: any) => r.slug);
    },
    ogGuildCard: async (_: any, { slug }: any, ctx: Context) => {
      const tenant = await ogTenant(ctx, slug);
      return new OgGuildCardShell(ctx, { tenant });
    },
    ogCarCard: async (_: any, { slug, id }: any, ctx: Context) => {
      const tenant = await ogTenant(ctx, slug);
      if (!tenant) return null;
      const ev = await getEventRowByTenant(ctx.env.DB, parseInt(id, 10), tenant.slug);
      if (!ev) return null;
      const occupiedCount = await countSignupsByEvent(ctx.env.DB, ev.id);
      return new OgCarCardShell(ctx, { ...ev, occupiedCount });
    },
  },
  types: {
    OgGuildCard: {
      exists: (p: any) => p.genExists(),
      name: (p: any) => p.genName(),
      slogan: (p: any) => p.genSlogan(),
      weekActivityCount: (p: any, a: any) => p.genWeekActivityCount(a),
    },
    OgCarCard: {
      title: (p: any) => p.genTitle(),
      type: (p: any) => p.genType(),
      startsAtUtc: (p: any) => p.genStartsAtUtc(),
      startsAtText: (p: any) => p.genStartsAtText(),
      dungeonName: (p: any) => p.genDungeonName(),
      occupiedCount: (p: any) => p.genOccupiedCount(),
      maxSlots: (p: any) => p.genMaxSlots(),
      status: (p: any) => p.genStatus(),
    },
  },
};
