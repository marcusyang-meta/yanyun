/* guilds 域对外服务面: 百业 (tenants)、租户与全局配置 (settings)、
 * 百业头像 (guild_avatars)。其他 domain 只许从这里 import。 */
export * from './tenants.ts';
export * from './settings.ts';
export * from './guildAvatars.ts';
