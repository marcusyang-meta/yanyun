/* dex 域公开读路由 (三期域拆分): 首领/流派/副本名单与攻略读。 */
import { Hono } from 'hono';
import { json, err } from '../platform/http.ts';
import { listBossesLight, getBossById, listSchoolsFull, listDungeonsPublic } from './index.ts';

export const dexPublicRoutes = new Hono();
dexPublicRoutes.get('/bosses', async (c: any) => {
  return json({ ok: true, bosses: await listBossesLight(c.env.DB) });
});

// GET /api/bosses/:id 单个首领攻略(含正文)
dexPublicRoutes.get('/bosses/:id', async (c: any) => {
  const id = parseInt(c.req.param('id'), 10);
  const boss = await getBossById(c.env.DB, id);
  if (!boss) return err('首领不存在', 404);
  return json({ ok: true, boss });
});

// GET /api/schools 流派列表(全站共用)
dexPublicRoutes.get('/schools', async (c: any) => {
  return json({ ok: true, schools: await listSchoolsFull(c.env.DB) });
});

// GET /api/dungeons 副本列表(全站共用, 按规模/排序)
dexPublicRoutes.get('/dungeons', async (c: any) => {
  return json({ ok: true, dungeons: await listDungeonsPublic(c.env.DB) });
});
