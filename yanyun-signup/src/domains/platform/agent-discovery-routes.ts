/* Agent discovery signposts: GET /llms.txt and GET /.well-known/mcp.
 *
 * The agent-native surface (identity/oauth-server-routes.ts +
 * platform/mcp-routes.ts) is fully self-describing once a client
 * reaches the MCP endpoint — the 401 discovery chain, the metadata
 * documents and dynamic registration need no outside knowledge.
 * What was missing is the step before that: an agent that knows
 * only the domain yanyun.app had no way to learn the MCP endpoint
 * exists. These two static documents are that signpost.
 *
 * Both render from the single agentDiscovery() shape below, and
 * the tool section renders from MCP_TOOL_CATALOG — the same list
 * the MCP server serves — so the signposts cannot drift from the
 * integration contract they describe. The copy is machine-facing
 * protocol documentation, served as static text; it deliberately
 * lives outside the fbt pipeline, which carries human UI copy.
 */
import { Hono } from 'hono';
import { MCP_TOOL_CATALOG } from './mcp-routes.ts';

export interface AgentDiscoveryInfo {
  name: string;
  version: string;
  endpoint: string;
  transport: string;
  protocolVersion: string;
  documentation: string;
  auth: {
    type: string;
    flow: string;
    protectedResourceMetadata: string;
    authorizationServerMetadata: string;
    authorizationEndpoint: string;
    tokenEndpoint: string;
    registrationEndpoint: string;
    codeChallengeMethods: string[];
  };
  scopes: string[];
  tools: ReadonlyArray<{ name: string; write: boolean; description: string }>;
}

export function agentDiscovery(origin: string): AgentDiscoveryInfo {
  return {
    name: 'yanyun-mcp',
    version: '1.0.0',
    endpoint: `${origin}/mcp`,
    transport: 'streamable-http',
    protocolVersion: '2025-06-18',
    documentation: `${origin}/llms.txt`,
    auth: {
      type: 'oauth2',
      flow: 'authorization_code',
      protectedResourceMetadata: `${origin}/.well-known/oauth-protected-resource`,
      authorizationServerMetadata: `${origin}/.well-known/oauth-authorization-server`,
      authorizationEndpoint: `${origin}/oauth/authorize`,
      tokenEndpoint: `${origin}/oauth/token`,
      registrationEndpoint: `${origin}/oauth/register`,
      codeChallengeMethods: ['S256'],
    },
    scopes: ['read', 'signup', 'create'],
    tools: MCP_TOOL_CATALOG,
  };
}

/* The /.well-known/mcp pointer: the minimal JSON projection of
 * agentDiscovery() — name, endpoint, auth type with the two
 * metadata documents, scopes. */
export function mcpWellKnownPointer(origin: string) {
  const d = agentDiscovery(origin);
  return {
    name: d.name,
    endpoint: d.endpoint,
    transport: d.transport,
    protocolVersion: d.protocolVersion,
    auth: {
      type: d.auth.type,
      protected_resource_metadata: d.auth.protectedResourceMetadata,
      authorization_server_metadata: d.auth.authorizationServerMetadata,
      registration_endpoint: d.auth.registrationEndpoint,
      code_challenge_methods_supported: d.auth.codeChallengeMethods,
    },
    scopes: d.scopes,
    documentation: d.documentation,
  };
}

/* The /llms.txt document (llmstxt.org shape: H1, summary
 * blockquote, then sections). Written so an agent holding nothing
 * but this text can register, authorize, take a token and call
 * tools: every step of that chain is spelled out, with endpoint
 * URLs and lifetimes taken from the OAuth/MCP implementations. */
