/* Platform GraphQL: the OG card data channel — the narrow public
 * read surface the OG worker uses instead of the retired REST reads
 * (/api/tenants, /api/:slug/events, /api/:slug/events/:id). Only the
 * fields the cards already print are exposed: guild name/slogan are
 * public by product ruling (2026-10-25); the car card carries no
 * signup details (never nicknames). dev_only guilds do not exist from
 * non-dev origins, exactly as everywhere else. */
import type { Context } from './context.ts';
import { ShellBase, getTenantSetting, isDevRequest, s } from './graphql-base.ts';
import { getTenantRow, getEffectiveWhiteLabelSettings, ogAccentHex } from '../guilds/index.ts';
import { listTenantsDirectory } from '../guilds/tenants.ts';
import { getDevOnlySlugs } from './http.ts';
import {
  listEventsWeekView, getEventRowByTenant, countSignupsByEvent,
} from '../groupings/index.ts';
import { resolveSharedBuild } from '../gear/index.ts';

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
  /* White-label share-card customization: the resolved accent hex
   * ('' = no customization, the OG worker renders its default
   * template) and the title suffix ('' = none). Both come from the
   * guild's white-label settings; only palette-validated values can
   * ever be stored, so the worker never sees a raw admin input. */
  async genOgAccentColor(){
    if (!this.data.tenant) return '';
    const wl = await getEffectiveWhiteLabelSettings(this.db, this.data.tenant.slug);
    return wl.ogAccent ? ogAccentHex(wl.ogAccent) : '';
  }
  async genOgTitleSuffix(){
    if (!this.data.tenant) return '';
    const wl = await getEffectiveWhiteLabelSettings(this.db, this.data.tenant.slug);
    return wl.ogTitleSuffix;
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
    /* Build share card: the share code is the capability — resolving
     * it yields only the card's printed fields (build name / target
     * label / graduation snapshot), never any owner identity. */
    ogBuildCard: async (_: any, { code }: any, ctx: Context) => {
      const shared = await resolveSharedBuild(ctx.env.DB, String(code || '')).catch(() => null);
      if (!shared) return null;
      const snap = shared.build.snapshot;
      return {
        name: shared.build.name || '',
        buildLabel: shared.build.buildLabel || '',
        snapTotal: snap ? snap.total || 0 : 0,
        snapA: snap ? snap.a || 0 : 0,
        snapB: snap ? snap.b || 0 : 0,
        snapD: snap ? snap.d || 0 : 0,
      };
    },
  },
  types: {
    OgGuildCard: {
      exists: (p: any) => p.genExists(),
      name: (p: any) => p.genName(),
      slogan: (p: any) => p.genSlogan(),
      weekActivityCount: (p: any, a: any) => p.genWeekActivityCount(a),
      ogAccentColor: (p: any) => p.genOgAccentColor(),
      ogTitleSuffix: (p: any) => p.genOgTitleSuffix(),
    },
    OgBuildCard: {
      name: (p: any) => p.name,
      buildLabel: (p: any) => p.buildLabel,
      snapTotal: (p: any) => p.snapTotal,
      snapA: (p: any) => p.snapA,
      snapB: (p: any) => p.snapB,
      snapD: (p: any) => p.snapD,
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
