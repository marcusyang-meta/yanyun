-- 0042: agent-native access (MCP OAuth 2.1 authorization server).
--
-- Three new entities, all in the identity domain:
--
-- oauth_clients: dynamically registered MCP clients (RFC 7591).
-- Public clients only — authorization always runs the code flow with
-- a mandatory PKCE S256 challenge, so no client secret exists.
-- redirect_uris is a JSON array of exact-match URIs.
--
-- oauth_auth_codes: one row per issued authorization code. Only the
-- SHA-256 hash of the code is stored; a code lives 10 minutes, is
-- bound to one client + redirect URI + PKCE challenge + scope set,
-- and is consumed (used_at set) by the single successful exchange.
--
-- user_agent_tokens: one row per live agent grant (an access +
-- refresh token pair) for a member. Only SHA-256 hashes of both
-- tokens are stored; the settings surface shows prefix + metadata
-- only. `source` names the issuance path ('oauth' today; the column
-- is deliberately an open text tag so a future issuance mechanism
-- does not need a schema change). Refresh rotation rewrites both
-- hashes in place on the same row — the row IS the grant, and
-- revocation is revoked_at being set (both tokens die at once),
-- never a row delete.
--
-- Pure expand: three new tables, nothing else changes.

CREATE TABLE oauth_clients (
  id INTEGER PRIMARY KEY,
  client_id TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL DEFAULT '',
  redirect_uris TEXT NOT NULL DEFAULT '[]',
  scopes TEXT NOT NULL DEFAULT 'read',
  created_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE oauth_auth_codes (
  id INTEGER PRIMARY KEY,
  code_hash TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  scopes TEXT NOT NULL DEFAULT 'read',
  code_challenge TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  resource TEXT,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE user_agent_tokens (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  client_id TEXT,
  client_name TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'oauth',
  scopes TEXT NOT NULL DEFAULT 'read',
  access_token_hash TEXT NOT NULL UNIQUE,
  access_prefix TEXT NOT NULL DEFAULT '',
  refresh_token_hash TEXT UNIQUE,
  refresh_prefix TEXT NOT NULL DEFAULT '',
  access_expires_at INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT 0,
  last_used_at INTEGER,
  revoked_at INTEGER
);

CREATE INDEX idx_user_agent_tokens_user ON user_agent_tokens (user_id);
