// GraphQL assembly layer: typeDefs + merged per-domain resolver
// fragments + schema/yoga construction and the error-sink plugin.
// Business shells/resolvers live in src/domains/<domain>/graphql.ts;
// the framework base is platform/graphql-base.ts.
import { createSchema, createYoga } from 'graphql-yoga';
import { typeDefs } from './graphql-schema.ts';
import { logError, CATALOG } from './domains/platform/index.ts';
import { noIntrospectionPlugin } from './domains/platform/graphql-base.ts';
import { identityResolvers } from './domains/identity/graphql.ts';
import { guildsResolvers } from './domains/guilds/graphql.ts';
import { groupingsResolvers } from './domains/groupings/graphql.ts';
import { dexResolvers } from './domains/dex/graphql.ts';
import { gearResolvers } from './domains/gear/graphql.ts';
import { platformResolvers } from './domains/platform/graphql.ts';

export { getGuildAccess, negotiateLocale } from './domains/platform/graphql-base.ts';
export { parseGuideStructured, ensureBossStructuredColumns, ensureDungeonDexColumns } from './domains/dex/graphql.ts';
export { ensureEventCreatorColumn } from './domains/groupings/graphql.ts';

const FRAGMENTS = [identityResolvers, guildsResolvers, groupingsResolvers, dexResolvers, gearResolvers, platformResolvers];
const resolvers = {
  Query: Object.assign({}, ...FRAGMENTS.map((f: any) => f.Query || {})),
  Mutation: Object.assign({}, ...FRAGMENTS.map((f: any) => f.Mutation || {})),
  ...Object.assign({}, ...FRAGMENTS.map((f: any) => f.types || {})),
};

const schema = createSchema({ typeDefs, resolvers });

/* GraphQL error-sink plugin (audit A7): errors in execution results land
 * in error_log. Business failures here are expressed via payload error
 * fields or thrown catalog copy — the latter's message is always i18n
 * errors-section copy in some language (or the two legacy hardcoded
 * literals below), i.e. expected control flow, so it is not logged.
 * Everything else (TypeError, D1 errors, null derefs) is an uncaught
 * exception to sink. logError never throws; not awaited, so responses
 * are not slowed. */
const BUSINESS_ERROR_TEXTS = new Set(['百业不存在', 'Introspection 已禁用']);
for (const entry of Object.values(CATALOG.errors || {})) {
  for (const v of Object.values(entry)) BUSINESS_ERROR_TEXTS.add(v);
}
const errorLogPlugin = {
  onExecute({ args }: any){
    const ctx = args && args.contextValue;
    return {
      onExecuteDone({ result }: any){
        try {
          const errs = result && result.errors;
          if (!errs || !errs.length) return;
          const db = ctx && ctx.env && ctx.env.DB;
          if (!db) return;
          for (const e of errs) {
            const orig = e.originalError || e;
            const msg = String((orig && orig.message) || e.message || '');
            if (BUSINESS_ERROR_TEXTS.has(msg)) continue;
            void logError(db, {
              source: 'graphql',
              error: orig instanceof Error ? orig : e,
              context: { path: e.path ? e.path.join('.') : '' },
            });
          }
        } catch { /* sink failures stay silent */ }
      },
    };
  },
};

export const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  // Hide error details in production.
  maskedErrors: true,
  // Introspection disabled (do not expose the API structure).
  plugins: [noIntrospectionPlugin, errorLogPlugin],
  // GraphiQL disabled (not needed in production).
  graphiql: false,
});
