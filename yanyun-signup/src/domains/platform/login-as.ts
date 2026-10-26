/* Hub LoginAs (impersonation) tool: the hub super-admin mints a real
 * session for a registered user, to see the product through that user's
 * eyes (the omni VC is in-process only and can never sign in over HTTP).
 *
 * Ruling (2026-10-26): FULL parity with the user's own session — reads
 * and writes behave identically — with two guardrails: the session
 * lives 30 minutes, and mint + exit each leave a hub_audit_log row.
 * The JWT carries an imp mark ({ by, at }); the session snapshot exposes
 * it (ViewerRef.impersonation) so shells can banner the session and
 * writes inside the window stay attributable later.
 *
 * The mint/search handlers sit behind the hub portal's password token
 * (hub-routes middleware): a session cookie — impersonated or not —
 * never authorizes a mint. Exit is the mirror image: it needs no hub
 * token, it reads the session cookie itself, audits when the imp mark
 * is present, and clears the cookie either way. */
import { json, err, s, getBody, rateLimit } from './http.ts';
import { auditHub } from './hub-audit.ts';
import {
  getSessionUser, sessionCookieHeader, signImpersonationSession,
  IMPERSONATION_TTL_SEC,
} from '../identity/auth.ts';
import { getUserSessionRow, searchUsersDirectory } from '../identity/index.ts';
import type { Env } from './context.ts';

/* The slice of the hub Hono context these handlers use. */
export interface HubLoginAsContext {
  env: Env;
  get(key: string): string | undefined;
  req: { method: string; query(name: string): string | undefined };
}

// GET /api/hub/users?q= — registered-user search for the LoginAs picker.
export async function hubLoginAsUsers(c: HubLoginAsContext) {
  const q = s(c.req.query('q'), 60);
  if (!q) return json({ ok: true, users: [] });
  const hits = await searchUsersDirectory(c.env.DB, q, 20);
  return json({
    ok: true,
    users: hits.map((u) => ({
      discordId: String(u.discord_id),
      name: u.username || '',
      avatar: u.avatar || '',
      nick: u.nick || '',
    })),
  });
}

// POST /api/hub/login-as { discordId } — mint the impersonation session
// and set it as this browser's yy_session cookie.
export async function hubLoginAsMint(c: HubLoginAsContext) {
  const ip = c.get('ip') || '';
  if (!rateLimit(ip, 'loginas', 20, 10 * 60 * 1000)) return err('尝试太频繁', 429);
  if (!c.env.SESSION_SECRET) return err('服务端未配置会话密钥', 500);
  const body = await getBody(c);
  const discordId = s(body.discordId, 32);
  if (!discordId) return err('缺少目标用户', 400);
  const row = await getUserSessionRow(c.env.DB, discordId);
  if (!row) return err('用户不存在（从未登录过本站）', 404);
  const { jwt } = await signImpersonationSession(c.env.SESSION_SECRET, row);
  await auditHub(c.env.DB, {
    action: 'auth.login_as', tenant: '',
    summary: {
      actor: 'hub-admin',
      targetDiscordId: String(row.discord_id),
      targetName: row.username || '',
    },
    ip,
  });
  return json(
    {
      ok: true,
      user: { discordId: String(row.discord_id), name: row.username || '' },
      expiresInSec: IMPERSONATION_TTL_SEC,
    },
    200,
    { 'set-cookie': sessionCookieHeader(jwt, IMPERSONATION_TTL_SEC) },
  );
}

// POST /auth/login-as/exit — end the current session. When the session
// carries the imp mark, the exit is audited with the same target digest
// as the mint; the cookie is cleared either way (a plain session calling
// this just logs out, unaudited).
export async function handleLoginAsExit(request: Request, env: Env) {
  const user = await getSessionUser(request, env).catch(() => null);
  if (user && user.impersonation) {
    await auditHub(env.DB, {
      action: 'auth.login_as_exit', tenant: '',
      summary: {
        actor: 'hub-admin',
        targetDiscordId: user.discordId,
        targetName: user.name || '',
      },
      ip: request.headers.get('cf-connecting-ip') || '',
    });
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'set-cookie': sessionCookieHeader('', 0),
    },
  });
}