export function renderLlmsTxt(origin: string): string {
  const d = agentDiscovery(origin);
  const toolLines = d.tools
    .map((t) => `- \`${t.name}\` (${t.write ? 'write' : 'read'}) — ${t.description}`)
    .join('\n');
  return `# Yanyun — 燕云百业 Guild Companion

> Yanyun (燕云百业, ${origin}) is the guild companion platform for the game Where Winds Meet (燕云十六声, international server): squad signups ("groupings", 车队), a dungeon and boss compendium (图鉴), and tuning (调律) / graduation-rate (毕业率) calculators. This file is the integration contract for AI agents: how to reach the platform's MCP server, authorize against it, and act for a member. An agent that knows only the domain can complete onboarding from this file alone.

## MCP endpoint

- Endpoint: \`POST ${d.endpoint}\`
- Transport: MCP Streamable HTTP, stateless. Send one JSON-RPC 2.0 message per POST; responses are plain JSON — the server opens no SSE stream and holds no session. JSON-RPC notifications are answered with HTTP 202 and no body.
- Methods: \`initialize\`, \`ping\`, \`tools/list\`, \`tools/call\`. \`initialize\` answers \`protocolVersion\` \`${d.protocolVersion}\` and \`serverInfo\` \`{ "name": "${d.name}", "version": "${d.version}" }\`.
- Every request, \`initialize\` included, requires a Bearer access token (\`Authorization: Bearer <token>\`). There is no anonymous mode: a tokenless request gets HTTP 401, and the response header starts the OAuth discovery chain described next.

## Authentication — OAuth 2.1, authorization code + PKCE

The platform runs its own OAuth 2.1 authorization server. Clients are public (no client secret exists or is needed); the authorization-code flow with a PKCE S256 challenge is the sole authorization grant.

Discovery chain (each step is the standard mechanism):

1. \`POST ${d.endpoint}\` without a token → HTTP 401 with header \`WWW-Authenticate: Bearer resource_metadata="${d.auth.protectedResourceMetadata}", scope="read signup"\`.
2. \`GET ${d.auth.protectedResourceMetadata}\` → protected-resource metadata: \`resource\` is \`${d.endpoint}\`, \`authorization_servers\` lists \`${origin}\`, and the bearer method is the Authorization header.
3. \`GET ${d.auth.authorizationServerMetadata}\` → authorization-server metadata (issuer, the endpoints below, \`code_challenge_methods_supported: ["S256"]\`). The same document is served at \`/.well-known/openid-configuration\`.

Registration (RFC 7591 dynamic client registration):

- \`POST ${d.auth.registrationEndpoint}\` with a JSON body: \`{ "client_name": "<client name>", "redirect_uris": ["<uri>", ...], "scope": "read signup" }\`. The scope may name a canonical combination of the atoms below (e.g. \`"read create"\`, \`"read signup create"\`); the registered set caps what an authorization may ask for.
- \`redirect_uris\` takes 1–10 absolute URIs: \`https\` only, except \`http\` on loopback hosts (\`127.0.0.1\`, \`localhost\`, \`[::1]\`).
- The 201 response carries \`client_id\`. Register once per client and reuse the \`client_id\`; registration is rate-limited (20 per hour per IP).

Authorization:

- Open in the member's browser: \`GET ${d.auth.authorizationEndpoint}?response_type=code&client_id=<client_id>&redirect_uri=<one registered URI>&scope=read+signup&state=<opaque>&code_challenge=<S256 challenge>&code_challenge_method=S256\`. The PKCE method must be \`S256\`; \`plain\` is refused.
- The endpoint sits behind the platform's Discord login: a signed-out member is sent through Discord sign-in first and lands back on the consent page. The platform consent page names the client and the requested scope tier; only an explicit approval continues.
- Approval redirects to \`redirect_uri\` with \`?code=<authorization code>&state=<state>\`. Codes live 10 minutes and are single-use: an exchange attempt consumes the code even when a later check fails.

Token exchange and refresh (\`POST ${d.auth.tokenEndpoint}\`, form-encoded, \`token_endpoint_auth_method: none\`):

- \`grant_type=authorization_code\` with \`code\`, \`client_id\`, \`redirect_uri\`, \`code_verifier\` → \`{ access_token, token_type: "Bearer", expires_in: 3600, refresh_token, scope }\`.
- Access tokens live 1 hour. \`grant_type=refresh_token\` with \`refresh_token\` and \`client_id\` rotates the pair: the presented refresh token dies and a fresh pair comes back. A \`scope\` parameter on refresh may only narrow the grant, never widen it.

## Scopes

Scopes are composable atoms on a \`read\` base; a grant holds one canonical string (atoms in read / signup / create order):

- \`read\` — the read tools below. \`tools/list\` under this grant lists read tools only, and calling a signup write tool returns the tool error "This grant is read-only; the signup scope was not authorized."
- \`read signup\` — read plus the own-seat write tools (\`join_grouping\`, \`leave_grouping\`, \`set_ready\`), which then also appear in \`tools/list\`.
- \`read create\` — read plus \`create_grouping\`.
- \`read signup create\` — every tool.

Ask for the atoms the member wants at registration and authorization time: \`signup\` lets the agent sign the member up to existing groupings and manage their own seats; \`create\` lets it create NEW groupings led by the member. Asking for either implies \`read\`. Grants minted before the \`create\` atom existed do not gain it — the member must authorize again to add it.

## Identity and membership

- The grant belongs to whichever Discord account completes the authorization — the identity is fixed at consent time, and the tokens act as that platform member.
- On each call the server resolves the member from the token and re-checks that the member's Discord authorization on the platform is complete. If it lapses, calls answer 401 until the member signs in at ${origin} again.
- Guild data is member-gated end to end: tools compose exactly the surfaces the authorizing member could open in the app, starting from \`list_my_guilds\`. Guilds the member does not belong to are invisible, and their groupings read as not found. Extra verdicts a guild binds (for example a Discord server membership check) apply to agent calls unchanged.
- Tool results never include member identifiers: no platform user ids and no Discord ids appear in seat or roster output.

## Tools

${toolLines}

Write-tool constraints:

- The own-seat write tools act on the authorizing member's own seats only. \`join_grouping\` cannot name a different member — proxy signup is impossible on this surface — and \`leave_grouping\` / \`set_ready\` only ever touch seat rows the server resolved from the member's own identity.
- There is no management tool for EXISTING groupings: agents cannot edit, merge, disband or complete a grouping, and cannot manage guilds. The one creation exception is \`create_grouping\`, which creates a NEW grouping whose creator/leader is the authorizing member — it cannot touch an existing one, and its input carries no creator or identity field to steer.
- Agent writes are recorded in the guild's audit log (\`agent.join\`, \`agent.leave\`, \`agent.ready\`, \`agent.create\`), visible to guild administrators.

## Rate limits

Per grant: read calls (\`initialize\`, \`tools/list\`, read tools) 120 per minute; write tool calls 30 per minute. Exceeding a bucket returns JSON-RPC error \`-32000\` ("Rate limit exceeded").

## Revocation

Only the member can revoke a grant: sign in at ${origin}, open profile settings → 我的 Agent 授权 (My Agent Authorizations), and revoke the client there. Revocation takes effect immediately and kills the access token and the refresh token together. Agents hold no revocation endpoint; when access ends, ask the member to revoke.

## Quickstart — cold start to first tool call

1. Register the client once (\`POST ${d.auth.registrationEndpoint}\`) and keep the \`client_id\`.
2. Generate a PKCE verifier and S256 challenge, then open the authorize URL in the member's browser.
3. The member signs in with Discord if asked and approves the consent page; capture \`code\` on the redirect URI.
4. Exchange the code at \`${d.auth.tokenEndpoint}\` within 10 minutes; store the refresh token.
5. \`POST ${d.endpoint}\` with the access token: \`initialize\`, then \`tools/list\`, then \`tools/call\` (start with \`list_my_guilds\`).
6. Refresh through \`${d.auth.tokenEndpoint}\` before the access token reaches its 1-hour expiry. On a 401 \`invalid_token\`, refresh once; if the refresh token is refused too, run the authorization flow again.

## Machine-readable pointers

- [MCP pointer (JSON)](${origin}/.well-known/mcp): name, endpoint, auth and scopes for this server, generated from the same source as this file.
- [Protected resource metadata](${d.auth.protectedResourceMetadata})
- [Authorization server metadata](${d.auth.authorizationServerMetadata})
`;
}

const agentDiscoveryRoutes = new Hono();

agentDiscoveryRoutes.get('/llms.txt', (c) => {
  return new Response(renderLlmsTxt(new URL(c.req.url).origin), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
});
agentDiscoveryRoutes.get('/.well-known/mcp', (c) => {
  return c.json(mcpWellKnownPointer(new URL(c.req.url).origin));
});

export { agentDiscoveryRoutes };
