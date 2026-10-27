# Yanyun Guild Tool — Monorepo

Squad signup and guild management for *Where Winds Meet* (global server):
guilds （百业） create squads ("cars") for activities, talent runs, races and
tower climbs; members sign up, mark readiness, and get departure reminders
over Discord webhooks and mobile push.

Production: <https://yanyun.app> · OG images: <https://og.yanyun.app>

This repository is a single pnpm-workspaces monorepo (one lockfile) holding
four deployables and three shared packages. It was assembled on 2026-10-25
from five previously separate trees.

```
yanyun/
├─ yanyun-signup/     Backend: Hono + GraphQL Yoga on Cloudflare Workers,
│                     D1 via a Drizzle data layer, a GuildHub Durable
│                     Object (Hibernation WebSockets) for realtime updates
│                     and departure reminders, plus the hub admin pages.
├─ yanyun-web/        Web: Vite + React + Relay. Build output is synced
│                     into yanyun-signup/public and served by the backend.
├─ yanyun-mobile/     Mobile: Expo SDK 58 + React Native + Relay,
│                     distributed with EAS Update (preview channel).
├─ yanyun-og/         OG share-image Worker (satori/resvg rendering).
└─ packages/
   ├─ blocks-core/    @yanyun/blocks-core — platform-neutral core of the
   │                  server-driven block UI (Block/Action types, tree
   │                  walker, action dispatch). No React Native / DOM
   │                  imports; hosts inject platform leaves.
   ├─ theme/          @yanyun/theme — design tokens, single source
   │                  (src/tokens.json). Consumed by mobile; web does not
   │                  consume the package yet.
   └─ schema/         @yanyun/schema — canonical GraphQL SDL. All copies
                      in the apps are generated from this package, never
                      edited as the source.
```

## Getting started

Node 24 (see `.nvmrc`). The package manager is pnpm, pinned with Corepack
via the `packageManager` field in the root `package.json` — run
`corepack enable pnpm` once per machine so `pnpm` resolves to the pinned
version everywhere (local shells and CI alike). Install once, at the
root only — there is a single root lockfile (`pnpm-lock.yaml`); do not
run `pnpm install` inside subprojects.

```bash
corepack enable pnpm   # once per machine; pnpm is pinned by Corepack
pnpm install           # root only
pnpm run build:web     # web build (sync-schema → relay → tsc → vite)
pnpm run sync-public   # copy the web build into yanyun-signup/public
pnpm run mobile:typecheck
pnpm run relay         # Relay multi-project codegen — root only, see below
```

The root `.npmrc` sets `node-linker=hoisted` (an npm-style flat
`node_modules` layout — Metro/Expo cannot resolve pnpm's default
isolated layout), `link-workspace-packages=true` (the `"*"` specs on
the `@yanyun/*` packages link to the local workspace packages, as npm
workspaces did), and `auto-install-peers=false` (peer dependencies are
not auto-installed — the pnpm equivalent of the `legacy-peer-deps`
behavior the repo used under npm; peers resolve through the hoisted
layout instead).

Relay codegen is a multi-project setup in the root `relay.config.json`
(`mobile` on top of a `blocks` base). Always run it from the root
(`pnpm run relay`); the `relay` script inside subprojects only forwards
to the root config.

`yanyun-mobile/metro.config.js` follows Expo's official monorepo guide
with explicit `watchFolders` and `nodeModulesPaths`.

Shared packages hold contracts, tokens and logic only. Game data and UI
copy are served by the backend; nothing game-specific is hardcoded in a
frontend package.

## Architecture rules

These are load-bearing conventions, not style preferences:

- **Data layer only.** All persistence goes through Drizzle entities and
  repository modules. Business code never writes raw SQL and never knows
  table shapes. Schema drift is converged in code (PRAGMA-checked lazy
  DDL `ensure*` functions in the repositories); the `migrate-*.sql` files
  are bootstrap/disaster-recovery material and are not consumed by the
  production Worker.
- **GraphQL for new APIs.** The REST surface was shut down; everything
  new is GraphQL.
- **Copy comes from the backend.** All UI text is served through GraphQL
  and translated with fbtee (source strings live per domain under
  `src/domains/<domain>/i18n/`; locales: zh-CN source, zh-TW, en, es,
  fr). Frontends contain no hardcoded UI copy and no hardcoded game data.
- **Permissions are response types.** The backend never ships permission
  flags (`canManage`, `isMember`, …). What a viewer may see or do is
  expressed by which GraphQL type/fields resolve for them (for example
  `GuildAdmin` vs `GuildAdminLocked`).
- **Web structure.** Route entrypoints with preloaded Relay queries;
  component-level `network-only` fetch policies are not used.
- **Realtime** is a per-guild Durable Object (`GuildHub`): raw WebSocket
  ping + GraphQL refetch, not GraphQL subscriptions.

## Release process

All changes land through pull requests. There is no other path to
production:

