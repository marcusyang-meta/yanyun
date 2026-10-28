# Platform admin (super-admin) surface

The operator surface that used to be the standalone hub portal
(`/api/hub/*` + `ADMIN_PASSWORD`) now lives in the main site:

- **Surface**: GraphQL `viewer.platformAdmin` (union
  `PlatformAdminResult = PlatformAdmin | PlatformAdminLocked`) plus
  the `/platform-admin` route in yanyun-web — same origin, same
  session, same build as the rest of the site. Backup file downloads
  are the one exception: they stay plain HTTP
  (`/api/platform-admin/backup/export|download`) because they stream
  files, but authenticate with the normal session + the same gate.
- **Verdict**: evaluated in the gating layer by
  `src/domains/platform/admin-gate.ts` (`isPlatformAdmin(env,
  viewerId)`), with the viewer's identity as subject. The VC and the
  session carry identity only — no admin flag is ever stamped into
  them. Non-admins (including signed-out visitors) compose the
  Locked type and receive zero admin data; every admin mutation
  re-evaluates the gate server-side.

## The roster: who is a platform admin

Two unioned sources (either one grants); evaluation fails closed
when neither matches, when the roster is unreadable, or when it is
malformed.

1. **Bootstrap floor — `PLATFORM_ADMIN_DISCORD_IDS`** (Worker env
   var, comma/whitespace separated Discord user IDs). Set once
   through the secure ops channel. This is how the first admin is
   named, and it is the break-glass floor: an env-listed admin can
   always get in and repair the living roster. Code never writes it.
2. **Living roster — global settings key
   `platform_admin_discord_ids`** (JSON array of Discord user IDs),
   read/written through the data layer. Day-to-day changes happen on
   the admin surface itself ("平台超管名单" section, roster
   mutation); every write is audited in `hub_audit_log` with the
   acting admin's real Discord user ID as the actor.

## Bootstrap checklist (one time)

1. Set `PLATFORM_ADMIN_DISCORD_IDS` to the operator's Discord user
   ID on the `yanyun` Worker (secure channel; plain configuration,
   not a credential — it names an identity, the session
   authenticates it).
2. Sign in on yanyun.app with that Discord account and open
   `/platform-admin` — the full surface composes.
3. (Optional) Add further admins from the roster section; they take
   effect immediately without a redeploy.
4. Delete the retired `ADMIN_PASSWORD` secret from the Worker (the
   password login path is gone; nothing reads it anymore).

## Identity-key note (#92 reconciliation)

Roster entries and the gate subject are **Discord user IDs** — the
platform's identity key today (the session resolves users by Discord
ID; `viewerId` IS the Discord ID). When the ID reform (PR #92)
re-keys user references to typed numeric user IDs, the subjects in
both roster sources must be rewritten to the new keys in the same
change; `admin-gate.ts` carries a header note marking the spot.
