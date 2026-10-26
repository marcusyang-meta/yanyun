// 燕云百业 GraphQL 装配层 (三期域拆分): typeDefs + 各域 resolver 片段
// 合并 + schema/yoga 构造与错误汇聚插件。业务 shells/resolvers 在
// src/domains/<域>/graphql.ts, 框架基座在 platform/graphql-base.ts。
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

/* GraphQL 错误汇聚插件 (商业化审计 A7): 执行结果里的错误落 error_log。
 * 本 API 的业务失败都经 payload error 字段或目录文案 throw 表达 —— 后者
 * 的消息必是 i18n errors 段某语言的文案 (或下面两个历史硬编码字面量),
 * 属预期控制流, 不记; 其余 (TypeError / D1 错误 / 空指针等) 才是要汇聚
 * 的未捕获异常。logError 永不抛错; 在此不 await, 不拖慢响应。 */
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
        } catch { /* 汇聚失败静默 */ }
      },
    };
  },
};

export const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  // 生产环境隐藏错误细节
  maskedErrors: true,
  // 禁用 introspection (防 API 结构暴露)
  // 开发时可将 graphql.js 顶部的 DISABLE_INTROSPECTION 设为 false
  plugins: [noIntrospectionPlugin, errorLogPlugin],
  // 禁用 GraphiQL (生产环境不需要)
  graphiql: false,
});
