/* Three-layer request context, Ent-canon shapes (see the viewer-context
 * research note). The layers are deliberately separate types:
 *
 * - ViewerContext: IDENTITY ONLY — a reference to the viewer entity
 *   (null when signed out) plus the viewer id. No env, no DB/DO handles,
 *   no secrets, no cache. It is the mandatory context parameter of
 *   loads/actions; privacy is evaluated inside loaders against it.
 * - Context: the per-request layer ABOVE ViewerContext — holds the VC,
 *   the request-scoped loader/cache registry (memo map) and negotiated
 *   request presentation (locale/tz). Resolvers, shells and domain
 *   services receive ViewerContext or Context, never RequestContext.
 * - RequestContext: framework layer — env bindings, the raw request,
 *   the execution context. Only assembly edges touch it (worker
 *   assembly, hub routes, DO/cron internals); it CONSTRUCTS the
 *   ViewerContext and never appears in a resolver or service signature.
 *   There is intentionally NO back-pointer from ViewerContext to
 *   RequestContext (the TS-ent viewer.context anti-pattern is a leak
 *   channel).
 *
 * System paths with no viewer (GuildHub alarm, reminder dispatch) use
 * the distinct OmniscientViewer type — never a plain ViewerContext in
 * disguise.
 */

/** Identity snapshot of the signed-in viewer (from the session JWT). */
export interface ViewerRef {
  discordId: string;
  name: string;
  avatar?: string | null;
  /** Discord server ids the viewer belongs to (session snapshot). */
  guilds: string[];
  guildsMeta?: unknown;
}

/** Identity only. Null viewer = signed out. */
export interface ViewerContext {
  viewer: ViewerRef | null;
  viewerId: string | null;
}

/** System-path viewer: explicitly omniscient, never a disguised VC. */
export interface OmniscientViewer extends ViewerContext {
  readonly omniscient: true;
  viewer: null;
  viewerId: null;
}

export const OMNISCIENT_VIEWER: OmniscientViewer = {
  omniscient: true,
  viewer: null,
  viewerId: null,
};

/** True when a VC is the system-path OmniscientViewer. */
export function isOmniscientViewer(vc: ViewerContext | null | undefined): vc is OmniscientViewer {
  return !!vc && (vc as OmniscientViewer).omniscient === true;
}

export function viewerContextOf(user: ViewerRef | null | undefined): ViewerContext {
  return { viewer: user ?? null, viewerId: user ? user.discordId : null };
}

/** Worker env bindings (framework layer only). */
export interface Env {
  DB: D1Database;
  GUILD_HUB: DurableObjectNamespace;
  SEAT_HUB?: DurableObjectNamespace;
  ASSETS: Fetcher;
  SESSION_SECRET?: string;
  DISCORD_CLIENT_ID?: string;
  DISCORD_CLIENT_SECRET?: string;
  DISCORD_API_BASE?: string;
  EXPO_PUSH_BASE?: string;
  ADMIN_PASSWORD?: string;
  BACKUPS?: R2Bucket;
}

/** Framework layer: raw infrastructure, assembly edges only. */
export interface RequestContext {
  env: Env;
  request: Request;
  executionCtx?: ExecutionContext;
}

/**
 * Per-request context handed to resolvers, shells and services. Wraps
 * the RequestContext (framework layer) and the ViewerContext (identity)
 * and owns the request-scoped memo shared by loaders. The env/user/
 * request getters are the typed surface business code uses; the raw
 * RequestContext itself is not part of any service signature.
 */
export class Context {
  vc: ViewerContext;
  req: RequestContext;
  locale: string;
  browserLocale: string;
  tz: string | null;
  /** Request-scoped loader/cache registry (shared across shells). */
  _memo: Map<string, unknown>;

  constructor(req: RequestContext, init: { user: ViewerRef | null; locale: string; browserLocale: string; tz: string | null }) {
    this.req = req;
    this.vc = viewerContextOf(init.user);
    this.locale = init.locale;
    this.browserLocale = init.browserLocale;
    this.tz = init.tz;
    this._memo = new Map();
  }

  get env(): Env { return this.req.env; }
  get request(): Request { return this.req.request; }
  get executionCtx(): ExecutionContext | undefined { return this.req.executionCtx; }
  /** The viewer identity snapshot (null when signed out) — vc.viewer. */
  get user(): ViewerRef | null { return this.vc.viewer; }
}

/** Assembly-edge constructor: worker assembly builds the Context once. */
export function buildContext(req: RequestContext, init: { user: ViewerRef | null; locale: string; browserLocale: string; tz: string | null }): Context {
  return new Context(req, init);
}

/** The VC for any Context-shaped value (class instance or plain object). */
export function vcOf(ctx: Context): ViewerContext {
  return ctx.vc ?? viewerContextOf(ctx.user);
}
