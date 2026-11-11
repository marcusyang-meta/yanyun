/* ===================================================
 * Agent-native MCP resource server acceptance (v1).
 * Runs the REAL mcp routes (Hono) against a REAL local D1
 * (Miniflare) bootstrapped from the migration chain, with grants
 * issued by the REAL agent-oauth data layer.
 *
 * Chain under test:
 *   401 + WWW-Authenticate without / with a bad / with a revoked
 *   token -> initialize -> tools/list scope filtering (a read
 *   grant never sees the write tools) -> read tools through the
 *   pinned documents (member gate inherited: another guild's car
 *   is invisible) -> seat output carries no uid and no Discord id
 *   -> a read grant calling a write tool is refused and writes
 *   nothing -> join lands on the caller's own stamp even when the
 *   arguments try to smuggle a proxy target -> set_ready + audit
 *   rows -> leave removes ONLY the caller's seats (a second
 *   member's seat in the same car survives) and is idempotent ->
 *   both calculators answer through the pinned mutations.
 * =================================================== */
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { describe, it, expect, afterAll } from 'vitest';
import { Hono } from 'hono';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: unknown, want: unknown) {
  check(name, JSON.stringify(got) === JSON.stringify(want),
    `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
}

const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: { DB: 'harness-agent-mcp' },
}));
const db = await mf.getD1Database('DB');

{ // Bootstrap from the migration chain, like the drift gate / verifier.
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { splitSqlStatements } = await import('../scripts/ci/schema-shape.mjs');
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    for (const stmt of splitSqlStatements(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      await db.prepare(stmt).run();
    }
  }
}

const { mcpRoutes } = await import('../src/domains/platform/mcp-routes.ts');
const svc = await import('../src/domains/identity/agent-oauth.ts');
const identity = await import('../src/domains/identity/index.ts');
const guilds = await import('../src/domains/guilds/index.ts');
const groupings = await import('../src/domains/groupings/index.ts');
const { weekWindowUtc } = await import('../src/domains/platform/blocks.ts');

const env = { DB: db, SESSION_SECRET: 'agent-mcp-test-secret' };
const app = new Hono();
app.route('/', mcpRoutes);

const DGID = '555000111222333444';
const DGID2 = '555999888777666555';
let GID = 0;
let GID2 = 0;
const NOW = Math.floor(Date.now() / 1000);
const [weekStart] = weekWindowUtc(0);
const CAR_START = weekStart + 3600;

async function makeMember(discordId: string, username: string, nick: string, serverIds: string[]) {
  const userId = await identity.upsertUserOnLogin(db, {
    discordId, username, avatar: '',
    guildsJson: JSON.stringify(serverIds.map((id) => ({ id, name: 'Server', icon: '', owner: false }))),
    checkedAtSec: NOW,
  });
  await identity.upsertOAuthOnLogin(db, {
    userId, refreshToken: 'rt-' + discordId, scope: 'identify guilds guilds.members.read', nowSec: NOW,
  });
  return userId;
}

GID = await guilds.insertTenant(db, { slug: 'mcpguild', guildName: 'MCP测试百业', passwordHash: 'x', announcement: '' });
await guilds.setSettingValue(db, GID, 'discord_guild_id', DGID);
GID2 = await guilds.insertTenant(db, { slug: 'otherguild', guildName: '别人百业', passwordHash: 'x', announcement: '' });
await guilds.setSettingValue(db, GID2, 'discord_guild_id', DGID2);

const DISCORD_A = '700000000000000001';
const DISCORD_B = '700000000000000002';
const DISCORD_C = '700000000000000003';
const userA = await makeMember(DISCORD_A, 'AUser', '甲队员', [DGID]);
const userB = await makeMember(DISCORD_B, 'BUser', '乙队员', [DGID]);
const userC = await makeMember(DISCORD_C, 'CUser', '外人', [DGID2]);
await groupings.upsertGuildMember(db, GID, DISCORD_A, '甲队员', 'AUser');
await groupings.upsertGuildMember(db, GID, DISCORD_B, '乙队员', 'BUser');
// Server-nick snapshots: the head of the identity chain that
// decides a self-signup's seat name.
await identity.upsertNick(db, DISCORD_A, DGID, '甲队员', NOW);
await identity.upsertNick(db, DISCORD_B, DGID, '乙队员', NOW);

const EV1 = 10030100001; // join target: B seated, A joins via MCP
const EV3 = 10030100003; // leave isolation: A and B both seated
const EV_OTHER = 10030100009; // a car in the other guild
await db.batch([
  db.prepare(`INSERT INTO events (id, tenant, title, type, status, created_by, starts_at_utc, max_slots) VALUES
    (${EV1}, ${GID}, 'MCP报名车', 'activity', 'open', '${DISCORD_B}', ${CAR_START}, 10),
    (${EV3}, ${GID}, 'MCP退报车', 'activity', 'open', '${DISCORD_B}', ${CAR_START}, 10),
    (${EV_OTHER}, ${GID2}, '别人家的车', 'activity', 'open', '${DISCORD_C}', ${CAR_START}, 10)`),
  db.prepare(`INSERT INTO signups (event_id, nickname, uid, discord_id, weapon) VALUES
    (${EV1}, '乙队员', 'uid-b-1', '${DISCORD_B}', '破竹·樽'),
    (${EV3}, '甲队员', 'uid-a-3', '${DISCORD_A}', '破竹·樽'),
    (${EV3}, '乙队员', 'uid-b-3', '${DISCORD_B}', '裂石·威'),
    (${EV_OTHER}, '外人', 'uid-c-9', '${DISCORD_C}', '破竹·樽')`),
  db.prepare(`INSERT INTO dungeons (name, size, version) VALUES ('测试副本', 10, 'intl-v0.0')`),
  db.prepare(`INSERT INTO bosses (name, dungeon, mechanics_json, talents_json, shouts_json) VALUES
    ('测试首领', '测试副本',
     '[{"phase":"P1","title":"测试机制","description":"机制说明文本"}]',
     '[{"code":"1-1","description":"天赋说明","verified":true}]',
     '[{"text":"开打！","copyable":true}]')`),
]);
const bossRow = await db.prepare(`SELECT id FROM bosses WHERE name = '测试首领'`).first<{ id: number }>();
const BOSS_ID = bossRow!.id;

const grantA = await svc.issueAgentTokens(db, { userId: userA, clientId: 'yyc_test', clientName: 'Muse', scopes: 'read signup' });
const grantB = await svc.issueAgentTokens(db, { userId: userB, clientId: 'yyc_test', clientName: 'Muse', scopes: 'read' });
const grantC = await svc.issueAgentTokens(db, { userId: userC, clientId: 'yyc_test', clientName: 'Muse', scopes: 'read signup' });

let rpcSeq = 0;
async function rpc(token: string | null, method: string, params?: any) {
  const res = await app.request('/mcp', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcSeq, method, params }),
  }, env);
  return res;
}
async function callTool(token: string, name: string, args: any = {}) {
  const res = await rpc(token, 'tools/call', { name, arguments: args });
  const body = await res.json() as any;
  return body?.result;
}
function toolJson(result: any): any {
  return result?.structuredContent;
}
async function auditActions(action: string): Promise<number> {
  const row = await db.prepare(
    `SELECT COUNT(*) AS n FROM guild_audit_events WHERE action = ? AND tenant = ?`,
  ).bind(action, GID).first<{ n: number }>();
  return row?.n || 0;
}

describe('agent MCP resource server', () => {
  it('refuses unauthenticated calls with 401 + WWW-Authenticate', async () => {
    const noToken = await rpc(null, 'tools/list');
    eq('no token is 401', noToken.status, 401);
    const wa = noToken.headers.get('www-authenticate') || '';
    check('WWW-Authenticate points at the resource metadata',
      wa.includes('resource_metadata=') && wa.includes('/.well-known/oauth-protected-resource'), wa);
    const bad = await rpc('yyag_garbage', 'tools/list');
    eq('bad token is 401', bad.status, 401);
    const grantDead = await svc.issueAgentTokens(db, { userId: userA, clientId: 'yyc_test', clientName: 'Muse', scopes: 'read' });
    await svc.revokeAgentToken(db, userA, grantDead.grant.id);
    const revoked = await rpc(grantDead.accessToken, 'tools/list');
    eq('revoked token is 401', revoked.status, 401);
  });

  it('initializes and filters tools/list by grant scope', async () => {
    const init = await (await rpc(grantA.accessToken, 'initialize', {
      protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' },
    })).json() as any;
    eq('server name', init.result.serverInfo.name, 'yanyun-mcp');
    check('protocol version answered', !!init.result.protocolVersion);

    const listA = await (await rpc(grantA.accessToken, 'tools/list')).json() as any;
    const namesA = listA.result.tools.map((t: any) => t.name).sort();
    eq('signup grant sees all tools', namesA, [
      'calc_graduation', 'calc_tiaolv', 'get_boss', 'get_grouping', 'join_grouping',
      'leave_grouping', 'list_dex', 'list_groupings', 'list_my_guilds', 'my_signups', 'set_ready',
    ]);
    const listB = await (await rpc(grantB.accessToken, 'tools/list')).json() as any;
    const namesB = listB.result.tools.map((t: any) => t.name).sort();
    eq('read grant sees only read tools', namesB, [
      'calc_graduation', 'calc_tiaolv', 'get_boss', 'get_grouping',
      'list_dex', 'list_groupings', 'list_my_guilds', 'my_signups',
    ]);
  });

  it('reads through the member gate; seat output carries no ids', async () => {
    const mine = toolJson(await callTool(grantA.accessToken, 'list_my_guilds'));
    eq('A sees exactly the fixture guild', mine.guilds.map((g: any) => g.slug), ['mcpguild']);

    const listed = await callTool(grantA.accessToken, 'list_groupings', { slug: 'mcpguild' });
    const listedJson = toolJson(listed);
    eq('both cars listed for the current week', listedJson.groupings.map((g: any) => String(g.id)).sort(),
      [String(EV1), String(EV3)].sort());
    const raw = JSON.stringify(listedJson);
    check('no seat uid in output', !raw.includes('uid-b-1') && !raw.includes('uid-a-3'));
    check('no Discord id in output', !raw.includes(DISCORD_A) && !raw.includes(DISCORD_B));
    check('no paid surface in output', !raw.includes('schedulingAdvice') && !raw.includes('crossCarAdvice'));

    const foreign = await callTool(grantA.accessToken, 'list_groupings', { slug: 'otherguild' });
    eq('non-member guild listing refused', foreign.isError, true);
    const foreignCar = await callTool(grantA.accessToken, 'get_grouping', { groupingId: String(EV_OTHER) });
    eq('non-member guild car refused', foreignCar.isError, true);
    const ownGuildsC = toolJson(await callTool(grantC.accessToken, 'list_my_guilds'));
    eq('C sees only the other guild', ownGuildsC.guilds.map((g: any) => g.slug), ['otherguild']);
  });

  it('reads the dex and runs both calculators', async () => {
    const dex = toolJson(await callTool(grantA.accessToken, 'list_dex'));
    const dexRaw = JSON.stringify(dex);
    check('fixture dungeon listed', dexRaw.includes('测试副本'));
    const boss = toolJson(await callTool(grantA.accessToken, 'get_boss', { bossId: String(BOSS_ID) }));
    eq('boss name', boss.boss.name, '测试首领');
    eq('boss mechanic carried', boss.boss.mechanics[0].title, '测试机制');

    const tiaolv = await callTool(grantA.accessToken, 'calc_tiaolv', {
      input: { innerSkills: ['N/A', 'N/A', 'N/A', 'N/A'], suit: '撼天' },
    });
    check('tiaolv not an error', tiaolv.isError !== true, JSON.stringify(tiaolv).slice(0, 200));
    check('tiaolv rows returned', Array.isArray(toolJson(tiaolv).result.rows));

    const grad = await callTool(grantA.accessToken, 'calc_graduation', {
      input: {
        sectSlug: 'lieshi-wei',
        items: [{ slot: 'mainWeapon', affixes: [{ key: 'max_atk', value: 100, resonance: false }] }],
      },
    });
    check('graduation not an error', grad.isError !== true, JSON.stringify(grad).slice(0, 200));
    check('graduation total is a number', typeof toolJson(grad).result.total === 'number');
  });

  it('refuses write tools for a read-only grant and writes nothing', async () => {
    const before = await db.prepare(`SELECT COUNT(*) AS n FROM signups WHERE event_id = ?`).bind(EV1).first<{ n: number }>();
    const res = await callTool(grantB.accessToken, 'join_grouping', { groupingId: String(EV1), weapon: '破竹·樽' });
    eq('read grant join refused', res.isError, true);
    const after = await db.prepare(`SELECT COUNT(*) AS n FROM signups WHERE event_id = ?`).bind(EV1).first<{ n: number }>();
    eq('no seat written', after?.n, before?.n);
  });

  it('joins on the caller stamp (proxy arguments are inert), readies, and audits', async () => {
    // The arguments try to smuggle a proxy target; the pinned
    // document has no such variable, so the seat must land on A.
    const joined = await callTool(grantA.accessToken, 'join_grouping', {
      groupingId: String(EV1), weapon: '裂石·威', forDiscordId: DISCORD_B, uid: 'uid-b-1',
    });
    check('join not an error', joined.isError !== true, JSON.stringify(joined).slice(0, 300));
    const joinedJson = toolJson(joined);
    eq('join ok', joinedJson.ok, true);
    eq('A holds exactly one seat', joinedJson.mySeatIndexes.length, 1);
    const seats = await db.prepare(`SELECT discord_id, nickname FROM signups WHERE event_id = ? ORDER BY id`).bind(EV1).all<any>();
    const stamps = (seats.results || []).map((r: any) => r.discord_id).sort();
    eq('seats are B (fixture) + A (agent join)', stamps, [DISCORD_A, DISCORD_B].sort());
    const aSeat = (seats.results || []).find((r: any) => r.discord_id === DISCORD_A);
    eq('seat name is the server-set guild nick', aSeat?.nickname, '甲队员');
    eq('agent.join audited', await auditActions('agent.join'), 1);

    const ready = await callTool(grantA.accessToken, 'set_ready', { groupingId: String(EV1), ready: true });
    check('set_ready not an error', ready.isError !== true, JSON.stringify(ready).slice(0, 300));
    const detail = toolJson(await callTool(grantA.accessToken, 'get_grouping', { groupingId: String(EV1) }));
    const mySeat = detail.grouping.seats.find((st: any) => st.mine);
    eq('my seat is ready', mySeat?.ready, true);
    eq('agent.ready audited', await auditActions('agent.ready'), 1);

    const mine = toolJson(await callTool(grantA.accessToken, 'my_signups'));
    check('my_signups includes both of A\'s cars',
      mine.signups.map((s: any) => String(s.grouping.id)).sort().join(',') === [String(EV1), String(EV3)].sort().join(','),
      JSON.stringify(mine).slice(0, 300));
  });

  it('leaves only the caller\'s seats and is idempotent', async () => {
    const left = await callTool(grantA.accessToken, 'leave_grouping', { groupingId: String(EV3) });
    check('leave not an error', left.isError !== true, JSON.stringify(left).slice(0, 300));
    eq('one seat left', toolJson(left).left, 1);
    const seats = await db.prepare(`SELECT discord_id FROM signups WHERE event_id = ?`).bind(EV3).all<any>();
    eq('only B\'s seat survives', (seats.results || []).map((r: any) => r.discord_id), [DISCORD_B]);
    eq('agent.leave audited', await auditActions('agent.leave'), 1);

    const again = await callTool(grantA.accessToken, 'leave_grouping', { groupingId: String(EV3) });
    check('second leave not an error', again.isError !== true);
    eq('second leave is a no-op', toolJson(again).left, 0);
    eq('no duplicate audit row', await auditActions('agent.leave'), 1);
  });
});

afterAll(async () => { await mf.dispose(); });
