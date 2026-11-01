/* Combat report import route (combat reports v1, premium T2):
 * file uploads do not travel over GraphQL, so imports land on
 * this HTTP surface — the same shape as the avatar and backup
 * file routes (site session + server-side gate re-verification).
 *
 *   POST /api/groupings/:groupingId/combat-reports
 *     body: one encounter document as JSON — either a layer-1
 *     event file (formatVersion 1) or an overlay session export.
 *     -> 200 { ok: true, encounterId }
 *     -> { ok: false, errorCode } with one of:
 *        reportForbidden (no session, or the caller cannot view
 *          the grouping)
 *        groupingNotFound
 *        premiumRequired (the guild is below T2 — write verdicts
 *          refuse in every paygate state)
 *        formatUnsupported | validationFailed (whole-file
 *          rejection: nothing was imported)
 *        importDailyLimit
 *        combatProcessingFailed (a 'failed' row records it)
 * The per-guild daily metering and the aggregation pipeline live
 * in combat-report-service.ts; this file authenticates, gates,
 * and maps results. */
import { Hono } from 'hono';
import { err, json, rateLimit, restCheckedUser } from '../platform/http.ts';
import { getGuildAccess } from '../platform/graphql-base.ts';
import { tierLocked } from '../platform/index.ts';
import { getEventRow } from './events.ts';
import { getTenantRowById } from '../guilds/tenants.ts';
import { importCombatReport, EVENTS_JSON_CAP_BYTES } from './combat-report-service.ts';

export const combatReportRoutes = new Hono();

/** Hard body ceiling: the retention cap plus headroom for the
 *  envelope; a larger body is rejected before parsing. */
const BODY_CAP_BYTES = EVENTS_JSON_CAP_BYTES + 64 * 1024;

combatReportRoutes.post('/api/groupings/:groupingId/combat-reports', async (c: any) => {
  const ip = c.req.header('cf-connecting-ip') || 'local';
  if (!rateLimit(ip, 'combat-import', 30, 60_000)) {
    return err('rateLimited', 429);
  }
  const { user } = await restCheckedUser(c);
  if (!user) return json({ ok: false, errorCode: 'reportForbidden' }, 401);
  const db = c.env.DB as D1Database;
  const groupingId = parseInt(c.req.param('groupingId'), 10) || 0;
  const ev = await getEventRow(db, groupingId).catch(() => null);
  if (!ev) return json({ ok: false, errorCode: 'groupingNotFound' }, 404);
  const tenantRow = await getTenantRowById(db, ev.tenant).catch(() => null);
  const access = await getGuildAccess(db, user, tenantRow ? tenantRow.slug : '', c.req.raw);
  if (!access.canView) return json({ ok: false, errorCode: 'reportForbidden' }, 403);
  if (await tierLocked(db, ev.tenant, 2)) {
    return json({ ok: false, errorCode: 'premiumRequired' }, 403);
  }
  const rawText = await c.req.text();
  if (rawText.length > BODY_CAP_BYTES) {
    return json({ ok: false, errorCode: 'validationFailed' }, 400);
  }
  let doc: unknown;
  try {
    doc = JSON.parse(rawText);
  } catch {
    return json({ ok: false, errorCode: 'validationFailed' }, 400);
  }
  const result = await importCombatReport(db, ev, Number(user.userId), doc, rawText);
  if (!result.ok) {
    const status = result.errorCode === 'importDailyLimit' ? 429
      : result.errorCode === 'combatProcessingFailed' ? 500 : 400;
    return json({ ok: false, errorCode: result.errorCode }, status);
  }
  return json({ ok: true, encounterId: String(result.row.id) });
});
