/* Public surface of the dex domain: dungeon/boss dex data and
 * sect/affix reference data (schools / school_bis / school_rotations /
 * slot_affix / affix_max). Other domains must import only from here. */
export * from './dungeons.ts';
export * from './bosses.ts';
export * from './reference.ts';
export * from './en-names.ts';
export * from './graphql.ts';
export { ensureBossStructuredColumns, ensureDungeonDexColumns } from './graphql.ts';
