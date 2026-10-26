/* guilds domain public read routes: the guild navigation list. */
import { Hono } from 'hono';
import { json, isDevRequestC, getDevOnlySlugs } from '../platform/http.ts';
import { listTenantsDirectory } from './index.ts';

export const guildPublicRoutes = new Hono();

guildPublicRoutes.get('/tenants', async (c: any) => {
  const results = await listTenantsDirectory(c.env.DB);
  // dev_only guilds (e.g. demo): never listed from non-dev surfaces (the OG worker also uses this list to judge existence).
  if (!isDevRequestC(c)) {
    const devSet = await getDevOnlySlugs(c.env.DB);
    if (devSet.size) return json({ ok: true, tenants: results.filter((t) => !devSet.has(t.slug)) });
  }
  return json({ ok: true, tenants: results });
});

// POST /api/onboard anonymous self-service onboarding — REMOVED
// (2026-10-25, audit A4): the endpoint let anyone create a tenant
// anonymously, contradicting GraphQL createGuild's "must be an
// admin of the target Discord server" check, and allowed slug
// squatting / impersonation. No live caller exists anywhere (the
// only reference is in the undeployed
// public-legacy-backup/hub.js), so the whole route is offline;
// the only creation path is GraphQL createGuild (login + server
// admin check). The slug 'onboard' stays in the RESERVED word
// list so it cannot be registered as a guild address.

