/* guilds domain public surface: guilds (tenants), tenant and
 * global config (settings), guild avatars (guild_avatars), fixed
 * teams (fixed_teams). Other domains may only import from here. */
export * from './tenants.ts';
export * from './settings.ts';
export * from './whitelabel.ts';
export * from './guildAvatars.ts';
export * from './fixedTeams.ts';
export * from './guildavatar.ts';
export { ensureGuildAvatarsTable } from './guildavatar.ts';
export * from './graphql.ts';
export { guildAdminResult, guildAdminTypes, GuildAdminShell } from './admin-graphql.ts';
