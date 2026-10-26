/* dex 域对外服务面: 副本 (dungeons) 与首领 (bosses) 图鉴数据,
 * 流派与词条参考数据 (schools / school_bis / school_rotations /
 * slot_affix / affix_max)。其他 domain 只许从这里 import。 */
export * from './dungeons.ts';
export * from './bosses.ts';
export * from './reference.ts';
