/* Public read routes of the dex domain: boss/sect/dungeon lists and guide reads. */
import { Hono } from 'hono';
import { json, err } from '../platform/http.ts';
import { listBossesLight, getBossById, listSchoolsFull, listDungeonsPublic } from './index.ts';

export const dexPublicRoutes = new Hono();
dexPublicRoutes.get('/bosses', async (c: any) => {
  return json({ ok: true, bosses: await listBossesLight(c.env.DB) });
});

dexPublicRoutes.get('/bosses/:id', async (c: any) => {
  const id = parseInt(c.req.param('id'), 10);
  const boss = await getBossById(c.env.DB, id);
  if (!boss) return err('首领不存在', 404);
  return json({ ok: true, boss });
});

dexPublicRoutes.get('/schools', async (c: any) => {
  return json({ ok: true, schools: await listSchoolsFull(c.env.DB) });
});

dexPublicRoutes.get('/dungeons', async (c: any) => {
  return json({ ok: true, dungeons: await listDungeonsPublic(c.env.DB) });
});
