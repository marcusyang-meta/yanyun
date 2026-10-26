/* guilds 域对外服务面: 百业 (tenants)、租户与全局配置 (settings)、
 * 百业头像 (guild_avatars)、固定队 (fixed_teams)。其他 domain 只许
 * 从这里 import。 */
export * from './tenants.ts';
export * from './settings.ts';
export * from './guildAvatars.ts';
export * from './fixedTeams.ts';
export * from './guildavatar.ts';
export { ensureGuildAvatarsTable } from './guildavatar.ts';
