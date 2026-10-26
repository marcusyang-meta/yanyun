/* platform 域对外服务面: 推送 token (push_tokens) 与错误日志
 * (error_log)。其他 domain 只许从这里 import。 */
export * from './pushTokens.ts';
export * from './errorLog.ts';
