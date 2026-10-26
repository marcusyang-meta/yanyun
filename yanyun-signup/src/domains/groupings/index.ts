/* groupings 域对外服务面: 车队 (events)、报名座位 (signups)、竞速
 * 成绩 (results)。其他 domain 只许从这里 import。 */
export * from './events.ts';
export * from './signups.ts';
export * from './results.ts';
export * from './reminder.ts';
export { GuildHub } from './guildhub.ts';
export { SeatHub } from './seathub.ts';
export { ensureReminderColumns, ensureSignupDiscordColumn } from './reminder.ts';
export * from './rest-shared.ts';
export * from './graphql.ts';
export { ensureEventCreatorColumn } from './graphql.ts';
