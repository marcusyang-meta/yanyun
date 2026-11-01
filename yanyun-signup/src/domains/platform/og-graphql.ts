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
  listEventsWeekView, getEventRowByTenant, countSignupsByEvent, getShortLinkByTarget,
  resolveCarHomeTz, fmtCarTimeZoned, CAR_HOME_TZ_FALLBACK,
} from '../groupings/index.ts';
import { startsAtEpoch } from './blocks.ts';
import { resolveSharedBuild } from '../gear/index.ts';

async function ogTenant(ctx: Context, slug: string) {
  const t = await getTenantRow(ctx.env.DB, s(slug, 40));
  if (!t) return null;
  const devOnly = (await getTenantSetting(ctx.env.DB, t.id, 'dev_only')) === '1';
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
    /* Transitional guard: on a pre-0036 schema the tenant row carries
     * no typed id yet, so there is no typed key to count activity
     * under — the count is definitionally zero. This branch is only
     * reachable inside the unmigrated-schema window: the PR preview
     * shares the production D1 and never applies migrations, while
     * promote applies migrations before deploying the new code, so
     * production never reaches it. Once migration 0036 has landed
     * everywhere this is a dead branch and can be removed. */
    if (!this.data.tenant.id) return 0;
    const rows = await listEventsWeekView(this.db, {
      tenant: this.data.tenant.id, type: 'activity', from: fromUtc, to: toUtc,
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
  /* The card's time line, fully rendered by the backend in the car's
   * home timezone with its Chinese label (car-tz.ts owns the chain
   * and the labels): the OG worker prints this verbatim, so the card
   * image and the og:description always agree and the label table
   * exists exactly once. '' when the car has no start time. */
  async genCardTimeText(){
    const epoch = startsAtEpoch(this.data);
    if (!epoch) return '';
    const tz = await resolveCarHomeTz(this.db, this.data).catch(() => CAR_HOME_TZ_FALLBACK);
    return fmtCarTimeZoned(epoch, tz);
  }
  genDungeonName(){ return this.data.dungeon || ''; }
  genOccupiedCount(){ return this.data.occupiedCount || 0; }
  genMaxSlots(){ return this.data.max_slots || 0; }
  genStatus(){ return this.data.status || ''; }
  /* The car's existing short-link code, resolved read-only: the OG
   * worker prints it on the card as a QR code. A car nobody has
   * shared yet has no code and its card renders without one —
   * minting belongs to the share surfaces (the detail page's
   * shareUrl), never to this data channel or an image GET. */
  async genShareCode(){
    const tenantId = this.data.tenantId;
    if (!tenantId) return null;
    const link = await getShortLinkByTarget(this.db, tenantId, this.data.id).catch(() => null);
    return link ? link.code : null;
  }
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
      const ev = await getEventRowByTenant(ctx.env.DB, parseInt(id, 10), tenant.id);
      if (!ev) return null;
      const occupiedCount = await countSignupsByEvent(ctx.env.DB, ev.id);
      return new OgCarCardShell(ctx, { ...ev, occupiedCount, tenantId: tenant.id });
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
      shareCode: (p: OgCarCardShell) => p.genShareCode(),
      cardTimeText: (p: OgCarCardShell) => p.genCardTimeText(),
    },
  },
};