1. **PR verification** (`pr-backend.yml`, `web-check.yml`, `pr-og.yml`)
   runs on the pull request: static gates (tsc, fbtee codegen check, an
   `any` budget), the full backend harness suite, real-D1 repository
   verification, a preview deploy of the exact PR tree, HTTP/GraphQL
   probes, and a real-Chromium render smoke.
2. **Merge** with rebase-merge (no squash, no direct pushes — a direct
   push to `master` triggers nothing).
3. **Auto-promote** (`backend-deploy.yml`, `og-deploy.yml`,
   `mobile-update.yml`) runs only for a merged PR: it downloads the
   artifact the PR run verified (it never rebuilds), refuses to deploy
   unless the merged tree is identical to the verified tree
   (fail-closed), deploys, runs production probes, and rolls back
   automatically if a probe fails. There is no manual promote entry
   point, including for emergencies — an urgent fix is a fast PR.

Preview facts: all PRs share one preview deployment,
<https://release-yanyun.tbdlab.workers.dev>, and `pr-backend` runs are
serialized through a concurrency group. The preview shares its D1
database with production (same `database_id`), so preview acceptance is
anonymous and read-only. The `demo` tenant is visible only from the
preview host and local development hosts.

The only production changes made outside CI are secret-class settings
(`wrangler secret`), handled manually over a secure channel. Never deploy
to production from a local machine (`wrangler deploy`, `wrangler
triggers`, `wrangler versions *`): if CI is broken, fix CI.

GitHub Secrets in use: `EXPO_TOKEN`, `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID`.

## Secrets

- Never commit: `.dev.vars*`, `credentials.json`, keystores / `*.p8` /
  `*.p12` / `*.pem`, `.eas-run/`. The root `.gitignore` covers these;
  still check `git status` before committing.
- Webhook URLs and tokens live only in server configuration (wrangler
  secrets, D1 settings), GitHub Secrets, or local shell config. Never in
  source, docs, or chat transcripts.

## Agent onboarding

How an AI agent (or a new engineer) starts working in this repo:

1. **Read first.** This README, then `AGENTS.md` in the workspace root —
   it is the operating manual (commit/PR formats, the data-layer law,
   Cloudflare notes) and it wins over assumptions.
2. **Set up.** Node 24, `corepack enable pnpm` once, then `pnpm install`
   at the repo root. The main checkout
   may be parked on a stale branch — never work in it. Create a fresh
   worktree per task off `origin/master`:

   ```bash
   git worktree add ~/workspace/<task-worktree> -b feat/<task> origin/master
   ```

3. **Work in checkpoints.** Commit and push after each layer (backend,
   web, mobile) instead of one giant commit at the end — pushed commits
   survive environment restarts; uncommitted work does not.
4. **Commits.** English only. Title: `[WWM][Area] Imperative summary`
   (Area ∈ Backend, Web, Mobile, OG, CI, Repo), target ≤ 72 chars. In a
   stacked diff each commit also carries `[x/n]` where **n is the
   literal letter n**, not the total — `[1/n]`, `[2/n]`, …, `[16/n]`; it
   is never renumbered. Body: a `Summary:` section (what and why) and a
   `Test Plan:` section (how it was verified — concrete evidence, not
   "tests pass").
5. **Verify locally, lean.** Run the affected harness suites plus
   typecheck/build for the ends you touched; the full suite runs in CI
   on the PR tree. Two rules that exist because they were learned the
   hard way:
   - Write paths must be verified against **real D1** (local
     `wrangler dev` D1 or the CI verifier). The in-memory fake DB cannot
     catch SQL dialect errors.
   - Visual/component changes must be verified by **rendering the real
     component** (a local rig plus headless Chromium), never by curl
     alone — a build can succeed while the page crashes or mislays out
     in a browser.
6. **Local acceptance rigs.** The established pattern is a fixture guild
   plus locally minted session JWTs against `wrangler dev` (backend +
   local D1), driven by HTTP probes and CDP scripts. Production sessions
   cannot be forged — the signing secret exists only in Cloudflare — so
   never attempt production acceptance with a real account; use rigs or
   the CI preview.
7. **Open the PR** with `Summary` / `Test Plan` sections (template in
   `.github/pull_request_template.md`). Expect the shared preview to
   serialize your run behind other PRs; if your run is superseded,
   rerun it. Two known preview false-reds — retry before changing
   product code for them: a cold-start blank `/demo` render, and GraphQL
   schema activation lagging several minutes behind a preview deploy
   (a new field briefly reports `Cannot query field`, then heals).
8. **Merge and prove it.** Rebase onto the latest `master` immediately
   before merging, wait for full green on that exact tree, then
   `gh pr merge --rebase`. If the post-merge deploy is fail-closed
   rejected because master moved, land a small carry PR with the same
   verified tree. After the promote, verify production yourself —
   deployment version at 100%, home page 200, the probes for your
   change. A green deploy log alone is not proof.
9. **Hard don'ts.** No direct pushes to `master`. No local deploys to
   production. No raw SQL outside the data layer. No secrets in code,
   commits, or chat. No fabricated production sessions, test messages,
   or other production writes for verification purposes.
