/* platform 域对外服务面: 推送 token 与错误日志仓库、i18n 基础设施
 * (文案目录/协商)、积木词汇。其他 domain 只许从这里 import。 */
export * from './pushTokens.ts';
export * from './errorLog.ts';
export * from './i18n.ts';
export * from './blocks.ts';
export * from './error-log.ts';
export * from './push.ts';
export { ensureErrorLogTable } from './error-log.ts';
export { ensurePushTokensTable } from './push.ts';
export * from './graphql.ts';
