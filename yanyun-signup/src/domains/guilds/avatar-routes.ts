/* guilds domain public avatar read route: GET
 * /guilds/:slug/avatar (standalone path, mounted at the root — it
 * is not part of the product REST surface and survives its
 * shutdown). Avatars are public brand images, readable
 * anonymously; no avatar -> 404. */
import { Hono } from 'hono';
import { getGuildAvatar } from './index.ts';

export const guildAvatarRoutes = new Hono();
guildAvatarRoutes.get('/guilds/:slug/avatar', async (c: any) => {
  const slug = c.req.param('slug');
  const row = await getGuildAvatar(c.env.DB, slug);
  if (!row) return new Response('Not found', { status: 404 });
  const etag = `"${row.hash}"`;
  if (c.req.header('if-none-match') === etag) return new Response(null, { status: 304 });
  const versioned = new URL(c.req.url).searchParams.get('v') === String(row.hash).slice(0, 8);
  return new Response(row.bytes as any, {
    headers: {
      'Content-Type': row.contentType,
      'Cache-Control': versioned ? 'public, max-age=31536000, immutable' : 'public, max-age=60',
      ETag: etag,
    },
  });
});
